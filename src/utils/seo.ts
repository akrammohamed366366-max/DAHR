import { Locale, RouteId } from '../types';
import { Product, JournalArticle } from '../types/backend';

export interface RouteSEOMetadata {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  ogType?: 'website' | 'article' | 'product';
  image?: string;
}

export const SITE_NAME_EN = 'DAHR Parfums';
export const SITE_NAME_AR = 'دار DAHR للعطور';
export const SITE_URL = 'https://dahr-parfums.com';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80';

export const ROUTE_SEO_CATALOG: Record<RouteId, RouteSEOMetadata> = {
  home: {
    titleEn: 'DAHR | High Perfumery & Architectural Fragrance',
    titleAr: 'دار DAHR | هندسة الشذى والعطور الشرقية النادرة',
    descriptionEn: 'Discover DAHR bespoke high perfumery, handcrafted extraits (24%–40%), wild Cambodian agarwood, Taif rose, and mineral grey ambergris in Riyadh and Grasse.',
    descriptionAr: 'اكتشف إبداعات دار DAHR في صياغة العطور النادرة والخلاصات المركزة (24%–40%) من أخشاب العود البرية، ورد الطائف، والعنبر الخام بين الرياض وغراس.',
    ogType: 'website',
  },
  shop: {
    titleEn: 'Fragrance Catalog & Extrait Collections | DAHR',
    titleAr: 'كتالوج العطور والخلاصات النادرة | دار DAHR',
    descriptionEn: 'Browse the complete archive of DAHR high perfumery extraits across Woody, Floral, Oriental, Fresh, Amber, and Musk olfactive territories.',
    descriptionAr: 'تصفح الأرشيف الكامل لعطور وخلاصات دار DAHR المركزة عبر مسارات الأخشاب، الزهور، الطابع الشرقي، الانتعاش، العنبر، والمسك.',
    ogType: 'website',
  },
  'product-detail': {
    titleEn: 'Signature Flacon & Olfactive Architecture | DAHR',
    titleAr: 'القارورة المميزة والبناء العطري | دار DAHR',
    descriptionEn: 'High perfumery extrait formulated with extreme botanical density and macerated in dark glass vessels.',
    descriptionAr: 'خلاصة عطرية فائقة التركيز مصاغة بكثافة نباتية برية ومعتقة في أوعية زجاجية معتمة.',
    ogType: 'product',
  },
  collections: {
    titleEn: 'Curated Olfactive Collections | DAHR',
    titleAr: 'المجموعات العطرية الحصرية | دار DAHR',
    descriptionEn: 'Explore DAHR thematic fragrance series: The Royal Desert Oud series, Highland Botanical harvests, and Private Resinous Extraits.',
    descriptionAr: 'استكشف سلاسل عطور دار DAHR الحصرية: سلسلة عود الصحراء الملكي، حصاد مرتفعات الطائف، وخلاصات الراتنجات الخاصة.',
    ogType: 'website',
  },
  about: {
    titleEn: 'The House of DAHR | Heritage, Formulation & Philosophy',
    titleAr: 'دار DAHR | الأصالة، فلسفة التقطير والحرفية',
    descriptionEn: 'The enduring dialogue between Arabian olfactive heritage and French Grasse hydrodistillation. Architectural sillage and unrefined botanical purity.',
    descriptionAr: 'حوار أزلي بين التراث العطري الأصيل في الجزيرة العربية والتقطير الدقيق في غراس الفرنسية. هندسة الشذى ونقاء المستخلصات البرية.',
    ogType: 'website',
  },
  journal: {
    titleEn: 'The Olfactive Journal & Botanical Essays | DAHR',
    titleAr: 'المجلة الشمية والدراسات النباتية | دار DAHR',
    descriptionEn: 'Chronicles of highland harvests, wild agarwood aging, resin chemistry, and the architecture of enduring fragrance sillage.',
    descriptionAr: 'توثيق مواسم حصاد الورود الجبلية، تعتيق خشب العود البري، كيمياء الراتنجات، وفلسفة الثبات المعماري.',
    ogType: 'article',
  },
  contact: {
    titleEn: 'Private Concierge & Boutiques | DAHR',
    titleAr: 'الكونسيرج الخاص والتواصل | دار DAHR',
    descriptionEn: 'Connect with DAHR private concierge for bespoke olfactory consultations, climate-controlled GCC shipping inquiries, and VIP gift compounding.',
    descriptionAr: 'تواصل مع فريق كونسيرج دار DAHR للاستشارات الشمية الخاصة، استفسارات الشحن المبرد، والخدمات المخصصة.',
    ogType: 'website',
  },
  account: {
    titleEn: 'Client Sanctuary & Private Portal | DAHR',
    titleAr: 'مجلس العميل والملف الشخصي | دار DAHR',
    descriptionEn: 'Access your private DAHR client space to track bespoke orders, manage climate delivery addresses, and view saved extraits.',
    descriptionAr: 'ادخل إلى مجلس عملاء دار DAHR لمتابعة الطلبات الخاصة، إدارة عناوين الشحن المكيف، واستعراض قائمة الرغبات.',
    ogType: 'website',
  },
  privacy: {
    titleEn: 'Privacy Policy & Client Data Discretion | DAHR',
    titleAr: 'سياسة الخصوصية وسرية البيانات | دار DAHR',
    descriptionEn: 'Our commitment to uncompromising client confidentiality, private ordering discretion, and secure data handling standards.',
    descriptionAr: 'التزامنا الراسخ بالسرية التامة لبيانات العملاء، خصوصية الطلبات الخاصة، وأعلى معايير حماية البيانات.',
    ogType: 'website',
  },
  terms: {
    titleEn: 'Terms of Service & Atelier Conditions | DAHR',
    titleAr: 'الشروط والأحكام وميثاق الدار | دار DAHR',
    descriptionEn: 'Terms governing high perfumery acquisitions, limited harvest batches, authentic serial numbers, and client relations.',
    descriptionAr: 'الشروط المنظمة لاقتناء خلاصات العطور النادرة، الدفعات المحدودة، الأرقام التسلسلية المعتمدة، وميثاق الخدمة.',
    ogType: 'website',
  },
  'shipping-returns': {
    titleEn: 'Climate Courier Shipping & Returns | DAHR',
    titleAr: 'الشحن المبرد وسياسة الاسترجاع | دار DAHR',
    descriptionEn: 'Insured, temperature-controlled delivery across the GCC within 24–48 hours. Complimentary 2ml sample vial included with every flacon.',
    descriptionAr: 'شحن مبرد ومؤمن لجميع مدن المملكة والخليج خلال 24-48 ساعة. عينة تجربة 2 مل مجانية مرفقة مع كل قارورة عطر.',
    ogType: 'website',
  },
  'showcase-storefront': {
    titleEn: 'Storefront UI Design System | DAHR',
    titleAr: 'دليل تصميم المتجر | دار DAHR',
    descriptionEn: 'Interactive UI showcase and typographic specimens for DAHR high perfumery digital storefront.',
    descriptionAr: 'معرض المكونات التفاعلية والنماذج البصرية لمنظومة دار DAHR.',
    ogType: 'website',
  },
  'showcase-admin': {
    titleEn: 'Administrative UI Atelier | DAHR',
    titleAr: 'ورشة الواجهات الإدارية | دار DAHR',
    descriptionEn: 'Administrative UI workshop and management system.',
    descriptionAr: 'لوحة التحكم والورشة الإدارية الخاصة بدار DAHR.',
    ogType: 'website',
  },
  diagnostics: {
    titleEn: 'System Diagnostics & Telemetry | DAHR',
    titleAr: 'تشخيص النظام والقياسات | دار DAHR',
    descriptionEn: 'Internal diagnostics workspace for environment verification.',
    descriptionAr: 'شاشة تشخيص النظام والتحقق التقني الداخلي.',
    ogType: 'website',
  },
  admin: {
    titleEn: 'Atelier Management Console | DAHR',
    titleAr: 'لوحة الإدارة والمشغل | دار DAHR',
    descriptionEn: 'Private administrative console for DAHR formulation inventory, orders, and editorial journal.',
    descriptionAr: 'لوحة التحكم الإدارية الخاصة بمخزون العطور، الطلبات، ومقالات المجلة.',
    ogType: 'website',
  },
  'admin-login': {
    titleEn: 'Staff & Atelier Authentication | DAHR',
    titleAr: 'تسجيل دخول الإدارة والمشغل | دار DAHR',
    descriptionEn: 'Secure staff and administrative credential authentication.',
    descriptionAr: 'بوابة الدخول الآمنة لفريق العمل والإدارة.',
    ogType: 'website',
  },
  'admin-dashboard': {
    titleEn: 'Operational Dashboard | DAHR Atelier',
    titleAr: 'لوحة العمليات الرئيسية | دار DAHR',
    descriptionEn: 'Operational metrics, recent bespoke orders, and inventory overview.',
    descriptionAr: 'المؤشرات التشغيلية، أحدث الطلبات، ومستوى المخزون.',
    ogType: 'website',
  },
  'admin-products': {
    titleEn: 'Product Catalog Management | DAHR Atelier',
    titleAr: 'إدارة كتالوج العطور | دار DAHR',
    descriptionEn: 'Manage bespoke flacons, extrait concentrations, olfactory notes, and inventory.',
    descriptionAr: 'إدارة قوارير العطور، تركيزات الخلاصات، النوتات الشمية، والمخزون.',
    ogType: 'website',
  },
  'admin-orders': {
    titleEn: 'Client Order Fulfillment | DAHR Atelier',
    titleAr: 'إدارة طلبات العملاء | دار DAHR',
    descriptionEn: 'Manage temperature-controlled dispatches, packing manifests, and fulfillment status.',
    descriptionAr: 'متابعة الشحن المبرد، تجهيز الشحنات، وحالة التوصيل.',
    ogType: 'website',
  },
  'admin-journal': {
    titleEn: 'Journal Editorial Manager | DAHR Atelier',
    titleAr: 'إدارة مقالات المجلة | دار DAHR',
    descriptionEn: 'Publish, draft, and archive field extraction chronicles and formulation studies.',
    descriptionAr: 'نشر وتحرير مقالات المجلة الشمية ودراسات الاستخلاص النباتي.',
    ogType: 'website',
  },
  'admin-users': {
    titleEn: 'Staff Roster & Permissions | DAHR Atelier',
    titleAr: 'سجل الموظفين والصلاحيات | دار DAHR',
    descriptionEn: 'Manage administrative roles, editor permissions, and staff credentials.',
    descriptionAr: 'إدارة أدوار فريق العمل، صلاحيات المحررين، وسجلات الموظفين.',
    ogType: 'website',
  },
  'admin-settings': {
    titleEn: 'Site Settings & Brand Identity | DAHR Atelier',
    titleAr: 'إعدادات الموقع والهوية التجارية | دار DAHR',
    descriptionEn: 'Manage contact channels, social networks, brand name, and official logo.',
    descriptionAr: 'إدارة قنوات التواصل، الشبكات الاجتماعية، اسم الموقع، والشعار الرسمي.',
    ogType: 'website',
  },
};

export function getSEOMetadataForRoute(
  route: RouteId,
  locale: Locale,
  product?: Product | null,
  article?: JournalArticle | null
): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article' | 'product';
  ogImage: string;
  isNoIndex: boolean;
  hreflangEnUrl: string;
  hreflangArUrl: string;
} {
  const isAdmin = route.startsWith('admin') || route === 'showcase-admin' || route === 'diagnostics';

  // Base URL calculation
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;

  // Build clean hash / path representation
  let routePath = route === 'home' ? '' : `#${route}`;
  if (route === 'product-detail' && product) {
    routePath = `#product-detail?id=${product.id}`;
  } else if (route === 'journal' && article) {
    routePath = `#journal?id=${article.id}`;
  }

  const canonicalUrl = `${origin}/${routePath}${routePath.includes('?') ? '&' : '?'}lang=${locale}`;
  const hreflangEnUrl = `${origin}/${routePath}${routePath.includes('?') ? '&' : '?'}lang=en`;
  const hreflangArUrl = `${origin}/${routePath}${routePath.includes('?') ? '&' : '?'}lang=ar`;

  // Dynamic Product PDP Metadata
  if (route === 'product-detail' && product) {
    const prodName = locale === 'ar' ? product.name.ar : product.name.en;
    const conc = locale === 'ar' ? 'خلاصة عطرية نقية' : 'Extrait de Parfum';
    const family = product.scentFamily || 'Woody';
    const rawDesc = locale === 'ar'
      ? product.shortDescriptor?.ar || product.longDescription?.ar || ''
      : product.shortDescriptor?.en || product.longDescription?.en || '';
    const desc = rawDesc || (locale === 'ar'
      ? `اكتشف عطر ${prodName} بتركيز ${conc} من عائلة ${family} الشمية بدار DAHR.`
      : `Experience ${prodName}, an architectural ${conc} in the ${family} olfactive territory by DAHR.`);

    return {
      title: locale === 'ar' ? `${prodName} | ${conc} | ${SITE_NAME_AR}` : `${prodName} | ${conc} | ${SITE_NAME_EN}`,
      description: desc,
      canonicalUrl,
      ogType: 'product',
      ogImage: product.images?.[0] || DEFAULT_OG_IMAGE,
      isNoIndex: false,
      hreflangEnUrl,
      hreflangArUrl,
    };
  }

  // Dynamic Journal Article Metadata
  if (route === 'journal' && article) {
    const artTitle = locale === 'ar' ? article.title.ar : article.title.en;
    const artExcerpt = locale === 'ar' ? article.excerpt.ar : article.excerpt.en;

    return {
      title: locale === 'ar' ? `${artTitle} | المجلة الشمية | ${SITE_NAME_AR}` : `${artTitle} | The Olfactive Journal | ${SITE_NAME_EN}`,
      description: artExcerpt || (locale === 'ar' ? 'دراسة متخصصة في صناعة العطور النادرة من دار DAHR.' : 'Formulation essay from the House of DAHR atelier.'),
      canonicalUrl,
      ogType: 'article',
      ogImage: article.heroImage || DEFAULT_OG_IMAGE,
      isNoIndex: false,
      hreflangEnUrl,
      hreflangArUrl,
    };
  }

  // Route-based default lookup
  const metaConfig = ROUTE_SEO_CATALOG[route] || ROUTE_SEO_CATALOG.home;
  const title = locale === 'ar' ? metaConfig.titleAr : metaConfig.titleEn;
  const description = locale === 'ar' ? metaConfig.descriptionAr : metaConfig.descriptionEn;

  return {
    title,
    description,
    canonicalUrl,
    ogType: metaConfig.ogType || 'website',
    ogImage: metaConfig.image || DEFAULT_OG_IMAGE,
    isNoIndex: isAdmin,
    hreflangEnUrl,
    hreflangArUrl,
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DAHR',
    alternateName: 'دار DAHR للعطور الفاخرة',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'High perfumery house specializing in pure extraits (24%–40%), wild Cambodian agarwood, and Taif rose botanicals formulated in Riyadh and Grasse.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Riyadh, Saudi Arabia',
    },
    areaServed: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'FR', 'GB', 'US'],
    sameAs: [
      'https://instagram.com/dahrparfums',
    ],
  };
}

export function generateProductSchema(product: Product, locale: Locale, currentUrl: string) {
  const prodName = locale === 'ar' ? product.name.ar : product.name.en;
  const desc = locale === 'ar'
    ? product.longDescription?.ar || product.shortDescriptor?.ar || ''
    : product.longDescription?.en || product.shortDescriptor?.en || '';

  const price = product.sizes?.[0]?.price || 340;
  const inStock = product.status === 'active' && product.sizes?.some((s) => s.stock > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prodName,
    image: product.images && product.images.length > 0 ? product.images : [DEFAULT_OG_IMAGE],
    description: desc,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'DAHR',
    },
    offers: {
      '@type': 'Offer',
      url: currentUrl,
      priceCurrency: 'USD',
      price: price.toString(),
      priceValidUntil: '2028-12-31',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'DAHR Parfums',
      },
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(article: JournalArticle, locale: Locale, currentUrl: string) {
  const title = locale === 'ar' ? article.title.ar : article.title.en;
  const desc = locale === 'ar' ? article.excerpt.ar : article.excerpt.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: desc,
    image: article.heroImage || DEFAULT_OG_IMAGE,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.publishedAt || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'DAHR Formulation Atelier',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DAHR',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}
