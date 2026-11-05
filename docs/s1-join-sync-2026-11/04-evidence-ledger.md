# 04 Evidence ledger (Auditor merge, phase 4/5, build 585617b, 2026-11-05)

Status: PASS, FAIL, OPEN (human). Verified-by is never the author. Evidence paths are relative to this folder.
Sentry A retest cycle 1 (`evidence/sentry-a/retest-1.md`, route 16b2a33, HEAD e03d62d) closed SA-1 to SA-3. Protected-path diff and secret and dash lints were run on 585617b, not re-run on e03d62d: Sentry A should re-run them at the final HEAD before sign-off.

| Requirement | Test | Evidence path | Status | Verified-by |
|---|---|---|---|---|
| R1.1 | /join vs /join/b byte-identical, 3 request shapes, open and closed | evidence/sentry-a/curl/summary.txt, states.txt | PASS | Sentry A |
| R1.2 | `?src=email` rides to signup link, `?src=junk` dropped | evidence/sentry-a/curl/summary.txt | PASS | Sentry A |
| R1.3 | open, closed, off renders equal B; jersey cutoff by unit tests (not clock-testable) | evidence/sentry-a/states.txt, npm-test.txt | PASS | Sentry A |
| R1.4 | mutation: edit one template copy, 6 of 7 fail, restore passes | evidence/sentry-a/mutation.txt | PASS | Sentry A |
| R1.5 | join.html deleted, no runtime reference, four tests repointed | evidence/sentry-a/r15-grep.txt | PASS | Sentry A |
| R1.6 | rendered visible text diff /join vs /join/b empty | evidence/sentry-a/text/diff-result.txt | PASS | Sentry A |
| R1.7 | headers equal /join/b and equal c1f01e6 | evidence/sentry-a/curl/headers-compare.txt | PASS | Sentry A |
| R1.8 (build) | `route.js.nft.json` lists b/join-b.html | evidence/sentry-a/nft.txt, build.txt | PASS | Sentry A |
| R1.8 (deploy) | after deploy, curl both routes 200 and equal body hash | none yet (post-deploy) | OPEN (human) | Jamie or Claude after deploy |
| R2.1 | normalizeAd table; hotfix 14-input check | evidence/hotfix/normalize-ad.txt, evidence/sentry-a/npm-test.txt | PASS | Sentry (hotfix), Sentry A |
| R2.2 | d19 on event, profile, CAPI `content_name` (main and Text Karlin) | evidence/sentry-a/npm-test.txt | PASS | Sentry A |
| R2.3 | DOM: no `company` name or id; `ekz_hp` with all attributes | evidence/hotfix/results.md (4b), browser.txt | PASS | Sentry (hotfix) |
| R2.4 | two-hunk diff; `collect()` posts company "" empty, "x" filled; commit route and validate unchanged; 8ce0e17 and 585617b signup.html identical | evidence/hotfix/results.md (1, 4c, 5a, 5b), evidence/sentry-a/protected-diff.txt | PASS (harness caveat: submit stubbed, pay() called directly) | Sentry (hotfix), Sentry A |
| R3.1 | lock then claim in one transaction; real Postgres 16: lock serializes, no lock double-claims | evidence/sentry-a/pg/concurrency.txt, real-sql.txt, npm-test.txt | PASS (Neon HTTP driver and prod env not proven, see H2) | Sentry A |
| R3.2 | repeat shape, no profile props, no Lead; SA-1 (failed first sign-up keeps the claim) closed by release on failure; SA-3 closed (Repeat sends no first_name) | evidence/sentry-a/retest-1.md, adversarial-retest1.txt, pg/release.txt, npm-test-retest1.txt | PASS | Sentry A |
| R3.3 | fail open per mode; honeypot and three steps skip the check | evidence/sentry-a/npm-test.txt, adversarial.txt (A5, A6, A9) | PASS | Sentry A |
| R3.4 | `unique_id` with and without eventId; malformed eventIds | evidence/sentry-a/npm-test.txt, adversarial.txt (A1) | PASS | Sentry A |
| R3.5 | test holds the subscribe and requires the CAPI call to start first; header states 6.8 s (SA-2 closed; SA-6 notes the failure path can exceed it) | evidence/sentry-a/retest-1.md, npm-test-retest1.txt | PASS | Sentry A |
| R3.6 | repeat: zero fbq Lead, generate_lead, clarity signup | evidence/sentry-b/c2-landing.json | PASS | Sentry B |
| R3.7 (eventId) | eventId per email, case and spaces; new email re-arms Lead guard | evidence/sentry-b/c2-landing.json, c3-popup.json | PASS | Sentry B |
| R3.7 (savedEmail) | clearing the landing `savedEmail` on a different email | none: not named in Sentry B results | OPEN (no evidence) | needs Sentry B check |
| R3.8 | tap burst, Enter plus click, dblclick give one POST (landing and popup) | evidence/sentry-b/c2-landing.json, c3-popup.json | PASS | Sentry B |
| R3.9 | joined flag after new, retry, repeat; setItem throwing swallowed | evidence/sentry-b/c2-landing.json | PASS | Sentry B |
| R3.10 | popup repeat: flag set, done, no lead call | evidence/sentry-b/c3-popup.json | PASS | Sentry B |
| R3.11 | unit suite: classes, fail-open modes, honeypot and steps, `+`, 24 h on query text and real Postgres, lock order, response keys | evidence/sentry-a/npm-test.txt (509 tests, 508 pass, 1 skipped), pg/boundary.txt | PASS | Sentry A |
| R4.1 | `before-probe.json` names shifting nodes (`section#join-top.join`); before numbers reproduced | evidence/cls/before-probe.json, evidence/sentry-b/cls-before-375.json | PASS | Sentry B |
| R4.2 | 375 px, 7 runs: d11, d16 to d21, d1 hero=none, no ad all at 0.0013 or less; d2, d4, d19&hero=games unchanged; 1440 unchanged. d12 to d15 not in the run (see gaps) | evidence/sentry-b/cls-after-375.json, cls-after-1440.json | PASS | Sentry B |
| R4.3 | 16 before/after pairs, 0.0000 % differing pixels | evidence/sentry-b/parity.json, screenshots/sentry-landing-* | PASS | Sentry B |
| M1 | retry keeps eventId, one Lead; browser: abort then success, one Lead, one generate_lead | evidence/sentry-b/c2-landing.json, evidence/sentry-a/npm-test.txt | PASS (server-failure variant is SA-1) | Sentry A, Sentry B |
| M2 | different email gets new eventId and own Lead | evidence/sentry-b/c2-landing.json, adversarial.txt (A4) | PASS | Sentry A, Sentry B |
| M3 | Pixel and CAPI share event_id | evidence/sentry-b/c2-landing.json, evidence/sentry-a/npm-test.txt | PASS | Sentry A, Sentry B |
| M4 | fail-open never blocks; new after 24 h 01 m on real Postgres; failed first sign-up releases its claim | evidence/sentry-a/pg/boundary.txt, pg/release.txt, retest-1.md | PASS | Sentry A |
| M5 | load, autofill, focus fire no form_start or Lead; touch scroll on email field | evidence/sentry-b/c2-landing.json | PASS | Sentry B |
| M6 | server: repeat keys only ok and repeat, Lead has no name or kid data | evidence/sentry-a/npm-test.txt | PASS (server). Client payload scan of GA4 and Pixel not stated | Sentry A |
| M7 | honeypot with a seen email: silent ok, zero DB, Klaviyo, Meta calls | evidence/sentry-a/adversarial.txt (A9, A10) | PASS | Sentry A |
| J1 | in-app UA 375, d19 plus UTMs, main POST and Text Karlin carry ad d19 | evidence/sentry-b/c4-journeys.json, screenshots/sentry-j1-375-confirmation-inapp.png | PASS | Sentry B |
| J2 | landing sign-up (new, repeat) then /blog: no popup in 5 s, flag set | evidence/sentry-b/c3-popup.json | PASS | Sentry B |
| J3 | route tests: repeat inside 24 h, new after 24 h | evidence/sentry-a/pg/boundary.txt | PASS (route level); second device is H2 | Sentry A |
| J4 | `/join?src=email` CTA hrefs keep src, signup loads with `ekz_hp`, junk src dropped. UTMs stay in address bar, not asserted past the click. Stripe checkout is zero diff | evidence/sentry-b/c4-journeys.json | PASS | Sentry B |
| J5 | `/karlin` 307 to `/season1/join/b?src=karlin` unchanged; b/, jersey/, next.config.mjs zero diff | evidence/sentry-a/karlin-j5.txt, protected-diff.txt | PASS | Sentry A |
| Non-regression | protected paths zero diff (checked at 585617b); full npm test, 515 tests, 514 pass at the retest HEAD e03d62d; tsc clean on a clean copy (stale .next/types is SA-5) | evidence/sentry-a/protected-diff.txt, npm-test.txt, tsc-clean-copy.txt | PASS | Sentry A |
| Console | 16 page/viewport pairs identical to baseline; only pre-existing 404s (SB-3) | evidence/sentry-b/c1-console.json | PASS | Sentry B |
| Secrets and dashes | no key-shaped strings, no em or en dashes in added lines | evidence/sentry-a/secret-scan.txt, dash-lint.txt | PASS | Sentry A |
| Measurement rows (code) | tags from `lib/season1/tags.ts` per page; D1 label; calls observed via recorder stubs (real tags never load on localhost, SB-5) | evidence/sentry-a/npm-test.txt, evidence/sentry-b/c2-landing.json | PASS (stub level) | Sentry A, Sentry B |
| Measurement rows (live tags) | GA4, Pixel, Clarity, Klaviyo and Events Manager show the real events | none yet | OPEN (human), H2 | Jamie |
| Repeat metric | Klaviyo: one `Season 01 Waitlist` plus one `Season 01 Waitlist Repeat`, no flow triggers on the Repeat metric, readout counts Waitlist only | none yet | OPEN (human), H2 | Jamie |
| Steward review | /join is a faithful clone; money numbers agree with `offer.ts`; APPROVE for release | steward-review.md | PASS | Steward |
| Steward S1, S4 | "Four friends, free season" one-kid-only; "first 100" uncapped | 03-decision-log.md D19 | PASS (decided: stays) | Jamie |
| Steward S5 | season-end wording and May 6 row | 03-decision-log.md D18 | PASS (decided: stays) | Jamie |
| Steward S2, S3, S6, S8 | season line dropped from offer card; "custom" jersey vs terms; late-Nov gear check; open-state screenshots showed closed state (Sentry A and B covered open state on a test-mode server) | steward-review.md | OPEN (human), site state for Jamie and Aaron, not build | Jamie |
| Steward S7 | /join and /join/b share the `variant:'b'` label | 03-decision-log.md D1 | PASS (decided) | Jamie |
| Parent review | would continue on the email page and give an email on the ad page; no layout jump on the ad page; repeat visit shows the same confirmation and a second POST (D13); "weekly" vs "2x a week" clash (D20) | parent-review.md, 03-decision-log.md D13, D20 | PASS | Parent |
| D15 awareness | review guide lists what /join drops vs old A; Jamie acknowledges | none yet | OPEN (human) | Jamie |
| Cleanup | production test writes listed (hotfix proof: Klaviyo profile and one Meta Lead) | 06-cleanup-ledger.md | PASS (listed; one test Lead cannot be deleted) | Sentry (hotfix) |
| H1 | real phone, d19 Instagram link, no hero jump | none yet | OPEN (human) | Jamie |
| H2 | production d19 sign-up twice 60 s apart plus second device; check function log for "Season 01 dedupe check skipped"; one Waitlist event, one Repeat, one Lead | none yet | OPEN (human) | Jamie |
| H3 | real-device autofill on `/season1/join/signup` with a saved company and address | none yet | OPEN (human) | Jamie |
