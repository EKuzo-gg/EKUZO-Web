# Chronos self-test: field-vitals harness (Slice 1)

Chronos, 2026-11-09, worktree `/home/claude/wt-chronos`, branch `lane/chronos` (cut from
`build/s1-cls-field` at `d6e3ba3`). Every number below is in a committed table; the path is given
with it.

## What was built

`scripts/field-vitals/` (README in the folder):

- `run.mjs`: the CLI (H1). `npm run vitals -- --target <url|local:PORT> --ads … --profile … --runs N
  --label …` plus `--network slow4g|mid|none|<kbps>k/<rtt>`, `--cpu`, `--viewport WxH`, `--failure`,
  `--fontDelay`, `--fontCssDelay`, `--fontScale`, `--toolbar on|off`, `--journey full|load`, `--wait`,
  `--expectMarker`, `--requireReady`, `--noForm`, `--out`. Exit 2 on a marker mismatch or missing
  Playwright, 3 on any non-GET `/api/*` attempt (aborted), 4 on an analytics response from the
  network, 5 on a missing `s1Ready` with `--requireReady`.
- `lib/cls.mjs`: session-window CLS (1 s gap, 5 s cap) and total, each with and without
  `hadRecentInput` (H4a). Fixture test `__tests__/cls.test.ts`, 5 tests.
- `lib/profiles.mjs`: `fb-android`, `ig-android`, `chrome-android` at 412x915 @2.625 and 360x780 @3;
  `slow4g`, `mid`, custom networks; the six failure profiles; the analytics host list.
- `lib/journey.mjs`: the H3 journey (touch scroll with named start elements, toolbar collapse of 56
  then 110 px during the first scroll and restore on the way up, three header crossings, hero tap,
  email tap and `a`, back to top) and the local-only form check.
- `lib/collect.mjs`: shifts with CSS paths and rects, LCP candidates, INP, long tasks, font events
  and faces, resource timing with `encodedBodySize`, first paint and FCP, a 250 ms hero timeline;
  DOM checks for S2 (image swap test), U-6 (families), OR2 sentinels, OR7 marker, preloads.
- `lib/report.mjs`: `table.md` per label (stability, loading, checks; median and max per cell).
- Analytics blocked three ways from the first request: Chromium `--host-resolver-rules` to
  `~NOTFOUND`, proxy bypass for those hosts, and context routing that answers 204 with an
  `x-fv-blocked` header and logs the attempt. CDP response events confirm no analytics response
  without that header.
- `.gitignore`: raw run JSON under `evidence/vitals/` ignored; `manifest.json`, `blocked.json` and
  `keep-*.json` kept. Raw JSON archived at
  `/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/vitals-raw/*.tgz`
  (one per label); sha256 of every raw file is in each label's `manifest.json`.
- `package.json` scripts: `vitals`, and `test` now runs `node scripts/run-tests.mjs && node
  scripts/run-tests.mjs scripts/field-vitals` (the runner only walks `lib/` by default; the test sits
  outside `lib/season1/**` so the protected-surface diff stays empty).

## Commands run (all from `/home/claude/wt-chronos`)

```
node scripts/run-tests.mjs scripts/field-vitals                      # 5 pass, 0 fail
# servers (exact form from the brief)
cd /home/claude/wt-main   && STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npx next start -p 3101 > server-3101.log 2>&1 & echo $! > .server-3101.pid
cd /home/claude/wt-prefix && STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npx next start -p 3102 > server-3102.log 2>&1 & echo $! > .server-3102.pid
# H9
node scripts/field-vitals/run.mjs --target local:3101 --ads d18,d19,d2,noad --profile fb-android-412,fb-android-360,ig-android-412 --runs 5 --label main-baseline
node scripts/field-vitals/run.mjs --target local:3101 --ads d18,d19,d2,noad --profile chrome-android-412 --runs 3 --label main-baseline
# H7
node scripts/field-vitals/run.mjs --target local:3102 --ads d18,d19 --profile fb-android-412 --runs 5 --label prefix-3433a5b
node scripts/field-vitals/run.mjs --target local:3101 --ads d18,d19 --profile fb-android-412 --runs 5 --label h7-main-45dfe97
# OR3 (each of fonts-blocked fonts-slow-8s hero-404 small-script-throws big-script-fails at N=3, fonts-slow at N=2)
node scripts/field-vitals/run.mjs --target local:3101 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label failures-main --failure <profile>
# H8
node scripts/field-vitals/run.mjs --target https://ekuzo.gg --ads d18,d19,d2,d4,d21 --profile fb-android-412,chrome-android-412 --runs 3 --label live-before
# guard checks (scratch output, not committed)
… --target https://ekuzo.gg --expectMarker deadbee …   -> exit 2 (marker null)
… --target local:3199 (scratch server that POSTs /api/season-one on load) -> exit 3, POST logged and aborted
```

Stopped by PID: `kill "$(cat .server-310x.pid)"`, then the `next-server` child that kept each port
(PID from `fuser <port>/tcp`, checked with `/proc/<pid>/cmdline` and `cwd`): 6076 on 3102, 15770 on
3101. `ss` is not installed in this container, so listeners were checked with `fuser` and
`/proc/net/tcp`. Final state (13:13 CT): no listener on 3101 or 3102; the only listening sockets are
ports 2024, 40807 (the agent proxy) and 45319, none started by this lane; 0 Chromium processes.

## Numbers

| Gate | Result | Table |
|---|---|---|
| H9 main baseline, Tier 1 (d18, d19, d2, noad; fb 412, fb 360, ig 412; slow4g; N=5) | windowed CLS max 0.0180 (d2 at fb 360), every other cell at or under 0.0036; 0 runs at or above 0.1; form usable 60/60 | `evidence/vitals/main-baseline/table.md` |
| H9 chrome-android 412, N=3 | max 0.0035; form usable 12/12 | same |
| H9 LCP medians, fb 412 | d18 1912 ms, d19 2732 ms, d2 2232 ms, noad 2664 ms; FCP 944 to 1208 ms | same |
| H7 pre-fix `3433a5b`, fb 412 slow4g N=5 | d18 0.6776 in 5/5, d19 0.6133 in 5/5, sources `section#join-top.join` + `section.how` | `evidence/vitals/prefix-3433a5b/table.md`, `h7-proof.md` |
| H7 main, same cells | d18 0.0035, d19 0.0015, 0 runs at or above 0.1 | `evidence/vitals/h7-main-45dfe97/table.md` |
| H7b ladder | not needed | `evidence/vitals/h7-ladder.md` |
| OR3 on main | fonts stall: FCP 8.9 to 9.0 s (8 s hold) and about 21 s (20 s hold); small-script throw: CLS up to 0.71 / 0.64 / 0.50 / 0.89 (d18 / d19 / d2 / noad), 2 of 3 runs at or above 0.25 per ad; big-script failure: forms dead 0/3 on every ad, one page error; fonts blocked and hero 404 harmless | `evidence/vitals/failures-main.md`, `failures-main/table.md` |
| H8 live before (ekuzo.gg, fb 412 and chrome 412, N=3) | windowed CLS max 0.0035 (d18); LCP medians fb 412: d18 2156, d19 2836, d2 2528, d4 1564, d21 3184 ms; 90 analytics attempts blocked (30 each: googletagmanager.com, connect.facebook.net, clarity.ms), 0 leaks, 0 POSTs; hosts reached: ekuzo.gg, fonts.googleapis.com, fonts.gstatic.com | `evidence/vitals/live-before/table.md`, `blocked.json` |

## Findings and open issues for other lanes

1. **d19 and d21 `img.jb` fail the strict S2 check** (1 offender per run; `southie-back.webp` on d19,
   `southie-front.webp` on d21). The image is
   absolutely positioned with no `width`/`height`; swapping it for a 1x1 image changes the image's own
   box (d19 `img.jb`: -61.5 px tall) but not the hero box (`boxDelta` 0), so it cannot move content
   outside the hero. Atlas decides whether S2 needs attributes there; the hero itself is reserved.
2. **Toolbar collapse and restore re-fit the interactive hero (U-12)**: in
   `main-baseline/fb-android-412/d2-run1.json` the toolbar collapse during the first scroll logs 0.0389
   and 0.0460 (sources `div.ih-opts.quotes`, `section#bridge.bridge`, `h1#ih-q`), and the restore on
   the way up logs 0.0606 and 0.0590 (`section.faq`, `section#join-end`, `footer`, `section.how`); the
   hero tap adds 0.1184. Chrome flags all of them `hadRecentInput` because a touch is down, so they
   count only in the "+input" column (0.1195 max on d2). Unflagged, the restore pair alone (about
   150 ms apart) would be a 0.1196 window, over the 0.1 line. Windowed CLS as Chrome reports it
   stays under 0.1, and d18 and d19 show no such entries (J8 holds there). That run is committed as
   `vitals/main-baseline/keep-fb-android-412-d2-run1.json` (kept by hand for this finding; its sha256
   matches the manifest entry for `fb-android-412/d2-run1.json`).
3. **fb-android-360 d2 windowed 0.0179** (`h1#ih-q` text + `h3` text, about 1.9 s): the late font swap
   in the interactive hero at 360 wide. Under 0.1; it is the largest Tier 1 number and the one to watch
   after the font changes in Slice 2.
4. **The two script-failure profiles fetch the HTML in Node** and hand the browser an unthrottled
   document, so their timing differs from the other runs (this is why one small-script run per ad
   stayed low). The small-script finder picks the first inline script that contains
   `classList.add("pa")` or `"pre-ih"`; after Atlas's head bootstrap lands, Sentry should read
   `meta.rewriteApplied` in one run JSON to confirm the throw went into the body's small script.
5. `Input.synthesizeScrollGesture` with `gestureSourceType: "touch"` does not scroll in this headless
   Chromium (153.0.8010.12): tested, `scrollY` stayed 0. The journey uses raw CDP touch events
   (`touchStart`, 16 `touchMove`, `touchEnd`), which scroll and which Chrome treats as touch input.
6. `--fontScale` uses `text-size-adjust`; it is not exercised in any committed run, and whether desktop
   Chromium honors it is unverified (`dom.state.bodyFontSize` in the JSON shows it).
7. `npm test` in this worktree fails before reaching the harness test because the worktree has no
   `node_modules` (81 `ERR_MODULE_NOT_FOUND` for `next` and `@neondatabase/serverless` in `lib/`
   tests). That is environmental; the harness test passes on its own (`node scripts/run-tests.mjs
   scripts/field-vitals`). Sentry should run `npm test` in a worktree with `npm ci` done.
8. The sentinels (OR2) and the build marker (OR7) read "absent" on every main and live run, as
   expected before Slice 2. `--requireReady` and the marker check are wired; the marker exit was
   verified (exit 2), and the POST guard was verified with a scratch server (exit 3).
9. The iPhone profile is a human check (HC3); WebKit is not installed and has no layout-shift API.

## Command for Sentry against the branch build on port 3100

From the branch worktree, with the server started as `STRIPE_SECRET_KEY="sk_test_placeholder_build_only"
npx next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid` and `M` set to the
marker the build stamped (`git rev-parse --short HEAD` of the built commit; confirm with
`curl -s localhost:3100/season1 | grep -o 's1-build" content="[^"]*'`):

```
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412,fb-android-360,ig-android-412 --runs 5 --label branch-tier1 --expectMarker "$M" --requireReady
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile chrome-android-412 --runs 3 --label branch-tier1 --expectMarker "$M" --requireReady
for f in fonts-blocked fonts-slow-8s hero-404 small-script-throws; do npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label branch-failures --failure $f --expectMarker "$M"; done
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label branch-failures --failure big-script-fails --expectMarker "$M"
npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 2 --label branch-failures --failure fonts-slow --expectMarker "$M"
npm run vitals -- --target local:3100 --ads d18,d19,d2 --profile fb-android-412 --runs 3 --label branch-fontdelay --fontDelay 3000 --expectMarker "$M"
npm run vitals -- --target local:3100 --ads d1,d2,d4 --profile fb-android-412 --runs 3 --label branch-csdelay --fontCssDelay 3000 --expectMarker "$M"
```

Compare `branch-tier1/table.md` with `main-baseline/table.md` cell by cell (L1, L3b, L5) and
`branch-failures` with `failures-main.md` (OR3, OR4). `--requireReady` is left off the failure runs
because `big-script-fails` cannot set the sentinel by design. Expect about 50 s per run on this
2-core container (Tier 1 plus chrome: about 60 minutes).
