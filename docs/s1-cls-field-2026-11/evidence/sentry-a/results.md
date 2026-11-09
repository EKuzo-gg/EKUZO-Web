# Sentry A results (build 75473a2 on port 3100 vs main 45dfe97 on port 3101; first build 2b9bc16 where stated)

Run 2026-11-09, 13:23 to 16:00 CT, 412x915 fb-android profile unless stated. Every number names its file. Notes on the run: Atlas's build on 3103 and Fable's dev probe may have overlapped some block 2 runs on this 2-core box (CPU noise; CLS is what block 2 gates). The local server sends the HTML uncompressed (137 KB; D25), so local L1 and L5 carry that artifact. S3 and U-3 (fontdelay, cssdelay) ran on 2b9bc16, before D24; D24 did not touch fonts, but they were not re-run on 75473a2.

## Gates

| Gate | Verdict | Number | Where |
|---|---|---|---|
| S1a Tier 1 fb-412, N=5 | pass | windowed CLS max 0.0035 (d18), others at or under 0.0015, equal to main within 0.0001; 0 runs at or above 0.1 | `vitals/branch2-tier1/table.md`; 2b9bc16: `vitals/branch-tier1/table.md` |
| S1a fb-360, ig-412 (2b9bc16, N=5) | pass | max 0.0180 (fb-360 d2, same as main 0.0180), others under 0.0040 | `block2a-compare.md` |
| S1a Tier 3 chrome-412 (75473a2, N=3) | pass | max 0.0035 (d18), 0.0015 d19, 0.0004 d2, 0.0003 noad (main 0.0035, 0.0015, 0.0004, 0.0003) | `vitals/branch2-tier3/table.md` |
| S1 Tier 2 (N=1, 18 variants) | **fail on d8** | 17 of 18 under 0.1 (next highest d9 0.0596, d14 0.0602); d8 0.1066, and main also 0.1025 in 3 of 3 (SA-3) | `vitals/branch2-tier2/table.md`, `vitals/main-d8/table.md` |
| L1 | pass on 75473a2 | d18 1912 to 1424 (-488, need -191); d19 2732 to 1904 (-828, need -273); d2 -464, noad -376; no max over 4.0 s (d19 max 1944). On 2b9bc16 d19 failed (-192): SA-1, resolved | `vitals/branch2-tier1/table.md`, `interim.md`, `interim2.md` |
| L2 | pass | hero request starts 206 to 244 ms, fonts CSS ends 683 to 758 ms (branch2-tier1); in the head check 189 to 196 ms vs 433 to 524 ms | `vitals/branch2-tier1/table.md`, `classq/branch-head.json` |
| L3b | pass | first paint d18 -192, d19 -124, noad -372, d2 -20 in the first batch and -112 on the re-run (noise from overlapping jobs) | `interim2.md`, `vitals/branch2-d2rerun/table.md` |
| L5 (report only) | later than main on all cells | first long task start d18 1086 to 1277, d19 1069 to 1735, d2 1076 to 1595, noad 1076 to 1752; duration 112 to 132 ms vs 116 to 177 | `vitals/branch2-tier1/table.md`; D25: not a blocker |
| S3 (fontdelay 3000, 2b9bc16, N=3) | pass | windowed CLS d2 0.0004, d18 0.0035, d19 0.0014; sources `h1#ih-q`, `h3 + div.row`, `form + p`, none are `section.join` or `section.how` | `vitals/branch-fontdelay/table.md` |
| U-3 (cssdelay 3000, 2b9bc16, N=3) | pass | CLS d1 0.0001, d2 0.0004, d4 0.0017; forms usable 3/3; FCP 3.6 to 3.8 s as the sheet is held | `vitals/branch-cssdelay/table.md` |
| M1a to M1d, X1, X3, X15, J9, J10, N3, N4, S5, X7 to X13 | see `interim3.md` (all pass; J9 fails on main and branch alike, SA none) | | `interim3.md` |
| OR3 / X17 failure profiles (N=1, d18 and d19, 75473a2) | no branch-only degradation | below | `vitals/branch2-failures/table.md`, `block4.log` |

## Failure profiles on the branch (N=1 per ad, not the N=2 asked: time)

- fonts-blocked and hero-404: harmless, forms usable 1/1, s1Ready 1, CLS at or under 0.0036 (X17 holds). Main: same (`vitals/failures-main.md`).
- fonts-slow-8s: first paint 8.6 s, LCP 8.7 s on both ads (main 8.9 to 9.0 s FCP), CLS 0.0035 and 0.0014, form usable. D12 accepted the block; there is a smaller parse after it but the stall is as on main.
- small-script-throws: `meta.rewriteApplied` = "throw inside first try{ of the small script" in `fb-android-412__small-script-throws/d18-run1.json` and d19 (the throw lands in the body's small script that sets `pa`/`pre-ih`). The W4 jump returns as on main: a 0.7037 shift on `section#join-top` at 646 ms on d18 and 0.354 on d19. In these single runs Chrome flagged it `hadRecentInput`, so windowed CLS reads 0.0035 and 0.0001 and only the "+input" column shows 0.7072 and 0.354 (main: windowed 0.36 median, 0.7072 max on d18). Same failure, same size; the flag differs with timing (the harness serves this HTML unthrottled, Chronos finding 4). `s1-pre` is absent, as designed.
- big-script-fails: forms dead (0/1 on both), 1 page error, as on main (accepted).

## Class Q notes

- Stub fault SA-2 (Clarity reached its real hosts from localhost on my first Class Q run), fixed and re-run; see `defects.md`.
- J9: the second visit posts `ad` = `d1`, not `d18`, on both servers.
- J10: back navigation reloaded the page in headless Chromium, so bfcache was not exercised.
- The CTA button was not tappable at load on d18 or d2 (header and hero CTA hidden or off-screen), so CTA gesture cells are empty on both servers.
- Harness `--requireReady` passed on every Tier 1 to 3 run; the page's marker read 75473a2 on all 75473a2 runs.

## Did not run

- Block 4 at N=2 (ran N=1 on d18 and d19 only; d2 and noad not run for failure profiles; fonts-slow 20 s not run).
- Block 5 Tier 2 at N=3 (N=1 only); S1b and dev-deploy checks (Sentry B); S1c (images blocked) not run; L4, L7 and N1a/N2 not part of this brief.
- fb-360, ig-412 and chrome-412 beyond what is listed: fb-360 and ig-412 ran on 2b9bc16 only, not repeated on 75473a2; S3 and U-3 on 2b9bc16 only.
- X1 sampled d1, d2, d4, d10, d18, d19, d21, noad, zz; d11 and d20 not sampled in the head check.
- X9 (hero_view timing) not separately exercised beyond the equal beacon lists.
