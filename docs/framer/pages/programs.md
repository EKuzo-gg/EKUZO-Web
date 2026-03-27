# Programs (/programs)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: L2AuZMtkV
- **Tablet** (810px) — nodeId: ajLZ1Ml3b
- **Phone** (390px) — nodeId: YFgBt4EZK

## SECTIONS (in order)

### 1. Hero
- **Background:** Red (`/Red/Red`)
- **Layout:** stack vertical, center/center
- **Padding:** 360px top/bottom
- **Key content:**
  - Rive animation embedded directly (NOT code component): artboard "Main - Desktop", state machine "State Machine 1", autoplay true, autoBind true, handleEvents true
  - Rive file: `https://framerusercontent.com/assets/D693XtxMBjnOWB0t8DkBPKck.riv`
  - NOTE: No visible text headline in hero — animation is the full-bleed hero
- **Components used:** White2 torn paper (absolute, width 100%, centerY 10%)

### 2. Our Approach Section
- Component: `QsAFUtqlA` variant `sC1TmQc1L`
- **Props:**
  - Heading: "Built for growth, on and off the screen"
  - List items: "Structured practice" / "Skilled coaching" / "Growth through play"
  - Body: "Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."
  - Background: white (rgb(255,255,255))
  - Showing image: true (mPMtJLurQ)

### 3. Programs Section
- Component: `QVJuYtM47` variant `xZ55PUzBl`
- Shows all 3 programs (hK16UEwE3=true, q5dQx7YIm=true, TFkM3R0rj=true)

### 4. How It Works (Two Ways)
- **Background:** Black
- **Layout:** stack vertical, gap 200px, padding 188px
- **Key content:**
  - Eyebrow: "HOW IT WORKS"
  - Heading: "Two ways to participate"
  - Body: "Students join the same EKUZO experience, either through their school or from home."
  - Watermark: "LEARN + PLAY" (absolute, centerX 50%, centerY 48%)
  - 2 cards:
    - SCHOOL: "For schools" → `/schools`
    - HOME: "For families" → `/parents`
- **Components used:** White2 torn paper at top, Black2 torn paper at bottom

### 5. Ecosystem Animation Section
- **Background:** Light Grey (`/Grey/Light Grey`)
- **Height:** 360vh (scroll-pinned)
- **Padding:** 188px top/bottom
- Component: `frGiDQi` (Home_schools.tsx), sticky top: 0
- **Components used:** Black2 torn paper at top, White2 torn paper at bottom

### 6. Testimonial Carousel
- **Background:** White
- **Padding:** 144px top/bottom, 104px horizontal
- **Max width:** 1120px
- **Key content:**
  - Heading: "Real stories from EKUZO families"
  - Slideshow: 640px tall, 3 items, direction left, alignment center
  - Featured quote: "It's structure, mentorship, and community all in one place." — Rudy May, EKUZO mom

### 7. FAQs + Footer Banner
- FaqSection component (`x3eHpc90M`, variant `mlurInN15`)
- FooterBannerSection (`BNRkYbJEX`, variant `QbZSddxCo`)
- CTA text: "Enroll into a transformational program today"

## COMPONENTS USED
- OurApproachSection (QsAFUtqlA) — approach/value props section
- ProgramsSection (QVJuYtM47) — all 3 programs
- Card (WSTEvGlIk) — SCHOOL/HOME format cards
- Eyebrows (Z9OcG4X2A) — red eyebrow labels
- White2 (cllBPIiNd) / Black2 (VZgZ8tZvl) — torn paper dividers
- HomeDesktop Rive (frGiDQi) — ecosystem animation
- FaqSection (x3eHpc90M)
- FooterBannerSection (BNRkYbJEX)

## INTERACTIONS + ANIMATIONS
- Hero: Framer-native Rive embed (not code component), autoplay, handles events, touch scroll enabled
- Ecosystem: Same scroll-driven Rive as other pages (frGiDQi / Home_schools.tsx)

## NOTES
- Programs hero uses a different Rive file than the ecosystem section (D693XtxMBjnOWB0t8DkBPKck.riv vs ecosystem .riv)
- HeaderTrigger (1px white bar) placed after Hero — likely used for nav color change on scroll
- SCHOOL/HOME cards on this page link to /schools and /parents (unlike home page which has no links)
