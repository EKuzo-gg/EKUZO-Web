# N8 console errors (Sentry)

Each page was loaded in a fresh context on baseline and build, console error/warning messages and page errors recorded (the popup page waited for the dialog). Pages: /season1 d5, /season1 d3, / with popup, at 1440 and 375. Also every functional run (F7, F8, N1, N2, N3, N5, N7, F9) recorded console errors and page errors: all empty.

| Run | console errors | console warnings | page errors |
|---|---|---|---|
| season1-d5-1440x900-baseline | 0 | 0 | 0 |
| season1-d5-1440x900-build | 0 | 0 | 0 |
| season1-d5-375x812-baseline | 0 | 0 | 0 |
| season1-d5-375x812-build | 0 | 0 | 0 |
| season1-d3-1440x900-baseline | 0 | 0 | 0 |
| season1-d3-1440x900-build | 0 | 0 | 0 |
| season1-d3-375x812-baseline | 0 | 0 | 0 |
| season1-d3-375x812-build | 0 | 0 | 0 |
| popup-home-1440x900-baseline | 0 | 0 | 0 |
| popup-home-1440x900-build | 0 | 0 | 0 |
| popup-home-375x812-baseline | 0 | 0 | 0 |
| popup-home-375x812-build | 0 | 0 | 0 |

**N8 PASS.** One non-regression observation from the adversarial run: when Storage.prototype.getItem/setItem is forced to throw, a page error is raised by **third-party clarity.js** (`Uncaught SecurityError` from scripts.clarity.ms), identically on baseline and build; no error comes from our code (see adversarial.md ADV-1).
