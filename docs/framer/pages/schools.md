# Schools (/schools)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: b27u4qjdH
- **Tablet** (810px) — nodeId: eDmRHhAsZ
- **Phone** (390px) — nodeId: y_ESJyCsg

## SECTIONS (in order)

### 1. Hero
- **Background:** White
- **Layout:** stack vertical, padding 188px top, 360px bottom
- **Max width content:** 1232px
- **Key content:**
  - Headline (2 lines):
    - "ESPORTS THAT BELONG IN" — `/Display/Heading 1`, 256px, uppercase
    - "SCHOOLS" — `/Display/Heading 1`
  - Character image (absolute, 1089px×1464px, centerX 36%, centerY 93%): `GNb9UYs1xyYbhktbgRZ0BEehg.png`
  - Right graphic (absolute, 512px×494px, right 0): `sot10ho1rrJgFBf94VWYgkhLEA.png`

### 2. Our Approach / What is EKUZO?
- Component: `QsAFUtqlA` variant `sC1TmQc1L`
- **Props:**
  - Heading: "What is EKUZO?"
  - List items: "Structured practice" / "Skilled coaching" / "Growth through play"
  - Body: "Gaming is one of the most powerful motivators young people have... EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don't just play. They practice, communicate, lead, and reflect. This isn't about fixing kids. It's about building the structure most of them are missing."
  - Background: `rgb(239, 238, 237)`
  - Extra section visible: true (Gp6avFGQM)

### 3. Ecosystem Animation Section
- **Height:** 360vh, no explicit background
- **Padding:** 188px top/bottom
- Component: `frGiDQi` (Home_schools.tsx), sticky top: 0
- **Components used:** Black2 torn paper at top

### 4. Why Schools Choose EKUZO
- **Background:** Light Grey (`/Grey/Light Grey`)
- **Padding:** 144px top, 240px bottom
- **Key content:**
  - Large card (J5646SU6d):
    - Heading: "Why schools choose EKUZO?"
    - Body: "Schools don't choose EKUZO because they want esports. They choose it because they're facing real student challenges and need a solution that fits inside academic priorities, staffing limits, and community expectations. EKUZO is designed to help schools act thoughtfully, without taking on unnecessary risk, burden, or distraction."
    - Background: `rgb(255, 255, 255)`
  - Decorative circles (background): left circle 1697×1561px, right circle 912×1884px
  - 4 feature cards (zigzag, alternating end/start):
    - "Hard problems, not bad students" — "Disengagement and anxiety are systemic challenges, not discipline issues."
    - "Built to run, not to improvise" — "Coaching, curriculum, competition, and safety are designed to work together."
    - "Easy to implement" — "Clear roles, predictable structure, and external coaches reduce lift for school staff."
    - "Youth development first" — "Gaming is the medium; growth, skills, and belonging are the goals."
  - Decorative images scattered in background between cards
- **Components used:** White2 torn paper at top and bottom

### 5. Programs Section (Schools Only)
- Component: `QVJuYtM47` variant `xZ55PUzBl`
- Shows EKUZO Teams only (hK16UEwE3=true, q5dQx7YIm=false, TFkM3R0rj=false)

### 6. What Schools See In Their Students (Ticker)
- **Background:** Black
- **Padding:** 144px top, 188px bottom
- **Components used:** Black1 torn paper at top
- **Key content:**
  - Eyebrow: "PROGRAMS"
  - Heading: "What Schools See in their Students" — `/Display/Heading 4`
  - Ticker with 4 dark cards (black background, variant beiSYiz3X):
    - "Attendance" — "Students show up more consistently when they belong to a team with shared goals."
    - "Engagement" — "Motivation earned in practice carries into class, behavior, and daily energy."
    - "Belonging" — "Students who didn't connect elsewhere find a place to contribute and be seen."
    - "Skills" — "Communication, leadership, and digital skills develop through coached team play."

### 7. Testimonials Section
- Component: `yY5pfBKjH` variant `cQaERloUl`
- Quote: "Once students see what they're capable of, you don't have to push them. They push themselves."
- Attribution: Karlin Oei

### 8. The Pedagogy Behind the Program (Ticker)
- **Background:** White
- **Padding:** 188px top/bottom
- **Key content:**
  - Heading: "The pedagogy behind the program" — `/Display/Heading 4`
  - Body: "EKUZO is built on proven learning principles, applied inside a structure students already care about."
  - Ticker with 4 light grey cards:
    - "Motivation" — "Visible wins build intrinsic drive, turning effort into enthusiasm."
    - "Feedback loops" — "Every class follows a rhythm of show up, learn, grow and reflect."
    - "Social learning" — "Students collaborate, communicate, and lead in authentic, high-pressure situations."
    - "Skills development" — "What begins as play becomes practice for life."

### 9. FAQs + Footer Banner
- FaqSection (`x3eHpc90M`, variant `mlurInN15`)
- FooterBannerSection (`BNRkYbJEX`, variant `QbZSddxCo`)
- CTA: "Increase attendance and engagement in your school"

## COMPONENTS USED
- OurApproachSection (QsAFUtqlA)
- HomeDesktop Rive (frGiDQi)
- HowItWorksSectionLargeCard (J5646SU6d)
- Card/iop5RYIDR — feature cards (zigzag)
- ProgramsSection (QVJuYtM47) — Teams only
- Card/mTrbgx1O_ — ticker cards (dark + light variants)
- Black1 (xXXvJAqHn) — torn paper
- White2 (cllBPIiNd) — torn paper
- TestimonialsSection (yY5pfBKjH)
- FaqSection (x3eHpc90M)
- FooterBannerSection (BNRkYbJEX)

## INTERACTIONS + ANIMATIONS
- Ecosystem: scroll-driven Rive (frGiDQi)
- Schools ticker: horizontal overflow strip with dark card variant
- Pedagogy ticker: horizontal overflow strip with light grey card variant
- Feature cards: zigzag alternating layout

## NOTES
- Programs section only shows EKUZO Teams (school-facing), not EKUZO100 or EKUZOCamps
- Footer CTA copy is unique to this page: "Increase attendance and engagement in your school"
- Schools page has no testimonial carousel — uses TestimonialsSection component (yY5pfBKjH) instead, which is a different layout (single large quote + video)
- Ticker on dark section uses variant beiSYiz3X (dark/black cards) vs DDIXV3F3Z (light grey cards) on other pages
