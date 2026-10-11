import React from 'react';
import { BadgeVariant } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  id,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'border border-[#E4DED3] bg-[#FAF7F2] text-[#7A736A]',
    accent: 'border border-[#A98860]/40 bg-[#FAF7F2] text-[#A98860]',
    neutral: 'border border-[#1C1A17]/20 bg-[#1C1A17]/5 text-[#1C1A17]',
    outline: 'border border-[#E4DED3] bg-transparent text-[#7A736A]',
  };

  const sizeStyles = {
    sm: 'text-[10px] sm:text-[11px] px-2 py-0.5 tracking-[0.1em]',
    md: 'text-[11px] sm:text-[12px] px-2.5 py-1 tracking-[0.12em]',
  };

  return (
    <span
      id={id}
      className={`
        inline-flex items-center justify-center font-mono uppercase rounded-[2px]
        [dir=rtl]:tracking-normal [dir=rtl]:normal-case
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
