# Field vitals harness

Measures layout stability and load speed on the Season 01 landing page (`/season1?ad=…`) the way
Facebook and Instagram in-app browsers on Android phones see it: a phone viewport and UA, CPU slowed
4x, Slow 4G, a cold cache and cold fonts every run, and a scripted visit with touch scrolling,
taps and typing. Built for the s1-cls-field run (`docs/s1-cls-field-2026-11/`, requirements H1 to H9).

## Run it here (the build container)

Playwright 1.63 and Chromium are installed globally; the harness finds them through `createRequire`.
Chromium goes through `HTTPS_PROXY` automatically.

```
# local build of a commit, served with next start on a port
npm run vitals -- --target local:3101 --ads d18,d19,d2,noad \
  --profile fb-android-412,fb-android-360,ig-android-412 --runs 5 --label main-baseline

# live site (tags blocked, nothing submitted)
npm run vitals -- --target https://ekuzo.gg --ads d18,d19 --profile fb-android-412 --runs 3 --label live-before
```

## Run it on a Mac

```
npm i --no-save playwright && npx playwright install chromium
npm run vitals -- --target https://dev--ekuzo.netlify.app --ads d18,d19 --profile fb-android-412 --runs 3 --label mac-check
```

`--no-save` leaves `package.json` and `package-lock.json` alone (a lockfile out of sync breaks the
Netlify install). If Playwright or Chromium is missing, the harness prints that line and exits 2.

Mac calibration note: an Apple Silicon laptop is several times faster than the container, so 4x
CPU throttling stresses the main thread less there. Each `manifest.json` records the machine and a
fixed Node loop time (`calibration.ms`, and `calibMs` in every run). Compare runs from different
machines only after scaling `--cpu` so the loop times line up (for example, if the Mac loop is 3x
faster, use `--cpu 12` to match the container at `--cpu 4`).

iPhone note: WebKit is not installed in the container, and WebKit has no `layout-shift` or
`largest-contentful-paint` entries, so it cannot measure CLS the same way. The iPhone check is a
human check (HC3 in the requirements): Aaron opens `d18`, `d19` and `d2` in Safari and in the
Instagram app and records the screen while scrolling.

## Options

| Option | Meaning |
|---|---|
| `--target` | `local:PORT` (http://localhost:PORT) or a site origin. The page is `/season1?ad=<ad>`; `noad` is `/season1`. |
| `--ads` | Comma list of ad ids, `noad` for none. |
| `--profile` | Comma list from `lib/profiles.mjs`: `fb-android-412`, `fb-android-360`, `ig-android-412`, `ig-android-360`, `chrome-android-412`, `chrome-android-360` (short names without the width mean 412). |
| `--runs` | Runs per profile and ad. Each run is a fresh browser context (empty cache, no fonts). |
| `--label` | Output folder name under `docs/s1-cls-field-2026-11/evidence/vitals/`. Runs with the same label share one table. |
| `--network` | `slow4g` (default: 1.6 Mbps down, 0.75 up, 150 ms), `mid` (10 Mbps, 40 ms), `none`, or a custom `<kbps>k/<rttMs>` such as `400k/400`. |
| `--cpu` | CPU slowdown factor (default 4). |
| `--viewport` | Override width and height, for example `360x640` (short in-app visible area). |
| `--failure` | One failure profile (below). |
| `--fontDelay` | Hold every `fonts.gstatic.com` file request this many ms (S3: 3000). With `fonts-slow` it holds both font hosts. |
| `--fontCssDelay` | Hold the `fonts.googleapis.com` stylesheet request this many ms (U-3 test). |
| `--fontScale` | Emulate the Android text-size setting with `text-size-adjust` (for example 1.3). Check `dom.state.bodyFontSize` in the JSON to see whether it took effect. |
| `--toolbar` | `on` (default) shrinks the layout viewport by 56 then 110 px during the first scroll and restores it on the way back up, like the Android WebView bars. `off` skips it. |
| `--journey` | `full` (default) or `load` (load and wait only). |
| `--wait` | ms to wait after the load event before the journey (default 10000). |
| `--expectMarker` | Exit 2 if the page's `<meta name="s1-build">` differs. |
| `--requireReady` | Exit 5 if `data-s1-ready` is not `"1"` at the end of a run. |
| `--noForm` | Skip the form check (it runs on local targets only, never on a live site). |

Exit codes: 0 ok, 1 usage, 2 marker mismatch or Playwright missing, 3 a POST to `/api/*` was
attempted (it was aborted), 4 an analytics host answered from the network, 5 sentinel missing.

## The journey (H3)

1. Load and wait for the load event, then 10 s.
2. Touch-scroll down (raw CDP touch events; `Input.synthesizeScrollGesture` does not scroll by touch in headless Chromium) in steps of 75% of the viewport with 700 ms
   pauses until the bottom. One gesture each starts on the hero answer (interactive heroes), a
   call to action, the email field and a FAQ summary. The first gesture collapses the toolbar.
3. Touch-scroll back to the top (the toolbar restores on the first upward gesture).
4. Three 0 to 40 to 0 px header crossings (the `.solid` header at `scrollY > 24`).
5. Tap the first hero answer (interactive heroes only).
6. Tap the email field and type `a`. Never Enter, never submit.
7. Back to the top, wait 1 s, collect.
8. Local targets only: the form check (tap the bottom email field, type `a`, tap its button, read
   the error line). A working handler shows "Check the email address and try again." and sends
   nothing.

## What every run blocks

- Analytics, from the first request: `*.google-analytics.com`, `*.googletagmanager.com`,
  `*.clarity.ms`, `connect.facebook.net`, `www.facebook.com`, `*.doubleclick.net`. Chromium maps
  those hosts to "not found" and bypasses the proxy for them, and the context answers each request
  with an empty 204 that carries `x-fv-blocked: 1` and logs it. A response for one of those hosts
  without that header counts as a leak (exit 4). On ekuzo.gg the attempt log should be non-empty
  (that proves the tags would have loaded); on localhost and the dev deploy it is empty by design.
- Every non-GET request to `/api/*` is aborted and logged (exit 3).

## Failure profiles (OR3)

| Name | What it does |
|---|---|
| `fonts-blocked` | Aborts every request to `fonts.googleapis.com` and `fonts.gstatic.com`. |
| `fonts-slow` | Holds both font hosts 20 s (`--fontDelay` changes it). |
| `fonts-slow-8s` | Same with 8 s (users lens U-1: a stall, not a fast failure). |
| `hero-404` | Answers every `/images/season1/landing/` and `/images/season1/jersey/` request with 404. |
| `small-script-throws` | Rewrites the HTML so the small script (the one that sets `pa` / `pre-ih`) throws as the first statement of its `try` block. |
| `big-script-fails` | Rewrites the HTML so the largest inline script starts with a syntax error. |

The two script profiles fetch the HTML in Node and hand the browser the rewritten copy, so the
document itself arrives without network throttling in those runs (subresources stay throttled).

To add a failure profile: describe it in `FAILURES` in `lib/profiles.mjs` and add its branch to the
route handler in `run.mjs`.

## Adding a device profile

Add an entry to `PROFILES` in `lib/profiles.mjs` (UA, width, height, DPR). Width and height are the
layout viewport; in-app browsers show less than the phone screen, which is what `--viewport` is for.

## Output

`docs/s1-cls-field-2026-11/evidence/vitals/<label>/`:

- `<cell>/<ad>-run<N>.json`: everything one run saw (gitignored). The cell name is the profile plus
  any non-default option, for example `fb-android-412__fonts-slow`.
- `table.md`: three tables, median and max per cell (committed).
- `manifest.json`: every command, harness and target commit, versions, calibration, sha256 of each
  run JSON, blocked-request totals (committed).
- `blocked.json`: blocked analytics attempts by host, leaks and POST attempts (committed).
- `keep-*.json`: a copy of any run with windowed CLS at or above 0.1, a leak or a POST (committed).

Regenerate a table from the run JSON on disk: `node scripts/field-vitals/lib/report.mjs <labelDir>`.

## Columns

Stability table:

- **CLS win**: the largest session window (shifts less than 1 s apart, window at most 5 s), entries
  with `hadRecentInput` left out. This is the number Chrome, CrUX and Clarity's web-vitals report.
- **win +input**: the same with `hadRecentInput` entries counted (a spurious flag can hide a shift).
- **total**: every shift in the visit added up.
- **runs >= 0.1 / >= 0.25**: how many runs crossed the "needs improvement" and "poor" lines.
- **top source**: the most common biggest source in each run's worst window (`tag#id.class`).
- **worst window start**: when that window began, ms after navigation start.

Loading table: first paint, FCP, LCP (median and max, with the final LCP element), when the first
hero image request started and the last one ended, hero image bytes (`encodedBodySize`), when the
Google Fonts stylesheet finished, the first long task, the long-task count and the worst interaction
latency (INP, from the hero tap and the email tap and keystroke).

Checks table: the build marker, the `s1Ready` and `s1-pre` sentinels, the hero state at the end,
S2 offenders (hero images whose box changes when the image's intrinsic size changes, tested by
swapping each for a 1x1 GIF), U-6 offenders (families on visible text that the page's font links
did not request), the form check, page errors, POST attempts, analytics attempts and leaks.

The CLS maths lives in `lib/cls.mjs` with a fixture test in `__tests__/cls.test.ts` (run by
`npm test`).
