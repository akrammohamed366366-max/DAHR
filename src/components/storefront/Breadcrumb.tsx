import React from 'react';
import { useI18n } from '../../i18n/context';
import { BreadcrumbItem } from '../../types';
import { DirectionalChevronRight } from '../ui/DirectionalIcon';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron';
  className?: string;
  id?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = 'slash',
  className = '',
  id = 'storefront-breadcrumb',
}) => {
  const { locale } = useI18n();

  return (
    <nav
      id={id}
      aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'}
      className={`flex items-center text-[12px] sm:text-[13px] font-body text-[#7A736A] ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.active ?? isLast;

          return (
            <li key={index} className="inline-flex items-center gap-1.5 sm:gap-2">
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="font-medium text-[#1C1A17] select-none"
                >
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-[#1C1A17] transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="hover:text-[#1C1A17] transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="hover:text-[#1C1A17] transition-colors">
                  {item.label}
                </span>
              )}

              {!isLast && (
                separator === 'chevron' ? (
                  <DirectionalChevronRight className="w-3.5 h-3.5 text-[#D1D1CF] select-none shrink-0" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="text-[#D1D1CF] select-none text-[11px]"
                  >
                    /
                  </span>
                )
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
