# Games (/games)

## BREAKPOINTS
- **DesktopLarge** (1920px) — primary breakpoint
- **Desktop** (1200px) — nodeId: CNGQoSrMz
- **Tablet** (810px) — nodeId: SHFonrFmb
- **Phone** (390px) — nodeId: pGQbHKIYd

## SECTIONS (in order)

### 1. Hero
- **Background:** Red (`/Red/Red`)
- **Layout:** stack vertical, padding 188px top
- **Key content:**
  - Headline: "What Growth Through Games Really Requires" — `/Display/Heading 2`
  - Hero image (below headline, full width): `UfjqtSLCvajiLO8PI8MJak7cXTY.png`
- **Components used:** White1 torn paper at bottom (absolute, centerY 99%)

### 2. Games Spark Motivation
- **Padding:** 144px top/bottom
- **Max width:** 1232px
- **Key content:**
  - Heading: "Games spark motivation." — `/Display/Heading 4`
  - Body (right column): "Structure turns it into growth. Students come to EKUZO through many different games, and we respect the passion they bring with them. But when it comes to teaching — helping students build confidence, leadership, and real-world skills — growth depends on more than just play."
- Decorative image (absolute, centerX 22%, centerY 73%): `5I9cKE5vflntneL84TuEElhs3QI.png`

### 3. Sticky Feature Cards (Growth Requirements)
- **Padding:** 144px top, 188px bottom
- **Gap:** 144px between cards
- **Layout:** 2-column horizontal, sticky at top 80px
  - **Left (30% width):** LeftImage component (`uej9tbzM3`, variant `xmT_YWPkV`), sticky
  - **Right:** 6 EcosystemSectionCard (HnNOtigLD, variant `VwEfdN1Q3`), each sticky top 0, height 542px (last 626px)
    - "MOTIVATION" — "Games work because students care. Motivation drives focus, persistence, and the willingness to try again."
    - "Challenge" — "Games naturally push back. Failure isn't the end - it's feedback."
    - "TEAM CONTEXT" — "When success depends on others, learning becomes social. Students practice communication, responsibility, and trust."
    - "STRUCTURE" — "Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe."
    - "COACHING & REFLECTION" — "Coaching adds feedback, reflection, and leadership development."
    - "Where All of This Comes Together" — "Many games support parts of this growth. Very few support it consistently, across different skill levels."
- **Components used:** Black1 torn paper at bottom (absolute, centerY 99%)

### 4. Why League of Legends
- **Background:** Black
- **Padding:** 144px top, 188px bottom
- **Key content:**
  - Heading: "League of Legends strikes that balance"
  - Body: "That balance comes from 3 things:"
  - 3 dark cards (mTrbgx1O_ variant beiSYiz3X, black bg):
    - "Strategic depth" — "Challenges students to think ahead, adapt, and make meaningful decisions."
    - "Approachable mechanics" — "Easy to start, forgiving to learn, and accessible without overwhelming beginners."
    - "Stable roles and systems" — "Clear roles and systems that make teamwork and leadership teachable."
- Decorative torn paper image at bottom (absolute, centerY 104%): `FeQi62FV9fxmeo1VbqJoycOyQM.png`

### 5. Where Other Games Fit
- **Background:** Red (`/Red/Red`)
- **Overflow:** hidden
- **Padding:** 144px top/bottom
- **Max width:** 1232px
- **Key content:**
  - Heading: "Where other games fit" — `/Display/Heading 4`
  - Subhead: "Other games are often where students start."
  - Large H3 text: "They spark interest, build motivation, and create momentum." — `/Display/Heading 3`
  - Illustration (left, 40% width): `2Ams8p5lSZiYc2Fh969Nbt2T90w.png`

### 6. Testimonial
- **Background:** White
- **Padding:** 188px 40px
- **Key content:**
  - Quote (H5): "EKUZO meets students through the games they love, but teaches through the game that allows growth to compound."
  - Attribution: "Karlin Oei" (L/Bold), "Founder EKUZO" (L/Bold, opacity 0.6)
  - Decorative: quotation mark image (40×40px): `GE67COEYXzm6XnVTXOgfSNb8Bfk.png`
- **Components used:** Red1 (UdVin8rIr, variant rX_pxBx9v) torn paper at top and bottom

### 7. Footer Banner
- Component: `BNRkYbJEX` variant `QbZSddxCo`
- CTA: "Enroll into a transformational program today"

### 8. Scroll Button (fixed)
- Component: `xCwzWyfvL` (Scroll-Button), variant `QkKdtWZEJ`
- Labels: "Enroll my gamer" + "Start a conversation"
- Fixed to bottom of viewport
- Q4hLeHNFN="true" (enabled)

## COMPONENTS USED
- LeftImage/uej9tbzM3 — sticky left illustration panel
- EcosystemSectionCard (HnNOtigLD) — 6 sticky scroll-linked feature cards
- Card/mTrbgx1O_ — dark 3-card row (League of Legends section)
- White1 (lgis88RSC), Black1 (xXXvJAqHn), Red1 (UdVin8rIr) — torn paper variants
- FooterBannerSection (BNRkYbJEX)
- Scroll-Button (xCwzWyfvL) — fixed mobile CTA bar

## INTERACTIONS + ANIMATIONS
- Sticky scroll: 6 cards on right side are each `position="sticky" top="0"` — they stack as user scrolls, creating a progressive reveal effect
- Left image panel is also sticky: `position="sticky" top="0"` — stays fixed while right cards scroll past
- ScrollButton (fixed): dual-CTA sticky bar at bottom of viewport — only instance on this page

## NOTES
- Only page with the Scroll-Button (fixed dual CTA) component — this may be the global mobile sticky CTA that was causing issues (noted in CLAUDE.md known issues)
- No Rive animation on this page
- "Where other games fit" section uses `/Display/Heading 3` (120px, uppercase) for the main statement — large format
- Testimonial uses Red1 torn paper (rX_pxBx9v variant) rather than Black2/White2 — red decorative dividers
- Attribution shows "Founder EKUZO" at 60% opacity — different from other attribution styles
- Hero image filename suggests it's a photography asset: UfjqtSLCvajiLO8PI8MJak7cXTY.png
