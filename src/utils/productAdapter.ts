import { Product } from '../types/backend';
import { ProductData } from '../types';

/**
 * Maps a Firestore/Backend Product entity to the Storefront ProductData view model
 */
export function mapProductToStorefrontData(product: Product): ProductData {
  // Default to the first size or standard 100ml
  const primarySize = product.sizes?.[0] || { size: '100ml', price: 300, stock: 10 };
  const largestSize = product.sizes?.find((s) => s.size.includes('100ml')) || primarySize;

  // Extract concentration label from descriptor if possible, or build from olfactive family
  const concentrationEn = 'Extrait de Parfum (35%)';
  const concentrationAr = 'خلاصة عطرية نقية (35%)';

  return {
    id: product.id,
    brand: 'DAHR',
    nameEn: product.name.en,
    nameAr: product.name.ar,
    olfactiveFamilyEn: product.shortDescriptor?.en || `${product.scentFamily} Extrait`,
    olfactiveFamilyAr: product.shortDescriptor?.ar || `خلاصة ${product.scentFamily}`,
    concentrationEn,
    concentrationAr,
    volumeEn: `${largestSize.size} / 3.4 fl oz`,
    volumeAr: `${largestSize.size.replace('ml', ' مل')} / 3.4 أونصة`,
    price: largestSize.price,
    currencyEn: 'USD',
    currencyAr: 'ر.س',
    topNotesEn: product.notes?.top?.en,
    topNotesAr: product.notes?.top?.ar,
    isNew: !!product.flags?.isNew,
    isLimited: !product.flags?.isNew && !!product.flags?.isSignature,
    inStock: (largestSize.stock ?? 0) > 0,
  };
}
