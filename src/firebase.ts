import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD52WFOogu-fGu1UmIPmJPlBQggMCZWtoc",
  authDomain: "surgeskills-2f8e2.firebaseapp.com",
  projectId: "surgeskills-2f8e2",
  storageBucket: "surgeskills-2f8e2.firebasestorage.app",
  messagingSenderId: "740390957669",
  appId: "1:740390957669:web:55a474b1131d97740a4c8c",
  measurementId: "G-QJDE5ZTKNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Export Auth and Firestore for the rest of the app to use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();