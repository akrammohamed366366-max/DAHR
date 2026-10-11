import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Order, OrderStatus, OrderStatusHistoryEntry } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const ORDERS_COLLECTION = 'orders';
const CACHE_TTL_MS = 60_000; // 60s cache TTL

// In-memory cache for orders
let adminOrdersCache: { data: Order[]; timestamp: number } | null = null;
const customerOrdersCache = new Map<string, { data: Order[]; timestamp: number }>();

export function invalidateOrdersCache() {
  adminOrdersCache = null;
  customerOrdersCache.clear();
}

/**
 * Orders API Data-Access Module
 * Used by Checkout, Customer Account history, and Admin Order management
 */
export const ordersApi = {
  invalidateCache() {
    invalidateOrdersCache();
  },

  /**
   * Create a new order (public / checkout)
   */
  async createOrder(order: Order): Promise<string> {
    const docPath = `${ORDERS_COLLECTION}/${order.id}`;
    try {
      const docRef = doc(db, ORDERS_COLLECTION, order.id);
      const initialHistory: OrderStatusHistoryEntry = {
        status: order.status,
        timestamp: order.createdAt || new Date().toISOString(),
        notes: 'Order submitted via Atelier Storefront',
        updatedBy: order.customer?.name || 'Customer',
      };
      const orderToSave: Order = {
        ...order,
        statusHistory: order.statusHistory || [initialHistory],
      };
      await setDoc(docRef, sanitizeForFirestore(orderToSave));
      invalidateOrdersCache();
      return order.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  /**
   * Get an order by ID (customer or admin)
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const docPath = `${ORDERS_COLLECTION}/${orderId}`;
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  /**
   * Get orders for a specific authenticated customer with cache
   */
  async getOrdersForCustomer(uid: string, forceRefresh = false): Promise<Order[]> {
    const now = Date.now();
    const cached = customerOrdersCache.get(uid);
    if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('customer.uid', '==', uid)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Order, 'id'>),
      }));
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      customerOrdersCache.set(uid, { data: orders, timestamp: now });
      return orders;
    } catch (error) {
      console.warn(`Customer orders for ${uid} query error, returning empty list:`, error);
      return [];
    }
  },

  /**
   * Get all orders (fullAdmin only) with cache
   */
  async getAllOrdersAdmin(forceRefresh = false): Promise<Order[]> {
    const now = Date.now();
    if (!forceRefresh && adminOrdersCache && now - adminOrdersCache.timestamp < CACHE_TTL_MS) {
      return adminOrdersCache.data;
    }

    try {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Order, 'id'>),
      }));
      adminOrdersCache = { data: orders, timestamp: now };
      return orders;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  },

  /**
   * Paginated Orders Admin Helper
   */
  async getPaginatedOrdersAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    sortField?: 'id' | 'createdAt' | 'customer' | 'total' | 'status';
    sortDirection?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }): Promise<{
    items: Order[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const all = await this.getAllOrdersAdmin(params.forceRefresh);
    let filtered = [...all];

    // Filter search (Order ID, Customer Name, Customer Email)
    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((o) => {
        if (o.id.toLowerCase().includes(q)) return true;
        if (o.customer?.name?.toLowerCase().includes(q)) return true;
        if (o.customer?.email?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // Filter status
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    // Sorting
    const field = params.sortField || 'createdAt';
    const dir = params.sortDirection === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (field === 'id') {
        return a.id.localeCompare(b.id) * dir;
      }
      if (field === 'customer') {
        const nameA = a.customer?.name || '';
        const nameB = b.customer?.name || '';
        return nameA.localeCompare(nameB) * dir;
      }
      if (field === 'total') {
        return ((a.total || 0) - (b.total || 0)) * dir;
      }
      if (field === 'status') {
        return (a.status || '').localeCompare(b.status || '') * dir;
      }
      // default: createdAt
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
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
   * Update order status / internal notes (fullAdmin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    internalNotes?: string,
    historyEntry?: OrderStatusHistoryEntry
  ): Promise<void> {
    const docPath = `${ORDERS_COLLECTION}/${orderId}`;
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const now = new Date().toISOString();
      const updates: Record<string, any> = {
        status,
        updatedAt: now,
      };

      if (internalNotes !== undefined) {
        updates.internalNotes = internalNotes;
      }

      if (historyEntry) {
        updates.statusHistory = arrayUnion(sanitizeForFirestore(historyEntry));
      } else {
        const defaultEntry: OrderStatusHistoryEntry = {
          status,
          timestamp: now,
          notes: internalNotes ? `Status updated to ${status}` : undefined,
          updatedBy: 'fullAdmin',
        };
        updates.statusHistory = arrayUnion(sanitizeForFirestore(defaultEntry));
      }

      await updateDoc(docRef, updates);
      invalidateOrdersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Save internal notes only
   */
  async updateInternalNotes(orderId: string, internalNotes: string): Promise<void> {
    const docPath = `${ORDERS_COLLECTION}/${orderId}`;
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        internalNotes,
        updatedAt: new Date().toISOString(),
      });
      invalidateOrdersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },
};
