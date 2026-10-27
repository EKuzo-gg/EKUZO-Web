# Sentry smoke (final), 2026-10-27

Target: https://season1-commit--ekuzo.netlify.app (Stripe TEST, Neon test host ep-lively-boat-b4fak1h6). Viewport 375x812, iPhone UA, analytics hosts (GA, GTM, Clarity, Facebook) route-aborted. Script: /home/claude/sentry/smoke/smoke.mjs. Raw: raw.json, screenshots t1-*, t2-*, t3-*.

Deploy gate: signup HTML contained `recurringPaymentRequest` after 3 polls (ddf7387 live). No infra-gap on the deploy.

Result: PASS on all three checks. No defects found. One expected infra item (below).

## 1. Join, signup, Payment Element, sibling total: PASS
- /season1/join 200; CTA (`a.btn` Save their spot) goes to /season1/join/signup.
- Payment Element mounted: 1 iframe in `#pe`, Stripe `elements-inner-payment` frame present.
- Due today $100 with one kid; after "+ Add a sibling" the second kid row appears and Due today is $180.
- Console: no page errors from our code. Entries seen:
  - `Failed to load resource: net::ERR_FAILED` for googletagmanager.com/gtag/js on every page: self-inflicted by the route abort, not a defect.
  - `Origin trial controlled feature not enabled: 'tools'.` from js.stripe.com/v3 (Stripe's own warning, every Stripe.js load).
  - Stripe.js warning, exact text: `[Stripe.js] You have not registered or verified the domain, so the following payment methods are not enabled in the Payment Element: \n\n- apple_pay\n\nPlease follow https://stripe.com/docs/payments/payment-methods/pmd-registration to register and verify the domain.`
- No Stripe.js warning about applePay options or recurringPaymentRequest: the recurring request options are accepted without complaint.

## 2. Age 9 warning, decline, age_edge flag: PASS
- Ada age 9: warning visible: "Season 01 is built for ages 10 to 17. Karlin will check in to make sure it's a fit."
- Parent Smokeparent, email team+s1test-smoke-49hw09@ekuzo.gg, kids Ada 9 and Max 12, consent checked, card 4000 0000 0000 0002, Due today $180.
- POST /api/season1/commit returned 200 (keys clientSecret, orderId, amountCents, invite); PI pi_3UV4BDKORcR8BUEx1BhgxsTi, amount 18000.
- Stripe confirm returned 402; inline message "Your card has been declined." (shown in `#e-pay` and `#formErr`), stayed on /season1/join/signup. PI last_payment_error card_declined.
- PI canceled via Stripe API (status canceled). No successful payments.
- Neon: one order for that email, public_id 5mqu6g9d3n, status pending, amount_cents 18000, flags ["age_edge"].
- The 402 appears in the console as a network error; expected for the decline.

## 3. Routes: PASS
- /crew/75701491: 200, named page ("An invite from Zoë's family", "Join Zoë's team · $100", friend code 7570 1491).
- /season1/early-access?kid=Charlie: 200, lands bare on /season1/join (no query string kept).
- /karlin: lands on /season1/join/signup?src=karlin (200).
- /season1/terms: 200, title "Season 01 terms | EKUZO".

## Infra gap (not a code defect)
Stripe.js reports the apple_pay domain is not registered or verified for season1-commit--ekuzo.netlify.app, so Apple Pay will not show in the Payment Element on this deploy. The recurringPaymentRequest options cannot be exercised end to end until the production domain (ekuzo.gg) is registered in Stripe (live and test) and verified. Owner: whoever controls the Stripe dashboard domain list.
