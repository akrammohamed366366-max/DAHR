import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as authSignOut,
} from 'firebase/auth';
import { db, firebaseConfig } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { AdminRole, AdminUser, AdminUserStatus } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const ADMIN_USERS_COLLECTION = 'adminUsers';
const CACHE_TTL_MS = 60_000;

let adminUsersCache: { data: AdminUser[]; timestamp: number } | null = null;

export function invalidateAdminUsersCache() {
  adminUsersCache = null;
}

export interface CreateAdminUserParams {
  email: string;
  displayName: string;
  role: AdminRole;
  password?: string;
}

export interface CreateAdminUserResult {
  user: AdminUser;
  temporaryPassword?: string;
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Dahr#${rand}!`;
}

/**
 * Admin Users API Data-Access Module
 * Accessible only by fullAdmin users with in-memory caching and pagination
 */
export const adminUsersApi = {
  invalidateCache() {
    invalidateAdminUsersCache();
  },

  /**
   * Get an admin user by UID
   */
  async getAdminUser(uid: string): Promise<AdminUser | null> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as AdminUser;
    } catch (error) {
      console.warn(`Admin profile read returned null for ${uid}:`, error);
      return null;
    }
  },

  /**
   * List all admin/staff users (fullAdmin only) with cache
   */
  async listAdminUsers(forceRefresh = false): Promise<AdminUser[]> {
    const now = Date.now();
    if (!forceRefresh && adminUsersCache && now - adminUsersCache.timestamp < CACHE_TTL_MS) {
      return adminUsersCache.data;
    }

    try {
      const q = query(collection(db, ADMIN_USERS_COLLECTION));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data() as AdminUser);
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      adminUsersCache = { data: list, timestamp: now };
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ADMIN_USERS_COLLECTION);
    }
  },

  /**
   * Paginated Admin Users Helper
   */
  async getPaginatedAdminUsers(params: {
    page: number;
    pageSize: number;
    search?: string;
    role?: string;
    status?: string;
    forceRefresh?: boolean;
  }): Promise<{
    items: AdminUser[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const all = await this.listAdminUsers(params.forceRefresh);
    let filtered = [...all];

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((u) => {
        if (u.displayName?.toLowerCase().includes(q)) return true;
        if (u.email?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    if (params.role && params.role !== 'all') {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((u) => u.status === params.status);
    }

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
   * Create a new administrative account:
   * 1. Creates Firebase Auth user using isolated secondary app instance (no session disruption)
   * 2. Sets the adminUsers document in Firestore with role and active status
   */
  async createAdminUserWithAuth(
    params: CreateAdminUserParams
  ): Promise<CreateAdminUserResult> {
    const { email, displayName, role } = params;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];
    const passwordToUse = params.password?.trim() || generateSecurePassword();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    const tempAppName = `admin-creator-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const secondaryApp = initializeApp(firebaseConfig, tempAppName);
    const secondaryAuth = getAuth(secondaryApp);

    let newUid = '';
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, passwordToUse);
      newUid = cred.user.uid;
      await authSignOut(secondaryAuth);
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error(
          `An account with email "${cleanEmail}" already exists in Firebase Auth. You can grant admin access by updating their profile or resetting their password.`
        );
      }
      throw new Error(`Authentication account creation failed: ${authError.message}`);
    } finally {
      try {
        await deleteApp(secondaryApp);
      } catch (e) {
        // secondary app cleanup
      }
    }

    const newAdminUser: AdminUser = {
      uid: newUid,
      email: cleanEmail,
      role,
      displayName: cleanName,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `${ADMIN_USERS_COLLECTION}/${newUid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, newUid);
      await setDoc(docRef, sanitizeForFirestore(newAdminUser));
      invalidateAdminUsersCache();
      return {
        user: newAdminUser,
        temporaryPassword: passwordToUse,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Set or create an admin user record directly (for existing auth accounts)
   */
  async setAdminUser(user: AdminUser): Promise<void> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${user.uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, user.uid);
      await setDoc(docRef, sanitizeForFirestore(user));
      invalidateAdminUsersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Update admin user role
   */
  async updateAdminUserRole(uid: string, role: AdminRole): Promise<void> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
      await updateDoc(
        docRef,
        sanitizeForFirestore({
          role,
          updatedAt: new Date().toISOString(),
        })
      );
      invalidateAdminUsersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Change status (active <-> deactivated)
   */
  async setAdminUserStatus(uid: string, status: AdminUserStatus): Promise<void> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
      await updateDoc(
        docRef,
        sanitizeForFirestore({
          status,
          updatedAt: new Date().toISOString(),
        })
      );
      invalidateAdminUsersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Update admin user details (role, displayName, status)
   */
  async updateAdminUser(uid: string, updates: Partial<AdminUser>): Promise<void> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
      await updateDoc(
        docRef,
        sanitizeForFirestore({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
      );
      invalidateAdminUsersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  /**
   * Remove admin/staff status
   */
  async deleteAdminUser(uid: string): Promise<void> {
    const docPath = `${ADMIN_USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
      await deleteDoc(docRef);
      invalidateAdminUsersCache();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },
};
