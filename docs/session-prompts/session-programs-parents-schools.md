# Session: Build /programs, /parents, /schools

## Context
Read `CLAUDE.md` before starting. This is the EKUZO Next.js rebuild — matching the live Framer site at ekuzo.gg. All spacing, typography, colors, and images are Framer-exact.

**Framer extraction docs are your source of truth:**
- `/docs/framer/pages/programs.md`
- `/docs/framer/pages/parents.md`
- `/docs/framer/pages/schools.md`
- `/docs/framer/system/design-tokens.md`
- `/docs/framer/system/components/OurApproachSection.xml`
- `/docs/framer/system/components/ProgramsSection.xml`
- `/docs/framer/system/components/TestimonialsSection.xml`

---

## Goal
Build three full pages — `/programs`, `/parents`, `/schools` — replacing the current stubs. All three share core section components. Build shared components first, then assemble the pages.

**Work order:** shared components → /programs → /parents → /schools

---

## What Already Exists (do not rebuild)
- `components/layout/Nav.tsx` — `variant="light"` (white bg) | `"dark"` (red bg)
- `components/layout/Footer.tsx`
- `components/ui/TornPaper.tsx` — `color="white"|"black"|"red"`, `flip` prop
- `components/ui/Button.tsx`
- `components/ui/ModalButton.tsx` — for modal CTAs in server components
- `components/ui/FAQAccordion.tsx` — `theme="light"|"dark"`
- `components/sections/FooterBanner.tsx`
- `components/sections/EcosystemAnimation.tsx` — needs `scrollPx` prop added (see below)
- `components/sections/TestimonialsCarousel.tsx`
- `context/ModalContext.tsx` + `useModal()` hook

---

## Design Tokens (from Framer)
```
Red:        #F92524  (rgb(249, 37, 36))
Black:      #000000
White:      #FFFFFF
Light Grey: #EFEEEF  (rgb(239, 238, 237))

Display H1: font-display, 256px / 228px line-height, uppercase
Display H2: font-display, 160px / 140px line-height, uppercase, letter-spacing 3.2px
Display H3: font-display, 120px / 96px line-height, uppercase
Section H4: font-body font-bold, 64px / 64px line-height, letter-spacing -1.28px
Section H5: font-body font-bold, 40px / 48px line-height
Body L:     font-body, 28px / 38px line-height
Body M:     font-body, 24px / 34px line-height
Body S:     font-body, 20px / 28px line-height
Eyebrow:    font-body font-medium, 16px, uppercase, letter-spacing 10px

Max content width: 1232px
Standard section padding: 188px top/bottom
Horizontal padding (DesktopLarge): 104px
```

---

## Step 1: Fix EcosystemAnimation — add scrollPx prop

In `components/sections/EcosystemAnimation.tsx`, the desktop variant hardcodes `DESKTOP_SCROLL_PX = 10000`. Programs/parents/schools pages use 14000. Add a `scrollPx` prop (default 10000) so this can be overridden without duplicating the component.

---

## Step 2: Create Shared Section Components

### 2a. `components/sections/OurApproachSection.tsx`
Reused on all 3 pages (and programs is default content). Server component.

Props:
```ts
{
  heading: string          // e.g. "Built for growth, on and off the screen"
  listItems: string[]      // exactly 3 items
  body: string
  bg?: string              // Tailwind bg class, default "bg-white"
  showImage?: boolean      // default true — shows collage image on right (desktop)
}
```

Layout (from Framer `QsAFUtqlA`):
- Full-width section, bg from prop
- Inner max-w-[1232px] mx-auto
- Padding: `pt-[188px] pb-[188px] px-[104px]`
- **Top half:** Eyebrow "OUR APPROACH" (red, uppercase, letter-spacing 10px) + H4 heading — left-aligned, maxWidth 600px, gap 16px
- **Bottom half:** two columns, gap 160px:
  - Left: 3 list items (checkmark/bullet, Body L bold)
  - Right: Body M regular copy
- Black3 torn paper divider at bottom (`<TornPaper color="black" style={3} />`)
- Mobile: stacks to single column

### 2b. `components/sections/ProgramsSection.tsx`
The sticky-scroll 3-card programs overview. Client component (needs sticky scroll).

Props:
```ts
{
  showTeams?: boolean   // default true
  showEkuzo100?: boolean  // default true
  showCamps?: boolean   // default true
}
```

Layout (from Framer `QVJuYtM47`):
- Full-width section, no background (cards have their own bg images)
- Padding: `pt-[188px] pb-[188px] px-[80px]`
- Inner max-w-[1232px] mx-auto
- **Header:** Eyebrow "PROGRAMS" + H4 "3 programs. 1 system. 1 esport experience."
- **Cards container:** `position: sticky, top: 80px` with gap 120px between cards
- **3 cards** (each `position: sticky`):
  - EKUZOTEAMS: `top: 40px`, bg image `/images/program-card-bg-1.png`, padding 88px
    - H1 "eKUzOteams", stats: **15** weeks / **2-3x** practice weekly / **During or After** School
    - Body L: "Best for: students and schools ready for ongoing growth."
    - Button → `/ekuzo-team`, label "Learn more about EKUZOTEAMS"
  - ekuzo100: `top: 160px`, bg image `/images/program-card-bg-1.png`, padding 88px
    - H1 "ekuzo100", stats: **4** weeks / **2x** weekly / **After** school
    - Body L: "Best for: first-time students or families curious about esports."
    - Button → `/ekuzo100`, label "Learn more about EKUZO100"
  - ekuzocamps: `top: 240px`, bg image `/images/program-card-bg-2.png`, padding 88px
    - H1 "ekuzocamps", stats: **1** week / **10** teammates / **Summer / holiday** break
    - Body L: "Best for: students who want a burst of activity during breaks."
    - Button → `/ekuzocamps-seasonal`, label "Learn more about EKUZOCAMPS"
- Stats row layout: each stat is a pair of (H5 number + Body M bold label, opacity 0.7), horizontal, gap 48px
- Show/hide cards based on props
- Mobile: cards stack normally (no sticky), single column

### 2c. `components/sections/TwoWaysSection.tsx`
Used on /programs. Black bg section with 2 cards (SCHOOL | HOME).

No props needed (content is fixed for /programs).

Layout (from Framer programs section 4):
- Black bg, padding `pt-[188px] pb-[188px] px-[104px]`
- `<TornPaper color="white" style={2} />` at top
- `<TornPaper color="black" style={2} />` at bottom
- Eyebrow "HOW IT WORKS" (white)
- H4 "Two ways to participate" (white)
- Body L "Students join the same EKUZO experience, either through their school or from home." (white)
- Watermark text: "LEARN + PLAY" — absolute positioned, centerX 50%, centerY 48%, H1 size, opacity 0.08, white, uppercase
- 2 cards side by side (1fr each), gap 32px:
  - **SCHOOL card**: label "For schools", body "For schools that want to bring EKUZO on campus.", link → `/schools`
  - **HOME card**: label "For families", body "Students join individually from home in a fully online format.", link → `/parents`
- Mobile: 2 cards stack to single column

### 2d. `components/sections/FeatureCardsSection.tsx`
Used on /parents and /schools. Large card + zigzag feature cards.

Props:
```ts
{
  heading: string
  body: string
  cardBg?: string          // Tailwind bg class for large card, default "bg-[#EFEEEF]"
  sectionBg?: string       // section bg, default "bg-transparent"
  features: Array<{
    title: string
    body: string
  }>
  bgImage?: string         // optional section background image (CSS url)
}
```

Layout (from Framer `J5646SU6d` pattern):
- Full-width section, bg/image from props
- Padding: `pt-[188px] pb-[188px] px-[104px]`
- Large card (full width, bg from `cardBg`, padding 64px, border-radius 2px):
  - H4 heading
  - Body L
- Feature cards (below large card, gap 32px vertical):
  - Alternating alignment: odd rows `justify-end`, even rows `justify-start`
  - Each card: ~560px wide, padding 48px, bg white (or as specified), H5 title + Body M
- Mobile: large card full width, feature cards full width stacked

### 2e. `components/sections/TickerSection.tsx`
Horizontal scrolling card strip. Used on /parents and /schools.

Props:
```ts
{
  eyebrow?: string
  heading: string
  body?: string
  cards: Array<{ title: string; body: string }>
  theme?: "light" | "dark"   // light = grey cards on white/grey bg; dark = dark cards on black bg
  cta?: { label: string; href: string }
  bg?: string   // Tailwind bg class
}
```

Layout (from Framer ticker sections):
- Section padding `pt-[188px] pb-[188px] px-[104px]` (adjust for dark theme: `pt-[144px] pb-[188px]`)
- Eyebrow + H4 heading + optional Body M — left-aligned, max-w-[600px]
- Cards container: `overflow-x-auto`, flex row, gap 24px, no-wrap
  - Each card: min-w-[320px], padding 40px, H5 title + Body L
  - `light` theme: bg `#EFEEEF`, text black
  - `dark` theme: bg `rgba(255,255,255,0.06)`, text white, border `rgba(255,255,255,0.1)`
- Optional CTA button below cards
- Mobile: cards scroll horizontally (same behavior)

---

## Step 3: Build /programs

File: `app/programs/page.tsx` — replace the stub entirely.

```
Nav variant="dark" (red bg — Framer shows red nav on this page)
```

### Sections in order:

**1. Hero** — red bg `bg-red`
- Padding: `pt-[360px] pb-[360px]`
- Rive animation: `<EcosystemAnimation rive="/animations/programs-hero.riv" artboard="Main - Desktop" scrollPx={14000} />` centered
- If Rive component doesn't support custom .riv path yet, render a full-bleed red section with centered EKUZO logo as fallback
- White2 torn paper at bottom: `<TornPaper color="white" style={2} className="absolute bottom-0" />`

**2. OurApproachSection**
```tsx
<OurApproachSection
  heading="Built for growth, on and off the screen"
  listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
  body="Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."
  bg="bg-white"
/>
```

**3. ProgramsSection**
```tsx
<ProgramsSection showTeams showEkuzo100 showCamps />
```

**4. TwoWaysSection** (black bg, SCHOOL + HOME cards)

**5. EcosystemAnimation section**
- Light grey bg `bg-[#EFEEEF]`, height 360vh
- `<EcosystemAnimation scrollPx={14000} />`
- `<TornPaper color="black" style={2} />` at top

**6. TestimonialsCarousel**
- White bg, `pt-[144px] pb-[144px] px-[104px]`
- Heading: "Real stories from EKUZO families" (H4)
- `<TestimonialsCarousel />`

**7. FAQ**
- Use `FAQAccordion` with programs FAQ items (reuse from PAGES-SPEC.md or /faq page)

**8. FooterBanner**
```tsx
<FooterBanner heading="Enroll into a transformational program today" />
```

---

## Step 4: Build /parents

File: `app/parents/page.tsx` — replace the stub entirely.

```
Nav variant="light" (white bg on /parents hero)
```

### Sections in order:

**1. Hero** — white bg
- Padding: `pt-[280px]` (no bottom padding — image sits flush)
- H2 "Learn to Play. Play to Learn" — `font-display uppercase`, `clamp(5rem, 10vw, 10rem)`, max-w-[820px]
- Below heading: full-width image `/images/parents-hero.png` (next/image, fill=false, width full, height auto)
- Absolute bottom overlay (torn paper transition): `/images/parents-hero-torn.png`, absolute, `bottom: -20px`, z-10, full width

**2. OurApproachSection**
```tsx
<OurApproachSection
  heading="What is EKUZO?"
  listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
  body="It's natural for parents to feel tension around screen time, especially when it feels unstructured, unsupervised, or hard to trust. EKUZO leans into what students already love. We take their natural motivation for gaming and build a complete, coach-led system around it. Think sports, designed specifically for gamers. Instead of trying to control screen time, parents gain confidence in how it's being used."
  bg="bg-[#EFEEEF]"
/>
```

**3. FeatureCardsSection** — Why parents choose EKUZO
```tsx
<FeatureCardsSection
  bgImage="url('/images/parents-features-bg.png')"
  heading="Why parents choose EKUZO?"
  body="Parents choose EKUZO because it turns gaming from a solo activity into a team experience that feels structured, social, and purposeful. Instead of managing screen time, parents see their kids showing up, engaging with teammates, and growing through play."
  cardBg="bg-[#EFEEEF]"
  features={[
    { title: "Safe and structured", body: "Moderated spaces, trained coaches, and a positive culture." },
    { title: "Motivating by design", body: "Students gain visible wins that build intrinsic motivation." },
    { title: "Skills that last", body: "Communication, leadership, and resilience carry far beyond gaming." },
  ]}
/>
```

**4. ProgramsSection**
```tsx
<ProgramsSection showTeams showEkuzo100 showCamps />
```

**5. EcosystemAnimation section**
- Light grey bg, height 360vh
- `<EcosystemAnimation scrollPx={14000} />`
- `<TornPaper color="black" style={2} />` at top

**6. TickerSection** — What parents see in their kids
```tsx
<TickerSection
  eyebrow="HOW IT WORKS"
  heading="What parents see in their kids"
  theme="light"
  bg="bg-white"
  cards={[
    { title: "Growing confidence", body: "Kids speak up more, try harder things, and recover faster from setbacks." },
    { title: "Better communication", body: "Team play translates into clearer communication at home and at school." },
    { title: "Motivation that sticks", body: "Parents notice fewer battles around participation." },
    { title: "Real connections", body: "Kids talk about teammates by name and start looking forward to showing up." },
  ]}
  cta={{ label: "See programs", href: "/programs" }}
/>
```

**7. TestimonialsCarousel**
- `pt-[144px] pb-[144px] px-[104px]`
- Heading: "What parents are saying" (H4)
- `<TestimonialsCarousel />`

**8. Blog section**
- Padding `pt-[188px] pb-[188px] px-[40px]`, max-w-[1232px] mx-auto
- Two-panel header (both panels red bg):
  - Left panel (flex-[0_0_64%]): H4 "Stories of Growth and Gaming", decorative white diamond corner elements
  - Right panel (flex-1): Body L "Explore how esports becomes a tool for learning, connection, and purpose." + decorative image `/images/parents-blog-decor.png` (135×164px)
- Feature blog card (full width, 399px height):
  - Background image: `/images/parents-blog-feature.jpg`
  - Left overlay panel (bg: `/images/parents-blog-card-overlay.png`): Eyebrow "BLOG", H5 "Our Family's Esports Journey with EKUZO and the K1ng", Body M "My son Ryan was always a happy kid in his early years."
  - Link: `/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng`
- Mobile: panels stack vertically, card below

**9. FAQ**
- Parents FAQ items (reuse relevant ones from `/faq` page data)

**10. FooterBanner**
```tsx
<FooterBanner heading="Enroll into a transformational program today" />
```

---

## Step 5: Build /schools

File: `app/schools/page.tsx` — replace the stub entirely.

```
Nav variant="light" (white bg — hero is white)
```

### Sections in order:

**1. Hero** — white bg
- Padding: `pt-[188px] pb-[360px]`
- Content max-w-[1232px] centered
- H1 two lines:
  - "ESPORTS THAT BELONG IN" — `font-display uppercase`, `clamp(4rem, 13vw, 16rem)`
  - "SCHOOLS"
- Absolute images:
  - Left character: `/images/schools-hero-left.png`, 1089×1464px, `left: 36% transform: translateX(-50%)`, `bottom: 0`, z-index 2
  - Right graphic: `/images/schools-hero-right.png`, 512×494px, `right: 0`, `top: 34% transform: translateY(-50%)`, z-index 2

**2. OurApproachSection**
```tsx
<OurApproachSection
  heading="What is EKUZO?"
  listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
  body="Gaming is one of the most powerful motivators young people have — across backgrounds, interests, and ability levels. EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don't just play. They practice, communicate, lead, and reflect. This isn't about fixing kids. It's about building the structure most of them are missing."
  bg="bg-[#EFEEEF]"
/>
```

**3. EcosystemAnimation section**
- Height 360vh, no explicit background
- `<EcosystemAnimation scrollPx={14000} />`
- `<TornPaper color="black" style={2} />` at top

**4. FeatureCardsSection** — Why schools choose EKUZO
- Bg `bg-[#EFEEEF]`, padding `pt-[144px] pb-[240px]`
- Decorative circle backgrounds (absolute, non-interactive):
  - Left: `/images/schools-circle-left.png` (1697×1561px, absolute left 0, centered vertically)
  - Right: `/images/schools-circle-right.png` (912×1884px, absolute right 0, centered vertically)
- Decorative feature images `/images/schools-feature-1.png` through `schools-feature-8.png` scattered between cards
```tsx
<FeatureCardsSection
  heading="Why schools choose EKUZO?"
  body="Schools don't choose EKUZO because they want esports. They choose it because they're facing real student challenges and need a solution that fits inside academic priorities, staffing limits, and community expectations. EKUZO is designed to help schools act thoughtfully, without taking on unnecessary risk, burden, or distraction."
  cardBg="bg-white"
  features={[
    { title: "Hard problems, not bad students", body: "Disengagement and anxiety are systemic challenges, not discipline issues." },
    { title: "Built to run, not to improvise", body: "Coaching, curriculum, competition, and safety are designed to work together." },
    { title: "Easy to implement", body: "Clear roles, predictable structure, and external coaches reduce lift for school staff." },
    { title: "Youth development first", body: "Gaming is the medium; growth, skills, and belonging are the goals." },
  ]}
/>
```
- White2 torn paper at top and bottom

**5. ProgramsSection — EKUZOTEAMS only**
```tsx
<ProgramsSection showTeams showEkuzo100={false} showCamps={false} />
```

**6. TickerSection** — What schools see in their students (dark theme)
```tsx
<TickerSection
  eyebrow="PROGRAMS"
  heading="What Schools See in their Students"
  theme="dark"
  bg="bg-black"
  cards={[
    { title: "Attendance", body: "Students show up more consistently when they belong to a team with shared goals." },
    { title: "Engagement", body: "Motivation earned in practice carries into class, behavior, and daily energy." },
    { title: "Belonging", body: "Students who didn't connect elsewhere find a place to contribute and be seen." },
    { title: "Skills", body: "Communication, leadership, and digital skills develop through coached team play." },
  ]}
/>
```
- `<TornPaper color="black" style={1} />` at top of this section

**7. TestimonialsSection — Single quote block**
This is the Karlin Oei quote component (NOT the video carousel). Build as inline JSX or a new component:
- Red bg `bg-red`, padding `pt-[144px] pb-[144px]`
- Red torn paper at top (`top: -112px, absolute`) and bottom (`bottom: -144px, absolute`)
- Centered content, max-w-[880px]:
  - Quote mark icon `/images/games-quote-mark.png` (40×40px)
  - H5: "Once students see what they're capable of, you don't have to push them. They push themselves."
  - Attribution: "Karlin Oei" (Body L bold) + "Founder EKUZO" (Body L bold, opacity 0.6)

**8. TickerSection** — The pedagogy behind the program (light theme)
```tsx
<TickerSection
  heading="The pedagogy behind the program"
  body="EKUZO is built on proven learning principles, applied inside a structure students already care about."
  theme="light"
  bg="bg-white"
  cards={[
    { title: "Motivation", body: "Visible wins build intrinsic drive, turning effort into enthusiasm." },
    { title: "Feedback loops", body: "Every class follows a rhythm of show up, learn, grow and reflect." },
    { title: "Social learning", body: "Students collaborate, communicate, and lead in authentic, high-pressure situations." },
    { title: "Skills development", body: "What begins as play becomes practice for life." },
  ]}
/>
```

**9. FAQ**
- Schools FAQ items

**10. FooterBanner** — unique CTA for schools
```tsx
<FooterBanner heading="Increase attendance and engagement in your school" />
```

---

## Image Reference

All images are local in `/public/images/` — use `next/image` or `<img>` with `/images/...` paths:

| Usage | File |
|---|---|
| Programs hero fallback / bg | n/a (Rive or red bg) |
| Programs card bg (Teams + 100) | `program-card-bg-1.png` |
| Programs card bg (Camps) | `program-card-bg-2.png` |
| Parents hero collage | `parents-hero.png` |
| Parents hero bottom torn | `parents-hero-torn.png` |
| Parents features section bg | `parents-features-bg.png` |
| Parents blog feature photo | `parents-blog-feature.jpg` |
| Parents blog card left overlay | `parents-blog-card-overlay.png` |
| Parents blog decor (chicken) | `parents-blog-decor.png` |
| Schools hero left character | `schools-hero-left.png` |
| Schools hero right graphic | `schools-hero-right.png` |
| Schools circle decor left | `schools-circle-left.png` |
| Schools circle decor right | `schools-circle-right.png` |
| Schools feature decor 1–8 | `schools-feature-1.png` … `schools-feature-8.png` |
| Quote mark | `games-quote-mark.png` |
| TornPaper assets | `torn-paper-*.svg / *.png` |

---

## Build Discipline
- One section at a time, build to Framer spec
- Max content width: 1232px with mx-auto on inner containers
- All H1/H2/H3 text: `font-display uppercase` with `clamp()` via `style` prop (not fixed Tailwind sizes)
- H4/H5: `font-body font-bold` with exact px sizes via `style` prop
- Do not add features, error states, or polish beyond what's specified
- TypeScript — no `any` types
- Server components by default; only add `"use client"` when needed (modals, scroll effects, carousel)
- Run `~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/tsc --noEmit` after finishing each page
