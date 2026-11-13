# Preview round trip (deploy preview 7, build 9203e97, read 15:31 CT 2026-11-13)

Real Netlify, Neon test branch, live Klaviyo account. Identity: team+s1test-1113-rl1@ekuzo.gg (Klaviyo profile 01M7BCPXQRE0CBCVMD1YZFBZSK, suppressed by Klaviyo's bot protection a second after creation, as every team+ alias is).

| Check | Result |
|---|---|
| `/r/<token>` headers on Netlify | 302, relative Location, both cookies with the spec's attributes, no-store, no-referrer, noindex |
| Same with `?utm_source=..&_kx=..` | Netlify re-appends the query to the Location; the token is in neither the Location nor `ekuzo_lc` (path stored as `/season1/beta/r/`) |
| Bad shape | 302, no token cookie |
| Restore: no cookie; unknown row; foreign Origin | none; none (so the query runs on real Postgres); 403 |
| Three paced progress posts, then the Klaviyo profile | `beta_restart_link` = the preview address plus a 65 character token |
| Link, peek, peek, confirm | resume with mask "t•••@ekuzo.gg" and step 3; confirm returns email, session, stage 2 and the answers with no note, time zone or times |
| After confirm, same cookie | none (one-shot cookie). Link opened again: resume (reusable) |
| Last character of the token changed | none |
| Chrome at 390 and 1440, zone America/Vancouver | lands on the clean wizard address; panel shows the mask; player name not in the DOM before the tap; after the tap the availability screen with name, age and fun fact filled, note empty, zone Pacific; no page or console errors; hosts contacted: the preview, Google Fonts and Netlify's own preview toolbar |
| Wizard completed for the alias, then the old link | done; profile `beta_restart_link` = https://ekuzo.gg/season1/beta/start, stage done |
| `S1_REF_SECRET` in Netlify | set, Production context only, scoped Builds, Functions, Runtime (read in the UI, value not opened). Previews fall back to the Season 01 webhook secret, as `refSecret()` allows off live keys |

Found here and fixed: R-1 in `05-defect-log.md` (no link was written until the deploy context was read literally). Not run: Safari, iOS Mail, Gmail in-app browser; a real send of the pick-up email.
