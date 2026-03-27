# Home (/)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint, full sections documented below
- **Desktop** (1200px) — non-primary variant, nodeId: bZJlbjsU8
- **Tablet** (810px) — non-primary variant, nodeId: hEznlyHXe
- **Phone** (390px) — non-primary variant, nodeId: iGa5Ml5Dc

## SECTIONS (in order)

### 1. Hero
- **Background:** Red (`/Red/Red`)
- **Layout:** stack vertical, center/center
- **Padding:** 160px top, 400px bottom
- **Overflow:** hidden
- **Key content:**
  - Headline: "Every gamer deserves a team" — `/Display/Heading 1`, uppercase, Tungsten Narrow Black, 256px
  - Bird image (absolute, 332px×300px, centerX 50%, centerY 85%): `mTCs0FtqtFL4rBKT9vJmNrspxaQ.png`
  - Background image (absolute, 884px tall, full width, centerY 59%): `3pfk2nKVyde0gNwudyObxSp65Qs.png`
- **Components used:** White2 torn paper at bottom (absolute, 300px, centerY 102%)

### 2. Growth Through Play Section
- **Background:** `rgba(239, 238, 237, 1)` — off-white/light grey
- **Layout:** stack vertical, center/center
- **Padding:** 188px all sides, 104px horizontal
- **Max width content:** 1232px
- **Key content:**
  - Heading: "Growth through play" — `/Display/Heading 4`, Test Die Grotesk A Bold, 64px
  - Illustration image (left): `2Ams8p5lSZiYc2Fh969Nbt2T90w.png`
  - 3 list items (right, max-width 400px): "Structured practice" / "Skilled coaching" / "Real competition"
- **Assets:** Paper cut image at bottom absolute: `X2LXESaZcp5Pzug20TVOcINWnoM.png`

### 3. Ecosystem Animation Section
- **Background:** White
- **Layout:** stack vertical, 360vh height (scroll-pinned)
- **Padding:** 188px top/bottom
- **Key content:** Rive animation component (Home_schools.tsx / frGiDQi), position sticky top: 0
- **Components used:** Black2 torn paper at top (absolute, centerY 0%)
- **Rive file:** `ekuso_creative_web__brand__ecosystem_desktop_V02riv.riv`, artboard "Main - Desktop", scroll progress 0–1000 over 14000px scroll

### 4. How It Works (2 Ways)
- **Background:** Black (`rgba(0,0,0,1)`)
- **Layout:** stack vertical, gap 200px
- **Padding:** 188px top/bottom
- **Key content:**
  - Eyebrow: "HOW IT WORKS"
  - Heading: "2 ways to play and learn" — `/Display/Heading 4`
  - Body: "Students can join EKUZO from home or through school. Both formats build teamwork, coaching, and progress."
  - Watermark text: "LEARN + PLAY" (absolute, centerX 50%, centerY 45%, zIndex 1)
  - 2 cards (SCHOOL / HOME) — max-width 1022px, gap 32px
    - SCHOOL: "Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online." CTA: "Learn more about EKUZO100"
    - HOME: "Students join individually from home in a fully online format (during or after school)." CTA: "Learn more about home programs"
  - Button: "See programs" → `/programs`
- **Components used:** Black3 torn paper at top, Black2 torn paper at bottom

### 5. Testimonial Carousel
- **Background:** default (white)
- **Layout:** stack vertical, gap 56px
- **Padding:** 144px top/bottom, 104px horizontal
- **Max width:** 1022px
- **Key content:**
  - Heading: "What families are saying" — `/Display/Heading 4`
  - Slideshow: 640px tall, 3 items, direction left, autoplay off, gap 10
  - Featured quote: "It's structure, mentorship, and community all in one place." — `/Desktop Body/L/Bold`
  - Attribution: Rudy May (L/Medium), EKUZO mom (M/Regular)

### 6. Footer Banner
- Component: `BNRkYbJEX` variant `QbZSddxCo`
- CTA text: "Enroll into a transformational program today"
- Modal enabled: true

## COMPONENTS USED
- White2 (cllBPIiNd) — torn paper divider, white
- Black2 (VZgZ8tZvl) — torn paper divider, black
- Black3 (yEFYiUimY) — torn paper divider, black variant
- List (sCSPy3XNh) — checklist item
- Card (WSTEvGlIk) — program card, variant ACZa5hErJ (dark/outlined)
- Eyebrows (Z9OcG4X2A) — eyebrow label, variant ScOOJpHh1 (red)
- Button (G_7udIwcU) — CTA button, variant uoB38kCy0 (outlined)
- FooterBannerSection (BNRkYbJEX) — red CTA strip
- HomeDesktop Rive (frGiDQi) — ecosystem animation

## INTERACTIONS + ANIMATIONS
- **Ecosystem section:** Rive animation driven by scroll. `SCROLL_PX_FOR_FULL_PROGRESS = 14000`, `START_DELAY_PX = 650`. Sticky positioned within a 360vh container.
- **Testimonial slideshow:** Framer built-in Slideshow, 3 items, no autoplay, direction left

## NOTES
- Hero headline has a line break mid-word: "Every gamer" / "deserves a team" — likely rendered as two lines
- Page uses both White2 and Black2/Black3 torn paper variants for section transitions
- Testimonial quote shown below slideshow is a static hardcoded quote (not from CMS)
- Off-canvas elements visible in XML (Videos, Cards, Form, Ticker) are stashed design artifacts — not part of the published page layout
- Home uses `frGiDQi` (Home_schools.tsx, SCROLL_PX=14000), not the home ecosystem file (Eco_system.tsx, SCROLL_PX=10000) — counterintuitive naming
