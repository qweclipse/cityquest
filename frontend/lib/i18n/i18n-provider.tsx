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

import { dictionaries, languageOptions, type Dictionary } from "@/lib/i18n/dictionaries";
import type { LanguageCode } from "@/lib/api/types";

const LANGUAGE_STORAGE_KEY = "cityquest.language";
const DEFAULT_LANGUAGE: LanguageCode = "ru";

interface I18nContextValue {
  dictionary: Dictionary;
  language: LanguageCode;
  languages: typeof languageOptions;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (isLanguageCode(storedLanguage)) {
        setLanguageState(storedLanguage);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const dictionary = dictionaries[language];

  const t = useCallback(
    (key: string) => {
      const value = key
        .split(".")
        .reduce<unknown>(
          (current, segment) =>
            current && typeof current === "object"
              ? (current as Record<string, unknown>)[segment]
              : undefined,
          dictionary,
        );

      return typeof value === "string" ? value : key;
    },
    [dictionary],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      dictionary,
      language,
      languages: languageOptions,
      setLanguage,
      t,
    }),
    [dictionary, language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return context;
}

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === "ru" || value === "en" || value === "ro";
}
