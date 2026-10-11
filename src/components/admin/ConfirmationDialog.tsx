import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Button } from '../storefront/Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  id?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
  id = 'admin-confirmation-dialog',
}) => {
  const { locale } = useI18n();
  const effectiveConfirm = confirmLabel || (locale === 'ar' ? 'تأكيد' : 'Confirm');
  const effectiveCancel = cancelLabel || (locale === 'ar' ? 'إلغاء' : 'Cancel');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
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
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="fixed inset-0 bg-[#1C1A17]/40 transition-opacity animate-in fade-in duration-150"
      />

      {/* Dialog Box */}
      <div
        className="
          relative w-full max-w-md bg-[#FAF7F2] border border-[#E4DED3]
          rounded-[2px] shadow-sm z-10 flex flex-col text-start
          animate-in fade-in zoom-in-95 duration-150 p-6
        "
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0
                ${
                  isDestructive
                    ? 'bg-[#8C3B2E]/10 text-[#8C3B2E] border border-[#8C3B2E]/20'
                    : 'bg-[#A98860]/10 text-[#A98860] border border-[#A98860]/20'
                }
              `}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>

            <h3
              id={`${id}-title`}
              className="text-[16px] font-medium text-[#1C1A17] font-body"
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
            className="text-[#7A736A] hover:text-[#1C1A17] p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p id={`${id}-desc`} className="text-[13px] text-[#7A736A] leading-relaxed mb-6 font-body">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4DED3]">
          <Button
            size="sm"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {effectiveCancel}
          </Button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-[12px] uppercase tracking-[0.12em] font-medium rounded-[2px] cursor-pointer transition-colors duration-150 select-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isDestructive
                  ? 'bg-[#8C3B2E] text-[#FAF7F2] hover:bg-[#6D2E24]'
                  : 'bg-[#1C1A17] text-[#FAF7F2] hover:bg-[#A98860]'
              }
            `}
          >
            {isLoading ? (locale === 'ar' ? 'جارٍ المعالجة...' : 'Processing...') : effectiveConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
