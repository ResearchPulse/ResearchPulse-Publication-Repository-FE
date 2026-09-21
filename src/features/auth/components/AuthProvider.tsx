'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/shared/types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  updateUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const logout = async () => {
    setUser(null);
    await authApi.logout();
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
