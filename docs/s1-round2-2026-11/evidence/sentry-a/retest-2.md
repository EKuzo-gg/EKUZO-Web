# Sentry A retest 2 at 1fba3ec (build/s1-round2)

| Item | Result | Evidence |
|---|---|---|
| SA-9 repro on real Postgres 16, claim SQL extracted verbatim from route.ts (5 parameters now) | PASS: one known email, 60 fresh eventIds each posted twice from one IP: all 120 classify `repeat`, 0 `retry`, 0 `new`; IP counter stays 1; a repeat inserts `rp-<ev>` and never the ev row | retest2-pg.txt |
| SA-9 at route level (scratch fake DB mirrors the new SQL) | PASS: 120 posts give 0 extra Meta Leads and 0 extra full Waitlist events, ip count 1 (R3) | retest2-adversarial.txt |
| SA-1 returning parent's steps | PASS: text-karlin and games with the repeat's eventId are written (E4, R2); a second post of the same repeat still reads repeat; a wrong eventId is still dropped; step-lock SQL on Postgres accepts an rp key and an ev key | retest2-pg.txt, retest2-adversarial.txt |
| A real retry (same email and eventId as a new sign-up) | PASS: reads `retry` on Postgres; at route level re-runs the full path once with the same event_id (1 Waitlist event, 1 Lead), IP count unchanged (R4) | retest2-pg.txt, retest2-adversarial.txt |
| Stranger, random eventId, no sign-up | PASS: all three steps, with and without eventId, silent `200 {ok:true}`, nothing written (R1); no row on Postgres | retest2-adversarial.txt, retest2-pg.txt |
| IP counting and races | PASS: 31 new + 20 repeats leave the counter at 31; same-email race gives one new, one repeat (rp claimed), IP count 1 | retest2-pg.txt |
| All earlier scratch runs | PASS: 30 of 30 | retest2-adversarial.txt |
| `npm test` | PASS: 575 tests, 574 pass, 0 fail, 1 skipped | npm-test-1fba3ec.txt |

Postgres stopped by PID; no stray process. SA-9 closed; SA-1, SA-3, SA-4, SA-9 are all fixed.
