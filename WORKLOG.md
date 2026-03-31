# EKUZO Work Log

**Purpose:** This file keeps both Jamie's and Aaron's Claude instances aware of what's changed. Update this BEFORE every commit. Your Claude should read this at the start of every session.

**Format:** Most recent entry at the top. Include your name, date, and what changed.

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
