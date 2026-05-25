# Phase 2 — Webhook strategy map (Seam 2) shipped

> **Captured:** 2026-05-25, on `dev` (this commit). Phase 1 baseline @ Phase 1 commit (see `03-phase1-registry.md`).
> **Status:** verify gate per `01-teams-convergence-handoff.md` §4 Phase 2 PASSED at the code-level. `tsc --noEmit` clean. Camps + e100 webhook payloads reproduce `02-baseline.md` §2A–§2H byte-for-byte; teams payload now includes `squad_link` in Beehiiv + Klaviyo and the `squads` / `squad_members` write paths are wired (gated on `meta.squad_token` / `meta.joining_squad_token`, which Phase 3 starts populating). Teams installment Subscription block (§2I) unchanged.
> **Purpose:** Phase 3 (shared register API helper) starts from here. This doc tells the next session what surfaces are now strategy-driven, what's intentionally left out, and how the `WebhookContext` flows.

---

## 1. What shipped

**`lib/products/types.ts` extended with three building blocks:**

1. **`MetadataGamer`** — moved from the webhook into the registry. Will be reused by Phase 3's `lib/registerIntent.ts` helper.
2. **`WebhookContext`** — single snapshot of derived values (squadLink, squadStatusLabel, earliestWeek/Slot/WeekDates) the webhook computes once at the top of the success handler and passes to every per-surface strategy. Camps-only fields are `""` for e100/teams; non-camps strategies ignore them by construction.
3. **`ProductConfig` gained 9 new members** — a `routes` block, a `squad` block, and **seven builder callbacks** that replace every per-surface ternary the Phase 0 baseline characterized:

| New `ProductConfig` member | Replaces ternary at (pre-Phase-2) | Source-of-truth shape |
|---|---|---|
| `routes.registerPath` | `app/api/webhooks/stripe/route.ts` line ~225 (`squadProgramPath`) | `/programs/{slug}/register` per product |
| `routes.programSlug` | line ~889 (Meta CAPI `event_source_url`) | `ekuzo-camps` / `ekuzo100` / `ekuzo-teams` |
| `squad.writesSquadRows` | line ~758 (`if (product === "camps" \|\| product === "ekuzo100")`) | true for all three products post-Phase-2 |
| `buildGamerSummary(gamer, meta)` | lines ~241–266 (Beehiiv loop) AND lines ~480–490 (Klaviyo profile.registration_summary) | one string per gamer |
| `buildBeehiivCustomFields(meta, ctx)` | lines ~325–348 | per-product `custom_fields` extras |
| `buildKlaviyoProfileProperties(meta, ctx)` | lines ~506–528 | per-product profile properties |
| `buildKlaviyoOrderProperties(meta, ctx)` | lines ~596–615 (Placed Order event spreads) | per-product event properties |
| `buildPurchaseRowCohortFields(gamer, meta)` | lines ~660–668 (`week`/`slot`/`week_dates` ternaries in Sheets row) | the three Sheets cohort columns |
| `buildSquadsRowFields(gamers, meta)` | lines ~774–805 (owner selection + cohort fields in `squads` row) | owner + camps fields + e100 fields |
| `buildSquadMemberRowFields(gamer, meta)` | lines ~837–844 (`squad_members` row member_*) | per-gamer member fields |

**Each builder lives in its product's config file (`lib/products/{camps,ekuzo100,teams}.ts`)** so a single file fully describes one product's webhook behavior. No `if (product === "x")` branches inside the strategies — each product just declares its shape.

---

## 2. Webhook restructure

The webhook now has a clean three-stage shape at the top of `payment_intent.succeeded`:

```
1. Verify signature + mode isolation
2. Compute shared derived values (location, postal, receipt, attribution, orderId, gamers, squadLink, squadStatusLabel, earliestWeek/Slot/WeekDates)
3. Build ctx: WebhookContext + gamerSummaries
4. Run per-surface enrollment, each surface reading via productConfig.buildX(meta, ctx)
```

Surfaces touched by the migration:
- **Beehiiv subscribe** — `customFields.push(...productConfig.buildBeehiivCustomFields(meta, ctx))` after the shared base
- **Klaviyo profile-import** — `...productConfig.buildKlaviyoProfileProperties(meta, ctx)` spread into `klaviyoProperties`
- **Klaviyo `Placed Order` event** — `...productConfig.buildKlaviyoOrderProperties(meta, ctx)` spread into event properties
- **Sheets `ekuzo-purchases` row** — `...productConfig.buildPurchaseRowCohortFields(gamer, meta)` spread into each per-gamer row; `squad_status` / `squad_token` / `joining_squad_token` / `preferred_days` now product-agnostic (gated by registry flags or driven by meta-presence)
- **Sheets `squads` row** — `productConfig.buildSquadsRowFields(gamers, meta)` returns owner + cohort fields
- **Sheets `squad_members` row** — `productConfig.buildSquadMemberRowFields(gamer, meta)` per gamer
- **Meta CAPI** — `productConfig.routes.programSlug` for `event_source_url`

**Two `product === "x"` references remain in the file, intentionally:**
1. **Line ~219** — `if (product === "camps")` inside the gamer pre-pass that computes `earliestWeek` / `earliestSlot` / `earliestWeekDates`. This is a camps-only derivation that feeds the `WebhookContext`. The other two products have nothing analogous (e100 = single cohort; teams = single semester), so promoting it to a registry strategy would be a `() => null` for e100/teams — fails the rule-of-three. Left inline per `01-teams-convergence-handoff.md` §3 ("If a seam turns out NOT to be cleanly shared by all three, stop and flag it rather than forcing the abstraction").
2. **Line ~863** — `if (product === "teams" && meta.payment_plan === "installment")` for the installment Subscription creation. Handoff §1.3 explicitly says preserve exactly. No parallel in camps/e100.

The pre-Phase-1 inline `MetadataGamer` type is removed from the webhook; imported from the registry instead.

---

## 3. Verify gate (per handoff §4 Phase 2)

**✅ `tsc --noEmit` clean.** Verified after the types extension and after each callsite migration step. Final pass: clean.

**✅ Code-level diff vs. `02-baseline.md` §2A–§2H for camps + e100:**

| Surface | Camps baseline reproduces? | E100 baseline reproduces? |
|---|---|---|
| §2A Beehiiv POST body | ✓ (program / referring_site / automation / tags identical; `custom_fields` shared base unchanged; per-product extras from `campsProduct.buildBeehiivCustomFields` = same 4 fields with same values) | n/a |
| §2B Beehiiv POST body | n/a | ✓ (per-product extras from `ekuzo100Product.buildBeehiivCustomFields` = `cohort_label`, `preferred_days`, `squad_link`, same values) |
| §2A/§2B Tag POST | ✓ same purchased tags array | ✓ same purchased tags array |
| §2C Klaviyo profile / list / event | ✓ shared base unchanged; per-product extras = same 5 properties + Placed Order spread; `registration_summary` reuses `gamerSummaries` which uses `buildGamerSummary` (same string format) | n/a |
| §2D Klaviyo profile / event | n/a | ✓ profile gets `cohort_label / cohort_start / cohort_end / preferred_days / squad_link`; Placed Order gets `cohort_label / squad_link` only (cohort_start/end intentionally omitted, matching the baseline note) |
| §2E Sheets `ekuzo-purchases` row | ✓ `week=weekLabel, slot=slot, week_dates=weekDates`; `squad_status / squad_token / joining_squad_token` populated; `preferred_days=""` (camps meta has none) | ✓ `week=cohort_label, slot="", week_dates="{cohort_start} – {cohort_end}"`; `squad_token / joining_squad_token` populated; `preferred_days` from meta |
| §2F Sheets `squads` row | ✓ owner = earliest-week gamer; week/slot/week_dates populated; cohort_* empty | ✓ owner = first gamer; week/slot/week_dates empty; cohort_* populated |
| §2G Sheets `squad_members` row | ✓ member_week / member_slot populated; member_cohort_* empty | ✓ member_week / member_slot empty; member_cohort_month / member_cohort_label populated |
| §2H Meta CAPI Purchase | ✓ `event_source_url` uses `routes.programSlug = "ekuzo-camps"` | ✓ `routes.programSlug = "ekuzo100"` |
| §2I Teams installment Subscription | n/a (teams only) | n/a (teams only) — **untouched** by this commit; same `trial_end` / `cancel_at` / `price` / `metadata` shape |

**Teams payload changes (the only product whose behavior changes — per handoff §1):**
- `squad_link` now appears in Beehiiv `custom_fields`, Klaviyo profile properties, Klaviyo Placed Order properties. Value is `""` pre-Phase-3 (no token to share) but the field is wired so Phase 3's token-minting lands without further webhook changes.
- `squads` / `squad_members` Sheets writes are now wired for teams (`squad.writesSquadRows = true`). The `meta.squad_token` / `meta.joining_squad_token` guards keep them inert until Phase 3 — no premature empty rows.
- `meta.squad_token` / `meta.joining_squad_token` now pass through to the `ekuzo-purchases` row (instead of being forced to `""`). Same Phase 3 dependency: pre-Phase-3 teams meta has no tokens, so the columns still resolve to `""` naturally.

**Live diff (baseline §3 step 2): NOT executed this phase.** Requires a real `payment_intent.succeeded` trigger across camps + e100 + teams upfront + teams installment. Out of scope for the strategy-extraction commit. Phase 3 (shared register API helper) starts minting teams squad tokens; once Phase 3 lands, a parallel live test of all three products is the natural moment to exercise the full webhook end-to-end. **Jamie's call:** if a live test on camps + e100 right now (before Phase 3) is preferred, it's a quick Stripe-CLI trigger per CLAUDE.md "Local Payment Testing" — the expected output is unchanged vs. pre-Phase-2.

---

## 4. What's intentionally NOT in the registry yet

Phase 2 stayed within the "webhook strategy map" scope. These remain for Phase 3+:

- **Shared register-API metadata builder (Seam 3 — Phase 3 deliverable).** The three `/api/{product}/register` routes share parent/gamer validation, PI metadata assembly, attribution/origin/fbc/fbp threading, and 500-char metadata chunking. Phase 3's job. The registry now exposes `routes.registerPath` (used by Phase 4 lead/abandoned wiring) and will gain `squadOwnerShape` (camps: week+slot, e100: cohort_month, teams: semester) when Seam 3 starts minting tokens for teams.
- **Pricing model on the registry.** Pricing is still hard-coded in the three register routes (camps $199, e100 $100, teams $640/$576/installment 4×$160). Promote when Seam 3 needs a shared pricing builder.
- **Squad pre-pin shape (`SquadOwner` type in `lib/squad.ts`).** Currently knows only `"camps" | "ekuzo100"`. Phase 4 deliverable per the handoff — extend to `"teams"` with semester pre-pin shape and add the matching squad lookup endpoint logic.
- **Teams Beehiiv squad-link Beehiiv custom field publication-side.** The webhook now sends `squad_link` to Beehiiv for teams, but the Beehiiv publication may not have a `squad_link` custom field defined under the teams program yet. Beehiiv silently drops unknown custom_fields per CLAUDE.md API quirks; flagged for Jamie to confirm in the Beehiiv dashboard when teams flow goes live.
- **Apps Script — `"teams"` as a valid `product` discriminator value in the squads/squad_members tables.** Handoff §6: "may need an Apps Script web-app redeploy". The webhook code now writes teams rows; whether Apps Script accepts them depends on Apps Script's discriminator handling. Coordinated with Jamie before Phase 3 starts producing real tokens.
- **`squadStatusLabel` derivation.** Still inline in the webhook (camps-only ternary on `meta.squad_status`). Could move to a `productConfig.buildSquadStatus(meta)` callback if e100/teams ever grow analogous status states, but today it's camps-only — premature.
- **`acquisitionSource` classification.** Still inline (camps/e100/teams all share the same derivation). Single caller; not a registry candidate until a second caller appears.

The handoff §3 rule "Don't add seams that aren't cleanly shared by all three" still binds. Phase 3 should flag any field that resists the shared shape rather than forcing an abstraction.

---

## 5. Phase 3 entry conditions

The next session can assume:
- `tsc --noEmit` clean at start of Phase 3.
- `lib/products/` registry exposes `ProductConfig` with `routes`, `squad`, and seven strategy callbacks. Public re-exports for `MetadataGamer`, `WebhookContext`, `SquadsRowFields`, `SquadMemberRowFields`, `PurchaseRowCohortFields`, `WebhookMetadata`, `BeehiivCustomField`.
- Webhook computes `productConfig` once near the top of `payment_intent.succeeded` and `ctx: WebhookContext` once after the gamer pre-pass; every per-surface enrollment reads from one of those two.
- Camps + e100 webhook payloads unchanged vs. `02-baseline.md` §2.
- Teams arm of the webhook now includes `squad_link` (empty pre-Phase-3) and writes to `squads` / `squad_members` tables when tokens are present (no-op pre-Phase-3).
- Teams installment Subscription block (`02-baseline.md` §2I) unchanged.
- Lead/abandoned routes for camps + e100 unchanged in behavior (Phase 1's migration still in place).
- `next.config.mjs` `outputFileTracingExcludes` still in place (Netlify deploy guard — do not remove).
- `MetadataGamer` type is now imported from `@/lib/products/types` (the webhook's local copy was removed).

**Phase 3 deliverable** (per handoff §4): extract `lib/registerIntent.ts` (or similar). Each of the three `/api/{product}/register` routes becomes a thin wrapper that supplies its product config + product-specific metadata (camps: week/slot; e100: cohort_*; teams: payment_plan + Customer + setup_future_usage). Mint `squad_token` for **all three** products via `lib/squad.ts`. Build PI metadata (attribution, origin, fbc/fbp, cta_source, per-gamer JSON blobs, 500-char chunking) once and share.

**Phase 3 verify gate**: `tsc --noEmit` clean; a camps + e100 + teams test PI each still produces correct metadata (inspect in Stripe dashboard / CLI); teams now carries a `squad_token` in PI metadata; downstream webhook (already Phase 2'd) exercises the teams squad-write path end-to-end on a live test.

**Recommended Phase 3 first move**: characterize the three current register routes' PI metadata shape and identify the shared base. The teams route has the most complexity (Customer creation, `setup_future_usage` for installments) so its shared parts will be the most surgical extraction. Camps + e100 are simpler PI flows.

---

## 6. Files changed this commit

| File | Change |
|---|---|
| `lib/products/types.ts` | Extended with `MetadataGamer`, `WebhookMetadata`, `WebhookContext`, `BeehiivCustomField`, `PurchaseRowCohortFields`, `SquadsRowFields`, `SquadMemberRowFields`; `ProductConfig` gained `routes`, `squad`, and 7 builder methods |
| `lib/products/camps.ts` | Added routes / squad / 7 builders. Behavior-identical for every surface — strategies were extracted from the existing webhook code |
| `lib/products/ekuzo100.ts` | Same shape; behavior-identical extraction |
| `lib/products/teams.ts` | Same shape; **adds** `squad_link` to Beehiiv + Klaviyo extras; `squad.writesSquadRows = true` |
| `lib/products/index.ts` | Public re-exports extended with the new types |
| `app/api/webhooks/stripe/route.ts` | Removed local `MetadataGamer` type (imports from registry); replaced 9 per-product ternaries with `productConfig.build*()` / `productConfig.routes.*` / `productConfig.squad.*` calls; consolidated `earliestWeek*` derivation into a single pre-pass that builds `ctx: WebhookContext` for the per-surface strategies; collapsed Klaviyo's separate `earliestWeekDates` re-derivation (it's now part of `ctx`) |
| `marketing/teams-redesign/04-phase2-strategies.md` | NEW (this doc) |
| `WORKLOG.md` | New entry at top |

The webhook line count drops modestly (mostly because the Klaviyo `registration_summary` per-gamer ternary collapsed into a `.join()` of the shared `gamerSummaries` array, and the `squads` / `squad_members` per-product branches collapsed into registry calls). The value of Phase 2 is the strategy map itself — every per-product webhook surface is now declared in one file per product instead of spread across the 1000-line webhook. Phase 3 (register API helper) is where the next big line-count win lands.
