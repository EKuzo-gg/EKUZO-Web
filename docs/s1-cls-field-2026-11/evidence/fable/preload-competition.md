# Preloads compete with the HTML on a throttled link (Fable, 2026-11-09, 13:45 CT)

Read from Sentry A's block 1 run JSON (`evidence/vitals/branch-tier1/fb-android-412/*-run2.json`)
and Chronos's main baseline raw runs (archive `scratchpad/vitals-raw/main-baseline.tgz`,
`main-baseline/fb-android-412/*-run2.json`; sha256 in `main-baseline/manifest.json`). Profile
fb-android-412, Slow 4G (1.6 Mbps down), CPU 4x, cold cache. Local servers over HTTP/1.1.

| Ad | Build | Document responseEnd | Hero image request start to end | Script ready (`s1Ready`, or hero injected on main) | LCP |
|---|---|---|---|---|---|
| d19 | main 45dfe97 | 1074 | 1317 to 3226 (team-walk-1600, 146 KB) and 1317 to 2964 (southie-back, 93 KB) | 1338 | 3004 (`img.jb` southie-back) |
| d19 | branch 2b9bc16 | **2312** | 222 to 2627 and 225 to 2365 | **2489** | 2536 |
| d18 | main | 1074 | laughing 40 KB after the script | 1212 | 1904 |
| d18 | branch | 1316 | 40 KB from 0.2 s | 1461 | 1472 |
| noad | main | 1068 | mc-blocks 143 KB after the script | 1207 | 2508 |
| noad | branch | 1712 | 143 KB from 0.2 s | 1943 | 2320 |

Document bytes: 132,578 (main), 137,233 (branch; the head tables add about 5 KB).

## What this means

The head bootstrap starts the hero image requests at about 0.2 s, as intended (L2). On a
bandwidth-bound link those bytes share the pipe with the rest of the HTML, and the big inline
script sits at the end of the HTML. So the document finishes later by the time the images take:
d19 +1.24 s (238 KB of images), noad +0.64 s (143 KB), d18 +0.24 s (40 KB). The form handlers and
the hero injection (`s1Ready`) move by the same amount: d19 1.34 s to 2.49 s.

L1 on d19 missed its bar (Sentry SA-1) for the same reason: southie-back, the LCP element, shares
the link with team-walk-1600 (146 KB), which is listed first in `HERO_IMG` and carries
`fetchpriority="high"`; southie-back has the plain preload. The LCP image was requested at 0.2 s but
only finished at 2.37 s.

L5 ("first long task not later than main by more than 20 ms") fails on every cell for the same
reason: the big script runs when its bytes arrive.

First paint and FCP improve on every cell (the blocking stylesheet shrank from 158 KB parsed to
about 1.3 KB), and CLS is unchanged.

## Options

1. **Order the preload list by LCP element and preload only that one image.** d19 becomes
   `["southie-back","team-walk-hd"]` with only the first preloaded; the second loads when the hero
   is injected, as on main. Expected on d19 at Slow 4G: document end about 1.5 s, ready about
   1.7 s, LCP about 1.4 s (93 KB alone from 0.2 s), team-walk-hd from about 1.7 s to about 2.5 s
   (no later than today's 2.63 s). The single-image ads keep today's branch behavior.
2. **Keep both preloads, give the second `fetchpriority="low"`.** Helps only if the server honors
   HTTP/2 stream priorities; HTTP/1.1 (the local lab) opens parallel connections and shares
   bandwidth regardless, so the lab cannot prove it. Netlify serves HTTP/2; whether its edge
   prioritizes streams is unknown. Measure on the dev deploy before choosing.
3. **No preload at all (main's order).** Script ready as on main; LCP loses the 0.4 s it gained on
   d18 and d2 and the hero is discovered only at script time. Rejected unless 1 and 2 both fail.

The trade in every option: on a slow link, bytes spent on the hero image before the HTML ends
delay the form's handlers by about the image's transfer time. The reserved hero box (`pa`) and
the earlier first paint mean the page looks complete earlier either way; the form just answers
taps later. A parent typing an email within 2.5 s of arrival is the only visitor who feels it
(U-4; the harness measures that window).

Decision after the dev probe (`h2probe-*.json` in this folder): see `03-decision-log.md` D24.
