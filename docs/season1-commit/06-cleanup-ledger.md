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
| pi_3UV1u1KORcR8BUEx09uSBhMT | created 23:22:25, succeeded 23:22:33 CT (2026-10-27 04:22 UTC) | $100.00 | Sentry slice 1 branch-deploy browser run (one payment; email team+s1test-sentry-8rjois@ekuzo.gg) |

Sentry also left two pending PaymentIntents (pi_3UV1tQKORcR8BUEx11S9qhAS decline test, pi_3UV1x8KORcR8BUEx1QE259xP failed 3DS), both canceled via the API. Neon test rows for team+s1test-sentry-* emails remain (test branch).

Each also reached the S1 test endpoint we_1UUzlTKORcR8BUExui4NsZnU on the branch deploy, which writes to the
same Neon test branch (idempotent; harmless).
