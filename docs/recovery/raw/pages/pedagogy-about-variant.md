# About (/about) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: ODMztkQ5r | Canvas width: 1920px

---

## LAYOUT WARNING

This page uses mostly absolute positioning with `centerX`/`centerY` — many elements are not in a clean vertical stack. Likely built manually and may have layout/scroll issues. Rebuild should clean up to normal document flow.

---

## Section Order

1. Hero (red bg, H2)
2. "Games spark motivation / Structure turns it into growth" (body copy + image)
3. 6 Ecosystem Cards (right column, image left)
4. League of Legends section (black bg, 3 cards)
5. "Where other games fit" (red bg, game list)
6. Testimonial Carousel (video cards)
7. Footer Banner

---

## Section 1: Hero

**Background:** Red (`/Red/Red`), absolute positioned
**Padding:** 188px top

### Copy
- **H2:** "What Growth Through Games Really Requires"
  - Style: `/Display/Heading 2` = Tungsten Narrow Black, 160px, uppercase
  - Smaller than H1 (256px)

### Visual
- White torn-paper at 99% Y (`White1` component)
- Image below hero content: `https://framerusercontent.com/images/UfjqtSLCvajiLO8PI8MJak7cXTY.png`

---

## Section 2: Games Spark Motivation

**Layout:** Absolute positioning throughout — complex overlap

### Copy
- **H4:** "Games spark motivation."
- **Body:** "Structure turns it into growth. Students come to EKUZO through many different games, and we respect the passion they bring with them. But when it comes to teaching — helping students build confidence, leadership, and real-world skills — growth depends on more than just play."

### Visual
- Large brush art image (absolute, 1131×632px): `https://framerusercontent.com/images/5I9cKE5vflntneL84TuEElhs3QI.png`

---

## Section 3: Ecosystem Cards (6 cards, image left + cards right)

**Layout:** Image on left (40% width), 6 stacked cards on right (absolute, 484px each except last = 720px)
**Card Component:** `HnNOtigLD` (Ecosystem Section Card) variant `VwEfdN1Q3`
**Card bg:** white, text black

Left image: `https://framerusercontent.com/images/AQm6CNgcyAhR6k3apI2goNkA.png`

### Cards (top to bottom, stacked with 510px offsets)
1. **MOTIVATION** (484px)
   - "Games work because students care. Motivation drives focus, persistence, and the willingness to try again."
2. **Challenge** (484px)
   - "Games naturally push back. Failure isn't the end - it's feedback."
3. **TEAM CONTEXT** (484px)
   - "When success depends on others, learning becomes social. Students practice communication, responsibility, and trust."
4. **STRUCTURE** (484px)
   - "Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe."
5. **COACHING & REFLECTION** (484px)
   - "Coaching adds feedback, reflection, and leadership development."
6. **Where All of This Comes Together** (720px — largest, final card)
   - "Many games support parts of this growth. Very few support it consistently, across different skill levels."

### Black torn-paper divider at bottom (99% Y)

---

## Section 4: League of Legends Strikes That Balance

**Background:** Black (`/Black/Black`)
**Padding:** 144px top, 188px bottom
**Gap:** 72px

### Copy
- **H4:** "League of Legends strikes that balance"
- **Subhead:** "That balance comes from 3 things:"

### 3 Cards (horizontal, black bg variant `beiSYiz3X`, 490px height)
1. **"Strategic depth"**
   - "Challenges students to think ahead, adapt, and make meaningful decisions."
2. **"Approachable mechanics"**
   - "Easy to start, forgiving to learn, and accessible without overwhelming beginners."
3. **"Stable roles and systems"**
   - "Clear roles and systems that make teamwork and leadership teachable."

### Visual
- Image at bottom (300px, full-width, 104% Y): brush art divider `https://framerusercontent.com/images/FeQi62FV9fxmeo1VbqJoycOyQM.png`

---

## Section 5: Where Other Games Fit

**Background:** Red (`/Red/Red`)
**Padding:** 144px top/bottom
**Gap:** 120px

### Copy
- **H4:** "Where other games fit"
- **Body 1:** "Other games are often where students start."
- **Body 2:** "EKUZO meets students through the games they love, but teaches through the game that allows growth to compound."

### Game Cards (4 items, using `jpjISij1R` — Ten Pillars Section Card component)
- MarioKart — "Small wins spark big change."
- Fortnite — "Small wins spark big change."
- Roblox — "Small wins spark big change."
- "Experimentation & Feedback" — "and many other games" (different variant `yJ_b_yA9T`)

### Note
- These are laid out in a 4-column grid but with complex absolute positioning
- All 3 named games share the same body copy — likely placeholder text ("Small wins spark big change" feels wrong for a game card)
- "and many other games" is the catch-all

---

## Section 6: Testimonial Carousel

**Background:** White
**Padding:** 188px top/bottom, 104px sides
**Red torn-paper divider at top (1% Y):** `Red1` component

### Copy
- **H4:** "What parents are saying"
- **Pull quote:** "It's structure, mentorship, and community all in one place."
- **Attribution:** Rudy May / EKUZO mom

### Video component
- Uses `DdV4_HJre` (VideoCardSection) variant `VOVSsOyvw`
- Different from the Slideshow used on other pages — this appears to be a static video card layout

---

## Section 7: Footer Banner

- "Enroll into a transformational program today"
- **NOTE:** FooterBannerSection positioned absolutely at `centerX="0%"` `centerY="0%"` — this is likely broken/off-screen in Framer
- Needs to be rebuilt as normal flow element

---

## Key Design Notes

- This is the most philosophical/intellectual page — explains the "why" of EKUZO
- The argument flow is: Games motivate → Structure creates growth → LoL specifically because of strategic depth + approachable mechanics + team roles → Other games are entry points, LoL is where coaching compounds
- Page is clearly about the pedagogy AND the specific game choice (League of Legends)
- The 6 ecosystem cards (Motivation → Challenge → Team Context → Structure → Coaching → Where It All Comes Together) map to a learning framework
- **LAYOUT IS MESSY** — absolute positioning throughout, will not translate well to Next.js without rebuilding as document flow
- Footer banner positioning is broken (`centerX="0%"`)
- Game cards have placeholder copy — needs real copy per game
- This page should be substantially restructured in the rebuild while keeping the argument/narrative

---

## Unique Content on This Page

- Only page that explicitly names **League of Legends** and justifies the choice
- Only page that lays out the full learning framework (Motivation → Challenge → Team Context → Structure → Coaching)
- "Where other games fit" section validates students' existing gaming preferences while positioning LoL as the superior teaching vehicle
- Strong brand philosophy content — should inform all page copy, not just /about

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
