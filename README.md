# ICAFoW 2026 — Conference Website

Production-ready website for the **International Conference on AI & the Future of Work
(ICAFoW 2026)** — 24–26 September 2026, JNICC, Dar es Salaam, Tanzania. Hosted by the
Africa Research Institute For AI (ARIFA).

A modern single-page marketing site plus a full registration + **Selcom** payment system,
invoicing, and an admin dashboard.

## Tech stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + custom design system (shadcn-style primitives)
- **Framer Motion** animations
- **React Hook Form** + **Zod** validation
- **Prisma 6** + **PostgreSQL**
- **NextAuth (Auth.js v5)** for the admin dashboard
- **Selcom** payment gateway (with a built-in mock mode for local dev)

## Features
- 15 marketing sections: Hero, About, Tracks, Important Dates, Speakers, Call for Papers,
  Registration, Sponsorship, Exhibition, Pitch Competition, Program, Venue, Partners, FAQ, Contact.
- 6 audience-specific registration flows: **Attendee/Author, Sponsor, Exhibitor, Partner,
  Speaker, Pitch Competition**.
- Full Selcom flow: initiate → hosted checkout → callback → webhook → verify → settle, with
  retry/failure recovery.
- Auto-generated **invoice** and **receipt** (printable / save-as-PDF).
- Admin dashboard: overview metrics, registrations, payments, papers, sponsors, exhibitors.
- SEO: metadata, Open Graph, Twitter cards, JSON-LD `Event` schema, `sitemap.xml`, `robots.txt`.

## Getting started

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Then edit `.env` — set `DATABASE_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`), admin
credentials, and the Selcom keys. Leave `SELCOM_MOCK="true"` to test payments without real keys.

### 3. Database
```bash
npm run db:migrate     # create tables
npm run db:seed        # create the admin user + sample data
```

### 4. Run
```bash
npm run dev            # http://localhost:3000
```

- Public site: `/`
- Registration: `/register/attendee` (and `/sponsor`, `/exhibitor`, `/partner`, `/speaker`, `/pitch`)
- Admin: `/admin` (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`)

## Selcom payments
Implementation lives in `src/lib/selcom/` (signing, client) and
`src/app/api/payments/selcom/*` (initiate, callback, webhook, verify).

- **Mock mode** (`SELCOM_MOCK=true` or blank keys): `/payment/[ref]` shows "Simulate Success /
  Failure" buttons so the full flow works without credentials.
- **Live mode**: set `SELCOM_BASE_URL`, `SELCOM_API_KEY`, `SELCOM_API_SECRET`, `SELCOM_VENDOR_ID`
  and `SELCOM_MOCK=false`. Confirm the exact order/field contract against your Selcom docs.

Register your **webhook** URL with Selcom as: `https://<your-domain>/api/payments/selcom/webhook`.

## Content
All copy and pricing is centralized in `src/lib/content/*` — edit there and it updates across the
site. See **`ASSUMPTIONS.md`** for the list of placeholder content (tracks, sponsor tiers,
speakers, CFP dates, contact details) to confirm before launch.

## Deploy
Optimized for **Vercel**:
1. Push to a Git repo and import into Vercel.
2. Add a PostgreSQL database (Vercel Postgres, Neon, Supabase, RDS, …).
3. Set all `.env` variables in the Vercel project settings.
4. Build command `npm run build` runs `prisma generate` automatically. Run `prisma migrate deploy`
   against the production database (e.g. as a release step).

## Scripts
| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run start` | Start the production server |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:seed` | Seed admin + sample data |
| `npm run db:studio` | Open Prisma Studio |

---
Generated with [Claude Code](https://claude.com/claude-code).
