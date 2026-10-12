# N6 screenshots (Sentry)

Chromium, reduced motion, fonts awaited, 2.5 s settle (popup pages: wait for the dialog, then 1.8 s), viewport screenshot only (top of page). Files in `docs/s1-popup-attribution/screenshots/{page}-{viewport}-{baseline|build}.png`. Pixel diff with pixelmatch (threshold 0.1, anti-aliasing counted). A second baseline run (baseline2, not saved to the repo) gives the noise floor. Tolerance in the spec: about 0.5% of pixels.

| Page | Viewport | Baseline vs build (diff px / total / %) | Noise floor: baseline vs baseline2 | Verdict |
|---|---|---|---|---|
| season1-d5 | 1440x900 | 0 / 1296000 / 0% | 0 (0%) | PASS |
| season1-d5 | 375x812 | 0 / 304500 / 0% | 0 (0%) | PASS |
| season1-d3 | 1440x900 | 0 / 1296000 / 0% | 0 (0%) | PASS |
| season1-d3 | 375x812 | 0 / 304500 / 0% | 0 (0%) | PASS |
| popup-home | 1440x900 | 0 / 1296000 / 0% | 0 (0%) | PASS |
| popup-home | 375x812 | 0 / 304500 / 0% | 0 (0%) | PASS |

All six pairs are pixel-identical (0 differing pixels). **N6 PASS.** The landing.html diff contains no markup, CSS or copy change (see sentry-mechanical.txt). Files: popup-home-1440x900-baseline.png, popup-home-1440x900-build.png, popup-home-375x812-baseline.png, popup-home-375x812-build.png, season1-d3-1440x900-baseline.png, season1-d3-1440x900-build.png, season1-d3-375x812-baseline.png, season1-d3-375x812-build.png, season1-d5-1440x900-baseline.png, season1-d5-1440x900-build.png, season1-d5-375x812-baseline.png, season1-d5-375x812-build.png.
