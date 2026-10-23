# Evidence ledger (Auditor, late phase: requirement to evidence)

Date 2026-10-23. Paths are relative to `docs/s1-text-karlin-geo/`. SS = `evidence/sentry-server/`, SB = `evidence/sentry-browser/evidence/`.
Verified-by: Sentry-server, Sentry-browser. Relay notes (`evidence/relay/`) are self-test and do not count as final.
"spot-checked" = the Auditor opened the raw file and re-derived the claim (not just read results.md).
Result key: PASS, FAIL, NOTE (passes, with a caveat the reader must see).

## Requirements

| ID | Test | Evidence | Result | Verified-by | Spot-check |
|---|---|---|---|---|---|
| R1 | Text Karlin event keys: phone, ad, hero, geo_country/region/city/postal, geo_tz, tz, tz_source | `SS/verify.txt` (R1 line), `SS/runs/log-branch-n4.jsonl` | PASS | Sentry-server | spot-checked (key diff recomputed from the jsonl: added keys are exactly geo_*, geo_tz, tz, tz_source, season1_city/region/tz; none removed or changed) |
| R2 | geo_tz from header timezone, validated, on every caller | `SS/verify.txt` (J3, J6, M2 tz-invalid), unit file `SS/n7-branch-geo.txt` | PASS | Sentry-server | spot-checked (verify.txt J3/J6 rows) |
| R3 | Landing sends `tz` via Intl in try/catch; main and text bodies | Diff: `SS/gates-r8-n6-n2.txt`; behaviour: `SB/runs/*__j1-*.json`, `SB/runs/branch__j2-intl-throw-*.json`, `SB/server-branch.log` | PASS | Sentry-server (diff), Sentry-browser (behaviour) | spot-checked (server-branch.log: 27 posts, tz Chicago x8, LA x8, UTC x4, "" x6, 1 absent on the unchanged `games` post) |
| R4 | `cleanTz` validator over HTTP and unit | `SS/verify.txt` (R4 line, M1 section), `SS/n7-branch-geo.txt` | PASS | Sentry-server | partly (verify.txt PASS lines read; M1 table not re-run) |
| R5 (amended) | Browser wins; UTC aliases lose to valid non-UTC geo; kept when no geo; UTC+UTC | `SS/verify.txt` section UTC; unit rows in `SS/n7-branch-geo.txt` | PASS with NOTE | Sentry-server | spot-checked. NOTE: HTTP checks cover 7 of the 14 spec aliases (UTC, Etc/UTC, GMT, Etc/GMT, Zulu, Etc/GMT+0, Greenwich); the other 7 (UCT, Etc/UCT, Universal, Etc/Universal, Etc/Zulu, GMT0/Etc/GMT0, Etc/Greenwich) are covered only by the Relay-authored unit test that Sentry re-ran (58/58). Results.md says "14 checks", which is 7 aliases x 2. |
| R6 | Profile props written only when non-empty, never blanked | `SS/verify.txt` (R6 line: 190 events), J4/J5 rows | PASS | Sentry-server | spot-checked (J4/J5 profile objects read) |
| R7 (amended) | Strip, trim, cap on city and region, every caller | `SS/verify.txt` (R7 line, M2), `SS/diff-rest.txt` (10 strip notes) | PASS with NOTE | Sentry-server | spot-checked (diff-rest notes: quote, backslash, control chars, `US"}` stripped). NOTE: country and postal are not stripped (defect D1, accepted) |
| R8 | Header comment, readGeo docstring, tracking doc updated; no lat/long | `SS/gates-r8-n6-n2.txt` (R8 grep gate) | PASS | Sentry-server | spot-checked (opened route.ts lines 52-60 and 100-112 and docs/season-one-tracking.md lines 76-83; no "checklist L2" or "event properties only"; no lat/long read) |
| R9 | Helpers never throw (1 MB, objects, arrays, null, deep, __proto__) | HTTP: `SS/verify.txt` status section (220 requests, 0 5xx); unit fuzz: `SS/n7-branch-geo.txt` | PASS | Sentry-server (HTTP run and unit re-run) | spot-checked (unit subtests "never throws (fuzz)" and "1 MB string" present and ok). Unit tests are Relay-authored. |

## Non-regression

| ID | Test | Evidence | Result | Verified-by | Spot-check |
|---|---|---|---|---|---|
| N1 | No tz/geo in CAPI Lead; text step sends nothing to Meta; fbq Lead once | Server: `SS/verify.txt` N1/M3, `SS/stub-proof.txt`, `SS/runs/log-branch-*.jsonl`; browser: `SB/analysis.json` | PASS | Sentry-server, Sentry-browser | spot-checked (recomputed from jsonl: 125 + 26 Meta bodies, all Lead, 0 with tz/geo/season1/zone strings after excluding event_id and source URL; positive control present, stubProven true in all 6 res files; browser leadBranch [1,1] in 13 of 13) |
| N2 | Bad phone 400 same text; E.164; no phone_number or SMS consent | `SS/n2-n3-status-table.txt`, `SS/gates-r8-n6-n2.txt` | PASS | Sentry-server | spot-checked (status table rows identical; "+15125550123", has phone_number false) |
| N3 | Unknown step 400; honeypot silent 200 no write; games/age; bad email | `SS/n2-n3-status-table.txt`, `SS/verify.txt` (honeypot 3 requests, 0 calls) | PASS | Sentry-server | spot-checked |
| N4 | Waitlist keeps all props; subscribe call identical; only additions | `SS/diff-n4.txt`, `SS/diff-rest.txt`, `SS/diff-prodstart.txt`, `SS/runs/log-*.jsonl` | PASS | Sentry-server | spot-checked (independent flatten and diff of baseline vs branch for n4 and prodstart: 0 changed values, 0 removed keys, URL sequence identical) |
| N5 | Popup file untouched; popup sign-up succeeds and gets geo tz | `SS/verify.txt` J3, `SS/n6-files-actual.txt` | PASS with NOTE | Sentry-server | spot-checked (file list has no SeasonOnePopup). NOTE: popup is simulated by an API call with no `tz`; the popup component was not driven in a browser. Acceptable, component is unedited. |
| N6 | File list, landing diff, line 986, pixel diff | Files: `SS/n6-files-actual.txt`; diff: `SS/gates-r8-n6-n2.txt`; pixels: `SB/pixdiff-screens.json`, `SB/screens/*.png` | PASS with NOTE | Sentry-server (files, diff), Sentry-browser (pixels) | spot-checked (3 hunks; line 986 sha256 equal; `cmp` on all 6 main/branch PNG pairs byte-identical). NOTE: WORKLOG.md is on the frozen file list but has no entry (see defect A1); Google Fonts blocked so fallback fonts shown; hero "amount" variant only; "3 changed lines" is 3 hunks (1 added, 2 modified). |
| N7 | tsc, build, existing tests vs main baseline | `SS/n7-baseline-tsc.txt`, `SS/n7-branch-tsc.txt`, `SS/n7-*-attribution.txt`, `SS/n7-*-ekuzo101.txt`, `SS/n7-branch-geo.txt`, `SS/n7-*-build.txt`, `SS/n7-branch-build-specified-env.txt` | PASS with NOTE | Sentry-server | spot-checked (tsc exit 0 both; attribution 30/30; ekuzo101 14/15 on both, same failure; geo 58/58; both builds "Compiled successfully", exit 0). NOTE: build passes only with an extra dummy STRIPE_SECRET_KEY (D2). The claim that main fails identically under the specified env has no baseline run in the evidence folder. |

## Journeys

| ID | Test | Evidence | Result | Verified-by | Spot-check |
|---|---|---|---|---|---|
| J1 | Instagram/FB UA and desktop/mobile: both requests carry tz, server accepts | `SB/runs/*__j1-*.json`, `SB/server-branch.log` | PASS | Sentry-browser | spot-checked (branch j1-chi-desk posts: tz America/Chicago on sign-up and text-karlin; main: tz absent on both) |
| J2 | Intl.DateTimeFormat throws: sign-up and text succeed, tz "" then geo fallback | Browser: `SB/runs/*__j2-intl-throw-*.json`; fallback to geo: `SS/verify.txt` (no-tz text with header) | PASS with NOTE | Sentry-browser (no throw, tz ""), Sentry-server (geo fallback) | spot-checked (branch j2-intl-throw-desk: tz "" on both posts, conf and tk-done visible, pageErr empty; runner.js init script replaces Intl.DateTimeFormat with a throwing function). NOTE: the "Intl deleted" variant from Auditor phase 1 finding 9 was not run; the amended spec only requires the throwing mechanism. |
| J3 | Popup sign-up, no tz: tz from geo, source geo | `SS/verify.txt` n4-popup | PASS | Sentry-server | spot-checked |
| J4 (reworded) | No header: geo_* empty; no city/region profile; season1_tz only with valid browser tz; 200 | `SS/verify.txt` j4-* rows | PASS | Sentry-server | spot-checked (4 variants incl. text step) |
| J5 | Text without geo keeps profile city/region (not blanked) | `SS/verify.txt` j5-* rows | PASS | Sentry-server | spot-checked |
| J6 | Header with only timezone | `SS/verify.txt` j6-* rows | PASS | Sentry-server | spot-checked |
| J7 | text-karlin twice: identical events | `SS/verify.txt` (J7 line) | PASS | Sentry-server | partly (PASS line read; pair not re-diffed) |
| J8 | Main sign-up retry: identical props, same Lead event_id | `SS/verify.txt` (J8 line) | PASS | Sentry-server | partly (PASS line read; pair not re-diffed) |

## Must-not cases

| ID | Test | Evidence | Result | Verified-by | Spot-check |
|---|---|---|---|---|---|
| M1 | 25 bad tz values, with and without geo zone, main and text | `SS/verify.txt` M1 section (rows 77-149) | PASS | Sentry-server | partly (section header and status line read; rows not individually re-run) |
| M2 | 24 malformed x-nf-geo forms x 3 callers | `SS/verify.txt` M2 section, `SS/diff-rest.txt` | PASS | Sentry-server | spot-checked via diff-rest notes (strip cases) and the 0 status diffs line |
| M3 | No tz/geo/season1 key in anything sent to Meta | Same as N1 | PASS | Sentry-server | spot-checked (see N1) |
| M4 | Client fires no new GA4, Clarity or Meta event | `SB/analysis.json` (fbqSame, dataLayerSame, claritySame), `SB/runs/*.json` | PASS with NOTE | Sentry-browser | spot-checked (analysis.json: all three true in 13 of 13; leadBranch [1,1]). NOTE: vendor scripts are blocked by the fail-closed gate, so this observes the page's inline queues, not real GA4/Clarity/Meta network traffic. This is by design and matches the amended gate. |

## Phase 1 gates

| Gate | Test | Evidence | Result | Verified-by | Spot-check |
|---|---|---|---|---|---|
| R8 gate | grep header names six fields; stale strings gone; tracking doc updated | `SS/gates-r8-n6-n2.txt` | PASS | Sentry-server | spot-checked (route.ts and doc opened) |
| N1/M3 gate | Dummy Meta token and pixel id, positive control, then scan | `SS/stub-proof.txt`, `SS/verify.txt` | PASS | Sentry-server | spot-checked (control Lead body with hashed em in stub-proof; 128 bodies re-scanned) |
| N4 gate (a) | Oracle unit test of old readGeo vs parseGeoHeader | `SS/n7-branch-geo.txt` subtest "parseGeoHeader oracle (old readGeo)" ok | PASS | Sentry-server (re-run); test authored by Relay | spot-checked (subtest present and ok; relay claims 24 fixtures, not individually opened) |
| N4 gate (b) | Same suite on main and branch, normalized diff, subscribe identical | `SS/diff-n4.txt`, `SS/diff-rest.txt`, `SS/diff-prodstart.txt` | PASS | Sentry-server | spot-checked (independent recomputation) |
| N6 gate | File list; 3 hunks; line 986; pixel diff 0 | see N6 | PASS with NOTE | Sentry-server, Sentry-browser | spot-checked |
| M4 gate | fbq.queue Lead count 1; dataLayer and clarity lists identical to main | `SB/analysis.json` | PASS | Sentry-browser | spot-checked |
| J2 mechanism | Init script makes Intl.DateTimeFormat throw | `SB/scripts/runner.js` line 30; `SB/runs/*j2*` | PASS | Sentry-browser | spot-checked |
| N7 gate | Baseline tsc and tests recorded beside branch | `SS/n7-baseline-*.txt` | PASS | Sentry-server | spot-checked |

## Flags

- No requirement or gate ID lacks evidence. No ID rests on Relay self-evidence alone.
- Unit-test-only evidence (Relay-authored, Sentry re-ran): 7 of 14 UTC aliases (R5), R9 fuzz at helper level, N4 gate (a) oracle.
- Partly checked by the Auditor (PASS line read, rows not re-derived): R4, J7, J8, M1.
- Human-action, not in this ledger: H1 to H4 (release, alert-line change, live test, deploy log); whether live Netlify `x-nf-geo` carries `timezone`.
- Open items: A1 (WORKLOG.md entry missing), A3 (D2 baseline claim unevidenced). See `05-defect-log.md`.
