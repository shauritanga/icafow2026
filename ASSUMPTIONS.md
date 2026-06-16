# Content Assumptions & Placeholders — ICAFoW 2026

This build was generated from the source pack (`ICAFoW 2026_Web Contents.docx`/`.pdf`
and the supplied PNG artwork). Where the source did **not** specify content, we used
clearly-marked, professional placeholders. **Review and replace these before launch.**

All editable content lives in `src/lib/content/*` — change it there and it updates
everywhere on the site.

## Verbatim from the source (do not need changing)
- **Event**: ICAFoW 2026, 24–26 September 2026, JNICC, Dar es Salaam, Tanzania. Host: ARIFA.
- **Stats**: 100+ speakers, 50+ corporate partners, 10 tracks, 1000+ attendees, 50+ exhibitors.
- **Passes** (`src/lib/content/passes.ts`): Delegate $200, Researcher $300 (Most Popular, incl.
  IJAIT publication), VIP Business $400, VVIP Executive $700, Safari Experience $450. Benefits
  transcribed from the pass artwork.
- **Booths** (`src/lib/content/booths.ts`): Innovation 3×3m — $1,500 / TZS 4,000,000;
  Leadership 3×6m — $2,300 / TZS 6,000,000. Features verbatim.
- **Pitch competition timeline** (`src/lib/content/dates.ts` → `pitchTimeline`): verbatim.
- **About / objectives / outcomes** (`src/lib/content/about.ts`): verbatim.
- **Contact address**: Brown Close, Old Bagamoyo Road, Dar es Salaam (per the doc's update note).

## Invented placeholders — REVIEW BEFORE LAUNCH
| Item | File | Note |
|---|---|---|
| **10 track names & descriptions** | `tracks.ts` | Source says "10 Tracks" but doesn't name them. Themed around AI & future of work. |
| **Sponsorship tiers & prices** | `sponsors.ts` | Strategic / Platinum $30k / Gold $18k / Silver $9k / Bronze $4.5k. Source describes "tailored" sponsorship only. Confirm tiers + prices. |
| **Call-for-papers deadlines** | `dates.ts` → `importantDates` | CFP open/abstract/acceptance/camera-ready dates are reasonable defaults; the source gives none. |
| **Speakers** | `speakers.ts` | All entries are "TBA" placeholders (no real people). Add confirmed speakers + photos (drop images in `public/assets`). |
| **Program / agenda** | `program.ts` | High-level 3-day structure inferred from objectives + event tour. Replace with the real agenda. |
| **Partners list** | `partners.ts` | Logo placeholders only — the source lists none. |
| **FAQs** | `faqs.ts` | Written from the source facts; review wording (esp. visa letter policy). |
| **Contact email / phone** | `site.ts` → `contact` | `info@icafow.org` / `+255 700 000 000` are placeholders. Set the real ones. |
| **Social media URLs** | `site.ts` → `socials` | Placeholder handles. |

## Technical assumptions
- **Payment gateway**: the booth mockup shows an "ARIFA Payment Gateway" with Visa/Mastercard,
  Tigo Pesa and M-Pesa. Per the brief this is implemented as **Selcom**.
- **Currency**: prices are displayed in **USD** (booths also show TZS, as in the source). Selcom
  settles in **TZS**, so the charged amount is converted using `USD_TO_TZS_RATE` (default 2600).
  Set the real rate (or wire a live FX source) in `.env`. The UI display rate is
  `NEXT_PUBLIC_USD_TO_TZS` — keep the two in sync.
- **Partner / Speaker / Pitch** flows are submission-only (no payment). Attendee, Sponsor and
  Exhibitor flows go through Selcom (Sponsor "Strategic" tier is by-negotiation → no instant pay).
- **Selcom contract**: the signing + create-order/order-status calls follow Selcom's documented
  HMAC algorithm. Confirm exact endpoint field names against your current Selcom integration docs
  in `src/lib/selcom/` before going live. A built-in **mock mode** (`SELCOM_MOCK=true`, or blank
  keys) lets the whole flow run without credentials.
