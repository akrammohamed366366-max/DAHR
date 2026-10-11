import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, ShieldCheck, Mail, MapPin, Phone, ArrowRight, Check, Loader2, Filter, X, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { RouteId, ProductData } from '../types';
import { Product, ScentFamily, JournalArticle } from '../types/backend';
import { Button } from '../components/storefront/Button';
import { Breadcrumb } from '../components/storefront/Breadcrumb';
import { ProductCard } from '../components/storefront/ProductCard';
import { Input } from '../components/storefront/Input';
import { Select } from '../components/storefront/Select';
import { DirectionalArrowRight } from '../components/ui/DirectionalIcon';
import { COLLECTIONS_DATA } from '../components/storefront/CollectionsDropdown';
import { useToast } from '../components/storefront/Toast';
import { productsApi } from '../api/productsApi';
import { journalApi } from '../api/journalApi';
import { mapProductToStorefrontData } from '../utils/productAdapter';
import { BrandPhilosophySection } from '../components/home/BrandPhilosophySection';
import { JournalPreviewSection } from '../components/home/JournalPreviewSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { pageFadeVariants } from '../utils/motion';
import heroVisualPath from '../assets/images/hero_editorial_visual_1788041813228.jpg';
import brandStoryImg from '../assets/images/brand_story_editorial_1788042561323.jpg';
import signatureFlaconImg from '../assets/images/signature_oud_flacon_1788117377896.jpg';
import scentWoodyImg from '../assets/images/scent_woody_1788117392771.jpg';
import scentFloralImg from '../assets/images/scent_floral_1788117406086.jpg';
import scentOrientalImg from '../assets/images/scent_oriental_1788117418222.jpg';
import scentFreshImg from '../assets/images/scent_fresh_1788117430723.jpg';
import scentAmberImg from '../assets/images/scent_amber_1788117442286.jpg';
import scentMuskImg from '../assets/images/scent_musk_1788117455160.jpg';

// Code-split storefront sub-views
const ShopCatalog = lazy(() =>
  import('../components/shop/ShopCatalog').then((m) => ({ default: m.ShopCatalog }))
);
const QuickViewModal = lazy(() =>
  import('../components/shop/QuickViewModal').then((m) => ({ default: m.QuickViewModal }))
);
const ProductDetailPage = lazy(() =>
  import('../components/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const AboutBrandStory = lazy(() =>
  import('../components/about/AboutBrandStory').then((m) => ({ default: m.AboutBrandStory }))
);
const JournalListing = lazy(() =>
  import('../components/journal/JournalListing').then((m) => ({ default: m.JournalListing }))
);
const ArticleDetailPage = lazy(() =>
  import('../components/journal/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage }))
);
const ContactPage = lazy(() =>
  import('../components/contact/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const LegalDocumentPage = lazy(() =>
  import('../components/legal/LegalDocumentPage').then((m) => ({ default: m.LegalDocumentPage }))
);
const AccountPage = lazy(() =>
  import('../components/account/AccountPage').then((m) => ({ default: m.AccountPage }))
);

const SubviewLoader: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 text-[#7A736A] font-mono text-[12px]">
      <Loader2 className="w-5 h-5 animate-spin text-[#A98860]" />
      <span className="tracking-widest uppercase">{t('common.loadingAtelier')}</span>
    </div>
  );
};

interface StorefrontPublicViewProps {
  activeRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
}

interface ScentFamilyTile {
  id: ScentFamily;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  image: string;
}

const SCENT_FAMILIES_DATA: ScentFamilyTile[] = [
  {
    id: 'Woody',
    nameEn: 'Woody',
    nameAr: 'الأخشاب',
    subtitleEn: 'Agarwood & Smoked Birch',
    subtitleAr: 'عود بري وبتولا مدخنة',
    image: scentWoodyImg,
  },
  {
    id: 'Floral',
    nameEn: 'Floral',
    nameAr: 'الزهور',
    subtitleEn: 'Taif Rose & Dawn Dew',
    subtitleAr: 'ورد طائفي وندى الفجر',
    image: scentFloralImg,
  },
  {
    id: 'Oriental',
    nameEn: 'Oriental',
    nameAr: 'الشرقي',
    subtitleEn: 'Hojari Incense & Spices',
    subtitleAr: 'لبان حوجري وتوابل نادرة',
    image: scentOrientalImg,
  },
  {
    id: 'Fresh',
    nameEn: 'Fresh',
    nameAr: 'الانتعاش',
    subtitleEn: 'Desert Citrus & Neroli',
    subtitleAr: 'حمضيات الواحة ونيرولي',
    image: scentFreshImg,
  },
  {
    id: 'Amber',
    nameEn: 'Amber',
    nameAr: 'العنبر',
    subtitleEn: 'Grey Ambergris & Labdanum',
    subtitleAr: 'عنبر رمادي خام ولادن',
    image: scentAmberImg,
  },
  {
    id: 'Musk',
    nameEn: 'Musk',
    nameAr: 'المسك',
    subtitleEn: 'White Musk & Orris Butter',
    subtitleAr: 'مسك بلوري وزبدة السوسن',
    image: scentMuskImg,
  },
];

export const SAMPLE_STOREFRONT_PRODUCTS: ProductData[] = [
  {
    id: 'prod-01',
    brand: 'DAHR',
    nameEn: 'Oud Al-Waqt',
    nameAr: 'عود الوقت',
    olfactiveFamilyEn: 'Woody Extrait',
    olfactiveFamilyAr: 'خلاصة خشبية نادرة',
    concentrationEn: 'Extrait de Parfum (38%)',
    concentrationAr: 'خلاصة عطرية مركزة (38%)',
    volumeEn: '100ml / 3.4 fl oz',
    volumeAr: '100 مل / 3.4 أونصة',
    price: 340,
    currencyEn: 'USD',
    currencyAr: 'ر.س',
    topNotesEn: 'Cambodian Oud, Birch, Ambergris',
    topNotesAr: 'عود كمبودي، بتولا، عنبر خام',
    isNew: true,
    inStock: true,
  },
  {
    id: 'prod-02',
    brand: 'DAHR',
    nameEn: 'Taif Dawn Rose',
    nameAr: 'ورد الطائف فجراً',
    olfactiveFamilyEn: 'Solar Highland Rose',
    olfactiveFamilyAr: 'ورد جبلي مشرق',
    concentrationEn: 'Eau de Parfum (24%)',
    concentrationAr: 'ماء عطر مركز (24%)',
    volumeEn: '100ml / 3.4 fl oz',
    volumeAr: '100 مل / 3.4 أونصة',
    price: 280,
    currencyEn: 'USD',
    currencyAr: 'ر.س',
    topNotesEn: 'Taif Rose Petals, Pink Peppercorn',
    topNotesAr: 'بتلات ورد الطائف، فلفل وردي',
    inStock: true,
  },
  {
    id: 'prod-03',
    brand: 'DAHR',
    nameEn: 'Santalum Asir',
    nameAr: 'صندل عسير',
    olfactiveFamilyEn: 'Velvet Resinous Sandalwood',
    olfactiveFamilyAr: 'خشب صندل مخملي وراتنج',
    concentrationEn: 'Extrait de Parfum (35%)',
    concentrationAr: 'خلاصة عطرية مركزة (35%)',
    volumeEn: '100ml / 3.4 fl oz',
    volumeAr: '100 مل / 3.4 أونصة',
    price: 320,
    currencyEn: 'USD',
    currencyAr: 'ر.س',
    topNotesEn: 'Mysore Sandalwood, Frankincense, Saffron',
    topNotesAr: 'صندل مايسور، لبان حوجري، زعفران',
    isLimited: true,
    inStock: true,
  },
  {
    id: 'prod-04',
    brand: 'DAHR',
    nameEn: 'Ambra Nocturne',
    nameAr: 'عنبر الليل',
    olfactiveFamilyEn: 'Deep Balsamic Amber',
    olfactiveFamilyAr: 'عنبر بلسمي عميق',
    concentrationEn: 'Extrait de Parfum (40%)',
    concentrationAr: 'خلاصة عطرية نقية (40%)',
    volumeEn: '50ml / 1.7 fl oz',
    volumeAr: '50 مل / 1.7 أونصة',
    price: 390,
    currencyEn: 'USD',
    currencyAr: 'ر.س',
    topNotesEn: 'Grey Ambergris, Labdanum, Vanilla Bean',
    topNotesAr: 'عنبر رمادي، لبان، حبوب الفانيليا',
    inStock: true,
  },
];

export const StorefrontPublicView: React.FC<StorefrontPublicViewProps> = ({
  activeRoute,
  onRouteChange,
}) => {
  const { locale, direction, t } = useI18n();
  const { addToast } = useToast();

  // Dynamic Featured Collection & Signature Fragrance State
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [signatureProduct, setSignatureProduct] = useState<Product | null>(null);
  const [isLoadingSignature, setIsLoadingSignature] = useState<boolean>(true);

  // Scent Family Filter state for Shop navigation
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<ScentFamily | 'all'>('all');
  const [shopSearchQuery, setShopSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/[?&]search=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return '';
  });

  // Product Detail View State
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return 'prod-oud-al-waqt';
  });
  const [fromScentFamily, setFromScentFamily] = useState<ScentFamily | undefined>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/[?&]family=([^&]+)/);
      if (match && match[1]) {
        return match[1] as ScentFamily;
      }
    }
    return undefined;
  });

  // Journal State for Journal Route & Article Reader
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('journal')) {
        const match = hash.match(/[?&]id=([^&]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return null;
  });

  // Listen for hash changes to sync selectedProductId & selectedArticleId & search query
  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        const idMatch = hash.match(/[?&]id=([^&]+)/);
        if (hash.includes('product-detail') && idMatch && idMatch[1]) {
          setSelectedProductId(idMatch[1]);
        }
        if (hash.includes('journal')) {
          if (idMatch && idMatch[1]) {
            setSelectedArticleId(idMatch[1]);
          } else {
            setSelectedArticleId(null);
          }
        }
        const famMatch = hash.match(/[?&]family=([^&]+)/);
        if (famMatch && famMatch[1]) {
          setSelectedFamilyFilter(famMatch[1] as ScentFamily);
          setFromScentFamily(famMatch[1] as ScentFamily);
        }
        const searchMatch = hash.match(/[?&]search=([^&]+)/);
        if (searchMatch && searchMatch[1]) {
          setShopSearchQuery(decodeURIComponent(searchMatch[1]));
        } else if (hash.includes('shop') && !searchMatch) {
          setShopSearchQuery('');
        }
      }
    };

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleNavigateToProduct = (productId: string, family?: ScentFamily) => {
    setSelectedProductId(productId);
    if (family) {
      setFromScentFamily(family);
    }
    onRouteChange('product-detail');
    if (typeof window !== 'undefined') {
      window.location.hash = `product-detail?id=${productId}${family ? `&family=${family}` : ''}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToShopWithFamily = (family: ScentFamily) => {
    setSelectedFamilyFilter(family);
    onRouteChange('shop');
    if (typeof window !== 'undefined') {
      window.location.hash = 'shop';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    onRouteChange('journal');
    if (typeof window !== 'undefined') {
      window.location.hash = `journal?id=${articleId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToJournalListing = () => {
    setSelectedArticleId(null);
    onRouteChange('journal');
    if (typeof window !== 'undefined') {
      window.location.hash = 'journal';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHomepageData() {
      try {
        setIsLoadingFeatured(true);
        setIsLoadingSignature(true);
        setFeaturedError(null);

        const [featuredDocs, signatureDoc] = await Promise.all([
          productsApi.getFeaturedProducts(4),
          productsApi.getSignatureFragrance(),
        ]);

        if (isMounted) {
          setFeaturedProducts(featuredDocs.map(mapProductToStorefrontData));
          setSignatureProduct(signatureDoc);
        }
      } catch (err: any) {
        console.error('Error loading homepage product showcase:', err);
        if (isMounted) {
          setFeaturedError(err.message || 'Failed to load collection');
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeatured(false);
          setIsLoadingSignature(false);
        }
      }
    }

    if (activeRoute === 'home') {
      loadHomepageData();
    }

    return () => {
      isMounted = false;
    };
  }, [activeRoute]);

  const handleSelectScentFamily = (family: ScentFamily) => {
    setSelectedFamilyFilter(family);
    onRouteChange('shop');
  };

  // Helper breadcrumb generator
  const getBreadcrumbs = () => {
    const root = { label: t('product.breadcrumbHome'), href: '#' };
    switch (activeRoute) {
      case 'shop':
        return [root, { label: t('shop.catalogTitle'), active: true }];
      case 'collections':
        return [root, { label: t('nav.collections'), active: true }];
      case 'about':
        return [root, { label: t('about.title'), active: true }];
      case 'journal': {
        if (selectedArticleId) {
          return [
            root,
            {
              label: t('journal.title'),
              onClick: () => handleBackToJournalListing(),
            },
            {
              label: t('journal.readStory'),
              active: true,
            },
          ];
        }
        return [root, { label: t('journal.title'), active: true }];
      }
      case 'contact':
        return [root, { label: t('contact.title'), active: true }];
      case 'privacy':
        return [root, { label: t('legal.privacyTitle'), active: true }];
      case 'terms':
        return [root, { label: t('legal.termsTitle'), active: true }];
      case 'shipping-returns':
        return [root, { label: t('legal.shippingTitle'), active: true }];
      default:
        return [root];
    }
  };

  return (
    <div className="flex flex-col gap-12 w-full text-start animate-in fade-in duration-300">
      {/* Breadcrumbs for Sub-routes (PDP, About, Contact, and Legal have their own dedicated visual flow) */}
      {activeRoute !== 'home' &&
        activeRoute !== 'product-detail' &&
        activeRoute !== 'about' &&
        activeRoute !== 'contact' &&
        activeRoute !== 'privacy' &&
        activeRoute !== 'terms' &&
        activeRoute !== 'shipping-returns' && (
          <div>
            <Breadcrumb items={getBreadcrumbs()} />
          </div>
        )}

      {/* Main Page Route Content with Smooth, Brief Page Fade Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRoute}
          variants={pageFadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* VIEW: HOME */}
      {activeRoute === 'home' && (
        <div className="flex flex-col gap-24 sm:gap-32 w-full">
          {/* 1. Hero Section */}
          <section
            id="homepage-hero"
            aria-label={t('home.heroSectionAria')}
            className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex items-center overflow-hidden border-b border-[#E4DED3] bg-[#141311]"
          >
            {/* Background Editorial Visual */}
            <div className="absolute inset-0 z-0 select-none bg-[#141311]">
              <img
                src={heroVisualPath}
                alt="DAHR flacon resting on travertine stone"
                className="w-full h-full object-cover object-center opacity-85 scale-[1.01]"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              {/* Soft directional gradients for maximum typographic contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/90 via-[#141311]/45 to-[#141311]/25" />
              <div
                className={`absolute inset-0 ${
                  direction === 'rtl'
                    ? 'bg-gradient-to-l from-[#141311]/90 via-[#141311]/50 to-transparent'
                    : 'bg-gradient-to-r from-[#141311]/90 via-[#141311]/50 to-transparent'
                }`}
              />
            </div>

            {/* Hero Content Container */}
            <div className="relative z-10 w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 py-20 flex flex-col items-start gap-8 text-start">
              {/* Headline */}
              <h1
                id="hero-headline"
                className="font-display text-[40px] sm:text-[60px] lg:text-[76px] font-light text-[#FAF7F2] leading-[1.06] tracking-tight max-w-3xl"
              >
                {t('home.heroHeadline')}
              </h1>

              {/* Short Brand Statement */}
              <p
                id="hero-brand-statement"
                className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#FAF7F2]/80 max-w-xl leading-relaxed font-body font-light"
              >
                {t('home.heroStatement')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  id="hero-primary-cta"
                  variant="primary"
                  size="lg"
                  rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
                  onClick={() => onRouteChange('shop')}
                  className="shadow-sm"
                >
                  {t('home.shopCollection')}
                </Button>

                <Button
                  id="hero-secondary-cta"
                  variant="secondary"
                  size="lg"
                  onClick={() => onRouteChange('about')}
                  className="!bg-[#FAF7F2]/10 !text-[#FAF7F2] !border-[#FAF7F2]/30 hover:!bg-[#FAF7F2]/20 hover:!border-[#FAF7F2]/50"
                >
                  {t('home.discoverDahr')}
                </Button>
              </div>
            </div>
          </section>

          {/* 2. Featured Collection Section */}
          <section
            id="featured-collection"
            aria-label={t('home.featuredCollection')}
            className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col gap-12"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4DED3] pb-6">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                  {t('home.curatedSelection')}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A17]">
                  {t('home.featuredCollection')}
                </h2>
              </div>

              <Button
                id="featured-view-all-btn"
                variant="text"
                size="sm"
                rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedFamilyFilter('all');
                  onRouteChange('shop');
                }}
              >
                {t('home.viewFullCatalog')}
              </Button>
            </div>

            {/* Products Grid / State Handling */}
            {isLoadingFeatured ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 text-[#7A736A] font-mono text-[13px]">
                <Loader2 className="w-6 h-6 animate-spin text-[#A98860]" />
                <span>{t('home.loadingFeatured')}</span>
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {featuredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={() => {
                      addToast({
                        type: 'success',
                        title: t('home.addedToBag'),
                        message: `${locale === 'ar' ? prod.nameAr : prod.nameEn} — ${prod.volumeEn}`,
                      });
                    }}
                    onQuickView={(p) => {
                      setQuickViewProduct(p);
                      setIsQuickViewOpen(true);
                    }}
                    onSelect={() => handleNavigateToProduct(prod.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[#7A736A] font-mono text-[13px] border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
                {t('home.noFeatured')}
              </div>
            )}
          </section>

          {/* 3. Brand Story Section (Asymmetric Editorial Pairing) */}
          <section
            id="brand-story-section"
            aria-label={t('home.brandStoryAria')}
            className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-6 sm:p-10 lg:p-14">
              {/* Editorial Imagery (Asymmetric 5 columns) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] w-full overflow-hidden rounded-[2px] border border-[#E4DED3] bg-[#141311] shadow-sm">
                  <img
                    src={brandStoryImg}
                    alt={t('home.brandStoryAlt')}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between text-[#FAF7F2] text-[10px] font-mono tracking-wider">
                    <span className="uppercase">{t('home.atelierLocation')}</span>
                    <span className="opacity-80">{t('home.rawExtraits')}</span>
                  </div>
                </div>
              </div>

              {/* Philosophy Statement (Asymmetric 7 columns) */}
              <div className="lg:col-span-7 flex flex-col items-start gap-6 text-start">
                <div className="w-12 h-[1px] bg-[#A98860]" />

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                    {t('home.housePhilosophy')}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1C1A17] leading-tight">
                    {t('home.philosophyHeading')}
                  </h2>
                </div>

                <p className="text-[15px] sm:text-[16px] text-[#5A544C] leading-relaxed font-body font-light max-w-2xl">
                  {t('home.philosophyBody')}
                </p>

                {/* Minimalist Hallmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2 border-t border-[#E4DED3]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-mono font-medium text-[#1C1A17]">{t('home.densityMetric')}</span>
                    <span className="text-[11px] text-[#7A736A]">{t('home.densityLabel')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-mono font-medium text-[#1C1A17]">{t('home.rawMetric')}</span>
                    <span className="text-[11px] text-[#7A736A]">{t('home.rawLabel')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-mono font-medium text-[#1C1A17]">{t('home.flaconMetric')}</span>
                    <span className="text-[11px] text-[#7A736A]">{t('home.flaconLabel')}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    id="brand-story-learn-more"
                    variant="secondary"
                    size="md"
                    rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
                    onClick={() => onRouteChange('about')}
                  >
                    {t('home.discoverHouse')}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Fragrance Discovery Section (6 Scent Families Row) */}
          <section
            id="fragrance-discovery-section"
            aria-label={t('home.fragranceDiscovery')}
            className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col gap-8 sm:gap-10"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4DED3] pb-6">
              <div className="flex flex-col gap-2 text-start">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                  {t('home.olfactiveTerritories')}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A17]">
                  {t('home.fragranceDiscovery')}
                </h2>
                <p className="text-[14px] text-[#7A736A] max-w-xl font-body">
                  {t('home.discoveryDescription')}
                </p>
              </div>

              <Button
                id="discovery-view-all-btn"
                variant="text"
                size="sm"
                rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedFamilyFilter('all');
                  onRouteChange('shop');
                }}
              >
                {t('home.exploreAllTerritories')}
              </Button>
            </div>

            {/* 6-Tile Row/Grid: Desktop 6-up, Tablet 3x2, Mobile 2-up */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {SCENT_FAMILIES_DATA.map((family) => (
                <button
                  key={family.id}
                  id={`discovery-family-${family.id.toLowerCase()}`}
                  type="button"
                  onClick={() => handleSelectScentFamily(family.id)}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[2px] border border-[#E4DED3] bg-[#141311] text-start transition-all hover:border-[#A98860] hover:shadow-md cursor-pointer flex flex-col justify-end p-4 focus:outline-none focus:ring-1 focus:ring-[#A98860]"
                >
                  {/* Background Visual */}
                  <img
                    src={family.image}
                    alt={locale === 'ar' ? family.nameAr : family.nameEn}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:opacity-90 group-hover:scale-108 transition-all duration-700 ease-out pointer-events-none"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Contrast Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/95 via-[#141311]/45 to-transparent pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-1 text-[#FAF7F2]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg sm:text-xl text-[#FAF7F2] font-normal group-hover:text-[#E4DED3] transition-colors">
                        {locale === 'ar' ? family.nameAr : family.nameEn}
                      </h3>
                      <DirectionalArrowRight className="w-3.5 h-3.5 text-[#A98860] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                    </div>
                    <p className="text-[11px] font-mono text-[#FAF7F2]/75 line-clamp-1 leading-snug">
                      {locale === 'ar' ? family.subtitleAr : family.subtitleEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 5. Signature Fragrance Spotlight Section (From Real Firestore Product) */}
          <section
            id="signature-fragrance-spotlight"
            aria-label={t('home.signatureMasterwork')}
            className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20"
          >
            {isLoadingSignature ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-[#7A736A] font-mono text-[13px] border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
                <Loader2 className="w-6 h-6 animate-spin text-[#A98860]" />
                <span>{t('home.loadingSignature')}</span>
              </div>
            ) : signatureProduct ? (
              <div className="bg-[#1C1A17] text-[#FAF7F2] border border-[#2D2A26] rounded-[2px] p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  {/* Large Editorial Visual (Desktop 6 col, stacks on tablet/mobile) */}
                  <div className="lg:col-span-6 flex items-center justify-center">
                    <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2px] border border-[#3A3530] bg-[#141311]">
                      <img
                        src={signatureFlaconImg}
                        alt={locale === 'ar' ? signatureProduct.name.ar : signatureProduct.name.en}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-4 start-4">
                        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-[#141311]/85 text-[#A98860] border border-[#A98860]/40 rounded-[1px]">
                          {t('home.signatureExtrait')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Column (Desktop 6 col) */}
                  <div className="lg:col-span-6 flex flex-col items-start gap-6 text-start">
                    <div className="w-12 h-[1px] bg-[#A98860]" />

                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                        {t('home.signatureMasterwork')}
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FAF7F2] leading-tight">
                        {locale === 'ar' ? signatureProduct.name.ar : signatureProduct.name.en}
                      </h2>
                      <span className="text-[13px] font-mono text-[#A98860] tracking-wide">
                        {signatureProduct.scentFamily} Extrait • {signatureProduct.sizes?.[0]?.size || '100ml'}
                      </span>
                    </div>

                    <p className="text-[15px] text-[#FAF7F2]/80 leading-relaxed font-body font-light max-w-xl">
                      {locale === 'ar'
                        ? signatureProduct.longDescription?.ar || signatureProduct.shortDescriptor?.ar
                        : signatureProduct.longDescription?.en || signatureProduct.shortDescriptor?.en}
                    </p>

                    {/* Key Notes (Top-Line Pyramid) */}
                    <div className="flex flex-col gap-2.5 w-full py-4 border-y border-[#2D2A26]">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FAF7F2]/60">
                        {t('home.keyNotesPyramid')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#A98860] text-[10px] uppercase">{t('home.topNote')}</span>
                          <span className="text-[#FAF7F2]/90">{locale === 'ar' ? signatureProduct.notes?.top?.ar : signatureProduct.notes?.top?.en}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#A98860] text-[10px] uppercase">{t('home.heartNote')}</span>
                          <span className="text-[#FAF7F2]/90">{locale === 'ar' ? signatureProduct.notes?.heart?.ar : signatureProduct.notes?.heart?.en}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#A98860] text-[10px] uppercase">{t('home.baseNote')}</span>
                          <span className="text-[#FAF7F2]/90">{locale === 'ar' ? signatureProduct.notes?.base?.ar : signatureProduct.notes?.base?.en}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Single CTA */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-[#FAF7F2]/60 uppercase">{t('home.priceLabel')}</span>
                        <span className="font-mono text-xl font-light text-[#FAF7F2]">
                          ${signatureProduct.sizes?.[0]?.price || 340} {t('common.currencySar')}
                        </span>
                      </div>

                      <Button
                        id="signature-fragrance-cta"
                        variant="primary"
                        size="lg"
                        rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
                        onClick={() => {
                          handleNavigateToProduct(signatureProduct.id);
                        }}
                        className="!bg-[#A98860] hover:!bg-[#967750] !text-[#141311] font-medium cursor-pointer"
                      >
                        {`${t('home.exploreFragrance')} ${locale === 'ar' ? signatureProduct.name.ar : signatureProduct.name.en}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* 6. Brand Philosophy Section (Whitespace-led, no icons) */}
          <BrandPhilosophySection />

          {/* 7. Journal Preview Section (Real Firestore published articles, 3-up desktop, 2-up tablet, 1-up mobile) */}
          <JournalPreviewSection
            onNavigateToJournal={(articleId) => {
              if (articleId) {
                handleSelectArticle(articleId);
              } else {
                handleBackToJournalListing();
              }
            }}
          />

          {/* 8. Newsletter Section (Minimal single-field signup writing to Firestore newsletterSubscribers) */}
          <NewsletterSection />
        </div>
      )}

      {/* VIEW: SHOP */}
      {activeRoute === 'shop' && (
        <Suspense fallback={<SubviewLoader />}>
          <ShopCatalog
            initialFamily={selectedFamilyFilter}
            searchQuery={shopSearchQuery}
            onClearSearch={() => setShopSearchQuery('')}
            onFamilyFilterChange={setSelectedFamilyFilter}
            onAddToCart={(prod) => {
              addToast({
                type: 'success',
                title: t('home.addedToBag'),
                message: `${locale === 'ar' ? prod.nameAr : prod.nameEn}`,
              });
            }}
            onQuickView={(prod) => {
              setQuickViewProduct(prod);
              setIsQuickViewOpen(true);
            }}
            onSelectProduct={handleNavigateToProduct}
          />
        </Suspense>
      )}

      {/* VIEW: PRODUCT DETAIL (PDP) */}
      {activeRoute === 'product-detail' && (
        <Suspense fallback={<SubviewLoader />}>
          <ProductDetailPage
            productId={selectedProductId}
            fromScentFamily={fromScentFamily}
            onRouteChange={onRouteChange}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToShopWithFamily={handleNavigateToShopWithFamily}
          />
        </Suspense>
      )}

      {/* VIEW: COLLECTIONS */}
      {activeRoute === 'collections' && (
        <div className="flex flex-col gap-10">
          <div className="border-b border-[#E4DED3] pb-6 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {t('collections.olfactiveSeries')}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1A17]">
              {t('collections.title')}
            </h1>
            <p className="text-[14px] text-[#7A736A] max-w-2xl font-body">
              {t('collections.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COLLECTIONS_DATA.map((col) => (
              <div
                key={col.id}
                className="p-8 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-6 hover:border-[#A98860] transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
                      SERIES {col.id.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-[#7A736A]">
                      {col.count} {t('collections.flacons')}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#1C1A17]">
                    {locale === 'ar' ? col.nameAr : col.nameEn}
                  </h3>
                  <p className="text-[13px] text-[#7A736A] leading-relaxed font-body">
                    {locale === 'ar' ? col.descAr : col.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4DED3] flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => onRouteChange('shop')}
                  >
                    {t('collections.exploreSeries')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: ABOUT */}
      {activeRoute === 'about' && (
        <Suspense fallback={<SubviewLoader />}>
          <AboutBrandStory onRouteChange={onRouteChange} />
        </Suspense>
      )}

      {/* VIEW: JOURNAL */}
      {activeRoute === 'journal' && (
        <Suspense fallback={<SubviewLoader />}>
          {selectedArticleId ? (
            <ArticleDetailPage
              articleId={selectedArticleId}
              onBackToJournal={handleBackToJournalListing}
              onSelectArticle={handleSelectArticle}
              onRouteChange={onRouteChange}
            />
          ) : (
            <JournalListing
              onSelectArticle={handleSelectArticle}
              onRouteChange={onRouteChange}
            />
          )}
        </Suspense>
      )}

      {/* VIEW: CONTACT */}
      {activeRoute === 'contact' && (
        <Suspense fallback={<SubviewLoader />}>
          <ContactPage onRouteChange={onRouteChange} />
        </Suspense>
      )}

      {/* VIEW: CUSTOMER ACCOUNT AREA */}
      {activeRoute === 'account' && (
        <Suspense fallback={<SubviewLoader />}>
          <AccountPage
            onRouteChange={onRouteChange}
            onNavigateToProduct={handleNavigateToProduct}
          />
        </Suspense>
      )}

      {/* VIEW: LEGAL — PRIVACY POLICY */}
      {activeRoute === 'privacy' && (
        <Suspense fallback={<SubviewLoader />}>
          <LegalDocumentPage documentKey="privacy" onRouteChange={onRouteChange} />
        </Suspense>
      )}

      {/* VIEW: LEGAL — TERMS OF SERVICE */}
      {activeRoute === 'terms' && (
        <Suspense fallback={<SubviewLoader />}>
          <LegalDocumentPage documentKey="terms" onRouteChange={onRouteChange} />
        </Suspense>
      )}

      {/* VIEW: LEGAL — SHIPPING & RETURNS */}
      {activeRoute === 'shipping-returns' && (
        <Suspense fallback={<SubviewLoader />}>
          <LegalDocumentPage documentKey="shipping-returns" onRouteChange={onRouteChange} />
        </Suspense>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Quick View Modal */}
      <Suspense fallback={null}>
        {isQuickViewOpen && (
          <QuickViewModal
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={() => setIsQuickViewOpen(false)}
            onAddToCart={(prod) => {
              addToast({
                type: 'success',
                title: t('home.addedToBag'),
                message: `${locale === 'ar' ? prod.nameAr : prod.nameEn} — ${prod.volumeEn}`,
              });
            }}
            onViewProductDetails={handleNavigateToProduct}
          />
        )}
      </Suspense>
    </div>
  );
};
