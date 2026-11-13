# Evidence ledger (written 20:36 CT; release rows added after the push)

Author is Fable unless noted. "Sentry" rows are independent: `evidence/sentry/results.md` (145 browser checks at each of 390x844 and 1440x900, 15 adversarial tests, 0 FAIL).

| Req | Test | Evidence | Result | Verified by |
|---|---|---|---|---|
| B1 | no earlier sign-up, and already on the waitlist | unit B1; deploy pv1, pv2 (`evidence/relay/preview-live-write.md`) | pass | Fable, Sentry 3 |
| B2, N2, N6 | no list, no Waitlist event, no consent call, no Meta, no step lock or 24 h claim | unit B2; Klaviyo read: NEVER_SUBSCRIBED, no list; Sentry 3 (no XGTv2F, Graph, subscribe or `s1wl:` path) | pass | Sentry |
| B3, N1 | retry of one submit | unit B3; deploy: submissions 1 after a repeat post; Sentry 2c (retry reuses eventId) | pass | Sentry |
| B4, B5 | sibling; edited answers | unit B4, B5; Neon test branch SQL run; deploy pv1 sibling | pass | Fable |
| B6 | shared network | unit B6, B6b, A2, A3 | pass | Fable |
| B7 | honeypot | unit B7; deploy: no row, no profile for the bot email | pass (server). Page has no hidden field: D6 | Fable |
| B8, B9 | validation; untrusted text | unit B8, B9, D9, P5; Sentry 3a to 3f | pass | Sentry |
| B10 | source and attribution on the record | unit B10; deploy: cookie set on Netlify, `karlin-email` and `karlin-text` on family, progress and profile | pass | Fable. Sentry could not carry the Secure cookie on its local http host; the deploy run covers it |
| B11, B12 | one store down; both down | unit B11, B12; Sentry 2c (what the parent sees) | pass | Sentry |
| B13 | Sheets off by default | unit B13 | pass | Fable |
| B14 | clean logs | unit B14, D8, P8; Sentry 3 | pass | Sentry |
| B15 | linked rows, beta told apart | Neon read on the deploy run | pass | Fable |
| B16 | no promised spot | Sentry 2a; Parent | pass | Parent |
| B17 | no kid data in a URL, GA4, Meta | Sentry 2e: GA4 `beta_wizard_step {step}` x3 and `beta_wizard_complete`, Meta PageView only, Clarity event only | pass | Sentry |
| Drop-off P1 to P8 | capture, forward-only stage, done on completion, sibling restart, filtering, failures silent | unit P1 to P8; deploy pv3 (stopped after expectations: stage "expectations", next "Player card"); Sentry 2d restart matrix | pass | Sentry |
| N3 | existing steps unchanged | 54 route tests untouched and passing; route diff is three additive edits; Sentry 2h | pass | Sentry |
| N4 | cookie only on beta paths | unit betaSource; Sentry C1 to C3; deploy curl | pass | Sentry |
| N5, N7 | no event or post on load, autofill, scroll, Back, failure; previews write nothing; QA beacons blocked | Sentry 2b, N7, OFF (offender set empty) | pass | Sentry |
| M1 to M6 | measurement rows | Sentry 2e and J1 dumps; `docs/season-one-tracking.md` section. GA4 DebugView and Meta Test Events were not opened: the pages' saves are ekuzo.gg only, so the live check after release is the proof (row L-3) | pass on the harness; live row pending | Sentry |
| Suite | full test suite | 656 tests: 655 pass, 1 skipped (same skip as on main), field-vitals 5 of 5; tsc clean; next build clean | pass | Fable at 7a37e34; Sentry at a386ee5 (653) |
| Migration | 0006 | test branch 19:42 and 20:07; production 20:24 read back (cleanup ledger C8) | pass | Fable |

## Release rows (added 20:54 CT)

| Row | What | Evidence | Result |
|---|---|---|---|
| L-0 | Protected surfaces, zero diff | `git diff --name-only 737330f b712b46` lists the six beta page files, `app/api/season-one/route.ts` (one import, the step allowlist, two dispatch lines), `middleware.ts` (one block scoped to `/season1/beta`), `lib/season1/betaWizard.ts`, `betaProgressScript.ts`, migration 0006, three test files, WORKLOG and docs. Nothing under `/season1` landing, join, commit, checkout, welcome, crew, the Stripe webhook, tags, db, offer or senders. The three HTML files are byte-identical to dev 69d2032. No Klaviyo flow, list, Meta or Apps Script write | pass |
| L-1 | Live on ekuzo.gg | 20:38:55 CT: `/season1/beta/start` served build 89f3e3d (curl of `<meta name="s1-build">`). 20:52:48 CT: build b712b46. `/season1/beta`, `/launch`, `/start` 200; `/launch/b` 404; `/season1?ad=d19`, `/season1/join`, `/season1/join/jersey`, `/`, `/blog` 200 | pass |
| L-2 | Live submit 1 (20:39, build 89f3e3d, built-in browser, `?src=karlin-email`, team+s1test-1112-live1) | Launch button opened the wizard; four posts all 200; end screen "Got it. Thanks for Testlive's info."; browser storage cleared. Production Neon: family source karlin-email, geo Austin, livemode true; player Testlive 11, Central, Weekday evenings. Klaviyo 01M79CCPGWYB33F65P1FQBWGXX NEVER_SUBSCRIBED with beta properties | pass, with defect L-2a |
| L-2a | Defect found live: the script-driven run sent all posts within half a second, the progress posts landed after the completed wizard, and the profile and progress row read "player card", not done | Fixed b712b46 (completion upserts the progress row; a progress post within two minutes of completion keeps it done and sends nothing to Klaviyo); unit P9; deploy preview 6: wizard first then three stragglers gives stage 3, done, profile done/done (pv6); ordinary drop-off unchanged (pv7) | fixed, retested |
| L-3 | Live submit 2 (20:53, build b712b46, `?src=karlin-text`, 1.8 s between steps, team+s1test-1112-live2) | Production Neon: family source karlin-text, livemode true; player Testlivetwo 13; progress stage 3, done. dataLayer on submit 1: `beta_wizard_step` email, expectations, player_card, then `beta_wizard_complete`, no other parameters | pass |
| L-4 | Cleanup | Production: DELETE 2 players, 2 families, 2 progress rows (20:54), tables empty of test data. Test branch: all team+s1test-1112 rows removed, counts 0/0/0. Klaviyo test profiles remain (ledger C9) | done except Klaviyo |
