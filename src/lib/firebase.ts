/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Set Firestore log level to silent to avoid noisy connection retry notices
setLogLevel('silent');

// Read Firebase configuration from environment variables with production defaults
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBopufwISNZQxUwE_zei1L1ZIkySNi1WPw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0246922288.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0246922288',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0246922288.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '739622248619',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:739622248619:web:40958aafa84348780797ee',
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

// Custom Firestore database ID via environment variable or default project database
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || 'ai-studio-dahr-6dd617eb-4b69-4c80-a48b-42ee3cf7baba';
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
