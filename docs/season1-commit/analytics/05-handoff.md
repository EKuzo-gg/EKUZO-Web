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
- **Test DB:** migration 0005 applied. **Production DB:** not yet.

## Jamie's answers so far (09:38)

D1 to D7 in `01-requirements.md`. Kid data rule updated in `knowledge-base/company/agents/agent-loop/build-loop.md` (10-30).

## Waiting on Jamie

1. Hotfix go (above).
2. Copy OK (busy line, two in-progress lines, other-tab line; `03-copy-deck.md` as amended in WORKLOG round 2).
3. P1 Clarity kid-name masking (built masked), P3 drain every 2 minutes (built), P4 QA custom event names (built).
4. P2 privacy policy lines (not yet in `app/privacy-policy/page.tsx`): section 8 "We use Google Analytics, Meta Pixel and Microsoft Clarity (which records how visitors use our pages, with typed entries masked)." Section 16 partners line: "Advertising and analytics partners receive a parent's hashed email, IP address, device and browsing information on our Season 01 pages, and purchase information, including how many kids are on the order. We never share a child's name or age with them."
5. Read-only check of live Stripe and production orders for past double charges (not yet approved).
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
