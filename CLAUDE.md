# EKUZO Web — Project Context

## What we're building
Moving ekuzo.gg off Framer into a native Next.js codebase. Marketing + conversion site for EKUZO, a youth esports coaching platform. Goal: match the Framer site visually, fix what was broken (forms, commerce), add what was missing (camps page, newsletter), then launch on Netlify.

**Live Framer reference:** https://ekuzo.gg (use Chrome inspector for layout geometry when building sections)
**Framer project copy:** https://framer.com/projects/EKUZO-Development-copy--aPeMudXJOotFDscfsQbK-ca3Db
**Figma file:** https://www.figma.com/design/QNqU4NQ1yygnkpItKD56S6/EKUZO-Web **deprioritize Figma, use as reference only**

---

## Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Payments:** Stripe with custom Stripe Elements checkout (NOT hosted checkout)
- **Email Marketing:** Beehiiv (full email automation platform, not just newsletter — welcome sequences, camp prep, reminders, re-enrollment all handled in Beehiiv after subscriber is added)
- **Hosting:** Netlify
- **Node:** ~/.nvm/versions/node/v24.14.0/bin/node

### Architecture Decisions (confirmed)
- **No Make.com in payment flow** — Make.com was needed for Framer (no server-side). Next.js API routes handle Stripe + Beehiiv directly. Make.com may be revisited as operational layer if non-engineers need to modify automations.
- **No Discord notifications** — removed from the registration/payment flow.
- **No Airtable for v1** — Stripe dashboard + Beehiiv subscriber list is sufficient at current scale. Airtable becomes valuable when running multiple programs simultaneously or needing a staff-facing dashboard.
- **No Cloudflare Worker** — set aside. Next.js API routes replace it entirely.

---

## Typography
- **Display/hero headings:** Tungsten Narrow (Hoefler & Co — personal/preview license, loaded as local font from `public/fonts/TungstenNarrow-*.otf`). Weights: Black (900), Bold (700), Semibold (600), Medium (500).
- **Body/UI:** Inter (Google Fonts)
- **Font class names in Tailwind:** `font-body` = Inter, `font-display` = Tungsten Narrow
- **Global letter-spacing:** `.font-display` has `letter-spacing: 0.02em` (2%) set in `globals.css` — applies site-wide to all instances of Tungsten font
- **Heading sizes:** use `clamp()` via `style` prop, not fixed Tailwind text sizes

---

## Colors (Tailwind custom)
- `red` = EKUZO brand red (check tailwind.config)
- `black` = #000
- `grey` / `bg-[#f0edea]` = off-white section background

---

## Products
1. **EKUZO TEAMS** — school-based semester team program (complex pricing, discuss before building)
2. **EKUZO CAMPS** — seasonal week-based camps, AM/PM slots (primary commerce priority)
3. **EKUZO100** — 4-week home-based individual program

---

## Commerce Architecture

### Flow (confirmed — no Make.com, no Discord)
1. User fills registration form on `/camps/register` (week/slot per gamer, parent info, gamer info)
2. Submit → Next.js API route (`/api/camps/register`) creates Stripe Payment Intent with all registration data as metadata → returns `client_secret`
3. Frontend renders Stripe Elements for card payment
4. Stripe webhook (`/api/webhooks/stripe`) fires on `payment_intent.succeeded` → calls Beehiiv API to add subscriber with custom fields (gamer name, week, slot, etc.)
5. Frontend redirects to `/camps/success` with booking summary

### API Routes (to build)
- `POST /api/camps/register` — receives form payload, creates Stripe Payment Intent, returns client_secret
- `POST /api/webhooks/stripe` — handles `payment_intent.succeeded`, enrolls in Beehiiv
- Success page reads confirmation from Stripe or URL params

### Stripe (camps)
- 10 weeks × 2 slots (AM/PM) = 20 combinations
- **Launch pricing:** $199 early bird for ALL weeks (will manually update in code when ready to raise)
- Urgency badges are marketing-only (not capacity-driven): "Filling Fast" / "Only a Few Left" set per-slot in the `WEEKS` data array
- No promo codes for v1
- Stripe Price IDs: configured in `.env.local` (`STRIPE_PRICE_CAMPS`). Test + prod products created.
- Webhook secret (`STRIPE_WEBHOOK_SECRET`): set from Stripe CLI (`whsec_...` in `.env.local`). For production: create webhook endpoint in Stripe Dashboard.

### Beehiiv (email marketing — NOT just newsletter)
- **Setup complete (3/30):** 13 custom fields, 9 tags, welcome automation scaffolded (draft)
- **Full config reference:** `docs/beehiiv-config.md`
- **Registration flow (wired + tested 3/30):** subscriber added on successful payment with all 13 custom fields. Tags applied via separate POST endpoint. Automation enrollment via `automation_ids`.
- **IMPORTANT API quirks (learned the hard way):**
  - Create subscription does NOT support `tags` — use POST `/v2/publications/:pubId/subscriptions/:subId/tags` with `{ "tags": [...] }`
  - Create subscription uses `automation_ids` (plural, array), NOT `automation_id` (singular)
  - PUT update endpoint silently ignores `tags` — do not use for tagging
  - API silently drops unknown fields (no error response)
- **Multi-gamer:** `gamer_name` stores comma-separated first names, `camp_week` stores earliest week for automation timing. Per-gamer emails deferred to v2.
- **Post-registration automation:** welcome sequence scaffolded, camp prep/reminders/follow-up TBD — all managed in Beehiiv's automation builder
- **Welcome automation ID:** `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc` (draft, needs real email content before publishing)
- **Homepage:** first-visit popup (gate with localStorage so it only shows once)
- **Footer:** inline signup form

### Google Sheets (fulfillment ops layer — built 3/30)
- One row per gamer written by Stripe webhook on payment success via **Google Apps Script** web app
- **20 columns:** registration_id, family_id, parent_first_name, parent_last_name, parent_email, parent_phone, gamer_name, gamer_tag, week, slot, week_dates, birthday, skill_level, tshirt_size, preferred_games, timezone, location, amount_paid, stripe_pi_id, registration_date
- Apps Script URL in `GOOGLE_SHEETS_WEBHOOK_URL` env var (Google service account approach abandoned due to Workspace org policy blocking key creation)

### Make.com (RETIRED — no longer used)
- ContactModal now posts to `/api/contact` (replaced Make.com as of 4/3)
- No integrations use Make.com

---

## Modal System
Global modal state in `context/ModalContext.tsx`. Use `useModal()` hook.
- `openModal("contact")` → ContactModal (name, org, email/text, message → `/api/contact`)
- `openModal("enroll")` → EnrollModal (3 program links: EKUZOTeams, EKUZO100, EKUZOCamps)
- For server components that need modal buttons: use `components/ui/ModalButton.tsx`

### CTAs
- **"Start a conversation"** → `openModal("contact")`
- **"Enroll my gamer"** → `openModal("enroll")`
- Both wired in Nav, FooterBanner, and individual pages via ModalButton

---

## Page Status

### Canonical Routes (as of 4/3)
All programs live under `/programs/`:
- `/programs/ekuzo100` — marketing page
- `/programs/ekuzo100/register` — registration + Stripe payment ($100)
- `/programs/ekuzo100/success` — payment confirmation
- `/programs/ekuzo-teams` — marketing page (no commerce yet — next priority)
- `/programs/ekuzo-camps` — marketing page (Aaron's v2 build)
- `/programs/ekuzo-camps/register` — registration + Stripe payment ($199)
- `/programs/ekuzo-camps/success` — payment confirmation

### Complete (launched)
- [x] `/` — Home page
- [x] `/methodology` — Full page (hero video, How It Works, quote, 10 pillars, CTA)
- [x] `/programs` — Programs index
- [x] `/parents` — Families page
- [x] `/schools` — Schools page
- [x] `/games` — Games page
- [x] `/faq` — FAQ accordion
- [x] `/terms-of-service` — Static
- [x] `/privacy-policy` — Static

### Commerce (complete)
- [x] `/api/camps/register` — Stripe Payment Intent for camps
- [x] `/api/ekuzo100/register` — Stripe Payment Intent for EKUZO100
- [x] `/api/webhooks/stripe` — Product-aware post-payment: Beehiiv + Google Sheets (camps + ekuzo100)
- [x] `/api/contact` — Contact form → Google Sheets + Beehiiv lead capture
- [x] Camps end-to-end tested (3 test payments, single + multi-gamer)
- [ ] EKUZO100 end-to-end test (code complete, needs test payment)
- [ ] Teams commerce (next session)
### Remaining
- [ ] `/about` — About page
- [ ] `/blog` — Blog index (static, no CMS)
- [ ] `/blog/[slug]` — Blog post (static)

### Redirect rules (next.config.mjs — 12 rules)
All legacy URLs redirect to canonical `/programs/` routes. See `next.config.mjs` for full list.

---

## Camps Page — Build Direction

**Source:** Variant.com wireframe (mood board → zombie wireframe). Build the structure from the wireframe but apply EKUZO's full visual style (red/black/white, Bebas Neue headings, torn paper dividers, brush art).

### Wireframe sections (in order)
1. **Hero** — "EKUZOCAMP" heading, tagline, stats bar (coaches/virtual/teams counts), hero video (`ekuzo-teams-hero.mp4` or camps-specific), "Register Now" + "Learn More" CTAs
2. **Value props** — 6 cards: Pro Coaches, Virtual, Teams, Practice, Growth, Balance
3. **Daily Schedule** — timeline: Check-in & Warm-up → Skill Drills → Tournament Play → VOD Review & Feedback
4. **Expert Coaches section** — image left, copy right, credentials
5. **Requirements** — Basic computer + headphones; League of Legends section with checklist
6. **Testimonials** — video testimonials (use our `/testimonial-videos/` assets)
7. **Registration form** — choose week (week cards with AM/PM slots + availability + price), parent info, gamer info, payment (Stripe Elements)
8. **FAQ accordion** — 5 common questions
9. **Footer CTA** — "Enroll into a transformational program today"

### Separate pages referenced from camps
- `/camps/schedule` — 6-week grid (Week 1-6, AM/PM slots, availability badges, prices)
- `/camps/checkout` — custom Stripe Elements checkout (credit card form + order summary sidebar + promo code)
- `/camps/success` — "LEVEL UP!" confirmation (booking summary, gamer name, status=Paid, total, receipt download, next steps: check inbox / join Discord / download game)

### Parents page (from wireframe — different from Framer /parents)
- "YOUR GAMER'S GROWTH IS OUR MISSION" hero
- Safety & Moderation Protocol (3 points with icons)
- Meet Our Lead Coaches (3 coach cards)
- Common Parent Questions (FAQ accordion)
- "Still Have Questions?" CTA (Contact Support + Schedule a Call)

---

## Shared Components

| Component | Location | Notes |
|-----------|----------|-------|
| Nav | `components/layout/Nav.tsx` | variant="light"\|"dark", modal wired |
| Footer | `components/layout/Footer.tsx` | Nav columns + social + copyright |
| FooterBanner | `components/FooterBanner.tsx` | Red CTA strip above footer, modal wired |
| Button | `components/ui/Button.tsx` | red-filled, red-outlined, white-filled, white-outlined |
| ModalButton | `components/ui/ModalButton.tsx` | Client component for modal CTAs in server pages |
| TornPaper | `components/ui/TornPaper.tsx` | color: white/black/red, flip prop |
| FAQAccordion | `components/ui/FAQAccordion.tsx` | |
| Icon | `components/ui/Icon.tsx` | serves from /public/icons/[name].svg |
| ContactModal | `components/ui/ContactModal.tsx` | Posts to Make.com webhook |
| EnrollModal | `components/ui/EnrollModal.tsx` | 3 program links |
| ModalRenderer | `components/ui/ModalRenderer.tsx` | Mounted in root layout |
| TestimonialsCarousel | `components/TestimonialsCarousel.tsx` | 9 videos, 3 visible |
| EcosystemAnimation | `components/EcosystemAnimation.tsx` | Rive scroll animation |

---

## Asset Locations

### Videos
- `public/videos/pedagogy-hero.mp4` — Methodology page hero
- `public/videos/ekuzo100-hero.mp4` — EKUZO100 page hero
- `public/videos/ekuzo-teams-hero.mp4` — EKUZOTeams page hero

### Testimonial videos (9 files)
All in `public/testimonial-videos/`:
- `becky-parent.mp4`, `brad-parent-girl-gamer.mp4`, `debbie-potter-monroe.mp4`
- `laura-hogan-mirus-academy.mp4`, `rajitha-parent.mp4`
- `student-i-learned.mp4`, `student-man-of-my-word.mp4`
- `student-thank-you-ekuzo.mp4`, `student-you-should-join.mp4`

Captions: matching `.txt` files in same folder (for bots/SEO).

### Icons (SVG, `currentColor`)
All in `public/icons/`:
**Black set (29):** clock, swords, book, camada, flame, flash, confidence, heart, leadership, skills, chat, handshake, trophy, handwave, speaking, confidence-2, strategy, key, roles, hard-problem, run-first, easy, youth, calendar, enthusiasm, team, visualize, key-2, swords-2
**White set (4):** swords-white, clock-white, camada-white, trophy-white

### Images
All in `public/images/` — see full list with `ls public/images/`.
Key groups: `torn-paper-*`, `brush-stroke-*`, `pedagogy-hero-*`, `schools-*`, `parents-*`, `coaching-*`, `ekuzoteams-*`, `ekuzo100-*`, `community-*`, `home-*`

---

## Known Issues / Deferred

1. **Rive animation (EcosystemAnimation)** — currently `SCROLL_PX_FOR_FULL_PROGRESS = 10000`. Programs/parents pages need 14000. Consider adding `scrollPx` prop. May also redesign the EKUZO 5 animation entirely.
2. **Scroll/parallax sections** — Framer has scroll-linked animations throughout. These will be simplified or replaced with CSS-only equivalents in Next.js.
3. **Stripe Price IDs** — Not yet wired. Add to `.env.local` once products configured.
4. **Homepage layout** — built, needs full visual QA against live Framer site.
5. **Social icons in Footer** — currently text placeholders (IG, FB, YT, DC, X, TK). Need real SVG icons.
6. **Sticky mobile CTA bar** — "Enroll my gamer | Start a conversation" fixed bottom bar. Custom implementation, had issues in Framer that carried over. Revisit behavior.
7. **Torn paper universal pass** — needs to be done across all pages. See Learning Log for the pattern.

---

## Learning Log

### Torn Paper Dividers — Two Systems

**Assets live in:** `public/images/new torn paper/`

There are two types of torn paper dividers. Know which one you need before building.

#### 1. One-sided dividers (tops & bottoms) — use `<TornPaperDivider>`
- These are the standard system. Each PNG has texture on ONE edge only (top or bottom).
- Naming: `torn-paper-{color}-top-{style}@2x.png` / `torn-paper-{color}-bottom-{style}@2x.png`
- Colors: white, grey, black, red. Styles: 1, 2.
- Use via `<TornPaperDivider color="grey" variant="top" style={1} />`
- **Placement rule:** The divider must be OUTSIDE the `overflow-clip` section but INSIDE an `overflow-visible` wrapper div. If you put it inside the clipped section, the overlapping half gets cut off and it won't be visible.
- Pattern:
  ```jsx
  <div className="relative overflow-visible">
    <TornPaperDivider color="grey" variant="top" style={1} />
    <section className="bg-[#f0edea] relative overflow-clip">
      ...
    </section>
    <TornPaperDivider color="grey" variant="bottom" style={1} />
  </div>
  ```

#### 2. Whole dividers (both edges) — raw background-image div
- These PNGs have paper texture on BOTH the top and bottom edges. They straddle two sections.
- Naming: `torn-paper-{color}-{style}@2x.png` (no "top"/"bottom" suffix)
- **Do NOT use `<TornPaperDivider>` for these.** Use a raw `<div>` with `backgroundImage`.
- The div is positioned absolutely at the bottom of a wrapper, with `translateY(52%)` so it hangs half into the section below.
- **Critical:** The div must be a child of the `overflow-visible` wrapper, NOT inside the `overflow-clip` section. Otherwise the bottom half gets clipped and you won't see it overlap.
- The wrapper needs `zIndex: 1` and the section below needs `zIndex: 0` (or its wrapper does) so the torn paper renders on top.
- The section below should use negative `marginTop` + extra `paddingTop` so its background extends up behind the torn paper.
- Pattern (see methodology hero → How It Works for reference):
  ```jsx
  {/* Section above */}
  <div className="relative overflow-visible" style={{ zIndex: 1 }}>
    <section className="bg-white relative overflow-clip" style={{ paddingBottom: "clamp(160px, 22vw, 300px)" }}>
      ...
    </section>
    {/* Whole torn paper — OUTSIDE section, INSIDE wrapper */}
    <div
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
      style={{
        height: "clamp(115px, 19vw, 300px)",
        transform: "translateY(52%)",
        backgroundImage: "url(/images/new%20torn%20paper/torn-paper-grey-1@2x.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden="true"
    />
  </div>

  {/* Section below — pulled up behind the torn paper */}
  <div className="relative overflow-visible" style={{ zIndex: 0 }}>
    <section className="bg-[#f0edea] relative"
      style={{ marginTop: "clamp(-60px, -10vw, -150px)", paddingTop: "clamp(140px, 24vw, 294px)" }}>
      ...
    </section>
  </div>
  ```

**Common mistake:** Putting the torn paper div inside the `overflow-clip` section. It will look like the bottom is being cut off / overrun by the section below. Move it outside the section into the `overflow-visible` wrapper to fix.

### Figma Asset Downloads
- Figma MCP asset URLs are blocked by the VM proxy (exit code 56 from curl). When a Figma asset is needed, ask the user to export it from Figma and drop it into the project. Reference the Figma component name so they know what to export.

### Button States
- All interactive buttons should have: `hover:brightness-110 active:scale-[0.97~0.99] active:brightness-90 transition-all duration-150`
- Matches the existing `Button.tsx` variant pattern

### Font Display
- Tungsten Narrow is loaded as a local font (not Google Fonts). Weights: Black (900), Bold (700), Semibold (600), Medium (500).
- Global `letter-spacing: 0.02em` on `.font-display` in `globals.css` — do not override per-element unless intentional.
- Remove per-element `letterSpacing` style props on `font-display` elements so the global value applies consistently.

---

## Development

```bash
# Start dev server
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next dev

# TypeScript check
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/tsc --noEmit

# Build (note: Turbopack/PostCSS issue in prod build - investigate before deploy)
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next build
```

---

## Troubleshooting

### "Cannot find module" / "ENOENT build-manifest.json"
Turbopack's build cache gets corrupted when lots of files change in one session. Fix it with these 3 steps:

```bash
# Step 1: Stop the dev server
# Press Ctrl+C in the terminal where it's running

# Step 2: Delete the stale build cache
rm -rf .next

# Step 3: Restart the dev server (rebuilds everything fresh)
npx next dev -p 3001
```

**When does this happen?** Usually after rapid edits to shared components (Nav, Footer, layout files) that are imported on every page. The compiled chunks get out of sync.

**One-liner (stop server first with Ctrl+C, then paste this):**
```bash
cd ~/Desktop/EKUZO/Projects/EKUZO-Web && rm -rf .next && npx next dev -p 3001
```

**How to avoid it:** Restart the dev server every so often during heavy editing sessions. If you see any weird "module not found" errors, it's almost always this.

---

## Build Discipline (from Cursor feedback)

**One section at a time.** Before coding any section:
1. Screenshot crop of that section from live Framer site
2. Specify geometry explicitly: container type, min-height, padding, absolute children with offsets
3. Build to that spec
4. Verify against screenshot before moving on

**Breakpoints:** Default = 1440px desktop. Stack to single column at `md` (768px) unless Framer shows different behavior.

**Objective checklist per section:** e.g. "headline font-black uppercase, max-w correct, torn paper 100px strip, no white gap between sections."

---

## Team & Collaboration

### People
- **Jamie** — CEO/orchestrator. Handles commerce (Stripe), form routing (Beehiiv/Make), API routes, data flow, copy updates. Uses Claude via Cowork.
- **Aaron** — Lead designer. Handles front-end: visual QA, CSS, layout, component builds, design fidelity, copy updates. Uses Claude Code ($20 plan).

### Important for Claude instances
- **Read `WORKLOG.md` at the start of every session.** It tracks what each person changed since their last commit. This is how you stay aware of the other person's work.
- **Update `WORKLOG.md` before every commit.** Add an entry at the top with name, date, and what changed.
- Aaron and Jamie are both new to terminal (started this week). Give clear, step-by-step instructions. Don't assume they know shortcuts, flags, or conventions. When in doubt, explain what a command does before asking them to run it.

### File ownership (soft boundaries)
Aaron and Jamie communicate before touching each other's areas, but here's the general split:

**Aaron's lane (front-end):**
- `app/*/page.tsx` — page layouts and sections
- `components/` — all UI and section components
- `app/globals.css` — styles
- `public/images/`, `public/icons/` — assets

**Jamie's lane (orchestration):**
- `app/api/` — API routes (Stripe, webhooks, etc.)
- `.env.local` — environment variables
- `context/` — app state (modals, etc.)
- Commerce/payment flow logic

**Shared (both may edit):**
- `CLAUDE.md`, `WORKLOG.md` — project context
- Copy text within any page
- `components/ui/Button.tsx`, `components/ui/ModalButton.tsx` — shared UI primitives

### Git workflow
Both work on `main`. No branches. Simple rules:
1. `git pull` before starting work
2. Tell each other before working (Slack/text) so you don't edit the same file
3. Commit and push when done
4. If you get a merge conflict, stop and talk — don't force push

### Preventing overwrites
Aaron's front-end work will typically be ahead of Jamie's orchestration work. This is fine because they touch different files. The risk is small, but to be safe:
- Aaron works in `components/` and `app/*/page.tsx`
- Jamie works in `app/api/` and `context/`
- If either needs to touch the other's area, communicate first
- Git will auto-merge changes to different files. Conflicts only happen when both edit the same lines in the same file.
