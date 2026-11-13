# Beta sign-up go-live: requirements

Brief: knowledge-base `system/loops/handoffs/2026-11-12-beta-wizard-go-live-build-loop.md`. Loop: `company/agents/agent-loop/build-loop.md`, scaled to a small build. Written 19:41 CT, 2026-11-12, by Fable.
Start commits (fresh clone, 19:30 CT): `main` 737330f, `dev` 69d2032, `season1-commit` a9f6856.

## Journeys the build must survive

| # | Journey |
|---|---|
| J1 | Parent replied yes to Karlin's email, taps `ekuzo.gg/season1/beta/launch?src=karlin-email` in a phone mail app, reads, taps a button, finishes the wizard in the same browser. Already on the Season 01 Waitlist list (the common case tonight). |
| J2 | Same link from a text (`?src=karlin-text`), parent has never signed up anywhere. The wizard is the sign-up. |
| J3 | Parent finishes for one kid, then does the wizard again for a sibling on the same email. |
| J4 | Parent hits "Send it" on bad hotel wifi: the first response is lost, they tap again. |
| J5 | Parent comes back the next day, opens `/season1/beta/start` directly (no query) and submits. The source from day one still lands (30-day cookie). |
| J6 | Several families at one school or microschool sign up from one network within the hour. |
| J7 | A Season 01 ad or email parent uses `/season1`, `/season1/join`, checkout, welcome, crew exactly as before tonight. |

## Functional (S1, S2)

| ID | Requirement | Gate |
|---|---|---|
| B1 | `step: "beta-wizard"` is accepted for an email with no earlier sign-up and for one already on the waitlist | unit + live write on preview |
| B2 | A wizard-only family never joins list XGTv2F, never gets a "Season 01 Waitlist" event, never a Meta event | unit; Klaviyo profile check on preview |
| B3 | A retry of the same submit (same `eventId`) records one player, one Klaviyo event, one Discord line | unit + preview |
| B4 | A second player on the same email records a second player | unit + preview |
| B5 | The same player sent again updates that player's row | unit + preview |
| B6 | Families on one network are not blocked (30 per IP per hour, the waitlist's own ceiling); past that a 429 with a way to reach a person | unit |
| B7 | The honeypot stops a bot, silently | unit + preview |
| B8 | Every field validated against the wizard's allowed values (read from `start.html`, not from the handoff) | unit |
| B9 | `playerName`, `funFact`, `note` treated as untrusted text everywhere they are written | unit |
| B10 | Source and attribution land on the family and the player | unit + preview |
| B11 | Database down: Klaviyo still saves, parent sees ok, team is told | unit |
| B12 | Klaviyo down: database still saves; both down is a 502 and the wizard shows its retry text | unit |
| B13 | Sheets row only when `S1_BETA_SHEETS_WEBHOOK_URL` is set (unset tonight) | unit |
| B14 | Logs never carry an email, a player's name or an answer | unit |
| B15 | Family and player are linked in Neon; beta rows are told apart from Season 01 everywhere: own tables, own Klaviyo metric and `beta_*` properties, own Discord wording | SQL on the test database |
| B16 | Nothing on screen or in any message tells a family they have a spot | Parent review of the rendered end state |
| B17 | No kid data in a URL, in GA4, in Meta or in a commit | browser capture of beacons; grep of the diff |

## Must not (each is a test)

| ID | Must not |
|---|---|
| N1 | A retry must not create a second player or a second Discord line |
| N2 | The per-email 24 h sign-up limit (`classifySignup`) and the step lock (`stepAllowed`) must not run for this step |
| N3 | The waitlist sign-up, games, age and text-karlin steps must not change: their 54 tests pass untouched and the route diff is three additive edits |
| N4 | The `ekuzo_bsrc` cookie must not be set on any path outside `/season1/beta`, for a bot, or for a value that is not a short tag |
| N5 | `beta_wizard_complete` must not fire on page load, on a failed save, or twice for one submit (page behaviour, Aaron's file: verified, not changed) |
| N6 | No Meta `Lead` or any other Meta event from the wizard, browser or server |
| N7 | Preview and localhost pages must not write (page gate) and QA beacons must not reach live GA4, Clarity or Meta |

## Measurement rows (S3)

All three pages are route handlers serving static HTML. They bypass `app/layout.tsx` and get their tags from `renderStaticTags("landing")` in `lib/season1/tags.ts`: GA4 G-8LM45PX53W with the full page URL, Meta Pixel PageView with autoConfig off, Clarity wml8wll5ua. Live tags only on ekuzo.gg; other hosts need `?s1qa=1`.

| Page | GA4 | Meta | Clarity | Attribution captured | Destination |
|---|---|---|---|---|---|
| `/season1/beta` | `page_view`; `generate_lead {lead_source: season_one_beta_<ad>}`; `signup_error`. utm_* read by GA4 from the URL | Pixel `PageView`; `Lead` with `eventID`; server CAPI `Lead` same id (existing waitlist path, unchanged) | session; `signup` event | `ad`, utm_*, `where: beta`, page, geo, tz on the "Season 01 Waitlist" event | GA4, Meta, Klaviyo list XGTv2F |
| `/season1/beta/launch` | `page_view` only. `page_location` carries `?src=` and any utm_* | Pixel `PageView` only | session | middleware: `ekuzo_bsrc` (src), `ekuzo_lc` (utm_*, ad), `ekuzo_origin` (first touch) | GA4, Meta, cookies |
| `/season1/beta/start` | `page_view`; `beta_wizard_complete` (no parameters) after a saved submit | Pixel `PageView` only. No conversion event (decision D5) | session; `beta_wizard_complete` event; typed inputs masked by default | same three cookies, plus utm_* if the wizard URL has them | GA4, Clarity |
| wizard completion (server) | none | none | none | `source` (src cookie, else utm_source, else first touch, else direct), `src`, utm_*, `first_touch`, `lc_path`, geo | Neon family + player, Klaviyo event + profile, Discord |

UTM survival from launch to wizard: the launch buttons link to `/season1/beta/start` with no query, so the wizard URL has none. GA4 keeps the session's source from the launch page view; the server record gets it from the cookies. Both proven on the preview (ledger rows M1 to M6).

## Non-regression (protected, zero diff as evidence)

`/season1`, `/season1/join` and variants, commit and checkout, welcome, crew, every existing step of `/api/season-one`, the Stripe webhook: `git diff 737330f <release> --stat` lists only the six beta page files, `app/api/season-one/route.ts` (three additive edits), `middleware.ts` (one path-scoped block), `lib/season1/betaWizard.ts`, migration 0006, tests and docs. Klaviyo flows and lists, Meta, Karlin's Apps Script: no write of any kind; read back after the release.
