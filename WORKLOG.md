# EKUZO Work Log

**Purpose:** This file keeps both Jamie's and Aaron's Claude instances aware of what's changed. Update this BEFORE every commit. Your Claude should read this at the start of every session.

**Format:** Most recent entry at the top. Include your name, date, and what changed.

---

## Jamie — March 30, 2026 (late night — validation + additional_info)

**What changed:**
- Added form validation for birthday, tshirtSize, gamerTag, and preferredGames on registration form (`app/ekuzo-camps/register/page.tsx`)
- Added 1500-character limit + live character counter on additional_info textarea
- Chunked additional_info across multiple Stripe metadata keys in `/api/camps/register` (up to 1500 chars split into 3×500-char keys)
- Added `additional_info` column to Google Sheets row data in webhook — reassembles chunked metadata before writing
- **Note for future:** Need a QA/monitoring cron job to track registration data integrity (Stripe metadata → Beehiiv fields → Google Sheets rows). Flag mismatches, missing fields, truncated data. Not built yet — add when operational volume justifies it.

**Apps Script update needed:**
- Google Apps Script needs `additional_info` added as column 21 in the sheet and in the `doPost` column mapping. Jamie to update manually.

---

## Jamie — March 30, 2026 (evening session — webhook + sheets + e2e)

**What changed:**
- Updated Stripe webhook (`app/api/webhooks/stripe/route.ts`) — now handles full post-payment data flow:
  - Beehiiv enrollment with all 13 custom fields
  - Tags applied via dedicated POST `/subscriptions/:id/tags` endpoint (create endpoint ignores tags)
  - Automation enrollment via `automation_ids` (array, not singular `automation_id`)
  - Multi-gamer aware: `gamer_name` comma-separated, `camp_week` stores earliest week for automation timing
  - Google Sheets write via Apps Script (one row per gamer, 20 columns incl. registration_id, family_id, birthday, skill_level, tshirt_size, preferred_games)
- Removed deprecated `export const config` (Pages Router pattern, not needed in App Router)
- Set up Google Cloud project (`ekuzo-web`), enabled Sheets API, created service account
  - Service account key creation blocked by Google Workspace org policy — pivoted to Apps Script approach
- Created Google Apps Script web app as Sheets write proxy (no service account needed)
- Added env vars: `STRIPE_WEBHOOK_SECRET`, `GOOGLE_SHEETS_WEBHOOK_URL`
- Installed Stripe CLI via Homebrew, authenticated
- End-to-end tested (3 test payments): Stripe → webhook → Beehiiv (fields + tags) + Google Sheets

**Beehiiv API learnings (important for future work):**
- Create subscription endpoint does NOT support `tags` — must use separate POST `/subscriptions/:id/tags` with `{ "tags": [...] }`
- Create subscription uses `automation_ids` (plural, array of strings), not `automation_id`
- PUT update endpoint silently ignores `tags` field — do not use for tagging
- Create endpoint silently ignores unknown fields (no error, just drops them)

**Architecture decisions:**
- Google Sheets via Apps Script (not googleapis npm + service account) — simpler, no credentials to manage
- Multi-gamer Beehiiv: comma-separated gamer names, earliest camp week for automation timing. Per-gamer emails (different coaches/timing) deferred to v2 via transactional email layer (Resend/SendGrid)
- Google Sheets has one row per gamer with registration_id + family_id for ops/fulfillment

**What's next:**
- Clean up test subscribers in Beehiiv (jamiefosu+1, +2, +3)
- Backfill tags on +1 and +2 subscribers (tags endpoint only worked on +3)
- `/camps/success` page needs building (confirmation with booking summary)
- ContactModal: replace Make.com webhook with `/api/contact` route
- Production deploy: Netlify, production Stripe webhook endpoint, production env vars

---

## Jamie — March 30, 2026

**What changed:**
- Configured Beehiiv for camp registration data flow
  - 13 custom fields created and verified (first_name, last_name, phone, program, gamer_name, camp_week, camp_slot, gamer_count, registration_summary, payment_intent_id, amount_paid, timezone, location)
  - 9 tags created (camp-2026-purchased, source-camp-registration, source-newsletter, source-contact-form, no-promo, vip, camp-2026-completed, ekuzo100-purchased, teams-purchased)
  - Camp Purchase Welcome Sequence automation scaffolded (draft, placeholder content)
- Created `docs/beehiiv-config.md` — portable reference doc for Beehiiv field config, tags, webhook payload spec
- Reviewed Beehiiv reserved fields to avoid naming collisions
- Decided on Google Sheets API as ops/fulfillment layer (replaces earlier Airtable discussion)
- Confirmed Make.com is being retired — no new integrations should use it

**What's in progress (Jamie's lane — orchestration):**
- Stripe webhook needs code update: add source tag, gamer_name/camp_week/camp_slot fields, automation_id
- Google Sheets API integration for fulfillment data (one row per gamer)
- End-to-end test: form → Stripe → webhook → Beehiiv + Google Sheet
- Welcome automation email content (draft in Beehiiv, needs real copy before publishing)

**Decisions made this session:**
- Beehiiv custom field names match webhook snake_case convention (not Beehiiv presets)
- phone field is TEXT not NUMBER (to support formatted numbers)
- gamer_name, camp_week, camp_slot kept as separate fields for automation triggers (not just in registration_summary blob)
- Make.com is being retired — ContactModal still uses it but should be replaced with /api/contact route
- Google Sheets API (direct) replaces Make.com for fulfillment data flow

---

## Jamie — March 27, 2026

**What changed:**
- Added `StickyCTA` component — fixed-bottom bar with "Enroll my gamer" + "Start a conversation" buttons, wired to modal system. Shows after 300px scroll, hides when modal is open. Mounted in root layout.
- Rewrote `EcosystemAnimation.tsx` — replaced broken delta-based scroll with container-relative scroll progress. Added debug overlay (currently off). Still needs PROGRESS_MAX calibration to match Framer pacing.
- Fixed `overflow-hidden` → `overflow-clip` on all 8 pages with the 360vh ecosystem section (overflow-hidden was breaking sticky positioning).
- Set up GitHub repo, transferred to EKuzo-gg org.
- Created AARON-START-HERE.md, SETUP.md, WORKLOG.md.

**What's in progress (Jamie's lane — orchestration):**
- Stripe + Beehiiv integration for camps registration (API routes not yet built)
- `.env.local` has Stripe keys but Price IDs not yet configured

**Known issues:**
- Ecosystem animation PROGRESS_MAX needs calibration (set to 200, should be ~300-400)
- Homepage needs visual QA against live Framer site
- Social icons in Footer are text placeholders, not real SVGs
