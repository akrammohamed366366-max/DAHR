import React, { useState } from 'react';
import { Menu, Search, User, ShoppingBag, Heart, Shield } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { BRAND_NAME } from '../i18n/config';
import { LocaleSwitcher } from '../components/ui/LocaleSwitcher';
import { CollectionsDropdown } from '../components/storefront/CollectionsDropdown';
import { SearchDrawer } from '../components/storefront/SearchDrawer';
import { CartDrawer } from '../components/storefront/CartDrawer';
import { WishlistDrawer } from '../components/storefront/WishlistDrawer';
import { AccountModal } from '../components/storefront/AccountModal';
import { MobileDrawer } from './MobileDrawer';
import { RouteId } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeRoute, onRouteChange, onNavigateToProduct }) => {
  const { locale, t } = useI18n();
  const { user, isStaffOrAdmin } = useAuth();
  const { brandingSettings, getSiteName } = useSettings();
  const { isOpen: isCartOpen, openCart, closeCart, totalQuantity } = useCart();
  const { wishlistIds } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const siteName = getSiteName(locale);

  // Primary navigation items requested
  const primaryNavItems: { id: RouteId; labelKey: string }[] = [
    { id: 'home', labelKey: 'nav.home' },
    { id: 'shop', labelKey: 'nav.shop' },
    // Collections is rendered via CollectionsDropdown
    { id: 'about', labelKey: 'nav.about' },
    { id: 'journal', labelKey: 'nav.journal' },
    { id: 'contact', labelKey: 'nav.contact' },
  ];

  return (
    <>
      <header
        id="app-header"
        role="banner"
        className="h-20 bg-[#FAF7F2] border-b border-[#E4DED3] px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-40"
      >
        {/* Left / Start Zone: Mobile Hamburger + DAHR Wordmark */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Mobile Single Hamburger Button — ONLY one navigation control on mobile */}
          <button
            id="mobile-drawer-toggle"
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label={t('header.openNavigation')}
            aria-expanded={isMobileDrawerOpen}
            aria-controls="mobile-navigation-drawer"
            className="p-2 -ms-2 text-[#1C1A17] hover:text-[#A98860] lg:hidden cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none transition-colors rounded-[2px]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Wordmark or Custom Logo */}
          <button
            id="brand-wordmark"
            type="button"
            onClick={() => onRouteChange('home')}
            aria-label={`${siteName} - ${t('nav.home')}`}
            className="flex items-center cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none transition-opacity hover:opacity-85"
          >
            {brandingSettings.logoImageUrl ? (
              <img
                src={brandingSettings.logoImageUrl}
                alt={siteName}
                className="h-8 sm:h-9 max-w-[160px] sm:max-w-[200px] object-contain"
              />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-light text-[#1C1A17]">
                {siteName}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-[#E4DED3] hidden xl:block" />

          {/* Subdued Brand Tagline */}
          <span className="text-[10px] uppercase tracking-[0.2em] [dir=rtl]:tracking-normal text-[#7A736A] hidden xl:inline-block font-mono">
            {t('header.tagline')}
          </span>
        </div>

        {/* Center Zone: Desktop Primary Navigation */}
        <nav
          id="primary-desktop-nav"
          aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Primary Navigation'}
          className="hidden lg:flex items-center"
        >
          <ul className="flex items-center gap-4 xl:gap-7 text-[11px] uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case text-[#7A736A] font-medium font-body">
            {/* Home */}
            <li>
              <button
                id="nav-home"
                type="button"
                onClick={() => onRouteChange('home')}
                aria-current={activeRoute === 'home' ? 'page' : undefined}
                className={`cursor-pointer transition-colors py-1 px-2 rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                  activeRoute === 'home'
                    ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
                    : 'hover:text-[#1C1A17]'
                }`}
              >
                {t('nav.home')}
              </button>
            </li>

            {/* Shop */}
            <li>
              <button
                id="nav-shop"
                type="button"
                onClick={() => onRouteChange('shop')}
                aria-current={activeRoute === 'shop' ? 'page' : undefined}
                className={`cursor-pointer transition-colors py-1 px-2 rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                  activeRoute === 'shop'
                    ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
                    : 'hover:text-[#1C1A17]'
                }`}
              >
                {t('nav.shop')}
              </button>
            </li>

            {/* Collections with Dropdown */}
            <li>
              <CollectionsDropdown
                activeRoute={activeRoute}
                onRouteChange={onRouteChange}
              />
            </li>

            {/* About */}
            <li>
              <button
                id="nav-about"
                type="button"
                onClick={() => onRouteChange('about')}
                aria-current={activeRoute === 'about' ? 'page' : undefined}
                className={`cursor-pointer transition-colors py-1 px-2 rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                  activeRoute === 'about'
                    ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
                    : 'hover:text-[#1C1A17]'
                }`}
              >
                {t('nav.about')}
              </button>
            </li>

            {/* Journal */}
            <li>
              <button
                id="nav-journal"
                type="button"
                onClick={() => onRouteChange('journal')}
                aria-current={activeRoute === 'journal' ? 'page' : undefined}
                className={`cursor-pointer transition-colors py-1 px-2 rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                  activeRoute === 'journal'
                    ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
                    : 'hover:text-[#1C1A17]'
                }`}
              >
                {t('nav.journal')}
              </button>
            </li>

            {/* Contact */}
            <li>
              <button
                id="nav-contact"
                type="button"
                onClick={() => onRouteChange('contact')}
                aria-current={activeRoute === 'contact' ? 'page' : undefined}
                className={`cursor-pointer transition-colors py-1 px-2 rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                  activeRoute === 'contact'
                    ? 'text-[#1C1A17] font-semibold border-b-2 border-[#1C1A17]'
                    : 'hover:text-[#1C1A17]'
                }`}
              >
                {t('nav.contact')}
              </button>
            </li>
          </ul>
        </nav>

        {/* Right / End Zone: Utility Icons & Language Switcher (Visually Quiet Cluster) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Icon Button */}
          <button
            id="utility-search-button"
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label={t('header.searchAria')}
            title={t('header.search')}
            className="p-2 text-[#1C1A17] hover:text-[#A98860] transition-colors cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Wishlist Heart Icon Button */}
          <button
            id="utility-wishlist-button"
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            aria-label={`${t('wishlist.title')} (${wishlistIds.length})`}
            title={t('wishlist.title')}
            className="relative p-2 text-[#1C1A17] hover:text-[#A98860] transition-colors cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
          >
            <Heart className="w-[18px] h-[18px]" />
            {wishlistIds.length > 0 && (
              <span
                id="wishlist-count-badge"
                className="absolute top-1 end-1 w-4 h-4 bg-[#A98860] text-[#FAF7F2] rounded-full text-[9px] font-mono flex items-center justify-center font-medium leading-none"
              >
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Client Account Icon Button */}
          <button
            id="utility-account-button"
            type="button"
            onClick={() => onRouteChange('account')}
            aria-label={t('header.accountAria')}
            title={t('header.account')}
            className={`p-2 transition-colors cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
              activeRoute === 'account'
                ? 'text-[#A98860]'
                : 'text-[#1C1A17] hover:text-[#A98860]'
            }`}
          >
            <User className="w-[18px] h-[18px]" />
          </button>

          {/* Discreet Admin Panel Link (Strictly rendered for authenticated active staff or fullAdmin only) */}
          {user && isStaffOrAdmin && (
            <button
              id="utility-admin-button"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.hash = 'admin';
                }
                onRouteChange('admin-dashboard');
              }}
              aria-label={locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              title={locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              className={`p-2 transition-colors cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none ${
                activeRoute.startsWith('admin')
                  ? 'text-[#A98860]'
                  : 'text-[#1C1A17] hover:text-[#A98860]'
              }`}
            >
              <Shield className="w-[18px] h-[18px]" />
              <span className="sr-only">{locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</span>
            </button>
          )}

          {/* Shopping Bag Icon Button with Badge */}
          <button
            id="utility-cart-button"
            type="button"
            onClick={openCart}
            aria-label={`${t('header.cartAria')} (${totalQuantity})`}
            title={t('header.cart')}
            className="relative p-2 text-[#1C1A17] hover:text-[#A98860] transition-colors cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            {/* Bag Item Count Badge */}
            {totalQuantity > 0 && (
              <span
                id="cart-count-badge"
                className="absolute top-1 end-1 w-4 h-4 bg-[#1C1A17] text-[#FAF7F2] rounded-full text-[9px] font-mono flex items-center justify-center font-medium leading-none"
              >
                {totalQuantity}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-[#E4DED3] mx-1" />

          {/* Discreet Text-Based Language Switcher ("EN / AR" — strictly no flags) */}
          <LocaleSwitcher id="header-locale-switcher" variant="minimal" size="sm" />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeRoute={activeRoute}
        onRouteChange={onRouteChange}
        onOpenSearch={() => {
          setIsMobileDrawerOpen(false);
          setIsSearchOpen(true);
        }}
        onOpenAccount={() => {
          setIsMobileDrawerOpen(false);
          onRouteChange('account');
        }}
        onOpenCart={() => {
          setIsMobileDrawerOpen(false);
          openCart();
        }}
        onOpenWishlist={() => {
          setIsMobileDrawerOpen(false);
          setIsWishlistOpen(true);
        }}
      />

      {/* Interactive Search Overlay */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onRouteChange={onRouteChange}
        onNavigateToProduct={onNavigateToProduct}
      />

      {/* Interactive Cart Slideout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        onRouteChange={onRouteChange}
        onNavigateToProduct={onNavigateToProduct}
      />

      {/* Interactive Wishlist Slideout Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onRouteChange={onRouteChange}
        onNavigateToProduct={onNavigateToProduct}
      />

      {/* Interactive Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onRouteChange={onRouteChange}
      />
    </>
  );
};
