# Defect log, Sentry B (browser QA), round 2, HEAD 54e9a5d

| id | severity | type | requirement | repro | owner |
|---|---|---|---|---|---|
| SB-1 | High | functional (CLS) | S1 SC1 / S1 step 2: after must be 0.1 or less on all | 375x667, DPR 2, Slow 4G, CPU 4x, cold context, `/season1?ad=d9&utm_source=meta`. d9 opens the `shortlist` hero (AD_HERO). Median after 0.1693 (before 0.2226); 5 of 7 runs 0.1693, 2 of 7 0.0039. Shifts at 1.3 to 1.7 s: 0.1008 then 0.0685, source `div`, `button` (the shortlist option rows). Likely fitHero shrink after `document.fonts.ready` (d9 font Rubik Mono One, ds .66) or the reserve height not matching the shortlist hero. Data: `evidence/sentry-b/cls375.json` key `d9`. d4 and d5 (also shortlist) pass at 0.0018 and 0.0012, so reserve per hero type or font is the thing to check. | Atlas-1 |
| SB-2 | Low | content | S1 step 3 (every `bgs` option loads) | `bgs` of d1 lists `esports-room`, which has no `IMG` entry in before or after, so that option has no image. Not rendered anywhere (bgs[0] only drives a class); pre-existing, not a regression. | Atlas-1 (or drop the option) |

No other defects. Test-harness notes (not defects): popup games step is debounced 900 ms (checked with a longer wait); a hidden footer form button shares the selector with the popup submit.
