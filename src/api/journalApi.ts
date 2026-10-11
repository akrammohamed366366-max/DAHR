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
import { SEED_JOURNAL_ARTICLES } from '../data/seedData';
import { JournalArticle } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const ARTICLES_COLLECTION = 'journalArticles';
const CACHE_TTL_MS = 90_000; // 90s cache TTL

// In-memory cache
let publishedArticlesCache: { data: JournalArticle[]; timestamp: number } | null = null;
let adminArticlesCache: { data: JournalArticle[]; timestamp: number } | null = null;
const singleArticleCache = new Map<string, { data: JournalArticle; timestamp: number }>();

export function invalidateJournalCache() {
  publishedArticlesCache = null;
  adminArticlesCache = null;
  singleArticleCache.clear();
}

/**
 * Journal Articles API Data-Access Module
 * Used by storefront blog/journal and admin CMS with caching & pagination
 */
export const journalApi = {
  invalidateCache() {
    invalidateJournalCache();
  },

  /**
   * Fetch all published journal articles for public storefront with cache
   */
  async getPublishedArticles(forceRefresh = false): Promise<JournalArticle[]> {
    const now = Date.now();
    if (!forceRefresh && publishedArticlesCache && now - publishedArticlesCache.timestamp < CACHE_TTL_MS) {
      return publishedArticlesCache.data;
    }

    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const articles = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<JournalArticle, 'id'>),
        }));
        articles.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        publishedArticlesCache = { data: articles, timestamp: now };
        return articles;
      }
      const seedPublished = SEED_JOURNAL_ARTICLES.filter((a) => a.status === 'published');
      publishedArticlesCache = { data: seedPublished, timestamp: now };
      return seedPublished;
    } catch (error) {
      console.warn('Unable to reach remote articles, utilizing cached journal fallback:', error);
      const seedPublished = SEED_JOURNAL_ARTICLES.filter((a) => a.status === 'published');
      publishedArticlesCache = { data: seedPublished, timestamp: now };
      return seedPublished;
    }
  },

  /**
   * Fetch all articles including drafts (for Admin / Staff CMS) with cache
   */
  async getAllArticlesAdmin(forceRefresh = false): Promise<JournalArticle[]> {
    const now = Date.now();
    if (!forceRefresh && adminArticlesCache && now - adminArticlesCache.timestamp < CACHE_TTL_MS) {
      return adminArticlesCache.data;
    }

    try {
      const q = query(collection(db, ARTICLES_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const articles = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<JournalArticle, 'id'>),
        }));
        articles.sort((a, b) => {
          const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        adminArticlesCache = { data: articles, timestamp: now };
        return articles;
      }
      adminArticlesCache = { data: SEED_JOURNAL_ARTICLES, timestamp: now };
      return SEED_JOURNAL_ARTICLES;
    } catch (error) {
      console.warn('Unable to query remote journal articles in admin, using local cache:', error);
      return SEED_JOURNAL_ARTICLES;
    }
  },

  /**
   * Paginated Articles Admin Helper
   */
  async getPaginatedArticlesAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    sortField?: 'title' | 'status' | 'publishedAt' | 'id';
    sortDirection?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }): Promise<{
    items: JournalArticle[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const all = await this.getAllArticlesAdmin(params.forceRefresh);
    let filtered = [...all];

    // Filter search
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((a) => {
        if (a.id.toLowerCase().includes(q)) return true;
        if (a.title?.en?.toLowerCase().includes(q)) return true;
        if (a.title?.ar?.toLowerCase().includes(q)) return true;
        if (a.excerpt?.en?.toLowerCase().includes(q)) return true;
        if (a.excerpt?.ar?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // Filter status
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((a) => a.status === params.status);
    }

    // Sort
    const field = params.sortField || 'publishedAt';
    const dir = params.sortDirection === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (field === 'title') {
        const titleA = a.title?.en || '';
        const titleB = b.title?.en || '';
        return titleA.localeCompare(titleB) * dir;
      }
      if (field === 'status') {
        return a.status.localeCompare(b.status) * dir;
      }
      if (field === 'id') {
        return a.id.localeCompare(b.id) * dir;
      }
      // default: publishedAt / createdAt
      const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
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
   * Get single article by ID with cache
   */
  async getArticleById(articleId: string, forceRefresh = false): Promise<JournalArticle | null> {
    const now = Date.now();
    const cached = singleArticleCache.get(articleId);
    if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const docRef = doc(db, ARTICLES_COLLECTION, articleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data: JournalArticle = { id: docSnap.id, ...(docSnap.data() as Omit<JournalArticle, 'id'>) };
        singleArticleCache.set(articleId, { data, timestamp: now });
        return data;
      }
      const fallback = SEED_JOURNAL_ARTICLES.find((a) => a.id === articleId);
      if (fallback) {
        singleArticleCache.set(articleId, { data: fallback, timestamp: now });
      }
      return fallback || null;
    } catch (error) {
      console.warn(`Fallback single article returned for ${articleId}:`, error);
      const fallback = SEED_JOURNAL_ARTICLES.find((a) => a.id === articleId);
      return fallback || null;
    }
  },

  /**
   * Create or set an article
   */
  async createArticle(article: JournalArticle): Promise<void> {
    const docPath = `${ARTICLES_COLLECTION}/${article.id}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, article.id);
      await setDoc(docRef, sanitizeForFirestore({
        ...article,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      invalidateJournalCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  /**
   * Update an existing article
   */
  async updateArticle(articleId: string, updates: Partial<JournalArticle>): Promise<void> {
    const docPath = `${ARTICLES_COLLECTION}/${articleId}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, articleId);
      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
      invalidateJournalCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Delete an article
   */
  async deleteArticle(articleId: string): Promise<void> {
    const docPath = `${ARTICLES_COLLECTION}/${articleId}`;
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, articleId);
      await deleteDoc(docRef);
      invalidateJournalCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },
};
