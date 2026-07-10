"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearStoredAuthToken,
  getStoredAuthToken,
  storeAuthToken,
} from "@/lib/api/auth-token";
import type { User } from "@/lib/api/types";

interface AuthContextValue {
  clearSession: () => void;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User | null) => void;
  token: string | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setToken(getStoredAuthToken());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const setSession = useCallback((nextToken: string, nextUser: User) => {
    storeAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      clearSession,
      isAuthenticated: Boolean(token),
      isHydrated,
      setSession,
      setUser,
      token,
      user,
    }),
    [clearSession, isHydrated, setSession, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
