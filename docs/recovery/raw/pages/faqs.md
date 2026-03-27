# FAQs (/faqs) — Live Site Capture
Captured: 2026-03-25 | URL: ekuzo.gg/faqs | Scroll height: ~6569px

---

## Section Order

1. Hero (black bg, staggered typography + collage)
2. FAQ Content Sections (white bg, 5 categories with accordion items)
3. Footer Banner + Footer

---

## Section 1: Hero

**Background:** Black `rgba(0, 0, 0, 1)`
**Nav:** Black bg — EKUZO white wordmark, nav links, "Start a conversation" white outline button

### Typography treatment (staggered, 3-line composition)
- Line 1: "PARENT" — Tungsten, very large (~200px), WHITE, left-aligned
- Line 2: "FREQUENTLY ASKED" — Tungsten, very large, GREY (dark grey, lower contrast), center/right
- Line 3: "QUESTIONS" — Tungsten, very large, GREY, far right

This creates an editorial stagger effect — white/black contrast on first word, grey fade for rest.

### Visual
- B&W photo collage: esports players at gaming stations, with red torn-paper fragments overlaid
- Image positioned mid-composition, behind/between text lines

### Divider
- White torn-paper at bottom of hero (black → white transition)

---

## Section 2: FAQ Content

**Background:** White
**Layout:** 2-column per category — category heading left (~40%), accordion items right (~60%)
**Max-width:** ~1232px centered

### Category structure
Each category:
- Left column: Large bold heading (H-style, ~40–48px, black)
- Right column: Stack of accordion items with horizontal dividers
- Each accordion item: grey circle chevron (↓) + question text + divider line

### 5 Categories with Questions

**1. Safety & Coaching**
- Is this safe for beginners?
- How do you keep online spaces safe?
- Who are the coaches?

**2. Programs & Scheduling**
- When are practices held?
- How are teams formed?
- What are Camps?
- What's the difference between After-School and School Teams?
- What is EKUZO100?

**3. Outcomes & Benefits**
- What about college or careers?
- How does this help with school?
- What outcomes should I expect?

**4. Cost & Value**
- What about college or careers?
- How does this help with school?
- What outcomes should I expect?

*(Note: Categories 3 and 4 appear to share question text — may be CMS display issue or questions are assigned to multiple categories)*

**5. Next Steps**
- What happens after E100?
- How do I enroll?

### Accordion behavior
- Default: all collapsed
- Expand: content reveals below question line
- Chevron rotates (↑) when expanded
- No "See more FAQs" button (unlike the inline FAQ on other pages) — this is the full page

### Decorative elements between categories
- Black ink birds-in-flight illustration (left side, ~200px)
- Black ink circle/ring arc (right side)
- Black ink swoosh-arrow marks

---

## Footer Banner

Standard variant: "Enroll into a transformational program today"
- CTA: "Start a conversation" (white outline on red)
- Standard B&W cutout figures

---

## Key Design Notes

- Hero typography stagger is unique on this page — white + grey layered Tungsten
- Category headings are conversational labels: "Safety & Coaching", "Programs & Scheduling", "Outcomes & Benefits", "Cost & Value", "Next Steps" — not bureaucratic
- FAQ content data sourced from Framer CMS (16 total items across 5 categories)
- Accordion items use grey circle chevron (same component as inline FAQ sections on other pages)
- Page title uses "PARENT" as audience framing — FAQ is currently written for parents, not schools
- Full FAQ answer content is in `/docs/recovery/raw/cms.md`

---

## Breakpoints

- DesktopLarge: 1920px
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
