# Sentry final QA (slices 3 to 5 and adversarial pass), branch deploy (Stripe TEST)

Target https://season1-commit--ekuzo.netlify.app, deploy confirmed live at 23:43 CT (join returned 200 with "Season 01 is open", mode test).
Branch head when run: ae0f7fc. Run 23:43 to 00:20 CT. Scripts in /home/claude/sentry/final/ (lib3, b, a, a2, d). Raw data in this folder:
`b-result.json`, `a-redirects.json`, `d-result-1..4.json`, screenshots `b-01..04`.

Fail-closed analytics: route-aborted google-analytics.com, googletagmanager.com, clarity.ms, facebook.com, facebook.net. Only aborted URL in
journey B: `https://www.googletagmanager.com/gtag/js?id=G-8LM45PX53W` (4 times). None contained a kid name, code, parent name or email. No facebook
request. Console errors: only `net::ERR_FAILED` for that aborted gtag load (our own abort); no page errors, no other errors. Browser-truth gate: PASS.
Because gtag.js is aborted, no `en=purchase` hit was ever sent, so "attempted exactly once" is measured from the page's gtag() calls (dataLayer
recorder): one `purchase` event on welcome (transaction_id 5xw8wcx4sq, value 180, USD, kids_count 2, has_code true, page_location without query), zero after reload,
localStorage key `s1_purchase_5xw8wcx4sq` set.

## Journey table

| Journey | Result | Evidence |
|---|---|---|
| A. Redirects, curl -sI x4 (early-access?kid, early-access/signup?from, early-access/saved?kid, crew?from) | FAIL on the literal ask, with the contingency met for 3 of 4. All four return 301 but **Netlify re-appends the query**: Location is `.../season1/join?kid=Charlie`, `.../join/signup?from=Charlie`, `.../join/welcome?kid=Charlie`, `.../season1/join?from=Charlie` (the handler `redirectToBare` returns a bare Location; the platform adds the query; reproduced 3 times each) | a-redirects.json, D1 |
| A. Follow-up: destination strips client side | join and signup: PASS (final URL has no query after load, script deletes kid/from). **welcome: FAIL**, `/season1/join/welcome?kid=Charlie` keeps `?kid=Charlie` in the address bar (no replaceState without payment_intent). Served HTML never renders "Charlie" from the query on any of the four (rendered text: 0). The only "Charlie" in HTML is the hard-coded first-name placeholder in signup's JS | a-redirects.json, D1, D2 |
| B. Join page `?utm_source=test&utm_campaign=sentry` | PASS. "Season 01 is open" (HTML and rendered, uppercase via CSS), no $522, friend table has "4 friends: Free. We refund your $100.", refund line "Fully refundable until December 31, 2026, and any time we can't place your kid" linked to /season1/terms, "ages 10 to 17", jersey line, 200, private no-store, noindex, no Meta pixel, utm params stay in the URL, CTA goes to /season1/join/signup | b-01-join.png, b-result.json |
| B. Signup, 2 kids Lena 12 and Ben 10 | PASS. Totals $100 + $80 = $180, button "Save Lena's spot · $180", card 4242 ZIP 78757, parent Finalparent, email team+s1test-final-jtmiwn@ekuzo.gg | b-02-signup-filled.png |
| B. Welcome | PASS. Address bar `/season1/join/welcome` with no query (Stripe return query stripped; hop with payment_intent seen only in the network history, redacted in evidence), "LENA AND BEN ARE IN!", code 8022 4864, share link /crew/80224864, receipt lines $100 + $80 = $180, share note "Anyone with this link sees Lena's first name", `s1_order` cookie HttpOnly Secure SameSite=Lax Path=/season1. Reload keeps both names | b-03-welcome.png, b-04-welcome-reload.png |
| B. Neon | PASS. Order 5xw8wcx4sq `paid`, 18000 cents, flags [], jersey_eligible true, fulfilled_at 0.2 s after paid_at; kids Lena (first, 10000, committed) and Ben (sibling, 8000, committed); family code 80224864 active; PI pi_3UV2FwKORcR8BUEx0QgzS9vS succeeded, 18000, metadata product=season1, customer cus_VW4Ome4vc9CQzT with one pm (4242) | verify.mjs output summarised here |
| B. Outbox within 60 s | PASS. `klaviyo_committed` sent, `meta_purchase` sent, `discord_commit` skipped_no_config, all attempts 1, all finished within 0.3 s of the row being created (04:45:06.7 to 04:45:07.0 UTC), i.e. the inline drain, no cron or retry needed. HTTP codes are not stored on the row; 202 and 200 are inferred from the sender's rules (Klaviyo ok on 202, Meta requires res.ok and events_received at least 1, test code forced when livemode false) and the Klaviyo profile for the email exists with `season1_status=committed`, `season1_kids_count=2`, `season1_code=80224864`, `season1_share_url` on the branch origin | D6 |
| B. GA purchase once | PASS (dataLayer evidence, see above) | b-result.json ga1, ga2 |
| C. Refund Ben, ops script | PASS. Dry run printed $80.00, metadata s1_order and s1_kid_id, idempotency key; `--apply` created re_3UV2FwKORcR8BUEx0TUUqKjS $80.00 succeeded with metadata `s1_kid_id`, `s1_order`. Within the first poll (about 10 s) the order was `partially_refunded`, Ben `refunded`, Lena `committed`, flags [] (no refund_unattributed), outbox `klaviyo_refunded` sent attempts 1, event `charge.refunded` recorded (amount_refunded 8000). The infra-gap fallback was not needed | refund output, Neon queries |
| D. XSS kid name `<img src=x onerror=alert(1)>` | PASS. 422 `kids.0.firstName invalid`, 0 orders, no PI | d-result-1.json |
| D. Apostrophe and accent `Zoë O'Néil` | PASS. 200, stored as `Zoë O'Néil`, PI 10000, canceled | d-result-1.json |
| D. 200 KB body | PASS. 422 `invalid`, no 500 | d-result-1.json |
| D. Malformed JSON | PASS. 422 `body invalid` | d-result-1.json |
| D. 5 kids | PASS. 422 `too_many_kids`, 0 orders | d-result-1.json |
| D. Age 19, 8, "outside" | PASS. All 422 `age_outside`, 0 orders | d-result-2.json |
| D. expectedCents 1 | PASS. 409 `{"error":"price_changed","amountCents":10000}`, 0 orders, no PI | d-result-2.json |
| D. Injected amount, amountCents, amount_cents, price, unit_cents | PASS. 200, PI amount 10000 (server price), canceled | d-result-2.json |
| D. Rate limit | PASS. 5 distinct emails 200 (5 PIs, all canceled), 6th 429 `rate_limited`, no PI. Every call counts toward the IP limit including 422s (see D5) | d-result-3.json |
| D. Extra: parent name XSS 422, consent false 422, honeypot 422, src `evil<script>` 422 | PASS | d-result-4.json |
| D. Webhook unsigned, wrong secret | PASS. Both 400 `bad_signature`; GET 405. Replay of a processed event: skipped, no webhook secret for the deploy here; covered by the integration tests (RT1) | curl |
| D. Tampered s1_ref cookie on signup | PASS. 200, no invite in config, no banner, code absent from HTML. Control: a genuine signed cookie yields `"invite":{"name":"Lena"}` | curl |
| D. s1_order random token on welcome | PASS. 200 generic "Your spot is saved / Text Karlin" page, no names | curl |
| D. GET /api/season1/commit | PASS. 405 | curl |
| D. /crew/`1' or '1'='1` and `<script>` | PASS. 200, nameless "Join a friend's team", no s1_ref cookie, T14 line shown, private no-store, referrer-policy origin | curl |
| D. Mode | PASS. Signup config `"mode":"test"`, test bar shown | curl |
| E. /season1 landing | PASS. 200, HTML contains the /api/season-one post (4 occurrences) and popup/modal markup | curl |
| E. /programs/ekuzo-camps/register | PASS (unchanged). 307 to `/programs/ekuzo-camps?join=season-one` then 200, identical to dev--ekuzo.netlify.app | curl |
| E. /api/season-one | PASS. GET 405, OPTIONS 204 `allow: OPTIONS, POST`, same GET 405 on dev | curl |
| E. Legacy webhook unsigned POST /api/webhooks/stripe | Branch: 400 `{"error":"Invalid webhook signature."}`. dev--ekuzo.netlify.app (the pre-change code): identical 400. No regression | curl |

## Counts

Succeeded PaymentIntents: 1 (pi_3UV2FwKORcR8BUEx0QgzS9vS, $180, $80 refunded). Canceled PIs: 8 (pi_3UV2L4KORcR8BUEx06kWYNPS, pi_3UV2UsKORcR8BUEx1MmnNBUS,
pi_3UV2ePKORcR8BUEx0mK7uOa9, pi_3UV2eRKORcR8BUEx0CQS5kz3, pi_3UV2eRKORcR8BUEx0DkXUG2Z, pi_3UV2eSKORcR8BUEx1z3IDbon, pi_3UV2eTKORcR8BUEx0zjox2C2,
pi_3UV2oBKORcR8BUEx1O5UrgHD), each verified `canceled` via the Stripe API. Ledger updated. No browsers or processes left running.

Not covered: welcome page appearance after a partial refund (browser state was closed), real Apple Pay (S1 D3), real GA hits, Meta Events Manager receipt of the test event.
