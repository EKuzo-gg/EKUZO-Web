# BETA sign-up: handoff to Jamie

Written 2026-11-12 by Aaron's Claude. Goal: get the BETA flow live so a few people can try it and give feedback.

## What is built (Aaron's lane, on `dev`)

| Piece | Address | File |
|---|---|---|
| BETA page, one email field | `/season1/beta` | `app/season1/beta/beta.html` |
| Details page, no form, buttons open the wizard | `/season1/beta/details` | `app/season1/beta/details/details.html` |
| Sign-up wizard | `/season1/beta/start` | `app/season1/beta/start/start.html` |
| Flow, screens, email copy | `/roadshow/beta-lab.html` | `public/roadshow/beta-lab.html` |

All three pages are static HTML served by a route handler, the same pattern as `/season1`. None touches `app/api`.

## The flow

1. **Beta ad** to `/season1/beta`. The parent joins with an email.
2. **Karlin's email** to the 400+ Season 01 sign-ups. To join, they reply.
3. Parents who reply yes get the **details page**, `/season1/beta/details`, from Karlin by hand. Page sign-ups get the **wizard invite** email with a link to `/season1/beta/start`.
4. **Wizard:** email, then what the beta is and three expectations, the player card, availability.
5. **Wizard confirmation** email. It promises a review and a reply, not a spot.
6. We review availability and volume, then follow up with practice. How we confirm a player is still being decided.

## What already saves

`/season1/beta` posts to `POST /api/season-one` exactly as the ad landing does (`source: "ad-landing"`), so those parents already land in Klaviyo as "Season 01 Waitlist" and join list `XGTv2F`. To tell a beta sign-up apart:

- `page` starts with `/season1/beta`
- `where` is `"beta"`, `adName` is `"BETA join page"`
- Meta Lead `content_name` is `season_one_beta_<ad>`

## What does not save yet (needs you)

### 1. The wizard's answers

On ekuzo.gg only, the wizard's last step sends this to `POST /api/season-one`. Off ekuzo.gg it sends nothing.

```json
{
  "step": "beta-wizard",
  "email": "parent@example.com",
  "eventId": "uuid, stable across retries of the same submit",
  "playerName": "Maya",
  "playerAge": 12,
  "playsOn": ["Console", "Phone"],
  "teamSports": "Tried, didn't stick",
  "superpowers": ["Makes everyone laugh", "Quick thinker"],
  "funFact": "Knows every flag in the world",
  "expectations": ["No toxicity", "Positive mindset", "Winning attitude"],
  "timeZone": "Eastern",
  "tz": "America/New_York",
  "times": ["Weekday evenings", "Weekend afternoons"],
  "note": "",
  "attribution": { "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_content": "", "utm_term": "" },
  "page": "/season1/beta/start",
  "ekz_hp": ""
}
```

Allowed values:

- `playerAge`: 9 to 18
- `playsOn` (any): Computer, Console, Tablet, Phone, Not much yet
- `teamSports` (one, optional): Loves them / Plays, not their thing / Tried, didn't stick / Hasn't tried yet
- `superpowers` (up to two): Never gives up, Makes everyone laugh, Quick thinker, Natural leader, Quiet strategist, Builds anything, Great teammate
- `expectations`: always all three, the wizard will not continue without them
- `timeZone`: Eastern, Central, Mountain, Pacific, Alaska, Hawaii, Other. `tz` is the device's IANA zone.
- `times` (at least one): Weekday afternoons, Weekday evenings, Weekend afternoons, Weekend evenings
- `playerName`, `funFact` (120 max), `note` are free text typed by a parent. Escape them in any template.

**Today the route answers 400 to this**, because `beta-wizard` is not a known `step`. The wizard then shows the route's `error` text and the parent can retry. So the wizard should not be linked from a live email until the route handles the step.

Things to decide in the route:

- **It must work for a parent with no earlier sign-up.** The other follow-up steps call `stepAllowed()` and drop the write when there is no prior sign-up for that email. Parents who replied to Karlin never used the page, so for this step the wizard is the sign-up. Suggest: upsert the profile and subscribe to the list here.
- **Event name.** Suggest a Klaviyo event `Beta Wizard Completed` with the fields above as event properties, and `beta_*` profile properties for the ones we filter on (age, times, time zone).
- **Fulfillment view.** We need to sort players by availability and volume. A Sheets row per player (like `ekuzo-purchases`) would make that review easy. Your call on where it lives.
- The wizard sends no Meta event. It fires `beta_wizard_complete` to GA4 and Clarity on success.

### 2. Two Klaviyo emails

Copy for both is in the Beta lab under "The emails". Per the platform split these are Klaviyo, not Beehiiv.

- **Wizard invite.** Trigger: "Season 01 Waitlist" where `page` starts with `/season1/beta`. One link: `https://ekuzo.gg/season1/beta/start`. Parents who replied to Karlin get the same email from him by hand.
- **Wizard confirmation.** Trigger: `Beta Wizard Completed`. Uses the player's name. It has a `[date]` placeholder for when we will reply, which the team still has to set.

## Before it goes live

- [ ] Route handles `step: "beta-wizard"` and writes to Klaviyo (and Sheets if used)
- [ ] One real submit on a preview with the live key, checked in Klaviyo
- [ ] Wizard invite flow live, link points to `/season1/beta/start`
- [ ] Wizard confirmation flow live, `[date]` filled in
- [ ] `dev` merged through `season1-commit` to `main`
- [ ] Final headline on `/season1/beta` (Karlin is deciding; working version is "Free beta. Game with a pro coach.")

## Not tested

- The repo test suite (no `node_modules` in the session that built this).
- A real write. The wizard's save call was tested against a mocked `/api/season-one` on a faked ekuzo.gg host: a 200 shows the end state, a 400 shows the error and keeps the parent on step 3.
