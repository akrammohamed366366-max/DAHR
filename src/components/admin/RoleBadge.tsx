import React from 'react';

export type AllowedRole = 'fullAdmin' | 'staff' | 'admin' | 'manager' | 'editor' | 'support' | string;

export interface RoleBadgeProps {
  role: AllowedRole;
  className?: string;
  id?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '', id }) => {
  const normalizedRole = role === 'admin' ? 'fullAdmin' : role === 'manager' ? 'staff' : role;

  const roleConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    fullAdmin: {
      label: 'fullAdmin',
      bg: 'bg-[#1C1A17]',
      text: 'text-[#FAF7F2]',
      border: 'border-[#1C1A17]',
    },
    staff: {
      label: 'staff',
      bg: 'bg-[#A98860]/15',
      text: 'text-[#825F36]',
      border: 'border-[#A98860]/50',
    },
    admin: {
      label: 'fullAdmin',
      bg: 'bg-[#1C1A17]',
      text: 'text-[#FAF7F2]',
      border: 'border-[#1C1A17]',
    },
    manager: {
      label: 'staff',
      bg: 'bg-[#A98860]/15',
      text: 'text-[#825F36]',
      border: 'border-[#A98860]/50',
    },
    editor: {
      label: 'editor',
      bg: 'bg-[#4B5D46]/15',
      text: 'text-[#4B5D46]',
      border: 'border-[#4B5D46]/40',
    },
    support: {
      label: 'support',
      bg: 'bg-[#FAF7F2]',
      text: 'text-[#7A736A]',
      border: 'border-[#E4DED3]',
    },
  };

  const config = roleConfig[normalizedRole] || {
    label: role,
    bg: 'bg-[#FAF7F2]',
    text: 'text-[#7A736A]',
    border: 'border-[#E4DED3]',
  };

  return (
    <span
      id={id}
      className={`
        inline-flex items-center px-2 py-0.5 rounded-[2px] border text-[10px] font-mono font-medium tracking-wider
        select-none whitespace-nowrap
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
};

