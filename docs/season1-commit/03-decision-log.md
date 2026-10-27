# Season 01 commit: decision log (most overrulable first)

| # | When (CT) | Decision | Why | Who | Overrule cost |
|---|---|---|---|---|---|
| D1 | 22:15 | Express Checkout Element (one-tap wallet button above the form) deferred to slice 4; until then wallets show first inside the Payment Element | Apple Pay can't be proven on the unregistered branch domain tonight; saves sync work on sibling changes; M3 still delivered in slice 4 | Lead (from challenger) | Low |
| D2 | 22:15 | Karlin's short link is `/karlin` -> `/season1/join/signup?src=karlin` | Brief asks for an alias he can text; path was free | Lead | Low (redirect) |
| D3 | 22:15 | Stripe Customer found by stored id, then `customers.list({email})`, then created; never Search | Search is eventually consistent; avoids split saved cards at lock-in | Lead (from challenger) | Low |
| D4 | 22:15 | `fulfil` claims the order, runs idempotent steps, then sets `fulfilled_at`; a retry re-runs the steps while `fulfilled_at` is null | A crash after the claim must not leave a paid family without a code | Lead (from challenger, an ops-and-failure finding) | Low |
| D5 | 22:15 | One family code per family enforced by a partial unique index | Concurrent orders could mint two codes | Lead | None |
| D6 | 22:15 | Kept the rate-limit table and the referrals table in 0001 (challenger suggested cutting/moving) | Code lookups (R5) need the table; both were already built; slice 2 can alter by migration | Lead | Low |
| D7 | 22:25 | Alternatives challenger moved out of the build to planning time; no second challenger pass on slice 2 | Jamie, live: it asks whether to build, which belongs before scope locks; tonight's "different way" question had to be parked | Jamie | n/a |
| D8 | 22:15 | Codes are 8 digits (7 random plus Damm), shown `4827 1937`; first digit 1 to 9 | Brief override of the PM scope's 9 digits | Brief | n/a |
| D9 | 22:15 | Unset `S1_COMMIT_MODE` resolves to test when the key is `sk_test_` and the DB is the test endpoint, else off | No Netlify env change needed for the branch; fails closed elsewhere | Lead | Low |
| D10 | 22:15 | Legacy guard skips `product=season1` and PaymentIntents without `parent_email` (also changes Teams installment invoices, which today run as camps with no email) | Brief and architect; the Teams change is a fix | Jamie (approved in scope) | Medium |
| D11 | 23:28 | Welcome renders the Stripe return directly and strips the query with `history.replaceState` (spec said a server 303) | Sentry D1: Netlify re-appended the query to the 303 Location, a redirect loop; GA reads origin + pathname only; Referrer-Policy strict-origin keeps the client secret out of Referer headers | Lead | Low |
| D12 | 23:39 | `refund.failed` flags the order and alerts; it does not restore the status automatically | Restoring needs the prior status per refund; Karlin re-checks by hand with the find script | Lead | Low |
| D13 | 23:39 | Inline outbox drain after the webhook and welcome fulfil sends all pending rows (limit 20, budget 3 to 3.5 s), not only the order's | Friend Joined and flag rows are keyed by referral id; max-age rules stop stale sends | Lead | Low |
| D14 | 00:15 | `next` 16.2.1 and `nanoid` 5.1.9 advisories (pre-existing on dev and production) go to a separate dependency PR before Wednesday's live switch, not into this branch | A framework bump touches every page; mixing it into the Season 01 branch makes review and rollback harder | Lead | Medium |
| D15 | 00:15 | Brand red contrast (white on #F92524, 3.95:1) left as is; proposed to Aaron | Brand color is Aaron's call | Lead | Low |
