# EKUZO100 (/ekuzo100) — Raw Framer Extraction + Live Site Capture
Extracted: 2026-03-25 | Framer nodeId: IACUTKl5t | Canvas width: 1920px
Live screenshots captured at ~1640px CSS viewport (hardware constrained)

## NOTE ON TWO FRAMER PATHS
- `/ekuzo100` (IACUTKl5t) — **this file** — full marketing page ✓
- `/ekuzo100-4-week-intro` (lUz6fAJxV) — old form shell only, no marketing content

Breakpoint variants (Desktop/Tablet/Phone) inherit from DesktopLarge — empty in Framer XML, rendered live via component CSS.

---

## Section Order

1. Hero (white bg, horizontal split, copy left / video right)
2. Our Approach (white bg, "Built for growth, on and off the screen")
3. Ecosystem (light grey, sticky Rive — 3 animation states)
4. How It Works (white bg, large card + 4 staggered numbered steps)
5. Testimonial Carousel (light grey bg, video carousel + pull quote)
6. What Happens After EKUZO100 (white bg, 2-col layout)
7. FAQ (black bg) + Footer Banner (red bg)
8. Footer (white bg)

---

## Persistent UI: Sticky CTA Bar

Present at all scroll positions at bottom of viewport:
- Full-width red bar (`rgb(249, 37, 36)`)
- White text: "Enroll my gamer"
- Sits above main content, below nav
- Does NOT appear to open a modal from screenshots — likely links to enrollment form

---

## Section 1: Hero

**Background:** White `rgba(255, 255, 255, 1)`
**Layout:** Horizontal split — left column ~50% copy, right column ~50% video
**Vertical padding:** ~188px top (generous whitespace above H2)

### Nav (inherited, not section-specific)
- EKUZO logo: red wordmark, top-left
- Nav links: Programs / Schools / Families / Methodology / Resources — centered
- CTA button: "Start a conversation" — red filled, top-right

### Copy (left column)
- **H2:** "EKUZO100"
  - Tungsten Narrow Black, ~160px+, black, uppercase
  - Note: Live site renders as "EKUZO100" (no space) — Framer XML says "EKUZO 100" with space
- **Body (2 lines):**
  - "One Month. $100. Your First Team."
  - "The low-risk way to start with EKUZO."
  - Style: body large, ~18–20px, normal weight, black
- **CTA Button:** "Enroll my gamer"
  - Style: **red outline** (border: red, text: red, bg: transparent) — NOT filled
  - This is different from the "Enroll my gamer" button on other pages which may be filled
  - Rectangular, ~medium padding

### Video (right column)
- ~711px tall, full column width
- Poster/thumbnail shows: Asian man in grey jacket, paused
- Controls bar visible at bottom (Chrome native video controls)
- Volume: 25%, loop: true, autoplay: false
- Framer asset URL (placeholder): `https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4`
- **NOTE:** Same video as /pedagogy — needs to be replaced with actual ekuzo100-specific video

### Visual elements
- **Right edge decoration:** Large black ink/brush swirl illustration — extends off right edge of viewport. Black on white background. ~800px wide positioned at right.
  - URL: `https://framerusercontent.com/images/fbnEUYY1V7fVTnX4Nq3eCqpQ.png`
- **Bottom-left decoration:** Ink/brush strokes visible below H2 area at scroll (partially cropped)
  - URL: `https://framerusercontent.com/images/dxmK8k0CBzTITNxXNTzWTuu1Pwc.png`
- **Section divider:** Torn paper at bottom (placeholder node in Framer — no image set)

---

## Section 2: Our Approach

**Background:** White `rgb(255, 255, 255)`
**Layout:** 2-column — left: eyebrow + H4 + icons list; right: body paragraphs
**Eyebrow:** "OUR APPROACH" — red filled pill tag (red bg, white text, uppercase, small)

### Left column
- **H4:** "Built for growth, on and off the screen"
  - Large bold, black, ~40px
- **3 icon bullets** (red circle icon + label):
  1. Sword/gaming icon → "Structured practice"
  2. Target/coaching icon → "Skilled coaching"
  3. Up-arrow icon → "Growth through play"
  - Each icon: ~40px red circle with white icon inside

### Right column body (3 paragraphs)
- "Parents want to know if EKUZO is the right fit for their child. Students want a chance to prove themselves on a team."
- "EKUZO100 makes it simple: one month, $100, no long-term commitment."
- "The perfect entry point. Your student joins a team, trains with elite coaches, and competes in real matches in just four weeks."
- Note: Framer XML has "Ekuso" (typo) — live site appears to show "EKUZO" correctly

### Transition
- White torn-paper divider at bottom → light grey Ecosystem section

---

## Section 3: Ecosystem (Rive Animation)

**Background:** Light Grey `rgb(239, 238, 237)`
**Height:** 360vh (sticky scroll — content stays fixed while scroll position advances)
**Layout:** Centered composition, full viewport height

### Visual structure (persistent across states)
- Small label text above keyword (centered, ~14px, dark grey)
- Large bold keyword in black rectangle (Tungsten/display font, white text on black box)
- Central collage composition: B&W cutout figure(s) + objects + red brush strokes + black ink marks
- Caption text below composition (centered, ~16px, black)
- Sticky CTA bar at bottom: full-width red, "Enroll my gamer"

### 3 Animation States (scroll-triggered transitions)

**State 1 — PRACTICE**
- Label: "What you see"
- Keyword: **PRACTICE** (in black box)
- Figure: Boy (~12–14yo, white T-shirt, arms crossed, B&W cutout)
- Objects: Headset (left), Keyboard (upper right), Mouse (lower right)
- Caption: "Gaming at the center of every session."

**State 2 — COMPETITION**
- Label: "What you get"
- Keyword: **COMPETITION** (in black box)
- Figure: Same boy in esports jersey (arms crossed), B&W cutout
- Objects: Trophy "AEA North American Champions, 2024 Spring Season, League of Legends" (left); Team photo — group of ~15 players celebrating (right)
- Caption: "Team working toward shared goals."

**State 3 — COACHING** (last state before scroll exit)
- Label: (not captured — scrolled past top of text)
- Composition: Multiple figures (coach + players)
- Caption: "Trained coaches in moderated digital spaces."

### Decorative elements (all states)
- Red brush strokes / torn paper shapes — behind central figures
- Black ink marks / arrow/swoosh lines
- Light grey background throughout

---

## Section 4: How It Works

**Background:** White outer, off-white `rgb(239, 238, 237)` for cards
**Padding:** ~144px top/bottom
**Eyebrow:** "HOW IT WORKS" — red filled pill tag

### Large Card (full width, top)
- Background: Off-white `rgb(239, 238, 237)`
- **Headline:** "Each EKUZO100 cohort follows the same one-month structure."
  - Large bold black, ~36px
- **Body:** "Practices are 90 minutes, twice a week — designed to teach teamwork, focus, and growth through play."
  - Normal weight, ~16–18px

### 4 Staggered Step Cards

Each card:
- Background: Off-white `rgb(239, 238, 237)`
- Grey circle icon (dark grey filled circle, ~44px, with white icon inside)
- **Title:** "N. Label" — bold black, ~24px
- **Body:** 1–2 lines, normal weight, ~16px
- Max width: ~450px per card

Layout: alternating right-align → left-align (from left edge of content area, right-aligned cards anchor to right)

**1. Join** (right-aligned)
- Icon: Calendar
- "Choose your schedule: after school or evening (weekdays)."

**2. Practice** (left-aligned)
- Icon: Sword/crossed-swords (gaming)
- "Learn together: with a coach, as a team."

**3. Compete** (right-aligned)
- Icon: Community/people group
- "Apply skills through scrimmages and competitions."

**4. Progress** (left-aligned)
- Icon: Figure (growth/person)
- "Reflect on growth and decide what comes next."

### Background decorations
- Large black ink ring circles (2–3): left-bottom, right-top — ~400px diameter, zIndex 0
- Red brush stroke shapes between cards (triangular, torn fragments)
- Black ink swoosh/arrow marks between cards

---

## Section 5: Testimonial Carousel

**Background:** Light Grey `rgb(239, 238, 237)`
**Padding:** ~188px top, ~144px bottom
**Dividers:** White torn-paper top and bottom

### Video carousel
- 3 video thumbnails displayed in equal-width columns
- Each has: thumbnail preview (paused), dark overlay, text caption overlay at bottom
  - Video 1: Man in button-up, bookshelf bg — caption overlay: "DAD"
  - Video 2: Woman near window — caption overlay: "WHEN HE"
  - Video 3: Teen (young man, grey hoodie) — caption overlay: "WORK AND"
- Play button: black filled circle, white play triangle — centered on each thumbnail
- Chrome native video controls appear at bottom of thumbnails

### Carousel navigation
- Black filled circle buttons with white chevron arrows (← →)
- Centered below video row

### Pull quote block
- Red quotation icon (stylized, painted/illustrated — two red diagonal slash marks)
- **Quote:** "It's structure, mentorship, and community all in one place."
  - Large bold, centered, ~28–32px
- **Attribution:**
  - "Rudy May" — bold, centered
  - "EKUZO mom" — normal weight, grey, centered

---

## Section 6: What Happens After EKUZO100

**Background:** White
**Padding:** ~144px top, ~188px bottom
**Layout:** 2-column — H4 left, body right

### Left column
- **H4:** "What happens after EKUZO100"
  - Large bold black, ~36–40px, 2 lines

### Right column
- **Bold intro line:** "EKUZO100 is an entry point, not a dead end."
- **Para 1:** "Students who enjoy their month can move into semester-long EKUZO Teams, where they stay with consistent teammates, deepen skills, and compete throughout the season."
- **Para 2:** "Families decide next steps after experiencing the program firsthand."

### Visual
- Large brush art illustration (absolute, lower-left): black birds-in-flight / arrow-burst pattern
  - ~1131×632px, bottom-left quadrant of section
  - URL: `https://framerusercontent.com/images/5I9cKE5vflntneL84TuEElhs3QI.png`

---

## Section 7: FAQ

**Background:** Black `rgba(0, 0, 0, 1)`
**Layout:** 2-column — left: section heading; right: accordion items
**Divider at top:** Black torn-paper (from white → black)

### Left column
- **H4:** "Frequently asked questions"
  - Large bold white, ~36px, 3 lines

### Right column (FAQ accordions, collapsed by default)
Each item: dark grey circle chevron (↓), question text (white), horizontal divider (dark grey)

FAQ questions visible:
1. "Can homeschool families participate?"
2. "What happens after E100?"
3. "How much do programs cost?"
4. "What about college or careers?"
5. "How does this help with school?"
6. "When are practices held?"

**"See more FAQs" button** — white outline button on black, below last item, links to /faqs

---

## Footer Banner

**Background:** Red `rgb(249, 37, 36)`
**Divider at top:** Black torn-paper (black FAQ → red banner)

### Copy
- **H4:** "Turning pedagogy into progress"
  - Large bold white
- **Body:** "Games proved what great learning could look like. EKUZO makes it real for every student, in every school."
  - Normal weight, white
- **CTA:** "Start a conversation" — white outline button on red

### Visual
- 2 cut-out figures (B&W): teen in school jacket (pointing up), girl in plaid (hands on hips)
- Black ink arc/swirl marks (energy lines around figures)
- Positioned right side of banner

**Note:** This is the pedagogy/methodology footer variant (`IwVl9EEIz`) — same as used on /pedagogy. Different copy and figures from the standard "Enroll into a transformational program today" banner.

---

## Footer

**Background:** White
**Divider at top:** White torn-paper (red → white)
**Layout:** Social row top, nav columns middle, wordmark bottom

### Social row
- "Find us online" label
- Icons: TikTok, Instagram, LinkedIn, YouTube, X/Twitter, Facebook
- "Start a conversation" — red filled button (right side)

### Nav columns (4 columns)
- **Programs:** EKUZO 100 (underlined = current page), EKUZO Teams
- **Resources:** Methodology, Games, Blog
- **Audience:** Parents, Schools, FAQ
- **Legal:** Terms of Service, Privacy Policy

### Bottom
- "© All rights reserved." — small text, left
- Massive "EKUZO" wordmark — full-width, black, Tungsten display font, decorative footer

---

## Key Visual Patterns

### Color usage on this page
- White: Hero, Our Approach, How It Works bg, What Happens After, Footer
- Off-white `rgb(239, 238, 237)`: Card backgrounds throughout
- Light grey: Ecosystem bg, Testimonial bg
- Black: FAQ section, brush art, decorative ink elements
- Red: CTAs, icon circles, eyebrow tags, sticky bar, footer banner

### Torn-paper dividers used (sequence)
1. White → Light grey (after Our Approach)
2. Light grey → White (after Ecosystem — into How It Works)
3. White → Light grey (before Testimonials)
4. Light grey → White (after Testimonials)
5. White → Black (into FAQ)
6. Black → Red (into Footer Banner)
7. Red → White (into Footer)

### Typography scale observed
- H1-level: "EKUZO100" in hero — ~140px+ Tungsten (very large display)
- H4-level: Section headings — ~36–40px bold
- Eyebrow: ~12–14px uppercase, red filled tag
- Body large: ~18–20px normal
- Body standard: ~16px normal
- Caption: ~14px, grey

### Decorative system
- Collage aesthetic: B&W cutout photos + colored objects + red brush strokes + black ink marks
- Decorative elements are NOT icons — they're illustrated/painted brush marks
- Red shapes: torn paper fragments, brush strokes, triangular splashes
- Black shapes: ink rings, swoosh arrows, swirls, bird-like marks

---

## Key Design Notes

- Hero CTA is red OUTLINE (not filled) — unique among CTA buttons on site
- "EKUZO100" rendered as one word live (no space) despite Framer XML "EKUZO 100"
- Ecosystem section has 3 named states: PRACTICE / COMPETITION + coaching state
- How It Works uses numbered steps (not feature card titles) — cleaner and more scannable
- "What happens after EKUZO100" explicitly addresses post-program objection — unique section
- Footer banner copy "Turning pedagogy into progress" is the pedagogy variant, not the enrollment variant
- Body copy in Section 6 is structured: bold opener → explanatory para → reassurance para
- FAQ items are page-specific (E100-focused): "What happens after E100?" "When are practices held?"

---

## Breakpoints

- DesktopLarge: 1920px (primary — full content in Framer)
- Desktop: 1200px (inherits from primary)
- Tablet: 810px (inherits from primary)
- Phone: 390px (inherits from primary)

Hardware constraints prevented live responsive capture at sub-1600px CSS widths. Responsive behavior is defined within component-level CSS media queries, not as separate Framer page variants.
