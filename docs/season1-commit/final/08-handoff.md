---
title: "Season 01 final build: handoff (10-29 afternoon)"
created: 2026-10-29
author: Jamie's Claude (lead)
status: Season 01 LIVE on ekuzo.gg since 10:01 CT; fix batch released 16:33 CT (main fa9c510)
---

# Handoff, 10-29

Read this first in a new session, then `03-golive-log.md` (every external change with times), `02-decisions.md` (Jamie's calls), `05-defects.md`, `07-speed-report.md`.

## Where things stand

- **Released 16:33 CT:** main `fa9c510`, dev `3b43ae4` (Jamie's go 16:32). Carries every fix listed below plus the card form behind "Or pay with card" (Link only: open). Neon on "Free + limit increase" ($10 a month, 250 compute hours), production compute fixed at 0.25 CU, scale-to-zero on. Smoke passed 16:40; Jamie's real-phone look on ekuzo.gg pending.
- **Before that:** ekuzo.gg ran main `cb10e1c` with `S1_COMMIT_MODE=live` (Production only). Sign-ups open with live Stripe since 10:01 CT. Canary paid 11:27 (order 6be522c6d3) and refunded 12:24; every system recorded both.
- **Rollback:** delete `S1_COMMIT_MODE` in Netlify (Production) and redeploy; pages show "Signups are paused" in about 75 s.
- **Waiting for release on season1-commit:** canary feedback fixes (form saved on back, busy button, season line, card form without Link), wallet row (Apple Pay, Google Pay, then Link) with the draw bug fixed, pre-warm `/api/season1/warm`, commit DB round trips 14 to 6, skeleton removed. Independent check passed (Sentry, 56b3aa0): no critical or major. F11 and F12 minors being fixed now.
- **Before release:** Jamie's phone shows Google Pay on the test site (screenshot the yellow test bar "Wallets:" line); F11/F12 fixed and retested; rebuild `release/season1-golive` from season1-commit plus a merge of origin/main (it already carries the dev-only file removals); verify code-identical and fast-forward; Jamie's exact go in chat ("go: release ..."); push main; dev needs `preview/season1-dev`-style merge (dev is 3bbf217, not an ancestor of season1-commit) then fast-forward dev; smoke production; Jamie's real-phone check on ekuzo.gg.
- **Release mechanics that bit us:** the session's permission check blocks pushes to main without Jamie's exact go in chat; dev cannot fast-forward to season1-commit (needs the integration merge).

## Git evidence (captured 10-29 afternoon)

```
origin/season1-commit 56b3aa0 Season 01 wallet and speed check (Sentry): money path holds; three minor findings
origin/main           cb10e1c Release: drop dev-only public files (roadshow, Season 01 ad images, review page) from the ekuzo.gg release
origin/dev            3bbf217 Merge remote-tracking branch 'origin/dev' into preview/season1-dev
```

Re-run `git log --oneline -1` on each before acting.

## Open decisions for Jamie

1. ~~Neon plan~~ Settled 16:32: Jamie bought "Free + limit increase" ($10 a month).
2. Netlify Functions region us-east-1 vs Neon us-east-2 (about 60 to 100 ms per commit); needs Netlify Pro. Recommendation: not now.

## Analytics gap (read 10-29 16:50, first build of the next session, before the 11-02 ad batch points at /season1/join)

The Season 01 pages (join, sign-up, crew, welcome) are standalone HTML, so the site layout's Meta Pixel and Clarity never load on them. What exists:
- GA4 G-8LM45PX53W on all four: season1_join_view, season1_signup_view, sibling and invite events, season1_pay_submit, and purchase (transaction_id = order id) on the welcome page. But `page_location` is set to origin + pathname, so utm_* and gclid are stripped and GA4 cannot split by campaign.
- Meta Conversions API Purchase from the server (live; canary sent): hashed email, hashed family id, IP, user agent, event_id = order id. No fbp or fbc, because nothing captures them; no browser Pixel to pair with.
- Order attribution: only `src` from `?src=` (karlin, email, friend, ad, direct), sent to Klaviyo. No UTM campaign or ad id; the first-touch `ekuzo_origin` cookie is set by middleware but not written to the order (outboxLoad reads attribution.origin, commit never writes it).
- Clarity: not on join, sign-up, crew or welcome.

Build (one Build Loop round, small):
1. Meta Pixel on the four pages: PageView; ViewContent on join; InitiateCheckout on sign-up at pay submit; Purchase on welcome with eventID = order id so Meta de-duplicates against the server event.
2. Capture `_fbp`, `_fbc` (or build fbc from fbclid), utm_source/medium/campaign/content/term and `ekuzo_origin` at commit into `s1_families.attribution`; pass fbp/fbc to CAPI; utm_campaign and utm_content to the Klaviyo event.
3. GA4 page_location: keep utm_*, gclid, fbclid; drop every other query parameter (no kid data in URLs).
4. Clarity (wml8wll5ua) on join and sign-up with form fields masked; check the welcome page shows no kid names to Clarity or mask it.
5. Ad URLs for the 11-02 batch: /season1/join?src=ad&utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}.
6. Verify in Meta Events Manager (Test Events) and GA4 DebugView on the branch deploy; F2 (test deploy fires live GA4 and Ads tags) fixed in the same round.

## Speed slice: tap to "You're in" (Jamie 17:24, "probably worth it"; same session as the analytics build)

Jamie: "It felt like a bug when I hit submit and had to wait; I considered hitting back and trying again."

Read 10-29 17:30 from the code:
- **The welcome page waits on sends before it renders.** `app/season1/join/welcome/route.ts` lines 108 and 128 await `drainOutbox({ budgetMs: 3000 })` (Klaviyo receipt event, Meta Purchase, Discord) before the page renders. The Stripe webhook already drains the same outbox (`stripe-webhook/route.ts` 260), so the page can render first and leave the sends to the webhook or to post-response work. Payment truth is unchanged: `fulfilFromReturn` and `fulfil` still check the PaymentIntent with Stripe before "You're in" shows.
- **Declines never reach the welcome page.** Declines and bank (3DS) challenges resolve inside `stripe.confirmPayment` on the sign-up page, so there is nothing to walk back. Do not show "You're in" before Stripe's answer: the receipt, the friend link, Meta Purchase and Klaviyo "committed" all key off real money.
- **Back and retap (defect, call it F15, major for trust).** The same attempt never charges twice: the commit reuses the PaymentIntent, and if it is processing or succeeded it returns `try_again` 503. But `serverErr` shows the generic "Something hiccuped. Your card was not charged." In this case the card may have been charged. Fix: on `try_again`, say the payment is going through and send the parent to the welcome page for that order, which shows paid, pending or failed. A new tab or changed details is a new attempt, and a small double-charge window remains; check it in the red team.
- **The wait looks like a bug.** After about 2 s on the busy button, change the label to a progress line (copy for Jamie or Aaron; load the voice stack).

Measure tap to welcome before and after, on the branch deploy and in GA4 for real parents (the analytics build adds the timing event). Baseline 4.4 s (07-speed-report.md).

## Fast follow (not today)

- Klaviyo: list orchestration across tracks; day-2 crew email after payment; "Season 01 is open" send to the ~244 and the offer email inside the nurture; segment "season1_status is set"; Friend Joined and Refunded flows; SBCrTc plain-text part still says 9 to 18 (needs flows:write or the UI).
- Discord commit channel and webhook ($ notification: amount, kid count, source); payload already slimmed in code.
- Aaron: deltas listed in WORKLOG entries of 10-29 (terms box above payment, wallet row styles, season line Jamie approved, timeline Mid Apr and May 6, friend copy, refunded page copy); two doors on /season1 and "Ready now?" on the thanks page are his to ship when ready.
- Complete-your-registration (jersey size and address) by about Nov 20; lock-in run and Feb 15 billing before Dec 31 (credits are recorded only today; Link payers need off-session Link allowed; Link payers have no card fingerprint for the referral check).
- F2: the test deploy loads live GA4 and Google Ads tags; test payments count as conversions.
- Weeks 2 to 4 story emails into Klaviyo before about Nov 6.

## Lessons for the debrief (candidates, need Jamie's yes)

1. Never reload or navigate a browser tab the human may be using (08:40: reloaded Netlify while Jamie had a variable open).
2. A "render gate" on third-party widgets must account for lazy drawing (Stripe draws wallet buttons only when scrolled into view); headless tests cannot see wallets, so a real-device check is a gate, not a nice-to-have.
3. Klaviyo's flow editor only saves while the browser pane is displayed; ask the human to keep the pane open before UI-only vendor work.
4. Check vendor plan limits (Klaviyo active profiles, Neon CU-hours) during the clarity gate, not at go-live.
