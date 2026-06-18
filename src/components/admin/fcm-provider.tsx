"use client";

import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Note: Ensure NEXT_PUBLIC_... vars are populated in .env for production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "placeholder",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "placeholder",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "placeholder",
};

export function FcmProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on the client and if Firebase is configured
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;

    const setupFCM = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn("FCM is not supported in this browser.");
          return;
        }

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMessaging(app);

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // Register service worker manually to avoid default registration timeouts in Next.js
          let registration: ServiceWorkerRegistration | undefined;
          if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          }

          // Get the FCM token
          const token = await getToken(messaging, {
            // Replace with your actual VAPID Key from Firebase Console -> Cloud Messaging
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (token) {
            // Save token to backend API
            await fetch("/api/admin/fcm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
          }

          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            // Optionally, show a toast notification here using Sonner or similar
            if (payload.notification?.title) {
              // using standard Notification API if page is visible
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: "/assets/logo-icafow.png",
              });
            }
          });
        }
      } catch (error) {
        console.error("FCM Setup Error:", error);
      }
    };

    setupFCM();
  }, []);

  return <>{children}</>;
}
