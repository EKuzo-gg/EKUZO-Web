# H7b fallback ladder

Chronos, 2026-11-09. The ladder runs only if the first H7 pass does not reproduce the field failure
on `3433a5b`. The first pass reproduced it (5 of 5 runs at or above 0.25 for d18 and for d19, see
`h7-proof.md`), so no rung was needed.

| Attempt | Settings | d18 runs >= 0.25 | d19 runs >= 0.25 | Sources | Result |
|---|---|---|---|---|---|
| 0 (first pass) | `fb-android-412` (412x915 @2.625), `slow4g`, CPU 4x, full H3 journey with toolbar collapse, N=5 | 5 of 5 (windowed 0.6776 each) | 5 of 5 (windowed 0.6133 each) | `section#join-top.join` + `section.how` | reproduced; ladder not run |
| 1 toolbar collapse on | already on in attempt 0 (the default journey) | not run | not run | | not needed |
| 2 CPU 6x | | not run | not run | | not needed |
| 3 400 Kbps / 400 ms | | not run | not run | | not needed |
| 4 cold fonts plus 2-connection limit | | not run | not run | | not needed |
| 5 short viewports 360x640, 412x700 | | not run | not run | | not needed |

Source table: `prefix-3433a5b/table.md`; command and versions: `prefix-3433a5b/manifest.json`.
