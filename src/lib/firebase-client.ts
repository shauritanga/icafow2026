import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is present and app hasn't been initialized
const app = (!getApps().length && firebaseConfig.apiKey) 
  ? initializeApp(firebaseConfig) 
  : getApp();

let messaging: Messaging | null = null;

// Only initialize messaging if in the browser and supported
export const initMessaging = async () => {
  if (typeof window !== "undefined" && app) {
    try {
      const supported = await isSupported();
      if (supported) {
        messaging = getMessaging(app);
      }
    } catch (e) {
      console.warn("Firebase Messaging not supported", e);
    }
  }
  return messaging;
};

export { app };
