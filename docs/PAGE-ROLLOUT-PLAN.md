# Page Rollout Plan

Priority order for bringing remaining pages to homepage-level fidelity. Each page has a Framer reference doc and component IDs ready to pull from the MCP.

---

## Tier 1 — Core Marketing Pages (do these first)

These are the pages visitors hit from the nav. They share a lot of structure with the homepage.

### 1. `/programs` (191 lines — built, needs QA)
- **Framer ref:** `docs/framer/pages/programs.md`
- **Status:** Sections exist but use old `TornPaperDivider` component and haven't been QA'd against Framer.
- **Work:** Swap torn paper to PNG/background-image pattern. QA spacing, typography, responsive breakpoints. Verify shared components (OurApproachSection, ProgramsSection, TwoWaysSection, TestimonialsCarousel) render correctly.

### 2. `/parents` (255 lines — built, needs QA)
- **Framer ref:** `docs/framer/pages/parents.md`
- **Status:** Built with sections, uses old torn paper.
- **Work:** Same torn paper swap. QA FeatureCardsSection, TickerSection. Verify FAQ accordion content matches Framer. Responsive pass.

### 3. `/schools` (286 lines — built, needs QA)
- **Framer ref:** `docs/framer/pages/schools.md`
- **Status:** Built with sections, uses old torn paper.
- **Work:** Same pattern. QA all sections against Framer. This page likely has school-specific hero imagery — verify assets exist.

### 4. `/methodology` (290 lines — built, needs QA)
- **Framer ref:** `docs/framer/pages/pedagogy.md`
- **Status:** Most complete of the non-homepage pages. Has hero video, How It Works cards, 10 pillars, quote.
- **Work:** QA torn paper transitions, spacing, typography. Verify hero video (`pedagogy-hero.mp4`) plays correctly. Responsive pass.

---

## Tier 2 — Product Pages (revenue-driving)

### 5. `/ekuzocamps-seasonal` (1052 lines — substantial build exists)
- **Framer ref:** `docs/framer/pages/ekuzocamps-seasonal.md`
- **Status:** Largest page. Has squad roles, week path, daily schedule, value props, FAQ, testimonials.
- **Work:** QA the full page against Framer. This is the primary camps marketing page — links to `/camps/register`. Torn paper, responsive, typography pass. Verify all section assets exist.

### 6. `/ekuzo100-4-week-intro` (286 lines — built)
- **Framer ref:** `docs/framer/pages/ekuzo100-4-week-intro.md`
- **Status:** Built with How It Works steps, FAQ, testimonials, ecosystem animation.
- **Work:** Full QA pass. Verify hero video (`ekuzo100-hero.mp4`). Torn paper and spacing fixes.

### 7. `/ekuzoteams-semester-based` (382 lines — built)
- **Framer ref:** `docs/framer/pages/ekuzoteams-semester-based.md`
- **Status:** Built with season cards, two ways section, FAQ, testimonials.
- **Work:** Full QA pass. Verify hero video (`ekuzo-teams-hero.mp4`). Complex pricing discussion deferred — page is marketing only for now.

---

## Tier 3 — Supporting Pages

### 8. `/about` (327 lines — built)
- **Framer ref:** `docs/framer/pages/about.md`
- **Status:** Built with ecosystem cards, testimonials.
- **Work:** QA pass. Likely needs hero section work and founder/team content.

### 9. `/faq` (existing, static)
- **Status:** Working accordion page. Low priority — just needs torn paper and spacing QA.

### 10. `/blog` + `/blog/[slug]` (stub)
- **Status:** Static, no CMS. Lowest priority. Build when content is ready.

---

## Approach Per Page

For each page, follow this sequence:

1. **Read** `docs/framer/pages/{page}.md` for section order, component IDs, content
2. **Pull** component XML from Framer MCP for each section (get all 4 breakpoints)
3. **Audit** existing code — what's already built, what's using old patterns
4. **Fix** torn paper transitions (swap to PNG/background-image pattern from QA checklist)
5. **Fix** typography (clamp sizes, font-display, no per-element letterSpacing)
6. **Fix** spacing (section padding, card gaps, max-width containers)
7. **Fix** nav variant (dark on red/dark heroes, light on white/grey)
8. **Fix** responsive (test at 390, 810, 1200, 1920)
9. **Verify** all assets exist — if missing, list what Aaron needs to export
10. **Move on** to next page

---

## Shared Component Audit (do once before starting)

These components are used across multiple pages. Fix them once, every page benefits:

- **FooterBanner** — already QA'd on homepage ✅
- **TestimonialsCarousel** — already QA'd on homepage ✅
- **Footer** — wordmark + sticky CTA hiding already done ✅
- **Nav** — lg breakpoint fix already done ✅
- **OurApproachSection** — used on programs, parents, schools, ekuzo100, ekuzoteams. Needs QA.
- **ProgramsSection** — used on programs, parents, schools. Needs QA.
- **TwoWaysSection** — used on programs, ekuzoteams. Needs QA.
- **FeatureCardsSection** — used on parents, schools. Needs QA.
- **TickerSection** — used on parents, schools. Needs QA.
- **EcosystemAnimation** — Jamie owns this. Leave for him.
- **TornPaperDivider** — DEPRECATED. Replace all usages with the inline PNG/background-image pattern.

QA the shared components first, then the pages will mostly just need section-specific fixes.
