import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Locale, Direction } from '../types';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleDirection } from './config';
import { en, Translations } from './locales/en';
import { ar } from './locales/ar';

const dictionaries: Record<Locale, Translations> = {
  en,
  ar,
};

interface I18nContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function resolveTranslation(dict: unknown, path: string): string {
  const segments = path.split('.');
  let current: unknown = dict;

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return path; // Fallback to key path if missing
    }
  }

  return typeof current === 'string' ? current : path;
}

export const I18nProvider: React.FC<{
  initialLocale?: Locale;
  children: React.ReactNode;
}> = ({ initialLocale = DEFAULT_LOCALE, children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Detect locale from path/query if present or default
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramLocale = urlParams.get('lang') as Locale;
      if (paramLocale && paramLocale in SUPPORTED_LOCALES) {
        return paramLocale;
      }
    }
    return initialLocale;
  });

  const direction = useMemo(() => getLocaleDirection(locale), [locale]);

  // Synchronize document dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale in SUPPORTED_LOCALES && newLocale !== locale) {
      setLocaleState(newLocale);
      // Synchronize URL query parameter without full reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLocale);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const toggleLocale = () => {
    const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';
    setLocale(nextLocale);
  };

  const t = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
    return (path: string, params?: Record<string, string | number>): string => {
      let text = resolveTranslation(dict, path);
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          text = text.replace(new RegExp(`{${key}}`, 'g'), String(val));
        });
      }
      return text;
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      direction,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, direction, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
