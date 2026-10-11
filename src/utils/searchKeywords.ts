import { Product } from '../types/backend';

/**
 * Generate an array of lowercase search tokens and prefixes for Firestore keyword searching.
 * Supports bilingual Arabic and English terms, scent families, and note keys.
 */
export function generateProductSearchKeywords(product: Partial<Product>): string[] {
  const keywordSet = new Set<string>();

  const addText = (text?: string) => {
    if (!text || typeof text !== 'string') return;
    
    // Normalize string: lowercase, clean punctuation
    const clean = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’«»]/g, ' ')
      .trim();

    const words = clean.split(/\s+/).filter(Boolean);

    words.forEach((word) => {
      if (word.length >= 2) {
        keywordSet.add(word);

        // Generate prefixes for fast predictive search (min 2 chars, max 12 chars)
        for (let i = 2; i <= Math.min(word.length, 12); i++) {
          keywordSet.add(word.slice(0, i));
        }
      }
    });

    // Also include full normalized clean text if short (e.g. "oud al-waqt", "عود الوقت")
    if (clean.length > 2 && clean.length < 30) {
      keywordSet.add(clean);
    }
  };

  // Names (Bilingual)
  addText(product.name?.en);
  addText(product.name?.ar);

  // Descriptors
  addText(product.shortDescriptor?.en);
  addText(product.shortDescriptor?.ar);

  // Scent Family
  if (product.scentFamily) {
    addText(product.scentFamily);
    const arabicFamilies: Record<string, string> = {
      Woody: 'خشبية خشب عود',
      Floral: 'زهرية ورد زهور',
      Oriental: 'شرقية توابل بخور',
      Fresh: 'منعشة حمضيات نيرولي',
      Amber: 'عنبرية عنبر بلسم',
      Musk: 'مسكية مسك أبيض',
    };
    if (arabicFamilies[product.scentFamily]) {
      addText(arabicFamilies[product.scentFamily]);
    }
  }

  // Notes Pyramid
  if (product.notes) {
    addText(product.notes.top?.en);
    addText(product.notes.top?.ar);
    addText(product.notes.heart?.en);
    addText(product.notes.heart?.ar);
    addText(product.notes.base?.en);
    addText(product.notes.base?.ar);
  }

  return Array.from(keywordSet);
}
