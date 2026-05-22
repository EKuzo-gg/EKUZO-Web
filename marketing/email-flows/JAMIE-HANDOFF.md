# Jamie — Hand-off

**From:** Aaron · **Last updated:** May 22, 2026
**Context:** Camps registration was simplified to a solo start (no more "Building a team" / "Looking for a team" form choice). Email 1 (Purchase Confirmation) has been updated to match — single template, share-squad-link CTA front and center. To finish wiring the experience end-to-end, three things need verification/changes on the data side. Critical-path item first.

---

## 🔴 Critical path — must be true before Email 1 ships

### 1. Webhook writes `squad_link` for every buyer, not just former "Building a team" buyers

**What's changing:** With the form simplified, every purchase produces a solo buyer who can invite friends. So **every** Klaviyo profile needs a `squad_link` property — not just the subset who previously selected "Building a team".

**Where to look:** Per the April 17 worklog, the squad-link write lives in `app/api/webhooks/stripe/route.ts` around line 172 (line number may have drifted — grep for `squad_link` or `squad_token`). Last known shape:

```ts
// Writes: https://ekuzo.gg/programs/ekuzo-camps/register?squad=${meta.squad_token}
// into the Klaviyo profile property `squad_link`.
```

**Check / change:**
- If the squad_link write is gated behind `if (meta.squad_status === "building")` or similar, remove the gate — fire it unconditionally on every Placed Order event.
- Confirm `meta.squad_token` is generated on every checkout, not just when the buyer opted into squad-building. If the token generation is gated too, ungate it.
- Backfill consideration: any profiles created between the landing-page change and this fix will be missing `squad_link`. If that window is small, ignore. If not, a one-off backfill script that walks recent profiles and writes a squad_link should be quick.

**How Aaron will know it's done:** Fire a test payment, check the resulting Klaviyo profile — `squad_link` should be populated with a register URL that includes a real squad token.

---

## 🟡 Near-term — needed before Email 4 ships (1-week-out Hype email)

### 2. `squad_member_count` profile property

**What it's for:** Email 4 has a conditional "last-call to bring a friend" CTA that should only render if the buyer's squad isn't full (cap of 5). The Klaviyo conditional needs to read `{{ person.squad_member_count }}`.

**Check / change:**
- Does this profile property already exist? If yes, confirm it updates whenever someone joins a squad via the squad_link.
- If no, add it. Write `1` on the initial Placed Order (the buyer is squad member #1), then increment on every subsequent join through the squad_token.

**How Aaron will know it's done:** Test two payments using the same squad_token — first buyer profile should show `squad_member_count: 1` then update to `2` after the second purchase. Buyer who never invites anyone stays at `1`.

**Not urgent** — Email 4 isn't built yet. Loop me in when this is wired and I'll build Email 4 with the conditional baked in.

---

## 🟡 Near-term — verify (probably already true)

### 3. `/register?squad=<token>` is still the active join URL

**Why I'm asking:** Email 1's "Bring Your Crew" block displays the literal squad_link URL in a monospace box so recipients can long-press to copy. If the registration path moved during your landing-page rework (e.g. to `/join/<token>` or similar), the URL text in the email would be technically correct (whatever the webhook writes) but it'd look different from what you might expect.

**Check:** Just confirm the destination of the squad_link URL still resolves and joins the recipient to the right squad/week. No code change needed if it does.

---

## 🟢 Future scope — scoping conversation needed

### 4. Referral mechanic (distinct from squad link)

The squad link joins a friend to the **same camp week** as you. A referral link would be different — it'd credit you with a reward (discount on next camp, swag, whatever) when a friend signs up for **any** week. Captured in `solo-start-email-plan.md` as future scope.

**Decision needed before Email 6 (Post-Camp Recap) is built:** do we want a "refer your next gamer" CTA in the recap email, and if so, what's the credit/fulfillment mechanic? 15-minute conversation, not a code task — but you'd own the credit-tracking + fulfillment side once we decide.

---

## ⚪ Newly obsolete — can delete from your TODO list

### Item from April 16 worklog: "Rename register form options to 'Building a team' / 'Looking for a team' + update webhook string transform"

This is dead with the solo-start change. There are no variant options to rename. If you started any branch work on this, throw it away.

---

## Klaviyo profile properties — summary

After all the above lands, every Klaviyo profile from a Placed Order event should have:

| Property | Source | Required by |
|---|---|---|
| `squad_link` | webhook (every order) | Email 1 |
| `squad_token` | webhook (every order) | implicit in squad_link |
| `squad_member_count` | webhook on order + squad-join | Email 4 |
| `squad_status` | webhook | analytics only — see note below |

**On `squad_status`:** No longer used for flow conditional splits (we collapsed those out). Keep writing it if it's cheap — useful for analytics ("how many buyers stay solo vs invite at least one friend"). If it'd require maintenance to keep writing, fine to deprecate.

---

## Files you might want to peek at on Aaron's side

- `email-templates/01-purchase-confirmation.html` — source of the updated email. The "Bring Your Crew" section is around line 280–320.
- `email-templates/klaviyo-ready/01-purchase-confirmation.klaviyo.html` — the file pasted into Klaviyo. Variables show up here as `{{ event.extra.squad_link }}` etc., which is what Klaviyo expects from a `Placed Order` metric trigger.
- `solo-start-email-plan.md` — full plan for the rest of the email journey (Emails 2/4/6). Skim if you want the broader context.
- `EKUZO-Camps-Worklog.md` — May 22, 2026 session entry has the full design-side change log.

---

## Status check-in

Reply / DM / however we want to do it with status on items 1–3 when you get to them. Item 1 is the only one that blocks me actually shipping the new Email 1 in Klaviyo.
