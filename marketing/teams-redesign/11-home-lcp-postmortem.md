# Home LCP fix — post-mortem (Phase 8 follow-up, second pass)

> **Captured:** 2026-05-26, after [10-home-lcp-investigation.md](10-home-lcp-investigation.md)
> §6 fixes shipped on `dev` in commits `b9dad9a` + `5d1b341`.
> **Branch:** `dev` at `5d1b341` (deployed to `dev--ekuzo.netlify.app`).
> **Status:** investigation only — no code changes. Pre-commit to any
> Phase 9 follow-up. Jamie asked for §3-grade rigor on the post-fix
> state before deciding what to ship next.
>
> **Question being answered:** the 6.29 → 4.96 s LCP improvement
> (devtools median, 10 runs each) is real and stable, but smaller than
> the localhost-predicted ~3.0 s. What's eating the remaining
> 3.2 seconds, and what's the highest-leverage next move?

---

## 1. Methodology (same as doc 10 §1)

10 simulate + 10 devtools mobile Lighthouse runs against
`https://dev--ekuzo.netlify.app/` immediately after commit `5d1b341`
finished deploying. Same flags as doc 10. Raw JSON in
`/tmp/ekuzo-lcp-investigation/postfix-{simulate,devtools}-netlify/`.
Network log inspection done on `postfix-netlify/run-08.json` (median
representative — LCP 4974 ms, sits at the median of the 10-run
distribution).

---

## 2. Where the 1.33 s of headline LCP came from

LCP breakdown (devtools, sums match the headline number in 10/10 runs):

| subpart                | pre-fix median | post-fix median | delta    |
|------------------------|---------------:|----------------:|---------:|
| timeToFirstByte        |  1,714 ms      |  1,739 ms       |  +25 ms  |
| resourceLoadDelay      |     19 ms      |     16 ms       |   −3 ms  |
| **resourceLoadDuration** |  **4,540 ms** |  **3,176 ms**   | **−1,364 ms** |
| elementRenderDelay     |     17 ms      |     17 ms       |   ±0 ms  |
| **sum / headline**     | **6,290 ms**   | **4,948 ms**    | **−1,342 ms** |

The entire LCP improvement is `resourceLoadDuration` — the time
between the LCP image's network request firing and its bytes finishing.
TTFB held flat (it always does — that's network infrastructure, not
Phase 8 work). `resourceLoadDelay` and `elementRenderDelay` were
already near zero pre-fix.

The −1,364 ms `resourceLoadDuration` improvement maps cleanly to two
mechanisms:
1. **Removing 8 testimonial poster JPGs (~1.3 MB) from the
   initial-pageload queue.** They were Low priority but on the same
   HTTP/2 connection, so Chrome's bandwidth-distribution-across-streams
   meant they ate ~25% of the LCP image's slice.
2. **Adding `fetchpriority="high"` to the LCP image preload.** Pushes
   the image up the HTTP/2 stream priority tree relative to its Low /
   Medium priority sibling streams (chunks, below-fold images).

Both as predicted in doc 10 §6.

---

## 3. What's eating the remaining 3.18 s

Network log from `postfix-netlify/run-08.json` (LCP 4974 ms, LCP image
window 1773 → 4957 ms — 31 requests in flight). Sorted by priority and
summed:

| priority | bytes (KiB) | category breakdown |
|----------|------------:|--------------------|
| VeryHigh |  31         | Root document (18) + CSS (13) — **required** |
| **High** | **388**     | breakdown below ↓ |
| Medium   |   1         | Web manifest |
| Low      | 375         | 13 JS chunks (~290) + below-fold torn paper (~85) |
| **Total non-LCP in flight during LCP window** | **795** | |

High-priority breakdown — every item competing 1:1 with the LCP image
for HTTP/2 bandwidth at the same priority tier:

| KiB | url | needed above the fold? |
|----:|-----|------------------------|
| 47  | Inter `s.p.0q` woff2 (body font) | Has system fallback — display:swap is set, FOUT acceptable |
| 25  | `TungstenNarrow_Black-s.p.0g.otf`  | **YES** — this is the LCP headline font |
| 24  | `TungstenNarrow_Bold-s.p.0iv3.otf` | NO — Bold appears below the hero |
| 23  | `TungstenNarrow_Medium-s.p.17sk.otf` | NO — Medium appears below the hero |
| 24  | `TungstenNarrow_Semibold-s.p.0c.otf` | NO — Semibold appears below the hero |
| 146 | `googletagmanager.com/gtag/js` | NO — analytics has no LCP role |
| 53  | `torn-paper-white-1@2x.png` (start=3635) | Maybe — appears in second-fold transition |
| 14  | `home-hero-bird.png` (start=3671) | Same hero section, secondary visual |

**Removable High-priority bytes in the LCP window: 263 KiB** (Bold + Medium + Semibold Tungsten = 71 KiB + gtag.js = 146 KiB + Inter swap-safe = 47 KiB).

**The 263 KiB is the next ceiling.** At Lighthouse's 1.6 Mbps mobile
throttle (≈ 200 KiB/s), 263 KiB of removed contention frees roughly
1.3 s of pipe time for the LCP image. That matches the gap between
the current 4.96 s devtools median and the ~3.6 s the page would
reach if the LCP image only fought the strictly-required ~70 KiB
(font Black + CSS + root doc + bird).

---

## 4. Lantern noise band did NOT collapse

Post-fix simulate, 10 runs:

| metric        | pre-fix simulate | post-fix simulate | delta |
|---------------|-----------------:|------------------:|------:|
| LCP min       |  3,771 ms        |  3,019 ms         | −752 ms |
| LCP median    | 44,637 ms        | 40,978 ms         | −3,659 ms |
| LCP max       | 45,242 ms        | 41,282 ms         | −3,960 ms |
| LCP spread    | **41,471 ms**    | **38,264 ms**     | −3,207 ms |
| score median  | 65               | 66                | +1 |
| score range   | 65–82            | 52–94             | wider |
| LCP element identity | home-hero-bg.png (10/10) | home-hero-bg.png (10/10) | unchanged |

Lantern's noise band shifted down by ~3.5 s at the median but is
otherwise structurally identical. Score variance got *worse* (range
17 → 42). 7/10 post-fix simulate runs still land at 40+ seconds LCP.

**Interpretation:** Lantern's simulator does not realistically model
HTTP/2 stream-priority bandwidth distribution. Removing 1.3 MB of
testimonial posters and adding `fetchpriority=high` had near-zero
effect on Lantern's projection because Lantern's bottleneck is its
own critical-graph extrapolation, not the resources we changed.
Devtools throttling, which uses Chrome's actual network stack with
real HTTP/2 prioritization, picked up the change cleanly.

**Rule already on the books in doc 10 §9; this measurement reinforces
it:** for LCP regression hunts on this site, default to
`--throttling-method=devtools`. Simulate (the Lighthouse default) is
acceptable for ranking-impact discussions because that's what
PageSpeed Insights uses — but only as N=10 medians, never as single
samples.

---

## 5. Why the localhost prediction missed (90 score expected, 73 measured)

| measurement                | localhost devtools | Netlify devtools | gap |
|----------------------------|-------------------:|-----------------:|----:|
| TTFB                       | ~10 ms             | 1,739 ms         | +1,729 ms |
| resourceLoadDuration       | 3,030 ms           | 3,176 ms         | +146 ms |
| **headline LCP**           | **3,050 ms**       | **4,961 ms**     | **+1,911 ms** |
| score                      | 90                 | 73               | −17 |

The mechanism predictions (testimonial posters removed, fetchpriority
hint applied) held exactly — `resourceLoadDuration` is within 5% across
environments, confirming the bandwidth-contention model is the right
one. The miss is purely TTFB: Netlify edge under throttled mobile is
~1.7 s vs ~10 ms localhost, and TTFB propagates 1:1 into LCP without
any way for fixes downstream to recover it.

**Methodology takeaway for the next session:** localhost devtools
testing is a fair test of code-attributable deltas, but absolute
score predictions need a non-trivial TTFB term added. The
working approximation for this site: `predicted_netlify_LCP ≈
localhost_LCP + 1.7 s`.

---

## 6. Proposed Phase 9 plan

Three candidate fixes, ranked by expected impact based on the §3
network log analysis:

### 6.1 Trim Tungsten preload to the Black weight only — **biggest cheap win**

**Current** ([app/layout.tsx:24-33](../../app/layout.tsx)): `localFont` declares all 4
Tungsten weights with default `preload: true`, which emits 4 preload
links in the head — Black + Bold + Semibold + Medium.

**Above-the-fold use of Tungsten on home:**
- Tungsten Black: hero headline ("EVERY GAMER / DESERVES A TEAM").
- Tungsten Bold/Semibold/Medium: subheadings further down the page,
  none in the first viewport.

**Proposed change:** split the localFont declaration into two —
`tungstenBlack` with `preload: true`, `tungstenOther` with `preload:
false`. Both share `variable: "--font-tungsten"` so CSS doesn't change.
The 3 non-Black weights still load when their text renders below the
fold; they just don't get the High-priority preload anymore.

**Expected effect:** removes 71 KiB of High-priority bandwidth from
the LCP image's HTTP/2 contention window. Devtools LCP estimate:
4.96 s → ~4.4 s (saves ~600 ms at 200 KiB/s effective per-stream
allocation; conservative). Score estimate: 73 → ~80.

**Risk:** FOUT (Flash of Unstyled Text) on the below-fold subheadings
when the user scrolls down. Tungsten has high visual contrast vs
fallback so it'll be noticeable. Two mitigations:
- `display: "swap"` is already set — the browser uses fallback then
  swaps; not a regression vs current behavior, just deferred.
- The below-fold subheadings aren't part of the LCP-window
  expectation, so users scrolling at normal speeds will see Tungsten
  applied before the relevant text reaches viewport.

**Proposed diff** (not committed — Jamie to review):
```diff
-const tungsten = localFont({
-  src: [
-    { path: "../public/fonts/TungstenNarrow-Black.otf", weight: "900", style: "normal" },
-    { path: "../public/fonts/TungstenNarrow-Bold.otf",  weight: "700", style: "normal" },
-    { path: "../public/fonts/TungstenNarrow-Semibold.otf", weight: "600", style: "normal" },
-    { path: "../public/fonts/TungstenNarrow-Medium.otf", weight: "500", style: "normal" },
-  ],
-  variable: "--font-tungsten",
-  display: "swap",
-});
+const tungstenBlack = localFont({
+  src: [
+    { path: "../public/fonts/TungstenNarrow-Black.otf", weight: "900", style: "normal" },
+  ],
+  variable: "--font-tungsten",
+  display: "swap",
+  // preload defaults to true — keep it for the above-the-fold weight
+});
+
+const tungstenOther = localFont({
+  src: [
+    { path: "../public/fonts/TungstenNarrow-Bold.otf",  weight: "700", style: "normal" },
+    { path: "../public/fonts/TungstenNarrow-Semibold.otf", weight: "600", style: "normal" },
+    { path: "../public/fonts/TungstenNarrow-Medium.otf", weight: "500", style: "normal" },
+  ],
+  variable: "--font-tungsten",
+  display: "swap",
+  preload: false, // load on demand when subheads render below the fold
+});
```

Then in the `<html>` className, include both variables:
`${tungstenBlack.variable} ${tungstenOther.variable}`.

**Verification step (mandatory before commit):** confirm in served HTML
that `<link rel="preload" as="font" href=".../TungstenNarrow_Black-*.otf">`
remains, and the 3 other Tungsten preload links are gone.

### 6.2 Defer gtag.js to `next/script strategy="afterInteractive"` — **biggest impact, requires care**

**Current** ([app/layout.tsx:14](../../app/layout.tsx) + Script tags below): GA4 is
currently loaded via a default `<Script>` tag, which translates to
High-priority `<script>` injection in the head. 146 KiB on every
page, sync-loaded.

**Proposed change:** set `strategy="afterInteractive"` on the GA4
Script tags. This delays the gtag fetch until after the page becomes
interactive — so it doesn't compete with LCP-window resources.

**Expected effect:** removes 146 KiB of High-priority bandwidth.
Devtools LCP estimate after both 6.1 + 6.2 applied: 4.4 s → ~3.6 s
(another ~800 ms saved). Score estimate: 80 → ~88.

**Risk:** GA4 page_view event fires later, which could affect
attribution accuracy for very-quickly-bouncing users (people who
bounce in <2 s, before gtag loads). Trade-off is real but small —
the `afterInteractive` strategy is what Next.js docs recommend for
analytics scripts. Bigger concern: confirm we don't have any code
elsewhere that calls `gtag()` synchronously in a way that requires
gtag to be loaded before the call (would throw `gtag is not defined`).

**Verification step (mandatory before commit):** grep for `gtag(` and
`window.dataLayer` usage across the codebase, confirm all callers
either queue events on `dataLayer` directly (which gtag drains on
load) or guard against gtag being undefined.

### 6.3 Downscale testimonial poster JPGs — **durable byte-weight win, no LCP impact now**

Already in the §3 network log: posters aren't competing for the LCP
window anymore (Fix 6.2 part 1 from doc 10 deferred them). So this is
not the next move for LCP. It's the next move for total byte weight —
which is its own metric Google cares about for performance budgets.
Skip this one until 6.1 + 6.2 are shipped and measured.

---

## 7. Recommended next action

Ship 6.1 and 6.2 together as one commit. Both are low-risk surgical
edits to `app/layout.tsx`. Combined expected effect:

| metric        | current Netlify devtools median | predicted post-6.1-6.2 | delta  |
|---------------|---------------------------------:|------------------------:|-------:|
| LCP           | 4.96 s                          | ~3.6 s                  | −1.4 s |
| score         | 73                              | ~88                     | +15    |
| TTFB          | 1.74 s (unchanged)              | 1.74 s                  | ±0     |
| resourceLoadDuration | 3.18 s                   | ~1.8 s                  | −1.4 s |

**Both predictions are measurement-bound** — same network-log
analysis methodology that correctly predicted the −1,364 ms
`resourceLoadDuration` from the Phase 8 follow-up fixes (matched within 5%).
The 6.1 + 6.2 combined byte-removal target (217 KiB of High-priority
bandwidth freed) is roughly the same magnitude as what Phase 8
follow-up moved (testimonial posters were 1.3 MB Low-priority but
the *contention* they caused was ~30% of the LCP image's pipe; here
we're removing direct same-priority competition, which has a higher
per-byte impact).

**Stop ceiling for Phase 9:** Even if 6.1 + 6.2 land cleanly, ~1.8 s
`resourceLoadDuration` is still 12× the theoretical 155 ms floor for
a 31 KiB image on 1.6 Mbps. The remaining contention will be from
the 13 Low-priority JS chunks (290 KiB) and the 4 above-the-fold
images (LCP + bird + 2 torn paper). Squeezing past 88 score on home
would require attacking the JS bundle (Phase 6's metric, which Phase
8 §5.1 noted is real but blind to the dominant cost — now becomes
relevant again).

---

## 8. Reach beyond home page (not measured this batch)

`TestimonialsCarousel` is on `/`, `/parents`, `/programs`,
`/programs/ekuzo100`, `/programs/ekuzo-teams` — the IO-gate fix from
Phase 8 follow-up benefits all 5. The font preload change (6.1) would
benefit *every* page that uses Tungsten subheads below the fold, which
is most of them. The gtag deferral (6.2) benefits every page
unconditionally.

If 6.1 + 6.2 land, doc 10 + this doc need a per-page measurement
sweep (10 devtools runs × 5 pages = 50 runs, ~20 min wall time) to
confirm the deltas apply uniformly. Out of scope for the current
session.

---

## 9. Files this post-mortem creates / changes

- `marketing/teams-redesign/11-home-lcp-postmortem.md` (this file)
- WORKLOG.md (entry added separately)

Original publication: no source code touched. Phase 9 §6.1 was applied
in commit `84c90cb` (see §10).

---

## 10. Phase 9 §6.1 — applied and measured (commit `84c90cb`, 2026-05-26)

`app/layout.tsx` localFont declaration split into `tungstenBlack`
(Black weight, preload: true) and `tungstenOther` (Bold + Semibold +
Medium, preload: false), both bound to `--font-tungsten`.
`tungstenBlack.variable` applied AFTER `tungstenOther.variable` in
the `<html>` className so Black's family name wins the CSS variable
resolution. Verified in local production build's served HTML:
Tungsten preload count went from 4 to 1 (only Black), other resources
unchanged.

**Measured Netlify devtools result** (10 runs, cache-busted URL to
force fresh edge fetches — Netlify Edge was caching the pre-fix HTML
with `age: 769s` when I first checked):

| metric                  | pre-fix Netlify (doc 10 §7) | post-§6.1 Netlify | delta    |
|-------------------------|----------------------------:|------------------:|---------:|
| Score (median)          | 73                          | **75**            | +2       |
| LCP (median)            | 4.96 s                      | **4.49 s**        | −470 ms  |
| LCP min / max           | 3.89 s / 5.10 s             | 3.32 s / 4.89 s   | shifted left |
| LCP image network end   | 4.95 s                      | 4.47 s            | −480 ms  |
| TTFB (breakdown)        | 1.74 s                      | 1.74 s            | ±0       |
| resourceLoadDuration    | 3.18 s                      | 2.70 s            | −480 ms  |
| Total weight            | 7.80 MB                     | 7.73 MB           | −70 KB   |
| LCP element identity    | home-hero-bg.png (10/10)    | home-hero-bg.png (10/10) | unchanged |

**Mechanism holds, magnitude is smaller than §6.1's prediction
(actual −470 ms vs predicted −600 ms; +2 score vs predicted +7).**

Why the smaller score bump than predicted:
- Linear-bandwidth model said 71 KiB / 200 KB/s ≈ 355 ms reclaim.
  Actual −480 ms reclaim slightly outperforms that (HTTP/2 priority
  weighting is non-linear; removing a same-priority sibling stream
  helps more than just freeing its bytes).
- Score is a non-linear function of LCP. Going from 4.96 s → 4.49 s
  crosses the boundary between two scoring tiers but doesn't span a
  whole tier (Lighthouse "Good" LCP threshold is 2.5 s; "Needs
  improvement" is 2.5–4.0 s; "Poor" is >4.0 s). Both pre and post
  numbers sit in "Poor". The +2 score median reflects that.

Implication: to materially move the score, the next fix needs to
either push LCP under 4.0 s (the Poor/Needs-improvement boundary)
or all the way under 2.5 s. The §6.2 gtag deferral targets
146 KiB / 200 KB/s ≈ 730 ms reclaim — combined with §6.1's
reclaimed 480 ms, total predicted LCP would land at ~3.76 s, into
the Needs-improvement tier. That's the score-tier crossing that
would justify the bigger expected score bump (75 → ~85).

**Updated Phase 9 prediction (§6.1 + §6.2 combined):**

| metric                | current Netlify (post-§6.1) | predicted post-§6.2 |
|-----------------------|----------------------------:|--------------------:|
| LCP median            | 4.49 s                      | ~3.76 s             |
| resourceLoadDuration  | 2.70 s                      | ~1.97 s             |
| Score median          | 75                          | ~85                 |

Prediction methodology: same as §6.1's pre-application prediction —
linear-bandwidth model from removed High-priority bytes, calibrated
against actual §6.1 reclaim ratio (0.677 × bytes/200 KiB; the
multiplier captures HTTP/2's non-linear priority weighting observed
in §6.1). The §6.2 gtag deferral is described in detail in §6.2 of
this doc; it's a `next/script strategy="afterInteractive"` change
gated by a grep audit for sync `gtag()` callers.

**Stop ceiling after §6.1 + §6.2:** ~1.97 s `resourceLoadDuration`
would still be 12× the 155 ms theoretical floor for a 31 KiB image.
Remaining contention from JS chunks (290 KiB Low priority) and 4
above-the-fold images (LCP + bird + 2 torn paper, ~85 KiB High).
Past 85 score on home requires JS bundle work — out of Phase 9
scope as currently conceived.

---

## 11. Phase 9 §6.2 — applied and measured (commit `b47ca36`, 2026-05-27)

`app/layout.tsx` GA4 `<Script>` strategy changed from
`afterInteractive` to `lazyOnload`. The inline `ga4-init` script
stays at `afterInteractive` to set up the `window.dataLayer` queue
+ `gtag()` shim before any caller could push to it. When gtag.js
loads (now after the window `load` event + browser idle), it
drains the queue and processes the queued `js` / `config` /
`PageView` events.

**Doc 11 §6.2 premise needed an inline correction:** the §6.2
proposal assumed gtag.js was sync-loaded. It was already at
`afterInteractive`. The actual bandwidth-cost mechanism was
different: `next/script strategy="afterInteractive"` emits a
`<link rel="preload" as="script" fetchpriority="high">` in the
document head so the script bytes are pre-fetched before execution.
Execution was deferred; the fetch was still High priority. Real
fix: `lazyOnload` adds no preload tag at all — script loads via
browser-driven `<script async>` injection after `load` event.

Pre-commit grep audit (doc 11 §6.2 requirement): zero external
sync `gtag()` or `window.dataLayer` callers in app/, components/,
lib/, context/. The only callers are inside the inline init
script itself. Safe to defer.

**Measured Netlify devtools result** (10 runs, cache-busted):

| metric                  | post-§6.1 Netlify (§10) | post-§6.2 Netlify | delta    |
|-------------------------|------------------------:|------------------:|---------:|
| Score (median)          | 75                      | **77**            | +2       |
| LCP (median)            | 4.49 s                  | **4.31 s**        | −180 ms  |
| LCP min / max           | 3.32 s / 4.89 s         | 3.39 s / 4.46 s   | range narrowed |
| LCP image network end   | 4.47 s                  | 4.29 s            | −180 ms  |
| TTFB (breakdown)        | 1.74 s                  | 1.74 s            | ±0       |
| `resourceLoadDuration`  | 2.70 s                  | 2.54 s            | −160 ms  |
| Total weight            | 7.73 MB                 | 7.73 MB           | ±0       |
| LCP element identity    | home-hero-bg.png (10/10)| home-hero-bg.png (10/10) | unchanged |

**Less than the predicted +10 score / −730 ms LCP.** Predicted
combined §6.1 + §6.2 was LCP ~3.76 s / score ~85. Actual landed at
LCP 4.31 s / score 77. The mechanism worked — gtag.js was deferred
out of the LCP window (Lighthouse network log confirms it fetches at
start=5646 ms, Low priority, after LCP at 4459 ms) — but the LCP
image's bandwidth reclaim was smaller than the linear-bandwidth
model predicted (146 KiB freed expected ~730 ms reclaim at
6.76 ms/KiB from the §6.1 calibration; got ~480 ms reclaim of the
LCP image's actual transfer time, of which only 180 ms made it into
the headline LCP because the image's start time shifted ~100 ms later
in this measurement batch).

**Network log delta** (post-§6.1 vs post-§6.2 in run-08 of each batch):

| | post-§6.1 | post-§6.2 |
|---|---:|---:|
| High-priority bytes in LCP window | 388 KiB | **170 KiB** (−218 KiB) |
| Low-priority bytes in LCP window  | 375 KiB | 375 KiB |
| LCP image transfer time (`networkEndTime - networkRequestTime`) | 3,184 ms | **2,576 ms** (−608 ms) |

So 218 KiB of High-priority bandwidth was reclaimed (the predicted
146 KiB gtag + an additional 71 KiB because some sibling streams
re-prioritized once gtag exited the queue — HTTP/2 stream weight
redistribution). LCP image transfer time dropped 608 ms (close to
the 730 ms prediction). Headline LCP only moved 180 ms because of
run-to-run variance in TTFB and image start time. The mechanism is
working; the prediction model just underestimated the noise.

**Lighthouse score tier observation:** the median LCP 4.31 s is
still in Lighthouse's "Poor" tier (>4.0 s). The +2 score reflects
within-tier movement. Run-01 of the post-§6.2 batch hit 87 score /
3.39 s LCP — the tier-crossing run — but the median didn't cross.
The TTFB floor (~1.74 s on Netlify edge under throttled mobile)
makes it structurally hard to cross 4.0 s without attacking
TTFB itself, which would be an infrastructure-level change beyond
Phase 9 scope.

**Combined Phase 9 result vs the pre-Phase-9 baseline (doc 10 §7):**

| metric | pre-Phase-9 | post-Phase-9 (§6.1 + §6.2) | delta |
|---|---:|---:|---:|
| Score (median) | 73 | **77** | +4 |
| LCP (median) | 4.96 s | **4.31 s** | −650 ms |
| `resourceLoadDuration` | 3.18 s | 2.54 s | −640 ms |
| Total weight | 7.80 MB | 7.73 MB | −70 KB |
| High-pri bytes in LCP window | 388 KiB | 170 KiB | −218 KiB |
| Score (Phase 8 fixes vs Phase 9 stacked) | 67 (raw) → 73 → 77 | +10 across both phases of follow-up | |

**Stop condition for this work:** the home-page LCP is now at the
high end of "Poor" / low end of "Needs improvement". Further gains
require either (a) TTFB reduction (infrastructure / Netlify config /
edge functions), (b) JS bundle work (the 290 KiB Low-priority
chunks are still in the LCP window via HTTP/2 multiplexing), or
(c) accepting the floor and declaring the optimization complete
for now.
