# ICAFoW 2026 — Complete Conference & Admin Platform

A production-ready platform for the **International Conference on AI & the Future of Work (ICAFoW 2026)**. Hosted by the Africa Research Institute For AI (ARIFA).

This platform serves as a modern single-page marketing site, a comprehensive multi-tier registration system, a real-time payment gateway (Selcom), and a robust Admin Dashboard with a complex, event-driven notification queue system.

---

## 🚀 Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Framer Motion + custom UI primitives
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth (Auth.js v5)
- **Payments:** Selcom Payment Gateway
- **Emails:** Nodemailer via InterServer SMTP
- **Push Notifications:** Firebase Cloud Messaging (FCM) Admin SDK

---

## 🔔 Architecture: The Notification Engine
The system includes a highly scalable, event-driven notification engine that runs autonomously. When users register or perform actions, jobs are pushed to an Outbox Queue (`NotificationJob` table) to prevent slowing down the web request.

A background queue processor (`src/lib/queueProcessor.ts`) instantly fires and handles:
1. **SMTP Emails:** Dispatches Welcome Emails, Approvals, and Admin Alerts.
2. **In-App Notifications:** Drops persistent alerts into the `InAppNotification` table, illuminating the dashboard bell icon for all active administrators.
3. **Firebase Pushes:** Blasts realtime mobile/web push notifications to all admin devices via Firebase Multicast. **Self-Healing:** Automatically catches `invalid-registration-token` errors and deletes dead tokens from the database to prevent Firebase quota bloat.

### Background Queue Worker (Cron)
For failed job retries (e.g. SMTP server temporarily down), the system exposes a secure endpoint. You must set up a Cron Job on your server (cPanel/VPS) to ping it every 5 minutes:
```bash
curl -s https://aiconference.arifa.org/api/cron/process-notifications > /dev/null
```

---

## 🛠️ Step-by-Step Local Setup Guide

Follow these instructions to clone, configure, and reproduce this entire system on a local machine.

### 1. Clone & Install
```bash
git clone <repository-url>
cd icafow-2026
npm install
```

### 2. Database Configuration
You must have a PostgreSQL database running locally or in the cloud. 
Duplicate the `.env.example` file (or create a `.env` file) and set:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/icafow"
```

Push the schema and seed the initial admin account:
```bash
npm run db:push
npm run db:seed
```

### 3. Environment Variables (.env)
You must configure several external services to make the full system work.

#### Authentication
Generate a secure random string for NextAuth:
```ini
NEXTAUTH_SECRET="your-super-secret-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

#### SMTP (Emails)
The platform uses Nodemailer. Provide your SMTP credentials:
```ini
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=YourSecurePassword
SMTP_FROM="ICAFoW <noreply@yourdomain.com>"
```

#### Firebase (Push Notifications)
For the FCM push notifications to work, provide your Firebase Service Account Private Key. *Be sure to wrap the private key in quotes and preserve the `\n` linebreaks.*
```ini
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY="your-web-api-key"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"
```

#### Selcom Payments
Set `SELCOM_MOCK="true"` to simulate successful/failed payments locally without real credentials.
```ini
SELCOM_MOCK="true"
# Live credentials...
SELCOM_BASE_URL="https://apigw.selcommobile.com/v1"
SELCOM_API_KEY="your-api-key"
SELCOM_API_SECRET="your-api-secret"
SELCOM_VENDOR_ID="your-vendor-id"
```

### 4. Run the Development Server
Start the frontend Next.js server:
```bash
npm run dev
```

*(Optional)* Start the local Background Worker to process emails and notifications in real-time. Open a **second terminal window** and run:
```bash
npm run queue:dev
```

---

## 🖥️ Navigation
- **Public Site:** `http://localhost:3000/`
- **Registration Flow:** `/register/attendee` (and `/sponsor`, `/exhibitor`, `/partner`, `/speaker`, `/pitch`)
- **Admin Dashboard:** `http://localhost:3000/admin`
  - *Login with the default seeded credentials (or credentials you defined in your `.env` during seed).*

## 🚀 Deployment (VPS / cPanel)
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production server (typically managed via PM2 or Phusion Passenger on cPanel):
   ```bash
   npm run start
   ```
3. Set up the Cron Job in your cPanel dashboard to hit the `/api/cron/process-notifications` endpoint.
4. Ensure your webhook URL `https://your-domain.com/api/payments/selcom/webhook` is registered with Selcom's integration team.
