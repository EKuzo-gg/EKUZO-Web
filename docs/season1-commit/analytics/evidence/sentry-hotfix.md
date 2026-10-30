---
title: "Sentry: hotfix 09f6f03 double-charge, Stripe test mode on the branch deploy"
created: 2026-10-30
author: Sentry (independent QA)
target: https://season1-commit--ekuzo.netlify.app (sk_test, Neon test DB, `mode: test`)
verifies: hotfix-double-charge.md (red team money findings 1 and 3, server half)
verdict: PASS on all five scenarios
---

# Sentry: hotfix 09f6f03 on the branch deploy

All five scenarios pass. Every parent who paid once has exactly one `succeeded` PaymentIntent, and no paid order was canceled. Test mode only, no live key, no setting changed. Test emails matched `team+s1test-sentry-<scenario>-<id>@ekuzo.gg`.

## Deploy check

The deploy carried the hotfix by the time S1 ran (10:01:56 CT, about six minutes after the 09:55 push). The proof is behavioral: S1 commit 2 returned 503 `try_again` and made no new PI. The pre-fix route would have canceled the order and minted a second PI. S3 and S5 ran earlier (09:58) and pass on old or new code, so they say nothing about the deploy. No scenario showed old behavior, so no 5-minute rerun was needed. GitHub showed no commit status or check run for 09f6f03 (Netlify does not report to it here), so there is no deploy id to quote.

## Results

| # | Scenario | Expected | Observed | Result |
|---|----------|----------|----------|--------|
| S1 | Pay for Sam (succeeded), at once re-commit the SAME attemptId with sibling Bo ($180) | 503 `try_again` (or 409 `duplicate_kid` once the webhook paid the order); one succeeded PI; first order not canceled | Commit 2, 0.3 s after the confirm: **503 `try_again`**, no cookie, 1 Stripe read, no write. Commit 3 eight seconds later: **409 `duplicate_kid` (Sam)**, so the first order was marked paid, not canceled. Stripe: one PI, `pi_3UWHJZ...qkqgRr5`, $100, `succeeded`, `canceled_at` null. | PASS |
| S2 | Pay for Mia (succeeded), at once commit a NEW attemptId, same kid | 503 `try_again` or 409; one succeeded PI | Commit 2, 0.2 s after the confirm: **503 `try_again`**, no cookie. An extra commit 14 s later with another new attemptId: **409 `duplicate_kid` (Mia)**. Stripe: one PI, `pi_3UWHQH...pIj3Eu`, $100, `succeeded`. | PASS |
| S3 | Normal pay, then GET `/season1/join/welcome` with the `s1_order` cookie | Paid hero renders; one PI | Welcome returned 200 and "You're in ... Great, Leo's in! Your receipt is on its way ... Paid today $100 ... Order ty8pmmw...". Stripe: one PI, $100, `succeeded`. | PASS |
| S4 | Commit Zoe, do NOT confirm. Same attemptId with sibling Max | 200 with a new client secret; old PI canceled; new PI confirms | **200**, new order `64mfasw4ud`, $180, new PI. Stripe: old `pi_...1ktCB4gb` $100 **`canceled`**, new `pi_...0P12Ric5` $180 **`succeeded`** after confirm. Confirming the old secret returned `payment_intent_unexpected_state ... status of canceled`. One succeeded PI. | PASS |
| S5 | Two concurrent commits, same attemptId and body | At most one PI | Both returned **200 with the same client secret and order id** (`urxxgt4yu2`); the second request waited, then reused the PI. Stripe: one PI, `pi_3UWHFy...XsS7n5`, `requires_payment_method` (never confirmed). | PASS |
| - | `npm run test:s1` locally | all pass | 225 pass, 0 fail, 0 skipped except the 5 integration suites that need `S1_DB_TESTS` | PASS |

## Raw evidence (trimmed)

Times are UTC (CT is UTC-5). Client secrets are cut. `serverTiming` is shortened.

```
S3  14:58:03  commit  [Leo 13] $100            -> 200 order ty8pmmwfnr  pi_3UWHFnKORcR8BUEx0OZDlqkR   (2.5 s, cold start)
S3  14:58:04  stripe confirm pm_card_visa       -> succeeded 10000
S3  14:58:09  GET /season1/join/welcome (s1_order cookie) -> 200 "You're in | EKUZO Test mode ... Great, Leo's in!"
S5  14:58:14  commit B [Ivy 11] attempt 2615d9d4 -> 200 order urxxgt4yu2 pi_3UWHFyKORcR8BUEx10XsS7n5 (stripe: 2 calls)
S5  14:58:14  commit A (same body, concurrent)   -> 200 order urxxgt4yu2 pi_3UWHFyKORcR8BUEx10XsS7n5 (stripe: 1 call, cold)
S1  15:01:57  commit 1 [Sam 11] $100 attempt 3edc112e -> 200 order dtt35c5czm pi_3UWHJZKORcR8BUEx0qkqgRr5
S1  15:01:58  stripe confirm                      -> succeeded 10000
S1  15:01:58  commit 2 same attempt [Sam, Bo 10] $180 -> 503 {"error":"try_again"} no set-cookie
              server-timing: db 2 queries, stripe 1 call (a read), app 165 ms
S1  15:02:07  commit 3 same attempt + sibling       -> 409 {"error":"duplicate_kid","kidFirstName":"Sam"}  (stripe 0 calls)
S2  15:08:53  commit 1 [Mia 12] $100 attempt e6b3f626 -> 200 order ep9638k426 pi_3UWHQHKORcR8BUEx1YpIj3Eu
S2  15:08:55  stripe confirm                      -> succeeded 10000
S2  15:08:55  commit 2 NEW attempt 32760c35, same kid -> 503 {"error":"try_again"} no set-cookie
              server-timing: db 2 queries, stripe 1 call (a read), app 141 ms
S2  15:09:13  commit 3 NEW attempt 22758330, same kid -> 409 {"error":"duplicate_kid","kidFirstName":"Mia"}
S4  15:08:56  commit 1 [Zoe 11] $100 attempt e42e8c50 (not confirmed) -> 200 order 9d8jpjrahm pi_3UWHQKKORcR8BUEx1ktCB4gb
S4  15:08:56  commit 2 same attempt [Zoe, Max 10] $180 -> 200 order 64mfasw4ud pi_3UWHQKKORcR8BUEx0P12Ric5
              server-timing: db 7 queries, stripe 3 calls (read old PI, cancel, create new)
S4  15:08:57  stripe confirm new                  -> succeeded 18000
S4  15:08:58  stripe confirm old                  -> 400 payment_intent_unexpected_state (status canceled)
```

Stripe test-mode reads (GetPaymentIntents by customer):

| Scenario | Customer | PaymentIntents |
|----------|----------|----------------|
| S1 | cus_VXM1w5TMjXoYo0 | `pi_3UWHJZKORcR8BUEx0qkqgRr5` $100 succeeded |
| S2 | cus_VXM8Z36GNvs1xc | `pi_3UWHQHKORcR8BUEx1YpIj3Eu` $100 succeeded |
| S3 | cus_VXLxTAbWpXJrJV | `pi_3UWHFnKORcR8BUEx0OZDlqkR` $100 succeeded |
| S4 | cus_VXM87sXBi6P9O1 | `pi_3UWHQKKORcR8BUEx0P12Ric5` $180 succeeded; `pi_3UWHQKKORcR8BUEx1ktCB4gb` $100 canceled |
| S5 | cus_VXLxa8xnDWTyOY | `pi_3UWHFyKORcR8BUEx10XsS7n5` $100 requires_payment_method |

`npm run test:s1` tail:

```
1..62
# tests 225
# suites 62
# pass 225
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 9199.732064
```

## What I could not prove, and findings

Severity scale as in the red team file.

1. **Minor, not a defect: "first order not canceled" is inferred, not read.** I have no database access. The S1 and S2 commit 3 answers (409 `duplicate_kid` for the paid kid) prove the order was `paid` by then; a canceled order would not block the kid. The S1 window between the confirm and the paid mark (commit 2 at 0.3 s) is the case the hotfix targets, and it returned 503 without a cancel or a write. A DB read of the order status for `dtt35c5czm` would close this.
2. **Major, already known, not fixed by this hotfix: the parent sees a false sentence.** On the new 503, `signup.html` shows "Something hiccuped. Your card was not charged." In S1 and S2 the card was charged. This is the client half (red team finding 4, F15). It is a trust problem, not a money loss, but a parent who reads "not charged" will retry or pay another way. It should ship with the client change, or the 503 copy should be generic.
3. **Minor: no scenario covered `requires_action` (3DS).** I used `pm_card_visa`, which does not challenge. The hotfix leaves a 3DS PI in another tab unblocked (hotfix note 3). Not tested, not in scope.
4. **Minor: rate limits were close to the edge.** The commit route allows 5 calls per IP per 10 minutes. All five scenarios plus extras needed 11 commit calls from one IP, so I split them into two windows (14:58 to 15:02, then 15:08). If Jamie or Aaron test from the same /48 at the same time they can see 429.
5. **Informational: the webhook marks the order paid in under 10 seconds on this deploy** (S1 commit 3 at +8 s already saw the kid as paid), so the 503 window is short in practice.
6. **Not tested here: the stuck-state trade (hotfix note 7).** A paid PI whose webhook never fulfils blocks that email's commits for 24 h with `try_again`. That is by design and needs the drain work (red team finding 2).

## Not done on purpose

No live mode, no change to any Stripe, Netlify or Klaviyo setting, nothing on `main` or `dev`. Emails created in test mode are left in place (five Stripe test customers; four fulfilled test orders, one canceled PI, one pending PI).
