# EKUZO Camps Page — Session Brief (March 25, 2026)

## What we're building
`/ekuzocamps-seasonal` — the full camps landing page. Design-only session, no Stripe/backend wiring.

## Key rules for this build
- **All headers use `font-display` (Tungsten Narrow)** — globals.css auto-applies `font-weight: 900`. No need for `font-black` on display elements.
- Tungsten Narrow is loaded as a real local font: Black (900), Bold (700), Semibold (600), Medium (500)
- Type scale tokens in globals.css: h1=16rem, h4=4rem (64px), h6=2.125rem (34px), xl=1.75rem, lg=1.5rem, md=1.25rem
- Section heading pattern: `font-display text-black uppercase leading-[0.95] tracking-tight` at `clamp(2rem, 4.4vw, 3rem)`
- Horizontal padding: `style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}`
- Background grey: use `bg-grey` (resolves to `#EFEEED`)
- When Jamie says "use that design" from an HTML inspiration file, adopt the structure **verbatim** — don't reinterpret
- Zombie HTML inspiration files live in `/camp-inspirations/`
- Rhombus pills: `skewX(-8deg)` with inner `skewX(8deg)`

## Sections completed (top to bottom)

1. **Hero** — Yellow bg, video placeholder, rhombus tags, "EKUZOCAMP" heading, CTA
2. **Stats Ticker** — Black marquee bar: NOW ENROLLING / MON–FRI / VIRTUAL CAMP / LIMITED SPOTS / MORNING OR AFTERNOON SESSIONS. 6px red bottom rule
3. **Camp Overview** — Black bg, "CAMP OVERVIEW" header, zombie-style logistics grid (4→2→1 cols). Cards: Ratio 1:5, Duration M-F, Where Online, Cost $199 w/ Early Bird badge
4. **Torn Paper (black)**
5. **The Squad Stays Together** — White bg, red rhombus pill "The EKUZO Difference", body copy about squads lasting beyond camp, bullet points, Discord-style avatar roster (5 players with WebP avatars)
6. **Torn Paper (grey)** — white → grey transition
7. **The 5-Day Progression (Curriculum)** — `bg-[#f0edea]`, grid rows from zombie HTML (`100px 1fr 2fr`). Days M/T/W/Th/F, day letters black Inter Black, titles red Inter Black at 1.75rem, body text black. Wednesday row highlighted with persistent red left bar
8. **Torn Paper (white)** — grey → white transition
9. **Parent Briefing** — White bg, red rhombus pill, header "EKUZO IS DESIGNED TO BE STRUCTURED, SAFE, AND SKILL-ORIENTED", body copy, trust-grid from `design-bdcef6c8` zombie (4→2→1 cols, `#f4f4f5` bg, 3px black border, hard shadow). Cards: Small Squads, Vetted Pros, Safe Servers, Skill Building

## Sections remaining (stub/placeholder, need full build)

10. **Torn Paper (black)**
11. **Learn From the Best (Coaches)** — Currently has 3 coach cards with placeholder photo. Needs design review
12. **Torn Paper (black)**
13. **Testimonials** — Uses existing `TestimonialsCarousel` component
14. **Torn Paper (black)**
15. **Secure Your Slot** — Registration form section with Stripe placeholder. Has pricing copy + `CampsRegistrationForm` component
16. **Torn Paper (black)**
17. **FAQ** — Uses existing `FAQAccordion` with `campsFAQs` data
18. **FooterBanner + Footer**

## Inspiration files used
- `design-f3e326f6-e172-4dd1-9515-876910765d31.html` — logistics grid, curriculum grid rows, responsive breakpoints (primary reference)
- `design-bdcef6c8-474c-4912-b1a1-528a9cb885e0.html` — trust-grid boxes for parent briefing (hard shadow style)

## Component changes made
- `TornPaperDivider.tsx` — Added "grey" color support (`torn-paper-grey-1.png`)

## Files touched
- `app/ekuzocamps-seasonal/page.tsx` — main page
- `components/ui/TornPaperDivider.tsx` — grey color added
- `public/images/avatars/*.webp` — 5 Midjourney avatars (80×80, retina)

## Dev notes
- Dev server runs on port 3001 on Jamie's Mac (can't run in VM — SWC binary is darwin-arm64)
- TypeScript check: `npx tsc --noEmit` (ignore docs/framer errors)
- Framer reference: https://ekuzo.gg
- Figma: https://www.figma.com/design/QNqU4NQ1yygnkpItKD56S6/EKUZO-Web
