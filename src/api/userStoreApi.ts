import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import {
  CartRecord,
  Wishlist,
  CartItemRecord,
  WishlistItem,
  UserProfile,
  UserAddress,
} from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const CARTS_COLLECTION = 'carts';
const WISHLISTS_COLLECTION = 'wishlists';
const USERS_COLLECTION = 'users';

/**
 * User Store API Data-Access Module (Carts, Wishlists & Customer Profiles)
 * Scoped by authenticated UID with local storage fallback helper
 */
export const userStoreApi = {
  // --------------------------------------------------------------------------
  // User Profile & Saved Address Methods
  // --------------------------------------------------------------------------
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docPath = `${USERS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as UserProfile;
    } catch (error) {
      console.warn(`Local fallback for user profile ${userId}:`, error);
      return null;
    }
  },

  async saveUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    const docPath = `${USERS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const existing = await this.getUserProfile(userId);
      const payload: UserProfile = {
        uid: userId,
        email: profileData.email || existing?.email || '',
        displayName: profileData.displayName ?? existing?.displayName ?? '',
        phone: profileData.phone ?? existing?.phone ?? '',
        address: profileData.address ?? existing?.address,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async saveSavedAddress(userId: string, address: UserAddress, phone?: string): Promise<void> {
    const docPath = `${USERS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const payload: Partial<UserProfile> = {
        address,
        ...(phone ? { phone } : {}),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // --------------------------------------------------------------------------
  // Cart Methods
  // --------------------------------------------------------------------------
  async getCart(userId: string): Promise<CartRecord | null> {
    const docPath = `${CARTS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, CARTS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as CartRecord;
    } catch (error) {
      console.warn(`Local fallback for user cart ${userId}:`, error);
      return null;
    }
  },

  async saveCart(userId: string, items: CartItemRecord[]): Promise<void> {
    const docPath = `${CARTS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, CARTS_COLLECTION, userId);
      const payload: CartRecord = {
        userId,
        items,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async clearCart(userId: string): Promise<void> {
    const docPath = `${CARTS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, CARTS_COLLECTION, userId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // --------------------------------------------------------------------------
  // Wishlist Methods
  // --------------------------------------------------------------------------
  async getWishlist(userId: string): Promise<Wishlist | null> {
    const docPath = `${WISHLISTS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, WISHLISTS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as Wishlist;
    } catch (error) {
      console.warn(`Local fallback for user wishlist ${userId}:`, error);
      return null;
    }
  },

  async saveWishlist(userId: string, items: WishlistItem[]): Promise<void> {
    const docPath = `${WISHLISTS_COLLECTION}/${userId}`;
    try {
      const docRef = doc(db, WISHLISTS_COLLECTION, userId);
      const payload: Wishlist = {
        userId,
        items,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },
};
