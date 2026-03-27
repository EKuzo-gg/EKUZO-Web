# EKUZO Teams (/ekuzo-teams) — Live Site Capture
Captured: 2026-03-25 | URL: ekuzo.gg/ekuzo-teams | Scroll height: ~16,505px

---

## ⚠️ NOTE ON TWO EKUZO TEAMS URLS

- `/ekuzo-teams` — **this file** — full marketing page (16,505px) ✓
- `/ekuzoteams-semester-based` — old Framer form shell only (no marketing content, no nav)

The `/ekuzo-teams` URL is the canonical page to rebuild.

---

## Section Order

1. Hero (white bg, horizontal split, copy left / video right)
2. Our Approach (off-white bg, "Teams Are Where Growth Compounds")
3. A Real Team Season (white bg, H4 + 3 cards)
4. How It Works — Large Card (off-white bg, "What a Typical Team Session Looks Like")
5. How It Works — Step Cards (off-white bg, 4 staggered steps + red closing statement)
6. Ecosystem (light grey bg, Rive animation, sticky scroll, ~3124px)
7. How Teams Works — Two Ways (black bg, SCHOOL vs HOME split)
8. Testimonials (white bg, video carousel + pull quote)
9. How Teams Fit Into the EKUZO System (off-white bg, 2-col)
10. FAQ (black bg) + Footer Banner (red bg)
11. Footer (white bg)

---

## Persistent UI: Sticky CTA Bar

Present at all scroll positions (fixed, bottom of viewport):
- Full-width `rgb(249, 37, 36)` bar, height: ~52px
- White text: **"Enroll my gamer"** (20px)
- Single full-width CTA — same as EKUZO100, not the dual-bar pattern of /games

---

## Section 1: Hero

**Background:** White `rgb(255, 255, 255)`
**Height:** ~1016px
**Layout:** Horizontal split — left column ~50% copy, right column ~50% video

### Nav
- EKUZO logo: red wordmark, top-left
- Nav links: Programs / Schools / Families / Methodology / Resources — centered
- CTA button: "Start a conversation" — red filled, top-right

### Copy (left column)
- **H2:** "EKUZO TEAMS"
  - Tungsten Narrow Black, 160px, black, uppercase
- **Body (2 lines):**
  - "The semester-based team seasons: structured like sports, built through practice."
  - Style: ~28px, normal weight, black
- **CTA Button:** "Enroll my gamer"
  - Style: **red text, transparent bg** — red outline button (same pattern as EKUZO100 hero)
  - 20px text, red `rgb(249, 37, 36)`

### Video (right column)
- Same video as EKUZO100: man in grey jacket, paused
- Same Framer asset as `/ekuzo100` hero — needs page-specific video

### Decorative
- Black ink swirl illustration at right edge (same style as EKUZO100)

---

## Section 2: Our Approach

**Background:** Off-white `rgb(239, 238, 237)`
**Height:** ~1008px
**Layout:** 2-column — eyebrow + H4 + icon bullets left; body paragraphs right
**Eyebrow:** "OUR APPROACH" — red filled pill tag (red bg, white text, uppercase, small)

### Left column
- **H4:** "Teams Are Where Growth Compounds"
  - 64px, bold, black
- **3 icon bullets** (red circle icon + label, 24px black):
  1. "Structured season"
  2. "Consistent team"
  3. "Coach-led practice"

### Right column body (3 paragraphs, 24px)
- "EKUZO Teams mirror traditional sports seasons: the same teammates, a shared rhythm, and clear expectations over time."
- "As relationships deepen, students stop just showing up and start taking ownership of their team, their role, and how they improve together."
- "What starts in practice doesn't stay there. The friendships, collaboration, and confidence spill beyond sessions and into everyday life."

---

## Section 3: A Real Team Season

**Background:** White (transparent — inherits page white)
**Height:** ~954px
**Layout:** H4 centered above, then 3 cards in row

### Heading
- **H4:** "A Real Team Season" — 64px, bold, black

### 3 Cards (horizontal row)
Each card: white bg, diamond corner cut top-left, title + body

**Card 1 — Semester-Based**
- **Title (P, 28px):** "Semester-Based"
- **Body (P, 24px):** "Designed as a full team season, similar to traditional sports programs."

**Card 2 — Consistent Team**
- **Title (P, 28px):** "Consistent Team"
- **Body (P, 24px):** "Players train with the same teammates over time, building trust and accountability."

**Card 3 — Season Arc**
- **Title (P, 28px):** "Season Arc"
- **Body (P, 24px):** "Practices and scrimmages lead toward a culminating end-of-season showcase."

---

## Section 4 + 5: How It Works

**Background:** Off-white `rgb(239, 238, 237)`
**Total height:** ~2130px (large card + 4 step cards + closing statement)
**Eyebrow:** "HOW IT WORKS" — red filled pill tag (white text, 16px)

### Large Card (full-width, top)
- **H4:** "What a Typical Team Session Looks Like" — 64px, bold, black
- **Body:** "Every EKUZO Team session follows the same intentional structure, whether it's hosted during or after the school day." — 28px, black

### 4 Step Cards (staggered layout, alternating left/right)

Each card: off-white bg, H5 title (40px, bold, black), P body (28px, black)

**1. Learn** (right-aligned)
- **H5:** "Learn"
- **Body:** "Coach introduces a team focus or skill for the session."

**2. Practice** (left-aligned)
- **H5:** "Practice"
- **Body:** "Players apply it through structured drills and team-based play."

**3. Apply** (right-aligned)
- **H5:** "Apply"
- **Body:** "Guided scrimmage scenarios reinforce communication and coordination."

**4. Reflect** (left-aligned)
- **H5:** "Reflect"
- **Body:** "Coach-led discussion connects performance to improvement and team goals."

### Closing Statement (red card or highlighted)
- **H5 (40px, white):** "Teams work toward shared goals through recurring competition, with the season culminating in a showcase that brings everything together."
- Background: `rgb(249, 37, 36)` — red statement block

---

## Section 6: Ecosystem (Rive Animation)

**Background:** Light Grey `rgb(239, 238, 237)`
**Height:** 3124px (y:7390–10514) — sticky scroll section
**Position:** `position: sticky` — canvas stays fixed while page scrolls
**Canvas dimensions:** 1642×781px (display) / 2955×1405px (actual)

Same Rive sticky scroll pattern as EKUZO100's Ecosystem section.
Animation states are scroll-triggered. This is the EKUZO Teams Rive file — different states from EKUZO100.

**Note:** Rive animation states for this page were not capturable via DOM text extraction — text is rendered to canvas. Refer to Framer XML or live scrolling to document states.

---

## Section 7: Two Ways to Run EKUZO Teams

**Background:** Black `rgb(0, 0, 0)`
**Height:** ~1442px (y:5948)

### Copy
- **Eyebrow:** "HOW TEAMS WORKS" — small, 16px, black text (on black bg — likely white or red outlined pill)
- **H4:** "Two Ways to Run EKUZO Teams" — 64px, bold, white
- **Subtitle:** "Students join the same EKUZO experience, either through their school or from home." (from page text)

### Decorative Watermark
- **"LEARN + PLAY"** — 280px, `rgba(255, 255, 255, 0.2)` — huge ghost text behind the two cards

### 2 Cards (side by side on black bg)
Each card appears to be white bg with black text (H3 title in black, bullets in black)

**Card 1 — SCHOOL**
- **H3:** "SCHOOL" — 120px, black (inside white card)
- Bullet list (P, 24px, black):
  - "Students play together on campus"
  - "A school proctor supports the room"
  - "EKUZO coaches lead sessions remotely"
  - "Offered during or after school hours"

**Card 2 — HOME**
- **H3:** "HOME" — 120px, black (inside white card)
- Bullet list (P, 24px, black):
  - "Students join from home"
  - "After-school sessions only"
  - "Regional cohorts when possible"
  - "Same structure, same expectations"

### CTA
- **"See programs"** — link/button, red bg, 20px white

---

## Section 8: Testimonials

**Background:** White `rgb(255, 255, 255)`
**Height:** ~1508px (y:10514)

### Heading
- **H4:** "Real stories from EKUZO families" — 64px, bold, black (2 lines)

### Video Carousel
- 36 video elements found (367×560px each) — Framer carousel with multiple copies
- Likely 3 visible at a time with carousel navigation (same carousel pattern as EKUZO100)
- Video thumbnails with play button overlay

### Pull Quote
- **Quote (P, 28px, black):** "\"It's structure, mentorship, and community all in one place.\""
- **Attribution:** "Rudy May" (P, 28px, black) / "EKUZO mom" (P, 24px, rgba(0,0,0,0.5))

---

## Section 9: How Teams Fit Into the EKUZO System

**Background:** Off-white `rgb(239, 238, 237)`
**Height:** ~1048px (y:12022)
**Layout:** 2-column — H4 left, body paragraphs right

### Left column
- **H4:** "How Teams Fit Into the EKUZO System" — 64px, bold, black

### Right column body (3–4 paragraphs, 24px, black)
- "Many students begin with EKUZO100 to experience the system with low commitment."
- "Teams are where most students stay: building habits, relationships, and confidence over time."
- "Camps offer short, focused bursts that supplement or accelerate growth."
- "Families decide next steps after experiencing the program firsthand."

---

## Section 10: FAQ

**Background:** Black `rgba(0, 0, 0, 1)`
**Height:** ~1060px (y:13070)
**Layout:** 2-column — left: H4 heading; right: accordion items
**Divider at top:** Torn-paper (white/off-white → black)

### Left column
- **H4:** "Frequently asked questions" — 64px, bold, white

### Right column (FAQ accordions, collapsed by default)
Each item: circle chevron (↓), question text (white, 28px), horizontal divider

FAQ questions:
1. "Can homeschool families participate?"
2. "What happens after E100?"
3. "How much do programs cost?"
4. "What about college or careers?"
5. "How does this help with school?"
6. "When are practices held?"

**"See more FAQs"** — white outline button on black, links to /faqs

---

## Footer Banner

**Background:** Red `rgb(249, 37, 36)`
**Height:** ~878px (y:14130)

### Copy
- **H4:** "Enroll into a transformational program today" — 64px, bold, white
- **CTA:** "Start a conversation" — white outline button on red (20px)

*Note: Standard enrollment banner variant — different from the "Turning pedagogy into progress" pedagogy variant used on EKUZO100.*

---

## Footer

**Background:** White
**Height:** ~1497px (y:15008–16505)
Standard footer — same as all other pages:
- Social row: "Find us online" + TikTok, Instagram, LinkedIn, YouTube, X, Facebook icons
- "Start a conversation" red filled button
- Nav columns: Programs / Resources / Audience / Legal
- Massive EKUZO wordmark (Tungsten, full-width, decorative)
- "© All rights reserved."

---

## Section Sequence Map

| y-position | Height | Background | Section |
|-----------|--------|-----------|---------|
| 0 | 1016px | White | Hero |
| 1016 | 1008px | Off-white | Our Approach |
| 2024 | 954px | White (transparent) | A Real Team Season |
| 2978 | ~400px | Off-white | How It Works large card |
| 3648 | ~1836px | Off-white | How It Works steps + closing |
| 5484 | 320px | Red | Closing statement (within How It Works) |
| 5948 | 1442px | Black | Two Ways to Run |
| 7390 | 3124px | Light grey | Ecosystem (Rive, sticky) |
| 10514 | 1508px | White | Testimonials |
| 12022 | 1048px | Off-white | How Teams Fit |
| 13070 | 1060px | Black | FAQ |
| 14130 | 878px | Red | Footer Banner |
| 15008 | ~1497px | White | Footer |

---

## Key Design Notes

- Hero H2 "EKUZO TEAMS" uses same massive Tungsten treatment as EKUZO100 — consistent program page pattern
- Hero CTA is **red OUTLINE** (not filled) — same as EKUZO100, different from other pages
- Sticky CTA bar is **single full-width** "Enroll my gamer" — NOT the dual-bar pattern of /games
- "Two Ways" section has a 280px ghost watermark "LEARN + PLAY" at 20% white opacity — decorative backdrop
- SCHOOL/HOME card H3s are 120px — same display scale as the "PARENT"/"QUESTIONS" stagger on /faqs
- Section 7 eyebrow reads "HOW TEAMS WORKS" (not "HOW TEAMS WORK") — copy as-is from live site
- The Rive ecosystem section (3124px) follows the same scroll-sticky pattern as EKUZO100 — different animation states
- "Teams are where most students stay" in Section 9 is the key commercial thesis: Teams = primary retention
- This page has more sections (11) than EKUZO100 (8) — longer persuasion arc for semester commitment
- Testimonial section: 36 video elements at 367×560px — Framer carousel with many clones; actual visible count is likely 3
- The "A Real Team Season" cards use the same diamond corner cut as /parents blog cards and /blog featured post

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px (inherits from primary)
- Tablet: 810px (inherits from primary)
- Phone: 390px (inherits from primary)
