import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  placeholder,
  className = '',
  id,
  disabled,
  required,
  value,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className="w-full flex flex-col gap-1.5 font-body text-start">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[12px] sm:text-[13px] uppercase tracking-[0.08em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case text-[#7A736A] font-medium flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#8C3B2E] ms-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`
            w-full bg-[#FAF7F2] text-[#1C1A17] appearance-none cursor-pointer
            border rounded-[2px] text-[14px] sm:text-[15px] py-3 ps-4 pe-10 transition-colors duration-150
            focus:outline-none focus:border-[#1C1A17] focus:bg-[#FFFFFF]
            disabled:bg-[#F5F1EA] disabled:text-[#7A736A]/40 disabled:border-[#E4DED3]/60 disabled:cursor-not-allowed
            ${error ? 'border-[#8C3B2E] focus:border-[#8C3B2E]' : 'border-[#E4DED3] hover:border-[#1C1A17]/40'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#7A736A]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#FAF7F2] text-[#1C1A17]">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute end-3.5 flex items-center pointer-events-none text-[#7A736A]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-[12px] text-[#8C3B2E] font-medium mt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12px] text-[#7A736A] mt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
