# 05 Defect log (merged, build 585617b, 2026-11-05)

Lane files kept: `05-defect-log-sentry-a.md` (full repro and fix notes for SA-1 to SA-5), `05-defect-log-sentry-b.md`. Status after Sentry A retest cycle 1 (`evidence/sentry-a/retest-1.md`).

| ID | Sev | Type | Requirement | Owner | Status |
|---|---|---|---|---|---|
| SA-1 | medium | code-bug | R3.1, R3.2, M4 | Relay | CLOSED (retest 1). A failed first sign-up (Klaviyo 5xx or timeout) keeps the 24 h claim, so the next attempt with a new eventId is a repeat: no Waitlist event, no `season1_*` props, no Lead |
| SA-2 | low | test gap | R3.5 | Relay | CLOSED (retest 1). No test proves subscribe and CAPI overlap |
| SA-3 | low | code-bug (was accepted-risk candidate) | R3.2 | Relay | CLOSED (retest 1, Repeat sends no first_name). Repeat event passed `firstName` and can overwrite `first_name` (no form sends it today) |
| SA-4 | low | infra-gap | R3.1, D16 | Relay | open as a note. SQL proven on local Postgres 16, which supersedes D16. Still unproven: Neon HTTP `text[]` parameter, `DATABASE_URL` and `S1_REF_SECRET` in production (a missing secret makes every sign-up fail open to new). H2 covers it. Housekeeping: dedupe rows pruned only by the 1 % opportunistic cleanup |
| SA-5 | info | infra-gap | tsc evidence | Atlas | open. Stale ignored `.next/types` in the worktree; clean copy gives 0 errors |
| SA-6 | low | new observation | R3.5 budget | Relay | open. `releaseClaim` has no timer of its own (8 s driver timeout), so Klaviyo failure plus a slow DB can exceed 6.8 s on the 502 path; a claim committed after the 800 ms cap is not released |
| SB-1 | low | infra-gap | Sentry B setup | Fable | open. Port 3100 was another lane's server; `.server.pid` holds a subshell pid; baseline 3200 server left running |
| SB-2 | low | infra-gap | J4, R1.3 | Fable | open. QA env resolves mode "off" (closed state); open state needs the sk_test_ and fake Neon URL override |
| SB-3 | info | accepted-risk | Console | Aaron | open. Pre-existing 404s on torn-paper images, same on baseline |
| SB-4 | info | accepted-risk | R4.2 | Atlas follow-up | open. Interactive heroes stay high CLS before and after: d2 0.386, d4 0.177, d19&hero=games 0.161 |
| SB-5 | info | accepted-risk | R3.x scope | Sentry A, H2 | open. `/api/season-one` stubbed in lane B; tags never load on localhost |
| AU-1 | low | evidence gap | R3.7 | Sentry B | open. No result states that the landing's `savedEmail` is cleared on a different email |
| AU-2 | low | evidence gap | R4.2 | Sentry B | open. d12 to d15 not in the CLS run, though R4.2 says d11 to d21; confirm those codes have no page A hero or add them |
| AU-3 | low | evidence gap | M6 | Sentry B | open. No browser-side scan of GA4 and Pixel payloads for kid data |
| AU-4 | low | evidence gap | R1.8 | Jamie or Claude | open (human, post-deploy). Body hash of both routes after deploy |
| ST-S2, S3, S6, S8 | medium to low | site state | B copy (protected) | Jamie and Aaron | open. Season line dropped from the offer card; "custom" jersey vs terms "EKUZO jersey"; late-Nov gear check; open-state screenshots in the Steward pass showed the closed state. S1, S4, S5, S7 are closed by D19, D19, D18, D1 |
| PR-1 | low | copy | D13, D20 | Aaron | open. Parent saw no "already on the list" cue on repeat (D13 keeps it); "weekly" vs "2x a week" copy goes to Aaron (D20) |
