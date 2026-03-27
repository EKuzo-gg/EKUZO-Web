# Pedagogy (/pedagogy) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: QRvASvvHF | Canvas width: 1920px

## NOTE ON TWO VERSIONS
There are TWO pedagogy-themed pages in Framer:
- `/pedagogy` (this file) — the published page: hero video, "Why games work," 4 feature cards, Ten Pillars
- `/about` (see pedagogy-about-variant.md) — alternative content: LoL rationale, learning framework cards, "Where other games fit"

In Next.js this maps to `/methodology` (already built). Combine the best of both.

---

## Section Order

1. Hero (white bg, left copy + right video, horizontal split)
2. "Why games work as learning systems" (light grey, large card + 4 staggered cards)
3. Testimonial — Karlin Oei quote
4. Ten Pillars (black bg, 10 cards in 4 columns)
5. Footer Banner

---

## Section 1: Hero

**Background:** White `rgba(255, 255, 255, 1)`
**Padding:** 188px top/bottom
**Layout:** Horizontal split (left copy, right video)

### Copy (left column)
- **H2:** "Pedagogy of gaming"
  - Style: `/Display/Heading 2` = Tungsten Narrow Black, 160px, uppercase
- **Body:** "Why games are the best teachers most students already know."
  - Style: `/Desktop Body/L/Regular`
- **CTA Button:** "Start a conversation" (opens contact modal)
  - Variant: `GhxtFePFm` (red filled)

### Video (right column)
- Full-width in column, 711px height
- Source: `https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4`
- Controls: visible, unmuted (volume 25%), loop enabled, not autoplaying
- Poster enabled, black bg
- objectFit: cover

### Visual elements
- Left decorative image (740×700px, bottom-left, zIndex 1): `https://framerusercontent.com/images/dxmK8k0CBzTITNxXNTzWTuu1Pwc.png`
- Right bg image (973px wide, full height, zIndex 0): `https://framerusercontent.com/images/fbnEUYY1V7fVTnX4Nq3eCqpQ.png`
- Paper cut divider at 103% Y (below section): `https://framerusercontent.com/images/8aXKGdobnlhGV66LFUcbTboN6xg.png`

---

## Section 2: Why Games Work as Learning Systems

**Background:** Light Grey (`/Grey/Light Grey`)
**Padding:** 144px top, 240px bottom

### Large Card (top)
- **Headline:** "Why games work as learning systems?"
- **Body:** "Every great game is a learning environment. Players stay engaged because they're motivated, supported, and challenged just enough to grow - the same best practices that drive effective classrooms."
- **Background:** White

### 4 Feature Cards (staggered L/R, max 1021px, same pattern as schools page)

1. **"Inclusion"** (right-aligned)
   - "A team for students who've never had one."
   - bg: white

2. **"Engagement"** (left-aligned)
   - "Practices and matches keep students present and energized."
   - bg: white

3. **"Attendance"** (right-aligned)
   - "Programs become a reason to show up."
   - bg: white

4. **"Future-ready skills"** (left-aligned)
   - "Leadership, communication, and resilience built in a setting students actually care about. a reason to show up."
   - bg: white
   - NOTE: "a reason to show up" appears duplicated — looks like a copy/paste error

### Background Decorations
- Same large circle images as /schools page (left + right circles, zIndex 0)

---

## Section 3: Testimonial — Karlin Oei

**Component:** `yY5pfBKjH` (TestimonialsSection)
**Variant:** `cQaERloUl`

### Copy
- **Quote:** "Our job isn't to add pedagogy to games; it's to help students see it, use it, and carry that mindset into school, careers, and life"
- **Attribution:** Karlin Oei

### Note
- Same component as /schools testimonial
- Different quote than /schools (which had "Once students see what they're capable of...")
- Karlin Oei appears on both pages — likely a partner educator or key reference

---

## Section 4: The Ten Pillars of EKUZO Pedagogy

**Background:** Black `rgba(0, 0, 0, 1)`
**Padding:** 188px top/bottom
**Gap:** 120px

### Copy
- **H4:** "The ten pillars of EKUZO pedagogy" (left column)
- **Body:** "Why games are the best teachers most students already know." (right column — same as hero subtitle)
- Side-by-side layout (H4 left, body right)

### 10 Pillar Cards (4 columns, staggered heights)
**Component:** `jpjISij1R` (TenPillarsSectionCard) variant `NAHPQln1y`

**Column 1 (2 cards):**
1. **Motivation** — "Small wins spark big change."
2. **Correct Difficulty** — "Challenge tuned to ability keeps learners in flow."

**Column 2 (3 cards):**
3. **Coaching** — "Feedback turns practice into progress."
4. **Social Learning** — "Teams teach teamwork better than lectures."
5. **Mastery** — "You can't level up until you've learned."

**Column 3 (2 cards):**
6. **Intentional Play** — "Fun is a feature, not a distraction."
7. **Problem-Based Learning** — "Every match is a problem to solve."

**Column 4 (3 cards):**
8. **Experimentation & Feedback** — "Try, fail, adjust, repeat."
9. **Student Agency** — "Ownership fuels motivation and growth."
10. **Cognitive Load** — "Clear fundamentals unlock creativity."

---

## Section 5: Footer Banner

- **Component:** `IwVl9EEIz` (different Footer Banner variant — `IwVl9EEIz` not `BNRkYbJEX`)
- **Variant:** `A0K7BT6qA`
- CTA visible: true (`cPGpkizEV="true"`)
- No custom copy visible in props — likely uses component default

---

## Key Design Notes

- Only page with a **video in the hero** (not background video — actual player with controls)
- Hero is horizontal split (copy left / video right) — different from all other pages
- "Start a conversation" is the hero CTA — not "Enroll my gamer" — this page is for consideration, not conversion
- Ten Pillars is the intellectual core of EKUZO's pedagogy — 10 named principles
- "Cognitive Load" and "Correct Difficulty" are sophisticated learning science concepts — speaks to educators
- Copy error in "Future-ready skills" card: "...carry far beyond gaming. a reason to show up." — duplicate phrase
- Copy error: "Social Learning" has a leading space — " Social Learning"
- Uses a DIFFERENT footer banner component (`IwVl9EEIz`) vs other pages (`BNRkYbJEX`)
- Karlin Oei quote is the strongest thought-leadership quote in the site

---

## Ten Pillars — Complete List for Reference

| # | Pillar | One-liner |
|---|--------|-----------|
| 1 | Motivation | Small wins spark big change. |
| 2 | Correct Difficulty | Challenge tuned to ability keeps learners in flow. |
| 3 | Coaching | Feedback turns practice into progress. |
| 4 | Social Learning | Teams teach teamwork better than lectures. |
| 5 | Mastery | You can't level up until you've learned. |
| 6 | Intentional Play | Fun is a feature, not a distraction. |
| 7 | Problem-Based Learning | Every match is a problem to solve. |
| 8 | Experimentation & Feedback | Try, fail, adjust, repeat. |
| 9 | Student Agency | Ownership fuels motivation and growth. |
| 10 | Cognitive Load | Clear fundamentals unlock creativity. |

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
