# Sentry A retest 1 at 701351a (build/s1-round2)

| Item | Result | Evidence |
|---|---|---|
| SA-1 repeat then step with the repeat's eventId | PASS: E4 now writes the Text Karlin event (1 event); games and text-karlin after a repeat both written; a wrong eventId is still dropped | retest1-adversarial.txt (E4 RESULT), retest1-adversarial.test.mts.txt (the scratch fake DB was updated to mirror the new claim SQL) |
| SA-1 on real Postgres 16, claim SQL extracted verbatim | PASS: repeat (em1, ev2) returns `seen em1`, inserts ev2, IP counter unmoved; retry of the repeat sees em1 and ev2; 31 new + 20 repeats from one IP leave the counter at 31; same-email race gives one new, one repeat, both ev ids claimed, IP count 1 | retest1-pg.txt |
| Stranger, random eventId, no sign-up | PASS: games, age, text-karlin, with and without eventId, all `200 {ok:true}`, nothing written, 6 `step_dropped` warns (R1); no row exists for a random ev on real Postgres | retest1-adversarial.txt, retest1-pg.txt |
| SA-3 meta description | PASS: live-mode build, Host ekuzo.gg (`?src=x&utm_source=y`): "EKUZO Season 01: a coach-led youth gaming team for ages 9 to 17, online twice a week, mid January to May. $100 covers January, then $160 a month." 145 characters, no double period; Course description and Offer description also free of `..` | retest1-s3.txt |
| SA-4 Offer wording | PASS: "$100 covers January, then $160 a month February to April, per kid. Siblings are 20% off." No "today" | retest1-s3.txt |
| S3 regression | PASS: no robots meta, no x-robots-tag, canonical bare, price 580 USD, InStock, dates unchanged, /join and /join/b equal outside the SEO block | retest1-s3.txt |
| `npm test` | PASS: 573 tests, 572 pass, 0 fail, 1 skipped | npm-test-701351a.txt |
| All earlier scratch runs (A to I, 26 tests) | PASS (27 of 28 with the new tests; the one failing assertion is my R2 line expecting a re-posted repeat to read as repeat, which is SA-9) | retest1-adversarial.txt |
| NEW SA-9 (Medium): retry of a repeat runs the full new path | FAIL: 60 pairs of (known email, fresh eventId) from one IP give 60 Meta Leads and 60 profile-rewriting Waitlist events with the IP counter at 1 | retest1-adversarial-r3.txt, defect log SA-9 |

Servers (next start on 3191) and the local Postgres were stopped; no stray process. SA-1, SA-3, SA-4 fixed; SA-9 opened for Relay.
