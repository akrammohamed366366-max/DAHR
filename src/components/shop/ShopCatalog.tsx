import React, { useState, useEffect, useMemo, useId } from 'react';
import { useI18n } from '../../i18n/context';
import { Product, ScentFamily } from '../../types/backend';
import { ProductData } from '../../types';
import { productsApi } from '../../api/productsApi';
import { mapProductToStorefrontData } from '../../utils/productAdapter';
import { ProductCard } from '../storefront/ProductCard';
import { Button } from '../storefront/Button';
import { Badge } from '../storefront/Badge';
import { Filter, X, SlidersHorizontal, ArrowUpDown, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';

export interface ShopCatalogProps {
  initialFamily?: ScentFamily | 'all';
  searchQuery?: string;
  onAddToCart?: (product: ProductData) => void;
  onQuickView?: (product: ProductData) => void;
  onSelectProduct?: (productId: string, fromFamily?: string) => void;
  onFamilyFilterChange?: (family: ScentFamily | 'all') => void;
  onClearSearch?: () => void;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export const SCENT_FAMILIES_LIST: { id: ScentFamily; nameEn: string; nameAr: string; descEn: string; descAr: string }[] = [
  { id: 'Woody', nameEn: 'Woody', nameAr: 'خشبية', descEn: 'Aged agarwood, sacred cedar, and deep smoky resins', descAr: 'خشب العود العتيق، الأرز المقدس، والراتنجات الدخانية' },
  { id: 'Floral', nameEn: 'Floral', nameAr: 'زهرية', descEn: 'Highland Taif roses, solar jasmine, and valley blossoms', descAr: 'ورد الطائف الجبلي، الياسمين المشرق، وزهور الوديان' },
  { id: 'Oriental', nameEn: 'Oriental', nameAr: 'شرقية', descEn: 'Warm spices, rare resins, and desert botanicals', descAr: 'التوابل الدافئة، الصموغ النادرة، وخلاصات الصحراء' },
  { id: 'Fresh', nameEn: 'Fresh', nameAr: 'منعشة', descEn: 'Mountain citrus, aromatic sage, and crisp oasis breezes', descAr: 'الحمضيات الجبلية، الميرمية العطرية، ونسمات الواحات' },
  { id: 'Amber', nameEn: 'Amber', nameAr: 'عنبرية', descEn: 'Grey sea ambergris, Hojari tears, and golden balsam', descAr: 'العنبر الرمادي الخام، لبان الحوجري، والبلسم الذهبي' },
  { id: 'Musk', nameEn: 'Musk', nameAr: 'مسكية', descEn: 'Velvet skin accords, warm radiance, and white silks', descAr: 'توليفات جلدية مخملية، إشراق دافئ، وحرير أبيض' },
];

export const SIZE_OPTIONS = [
  { id: 'all', nameEn: 'All Sizes', nameAr: 'كافة الأحجام' },
  { id: '100ml', nameEn: '100ml Flacon', nameAr: 'قارورة 100 مل' },
  { id: '50ml', nameEn: '50ml Flacon', nameAr: 'قارورة 50 مل' },
  { id: '10ml', nameEn: '10ml Discovery', nameAr: '10 مل استكشافي' },
];

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  initialFamily = 'all',
  searchQuery = '',
  onAddToCart,
  onQuickView,
  onSelectProduct,
  onFamilyFilterChange,
  onClearSearch,
}) => {
  const { locale, t } = useI18n();
  const sortSelectId = useId();

  // Primary State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter & Sort State
  const [selectedFamily, setSelectedFamily] = useState<ScentFamily | 'all'>(initialFamily);
  const [activeSearch, setActiveSearch] = useState<string>(searchQuery);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Mobile / Tablet Filter Sheet Open State
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);

  // Sync external initialFamily changes
  useEffect(() => {
    if (initialFamily) {
      setSelectedFamily(initialFamily);
    }
  }, [initialFamily]);

  // Sync external searchQuery changes
  useEffect(() => {
    setActiveSearch(searchQuery);
  }, [searchQuery]);

  // Load products from Firestore on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const docs = await productsApi.getActiveProducts();
        if (isMounted) {
          setProducts(docs);
        }
      } catch (err: any) {
        console.error('Error fetching catalog products from Firestore:', err);
        if (isMounted) {
          setLoadError(err.message || 'Failed to load catalog products');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFamilyChange = (fam: ScentFamily | 'all') => {
    setSelectedFamily(fam);
    onFamilyFilterChange?.(fam);
  };

  const handleResetFilters = () => {
    setSelectedFamily('all');
    setSelectedSize('all');
    setInStockOnly(false);
    setSortBy('featured');
    setActiveSearch('');
    onClearSearch?.();
    onFamilyFilterChange?.('all');
  };

  const handleClearSearch = () => {
    setActiveSearch('');
    onClearSearch?.();
  };

  // Compute family counts from live active products
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    SCENT_FAMILIES_LIST.forEach((f) => {
      counts[f.id] = products.filter((p) => p.scentFamily === f.id).length;
    });
    return counts;
  }, [products]);

  // Filter products based on active criteria
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Text Search filter if present
      if (activeSearch.trim()) {
        const q = activeSearch.trim().toLowerCase();
        const matchesNameEn = prod.name?.en?.toLowerCase().includes(q);
        const matchesNameAr = prod.name?.ar?.toLowerCase().includes(q);
        const matchesFamily = prod.scentFamily?.toLowerCase().includes(q);
        const matchesDescEn = prod.shortDescriptor?.en?.toLowerCase().includes(q);
        const matchesDescAr = prod.shortDescriptor?.ar?.toLowerCase().includes(q);
        const matchesNotesTop = prod.notes?.top?.en?.toLowerCase().includes(q) || prod.notes?.top?.ar?.toLowerCase().includes(q);
        const matchesNotesHeart = prod.notes?.heart?.en?.toLowerCase().includes(q) || prod.notes?.heart?.ar?.toLowerCase().includes(q);
        const matchesNotesBase = prod.notes?.base?.en?.toLowerCase().includes(q) || prod.notes?.base?.ar?.toLowerCase().includes(q);
        const matchesKeywords = prod.searchKeywords?.some((k) => k.includes(q));

        if (!matchesNameEn && !matchesNameAr && !matchesFamily && !matchesDescEn && !matchesDescAr && !matchesNotesTop && !matchesNotesHeart && !matchesNotesBase && !matchesKeywords) {
          return false;
        }
      }

      // Scent family filter
      if (selectedFamily !== 'all' && prod.scentFamily !== selectedFamily) {
        return false;
      }

      // Size variant filter
      if (selectedSize !== 'all') {
        const hasSize = prod.sizes?.some((s) => s.size.toLowerCase().includes(selectedSize.toLowerCase()));
        if (!hasSize) return false;
      }

      // In stock filter
      if (inStockOnly) {
        const totalStock = prod.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
        if (totalStock <= 0) return false;
      }

      return true;
    });
  }, [products, activeSearch, selectedFamily, selectedSize, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => {
          const priceA = a.sizes?.[0]?.price ?? 0;
          const priceB = b.sizes?.[0]?.price ?? 0;
          return priceA - priceB;
        });
      case 'price-desc':
        return list.sort((a, b) => {
          const priceA = a.sizes?.[0]?.price ?? 0;
          const priceB = b.sizes?.[0]?.price ?? 0;
          return priceB - priceA;
        });
      case 'newest':
        return list.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      case 'featured':
      default:
        return list.sort((a, b) => {
          // Signatures and Featured first
          const rankA = (a.flags?.isSignature ? 2 : 0) + (a.flags?.isFeatured ? 1 : 0);
          const rankB = (b.flags?.isSignature ? 2 : 0) + (b.flags?.isFeatured ? 1 : 0);
          return rankB - rankA;
        });
    }
  }, [filteredProducts, sortBy]);

  // Map to Storefront ProductData for ProductCard
  const mappedProductCards = useMemo(() => {
    return sortedProducts.map(mapProductToStorefrontData);
  }, [sortedProducts]);

  const hasActiveFilters = Boolean(activeSearch.trim()) || selectedFamily !== 'all' || selectedSize !== 'all' || inStockOnly;

  return (
    <div
      id="dahr-shop-catalog"
      className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col gap-8 sm:gap-12 text-start"
    >
      {/* Catalog Header */}
      <header className="border-b border-[#E4DED3] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
            {locale === 'ar' ? 'المجموعات الشمية الكاملة' : 'The Complete Olfactive Archive'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1A17] font-normal leading-tight">
            {selectedFamily === 'all'
              ? locale === 'ar'
                ? 'كافة العطور والخلاصات المركزة'
                : 'All Fragrances & Extraits'
              : locale === 'ar'
              ? `العطور ذات الطابع ${SCENT_FAMILIES_LIST.find((f) => f.id === selectedFamily)?.nameAr || ''}`
              : `${selectedFamily} Olfactive Creations`}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#7A736A] font-body font-light leading-relaxed">
            {selectedFamily === 'all'
              ? locale === 'ar'
                ? 'استكشف كافة إبداعات دار DAHR المصاغة بتركيز خلاصة عطرية نقية (24%–40%) من أندر المستخلصات الطبيعية.'
                : 'Explore every pure extrait creation (24% to 40% concentration), formulated without synthetic diluents.'
              : locale === 'ar'
              ? SCENT_FAMILIES_LIST.find((f) => f.id === selectedFamily)?.descAr
              : SCENT_FAMILIES_LIST.find((f) => f.id === selectedFamily)?.descEn}
          </p>
        </div>

        {/* Live Result Count Announcer */}
        <div
          id="product-count-announcer"
          aria-live="polite"
          className="text-xs font-mono text-[#7A736A] bg-[#FAF7F2] border border-[#E4DED3] px-3.5 py-2 rounded-[2px] self-start md:self-end whitespace-nowrap"
        >
          {locale === 'ar'
            ? `عرض ${sortedProducts.length} من أصل ${products.length} عطر`
            : `Showing ${sortedProducts.length} of ${products.length} fragrances`}
        </div>
      </header>

      {/* Main Catalog Body: Desktop Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        {/* ========================================================================= */}
        {/* DESKTOP SIDEBAR FILTER PANEL                                              */}
        {/* ========================================================================= */}
        <aside
          aria-label={locale === 'ar' ? 'خيارات تصفية العطور' : 'Fragrance Filters'}
          className="hidden lg:flex flex-col gap-8 w-64 xl:w-72 flex-shrink-0 sticky top-24 pe-6 border-e border-[#E4DED3]"
        >
          {/* Filter Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DED3]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#A98860]" />
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'تصفية المنتجات' : 'Filter Archive'}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-[#A98860] hover:text-[#1C1A17] underline transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إعادة ضبط' : 'Reset All'}
              </button>
            )}
          </div>

          {/* Scent Family Filter Group */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A] mb-1">
              {locale === 'ar' ? 'العائلة العطرية' : 'Scent Family'}
            </legend>

            <div className="flex flex-col gap-1">
              {/* All Families Option */}
              <button
                type="button"
                onClick={() => handleFamilyChange('all')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-[2px] transition-all text-start cursor-pointer ${
                  selectedFamily === 'all'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                    : 'text-[#554F47] hover:bg-[#FAF7F2] hover:text-[#1C1A17]'
                }`}
              >
                <span>{locale === 'ar' ? 'كافة العائلات' : 'All Scent Families'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-[1px] ${
                    selectedFamily === 'all'
                      ? 'bg-[#FAF7F2]/20 text-[#FAF7F2]'
                      : 'bg-[#E4DED3]/60 text-[#7A736A]'
                  }`}
                >
                  {familyCounts.all ?? 0}
                </span>
              </button>

              {/* Individual Scent Families */}
              {SCENT_FAMILIES_LIST.map((f) => {
                const isSelected = selectedFamily === f.id;
                const count = familyCounts[f.id] ?? 0;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFamilyChange(f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-[2px] transition-all text-start cursor-pointer ${
                      isSelected
                        ? 'bg-[#A98860] text-[#141311] font-semibold'
                        : 'text-[#554F47] hover:bg-[#FAF7F2] hover:text-[#1C1A17]'
                    }`}
                  >
                    <span>{locale === 'ar' ? f.nameAr : f.nameEn}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-[1px] ${
                        isSelected
                          ? 'bg-[#141311]/15 text-[#141311]'
                          : 'bg-[#E4DED3]/60 text-[#7A736A]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Size Variant Filter Group */}
          <fieldset className="flex flex-col gap-3 pt-4 border-t border-[#E4DED3]">
            <legend className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A] mb-1">
              {locale === 'ar' ? 'حجم القارورة' : 'Bottle Volume'}
            </legend>

            <div className="flex flex-col gap-1">
              {SIZE_OPTIONS.map((opt) => {
                const isSelected = selectedSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSize(opt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-[2px] transition-all text-start cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                        : 'text-[#554F47] hover:bg-[#FAF7F2] hover:text-[#1C1A17]'
                    }`}
                  >
                    <span>{locale === 'ar' ? opt.nameAr : opt.nameEn}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#A98860]" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* In-Stock Only Toggle */}
          <div className="pt-4 border-t border-[#E4DED3] flex items-center justify-between">
            <label
              htmlFor="filter-instock-toggle"
              className="text-xs font-mono text-[#554F47] cursor-pointer select-none"
            >
              {locale === 'ar' ? 'المتوفر في المخزن فقط' : 'In-Stock Only'}
            </label>
            <input
              id="filter-instock-toggle"
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-[#A98860] rounded cursor-pointer"
            />
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN PRODUCT GRID & CONTROLS CONTAINER                                    */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Top Control Bar: Mobile Filter Button + Sort Dropdown */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
            {/* Left / Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="shop-mobile-filter-trigger"
                onClick={() => setIsFilterSheetOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-[#1C1A17] text-[#FAF7F2] rounded-[2px] text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A98860]" />
                <span>{locale === 'ar' ? 'تصفية العطور' : 'Filters'}</span>
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-[#A98860] text-[#141311] text-[10px] flex items-center justify-center font-bold">
                    {(selectedFamily !== 'all' ? 1 : 0) + (selectedSize !== 'all' ? 1 : 0) + (inStockOnly ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Active Filter Badges */}
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                {activeSearch.trim() && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1C1A17] text-[#FAF7F2] text-xs font-mono rounded-[2px] hover:bg-[#A98860] hover:text-[#141311] transition-colors"
                  >
                    <span>
                      {locale === 'ar' ? `البحث: "${activeSearch}"` : `Search: "${activeSearch}"`}
                    </span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                {selectedFamily !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleFamilyChange('all')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#A98860] text-[#1C1A17] text-xs font-mono rounded-[2px] hover:bg-[#FAF7F2]"
                  >
                    <span>
                      {locale === 'ar'
                        ? SCENT_FAMILIES_LIST.find((f) => f.id === selectedFamily)?.nameAr
                        : selectedFamily}
                    </span>
                    <X className="w-3 h-3 text-[#A98860]" />
                  </button>
                )}

                {selectedSize !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize('all')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#E4DED3] text-[#1C1A17] text-xs font-mono rounded-[2px] hover:bg-[#FAF7F2]"
                  >
                    <span>
                      {locale === 'ar'
                        ? SIZE_OPTIONS.find((s) => s.id === selectedSize)?.nameAr
                        : SIZE_OPTIONS.find((s) => s.id === selectedSize)?.nameEn}
                    </span>
                    <X className="w-3 h-3 text-[#7A736A]" />
                  </button>
                )}

                {inStockOnly && (
                  <button
                    type="button"
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#E4DED3] text-[#1C1A17] text-xs font-mono rounded-[2px] hover:bg-[#FAF7F2]"
                  >
                    <span>{locale === 'ar' ? 'متوفر' : 'In Stock'}</span>
                    <X className="w-3 h-3 text-[#7A736A]" />
                  </button>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-mono text-[#A98860] hover:text-[#1C1A17] underline ms-2"
                  >
                    {locale === 'ar' ? 'مسح الفلاتر' : 'Clear all'}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2 ms-auto">
              <label
                htmlFor={sortSelectId}
                className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A] whitespace-nowrap"
              >
                {locale === 'ar' ? 'الترتيب حسب:' : 'Sort By:'}
              </label>

              <select
                id={sortSelectId}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={locale === 'ar' ? 'ترتيب المنتجات' : 'Sort Fragrances'}
                className="bg-[#FFFFFF] border border-[#E4DED3] rounded-[2px] px-3 py-1.5 text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860] cursor-pointer"
              >
                <option value="featured">
                  {locale === 'ar' ? 'الموصى بها والإصدارات الخاصة' : 'Featured & Signatures'}
                </option>
                <option value="newest">
                  {locale === 'ar' ? 'أحدث الإصدارات' : 'New Releases'}
                </option>
                <option value="price-asc">
                  {locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}
                </option>
                <option value="price-desc">
                  {locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}
                </option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRODUCT GRID STATES                                                       */}
          {/* ========================================================================= */}

          {/* 1. Loading Skeleton State */}
          {isLoading ? (
            <div className="w-full flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden animate-pulse"
                  >
                    <div className="w-full aspect-[3/4] bg-[#F0ECE4] flex items-center justify-center p-6 border-b border-[#E4DED3]" />
                    <div className="p-5 flex flex-col gap-3">
                      <div className="w-20 h-3 bg-[#E4DED3] rounded" />
                      <div className="w-40 h-5 bg-[#E4DED3] rounded" />
                      <div className="w-28 h-3 bg-[#E4DED3] rounded" />
                      <div className="w-full h-8 bg-[#E4DED3] mt-2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : loadError ? (
            /* 2. Error State */
            <div className="p-12 text-center border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px] flex flex-col items-center gap-4">
              <AlertCircle className="w-8 h-8 text-[#A98860]" />
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-xl text-[#1C1A17]">
                  {locale === 'ar' ? 'تعذر جلب كتالوج العطور' : 'Unable to Retrieve Catalog'}
                </h3>
                <p className="text-sm font-body text-[#7A736A] max-w-md">{loadError}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
                rightIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          ) : mappedProductCards.length > 0 ? (
            /* 3. Populated 3-4 Column Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {mappedProductCards.map((product) => (
                <ProductCard
                  key={product.id}
                  id={`shop-product-card-${product.id}`}
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onSelect={() => onSelectProduct?.(product.id, selectedFamily !== 'all' ? selectedFamily : undefined)}
                />
              ))}
            </div>
          ) : (
            /* 4. Empty State */
            <div
              id="shop-empty-state"
              className="py-20 px-6 text-center border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px] flex flex-col items-center gap-5"
            >
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#E4DED3] flex items-center justify-center text-[#A98860]">
                <Filter className="w-5 h-5" />
              </div>

              <div className="flex flex-col gap-2 max-w-md">
                <h3 className="font-serif text-2xl text-[#1C1A17]">
                  {locale === 'ar'
                    ? 'لا توجد عطور مطابقة للفلاتر المختارة'
                    : 'No Fragrances Match Your Selection'}
                </h3>
                <p className="text-sm text-[#7A736A] font-body leading-relaxed">
                  {locale === 'ar'
                    ? 'يرجى تجربة إعادة ضبط الفلاتر أو اختيار عائلة عطرية أخرى لاستكشاف الإصدارات المتاحة.'
                    : 'Try clearing your active filters or selecting another scent family to explore available flacons.'}
                </p>
              </div>

              <Button
                id="shop-reset-empty-btn"
                variant="primary"
                size="md"
                onClick={handleResetFilters}
                rightIcon={<RotateCcw className="w-4 h-4" />}
              >
                {locale === 'ar' ? 'إعادة ضبط كافة الفلاتر' : 'Reset All Filters'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET FULL-SCREEN FILTER SHEET                                  */}
      {/* ========================================================================= */}
      {isFilterSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'ar' ? 'لوحة تصفية العطور' : 'Filter Fragrances Dialog'}
          className="fixed inset-0 z-50 lg:hidden flex justify-end bg-[#141311]/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-md h-full bg-[#FAF7F2] border-s border-[#E4DED3] flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-end duration-300"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DED3]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#A98860]" />
                <h3 className="font-serif text-xl text-[#1C1A17]">
                  {locale === 'ar' ? 'تصفية العطور' : 'Filter Fragrances'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#E4DED3] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-[#FAF7F2] transition-colors cursor-pointer"
                aria-label={locale === 'ar' ? 'إغلاق الفلتر' : 'Close Filter'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 py-6 flex flex-col gap-6">
              {/* Scent Families */}
              <fieldset className="flex flex-col gap-2.5">
                <legend className="text-xs font-mono uppercase tracking-wider text-[#7A736A] mb-1">
                  {locale === 'ar' ? 'العائلة العطرية' : 'Scent Family'}
                </legend>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFamilyChange('all')}
                    className={`p-3 text-xs font-mono rounded-[2px] border text-start flex flex-col justify-between gap-1 transition-colors ${
                      selectedFamily === 'all'
                        ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17]'
                        : 'bg-[#FFFFFF] text-[#554F47] border-[#E4DED3]'
                    }`}
                  >
                    <span>{locale === 'ar' ? 'كافة العائلات' : 'All Families'}</span>
                    <span className="text-[10px] opacity-70">({familyCounts.all ?? 0})</span>
                  </button>

                  {SCENT_FAMILIES_LIST.map((f) => {
                    const isSelected = selectedFamily === f.id;
                    const count = familyCounts[f.id] ?? 0;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFamilyChange(f.id)}
                        className={`p-3 text-xs font-mono rounded-[2px] border text-start flex flex-col justify-between gap-1 transition-colors ${
                          isSelected
                            ? 'bg-[#A98860] text-[#141311] border-[#A98860] font-semibold'
                            : 'bg-[#FFFFFF] text-[#554F47] border-[#E4DED3]'
                        }`}
                      >
                        <span>{locale === 'ar' ? f.nameAr : f.nameEn}</span>
                        <span className="text-[10px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Sizes */}
              <fieldset className="flex flex-col gap-2.5 pt-4 border-t border-[#E4DED3]">
                <legend className="text-xs font-mono uppercase tracking-wider text-[#7A736A] mb-1">
                  {locale === 'ar' ? 'الحجم المفضل' : 'Bottle Volume'}
                </legend>

                <div className="flex flex-col gap-1.5">
                  {SIZE_OPTIONS.map((opt) => {
                    const isSelected = selectedSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSize(opt.id)}
                        className={`w-full p-3 text-xs font-mono rounded-[2px] border flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17]'
                            : 'bg-[#FFFFFF] text-[#554F47] border-[#E4DED3]'
                        }`}
                      >
                        <span>{locale === 'ar' ? opt.nameAr : opt.nameEn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#A98860]" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* In-Stock Toggle */}
              <div className="pt-4 border-t border-[#E4DED3] flex items-center justify-between">
                <label
                  htmlFor="mobile-filter-instock"
                  className="text-xs font-mono text-[#554F47] select-none"
                >
                  {locale === 'ar' ? 'المتوفر في المخزن فقط' : 'In-Stock Only'}
                </label>
                <input
                  id="mobile-filter-instock"
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-5 h-5 accent-[#A98860] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="pt-4 border-t border-[#E4DED3] flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleResetFilters}
                className="flex-1 font-mono text-xs uppercase"
              >
                {locale === 'ar' ? 'إعادة ضبط' : 'Reset'}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 font-mono text-xs uppercase"
              >
                {locale === 'ar'
                  ? `عرض (${sortedProducts.length})`
                  : `Show (${sortedProducts.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
