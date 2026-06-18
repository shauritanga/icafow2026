# Forms and Payment Integration Report: ICAFoW 2026

I have conducted a thorough review of the project's form components, their validation schemas, the registration API endpoints, and the Selcom payment gateway integration. 

Here is the full report on what is working, what needs attention, and the critical edge cases to address before moving to production.

## 🟢 What is Working Perfectly

The foundational architecture for the forms and backend integration is highly robust and follows modern Next.js best practices:

1. **Rigorous Form Validation**: All forms (`attendee`, `exhibitor`, `partner`, `sponsor`, `speaker`, `pitch`) leverage `react-hook-form` paired with strict `zod` schemas (`src/lib/validations/registration.ts`). Constraints on string lengths, valid URLs, and mandatory consent checkboxes are well-implemented.
2. **Secure API Routes**: The registration endpoint (`POST /api/register/[type]`) uses the same Zod schemas for server-side validation, ensuring no malformed data bypasses the client.
3. **Database Transactions**: Registrations map cleanly to the Prisma `Registration` model with a `PENDING` state. Associated data (e.g., papers for researchers) are created correctly.
4. **Payment Handshake**: The Selcom `initiate` endpoint accurately calculates the total (converting USD to TZS), establishes a secure order via `@/lib/selcom/client.ts`, and redirects users to the hosted checkout.
5. **Webhook Security**: The webhook endpoint (`POST /api/payments/selcom/webhook`) implements best-effort signature verification (`verifyWebhookSignature`). Crucially, it doesn't blindly trust the webhook payload; it actively queries Selcom's `order-status` API (`verifyPayment`) to confirm the transaction status before settling the database.
6. **Payment Idempotency**: The webhook reconciliation logic correctly ensures that a `PAID` registration is never accidentally downgraded by delayed or duplicated webhooks (`if (payment.status === "PAID") return { alreadySettled: true }`).

---

## 🟡 What Needs to be Done to Make it Best

While the core is solid, a few finishing touches are required for a smooth production experience:

1. **Contact Form Email Notifications**
   - **Current State**: `POST /api/contact/route.ts` successfully saves enquiries to the database but contains a `// TODO(client): also send an email notification`.
   - **Action**: Integrate a transactional email provider (like Resend, SendGrid, or AWS SES) to alert the organizing team when a new message is received.
2. **Dynamic Currency Conversion**
   - **Current State**: The gateway converts USD to TZS using a utility `usdToCharge`. If this rate is hardcoded locally in `selcomConfig`, it poses a financial risk.
   - **Action**: Implement a live FX rate fetcher (cached daily or hourly) to ensure attendees pay the exact correct equivalent in TZS when the order is created.

---

## 🔴 CRITICAL Edge Cases & Bugs (Must Fix Before Production)

I discovered a few critical edge cases—particularly around payments—that will break the system if not resolved.

### 1. The Payment Retry Bug (Prisma 500 Error)
**The Issue:** In `prisma/schema.prisma`, `Payment.reference` has a `@unique` constraint. However, in `src/lib/payments.ts` (`initiatePayment`), the code attempts to create a new `Payment` using `reference: registration.reference` if an existing pending payment isn't found. 
**The Edge Case:** If a user abandons or fails a Selcom checkout, the payment status becomes `FAILED`. If the user clicks "Retry Payment", the system will not find a `PENDING` payment and will try to create a *new* Payment row using the **same** `registration.reference`. Prisma will throw a `UniqueConstraintViolation` error, and the retry will permanently fail.
**The Fix:** Ensure the `Payment.reference` is uniquely generated per *attempt* (e.g., `${registration.reference}-${Date.now()}`) so retries can generate new rows without colliding with the `FAILED` attempt's reference.

### 2. Orphaned "PENDING" Payments (Abandoned Checkouts)
**The Issue:** When a user is redirected to Selcom but simply closes the browser tab, Selcom never fires a `FAILED` webhook. The local database record remains stuck in `PENDING` indefinitely.
**The Edge Case:** If you rely on the DB status to free up limited inventory (e.g., a limited number of VIP passes or specific Exhibitor Booths), these abandoned carts will permanently lock up inventory.
**The Fix:** Implement a background Cron job (or utilize the `/api/payments/selcom/verify` route opportunistically via an admin dashboard) that finds `PENDING` payments older than 30-60 minutes, queries Selcom for their actual status, and marks them `CANCELLED` if they were abandoned.

### 3. Missing Webhook Transaction Uniqueness
While your idempotency checks are good, Prisma does not enforce uniqueness on `selcomTransId`. If Selcom's system glitches and issues the same `transid` across two different webhook payloads for some reason, the system might record it. Adding a `@unique` constraint to `selcomTransId` (where it isn't null) provides an extra layer of database-level protection against double-counting.

### 4. USSD Timeouts (Mobile Money)
Users paying via M-Pesa or Tigo Pesa must enter their PIN on their phone within a ~60-second window. If they miss the prompt, it times out. Selcom will eventually send a `FAILED` webhook. Because of the retry bug mentioned above, the user will be unable to generate a new USSD prompt unless the `Payment.reference` uniqueness issue is resolved first.
