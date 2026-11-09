# Red team: money and fraud lens (2026-11-09)

Scope: the shipped code on `build/s1-cls-field` (= `origin/main` 45dfe97), read end to end. Waitlist: `app/season1/landing.html` (form script 1380 to 1504), `app/season1/route.ts`, `app/api/season-one/route.ts`, `components/ui/SeasonOnePopup.tsx`, `lib/metaCapi.ts`, `lib/season1/tags.ts`, `attribution.ts`, `ratelimit.ts`, `rules.ts`. Checkout: `app/season1/join/{route,b,jersey,signup,welcome}`, `app/api/season1/commit/route.ts`, `app/api/season1/stripe-webhook/route.ts`, `app/api/season1/drain/route.ts`, `netlify/functions/s1-drain.mts`, `lib/season1/{fulfil,outbox,db,mode,stripe,validate,offer,pricing,httpGuard,legacyGuard}.ts`, `lib/season1/senders/*`, `scripts/s1-refund.mjs`, `scripts/s1-sweep.mjs`, `scripts/s1-outbox.mjs`, plus the legacy `app/api/checkout/route.ts` and `app/api/webhooks/stripe/route.ts` where they touch Season 01. No source file was edited.

Evidence run here: `npm test` 575 tests, 574 pass, 0 fail, 1 skipped (log: `/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/money-npmtest.log`). Two Playwright probes with no server (route-fulfilled pages, stubbed Stripe.js), outputs beside them in the scratchpad. Public GETs: `https://ekuzo.gg/season1/join/signup` (config `mode:"live"`, `open:true`, `pk_live_`), `https://dev--ekuzo.netlify.app/season1/join/signup` (`mode:"test"`, `pk_test_`), `https://www.ekuzo.gg/season1/join/signup` (301 to apex). Stripe docs read: payment method domains (no domain association file is needed; every domain and subdomain that shows a wallet must be registered).

Closed by earlier runs and not repeated: honeypot autofill (8ce0e17), waitlist per-IP limit and step lock (round 2), one Lead per email per 24 h with retry/repeat classes, eventId tied to the email, Meta IP from the Netlify header only, double-tap and in-flight PI guards on commit (hotfix 10-30, F15).

Counts: 0 critical, 3 major, 11 minor. One live defect hotfix candidate (M-1).

## 1. Ranked findings

| ID | Sev | Type | Effect on sign-ups or money | Where | Proposed fix | Who acts |
|---|---|---|---|---|---|---|
| M-1 | major | code-bug (live) | A parent with three declines on one attempt hits a dead end: every later tap re-confirms a canceled PaymentIntent and shows a Stripe error, with no path to pay short of a reload. | `app/api/season1/stripe-webhook/route.ts:30,121-129`; `app/season1/join/signup/signup.html:524,541,566-568` | On `payment_intent_unexpected_state` with `error.payment_intent.status==='canceled'`, drop `secret`/`secretSig` and the confirmed flag and show "That didn't go through. Try another card." so the next tap re-commits (the server already replaces a canceled PI). | code (hotfix) |
| M-2 | major | infra-gap | A paid family can silently get no "Season 01 Committed" email, no Meta Purchase and no Discord commit post: outbox rows that fail 5 times (about 10 minutes of drains), go stale, or skip for missing config are never surfaced. | `lib/season1/outbox.ts:27,216-219,274-282`; `senders/klaviyo.ts` (`skipped_no_config`) | When a `klaviyo_committed`, `meta_purchase` or `discord_commit` row ends failed at attempt 5, goes stale, or skips for no config in live mode, post one Discord ops alert direct (not through the outbox) with the order ref; add a dead-row count to `s1:outbox`. | code |
| M-3 | major | improvement (hypothesis) | In Facebook and Instagram in-app browsers, Apple Pay and Google Pay are likely unavailable, so the wallet-first checkout becomes a card form for the ad traffic; the one-shot Purchase ad (paused 11-09) spent $250.84 for 49 join views and 0 `season1_pay_submit` (reads/2026-11-09.md). | `signup.html:354,394,400` | Confirm on Jamie's S25 Instagram tonight via the dev deploy's test bar ("Wallets: applePay=… googlePay=… link=…"). If no wallet shows, offer an "Open in Chrome" link (Android `intent://` URL) and a short iOS hint on the signup page for in-app user agents. Copy and placement are Aaron's. | Jamie (device check), Aaron (copy), code |
| M-4 | minor | infra-gap | The waitlist API has no test mode: a popup or direct POST on the dev deploy writes to whatever Klaviyo list and Meta dataset the branch-deploy env points at, and a CAPI Lead could reach the live dataset during tonight's tests. | `app/api/season-one/route.ts:131-133,635-638`; `lib/metaCapi.ts:58-69` | Check the branch-deploy env (checklist 4.2). Code option, not now: skip CAPI and use a test list unless the deploy context is production. | Jamie (Netlify) |
| M-5 | minor | code-bug | A second tab (in-app browser plus Chrome) holding a cached client secret can confirm after the other tab paid, charging twice for the same kid; fulfil flags `duplicate_kid` and Karlin refunds by hand. | `signup.html:541` (commit skipped when `secret` is cached) | Re-commit before every confirm (the reuse path runs the duplicate-kid and in-flight guards) and raise the commit IP limit with it (M-7). Not now. | code |
| M-6 | minor | code-bug | `/season1/join*` strips `?ad=` before the page script reads it, so `/join/jersey?ad=d20` or `d21` always shows the d19 hero and `season1_join_view` carries no ad. No live ad links there today (one-shot paused). | `lib/season1/tags.ts:62`; `join-jersey.html:7,286,386` | Add `ad` to the jersey route's `renderUrlAllow` extras. Not now. | code |
| M-7 | minor | accepted-risk | Commit allows 5 validated calls per IPv4 or IPv6 /48 per 10 minutes and fails closed; carrier NAT or a carrier /48 is shared across families, and a missing Netlify IP header puts everyone in one `noip` bucket. At current volume a collision is unlikely. | `app/api/season1/commit/route.ts:43,262-279`; `lib/season1/referralFlags.ts:53-58` | Not now. If M-5 lands, raise to 10 and skip the limiter when there is no IP (the waitlist rule). | code |
| M-8 | minor | accepted-risk | Above 150 new waitlist sign-ups an hour site-wide every sign-up goes quiet (no Meta Lead), so a creator spike would starve the Lead-optimized ad sets during the spike. | `app/api/season-one/route.ts:149,260` | Raise `GLOBAL_QUIET` before any creator push. | code |
| M-9 | minor | improvement | No client timeout on the waitlist POST or the commit fetch: a stalled in-app connection leaves "Saving…" with the button locked (`inflight`) until the browser gives up. | `landing.html:1424-1426,1437-1438`; `signup.html:546` | `AbortSignal.timeout(15000)` on both, falling into the existing error copy. | code |
| M-10 | minor | improvement | 5 `signup_error invalid_email` in 3 days against 66 Leads (reads/2026-11-09.md) on the waitlist form. | `landing.html:1436` | Inline "Did you mean gmail.com?" for common domain typos. Copy is Aaron's. Not now. | Aaron |
| M-11 | minor | accepted-risk | "Custom jersey (first 100 families)" has no count cap in code; eligibility is the Nov 30 time cutoff only. 3 commitments so far. | `lib/season1/offer.ts:27`; `fulfil.ts:224` | Not now; revisit if commitments pass 60. | Jamie |
| M-12 | minor | hypothesis | Link in the Express Checkout row may let a Link user pay from a bank account, which leaves the PI `processing` for days (welcome shows the slow state; a later return fails the order). | `app/api/season1/commit/route.ts:507`; `signup.html:394` | Check Link funding settings (checklist 4.6). | Jamie (dashboard) |
| M-13 | minor | code-bug | Waitlist CAPI Lead sends `_fbp`/`_fbc` unvalidated and builds `fbc` with the event time instead of the click time; the Graph token rides in the URL query. Match quality only, no money moved. | `app/api/season-one/route.ts:388-398`; `lib/metaCapi.ts:73` | Reuse `validFbp`/`validFbc`; token in the body as `senders/meta.ts` does. Not now. | code |
| M-14 | minor | code-bug (legacy) | The camps webhook skips signature checks when `STRIPE_WEBHOOK_SECRET` is unset and logs the parent email. Season 01 PIs are skipped there. | `app/api/webhooks/stripe/route.ts:48,96` | Not now (camps return in February; fix before then). | code |

## 2. Proof for the majors

### M-1: three declines, then a dead end

Code path:
1. Each failed confirm fires `payment_intent.payment_failed`. The webhook counts webhook events for that PI (`lib/season1/db.ts:950-964`, deduped by `stripe_event_id`) and at `CARD_TESTING_FAILURES = 3` on a pending order cancels the PI and flags `card_testing_suspect` (`stripe-webhook/route.ts:117-131`). Declines from 3D Secure failures and wallet cards count the same.
2. The page keeps the client secret for the attempt: `if(!secret||sig!==secretSig)` (`signup.html:541`) only re-commits when the form changed. Otherwise it goes straight to `stripe.confirmPayment` (line 566).
3. On the canceled PI, Stripe answers `payment_intent_unexpected_state`; `keepConfirmed` keeps the confirmed flag for exactly that code (line 524), line 568 shows Stripe's message, and `secret` is never cleared. Only a reload (no bfcache) or a form edit re-commits, and the server then cancels the dead order and mints a new PI (`commit/route.ts:369-388`).

Reproduction (`/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/probe-3declines.cjs`, output `probe-3declines.out.json`): the shipped `signup.html` served by Playwright `route()`, Stripe.js stubbed to decline three times and then answer `unexpected_state` with `payment_intent.status:"canceled"`, commit stubbed. Six taps: one commit call in total, six confirms on `pi_probe1_secret_x`, taps 4 to 6 show the canceled-PI error. The exact Stripe message on a real canceled PI is a hypothesis; the code path does not depend on it.

How often: unknown. Human check 4.7 counts `card_testing_suspect` orders in live. Each one is a parent who tried three times, which is the parent most worth keeping.

### M-2: dead outbox rows are invisible

1. `drainOutbox` selects and claims only `attempts < MAX_ATTEMPTS` (5) (`outbox.ts:216-219,274-282`). The scheduled drain runs every 2 minutes (`netlify/functions/s1-drain.mts:34`) with no backoff, so a Klaviyo or Meta incident longer than about 10 minutes exhausts a row.
2. An exhausted row stays `failed` forever, is never marked stale (stale marking also only sees selected rows) and raises nothing. `grep MAX_ATTEMPTS` finds no other use; the only reader is `s1:find --order`, by hand.
3. `sendKlaviyoEvent` and `sendDiscord` return `skipped_no_config` when their env var is missing (`senders/klaviyo.ts`, `senders/discord.ts:187-193`): a deploy that loses `KLAVIYO_PRIVATE_API_KEY` marks every receipt row final with no alert.
4. Effect: the payment, the welcome page and the Stripe receipt (if enabled, 4.5) still happen. The "Season 01 Committed" email (share code, friend ladder), the Meta Purchase that the Purchase-optimized ads learn from, and the Discord commit post Karlin watches are lost for that family.

## 3. Live defect hotfix candidates

1. M-1, confidence high that the dead end exists (code path plus probe), medium on how often it bites. Two lines of client logic in `signup.html`, no copy change beyond an error line, a unit test in `signupCommit.test.ts` on the new branch. Ship ahead of the build.
2. M-2 is a monitoring gap, not a broken payment. Recommend it as the next code item, not a hotfix tonight.

Nothing else found would make a paying parent fail outright on the shipped path. Verified sound on read: server-side price (`quote` plus `expectedCents`, 409 `price_changed`), kid count capped at 4, fulfil refuses on amount, currency, order or mode mismatch, PI idempotency key `s1-pi:<order>`, one Customer per family, webhook dedupe on `stripe_event_id`, refund script bounded by the refundable amount and keyed for 24 h, Purchase `event_id` = order public id on Pixel and CAPI, waitlist Lead `event_id` shared between Pixel and CAPI, test-mode Klaviyo limited to `team+s1test*`/`aaron+*`, test-mode Meta Purchase forced to a test event code, mode fails closed to off.

## 4. Human checklist

Stripe (you cannot call Stripe from here; this is what the code expects):

4.1 Webhook endpoints, live and test mode, listed before any e2e. Expected: live mode has `https://ekuzo.gg/api/season1/stripe-webhook` with at least `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `refund.failed`, `charge.dispute.created`, `charge.dispute.closed`, its secret equal to Production `S1_STRIPE_WEBHOOK_SECRET`; plus the legacy `https://ekuzo.gg/api/webhooks/stripe` (camps) with `STRIPE_WEBHOOK_SECRET`. Test mode: note every endpoint and where it points; a test payment on the dev deploy is fulfilled only if a test endpoint points at `https://dev--ekuzo.netlify.app/api/season1/stripe-webhook` with that context's secret. Test endpoints pointing at ekuzo.gg are harmless (the route skips mode mismatches with 200).

4.2 Netlify env for branch deploys (dev): `STRIPE_SECRET_KEY` starts `sk_test_`, `DATABASE_URL` is the Neon test endpoint (`ep-lively-boat-b4fak1h6`, else mode resolves off), and before any waitlist test there: is `KLAVIYO_PRIVATE_API_KEY` the production account, is `META_CAPI_ACCESS_TOKEN` set, and is `META_CAPI_USE_TEST_CODE=true` with `META_CAPI_TEST_EVENT_CODE` set (M-4). If unsure, run waitlist tests on the ad landing (it sends nothing off ekuzo.gg), never the popup or a direct POST.

4.3 Production env: `S1_DRAIN_SECRET` set (else the 2-minute drain logs "skipped" and receipts depend on the webhook's inline drain alone), `S1_DISCORD_WEBHOOK_URL`, `KLAVIYO_PRIVATE_API_KEY`, `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID`. Netlify scheduled function `s1-drain` shows recent runs with `status 200`.

4.4 Stripe Settings, Payment method domains (live): `ekuzo.gg` and `www.ekuzo.gg` registered and enabled (www 301s to the apex today, so the apex is the one that matters); Apple Pay, Google Pay and Link enabled in Payment methods. For tonight's wallet check, `dev--ekuzo.netlify.app` registered too (registering in live also registers it in sandboxes).

4.5 Stripe Settings, Customer emails: "Successful payments" on in live, so the Stripe receipt still reaches a family when M-2 bites.

4.6 Link: which funding sources are allowed (card only vs bank), for M-12.

4.7 Data pulls, read only: `select count(*) from s1_orders where livemode and flags ? 'card_testing_suspect'` (M-1 frequency); `select kind, status, count(*) from s1_outbox where livemode and (attempts >= 5 or status in ('stale','skipped_no_config')) group by 1,2` (M-2 today). Run with `npm run s1:find` access on Jamie's laptop.

4.8 Klaviyo: a flow on the "Season 01 Committed" metric is live and sends the receipt; the Waitlist list `XGTv2F` welcome flow state matches the route header (which still says none exists).

4.9 Device, tonight: on the Samsung S25, open `https://dev--ekuzo.netlify.app/season1/join/signup` inside Instagram (paste the link in a DM to yourself and tap it) and in Chrome; read the test bar's "Wallets:" line in each. Aaron does the same on iPhone in Instagram and Safari. No payment is needed for this check.
