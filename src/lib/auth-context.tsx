import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

// A user's standing in the Ambassador Program and as an Organizer ("Partner") are
// independent privileges layered on top of one base account — never a separate
// account/login. accountStatus tracks the Ambassador application specifically
// (only meaningful when role === 'AMBASSADOR'); partnerStatus mirrors the same
// PENDING/APPROVED/REJECTED/SUSPENDED shape for the Organizer application.
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referralCode: string;
  role: 'USER' | 'AMBASSADOR' | 'ADMIN' | 'ORGANIZER' | 'ambassador' | 'admin';
  accountStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  partnerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null;
  orgName?: string | null;
  authProvider?: 'LOCAL' | 'GOOGLE';
  college?: string;
  enrollmentId?: string;
  createdAt: string;
  // Profile fields
  avatarUrl?: string;
  gender?: string;
  state?: string;
  city?: string;
  degree?: string;
  techStack?: string[];
}

// Returned by any login entry point. When otpRequired is true, no session has been
// created yet — the caller must collect a code and call completeOtpLogin.
export type LoginOutcome = { otpRequired: false } | { otpRequired: true; email: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginOutcome>;
  loginWithGoogle: (credential: string) => Promise<LoginOutcome>;
  completeOtpLogin: (email: string, code: string, rememberMe?: boolean) => Promise<void>;
  resendLoginOtp: (email: string) => Promise<void>;
  registerGeneral: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  applyAmbassador: (data: { college: string; enrollmentId: string; phone: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'ignite_token';
const USER_KEY = 'ignite_user';
/**
 * A small flag stored in localStorage (survives SPA navigation) that tells us
 * which storage holds the active session.  We use localStorage for this flag
 * even when the actual token lives in sessionStorage, because localStorage
 * persists across route changes within the same tab.
 *   'local'   → token is in localStorage   (remember-me sessions)
 *   'session' → token is in sessionStorage  (tab-lifetime sessions)
 *   absent    → no active session
 */
const STORAGE_TYPE_KEY = 'ignite_storage_type';

/** Reliably returns the storage that holds the active session token. */
function getActiveStorage(): Storage | null {
  const type = localStorage.getItem(STORAGE_TYPE_KEY);
  if (type === 'local') return localStorage;
  if (type === 'session') return sessionStorage;
  // Legacy fallback: check both storages in case the flag is missing
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  return null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session using the reliable storage resolver
    const storage = getActiveStorage();
    const savedToken = storage?.getItem(TOKEN_KEY);
    const savedUser = storage?.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        storage?.removeItem(TOKEN_KEY);
        storage?.removeItem(USER_KEY);
        localStorage.removeItem(STORAGE_TYPE_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login — rememberMe=true persists in localStorage (survives browser close),
   *          rememberMe=false uses sessionStorage (cleared on tab/window close).
   *
   * In both cases the STORAGE_TYPE_KEY flag is written to localStorage so that
   * getActiveStorage() can find the right storage reliably on every render.
   */
  const persistSession = (newToken: string, newUser: User, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear any previous session from both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Write the token + user to the chosen storage
    storage.setItem(TOKEN_KEY, newToken);
    storage.setItem(USER_KEY, JSON.stringify(newUser));

    // Record which storage holds this session so getActiveStorage() always works
    localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');

    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<LoginOutcome> => {
    const res = await api.login(email, password, rememberMe);
    if ('otpRequired' in res && res.otpRequired) return { otpRequired: true, email: res.email };
    persistSession(res.token, res.user, rememberMe);
    return { otpRequired: false };
  };

  const loginWithGoogle = async (credential: string): Promise<LoginOutcome> => {
    const res = await api.loginWithGoogle(credential);
    if ('otpRequired' in res && res.otpRequired) return { otpRequired: true, email: res.email };
    persistSession(res.token, res.user, true);
    return { otpRequired: false };
  };

  const completeOtpLogin = async (email: string, code: string, rememberMe = false) => {
    const res = await api.verifyLoginOtp(email, code, rememberMe);
    persistSession(res.token, res.user, rememberMe);
  };

  const resendLoginOtp = async (email: string) => {
    await api.resendLoginOtp(email);
  };

  const registerGeneral = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.registerGeneral(data);
    persistSession(res.token, res.user, true);
  };

  // Upgrades the current account into a pending Ambassador application — same
  // token/session, just refreshes the cached user (role/accountStatus changed).
  const applyAmbassador = async (data: { college: string; enrollmentId: string; phone: string }) => {
    const res = await api.applyAmbassador(data);
    const storage = getActiveStorage();
    storage?.setItem(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithGoogle,
      completeOtpLogin,
      resendLoginOtp,
      registerGeneral,
      applyAmbassador,
      logout,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'admin',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Where to send someone right after they log in. Ambassador and Partner (organizer)
 * status are independent privileges layered on one account, so this checks both —
 * whichever applies, highest privilege first — rather than a single exclusive role.
 */
export function redirectPathForUser(user: User): string {
  const role = user.role.toUpperCase();
  if (role === 'ADMIN') return '/ambassador/admin';
  if (role === 'AMBASSADOR' && user.accountStatus === 'APPROVED') return '/ambassador/dashboard';
  if (user.partnerStatus === 'APPROVED') return '/events/organizer';
  return '/home'; // USER, pending/rejected applications, or anything else general
}
