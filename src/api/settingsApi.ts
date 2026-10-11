import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { ContactSettings, BrandingSettings } from '../types/backend';

export const DEFAULT_BRANDING: BrandingSettings = {
  logoImageUrl: '',
  siteName: {
    en: 'DAHR',
    ar: 'DAHR',
  },
};

export const DEFAULT_CONTACT: ContactSettings = {
  facebookPage: '',
  facebookGroup: '',
  instagram: '',
  whatsappNumber: '',
  whatsappGroup: '',
  telegramChannel: '',
  telegramGroup: '',
};

const SETTINGS_COLLECTION = 'settings';
const CONTACT_DOC = 'contact';
const BRANDING_DOC = 'branding';

/**
 * Settings API Service
 * Handles Firestore read/write for contact channels and brand identity,
 * plus logo asset upload to Firebase Storage under /branding/logo.
 */
export const settingsApi = {
  /**
   * Fetch current contact & social channels settings
   */
  async getContactSettings(): Promise<ContactSettings> {
    const path = `${SETTINGS_COLLECTION}/${CONTACT_DOC}`;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CONTACT_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...DEFAULT_CONTACT,
          ...(snap.data() as ContactSettings),
        };
      }
      return { ...DEFAULT_CONTACT };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Save contact & social links (fullAdmin only)
   */
  async saveContactSettings(settings: ContactSettings): Promise<void> {
    const path = `${SETTINGS_COLLECTION}/${CONTACT_DOC}`;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CONTACT_DOC);
      const payload: ContactSettings = {
        facebookPage: (settings.facebookPage || '').trim(),
        facebookGroup: (settings.facebookGroup || '').trim(),
        instagram: (settings.instagram || '').trim(),
        whatsappNumber: (settings.whatsappNumber || '').trim(),
        whatsappGroup: (settings.whatsappGroup || '').trim(),
        telegramChannel: (settings.telegramChannel || '').trim(),
        telegramGroup: (settings.telegramGroup || '').trim(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Fetch current brand identity settings
   */
  async getBrandingSettings(): Promise<BrandingSettings> {
    const path = `${SETTINGS_COLLECTION}/${BRANDING_DOC}`;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<BrandingSettings>;
        return {
          logoImageUrl: data.logoImageUrl || '',
          siteName: {
            en: data.siteName?.en || DEFAULT_BRANDING.siteName.en,
            ar: data.siteName?.ar || DEFAULT_BRANDING.siteName.ar,
          },
          updatedAt: data.updatedAt,
        };
      }
      return { ...DEFAULT_BRANDING };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Save brand identity settings (fullAdmin only)
   */
  async saveBrandingSettings(settings: BrandingSettings): Promise<void> {
    const path = `${SETTINGS_COLLECTION}/${BRANDING_DOC}`;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
      const payload: BrandingSettings = {
        logoImageUrl: (settings.logoImageUrl || '').trim(),
        siteName: {
          en: (settings.siteName?.en || '').trim() || DEFAULT_BRANDING.siteName.en,
          ar: (settings.siteName?.ar || '').trim() || DEFAULT_BRANDING.siteName.ar,
        },
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Subscribe to real-time updates for contact settings
   */
  subscribeContact(
    onData: (data: ContactSettings) => void,
    onError?: (error: unknown) => void
  ): () => void {
    const path = `${SETTINGS_COLLECTION}/${CONTACT_DOC}`;
    const docRef = doc(db, SETTINGS_COLLECTION, CONTACT_DOC);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onData({
            ...DEFAULT_CONTACT,
            ...(snap.data() as ContactSettings),
          });
        } else {
          onData({ ...DEFAULT_CONTACT });
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  /**
   * Subscribe to real-time updates for brand identity settings
   */
  subscribeBranding(
    onData: (data: BrandingSettings) => void,
    onError?: (error: unknown) => void
  ): () => void {
    const path = `${SETTINGS_COLLECTION}/${BRANDING_DOC}`;
    const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<BrandingSettings>;
          onData({
            logoImageUrl: data.logoImageUrl || '',
            siteName: {
              en: data.siteName?.en || DEFAULT_BRANDING.siteName.en,
              ar: data.siteName?.ar || DEFAULT_BRANDING.siteName.ar,
            },
            updatedAt: data.updatedAt,
          });
        } else {
          onData({ ...DEFAULT_BRANDING });
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  /**
   * Upload logo image to Firebase Storage under /branding/logo
   */
  async uploadLogo(file: File): Promise<string> {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `branding/logo/${Date.now()}_${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error: any) {
      console.warn('Firebase Storage upload warning, falling back to data URL:', error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to parse uploaded image file.'));
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }
  },
};
