import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

/**
 * Initializes the Firebase Admin SDK safely, preventing multiple initializations
 * in a serverless environment like Vercel.
 */
function initFirebaseAdmin() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.warn("FCM Warning: Firebase Admin credentials not found in environment variables. Push notifications will be silently skipped.");
    return false;
  }

  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      return false;
    }
  }

  return true;
}

/**
 * Sends a push notification to specific FCM tokens.
 */
export async function sendPushNotification(tokens: string[], title: string, body: string, url?: string) {
  const isInitialized = initFirebaseAdmin();
  if (!isInitialized || tokens.length === 0) return false;

  try {
    const payload = {
      notification: {
        title,
        body,
      },
      data: {
        url: url || "/admin",
      },
    };

    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      ...payload,
    });

    if (response.failureCount > 0) {
      console.warn(`FCM: ${response.failureCount} messages failed to send.`);
      
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          if (
            resp.error.code === 'messaging/invalid-registration-token' ||
            resp.error.code === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        // Find all admins with these failed tokens and remove them
        const adminsWithTokens = await prisma.adminUser.findMany({
          where: { fcmTokens: { hasSome: failedTokens } }
        });
        
        for (const admin of adminsWithTokens) {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: {
              fcmTokens: {
                set: admin.fcmTokens.filter(t => !failedTokens.includes(t))
              }
            }
          });
        }
        console.log(`FCM: Cleaned up ${failedTokens.length} dead tokens from database.`);
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending FCM push notification:", error);
    return false;
  }
}

