# Phase 1 — Product registry (Seam 1) shipped

> **Captured:** 2026-05-25, on `dev` (this commit). Phase 0 baseline @ `0478038` (see `02-baseline.md`).
> **Status:** verify gate per `01-teams-convergence-handoff.md` §4 Phase 1 PASSED. `tsc --noEmit` clean; webhook golden payloads from `02-baseline.md` §2 reproduce byte-for-byte for camps + e100 via code-level diff.
> **Purpose:** Phase 2 (webhook strategy map) starts from here. This doc tells the next session what's in the registry now, what's intentionally left out, and how to extend it without breaking the parity contract.

---

## 1. What shipped

**New module: `lib/products/`.**

```
lib/products/
├── types.ts        — ProductConfig interface + helper types
├── camps.ts        — campsProduct config
├── ekuzo100.ts     — ekuzo100Product config
├── teams.ts        — teamsProduct config
└── index.ts        — PRODUCTS registry + getProductFromMeta(metaValue)
```

The four "obviously shared" fields the handoff §4 Phase 1 recommended as the first move are now in the registry:

| Field path | Source of truth |
|---|---|
| `programName` | `productConfig.programName` |
| Welcome automation ID | `productConfig.welcomeAutomationId` |
| Beehiiv purchased tags | `productConfig.beehiiv.tags.purchased` |
| Beehiiv post-purchase `referring_site` | `productConfig.beehiiv.referringSites.purchase` |

Two adjacent fields used by the lead/abandoned routes were also lifted into the registry in this commit — they're the same naming family, same single-string shape, and would otherwise be a Phase 4 cleanup pass:

| Field path | Source of truth |
|---|---|
| Beehiiv `form_started_*` tag | `productConfig.beehiiv.tags.formStarted` |
| Beehiiv `cart_abandoned_*` tag | `productConfig.beehiiv.tags.cartAbandoned` |
| Beehiiv `*-form-started` referring_site | `productConfig.beehiiv.referringSites.formStarted` |
| Beehiiv `*-cart-abandoned` referring_site | `productConfig.beehiiv.referringSites.cartAbandoned` |

`teams` config carries pre-built values for `form_started_teams` / `cart_abandoned_teams` / `ekuzo-teams-*` referring sites even though the Teams lead/abandoned routes don't exist yet — so Phase 4 wires them in by reading from the config, no further coordination needed.

---

## 2. Callsites migrated

Five files now read from `lib/products/`:

| File | Before | After |
|---|---|---|
| `app/api/webhooks/stripe/route.ts` | Four ternaries (`programName`, `beehiivReferringSite`, `tags`, `automationId`) + a fifth in the Klaviyo block for `program:` | All five reads sourced from `productConfig.*`. Single `getProductFromMeta(product)` call at the top of the success handler. |
| `app/api/camps/lead/route.ts` | `FORM_STARTED_TAG = "form_started_camps"`, literal `referring_site` string | Both sourced from `PRODUCTS.camps.beehiiv.*` |
| `app/api/camps/abandoned/route.ts` | `CART_ABANDONED_TAG`, literal `referring_site` | Both from registry |
| `app/api/ekuzo100/lead/route.ts` | `FORM_STARTED_TAG = "form_started_ekuzo100"`, literal `referring_site` | Both from registry |
| `app/api/ekuzo100/abandoned/route.ts` | Same shape | Both from registry |

The webhook keeps `const product = meta.product || "camps"` as a string and adds a sibling `const productConfig = getProductFromMeta(product)` — `product` is left in place because the remaining per-product branch logic (Beehiiv `custom_fields.push(...)`, Klaviyo extra properties, Sheets row shape, squad writes, teams installment Subscription) is Phase 2's strategy-map work and was intentionally left untouched here.

`getProductFromMeta` preserves the pre-registry default-to-camps fallback for any unknown / missing `meta.product` value, matching the original webhook ternary's else-branch behavior.

---

## 3. Verify gate (per handoff §4 Phase 1)

**✅ `tsc --noEmit` clean.** Verified after each migration step (registry skeleton → programName → referringSite → tags+automationId → lead/abandoned routes). Final pass: clean.

**✅ Code-level golden-payload diff** (per `02-baseline.md` §3 diffing protocol step 1):

| Surface | Camps value (baseline §2) | Resolved via registry | Match |
|---|---|---|---|
| Beehiiv `custom_fields[program]` | `"EKUZO Camps"` | `campsProduct.programName` | ✓ |
| Beehiiv `referring_site` | `"ekuzo-camps-registration"` | `campsProduct.beehiiv.referringSites.purchase` | ✓ |
| Beehiiv `automation_ids[0]` | `"aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"` | `campsProduct.welcomeAutomationId` | ✓ |
| Beehiiv tag POST body | `["camp-2026-purchased", "source-camp-registration"]` | `campsProduct.beehiiv.tags.purchased` | ✓ |
| Klaviyo `properties.program` | `"EKUZO Camps"` | `campsProduct.programName` | ✓ |

| Surface | E100 value (baseline §2) | Resolved via registry | Match |
|---|---|---|---|
| Beehiiv `custom_fields[program]` | `"EKUZO100"` | `ekuzo100Product.programName` | ✓ |
| Beehiiv `referring_site` | `"ekuzo100-registration"` | `ekuzo100Product.beehiiv.referringSites.purchase` | ✓ |
| Beehiiv `automation_ids[0]` | `"aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556"` | `ekuzo100Product.welcomeAutomationId` | ✓ |
| Beehiiv tag POST body | `["ekuzo100-purchased", "source-ekuzo100-registration"]` | `ekuzo100Product.beehiiv.tags.purchased` | ✓ |
| Klaviyo `properties.program` | `"EKUZO100"` | `ekuzo100Product.programName` | ✓ |

Lead/abandoned routes — string constants identical pre/post; only the source changed.

**Live diff (baseline §3 step 2): NOT executed this phase.** Requires Stripe CLI + a real `payment_intent.succeeded` trigger; out of scope for a code-level extraction commit. Phase 2's verify gate already requires a full live test for both upfront + installment teams payments — at that point a parallel camps + e100 live test will catch any divergence the code-level diff missed.

---

## 4. What's intentionally NOT in the registry yet

Phase 1 stayed surgical. These belong in the registry over Phase 2–4 as their callers get migrated:

- **Klaviyo `registration_summary` per-gamer template** — currently three different string shapes (camps: `weekLabel + slot + weekDates`; e100: `cohort_label`; teams: `semester_label`). This is the "build summary line per gamer" strategy and is Phase 2's webhook strategy-map work. The Beehiiv block has the same triple-shape inline (`gamerSummaries.push(...)` ~line 233–266). Both should converge on one per-product summary builder.
- **Per-product Beehiiv `custom_fields` extras** (camps: `camp_week`, `camp_slot`, `squad_status`, `squad_link`; e100: `cohort_label`, `preferred_days`, `squad_link`; teams: `team_semester`, `team_payment_plan`). Each is a per-surface strategy — Phase 2 should fold them into a `productConfig.beehiiv.buildCustomFields(meta, derived)` callback or equivalent.
- **Per-product Klaviyo extra `properties`** — same pattern as above, same Phase 2 deferral.
- **Per-product Klaviyo `Placed Order` event properties** — third instance of the same per-product shape, also Phase 2.
- **Per-product Google Sheets row shape** (`week`, `slot`, `week_dates` per product, plus squad-token gating). Phase 2.
- **`squadProgramPath`** — `/programs/ekuzo-camps/register` vs `/programs/ekuzo100/register`. Used once today; will be used a second time when Teams squad-link goes in (Phase 2 webhook + Phase 5 success page). Promote to `productConfig.routes.registerPath` then.
- **Meta CAPI `programSlug`** (`ekuzo-camps` / `ekuzo100` / `ekuzo-teams`) — used once today for `event_source_url`. Promote when the second caller appears.
- **Cohort vocab** (`cohortUnit` is in the registry as a label, but no behavior reads it yet) — Phase 5 register UI will need it.
- **Pricing, route paths, squad pre-pin shape** — all flagged in handoff §3 Seam 1; defer until a caller needs them.

The handoff §3 rule "Don't add seams that aren't cleanly shared by all three" still binds. If a Phase 2 attempt to extract one of the above reveals the three products don't fit the same shape, flag it and leave the product-specific branch in place rather than forcing the abstraction.

---

## 5. Phase 2 entry conditions

The next session can assume:
- `tsc --noEmit` clean at start of Phase 2.
- `lib/products/` registry exists with the 4 shared fields (this doc §1).
- Webhook reads `productConfig` once near the top of the `payment_intent.succeeded` handler; that's the seam Phase 2 hangs all its strategy work off.
- Camps + e100 webhook payloads unchanged vs. `02-baseline.md` §2 (verified at code level).
- Teams arm of the webhook is unchanged.
- Lead/abandoned routes for camps + e100 unchanged in behavior; only their source for tags + referring_sites moved.
- `next.config.mjs` `outputFileTracingExcludes` still in place (Netlify deploy guard from CLAUDE.md Learning Log — do not remove).

**Phase 2 deliverable** (per handoff §4): convert webhook per-surface ternaries to per-product strategies; add teams squad writes (Klaviyo `squad_link`, Beehiiv squad fields, Sheets `squads` / `squad_members` rows); preserve teams installment Subscription block exactly.

**Phase 2 verify gate**: camps + e100 byte-identical against `02-baseline.md` §2; new teams payload includes `squad_link` + a `squads` row; live Stripe-CLI test for teams upfront AND installment confirms the Subscription still creates.

**Recommended Phase 2 first move**: extract the `gamerSummaries` string-builder (used identically in Beehiiv §1 and Klaviyo `registration_summary` — current webhook lines ~233 and ~482) into a `productConfig.buildGamerSummary(gamer, meta)` callback. It's the smallest strategy with two callers and one shape per product. Run the §3 diff. Then move to the per-surface `custom_fields` / `properties` extras.

---

## 6. Files changed this commit

| File | Change |
|---|---|
| `lib/products/types.ts` | NEW |
| `lib/products/camps.ts` | NEW |
| `lib/products/ekuzo100.ts` | NEW |
| `lib/products/teams.ts` | NEW |
| `lib/products/index.ts` | NEW |
| `app/api/webhooks/stripe/route.ts` | Import + `productConfig` derivation + 5 ternary→registry replacements |
| `app/api/camps/lead/route.ts` | Import + 2 string-constant migrations |
| `app/api/camps/abandoned/route.ts` | Import + 2 migrations |
| `app/api/ekuzo100/lead/route.ts` | Import + 2 migrations |
| `app/api/ekuzo100/abandoned/route.ts` | Import + 2 migrations |
| `marketing/teams-redesign/03-phase1-registry.md` | NEW (this doc) |
| `WORKLOG.md` | New entry at top |

Net change is small by design — the value of Phase 1 is the seam itself, not the lines saved. Phase 2 is where the line-count win starts to land.
