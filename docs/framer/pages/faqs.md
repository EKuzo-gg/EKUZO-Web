# FAQs (/faqs)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: GdjvNe8DC
- **Tablet** (810px) — nodeId: UIMWKkV3Y
- **Phone** (390px) — nodeId: oecETMXFf

## SECTIONS (in order)

### 1. Hero
- **Background:** Black (`/Black/Black`)
- **Layout:** stack vertical, padding 360px top, 240px bottom
- **Key content:**
  - 2 text lines:
    - "parent" — `/Display/Heading 2`, 160px
    - "frequently asked questions" — `/Display/Heading 2`, 160px
  - Character image (absolute, 431×382px, centerX 50%, centerY 90%): `6CCAmYRYUfPHnNlyNyYEnNsuZek.png`
  - Bottom torn paper image (absolute, 100% width, centerY 104%): `eRLmpFY0JmRC1NgzhqXTqoQFw.png`
- **Decorative character images (absolute, outside hero but on page canvas):**
  - Left image (400×525px): `xsSBBU0yKk2g8Ma3fQ2f0lwLD7s.png`
  - Left image (717×944px): `qVIEfUJC9Yw7ggPCjVy3mwIvK88.png`
  - Right image (569×1143px): `yJwNtlYNJwjtAuaCgsRUNUU7CeI.png`

### 2. Safety & Coaching
- **Padding:** 188px top, 144px bottom
- **Max width:** 1232px
- **Layout:** 2-column horizontal, gap 120px, alignment start
  - Left (max-width 388px): Heading "Safety & Coaching" — `/Display/Heading 4`
  - Right: FAQ accordion component `E33B1To0_` (FaqSectionQuestionSafety), variant `umoTKF4iS`, XS4269JeT="1"
- Decorative image (absolute, centerX 22%, centerY 50% area): pattern from left column

### 3. Programs & Scheduling
- **Padding:** 144px top/bottom
- **Max width:** 1232px
- **Layout:** 2-column
  - Left: Heading "Programs & Scheduling"
  - Right: FAQ component `bWYqlYUpG` (FaqSectionQuestionProgram), variant `uUcg0qid5`, XS4269JeT="1"
- Decorative image (absolute, centerX 26%, centerY 59%): `c67QwH8aEvmwveRwBqZB8sc3FZQ.png`

### 4. Outcomes & Benefits
- **Padding:** 144px top/bottom
- **Max width:** 1232px
- **Layout:** 2-column
  - Left: Heading "Outcomes & Benefits"
  - Right: FAQ component `nSe7o8gij` (FaqSectionQuestionOutcomes), variant `H8HF4ZWz2`, XS4269JeT="1"

### 5. Cost & Value
- **Padding:** 144px top/bottom
- **Max width:** 1232px
- **Layout:** 2-column
  - Left: Heading "Cost & Value"
  - Right: FAQ component `nSe7o8gij` (FaqSectionQuestionOutcomes), variant `H8HF4ZWz2`, XS4269JeT="1"
  - NOTE: Same component (nSe7o8gij) as Outcomes & Benefits — may be an error or reuse

### 6. Enrollment & Next Steps
- **Padding:** 144px top, 188px bottom
- **Max width:** 1232px
- **Layout:** 2-column
  - Left: Heading "Enrollment & Next Steps"
  - Right: FAQ component `PQAPBF0g1` (FaqSectionQuestionEnrollment), variant `nfzVsOz8i`, XS4269JeT="1"

### 7. Footer Banner
- Component: `BNRkYbJEX` variant `QbZSddxCo`
- CTA: "Enroll into a transformational program today"

## COMPONENTS USED
- FaqSectionQuestionSafety (E33B1To0_) — safety FAQ accordion
- FaqSectionQuestionProgram (bWYqlYUpG) — program FAQ accordion
- FaqSectionQuestionOutcomes (nSe7o8gij) — outcomes FAQ accordion (used for BOTH outcomes and cost sections)
- FaqSectionQuestionEnrollment (PQAPBF0g1) — enrollment FAQ accordion
- FooterBannerSection (BNRkYbJEX)

## NOTES
- Hero uses black background — only black-hero page besides ekuzoteams pages
- Hero headline is 2 separate text nodes: "parent" and "frequently asked questions" — both H2 style. Lowercase intentional styling.
- FAQ content is CMS-driven via separate FAQ components per category (not a single shared component)
- "Cost & Value" section reuses nSe7o8gij (Outcomes component) — may be placeholder or intentional reuse. Check against CMS data.
- No Rive animation, no testimonial carousel on this page
- Three large decorative character illustrations positioned absolutely throughout the page for visual texture
- XS4269JeT="1" prop on all FAQ components — likely an item count or starting index
