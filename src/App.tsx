import React, { useState, useEffect, Suspense, lazy } from 'react';
import { I18nProvider } from './i18n/context';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AppShell } from './layout/AppShell';
import { ToastProvider } from './components/storefront/Toast';
import { SEOHead } from './components/seo/SEOHead';
import { seedInitialFirestoreData } from './utils/seeder';
import { RouteId } from './types';
import { Loader2 } from 'lucide-react';

// Code-split major routes so Admin, Diagnostics, and Showcase are isolated
const StorefrontPublicView = lazy(() =>
  import('./routes/StorefrontPublicView').then((m) => ({ default: m.StorefrontPublicView }))
);
const AdminRouter = lazy(() =>
  import('./routes/AdminRouter').then((m) => ({ default: m.AdminRouter }))
);
const StorefrontShowcase = lazy(() =>
  import('./routes/StorefrontShowcase').then((m) => ({ default: m.StorefrontShowcase }))
);
const DiagnosticsView = lazy(() =>
  import('./routes/DiagnosticsView').then((m) => ({ default: m.DiagnosticsView }))
);

const VALID_ROUTES: RouteId[] = [
  'home',
  'shop',
  'product-detail',
  'collections',
  'about',
  'journal',
  'contact',
  'account',
  'privacy',
  'terms',
  'shipping-returns',
  'showcase-storefront',
  'showcase-admin',
  'diagnostics',
  'admin',
  'admin-login',
  'admin-dashboard',
  'admin-products',
  'admin-orders',
  'admin-journal',
  'admin-users',
  'admin-settings',
];

function resolveRouteFromPathOrHash(raw: string): RouteId | null {
  const clean = raw.replace(/^#?\/?/, '').split('?')[0].toLowerCase();
  if (!clean || clean === 'home' || clean === '/') {
    return 'home';
  }
  if (clean === 'shipping' || clean === 'shipping-policy' || clean === 'returns') {
    return 'shipping-returns';
  }
  if (clean === 'privacy-policy') {
    return 'privacy';
  }
  if (clean === 'terms-of-service') {
    return 'terms';
  }
  if (clean === 'profile' || clean === 'my-account' || clean === 'client-portal' || clean === 'login' || clean === 'signin') {
    return 'account';
  }
  if (clean === 'admin' || clean === 'admin/' || clean === 'admin/dashboard') {
    return 'admin-dashboard';
  }
  if (clean === 'admin/login' || clean === 'admin-login') {
    return 'admin-login';
  }
  if (clean === 'admin/products' || clean === 'admin-products') {
    return 'admin-products';
  }
  if (clean === 'admin/orders' || clean === 'admin-orders') {
    return 'admin-orders';
  }
  if (clean === 'admin/journal' || clean === 'admin-journal') {
    return 'admin-journal';
  }
  if (clean === 'admin/users' || clean === 'admin-users' || clean === 'admin/permissions') {
    return 'admin-users';
  }
  if (clean === 'admin/settings' || clean === 'admin-settings') {
    return 'admin-settings';
  }
  if (clean === 'admin/showcase') {
    return 'showcase-admin';
  }
  if (VALID_ROUTES.includes(clean as RouteId)) {
    return clean as RouteId;
  }
  return null;
}

const RouteFallback: React.FC = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#F5F1EA] text-[#7A736A]">
    <div className="w-10 h-10 border border-[#A98860]/40 rounded-full flex items-center justify-center animate-pulse">
      <Loader2 className="w-5 h-5 animate-spin text-[#A98860]" />
    </div>
    <span className="text-[11px] font-mono tracking-widest uppercase text-[#A98860]">
      DAHR • Haute Parfumerie
    </span>
  </div>
);

export default function App() {
  const [activeRoute, setActiveRoute] = useState<RouteId>(() => {
    if (typeof window !== 'undefined') {
      const fromHash = resolveRouteFromPathOrHash(window.location.hash);
      if (fromHash) return fromHash;
      const fromPath = resolveRouteFromPathOrHash(window.location.pathname);
      if (fromPath) return fromPath;
    }
    return 'home';
  });

  // Automatically seed initial products & journal articles if database is clean
  useEffect(() => {
    seedInitialFirestoreData().catch((err) => {
      console.warn('Firestore initial data check completed / noted:', err);
    });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const route = resolveRouteFromPathOrHash(window.location.hash);
      if (route) {
        setActiveRoute(route);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRouteChange = (route: RouteId) => {
    setActiveRoute(route);
    if (typeof window !== 'undefined') {
      // Map RouteId to pretty hash paths
      if (route === 'admin-dashboard') {
        window.location.hash = 'admin';
      } else if (route.startsWith('admin-')) {
        window.location.hash = `admin/${route.replace('admin-', '')}`;
      } else if (route === 'home') {
        // Clear hash so URL is clean root '/'
        if (window.location.hash) {
          window.history.pushState(null, '', window.location.pathname);
        }
      } else {
        window.location.hash = route;
      }
    }
  };

  const renderCurrentRoute = () => {
    // Admin routes handler
    if (
      activeRoute === 'admin' ||
      activeRoute === 'admin-login' ||
      activeRoute === 'admin-dashboard' ||
      activeRoute === 'admin-products' ||
      activeRoute === 'admin-orders' ||
      activeRoute === 'admin-journal' ||
      activeRoute === 'admin-users' ||
      activeRoute === 'admin-settings'
    ) {
      return (
        <AdminRouter
          activeRoute={activeRoute}
          onRouteChange={handleRouteChange}
        />
      );
    }

    switch (activeRoute) {
      case 'diagnostics':
        return <DiagnosticsView />;
      case 'showcase-storefront':
        return <StorefrontShowcase />;
      case 'showcase-admin':
        return (
          <AdminRouter
            activeRoute="showcase-admin"
            onRouteChange={handleRouteChange}
          />
        );
      case 'home':
      case 'shop':
      case 'product-detail':
      case 'collections':
      case 'about':
      case 'journal':
      case 'contact':
      case 'account':
      case 'privacy':
      case 'terms':
      case 'shipping-returns':
      default:
        return (
          <StorefrontPublicView
            activeRoute={activeRoute}
            onRouteChange={handleRouteChange}
          />
        );
    }
  };

  return (
    <I18nProvider>
      <SEOHead route={activeRoute} />
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <AppShell activeRoute={activeRoute} onRouteChange={handleRouteChange}>
                  <Suspense fallback={<RouteFallback />}>
                    {renderCurrentRoute()}
                  </Suspense>
                </AppShell>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
