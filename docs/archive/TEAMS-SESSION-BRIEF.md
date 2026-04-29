# EKUZOTeams Commerce — Session Brief

**Date:** April 3, 2026
**Goal:** Design and build the EKUZOTeams registration form + payment flow, then prepare full site for Netlify deploy.

---

## Context

Camps and EKUZO100 commerce are done. Teams is the last product that needs a payment flow before launch. Jamie flagged Teams pricing as "complex" — the complexity is product/commercial, not technical.

## What's already built
- Marketing page at `/programs/ekuzo-teams` (Aaron built, live in repo)
- Product-aware Stripe webhook at `/api/webhooks/stripe` handles any product via `meta.product` field
- Camps ($199/week) and EKUZO100 ($100/month) registration forms + API routes are the pattern to follow
- `app/api/checkout/route.ts` has placeholder structure for `STRIPE_PRICE_TEAMS` and `STRIPE_PRICE_TEAMS_INSTALLMENTS`
- EnrollModal currently links Teams to the marketing page (not a register page)

## Why Teams is "complex" — decisions needed from Jamie

### 1. Two buyer tracks
- **School (B2B):** School admin buys for students. Currently funnels to "Start a conversation." Is this self-service at launch, or stay conversation-first?
- **Home (B2C):** Parent buys for their kid. Standard checkout like camps/e100.

### 2. Pricing
- What's the semester cost?
- Upfront only, or upfront + installment option (4 monthly payments)?
- Same price for school and home tracks?

### 3. Registration form design
- Single gamer (like e100) or multi-gamer (like camps)?
- Semester selection — one active semester, or multiple to choose from?
- Does the form need a "track" selector (School vs Home)?
- What gamer fields? Same as e100 (name, tag, birthday, gender, skill level, preferred games, schedule preference)?

### 4. Beehiiv + Google Sheets
- Tags: `teams-purchased`, `source-teams-registration` (proposed)
- Custom fields: `team_track` (home/school), `semester` (fall-2026, spring-2027)?
- Welcome automation: separate from camps/e100, or shared?

## What's ready to build once decisions are made
The technical pattern is identical to camps/e100:
1. `app/programs/ekuzo-teams/register/page.tsx` — registration form
2. `app/api/teams/register/route.ts` — creates Stripe Payment Intent (or Subscription for installments)
3. `app/programs/ekuzo-teams/success/page.tsx` — confirmation page
4. Webhook already handles product branching — just needs `"teams"` case added
5. Update EnrollModal link from `/programs/ekuzo-teams` → `/programs/ekuzo-teams/register`

## After Teams commerce: launch checklist
- [ ] Push latest commit (committed locally, not yet pushed)
- [ ] Run `next build` locally to verify
- [ ] Test EKUZO100 end-to-end (code complete, needs test payment)
- [ ] Create Beehiiv tags: `ekuzo100-purchased`, `source-ekuzo100-registration`, `source-contact-form`
- [ ] Google Sheets: add `product` + `gender` columns, add `contact_inquiries` handler to Apps Script
- [ ] Stripe: create production webhook endpoint for ekuzo.gg domain
- [ ] Netlify: connect repo, set env vars, configure custom domain
- [ ] Verify all redirects work in production

## Key files to read
- `CLAUDE.md` — full project context
- `WORKLOG.md` — latest entry is Jamie's April 3 session (this one)
- `app/api/webhooks/stripe/route.ts` — product-aware webhook (reference for Teams case)
- `app/api/ekuzo100/register/route.ts` — cleanest reference for a new register route
- `app/programs/ekuzo100/register/page.tsx` — cleanest reference for a new registration form
