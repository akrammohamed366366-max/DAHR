import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Tag,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { productsApi } from '../../../api/productsApi';
import { Product, ScentFamily, ProductStatus } from '../../../types/backend';
import { formatPrice } from '../../../i18n/formatters';
import { RouteId } from '../../../types';
import { ProductEditor } from './ProductEditor';
import { ConfirmationDialog } from '../ConfirmationDialog';

export interface AdminProductsViewProps {
  onRouteChange: (route: RouteId) => void;
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({ onRouteChange }) => {
  const { locale } = useI18n();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters and Search
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'name' | 'family' | 'price' | 'stock' | 'status' | 'updatedAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all products (including drafts)
  const fetchProducts = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await productsApi.getAllProductsAdmin(forceRefresh);
      setProducts(data || []);
    } catch (err: any) {
      console.warn('Failed to load products in admin view:', err);
      showNotification('error', err.message || 'Failed to fetch catalog records from Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Quick Status Toggle (Draft <-> Active)
  const handleToggleStatus = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: ProductStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await productsApi.updateProduct(product.id, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      showNotification(
        'success',
        locale === 'ar'
          ? `تم تغيير حالة "${product.name?.ar || product.name?.en}" إلى ${newStatus === 'active' ? 'نشط' : 'مسودة'}.`
          : `Changed status of "${product.name?.en}" to ${newStatus}.`
      );
    } catch (err: any) {
      showNotification('error', `Failed to update status: ${err.message}`);
    }
  };

  // Save product from editor (Create or Update)
  const handleSaveProduct = async (productData: Product) => {
    const isExisting = products.some((p) => p.id === productData.id);
    if (isExisting) {
      await productsApi.updateProduct(productData.id, productData);
      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? productData : p))
      );
      showNotification(
        'success',
        locale === 'ar'
          ? `تم تحديث العطر "${productData.name.ar}" بنجاح في قاعدة البيانات.`
          : `Fragrance "${productData.name.en}" successfully updated.`
      );
    } else {
      await productsApi.createProduct(productData);
      setProducts((prev) => [productData, ...prev]);
      showNotification(
        'success',
        locale === 'ar'
          ? `تمت إضافة العطر الجديد "${productData.name.ar}" بنجاح.`
          : `New fragrance "${productData.name.en}" added to catalog.`
      );
    }
  };

  // Delete product action
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showNotification(
        'success',
        locale === 'ar'
          ? `تم حذف العطر "${productToDelete.name?.ar || productToDelete.name?.en}" نهائياً من الكتالوج.`
          : `Fragrance "${productToDelete.name?.en}" permanently removed.`
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      showNotification('error', `Failed to delete product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions for calculated metrics
  const getProductTotalStock = (product: Product): number => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    return product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
  };

  const getProductBasePrice = (product: Product): number => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    const prices = product.sizes.map((s) => Number(s.price) || 0).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase().trim();

      // Text query match
      if (q) {
        const matchesNameEn = p.name?.en?.toLowerCase().includes(q);
        const matchesNameAr = p.name?.ar?.toLowerCase().includes(q);
        const matchesDescriptorEn = p.shortDescriptor?.en?.toLowerCase().includes(q);
        const matchesDescriptorAr = p.shortDescriptor?.ar?.toLowerCase().includes(q);
        const matchesFamily = p.scentFamily?.toLowerCase().includes(q);
        const matchesId = p.id?.toLowerCase().includes(q);
        const matchesKeywords = p.searchKeywords?.some((k) => k.toLowerCase().includes(q));

        if (!matchesNameEn && !matchesNameAr && !matchesDescriptorEn && !matchesDescriptorAr && !matchesFamily && !matchesId && !matchesKeywords) {
          return false;
        }
      }

      // Scent family filter
      if (familyFilter !== 'all' && p.scentFamily !== familyFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Stock filter
      if (stockFilter !== 'all') {
        const totalStock = getProductTotalStock(p);
        if (stockFilter === 'in_stock' && totalStock <= 0) return false;
        if (stockFilter === 'low_stock' && (totalStock <= 0 || totalStock > 10)) return false;
        if (stockFilter === 'out_of_stock' && totalStock > 0) return false;
      }

      // Flags filter
      if (flagFilter !== 'all') {
        if (flagFilter === 'isNew' && !p.flags?.isNew) return false;
        if (flagFilter === 'isSignature' && !p.flags?.isSignature) return false;
        if (flagFilter === 'isFeatured' && !p.flags?.isFeatured) return false;
      }

      return true;
    });
  }, [products, search, familyFilter, statusFilter, stockFilter, flagFilter]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'name':
          valA = locale === 'ar' ? a.name?.ar || a.name?.en : a.name?.en;
          valB = locale === 'ar' ? b.name?.ar || b.name?.en : b.name?.en;
          break;
        case 'family':
          valA = a.scentFamily || '';
          valB = b.scentFamily || '';
          break;
        case 'price':
          valA = getProductBasePrice(a);
          valB = getProductBasePrice(b);
          break;
        case 'stock':
          valA = getProductTotalStock(a);
          valB = getProductTotalStock(b);
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'updatedAt':
        default:
          valA = a.updatedAt || a.createdAt || '';
          valB = b.updatedAt || b.createdAt || '';
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredProducts, sortField, sortDirection, locale]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, validPage, pageSize]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    familyFilter !== 'all' ||
    statusFilter !== 'all' ||
    stockFilter !== 'all' ||
    flagFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setFamilyFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
    setFlagFilter('all');
    setCurrentPage(1);
  };

  return (
    <div id="admin-products-view" className="flex flex-col gap-6 text-start">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-[2px] border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
            notification.type === 'success'
              ? 'bg-[#4B5D46]/10 border-[#4B5D46]/30 text-[#4B5D46]'
              : 'bg-[#8C3B2E]/10 border-[#8C3B2E]/30 text-[#8C3B2E]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4DED3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#A98860]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'إدارة الكتالوج والعطور' : 'Product & Catalog Management'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#1C1A17] mt-1">
            {locale === 'ar' ? 'قائمة عطور وخلاصات دار' : 'Fragrance Portfolio & Formulations'}
          </h1>
          <p className="text-xs font-mono text-[#7A736A] mt-0.5">
            {locale === 'ar'
              ? 'إدارة كاملة لقاعدة بيانات المنتجات (CRUD)، الهرم العطري، الأحجام، والصور المنعكسة في المتجر.'
              : 'Full CRUD control over the live products collection, scent pyramids, size variants, and gallery assets.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={isLoading}
            aria-label={locale === 'ar' ? 'تحديث قائمة العطور' : 'Refresh fragrance portfolio'}
            className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={locale === 'ar' ? 'تحديث من فايرستور' : 'Refresh from Firestore'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null);
              setIsEditorOpen(true);
            }}
            className="h-9 px-4 bg-[#1C1A17] hover:bg-[#A98860] text-[#FAF7F2] rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إضافة عطر جديد' : '+ New Fragrance'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#FAF7F2] border border-[#E4DED3] p-4 rounded-[2px] flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="lg:col-span-2 relative flex items-center">
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
                  ? 'البحث بالاسم العربي/الإنجليزي، المكونات، أو الرمز...'
                  : 'Search by EN/AR name, notes, or SKU...'
              }
              className="w-full h-9 ps-9 pe-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
            />
          </div>

          {/* Scent Family Filter */}
          <div>
            <select
              value={familyFilter}
              onChange={(e) => {
                setFamilyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
            >
              <option value="all">{locale === 'ar' ? 'كل العائلات العطرية' : 'All Scent Families'}</option>
              <option value="Woody">Woody (خشبية)</option>
              <option value="Floral">Floral (زهرية)</option>
              <option value="Oriental">Oriental (شرقية)</option>
              <option value="Fresh">Fresh (منعشة)</option>
              <option value="Amber">Amber (عنبرية)</option>
              <option value="Musk">Musk (مسكية)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
            >
              <option value="all">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="active">{locale === 'ar' ? 'نشط (معروض في المتجر)' : 'Active (Storefront)'}</option>
              <option value="draft">{locale === 'ar' ? 'مسودة (مخفي)' : 'Draft (Private)'}</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
            >
              <option value="all">{locale === 'ar' ? 'حالة المخزون (الكل)' : 'All Inventory Levels'}</option>
              <option value="in_stock">{locale === 'ar' ? 'متوفر بالمخزن' : 'In Stock'}</option>
              <option value="low_stock">{locale === 'ar' ? 'مخزون منخفض (<= 10)' : 'Low Stock (<= 10)'}</option>
              <option value="out_of_stock">{locale === 'ar' ? 'نفد من المخزن (0)' : 'Out of Stock'}</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Tags and Results Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E4DED3] text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#7A736A] text-[11px]">
              {locale === 'ar' ? 'تمييز العرض:' : 'Highlights:'}
            </span>
            <button
              type="button"
              onClick={() => setFlagFilter((f) => (f === 'isFeatured' ? 'all' : 'isFeatured'))}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                flagFilter === 'isFeatured'
                  ? 'bg-[#A98860] text-white border-[#A98860]'
                  : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:border-[#A98860]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </button>
            <button
              type="button"
              onClick={() => setFlagFilter((f) => (f === 'isSignature' ? 'all' : 'isSignature'))}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                flagFilter === 'isSignature'
                  ? 'bg-[#A98860] text-white border-[#A98860]'
                  : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:border-[#A98860]'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>Signature</span>
            </button>
            <button
              type="button"
              onClick={() => setFlagFilter((f) => (f === 'isNew' ? 'all' : 'isNew'))}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                flagFilter === 'isNew'
                  ? 'bg-[#A98860] text-white border-[#A98860]'
                  : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:border-[#A98860]'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>New Release</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2 py-0.5 text-[#8C3B2E] hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>{locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#7A736A]">
            <span>
              {locale === 'ar'
                ? `عرض ${sortedProducts.length} من إجمالي ${products.length} عطر`
                : `Showing ${sortedProducts.length} of ${products.length} fragrances`}
            </span>
          </div>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs font-mono">
            <thead>
              <tr className="bg-[#F5F1EA] border-b border-[#E4DED3] text-[#7A736A] uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4 text-start w-16">
                  {locale === 'ar' ? 'الصورة' : 'Photo'}
                </th>
                <th
                  onClick={() => handleSortToggle('name')}
                  className="py-3 px-4 text-start cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{locale === 'ar' ? 'اسم العطر والوصف' : 'Fragrance & Narrative'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('family')}
                  className="py-3 px-4 text-start cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{locale === 'ar' ? 'العائلة العطرية' : 'Scent Family'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('price')}
                  className="py-3 px-4 text-start cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{locale === 'ar' ? 'السعر (الأساسي)' : 'Base Price'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('stock')}
                  className="py-3 px-4 text-start cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{locale === 'ar' ? 'المخزون الكلي' : 'Stock Units'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('status')}
                  className="py-3 px-4 text-start cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{locale === 'ar' ? 'الحالة' : 'Status'}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-end">
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DED3]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7A736A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#A98860]" />
                      <span>{locale === 'ar' ? 'جارٍ تحميل الكتالوج من Firestore...' : 'Synchronizing catalog with Firestore...'}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((item) => {
                  const basePrice = getProductBasePrice(item);
                  const totalStock = getProductTotalStock(item);
                  const heroPhoto = item.images?.[0] || '/assets/products/oud_al_waqt_hero.jpg';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedProduct(item);
                        setIsEditorOpen(true);
                      }}
                      className="hover:bg-[#F5F1EA]/80 transition-colors cursor-pointer group"
                    >
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="w-10 h-10 rounded-[2px] bg-[#E4DED3]/40 border border-[#E4DED3] overflow-hidden relative shrink-0">
                          <img
                            src={heroPhoto}
                            alt={item.name?.en || 'Product thumbnail'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/products/oud_al_waqt_hero.jpg';
                            }}
                          />
                        </div>
                      </td>

                      {/* Name, Descriptors, & Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1C1A17] text-[13px] font-serif">
                              {locale === 'ar' ? item.name?.ar || item.name?.en : item.name?.en}
                            </span>
                            {/* Flags */}
                            {item.flags?.isSignature && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#A98860]/10 text-[#A98860] border border-[#A98860]/30 rounded-[1px]">
                                Signature
                              </span>
                            )}
                            {item.flags?.isFeatured && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#1C1A17]/10 text-[#1C1A17] border border-[#1C1A17]/20 rounded-[1px]">
                                Featured
                              </span>
                            )}
                            {item.flags?.isNew && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#4B5D46]/10 text-[#4B5D46] border border-[#4B5D46]/30 rounded-[1px]">
                                New
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-[#7A736A] font-body line-clamp-1">
                            {locale === 'ar' ? item.shortDescriptor?.ar : item.shortDescriptor?.en}
                          </span>

                          <span className="text-[10px] font-mono text-[#A98860]">
                            SKU: {item.id}
                          </span>
                        </div>
                      </td>

                      {/* Scent Family */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-[11px] text-[#1C1A17]">
                          {item.scentFamily || 'Woody'}
                        </span>
                      </td>

                      {/* Price (Base size) */}
                      <td className="py-3 px-4 font-bold text-[#1C1A17]">
                        {formatPrice(basePrice, locale, { currency: 'USD' })}
                        {item.sizes && item.sizes.length > 1 && (
                          <span className="block text-[10px] text-[#7A736A] font-normal">
                            ({item.sizes.length} {locale === 'ar' ? 'سعات' : 'sizes'})
                          </span>
                        )}
                      </td>

                      {/* Stock Units & Pill */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              totalStock > 10
                                ? 'bg-[#4B5D46]'
                                : totalStock > 0
                                ? 'bg-[#A98860]'
                                : 'bg-[#8C3B2E]'
                            }`}
                          />
                          <span className="font-bold text-[#1C1A17]">{totalStock}</span>
                          <span className="text-[10px] text-[#7A736A]">
                            {totalStock === 0
                              ? (locale === 'ar' ? 'نفد' : 'out')
                              : (locale === 'ar' ? 'قارورة' : 'units')}
                          </span>
                        </div>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(item, e)}
                          className={`px-2.5 py-1 rounded-[2px] text-[10px] font-mono border transition-colors cursor-pointer ${
                            item.status === 'active'
                              ? 'bg-[#4B5D46]/10 text-[#4B5D46] border-[#4B5D46]/30 hover:bg-[#4B5D46]/20'
                              : 'bg-[#7A736A]/10 text-[#7A736A] border-[#7A736A]/30 hover:bg-[#7A736A]/20'
                          }`}
                          title="Click to toggle between Active / Draft"
                        >
                          {item.status === 'active'
                            ? (locale === 'ar' ? 'نشط (معروض)' : 'Active')
                            : (locale === 'ar' ? 'مسودة' : 'Draft')}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3]/60 rounded-[2px] transition-colors cursor-pointer"
                            title="Edit product formulation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-[#7A736A] hover:text-[#8C3B2E] hover:bg-[#8C3B2E]/10 rounded-[2px] transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7A736A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-[#A98860]/40" />
                      <p className="text-xs font-mono">
                        {locale === 'ar'
                          ? 'لم يتم العثور على عطور تطابق معايير البحث.'
                          : 'No fragrances found matching the search criteria.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="text-xs font-mono text-[#A98860] hover:underline mt-1"
                        >
                          {locale === 'ar' ? 'مسح الفلاتر' : 'Clear search filters'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-[#F5F1EA] border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7A736A]">
          <div className="flex items-center gap-2">
            <span>{locale === 'ar' ? 'العناصر لكل صفحة:' : 'Rows per page:'}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {locale === 'ar'
                ? `صفحة ${validPage} من ${totalPages}`
                : `Page ${validPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] disabled:opacity-30 hover:bg-[#E4DED3] transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] disabled:opacity-30 hover:bg-[#E4DED3] transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductEditor
        isOpen={isEditorOpen}
        product={selectedProduct}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        isDestructive
        isLoading={isDeleting}
        title={
          locale === 'ar'
            ? `حذف العطر "${productToDelete?.name?.ar || productToDelete?.name?.en}"؟`
            : `Delete Fragrance "${productToDelete?.name?.en}"?`
        }
        description={
          locale === 'ar'
            ? 'هل أنت متأكد من رغبتك في حذف هذا العطر نهائياً من قاعدة بيانات Firestore؟ لا يمكن التراجع عن هذا الإجراء، ولن يظهر بعد ذلك في المتجر.'
            : 'Are you sure you want to delete this product document from Firestore? This action is permanent and will remove the fragrance formulation and images from the active catalog.'
        }
        confirmLabel={locale === 'ar' ? 'تأكيد الحذف' : 'Delete Permanently'}
        cancelLabel={locale === 'ar' ? 'إلغاء' : 'Cancel'}
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
};
