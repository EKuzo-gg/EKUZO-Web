# Next Session: Stripe + Beehiiv Integration for Camp Registration

## Context
The `/camps/register` page is fully built — 10-week grid with AM/PM slots, multi-gamer support, parent info, gamer info, and a registration summary panel. The form currently posts to a Make.com webhook as a placeholder. This session replaces that with direct Stripe + Beehiiv integration via Next.js API routes.

Read `CLAUDE.md` for full project context, especially the "Commerce Architecture" and "Learning Log" sections which were updated at the end of the previous session.

## What to Build

### 1. `/api/camps/register` (POST)
- Receives the full registration payload (parent info, gamers array with week/slot selections, additional info)
- Creates a Stripe Payment Intent with:
  - `amount`: total price in cents (sum of all gamers' week prices)
  - `metadata`: parent name, email, phone, each gamer's name/week/slot/gamerTag (flatten for Stripe's 500-char metadata limit per key)
- Returns `{ clientSecret }` to the frontend

### 2. Stripe Elements on `/camps/register`
- After form validation passes, show a payment step (either inline expansion or slide transition — discuss with user)
- Load `@stripe/react-stripe-js` and `@stripe/stripe-js`
- Render `<PaymentElement>` or `<CardElement>` within an `<Elements>` provider
- On `confirmPayment` success, redirect to `/camps/success`

### 3. `/api/webhooks/stripe` (POST)
- Verify Stripe webhook signature (`stripe-signature` header)
- Handle `payment_intent.succeeded` event
- Extract registration metadata from the Payment Intent
- Call Beehiiv API to create subscriber:
  - Email: parent email from metadata
  - Custom fields: gamer name, week, slot, program ("EKUZO Camps")
- Return 200

### 4. `/camps/success` page
- Read confirmation data from URL search params or Stripe's `payment_intent` query param
- Display: "LEVEL UP!" heading, booking summary (gamer name, week, slot, session time), payment status, total
- Next steps: check inbox, download game
- Link back to home

## Environment Variables Needed
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BEEHIIV_API_KEY=...
BEEHIIV_PUBLICATION_ID=...
```

## Key Decisions Already Made
- No Make.com in the payment flow (Next.js API routes handle everything)
- No Discord notifications
- No Airtable — Stripe dashboard + Beehiiv is sufficient for v1
- Beehiiv is the full email marketing platform (not just newsletter) — post-registration automations are handled in Beehiiv's UI
- All weeks are $199 early bird pricing at launch (will be manually updated in code later)
- Urgency badges on slots are marketing-only, not capacity-driven

## Files to Touch
- `app/camps/register/page.tsx` — add Stripe Elements payment step after form
- `app/api/camps/register/route.ts` — NEW: create Payment Intent
- `app/api/webhooks/stripe/route.ts` — NEW: handle payment success → Beehiiv
- `app/camps/success/page.tsx` — NEW or update existing `/success` page
- `package.json` — add `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`
- `.env.local` — add Stripe + Beehiiv keys

## Stripe Setup (DONE)
- **Production:** Product "ekuzocamps" exists with $299 standard price + $199 early bird price (lookup key: `ekuzocamps-earlybird-199`, description: "EKUZO Camps — Early Bird Pricing")
- **Test mode:** Matching product + price created with same specs. Test price ID copied.
- **Keys ready:** User has `pk_test_...` and `sk_test_...` saved. Production keys saved separately.
- **Webhook secret:** NOT yet created — needs to be set up after `/api/webhooks/stripe` is deployed. Create in Stripe Dashboard → Developers → Webhooks → Add endpoint → listen for `payment_intent.succeeded`.
- **Stripe account ID:** `acct_1Lfq2aKORcR8BUEx`

## Before Starting
1. Ask user to paste their Stripe test keys + test price ID so you can populate `.env.local`
2. Ask user: "Do you have a Beehiiv account yet? We need your API key and publication ID."
3. Ask user: "For the payment step — do you want it inline on the same page (expand below the form) or as a separate checkout page at `/camps/checkout`?"
