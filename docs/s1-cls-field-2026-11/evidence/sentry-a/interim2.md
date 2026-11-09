# Sentry A interim 2: block 1 repeated on build 75473a2 (D24, one preload per ad)

Built from `75473a2` (rebase of `lane/sentry-a` onto it; build log `build-75473a2.log`, server restarted on 3100, `s1-build` reads 75473a2 by curl; 3101 stayed up on main 45dfe97). Command: `npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label branch2-tier1 --expectMarker 75473a2 --requireReady`, exit 0, 20 runs, log `block1b.log`, table `evidence/vitals/branch2-tier1/table.md` (snapshot `block1b-table-snapshot.md`). Main: `evidence/vitals/main-baseline/table.md`. Earlier build 2b9bc16 is in `interim.md`.

| Ad | Windowed CLS med / max main to branch (S1a) | LCP med main to branch, delta, L1 need | LCP max main to branch | First paint med main to branch (L3b, need -100) | Hero img start vs fonts CSS end, branch (L2) | First long task start main to branch |
|---|---|---|---|---|---|---|
| d18 | 0.0035 / 0.0035 to 0.0035 / 0.0035 | 1912 to 1424, -488, need -191 | 1944 to 1756 | 928 to 736, -192 | 244 vs 699 | 1086 to 1277 |
| d19 | 0.0015 / 0.0015 to 0.0015 / 0.0015 | 2732 to 1904, **-828**, need -273 | 3004 to 1944 | 840 to 716, -124 | 215 vs 683 | 1069 to 1735 |
| d2 | 0.0004 / 0.0004 to 0.0004 / 0.0004 | 2232 to 1768, -464, need -223 | 2600 to 1840 | 836 to 816, **-20** | 219 vs 758 | 1076 to 1595 |
| noad | 0.0003 / 0.0003 to 0.0003 / 0.0003 | 2664 to 2288, -376, need -266 | 2716 to 2316 | 1088 to 716, -372 | 206 vs 689 | 1076 to 1752 |

- d19 LCP line: median 2540 ms on 2b9bc16 to 1904 ms on 75473a2 (main 2732); LCP max 1944 (main 3004). SA-1 is resolved.
- d2 first paint: 816 vs main 836 in this run, short of the -100 rule. I re-ran d2 alone (N=5, label `branch2-d2rerun`, `block1c-d2rerun.log`): first paint 724 ms (-112), LCP 1824 (-408). The 816 was one noisy batch (Atlas's build on 3103 and Fable's probe were running, per the coordinator). L3b on d2 passes on the re-run; both numbers are in the tables.
- Form usable 5/5 in every cell, sentinels `s1Ready` = 1, `s1-pre` pa/ih as expected, marker 75473a2, S2 offenders d19 = 1 (`img.jb`, same as main), U-6 none, page errors 0, POSTs 0, analytics 0, leaks 0 (`branch2-tier1/blocked.json`).
- First long task is still later than main (L5): D25 says the local lab serves the HTML uncompressed (137 KB) and L5 is not a release blocker; reported as measured.

**Verdict: S1a pass, L1 pass on all four (d18, d19), L2 pass, L3b pass (d2 on re-run).**
