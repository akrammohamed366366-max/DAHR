import React from 'react';
import { AdminStatus } from '../../types';

export type AllowedStatus = AdminStatus | 'active' | 'deactivated' | string;

export interface StatusPillProps {
  status: AllowedStatus;
  label?: string;
  className?: string;
  id?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  className = '',
  id,
}) => {
  const statusConfig: Record<
    string,
    { defaultLabel: string; bg: string; text: string; dot: string; border: string }
  > = {
    active: {
      defaultLabel: 'Active',
      bg: 'bg-[#4B5D46]/10',
      text: 'text-[#4B5D46]',
      dot: 'bg-[#4B5D46]',
      border: 'border-[#4B5D46]/30',
    },
    deactivated: {
      defaultLabel: 'Deactivated',
      bg: 'bg-[#8C3B2E]/10',
      text: 'text-[#8C3B2E]',
      dot: 'bg-[#8C3B2E]',
      border: 'border-[#8C3B2E]/30',
    },
    paid: {
      defaultLabel: 'Paid',
      bg: 'bg-[#4B5D46]/10',
      text: 'text-[#4B5D46]',
      dot: 'bg-[#4B5D46]',
      border: 'border-[#4B5D46]/30',
    },
    fulfilled: {
      defaultLabel: 'Fulfilled',
      bg: 'bg-[#4B5D46]/10',
      text: 'text-[#4B5D46]',
      dot: 'bg-[#4B5D46]',
      border: 'border-[#4B5D46]/30',
    },
    pending: {
      defaultLabel: 'Pending',
      bg: 'bg-[#A9772F]/10',
      text: 'text-[#875516]',
      dot: 'bg-[#A9772F]',
      border: 'border-[#A9772F]/30',
    },
    processing: {
      defaultLabel: 'Processing',
      bg: 'bg-[#3D5A80]/10',
      text: 'text-[#2D4566]',
      dot: 'bg-[#3D5A80]',
      border: 'border-[#3D5A80]/30',
    },
    shipped: {
      defaultLabel: 'Shipped',
      bg: 'bg-[#5C6B73]/15',
      text: 'text-[#2C383F]',
      dot: 'bg-[#5C6B73]',
      border: 'border-[#5C6B73]/40',
    },
    delivered: {
      defaultLabel: 'Delivered',
      bg: 'bg-[#4B5D46]/10',
      text: 'text-[#364432]',
      dot: 'bg-[#4B5D46]',
      border: 'border-[#4B5D46]/30',
    },
    low_stock: {
      defaultLabel: 'Low Stock',
      bg: 'bg-[#A9772F]/10',
      text: 'text-[#875516]',
      dot: 'bg-[#A9772F]',
      border: 'border-[#A9772F]/30',
    },
    cancelled: {
      defaultLabel: 'Cancelled',
      bg: 'bg-[#8C3B2E]/10',
      text: 'text-[#8C3B2E]',
      dot: 'bg-[#8C3B2E]',
      border: 'border-[#8C3B2E]/30',
    },
    archived: {
      defaultLabel: 'Archived',
      bg: 'bg-[#7A736A]/10',
      text: 'text-[#7A736A]',
      dot: 'bg-[#7A736A]',
      border: 'border-[#7A736A]/30',
    },
    draft: {
      defaultLabel: 'Draft',
      bg: 'bg-[#FAF7F2]',
      text: 'text-[#7A736A]',
      dot: 'bg-[#7A736A]',
      border: 'border-[#E4DED3]',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;


  return (
    <span
      id={id}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium
        select-none whitespace-nowrap
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
