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

import type { ThemePreference } from "@/lib/api/types";

const THEME_STORAGE_KEY = "cityquest.theme";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  isHydrated: boolean;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  theme: ThemePreference;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [isHydrated, setIsHydrated] = useState(false);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      setSystemTheme(readSystemTheme());
      setThemeState(isThemePreference(storedTheme) ? storedTheme : "system");
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");

    media.addEventListener("change", updateSystemTheme);

    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isHydrated,
      resolvedTheme,
      setTheme,
      theme,
    }),
    [isHydrated, resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider.");
  }

  return context;
}

function readSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
