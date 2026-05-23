# EKUZO Camps — Registration + Post-Purchase Pattern Reference

> **Purpose:** Reference doc for the EKUZO100 redesign session. Summarizes
> what camps does today (precedent to lift), what's already wired sitewide
> (don't rebuild), and the open product questions that need answers before
> implementation starts.
>
> **How to use it:** Paste into the spec-shaping conversation in Cowork as
> grounding context. Once the spec is settled, append it below the "Open
> product questions" section as `01-ekuzo100-spec.md` (or extend this doc)
> and bring the whole thing back to Claude Code for implementation.

---

## 1. Already global — DO NOT rebuild

These are in `app/layout.tsx` and `middleware.ts`. They fire on every route — landing pages, register, success, blog, everything. Nothing program-specific to wire.

| Surface | Where | What it does |
|---|---|---|
| GA4 (`G-8LM45PX53W`) | root layout | Auto `page_view` per page; custom helpers in `lib/analytics.ts`: `trackInitiateCheckout`, `trackPurchase`, `trackRegisterClick`, `trackViewContent`. |
| Meta Pixel | root layout | Browser-side PageView + custom events (InitiateCheckout / Purchase / ViewContent) via the same helpers. |
| Microsoft Clarity (`wml8wll5ua`) | root layout | Auto session recordings + heatmaps; no per-page wiring. |
| First-touch attribution | `components/analytics/CaptureAttribution.tsx` (root layout) + `lib/attribution.ts` | UTMs from `?utm_*=` captured once into `sessionStorage.ekuzo_attribution`; re-read at submit. First-touch wins across sessions. |
| First-touch acquisition origin | `middleware.ts` + `lib/originClassifier.ts` | Classifies referer + UTMs into the `ekuzo_origin` cookie (ai_chatgpt / organic_google / direct / etc.). Read server-side by register routes, threaded into Stripe metadata. |
| Stripe / Beehiiv / Klaviyo / Sheets / Meta CAPI keys | `.env.local` (prod has live values) | Already configured. |

EKUZO100 inherits all of this for free.

---

## 2. Camps register page anatomy — `app/programs/ekuzo-camps/register/page.tsx`

Source-of-truth for the "utility hero → form → payment" pattern. ~2050 lines, one React client component.

**Visible page order:**
1. Hero — utility-styled: eyebrow + tight H1, no marketing block. Past recordings showed 5/5 ad-driven prospects scrolling past a heavier hero without typing. Solo register hero stays under ~400px tall.
2. PARENT INFO — first name, last name, email, phone.
3. GAMER INFO — first name + birthday only (gamer tag retired in v2; we just collect the kid's first name).
4. CHOOSE YOUR CAMP WEEK — shared picker. Calendar treatment with month tabs (June/July/August); cards style was retired.
5. (Sticky desktop sidebar) — YOUR REGISTRATION summary card + WHAT YOU GET list.
6. "What happens after you click pay" — 3-step preview.
7. Continue to payment button — `disabled={isSubmitting || totalPrice <= 0}`.
8. Stripe Elements inline — Payment Element + Continue, revealed after the API returns `clientSecret`.

**Hard rules learned the hard way:**
- Continue is `type="button"`. `validate()` is the only gate — HTML5 `required` does nothing.
- `validate()` error order must mirror visible page order top-to-bottom so the scroll-to-first-error lands on the topmost empty field.
- Each input carries a `data-error-key` that matches the error key; `handleSubmit` scrolls + focuses by querySelector.
- Picker selection (week + slot) is the *button enabler*, not part of validation. The button stays disabled until `totalPrice > 0`.

**Email-on-blur lead capture:** `handleEmailBlur()` POSTs `{ email }` to `/api/camps/lead` once the email passes a regex AND hasn't already fired in this session (deduped by `leadFiredForEmailRef`).

**Squad-link join arrival:** if URL has `?squad=TOKEN`, on mount the page fetches the owner record via `/api/squad/[token]`, pre-pins the first gamer's week+slot, shows a banner, and warns on slot-change attempts.

---

## 3. Picker contract — what the picker writes, what flows where

The camps picker outputs two values per gamer into form state:

```ts
type GamerInfo = {
  ...
  selectedWeek: number | null;   // 3..10 (May weeks 1-2 retired)
  selectedSlot: "AM" | "PM" | null;  // PM only since AM dropped
};
```

`WEEKS[]` at the top of the file is the data source: each entry is `{ number, label, dates, price, originalPrice }`. The calendar picker shows the month grid; only weekday cells inside a camp week are selectable; clicking writes BOTH `selectedWeek` AND `selectedSlot: "PM"` to every gamer in the registration (shared picker).

**At submit, the picker selection flows through:**

| Layer | Field(s) |
|---|---|
| Form payload (POST to `/api/camps/register`) | per gamer: `weekLabel`, `weekDates`, `slot`, `slotHours`, `price` |
| Stripe PI metadata | `gamer_${i}` as JSON-stringified blob; `squad_token` (or `joining_squad_token`); attribution UTMs; `origin`; `fbc`/`fbp`; `cta_source`; `client_ip_address`/`client_user_agent` |
| Webhook reads | `MetadataGamer` shape (`weekLabel`, `weekDates`, `slot`, etc.) |
| Klaviyo `Placed Order` event | `camp_week`, `camp_slot`, `camp_week_dates` (earliest gamer's week for multi-gamer) |
| Beehiiv custom fields | `camp_week`, `camp_slot` |
| Google Sheets `ekuzo-purchases` tab | one row per gamer, individual week/slot per row |

**Generalization for EKUZO100:** whatever picker you build, the contract just needs to write into form state the cohort-identifying values. The names change (`cohort_month`, `pattern`, etc. instead of `camp_week`, `camp_slot`) but the SHAPE of the pipeline doesn't.

---

## 4. Partial-capture routes (mid-funnel)

| Route | Fires when | Captures | Writes to |
|---|---|---|---|
| `/api/camps/lead` | Email field blurs valid (once per email per session) | email | Beehiiv subscribe (tag `form_started_camps`, no welcome email); Klaviyo event `Started Registration` (`product: camps`) |
| `/api/camps/abandoned` | After PI created, before card entry | email, parent names, first gamer first name, week, slot | Beehiiv subscribe (tag `cart_abandoned_camps`); Klaviyo event `Started Checkout` (same fields) |

Both are best-effort fire-and-forget. Wrapped in try/catch end-to-end; callers don't await. The Klaviyo helper is `lib/klaviyo.ts::trackKlaviyoEvent`.

**EKUZO100 needs analogous routes** (`/api/ekuzo100/lead`, `/api/ekuzo100/abandoned`) with `product: ekuzo100` in the Klaviyo event properties. Beehiiv tags mirror: `form_started_ekuzo100`, `cart_abandoned_ekuzo100`.

---

## 5. Webhook fan-out — `app/api/webhooks/stripe/route.ts`

Single handler. Branches by `meta.product` ("camps" | "ekuzo100" | "teams"). The ekuzo100 branch already exists — the redesign mostly adjusts metadata field names, not new branches.

**Mode isolation:** event skipped if `paymentIntent.livemode` doesn't match `STRIPE_SECRET_KEY` prefix (live vs test). Prevents cross-env contamination.

**Acquisition source derivation** (one definition, all surfaces):
- `meta_paid` if `utm_source=meta && utm_medium=paid`
- `referral` if `meta.joining_squad_token` set
- `organic` otherwise

**Order ID:** Stripe `receipt_number` prefixed with `EKZ-` (e.g. `EKZ-1234-5678`); fallback to last-8 of PI ID for test mode.

**What writes happen per Placed Order:**

| Destination | What | Key IDs |
|---|---|---|
| Beehiiv subscriber + tag | Product purchased-tag + source-tag + custom fields (order_id, gamer_name, registration_summary, amount_paid, cta_source, acquisition_source, camps-only squad_status + squad_link); `automation_ids` triggers the welcome flow | Welcome automations: camps `aut_4db31c63-...`, ekuzo100 `aut_3dd66d4e-...`, teams `aut_fea2b01b-...` |
| Klaviyo profile + list + event | `profile-import` upsert with attribution properties; add to Purchasers list; track `Placed Order` event with monetary value + product-specific properties | Purchasers list `V4Uf7N`; metric `Placed Order` `TW2E7J`; current confirmation flow `TXmY9F` (camps only — filtered by product) |
| Google Sheets (Apps Script) | One row per gamer to `ekuzo-purchases` tab; plus camps `squads` row + `squad_members` rows | `GOOGLE_SHEETS_WEBHOOK_URL` |
| Meta Conversions API | Server-side Purchase event with hashed em/ph/fn/ln/zp + raw ip/ua/fbc/fbp; dedup by event_id=PI ID; auto test_event_code when not livemode | `graph.facebook.com/v19.0/{pixelId}/events` |
| Stripe Subscription | Teams installment plan only — creates a subscription with trial_end + cancel_at for 3 follow-on charges | n/a |

**Klaviyo flow strategy for ekuzo100:** the `Placed Order` metric is product-agnostic (single metric for all programs). Two ways to route:
- (a) Gate the existing camps flow with a `product == "camps"` filter, create a separate ekuzo100 flow on the same metric filtered to `product == "ekuzo100"`. Cleaner separation.
- (b) Use a single flow with a Conditional Split inside on `event.extra.product`. Fewer flows, more complex per-flow logic.

Recommend (a) for the same reason the email source files are kept per-product.

---

## 6. Squad concept (camps shape)

**Token:** `nanoid(10)` generated client-side at register submit; alphabet `[A-Za-z0-9_-]`. Validated server-side by `lib/squad.ts::isValidSquadToken` (4–32 chars, charset enforced) before reaching Stripe metadata.

**Universal rule (shipped 2026-05-22):** every camps purchase has a working share link.
- Solo buyer → mints their own `squad_token`.
- Joiner (arrived via `?squad=TOKEN`) → no new token; their confirmation email's share link reuses `joining_squad_token` (the one they joined with) so the squad stays one coherent group as it grows.
- Webhook: `squadLink = meta.squad_token || meta.joining_squad_token` builds the URL.

**Share surfaces:**
- Success page "Bring your friends" panel (copy-to-clipboard).
- Klaviyo confirmation email "BRING YOUR CREW" block: visible link + "Text a Friend" (`sms:`) + "Email a Friend" (`mailto:`) — link is `|urlencode`'d inside the body= params to avoid URI parsing collisions.

**What "same squad" means in camps:** the joiner lands on the register form with the owner's week + slot PRE-PINNED. They're booked into the same camp week.

**Apps Script squad tables (camps):**
- `squads` — one row per owner: squad_token, owner_parent_email, owner_gamer_name, week, slot, week_dates, created_at.
- `squad_members` — one row per joiner gamer: squad_token, member_parent_email, member_gamer_name, member_week, member_slot, joined_at.

**Explicitly deferred:** `squad_member_count` profile property (would power an Email 4 conditional "your squad is 3/5" CTA). Pre-optimization for an email that doesn't exist; don't build until Email 4 is on the docket.

---

## 7. Email program (current state)

Camps Email 1 (Purchase Confirmation) is the only email currently shipping. It's Klaviyo, triggered by `Placed Order` metric, lives in flow `TXmY9F`. Source lives in `marketing/email-flows/email-templates/`; built output in `klaviyo-ready/`. `build-klaviyo.py` rewrites bare tokens to Klaviyo's `{{ event.extra.* }}` / `{{ person.* }}` namespaces and strips preview-only blocks.

**Variables the email reads (verified against a real event):**
- `{{ event.extra.gamer_name }}` — comma-joined first names of all gamers (no last name, no gamer tag).
- `{{ event.extra.camp_week_dates }}` — earliest week's dates ("June 01 - 05").
- `{{ event.extra.order_id }}` — order ID.
- `{{ event.extra.value }}` — dollar amount (integer).
- `{{ event.extra.squad_link }}` — full register URL with `?squad=TOKEN`. `|urlencode` when nested inside sms/mailto body= params.
- `{{ person.first_name }}` — PARENT first name (not the kid).

Beehiiv welcome automations also exist (one per product) but they're scaffolded drafts — the polished email lives in Klaviyo.

**EKUZO100 will need its own Email 1 template** with parallel variable names (`event.extra.cohort_label`, `event.extra.cohort_start`, etc.). Those fields already exist in the webhook's ekuzo100 branch.

---

## 8. Open product questions for EKUZO100 — what Cowork needs to decide

These determine the spec. Implementation is largely pattern-lift once these are answered.

1. **Picker model.** Camps picks `(week, slot)`. EKUZO100 today picks `(cohort_month, schedulePreference)`. New direction: show a month, parent chooses M/W or T/Th pattern → that becomes the cohort. Open: visual style? (Whole month with M/W highlighted in one color and T/Th in another? Two "pick your pattern" cards above a month preview?) How many months ahead are visible? (Camps shows 3 — June/July/August.)
2. **One time slot — confirm.** Camps went PM-only (1:00–4:00). You want EKUZO100 to be 7:00–8:30 PM only. Confirm + decide how to display (baked into picker label? Separate "TIME" badge?).
3. **Cohort length.** EKUZO100 today is 4 weeks. M/W cohort = 8 sessions over 4 weeks. One fixed product, or do you offer alternate lengths? (Lower friction says one only.)
4. **Pricing.** Camps is flat $199. EKUZO100 today is $100 flat (`/api/ekuzo100/register` validates `totalPrice === 100 * gamers.length`). Stays?
5. **Squad semantics — biggest decision.** Camps' squad = "same week, same coach, hand-built team of 5." For EKUZO100 (smaller cohorts, individual program), what does the squad link mean?
   - Option A — "Join my cohort": joiner pre-pinned to same month + same M/W pattern.
   - Option B — "Same program, your choice": pure referral, no auto-pin (joiner picks any cohort).
   - Option C — "Same coach": pre-pin the cohort but not the pattern.
   - The squad infrastructure (token + share link + email block) is platform-agnostic — what changes is just what gets pre-pinned on the joining register page.
6. **Cohort capacity.** Camps has "filling fast" / "only a few left" badges (marketing-only, not real-capacity-driven). Does EKUZO100 want real capacity tracking + waitlists, or stay marketing-badged?
7. **Beehiiv vs Klaviyo for Email 1.** Build a Klaviyo Email 1 for ekuzo100 first (parallel to camps), or keep Beehiiv-only for ekuzo100 until the Klaviyo program is settled?
8. **Multi-gamer.** Camps supports `gamers[]` (one parent registering multiple kids). Does EKUZO100 want sibling sign-ups, or strictly one gamer per registration?
9. **Klaviyo metric naming.** New routes fire `Started Registration` / `Started Checkout` filtered by `product`? Or program-prefixed names (`Started EKUZO100 Registration`)? Shared-metric + flow-filter is more universal and scales to Teams later.
10. **Explicit deferrals.** No `squad_member_count` (pre-optimization, no Email 4 to use it). No Discord-jargon dejargon sweep on the FAQ entries (the explainer earns the word). No teams work in this session.

---

## 9. Files to lift / copy when implementation starts

For when the spec is back in Claude Code:

- **Register page pattern** → copy `app/programs/ekuzo-camps/register/page.tsx` structure to `app/programs/ekuzo100/register/page.tsx` (exists; rewrite using camps' hero / `validate` / `handleSubmit` / `handleEmailBlur` structure).
- **Layout shim** → `app/programs/ekuzo100/register/layout.tsx` exports canonical + noindex metadata (camps register/layout.tsx is the template).
- **Picker primitive** → camps' `getMonthCalendarGrid` helper is reusable; the M/W vs T/Th overlay is new code.
- **API route** → `app/api/ekuzo100/register/route.ts` exists; update metadata fields to match new picker shape.
- **Partial capture** → new `app/api/ekuzo100/lead/route.ts` + `app/api/ekuzo100/abandoned/route.ts` modeled on camps equivalents (use `lib/klaviyo.ts::trackKlaviyoEvent`).
- **Webhook** → ekuzo100 branch in `app/api/webhooks/stripe/route.ts` already wired; verify metadata field names align with picker output.
- **Klaviyo email** → parallel template in `marketing/email-flows/email-templates/02-ekuzo100-purchase-confirmation.html`; rebuild via `build-klaviyo.py`; create flow filtered on `event.extra.product == "ekuzo100"`.
