# Sentry A retest, cycle 1 (route 16b2a33, HEAD e03d62d)

No source or test file edited. Full `npm test`: 515 tests, 514 pass, 0 fail, 1 skipped (was 509/508; six new tests) in `npm-test-retest1.txt`.

| Item | Result | Evidence |
|---|---|---|
| SA-1 repro (scratch A11 inverted): first attempt 502, same email with a new eventId | CLOSED: response `{ok:true}`, event is `Season 01 Waitlist` with `season1_ad: d19`, one Lead (before: repeat, no Waitlist, no Lead) | adversarial-retest1.txt, adversarial-retest1.test.ts.txt (my scratch mock needed a delete handler; the repo test has one) |
| SA-1 on real Postgres 16: claim, simulated failure, release, reclaim | CLOSED: claim {em,evA} sees nothing; release leaves 0 rows; reclaim {em,evB} sees nothing (new); next attempt sees em (repeat); release does not touch rows older than 24 h | pg/release.txt |
| SA-1 repo tests | assert the claim: "a failed first sign-up releases its claim, so a new eventId is 'new' again" (checks the delete query, its keys, empty seen set, then a new eventId gives `{ok:true}`, a Waitlist event and a Lead); "a thrown event (timeout) also releases the claim and returns 502"; "a release query failure still returns the 502 and logs no email"; "a failed retry releases nothing" | npm-test-retest1.txt |
| SA-2 | CLOSED: "subscribe and the Meta Lead are both started before either resolves (R3.5)" holds the subscribe response and requires the CAPI call to have started; a sequential refactor would wait for the 1 s deadline and fail | npm-test-retest1.txt |
| SA-3 | CLOSED: "the Repeat event sends no first_name; the Waitlist event still does" asserts `first_name` is "Pat" on the Waitlist event and absent from the Repeat profile attributes | npm-test-retest1.txt |

New observations (not blocking): SA-6 low. `releaseClaim` has no timer of its own (only the 8 s driver timeout), so on a Klaviyo failure plus a slow database the 502 path can exceed the header's 6.8 s budget (0.8 + 3.5 + up to 8). It runs only after a failure. A claim whose transaction commits after the 800 ms fail-open cap is not in `claimed` and is not released; same exposure as before, rarer.
