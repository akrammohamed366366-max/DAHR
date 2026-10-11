import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Locale } from '../../types';

export interface LocaleSwitcherProps {
  id?: string;
  variant?: 'minimal' | 'segmented' | 'admin';
  size?: 'sm' | 'md';
  className?: string;
  showIndicator?: boolean;
}

export const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({
  id = 'locale-switcher',
  variant = 'minimal',
  size = 'sm',
  className = '',
}) => {
  const { locale, setLocale, t } = useI18n();

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      setLocale(nextLocale);
    }
  };

  // High-contrast Admin variant with persistent active locale indicator
  if (variant === 'admin') {
    const isEn = locale === 'en';
    const isAr = locale === 'ar';

    return (
      <div
        id={id}
        role="group"
        aria-label={isAr ? 'سياق لغة الإدارة والتحرير' : 'Admin & editing language context'}
        className={`inline-flex items-center gap-1.5 p-1 bg-[#221F1B] rounded-[2px] border border-[#3E3A34] select-none font-mono ${className}`}
      >
        {/* Persistent Visual Context Indicator */}
        <div
          id={`${id}-active-indicator`}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#1C1A17] border border-[#2E2B26] text-[10px] tracking-wider"
          title={
            isEn
              ? 'Current active editing context: English (Left-to-Right)'
              : 'سياق التحرير النشط الحالي: العربية (من اليمين إلى اليسار)'
          }
        >
          <Globe className="w-3 h-3 text-[#A98860] shrink-0" />
          <span className="text-[#9B9488] hidden lg:inline uppercase">
            {isEn ? 'Context:' : 'السياق:'}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#FAF7F2]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#A98860] ring-2 ring-[#A98860]/30 animate-pulse"
              aria-hidden="true"
            />
            <span>{isEn ? 'EN (LTR)' : 'العربية (RTL)'}</span>
          </span>
        </div>

        {/* Interactive Segmented Switcher Controls */}
        <div className="flex items-center bg-[#1C1A17] p-0.5 rounded-[2px] border border-[#2E2B26]">
          <button
            type="button"
            id={`${id}-en`}
            onClick={() => handleSelect('en')}
            aria-pressed={isEn}
            aria-label={isEn ? 'English context currently active' : 'Switch admin context to English (LTR)'}
            title={isEn ? 'English (Active context)' : 'Switch to English (LTR)'}
            className={`
              px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-[1px] transition-all cursor-pointer flex items-center gap-1
              ${
                isEn
                  ? 'bg-[#A98860] text-[#1C1A17] font-bold shadow-xs'
                  : 'text-[#9B9488] hover:text-[#FAF7F2] hover:bg-[#2A2723]'
              }
            `}
          >
            <span>EN</span>
            {isEn && <span className="text-[8px] leading-none opacity-80">●</span>}
          </button>

          <button
            type="button"
            id={`${id}-ar`}
            onClick={() => handleSelect('ar')}
            aria-pressed={isAr}
            aria-label={isAr ? 'Arabic context currently active' : 'Switch admin context to Arabic (RTL)'}
            title={isAr ? 'العربية (السياق النشط)' : 'التحويل إلى العربية (RTL)'}
            className={`
              px-2 py-0.5 text-[10px] font-mono tracking-wider rounded-[1px] transition-all cursor-pointer flex items-center gap-1
              ${
                isAr
                  ? 'bg-[#A98860] text-[#1C1A17] font-bold shadow-xs'
                  : 'text-[#9B9488] hover:text-[#FAF7F2] hover:bg-[#2A2723]'
              }
            `}
          >
            <span>عربي</span>
            {isAr && <span className="text-[8px] leading-none opacity-80">●</span>}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        id={id}
        role="group"
        aria-label={t('actions.switchLocale')}
        className={`inline-flex items-center bg-[#FAF7F2] p-0.5 rounded-[2px] border border-[#E4DED3] select-none font-mono ${className}`}
      >
        <button
          type="button"
          id={`${id}-en`}
          onClick={() => handleSelect('en')}
          aria-pressed={locale === 'en'}
          aria-label="Switch language to English (LTR)"
          className={`
            px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-[1px] transition-colors cursor-pointer
            ${locale === 'en' ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold' : 'text-[#7A736A] hover:text-[#1C1A17]'}
          `}
        >
          EN
        </button>
        <button
          type="button"
          id={`${id}-ar`}
          onClick={() => handleSelect('ar')}
          aria-pressed={locale === 'ar'}
          aria-label="Switch language to Arabic (RTL)"
          className={`
            px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-[1px] transition-colors cursor-pointer
            ${locale === 'ar' ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold' : 'text-[#7A736A] hover:text-[#1C1A17]'}
          `}
        >
          AR
        </button>
      </div>
    );
  }

  // Minimal quiet-luxury text switcher: "EN / AR"
  return (
    <div
      id={id}
      role="group"
      aria-label={t('actions.switchLocale')}
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider select-none ${className}`}
    >
      <button
        type="button"
        id={`${id}-en`}
        onClick={() => handleSelect('en')}
        aria-pressed={locale === 'en'}
        aria-label="Switch language to English (LTR)"
        className={`
          transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860] px-1 py-0.5 rounded-[1px]
          ${
            locale === 'en'
              ? 'font-bold text-[#1C1A17] border-b border-[#1C1A17]'
              : 'text-[#7A736A] hover:text-[#1C1A17]'
          }
          ${size === 'md' ? 'text-[13px] px-2 py-1' : 'text-[11px]'}
        `}
      >
        EN
      </button>

      <span className="text-[#D1D1CF] select-none font-light">/</span>

      <button
        type="button"
        id={`${id}-ar`}
        onClick={() => handleSelect('ar')}
        aria-pressed={locale === 'ar'}
        aria-label="Switch language to Arabic (RTL)"
        className={`
          transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860] px-1 py-0.5 rounded-[1px]
          ${
            locale === 'ar'
              ? 'font-bold text-[#1C1A17] border-b border-[#1C1A17]'
              : 'text-[#7A736A] hover:text-[#1C1A17]'
          }
          ${size === 'md' ? 'text-[13px] px-2 py-1' : 'text-[11px]'}
        `}
      >
        AR
      </button>
    </div>
  );
};
