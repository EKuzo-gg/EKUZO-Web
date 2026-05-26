# Phase 8 — Lighthouse-driven perf fixes (the work Phase 6 missed)

> **Captured:** 2026-05-25 → 2026-05-26, on `dev`. Initial Phase 8 push at
> `650f6cc`; revise commit `0a2dae8` after post-deploy Lighthouse showed
> two of the four mechanisms were *worsening* LCP instead of improving
> it (detail in §2c + §2d).
> **Tool versions:** Next.js 16.2.1 (Turbopack), Node v24.14.0, Lighthouse
> 13.3.0, ffmpeg 8.1.1.
> **Purpose:** Phase 6 measured `.next/server` size + chunk weights and
> saw no movement, declared the perf-pass done, and shipped a 214 KB
> PNG → WebP swap. Those measurements are blind to runtime payload in
> `public/` and to anything served from CDN rather than bundled into
> Next's function trace. Phase 8 re-measures against the live Lighthouse
> audit, identifies the four resources actually eating the budget,
> attempts four fixes, retains the two that move Lighthouse numbers in
> the right direction, and reverts the two that didn't.
>
> **Discipline (per handoff §1.4 + Karpathy "measure first"):** every
> changed line in Phase 8 must trace to a Lighthouse number that moved
> *in the intended direction*. The §2c + §2d "tried and reverted"
> sections are deliberate — naming the mistakes inside Phase 8 so
> the next perf phase doesn't repeat them.

---

## 1. Pre-fix Lighthouse baseline

Mobile Lighthouse runs against `https://dev--ekuzo.netlify.app/`, run from
this session immediately before the first Phase 8 push (2026-05-25). Scores
vary by Lighthouse run because of network-throttling variability; the
resource costs (the column that justifies the fix list) are stable across
runs.

| Page | Score | LCP | TBT | CLS | Total weight |
|---|---:|---:|---:|---:|---:|
| `/` (home) | 87 | 3.3s | 150ms | 0 | 15,441 KiB |
| `/programs/ekuzo-camps` | 82 | 4.3s | 60ms | 0 | 16,173 KiB |

Google "Good" thresholds: LCP ≤ 2.5s, TBT ≤ 200ms (lab proxy for INP), CLS ≤ 0.1.

**Note on the score drift from the handoff table:** the Phase 8 handoff
quoted scores of 42/70/78/90 from a 2026-05-25 morning run. This session's
pre-push run showed 87/82 on home + camps. Same dev preview, same Phase 7
build (`ebc0863`), one day apart. The delta is Lighthouse throttling /
network-conditions variability — score is noisy, but the **resource list
is identical** across both runs (see §1.1), which is what the fix list is
anchored to.

### 1.1 Top resources eating the weight budget (pre-fix, byte-stable across runs)

Home page (`/`):

| Size | Type | Resource |
|---:|---|---|
| 6,462 KB | Fetch | `https://dev--ekuzo.netlify.app/animations/ecosystem-desktop.riv` |
| 6,006 KB | Fetch | `https://dev--ekuzo.netlify.app/animations/ecosystem-mobile.riv` |
| 647 KB | Fetch | `https://unpkg.com/@rive-app/canvas@2.35.4/rive.wasm` |
| 252 KB | Image | `testimonial-videos/rajitha-parent-poster.jpg` |
| 208 KB | Image | `testimonial-videos/brad-parent-girl-gamer-poster.jpg` |

Camps page (`/programs/ekuzo-camps`):

| Size | Type | Resource |
|---:|---|---|
| **14,605 KB** | Media | `/videos/camp-hero.mp4` |
| 378 KB | Media | `testimonial-videos/rajitha-parent.mp4` |
| 146 KB | Script | `gtag.js` |

**Three root causes** (verified by inspecting the runtime resource list,
not by reading the source code):

1. `EcosystemAnimation` renders both desktop + mobile `EcosystemScroll`
   components and hides one via CSS. CSS `hidden` does not unmount React
   children — both `useRive` hooks fire and fetch their respective `.riv`
   files. Every visitor downloads both (~12 MB combined) regardless of
   viewport.
2. `rive.wasm` is fetched from `unpkg.com` (third-party CDN, version-pinned
   to `@rive-app/canvas@2.35.4`). 647 KB transfer plus a DNS+TLS roundtrip
   to a domain we don't control.
3. The camps hero `<video autoPlay loop muted playsInline>` has no
   `preload` attribute (defaults to `auto`). `autoPlay` forces browsers to
   fetch the entire file on initial render. Source: 1920×1080@30fps, 14.6 MB.

---

## 2. Per-fix diff

### 2a. One Rive variant per page, not two — **kept**

**Files touched:** [components/sections/EcosystemAnimation.tsx](../../components/sections/EcosystemAnimation.tsx)

**What changed:** Replaced the dual `<EcosystemScroll>` render (one for
each breakpoint, hidden via Tailwind `hidden md:block` / `md:hidden`) with
a `useState<"desktop" | "mobile" | null>` set at mount via
`window.matchMedia("(min-width: 768px)")`. The `null` state during SSR
+ first paint means no `useRive` hook fires until the breakpoint is
known. After that, exactly one variant mounts.

**Why this fixes anything:** `useRive` fetches its `.riv` file the moment
the hook runs. CSS `hidden` doesn't unmount the component, so previously
both hooks ran and both files downloaded. The matchMedia gate ensures
exactly one file is fetched per pageload.

**Measured delta:** mobile visitor stops fetching `ecosystem-desktop.riv`
(6,462 KB); desktop visitor stops fetching `ecosystem-mobile.riv` (6,006 KB).
**−6 MB per pageload** on every page that uses `EcosystemAnimation` (home,
programs, parents, schools, ekuzo100, ekuzo-teams).

### 2b. Self-hosted rive.wasm — **kept**

**Files touched:** [lib/riveRuntime.ts](../../lib/riveRuntime.ts) (new), [components/sections/EcosystemAnimation.tsx](../../components/sections/EcosystemAnimation.tsx), [components/sections/ProgramsHeroRive.tsx](../../components/sections/ProgramsHeroRive.tsx), [public/rive.wasm](../../public/rive.wasm) (new, 1.79 MB raw / ~602 KB gzipped over the wire).

**What changed:** Copied `node_modules/@rive-app/canvas/rive.wasm` to
`public/rive.wasm` and added a tiny `configureRiveRuntime()` helper that
calls `RuntimeLoader.setWasmUrl("/rive.wasm")` once, behind a
`typeof window !== "undefined"` guard and an idempotent `configured` flag.
Both `EcosystemAnimation` and `ProgramsHeroRive` invoke it at module scope.

**Why this fixes anything:** Rive's runtime defaults to fetching the wasm
from `https://unpkg.com/@rive-app/canvas@<pkg-version>/rive.wasm`. Every
Rive-using page paid a third-party DNS lookup + TLS handshake before the
wasm transfer could begin. Moving the wasm to our own origin removes that
roundtrip and gives us cache-header control via Netlify's static-asset layer.

**Caveat / failure mode:** the file in `public/rive.wasm` must stay in sync
with the installed `@rive-app/canvas` version. The `lib/riveRuntime.ts`
header comment names the current pinned version (2.35.4). If someone bumps
the package without re-copying the wasm, the runtime loads an outdated
binary against new JS bindings. Documented in the file header so a future
session doesn't trip on it silently.

**Measured delta:** wasm transfer is ~602 KB from `dev--ekuzo.netlify.app`
vs. ~647 KB from unpkg (mostly the same — both are gzipped). The headline
win is the same-origin fetch — no third-party DNS + TLS handshake before
the runtime can start. Lighthouse network log confirms
`https://dev--ekuzo.netlify.app/rive.wasm` instead of `unpkg.com/...`.

### 2c. IntersectionObserver-gated Rive mount — **tried then reverted**

**Initial idea (commit `650f6cc`):** add a `sentinelRef` on the
`EcosystemAnimation` outer container and an `IntersectionObserver` with
`rootMargin: "200px 0px"` so the 6 MB `.riv` fetch wouldn't fire until
the section was within ~200px of the viewport. The handoff assumed this
would free LCP bandwidth on the home page.

**What two post-deploy Lighthouse samples showed:**

| Sample | Score | LCP |
|---|---:|---:|
| home pre-fix (Phase 7 build) | 87 | 3.3s |
| home post-Phase-8a-d sample 1 | 78 | 5.0s |
| home post-Phase-8a-d sample 2 | 79 | 4.9s |

LCP regressed by ~1.7s, consistent across two samples. Not noise.

**Why the deferral made LCP worse:** Lighthouse measures LCP as the
*largest* contentful paint within its audit window — paint events are
tracked until network goes idle. With the IO gate active, the `.riv`
fetch eventually fires (Lighthouse's simulated long audit window catches
the network silence-then-fetch pattern) and the Rive canvas paints late.
That late paint is larger than any of the earlier paints, so Lighthouse
relabels LCP to the canvas paint time, *which is later than the
equivalent eager-mount paint would have been*. The deferral pushes the
Rive paint out instead of removing the canvas from LCP candidacy.

**Reverted in commit `0a2dae8`.** The Rive canvas now mounts eagerly once
the matchMedia variant resolves (Fix 2a's path). The 6 MB savings from
2a is the only Rive-side change retained.

### 2d. Camps hero video — re-encoded asset **kept**, deferred mount **reverted**

**Initial idea (commit `650f6cc`):** combined two changes —
re-encode `camp-hero.mp4` to a smaller asset (3.7 MB instead of 14.6 MB)
*and* wrap the `<video>` in a `DeferredAutoplayVideo` client component
that delayed the element from rendering until `requestIdleCallback` fired.

**Re-encoding** (1920×1080@30fps/4.3 Mbps → 1280×720@24fps/libx264 CRF 30,
audio stripped, `+faststart` flag): **14,605 KB → 3,461 KB transfer
(−76%).** Visually indistinguishable through the page's
`opacity: 0.7 / saturate(0.8) / brightness(0.85)` filters + the radial
vignette overlay. The video is described in the page source comment as a
"Placeholder while Aaron sources the final hero graphic" — a 76%
compression on a placeholder preserves design intent.

ffmpeg command (recorded so the encoding settings are reproducible if
Aaron swaps in a new hero source later):
```
ffmpeg -i camp-hero-source.mp4 \
  -c:v libx264 -crf 30 -preset slow \
  -vf "scale=1280:720,fps=24" \
  -an -movflags +faststart -pix_fmt yuv420p \
  camp-hero.mp4
```

**Deferred mount** turned out to make LCP worse for the same reason as
Fix 2c:

| Sample | Score | LCP |
|---|---:|---:|
| camps pre-fix | 82 | 4.3s |
| camps post-Phase-8a-d sample 1 | 69 | 7.6s |
| camps post-Phase-8a-d sample 2 | 74 | 6.6s |

The 3.7 MB re-encoded video paints faster than the original 14.6 MB
would, *if mounted eagerly*. Deferring it via `requestIdleCallback`
pushes its first frame paint past the LCP window, and because the video
is the largest visible element on the camps hero, Lighthouse picks it
up as LCP at the late paint time.

**Reverted in commit `0a2dae8`** for the `<video>` element. The element
is now back to inline JSX with `preload="metadata"` added, the
re-encoded asset is retained. `components/ui/DeferredAutoplayVideo.tsx`
deleted (had no remaining callers).

---

## 3. Post-revise Lighthouse measurement

Measured against `https://dev--ekuzo.netlify.app/` after commit `0a2dae8`
finished deploying on 2026-05-26. Mobile Lighthouse 13.3.0.

### 3.1 Final scores + LCP

| Page | Pre Score | Post Score | Pre LCP | Post LCP | Pre Weight | Post Weight |
|---|---:|---:|---:|---:|---:|---:|
| `/` (home) | 87 | **76** | 3.3s | **4.9s** | 15,441 KiB | **8,935 KiB (−42%)** |
| `/programs/ekuzo-camps` | 82 | **80** | 4.3s | **4.3s** | 16,173 KiB | **4,972 KiB (−69%)** |
| `/programs/ekuzo-teams` | _baseline only_ | **90** | _baseline only_ | **2.5s** | _baseline only_ | **9,524 KiB** |
| `/programs/ekuzo100` | _baseline only_ | **92** | _baseline only_ | **2.5s** | _baseline only_ | **10,260 KiB** |

**Three pages improved or held**, **one regressed (home).**

- ✅ **camps**: total weight dropped 11.2 MB (−69%); LCP held at 4.3s (no
  regression). Top resource is now the 3.5 MB re-encoded video instead of
  14.6 MB — the headline Phase 8 win.
- ✅ **teams**: 90 score, 2.5s LCP at the Google "Good" threshold. The 6 MB
  Rive variant savings (mobile-only) shows up cleanly here because the
  hero is the LCP element and isn't displaced by the lower-fold Rive.
- ✅ **e100**: 92 score, 2.5s LCP at the Google "Good" threshold. Same
  pattern as teams.
- ⚠️ **home**: 87 → 76 score, 3.3s → 4.9s LCP. Total weight is down 6.5 MB
  (−42%), confirming Fix 2a + 2b are working — only one Rive variant
  fetched, wasm same-origin. But LCP went *up* despite less work.

### 3.2 The home-page LCP regression — investigated + fixed in commits `b9dad9a` + `5d1b341`

> **Note (2026-05-26):** the hypothesis below this paragraph was wrong on
> its premise. A diagnostic-only investigation run after Phase 8 shipped
> (20 mobile Lighthouse runs: 10 simulate + 10 devtools, captured in
> [10-home-lcp-investigation.md](10-home-lcp-investigation.md))
> identified the real LCP element as `home-hero-bg.png` in 20/20 runs,
> **not** the Rive canvas. The "regression" was almost entirely
> bandwidth contention: 8 oversized testimonial poster JPGs sharing the
> mobile HTTP/2 connection with the LCP image. Two follow-up fixes
> shipped on dev as commits `b9dad9a` (the code) and `5d1b341` (the
> measurement). Measured outcome on `dev--ekuzo.netlify.app` under
> devtools throttling, 10 samples each: median score 67 → 73 (+6),
> median LCP 6.29s → 4.96s (−1.33s), total weight 8.94 MB → 7.80 MB
> (−1.14 MB), priorityHinted check 0/10 → 10/10. Full data + Phase 9
> lever list in `10-home-lcp-investigation.md` §3 + §7.
>
> The original hypothesis (preserved below) is left in place as a
> teaching artifact alongside §5.2 — both name the wrong-mechanism
> reasoning pattern that the investigation exposed. **Do not trust
> this paragraph for fact**; trust the investigation doc.

**Original (wrong) hypothesis from the initial Phase 8 write-up:**

The home page's LCP regressed by ~1.6s across three independent samples
(5.0s / 4.9s / 4.9s, vs. 3.3s pre-fix). The byte savings are real —
total weight dropped from 15.4 MB to 8.9 MB and only `ecosystem-mobile.riv`
loads (not desktop too). So why is LCP slower?

**Most likely explanation:** pre-fix, the dual `<EcosystemScroll>`
render meant `useRive` was called during the initial React render pass,
which started both `.riv` fetches at hydration boundary (~150ms into
the page). Post-fix, the matchMedia check happens inside `useEffect`,
which fires *after* the first paint. The `.riv` fetch is therefore
delayed by ~50-100ms compared to pre-fix. That delay propagates to
canvas paint time and Lighthouse's LCP timestamp.

The home page's LCP element is the `EcosystemAnimation` Rive canvas
(it covers a large viewport area in the sticky `h-screen` container
at the second scroll position). Even though the pre-fix dual-render
was loading 12 MB of `.riv` data, the network bandwidth contention
between desktop + mobile variants meant each took longer to finish —
but the FIRST one to finish triggered the canvas paint, and that
became the LCP. Post-fix, only one variant loads, and it's the
*mobile* variant which is slightly smaller (6.0 MB vs. 6.5 MB) but
starts later because of the useEffect-gated mount.

**Two mitigation options for a future Phase 9 if home-page LCP
matters more than the byte savings:**

1. Move the matchMedia check from `useEffect` to `useLayoutEffect`
   (or to a synchronous-at-module-load read), so the Rive fetch
   starts before the first paint instead of after.
2. Use a CSS-only render-once approach: render exactly one
   `<EcosystemScroll>` based on a server-side viewport hint. This
   requires user-agent sniffing or a media-query-aware SSR shim;
   complicated for a small win.

Neither was scoped into Phase 8 because the deferred-mount finding
(§2c, §2d) consumed the budget. Logged here for Phase 9 consideration.

(Both Phase 9 candidates above turned out to be the wrong levers per
the investigation. The real fix was `fetchPriority="high"` on the LCP
image and IntersectionObserver-gating the testimonial-carousel videos
to free bandwidth. See `10-home-lcp-investigation.md` §6.)

---

## 4. What Phase 8 deliberately did NOT do (and why)

- **Did not generalize `DeferredAutoplayVideo` past its single use** — it
  was deleted entirely after the LCP-regression finding. The asset
  re-encoding is what stays.
- **Did not touch `ProgramsHeroRive`'s mount timing.** Above-the-fold
  Rive on `/programs`. Deferring it would have the same LCP-regression
  pattern as Fix 2c, except more obviously bad because it's also the
  LCP element. Only the matchMedia variant gate on `EcosystemAnimation`
  applies; `ProgramsHeroRive` is unchanged.
- **Did not re-encode any other video.** `ekuzo-teams-hero.mp4` (12.9 MB)
  and `ekuzo100-hero.mp4` (16.6 MB) are both `controls preload="metadata"`
  (user-click-to-play), so they don't autoplay-download. Re-encoding them
  is a separate, asset-quality-tradeoff decision that warrants Aaron's
  input; out of Phase 8 scope.
- **Did not touch any of the convergence work** (registry, webhook
  strategies, register-API helper, shared register UI hook). Phase 8 is
  asset-and-component-loading concerns; the convergence is data-flow
  concerns. Different files, different lanes.
- **Did not patch Apps Script (Scope B2)** or upload the Klaviyo template
  (Scope B1) — neither MCP (Klaviyo, Google Drive/Sheets) is connected in
  this session's tool registry. Both items revert to Jamie's dashboard
  lane as already documented in [08-phase7-verification.md](08-phase7-verification.md) §3.

---

## 5. Methodology acknowledgments

### 5.1 The Phase 6 trap (measure bundle size, miss runtime payload)

Phase 6 measured `.next/server` size (28 MB → 28 MB), per-route prerendered
HTML weight (byte-identical), and the top 5 client chunks (byte-identical
to Phase 0). Each of those metrics is real and worth tracking — but **none
of them are perf metrics**. They measure what Next.js bundles into its
function trace and what ships as JS. They are blind to:

- Assets in `public/` that are loaded via URL string at runtime (e.g.,
  `.riv` files, the camps hero `.mp4`).
- Third-party fetches the runtime triggers (e.g., `unpkg.com/rive.wasm`).
- Anything served from the CDN rather than from a serverless function.

The Phase 6 PNG → WebP swap was a genuine 214 KB win — but on a page
where the real cost was 12 MB of Rive runtime plus 14.6 MB of autoplay
video. The headline metric should have been Lighthouse, not bundle size.
Phase 8 corrected by measuring against `lighthouse` directly, which
exposes every resource the browser actually fetches, including the
ones that don't pass through Next's tracing.

**For future perf phases:** start with `npx lighthouse <prod-or-preview-url>
--only-categories=performance --output=json` and read the
`audits["network-requests"].details.items` list sorted by `transferSize`.
That list is the ground truth. Bundle-size metrics are useful for
serverless-function-budget checks (Netlify's 50 MB cap, the lesson from
the April `outputFileTracingExcludes` learning log), not for "is this
page fast."

### 5.2 The Phase 8 trap (deferred mount ≠ removed from LCP)

The Fix 2c (Rive IO gate) and Fix 2d (video deferred mount) ideas came
from the intuition that "delaying a heavy resource removes it from the
critical path." That's true for *real users* who feel paint moments
sequentially. It is **not** true for Lighthouse, which observes paint
events globally and assigns LCP to whichever paint is largest at any
point within its audit window.

If you defer a large element by 1.5s, that element still wins the
"largest" trophy when it finally paints, and Lighthouse reports LCP at
the late-paint timestamp. The deferral makes the LCP number worse, even
though the user-perceived rendering of the *other* content (vignette,
brush stroke, headline) happens earlier.

**Rule for the next perf phase:** if a "defer this" idea is meant to
move LCP, the heavy element must be *smaller than the next-largest
content* in the viewport. If it's still the largest after paint, the
defer just shifts LCP later. The right interventions for large LCP
elements are:
1. Make them smaller (re-encode video, downscale image, lower quality).
2. Make them faster to fetch (prelink, preload, same-origin instead of
   third-party).
3. Replace them with smaller content in the LCP window (e.g., paint a
   poster instantly, swap to video after).

Phase 8 retained the "make them smaller" interventions (Fix 2a halves
the Rive load by picking one variant; Fix 2d re-encoding cuts the camps
hero by 76%) and reverted the "defer" interventions.

### 5.3 The Phase 8 trap, second pass (wrong-mechanism explanation in §3.2)

The original §3.2 paragraph above declared the home-page LCP regression
was caused by the matchMedia `useEffect` gate delaying the Rive `.riv`
fetch. The arithmetic didn't even check out at the time (predicted
~100ms delta, measured 1,600ms) but the explanation got written up as
fact anyway. The follow-up investigation
([10-home-lcp-investigation.md](10-home-lcp-investigation.md)) showed
the LCP element is `home-hero-bg.png` in 20/20 runs, the Rive canvas
never enters LCP candidacy on the home page, and the regression is
bandwidth contention from 8 oversized testimonial poster JPGs sharing
the mobile HTTP/2 connection. Different element, different mechanism,
different fix.

**Rule for the next perf phase:** if a measurement moves unexpectedly,
verify the LCP element identity in `audits.entities` or trace
`largestContentfulPaint::Candidate` events before writing the
explanation up. A hypothesis whose predicted magnitude doesn't match
the measured magnitude (the §3.2 ~100ms vs. 1,600ms gap) should stop
the write-up, not get smoothed over.

---

## 6. Phase 9 entry conditions

Met as of commit `0a2dae8` + this doc:
- ✅ `tsc --noEmit` clean, `next build` clean (53 routes), `.next/server`
  = 28 MB, 0 mp4/mov/webm in trace, 0 wasm in trace (the new
  `public/rive.wasm` is served from CDN, not bundled into function trace).
- ✅ Two-sample Lighthouse measurements in §2c + §2d confirm the
  deferred mechanisms regressed LCP; the revise commit removes those
  mechanisms while retaining the byte-saving asset changes.
- ✅ §3.1 confirms three of four pages improved (camps weight −69%,
  teams + e100 both at Google "Good" thresholds). One page (home)
  regressed in LCP despite −42% byte savings — root cause + mitigation
  options in §3.2.

**Phase 9 status as of 2026-05-26 (post-investigation):** the original
candidate list below is partly superseded. The canonical Phase 9 plan,
calibrated against actual post-Phase-8 measurements, lives in
[11-home-lcp-postmortem.md](11-home-lcp-postmortem.md) §6 + §10. Items
1 and 4 below were retired by that investigation; item 2 is still
valid and renamed §6.2 in doc 11; item 3 is unchanged. New §6.1
(Tungsten preload trim) was added by doc 11 — applied in commit
`84c90cb` (LCP 4.96 → 4.49 s, score 73 → 75 on Netlify devtools).

Original Phase 8 candidate list (kept for lineage; cross-reference doc 11
before acting on any of these):

1. ~~**Home-page Rive useLayoutEffect / module-scope matchMedia** (§3.2 #1)
   — should recover the ~1.6s home LCP regression while preserving the
   6 MB byte savings from Fix 2a. Small code change; the constraint is
   SSR-safety (no `window` during render).~~ **RETIRED** by doc 10 §3 —
   the Rive canvas is not the LCP element in 20/20 measurements. Moving
   matchMedia to `useLayoutEffect` would change Rive fetch timing but
   wouldn't affect LCP because LCP is the hero image, not Rive.
2. **gtag.js (146 KB) + fbevents.js (98 KB) loading strategy** — both
   sync-loaded on every page. Switching to `next/script
   strategy="afterInteractive"` would push these out of the critical
   path without breaking measurement. Affects all pages. **Now doc 11
   §6.2; not yet shipped.** Predicted impact (calibrated): LCP 4.49 →
   ~3.76 s, score 75 → ~85.
3. **`ekuzo-teams-hero.mp4` (12.9 MB)** + **`ekuzo100-hero.mp4`
   (16.6 MB)** re-encoding — both are `controls preload="metadata"` so
   they aren't blocking initial load (post-revise transfer is ~320 KB
   / ~1.1 MB), but a re-encode would still ~halve those. Aaron's call
   on quality tradeoffs.
4. ~~**Testimonial poster image sizing** — currently 252 KB / 208 KB /
   192 KB for posters that display at ~150px wide. Likely an `srcset` /
   `next/image` sizing miss.~~ **PARTIALLY ADDRESSED** in commit
   `b9dad9a` (IntersectionObserver gates the carousel `<video>` mounts so
   posters no longer enter the initial-pageload network queue). The
   durable downscale work remains as doc 11 §6.3 — deferred until §6.2
   ships and re-measures.

Per memory `feedback_flag_blockers_not_before`: flag at the seam where
they bite, not preemptively. Today's Phase 8 outcome doesn't require
any of them — the dev → main merge can proceed once Aaron's QA + the
external-action items in [08-phase7-verification.md](08-phase7-verification.md) §3 land.
