---
title: "Season 01 analytics and speed slice: red team, money and fraud lens"
created: 2026-10-30
author: Spec red team (money and fraud)
reviews: 01-requirements.md (draft), 00-scout-map.md
status: findings only; no code or spec edited
---

# Red team: money and fraud

Branch `season1-commit`, read 2026-10-30. Line numbers are in the files named. Severity: critical (a parent can be charged twice or lose a receipt with no alarm), major (wrong money message or a broken commit for some parents), minor (data quality, edge cases).

## 1. Critical: changed details after back cancels a paid order and charges again

- Evidence: `app/api/season1/commit/route.ts` L284-285 retrieves the attempt's PaymentIntent only when `same` (kids and amount unchanged). When anything changed, L309-317 calls `paymentIntents.cancel` (a `succeeded` or card `processing` PI cannot be canceled; the error is logged and ignored at L313-314), then `cancelOrder` marks the order canceled anyway. A new order and PI follow (L349-426). `lib/season1/fulfil.ts` L318-320 later claims the canceled order as paid when the first PI's webhook arrives.
- Scenario: parent pays for Sam, taps back while the payment is processing or just succeeded (before the webhook or welcome fulfils), the form restores (signup.html L305-319), parent adds a sibling and taps pay. The old order is canceled, the duplicate guard (commit L247-248) sees no paid kid, `prior` is 0, so Sam is priced $100 again inside a $180 order. Two charges, Sam twice, only a `duplicate_kid` order flag (fulfil.ts L229), no alert. Same for a name edit or an age change.
- S10 as drafted does not cover this: it changes only L299, inside the `same` branch.
- Resolution (change the spec): S10 retrieves the PI whenever `existing.paymentIntentId` is set, before the same/changed split. `processing` or `succeeded` returns 409 `in_progress` whatever changed. Cancel the order only when Stripe's cancel succeeded or the PI is already `canceled`; if cancel throws, re-retrieve and return `in_progress` when it is `processing` or `succeeded`, else 503. Integration test: back, add sibling, retap with the PI succeeded and the order still pending.

## 2. Critical: removing the welcome drain leaves the webhook as the only automatic sender, and nothing retries

- Evidence: `drainOutbox` callers are the webhook (`stripe-webhook/route.ts` L260), welcome (L108, L128) and the manual `scripts/s1-outbox.mjs`. No scheduled function exists (grep of app, lib, netlify.toml). Stuck recovery (`outbox.ts` L210-213) runs only inside a drain call. Klaviyo rows go stale after 48 h (`outbox.ts` L33).
- Scenarios: (a) the webhook drain hits its 3.5 s budget or its oldest-20 window is full of older failed rows; (b) Klaviyo or Meta returns 429 or 5xx during a send burst (the "Season 01 is open" email); (c) the webhook endpoint is down or misconfigured. Each leaves this order's rows `failed` or `sending` until the next Season 01 Stripe event, which may be hours away. Stripe retries a failing webhook for up to 3 days, past the 48 h Klaviyo cutoff, so the receipt can be lost for good. The must-not "within 5 minutes worst case via stuck recovery" is not true of the code.
- Resolution (change the spec, release gate): add a Netlify scheduled function every 2 minutes that calls `drainOutbox({limit: 50, budgetMs: 8000})`. Ship it with or before S9. `after()` becomes an accelerator only. R13 evidence adds: webhook disabled, rows reach `sent` from the schedule within 5 minutes. If the schedule cannot ship today, keep a welcome drain scoped by `orderId` and moved into `after()`, never awaited before render.

## 3. Major: F15 protects only a bfcache return; a reload or new tab is a new attempt

- Evidence: signup.html L255-257 generates a fresh `attemptId` on every page load and writes `s1_attempt` to sessionStorage but never reads it back. The F15 check is keyed by email plus attempt (`findPendingOrderByAttempt`, db.ts L478-490). The duplicate guard only sees `paid` or `partially_refunded` orders (db.ts L553-560).
- Scenarios: in-app browsers (Instagram, J1, J2) often skip bfcache, so back reloads the page. A full-page 3DS redirect, then back, does the same. A second tab opened while the first is in 3DS gets its own PI too. In each case, if the first PI is `processing`, `succeeded` but not yet fulfilled, or still `requires_action`, the parent can pay twice.
- Resolution (change the spec): (a) read `s1_attempt` on load and reuse it for the tab; clear it on the welcome paid state. The chain logic (commit L146-160) already handles a paid order on the same attempt. (b) Add a server guard before any new PI: another pending order for this email from the last 30 minutes with overlapping kid keys and a PI in `processing` or `succeeded` returns 409 `in_progress` **with no view cookie** (see 5); one in `requires_*` is canceled under the rule in finding 1. (c) Park for Jamie (default yes): `duplicate_kid` at fulfil queues an `ops_alert` so a double charge is refunded the same day.

## 4. Major: "Your card was not charged" can still be false after S10

- Evidence: the reuse retrieve (commit L287) is inside the try, so a Stripe timeout there returns 500 `server` (L437) even when the attempt's PI already succeeded. The client shows "not charged" at L474. The pageshow handler (L524) resets `confirming`, so after a back the catch at L510 also says "not charged". S10's reasoning ("it cannot have confirmed one") covers this call only, not an earlier confirm on the same attempt.
- Resolution (change the spec): set `s1_confirmed_<attemptId>` in sessionStorage just before `confirmPayment`. Then any non-OK commit, network error or 429 on that attempt shows the in-progress line and goes to welcome. The `s1_order` cookie from the first 200 (rules.ts L84, Path /season1) already points at that order, and welcome renders paid, pending or failed. Without the flag, "not charged" is true and stays.

## 5. Accept, with one condition: the F15 view cookie does not widen access

- Evidence: reaching L299 needs email, the browser's random attemptId (122-bit UUID, never in a URL or a response) and the same kid names and ages. The existing reuse path (L288-294) already returns the client secret and a fresh view cookie on exactly those inputs. `issueViewToken` (db.ts L330-337) replaces the earlier token, which only signs out the payer's other tab.
- Condition: any email-wide match (finding 3b) must return `in_progress` with no cookie and no order data. Otherwise anyone who knows a parent's email and a kid's first name could read the order (kid names, share code, receipt). The copy for that case points the parent to the receipt email.

## 6. Major: client order of checks, and what to do for each code

- Evidence: `serverErr` treats every 409 that is not `price_changed`, `duplicate_kid` or `text_karlin` as closed (L465: "Signups are paused", pay hidden). A 409 `in_progress` would land there.
- Client table for the spec:
  - 200: confirm (unchanged).
  - 409 `in_progress`: checked before L465. For a wallet, call `xev.paymentFailed` first; keep the button busy, show the D5 line, then `location.replace('/season1/join/welcome')` so back does not return to a live form.
  - 409 closed, price_changed, duplicate_kid, text_karlin, 422, 429: unchanged, except as in finding 4.
  - 503 from L240 or L329 (limiter failure): nothing can have charged on this call; "not charged" stays, subject to finding 4.
  - 503 from L386 (double-tap race): the other request owns the attempt. The server should return a distinct `attempt_busy`, and the client retries once after 1.5 s with the same attemptId, which lands on the reuse path.
  - 500 `server` and network errors: as in finding 4.
- Tabs opened before the deploy will show "paused" on `in_progress`. That is acceptable: it is not a false "not charged".

## 7. Major: an attribution cookie can break checkout for 30 days

- Evidence: commit `cookieValue` (L80-88) returns the raw header value. The new attribution goes into the same `insertCommitRecords` transaction (commit L349), whose failure is a 500 (L437). Postgres `jsonb` rejects `\u0000` and unpaired surrogates. Next's `cookies.set` percent-encodes JSON. `_fbp`, `_fbc` and `ekuzo_origin` are readable and writable by page script; any client can send any Cookie header.
- Scenarios: a link with `utm_content=%00` sets `ekuzo_lc`, and every later commit from that browser fails with "Something hiccuped" until the cookie expires. A forged or URL-encoded cookie throws in `JSON.parse` the same way. A large cookie makes every order row and request heavier.
- Resolution (change S5 and S6): middleware keeps only printable ASCII per value, 160 chars max, the 8 whitelisted keys, and 1 KB total. The commit parses attribution in its own try/catch (decode, parse, re-whitelist, re-sanitize, `ekuzo_origin` checked against the `originClassifier` enum). On any failure it stores `{src}` alone. Attribution can never fail or delay a commit. Unit tests: `%00`, `\ud800`, a 10 KB cookie, non-JSON, an array, a nested object.
- Price and credits: attribution must stay out of `quote()` (L271) and `decideInvite` (signed `s1_ref` only, L102-113). Never use the key `origin` on an order (outboxLoad.ts L69 and L91 treat `origin` as a request URL). Add a test that a forged `ekuzo_lc` leaves the amount and the invite outcome unchanged.

## 8. Minor: a malformed fbp or fbc could stop the Meta Purchase

- Evidence: `buildPurchaseEvent` passes stored `fbp` and `fbc` as they are (`senders/meta.ts` L39-40). A Graph 4xx makes the row `failed`, and it stops after 5 attempts (`outbox.ts` L25). S6 builds fbc as `fb.1.<lc.ts>.<fbclid>`, and Meta expects milliseconds there.
- Resolution: validate before both write and send (`^fb\.\d\.\d{13}\.\d{1,20}$` for fbp, `^fb\.\d\.\d{13}\.[A-Za-z0-9_-]{1,255}$` for fbc) and drop values that fail. Prefer the `_fbc` cookie over a built one. Confirm in Test Events that Meta accepts the payload.

## 9. Minor: a Committed receipt and a Meta Purchase can go out after a full refund

- Evidence: dispatch allows `refunded` (`outbox.ts` L94). The refund webhook marks the order refunded (`stripe-webhook/route.ts` L149), then drains (L260) oldest first, so an unsent "Committed" goes out just before "Refunded". Without the welcome drain, more rows are still unsent when a quick refund lands.
- Resolution (change the spec): an unsent `klaviyo_committed` or `meta_purchase` on a `refunded` order becomes `skipped_refunded`. `partially_refunded` still sends.

## 10. Minor: Pixel Purchase (S3) is safe on payment truth, but weaker on "once"

- Evidence: the paid state needs DB `paid` or `partially_refunded` (welcome L156), and that is set only by `claimOrder` after Stripe reports `succeeded` (fulfil.ts L276, L318-320). Pending, failed, refunded and canceled render other states, so no Purchase fires for unpaid or refunded orders. The value comes from server `data-value` (welcome L215), which is the same amount as CAPI (`meta.ts` L50). Gaps: the once guard is localStorage only (welcome.html L208-213), so a webview without storage fires on every paid render, and Meta does not promise to dedupe two browser events. A partially refunded order renders paid with the gross value.
- Resolution (accept, plus): add a per-order cookie fallback to the guard (`s1_px_<ref>`, Path /season1). Take the value only from `data-value`, never from client state.

## 11. Minor, park for Jamie: in QA mode the browser Purchase reaches the live dataset

- Evidence: D1 and S1 fire the Pixel with `?s1qa=1`. A browser Pixel has no `test_event_code`, while its CAPI twin does (`buildRequestBody`, scout map section 4). The two never dedupe, so test orders add real Purchase and InitiateCheckout rows, with value, to dataset `1284038230557204`. The dataset already shows branch-deploy hosts (scout map section 8).
- Default: on non-live hosts, Purchase and InitiateCheckout go through `trackCustom('S1QA_Purchase')` or `trackCustom('S1QA_InitiateCheckout')`. PageView and ViewContent fire as normal. R5 and R6 dedupe evidence comes from the first real production order, or from Meta's browser Test Events flow once it is confirmed to stay out of reporting.

## 12. Minor: S3 sends attemptId to Meta, and attemptId is part of the reuse credential

- Evidence: email, attemptId and kid names together return a client secret and a view cookie (commit L288-294). S3 sets the InitiateCheckout `eventID` to the attemptId.
- Resolution (change S3): use `eventID` = sha256(attemptId), or a separate random `ic_` id.

## 13. Minor: `after()` partial sends and the evidence wording

- If Netlify freezes the function partway through `after()`, a row stays `sending`. The schedule from finding 2 recovers it after 5 minutes and resends. Klaviyo dedupes on `unique_id` (the order ref) and Meta on `event_id`, but Discord posts twice. Accept.
- `s1_outbox` has no `sent_at` column (`db/migrations/0001_season1.sql` L111-122). The S9 and R13 proof should read: rows reach status `sent`, with `updated_at` within seconds of the payment.

## 14. Minor: the busy progress line must never outlive an error

- The S11 timer must be cleared in `setBusy(false)`, in `fail()` and in the pageshow handler (L524). Otherwise a "going through" line can appear after a decline or a 4xx and read as a charge. Browser test: a decline at about 1.9 s never shows the line.

## Top three

1. Finding 1: changed details after back cancels a paid order and charges the same kid again. S10 must check the PI before the same/changed split.
2. Finding 2: with the welcome drain gone and no scheduled drain, a lost webhook send has no retry, so a receipt can go stale at 48 h. Ship a 2-minute scheduled drain with S9.
3. Finding 3: F15 is keyed to a per-page-load attemptId, so in-app browser backs and new tabs bypass it. Persist the attempt, and add an email-wide in-progress guard that sets no view cookie.
