# Sentry QA, slice 2 (friend loop), branch deploy (Stripe TEST)

Target: https://season1-commit--ekuzo.netlify.app, live deploy confirmed (signup HTML contains "Remove (no friend credit").
Run 2026-10-26 23:30 to 23:40 CT. Playwright Chromium, 375x812, iPhone UA. Scripts: /home/claude/sentry/ (pre.mjs, j4.mjs,
w2.mjs, rm.mjs, api2.mjs, ga.mjs, ref.mjs). Raw data: `*-result.json` here (client secrets redacted, inviter email masked).

Fail-closed analytics: route-aborted google-analytics.com, googletagmanager.com, clarity.ms, facebook.com, facebook.net in every
context. The only aborted URL was `https://www.googletagmanager.com/gtag/js?id=G-8LM45PX53W` (our own abort). No aborted URL
contained a code, a kid name or the test emails. No facebook request. Console errors from our pages: none, apart from the
`net::ERR_FAILED` for that aborted gtag load. Stripe.js Apple Pay domain warning is the known S1 D3.

Inviter precondition: Neon test, code 75701491 is `type=family`, `status=active`, show_name true; kid Zoë (12) `committed`,
order vw5ecedase `paid`. OK.

## Journey table

| Journey | Result | Evidence |
|---|---|---|
| J4 `/crew/75701491` page | PASS. 200, `cache-control: private,no-store`, `referrer-policy: origin`, `x-robots-tag: noindex`. Page names "Zoë" ("An invite from Zoë's family", "Join Zoë's team · $100"), shows "Friend code 7570 1491". Set-Cookie `s1_ref` signed (`<8 digits>.<hmac>` shape), HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 14 d. `document.cookie` does not show it. Only the Zoë text in HTML is the escaped-safe rendered name | j4-01-crew.png, j4-01-crew-full.png, j4-result.json |
| J4 tap Join | PASS. Lands on `/season1/join/signup` (no query). Banner "Invited by Zoë's family" with "Remove (no friend credit for either family)". Totals "$100" and "Feb 15: $0 with Zoë's family credit, applied at lock-in." Button "Save their spot · $100" | j4-02-signup-banner.png |
| J4 pay (parent Friendparent, kid Mateo 11, 4242, ZIP 78757) | PASS. Ends on `/season1/join/welcome` and the address bar has no query (D11 fix works; slice 1 blocker D1 is closed). URL history: Stripe return with `?payment_intent=...` then `replaceState` to bare path, no loop, no 303 | j4-result.json (urlHistory), j4-05-welcome-full.png (w2 re-render of the Stripe return) |
| J4 welcome content | PASS. "GREAT, MATEO'S IN!", receipt "Mateo, Season 01, first month $100", new code 9592 9969 (link /crew/95929969, differs from 75701491), "Anyone with this link sees Mateo's first name. Share it with families you know." (T2), "Friend credit recorded. It applies at lock-in." (T7), no "Zoë" on the welcome page. The T10 "Came from a friend's link and no credit shows?" line is correctly absent when a credit is recorded (conditional in route.ts) | j4-error.png (top of welcome from the live run), j4-welcome-result.json (full text) |
| J4 backend, Neon | PASS. Order 4q9zg77d8j `paid`, 10000, `referral_code` 75701491, `src` null, family attribution null. Kid Mateo `committed`. Family code 95929969 active. Referral 679f36fb `pending`, `friend_kids` 1, `code` 75701491, inviter family = 31fa55c9 (Zoë's). Outbox `klaviyo_friend_joined:679f36fb...` pending, payload `invited: true`, no code, no `invited_by`. Plus `klaviyo_committed`, `meta_purchase`, `discord_commit`. Flags `shared_card` and `same_zip` raised as expected (same 4242 card and ZIP 78757 as the inviter; flags never block), two `discord_flag` outbox rows. Event `referral.created` | api-result.json, ref.mjs output |
| J4 backend, Stripe | PASS. Exactly one succeeded PI `pi_3UV25wKORcR8BUEx1og8AU4g`, 10000, metadata `{product: season1, order_id: 4q9zg77d8j, offer_version: s1-commit-v1, livemode: false}`, `setup_future_usage=off_session`, one saved 4242 card, customer has only that PI | verify.mjs output |
| J4 webhook | PASS. s1_events `payment_intent.succeeded` (source webhook, evt_3UV25wKORcR8BUEx1cmra7bj) received 04:34:46.101 UTC, `processed_at` 04:34:46.921 UTC (under 1 s). `order.paid` from fulfil 04:34:46.726 | same |
| Remove (new context) | PASS. `/crew/75701491` then join: banner and credit line present. Tap Remove: `POST /api/season1/invite/remove` 200, `Set-Cookie: s1_ref=; Max-Age=0; HttpOnly`, banner and credit line gone, cookie gone from the context. Submit: commit request body carried `inviteRemoved: true`; response (read, not aborted) `invite: "none"`, `inviteReason: "removed"`, `amountCents: 10000`. The client secret was withheld from the page so no confirm happened (0 Stripe confirm calls); PI pi_3UV27cKORcR8BUEx10vKg0bv canceled via the API. Neon: pending order mk2e4b7nyb `referral_code` null, 0 referrals | rm-01-after-remove.png, rm-02-after-commit.png, rm-result.json |
| J13 own code (API) | PASS. Signed cookie for 75701491 plus the inviter family's own email (masked `t***@ekuzo.gg`), sibling Ana 13, expectedCents 8000: 200, `amountCents` 8000, `invite: "ignored"`, `inviteReason: "own_family"`; order du6d9vemk9 pending with `referral_code` null; `invite.ignored` event reason own_family; PI pi_3UV27zKORcR8BUEx0KDrDDyy canceled | api-result.json |
| J9a duplicate (API) | PASS. Friend email plus kid Mateo: 409 `{"error":"duplicate_kid","kidFirstName":"Mateo"}`. Orders for the email stayed 1; the Stripe customer still has only the one PI | api-result.json |
| Nameless, invalid code `/crew/12345678` | PASS. 200, no "Zoë", no code, no s1_ref cookie, T14 line "Invite link not active? You can still join. Text Karlin about credits." No credit promise | pre-result.json |
| Nameless, crawler UA (facebookexternalhit/1.1) on `/crew/75701491` | PASS. 200, no "Zoë" in the HTML, title static, og tags static (title, description, type, site_name; no name). Signed s1_ref still set (T8). It shows "Friend code 7570 1491" (the code is already in the URL) | pre-result.json |
| Static og tags | PASS. Same four og tags for named, invalid and crawler responses | pre-result.json |
| GA privacy | PASS. Exactly one `gtag('config'` call on `/crew/*` (named, invalid, crawler) with `page_location: location.origin+'/crew/'`, and exactly one on signup (`location.origin+location.pathname`). No Meta pixel on crew. Signup HTML with the cookie never contains the code (only `"invite":{"name":"Zoë"}`); `referrer-policy: origin`, `private,no-store` on signup | ga.mjs output |

## Defects

| # | Severity | Type | Defect and repro |
|---|---|---|---|
| D1 | Info | accepted-risk (scheduled) | T5 says `/season1/crew*` 301s to `/crew/` ships in slice 2. Live: `curl -sI "$BASE/season1/crew?from=Charlie"` and `/season1/crew` both return 200 (old static page, still carries the `from` script path). `02d` lists the redirects under slice 4 and run-state says the lead adds them, so treat as pending, not a regression. Recheck at slice 4 |
| D2 | Low | code-bug (recurrence of S1 D5) | First J4 payment attempt: after filling the card, an immediate click on `#go` did nothing visible and no `/api/season1/commit` request fired (Neon: no order for that email, no PI). The retry in a fresh context with a 2.5 s settle before the click worked at once. Silent no-op if a parent taps Pay in the window right after typing the card. Suggest showing a message or waiting when `elements.submit()` has not resolved, and test with a real tap delay |
| D3 | Low | code-bug (copy truth, carried from S1 D2) | Welcome still says "Your receipt is on its way to your inbox." while no sender runs (outbox rows pending, Stripe test mode sends no receipts). Recheck after slice 3 |
| D4 | Info | code-bug (copy) | Crawler or unknown-code variant with a valid code shows "Invite link not active? You can still join." even for a valid code seen by a crawler. Harmless (crawler only, not counted), but the line is only truthful for real invalid codes |
| D5 | Info | accepted-risk (test coverage) | gtag/js is aborted by design, so `gtag('event', ...)` payloads (`season1_invite_view`, `season1_invite_join_tap`, `season1_invite_remove`) and the `page_location` override were verified from the HTML source, not from collect hits. Re-check on the real domain with analytics unblocked |
| D6 | Info | expected | The friend order raised `shared_card` and `same_zip` because the test used the inviter's 4242 card and ZIP 78757; referral stayed `pending` (flags do not block), two `discord_flag` outbox rows pending until slice 3 senders. The inviter code now has three referrals (one void, two pending) from the Relay C and Sentry runs, so `free_reached` and `burst` thresholds were not hit |

No BLOCKER or HIGH defects. Slice 1 blocker D1 (welcome redirect loop) is fixed.

## Counts

Succeeded PaymentIntents this run: 1 (`pi_3UV25wKORcR8BUEx1og8AU4g`, 23:34:44 CT). PIs created: 3 (one succeeded, two canceled via the
API: pi_3UV27cKORcR8BUEx10vKg0bv, pi_3UV27zKORcR8BUEx0KDrDDyy). No refunds. Ledger updated in `06-cleanup-ledger.md`. Browsers
closed, no background processes.
