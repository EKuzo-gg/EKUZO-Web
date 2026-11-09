# Atlas self-test: Slice 2 (landing speed and stability), 2026-11-09

Branch `lane/atlas` (cut from `build/s1-cls-field` at `d6e3ba3`). Reference = main's landing, served
from `/home/claude/wt-main` (`45dfe97`; its `landing.html` and `route.ts` are byte-identical to
`d6e3ba3`) on port 3103, because 3101 was closed when I started. Branch build on port 3100.
Final branch build marker: `s1-build=d35ea36` (the commit before this doc commit; landing and route
are unchanged after it).

## 1. What changed, by spec item

| Item | Change | Status |
|---|---|---|
| 1 | Head bootstrap script after `<title>`, before `{{TAGS}}` and before any stylesheet. Defines `window.S1 = {AD_HERO, HERO_KEYS, IMG, HERO_IMG, FAM, FONT_BASE, FONTS}`. Reads `?ad=`/`?hero=` with the small script's normalisation (d1 for a missing or unknown ad, as the big script does). `document.write`s the preload links, then the per-ad fonts stylesheet, then the async safety-net stylesheet. Wrapped in `try/catch`; the catch writes the blocking all-families stylesheet (today's path). | done |
| 1 | Small script reads `AD_HERO`/`HERO_KEYS` from `window.S1`; logic unchanged. Big script `const IMG = window.S1.IMG;` and the jersey override lines (old 1003 to 1004) folded into the head table. | done |
| 1 | Preload rule: page A (and every variant at >= 960 px): every hero image in template order, first with `fetchpriority="high"`. Interactive heroes on phones: the first image only (it is reused as `.ih-bg`); shortlist (custom, no image on phones): nothing. | done |
| 2 | Per-ad fonts: `FONT_BASE` (Inter Tight 500/700/800, JetBrains Mono 500/700) plus `FONTS[id]`, using the exact family tokens of the old URL. The static all-families link is now only a `<noscript>` copy. | done, one deviation (below) |
| 3 | `<style>html{background:#0B0A0D}</style>` (the effective `body` background, line 639 overrides line 18). | done |
| 4 | `fitHero` also reruns on `document.fonts` `loadingdone` and on `#s1-fonts` `load` (one added line; window `load` and `fonts.ready` were already there). | done |
| 5 | `min-height:80vh;min-height:80svh` in the `pre-ih` phone rule. | done |
| 6 | `loading="lazy"` on `img.tk-av`. | done |
| 7 | `data-clarity-mask="true"` on `#em-top`, `#em-end`, `#tk-ph`, `#tk`. | done |
| 8 | `signal: AbortSignal.timeout(15000)` on the one `fetch` in `post()` (guarded: `undefined` where `AbortSignal.timeout` is missing, so old WebViews keep today's behaviour). The existing catch already handles `TimeoutError` like a network error: no change to it. `post()` also serves the games step and Text Karlin, which get the same timeout through their existing catches. | done |
| 9 | `data-s1-pre="pa"`/`"ih"` on `#lp` in the small script's two branches; `document.documentElement.dataset.s1Ready="1"` as the big script's last statement. | done |
| 10 | `<meta name="s1-build" content="{{BUILD}}">`; `route.ts` fills it from `COMMIT_REF` (7 chars) or `git rev-parse --short HEAD`, else `dev`. `fillTags` call unchanged. `app/season1/thanks/route.ts` untouched (`git diff` empty). | done |
| 11 | L4 srcset on the d19/d21 `.ph`. | tried, dropped (below) |
| 12 | Spec item 11, pre-ready submit replay. | skipped by default (no harness measurement of the pre-ready tap window was available to me) |

### Deviations (for Fable's decision log)

1. **Placement.** The bootstrap is not the literal first child of `<head>`: `meta charset`, `viewport`,
   `robots` and `<title>` stay first (charset must sit in the first 1024 bytes; the bootstrap reads
   `innerWidth`, so the viewport meta must precede it). It is the first script and precedes every
   stylesheet and `{{TAGS}}`.
2. **Parser-inserted links (`document.write`)** rather than `createElement`. A script-created
   stylesheet is neither script-blocking nor render-blocking (only `blocking="render"`, Chrome 105+,
   makes it render-blocking). Parser-inserted keeps exactly today's semantics on every WebView: the
   per-ad sheet blocks render and scripts as line 7 did, only smaller. Consequence: the `#s1-fonts`
   `load` hook in item 4 is in place but in practice fires before the big script runs.
3. **Safety net = the other families only, not all families.** The spec says line 7 becomes the async
   all-families sheet. I first built exactly that (commit `186159b`), then replaced it (`d35ea36`) with
   an async sheet of the families the ad did not request, written by the bootstrap. Reason: with all
   families, every family the ad uses gets a second, later `@font-face` rule; by the CSS Fonts matching
   rule the last-defined face wins, so in-use text can be sent back to a "loading" face. My probe could
   not separate that from ordinary first loads (Google splits each weight into unicode-range subsets, so
   duplicate names in `document.fonts` are normal), so this is a precaution, not a measured defect. The
   complement sheet keeps U-6's net (every family still arrives) with no overlap; the test asserts
   per-ad + complement = all 15 tokens, disjoint. The `<noscript>` copy and the failure path still use
   the full sheet.

## 2. Commands and results

| Check | Command | Result |
|---|---|---|
| Install | `npm ci --no-audit --no-fund` | ok |
| Unit tests | `npm test` | **587 tests, 586 pass, 1 skipped, 0 fail** (main: 574 pass, 1 skipped; +12 in `lib/season1/__tests__/landingHead.test.ts`) |
| Types | `npx tsc --noEmit` | clean |
| Build | `STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npm run build` | clean, exit 0 |
| Serve | `STRIPE_SECRET_KEY=… ./node_modules/.bin/next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid` | see note |

Server note: started through `npx`, `$!` is the npm wrapper and `kill "$(cat .server-3100.pid)"`
leaves the `next-server` child running. One orphan (pid 15621, cwd `wt-atlas`) kept serving the
first build on 3100 and made two of my restarts fail with EADDRINUSE; I found it by `/proc/*/cwd`,
killed it by pid and reran everything after that on the right build (marker checked with curl each
time). Starting `./node_modules/.bin/next start` directly makes `$!` the server itself. Worth a line
in the runbook for Sentry and Chronos.

New test, `landingHead.test.ts` (evaluates the head bootstrap, `D` and `T` in `vm`, parses the CSS):
(a) every `D` entry's `<img src>` list in template order equals `HERO_IMG[id]` and each file exists;
(b) every family an ad paints (T font, template CSS rules whose classes all occur in that ad's art,
module CSS, art markup) is in `FONT_BASE + FONTS[id]`, and no CSS rule names a family no ad is
credited with; (c) the body no longer defines `AD_HERO`/`HERO_KEYS` and reads `IMG` from the head;
plus the noscript URL equals `FAM`, only `shortlist` is a custom hero, per-ad preload and font output
for d19, d18, `D019`, noad, `zz`, d2, d8, d10, d4, `hero=` overrides and 1440 px, preloads before
the fonts link, and the catch path writing the blocking full sheet.

## 3. Pixel parity (N1a method)

Script: `scratchpad/atlas-pixel.mjs` (Playwright 1.63 Chromium, proxy for Google Fonts, analytics
hosts blocked by host-resolver rules and routing, `POST /api/*` aborted, `reducedMotion: reduce`, CSS
animation and transition freeze, `Math.random` = 0.25, localStorage cleared, after `load`,
`document.fonts.ready` and every non-lazy image decoded, full-page screenshot; sharp diff, channel
difference > 8, largest 8-connected region). Pass: < 0.1% and no region >= 12 x 12.

Full matrix, state `initial`: d1 to d21 and noad at 360x780@3, 412x915@2.625, 1440x900@1 = 66 pairs.
63 pairs at 0.0000%. Three pairs flagged on the first pass and were 0.0000% on rerun:

| Pair | First pass | Rerun |
|---|---|---|
| d4 412 | 0.0405%, region 17x22 | 0 |
| d5 412 | 0.1126%, region 40x94 | 0 |
| d13 360 | 0.0542%, region 17x34 | 0 |

Control: main vs main (same server, two loads), d1 to d21 and noad at 360 and 412 (44 pairs): two
pairs flagged the same way (d17 412 0.0455% 17x22; d20 360 0.1199% 28x67), all others 0. The flagged
pixels are spread thinly over every text block on the page (row-band histogram in my scratch log),
which is text rasterisation noise in this headless Chromium, not a layout or font change. Sentry
should run N = 2 and count a pair as failing only if it fails twice.

Key pairs (the table the brief asks for):

| Ad | 360 | 412 | 1440 | 412 email focused + 1 char | 1440 email |
|---|---|---|---|---|---|
| d18 | 0 | 0 | 0 | 0 | 0 |
| d19 | 0 | 0 | 0 | 0 (rerun; first pass 0.1083% 24x63, same noise) | 0 |
| d2 | 0 | 0 | 0 | 0 | 0 |
| d4 | 0 | 0 (rerun) | 0 | | |
| d11 | 0 | 0 | 0 | | |
| noad | 0 | 0 | 0.0253% region 9x13 (pass) | 0 | 0 |

Screenshots (lossless PNG, recompressed): `docs/s1-cls-field-2026-11/screenshots/`
`{d18,d19,d2,noad}-{412,1440}-{initial,email}-{main,branch}.png` (32 files).

## 4. Load order and fonts (probe `scratchpad/atlas-probe.mjs`, 412x915@2.625)

Branch head after the bootstrap (d19): `style`, `meta s1-build`, `script`, `link preload fp=high
team-walk-1600.webp`, `link preload southie-back.webp`, `link stylesheet #s1-fonts (Inter Tight,
JetBrains Mono, Rubik)`, `link stylesheet media=print (the other 12 families)`, then the tag scripts.
d2: one preload (`couch.webp`, high), then fonts (Archivo, Archivo Black, Inter Tight, JetBrains Mono), then the safety net.
d4 (shortlist): no preload.

Resource timing, unthrottled, final build `d35ea36` (ms from navigation; start to responseEnd;
main from the same probe against port 3103):

| Ad | Hero image, branch | Hero image, main | Per-ad fonts CSS, branch | Fonts CSS on main (all families) |
|---|---|---|---|---|
| d18 | 47 to 68 | 518 to 563 | 49 to 429, blocking | 44 to 435 |
| d19 | 53 to 64 (+ southie-back 54 to 73) | 290 to 330 | 54 to 185, blocking | 56 to 239 |
| d2 | 57 to 68 | 247 to 339 | 58 to 170, blocking | 29 to 173 |
| d4 | 229 to 248 (no preload, shortlist rule) | 253 to 281 | 42 to 174, blocking | 55 to 202 |
| d11 | 38 to 55 (+ jersey-back 39 to 56) | 319 to 348 | 39 to 191, blocking | 50 to 246 |
| noad (d1) | 30 to 43 | 297 to 329 | 30 to 148, blocking | 32 to 221 |

The safety-net sheet (the other families) reports `non-blocking` on every variant. The hero image
request starts before the per-ad fonts CSS finishes on every page A variant. Main fetches
`karlin-oei-avatar.jpg` at 29 to 80 ms on every variant; the branch never requests it (L7).

Throttled (1.6 Mbps, 150 ms, CPU 4x, N = 1, indicative only; Chronos's harness is the measure):

| | d18 branch | d18 main | d19 branch | d19 main |
|---|---|---|---|---|
| hero image start to end | 225 to 838 | 1204 to 1743 | 228 to 2588 | 1262 to 3087 |
| fonts CSS end | 650 | 784 | 601 | 933 |
| first-contentful-paint | 788 | 952 | 1012 | 1080 |
| CLS (load, no scroll) | 0.0035 | 0.0035 | 0.0015 | 0.0015 |

`document.fonts.check` after ready, branch: true for every face the ad renders (Inter Tight
500/700/800, JetBrains Mono 700, Rubik 500/900 on d19; Archivo 700 and Archivo Black on d2;
Bricolage 800 on d4). False only for faces no text on the page has used yet (JetBrains Mono 500,
Archivo 400/600, Bricolage 500), which `check` reports false until used.

Safety-net sheet delayed 3 s (`atlas-probe.mjs … 3000`), final build: CLS per variant equal to the
undelayed run (d18 0.0035, d19 0.0001, d2 0.0004, d4 0.0017, d11 0.0001, noad 0.0003, the same as
main's 0.0035, 0.0001, 0.0004, 0.0017, 0.0001, 0.0003); no face went to loading after it applied.
The same delayed run on the first build (`611e401`, all families async) also showed no face going
back to loading in Chromium, which is why deviation 3 is a precaution (other engines, Safari in
particular, are not tested here), not a fix for a measured defect.

Console: no errors and no page errors on any of the 66 + 8 pixel runs or the probes, branch or main.

## 5. Behaviour checks (`scratchpad/atlas-behave.mjs`, 360x780@3)

- fitHero with every `fonts.gstatic.com` response delayed 3 s, read at 6 s, main vs branch: d1
  `43.2px`, d2 `41.472px --ds 0.96`, d3 `31.968px`, d10 `43.2px`, `#ihero` height 624 on both:
  EQUAL on all four.
- Masks: `em-top`, `em-end`, `tk-ph`, `tk` all carry `data-clarity-mask="true"`.
- Timeout: `/api/season-one` POST held by the route (never reaches the server), tap "Save their
  spot": "Saving…" and disabled; at 15,068 ms the error line reads "That didn’t go through. Check your
  connection and try again.", button "Save their spot", enabled; one `signup_error` with reason
  `network` (the existing branch); no page error.
- Sentinels: `s1Ready="1"` on every probed variant; `data-s1-pre` `pa` on d18, d19, d11, noad and `ih`
  on d2, d4.

## 6. L4 srcset: tried and dropped

Built the d19/d21 `.ph` with `srcset="team-walk-900.webp 900w, team-walk-1600.webp 1600w"
sizes="100vw"` and matching `imagesrcset`/`imagesizes` on the preload. Chromium picks 900 at DPR 2
and 1600 at 2.625 and 3. Pixel diff: 0 at 360@3, 412@2.625 and 1440@1 (all still load the 1600
file), but **412@2: 0.591% (d19) and 0.589% (d21), largest region 145x110**: the smaller file
resamples visibly differently on DPR 2 phones. That breaks the clone rule on real phones the three
test widths do not cover, so it is reverted (not committed). Evidence:
`evidence/atlas/l4-srcset-trial-d19-412x2-{main,branch}.png`. The win it would have bought exists
only on DPR <= 2 phones (78 KB less); the S25 is DPR 3+.

## 7. Changed regions for N4 (strip these before hashing against main)

`git diff -U0 d6e3ba3 -- app/season1/landing.html` hunks (new-file line numbers at `d35ea36`):

| Old | New | What |
|---|---|---|
| after 1 | 2 to 42 | html background style, `s1-build` meta, head bootstrap script |
| 7 | 48 | all-families link replaced by its `<noscript>` copy |
| 656 | 697 | `pre-ih` rule: `min-height:80vh;` added before `80svh` |
| 902 to 903 | 943 to 945 | small script: comment + `AD_HERO`/`HERO_KEYS` read from `window.S1` |
| 909 to 910 | 951 to 952 | small script: the two class branches also set `data-s1-pre` (braces added) |
| 921 | 963 | `#em-top` + `data-clarity-mask` |
| 959 | 1001 | `#em-end` + `data-clarity-mask` |
| 978 to 979 | 1020 to 1021 | `#tk` + `data-clarity-mask`; `img.tk-av` + `loading="lazy"` |
| 983 | 1025 | `#tk-ph` + `data-clarity-mask` |
| 1002 to 1004 | 1044 | big script `IMG` line and the two jersey override lines become `const IMG = window.S1.IMG;` |
| after 1350 | 1391 | fitHero rerun hooks (`loadingdone`, `#s1-fonts` load) |
| 1426 | 1467 | `post()` fetch options: `signal` timeout |
| after 1503 | 1545 | `s1Ready` sentinel |

Everything else in the big script, `D`, `T`, `HERO_DEFS` and the templates is byte-identical to main.
One stale comment remains in the big script ("AD_HERO is defined once, in the small script right after
#hero"): left alone because the big script outside the named lines is hash-checked; the small script
now reads it from the head.

`app/season1/route.ts`: `execSync` import, `buildRef()`, and `.split("{{BUILD}}").join(buildRef())`
on the `fillTags` result.
