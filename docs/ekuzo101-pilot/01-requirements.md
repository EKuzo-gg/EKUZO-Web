# EKUZO 101: Summer Pilot — Requirements

**Owner:** Fable  
**Date:** 2026-07-15  
**Branch:** feat/ekuzo101-pilot  
**Status:** Auditor-signed (see §10)

---

## Product Requirements

**R1.** A landing page at `/programs/ekuzo101` that communicates: 4-week pilot (Tue/Thu 7–8:30 PM ET), family picks their own weeks from a rolling 6-week window, free upfront, $160/mo anchor for the follow-on team program.  
**Acceptance:** Page renders; hero, how-it-works, coaches, testimonials, FAQ, CTA sections present; schedule and price framing per §4.5 of brief.

**R2.** A register page at `/programs/ekuzo101/register` with a week picker replacing the cohort picker. No payment UI. No Stripe imports.  
**Acceptance:** Page renders; week picker shows exactly 6 tiles; no Stripe Elements, no PaymentStep, no CheckoutForm components present; `tsc --noEmit` clean.

**R3.** Week picker: min 4, max 6, any pattern. Submit disabled until 4 selected. Each tile shows the week label and both Tue + Thu dates.  
**Acceptance:** With 3 tiles selected, submit is disabled; with 4, enabled. Counter state visible.

**R4.** Week window is computed at render time. Eligible weeks = next 6 Tuesdays whose 7 PM ET session has not yet started, anchored on Tuesday.  
**Acceptance:** Running on 2026-07-15 at 9 AM ET produces 6 tiles starting week of Jul 21. Running at 7:01 PM ET on Tue Jul 21 excludes Jul 21 from the window.

**R5.** ET cutoff enforced in `America/New_York` timezone. Documented in code.  
**Acceptance:** Unit test for ET boundary: `isWeekEligible(date, refTime)` returns false when refTime is 7 PM ET on the week's Tuesday.

**R6.** A success page at `/programs/ekuzo101/success` that is self-sufficient: shows selected weeks with full Tue/Thu dates and time, what happens next, pay-at-the-end promise. No payment confirmation UI (no "Total Paid", no Stripe fields).  
**Acceptance:** Page renders with weeks + schedule info passed from the register POST response (via sessionStorage or similar); no payment references visible.

**R7.** Multi-gamer support carried from e100 (all gamers in a family share the same selected weeks).  
**Acceptance:** Registration with 2 gamers produces 2 Sheets rows with the same weeks values.

---

## Technical Requirements

**R8.** `ekuzo101` added to `ProductId` union in `lib/products/types.ts`.  
**Acceptance:** `tsc --noEmit` passes; no breakage to camps/e100/teams callers.

**R9.** `welcomeAutomationId` optionalized in `ProductConfig` (`welcomeAutomationId?: string`). Stripe webhook guards `automation_ids` against undefined: `automation_ids: automationId ? [automationId] : []`.  
**Acceptance:** Webhook file diff shows only the guard addition; `tsc` clean; camps/e100/teams behavior unchanged.

**R10.** `lib/products/ekuzo101.ts` declares the ekuzo101 ProductConfig. Registered in `lib/products/index.ts`.  
**Acceptance:** `PRODUCTS.ekuzo101` resolves without error.

**R11.** `POST /api/ekuzo101/register` performs fulfillment directly (no Stripe PI). Returns success JSON to the client. Any single fulfillment step failure must not block the others or return a client error when registration data was valid.  
**Acceptance:** With GOOGLE_SHEETS_WEBHOOK_URL unset, route still returns 200 to client; console logs the skip.

**R12.** Beehiiv fulfillment: create-subscription with custom fields (including `weeks_label` field) + no `automation_ids` + `referring_site: "ekuzo101-pilot-registration"`. Then separate POST for tags `["ekuzo101-pilot-registered", "source-ekuzo101-pilot"]`. Send_welcome_email false.  
**Acceptance:** Live test subscriber `jamiefosu+101test-1@gmail.com` has both tags + weeks_label field in Beehiiv (verify via API GET).

**R13.** Klaviyo fulfillment: profile-import → list-add to `KLAVIYO_PURCHASERS_LIST_ID` → track metric **"Registered Pilot"** with `product: "EKUZO101"` and `weeks_label`, `weeks_count`, `gamer_name` properties. NOT a "Placed Order" event.  
**Acceptance:** Live test creates "Registered Pilot" event in Klaviyo visible in the profile's activity feed.

**R14.** Google Sheets fulfillment: POST `{ rows: [...] }` to `GOOGLE_SHEETS_WEBHOOK_URL`. One row per gamer. Payload keys shape-identical to the webhook's existing rows (same field names). Program fields = `"ekuzo101"`, amount fields = `$0.00`. Weeks stored in the `week` column (overloaded as per e100 convention), `week_dates` = "first Tue – last Thu" span.  
**Acceptance:** Payload dump in evidence ledger shows all required fields; no new field names absent from the existing sheet headers.

**R15.** A per-registration UUID (crypto.randomUUID() or equivalent) included in Sheets row for ops dedupe. Does not require schema change to existing Sheets columns — use an existing field or append as a documented extra.  
**Acceptance:** UUID visible in Sheets row evidence dump.

**R16.** `POST /api/ekuzo101/lead` — clones e100 lead route. Beehiiv `form_started_ekuzo101` tag, `referring_site: "ekuzo101-form-started"`. Klaviyo `trackKlaviyoEvent` with metric "Started Registration" and `product: "ekuzo101"`.  
**Acceptance:** `tsc` clean; route structure mirrors e100/lead.

**R17.** Server-side week validation in `/api/ekuzo101/register`: 4–6 weeks; each parses to a Tuesday ISO date; each inside the currently-eligible window recomputed server-side in ET; deduped. Rejects any payload containing `totalPrice` (tripwire).  
**Acceptance:** POST with `{ totalPrice: 199, weeks: [...] }` returns 400. POST with 3 weeks returns 400. POST with a non-Tuesday date in the weeks array returns 400.

**R18.** Client-side single-flight submit guard: submit button disabled on submit, not re-enabled on success redirect.  
**Acceptance:** Clicking Submit twice in quick succession produces only one POST to `/api/ekuzo101/register` (observable in network tab).

**R19.** `/programs/ekuzo101` landing page: `robots: { index: false, follow: true }` (noindex). `/programs/ekuzo101/register`: `robots: { index: false, follow: true }`. `/programs/ekuzo101/success`: `robots: { index: false, follow: false }`. All with `alternates: { canonical: "/programs/ekuzo101[/register|/success]" }`.  
**Acceptance:** `curl localhost:3001/programs/ekuzo101 | grep "noindex"` returns a match.

**R20.** Register and success pages export no `metadata` (client components) — sibling `layout.tsx` server shims carry the metadata instead.  
**Acceptance:** `tsc` clean; no "metadata export in client component" build error.

**R21.** Meta pixel events: `ViewContent` on register page load, `trackLead` on email blur (via `useRegisterForm`), and a completion event on successful submit (e.g. `CompleteRegistration` or equivalent thin helper in `lib/analytics.ts`).  
**Acceptance:** No console errors about undefined pixel functions on register page.

**R22.** No JSON-LD / schema.org on any 101 page (all noindex).  
**Acceptance:** Zero `application/ld+json` script tags on rendered 101 pages.

---

## Copy Requirements

**R23.** Zero em-dashes (`—`), en-dashes (`–`), or arrows (`→`) in any customer-facing copy (landing page, register page, success page, Klaviyo template copy).  
**Acceptance:** `grep -r "—\|–\|→" app/programs/ekuzo101/ docs/ekuzo101-pilot/` returns zero matches.

**R24.** Factual claims on landing page diff against `knowledge-base/company/marketing/ekuzo-fact-library.md` and `ekuzo-faq-canon.md` sentence-by-sentence. No paraphrased facts from memory.  
**Acceptance:** Steward sign-off in evidence ledger.

**R25.** The Fortnite/Roblox screentime joke appears on the landing page. Tone: warm, in on the joke with the parent, never sneering at the kid. Grounded in `ekuzo-screen-time-science.md`.  
**Acceptance:** Steward approves the execution; Parent (fresh-eyes) reads it as warmly inclusive.

**R26.** Price framing: "free upfront" + "$160/mo" anchor. Spirit matches Karlin's pitch verbatim: "Try it free. If it was worth it, pay at the end and roll into the team program."  
**Acceptance:** Steward confirms offer integrity against brief §1.

**R27.** FAQ copy sourced from `ekuzo-faq-canon.md` where applicable (wikilinks stripped, comment marking canon source + sync date). Pilot-specific Q&As (how does free work, what if we miss a week) flagged as canon-backport candidates.  
**Acceptance:** FAQ section has at least 4 Q&As; each has a code comment noting source.

---

## Integration Requirements

**R28.** Live integration test with `jamiefosu+101test-1@gmail.com`. Beehiiv: both tags confirmed, `weeks_label` custom field confirmed. Klaviyo: profile exists, "Registered Pilot" event in activity, list membership confirmed. Sheets: payload dump in evidence.  
**Acceptance:** All three verified; confirmation artifacts in `docs/ekuzo101-pilot/04-evidence-ledger.md`.

**R29.** Cleanup ledger (`06-cleanup-ledger.md`) records every test subscriber ID created. No destructive cleanup attempted (Beehiiv tag removal not possible via API per `docs/beehiiv-config.md`).  
**Acceptance:** Ledger has rows for every test write.

---

## Non-Regression Requirements

**R30.** Zero diff on: `app/programs/ekuzo-camps/**`, `app/programs/ekuzo100/**`, `app/programs/ekuzo-teams/**`, `next.config.mjs`, `lib/products/camps.ts`, `lib/products/ekuzo100.ts`, `lib/products/teams.ts`. The Stripe webhook (`app/api/webhooks/stripe/route.ts`) is allowed ONE change: the `automation_ids` guard required by R9.  
**Acceptance:** All camps/e100/teams page files and product strategy files are untouched. Stripe webhook diff is exactly one line: `automation_ids: automationId ? [automationId] : []`. **All allowed exceptions:** `lib/products/types.ts` (union + optional field), `lib/products/index.ts` (register ekuzo101), `lib/analytics.ts` (extend unions + trackRegistration), `hooks/useRegisterForm.ts` (extend ProductLeadSlug), `app/api/webhooks/stripe/route.ts` (automation_ids guard only), `WORKLOG.md` (top entry).

**R31.** `next build` completes without errors on `feat/ekuzo101-pilot`.  
**Acceptance:** Build output logged; no error exits.

**R32.** `tsc --noEmit` passes.  
**Acceptance:** Zero TypeScript errors.

**R33.** Camps page renders and all camps API routes are functional after this branch's changes (regression smoke test).  
**Acceptance:** `http://localhost:3001/programs/ekuzo-camps` returns 200; network tab shows no JS errors.

---

## Scoping / Out of Scope

**R34.** No payment UI, no Stripe imports, no Stripe PI creation on any 101 surface. The register route does NOT call `createRegistrationPaymentIntent`.  
**Acceptance:** `grep -r "stripe\|PaymentStep\|CheckoutForm\|createRegistration" app/programs/ekuzo101/` returns zero.

**R35.** No sitemap entries, no llms.txt entries, no schema.org markup, no redirects for 101 pages.  
**Acceptance:** `app/sitemap.ts` shows no 101 entries.

**R36.** No merge to dev, no deploy, nothing set live in Klaviyo/Beehiiv.  
**Acceptance:** Fable confirms at Phase 7 gate.

---

## 10. Auditor Sign-off

| Dimension | Status | Notes |
|---|---|---|
| Requirements complete | PASS | All spec sections §§4–6 covered |
| Requirements testable | PASS | Each R has explicit acceptance criteria |
| Non-regression explicit | PASS | R30 names every protected file |
| Integration test specified | PASS | R28/R29 |
| Open flags captured | PASS | Logged in 03-decision-log.md |

**Auditor verdict:** Requirements are complete and testable. Phase 2 may proceed.
