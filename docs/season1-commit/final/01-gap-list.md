---
title: "Season 01 final build: reconciled gap list"
created: 2026-10-29
author: Jamie's Claude (lead, phase 1)
inputs: 00-inputs/ (Aaron 10-28 handoff, Miro board export 14 pages), season1-commit f29744f, Klaviyo read 10-29, Stripe test read 10-29, KB 16-final-build-and-golive-brief.md and its section 1 files
---

# Reconciled gap list (phase 1)

Read on Thu 10-29, 07:30 to 08:30 CT. Five read-only scouts (code, Klaviyo, Stripe and Netlify, KB, simpler-launch challenger). Their raw notes are in the session scratchpad; everything that matters is here.

## What is true right now

- `season1-commit` f29744f is the code Aaron QA'd (two later commits add and remove a temp image). 169 of 169 tests pass, `tsc` clean (rerun 10-29).
- `main` (15e761d) is an ancestor of `season1-commit`. Outside `public/roadshow` (35 files), `public/ads/season1` (24 images) and `public/review.html`, everything main would gain is Season 01 code, migrations and scripts, the next 16.4.3 security bump, the legacy webhook guard and 9 to 17 copy on 9 site pages. `docs/season1-launch` is docs only, not served.
- Production ekuzo.gg runs next 16.2.1 (critical advisory). `/season1/join` is 404 on production.
- Stripe test: Season 01 webhook `we_1UUzlT...` enabled on the branch deploy with the six events. 14 succeeded Season 01 test payments since 10-24, 2 full refunds, 1 partial. Two legacy test webhooks still enabled (Cloudflare bridge, old WordPress at ekuso.gg). Live mode is not readable by the connector.
- Netlify: no access from this session (no token, no CLI). Env var names unverified.
- Klaviyo: two Season 01 flows (W5ciCB waitlist, Vk9VxY Text Karlin alert). No flow on Committed (RK6AMi), Friend Joined or Refunded. No segments. No draft Season 01 campaigns. Waitlist list XGTv2F has 244 profiles. 4 profiles have `season1_status = committed`, all from 10-27 test runs.

## Gaps

Tags: **B** blocker before the first real payment, **L** before or right after live, **F** fast follow.

| # | Gap | Tag | Owner | Source |
|---|---|---|---|---|
| 1 | No Klaviyo flow on "Season 01 Committed"; receipt VkbuB3 unattached. Its 6 variables all resolve against the live event. No subject or From set | B | Jamie's go (UI) | Aaron handoff; Klaviyo read |
| 2 | Release path in Aaron's handoff (merge to dev, then dev to main) would serve roadshow photos, ad images and review.html on ekuzo.gg | B | Claude builds, Jamie pushes | code read; dev-runbook 175-193 |
| 3 | Production setup: Neon restore point, migrations 0001 to 0004, owner password reset, scale-to-zero off; Netlify production env; Stripe live webhook (6 events), live payment domains check, Radar, receipt and refund emails | B | Jamie's hands | brief 2 item 4; ops-runbook |
| 4 | Season dates disagree: terms 23.2 "Jan 11 to May 9"; Karlin "Jan 18 to May 6, tournament Apr 17" (and no practice Jan 18); pages say "Mid Jan" and a "May" final; 23.3 calls Dec 31 "two weeks before" | B | Karlin dates, Jamie terms wording, Claude installs | brief; code; Karlin 10-27 |
| 5 | Security release (next 16.4.3) not on main or dev; production exposed now | B (today) | Jamie's go | KB debrief; code |
| 6 | Waitlist flow W5ciCB has no filter: a family who pays still gets email 2, which says "Gamers 9 to 18" and "$20 per session" | L | Jamie's go (UI) | Klaviyo read |
| 7 | No "season1_status is set" segment, so a campaign to the 244 can't exclude payers | L | Jamie's go (UI) | Klaviyo read |
| 8 | No campaign to the 244 drafted ("Season 01 is open"); D3 date open | L | Aaron builds, Jamie's go | board p11; D3 |
| 9 | Nurture shape conflict: KB 14 (11:40) says message filters, offer day 5, friend day 7, payers stay in flow; KB 15 and the Miro board say flow-level filter, email 1 at 1 hour, offer day 2, friend day 6, payers leave for track 2 | L (decide) | Jamie | KB 14, 15; board p13 |
| 10 | Board adds a track 2 day-2 "bring their crew" email; decision D1 said one EKUZO receipt only | L (decide) | Jamie, Aaron | board p12; D1 |
| 11 | Ages: copy 9 to 17 everywhere; server and picker still take 18; `age_edge` flags 9 and 18; FAQ canon says 10 to 17, 9 case by case | L | Claude after decision | code; canon |
| 12 | Discord commit alerts: webhooks unset in Netlify. Payload carries kid first names and ages, city, amount, source, inviter's kid and code; no parent name, email or phone | L | Karlin, Jamie | code; text-line revision |
| 13 | Text line: `textKarlinSms` still the 10-26 number; Google Voice number not confirmed. No consent line under the phone field | L | Karlin (number), Aaron (line) | code; KB text-line |
| 14 | Friend's welcome page says "Then $160 a month from Feb 15" while sign-up told them Feb 15 is $0; welcome ladder ignores kid count (PR-8) | L | Claude (server), note to Aaron | code |
| 15 | Crew page still shows the $100 offer and Join button when mode is off (leads to a paused sign-up) | L | Claude | code |
| 16 | Two doors on /season1 and "Ready now? Save their spot" on the thanks page not built (board: "now", Fri 10-30) | L | Aaron | board p6, p8 |
| 17 | Ops runbook still quotes the $65 jersey refund rule the approved terms dropped; no rollback steps written | L | Claude | code |
| 18 | Live waitlist email SBCrTc says 9 to 18, $20 per session, privacy link /privacy | L | Aaron, Jamie's go | Klaviyo read |
| 19 | Legacy dev Sheet empty-email row check still open | L | Jamie | brief |
| 20 | Prefilled links from email (signed token) not built | F | Claude | code; ledger P12 |
| 21 | Popup still opens for waitlist members who arrive from email; enroll buttons still go to the waitlist | F | Aaron, Jamie | code; PR-4 |
| 22 | Receipt hardcodes ladder, $128, Feb 15, Dec 31; event sends `lock_in_date` as UTC (reads Jan 1) | F | Claude (display props), Aaron | handoff decision 4; code |
| 23 | Credits recorded only; lock-in run and Feb 15 billing not built (needed before Dec 31) | F | Claude, Jamie | code; M10 |
| 24 | Jersey "first 100" not counted or numbered (date-only eligibility) | F | Claude | code |
| 25 | Friend Joined and Refunded flows; complete-your-registration (jersey size, address) by about Nov 20 | F | Aaron, Claude | brief; handoff |
| 26 | Weeks 2 to 4 story emails into Klaviyo before about Nov 6 | F | Aaron | KB 14 |
| 27 | No test covers `/season1/dev-view` 404 outside test mode | F | Claude | code |
| 28 | Lint: 9 `no-explicit-any` in 4 old test files | F | Claude | handoff |
| 29 | Stale unserved templates (early-access, old crew and terms html) still carry Jan 1 2027 and "Text Karlin" | F | Claude | code |

Settled, not gaps: the friend ladder ($580, $420, $260, $100, four friends free with the $100 back) matches decision round 2, `offer.ts`, terms and Aaron's current screens; the board's "three covers the season, fourth open" (p4) and "refundable until Jan 1" (p3) are the older 10-26 drafts. The test-mode-only SAMEORIGIN header is correct: live and off send DENY.

## Release path (replaces handoff step 4)

1. Now, alone: push `preview/next-security` to `dev`, check the dev deploy, then `release/next-security` to `main` (security debrief order).
2. Season 01: branch `release/season1-golive` from `season1-commit`, merge `origin/main` in (picks up the security commits), one commit removing `public/roadshow`, `public/ads/season1`, `public/review.html`. Prove with `git diff --quiet release/season1-golive origin/season1-commit -- app lib components db scripts`. Push to `main` on Jamie's go.
3. `dev`: fast-forward to `season1-commit` (keeps the roadshow). Rule added to the runbook: `main` never merges into `dev` directly; it goes through the existing dev-integration branch.

## Outside this session

Meta's $5,000 monthly limit hit about midday 10-28 (raise to at least $6,000 awaits Jamie). Ads keep pointing at the waitlist; the commit path goes into the 11-02 ad batch.
