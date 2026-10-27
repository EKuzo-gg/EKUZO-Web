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
