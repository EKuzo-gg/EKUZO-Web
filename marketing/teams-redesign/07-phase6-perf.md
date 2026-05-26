# Phase 6 — Performance fixes (data-driven from Phase 0 baseline)

> **Captured:** 2026-05-25, on `dev` @ `bc24083` (tip after Phase 5 + the MAX_GAMERS=10 follow-up).
> **Tool versions:** Next.js 16.2.1 (Turbopack), Node v24.14.0.
> **Purpose:** §1 captures the post-Phase-5 baseline using the same shape as `02-baseline.md` §1 so a side-by-side diff is reading two tables of the same form. §2 is the diff. §3 is the target list — only entries the diff justifies. §4 is the final post-fix measurement.
>
> **Discipline (per handoff §1.4):** every changed line in Phase 6 must trace to a number in the §2 diff or a named target in Phase 0 §1. "Skip changes that don't move a number" is the rule, not a suggestion. If §3 lists no measurement-justified targets, that is itself a valid Phase 6 outcome — write it up and move to Phase 7 entry conditions.

---

## 1. Post-Phase-5 baseline

### TypeScript
- `tsc --noEmit`: **clean** (exit 0, no diagnostics).

### Build (`next build`, Turbopack)
- Compile: **1.53s**, TypeScript: **2.2s**, static page generation: **191ms** for 53 pages.
- 53 routes built (vs. 50 at Phase 0 — the deltas are: `/api/teams/lead`, `/api/teams/abandoned` from Phase 4, and `/api/teams/success` from Phase 5). No new warnings other than the pre-existing `middleware`→`proxy` notice.

### Bundle / function-bundle size
| Bucket | Phase 0 | Phase 5 (now) | Δ |
|---|---:|---:|---:|
| `.next/server` | 28 MB | **28 MB** | 0 |
| `.next/static` | 2.0 MB | **2.0 MB** | 0 |
| MP4/MOV/WebM in `.next/` | 0 | **0** | 0 |

`outputFileTracingExcludes` is still doing its job. 22 MB headroom under the Netlify 50 MB cap holds.

### Per-route prerendered payloads — register pages

| Route | Phase 0 HTML | Phase 5 HTML | Δ |
|---|---:|---:|---:|
| `/programs/ekuzo-camps/register` | 67,359 B | **67,359 B** | 0 |
| `/programs/ekuzo-teams/register` | 58,694 B | **56,846 B** | **−1,848 B** |
| `/programs/ekuzo100/register`    | 54,620 B | **54,840 B** | +220 B (noise) |

The teams register HTML dropped 1.8 KB from the Phase 5 rebuild on shared components. E100 grew 220 B (within bundler noise). Camps is byte-identical. All three success pages are ~27 KB each, unchanged in shape.

### Per-route prerendered payloads — marketing pages
(Not separately recorded at Phase 0 — captured here as the Phase 5 baseline for Phase 6+ regression tracking.)

| Route | HTML |
|---|---:|
| `/programs/ekuzo-camps` | 196,839 B |
| `/programs/ekuzo-teams` | 139,244 B |
| `/programs/ekuzo100`    | 128,183 B |

### Marketing client-reference-manifest sizes
| Route | Phase 0 | Phase 5 | Δ |
|---|---:|---:|---:|
| `/programs/ekuzo-camps` | 22,018 B | **22,018 B** | 0 |
| `/programs/ekuzo100`    | 22,354 B | **22,354 B** | 0 |
| `/programs/ekuzo-teams` | 23,918 B | **23,918 B** | 0 |

The Phase 5 register-page extraction touched no marketing-page code, and the manifests confirm it: byte-identical to Phase 0. Teams marketing is still the chunkiest of the three (more client islands).

### Top 10 client chunks
| Phase 0 size | Phase 5 size | Δ |
|---:|---:|---:|
| 226,355 B | **226,355 B** | 0 |
| 193,833 B | **193,833 B** | 0 |
| 158,617 B | **158,617 B** | 0 |
| 137,521 B | **137,521 B** | 0 |
| 112,594 B | **112,594 B** | 0 |
| 62,211 B  | 54,646 B | −7,565 B (renamed/recombined post-Phase-5; not a regression) |
| 56,528 B  | 53,689 B | −2,839 B (same) |
| 54,646 B  | 35,528 B | (chunk shuffle, not directly comparable) |
| 53,677 B  | 33,624 B | (chunk shuffle, not directly comparable) |
| 32,338 B  | 30,571 B | (chunk shuffle, not directly comparable) |

The top 5 chunks (the only ones >100 KB) are **byte-identical** to Phase 0. That confirms Phase 5's extraction had zero effect on what ships to the browser — it was a source-level dedup, exactly as the handoff §3 + §1.4 said it would be. The smaller chunks shuffled around because the bundler re-split app-code (post-extraction, more shared component imports), but every chunk in the long tail is well under 100 KB and none individually grew.

### Asset audit — flagged candidates from Phase 0 §1

**`smoke-1@2x.png` + `smoke-2@2x.png`** — flagged at Phase 0 §1 ("worth checking file size + whether they should be WebP/AVIF; flagged for Phase 6"). Re-audited 2026-05-25:

| File | On disk | Used on |
|---|---:|---|
| `public/images/smoke-1@2x.png` | **156,210 B (153 KB)** | `/programs/ekuzo-teams`, `/programs/ekuzo100`, `/methodology`, `/faq` |
| `public/images/smoke-2@2x.png` | **273,260 B (267 KB)** | `/programs/ekuzo-teams`, `/programs/ekuzo100`, `/methodology`, `/faq` |
| **Combined** | **429,470 B (420 KB)** | 4 pages, each loading both |

All eight usages are decorative (`aria-hidden="true"`, `alt=""`) and displayed via `next/image` at sub-natural width (`w-[clamp(300px,55vw,900px)]`). Source is 900×900 PNG; render is typically 300–700 px. Phase 0 §1 only named the teams marketing page; the re-audit found the same PNGs on three more pages — the swap is a one-pass change that wins on four routes, not one.

### Stripe.js scope — re-audited 2026-05-25
- `lib/stripeClient.ts` (Phase 5's shared `stripePromise`) is imported only by `components/register/PaymentStep.tsx`, which is imported only by the three canonical `/programs/{product}/register` pages.
- The legacy `app/camps/register/page.tsx` has its own inline `loadStripe` import (pre-canonical-route shim, intercepted by `next.config.mjs` redirects).
- Marketing pages (`/programs/{product}`, `/methodology`, `/faq`, `/`) do **not** import `loadStripe` directly or transitively.

**Verdict:** Stripe.js is already correctly scoped to the register pages. No dynamic-import work justified.

### `"use client"` audit — marketing-page sections
- The three program marketing pages (`/programs/{ekuzo-camps,ekuzo-teams,ekuzo100}`) are **server components** by construction (no `"use client"` at the page level).
- Client islands they pull in: `TestimonialsCarousel`, `EcosystemAnimation`, `OurApproachSection`, `TwoWaysSection`, `ModalButton`, `ProgramsHeroRive` (homepage), `HomeHowItWorks` (homepage), `MissionCarousel` (homepage). Every island in `components/sections/` and `components/ui/` flagged `"use client"` today has genuine state, effects, event handlers, or browser-only APIs (Rive runtime, scroll observers, clipboard, modal context, video element control). None are misclassified as client-only.

**Verdict:** No `"use client"` → server-component conversions justified.

---

## 2. Diff against Phase 0

**Stable (zero regression, zero improvement):**
- `.next/server` (28 MB), `.next/static` (2.0 MB), 0 mp4 in trace.
- All five client chunks > 100 KB are byte-identical (226 / 194 / 159 / 138 / 113 KB).
- Camps register HTML byte-identical (67,359 B).
- Marketing client-reference-manifests byte-identical for all three programs.

**Phase 5's measured impact on shipped weight:** **none** at the level of any individual route's bundle or the top client chunks. Source dedup was a maintainability win, not a load-perf win — as the handoff §3 + §1.4 predicted. The teams register HTML −1.8 KB is the only positive byte-level delta and is too small to claim as a meaningful perf win.

**Names targets from Phase 0 §1 still standing:**
1. **`smoke-*@2x.png` decorative PNGs** — 429 KB combined on disk, used on four pages, displayed below natural size. Still the obvious WebP/AVIF candidate; the re-audit found the cost is 4× what Phase 0 named (one page → four pages).
2. **Stripe.js scope** — verified clean. Already scoped to register pages. Close.
3. **`"use client"` audit** — verified clean. No misclassified client islands on marketing pages. Close.

---

## 3. Phase 6 target list

| # | Target | Justification | Expected delta |
|---:|---|---|---|
| 1 | Convert `smoke-1@2x.png` + `smoke-2@2x.png` to WebP; swap `src` on the 4 consuming pages | Phase 0 §1 named these PNGs as oversized for their decorative role; re-audit showed 4× the surface area Phase 0 estimated; 420 KB on disk for two `aria-hidden` PNGs is the only Phase-0-flagged candidate that survived this round's re-audit | Source files: 420 KB → ~80–120 KB combined (~70–80% drop). User-facing perf benefit on Netlify's `_next/image` pipeline scales with source byte count even when runtime WebP delivery is already in play |

**Targets explicitly NOT taken (with reasons):**

- **Dynamic-import Stripe.js** — verified at §1 that `loadStripe` ships only with register pages. Wrapping `lib/stripeClient.ts` in a dynamic import would add complexity without moving any measured number.
- **`"use client"` → server component conversions** — every client island audited has genuine state/effects/handlers/browser APIs. Forcing a server-component refactor would be intuition-justified, not measurement-justified.
- **Legacy `app/camps/register/page.tsx`** (700+-line duplicate, pre-canonical-route shim) — out of Phase 6 scope. The recent commit `3746c26` deleted 8 dead duplicate page files; this one survived that pass and warrants Jamie's call before removal, not a Phase 6 unilateral delete. Flag-only.
- **Bundle-analyzer pass on the 5 chunks >100 KB** — those chunks are byte-identical to Phase 0, so any "improvement" would chase an unchanged baseline. Defer until a future phase or a chunk grows.

---

## 4. Post-fix measurement

After Phase 6b (smoke `.png` → `.webp` swap; PNG sources deleted):

### Source assets
| File | Phase 5 | Phase 6 | Δ |
|---|---:|---:|---:|
| `public/images/smoke-1@2x.{png→webp}` | 156,210 B | **74,538 B** | **−52%** |
| `public/images/smoke-2@2x.{png→webp}` | 273,260 B | **140,224 B** | **−49%** |
| **Combined** | **429,470 B** | **214,762 B** | **−214,708 B (−50%)** |

### System metrics
| Metric | Phase 5 | Phase 6 | Δ |
|---|---:|---:|---:|
| `tsc --noEmit` | clean | clean | — |
| `next build` | clean | clean | — |
| `.next/server` | 28 MB | **28 MB** | 0 |
| `.next/static` | 2.0 MB | **2.0 MB** | 0 |
| MP4/MOV/WebM in `.next/` | 0 | **0** | 0 |

### Top 5 client chunks (the only chunks >100 KB)
All five **byte-identical** to Phase 0 + Phase 5: 226,355 / 193,833 / 158,617 / 137,521 / 112,594 B. As expected — the swap is asset-only, doesn't touch any JS.

### Per-route prerendered HTML

| Route | Phase 5 | Phase 6 | Δ |
|---|---:|---:|---:|
| `/programs/ekuzo-camps/register` | 67,359 B | **67,359 B** | 0 |
| `/programs/ekuzo-teams/register` | 56,846 B | **56,846 B** | 0 |
| `/programs/ekuzo100/register`    | 54,840 B | **54,840 B** | 0 |
| `/programs/ekuzo-camps` | 196,839 B | **196,839 B** | 0 (no smoke imgs on this page) |
| `/programs/ekuzo-teams` | 139,244 B | **139,252 B** | **+8 B** |
| `/programs/ekuzo100`    | 128,183 B | **128,191 B** | **+8 B** |

The +8 B on the two pages that use the smoke decorations is the `.png` → `.webp` URL-string growth (4 srcset variants × 1 char × 2 imgs = 8 B). Not a regression — it's the exact byte-count consequence of the swap. `/methodology` + `/faq` get the same +8 B (not enumerated above).

### Marketing client-reference-manifests
| Route | Phase 5 | Phase 6 | Δ |
|---|---:|---:|---:|
| `/programs/ekuzo-camps` | 22,018 B | **22,018 B** | 0 |
| `/programs/ekuzo100`    | 22,354 B | **22,354 B** | 0 |
| `/programs/ekuzo-teams` | 23,918 B | **23,918 B** | 0 |

### Functional verification
Dev preview at `http://localhost:3001`. Both smoke decorations confirmed loading on all 4 affected pages:

| Page | smoke-1 | smoke-2 |
|---|---|---|
| `/programs/ekuzo-teams` | `_next/image?url=%2Fimages%2Fsmoke-1%402x.webp` (304, complete:true, naturalW:938) | `…smoke-2%402x.webp` (304, complete:true, naturalW:755) |
| `/programs/ekuzo100`    | same | same |
| `/methodology`           | same | same |
| `/faq`                   | same | same |

0 console errors across the four pages. Hero renders correctly.

### Phase 6 verify gate — PASSED
- ✅ `tsc --noEmit` clean
- ✅ `next build` clean (53 routes — same as Phase 5)
- ✅ `.next/server` = **28 MB** (Netlify 22 MB headroom holds)
- ✅ 0 mp4/mov/webm in `.next/` (`outputFileTracingExcludes` still doing its job)
- ✅ No regression in any route's HTML or chunk weight (the two +8 B deltas are the swap itself; chunks byte-identical)
- ✅ Measurable improvement on a named Phase 0 target: smoke PNGs **−214 KB (−50%)** on disk; same source flows into Netlify's `_next/image` runtime pipeline
- ✅ All four affected pages render with no console errors

### What Phase 6 deliberately did NOT touch (and why — per §3)
- **`"use client"` audits** — every client island on marketing pages has genuine state/effects. No measurement-justified target.
- **Stripe.js dynamic-import** — already correctly scoped to register pages. Adding indirection would chase an unmoved number.
- **Legacy `app/camps/register/page.tsx`** (700+ line pre-canonical duplicate) — out of scope for Phase 6; needs Jamie's call before deletion (the recent `3746c26` "delete 8 dead duplicate page files" pass left this one intentionally or by oversight).
- **Bundle-analyzer pass on the 5 chunks >100 KB** — those chunks are byte-identical to Phase 0; nothing to chase.

---

## 5. Phase 7 entry conditions

Met as of this commit:
- ✅ `tsc` clean, `next build` clean, `.next/server` ≤ 28 MB, 0 mp4/mov/webm in `.next/`.
- ✅ §4 documents the measured deltas.

Still owed (flag at the seam where they bite, not preemptively — these are Phase 7 / merge-gate concerns, not Phase 6 blockers):
- **Aaron's visual QA pass** on all three register pages + the teams success page (his lane per handoff §6). Now appropriate to flag — the dev preview is ready.
- **Klaviyo "teams" confirmation flow** in the Klaviyo dashboard with `event.extra.product == "teams"` filter (Jamie's dashboard lane per handoff §6). Required before a teams buyer sees their welcome email.
- **Apps Script `"teams"` squad discriminator** confirmation in Google Sheets. Phase 5 ran two live teams payments (upfront $576 + installment $160) on the rebuilt page; those should have produced rows in `squads`. If Sheets shows zero teams squad rows after Phase 5's live tests, Apps Script needs the `"teams"` value added to its discriminator allow-list. Cheap to verify; expensive to discover when a friend hits a 404 on `/programs/ekuzo-teams/register?squad=TOKEN`.
- **Final live Stripe-CLI test** across all four cases (camps + e100 + teams upfront + teams installment) on `dev--ekuzo.netlify.app` — Jamie's lane per CLAUDE.md test-key constraint.

Per memory `feedback_dev_to_main_merges`: stop after Phase 6 lands on dev. Do not auto-promote to main — Jamie batches dev→main merges himself.



