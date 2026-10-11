import { Locale, LocaleConfig } from '../types';

/**
 * Brand rule:
 * Brand name renders exactly as "DAHR" in both languages, always in Latin characters.
 * Never translate, transliterate, or restyle it.
 */
export const BRAND_NAME = 'DAHR' as const;

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    direction: 'rtl',
  },
};

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return SUPPORTED_LOCALES[locale]?.direction || 'ltr';
}
