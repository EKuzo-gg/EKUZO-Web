# Phase 8 follow-up — home-page LCP regression investigation

> **Captured:** 2026-05-26 (evening session, after Jamie's post-mortem
> handoff). **Branch:** `dev` at commit `b64075c` (no code changes made
> in this session — investigation only).
> **Tool versions:** Lighthouse 13.3.0, Node v24.14.0, headless Chrome
> (whatever Lighthouse 13.3.0 ships with). Network: my workstation →
> Netlify edge, not a clean lab environment.
> **Status:** diagnostic; no commits, no source edits. Aaron / Jamie
> can read this in the morning and decide whether to act on §6.
>
> **Question Jamie asked:** the post-revise Phase 8 numbers (commit
> `0a2dae8`) show the home page went from 3.3s LCP → 4.9s LCP while
> total weight dropped 15.4 MB → 8.9 MB (−42%). The §3.2 hypothesis
> in [09-phase8-perf.md](09-phase8-perf.md) is that the matchMedia
> gate moved the Rive fetch from initial render to `useEffect`, so the
> mobile-only Rive variant paints late and Lighthouse latches LCP to
> the late canvas paint. Is that right?
>
> **Short answer:** no. The LCP element is `home-hero-bg.png`, not the
> Rive canvas. The 3.3s vs 4.9s comparison is a single-sample
> measurement within a noise band that under Lantern (Lighthouse's
> default "simulate" throttling) spans **3.7s to 45s** for the same
> URL at the same commit, across 10 back-to-back runs. Under devtools
> throttling (real Chrome network throttling, more reliable for absolute
> numbers) the same URL produces LCP **5.2s–6.4s (median 6.3s)**, with
> spread 1.2s. The "regression" §3.2 reports is most likely Lantern
> noise. There is, however, a **real, separately measurable** issue:
> the LCP image's preload is missing `fetchpriority="high"` in 20/20
> runs across both methods, and the actual download stretches to
> ~4.5s under devtools because 8 Low-priority testimonial posters
> (~1.3 MB total) share the HTTP/2 connection. Either of those would
> be the right Phase 9 target — and they are unrelated to the
> matchMedia change in Phase 8 §2a.

---

## 1. Methodology

20 Lighthouse runs against `https://dev--ekuzo.netlify.app/`:
- 10 runs with `--throttling-method=simulate` (Lantern — Lighthouse's
  default). Headless Chrome loads the page unthrottled; Lighthouse
  computes metric values by projecting onto a simulated Slow 4G graph.
- 10 runs with `--throttling-method=devtools`. Headless Chrome applies
  Chrome DevTools network throttling (1.6 Mbps down, 750 Kbps up,
  150 ms RTT, 4× CPU slowdown) and Lighthouse reads the metrics from
  the actual run.

Same URL, same commit, same machine, runs back-to-back. Other flags
held constant across all 20: `--only-categories=performance
--form-factor=mobile --chrome-flags="--headless=new --no-sandbox"
--quiet`. Raw JSON outputs in `/tmp/ekuzo-lcp-investigation/{simulate,
devtools}/run-NN.json` on Jamie's workstation (not committed; one-off
debug artifacts).

Analyzer script (also at `/tmp/ekuzo-lcp-investigation/analyze.js`) pulls
the metric values, the `lcp-breakdown-insight` subparts, the
`lcp-discovery-insight` checklist, the LCP element identity, and the
network request log per run.

---

## 2. Simulate runs (Lighthouse's default Lantern method)

Raw per-run numbers. LCP values in milliseconds.

| run | score | LCP    | FCP   | TTI    | TBT  | SI    | LCP element       | LCP img end | rive end | rsc (n, max-end) |
|-----|------:|-------:|------:|-------:|-----:|------:|-------------------|------------:|---------:|------------------|
| 01  | 82    |  3771  | 1313  |  8537  | 237  | 4377  | home-hero-bg.png  |    2763     |  3410    | 3, 3857          |
| 02  | 65    | 44934  | 3136  | 45318  |  37  | 5723  | home-hero-bg.png  |     669     |  1260    | 3, 1742          |
| 03  | 65    | 44082  | 3106  | 44452  |  15  | 5400  | home-hero-bg.png  |     789     |  1710    | 3, 1715          |
| 04  | 65    | 44554  | 3131  | 44936  |  37  | 5223  | home-hero-bg.png  |     582     |   937    | 3, 1591          |
| 05  | 65    | 44638  | 3142  | 45028  |  28  | 5479  | home-hero-bg.png  |     594     |  1200    | 3, 1612          |
| 06  | 65    | 45130  | 3125  | 45523  |  46  | 5412  | home-hero-bg.png  |     615     |  1502    | 3, 1591          |
| 07  | 67    | 40975  | 3154  | 41020  |  35  | 4047  | home-hero-bg.png  |     601     |  1239    | 3, 1649          |
| 08  | 65    | 14333  | 3144  | 14702  |  62  | 5467  | home-hero-bg.png  |     316     |  2317    | 3, 1595          |
| 09  | 65    | 45242  | 3031  | 45648  |  79  | 5313  | home-hero-bg.png  |     343     |   793    | 3, 1437          |
| 10  | 65    | 44733  | 3162  | 45125  |  43  | 5562  | home-hero-bg.png  |     675     |  1412    | 3, 1613          |

**Simulate stats over 10 runs:**

| metric | min   | median | max    | spread |
|--------|------:|-------:|-------:|-------:|
| LCP    |  3771 | 44637  | 45242  | 41,471 |
| FCP    |  1313 |  3136  |  3162  |  1,849 |
| TBT    |    15 |    43  |   237  |    222 |
| Score  |    65 |    65  |    82  |     17 |
| Weight | 9,148,942 | 9,149,796 | 9,153,961 | 5,019 |

**Three things to notice:**

1. **LCP element identity is stable.** All 10 runs identify
   `home-hero-bg.png` (the Next.js `<Image fill priority>` in
   [app/page.tsx:67-75](../../app/page.tsx)) as the LCP element. **None
   identify the Rive canvas.** That contradicts the §3.2 hypothesis in
   [09-phase8-perf.md](09-phase8-perf.md), which built its mechanism
   on "the LCP element is the EcosystemAnimation Rive canvas."

2. **Actual LCP element network completion is fast** (median end
   615 ms). The image transfers ~31 KiB and finishes before the Rive
   variant fetch starts. So whatever is making Lighthouse report
   LCP=44s is not the image's actual download time.

3. **LCP correlates near-perfectly with TTI in every run.** Run-01:
   TTI=8.5s → LCP=3.8s. Run-08: TTI=14.7s → LCP=14.3s. Runs 2–10
   excluding 8: TTI=41–45s → LCP=41–45s. The LCP candidate is being
   anchored to whatever Lantern projects as the end of the audit
   window, which moves around enormously between runs.

**What's happening in the Lantern simulator:** Lighthouse 13's Lantern
computes simulated LCP and TTI from the same critical-path graph. The
graph is built from observed-in-headless network + main-thread events,
then projected onto a slow-mobile network with 4× CPU throttling. Small
variance in the unthrottled observation can produce big swings in the
projection — see run-01 (cold Netlify edge, root document took 2,310 ms
to respond, observed timeline compressed) vs runs 2–10 (warm Netlify
edge, root document took 60–180 ms, observed timeline ballooned in the
*tail*). The cold-cache run-01 happens to project cleanly. Warm-cache
runs project a very long-tail TTI (45s) and Lantern picks the last
qualifying paint event as LCP, which sits near the projected TTI.

**Conclusion for §2:** simulate-method LCP for this page at this commit
is `(3.8s | 14.3s | 41–45s)` depending on the run. Comparing a single
pre-fix sample (3.3s in Jamie's §3.1 table) to a single post-fix sample
(4.9s) under this method does not establish a regression. Both numbers
land inside the simulate noise band.

---

## 3. Devtools runs (real Chrome network throttling)

Same page, same commit, same machine, immediately after the simulate
batch. `--throttling-method=devtools` makes Chrome actually throttle
the network during the run, so the headline metric reflects what was
observed under throttled conditions instead of being projected from an
unthrottled observation.

| run | score | LCP   | FCP   | TTI    | TBT | SI    | LCP element       | LCP img end | rive end | rsc max-end |
|-----|------:|------:|------:|-------:|----:|------:|-------------------|------------:|---------:|------------:|
| 01  | 75    | 5247  | 2955  | 14975  |  37 | 3460  | home-hero-bg.png  |    5227     | 17847    | 10822       |
| 02  | 67    | 6277  | 4111  | 16012  |   8 | 4576  | home-hero-bg.png  |    6265     | 18900    | 11804       |
| 03  | 67    | 6313  | 4096  | 16012  |  11 | 4572  | home-hero-bg.png  |    6296     | 18901    | 11811       |
| 04  | 74    | 5269  | 3078  | 15003  |  17 | 3558  | home-hero-bg.png  |    5249     | 17877    | 10805       |
| 05  | 67    | 6290  | 4107  | 15988  |  14 | 4596  | home-hero-bg.png  |    6271     | 18884    | 11811       |
| 06  | 74    | 5236  | 3044  | 14949  |  15 | 3518  | home-hero-bg.png  |    5217     | 17852    | 10763       |
| 07  | 74    | 5226  | 3051  | 14959  |  19 | 3513  | home-hero-bg.png  |    5209     | 17852    | 10755       |
| 08  | 66    | 6388  | 4197  | 16119  |  22 | 4663  | home-hero-bg.png  |    6375     | 18993    | 11930       |
| 09  | 67    | 6321  | 4129  | 16084  |  57 | 4616  | home-hero-bg.png  |    6308     | 18950    | 11942       |
| 10  | 67    | 6300  | 4108  | 16013  |  43 | 4598  | home-hero-bg.png  |    6284     | 18895    | 11815       |

**Devtools stats over 10 runs:**

| metric | min   | median | max   | spread |
|--------|------:|-------:|------:|-------:|
| LCP    | 5226  | 6290   | 6388  | 1,162  |
| FCP    | 2955  | 4107   | 4197  | 1,242  |
| TBT    |    8  |   19   |   57  |    49  |
| Score  |   66  |   67   |   75  |     9  |

**Three things to notice:**

1. **LCP element identity is again stable** — `home-hero-bg.png` in
   10/10 runs. Same as simulate. Strong evidence the LCP element is
   genuinely the hero image, not the Rive canvas.

2. **LCP variance under devtools is one-thirty-fifth of simulate**
   (1.2s spread vs 41.5s spread). Median LCP is **6.3s**, in a tight
   ±0.6s band. This is the number to use when making before/after
   judgments going forward.

3. **The LCP image network end time tracks LCP** (median 6271 ms LCP
   img end vs 6290 ms LCP value). The image download itself is the
   gating event. The Rive `.riv` fetch lands at ~18 s, well after LCP,
   so it cannot be the LCP candidate.

### 3.1 LCP breakdown subparts (devtools median)

| subpart                | median  |
|------------------------|--------:|
| timeToFirstByte        | 1,714 ms |
| resourceLoadDelay      |    19 ms |
| resourceLoadDuration   | 4,540 ms |
| elementRenderDelay     |    17 ms |
| **sum**                | **6,290 ms** |

**The dominant cost is `resourceLoadDuration` (4.5 s).** The LCP image
transfers 31 KiB. On a 1.6 Mbps link with no other traffic, 31 KiB
should arrive in ~155 ms. It's taking 29× that.

### 3.2 Why the LCP image takes 4.5 s to transfer

Network log from devtools run-08 (LCP=6388 ms), filtered to requests
that complete during the LCP window:

| start | end    | KiB | priority | resource |
|------:|-------:|----:|---------|----------|
| 1832  |  5787  |  25 | High     | TungstenNarrow_Black font |
| 1833  |  5684  |  24 | High     | TungstenNarrow_Bold font |
| 1833  |  5437  |  23 | High     | TungstenNarrow_Medium font |
| 1833  |  5611  |  24 | High     | TungstenNarrow_Semibold font |
| 1834  | 13726  | 146 | High     | googletagmanager.com gtag.js |
| 1839  |  6375  |  31 | High     | **home-hero-bg.png (LCP)** |
| 1883  | 14997  | 192 | Low      | becky-parent-poster.jpg |
| 1883  | 15292  | 208 | Low      | brad-parent-girl-gamer-poster.jpg |
| 1883  | 13806  | 148 | Low      | debbie-potter-monroe-poster.jpg |
| 1883  | 14385  | 166 | Low      | laura-hogan-mirus-academy-poster.jpg |
| 1883  | 15991  | 252 | Low      | rajitha-parent-poster.jpg |
| 1883  | 12803  | 125 | Low      | student-i-learned-poster.jpg |
| 1883  | 11397  | 101 | Low      | student-man-of-my-word-poster.jpg |
| 1883  | 12828  | 125 | Low      | student-thank-you-ekuzo-poster.jpg |

8 testimonial-video posters (~1.3 MB total) all enter the network queue
~50 ms after the LCP image, on the same HTTP/2 connection. They're
marked Low priority but Chrome's HTTP/2 implementation does not
strictly serialize by priority — it distributes bandwidth across
in-flight streams proportionally, so the 31 KiB High-priority image
gets a fraction of the pipe instead of nearly all of it. Add 4 font
files at High priority sharing the same pipe (143 KiB total), and the
LCP image's ~155 ms ideal transfer time stretches to 4.5 s.

The Phase 9 candidate list in [09-phase8-perf.md §6](09-phase8-perf.md)
already names this:
> 4. **Testimonial poster image sizing** — currently 252 KB / 208 KB /
>    192 KB for posters that display at ~150px wide. Likely an `srcset`
>    / `next/image` sizing miss.

That entry undersold its impact. It's not just a byte-weight concern;
the posters are the direct cause of the slow LCP image download under
real throttled mobile conditions.

### 3.3 The fetchpriority=high check fails in 20/20 runs

The Lighthouse `lcp-discovery-insight` audit checks three things about
the LCP image's preload tag:

| check                       | passes in simulate | passes in devtools |
|-----------------------------|-------------------:|-------------------:|
| priorityHinted (`fetchpriority=high` on preload) | **0 / 10** | **0 / 10** |
| requestDiscoverable (preload exists)            | 10 / 10    | 10 / 10    |
| eagerlyLoaded (no `loading=lazy`)               | 10 / 10    | 10 / 10    |

So Next.js IS emitting the `<link rel="preload" as="image" imageSrcSet>`
for the hero image, and the image is not lazy-loaded — but the preload
tag has **no `fetchpriority` attribute**. I confirmed this by `curl`-ing
the served HTML at `https://dev--ekuzo.netlify.app/`:

```html
<link rel="preload" as="image"
  imageSrcSet="/_next/image?url=%2Fimages%2Fhome-hero-bg.png&w=640&q=75 640w,
              /_next/image?url=%2Fimages%2Fhome-hero-bg.png&w=750&q=75 750w,
              … (no fetchpriority="high")"
  imageSizes="100vw" />
```

The rendered `<img>` element also has no `fetchpriority` attribute,
despite the component being declared as `<Image priority>` (see
[app/page.tsx:67-75](../../app/page.tsx)):

```tsx
<Image
  src="/images/home-hero-bg.png"
  alt=""
  fill
  priority
  className="object-cover"
  style={{ objectPosition: "center 80%" }}
  sizes="100vw"
/>
```

That looks like a Next.js 16 behavior. In Next.js 13 and 14, `priority`
on `<Image>` was documented to emit `fetchpriority="high"` on both the
preload link and the rendered `<img>`. The currently-installed
`next@16.2.1` is not doing either, at least for this `fill` image. I
did not chase the root cause — that would need a Next.js docs / source
read, not in this session's scope.

---

## 4. Side-by-side comparison

| dimension                       | simulate (Lantern)            | devtools (real throttling)   |
|---------------------------------|-------------------------------|------------------------------|
| LCP min / median / max          | 3.8 / 44.6 / 45.2 s           | 5.2 / 6.3 / 6.4 s            |
| LCP spread across 10 runs       | **41.5 s**                    | **1.2 s**                    |
| LCP element identity            | home-hero-bg.png (10/10)      | home-hero-bg.png (10/10)     |
| LCP correlates with TTI?        | yes, near-perfectly           | no — LCP < TTI by ~10 s      |
| `fetchpriority=high` present?   | no (10/10)                    | no (10/10)                   |
| Total weight transferred        | ~8.9 MB                       | ~8.9 MB                      |
| Rive variant chosen             | mobile (10/10)                | mobile (10/10)               |

**The LCP value disagreement between methods is huge** (44.6s vs 6.3s
medians). Devtools is the trustworthy number for absolute comparisons;
simulate is what Google's PageSpeed Insights uses and what the
[09-phase8-perf.md §3.1](09-phase8-perf.md) table was generated
against. For ranking-impact discussions ("does Google think we got
slower") simulate is what counts even when it's noisy. For mechanistic
analysis ("what actually got slower in the browser") devtools is what
counts.

---

## 5. Conclusion

**The home-page LCP regression reported in [09-phase8-perf.md §3.1](09-phase8-perf.md)
(3.3 s → 4.9 s) is most likely a Lantern simulator artifact, not a
real regression.** The pre-fix 3.3 s and post-fix 4.9 s are single
samples from a 3.8 s – 45 s noise distribution that Lantern produces
for this URL at this commit. The §3.2 hypothesis that the matchMedia
gate's `useEffect` timing makes the Rive canvas paint late is wrong on
its premise — the LCP element is the hero image, not the Rive canvas,
in 20/20 measurements across both throttling methods.

**Under devtools (real throttling), the home page's LCP is 6.3 s
median** with a 1.2 s spread. That's slower than 4.9 s, but it's a
single, stable number rather than a comparison point. We don't have a
pre-Phase-8 devtools measurement to compare against; the pre-fix 3.3 s
in §3.1 was almost certainly a simulate run that landed in the low end
of the noise band, not a devtools number.

**There is a real, separately measurable issue:** the LCP image
preload is missing `fetchpriority="high"` in 20/20 runs, and under
real throttling the image's download is bandwidth-starved by 8
oversized testimonial poster images that open on the same HTTP/2
connection ~50 ms later. Both issues exist independently of Phase 8.

**Recommendation:** treat the 3.3 → 4.9 simulate comparison in §3.1 as
inconclusive. Do not revert Fix 2a (matchMedia variant gate) on its
basis — the 6 MB byte savings is real and confirmed in 10/10 runs in
both methods. If home-page LCP matters as a Phase 9 objective, target
the two issues identified in §3.2 and §3.3 of this doc instead. They
are both well-defined and measurement-justified.

---

## 6. Proposed fixes (applied in commit `b9dad9a`, see §7 for measured result)

> **Originally:** described, not implemented — Jamie approved making
> the changes pre-prod. §6.1 and §6.2 part 1 shipped on `dev` in
> commit `b9dad9a` (2026-05-26). §6.2 part 2 (poster downscaling) was
> deliberately deferred — see §7 for why and the Phase 9 lever list.

### 6.1 Add `fetchPriority="high"` to the hero Image (one-line change)

File: [app/page.tsx](../../app/page.tsx) lines 67–75.

Proposed diff:

```diff
   <Image
     src="/images/home-hero-bg.png"
     alt=""
     fill
     priority
+    fetchPriority="high"
     className="object-cover"
     style={{ objectPosition: "center 80%" }}
     sizes="100vw"
   />
```

**Expected effect:** Lighthouse `lcp-discovery-insight` flips to all
three checks passing. Under devtools, Chrome's HTTP/2 prioritization
weights the LCP image more heavily on the multiplexed connection,
which should compress `resourceLoadDuration` from 4.5 s to closer to
the ~155 ms ideal — moving devtools LCP toward ~2 s (TTFB ~1.7 s +
~0.2 s load + render). Under simulate, the `priorityHinted: true`
check flips and might trigger a different Lantern projection branch.

**Risk:** none I can see. The `fetchPriority` prop has been on
`next/image` since 13.x and is the documented escape hatch for when
`priority` alone doesn't emit the attribute. If Next.js 16 stripped
the prop entirely, the type-check would fail at build — that's the
forcing function. If it accepts but ignores it, we get no
improvement and no regression.

**Why this is one fix and not two:** there's also a Next.js
question (why does `priority` not emit `fetchpriority="high"` on the
preload tag for `fill` images in 16.x?). Worth investigating in a
separate session, but the explicit prop is the safer near-term fix.

### 6.2 Defer + downscale testimonial poster images (bigger change)

The 8 testimonial posters live in the `<TestimonialsCarousel>` section,
which sits ~2–3 viewports below the fold. They have no business being
in the network queue at 1883 ms (right alongside the LCP image). Two
orthogonal mitigations:

1. **Lazy-load the carousel below the fold.** Either wrap it in an
   IntersectionObserver-gated container that doesn't render its
   `<img>` / `<video poster>` children until it's within ~600 px of the
   viewport, or attach `loading="lazy"` + `fetchpriority="low"` on
   each poster image. Note that the Phase 8 §2c learning — "deferred
   mount does not remove an element from LCP candidacy if it's still
   the largest" — applies in reverse here. The testimonial posters are
   not LCP candidates (they're far below the fold and Lighthouse
   doesn't pick them in any of 20 runs), so deferring them only delays
   their fetch without changing LCP assignment. The risk is much
   lower than the camps-hero deferred-mount case in §2d.

2. **Downscale the source assets.** A 192–252 KB poster JPG for a
   ~150 px display is wrong by ~10×. `next/image` with appropriate
   `sizes` would solve this for free; if the carousel uses raw
   `<img>` tags, swap them for `<Image>` with `width`, `height`,
   `sizes`, and `quality={70}`.

Either change shrinks the bytes competing with the LCP image on the
HTTP/2 connection. (1) is the bigger short-term LCP win; (2) is the
durable byte-weight win. Both can be done independently and in either
order.

**Out of this session's scope:** I did not read the carousel source
(`components/TestimonialsCarousel.tsx` per [CLAUDE.md "Shared Components"](../../CLAUDE.md))
to confirm which `<img>` / `<Image>` / `<video poster>` pattern it
uses, so the diff above is conceptual. Phase 9 work should start by
reading that file.

### 6.3 What NOT to change based on this investigation

- **Don't revert Fix 2a (matchMedia variant gate).** The 6 MB byte
  savings is real and confirmed in 10/10 runs in both methods. The
  hypothesized "useEffect timing makes Rive paint late and Lighthouse
  latches LCP" mechanism does not match the data — LCP element is
  the hero image, not the Rive canvas, in 20/20 runs. Reverting 2a
  would re-add 6 MB to every pageload without recovering any LCP.
- **Don't add a `useLayoutEffect` / module-scope matchMedia change**
  (per the §3.2 mitigation option 1 in 09-phase8-perf.md). That fix
  was scoped against a wrong-mechanism hypothesis. It would change
  the timing of the Rive fetch but the Rive `.riv` finishes at
  ~18 s under devtools (well after LCP), so moving its start earlier
  would not affect LCP.
- **Don't User-Agent-sniff / SSR-shim the matchMedia** (per §3.2
  mitigation option 2). Same reason as above plus much higher
  complexity.

---

## 7. Post-deploy verification (added 2026-05-26 after commit `b9dad9a` shipped to dev)

Both §6.1 and §6.2 part 1 fixes landed in commit `b9dad9a` on `dev`,
deployed to `dev--ekuzo.netlify.app` around 03:25 local. 10 devtools-
throttled mobile Lighthouse runs immediately after, same setup as §3:

| metric                  | §3 pre-fix median | post-fix median | delta   |
|-------------------------|------------------:|----------------:|--------:|
| Score                   | 67                | **73**          | +6      |
| LCP                     | 6.29 s            | **4.96 s**      | −1.33 s |
| LCP image network end   | 6.27 s            | 4.95 s          | −1.32 s |
| LCP breakdown TTFB      | 1.71 s            | 1.74 s          | ±0      |
| LCP breakdown loadDur   | 4.54 s            | **3.18 s**      | −1.36 s |
| Total weight            | 8.94 MB           | 7.80 MB         | −1.14 MB |
| LCP element identity    | home-hero-bg.png  | home-hero-bg.png | unchanged |
| `priorityHinted` checks | 0/10              | **10/10**       | flipped |
| Initial `<video>` tags  | 8                 | **0**           | gated   |

**Both fixes worked exactly as designed.** The Lighthouse discovery
checklist now passes all three subchecks. The testimonial posters
(~1.1 MB of the −1.14 MB weight drop is theirs) are no longer in the
initial fetch queue. The LCP image's `resourceLoadDuration` dropped
~30% (4.54 → 3.18 s) — the gap between the in-flight time and the
~155 ms theoretical floor narrowed substantially, though it didn't
close.

**Why the score moved less than the localhost prediction suggested:**

The 5-run localhost devtools test before the deploy showed LCP 3.05 s
and score 90 median. The Netlify post-fix LCP is 4.96 s and score 73.
Localhost TTFB is ~10 ms; Netlify edge TTFB under throttled mobile
is ~1.7 s. That 1.7 s gap propagates 1:1 into LCP, and LCP is the
heaviest-weighted Lighthouse metric. The localhost run was a fair
test of the *delta* attributable to the code changes, but it
understated absolute LCP because real users hit Netlify edge, not
localhost.

The remaining 3.2 s `resourceLoadDuration` is the next ceiling. The
LCP image is still competing with 4 Tungsten font files (~143 KB at
High priority) and `gtag.js` (146 KB at High priority) on the same
HTTP/2 connection. Three Phase-9-shaped levers, in expected impact
order:

1. **Reduce or defer the font set on the home hero.** The home page
   only renders Tungsten Narrow Black for the headline above the
   fold. The other three weights (Bold / Medium / Semibold) are
   preloaded but used only further down the page. Removing the
   preload for the three non-LCP-blocking weights would free ~70 KB
   of High-priority bandwidth at exactly the right moment.
2. **Move `gtag.js` to `next/script strategy="afterInteractive"`.**
   146 KB / High priority / sync-loaded. Switching to async script
   loading drops it out of the LCP-window queue. Affects every page,
   not just home.
3. **Downscale the testimonial poster JPGs.** They're no longer
   competing for the LCP-window pipe (Fix 6.2 part 1 deferred them),
   but the durable byte-weight win is still worth doing. 8 × ~150 KB
   posters for a 150 px display is the worst sizing miss in the
   page; `next/image` with the right `sizes` would cut these by
   ~10×.

None of those are scoped into this work. They're separate Phase 9
candidates with separate measurement requirements.

**Reach beyond home page:** `TestimonialsCarousel` is also rendered on
`/parents`, `/programs`, `/programs/ekuzo100`, and
`/programs/ekuzo-teams`. The IO-gate change benefits all five pages
proportionally to how far below the fold the carousel sits on each.
Not measured per-page in this batch — the home page is the
representative sample because its LCP cost was the worst pre-fix.

---

## 8. Stop conditions hit

- ✅ 20 Lighthouse runs done (10 simulate + 10 devtools).
- ✅ Doc complete with conclusion paragraph.
- ✅ One concrete, measurement-justified proposed fix (§6.1) and one
  larger candidate (§6.2). Neither committed.
- ✅ No source files modified. No git commits. No pushes.
- ⏱ Wall time: ~30 minutes (well under the 90-minute budget).

Next step for Jamie: read §5 + §6 in the morning. The 6.1 one-line
change is low-risk and would be a clean Phase 9 opener if you want to
take it. The 6.2 work needs Aaron's input on the carousel pattern.

---

## 9. Methodology notes for the next perf phase

- **Default to `--throttling-method=devtools` for LCP regression
  hunts.** Simulate (Lantern) variance for this page on this commit
  was ±20 s. Devtools variance was ±0.6 s.
- **N=10 minimum for either method.** A single sample sits inside the
  noise band of either method and proves nothing about deltas under
  ~1 s. The Phase 8 §3.1 table was built from N=1 per page per
  condition; that's why the home-page "regression" looked real.
- **Read the LCP element identity, not just the LCP number.** A
  number that moves with no change to which element wins LCP is
  almost always a measurement artifact, not a code regression.
- **Cross-check breakdown subparts against the headline LCP.** When
  TTFB + resourceLoadDelay + resourceLoadDuration + elementRenderDelay
  sums to ≪ headline LCP (as in §2 simulate runs, where the sum was
  ~2.4 s but headline was 44 s), the headline is being inflated by
  Lantern's projection rather than reflecting observed network/CPU
  events. Devtools always sums to within rounding of the headline.
- **Don't use `score` as a signal under 5 runs.** Score is a coarse
  bucket of LCP/FCP/TBT/CLS/SI; under simulate noise it swings 65–82
  for this page with no code change.
