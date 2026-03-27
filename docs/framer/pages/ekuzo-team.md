# EKUZO Team (/ekuzo-team)

NOTE: nodeId hgW7CkVpp, path /ekuzo-team. All sections on this page use absolute positioning (position="absolute" with centerX/centerY) rather than in-flow stack layout. This is a structural anomaly — the page appears to have been designed with absolute/overlay layers rather than a standard vertical stack. Same content as /ekuzoteams-semester-based but different layout mode.

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: XCJvZSNVU
- **Tablet** (810px) — nodeId: YzMWZvp9a
- **Phone** (390px) — nodeId: H_92SIfD2

## SECTIONS (in order, reconstructed from absolute positioning)

### 1. Hero (absolute, centerY ~82%)
- **Background:** White
- **Layout:** stack horizontal, padding 188px
- **Left column:**
  - Headline: "EKUZO teams" — `/Display/Heading 2`, 160px
  - Body: "The semester-based team seasons: structured like sports, built through practice."
  - CTA: "Enroll my gamer" (variant `i23twOWvo`, red-filled)
- **Right column:**
  - Video: `https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4` — full height, loop, controls, not autoplay
- **Decorative:** Left image (834×330px, bottom-left): `xTChNx6XfvoFhbY1Bcn2oOEXo.png`, Right image (834×993px, top-right): `KgMvrQSsGRnH6wzsNBsGN35ros.png`

### 2. Our Approach (absolute, centerY ~45%)
- Component: `QsAFUtqlA` variant `sC1TmQc1L`
- **Props:**
  - Heading: "Teams Are Where Growth Compounds"
  - List: "Structured season" / "Consistent team" / "Coach-led practice"
  - Body: "EKUZO Teams mirror traditional sports seasons: the same teammates, a shared rhythm, and clear expectations over time. As relationships deepen, students stop just showing up and start taking ownership of their team, their role, and how they improve together. What starts in practice doesn't stay there. The friendships, collaboration, and confidence spill beyond sessions and into everyday life."
  - Background: `rgb(239, 238, 237)`

### 3. A Real Team Season (absolute, centerY ~86%)
- **Heading:** "A Real Team Season" — `/Display/Heading 4`
- **Padding:** 144px top, 188px bottom
- **3 dark cards (mTrbgx1O_ variant DDIXV3F3Z, black bg):**
  - "Semester-Based" — "Designed as a full team season, similar to traditional sports programs."
  - "Consistent Team" — "Players train with the same teammates over time, building trust and accountability."
  - "Season Arc" — "Practices and scrimmages lead toward a culminating end-of-season showcase."

### 4. Session Structure (absolute, centerY ~51%)
- **Padding:** 144px top/bottom
- **Large card (J5646SU6d):** "Each EKUZO100 cohort follows the same one-month structure." / "Every EKUZO Team session follows the same intentional structure, whether it's hosted during or after the school day."
- **4 feature cards (zigzag):**
  - "Learn" — "Coach introduces a team focus or skill for the session."
  - "Practice" — "Players apply it through structured drills and team-based play."
  - "Apply" — "Guided scrimmage scenarios reinforce communication and coordination."
  - "Reflect" — "Coach-led discussion connects performance to improvement and team goals."
- **Red quote strip:** "Teams work toward shared goals through recurring competition, with the season culminating in a showcase that brings everything together." — `/Display/Heading 5`

### 5. Two Ways to Run EKUZO Teams (absolute, centerY ~86%)
- **Background:** Black
- **Padding:** 188px
- **Key content:**
  - Eyebrow: "HOW TEAMS WORKS" (note: grammatical as-is in Framer)
  - Heading: "Two Ways to Run EKUZO Teams"
  - Body: "Students join the same EKUZO experience, either through their school or from home."
  - Watermark: "LEARN + PLAY"
  - 2 cards using specialized components:
    - SchoolCard (`qVNIekiWp` variant `qU6PqCqBh`) — "SCHOOL"
    - HomeCard (`hdru6dLe5` variant `p4NsxrkAo`) — "HOME"
  - Button: "See programs" → `/programs`
- **Components used:** White2 torn paper at top

### 6. Ecosystem Animation (absolute, centerY ~85%)
- **Background:** Light Grey
- **Height:** 360vh
- Component: `frGiDQi`, position absolute (not sticky — unusual)
- **Components used:** Black2 at top, White1 at bottom

### 7. Testimonial Carousel (absolute, centerY ~71%)
- **Background:** White
- **Heading:** "Real stories from EKUZO families"
- Slideshow: 640px, 3 items

### 8. How Teams Fit Into the EKUZO System (top: 9717px)
- **Background:** Light Grey
- **Heading:** "How Teams Fit Into the EKUZO System" — `/Display/Heading 4`
- **Body:** "Many students begin with EKUZO100 to experience the system with low commitment. Teams are where most students stay: building habits, relationships, and confidence over time. Camps offer short, focused bursts that supplement or accelerate growth. Families decide next steps after experiencing the program firsthand."

### 9. FAQs + Footer Banner
- FaqSection (`x3eHpc90M`, variant `mlurInN15`)
- FooterBannerSection (`BNRkYbJEX`, variant `QbZSddxCo`)
- CTA: "Enroll into a transformational program today"

## COMPONENTS USED
- OurApproachSection (QsAFUtqlA)
- HowItWorksSectionLargeCard (J5646SU6d)
- Card/mTrbgx1O_ — dark season arc cards
- Card/iop5RYIDR — session structure cards (zigzag)
- SchoolCard (qVNIekiWp) — school-specific format card
- HomeCard (hdru6dLe5) — home-specific format card
- HomeDesktop Rive (frGiDQi)
- Black2 (VZgZ8tZvl), White1 (lgis88RSC), White2 (cllBPIiNd) — torn paper
- FaqSection (x3eHpc90M)
- FooterBannerSection (BNRkYbJEX)

## NOTES
- ALL sections on this page use absolute positioning (position="absolute") — not standard in-flow. This is structurally unusual and likely means sections overlap in Framer canvas unless carefully spaced by their centerY percentages
- Uses School-Card (qVNIekiWp) and Home-Card (hdru6dLe5) components — unique to this page and /ekuzoteams-semester-based. These are specialized variants not used elsewhere
- Eyebrow says "HOW TEAMS WORKS" (grammatical error — flag for Next.js)
- Same hero video as ekuzo100 and pedagogy pages
- Ecosystem Rive uses position="absolute" not "sticky" — scroll behavior may differ from other pages
