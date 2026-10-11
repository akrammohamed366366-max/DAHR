import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  required,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full flex flex-col gap-1.5 font-body text-start">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] sm:text-[13px] uppercase tracking-[0.08em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case text-[#7A736A] font-medium flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#8C3B2E] ms-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute start-3.5 flex items-center pointer-events-none text-[#7A736A]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`
            w-full bg-[#FAF7F2] text-[#1C1A17] placeholder:text-[#7A736A]/50
            border rounded-[2px] text-[14px] sm:text-[15px] py-3 transition-colors duration-150
            focus:outline-none focus:border-[#1C1A17] focus:bg-[#FFFFFF]
            disabled:bg-[#F5F1EA] disabled:text-[#7A736A]/40 disabled:border-[#E4DED3]/60 disabled:cursor-not-allowed
            ${error ? 'border-[#8C3B2E] focus:border-[#8C3B2E]' : 'border-[#E4DED3] hover:border-[#1C1A17]/40'}
            ${leftIcon ? 'ps-10' : 'ps-4'}
            ${rightIcon ? 'pe-10' : 'pe-4'}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute end-3.5 flex items-center pointer-events-none text-[#7A736A]">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="text-[12px] text-[#8C3B2E] font-medium flex items-center gap-1 mt-0.5">
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
