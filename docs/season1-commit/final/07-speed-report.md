# Season 01 sign-up: speed report (2026-10-29)

Jamie, 12:24 CT: "if we lose even 1 sale because it took too long and the parent assumed it was broken, not having a quicker service screws us."

Measured on the branch deploy (Stripe test mode, Neon test branch), Server-Timing on every call. Raw lines: `evidence/speed-wallet/commit-timings.txt` and `evidence/speed-wallet/e2e-prewarm1.json`. "Before" is the f829fc8 code, "after" is 5dfccb7.

## What changed

1. **Pre-warm.** `GET /api/season1/warm` runs `select 1` (at most once per 20 s per function instance; otherwise a no-op 204). The join, crew and sign-up pages fire it once on load without waiting for it (once per 4 min per tab, so join then sign-up is one call), and the sign-up page fires it again when the parent reaches the payment step or taps a wallet button after more than 4 min. No data, no cookies, no analytics, `no-store`.
2. **Fewer round trips.** The commit API went from 14 database round trips to 6 for a new family (5 for a returning family with a Stripe Customer). Same rows and same rules: IP and email limits in one statement (the email still counts only when the IP passed), the four reads in one query, family plus guardian plus kids plus order plus items in one transaction (now all or nothing), PaymentIntent id and view token in one update. Checked against a real Postgres 16 with our migrations as well as the unit tests.

## Timing table

| Case | Before | After |
|---|---|---|
| Commit API, warm function and warm database | 0.77 s seen by the client. Server: 563 ms, database 210 ms over 14 queries, Stripe 343 ms | 0.69 s. Server: 472 ms, database 115 ms over 6 queries, Stripe 350 ms |
| Commit API, cold function and asleep database, nothing warmed it (what every first parent after a quiet spell got) | 2.12 s. Server: 1,484 ms, of which the database wake was 694 ms (1,384 ms in this morning's measurement) and 13 more queries took 333 ms | 2.79 s. Server: 1,561 ms, wake 834 ms, 5 more queries took 221 ms. The wake and the function cold start vary run to run and are bigger than what the round-trip cut saves; this case is what the pre-warm removes |
| Real flow after 6 min idle: open sign-up, fill the form, tap pay (card 4242) | This morning: 5.9 s tap to welcome (two kids), the commit carrying the cold start and a 1.4 s wake | 4.4 s tap to welcome (one kid). The warm call took the cold start and the 825 ms wake while the form was being filled; the commit at the tap had no cold start and no wake: server 780 ms, database 354 ms over 6 queries, Stripe 387 ms |

Where the rest of the 4.4 s goes: about 0.9 s is our commit call, the remaining 3.5 s is Stripe confirming the card and the redirect plus the welcome page render (which itself reads the order and the PaymentIntent). Next candidates, not done here: create the Stripe Customer in parallel with the database transaction (about 150 to 200 ms on a new family), and look at the welcome page's server time.

## Region

The functions run in **us-east-1** (Virginia); the database is in **us-east-2** (Ohio). Source: the warm route's test-mode `x-s1-region` header, which reports the Lambda's `AWS_REGION`. Netlify deploys functions for new sites to Ohio by default; sites created before October 4, 2023 keep their old region ([Netlify docs, Functions region](https://docs.netlify.com/build/functions/optional-configuration/)). For Next.js the region cannot be set in code or in `netlify.toml`: it is the project-level setting **Cloud compute > Functions > Region** in the Netlify UI, available on Pro and Enterprise, applied on the next deploy to every function on the site. No file change made. Every database round trip crosses Virginia to Ohio (warm queries here run about 15 to 19 ms each); moving to Ohio would likely save on the order of 10 ms per round trip, so roughly 60 to 100 ms per commit (an estimate, not measured). Worth doing at a quiet moment; it is a production-wide change, so Jamie's or Aaron's call.

## Neon plan: is turning off scale-to-zero still worth it?

Current pricing ([neon.com/pricing](https://neon.com/pricing), [Neon plans](https://neon.com/docs/introduction/plans), read 2026-10-29):

- **Free:** $0, 100 CU-hours per project per month, scale-to-zero after 5 min and it cannot be turned off. When a project runs out of CU-hours, "your compute is suspended until the next billing period or until you upgrade."
- **Launch:** no monthly minimum, $0.106 per CU-hour, $0.35 per GB-month, scale-to-zero "can be disabled."
- Always on at the smallest size (0.25 CU): 0.25 x 730 h x $0.106 = **about $19.35 a month**, plus storage (cents at our size).

**Recommendation: move the production Neon project to Launch now, and turn scale-to-zero off on its production compute (about $19 to $20 a month at 0.25 CU; set the autoscaling ceiling low, for example 1 CU, so it cannot run away).**

Why, after the pre-warm:
1. The pre-warm hides the wake only when the parent comes through our pages and spends a second or two before paying. It does not cover a parent who leaves a filled form open past 5 minutes and taps a wallet button straight away (the warm fires on that tap, but the wallet sheet may finish first), or a commit that arrives some other way. Off removes those cases entirely.
2. The bigger reason is the Free plan's 100 CU-hour cap. The pre-warm makes every visit to the join page (the ad landing page) wake the database for about 5 minutes. At 0.25 CU that is 400 awake hours a month before the cap; steady ad traffic through a 12-hour day uses about 90 CU-hours, and any autoscaling above 0.25 CU uses it faster. If the cap is hit, sign-ups stop until the next month. Launch removes the cap.
3. $19 a month is less than a fifth of one $100 commitment.

If the production project is already on a paid plan, only the scale-to-zero switch is needed. (Not checked from here: I have no access to the Neon console.)

## What needs a real device

The wallet row, the Google Pay sheet and Link's flow cannot be completed in headless Chromium. See the WORKLOG entry for the list.
