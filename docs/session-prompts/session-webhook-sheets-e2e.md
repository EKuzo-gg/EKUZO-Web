# Next Session: Webhook Updates + Google Sheets + E2E Test

## Context

Beehiiv is fully configured (13 custom fields, 9 tags, welcome automation in draft). The Stripe webhook exists and works for basic Beehiiv enrollment, but needs updates to match the finalized config. Google Sheets was decided as the fulfillment ops layer. This session wires everything together and tests it.

Read these files before doing anything else:

1. `CLAUDE.md` — full project context (Commerce Architecture section updated 3/30)
2. `CAMPS-CLAUDE.md` — camps workstream context (current state, not-yet-built table)
3. `docs/beehiiv-config.md` — Beehiiv field/tag config, exact webhook payload spec, automation ID
4. `app/api/webhooks/stripe/route.ts` — current webhook code (needs updates)
5. `app/api/camps/register/route.ts` — registration API route (creates Payment Intent)
6. `app/ekuzo-camps/register/page.tsx` — registration form (for understanding the data flow)
7. `WORKLOG.md` — latest entry (March 30) for session continuity

---

## What to Build

### 1. Update Stripe Webhook (`app/api/webhooks/stripe/route.ts`)

The Beehiiv payload needs these additions:

**Tags:** Add `source-camp-registration` to the tags array (currently only sends `camp-2026-purchased`)

**Custom fields to add:**
- `gamer_name` — first gamer's first name (for email personalization)
- `camp_week` — first gamer's week number (as string)
- `camp_slot` — first gamer's slot ("AM" or "PM")

**Automation ID:** Add to the Beehiiv API payload:
```json
"automation_id": "aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"
```

The exact target payload shape is documented in `docs/beehiiv-config.md` under "Webhook → Beehiiv Payload".

For multi-gamer registrations: `gamer_name`, `camp_week`, and `camp_slot` store the FIRST gamer's values. All gamers are captured in `registration_summary`.

### 2. Add Google Sheets Integration to Webhook

On `payment_intent.succeeded`, write one row PER GAMER (not per parent) to a Google Sheet.

**Columns:**
parent_first_name, parent_last_name, parent_email, parent_phone, gamer_name, gamer_tag, week, slot, timezone, location, amount_paid, stripe_pi_id, registration_date

**Implementation:**
- Use Google Sheets API directly (googleapis npm package)
- Google service account credentials stored in `.env.local`
- Sheet ID stored in `.env.local` as `GOOGLE_SHEET_ID`
- Service account JSON stored as `GOOGLE_SERVICE_ACCOUNT_KEY` (stringified JSON in env var)

**Before coding:** Ask Jamie if the Google service account and sheet are set up. If not, walk through creating them step by step (Google Cloud Console → create project → enable Sheets API → create service account → download JSON key → share the sheet with the service account email).

### 3. End-to-End Test

Test the full flow using Stripe CLI for local webhook testing:

1. Start dev server (`node node_modules/.bin/next dev -p 3001` on Jamie's Mac)
2. Install/run Stripe CLI: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`
3. Fill out registration form on localhost:3001/ekuzo-camps/register
4. Submit payment with Stripe test card (4242 4242 4242 4242)
5. Verify:
   - Stripe dashboard shows payment with correct metadata
   - Beehiiv shows new subscriber with all 13 custom fields populated
   - Beehiiv subscriber has both tags (`camp-2026-purchased`, `source-camp-registration`)
   - Google Sheet has one row per gamer with correct data
6. Test multi-gamer: register with 2 gamers, verify 2 Google Sheet rows but 1 Beehiiv subscriber

### 4. Set Webhook Secret

After testing with Stripe CLI:
- Copy the webhook signing secret from Stripe CLI output
- Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- For production: create webhook endpoint in Stripe Dashboard → Developers → Webhooks pointing to the deployed URL

---

## Environment Variables Needed

Check `.env.local` — these should already exist:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_CAMPS=price_1TFNJWKORcR8BUEx5UgXzpL9
BEEHIIV_API_KEY=...
BEEHIIV_PUBLICATION_ID=pub_b436ced6-32a1-4bee-b52b-9bf99ddd8287
```

These need to be added:
```
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe CLI during testing)
GOOGLE_SHEET_ID=... (the spreadsheet ID from the Google Sheet URL)
GOOGLE_SERVICE_ACCOUNT_KEY=... (stringified JSON of service account credentials)
```

---

## NPM Packages Needed

- `googleapis` — for Google Sheets API (check if already installed)
- `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js` — should already be installed

---

## Key Decisions Already Made

- Google Sheets API direct from webhook (NOT Make.com)
- One Google Sheet row per gamer, not per parent
- Make.com is being retired — do not build new integrations on it
- Beehiiv welcome automation is in DRAFT — do not publish until email content is written
- `gamer_name`/`camp_week`/`camp_slot` store first gamer's values for Beehiiv (all gamers in `registration_summary`)

---

## After This Session

- `/camps/success` page needs building (confirmation with booking summary)
- Welcome automation email content needs writing (coordinate in `/ekuzo-camps/` project)
- ContactModal Make.com webhook should be replaced with `/api/contact` route
- Production deploy: Netlify setup, production Stripe webhook endpoint, production env vars
