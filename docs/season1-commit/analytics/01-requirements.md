---
title: "Season 01 analytics, attribution and speed slice: requirements and spec"
created: 2026-10-30
author: Jamie's Claude (Fable, lead)
status: DRAFT for Auditor and red team (phase 1)
inputs: 00-scout-map.md, final/08-handoff.md (Analytics gap, Speed slice), build-loop.md (Measurement is part of done, kid data rule 2026-10-30)
---

# Requirements and spec

Small Build Loop round on `season1-commit`. Jamie's answers 2026-10-30 09:38 are the decisions below (D-numbers). Ads keep pushing to the waitlist (Lead on `/season1`), so the funnel's paid traffic mostly arrives at `/season1/join` from Klaviyo emails, Karlin, friend links and the occasional direct ad. A sale ties back to its lead ad through the Klaviyo profile: the waitlist Lead already writes `season1_ad_name` and utm event properties there, and the Committed event lands on the same profile.

## Decisions (Jamie, 09:38)

- D1 Test deploys: no vendor tag fires unless a QA flag is set; with the flag, GA4 runs in debug mode with Google Ads signals off, Pixel and Clarity fire, CAPI keeps `test_event_code`. At release, GA4 Developer traffic filter goes Active (Jamie's go).
- D2 Clarity on every funnel page where it helps us see how the page works, kid and parent names visible (kid data rule, build-loop.md 2026-10-30). Default Clarity masking (typed inputs masked). No kid data to URLs, GA4 or Meta.
- D3 Welcome page stops waiting on sends.
- D4 Attribution: last click (utm_*, fbclid/fbc, gclid) and first touch (`ekuzo_origin`) stored per order; Klaviyo Committed gets utm_campaign and utm_content (plus source, medium, first touch).
- D5 Copy (busy progress line, F15 message): Claude drafts with the voice stack, Jamie approves in chat.
- D6 ASAP release.
- D7 Ads stay list-shaped (Lead). No Purchase or InitiateCheckout optimization change; the ad URL template still matters for any join-direct ad and for email links.

## Design (Fable)

- S1 **One tag renderer.** `lib/season1/tags.ts` renders the head tags for every Season 01 HTML page from `{host, page, pixel, clarity}`; templates get a `{{TAGS}}` placeholder replacing their hard-coded gtag block. Live tags only when the raw Host is `ekuzo.gg` or `www.ekuzo.gg` (same raw-host rule as mode.ts), independent of commit mode, so a paused production page is still measured. Any other host renders the QA gate: a small script that loads the same tags only when `?s1qa=1` was seen (sets cookie `s1_qa=1`, session) and adds `debug_mode: true` to every GA4 event plus `allow_google_signals: false, allow_ad_personalization_signals: false`. Localhost: nothing unless the flag.
- S2 **GA4 page_location** keeps `utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, gclid, fbclid` and drops every other parameter. Crew keeps its `/crew/` path override and appends the kept parameters.
- S3 **Pixel** (`1284038230557204`, `autoConfig` false as on the landing) on join, sign-up and welcome. Not on crew (family code in the path) and not on thanks (`?play=` is kept off Meta by design). Events: PageView on each; ViewContent on join; InitiateCheckout at pay submit (same point as `season1_pay_submit`, `eventID` = attemptId); Purchase on the welcome paid state with `eventID` = order public id, value, currency USD, once per order (same localStorage guard as the GA4 purchase). The welcome Pixel loads after the existing `replaceState`.
- S4 **Clarity** (`wml8wll5ua`) on join, sign-up, crew, welcome, thanks and the early-access pages if they still serve 200 in live. Custom tags: `page`, `src`, `utm_campaign`, `utm_content`. No masking attributes added.
- S5 **Last-click cookie.** `middleware.ts` writes `ekuzo_lc` when a request carries any of the kept parameters: JSON of those parameters (each capped at 160 chars), the landing path and a timestamp; overwritten by each new click; 30 days; Path `/`; SameSite Lax; Secure in production; HttpOnly (only the server reads it). First touch stays `ekuzo_origin`.
- S6 **Order attribution.** New additive migration: `s1_orders.attribution jsonb`. Commit writes `{src, lc: ekuzo_lc, first_touch: ekuzo_origin, fbp: _fbp, fbc: _fbc or built from lc.fbclid as fb.1.<lc.ts>.<fbclid>}` on every order (new and returning families). `s1_families.attribution` is untouched (its `origin` key keeps meaning the test request origin). `outboxLoad` reads fbp/fbc from the order first, then the family.
- S7 **Destinations.** CAPI Purchase gains fbp/fbc. Klaviyo Committed event properties gain `utm_source, utm_medium, utm_campaign, utm_content, first_touch` (event only, never profile, so the lead's `season1_ad_name` is not overwritten). Discord unchanged.
- S8 **Timing.** Sign-up stores `performance.timeOrigin + now()` as `s1_tap` in sessionStorage at pay submit; welcome paid state sends GA4 `season1_tap_to_welcome` with `ms` (once per order) and removes the key.
- S9 **Welcome speed.** Remove both `await drainOutbox` calls from the welcome route. If Next `after()` runs on the Netlify runtime (proven on the branch deploy by outbox `sent_at` within seconds of a test payment with the webhook disabled or delayed), schedule an order-scoped drain with `after()`; otherwise rely on the webhook drain plus stuck recovery. Payment truth unchanged: "You're in" still requires Stripe's succeeded PaymentIntent.
- S10 **F15.** Commit L299 (attempt's PaymentIntent `processing` or `succeeded`) returns 409 `{error: "in_progress"}` with a fresh view-token cookie for that order. Sign-up shows the in-progress message and navigates to `/season1/join/welcome`, which renders paid, pending or failed. No other path changes its copy except: the generic fallthrough stops claiming "not charged" for 500 `server` (the server may have created a PaymentIntent; it cannot have confirmed one, so the claim is true, but the wording is reviewed by the red team).
- S11 **Busy button.** After 2 s busy, the label changes to the progress line (D5 copy); the button stays disabled with `aria-busy`; the line is announced once to screen readers.
- S12 **F2 beyond Season 01.** `app/layout.tsx` loads GA4, Pixel and Clarity only when the build context is `production` (`S1_DEPLOY_CONTEXT`). Landing `/season1`: base tags follow the S1 client rule (hostname check, QA flag) and the `LIVE` regex drops `netlify.app`.

## Measurement rows (build-loop.md § Measurement is part of done)

| Page | GA4 | Meta | Clarity | Attribution captured | Destination |
|---|---|---|---|---|---|
| Landing `/season1` | unchanged events; live host only | Pixel PageView, Lead (eventID) + CAPI Lead; live host only | yes | ekuzo_origin, ekuzo_lc (middleware); lead attrs to Klaviyo (unchanged) | GA4, Meta, Klaviyo profile |
| Join | page_view with kept params, `season1_join_view` | PageView, ViewContent | yes, tags | ekuzo_lc, ekuzo_origin, _fbp/_fbc set by Pixel | GA4, Meta |
| Sign-up | `season1_signup_view`, `season1_pay_submit`, sibling/invite events | PageView, InitiateCheckout at pay submit | yes, tags | read at commit into `s1_orders.attribution` | Neon, Meta CAPI, Klaviyo |
| Crew `/crew/<code>` | `/crew/` + kept params, invite events | none (code in path) | yes | ekuzo_lc, ekuzo_origin | GA4 |
| Welcome | `purchase` (transaction_id = order id), `season1_tap_to_welcome` | PageView, Purchase (eventID = order id) paired with CAPI Purchase | yes | none new | GA4, Meta (deduped) |
| Thanks | `season1_play_answer` | none (`?play=`) | yes | none | GA4 |
| Server: CAPI Purchase | | Purchase + fbp/fbc, test_event_code in test | | from order attribution | Meta |
| Server: Klaviyo Committed | | | | + utm_source/medium/campaign/content, first_touch | Klaviyo event |

Pages bypassing the shared layout: all Season 01 pages (route handlers serving HTML). They inherit nothing; S1 is their only tag source.

## Requirements

| ID | Requirement | Evidence (Sentry) |
|---|---|---|
| R1 | Every Season 01 page renders its tags from `lib/season1/tags.ts`; no template keeps a hard-coded vendor tag | grep + unit test per template |
| R2 | Live tags only on raw Host ekuzo.gg / www.ekuzo.gg; other hosts load nothing without the QA flag | unit tests on renderer; branch deploy network log with and without `?s1qa=1` |
| R3 | QA mode: GA4 events carry debug_mode; no `googleads.g.doubleclick.net` or `/pagead/` request | branch deploy network log; GA4 DebugView screenshot |
| R4 | page_location keeps only the eight kept params (S2) | unit test; DebugView event params |
| R5 | Pixel events per S3 with correct eventIDs; Purchase once per order | Meta Test Events screenshots; reload test |
| R6 | Browser Purchase and CAPI Purchase de-duplicate (same event_id) | Test Events shows "Deduplicated" or both with same ID |
| R7 | Clarity loads on the S4 pages with custom tags | network log; Clarity dashboard session with tags |
| R8 | `ekuzo_lc` written per S5, capped, whitelisted keys only | middleware unit tests |
| R9 | Migration adds `s1_orders.attribution`; commit writes it for new and returning families | integration test; Neon test row |
| R10 | CAPI Purchase carries fbp and fbc when present | outbox test; Test Events payload |
| R11 | Klaviyo Committed carries the S7 properties; profile properties unchanged | outbox test; Klaviyo test profile event |
| R12 | `season1_tap_to_welcome` fires once per order with ms | DebugView |
| R13 | Welcome route awaits no outbox drain; sends still complete (webhook or `after()`) | code diff; outbox rows sent on branch deploy; Server-Timing before and after; tap-to-welcome before and after (baseline 4.4 s) |
| R14 | F15: processing/succeeded attempt returns 409 in_progress + view cookie; sign-up routes to welcome with the D5 message | integration test; branch deploy back-and-retap run |
| R15 | Busy label switches to the progress line after 2 s | browser test with throttled commit |
| R16 | F2: layout tags only in production context; landing LIVE excludes netlify.app; landing base tags follow S1 | grep; branch deploy network log on `/` and `/season1` |
| R17 | Full unit and integration suites pass after `npm ci` | ledger output |
| R18 | Browser-truth gate: join, sign-up, crew, welcome, thanks, landing load with a clean console on the branch deploy (390 and 1440) | ledger |
| R19 | Real-device check on Jamie's phone of the busy line and the wallet row before release | Jamie |

## Journeys each requirement must survive

- J1 Waitlist ad on `/season1` (Instagram in-app browser) → Lead → later Klaviyo email link with utm_* → join → sign-up → pay → welcome. Order attribution: lc = email utms, first_touch = paid_meta, fbp set on landing.
- J2 Direct ad to `/season1/join?src=ad&utm_...&fbclid=...` in the in-app browser → sign-up → Stripe 3DS redirect → welcome. fbc present; utms survive join to sign-up via `ekuzo_lc`.
- J3 Friend link `/crew/<code>` → sign-up → pay (no Pixel on crew; Pixel from sign-up on).
- J4 `/karlin` → `signup?src=karlin`.
- J5 Back from welcome; back and retap while processing (F15); double tap.
- J6 Return visit days later in a new session: `ekuzo_lc` and `ekuzo_origin` still present; a returning family's second order gets its own attribution.
- J7 Test deploy: Aaron's casual visit fires nothing; Sentry with `?s1qa=1` fires debug tags; CAPI carries test_event_code.

## Must-not cases

- No vendor request on a non-production host without the QA flag; none on localhost.
- No `payment_intent_client_secret`, family code, order token, email, phone or kid name or age in any URL sent to GA4, Meta or Clarity.
- No kid name or age in any GA4 or Meta payload (counts are fine).
- Pixel Purchase must not fire on pending, slow, failed, refunded or stalled states, on reload, or twice per order; GA4 purchase likewise (unchanged).
- InitiateCheckout must not fire on page load, autofill, sibling add, a validation failure before submit, or a retry of the same attempt.
- ViewContent must not fire more than once per join page load.
- `season1_tap_to_welcome` must not fire without an `s1_tap` value or more than once per order.
- "Your card was not charged" must not show when the attempt's PaymentIntent is processing or succeeded.
- `ekuzo_lc` must not store any key outside the kept list or values over 160 chars, and must not be overwritten by a visit without kept parameters.
- The welcome page must not show "You're in" before Stripe reports succeeded (unchanged).
- No paid order may end without its Klaviyo Committed and Meta Purchase rows sent (within 5 minutes worst case via stuck recovery).
- Klaviyo profile properties set by the waitlist (`season1_ad_name` and the like) must not be overwritten by the commit.

## Non-regression (zero-diff or test-proven)

Money path (commit amount, PaymentIntent reuse, fulfil, refunds, friend credits), Stripe webhooks (Season 01 and legacy), welcome states, wallet row and card toggle, warm route, dev-view, camps and EKUZO100 pages, `/api/season-one` waitlist Lead.

## Human actions at release (Jamie's go)

1. Apply the additive migration to Neon production before the code deploy.
2. Push main and dev (exact go phrase with hashes).
3. GA4: set the Developer traffic data filter to Active.
4. Check Clarity's masking mode is Balanced (read first; change only on Jamie's go if it is Strict).
