# 01 Requirements: Season 01 ad heroes (Fable)

Build Loop run, 2026-10-14. Spec of record for the loop: `knowledge-base/company/agents/agent-loop/build-loop.md`.

## Mission

Aaron's handoff (`season1-landing-handoff.md`, 2026-10-13, copy at `docs/s1-heroes/aaron-handoff.md`) assigns each
live Season 01 ad one of his interactive landing heroes and asks that every sign-up record which page it came
from. His pages, copy and the decision to switch each ad fully (no holdout) are settled creative decisions and
are out of scope. Our job: route each ad to its page and make the result measurable, with zero edits in Meta.

Jamie's calls, 2026-10-14 07:29 CT: (1) route by `?ad=` on the site, no Meta link swaps or renames; (2) no
control group, every mapped ad switches fully; (3) ship Aaron's copy as is; (4) no games question added back
to the confirmation; (5) nothing changed since the 10-12 decision except that we are updating, not splitting.
D10's B-vs-C split is Aaron's own design and stays.

## Reference relationship

`app/season1/landing.html` on `origin/dev` (Aaron's commits e9718b3 to 89300e6) is the reference, relationship
**clone**: every hero, every word, every style and the confirmation screen ship exactly as on `origin/dev`.
Only the deltas in `02-frozen-spec.md` may differ (hero selection logic, tracking payloads). Any visual or copy
difference from the reference at the same `?ad=&hero=` URL is a MAJOR defect.

## Requirements

### Routing (R)

| ID | Requirement |
|---|---|
| R1 | With no `hero` param, a valid `?ad=` picks the hero from Aaron's table: d1 amount, d2 screentime, d3 games, d4 shortlist, d5 shortlist, d6 amount, d7 none (page A), d8 games, d9 shortlist, d10 split amount/games. Zero padding (`d01`) and case (`D5`) resolve as today. |
| R2 | Ads not in the table (d11, d12, d13 to d18) show page A, unchanged. |
| R3 | `/season1` with no `ad`, or an invalid `ad`, shows page A (today's d1 fallback, no hero). The fallback never maps to a hero. |
| R4 | An explicit `?hero=` of amount, games, screentime or shortlist (case-insensitive, trimmed) wins over the table, for any ad (Aaron's links, his Hero lab, previews keep working). |
| R5 | `?hero=none` forces page A for any ad. |
| R6 | An unknown `hero` value (typo, `hero=`, `hero=foo`) is ignored and the table applies. |
| R7 | d10 with no valid `hero` param: each browser is assigned amount or games at random, and keeps the same assignment on every later visit to d10 in that browser. Check: over 400 fresh browser contexts the amount share is 42.5% to 57.5%; a reload keeps the assignment. |
| R8 | If storage throws or is empty (private mode, in-app browser restrictions), d10 still shows a valid hero (amount or games); the page never breaks. |
| R9 | `?preview=done`, `?cta=`, `?herocta=` behave as on the reference. |

### Capture (C)

| ID | Requirement |
|---|---|
| C1 | Every ad-landing sign-up sends `hero` (amount, games, screentime, shortlist, or `none` for page A), `heroAnswer`, and `heroFrom` (url, ad-map, split, none). |
| C2 | The server saves `season1_hero` and `season1_hero_answer` on the Klaviyo profile, and `hero`, `hero_answer`, `hero_from` on the "Season 01 Waitlist" event. |
| C3 | `hero` is allowlisted server side; anything else from an ad-landing becomes `none`. `heroFrom` is allowlisted; anything else becomes empty. |
| C4 | `heroAnswer` is plain text, at most 200 characters, with the characters Aaron's answers use kept (letters, digits, spaces, `, . ' ’ “ ” " ! ? & -`); markup and link characters are stripped. A hero sign-up with no answer (skip, or every choice deselected) records `skipped`. Page A records an empty answer. |
| C5 | Page C (games) keeps sending `kid_games` through the existing `step: "games"` follow-up, as on the reference. |
| C6 | Site-popup sign-ups are unchanged: no hero fields are written for `source: site-popup` (decision D4). |

### Measurement (M)

| ID | Requirement |
|---|---|
| M1 | Every GA4 event sent through the page's `ga()` helper, and `generate_lead`, carries `hero` (the hero id or `none`). GA4's automatic `page_view` does not; the per-page visit denominator is `hero_view` for heroes and the Clarity `hero` tag (or `page_view` filtered by `ad`) for page A. |
| M2 | Clarity gets the session tag `hero` (hero id or `none`) on every page load. |
| M3 | The share link on the confirmation reproduces the sharer's page: same `ad` and `hero` (`none` for page A). |

### Non-regression and must-not (N)

| ID | Requirement |
|---|---|
| N1 | Nothing about the hero or the answer goes to Meta: pixel Lead and CAPI Lead payloads (content_name `season_one_<ad>`, event_id, user_data) are byte-identical in shape to today. |
| N2 | No GA4 parameter, Clarity tag or Clarity event carries the answer text (only the hero id). Clarity's own DOM recording is out of scope, as today. |
| N3 | Page A (d7, d11, d12, bare, invalid ad, `hero=none`) renders identically to production today, apart from the confirmation screen changes Aaron made on dev. |
| N4 | Honeypot, eventId reuse on retry, Lead once per sign-up, `form_start` on click/keydown/paste only, signup_error reasons, the 7-day attribution store and the site popup behave as on production. |
| N5 | Page load, autofill, a scroll starting on a hero button, and the page's own focus calls must not fire `hero_answer`, `form_start`, or a sign-up. |
| N6 | Console clean (no errors from our page) on every routed URL, desktop and phone. |
| N7 | `next build` and `tsc --noEmit` pass; `/season1` stays static, `/api/season-one` dynamic. |
| N9 | The d10 key `ekuzo_s1_hero_d10` is written only when `ad=d10` and no valid `hero` param; reload, answering, skipping, sign-up, retry, `fbclid`/utm changes, `preview=done`, and a visit with an explicit `hero` (including `none`) never change it. No other ad writes a key. An invalid stored value is replaced. `ekuzo_s1_attribution` and `ekuzo_attribution` are untouched by this logic. |
| N10 | Page A (any route to it) emits no `hero_view`, `hero_answer` or `hero_skip`. A hero page emits `hero_view` once per load. Clarity `set hero` is called exactly once per load. A header or sticky CTA tap on a hero page clicks Skip (Aaron's behavior) and so records `skipped` if they then sign up: expected. |
| N11 | Server: a site-popup POST carrying hero fields writes none of them; `step: games` and `step: age` ignore hero fields; hostile bodies (hero as array, object or number; heroAnswer over 200 characters or only symbols; unknown heroFrom) never error and never store markup. A same-email re-sign-up overwrites the profile hero fields (accepted: the event keeps each sign-up's page). |
| N8 | Release carries only `app/season1/landing.html` and `app/api/season-one/route.ts` (plus docs); none of dev's `public/roadshow/`, `public/review.html` or other dev-only files reach main. |

## Journeys each requirement must survive

1. Ad tap in the Facebook or Instagram in-app browser, with Meta's real URL: `ekuzo.gg/season1?ad=dN&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=<ad name>&utm_term=<placement>&utm_id=<id>&site=<fb|ig>&fbclid=...`.
2. Same browser returns to the same ad a day later (d10 stickiness), and to a different ad (table applies per ad).
3. Answer, then sign up; skip, then sign up; answer, change answer, then sign up; sign up from the bottom form; sign up after a failed first attempt (retry).
4. Confirmation share link opened by a second parent in a fresh browser.
5. Visitor leaves `/season1` for ekuzo.gg and signs up in the popup (C6: ad carried, hero not).
6. Desktop 1440 and phone 375 (touch).

## Acceptance

Every ID above has a ledger row with evidence. Live write verified in Klaviyo on the dev deploy with
`team+s1test-1014-*` addresses before production, sent by direct POST (no browser, so no pixel Lead). Each such
sign-up also sends a server CAPI Lead to the live pixel unless the dev context has the Meta test code: at most two,
logged in the cleanup ledger for exclusion from reads.

Known limit (accepted): d10 stickiness is per browser storage. The Instagram in-app browser and Safari are different
browsers, and blocked storage means a fresh pick per load.
