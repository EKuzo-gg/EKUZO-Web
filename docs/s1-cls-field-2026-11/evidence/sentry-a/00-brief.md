# Sentry A brief (Fable, 2026-11-09 13:25 CT)

You are Sentry A in the Build Loop run `docs/s1-cls-field-2026-11/` (spec: `02-frozen-spec.md`,
requirements: `01-requirements.md`, harness: `scripts/field-vitals/README.md`, Chronos's exact
commands: `evidence/chronos/self-test.md`). You verify; you do not fix. Author and verifier are
different people here: Atlas wrote the landing changes, Relay the checkout fix, Chronos the harness.
Everything you report must come from a command you ran, with its output saved under your folder.

## Where things are

- Branch worktree: `/home/claude/wt-sentry`, detached at `d59cd4e` (tip of `build/s1-cls-field`).
  `npm ci` done; `.next` built from `2b9bc16` with `COMMIT_REF=2b9bc16`, so the page's
  `<meta name="s1-build">` reads `2b9bc16`. App code is identical between `2b9bc16` and `d59cd4e`
  (`git diff --stat 2b9bc16 d59cd4e -- app lib components public context next.config.mjs` is empty;
  the merge added only `scripts/field-vitals`, `package.json` scripts, `.gitignore` and docs). Use
  `M=2b9bc16` for `--expectMarker`, and confirm it with
  `curl -s localhost:3100/season1 | grep -o 's1-build" content="[^"]*'`.
- Main worktree: `/home/claude/wt-main` at `45dfe97` (origin/main), built, `npm ci` done.
- Playwright 1.63 and Chromium are global; the harness finds them. Any Playwright script you write
  uses `createRequire("/home/claude/")` and launches Chromium with
  `proxy: { server: process.env.HTTPS_PROXY }` (fonts.googleapis.com and fonts.gstatic.com are
  reached only through the proxy). Node is on PATH.
- Atlas's scratch scripts you may read and reuse after reading them end to end:
  `/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/atlas-pixel.mjs`,
  `atlas-probe.mjs`, `atlas-behave.mjs`. Your own scripts go in your folder (below), not in scratch.
- Your folder: `docs/s1-cls-field-2026-11/evidence/sentry-a/` in `/home/claude/wt-sentry`. Harness
  tables land automatically under `docs/s1-cls-field-2026-11/evidence/vitals/<label>/`.
- Branch for your commits: create `lane/sentry-a` from `d59cd4e` in `/home/claude/wt-sentry`
  (`git switch -c lane/sentry-a`). Commit your files there as you go (small commits, one per block
  below). Fable merges. Never push.

## Servers (by PID, never by pattern)

Start both like this (the hook blocks `pkill -f`, `pgrep -f` and `ps | grep`; do not try them):

```
cd /home/claude/wt-sentry && STRIPE_SECRET_KEY="sk_test_placeholder_build_only" ./node_modules/.bin/next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid
cd /home/claude/wt-main   && STRIPE_SECRET_KEY="sk_test_placeholder_build_only" ./node_modules/.bin/next start -p 3101 > server-3101.log 2>&1 & echo $! > .server-3101.pid
```

Wait for `curl -s -o /dev/null -w '%{http_code}' localhost:3100/season1` to print 200 (same for
3101). At the end, stop each with `kill "$(cat .server-310x.pid)"`, then find any `next-server`
child still holding the port with `fuser 3100/tcp` (check `/proc/<pid>/cmdline` and `cwd` before
killing it). `ss` is not installed; probe a port with `(echo > /dev/tcp/127.0.0.1/3100) 2>/dev/null`.
The server logs and `.server-*.pid` files are not committed.

## Run classes

Class T (harness runs): analytics hosts are blocked by the harness itself; `?s1qa` absent. Class Q
(your beacon and journey checks): `?s1qa=1` on localhost only, and every one of these is fulfilled
in Playwright with `page.route` before the page loads, never forwarded: `**/gtag/js*`,
`**/fbevents.js`, `**/clarity.ms/**`, `**/google-analytics.com/**`, `**/googletagmanager.com/**`,
`**/connect.facebook.net/**`, `**/www.facebook.com/**`, `**/doubleclick.net/**` → 204 empty;
`**/api/season-one` POST → 200 `{"ok":true}` after recording the request body. Note that the
landing treats `localhost` as LIVE (`const LIVE = /(^|\.)ekuzo\.gg$|^localhost$/`), so the form
really posts to `/api/season-one` on both servers; your route stub is what keeps that off the
server. Assert at the end of every Class Q script that no request left for any host other than
localhost, fonts.googleapis.com and fonts.gstatic.com (collect `page.on("request")`). The beacon
lists are `window.dataLayer` (gtag calls), `window.fbq.queue` (Pixel calls, since fbevents.js never
loads) and `window.clarity.q` (Clarity calls), read with `page.evaluate` and saved as JSON. Never
target ekuzo.gg or the dev deploy. Never submit a form to anything but your stub. No test
identities are needed; use `qa+sentry@example.com` only against the stub.

## Order of work and time budget

Timing runs are serial and nothing else heavy runs beside them (2 cores). Work in this order; write
`evidence/sentry-a/interim.md` after block 1 (Fable waits on it to push the dev deploy), then keep
going. Hand back by 15:45 CT at the latest with whatever is done; list what did not run.

### Block 1 (gate): Tier 1 fb-android-412 on the branch, N=5

```
cd /home/claude/wt-sentry
M=2b9bc16
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label branch-tier1 --expectMarker "$M" --requireReady
```

Compare with `evidence/vitals/main-baseline/table.md` (same cells, same harness). Write
`interim.md`: per cell, windowed CLS med/max branch vs main (S1a pass is < 0.1 med and max), LCP
med branch vs main (L1 pass: branch lower by at least 150 ms or 10%, whichever is larger, on d18
and d19; no max over 4.0 s where main's was not), first paint med (L3b: earlier by at least
100 ms), hero image start vs fonts CSS end (L2), form usable count, sentinel and marker columns,
S2 offenders, U-6 offenders, page errors. One line verdict: gate pass or fail and why. Commit.

### Block 2: rest of Tier 1 and Tier 3

```
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-360,ig-android-412 --runs 5 --label branch-tier1 --expectMarker "$M" --requireReady
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile chrome-android-412 --runs 3 --label branch-tier1 --expectMarker "$M" --requireReady
```

Then the S3 and U-3 runs:

```
npm run vitals -- --target local:3100 --ads d18,d19,d2 --profile fb-android-412 --runs 3 --label branch-fontdelay --fontDelay 3000 --expectMarker "$M"
npm run vitals -- --target local:3100 --ads d1,d2,d4 --profile fb-android-412 --runs 3 --label branch-cssdelay --fontCssDelay 3000 --expectMarker "$M"
```

### Block 3: Class Q and behaviour checks (Playwright scripts in your folder, 412x915 fb-android UA unless stated)

Run each on 3101 (main) and 3100 (branch) and diff. Save raw JSON per check per server.

- **M1a, M1b, M1c (local part), J4, J5, J9, X15:** for `?ad=d18&utm_source=fb&utm_medium=paid&utm_campaign=s1&utm_content=d18&fbclid=TESTFBCLID`, `?ad=d19` (same UTMs), `/season1` (noad), `?ad=zz`, `?hero=games` and `?ad=d10` (the last two with `Math.random` stubbed to 0 and then to 0.99 via `addInitScript`): load with `?s1qa=1` added, wait 3 s, scroll to the top form, tap the email field, type `qa+sentry@example.com`, tap the button, wait for the stubbed POST. Record: `dataLayer`, `fbq.queue`, `clarity.q`, the POST body, the order of the first tag call versus the capture of `ad`/UTM/`fbclid` (X15: the first `gtag("config"…)` or `fbq("init"…)` entry must already carry or follow the capture; show the first three dataLayer entries). Compare main vs branch after removing timestamps, `eventID`/`event_id` values, `gtm.start`, and `page_location` query order differences. M1b: the POST body's attribution fields (`ad`, `utm_*`, `fbclid`/`fbc`, `fbp`, `site`, first-touch and last-click fields) equal main's. J9: in a second page of the same context (cookies kept), load `/season1?s1qa=1` with no `?ad=`, submit, and show the POST body's `ad` equals the first visit's. Pass: equal lists; any difference is a defect with the two JSONs beside it.
- **M1d:** DOM check on d18, d19, d2, noad: `data-clarity-mask="true"` present on `#em-top`, `#em-end`, `#tk-ph`, `#tk` on the branch; record main's state too.
- **X1, L2, L3a:** head after the bootstrap on d1, d2, d4, d10, d18, d19, d21, noad, `?ad=zz`: list `link[rel=preload][as=image]` hrefs (X1: only the chosen ad's hero image or images; d1 for missing or unknown ad as the small script normalises), `#s1-fonts` href families, the async stylesheet families; from `performance.getEntriesByType("resource")`, the first `/images/season1/` request start versus the `fonts.googleapis.com` CSS responseEnd (L2 pass: hero before CSS end) and the list of `fonts.gstatic.com` files (L3a: only the requested families at high priority; the safety-net families arrive later).
- **X3:** fast network, after `document.fonts.ready` on d18, d19, d2: `document.fonts.check` true for each family the ad uses, computed `font-family` of `h1`, `h3`, `.cta`/button and the email input equal main's.
- **N3:** `cd /home/claude/wt-sentry && ./node_modules/.bin/tsc --noEmit` (record exit code and output); console on `/season1?ad=dN` for N 1 to 21 and noad at 412 on 3100 (no `?s1qa`): list every `console.error`, `pageerror` and failed request; one row per variant; our errors versus third-party noise (none expected locally).
- **J10:** on d18 and d19 at 3100 and 3101: load with `?s1qa=1`, record `dataLayer` length and `page_view` count, tap a program link (`a[href*="/programs"]` or the first external link in the hero or FAQ), `page.goBack()`, then `page.evaluate` a `visibilitychange` to hidden and back: no second `page_view`, no shift entries from `#hero`/`#ihero` (`PerformanceObserver` buffered `layout-shift`), `ad` still present in the next beacon.
- **X7, X9, X10, X11, X12, X13 (non-regression form):** the branch did not change the event handlers, so the test is equality: run the X14 gesture set (tap, typing, paste via `page.keyboard.insertText`, autofill via setting `.value` without a trusted event, programmatic `focus()`, a scroll gesture starting on the element via raw CDP touch events as `scripts/field-vitals/lib/journey.mjs` does, a retry) on the email field, a hero answer (d2), a CTA, a FAQ summary and the Text Karlin button, on d2 and d18, at 3100 and 3101, and show the `dataLayer`/`fbq.queue` lists are equal main vs branch. X11 specifically: stub the POST to answer 429 once then 200; `generate_lead` and `Lead` appear once, after the 200, with one `event_id`.
- **S5:** `cd /home/claude/wt-sentry && git diff 45dfe97 -- app/season1/landing.html | grep -nE '^[-+].*(\.pa|pre-ih|aspect-ratio|80vh|80svh)'` and report every changed rule touching `pa`/`pre-ih` (expected: the `80vh` fallback line added before `80svh`, nothing else).
- **N4:** `git diff --stat 45dfe97 -- app/season1/join lib/season1/signup* app/api` and compare with the protected-surface list in `01-requirements.md` § R-PROT; only the approved M-1 hotfix lines and additive tests may appear.

### Block 4: failure profiles on the branch (OR3, OR4, X17)

```
for f in fonts-slow-8s small-script-throws big-script-fails; do npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 2 --label branch-failures --failure $f --expectMarker "$M"; done
for f in fonts-blocked hero-404; do npm run vitals -- --target local:3100 --ads d18,d19 --profile fb-android-412 --runs 2 --label branch-failures --failure $f --expectMarker "$M"; done
```

Compare with `evidence/vitals/failures-main.md` and `failures-main/table.md`. Expected on the branch:
fonts-blocked and hero-404 harmless and forms usable (X17); fonts-slow-8s still blanks until the
stall ends (D12 accepted this: the per-ad sheet still blocks) but with a smaller parse after it;
small-script-throws: read `meta.rewriteApplied` in one run JSON (Chronos item 4) and report whether
the throw landed in the body's small script and whether the W4 jump comes back as on main;
big-script-fails: forms dead as on main (known, accepted). Any branch-only degradation is a defect.

### Block 5 (if time remains): Tier 2

```
npm run vitals -- --target local:3100 --ads d1,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d20,d21 --profile fb-android-412 --runs 1 --label branch-tier2 --expectMarker "$M" --requireReady
```

Spec says N=3; run N=1 first for coverage and add runs if time allows. Record which N ran.

## Output

- `evidence/sentry-a/interim.md` (after block 1), `results.md` (every gate with pass/fail, the
  number, main vs branch, and the path of the table or JSON that holds it; a "did not run" list),
  `defects.md` (id SA-n, severity blocker/major/minor, type, what, where (file:line or command),
  evidence path, owner Atlas/Relay/Chronos/Fable; empty table if none), your scripts, and the raw
  JSON of the Class Q checks. Harness tables are already under `evidence/vitals/`.
- Prose rules: no em dashes, no "It's not X, it's Y" reframes, sentence-case headings, plain words.
  Every number names its file.
- Hand back with: the gate verdicts (S1a, L1, L3b, L2, M1a to M1d, N3, X1, X3, X15, J9, J10, S3,
  S5, N4, OR3), the defect count by severity, the commit list on `lane/sentry-a`, confirmation that
  both servers are stopped by PID and the ports are free, and the did-not-run list.

Do not edit anything outside your folder (and the harness output dirs). Do not change the spec,
the decision log or other lanes' files; put observations in `results.md`. Nothing new about the
user goes to memory.
