# Scout map (2026-10-26 22:10 CT, origin/dev 57aa70b)

Saved by the lead from Scout's reply (Scout had no write tool). Paths relative to repo root.

## Surprises
1. No Neon driver, no `db/`, nothing named season1 commit, crew code or referral in server code.
2. Legacy webhook has no guard: `app/api/webhooks/stripe/route.ts:55` `const product = meta.product || "camps"`; `lib/products/index.ts:35-42` maps anything unknown (incl. "season1") to camps. Guard goes after line 54, inside the `payment_intent.succeeded` branch:
   `if (meta.product === "season1" || !meta.parent_email) return NextResponse.json({ received: true, skipped: "not_registration" });`
3. Teams installment invoices (since 2026-10-01) create PIs with empty metadata; today they run as camps with `parent_email` undefined. The guard changes that (for the better).
4. Future off-session charges (Feb 15) must carry `metadata.product="season1"` or the legacy handler mishandles them. December note.
5. `next.config.mjs` wins over `next.config.ts` (stub). Redirects go in `.mjs` (17 rules, `headers()` returns []).
6. Prototype pages are unwired: `signup.html` has fake card inputs, no fetch; prices and dates hardcoded in HTML and JS.
7. Kid names in URLs (`?from=`, `?kid=`), sanitised client side only.
8. Stripe API version `2026-02-25.clover`, SDK 20.4.1. No idempotency keys anywhere.
9. Legacy webhook with `STRIPE_WEBHOOK_SECRET` unset skips verification and `JSON.parse`s any body (lines 31-49).
10. Popup suppression is localStorage `ekuzo_s1_joined` = "1" (`components/ui/SeasonOnePopup.tsx:128`), dismiss key `ekuzo_s1_dismissed_at` (7-day snooze). Nothing sets joined after a paid signup or on `/season1` landing. That is the "popup fix" (see `docs/s1-popup-attribution/auditor-phase1.md:67`).

## Season1 pages (`app/season1/**`)
- Every `route.ts` is `force-static`, `fs.readFileSync(path.join(process.cwd(),"app","season1",...))`, `text/html`. All noindex, outside `app/layout.tsx`.
- `landing.html` (`/season1`): Meta pixel 1284038230557204, Clarity, GA4 G-8LM45PX53W; posts `/api/season-one`; honeypot `ekz_hp`; writes `ekuzo_attribution` (session) and `ekuzo_s1_attribution` (local).
- `early-access.html` (134 lines): GA4 only; dev banner line 89; hardcoded $100/$160 (97), schedule (98), $522 pay-up-front (99), refundable until Jan 1 2027 and first 100 jerseys (100), ladder $420/$260/$100 (109), timeline (113-118), ages 10-18; CTAs to `/season1/early-access/signup`.
- `signup/signup.html` (161 lines): form `#f` (91); mock Apple Pay div and plain card inputs (106-116); optional mobile `#mob`; terms `#terms`; kid rows by JS (124) `.nm` name, `.ag` age 10-18 plus "x" (younger or older shows `#oops`, line 100); max 4 kids (127); pricing JS (133); plan radios; `?from=` banner (121); submit (150-156) only fires GA and redirects to saved `?kid=`.
- `saved/saved.html` (133 lines): `?kid=` (46), share link `/season1/crew?from=` (48), `navigator.share` or clipboard, GA `season1_ea_share_tap`, chips UI only, sms (42).
- `crew/crew.html` (149 lines): `?from=` (71), join links to signup `?from=` (73); hardcoded prices and dates.
- `thanks.html`: Day-0 email landing, `?play=`.
- SMS everywhere: `sms:+18324438679`.

## Reusable code
- `lib/registerIntent.ts`: Stripe client 36-38; `deriveRequestContext` 148-192 (IP from x-forwarded-for, UA, fbc/fbp, `ekuzo_origin` cookie, UTMs); PI params 315-323. `parent_email` set at 280 for camps (`app/api/camps/register/route.ts:60`), ekuzo100 (`app/api/ekuzo100/register/route.ts:66`), teams (`app/api/teams/register/route.ts:119`). ekuzo101 creates no PI. `app/api/checkout/route.ts` looks dead.
- `lib/stripeClient.ts`: browser `loadStripe` only.
- `lib/metaCapi.ts`: `sha256` (28), `CapiEvent` type (31-41), `sendCapiEvent` (44, never throws, 2 s timeout, v26.0); test code only if `META_CAPI_USE_TEST_CODE === "true"` (58-69). The new path must force `test_event_code` when `livemode` is false.
- `lib/klaviyo.ts`: thin `trackKlaviyoEvent` (no unique_id, no timeout). `app/api/season-one/route.ts`: revision 2025-07-15 (75), list `XGTv2F` (76), helpers 176-208, unique_id uses `Date.now()` (not idempotent), profile props 274-281, timeouts 3500/2500 ms.
- `lib/seasonOneGeo.ts`: `parseGeoHeader` (x-nf-geo), `geoProfileProps`, pure and tested. IP: `x-nf-client-connection-ip` then `x-forwarded-for` (`app/api/season-one/route.ts:144-147`); fbc/fbp from request cookies (150-160).
- `lib/analytics.ts`: `trackPurchase` program union lacks season1 (pages are static HTML anyway; use gtag directly).

## Tests and config
- Existing tests: `lib/__tests__/{ekuzo101-weeks,season-one-attribution,season-one-geo}.test.ts`; run with `--experimental-strip-types` plus an inline resolver hook that retries relative imports as `.ts`; tests import relative paths with `.js` suffix; `@/` not resolvable by node test runner. Results: 30/30, 58/58, ekuzo101-weeks 14/15 (pre-existing).
- tsconfig: `@/*` -> `./*`, moduleResolution bundler, strict.
- `netlify.toml`: `npm run build`, publish `.next`, `@netlify/plugin-nextjs`. No functions or schedules.
- `middleware.ts`: matcher excludes api and dotted paths; `/register` paths 307 when Season One mode is on; sets `ekuzo_origin` cookie. `/crew/<code>` will pass through and get `ekuzo_origin`.
- `docs/architecture-decisions.md:32`: "No Discord" in the rejected list.
