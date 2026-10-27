# Season 01 commit: frozen spec, slice 1 (contract)

Status: DRAFT until the money red team and the challenger report; then frozen. Later changes go
through `03-decision-log.md` as spec changes. Public repo: no secrets, no family data.

## Files and owners

| Area | Files | Owner |
|---|---|---|
| Offer config, pricing, windows, codes, ages, validation | `lib/season1/offer.ts`, `lib/season1/pricing.ts`, `lib/season1/codes.ts`, `lib/season1/validate.ts`, `lib/season1/__tests__/*.test.ts` | Chronos |
| DB client, migrations, queries, fulfil, rate limit, mode, webhook, commit API, legacy guard | `db/migrations/*.sql`, `scripts/s1-migrate.mjs`, `lib/season1/db.ts`, `lib/season1/fulfil.ts`, `lib/season1/mode.ts`, `lib/season1/ratelimit.ts`, `app/api/season1/**`, guard lines in `app/api/webhooks/stripe/route.ts` | Relay |
| Pages: signup, welcome, terms, Karlin redirect | `app/season1/join/signup/*`, `app/season1/join/welcome/*`, `app/season1/terms/*`, `/karlin` in `next.config.mjs` redirects | Atlas |
| Test runner | `scripts/test-resolve.mjs`, `package.json` scripts | Chronos |

Agents never commit. The lead commits by path.

## Offer config (`lib/season1/offer.ts`)

```ts
export const OFFER = {
  id: "s1-commit", version: "s1-commit-v1", currency: "usd",
  firstKidCents: 10000, siblingCents: 8000,
  monthlyCents: 16000, siblingMonthlyCents: 12800,
  seasonCents: 58000, siblingSeasonCents: 46400,
  friendCreditCents: 16000, maxKidsPerOrder: 4,
  ageMin: 9, ageMax: 18, ageCopyMin: 10, ageCopyMax: 17,
  openAt: "2026-10-26T00:00:00-05:00",
  jerseyCutoffAt: "2026-11-30T23:59:59-08:00",
  lockInAt: "2026-12-31T23:59:59-08:00",
  closeAt: "2026-12-31T23:59:59-08:00",
  textKarlinSms: "<current number from the existing season1 pages>",
  termsVersion: "s1-terms-2026-10-27-draft",
} as const;
```
Every window is an ISO instant with an explicit offset. Pure helpers take `now: Date` (injected).

## Pricing (`lib/season1/pricing.ts`)

`quote({ kids: {firstName, age}[], priorPaidKids: number }) -> { lines: {kidIndex, role: "first"|"sibling", unitCents}[], totalCents }`.
First kid of the family is $100 unless `priorPaidKids > 0`, then every kid is $80. 1 to 4 kids.
The client never sends an amount; if it does, it is ignored.

## Codes (`lib/season1/codes.ts`)

`mintNumeric(rand) -> string` (7 random digits plus Damm check digit, 8 chars, first digit 1 to 9);
`isValidNumeric(s)`; `normalize(input) -> string|null` (strip spaces and hyphens; digits must pass
Damm; vanity `^[a-z]{3,20}$` lowercased); `display(code) -> "4827 1937"` for numeric, vanity as is.

## Validation (`lib/season1/validate.ts`)

Names: letters (Unicode), spaces, hyphens, apostrophes, 1 to 20 chars, trimmed. Email: simple
RFC-ish check, lowercased, max 254. Phone optional, digits and `+()- ` max 20. Age integer 9 to 18;
the client may send `"outside"`, which the server rejects with 422 `age_outside`. `ageEdge(age)` is
true at 9 or 18. Consent must be `true`. Honeypot field `company` must be empty.

## Mode (`lib/season1/mode.ts`)

`S1_COMMIT_MODE` = `off` | `test` | `live`. Unset: `test` if `STRIPE_SECRET_KEY` starts `sk_test_`,
else `off`. `live` is honoured only when the request host is `ekuzo.gg` or `www.ekuzo.gg` and the key
starts `sk_live_`; otherwise it fails closed to `off`. In `test` the key must start `sk_test_` and
`DATABASE_URL` must contain `ep-lively-boat-b4fak1h6`, else `off`. Off: commit API 409
`{error:"closed"}`, pages show the closed state.

## Database (Neon test branch; plain SQL; `@neondatabase/serverless` HTTP driver)

Migrations `db/migrations/0001_season1.sql`, applied by `node scripts/s1-migrate.mjs` (records names
in `s1_migrations`; splits statements safely; refuses non-test hosts unless `--live`). Tables (all
with `created_at timestamptz default now()`, `livemode boolean not null`):

- `s1_families` (id uuid pk, public_id text unique, stripe_customer_id text, billing_zip text, geo jsonb, attribution jsonb, flags text[] default '{}')
- `s1_guardians` (id uuid pk, family_id fk, email text not null, first_name text, phone text, text_consent_at timestamptz, unique(email, livemode))
- `s1_kids` (id uuid pk, family_id fk, first_name text, first_name_key text (folded), age int, age_given_at timestamptz, status text default 'pending')
- `s1_orders` (id uuid pk, public_id text unique, family_id fk, payer_email text, offer_id, offer_version, status text check in ('pending','paid','failed','refunded','partially_refunded','canceled'), amount_cents int, payment_intent_id text unique, payment_method_id text, consent_version text, consent_at, consent_ip, consent_ua, jersey_eligible boolean, pi_created_at timestamptz, paid_at timestamptz, referral_code text, src text, flags text[] default '{}')
- `s1_order_items` (order_id fk, kid_id fk, role text, unit_cents int, primary key(order_id, kid_id))
- `s1_codes` (code text pk, family_id fk, type text default 'family' check in ('family','vanity','partner'), target_code text null, status text default 'active')
- `s1_referrals` (id uuid pk, code text, inviter_family_id, referred_order_id unique, friend_kids int, status text default 'pending', reasons text[]) — slice 2 uses it; created now.
- `s1_events` (id bigserial pk, at timestamptz default now(), source text, type text, subject text, stripe_event_id text unique, data jsonb)
- `s1_outbox` (id bigserial pk, kind text, dedupe_key text unique, payload jsonb, status text default 'pending', attempts int default 0, last_error text, updated_at timestamptz)
- `s1_rate_limits` (key text, window_start timestamptz, count int, primary key(key, window_start))

`public_id` values: 10 chars from `nanoid` custom alphabet (no lookalikes). Folded first-name key:
lowercase, NFD, strip diacritics.

## Commit API: `POST /api/season1/commit`

Request JSON: `{ email, parentFirstName, phone?, kids: [{firstName, age}], consent: true, company: "",
src?, code? }` (code ignored in slice 1). Steps: mode check; window check (`openAt <= now <
closeAt`); honeypot; validate; rate limit 5 per IP per 10 min (key `pi:<ip>`) and 20 per email per
day; compute quote server side (`priorPaidKids` = paid, unrefunded kids on this email); upsert
family/guardian (by email + livemode), insert kids, insert order `pending` with consent fields
(`consent_ip` from `x-nf-client-connection-ip` or `x-forwarded-for`, UA), items; find or create the
Stripe Customer by email (search by email, reuse newest); create the PaymentIntent:
`amount`, `currency: usd`, `customer`, `setup_future_usage: "off_session"`,
`automatic_payment_methods: {enabled: true}`, `metadata: {product: "season1", order_id: <public_id>,
offer_version, livemode}`, `receipt_email: email`, idempotency key `s1-commit:<order public_id>`.
Store `payment_intent_id`, `pi_created_at`, `jersey_eligible` = created before `jerseyCutoffAt`.
Set cookie `s1_order=<public_id>` (HttpOnly, Secure, SameSite=Lax, Path=/season1, 30 days).
Response 200 `{ clientSecret, orderId, amountCents }`. Errors: 409 `closed`, 422 `{field, error}`,
429 `rate_limited`, 500 generic (never echo internals). Nothing waits on side effects.

Stripe.js on the page: deferred intent, `elements({mode:"payment", amount, currency:"usd",
setupFutureUsage:"off_session", appearance})`; Express Checkout Element above the Payment Element
(hide wallets block when `ready` reports none; nothing async in `click` before `resolve`, pass
`applePay.recurringPaymentRequest` with the terms URL); on submit: `elements.submit()`, POST commit,
then `stripe.confirmPayment({elements, clientSecret, confirmParams: {return_url: origin +
"/season1/join/welcome"}})`. `return_url` uses `window.location.origin`. Button locks on first tap.

## Fulfil (`lib/season1/fulfil.ts`)

`fulfil(paymentIntentId, source: "webhook"|"welcome") -> {orderPublicId, claimed: boolean}`.
Retrieve the PaymentIntent from Stripe; require `metadata.product === "season1"` and
`status === "succeeded"`. Claim with one statement: `UPDATE s1_orders SET status='paid', paid_at=now(),
payment_method_id=$pm WHERE payment_intent_id=$pi AND status='pending' RETURNING ...`. If claimed:
mint a family code if the family has none (retry on unique conflict), set kids `status='committed'`,
billing ZIP from the payment method, insert `s1_events` row, insert outbox rows (`klaviyo_committed`,
`meta_purchase`, `discord_commit`) with dedupe keys `<kind>:<order public_id>` ON CONFLICT DO NOTHING.
Not claimed: no-op. Never sends anything inline in slice 1.

## Webhook: `POST /api/season1/stripe-webhook`

Raw body; 500 if `S1_STRIPE_WEBHOOK_SECRET` is missing; 400 on bad signature. Insert
`s1_events.stripe_event_id` ON CONFLICT DO NOTHING; duplicate returns 200. Handle
`payment_intent.succeeded` (season1 only) via `fulfil`; `payment_intent.payment_failed` (season1
only): record event, order stays pending (retry allowed); `charge.refunded`, `refund.failed`,
`charge.dispute.created`, `charge.dispute.closed`: record the event row only in slice 1 (handlers in
slice 5). DB failure returns 500 so Stripe retries. Responds in under 2 s.

## Welcome: `GET /season1/join/welcome`

`force-dynamic`, `Cache-Control: private, no-store`. If query has `payment_intent`: verify it
belongs to the order in the `s1_order` cookie, run `fulfil(pi, "welcome")` if succeeded, then 303 to
`/season1/join/welcome` with no query. Without query: load order by cookie; paid: render Aaron's
saved page with kid first name(s), share link `<origin>/crew/<code digits>` and display code, receipt
summary (amount paid per kid, refund until `lockInAt` date); pending or failed: "We're confirming your
payment" with a reload link and Text Karlin; no cookie or unknown: generic page with Text Karlin.
All injected values HTML-escaped. Sets `ekuzo_s1_joined=1` cookie (not HttpOnly, 1 year, Path=/).

## Signup page: `GET /season1/join/signup`

Aaron's `app/season1/early-access/signup/signup.html` adapted (relationship: adapt, see PM scope
section 4). `force-dynamic`; HTML read from a file beside the handler (literal path, never
`public/`); server injects a JSON config block (publishable key, mode, offer prices, windows,
`textKarlinSms`, terms URL, src from query, closed state) escaped for `<script type="application/json">`.
Plan picker and pay-in-full removed; mock card fields replaced by Stripe elements in the same slot;
"Your first name" field; optional mobile with `autocomplete="off"`; consent checkbox with C16 text and
a link to `/season1/terms`; inline errors in an `aria-live` region; "Test mode" bar in test; no Meta
pixel; noindex. Kid rows and the sibling control stay; ages offered 9 to 18 plus "Younger or older"
(hides payment, shows Text Karlin). Closed state from mode and window.

## Tests (slice 1)

`npm test` = `node --test --import ./scripts/test-resolve.mjs` over explicit globs
(`lib/**/__tests__/*.test.ts`), skipping the known failure at `lib/__tests__/ekuzo101-weeks.test.ts:154`
with a reason. Units: pricing (1 to 4 kids, prior paid kids), Damm check digit and typo rejection,
normalize, windows at boundaries under `TZ=UTC` and `TZ=America/Los_Angeles`, validation and ages,
mode resolution, legacy guard predicate. Integration (Neon test): fulfil idempotency (webhook and
welcome concurrently: one claim, one outbox set), webhook signature and duplicate event. E2E: real
test PaymentIntents confirmed server side with `pm_card_visa`, `pm_card_chargeDeclined`, 3DS card,
and off-session charges with 4000002500003155 and 4000002760003184 on the saved method; Playwright
card run on the branch deploy at 375 px.

## Red team resolutions (money and fraud, 22:10 CT). These override the sections above.

Status after this section: FROZEN for slice 1. Source: `redteam-money.md` (20 findings). Challenger
items adopted: D1, D3, D4, D5 in `03-decision-log.md`.

| RT# | Resolution |
|---|---|
| 1 | `s1_events` gets `processed_at timestamptz`. The webhook inserts the event row if absent; a duplicate is "done" only when `processed_at` is set; otherwise process again. `processed_at` is set after fulfil (or the handler) succeeds. Test: fulfil fails once, replay, one paid order. |
| 2 | Already adopted (D4): claim, idempotent steps, `fulfilled_at`; a paid order with null `fulfilled_at` reruns the steps. |
| 3 | Client sends `attemptId` (UUID in sessionStorage, new per page load) and `expectedCents`. `s1_orders.attempt_id` (unique with payer_email). Same email+attempt with a pending order and an unchanged kid set and amount: return the existing `clientSecret` (no new PI). Changed: cancel the old PI (ignore errors), mark that order `canceled`, create a new order and PI. Idempotency key `s1-pi:<order public_id>` stays. After a decline the client re-confirms the same `clientSecret` without a new POST. |
| 4 | IP only from `x-nf-client-connection-ip` (IPv6 bucketed to /64; missing header = bucket `noip`). Limits: 5 PIs per IP per 10 min, 20 per email per day, 60 PIs per hour globally. `payment_intent.payment_failed` increments `s1_orders.failure_count`; at 3 the PI is canceled and the order flagged `card_testing_suspect`. Radar card-testing rules go on Jamie's launch list. |
| 5 | `expectedCents` mismatch with the server quote: 409 `{error:"price_changed", amountCents}` before any PI; client `elements.update({amount})` and asks for a second tap. |
| 6 | One Season 01 Stripe Customer per `s1_families` row: create with idempotency key `s1-cust:<family id>`, metadata `product=season1`, store `stripe_customer_id`, reuse only that. No Stripe search, no reuse of legacy Customers. Lock-in will charge each order's `payment_method_id`. |
| 7 | Existing guardian rows are never overwritten by `/commit`: submitted parent name and phone go on the order (`payer_first_name`, `payer_phone`). Card-fingerprint flags arrive with slice 2's fraud flags. |
| 8 | `jersey_eligible` computed in fulfil: `pi_created_at < jerseyCutoffAt AND paid_at - pi_created_at <= 24h`. Flag `late_confirm` when `paid_at >= closeAt`. Stale pending PI cancellation: slice 5. |
| 9 | Server `payment_method_types: ["card","link"]` (wallets ride on card); client `paymentMethodTypes: ["card","link"]`. Fulfil treats `processing` as pending. |
| 10 | Mode gates PaymentIntent creation and the signup page only. Webhook and welcome fulfil always run; they skip (200, nothing written) when `event.livemode`/`pi.livemode` disagrees with the key prefix. |
| 11 | `s1_orders.view_token_hash` (sha256 of 32 random bytes, base64url). Cookie `s1_order` carries the raw token; the welcome page looks orders up by its hash. The public id is a reference only. |
| 12 | Welcome with `payment_intent` and `payment_intent_client_secret`: retrieve the PI; if the secret matches, run fulfil, set a fresh view token cookie for that order, then 303. Cookie path only without query. |
| 13 | `charge.refunded` in slice 1: full refund sets the order `refunded` (kids `refunded`); partial sets `partially_refunded`. Fulfil retrieves the PI with `expand: ["latest_charge"]`; if anything is refunded, claim as `refunded` with no code and no outbox. `priorPaidKids` counts kids on `paid` or `partially_refunded` orders whose kid status is not `refunded`. |
| 14 | Legacy guard also skips when `meta.product` is set and not one of `camps`, `ekuzo100`, `ekuzo101`, `teams`. Missing product with `parent_email` keeps today's camps behaviour. |
| 15 | Fulfil flags `duplicate_kid` when the same folded first name is on another paid, unrefunded order of the family within 30 days. Commit-time P6 lands in slice 2. |
| 16 | Fulfil requires `pi.amount === order.amount_cents`, `currency === "usd"`, `metadata.order_id === order.public_id`, `pi.livemode === order.livemode`; mismatch: record, flag `pi_mismatch`, claim nothing. |
| 17 | Live mode requires `sk_live_` and `pk_live_`, a DB URL without the test endpoint, `S1_STRIPE_WEBHOOK_SECRET` set, `CONTEXT === "production"`, and the raw `host` header ekuzo.gg or www.ekuzo.gg. Any miss: off. |
| 18 | Charge, refund and dispute events: retrieve the PI and record only when `metadata.product === "season1"`; else 200 with nothing written. |
| 19 | Express Checkout deferred (D1). Slice 4 spec covers the `confirm` sequence and `recurringPaymentRequest` from the server quote. Fulfil records `payment_method.type`, wallet type and fingerprint in the order `pm_details` jsonb. |
| 20 | `consent_ip` only from `x-nf-client-connection-ip`; raw `x-forwarded-for` stored in `consent_xff`. |
