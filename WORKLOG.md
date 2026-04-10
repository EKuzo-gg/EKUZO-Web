# EKUZO Work Log

**Purpose:** This file keeps both Jamie's and Aaron's Claude instances aware of what's changed. Update this BEFORE every commit. Your Claude should read this at the start of every session.

**Format:** Most recent entry at the top. Include your name, date, and what changed.

---

## Aaron — April 10, 2026 (What Do We Play video + web optimization)

**What changed:**

Replaced the static "What Do We Play" image on the camps page with a video player for `league-of-legends-camp`. Video does not autoplay, shows a large red play button overlay, and starts with sound ON when the user hits play. Native HTML5 controls appear once playing.

**Video conversion:**
- Source: `public/videos/league-of-legends-camp.mov` — HEVC, 2160×3840, 21.7s, 51 MB (too big for web)
- Output: `public/videos/league-of-legends-camp.mp4` — H.264, 720×1280, AAC 96k, `+faststart`, 5.8 MB
- ffmpeg command used: `ffmpeg -i league-of-legends-camp.mov -vf "scale=720:-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart league-of-legends-camp.mp4`
- 720×1280 is sized for the sticky 3/4-aspect portrait container at retina density; keeps bandwidth low while staying crisp.
- **Action for Aaron:** the original `.mov` (51 MB) is still in the folder because I couldn't delete it from this session. Delete it before committing: `rm public/videos/league-of-legends-camp.mov`

**New file — `components/ui/WhatWePlayVideo.tsx`:**
- Client component with `useRef` + `useState`
- Renders the video element with `controls={playing}` so the native controls only show once the user has hit play
- Red `bg-red` circular play button overlay (clamp-sized 72–112px) with a dark `bg-black/20` backdrop over the video while paused
- Hover/active states: brightness + scale transform matching our existing button style
- On click: sets `v.muted = false`, `v.volume = 1`, then `v.play()`. Falls back to muted playback only if the browser blocks unmuted autoplay (shouldn't, since the play is user-initiated).
- `preload="metadata"` so the browser doesn't pull the whole file until the user presses play
- `playsInline` so mobile Safari doesn't kick into full-screen takeover
- Same clipped-corner 3/4 aspect container as the photo it replaced, so the layout is identical.

**`app/programs/ekuzo-camps/page.tsx`:**
- Imported `WhatWePlayVideo` from `@/components/ui/WhatWePlayVideo`
- Swapped the `<Image>`-wrapper block in the "What Do We Play" sub-section for `<WhatWePlayVideo src="/videos/league-of-legends-camp.mp4" label="League of Legends gameplay at EKUZO camp" />`

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (FooterBanner top torn-paper — red-top, color-agnostic)

**What changed:**

Made the red `FooterBanner` render its own top torn-paper divider so every page gets a consistent jagged red transition automatically — and switched the asset to a **red-top** paper so no per-page color prop is needed.

**Why red-top:** My first attempt used `torn-paper-{white|black|grey}-bottom-2@2x.png` half-offset into the red section (`translateY(-50%)`). That exposed the FLAT top edge of the `*-bottom-*` assets in the preceding section, creating a visible horizontal line just above the red. The fix is to use `torn-paper-red-top-2@2x.png` instead: the paper is red, has a torn edge at the TOP, and a solid red edge at the BOTTOM. Positioned flush with `top: 0` and `translateY(-100%)`, the solid red bottom meets the top of the red section seamlessly (red-on-red), and the torn red top extends up into whatever section is above, creating a jagged red silhouette. Works the same over white, black, or grey — no color prop required.

**`components/sections/FooterBanner.tsx`:**
- Removed the `topPaperColor` prop entirely.
- Top paper now uses `/images/new torn paper/torn-paper-red-top-2@2x.png` at `top: 0` with `transform: translateY(-100%)`.
- Section still has `overflow-visible`.

**Pages reverted (removed the `topPaperColor` prop I added earlier in this session):**
- `app/programs/ekuzo100/page.tsx`
- `app/programs/ekuzo-teams/page.tsx`
- `app/schools/page.tsx`
- `app/programs/page.tsx`
- `app/programs/ekuzoteams/page.tsx`
- `app/parents/page.tsx`
- `app/methodology/page.tsx`
- `app/ekuzoteams-semester-based/page.tsx`
- `app/programs/e100/page.tsx`
- `app/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng/page.tsx`
- `app/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx`
- `app/ekuzo100/page.tsx`

All 19 pages that render `<FooterBanner>` now use the default, and the red-top paper handles the transition uniformly.

TypeScript check passes clean.

**Heads up for Jamie:** If you add a new page that renders `<FooterBanner />`, you don't need to configure anything for the top divider. The red-top paper renders automatically and works over any preceding section background.

---

## Aaron — April 10, 2026 (torn paper fixes: Growth + FooterBanner transition)

**What changed:**

Two follow-up fixes to the torn paper migration from earlier today:

1. **Removed the bottom torn paper from the Growth Through Play section** in `app/page.tsx`. The `torn-paper-grey-bottom-2@2x.png` element at the bottom of the grey section has been deleted entirely — the swap was breaking the layout. The grey section now ends cleanly without a divider; the Ecosystem section below still has its own `torn-paper-white-top-1@2x.png` at the top, which handles the grey → white transition on its own.

2. **Reworked the Testimonials → FooterBanner transition.** The top torn paper inside `components/sections/FooterBanner.tsx` (the `torn-paper-red-bottom-2@2x.png` div that was producing visual artifacts) has been removed. In its place, a new `torn-paper-white-bottom-2@2x.png` has been added at the bottom of the testimonials section in `app/page.tsx`, positioned with `translateY(calc(100% - 2px))` so it overlaps down into the red FooterBanner section. The testimonials `<section>` is now `relative overflow-visible` to let the paper hang below its box.

Because the top divider was removed from `FooterBanner.tsx` (a shared component), every page that uses `<FooterBanner>` now renders without a top torn-paper edge. Any page that needs that transition will need to add its own divider on the preceding section, like the home page now does. Pages to audit next session: `/methodology`, `/programs`, `/parents`, `/schools`, `/games`, `/faq`, `/programs/ekuzo100`, `/programs/ekuzo-teams`, `/programs/ekuzo-camps`.

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (home page torn paper migration)

**What changed:**

All torn paper textures on the home page have been migrated from the old SVG/PNG files in `public/images/` to the new `@2x` PNGs in `public/images/new torn paper/`. Each swap uses the exact naming convention documented in the Learning Log (`torn-paper-{color}-{variant}-{style}@2x.png`).

**`app/page.tsx`:**
- Hero → Growth Through Play (line 96): `/images/torn-paper-white-1.png` → `/images/new%20torn%20paper/torn-paper-white-1@2x.png` (whole divider, background-image div)
- Growth → Ecosystem bottom (line 123): `/images/paper-grey-bottom-2.svg` → `/images/new%20torn%20paper/torn-paper-grey-bottom-2@2x.png` (direct 1:1 swap)
- Growth → Ecosystem top (line 187): `/images/paper-white-top-1.svg` → `/images/new%20torn%20paper/torn-paper-white-top-1@2x.png` (direct 1:1 swap)
- Ecosystem → How It Works (line 201): `/images/paper-black-top-2.svg` → `/images/new%20torn%20paper/torn-paper-black-top-1@2x.png` (changed variant 2 → 1 per request)

**`components/sections/HomeHowItWorks.tsx`:**
- How It Works → Testimonials (line 147): `/images/paper-black-bottom-2.svg` → `/images/new%20torn%20paper/torn-paper-black-bottom-1@2x.png` (changed variant 2 → 1 per request)

**`components/sections/FooterBanner.tsx`:**
- Testimonials → Enroll section top-edge (line 35): `/images/torn-paper-red-1.png` → `/images/new%20torn%20paper/torn-paper-red-bottom-2@2x.png`
- **Note:** `FooterBanner` is a shared component rendered on every page. This swap affects every page's Enroll banner visually, not just the home page. If the intent was home-only, we'd need to parameterize the paper asset via props — flag if so.

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (camps register hero padding fix + Squad Status vibe check)

**What changed:**

**Camps registration hero (`app/programs/ekuzo-camps/register/page.tsx`):**
- Hero content container `paddingBottom` made responsive — `pb-28 lg:pb-60` (112px mobile / 240px desktop). Previously was flat `240px`, which worked fine on desktop (where the collage is absolutely positioned) but created a huge gap on mobile between the text and the flow-layout collage. The `-mt-24` (-96px) on the mobile collage now balances against the 112px mobile padding to leave a ~16px gap below the text. Desktop stays at `pb-60` (240px) to give the white torn paper overlay room to sit below the body copy without clipping it.
- **History:** original value was `80px` (April 8 — too tight, torn paper overlapped the body copy), then `240px` flat (April 10 — fixed desktop, broke mobile spacing), now `pb-28 lg:pb-60` (fixes both).

**Squad Status — new required question (`app/programs/ekuzo-camps/register/page.tsx`):**
- New family-level "vibe check" question inserted between the gamer loop (after "+ Add Another Gamer" button) and the Parent Information section. Two torn-paper cards side-by-side ("Building a squad" / "Looking for a squad"), one-tap selection, red ring + shadow when selected.
- New `SquadStatus` type: `"building" | "looking" | null`. Single family-level state (not per-gamer) — one answer per registration.
- New `SquadCard` sub-component at the bottom of the file, styled consistently with the existing form aesthetic (torn-paper clipPath, `#f5f5f7` bg, Display heading, Inter subtitle).
- **Selected state:** SquadCards use a smooth rounded rectangle — torn-paper `clipPath` was tried first but produced jagged edges on both the card and the outline. Without clipPath a normal `ring-2 ring-red` + `shadow-lg shadow-red/10` works cleanly. Unselected shows `ring-1 ring-black/10` for a subtle default border. A red circle check badge appears in the top-right corner on selection; unselected shows a neutral empty circle so the layout doesn't jump. Card background and text colors stay neutral (avoided the red tint — read as an error state). `aria-pressed` set for accessibility.
- Added to `validate()` as required — users cannot proceed to payment without picking one.
- `squadStatus` is wired end-to-end through the camps data flow:
  - **`app/api/camps/register/route.ts`** — accepts `squadStatus` from the payload, coerces to a safe `"building" | "looking" | ""` value, stores in Stripe metadata as `squad_status`.
  - **`app/api/webhooks/stripe/route.ts`** — reads `meta.squad_status`, transforms the code into a human-readable label (`"Building a squad"` / `"Looking for a squad"`) for ops readability, writes to the Google Sheets row as `squad_status` (camps only; `""` for other products).
- **Beehiiv intentionally skipped** — team is migrating email marketing to Klaviyo, so no Beehiiv custom field was added. The data is still captured in Stripe metadata + Google Sheets, so nothing is lost; Klaviyo wiring will happen during the migration.
- TypeScript check passes clean (`tsc --noEmit`).

### 🔧 ACTION REQUIRED — Jamie (backend / ops)

The camps webhook is now sending a `squad_status` field on every camps row, but **it won't land in the sheet until you do the two things below.** Code is fully wired — this is the only missing piece.

**1. Add the column to the Google Sheet**
- Open the `ekuzo-purchases` Google Sheet.
- Add a new column header: `squad_status` (exact spelling, lowercase with underscore — the webhook sends this as the key name).
- Suggested placement: right after `preferred_games` so it lives next to the other gamer-context fields, but anywhere is fine as long as the Apps Script is updated to match.

**2. Update the Apps Script to map the incoming key**
- Open the Apps Script bound to the sheet (the web app at `GOOGLE_SHEETS_WEBHOOK_URL`).
- Make sure the row-writing logic reads `row.squad_status` from the incoming POST body and writes it to the new column.
- If the Apps Script uses a dynamic header-lookup pattern, just adding the column header may be enough. If it has a hardcoded column list, add `squad_status` to that list.

**What the webhook sends**
- Field name: `squad_status`
- Values: `"Building a squad"`, `"Looking for a squad"`, or `""` (empty string for non-camps products — EKUZO100 and Teams)
- Already human-readable — no transform needed in Apps Script.

**Where to find the code** (in case you want to trace it)
- Front-end form capture: `app/programs/ekuzo-camps/register/page.tsx` (SquadCard component + state)
- Register API: `app/api/camps/register/route.ts` (stores as `squad_status` in Stripe metadata)
- Webhook: `app/api/webhooks/stripe/route.ts` (reads metadata, transforms code → label, writes to row)

**Testing the full flow**
Once the column + Apps Script are updated, run a test camps registration in Stripe test mode with Squad Status selected and confirm the value lands in the sheet. If it doesn't show up, check the webhook logs — the field is sent on every camps row regardless of what the sheet can accept.

**Email marketing (Klaviyo) — separate follow-up**
I intentionally did NOT wire `squad_status` to Beehiiv since you mentioned the Klaviyo migration. When you set up Klaviyo, add a `squad_status` custom property / profile attribute and wire it into the webhook's Klaviyo enrollment call at the same place the Beehiiv call currently lives. Valid values are the same two strings shown above.

---

## Aaron — April 8, 2026 (camps registration page polish + mobile fixes)

**What changed:**

**Camps registration hero (`app/programs/ekuzo-camps/register/page.tsx`):**
- Season badge → EKUZO Eyebrow component (red skewed pill, white text) with calendar icon
- "CAMP REGISTRATION" headline bigger on mobile (`clamp(4rem, 6.25vw, 120px)`), tighter line-height (0.85)
- Eyebrow-to-headline gap tightened (wrapped in shared div with `gap-3`)
- Hero padding reduced: top 40px, bottom 80px (was 128/140)
- "Join us for an incredible week…" subtitle changed from red to black
- EKUZO100 link changed from grey to red
- Hero collage: desktop — taller (100% height, 55% width); mobile — now visible below content, 115% width edge-to-edge
- "Choose your camp week" and "Tell us about your gamer" headers upgraded to Display H2 style (`font-display uppercase text-black`, `clamp(3rem, 6vw, 5.5rem)`)
- Rule dividers added above "Tell us about your gamer" and "Parent Information" sections
- "Please fill out the information below" header replaced with "Parent Information" in Display H2, duplicate h3 removed
- Camp week dates larger on mobile (`clamp(2rem, 2.5vw, 36px)`)
- Registration Summary header bigger on mobile (`clamp(2rem, 3vw, 28px)`)

**Footer (`components/layout/Footer.tsx`):**
- "Find us online" now stacks above social icons on mobile (`flex-col` below `sm`)

**Footer newsletter (`components/ui/FooterNewsletter.tsx`):**
- Email input + Sign up button span full width on mobile at 70/30 ratio

---

## Aaron — April 7, 2026 (mobile nav button fix)

**What changed:**

**Mobile nav CTA buttons — swapped variants to match desktop:**
- `components/layout/Nav.tsx` — "Enroll my gamer" changed from `red-outlined` → `red-filled`, "Talk to Humans" changed from `red-filled` → `red-outlined`. Mobile drawer now matches the desktop CTA hierarchy where enroll is the primary button.

---

## Jamie — April 4, 2026 (newsletter system, CTA overhaul, FAQ audit, Teams commerce, contact form email, launch prep)

**What changed:**

**Newsletter system (new):**
- `components/ui/NewsletterPopup.tsx` — full-screen split-screen popup (purple left w/ kid+characters image, dark right w/ form). Shows on first visit after 2.5s delay, gated by localStorage. Posts to `/api/newsletter`. Yellow-green (#C8E620) accent color for CTA + "MATTERS." headline.
- `components/ui/FooterNewsletter.tsx` — inline "Join the Newsletter" + email input in footer. Shows black checkbox + "Subscribed!" on success. Replaces old "Start a conversation" ModalButton in footer.
- `app/api/newsletter/route.ts` — Beehiiv subscription with `source-newsletter` tag.
- `app/layout.tsx` — added `<NewsletterPopup />` to root layout.
- `components/layout/Footer.tsx` — swapped ModalButton import for FooterNewsletter.

**CTA rename — "Start a conversation" → "Talk to Humans":**
- Updated across 9 files: Nav, StickyCTA, ContactModal, schools, methodology, coaching, teams, and both camps pages.

**CTA swap — default CTAs changed to "Enroll my gamer":**
- Nav desktop CTA now opens enroll modal (was contact).
- FooterBanner default CTA now "Enroll my gamer" (was contact). Added `ctaLabel` and `ctaModal` props for per-page override (schools uses "Talk to Humans" / contact).

**Contact form — added Resend email notification:**
- `app/api/contact/route.ts` — added Resend API call to email karlin@ekuzo.gg on every submission. Removed Google Sheets write (not needed for contact inquiries). Beehiiv subscription still active.
- Resend API key added to `.env.local` (`RESEND_API_KEY`).
- From address is `onboarding@resend.dev` until ekuzo.gg domain is verified in Resend (DNS records needed — bundled with Netlify DNS update for Karlin).

**Teams commerce (new):**
- `app/api/teams/register/route.ts` — Stripe PaymentIntent for Teams. Supports upfront ($576) and installment ($160 first + 3×$160/mo subscription). Creates Stripe Customer for card storage.
- `app/programs/ekuzo-teams/register/page.tsx` — registration form.
- `app/programs/ekuzo-teams/success/page.tsx` — confirmation page.
- Webhook already handled Teams product detection from prior session.

**FAQ audit — 7 pages updated:**
- Terminology standardized: "E100" → "EKUZO100", "After-School" → "EKUZOTEAMS", "Minimesters" → "EKUZOCAMPS".
- New questions added: "What is EKUZO?", "What equipment needed?", "What age range?" (10-18).
- Pricing language: ~$20/session, no hard numbers except EKUZO100=$100.
- Pages: `/faq`, `/parents`, `/programs`, `/programs/ekuzo-teams`, `/programs/ekuzo100`, `/programs/ekuzo-camps`, `/schools`.

**Mobile nav fix:**
- Nav mobile drawer now uses `createPortal(…, document.body)` to escape stacking context issues. Full-screen overlay with its own red nav bar + close button.

**Removed page-specific mobile CTA bars:**
- Removed from: schools, parents, methodology, games, programs, faq, ekuzo-camps (7 pages total). Global `StickyCTA` handles all pages.

**Component enhancements:**
- `ProgramsSection` — added `heading` prop for per-page override (schools uses "One program. Built for schools.").
- `OurApproachSection` — body prop now accepts JSX (React.ReactNode), not just string.
- `FooterBanner` — added `ctaLabel` and `ctaModal` props.

**Draft pages hidden (renamed to _page.tsx.draft):**
- `/about` — in progress, not ready for launch.
- `/coaching` — template for future `/methodology/coaching`.
- `/success` — generic, replaced by per-program success pages.
- `/ekuzo-camps/v2` — became canonical `/programs/ekuzo-camps`.

**New assets:**
- `public/images/popup-kid-characters.png` — kid + game characters composite for newsletter popup.

**Data flow summary (all working as of 4/4):**
- Contact form ("Talk to Humans") → Beehiiv (source-contact-form tag) + Resend email to Karlin
- Newsletter popup + footer → Beehiiv (source-newsletter tag)
- Camps registration → Stripe → webhook → Google Sheets (ekuzo-purchases) + Beehiiv
- EKUZO100 registration → Stripe → webhook → Google Sheets + Beehiiv
- Teams registration → Stripe → webhook → Google Sheets + Beehiiv

**Pre-deploy note for Aaron:** Major commit with changes across 40+ files. Pull before starting any work. If you see wireframe HTML files or `Home _ EKUZO_files/` in the repo, those are reference assets — not production code.

---

## Jamie — April 3, 2026 (route canonicalization + EKUZO100 orchestration + contact form + SEO + launch prep)

**What changed:**

**Route canonicalization — all programs now under /programs/:**
- `/programs/ekuzo100` — marketing page (was /programs/e100)
- `/programs/ekuzo100/register` — registration + Stripe payment (was /ekuzo100/register)
- `/programs/ekuzo100/success` — payment confirmation (was /ekuzo100/success)
- `/programs/ekuzo-teams` — marketing page (was /programs/ekuzoteams)
- `/programs/ekuzo-camps` — marketing page, using Aaron's v2 (was /ekuzo-camps/v2)
- `/programs/ekuzo-camps/register` — registration + Stripe payment (was /camps/register)
- `/programs/ekuzo-camps/success` — payment confirmation (was /camps/success)
- 12 redirect rules in next.config.mjs catch all legacy URLs

**EKUZO100 orchestration (new files):**
- `app/api/ekuzo100/register/route.ts` — creates $100 Stripe Payment Intent with product metadata
- `app/programs/ekuzo100/register/page.tsx` — full registration form (cohort selection, schedule preference, gamer info, parent info, Stripe Elements)
- `app/programs/ekuzo100/success/page.tsx` — payment confirmation page
- Webhook (`app/api/webhooks/stripe/route.ts`) rewritten to be product-aware — branches Beehiiv tags, custom fields, and Google Sheets rows by `meta.product` ("camps" or "ekuzo100")
- Added `product: "camps"` to camps register route metadata (was relying on fallback default)

**Contact form — replaced Make.com:**
- New `app/api/contact/route.ts` — writes to Google Sheets + adds email leads to Beehiiv with `source-contact-form` tag
- `ContactModal.tsx` now POSTs to `/api/contact` instead of Make.com webhook

**All internal links updated:**
- EnrollModal, ProgramsSection, Footer — all point to canonical `/programs/` routes
- Links within program pages, cross-program references all canonical

**SEO metadata:**
- Root layout: title template "%s | EKUZO", robots, OpenGraph, Twitter cards
- Every key page: unique title, description, OG tags

**Stripe API version:** Updated all 4 API routes from `2025-03-31.basil` → `2026-02-25.clover`

**External setup required (not in code):**
- Beehiiv: create tags `ekuzo100-purchased`, `source-ekuzo100-registration`, `source-contact-form`
- Google Sheets: add `product` + `gender` columns, add `contact_inquiries` sheet/handler to Apps Script
- Stripe: EKUZO100 product in live mode, webhook endpoint for production domain

---

## Aaron — April 3, 2026 (methodology video fix + camps v2 tweaks)

**What changed:**

**Methodology page (app/methodology/page.tsx):**
- Hero section: changed `overflow-clip` to `overflow-visible` to stop clipping the video (matching e100 pattern)
- Removed `lg:mx-0` from video container so it centers like e100
- Reduced hero headline font size from `clamp(100px, 18vw, 256px)` to `clamp(72px, 10vw, 160px)` to give the video more visual space in the 50/50 grid

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- What Do I Need: swapped layout — image now on left, text on right on desktop. Mobile keeps text-first order using CSS `order` classes
- What Do I Need: changed grid alignment from `items-start` to `items-center` for vertical centering
- Nuri gamertag updated: "Je" → "Teemo Time" Je (full name: NURI "TEEMO TIME" JE)

---

## Aaron — April 2, 2026 evening (camps v2 — continued refinements)

**What changed:**

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- Coach bios updated: Karlin "Faith" Oei (Founder // Peak Challenger Jungler), Sebastien "ZzLegendary" Demontigny (Head Coach // Professional Esports Coach), Nuri "Je" (Coach // Diamond Support)
- Coach images wired: coach-karlin-faith.jpg, coach-sebastien-ZzLegendary.png, coach-nuri-je.png with per-coach objectPosition (Karlin 20%, Sebastien top, Nuri 60%)
- Coach section renamed: eyebrow "Coaches" → "Our Team", added body copy paragraph below headline
- Coach hover: removed grayscale default, images now full color. Desktop hover: card lifts -translate-y-2, image scales 105% (no shadow). Mobile: no hover effects.
- For Parents cards: white bg with chopped corners, black icons, headline size matched to day cards (`clamp(2rem, 3.5vw, 3rem)`), body copy matched (`clamp(0.95rem, 1.2vw, 1.1rem)` in `text-black/70`)
- What Do I Need: layout flipped — copy on left, collage image on right. Using tech-collage@2x.png on grey bg container
- Register section: red bg with register-promo-hero-2.png background image, radial gradient center darkening for legibility, chopped-corner card (white left panel with red button, black price stub), removed red top/bottom torn papers. Summer 2026 / PC Discord text sized to match parent card headlines.
- Register button: full-width in panel (`block text-center`)
- FAQ: headline changed to font-display uppercase matching other sections, removed black bottom torn paper
- Testimonials: added white-bottom-2 torn paper divider
- Ticker: background color changed to #AE2CF2 (purple), stars changed to #E0FF4F (neon yellow-green), letter spacing tightened to 0.07em
- "Learn more about games" button: grey style with white fill, tertiary size
- All buttons confirmed title case site-wide (no uppercase class)

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Added `self-start` to prevent flex container stretching (fixes eyebrow bg extending full width)

**SVG viewBox fixes (public/icons/):**
- team.svg, strategy.svg, trophy.svg: recalculated as square centered bounding boxes for proper centering in circle containers

---

## Aaron — April 2, 2026 (camps v2 page — visual QA + new sections)

**What changed:**

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- Hero: video bg (camp-hero.mp4) with dark gradient + red accent overlay, seamless marquee ticker above nav, white body copy, oversized white "Register for Camp" button (Inter bold, 2px radius)
- Camp Overview: white bg, white-top-1 overlapping hero, 4-col grid with 60px icons (swords, calendar, chat, loot), values at clamp(4rem, 7vw, 6rem)
- EKUZO Difference: grey bg with grey-top-2, squad formation visual with chopped-corner wrapper (bg-black/20 outer border, bg-white/50 inner), "SQUAD VANGUARD 67" header at 40px, player rows with hover states, "Your Gamer" callout in solid red
- 5-Day Progression: day letters in font-display red, red outline on hover (outer wrapper hover:bg-red), titles at clamp(2rem, 3.5vw, 3rem)
- For Parents: black bg with black torn paper top/bottom, white chopped-corner cards with black icons (CircleIcon), text-base body copy
- Coaches + What Do I Need + What Do We Play: combined grey section (no grey top divider)
  - Coaches: grey bg, white chopped-corner cards with grayscale photos
  - What Do I Need: grey bg container with chopped corners + tech-collage@2x.png overlapping on top, copy on right
  - What Do We Play: League of Legends copy with 3 checklist items (red circle icons with white graphics via CSS filter invert), sticky chopped-corner image on right, grey tertiary "Learn more about games" and "View more FAQs" buttons, chopped-corner FAQ callout card
- Testimonials: white bg, quote cards with chopped-corner wrapper borders, video with red play button overlay, increased spacing between video and name (mt-8)
- Secure Your Slot: red bg with red torn paper top (no bottom), chopped-corner card — white left panel (red register button) + black right price panel ($199)
- FAQ: black bg, dark theme
- Mobile CTA bar at bottom

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Tightened padding from px-5 py-2 to px-3 py-1.5 (fits text closer)
- Added self-start to prevent stretching in flex containers

**TestimonialVideo component (components/ui/TestimonialVideo.tsx):**
- Increased gap between video and name/role from mt-4 to mt-8

**SVG icon viewBox fixes (public/icons/):**
- team.svg: viewBox cropped to "-6 -4.1 43 43" (square, centered on artwork)
- strategy.svg: viewBox cropped to "-1.5 -1.8 38.7 38.7" (square, centered)
- trophy.svg: viewBox cropped to "-1.6 -2.1 35.2 35.2" (square, centered)

**Other:**
- Added "loot" to ICONS array in Icon.tsx
- Converted camp-hero.mov to camp-hero.mp4 via ffmpeg (67MB → 15MB)
- Temporarily renamed register page to .bak (missing @stripe/react-stripe-js)
- Updated CLAUDE.md Learning Log with two-system torn paper documentation

---

## Aaron — April 1, 2026 (site-wide consistency pass + FAQ page build)

**What changed:**

**FAQ page — full build (app/faq/page.tsx):**
- Hero: black bg, smoke graphics, Eyebrow "FAQS", headline `clamp(3rem, 12vw, 160px)`, maxHeight 720px
- Hero graphic: `faq-hero-graphic.png` at `w-[55%] max-w-[860px]` lower-right
- Overflow-visible wrapper on hero with `black-bottom-1` divider outside the section
- 5 FAQ sections alternating: white (Safety) → grey (Programs) → white (Outcomes) → black (Cost) → white (Enrollment)
- Section headlines: `font-display uppercase leading-[0.85]` at `clamp(2.5rem, 5vw, 4.5rem)` — no eyebrows on content sections
- Decorative brush art at 6-8% opacity (hidden on mobile)
- Mobile CTA bar at bottom

**FAQAccordion — global camada-caret icon (components/ui/FAQAccordion.tsx):**
- Replaced chevron SVG with camada-caret SVG (`viewBox="0 0 72 72"`)
- Icon: `w-7 h-7 lg:w-8 lg:h-8` (28px mobile, 32px desktop)
- Open state: `bg-red rotate-180` on circle, white fill on icon
- Closed state: `rgba(0,0,0,0.08)` (light) or `rgba(255,255,255,0.15)` (dark) circle bg
- This is a global change — affects all FAQ modules across every page

**FooterBanner fix (components/sections/FooterBanner.tsx):**
- Heading size adjusted to `clamp(2rem, 4.5vw, 56px)` with `maxWidth: "14em"` to fix "today" orphaning

**Programs page — consistency pass (app/programs/page.tsx):**
- Hero: overflow-visible wrapper with `red-bottom-1` divider
- OurApproach: `tornPaper="none"`
- Animation: overflow-visible wrapper with `grey-top-1` / `grey-bottom-1`
- FAQ: overflow-visible wrapper with `black-top-1`
- Mobile CTA bar added

**Parents page — consistency pass + blog redesign (app/parents/page.tsx):**
- All old background-image torn papers replaced with TornPaperDivider
- Our Approach: wrapped with `grey-top-1`
- Animation: standard wrapper with `grey-top-1` / `grey-bottom-1`
- Blog section redesigned: Eyebrow "BLOG" (light variant) + headline + subtitle, full-width chopped-corner image card with gradient overlay
- FAQ: overflow-visible wrapper with `black-top-1`
- Mobile CTA bar added

**Schools page — consistency pass (app/schools/page.tsx):**
- Hero: overflow-visible wrapper with `white-bottom-1`, heading `leading-[0.85]`
- Animation: overflow-visible wrapper with `grey-top-1` / `grey-bottom-1`
- Outcomes: overflow-visible with `black-top-1`
- Testimonial quote: overflow-visible with `red-top-1` / `red-bottom-1`
- FAQ: overflow-visible with `black-top-1`
- Mobile CTA bar added

**Methodology page — consistency pass (app/methodology/page.tsx):**
- Hero: `overflow-clip`, `leading-[0.85]`, headline bumped to `clamp(100px, 18vw, 256px)`, standard video container sizing
- Hero → How It Works transition: whole torn paper (`torn-paper-grey-1@2x.png`) using raw background-image div pattern with `translateY(52%)`, hero wrapper `zIndex: 1`, How It Works wrapper `zIndex: 0`, section pulled up with negative margin
- Why Games Work: `overflow-visible` wrapper, section uses negative `marginTop` + extra `paddingTop`
- Quote: overflow-visible wrapper with `red-top-1` / `red-bottom-1`
- Ten Pillars: `overflow-clip`
- Mobile CTA bar added

**ProgramsSection (components/sections/ProgramsSection.tsx):**
- Updated canonical routes: `/programs/ekuzoteams`, `/programs/e100`, `/camps`
- Desktop heading: `leading-[0.85]`

**CLAUDE.md — Learning Log update:**
- Replaced old torn paper notes with comprehensive two-system documentation
- System 1: One-sided dividers (tops/bottoms) via `<TornPaperDivider>` component
- System 2: Whole dividers (both edges) via raw background-image div pattern
- Documented the common mistake: torn paper inside `overflow-clip` section gets clipped

---

## Aaron — April 1, 2026 (e100, ekuzoteams, games page builds + global QA pass)

**What changed:**

**EKUZO100 page — new canonical location (app/programs/e100/page.tsx):**
- Hero: methodology template (smoke graphics, light-red nav, 9:16 video at 70vh, PlayOnceVideo with sound on)
- Headline: `clamp(100px, 18vw, 256px)` with `leading-[0.85]` — global standard for program hero headlines
- EKUZO in black, 100 in red (matches program card style)
- Our Approach: `white-top-2` overlapping hero, `tornPaper="none"` on component
- Ecosystem animation: wrapped in `overflow-visible` div with `grey-top-1` and `grey-bottom-1` — standard for all animation sections
- How It Works: chopped corners (clip-path) on 1234 cards, "ONE MONTH. FOUR STEPS." single line on desktop
- Testimonials: exact homepage module (carousel + static featured quote)
- What's Next: responsive padding `clamp(80px, 14vw, 188px)`, grey-top-1 / grey-bottom-2 dividers
- FAQ: black bg, dark theme, Eyebrow component

**EKUZOTeams page — new canonical location (app/programs/ekuzoteams/page.tsx):**
- Hero: methodology template (smoke graphics, light-red nav, 9:16 video at 70vh, PlayOnceVideo)
- EKUZO in black, TEAMS in red
- Our Approach: `white-top-2`, icons updated (confidence-2 for consistent team, speaking for coach-led practice)
- One Semester One Team section: `black-top-1` / `black-bottom-1`, icon cards (calendar, team, trophy), chopped corners
- Session Structure: chopped corners on 1234 cards, red quote box with quote mark image, Inter font, chopped corners on quote box
- Two Ways to Participate: updated to use TornPaperDivider `black-top-2` (replaced old background-image torn paper), removed bottom paper
- Ecosystem animation: `grey-top-1` / `grey-bottom-1` in overflow-visible wrapper
- Testimonials: homepage module with carousel + quote
- EKUZO System section: two-column layout, eyebrow above grid, program progression cards with red hover borders, bigger titles/darker descriptions
- FAQ: black bg, dark theme

**Games page (app/games/page.tsx):**
- Hero: kept red bg, full-color hero image (removed opacity), Eyebrow `variant="light"` (white bg/red text)
- Headline: `clamp(100px, 18vw, 256px)` — "GROWTH / THROUGH / GAMES"
- Why Games: eyebrow above grid so body copy aligns with headline top, `clamp(3.5rem, 7vw, 7rem)` heading
- Six Pillars sticky scroll: gamer kid collage 2x size (700px wide, -mr-24 overlap behind cards), chopped corners on all 6 cards
- League of Legends: white cards with black text, no torn paper dividers
- Beyond LoL: Eyebrow `variant="light"`, full-color illustration (removed opacity)
- All manual `<p>` eyebrow tags replaced with `<Eyebrow>` component
- All legacy SVG TornPaperDivider calls converted to new PNG system
- Testimonial quote: switched to Inter font (font-body font-bold)

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Added `variant` prop: `"default"` (red bg/white text) and `"light"` (white bg/red text)
- Light variant is for use on colored background sections (red, black, etc.)

**TwoWaysSection (components/sections/TwoWaysSection.tsx):**
- Replaced old background-image torn paper with TornPaperDivider `black-top-2`
- Removed bottom torn paper entirely

**FAQ Eyebrow — global pass (all FAQ sections across the site):**
- Added `<Eyebrow>FAQ</Eyebrow>` to: parents, schools, programs, ekuzoteams-semester-based, ekuzo-teams, ekuzocamps-seasonal, ekuzo-camps, coaching, faq (FAQSection component)
- Added Eyebrow imports where missing

**New route locations:**
- `/programs/e100` — EKUZO100 (canonical)
- `/programs/ekuzoteams` — EKUZOTeams (canonical)
- Old routes (`/ekuzo100-4-week-intro`, `/ekuzoteams-semester-based`) still exist but are now out of date

---

## Aaron — April 1, 2026 (methodology page rebuild + new torn paper system + nav updates)

**What changed:**

**Methodology page (app/methodology/page.tsx):**
- Hero: 70/30 grid, smoke-1@2x lower-left, smoke-2@2x full-height right side (100% section height, behind nav, no flat edges)
- Hero video: 9:16 portrait aspect, 720px max height, play-once behavior with sound on by default (falls back to muted if browser blocks)
- How It Works: grey bg, new torn paper PNG divider at top
- Quote section: red bg, new torn paper red-top-1 and red-bottom-1 dividers
- Ten Pillars: 2/3/2/3 offset column layout, top-left/bottom-right clip-path only, red hover stroke, single-column on mobile

**New reusable component — TornPaperDivider (components/ui/TornPaperDivider.tsx):**
- **NEW PNG API:** `<TornPaperDivider color="red" variant="top" style={1} />`
- Colors: red, grey, black, white. Variants: top, bottom. Styles: 1 or 2.
- Place inside a `relative overflow-visible` section — "top" overlaps section above, "bottom" overlaps section below
- Fixed minimum width (1440px) so paper texture stays sharp on mobile, centered with `left-1/2 translate(-50%)`
- 2px overlap to prevent subpixel gap artifacts
- **Legacy SVG API still works** for existing pages (omit `variant` prop)
- PNG assets in `public/images/new torn paper/` — full set: 24 files (4 colors × 3 variants × 2 styles)

**PlayOnceVideo component (components/ui/PlayOnceVideo.tsx):**
- New client component for video that autoplays once then stops
- Tries sound-on first, falls back to muted if browser blocks
- Shows native controls for replay

**Nav updates (components/layout/Nav.tsx):**
- New `light-red` variant: white background + red EKUZO logo
- Created `public/images/ekuzo-logo-red.svg`
- Removed black border from mobile hamburger button
- Schools, Families, Methodology pages now use `variant="light-red"`

**Other site-wide changes:**
- FooterBanner promo graphic: maxWidth bumped to `clamp(390px, 40vw, 560px)`, maxHeight 800px
- StickyCTA enroll button: added `border-2 border-red`

**Logo files:**
- `ekuzo-logo.svg` — white (for dark backgrounds)
- `ekuzo-logo-black.svg` — black (for light backgrounds)
- `ekuzo-logo-red.svg` — red (for schools, families, methodology)

---

## Aaron — March 31, 2026 (programs page QA + shared component overhaul)

**What changed:**

**Homepage tweaks (app/page.tsx):**
- Torn paper moved down 20px (`translateY(calc(-55% + 20px))`)
- SCHOOL/HOME card body copy margin reduced to 20px (was 80px)
- Card min-height set to 480px (was 512px)
- Hero torn paper switched to background-image div pattern (responsive heights: 115px phone → 300px desktop) positioned at bottom of hero section, matching Framer's White2 component placement
- Torn paper now uses `background-size: cover` on a fixed-height div instead of `<img>` — fixes mobile rendering

**Nav (components/layout/Nav.tsx):**
- Hamburger breakpoint bumped from `md` (768px) to `lg` (1024px) — desktop nav links + button need more room

**StickyCTA (components/ui/StickyCTA.tsx):**
- Now hides when footer scrolls into view (IntersectionObserver on `<footer>`)

**Programs page full QA pass (app/programs/page.tsx):**
- Hero: `min-height: 100vh`, Rive animation full-bleed (`programs-hero.riv`, autoplay)
- Removed all standalone `<TornPaperDivider>` components — replaced with inline background-image divs
- Ecosystem section: added black torn paper top + white torn paper bottom
- Testimonials: max-width → 1120px, headline centered with line break to avoid widows
- FAQ: black background, headline "Frequently asked questions" in Heading 4 size, black torn paper at top

**New file: components/sections/ProgramsHeroRive.tsx**
- Simple autoplay Rive component for programs hero animation

**OurApproachSection (components/sections/OurApproachSection.tsx) — redesigned:**
- Eyebrow above columns, 70:30 layout: heading + body left, icon list right
- Icons match homepage growth section pattern (red circle + white SVG, 50px mobile / 72px desktop)
- New optional `icons` prop (defaults to homepage icons) — backward compatible
- Old `<TornPaper>` removed, replaced with background-image black torn paper at bottom

**ProgramsSection (components/sections/ProgramsSection.tsx) — redesigned:**
- Header centered (matching homepage pattern)
- Headline: "3 programs. 1 system." / "1 esport experience." (line break)
- Cards: removed dark overlay, added angled clip-path corners
- Bottom row: blurb left, CTA button right (`justify-between`)
- Responsive padding + card sizing with clamp()
- Card hrefs updated to correct routes

**TwoWaysSection (components/sections/TwoWaysSection.tsx) — redesigned:**
- Old `<TornPaper>` removed, replaced with background-image torn paper (white top, black bottom)
- Cards: added "For Schools" and "For Families" CTA buttons (red-outlined)
- Cards use `justify-between` layout (heading+body top, button bottom)
- Non-breaking spaces (`&nbsp;`) added to prevent widows in body copy
- Header items centered
- Watermark repositioned to centerY -4%

**FAQAccordion (components/ui/FAQAccordion.tsx) — restyled globally:**
- Arrow icon on the left (chevron in circle, rotates 180° on open)
- Question text fills remaining space
- White/black line separator under each item
- Answer text indented to align with question (padding-left matches icon width + gap)

**QA documentation created:**
- `docs/QA-CHECKLIST.md` — repeatable checklist from all homepage lessons learned
- `docs/PAGE-ROLLOUT-PLAN.md` — prioritized plan for remaining pages (3 tiers)

**Design rules established for future pages:**
- Torn paper: always use PNG background-image on fixed-height div, never `<img>` SVG
- Cards with angled corners: always use clip-path polygon (40px cuts)
- No widows (single words on their own line)
- Nav switches to hamburger at lg (1024px)
- Testimonials headline always centered
- FAQ sections: black bg, "Frequently asked questions" heading, chevron icons

---

## Aaron — March 31, 2026 (homepage QA pass — torn paper, cards, footer wordmark)

**What changed:**

**Torn paper hero→growth gap fix (app/page.tsx):**
- Switched from `paper-white-1.svg` (1440px viewBox, path stops 3px short) to `torn-paper-white-1.svg` (2400px viewBox, `preserveAspectRatio="none"` — stretches to fill any container with zero gaps)
- Positioned: `left-1/2` + `translateX(-50%)` centered, `width: 125%` so edges overflow both sides of viewport (showing middle ~80% of texture), `height: 150px` for peak/valley control
- To adjust: change `width %` to show more/less texture, `height` for drama
- Added `overflow-x-clip` to `<body>` in layout.tsx to prevent horizontal scrollbar from oversized torn paper

**SCHOOL/HOME cards (app/page.tsx):**
- Changed card background from `bg-grey` to `bg-white` (cards are white against black section bg per Framer)
- Added `clip-path: polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)` for 40px angled corners on upper-left and bottom-right (matches Framer SVG mask)
- Set gap between heading and body to 140px on desktop, 100px on mobile
- Increased heading size to 120px and min-height to 512px per Framer spec

**EKUZO footer wordmark (components/layout/Footer.tsx):**
- Replaced JS-based text measurement approach with `ekuzo-huge.svg` asset (dropped in by Aaron)
- SVG renders as `<img>` at `w-full h-auto` — naturally scales to fill container edge-to-edge
- Container breaks out of footer padding with negative margins so SVG spans full viewport width
- Removed footer `paddingBottom` so SVG sits flush with page bottom (no gap below)
- SVG viewBox is 1442×627, left edge of E and right edge of O flush with viewport

---

## Jamie — March 30, 2026 (late night — validation + additional_info)

**What changed:**
- Added form validation for birthday, tshirtSize, gamerTag, and preferredGames on registration form (`app/ekuzo-camps/register/page.tsx`)
- Added 1500-character limit + live character counter on additional_info textarea
- Chunked additional_info across multiple Stripe metadata keys in `/api/camps/register` (up to 1500 chars split into 3×500-char keys)
- Added `additional_info` column to Google Sheets row data in webhook — reassembles chunked metadata before writing
- **Note for future:** Need a QA/monitoring cron job to track registration data integrity (Stripe metadata → Beehiiv fields → Google Sheets rows). Flag mismatches, missing fields, truncated data. Not built yet — add when operational volume justifies it.

**Apps Script update needed:**
- Google Apps Script needs `additional_info` added as column 21 in the sheet and in the `doPost` column mapping. Jamie to update manually.

---

## Jamie — March 30, 2026 (evening session — webhook + sheets + e2e)

**What changed:**
- Updated Stripe webhook (`app/api/webhooks/stripe/route.ts`) — now handles full post-payment data flow:
  - Beehiiv enrollment with all 13 custom fields
  - Tags applied via dedicated POST `/subscriptions/:id/tags` endpoint (create endpoint ignores tags)
  - Automation enrollment via `automation_ids` (array, not singular `automation_id`)
  - Multi-gamer aware: `gamer_name` comma-separated, `camp_week` stores earliest week for automation timing
  - Google Sheets write via Apps Script (one row per gamer, 20 columns incl. registration_id, family_id, birthday, skill_level, tshirt_size, preferred_games)
- Removed deprecated `export const config` (Pages Router pattern, not needed in App Router)
- Set up Google Cloud project (`ekuzo-web`), enabled Sheets API, created service account
  - Service account key creation blocked by Google Workspace org policy — pivoted to Apps Script approach
- Created Google Apps Script web app as Sheets write proxy (no service account needed)
- Added env vars: `STRIPE_WEBHOOK_SECRET`, `GOOGLE_SHEETS_WEBHOOK_URL`
- Installed Stripe CLI via Homebrew, authenticated
- End-to-end tested (3 test payments): Stripe → webhook → Beehiiv (fields + tags) + Google Sheets

**Beehiiv API learnings (important for future work):**
- Create subscription endpoint does NOT support `tags` — must use separate POST `/subscriptions/:id/tags` with `{ "tags": [...] }`
- Create subscription uses `automation_ids` (plural, array of strings), not `automation_id`
- PUT update endpoint silently ignores `tags` field — do not use for tagging
- Create endpoint silently ignores unknown fields (no error, just drops them)

**Architecture decisions:**
- Google Sheets via Apps Script (not googleapis npm + service account) — simpler, no credentials to manage
- Multi-gamer Beehiiv: comma-separated gamer names, earliest camp week for automation timing. Per-gamer emails (different coaches/timing) deferred to v2 via transactional email layer (Resend/SendGrid)
- Google Sheets has one row per gamer with registration_id + family_id for ops/fulfillment

**What's next:**
- Clean up test subscribers in Beehiiv (jamiefosu+1, +2, +3)
- Backfill tags on +1 and +2 subscribers (tags endpoint only worked on +3)
- `/camps/success` page needs building (confirmation with booking summary)
- ContactModal: replace Make.com webhook with `/api/contact` route
- Production deploy: Netlify, production Stripe webhook endpoint, production env vars

---

## Jamie — March 30, 2026

**What changed:**
- Configured Beehiiv for camp registration data flow
  - 13 custom fields created and verified (first_name, last_name, phone, program, gamer_name, camp_week, camp_slot, gamer_count, registration_summary, payment_intent_id, amount_paid, timezone, location)
  - 9 tags created (camp-2026-purchased, source-camp-registration, source-newsletter, source-contact-form, no-promo, vip, camp-2026-completed, ekuzo100-purchased, teams-purchased)
  - Camp Purchase Welcome Sequence automation scaffolded (draft, placeholder content)
- Created `docs/beehiiv-config.md` — portable reference doc for Beehiiv field config, tags, webhook payload spec
- Reviewed Beehiiv reserved fields to avoid naming collisions
- Decided on Google Sheets API as ops/fulfillment layer (replaces earlier Airtable discussion)
- Confirmed Make.com is being retired — no new integrations should use it

**What's in progress (Jamie's lane — orchestration):**
- Stripe webhook needs code update: add source tag, gamer_name/camp_week/camp_slot fields, automation_id
- Google Sheets API integration for fulfillment data (one row per gamer)
- End-to-end test: form → Stripe → webhook → Beehiiv + Google Sheet
- Welcome automation email content (draft in Beehiiv, needs real copy before publishing)

**Decisions made this session:**
- Beehiiv custom field names match webhook snake_case convention (not Beehiiv presets)
- phone field is TEXT not NUMBER (to support formatted numbers)
- gamer_name, camp_week, camp_slot kept as separate fields for automation triggers (not just in registration_summary blob)
- Make.com is being retired — ContactModal still uses it but should be replaced with /api/contact route
- Google Sheets API (direct) replaces Make.com for fulfillment data flow

---

## Jamie — March 27, 2026

**What changed:**
- Added `StickyCTA` component — fixed-bottom bar with "Enroll my gamer" + "Start a conversation" buttons, wired to modal system. Shows after 300px scroll, hides when modal is open. Mounted in root layout.
- Rewrote `EcosystemAnimation.tsx` — replaced broken delta-based scroll with container-relative scroll progress. Added debug overlay (currently off). Still needs PROGRESS_MAX calibration to match Framer pacing.
- Fixed `overflow-hidden` → `overflow-clip` on all 8 pages with the 360vh ecosystem section (overflow-hidden was breaking sticky positioning).
- Set up GitHub repo, transferred to EKuzo-gg org.
- Created AARON-START-HERE.md, SETUP.md, WORKLOG.md.

**What's in progress (Jamie's lane — orchestration):**
- Stripe + Beehiiv integration for camps registration (API routes not yet built)
- `.env.local` has Stripe keys but Price IDs not yet configured

**Known issues:**
- Ecosystem animation PROGRESS_MAX needs calibration (set to 200, should be ~300-400)
- Homepage needs visual QA against live Framer site
- Social icons in Footer are text placeholders, not real SVGs
## Aaron — March 30, 2026 (mobile responsive pass + bird position fix)

**What changed:**

**Bird position (components/ui/ParallaxBird.tsx):**
- Changed from `top: 50vh` (center of viewport) to `top: 85%` (85% of hero section), matching Framer spec `centerY 85%`
- Bird no longer overlaps the headline on initial load
- Mobile size reduced to 180×162px (desktop stays 332×300px)
- Parallax scroll effect preserved

**Mobile: Nav logo (components/layout/Nav.tsx):**
- Logo width set to 110px on mobile, 170px on desktop (`w-[110px] md:w-[170px]`)

**Mobile: Hero section (app/page.tsx):**
- Headline font size bumped: `clamp(4.5rem, 20vw, 256px)` — fills container on mobile
- Horizontal padding: 40px on mobile (`px-[40px]`), 16px on desktop
- Hero collage image constrained on mobile via responsive height clamp
- Section top/bottom padding now responsive with clamp values

**Mobile: Growth section (app/page.tsx):**
- List items (structured practice, skilled coaching, real competition) now appear ABOVE the image on mobile using flex order swap (order-1 mobile → order-2 desktop)
- Red circle icons reduced to 50×50px on mobile (72px on desktop)
- Tighter gaps: 40px between sections on mobile (90px desktop), 6px between list items (8px desktop)
- Section padding reduced on mobile with clamp values

**Mobile: How It Works section (app/page.tsx):**
- Top/bottom padding reduced to ~100px on mobile via `clamp(100px, 14vw, 188px)`
- SCHOOL and HOME headers set to 80px on mobile: `clamp(80px, 8vw, 96px)`
- Card padding and gaps tightened on mobile (p-8 vs p-10, gap-6 vs gap-8)

**Mobile: Testimonials (components/sections/TestimonialsCarousel.tsx):**
- Single card on mobile centered with `max-width: 340px` for desktop-like proportions
- Pagination dots and arrows already functional for swiping through all 8 videos

**Footer Banner (components/sections/FooterBanner.tsx):**
- Swapped brush stroke placeholder with `enroll-promo-graphic.avif` (the two kids illustration)

---

## Aaron — March 30, 2026 (animation fixes + footer banner + video loading)

**What changed:**

**Rive ecosystem animation (components/sections/EcosystemAnimation.tsx):**
- Fixed PROGRESS_MAX: was 200 (broken), now 1000 for desktop and 500 for mobile (matches Framer spec exactly)
- Refactored EcosystemScroll to accept `progressMax` prop instead of using a single global constant
- Both desktop and mobile variants now get their correct Rive input range

**Testimonial videos (components/sections/TestimonialsCarousel.tsx + public/testimonial-videos/):**
- Generated poster JPG images from video first frames (77–185KB each vs 13–88MB mp4s) — videos now show thumbnails instantly
- Added `poster` attribute to all video elements pointing to `{slug}-poster.jpg`
- Set `preload="none"` (poster handles the visual; video data loads on click)
- Faststart-optimized all 9 MP4 files (moved moov atom from end to beginning) for faster playback start

**Footer Banner (components/sections/FooterBanner.tsx):**
- Restructured layout to match Framer: horizontal flex with heading+CTA left, decorative image right
- Added `max-w-[1232px] mx-auto` container matching Framer's 1232px max-width
- Heading and CTA now stack vertically with 72px gap (matching Framer)
- Image component uses `enroll-promo-graphic.avif` (hidden on mobile)

**White paper divider gap (previous session, already applied):**
- `paper-white-1.svg` at hero→growth transition uses `width: calc(100% + 4px)` and `left: -2px` to eliminate right-edge gap caused by SVG viewBox being narrower than full width

---

## Aaron — March 30, 2026 (torn paper rewrite + testimonial quote)

**What changed (Torn paper system rewrite):**

**Torn paper architecture overhaul:**
- Removed all standalone `<TornPaperDivider>` components from between sections (old approach)
- New approach: absolutely positioned `<img>` SVGs inside sections, positioned so the flat/solid edge sits flush at the section boundary and the torn edge extends into the adjacent section
- Removed `TornPaperDivider` import from `app/page.tsx`

**Homepage torn paper placements (app/page.tsx):**
- Hero → Growth: `paper-white-1.svg` at top of growth section, rendered white via CSS filter `brightness(0) invert(1)`, `translateY(-55%)`
- Growth → Ecosystem: `paper-grey-bottom-2.svg` at bottom of growth section, `translateY(55%)`
- Ecosystem top: `paper-white-top-1.svg` (swapped from black — white blends with ecosystem bg), `translateY(-55%)`
- Ecosystem → How It Works: `paper-black-top-2.svg` at bottom of ecosystem, flat edge flush + 2px nudge to close gap
- How It Works → Testimonials: `paper-black-bottom-2.svg` at bottom, `translateY(calc(100% - 2px))` — flat edge flush, torn edge extends into white testimonials
- Ecosystem section overflow changed from `overflow-clip` to `overflow-visible`
- How It Works section overflow changed from `overflow-hidden` to `overflow-visible`

**FooterBanner (components/sections/FooterBanner.tsx):**
- Top: `paper-red-top-2.svg` (created from paper-black-top-2 with red fill #F92524), `translateY(calc(-100% + 2px))` — torn edge extends into white testimonials
- Bottom: `paper-red-bottom-1.svg` at bottom, `translateY(55%)` — overlapping into footer
- Changed `overflow-hidden` to `overflow-visible` to allow torn paper bleed

**New SVG files created:**
- `public/images/paper-red-top-2.svg` — copy of paper-black-top-2 with `fill="#F92524"`

**Testimonials (app/page.tsx):**
- Added `testimonial-quote-mark.png` (red/black stylized quotation marks) above the featured quote

---

## Aaron — March 30, 2026

**What changed (Homepage visual QA pass):**

**Nav (components/layout/Nav.tsx):**
- Logo enlarged from 107px to 170px wide
- Added bold + underline hover state on desktop nav links (hover:font-bold + underline pseudo-element)

**Homepage (app/page.tsx):**
- Growth Through Play: heading gap increased from 64px to 108px, column gap from 80px to 90px (matching Framer spec)
- Growth Through Play: icon SVGs now render white on red circles via CSS filter (brightness(0) invert(1))
- Hero bird: replaced static image with new ParallaxBird client component (scroll-linked parallax effect at 0.3x speed)
- Torn paper dividers: hero→growth changed from red to white; growth→ecosystem changed from black to white
- How It Works: watermark repositioned to centerY 45% (was 50%); SCHOOL card CTA text changed to "Learn more about EKUZO100"
- How It Works: header block max-width widened from 600px to 800px so heading and body text fit properly
- Testimonials: heading changed from "What families are saying" to "What parents are saying" (centered, with line break); gap increased from 56px to 72px; quote max-width narrowed from 600px to 444px
- Added red TornPaperDivider before FooterBanner for clean white→red transition

**FooterBanner (components/sections/FooterBanner.tsx):**
- Removed overlapping brush stroke decoration image (replaced by torn paper divider in page.tsx)
- Top padding adjusted from 120px to 80px

**New file:**
- components/ui/ParallaxBird.tsx — client component for hero bird parallax scroll effect

**Also updated:**
- AARON-START-HERE.md — all file paths updated from ~/Desktop/Projects/EKUZO-Web to ~/Desktop/EKUZO/Projects/EKUZO-Web

---

## Jamie — March 27, 2026

**What changed:**
- Added `StickyCTA` component — fixed-bottom bar with "Enroll my gamer" + "Start a conversation" buttons, wired to modal system. Shows after 300px scroll, hides when modal is open. Mounted in root layout.
- Rewrote `EcosystemAnimation.tsx` — replaced broken delta-based scroll with container-relative scroll progress. Added debug overlay (currently off). Still needs PROGRESS_MAX calibration to match Framer pacing.
- Fixed `overflow-hidden` → `overflow-clip` on all 8 pages with the 360vh ecosystem section (overflow-hidden was breaking sticky positioning).
- Set up GitHub repo, transferred to EKuzo-gg org.
- Created AARON-START-HERE.md, SETUP.md, WORKLOG.md.

**What's in progress (Jamie's lane — orchestration):**
- Stripe + Beehiiv integration for camps registration (API routes not yet built)
- `.env.local` has Stripe keys but Price IDs not yet configured

**Known issues:**
- Ecosystem animation PROGRESS_MAX needs calibration (set to 200, should be ~300-400)
- Homepage needs visual QA against live Framer site
- Social icons in Footer are text placeholders, not real SVGs
