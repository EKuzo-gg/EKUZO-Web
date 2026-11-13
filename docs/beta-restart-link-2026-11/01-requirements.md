# Requirements: beta restart link, time zone map, repo notes

Brief: knowledge-base `system/loops/handoffs/2026-11-13-beta-restart-link-build-loop.md`. Plan approved by Jamie 14:23 CT 2026-11-13 ("otherwise yes we are ready to go"; on the finished-family screen: "we don't want people in a blank", use Aaron's existing design). Written 14:25 CT on `build/beta-restart-link` from main fe494e2.

## Family states (what we hold, where, what the team can do with it)

| State | Held | Where | Team can |
|---|---|---|---|
| Started, stopped part-way | answers so far, step, session, source | Neon `s1_beta_progress`; Klaviyo profile incl. new `beta_restart_link` | email the link (pick-up flow Wf7Nam) |
| Taps the link, unfinished | nothing new until they move a step | same row, same session | see the resume in GA4 (`beta_wizard_resume`, `via: link`) |
| Taps the link, already finished | nothing new | row has `completed_at` | nothing; they see the end screen |
| Taps a dead link (30 quiet days, superseded by a new run, tampered) | nothing | | nothing; they see the wizard's first screen |
| Finishes after a link resume | as any finish | families, players, progress done; `beta_restart_link` reset to the plain wizard address | "We got it" flow |
| Starts again (sibling, new day) | new session on the same row | old link stops working; a new one is issued | pick-up flow again |

## Requirements

| ID | Requirement |
|---|---|
| L1 | The link is `https://ekuzo.gg/season1/beta/r/<token>`. The token is a row id and a signature: no email, no player detail, nothing readable. |
| L2 | `/season1/beta/r/<token>` answers 302 to `/season1/beta/start` with no token in the Location, sets an HttpOnly cookie scoped to the restore endpoint, and serves no HTML and no vendor tag. `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`. |
| L3 | A restore endpoint returns the saved answers only for a valid token whose row is unfinished and was updated in the last 30 days. It never writes to the progress row, Klaviyo or the sheet. |
| L4 | A valid token for a finished row returns state `done` and no answers, email or name. Anything else (bad signature, unknown row, expired, superseded session, no cookie, database down) returns state `none`, with the same status and shape. |
| L5 | The signature covers the row id and the row's current session, with a key derived from `S1_REF_SECRET` under its own label. A new wizard run for the same email makes older links dead. Constant-time compare. No new env value. |
| L6 | The link is reusable until one of the L3/L4 conditions ends it (mail scanners open links; parents tap twice). The cookie is one-shot: the restore call clears it. |
| L7 | Each saved progress post sets profile property `beta_restart_link` on Klaviyo; a completed wizard sets it to `https://ekuzo.gg/season1/beta/start` (a non-empty value, because an empty one leaves the old value in Klaviyo: defect R-1 of the go-live build). Off production the link uses the request's own origin. |
| L8 | On the wizard page, a link arrival with state `resume` reopens the wizard on the step they left with answers filled in, continuing the same session; state `done` shows the page's existing end screen (generic headline, empty player card); state `none` leaves the first screen. Answers already in this browser win over the link. `start.html` is not edited. |
| L9 | The restore sets the source cookie from the progress row's source when the browser has none, so a family that finishes on another device keeps its source. |
| L10 | Limits: restore calls per IP per hour capped (fail open; the signature is the control). Logs carry no email, token, name or answer. |
| Z1 | A browser zone the page does not map (Canadian zones, America/Boise and other US ones, the `US/` and `Canada/` aliases) gets the option for its winter UTC offset: 5 Eastern, 6 Central, 7 Mountain, 8 Pacific, 9 Alaska, 10 Hawaii, anything else "Other". The parent can still change it; a restored answer wins. Done in the appended script. |
| Z2 | A table test covers Toronto, Winnipeg, Regina, Edmonton, Vancouver, Halifax, St_Johns, Boise, Indiana, Phoenix, Honolulu, Anchorage and a non-American zone. |
| N1 | Repo notes owed (WORKLOG, cleanup ledger, dev-runbook, klaviyo-config, season-one-tracking) per the brief, item 3. |

## Must not

| ID | Must not |
|---|---|
| M1 | The token must never appear in the address of a page that loads GA4, Pixel or Clarity, in a Location header, in a GA4 or Meta event, or in a log line. |
| M2 | A restore must not fire `beta_wizard_complete`, `beta_wizard_step` for steps already counted, or any progress post for steps the family did before. |
| M3 | A link for a finished family must not return or print the player's name, age or any answer. |
| M4 | A late or out-of-order restore response must not overwrite what the parent typed after the page loaded, and must not move a parent backwards. |
| M5 | A restore must not reopen a finished row or change `completed_at`. |
| M6 | The zone guess must not override a zone the parent picked or one restored from saved answers. |
| M7 | Protected: Season 01 landing, join, checkout, welcome, crew, the Stripe webhook, `app/api/season-one/route.ts` (zero diff), `start.html`, `launch.html`, `beta.html` (zero diff). The only change to existing behaviour is additive: one more profile property on the progress and completion saves. |
| M8 | Page loads without a link arrival must not call the restore endpoint. |

## Journeys

J1 phone to laptop: start on one browser, stop at the player card, open the link in a second browser profile, land on the player card with answers, finish; one family, one player, progress row done, source kept. J2 tap the link twice and from a mail scanner (GET with a bot user agent) first. J3 finish, then tap the old link: end screen. J4 start again for a sibling, tap the first link: first screen. J5 link opened in the same browser that already holds newer answers: local answers win. J6 a Vancouver browser with no link: Pacific preselected; parent changes it; the change is what is sent.

## Measurement

| Surface | GA4 | Meta | Clarity | Attribution | Destination |
|---|---|---|---|---|---|
| `/season1/beta/r/<token>` | none (redirect, no HTML) | none | none | L9 | |
| `/season1/beta/start` after a link | `beta_wizard_resume {step, via: "link"}` (`via: "device"` for the existing same-device restart; `step: "done"` for a finished family) | PageView only, unchanged | unchanged | source cookie from the row | GA4; Klaviyo flow click and "Beta Wizard Completed" after the pick-up email |

No kid data in any of it. Registering `via` as a GA4 custom dimension is a GA4 admin change and waits for Jamie.
