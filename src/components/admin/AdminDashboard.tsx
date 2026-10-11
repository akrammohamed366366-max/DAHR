import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  BookOpen,
  Users,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { RouteId } from '../../types';
import { productsApi } from '../../api/productsApi';
import { ordersApi } from '../../api/ordersApi';
import { journalApi } from '../../api/journalApi';
import { adminUsersApi } from '../../api/adminUsersApi';
import { Product, Order, JournalArticle, AdminUser } from '../../types/backend';
import { RoleBadge } from './RoleBadge';
import { StatusPill } from './StatusPill';
import { DirectionalArrowRight, DirectionalChevronRight } from '../ui/DirectionalIcon';

export interface AdminDashboardProps {
  onRouteChange: (route: RouteId) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRouteChange }) => {
  const { locale, direction } = useI18n();
  const { user, role, isFullAdmin, isStaffOrAdmin } = useAuth();

  // Metrics State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadAllDashboardMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const pPromise = productsApi.getActiveProducts().catch(() => []);
      const aPromise = journalApi.getAllArticlesAdmin().catch(() => []);
      
      // Orders and Admin Users are only requested if user is fullAdmin
      const oPromise = isFullAdmin ? ordersApi.getAllOrdersAdmin().catch(() => []) : Promise.resolve([]);
      const uPromise = isFullAdmin ? adminUsersApi.listAdminUsers().catch(() => []) : Promise.resolve([]);

      const [pRes, aRes, oRes, uRes] = await Promise.all([pPromise, aPromise, oPromise, uPromise]);

      setProducts(pRes);
      setArticles(aRes);
      setOrders(oRes);
      setAdminUsers(uRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Dashboard metrics fetch error:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadAllDashboardMetrics();
  }, [isFullAdmin]);

  // Derived stats
  const activeProductsCount = products.filter((p) => p.status === 'active' || !p.status).length;
  const draftArticlesCount = articles.filter((a) => a.status === 'draft').length;
  const publishedArticlesCount = articles.filter((a) => a.status === 'published').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.status === 'confirmed').length;

  return (
    <div id="admin-dashboard-root" className="flex flex-col gap-6">
      {/* Top Banner / Welcome Strip */}
      <div className="bg-[#FAF7F2] border border-[#E4DED3] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'نظرة عامة على ورشة العمل' : 'Atelier Command Overview'}
            </span>
            <span className="text-[10px] font-mono text-[#A98860]">•</span>
            <span className="text-[10px] font-mono text-[#7A736A]">
              {locale === 'ar' ? 'تحديث:' : 'Refreshed:'}{' '}
              {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#1C1A17] mt-1">
            {locale === 'ar'
              ? `لوحة التحكم الإدارية — ${isFullAdmin ? 'كامل الصلاحيات' : 'فريق العمل'}`
              : `Admin Dashboard — ${isFullAdmin ? 'Full Administrator' : 'Staff Access'}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllDashboardMetrics}
            disabled={isLoadingMetrics}
            title={locale === 'ar' ? 'تحديث البيانات' : 'Refresh Metrics'}
            className="p-2 bg-[#F5F1EA] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
          </button>
          <RoleBadge role={role === 'fullAdmin' ? 'admin' : 'manager'} />
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Products */}
        <div
          id="stat-card-products"
          onClick={() => onRouteChange('admin-products')}
          className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 hover:border-[#1C1A17]/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
              {locale === 'ar' ? 'عطور الكتالوج' : 'Active Catalog'}
            </span>
            <div className="w-8 h-8 rounded-[2px] bg-[#A98860]/10 text-[#A98860] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-[#1C1A17]">
              {isLoadingMetrics ? '...' : activeProductsCount}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A] mt-1">
              <span>{locale === 'ar' ? 'إجمالي العطور' : 'Total Items'}</span>
              <span className="font-semibold text-[#1C1A17]">{products.length}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#A98860]">
            <span>{locale === 'ar' ? 'إدارة المنتجات' : 'Manage Catalog'}</span>
            <DirectionalChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Orders (Conditional: fullAdmin sees stats, staff sees role boundary) */}
        {isFullAdmin ? (
          <div
            id="stat-card-orders"
            onClick={() => onRouteChange('admin-orders')}
            className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 hover:border-[#1C1A17]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                {locale === 'ar' ? 'الطلبات المباشرة' : 'Client Orders'}
              </span>
              <div className="w-8 h-8 rounded-[2px] bg-[#4B5D46]/10 text-[#4B5D46] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-[#1C1A17]">
                {isLoadingMetrics ? '...' : orders.length}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A] mt-1">
                <span>{locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}</span>
                <span className="px-1.5 py-0.2 bg-[#A9772F]/10 text-[#A9772F] font-bold rounded-[2px]">
                  {pendingOrdersCount}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#4B5D46]">
              <span>{locale === 'ar' ? 'سجل الطلبات' : 'Order Ledger'}</span>
              <DirectionalChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <div
            id="stat-card-orders-restricted"
            className="p-5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 opacity-75"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                {locale === 'ar' ? 'سجل الطلبيات' : 'Orders Module'}
              </span>
              <div className="w-8 h-8 rounded-[2px] bg-[#7A736A]/10 text-[#7A736A] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold text-[#7A736A]">
                {locale === 'ar' ? 'صلاحية fullAdmin مطلوبة' : 'fullAdmin Required'}
              </div>
              <p className="text-[11px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar'
                  ? 'محجوبة عن دور فريق العمل (Staff).'
                  : 'Restricted from Staff role access.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#E4DED3] text-[10px] font-mono text-[#7A736A] uppercase">
              {locale === 'ar' ? 'أمان معماري محكم' : 'Protected Route'}
            </div>
          </div>
        )}

        {/* Card 3: Journal Articles */}
        <div
          id="stat-card-journal"
          onClick={() => onRouteChange('admin-journal')}
          className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 hover:border-[#1C1A17]/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
              {locale === 'ar' ? 'مقالات المجلة' : 'Journal CMS'}
            </span>
            <div className="w-8 h-8 rounded-[2px] bg-[#A98860]/10 text-[#A98860] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-[#1C1A17]">
              {isLoadingMetrics ? '...' : publishedArticlesCount}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A] mt-1">
              <span>{locale === 'ar' ? 'المسودات' : 'Drafts'}</span>
              <span className="font-semibold text-[#7A736A]">{draftArticlesCount}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#A98860]">
            <span>{locale === 'ar' ? 'إدارة المحتوى' : 'Edit Editorial'}</span>
            <DirectionalChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Users & Permissions (Conditional) */}
        {isFullAdmin ? (
          <div
            id="stat-card-users"
            onClick={() => onRouteChange('admin-users')}
            className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 hover:border-[#1C1A17]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                {locale === 'ar' ? 'طاقم الإدارة' : 'Admin Roster'}
              </span>
              <div className="w-8 h-8 rounded-[2px] bg-[#1C1A17]/10 text-[#1C1A17] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-[#1C1A17]">
                {isLoadingMetrics ? '...' : adminUsers.length || '1+'}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A] mt-1">
                <span>{locale === 'ar' ? 'مستويات الأدوار' : 'Role Groups'}</span>
                <span className="font-semibold text-[#1C1A17]">fullAdmin, staff</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#1C1A17]">
              <span>{locale === 'ar' ? 'إدارة الصلاحيات' : 'RBAC Permissions'}</span>
              <DirectionalChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <div
            id="stat-card-security-status"
            className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                {locale === 'ar' ? 'حالة الأمان' : 'Security Scope'}
              </span>
              <div className="w-8 h-8 rounded-[2px] bg-[#4B5D46]/10 text-[#4B5D46] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-mono text-base font-bold text-[#1C1A17]">Staff Access</div>
              <p className="text-[11px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'تحرير الكتالوج والمجلة' : 'Catalog & Journal Editorial'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#E4DED3] text-[10px] font-mono text-[#4B5D46] uppercase">
              {locale === 'ar' ? 'مصرح بالعمل' : 'Session Active'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Launchpad & Catalog Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Catalog Fragrance Quick Overview */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E4DED3] p-5 rounded-[2px] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#A98860]" />
              <h2 className="font-serif text-base text-[#1C1A17]">
                {locale === 'ar' ? 'نظرة سريعة على كتالوج العطور' : 'Catalog Overview'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onRouteChange('admin-products')}
              className="text-xs font-mono text-[#A98860] hover:text-[#1C1A17] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{locale === 'ar' ? 'عرض الكل' : 'Open Products Module'}</span>
              <DirectionalChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#E4DED3]">
            {products.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="font-bold text-[#1C1A17]">{p.sku || p.id}</span>
                  <span className="truncate text-[#7A736A]">
                    {locale === 'ar' ? p.name?.ar || p.name?.en : p.name?.en}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#7A736A]">
                    {p.scentFamily || 'Oriental'}
                  </span>
                  <span className="px-2 py-0.5 bg-[#4B5D46]/10 text-[#4B5D46] text-[10px] rounded-[2px]">
                    {p.status || 'active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Admin Shortcuts & System Info */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Shortcuts */}
          <div className="bg-[#FAF7F2] border border-[#E4DED3] p-5 rounded-[2px] flex flex-col gap-3">
            <h2 className="font-serif text-base text-[#1C1A17] border-b border-[#E4DED3] pb-2">
              {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h2>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onRouteChange('admin-products')}
                className="w-full p-2.5 bg-[#F5F1EA] hover:bg-[#E4DED3] border border-[#E4DED3] text-[#1C1A17] rounded-[2px] text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'إدارة كتالوج العطور' : 'Manage Products'}</span>
                </div>
                <DirectionalChevronRight className="w-3.5 h-3.5 text-[#7A736A]" />
              </button>

              <button
                type="button"
                onClick={() => onRouteChange('admin-journal')}
                className="w-full p-2.5 bg-[#F5F1EA] hover:bg-[#E4DED3] border border-[#E4DED3] text-[#1C1A17] rounded-[2px] text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'تحرير مقالات المجلة' : 'Edit Journal Articles'}</span>
                </div>
                <DirectionalChevronRight className="w-3.5 h-3.5 text-[#7A736A]" />
              </button>

              {isFullAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onRouteChange('admin-orders')}
                    className="w-full p-2.5 bg-[#F5F1EA] hover:bg-[#E4DED3] border border-[#E4DED3] text-[#1C1A17] rounded-[2px] text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3.5 h-3.5 text-[#4B5D46]" />
                      <span>{locale === 'ar' ? 'متابعة وفحص الطلبات' : 'Review Orders'}</span>
                    </div>
                    <DirectionalChevronRight className="w-3.5 h-3.5 text-[#7A736A]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRouteChange('admin-users')}
                    className="w-full p-2.5 bg-[#F5F1EA] hover:bg-[#E4DED3] border border-[#E4DED3] text-[#1C1A17] rounded-[2px] text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#1C1A17]" />
                      <span>{locale === 'ar' ? 'إدارة المستخدمين والأدوار' : 'Users & Permissions'}</span>
                    </div>
                    <DirectionalChevronRight className="w-3.5 h-3.5 text-[#7A736A]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* System & Cloud Environment Status */}
          <div className="bg-[#FAF7F2] border border-[#E4DED3] p-4 rounded-[2px] flex flex-col gap-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-1.5">
              <span className="text-[#7A736A]">{locale === 'ar' ? 'المستخدم:' : 'User:'}</span>
              <span className="font-medium text-[#1C1A17] truncate max-w-[180px]">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-1.5">
              <span className="text-[#7A736A]">{locale === 'ar' ? 'قاعدة البيانات:' : 'Firestore DB:'}</span>
              <span className="text-[#4B5D46] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4B5D46]"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7A736A]">{locale === 'ar' ? 'التوجيه المحمي:' : 'Route Protection:'}</span>
              <span className="text-[#A98860] font-semibold">Active Guard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
