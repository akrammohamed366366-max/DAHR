import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { UserAddress, UserProfile } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const USERS_COLLECTION = 'users';

/**
 * User Profile API Data-Access Module
 * Manages customer account details and single saved shipping address in Firestore
 */
export const userProfileApi = {
  /**
   * Retrieve user profile with saved address
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docPath = `${USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as UserProfile;
    } catch (error) {
      console.warn(`Local fallback/warning for user profile ${uid}:`, error);
      return null;
    }
  },

  /**
   * Save or update the single shipping address on the customer's profile
   */
  async saveAddress(
    uid: string,
    address: UserAddress,
    email?: string,
    displayName?: string
  ): Promise<void> {
    const docPath = `${USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);
      const now = new Date().toISOString();

      if (docSnap.exists()) {
        await updateDoc(docRef, sanitizeForFirestore({
          address,
          updatedAt: now,
          ...(displayName ? { displayName } : {}),
        }));
      } else {
        const payload: UserProfile = {
          uid,
          email: email || '',
          displayName: displayName || '',
          address,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(docRef, sanitizeForFirestore(payload));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Remove the saved shipping address
   */
  async deleteAddress(uid: string): Promise<void> {
    const docPath = `${USERS_COLLECTION}/${uid}`;
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(docRef, {
        address: null,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },
};
