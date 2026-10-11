import React from 'react';
import { useI18n } from '../../i18n/context';

export interface AdminLanguageToggleProps {
  id?: string;
  className?: string;
}

export const AdminLanguageToggle: React.FC<AdminLanguageToggleProps> = ({
  id = 'admin-inner-language-toggle',
  className = '',
}) => {
  const { locale, setLocale } = useI18n();

  return (
    <div
      id={id}
      role="group"
      aria-label={locale === 'ar' ? 'تبديل لغة لوحة التحكم' : 'Admin language toggle'}
      className={`inline-flex items-center bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-0.5 text-[9px] font-mono uppercase tracking-wider select-none ${className}`}
    >
      <button
        type="button"
        id={`${id}-en`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label="Switch admin context to English"
        title="English"
        className={`px-1.5 py-0.5 rounded-[1px] transition-colors cursor-pointer font-semibold ${
          locale === 'en'
            ? 'bg-[#1C1A17] text-[#FAF7F2]'
            : 'text-[#7A736A] hover:text-[#1C1A17]'
        }`}
      >
        EN
      </button>
      <span className="text-[#D3CBBF] mx-0.5 font-normal select-none" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        id={`${id}-ar`}
        onClick={() => setLocale('ar')}
        aria-pressed={locale === 'ar'}
        aria-label="التحويل إلى العربية"
        title="العربية"
        className={`px-1.5 py-0.5 rounded-[1px] transition-colors cursor-pointer font-semibold ${
          locale === 'ar'
            ? 'bg-[#1C1A17] text-[#FAF7F2]'
            : 'text-[#7A736A] hover:text-[#1C1A17]'
        }`}
      >
        AR
      </button>
    </div>
  );
};
