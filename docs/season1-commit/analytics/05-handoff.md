---
title: "Season 01 analytics build: handoff (10-30)"
created: 2026-10-30
author: Jamie's Claude (lead)
status: built and verified on the branch deploy; hotfix and analytics releases waiting on Jamie's go
---

# Handoff, 10-30

Read this first in a new session, then `02-resolution.md` (what changed from the spec), the evidence files in `evidence/`, and WORKLOG entries dated 10-30.

## State

- **Live:** ekuzo.gg runs main fa9c510 (10-29). It carries the double-charge bug (money red team 1 and 3) and sends the crew page's family code to Google Ads through the GA4 property's linked Ads destination.
- **Hotfix ready:** `release/season1-hotfix` 082d722 (09f6f03 + merge of origin/main, code-identical to 09f6f03, fast-forward of main) and `preview/season1-dev-hotfix` 8ad0cbe (fast-forward of dev). Sentry PASS on the branch deploy (`evidence/sentry-hotfix.md`). Go phrase: `go: release 082d722 to main and 8ad0cbe to dev`.
- **Analytics build:** on `season1-commit` through 76bf25e (Relay 5cc20fb server; lead 66e310d fbc; Atlas 3403662, 906a9ca, dbf5188, c3974dd, 76bf25e front end). Unit 342/342, integration 373/373 at 3403662 (client-only changes since). Sentry phase 4 PASS except the crew Google Ads leak, fixed in 76bf25e (no tags on crew); targeted re-run in progress.
- **Test DB:** migration 0005 applied. **Production DB:** 0005 applied 10-30 12:3x CT in the Neon SQL editor (production branch br-wild-sky), one transaction; read-back `attribution` jsonb, `s1_migrations` 0001 to 0005. Jamie's go 12:17 ("you have permission to do all that you've proposed").
- **Double-charge check (10-30 12:3x, production, read-only):** 1 live paid order since launch (the 10-29 canary, refunded), 0 `duplicate_kid` flags, 0 emails with 2+ paid orders, 0 canceled-but-paid. No parent was double charged.
- **Privacy policy P2:** sections 8 and 16 updated on season1-commit (Last Updated October 30, 2026).

## Jamie's answers so far (09:38)

D1 to D7 in `01-requirements.md`. Kid data rule updated in `knowledge-base/company/agents/agent-loop/build-loop.md` (10-30).

## Waiting on Jamie

1. Hotfix go (above).
2. ~~Copy OK~~ Approved by Jamie 12:12 ("copy ok"): the four lines as built in signup.html.
3. P1 Clarity kid-name masking (built masked), P3 drain every 2 minutes (built), P4 QA custom event names (built).
4. P2 privacy policy lines (not yet in `app/privacy-policy/page.tsx`): section 8 "We use Google Analytics, Meta Pixel and Microsoft Clarity (which records how visitors use our pages, with typed entries masked)." Section 16 partners line: "Advertising and analytics partners receive a parent's hashed email, IP address, device and browsing information on our Season 01 pages, and purchase information, including how many kids are on the order. We never share a child's name or age with them."
5. Read-only check of live Stripe and production orders for past double charges (not yet approved).
7. Jamie 12:12: exclude purchasers from the Lead ad sets is his call and he agrees; Meta write needs the exact go (custom audience from Purchase, added as an exclusion on the active Lead ad sets; may reset learning).
6. Optional: unlink Google Ads (AW-18509911105) from the GA4 tag; this stops the Ads purchase conversion feed and lets `CREW_GA4` go back on.

## Analytics release steps (after the targeted Sentry re-run passes and Jamie approves 2 to 4)

1. Policy text edit (P2) on season1-commit; test:s1.
2. Production DB, Neon SQL editor in Jamie's browser, with his go:
   ```sql
   begin;
   set local lock_timeout = '3s';
   alter table s1_orders add column if not exists attribution jsonb;
   insert into s1_migrations (name) values ('0005_season1_order_attribution.sql');
   commit;
   select column_name, data_type from information_schema.columns where table_name = 's1_orders' and column_name = 'attribution';
   select name, applied_at from s1_migrations order by name;
   ```
3. Jamie pastes `S1_DRAIN_SECRET` (random, 32+ chars) into Netlify, Production context.
4. Build `release/season1-analytics` = season1-commit + merge origin/main (after the hotfix is on main), prove code-identical, fast-forward, no dev-only files; same for dev. Go phrase with hashes.
5. Smoke (ops red team 11): live tags on join, sign-up, welcome, thanks, landing; none on crew; no `debug_mode` on ekuzo.gg; `ekuzo_lc` Set-Cookie on a utm URL; drain route 401 without the secret; deploy log plugin version.
6. Post-release proofs: Meta browser Pixel and dedupe on the first real order (Events Manager); Clarity recording shows masks; scheduled drain fires (Netlify function log); GA4 Developer traffic filter Active after the smoke (Jamie's go).

## Open, not in this release

- Aaron: in-progress note style, the payment area not looking frozen while busy, two doors and "Ready now?" (from 10-29), exclude purchasers from Lead ad sets, Klaviyo ad-sync check.
- Origin classifier has no email bucket (utm_medium=email gives first_touch "direct").
- InitiateCheckout keeps the first tap's value after `price_changed`.
- 3DS second tab (requires_action) still not blocked by the hotfix.
- Klaviyo fast follow and the rest from `final/08-handoff.md`.

## Release, 10-30

- 12:42 CT, Jamie's go 12:42 ("go: release 6c4f4ff to main and ed9d163 to dev"): pushed main fa9c510..6c4f4ff and dev 842dcd3..ed9d163, both fast-forward. 6c4f4ff is code-identical to season1-commit 7f6d2bf (Sentry re-run PASS at 76bf25e; only the privacy policy text changed since). Carries the double-charge hotfix and the analytics build.
- 12:43:53 CT production deploy live (about 80 s).
- Smoke 12:44 to 12:50 CT, all PASS:
  - 200 on /, /season1, /season1/join, /season1/join/signup, /terms-of-service, /privacy-policy, /faq, /programs, /parents, /blog, /programs/ekuzo-camps, /season1/thanks; /karlin 307 to signup?src=karlin; /roadshow, /review.html, /season1/dev-view 404.
  - Commit API 422 on empty body (open); Season 01 and legacy webhooks 400 unsigned; warm 204; drain 401 without the secret (S1_DRAIN_SECRET is set in Production).
  - Live tags (browser, vendor requests captured and aborted): GA4 + Pixel + Clarity on /season1, join, sign-up, /; GA4 + Clarity on thanks; nothing on crew. dataLayer on /season1, thanks, join: no debug_mode, no denied consent.
  - `ekuzo_lc` Set-Cookie on a utm URL: HttpOnly, Secure, SameSite Lax, 30 days.
  - Privacy policy shows the new section 8 and 16 lines and "October 30, 2026".
  - dev--ekuzo.netlify.app: 0 vendor requests on /, /season1, /season1/join (first probe during the dev deploy switch-over saw the old build).
