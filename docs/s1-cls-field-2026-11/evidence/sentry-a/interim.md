# Sentry A interim: block 1 (Tier 1, fb-android-412, N=5, branch build 2b9bc16)

Run 2026-11-09 13:23 to 13:38 CT. Command: `npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label branch-tier1 --expectMarker 2b9bc16 --requireReady`. Exit 0, 20 runs. Branch numbers: `evidence/vitals/branch-tier1/table.md` (snapshot of the fb-android-412 state: `evidence/sentry-a/block1-table-fb412-snapshot.md`). Main numbers: `evidence/vitals/main-baseline/table.md`. Server log of the run: `evidence/sentry-a/block1.log`. The served page carried `s1-build` = 2b9bc16 on both ports (checked with curl before the run; harness marker column reads 2b9bc16 in all four cells).

| Ad | Windowed CLS med / max main to branch (S1a, < 0.1) | LCP med main to branch, delta, L1 need | LCP max main to branch | First paint med main to branch (L3b, need -100) | Hero img start vs fonts CSS end, branch (L2) |
|---|---|---|---|---|---|
| d18 | 0.0035 / 0.0035 to 0.0035 / 0.0035 | 1912 to 1468, -444 ms, need -191 | 1944 to 1612 | 928 to 716, -212 | 217 vs 672 |
| d19 | 0.0015 / 0.0015 to 0.0014 / 0.0014 | 2732 to 2540, -192 ms, need -273 | 3004 to 2604 | 840 to 720, -120 | 214 vs 691 |
| d2 | 0.0004 / 0.0004 to 0.0004 / 0.0004 | 2232 to 1844, -388 ms, need -223 | 2600 to 1916 | 836 to 724, -112 | 214 vs 679 |
| noad | 0.0003 / 0.0003 to 0.0003 / 0.0003 | 2664 to 2244, -420 ms, need -266 | 2716 to 2320 | 1088 to 708, -380 | 212 vs 678 |

(Need = the larger of 150 ms and 10% of main's median.)

Other columns, all from `branch-tier1/table.md`:
- Form usable 5/5 in every cell. Sentinels: `s1Ready` = 1 in all four; `s1-pre` = `pa` on d18, d19, noad and `ih` on d2. Marker 2b9bc16 in all four.
- S2 offenders: 0 on d18, d2, noad; 1 on d19 (`img.jb southie-back.webp`). Main has the same 1 on d19 (`main-baseline/table.md`, Chronos finding 1), so this is not new.
- U-6 offenders: none in all four. Page errors 0, POST attempts 0, analytics attempts 0, leaks 0 (`branch-tier1/blocked.json`).
- Win +input max: 0.1195 on d2 on both main and branch (the toolbar and hero tap entries Chronos documented, flagged `hadRecentInput`); other cells 0.0066. Not counted by the gate.
- LCP elements unchanged from main (d18 laughing.webp, d19 southie-back.webp, d2 couch.webp, noad mc-blocks.webp). First long task start: d18 1086 to 1333 ms, d19 1069 to 2341 ms, d2 1076 to 1666 ms, noad 1076 to 1826 ms (later on the branch; durations 95 to 114 ms vs 116 to 177). That is L5, which Block 1 does not gate; recorded for results.md.

Verdicts for this block:
- S1a: pass (all four cells under 0.1 at median and max; branch equals main within 0.0001).
- L3b: pass (first paint earlier by 112 to 380 ms).
- L2: pass (hero image request starts at 212 to 217 ms; the fonts CSS ends at 672 to 691 ms).
- L1: **fail on d19**. The d19 median improved 192 ms (2732 to 2540), below the 273 ms the rule needs; d18 passes (-444 vs -191). d19's LCP element is the 232.8 KB `southie-back.webp`, whose request starts at 214 ms but ends at 2627 ms on the throttled link, so the byte weight sets the floor. The rule's per-variant wording ("every photo-hero variant") means d19 is a gate miss for Fable and Atlas to rule on (for instance a smaller d19 image under L4). The max rule holds (branch max 2604 is under 4.0 s).

**Gate verdict for block 1: S1a, L2 and L3b pass; L1 fails on d19 only (SA-1, major, owner Atlas). No CLS regression, no form regression, no analytics leak.** Block 2 (fb-android-360, ig-android-412) is running now, then the Class Q checks.
