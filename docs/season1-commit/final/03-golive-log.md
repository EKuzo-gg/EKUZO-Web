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
