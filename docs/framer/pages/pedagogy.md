# Pedagogy (/pedagogy)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: M0GhwX1CN
- **Tablet** (810px) — nodeId: WRAgnxpH4
- **Phone** (390px) — nodeId: CMGxRKNcd

## SECTIONS (in order)

### 1. Hero
- **Background:** White (`rgba(255,255,255,1)`)
- **Layout:** stack horizontal, gap 80px
- **Padding:** 188px top/bottom
- **2-column layout (max-width 1232px, padding 40px horizontal):**
  - **Left column:**
    - Headline: "Pedagogy of gaming" — `/Display/Heading 2`, 160px
    - Body: "Why games are the best teachers most students already know."
    - CTA Button: "Start a conversation" — variant `GhxtFePFm` (outlined black)
  - **Right column:**
    - Video player (711px tall): `https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4`
    - Settings: loop true, controls true, muted false, volume 25%, poster enabled, not autoplay
- **Decorative assets (absolute):**
  - Left image (740×700px, bottom-left): `dxmK8k0CBzTITNxXNTzWTuu1Pwc.png`
  - Right image (full height, right 0): `fbnEUYY1V7fVTnX4Nq3eCqpQ.png`
  - Paper cut (absolute, bottom, 300px tall): `8aXKGdobnlhGV66LFUcbTboN6xg.png`

### 2. Why Games Work as Learning Systems
- **Background:** Light Grey (`/Grey/Light Grey`)
- **Padding:** 144px top, 240px bottom
- **Key content:**
  - Large card (J5646SU6d):
    - Heading: "Why games work as learning systems?"
    - Body: "Every great game is a learning environment. Players stay engaged because they're motivated, supported, and challenged just enough to grow - the same best practices that drive effective classrooms."
    - Background: `rgb(255, 255, 255)`
  - Decorative circles: left circle 1697×1561px, right circle 912×1884px (same as Schools page)
  - 4 feature cards (zigzag alternating layout):
    - "Inclusion" — "A team for students who've never had one."
    - "Engagement" — "Practices and matches keep students present and energized."
    - "Attendance" — "Programs become a reason to show up."
    - "Future-ready skills" — "Leadership, communication, and resilience built in a setting students actually care about."

### 3. Testimonials
- Component: `yY5pfBKjH` variant `cQaERloUl`
- Quote: "Our job isn't to add pedagogy to games; it's to help students see it, use it, and carry that mindset into school, careers, and life"
- Attribution: Karlin Oei

### 4. The Ten Pillars of EKUZO Pedagogy
- **Background:** Black (`rgba(0,0,0,1)`)
- **Overflow:** hidden
- **Padding:** 188px top/bottom
- **Max width:** 1232px, padding 40px horizontal
- **Key content:**
  - Heading: "The ten pillars of EKUZO pedagogy" — `/Display/Heading 4`
  - Body (right column): "Why games are the best teachers most students already know."
  - 10 pillars in 4 columns (TenPillarsSectionCard / jpjISij1R):
    - Col 1: "Motivation" — "Small wins spark big change." / "Correct Difficulty" — "Challenge tuned to ability keeps learners in flow."
    - Col 2: "Coaching" — "Feedback turns practice into progress." / "Social Learning" — "Teams teach teamwork better than lectures." / "Mastery" — "You can't level up until you've learned."
    - Col 3: "Intentional Play" — "Fun is a feature, not a distraction." / "Problem-Based Learning" — "Every match is a problem to solve."
    - Col 4: "Experimentation & Feedback" — "Try, fail, adjust, repeat." / "Student Agency" — "Ownership fuels motivation and growth." / "Cognitive Load" — "Clear fundamentals unlock creativity."

### 5. Footer Banner
- Component: `IwVl9EEIz` variant `A0K7BT6qA` (different component from other pages!)
- Modal: enabled (cPGpkizEV=true)

## COMPONENTS USED
- Button (G_7udIwcU) — "Start a conversation" CTA
- HowItWorksSectionLargeCard (J5646SU6d) — large feature card
- Card/iop5RYIDR — feature cards
- TestimonialsSection (yY5pfBKjH) — large quote section
- TenPillarsSectionCard (jpjISij1R) — individual pillar cards
- FooterBannerSection (IwVl9EEIz) — note: different footer component than other pages

## INTERACTIONS + ANIMATIONS
- NO Ecosystem Rive animation on this page
- Video in hero is manually controlled (not autoplay), with controls and sound

## NOTES
- Only page with a video in the hero section (Framer native Video component)
- Only page without the Ecosystem Rive section
- Uses IwVl9EEIz for FooterBanner instead of BNRkYbJEX — likely has different styling/variant
- Ten Pillars layout: 4 columns, uneven distribution (2/3/2/3 cards)
- "Social Learning" has a leading space in the prop: " Social Learning" — flag for Next.js build
- "Student Agency" prop value starts with space: " Ownership fuels..." — flag for Next.js build
- Feature cards use same zigzag pattern as Schools page (alternating end/start row distribution)
