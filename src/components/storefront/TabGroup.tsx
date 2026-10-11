import React from 'react';
import { TabItem } from '../../types';

export interface TabGroupProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  id?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  id = 'storefront-tab-group',
}) => {
  return (
    <div
      id={id}
      role="tablist"
      className={`flex items-center gap-6 sm:gap-8 border-b border-[#E4DED3] overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            disabled={tab.disabled}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`
              relative py-3.5 sm:py-4 text-[12px] sm:text-[13px] uppercase tracking-[0.12em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case
              font-medium transition-colors whitespace-nowrap cursor-pointer select-none
              focus:outline-none focus-visible:text-[#1C1A17]
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isActive ? 'text-[#1C1A17]' : 'text-[#7A736A] hover:text-[#1C1A17]'}
            `}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.2 text-[10px] font-mono rounded-[2px]
                    ${isActive ? 'bg-[#1C1A17] text-[#FAF7F2]' : 'bg-[#E4DED3] text-[#7A736A]'}
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </span>

            {/* Active underline indicator */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#1C1A17]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
