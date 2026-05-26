# Phase 7 — Verification + final deliverables (pre-merge gate)

> **Captured:** 2026-05-25, on `dev` @ `d0a95a6` (tip after Phase 6).
> **Tool versions:** Next.js 16.2.1 (Turbopack), Node v24.14.0, Python 3.x.
> **Purpose:** Phase 7 is the gate that confirms the eight Definition-of-Done
> criteria from [01-teams-convergence-handoff.md](01-teams-convergence-handoff.md) §8.
> §1 is the final code-level wire-payload diff; §2 lists what Claude verified
> in this session (with measurements); §3 lists what Jamie + Aaron still owe
> before the dev → main merge; §4 is the recommended merge sequence.
>
> **Discipline (per handoff §1.4 + Karpathy "surgical changes"):** Phase 7 is
> verification + scaffolding (Teams Email 1 template, KB outcome writeup).
> No refactors. Every changed line traces to either the payload diff in
> `02-baseline.md` §2, the Teams Email 1 scope from handoff §6, or the KB
> outcome doc.

---

## 1. Webhook payload diff — final code-level confirmation

The Phase 2 verify gate did a code-level diff once; Phases 3, 4, 5, 6 didn't
touch the webhook. This section closes the §8 #1 DoD criterion ("camps + e100
behavior proven unchanged against Phase 0 golden values") with a final read
of `app/api/webhooks/stripe/route.ts` against the golden payloads in
[02-baseline.md](02-baseline.md) §2A–§2H.

**Method:** code-level diff only. The Phase 2-5 verify gates added live
Stripe-CLI test payments on top of this. The final live test across all
four cases (camps $199 + e100 $100 + teams upfront $576 + teams installment
$160) is Jamie's lane (§3 #4 below) — that's the final parity gate before
the merge.

### 1A. Beehiiv camps — match
- Top-level Beehiiv POST shape: `email`, `reactivate_existing: true`,
  `send_welcome_email: true`, `utm_source`, `utm_medium`, `utm_campaign`,
  `utm_content`, `utm_term`, `referring_site`, `automation_ids` —
  **structurally identical** to baseline §2A.
- `referring_site = "ekuzo-camps-registration"` ← `campsProduct.beehiiv.referringSites.purchase` ✅
- `automation_ids = ["aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"]` ←
  `campsProduct.welcomeAutomationId` ✅
- Shared `custom_fields[]` base (14 entries) built inline in
  `route.ts` lines 278–304; **identical** to baseline §2A's listing.
- Per-product `custom_fields[]` extras (camp_week, camp_slot, squad_status,
  squad_link) ← `campsProduct.buildBeehiivCustomFields()` ✅
- Tags POST: `["camp-2026-purchased", "source-camp-registration"]` ←
  `campsProduct.beehiiv.tags.purchased` ✅
- **No delta. Camps Beehiiv wire payload is byte-identical to Phase 0.**

### 1B. Beehiiv e100 — match
- `referring_site = "ekuzo100-registration"` ←
  `ekuzo100Product.beehiiv.referringSites.purchase` ✅
- `automation_ids = ["aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556"]` ←
  `ekuzo100Product.welcomeAutomationId` ✅
- `program = "EKUZO100"` ← `ekuzo100Product.programName` ✅
- `registration_summary` uses cohort_label (via
  `ekuzo100Product.buildGamerSummary()`) ✅
- Per-product `custom_fields[]` extras: cohort_label, preferred_days,
  squad_link — `camp_week`, `camp_slot`, `squad_status` correctly absent ✅
- Tags POST: `["ekuzo100-purchased", "source-ekuzo100-registration"]` ✅
- **No delta. E100 Beehiiv wire payload is byte-identical to Phase 0.**

### 1C. Klaviyo camps — match
- Profile-import call: shared 16-entry base properties built inline
  (`route.ts` lines 429–447); per-product extras (camp_week, camp_slot,
  camp_week_dates, squad_status, squad_link) ←
  `campsProduct.buildKlaviyoProfileProperties()` ✅
- Add to Purchasers list (id `V4Uf7N`) — unchanged ✅
- `Placed Order` event: shared base (product, value, currency, order_id,
  gamer_name, gamer_count) + per-product extras ←
  `campsProduct.buildKlaviyoOrderProperties()` ✅
- `revision: 2025-07-15` header unchanged ✅
- **No delta. Camps Klaviyo wire payload is byte-identical to Phase 0.**

### 1D. Klaviyo e100 — match
- Profile properties: cohort_label, cohort_start, cohort_end,
  preferred_days, squad_link — camps fields correctly absent ✅
- `Placed Order` event properties: cohort_label, squad_link only —
  cohort_start/cohort_end intentionally omitted per
  `ekuzo100.ts buildKlaviyoOrderProperties()` jsdoc + baseline §2D
  "cohort_label is self-contained, start/end would be redundant noise" ✅
- **No delta. E100 Klaviyo wire payload is byte-identical to Phase 0.**

### 1E. Sheets `ekuzo-purchases` — match (camps + e100)
- One row per gamer via `gamers.map(...)` (route.ts line 553) — unchanged ✅
- Camps cohort fields (week, slot, week_dates) ←
  `campsProduct.buildPurchaseRowCohortFields()` returns
  `{ week: weekLabel, slot, week_dates }` ✅
- E100 cohort fields ← `ekuzo100Product.buildPurchaseRowCohortFields()`
  returns `{ week: cohort_label, slot: "", week_dates: "{start} – {end}" }`
  — the "known mapping quirk" from baseline §2E is preserved ✅
- Squad token columns gated by `productConfig.squad.writesSquadRows` — both
  camps and e100 flip true; rows written ✅
- Marketing attribution columns (acquisition_source, origin, utm_*) —
  written for every product, unchanged ✅
- **No delta. Camps + e100 `ekuzo-purchases` rows are byte-identical to Phase 0.**

### 1F. Sheets `squads` — match (camps + e100)
- Gated by `productConfig.squad.writesSquadRows && meta.squad_token` ✅
- Camps owner = earliest-week gamer (single-pass min walk in
  `campsProduct.buildSquadsRowFields()`) ✅
- E100 owner = `gamers[0]` (`ekuzo100Product.buildSquadsRowFields()`) ✅
- Cohort field population: camps populates `week`/`slot`/`week_dates`
  and zeroes `cohort_*`; e100 populates `cohort_*` and zeroes
  `week`/`slot`/`week_dates` ✅
- **No delta.**

### 1G. Sheets `squad_members` — match (camps + e100)
- Gated by `productConfig.squad.writesSquadRows && meta.joining_squad_token` ✅
- Camps populates `member_week`/`member_slot`; e100 populates
  `member_cohort_month`/`member_cohort_label` ✅
- **No delta.**

### 1H. Meta CAPI — match (camps + e100)
- `event_source_url = https://ekuzo.gg/programs/{programSlug}/success`
  where `programSlug` ← `productConfig.routes.programSlug` ("ekuzo-camps"
  for camps, "ekuzo100" for e100) ✅
- `user_data` hashing (sha256) for em/ph/fn/ln/zp; plaintext for
  client_ip/client_ua/fbc/fbp — unchanged ✅
- `test_event_code` set only when `!paymentIntent.livemode` — unchanged ✅
- `value` = paymentIntent.amount / 100 (199 for camps, 100 for e100) ✅
- **No delta.**

### 1I. Teams installment Subscription block — preserved exactly
- Gated by `product === "teams" && meta.payment_plan === "installment"`
  (route.ts line 863) ✅
- `paymentMethods.data[0].id` lookup → `default_payment_method` ✅
- `trial_end` = Oct 1 2026 unix; `cancel_at` = Jan 1 2027 unix ✅
- Subscription metadata shape: `{ product: "teams", initial_payment_intent,
  parent_email, gamer_count }` ✅
- **No delta. Block is preserved per baseline §2I.**

### 1J. Summary

**No deltas detected in the camps + e100 wire payloads vs. Phase 0
golden values.** The registry-driven webhook produces byte-identical
output for the two revenue-carrying products through every surface
(Beehiiv subscribe + tag, Klaviyo profile/list/event, Sheets
`ekuzo-purchases` + `squads` + `squad_members`, Meta CAPI Purchase). The
teams arm adds: squad_link in Beehiiv + Klaviyo payloads, squad row
writes in Sheets (product=teams), and the preserved installment
Subscription block. Definition-of-Done #1 is met at the code level. The
live final-test gate is Jamie's (see §3 #4).

---

## 2. What Claude verified in this Phase 7 session

| Check | Result | Source of truth |
|---|---|---|
| `tsc --noEmit` | **clean** (exit 0, no diagnostics) | Phase 7 verification run |
| `next build` | **clean** (53 routes, 1.76s compile, no warnings beyond pre-existing middleware→proxy notice) | Phase 7 verification run |
| `.next/server` size | **28 MB** (22 MB headroom under Netlify's 50 MB cap) | `du -sh .next/server` |
| `.next/static` size | **2.0 MB** | `du -sh .next/static` |
| MP4/MOV/WebM in `.next/` | **0** (`outputFileTracingExcludes` still holding the Phase 5 CLAUDE.md learning-log lesson) | `find .next -name "*.mp4" -o -name "*.mov" -o -name "*.webm"` |
| Camps + e100 webhook payload parity vs. Phase 0 | **byte-identical** across §1A–§1H | Code-level diff (this doc §1) |
| Teams Email 1 source template | **built** at `marketing/email-flows/email-templates/03-teams-purchase-confirmation.html` | New file, 916 lines |
| Teams Email 1 klaviyo-ready output | **generated** at `klaviyo-ready/03-teams-purchase-confirmation.klaviyo.html` | `python3 build-klaviyo.py` exit 0 |
| `build-klaviyo.py` TOKEN_MAP | **extended** with `{{ semester_label }}` → `{{ event.extra.team_semester }}` and `{{ team_payment_plan }}` → `{{ event.extra.team_payment_plan }}` | `marketing/email-flows/email-templates/build-klaviyo.py` |
| KB decision "Actual outcome" | **filled in** (~150 lines: what held, what varied honestly, what wasn't predicted, carryover to future products) | `knowledge-base/logs/decisions/2026-05-24-products-as-one-workflow-converge-contract-defer-codebase.md` |

**Note on the Teams Email 1 clone source:** the handoff §6 names
`01-purchase-confirmation.html` (the camps source) as the file to clone
from. That file is not present in
`marketing/email-flows/email-templates/` at Phase 7 (only the
`01-purchase-confirmation.v1-backup.html` and the built
`klaviyo-ready/01-purchase-confirmation.klaviyo.html` remain). Phase 7
cloned from `02-ekuzo100-purchase-confirmation.html` instead — it is the
closest living analogue for a cohort-anchored confirmation email and is
structurally the better fit for a single-cohort-unit product like teams.
A provenance comment at the top of
`03-teams-purchase-confirmation.html` documents the substitution and
flags the editorial-pass items (body copy still references 5-day cohort
structures that don't fit a fall-semester program). Editorial revision +
Klaviyo flow creation are Jamie's lane per handoff §6.

---

## 3. What Jamie + Aaron still owe before the dev → main merge

These four items cannot be done in code from this session. Each carries
the one-line context needed to act without re-reading the full handoff.

### 3.1 Aaron — visual QA on the 3 register pages + teams success page
**Lane:** Aaron (CLAUDE.md "Aaron's lane: components/, app/*/page.tsx").
**Where:** `dev--ekuzo.netlify.app/programs/{ekuzo-camps,ekuzo-teams,ekuzo100}/register`
plus `/programs/ekuzo-teams/success`.
**Why now:** Phase 5 extracted the shared register UI; camps + e100 should
look + behave identical to pre-merge, and teams should look like a peer of
the other two with the minimal form shape. The Phase 6 PNG → WebP swap
also touches `/programs/ekuzo-teams` + `/programs/ekuzo100` marketing
hero decorations. A visual diff pass against the live `ekuzo.gg` site for
camps + e100, and a structural pass for teams, is the right gate before
the merge.
**Memory tie-in:** `feedback_qa_batching` — hold tweaks and ship one
follow-up commit, not per-tweak commits.

### 3.2 Jamie — Klaviyo dashboard: create the Teams confirmation flow
**Lane:** Jamie (handoff §6 — the connected Klaviyo MCP tools create
templates and campaigns but not flows / flow-filters).
**What:** new flow in Klaviyo dashboard, triggered by the shared
`Placed Order` metric, filtered to `event.extra.product == "teams"` (same
pattern camps + e100 already use — **do not** create a program-prefixed
metric). Assign the `03-teams-purchase-confirmation.klaviyo.html`
template generated in Phase 7b. Once Aaron's body-copy editorial pass
lands (see provenance comment in
`marketing/email-flows/email-templates/03-teams-purchase-confirmation.html`)
re-run `python3 build-klaviyo.py 03-teams-purchase-confirmation.html` and
re-paste the output into the Klaviyo template before the flow is
published.
**Why it bites:** without this flow, teams buyers get the Beehiiv welcome
email (which fires from the webhook automation_ids), but NOT the
transactional confirmation. Klaviyo is where the order summary + squad
link land. Required before any real teams payment goes through.

### 3.3 Jamie — Apps Script "teams" squad discriminator verification
**Lane:** Jamie (handoff §6 + §4 Phase 4 verify note — Apps Script web app
owns the Sheets schema).
**What:** open the EKUZO purchases Google Sheet, check the `squads` tab.
Phase 5 ran two live teams payments on `dev--ekuzo.netlify.app` (upfront
$576 + installment $160). Each should have produced one row in `squads`
with `product: "teams"`. If those rows are present → no action.
**If those rows are missing** → Apps Script's `product` discriminator
allow-list needs `"teams"` added + a web-app redeploy. Spec is at
`docs/apps-script-squad-endpoints-spec.md`; coordinate the redeploy
before the merge.
**Why it bites:** when a teams buyer's friend clicks the share link on
the success page and lands on `/programs/ekuzo-teams/register?squad=TOKEN`,
the squad lookup endpoint queries the `squads` tab by token. If no row
exists, the lookup returns 404 and the join experience breaks silently.

### 3.4 Jamie — final live Stripe-CLI test across all four cases
**Lane:** Jamie (CLAUDE.md "Local Payment Testing" — `.env.local` carries
`sk_live_*` so the test card `4242 4242 4242 4242` only works through
Netlify's preview env, which has `sk_test_*`).
**What:** test payments on `dev--ekuzo.netlify.app` for:
  1. Camps $199 (single gamer)
  2. EKUZO100 $100 (single gamer)
  3. Teams upfront $576 (single gamer, `payment_plan: "upfront"`)
  4. Teams installment $160 (single gamer, `payment_plan: "installment"`)

For each: confirm the Stripe CLI shows `payment_intent.succeeded` → the
webhook logs `✅ Beehiiv enrollment successful` + `✅ Klaviyo profile
upserted` + `✅ Google Sheets: 1 row(s) written` + `✅ Sheets squads:
{product} row written` + `✅ Meta CAPI: Purchase event sent`. For the
teams installment case, also confirm `✅ Teams installment subscription
created`. Pull one row each from the Sheet + spot-check 2-3 fields
against `02-baseline.md` §2E (for camps + e100) and the Phase 2 teams
arm expected shape.
**Why now:** this is the **final parity gate** per handoff §5 "After"
requirements. The code-level diff in §1 of this doc is necessary but
not sufficient — only a live run catches environment-driven differences
(missing env vars, Stripe API responses, etc.).

---

## 4. Recommended merge sequence

Each step gates the next. Don't skip ahead.

1. **Aaron's visual QA pass** (§3.1) → batch any tweaks into one
   follow-up commit on `dev` per memory `feedback_qa_batching`.
2. **Jamie's Apps Script verification** (§3.3) → if the two Phase 5
   teams payments wrote `squads` rows, no action; if not, add "teams"
   to the discriminator and redeploy. Cheap to verify, expensive to
   discover later.
3. **Jamie's Klaviyo flow creation** (§3.2) → can run in parallel with
   §4.1 since it's dashboard work, not code; just must land before the
   final live test in §4.4 so the test confirms the email actually
   sends. (If body copy revision is still pending, Jamie can publish
   the flow with the as-cloned template and revise the copy in the
   Klaviyo template editor directly — the wire is already correct.)
4. **Jamie's final live Stripe-CLI test** (§3.4) — the parity gate. If
   any of the four cases fails, halt the merge and investigate.
5. **Jamie runs the dev → main merge** (per memory
   `feedback_dev_to_main_merges` Claude does NOT auto-promote):
   ```
   git checkout main
   git pull origin main
   git merge dev
   git push origin main
   git checkout dev
   ```
   Netlify auto-deploys `main` to `ekuzo.gg`. Spot-check the live site
   on the three program marketing pages + spot-test one camps register
   form interaction (without paying) to confirm the deploy landed clean.

---

## 5. Definition-of-Done cross-check (handoff §8)

| # | Criterion | Status |
|---|---|---|
| 1 | All 3 products run through extracted shared seams (registry + webhook strategy + register API helper + register UI); camps + e100 behavior proven unchanged against Phase 0 golden values | ✅ — Phases 1-5 + this doc §1 |
| 2 | Teams register: minimal form + semester picker + payment-plan + universal squad | ✅ — Phase 5 |
| 3 | `/api/teams/lead` + `/api/teams/abandoned` live | ✅ — Phase 4 |
| 4 | Teams webhook arm writes squad_link + squad rows; installment Subscription creates; Beehiiv welcome fires | ✅ — Phase 2 (code) + Phase 5 (live test) |
| 5 | Teams Email 1 source built (flow creation handed to Jamie/Aaron) | ✅ — Phase 7b (source) ; **pending §3.2** (flow creation) |
| 6 | Performance: measurable improvement vs. Phase 0; no bundle regressions; `.next/server` clean, no `.mp4` in trace | ✅ — Phase 6 (-214 KB / -50% smoke; chunks byte-identical; .next/server = 28 MB; 0 mp4) |
| 7 | `tsc` clean, `next build` clean; full live Stripe-CLI test across all 3 products incl. teams upfront AND installment | ✅ — `tsc` + `next build` (this doc §2); **pending §3.4** (live test) |
| 8 | WORKLOG updated; KB decision "Actual outcome" filled in | ✅ — Phase 7c + Phase 7d |

**Two DoD items carry a pending external-action note**: #5 (Klaviyo
flow creation, §3.2) and #7 (final live Stripe-CLI test, §3.4). Both
are Jamie's lane. Everything else is shipped on `dev` and ready for the
merge sequence in §4.
