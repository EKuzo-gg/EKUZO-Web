---
title: "Hotfix 10-30: double charge on changed details and on a new attempt"
created: 2026-10-30
author: Relay (money path), Jamie's Claude
fixes: 02-redteam-money.md findings 1 and 3 (server half only)
branch: season1-commit
---

# Hotfix: double charge

This is a server-only change. No client, copy, pricing, invite, credit, webhook, fulfil or HTML code changed.

## The bug

- **A (finding 1).** In the commit attempt loop, when the parent changed the details (added a sibling, changed a name or an age), the route canceled the old PaymentIntent and ignored any error. A `succeeded` or `processing` PI cannot be canceled, but the route canceled the order anyway and created a new order and PI, so the parent was charged again. Fulfil later claimed the canceled order as paid.
- **B (finding 3).** A reload or a second tab mints a new `attemptId`. A parent whose first payment succeeded seconds ago (order still `pending` until fulfil runs) could create a second order and PI for the same kids.

## Diff summary

`app/api/season1/commit/route.ts`

1. New `IN_FLIGHT_PI` = `processing`, `succeeded`, `requires_capture`.
2. Attempt loop: when the attempt's pending order has a PI, the route now retrieves it **before** the same/changed split.
   - In flight: returns `503 {"error":"try_again"}` and logs `commit.attempt_in_flight` with `pi_<status>`. It never cancels the PI or the order.
   - Retrieve error other than `resource_missing`: returns 503 `try_again` and logs `commit.attempt_pi`. Nothing is canceled.
   - Same details and a reusable PI: the reuse path is unchanged.
   - Changed (or the PI cannot be reused): if the PI is not already `canceled`, the route calls `paymentIntents.cancel`. A throw, or a returned status other than `canceled`, returns 503 `try_again` and logs `commit.cancel_old_pi`. **The order stays pending.** Only after a successful cancel (or an already-canceled or missing PI) does `cancelOrder` run.
3. New email-wide guard, after the loop and before the global ceiling, the new order and the new PI. It takes this email's other recent pending orders that have a PI (from the precheck), skipping the ones this call just canceled, and retrieves their PIs in parallel. At most `PENDING_PI_LOOKBACK` = 4 reads, each wrapped in `timed("stripe")`. If any is in flight, it returns 503 `try_again` and logs `commit.email_in_flight` with `pi_<status>`. That answer sets no cookie and carries no order data. `resource_missing` counts as not in flight. Any other Stripe error fails closed with 503 `try_again` and logs `commit.email_pi`.

`lib/season1/db.ts`

4. `commitPrecheck` gets one more subselect, `pending_pis`: pending orders for this email and mode with a non-null `payment_intent_id`, `created_at` in the last 24 h, newest first, `limit 4`. It is in the same query, so commits still make the same number of DB round trips (the speed-pass tests still assert 6 and 5). `CommitPrecheck.pendingPis` and `PENDING_PI_LOOKBACK` are exported.

`lib/season1/__tests__/commitDoubleCharge.test.ts` (new): 11 unit tests. They use the commitGuards harness: `globalThis.fetch` answers the Neon HTTP driver, and the memoized Stripe client's `paymentIntents.retrieve`, `cancel`, `create` and `customers.create` are stubbed.

## Tests and results

| # | Test | Result |
|---|------|--------|
| 1 | Changed details, attempt PI `succeeded`: 503 try_again, no Stripe cancel, order not canceled, no new order or PI, no cookie | pass |
| 2 | Changed details, attempt PI `processing`, then `requires_capture`: same as 1 | pass |
| 3 | Unchanged details, PI `succeeded`: 503 try_again (existing behavior kept) | pass |
| 4 | Changed details, PI `requires_payment_method`, cancel throws `payment_intent_unexpected_state`: 503 try_again, cancel tried once, order **not** canceled, no new order or PI | pass |
| 5 | Changed details, attempt PI retrieve throws `rate_limit`: 503 try_again, nothing canceled | pass |
| 6 | Changed details, cancel succeeds: order canceled, new order and PI, 200 with client secret and `s1_order` cookie; the just-canceled order (also in `pendingPis`) is not re-read | pass |
| 7 | Changed details, attempt PI already `canceled`: no Stripe cancel call, order canceled, proceeds | pass |
| 8 | New attempt, another pending order's PI `succeeded` / `processing` / `requires_capture`: 503 try_again, no cookie, no order data in the body, the other PI never touched | pass |
| 9 | New attempt, unrelated pending order with a `requires_payment_method` PI: proceeds (200, one new PI), the other PI left alone | pass |
| 10 | New attempt, other PI `resource_missing`: proceeds; other PI retrieve `api_connection_error`: 503 try_again | pass |
| 11 | Six other pending orders, one `succeeded`: 503, with at most 4 Stripe reads | pass |

**The tests bite.** The same file run against the pre-fix route (`git show HEAD:app/api/season1/commit/route.ts`): 1 pass, 10 fail. Tests 1, 2, 4, 5, 8 and 11 fail because the old route canceled a paid order or created a second PI. Tests 6, 7, 9 and 10 fail there because the old route never read those PIs. Only test 3 (behavior kept) passed on the old code. The fixed route was then restored.

**The SQL was run on real Postgres.** The integration suites need Neon plus a Stripe test key. Neither is in this container (no `.env.local`, `S1_DB_TESTS` unset), so those 5 suites are skipped. Instead, a throwaway local PostgreSQL 16.15 cluster got all four repo migrations (`db/migrations/0001` to `0004`). The `commitPrecheck` text was extracted verbatim from `db.ts` and run as a prepared statement over these fixtures: this attempt pending with a PI; another attempt pending with a PI (newer); pending with no PI; pending with a PI but 2 days old; paid; canceled with a PI; pending in the other mode; another email.

- `pending_pis` returned exactly `[o2, o1]`: the two recent pending orders with a PI, newest first. All other fixtures were excluded.
- An unknown email returned `[]`.
- With 5 more pending orders added, it returned 4 rows (the limit holds).

Production runs Neon on Postgres 18; the syntax used (`json_agg`, `json_build_object`, `interval`, `limit` in a subquery) is identical there.

## Full suite tail (`npm run test:s1`)

```
1..62
# tests 225
# suites 62
# pass 225
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8249.241141
```

That is 214 before plus 11 new. The 5 integration suites report as `ok ... # SKIP set S1_DB_TESTS=1 to run`, as before.

## Typecheck and lint

```
$ npx tsc --noEmit
(no output) exit 0
$ npx eslint app/api/season1/commit/route.ts lib/season1/db.ts lib/season1/__tests__/commitDoubleCharge.test.ts
(no output) exit 0
```

## Not proven here, and what is still open

1. **Not run against Stripe test mode or Neon.** The integration tests (`money.integration.test.ts`) were not run. The end-to-end scenario still needs a branch deploy with a 4242 card: pay, back, add a sibling, retap while the order is still pending. Expected: "Something hiccuped..." and no second PI in the Stripe dashboard.
2. **The client message on this 503 is false in this case.** `signup.html` maps 503 to "Something hiccuped. Your card was not charged." When the guard fires, the card *was* charged (or is being charged). This hotfix stops the second charge but not the wrong sentence. The F15 work (finding 6, `in_progress` with its own copy and a redirect to welcome) fixes it.
3. **A `requires_action` PI elsewhere still does not block.** Per the brief, only `processing`, `succeeded` and `requires_capture` block. A second tab opened while the first is in 3DS can still create its own PI, and both can complete. Finding 3b proposes canceling those under the finding 1 rule. Not done here.
4. **A tab that already holds a client secret never calls commit again.** If tab B got its PI before tab A paid, tab B's retap confirms its cached secret directly (signup.html `if(!secret||sig!==secretSig)`), so no server guard on commit can stop it. Only canceling other pending PIs when one succeeds (in fulfil) or a client change covers it.
5. **Lookback bound.** Only the newest 4 pending-with-PI orders from the last 24 h are checked. A paid-but-unfulfilled order older than four newer abandoned ones would be missed. That is unlikely with fulfil running on the webhook.
6. **Pre-existing narrow race, unchanged.** A double tap with *different* details on the same attempt, where request 2 cancels the order while request 1 is still creating its PI (the order has no PI yet), leaves request 1's PI on a canceled order.
7. **Stuck state.** A pending order whose PI succeeded but never fulfils (webhook down) blocks new commits for that email for 24 h, with try_again. That is the intended trade (never double charge). Finding 2 (scheduled drain) and an ops alert cover the recovery.
