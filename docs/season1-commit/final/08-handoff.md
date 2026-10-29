---
title: "Season 01 final build: handoff (10-29 afternoon)"
created: 2026-10-29
author: Jamie's Claude (lead)
status: Season 01 LIVE on ekuzo.gg since 10:01 CT; a fix batch is on season1-commit waiting for release
---

# Handoff, 10-29

Read this first in a new session, then `03-golive-log.md` (every external change with times), `02-decisions.md` (Jamie's calls), `05-defects.md`, `07-speed-report.md`.

## Where things stand

- **Live:** ekuzo.gg runs main `cb10e1c` with `S1_COMMIT_MODE=live` (Production only). Sign-ups open with live Stripe since 10:01 CT. Canary paid 11:27 (order 6be522c6d3) and refunded 12:24; every system recorded both.
- **Rollback:** delete `S1_COMMIT_MODE` in Netlify (Production) and redeploy; pages show "Signups are paused" in about 75 s.
- **Waiting for release on season1-commit:** canary feedback fixes (form saved on back, busy button, season line, card form without Link), wallet row (Apple Pay, Google Pay, then Link) with the draw bug fixed, pre-warm `/api/season1/warm`, commit DB round trips 14 to 6, skeleton removed. Independent check passed (Sentry, 56b3aa0): no critical or major. F11 and F12 minors being fixed now.
- **Before release:** Jamie's phone shows Google Pay on the test site (screenshot the yellow test bar "Wallets:" line); F11/F12 fixed and retested; rebuild `release/season1-golive` from season1-commit plus a merge of origin/main (it already carries the dev-only file removals); verify code-identical and fast-forward; Jamie's exact go in chat ("go: release ..."); push main; dev needs `preview/season1-dev`-style merge (dev is 3bbf217, not an ancestor of season1-commit) then fast-forward dev; smoke production; Jamie's real-phone check on ekuzo.gg.
- **Release mechanics that bit us:** the session's permission check blocks pushes to main without Jamie's exact go in chat; dev cannot fast-forward to season1-commit (needs the integration merge).

## Git evidence (captured 10-29 afternoon)

```
origin/season1-commit 56b3aa0 Season 01 wallet and speed check (Sentry): money path holds; three minor findings
origin/main           cb10e1c Release: drop dev-only public files (roadshow, Season 01 ad images, review page) from the ekuzo.gg release
origin/dev            3bbf217 Merge remote-tracking branch 'origin/dev' into preview/season1-dev
```

Re-run `git log --oneline -1` on each before acting.

## Open decisions for Jamie

1. Neon Launch plan with scale-to-zero off, about $19 to $20 a month (07-speed-report.md). Reason: the free plan's 100 CU-hour cap suspends the database until next month when hit; pre-warm spends hours faster.
2. Netlify Functions region us-east-1 vs Neon us-east-2 (about 60 to 100 ms per commit); needs Netlify Pro. Recommendation: not now.

## Fast follow (not today)

- Klaviyo: list orchestration across tracks; day-2 crew email after payment; "Season 01 is open" send to the ~244 and the offer email inside the nurture; segment "season1_status is set"; Friend Joined and Refunded flows; SBCrTc plain-text part still says 9 to 18 (needs flows:write or the UI).
- Discord commit channel and webhook ($ notification: amount, kid count, source); payload already slimmed in code.
- Aaron: deltas listed in WORKLOG entries of 10-29 (terms box above payment, wallet row styles, season line Jamie approved, timeline Mid Apr and May 6, friend copy, refunded page copy); two doors on /season1 and "Ready now?" on the thanks page are his to ship when ready.
- Complete-your-registration (jersey size and address) by about Nov 20; lock-in run and Feb 15 billing before Dec 31 (credits are recorded only today; Link payers need off-session Link allowed; Link payers have no card fingerprint for the referral check).
- F2: the test deploy loads live GA4 and Google Ads tags; test payments count as conversions.
- Weeks 2 to 4 story emails into Klaviyo before about Nov 6.

## Lessons for the debrief (candidates, need Jamie's yes)

1. Never reload or navigate a browser tab the human may be using (08:40: reloaded Netlify while Jamie had a variable open).
2. A "render gate" on third-party widgets must account for lazy drawing (Stripe draws wallet buttons only when scrolled into view); headless tests cannot see wallets, so a real-device check is a gate, not a nice-to-have.
3. Klaviyo's flow editor only saves while the browser pane is displayed; ask the human to keep the pane open before UI-only vendor work.
4. Check vendor plan limits (Klaviyo active profiles, Neon CU-hours) during the clarity gate, not at go-live.
