import React, { useId } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n/context';

export interface FormFieldGroupProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  optionalText?: string;
  statusBadge?: 'required' | 'pending' | 'complete' | null;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  label,
  htmlFor,
  required = false,
  helperText,
  errorText,
  optionalText,
  statusBadge,
  children,
  className = '',
  id,
}) => {
  const { locale } = useI18n();
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div id={fieldId} className={`w-full flex flex-col gap-1.5 text-start ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-[#1C1A17] flex items-center gap-1 font-body"
        >
          <span>{label}</span>
          {required ? (
            <span
              className="text-[#8C3B2E] text-[12px] font-bold"
              title={locale === 'ar' ? 'حقل إلزامي' : 'Required'}
            >
              *
            </span>
          ) : optionalText ? (
            <span className="text-[11px] font-mono text-[#7A736A] font-normal">
              ({optionalText})
            </span>
          ) : null}
        </label>

        {statusBadge && (
          <span
            className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border flex items-center gap-1 select-none shrink-0 ${
              statusBadge === 'complete'
                ? 'bg-[#4A6B53]/10 text-[#4A6B53] border-[#4A6B53]/30'
                : statusBadge === 'pending'
                ? 'bg-[#A98860]/10 text-[#A98860] border-[#A98860]/30'
                : 'bg-[#8C3B2E]/10 text-[#8C3B2E] border-[#8C3B2E]/30 font-medium'
            }`}
          >
            {statusBadge === 'complete' ? (
              <>
                <Check className="w-2.5 h-2.5" />
                <span>{locale === 'ar' ? 'مكتمل' : 'Complete'}</span>
              </>
            ) : statusBadge === 'pending' ? (
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
        )}
      </div>

      <div className="w-full">{children}</div>

      {errorText ? (
        <p id={errorId} className="text-[11px] font-mono text-[#8C3B2E] mt-0.5">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-[11px] text-[#7A736A] mt-0.5 font-body">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
