import React, { useState, useEffect, useId } from 'react';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Wind,
  Droplets,
  Award,
  PackageCheck,
  Share2,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { formatPrice } from '../../i18n/formatters';
import { Product, ProductSizeVariant, ScentFamily } from '../../types/backend';
import { RouteId, ProductData, BreadcrumbItem } from '../../types';
import { productsApi } from '../../api/productsApi';
import { mapProductToStorefrontData } from '../../utils/productAdapter';
import { Breadcrumb } from '../storefront/Breadcrumb';
import { Button } from '../storefront/Button';
import { Badge } from '../storefront/Badge';
import { QuantityStepper } from '../storefront/QuantityStepper';
import { TabGroup } from '../storefront/TabGroup';
import { Accordion } from '../storefront/Accordion';
import { ProductCard } from '../storefront/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../storefront/Toast';
import { DirectionalArrowRight, DirectionalArrowLeft } from '../ui/DirectionalIcon';

// High-resolution photography assets
import signatureFlaconImg from '../../assets/images/signature_oud_flacon_1788117377896.jpg';
import scentWoodyImg from '../../assets/images/scent_woody_1788117392771.jpg';
import scentFloralImg from '../../assets/images/scent_floral_1788117406086.jpg';
import scentOrientalImg from '../../assets/images/scent_oriental_1788117418222.jpg';
import scentFreshImg from '../../assets/images/scent_fresh_1788117430723.jpg';
import scentAmberImg from '../../assets/images/scent_amber_1788117442286.jpg';
import scentMuskImg from '../../assets/images/scent_musk_1788117455160.jpg';

export interface ProductDetailPageProps {
  productId: string;
  fromScentFamily?: ScentFamily;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct: (productId: string, fromFamily?: ScentFamily) => void;
  onNavigateToShopWithFamily?: (family: ScentFamily) => void;
}

const FAMILY_BACKGROUND_IMAGES: Record<ScentFamily, string> = {
  Woody: scentWoodyImg,
  Floral: scentFloralImg,
  Oriental: scentOrientalImg,
  Fresh: scentFreshImg,
  Amber: scentAmberImg,
  Musk: scentMuskImg,
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  fromScentFamily,
  onRouteChange,
  onNavigateToProduct,
  onNavigateToShopWithFamily,
}) => {
  const { locale, direction, t } = useI18n();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  // Primary Product State from Firestore
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Gallery & Presentation State
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('description');

  // Related products from same scent family
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState<boolean>(false);

  // Fetch Product from Firestore
  useEffect(() => {
    let isMounted = true;

    async function fetchProductDetails() {
      try {
        setIsLoading(true);
        setLoadError(null);
        setActiveImageIndex(0);
        setSelectedSizeIndex(0);
        setQuantity(1);

        const fetchedProduct = await productsApi.getProductById(productId);

        if (!isMounted) return;

        if (!fetchedProduct) {
          setLoadError(
            locale === 'ar'
              ? 'عذراً، لم نتمكن من العثور على العطر المطلوب في الأرشيف.'
              : 'The requested fragrance flacon could not be located in our archive.'
          );
          setIsLoading(false);
          return;
        }

        setProduct(fetchedProduct);
        setIsLoading(false);

        // Fetch related products from same family
        if (fetchedProduct.scentFamily) {
          setIsLoadingRelated(true);
          try {
            const familyProducts = await productsApi.getProductsByFamily(fetchedProduct.scentFamily);
            if (isMounted) {
              // Exclude current product
              setRelatedProducts(familyProducts.filter((p) => p.id !== fetchedProduct.id).slice(0, 3));
            }
          } catch (relErr) {
            console.warn('Could not load related products:', relErr);
          } finally {
            if (isMounted) {
              setIsLoadingRelated(false);
            }
          }
        }
      } catch (err: any) {
        console.error('Error reading product document from Firestore:', err);
        if (isMounted) {
          setLoadError(err.message || 'Failed to load product');
          setIsLoading(false);
        }
      }
    }

    if (productId) {
      fetchProductDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return () => {
      isMounted = false;
    };
  }, [productId, locale]);

  // Derived selected size variant
  const currentSizes: ProductSizeVariant[] = product?.sizes && product.sizes.length > 0
    ? product.sizes
    : [
        {
          size: product?.volume || '100ml',
          price: product?.price || 340,
          stock: product?.stock !== undefined ? product.stock : 12,
        },
      ];

  const selectedSizeVariant = currentSizes[selectedSizeIndex] || currentSizes[0];
  const isSizeOutOfStock = (selectedSizeVariant?.stock ?? 0) <= 0;
  const currentPrice = selectedSizeVariant?.price ?? product?.price ?? 0;
  const maxAllowedQuantity = Math.max(1, Math.min(10, selectedSizeVariant?.stock || 1));

  // Determine gallery images (multi-view architecture)
  const familyImg = product?.scentFamily ? FAMILY_BACKGROUND_IMAGES[product.scentFamily] : scentWoodyImg;
  const galleryImages: { id: string; url: string; altEn: string; altAr: string; captionEn: string; captionAr: string }[] = [
    {
      id: 'main-flacon',
      url: product?.images?.[0] || signatureFlaconImg,
      altEn: `${product?.nameEn || 'DAHR Fragrance'} hand-finished architectural glass flacon`,
      altAr: `قارورة عطر ${product?.nameAr || 'دار'} الزجاجية المنحوتة يدوياً`,
      captionEn: 'Signature Flacon & Heavy Metal Cap',
      captionAr: 'القارورة المميزة بغطاء معدني مصقول',
    },
    {
      id: 'olfactive-scene',
      url: familyImg,
      altEn: `Rare botanical raw ingredients for ${product?.nameEn || 'fragrance'}`,
      altAr: `المكونات النباتية النادرة لعطر ${product?.nameAr || 'الدار'}`,
      captionEn: 'Wild Botanical Distillations',
      captionAr: 'مستخلصات نباتية برية نادرة',
    },
  ];

  // If product has extra images from Firestore, include them
  if (product?.images && product.images.length > 1) {
    product.images.slice(1).forEach((imgUrl, idx) => {
      galleryImages.push({
        id: `extra-view-${idx + 1}`,
        url: imgUrl,
        altEn: `${product.nameEn} view angle ${idx + 2}`,
        altAr: `${product.nameAr} زاوية العرض ${idx + 2}`,
        captionEn: `Architectural Detail ${idx + 2}`,
        captionAr: `تفاصيل معمارية ${idx + 2}`,
      });
    });
  }

  // Wishlist handler
  const isCurrentWishlisted = product ? isWishlisted(product.id) : false;
  const handleWishlistToggle = () => {
    if (!product) return;
    const nowWishlisted = toggleWishlist(product.id);
    addToast({
      type: 'success',
      title: nowWishlisted
        ? (locale === 'ar' ? 'أضيف إلى المفضلة' : 'Saved to Wishlist')
        : (locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist'),
      message: locale === 'ar'
        ? `تم حفظ ${product.nameAr} في قائمة رغباتك الخاصة.`
        : `${product.nameEn} has been updated in your curated wishlist.`,
    });
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!product || isSizeOutOfStock) return;

    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      concentrationEn: product.concentration || 'Extrait de Parfum (32%)',
      concentrationAr: product.concentration || 'خلاصة عطرية نقية (32%)',
      volumeEn: selectedSizeVariant.size,
      volumeAr: selectedSizeVariant.size,
      price: currentPrice,
      quantity,
      size: selectedSizeVariant.size,
      image: galleryImages[0]?.url,
    });

    addToast({
      type: 'success',
      title: locale === 'ar' ? 'أضيف إلى حقيبة التسوق' : 'Added to Shopping Bag',
      message: locale === 'ar'
        ? `${product.nameAr} (${selectedSizeVariant.size}) × ${quantity}`
        : `${product.nameEn} (${selectedSizeVariant.size}) × ${quantity}`,
    });
  };

  // Keyboard navigation for image gallery
  const handleGalleryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  // ---------------------------------------------------------------------------
  // SKELETON LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-16 py-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-64 bg-[#E4DED3]/60 rounded-[2px] mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="w-full aspect-[4/5] bg-[#E4DED3]/40 rounded-[2px] border border-[#E4DED3]" />
            <div className="flex gap-3">
              <div className="w-20 h-24 bg-[#E4DED3]/40 rounded-[2px]" />
              <div className="w-20 h-24 bg-[#E4DED3]/40 rounded-[2px]" />
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="h-3 w-32 bg-[#E4DED3]/60 rounded-[2px]" />
            <div className="h-10 w-3/4 bg-[#E4DED3]/60 rounded-[2px]" />
            <div className="h-6 w-28 bg-[#E4DED3]/60 rounded-[2px]" />
            <div className="h-20 w-full bg-[#E4DED3]/40 rounded-[2px]" />
            <div className="h-12 w-full bg-[#E4DED3]/50 rounded-[2px]" />
            <div className="h-14 w-full bg-[#E4DED3]/60 rounded-[2px]" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR OR NOT FOUND STATE
  // ---------------------------------------------------------------------------
  if (loadError || !product) {
    return (
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-16 py-16 text-center">
        <div className="p-12 border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px] max-w-xl mx-auto flex flex-col items-center gap-6">
          <AlertCircle className="w-10 h-10 text-[#A98860]" />
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl text-[#1C1A17]">
              {locale === 'ar' ? 'لم يتم العثور على العطر' : 'Fragrance Flacon Not Found'}
            </h2>
            <p className="text-sm font-body text-[#7A736A] leading-relaxed">
              {loadError || (locale === 'ar' ? 'هذا الإصدار غير متوفر حالياً في الأرشيف.' : 'This flacon is not currently cataloged.')}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => onRouteChange('shop')}
            rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
          >
            {locale === 'ar' ? 'العودة لكتالوج العطور' : 'Return to Fragrance Shop'}
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // BREADCRUMBS DATA
  // ---------------------------------------------------------------------------
  const effectiveFamily = fromScentFamily || product.scentFamily;
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: locale === 'ar' ? 'الرئيسية' : 'Home',
      onClick: () => onRouteChange('home'),
    },
    {
      label: locale === 'ar' ? 'المتجر' : 'Shop',
      onClick: () => onRouteChange('shop'),
    },
  ];

  if (effectiveFamily) {
    breadcrumbItems.push({
      label: locale === 'ar'
        ? (effectiveFamily === 'Woody' ? 'خشبية' : effectiveFamily === 'Floral' ? 'زهرية' : effectiveFamily === 'Oriental' ? 'شرقية' : effectiveFamily === 'Fresh' ? 'منعشة' : effectiveFamily === 'Amber' ? 'عنبرية' : 'مسكية')
        : effectiveFamily,
      onClick: () => {
        if (onNavigateToShopWithFamily) {
          onNavigateToShopWithFamily(effectiveFamily);
        } else {
          onRouteChange('shop');
        }
      },
    });
  }

  breadcrumbItems.push({
    label: locale === 'ar' ? product.nameAr : product.nameEn,
    active: true,
  });

  // Fragrance Notes extraction
  const topNotes = locale === 'ar'
    ? (product.notesAr?.top || product.notes?.top || 'خشب العود الكمبودي المعتق، بتلات الزعفران، البرغموت الملكي')
    : (product.notes?.top || 'Aged Wild Cambodian Agarwood, Saffron Stigmas, Royal Bergamot');

  const heartNotes = locale === 'ar'
    ? (product.notesAr?.heart || product.notes?.heart || 'خشب البتولا المدخن، ورد الطائف الجبلي، راتنج اللبان الحوجري')
    : (product.notes?.heart || 'Smoked Highland Birch Bark, Mountain Taif Rose, Royal Hojari Frankincense');

  const baseNotes = locale === 'ar'
    ? (product.notesAr?.base || product.notes?.base || 'عنبر رمادي طبيعي، أخشاب الأرز الأطلسي، جلد معتق، مسك نقي')
    : (product.notes?.base || 'Natural Grey Sea Ambergris, Atlas Cedarwood, Aged Leather Accord, White Suede');

  const sensoryDescription = locale === 'ar'
    ? (product.descriptionAr || product.sensoryDescription || 'تكوين عطري فاخر يجسد حواراً أزلياً بين عمق خشب العود المعتق ونقاء الزهور النادرة.')
    : (product.descriptionEn || product.sensoryDescription || 'An architectural convergence of aged wild agarwood and rare desert florals, formulated at pure extrait concentration.');

  return (
    <div id="product-detail-page" className="w-full bg-[#FAF7F2] min-h-screen text-start pb-24 lg:pb-16">
      {/* 1. BREADCRUMBS BAR */}
      <div className="border-b border-[#E4DED3] bg-[#FAF7F2]/80 backdrop-blur-xs sticky top-20 z-30">
        <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-16 py-3 flex items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />

          {/* Quick Back to Shop link */}
          <button
            type="button"
            onClick={() => onRouteChange('shop')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#7A736A] hover:text-[#1C1A17] transition-colors cursor-pointer"
          >
            <DirectionalArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN EDITORIAL PDP SHOWCASE CONTAINER */}
      <main className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT: LARGE PHOTOGRAPHY GALLERY (NO FLOATING ELEMENTS OVER THE IMAGE)     */}
          {/* ========================================================================= */}
          <section
            aria-label={locale === 'ar' ? 'معرض صور العطر' : 'Fragrance Photography Gallery'}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Primary Large Photography Canvas (STRICT CONSTRAINT: No floating overlays) */}
            <div
              id="pdp-main-image-canvas"
              className="relative w-full aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] overflow-hidden flex items-center justify-center p-8 sm:p-12 shadow-xs transition-colors"
            >
              {/* Product Photography Display */}
              <img
                src={galleryImages[activeImageIndex]?.url}
                alt={locale === 'ar' ? galleryImages[activeImageIndex]?.altAr : galleryImages[activeImageIndex]?.altEn}
                className="w-full h-full object-contain max-h-[540px] drop-shadow-sm select-none transition-all duration-300"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Gallery Thumbnail Row & Angle Selector */}
            <div
              className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 focus:outline-none"
              tabIndex={0}
              role="region"
              aria-label={locale === 'ar' ? 'الصور المصغرة للمعرض' : 'Gallery Thumbnails'}
              onKeyDown={handleGalleryKeyDown}
            >
              {galleryImages.map((img, idx) => {
                const isSelected = activeImageIndex === idx;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`${locale === 'ar' ? img.captionAr : img.captionEn} (${idx + 1} of ${galleryImages.length})`}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`
                      relative shrink-0 w-20 sm:w-24 aspect-[4/5] bg-[#F5F1EA] border rounded-[2px] overflow-hidden p-2
                      transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A98860] focus-visible:outline-none
                      ${isSelected
                        ? 'border-[#1C1A17] ring-1 ring-[#1C1A17] bg-[#FFFFFF] shadow-xs'
                        : 'border-[#E4DED3] hover:border-[#7A736A] opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={img.url}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Active indicator dot */}
                    {isSelected && (
                      <span className="absolute bottom-1 end-1 w-1.5 h-1.5 rounded-full bg-[#1C1A17]" />
                    )}
                  </button>
                );
              })}

              {/* Caption note */}
              <div className="ps-2 flex flex-col justify-center text-xs font-mono text-[#7A736A] border-s border-[#E4DED3] shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-[#A98860]">
                  {locale === 'ar' ? 'العرض المختار' : 'Current View'}
                </span>
                <span className="text-[#1C1A17] font-medium">
                  {locale === 'ar' ? galleryImages[activeImageIndex]?.captionAr : galleryImages[activeImageIndex]?.captionEn}
                </span>
              </div>
            </div>

            {/* Editorial Heritage Callout Box below photography */}
            <div className="p-6 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-start gap-4">
              <Award className="w-5 h-5 text-[#A98860] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-start">
                <h4 className="font-serif text-sm text-[#1C1A17] font-medium">
                  {locale === 'ar' ? 'صياغة يدوية فائقة التركيز في غراس والرياض' : 'Macerated & Hand-Poured in Grasse & Riyadh'}
                </h4>
                <p className="text-xs text-[#7A736A] font-body leading-relaxed">
                  {locale === 'ar'
                    ? 'يتم تعتيق كل دفعة عطرية لمدة لا تقل عن 12 أسبوعاً في أوعية زجاجية معتمة لضمان اندماج الزيوت الطبيعية النقية دون أي مرشحات صناعية.'
                    : 'Each harvest is aged for 12 weeks in dark glass vessels to permit natural harmonic binding of wild agarwoods and mountain resins.'}
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* RIGHT: EDITORIAL PRODUCT INFORMATION & PURCHASE ENGINE                    */}
          {/* ========================================================================= */}
          <section
            aria-label={locale === 'ar' ? 'تفاصيل ومعلومات العطر' : 'Fragrance Details and Purchasing'}
            className="lg:col-span-5 flex flex-col gap-8 text-start"
          >
            {/* Header / Eyebrow Info */}
            <div className="flex flex-col gap-2.5 pb-6 border-b border-[#E4DED3]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                    DAHR
                  </span>
                  <span className="text-[#E4DED3]">•</span>
                  <Badge variant="neutral" size="sm">
                    {locale === 'ar'
                      ? (product.scentFamily === 'Woody' ? 'عائلة الأخشاب' : product.scentFamily === 'Floral' ? 'عائلة الزهور' : product.scentFamily === 'Oriental' ? 'عائلة الشرقية' : product.scentFamily === 'Fresh' ? 'عائلة المنعشة' : product.scentFamily === 'Amber' ? 'عائلة العنبر' : 'عائلة المسك')
                      : `${product.scentFamily} Scent Family`}
                  </Badge>
                  {product.flags?.isSignature && (
                    <Badge variant="accent" size="sm">
                      {locale === 'ar' ? 'الإصدار الأيقوني' : 'Signature Flacon'}
                    </Badge>
                  )}
                </div>

                {/* Stock Indicator Status */}
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-[2px] border ${
                  isSizeOutOfStock
                    ? 'bg-[#FBEBE8] text-[#8C3B2E] border-[#E8C4BE]'
                    : (selectedSizeVariant?.stock ?? 10) <= 5
                    ? 'bg-[#FFF8E7] text-[#9E6B00] border-[#F2DEB0]'
                    : 'bg-[#F2F7F2] text-[#2E6A38] border-[#C3DEC7]'
                }`}>
                  {isSizeOutOfStock
                    ? (locale === 'ar' ? 'نفدت الكمية' : 'Out of Stock')
                    : (selectedSizeVariant?.stock ?? 10) <= 5
                    ? (locale === 'ar' ? `متبقي ${selectedSizeVariant.stock} فقط` : `Low Stock: ${selectedSizeVariant.stock} left`)
                    : (locale === 'ar' ? 'متوفر للشحن الفوري' : 'In Stock')}
                </span>
              </div>

              {/* Fragrance Name (Bilingual Editorial Display) */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl text-[#1C1A17] font-normal tracking-tight leading-tight">
                {locale === 'ar' ? product.nameAr : product.nameEn}
              </h1>

              {/* Sub-name in alternate language */}
              <span className="text-xs font-mono text-[#7A736A]">
                {locale === 'ar' ? product.nameEn : product.nameAr} • {product.concentration || 'Extrait de Parfum'}
              </span>

              {/* Dynamic Price Display */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#1C1A17]">
                  {formatPrice(currentPrice, locale, { currency: 'USD' })}
                </span>
                <span className="text-xs font-mono text-[#7A736A]">
                  {locale === 'ar' ? 'شامل الشحن المبرد وضريبة القيمة المضافة' : 'Includes climate courier & taxes'}
                </span>
              </div>

              {/* Sensory Subtitle Descriptor */}
              <p className="text-sm sm:text-[15px] font-body text-[#554F47] leading-relaxed pt-2">
                {sensoryDescription}
              </p>
            </div>

            {/* Size Variants & Real Firestore Stock Selector */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-[#1C1A17] font-medium">
                  {locale === 'ar' ? 'اختر حجم القارورة' : 'Select Flacon Volume'}
                </label>
                <span className="text-xs font-mono text-[#7A736A]">
                  {selectedSizeVariant.size} ({selectedSizeVariant.stock > 0 ? `${selectedSizeVariant.stock} ${locale === 'ar' ? 'متاحة' : 'available'}` : (locale === 'ar' ? 'غير متوفر' : 'Unavailable')})
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label={locale === 'ar' ? 'أحجام العطر المتاحة' : 'Available Flacon Sizes'}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {currentSizes.map((variant, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  const isVariantOutOfStock = variant.stock <= 0;

                  return (
                    <button
                      key={variant.size}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={isVariantOutOfStock}
                      disabled={isVariantOutOfStock}
                      onClick={() => {
                        setSelectedSizeIndex(idx);
                        setQuantity(1);
                      }}
                      className={`
                        p-3.5 rounded-[2px] border text-start flex flex-col justify-between gap-2 transition-all cursor-pointer
                        focus-visible:ring-2 focus-visible:ring-[#A98860] focus-visible:outline-none
                        ${isSelected
                          ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17] shadow-xs'
                          : isVariantOutOfStock
                          ? 'bg-[#FAF7F2]/60 text-[#A0988E] border-[#E4DED3] cursor-not-allowed opacity-60'
                          : 'bg-[#FFFFFF] text-[#1C1A17] border-[#E4DED3] hover:border-[#1C1A17]'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm font-serif font-medium ${isSelected ? 'text-[#FAF7F2]' : 'text-[#1C1A17]'}`}>
                          {variant.size} {locale === 'ar' ? 'قارورة' : 'Flacon'}
                        </span>
                        <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-[#D4C3A3]' : 'text-[#1C1A17]'}`}>
                          {formatPrice(variant.price, locale, { currency: 'USD' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={isSelected ? 'text-[#FAF7F2]/80' : 'text-[#7A736A]'}>
                          {variant.size === '100ml'
                            ? (locale === 'ar' ? 'الحجم الأيقوني الكامل' : 'Standard Full Flacon')
                            : variant.size === '50ml'
                            ? (locale === 'ar' ? 'حجم السفر الفاخر' : 'Compact Travel Edition')
                            : (locale === 'ar' ? 'حجم الاكتشاف المصغر' : 'Discovery Vial')}
                        </span>
                        <span className={
                          isVariantOutOfStock
                            ? 'text-[#8C3B2E] font-medium'
                            : isSelected
                            ? 'text-[#FAF7F2]/90'
                            : 'text-[#7A736A]'
                        }>
                          {isVariantOutOfStock
                            ? (locale === 'ar' ? 'نفدت الكمية' : 'Out of stock')
                            : variant.stock <= 5
                            ? (locale === 'ar' ? `متبقي ${variant.stock}` : `${variant.stock} left`)
                            : (locale === 'ar' ? 'متوفر' : 'In stock')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Add to Bag / Wishlist Cluster */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <label htmlFor="pdp-quantity-stepper" className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                    {locale === 'ar' ? 'الكمية' : 'Quantity'}
                  </label>
                  <QuantityStepper
                    id="pdp-quantity-stepper"
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={maxAllowedQuantity}
                    disabled={isSizeOutOfStock}
                    size="md"
                  />
                </div>

                {/* Wishlist Toggle Button (Heart icon, aria-pressed, clean dignified icon button) */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                    {locale === 'ar' ? 'المفضلة' : 'Wishlist'}
                  </span>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    aria-pressed={isCurrentWishlisted}
                    aria-label={
                      isCurrentWishlisted
                        ? (locale === 'ar' ? 'إزالة العطر من قائمة الرغبات' : 'Remove fragrance from wishlist')
                        : (locale === 'ar' ? 'إضافة العطر لقائمة الرغبات' : 'Add fragrance to wishlist')
                    }
                    title={isCurrentWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    className={`
                      w-11 h-11 flex items-center justify-center rounded-[2px] border transition-all cursor-pointer
                      focus-visible:ring-2 focus-visible:ring-[#A98860] focus-visible:outline-none
                      ${isCurrentWishlisted
                        ? 'bg-[#FAF7F2] text-[#A98860] border-[#A98860]'
                        : 'bg-[#FFFFFF] text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17] hover:border-[#1C1A17]'
                      }
                    `}
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform ${isCurrentWishlisted ? 'fill-[#A98860] scale-110' : 'hover:scale-105'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Primary Add to Cart Button */}
              <Button
                id="pdp-add-to-cart-button"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSizeOutOfStock}
                onClick={handleAddToCart}
                rightIcon={<DirectionalArrowRight className="w-5 h-5" />}
                className="py-4 text-base"
              >
                {isSizeOutOfStock
                  ? (locale === 'ar' ? 'نفدت كمية هذا الحجم' : 'Selected Volume Out of Stock')
                  : `${t('actions.addToBag')} • ${formatPrice(currentPrice * quantity, locale, { currency: 'USD' })}`}
              </Button>
            </div>

            {/* Assurance Badges (Complimentary sample vial + courier delivery) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E4DED3]">
              <div className="p-3 bg-[#FFFFFF] border border-[#E4DED3] rounded-[2px] flex items-start gap-2.5">
                <PackageCheck className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
                <div className="flex flex-col text-start">
                  <span className="text-xs font-mono font-medium text-[#1C1A17]">
                    {locale === 'ar' ? 'عينة تجربة مجانية مرفقة' : 'Complimentary 2ml Test Vial'}
                  </span>
                  <span className="text-[11px] font-body text-[#7A736A]">
                    {locale === 'ar' ? 'جرب العينة على البشرة قبل فتح ختم القارورة الرئيسية' : 'Experience on skin before unsealing main flacon'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FFFFFF] border border-[#E4DED3] rounded-[2px] flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
                <div className="flex flex-col text-start">
                  <span className="text-xs font-mono font-medium text-[#1C1A17]">
                    {locale === 'ar' ? 'شحن مبرد فاخر مجاني' : 'Temperature-Controlled GCC Shipping'}
                  </span>
                  <span className="text-[11px] font-body text-[#7A736A]">
                    {locale === 'ar' ? 'توصيل سريع وآمن لكافة دول الخليج' : 'Dispatched in insulated luxury gift packaging'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* FRAGRANCE NOTES: EDITORIAL TYPOGRAPHY-LED ARCHITECTURE                    */}
            {/* ========================================================================= */}
            <div
              id="pdp-olfactive-notes-section"
              className="p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-5 text-start"
            >
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#A98860]" />
                  <h3 className="font-serif text-lg text-[#1C1A17]">
                    {locale === 'ar' ? 'البناء والهيكل العطري' : 'Olfactive Architecture'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {product.concentration || 'Extrait 32%'}
                </span>
              </div>

              {/* Three-Tier Editorial Typography Notes List */}
              <div className="space-y-4">
                {/* 1. TOP NOTES */}
                <div className="flex flex-col gap-1 border-b border-[#E4DED3]/60 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A98860] font-semibold">
                      {locale === 'ar' ? 'الافتتاحية العطرية • 0–30 دقيقة' : 'HEAD / OPENING • 0–30 MIN'}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A736A]">
                      {locale === 'ar' ? 'إشراق أولي' : 'Top Volatiles'}
                    </span>
                  </div>
                  <p className="font-serif text-base sm:text-[17px] text-[#1C1A17] leading-relaxed">
                    {topNotes}
                  </p>
                </div>

                {/* 2. HEART NOTES */}
                <div className="flex flex-col gap-1 border-b border-[#E4DED3]/60 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A98860] font-semibold">
                      {locale === 'ar' ? 'القلب العطري • 30 دقيقة – 4 ساعات' : 'HEART / CORE • 30 MIN – 4 HRS'}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A736A]">
                      {locale === 'ar' ? 'عمق التكوين' : 'Harmonic Core'}
                    </span>
                  </div>
                  <p className="font-serif text-base sm:text-[17px] text-[#1C1A17] leading-relaxed">
                    {heartNotes}
                  </p>
                </div>

                {/* 3. BASE NOTES */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A98860] font-semibold">
                      {locale === 'ar' ? 'القاعدة العطرية • حتى 24 ساعة+' : 'BASE / ENDURING • 24+ HRS'}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A736A]">
                      {locale === 'ar' ? 'ثبات وأثر دائم' : 'Enduring Sillage'}
                    </span>
                  </div>
                  <p className="font-serif text-base sm:text-[17px] text-[#1C1A17] leading-relaxed">
                    {baseNotes}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TABS / ACCORDION: DESCRIPTION, NOTES, SHIPPING & RETURNS                   */}
            {/* ========================================================================= */}
            <div className="pt-2">
              <Accordion
                items={[
                  {
                    id: 'acc-description',
                    title: locale === 'ar' ? 'الوصف الحسي والسرد العطري' : 'Sensory Narrative & Perfumer Notes',
                    content: (
                      <div className="space-y-3 text-sm font-body text-[#554F47] leading-relaxed pt-1">
                        <p>{sensoryDescription}</p>
                        <p>
                          {locale === 'ar'
                            ? `يعد عطر ${product.nameAr} من إبداعات الدار المميزة التي تجمع بين أندر الزيوت الطبيعية النقية بتركيز ${product.concentration || '32% Extrait de Parfum'}. كل قارورة يتم فحصها يدوياً وتعبئتها في صندوق فاخر يحمل رقماً تسلسلياً فريداً.`
                            : `Crafted as a testament to restrained Middle Eastern elegance, ${product.nameEn} utilizes raw oils hand-harvested and steam-distilled under the stewardship of master perfumers. Formulated at a concentrated ${product.concentration || '32% Extrait'} ratio for extended olfactory longevity.`}
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: 'acc-shipping',
                    title: locale === 'ar' ? 'الشحن، التوصيل والإرجاع' : 'Shipping, Delivery & Returns',
                    content: (
                      <div className="space-y-3 text-sm font-body text-[#554F47] leading-relaxed pt-1">
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#A98860] shrink-0 mt-1" />
                          <p>
                            {locale === 'ar'
                              ? 'شحن مجاني ومكيف لجميع مدن المملكة العربية السعودية ودول الخليج خلال 24–48 ساعة عمل.'
                              : 'Complimentary insured, climate-regulated delivery across the GCC within 24 to 48 business hours.'}
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#A98860] shrink-0 mt-1" />
                          <p>
                            {locale === 'ar'
                              ? 'يتضمن كل طلب عينة تجربة 2 مل متطابقة. يمكنك تجربة العينة على البشرة وإرجاع القارورة الرئيسية المغلفة في غضون 14 يوماً مع استرداد كامل المبلغ.'
                              : 'Each delivery includes an identical 2ml discovery vial. Enjoy testing the vial; if not completely captivated, return the unsealed main presentation box within 14 days for a full refund.'}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'acc-ritual',
                    title: locale === 'ar' ? 'طقوس الاستخدام وحفظ العطر' : 'Application Ritual & Conservation',
                    content: (
                      <div className="space-y-3 text-sm font-body text-[#554F47] leading-relaxed pt-1">
                        <p>
                          {locale === 'ar'
                            ? 'نظراً لارتفاع تركيز الزيوت النقية، يوصى برش العطر من مسافة 15 سم على نقاط النبض (خلف الأذنين، المعصمين، والرقبة) دون فرك البشرة للسماح للنوتات بالانفتاح الطبيعي على مدار اليوم.'
                            : 'Due to the heightened extrait concentration, apply 1-2 sprays directly onto warm pulse points without rubbing wrists together, preserving the structural evolution of top volatile molecules.'}
                        </p>
                      </div>
                    ),
                  },
                ]}
                allowMultiple={false}
                defaultOpenIndex={0}
              />
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* COMPLEMENTARY FLACONS / RELATED FRAGRANCES                                */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section
            aria-label={locale === 'ar' ? 'عطور أخرى متناغمة' : 'Complementary Flacons'}
            className="mt-20 sm:mt-28 pt-12 border-t border-[#E4DED3] flex flex-col gap-8 text-start"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                  {locale === 'ar' ? 'من نفس العائلة العطرية' : `From the ${product.scentFamily} Library`}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17]">
                  {locale === 'ar' ? 'إصدارات عطرية متناغمة' : 'Complementary Olfactive Creations'}
                </h2>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (onNavigateToShopWithFamily && product.scentFamily) {
                    onNavigateToShopWithFamily(product.scentFamily);
                  } else {
                    onRouteChange('shop');
                  }
                }}
                rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
              >
                {locale === 'ar' ? 'استكشاف كافة العطور' : 'View Full Catalog'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((relProduct) => {
                const mappedCard = mapProductToStorefrontData(relProduct);
                return (
                  <ProductCard
                    key={relProduct.id}
                    id={`pdp-related-${relProduct.id}`}
                    product={mappedCard}
                    onAddToCart={(p) => {
                      addItem({
                        productId: p.id,
                        nameEn: p.nameEn,
                        nameAr: p.nameAr,
                        price: p.price,
                        volumeEn: p.volumeEn,
                        volumeAr: p.volumeAr,
                        quantity: 1,
                      });
                    }}
                    onSelect={() => onNavigateToProduct(relProduct.id, product.scentFamily)}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE STICKY ADD-TO-CART BAR (lg:hidden)                                 */}
      {/* ========================================================================= */}
      <div
        id="mobile-sticky-pdp-bar"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E4DED3] p-4 lg:hidden shadow-lg animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-full max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col text-start overflow-hidden">
            <span className="font-serif text-sm font-medium text-[#1C1A17] truncate">
              {locale === 'ar' ? product.nameAr : product.nameEn}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-[#7A736A]">
              <span>{selectedSizeVariant.size}</span>
              <span>•</span>
              <span className="font-semibold text-[#1C1A17]">
                {formatPrice(currentPrice * quantity, locale, { currency: 'USD' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist mini toggle */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={locale === 'ar' ? 'قائمة الرغبات' : 'Wishlist'}
              className={`p-2.5 rounded-[2px] border transition-colors cursor-pointer ${
                isCurrentWishlisted
                  ? 'bg-[#FAF7F2] text-[#A98860] border-[#A98860]'
                  : 'bg-[#FFFFFF] text-[#7A736A] border-[#E4DED3]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isCurrentWishlisted ? 'fill-[#A98860]' : ''}`} />
            </button>

            {/* Mobile Add button */}
            <Button
              variant="primary"
              size="md"
              disabled={isSizeOutOfStock}
              onClick={handleAddToCart}
              rightIcon={<ShoppingBag className="w-4 h-4" />}
            >
              {isSizeOutOfStock ? (locale === 'ar' ? 'نفد' : 'Out of stock') : t('actions.addToBag')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
