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
- Phase: implement (spec frozen 22:11 with red-team resolutions)
- Next step: when Relay B and Atlas return, integrate, push, prove on the branch deploy (Playwright card run at 375 px), then slice 1 gate note to Jamie

## Agent ledger
| Role | Task | Files owned | Ports/PIDs | Status |
|---|---|---|---|---|
| Side (W3) | terms addendum + privacy insert | kb-outbox/season1-commit/W3-*.md | none | done 22:01 |
| Scout | codebase map | scout-map.md (saved by lead) | none | done 22:10 |
| Relay A | migrations, migrate script, db.ts, ratelimit, legacy guard, ADR Discord note, db integration test | db/migrations, scripts/s1-migrate.mjs, lib/season1/{db,ratelimit}.ts, legacy route guard lines, docs/architecture-decisions.md, 06-cleanup-ledger.md | none | done, committed 50ce88c |
| Red team money | redteam-money.md | that file | none | done (20 findings, all resolved in spec) |
| Challenger s1 | challenger-slice1.md | that file | none | done; challenger now moved to planning time (D7) |
| Chronos | offer, pricing, codes, validate, mode, legacyGuard, tests, runner | (committed 28a4222) | none | done 62/62 |

## Ports
Atlas 3101, Chronos 3102, Relay 3103, Sentry 3104 and up. Start, test, stop by PID in one call.

## Notes
- Phase 0 all green 21:53. GitHub app installed org-wide (Jamie gave full access).
- Neon test DATABASE_URL was echoed once into the session log (unquoted &). Recommend production branch role password reset at launch.

| Atlas | signup, welcome, terms pages, /karlin | app/season1/join/**, app/season1/terms/**, next.config.mjs redirect, screenshots/ | 3101 /home/claude/pids/atlas.pid | running |
| Relay B | commit API, fulfil, webhook, 0003 migration, mode/legacyGuard updates, integration tests | app/api/season1/**, lib/season1/{fulfil,stripe}.ts, db.ts extensions, db/migrations/0003 | 3103 /home/claude/pids/relay.pid | running |

- Times above before 22:06 were estimated; real clock: spec frozen 22:11.
- KB outbox: build-loop.md challenger move (Jamie yes 22:05), W3 terms draft.
- Push via /home/claude/s1-push.sh (secret scan fails closed).
| Red team trust | redteam-trust.md | that file | none | done, resolved in 02b |
| Red team ops | redteam-ops.md | that file | none | done, slice 1 items sent to Relay B and Atlas; rest in 02b |
| Chronos 2 | 0004 migration (not applied), refcookie.ts, referral.ts, referralFlags.ts, tests | those files | none | running (22:22) |
| Atlas 2 | /crew/[code] page, invite remove API | app/crew/**, app/api/season1/invite/** | 3105 /home/claude/pids/atlas2.pid | running (22:23) |

- 22:20 slice 2 contract frozen (02b). Lead to add /season1/crew* 301 to next.config.mjs after Atlas 1 returns, apply 0004 after Relay B's 0003.
- 22:30: Atlas (f217a34) and Atlas 2 (2e16e14) committed. Chronos 2 committed (801763f). 0004 applied to Neon test by lead. /crew/<code> verified: friend code, signed HttpOnly cookie, private no-store, Referrer-Policy origin. Client paymentMethodTypes set to card only (Link bank tab). Waiting on Relay B (commit API, fulfil, webhook, 0003). Then: swap the fulfil stub, slice 2 wiring (commit reads s1_ref, fulfil writes referrals), branch deploy E2E.
- 22:32 RISK: Stripe test endpoint we_1TMYx4 -> dev--ekuzo.netlify.app/api/webhooks/stripe (origin/dev, no guard) receives every season1 succeeded test PI and runs it as camps with no parent_email: possible empty-email Sheets row + Meta test event per PI. Mitigation: minimize succeeded PIs, ledger each in 06-cleanup-ledger.md. Morning human action: check the dev-context Sheet for empty-email rows; the guard ships with this branch.
- 23:20: Relay B committed (b17b9ab): commit API, fulfil, webhook; 109 unit + 8 money integration pass; 6 succeeded test PIs ledgered. Fulfil stub removed; S1_DEPLOY_CONTEXT inlined. `next build` passes locally. Branch deploy live with webhook (unsigned POST 400 = secret present).
- Running: Relay C (slice 2 server wiring), Atlas 3 (slice 2 invite UI), Sentry (slice 1 E2E on branch deploy, 1 succeeded PI allowed).
