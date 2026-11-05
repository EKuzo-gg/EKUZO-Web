# Sentry A results (server, tests, regression), branch 585617b

Base c1f01e6 (main), hotfix 8ce0e17, pre-build 147897a. Servers on 3110 (branch) and 3111 (c1f01e6) from copies under /tmp/claude-0, stopped after use. Test mode for open-state renders was forced at runtime with a placeholder `sk_test_` key and a fake `ep-lively-boat-b4fak1h6` DATABASE_URL (never contacted).

| Req | Result | Evidence |
|---|---|---|
| npm test (check 1) | PASS: 509 tests, 508 pass, 0 fail, 1 skipped (baseline 482, 481 pass) | npm-test.txt |
| tsc (check 1) | PASS on a clean copy (0 errors) and on clean c1f01e6 (0); the worktree run shows 3 errors from stale ignored .next/types (SA-5) | tsc.txt, tsc-clean-copy.txt, tsc-c1f01e6.txt |
| Non-regression, protected paths (check 2) | PASS: `git diff --stat c1f01e6 585617b` on b/, jersey/, welcome/, crew/, app/api/season1, next.config.mjs is empty; lib/season1 changes are only six files under `__tests__` | protected-diff.txt |
| signup.html 8ce0e17 vs 585617b (check 2) | PASS: identical (sha256 4ba02e72...) for join/signup and early-access/signup | protected-diff.txt |
| R1.8 trace | PASS: `route.js.nft.json` for /season1/join lists app/season1/join/b/join-b.html | nft.txt, build.txt |
| R1.1 | PASS: /join and /join/b byte-identical bodies for no query, `?src=email`, `?src=junk`, in open (test) and closed (off) mode, status 200 | curl/summary.txt, states.txt |
| R1.2 | PASS: `?src=email` gives `href="/season1/join/signup?src=email"`; `?src=junk` gives `/season1/join/signup`; same as c1f01e6's /join/b | curl/summary.txt |
| R1.3 | PASS for open and closed/off renders (identical to B); jersey cutoff state not clock-testable here, covered by unit tests in joinPage.test.ts (suite green) | states.txt, npm-test.txt |
| R1.7 | PASS: status and headers of /join equal /join/b and equal c1f01e6 /join and /join/b (ignoring Date and the cookie Expires): `x-robots-tag: noindex`, `cache-control: private, no-store`, `referrer-policy: origin`, `x-frame-options: DENY`, `x-content-type-options: nosniff`, same `ekuzo_origin` cookie | curl/headers-compare.txt, curl/*.hdr |
| B zero drift | PASS: branch /join/b body hash equals c1f01e6 /join/b for all six requests | curl/summary.txt |
| J5 /karlin | PASS: 307 `location: /season1/join/b?src=karlin` on branch and on c1f01e6; next.config.mjs zero diff | karlin-j5.txt |
| R1.5 | PASS: join/join.html deleted, no runtime reference; the four tests read b/join-b.html; only a test asserting absence names join.html | r15-grep.txt |
| R1.6 | PASS: visible text of rendered /join vs /join/b (scripts, styles and comments stripped, 114 lines each) diff is empty; raw bodies also byte-identical | text/join.txt, text/join_b.txt, text/diff-result.txt |
| R1.4 mutation proof | PASS: unmutated 7 of 7 pass; with /join reading a template copy with "Any skill level" changed to "levels", 6 of 7 fail (route code identical, template path, and all four body-equality cases); restoring passes | mutation.txt |
| R2.1, R2.2 | PASS: `normalizeAd table through the sign-up` and `R2.2: a main sign-up and a Text Karlin step with d19 ...` pass | npm-test.txt |
| R3.1 | PASS by test and on real Postgres 16: test "the lock statement precedes the claim in one transaction"; two concurrent same-email transactions serialize (B sees the email key), and without the lock both claim it | pg/concurrency.txt, pg/real-sql.txt |
| R3.2 | PASS: "repeat (same email, new eventId): Repeat event, no profile props, subscribe, no Lead, {ok:true,repeat:true}"; "a failed Repeat event is logged ..."; adversarial A7, A8 (502 and thrown fetch on repeat) | npm-test.txt, adversarial.txt |
| R3.3 | PASS: "fail open: no DATABASE_URL", "a database error", "a check slower than 800 ms", "keyHash throwing", "honeypot and the games, age and text-karlin steps never call the check"; adversarial A5 (getSql throws), A6 (900 ms), A9 (honeypot plus seen email stays silent 200, no DB call, no Klaviyo, no Lead) | npm-test.txt, adversarial.txt |
| R3.4 | PASS: "Waitlist unique_id is email-metric-eventId with a sanitized eventId, else today's timestamp form"; A1 (10 malformed eventIds, 64 cap) | npm-test.txt, adversarial.txt |
| R3.5 | FAIL (test gap, SA-2): code uses Promise.all and the header states 0.8 + 3.5 + 2.5 = 6.8 s, but no test asserts concurrency | defect log |
| R3.11 | PASS with SA-2 noted: new, retry, repeat, three fail-open modes, honeypot and steps, `+` hashing ("'+' addresses hash like any other address"), 24 h boundary on query text plus real Postgres check, lock before claim, response keys ("repeat payloads carry no profile data") | npm-test.txt, pg/boundary.txt |
| R3.6 to R3.10 | NOT CHECKED (browser lane B) | n/a |
| R4.x | NOT CHECKED (lane B) | n/a |
| M1 | PASS: "retry (same email, same eventId) ... one Lead per attempt id"; SA-1 is the related gap where the first request failed (502) and the next attempt has a new eventId | npm-test.txt, adversarial.txt A11 |
| M2 | PASS at server level: a different mailbox is new (A4); client eventId side is lane B | adversarial.txt |
| M3 | PASS: "the Lead keeps the shared event_id and a hashed email only" | npm-test.txt |
| M4 | PASS with SA-1: fail-open modes never block; after 24 h a sign-up is new (real Postgres at 24 h 01 m) | pg/boundary.txt |
| M6 | PASS at server level: repeat body keys are exactly ok and repeat; Lead carries no name or kid data | npm-test.txt |
| M7 | PASS: honeypot with a seen email returns silent `{ok:true}` with zero DB, Klaviyo and Meta calls; legacy `company` key no longer trips it (A10) | adversarial.txt |
| M5 | NOT CHECKED (lane B) | n/a |
| Adversarial extras (check 6) | PASS: A1 malformed eventId, A2 symbols-only eventId, A3 254-char and over-long emails, A4 plus addresses and case, A5, A6, A7, A8, A9, A10 | adversarial.txt |
| A11 | FINDING SA-1 | adversarial.txt |
| Secret scan (check 7) | PASS: no key-shaped strings in the added lines of `git diff c1f01e6 585617b`; only test names mentioning sk_test_ and pk_live_; the test DB URL is built by concatenation | secret-scan.txt |
| Dash lint (check 8) | PASS: no em or en dashes in added lines (code comments and docs); three spaced hyphens are SQL or arithmetic | dash-lint.txt |
