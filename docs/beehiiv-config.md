# Beehiiv Configuration — EKUZO

**Publication:** EKUZO's Newsletter
**Publication ID:** `pub_b436ced6-32a1-4bee-b52b-9bf99ddd8287`
**API Key:** stored in `.env.local` as `BEEHIIV_API_KEY`

---

## Custom Fields (13)

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
    { "name": "location", "value": "Austin, TX, US" }
  ]
}
```

### Multi-gamer note
When a parent registers multiple gamers, `gamer_name` stores the first gamer's name (for email personalization). The full details for all gamers live in `registration_summary` (e.g. "Alex Smith — Week 01 AM (May 18 - 22) | Jordan Smith — Week 03 PM (June 01 - 05)"). `camp_week` and `camp_slot` store the first gamer's values.

---

## Beehiiv Automation

- **Welcome sequence automation ID:** `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`
- **Status:** Draft (placeholder email content, not published)
- **Trigger:** Added by API
- Must be published before going live — email content needs to be written first
- Email automation strategy and content planning lives in `/ekuzo-camps/` project folder

---

## Related Documentation

- **`/ekuzo-camps/`** (sibling project folder) — Camps PM and operations docs. Email automation strategy, content, and fulfillment workflows documented there.
- **`CAMPS-CLAUDE.md`** — Camps workstream context file (technical architecture, current state, risks)
- **`CLAUDE.md`** — Global project context (stack, commerce flow, page status)
- This doc covers Beehiiv config only — what fields exist, what the webhook sends, how tags work.
