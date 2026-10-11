/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Set Firestore log level to silent to avoid noisy connection retry notices
setLogLevel('silent');

// Read Firebase configuration ONLY from environment variables (import.meta.env.VITE_*)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Optional App Check initialization via VITE_APPCHECK_SITE_KEY environment variable
const appCheckSiteKey = import.meta.env.VITE_APPCHECK_SITE_KEY;
if (appCheckSiteKey && typeof window !== 'undefined') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('Firebase AppCheck initialization failed:', err);
  }
}

// Optional custom Firestore database ID via environment variable; defaults to standard Firestore database
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
