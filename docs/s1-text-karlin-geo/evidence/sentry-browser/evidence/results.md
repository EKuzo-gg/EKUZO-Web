# Sentry browser lane: results (tz capture on /season1 landing)

Date: 2026-10-23. MAIN = .sentry-tmp/landing-main.html (sha256 1febf544...), BRANCH = app/season1/landing.html (sha256 376f49bb...).
Full-file diff (not truncated): exactly 3 hunks. Line 1375 added (`const TZ=...`), line 1392 and line 1423 gain `tz:TZ` in the two request bodies. Nothing else differs.
Servers: scripts/server.js, MAIN on 127.0.0.1:4101, BRANCH on 127.0.0.1:4102. GET /season1 is byte-identical to the file (cmp verified) with `content-type: text/html; charset=utf-8`. POST /api/season-one logs the JSON body and returns {"ok":true}. Page is opened at http://localhost:PORT (the page only posts when hostname is localhost or ekuzo.gg, so 127.0.0.1 would not exercise the post).
Browser: Chromium via executablePath /opt/pw-browsers/chromium (playwright npm package mismatched the preinstalled build). Runner: scripts/runner.js; analysis: scripts/analyze.js, scripts/pixdiff.js. Raw per-run evidence: runs/{version}__{id}.json (server-received bodies, request bodies, fbq/dataLayer/clarity snapshots, console, blocked list). Server logs: server-main.log, server-branch.log (27 lines each: 13 journeys, 12 with 2 posts, 1 with 3).

## Analytics guard (fail-closed), recorded before any functional test

- Every context: `context.route("**/*")` continues only localhost, 127.0.0.1, data:, blob:; everything else is aborted (`blockedbyclient`).
- Chromium launched with `--host-resolver-rules` mapping google-analytics.com, googletagmanager.com, clarity.ms, facebook.com, connect.facebook.net (plus wildcards for each, doubleclick.net, google.com) to 0.0.0.0, so a beacon that bypasses the route layer (for example at close) cannot resolve.
- Result over 26 browser contexts (13 journeys x 2 versions): zero non-localhost requests were allowed through. Blocked list (each seen 26 times, identical on main and branch):
  - GET https://connect.facebook.net/en_US/fbevents.js
  - GET https://fonts.googleapis.com/css2?family=Anybody... (Google Fonts stylesheet; third party, so blocked by the gate)
  - GET https://www.clarity.ms/tag/wml8wll5ua
  - GET https://www.googletagmanager.com/gtag/js?id=G-8LM45PX53W
- No request to google-analytics.com or facebook.com (the noscript pixel image is not rendered with JS on) was attempted.
- Consequence (NOTE): fbevents.js, gtag.js and clarity.js never load, so the tests observe the page's inline stubs: `window.fbq.queue`, `window.dataLayer`, `window.clarity.q`. These are exactly what the page's own calls push, which is what the change could affect; real vendor behaviour is out of scope by design.

## Test table

Journey used: open /season1?ad=d10, wait 1.5 s; hero step (d10 is a random B/C split, pinned by init script that sets localStorage `ekuzo_s1_hero_d10`, so main and branch get the same hero; "amount" unless stated); hero step is not required to submit, it was skipped by clicking `.ih-skip` (or an option was clicked where stated); fill `#em-top` with sentry-test@example.com, submit `form[data-where=top]` (only `email` required; honeypot `ekz_hp` left empty); wait for `#conf.on`; fill `#tk-ph` 5125550100, submit `#tk-form`; wait for `.tk-done`.

| Req | What ran | Evidence | Result |
|---|---|---|---|
| Gate | Analytics block recorded above, all 26 contexts | runs/*.json fields `blocked`, `allowed` | PASS |
| J1 | Full journey, 1440x900, tz America/Chicago, both versions | runs/*__j1-chi-desk.json | PASS: branch sign-up and text bodies carry `tz":"America/Chicago"`; main has no `tz` key; all other keys and values identical after normalizing eventId and port |
| J1 | 1440x900, tz America/Los_Angeles | runs/*__j1-la-desk.json | PASS (`tz` America/Los_Angeles x2) |
| J1 | 375x812 iPhone UA, Chicago | runs/*__j1-chi-mob.json | PASS |
| J1 | 375x812 iPhone UA, Los_Angeles | runs/*__j1-la-mob.json | PASS |
| J1 | 375x812 Instagram in-app UA, Chicago and Los_Angeles | runs/*__j1-ig-mob.json, *__j1-ig-mob-la.json | PASS |
| J1 | Hero option clicked (amount, desktop): heroAnswer posted | runs/*__j1-heroclick-amount-desk.json | PASS (only `tz` differs) |
| J1 | Hero "games" option clicked, 375 iPhone, Los_Angeles: three posts (sign-up, step "games", text-karlin) | runs/*__j1-heroclick-games-mob.json | PASS on spec; NOTE: the `step:"games"` post carries no `tz` in either version (unchanged by the diff, outside the stated scope) |
| J2 | `Intl.DateTimeFormat` replaced by a throwing function via init script (desktop, iPhone, Instagram UA); page confirms `Intl.DateTimeFormat()` throws | runs/*__j2-intl-throw-*.json | PASS: branch still posts both requests, server returns ok, both bodies have `"tz":""`, `#conf` visible and `.tk-done` visible, zero pageerrors; main behaves the same minus the `tz` key |
| UTC | timezoneId UTC, desktop and 375 iPhone | runs/*__utc-desk.json, *__utc-mob.json | PASS (`tz":"UTC"` in both bodies) |
| M4 / N1 | fbq queue entries `["track","Lead"]` after sign-up and after text | analysis.json (`leadMain`, `leadBranch`) | PASS in all 13 journeys, both versions: count is 1 after sign-up and still 1 after the text submit (no Lead on the text step) |
| M4 / N1 | `window.dataLayer`, clarity queue (`clarity.q`), fbq queue compared main vs branch, after sign-up and after text (Date and eventID normalized) | analysis.json (`fbqSame`, `dataLayerSame`, `claritySame`) | PASS: identical in all 13 journeys. Branch journey 1 dataLayer: js, config, hero_view, hero_skip, generate_lead, text_karlin_start, text_karlin_submit. Clarity: set ad, set hero, event signup, set signed_up, event text_karlin. `tz` appears in neither |
| Browser truth | console errors/warnings and pageerror events, both versions, all runs | runs/*.json `consoleErr`, `pageErr` | PASS: zero pageerror events anywhere. Console set per run is identical between main and branch (`consoleSetEqual` true in 13 of 13). The only first-party error, in both versions: 404 for /images/authors/karlin-oei-avatar.jpg (my test server serves no static assets; production does; the page has an onerror fallback) |
| Browser truth | Noise, listed separately | same | NOTE: 4 `ERR_BLOCKED_BY_CLIENT` errors per run (fbevents.js, gtag.js, clarity tag, Google Fonts), identical in main and branch |
| N6 | Screenshots, hero on load, confirmation after sign-up, confirmation after text submit, 1440x900 and 375x812 (iPhone UA, DPR 2), both versions (Chicago, hero "amount") | screens/{main,branch}-{hero,signup,text}-{1440,375}.png | see pixel table |

## Pixel diff (pixelmatch threshold 0 and exact raw RGBA compare)

| State | Viewport | Image size | Differing pixels (pixelmatch t=0) | Differing pixels (raw RGBA) | Result |
|---|---|---|---|---|---|
| hero | 1440 | 1440x900 | 0 | 0 | PASS |
| signup | 1440 | 1440x900 | 0 | 0 | PASS |
| text | 1440 | 1440x900 | 0 | 0 | PASS |
| hero | 375 | 750x1624 | 0 | 0 | PASS |
| signup | 375 | 750x1624 | 0 | 0 | PASS |
| text | 375 | 750x1624 | 0 | 0 | PASS |

No animation or cursor noise appeared, so no reducedMotion rerun was needed (the main runs used reducedMotion no-preference with 1.5 s settle waits). Data: pixdiff-screens.json.

## Limitations (NOTE)

- Google Fonts is blocked by the gate, so screenshots use the page's fallback or embedded fonts, not production typography. Identical on both versions, so valid for the comparison, not for absolute visual QA.
- Hero tested for screenshots is "amount" only; the "games" hero was exercised functionally on one mobile journey.
- Real Chromium timezone support was checked through `timezoneId`; physical-device or Safari behaviour of `resolvedOptions().timeZone` is not covered by this lane.
- Server route behaviour is out of scope (other lane); this test server only echoes ok.

## Cleanup

Both servers killed; `ps` shows no node server, chromium or runner process (checked); ports 4101 and 4102 refuse connections. probe-discarded/ holds one earlier single-run probe, not used in results.
