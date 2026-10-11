import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteId } from '../types';
import { useI18n } from '../i18n/context';

interface AppShellProps {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeRoute,
  onRouteChange,
  onNavigateToProduct,
  children,
}) => {
  const { locale } = useI18n();
  const isAdminRoute = activeRoute.startsWith('admin') || activeRoute === 'showcase-admin';

  if (isAdminRoute) {
    return (
      <div
        id="admin-app-shell"
        className="min-h-screen flex flex-col bg-[#F5F1EA] text-[#1C1A17] antialiased selection:bg-[#A98860]/20 selection:text-[#1C1A17]"
      >
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1C1A17] focus:text-[#FAF7F2] focus:border focus:border-[#A98860] focus:rounded-[2px] focus:shadow-xl focus:outline-none focus:text-xs focus:font-mono focus:tracking-wider"
        >
          {locale === 'ar' ? 'الانتقال إلى المحتوى الإداري الرئيسي' : 'Skip to primary administrative content'}
        </a>
        {children}
      </div>
    );
  }

  const isFullBleed = activeRoute === 'home' || activeRoute === 'about';

  const handleNavigateToProduct = (productId: string) => {
    if (onNavigateToProduct) {
      onNavigateToProduct(productId);
    } else {
      if (typeof window !== 'undefined') {
        window.location.hash = `product-detail?id=${productId}`;
      }
      onRouteChange('product-detail');
    }
  };

  return (
    <div
      id="app-shell"
      className="min-h-screen flex flex-col bg-[#F5F1EA] text-[#1C1A17] antialiased selection:bg-[#A98860]/20 selection:text-[#1C1A17]"
    >
      <a
        href="#app-viewport"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1C1A17] focus:text-[#FAF7F2] focus:border focus:border-[#A98860] focus:rounded-[2px] focus:shadow-xl focus:outline-none focus:text-xs focus:font-mono focus:tracking-wider"
      >
        {locale === 'ar' ? 'الانتقال إلى المحتوى الرئيسي للمتجر' : 'Skip to main storefront content'}
      </a>
      <Header
        activeRoute={activeRoute}
        onRouteChange={onRouteChange}
        onNavigateToProduct={handleNavigateToProduct}
      />
      <main
        id="app-viewport"
        tabIndex={-1}
        className={`flex-1 flex flex-col w-full mx-auto pb-16 outline-none ${
          isFullBleed
            ? 'pt-0'
            : 'max-w-[1520px] px-4 sm:px-8 lg:px-16 pt-8'
        }`}
      >
        {children}
      </main>
      <Footer onRouteChange={onRouteChange} />
    </div>
  );
};
