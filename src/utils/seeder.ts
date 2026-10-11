import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { SEED_PRODUCTS, SEED_JOURNAL_ARTICLES } from '../data/seedData';

export async function seedInitialFirestoreData(forceOverwrite = false): Promise<{
  productsCount: number;
  articlesCount: number;
}> {
  let seededProducts = 0;
  let seededArticles = 0;

  try {
    // 1. Seed Products if user has admin/staff permissions or when allowed
    for (const product of SEED_PRODUCTS) {
      try {
        const docRef = doc(db, 'products', product.id);
        const existing = await getDoc(docRef);
        if (!existing.exists() || forceOverwrite) {
          await setDoc(docRef, product);
          seededProducts++;
        }
      } catch (err) {
        // Silently skip if unauthenticated or permissions not yet granted
      }
    }

    // 2. Seed Journal Articles
    for (const article of SEED_JOURNAL_ARTICLES) {
      try {
        const docRef = doc(db, 'journalArticles', article.id);
        const existing = await getDoc(docRef);
        if (!existing.exists() || forceOverwrite) {
          await setDoc(docRef, article);
          seededArticles++;
        }
      } catch (err) {
        // Silently skip if unauthenticated
      }
    }
  } catch (err) {
    console.debug('Seeder check notice (safe):', err);
  }

  return { productsCount: seededProducts, articlesCount: seededArticles };
}
