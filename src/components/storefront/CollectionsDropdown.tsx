import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { RouteId } from '../../types';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';

export interface CollectionItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  count: number;
}

export const COLLECTIONS_DATA: CollectionItem[] = [
  {
    id: 'desert-ouds',
    nameEn: 'The Desert Ouds',
    nameAr: 'خلاصات العود الصحراوي',
    descEn: 'Wild Cambodian & Assamese agarwood aged in cedar flacons.',
    descAr: 'خلاصات العود الكمبودي والآسامي النادر المعتق في أخشاب الأرز.',
    count: 4,
  },
  {
    id: 'rare-florals',
    nameEn: 'Rare Florals & Taif Roses',
    nameAr: 'الزهور النادرة وورد الطائف',
    descEn: 'Highland Taif petals distilled at dawn with orange blossom absolute.',
    descAr: 'بتلات ورد الطائف الجبلي المقطوفة فجراً مع خلاصة زهر البرتقال.',
    count: 3,
  },
  {
    id: 'pure-extracts',
    nameEn: 'Pure Extraits (35%+)',
    nameAr: 'الخلاصات النقية المركزة',
    descEn: 'High-concentration masterworks with ambergris and vintage incense.',
    descAr: 'تحف عطرية بتركيز فائق غنية بالعنبر الطبيعي والبخور العتيق.',
    count: 5,
  },
  {
    id: 'discovery-sets',
    nameEn: 'Bespoke Discovery Sets',
    nameAr: 'مجموعات الاكتشاف الحصرية',
    descEn: 'Curated 10ml miniature flacons with embossed olfactory blotting strips.',
    descAr: 'مجموعات مصغرة سعة 10 مل مع أشرطة الشم المخملية الفاخرة.',
    count: 2,
  },
];

interface CollectionsDropdownProps {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
}

export const CollectionsDropdown: React.FC<CollectionsDropdownProps> = ({
  activeRoute,
  onRouteChange,
}) => {
  const { locale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isCurrentActive = activeRoute === 'collections';

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <button
        id="nav-collections-trigger"
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('header.collectionsMenu')}
        className={`
          flex items-center gap-1.5 py-1 px-2.5 rounded-[2px] transition-colors cursor-pointer text-[11px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-medium
          ${
            isCurrentActive || isOpen
              ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
              : 'text-[#7A736A] hover:text-[#1C1A17]'
          }
          focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none
        `}
      >
        <span>{t('nav.collections')}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#7A736A] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#1C1A17]' : ''
          }`}
        />
      </button>

      {/* Quiet Luxury Hover/Click Dropdown Panel */}
      {isOpen && (
        <div
          id="collections-dropdown-menu"
          role="menu"
          aria-label={locale === 'ar' ? 'قائمة المجموعات الفرعية' : 'Collections Submenu'}
          className="absolute top-full start-0 mt-2 w-[340px] sm:w-[380px] bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] shadow-sm p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-start"
        >
          <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2.5 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'المجموعات العطرية الحصرية' : 'Curated Olfactive Series'}
            </span>
            <span className="text-[10px] font-mono text-[#A98860]">
              4 {locale === 'ar' ? 'سلاسل' : 'Series'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {COLLECTIONS_DATA.map((col) => (
              <button
                key={col.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onRouteChange('collections');
                  setIsOpen(false);
                }}
                className="group flex flex-col items-start gap-1 p-2.5 rounded-[2px] text-start hover:bg-[#F5F1EA] transition-colors cursor-pointer border border-transparent hover:border-[#E4DED3] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[13px] font-medium font-body text-[#1C1A17] group-hover:text-[#A98860] transition-colors">
                    {locale === 'ar' ? col.nameAr : col.nameEn}
                  </span>
                  <span className="text-[10px] font-mono text-[#7A736A]">
                    {col.count} {locale === 'ar' ? 'عطور' : 'flacons'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A736A] leading-relaxed line-clamp-1 font-body">
                  {locale === 'ar' ? col.descAr : col.descEn}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[#E4DED3] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onRouteChange('collections');
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#A98860] hover:text-[#1C1A17] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <span>{t('nav.viewAllCollections')}</span>
              <DirectionalArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
