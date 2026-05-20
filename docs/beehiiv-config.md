# Beehiiv Configuration — EKUZO

**Publication:** EKUZO's Newsletter
**Publication ID:** `pub_b436ced6-32a1-4bee-b52b-9bf99ddd8287`
**API Key:** stored in `.env.local` as `BEEHIIV_API_KEY`

---

## Custom Fields (16)

| Field name | Type | Source | Used for |
|---|---|---|---|
| `first_name` | Text | Webhook (parent's first name) | Email personalization ("Hi Jane") |
| `last_name` | Text | Webhook (parent's last name) | Full name display |
| `phone` | Text | Webhook (parent's phone) | Fulfillment / manual outreach |
| `program` | List | Webhook ("EKUZO Camps", future: "EKUZO Teams", "EKUZO100") | Segmentation by product |
| `gamer_name` | Text | Webhook (gamer's first name, or comma-separated for multi-gamer) | Email personalization ("Get Alex ready!") |
| `camp_week` | Number | Webhook (week number, e.g. 1-10) | Automation triggers (pre-camp timing) |
| `camp_slot` | List | Webhook ("AM" or "PM") | Automation triggers (session-specific comms) |
| `gamer_count` | Text | Webhook (number of gamers registered) | Segmentation / analytics |
| `registration_summary` | Text | Webhook (human-readable: "Alex Smith — Week 01 AM (May 18 - 22)") | Dashboard readability, fulfillment |
| `payment_intent_id` | Text | Webhook (Stripe PI ID) | Stripe cross-reference, support lookups |
| `amount_paid` | Text | Webhook (formatted: "$199.00") | Receipts, support |
| `timezone` | Text | Webhook (IANA: "America/New_York") | Cohort matching, send-time optimization |
| `location` | Text | Webhook (from Stripe billing: "Austin, TX, US") | Cohort matching, geo insights |
| `cta_source` | Text | Webhook (`hero` / `sticky` / `footer` from `?cta=` on register URL, or empty) | Attribution — which CTA on the camps marketing page produced this purchase |
| `squad_status` | Text | Webhook (`"Looking for a squad"` for all camps purchases post-2026-05-20; historical Building/Looking values still possible) | Legacy segment helper. Building/Looking fork was retired 2026-05-20; everyone now defaults to "Looking for a squad". Field retained for backward compat with any Klaviyo/Beehiiv segments still referencing it. |
| `squad_link` | Text | Webhook (full URL: `https://ekuzo.gg/programs/ekuzo-camps/register?squad={token}`) | **Templated into the camps welcome email body** — every parent's unique shareable squad link. Friends who click it land on the register form with the owner's week + PM pre-pinned. Populated on every camps purchase (post-2026-05-20 funnel change). |

### Notes
- Beehiiv reserved fields (`email`, `city`, `region`, `country`, `utm_source`, etc.) are auto-populated and don't need custom fields. See `docs/beehiiv-reserved-fields.pdf` or the Beehiiv support article for the full list.
- `phone` is TEXT not NUMBER — phone numbers with formatting like "(555) 123-4567" need to be stored as text.
- `camp_week` is NUMBER type — supports numeric filtering in segments (e.g. camp_week >= 3).
- `camp_slot` is LIST type — supports single/multi select filtering.
- `program` is LIST type — supports filtering by product as more programs launch.

---

## Tags

### Purchase tags (applied by webhook on payment)
| Tag | Applied by | Purpose |
|---|---|---|
| `camp-2026-purchased` | Stripe webhook | Identifies camp buyers. Used for segmentation (exclude from "buy camp" promos) and automation triggers. |

### Source tags (applied by webhook or form)
| Tag | Applied by | Purpose |
|---|---|---|
| `source-camp-registration` | Stripe webhook | Tracks acquisition channel — came in through camp purchase |
| `source-newsletter` | Footer/popup signup form | Tracks acquisition channel — organic newsletter signup |
| `source-contact-form` | Make.com webhook (ContactModal) | Tracks acquisition channel — "Start a conversation" form |

### Operational tags (applied manually)
| Tag | Applied by | Purpose |
|---|---|---|
| `no-promo` | Manual | Exclude from sales/advertising emails. For partners, thought leaders, contacts with no kids. |
| `vip` | Manual | High-touch contacts — school admins, repeat purchasers, ambassadors. |

### Funnel-stage tags (camps abandoned-cart capture)
| Tag | Applied by | Purpose |
|---|---|---|
| `form_started_camps` | `POST /api/camps/lead` (fired on email-field onBlur on the camps register page) | Identifies parents who entered an email but didn't reach payment. Used as the audience for the soft "you started signing up" recovery email. |
| `cart_abandoned_camps` | `POST /api/camps/abandoned` (fired after `/api/camps/register` succeeds and BEFORE the parent enters card details) | Identifies parents who reached "Continue to payment" and bailed before paying. Stronger intent signal — gamer name + week + slot are also captured as custom fields. |

**⚠️ Critical: these tags do NOT auto-clear when a customer eventually pays.** Beehiiv's public API has no tag-removal endpoint, so paid customers keep these tags alongside `camp-2026-purchased` forever. See "Automations" section below — every cart-abandonment automation MUST exclude `camp-2026-purchased` from its audience.

### Future purchase tags (created, not yet wired)
| Tag | Applied by | Purpose |
|---|---|---|
| `teams-purchased` | Future webhook | When EKUZO Teams launches |
| `ekuzo100-purchased` | Future webhook | When EKUZO100 launches |

### Lifecycle tags (created, not yet wired)
| Tag | Applied by | Purpose |
|---|---|---|
| `camp-2026-completed` | Manual or automation (post-camp) | Marks campers who finished. Used for re-enrollment targeting. |

### Re-engagement tags (created, not yet wired)
| Tag | Applied by | Purpose |
|---|---|---|
| `re-enroll-target` | Manual or automation | Completed one program, candidate for next. Used for re-enrollment campaigns. |

---

## Segmentation Strategy

- ONE list (all subscribers), segmented by tags + custom fields
- No separate lists per product
- Campaign targeting example: "Buy Camp 2026" promo → audience = NOT tagged `camp-2026-purchased` AND NOT tagged `no-promo`

---

## Automations (to be configured)

### 1. Camp Purchase Welcome Sequence
- **Trigger:** Tag `camp-2026-purchased` applied
- **Emails:** TBD (welcome, what to expect, prep checklist)

### 2. Pre-Camp Reminders
- **Trigger:** Based on `camp_week` value + date logic
- **Emails:** TBD (week-before, day-before, day-of)

### 3. Post-Camp Follow-up
- **Trigger:** Based on `camp_week` value + date logic (after camp week ends)
- **Emails:** TBD (feedback request, re-enrollment offer, next program intro)

### 4. Newsletter Welcome
- **Trigger:** Tag `source-newsletter` applied (organic signup, no purchase)
- **Emails:** TBD (welcome, what EKUZO is, program overview)

### 5. Cart Abandonment Recovery — Camps
- **Trigger:** Tag `cart_abandoned_camps` applied
- **🚨 REQUIRED audience exclusion:** **EXCLUDE subscribers tagged `camp-2026-purchased`.** Without this exclusion, paid customers will receive recovery emails because the abandoned tag stays on the profile after purchase (see API Limitations below for why).
- **Custom fields available for personalization:** `gamer_name`, `camp_week`, `camp_slot`. Use them — "Hey {first_name}, want to lock in {gamer_name}'s spot for Week {camp_week} {camp_slot}?" lands harder than a generic recovery email.
- **Emails:** TBD (1-hour soft nudge, day-2 reminder, day-7 last-call with social proof or testimonials).

### 6. Form-Started Recovery — Camps (lower priority)
- **Trigger:** Tag `form_started_camps` applied
- **🚨 REQUIRED audience exclusion:** EXCLUDE `camp-2026-purchased`, AND EXCLUDE `cart_abandoned_camps` (those parents progressed further; they'll get the cart automation instead).
- **Emails:** TBD (low-pressure "here's what camp looks like" content sequence — these parents only typed an email, no real intent signal yet).

---

## API Limitations (read before configuring anything tag-based)

Beehiiv's public API only supports **adding** tags, not removing them. Verified against the live API on 2026-05-05 — `DELETE /tags`, `DELETE /tags/:name`, `DELETE /tags?tags=…`, and `PATCH /tags` all return 404. Beehiiv's docs landing page lists exactly one Subscription Tags endpoint, and it's `POST` only. `PUT /subscriptions` silently ignores the `tags` field per the existing CLAUDE.md learning log.

**Practical consequences:**
- Once a tag is applied via `POST /tags`, the only way to remove it is the dashboard UI or (possibly) a Beehiiv-native automation with a "Remove tag" action. Code can't do it.
- Funnel-stage tags (`form_started_camps`, `cart_abandoned_camps`) accumulate on a profile and never come off automatically. Paid customers will permanently carry every funnel tag they ever earned.
- This means **segmentation does the work that tag removal would otherwise do.** Every recovery automation must exclude further-along tags. See the audience exclusion rules on each automation entry above.

**Optional cosmetic cleanup:** if Beehiiv's automation builder supports a Remove-tag step, you can configure "When tag `camp-2026-purchased` added → Remove `form_started_camps` and `cart_abandoned_camps`." This makes profiles visually clean but isn't required for correct automation behavior — the audience exclusions above handle the semantics regardless.

---

## Webhook → Beehiiv Payload

The Stripe webhook (`/api/webhooks/stripe`) sends this to Beehiiv on `payment_intent.succeeded`:

```json
{
  "email": "parent@email.com",
  "reactivate_existing": true,
  "send_welcome_email": true,
  "utm_source": "ekuzo-camps-registration",
  "tags": ["camp-2026-purchased", "source-camp-registration"],
  "custom_fields": [
    { "name": "first_name", "value": "Jane" },
    { "name": "last_name", "value": "Smith" },
    { "name": "phone", "value": "(555) 123-4567" },
    { "name": "program", "value": "EKUZO Camps" },
    { "name": "gamer_name", "value": "Alex" },
    { "name": "camp_week", "value": "1" },
    { "name": "camp_slot", "value": "AM" },
    { "name": "gamer_count", "value": "1" },
    { "name": "registration_summary", "value": "Alex Smith — Week 01 AM (May 18 - 22)" },
    { "name": "payment_intent_id", "value": "pi_xxx" },
    { "name": "amount_paid", "value": "$199.00" },
    { "name": "timezone", "value": "America/New_York" },
    { "name": "location", "value": "Austin, TX, US" },
    { "name": "cta_source", "value": "hero" },
    { "name": "squad_status", "value": "Looking for a squad" },
    { "name": "squad_link", "value": "https://ekuzo.gg/programs/ekuzo-camps/register?squad=aB3xy9Kp_1" }
  ]
}
```

### Squad link

Every camps purchase mints a unique `squad_token` (10-char nanoid) at the moment the parent submits the register form. The Stripe webhook turns that into the full `squad_link` URL using `NEXT_PUBLIC_SITE_URL` as the host. The link is the shareable invite — friends who click it land on the camps register form with the squad owner's week + PM session pre-pinned and a "You've been invited to join {gamer}'s team" banner. The same link is shown to the parent on `/programs/ekuzo-camps/success` (copy-to-clipboard input) and templated into the camps welcome automation body so the parent has it in their inbox as well.

**Templating in the email:** reference the field as `{{squad_link}}` in the Beehiiv automation editor. Render it as a clickable link, not raw text — the URL is long and unwieldy out of context.

### Multi-gamer note
When a parent registers multiple gamers, `gamer_name` stores the first gamer's name (for email personalization). The full details for all gamers live in `registration_summary` (e.g. "Alex Smith — Week 01 AM (May 18 - 22) | Jordan Smith — Week 03 PM (June 01 - 05)"). `camp_week` and `camp_slot` store the first gamer's values.

---

## Beehiiv Automation

- **Welcome sequence automation ID:** `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`
- **Status:** Draft (placeholder email content, not published)
- **Trigger:** Added by API
- Must be published before going live — email content needs to be written first
- **Must template `{{squad_link}}` into the body** — that's the shareable squad invite (see "Squad link" section above). Every parent gets a unique one as of the 2026-05-20 funnel change. Render as a clickable anchor, not raw text. Pair with a short "Bring your friends" pitch matching the success-page copy.
- Email automation strategy and content planning lives in `/ekuzo-camps/` project folder

---

## Related Documentation

- **`/ekuzo-camps/`** (sibling project folder) — Camps PM and operations docs. Email automation strategy, content, and fulfillment workflows documented there.
- **`CAMPS-CLAUDE.md`** — Camps workstream context file (technical architecture, current state, risks)
- **`CLAUDE.md`** — Global project context (stack, commerce flow, page status)
- This doc covers Beehiiv config only — what fields exist, what the webhook sends, how tags work.
