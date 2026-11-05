# 05 Defect log, Sentry lane A (server, tests, regression), 2026-11-05

Branch `build/s1-join-sync-funnel-fixes` at 585617b. Evidence: `evidence/sentry-a/`. Nothing in source or tests was edited.

| ID | Severity | Type | Requirement | Owner | Status |
|---|---|---|---|---|---|
| SA-1 | medium | code-bug | R3.1, R3.2, M4 | Relay | closed (retest cycle 1, 16b2a33) |
| SA-2 | low | code-bug (test gap) | R3.5, R3.11 | Relay | closed (retest cycle 1) |
| SA-3 | low | accepted-risk | R3.2 | Atlas or Relay | closed (retest cycle 1, first_name no longer sent on repeat) |
| SA-4 | low | infra-gap | D16, R3.1 | Relay | open |
| SA-5 | info | infra-gap | tsc evidence | Atlas | open |
| SA-6 | low | code-bug | R3.5 budget | Relay | closed (final pass, 56b24b9) |

## SA-1 (medium, code-bug): a failed first sign-up still claims the email, so the next attempt with a new eventId is a "repeat" and no Waitlist event, profile props or Lead ever land

Requirement: R3.1, R3.2, M4 (a failure must not cost the family their sign-up).

Cause: `classifySignup` inserts the email key and the attempt key in its transaction before the Klaviyo "Season 01 Waitlist" event is written. If the event then fails (HTTP 5xx, the 3.5 s timeout, or a thrown fetch), the route returns 502 but the claim stays for 24 h.

Repro (scratch test `evidence/sentry-a/adversarial.test.ts.txt`, A11, passes today and documents the behavior):
1. POST `{email: f@example.com, source: ad-landing, ad: d19, eventId: evt-f502-b001}` with the Klaviyo events endpoint returning 500: response 502, claim rows written.
2. POST the same email with `eventId: evt-f502-b002` (what a page reload, a second tab, the popup on another page, or another device sends; the in-memory `eventId` only survives inside one page session): response `{ok:true, repeat:true}`.
Result: a `Season 01 Waitlist Repeat` event with empty profile props plus the subscribe. No `Season 01 Waitlist` event, no `season1_*` profile props (`season1_ad`, `season1_joined_at`, `season1_source`), no CAPI Lead, and the landing fires no Pixel Lead or `generate_lead` (R3.6). The family looks subscribed but is invisible to the readout (it counts `Season 01 Waitlist`) and to Meta. A retry inside the same page session is fine (same `eventId` gives "retry", full path).
Likelihood: needs a Klaviyo failure or timeout on the first try, then a return with a fresh page session inside 24 h. Rare, but exactly the failure the 502 path exists for, and it is silent.
Suggested fix (for Relay, not applied): claim the email key only after the event succeeds (a second statement, or delete the two claim rows in the 502 branch), or on a 502 release the claim. Add a test for it.

## SA-2 (low, test gap): R3.5 concurrency is asserted only by the header comment

`subscribe` and `sendMetaLead` run under `Promise.all` in the code (route.ts, new and retry path), but no test proves they overlap (the evidence ledger row for R3.5 asks for a concurrency order test). A refactor back to sequential would pass every test and push the worst case from 6.8 s toward 9 s. Fix: a test with a Klaviyo mock that delays the subscribe and a Meta mock that records its start time before the subscribe resolves.

## SA-3 (low, accepted-risk): the Repeat event can change the profile's first_name

`event("Season 01 Waitlist Repeat", email, {}, eventProps, clean(body.firstName, 60), eventId)` passes `firstName`, which becomes `first_name` in the profile attributes of the events call. R3.2 says no profile prop overwrite of `season1_*`, which holds, but `first_name` can be overwritten by a repeat. Today the landing and popup do not send `firstName` (not verified in browser lane), so exposure is nil until a form sends it. Accept or drop the argument on the repeat call.

## SA-4 (low, infra-gap): unit tests cannot prove the SQL; I proved it on a scratch Postgres 16

D16 says no Postgres is reachable. A local Postgres 16 binary exists on this machine, so I ran the route's exact claim statement and lock with real concurrency (`evidence/sentry-a/pg/`): lock plus claim serializes two same-email transactions (B sees the email key, so it is "repeat"); the same two transactions without the lock both read "not seen" and both claim the email key (the failure the lock prevents); 23 h 59 m is still seen, 24 h 01 m is new and a fresh row is written (no primary key clash, since `window_start = now()` differs); retry and repeat classify as designed. This supersedes D16 for the SQL semantics. Still not proven: the Neon HTTP driver's serialization of the `text[]` parameter, and `DATABASE_URL` and `S1_REF_SECRET` being present on the production function (a missing `S1_REF_SECRET` makes `keyHash` throw, so every sign-up silently fails open to "new" with only a warn log). H2 covers both; suggest H2 also checks the function log for "Season 01 dedupe check skipped".
Housekeeping, not a defect: dedupe rows older than 24 h are deleted only by the 1 % opportunistic cleanup inside `lib/season1/ratelimit.ts` `hit()`, two rows per sign-up accumulate until a commit-route hit prunes them.

## SA-5 (info, infra-gap): stale `.next/types` in the worktree makes `tsc --noEmit` exit 2

`npx tsc --noEmit -p .` in `/home/claude/wt-build` reports 3 errors, all in the git-ignored, stale `.next/types/app/api/season1/{commit,stripe-webhook,warm}/route.ts` (protected files, zero diff). A clean copy of the worktree (no `.next`) and a clean `git archive c1f01e6` both give 0 errors. Not caused by the build; delete `.next` before running tsc in this worktree.

## SA-6 (low, code-bug, new in retest cycle 1): `releaseClaim` has no timeout of its own

On the 502 path the release delete is bounded only by the Neon driver's 8 s timeout, so 0.8 + 3.5 + 8 s can pass the 10 s function limit on a failure with a slow database. Failure path only. Suggested: wrap in the same kind of 800 ms race as the classification. A claim committed after the 800 ms cap is not in `claimed` and stays (rare).

## Retest cycle 1

SA-1, SA-2, SA-3 closed: see `evidence/sentry-a/retest-1.md`.

## Final pass at 56b24b9

SA-6 closed: release capped at 800 ms (repo test, scratch test, real Postgres). Remaining known gap, documented in the route header: a claim that commits after the 800 ms cap is not released. All checks in `evidence/sentry-a/final-56b24b9.md` pass. Optional note: one en dash in a quoted product string in `parent-review.md`.
