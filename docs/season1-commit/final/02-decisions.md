---
title: "Season 01 final build: Jamie's decisions (clarity gate)"
created: 2026-10-29
answered: 2026-10-29 07:55 CT, Jamie in chat
---

# Decisions, 10-29 07:55 CT

Numbers match the question batch in the session (gap list: `01-gap-list.md`).

| # | Question | Jamie's answer | What we do |
|---|---|---|---|
| 1 | Security release alone first | "pushed, thanks" | Done by Jamie. Verified 08:00 CT: `main` 4849559, `dev` 1ab7255, both next 16.4.3 |
| 2 | Season dates | "it's the week of ... there's a tournament in mid april, but final week is may 3-6" | Season runs the week of Jan 18, 2027 to May 6, 2027; tournament mid April; final week May 3 to 6. Lock-in stays Dec 31, 2026 |
| 3 | Terms 23.2 and 23.3 wording | "you're good" | 23.2: week of Jan 18 to May 6, 2027. 23.3: "at least two weeks before". Bump `termsVersion` to `s1-terms-2026-10-29` and Last Updated |
| 4 | Ages | "yes" | `ageMax` 17 (18 goes to the out-of-range path). `age_edge` flags 9 only. Backport 9 to 17 to the FAQ canon |
| 5 | Waitlist exit | "board version" | Flow-level filter `season1_status` is not set on W5ciCB. List orchestration in Klaviyo is a known gap, fast follow |
| 6 | Day-2 crew email after payment | "build what aaron has but note it for the klaviyo fast follow" | Launch with Aaron's receipt only. Day-2 crew email goes to the Klaviyo fast follow |
| 7 | Klaviyo at launch | "looks good" | Receipt flow on Committed, W5ciCB flow filter, segment "season1_status is set". Claude in the browser, each read back and logged |
| 8 | Email to the ~244 | "goes into klaviyo fast follow" | No campaign today. "Sign up now" email in the nurture belongs to the Klaviyo fast follow |
| 9 | Discord commit ping | "too much, it'll just be for $$ notification ... # of kids and source (ad, organic, referral etc)"; channel doesn't exist yet | Slim payload: amount, kid count, source category, test tag, order ref. No names, ages or city. Channel and webhook are Klaviyo fast follow; launch without it. **Superseded 2026-10-30 13:17 CT: email and location are now in the message (see the table below)** |
| 10 | Text line | "it doesn't yet exist. i'm good with consent as is" | Keep the current number; no new consent line |
| 11 | Aaron's board items | "no, ship when complete" | Two doors and "Ready now?" do not hold launch |
| 12 | Friend copy and paused crew page | "pay $100 for january, get feb free bc they're joining with a friend, then pay march and april ... sign-ups won't be paused when this is live. i trust your judgement" | Fix the friend's welcome text to: February free, then $160 on Mar 15 and Apr 15. Skip the crew-off change |
| 13 | Netlify access | "give this session access" | Claude opens Netlify (and Stripe, Klaviyo, Neon) in the built-in browser for Jamie to log in, then does the work. Secret values (keys, webhook secrets, database URLs) are still pasted by Jamie |
| 14 | Old test webhooks | "i don't [think] they matter" | Leave them |
| 15 | Timing | "everything goes to production today. we fix emails today. sequencing will go when it should go" | Go live today. Fix live email facts today (SBCrTc ages, receipt dates). Send timing follows the Klaviyo fast follow |

Standing rule from the prompt and brief: production steps on Jamie's go, each read back and logged with the time.

## Klaviyo fast follow (collected from these answers)

- List orchestration: who is in which track, and payers leaving every pre-purchase send
- Day-2 "bring their crew" email after payment (board track 2)
- "Season 01 is open" email to the waitlist, and the offer email inside the nurture
- Discord commit channel and webhook ($ notification: amount, kid count, source)
- Friend Joined and Refunded flows

## Decisions after go-live, 10-29

| Time | Topic | Jamie | What we do |
|---|---|---|---|
| 12:24 | Wallets | "i don't mind using link i just always want to see google or apple if i can ... link is fine if those aren't there, just secondary" | Express Checkout shows Apple Pay and Google Pay first wherever the browser supports them, Link after; card form without Link |
| 12:24 | Speed | "timing always matters ... if we lose even 1 sale because it took too long ... not having a quicker service screws us" | Pre-warm on page load, fewer DB round trips, region check; speed report with a Neon plan recommendation |
| 12:25 | Season line copy | "I approve the copy" | "Season 01 runs mid January to May 6, 2027. Your $100 covers January." stays on sign-up and the join offer card; Jamie shows Aaron |
| 14:40 | Card form when Link is the only wallet | Jamie away; lead's call from his 12:24 rule ("google or apple first ... link ... just secondary") | Card form collapses behind "Or pay with card" only when Apple Pay or Google Pay is reported. Link only (Instagram and Facebook in-app browsers): card form open, Link button above. Jamie can overrule |
| 13:17 (10-30) | Discord commit format | Jamie, 2026-10-30 13:17 CT: the #season01-commits message reads `Season 01 commit \| <n> kid\|kids \| Email: <payer email> \| Location: <City>, <REGION> (time zone: <IANA tz>) \| Source: <source>` | **Replaces decision 9 (10-29)**: email and location are now in the Discord commit, by Jamie's call, in a private team channel. Kid names, ages, phone and amount stay out; `[TEST] ` prefix kept for test rows; referral flag and ops alert formats unchanged. Source is one value, first match wins: referral, karlin, `ad <utm_content>` for a paid last click, `ad <season1_ad_name>` from the parent's Klaviyo profile (with `(via ...)`), email, first-touch bucket, organic. Klaviyo lookup: 1.5 s timeout, never fails the send. |
