# SAVE_SQL and migration 0006 on the Neon test branch (ep-lively-boat-b4fak1h6)

Run 19:43 CT 2026-11-12 from Jamie's machine over Neon's SQL-over-HTTP endpoint, with the statement text extracted from `lib/season1/betaWizard.ts` (sha256 of the extracted text 98d0a69e…, migration f7f1f662…). Author-run (Fable); Sentry repeats it through the deployed route.

```
migrate: create table if not exists s1_beta_families ok
migrate: create table if not exists s1_beta_players ok
migrate: create index if not exists s1_beta_players_family_id_idx ok
record: ok   (0006_season1_beta.sql in s1_migrations on the TEST branch)
1 new      new_family t, new_player t, prev_event_id '',     players 1
2 retry    new_family f, new_player f, prev_event_id 'ev-1', players 1   (same player id)
3 sibling  new_family f, new_player t, prev_event_id '',     players 2
4 edit     new_family f, new_player f, prev_event_id 'ev-1', players 2   (same player id as 1)
family: source karlin-email (first submission's; the sibling's 'other' did not replace it), livemode f
players: Maya 13, submissions 2, last_event_id ev-3 | Leo 9, submissions 1, source other
```

Test rows: family email `team+s1test-1112-sql1@ekuzo.gg` (cleanup ledger C1).
