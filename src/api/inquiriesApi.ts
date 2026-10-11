import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { ContactMessage, NewsletterSubscriber } from '../types/backend';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';

const CONTACT_COLLECTION = 'contactMessages';
const NEWSLETTER_COLLECTION = 'newsletterSubscribers';

/**
 * Inquiries and Subscriptions API Data-Access Module
 */
export const inquiriesApi = {
  // --------------------------------------------------------------------------
  // Contact Messages
  // --------------------------------------------------------------------------
  async submitContactMessage(message: Omit<ContactMessage, 'createdAt'>): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const docPath = `${CONTACT_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, CONTACT_COLLECTION, id);
      const payload: ContactMessage = {
        ...message,
        id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload));
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  async listContactMessages(): Promise<ContactMessage[]> {
    try {
      const q = query(collection(db, CONTACT_COLLECTION));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data() as ContactMessage);
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CONTACT_COLLECTION);
    }
  },

  // --------------------------------------------------------------------------
  // Newsletter Subscriptions
  // --------------------------------------------------------------------------
  async subscribeNewsletter(email: string, locale: 'en' | 'ar' = 'en'): Promise<string> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const docPath = `${NEWSLETTER_COLLECTION}/${id}`;
    try {
      const docRef = doc(db, NEWSLETTER_COLLECTION, id);
      const payload: NewsletterSubscriber = {
        id,
        email,
        locale,
        subscribedAt: new Date().toISOString(),
      };
      await setDoc(docRef, sanitizeForFirestore(payload));
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  async listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const q = query(collection(db, NEWSLETTER_COLLECTION));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data() as NewsletterSubscriber);
      return list.sort(
        (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, NEWSLETTER_COLLECTION);
    }
  },
};
