# Review guide: beta sign-up live on ekuzo.gg

Written 20:54 CT, 2026-11-12, by Fable, after the last gate.

## Sixty seconds

- **Live:** `https://ekuzo.gg/season1/beta/launch` and its wizard have been live since 20:38 CT (final build b712b46 at 20:52). Two real submits on production landed in Neon and Klaviyo and were removed afterwards.
- **What a family leaves behind:** on the email screen and after each step, the answers so far and the step to pick up at; on "Send it", a family and a player with the source of the link.
- **The link Karlin sends:** `https://ekuzo.gg/season1/beta/launch?src=karlin-email` (in a text: `?src=karlin-text`).
- **Not built:** the pick-up email and the "we got it" email (Klaviyo, Monday), the restart link for another device, the Sheets tab, any alert when a family finishes.
- **Your Aaron files are untouched.** The capture is added by the wizard's route handler.

## Decisions, most overrulable first

1. **Two Sentry "major" findings accepted without asking you** (`05-defect-log.md` D1, D2): anyone can type someone else's email into the wizard, which puts that address on the drop-off record, and a stranger can reopen a finished family's progress row. Nothing is sent tonight and neither changes sign-ups or money, so I applied your rule of defaulting low-impact items to "not now". They become rules for the pick-up flow: one email per profile per week, and skip profiles that completed in the last 14 days. Say so if you would rather have held the release.
2. **No Klaviyo consent is set** for a wizard-only parent (profile and events only). Monday: confirm the confirmation and pick-up flows reach a never-subscribed profile. If Klaviyo will not send, the fix is a consent line on the page (Aaron) or marking those two flows transactional.
3. **Second push to main at 20:51** for a defect found on the first live check (posts arriving out of order left a finished family on "player card"). Same gates, two files.
4. **`dev` was not touched.** It still lacks the route change and the capture script. Recipe in `08-return-handoff.md`.
5. **Draft PRs #5 and #6** were opened only to get Netlify deploy previews, because branch deploys exist only for `dev` and `season1-commit`. Both closed themselves when main received the commits.
6. Source tag kept in a cookie by middleware (D4); player keyed on family plus first name (D3); 30 submissions an hour per network (D7). `03-decision-log.md`.

## Walkthrough

1. Open `https://ekuzo.gg/season1/beta/launch?src=jamie-check` on your phone. Tap "Sign up your player".
2. Enter `team+s1test-1113-yourname@ekuzo.gg`, tap Continue, tick the three expectations, Continue, then close the tab.
3. Klaviyo, Profiles, search that address: `beta_wizard_stage` "expectations", `beta_wizard_next_step` "Player card", `beta_source` "jamie-check". That is a drop-off.
4. Open `https://ekuzo.gg/season1/beta/start` again in the same browser: it reopens on the player card with your answers kept. Finish it.
5. The profile now reads `beta_wizard_stage` "done", with a "Beta Wizard Completed" event carrying the answers.
6. Neon, SQL Editor, production: `select f.email, f.source, p.first_name, p.age, p.time_zone, p.times from s1_beta_players p join s1_beta_families f on f.id = p.family_id order by p.created_at desc;` and `select email, stage, next_step, completed_at from s1_beta_progress order by updated_at desc;`

## For you to check by hand (not provable from here)

- A real iPhone in Mail's in-app browser and an Android in Gmail's: the wizard completes and reopens at the right step. QA used Chrome emulation only.
- GA4 Realtime during your walkthrough: `beta_wizard_step` and `beta_wizard_complete` arrive. QA proved what the page hands GA4, not GA4's receipt.
- GA4 admin (your go): register `step` as an event-scoped custom dimension so the step funnel can be built.

## Before the pick-up email goes live (Monday)

- Suppress or exclude the nine `team+s1test-1112-*` Klaviyo profiles (cleanup ledger C9). **This needs your go.**
- Flow: trigger "Beta Wizard Progress"; wait; skip if "Beta Wizard Completed" since the flow started, or in the last 14 days; one send per profile per week. Step name is `beta_wizard_next_step`, player name `beta_player_name` (escape it).
- Decide the restart link for another device (`03-decision-log.md` D12).

## For Aaron and Karlin (their call; nothing changed)

Ranked by likely effect on sign-ups, from a fresh parent read of the screenshots (`05-defect-log.md`):
1. No start date, day or session length on the launch page.
2. No line by the player card on who sees a kid's details.
3. The end screen has no date for the answer.
4. The game is named only in the needs list, and "Where do they game?" offers Console right after "Any laptop or Mac will work".
5. Selected chips read as disabled.
Also: the wizard has no hidden `ekz_hp` field; a "sign up another player" link on the end screen must reload the page (P4).

## Message for the team (S5), ready to post

> Beta sign-up is live. Karlin, reply to the yes emails with this link: https://ekuzo.gg/season1/beta/launch?src=karlin-email (for texts use ?src=karlin-text, so we can tell them apart).
>
> What happens: the page explains the beta, the button opens the sign-up. It takes about two minutes and ends on "we'll review and email you either way". Nobody is told they have a spot.
>
> Where sign-ups show up: Klaviyo, under the metric "Beta Wizard Completed" (player name, age, time zone, the times that work, and which link they came from). If a parent starts and stops, they are under "Beta Wizard Progress" with the step they stopped on, and the page reopens there when they come back on the same device.
>
> Not built yet: the "we got it" email, the pick-up email for parents who stop part-way, and a sheet to sort players by time. Until the sheet exists, check Klaviyo for new sign-ups; nothing pings us. Beta sign-ups do not get the Season 01 welcome emails or Karlin's day-one note.
>
> Aaron: your three pages went out exactly as they are on dev. Notes from QA and a fresh parent read are in the WORKLOG.

## KB backport candidates

Shown in the session close as exact prose for a yes or no.
