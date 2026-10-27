---
name: EKUZO
description: Every gamer deserves a team.
colors:
  ekuzo-red: "#F92524"
  black: "#000000"
  white: "#FFFFFF"
  off-white: "#EFEEED"
  utility-purple: "#A435F0"
  utility-purple-soft: "#F3E8FF"
typography:
  display:
    fontFamily: "\"Tungsten Narrow\", Oswald, sans-serif"
    fontSize: "256px"
    fontWeight: 900
    lineHeight: 0.89
    letterSpacing: "0.02em"
  display-label:
    fontFamily: "\"Tungsten Narrow\", Oswald, sans-serif"
    fontSize: "120px"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-1.28px"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.059
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.417
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "0.15em"
rounded:
  none: "0"
  sm: "2px"
  full: "9999px"
spacing:
  gutter-min: "24px"
  gutter-max: "104px"
  container: "1232px"
  section-min: "80px"
  section-max: "188px"
  notch: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ekuzo-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ekuzo-red}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
  button-on-dark:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
  eyebrow:
    backgroundColor: "{colors.ekuzo-red}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    padding: "6px 12px"
---

# Design System: EKUZO

This file mirrors `docs/EKUZO-BRAND.md` (page structure) and the EKUZO Design System artifact (https://claude.ai/artifact/QMKPYkNS5EN23sVBYhfP1T). The live code is the source of truth; for new work only.

## Overview

Loud red on clean black and white, with generous off-white breathing room, and handmade grit from torn-paper seams, brush strokes and the 40px notch. It speaks to a 14-year-old and their parent at once: energetic for players, grounded and safe for families. No gradients, shadows, glass or emoji.

## Colors

### Primary
- **EKUZO Red** (#F92524): hero band, primary CTA, Eyebrow chip, icon circles, footer banner. The primary action is always red. White text on it only at large sizes (3.95:1).

### Neutral
- **Black** (#000000): pure black. One punchy dark band per page, footer, display type on light.
- **White** (#FFFFFF): default content band.
- **Off-white** (#EFEEED): the quiet band between white sections (`bg-grey`).
- **Utility Purple** (#A435F0, soft #F3E8FF): selectors and date pickers only, where red would read as an error. Never brand or CTA.

### Named Rules
**The Opacity Rule.** Text tints are opacity on the base color, never new greys: black at 100/70/60 on light, white at 70/60 on dark. Black/40 and white/20 or /15 are for dividers only.
**The Four Bands Rule.** Pages are full-width red, black, white and off-white bands that alternate, joined by torn-paper seams.

## Typography

**Display:** Tungsten Narrow (local, preview license), always ALL CAPS. Fallback: Oswald Bold, never Anton.
**Body:** Inter.

### Hierarchy
- **Display** (900, clamp(4.5rem, 20vw, 256px), 0.89): hero words only.
- **Display label** (900, clamp(80px, 8vw, 120px), 0.8): program names, big card labels, watermarks.
- **Headline** (Inter 700, clamp(2rem, 4.4vw, 64px), 1, -1.28px): section headings, sentence case.
- **Title** (Inter 700, 34px, 1.059): pillar and card titles.
- **Body** (Inter 400, clamp(1rem, 1.7vw, 24px), 1.417): 16px floor for reading text.
- **Label** (Inter 700, 14px, 0.15em, uppercase): the Eyebrow chip only.

### Named Rules
**The Loud Moments Rule.** Tungsten is reserved for the loudest words; most headings are Inter Bold.

## Layout

Every section: gutter clamp(1.5rem, 7.2vw, 104px), vertical padding clamp(80px, 14vw, 188px), content max-width 1232px. Open with Nav, close with FooterBanner and Footer. Stack to one column at 768px. Motion: 150ms buttons, 200ms toggles, 300ms drawers, ease-out cubic-bezier(0, 0, 0.2, 1), no bounce.

## Elevation & Depth

Flat. Separation comes from color bands and torn-paper seams, never shadows.

### Named Rules
**The No-Shadow Rule.** No drop shadows, glassmorphism, blur or gradient base surfaces. The only gradient is the legibility scrim on photo cards.

## Shapes

Near-square. Buttons and images 2px; everything else square. The signature is the 40px notch: top-left and bottom-right corners sliced via `clip-path: polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)`. Full rounding only on CircleIcon discs. Torn-paper PNG seams between bands (`TornPaperDivider`), one seam per transition.

## Components

### Buttons
- **Shape:** 2px corners, 2px border on every variant, Inter Bold 16px.
- **Primary:** red fill, white text, padding 16px 20px.
- **Hover / Focus:** filled to 90% opacity; outlined inverts to fill; active scales 0.97-0.99; 150ms.
- **Secondary:** red outline on light; white filled or outlined on red and black bands.

### Cards / Containers
- **Corner Style:** the 40px notch.
- **Background:** solid band colors, or a photo with a 10-75% black scrim.
- **Shadow Strategy:** none.

### Navigation
- Overlaid on the hero; the variant flips dark/light to stay legible (by design). Mega-menu has a 3px red top border.

### Eyebrow (signature)
A skewed (-8deg) red chip with the label counter-skewed level, once per section directly above the H2. The deliberate EKUZO exception to eyebrow bans.

### CircleIcon (signature)
A white glyph on a red disc, 72px desktop and 50px mobile, from `/public/icons`. Invert glyphs with `filter: brightness(0) invert(1)`; the `-white` files are `currentColor`.

## Do's and Don'ts

### Do:
- **Do** use pure black #000000 and off-white #EFEEED, nothing in between.
- **Do** keep one red primary action per view.
- **Do** reuse `TornPaperDivider`, `Eyebrow`, `Button`, `CircleIcon` from `components/`.

### Don't:
- **Don't** use Anton, or set Tungsten in mixed case.
- **Don't** use soft radii, shadows, gradients as surfaces, glass, or emoji.
- **Don't** stack two torn-paper seams on one transition.
- **Don't** put 70% white text on red (2.5:1).
- **Don't** refactor existing pages to match this file.
