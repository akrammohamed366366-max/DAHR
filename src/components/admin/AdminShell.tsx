import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BookOpen,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  Globe,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Lock,
  Layers,
  Sparkles,
  Sliders,
  Store,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { RouteId } from '../../types';
import { RoleBadge } from './RoleBadge';
import { SidebarNavItem } from './SidebarNavItem';
import { AdminAccessDenied } from './AdminAccessDenied';
import { AdminLogin } from './AdminLogin';
import { DirectionalChevronRight, DirectionalArrowRight } from '../ui/DirectionalIcon';
import { AdminLanguageToggle } from './AdminLanguageToggle';

export interface AdminShellProps {
  activeAdminRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  children: React.ReactNode;
}

interface NavMenuItem {
  id: RouteId;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
  requiresFullAdmin?: boolean;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  activeAdminRoute,
  onRouteChange,
  children,
}) => {
  const { locale, direction, setLocale } = useI18n();
  const { user, role, isFullAdmin, isStaffOrAdmin, loading, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = direction === 'rtl';

  // Navigation Items definitions with strict RBAC requirements
  const ALL_NAV_ITEMS: NavMenuItem[] = [
    {
      id: 'admin-dashboard',
      labelEn: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'admin-products',
      labelEn: 'Products Catalog',
      labelAr: 'كتالوج المنتجات',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'admin-orders',
      labelEn: 'Orders & Fulfillment',
      labelAr: 'الطلبات والشحن',
      icon: <ShoppingCart className="w-4 h-4" />,
      requiresFullAdmin: true,
    },
    {
      id: 'admin-journal',
      labelEn: 'Journal CMS',
      labelAr: 'مقالات المجلة',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'admin-users',
      labelEn: 'Users & Permissions',
      labelAr: 'المستخدمون والصلاحيات',
      icon: <Users className="w-4 h-4" />,
      requiresFullAdmin: true,
    },
    {
      id: 'admin-settings',
      labelEn: 'Site Settings',
      labelAr: 'إعدادات الموقع',
      icon: <Sliders className="w-4 h-4" />,
      requiresFullAdmin: true,
    },
  ];

  // Filter navigation items based on current role (defense in depth on UI level)
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.requiresFullAdmin) {
      return isFullAdmin;
    }
    return true;
  });

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeAdminRoute]);

  // 1. Loading State Guard
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center text-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-6 h-6 border-2 border-[#A98860] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[#9B9488]">
            {locale === 'ar' ? 'جارٍ التحقق من الصلاحيات الإدارية...' : 'Authenticating atelier security session...'}
          </span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Visitor Guard (Redirect to Admin Login)
  if (!user) {
    return <AdminLogin onRouteChange={onRouteChange} targetAdminRoute={activeAdminRoute} />;
  }

  // 3. Authenticated Non-Admin User Guard (Customer with no adminUsers entry)
  if (!isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-[#141312] text-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1C1A17] border border-[#8C3B2E]/40 p-8 rounded-[2px] text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#8C3B2E]/20 border border-[#8C3B2E]/50 flex items-center justify-center text-[#8C3B2E]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C3B2E]">
              {locale === 'ar' ? 'وصول مرفوض (403)' : 'Permission Denied (HTTP 403)'}
            </span>
            <h1 className="text-xl font-serif text-[#FAF7F2] mt-1">
              {locale === 'ar' ? 'حساب غير مصرح له بالإدارة' : 'Not an Atelier Administrator'}
            </h1>
            <p className="text-xs font-mono text-[#9B9488] mt-2">
              {locale === 'ar'
                ? `الحساب (${user.email}) مسجل كعميل متجر ولا يملك صلاحيات وصول إدارية.`
                : `The account (${user.email}) is a client profile and lacks administrative credentials in adminUsers.`}
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="flex-1 py-2.5 px-4 bg-[#8C3B2E] hover:bg-[#702E24] text-[#FAF7F2] font-mono text-xs uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors"
            >
              {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
            <button
              type="button"
              onClick={() => onRouteChange('home')}
              className="py-2.5 px-4 bg-[#2A2723] hover:bg-[#3E3A34] text-[#FAF7F2] border border-[#3E3A34] font-mono text-xs uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors"
            >
              {locale === 'ar' ? 'المتجر' : 'Storefront'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Defense-in-Depth Route Guard: Reject Staff attempting to access Orders, Users, or Site Settings
  const isTargetingRestrictedRoute =
    !isFullAdmin &&
    (activeAdminRoute === 'admin-orders' ||
      activeAdminRoute === 'admin-users' ||
      activeAdminRoute === 'admin-settings');

  // Breadcrumb Title resolver
  const getRouteTitle = (route: RouteId) => {
    switch (route) {
      case 'admin-products':
        return locale === 'ar' ? 'كتالوج المنتجات' : 'Products Catalog';
      case 'admin-orders':
        return locale === 'ar' ? 'الطلبات والشحن' : 'Orders & Fulfillment';
      case 'admin-journal':
        return locale === 'ar' ? 'مقالات المجلة' : 'Journal CMS';
      case 'admin-users':
        return locale === 'ar' ? 'المستخدمون والصلاحيات' : 'Users & Permissions';
      case 'admin-settings':
        return locale === 'ar' ? 'إعدادات الموقع' : 'Site Settings';
      case 'showcase-admin':
        return locale === 'ar' ? 'مكتبة المكونات' : 'Component Showcase';
      case 'admin':
      case 'admin-dashboard':
      default:
        return locale === 'ar' ? 'لوحة التحكم' : 'Dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onRouteChange('admin-login');
  };

  return (
    <div id="admin-shell-root" className="min-h-screen bg-[#F5F1EA] text-[#1C1A17] flex flex-col font-body">
      {/* Dense Master Admin Header */}
      <header
        id="admin-topbar"
        className="h-14 bg-[#1C1A17] text-[#FAF7F2] border-b border-[#2E2B26] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0"
      >
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            id="admin-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={locale === 'ar' ? 'فتح قائمة الإدارة' : 'Toggle Admin Navigation'}
            className="md:hidden p-1.5 text-[#FAF7F2] hover:bg-[#2A2723] rounded-[2px] transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            id="admin-topbar-brand"
            onClick={() => onRouteChange('admin-dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none"
          >
            <div className="w-6 h-6 bg-[#A98860] text-[#1C1A17] flex items-center justify-center font-serif font-bold text-xs rounded-[2px]">
              D
            </div>
            <span className="font-serif tracking-widest text-sm font-semibold text-[#FAF7F2] hidden sm:inline">
              DAHR ATELIER
            </span>
            <span
              id="admin-topbar-badge"
              className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-[#2A2723] text-[#A98860] border border-[#3E3A34] rounded-[2px]"
            >
              ADMIN
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2E2B26] hidden sm:block" />

          {/* Back to Storefront Link / Button (Placed directly after ADMIN badge) */}
          <button
            type="button"
            id="admin-back-to-storefront-btn"
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.hash) {
                window.history.pushState(null, '', window.location.pathname);
              }
              onRouteChange('home');
            }}
            title={locale === 'ar' ? 'عرض المتجر' : 'Back to Storefront'}
            aria-label={locale === 'ar' ? 'عرض المتجر' : 'Back to Storefront'}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#2A2723] hover:bg-[#3E3A34] text-[#FAF7F2] hover:text-[#A98860] text-[11px] font-mono rounded-[2px] border border-[#3E3A34] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860]"
          >
            <Store className="w-3.5 h-3.5 text-[#A98860] shrink-0" />
            <span className="hidden sm:inline font-mono tracking-wider whitespace-nowrap">
              {locale === 'ar' ? 'عرض المتجر' : 'Back to Storefront'}
            </span>
          </button>
        </div>

        {/* Right: Account avatar and Sign Out icon — strictly nothing else */}
        <div className="flex items-center gap-3">
          {/* Account Avatar */}
          <div
            id="admin-account-avatar"
            title={user.displayName || user.email || 'Admin'}
            className="w-7 h-7 rounded-full bg-[#2A2723] border border-[#3E3A34] flex items-center justify-center text-xs font-mono font-medium text-[#FAF7F2] select-none"
          >
            {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            id="admin-signout-btn"
            onClick={handleSignOut}
            title={locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            aria-label={locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            className="p-1.5 text-[#E68A7E] hover:text-[#FAF7F2] hover:bg-[#8C3B2E]/20 rounded-[2px] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Secondary/Inner Status & Context Toolbar Row */}
      <div
        id="admin-inner-toolbar"
        className="bg-[#FAF7F2] border-b border-[#E4DED3] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono select-none shrink-0"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
            {getRouteTitle(activeAdminRoute)}
          </span>
          <span className="text-[#E4DED3] hidden sm:inline">•</span>
          <span
            id="admin-inner-fulladmin-badge"
            className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#A98860]/10 text-[#A98860] border border-[#A98860]/30 rounded-[2px]"
          >
            {role === 'fullAdmin' ? 'FULLADMIN' : 'STAFF'}
          </span>
          <span
            id="admin-inner-firestore-badge"
            className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#4B5D46]/10 text-[#4B5D46] border border-[#4B5D46]/30 rounded-[2px] inline-flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4B5D46]" />
            LIVE FIRESTORE
          </span>
        </div>

        {/* Compact EN / AR Language Toggle */}
        <AdminLanguageToggle id="admin-inner-language-toggle" />
      </div>

      {/* Main Admin Body: Fixed Sidebar + Scrollable Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Navigation Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          id="admin-sidebar"
          className={`
            fixed md:static inset-y-0 start-0 z-30 w-64 bg-[#FAF7F2] border-e border-[#E4DED3]
            flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out shrink-0
            ${isMobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex flex-col gap-6">
            {/* User Details in Sidebar (Mobile / Compact) */}
            <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center justify-between">
              <div className="truncate">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A] block">
                  {locale === 'ar' ? 'صلاحية الحساب' : 'Security Scope'}
                </span>
                <span className="text-xs font-mono font-bold text-[#1C1A17] truncate block">
                  {user.email}
                </span>
              </div>
              <RoleBadge role={role === 'fullAdmin' ? 'admin' : 'manager'} />
            </div>

            {/* Main Navigation Items */}
            <nav aria-label={locale === 'ar' ? 'لوحة التنقل الإدارية' : 'Admin Navigation'} className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A] px-3.5 mb-1 block">
                {locale === 'ar' ? 'الوحدات الإدارية' : 'Management Modules'}
              </span>

              {visibleNavItems.map((item) => {
                const isActive =
                  activeAdminRoute === item.id ||
                  (item.id === 'admin-dashboard' && activeAdminRoute === 'admin');

                return (
                  <SidebarNavItem
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    icon={item.icon}
                    label={locale === 'ar' ? item.labelAr : item.labelEn}
                    isActive={isActive}
                    onClick={() => onRouteChange(item.id)}
                  />
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Info */}
          <div className="pt-4 border-t border-[#E4DED3] flex flex-col gap-2 text-[11px] font-mono text-[#7A736A]">
            <div className="flex items-center justify-between">
              <span>DAHR Admin Core</span>
              <span className="px-1.5 py-0.2 bg-[#4B5D46]/10 text-[#4B5D46] font-semibold rounded-[2px]">
                RBAC v2
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRouteChange('home')}
              className="md:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1C1A17] text-[#FAF7F2] rounded-[2px] mt-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'العودة للمتجر' : 'Public Storefront'}</span>
            </button>
          </div>
        </aside>

        {/* Scrollable Main Admin Content Workspace */}
        <main
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none"
        >
          {/* Defense in depth role rejection */}
          {isTargetingRestrictedRoute ? (
            <AdminAccessDenied
              requiredRole="fullAdmin"
              attemptedModule={getRouteTitle(activeAdminRoute)}
              onRouteChange={onRouteChange}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
