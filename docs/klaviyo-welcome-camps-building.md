# Klaviyo — Camps Welcome (Building variant)

**Variant:** "Building a team" — parent recruited their own crew, has a `squad_link` to share.
**Sibling doc:** `docs/klaviyo-welcome-camps-looking.md` (covers Looking + Joining).
**Shared reference:** `docs/klaviyo-welcome-template.md` (merge-tag table, publishing checklist, Liquid notes).

---

## Flow trigger

**Metric:** `Placed Order`
**Conditional filters (both must match):**
- `product` equals `EKUZO Camps`
- `squad_status` equals `Building a squad`

> Note: the webhook writes `squad_status` as `"Building a squad"` (not `"team"`) even though the UI labels it "Building a team." That's intentional — the mapping hasn't been flipped yet (see 4/16 WORKLOG). Match on `"Building a squad"` until Jamie cuts the rename in `app/api/webhooks/stripe/route.ts` + any Klaviyo flow splits.

---

## Sending identity

**From name:** EKUZO
**From email:** team@ekuzo.gg (or whatever sending identity is verified in Klaviyo)
**Reply-to:** team@ekuzo.gg

---

## Subject + preview

**Subject (A):** {{ person.first_name|default:"Hey" }}, your EKUZO Camp team link is inside.
**Subject (B — A/B alternate):** You're in — share your EKUZO Camp team link with friends.

**Preview text:** Welcome to EKUZO. Share your link so your gamer's friends lock in the same week.

---

## Body (plain-text — paste into Klaviyo's Text block)

```
Hi {{ person.first_name|default:"there" }},

You just did something great for your gamer.
{{ person.gamer_name|default:"Your gamer" }} is officially registered for
EKUZO Camp. You chose "Building a team," so here's your personal invite
link to share with friends.

Your camp details
-----------------
Week {{ person.camp_week }} ({{ person.camp_week_dates }}) — {{ person.camp_slot }}

{{ person.registration_summary }}

Share your team link
--------------------
Send this link to friends who want to join the same camp week and slot.
Anyone who registers through it lands on {{ person.gamer_name|default:"your gamer" }}'s team:

{{ person.squad_link }}

Teams are 5 players. Fill in what you can — we'll match the remaining
spots from other families registered for the same week.

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

- **`squad_link` is guaranteed present** for Building registrations — the webhook sets it from `meta.squad_token` which is always minted when `squadStatus === "building"`. No `{% if %}` guard needed in the body. If you ever see a Building profile with an empty `squad_link`, that's a webhook bug upstream, not a template problem.
- **"Teams are 5 players" line.** We state the team size explicitly so the parent knows how many friends to recruit. Matches the "5-player teams" language on `/programs/ekuzo-camps` and the register page. Aaron — if the matchmaking-backfill behavior changes (e.g. if we don't backfill small teams), update the "we'll match the remaining spots" sentence.
- **Captain framing avoided.** The register page says "Building a team: I want to bring my crew together" — it doesn't use "captain." Kept the email consistent.
- **`person.gamer_name` in-body.** For multi-gamer Building registrations, `gamer_name` renders as a comma-list ("Jacob, Mia"). In the "{gamer_name}'s team" sentence that reads a little rough but it's acceptable — parents understand the list refers to both kids. If this becomes a real complaint, split into two flows (one for single-gamer, one for multi-gamer) on `gamer_count`.

See `docs/klaviyo-welcome-template.md` for the full merge-tag reference and
step-by-step publishing checklist.
