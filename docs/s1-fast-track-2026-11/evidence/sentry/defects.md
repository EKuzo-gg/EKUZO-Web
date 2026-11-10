# Defects, Sentry run on 8550976 (Part A), 2026-11-10

Two items, both info. No blocker, no high, no medium.

| ID | Severity | Type | Where | Evidence | Owner |
|---|---|---|---|---|---|
| SF-1 | info | Pixel difference, expected consequence of A1 | `/season1/join/jersey?ad=d21` at 412 and 1440 (pixel pair 7 of 8) | `pixel/7-412-main.png` vs `7-412-branch.png`, `7-1440-*`; `pixel.json`; `logs/03-jersey-why.txt`: main address bar after load is `''` and `#jh data-ad` is `d19`, branch keeps `?ad=d21` and shows `d21` | Atlas (no fix needed; Fable to accept) |
| SF-2 | info | Beacon change beyond the brief's expected list | `season1_join_view` on `/season1/join/jersey?ad=d21&utm_source=x`: main sent `ad:"d19"` (the hero variant), branch sends `ad:"d21"` and adds `src:""`; a bare jersey visit now sends `ad:""` (Atlas assumption 6) | `logs/04-beacon-compare.txt`, `beacon-3100.raw.json`, `beacon-3101.raw.json` | Fable (confirm the readout does not rely on the old jersey `ad` value) |

SF-1 is the M-6 fix working (the tagged URL now survives and the d21 hero shows), and the brief lists the jersey
URL under N1 as expected equal, so the pair is reported as a difference per the brief. The brief says every
difference gets a diff image: the two pages differ in height (size mismatch), so a pixel diff image is not
meaningful; the two screenshots per viewport are the evidence.

Seen and not counted: the torn-paper 404s also appear on `/season1/thanks` (two of the three files), same as on main
(`curl` of `/images/new%20torn%20paper/torn-paper-white-top-1@2x.png` is 404 on 3100 and 3101 although the file is
tracked in git), the local `next start` artifact the brief names.
