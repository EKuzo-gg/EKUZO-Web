# Phase 0 — Baseline & characterization

> **Captured:** 2026-05-25, on `dev` @ `0478038` (clean, no uncommitted changes to the convergence-relevant files).
> **Tool versions:** Next.js 16.2.1 (Turbopack), Node v24.14.0, TypeScript via `tsc --noEmit`.
> **Purpose:** Phase 1–6 must not regress against these numbers, and the webhook golden payloads here must reproduce byte-for-byte for **camps** and **e100** after every refactor phase that touches `app/api/webhooks/stripe/route.ts`. Teams is the only product whose payload is allowed to change (and even then, only in the ways enumerated in [01-teams-convergence-handoff.md](01-teams-convergence-handoff.md) §1).

---

## 1. System baseline

### TypeScript
- `tsc --noEmit`: **clean** (exit 0, no diagnostics).

### Build (`next build`, Turbopack)
- Compile: **1.76s**, TypeScript: **3.2s**, static page generation: **336ms** for 50 pages.
- All 50 routes built without warnings other than the deprecated `middleware`→`proxy` notice (pre-existing, not in scope).

### Bundle / function-bundle size
| Bucket | Size | Notes |
|---|---|---|
| `.next/server` | **28 MB** | Netlify serverless-function bundle proxy. Hard cap is 50 MB. **22 MB of headroom** today. |
| `.next/static` | 2.0 MB | CDN-served chunks. |
| `.next/` total | 522 MB | Includes Turbopack cache; not deployed. |
| MP4/MOV/WebM in `.next/` | **0** | The CLAUDE.md Learning Log lesson (`fs.readFileSync` from `public/` → 420 MB of test videos swept into the function bundle) is holding. `next.config.mjs`'s `outputFileTracingExcludes` for `public/testimonial-videos/**` is doing its job. **Do not remove it.** |

### Per-route prerendered payloads (`.next/server/app/programs/**`)
Static HTML + RSC weights for the three register pages (the perf targets named in handoff §1.4):

| Route | HTML | RSC | Server `page.js` |
|---|---:|---:|---:|
| `/programs/ekuzo-camps/register` | 67,359 B (66 KB) | 15,779 B | 1,107 B |
| `/programs/ekuzo-teams/register` | 58,694 B (57 KB) | 15,645 B | 1,107 B |
| `/programs/ekuzo100/register`    | 54,620 B (53 KB) | 15,620 B | 1,098 B |
| All three `/success` pages       | ~27,200 B each | ~15,630 B each | ~1,100 B each |

Camps register is the heaviest (the picker grid is larger). E100 is the lightest (post-cohort-redesign trim). Teams sits in the middle.

### Marketing pages
| Route | Server `page.js` | `page_client-reference-manifest.js` |
|---|---:|---:|
| `/programs/ekuzo-camps` | 1,154 B | 22,018 B |
| `/programs/ekuzo100`    | 1,109 B | 22,354 B |
| `/programs/ekuzo-teams` | 1,187 B | 23,918 B |

The client-reference-manifest sizes are a rough proxy for "how many client components does this page pull in" — Teams marketing is the chunkiest of the three. All three marketing pages are server components with a small number of client islands (`TestimonialsCarousel`, `EcosystemAnimation`, `OurApproachSection`, etc.) so the load story is governed by those islands' chunks, not the page itself.

### Top 10 client chunks (`.next/static/chunks/*.js`)
| Size | Likely owner (inferred — verify in Phase 6 with bundle-analyzer if it matters) |
|---:|---|
| 226,355 B | Vendor (Stripe / React / Rive — biggest single chunk) |
| 193,833 B | Framework |
| 158,617 B | Vendor split |
| 137,521 B | Vendor split |
| 112,594 B | Vendor split |
| 62,211 B | App code |
| 56,528 B | App code |
| 54,646 B | App code |
| 53,677 B | App code |
| 32,338 B | App code |

Five chunks > 100 KB, max 226 KB. Phase 6 should at minimum confirm Stripe / Rive aren't being pulled into a chunk that runs on routes that don't need them.

### Asset audit — Teams marketing page (`app/programs/ekuzo-teams/page.tsx`)
- **Server component** (no `"use client"`), 558 lines. Minimal client JS by construction.
- Hero video: `/videos/ekuzo-teams-hero.mp4` rendered as raw HTML `<video controls playsInline preload="metadata">`. **Preload=metadata** means the browser only fetches container + dimensions, not the full file, until play — correct setup.
- Decorative PNGs via `next/image`: `/images/smoke-1@2x.png` and `/images/smoke-2@2x.png` (both 900×900). Worth checking file size + whether they should be WebP/AVIF; flagged for Phase 6.
- Client islands: `TestimonialsCarousel` (9 videos lazy-loaded), `EcosystemAnimation` (Rive scroll animation — heavy), `OurApproachSection`, `TwoWaysSection`, `ModalButton`. None of these are net-new for Teams; same surface area as camps and e100.

### Asset audit — Teams register page (`app/programs/ekuzo-teams/register/page.tsx`)
- **`"use client"`**, 1298 lines.
- Top-level imports: `loadStripe` from `@stripe/stripe-js`, `Elements / PaymentElement / useStripe / useElements` from `@stripe/react-stripe-js`. Both pulled at module scope, so they ship with the page bundle whether or not the user reaches the payment step.
- State shape: `parent` (4 fields) + `gamers[]` (10 fields per gamer, max 5 gamers) + `paymentPlan` + `additionalInfo` + `errors[]` + `isSubmitting` + payment state (`clientSecret`, `paymentIntentId`, `chargeNow`, `showPayment`). All rich fields (`gamerTag`, `gender`, `skillLevel`, `tshirtSize`, `timePreference`, `firstSemester`, `preferredGames[]`) are currently populated by the form — these are the fields the handoff §1.3 retires in Phase 5.
- Validation: top-to-bottom error list, scroll-to-top on submit failure. No `data-error-key` / scroll-to-first-error pattern yet (handoff §3 Seam 4 calls for that to be unified with camps/e100).
- No `handleEmailBlur` / partial-capture wiring. No squad-token minting. No `?squad=TOKEN` join handling.

---

## 2. Webhook golden payloads (camps + e100)

These are characterized **from `app/api/webhooks/stripe/route.ts` (1037 lines, current as of `0478038`)** for a hypothetical successful `payment_intent.succeeded` event. Every phase that touches the webhook must reproduce these payloads byte-for-byte for camps + e100 (handoff §2 Phase 2 verify gate).

> **Characterization method note:** these are derived from reading the code paths the webhook takes for each `product` value, not captured from a live PI. That's intentional and sufficient for the **diff** purpose (Phase 1's registry extraction reads from the same `meta.*` values; if the payloads differ post-refactor, the refactor introduced the difference). Each phase's verify step adds **live** Stripe-CLI test payments on top of this code-level diff, which catches environment-driven differences (env vars unset, Stripe API responses, etc.) that pure code reading misses.

### Test PI fixture (assumed inputs)
A canonical fixture you can mentally evaluate the payloads against:

| Field | Camps fixture | E100 fixture |
|---|---|---|
| `paymentIntent.id` | `pi_TEST_camps_001` | `pi_TEST_e100_001` |
| `paymentIntent.amount` | `19900` ($199.00) | `10000` ($100.00) |
| `paymentIntent.livemode` | `false` | `false` |
| `meta.product` | `"camps"` | `"ekuzo100"` |
| `meta.parent_first_name` | `"Jamie"` | `"Jamie"` |
| `meta.parent_last_name` | `"Fitch"` | `"Fitch"` |
| `meta.parent_email` | `"test@example.com"` | `"test@example.com"` |
| `meta.parent_phone` | `"(555) 123-4567"` | `"(555) 123-4567"` |
| `meta.gamer_count` | `"1"` | `"1"` |
| `meta.gamer_0` | `{"firstName":"Alex","lastName":"F","weekLabel":"Week 01","weekDates":"Jun 15-19","slot":"AM"}` | `{"firstName":"Alex","lastName":"F","birthday":"2014-03-10"}` |
| `meta.timezone` | `"America/Chicago"` | `"America/Chicago"` |
| `meta.squad_token` | `"abc12345"` | `"def67890"` |
| `meta.joining_squad_token` | `""` | `""` |
| `meta.squad_status` (camps only) | `"building"` | n/a |
| `meta.cohort_month` (e100 only) | n/a | `"2026-06"` |
| `meta.cohort_label` (e100 only) | n/a | `"Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` |
| `meta.cohort_start` (e100 only) | n/a | `"Jun 2, 2026"` |
| `meta.cohort_end` (e100 only) | n/a | `"Jun 25, 2026"` |
| `meta.preferred_days` (e100 only) | n/a | `"Mon,Tue,Wed,Thu,Fri"` |
| `meta.utm_source` | `"meta"` | `"meta"` |
| `meta.utm_medium` | `"paid"` | `"paid"` |
| `meta.utm_campaign` | `"summer-prospect"` | `"e100-launch"` |
| `meta.cta_source` | `"hero"` | `"hero"` |
| `meta.origin` | `"social_meta_paid"` | `"social_meta_paid"` |

### Derived values (computed at the top of the handler — apply to all surfaces)
- `acquisitionSource = "meta_paid"` (utm_source=meta + utm_medium=paid path; line ~152).
- `orderId = "EKZ-{receipt_number}"` if Stripe returned one, else `"EKZ-{last 8 of pi.id uppercased}"` (line ~166).
- `siteUrl = (NEXT_PUBLIC_SITE_URL || "https://ekuzo.gg").replace(/\/$/, "")`.
- `squadProgramPath = "/programs/ekuzo-camps/register"` (camps) or `"/programs/ekuzo100/register"` (e100) (line ~217).
- `squadLink = "{siteUrl}{squadProgramPath}?squad={squad_token || joining_squad_token}"` if either token present, else `""`.
- For camps: `squadStatusLabel = "Building a squad" | "Looking for a squad" | ""`.
- For camps: `earliestWeek` / `earliestSlot` = numeric min over gamers' `weekLabel`. (fixture: `1` / `"AM"`.)
- `location = "{billing.city}, {billing.state}, {billing.country}"` (joined with comma) when the Stripe charge resolved a billing address; else `""`.
- `postalCode = billing.postal_code` (else `""`).

---

### 2A. Beehiiv — camps golden payload

**POST** `https://api.beehiiv.com/v2/publications/{BEEHIIV_PUBLICATION_ID}/subscriptions`

```json
{
  "email": "test@example.com",
  "reactivate_existing": true,
  "send_welcome_email": true,
  "utm_source": "meta",
  "utm_medium": "paid",
  "utm_campaign": "summer-prospect",
  "utm_content": "",
  "utm_term": "",
  "referring_site": "ekuzo-camps-registration",
  "automation_ids": ["aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"],
  "custom_fields": [
    { "name": "first_name",            "value": "Jamie" },
    { "name": "last_name",             "value": "Fitch" },
    { "name": "phone",                 "value": "(555) 123-4567" },
    { "name": "program",               "value": "EKUZO Camps" },
    { "name": "gamer_name",            "value": "Alex" },
    { "name": "gamer_count",           "value": "1" },
    { "name": "registration_summary",  "value": "Alex F — Week 01 AM (Jun 15-19)" },
    { "name": "payment_intent_id",     "value": "pi_TEST_camps_001" },
    { "name": "order_id",              "value": "EKZ-{receipt or last8}" },
    { "name": "amount_paid",           "value": "$199.00" },
    { "name": "timezone",              "value": "America/Chicago" },
    { "name": "location",              "value": "{billing.city}, {billing.state}, {billing.country}" },
    { "name": "acquisition_source",    "value": "meta_paid" },
    { "name": "cta_source",            "value": "hero" },
    { "name": "camp_week",             "value": "1" },
    { "name": "camp_slot",             "value": "AM" },
    { "name": "squad_status",          "value": "Building a squad" },
    { "name": "squad_link",            "value": "{siteUrl}/programs/ekuzo-camps/register?squad=abc12345" }
  ]
}
```

Then immediately, on the returned `subscriberId`:

**POST** `.../subscriptions/{subscriberId}/tags`
```json
{ "tags": ["camp-2026-purchased", "source-camp-registration"] }
```

### 2B. Beehiiv — e100 golden payload

**Same POST shape**, with these differences (only):

| Field | E100 value |
|---|---|
| `referring_site` | `"ekuzo100-registration"` |
| `automation_ids` | `["aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556"]` |
| `custom_fields[program]` | `"EKUZO100"` |
| `custom_fields[registration_summary]` | `"Alex F — Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` |
| `custom_fields[*]` — **removed** | `camp_week`, `camp_slot`, `squad_status` |
| `custom_fields[*]` — **added** | `cohort_label` (= meta.cohort_label), `preferred_days` (= meta.preferred_days), `squad_link` |
| `squad_link` value | `{siteUrl}/programs/ekuzo100/register?squad=def67890` |

Tag POST:
```json
{ "tags": ["ekuzo100-purchased", "source-ekuzo100-registration"] }
```

---

### 2C. Klaviyo — camps golden payload

Three sequential calls (lines ~454–636):

**1. Profile upsert** — `POST https://a.klaviyo.com/api/profile-import`
```json
{
  "data": {
    "type": "profile",
    "attributes": {
      "email": "test@example.com",
      "first_name": "Jamie",
      "last_name": "Fitch",
      "phone_number": "(555) 123-4567",
      "properties": {
        "program": "EKUZO Camps",
        "gamer_name": "Alex",
        "gamer_count": "1",
        "registration_summary": "Alex F — Week 01 AM (Jun 15-19)",
        "amount_paid": "$199.00",
        "payment_intent_id": "pi_TEST_camps_001",
        "order_id": "EKZ-{receipt or last8}",
        "timezone": "America/Chicago",
        "location": "{billing.city}, {billing.state}, {billing.country}",
        "acquisition_source": "meta_paid",
        "acquisition_origin": "social_meta_paid",
        "utm_source": "meta",
        "utm_medium": "paid",
        "utm_campaign": "summer-prospect",
        "utm_content": "",
        "utm_term": "",
        "camp_week": "1",
        "camp_slot": "AM",
        "camp_week_dates": "Jun 15-19",
        "squad_status": "Building a squad",
        "squad_link": "{siteUrl}/programs/ekuzo-camps/register?squad=abc12345"
      }
    }
  }
}
```

**2. Add to Purchasers list** — `POST https://a.klaviyo.com/api/lists/V4Uf7N/relationships/profiles`
```json
{ "data": [{ "type": "profile", "id": "{profileId from step 1}" }] }
```

**3. Placed Order event** — `POST https://a.klaviyo.com/api/events`
```json
{
  "data": {
    "type": "event",
    "attributes": {
      "metric": { "data": { "type": "metric", "attributes": { "name": "Placed Order" } } },
      "profile": { "data": { "type": "profile", "attributes": { "email": "test@example.com" } } },
      "properties": {
        "product": "EKUZO Camps",
        "value": 199,
        "currency": "USD",
        "order_id": "EKZ-{receipt or last8}",
        "gamer_name": "Alex",
        "gamer_count": 1,
        "camp_week": "1",
        "camp_slot": "AM",
        "camp_week_dates": "Jun 15-19",
        "squad_status": "Building a squad",
        "squad_link": "{siteUrl}/programs/ekuzo-camps/register?squad=abc12345"
      },
      "value": 199,
      "unique_id": "pi_TEST_camps_001",
      "time": "{ISO-8601 now}"
    }
  }
}
```

Headers (all three calls): `Authorization: Klaviyo-API-Key {KLAVIYO_API_KEY}`, `Content-Type: application/json`, `revision: 2025-07-15`.

### 2D. Klaviyo — e100 golden payload

**Same three-call shape**, with these differences (only):

| Field | E100 value |
|---|---|
| `attributes.properties.program` | `"EKUZO100"` |
| `attributes.properties.registration_summary` | `"Alex F — Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` |
| Profile `properties[*]` — **removed** | `camp_week`, `camp_slot`, `camp_week_dates`, `squad_status` |
| Profile `properties[*]` — **added** | `cohort_label`, `cohort_start`, `cohort_end`, `preferred_days`, `squad_link` (e100 path) |
| Placed Order `properties[*]` — **removed** | `camp_week`, `camp_slot`, `camp_week_dates`, `squad_status` |
| Placed Order `properties[*]` — **added** | `cohort_label`, `squad_link` (e100 path) — **NOT** `cohort_start`/`cohort_end` (intentionally omitted per webhook comment lines ~607-610: cohort_label is self-contained, start/end would be redundant noise in the email layer) |
| Placed Order `attributes.value` | `100` |
| Placed Order `unique_id` | `pi_TEST_e100_001` |

---

### 2E. Google Sheets — `ekuzo-purchases` row (one per gamer)

Built as a JS object then POSTed as `{ rows: [...] }` to `GOOGLE_SHEETS_WEBHOOK_URL`. Apps Script writes by **header name match** (so column order in the sheet doesn't have to match key order here).

**Camps row (fixture):**
```json
{
  "registration_id": "REG-{unix-ts}-0",
  "family_id": "FAM-pi_TEST_camps_001",
  "product": "camps",
  "parent_first_name": "Jamie",
  "parent_last_name": "Fitch",
  "parent_email": "test@example.com",
  "parent_phone": "(555) 123-4567",
  "gamer_name": "Alex F",
  "gamer_tag": "",
  "week": "Week 01",
  "slot": "AM",
  "week_dates": "Jun 15-19",
  "birthday": "",
  "gender": "",
  "gaming_experience": "",
  "tshirt_size": "",
  "time_preference": "",
  "first_semester": "",
  "preferred_games": "",
  "timezone": "America/Chicago",
  "location": "{billing.city}, {billing.state}, {billing.country}",
  "amount_paid": "$199.00",
  "stripe_pi_id": "pi_TEST_camps_001",
  "registration_date": "{ISO-8601 now}",
  "additional_info": "",
  "squad_status": "Building a squad",
  "squad_token": "abc12345",
  "joining_squad_token": "",
  "preferred_days": "",
  "acquisition_source": "meta_paid",
  "origin": "social_meta_paid",
  "utm_source": "meta",
  "utm_medium": "paid",
  "utm_campaign": "summer-prospect",
  "utm_content": "",
  "utm_term": ""
}
```

**E100 row** — same shape with these differences:
| Key | E100 value | Reason |
|---|---|---|
| `product` | `"ekuzo100"` | |
| `week` | `"Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` (= `meta.cohort_label`) | The `week` column is overloaded — for e100 it carries the cohort_label string. **Known mapping quirk.** A future refactor could rename this column, but that's a Sheets-side change that requires Apps Script coordination — flagged, not in scope. |
| `slot` | `""` | E100 has a single session time (7-8:30 PM) — no slot concept. |
| `week_dates` | `"Jun 2, 2026 – Jun 25, 2026"` (= `cohort_start + " – " + cohort_end`) | |
| `squad_status` | `""` | Camps-only field. |
| `squad_token` | `"def67890"` | Populated (universal squad-link rule extended to e100, 2026-05-22). |
| `joining_squad_token` | `""` | (Empty in this fixture; would populate for a joiner.) |
| `preferred_days` | `"Mon,Tue,Wed,Thu,Fri"` | E100-only field. |

### 2F. Google Sheets — `squads` row (one per registration when `meta.squad_token` is present)

**Camps `squads` row (fixture):**
```json
{
  "squad_token": "abc12345",
  "product": "camps",
  "owner_parent_email": "test@example.com",
  "owner_gamer_name": "Alex",
  "week": "Week 01",
  "slot": "AM",
  "week_dates": "Jun 15-19",
  "cohort_month": "",
  "cohort_label": "",
  "cohort_start": "",
  "cohort_end": "",
  "created_at": "{ISO-8601 now}"
}
```

POSTed as `{ tab: "squads", rows: [...] }`. Owner = earliest-week gamer (matches Beehiiv/Klaviyo `earliestWeek` logic, line ~775).

**E100 `squads` row** — differences:
| Key | E100 value | Reason |
|---|---|---|
| `product` | `"ekuzo100"` | |
| `owner_gamer_name` | `"Alex"` (= `gamers[0].firstName`) | All gamers share one cohort — owner = first gamer (no earliest-week concept). |
| `week`, `slot`, `week_dates` | `""` | Camps-only fields. |
| `cohort_month` | `"2026-06"` | |
| `cohort_label` | `"Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` | |
| `cohort_start` | `"Jun 2, 2026"` | |
| `cohort_end` | `"Jun 25, 2026"` | |

### 2G. Google Sheets — `squad_members` rows (one per gamer when `meta.joining_squad_token` is present)

**Camps `squad_members` row (fixture):**
```json
{
  "squad_token": "{joining_squad_token}",
  "product": "camps",
  "member_parent_email": "test@example.com",
  "member_gamer_name": "Alex",
  "member_week": "Week 01",
  "member_slot": "AM",
  "member_cohort_month": "",
  "member_cohort_label": "",
  "joined_at": "{ISO-8601 now}"
}
```

POSTed as `{ tab: "squad_members", rows: [...] }`.

**E100 `squad_members` row** — differences:
| Key | E100 value |
|---|---|
| `product` | `"ekuzo100"` |
| `member_week`, `member_slot` | `""` |
| `member_cohort_month` | `"2026-06"` |
| `member_cohort_label` | `"Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"` |

---

### 2H. Meta CAPI Purchase event (camps + e100, uniform)

**POST** `https://graph.facebook.com/v19.0/{META_PIXEL_ID}/events?access_token={META_CAPI_ACCESS_TOKEN}`

```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": "{unix-now}",
    "event_id": "pi_TEST_*_001",
    "action_source": "website",
    "event_source_url": "https://ekuzo.gg/programs/{ekuzo-camps|ekuzo100}/success",
    "user_data": {
      "em": ["{sha256(lower(trim(email)))}"],
      "ph": ["{sha256(phoneDigits)}"],
      "fn": ["{sha256(lower(trim(first)))}"],
      "ln": ["{sha256(lower(trim(last)))}"],
      "zp": ["{sha256(lower(trim(postal)))}"],
      "client_ip_address": "{meta.client_ip_address — plaintext}",
      "client_user_agent": "{meta.client_user_agent — plaintext}",
      "fbc": "{meta.fbc — plaintext, optional}",
      "fbp": "{meta.fbp — plaintext, optional}"
    },
    "custom_data": { "currency": "USD", "value": 199 }
  }],
  "test_event_code": "TEST_AUTO"  // present only when paymentIntent.livemode === false
}
```

`event_source_url` is the only field that differs between camps and e100 (path slug). Value: $199 for camps, $100 for e100.

---

### 2I. Teams installment subscription (NOT part of camps/e100 parity)

Only fires when `product === "teams" && meta.payment_plan === "installment"`. The Phase 2 webhook refactor must preserve this block **exactly**:
- Lists customer's saved payment methods, picks `paymentMethods.data[0].id`.
- Creates `stripe.subscriptions.create({ customer, items: [{ price: STRIPE_PRICE_TEAMS_INSTALLMENTS }], default_payment_method, trial_end: Oct 1 2026 (unix), cancel_at: Jan 1 2027 (unix), metadata: { product, initial_payment_intent, parent_email, gamer_count } })`.

If Phase 2 changes any of: trial_end, cancel_at, the price ID source, the default_payment_method lookup, or the metadata shape — that's a behavior change to Teams' installment flow and Jamie needs to sign off explicitly.

---

## 3. Diffing protocol (how to use this doc in Phase 1+)

Each phase that touches the webhook should verify parity by:

1. **Code-level diff** — re-read the post-refactor camps/e100 paths through the webhook and confirm they produce the payloads in §2A–§2H field-for-field. Any new field, missing field, or changed value is a regression unless it's an explicit Teams-only change called out in the handoff.
2. **Live diff** — run a Stripe-CLI test payment for camps + e100 (`stripe trigger payment_intent.succeeded --add payment_intent:metadata.product=camps …`) and verify in the terminal logs that the four `✅ Beehiiv enrollment successful`, `✅ Klaviyo profile upserted`, `✅ Google Sheets: 1 row(s) written`, `✅ Sheets squads: ... row written` lines all print. Pull the actual subscriber/profile/sheet row and spot-check 2-3 fields against §2.
3. **No-op products** — make sure a refactor doesn't accidentally trigger e100 logic on a camps PI (or vice versa). The product-aware branches need to stay exclusive.

The point is **diff against this doc, not against the previous commit's webhook code** — the refactor's whole point is that the code looks different. The contract is the wire payload, not the source.

---

## 4. Phase 1 entry conditions (handoff to next session)

When starting Phase 1 (product registry), the next session should be able to assume:
- `tsc --noEmit` was clean at start of Phase 0.
- The webhook payloads in §2 are correct as of `0478038` on `dev`.
- `.next/server` was 28 MB; a Phase 1 commit that pushes this above ~35 MB warrants investigation.
- Zero MP4/MOV/WebM landed in `.next/` — keep it that way.

Phase 1 deliverable (per handoff §4): `lib/products/` with typed configs for camps, e100, teams. Migrate the webhook + register routes to read labels / automationIds / tags from it **one field at a time, behavior identical**. Verify gate is `tsc --noEmit` clean + golden payloads in §2 unchanged.

Recommended Phase 1 first move: build the registry skeleton with the three values that are obviously shared (`programName`, `tags`, `automationId`, `beehiivReferringSite`) and migrate just those four. Run §3 diff. Then add the next batch.
