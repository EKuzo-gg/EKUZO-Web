---
title: "Season 01 analytics: red team resolution (Fable)"
created: 2026-10-30
author: Jamie's Claude (Fable)
status: resolved pending Jamie's answers on P1 to P4; spec 01 is read with these changes
---

# Red team resolution

Three lenses, 41 findings (money 14, privacy 14, ops 13). Each is accepted as written, changed as stated, or parked for Jamie with a default. Spec changes below override `01-requirements.md`.

## Shipped separately

- **Money 1 and 3b (critical): double charge on back plus changed details, and on a new attempt.** Hotfix 09f6f03 (server only), its own release before this build. Sentry verifies on the branch deploy. Ops 9: this build rebases on it and S10 is re-specified against the hotfix's return points.

## Spec changes

| # | Source | Change |
|---|---|---|
| C1 | money 2, ops 2 | S9: drain moves to `POST /api/season1/drain` (Next route, nodejs, `S1_DRAIN_SECRET` header, `drainOutbox({limit:50, budgetMs:8000})`, counts only). A Netlify scheduled function only calls it (cadence: P3). Welcome keeps an order-scoped drain inside `after()` as the fast path, never awaited before render. Must-not text: "within 5 minutes via the schedule". Schedule proven after release; route proven on the branch by curl. |
| C2 | money 3a, 4, 6, 14 | S10 rewritten. Server: the hotfix's attempt-level in-flight return becomes 409 `in_progress` with a fresh view cookie (same inputs as the existing reuse path, money 5); the email-wide in-flight return becomes 409 `in_progress_other` with no cookie and no order data; L386 race returns 503 `attempt_busy`. Client: reuse `s1_attempt` from sessionStorage for the tab and clear it on the welcome paid state; set `s1_confirmed_<attemptId>` just before `confirmPayment`; check `in_progress` before the generic 409 branch; `in_progress` shows copy 2 and `location.replace('/season1/join/welcome')`; `in_progress_other` shows copy 3; `attempt_busy` retries once after 1.5 s; any non-OK, 429 or network error on an attempt with the confirmed flag shows copy 2 and goes to welcome. "Not charged" stays only where nothing can have been confirmed. Busy timer cleared in `setBusy(false)`, `fail()` and pageshow. |
| C3 | money 7, 8, ops 6 | S5/S6 hardening: printable ASCII only; utm_* 160 chars; fbclid and gclid whole up to 512 or dropped, never cut; landing path 128, `/crew/<code>` stored as `/crew/`; whole cookie at most 2048 bytes (drop utm_term first). Commit parses attribution in its own try/catch and stores `{src}` alone on any failure; attribution can never fail or delay a commit and never reaches `quote()` or `decideInvite`. fbp/fbc validated by regex before write and send; prefer the `_fbc` cookie; built fbc uses milliseconds. Order key is `first_touch`, never `origin`. Unit tests: %00, unpaired surrogate, 10 KB cookie, non-JSON, array, nested object, forged lc leaves amount and invite unchanged. |
| C4 | money 9 | Unsent `klaviyo_committed` or `meta_purchase` on a `refunded` order becomes `skipped_refunded`. |
| C5 | money 10 | Purchase guard adds a `s1_px_<ref>` cookie (Path /season1) next to localStorage; value only from server `data-value`. |
| C6 | money 12 | InitiateCheckout `eventID` = sha256(attemptId). |
| C7 | money 13 | R13 evidence: rows reach `sent` with `updated_at` within seconds of payment (no `sent_at` column). |
| C8 | privacy 2, ops 13 | Early-access and all `redirectToBare` pages get no tags; unit test asserts redirect output has no vendor URL. |
| C9 | privacy 3, ops 13 | No Clarity on crew (code in path). GA4 on crew live runs with `allow_google_signals:false, allow_ad_personalization_signals:false`. Pixel stays off crew. |
| C10 | privacy 4, 11 | Address-bar allow list on every Season 01 page, in the head before `{{TAGS}}`: the eight S2 keys plus `src` and `s1qa`; everything else dropped with `replaceState`. Replaces the kid/from strip. Template test: no history call after `{{TAGS}}`. |
| C11 | privacy 5 | Pixel `set autoConfig false` before `init` in every rendering (unit test). Network check: no `SubscribedButtonClick`, `cd[buttonText]` or `ud[` in `facebook.com/tr`. Release checklist: Meta automatic advanced matching stays off (it is off today, scout 8); Google tag automatic user-provided data detection off. |
| C12 | privacy 8, ops 3 | Force-static landing and thanks use the client hostname rule plus QA flag. Renderer treats a missing host as non-live. Live tags need host ekuzo.gg or www AND mode not `test`; mode `off` still measures. |
| C13 | privacy 9, ops 7, 8 | QA mode: `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})` before config, plus the signals flags. Must-not with unit test: a live-host render never contains `debug_mode` or the QA script, flag or no flag. If `/pagead/` still appears in QA, accept it for Sentry's runs only (P4) and record it. |
| C14 | privacy 10 | Welcome GA4 config sets `page_referrer` to the origin; R18 adds a 3DS run checking the referrer carries no client secret. |
| C14b | privacy 13a | Welcome fires the Pixel PageView once per order (the pending state refreshes every 4 s). |
| C15 | ops 1 | Migration 0005 (`alter table s1_orders add column if not exists attribution jsonb`): test DB before the first S6 push; production with read-back of `information_schema.columns` before the push go. Never dropped on rollback. |
| C16 | ops 4 | R1 evidence is the route `GET` output per host (welcome paid state through `welcomeStates.test.ts`), so the welcome placeholder pass cannot erase tags unseen. |
| C17 | ops 5 | S5 runs before middleware's first-touch early return (L33); test: existing `ekuzo_origin` plus utm_campaign writes `ekuzo_lc` and leaves `ekuzo_origin`. |
| C18 | ops 10 | Evidence column follows ops 10: request logs (`/g/collect`, `facebook.com/tr`, `clarity.ms/collect`) prove R2 to R5, R7, R12; Sentry first confirms the vendor scripts load in its browser, else the rows run in Jamie's built-in browser. R6 (dedupe) and the Clarity dashboard move to post-release: proven from the first real order and Meta dataset stats. |
| C19 | ops 11, 12 | Release order: hotfix release; 0005 on test; branch gates; 0005 on production with read-back; `S1_DRAIN_SECRET` pasted by Jamie (Production); go phrase with hashes; push; plugin version from the deploy log; smoke list from ops 11; rollback = Netlify "Publish deploy" on the previous deploy. |

## Parked for Jamie (defaults)

- **P1 Clarity and kid names (privacy 1, 6; Microsoft's FAQ says Clarity "shouldn't be used on any websites/apps targeting users under the age of 18").** The privacy policy (section 16) says analytics partners never receive a child's information; Clarity is Microsoft's. Default: `data-clarity-mask` on the elements that print a kid's name (welcome hero, share button, receipt lines; sign-up invite banner and summary line), so recordings keep layout, taps and scrolls and the name text is blurred; plus the policy disclosure lines (P2). If Jamie prefers names visible, the policy text changes instead and the masks are dropped.
- **P2 Privacy policy lines (privacy 7).** Section 8 adds: "We use Google Analytics, Meta Pixel and Microsoft Clarity (which records how visitors use our pages, with typed entries masked)." Section 16 changes the partners line to: "Advertising and analytics partners receive a parent's hashed email, device and browsing information on our sign-up pages, and purchase information. We never share a child's information with them." Ships with this release.
- **P3 Drain cadence (ops 2).** Default every 2 minutes: Neon stays awake (about 183 of 250 compute hours a month at 0.25 CU) and the cold wake leaves the sign-up path.
- **P4 QA purchases (money 11, privacy 6, ops 8).** Default: QA mode fires PageView and ViewContent normally and sends Purchase and InitiateCheckout as `trackCustom('S1QA_Purchase')` and `trackCustom('S1QA_InitiateCheckout')`, so test buys never count; no new Meta dataset. GA4 Developer traffic filter goes Active after the production smoke (Jamie's go).
- **P5 For Aaron (privacy 12, 13b):** confirm no Klaviyo ad-audience sync uses Committed properties and Klaviyo link UTMs are campaign-level; exclude purchasers (Purchase custom audience) from the Lead ad sets so paid parents stop seeing waitlist ads (his call).
- **P6 California "sharing" notice (privacy 14):** likely under the CPRA thresholds; revisit with growth. No action.
- **P7 `duplicate_kid` alert (money 3c):** follow-up with the Discord commit channel (not configured yet).

## Accepted as written

Money 5 (with its condition, built into C2), money 13 partial sends (Klaviyo and Meta dedupe; Discord may double post), ops 12 (record plugin versions; pin later), ops 13 production also answering on `ekuzo.netlify.app` and deploy permalinks without tags on route pages, privacy 13c and 13d (covered by P2 and C2).
