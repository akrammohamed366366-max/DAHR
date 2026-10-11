import React, { useEffect, useRef, useState } from 'react';
import { X, Search, User, ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { BRAND_NAME } from '../i18n/config';
import { RouteId } from '../types';
import { LocaleSwitcher } from '../components/ui/LocaleSwitcher';
import { DirectionalChevronRight, DirectionalArrowRight } from '../components/ui/DirectionalIcon';
import { COLLECTIONS_DATA } from '../components/storefront/CollectionsDropdown';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  onOpenSearch?: () => void;
  onOpenAccount?: () => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeRoute,
  onRouteChange,
  onOpenSearch,
  onOpenAccount,
  onOpenCart,
  onOpenWishlist,
}) => {
  const { locale, direction, t } = useI18n();
  const { brandingSettings, getSiteName } = useSettings();
  const { totalQuantity } = useCart();
  const { wishlistIds } = useWishlist();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);

  const siteName = getSiteName(locale);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (route: RouteId) => {
    onRouteChange(route);
    onClose();
  };

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={locale === 'ar' ? 'قائمة التنقل' : 'Navigation Menu'}
      className="fixed inset-0 z-50 flex lg:hidden"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1A17]/45 backdrop-blur-none transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel - Starts from start-0 with natural RTL symmetry */}
      <div
        ref={drawerRef}
        className={`
          relative w-[320px] max-w-[85vw] h-full bg-[#FAF7F2] border-e border-[#E4DED3]
          flex flex-col justify-between p-6 z-10 shadow-2xl text-start overflow-y-auto
          animate-in slide-in-from-start duration-250
        `}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-6">
          {/* Drawer Header: DAHR Wordmark + Close Button */}
          <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              aria-label={`${siteName} - ${t('nav.home')}`}
              className="flex items-center cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              {brandingSettings.logoImageUrl ? (
                <img
                  src={brandingSettings.logoImageUrl}
                  alt={siteName}
                  className="h-7 max-w-[140px] object-contain"
                />
              ) : (
                <span className="font-serif text-2xl tracking-[0.25em] font-light text-[#1C1A17]">
                  {siteName}
                </span>
              )}
            </button>

            {/* Non-directional Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t('header.closeNavigation')}
              className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] border border-[#E4DED3] rounded-[2px] bg-[#F5F1EA] cursor-pointer hover:border-[#1C1A17] transition-colors focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Utility Actions Row (Search, Wishlist, Account, Cart) */}
          <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
            {/* Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label={t('header.searchAria')}
              className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#1C1A17] hover:text-[#A98860] hover:bg-[#FAF7F2] rounded-[2px] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <Search className="w-4 h-4" />
              <span className="text-[9px] font-mono uppercase tracking-wider">{t('header.search')}</span>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`${t('wishlist.title')} (${wishlistIds.length})`}
              className="relative flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#1C1A17] hover:text-[#A98860] hover:bg-[#FAF7F2] rounded-[2px] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <div className="relative">
                <Heart className="w-4 h-4" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1.5 -end-2 w-3.5 h-3.5 bg-[#A98860] text-[#FAF7F2] rounded-full text-[8px] font-mono flex items-center justify-center font-bold">
                    {wishlistIds.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider">{t('wishlist.title')}</span>
            </button>

            {/* Account */}
            <button
              type="button"
              onClick={onOpenAccount}
              aria-label={t('header.accountAria')}
              className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#1C1A17] hover:text-[#A98860] hover:bg-[#FAF7F2] rounded-[2px] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <User className="w-4 h-4" />
              <span className="text-[9px] font-mono uppercase tracking-wider">{t('header.account')}</span>
            </button>

            {/* Cart with Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`${t('header.cartAria')} (${totalQuantity})`}
              className="relative flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#1C1A17] hover:text-[#A98860] hover:bg-[#FAF7F2] rounded-[2px] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -end-2 w-3.5 h-3.5 bg-[#1C1A17] text-[#FAF7F2] rounded-full text-[8px] font-mono flex items-center justify-center font-bold">
                    {totalQuantity}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider">{t('header.cart')}</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav aria-label={locale === 'ar' ? 'قائمة تنقل الجوال' : 'Mobile Navigation Menu'}>
            <ul className="flex flex-col divide-y divide-[#E4DED3]/60">
              {/* Home */}
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                    activeRoute === 'home'
                      ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                      : 'text-[#7A736A] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{t('nav.home')}</span>
                  <DirectionalChevronRight className="w-4 h-4 text-[#7A736A]" />
                </button>
              </li>

              {/* Shop */}
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('shop')}
                  className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                    activeRoute === 'shop'
                      ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                      : 'text-[#7A736A] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{t('nav.shop')}</span>
                  <DirectionalChevronRight className="w-4 h-4 text-[#7A736A]" />
                </button>
              </li>

              {/* Collections with Expandable Drawer Accordion */}
              <li>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setIsCollectionsExpanded((prev) => !prev)}
                    aria-expanded={isCollectionsExpanded}
                    className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                      activeRoute === 'collections'
                        ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                        : 'text-[#7A736A] hover:text-[#1C1A17]'
                    }`}
                  >
                    <span>{t('nav.collections')}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#7A736A] transition-transform duration-200 ${
                        isCollectionsExpanded ? 'rotate-180 text-[#1C1A17]' : ''
                      }`}
                    />
                  </button>

                  {/* Nested Collections List */}
                  {isCollectionsExpanded && (
                    <div className="ms-3 mb-2 ps-3 border-s border-[#E4DED3] flex flex-col gap-2 py-1">
                      {COLLECTIONS_DATA.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleNavClick('collections')}
                          className="text-start py-1 text-[12px] text-[#7A736A] hover:text-[#A98860] transition-colors cursor-pointer font-body flex items-center justify-between"
                        >
                          <span>{locale === 'ar' ? col.nameAr : col.nameEn}</span>
                          <span className="text-[10px] font-mono opacity-60">({col.count})</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleNavClick('collections')}
                        className="text-start py-1 text-[11px] font-mono uppercase text-[#A98860] hover:text-[#1C1A17] transition-colors cursor-pointer flex items-center gap-1 mt-1"
                      >
                        <span>{t('nav.viewAllCollections')}</span>
                        <DirectionalArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </li>

              {/* About */}
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('about')}
                  className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                    activeRoute === 'about'
                      ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                      : 'text-[#7A736A] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{t('nav.about')}</span>
                  <DirectionalChevronRight className="w-4 h-4 text-[#7A736A]" />
                </button>
              </li>

              {/* Journal */}
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('journal')}
                  className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                    activeRoute === 'journal'
                      ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                      : 'text-[#7A736A] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{t('nav.journal')}</span>
                  <DirectionalChevronRight className="w-4 h-4 text-[#7A736A]" />
                </button>
              </li>

              {/* Contact */}
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className={`w-full py-3 flex items-center justify-between text-start text-[12px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-body cursor-pointer transition-colors ${
                    activeRoute === 'contact'
                      ? 'text-[#1C1A17] font-semibold ps-2 border-s-2 border-[#1C1A17]'
                      : 'text-[#7A736A] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{t('nav.contact')}</span>
                  <DirectionalChevronRight className="w-4 h-4 text-[#7A736A]" />
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Section: Language Switcher & Concierge */}
        <div className="pt-6 border-t border-[#E4DED3] flex flex-col gap-4">
          {/* Language Switcher in Drawer */}
          <div className="flex items-center justify-between p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
            <span className="text-[11px] font-mono uppercase text-[#7A736A] tracking-wider">
              {t('actions.switchLocale')}
            </span>
            <LocaleSwitcher id="drawer-locale-switcher" variant="minimal" size="sm" />
          </div>

          <div className="flex flex-col gap-1 text-[11px] font-mono text-[#7A736A]">
            <span className="text-[#1C1A17] font-medium">{t('footer.supportHeading')}:</span>
            <a
              href="mailto:concierge@dahr.luxury"
              className="text-[#A98860] hover:underline"
            >
              concierge@dahr.luxury
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
