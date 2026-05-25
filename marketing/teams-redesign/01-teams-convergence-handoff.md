# EKUZO Teams — Registration Convergence & Build — Claude Code Handoff

> **Status:** Shaped in Cowork 2026-05-25. Ready for Claude Code implementation.
> **Branch:** do all work on `dev`. Never touch `main` directly.
> **Read first:** this doc, then `marketing/ekuzo100-redesign/01-ekuzo100-spec.md`
> (the e100 redesign — your template for "converge to the cohort_* contract"),
> `marketing/ekuzo100-redesign/00-camps-pattern-reference.md` (what camps does),
> and `knowledge-base/logs/decisions/2026-05-24-products-as-one-workflow-converge-contract-defer-codebase.md`
> (the decision that named THIS build as the merge moment).
>
> **One-line premise:** Camps, EKUZO100, and Teams are the *same workflow* — only
> the **cohort unit** differs (week / month / semester). Camps shipped first,
> e100 was built as a structural twin in a generic `cohort_*` vocabulary
> *specifically so Teams could converge to it*. Teams is the **third instance**.
> Per the 5/24 decision, this is the rule-of-three moment: stop copying, and
> **extract the shared logic into a real reference shape** — then run all three
> products through it.

---

## 0. How to use this handoff

1. Open Claude Code at the repo root (`ekuzo-web/`) on the `dev` branch. `git pull origin dev` first.
2. Read `CLAUDE.md` end-to-end. It is the source of truth for stack, commerce
   architecture, the Netlify deploy traps, the torn-paper system, the git
   workflow, and the **Coding Behavior Rules (Karpathy principles)** — those
   rules govern this entire build.
3. Read `WORKLOG.md` for what Aaron/Jamie changed recently. Add a `WORKLOG.md`
   entry before every commit.
4. Work the **Phase plan (§4)** in order. Each phase has explicit verify steps.
   Do not start a phase until the prior phase's verification passes.
5. This is a brownfield refactor of **live, tested, revenue-carrying code**
   (camps + e100 are shipped). The prime directive is **behavior parity for
   camps and e100** — convergence must not change a single observable behavior
   for the two live products. Teams is the only product whose behavior changes.

---

## 1. Decisions locked in the 2026-05-25 Cowork session

These four are settled. Build to them; don't re-litigate.

1. **Refactor depth — extract a shared reference shape, keep thin product
   configs (the rule-of-three merge).** Jamie's words: "you tell me best
   practice; the pages are getting bloated and there's probably a better
   solution." There are now **three** real instances of the same workflow
   (register pages: camps 2043 / e100 1626 / teams 1298 lines; three near-
   identical register API routes; a 1036-line webhook that is mostly
   `product === "camps" | "ekuzo100" | "teams"` ternaries). That triplication
   is the signal the decision doc was waiting for. Extract the duplicated logic
   into shared modules parameterized by a **product registry**, and reduce each
   product to a thin config + its genuinely unique UI. **This is an
   incremental, behavior-preserving extraction — NOT a big-bang "one
   parameterized engine" rewrite.** The decision doc explicitly warned against
   over-abstracting under deadline; respect that by extracting only seams that
   are demonstrably duplicated across all three, and proving parity at each step.

2. **Teams squad — full universal squad link, same as camps/e100.** The only way
   to buy Teams on the website is as a **B2C** customer (institutional sales are
   handled off-site, out of scope). So web Teams works exactly like the other
   two: every Teams buyer mints a working `squad_token` (delivered in the day-0
   confirmation email — "gamers recruiting gamers" is now a universal
   post-purchase nurture play, not an in-flow feature). A friend who clicks a
   Teams share link lands on the Teams register with the **owner's semester
   pre-pinned** + a "you're joining [name]'s team" banner — mirroring how e100
   pre-pins the cohort month and camps pre-pins week+slot. Cohort unit =
   **semester**. **Note the pre-pin is lightweight by nature:** a semester is a
   single value (Fall 2026), so unlike camps (week+slot) or e100 (one of several
   months) there's nothing meaningful to *lock* — the join experience is
   effectively the "you're joining [name]'s team" banner over a normal Teams
   register. Don't build elaborate pre-pin/warn-on-change machinery for a single
   value; the banner + carrying `joining_squad_token` through to the email is the
   whole job. (If Teams ever runs multiple concurrent semesters or per-school
   cohorts, that's when a real pre-pin selection earns its keep — out of scope now.)

3. **Teams form — strip to the camps/e100 minimal shape.** Jamie: "adopt as much
   of camps/e100 as possible." Drop the rich per-gamer fields the current Teams
   form collects (`gamerTag`, `gender`, `skillLevel`, `tshirtSize`,
   `timePreference`, `firstSemester`, `preferredGames`). Target: **parent info
   (first, last, email, phone) + gamer (first name + birthday only)** — identical
   to camps/e100. **KEEP** the one genuine Teams-specific difference: the
   **payment-plan choice** (upfront $576 = 10% off $640, vs. installment 1×$160
   now + Stripe Subscription for 3×$160 Oct/Nov/Dec). That subscription flow
   already works in the webhook — preserve it exactly.

4. **Performance — measure first, then fix in scope (marketing + register
   pages).** Pages "aren't loading as well as I'd like." Do NOT blind-refactor
   for speed. Profile first (bundle size, the giant client register components,
   asset/video weight, Lighthouse), then fix what the data shows. Both the Teams
   marketing page and the register pages are in scope. See Phase 0 and Phase 6.

---

## 2. Current Teams state — what exists vs. what's missing

**Exists (verified 2026-05-25):**
- `app/programs/ekuzo-teams/page.tsx` (558 lines) — marketing page.
- `app/programs/ekuzo-teams/register/page.tsx` (1298 lines) — **rich form**, no
  squad wiring, no email-on-blur, no partial-capture.
- `app/programs/ekuzo-teams/register/layout.tsx` + `success/layout.tsx` — metadata shims.
- `app/programs/ekuzo-teams/success/page.tsx` (150 lines) — **no squad panel**.
- `app/api/teams/register/route.ts` (155 lines) — creates Stripe Customer + PI;
  handles upfront vs. installment; **no squad_token minting**, no partial-capture.
- `app/api/webhooks/stripe/route.ts` — has a `teams` arm AND the working
  installment **Subscription** creation (`STRIPE_PRICE_TEAMS_INSTALLMENTS`,
  `trial_end` Oct 1, `cancel_at` Jan 1). But: **squad_token / squad_link are NOT
  written for teams** (teams is explicitly excluded from the squad blocks), and
  the Sheets `squads` / `squad_members` write only runs for `camps | ekuzo100`.
- Teams welcome automation already wired: `aut_fea2b01b-eccd-40c7-9d53-2b370c039ddb`.
- `lib/squad.ts` — `SquadOwner` type knows only `"camps" | "ekuzo100"`.
- `next.config.mjs` — Teams redirects already in place.
- `lib/schema.ts` — `ekuzoTeamsCourseSchema` already exists (per CLAUDE.md).

**Missing / to build:**
- `/api/teams/lead` and `/api/teams/abandoned` partial-capture routes.
- Teams squad: mint token in register route, pre-pin/banner on register page,
  squad panel on success page, `squad_link` + token to webhook (Klaviyo/Beehiiv/Sheets).
- `lib/squad.ts` `SquadOwner` extended to `"teams"` (semester pre-pin shape).
- Teams Email 1 in Klaviyo (`marketing/email-flows/email-templates/03-teams-purchase-confirmation.html`).
- The shared reference-shape extraction (the core of this handoff).

---

## 3. The convergence architecture (proposed seams)

Extract these four seams. Each is duplicated across all three products *today*,
which is what justifies extracting now. If, while building, a seam turns out NOT
to be cleanly shared by all three, **stop and flag it** rather than forcing the
abstraction (rule-of-three means the abstraction must fit all three real cases —
validate, don't assume).

**Seam 1 — Product registry (`lib/products/`).** A single typed config object
per product declaring everything that varies: `id` (`camps|ekuzo100|teams`),
`cohortUnit` (`week|month|semester`), pricing model, route paths, Beehiiv
welcome `automationId`, Beehiiv tags (`form_started_*`, `cart_abandoned_*`,
purchased tag), labels, and squad pre-pin shape. This is the "config over code"
seam every other seam reads from. It replaces scattered `product === "x" ? … : …`
ternaries with `PRODUCTS[product].field`.

**Seam 2 — Webhook strategy map.** The webhook is the highest-leverage target
(1036 lines, mostly branching). Replace the per-surface ternaries (Beehiiv
fields, Klaviyo `Placed Order` properties, Sheets row shape, registration
summary builder) with per-product strategy objects driven by the registry.
**Behavior must be byte-for-byte identical for camps and e100** — characterize
first (Phase 0), then refactor. The teams installment Subscription block stays;
just make sure it survives the refactor unchanged.

**Seam 3 — Shared register API helper (`lib/registerIntent.ts` or similar).**
The three `/api/{product}/register` routes share: validate parent/gamers, mint
`squad_token` (via `lib/squad.ts`), build PI metadata (attribution, origin,
fbc/fbp, cta_source, per-gamer JSON blobs, 500-char chunking), create the PI.
Extract that; each route becomes a thin wrapper that supplies its product config
and its product-specific metadata (camps: week/slot; e100: cohort_*; teams:
payment_plan + the Customer + setup_future_usage for installments).

**Seam 4 — Shared register UI (React).** The register pages share the hero,
PARENT INFO + GAMER INFO sections, `validate()` (top-to-bottom error ordering +
scroll-to-first-error via `data-error-key`), `handleSubmit()`, `handleEmailBlur()`
partial-capture, Stripe Elements mount, and the sticky summary sidebar. Extract
those into shared components / a hook (e.g. `useRegisterForm`). The
**product-specific** remainder is just the picker (camps week/slot grid, e100
month+pattern, teams semester + payment-plan selector) and pricing. This is the
biggest **source line-count / maintainability** win. Be precise about what it
does and doesn't buy: deduplicating source does NOT by itself shrink what any
single page ships to the browser (the same logic still runs per page), so this
extraction is the maintainability answer — **not** automatically the
load-performance answer. Actual load wins are measured separately in Phase 6.
The extraction is a natural *opportunity* for perf (moving logic server-side,
trimming heavy client imports, right-sizing the giant client components), but
Phase 6's measurements decide what actually ships faster. Treat camps + e100 as
the two existing callers the shared UI must reproduce exactly; Teams is the
third caller you build on top of it.

> **Sequencing note:** Seam 1 (registry) first — everything reads from it. Then
> Seam 2 (webhook) and Seam 3 (API) can go in parallel. Seam 4 (UI) last, after
> the data contract is settled, because the UI's job is just to produce the
> metadata the API/webhook expect. Build Teams *on the extracted shape* rather
> than copying the 1298-line page and editing it.

---

## 4. Phase plan (goal-driven, each phase gated by its verify step)

State your assumptions before each phase and confirm with Jamie if any seam
doesn't fit all three products (Karpathy "think before coding").

**Phase 0 — Baseline & characterization (do NOT skip).**
- Capture a performance baseline so Phase 6 is data-driven: `next build` and
  record route bundle sizes; run Lighthouse (or note the metric you use) on the
  Teams marketing page + a register page; `du -sh .next/server`; `find .next -name "*.mp4"`
  (must be empty — see the CLAUDE.md `fs.readFileSync`/Netlify lesson); note any
  oversized assets the Teams pages load.
- Characterize current camps + e100 webhook output: for a known test PI, capture
  the exact Beehiiv payload, Klaviyo `Placed Order` properties, and Sheets row(s)
  the current code produces. These are your golden values — the post-refactor
  webhook must reproduce them exactly for camps + e100.
- → **verify:** baseline numbers + golden payloads written down (drop them in
  this folder as `02-baseline.md`). `tsc --noEmit` clean before you start.

**Phase 1 — Product registry (Seam 1).**
- Build `lib/products/` with typed configs for camps, e100, teams. Migrate the
  webhook + register routes to read labels/automationIds/tags from it
  incrementally, one field at a time, keeping behavior identical.
- → **verify:** `tsc --noEmit` clean; webhook golden payloads for camps + e100
  unchanged (diff against Phase 0).

**Phase 2 — Webhook strategy map (Seam 2).**
- Convert the per-surface ternaries to per-product strategies. Add the teams
  squad writes here (Klaviyo `squad_link`, Beehiiv squad fields, Sheets
  `squads`/`squad_members` rows for teams). Preserve the teams installment
  Subscription block exactly.
- → **verify:** camps + e100 golden payloads still byte-identical; new teams
  payload includes `squad_link` and a squad row. Run a teams test payment
  (Stripe CLI, §6) for both upfront and installment; confirm the installment
  Subscription still creates.

**Phase 3 — Shared register API helper (Seam 3).**
- Extract the shared PI/metadata/squad-mint logic; rewire all three routes
  through it. Teams route keeps its Customer creation + `setup_future_usage`
  for installments. Add `squad_token` minting to the teams route.
- → **verify:** `tsc --noEmit`; a camps + e100 + teams test PI each still
  produces correct metadata (inspect in Stripe dashboard / CLI).

**Phase 4 — Teams partial-capture + squad lib.**
- Build `/api/teams/lead` (Beehiiv tag `form_started_teams`, Klaviyo
  `Started Registration` w/ `product: "teams"`) and `/api/teams/abandoned`
  (tag `cart_abandoned_teams`, Klaviyo `Started Checkout`). Model exactly on
  `/api/camps/{lead,abandoned}`; fire-and-forget, try/catch, not awaited.
- Extend `lib/squad.ts` `SquadOwner` to `product: "camps"|"ekuzo100"|"teams"`
  with the teams pre-pin shape (semester). Apps Script squad tables are already
  product-aware — add `"teams"` as a valid `product` value (coordinate the Apps
  Script change; see §6 human handoffs).
- → **verify:** lead/abandoned routes fire on a real form session (check
  Beehiiv subscriber tag + Klaviyo event); `tsc --noEmit`.

**Phase 5 — Teams register page + success page (Seam 4 + Teams UI).**
- Rebuild `app/programs/ekuzo-teams/register/page.tsx` **on the shared register
  UI**: minimal form (parent + gamer first name + birthday), semester picker +
  payment-plan selector, squad `?squad=TOKEN` join → pre-pin semester + banner +
  warn-on-change, email-on-blur → `/api/teams/lead`, pre-PI →
  `/api/teams/abandoned`, mint `squad_token`. Drop all the retired rich fields.
- Add the squad "Bring your crew" panel to `app/programs/ekuzo-teams/success/page.tsx`
  (lift from camps/e100 success).
- Migrate camps + e100 register pages onto the same shared UI **only to the
  extent it doesn't change their behavior** — if a camps-specific quirk resists
  sharing, leave camps on its own copy and flag it (don't break the shipped flow
  to win a few lines).
- → **verify:** all three register pages render and submit; camps + e100 visual
  + behavior unchanged (spot-check against current dev preview); Teams form is
  minimal and the payment-plan toggle drives the right charge.

**Phase 6 — Performance fixes (data-driven, from Phase 0 baseline).**
- Fix what the baseline flagged. Likely candidates given the architecture:
  oversized client components (the extraction itself should shrink them), heavy
  imports pulled into client bundles, unoptimized hero media on the marketing
  page, missing `next/image` usage, client components that could be server
  components. Only change what the measurement justifies.
- → **verify:** re-run the Phase 0 measurements; show before/after. No
  regression in any route's bundle size. `.next/server` size sane; no `.mp4` in
  the trace.

**Phase 7 — Full verification (see §5).**

---

## 5. Verification & best-practice guardrails

Jamie explicitly asked this handoff carry the discipline we've converged on.
All of the below is mandatory before declaring done.

**System checks — before / during / after (per CLAUDE.md):**
- **Before:** `git pull origin dev`; read `CLAUDE.md` + `WORKLOG.md`; `tsc --noEmit`
  clean; Phase 0 baseline captured.
- **During:** `tsc --noEmit` after each phase; run the dev server (`npx next dev -p 3001`)
  and click the actual pages; commit per phase with a `WORKLOG.md` entry.
- **After:** `next build` succeeds; **`du -sh .next/server` and `find .next -name "*.mp4"`**
  (the Netlify 50MB function-bundle trap — `next build` passing locally does NOT
  prove the deploy will; this check does). Full Stripe-CLI payment test for
  **all three products** incl. Teams upfront AND installment (test card
  `4242 4242 4242 4242`); confirm Sheets rows, Klaviyo `Placed Order`, Beehiiv
  subscriber + welcome automation, and (installment) the Subscription all land.

**Security checklist:**
- Stripe webhook **signature verification** stays intact; **livemode isolation**
  (skip events whose `livemode` doesn't match the key prefix) preserved.
- All squad tokens pass `lib/squad.ts::isValidSquadToken` before reaching Stripe
  metadata or Apps Script (4–32 chars, `[A-Za-z0-9_-]`). Never trust raw
  `?squad=` input.
- Server-side input validation on every API route (parent/email/gamers/payment
  plan). Reject bad payloads with 400, don't create a PI.
- No secrets in client code; all keys stay in `.env.local` / server routes.
- Respect Stripe metadata limits (500 chars/value; the chunking pattern in the
  teams route).
- **Never `fs.readFileSync` from `public/`** in server code (CLAUDE.md Learning
  Log — it broke the Netlify deploy once; inline strings instead).

**LLM / SEO optimization (GEO):**
- Register + success pages stay `noindex` via their `layout.tsx` metadata shims;
  marketing page keeps `alternates: { canonical: "/programs/ekuzo-teams" }`.
- JSON-LD only via `lib/schema.ts` + `<JsonLd>` — never hand-rolled. Confirm
  `ekuzoTeamsCourseSchema` is current after any pricing/copy change; if the Teams
  marketing page gains an FAQ, use `buildFAQPageSchema` + `buildBreadcrumbSchema`.
- Run the AI-optimization checklist (`docs/ai-optimization-checklist.md`) on the
  Teams marketing page before declaring done. Validate any schema change at
  https://validator.schema.org/.

**Karpathy coding rules (CLAUDE.md → "Coding Behavior Rules"):** simplicity
first, surgical changes (every changed line traces to this handoff), think
before coding (flag unclear seams instead of guessing), verify before done
(prove it works — don't mark complete on partial/failing state), demand elegance
on the extraction but don't over-engineer the product-specific bits.

---

## 6. Human handoffs (can't be done in code — flag these to Jamie)

- **Klaviyo flow** for Teams Email 1: the connected Klaviyo tools create
  *templates/campaigns* but not *flows/flow-filters*. Jamie (or Aaron) must
  create the Teams confirmation flow in the Klaviyo dashboard, triggered by the
  shared `Placed Order` metric, **filtered to `event.extra.product == "teams"`**
  (same pattern as camps/e100 — do NOT create a program-prefixed metric).
- **Teams Email 1 template:** clone the camps source to
  `marketing/email-flows/email-templates/03-teams-purchase-confirmation.html`,
  swap camp tokens for `{{ event.extra.semester_label }}` / `cohort` tokens +
  `{{ event.extra.squad_link }}`, extend `build-klaviyo.py`'s `TOKEN_MAP`, then
  `python3 build-klaviyo.py 03-teams-purchase-confirmation.html`. Tokens only
  resolve once Phase 2's webhook arm emits them.
- **Apps Script:** adding `"teams"` to the squad tables' `product` discriminator
  may need an Apps Script web-app redeploy (the script owns the Sheets schema).
  Confirm with Jamie before relying on teams squad rows landing.
- **Env vars:** confirm `STRIPE_PRICE_TEAMS_INSTALLMENTS` (and any Teams price
  IDs) are set in `.env.local` for test, and flagged for prod.
- **Aaron:** front-end visual QA / design fidelity on the new Teams register +
  success pages is Aaron's lane — coordinate before/after his pass.
- **KB:** after the merge lands, fill in the "Actual outcome" section of
  `knowledge-base/logs/decisions/2026-05-24-products-as-one-workflow-converge-contract-defer-codebase.md`
  (did the generic contract hold? what actually varied across the three?).

---

## 7. Explicit non-goals / deferrals

- **No institutional/B2B Teams flow** — web Teams is B2C only; institutional is
  handled off-site.
- **No big-bang single parameterized register component** — extract shared seams,
  keep thin product-specific UI. Don't force one mega-component.
- **Don't break camps or e100** — behavior parity is non-negotiable; if sharing a
  seam risks their behavior, leave them and flag it.
- **No `squad_member_count`** (pre-optimization for an Email 4 that doesn't exist
  — matches camps/e100 deferral).
- **No real capacity tracking / waitlists / urgency badges** for Teams.
- **No new Klaviyo metric names** — reuse the shared `Placed Order` /
  `Started Registration` / `Started Checkout` metrics, filtered by `product`.

---

## 8. Definition of done

1. All three products run through the extracted shared seams (registry + webhook
   strategy + register API helper + register UI), with camps + e100 behavior
   proven unchanged against Phase 0 golden values.
2. Teams register is the minimal camps/e100 form + semester picker + payment-plan
   selector + universal squad (mint token, pre-pin semester on join, banner,
   success-page panel).
3. `/api/teams/lead` + `/api/teams/abandoned` live and firing.
4. Teams webhook arm writes squad_link + squad rows; installment Subscription
   still creates; Beehiiv welcome automation fires.
5. Teams Email 1 source built (flow creation handed to Jamie/Aaron).
6. Performance: measurable improvement vs. Phase 0 on the pages flagged, no
   bundle regressions, `.next/server` clean, no `.mp4` in trace.
7. `tsc --noEmit` clean, `next build` succeeds, all three products pass a full
   Stripe-CLI test payment (Teams: both upfront and installment).
8. `WORKLOG.md` updated; KB decision "Actual outcome" filled in.
