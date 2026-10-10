# Sentry summary (cycle 1)

Target `release/season1` 4457689 production build. Reference 2f3a83f, base 3aefd6c. Date 2026-10-10.
Method notes: `next build` ran in an isolated `git archive` copy (`/home/claude/s1-qa`) because another agent was building in s1-rel at the same time; `.next` in s1-rel is not from this run. Build needs dummy Stripe env vars (see D8). All Klaviyo and Meta traffic was mocked; the route harness replaces `fetch`, the browser tests intercept `/api/season-one`, `connect.facebook.net` and `clarity.ms`.

| Req | Result | Evidence |
|---|---|---|
| P1 | PASS (with D1 on typography) | `http-checks.txt`; `browser-tests.txt` B10 (d1..d12 plus d01, D3, d99, none: all 200, URL stays /season1, 12 distinct variants; d1 "We've all said it", d3 "Play to win", d10 "Screen time with a purpose"; `/roadshow/landing.html` 200) |
| P2 | PASS | B03, B03b, B04, B12 (invalid email inline error; 502, network failure and 400 show retry/error, no confirmation, no Lead) |
| P3 | PASS | B02, B07 (chips, multi-select, debounced `step:games` POST) and harness C04 (Klaviyo only) |
| P4 | PASS | B06, B07, B08, B09 (`?join=season-one`, nav CTA, register link interception, first-visit auto-open at 2.5 s, 7-day snooze) |
| P5 | PASS | `http-checks.txt`: register routes 307 to `<program>?join=season-one` with query preserved; trailing slash and legacy `/camps/register` end in the same place via 308; all four `/success` pages 200 untouched |
| P6 | PASS | `http-checks.txt`: review.html, ad-lab, vote, ads, index, site, /roadshow/ and `/ads/season1/*.jpg` all 404; `public/roadshow` holds only landing.html |
| P7 | PASS | `<meta name="robots" content="noindex">` present (no X-Robots-Tag header; meta only) |
| T1 | PASS | B01, B06 (pixel 1284038230557204 init once, PageView exactly once) |
| T2 | PASS | B02, B03, B03b, B07, B08, B12 (one Lead only after API ok, eventID equals POSTed eventId, retry reuses it, no Lead while pending, no second Lead on second submit; see D6) |
| T3 | PASS | `route-harness.txt` C01, C02, C02b, C02c, C03, C03b, C15 (v26.0 URL, awaited, after Klaviyo event, em sha256, ip/ua/fbp/fbc, fbc rebuilt from fbclid, content_name, event_id; see D5 for the free-text note) |
| T4 | PASS | C01, C04, C05, C20 (no child keys or values in any CAPI payload; games/age steps make zero Meta calls); B02/B07 (no fbq call after chips) |
| T5 | PASS | C04, C05, C05b |
| T6 | PASS (request shape only) | C01, C19 (metric name, event props, `season1_*` profile props, list XGTv2F, SUBSCRIBED). Live write not tested (L2) |
| T7 | PASS | B01, B06 (Clarity tag `wml8wll5ua` requested) |
| T8 | PASS | B05-* (127.0.0.1, preview.example.test, evilekuzo.gg, ekuzo.gg.evil.test: no POST, no Lead; www.ekuzo.gg, foo.netlify.app, localhost: POST and Lead) |
| T9 | PASS | C13, C14, C14b |
| S1 | PASS | C10 (200, zero fetches); B01, B06 (field hidden: offscreen, aria-hidden, tabindex -1, opacity 0, never focused) |
| S2 | PASS with MINOR findings D2, D5 | C11, C11b, C16, C17, C21, B11; `s2-secrets-in-client.txt` (no secrets or API hosts in `.next/static`); access token not logged (C07) |
| S3 | PASS with MINOR D3 | C06, C07, C08, C08b, C09, C09b |
| S4 | ASSESSED, accepted-risk pending Fable (D4) | C10b |
| N1 | PASS | `n1-protected-diff.txt` (zero diff on all protected surfaces) |
| N2 | PARTIAL: tsc PASS; build PASS (needs dummy Stripe env, D8); mp4 count 0 PASS; `.next/server` 39M recorded; ESLint FAIL on strict reading (1 pre-existing error in Nav.tsx, D8) | `n2-tsc.txt`, `n2-eslint.txt`, `n2-eslint-base-nav.txt`, `n2-build.txt`, `n2-build-full.txt`, `n2-build-attempt1-no-env.txt` |
| N3 | PASS | `n3-console-compare.txt` (7 pages at 1440 and 375 vs base: 0 uncaught page errors, 0 hydration or invalid-DOM messages, 0 findings new vs base; pre-existing noise listed as D7). `browser-tests-run1-with-strict-n3.txt` is the first run, kept for transparency: it flagged only that same pre-existing noise |
| N4 | PASS (0.0000% on all 14 pairs) with D1 | `visual-diff.txt`; screenshots `landing-{d1,d3,d10}-{1440,375}-empty`, `landing-d3-{1440,375}-confirm`, `popup-{1440,375}-{empty,confirm}` (+ `-tall` at 375), each with a `ref-` twin. Popup reference was feasible (built and served 2f3a83f on :3200). Webfonts fail on both sides (D1); `*-fontfix.png` show intended typography |
| L1 to L4 | NOT TESTED | require deploy, real keys, human checks |

Test counts: route harness 30/31 cases passed (the one failure is D2, case C11b); browser tests 20/20; HTTP checks as listed. Servers on :3100, :3200, :3400 and :3300 are stopped.

## Cycle 1 retest (2026-10-10)

Target: git archive of 4457689 plus the four uncommitted working-tree files (`app/api/season-one/route.ts`, `public/roadshow/landing.html`, `components/ui/SeasonOnePopup.tsx`, `app/layout.tsx`) in `/home/claude/s1-qa2`, `node_modules` hard-linked with `cp -al`. Reference 2f3a83f and base 3aefd6c built earlier. All servers stopped afterward. All Klaviyo and Meta traffic mocked.

**Harness changes, each tied to a decision in `03-decision-log.md`** (originals kept as `route-harness.cycle1.ts` and `browser-tests.cycle1.mjs` in `/home/claude/s1-tests/`):
- C09b (decision 2, D3): a thrown subscribe fetch now expects 200 plus one Lead and a logged failure, not 502 and no Lead.
- C03c, C16, C17 (decision 7, D5): an invalid or oversize `ad` is dropped and content_name falls back to `season_one_landing` (was: capped at 40 chars); non-string utm values become `''` (was: stringified).
- C11b unchanged (null body must be 400); new C22 (ad allowlist table, 13 rows) and C23 (six non-object bodies).
- B01 and B06 now assert the `set autoConfig false` call precedes `init` (decision 4); new B14 and B15 (honeypot filled: no browser Lead, landing top and bottom, popup; decision 6); new B16 (font stylesheet URL and faces, decision 5).
- N4 now runs twice: against the reference as shipped, and against the reference rendered with the corrected font URL, to prove fonts are the only delta.

| Check | Result | Evidence |
|---|---|---|
| Route harness | 33/33 PASS (30/31 in cycle 1; C11b now passes, C09b/C03c/C16/C17 rewritten to the new spec, C22/C23 new) | `route-harness-retest1.txt` |
| Browser tests | 23/23 PASS (20 in cycle 1 plus B14, B15, B16). T1, T2, T8, honeypot on both surfaces, autoConfig-before-init on landing and site | `browser-tests-retest1.txt` |
| HTTP | P1 d1..d12 200, noindex, P5 four 307s, success pages untouched, P6 404s, autoConfig line before init in served landing HTML and in SSR home HTML | `http-checks-retest1.txt` |
| N2 | tsc PASS; build PASS (dummy Stripe env); 0 mp4; `.next/server` 39M; no secrets in `.next/static`; ESLint still 1 pre-existing error (Nav.tsx:55) and 1 warning (layout.tsx img), both on base (D8, waiver recommended) | `n2-tsc-retest1.txt`, `n2-eslint-retest1.txt`, `n2-build-retest1.txt` |
| N3 | PASS: 0 uncaught errors, 0 hydration/invalid-DOM, 0 findings new vs base on 7 pages at 1440 and 375. Landing pages now fully clean (the blocked fonts.googleapis request from D1 is gone). | `n3-console-compare-retest1.txt` |
| N4 vs reference as shipped | landing 4.36% to 12.83% (font change), popup 0.0000% | `visual-diff-retest1.txt`, `screenshots/retest1/` |
| N4 vs reference with corrected font URL | 0.0000% on all 14 pairs: the font URL is the only visual delta. Checked by eye on d1 at 1440 (ours vs as-shipped reference): same layout, colours, copy and images; only the typeface (Space Grotesk instead of the system fallback) and the resulting wrap and page height differ | `visual-diff-retest1-reffix.txt`, `screenshots/retest1-reffix/` |

**Defects:** D1, D2, D3, D5 CLOSED. D4 (accepted, decision 1), D6 and D7 and D8 (accepted or pre-existing, decision 8) unchanged. CR-3 (autoConfig, both surfaces) and CR-7 (honeypot browser Lead, both surfaces) verified closed in code; logged as rows R-CR3a, R-CR3b, R-CR7a, R-CR7b in `../05-defect-log.md`.

**Caveats:** the harness stubs `fbevents.js`, so it proves the `set autoConfig false` call is made first but cannot observe the real SDK's automatic events; Events Manager "Automatic events" (H5) and every L-requirement remain human or live checks. T6 and the Meta wire acceptance of T3 are request-shape only until L2.

## SC-1 verification and Phase 6 adversarial (HEAD ca6e745, 2026-10-10)

Target: `git archive` of ca6e745 in isolated copies (dummy Stripe env, `cp -al` node_modules). No network calls to Klaviyo or Meta (fetch mock).

| Check | Result | Evidence |
|---|---|---|
| Route harness (my own, C01 updated to 18 event keys, new C24 to C31) | 41/41 PASS | `sc1-route-harness.txt` |
| Browser suite (EXPECT_ATTR extended, new B17) | 24/24 PASS | `sc1-browser-tests.txt` |
| N2 | tsc PASS; build PASS (dummy Stripe env); ESLint unchanged (pre-existing Nav.tsx error and layout.tsx warning, both on base) | `sc1-n2-*.txt` |
| N3 console on `/season1?ad=d3` and the other pages | 0 findings new vs base | `sc1-n3-console-compare.txt` |
| T10 | PASS (landing sends utm_id and site; route stores them) | ledger T10 |
| T11 | PASS (x-nf-geo base64, plain JSON, garbage, absent; UA classification; CAPI byte-identical; games, age, honeypot carry nothing new). Live half deferred | ledger T11 |

Phase 6: no CRITICAL; 2 MAJOR (D9 no upstream timeouts, route hangs; D10 native-submit puts the email in the URL when the script is not running); 2 MINOR rows (D11, D12); decisions 1, 2, 8 behavior confirmed, not re-reported. Middleware: no open redirect, no loop. Details, deferred live checks B-1 to B-7 and the retest plan: `06-adversarial.md`; evidence `adv-route-http.txt`, `adv-middleware.txt`, `adv-browser.txt`.

## Cycle 2 retest (HEAD f413246, 2026-10-10)

Target: `git archive` of f413246 in `/home/claude/s1-qa4` (dummy Stripe env, `cp -al` node_modules); real `next start` with the Klaviyo/Meta fetch mock; no external calls. Harness changes: C15 updated to the 64-char eventId cap (ADV-6, by design); new C32a to C32e (timers), C33 to C36; fetch mock now honors `init.signal`; adv-browser BA6b (three injected script failures).

| Check | Result | Evidence |
|---|---|---|
| Route harness | 50/50 PASS (41 SC-1 cases, C15 updated, 9 new) | `cycle2-route-harness.txt` |
| Browser suite incl. SC-1 B17 | 24/24 PASS | `cycle2-browser-tests.txt` |
| Adversarial browser (BA1 to BA9, BA6b x3) | 12/12 PASS (BA5, BA6, BA7 were FAIL before) | `cycle2-adv-browser.txt` |
| Adversarial route on a real server | stalls resolve at 3.5 s (502), 2.5 s and 2.0 s (200); worst case 7.8 s | `cycle2-adv-route-http.txt` |
| N2 | tsc PASS; build PASS; 0 mp4, `.next/server` 39M, no secrets in `.next/static`; ESLint unchanged (pre-existing Nav.tsx error and layout.tsx warning, both on base; nothing in the changed files) | `cycle2-n2-*.txt` |
| N3 console | 0 findings new vs base (d3 at 1440 and 375 clean) | `cycle2-n3-console-compare.txt` |
| d3 pixel check vs cycle 1 retest | 0 px differ (0.0000%) at 1440 and 375, empty and confirmation states | `cycle2-visual-diff-d3.txt`, `screenshots/cycle2/` |

D9, D10, D11, D12 CLOSED. No CRITICAL or MAJOR open. Residuals (MINOR, accepted, listed in `06-adversarial.md` section D): foreign-host `event_source_url` and unchecked fbclid format; zero-width characters in email; retry after an upstream-timeout may duplicate a Klaviyo event; no-JS dead form. Live checks B-1 to B-7 still open for the human pass.

## Cycle 3: D13 independent retest (release a431139, feat 0559395, 2026-10-10)

Fresh `git archive` copies of both branches (`/home/claude/s1-qa5` release, `/home/claude/s1-qa6` feat), dummy Stripe env, `next build` then `next start` with the Klaviyo/Meta fetch mock. Harness change: the old B10 check that `/roadshow/landing.html?ad=d3` returns 200 now expects 404 and also asserts `/season1?ad=d3` (200, URL unchanged, "Play to win"); every other landing URL in the browser and adversarial suites was already `/season1?...`. Original kept as `browser-tests.cycle2.mjs`.

| Check | Result | Evidence |
|---|---|---|
| Build route table | `○ /season1` (static); no `/roadshow` or rewrite rule left in next.config.mjs or netlify.toml | `cycle3-d13-http.txt` |
| Served body vs `app/season1/landing.html` | byte-identical (1,303,686 bytes) for three query strings; equals the git blob | `cycle3-d13-http.txt` |
| `/roadshow/landing.html`, `/season1/landing.html` | 404 | same |
| `/season1/` | 308 to `/season1`, query preserved | same |
| Browser suite | 24/24 | `cycle3-browser-tests.txt` |
| Adversarial browser suite | 12/12 | `cycle3-adv-browser.txt` |
| Route harness (unchanged) | 50/50 | `cycle3-route-harness.txt` |
| N3 console | 0 findings new vs base; `/season1?ad=d1`, `d3`, `d10` clean at 1440 and 375 | `cycle3-n3-console-compare.txt` |
| Feat: `/roadshow/index.html`, ad-lab | all links go to `/season1?ad=dN` and open the right variant; 12/12 ad-lab iframe previews render hero and form; `preview=done` shows the confirmation | `cycle3-feat-roadshow.txt`, `screenshots/cycle3/` |

D13 CLOSED for the build and local half. Still pending: L1 on the Netlify dev deploy after redeploy (the failure only existed on Netlify's Next runtime). New MINOR D14: feat `public/roadshow/index.html` still shows the old `landing.html?ad=d9&utm_...` link format as text (Meta link guidance now 404s). Also to confirm live: `/season1` now runs through the site middleware and carries `Set-Cookie` plus `s-maxage=31536000`, so check the CDN does not share one visitor's cookie.
