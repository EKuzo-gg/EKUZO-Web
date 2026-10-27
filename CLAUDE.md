## Brand & page structure
When building a NEW marketing/site page, read `docs/EKUZO-BRAND.md` and match the patterns it documents.
The live codebase is the source of truth — that doc describes it, it does not override it. Do NOT
refactor or "fix" existing working pages (especially torn-paper seams and the color-flipping nav) to match it.
# EKUZO Web — Project Context

<!-- Trimmed 2026-06-07: runbooks → docs/dev-runbook.md, build lessons → docs/learning-log.md,
     camps build spec → docs/camps-design-decisions.md, coding rules → wiki/tools/karpathy-coding-principles.md.
     Keep this file lean (target <200 lines). Detail goes in docs/ with a one-line pointer here. -->

## What we're building
Moving ekuzo.gg off Framer into a native Next.js codebase. Marketing + conversion site for EKUZO, a youth esports coaching platform. Goal: match the Framer site visually, fix what was broken (forms, commerce), add what was missing (camps page, newsletter), then launch on Netlify.

- **Live Framer reference:** https://ekuzo.gg (use Chrome inspector for layout geometry)
- **Framer project copy:** https://framer.com/projects/EKUZO-Development-copy--aPeMudXJOotFDscfsQbK-ca3Db
- **Figma:** https://www.figma.com/design/QNqU4NQ1yygnkpItKD56S6/EKUZO-Web — **reference only, deprioritized**

## Stack
- **Framework:** Next.js 15 (App Router, Turbopack) · **Styling:** Tailwind · **Language:** TypeScript
- **Payments:** Stripe with custom Stripe Elements checkout (NOT hosted checkout)
- **Email:** Beehiiv = general nurture (newsletter, popup/footer capture, tags; legacy camps/e100 welcome automations) · Klaviyo = product email (confirmations, prep flows, event-triggered: "Placed Order" / "Registered Pilot"). Split decided 2026-07-15 — see `docs/beehiiv-config.md` § Platform split. New schedule/detail data → Klaviyo events + Sheets, never new Beehiiv custom fields. **Klaviyo gotchas** (flow-clone trigger filters, template API 404s, side-panel discards, event vars) → [`docs/klaviyo-config.md`](docs/klaviyo-config.md) — read it before touching Klaviyo flows.
- **Hosting:** Netlify · **Node:** `~/.nvm/versions/node/v24.14.0/bin/node`

**Architecture decisions (confirmed):** Next.js API routes handle Stripe + Beehiiv directly — **no Make.com** in the payment flow (retired entirely as of 4/3; ContactModal posts to `/api/contact`). **No Discord** notifications. **No Airtable** for v1 (Stripe dashboard + Beehiiv list is enough at current scale). **No Cloudflare Worker** (API routes replace it). Rationale, rejected alternatives, "when we'd reconsider," and stack evolution → [`docs/architecture-decisions.md`](docs/architecture-decisions.md).

## Typography
- **Display/hero:** Tungsten Narrow (Hoefler & Co, local font in `public/fonts/TungstenNarrow-*.otf`). Weights: Black 900, Bold 700, Semibold 600, Medium 500.
- **Body/UI:** Inter (Google Fonts)
- **Tailwind classes:** `font-display` = Tungsten, `font-body` = Inter
- **Global letter-spacing:** `.font-display` has `letter-spacing: 0.02em` in `globals.css` — applies site-wide; don't override per-element unless intentional.
- **Heading sizes:** use `clamp()` via `style` prop, not fixed Tailwind text sizes.

## Colors (Tailwind custom)
`red` = EKUZO brand red `#F92524` · `black` = pure `#000000` (no `#0a0a0a`) · `grey` = `#EFEEED` off-white section background (`bg-grey`; the old `#f0edea` was retired 2026-10-27).

## Products
1. **EKUZO TEAMS** — school-based semester team program (complex pricing)
2. **EKUZO CAMPS** — seasonal week-based camps, AM/PM slots (primary commerce priority)
3. **EKUZO100** — 4-week home-based individual program

---

## Commerce Architecture

**Flow (confirmed — no Make.com, no Discord):**
1. User fills registration form → 2. Next.js API route creates Stripe Payment Intent with registration data as metadata, returns `client_secret` → 3. Frontend renders Stripe Elements → 4. Stripe webhook fires on `payment_intent.succeeded` → **emits the Klaviyo product event ("Placed Order" / "Registered Pilot") — this is what sends the purchase confirmation** → enrolls in Beehiiv (nurture list only, no transactional email) → writes Google Sheets → 5. Frontend redirects to success page.

<!-- Corrected 2026-08-04 (learning loop 2026-W32 audit). The flow above previously listed only
Beehiiv + Sheets, predating the 2026-07-15 platform split recorded in § Stack. Anyone adding a
product from the old flow would have shipped a silent, customer-facing confirmation-email failure. -->

**Purchase email fires from Klaviyo, never Beehiiv.** Beehiiv is generic nurture only — newsletter,
capture, tags. Any transactional or product-triggered email (confirmation, prep flow, schedule
detail) is a Klaviyo event. When adding a product to the webhook, the Klaviyo event is the first
thing to wire and the thing to test end to end; Beehiiv enrolment is nurture and can fail without a
customer noticing, the Klaviyo event cannot.

**API routes (built):** `POST /api/camps/register`, `POST /api/ekuzo100/register`, `POST /api/webhooks/stripe` (product-aware: **Klaviyo event** + Beehiiv + Sheets), `POST /api/contact`.

**Stripe (camps):** 10 weeks × 2 slots (AM/PM). **Launch price $199 for all weeks** ($299 strikethrough, "Limited-Time Pricing"). Price `lookup_key` is still `ekuzocamps-earlybird-199` (backend identifier, stale name, fine to rename later). Urgency badges ("Filling Fast" / "Only a Few Left") are marketing-only, set per-slot in the `WEEKS` array. No promo codes v1. Price IDs in `.env.local` (`STRIPE_PRICE_CAMPS`), test + prod created. Webhook secret (`STRIPE_WEBHOOK_SECRET`) in `.env.local`: local via Stripe CLI, **production via a webhook endpoint created in the Stripe Dashboard** (see [`docs/dev-runbook.md`](docs/dev-runbook.md)).

**Beehiiv:** 18 custom fields, funnel + purchase tags, welcome automations per program. **Full schema + the hard-won API quirks live in [`docs/beehiiv-config.md`](docs/beehiiv-config.md) — read it before touching Beehiiv code.** Three gotchas that bite hardest: create-subscription does NOT accept `tags` (use the separate POST tags endpoint); it uses `automation_ids` (plural array); **tag removal is impossible via API** — exclude purchase tags from recovery audiences instead. Signup surfaces: homepage **first-visit popup** (gate with `localStorage` so it shows once) + footer **inline signup form**.

**Google Sheets (fulfillment ops):** one row per gamer written by the Stripe webhook via Google Apps Script web app. `ekuzo-purchases` tab (29 cols) + `squads` / `squad_members` tabs (product-aware). Canonical column list in [`docs/apps-script-squad-endpoints-spec.md`](docs/apps-script-squad-endpoints-spec.md). URL in `GOOGLE_SHEETS_WEBHOOK_URL`.

## Modal System
Global modal state in `context/ModalContext.tsx`; use `useModal()`. `openModal("contact")` → ContactModal (posts to `/api/contact`). `openModal("enroll")` → EnrollModal (3 program links). Server components needing modal buttons use `components/ui/ModalButton.tsx`.
- **"Start a conversation"** → `openModal("contact")` · **"Enroll my gamer"** → `openModal("enroll")`. Both wired in Nav, FooterBanner, and pages.

---

## Page Status
All programs live under `/programs/`: `ekuzo100`, `ekuzo-teams`, `ekuzo-camps`, each with `/register` + `/success`. Camps v2 redesign is canonical (since 2026-05-20; v1 archived at `docs/archive/ekuzo-camps-v1-pre-052026.tsx.txt`).

Core pages live: `/`, `/methodology`, `/programs`, `/parents`, `/schools`, `/games`, `/faq`, `/terms-of-service`, `/privacy-policy`, `/blog` (+ posts). Commerce is complete and camps is end-to-end tested. **Still pending:** `/about` page; EKUZO100 end-to-end test payment (code complete). Live build status → `WORKLOG.md`.

**Redirects:** all legacy URLs redirect to canonical `/programs/` routes — see `next.config.mjs` (12 rules).

## Structured Data (JSON-LD)
All Schema.org data lives in **`lib/schema.ts`** — the single source of truth. Do NOT hand-roll JSON-LD in page files; import from `lib/schema.ts` and render with `<JsonLd data={...} />`. (Already present: `rootGraph`, per-program `Course`+`Offer` schemas, `buildBreadcrumbSchema`, `buildFAQPageSchema`, `testimonialVideoGraph`.)

**Rules:**
1. Server-render JSON-LD. Never JS-inject (AI crawlers may skip late-bound data).
2. Prefer `@graph` when emitting multiple related entities on one page.
3. `JsonLd.tsx` escapes `<` — don't bypass it with a raw `<script>`.
4. New page types (e.g. `/about` `Person`, `/blog/[slug]` `Article`) → put the builder in `lib/schema.ts`, not the page file.
5. After any schema change, verify: `curl -s http://localhost:3001/<path> | grep -o 'application/ld+json'` then paste the `@graph` into https://validator.schema.org/.

**FAQ copy pulls from canon:** single source of truth for FAQ Q&A is `knowledge-base/company/knowledge/ekuzo-faq-canon.md`. Do NOT hand-write FAQ answers in `page.tsx`. Update canon first, then pull the answer into the page array (wikilinks stripped), leaving a comment noting canon source + sync date. If a page answer beats canon, backport it into canon. Canon-first keeps site, sales, support, and the `FAQPage` JSON-LD consistent — drift feeds inconsistent facts to AI crawlers.

**Canonical URLs:** `app/layout.tsx` sets `metadataBase: new URL("https://ekuzo.gg")`. Every page `metadata` must include `alternates: { canonical: "/route/path" }`. Client components (register/success) can't export metadata — add a sibling `layout.tsx` server shim. Transactional pages go noindex: register = `robots: { index: false, follow: true }`, success = `robots: { index: false, follow: false }`.

**Before shipping any new page / substantive content change:** run [`docs/ai-optimization-checklist.md`](docs/ai-optimization-checklist.md) (grounded in Google's AI optimization guide; durable version: `knowledge-base/company/marketing/google-ai-optimization-guide.md`).

**Monthly GEO audit:** run `/audit` from repo root → `reports/YYYY-MM-DD/`. Default target prod; pass a URL to audit a preview. Cadence: first week of each month.

---

## Build Discipline & Coding Rules

**Autonomous builds run the Build Loop** (ten roles, seven phases, evidence-gated completion): canonical spec at `knowledge-base/company/agents/agent-loop/build-loop.md`. Briefs reference it rather than re-explaining it. First execution: EKUZO 101 pilot (`docs/ekuzo101-pilot/`).

**One section at a time.** Before coding a section: screenshot-crop it from live Framer → specify geometry explicitly (container, min-height, padding, absolute offsets) → build to spec → verify against the screenshot before moving on. Default breakpoint = 1440px desktop; stack to single column at `md` (768px) unless Framer differs.

**Coding behavior rules (apply to both Jamie's Cowork Claude and Aaron's Claude Code).** Full rationale: `knowledge-base/company/agents/reference/tools/karpathy-coding-principles.md`. The eight, condensed:
1. **Think before coding** — state assumptions, surface alternatives, ask when unclear. Don't guess silently.
2. **Simplicity first** — minimum code that solves the problem; no speculative abstractions.
3. **Surgical changes** — touch only what the request requires; match existing style; every changed line traces to the request.
4. **Goal-driven execution** — define verifiable success criteria + a step plan with checks before coding.
5. **Verify before done** — prove it works (tests, logs, diff vs main). "Would a staff engineer approve this?"
6. **Autonomous bug fixing** — given a bug report, find the logs/errors/failing tests yourself and fix it.
7. **Self-improvement loop** — after any correction, note the pattern; propose a CLAUDE.md addition if a rule is missing.
8. **Demand elegance (balanced)** — for non-trivial changes, ask if there's a cleaner way; skip for simple fixes.

**Voice stack loads before copy drafting.** <!-- Added 2026-07-19 from knowledge-base 2026-07-15-load-voice-stack-before-parent-facing-copy.md (learning loop 2026-W29). De-duplicated 2026-08-03 (learning loop 2026-W31): the rule had been written four times in four files and recurred after each landing, so the canonical text was consolidated into voice-dna.md and this became a pointer. --> Before drafting or proposing any user-facing copy (page headlines, section intros, helper/error states, email templates, CTAs), **load the voice stack per `knowledge-base/system/methodology/voice-dna.md` § "Load before you write"** — that section is canonical and states the load order, the trigger, and the carve-outs. Short version: `voice-dna.md` + the byline holder's voice evidence + `ekuzo-messaging-voice.md`, loaded *before* the first draft, not as a publish-time lint; founder-voice surfaces add `jamie-writing-voice.md`. Applies to copy proposed in chat, not just copy written to files. Lint check before presenting: zero em dashes, no compressed "It's not X. It's Y." reframes, reframes asserted positively.

**Clarity Gate** — before a spec or non-trivial build, rate Goal / Constraints / Success criteria / Context as High/Med/Low; resolve any load-bearing Med/Low (usually one question) before building. Full rule: `knowledge-base/system/methodology/workflows.md` → "The Clarity Gate" (consolidated 2026-07-03; adds task-tuned question sets for scope cuts, voice-led writing, batch sorting, and pipelines).

---

## Shared Components

| Component | Location | Notes |
|-----------|----------|-------|
| Nav | `components/layout/Nav.tsx` | variant="light"\|"dark", modal wired |
| Footer | `components/layout/Footer.tsx` | nav columns + social SVGs + copyright |
| FooterBanner | `components/FooterBanner.tsx` | red CTA strip above footer, modal wired |
| Button | `components/ui/Button.tsx` | red/white × filled/outlined |
| ModalButton | `components/ui/ModalButton.tsx` | client component for modal CTAs in server pages |
| TornPaper | `components/ui/TornPaper.tsx` | color white/black/red, flip prop (see learning-log for the two divider systems) |
| FAQAccordion | `components/ui/FAQAccordion.tsx` | |
| Icon | `components/ui/Icon.tsx` | serves from `/public/icons/[name].svg` |
| ContactModal | `components/ui/ContactModal.tsx` | posts to `/api/contact` |
| EnrollModal | `components/ui/EnrollModal.tsx` | 3 program links |
| ModalRenderer | `components/ui/ModalRenderer.tsx` | mounted in root layout |
| TestimonialsCarousel | `components/TestimonialsCarousel.tsx` | 9 videos, 3 visible |
| EcosystemAnimation | `components/EcosystemAnimation.tsx` | Rive scroll animation |

**Asset locations:** videos in `public/videos/`, 9 testimonial videos (+ `.txt` captions) in `public/testimonial-videos/`, icons in `public/icons/` (SVG, `currentColor`), images in `public/images/`. Full inventory (icon names, image groups, video map) → [`docs/assets.md`](docs/assets.md); `ls` the dir when in doubt.

---

## Team & Collaboration

**People:**
- **Jamie** — CEO/orchestrator. Commerce (Stripe), form routing (Beehiiv), API routes, data flow, copy. Uses Claude via Cowork.
- **Aaron** — lead designer. Front-end: visual QA, CSS, layout, component builds, design fidelity, copy. Uses Claude Code.

**File ownership (soft boundaries):** Aaron's lane = `app/*/page.tsx`, `components/`, `globals.css`, `public/images|icons/`. Jamie's lane = `app/api/`, `.env.local`, `context/`, commerce/payment logic. Shared = `CLAUDE.md`, `WORKLOG.md`, page copy, `Button.tsx` / `ModalButton.tsx`. Communicate before touching the other's lane; git only conflicts when both edit the same lines.

- **Read `WORKLOG.md` at the start of every session** (tracks what each person changed) and **update it before every commit.**
- Branch + git workflow, local payment testing, and build-cache/LFS troubleshooting → [`docs/dev-runbook.md`](docs/dev-runbook.md). Short version: work on `dev`, pull first, ping each other before editing shared files, merge `dev`→`main` to go live.

---

## Reference Docs (extracted from this file — open when relevant)

- [`docs/dev-runbook.md`](docs/dev-runbook.md) — local Stripe payment testing, "module not found" cache fix, Git LFS pre-commit hook, git branch workflow.
- [`docs/learning-log.md`](docs/learning-log.md) — torn-paper divider systems (two of them), **never `fs.readFileSync` from `public/`** (broke a Netlify deploy), Figma asset export, button states, font display.
- [`docs/beehiiv-config.md`](docs/beehiiv-config.md) — full Beehiiv field/tag/automation schema + API limitations.
- [`docs/architecture-decisions.md`](docs/architecture-decisions.md) — stack decisions, rejected alternatives, reconsider conditions, evolution timeline.
- [`docs/camps-design-decisions.md`](docs/camps-design-decisions.md) — camps page as-built spec + design decision log.
- [`docs/assets.md`](docs/assets.md) — full asset inventory (icon names, image groups, video map, fonts).
- [`docs/tooling.md`](docs/tooling.md) — callable skills, slash commands (`/audit`), agent packs, and run cadence.
- [`docs/ai-optimization-checklist.md`](docs/ai-optimization-checklist.md), `GEO-CITABILITY-SCORE.md` — SEO/GEO methodology + per-page citability scoring.

---

## Known Issues / Deferred

1. **Rive animation (EcosystemAnimation)** — `SCROLL_PX_FOR_FULL_PROGRESS = 10000`; programs/parents pages need 14000. Consider a `scrollPx` prop. May redesign the EKUZO 5 animation.
2. **Scroll/parallax sections** — Framer scroll-linked animations are being simplified / replaced with CSS-only equivalents.
3. **Homepage layout** — needs full visual QA against the live Framer site.
4. **Sticky mobile CTA bar** — "Enroll my gamer | Start a conversation" fixed bottom bar; had issues in Framer that carried over. Revisit behavior.
5. **Torn paper universal pass** — apply the divider pattern (see learning-log) across all pages.
