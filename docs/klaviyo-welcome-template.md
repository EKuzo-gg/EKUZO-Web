# Klaviyo — Welcome Templates (shared reference)

**Referenced by:**
- `docs/klaviyo-welcome-camps-building.md` — camps Building variant (has squad_link)
- `docs/klaviyo-welcome-camps-looking.md` — camps Looking + Joining variant (no squad_link)
- (TBD) `docs/klaviyo-welcome-ekuzo100.md` — EKUZO100 welcome
- (TBD) `docs/klaviyo-welcome-teams.md` — EKUZOTeams welcome
- `docs/QA-FLAGGED-ISSUES.md` item #13, `CLAUDE.md` (Email marketing section)

**Automation ID (camps, draft):** `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`
**Status:** Draft → templates finalized in variant docs, Klaviyo UI publish pending.

This doc is the shared reference for every welcome email in Klaviyo. The
per-variant docs hold subject/preview/body copy. This doc holds:

1. The merge-tag table (what the webhook writes, what you can reference)
2. The routing matrix (which filter combo → which template)
3. The publishing checklist (same steps for every variant)
4. The "why" notes (decisions that apply to all variants)

All merge tags below are already being written on payment success — see
`app/api/webhooks/stripe/route.ts` lines 349–385. **No code changes are
needed to publish any of these templates.**

---

## Merge tags — what's available and where

The webhook writes to two surfaces Klaviyo can render in a flow email:

**Profile properties** (persisted on the customer profile, available as
`{{ person.<key> }}` in any automation sent to that profile):

| Key | Populated on | Example |
|---|---|---|
| `program` | all purchases | `EKUZO Camps` / `EKUZO100` / `EKUZOTeams` |
| `gamer_name` | all purchases | `Jacob` or `Jacob, Mia` (comma-separated) |
| `gamer_count` | all purchases | `1`, `2`, `3` |
| `registration_summary` | all purchases | `Jacob Smith — Week 02 AM (May 25 - 29) \| Mia Smith — Week 02 AM (May 25 - 29)` |
| `amount_paid` | all purchases | `$199.00` |
| `order_id` | all purchases | `EKC-8A7F2B9C` |
| `timezone` | all purchases | `America/Chicago` |
| `location` | all purchases | city/region derived from form |
| `acquisition_origin` | all purchases | first-touch origin: one of `ai_chatgpt`, `ai_perplexity`, `ai_claude`, `ai_other`, `organic_google`, `organic_other`, `social`, `paid_meta`, `paid_other`, `direct`, or `unknown` (defensive fallback when the cookie was absent) |
| `camp_week` | camps only | `2` (earliest week across gamers) |
| `camp_slot` | camps only | `AM` or `PM` |
| `camp_week_dates` | camps only | `May 25 - 29` |
| `squad_status` | camps only | `Building a squad` / `Looking for a squad` / `""` |
| `squad_link` | camps only | `https://ekuzo.gg/programs/ekuzo-camps/register?squad=kzPDaElWFY` (Building only; empty for Looking + Joining) |
| `cohort_label` | ekuzo100 only | `June 2026 Cohort` |
| `cohort_start` | ekuzo100 only | ISO date |
| `cohort_end` | ekuzo100 only | ISO date |
| `team_semester` | teams only | `Fall 2026` |
| `team_payment_plan` | teams only | `upfront` or `installments` |

> **Squad-status strings still say "squad," not "team."** The webhook
> writes `"Building a squad"` / `"Looking for a squad"` even though the UI
> now says "team." See 4/16 WORKLOG — separate cleanup item. Klaviyo flow
> filters must match on the `"squad"` strings until Jamie flips the
> mapping in `app/api/webhooks/stripe/route.ts`.

**Event extras** (available on the `Placed Order` event only — use these
when building an event-triggered flow instead of a profile-triggered one):
`product`, `amount` (value), `currency`, `order_id`, `gamer_name`,
`gamer_count`, and for camps: `camp_week`, `camp_slot`, `camp_week_dates`,
`squad_status`, `squad_link`.

Event extras render as `{{ event.extra.<key> }}`.

**Standard person fields** Klaviyo always has: `{{ person.first_name }}`,
`{{ person.last_name }}`, `{{ person.email }}`, `{{ person.phone_number }}`.

---

## Routing matrix — which template fires on what

| Template | Metric | Filter 1 | Filter 2 |
|---|---|---|---|
| Camps Building | `Placed Order` | `product == "EKUZO Camps"` | `squad_status == "Building a squad"` |
| Camps Looking/Joining | `Placed Order` | `product == "EKUZO Camps"` | `squad_status != "Building a squad"` |
| EKUZO100 Welcome | `Placed Order` | `product == "EKUZO100"` | — |
| EKUZOTeams Welcome | `Placed Order` | `product == "EKUZOTeams"` | — |

The camps Looking/Joining template uses a "not equal" filter so it catches
both real Lookers (`squad_status == "Looking for a squad"`) and Joiners
(`squad_status == ""`) without needing a second filter on
`joining_squad_token` (which isn't on the Klaviyo profile).

---

## Publishing checklist (applies to every variant)

1. **Open the automation** in Klaviyo: Flows → e.g. "EKUZO Camps Welcome
   — Building". Create one flow per row in the routing matrix above, or
   use Conditional Split blocks inside a single flow.
2. **Email step → Template** — paste the body from the variant doc. Set
   subject + preview.
3. **Preview render** — send a preview to `aaron@tuftdrift.com`. Use a
   test profile that has the right properties populated:
   - Camps Building: `jamiefosu@gmail.com` (4/15 QA, token `kzPDaElWFY`)
   - Camps Looking: `jamiefosu+262@gmail.com` (4/15 QA)
   - Camps Joining: `jamiefosu+15111@gmail.com` (4/15 QA, 3-gamer join)
4. **Confirm merge tags resolve.** Scan for raw `{{ }}` (didn't render) or
   literal `null`. Every reference in the variant doc should produce a real
   value.
5. **Set flow filters** per the routing matrix. Each flow should only fire
   for the right audience.
6. **Smart Sending** — leave Klaviyo's default "skip sends within last 16
   hours" on. Nobody should get two welcomes from a rapid double-click.
7. **Publish** the flow (top-right "Draft" → "Live").
8. **End-to-end test on dev.**
   - Run a test payment at the right price point (camps $199, ekuzo100
     $100, teams $640).
   - Confirm the welcome email lands in your inbox within ~30s.
   - Open in Gmail and re-scan for raw `{{ }}`.
   - For camps Building: click the `squad_link` in the email → should open
     `/programs/ekuzo-camps/register?squad=<token>` with the team banner.
9. **Unblock launch** — once the camps variants both pass end-to-end,
   `docs/QA-FLAGGED-ISSUES.md` #13 is resolved.

---

## Shared copy decisions (apply to every variant)

- **No receipt block in any welcome.** Order ID / amount paid are NOT in
  the body — Stripe emails the parent a receipt automatically from the
  Stripe account. Duplicating it makes the welcome feel transactional.
  The `person.order_id` and `person.amount_paid` properties are still on
  the profile, so ops/support can look them up.
- **Parent's first name in the subject, not gamer_name.** `gamer_name`
  renders as a comma-list for multi-gamer families ("Jacob, Mia") and
  reads awkwardly in possessive subject lines. `person.first_name` is
  Klaviyo's standard parent field and stays clean for both cases.
- **`|default:"..."` on every merge tag.** Prevents "Hi ," if Klaviyo
  hasn't backfilled a field. Klaviyo's default filter behaves like
  Shopify's, not Django's — single argument, double-quoted.
- **League of Legends is hardcoded in camps copy.** Camps is LoL-only
  right now (per `CLAUDE.md` Products section). When camps expands to
  other titles, flip to a merge tag or split into per-title variants.
- **"The team sticks together" closing line (camps only).** Mirrors the
  "THE TEAM STAYS TOGETHER" section on the camps landing page. Reinforces
  the core value prop one last time before the sign-off.

---

## Why these docs exist (vs. doing it all in Klaviyo)

The template copy, merge-tag names, and flow publishing are all manual
work in Klaviyo's UI — no code change needed. These files exist so:

- Aaron doesn't have to reverse-engineer Klaviyo's Liquid dialect from
  scratch, or remember which property names the webhook writes.
- The property names stay in sync with what the webhook actually writes
  (`app/api/webhooks/stripe/route.ts` is the source of truth; if that
  file changes the property names, update the merge-tag table above too).
- If we ever need to rebuild a flow (Klaviyo account migration, flow
  accidentally deleted), the templates aren't lost — they're in git.
