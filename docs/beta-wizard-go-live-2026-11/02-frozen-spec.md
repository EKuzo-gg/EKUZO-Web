# Frozen spec (frozen 19:42 CT, 2026-11-12; later changes are logged below)

Code: `lib/season1/betaWizard.ts` (the module header is the behaviour contract), `app/api/season-one/route.ts` (dispatch), `middleware.ts` (source cookie), `db/migrations/0006_season1_beta.sql`.

## API contract

`POST /api/season-one` with `step: "beta-wizard"` and the payload in `docs/beta-wizard-handoff.md` (verified field by field against `start.html` at dev 69d2032).

| Answer | When |
|---|---|
| 200 `{ok:true}` | saved in Neon or Klaviyo (or the honeypot was filled) |
| 400 `{ok:false,error}` | bad email, or a field outside the allowed values. The wizard shows `error` and keeps the parent on step 3 |
| 403 | cross-site browser POST (existing guard) |
| 429 `{ok:false,error}` | over 60 per IP per hour or 20 per email per day; the text names the founder's number |
| 500 | Klaviyo key missing (existing check) |
| 502 `{ok:false,error}` | neither store saved |

Order: cross-site guard, email check, key check (all existing), then honeypot, validation, limits (one round trip, 0.8 s cap, fail open), Neon upsert and Klaviyo event together (2.5 s and 3.5 s caps), then consent, Discord and Sheets together (2.5 s caps). Worst case 6.8 s, inside Netlify's 10 s.

## Data contract

- **Neon** `s1_beta_families`: one row per (email, livemode); `source`, `attribution` jsonb and `geo` jsonb from the first submission. `s1_beta_players`: one row per (family, folded first name); answers, this submission's `source` and `attribution`, `last_event_id`, `submissions`, `status` ('interested').
- **Klaviyo** event "Beta Wizard Completed", `unique_id` = email, metric, eventId. Event properties: `player_name, player_age, plays_on[], team_sports, superpowers[], fun_fact, expectations[], time_zone, tz, times[], note, source, src, utm_*, first_touch, page, geo_city, geo_region, geo_country`. Profile properties: `beta_wizard, beta_completed_at, beta_source, beta_player_name, beta_player_age, beta_time_zone, beta_tz, beta_times[]` (the latest player wins on the profile; each player has an event). `player_name`, `fun_fact` and `note` are parent-typed: escape them in any template.
- **Discord** (`S1_DISCORD_WEBHOOK_URL`, or the TEST one off production): `Beta sign-up | <First>, <age> | Time zone: <zone> (<IANA>) | Times: ... | Email: ... | Source: ...`. "updated" or "player N for this family" when that is the case. No note, no fun fact.
- **Cookie** `ekuzo_bsrc`: set by middleware on `/season1/beta` and below when `?src=` matches `^[a-z0-9][a-z0-9_-]{0,39}$` (lowercased); HttpOnly, 30 days.

## Pre-flight (live systems, read 19:33 CT)

| System | Read | Result |
|---|---|---|
| Klaviyo list XGTv2F | get_list | "Season 01 Waitlist", single opt-in, 463 profiles |
| Klaviyo flows on XGTv2F | get_flows_triggered_by_list | W5ciCB "Season 01 - Day 0 Welcome" live; VE7DfC "Season 01 - Day 4 Sign-ups open" live (the brief named only the first) |
| Klaviyo metrics | get_metrics | no "Beta Wizard Completed" yet (the first event creates it); no flow triggers on "Subscribed to Email Marketing" or "Subscribed to List" by metric |
| Production pages | curl 19:30 | `ekuzo.gg/season1/beta/launch` 404; `dev--ekuzo.netlify.app` same path 200 |
| Sheets Apps Script | `docs/apps-script-squad-endpoints-spec.md` | unknown `tab` falls through to `ekuzo-purchases`: a beta tab cannot use it as is |
| Local env files | names only | `.env.test.local` has the test `DATABASE_URL`; no file on Jamie's machine holds the live one |

## Human-action items

| # | Who | What | When |
|---|---|---|---|
| H1 | Jamie | Run migration 0006 on production (command in the review guide) | before the release to `main` |
| H2 | Jamie | Sheets: create the "Beta players" sheet and its small script, set `S1_BETA_SHEETS_WEBHOOK_URL` | after tonight |
| H3 | Jamie, Aaron | Monday: the confirmation flow on "Beta Wizard Completed"; confirm Klaviyo sends a metric flow to these profiles | Mon 11-16 |
| H4 | Aaron | Proposed, not built: a "sign up another player" link on the end screen (P4); forward the query from launch to wizard (then the cookie can go) | his call |

## Spec changes after freeze

(none yet)
