# Season 01 commit: cleanup ledger

Test data on the Neon test branch (endpoint ep-lively-boat-b4fak1h6), livemode=false. May stay.
No secrets or real family data here.

| Table | Key | Purpose | Owner |
|---|---|---|---|
| s1_guardians, s1_families, s1_kids, s1_orders, s1_order_items, s1_codes | email `team+s1test-8d84a22bba@ekuzo.gg` (also `...8d84a22bbab`, `...8d84a22bbac` variants), pi `pi_test_8d84a22bba` | db.integration test run 1 (family, 2 kids, paid order, family code) | Relay |
| s1_events | stripe_event_id `evt_test_8d84a22bba` | duplicate-event test, run 1 | Relay |
| s1_outbox | dedupe_key `test_kind:8d84a22bba` | outbox dedupe test, run 1 | Relay |
| s1_rate_limits | key `test:8d84a22bba` | rate limit test, run 1 | Relay |
| s1_guardians, s1_families, s1_kids, s1_orders, s1_order_items, s1_codes | email `team+s1test-c7e78117ad@ekuzo.gg` (also `...c7e78117adb`, `...c7e78117adc` variants), pi `pi_test_c7e78117ad` | db.integration test run 2 (evidence run) | Relay |
| s1_events | stripe_event_id `evt_test_c7e78117ad` | run 2 | Relay |
| s1_outbox | dedupe_key `test_kind:c7e78117ad` | run 2 | Relay |
| s1_rate_limits | key `test:c7e78117ad` | run 2 | Relay |

Each further `S1_DB_TESTS=1` run adds a new tag; the test prints its tag on the `# test rows:` line.
Cleanup query (test branch only): delete rows where guardian email like `team+s1test-%@ekuzo.gg` and children by family_id.

## Relay B money-path tests (Stripe test mode + Neon test), 2026-10-26 CT

Stripe test account objects (ids only). Every PI that was not confirmed has been canceled.
Neon rows: emails `team+s1test-b5e35895*@ekuzo.gg` (run 1) and `team+s1test-4face0fb*@ekuzo.gg` (run 2), with
their families, kids, orders, items, codes, events, outbox rows (incl. `ops_alert:<pi>`), rate-limit keys `s1pi:*`.
Locally constructed events: `evt_local_b5e35895_*`, `evt_local_4face0fb_*`.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| customer | cus_VW3oKy9nCXD1sS | kept | run 1 family (a) |
| payment_intent | pi_3UV1gxKORcR8BUEx0oeOz2Y2 | succeeded | run 1 (a) |
| payment_intent | pi_3UV1h2KORcR8BUEx1CRWYIU6 | succeeded | run 1 (b) |
| payment_intent | pi_3UV1h6KORcR8BUEx1f2EP0xB | succeeded | run 1 (b) 5-way race |
| payment_intent | pi_3UV1h9KORcR8BUEx1MQ6WWn7 | succeeded | run 1 (c) orphan |
| payment_intent | pi_3UV1hFKORcR8BUEx1jX8sgkF | canceled | run 1 (d) declines |
| payment_intent | pi_3UV1hPKORcR8BUEx0Ia7SLUH | canceled | run 1 (e) 3DS |
| payment_intent | pi_3UV1hRKORcR8BUEx0kvrKVgv, pi_3UV1hRKORcR8BUEx1NVIDZNk, pi_3UV1hSKORcR8BUEx0eCBNXMP | canceled | run 1 (g) pricing |
| payment_intent | pi_3UV1hTKORcR8BUEx1Y78fixE, pi_3UV1hTKORcR8BUEx10EdR4dq, pi_3UV1hUKORcR8BUEx0zz22Glw, pi_3UV1hVKORcR8BUEx1Xik64Fo, pi_3UV1hWKORcR8BUEx1N3MaUfH | canceled | run 1 (i) rate limit |
| customer | cus_VW3sdAfnCZuGog | kept (3 PMs attached) | run 2 family (a) |
| payment_intent | pi_3UV1kaKORcR8BUEx0EUoMUdg | succeeded, fully refunded (re_3UV1kaKORcR8BUEx05KloPsh 4000 + re_3UV1kaKORcR8BUEx003YWHcB 6000) | run 2 (a) (b) (c) (h) |
| payment_intent | pi_3UV1l6KORcR8BUEx163Ne8sJ | succeeded ($1.60, metadata product `season1_offsession_test`) | run 2 (f) off-session on saved visa |
| payment_method | pm_1UV1l7KORcR8BUExWxrRxNwa, pm_1UV1l8KORcR8BUExnjFRTFcp | attached to cus_VW3sdAfnCZuGog | run 2 (f) 3184-style and 3155-style cards |
| payment_intent | pi_3UV1l7KORcR8BUEx0d2GmalF, pi_3UV1l9KORcR8BUEx0R4wFeFs | canceled (authentication_required) | run 2 (f) off-session failures |
| payment_intent | pi_3UV1kvKORcR8BUEx1N74am12 | canceled | run 2 (d) declines |
| payment_intent | pi_3UV1l5KORcR8BUEx0UVAYpGE | canceled | run 2 (e) 3DS |
| payment_intent | pi_3UV1lAKORcR8BUEx0WsUCscw, pi_3UV1lAKORcR8BUEx0IlzbqXG, pi_3UV1lBKORcR8BUEx0LJ61syV | canceled | run 2 (g) pricing (never confirmed) |
| payment_intent | pi_3UV1lKKORcR8BUEx0YDinqT0, pi_3UV1lLKORcR8BUEx1tj2blgz, pi_3UV1lLKORcR8BUEx0sRwBrLj, pi_3UV1lMKORcR8BUEx0Pxcut0Q, pi_3UV1lNKORcR8BUEx19x0dqlb | canceled | run 2 (i) rate limit |

Refunds: run 1 succeeded PIs were not refunded (test mode, no money). Optional tidy-up: refund them in the Dashboard.

## Legacy dev endpoint side effects

The test-mode endpoint we_1TMYx4KORcR8BUExWqrM0dBF (`dev--ekuzo.netlify.app/api/webhooks/stripe`) receives
every test `payment_intent.succeeded`. origin/dev has no legacy guard, so for each PI below the dev deploy's
unguarded handler may have run it as camps with an empty parent email: possibly a camps Sheets row with an
empty email (in whatever sheet the dev deploy points at) and a Meta CAPI test event (TEST_AUTO); Beehiiv and
Klaviyo calls should have failed on the empty email. Six succeeded PIs (run 1 happened before the lead's
"4 or fewer" cap; run 2 used 2):

| PaymentIntent | Created (CT) | Amount | Run |
|---|---|---|---|
| pi_3UV1gxKORcR8BUEx0oeOz2Y2 | 2026-10-26 23:08:55 | $100.00 | 1 |
| pi_3UV1h2KORcR8BUEx1CRWYIU6 | 2026-10-26 23:09:00 | $100.00 | 1 |
| pi_3UV1h6KORcR8BUEx1f2EP0xB | 2026-10-26 23:09:04 | $100.00 | 1 |
| pi_3UV1h9KORcR8BUEx1MQ6WWn7 | 2026-10-26 23:09:07 | $100.00 | 1 |
| pi_3UV1kaKORcR8BUEx0EUoMUdg | 2026-10-26 23:12:40 | $100.00 (refunded) | 2 |
| pi_3UV1l6KORcR8BUEx163Ne8sJ | 2026-10-26 23:13:12 | $1.60 | 2 |
| pi_3UV1zrKORcR8BUEx1RLqrahQ | 2026-10-26 ~23:28 | $100.00 (refunded re_3UV1zrKORcR8BUEx1aLh0mEe) | Relay C (1) friend order |
| pi_3UV1u1KORcR8BUEx09uSBhMT | created 23:22:25, succeeded 23:22:33 CT (2026-10-27 04:22 UTC) | $100.00 | Sentry slice 1 branch-deploy browser run (one payment; email team+s1test-sentry-8rjois@ekuzo.gg) |
| pi_3UV25wKORcR8BUEx1og8AU4g | 2026-10-26 23:34:44 CT (04:34:44 UTC), succeeded within 3 s | $100.00 | Sentry slice 2 browser run J4 (friend joins via /crew/75701491; email team+s1test-sentry2-6k62x4@ekuzo.gg; order 4q9zg77d8j; friend code issued 95929969) |
| pi_3UV2FwKORcR8BUEx0QgzS9vS | 2026-10-26 23:45:04 CT (04:45:04 UTC), succeeded within 3 s | $180.00 (partially refunded $80.00, re_3UV2FwKORcR8BUEx0TUUqKjS, metadata s1_kid_id) | Sentry final run journey B and C (2 kids Lena and Ben; email team+s1test-final-jtmiwn@ekuzo.gg; order 5xw8wcx4sq; family code 80224864; cus_VW4Ome4vc9CQzT) |

Sentry also left two pending PaymentIntents (pi_3UV1tQKORcR8BUEx11S9qhAS decline test, pi_3UV1x8KORcR8BUEx1QE259xP failed 3DS), both canceled via the API. Neon test rows for team+s1test-sentry-* emails remain (test branch).

(Relay C used one succeeded PI; Sentry slice 2 one more: eight totals.)

Each also reached the S1 test endpoint we_1UUzlTKORcR8BUExui4NsZnU on the branch deploy, which writes to the
same Neon test branch (idempotent; harmless).

## Relay C slice 2 wiring tests (Stripe test mode + Neon test), 2026-10-26 CT

Run tag `cffe9e5c`. Neon rows: emails `team+s1test-cffe9e5c*@ekuzo.gg` with families, kids, orders, items,
codes, a synthetic 2-kid paid order (public id `t8ab58cac29`, no PI), referrals, events (`invite.ignored`,
`referral.*`, `flag.duplicate_kid_repeat`, `refund.referral_effects`), outbox rows (`klaviyo_friend_joined:*`,
`discord_flag:*`, plus the friend order's slice 1 rows) and rate-limit keys `s1pi:*`, `s1dup:*`. Inviter reused:
existing test family `31fa55c9-8519-4b42-89b7-f8510295216f`; it now has two referrals (one void, one pending from the
synthetic order). Locally constructed event: `evt_local_cffe9e5c_refund`.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UV1zrKORcR8BUEx1RLqrahQ | succeeded, fully refunded (re_3UV1zrKORcR8BUEx1aLh0mEe) | (1) friend pays 1 kid; (8) refund |
| payment_intent | pi_3UV1zuKORcR8BUEx0RfY5f2v, pi_3UV1zvKORcR8BUEx0gwHNBNA | canceled | (2) inviteRemoved |
| payment_intent | pi_3UV1zwKORcR8BUEx1EwOeZFK, pi_3UV1zxKORcR8BUEx0wKnmjIX | canceled | (3) tampered/unsigned cookie |
| payment_intent | pi_3UV1zyKORcR8BUEx1B9iS1El | canceled | (4) own code |
| payment_intent | pi_3UV1zzKORcR8BUEx09loSQG5 | canceled | (5) already paid |

## Sentry slice 2 (Stripe test mode + Neon test), 2026-10-26 CT

One succeeded PI (listed in the Legacy dev endpoint side effects table above, so the unguarded dev handler may have
treated it as camps with an empty parent email, same caveat as the others). Neon rows: families, kids, orders, items,
code 95929969, referral 679f36fb-32ec-4770-9d08-8c2ba9c1471b (pending, friend_kids 1, reasons shared_card and same_zip),
outbox rows (`klaviyo_committed`, `meta_purchase`, `discord_commit`, `klaviyo_friend_joined`, two `discord_flag`) and
events for emails `team+s1test-sentry2-*@ekuzo.gg` (`-zyj2zj` has no order: the first J4 click was a no-op, no PI).

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UV25wKORcR8BUEx1og8AU4g | succeeded ($100, not refunded) | J4 friend join (cus_VW4EtzgytK6bhG, pm_1UV25wKORcR8BUExFAD8qjiz) |
| payment_intent | pi_3UV27cKORcR8BUEx10vKg0bv | canceled | Remove flow (inviteRemoved), commit response intercepted, client secret withheld from the page, no confirm call |
| payment_intent | pi_3UV27zKORcR8BUEx0KDrDDyy | canceled | J13 own code (inviter email, sibling Ana 13, $80), pending order du6d9vemk9 on the inviter family |

Remove-flow pending order mk2e4b7nyb (referral_code null) stays pending on the test branch. J9a created no PI and no order.

## Sentry final run (Stripe test mode + Neon test, branch deploy), 2026-10-26 CT

One succeeded PI (pi_3UV2FwKORcR8BUEx0QgzS9vS, listed above under Legacy dev endpoint side effects, so the unguarded dev handler may
have run it as camps with an empty parent email; nine succeeded PIs in total). Neon rows: emails `team+s1test-final-*@ekuzo.gg`
(order 5xw8wcx4sq paid then partially_refunded, Ben kid refunded, family code 80224864, outbox rows `klaviyo_committed`,
`meta_purchase`, `discord_commit`, `klaviyo_refunded`, events, rate-limit keys `s1pi:*`) plus pending/canceled orders from the adversarial
calls (`-dapos-`, `-dinject-`, `-drl1..5-`, `-dspoof-` emails). Klaviyo test profile exists for team+s1test-final-jtmiwn@ekuzo.gg
(season1_* properties). Meta test events carry the test code.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| refund | re_3UV2FwKORcR8BUEx0TUUqKjS | succeeded $80.00 | journey C, Ben, via `npm run s1:refund --apply` |
| payment_intent | pi_3UV2L4KORcR8BUEx06kWYNPS | canceled | D apostrophe and accent kid name (order ejjrgpzv3p) |
| payment_intent | pi_3UV2UsKORcR8BUEx1MmnNBUS | canceled | D injected amount fields ignored (order wb2fq6u56m) |
| payment_intent | pi_3UV2ePKORcR8BUEx0mK7uOa9, pi_3UV2eRKORcR8BUEx0CQS5kz3, pi_3UV2eRKORcR8BUEx0DkXUG2Z, pi_3UV2eSKORcR8BUEx1z3IDbon, pi_3UV2eTKORcR8BUEx0zjox2C2 | canceled | D rate limit calls 1 to 5 (6th returned 429, no PI) |
| payment_intent | pi_3UV2oBKORcR8BUEx1O5UrgHD | canceled | D spoofed IP header call (order beg2khn3g7) |

## Sentry regression run (Stripe test mode + Neon test, branch deploy at 1dba0f6), 2026-10-27 UTC

No succeeded PIs. 13 PaymentIntents created, all verified canceled via the Stripe API (`evidence/sentry-regression/pi-status.txt`). Neon rows: emails `team+s1test-reg-*@ekuzo.gg` (pending orders, kids Ivy 11, `s1pi:*` rate-limit keys, events). One browser invite-remove call on code 75701491 cleared only the visitor cookie.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UV3KLKORcR8BUEx1TxLXqFs | canceled | Check 1 browser commit, decline 4000 0000 0000 0002 then 3DS fail 4000 0027 6000 3184 on the same PI |
| payment_intent | pi_3UV3aZKORcR8BUEx0Usk0B0v, pi_3UV3aaKORcR8BUEx01c0ceY2, pi_3UV3abKORcR8BUEx1UduOPGB, pi_3UV3acKORcR8BUEx1O0cs1tT, pi_3UV3adKORcR8BUEx0FUNoEvY, pi_3UV3aeKORcR8BUEx0SCmtv6X | canceled | Check 7 run 1 (6 valid calls, split across two egress IPs) |
| payment_intent | pi_3UV3kFKORcR8BUEx1axxkOT6, pi_3UV3kGKORcR8BUEx0ioGBJRN, pi_3UV3kHKORcR8BUEx0ndBz9Yx, pi_3UV3kIKORcR8BUEx1UA3lpuE, pi_3UV3kIKORcR8BUEx1mdjS9WB, pi_3UV3kJKORcR8BUEx0sw42xbS | canceled | Check 7 run 2 (6 valid 200s; the 7th call returned 429, no PI) |

## Sentry smoke run (Stripe test mode + Neon test, branch deploy at ddf7387), 2026-10-27

No succeeded PIs. One PaymentIntent created, verified canceled via the Stripe API. Neon row: email `team+s1test-smoke-49hw09@ekuzo.gg`, pending order 5mqu6g9d3n (flags age_edge), kids Ada 9 and Max 12, `s1pi:*` rate-limit key, events.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UV4BDKORcR8BUEx1BhgxsTi | canceled | Smoke check 2, decline 4000 0000 0000 0002, age 9 kid, age_edge flag verified |

## Final test 2026-10-29 (Sentry, Stripe test mode + Neon test, branch deploy at e1bbe5e)

Run tag `5bc894`, 13:16 to 13:30 UTC. Analytics guard: every Playwright context aborted and logged requests to GA4 collect, Clarity collect,
facebook.com/tr, connect.facebook.net and Google Ads collectors (fail closed, details in `final/04-final-test-ledger.md`). Before the guard
covered Google Ads, 3 smoke page views of /season1/join let Google Ads pings and two www.google.com/g/collect hits reach production GA4
(G-8LM45PX53W) and Ads (18509911105); page views only, no purchase events. Server side: `meta_purchase` (CAPI, forced test code) and Klaviyo
events were sent for the three paid orders below.

Neon rows: emails `team+s1test-ft1029-j1-5bc894@ekuzo.gg`, `...-j2-5bc894@`, `...-j3-5bc894@` with families, kids (Juno 12, Pax 9, Wren 10,
Odin 14), orders, items, codes 19341455 (void after refund), 18424530, 33847723, referral 9a5c7ebb-89ee-4287-8b0f-3474a5b07aa2 (pending), events,
outbox rows and `s1pi:*` rate-limit keys. `...-j4-5bc894@` made only 422 calls (no rows). Klaviyo test profiles now exist for the
j1, j2 and j3 emails (Committed, Friend Joined, Refunded events). The `S1_DB_TESTS=1` run added its own tags (`ab98a70f80` db suite,
`ab25be2c` referral suite, `121b0fe8*` emails) and reused the J3 family as inviter: referrals 10112eca-17b4-4b81-9876-db61f5426d0b (void) and
f64ca14f-5e02-4aea-a7bb-53f6e1ddf2ac (pending) on code 33847723.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UVtDaKORcR8BUEx0umHVNCH | succeeded $100, fully refunded (re_3UVtDaKORcR8BUEx0J1ntIYU) | J1 cold buyer, order jevscw9fec (cus_VWx7GmhQPjCFwY); J5 refund via s1-refund --apply |
| payment_intent | pi_3UVtEtKORcR8BUEx0Mk5hwFA | succeeded $100 (not refunded) | J2 friend via /crew/19341455, order ncbznh28n2, age 9 |
| payment_intent | pi_3UVtFpKORcR8BUEx10ZewxtA | succeeded $180 (not refunded) | J3 siblings, order xuj5r2j5kk (cus_VWxALKt1iSE97r) |
| payment_intent | pi_3UVtKaKORcR8BUEx0ctCskKc | succeeded $100, fully refunded (re_3UVtKaKORcR8BUEx0kqnyqAV 6000 + re_3UVtKaKORcR8BUEx0VTHagN6 4000) | J10 money.integration suite, order kfpkhmefsy |
| payment_intent | pi_3UVtKRKORcR8BUEx15oYB3kZ | succeeded $100, fully refunded (re_3UVtKRKORcR8BUEx1n4S05T9) | J10 invite.integration suite, order unytmkjkxn |
| payment_intent | pi_3UVtL2KORcR8BUEx15jvaSXo | succeeded $1.60 (metadata product season1_offsession_test) | J10 money.integration off-session charge |
| payment_intent | pi_3UVtL6KORcR8BUEx0fMaYAkz, pi_3UVtL4KORcR8BUEx1h5QljOz | canceled by Sentry (were left requires_payment_method) | J10 money.integration off-session failures |
| payment_intent | 21 more (all `season1`, all canceled by the suites): pi_3UVtLGKORcR8BUEx0Kb1EZNL, pi_3UVtLFKORcR8BUEx05OK4qIR, pi_3UVtLFKORcR8BUEx1EUWqlAn, pi_3UVtLEKORcR8BUEx1cJTbnEW, pi_3UVtLEKORcR8BUEx0QkoSXtR, pi_3UVtLDKORcR8BUEx0HL5ybLt, pi_3UVtL7KORcR8BUEx17pMEEFn, pi_3UVtL7KORcR8BUEx0cU1zvgm, pi_3UVtL6KORcR8BUEx0lGvPnEz, pi_3UVtL1KORcR8BUEx0pWIfQnK, pi_3UVtKrKORcR8BUEx0lewFk0d, pi_3UVtKWKORcR8BUEx1vF9l5I4, pi_3UVtKVKORcR8BUEx05LJ2fqO, pi_3UVtKVKORcR8BUEx1vx6xKle, pi_3UVtKUKORcR8BUEx16HiCoTK, pi_3UVtKTKORcR8BUEx0zbUnJeY, pi_3UVtKTKORcR8BUEx0mQ6SCCm, pi_3UVtKNKORcR8BUEx0TgenS0L, pi_3UVtKMKORcR8BUEx0pK8Dp3U, pi_3UVtKMKORcR8BUEx0F3ZVmgF, pi_3UVtKLKORcR8BUEx1G3o19IZ | canceled | J10 integration suites (declines, 3DS, pricing, rate limit, invite cases); full list in `final/evidence/J10-integration-stripe-objects.json` |

Legacy dev endpoint side effects: the six succeeded PIs above (pi_3UVtDa, pi_3UVtEt, pi_3UVtFp, pi_3UVtKa, pi_3UVtKR, pi_3UVtL2) also reached
we_1TMYx4KORcR8BUExWqrM0dBF on dev--ekuzo (origin/dev 1ab7255 still has no legacy guard), with the same empty-email camps caveat as above.

F1 retest (same section, 2026-10-29 13:36 to 13:45 UTC, branch deploy serving 6efd3c7). Neon rows: email `team+s1test-ft1029-r2-5bc894@ekuzo.gg`
(parent Mara, kids Ivy 11 committed and Theo 13 refunded), order q5rdu354p2 partially_refunded, family 206c4565-b080-4324-b592-3af62e0f45d4,
code 36777976, events, outbox rows (`klaviyo_committed`, `meta_purchase`, `discord_commit`, `klaviyo_refunded`). The J1 recheck made no new objects.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UVtVjKORcR8BUEx1Q8mxsH4 | succeeded $180, partially refunded $80 | F1 retest two-kid order q5rdu354p2 (cus_VWxQ9OKoDWZVHv) |
| refund | re_3UVtVjKORcR8BUEx1q4F6cwK | succeeded $80.00, metadata s1_kid_id (Theo) | F1 retest partial refund via `s1-refund --kid Theo --apply` |

This succeeded PI also reached the unguarded legacy dev endpoint we_1TMYx4KORcR8BUExWqrM0dBF (same caveat as above).

## Canary fix verification 2026-10-29 (Jamie's Claude, Stripe test mode + Neon test, branch deploy at c4e1afc and f829fc8)

Run tag `cf10291156`, about 16:55 to 17:05 UTC. Playwright Chromium with an analytics guard (GA, Google Ads, Clarity and Meta requests answered 204 locally; only `googletagmanager.com/gtag/js` was requested). Server side, the paid order went through the normal webhook path, so expect the same side effects as earlier test orders: a Klaviyo "Season 01 Committed" event and test profile for the email below, outbox rows, a family code, and (as with the earlier runs) a copy of the succeeded PI event on the unguarded legacy dev endpoint we_1TMYx4KORcR8BUExWqrM0dBF.

Neon rows: email `team+s1test-canary-cf10291156@ekuzo.gg` (parent Mara, kids Juno 12 and Pax 9), order 54pymwd4hx paid; email `team+s1test-canary-cf10291156-warm@ekuzo.gg` (parent Mara, kid Wren 10), order frw9qxnrjk left pending (two direct commit calls to measure warm Server-Timing; the second reused the first's PaymentIntent). Emails `...-canary-cf1029r2@` and `...-canary-busy@` made no server rows (no card, and a commit request held and aborted in the browser).

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UVwczKORcR8BUEx1chXqjzd | succeeded $180, card 4242 (`wallet: null`), not refunded | Canary fix end to end, two kids, order 54pymwd4hx (cus_VX0ek8LERsEczw) |
| payment_intent | pi_3UVweIKORcR8BUEx0Ws3vVgc | requires_payment_method $100, never confirmed | Warm Server-Timing measurement, order frw9qxnrjk (pending) |

Canary fixes check (same section, 2026-10-29 about 17:03 to 17:10 UTC, branch deploy with c4e1afc, f829fc8, ab5275e). Neon rows: emails
`team+s1test-ft1029-c1-5bc894@ekuzo.gg` (Quinn, kid Nova 12; order kzxj7k6dus paid; the removed sibling Remy was never committed),
`...-c2-5bc894@` (Ines, kid Sol 11; order paepgbzfh2 pending after the decline), `...-c4-5bc894@` (Vera, kid Kit 11; order jnspauyn8a paid,
referral pending on code 18424530), `...-c3-5bc894@` (one 422 call, no rows), with families, codes 68556428 and 38311629, events, outbox rows
and `s1pi:*` rate-limit keys. Klaviyo test profiles will exist for the c1 and c4 emails.

| Object | Id | Final state | Purpose |
|---|---|---|---|
| payment_intent | pi_3UVwmIKORcR8BUEx0B2s5F3m | succeeded $100 (not refunded) | Canary check: persistence, one-kid end to end, draft cleared (cus_VX0n1Px1sn11iU) |
| payment_intent | pi_3UVwnPKORcR8BUEx1eE30LmT | succeeded $100 (not refunded) | Canary check: friend link via /crew/18424530 (cus_VX0pNZvxqpFDxY) |
| payment_intent | pi_3UVwmSKORcR8BUEx0aBoxEhC | declined (4000 0000 0000 0002), then canceled by Sentry | Canary check: busy state restore on error, order paepgbzfh2 |

Both succeeded PIs also reached the unguarded legacy dev endpoint we_1TMYx4KORcR8BUExWqrM0dBF (same caveat as above).
