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
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedToken = localStorage.getItem('ignite_token');
    const savedUser = localStorage.getItem('ignite_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('ignite_token', res.token);
    localStorage.setItem('ignite_user', JSON.stringify(res.user));
  };

  const signup = async (_data: SignupData) => {
    // Signup now goes to approval flow — no token returned
    // New SignupPage handles this directly without going through auth context
    throw new Error('Use SignupPage directly — signup now requires admin approval.');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ignite_token');
    localStorage.removeItem('ignite_user');
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
