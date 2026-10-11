import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Undo,
  Redo,
  CornerDownRight,
  LucideProps,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';

interface DirectionalIconProps extends LucideProps {
  icon: React.ComponentType<LucideProps>;
  flipInRtl?: boolean;
  className?: string;
}

/**
 * Universal wrapper for directional icons.
 * Automatically mirrors the icon along the horizontal axis when dir="rtl".
 */
export const DirectionalIcon: React.FC<DirectionalIconProps> = ({
  icon: IconComponent,
  flipInRtl = true,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center ${
        flipInRtl ? '[dir=rtl]:-scale-x-100 transition-transform duration-200' : ''
      }`}
    >
      <IconComponent className={className} {...props} />
    </span>
  );
};

/**
 * Pre-configured directional Arrow Right icon (points in the forward reading direction: Right in LTR, Left in RTL)
 */
export const DirectionalArrowRight: React.FC<LucideProps> = ({ className = 'w-4 h-4', ...props }) => {
  return <DirectionalIcon icon={ArrowRight} flipInRtl className={className} {...props} />;
};

/**
 * Pre-configured directional Arrow Left icon (points in the backward reading direction: Left in LTR, Right in RTL)
 */
export const DirectionalArrowLeft: React.FC<LucideProps> = ({ className = 'w-4 h-4', ...props }) => {
  return <DirectionalIcon icon={ArrowLeft} flipInRtl className={className} {...props} />;
};

/**
 * Pre-configured directional Chevron Right icon (e.g. for menus, drill-downs, pagination next)
 */
export const DirectionalChevronRight: React.FC<LucideProps> = ({ className = 'w-4 h-4', ...props }) => {
  return <DirectionalIcon icon={ChevronRight} flipInRtl className={className} {...props} />;
};

/**
 * Pre-configured directional Chevron Left icon (e.g. for back navigation, pagination prev)
 */
export const DirectionalChevronLeft: React.FC<LucideProps> = ({ className = 'w-4 h-4', ...props }) => {
  return <DirectionalIcon icon={ChevronLeft} flipInRtl className={className} {...props} />;
};

/**
 * Pre-configured directional external link arrow (points Up-Right in LTR, Up-Left in RTL)
 */
export const DirectionalExternalArrow: React.FC<LucideProps> = ({ className = 'w-3.5 h-3.5', ...props }) => {
  return <DirectionalIcon icon={ArrowUpRight} flipInRtl className={className} {...props} />;
};
