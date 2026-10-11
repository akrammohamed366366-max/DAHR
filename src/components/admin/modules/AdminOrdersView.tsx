import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Package,
  Layers,
  Sparkles,
  User,
  SlidersHorizontal,
  X,
  PlusCircle,
} from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { useAuth } from '../../../context/AuthContext';
import { ordersApi } from '../../../api/ordersApi';
import { Order, OrderStatus } from '../../../types/backend';
import { formatPrice } from '../../../i18n/formatters';
import { StatusPill } from '../StatusPill';
import { RouteId, AdminStatus } from '../../../types';
import { AdminAccessDenied } from '../AdminAccessDenied';
import { OrderDetailView } from './OrderDetailView';

export interface AdminOrdersViewProps {
  onRouteChange: (route: RouteId) => void;
}

type SortField = 'date' | 'id' | 'customer' | 'items' | 'subtotal' | 'status';
type SortDirection = 'asc' | 'desc';

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ onRouteChange }) => {
  const { locale, direction } = useI18n();
  const { isFullAdmin, role, user } = useAuth();
  const isRTL = direction === 'rtl';

  // Master Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Orders from Firestore (fullAdmin only)
  const fetchOrders = async (forceRefresh = false) => {
    if (!isFullAdmin) return;
    setIsLoading(true);
    try {
      const data = await ordersApi.getAllOrdersAdmin(forceRefresh);
      setOrders(data || []);
      // If currently selected order exists, update its reference
      if (selectedOrder) {
        const updated = (data || []).find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      console.error('Failed to load orders in admin view:', err);
      setNotification({
        type: 'error',
        message: locale === 'ar' ? 'تعذر استرجاع سجل الطلبات.' : 'Failed to retrieve master orders ledger.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFullAdmin) {
      fetchOrders();
    }
  }, [isFullAdmin]);

  // If not fullAdmin, block with AdminAccessDenied
  if (!isFullAdmin) {
    return (
      <AdminAccessDenied
        requiredRole="fullAdmin"
        attemptedModule={locale === 'ar' ? 'الطلبات والشحن' : 'Orders & Fulfillment'}
        onRouteChange={onRouteChange}
      />
    );
  }

  // Handle Status Update
  const handleStatusChange = async (newStatus: OrderStatus, note?: string) => {
    if (!selectedOrder) return;
    setIsUpdatingOrder(true);
    try {
      const historyEntry = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes: note || (locale === 'ar' ? `تم تغيير الحالة إلى ${newStatus}` : `Status updated to ${newStatus}`),
        updatedBy: user?.displayName || user?.email || 'fullAdmin',
      };

      await ordersApi.updateOrderStatus(selectedOrder.id, newStatus, undefined, historyEntry);

      // Update local state immediately
      const updatedOrder: Order = {
        ...selectedOrder,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [...(selectedOrder.statusHistory || []), historyEntry],
      };

      setSelectedOrder(updatedOrder);
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));

      setNotification({
        type: 'success',
        message:
          locale === 'ar'
            ? `تم تحديث حالة الطلب #${selectedOrder.id} إلى "${newStatus}" بنجاح.`
            : `Order #${selectedOrder.id} status updated to "${newStatus}".`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setNotification({
        type: 'error',
        message: locale === 'ar' ? 'فشل تحديث حالة الطلب في قاعدة البيانات.' : 'Failed to update order status.',
      });
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Handle Internal Notes Update
  const handleSaveNotes = async (notes: string) => {
    if (!selectedOrder) return;
    try {
      await ordersApi.updateInternalNotes(selectedOrder.id, notes);
      const updated: Order = {
        ...selectedOrder,
        internalNotes: notes,
        updatedAt: new Date().toISOString(),
      };
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: any) {
      console.error('Failed to save internal notes:', err);
      throw err;
    }
  };

  // Seed Demo Orders helper (if 0 orders in Firestore)
  const handleSeedSampleOrders = async () => {
    setIsLoading(true);
    try {
      const sampleOrders: Order[] = [
        {
          id: `ORD-${Date.now().toString().slice(-6)}-A`,
          customer: {
            uid: null,
            name: 'Sarah Al-Mansoor',
            email: 'sarah.mansoor@example.com',
            phone: '+971 50 123 4567',
            address: {
              line1: 'Villa 14, Al Safa 2',
              line2: 'Jumeirah District',
              city: 'Dubai',
              country: 'United Arab Emirates',
              postalCode: '00000',
            },
          },
          items: [
            {
              productId: 'prod-oud-al-waqt',
              name: { en: 'Oud Al-Waqt (Time & Agarwood)', ar: 'عود الوقت' },
              size: '100ml / 3.4 fl oz',
              qty: 1,
              price: 340,
            },
            {
              productId: 'prod-taif-dawn',
              name: { en: 'Taif Dawn Rose', ar: 'ورد الطائف فجراً' },
              size: '50ml / 1.7 fl oz',
              qty: 1,
              price: 210,
            },
          ],
          subtotal: 550,
          totalAmount: 550,
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          internalNotes: 'VIP Concierge: Customer requested handwritten gift card in gold ink.',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
              notes: 'Order placed via Web Storefront Concierge',
              updatedBy: 'Storefront',
            },
          ],
        },
        {
          id: `ORD-${(Date.now() - 50000).toString().slice(-6)}-B`,
          customer: {
            uid: 'usr-vip-982',
            name: 'Tariq Bin Ziyad',
            email: 'tariq.z@example.com',
            phone: '+966 55 987 6543',
            address: {
              line1: 'King Fahd Road, Tower 4, Apt 1802',
              city: 'Riyadh',
              country: 'Saudi Arabia',
              postalCode: '11564',
            },
          },
          items: [
            {
              productId: 'prod-oud-al-waqt',
              name: { en: 'Oud Al-Waqt (Time & Agarwood)', ar: 'عود الوقت' },
              size: '100ml / 3.4 fl oz',
              qty: 2,
              price: 340,
            },
          ],
          subtotal: 680,
          totalAmount: 680,
          status: 'processing',
          createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
          internalNotes: 'Packaged in signature black-lacquer presentation chest.',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
              notes: 'Order placed',
              updatedBy: 'Storefront',
            },
            {
              status: 'processing',
              timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
              notes: 'Flacons inspected and packaged in atelier chest',
              updatedBy: 'fullAdmin',
            },
          ],
        },
        {
          id: `ORD-${(Date.now() - 100000).toString().slice(-6)}-C`,
          customer: {
            uid: 'usr-vip-412',
            name: 'Elena Rostova',
            email: 'elena.rostova@example.com',
            phone: '+44 20 7946 0912',
            address: {
              line1: '42 Berkeley Square',
              line2: 'Mayfair',
              city: 'London',
              country: 'United Kingdom',
              postalCode: 'W1J 5AW',
            },
          },
          items: [
            {
              productId: 'prod-taif-dawn',
              name: { en: 'Taif Dawn Rose', ar: 'ورد الطائف فجراً' },
              size: '50ml / 1.7 fl oz',
              qty: 1,
              price: 210,
            },
          ],
          subtotal: 210,
          totalAmount: 210,
          status: 'shipped',
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          internalNotes: 'Dispatched via DHL Express #DHL-98402941. Tracking notified.',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
              notes: 'Order placed',
              updatedBy: 'Storefront',
            },
            {
              status: 'processing',
              timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
              notes: 'Formulation bottled and boxed',
              updatedBy: 'fullAdmin',
            },
            {
              status: 'shipped',
              timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
              notes: 'Dispatched with DHL Express (AWB: DHL-98402941)',
              updatedBy: 'fullAdmin',
            },
          ],
        },
      ];

      for (const ord of sampleOrders) {
        await ordersApi.createOrder(ord);
      }

      await fetchOrders();
      setNotification({
        type: 'success',
        message: locale === 'ar' ? 'تم إنشاء عينات طلبات تجريبية بنجاح!' : 'Seeded sample luxury atelier orders!',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error('Failed to seed sample orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Metrics Counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtering & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Status filter
      if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false;
      }

      // 2. Search query filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.customer?.name && o.customer.name.toLowerCase().includes(q);
        const emailMatch = o.customer?.email && o.customer.email.toLowerCase().includes(q);
        const phoneMatch = o.customer?.phone && o.customer.phone.toLowerCase().includes(q);
        const cityMatch = o.customer?.address?.city && o.customer.address.city.toLowerCase().includes(q);
        const countryMatch = o.customer?.address?.country && o.customer.address.country.toLowerCase().includes(q);
        const itemMatch = o.items?.some(
          (it) =>
            (it.name?.en && it.name.en.toLowerCase().includes(q)) ||
            (it.name?.ar && it.name.ar.toLowerCase().includes(q))
        );

        if (!idMatch && !nameMatch && !emailMatch && !phoneMatch && !cityMatch && !countryMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, search]);

  // Sorting
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'customer':
          comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '');
          break;
        case 'items': {
          const countA = a.items?.reduce((sum, it) => sum + (it.qty || 1), 0) || 0;
          const countB = b.items?.reduce((sum, it) => sum + (it.qty || 1), 0) || 0;
          comparison = countA - countB;
          break;
        }
        case 'subtotal':
          comparison = (a.totalAmount || a.subtotal) - (b.totalAmount || b.subtotal);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredOrders, sortField, sortDirection]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case 'processing':
        return locale === 'ar' ? 'قيد التجهيز' : 'Processing';
      case 'shipped':
        return locale === 'ar' ? 'تم الشحن' : 'Shipped';
      case 'delivered':
        return locale === 'ar' ? 'تم التسليم' : 'Delivered';
      case 'cancelled':
        return locale === 'ar' ? 'ملغي' : 'Cancelled';
    }
  };

  return (
    <div id="admin-orders-view" className="flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`
            p-3.5 rounded-[2px] border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in duration-200
            ${
              notification.type === 'success'
                ? 'bg-[#4B5D46]/10 text-[#4B5D46] border-[#4B5D46]/30'
                : 'bg-[#8C3B2E]/10 text-[#8C3B2E] border-[#8C3B2E]/30'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4B5D46]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#8C3B2E]" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Metric Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4DED3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#4B5D46]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'إدارة الطلبات والمالية' : 'Order Fulfillment & Master Ledger'}
            </span>
            <span className="px-1.5 py-0.2 bg-[#8C3B2E]/10 text-[#8C3B2E] text-[9px] font-mono font-bold rounded-[2px]">
              fullAdmin Only
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#1C1A17] mt-1">
            {locale === 'ar' ? 'سجل طلبيات دار دهر' : 'Atelier Orders & Fulfillment'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {orders.length === 0 && !isLoading && (
            <button
              type="button"
              onClick={handleSeedSampleOrders}
              className="py-1.5 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title={locale === 'ar' ? 'إنشاء عينات طلبات تجريبية' : 'Create sample orders for demonstration'}
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#A98860]" />
              <span>{locale === 'ar' ? 'إضافة طلبات تجريبية' : 'Seed Sample Orders'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={isLoading}
            aria-label={locale === 'ar' ? 'تحديث الطلبات' : 'Refresh orders ledger'}
            className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={locale === 'ar' ? 'تحديث الطلبات' : 'Refresh orders ledger'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: List View OR Detail View Modal/Split */}
      {selectedOrder ? (
        <OrderDetailView
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onSaveNotes={handleSaveNotes}
          isUpdating={isUpdatingOrder}
        />
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E4DED3] scrollbar-none">
            {(
              [
                { id: 'all', labelEn: 'All Orders', labelAr: 'جميع الطلبات', count: statusCounts.all },
                { id: 'pending', labelEn: 'Pending', labelAr: 'قيد الانتظار', count: statusCounts.pending },
                { id: 'processing', labelEn: 'Processing', labelAr: 'قيد التجهيز', count: statusCounts.processing },
                { id: 'shipped', labelEn: 'Shipped', labelAr: 'تم الشحن', count: statusCounts.shipped },
                { id: 'delivered', labelEn: 'Delivered', labelAr: 'تم التسليم', count: statusCounts.delivered },
                { id: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي', count: statusCounts.cancelled },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`
                    py-1.5 px-3 rounded-[2px] text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2
                    ${
                      active
                        ? 'bg-[#1C1A17] text-[#FAF7F2] shadow-sm'
                        : 'bg-[#FAF7F2] text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3] border border-[#E4DED3]'
                    }
                  `}
                >
                  <span>{locale === 'ar' ? tab.labelAr : tab.labelEn}</span>
                  <span
                    className={`
                      px-1.5 py-0.2 rounded-full text-[10px] font-mono
                      ${active ? 'bg-[#FAF7F2]/20 text-[#FAF7F2]' : 'bg-[#E4DED3] text-[#7A736A]'}
                    `}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] p-3 border border-[#E4DED3] rounded-[2px]">
            {/* Search Input */}
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 absolute start-3 text-[#7A736A] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  locale === 'ar'
                    ? 'البحث برقم الطلب، اسم العميل، البريد، المدينة، أو العطر...'
                    : 'Search by order ID, customer name, email, city, flacon...'
                }
                className="w-full h-9 ps-9 pe-8 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute end-2.5 p-1 text-[#7A736A] hover:text-[#1C1A17]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Sort Options */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-[#7A736A] hidden md:inline">
                {locale === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}
              </span>
              <select
                value={sortField}
                onChange={(e) => handleSort(e.target.value as SortField)}
                aria-label={locale === 'ar' ? 'حقل الترتيب' : 'Sort field'}
                className="h-9 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860] cursor-pointer"
              >
                <option value="date">{locale === 'ar' ? 'التاريخ' : 'Date'}</option>
                <option value="id">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</option>
                <option value="customer">{locale === 'ar' ? 'اسم العميل' : 'Customer Name'}</option>
                <option value="items">{locale === 'ar' ? 'عدد الأصناف' : 'Item Count'}</option>
                <option value="subtotal">{locale === 'ar' ? 'المبلغ الإجمالي' : 'Subtotal'}</option>
                <option value="status">{locale === 'ar' ? 'الحالة' : 'Status'}</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                aria-label={locale === 'ar' ? 'عكس اتجاه الترتيب' : 'Toggle sort direction'}
                className="h-9 px-2.5 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase">{sortDirection}</span>
              </button>
            </div>
          </div>

          {/* Master Orders Data Table */}
          <div className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table
                className="w-full text-start text-xs font-mono"
                aria-label={locale === 'ar' ? 'جدول سجل الطلبيات' : 'Master Orders Ledger Table'}
              >
                <thead>
                  <tr className="bg-[#F5F1EA] border-b border-[#E4DED3] text-[#7A736A] uppercase text-[10px] tracking-wider select-none">
                    <th
                      scope="col"
                      onClick={() => handleSort('id')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</span>
                        {sortField === 'id' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('date')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</span>
                        {sortField === 'date' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('customer')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'العميل والشحن' : 'Customer & Shipping'}</span>
                        {sortField === 'customer' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('items')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'الأصناف' : 'Items'}</span>
                        {sortField === 'items' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('subtotal')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'المبلغ' : 'Subtotal'}</span>
                        {sortField === 'subtotal' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('status')}
                      className="py-3 px-4 text-start font-bold cursor-pointer hover:text-[#1C1A17] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{locale === 'ar' ? 'الحالة' : 'Status'}</span>
                        {sortField === 'status' && <ArrowUpDown className="w-3 h-3 text-[#A98860]" />}
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-4 text-end font-bold">
                      {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DED3]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7A736A]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#4B5D46]" />
                          <span>{locale === 'ar' ? 'جارٍ تحميل سجل الطلبات من قاعدة البيانات...' : 'Loading orders ledger from Firestore...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((ord) => {
                      const totalItemUnits = ord.items?.reduce((acc, it) => acc + (it.qty || 1), 0) || 0;
                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:bg-[#F5F1EA] transition-colors cursor-pointer group"
                        >
                          {/* Order ID */}
                          <td className="py-3 px-4 font-bold text-[#1C1A17] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>#{ord.id}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-[#7A736A] whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-[#1C1A17]">
                                {new Date(ord.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-[#7A736A]">
                                {new Date(ord.createdAt).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4 text-[#1C1A17]">
                            <div className="flex flex-col">
                              <span className="font-medium text-[#1C1A17] flex items-center gap-1.5">
                                {ord.customer?.name || (locale === 'ar' ? 'عميل غير مسمى' : 'Anonymous Client')}
                                {ord.customer?.uid ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#4B5D46]" title="Registered Member" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A736A]" title="Guest Checkout" />
                                )}
                              </span>
                              <span className="text-[10px] text-[#7A736A]">
                                {ord.customer?.address?.city || ''}
                                {ord.customer?.address?.country ? `, ${ord.customer.address.country}` : ''}
                              </span>
                            </div>
                          </td>

                          {/* Items Count */}
                          <td className="py-3 px-4 text-[#1C1A17] whitespace-nowrap">
                            <div className="flex items-center gap-1 text-xs">
                              <Package className="w-3.5 h-3.5 text-[#7A736A]" />
                              <span>
                                {totalItemUnits} {locale === 'ar' ? 'عطر' : 'flacon(s)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#7A736A] block truncate max-w-[140px]">
                              {ord.items?.map((it) => (locale === 'ar' ? it.name?.ar || it.name?.en : it.name?.en || it.name?.ar)).join(', ')}
                            </span>
                          </td>

                          {/* Subtotal */}
                          <td className="py-3 px-4 font-bold text-[#1C1A17] whitespace-nowrap">
                            {formatPrice(ord.totalAmount || ord.subtotal, locale, { currency: 'USD' })}
                          </td>

                          {/* Status Pill */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <StatusPill
                              status={ord.status as AdminStatus}
                              label={getStatusLabel(ord.status)}
                            />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-end whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(ord);
                              }}
                              aria-label={`${locale === 'ar' ? 'عرض تفاصيل الطلب' : 'View order details'} #${ord.id}`}
                              className="py-1 px-2.5 bg-[#FAF7F2] group-hover:bg-[#1C1A17] text-[#1C1A17] group-hover:text-[#FAF7F2] border border-[#E4DED3] group-hover:border-[#1C1A17] rounded-[2px] text-[11px] font-mono transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'التفاصيل' : 'Inspect'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7A736A]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingCart className="w-8 h-8 text-[#E4DED3]" />
                          <span className="font-serif text-sm text-[#1C1A17]">
                            {locale === 'ar' ? 'لا توجد طلبات تطابق معايير البحث.' : 'No orders found matching your criteria.'}
                          </span>
                          <span className="text-xs font-mono text-[#7A736A]">
                            {locale === 'ar'
                              ? 'جرّب تعديل نص البحث أو تغيير تصفية الحالة.'
                              : 'Try adjusting your search terms or clearing the status filter.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-[#F5F1EA] border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7A736A]">
              <div className="flex items-center gap-2">
                <span>{locale === 'ar' ? 'عرض في الصفحة:' : 'Rows per page:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Rows per page"
                  className="h-7 px-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-[#1C1A17]">
                  {sortedOrders.length > 0
                    ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                        currentPage * pageSize,
                        sortedOrders.length
                      )} ${locale === 'ar' ? 'من' : 'of'} ${sortedOrders.length}`
                    : '0 orders'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label={locale === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
                  className="p-1.5 bg-[#FAF7F2] disabled:opacity-40 hover:bg-[#E4DED3] border border-[#E4DED3] rounded-[2px] text-[#1C1A17] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <span className="px-2 font-medium text-[#1C1A17]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label={locale === 'ar' ? 'الصفحة التالية' : 'Next page'}
                  className="p-1.5 bg-[#FAF7F2] disabled:opacity-40 hover:bg-[#E4DED3] border border-[#E4DED3] rounded-[2px] text-[#1C1A17] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
