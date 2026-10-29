---
title: "Season 01 go-live: external changes log"
created: 2026-10-29
rule: every change outside the repo, with the time (CT), what was read back, and Jamie's go
---

# External changes, 10-29

Jamie's go for this session: 08:02 CT "I'm ready to go ... i give you permission to do those parts on my behalf" and 08:03 CT "you have full clearance to proceed", following the production-setup block proposed in chat (Neon migrations, Stripe live webhook and settings, Netlify env). Secret values are pasted by Jamie, never by Claude.

| Time (CT) | System | Change | Read back |
|---|---|---|---|
| 07:59 | Neon production branch `br-wild-sky-b4er6sym`, db `ekuzo` | Read-only check: no public tables. Restore point noted 07:59 CT | empty |
| 08:02 | Klaviyo template VkbuB3 (receipt, draft, unattached) | HTML in the code editor: friend-order line ("February is free with your friend's credit. Then $160 on Mar 15 and Apr 15"), timeline "Mid Apr / Season tournament" then "May 6 / Last practice" (was "May / Final tournament"). Plain text updated to match by API | Rendered with invited=true and false: both correct |
| 08:04 | Neon production | Migrations 0001 to 0004 applied in the SQL editor as one transaction (byte-identical to `db/migrations`, SHA-256 prefix fbbdc7f7ebd29fa4), recorded in `s1_migrations` | `s1_migrations` lists 0001, 0002, 0003, 0004 |
| 08:05 | Neon production compute | Scale-to-zero: not changed. The free plan does not allow turning it off | n/a |
| 08:07 | Stripe live | Webhook `we_1UVt2tKORcR8BUEx0892eefO` "Season 01 commit (ekuzo.gg, live)" to `https://ekuzo.gg/api/season1/stripe-webhook`, 6 events (payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, refund.failed, charge.dispute.created, charge.dispute.closed), API version 2022-08-01 (account default, same as the tested test endpoint) | Dashboard: Active, URL, 6 events. Legacy `ekuzo.gg/api/webhooks/stripe` unchanged |
| 08:09 | Stripe live, Settings, Customer emails | Successful payments ON, Refunds ON (both were off; account-wide) | Both switches on |
| 08:10 | Stripe Radar | No change. Risk controls already active (fraudulent card, dispute, early fraud warning). Bot detection needs Radar Pro | n/a |
| 08:10 | Klaviyo VkbuB3 | Multi-kid friend wording aligned with the site: "February is free for your first kid with your friend's credit" | Rendered 2-kid invited: correct |
| 08:12 | Klaviyo template SBCrTc (live waitlist email 2, flow W5ciCB) | HTML: "Gamers 9 to 18" to "9 to 17"; privacy link `/privacy` to `/privacy-policy`. Plain-text part not changed (connector lacks flows:write); it still says 9 to 18 | Editor reloaded: 9 to 17 once, 9 to 18 zero, privacy-policy once |
| 08:13 | Klaviyo flow `WeZfnz` "Season 01 - Committed receipt" | Created as a draft. Trigger and email not saved yet: the flow editor does not save while the browser pane is hidden | API: draft, unconfigured |
| 08:16 | GitHub | Pushed `release/season1-golive` 0e3be2d (season1-commit e1bbe5e + merge of origin/main 4849559 + removal of public/roadshow, public/ads/season1, public/review.html). Code paths identical to season1-commit; fast-forward of main | `git diff --quiet` on app lib components db scripts context next.config package files |
| 08:16 | Knowledge base | FAQ canon: published range 9 to 17 (intro, age answer, alt-ed answer) with a dated note | grep |
| 08:35 | Klaviyo VkbuB3 | Receipt line for multi-kid friend orders: "Then $160 a month from Feb 15, $128 for each sibling, less your friend's credit." One-kid friend line unchanged (Jamie 08:50: one free month, no edge-case explanation on screen) | Rendered 2-kid invited: correct |
| 08:40 | Netlify (Claude) | Reloaded the env page while Jamie had a variable open; told him at once and asked him to re-paste. Lesson for the debrief: never reload or navigate a tab the human is using | n/a |
| 08:50 | Netlify production env (Jamie pasted) | `DATABASE_URL` (Neon production, role ekuzo_owner, password reset by Jamie), `S1_STRIPE_WEBHOOK_SECRET` (live webhook we_1UVt2t), `S1_REF_SECRET` (new random): Production context only | Context filter "Production" lists DATABASE_URL, S1_REF_SECRET, S1_STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Values not read |
| 08:58 | GitHub | `release/season1-golive` rebuilt at b3d3dcf (adds F1 fix 6efd3c7) | code identical to season1-commit; fast-forward of main; 0 dev-only files |
| 09:05 | Klaviyo flow WeZfnz | Built in the UI: trigger metric Season 01 Committed, re-entry allowed, email "Season 01 receipt" (template copied by Klaviyo to UbbkjC from VkbuB3), from Karlin from EKUZO <karlin@ekuzo.gg>, subject "Season 01: you're in", preview "Your receipt, and a link that makes the season cheaper.", Smart Sending off. Turn-on blocked: free plan at 293 of 250 active profiles | API: trigger Metric, message fields as listed |
| 09:11 | Klaviyo billing (Jamie) | Jamie paid for the plan upgrade | Jamie in chat 09:11 |
| 09:14 | Klaviyo flow WeZfnz | Set Live (all actions) | Toast "All configured actions in your flow are now set to Live"; flow header Live |
| 09:15 | GitHub (Claude) | Push of release/season1-golive to main refused by the session's permission check (production deploy needs Jamie's explicit go in chat). Asked Jamie for the exact go or to push from his terminal | n/a |
| 09:18 | Klaviyo flow W5ciCB (waitlist) | Flow profile filter added: season1_status is not set (decision 5, board version) | API: profile_filter existence not-set on properties['season1_status'] |
| 09:43 | GitHub main | Jamie's go 09:43 ("go: push release to main and season1-commit to dev"). Pushed release/season1-golive to main: 4849559..cb10e1c (fast-forward) | origin/main = cb10e1c |
| 09:44 | GitHub dev | dev could not fast-forward to season1-commit (dev had 1ab7255, a WORKLOG-only merge). Built preview/season1-dev = season1-commit + merge of origin/dev (code identical to season1-commit), pushed dev 1ab7255..3bbf217 (fast-forward) | origin/dev = 3bbf217 |
| 09:45 | Netlify production | Deploy of cb10e1c live after about 75 s, S1_COMMIT_MODE unset (off) | /season1/join 200 |
| 09:46 | ekuzo.gg smoke | 200 on /, /season1, /season1/join, /signup, /terms-of-service (Last Updated Oct 29), /faq, /programs, /parents, /blog, /programs/ekuzo-camps. join and signup show "Signups are paused. Text our founder." with X-Frame-Options DENY. Commit API 409 closed. Season 01 webhook rejects unsigned (400 bad_signature); legacy webhook rejects unsigned (400). /karlin 307 to signup?src=karlin. dev-view, roadshow, review.html, ad images 404. Headless Chromium (analytics blocked): no console errors, no horizontal overflow on join, signup (390), home (1440), /season1 (390) | all pass |
| 10:00 | Netlify production env | Jamie's go 09:59 ("go live: set S1_COMMIT_MODE=live and redeploy"). Created S1_COMMIT_MODE = live, Production context only, not secret | Env list: "1 value in 1 deploy context" |
| 10:00 | Netlify production | Triggered deploy of main (cb10e1c) | n/a |
| 10:01 | ekuzo.gg | Live after about 75 s: join shows "Save their spot · $100"; signup config mode live, open true, pk_live; commit API validates (422 on empty body) instead of 409 closed | pass |
| 11:27 | ekuzo.gg live canary (Jamie) | $100 on Android: pi_3UVwAkKORcR8BUEx0HUtTxjq, order 6be522c6d3. Paid via Link (Link autofilled the card form), not Google Pay | Stripe succeeded; Neon production row paid, 10000, livemode true, consent s1-terms-2026-10-29, fulfilled 0.27 s after paid, events fulfil:order.paid and webhook:payment_intent.succeeded; Klaviyo Season 01 Committed event and profile season1_status committed |
| 11:28 | Jamie feedback | (1) form lost on back, (2) Link default and no Google Pay, (3) about 5 s save with no feedback, (4) no season dates near the price | Routed to builder on season1-commit |
| 12:00 | GitHub season1-commit | c4e1afc, f829fc8, ab5275e: form persistence, Express Checkout Element (Apple Pay, Google Pay) above card with Link off, busy button, Server-Timing, season line. 191 of 191 tests | Builder evidence in final/evidence/canary-fix/; independent check running |
