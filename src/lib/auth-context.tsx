import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  role: 'AMBASSADOR' | 'ADMIN' | 'ambassador' | 'admin';
  accountStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  college?: string;
  enrollmentId?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (_data: SignupData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
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
  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await api.login(email, password, rememberMe);
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear any previous session from both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Write the token + user to the chosen storage
    storage.setItem(TOKEN_KEY, res.token);
    storage.setItem(USER_KEY, JSON.stringify(res.user));

    // Record which storage holds this session so getActiveStorage() always works
    localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');

    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (_data: SignupData) => {
    // Signup now goes to approval flow — new SignupPage handles this directly
    throw new Error('Use SignupPage directly — signup now requires admin approval.');
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
      signup,
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
