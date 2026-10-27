# Season 01 commit: merged defect log

Auditor merge, 2026-10-27, of Sentry s1, s2, final, a11y, regression, the security review, the Parent review and
auditor findings (AUD-*). Fixes are checked against later evidence. Paths are relative to
`docs/season1-commit/evidence/`. Public repo: no secrets or family data.

Severity: critical = blocks launch or loses money or child data; major = security high or medium, axe serious,
parent major, or an unbuilt Must; minor = low; info = no action. Source ratings are mapped to this scale.
Status: fixed (commit and proof), open (build lane owns it), for Jamie, for Aaron, accepted (with reason).
"Open" counts below include rows routed to Jamie or Aaron, because they are not resolved.

## Summary counts

| | Critical | Major | Minor | Info |
|---|---|---|---|---|
| Open (all routed) | 1 | 11 | 21 | 0 |
| of which for Jamie | 1 | 5 | 8 | 0 |
| of which for Aaron | 0 | 5 | 5 | 0 |
| of which open in the build lane | 0 | 1 | 8 | 0 |
| Fixed and proven | 1 | 4 | 18 | 0 |
| Accepted | 0 | 0 | 3 | 8 |

Open critical: 1 (PR-1: terms page still marked DRAFT; clears when Jamie approves terms, by design).
Open major: 11 (SEC-H1, SEC-M3, PR-2, PR-3, AUD-1 for Jamie; PR-4, PR-5, PR-6, PR-7, A11Y-03 for Aaron; AUD-2 open in the build lane).
No open item is a code defect in the payment path that corrupts money; the two open items nearest to money are
AUD-1 (Express Checkout and Apple Pay recurring request not built) and AUD-2 (dispute handling untested).

## Critical and major

| ID | Source | Sev | Type | Defect | Status | Owner |
|---|---|---|---|---|---|---|
| S1-D1 | Sentry s1 D1 | critical | code-bug | Stripe return to welcome looped: Netlify re-appended the query to the 303 Location | fixed: ece8c16 (decision D11, direct render plus `replaceState`). Proven: sentry-s2/results.md:85, sentry-final/results.md:22 | Lead |
| SF-D1 | Sentry final D1 | major | code-bug | Old-URL 301s kept `?kid=` and `?from=` on Netlify; welcome kept `?kid=` in the address bar | fixed: dc0c115 (browser-side moves, 200 interstitial). Proven: sentry-regression/results.md:14-22 (bare final URLs, empty referrer). Side effect logged as RG-R2 | Lead |
| A11Y-01 | Sentry a11y | major | code-bug (perf) | 10.7 MB coach photo on join and crew; LCP 58.9 s and 5.3 s, 10.8 MB before Stripe.js | fixed: 1d85338. Proven locally: atlas5-repair.txt:18-31 (335 KB join, 411 KB crew). Lighthouse not re-run (AUD-C) | Atlas |
| SEC-M1 | Security review M1 | major | code-bug | Global PI ceiling cheap to exhaust, no alert, IPv6 /64 bucket | fixed: 1dba0f6 (1000/h, /48 bucket, hourly `ops_alert`). Proven: unit only, relay-f-security-fixes.txt:5-18 | Relay F |
| SEC-M2 | Security review M2 | major | code-bug | Commit response leaked `inviteReason` (account-state oracle) | fixed: 1dba0f6. Proven on deploy: sentry-regression/results.md:9 (no `inviteReason`). Residual: price signal and `duplicate_kid` accepted (relay-f-security-fixes.txt:26-27) | Relay F |
| PR-1 | Parent review | critical | decision | Terms page is marked "DRAFT" ("Version ...-draft"); a parent would not pay. Consent is also stored with the draft version id | for Jamie: approve or edit terms, then set the final `terms_version` (parent-review.md:11) | Jamie |
| PR-2 | Parent review | major | decision | Join says "Fully refundable until December 31"; terms §4 refunds $65 once the jersey has shipped (early December, before lock-in) | for Jamie and Karlin: one refund-and-jersey story (team summary item 2) (parent-review.md:12) | Jamie |
| PR-3 | Parent review | major | decision | "Free jersey for the first 100 families" vs "commit before Nov 30"; crew says team designs it, waitlist says gamer tag | for Jamie: pick the jersey rule; Aaron aligns /season1 copy (parent-review.md:13) | Jamie |
| PR-4 | Parent review | major | code-bug / decision | Signup back arrow goes to /season1 (free waitlist); home popup says "WAITLIST OPEN"; "Save their spot" means two things. The popup fix was never built (AUD-B) | for Aaron (parent-review.md:14) | Aaron |
| PR-5 | Parent review | major | decision (copy) | Join page gives no practice nights or length | for Aaron (parent-review.md:15) | Aaron |
| PR-6 | Parent review | major | decision (assets) | Join hero kid image is a glitchy AI image; 2 of 3 coach photos blank | for Aaron (parent-review.md:16) | Aaron |
| PR-7 | Parent review | major | decision (copy) | Nothing says who creates an 11-year-old's game and chat accounts; "no random strangers" only on crew | for Aaron, policy from Jamie (parent-review.md:17) | Aaron |
| SEC-H1 | Security review H1, decision D14 | major | infra-gap | `next` 16.2.1 and `nanoid` 5.1.9 carry critical and high advisories; identical on origin/dev | for Jamie: separate dependency PR before `live` (bump `next` to 16.4.3 or later, `nanoid` to 5.1.16 or later) | Jamie |
| SEC-M3 | Security review M3 | major | code-bug (pre-existing) | Legacy `/api/webhooks/stripe` skips signature verification when its secret is unset or a placeholder | for Jamie: return 500 on missing secret; deliberately left alone (relay-f-security-fixes.txt:129) | Jamie |
| A11Y-03 | Sentry a11y | major | a11y | axe serious `color-contrast`: brand red #F92524 is 3.95:1 on white; also struck $160 2.79, muted grey 4.34 | for Aaron: brand call (decision D15); candidate #D61E1D = 5.17:1 | Aaron |
| AUD-1 | Auditor | major | decision | PM scope M3 (Must) wants Express Checkout above the Payment Element and Apple Pay `recurringPaymentRequest`. Decision D1 deferred them to slice 4; slice 4 did not build them (auditor grep). Wallets render inside the Payment Element only | for Jamie: accept the deferral (team summary lists it) or build before lock-in; needs a real-device Apple Pay check either way | Jamie |
| AUD-2 | Auditor | major | test gap | M7 dispute: `charge.dispute.created` has code (stripe-webhook/route.ts:199-215) but no fixture or test. It flags the order and queues an `ops_alert`; the requirement says flag the family | open: add a signed dispute fixture test; decide order vs family flag | Relay |

## Minor

| ID | Source | Type | Defect | Status | Owner |
|---|---|---|---|---|---|
| S1-D2 | Sentry s1 D2, s2 D3, final D4 | code-bug (copy truth) | Welcome says "Your receipt is on its way to your inbox"; test mode sends none, no Klaviyo receipt flow confirmed | for Jamie: turn on Stripe receipts or confirm Aaron's Committed flow before launch | Jamie, Aaron |
| S1-D3 | Sentry s1 D3 | infra-gap | Stripe.js warns the Apple Pay domain is unregistered on the branch domain | for Jamie: register ekuzo.gg and www.ekuzo.gg (human checkpoint) | Jamie |
| S1-D5 | Sentry s1 D5, s2 D2 | code-bug | First click on Pay right after typing the card can do nothing visible and send no commit request (seen twice, not reproduced after a 2.5 s settle) | open: show a message or wait when `elements.submit()` has not resolved; no fix in evidence (signup.html:281) | Atlas |
| SF-D2 | Sentry final D2, regression R1 | code-bug | Literal "Charlie" is the first-name placeholder in signup HTML and JS | open: change to "First name" | Aaron |
| SF-D3 | Sentry final D3 | infra-gap (intermittent) | Once, three of four redirect Locations pointed at the deploy permalink host | open: not re-tested (sentry-regression/results.md:48-52 does not list it); recheck on ekuzo.gg | Lead |
| AUD-A | Auditor | code-bug | P4 requires 9 and 18 to flag the order `age_edge`; `ageEdge()` is computed (validate.ts:95) but nothing writes the flag. Ages still show in Discord | open | Relay B |
| AUD-B | Auditor | decision | Popup fix (slice 4 scope, "first to cut") not built; suppression through `ekuzo_s1_joined` exists on dev but was never browser-tested | for Jamie: log the cut or schedule; folded into PR-4 for the user-facing symptom | Jamie |
| AUD-C | Auditor | test gap | Lighthouse not re-run after A11Y-01 and A11Y-02 repairs; LCP under 2.5 s unproven | open: re-run on the deploy | Sentry a11y lane |
| AUD-D | Auditor | doc drift | Decision log D3 ("list by email") contradicts RT6 and the code (create per family, key `s1-cust:<family>`); RT9 card plus link vs card-only client; redirects changed from 301 to interstitial with no entry | open: add or correct decision-log entries | Lead |
| AUD-E | Auditor | infra-gap | No runtime kill switch (O1); mode off needs an env change and redeploy; runbook has no rollback steps | for Jamie: add a rollback step to the runbook, decide on a settings row | Jamie |
| AUD-F | Auditor | infra-gap | Eleven succeeded test PIs reached the unguarded dev webhook; cleanup ledger text says "eight" and "nine" in places | for Jamie: check the dev Sheet for empty-email rows; correct the ledger counts | Jamie |
| AUD-G | Auditor | test gap | No tests for: fulfil `duplicate_kid` and `pi_mismatch` flags (RT15, RT16), 20 per email per day, global 300 named renders (TR4), credit-math table (T2), forced outbox failure then retry (I7), stalled-mock timeouts (N7), live-mode fulfil `livemode=true` (O2) | open | Relay |
| AUD-H | Auditor | accepted-risk | Retries are manual (`npm run s1:outbox`); no scheduled retry or Stripe reconciliation (I8 deferred). Klaviyo rows go stale after 48 h | for Jamie: schedule the run daily during launch week | Jamie |
| SEC-L4 | Security review L4 | code-bug | `s1_ref` HMAC fell back to the webhook secret | fixed in code: 1dba0f6 (live requires `S1_REF_SECRET`). Launch step: set it in Production (relay-f-security-fixes.txt:53-59) | Jamie |
| SEC-L6 | Security review L6 | decision | Discord message carried parent first name and the inviter kid's name; decision record lists kid first name, age, city, amount | partly fixed: parent name dropped in 1dba0f6 (outbox.test.ts "Pat" absent); inviter kid name kept. for Jamie: confirm or amend the decision record | Jamie |
| PR-8 | Parent review | code-bug (copy) | Welcome for a two-kid order shows the one-kid friend table prices ($420, $260, $100) | open: make the table depend on kid count or say "first kid" | Atlas |
| PR-9 | Parent review | code-bug (copy) | Signup sibling line strikes through "$100" (should be $160); button "Save Sam's spot · $180" names one kid | open | Atlas |
| PR-10 | Parent review | decision | Terms §4 does not say whether Jan 1 to first practice is refundable | for Jamie (terms edit) | Jamie |
| PR-11 | Parent review | decision (copy) | "Rather pay up front?" names no discount; "You'll confirm how you pay" reads oddly beside auto-charge consent | for Aaron; the pay-up-front discount is an open decision (PM scope §6) | Aaron |
| PR-12 | Parent review | decision (copy) | Text Karlin opens SMS with no prefilled text (e.g. friend code); refunds are by text only | for Aaron | Aaron |
| PR-13 | Parent review | decision (copy) | "Joining through Zoë's link tells us they belong together" suggests anyone with the link can join a team; say placement is vetted | for Aaron (ties to TR1) | Aaron |
| PR-14 | Parent review | decision (copy) | Ages 9 and 18 can pay; say refund if not a fit | for Aaron | Aaron |
| SEC-L11 | Security review L11 | accepted-risk | Unknown-code lookups unthrottled; valid and invalid codes distinguishable | accepted: relay-f-security-fixes.txt:130 (revisit if DB load shows) | Relay F |
| RG-R2 | Sentry regression R2 | accepted-risk | Old URLs are a 200 interstitial, not a 301; old URL with query stays in server request logs. PM scope P1 says 301 | accepted: destination URLs are bare and referrer-empty; log it as a decision (AUD-D) | Lead |
| RG-R3 | Sentry regression R3 | test limitation | Sandbox rotates egress IPs; 429 shown once after 5 same-IP calls | accepted; recheck from a stable IP | Sentry regression lane |

## Fixed and proven (minor and below)

| ID | Source | Defect | Fix and proof |
|---|---|---|---|
| SF-D5 | Sentry final D5 | Every commit call, including 422s, counted against the IP limit | 1dba0f6. Proof: sentry-regression/results.md:39-44 (7 valid calls counted, 422s not) |
| S2-D1 | Sentry s2 D1 | `/season1/crew*` returned 200 instead of redirecting | ae0f7fc, then dc0c115. Proof: sentry-regression/results.md:14-22 |
| S2-D4 | Sentry s2 D4 | "Invite link not active?" line shown to crawlers for valid codes | ae0f7fc. Proof: copy-fidelity.md:50-60 |
| SEC-L1 | Security review L1 | Cross-site text/plain POST reached commit | 1dba0f6. Proof: sentry-regression/results.md:27-31 (403, 415) |
| SEC-L2 | Security review L2 | invite/remove had no origin check | 1dba0f6. Proof: sentry-regression/results.md:31 (403, no Set-Cookie) |
| SEC-L7 | Security review L7 | No frame or nosniff headers | 1dba0f6. Proof: sentry-regression/results.md:24-26 (DENY, nosniff on all five pages and the API) |
| SEC-L3 | Security review L3 | Welcome share link from forwarded headers | 1dba0f6. Proof: httpGuard unit only (relay-f-security-fixes.txt:47-51) |
| SEC-L5 | Security review L5 | Test-DB check was a substring match | 1dba0f6. Proof: units plus manual refusal (relay-f-security-fixes.txt:61-70) |
| SEC-L8 | Security review L8 | No retention for never-paid minors' names and phones | 1dba0f6 (7-day blanking in `s1:sweep`). Proof: synthetic families on test DB, relay-f-security-fixes.txt:85-98 |
| SEC-L9 | Security review L9 | /crew logged raw error message | 1dba0f6. Proof: routeHeaders unit |
| SEC-L10 | Security review L10 | Bare sha256 of email in rate-limit keys | 1dba0f6 (HMAC). Proof: rules units |
| SEC-L12 | Security review L12 | `s1_wtry` cookie flags; unused header read | 1dba0f6. Proof: routeHeaders unit |
| A11Y-02 | Sentry a11y | Stripe.js synchronous in head | 1d85338. Proof: atlas5-repair.txt:33-36 (deferred, not in head) |
| A11Y-04 | Sentry a11y | No `<main>`, content outside landmarks | 1d85338. Proof: atlas5-repair.txt:45-48,67 |
| A11Y-05 | Sentry a11y | Standalone controls under 44 px | 1d85338. Proof: atlas5-repair.txt:56-67 (remaining are inline links, exempt, and the 24 px checkbox with a full-row hit area) |
| A11Y-06 | Sentry a11y | Double announcement, errors not linked to inputs | 1d85338. Proof: atlas5-repair.txt:40-44 |
| A11Y-07 | Sentry a11y | Terms checkbox stretched to 13x134 | 1d85338. Proof: atlas5-repair.txt:41 (24x24) |

A11Y proofs ran on localhost (Atlas), not on the deploy; the regression lane did not re-run axe.

## Accepted (info and test coverage)

| ID | Source | Note | Rationale |
|---|---|---|---|
| S1-D4 | Sentry s1 D4, s2 D5, final D7 | gtag.js blocked by design: GA payloads and `page_location` verified from source and `gtag()` calls, not `collect` hits. Spoofed client-IP header test inconclusive | Recheck on the real domain with analytics unblocked (human checkpoint) |
| S1-D6 | Sentry s1 D6, s2 D6 | Outbox rows pending in slice 1; flags raised on test data by design (same card and ZIP) | Expected; senders landed in slice 3 |
| SF-D6 | Sentry final D6 | Outbox rows store `sent`, not the HTTP status | Observability only; consider a `detail` column |
| SF-D8 | Sentry final D8 | Webhook replay not run on the deploy; welcome after partial refund and real wallets untested | Replay covered by integration (relay-b-tests.txt:22); wallets are human checkpoints |
| RG-I1 | Sentry regression I1 | No-JS clients see only a Continue link on old URLs | Acceptable per regression lane |
| R-ledger | 06-cleanup-ledger.md | Test rows and canceled PIs remain on the Neon test branch | Test branch; cleanup query in the ledger |
| AUD-I | Auditor | Neon test connection string was echoed once into the session log (run-state note) | Test branch; runbook step 10 resets the production role password after the first live check |
| AUD-J | Auditor | Card-only client payment types instead of card plus link (run-state 22:30) | Link bank tab removed on purpose; add to the decision log with AUD-D |
