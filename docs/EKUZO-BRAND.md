# EKUZO — Brand & Page-Structure Rules (Claude Code)

**Read this before building a NEW marketing/site page.** It documents how the live site is already put together so new work matches it.

> **The live `EKUZO-Web` codebase is the source of truth — this file documents it, it does not override it.** Where the code and this doc differ, **the code wins and this doc is wrong** — flag it, change nothing. **Never** refactor, "clean up," fix, or retrofit existing code because of anything in this guide. It applies to **new** sections and pages only.
>
> **Status: living document — partial and in-progress, not definitive.** It captures some of the system, not all of it, and is **meant to be updated as EKUZO evolves** — add sections, correct values, promote drafts to live as the site changes. It grows alongside the codebase; it never freezes. When in doubt, look at how the site already does it.
>
> **Last updated:** 2026-07-09 · see the changelog at the end (§11).

Source of truth for raw values is `app/globals.css` (the `@theme inline` block) and the components in `components/`. This file explains **how those pieces are composed into a page** — the part that isn't obvious from the tokens alone.

---

## 0. The non-negotiables (quick checklist)

How the site's pages are structured — match this when building a **new** page (existing pages already do their own thing; leave them be):

1. **Open with `<Nav />` and close with `<FooterBanner />` + `<Footer />`.** Never ship a page without the footer banner CTA.
2. **Be built as a vertical stack of full-width color bands** — `bg-red`, `bg-black`, `bg-white`, `bg-grey` — that **alternate**. Never two identical adjacent bands with no reason.
3. **Separate bands with a torn-paper seam** (see §4). A hard color-to-color edge with no torn paper is the #1 off-brand tell.
4. **Wrap section content in the standard container + gutter** (§2). Content never touches the viewport edge on desktop.
5. **Lead sections with an `<Eyebrow>` then an Inter-Bold H2** (not the display face — see §5).
6. **Use `font-display` (Tungsten) only for hero words, program names, watermarks, and big card labels.** Everything else is Inter.
7. **Primary action is red.** Purple is a neutral-selector accent only. No gradients as base surfaces, no drop shadows, no emoji, no soft radii.

---

## 1. Canonical page skeleton

This is the home page's real structure — use it as the template for any new marketing page. Bands alternate; every seam is a torn divider; the container/padding is identical on every section.

```tsx
export default function SomePage() {
  return (
    <>
      {/* 1 · HERO — bg-red, Nav overlaid, huge display H1, torn seam at bottom */}
      <section className="relative bg-red overflow-visible"
        style={{ paddingTop: "clamp(100px, 12vw, 160px)", paddingBottom: "clamp(200px, 30vw, 400px)" }}>
        <div className="absolute top-0 left-0 w-full z-20"><Nav variant="dark" /></div>
        <h1 className="font-display uppercase text-white leading-[0.89] text-center"
            style={{ fontSize: "clamp(4.5rem, 20vw, 256px)" }}>
          Every gamer<br />deserves a team
        </h1>
        {/* torn seam: red → next band (see §4) */}
      </section>

      {/* 2 · CONTENT BAND — bg-grey, standard section shell */}
      <Section bg="bg-grey">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-body font-bold text-black leading-[1] mb-[40px] md:mb-[64px]"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}>
          Growth through play
        </h2>
        {/* … */}
      </Section>

      {/* 3 · bg-white band …  4 · bg-black band …  (alternate, each with a seam) */}

      {/* CLOSE — always */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
```

**The real home-page band order** (copy this rhythm): `red hero → grey → white → black → white → red footer-banner → black footer`. Program/landing pages follow the same alternating logic — never stack two greys or two whites back to back without a deliberate reason.

---

## 2. Section shell (identical on every band)

Every section uses the same horizontal gutter, vertical rhythm, and inner container. Bake this into a `Section` wrapper or repeat it verbatim:

```tsx
<section
  className="relative bg-grey"   // swap bg-* per band
  style={{
    paddingTop: "clamp(80px, 14vw, 188px)",
    paddingBottom: "clamp(80px, 14vw, 188px)",
    paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
    paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
  }}
>
  <div className="max-w-[1232px] mx-auto">
    {/* content */}
  </div>
</section>
```

- **Horizontal gutter:** `clamp(1.5rem, 7.2vw, 104px)` — always. (`--gutter`)
- **Vertical rhythm:** standard `clamp(80px, 14vw, 188px)`; compact bands `100px`; testimonials `144px`; hero `clamp(100px,12vw,160px)` top / `clamp(200px,30vw,400px)` bottom.
- **Content max-width:** `max-w-[1232px] mx-auto`. (`--container-max`)
- Sections that carry a torn seam need `relative overflow-visible`.

---

## 3. Color bands — when to use each

| Band | Class | Use for |
|---|---|---|
| Red | `bg-red` | Hero, the footer-banner CTA, high-energy moments. White type + white-outlined buttons. |
| Black | `bg-black` | One punchy dark section per page (e.g. "LEARN + PLAY", "how it works"), the footer. White type. |
| White | `bg-white` | Default content surface. Black type. |
| Off-white | `bg-grey` (`#EFEEED`) | The quiet alternating band between white sections. Black type. |

Text is **opacity on the base color**, never new greys: black at 100/70/60/40% on light (`text-black`, `text-black/70`, `/60`, `/40`); white at 70/60/20/15% on dark (`text-white/70`, etc.).

**Purple** (`#A435F0` / soft `#F3E8FF`) is a **utility accent only** — date pickers, selectors, selection summaries where red would read as an error. Never a hero/CTA/brand color.

### Expanded palette (working draft — not live)

An accent library being explored beyond the core four. **Not on the site yet.** Use one accent per context, sparingly; the core red/black/white/grey still carry the brand. To adopt, paste `globals-colors-snippet.css` into the `@theme inline` block in `app/globals.css` — Tailwind v4 auto-generates `bg-*`/`text-*`/`border-*` from each token.

- **Warm neutrals:** cream `#F8F4E2`, sand `#D2C0A6`, slate `#1C3745`.
- **Accents:** blue `#034FFF`, violet `#AE2CF2`, teal `#3791A6`, green `#49B41A`, lime `#E0FF4E`, yellow `#FDE74C`, orange `#FF5B05`, cyan `#60E1E0`, magenta `#FF2ECC`.

`violet #AE2CF2` (the bright torn-paper fill) is distinct from the utility `--color-purple #A435F0` — keep both.

---

## 4. Torn-paper seams (working as intended — reuse, don't re-engineer)

> ⚠ **The torn-paper transitions on the live site are hard-won and working as intended. Do NOT replace, re-engineer, or "fix" existing seams.** Reuse the existing `TornPaperDivider` component and match the established pattern only when you add a *new* section. Everything below is **descriptive** — a map of what already exists — not a mandate to change anything.

Every band transition is a torn-paper PNG that **hangs across the boundary**. How the existing ones work:

- The divider lives in a **`relative overflow-visible`** section, positioned `absolute`, and is **translated ~100% (± a 1–2px overlap)** so it spills into the neighbouring band.
- Put it **inside** an `overflow-hidden` / `overflow-clip` section and the overhang gets sliced — this is the most common bug.
- Assets live at `/images/new%20torn%20paper/torn-paper-{color}-{top|bottom}-{1|2}%402x.png`.
- Prefer the `TornPaperDivider` component; drop to a raw `<img>` only when you need a custom transform.

```tsx
import TornPaperDivider from "@/components/ui/TornPaperDivider";

// inside a `relative overflow-visible` section:
<TornPaperDivider color="black" variant="bottom" style={1} />  // hangs below, into the section under
<TornPaperDivider color="white" variant="top" style={1} />     // hangs above, into the section over
```

Raw pattern (from `HomeHowItWorks`), if you need it:

```tsx
<img src="/images/new%20torn%20paper/torn-paper-black-bottom-1@2x.png" alt="" aria-hidden="true"
  className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
  style={{ transform: "translateY(calc(100% - 2px))" }} />
```

**The home-page seam sequence** — the authoritative reference for which paper goes where:

| Transition | Paper asset | Placed on | Transform |
|---|---|---|---|
| Red hero → grey | `white-1` | hero bottom | `translateY(52%)` |
| Grey → white | `white-top-1` | white top | `translateY(-55%)` |
| White → black | `black-top-1` | white bottom | `translateY(2px)` |
| Black → white | `black-bottom-1` | black bottom | `translateY(calc(100% - 2px))` |
| White → red (footer banner) | `red-top-2` | red top | `translateY(calc(-100% + 1px))` |

Rule of thumb: a `-top` asset caps the top of a section with its solid edge flush and the torn edge reaching up into the band above; a `-bottom` asset does the reverse. Match the paper's fill to the section it belongs to so the solid half is invisible (red-on-red at the footer banner, black-on-black leaving black, etc.).

---

## 5. Type

Two faces. **Tungsten is reserved for the loudest moments — most headings are Inter Bold.**

| Role | Face / class | Size | Tracking / leading |
|---|---|---|---|
| Hero H1 | `font-display` uppercase | `clamp(4.5rem, 20vw, 256px)` | leading `0.89` |
| Program name / display label | `font-display` uppercase | up to `clamp(80px,8vw,120px)` | leading `0.8`–`1` |
| Big card label (SCHOOL / HOME) | `font-display` uppercase | `clamp(80px, 8vw, 120px)` | leading-none |
| **Section heading (H2/H4)** | **`font-body font-bold`** (Inter) | `clamp(2rem, 4.4vw, 64px)` | `letterSpacing: -1.28px`, leading `1` |
| Pillar title (H6) | `font-body font-bold` | ~`34px` / `clamp(1.125rem,2vw,28px)` | leading `1.357` |
| Large body | `font-body` | `clamp(1.125rem, 2vw, 28px)` | leading `1.357` |
| Body | `font-body` | `clamp(1rem, 1.7vw, 24px)` | leading `1.417` |
| Eyebrow / label | `font-body font-bold` uppercase | `text-sm` (14–16px) | `tracking-[0.15em]` |

- `.font-display` defaults to **Black (900)** with global `letter-spacing: 0.02em` (set in `globals.css` — don't override per element unless intentional).
- **Casing:** display headlines UPPERCASE; section headings sentence case; eyebrows UPPERCASE wide-tracked; product names as one token — `EKUZO` + suffix in a contrast color: `EKUZO<span className="text-red">TEAMS</span>`, `EKUZO100`, `EKUZOCAMPS`.
- Tungsten Narrow is **preview-licensed** (Hoefler & Co). Secure a production license before public launch. Fallbacks: Impact / Arial Narrow → (web) Oswald / Anton.

---

## 6. Component reference

Import from the existing codebase — don't re-implement these.

**Eyebrow** — `@/components/ui/Eyebrow`. Skewed red chip, label counter-skewed level. `variant="light"` = white bg / red text for use on red/dark bands.
```tsx
<Eyebrow>2 ways to play</Eyebrow>
```

**Button** — `@/components/ui/Button`. Variants: `red-filled` (default), `red-outlined`, `white-filled`, `white-outlined`. All 2px border, `rounded-sm` (2px), `font-bold font-body`, `transition-all duration-150`. Filled hover → `opacity-90`; outlined hover → invert to fill. Use white variants on red/black bands.
```tsx
<Button variant="red-filled" href="/programs">See programs</Button>
```

**CircleIcon** — `@/components/ui/CircleIcon`. White glyph on a red disc: `size` 72 (desktop) / 50 (mobile), `bg="#F92524"`. Icons come from `/public/icons/*.svg`; on a colored circle invert with `filter: brightness(0) invert(1)` or use the `-white` variants. Never redraw or invent glyphs.

**Notched card** — the signature container. Inline clip-path (no component needed):
```tsx
style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
```
Top-left + bottom-right corners sliced at 40px. Program cards, "how it works" panels, closing cards. For a photo card, layer a `linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.75))` scrim (same clip-path) for legibility.

**FooterBanner** — `@/components/sections/FooterBanner`. The closing CTA. Red band, red-top torn cap, heading + `Enroll my gamer` button + the `enroll-promo-graphic` cut-out collage on the right. Always present near the end of a page.
```tsx
<FooterBanner heading="Enroll into a transformational program today" />
```

**FAQAccordion** — `@/components/ui/FAQAccordion`. Uses the `camada` caret marker, rotates 180° + turns red when open (`duration-200`).

**Nav / Footer** — `@/components/layout/Nav` (use `variant="dark"` overlaid on a red/dark hero) and `@/components/layout/Footer` (ends with the edge-to-edge `EKUZO` wordmark flush to the bottom).

> The Nav's variant intentionally **flips (dark/light) to stay legible over the hero's background color or image.** This is by design — expected behavior, not a bug. Don't "fix" or lock it.

---

## 7. Motion & states

Quick and snappy — no bounce, no long eases. `ease-out` = `cubic-bezier(0,0,0.2,1)`.

- Buttons / hovers: **150ms**. Accordions / toggles: **200ms**. Drawers / mega-menu / answer reveal: **300ms**.
- Hover: filled → `opacity-90`; outlined → invert fill/text; links → bold + 2px underline.
- Active: `scale(0.97–0.99)` + slight darken (`brightness(0.9)`).
- **No** drop shadows, glassmorphism, or blur. Separation comes from color bands and torn edges.
- Corners: near-square. Buttons/images `rounded-sm` (~2px); personality comes from the 40px notch, not rounding.

---

## 8. Voice & tone

Speaks to a 14-year-old and their parent at once. Fun for players, grounded and safe for families.

- **Confident, not hype.** Say what a program *is* and *does*. **Never** promise scholarships, pro contracts, or guaranteed outcomes.
- Plain, direct, scannable. Avoid em dashes and generic filler. Light gamer slang ("bet", "GG", "lobby") as seasoning only.
- Family-safe everywhere. **No emoji** in product/marketing UI.
- CTAs from the parent's POV: **"Enroll my gamer"**, **"Start a conversation"**.

**Do:** "EKUZO coaches your gamer through real practice, VOD review, and team competition."
**Don't:** "We turn your kid into a pro athlete with scholarship potential."

---

## 9. New-page structural checklist

When building a **new** page, before you call it done (this is for new work — not a pass to audit or change existing pages):

- [ ] `<Nav />` at top (`variant="dark"` if the hero is red/black), `<FooterBanner />` + `<Footer />` at the end.
- [ ] Page is a stack of alternating color bands; no two identical bands adjacent without reason.
- [ ] Every band transition has a torn-paper seam, placed in a `relative overflow-visible` section (not clipped).
- [ ] Every section uses the standard gutter `clamp(1.5rem,7.2vw,104px)`, vertical rhythm, and `max-w-[1232px] mx-auto`.
- [ ] Sections lead with `<Eyebrow>` + an **Inter-Bold** H2 (`-1.28px` tracking). Tungsten only for hero/display/labels.
- [ ] Primary CTA is red; white-outlined buttons on red/dark bands.
- [ ] Notched cards use the 40px clip-path; no soft radii, no shadows, no gradient base surfaces, no emoji.
- [ ] Icons pulled from `/public/icons`, inverted white on red circles.

---

## 10. Known drift (design-system tokens vs shipped code)

- **H4 line-height:** shipped code uses **1.125**; an older token file said 1.0. Prefer the shipped **1.125**.
- **Off-white:** canonical is **`#EFEEED`** (`--color-grey`). A warmer `#F0EDEA` appears as a one-off inline value on a few sections — not a token; don't reach for it in new work.
- Only **red / grey / purple** are tokenized in `globals.css`; black and white are used as literals.

---

## 11. Maintaining this doc

This is a living reference — keep it current as the system matures. When something changes:

- **A value changed in the code** → update it here and note it in the changelog. The code is always the source of truth; this doc follows it, never the reverse.
- **A draft became real** (e.g. the expanded palette ships) → move it out of "working draft," drop the *not live* caveats, and fold it into the relevant section.
- **A new pattern emerged** → add a section describing how the site does it. Keep the descriptive, "new work only, don't fix existing" framing.
- **Something here is wrong or stale** → fix or delete it. A wrong rule is worse than a missing one.
- Bump **Last updated** at the top and add a changelog line below.

### Changelog

- **2026-07-09** — Initial version: page skeleton, section shell, color bands, torn-paper seam sequence, type, components, voice, misuse, drift notes. Added expanded palette (working draft — cream/sand/slate + 9 accents) with paste-in `globals-colors-snippet.css`.
- _add new entries above this line._
