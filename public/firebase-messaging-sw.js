// Scripts for firebase and firebase-messaging
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// NOTE: These values must match the ones in your web app configuration.
const firebaseConfig = {
  apiKey: "AIzaSyB92I6lgicORyXfm-jQnv--MthvpnvwOeM",
  authDomain: "arifa-9bcb7.firebaseapp.com",
  projectId: "arifa-9bcb7",
  storageBucket: "arifa-9bcb7.firebasestorage.app",
  messagingSenderId: "265222647137",
  appId: "1:265222647137:web:40a0a15573c1629fe52920",
  measurementId: "G-4G5LKHBQ6J"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    const notificationTitle = payload.notification.title || "ICAFoW Admin";
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/assets/logo-icafow.png",
      data: payload.data, // Contains URL to open on click
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn("Firebase SW initialization skipped due to missing config.", e);
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
