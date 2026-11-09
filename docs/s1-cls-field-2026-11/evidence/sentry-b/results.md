# Sentry B results (dev deploy, DEV_SHA 91f5503), 2026-11-09

Class T throughout: analytics blocked by the harness or routed to 204, no `?s1qa=1` loaded in a browser, no form input, no POST, ekuzo.gg touched only with read-only `curl -sI`. A second QA agent ran timing measurements on the same 2-core box during my runs (CPU noise; dev numbers are network-bound at Slow 4G, load average 1.2 to 2.5 while I ran, `/proc/loadavg`).

| Check | Verdict |
|---|---|
| 1 OR7 marker | PASS |
| 2 D1 body equality | PASS |
| 3 N6 | PASS (one host-gated difference, explained) |
| 4 Console, 22 variants | PASS |
| 5 S1b (fb-android-412, N=5) | PASS |
| 5 L1 (vs live-before) | PASS on d18, d19, d2; noad has no baseline |
| 6 L2 on dev | PASS |

## 1. OR7 marker

`curl -s https://dev--ekuzo.netlify.app/season1`, `?ad=d18`, `?ad=d19`, `?s1qa=1` all carry `<meta name="s1-build" content="91f5503">` (`bodies/*.html`, 137,270 bytes each). Headers (`headers/season1.txt`, `headers/season1_ad_d18.txt`): `HTTP/2 200`, `cache-control: s-maxage=31536000`, `cache-status: "Netlify Durable"; hit ... "Next.js"; hit, "Netlify Edge"; fwd=miss ... stored`, `age` 115 and 116. No `etag` and no `x-nextjs-cache` header is sent.

## 2. D1 body equality

`diff bodies/landing-75473a2.html bodies/season1.html`: exactly two hunks, line 3 (`{{BUILD}}` became `91f5503`) and line 46 (`{{TAGS}}` became the static tags script, 5,116 bytes, `bodies/tags-line.txt`). `route.ts` fills only `{{URL_ALLOW}}` (absent from landing.html, so a no-op), `{{TAGS}}` and `{{BUILD}}`. The tags block names GA4 `G-8LM45PX53W` (4x), Pixel `1284038230557204` (4x), Clarity `wml8wll5ua` (2x) and the hosts googletagmanager.com, connect.facebook.net, clarity.ms; no AW- id. No `{{` remains. All four bodies (`/season1`, `?ad=d18`, `?ad=d19`, `?s1qa=1`) share sha256 `d941613b...06005b9`, so d18 and d19 are byte-identical and `?s1qa=1` returns the same HTML. App code at 4d09e90 equals 75473a2 (`git diff --quiet 75473a2 4d09e90 -- app lib` clean).

## 3. N6 (`headers/n6/`)

dev vs ekuzo.gg, `curl -sI`: status identical on all eight paths (`/season1`, `?ad=d18`, `?s1qa=1`, `/season1/thanks`, `/programs/ekuzo-camps` 200; `/ekuzo-camps` and `/camps` 308 to `/programs/ekuzo-camps` on both). `location` identical. No `link` header on either host; canonical for these pages is in the HTML: `/season1` and `/season1/thanks` carry `<meta name="robots" content="noindex">` on both hosts.
One difference: `/season1/join` has `x-robots-tag: noindex` on dev and none on ekuzo.gg. `app/season1/join/route.ts` sets it when `!(isLiveHost(host) && mode === "live")` (line 30, 39), so it is host-gated by design; `git diff 45dfe97 4d09e90` shows no change to that route or to `lib/season1/mode`. The dev join page also shows the "Test mode" banner and no canonical, ekuzo.gg shows a canonical. Not a regression.

## 4. Console sweep (`console-sweep.json`, `.log`, `console-sweep.mjs`)

fb-android UA 412x915, `/season1` and `?ad=d1` to `d21`, 8 s wait each, 22 rows. Every row: HTTP 200, marker 91f5503, `data-s1-ready` = 1, `console.error` 0, `pageerror` 0, `requestfailed` 0, analytics requests 0. `s1-pre`: `ih` for d1 to d6, d8, d9, d10; `pa` for noad, d7, d11 to d21. Image preloads (one each, as D24 says): d19 `jersey/southie-back.webp`, d20 `jersey/southie-front.webp`, d21 `jersey/team-walk-1600.webp`, d18 `landing/laughing.webp`, and so on per file. d4, d5 and d9 have no image preload (text-led interactive heroes; not checked against the spec). `#s1-fonts` href present on all 22 (83 to 142 characters of query, the per-ad family subset; 12 distinct hrefs).

## 5. S1b and L1 (`evidence/vitals/dev-tier1/table.md`, `manifest.json`, `blocked.json`; run extracts in `run-extract.json`)

Command: the brief's, run from `/home/claude/wt-sentry-b` (same harness code), `--profile fb-android-412 --runs 5 --expectMarker 91f5503 --requireReady --noForm` (passed, as the brief requires). 20 runs, marker 91f5503 and `s1Ready` = 1 on all, page errors 0, POSTs 0, analytics attempts 0, leaks 0. Finished 14:10 CT.

S1b (windowed CLS, med / max, 5 runs each):

| Ad | dev med | dev max | live-before med / max (N=3) | runs >= 0.1 |
|---|---|---|---|---|
| d18 | 0.0035 | 0.0035 | 0.0035 / 0.0035 | 0 |
| d19 | 0.0001 | 0.0001 | 0.0001 / 0.0001 | 0 |
| d2 | 0.0004 | 0.0004 | 0.0004 / 0.0004 | 0 |
| noad | 0.0003 | 0.0003 | no baseline | 0 |

S1b: PASS (all under 0.1). The "+input" max is 0.1195 on d2, identical to live-before's d2 value and caused by a `hadRecentInput` entry; it is not the Chrome number.

L1 (LCP ms, fb-android-412, dev N=5 vs live-before N=3):

| Ad | dev med | dev max | live med | live max | needed (larger of 150 ms or 10%) | gain | verdict |
|---|---|---|---|---|---|---|---|
| d18 | 1352 | 1412 | 2156 | 2480 | 216 ms | 804 ms | PASS |
| d19 | 1728 | 1872 | 2836 | 3052 | 284 ms | 1108 ms | PASS |
| d2 | 1612 | 2220 | 2528 | 2860 | 253 ms | 916 ms | PASS (also interactive hero) |
| noad | 2388 | 2468 | none | none | n/a | n/a | not comparable |

No max over 4.0 s (highest 2468, noad). The 2.5 s aspiration for d18 and d19 is met (1352 and 1728 med). LCP elements: d18 `img.ph laughing.webp`, d19 `img.jb southie-back.webp`, d2 `img.ih-bg couch.webp`, noad `img.ph mc-blocks.webp`, 5x each.

Other loading numbers (dev med, live-before med in brackets; `dev-tier1/table.md`, `live-before/table.md`):

| Ad | first paint | FCP | hero img start | hero img end | fonts CSS end | first long task | s1Ready (first 250 ms sample, `timeline`) |
|---|---|---|---|---|---|---|---|
| d18 | 1108 [1216] | 1148 [1312] | 572 [1403] | 1002 [2118] | 1052 [1160] | 1107 / 117 ms | 1352 |
| d19 | 1164 [912] | 1228 [1020] | 656 [1113] | 2864 [3024] | 1115 [865] | 1223 / 167 ms | 1513 |
| d2 | 888 [1192] | 1120 [1276] | 604 [1392] | 1392 [2478] | 827 [1135] | 884 / 151 ms | 1114 |
| noad | 1176 | 1300 | 646 | 2327 | 1115 | 1172 / 180 ms | 1472 |

First paint and FCP on d19 are about 250 ms later on dev than the live-before median (1164 vs 912, 1228 vs 1020), while LCP is 1108 ms earlier; live-before's d19 first paint (912) was the lowest of its cells, so this is likely noise or box contention, but I did not re-measure. d19 hero end (2864) is the last hero image, the second one, which now loads after the LCP image (D24).

Document (`run-extract.json`, `nav`): `encodedBodySize` 37,567 bytes on all 20 runs (about 37.6 KB gzipped, matches expectation); `responseEnd` median d18 694, d19 778, d2 692, noad 775 ms; `responseStart` 528 ms in the d18 run1 sample.

## 6. L2 and fonts on the network (`run-extract.json`)

Hero image request starts before the Google Fonts stylesheet ends in 20 of 20 runs (d18 572 vs 1052, d19 656 vs 1115, d2 604 vs 827, noad 646 vs 1115 median ms) and before the first long task (d18 572 vs 1107). `link[rel=preload][as=image]` holds exactly one link in each run. `fonts.gstatic.com` files: d18 2, d19 3, d2 4, noad 3 per run, all requested between 1071 and 1473 ms (none after 3 s, none in the journey). PASS.

## 5b. Second profile set, N=2 (`evidence/vitals/dev-tier1b/table.md`, `harness-tier1b.log`)

`--profile fb-android-360,ig-android-412 --runs 2`, same flags. 16 runs, marker 91f5503, `s1Ready` 1, errors 0, POSTs 0, analytics attempts 0, leaks 0. No live-before baseline exists for these profiles at N=2 (SB-2), so these are S1b-only numbers.

| Cell | Ad | CLS win med / max | LCP med / max (ms) |
|---|---|---|---|
| fb-android-360 | d2 | 0.0179 / 0.0179 | 1480 / 1504 |
| fb-android-360 | d18 | 0.0036 / 0.0036 | 1254 / 1464 |
| fb-android-360 | d19 | 0.0002 / 0.0002 | 1692 / 1764 |
| fb-android-360 | noad | 0.0003 / 0.0003 | 2210 / 2348 |
| ig-android-412 | d2 | 0.0004 / 0.0004 | 1572 / 1612 |
| ig-android-412 | d18 | 0.0035 / 0.0035 | 2222 / 2448 |
| ig-android-412 | d19 | 0.0001 / 0.0001 | 2106 / 2668 |
| ig-android-412 | noad | 0.0003 / 0.0003 | 2322 / 2448 |

S1b on these cells: PASS (all under 0.1; largest is fb-android-360 d2 at 0.0179, top source `h1#ih-q #text + h3 #text`). Its "+input" max of 0.2685 comes from `hadRecentInput` entries and is not the Chrome number. ig-android-412 d18 LCP (2222) is 870 ms above the fb-android-412 d18 median (1352); N=2 and the other agent's CPU load make it unreliable, not re-run.

## Did not run

- Tier 2 variants on dev (S1 N=1 each) and Tier 3 (`mid`, `chrome-android`): not in the brief.
- `d21` in the harness: not in the brief's ad list, so L1 on d21 (live-before 3184) has no dev number. The console sweep loaded d21 once (clean).
- Failure profiles, S1c, S3, N7, N8, the form check (`--noForm`): other lanes or local-only.
- `?s1qa=1` in a browser (O-5), by instruction.
- A hash reconstruction of the expected body through `lib/season1/tags.ts` (the module needs the Next path alias; diff plus tag-id check used instead).
- Re-measurement of d19 first paint / FCP (see section 5).

## Cleanup

No server started by me. Chromium: checked through `/proc/*/cmdline` at the end, see the hand-back.
