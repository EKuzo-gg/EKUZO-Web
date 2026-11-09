# Phase 0: field truth on the Season 01 landing page (2026-11-09, 09:55 to 10:10 CT)

Source: Clarity project "EKUZO Web" (wml8wll5ua), read in the built-in browser on Jamie's Mac,
Recordings view with the Performance filters. Times are as Clarity displayed them (Jamie's
local time, America/Chicago). Nothing here was changed in Clarity.

## CLS

| Window | Filter | Result |
|---|---|---|
| Last 7 days | CLS >= 0.25 (poor) | 18 sessions. Earliest Nov 3 18:39 (d2), latest **Nov 5 07:32** (d21). By ad: d19 7, d18 5, d21 3, d17 2, d2 2 (one d4 session also in the list, entry d4-a-teamcard-az; counts from the page text). Browsers: FacebookApp 14, InstagramApp 4. |
| Last 3 days | CLS >= 0.25 (poor) | **0 sessions** ("No recordings found"). |
| Last 3 days | CLS < 0.25 (needs improvement) | 3 sessions: d4 Nov 8 22:37 FacebookApp (2:39, 12 clicks); d4 Nov 8 10:49 Edge (6:26, 9 clicks, 4 pages); non-ad Nov 7 23:37 ChromeMobile. |
| Last 3 days | CLS < 0.1 (good) | **182 sessions** of 439 total (Clarity scores about 42% of sessions). First page of results: d19 26, d2 20, none 16, d18 13, d4 11, d21 8, d17 5, d16 1. |

Round 2 release (a919b25 / main 45dfe97, "interactive-hero box reserved on phones", page 1.35 MB
to 127 KB) went live 2026-11-05 11:08 CT per the 11-06 read. Every poor-CLS session in the last
7 days predates it. The 0.70 and 0.75 in the 11-05 and 11-06 reads came from Clarity's "Last 3
days" window, which still held pre-fix loads. Today's read (11-09, 09:12 CT) shows d19 CLS 0 good on 6
scored page views and d18 "no data" in the per-URL performance panel, which samples far fewer page
views than the recordings filter above.

Conclusion: the layout shift on d18 and d19 is fixed in the field as of the Nov 5 release.

## Other field signals, last 3 days (post-fix)

| Metric | Filter | Result |
|---|---|---|
| INP | >= 500 ms (poor) | 5 sessions: d4 Nov 8 12:15 ChromeMobile (0:09, 0 clicks); d19 Nov 8 11:07 FacebookApp (13:59, 86 clicks, outlier); d21 Nov 7 21:08 InstagramApp; d21 Nov 7 09:52 FacebookApp; d17 Nov 7 09:35 FacebookApp (3:14, 10 clicks). |
| LCP | >= 4 s (poor) | 19 sessions (about 10% of the ~185 scored). First page by ad: none 5, d19 4, d4 4, d18 3, d21 1, d17 1, d16 1. Browsers on the first page: FacebookApp 11, Chrome 4, ChromeMobile 4. |
| JS errors | dashboard, last 3 days | 10.45% of sessions, 50 errors: 94% "error invoking postmessage: java object is gone" (Facebook Android WebView), 6% "script error." |
| Browsers | dashboard, last 3 days | FacebookApp 66.4% (292), InstagramApp 14.3% (63), ChromeMobile 9.3% (41), MobileSafari 5.0% (22), Chrome 3.9% (17). |
| Dashboard performance panel | last 3 days, 24 page views scored | 86/100; LCP 2 s good; INP 250 ms needs improvement; CLS 0 good. |
| Entry pages | last 3 days | /season1 386, /season1/join/jersey 15, / 14, /season1/join 14, /season1/thanks 7. |

## Correction (Scout, 10:50 CT): the lab did reproduce the field failure

The first draft of this section said the lab harness never reproduced the d18/d19 shift. That was
wrong, and the error was Fable's: it read Round 2's "before" column (`a919b25`: d18 0, d19 0.0013)
as a pre-fix measurement. `a919b25` already contained the page A fix.

What happened on Nov 5, in order (`scout/codebase-map.md` § Corrections and § 2):

| Commit | Time (CT) | What it fixed | Lab evidence |
|---|---|---|---|
| `3433a5b` and `8ce0e17` | Nov 3 to 5 morning | the pre-fix landing page (1.35 MB, hero built by the inline script at ~7 s) | join-sync `evidence/cls/before-probe.json`: **d18 0.854, d19 0.787** at 375x667, CPU 4x, Slow 4G |
| `0fc8ad1` (in `a919b25`) | 10:51 | page A box reservation (`#hero.pa:empty{aspect-ratio:4/5}`): d11, d12, d16, d18 to d21 and every ad not in `AD_HERO` | round 2 table "before" column: d18 0, d19 0.0013 |
| `d46c5c0` | 11:35 | interactive-hero reservation (`pre-ih`), images out of the inline script (page to 127 KB) | round 2 table "after": d1 0, d2 0.054, d10 0.0003 |

The field 0.70 to 0.75 is the same single shift (the 4:5 art box appearing above the form after
~7 s) scaled to an in-app WebView's shorter visible height: 450 px over about 640 px visible is
0.70. Clarity's zero poor sessions since Nov 5 07:32 confirm both releases.

What the old harness did not cover, and what the new one adds, is the residual risk, not the Nov 3
to 5 failure: Android in-app viewport shapes, scroll and tap journeys (the `.solid` header
transition, `fitHero` re-running on toolbar-collapse `resize`), late font swap below the hero,
`hadRecentInput` entries logged rather than dropped (the probe saw a spurious one), and total shift
alongside the windowed value. The proof-of-faithfulness gate (H7) therefore uses `3433a5b` as the
pre-fix commit, and the harness's job is regression and residual-risk coverage, not rediscovery.
