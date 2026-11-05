# Auditor phase 1 (2026-11-05)

Inputs read: 01-requirements, 02-frozen-spec, 03-decision-log, redteam-money/ops/trust, `db/migrations/0001_season1.sql`, evidence folder.

## 1. Verdict: BLOCK

Phase 1 is close. Five items stop sign-off: one design flaw in the W3 claim, two red team findings with no resolution, one missing human checkpoint, one requirement set with no mechanical gate (journeys and measurement rows). Each is small to fix.

## 2. Requirement testability

| ID | Testable | Mechanical check |
|---|---|---|
| R1.1 | yes | `joinRoutesMatch.test.ts` equal bodies for 3 request shapes; one template path |
| R1.2 | yes | Test: `?src=email` rides to signup link, `?src=junk` dropped (add to joinRoutesMatch) |
| R1.3 | partial | Closed, `mode off` and jersey-cutoff render tests for /join. Spec names only open-state requests; ops 14 asks for closed |
| R1.4 | yes | Mutation proof: edit one template copy, test fails (capture the failing run) |
| R1.5 | yes | `grep -r join/join.html` empty; four tests pass on `b/join-b.html`; file absent |
| R1.6 | yes | Text diff of rendered /join vs /join/b, same `now` and mode, empty |
| R1.7 | yes | `curl -sI` header dump equals /join/b headers and baseline /join |
| R2.1 | yes | Unit table: d01, D19, d0, d100, d1x, null, number, blank |
| R2.2 | yes | Route test asserts event `ad`, profile `season1_ad`, CAPI `content_name season_one_d19` |
| R2.3 | yes | HTML grep of signup page for `ekz_hp` and attributes; no `name="company"`; body key still `company` |
| R2.4 | yes | Diff is exactly two hunks vs `evidence/w2-9f3e2e7.diff` (file not yet in evidence); browser run: empty honeypot pays, filled returns 422 |
| R3.1 | partial | Atomicity is not mechanically provable as specced, see gap 1. Test asserts query text and classifier outputs only |
| R3.2 | yes | Mocked fetch: repeat writes Repeat event, no Waitlist event, empty profile props, no CAPI, body `{ok:true,repeat:true}` |
| R3.3 | yes | Tests per fail-open mode, call-order test for honeypot and three steps |
| R3.4 | yes | Unit: `unique_id` with and without `eventId` |
| R3.5 | yes | Test that subscribe and CAPI start before either resolves; header comment grep |
| R3.6 | yes | Browser case with stubbed `repeat:true`: zero fbq Lead, gtag generate_lead, clarity signup calls |
| R3.7 | partial | eventId rule testable (browser, case and whitespace variants). `savedEmail` clearing not in the requirement (trust 15) |
| R3.8 | yes | Browser: 5 rapid taps, request count 1 |
| R3.9 | yes | Browser: localStorage flag after new, retry, repeat; throwing storage does not break |
| R3.10 | yes | Component test or browser: repeat sets flag, `trackLead` not called |
| R3.11 | yes | Test file output; add the response-keys test and fail-open per status (ops 20) |
| R4.1 | yes | `before-probe.json` exists; must name shifting nodes (ops 16), confirm it does |
| R4.2 | yes | `measure-cls.mjs` before and after JSON, median of 7, 16 URLs listed in the requirement |
| R4.3 | yes | Screenshot pairs in `screenshots/`, pixel diff or reviewer note |
| M1 | yes | R3.11 retry test plus browser lost-response case |
| M2 | yes | Test: two emails, two Leads and two eventIds |
| M3 | yes | Browser network capture: same `event_id` in Pixel and CAPI payload |
| M4 | yes | Fail-open tests; clock-based 24 h assertion on SQL text (weak, see gap 1) |
| M5 | yes | Existing guards; run existing tests, add one browser check |
| M6 | partial | No named test. Add: scan GA4/Pixel/CAPI payloads and repeat response for kid fields |
| M7 | yes | Test: filled honeypot, zero Klaviyo and Meta calls |
| H1, H2 | human | Checkpoints, not mechanical, correctly labeled |

## 3. Red team coverage

Money (15):
1 honeypot rejects real parents: R2.3, R2.4. Partly: no drop counter, no real-browser autofill pass. PARTIAL
2 rename breaks checkout via id: R2.3/R2.4 (`g('ekz_hp')` hunk, browser test). RESOLVED
3 lost subscribe on repeat: D3, R3.2. RESOLVED
4 lost response vs Lead: D4, R3.2. RESOLVED
5 read-after-write race: D2 claims atomic, but see gap 1. PARTIAL
6 Klaviyo filter encoding: D2 removes the lookup; R3.11 `+` test. RESOLVED
7 covered by 9: see 9
8 other ad's attribution lost: D3 Repeat event. RESOLVED
9 no rate limit on the endpoint: D6, HA3 parked for Jamie. UNRESOLVED (accepted by decision, needs Jamie's yes)
10 time budget: D5, R3.5. RESOLVED
11 eventId not tied to email: R3.7. RESOLVED
12 enumeration oracle: D7 accepted. RESOLVED (by decision)
13 24 h vs 30 days: D9 declined. RESOLVED
14 ad range vs allowlist: D9 declined. RESOLVED
15 money copy: D12 (Steward check). RESOLVED as a task, no requirement or ledger row

Ops (21):
1 partly processed vs retry: D4. RESOLVED
2 eventual consistency: D2, but atomicity flaw. PARTIAL
3 unique_id dedupe unverified: D4 admits it. RESOLVED as accepted risk; no check
4 profiles:read scope: D2 removes. RESOLVED
5 timeout budget: D5. RESOLVED
6 lost subscription: D3. RESOLVED
7 GET rate limit: D2 removes. RESOLVED
8 enumeration: D7. RESOLVED
9 window keyed on property: D2 removes. RESOLVED
10 normalization: R3.7. RESOLVED
11 route config: D10. RESOLVED
12 tests encode A copy: R1.5. RESOLVED
13 file tracing on deploy: spec keeps literal path, no check on a preview. UNRESOLVED
14 closed/off render for /join: R1.3 without a named test. PARTIAL
15 d21 not a control: D11, R4.2 list. RESOLVED
16 root cause: R4.1, `before-probe.json`. RESOLVED if node names present
17 fix hazards: D11, R4.2. RESOLVED
18 measurement method: R4.2. RESOLVED (max session window chosen)
19 same deployment type: R4.2 production build. RESOLVED
20 fail-open per mode: R3.11 (no URL, throw, timeout; no per-status). RESOLVED (lookup gone)
21 branch deploy sends nothing: HA2 production only. RESOLVED

Trust (15):
1 skipped subscribe: D3. RESOLVED
2 oracle: D7. RESOLVED (by decision)
3 shared device flag: D8. RESOLVED (by decision)
4 dropped attribution: D3. RESOLVED
5 repeat copy gives no path forward: not in any requirement or decision. UNRESOLVED
6 filter injection: D2 removes. RESOLVED
7 logging of email and bodies: spec logs no email in the new warn; existing email-logging lines untouched, no statement. PARTIAL
8 two tabs: D2 (flawed, gap 1). PARTIAL
9 timeout: D5. RESOLVED
10 text-karlin accepts any email: pre-existing, in no decision. UNRESOLVED (log it as accepted or parked)
11 silent 200 on honeypot: no change, no drop counter. UNRESOLVED
12 B drops old /join content, `$60` literal: D12 covers money copy only. UNRESOLVED
13 GA4 cannot split old /join: D1 accepted; no `page_path` ledger check. PARTIAL
14 response keys test: not in R3.11. UNRESOLVED
15 `savedEmail` cleared on a different email: not in R3.7. UNRESOLVED

## 4. Gaps

1. **Atomic claim is not atomic (blocks).** `s1_rate_limits` PK is `(key, window_start)`. The spec inserts `window_start = now()`, so two concurrent requests for the same email get different timestamps, no conflict, both classify new. That is the two-tab race (money 5, ops 2, trust 8) D2 says it fixes. Fix: serialize with `pg_advisory_xact_lock(hashtext(key))` inside the statement, or use a fixed bucket, and add a concurrency test (two parallel calls, one new) against a real Postgres, not a mocked client.
2. **Unresolved findings (blocks).** Money 9 (D6 needs Jamie's yes), ops 13, trust 5, 10, 11, 12, 14, 15. Each needs a decision log line or a requirement. Trust 12 needs a human checkpoint: Jamie signs off the old-/join-only copy list and the `$60` literal before deploy, since J4 email parents land on B.
3. **Journeys without tests.** J1 to J5 are not mapped to requirements or checks. Add a J-to-evidence row each (J3 cross-device and after-24 h, J4 through to Stripe test checkout, J5 `/karlin` redirect and `/jersey?ad=d19` unchanged, zero-diff proof).
4. **Measurement rows missing.** No rows for `/season1/join/b`, `/season1/join/jersey`, `/karlin` (unchanged, need a before/after check), the J2 thanks/confirmation page, or the new `Season 01 Waitlist Repeat` Klaviyo event as a destination (flows and readout must not trigger or double count). CAPI `event_id` and Clarity are not stated for the popup and join rows beyond "n/a". No `page_path` segmentation check (trust 13).
5. **Honeypot visibility.** R2.3 ships the fix, but nothing counts `commit.honeypot` drops or covers the landing's silent 200. Add a log line without email and a real iOS Safari or Chrome autofill pass (human checkpoint H3).
6. **Missing artifacts.** `evidence/w2-9f3e2e7.diff` is cited and absent. Confirm `before-probe.json` names nodes. R4.1 asserts a measured cause the ledger must show.
7. **Human checkpoints.** HA3 and D6 need Jamie's call before sign-off or an explicit "not this release". D1, D7, D8, D9 are overrulable and need a recorded yes. No deploy-preview check that `join-b.html` is traced into the /join function (ops 13); add it.

## Re-audit (SC1)

Read: 01, 02 (SC1), 03 (D2 revised, D13 to D17), `git diff 147897a 8230894`, `lib/season1/db.ts`, `evidence/cls/before-probe.json`.

**Verdict: SIGN-OFF**, with the notes below carried into the ledger.

| Gap | Status | Reason |
|---|---|---|
| 1 atomic claim | RESOLVED (design) | R3.1 and spec line 14: `getSql().transaction([...])` takes `pg_advisory_xact_lock(hashtext(email key))` first, then one select-and-insert statement. Neon HTTP batches run in one transaction and the later statement takes a fresh snapshot after the lock, so it sees the earlier commit. Proof is by query text and order plus H2 second device (D16, no Postgres here). Notes: D2 still says "atomic in one statement" (stale wording, harmless); lock wait counts inside the 800 ms cap and times out to fail open, which is acceptable |
| 2 unresolved findings | RESOLVED | Money 9 is D6 (overrulable). Ops 13 is R1.8 (nft list plus post-deploy hash). Trust 5 is D13, 10 is D14, 12 is D15 (Jamie chose B; acknowledgment kept as a ledger row, not a gate), 14 is R3.11 response keys, 15 is R3.7. Trust 11: paid commit route already logs `commit.honeypot`; the landing route is unchanged, so no new counter is required, H3 covers autofill |
| 3 journeys | RESOLVED | Journey to evidence map; ledger now has one row per J1 to J5 |
| 4 measurement rows | RESOLVED | Rows added for b, jersey, karlin and the Repeat metric. J2 thanks page is covered by the J2 blog run. Repeat metric flow check is a Klaviyo UI read, ledger row set to Jamie |
| 5 honeypot visibility | RESOLVED (minor) | H3 added; D17 ships the hotfix. No new counter on `/api/season-one`, accepted |
| 6 artifacts | RESOLVED, one redo | `git diff 147897a 8230894` is exactly the two hunks (signup honeypot input, `collect()` read) plus the normalizeAd regex and WORKLOG. `before-probe.json` names nodes (`section#join-top.join`). `evidence/hotfix/browser.txt` is a failed run (`collect is not defined`): the R2.4 browser proof is still open and must be rerun against the built page |
| 7 human checkpoints | RESOLVED | D1, D6 to D9 are overrulable defaults for Jamie, no evidence any is wrong. D15 acknowledgment and H3 are ledger rows |

Ledger updated: R1.8, R2.4 evidence path and redo note, R3.1 lock-order evidence, J1 to J5 rows, Repeat metric row, H3 (no longer proposed), D15 acknowledgment replaces H4, nft row replaces the deploy-preview row.
