# Solo Start — Email Flow Update Plan

**Drafted:** May 22, 2026
**Context:** Camps landing page + registration now route everyone through a solo
start. Squads are formed after purchase via the buyer's shareable squad link
(`{{ squad_link }}` → `/register?squad=<token>`, written into the Klaviyo profile
by Jamie's Stripe webhook). The original 4-email variant split
(BUILDING vs LOOKING) is retired.

This doc captures how the remaining variant-affected emails (2, 4, 6) should be
rewritten when we build them. Email 1 (Purchase Confirmation) is already done.

---

## Universal changes (all 16 emails)

- **No more squad_status conditional splits.** Remove every `Conditional Split`
  step keyed on `squad_status` from the Klaviyo flow builder. Single send to
  every recipient.
- **Drop the language of being "matched into a team."** Replace with
  "matched into a squad on Day 1 — solo or with the friends you bring."
- **`squad_link` is universal.** Every recipient has one. The webhook writes it
  regardless of solo/group status. Treat it as always-present in templates.
- **Squad share CTA is recurring, not one-shot.** Drop it into Emails 1, 2, 4,
  and 6. Repeated exposure is the whole point — most users won't share on the
  first open.

## Email-by-email

### Email 2 — Welcome / What to Expect *(formerly variant-split)*

Currently planned as "we're matching you with a squad" (LOOKING) vs
"how to wrangle your invited crew" (BUILDING). Collapse to one:

- **Hero:** "WELCOME TO EKUZO" — reuse the chartreuse hero treatment from
  Email 1 for journey continuity.
- **Body:** What to expect Day 1 → Day 5 at a high level. Brief, hype-y.
- **Squad section:** Compact version of the "Bring Your Crew" block from
  Email 1. Smaller — one share CTA (mailto), inline link preview, one-liner
  "Friends still welcome to join your squad."
- **No coach name yet** (matching happens closer to camp).

### Email 4 — Hype / 1 Week Out *(formerly variant-split)*

Was "your squad is set, here's who's on it" (LOOKING) vs "is your team
complete?" (BUILDING). Collapse to:

- **Hero:** "ONE WEEK OUT" with countdown energy.
- **Squad reveal moment:** This is the right place to surface the actual
  matched squad if Jamie's data is wired by then. Show 5 gamer avatars + names
  (or empty placeholders if Jamie's logic hasn't run). Coach name + photo.
- **Last-call share CTA:** Smaller and softer than Email 1 — "Spots in your
  squad are filling up. Last chance to bring a friend." Only render this if
  the squad isn't full (Klaviyo conditional on a `squad_member_count` profile
  property — Jamie to confirm whether this exists; if not, render unconditionally).

### Email 6 — Post-Camp / Recap *(formerly variant-split)*

Was a thank-you variant by squad type. Collapse to:

- **Hero:** Recap moment — clip from tournament day, "{{ gamer_name }} just
  completed EKUZO Camps."
- **No share CTA here.** Camp is over; the squad-link mechanic is irrelevant.
- **Replace with:** Referral CTA → next camp week (new mechanic, see Open
  Questions below).

---

## Hand-off to Jamie

- **`squad_status` profile property:** No longer needed for flow logic, but
  don't delete it — useful for analytics (who actually invited friends vs
  who stayed solo). Tag the field "deprecated for flow logic, kept for reporting"
  in the Klaviyo profile schema.
- **`squad_member_count` profile property:** Needed for Email 4's
  conditional last-call CTA. Confirm whether this is already written by the
  webhook; if not, add to the post-purchase + post-squad-join hooks.
- **`squad_link` for solo profiles:** Verify the webhook writes a tokenized
  link even when the buyer didn't invite anyone (i.e. solo buyer = generates
  their own squad of size 1, gets a token they can share). If this only fires
  when squad_status was "building" in the old flow, Jamie needs to update it.

## Open questions / future scope

- **Referral mechanic (distinct from squad link).** A referral link would
  credit the buyer with a reward (discount, swag) when a friend signs up for
  *any* camp week — different mechanic from squad-link which only joins the
  same week. Worth exploring for Email 6 ("refer your next gamer") and as a
  future post-purchase upsell. Not building this today — Jamie needs to wire
  the credit / fulfillment logic first.
- **Sharing on iMessage / WhatsApp at the OS level.** The `sms:` and `mailto:`
  CTAs in Email 1 work universally but feel old-school on iOS. A web-side
  squad page with native `navigator.share()` would feel more modern. Worth
  considering for the `/squad/[token]` landing page Jamie has built but the
  email currently bypasses.
- **Email 3 (Onboarding · Discord invite) and Email 5 (During-Camp daily
  updates).** Neither was originally variant-split, so no rewrite needed —
  but both should pick up the squad share CTA in a small footer-style block
  for consistency. Low priority.
