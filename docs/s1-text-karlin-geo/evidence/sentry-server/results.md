# Sentry server lane: results

Run 2026-10-23. Branch worktree s1-text-karlin-geo (uncommitted build under test) against origin/main 3572edc.
All paths below are relative to `docs/s1-text-karlin-geo/`.

## Method and safety

- Every request went to a local `next dev` (baseline :3101, branch :3102) or, for a smoke repeat, `next start` on the earlier production builds. Env: `KLAVIYO_PRIVATE_API_KEY=dummy-sentry META_CAPI_ACCESS_TOKEN=dummy-sentry META_PIXEL_ID=000000000000000` (plus a dummy `STRIPE_SECRET_KEY` for the build, see N7), and `NODE_OPTIONS=--import=evidence/sentry-server/stub-preload.mjs`.
- The preload replaces `globalThis.fetch`: a.klaviyo.com and graph.facebook.com requests are appended to a JSONL log and answered with a 202; nothing else passes through. No Netlify, Discord or real Klaviyo or Meta host was contacted.
- Stub proof: every harness run starts with a positive-control sign-up and refuses to continue unless the log holds the Klaviyo event body, the subscribe body and a Meta Lead body (`stubProven: true` in every `runs/res-*.json`; extract in `evidence/sentry-server/stub-proof.txt`). The route handlers ran in the same process tree that carried NODE_OPTIONS (bodies were recorded; the 202 stub response kept the sign-ups at 200, where a real call with a dummy key would have returned 401 and a 502).
- Environment constraint: each device call runs in its own pid namespace and kills its children when it ends, so servers were started, exercised and stopped inside single calls (`scripts/run-suite.sh`). Final `ps` shows no node or next process. The baseline worktree was removed with `git worktree remove --force`; `git worktree prune` was NOT run (instruction).
- Request counts: n4 suite 10 per server (control + 9), rest 210 per server (control + journeys, M1, M2, N2/N3), prodstart (next start) 42 per server. Zero 5xx or client errors on either server in any run.
- Normalized before diffing: `time`, `unique_id`, `season1_joined_at`, `season1_text_requested_at`, `event_time`, random UUID event ids, ms timestamps in fbc.

## Results

| ID | Test | Evidence | Result |
|---|---|---|---|
| N7 tsc | `npx tsc --noEmit` on baseline and branch | `evidence/sentry-server/n7-baseline-tsc.txt`, `n7-branch-tsc.txt` | PASS (both exit 0) |
| N7 tests | attribution test 30/30 on both; ekuzo101-weeks 14/15 on both (same failing test "buildWeeksLabel includes the time string"); new season-one-geo 58/58 on branch | `n7-baseline-attribution.txt`, `n7-branch-attribution.txt`, `n7-baseline-ekuzo101.txt`, `n7-branch-ekuzo101.txt`, `n7-branch-geo.txt` | PASS (identical to main; the one failure is pre-existing, see defect log D3) |
| N7 build | `next build` on branch | with the specified env: `n7-branch-build-specified-env.txt` exit 1 (Stripe module-load error in /api/camps/register, "Neither apiKey nor config.authenticator provided"); with extra dummy `STRIPE_SECRET_KEY`: `n7-branch-build.txt` exit 0, baseline `n7-baseline-build.txt` exit 0 | PASS with NOTE (infra-gap, accepted by coordinator; `n7-branch-build-full.txt` is a duplicate of the exit 1 run) |
| N4 | Same 9-request suite (main ad sign-up, popup, games, age, text-karlin, honeypot, bad email, unknown step, bad phone) on both servers with a synthetic x-nf-geo; per-call diff of every Klaviyo and Meta body | `diff-n4.txt`, `runs/log-baseline-n4.jsonl`, `runs/log-branch-n4.jsonl`, `runs/res-*-n4.json` | PASS (0 disallowed diffs; only added keys geo_tz, tz, tz_source on Waitlist events, those plus geo_country/region/city/postal on Text Karlin, and season1_city/region/tz on profiles; subscribe body and Meta bodies identical; games/age events unchanged) |
| N4 wide | The same diff over the 210-request suite, includes every journey, M1 and M2 request | `diff-rest.txt`, `runs/log-*-rest.jsonl`, `runs/res-*-rest.json` | PASS (0 disallowed diffs; 10 notes, all the intended city/region strip on quote, backslash, control and `US"}` inputs) |
| N4 prod | Same diff against `next start` (production build) for n4 + journeys | `diff-prodstart.txt`, `runs/log-*-prodstart.jsonl` | PASS (0 disallowed diffs, 0 status diffs) |
| N1 / M3 | Branch CAPI bodies scanned for tz, geo_, season1_, timezone, city and zone strings (event_id excluded because it echoes test labels) | `verify.txt` (section N1/M3), `stub-proof.txt` | PASS: positive control Lead present with hashed em; 128 CAPI bodies scanned, no offenders; CAPI key set is only event_name, event_time, event_id, action_source, event_source_url, user_data{em, client_ip_address, client_user_agent, fbp, fbc}, custom_data{content_name}; Lead count 128 = Waitlist events 128; 62 text-karlin events produced zero graph.facebook.com calls; 3 honeypot requests produced zero calls |
| N2 | Text-karlin validation, 9 requests incl. short, 1-start, letters, object, missing, with and without geo, bad tz | `n2-n3-status-table.txt`, `gates-r8-n6-n2.txt` | PASS: all identical to baseline (400 "Check the number and try again."); valid number stored as +15125550123 (also from " +15125550123 "), no phone_number attribute, no subscription call |
| N3 | Unknown step (string, null, number, empty), honeypot (ad, popup), games/age empty, bad email (empty, NUL, missing), malformed JSON, `[]`, `null`, empty body, string body | `n2-n3-status-table.txt` | PASS: status and body identical to baseline in all 17 cases |
| N5 | Popup sign-ups succeed and get tz from geo; popup component not in file list | `verify.txt` J3, `n6-files-actual.txt` | PASS (server side) |
| N6 files | `git diff --name-only origin/main` plus untracked | `n6-files-actual.txt`, `gates-r8-n6-n2.txt` | PASS: exactly route.ts, landing.html, season-one-tracking.md, seasonOneGeo.ts, season-one-geo.test.ts, docs/s1-text-karlin-geo/*, plus .sentry-tmp/ (ignored per brief) |
| N6 landing | `git diff -U0` on landing.html; line 986 sha256 | `gates-r8-n6-n2.txt`, `gates-landing-dashes.txt` | PASS: exactly 3 hunks (1 added line, 2 changed lines); line 986 sha256 f338cd7c...cd09c equal on both; word diff shows only `const TZ=...` and `tz:TZ` inserted. (Pixel diff is the browser lane.) |
| R1 | n4-text event keys: phone, ad, hero, geo_country, geo_region, geo_city, geo_postal, geo_tz, tz, tz_source | `verify.txt` | PASS |
| R2 | geo_tz from header timezone, validated, on both callers | `verify.txt` J3, J6, M2 tz-invalid, tz-object | PASS |
| R3 (server) | Server accepts tz on main and text bodies; client diff limited to 3 lines | `verify.txt`, N6 landing row | PASS (JS behaviour in browsers is the browser lane) |
| R4 | tz validator over HTTP (see M1) | `verify.txt` | PASS |
| R5 (amended) | Browser wins over geo; UTC aliases UTC, Etc/UTC, GMT, Etc/GMT, Zulu, Etc/GMT+0, Greenwich lose to a valid non-UTC geo zone, and are kept (source browser) with no geo zone, and in the text step with and without header; UTC browser + UTC geo = UTC browser | `verify.txt` section UTC | PASS (14 checks + 3) |
| R6 | Over all 190 branch Waitlist and Text Karlin events: season1_city/region/tz present iff the event value is non-empty and equal to it; none ever written empty | `verify.txt` | PASS |
| R7 | Quotes, backslashes, newline, tab, C0, DEL, C1 stripped from city and region (every caller: main, popup, text); 5000-char city capped to 80; region cap 8 | `verify.txt` M2 rows, `diff-rest.txt` notes | PASS for city and region. NOTE: geo_country and geo_postal are not stripped (D1) |
| R8 | Header comment names geo_tz, tz, tz_source, season1_city, season1_region, season1_tz; "checklist L2" and "event properties only" absent from route, lib and tracking doc | `gates-r8-n6-n2.txt` | PASS |
| R9 | No 5xx under any input, incl. 1 MB tz strings, object/array/null/bool tz, malformed headers, 8 KB headers (unit fuzz is Relay's 58-test file) | `verify.txt`, `diff-rest.txt` | PASS |
| J3 | Popup with no tz in body: tz America/Chicago, tz_source geo, season1_tz written | `verify.txt` | PASS |
| J4 | No header: geo_* empty; no season1_city/region; season1_tz only when browser tz valid (New York written; none when no tz); 200; text step too | `verify.txt` | PASS |
| J5 | Text request without header after a sign-up with header: profile props are only season1_text_phone, season1_text_requested_at (+ season1_tz if the browser tz is sent), no season1_city/region key, so nothing in Klaviyo would be blanked | `verify.txt` | PASS |
| J6 | Header with only timezone: geo_tz set, other geo empty, browser wins on main, geo wins on popup and text without tz | `verify.txt` | PASS |
| J7 | text-karlin twice: identical events after normalization | `verify.txt` | PASS |
| J8 | Main sign-up twice: identical props and Lead (same event_id) | `verify.txt` | PASS |
| Dashes | Em dash, en dash and spaced hyphen scan of added lines in route.ts and the tracking doc, and all of seasonOneGeo.ts, season-one-geo.test.ts and Relay notes | `evidence/sentry-server/gates-dashes.txt` | PASS (0 hits in all five; the 4 em dashes in route.ts are pre-existing on origin/main and untouched) |
| J1, J2 | Browser journeys | not covered here (browser lane) | NOT COVERED |
| M1 | 25 tz values (object x2, array, number, null, bool, 65 chars, `../etc`, `America/Chicago"}`, `Not/AZone`, empty, padded, backslash, trailing newline, non-ASCII, `+05:30`, 1 MB string, 1 MB of `A/`, `__proto__` object) in main and text, with and without a geo zone | `verify.txt` M1 section | PASS: every invalid value dropped to "" (or to geo fallback America/Chicago, source geo); all return 200; valid values canonicalized (america/chicago, AMERICA/CHICAGO to America/Chicago; EST5EDT to America/New_York; Asia/Calcutta kept on this ICU) |
| M2 | 24 malformed x-nf-geo forms x main/popup/text: not base64, raw JSON, array (b64 and raw), null/string/number JSON, empty, spaces, invalid or object timezone, city with quotes, backslash, newline/controls, apostrophe, region `US"}`, backslash, over-long, non-string fields, 8 KB | `verify.txt` M2 section | PASS: all 200, status and response equal to baseline, empty fields where unparseable |
| M4 | Client analytics | not covered here (browser lane) | NOT COVERED |

## Observations worth a human glance (not defects)

- The apostrophe in "Coeur d'Alene" is kept as-is by the route; how Klaviyo escapes it in the webhook is the existing H2 check.
- Browser UTC aliases all canonicalize to "UTC" on this Node/ICU (so `tz` reads "UTC", not "Etc/GMT"). Expected per Relay note 3.
