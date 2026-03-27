# EKUZO Pages Spec
> Master build document. Feed this to Claude Code to build all pages in sequence.
> All assets are in /public/images/ and /public/animations/
> Shared components: TornPaper, Nav, Footer, ProgramsSection, TestimonialsSection, FaqSection, FooterBanner, EcoSystem

---

## SHARED DESIGN TOKENS

### Colors
- Red: `#F92524` (rgb(249, 37, 36))
- Black: `#000000`
- White: `#FFFFFF`
- Light Grey: `#EFEEEF` (rgb(239, 238, 237))
- Dark Grey: `#4F4F4F`

### Typography
- Display/Hero headings: Bebas Neue (stand-in for Tungsten Narrow Black)
  - H1: 256px / 228px line-height / uppercase
  - H2: 160px / 140px line-height / uppercase / letter-spacing 3.2px
  - H3: 120px / 96px line-height / uppercase
- Section headings: Inter Bold (stand-in for Test Die Grotesk)
  - H4: 64px / 64px line-height / letter-spacing -1.28px
  - H5: 40px / 48px line-height
- Body: Inter Regular
  - L: 28px / 38px line-height
  - M: 24px / 34px line-height
  - S: 20px / 28px line-height
  - XS: 16px / 24px line-height
- Eyebrow labels: Inter Medium, 16px, uppercase, letter-spacing 10px

### Shared Section Padding
- Standard section: 188px top/bottom
- Hero: varies per page
- Max content width: 1232px

### Shared Components (reuse across all pages)
- **Nav**: EKUZO logo left, links: Programs, Schools, Parents, Methodology, Blog + "Start a conversation" CTA button (red)
- **TornPaper**: full-width image dividers between sections. Variants: white-1, white-2, black-1, black-2, black-2-on-white, red-1, red-2, grey-1
- **ProgramsSection**: "3 programs. 1 system. 1 esport experience." — 3 stacked cards (EKUZOTEAMS, EKUZO100, EKUZOCAMPS)
- **TestimonialsSection**: quote mark image, slideshow placeholder, quote "It's structure, mentorship, and community all in one place." — Rudy May, EKUZO mom
- **FaqSection**: accordion FAQ list
- **FooterBanner**: red background, CTA heading + "Start a conversation" button
- **Footer**: 5 columns (Methodology, Programs, Parents, Schools, Legal) + social icons + large EKUZO wordmark

---

## PAGE 1: Homepage `/`
> Status: Built — fix layout bug (sections repeating), then swap in real assets

### Sections
1. **Hero** — red bg (#F92524), padding 160px top / 400px bottom
   - Image: `hero-bg.png` (full width, centerY 59%, zIndex 2)
   - Image: `hero-bird.png` (332×300px, centerX 50%, centerY 85%, zIndex 5)
   - Heading (H1): "Every gamer deserves a team"
   - Below hero: TornPaper `torn-paper-white-2.png`

2. **Growth through play** — bg #EFEEEF, padding 188px
   - Left: `growth-collage.png`
   - Right: 3 list items: "Structured practice" · "Skilled coaching" · "Real competition"
   - TornPaper `torn-paper-grey-1.png` at bottom

3. **Practice section** — white bg
   - Eyebrow: "WHAT YOU SEE"
   - H2: "PRACTICE"
   - Full-width image placeholder (video card)

4. **Two ways to participate** — black bg, padding 188px
   - Eyebrow: "HOW IT WORKS"
   - H4: "2 ways to play and learn"
   - Body: "Students can join EKUZO from home or through school. Both formats build teamwork, coaching, and progress."
   - Watermark text: "LEARN + PLAY" (absolute, centerX 50%, centerY 45%)
   - 2 cards side by side:
     - SCHOOL: "Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online." → /programs
     - HOME: "Students join individually from home in a fully online format (during or after school)." → /programs
   - TornPaper `torn-paper-black-2.png` top and bottom

5. **What parents are saying** — white bg, padding 144px
   - H4: "What families are saying"
   - Testimonials slideshow (3 cards)
   - Quote mark: `testimonial-quote-mark.png` (46×52px)
   - Quote: "It's structure, mentorship, and community all in one place." — Rudy May, EKUZO mom

6. **FAQ** — accordion with 5 questions
   - Who are the coaches?
   - How do you keep online spaces safe?
   - What is EKUZO100?
   - What's the difference between After-School and School Teams?
   - What are Minimeesters?
   - How are teams founded?

7. **Footer Banner** — red bg: "Enroll into a transformational program today"

---

## PAGE 2: Programs `/programs`

### Sections
1. **Hero** — red bg, padding 360px top/bottom
   - Rive animation: `/public/animations/programs-hero.riv` (artboard: "Main - Desktop", state machine: "State Machine 1")
   - Fallback: solid red background if Rive not configured
   - TornPaper `torn-paper-white-2.png` at bottom (absolute, centerY 10%)

2. **Our Approach** — white bg
   - H4: "Built for growth, on and off the screen"
   - 3 list items: "Structured practice" · "Skilled coaching" · "Growth through play"
   - Body: "Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."

3. **Programs Section** — use ProgramsSection shared component
   - Eyebrow: "PROGRAMS"
   - H4: "3 programs. 1 system. 1 esport experience."
   - 3 cards (bg: `program-card-bg-1.png` for TEAMS + 100, `program-card-bg-2.png` for CAMPS), padding 88px:
     - **EKUZOTEAMS**: 15 weeks · 2-3x practice weekly · During or After School
       "Best for: students and schools ready for ongoing growth." → /ekuzo-team
     - **EKUZO100**: 4 weeks · 2x weekly · After school
       "Best for: first-time students or families curious about esports." → /ekuzo100
     - **EKUZOCAMPS**: 1 week · 10 teammates · Summer/holiday break
       "Best for: students who want a burst of activity during breaks." → /ekuzocamps

4. **Two ways to participate** — black bg (same as homepage but links to /schools and /parents)
   - SCHOOL card → /schools
   - HOME card → /parents

5. **Ecosystem scroll section** — light grey bg, 360vh height, sticky scroll animation

6. **Testimonials** — "Real stories from EKUZO families"

7. **FAQ + Footer Banner**

---

## PAGE 3: Parents `/parents`

### Assets
- `parents-hero.png` — hero collage image
- `parents-hero-torn.png` — torn paper overlay at hero bottom
- `parents-features-bg.png` — features section background
- `parents-blog-feature.jpg` — featured blog post thumbnail
- `parents-blog-card-overlay.png` — blog card left panel overlay
- `parents-blog-card-photo.jpg` — blog card right photo
- `parents-blog-decor.png` — decorative element (135×164px)

### Sections
1. **Hero** — white bg, padding 280px top
   - H2: "Learn to Play. Play to Learn"
   - Image: `parents-hero.png` (full width below heading)
   - TornPaper `parents-hero-torn.png` at bottom (absolute, bottom -20px)

2. **What is EKUZO?** — bg #EFEEEF
   - H4: "What is EKUZO?"
   - 3 list items: "Structured practice" · "Skilled coaching" · "Growth through play"
   - Body: "It's natural for parents to feel tension around screen time, especially when it feels unstructured, unsupervised, or hard to trust.

EKUZO leans into what students already love. We take their natural motivation for gaming and build a complete, coach-led system around it. Think sports, designed specifically for gamers.

Instead of trying to control screen time, parents gain confidence in how it's being used."

3. **Why parents choose EKUZO?** — bg: `parents-features-bg.png`, padding 188px
   - Large card heading: "Why parents choose EKUZO?"
   - Body: "Parents choose EKUZO because it turns gaming from a solo activity into a team experience that feels structured, social, and purposeful. Instead of managing screen time, parents see their kids showing up, engaging with teammates, and growing through play."
   - 3 feature cards (alternating left/right alignment):
     - "Safe and structured" — "Moderated spaces, trained coaches, and a positive culture."
     - "Motivating by design" — "Students gain visible wins that build intrinsic motivation."
     - "Skills that last" — "Communication, leadership, and resilience carry far beyond gaming."

4. **Programs Section** — shared ProgramsSection component

5. **Ecosystem scroll section** — light grey bg

6. **What parents see in their kids** — white bg, padding 188px
   - Eyebrow: "HOW IT WORKS"
   - H4: "What parents see in their kids"
   - Horizontal scrolling ticker with 4 cards (bg #EFEEEF, width 160px each):
     - "Growing confidence" — "Kids speak up more, try harder things, and recover faster from setbacks."
     - "Better communication" — "Team play translates into clearer communication at home and at school."
     - "Motivation that sticks" — "Parents notice fewer battles around participation."
     - "Real connections" — "Kids talk about teammates by name and start looking forward to showing up."
   - Button: "See programs" → /programs

7. **Testimonials** — "What parents are saying"

8. **Blog Section** — padding 188px
   - Left panel (red bg, 64% width): "Stories of Growth and Gaming" + decorative white diamond corners
   - Right panel (red bg): "Explore how esports becomes a tool for learning, connection, and purpose." + `parents-blog-decor.png` (135×164px)
   - Featured blog card (full width, 399px height, bg: `parents-blog-feature.jpg`):
     - Left overlay (bg: `parents-blog-card-overlay.png`): Eyebrow "BLOG", H5: "Our Family's Esports Journey with EKUZO and the K1ng", body: "My son Ryan was always a happy kid in his early years."
     - Link: /blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng

9. **FAQ + Footer Banner** — "Enroll into a transformational program today"

---

## PAGE 4: Schools `/schools`

### Assets
- `schools-hero-left.png` — large hero left image (1089×1464px, centerX 36%, centerY 93%)
- `schools-hero-right.png` — hero right image (512×494px, right edge, centerY 34%)
- `schools-circle-left.png` — decorative circle bg left (1697×1561px)
- `schools-circle-right.png` — decorative circle bg right (912×1884px)
- `schools-feature-1.png` through `schools-feature-8.png` — feature section decorative images

### Sections
1. **Hero** — white bg, padding 188px top / 360px bottom, max-width 1232px
   - H1 (two lines): "ESPORTS THAT BELONG IN" / "SCHOOLS"
   - Left image: `schools-hero-left.png` (absolute, 1089×1464px, centerX 36%, centerY 93%, zIndex 2)
   - Right image: `schools-hero-right.png` (absolute, 512×494px, right 0, centerY 34%, zIndex 2)

2. **What is EKUZO?** — bg #EFEEEF
   - H4: "What is EKUZO?"
   - 3 list items: "Structured practice" · "Skilled coaching" · "Growth through play"
   - Body: "Gaming is one of the most powerful motivators young people have — across backgrounds, interests, and ability levels.

EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don't just play. They practice, communicate, lead, and reflect.

This isn't about fixing kids. It's about building the structure most of them are missing."

3. **Ecosystem scroll section** — no background color specified, 360vh

4. **Why schools choose EKUZO?** — bg #EFEEEF, padding 144px top / 240px bottom
   - TornPaper `torn-paper-white-2.png` at top
   - Large card heading: "Why schools choose EKUZO?"
   - Body: "Schools don't choose EKUZO because they want esports. They choose it because they're facing real student challenges and need a solution that fits inside academic priorities, staffing limits, and community expectations. EKUZO is designed to help schools act thoughtfully, without taking on unnecessary risk, burden, or distraction."
   - 4 feature cards (alternating right/left alignment) with decorative images behind each:
     - (right-aligned) "Hard problems, not bad students" — "Disengagement and anxiety are systemic challenges, not discipline issues."
     - (left-aligned) "Built to run, not to improvise" — "Coaching, curriculum, competition, and safety are designed to work together."
     - (right-aligned) "Easy to implement" — "Clear roles, predictable structure, and external coaches reduce lift for school staff."
     - (left-aligned) "Youth development first" — "Gaming is the medium; growth, skills, and belonging are the goals."
   - TornPaper `torn-paper-white-2.png` at bottom

5. **Programs Section** — shared ProgramsSection (TEAMS only: show EKUZOTEAMS, hide EKUZO100 and EKUZOCAMPS)

6. **What Schools See in their Students** — black bg, padding 144px top / 188px bottom
   - TornPaper `torn-paper-black-1.png` at top
   - Eyebrow: "PROGRAMS"
   - H4: "What Schools See in their Students"
   - Horizontal scrolling ticker, 4 cards (black bg, white text, width 160px):
     - "Attendance" — "Students show up more consistently when they belong to a team with shared goals."
     - "Engagement" — "Motivation earned in practice carries into class, behavior, and daily energy."
     - "Belonging" — "Students who didn't connect elsewhere find a place to contribute and be seen."
     - "Skills" — "Communication, leadership, and digital skills develop through coached team play."

7. **Testimonials** — shared TestimonialsSection
   - Quote: "Once students see what they're capable of, you don't have to push them. They push themselves." — Karlin Oei

8. **The pedagogy behind the program** — white bg, padding 188px
   - H4: "The pedagogy behind the program"
   - Body: "EKUZO is built on proven learning principles, applied inside a structure students already care about."
   - Horizontal scrolling ticker, 4 cards (bg #EFEEEF):
     - "Motivation" — "Visible wins build intrinsic drive, turning effort into enthusiasm."
     - "Feedback loops" — "Every class follows a rhythm of show up, learn, grow and reflect. This mirrors how mastery develops in both games and academics."
     - "Social learning" — "Students collaborate, communicate, and lead in authentic, high-pressure situations — the ultimate SEL lab."
     - "Skills development" — "What begins as play becomes practice for life — preparing students to tackle challenges anywhere."

9. **FAQ + Footer Banner** — "Increase attendance and engagement in your school"

---

## PAGE 5: Pedagogy `/pedagogy`

### Assets
- `pedagogy-hero-left.png` — decorative left image (740×700px, absolute bottom-left)
- `pedagogy-hero-right-bg.png` — right background (973px wide, absolute)
- `pedagogy-hero-torn.png` — torn paper at hero bottom (centerY 103%)
- `/public/videos/pedagogy-hero.mp4` — hero video (right column, 711px tall, loop, controls, muted=false, volume 25%)
- Reuses: `schools-circle-left.png`, `schools-circle-right.png`, `schools-feature-1/2/3/4/6/7/8.png`

### Sections
1. **Hero** — white bg, horizontal layout, padding 188px, gap 80px
   - Left column (max-width 1232px, padding 0 40px):
     - H2: "Pedagogy of gaming"
     - Body L: "Why games are the best teachers most students already know."
     - Button: "Start a conversation"
   - Right column: Video player `/public/videos/pedagogy-hero.mp4` (711px tall, loop, controls on, muted off, volume 25%)
   - Decorative: `pedagogy-hero-left.png` (absolute, 740×700px, bottom-left, zIndex 1)
   - Decorative: `pedagogy-hero-right-bg.png` (absolute, 973px wide, top/right/bottom, zIndex 0)
   - TornPaper `pedagogy-hero-torn.png` at bottom (absolute, centerY 103%, zIndex 2)

2. **Why games work as learning systems?** — bg #EFEEEF, padding 144px top / 240px bottom
   - Large card heading: "Why games work as learning systems?"
   - Body: "Every great game is a learning environment. Players stay engaged because they're motivated, supported, and challenged just enough to grow - the same best practices that drive effective classrooms."
   - Same circle decorative images as Schools page (schools-circle-left/right.png)
   - 4 feature cards (alternating right/left):
     - (right) "Inclusion" — "A team for students who've never had one."
     - (left) "Engagement" — "Practices and matches keep students present and energized."
     - (right) "Attendance" — "Programs become a reason to show up."
     - (left) "Future-ready skills" — "Leadership, communication, and resilience built in a setting students actually care about."

3. **Testimonials** — shared TestimonialsSection
   - Quote: "Our job isn't to add pedagogy to games; it's to help students see it, use it, and carry that mindset into school, careers, and life" — Karlin Oei

4. **The ten pillars of EKUZO pedagogy** — black bg, padding 188px, horizontal layout
   - H4 (left): "The ten pillars of EKUZO pedagogy"
   - Body L (right): "Why games are the best teachers most students already know."
   - 4-column grid of 10 pillar cards (dark/black cards, white text):
     - Col 1: "Motivation" — "Small wins spark big change." / "Correct Difficulty" — "Challenge tuned to ability keeps learners in flow."
     - Col 2: "Coaching" — "Feedback turns practice into progress." / "Social Learning" — "Teams teach teamwork better than lectures." / "Mastery" — "You can't level up until you've learned."
     - Col 3: "Intentional Play" — "Fun is a feature, not a distraction." / "Problem-Based Learning" — "Every match is a problem to solve."
     - Col 4: "Experimentation & Feedback" — "Try, fail, adjust, repeat." / "Student Agency" — "Ownership fuels motivation and growth." / "Cognitive Load" — "Clear fundamentals unlock creativity."

5. **Footer Banner** — "Start a conversation" CTA (no FAQ section on this page)

---

## PAGE 6: EKUZO100 `/ekuzo100`

### Assets
- Reuses: `pedagogy-hero-left.png` (870×544px), `pedagogy-hero-right-bg.png` (806px wide)
- Reuses: `/public/videos/pedagogy-hero.mp4`
- Reuses: `schools-circle-left/right.png`, `schools-feature-1 through 8.png`
- `ekuzo100-after-section.png` — decorative image for "What happens after EKUZO100" section (1131×632px, absolute centerX 22%, centerY 73%)

### Sections
1. **Hero** — white bg, horizontal layout, padding 188px, gap 80px
   - Left column:
     - H2: "EKUZO 100"
     - Body L: "One Month. $100. Your First Team. The low-risk way to start with EKUZO."
     - Button (red): "Enroll my gamer" → Stripe Checkout for EKUZO100
   - Right column: Video `/public/videos/pedagogy-hero.mp4` (711px tall, loop, controls, muted off, vol 25%)
   - Decorative: `pedagogy-hero-left.png` (absolute, 870×544px, bottom-left, zIndex 0)
   - Decorative: `pedagogy-hero-right-bg.png` (absolute, 806px wide, right side, zIndex 0)

2. **Built for growth** — white bg, OurApproachSection
   - H4: "Built for growth, on and off the screen"
   - 3 list items: "Structured practice" · "Skilled coaching" · "Growth through play"
   - Body: "Parents want to know if Ekuso is the right fit for their child. Students want a chance to prove themselves on a team.

Ekuso100 makes it simple: one month, $100, no long-term commitment.

The perfect entry point. Your student joins a team, trains with elite coaches, and competes in real matches in just four weeks."

3. **Ecosystem scroll section** — light grey bg, 360vh

4. **One-month structure** — white bg, padding 144px
   - Large card: "Each EKUZO100 cohort follows the same one-month structure."
   - Body: "Practices are 90 minutes, twice a week — designed to teach teamwork, focus, and growth through play."
   - 4 feature cards (alternating right/left, bg #EFEEEF):
     - (right) "1. Join" — "Choose your schedule: after school or evening (weekdays)."
     - (left) "2. Practice" — "Learn together: with a coach, as a team."
     - (right) "3. Compete" — "Apply skills through scrimmages and competitions."
     - (left) "4. Progress" — "Reflect on growth and decide what comes next."

5. **Testimonials** — bg #EFEEEF, TornPaper white-1 top and bottom
   - "Real stories from EKUZO families" — same quote (Rudy May)

6. **What happens after EKUZO100** — white bg, padding 144px top / 188px bottom
   - Decorative: `ekuzo100-after-section.png` (absolute, 1131×632px, centerX 22%, centerY 73%, zIndex 1)
   - H4: "What happens after EKUZO100"
   - Body: "EKUZO100 is an entry point, not a dead end. Students who enjoy their month can move into semester-long EKUZO Teams, where they stay with consistent teammates, deepen skills, and compete throughout the season. Families decide next steps after experiencing the program firsthand."

7. **FAQ + Footer Banner** — "Enroll my gamer" CTA

---

## PAGE 7: EKUZO Teams `/ekuzo-team`

### Assets
- `ekuzoteams-hero-left-bottom.png` — decorative bottom-left image (834×330px, absolute)
- `ekuzoteams-hero-right-bg.png` — right background (834×993px, absolute top-right)
- Reuses: `/public/videos/pedagogy-hero.mp4`, `schools-circle-left/right.png`, `schools-feature-1 through 8.png`, `ekuzo100-after-section.png`

### Sections
1. **Hero** — white bg, horizontal layout, padding 188px, gap 80px
   - Left column:
     - H2: "EKUZO teams"
     - Body L: "The semester-based team seasons: structured like sports, built through practice."
     - Button (red): "Enroll my gamer" → Stripe Checkout for EKUZOTEAMS
   - Right column (40% width): Video `/public/videos/pedagogy-hero.mp4` (640px tall)
   - Decorative: `ekuzoteams-hero-left-bottom.png` (absolute, 834×330px, bottom-left, zIndex 1)
   - Decorative: `ekuzoteams-hero-right-bg.png` (absolute, 834×993px, top-right, zIndex 1)

2. **Teams Are Where Growth Compounds** — bg #EFEEEF, OurApproachSection
   - H4: "Teams Are Where Growth Compounds"
   - 3 list items: "Structured season" · "Consistent team" · "Coach-led practice"
   - Body: "EKUZO Teams mirror traditional sports seasons: the same teammates, a shared rhythm, and clear expectations over time.

As relationships deepen, students stop just showing up and start taking ownership of their team, their role, and how they improve together.

What starts in practice doesn't stay there. The friendships, collaboration, and confidence spill beyond sessions and into everyday life."

3. **A Real Team Season** — white bg, padding 144px top / 188px bottom
   - H4: "A Real Team Season"
   - 3 cards side by side (black bg, white text, 490px tall):
     - "Semester-Based" — "Designed as a full team season, similar to traditional sports programs."
     - "Consistent Team" — "Players train with the same teammates over time, building trust and accountability."
     - "Season Arc" — "Practices and scrimmages lead toward a culminating end-of-season showcase."

4. **Session structure** — white bg, padding 144px
   - Large card: "Each EKUZO100 cohort follows the same one-month structure." (note: reused heading, refers to Teams session)
   - Body: "Every EKUZO Team session follows the same intentional structure, whether it's hosted during or after the school day."
   - 4 feature cards (alternating right/left, bg #EFEEEF):
     - (right) "Learn" — "Coach introduces a team focus or skill for the session."
     - (left) "Practice" — "Players apply it through structured drills and team-based play."
     - (right) "Apply" — "Guided scrimmage scenarios reinforce communication and coordination."
     - (left) "Reflect" — "Coach-led discussion connects performance to improvement and team goals."
   - Red callout box (full width, padding 64px 104px): "Teams work toward shared goals through recurring competition, with the season culminating in a showcase that brings everything together."

5. **Two Ways to Run EKUZO Teams** — black bg, padding 188px
   - Eyebrow: "HOW TEAMS WORKS"
   - H4: "Two Ways to Run EKUZO Teams"
   - Body: "Students join the same EKUZO experience, either through their school or from home."
   - Watermark: "LEARN + PLAY"
   - 2 cards: SCHOOL card + HOME card (use SchoolCard / HomeCard components)
   - Button: "See programs" → /programs
   - TornPaper white-2 at top

6. **Ecosystem scroll section** — light grey bg, 360vh, TornPaper black-2 top + white-1 bottom

7. **Testimonials** — white bg, "Real stories from EKUZO families"

8. **How Teams Fit Into the EKUZO System** — bg #EFEEEF, padding 188px top / 320px bottom
   - TornPaper white-1 at top
   - Decorative: `ekuzo100-after-section.png` (absolute, 1131×632px, centerX 24%, centerY 61%, zIndex 1)
   - H4: "How Teams Fit Into the EKUZO System"
   - Body: "Many students begin with EKUZO100 to experience the system with low commitment. Teams are where most students stay: building habits, relationships, and confidence over time. Camps offer short, focused bursts that supplement or accelerate growth. Families decide next steps after experiencing the program firsthand."

9. **FAQ + Footer Banner** — "Enroll into a transformational program today"

---

## PAGE 8: Coaching `/coaching`

### Hero
- **Background:** White `#FFFFFF`
- **Padding:** 188px top/bottom
- **Layout:** Full-width, max-content 1232px, 40px side padding
- **Decorative (absolute):**
  - Bottom-left: `coaching-hero-left.png` — 660×560px, pinned bottom 0 / left 0, zIndex 1
  - Top-right: `coaching-hero-right.png` — 660×560px, pinned top 0 / right 0, zIndex 1
  - Bottom overlay: `coaching-hero-torn.png` — full width, 300px height, centerY 103%, zIndex 2
- **Content (vertical stack, gap 80px):**
  - **H2:** "COACHING"
  - **Subtitle (Body L):** "Meeting every learner where they are."
  - **Image placeholder:** 1fr wide × 496px tall (empty/CMS slot in Framer — use grey placeholder)

---

### Section 2 — "Every great athlete has a coach"
- **Background:** `#EFEEEF`
- **Padding:** 144px top / 188px bottom
- **Decorative (absolute):** `coaching-athlete-bg.png` — 1131×632px, centerX 22%, centerY 73%, zIndex 1
- **Layout:** Max-width 1232px, two-column horizontal stack (gap 80px, aligned end)
  - Left column: empty spacer
  - Right column (max-width 600px):
    - **H5:** "Every great athlete has a coach."
    - **Body L:** "Every successful team has a mentor guiding them. Research across education is clear: coaching is one of the most effective ways to learn. At EKUZO, coaching is at the center of our model. Our coaches are collegiate esports athletes or former professionals who know the game inside and out, but more importantly, they know how to connect with students."

---

### Section 3 — Testimonials
- **Component:** `<TestimonialsSection />` (shared)
- **Quote:** "A coach is someone who can give correction without causing resentment." — John Wooden

---

### Section 4 — "How Coaching Builds Growth"
- **Background:** `#EFEEEF`
- **Padding:** 144px top / 240px bottom
- **Decorative (absolute, all zIndex 0–3):**
  - `coaching-how-circle-left.png` — 1697×1561px, centerX 44%, centerY 51%
  - `coaching-how-circle-right.png` — 912×1884px, centerX 76%, centerY 35%
  - `coaching-how-bg-wide.png` — 82% wide × 553px, right 89.5px, bottom 178px
  - `coaching-how-decor-1.png` — 50% wide × 188px, centerX 26%, centerY 48%, zIndex 1
  - `coaching-how-decor-2.png` — 50% wide × 355px, centerX 74%, centerY 50%, zIndex 1
  - `coaching-how-decor-3.png` — 44% wide × 177px, centerX 22%, centerY 102%, zIndex 3
  - `coaching-how-decor-4.png` — 44% wide × 177px, centerX 48%, centerY 20%, zIndex 0
  - `coaching-how-decor-5.png` — 44% wide × 226px, centerX 58%, centerY 94%, zIndex 0
  - `coaching-how-decor-6.png` — 50% wide × 353px, left 9px, centerY 52%, zIndex 1
- **Heading (H4):** "How Coaching Builds Growth"
- **Subtext (Body L):** "Coaching turns feedback into transformation. It gives structure to practice and purpose to reflection. In games and in learning, growth happens fastest when students can:"
- **3 Cards (white text, black bg):**
  - Card 1: Title "Observe" / Body "See what happened and why it mattered"
  - Card 2: Title "Reflect" / Body "Get feedback and discuss it safely."
  - Card 3: Title "Adjust" / Body "Apply insights in the next round."

---

### Section 5 — "Meeting the Learner Where They Are"
- **Background:** White (inherited)
- **Padding:** 188px all sides (40px side padding)
- **Layout:** Max-width 1232px
  - **Top row (two columns):**
    - Left (64% width): Heading block, bg `#F92524`, padding 80px 160px 196px 80px
      - **H4:** "Meeting the Learner Where They Are"
    - Right (1fr): Body block, bg `#F92524`, padding 80px 80px 0 32px
      - **Body L:** "One student joined without ranked experience; they were quiet, hesitant, and unsure."
      - Decorative: `coaching-learner-decor.png` — 135×164px, absolute, centerX 79%, centerY 67%, zIndex 1
  - **Bottom image strip (399px tall):**
    - Background: `coaching-learner-photo.jpg`
    - Left overlay card (443.5px wide): bg overlay `coaching-learner-card-overlay.png`, padding 40px 80px 40px 56px
      - Red accent frame (bg `#F92524`)
      - **Body XS:** "His coach didn't push him into competition right away; instead, they focused on team communication and game sense. By the third week, he was calling plays mid-match, the same player teachers said 'never spoke up in class.'"
      - Button: "Read more stories" → `/blog`
    - Right panel (1fr): bg `coaching-learner-right-panel.png`, padding 92px 149px 204px 92px
- **Decorative diamonds:** 80×80px white squares rotated -45° at corners

---

### Section 6 — "Connected pedagogies"
- **Background:** `#000000`
- **Padding:** 144px top / 188px bottom
- **Decorative (absolute):** `coaching-connected-fade.png` — full width, 300px height, centerY 104%, zIndex 1
- **Layout:** Max-width 1232px, vertical stack, gap 72px
- **Heading (H4, white):** "Connected pedagogies"
- **3 Cards (black bg, white text, equal width, heights alternating 490px/1fr/490px):**
  - Card 1: Title "Motivation" / Body "Coaches help students see progress before they feel it." / icon-size 160
  - Card 2: Title "Social learning" / Body "Feedback becomes conversation — learning happens together." / icon-size 160
  - Card 3: Title "Correct Difficulty" / Body "Guidance keeps challenge in the 'just right' zone for each player." / icon-size 160

---

### Footer Banner
- **Component:** `<FooterBanner />` (shared)
- **Heading:** "Enroll into a transformational program today"
- No FAQ section above banner on this page

---

## PAGE 9: Games `/games`

### Section 1 — Hero
- **Background:** `#F92524` (red)
- **Padding:** 188px top / 0px bottom
- **H2:** "What Growth Through Games Really Requires"
- **Hero image:** `games-hero.png` (full-width, below heading)
- **TornPaper:** white-1 at bottom, centerY 99%

---

### Section 2 — "Games spark motivation"
- **Background:** White
- **Padding:** 144px top/bottom
- **Decorative (absolute):** `coaching-athlete-bg.png` — 1131×632px, centerX 22%, centerY 73%, zIndex 1
- **H4:** "Games spark motivation."
- **Body L:** "Structure turns it into growth. Students come to EKUZO through many different games, and we respect the passion they bring with them. But when it comes to teaching — helping students build confidence, leadership, and real-world skills — growth depends on more than just play."

---

### Section 3 — Sticky scroll cards
- **Padding:** 144px top / 188px bottom
- **Layout:** Sticky left image (30% width) + right column of 6 stacked cards
- **Left sticky image:** Decorative illustration (component — use grey placeholder)
- **6 Cards** (white bg, black dividers, white text — stacked, each sticky top 0):
  1. **MOTIVATION** — "Games work because students care. Motivation drives focus, persistence, and the willingness to try again."
  2. **Challenge** — "Games naturally push back. Failure isn't the end — it's feedback."
  3. **TEAM CONTEXT** — "When success depends on others, learning becomes social. Students practice communication, responsibility, and trust."
  4. **STRUCTURE** — "Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe."
  5. **COACHING & REFLECTION** — "Coaching adds feedback, reflection, and leadership development."
  6. **Where All of This Comes Together** — "Many games support parts of this growth. Very few support it consistently, across different skill levels." (taller card, 626px)
- **TornPaper:** black-1 at bottom, centerY 99%

---

### Section 4 — "League of Legends"
- **Background:** `#000000`
- **Padding:** 144px top/bottom (inferred)
- **H4 (white):** "League of Legends strikes that balance"
- **Body L (white):** "That balance comes from 3 things:"
- **3 Cards (black bg, white text):**
  1. **Strategic depth** — "Challenges students to think ahead, adapt, and make meaningful decisions."
  2. **Approachable mechanics** — "Easy to start, forgiving to learn, and accessible without overwhelming beginners."
  3. **Stable roles and systems** — "Clear roles and systems that make teamwork and leadership teachable."
- **Decorative (absolute):** `coaching-connected-fade.png` — full width, 300px height, centerY 104%, zIndex 1

---

### Section 5 — "Where other games fit"
- **Background:** `#F92524` (red)
- **Padding:** 144px top/bottom
- **H4 (white):** "Where other games fit"
- **Body L (white):** "Other games are often where students start."
- **Illustration:** `games-other-illustration.png` — 567px height, aspect ratio 1.236
- **Large quote (H3, white, uppercase):** "They spark interest, build motivation, and create momentum."

---

### Section 6 — Testimonial
- **Background:** White
- **Padding:** 188px top/bottom, 40px side
- **Quote mark:** `games-quote-mark.png` — 40×40px
- **Quote (H5):** "EKUZO meets students through the games they love, but teaches through the game that allows growth to compound."
- **Author (Body L Bold):** "Karlin Oei"
- **Role (Body L Bold, 60% opacity):** "Founder EKUZO"
- **TornPaper:** red-1 above and below this section

---

### Footer Banner
- **Component:** `<FooterBanner />` (shared)
- **Heading:** "Enroll into a transformational program today"

---

## PAGE 10: About `/about`
> Note: In Framer this page shares the "games philosophy" structure. Sections 1–4 mirror /games. Unique sections are 5 (game cards) and 6 (parent testimonials).

### Section 1 — Hero
- **Background:** `#F92524` (red)
- **Padding:** 188px top / 0px bottom
- **H2:** "What Growth Through Games Really Requires"
- **Hero image:** `games-hero.png` (reused from /games)
- **TornPaper:** white-1 at bottom, centerY 99%

---

### Section 2 — "Games spark motivation"
- **Background:** White
- **Padding:** 144px top/bottom
- **Decorative (absolute):** `coaching-athlete-bg.png` — 1131×632px, centerX 22%, centerY 73%, zIndex 1
- **H4:** "Games spark motivation."
- **Body L:** "Structure turns it into growth. Students come to EKUZO through many different games, and we respect the passion they bring with them. But when it comes to teaching — helping students build confidence, leadership, and real-world skills — growth depends on more than just play."

---

### Section 3 — Sticky scroll cards
- **Padding:** 144px top / 188px bottom
- **Layout:** Sticky left image (40% width) + right column of 6 stacked cards
- **Left sticky image:** `about-sticky-image.png`
- **6 Cards** (white bg, black text, each sticky top 0, 484px tall; last card 720px):
  1. **MOTIVATION** — "Games work because students care. Motivation drives focus, persistence, and the willingness to try again."
  2. **Challenge** — "Games naturally push back. Failure isn't the end — it's feedback."
  3. **TEAM CONTEXT** — "When success depends on others, learning becomes social. Students practice communication, responsibility, and trust."
  4. **STRUCTURE** — "Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe."
  5. **COACHING & REFLECTION** — "Coaching adds feedback, reflection, and leadership development."
  6. **Where All of This Comes Together** — "Many games support parts of this growth. Very few support it consistently, across different skill levels."
- **TornPaper:** black-1 at bottom, centerY 99%

---

### Section 4 — "League of Legends"
- **Background:** `#000000`
- **Padding:** 144px top / 188px bottom
- **H4 (white):** "League of Legends strikes that balance"
- **Body L (white):** "That balance comes from 3 things:"
- **3 Cards (black bg, white text):**
  1. **Strategic depth** — "Challenges students to think ahead, adapt, and make meaningful decisions."
  2. **Approachable mechanics** — "Easy to start, forgiving to learn, and accessible without overwhelming beginners."
  3. **Stable roles and systems** — "Clear roles and systems that make teamwork and leadership teachable."
- **Decorative (absolute):** `coaching-connected-fade.png` — full width, 300px height, centerY 104%, zIndex 1

---

### Section 5 — "Where other games fit"
- **Background:** `#F92524` (red)
- **Padding:** 144px top/bottom, 40px side
- **H4 (white):** "Where other games fit"
- **Body L (white):** "Other games are often where students start."
- **4 Game Cards (horizontal row, gap 16px):**
  1. **MarioKart** — "Small wins spark big change."
  2. **Fortnite** — "Small wins spark big change."
  3. **Roblox** — "Small wins spark big change."
  4. **Experimentation & Feedback** — "and many other games" (alternate variant — wider/featured)
- **Body L (white, max-width 720px):** "EKUZO meets students through the games they love, but teaches through the game that allows growth to compound."

---

### Section 6 — "What parents are saying"
- **Background:** White
- **Padding:** 188px top/bottom, 104px side
- **TornPaper:** red-1 at top, centerY 1%
- **H4:** "What parents are saying"
- **Video card component:** (testimonial video slot — use placeholder)
- **Logo:** `about-testimonial-logo.png` — 46×52px
- **Quote (Body L Bold, max-width 444px):** "It's structure, mentorship, and community all in one place."
- **Author (Body L Medium):** "Rudy May"
- **Role (Body M Regular):** "EKUZO mom"

---

### Footer Banner
- **Component:** `<FooterBanner />` (shared)
- **Heading:** "Enroll into a transformational program today"
- FAQ section: visible on this page (`kylqqg5uj="true"`)

---

## PAGE 11: FAQs `/faqs`

### Assets
- `faq-hero-bottom.png` — 431×382px decorative image, positioned at bottom-center of hero (centerY 90%)
- `faq-hero-torn.png` — full-width torn paper, bottom of hero (centerY 104%)
- `faq-left-deco-1.png` — 400×525px, anchored left edge, centerY 26% (spans Safety section)
- `faq-left-deco-2.png` — 717×944px, anchored left edge, centerY 50% (spans middle sections)
- `faq-right-deco.png` — 569×1143px, anchored right edge, centerY 39% (spans Outcomes/Cost sections)
- `faq-programs-deco.png` — 50% wide × 188px, Programs section, centerX 26% centerY 59%

---

### Section 1 — Hero
- **Background:** Black (`#000000`)
- **Padding:** 360px top, 240px bottom
- **Max-width content:** 1232px, centered, padding 0px 40px
- **H2 (Bebas Neue, white, uppercase):**
  - Line 1: "PARENT"
  - Line 2: "FREQUENTLY ASKED QUESTIONS"
- **Decorative image:** `faq-hero-bottom.png` — absolute, 431×382px, centered horizontally, bottom of hero area (centerY ~90%)
- **Torn paper:** `faq-hero-torn.png` — absolute, 100% width, below hero (centerY ~104%)

---

### Section 2 — Safety & Coaching
- **Background:** White
- **Padding:** 188px top, 144px bottom, 40px sides
- **Max-width:** 1232px centered
- **Layout:** Two columns, gap 120px
  - Left column (max-width 388px): **H4** "Safety & Coaching"
  - Right column: FAQ accordion list
- **FAQs (accordion, black text on white, Body L Bold questions):**
  1. **Who are the coaches?** — All EKUZO coaches are top 1% collegiate esports athletes or former professional players. They are trained not just in gameplay, but in pedagogy, safety, and social-emotional growth.
  2. **How do you keep online spaces safe?** — Our Discord and online platforms are actively moderated. Coaches and staff enforce community guidelines, and every student signs our Code of Conduct. Parents can always contact us with concerns.
  3. **Is this safe for beginners?** — Yes. Coaches meet students where they are — from casual players to aspiring competitors — and ensure every team is inclusive and supportive.
- **Decorative:** `faq-left-deco-1.png` — absolute, left edge, centerY 26%

---

### Section 3 — Programs & Scheduling
- **Background:** White
- **Padding:** 144px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Layout:** Two columns, gap 120px
  - Left column (max-width 388px): **H4** "Programs & Scheduling"
  - Right column: FAQ accordion list
- **Decorative:** `faq-programs-deco.png` — absolute, 50% wide × 188px, centerX 26%, centerY 59%
- **FAQs:**
  1. **What is EKUZO100?** — E100 is our entry program: one month, $100, two practices per week. It's the easiest way to see if Ekuzo is right for your child.
  2. **When are practices held?** — E100: Two evenings per week, after dinner, Mon–Wed or Tue–Thu. After-School: 2 afternoons/evenings per week during the semester. Minimesters: Daily 90-minute sessions for 4 days during breaks.
  3. **How are teams formed?** — Students are grouped in increments of ~5 to create balanced teams, with a preference for local cohorts whenever possible.
  4. **What are Camps?** — Short, intensive 4-day programs during school breaks (winter or spring).
  5. **What's the difference between After-School and School Teams?** — After-School: Semester-based extracurricular, available online or as a club. School Teams: Offered during the school day, often for elective credit, with a proctor present.

---

### Section 4 — Outcomes & Benefits
- **Background:** White
- **Padding:** 144px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Layout:** Two columns, gap 120px
  - Left column (max-width 388px): **H4** "Outcomes & Benefits"
  - Right column: FAQ accordion list
- **Decorative:** `faq-left-deco-2.png` — absolute, left edge, centerY 50%; `faq-right-deco.png` — absolute, right edge, centerY 39%
- **FAQs:**
  1. **What outcomes should I expect?** — Parents most often notice: Greater confidence and motivation; Improved communication and teamwork; Reduced social anxiety through belonging; Curiosity about STEAM projects and career pathways.
  2. **How does this help with school?** — Motivated students engage more. Educators consistently report improved attendance and focus when kids are involved in structured esports programs.
  3. **What about college or careers?** — Ekuzo builds both soft skills (leadership, resilience, communication) and exposure to pathways in esports, game design, broadcasting, and tech.

---

### Section 5 — Cost & Value
- **Background:** White
- **Padding:** 144px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Layout:** Two columns, gap 120px
  - Left column (max-width 388px): **H4** "Cost & Value"
  - Right column: FAQ accordion list
- **FAQs:**
  1. **How much do programs cost?** — E100: $100 for one month. After-School: Semester-based enrollment. Minimesters: Short, 4-day programs (pricing varies).
  2. **Why does it cost what it does?** — The practices are just the tip of the iceberg. Beneath them is the full system: elite coach training, moderated community spaces, curriculum design, competition infrastructure, guest speakers, and student-led projects.

---

### Section 6 — Enrollment & Next Steps
- **Background:** White
- **Padding:** 144px top, 188px bottom, 40px sides
- **Max-width:** 1232px centered
- **Layout:** Two columns, gap 120px
  - Left column (max-width 388px): **H4** "Enrollment & Next Steps"
  - Right column: FAQ accordion list
- **FAQs:**
  1. **How do I enroll?** — Click Enroll Now → to sign up for E100, our one-month entry program.
  2. **What happens after E100?** — Families can: Re-enroll in another E100 cohort; Transition into After-School for ongoing growth; Explore School Teams (through a school partnership).
  3. **Can homeschool families participate?** — Yes. Homeschoolers can enroll in E100, After-School, or School Teams (as an elective).

---

### FAQ Accordion Component Notes
- Each section uses an accordion pattern: question as header (Body L Bold), divider line below, answer expands on click
- All accordions are black text on white background (`CloseBlack`/`OpenBlack` variants)
- Gap between FAQ items: 32px; gap between sections: 72px

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Enroll into a transformational program today"
- FAQ section visible (`kylqqg5uj="true"`)

---

---

## PAGE 12: EKUZO Teams Enrollment Form `/ekuzoteams-semester-based`

This is the pre-checkout enrollment data collection form for EKUZO Teams (semester-based program). It collects student info before handing off to Stripe Checkout.

### Layout
- **Background:** White
- **Padding:** 188px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Form card:** white bg, 20px padding, gap 24px between fields

---

### Form Fields
**Title (H5):** "Enroll my gamer"

1. **Parent name** (text input, required *)
2. **Parent email** (text input, required *)
3. **Student name** (text input, required *)
4. **Student age** (radio group, required *)
   - Options: 10-12 / 13-15 / 16-18
5. **Student gender** (radio group, required *)
   - Options: Male / Female / Non-binary
6. **Main games student plays** (text input, optional)
7. **Schedule preference** (radio group, optional)
   - Options: Afternoon (e.g., 4:00–5:30 PM) / Evening (e.g., 7:00–8:30 PM) / During school day

**Submit button:** "Next" — red background (`#F92524`), white text, full width

---

### Behavior
- On submit: POST form data to webhook (see `Webhook.tsx` in Framer), then redirect to Stripe Checkout for EKUZO Teams product
- This page is reached after clicking "Enroll" CTA on the EKUZO Teams marketing page

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Enroll into a transformational program today"
- FAQ section visible (`kylqqg5uj="true"`)

---

---

## PAGE 13: EKUZO100 Enrollment Form `/ekuzo100-4-week-intro`

Pre-checkout enrollment form for EKUZO100 (4-week intro program). Nearly identical to the Teams form (PAGE 12) with one key difference: Schedule preference has only 2 options (no "During school day" — E100 is online only).

### Layout
- **Background:** White
- **Padding:** 188px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Form card:** white bg, gap 24px between fields

---

### Form Fields
**Title (H5):** "Enroll my gamer"

1. **Parent name** (text input, required *)
2. **Parent email** (text input, required *)
3. **Student name** (text input, required *)
4. **Student age** (radio group, required *)
   - Options: 10-12 / 13-15 / 16-18
5. **Student gender** (radio group, required *)
   - Options: Male / Female / Non-binary
6. **Main games student plays** (text input, optional)
7. **Schedule preference** (radio group, optional)
   - Options: Afternoon (e.g., 4:00–5:30 PM) / Evening (e.g., 7:00–8:30 PM)
   - *(No "During school day" option — E100 is online/remote only)*

**Submit button:** "Next" — red background (`#F92524`), white text, full width

---

### Behavior
- On submit: POST form data to webhook, then redirect to Stripe Checkout for EKUZO100 product
- Reached after clicking "Enroll" CTA on the EKUZO100 marketing page

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Enroll into a transformational program today"
- FAQ section visible (`kylqqg5uj="true"`)

---

---

## PAGE 14: EKUZO Camps Waitlist `/ekuzocamps-seasonal`

Camps are not yet open for enrollment. This page collects waitlist signups — name + email only.

### Layout
- **Background:** White
- **Padding:** 188px top/bottom, 40px sides
- **Max-width:** 1232px centered
- **Form card:** white bg, 20px padding, gap 24px between fields

---

### Form Fields
**Title (H5):** "EKUZOCAMPS"

1. **Name** (text input, required *)
2. **Email** (text input, required *)

**Submit button:** "Get notified when available" — white background, red text (`#F92524`), full width
*(Inverted from other forms — this is a waitlist, not a purchase)*

---

### Behavior
- On submit: POST name + email to webhook/mailing list
- No Stripe Checkout redirect — this is a notification signup only

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Enroll into a transformational program today"
- FAQ section visible (`kylqqg5uj="true"`)

---

---

## PAGE 15: Terms of Service `/terms-of-service`

### Layout
- **Background:** White
- **Padding:** 188px top, 40px sides
- **Max-width:** 1232px
- **Sections gap:** 40px vertical
- **Each section:** two-column row, gap 138px — left col max-width 392px (section label), right col flexible (body text)
- **No footer banner on this page**

### Typography
- Page title: **H4** — "Terms of service"
- Left col top label: Body S Regular Black (section number e.g. "1. The Service")
- Left col sub-label: Body M Medium (subsection e.g. "1.1 Description of the Service")
- Right col: Body M Regular

---

### Content

**Last Updated:** February 2026

**Intro paragraph (full width, Body M Regular):**
Thank you for your interest in EKUZO Inc ("EKUZO," "we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website at ekuzo.gg (the "Website") and your enrollment in, payment for, and participation in EKUZO's structured, coach-led esports and learning programs (collectively, the "Service"). These Terms apply to all parents, guardians, schools, organizations, students, and other individuals who access or use the Website or participate in the Service. By accessing the Website, enrolling a student, submitting payment, or participating in any EKUZO program, you acknowledge that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy, which is incorporated by reference. If you are enrolling or authorizing participation on behalf of a minor or a school or organization, you represent that you have the authority to do so and to bind the applicable parties to these Terms.

---

**1. The Service / 1.1 Description of the Service**
EKUZO provides structured, coach-led esports and learning programs for children and teens (the "Service"). The Service may include, without limitation: Live, scheduled coaching sessions; Team-based esports participation; Voice, video, and text communication; Moderated online community spaces; Curriculum-guided drills, activities, and reflection; Program administration, safety monitoring, and coaching evaluation. The Service may be delivered online, in schools, or through hybrid formats.

**1. The Service / 1.2 Not a Software Platform**
EKUZO is a service-based program, not a self-serve software product. Participation occurs through scheduled sessions and supervised environments rather than through individual consumer accounts.

**1. The Service / 1.3 Changes to the Service**
EKUZO reserves the right to modify, suspend, or discontinue any aspect of the Service at any time, including program structure, schedules, content, or delivery methods. We will make reasonable efforts to communicate material changes but are not liable for modifications made in good faith.

**2. Eligibility and Authority / 2.1 Parents and Guardians**
Parents or legal guardians are the primary contracting parties for student participation. By enrolling a student, you represent and warrant that you have legal authority to do so and to agree to these Terms on the student's behalf.

**2. Eligibility and Authority / 2.2 Students**
Students are minors and participate solely as permitted participants. Students do not independently enter into a contractual relationship with EKUZO.

**2. Eligibility and Authority / 2.3 Schools and Organizations**
Schools or organizations may enroll students under separate written agreements. In the event of a conflict between these Terms and a signed school or enterprise agreement, the written agreement controls.

**3. Age Requirements / 3.2 Exceptions**
In limited circumstances, EKUZO may allow participation by younger students by exception, based on program suitability, safety considerations, and parental consent. EKUZO reserves the right to determine eligibility for any program.

**4. Website Use / 4.1 Permitted Use**
You may use ekuzo.gg for informational and enrollment purposes only.

**4. Website Use / 4.2 Prohibited Use**
You agree not to: Interfere with website operation; Attempt unauthorized access; Use the site for unlawful purposes; Copy or misuse content without permission.

**5. Enrollment, Fees, and Payments / 5.1 Enrollment**
Enrollment occurs through online forms or written agreements and is subject to availability, eligibility, and acceptance by EKUZO.

**5. Enrollment, Fees, and Payments / 5.2 Fees**
Program fees, payment schedules, and billing terms are disclosed at enrollment or in applicable agreements.

**5. Enrollment, Fees, and Payments / 5.3 Payment Processing**
Payments are processed through third-party payment providers. EKUZO does not store full payment card details.

**5. Enrollment, Fees, and Payments / 5.4 No-Refund Policy**
Because EKUZO programs are time-based, team-based, and staffed in advance, all payments are non-refundable once a program begins, except where EKUZO determines, in its sole discretion, that a refund is appropriate for reasons other than removal for cause.

**6. Communication Platforms and Third-Party Services / 6.2 Third-Party Terms**
Participants are subject to the terms and policies of those platforms. EKUZO does not control third-party services and is not responsible for outages, changes, or failures.

**7. Recording, Monitoring, and Safety / 7.1 Recording**
All live coaching sessions are recorded for safety, quality assurance, and coaching continuity.

**7. Recording, Monitoring, and Safety / 7.2 Moderation**
Team communication spaces are actively moderated. EKUZO may review recordings or communications as needed.

**7. Recording, Monitoring, and Safety / 7.3 Consent**
Participation constitutes consent to recording and monitoring as described in these Terms and the Privacy Policy.

**8. Student Conduct / 8.1 Expectations**
Students must: Follow coach instructions; Treat others respectfully; Use communication tools appropriately; Avoid harassment, threats, or disruptive behavior.

**8. Student Conduct / 8.2 Enforcement**
EKUZO may take corrective action, including removal from sessions or programs, to protect safety and program integrity.

**9. Removal and Termination / 9.1 Removal for Cause**
EKUZO may remove a student from a program without refund if removal is necessary due to conduct issues, safety concerns, or failure to participate in good faith, consistent with Section 5.4.

**9. Removal and Termination / 9.2 Effect of Removal**
Removal does not relieve payment obligations already incurred.

**10. Student Data and Educational Records / 10.1 Role of EKUZO**
EKUZO acts as a service provider to parents, guardians, and schools with respect to student information and, where applicable, student education records. For programs delivered through schools, EKUZO functions as a service provider performing services on behalf of the school and under the school's direction.

**10. Student Data and Educational Records / 10.2 Educational Records (FERPA)**
To the extent EKUZO receives or has access to student education records provided by a school, EKUZO handles such records in a manner consistent with its role as a service provider to the school, including limitations on use and disclosure. EKUZO uses student information and educational records solely for purposes related to: delivering and operating the Service; supporting student safety and supervision; enabling coaching continuity and development. EKUZO does not use student education records for unrelated commercial purposes.

**10. Student Data and Educational Records / 10.3 Control and Access**
Parents, guardians, and schools retain control over student information and education records. Requests to access, correct, or delete such records are handled as described in the Privacy Policy or through the applicable school relationship.

**10. Student Data and Educational Records / 10.4 Privacy Policy**
Additional details regarding data handling and retention are described in EKUZO's Privacy Policy, which is incorporated by reference.

**11. Media and Recordings / 11.1 License**
By participating, you grant EKUZO a non-exclusive, royalty-free license to use photos, videos, audio, or recordings captured during programs for operational, training, and promotional purposes.

**11. Media and Recordings / 11.2 Parental Consent**
Where required, EKUZO will seek parental consent before public use. Additional releases may apply.

**12. Privacy**
Use of the Service is subject to EKUZO's Privacy Policy, which is incorporated by reference.

**13. Intellectual Property / 13.1 EKUZO Property**
All EKUZO content, curriculum, branding, and materials are owned by EKUZO or its licensors.

**13. Intellectual Property / 13.2 Feedback**
Any feedback or suggestions you provide may be used by EKUZO without obligation or compensation.

**14. DMCA Notice**
EKUZO respects intellectual property rights. If you believe content associated with the Service infringes your copyright, please submit a notice including: Identification of the copyrighted work; Identification of the infringing material; Your contact information; A statement of good-faith belief; A statement under penalty of perjury. DMCA Agent: EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: info@ekuzo.gg

**15. Disclaimer of Warranties**
The Service is provided "as is" and "as available." To the maximum extent permitted by law, EKUZO disclaims all warranties, express or implied.

**16. Limitation of Liability**
To the maximum extent permitted by law, EKUZO shall not be liable for indirect, incidental, or consequential damages. Total liability shall not exceed the amount paid for the applicable program.

**17. Indemnification**
You agree to indemnify and hold harmless EKUZO from claims arising from your or your student's participation or violation of these Terms.

**18. Dispute Resolution and Arbitration / 18.1 Informal Resolution**
Parties agree to attempt informal resolution first.

**18. Dispute Resolution and Arbitration / 18.2 Arbitration**
Unresolved disputes shall be resolved by binding individual arbitration, not class actions, except where prohibited by law.

**19. Governing Law**
These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles.

**20. Changes to These Terms**
EKUZO may update these Terms from time to time. Continued use of the Service constitutes acceptance of the updated Terms.

**21. Severability and Survival**
If any provision is unenforceable, the remaining provisions remain in effect. Provisions related to liability, indemnification, dispute resolution, and intellectual property survive termination.

**22. Contact Information**
EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: info@ekuzo.gg

---

---

## PAGE 16: Privacy Policy `/privacy-policy`

### Layout
Same structure as Terms of Service (PAGE 15):
- **Background:** White
- **Padding:** 188px top, 40px sides
- **Max-width:** 1232px
- **Sections gap:** 40px vertical
- **Each section:** two-column row, gap 138px — left col max-width 392px (label), right col body text
- **No footer banner**

### Typography
- Page title: **H4** — "Privacy Policy"
- Left col heading: Body M Medium
- Left col sub-label: Body S Regular Black (for A/B/C subsections)
- Right col: Body M Regular

---

### Content

**Effective Date:** February 2026

**Intro (Body M Regular):**
EKUZO Inc ("EKUZO," "we," "our," or "us") provides structured, coach-led esports and learning programs for kids and teens. We work with families and schools to deliver live, supervised experiences – not a self-serve software product. This Privacy Policy explains how we collect, use, store, and protect information about parents, guardians, students, and school partners when you engage with EKUZO through our programs or our website at ekuzo.gg. This policy is written for parents and guardians. Students participate in EKUZO programs only with parental or school consent, and parents remain the responsible decision-makers.

---

**1. Who We Are**
Legal name: EKUZO Inc. Entity type: Delaware C Corporation. Address: 5617 Dolores Street, Houston, Texas 77057. Website: ekuzo.gg

**2. Scope of This Policy**
This policy applies to information collected through: EKUZO enrollment forms and communications; Live coaching sessions and team coordination; Our website and basic analytics; Email and program communications. EKUZO is a service-based program, not a consumer software platform. Parents and schools are the customers and decision-makers. Students participate as minors under adult consent.

**3. Information We Collect**
We collect only the information reasonably necessary to run safe, effective, coach-led programs.

**A. Parent / Guardian Information**
We may collect: Full name; Email address; Phone number (if provided); Payment information (processed securely by a third-party provider); Communication preferences. We do not store full payment card numbers on EKUZO systems.

**B. Student Information**
We may collect: Student full name; Age range; Games played; Availability windows; Team placement information; School name (for school-based programs). During programs, EKUZO coaches also maintain coaching notes (for example: progress, communication patterns, and areas of growth) to support personalized development and continuity across sessions.

**C. Live Session Data (Voice, Video, Chat)**
EKUZO programs are delivered through live, coach-led sessions, currently using Discord. As part of providing the service: Sessions include voice and video participation; Text and voice communication may occur between teammates; All sessions are recorded for safety, quality assurance, and coaching continuity; Team Discord spaces are actively moderated. These recordings are used to: Support coach training and accountability; Ensure student safety; Review incidents if concerns are raised; Improve program quality. They are not used for advertising or unrelated purposes.

**D. Technical & Website Information**
When you visit ekuzo.gg, we may collect limited technical data such as: IP address; Browser type; Pages visited; General usage patterns. This information is collected through standard analytics and cookies (see Section 8).

**4. How We Use Information**
We use information to: Deliver and operate EKUZO programs; Place students on appropriate teams; Support coaching, development, and safety; Communicate schedules, updates, and program information; Process payments and enrollment; Maintain records required for safety and accountability; Improve our programs and services. We do not sell personal information.

**A. Service Providers**
We use trusted third-party providers to operate our programs, including: Discord – for live coaching sessions and team communication; Stripe – for payment processing; Email and infrastructure providers that support communications and operations. These providers receive only the information needed to perform their services and are expected to protect it appropriately.

**B. Schools**
When EKUZO programs are delivered through schools, we may share relevant enrollment or participation information with the partnering school, consistent with the school's role and parental consent.

**C. Legal or Safety Reasons**
We may disclose information if required to: Comply with legal obligations; Protect the safety of students, families, coaches, or the public; Investigate or respond to serious concerns.

**6. Children's Privacy & Parental Role**
EKUZO programs are designed for minors, and we take that responsibility seriously. Parents or guardians provide consent for participation; Parents remain the responsible parties for decisions related to their child; Students do not create independent consumer accounts with EKUZO; Coaches and staff are trained to work with minors in supervised environments. We take steps to design programs, communications, and data practices with children's safety and well-being in mind.

**7. Communications & Email Preferences**
Parents and schools may receive: Transactional communications (required): schedules, enrollment confirmations, safety updates; Program updates related to active participation; Optional newsletters or announcements. You may opt out of non-essential emails at any time using standard unsubscribe methods. Transactional communications cannot be disabled, as they are required to deliver the service.

**8. Cookies & Analytics**
EKUZO uses basic cookies and analytics to understand how our website is used and to improve it. Cookies help us: Understand which pages are helpful; Improve site performance; Avoid technical issues. You can control cookies through your browser settings. Disabling cookies may affect site functionality but will not affect program participation.

**9. Data Retention**
EKUZO retains records, including coaching notes and session recordings, for up to five (5) years. We do this to: Support long-term safety and accountability; Address delayed concerns or incidents; Maintain consistent coaching records. When information is no longer needed, we take reasonable steps to delete or anonymize it.

**10. Data Security**
We use reasonable administrative, technical, and organizational safeguards to protect information, including: Access controls; Secure systems and vendors; Staff training and oversight. No system is perfectly secure, but we work to protect information appropriate to the nature of our programs and the sensitivity of working with minors.

**11. Parent Rights: Access, Updates, and Deletion**
Parents or guardians may request to: Access information we have about their child; Correct inaccurate information; Request deletion of certain records (including coaching notes), subject to our retention obligations. Requests can be made by contacting us at the email below. We may need to verify your identity before responding.

**12. U.S. Operations & California Privacy Rights**
EKUZO is a United States–based organization and currently operates its programs primarily within the United States. We do not actively market or offer programs in the European Union. California Residents: If you are a California resident, you may have additional rights regarding access to and deletion of personal information under California law. EKUZO does not sell personal information. Parents or guardians may request access to or deletion of information about their child. Requests are handled as described in Section 11 above.

**13. Media, Photos, and Recordings**
EKUZO may occasionally share photos, clips, or quotes from programs to reflect the experience. We aim to obtain parental permission before public use. Session recordings are primarily for internal safety and quality purposes. We do not sell or license student likenesses for advertising. Separate consent may apply where required.

**14. Changes to This Policy**
We may update this Privacy Policy as EKUZO grows or our practices evolve. Updates will be posted on our website with a revised effective date. Continued participation after changes means you accept the updated policy.

**15. Contact Us**
EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: INFO@ekuzo.gg. This Privacy Policy is intended to clearly explain how EKUZO operates and how we treat information with care and respect. It is designed to support transparency and trust for families and schools.

---

---

## PAGE 17: Blog Index `/blog`

### Assets
- `blog-hero-torn.png` — full-width torn paper, bottom of hero (centerY 73%)
- `blog-featured-hero.jpg` — featured blog card hero image
- `blog-post-1-card.jpg` — card thumbnail for post 1

---

### Section 1 — Hero
- **Background:** White (page bg)
- **Padding:** 240px top, 144px bottom, 40px sides
- **H2 (Bebas Neue, uppercase, centered):** "STORIES OF GAMING AND GROWTH"
- **Featured blog card** (below heading, max-width 1232px):
  - Links to `/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng`
  - Title: "Our Family's Esports Journey with EKUZO and the K1ng"
  - Excerpt: "My son Ryan was always a happy kid in his early years."
  - Hero image: `blog-featured-hero.jpg`
- **Torn paper:** `blog-hero-torn.png` — absolute, full-width, centerY 73%

---

### Section 2 — All Blogs
- **Background:** White
- **Padding:** 144px top, 188px bottom, 40px sides
- **Max-width:** 1232px centered
- **H4:** "All blogs"
- **Blog filter + grid** — category filter tabs above a responsive card grid
  - Categories from CMS: "Case Studies", "Testimonials"
  - Cards render all published blog posts (2 currently)

### Blog Posts (CMS data)
1. **"Our Family's Esports Journey with EKUZO and the K1ng"**
   - Slug: `our-family-s-esports-journey-with-ekuso-and-the-k1ng`
   - Featured: true
   - Date: January 14, 2026
   - Category: Case Studies
   - Excerpt: "My son Ryan was always a happy kid in his early years."
   - Hero image: `blog-featured-hero.jpg`
   - Card thumbnail: `blog-post-1-card.jpg`
   - Author: Lisa (last name in CMS)

2. **"Conquering my Mountain and Giants: How Esports changed my life"**
   - Slug: `conquering-my-mountain-and-giants-how-esports-changed-my-life`
   - Featured: false
   - Date: January 14, 2026
   - Category: Testimonials
   - Hero image: `blog-post-2-featured.jpg`
   - Card thumbnail: `blog-post-2-card.jpg`
   - Author: John Hay

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Enroll into a transformational program today"
- FAQ section visible (`kylqqg5uj="true"`)

---

## PAGE 18: Blog Post `/blog/:slug`

### Assets
- `blog-slug-right-deco.png` — 539×677px decorative image, right edge, centerY 5%
- `blog-post-2-hero.png` — used as hero banner image in blog post 2
- Blog post images reused from blog index page

---

### Layout
- **Background:** White
- **Page padding:** 140px top/bottom, 20px sides
- **Max-width:** 1232px

---

### Section 1 — Hero
- **Padding:** 188px top, 80px bottom, 80px sides
- **Decorative:** `blog-slug-right-deco.png` — absolute, 539×677px, right edge, centerY 5%
- **Post title (H4, max-width 720px):** dynamic from CMS
- **Hero banner image** — full-width within content area
- **Author line:** "by [First] [Last]" (Label XS Medium)

---

### Section 2 — Article Body
- **Padding:** 188px top, 244px bottom
- **Max-width:** 1232px
- **Two-column layout, gap 138px:**
  - Left col (max-width 392px): sticky metadata sidebar (date, author)
  - Right col: full article body (Body M Regular, formatted HTML from CMS)

---

### Section 3 — "Keep reading"
- **H4:** "Keep reading"
- **3-column grid** of other blog post cards (gap 32px), max 2 rows
- Links to `/blog/:slug`

---

### Footer Banner
- **Component:** `<FooterBanner />`
- **Heading:** "Increase attendance and engagement in your school"
- FAQ section visible (`kylqqg5uj="true"`)

---

### Blog Post Content

**Post 1 — "Our Family's Esports Journey with EKUZO and the K1ng"**
Full article stored in CMS (`pc9rSQDcd` field). See CMS for complete HTML content. Author: Lisa.

**Post 2 — "Conquering my Mountain and Giants: How Esports changed my life"**
Full article stored in CMS (`pc9rSQDcd` field). See CMS for complete HTML content. Author: John Hay.

---

---

## PAGE 19: Forms (Dev/Staging) `/forms`

This is an internal reference page that renders all four enrollment/contact forms stacked vertically — used for testing. Not linked from public nav.

### Layout
- **Background:** White
- **Padding:** 160px top, max-width 1232px centered
- **Gap between forms:** 26px
- **Each form:** white bg, 20px padding, 24px gap between fields

---

### Form 1 — "Start a conversation" (Contact / Schools)
- **Title (H5):** "Start a conversation"
- Fields:
  - Name (text, required *)
  - Organization (text, optional)
  - Toggle component (iisrDee_L) — likely "I represent a school"
  - What are you hoping to explore (text, optional)
- **Button:** "Submit" — white bg, red text

### Form 2 — EKUZO100
- **Title (H5):** "EKUZO100"
- Same as PAGE 13 (ekuzo100-4-week-intro):
  - Parent name *, Parent email *, Student name *, Student age (10-12/13-15/16-18) *, Student gender (Male/Female/Non-binary) *, Main games, Schedule (Afternoon/Evening)
- **Button:** "Next" — red bg, white text

### Form 3 — EKUZOTEAMS
- **Title (H5):** "EKUZOTEAMS"
- Same as PAGE 12 (ekuzoteams-semester-based):
  - Parent name *, Parent email *, Student name *, Student age *, Student gender *, Main games, Schedule (Afternoon/Evening/During school day)
- **Button:** "Next" — red bg, white text

### Form 4 — EKUZOCAMPS
- **Title (H5):** "EKUZOCAMPS"
- Same as PAGE 14 (ekuzocamps-seasonal):
  - Name *, Email *
- **Button:** "Get notified when available" — white bg, red text

---

## BUILD INSTRUCTIONS FOR CLAUDE CODE

When all pages are filled in above, use this prompt:

```
Read PAGES-SPEC.md in full. Build all pages listed, in order, as Next.js App Router pages using Tailwind CSS.

Rules:
- Reuse shared components — never duplicate Nav, Footer, TornPaper, ProgramsSection, TestimonialsSection, FaqSection, FooterBanner
- All assets are in /public/images/ and /public/animations/
- Match exact padding, colors, and typography from the spec
- Use Bebas Neue for all display/hero headings (Tungsten Narrow placeholder)
- Use Inter for all body and UI text (Test Die Grotesk placeholder)
- For Rive animations, install @rive-app/react-canvas and use the .riv files in /public/animations/
- Mobile responsive: stack all horizontal layouts vertically on mobile
- Build one page at a time, confirm each compiles before moving to the next
```
