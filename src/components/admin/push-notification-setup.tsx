"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { initMessaging } from "@/lib/firebase-client";

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    async function setupPush() {
      if (permission === "granted") {
        try {
          const messaging = await initMessaging();
          if (!messaging) return;

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) return;

          const currentToken = await getToken(messaging, { vapidKey });
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            await fetch("/api/admin/fcm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken }),
            });
          }
        } catch (error) {
          console.error("An error occurred while retrieving token. ", error);
        }
      }
    }

    setupPush();
  }, [permission]);

  // If permission is default, we could render a small toast or banner asking them to enable, 
  // but many browsers automatically prompt when Notification.requestPermission() is called.
  // For now, we'll silently request if they interact with the page, or let the user click a button.
  // But standard practice in dashboards is to ask nicely. We will just attempt to request when mounted 
  // if not denied.
  useEffect(() => {
    if (permission === "default") {
      // It's usually better to request on a user interaction, but for an admin dashboard
      // we might just want to ask immediately.
      Notification.requestPermission().then((p) => {
        setPermission(p);
      });
    }
  }, [permission]);

  return null; // This component is invisible
}
