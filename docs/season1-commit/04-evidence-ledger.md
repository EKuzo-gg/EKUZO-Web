# Season 01 commit: evidence ledger

Auditor pass, 2026-10-27, branch `season1-commit` (head 5e63df0, code at 1dba0f6). Read-only on code; claims below
are checked against the evidence files and, where marked "auditor", against the source or a grep. Public repo:
no secrets or family data here.

Paths are relative to `docs/season1-commit/evidence/` unless they start with another folder. `file:N` is a line,
`file §N` a section. Requirement IDs follow `01-requirements.md`; `/j/` reads as `/crew/`. Trust red-team
resolutions (`02b`, T1 to T15) are written `TR1` to `TR15` here so they do not clash with test requirements T1 to T6.

Result key: pass | fail | partial (some acceptance met, gap named) | not tested (no evidence, reason given) |
human checkpoint (cannot be proven in this environment; listed in section 6).

Lanes. Authors: Chronos (units), Relay A to F (DB, API, fulfil, senders, ops scripts, security fixes), Atlas 1 to 5
(pages), Lead (redirect fix, wiring). Independent verifiers: Sentry s1, s2, final, a11y, regression (browser and curl
on the branch deploy), Security reviewer (code read), Parent (fresh-eyes review), Auditor (this file). "(author)"
after a lane means no independent lane re-proved it.

Suite state: unit `TZ=UTC npm run test:s1` 163 pass, 0 fail (relay-f-security-fixes.txt:134); Neon plus Stripe
test integration suites last run green (relay-b-tests.txt:61-96, relay-c-tests.txt:42-50, relay-f-security-fixes.txt:136-143);
`tsc --noEmit` clean; `next build` passes (relay-f-security-fixes.txt:149).

## 1. Slice 1 Musts (one family pays $100)

| ID | Requirement (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| P1 | Routes join, signup, welcome, /crew/code, terms; old URLs reach new paths with no query; noindex; outside site layout | Sentry final A and B, regression §2 and §3, copy-fidelity P1 rows | sentry-final/results.md:18-20,22; sentry-regression/results.md:14-26; copy-fidelity.md:7,20,30,40 | partial | Sentry final, regression. Routes, noindex, no pixel pass. Old URLs now end on a bare path via a 200 interstitial, not the 301 the requirement states (RG-R2, AUD-4) |
| P2 | `S1_COMMIT_MODE` off / test / live; off: CTAs to /season1 and API 409; test bar; live fails closed off ekuzo.gg | resolveMode units; commit with mode off; closed page on dev server; deploy config shows test | chronos2-tests.txt:156-218; relay-b-tests.txt:60; atlas4-selftest.txt:22; sentry-final/results.md:42 | partial | Chronos (author), Relay B (author), Sentry final. "Off" never run on the deploy (deploy stays in test); live path not exercised |
| P3 | Form fields, wallets above card form, inline aria-live errors, submit disabled until valid | Atlas Playwright; a11y error-region and keyboard checks | atlas-selftest.txt:14-19; sentry-a11y/results.md:38-40; atlas5-repair.txt:33-44 | partial | Atlas (author), Sentry a11y. Fields, errors and mobile `autocomplete="off"` (auditor: signup.html:131) pass. Button is not disabled until valid (errors on submit, focus to first invalid). Wallets sit inside the Payment Element, not above it (see M3) |
| P4 | Ages 9 to 18 plus "Younger or older"; 9 and 18 warn and flag `age_edge`; server rejects other ages | validate units; Sentry J7; adversarial ages 19, 8, "outside" | chronos2-tests.txt:584-616; sentry-s1/results.md:25; sentry-final/results.md:32 | partial | Chronos, Sentry s1, final. Warning, rejection, outside state pass. The `age_edge` order flag is never written (auditor: `ageEdge` computed in validate.ts:95, no consumer in app or lib; AUD-A). Ages still reach Discord |
| P8 | Totals follow kids and code; code shows Feb 15 credit; display equals server quote | Sentry J6a, J4 totals, price_changed, quote units | sentry-s1/results.md:26; sentry-s2/results.md:84; relay-b-tests.txt:26; chronos2-tests.txt:317-355 | pass | Sentry s1, s2; Relay B (author) |
| P9 | Welcome: kid name, share first, receipt, order by HttpOnly cookie, Stripe params removed, `ekuzo_s1_joined`, reload fires no second purchase | Sentry s1 welcome, reload, no-cookie; s2 J4; final B | sentry-s1/results.md:22-24,41; sentry-s2/results.md:85-86; sentry-final/results.md:22,25 | partial | Sentry s1, s2, final. Content, cookies, clean URL, reload pass (query removed in the browser per D11, not a 303). Native share sheet and copy fallback not tested (headless): human checkpoint |
| P11 | Closed states from config; jersey line hidden after cutoff; API 409 | joinPage units (open/close/cutoff boundaries); API 409; closed page on dev | atlas4-selftest.txt:6,22; relay-b-tests.txt:60; chronos2-tests.txt:242-262 | pass | Atlas (author), Chronos (author), Relay B (author). Closed page seen on local dev only, not on the deploy |
| M1 | Versioned offer config; copy and quote render from it | OFFER units; joinPage "ladder and ages come from config"; fidelity strings | chronos2-tests.txt:223-237; atlas4-selftest.txt:6; copy-fidelity.md:8-46 | pass | Chronos (author), Atlas (author), Sentry final B (rendered prices) |
| M2 | Client sends kids and code; server computes amount; tampered amount ignored | quote ignores amount; injected amount fields; expectedCents mismatch | chronos2-tests.txt:342-347; sentry-final/results.md:33-34; relay-b-tests.txt:26 | pass | Sentry final (independent), Chronos, Relay B |
| M3 | Deferred PI with `setup_future_usage=off_session`; Express Checkout above Payment Element; Apple Pay `recurringPaymentRequest`; metadata; idempotency; Customer reused | PI inspection; saved card on Customer; grep for express/recurring | relay-b-tests.txt:21,28-33; sentry-s1/results.md:46; auditor grep: no `expressCheckout` or `recurringPaymentRequest` in app or lib | partial | Sentry s1, Relay B. PI, metadata, saved card, one Customer per family pass. Express Checkout and `recurringPaymentRequest` not built (D1 deferred them to slice 4, then not delivered; AUD-1) |
| M4 | Consent with `terms_version`, time, IP, UA; missing consent rejected | consent false at API; order row inspection | sentry-s1/results.md:28,45; relay-b-tests.txt:173 (consent_xff asserted, money.integration) | pass | Sentry s1. Rejection is 422, not 400. Stored version is the draft id `s1-terms-2026-10-27-draft` (see PR-1) |
| M5 | Jersey eligible if PI created before cutoff and paid within 24 h; `paid_at` | isJerseyEligible and jerseyEligible units; order row | chronos2-tests.txt:267-293; sentry-s1/results.md:45; sentry-final/results.md:23 | pass | Chronos (author), Sentry s1 and final (row values) |
| M8 | No subscription, invoice or off-session charge in v1 code | Auditor grep over lib, app/api, app/season1, app/crew | auditor grep: zero hits for `subscriptions.`, `invoices.`, `off_session: true`; `off_session` appears only in the (f) test at money.integration.test.ts:362 | partial | Auditor. Grep is clean but no committed grep test exists, which the acceptance asks for |
| M9 | Declines and failed 3DS show inline message; order pending; retry works; no side effects | Browser decline, 3DS fail, retry on same PI; integration (d) (e) | sentry-s1/results.md:19,27; sentry-regression/results.md:7-12; relay-b-tests.txt:23-24 | pass | Sentry s1 and regression (independent) |
| R1 | One code per family, 8 digits plus Damm, unique, typos fail | Damm and mint units; concurrent mint; welcome display | chronos2-tests.txt:6-120; relay-db-tests.txt:9-10; sentry-s1/results.md:22 | pass | Chronos, Relay A (author), Sentry s1 (rendered `7570 1491`) |
| D1 | Schema plus refunds and flags; payer apart from guardian; random public id; migrations on empty DB | Migration run on empty DB; no-op rerun; 0003 and 0004 applied | relay-migrate.txt:1-33; relay-b-tests.txt:6; 00-run-state.md (0004 applied by lead) | pass | Relay A (author), Lead. 0001 proven from empty; 0003 and 0004 applied incrementally. Production run is a launch step (section 6) |
| D2 | Separate test and prod DBs; previews test only; rows carry `livemode` | isTestDbUrl and resolveMode units; getSql guard; 0003 drops livemode defaults | relay-f-security-fixes.txt:61-70; security-review.md:47; db/migrations/0003 (auditor: lines 29-32) | partial | Relay F (author), Security reviewer. Guards proven in code and units; no production database exists yet |
| D3 | Kid data minimal: first name, age with date, optional games and nights | Schema and flow review; retention sweep | security-review.md:24,46; relay-f-security-fixes.txt:85-98 | pass | Security reviewer (independent) |
| D4 | Append-only events; Stripe event id unique; duplicate is a no-op | db integration; webhook replay | relay-db-tests.txt:12; relay-b-tests.txt:22,49 | pass | Relay A and B (author); Sentry s1 shows real webhook event row (sentry-s1/results.md:47) |
| D6 | Billing ZIP from payment method plus `x-nf-geo` reading | Order row after test payment | sentry-s1/results.md:45 (billing_zip set); geo column not shown | partial | Sentry s1. ZIP proven; geo capture not shown on any test order |
| I1 | S1 webhook: own secret (500 if missing), signature, event insert, fulfil, 200; DB failure 500 | bad and wrong signature; missing secret; orphan returns 500; real Stripe delivery under 1 s | relay-b-tests.txt:60; sentry-s1/results.md:47; sentry-final/results.md:37; relay-b-tests.txt:24 | pass | Sentry s1 and final (independent), Relay B. refund.failed and dispute branches: see M7 |
| I2 | `fulfil()` shared by webhook and welcome; concurrent calls give one order | 5-way race, return plus webhook | relay-b-tests.txt:21,49 | pass | Relay B (author); Sentry s1/s2 exercised both paths on the deploy |
| I3 | Legacy handler skips `product=season1` and `parent_email`-less PIs; camps, 101, Teams still processed | shouldSkipLegacy units (RT14 set); unsigned legacy POST same as dev | chronos2-tests.txt:131-151; legacyGuard.test.ts:5-37 (auditor); sentry-final/results.md:46; relay-legacy-guard.txt:5-30 | partial | Chronos (author), Sentry final. Predicate proven; no end-to-end legacy fixture on a deployed legacy route; "nothing live relies on parent_email-less PIs" rests on scout-map.md:9 (Teams invoices) |
| I7 | Outbox row per side effect with dedupe; inline try with timeouts; failures stay pending; `s1:outbox` retries | outbox units (28); live drain; rerun idempotent | relay-d-outbox.txt:4-17,29; sentry-final/results.md:24 | partial | Relay D (author), Sentry final. Send, dedupe, max-age, test-isolation proven. A forced failure then retry is not tested; Discord rows only reached `skipped_no_config` |
| N4 | Webhook signatures, env-only secrets, 5 PI per IP per 10 min, honeypot, Radar, escaped text, name rules | Adversarial pass; rate limit run; XSS name; regression guards | sentry-final/results.md:27-40; sentry-regression/results.md:27-31,39-44; security-review.md:34-48 | pass | Sentry final, regression, Security reviewer (all independent). Radar is a launch step (section 6) |
| N6 | Separate keys, secrets, DBs and Discord channels per mode; previews refuse live keys | assertKeyMatchesMode, mode and webhook-env units; other-mode events skipped | chronos2-tests.txt:156-218; relay-b-tests.txt:60; security-review.md:47 | pass | Chronos, Relay (author), Security reviewer. Real production env scoping is a launch step |
| N7 | Inside 10 s; outbound timeouts; payment and DB writes never wait on side effects | Observed latencies; code read | sentry-s2/results.md:89 (webhook 0.8 s); sentry-final/results.md:24 (drain 0.3 s) | partial | Sentry s2, final. No stalled-mock test exists (auditor grep of `__tests__`); timeouts are code-read only |
| N8 | Logs carry order id, never tokens or card data | 122 step lines scanned; stepLine unit; security log review | relay-b-tests.txt:105; security-review.md:45 | pass | Relay B (author), Security reviewer (independent) |
| T1 | `npm test` via node --test runner, resolver hook, current tests included | Full run in two time zones | chronos-tests.txt:1-63 | pass | Chronos (author). 165 tests, 164 pass, 1 skipped (known `ekuzo101-weeks` failure). Full `npm test` not re-run after the last fixes; `test:s1` was (163 pass) |
| T2 | Units: pricing, sibling across orders, credit math (0 to 12 friends), windows, Damm, fulfil idempotency, signatures, legacy, duplicate guard, ages, escaping | Unit and integration suites | chronos2-tests.txt; relay-b-tests.txt:21-22; invite-wiring relay-c-tests.txt:19-26 | partial | Chronos, Relay (author). Only the credit-math table (0 to 12 friend kids, one and two kid inviters) has no direct test; outbox.test.ts:177 covers the ladder cap only |
| T3 | Stripe test E2E: commit, friend, sibling, 3DS, decline, full and partial refund, dispute fixture, off-session 3155 and 3184 | Integration (a) to (i); relay-c (1) (8); browser runs | relay-b-tests.txt:20-27; relay-c-tests.txt:19-26; sentry-s1/results.md:19,27 | partial | Relay B, C (author), Sentry. Everything except the dispute fixture ran (see M7) |
| C11 | Signup adds "Your first name" | Field present and used in E2E | atlas5-repair.txt:40; sentry-final/results.md:21 | pass | Sentry final |
| C12 | Mock card and static Apple Pay replaced by Stripe elements | Payment Element mounts; real payments | atlas-selftest.txt:15; sentry-s1/results.md:19 | pass | Atlas, Sentry s1 |
| C15 | Preview bar removed; Test mode bar in test | Rendered string check | copy-fidelity.md:18,29,39,46 | pass | Atlas (author), Sentry final (test bar seen at results.md:42) |
| C16 | Consent text verbatim | Auditor source read; Parent walkthrough | signup.html:155 (auditor); copy-fidelity.md:41; parent-review.md:11 | pass | Auditor (source), Parent. Text equals the PM scope string with dates filled from config |
| S1-K | `/karlin` goes to signup with `src=karlin` | Browser redirect; order `src` | sentry-s1/results.md:18 | pass | Sentry s1 (307, `s1_orders.src='karlin'`) |
| S1-L | `/season1/terms` renders draft terms so consent link works | GET terms | sentry-s1/results.md:31; sentry-a11y/results.md:16 | pass | Sentry s1, a11y. Page is marked draft by design (PR-1) |

## 2. Slice 2 Musts (friend loop)

| ID | Requirement (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| P5 | Up to 4 kids; fifth shows Text Karlin; later order's first kid is $80 | 5 kids rejected; returning family 8000; text_karlin state | sentry-final/results.md:31; relay-b-tests.txt:26; atlas3-selftest.txt:21 | pass | Sentry final, Relay B (author), Atlas (author) |
| P6 | Duplicate guard: 409, no PI; Text Karlin copy | Browser/API duplicate; integration (6) with 4th hit | sentry-s2/results.md:92; relay-c-tests.txt:24,39; atlas3-selftest.txt:20 | pass | Sentry s2 (independent) |
| P7 | `s1_ref` cookie, "Invited by" banner with Remove, server re-resolve, ignore rules | Sentry J4, Remove, J13; integration (1) to (5) | sentry-s2/results.md:83-91; relay-c-tests.txt:19-23 | pass | Sentry s2. Cookie is 14 days (TR15), banner copy "Invited by {Kid}'s family" (TR1), not the PM scope's 30 days and "Joining" |
| P10 | Invite page shows inviter first name only; unknown or void code nameless; stored markup renders as text | Named and nameless pages; crawler; markup name | sentry-s2/results.md:83,93-95; atlas3-selftest.txt:14-15; security-review.md:36 | pass | Sentry s2, Security reviewer. Markup name proven on signup banner and crew stub; crew page with a real stored markup name not run on the deploy |
| R2 | Referral row and pending credits at fulfil; nothing touches money | Referral/outbox rows after friend payment | sentry-s2/results.md:87; relay-c-tests.txt:37 | pass | Sentry s2. No separate ledger table; credit is derived from `friend_kids` (matches 02b) |
| R3 | Siblings, own codes, already-paid never count; each friend kid counts | Integration (4) (5) (7); API J13 | relay-c-tests.txt:22-25,40; sentry-s2/results.md:91 | pass | Sentry s2 (own code), Relay C (author) |
| R4 | Flags never block: shared card, same ZIP, burst, free_reached, node; each alerts Discord once | computeFlags units; shared_card and same_zip live; outbox rows | chronos2-tests.txt:440-484; relay-c-tests.txt:37,40; sentry-s2/results.md:87,107 | partial | Chronos, Sentry s2. burst, free_reached, node proven in units only; no Discord post sent (no channel) |
| R5 | Code lookups limited to 30 per IP per 10 min; 31st nameless | referral.integration | relay-b-tests.txt:92 | pass | Relay B (author). Not re-run on the deploy |
| C6 | Share link `/crew/{code}`, no `?from`/`?kid`; names from server | Welcome share link; grep for `from=` | sentry-s1/results.md:22,37; atlas2-selftest.txt:6; copy-fidelity.md:20 | pass | Sentry s1, Atlas |
| C14 | Signup banner with Remove | Banner string and Remove POST | atlas3-selftest.txt:6-12; sentry-s2/results.md:84,90 | pass | Sentry s2. Built as "Invited by {Kid}'s family" (TR1), a proposed delta for Aaron |

## 3. Slice 3 Musts (side effects)

| ID | Requirement (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| I4 | Klaviyo Committed and Friend Joined with deterministic `unique_id`; only allowlisted test emails reach Klaviyo | Payload and allowlist units; Klaviyo event seen; profile props | relay-d-outbox.txt:19-23; sentry-final/results.md:24; outbox.test.ts:91-182 (auditor) | pass | Relay D (author), Sentry final (profile `season1_*` seen). Friend Joined and Refunded events not seen in Klaviyo on a `team+s1test` order (relay-d-outbox.txt:25); refunded row was `sent` (sentry-final/results.md:26) |
| I5 | Meta CAPI Purchase: event_id = order id, hashed email, no kid data, test code in test, no refund event | Meta payload units; live send with test code | relay-d-outbox.txt:13; outbox.test.ts:192-229 (auditor) | pass | Relay D (author). Graph API acknowledged `events_received=1`; Events Manager receipt not checked (section 6) |
| I6 | Discord on commit, refund, dispute, flag, failure; no email, phone, address, card; reversal logged | Formatter units; decision log entry; no live post | outbox.test.ts:230-266 (auditor); docs/architecture-decisions.md:33 (auditor); relay-d-outbox.txt:14 | partial | Relay D (author), Security reviewer (L6). Formatting proven; no channel exists so nothing was posted (`skipped_no_config`) |
| A1 | GA4 events with no PII in params | dataLayer recorder; source read | atlas2-selftest.txt:8; sentry-s2/results.md:96; sentry-final/results.md:10-12 | partial | Sentry s2, final. gtag.js was blocked by design, so no DebugView or `collect` hits; events seen as `gtag()` calls only |
| A2 | `purchase` once per order per browser | dataLayer: 1 on welcome, 0 after reload; localStorage key | sentry-final/results.md:10-12,25 | pass | Sentry final. Attempt count measured at `gtag()`, not at network |
| A3 | `page_location` without query; invite pages send `/crew/` without code | Source and dataLayer; query stripped in browser | sentry-s2/results.md:96; atlas2-selftest.txt:6,8; copy-fidelity.md:7 | partial | Sentry s2 (source), Atlas. No `collect` request captured |
| A4 | No Meta pixel on P1 pages | Blocked-request log; source grep | sentry-s1/results.md:38; sentry-final/results.md:7-9; security-review.md:46 | pass | Sentry s1, final, Security reviewer |

## 4. Slice 4 Musts (front door and copy)

| ID | Requirement (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| C1 | "Season 01 is open"; "Spots are limited." | Rendered string | copy-fidelity.md:8-9,21,31 | pass | Atlas (author), Sentry final (results.md:20) |
| C2 | Pay-in-full removed; optional "Rather pay up front?" line | Rendered string; no $522 | copy-fidelity.md:10; sentry-final/results.md:20 | pass | Atlas, Sentry final. Parent flags the line as unclear (PR-11) |
| C3 | Friend row 4; "Four friends make the season free"; "Credits apply at lock-in" | Rendered string on join and crew; welcome source | copy-fidelity.md:11-12,22,32; welcome.html:104,108 (auditor) | pass | Atlas, Sentry final. Welcome row read in source, not in the fidelity table. Parent flags one-kid prices on a two-kid welcome (PR-8) |
| C4 | Refund line with date and "any time we can't place your kid", linked to terms | Rendered string, 2 places on crew | copy-fidelity.md:13,23,33,41 | pass | Atlas, Sentry final. Conflicts with terms jersey rule (PR-2) |
| C5 | Ages read 10 to 17; warning at 9 and 18 | Rendered string; browser warning | copy-fidelity.md:14,24,34,42; sentry-s1/results.md:25 | pass | Atlas, Sentry s1 |
| C7 | Every `sms:` link from config | Anchor targets | copy-fidelity.md:15,25,35,43 | pass | Atlas (author) |
| C8 | Free jersey line only before cutoff, no counter | Rendered string; boundary unit | copy-fidelity.md:16,26,36,44; joinPage.test.ts:27 (auditor) | pass | Atlas (author) |
| C9 | "A team jersey they design together" | Rendered string on crew | copy-fidelity.md:27,37 | pass | Atlas (author). Waitlist page still says gamer tag (PR-3) |
| C10 | "{lock_in_date}: lock-in. Your spot becomes final." | Rendered string; no "Jan 1" | copy-fidelity.md:17,28,38,45; welcome.html:121 (auditor) | pass | Atlas, Sentry final |
| C13 | Welcome receipt summary | Rendered welcome with 1 and 2 kids | sentry-s1/results.md:22; sentry-final/results.md:22; parent-review.md:11 | pass | Sentry s1, final, Parent |
| Popup | Popup fix and `ekuzo_s1_joined` suppression | Diff review; welcome sets key | auditor: no change to `components/ui/SeasonOne*` in `git diff origin/dev...HEAD`; welcome.html:133, route.ts:217 | not tested | No browser test of popup suppression; the "popup fix" itself was not built (cut order says first to cut). Parent saw the home popup still say "WAITLIST OPEN" (PR-4, AUD-B) |

## 5. Slice 5 Musts and Musts outside any slice

| ID | Requirement (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| M6 | `charge.refunded` recorded; full refund voids referrals both ways and the code; partial maps to a kid | Integration (h) and relay-c (8); per-kid refund by script | relay-b-tests.txt:27,58; relay-c-tests.txt:26,41; sentry-final/results.md:26 | partial | Sentry final (independent per-kid refund, Klaviyo Refunded `sent`), Relay B, C. Discord refund post not exercised |
| M7 | `charge.dispute.created` flags the family and alerts Discord | Code read only | auditor: stripe-webhook/route.ts:199-215 flags the order and enqueues `ops_alert`; no fixture or test | not tested | No dispute fixture exists (AUD-2). Code flags the order, not the family |
| N1 | Lighthouse mobile LCP 2.5 s, CLS 0.1, under 500 KB before Stripe.js, Stripe.js on signup only | Lighthouse x2 per page; local transfer after repair | sentry-a11y/results.md:56-68; atlas5-repair.txt:18-31 | partial | Sentry a11y. Before repair LCP failed on all three pages (58.9 s, 10.4 s, 5.3 s) and join/crew sent 10.8 MB. After the repair local transfer is 335 KB and 411 KB and Stripe.js is deferred, but Lighthouse was not re-run (AUD-C). CLS and Stripe-only-on-signup pass |
| N2 | Instagram and Facebook in-app browsers, WhatsApp and iMessage links: card path works, wallets only when available, share and `sms:` fall back | None possible headless | none | human checkpoint | Real devices (section 6) |
| N3 | Labels, focus, 44 px targets, AA contrast, keyboard path; axe no serious issues | axe, keyboard walk, tap-target scan before and after repair | sentry-a11y/results.md:7-52; atlas5-repair.txt:56-67 | partial | Sentry a11y; Atlas re-ran axe locally. Critical none; landmarks, tap targets, errors and checkbox focus fixed. Serious `color-contrast` remains on join, signup, crew (A11Y-03, Aaron's call, D15). Shift+Tab, wallets, screen reader not covered |
| N5 | No kid data to Meta, GA, URLs; inviters never see friend kid names; deletion by hand | Payload units; GA and URL checks; deletion SQL in forced rollback | outbox.test.ts:164,193-205 (auditor); security-review.md:46; sentry-s1/results.md:37; relay-e-scripts.txt:307-308 | pass | Security reviewer (independent), Sentry s1, Relay E |
| T4 | Every journey and must-not has a test or a named human checkpoint | This ledger, sections 7 and 8 | this file | partial | Auditor. Gaps are named; J2, J5, J15, J16 and several must-nots have no test |
| T5 | Visual parity at 375 and 1440 px; copy-fidelity diff | Side-by-side screenshots; 40-row fidelity table | copy-fidelity.md:48; screenshots/join-375-sidebyside.png, join-1440-sidebyside.png; 00-run-state.md (join 375 parity PASS by lead) | partial | Atlas (author), Lead. Join has side-by-side proof; signup, crew, welcome, terms have screenshots only, no recorded parity verdict |
| T6 | Protected surfaces: /season1 and popup, /api/season-one, camps, 101, Teams, legacy webhook | curl against deploy and dev | sentry-final/results.md:43-46 | partial | Sentry final. /season1, /api/season-one, camps register, legacy webhook checked; 101 and Teams registers not checked |
| D5 | Read-only DB role for Claude; daily backups | None; no production DB yet | none | human checkpoint | Neon console (section 6). Not assigned to any slice in 01-requirements.md |

## 6. Human checkpoints

None of these can be proven from this environment. Each needs a named person.

| Checkpoint | Why it matters | Owner | Source |
|---|---|---|---|
| Real-device Apple Pay and Google Pay, one live $100 commit each, then refund | Wallets cannot run headless; unregistered branch domain warns (S1-D3) | Jamie, Karlin | PM scope §7.9, N2 |
| Instagram and Facebook in-app browsers (iOS, Android), links from WhatsApp and iMessage | N2; card path, share fallback, `sms:` fallback, no `window.open` | Jamie, Karlin | N2 |
| Native share sheet and "Link copied" fallback (P9, J16) | Not testable headless | Jamie | P9 |
| Apple Pay domain registration for ekuzo.gg and www.ekuzo.gg | Lock-in charges depend on it | Jamie | PM scope §7.6, S1-D3 |
| Live Stripe keys, live webhook endpoint with 6 events, `S1_STRIPE_WEBHOOK_SECRET` Production only, canary pay and refund | Live path never run; mode `live` untested end to end | Jamie | ops-runbook.md:285-300 |
| `S1_REF_SECRET` set in Production (live refuses the fallback) | Without it invites and rate limits fail in live | Jamie | relay-f-security-fixes.txt:53-59 |
| Production Neon: migrations 0001 to 0004, PITR note, scale-to-zero, region match, read-only role for Claude, daily backups (D5), password reset after first live check | No production DB exists | Jamie | ops-runbook.md:287-298, D2, D5 |
| Stripe receipts: successful-payment and refund emails on, or a Klaviyo receipt flow on `Season 01 Committed` | Welcome says "Your receipt is on its way"; test mode sends none (S1-D2) | Jamie, Aaron | S1-D2, runbook step 6 |
| Radar card-testing rules | Part of N4 | Jamie | runbook step 7 |
| Discord channels `#s1-commits` and `#s1-commits-test`, webhook URLs in env, first post seen | I6 and R4 alerts have never posted | Jamie, Karlin | I6 |
| Meta Events Manager shows the test Purchase under `TEST_S1` | Graph API acked, UI not checked | Jamie | relay-d-outbox.txt:26 |
| GA4 DebugView or `collect` hits per journey on the real domain (A1, A3) | Analytics were blocked in every run | Jamie | S1-D4 |
| Legacy dev endpoint `we_1TMYx4…` side effects: check the dev-context Sheet for empty-email rows, Meta TEST_AUTO events | Eleven succeeded test PIs reached an unguarded handler | Jamie | 06-cleanup-ledger.md, 00-run-state.md |
| List the legacy endpoint's subscribed events; check Klaviyo for camps emails on Oct 1 Teams installments (I3) | Confirms the D10 guard change is a fix only | Jamie | PM scope §7.7 |
| Terms and privacy approval; one refund-and-jersey story; consent version without "-draft" | Money and legal gate (PR-1, PR-2, PR-3) | Jamie, Karlin | PM scope §6 |
| Klaviyo flows: Committed receipt with share link, waitlist suppression filter on `season1_status`, Friend Joined note | Must before the blast; not part of the build | Aaron | PM scope §5 |
| Next.js and nanoid security bump as its own PR before `live` | SEC-H1 (D14) | Jamie | decision log D14 |
| Legacy `/api/webhooks/stripe` returns 500 when its secret is unset | SEC-M3, pre-existing fail-open | Jamie | security-review.md:16 |
| Lighthouse re-run on the deploy after the image and Stripe.js repairs; Shift+Tab, wallet focus, screen reader pass | N1 and N3 remainder | Sentry a11y lane | AUD-C |
| Rate-limit 429 recheck from a stable egress IP | Sandbox rotates IPs (RG-R3) | Sentry regression lane | sentry-regression/results.md:39-44 |
| Google Voice number and season dates into the config | `text_karlin_sms` and windows are placeholders | Karlin | PM scope §6 |

## 7. Journey coverage (T4)

| Journey | Result | Evidence |
|---|---|---|
| J1 card path at 375 | pass | sentry-s1/results.md:21 (failed on D11 redirect loop, fixed); sentry-s2/results.md:85; sentry-final/results.md:21-22 |
| J2 prefilled link | not tested (Should P12 not built) | none |
| J3 Karlin link | pass; Google Pay on Android is a human checkpoint | sentry-s1/results.md:18 |
| J4 friend via invite | pass in Chromium; Instagram in-app browser is a human checkpoint | sentry-s2/results.md:83-90 |
| J5 cold ad visitor | not tested (P15 and A5 not built; popup untested) | none |
| J6a two kids $180 | pass | sentry-s1/results.md:26; sentry-final/results.md:21 |
| J6b third kid later at $80 | pass (integration only, no browser) | relay-b-tests.txt:26 |
| J7 age outside and 9 | pass (age 9 payment and `age_edge` not run) | sentry-s1/results.md:25 |
| J8 refund before lock-in | partial: rows, voids, per-kid map, Klaviyo pass; Discord not posted | relay-b-tests.txt:27; relay-c-tests.txt:26; sentry-final/results.md:26 |
| J9a returning family | pass | sentry-s2/results.md:92 |
| J9b welcome reload | pass | sentry-s1/results.md:23; sentry-final/results.md:22,25 |
| J10 decline, 3DS pass and fail | partial: decline, retry, 3DS fail pass; a successful 3DS challenge not run in a browser | sentry-s1/results.md:19,27; sentry-regression/results.md:7-12; relay-b-tests.txt:24 |
| J11 double tap, back button | partial: one order and one PI proven server side; client tap counters and back-to-welcome not captured | sentry-s1/results.md:20 |
| J12 late webhook or closed tab | pass | relay-b-tests.txt:21; sentry-s1/results.md:47 |
| J13 own link | pass | sentry-s2/results.md:91 |
| J14 after close | pass in units and on dev; not run on the deploy | joinPage.test.ts:33-48; atlas4-selftest.txt:22 |
| J15 leaving the pages | partial: `sms:` and terms links verified; back from signup goes to the waitlist page (PR-4) | copy-fidelity.md:15; parent-review.md:14 |
| J16 desktop share | not tested | none |

## 8. Must-not coverage (T4)

| Must not | Result | Evidence |
|---|---|---|
| PI created: mode off, window closed, duplicate kid, age outside, no consent, honeypot, rate limit; client amount used | pass except window-closed on the deploy | relay-b-tests.txt:60; sentry-final/results.md:27-36; sentry-s2/results.md:92 |
| Card charged twice, on back or reload, or off-session in v1 | partial: one charge per attempt proven; off-session grep clean (M8); back button untested | sentry-s1/results.md:20,46; auditor grep |
| Order paid on `payment_failed`, for non-season1 PI, or twice | pass | relay-b-tests.txt:21-23,60 |
| Legacy side effects for season1 or `parent_email`-less PIs | pass at predicate level | legacyGuard.test.ts:5-37 |
| Klaviyo Committed on load, submit, decline, retry, reload, or non-allowlisted test email | pass | relay-d-outbox.txt:17; outbox.test.ts:91-115; sentry-s1/results.md:45 |
| Klaviyo Friend Joined for sibling, own code, paid family, void code; twice per kid | partial: ignore rules proven at the referral level; the sender was not exercised for those cases | relay-c-tests.txt:22-23; relay-d-outbox.txt:25 |
| Klaviyo Refunded on `refund.failed`, or twice per refund id | partial: sent once on refund; `refund.failed` path not exercised | sentry-final/results.md:26 |
| Meta Purchase from browser, twice, with kid data or phone, for refunds, or without test code | pass | outbox.test.ts:192-229; relay-d-outbox.txt:13,17; sentry-final/results.md:35 (no facebook requests) |
| GA purchase on reload or with PII in params | pass at `gtag()` level | sentry-final/results.md:10-12 |
| GA share tap on load | not tested | none |
| Discord twice per event, with PII, or to live channel in test | partial: formatter and dedupe unit tested; never posted | outbox.test.ts:236-266 |
| Refund recorded for non-season1 charge or twice per refund id | pass | relay-b-tests.txt:60 |
| Credit applied to money in v1, or for siblings or own codes | pass | relay-c-tests.txt:22-23; no charge code (M8) |
| Prefill or autofill into optional fields | pass for autofill (mobile `autocomplete="off"`); prefill not built | auditor: signup.html:131 |

## 9. Money red team resolutions RT1 to RT20 (`02-frozen-spec.md`)

| ID | Resolution (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| RT1 | `processed_at`; duplicate done only when set; fulfil fails once, replay, one order | Orphan 500 then replay; replay no-op | relay-b-tests.txt:22,49,51 | pass | Relay B (author); real webhook row has `processed_at` (sentry-s1/results.md:47) |
| RT2 | Claim, idempotent steps, `fulfilled_at`; rerun if null | Fulfilment completion; D4 rerun | relay-db-tests.txt:8; relay-b-tests.txt:51 | pass | Relay A, B (author) |
| RT3 | `attemptId`; same attempt reuses clientSecret; changed set cancels old PI | Reuse after decline; changed kids cancel old | relay-b-tests.txt:23,26; sentry-regression/results.md:10 | pass | Relay B, Sentry regression (one commit POST for decline then 3DS) |
| RT4 | IP only from `x-nf-client-connection-ip`; 5 per IP, 20 per email per day, global ceiling; 3 failures cancel and flag | 3 declines flag; 5 then 429; ceiling alert unit | relay-b-tests.txt:23,59; sentry-final/results.md:35; relay-f-security-fixes.txt:5-18 | partial | Relay B, Sentry final. 20 per email per day has code only (commit route.ts:45,217), no test. Ceiling raised to 1000/h by M1 |
| RT5 | `expectedCents` mismatch gives 409 `price_changed` before any PI | API and client | relay-b-tests.txt:26,103; sentry-final/results.md:33; atlas-selftest.txt:17 | pass | Sentry final (independent) |
| RT6 | One Stripe Customer per family, idempotency key, no search or legacy reuse | PI/Customer inspection | relay-b-tests.txt:57; sentry-s1/results.md:46; auditor: commit route.ts:376-378 | pass | Sentry s1. Decision log D3 still describes the older "list by email" behavior (AUD-D) |
| RT7 | Guardian rows never overwritten; name and phone on the order | Code read | security-review.md:24 | partial | Security reviewer (code read). No test asserts non-overwrite |
| RT8 | Jersey eligibility in fulfil; `late_confirm`; stale pending sweep | Units; sweep script | rules.test.ts:38-69 (auditor); relay-e-scripts.txt:256-305 | pass | Relay (author) |
| RT9 | PI types card and link; `processing` treated as pending | Card PI; Link tab removed client-side | relay-b-tests.txt:21; 00-run-state.md (22:30 note) | partial | Relay B (author). Client uses card only, not card plus link as written; `processing` path not tested. Not in decision log |
| RT10 | Mode gates PI and signup only; webhook and welcome skip other livemode | Other-mode event skipped | relay-b-tests.txt:60 | pass | Relay B (author) |
| RT11 | View token cookie, hash stored, public id is reference only | Fresh token on second commit; random token generic | relay-b-tests.txt:71; sentry-regression/results.md:36-37; sentry-final/results.md:39 | pass | Sentry final, regression |
| RT12 | Welcome with `payment_intent` and secret fulfils and sets cookie | Browser return | sentry-s2/results.md:85; sentry-final/results.md:22 | pass | Sentry s2, final. Delivered as direct render plus `replaceState` (D11), not a 303 |
| RT13 | Refunds in slice 1: full or partial; refund before fulfil claims as refunded | Integration (h) | relay-b-tests.txt:27,58 | pass | Relay B (author); Sentry final partial refund |
| RT14 | Legacy guard skips unknown product | Units | legacyGuard.test.ts:23-37 | pass | Chronos (author) |
| RT15 | Fulfil flags `duplicate_kid` within 30 days | Code present (fulfil.ts:229) | none | not tested | No test; commit-time guard (P6) is tested |
| RT16 | Fulfil requires amount, currency, order id and livemode match; else `pi_mismatch` | Code present (fulfil.ts:306-312); security read | security-review.md:49 | not tested | Code read only, no mismatch test or fixture |
| RT17 | Live mode needs live keys, non-test DB, secret, `CONTEXT=production`, raw host | resolveMode units | chronos2-tests.txt:193-216; security-review.md:47 | pass | Chronos, Security reviewer. Live never run (section 6) |
| RT18 | Charge, refund, dispute events re-read the PI and record only season1 | Non-season1 skipped with nothing written | relay-b-tests.txt:60; security-review.md:39 | pass | Relay B, Security reviewer |
| RT19 | Express Checkout deferred; `pm_details` recorded | `pm_details` asserted | money.integration.test.ts:210-211 (auditor) | partial | Relay B (author). `pm_details` pass; Express Checkout still deferred (AUD-1) |
| RT20 | `consent_ip` only from the trusted header; raw XFF in `consent_xff` | Asserted in integration | money.integration.test.ts:173 (auditor) | pass | Relay B (author) |

## 10. Trust red team resolutions TR1 to TR15 (`02b-spec-slice2.md`, T1 to T15)

| ID | Resolution (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| TR1 | Referrals never drive placement; banner "Invited by {Kid}'s family" | Banner string; runbook rule | atlas3-selftest.txt:6; ops-runbook.md:173 | pass | Atlas (author). Aaron's call on wording outstanding |
| TR2 | Share-block warning; `show_name` flag; rotate snippet | Welcome string; hide-name and rotate scripts | atlas3-selftest.txt:22; sentry-s2/results.md:86; relay-e-scripts.txt:148-207 | pass | Sentry s2, Relay E |
| TR3 | Vanity is partner-only with display name; no kid names or surnames | Partner create, refusals | relay-e-scripts.txt:124-146; relay-b-tests.txt:94 | pass | Relay E (author) |
| TR4 | Signed `s1_ref`; R5 inside `resolveCode`; per-IP 30 and global 300 named renders | Cookie units; tampered cookie; 31st render | chronos2-tests.txt:366-398; sentry-final/results.md:38; relay-b-tests.txt:92 | partial | Chronos, Sentry final. Global 300/h named-render cap has no test |
| TR5 | `/season1/crew*` redirects, query dropped; clone drops `from` script; one gtag config; no code or name in collect hits | Redirects; grep; source | sentry-regression/results.md:14-22; atlas2-selftest.txt:6; sentry-s2/results.md:96 | partial | Sentry regression. Target is /season1/join (per 02d), not /crew/; collect hits not captured |
| TR6 | Static og tags; crawlers get nameless | Crawler UA run | sentry-s2/results.md:94-95 | pass | Sentry s2 |
| TR7 | Commit reports invite applied or ignored; generic client message | API and UI | sentry-s2/results.md:91; atlas3-selftest.txt:17-19; sentry-regression/results.md:9 | pass | Sentry s2, regression (reason removed from response, M2) |
| TR8 | Rate-limited or crawler still gets signed cookie, no name | Crawler run; 31st render keeps code | sentry-s2/results.md:94; relay-b-tests.txt:92 | pass | Sentry s2 |
| TR9 | Remove posts to server, cookie cleared, `inviteRemoved` wins | Browser Remove; integration (2) | sentry-s2/results.md:90; relay-c-tests.txt:20 | pass | Sentry s2 |
| TR10 | "Friend code" on invite page; welcome fallback line; attach-code script (R6) | Rendered strings; script run | sentry-s2/results.md:83; atlas3-selftest.txt:22; relay-e-scripts.txt:58-83 | pass | Sentry s2, Relay E (author) |
| TR11 | Every commit call counts toward limits; 3 duplicate hits flag; unpaid kids never name | Integration (6); unpaid-family null | relay-c-tests.txt:24; relay-b-tests.txt:90 | pass | Relay C (author). 422s no longer count (D5 fix, sentry-regression/results.md:44) |
| TR12 | Joiner payload `invited: true`; deletion checklist | Payload unit; runbook SQL rollback test | outbox.test.ts:118,164 (auditor); relay-e-scripts.txt:307-308 | pass | Relay D, E (author) |
| TR13 | Inviter name = first committed kid | referral.integration | relay-b-tests.txt:87 | pass | Relay B (author) |
| TR14 | Nameless drops credit promises, adds line | Rendered nameless pages | copy-fidelity.md:32,50-60; sentry-s2/results.md:93 | pass | Sentry s2 |
| TR15 | `s1_ref` Path=/, HttpOnly, 14 days | Set-Cookie inspection | sentry-s2/results.md:83; sentry-regression/results.md:34 | pass | Sentry s2, regression |

## 11. Ops red team items O1 to O15 (`redteam-ops.md`, resolved in `02b`)

| ID | Item (short) | Test or check | Evidence | Result | Verified by |
|---|---|---|---|---|---|
| O1 | Rollback must not break fulfil; DB guard by deploy context; runtime kill switch | Guard in `getSql`; no `s1_settings` kill switch | security-review.md:47; auditor: no `s1_settings` in lib, app, db | partial | Security reviewer. Guard fixed; runtime kill switch not built, off needs an env change and redeploy; runbook has no rollback steps (AUD-E) |
| O2 | `livemode` has no default; required parameter | Migration 0003 | 0003_season1_redteam.sql:29-32 (auditor) | pass | Auditor (source). No live-mode fulfil test |
| O3 | Orphan paid PI: lookup by metadata, backfill, 500 and alert | Integration (c) | relay-b-tests.txt:22,50-51 | pass | Relay B (author) |
| O4 | Per-kid partial refund script and metadata contract; `refund_unattributed` | Script dry run and apply on deploy | relay-e-scripts.txt:2-45; sentry-final/results.md:26 | pass | Sentry final (independent). `refund_unattributed` flag itself not triggered |
| O5 | Live webhook endpoint, 6 events, scoped secret | Launch checklist | ops-runbook.md:294 | human checkpoint | Jamie |
| O6 | Stripe email notifications for Jamie and Karlin | Launch checklist | ops-runbook.md:295 | human checkpoint | Jamie |
| O7 | Overnight visibility: PII-free logs, alerts, hourly Stripe-vs-DB check | Logs and ops_alert rows; no scheduled function | relay-b-tests.txt:105; relay-f-security-fixes.txt:5-18; auditor: no `netlify/` functions | partial | Relay B, F (author). Alerts are outbox `ops_alert` rows; no scheduled reconciliation (I8 and reconciliation job deferred) |
| O8 | Welcome DB error shows pending, then "Text Karlin" | Forced DB refusal | atlas-selftest.txt:13 | pass | Atlas (author) |
| O9 | Refund then rejoin: void code reactivated | Orphan test restores void code | relay-b-tests.txt:51 | pass | Relay B (author) |
| O10 | Launch order and env scoping | Launch checklist | ops-runbook.md:285-300 | human checkpoint | Jamie |
| O11 | Outbox max age; test rows only to allowlist; mark old test rows stale | Units; `--mark-stale-test` run | outbox.test.ts:69-111 (auditor); relay-d-outbox.txt:4-6 | pass | Relay D (author) |
| O12 | Neon cold start, timeout, statement timeout | Code has an 8 s query timeout; Neon settings are launch steps | db.ts:23 (auditor); ops-runbook.md:297 | partial | Relay A (author). Scale-to-zero and region are human steps; no cold-start test |
| O13 | Ops runbook with reviewed snippets and scripts | Script runs, dry-run default, `--live` refusals | relay-e-scripts.txt:2-307; security-review.md:48 | pass | Relay E (author), Security reviewer |
| O14 | Run-scoped test emails; ceilings per livemode | Test tags and emails | relay-db-tests.txt:13; relay-b-tests.txt:28 | pass | Relay (author) |
| O15 | Stale pending sweep; `refund.failed` alerts | Sweep dry-run and apply; `refund.failed` branch is code only | relay-e-scripts.txt:256-305; stripe-webhook/route.ts:199-215 (auditor) | partial | Relay E (author). Sweep proven; `refund.failed` untested, and D12 chose flag and alert over auto-restore |

## 12. Should or Later, not built or only partly built

| ID | Item | Status |
|---|---|---|
| P12 | Prefill `?t=` link | Not built (auditor grep: no prefill code). Journey J2 untested |
| P14 | Welcome chips (games and nights) | Not built |
| P15 | "Ready now? Save their spot" link on /season1 | Not built (Aaron places it) |
| D7 | Sheet mirror | Not built |
| I8 | Scheduled outbox retry every 15 min; prefill backfill for the ~250 | Not built. Retries are manual (`npm run s1:outbox`); Klaviyo rows go stale after 48 h |
| M10 | Lock-in run | Not built (December spec) |
| Checkout Started | Klaviyo/GA abandonment event | Not built (auditor grep) |
| Express Checkout button (D1) | One-tap wallet button above the form and `recurringPaymentRequest` | Not built, deferred by D1; but M3 lists it as a Must (AUD-1) |
| R6 | Karlin attaches a code by script | Built early as `scripts/s1-attach-code.mjs` (relay-e-scripts.txt:58-83); dry run, apply, idempotent |
| P13 | Order `src` | Partial: `karlin` proven (sentry-s1/results.md:18); `email`, `friend`, `ad`, `direct` values not exercised |
| A5 | UTM, `ad`, `site` attribution saved to the family | Not evidenced |

## 13. Totals

Counted over the requirement tables (sections 1 to 5) plus RT, TR and O tables (sections 9 to 11). Journeys and
must-nots (sections 7, 8) and Should/Later (section 12) are not in these counts.

| Result | Rows |
|---|---|
| pass | 82 |
| partial | 34 |
| not tested | 4 (Popup fix, M7, RT15, RT16) |
| human checkpoint | 5 (N2, D5, O5, O6, O10) |
| fail | 0 |
| Total | 125 |

Partial rows each name the missing piece. The 21 checkpoints in section 6 mostly sit inside "partial" rows
(for example M3, P9, I6, A1) or are launch steps with no row of their own.
No row is a straight fail; the failures found during the run (S1-D1, SF-D1) were fixed and re-proved, see
`05-defect-log.md`. The unit suite passes; the open risk is concentrated in four places: legal and copy decisions
(PR-1 to PR-3), the unbuilt Express Checkout (AUD-1), untested dispute handling (AUD-2), and live-only paths that
need real devices and live keys.
