# Klaviyo — Welcome Automation Template (EKUZO Camps)

**Automation ID:** `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`
**Status:** Draft → needs template finalized and automation published
**Referenced in:** `docs/QA-FLAGGED-ISSUES.md` #13, `CLAUDE.md` (Beehiiv section)

This doc translates the camps welcome email from `docs/welcome-emails.md` into
Klaviyo merge-tag syntax and gives a step-by-step publishing checklist. All
merge tags below are already being written to the Klaviyo profile on payment
success — see `app/api/webhooks/stripe/route.ts` lines 349–385. You should
NOT need any code changes to publish this; the data pipeline is already live.

---

## Merge tags — what's available and where

The webhook writes to two surfaces Klaviyo can render in a flow email:

**Profile properties** (persisted on the customer profile, available as
`{{ person.<key> }}` in any automation sent to that profile):

| Key | Populated on | Example |
|---|---|---|
| `program` | all purchases | `EKUZO Camps` |
| `gamer_name` | all purchases | `Jacob` or `Jacob, Mia` (comma-separated) |
| `gamer_count` | all purchases | `1`, `2`, `3` |
| `registration_summary` | all purchases | `Jacob Smith — Week 02 AM (May 25 - 29) \| Mia Smith — Week 02 AM (May 25 - 29)` |
| `amount_paid` | all purchases | `$199.00` |
| `order_id` | all purchases | `EKC-8A7F2B9C` |
| `camp_week` | camps only | `2` (earliest week across gamers) |
| `camp_slot` | camps only | `AM` or `PM` |
| `camp_week_dates` | camps only | `May 25 - 29` |
| `squad_status` | camps only | `Building a squad` / `Looking for a squad` / `""` |
| `squad_link` | camps only | `https://ekuzo.gg/programs/ekuzo-camps/register?squad=kzPDaElWFY` (building only; empty for joiners + lookers) |

**Event extras** (available on the `Placed Order` event only — use these when
building an event-triggered flow instead of a profile-triggered one):
`product`, `amount`, `currency`, `order_id`, `gamer_name`, `gamer_count`, and
for camps: `camp_week`, `camp_slot`, `camp_week_dates`, `squad_link`.

Event extras render as `{{ event.extra.<key> }}`.

**Standard person fields** Klaviyo always has: `{{ person.first_name }}`,
`{{ person.last_name }}`, `{{ person.email }}`, `{{ person.phone_number }}`.

---

## Camps welcome email — ready to paste

**Trigger:** Metric = "Placed Order", conditional filter `product == "EKUZO Camps"`
(the webhook sets `product` on every Placed Order event — see
`app/api/webhooks/stripe/route.ts` ~line 447).

**From name:** EKUZO
**From email:** team@ekuzo.gg (or whatever sending identity is verified in Klaviyo)
**Reply-to:** team@ekuzo.gg

**Subject (A):** You're in! Here's what's next for {{ person.gamer_name|default:"your gamer" }}'s camp week.
**Subject (B) — if A's length flags a warning:** You're in — EKUZO Camps, Week {{ person.camp_week|default:"TBD" }}

**Preview text:** Order {{ person.order_id }} confirmed. Here's how to get ready.

**Body (HTML — drop into Klaviyo's template editor):**

```
Hi {{ person.first_name|default:"there" }},

You just did something great for your gamer.
{{ person.gamer_name|default:"Your gamer" }} is officially registered for
EKUZO Camp — and we're excited to have them.

Your registration
-----------------
Order ID:    {{ person.order_id }}
Camp week:   Week {{ person.camp_week }} ({{ person.camp_week_dates }}) {{ person.camp_slot }}
Paid:        {{ person.amount_paid }}

{{ person.registration_summary }}

{% if person.squad_link %}
Share your team link
--------------------
You chose "Building a team." Send this link to friends so they can register
for the same week/slot and land on your gamer's team:

{{ person.squad_link }}
{% endif %}

Before camp starts
------------------
- You'll get a prep email 3 days before the session with login details,
  schedule, and what your gamer needs to have ready (game installed, headset,
  Discord).
- Make sure {{ person.gamer_name|default:"your gamer" }}'s preferred game is
  installed and updated.

During camp
-----------
- Sessions run for a full week. Your gamer will be placed on a team with a
  dedicated coach.
- Each day: skill drills, team scrimmages, VOD review, live coaching.
- End-of-week recap with your gamer's highlights.

Questions? Reply to this email or reach out at team@ekuzo.gg — we're real
people and we respond fast.

Welcome to EKUZO.

— The EKUZO Team
```

**Notes on the Liquid:**

- `|default:"..."` prevents "Hi ," if Klaviyo hasn't backfilled the first name.
  Klaviyo's default filter behaves like Shopify's, not Django's — single
  argument, double-quoted.
- The `{% if person.squad_link %}` block only renders for Building families.
  Joiners and Lookers get an empty string for `squad_link` from the webhook
  (`app/api/webhooks/stripe/route.ts` sets it based on the minted
  `squadTokenForSubmit`), so the block is skipped cleanly.
- Want to differentiate joiners? Add a second conditional:
  `{% if person.squad_status == "" and person.camp_week %}` → "You're joining
  a team — we'll connect you with the team owner before your week starts."
  Optional; the current copy reads fine without it.

---

## Publishing checklist

1. **Open the automation** in Klaviyo: Flows → "EKUZO Camps Welcome" (or
   whatever name corresponds to `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`).
2. **Email step → Template** — paste the body above. Set subject + preview.
   Send a preview to `aaron@tuftdrift.com` and confirm merge tags resolve
   (pick a recent test profile like `jamiefosu+15111@gmail.com` — it has
   `squad_link`, `camp_week`, etc. populated from the 4/15 QA).
3. **Filter the flow** on `product == "EKUZO Camps"` so EKUZO100 + Teams
   registrations don't trigger it. (Or build three flows — one per product.
   If you do, duplicate this doc for ekuzo100 and teams with the right
   properties.)
4. **Smart Sending** — leave Klaviyo's default "skip sends within last 16 hours"
   on. Nobody should receive two welcomes from a rapid double-click.
5. **Publish** the flow (top-right "Draft" → "Live").
6. **End-to-end test on dev:**
   - Run a $199 camps test payment (test Stripe key on dev Netlify context —
     Jamie set this up 4/15).
   - Confirm the welcome email lands in your inbox within ~30s.
   - Spot-check that `{{ person.squad_link }}`, `{{ person.camp_week }}`,
     `{{ person.order_id }}`, `{{ person.registration_summary }}` all rendered
     correctly (no raw `{{ }}` showing, no "null").
   - Click the squad_link in the email → it should load `/squad/<token>`
     with the "Join Testy's team" hero.
7. **Unblock launch** — once end-to-end passes, mark QA-FLAGGED-ISSUES #13
   resolved.

---

## Why this doc exists (vs. doing it in Klaviyo)

The template copy, merge-tag names, and flow publishing are all manual work
in Klaviyo's UI — no code change needed. This file exists so:

- Aaron doesn't have to reverse-engineer Klaviyo's Liquid dialect from
  scratch.
- The property names stay in sync with what the webhook actually writes
  (`app/api/webhooks/stripe/route.ts` is the source of truth; if that file
  changes the property names, update this doc too).
- If we ever need to rebuild the flow (Klaviyo account migration, flow
  accidentally deleted), the template isn't lost — it's in git.
