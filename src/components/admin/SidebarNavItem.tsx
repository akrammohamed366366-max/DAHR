import React from 'react';

export interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon,
  label,
  isActive = false,
  badge,
  onClick,
  className = '',
  id,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`
        w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[2px]
        text-[13px] font-body transition-colors cursor-pointer select-none text-start
        focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860]
        ${
          isActive
            ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium shadow-xs'
            : 'text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3]/40'
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-2.5 truncate">
        <span className={`shrink-0 ${isActive ? 'text-[#A98860]' : 'text-[#7A736A]'}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {badge !== undefined && (
        <span
          className={`
            px-1.5 py-0.5 text-[10px] font-mono rounded-[2px] shrink-0
            ${
              isActive
                ? 'bg-[#FAF7F2]/20 text-[#FAF7F2]'
                : 'bg-[#E4DED3] text-[#7A736A]'
            }
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
