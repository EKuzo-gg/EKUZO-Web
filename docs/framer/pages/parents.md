# Parents (/parents)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: J3MWjKAdD
- **Tablet** (810px) — nodeId: VAC4jsJ_r
- **Phone** (390px) — nodeId: NvJYwkcMo

## SECTIONS (in order)

### 1. Hero
- **Background:** No explicit background (default white)
- **Layout:** stack vertical, center/center
- **Padding:** 280px top
- **Key content:**
  - Headline: "Learn to Play. Play to Learn" — `/Display/Heading 2`, Tungsten Narrow Black, 160px
  - Hero image (below headline, full width): `Op4gAQ2IsHyHAG5SrG80zMh7CyU.png`
  - Bottom image overlay (absolute, bottom -20px): `sPovtH1WtPLdmZq2m11eRdUJYI.png` (torn paper / transition)

### 2. Our Approach / What is EKUZO?
- Component: `QsAFUtqlA` variant `sC1TmQc1L`
- **Props:**
  - Heading: "What is EKUZO?"
  - List items: "Structured practice" / "Skilled coaching" / "Growth through play"
  - Body: "It's natural for parents to feel tension around screen time... EKUZO leans into what students already love... Think sports, designed specifically for gamers. Instead of trying to control screen time, parents gain confidence in how it's being used."
  - Background: `rgb(239, 238, 237)` (light grey)
  - Showing image: true (mPMtJLurQ)
  - Extra section: true (Gp6avFGQM)

### 3. Features / Why Parents Choose EKUZO
- **Background image:** `SOAHKJMiRp98LmGcgMXipQOggw.png`
- **Overflow:** hidden
- **Padding:** 188px top/bottom
- **Key content:**
  - Large card (HowItWorksSection / J5646SU6d):
    - Heading: "Why parents choose EKUZO?"
    - Body: "Parents choose EKUZO because it turns gaming from a solo activity into a team experience that feels structured, social, and purposeful. Instead of managing screen time, parents see their kids showing up, engaging with teammates, and growing through play."
    - Background: `rgb(239, 238, 237)`
  - 3 feature cards (alternating left/right alignment):
    - "Safe and structured" — "Moderated spaces, trained coaches, and a positive culture."
    - "Motivating by design" — "Students gain visible wins that build intrinsic motivation."
    - "Skills that last" — "Communication, leadership, and resilience carry far beyond gaming."

### 4. Programs Section
- Component: `QVJuYtM47` variant `xZ55PUzBl`
- Shows all 3 programs

### 5. Ecosystem Animation Section
- **Background:** Light Grey (`/Grey/Light Grey`)
- **Height:** 360vh
- **Padding:** 188px top/bottom
- Component: `frGiDQi` (Home_schools.tsx), sticky top: 0
- **Components used:** Black2 torn paper at top

### 6. What Parents See In Their Kids
- **Background:** White (`rgba(255,255,255,1)`)
- **Layout:** stack vertical, gap 72px
- **Padding:** 188px top/bottom
- **Key content:**
  - Eyebrow: "HOW IT WORKS"
  - Heading: "What parents see in their kids" — `/Display/Heading 4`
  - Ticker (horizontal scroll) with 4 cards:
    - "Growing confidence" — "Kids speak up more, try harder things, and recover faster from setbacks."
    - "Better communication" — "Team play translates into clearer communication at home and at school."
    - "Motivation that sticks" — "Parents notice fewer battles around participation."
    - "Real connections" — "Kids talk about teammates by name and start looking forward to showing up."
  - Button: "See programs" → `/programs`, variant `GhxtFePFm` (outlined black)

### 7. Testimonial Carousel
- **Padding:** 144px top/bottom, 104px horizontal
- **Heading:** "What parents are saying"
- Slideshow 640px, 3 items

### 8. Blog Section
- **Layout:** stack vertical, padding 188px 40px
- **Max width:** 1232px
- **Key content:**
  - Left panel (red, 64% width): "Stories of Growth and Gaming" heading + decorative diamonds at corners
  - Right panel (red): "Explore how esports becomes a tool for learning, connection, and purpose." + chicken illustration
  - Feature blog post card (399px tall): links to `/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng`
    - Background: `gWpXw5tP65onfWnJW7bPW1HEo4.jpg`
    - Blog post title: "Our Family's Esports Journey with EKUZO and the K1ng"
    - Excerpt: "My son Ryan was always a happy kid in his early years."

### 9. FAQs + Footer Banner
- FaqSection (`x3eHpc90M`, variant `mlurInN15`)
- FooterBannerSection (`BNRkYbJEX`, variant `QbZSddxCo`)
- CTA: "Enroll into a transformational program today"

## COMPONENTS USED
- OurApproachSection (QsAFUtqlA)
- HowItWorksSectionLargeCard (J5646SU6d)
- Card/iop5RYIDR — feature cards (alternating zigzag layout)
- ProgramsSection (QVJuYtM47)
- HomeDesktop Rive (frGiDQi)
- Card/mTrbgx1O_ — ticker cards
- Eyebrows (Z9OcG4X2A)
- Button (G_7udIwcU)
- Black2 (VZgZ8tZvl) — torn paper
- FaqSection (x3eHpc90M)
- FooterBannerSection (BNRkYbJEX)

## INTERACTIONS + ANIMATIONS
- Ecosystem: scroll-driven Rive (frGiDQi)
- Ticker: horizontal scrolling card strip (CSS overflow)
- Features: zigzag card layout (alternating end/start distribution)

## NOTES
- Hero has no red background — it's white/neutral, unlike home and programs
- Blog section on parents page is hardcoded to a specific blog post slug
- Feature cards (iop5RYIDR) use zigzag layout: odd rows align end, even rows align start
- Ticker cards use Card/mTrbgx1O_ variant DDIXV3F3Z with bg rgb(239,238,237)
