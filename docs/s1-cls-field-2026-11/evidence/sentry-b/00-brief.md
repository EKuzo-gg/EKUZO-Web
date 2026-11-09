# Sentry B brief (Fable, 2026-11-09)

You are Sentry B in the Build Loop run `docs/s1-cls-field-2026-11/`. You check the dev deploy at
`https://dev--ekuzo.netlify.app` after the integration push, against the local branch build. You
verify and report; you fix nothing. Spec: `02-frozen-spec.md`; gates: `01-requirements.md`
(S1b in § Stability, N6 in § Non-regression, D1 in § Deploy, OR7/OR8 in `redteam-ops.md` § 2);
harness: `scripts/field-vitals/README.md`; Chronos's live run for comparison:
`evidence/vitals/live-before/table.md` (that was ekuzo.gg, the pre-change page).

## Where things are

- Worktree: `/home/claude/wt-sentry` (branch `lane/sentry-a` or detached; create `lane/sentry-b`
  from the current HEAD and commit your files there, under
  `docs/s1-cls-field-2026-11/evidence/sentry-b/`). Never push.
- The dev deploy's expected marker: `DEV_SHA` (Fable fills this in the launch message; it is the
  short sha of the integration merge commit pushed to `dev`). The local branch build on port 3100
  carries marker `2b9bc16` (app code identical; see `03-decision-log.md` D23).
- Playwright 1.63 and Chromium are global; every Playwright launch uses
  `proxy: { server: process.env.HTTPS_PROXY }`. `curl` reaches the dev deploy directly through the
  same proxy environment.
- Servers by PID only (the hook blocks `pkill -f`, `pgrep -f`, `ps | grep`). If 3100 is not
  listening, start it: `cd /home/claude/wt-sentry && STRIPE_SECRET_KEY="sk_test_placeholder_build_only" ./node_modules/.bin/next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid`.
  Stop it at the end (`kill "$(cat .server-3100.pid)"`, then the `next-server` child via `fuser 3100/tcp`).

## Run class

Everything against the dev deploy is Class T: the harness blocks analytics itself; your Playwright
scripts route `**/googletagmanager.com/**`, `**/google-analytics.com/**`, `**/clarity.ms/**`,
`**/connect.facebook.net/**`, `**/www.facebook.com/**`, `**/doubleclick.net/**` to 204 and log the
attempt (on dev the page loads no tags without `?s1qa=1`, so the log should be empty; on dev you
never add `?s1qa=1`, which would load production Clarity, O-5). Never submit the form on dev: the
API writes the live Klaviyo list (D11). Do not type into the form on dev at all. Never touch
ekuzo.gg.

## Checks, in order

1. **OR7 marker.** `curl -s https://dev--ekuzo.netlify.app/season1 | grep -o 'name="s1-build" content="[^"]*"'` equals `DEV_SHA` (prefix match on 7 characters). Also for `?ad=d18`, `?ad=d19`. Record `curl -sI` headers (`age`, `cache-status`, `x-nextjs-cache`, `cache-control`, `etag`) for `/season1` and `/season1?ad=d18`.
2. **D1 body equality.** Save `curl -s https://dev--ekuzo.netlify.app/season1` and `curl -s localhost:3100/season1` to files; `diff` them. Pass: the only differing line is the `s1-build` marker. If anything else differs, list every differing line (the `{{TAGS}}` and `{{URL_ALLOW}}` fills come from `lib/season1/tags.ts` and `route.ts`; a difference there is a finding, not a stop). Repeat for `?ad=d19` (the HTML is the same file; confirm).
3. **N6.** `curl -sI` on dev for `/season1`, `/season1?ad=d18`, `/season1?s1qa=1`, `/season1/join`, `/season1/thanks`, `/programs/ekuzo-camps`, and one legacy redirect from `next.config.mjs` (read the file for a source path). Record status, `location`, `x-robots-tag`, `link` (canonical) and compare with the same requests against `https://ekuzo.gg` (read-only GETs with `-I` are fine on ekuzo.gg; nothing else). Pass: identical apart from host and cache headers. Also confirm `?s1qa=1` on dev still returns the same HTML (the gate is in the browser, by hostname; do not load it in a browser).
4. **Console, every variant.** Playwright, fb-android UA 412x915, no `?s1qa`: load `https://dev--ekuzo.netlify.app/season1?ad=dN` for N 1 to 21 and `/season1`; wait 8 s; record `console.error`, `pageerror`, failed requests (`requestfailed`), the `s1-build` marker read from the DOM, `document.documentElement.dataset.s1Ready`, `#lp` `data-s1-pre`, the head `link[rel=preload][as=image]` hrefs and the `#s1-fonts` href. One row per variant. Our errors versus third-party noise; expected: none of ours, no analytics requests at all.
5. **S1b and the release L1.** Harness on dev, fb-android-412 at N=5 (this is the run that decides L1 for release, decision D25 in `03-decision-log.md`):
   `cd /home/claude/wt-sentry && npm run vitals -- --target https://dev--ekuzo.netlify.app --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label dev-tier1 --expectMarker "$DEV_SHA" --requireReady --noForm`
   then, if time allows, `--profile fb-android-360,ig-android-412 --runs 2`. S1b pass: windowed CLS < 0.1 med and max per cell. L1: compare LCP medians cell by cell with `evidence/vitals/live-before/table.md` (ekuzo.gg before the change, same harness and profile, same CDN provider; fb-android-412 medians there: d18 2156, d19 2836, d2 2528, d21 3184). Pass: dev lower by the larger of 150 ms or 10% on d18 and d19, and no max over 4.0 s where live-before's was not. Also report first paint and FCP against live-before, the document `responseEnd` and `encodedBodySize` (expect about 37.6 KB gzipped), the hero image start and end, and the `s1Ready` time, from one run JSON per ad. `--noForm` is required on dev (no form check off localhost; the harness enforces it, state that you passed it anyway). Expect a run to take longer than local (CDN round trips).
6. **Fonts and preload on the network.** From one dev run's JSON (or a Playwright script): the hero image request starts before the Google Fonts CSS response ends (L2 on a real CDN); list the `fonts.gstatic.com` files requested in the first 3 s and after.

## Output

`evidence/sentry-b/results.md` (each check: pass/fail, the numbers, the file that holds them),
`defects.md` (SB-n, severity, type, where, evidence, owner), your scripts, the saved bodies and
headers, JSON per check. Harness tables land under `evidence/vitals/dev-tier1/`. Prose rules: no em
dashes, no "It's not X, it's Y" reframes, sentence-case headings. Every number names its file.

Hand back with: verdicts (OR7, D1, N6, console, S1b, L2-on-dev), defect counts with SB ids, the
commit list on `lane/sentry-b`, proof the 3100 server is stopped (if you started it) and that no
Chromium of yours is left (`fuser` and `/proc`, not `ps | grep`). Nothing about the user goes to
memory.
