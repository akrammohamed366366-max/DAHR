import { Locale } from '../types';

export interface PriceFormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useEasternArabicNumerals?: boolean;
  showCurrencyCode?: boolean;
}

const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export function toEasternArabicNumerals(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[parseInt(digit, 10)] || digit);
}

/**
 * Converts Eastern Arabic digits (٠-٩) to Western digits (0-9)
 */
export function toWesternNumerals(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String(EASTERN_ARABIC_DIGITS.indexOf(digit)));
}

/**
 * Format currency and price according to active locale and quiet-luxury standards
 */
export function formatPrice(
  amount: number,
  locale: Locale,
  options: PriceFormatOptions = {}
): string {
  const {
    currency = 'USD',
    minimumFractionDigits = amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits = 2,
    useEasternArabicNumerals = false,
    showCurrencyCode = false,
  } = options;

  if (locale === 'ar') {
    // Localized Arabic Currency Display
    const currencyNames: Record<string, string> = {
      USD: 'دولار',
      AED: 'د.إ',
      SAR: 'ر.س',
      QAR: 'ر.ق',
      EUR: 'يورو',
      GBP: 'جنيه استرليني',
    };

    const currencySymbol = currencyNames[currency] || currency;

    let formattedNum = new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    if (useEasternArabicNumerals) {
      formattedNum = toEasternArabicNumerals(formattedNum);
    } else {
      formattedNum = toWesternNumerals(formattedNum);
    }

    return showCurrencyCode
      ? `${formattedNum} ${currency}`
      : `${formattedNum} ${currencySymbol}`;
  }

  // English LTR Formatting
  const formatted = new Intl.NumberFormat('en-US', {
    style: showCurrencyCode ? 'decimal' : 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return showCurrencyCode ? `${formatted} ${currency}` : formatted;
}

/**
 * Format standard numbers and quantities per locale
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions & { numeralSystem?: 'latn' | 'arab' }
): string {
  const numeralSystem = options?.numeralSystem;
  const localeTag = locale === 'ar' 
    ? (numeralSystem === 'arab' ? 'ar-u-nu-arab' : 'ar-u-nu-latn') 
    : 'en-US';

  return new Intl.NumberFormat(localeTag, options).format(value);
}

/**
 * Format localized dates
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  formatStyle: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const dateObj = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return String(date);
  }

  const localeTag = locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US';

  const styleOptions: Record<'short' | 'medium' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  };

  return new Intl.DateTimeFormat(localeTag, styleOptions[formatStyle]).format(dateObj);
}

/**
 * Format relative time (e.g. "in 3 days" / "منذ ساعتين")
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale
): string {
  const localeTag = locale === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'auto' });
  return rtf.format(value, unit);
}

/**
 * Format localized lists with grammatically correct conjunctions
 */
export function formatList(
  items: string[],
  locale: Locale,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  if (items.length === 0) return '';
  const localeTag = locale === 'ar' ? 'ar' : 'en';

  if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
    const formatter = new (Intl as unknown as { ListFormat: new (loc: string, opt: { style: string; type: string }) => { format: (list: string[]) => string } }).ListFormat(
      localeTag,
      { style: 'long', type }
    );
    return formatter.format(items);
  }

  // Fallback if Intl.ListFormat is not supported
  if (locale === 'ar') {
    return items.join('، ');
  }
  return items.join(', ');
}
