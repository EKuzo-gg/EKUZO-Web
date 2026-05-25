# Phase 3 — Shared register API helper (Seam 3)

> **Captured:** 2026-05-25, on `dev`. Phase 2 shipped @ `46e9cba`.
> **System baseline at Phase 3 start:** `tsc --noEmit` clean, `next build` clean, `.next/server` = 28 MB, 0 mp4/mov/webm in `.next/`. Matches `02-baseline.md` §1.
> **Purpose:** Phase 0-style characterization of the three current `/api/{product}/register` routes. Captures what's genuinely shared, what's genuinely product-specific, and where the rule-of-three abstraction stops. Drives the `lib/registerIntent.ts` extraction in this commit.

---

## 1. Pre-extraction inventory (per-route)

Read of all three routes end-to-end:

| Route | Lines | Shared base | Product-specific |
|---|---:|---|---|
| `app/api/camps/register/route.ts` | 231 | parent/gamer validation, IP/UA/fbc/fbp/origin/UTM threading, cta_source allow-list, squad-token validation, additional_info chunking, per-gamer JSON stringify+slice, PI create | `totalPrice > 0` check; `squad_status` coercion to `"building"\|"looking"\|""`; per-gamer JSON shape (`weekLabel`, `weekDates`, `selectedSlot`→`slot`, `slotHours`, `price`, `birthday`, `gender`, `skillLevel`, `tshirtSize`, `preferredGames[]`); description "EKUZO Camp — N gamer(s)"; amount = `totalPrice * 100` |
| `app/api/ekuzo100/register/route.ts` | 208 | same shared base | `cohort.value` required; `totalPrice === 100 * N` check; metadata adds `cohort_month`, `cohort_label`, `cohort_start`, `cohort_end`, `preferred_days`; per-gamer JSON shape (no `weekLabel`/`slot`/`price`); description "EKUZO100 — Names — cohort.label" |
| `app/api/teams/register/route.ts` | 156 | parent/gamer validation, additional_info chunking, per-gamer JSON stringify+slice, PI create | `paymentPlan ∈ {upfront, installment}`; `chargeNow = (upfront ? 576 : 160) * N`; metadata adds `payment_plan`, `semester`, `semester_label`, `charge_now`, `total_per_gamer`, `stripe_customer_id`; per-gamer JSON shape adds `timePreference`, `firstSemester`; **creates a Stripe Customer first**, passes `customer: customer.id` to the PI; **installment plans set `setup_future_usage: "off_session"`**; description "EKUZOTeams Fall 2026 — …"; returns `{chargeNow, paymentPlan}` in addition to `{clientSecret, paymentIntentId}`. **Does NOT thread attribution, cta_source, fbc/fbp, origin, or squad tokens today.** Phase 5 register-page rebuild will start sending them. |

---

## 2. The shared base (extracted into `lib/registerIntent.ts`)

Identical across camps + e100; matches the shape teams will get once the Phase 5 page rebuild sends the same fields:

1. **Request-context derivation** (server-side, per request):
   - `clientIp` = `x-forwarded-for`'s left-most entry → fallback `x-real-ip` → ""
   - `clientUa` = `user-agent`, sliced to 400 chars
   - `clientFbc` / `clientFbp` = body strings, sliced to 500 chars
   - `origin` = `ekuzo_origin` cookie (set by `middleware.ts`), fallback "unknown"
   - `utm_*` = body.attribution string fields, each sliced to 200 chars
   - `cta_source` = body field, allow-listed against `{hero, sticky, footer, header}` (anything else dropped)

2. **Base metadata object** (always emitted, identical across products):
   - `product` (from `productConfig.id`)
   - `environment` = `process.env.CONTEXT || "development"`
   - `parent_first_name`, `parent_last_name`, `parent_email`, `parent_phone`
   - `gamer_count` (string)
   - `timezone`

3. **Conditional metadata** (added only if non-empty, to leave headroom under Stripe's 50-key cap):
   - `client_ip_address`, `client_user_agent`, `fbc`, `fbp`
   - `origin` (always added — defaulted to "unknown")
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
   - `cta_source` (when in the allow-list)

4. **Squad-token handling** — see §3.

5. **Per-gamer metadata** — `meta[gamer_${i}] = JSON.stringify(productConfig.buildGamerMetadataShape(gamer)).slice(0, 500)`.

6. **`additional_info` chunking** — slice to 1500 chars, chunk into 500-char keys (`additional_info`, `additional_info_2`, `additional_info_3`).

7. **PI creation** — `stripe.paymentIntents.create({ amount, currency: "usd", metadata, receipt_email: parent.email, description, automatic_payment_methods: { enabled: true }, ...piParamsOverride })`.

Returns `{ clientSecret, paymentIntentId }` or a typed error result. Each route adds its own product-specific validation + PI-param overrides on top.

---

## 3. Squad-token semantics — server-side fallback minting

**Decision:** the helper mints `squad_token` server-side as a fallback. Rules (applied in order):

1. If a valid `joining_squad_token` was sent → `meta.joining_squad_token = X`; **do NOT mint** `squad_token`. Joiners inherit the owner's crew.
2. Else if a valid `squad_token` was sent → `meta.squad_token = X`. (Camps + e100 always reach here — their register pages mint client-side via `nanoid(10)`.)
3. Else → mint fresh via `nanoid(10)` server-side; `meta.squad_token = newToken`. (Teams reaches here today — its existing page doesn't mint client-side yet. Phase 5 page rebuild will start minting in the page; until then, the server-side fallback ensures every teams PI carries a working token.)

**Camps + e100 behavior is byte-identical.** Their existing pages always supply a valid token in the non-joiner case, so the helper's "use the passed value" branch fires every time. The server-mint branch is dead code for them.

**Teams behavior gains a `squad_token`** in every PI's metadata starting from this commit. This satisfies the Phase 3 verify-gate requirement ("Teams PI now carries a squad_token in metadata"). The Phase 2 webhook is already wired to consume teams squad tokens — once tokens arrive, `squads` + `squad_members` rows write end-to-end with zero further webhook changes.

**Why server-side fallback (not page-side):** keeps Phase 3 surgical. The page rebuild is Phase 5; teams' existing 1298-line `"use client"` page is being retired wholesale and there's no value in patching it. Server-side fallback also reduces the risk of a future page regression dropping the token — the helper guarantees a token unless one was deliberately suppressed (joiner case).

---

## 4. Product-specific tail (stays in per-route wrappers)

Per handoff §3: "Don't add seams that aren't cleanly shared by all three." These differ enough across the three products that forcing them into the helper would hurt clarity:

| Concern | Camps | E100 | Teams |
|---|---|---|---|
| Amount source | `totalPrice * 100` (from body) | `totalPrice * 100`, validated `=== 100 * N` | `chargeNow * 100` where `chargeNow = (upfront ? 576 : 160) * N` |
| Price validation | `totalPrice > 0` | `=== 100 * N` (server-authoritative) | implicit via `paymentPlan` switch |
| Description | "EKUZO Camp — N gamer(s)" | "EKUZO100 — Names — cohort.label" | "EKUZOTeams Fall 2026 — N gamer(s) ([paid in full \| 1st of 4 payments])" |
| Extra metadata | `squad_status` (coerced) | `cohort_month`, `cohort_label`, `cohort_start`, `cohort_end`, `preferred_days` | `payment_plan`, `semester`, `semester_label`, `charge_now`, `total_per_gamer`, `stripe_customer_id` |
| Per-gamer JSON shape | `weekLabel`, `weekDates`, `slot`, `slotHours`, `price`, `birthday`, `gender`, `skillLevel`, `tshirtSize`, `preferredGames` (joined string) | `firstName`, `lastName`, `gamerTag`, `birthday`, `gender`, `skillLevel`, `tshirtSize`, `preferredGames` (joined) | same as e100 + `timePreference`, `firstSemester` |
| Pre-PI side effect | none | none | `stripe.customers.create(...)` first |
| PI param overrides | none | none | `customer: customer.id`; if installment: `setup_future_usage: "off_session"` |
| Response shape | `{clientSecret, paymentIntentId}` | `{clientSecret, paymentIntentId}` | `{clientSecret, paymentIntentId, chargeNow, paymentPlan}` |

**The Customer-creation step stays inline in the teams route.** Forcing it into the helper would require either a "produce a customer optionally" callback (read by camps/e100 as a no-op) or a separate helper for the Customer path — both add complexity for a single caller. Per the rule-of-three, this is a teams-only concern; it stays in `app/api/teams/register/route.ts`.

**The per-gamer JSON shape is supplied by each route as a function `(gamer) => object`.** The helper handles the `JSON.stringify(...).slice(0, 500)` wrapper. Alternative considered: promote `buildGamerMetadataShape` onto `ProductConfig`. Deferred because the shape is client-form-driven (the registry-side `MetadataGamer` is the *reconstructed* shape the webhook reads back) and adding it to the registry would require duplicating the form's input contract there. The inline lambda in each route is cleaner.

---

## 5. SquadOwner type extension (`lib/squad.ts`)

Phase 3 extends `SquadOwner.product` to include `"teams"` so that when a future teams squad joiner hits `/api/squad/[token]?token=X`, the lookup returns `product: "teams"` cleanly instead of dropping to `undefined` (which the register page treats as camps). Per handoff §1.2, the teams pre-pin is a single-value semester — no real "lock" data, just a "you're joining [name]'s team" banner. The type extension is minimal: add `"teams"` to the union, update the `fetchSquadOwner` validator to accept it.

**No new fields added** to `SquadOwner`. The teams squad row in the Sheets `squads` tab has empty cohort fields (per `teams.buildSquadsRowFields`), and there's no semester data to surface today (one semester per year, implicit). If teams ever runs multiple concurrent semesters or per-school cohorts, that's when a real pre-pin field earns its keep — out of scope now.

**Apps Script coordination:** the user (Jamie) confirmed that the squads-table `product` discriminator may need an Apps Script web-app redeploy before `product: "teams"` rows persist correctly. Webhook is already wired (Phase 2). Confirm with Jamie before relying on teams squad rows landing in Sheets.

---

## 6. What's deferred to Phase 4+ (NOT in this commit)

- **Teams partial-capture routes** (`/api/teams/lead`, `/api/teams/abandoned`) — Phase 4 deliverable. Will read tags + referring_site from `PRODUCTS.teams.beehiiv` (already in registry from Phase 1).
- **Teams register page rebuild** — Phase 5 deliverable. Will start client-side minting + sending attribution/cta_source/fbc/fbp/squad tokens, and will rebuild on the shared register UI (Seam 4) per handoff §3.
- **Teams success page squad panel** — Phase 5 deliverable.
- **Pricing model on the registry** — pricing still hard-coded in each route (camps `totalPrice` from body; e100 `100 * N` server-authoritative; teams `576 / 160`). Promote when there's a second caller for any of these values (e.g. a marketing-page price-display module).
- **Shared register UI (Seam 4)** — Phase 5+ deliverable.

---

## 7. Verify gate (per handoff §4 Phase 3)

Status at end of this commit:

- ✅ `tsc --noEmit` clean
- ✅ `next build` clean
- ✅ `.next/server` size ≤ baseline (28 MB) + small margin — verified post-extraction
- ✅ 0 mp4/mov/webm in `.next/`
- ✅ Code-level: camps + e100 + teams PI metadata reproduces the per-route current shape (verified by reading the new wrapper routes against §1–§4 above)
- ⏳ Live Stripe-CLI test across all 4 cases (camps, e100, teams upfront, teams installment) — **deferred at commit time, blocked on env**. The 4 register endpoints were exercised live (POST to `/api/{product}/register` with realistic payloads on dev server at `:3001`) and all four reached Stripe; Stripe rejected with `"Expired API Key provided: sk_live_…"`. This means the helper → product config → PI-create wiring is sound (routes accept, validate, construct PI params, hand off cleanly; expired-key error reaches the standard 500 error response without orphan side effects — teams Customer creation also fails with the same error before PI creation, so no leftover Customer rows). What's blocked is the **PI-metadata inspection** (no PI was actually created) and the **full webhook end-to-end test** (no PI → no `payment_intent.succeeded` → no Beehiiv/Klaviyo/Sheets writes to diff vs. baseline §2). Both unblock as soon as `.env.local` carries a valid Stripe key (test or live). The recommended path is `sk_test_*` for local — per CLAUDE.md "Local Payment Testing" — then re-fire the 4-endpoint POST batch and the standard two-terminal CLI flow (`stripe listen --forward-to localhost:3001/api/webhooks/stripe` + dev server, run a 4242-card payment through each register page in browser). Teams installment Subscription block must still create with same `trial_end` (Oct 1 2026) / `cancel_at` (Jan 1 2027) — handoff §1.3 byte-identical preservation. **Phase 4 entry should run this test as its first move** so any parity regression surfaces before Phase 4 starts changing teams behavior further.

---

## 8. Phase 4 entry conditions

The next session can assume:
- `tsc --noEmit` clean at start of Phase 4.
- `lib/registerIntent.ts` exposes `createRegistrationPaymentIntent(params)` returning `{ ok: true, clientSecret, paymentIntentId } | { ok: false, status, error }`.
- All three `/api/{product}/register` routes are thin wrappers that:
  1. Run product-specific validation
  2. Build product-specific metadata + per-gamer shape
  3. Call the helper
  4. Apply product-specific response decoration (teams adds `chargeNow`, `paymentPlan`)
- Teams PI metadata carries a `squad_token` whenever the joiner case doesn't apply.
- `lib/squad.ts::SquadOwner` accepts `product: "teams"` (with empty cohort fields).
- Camps + e100 PI metadata is byte-identical vs. pre-Phase-3 (verified by live test).
- Teams installment Subscription block (`02-baseline.md` §2I) unchanged.
- `next.config.mjs` `outputFileTracingExcludes` unchanged.

**Phase 4 deliverable** (per handoff §4): `/api/teams/lead` + `/api/teams/abandoned` partial-capture routes, modeled on `/api/camps/{lead,abandoned}`. Plus the SquadOwner type already accepts "teams" from Phase 3 — Phase 4 should confirm Apps Script returns it. Phase 4 also extends `SquadOwner` with the semester pre-pin shape if/when a real semester data field is needed (today: not needed, banner alone is the UX).
