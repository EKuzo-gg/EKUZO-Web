# Homepage (/) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: augiA20Il | Canvas width: 1920px

---

## Section Order

1. Hero
2. Growth Through Play
3. Ecosystem (scroll-animated Rive section)
4. How It Works
5. Testimonial Carousel
6. Footer Banner

---

## Section 1: Hero

**Background:** Red (`rgb(249, 37, 36)`)
**Padding:** 160px top, 400px bottom
**Layout:** vertical stack, centered

### Copy
- **H1:** "Every gamer deserves a team"
  - Style: `/Display/Heading 1` = Tungsten Narrow Black, 256px, 228px line-height, uppercase

### Visual elements
- Bird illustration (absolute): 332×300px, centered at 50% X, 85% Y — `/images/mTCs0FtqtFL4rBKT9vJmNrspxaQ.png`
- Full-bleed background image (absolute): 884px tall, spans full width, centered at 59% Y — `/images/3pfk2nKVyde0gNwudyObxSp65Qs.png` (brush art / hero image)
- White torn-paper divider (absolute): 300px tall, bottom of section, at 102% Y — `White2` component (cllBPIiNd)

### CTAs
- None directly in hero — no button visible

---

## Section 2: Growth Through Play

**Background:** Off-white `rgba(239, 238, 237, 1)`
**Padding:** 188px all sides
**Max-width container:** 1232px, centered

### Copy
- **H4:** "Growth through play"
  - Style: `/Display/Heading 4` = Test Die Grotesk A Bold, 64px
- **Bullet list (3 items):**
  1. Structured practice
  2. Skilled coaching
  3. Real competition
  - Uses `List` component (sCSPy3XNh)

### Layout
- Horizontal split: illustration left (1fr), text + list right (max 400px)
- Gap between columns: 90px
- Illustration: full-width image `/images/2Ams8p5lSZiYc2Fh969Nbt2T90w.png`

### Dividers
- White torn-paper at top: 300px, -3% Y (overlapping Hero)
- Paper cut at bottom: 300px, 105% Y — `/images/X2LXESaZcp5Pzug20TVOcINWnoM.png`

---

## Section 3: Ecosystem (Rive Animation)

**Background:** White
**Height:** 360vh (very tall — scroll-linked)
**Padding:** 188px top/bottom
**Behavior:** Sticky scroll — `HomeDesktop` component (Rive code component `frGiDQi`) stays fixed while page scrolls

### Notes
- This is a Rive animation scroll-linked to page scroll
- Black torn-paper divider at top (0% Y)
- No copy in this section — purely visual/animated
- Shows the "EKUZO 5" ecosystem animation

---

## Section 4: How It Works

**Background:** Black `rgba(0, 0, 0, 1)`
**Padding:** 188px top/bottom
**Gap between sub-sections:** 200px
**Layout:** vertical stack, centered

### Copy
- **Eyebrow:** "HOW IT WORKS" (white, small caps style)
- **H4:** "2 ways to play and learn"
  - Style: `/Display/Heading 4`
- **Body:** "Students can join EKUZO from home or through school. Both formats build teamwork, coaching, and progress."
  - Style: `/Desktop Body/M/Regular` = 24px, 34px line-height
- **Watermark text (absolute, decorative):** "LEARN + PLAY" at center/45% Y, zIndex 1

### Cards (horizontal, 2 cards, max 1022px wide, gap 32px)
1. **SCHOOL card**
   - Variant: ACZa5hErJ
   - Body: "Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online."
   - CTA: "Learn more about EKUZO100"
2. **HOME card**
   - Body: "Students join individually from home in a fully online format (during or after school)."
   - CTA: "Learn more about home programs"

### CTA
- Button: "See programs" → `/programs`
- Variant: `uoB38kCy0` (white outlined or similar)

### Dividers
- Black torn-paper at top (-1% Y): `Black3` component
- Black torn-paper at bottom (101% Y): `Black2` component

---

## Section 5: Testimonial Carousel

**Background:** Default (white/light)
**Padding:** 144px top/bottom, 104px left/right
**Gap:** 56px between sub-elements

### Copy
- **H4:** "What families are saying"
  - Style: `/Display/Heading 4`
- **Pull quote:** "It's structure, mentorship, and community all in one place."
  - Style: `/Desktop Body/L/Bold` = 28px bold
- **Attribution:** "Rudy May" (Medium) + "EKUZO mom" (Regular)

### Slideshow
- 3 items visible at once
- Drag disabled, auto-play disabled in this variant
- Direction: left
- Height: 640px
- Video cards from CMS (9 videos total)

### Visual
- Small logo/icon image: 46×52px — `/images/1u1wVfJGMqlorzMobO7lsxwbyo.png` (likely EKUZO bird logo)

---

## Section 6: Footer Banner

- Component: `BNRkYbJEX` (FooterBannerSection)
- Copy: **"Enroll into a transformational program today"**
- Variant: `QbZSddxCo`
- CTA visible: true (`kylqqg5uj="true"`)

---

## Off-Canvas Elements (unused/draft — NOT in live page flow)

These exist in the Framer canvas but are not part of the page layout:

- **4 Card components** (absolute, negative X positions): Motivation, Feedback loops, Social learning, Skills development — draft content
- **Form** (815×fit-content): Appears to be a draft contact/enrollment form
- **9 Video nodes** (330×640 each): Individual video card instances off-canvas
- **Ticker**: Horizontal scrolling ticker, off-canvas
- **4 Stack nodes** (520px height): Positioned off-canvas at negative left positions

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px

---

## Key Design Notes

- Heading 1 is enormous (256px) — "Every gamer deserves a team" fills full width
- Ecosystem section is 360vh — very scroll-heavy; may want to reconsider or simplify in rebuild
- No hero CTA button — unusual for a marketing homepage
- Testimonial section has a hardcoded pull quote (Rudy May) separate from the video carousel
- Torn-paper dividers used at EVERY section transition
- Black section (How It Works) breaks up the light sections — strong visual rhythm
- Footer banner is a reusable component across all pages
