# Parents (/parents) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: duNUzONol | Canvas width: 1920px

---

## Section Order

1. Hero (light bg, H2, hero image)
2. Our Approach Section ("What is EKUZO?")
3. Features (background image, large card + 3 staggered cards)
4. Programs Section (all 3)
5. Ecosystem (Rive, light grey)
6. "What parents see in their kids" (ticker cards)
7. Testimonial Carousel
8. Blog Section (featured post)
9. FAQ + Footer Banner

---

## Section 1: Hero

**Background:** No explicit color (white default)
**Padding:** 280px top only (no bottom padding — image fills)
**Layout:** vertical stack, centered

### Copy
- **H2:** "Learn to Play. Play to Learn"
  - Style: `/Display/Heading 2` = Tungsten Narrow Black, 160px, 140px line-height, uppercase, letter-spacing 3.2px
  - Smaller than homepage H1 (256px) — different scale

### Visual elements
- Hero image (full-width, fit-image): `https://framerusercontent.com/images/Op4gAQ2IsHyHAG5SrG80zMh7CyU.png`
  - Stacks directly below headline text
- Torn paper overlay (absolute, full-width, bottom: -20px, zIndex 1): `https://framerusercontent.com/images/sPovtH1WtPLdmZq2m11eRdUJYI.png`
  - Creates transition into next section

### Note
- No CTA in hero
- No red background — this page opens lighter/softer than other pages

---

## Section 2: Our Approach Section

**Component:** `QsAFUtqlA`
**Background:** Off-white `rgb(239, 238, 237)`

### Copy
- **H4:** "What is EKUZO?"
- **List items (3):**
  1. Structured practice
  2. Skilled coaching
  3. Growth through play
- **Body (multi-paragraph):**
  > "It's natural for parents to feel tension around screen time, especially when it feels unstructured, unsupervised, or hard to trust.
  >
  > EKUZO leans into what students already love. We take their natural motivation for gaming and build a complete, coach-led system around it. Think sports, designed specifically for gamers.
  >
  > Instead of trying to control screen time, parents gain confidence in how it's being used."

### Props
- `Gp6avFGQM="true"` (different from programs page which had false — some visual variant)
- `mPMtJLurQ="true"`
- `F1I0qLdoM="false"`
- `SjYqLdMEP="false"`

### Note
- Copy directly addresses parent anxiety about screen time — empathetic framing
- "Think sports, designed specifically for gamers" — key brand line

---

## Section 3: Features

**Background:** Image — `https://framerusercontent.com/images/SOAHKJMiRp98LmGcgMXipQOggw.png` (likely brush art / textured)
**Padding:** 188px top/bottom

### Large Card (top)
- **Component:** `J5646SU6d` (HowItWorksSectionLargeCard)
- **Headline:** "Why parents choose EKUZO?"
- **Body:** "Parents choose EKUZO because it turns gaming from a solo activity into a team experience that feels structured, social, and purposeful. Instead of managing screen time, parents see their kids showing up, engaging with teammates, and growing through play."
- **Background:** `rgb(239, 238, 237)`

### 3 Feature Cards (staggered layout)
Layout alternates: right-aligned → left-aligned → right-aligned
Max width: 1021px per row, gap 26px

1. **"Safe and structured"** (right-aligned)
   - "Moderated spaces, trained coaches, and a positive culture."
   - Component: `iop5RYIDR` variant `l_51U7a4c`
   - bg: `rgb(239, 238, 237)`

2. **"Motivating by design"** (left-aligned)
   - "Students gain visible wins that build intrinsic motivation."

3. **"Skills that last"** (right-aligned)
   - "Communication, leadership, and resilience carry far beyond gaming."

### Note
- Staggered card layout (alternating justify-content: end / start) is unique to this page
- Framer background image behind entire section adds texture

---

## Section 4: Programs Section

**Component:** `QVJuYtM47`
- All 3 programs visible: `hK16UEwE3="true"`, `q5dQx7YIm="true"`, `TFkM3R0rj="true"`

---

## Section 5: Ecosystem

**Background:** Light Grey (`/Grey/Light Grey`)
**Height:** 360vh — same Rive sticky scroll
**Rive component:** `frGiDQi`

---

## Section 6: What Parents See in Their Kids

**Background:** White `rgba(255, 255, 255, 1)`
**Padding:** 188px top/bottom
**Gap:** 72px

### Copy
- **Eyebrow:** "HOW IT WORKS"
- **H4:** "What parents see in their kids"
- **Button:** "See programs" → `/programs`

### Ticker (horizontal scroll, 4 cards, height 452px each)
Cards are light grey (`rgb(239, 238, 237)`), width 160px (card prop), borderRadius 10px

1. **"Growing confidence"**
   - "Kids speak up more, try harder things, and recover faster from setbacks."
2. **"Better communication"**
   - "Team play translates into clearer communication at home and at school."
3. **"Motivation that sticks"**
   - "Parents notice fewer battles around participation."
4. **"Real connections"**
   - "Kids talk about teammates by name and start looking forward to showing up."

### Note
- Ticker = horizontal scrolling card strip
- These are outcome cards written specifically for parent concerns
- "See programs" button variant `GhxtFePFm` (likely red-filled)

---

## Section 7: Testimonial Carousel

**Background:** White
**Padding:** 144px top/bottom, 104px left/right

### Copy
- **H4:** "What parents are saying"
  - (vs "What families are saying" on homepage, "Real stories from EKUZO families" on programs)
- **Pull quote:** "It's structure, mentorship, and community all in one place."
- **Attribution:** Rudy May / EKUZO mom

---

## Section 8: Blog Section

**Padding:** 188px top/bottom, 40px sides
**Max-width:** 1232px

### Header Block (left 64% / right 36%, both Red bg)
Left panel:
- **H4:** "Stories of Growth and Gaming"
- bg: Red, padding 80px 160px 196px 80px
- Diamond cutout corners (80×80px white rotated squares, absolute, at top-left and bottom-right)

Right panel:
- **Body:** "Explore how esports becomes a tool for learning, connection, and purpose."
- Style: `/Desktop Body/L/Regular`
- Bird illustration (absolute, 135×164px): `https://framerusercontent.com/images/bEJjMvkURhb7lziHBNuEvuTyDI.png`

### Featured Blog Post Card (links to blog post)
- **Link:** `/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng`
- **Height:** 399px
- **Background:** Hero image `https://framerusercontent.com/images/gWpXw5tP65onfWnJW7bPW1HEo4.jpg`
- Left overlay panel (443.5px wide, brush art bg, Red accent bar):
  - **Eyebrow:** "BLOG"
  - **H5:** "Our Family's Esports Journey with EKUZO and the K1ng"
  - **Excerpt:** "My son Ryan was always a happy kid in his early years."
  - Diamond cutout corner at top-left
- Right panel: full-bleed image `https://framerusercontent.com/images/1gEH23EWXgGMccNNWVnmKEEFykw.jpg`
  - Diamond cutout corner at bottom-right

### Visual Notes
- Diamond corners = white 80×80 squares, rotated -45°, positioned to clip corners (creates a geometric cut effect)
- This is a complex card layout — likely simplify in rebuild

---

## Section 9: FAQ + Footer Banner

- FAQ: `x3eHpc90M` variant `mlurInN15`
- Footer Banner: "Enroll into a transformational program today"
- Padding: 144px top

---

## Key Design Notes

- Parents page is the most copy-dense page — addresses parent objections directly
- Opens softer (no red hero bg) — intentional, less aggressive to this audience
- H2 headline (not H1) — more intimate scale
- Screen time tension addressed in first body section — smart sequencing
- Blog section is unique to this page in Framer — promotes the K1ng case study story
- Ticker cards are parent-specific outcomes (confidence, communication, motivation, connections)
- Diamond corner cuts are a decorative motif used in the blog card
- Staggered feature card layout alternates L/R — adds visual movement

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
