# Sentry results: beta restart link (branch build/beta-restart-link at cc867cb)

Everything here was run in the cloud container. No database, no secret, no real external service. The branch was not edited; the only file added outside docs/ is `lib/season1/__tests__/betaRestartAdversarial.test.ts`.

## A. Mechanical gates

| Gate | Result | Artifact |
|---|---|---|
| `npm test` (branch as delivered) | lib: 718 tests, 717 pass, 0 fail, 1 skip. scripts/field-vitals: 5 tests, 5 pass | npm-test.txt |
| `npm test` with Sentry's new test file | lib: 734 tests, 733 pass, 0 fail, 1 skip. field-vitals 5 of 5 | npm-test-with-sentry-tests.txt |
| `npx tsc --noEmit` | exit 0, empty output (also clean with the new test file) | tsc.txt, tsc-with-sentry-tests.txt |
| `npm run build` (placeholder STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set to `placeholder-not-a-key`) | exit 0. `ƒ /season1/beta/r/[token]` and `ƒ /api/season1-beta/restore` listed dynamic | build.log (tail), build-full.log |
| Zero diff vs fe494e2 on the protected paths | empty (0 bytes) | zero-diff.txt |
| Files changed outside docs/ | 14: WORKLOG.md, 2 route files, 5 lib files (attribution, betaProgressScript, betaRestart, betaRestartCookies, betaWizard) and 6 test files. Full list | changed-files.txt |
| Added lines: em dash | none in app/, lib/ (code or tests) or WORKLOG | static-greps.txt |
| Added lines: `innerHTML` | none | |
| Added lines: `console.log` | none. Four warn/error lines added, all in the restore route, all carry a state name or `errCode()` (an error code or name, never a message) | |
| Any log that could carry email, token, name, answer | none found. server-3100.log shows only `Beta restore limit check skipped: Error` and `Beta restore database read failed: Error` | server-3100.log |

## B. Browser QA (qa.mjs, fail-closed)

Harness: Chrome with `--host-resolver-rules=MAP * 127.0.0.1`, page opened at http://ekuzo.gg:3100 so the ekuzo.gg-only rules are live. Every request not to ekuzo.gg is recorded; vendor hosts (googletagmanager, facebook, clarity) get an empty stub script, everything else (fonts.googleapis.com only) is aborted. /api/season-one and /api/season1-beta/restore are answered by route interception. Flag cookie set with `addCookies`, plus an HttpOnly canary token cookie on `Path=/api/season1-beta` to prove its scope. One harness note: this container sets `https_proxy`, which Chrome honours; `--no-proxy-server` was added so nothing can leave the machine. Offender set (hosts that answered from the network, minus localhost): empty at both viewports (qa-desktop.log, qa-mobile.log).

Result: 1440x900: 132 PASS, 0 FAIL. 390x844 touch: 132 PASS, 0 FAIL. 10 INFO rows each (observations, below). Page errors: none. Console errors from our pages: only a 404 for `/images/new%20torn%20paper/torn-paper-grey-top-1@2x.png`, which also occurs on the plain first screen with no link (not from this branch; see defect S5).

| # | Case | Result | Notes |
|---|---|---|---|
| 1 | No flag: zero restore calls (M8) | PASS x2 viewports | also none after a reload; no panel, no post, no GA event |
| 2 | resume stages 0, 1, 2 | PASS | panel text and two buttons in role=status; DOM and fields hold nothing about the player before the tap; before the tap exactly one call `{}`, no post, no GA event; document.cookie never shows the token; tap sends `{"confirm":true}` once; lands on screen 2, 3, 4; fields filled; zero progress posts and zero beta_wizard_step on the restore; `beta_wizard_resume {step, via:"link"}` exactly once; focus on a field; saved run holds the restored session id, tzSet false. Stage 0 forward: next post is stage 1 with the restored session id, step event only for the newly done step (expectations). Stage 1 forward then finish: stage 2 post carries the restored session id, final beta-wizard post once, beta_wizard_complete once, saved run removed |
| 3 | Start fresh | PASS | one `{"clear":true}`, panel gone, first screen usable, email focused, nothing stored; later posts use a new session id, not the saved one. (Flag deletion cannot be seen on http: Chrome refuses to set a Secure cookie there. Proven on TLS in case 14.) |
| 4 | Slow restore answer (3 s) | PASS | typed in email: no panel, typed text kept. Left the first screen: no panel, not moved back. Slow `done` or `none` after typing: ignored. Extra: see defect S2 |
| 5 | done | PASS | last section only, "Got it." (page shows it uppercase), empty player card, no name, no posts, no beta_wizard_complete, `beta_wizard_resume {step:"done",via:"link"}`, dots all in final state, nothing stored. Screenshot done-*.png |
| 6 | none | PASS | dead-link line in role=status, wizard usable. See defect S1 (spacing) |
| 7 | 503 | PASS | 503 then 200: one retry 1.5 s later, panel appears. 503 twice: two calls, no error text, no panel, flag cookie kept, a reload asks again. Dropped connection then 200: retried once. 429: one call, no retry, flag kept |
| 8 | Saved local run plus flag | PASS | one `{clear:true}`, no panel, local email and screen kept, nothing from the link, via:"device" |
| 9 | Same-device resume | PASS | `{step:"player_card",via:"device"}` once, zero restore calls without the flag |
| 10 | Time zones | PASS | Toronto Eastern, Vancouver Pacific, Edmonton Mountain, Winnipeg Central, Regina Central, Halifax Other, St_Johns Other, Boise Mountain, Indiana/Tell_City Central, Mexico_City Other, Puerto_Rico Other, New_York Eastern, Europe/London Other (page default). Hand pick survives Back/forward and reload and is what the final post sends (timeZone Pacific, tz America/Toronto). A never-picked Eastern guess is not restored over a Vancouver guess. A hand-picked Alaska is restored in a New York browser. A link restore keeps the browser guess and leaves tzSet false |
| 11 | Leaks | PASS | no local request URL, vendor request or dataLayer entry carries name, fun fact, note, email or the token; GA events are only the three beta_wizard_* names with step/via; the token cookie goes to no request except the restore call. 132 vendor stub requests and 44 aborted font requests recorded |
| 12 | Screenshots | done | screenshots/: panel, after-resume (stage 2, availability), after-resume-stage1 (player card), done, none, first-screen-plain, each -1440 and -390 |
| 13 | Keyboard, status role | PASS | Tab order: logo, Start fresh, Pick up where I left off, email, Back, Continue. One role=status region, first child of the first screen, buttons type=button, both 60 to 70 px tall. Enter on Pick up and Space on Start fresh work; focus lands on a field (stage 1: the player name) or the email field |
| 14 | Extra: end to end over TLS (https://ekuzo.gg:3101 via tlsproxy.mjs) | PASS | real 302 to /season1/beta/start, no token or query in the final URL; Set-Cookie attributes as specified; the page read the flag and called restore with the token cookie; the real Secure delete removed the flag after the 200; a reload made no second call |

Screenshots were read. Panel, after-resume and done look right at both sizes. The none line is cramped against the heading (S1).

## C. HTTP proofs (curl.txt, curl-restore.txt)

| # | Request | Result |
|---|---|---|
| 1 | GET /season1/beta/r/<65 chars> | PASS: 302, `Location: /season1/beta/start`, `ekuzo_brt=...; Path=/api/season1-beta; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`, `ekuzo_brf=1; Path=/season1/beta; Max-Age=1800; Secure; SameSite=Lax`, `cache-control: no-store`, `referrer-policy: no-referrer`, `x-robots-tag: noindex` |
| 2 | same with `?utm_source=x&utm_medium=email` | PASS: Location has no query and no token. Middleware set `ekuzo_lc`; decoded it is `{"path":"/season1/beta/r/","ts":...,"utm_source":"x","utm_medium":"email"}`. The token is not in it. Finding C1 is closed. Middleware does run on this path |
| 3 | 64 chars, 66 chars, a dot, `%2F`, `%00` | PASS: 302 to the wizard, no `ekuzo_brt` or `ekuzo_brf` cookie (middleware's own `ekuzo_origin` only) |
| 4 | empty token (`/season1/beta/r/`) | 308 to `/season1/beta/r`, then 404; no cookie. Fine |
| 5 | HEAD | 302, cookies set (same as GET) |
| 6 | POST | 405 |
| 7 | GET with a bot user agent | 302 with the cookies; a scanner that does not run scripts calls nothing |
| 8 | restore, Origin https://evil.example, valid cookie | PASS: 403 `{"ok":false,"error":"Forbidden"}`, no Set-Cookie, no-store |
| 9 | restore, Sec-Fetch-Site cross-site | PASS: 403 |
| 10 | restore, no cookie | PASS: 200 none, both cookies cleared |
| 11 | restore, bad-shape cookie | PASS: 200 none, both cleared |
| 12 | restore, GET | PASS: 405 |
| 13 | restore, valid canonical cookie, no DATABASE_URL, `{}` and `{confirm:true}` | PASS: 503 `{"ok":false}`, cookies kept. (A first attempt used a shape-valid token whose last character carried stray bits; the route correctly read it as none. See note in curl-restore.txt) |
| 14 | restore, `{clear:true}` | PASS: 200 none, both cleared |

## D. Adversarial unit tests (lib/season1/__tests__/betaRestartAdversarial.test.ts)

16 tests, 16 pass (adversarial-run.txt). Covered: forged id with another family's signature; signatures made with the raw secret, another HKDF label, no label, a plain HMAC; other livemode; replay after completion (done, nothing returned); replay after a new session; confirm without a peek; confirm plus clear; extra body fields; array, string, number, null, 100 KB, invalid JSON bodies; two `ekuzo_brt` values in one Cookie header; percent-encoded, padded, truncated, extended and bit-flipped tokens; script tag, formula, RTL mark and 10 KB fun fact in a stored answer; cross-site POST; limiter at 100 calls and with no address; constant-time compare read from the code.

Observations: the script tag is returned as plain text with the angle brackets stripped (`scriptalert1scriptZed`); the fun fact is cut to 120 characters, the formula and RTL mark pass through as text (the page puts them in `.value`, so inert); one non-allowed entry in `playsOn` drops the whole list (existing `partialAnswers` rule); 100 calls from one address give 60 x 200 then 40 x 429, cookies kept; with no address the shared bucket gives 429 from call 601; spoofable headers (`x-forwarded-for`, `x-real-ip`) are not used as an address; the compare is `timingSafeEqual` on decoded bytes after a length check, no `===` on secrets.

Protection-off proofs (scratch copy at /tmp/sentry-scratch, real tree untouched; protection-off.txt):

| Protection removed | Tests that fail | Control (unmodified copy) |
|---|---|---|
| signature check (`if (!signed) return none()`) | 5 of 16 fail (1, 2, 5, 10, 11) | 16 of 16 pass |
| Origin guard (`isCrossSite`) | 1 fails (14) | |
| strip of note/timeZone/tz/times | 2 fail (12, 13) | |

## E. Requirements review

| ID | Proof | Verdict |
|---|---|---|
| L1 | curl.txt (65-char `[A-Za-z0-9_-]` token), betaRestart.test.ts, adversarial 1, 2, 11 | PASS |
| L2 | curl.txt rows 1 to 7, TLS case 14 (no HTML, no vendor tag on the redirect) | PASS |
| L3 | restore unit tests (mocked Neon), adversarial 3, 4, 5; the only table statement is a select | PASS (mocked). NOT PROVEN HERE: the SQL itself (`make_interval`, `::uuid`, `attribution->>'src'`) has not run on Postgres |
| L4 | adversarial 1, 4, 5; curl rows 10, 11 (same status and shape for every non-resume case) | PASS (mocked) |
| L5 | adversarial 2 (derived key only), 5 (new session kills the link), 16 (constant time); zero diff on package.json, no env added | PASS. NOT PROVEN HERE: `S1_REF_SECRET` present in the Netlify Production context (C5) |
| L6 | adversarial 4 (reuse until done), restore unit tests for cookie clearing on confirm, browser case 14 | PASS |
| L7 | betaWizard.test.ts and betaProgressScript tests in the suite (mocked Klaviyo); static read of the diff | PASS (mocked). NOT PROVEN HERE: real profile property in Klaviyo, the email's merge tag in Wf7Nam, `S1_DEPLOY_CONTEXT`/`CONTEXT` and `DEPLOY_PRIME_URL` visible in the function runtime (builder note 13) |
| L8 | browser cases 2, 5, 6, 8 at both viewports | PASS |
| L9 | restore unit tests (source cookie rules) | PASS (mocked). NOT PROVEN HERE: the cookie surviving a real finish on another device with a real row |
| L10 | adversarial 15, static log grep, server-3100.log | PASS |
| Z1 | browser case 10 (13 zones) plus the builder's table tests | PASS |
| Z2 | table test in betaProgressScript.test.ts (in the passing suite) and browser case 10 | PASS |
| M1 | no token in any Location, URL, vendor request, dataLayer or log in this run; `ekuzo_lc` decoded; final URL on TLS | PASS |
| M2 | cases 2.s0 to 2.s2: zero posts, zero step events on restore | PASS |
| M3 | case 5 and adversarial 4 | PASS |
| M4 | case 4 | PASS, with the edge in defect S2 (a tap already in flight) |
| M5 | no write statement on the progress table (unit test); adversarial 4 | PASS (mocked) |
| M6 | case 10 | PASS |
| M7 | zero-diff.txt | PASS |
| M8 | case 1 | PASS |
| J1 | browser: restore at stage 1 on a "second device" context, finish with the same session id (case 2.s1) | PASS for the browser half. NOT PROVEN HERE: one family, one player, progress row done, source kept in a real database |
| J2 | curl row 7 (bot GET), case 14 (tap twice), adversarial 4 | PASS |
| J3 | case 5, adversarial 4 | PASS (mocked) |
| J4 | adversarial 5, case 6 | PASS (mocked). NOT PROVEN HERE: new run on a real row issues a new link and kills the old one |
| J5 | case 8 | PASS |
| J6 | case 10 | PASS |

## NOT PROVEN HERE
1. The restore SQL on a real Postgres, and a real round trip: save progress, read the link from the Klaviyo profile, tap, resume, finish.
2. `S1_REF_SECRET` in the Production context; `S1_DEPLOY_CONTEXT`/`CONTEXT` and `DEPLOY_PRIME_URL` in the function runtime, so that `beta_restart_link` is written.
3. Klaviyo: the profile property arrives, Wf7Nam uses `{{ person.beta_restart_link|default:... }}`, Klaviyo click tracking and the redirect together (a tracked link that lands on the /r/ path).
4. Safari, iOS Mail and Gmail in-app browser handling of a Secure cookie set on a 302 (only Chrome was run).
5. The `ekuzo_bsrc` source cookie on a real finish.
6. Netlify CDN behavior for the 302 (no-store honored, Set-Cookie not cached or stripped).
