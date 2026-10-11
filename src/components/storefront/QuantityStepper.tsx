import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useI18n } from '../../i18n/context';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  ariaLabel?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = 'md',
  id = 'quantity-stepper',
  ariaLabel,
}) => {
  const { locale } = useI18n();
  const effectiveAriaLabel = ariaLabel || (locale === 'ar' ? 'الكمية' : 'Quantity');
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const isMin = value <= min;
  const isMax = value >= max;

  const sizeClasses = {
    sm: 'h-9 text-[13px]',
    md: 'h-11 text-[14px]',
  };

  const btnWidth = {
    sm: 'w-8',
    md: 'w-10',
  };

  return (
    <div
      id={id}
      role="group"
      aria-label={effectiveAriaLabel}
      className={`
        inline-flex items-center border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]
        font-mono select-none transition-colors duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1C1A17]/40'}
        ${sizeClasses[size]}
      `}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMin}
        aria-label={locale === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
        className={`
          ${btnWidth[size]} h-full flex items-center justify-center text-[#1C1A17]
          border-e border-[#E4DED3] transition-colors
          hover:bg-[#F5F1EA] active:bg-[#EBEBE8]
          disabled:text-[#7A736A]/40 disabled:hover:bg-transparent disabled:cursor-not-allowed
        `}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        aria-live="polite"
        className="px-3 min-w-[36px] text-center font-medium text-[#1C1A17]"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        aria-label={locale === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
        className={`
          ${btnWidth[size]} h-full flex items-center justify-center text-[#1C1A17]
          border-s border-[#E4DED3] transition-colors
          hover:bg-[#F5F1EA] active:bg-[#EBEBE8]
          disabled:text-[#7A736A]/40 disabled:hover:bg-transparent disabled:cursor-not-allowed
        `}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
