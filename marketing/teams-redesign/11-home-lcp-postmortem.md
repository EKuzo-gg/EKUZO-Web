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

- `marketing/teams-redesign/11-home-lcp-postmortem.md` (this file, new)
- WORKLOG.md (entry being added separately)

No source code touched. No git commits initiated by this work.
Phase 9 implementation (§6.1 + §6.2) is Jamie's call after reading
this doc.
