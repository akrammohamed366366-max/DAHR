import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/context';
import { RouteId } from '../../types';
import { Product, JournalArticle } from '../../types/backend';
import { productsApi } from '../../api/productsApi';
import { journalApi } from '../../api/journalApi';
import {
  getSEOMetadataForRoute,
  generateOrganizationSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  SITE_URL,
} from '../../utils/seo';

export interface SEOHeadProps {
  route: RouteId;
  product?: Product | null;
  article?: JournalArticle | null;
}

function setOrCreateMetaTag(attributeName: 'name' | 'property', attributeValue: string, contentValue: string) {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', contentValue);
}

function setOrCreateLinkTag(relValue: string, hrefValue: string, hreflangValue?: string) {
  const selector = hreflangValue
    ? `link[rel="${relValue}"][hreflang="${hreflangValue}"]`
    : `link[rel="${relValue}"]:not([hreflang])`;
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', relValue);
    if (hreflangValue) {
      element.setAttribute('hreflang', hreflangValue);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('href', hrefValue);
}

function setOrCreateJsonLdScript(scriptId: string, jsonContent: object | null) {
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!jsonContent) {
    if (scriptEl) {
      scriptEl.remove();
    }
    return;
  }

  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonContent, null, 2);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  route,
  product: initialProduct,
  article: initialArticle,
}) => {
  const { locale } = useI18n();
  const [resolvedProduct, setResolvedProduct] = useState<Product | null>(initialProduct || null);
  const [resolvedArticle, setResolvedArticle] = useState<JournalArticle | null>(initialArticle || null);

  // Sync if prop changes
  useEffect(() => {
    if (initialProduct) {
      setResolvedProduct(initialProduct);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (initialArticle) {
      setResolvedArticle(initialArticle);
    }
  }, [initialArticle]);

  // Fetch product or article dynamically if on PDP or Journal article and not provided
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const match = hash.match(/[?&]id=([^&]+)/);
    const targetId = match ? match[1] : null;

    if (route === 'product-detail' && targetId && (!resolvedProduct || resolvedProduct.id !== targetId)) {
      productsApi.getProductById(targetId).then((prod) => {
        if (isMounted && prod) {
          setResolvedProduct(prod);
        }
      }).catch((err) => {
        console.warn('SEOHead: Could not fetch product for meta tags:', err);
      });
    }

    if (route === 'journal' && targetId && (!resolvedArticle || resolvedArticle.id !== targetId)) {
      journalApi.getArticleById(targetId).then((art) => {
        if (isMounted && art) {
          setResolvedArticle(art);
        }
      }).catch((err) => {
        console.warn('SEOHead: Could not fetch article for meta tags:', err);
      });
    } else if (route === 'journal' && !targetId && resolvedArticle) {
      setResolvedArticle(null);
    }

    return () => {
      isMounted = false;
    };
  }, [route, resolvedProduct, resolvedArticle]);

  // Apply Document Head Metadata
  useEffect(() => {
    const product = initialProduct || resolvedProduct;
    const article = initialArticle || resolvedArticle;
    const meta = getSEOMetadataForRoute(route, locale, product, article);
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;

    // Document lang and dir
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');

    // 1. Title
    document.title = meta.title;

    // 2. Meta description
    setOrCreateMetaTag('name', 'description', meta.description);

    // 3. Robots meta tag (Strictly exclude all admin routes and private interfaces from indexation)
    if (meta.isNoIndex) {
      setOrCreateMetaTag('name', 'robots', 'noindex, nofollow, noarchive');
      setOrCreateMetaTag('name', 'googlebot', 'noindex, nofollow, noarchive');
    } else {
      setOrCreateMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      setOrCreateMetaTag('name', 'googlebot', 'index, follow');
    }

    // 4. Canonical & Hreflang Tags
    setOrCreateLinkTag('canonical', meta.canonicalUrl);
    setOrCreateLinkTag('alternate', meta.hreflangEnUrl, 'en');
    setOrCreateLinkTag('alternate', meta.hreflangArUrl, 'ar');
    setOrCreateLinkTag('alternate', meta.hreflangEnUrl, 'x-default');

    // 5. Open Graph Meta Tags
    setOrCreateMetaTag('property', 'og:title', meta.title);
    setOrCreateMetaTag('property', 'og:description', meta.description);
    setOrCreateMetaTag('property', 'og:url', meta.canonicalUrl);
    setOrCreateMetaTag('property', 'og:type', meta.ogType);
    setOrCreateMetaTag('property', 'og:image', meta.ogImage);
    setOrCreateMetaTag('property', 'og:site_name', locale === 'ar' ? 'دار DAHR للعطور' : 'DAHR Parfums');
    setOrCreateMetaTag('property', 'og:locale', locale === 'ar' ? 'ar_SA' : 'en_US');
    setOrCreateMetaTag('property', 'og:locale:alternate', locale === 'ar' ? 'en_US' : 'ar_SA');

    // 6. Twitter Meta Tags
    setOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    setOrCreateMetaTag('name', 'twitter:title', meta.title);
    setOrCreateMetaTag('name', 'twitter:description', meta.description);
    setOrCreateMetaTag('name', 'twitter:image', meta.ogImage);

    // 7. Structured Data: Organization Schema (Always present on public pages)
    if (!meta.isNoIndex) {
      setOrCreateJsonLdScript('dahr-organization-schema', generateOrganizationSchema());
    } else {
      setOrCreateJsonLdScript('dahr-organization-schema', null);
    }

    // 8. Structured Data: Product Schema (On Product Detail Page)
    if (route === 'product-detail' && product && !meta.isNoIndex) {
      setOrCreateJsonLdScript('dahr-product-schema', generateProductSchema(product, locale, meta.canonicalUrl));
    } else {
      setOrCreateJsonLdScript('dahr-product-schema', null);
    }

    // 9. Structured Data: Article Schema (On Journal Article Detail Page)
    if (route === 'journal' && article && !meta.isNoIndex) {
      setOrCreateJsonLdScript('dahr-article-schema', generateArticleSchema(article, locale, meta.canonicalUrl));
    } else {
      setOrCreateJsonLdScript('dahr-article-schema', null);
    }

    // 10. Structured Data: Breadcrumb Schema
    if (!meta.isNoIndex) {
      const breadcrumbItems: { name: string; url: string }[] = [
        {
          name: locale === 'ar' ? 'الرئيسية' : 'Home',
          url: `${origin}/?lang=${locale}`,
        },
      ];

      if (route === 'shop') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'كتالوج العطور' : 'Fragrance Catalog',
          url: meta.canonicalUrl,
        });
      } else if (route === 'product-detail' && product) {
        breadcrumbItems.push(
          {
            name: locale === 'ar' ? 'كتالوج العطور' : 'Fragrance Catalog',
            url: `${origin}/#shop?lang=${locale}`,
          },
          {
            name: locale === 'ar' ? product.name.ar : product.name.en,
            url: meta.canonicalUrl,
          }
        );
      } else if (route === 'collections') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'المجموعات الحصرية' : 'Olfactive Collections',
          url: meta.canonicalUrl,
        });
      } else if (route === 'about') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'دار DAHR' : 'The House of DAHR',
          url: meta.canonicalUrl,
        });
      } else if (route === 'journal') {
        if (article) {
          breadcrumbItems.push(
            {
              name: locale === 'ar' ? 'المجلة الشمية' : 'The Olfactive Journal',
              url: `${origin}/#journal?lang=${locale}`,
            },
            {
              name: locale === 'ar' ? article.title.ar : article.title.en,
              url: meta.canonicalUrl,
            }
          );
        } else {
          breadcrumbItems.push({
            name: locale === 'ar' ? 'المجلة الشمية' : 'The Olfactive Journal',
            url: meta.canonicalUrl,
          });
        }
      } else if (route === 'contact') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'الكونسيرج والتواصل' : 'Private Concierge',
          url: meta.canonicalUrl,
        });
      } else if (route === 'privacy') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
          url: meta.canonicalUrl,
        });
      } else if (route === 'terms') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service',
          url: meta.canonicalUrl,
        });
      } else if (route === 'shipping-returns') {
        breadcrumbItems.push({
          name: locale === 'ar' ? 'الشحن المبرد والاسترجاع' : 'Climate Shipping & Returns',
          url: meta.canonicalUrl,
        });
      }

      if (breadcrumbItems.length > 1) {
        setOrCreateJsonLdScript('dahr-breadcrumb-schema', generateBreadcrumbSchema(breadcrumbItems));
      } else {
        setOrCreateJsonLdScript('dahr-breadcrumb-schema', null);
      }
    } else {
      setOrCreateJsonLdScript('dahr-breadcrumb-schema', null);
    }
  }, [route, locale, initialProduct, resolvedProduct, initialArticle, resolvedArticle]);

  return null;
};
