# EKUZO Web — Architecture Decisions & Tech Evolution

A log for someone coming into the project: **what we run, what we considered but didn't use, and
why the stack evolved the way it did.** CLAUDE.md holds the current decisions in bare form (no
rationale); this file holds the reasoning and the "when we'd reconsider" notes so they aren't lost
to git history.

Format: newest entries at the top. Each decision records what we chose, what we rejected, and the
condition that would make us revisit.

---

## Current stack (source of truth: `CLAUDE.md` → Stack)

Next.js 15 (App Router, Turbopack) · Tailwind · TypeScript · Stripe (custom Elements checkout) ·
Beehiiv (email automation) · Google Sheets (fulfillment ops) · Netlify (hosting).

---

## Decision log

### Commerce flow: Next.js API routes, not a middleware layer — confirmed 2026-04-03
**Chose:** Next.js API routes handle Stripe + Beehiiv + Google Sheets directly. The Stripe webhook
(`/api/webhooks/stripe`) does enrollment + fulfillment writes; `ContactModal` posts to `/api/contact`.

**Considered and rejected:**
- **Make.com** — was genuinely needed on Framer (no server-side compute). Once we moved to Next.js,
  API routes do the same work without the external dependency. Retired entirely 4/3.
  *Reconsider if:* non-engineers need to build/modify automations without touching code — Make.com
  could come back as an operational layer (not in the payment path).
- **Cloudflare Worker** — set aside; Next.js API routes replace it entirely. No separate edge layer needed.
- **Discord notifications** — removed from the registration/payment flow. No ops value at current scale.

### Email platform split: Beehiiv = general nurture, Klaviyo = product email — decided 2026-07-15
**Chose:** Beehiiv owns the newsletter and long-term audience nurture (popup/footer capture,
tags, weekly sends). Klaviyo owns product email: registration confirmations, prep sequences,
and event-triggered flows ("Placed Order" for paid products, "Registered Pilot" for the 101
pilot). New program schedule/detail data goes to Klaviyo event properties + Sheets — NOT to
Beehiiv custom fields.

**Context:** Surfaced during the EKUZO 101 review. 101's `weeks_label` was being sent to a
Beehiiv custom field that would never exist (Beehiiv silently drops unknown fields); the fix
was recognizing the platforms have different jobs, not creating the field.

**Considered and rejected:**
- **Beehiiv for product email too** — its automations work for camps/e100 welcomes (which
  predate this split and keep running), but tag removal is impossible via API and event-style
  triggers are weak. Klaviyo's metric-triggered flows are the right tool.
  *Reconsider if:* consolidating to one email platform ever becomes worth the migration cost.

### Squads for 101: availability-affiliation, not schedule inheritance — decided 2026-07-15
**Chose:** 101 squad links affiliate families (shared `squad_token` groups them in Sheets)
but never pre-pin a schedule — each family picks its own weeks, and the group's availability
overlap tells the coach which window to run. Camps/e100 squad links pre-pin the owner's
week/cohort; 101 deliberately does not (pilot is drop-in friendly, "recess-like").

**Context:** anchor families bring groups (10-15 kids) whose availability won't overlap 100%.
Locking joiners to the owner's schedule would block exactly the families the pilot is for.

### Data layer: Stripe dashboard + Beehiiv list, no Airtable — v1 decision
**Chose:** No Airtable. Stripe dashboard (payments) + Beehiiv subscriber list (audience) + Google
Sheets (per-gamer fulfillment rows) cover v1.

**Considered and rejected:**
- **Airtable** — sufficient tooling already exists at current scale.
  *Reconsider if:* running multiple programs simultaneously, or we need a staff-facing dashboard
  that Sheets can't serve cleanly.

---

## Evolution timeline

- **Origin:** Site was built on **Framer**. The whole project premise is migrating ekuzo.gg off
  Framer into a native **Next.js** codebase — match the visuals, fix what was broken (forms,
  commerce), add what was missing (camps page, newsletter), launch on Netlify.
- **2026-04-03:** Make.com retired from the payment flow; API routes take over. Commerce
  architecture confirmed (Stripe Elements + product-aware webhook → Beehiiv + Sheets).
- **2026-05-20:** Camps page v2 redesign promoted to canonical; v1 archived
  (`docs/archive/ekuzo-camps-v1-pre-052026.tsx.txt`).

---

## How to use this file

When a stack decision gets made (or reversed), add an entry here with the rejected alternatives and
the reconsider condition — don't just update CLAUDE.md's bare decision line. Genuinely strategic
decisions (a platform migration, a payments-provider switch) can additionally get a
`knowledge-base/personal/journal/decisions/` journal entry for cross-project visibility.
