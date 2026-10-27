# Sentry regression run (after security repairs, commit 1dba0f6), 2026-10-27 UTC

Target https://season1-commit--ekuzo.netlify.app (Stripe TEST, Neon test branch). Deploy gate: `x-frame-options: DENY` seen on the third poll (about 1 minute), so 1dba0f6 was live. Playwright 375x812 iPhone UA, analytics hosts route-aborted. Scripts: /home/claude/sentry/reg/. No successful payments; 13 PaymentIntents created, all canceled (see `pi-status.txt`).

Result: all 8 checks PASS. No new defects (06 notes below are informational).

## 1. Real browser commit after the same-site/JSON guard: PASS
Email team+s1test-reg-zv6st0@ekuzo.gg, kid Ivy 11, consent. `c1.json`, `c1-decline.png`, `c1-3ds-after.png`.
- Card 4000 0000 0000 0002: browser POST /api/season1/commit (content-type application/json) returned **200**, keys `clientSecret, orderId, amountCents, invite`; `invite: "none"`; no `inviteReason` anywhere in the body; response `x-frame-options: DENY`. Stripe confirm 402, inline "Your card has been declined." Page stayed on signup, button re-enabled.
- Same page, card 4000 0027 6000 3184: 3DS challenge frame appeared, Fail clicked, inline "We are unable to authenticate your payment method. Please choose a different payment method and try again." Button re-enabled. The second attempt made no second commit request (reuses the same PI, one commit POST in total).
- PI pi_3UV3KLKORcR8BUEx1TxLXqFs canceled via the Stripe API.
- Console errors during this flow: the two expected Stripe 402s on confirm, and a CSP `img-src 'self'` message raised inside the Stripe test-mode ACS frame (testmode-acs.stripe.com, its own page policy). Neither comes from our pages.

## 2. Old URLs: PASS (D1 of the prior run fixed in the browser)
`b2.json`. Each old URL now returns a 200 interstitial (meta refresh plus `location.replace`, `referrer-policy: no-referrer`, `cache-control: no-store`), not a 301, so the query cannot be re-appended.
| Old URL | Final URL | document.referrer | "Charlie" in HTML |
|---|---|---|---|
| /season1/early-access?kid=Charlie | /season1/join | empty | 0 |
| /season1/early-access/signup?from=Charlie | /season1/join/signup | empty | 2, both the static placeholder (`placeholder="Charlie"` and the JS `n==1?'Charlie':'First name'`); not rendered body text |
| /season1/early-access/saved?kid=Charlie | /season1/join/welcome | empty | 0 |
| /season1/crew?from=Charlie | /season1/join | empty | 0 |
Final URLs are bare, no query. The signup placeholder is the old D2 (minor, still open).

## 3. Headers: PASS (`headers.txt`)
join, signup, welcome, terms, /crew/75701491 all 200 with `x-frame-options: DENY`, `x-content-type-options: nosniff`, `cache-control: private,no-store`. Note the invite page lives at `/crew/<code>` (`/season1/crew/75701491` is a 404 and was not the intended route). The commit API 403 also carries DENY, nosniff, no-store.

## 4. Cross-site and method guards: PASS (`check4.txt`)
- POST commit, `Origin: https://evil.example`, JSON: **403**. Also 403 with `Sec-Fetch-Site: cross-site`, and 403 with `Origin: null`.
- Same origin, `content-type: text/plain`: **415** `{"error":"unsupported_media_type"}`; no content-type: 415.
- GET /api/season1/commit: **405**.
- POST /api/season1/invite/remove with evil origin: 403, no Set-Cookie.

## 5. Invite flow: PASS (`crew.png`, `signup-banner.png`)
/crew/75701491 renders the named page ("An invite from Zoë's family", "Join Zoë's team", friend code 7570 1491) and sets `s1_ref` (HttpOnly, Secure, SameSite=Lax, path /). Signup then shows "Invited by Zoë's family" with the Remove control and the "$0 with Zoë's family credit" line. Remove click: POST /api/season1/invite/remove **200**, cookie cleared, banner gone.

## 6. Welcome cookie handling: PASS
No cookie: generic page ("Your spot is saved", Text Karlin). Random `s1_order` cookie (bad code, bad signature): HTTP 200, text identical to the generic page, no names.

## 7. Rate limit: PASS, with a measurement caveat (`rl-run1.json`, `rl-run2.json`)
The sandbox proxy rotates egress IPs, so consecutive calls can land on different IPs (limiter key is the /48 or IPv4 of the caller as Netlify sees it). Windows are 10-minute epoch buckets; both runs started 20 s after a boundary.
- Run 1: 3 invalid (422), then 6 valid, all 200. Neon `s1_rate_limits` shows the 6 hits split 5 + 1 across two egress IPs, so no single IP reached 6. Inconclusive for the 429, not a failure.
- Run 2: 3 invalid (422), valid-1 to valid-6 all 200, **valid-7 returned 429 `rate_limited`**, then an invalid body again 422. Neon: one IP key count 6 (5 allowed plus the refused 6th from that IP), a second IP key count 1. So the 6th call from one IP is the first refused, and the totals (7 = 7 valid calls) show the 3 plus 1 invalid 422s were not counted (D5 fix confirmed).
- 12 PIs from the two runs, all canceled.

## 8. Browser console on our pages: PASS (`b2.json`)
No error or pageerror on join, signup (with invite banner), crew, welcome (no cookie and random cookie) or terms, other than aborted analytics hosts.

## Informational (not defects)
- I1. Old-URL redirects are now a 200 interstitial, so a no-JS client without meta-refresh support sees only the "Continue" link; the query still appears in the server request line for the old URL (not in any destination). Acceptable.
- I2. D2 placeholder "Charlie" on signup remains.
- I3. Rate-limit proof needs a fixed egress IP; the 429 was shown once after 5 same-IP valid calls. Recheck with a stable IP if wanted.
