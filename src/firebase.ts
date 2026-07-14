import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config is loaded from environment variables (.env).
// See .env.example for the required keys. Never commit .env to version control.
// NOTE: Firebase client-side API keys are safe to expose in the browser —
// they identify your project but do NOT grant access. Security is enforced
// entirely by Firestore Security Rules (see firestore.rules).
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     as string,
};

const app = initializeApp(firebaseConfig);

// Analytics may not be available in all environments (e.g. tests, SSR).
let analytics: Analytics | null = null;
try {
  analytics = getAnalytics(app);
} catch {
  // Analytics unavailable — safe to ignore.
}
export { analytics };

export const auth           = getAuth(app);
export const db             = getFirestore(app);
export const storage        = getStorage(app);
export const googleProvider = new GoogleAuthProvider();