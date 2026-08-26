import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, clearToken, getToken, setToken } from '@/api/client';
import * as authApi from '@/api/auth';

const USER_KEY = 'retailflow_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): Promise<User | null> {
  return AsyncStorage.getItem(USER_KEY).then((raw) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await getToken();

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (mounted) {
          setUser(res.user);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await clearToken();
          await AsyncStorage.removeItem(USER_KEY);
        } else {
          const stored = await readStoredUser();
          if (mounted) setUser(stored);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = async (token: string, u: User) => {
    await setToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email.trim(), password);
    await persistSession(res.token, res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name.trim(), email.trim(), password);
    await persistSession(res.token, res.user);
    return res.user;
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await authApi.adminLogin(email.trim(), password);
    await persistSession(res.token, res.user);
    return res.user;
  };

  const logout = async () => {
    await clearToken();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
