# Sentry QA, slice 1, branch deploy (Stripe TEST)

Target: https://season1-commit--ekuzo.netlify.app. Run 2026-10-26 23:20 to 23:30 CT. Playwright Chromium,
375x812, iPhone UA. Scripts: /home/claude/sentry/ (outside the repo). Raw data: `*-result.json` here
(client secrets redacted).

Fail-closed analytics: every request to google-analytics.com, googletagmanager.com, clarity.ms,
facebook.com, facebook.net was route-aborted and recorded. The only aborted URL in every context was
`https://www.googletagmanager.com/gtag/js?id=G-8LM45PX53W` (the gtag loader). No collect hit, no
facebook request, nothing carrying a kid name or code. Browser-truth: no console errors from our pages
other than the aborted gtag load (our own abort). Stripe.js warns the Apple Pay domain is unregistered
(branch domain, see D3). The 3DS test ACS frame logs CSP errors (third party, ignored).

## Journey table

| Journey | Result | Evidence |
|---|---|---|
| J3 `/karlin` redirects to `/season1/join/signup?src=karlin` | PASS (307, final URL exact; `s1_orders.src='karlin'`, family attribution `{"src":"karlin"}`) | j1-01-signup-loaded.png, j1-result.json |
| J10 decline then success | PASS (4000...0002: inline "Your card has been declined." in `#e-pay` and `#formErr`, button re-enabled, text "Save Zoë's spot · $100"; swap to 4242: payment succeeded on the same PI, no second commit order) | j1-03-decline-inline.png, j1-04-filled-4242.png |
| J11 double tap | PASS on server evidence, client counters not captured (script died on D1 before counting). One order, one PI, Stripe charges on the PI: 1 failed (decline) + 1 succeeded. Button disables on first tap | verify output below |
| J1 card path, redirect to welcome with no query | FAIL (D1): the 303 from `/season1/join/welcome?payment_intent=...` returns `Location` WITH the query, so the browser loops 20 times and shows ERR_TOO_MANY_REDIRECTS | j1-04b-stripe-return-redirect-loop.png, j1-result.json |
| J1 welcome content (reached by navigating to `/season1/join/welcome` after the loop, cookie already set) | PASS: "ZOË'S IN!", "Zoë, Season 01, first month $100", link `season1-commit--ekuzo.netlify.app/crew/75701491`, "Your code: 7570 1491" (8 digits, spaced 4+4, no "#" glyph), refund until Dec 31, order ref, Text Karlin | j1-05-welcome.png, j1-05-welcome-full.png |
| J9b welcome reload | PASS: same content and code, URL has no query, 200, still one paid order | j1-06-welcome-reload.png |
| Welcome, new context, no cookie | PASS: generic "YOUR SPOT IS SAVED" + Text Karlin, no names, no code | j1-07-welcome-nocookie.png |
| J7 age outside / age 9 | PASS: "Younger or older" hides `#pay` and the Payment Element, shows "Not quite in range?" and Text Karlin (`sms:+18324438679`); age 9 shows "Season 01 is built for ages 10 to 17. Karlin will check in to make sure it's a fit."; age 18 shows it too | j7-01-age-outside.png, j7-02-age9-warning.png |
| J6a two kids = $180 | PASS: total and button "$180"; Stripe `elements/sessions` request with `deferred_intent[amount]=18000` fired after the second kid (Element amount updated); no payment made | j6a-01-two-kids-180.png |
| 3DS fail | PASS: 4000 0027 6000 3184 opened the Stripe 3DS challenge (testmode-acs frame), Fail clicked, inline "We are unable to authenticate your payment method..." and button re-enabled; Neon order stays `pending`, no code, no outbox, PI `requires_payment_method` (`payment_intent_authentication_failure`) | 3ds-01-challenge.png, 3ds-02-after-fail.png |
| `POST /api/season1/commit` consent false | PASS 422 `{"field":"consent","error":"required"}` | stdout of api.mjs |
| same, honeypot `company` filled | PASS 422 `{"error":"invalid"}` | same |
| same, age `"outside"` | PASS 422 `age_outside` | same |
| `GET /season1/terms` | PASS 200, contains "Draft", `x-robots-tag: noindex` | same |

## Must-nots

| Check | Result |
|---|---|
| No kid name or code in any observed URL | PASS. Navigations: `/karlin`, `/season1/join/signup?src=karlin`, `/season1/join/welcome?payment_intent=pi_...&payment_intent_client_secret=<redacted>&redirect_status=succeeded` (Stripe's own params), `/season1/join/welcome`. No "Zoë", "Ines" or `75701491` in any URL |
| No Meta pixel request attempted | PASS (zero facebook.com/facebook.net requests aborted or made) |
| Signup HTML has no `sk_` | PASS (also no `pk_live_`; `pk_test_` present; noindex present; signup `cache-control: private,no-store`) |
| Welcome headers Cache-Control private, no-store | PASS: `private,no-store` on the 200 (normal and reload) and on the 303; `x-robots-tag: noindex` |
| Cookies | `s1_order` HttpOnly, Secure, SameSite=Lax, Path=/season1, ~30 days; `ekuzo_s1_joined` not HttpOnly, ~1 year, Path=/ |

## Backend evidence for the one paid order (email team+s1test-sentry-8rjois@ekuzo.gg)

- Neon: exactly 1 order for the email, `paid`, 10000 cents, src `karlin`, `failure_count` 1 (the decline was recorded on the same order), consent_version `s1-terms-2026-10-27-draft`, `jersey_eligible` true, `fulfilled_at` set. 1 kid (Zoë, 12) `committed`. 1 family code `75701491` (type family, active). Family has `stripe_customer_id`, billing_zip 78757. Outbox: `klaviyo_committed`, `meta_purchase`, `discord_commit` rows, all `pending`, attempts 0 (senders are slice 3).
- Stripe: PI `pi_3UV1u1KORcR8BUEx09uSBhMT` succeeded, `setup_future_usage=off_session`, metadata `{product: season1, order_id: vw5ecedase, offer_version: s1-commit-v1, livemode: false}`, card pm `pm_1UV1u7KORcR8BUExDFp0pNOM` (4242) saved on `cus_VW42EwUd8vL8z2`, which has exactly that one PI. Charges on the PI: one failed (card_declined), one succeeded.
- s1_events: `payment_intent.payment_failed` (webhook, processed_at set, 23:22:27 CT), `order.paid` (source fulfil), `payment_intent.succeeded` (source webhook, evt_3UV1u1...03Ne1NMM, processed_at set 0.08 s after receipt, within 1 s of the payment). Stripe delivery to the branch endpoint works.
- Succeeded PIs created by this run: 1.
- Other orders from this run: `team+s1test-sentry-dbg@ekuzo.gg` (diagnostic decline, pending, PI canceled) and `team+s1test-sentry-3ds432ao@ekuzo.gg` (3DS fail, pending, PI canceled).

## Defects

| # | Severity | Type | Defect and repro |
|---|---|---|---|
| D1 | BLOCKER for J1 | code-bug (probably Netlify adapter or middleware interaction, passes locally) | Stripe return to `/season1/join/welcome?payment_intent=...` loops. Route returns 303 with `location: /season1/join/welcome` in code, but the deployed response has `location: /season1/join/welcome?payment_intent=...&redirect_status=...` (the query is re-appended), so the browser follows it 20 times and shows a redirect-loop error page. Repro: `curl -sD- -o /dev/null "https://season1-commit--ekuzo.netlify.app/season1/join/welcome?payment_intent=pi_x&foo=bar"` shows `location: /season1/join/welcome?payment_intent=pi_x&foo=bar`. Reproduces even with a bogus PI. Payment, fulfil and cookie all succeed (cookie is set on each hop); only the parent's landing is broken, a manual visit to `/season1/join/welcome` renders correctly. Suspects: Netlify Next runtime appending the incoming query to a relative Location, or `middleware.ts` matcher covering this path. Suggested check: emit an absolute Location (`new URL(WELCOME_PATH, origin)`), or exclude the path from middleware, then re-run curl. A real iPhone parent after paying would see "too many redirects". |
| D2 | Low | code-bug (copy truth) | Welcome says "Your receipt is on its way to your inbox." In slice 1 no sender runs (outbox rows stay pending) and Stripe test mode sends no receipts. Fine once slice 3 senders land and Stripe receipts are on for live; recheck then. |
| D3 | Low | infra-gap | Stripe.js warns the Apple Pay domain is not registered for the branch domain. Register `ekuzo.gg` and `www.ekuzo.gg` for the launch (and the branch if wallets are wanted in test). |
| D4 | Info | accepted-risk (test coverage) | Because gtag/js was aborted by design, `gtag('event', ...)` calls never ran, so event payloads were not observed. Code read shows only event names (`season1_pay_submit`, `season1_age_outside`, `season1_signup_view`) with no params; re-check payloads in a non-blocked run on the real domain. |
| D5 | Info | unreproduced flake | First J1 run: the first click on Pay produced no commit POST and no error (button unchanged). Second run and a debug run behaved correctly with the same steps; probably a click before Stripe Elements was fully ready. Not reproduced, but the page does nothing visible if `#go` is clicked in that window. |
| D6 | Info | expected | Outbox rows stay `pending` (slice 3 senders); every succeeded test PI also reaches the unguarded legacy dev webhook (logged in `06-cleanup-ledger.md`). |

## Counts

Succeeded PaymentIntents this run: 1 (`pi_3UV1u1KORcR8BUEx09uSBhMT`, 2026-10-26 23:22:33 CT). PIs created: 3 (decline+success on one, one diagnostic decline, one 3DS fail); the two unsucceeded were canceled. Browsers closed; no background processes started.
