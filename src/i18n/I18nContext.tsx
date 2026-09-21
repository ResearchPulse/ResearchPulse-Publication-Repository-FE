'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Locale, I18nContextType, TranslationDictionary } from './types';
import viDict from './locales/vi.json';
import enDict from './locales/en.json';

const dictionaries: Record<Locale, TranslationDictionary> = {
  vi: viDict as TranslationDictionary,
  en: enDict as TranslationDictionary,
};

const STORAGE_KEY = 'app_language';
const COOKIE_NAME = 'NEXT_LOCALE';

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables || !text) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  defaultLocale = 'vi',
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isReady, setIsReady] = useState(false);

  // Initialize from localStorage or cookie on mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLocale === 'vi' || savedLocale === 'en') {
        setLocaleState(savedLocale);
      } else {
        // Try reading cookie
        const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
        const cookieLocale = match?.[2] as Locale | undefined;
        if (cookieLocale === 'vi' || cookieLocale === 'en') {
          setLocaleState(cookieLocale);
        }
      }
    } catch {
      // Ignore in SSR / strict environment
    } finally {
      setIsReady(true);
    }
  }, []);

  // Update cookie and html lang when locale changes
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Save cookie for 1 year
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  }, [locale, setLocale]);

  // Sync html lang
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, fallbackOrVars?: string | Record<string, string | number>, variables?: Record<string, string | number>): string => {
      let fallback: string | undefined = undefined;
      let vars: Record<string, string | number> | undefined = undefined;

      if (typeof fallbackOrVars === 'string') {
        fallback = fallbackOrVars;
        vars = variables;
      } else {
        vars = fallbackOrVars;
      }

      const dict = dictionaries[locale] || dictionaries.vi;
      let text = getNestedValue(dict, key);

      // Fallback to Vietnamese if not found in current locale
      if (text === undefined && locale !== 'vi') {
        text = getNestedValue(dictionaries.vi, key);
      }

      // If still not found, fallback to provided fallback text or key itself
      if (text === undefined) {
        return fallback !== undefined ? fallback : key;
      }

      return interpolate(text, vars);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      isReady,
    }),
    [locale, setLocale, toggleLocale, t, isReady]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export const useI18n = useTranslation;
