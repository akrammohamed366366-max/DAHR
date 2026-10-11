import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../i18n/context';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  id = 'storefront-modal',
}) => {
  const { locale } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1A17]/40 backdrop-blur-none transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} bg-[#FAF7F2] border border-[#E4DED3]
          rounded-[2px] shadow-sm z-10 flex flex-col text-start
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#E4DED3] flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {subtitle && (
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#A98860]">
                {subtitle}
              </span>
            )}
            {title && (
              <h2
                id={`${id}-title`}
                className="font-display text-[22px] sm:text-[26px] text-[#1C1A17] font-normal"
              >
                {title}
              </h2>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'ar' ? 'إغلاق النافذة' : 'Close dialog'}
            className="text-[#7A736A] hover:text-[#1C1A17] p-1.5 border border-[#E4DED3] rounded-[2px] bg-[#F5F1EA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 text-[14px] sm:text-[15px] text-[#1C1A17] font-body leading-relaxed max-h-[65vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 sm:p-7 border-t border-[#E4DED3] bg-[#F5F1EA]/60 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
