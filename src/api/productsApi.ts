import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { SEED_PRODUCTS } from '../data/seedData';
import { Product, ScentFamily, ProductStatus } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';
import { generateProductSearchKeywords } from '../utils/searchKeywords';

const PRODUCTS_COLLECTION = 'products';
const CACHE_TTL_MS = 90_000; // 90 seconds in-memory cache TTL for smooth navigation

// In-memory cache structures
let activeProductsCache: { data: Product[]; timestamp: number } | null = null;
let featuredProductsCache: { data: Product[]; timestamp: number } | null = null;
let signatureProductCache: { data: Product | null; timestamp: number } | null = null;
let adminProductsCache: { data: Product[]; timestamp: number } | null = null;
const singleProductCache = new Map<string, { data: Product; timestamp: number }>();

export function invalidateProductsCache() {
  activeProductsCache = null;
  featuredProductsCache = null;
  signatureProductCache = null;
  adminProductsCache = null;
  singleProductCache.clear();
}

function matchesSearch(product: Product, queryText: string): boolean {
  const q = queryText.toLowerCase().trim();
  if (!q) return false;

  // Direct Name Check
  if (product.name?.en?.toLowerCase().includes(q)) return true;
  if (product.name?.ar?.toLowerCase().includes(q)) return true;

  // Scent Family Check
  if (product.scentFamily?.toLowerCase().includes(q)) return true;

  // Short Descriptor Check
  if (product.shortDescriptor?.en?.toLowerCase().includes(q)) return true;
  if (product.shortDescriptor?.ar?.toLowerCase().includes(q)) return true;

  // Notes Check
  if (product.notes?.top?.en?.toLowerCase().includes(q)) return true;
  if (product.notes?.top?.ar?.toLowerCase().includes(q)) return true;
  if (product.notes?.heart?.en?.toLowerCase().includes(q)) return true;
  if (product.notes?.heart?.ar?.toLowerCase().includes(q)) return true;
  if (product.notes?.base?.en?.toLowerCase().includes(q)) return true;
  if (product.notes?.base?.ar?.toLowerCase().includes(q)) return true;

  // Search Keywords Array Check
  if (product.searchKeywords?.some((k) => k.includes(q) || q.includes(k))) return true;

  return false;
}

/**
 * Products API Data-Access Module
 * Features in-memory caching and paginated data extraction to reduce Firestore read volume
 */
export const productsApi = {
  invalidateCache() {
    invalidateProductsCache();
  },

  /**
   * Fetch featured products for the storefront homepage showcase
   * Uses in-memory cache to avoid redundant reads on route switches
   */
  async getFeaturedProducts(limitCount = 4, forceRefresh = false): Promise<Product[]> {
    const now = Date.now();
    if (!forceRefresh && featuredProductsCache && now - featuredProductsCache.timestamp < CACHE_TTL_MS) {
      return featuredProductsCache.data.slice(0, limitCount);
    }

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('status', '==', 'active'),
        where('flags.isFeatured', '==', true),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const results = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
        featuredProductsCache = { data: results, timestamp: now };
        return results.slice(0, limitCount);
      }

      // Fallback: active products from Firestore with limit
      const fallbackQuery = query(
        collection(db, PRODUCTS_COLLECTION),
        where('status', '==', 'active'),
        limit(limitCount)
      );
      const fallbackSnap = await getDocs(fallbackQuery);
      if (!fallbackSnap.empty) {
        const results = fallbackSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
        featuredProductsCache = { data: results, timestamp: now };
        return results.slice(0, limitCount);
      }

      // Local curated fallback if DB is clean
      const featuredSeed = SEED_PRODUCTS.filter((p) => p.status === 'active' && p.flags?.isFeatured);
      const fallbackData = (featuredSeed.length > 0 ? featuredSeed : SEED_PRODUCTS.filter((p) => p.status === 'active')).slice(0, limitCount);
      featuredProductsCache = { data: fallbackData, timestamp: now };
      return fallbackData;
    } catch (error) {
      console.warn('Unable to query featured products, utilizing cached catalog fallback:', error);
      const featuredSeed = SEED_PRODUCTS.filter((p) => p.status === 'active' && p.flags?.isFeatured);
      return (featuredSeed.length > 0 ? featuredSeed : SEED_PRODUCTS.filter((p) => p.status === 'active')).slice(0, limitCount);
    }
  },

  /**
   * Fetch signature fragrance for homepage spotlight showcase
   */
  async getSignatureFragrance(forceRefresh = false): Promise<Product | null> {
    const now = Date.now();
    if (!forceRefresh && signatureProductCache && now - signatureProductCache.timestamp < CACHE_TTL_MS) {
      return signatureProductCache.data;
    }

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('status', '==', 'active'),
        where('flags.isSignature', '==', true),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const res: Product = {
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        };
        signatureProductCache = { data: res, timestamp: now };
        return res;
      }

      // Fallback: search active products
      const fallbackQuery = query(
        collection(db, PRODUCTS_COLLECTION),
        where('status', '==', 'active'),
        limit(1)
      );
      const fallbackSnap = await getDocs(fallbackQuery);
      if (!fallbackSnap.empty) {
        const docSnap = fallbackSnap.docs[0];
        const res: Product = {
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        };
        signatureProductCache = { data: res, timestamp: now };
        return res;
      }

      const seedSignature = SEED_PRODUCTS.find((p) => p.status === 'active' && p.flags?.isSignature) || SEED_PRODUCTS[0] || null;
      signatureProductCache = { data: seedSignature, timestamp: now };
      return seedSignature;
    } catch (error) {
      console.warn('Unable to query signature fragrance, utilizing fallback:', error);
      const seedSignature = SEED_PRODUCTS.find((p) => p.status === 'active' && p.flags?.isSignature) || SEED_PRODUCTS[0] || null;
      return seedSignature;
    }
  },

  /**
   * Fetch all active products for the public storefront with memory cache
   */
  async getActiveProducts(forceRefresh = false): Promise<Product[]> {
    const now = Date.now();
    if (!forceRefresh && activeProductsCache && now - activeProductsCache.timestamp < CACHE_TTL_MS) {
      return activeProductsCache.data;
    }

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
        activeProductsCache = { data: list, timestamp: now };
        return list;
      }
      const seedActive = SEED_PRODUCTS.filter((p) => p.status === 'active');
      activeProductsCache = { data: seedActive, timestamp: now };
      return seedActive;
    } catch (error) {
      console.warn('Unable to reach remote products, utilizing cached catalog fallback:', error);
      return SEED_PRODUCTS.filter((p) => p.status === 'active');
    }
  },

  /**
   * Fetch products filtered by scent family (uses cached active products if available)
   */
  async getProductsByFamily(family: ScentFamily): Promise<Product[]> {
    const all = await this.getActiveProducts();
    return all.filter((p) => p.scentFamily === family);
  },

  /**
   * Fetch all products including drafts (for Admin / Staff users)
   */
  async getAllProductsAdmin(forceRefresh = false): Promise<Product[]> {
    const now = Date.now();
    if (!forceRefresh && adminProductsCache && now - adminProductsCache.timestamp < CACHE_TTL_MS) {
      return adminProductsCache.data;
    }

    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
        adminProductsCache = { data: list, timestamp: now };
        return list;
      }
      adminProductsCache = { data: SEED_PRODUCTS, timestamp: now };
      return SEED_PRODUCTS;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
    }
  },

  /**
   * Paginated Products Admin Helper
   */
  async getPaginatedProductsAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
    family?: string;
    status?: string;
    stockFilter?: string;
    flagFilter?: string;
    sortField?: 'name' | 'family' | 'price' | 'stock' | 'status' | 'updatedAt';
    sortDirection?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }): Promise<{
    items: Product[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const all = await this.getAllProductsAdmin(params.forceRefresh);
    let filtered = [...all];

    // Search filter
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((p) => matchesSearch(p, q));
    }

    // Family filter
    if (params.family && params.family !== 'all') {
      filtered = filtered.filter((p) => p.scentFamily === params.family);
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Stock filter
    if (params.stockFilter && params.stockFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const totalStock = p.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
        if (params.stockFilter === 'out') return totalStock === 0;
        if (params.stockFilter === 'low') return totalStock > 0 && totalStock <= 15;
        if (params.stockFilter === 'in') return totalStock > 15;
        return true;
      });
    }

    // Flag filter
    if (params.flagFilter && params.flagFilter !== 'all') {
      filtered = filtered.filter((p) => {
        if (params.flagFilter === 'featured') return !!p.flags?.isFeatured;
        if (params.flagFilter === 'signature') return !!p.flags?.isSignature;
        if (params.flagFilter === 'new') return !!p.flags?.isNew;
        if (params.flagFilter === 'limited') return !!p.flags?.isLimited;
        return true;
      });
    }

    // Sorting
    const field = params.sortField || 'updatedAt';
    const dir = params.sortDirection === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (field === 'name') {
        const nameA = a.name?.en || '';
        const nameB = b.name?.en || '';
        return nameA.localeCompare(nameB) * dir;
      }
      if (field === 'price') {
        const priceA = a.sizes?.[0]?.price || 0;
        const priceB = b.sizes?.[0]?.price || 0;
        return (priceA - priceB) * dir;
      }
      if (field === 'stock') {
        const stockA = a.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
        const stockB = b.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
        return (stockA - stockB) * dir;
      }
      if (field === 'status') {
        return (a.status || '').localeCompare(b.status || '') * dir;
      }
      if (field === 'family') {
        return (a.scentFamily || '').localeCompare(b.scentFamily || '') * dir;
      }
      // default: updatedAt / createdAt
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return (timeA - timeB) * dir;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
    const currentPage = Math.min(Math.max(1, params.page), totalPages);
    const start = (currentPage - 1) * params.pageSize;
    const items = filtered.slice(start, start + params.pageSize);

    return {
      items,
      totalItems,
      totalPages,
      currentPage,
    };
  },

  /**
   * Get a single product by ID with caching
   */
  async getProductById(productId: string, forceRefresh = false): Promise<Product | null> {
    const now = Date.now();
    const cached = singleProductCache.get(productId);
    if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data: Product = { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) };
        singleProductCache.set(productId, { data, timestamp: now });
        return data;
      }
      const fallback = SEED_PRODUCTS.find((p) => p.id === productId);
      if (fallback) {
        singleProductCache.set(productId, { data: fallback, timestamp: now });
      }
      return fallback || null;
    } catch (error) {
      console.warn(`Fallback single product returned for ${productId}:`, error);
      const fallback = SEED_PRODUCTS.find((p) => p.id === productId);
      return fallback || null;
    }
  },

  /**
   * Predictive search query for active products matching a user query
   */
  async searchProducts(searchTerm: string, limitCount = 6): Promise<Product[]> {
    const clean = searchTerm.trim().toLowerCase();
    if (!clean) return [];

    try {
      const tokens = clean.split(/\s+/).filter(Boolean);
      const primaryToken = tokens[0];

      if (primaryToken && primaryToken.length >= 2) {
        const q = query(
          collection(db, PRODUCTS_COLLECTION),
          where('status', '==', 'active'),
          where('searchKeywords', 'array-contains', primaryToken),
          limit(limitCount * 2)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const results = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Product, 'id'>),
          }));

          const matched = results
            .filter((p) => matchesSearch(p, clean))
            .slice(0, limitCount);

          if (matched.length > 0) {
            return matched;
          }
        }
      }

      // Fall back to memory-cached active products
      const allActive = await this.getActiveProducts();
      return allActive
        .filter((p) => matchesSearch(p, clean))
        .slice(0, limitCount);
    } catch (error) {
      console.warn('Firestore search query fallback activated:', error);
      const allActive = await this.getActiveProducts();
      return allActive
        .filter((p) => matchesSearch(p, clean))
        .slice(0, limitCount);
    }
  },

  /**
   * Create or set a product document
   */
  async createProduct(product: Product): Promise<void> {
    const docPath = `${PRODUCTS_COLLECTION}/${product.id}`;
    const keywords = product.searchKeywords && product.searchKeywords.length > 0
      ? product.searchKeywords
      : generateProductSearchKeywords(product);

    const docData: Product = {
      ...product,
      searchKeywords: keywords,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(docRef, sanitizeForFirestore(docData));
      invalidateProductsCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  /**
   * Update a product document
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      let updatedKeywords = updates.searchKeywords;

      if (!updatedKeywords && (updates.name || updates.shortDescriptor || updates.notes || updates.scentFamily)) {
        const currentDoc = await this.getProductById(productId);
        if (currentDoc) {
          updatedKeywords = generateProductSearchKeywords({ ...currentDoc, ...updates });
        }
      }

      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        ...(updatedKeywords ? { searchKeywords: updatedKeywords } : {}),
        updatedAt: new Date().toISOString(),
      }));
      invalidateProductsCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Delete a product document
   */
  async deleteProduct(productId: string): Promise<void> {
    const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(docRef);
      invalidateProductsCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },
};
