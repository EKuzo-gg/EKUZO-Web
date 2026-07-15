# EKUZO 101: Summer Pilot — Frozen Spec

**Owner:** Fable  
**Date:** 2026-07-15  
**Status:** FROZEN — deviations require a logged spec-change in 03-decision-log.md

---

## 1. Product Config — `lib/products/ekuzo101.ts`

```typescript
export const ekuzo101Product: ProductConfig = {
  id: "ekuzo101",
  cohortUnit: "week",
  programName: "EKUZO101",
  // No Beehiiv automation for pilot — Klaviyo owns product email.
  // welcomeAutomationId is omitted (field is now optional in types.ts).
  beehiiv: {
    referringSites: {
      purchase: "ekuzo101-pilot-registration",
      formStarted: "ekuzo101-form-started",
      cartAbandoned: "",  // No abandoned route for 101
    },
    tags: {
      purchased: ["ekuzo101-pilot-registered", "source-ekuzo101-pilot"],
      formStarted: "ekuzo101-form-started",
      cartAbandoned: "",
    },
  },
  routes: {
    registerPath: "/programs/ekuzo101/register",
    programSlug: "ekuzo101",
  },
  squad: { writesSquadRows: false },
  // Strategy callbacks — minimal implementations for Sheets row shape
  buildGamerSummary(gamer, meta) {
    return `${gamer.firstName} ${gamer.lastName} — ${meta.weeks_label || ""}`;
  },
  buildBeehiivCustomFields(_meta, _ctx) {
    return [];  // Custom fields built inline in the register route
  },
  buildKlaviyoProfileProperties(_meta, _ctx) {
    return {};  // Built inline in the register route
  },
  buildKlaviyoOrderProperties(_meta, _ctx) {
    return {};
  },
  buildPurchaseRowCohortFields(_gamer, meta) {
    return {
      week: meta.weeks_label || "",
      slot: "",
      week_dates: meta.week_dates_span || "",  // "Tue Jul 21 – Thu Aug 20"
    };
  },
  buildSquadsRowFields(gamers, _meta) {
    return {
      ownerGamerName: gamers[0]?.firstName || "",
      week: "", slot: "", week_dates: "",
      cohort_month: "", cohort_label: "", cohort_start: "", cohort_end: "",
    };
  },
  buildSquadMemberRowFields(_gamer, _meta) {
    return { member_week: "", member_slot: "", member_cohort_month: "", member_cohort_label: "" };
  },
};
```

---

## 2. Types Changes — `lib/products/types.ts`

**Line 29:** `export type ProductId = "camps" | "ekuzo100" | "teams" | "ekuzo101";`

**Line 196:** `welcomeAutomationId?: string;` (add `?`)

---

## 3. Index Changes — `lib/products/index.ts`

Add import: `import { ekuzo101Product } from "./ekuzo101";`

Add to PRODUCTS map: `ekuzo101: ekuzo101Product`

Add guard in `getProductFromMeta` BEFORE default return:
`if (metaProduct === "ekuzo101") return ekuzo101Product;`

---

## 4. Stripe Webhook Guard — `app/api/webhooks/stripe/route.ts`

At the `automation_ids` line (~L333), change:
```
automation_ids: [automationId],
```
to:
```
automation_ids: automationId ? [automationId] : [],
```

This is the only allowed change to this file.

---

## 5. Analytics + Hook Extensions

### `lib/analytics.ts`
Add `"ekuzo101"` to the `program` type unions in `trackViewContent`, `trackInitiateCheckout`, `trackPurchase`.

Add new function:
```typescript
export function trackRegistration(params: { program: string }) {
  ga4("sign_up", { method: params.program });
  fbq("CompleteRegistration", { content_name: params.program, value: 0, currency: "USD" });
}
```

### `hooks/useRegisterForm.ts`
Add `"ekuzo101"` to `ProductLeadSlug` type union.

---

## 6. Week Computation — `lib/ekuzo101-weeks.ts` (new file, Chronos owns)

```typescript
export type WeekOption = {
  tuesdayISO: string;    // "2026-07-21" — primary key
  thursdayISO: string;   // "2026-07-23"
  label: string;         // "Week of Jul 21"
  tueFull: string;       // "Tue, Jul 21"
  thuFull: string;       // "Thu, Jul 23"
};

const SESSION_HOUR_ET = 19;  // 7 PM — session start cutoff

/**
 * Returns the next 6 Tuesdays whose 7 PM ET session has not yet started.
 * "Not yet started" means: the current ET wall-clock time is before
 * 7:00 PM on that Tuesday, when evaluated at `now`.
 * DST is handled by Intl — we compare the session start instant to now.
 */
export function getEligibleWeeks(now: Date): WeekOption[] { ... }

/**
 * Server-side re-validation. Given an ISO Tuesday date string and now,
 * returns true if that week is still in the eligible window.
 */
export function isWeekEligible(tuesdayISO: string, now: Date): boolean { ... }
```

**ET cutoff algorithm:**
1. For a candidate Tuesday `T`, construct the session-start instant: midnight ET on `T` + 19 hours. Use `new Date(Date.UTC(...))` with the known UTC offset for ET (UTC-4 in EDT, UTC-5 in EST). To be DST-correct, format the date with `Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', ... })` and parse.
2. If `now >= sessionStart`, the week is ineligible.
3. Iterate from the next Tuesday (could be today) forward until we have 6 eligible Tuesdays.

**Unit tests** (`lib/__tests__/ekuzo101-weeks.test.ts`):
- Jul 21 is eligible at 6:59 PM ET on Jul 21
- Jul 21 is ineligible at 7:00 PM ET on Jul 21
- Returns exactly 6 weeks
- DST: Oct 31 transition (should not crash)
- All returned Tuesday ISO dates parse to a Tuesday (day-of-week === 2)

---

## 7. API Route — `POST /api/ekuzo101/register`

**File:** `app/api/ekuzo101/register/route.ts`

### Request body
```typescript
{
  gamers: Array<{
    firstName: string; lastName: string; gamerTag?: string;
    birthday?: string; gender?: string; skillLevel?: string;
    tshirtSize?: string; preferredGames?: string[];
  }>;
  weeks: string[];           // ISO Tuesday dates — registration-level
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  timezone: string;
  ctaSource?: string;
  // Attribution fields (same shape as e100)
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string;
  acquisitionSource?: string; origin?: string;
}
```

**Tripwire:** Reject with 400 if `body.totalPrice` is present.

### Server-side validation
1. `!gamers?.length` → 400
2. `body.totalPrice !== undefined` → 400 (tripwire)
3. `!weeks?.length || weeks.length < 4 || weeks.length > 6` → 400
4. Each week: `isValidTuesday(w)` — parses to Date, day-of-week === 2 → else 400
5. Each week: `isWeekEligible(w, new Date())` from `lib/ekuzo101-weeks.ts` → else 400
6. Dedup: `new Set(weeks).size !== weeks.length` → 400
7. Parent email regex check

### Fulfillment (sequential, best-effort — failure of any step must not prevent success response)

**Step 0: Compute shared values**
```typescript
const registrationId = crypto.randomUUID();
const registrationTimestamp = Math.floor(Date.now() / 1000);
const registrationDate = new Date().toISOString();
const allGamerNames = gamers.map(g => `${g.firstName} ${g.lastName}`).join(", ");

// weeks_label: "Tuesdays & Thursdays - Weeks of Jul 21, Jul 28, Aug 11, Aug 18 - 7-8:30 PM ET"
const weeksLabel = buildWeeksLabel(weeks);

// week_dates_span: "Tue Jul 21 - Thu [last Thu]"
const weekDatesSpan = buildWeekDatesSpan(weeks);

// weekDetails: array of { tueFull, thuFull } for the success page
const weekDetails = weeks.map(iso => ({ tueFull: formatTueFull(iso), thuFull: formatThuFull(iso) }));
```

Note: Use hyphens (-) NOT en-dashes in `weeksLabel` and `weekDatesSpan`.

**Step 1: Beehiiv** (wrap in try/catch, log failures)
```typescript
// 1a. Subscribe
const beehiivPayload = {
  email: parentEmail,
  reactivate_existing: true,
  send_welcome_email: false,
  referring_site: "ekuzo101-pilot-registration",
  // NO automation_ids
  custom_fields: [
    { name: "first_name", value: parentFirstName },
    { name: "last_name", value: parentLastName },
    { name: "phone", value: parentPhone },
    { name: "program", value: "EKUZO101" },
    { name: "gamer_name", value: allGamerNames },
    { name: "gamer_count", value: String(gamers.length) },
    { name: "weeks_label", value: weeksLabel },
    { name: "timezone", value: timezone },
  ],
};
// 1b. Tag (separate POST) — only if subscribe succeeded and returned subscriberId
const tags = ["ekuzo101-pilot-registered", "source-ekuzo101-pilot"];
```

**Step 2: Klaviyo** (wrap in try/catch, log failures)
```typescript
// 2a. Profile import
const klaviyoProperties = {
  program: "EKUZO101",
  gamer_name: allGamerNames,
  gamer_count: String(gamers.length),
  weeks_label: weeksLabel,
  weeks_count: weeks.length,
};
// 2b. Add to KLAVIYO_PURCHASERS_LIST_ID list
// 2c. Track "Registered Pilot" event
const eventProperties = {
  product: "EKUZO101",
  weeks_label: weeksLabel,
  weeks_count: weeks.length,
  gamer_name: allGamerNames,
  gamer_count: gamers.length,
};
```

**Step 3: Sheets** (wrap in try/catch, log failures)
```typescript
const rows = gamers.map((g, i) => ({
  registration_id: `REG-${registrationTimestamp}-${i}`,
  family_id: `FAM-${registrationId.slice(0, 20)}`,
  product: "ekuzo101",
  parent_first_name: parentFirstName,
  parent_last_name: parentLastName,
  parent_email: parentEmail,
  parent_phone: parentPhone,
  gamer_name: `${g.firstName} ${g.lastName}`.trim(),
  gamer_tag: g.gamerTag || "",
  week: weeksLabel,
  slot: "",
  week_dates: weekDatesSpan,
  birthday: g.birthday || "",
  gender: g.gender || "",
  gaming_experience: g.skillLevel || "",
  tshirt_size: g.tshirtSize || "",
  time_preference: "",
  first_semester: "",
  preferred_games: (g.preferredGames || []).join(", "),
  timezone: timezone,
  location: "",
  amount_paid: "$0.00",
  stripe_pi_id: "",
  registration_date: registrationDate,
  additional_info: `reg_id:${registrationId}`,
  squad_status: "",
  squad_token: "",
  joining_squad_token: "",
  preferred_days: "",
  acquisition_source: acquisitionSource || "",
  origin: origin || "",
  utm_source: utmSource || "",
  utm_medium: utmMedium || "",
  utm_campaign: utmCampaign || "",
  utm_content: utmContent || "",
  utm_term: utmTerm || "",
}));
// POST { rows } to GOOGLE_SHEETS_WEBHOOK_URL
```

### Response (always 200 if registration data was valid)
```typescript
return NextResponse.json({
  ok: true,
  parentName: `${parentFirstName} ${parentLastName}`,
  parentEmail,
  gamers: gamers.map(g => ({ name: `${g.firstName} ${g.lastName}`.trim() })),
  weeksLabel,
  weekDetails,  // [{ tueFull, thuFull }]
  weeksCount: weeks.length,
});
```

---

## 8. API Route — `POST /api/ekuzo101/lead`

**File:** `app/api/ekuzo101/lead/route.ts`

Clone of `app/api/ekuzo100/lead/route.ts` with:
- `FORM_STARTED_TAG = "ekuzo101-form-started"`
- `REFERRING_SITE = "ekuzo101-form-started"`
- Klaviyo: `{ metricName: "Started Registration", email, properties: { product: "ekuzo101" } }`
- Log prefix: "Ekuzo101 lead"

---

## 9. Week Picker Component — `components/ekuzo101/WeekPicker.tsx`

```typescript
"use client";
type Props = {
  selected: string[];   // ISO Tuesday dates
  onChange: (weeks: string[]) => void;
  now?: Date;           // override for testing; defaults to new Date()
};
```

- Renders 6 tiles from `getEligibleWeeks(now ?? new Date())`
- Each tile: shows `label` ("Week of Jul 21") + `tueFull` + `thuFull`
- Toggle on click: if already selected, deselect; else select
- Counter: "X of 4 minimum selected" (shows until 4 reached, then "X weeks selected")
- Tile visual state: selected (red bg + white text) vs unselected (light bg)
- Adapt the e100 calendar tile visual language — red accent, font-display week label

---

## 10. Pages

### `app/programs/ekuzo101/page.tsx` — Landing (server component)
Exports `metadata` with `alternates: { canonical: "/programs/ekuzo101" }`, `robots: { index: false, follow: true }`.

Section arc (camps v2 as baseline):
1. **Hero** — headline + eyebrow + subhead + CTA → register. Screentime joke lands here or in the "For Gamers" section.
2. **How It Works** — Tue/Thu 7-8:30 PM, you pick your weeks, 4 weeks of coaching, free upfront.
3. **Coaches** — Karlin + Sebastien coach cards (same cards as camps).
4. **Testimonials** — `<TestimonialsCarousel />` component (existing, unchanged).
5. **FAQ** — 4-6 Q&As. Use `<FAQAccordion />`.
6. **CTA** — FooterBanner / prominent CTA strip.
No JSON-LD (noindex).

### `app/programs/ekuzo101/register/page.tsx` — Register (client)
`"use client"` — exports NO metadata (layout shim handles it).

Structure (clone of e100 register minus all payment machinery):
- `useRegisterForm({ productSlug: "ekuzo101" })` for parent info + email-blur lead
- `useState<string[]>([])` for selected weeks
- `<WeekPicker selected={selectedWeeks} onChange={setSelectedWeeks} />` replaces cohort picker
- Multi-gamer (same as e100)
- Submit handler: `POST /api/ekuzo101/register` → on success, store JSON in `sessionStorage["ekuzo101-success"]` → `router.push("/programs/ekuzo101/success")`
- Submit disabled if `selectedWeeks.length < 4 || isSubmitting`
- **NO**: PaymentStep, CheckoutForm, Stripe imports, abandoned route call, squad token
- **Pilot reassurance row** (no card required, coach follows up): replace `<ReassuranceRow>` content or add a custom note

On mount: call `trackViewContent({ program: "ekuzo101" })` directly (or extend TrackPageView union).

### `app/programs/ekuzo101/register/layout.tsx` — Server shim
```typescript
export const metadata = {
  title: "Register — EKUZO 101 Summer Pilot",
  description: "Reserve your family's spot in the EKUZO 101 summer pilot.",
  alternates: { canonical: "/programs/ekuzo101/register" },
  robots: { index: false, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### `app/programs/ekuzo101/success/page.tsx` — Success (client)
`"use client"` — reads `sessionStorage["ekuzo101-success"]` on mount.

Structure:
- Success icon (green checkmark, same as e100)
- Headline: "YOU'RE IN!" (font-display, uppercase)
- Subhead: your registration is confirmed, coach will be in touch
- **Selected weeks summary**: list of `weekDetails` (tueFull + thuFull), time "7:00-8:30 PM ET"
- **What happens next**: 3 steps (check email, coach reaches out, get the game ready)
- **Pay-at-the-end promise**: one clean paragraph — free pilot, if it was worth it pay at the end
- **No** squad share section, no payment summary, no "Total Paid"

On mount: call `trackRegistration({ program: "ekuzo101" })`.

Fallback if sessionStorage empty: generic "Your registration is confirmed." message.

### `app/programs/ekuzo101/success/layout.tsx` — Server shim
Same pattern as register layout, robots `{ index: false, follow: false }`.

---

## 11. Klaviyo Templates + Setup Checklist

**`docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md`**:
~10-step checklist for Jamie:
1. Clone flow `UWMYHm` in Klaviyo dashboard (https://www.klaviyo.com/flow/UWMYHm/edit)
2. Rename to "Pilot Confirmation - EKUZO 101"
3. Create template "Pilot Confirmation - EKUZO 101" via REST API or dashboard
4. Create template "Pilot Toolkit - EKUZO 101" via REST API or dashboard
5. Update flow trigger metric to "Registered Pilot" (auto-created by first Phase 4 test)
6. Remove product filter (was "EKUZO100")
7. Swap Email #1 to the new pilot confirmation template
8. Remove or adjust 1-day delay email
9. Set to live when ready to go
10. Confirm first test subscriber received the email

**Template content** (Relay writes the actual HTML; Story writes copy):

*Pilot Confirmation:* Personalized to `{{ event.gamer_name }}`. Shows selected weeks from `{{ event.weeks_label }}`. No payment references. Coach will reach out. "If it was worth it — and we think it will be — you'll square up at the end and roll into the team program."

*Pilot Toolkit:* What to install, what to expect in session 1, how Tue/Thu nights run.

---

## 12. Spec-Change Log

*(No changes since freeze — add entries here if implementation deviates)*
