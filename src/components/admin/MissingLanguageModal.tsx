import React, { useEffect } from 'react';
import { AlertTriangle, X, ArrowRight, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n/context';

export interface MissingFieldItem {
  id: string;
  fieldLabel: string;
  language: 'en' | 'ar';
  tabId?: string;
  tabLabel?: string;
  status?: 'pending' | 'required';
}

/**
 * Calculates whether a language field is complete, pending (partner translation exists),
 * or required (both this and partner field are empty).
 */
export const getLanguageFieldStatus = (
  value: string | undefined,
  partnerValue?: string | undefined
): 'complete' | 'pending' | 'required' => {
  const currentTrimmed = (value || '').trim();
  const partnerTrimmed = (partnerValue || '').trim();
  if (currentTrimmed.length > 0) return 'complete';
  if (partnerTrimmed.length > 0) return 'pending';
  return 'required';
};

export interface MissingLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: MissingFieldItem[];
  onNavigateToField?: (field: MissingFieldItem) => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  id?: string;
}

export const MissingLanguageModal: React.FC<MissingLanguageModalProps> = ({
  isOpen,
  onClose,
  missingFields,
  onNavigateToField,
  secondaryAction,
  id = 'missing-language-modal',
}) => {
  const { locale } = useI18n();

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

  if (!isOpen || missingFields.length === 0) return null;

  const enCount = missingFields.filter((f) => f.language === 'en').length;
  const arCount = missingFields.filter((f) => f.language === 'ar').length;

  return (
    <div
      id={id}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto bg-[#1C1A17]/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0"
      />

      <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] shadow-2xl z-10 flex flex-col overflow-hidden text-start animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E4DED3] bg-[#FAF7F2] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-[2px] bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 flex items-center justify-center text-[#8C3B2E] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8C3B2E] font-medium">
                  {locale === 'ar' ? 'تنبيه التدقيق اللغوي' : 'Bilingual Verification'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] bg-[#E4DED3] text-[#1C1A17]">
                  {missingFields.length}{' '}
                  {locale === 'ar' ? 'حقول غير مكتملة' : 'missing fields'}
                </span>
              </div>
              <h3 id={`${id}-title`} className="text-base sm:text-lg font-serif font-normal text-[#1C1A17]">
                {locale === 'ar'
                  ? 'محتوى لغوي ناقص يتطلب الاستكمال'
                  : 'Incomplete Bilingual Content'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
            className="text-[#7A736A] hover:text-[#1C1A17] p-1.5 rounded-[2px] hover:bg-[#E4DED3]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p id={`${id}-desc`} className="text-xs text-[#554F47] leading-relaxed font-body">
            {locale === 'ar'
              ? 'يتطلب متجر الدار توفير كافة البيانات التحريرية والتوصيفية باللغتين الإنجليزية والعربية معاً. لا يمكن إتمام عملية الحفظ لوجود حقول لم يتم إدخال محتواها بعد:'
              : 'DAHR editorial and sensory standards require all fields to be populated in both English and Arabic. Saving cannot proceed while the following language fields remain empty:'}
          </p>

          {/* Counts overview */}
          <div className="flex items-center gap-3 p-2.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#7A736A]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1C1A17]" />
              <span>English Missing: <strong className="text-[#1C1A17]">{enCount}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A98860]" />
              <span>Arabic Missing: <strong className="text-[#1C1A17]">{arCount}</strong></span>
            </span>
          </div>

          {/* Highlighted Missing Fields List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A] block">
              {locale === 'ar' ? 'قائمة الحقول الناقصة بالتفصيل:' : 'Highlighted Missing Fields:'}
            </span>

            <div className="divide-y divide-[#E4DED3] border border-[#E4DED3] rounded-[2px] bg-[#FAF7F2] overflow-hidden">
              {missingFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => {
                    if (onNavigateToField) {
                      onNavigateToField(field);
                    }
                  }}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                    onNavigateToField
                      ? 'hover:bg-[#F5F1EA] cursor-pointer'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded-[1px] font-medium shrink-0 ${
                        field.language === 'ar'
                          ? 'bg-[#A98860] text-[#FAF7F2]'
                          : 'bg-[#1C1A17] text-[#FAF7F2]'
                      }`}
                    >
                      {field.language.toUpperCase()}
                    </span>

                    <div className="truncate">
                      <div className="font-medium text-[#1C1A17] font-body truncate">
                        {field.fieldLabel}
                      </div>
                      {field.tabLabel && (
                        <div className="text-[10px] font-mono text-[#7A736A]">
                          {field.tabLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] border flex items-center gap-1 ${
                        field.status === 'pending'
                          ? 'bg-[#A98860]/10 text-[#A98860] border-[#A98860]/30'
                          : 'bg-[#8C3B2E]/10 text-[#8C3B2E] border-[#8C3B2E]/30 font-medium'
                      }`}
                    >
                      {field.status === 'pending' ? (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{locale === 'ar' ? 'قيد الإدخال' : 'Pending'}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>{locale === 'ar' ? 'مطلوب' : 'Required'}</span>
                        </>
                      )}
                    </span>

                    {onNavigateToField && (
                      <span className="text-[#A98860] p-1">
                        {locale === 'ar' ? (
                          <ArrowLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E4DED3] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#F5F1EA] hover:bg-[#E4DED3] text-[#1C1A17] text-xs font-mono uppercase tracking-wider rounded-[2px] border border-[#E4DED3] transition-colors cursor-pointer text-center"
          >
            {locale === 'ar' ? 'إغلاق ومتابعة التحرير' : 'Dismiss & Edit'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FAF7F2] hover:bg-[#F5F1EA] text-[#7A736A] hover:text-[#1C1A17] text-xs font-mono uppercase tracking-wider rounded-[2px] border border-[#E4DED3] transition-colors cursor-pointer text-center"
              >
                {secondaryAction.label}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (missingFields.length > 0 && onNavigateToField) {
                  onNavigateToField(missingFields[0]);
                } else {
                  onClose();
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2 bg-[#1C1A17] hover:bg-[#2A2723] text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <span>
                {locale === 'ar'
                  ? 'استكمال أول حقل ناقص'
                  : 'Complete First Missing Field'}
              </span>
              {locale === 'ar' ? (
                <ArrowLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
