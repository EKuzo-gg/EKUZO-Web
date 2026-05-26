# Phase 4 — Teams partial-capture routes (lead + abandoned)

> **Captured:** 2026-05-25, on `dev`. Phase 3 shipped @ `c879b61`.
> **System baseline at Phase 4 start:** `tsc --noEmit` clean, `next build` clean, `.next/server` = 28 MB, 0 mp4/mov/webm in `.next/`. Matches `02-baseline.md` §1 and `05-phase3-register-api.md` §1 — Phases 1–3 added zero bundle weight.
> **Purpose:** Phase 0-style characterization of the four existing partial-capture routes (`/api/{camps,ekuzo100}/{lead,abandoned}`), then a decision on whether to extract a `lib/leadCapture.ts` helper before writing the teams pair, or replicate-then-evaluate. Drives the Phase 4 commit's shape.

---

## 1. Pre-extraction inventory (per-route)

Read of all four existing routes end-to-end (each ~130–155 lines):

| Route | Lines | Required body fields | Optional body fields | Beehiiv extras | Klaviyo extras |
|---|---:|---|---|---|---|
| `app/api/camps/lead/route.ts` | 137 | `email` | — | — | — |
| `app/api/camps/abandoned/route.ts` | 153 | `email` | `parent_first_name`, `parent_last_name`, `gamer_first_name`, `week`, `slot` (AM/PM-validated) | `first_name`, `last_name`, `gamer_name`, `camp_week`, `camp_slot` | `gamer_name?`, `camp_week?`, `camp_slot?` |
| `app/api/ekuzo100/lead/route.ts` | 128 | `email` | — | — | — |
| `app/api/ekuzo100/abandoned/route.ts` | 152 | `email` | `parent_first_name`, `parent_last_name`, `gamer_first_name`, `cohort_label` | `first_name`, `last_name`, `gamer_name`, `cohort_label` | `gamer_name?`, `cohort_label?` |

All four share an identical scaffold:

1. Body parse with `.catch(() => ({}))` so a non-JSON body becomes `{}`.
2. Email lowercase + `EMAIL_RE` regex pre-flight (cheap pre-filter — Beehiiv re-validates).
3. **Klaviyo event first, then Beehiiv** — fired before the Beehiiv subscribe so a Beehiiv early-return from a 4xx/5xx doesn't skip the Klaviyo capture.
4. Beehiiv subscribe with `reactivate_existing: true`, `send_welcome_email: false`, no `automation_ids` (welcome belongs to PAID customers only — webhook adds `*-purchased` post-payment).
5. On subscribe success: separate `POST /tags` (Beehiiv silently ignores `tags` in subscribe body — CLAUDE.md API quirks).
6. Soft-fail end to end. `{ok: true}` (with a `warning` key on partial failure) — never returns 5xx so the form/payment flow never blocks.
7. The only hard 400 is on invalid email (no point calling Beehiiv with garbage).

---

## 2. Cross-route shape diff

### 2A. Lead routes — `camps` vs `ekuzo100`

| Concern | camps lead | ekuzo100 lead |
|---|---|---|
| Klaviyo metric | `"Started Registration"` | `"Started Registration"` (identical — shared metric, filtered by `product` per handoff §7) |
| Klaviyo properties | `{ product: "camps" }` | `{ product: "ekuzo100" }` |
| Beehiiv subscribe body | `{email, reactivate_existing, send_welcome_email: false, referring_site}` | same shape |
| `referring_site` | `PRODUCTS.camps.beehiiv.referringSites.formStarted` = `"ekuzo-camps-form-started"` | `PRODUCTS.ekuzo100.beehiiv.referringSites.formStarted` = `"ekuzo100-form-started"` |
| Tag POST | `[PRODUCTS.camps.beehiiv.tags.formStarted]` = `["form_started_camps"]` | `[PRODUCTS.ekuzo100.beehiiv.tags.formStarted]` = `["form_started_ekuzo100"]` |
| Log prefixes | `"Beehiiv lead …"` | `"Beehiiv ekuzo100 lead …"` |

**Field-level shape:** identical across both. The only differences are 3 string values (Klaviyo `product`, Beehiiv `referring_site`, Beehiiv tag), all sourced from `productConfig.*`.

### 2B. Abandoned routes — `camps` vs `ekuzo100`

| Concern | camps abandoned | ekuzo100 abandoned |
|---|---|---|
| Klaviyo metric | `"Started Checkout"` | `"Started Checkout"` (identical) |
| Klaviyo shared properties | `{product: "camps", ...gamer_name?}` | `{product: "ekuzo100", ...gamer_name?}` |
| **Klaviyo product-specific properties** | `...camp_week?, ...camp_slot?` (**2 keys, AM/PM-coerced**) | `...cohort_label?` (**1 key, free-string**) |
| Beehiiv shared `custom_fields` | `first_name?, last_name?, gamer_name?` | same |
| **Beehiiv product-specific `custom_fields`** | `camp_week?, camp_slot?` | `cohort_label?` |
| `referring_site` | `"ekuzo-camps-cart-abandoned"` | `"ekuzo100-cart-abandoned"` |
| Tag POST | `["cart_abandoned_camps"]` | `["cart_abandoned_ekuzo100"]` |

**Field-level shape:** structurally uniform (everything is "an optional `Record<string,string>` of capture extras spread into both Beehiiv `custom_fields` and Klaviyo `properties`") — but the **product-specific keys differ in both name and count** (camps: 2 ordinal keys; e100: 1 label key). This is the field-level divergence the architecture guard warns about.

---

## 3. Teams partial-capture — shape

The teams register page does NOT yet call these routes (Phase 5 wires them, alongside the page rebuild). What teams will plausibly send, derived from `app/api/teams/register/route.ts` (the only existing source of truth for what teams metadata looks like):

| Capture | Where it lives today | What the abandoned route should accept |
|---|---|---|
| `email` | parent.email | required, same as camps/e100 |
| `parent_first_name`, `parent_last_name`, `gamer_first_name` | parent + first gamer | optional, same as camps/e100 |
| `semester_label` | `"Fall 2026 — Week of Aug 31"` (PI metadata) | optional, slice(0, 200) — analog of e100's `cohort_label` |
| `payment_plan` | `"upfront"` / `"installment"` | optional, validated against the same allow-list as the register route — useful for recovery-email targeting ("you almost picked installments…") |

Beehiiv `custom_fields` for teams abandoned: shared (`first_name`, `last_name`, `gamer_name`) + teams-specific (`team_semester`, `team_payment_plan`) — names match what `lib/products/teams.ts buildBeehiivCustomFields` emits post-purchase, so Beehiiv stores one consistent field shape across the lifecycle.

Klaviyo `Started Checkout` properties for teams: `{product: "teams", gamer_name?, team_semester?, team_payment_plan?}` — same conditional-spread shape as camps/e100, with teams-specific keys.

---

## 4. Architecture decision — replicate, not extract (this commit)

**Decision: replicate.** Write the two teams routes as faithful copies of the camps pair, with reads off `PRODUCTS.teams.beehiiv.*` and `product: "teams"` in Klaviyo. **Do not extract** a `lib/leadCapture.ts` helper in this commit.

**Reasoning** (per prompt's architecture guard + the Karpathy rules in CLAUDE.md):

1. **The prompt is explicit.** Phase 4 is "replication, not abstraction. … If after wiring teams' two routes the duplication is obvious AND the shapes match exactly, you may extract … But only if the rule-of-three holds at the field level — if camps differs from e100 in how it builds the Klaviyo properties (it may), keep them separate and flag." Camps DOES differ from e100 in the Klaviyo property build (2 keys vs. 1 key, names diverge — see §2B). The architecture guard names that exact case.

2. **The shared base is small.** ~50–80 lines of soft-failing Beehiiv + Klaviyo plumbing. After deducting the per-product extras (different captures, different field names), the actual deduplication opportunity is maybe ~30–40 lines per route. Not nothing, but the helper would need to take a `productConfig` + an optional `captures: Record<string,string>` and a `metricName` — that's three knobs for a thin layer, the kind of abstraction CLAUDE.md → "Simplicity first" warns about ("No abstractions for single-use code. No 'flexibility' that wasn't requested.").

3. **Phase 3 set the precedent for what's worth extracting.** `lib/registerIntent.ts` deduplicates ~150 lines of shared validation + context derivation + metadata building + PI creation across three callers, all of which produced byte-identical PIs for the same input. The partial-capture routes share less and differ more. The rule-of-three has been satisfied numerically (3 lead routes after this commit, 3 abandoned routes after this commit), but the **shape-of-three** test from the prompt fails for the Klaviyo property build.

4. **Karpathy "demand elegance" rule applies to the extraction itself.** A clean extraction would require either (a) a captures-shape callback on `ProductConfig` (`buildPartialCaptureFields(body) → {beehiiv: [...], klaviyo: {...}}`) which would duplicate the registry's already-rich strategy surface, or (b) a permissive `Record<string,string>` pass-through that loses type safety. Neither is obviously better than three near-identical files.

5. **Future caller will tell us if we got it wrong.** If a fourth product, or a wholly different lead-capture surface (e.g. a school-inquiry route), arrives later, the duplication will be cheap to lift then — every route reads from `productConfig.beehiiv.*` already, so the migration is mechanical.

**What this commit does NOT do:**
- No `lib/leadCapture.ts`.
- No new methods on `ProductConfig`.
- No changes to the camps + e100 partial-capture routes (they are working in production and Phase 4 is a teams-only deliverable).

**Re-evaluate when:**
- A fourth lead/abandoned surface lands.
- Phase 5 or 6 reveals a structural change all three products need at once (e.g. switching the Klaviyo API revision, adding a fourth side-effect to lead capture).
- The captures-shape question recurs in a different layer.

---

## 5. Teams routes — exact shape (what gets shipped)

### 5A. `POST /api/teams/lead`
Mirror of `/api/camps/lead`:
- Required: `email` (regex pre-flight, 400 on invalid).
- Klaviyo `"Started Registration"` event with `properties: { product: "teams" }`.
- Beehiiv subscribe with `referring_site = PRODUCTS.teams.beehiiv.referringSites.formStarted` (= `"ekuzo-teams-form-started"`).
- Beehiiv tag POST with `[PRODUCTS.teams.beehiiv.tags.formStarted]` (= `["form_started_teams"]`).
- Soft-fail end to end; `{ok: true}` with `warning` on partial failures.

### 5B. `POST /api/teams/abandoned`
Mirror of `/api/camps/abandoned` with the e100-shaped single-label cohort field plus the teams-only `payment_plan`:
- Required: `email` (regex pre-flight, 400 on invalid).
- Optional captures (each `slice(0, 200)`): `parent_first_name`, `parent_last_name`, `gamer_first_name`, `semester_label`, `payment_plan` (validated against `["upfront", "installment"]`, anything else dropped).
- Klaviyo `"Started Checkout"` properties: `{ product: "teams", ...gamer_name?, ...team_semester?, ...team_payment_plan? }`.
- Beehiiv `custom_fields` (conditional pushes): `first_name?`, `last_name?`, `gamer_name?`, `team_semester?`, `team_payment_plan?` — same field names `lib/products/teams.ts` uses post-purchase, so the abandonment profile and the purchased profile share one Beehiiv schema.
- Beehiiv `referring_site = "ekuzo-teams-cart-abandoned"`, tag `["cart_abandoned_teams"]`.
- Soft-fail end to end.

---

## 6. What's deferred (NOT in this commit)

Per memory `feedback_flag_blockers_not_before` — flag at the seam where it bites, not preemptively. These are deferred because they don't block the Phase 4 deliverable; they bite in Phase 5 (page rebuild) or later:

- **Teams register page wiring.** Phase 5. Today's 1298-line `"use client"` page does not call `/api/teams/lead` on email blur and does not call `/api/teams/abandoned` pre-PI. The endpoints are ready; the page rebuild is where they get fired.
- **Beehiiv custom-field publication** (`team_semester`, `team_payment_plan`). Beehiiv silently drops unknown custom_fields per CLAUDE.md API quirks, so sending them is safe before Beehiiv has them set up; they just don't surface in nurture until published. **Does not block route shipment.** Will bite when a recovery email template needs `{{team_semester}}` as a personalization token.
- **Klaviyo "Teams Started Registration" / "Teams Started Checkout" flows.** Same shared `"Started Registration"` / `"Started Checkout"` metrics as camps + e100, filtered by `event.extra.product == "teams"` per handoff §7. Flow creation is Jamie/Aaron's lane in the Klaviyo dashboard (handoff §6 "human handoffs"); cannot be automated through the connected Klaviyo tools.
- **Beehiiv cart-abandonment automation segmentation.** Per memory `project_beehiiv_automation_rules`, the recovery automations must exclude `teams-purchased` once they exist (Beehiiv API has no tag-removal — verified 2026-05-05). Beehiiv-side audience config; not a code task.
- **Apps Script squad-table discriminator.** Phase 3 noted this; still pending. Bites if a teams squad row needs to land in Sheets. Phase 4 doesn't touch Sheets, so no new pressure.
- **`lib/squad.ts` semester field on `SquadOwner`.** Phase 3 extended `SquadOwner.product` to `"teams"` but added no new fields. Phase 4 doesn't need to add a `semester_label` field — the banner-only join UX (handoff §1.2) is the entire pre-pin experience. If Phase 5's "you're joining [name]'s team" banner needs the semester label from the owner's squad row, add it then.

---

## 7. Verify gate (per handoff §4 Phase 4)

Target status at end of this commit:

- `tsc --noEmit` clean
- `next build` clean
- `.next/server` ≤ 28 MB (Phase 3 baseline) + small margin
- 0 mp4/mov/webm in `.next/`
- Both new endpoints reachable + accept POST + reject invalid email with 400
- Both new endpoints exercise the Beehiiv + Klaviyo paths with realistic payloads (curl-driven, since no register-page wiring yet)
- Camps + e100 partial-capture routes unchanged at the source level (zero diff against pre-Phase-4)

**Phase 3 live test (camps + e100 + teams register-route parity) status:** deferred per Jamie at Phase 4 start (`.env.local` carries `sk_live_*` not `sk_test_*`; dev preview at `dev--ekuzo.netlify.app` has the test key and can host the test). The live test is the verify gate for Phase 2's webhook strategy map and Phase 3's helper extraction — Phase 4 code does not depend on it (lead + abandoned do not touch the webhook). Re-raise if Phase 5 or 6 needs the live test before proceeding.

---

## 8. Phase 5 entry conditions

The next session can assume:
- `/api/teams/lead` returns `{ok: true}` on a valid email POST; logs `Klaviyo event tracked: "Started Registration"` + `Beehiiv … subscribe` + `tag` success lines.
- `/api/teams/abandoned` returns `{ok: true}` on a valid email POST; same logs with `"Started Checkout"` and the captured fields landing in Beehiiv `custom_fields` + Klaviyo `properties`.
- Both routes are fire-and-forget callable from the teams register page (the page must `.catch(() => {})` and not `await` on the user-facing flow — same pattern as camps + e100).
- The four existing routes (`/api/{camps,ekuzo100}/{lead,abandoned}`) are unchanged.
- `.env.local` still needs `sk_test_*` for any live four-product Stripe-CLI parity test.

**Phase 5 deliverable** (per handoff §4): teams register page rebuild on the shared register UI (Seam 4), email-on-blur → `/api/teams/lead`, pre-PI → `/api/teams/abandoned`, mint `squad_token` (page-side; helper's server-side fallback still active as belt-and-suspenders), `?squad=TOKEN` join → semester pre-pin + banner, success-page squad panel. Plus camps + e100 register-page migrations onto the shared UI to the extent it doesn't change their shipped behavior.
