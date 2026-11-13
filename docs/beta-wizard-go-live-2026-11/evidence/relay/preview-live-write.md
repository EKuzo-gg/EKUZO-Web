# Live write on the deploy preview (run 20:14 CT 2026-11-12 from Jamie's machine, by Fable; commit 040a058)

Host `deploy-preview-5--ekuzo.netlify.app` (draft PR #5; Netlify builds branch deploys only for `dev` and `season1-commit`). Test database (Neon ep-lively-boat), live Klaviyo account. Identity `team+s1test-1112-pv1@ekuzo.gg`, iPhone user agent, curl with a cookie jar.

| Step | Result |
|---|---|
| GET `/season1/beta/launch?src=karlin-email` | 200; `set-cookie: ekuzo_bsrc=karlin-email; Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=lax`; `ekuzo_origin=direct` |
| GET `/season1?src=karlin-email` | no `ekuzo_bsrc` |
| POST beta-progress stage 0, 1, 2 | 200 `{"ok":true}` in 1.15 s (cold), 0.38 s, 0.34 s. Neon `s1_beta_progress`: stage 2, next_step Availability, answers merged across the three posts, source karlin-email, attribution `{"src":"karlin-email","first_touch":"direct"}`, livemode f, completed_at null |
| POST beta-wizard | 200 in 0.39 s |
| same POST again (retry) | 200; still one player, submissions 1 |
| sibling (new eventId, new name, age 9) | 200; second player on the same family |
| age 8 | 400 "Pick their age." |
| honeypot filled (other email) | 200; no Neon row, no Klaviyo profile for that email |
| unknown step | 400 |
| Neon after | family: source karlin-email, geo Austin TX US America/Chicago, livemode f. Players Testa 12 and Testb 9, both Central, times Weekday evenings and Weekend afternoons. Progress row stage 3, completed |
| Klaviyo profile 01M79AY642DM9SZECBYMNKJGTG | consent NEVER_SUBSCRIBED; properties beta_wizard yes, beta_wizard_stage done, beta_source karlin-email, beta_time_zone Central, beta_times [Weekday evenings, Weekend afternoons], beta_player_name Testb, beta_player_age 9 |

Defect found here: `beta_wizard_next_step` read "Player card" after completion (the completion wrote an empty string and the posts were a second apart). Fixed in a386ee5: completion writes "done". Retest is ledger row R-1.
