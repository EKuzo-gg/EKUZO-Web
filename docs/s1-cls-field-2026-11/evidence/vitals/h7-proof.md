# H7 proof of faithfulness

Chronos, 2026-11-09. Requirement H7: on the pre-fix page `3433a5b` (local build, port 3102) the
harness must show windowed CLS at or above 0.25 in at least 3 of 5 runs for d18 and for d19 under
`fb-android` 412 `slow4g`, with `section#join-top` and `section.how` as sources; on main (port 3101)
the same cells must read under 0.1.

**Result: H7 passes on the first pass.** Pre-fix: 5 of 5 runs at 0.6776 (d18) and 0.6133 (d19),
sources `section#join-top.join` + `section.how` in every run. Main: 0.0035 (d18) and 0.0015 (d19),
0 runs at or above 0.1. The ladder was not needed (`h7-ladder.md`).

## Settings (both builds)

`fb-android-412`: Facebook Android in-app UA (`FB_IAB/FB4A`), 412x915 at DPR 2.625, `isMobile`,
`hasTouch`; CPU 4x; Slow 4G (1.6 Mbps down, 0.75 up, 150 ms); fresh context per run; analytics
blocked; full H3 journey (10 s wait after load, touch scroll down with a 56 then 110 px toolbar
collapse, scroll up, three header crossings, email tap and "a"); N=5.

| Build | Port | Served from | Label | Harness commit | Machine loop (ms) |
|---|---|---|---|---|---|
| `3433a5b` (pre-fix, 1,350,164 B page) | 3102 | `/home/claude/wt-prefix` | `prefix-3433a5b` | `5788c13` | 196 |
| `45dfe97` (origin/main) | 3101 | `/home/claude/wt-main` | `h7-main-45dfe97` | `f8d4cd8` | 212 |

The harness commits differ only by `f8d4cd8` (trims data-URI LCP urls in the JSON; no measurement
change). The H9 baseline (`main-baseline`, harness `d857b1a`) has the same main cells and reads the
same numbers (d18 0.0035, d19 0.0015).

## Stability, pre-fix `3433a5b`

| Cell | Ad | N | CLS win med | CLS win max | win +input max | total med | total max | runs >= 0.1 | runs >= 0.25 | top source | worst window start (ms, med) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fb-android-412 | d18 | 5 | 0.6776 | 0.6776 | 0.6776 | 0.6848 | 0.6849 | 5 | 5 | section#join-top.join + section.how (5x) | 7727 |
| fb-android-412 | d19 | 5 | 0.6133 | 0.6133 | 0.6133 | 0.6204 | 0.6205 | 5 | 5 | section#join-top.join + section.how (5x) | 7738 |

## Stability, main `45dfe97`

| Cell | Ad | N | CLS win med | CLS win max | win +input max | total med | total max | runs >= 0.1 | runs >= 0.25 | top source | worst window start (ms, med) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fb-android-412 | d18 | 5 | 0.0035 | 0.0035 | 0.0066 | 0.0036 | 0.0037 | 0 | 0 | h3 + div.row (5x) | 1955 |
| fb-android-412 | d19 | 5 | 0.0015 | 0.0015 | 0.0066 | 0.0016 | 0.0017 | 0 | 0 | form + p (4x) | 1318 |

## Loading, both builds

| Build | Ad | FCP med | LCP med | LCP max | LCP element | first long task start / dur |
|---|---|---|---|---|---|---|
| `3433a5b` | d18 | 1228 | 7752 | 7772 | img.ph (data URI) | 7555 / 162 |
| `3433a5b` | d19 | 1228 | 9060 | 9124 | img.jb southie-back.webp | 7559 / 175 |
| `45dfe97` | d18 | 1224 | 2024 | 2032 | img.ph laughing.webp | 1217 / 98 |
| `45dfe97` | d19 | 1208 | 2976 | 3000 | img.jb southie-back.webp | 1195 / 119 |

## Reading

The harness reproduces the field failure and its mechanism. In run 1 on `3433a5b` (keep file
`prefix-3433a5b/keep-fb-android-412-d18-run1.json`) the document finishes downloading at 7,584 ms
(`responseEnd`; 1.35 MB of HTML, most of it base64 images inside the big inline script). The script
then builds the hero, and at 7,749 ms one shift of 0.6776 moves `section#join-top.join` from y=8 to
y=503 (495 px, the hero's height at 412 wide) and pushes `section.how` out of the viewport. d19 shows
the same shift at 7,805 ms (0.6133). The timeline in the same file shows `#hero` with no children
until 7,800 ms and then 495 px tall.

On main the hero box is reserved before the hero exists (`#hero.pa` on page A), the page is 127 KB,
the hero image is a file, and the worst window is a 0.0035 text re-wrap at about 2 s
(`h3`, `div.row`, button text, the late font swap inside the hero) on d18 and a 0.0015 move of the
form and its paragraph on d19.

Clarity's field values for these ads before the Nov 5 release were 0.70 to 0.75 (Scout,
`scout/codebase-map.md` § 2); the harness reads 0.61 to 0.68 at 412x915. The harness value likely sits a
little lower because a 915 px tall viewport is taller than the visible area of an in-app browser,
and the shift is measured as a fraction of the viewport. The short-viewport profiles (`--viewport
412x700`, `360x640`) are available if a closer match is wanted; they were not needed for the gate.

What this proves: a lab number from this harness under `fb-android-412 slow4g` counts as evidence
for the S and L gates (H7). It does not by itself prove behaviour that depends on the in-app
browser's own scripts or text-size setting (Scout § 2 item 6); those stay with HC1 and HC2.

Raw run JSON (gitignored) is archived outside the repo at
`/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/vitals-raw/`; the
sha256 of every file is in each label's `manifest.json`.
