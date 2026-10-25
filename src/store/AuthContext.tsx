import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../data/types';
import {
  getCurrentUser,
  getUserByEmail,
  createUser,
  setSession,
  clearSession,
  loginWithDemo,
  initializeDemoData,
} from '../data/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  loginDemo: () => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(() => {
    const u = getCurrentUser();
    setUser(u ?? null);
  }, []);

  useEffect(() => {
    initializeDemoData();
    refresh();
  }, [refresh]);

  const login = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const found = getUserByEmail(email);
      if (!found) return { ok: false, error: 'Sai email hoặc mật khẩu.' };
      if (found.password !== password) return { ok: false, error: 'Sai email hoặc mật khẩu.' };
      setSession(found.id);
      setUser(found);
      return { ok: true };
    },
    []
  );

  const register = useCallback(
    (name: string, email: string, password: string): { ok: boolean; error?: string } => {
      if (!name.trim()) return { ok: false, error: 'Vui lòng nhập tên hiển thị.' };
      if (!email.trim()) return { ok: false, error: 'Vui lòng nhập email.' };
      if (password.length < 6) return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
      const existing = getUserByEmail(email);
      if (existing) return { ok: false, error: 'Email này đã được dùng.' };
      const newUser = createUser({ name, email, password });
      setSession(newUser.id);
      setUser(newUser);
      return { ok: true };
    },
    []
  );

  const loginDemoFn = useCallback(() => {
    const u = loginWithDemo();
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, loginDemo: loginDemoFn, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
