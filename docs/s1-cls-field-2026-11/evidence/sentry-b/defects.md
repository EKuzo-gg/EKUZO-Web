# Sentry B defects

| Id | Severity | Type | Where | Evidence | Owner |
|---|---|---|---|---|---|
| SB-1 | Low | Spec gap (S2) | d19 on dev: `#hero img.jb /images/season1/jersey/southie-back.webp` is listed as an S2 offender (box not fixed when the intrinsic size changes). Live-before lists the same offender (d19 and d21, 1 each). | `evidence/vitals/dev-tier1/table.md` Checks table (d19 S2 offenders = 1); run JSON `dom.s2Offenders` in `fb-android-412/d19-run1.json`. No CLS effect measured: d19 windowed CLS max 0.0001 over 5 runs. | Atlas (S2 is Sentry A's gate on the local build; reported here because the dev deploy shows the same) |
| SB-2 | Info | Coverage | No live-before cell exists for `noad` or for `fb-android-360` / `ig-android-412` N=2 comparisons, so L1 for `noad` and the second profile set has no baseline. | `evidence/vitals/live-before/table.md` lists fb-android-412 and chrome-android-412 for d2, d4, d18, d19, d21 only. | Chronos (if a baseline is wanted) |

Defect count: 2 (0 high, 0 medium, 1 low, 1 info).
