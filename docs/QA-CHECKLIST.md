# EKUZO Visual QA Checklist

Every lesson learned on the homepage so we never solve the same problem twice. Run through this for every page build and QA pass.

---

## Torn Paper Transitions

- **Use PNG, not SVG.** PNGs (`torn-paper-white-1.png`) have rasterized edge texture that reads visually. SVGs often have path gaps, invisible fill against same-color backgrounds, or fidelity loss when scaled.
- **Use background-image on a fixed-height div**, not an `<img>` tag. This gives you control over height at every breakpoint without the image collapsing on mobile.
- **Framer's responsive heights:** Desktop 300px, Tablet 227px, Phone 115px. Use `clamp(115px, 19vw, 300px)` to match.
- **Position at the bottom of the section above**, not the top of the section below. Use `translateY(52%)` to push it down so it overlaps the next section.
- **background-size: cover + background-position: center** — this crops the edges and shows the textured middle, which is what you want.
- **Never use `preserveAspectRatio="none"`** on torn paper SVGs — it destroys the texture. If you must use SVG, keep the default aspect ratio and just make the container wider.
- **overflow-x: clip on html/body** (in `globals.css`) prevents horizontal scrollbar when torn paper or other elements extend beyond viewport. Use `clip` not `hidden` — hidden breaks sticky positioning.
- **z-index: 20** on all torn paper elements so they sit above section content.

## Typography

- **Display headings:** `font-display` class (Tungsten Narrow). Global `letter-spacing: 0.02em` is set in `globals.css` — do NOT add per-element `letterSpacing` style props unless intentionally overriding.
- **Heading sizes:** Always use `clamp()` via `style` prop, never fixed Tailwind text sizes. Example: `style={{ fontSize: "clamp(4.5rem, 20vw, 256px)" }}`.
- **Body text:** `font-body` class (Inter). Use `clamp()` for responsive sizing here too.
- **Tungsten weights available:** Black (900), Bold (700), Semibold (600), Medium (500). Loaded locally from `public/fonts/`.

## Nav

- **Breakpoint:** Hamburger menu triggers at `lg` (1024px), not `md` (768px). The full desktop nav with 5 links + CTA button needs room.
- **Logo sizes:** 110px on mobile, 170px on desktop (`w-[110px] lg:w-[170px]`).
- **Variant:** `variant="dark"` on red/dark hero backgrounds, `variant="light"` on white/grey backgrounds.
- **Padding:** `paddingLeft/Right: clamp(1.5rem, 7.2vw, 104px)` — matches Framer's 104px horizontal padding at 1920px.

## Spacing & Padding (Framer Defaults)

- **Section horizontal padding:** `clamp(1.5rem, 7.2vw, 104px)` — use on every section.
- **Section vertical padding:** `clamp(80px, 14vw, 188px)` for standard sections. Hero sections vary.
- **Max-width content containers:** 1232px (`max-w-[1232px] mx-auto`) for most content areas.
- **Card gaps:** 32px between cards in a grid.

## Cards (SCHOOL/HOME style)

- **Clip-path for angled corners:** `clip-path: polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)` — 40px diagonal cuts upper-left and bottom-right.
- **White cards on dark backgrounds** — `bg-white` with black text, not `bg-grey`.

## Images & Assets

- **Hero background images:** Use Next.js `<Image>` with `fill`, `object-cover`, and responsive `objectPosition`.
- **Decorative SVGs (icons on colored circles):** Render white via CSS filter `brightness(0) invert(1)`.
- **Framer asset URLs are blocked by the VM proxy** — ask Aaron to export from Figma/Framer and drop into the project. Reference the component name so he knows what to export.

## Sticky CTA Bar

- **Shows after 300px scroll**, hides at top of page, hides when modal is open, hides when footer is in view (IntersectionObserver on `<footer>`).
- **z-index: 40** — above torn paper (z-20) but below modals (z-50).

## Footer

- **EKUZO wordmark:** `ekuzo-huge.svg` rendered as `<img>` at `w-full h-auto`. Container breaks out of footer padding with negative margins. No bottom padding/margin — sits flush with page bottom.
- **Sticky CTA disappears** when footer enters viewport.

## Button States

- All interactive buttons: `hover:brightness-110 active:scale-[0.97~0.99] active:brightness-90 transition-all duration-150`.

## Mobile Responsive

- **Hero headline padding:** 40px on mobile (`px-[40px]`).
- **Growth section list items:** Appear above image on mobile via flex order swap.
- **Icon sizes:** Reduce on mobile (e.g. 50×50 on mobile, 72px on desktop).
- **Testimonials:** Single card on mobile, max-width 340px.
- **Test at all breakpoints:** 390px (phone), 810px (tablet), 1200px (desktop), 1920px (desktop large).

## Overflow

- **Use `overflow-visible`** on sections that have torn paper extending beyond their bounds.
- **Use `overflow: clip`** (not `overflow-hidden`) on html/body and on sections where you need to contain content — `hidden` breaks sticky positioning.
- **Never use `overflow-hidden` on sections with sticky children** (like the ecosystem animation).

## Framer MCP Workflow

1. Read the pre-extracted doc from `docs/framer/pages/{page}.md` for section order, component IDs, padding, and content.
2. Use `getNodeXml` on specific component IDs for exact layout, responsive variants, and asset URLs.
3. Check all 4 breakpoints in the component XML: DesktopLarge (1920), Desktop (1200), Tablet (810), Phone (390).
4. Build one section at a time, verify before moving on.

## Pre-Flight Before Every Page Build

1. Read `docs/framer/pages/{page}.md` for the full section breakdown
2. Pull component XML from Framer MCP for each section's component IDs
3. Check what shared components already exist (`components/sections/`, `components/ui/`)
4. Confirm all required assets exist in `public/images/` and `public/icons/` — if missing, ask Aaron to export
5. Build section by section, top to bottom
6. QA each section against Framer at all 4 breakpoints before moving to the next
