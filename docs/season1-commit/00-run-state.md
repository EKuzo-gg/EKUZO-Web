# Season 01 commit and invite: run state

Re-read this file after any compaction or check-in. Lead updates it at every spawn and return.

## Clock (CT)
- Started: 2026-10-26 21:56 (Jamie said go, then good night)
- Slice targets: 1 by 01:00, 2 by 03:30, 3 by 05:00, 4 by 06:00, build stop 07:15, summary by 07:45
- Next send_later check-in: 23:26 (trig_01DuRFHX75KEAEp14FqdQ8zm), then every 90 min

## Where things live
- Repo clone: /home/claude/ekuzo-web, branch season1-commit (pushed at 57aa70b)
- Env: /home/claude/ekuzo-web/.env.local (git-ignored; test Stripe, Neon test, S1 webhook secret, Klaviyo, Meta). Values quoted; never print.
- KB copies (read-only): /home/claude/kb (brief, README, scope, architect review, premortems, build-loop, voice files)
- KB outbox (copy to KB at end): /home/claude/kb-outbox
- Branch deploy: https://season1-commit--ekuzo.netlify.app
- Stripe test webhook: we_1UUzlTKORcR8BUExui4NsZnU -> /api/season1/stripe-webhook
- Neon test endpoint: ep-lively-boat-b4fak1h6 (empty at start)

## Current
- Slice: 1
- Phase: discover (Scout + requirements)
- Next step: requirements for slice 1, then money red team + challenger in parallel

## Agent ledger
| Role | Task | Files owned | Ports/PIDs | Status |
|---|---|---|---|---|
| Side (W3) | terms addendum + privacy insert | kb-outbox/season1-commit/W3-*.md | none | done 22:01 |
| Scout | codebase map | returns in reply | none | running (started 21:58) |
| Red team money | redteam-money.md | that file | none | running (22:05) |
| Challenger s1 | challenger-slice1.md | that file | none | running (22:05) |
| Chronos | offer, pricing, codes, validate, mode, legacyGuard, tests, runner | lib/season1/{offer,pricing,codes,validate,mode,legacyGuard}.ts, lib/season1/__tests__, scripts/test-resolve.mjs, scripts/run-tests.mjs, package.json scripts | none | running (22:07) |

## Ports
Atlas 3101, Chronos 3102, Relay 3103, Sentry 3104 and up. Start, test, stop by PID in one call.

## Notes
- Phase 0 all green 21:53. GitHub app installed org-wide (Jamie gave full access).
- Neon test DATABASE_URL was echoed once into the session log (unquoted &). Recommend production branch role password reset at launch.
