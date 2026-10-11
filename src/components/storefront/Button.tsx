import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  loading = false,
  disabled,
  className = '',
  id,
  type = 'button',
  ...props
}) => {
  const isButtonLoading = isLoading || loading;

  // Base sizing
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-[12px]',
    md: 'px-6 py-3 text-[13px] sm:text-[14px]',
    lg: 'px-8 py-4 text-[14px] sm:text-[15px]',
  };

  // Variant styling according to DAHR tokens
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#1C1A17] text-[#FAF7F2] border border-[#1C1A17] hover:bg-[#A98860] hover:border-[#A98860] active:bg-[#8F704C] disabled:bg-[#7A736A]/30 disabled:border-transparent disabled:text-[#FAF7F2]/60',
    secondary:
      'bg-[#FAF7F2] text-[#1C1A17] border border-[#E4DED3] hover:border-[#1C1A17] hover:bg-[#F5F1EA] active:bg-[#EBEBE8] disabled:border-[#E4DED3]/50 disabled:text-[#7A736A]/50',
    text:
      'bg-transparent text-[#1C1A17] border border-transparent hover:text-[#A98860] active:text-[#8F704C] disabled:text-[#7A736A]/40 px-2 py-2 underline-offset-4 hover:underline',
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isButtonLoading}
      className={`
        inline-flex items-center justify-center gap-2.5 font-medium
        rounded-[2px] cursor-pointer transition-all duration-200 ease-out active:scale-[0.99] select-none
        font-body uppercase tracking-[0.12em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case
        focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:ring-offset-1
        disabled:cursor-not-allowed disabled:active:scale-100
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isButtonLoading && (
        <span
          aria-hidden="true"
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
        />
      )}
      {!isButtonLoading && leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {!isButtonLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </button>
  );
};
