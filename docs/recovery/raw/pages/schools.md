# Schools (/schools) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: IPSPrK_wp | Canvas width: 1920px

---

## Section Order

1. Hero (white bg, H1, large overlapping images)
2. Our Approach Section ("What is EKUZO?" — school framing)
3. Ecosystem (Rive, no bg set = white)
4. "Why Schools Choose EKUZO" (light grey, large card + 4 staggered cards w/ images)
5. Programs Section — EKUZO Teams only
6. "What Schools See in Their Students" (black bg, ticker)
7. Testimonials Section (Karlin Oei quote)
8. Pedagogy Section (ticker cards)
9. FAQ + Footer Banner (unique copy)

---

## Section 1: Hero

**Background:** White (default)
**Max-width:** 1232px
**Padding:** 188px top, 40px sides, 360px bottom

### Copy
- **H1 (two lines, split across two text nodes):**
  - Line 1: "ESPORTS THAT BELONG IN"
  - Line 2: "SCHOOLS"
  - Style: `/Display/Heading 1` = Tungsten Narrow Black, 256px, uppercase

### Visual elements
- Large image (absolute, 1089×1464px, centered at 36% X, 93% Y, zIndex 2):
  `https://framerusercontent.com/images/GNb9UYs1xyYbhktbgRZ0BEehg.png`
  — Very tall, overlapping into next section
- Right image (absolute, 512×494px, right: 0, 34% Y, zIndex 2):
  `https://framerusercontent.com/images/sot10ho1rrJgFBf94VWYgkhLEA.png`

### Note
- No red background — opens on white
- No CTA
- Massive overlapping images create editorial/magazine feel
- H1 at same scale as homepage but white bg = very different tone

---

## Section 2: Our Approach Section

**Component:** `QsAFUtqlA`
**Background:** Off-white `rgb(239, 238, 237)`

### Copy
- **H4:** "What is EKUZO?"
- **List items (3):** Structured practice / Skilled coaching / Growth through play
- **Body (multi-paragraph):**
  > "Gaming is one of the most powerful motivators young people have — across backgrounds, interests, and ability levels.
  >
  > EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don't just play. They practice, communicate, lead, and reflect.
  >
  > This isn't about fixing kids. It's about building the structure most of them are missing."

### Note
- "This isn't about fixing kids" — strong line, addresses school administrator anxiety
- Schools framing is more systemic/structural than parent framing

---

## Section 3: Ecosystem

**Height:** 360vh, sticky Rive
**Background:** Not set (white default — different from programs/parents which use light grey)

---

## Section 4: Why Schools Choose EKUZO

**Background:** Light Grey (`/Grey/Light Grey`)
**Padding:** 144px top, 240px bottom
**Gap:** 26px

### Background Decorations (absolute)
- Large left circle image (1697×1561px): `https://framerusercontent.com/images/g3TpENbpNBwnNlbNlBNmJRBdv4.png`
- Large right circle image (912×1884px): `https://framerusercontent.com/images/YLIvJr3GzjSAURCIE9vJpyKBgo.png`
- Both zIndex 0 — purely decorative

### Large Card (top)
- **Component:** `J5646SU6d`
- **Headline:** "Why schools choose EKUZO?"
- **Body (3 paragraphs):**
  > "Schools don't choose EKUZO because they want esports.
  >
  > They choose it because they're facing real student challenges and need a solution that fits inside academic priorities, staffing limits, and community expectations.
  >
  > EKUZO is designed to help schools act thoughtfully, without taking on unnecessary risk, burden, or distraction."
- **Background:** White (`rgb(255, 255, 255)`)

### 4 Feature Cards (staggered layout, alternating L/R, max 1021px)
Each card has overlapping decorative images (brush strokes, abstract shapes) behind/beside them

1. **"Hard problems, not bad students"** (right-aligned)
   - "Disengagement and anxiety are systemic challenges, not discipline issues."
   - Background images: coaching photo (82% width, 553px) and shape overlay
   - Card bg: white

2. **"Built to run, not to improvise"** (left-aligned)
   - "Coaching, curriculum, competition, and safety are designed to work together.."
   - Multiple overlapping brush images (4 images at various positions)
   - Card bg: white

3. **"Easy to implement"** (right-aligned)
   - "Clear roles, predictable structure, and external coaches reduce lift for school staff."
   - Card bg: white

4. **"Youth development first"** (left-aligned)
   - "Gaming is the medium; growth, skills, and belonging are the goals."
   - Card bg: white

### Dividers
- White torn-paper at top (-1% Y)
- White torn-paper at bottom (100% Y)

---

## Section 5: Programs Section — Teams Only

**Component:** `QVJuYtM47`
- `hK16UEwE3="true"` (program 1 — EKUZO Teams)
- `q5dQx7YIm="false"` (program 2 hidden)
- `TFkM3R0rj="false"` (program 3 hidden)

### Note
- Schools page only shows EKUZO Teams — the school-based product
- Home programs (EKUZO100, Camps) are not shown to school administrators

---

## Section 6: What Schools See in Their Students

**Background:** Black (`/Black/Black`)
**Padding:** 144px top, 188px bottom
**Gap:** 72px

### Copy
- **Eyebrow:** "PROGRAMS"
- **H4:** "What Schools See in their Students"

### Ticker (4 cards, 520px height, black bg cards — different from light grey parent ticker)
- Card variant: `beiSYiz3X` (vs `DDIXV3F3Z` on parents page — likely white text on black)
- Card bg: `rgb(0, 0, 0)` (black, not grey)

1. **"Attendance"**
   - "Students show up more consistently when they belong to a team with shared goals."
2. **"Engagement"**
   - "Motivation earned in practice carries into class, behavior, and daily energy."
3. **"Belonging"**
   - "Students who didn't connect elsewhere find a place to contribute and be seen."
4. **"Skills"**
   - "Communication, leadership, and digital skills develop through coached team play."

### Note
- Black ticker cards = white text on black bg (inverse of parents page)
- Outcomes written for school metrics: attendance, engagement, belonging, skills

### Divider
- Black torn-paper at top (0% Y): `Black1` component (`xXXvJAqHn`)

---

## Section 7: Testimonials Section

**Component:** `yY5pfBKjH` (TestimonialsSection — different from the carousel used elsewhere)
**Variant:** `cQaERloUl`

### Copy
- **Quote:** "Once students see what they're capable of, you don't have to push them. They push themselves."
- **Attribution:** Karlin Oei
- `XTam18xjQ="true"` (some prop, likely shows image or video)

### Note
- This uses a DIFFERENT testimonial component than other pages — not the video carousel
- Unique quote from Karlin Oei (school contact? educator?)

---

## Section 8: The Pedagogy Behind the Program

**Background:** White `rgba(255, 255, 255, 1)`
**Padding:** 188px top/bottom
**Gap:** 72px

### Copy
- **H4:** "The pedagogy behind the program"
- **Body:** "EKUZO is built on proven learning principles, applied inside a structure students already care about."

### Ticker (4 cards, 452px height, light grey)
1. **"Motivation"** — "Visible wins build intrinsic drive, turning effort into enthusiasm."
2. **"Feedback loops"** — "Every class follows a rhythm of show up, learn, grow and reflect. This mirrors how mastery develops in both games and academics."
3. **"Social learning"** — "Students collaborate, communicate, and lead in authentic, high-pressure situations — the ultimate SEL lab."
4. **"Skills development"** — "What begins as play becomes practice for life — preparing students to tackle challenges anywhere."

### Note
- Same 4 pedagogy cards as home page off-canvas elements (now live here)
- Academic framing: "learning principles," "feedback loops," "SEL lab"

---

## Section 9: FAQ + Footer Banner

- FAQ: `x3eHpc90M` variant `mlurInN15`
- **Footer Banner — UNIQUE COPY:** "Increase attendance and engagement in your school"
  - (vs "Enroll into a transformational program today" on all other pages)
  - CTA visible: true

---

## Key Design Notes

- Schools page is the most sophisticated page structurally — most sections, most varied layout
- Footer banner is the only page with audience-specific CTA copy
- Only shows EKUZO Teams in programs (not home programs)
- Testimonial uses a different component — not video carousel
- Karlin Oei quote is the only named non-parent testimonial
- "This isn't about fixing kids" is a standout line
- "The pedagogy behind the program" section is unique to schools — speaks to educators
- Circular background decorations in "Why schools" section add depth without using icons
- Hero images are enormous (1089×1464) and overlap into next section — dramatic scroll behavior

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
