# Programs (/programs) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: hsGVu9apR | Canvas width: 1920px

---

## Section Order

1. Hero (Rive animation, no text)
2. Our Approach Section
3. Programs Section (all 3 programs)
4. How It Works (black)
5. Ecosystem (Rive, light grey bg)
6. Testimonial Carousel
7. FAQ Section
8. Footer Banner

---

## Section 1: Hero

**Background:** Red (`/Red/Red`)
**Padding:** 360px top/bottom (taller than homepage hero)
**Layout:** vertical stack, centered

### Copy
- NONE — hero is purely visual/animated

### Visual
- Full-bleed Rive animation: `ekuzo-creative-web-brand-programs-hero.riv`
  - URL: https://framerusercontent.com/assets/D693XtxMBjnOWB0t8DkBPKck.riv
  - Artboard: "Main - Desktop"
  - State Machine: "State Machine 1"
  - Autoplay: true
  - Fit: contain, centered
- No headline text layered over animation

### Note
- This is a significant design choice — hero has zero copy. The Rive animation IS the hero.
- White torn-paper divider at 10% Y (absolute, overlapping below hero)

---

## Section 2: Our Approach Section

**Component:** `QsAFUtqlA` (OurApproachSection)
**Background:** white (`MNAoijZOD="rgb(255, 255, 255)"`)

### Copy
- **H4:** "Built for growth, on and off the screen"
- **List items (3):**
  1. Structured practice
  2. Skilled coaching
  3. Growth through play
- **Body:** "Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."

### Props
- `F1I0qLdoM="false"` (some toggle)
- `mPMtJLurQ="true"`
- `Gp6avFGQM="false"`
- `SjYqLdMEP="false"`

---

## Section 3: Programs Section

**Component:** `QVJuYtM47` (ProgramsSection)
**Variant:** `xZ55PUzBl`

### Props (all 3 programs visible)
- `hK16UEwE3="true"` — program 1 visible
- `q5dQx7YIm="true"` — program 2 visible
- `TFkM3R0rj="true"` — program 3 visible

### Note
- This is a shared component — need to pull its XML separately to see the 3 program cards and their copy
- All 3 programs shown: EKUZO100, EKUZOTeams, EKUZOCamps

---

## Section 4: How It Works (Black)

**Background:** Black `rgba(0, 0, 0, 1)`
**Padding:** 188px top/bottom
**Gap:** 200px between sub-sections

### Copy
- **Eyebrow:** "HOW IT WORKS"
- **H4:** "Two ways to participate"
  - (Slightly different wording from homepage: "2 ways to play and learn" vs "Two ways to participate")
- **Body:** "Students join the same EKUZO experience, either through their school or from home."
- **Decorative watermark (absolute):** "LEARN + PLAY" at center/48% Y

### Cards (2 cards, max 1022px, gap 32px)
1. **SCHOOL card**
   - Body: "Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online."
   - CTA: "For schools" → `/schools`
   - Link enabled: `xIB2J6CN_="true"`
2. **HOME card**
   - Body: "Students join individually from home in a fully online format (during or after school)."
   - CTA: "For families" → `/parents`
   - Link enabled: `xIB2J6CN_="true"`

### Dividers
- White torn-paper at top (-170px): `White2`
- Black torn-paper at bottom (99% Y): `Black2` variant `y1rla24pj`

---

## Section 5: Ecosystem (Rive Animation)

**Background:** Light Grey (`/Grey/Light Grey` = `rgb(239, 238, 237)`)
**Height:** 360vh
**Sticky scroll:** same Rive animation as homepage

### Dividers
- Black torn-paper at top (0% Y)
- White torn-paper at bottom (-157px)

### Note
- Same Rive animation component (`frGiDQi`) used on both home and programs
- Different background color: homepage = white, programs = light grey

---

## Section 6: Testimonial Carousel

**Background:** White `rgba(255, 255, 255, 1)`
**Padding:** 144px top/bottom, 104px left/right
**Max-width container:** 1120px (vs 1022px on homepage)

### Copy
- **H4:** "Real stories from EKUZO families"
  - (Different from homepage: "What families are saying")
- **Pull quote:** "It's structure, mentorship, and community all in one place."
  - Style: `/Desktop Body/L/Bold`
- **Attribution:** Rudy May (Medium) / EKUZO mom (Regular)

### Slideshow
- Same config: 3 visible, 640px height, autoplay off, drag off, direction left
- Center alignment (vs flex-start on homepage)

---

## Section 7: FAQ Section

**Component:** `x3eHpc90M` (FaqSection)
**Variant:** `mlurInN15`
**Padding:** 144px top (no bottom padding before footer banner)

---

## Section 8: Footer Banner

- Copy: "Enroll into a transformational program today"
- CTA visible: true

---

## Off-Canvas Elements (unused/draft)

- 3x VideoPopup components (480×640)
- 9x Videos nodes (330×640)

---

## Key Differences vs Homepage

| Element | Homepage | Programs |
|---------|----------|----------|
| Hero copy | "Every gamer deserves a team" (H1) | None — Rive animation only |
| Hero Rive | No | Yes (programs-specific .riv) |
| Hero padding | 160px/400px | 360px/360px (symmetrical) |
| Ecosystem bg | White | Light Grey |
| Testimonial heading | "What families are saying" | "Real stories from EKUZO families" |
| Testimonial slideshow align | flex-start | center |
| Extra sections | None after testimonials | FAQ + Footer Banner |
| How It Works CTA | "See programs" button | Cards with links to /schools and /parents |

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
