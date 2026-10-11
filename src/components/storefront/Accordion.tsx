import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { AccordionItemData } from '../../types';

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
  id?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
  id = 'storefront-accordion',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (itemId: string) => {
    if (openIds.includes(itemId)) {
      setOpenIds(openIds.filter((i) => i !== itemId));
    } else {
      if (allowMultiple) {
        setOpenIds([...openIds, itemId]);
      } else {
        setOpenIds([itemId]);
      }
    }
  };

  return (
    <div id={id} className={`divide-y divide-[#E4DED3] border-y border-[#E4DED3] ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `accordion-btn-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="transition-colors">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full py-5 sm:py-6 flex items-center justify-between text-start cursor-pointer group focus:outline-none"
              >
                <div className="flex flex-col gap-0.5 pe-4">
                  <span className="font-display text-[18px] sm:text-[20px] text-[#1C1A17] group-hover:text-[#A98860] transition-colors">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[12px] text-[#7A736A] font-body">
                      {item.subtitle}
                    </span>
                  )}
                </div>

                <div className="w-6 h-6 shrink-0 flex items-center justify-center border border-[#E4DED3] rounded-[2px] bg-[#FAF7F2] text-[#1C1A17] group-hover:border-[#1C1A17] transition-colors">
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="pb-6 pt-1 text-[14px] sm:text-[15px] leading-relaxed text-[#7A736A] font-body"
              >
                {typeof item.content === 'string' ? (
                  <p>{item.content}</p>
                ) : (
                  item.content
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
