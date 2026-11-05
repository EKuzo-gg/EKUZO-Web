# Relay self-test

Self-testing is necessary, not final. Sentry verifies independently.

## What changed

- `app/api/season-one/route.ts`
  - `classifySignup(email, eventId)` in the same file: one `getSql().transaction([...])`, first `pg_advisory_xact_lock(hashtext(<email key>))`, then one statement that reads the seen keys in the last 24 h and claims the unseen ones (`on conflict do nothing`, `livemode = keyIsLive()`). Keys `s1wl:em:<keyHash(email)>` and `s1wl:ev:<keyHash(email|eventId)>`. 800 ms `Promise.race`; any throw or timeout gives "new" and `console.warn("Season 01 dedupe check skipped:", reason)` (no email).
  - Order in `POST`: email, key, step, steps, honeypot, `classifySignup`.
  - `unique_id` is `email-metric-eventId` with a sanitized `eventId` (shared `cleanEventId`, also used by CAPI), else the timestamp form.
  - repeat: `Season 01 Waitlist Repeat` with the same event props and `{}` profile props, subscribe, no CAPI, `{ok:true, repeat:true}`; a failed or thrown Repeat event is logged and still returns repeat.
  - new and retry: subscribe (now a never-throwing helper) and `sendMetaLead` run in `Promise.all` after the event succeeds.
  - Header comment: order, three classes, budget 0.8 + 3.5 + 2.5 = 6.8 s.
- `lib/season1/__tests__/seasonOneRoute.test.ts` (new, 20 tests). Mocks `fetch` for neon.tech (in-memory `s1_rate_limits`), Klaviyo and Graph. DB URL built by concatenation; no secret-shaped fixtures.

## Coverage

| Requirement | Test name (prefix) |
|---|---|
| R3.1 classes, lock then claim in one transaction | "new: full path...", "the lock statement precedes the claim...", "retry (same email, same eventId)...", "repeat (same email, new eventId)...", "no eventId: only the email key..." |
| R3.2 repeat shape, no profile props, no Lead | "repeat (same email, new eventId)...", "a failed Repeat event is logged..." |
| R3.3 fail open: no URL, throw, timeout, keyHash throw; steps and honeypot skip the check | "fail open: no DATABASE_URL...", "fail open: a database error...", "fail open: a check slower than 800 ms...", "fail open: keyHash throwing...", "honeypot and the games, age and text-karlin steps never call the check", "bad email and unknown step..." |
| R3.4 unique_id | "Waitlist unique_id is email-metric-eventId..." |
| R3.5 concurrent subscribe and CAPI, header | covered by the "new" and "retry" tests (both happen, one each); `Promise.all` is in the route; header comment edited. Concurrency itself is not timed in a test. |
| R3.11 `+` hashing, 24 h interval in SQL, response keys | "'+' addresses hash like any other address", "the 24 h boundary lives in the SQL...", "repeat payloads carry no profile data (M6)", body assertions in new/repeat |
| R2.1 normalizeAd table | "normalizeAd table through the sign-up..." (route does not export it, so it is tested through the event and profile `ad`) |
| R2.2 d19 on event, profile and Lead `content_name` | "R2.2: a main sign-up and a Text Karlin step with d19..." |
| M1 retry gives one Lead per attempt id | "retry (same email, same eventId)..." (same `event_id` to Meta, `unique_id` from `eventId`) |
| M3 shared `event_id` | "the Lead keeps the shared event_id and a hashed email only" |
| M4 fail open, 24 h in SQL | the fail-open tests and "the 24 h boundary lives in the SQL" |
| M6 no kid data, repeat adds none | "repeat payloads carry no profile data (M6)", "the Lead keeps the shared event_id and a hashed email only" |
| M7 honeypot writes nothing | "honeypot and the games, age and text-karlin steps never call the check" |

## Results

- `npm test`: 508 tests, 508 pass, 0 fail (three consecutive runs). Output in `npm-test.txt`.
- `npx tsc --noEmit -p .`: exit 2, three errors, all in generated `.next/types/app/api/season1/{commit,stripe-webhook,warm}/route.ts` about non-handler exports (`LIMITS`, `CARD_TESTING_FAILURES`, `WARM_EVERY_MS`) in routes I did not touch. None in my files. Output in `tsc.txt`. Not checked against `147897a` here (no git commands allowed), so "pre-existing" is an inference.

## Could not do or note

- No Postgres here: the lock's concurrency and the real SQL are proven only by query text and order (D16) and by H2. The mock honors the claim statement's contract, it does not execute it.
- The Neon driver sends the `text[]` parameter as a Postgres array literal (`{"a","b"}`); the test parses that. Not run against real Postgres.
- An early version of the test crashed the node test runner in the full `npm test` (stdout interleaving); the suite now silences console output while it runs.
- Left as is: the existing `console.error("KLAVIYO_PRIVATE_API_KEY not set ... lost:", email)` logs an email. It is the only record of a lost sign-up when the key is missing; say if you want it changed.

## Repair 1 (SA-1 to SA-3)

- SA-1: `classifySignup` now returns `{kind, claimed}` (the keys this request inserted). When a new or retry sign-up's `Season 01 Waitlist` event fails (non-ok or thrown), `releaseClaim(claimed)` runs one parameterized `delete from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours'` before the 502. A release error is warned without the email and never changes the 502. A retry inserted nothing, so it releases nothing. The advisory lock is only held inside the claim transaction, so a concurrent request can slip in between the claim and the release; the effect is limited to one extra "repeat" in that window and matches the fail-open stance.
- SA-2: test holds the subscribe response and asserts the CAPI call has started while subscribe is still pending.
- SA-3: the Repeat event passes no `firstName`; the Waitlist event still does.
- Tests added: "SA-1: a failed first sign-up releases its claim...", "SA-1: a thrown event...", "SA-1: a release query failure still returns the 502...", "SA-1: a failed retry releases nothing", "SA-2: subscribe and the Meta Lead are both started...", "SA-3: the Repeat event sends no first_name...".
- `npm test`: 514 pass, 0 fail (`npm-test-repair1.txt`). Not run against real Postgres.

## Repair 2 (SA-6)

- `releaseClaim` now races its delete against the same 800 ms timer as the claim; on timeout it warns ("Season 01 dedupe release failed: no answer in 800 ms", no email) and the 502 is unchanged. The 502 path is 0.8 + 3.5 + 0.8 s, inside the 6.8 s budget, so the budget line is unchanged.
- The header comment states the known gap in one line: a claim that commits after the 800 ms cap is not released, so that family's next attempt reads as a repeat (accepted risk).
- Test: "SA-6: a release slower than 800 ms is cut off...". `npm test` output in `npm-test-repair2.txt`.
