# Klaviyo — Camps Welcome (Looking / Joining variant)

**Variant:** Covers two registration paths with the same copy:
- **Looking** — parent chose "Looking for a team," wants us to matchmake
- **Joining** — parent arrived via someone else's `?squad=TOKEN` link and registered onto an existing team

Both paths result in an empty `squad_link` and need no recruitment CTA. Copy below is phrased so either audience reads naturally.

**Sibling doc:** `docs/klaviyo-welcome-camps-building.md` (Building-only, with share link).
**Shared reference:** `docs/klaviyo-welcome-template.md` (merge-tag table, publishing checklist, Liquid notes).

---

## Flow trigger

**Metric:** `Placed Order`
**Conditional filters (both must match):**
- `product` equals `EKUZO Camps`
- `squad_status` does NOT equal `Building a squad`

> The "not equal" filter catches both `"Looking for a squad"` (real Lookers) and `""` (Joiners — their `squad_status` is written blank by the webhook). That's the cleanest way to route both audiences to the same email without building a second filter on `joining_squad_token` (which isn't written to Klaviyo profile properties).

---

## Sending identity

**From name:** EKUZO
**From email:** team@ekuzo.gg (or whatever sending identity is verified in Klaviyo)
**Reply-to:** team@ekuzo.gg

---

## Subject + preview

**Subject (A):** {{ person.first_name|default:"Hey" }}, you're in for EKUZO Camp.
**Subject (B — A/B alternate):** EKUZO Camp Week {{ person.camp_week|default:"" }} — here's what's next.

**Preview text:** Welcome to EKUZO — we'll match your gamer to a team before camp starts.

---

## Body (plain-text — paste into Klaviyo's Text block)

```
Hi {{ person.first_name|default:"there" }},

You just did something great for your gamer.
{{ person.gamer_name|default:"Your gamer" }} is officially registered for
EKUZO Camp — and we're excited to have them.

Your camp details
-----------------
Week {{ person.camp_week }} ({{ person.camp_week_dates }}) — {{ person.camp_slot }}

{{ person.registration_summary }}

Your team is being put together
-------------------------------
We match every gamer to a 5-player team based on age, skill level, and
play style. You'll meet your team and coach in the prep email 3 days
before camp starts — no action needed on your end.

Before camp starts
------------------
- You'll get a prep email 3 days before the session with login details,
  schedule, and a Discord invite for your team.
- Make sure League of Legends is installed and updated on the computer
  your gamer will use during camp.
- A working headset with a mic — communication is a core part of every
  session.

During camp
-----------
- Sessions run for a full week with a dedicated coach.
- Each day: skill drills, team scrimmages, VOD review, live coaching.
- End-of-week recap with your gamer's highlights.

The team sticks together after camp ends — your gamer leaves with a
reliable, non-toxic crew to keep climbing with.

Questions? Reply to this email or reach out at team@ekuzo.gg — we're real
people and we respond fast.

Welcome to EKUZO.

— The EKUZO Team
```

---

## Notes specific to this variant

- **Copy is neutral between Looking and Joining on purpose.** We don't say "you chose Looking for a team" because Joiners didn't — they arrived via a friend's invite. "Your team is being put together" works for both: Lookers know we're matchmaking; Joiners know their friend's crew is filling up.
- **No `{% if %}` guards needed.** No mention of `squad_link` or `squad_status` in the body, so nothing renders blank for either audience.
- **Want to split Joining out later?** The webhook writes `joining_squad_token` to the Google Sheet but NOT to the Klaviyo profile. To differentiate Joiners in Klaviyo you'd need to either (a) add a `joining_squad_token` write to `klaviyoProperties` in `app/api/webhooks/stripe/route.ts`, or (b) split on `squad_status == ""` vs `squad_status == "Looking for a squad"`. Deferred until we have a reason to send different copy.
- **Matchmaking backfill line.** "We match every gamer… based on age, skill level, and play style" — sets expectations. If the actual matchmaking process changes, update this line to match.

See `docs/klaviyo-welcome-template.md` for the full merge-tag reference and
step-by-step publishing checklist.
