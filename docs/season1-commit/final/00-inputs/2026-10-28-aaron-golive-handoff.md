# Season 01 funnel: go-live handoff for Jamie

Oct 28, 2026 · @Aaron

## Summary

The Season 01 front end is ready to merge: all four screens and the receipt email pass QA on `season1-commit`, and the branch merges cleanly into `dev` and `main`. **One blocker:** Klaviyo has no flow on the "Season 01 Committed" event, so a paying family would get no receipt. Build that flow first, then follow your own launch order in `docs/season1-commit/ops-runbook.md`.

What Jamie needs to do, in order:

1. Build the Committed receipt flow in Klaviyo (Blockers, below).
2. Answer the four decisions below. None of them block the merge.
3. Merge, run one test purchase on the dev deploy, then follow the runbook's launch order.

## Blockers before live

The webhook already sends "Season 01 Committed" (Klaviyo metric `RK6AMi`, first seen Oct 27 from test orders). No flow listens to it. Klaviyo's only Season 01 flows are "Day 0 Welcome" and "Text Karlin alert". Runbook step 12 expects the Klaviyo email to arrive during the canary, so this must be built before step 11.

- [ ] Create a flow triggered by the metric **Season 01 Committed**, with one email and no delay.
- [ ] Use template **VkbuB3** ("Season 01 v2 · Committed receipt · DRAFT"). Subject idea: "Season 01: you're in"; preview text is already set.
- [ ] Mark the email transactional and submit it for Klaviyo's transactional review. It's a receipt, so it should send to families who haven't opted into marketing.
- [ ] Set the flow live, then send yourself a preview with a real test event before the canary.

The template reads `kid_name`, `sibling_names`, `share_url`, `kids_count`, `amount_paid` and `order_id`. I checked all six against `buildCommittedEvent` in `lib/season1/senders/klaviyo.ts`.

Not blocking, but worth knowing: "Season 01 Friend Joined" (`VvUSwS`) and "Season 01 Refunded" (`X2yJQ8`) also have no flows yet. Inviters won't hear that a friend joined, and refunds send only Stripe's own email.

## Decisions for Jamie

None of these block the merge. Each is in your lane, or it touches a live email Aaron asked to leave alone.

| # | Decision | What it is now | Suggested |
| --- | --- | --- | --- |
| 1 | Age 18 at sign-up | All copy says 9 to 17 (`ageCopyMax: 17`), but the server still accepts 18 (`ageMax: 18`). Picking 18 shows "Season 01 is built for ages 9 to 17. Our founder will check in." | Keep 18 as a soft yes, or set `ageMax: 17` and drop 18 from the age picker |
| 2 | Framing header in test mode | On test-mode deploys only, join, signup, welcome and crew now send `X-Frame-Options: SAMEORIGIN`, so Aaron's Phone preview can frame them. Live and off still send `DENY`; the commit API and terms are unchanged. Code: `pageSecurityHeaders(mode)` in `lib/season1/httpGuard.ts` | Keep. To revert, switch those four routes back to `...SECURITY_HEADERS` |
| 3 | Live day-2 waitlist email | Klaviyo email `SBCrTc` still says "Gamers 9 to 18". Aaron asked not to change the waitlist emails without approval | Change to 9 to 17 when Aaron OKs it |
| 4 | Prices typed into the receipt email | VkbuB3 has fixed values: $580 / $420 / $260 / $100 ladder, $160 a month from Feb 15, $128 a sibling, Dec 31 lock-in. All match `lib/season1/offer.ts` today. The site reads prices and the lock-in date from it; the email can't. "Feb 15" is typed into both | If a price or date changes, edit the email by hand, or later send these values as event properties |

## Go-live steps

`season1-commit` is 102 commits ahead of `dev`, 188 ahead of `main`, and 0 behind either, so it merges with no conflicts.

- [ ] Build the Committed receipt flow (Blockers, above).
- [ ] On the dev deploy, run one full test purchase: [season1/join/signup](https://season1-commit--ekuzo.netlify.app/season1/join/signup), card 4242 4242 4242 4242, any future date and CVC. Check that the confirmation page shows the kid's name, share link and receipt, and that the Klaviyo email arrives. I couldn't pay from my side, so this flow hasn't been run end to end since the redesign.
- [ ] Open a friend's link from that order (`/crew/<code>`), sign up a second kid with it, and check that the friend credit shows on that order's confirmation page.
- [ ] Merge `season1-commit` into `dev`, then `dev` into `main`, per `docs/dev-runbook.md`.
- [ ] Follow the 14-step launch order in `docs/season1-commit/ops-runbook.md` (live keys, migrations, webhook, `S1_COMMIT_MODE=live`, then the $100 canary and refund).
- [ ] After the canary, check that the receipt email shows the right kid name, share link and $100.

## What changed (Oct 27 to 28)

All front-end work stayed in the page templates and `public/`. The only server-side code changes are the framing header (decision 2), the `<!--save-->` markers in `welcome/route.ts`, the one-line headline, and new display tokens in `joinPage.ts` and `offer.ts`. Payment logic and the Stripe flow are unchanged.

| Screen | Route | Changes |
| --- | --- | --- |
| Season page | `/season1/join` | Purple hero with characters, $100 offer card with struck $160, free-jersey strip (tilted sticker on desktop), notched stat cards with hover motion, horizontal friends chart that grows in, timeline, camps-style coach cards, Safe by design without a panel, FAQ with "What game do they play?", sticky "Lock in for $100" bar |
| Sign-up | `/season1/join/signup` | "Season 01 sign up" headline (Season 01 in violet) on a purple ground. Remove any sibling. Ages 9 to 17 with a way back when a kid is out of range. Summary reads "First month ~~$160~~ $100" |
| Confirmation | `/season1/join/welcome` | "Great, Alex's in!" on one line. "Share and save!" card with just the share button. Receipt beside it at the same size on desktop. What happens next below. Discount table on a purple band at the bottom, titled "How this discount works" |
| Friend invite | `/crew/<code>` | "Join Maya's team." ("Join a friend's team." with no name), new intro copy, same look as the season page |
| Receipt email | Klaviyo `VkbuB3` | Same order as the confirmation page, Oswald headlines (the brand's email fallback for Tungsten), discount table at the bottom |
| Site-wide | program pages, FAQ, partner pages | Ages 9 to 17 everywhere |
| Dev only | test-mode bar | Phone / Desktop switch. Phone opens `/season1/dev-view`, which returns 404 outside test mode |

## QA results

Everything passed except the open items listed at the end. Run on Oct 28 against the latest `season1-commit` commit.

| Check | Result |
| --- | --- |
| Unit and route tests (`npm run test:s1`) | 169 of 169 pass |
| Type check (`npx tsc --noEmit`) | Clean |
| Layout: 14 page states at 360, 390, 768, 1024, 1440 and 2560 px | No sideways scrolling, clipped buttons, leftover `{{tokens}}` or broken images |
| Accessibility (axe, WCAG 2 A and AA) at 390 and 1440 px | 0 violations |
| Live dev deploy | All Season 01 routes return 200 with the right framing header. Stripe's card form loads, no console errors. Friends chart animates on scroll. Phone preview works |
| Lint (`eslint`) | 9 errors, all `no-explicit-any` in 4 older test files (`codes`, `outbox`, `pricing`, `validate`). None in product code |

**Design critique (impeccable):** 31/40 on Nielsen's ten heuristics. It reads as authored for EKUZO, not a template: the purple Season 01 world, Tungsten headlines, torn-paper seams, real coaches and kids. On a phone, the price and the sign-up button both show in the first screen. Every dead end now has a way back (age out of range, remove a sibling, Text our founder).

Open items, none blocking:

- P2: button labels vary by page: "Save their spot" (season page, sign-up), "Join Maya's team" (invite), and the sticky bar headline "Lock in for $100". Intentional per context, but worth one look together.
- P2: the four stat cards use the big-number layout impeccable usually flags. Aaron chose to keep it.
- P3: "Text our founder", Terms and Privacy are inline links shorter than 24px. WCAG exempts links inside a sentence.
- P3: at a few widths a paragraph ends on two short words. No line ends on a single word.
- P3: Gmail ignores web fonts, so the email headlines show in Impact there and in Oswald in Apple Mail.

## Where things are

| What | Where |
| --- | --- |
| Branch | `season1-commit` on EKuzo-gg/EKUZO-Web, latest commit `261feba` |
| Change log | `WORKLOG.md`, one Aaron (via Claude) entry per round, Oct 27 to 28 |
| Dev preview | [Season page](https://season1-commit--ekuzo.netlify.app/season1/join) · [Sign-up](https://season1-commit--ekuzo.netlify.app/season1/join/signup). Phone / Desktop switch in the yellow bar |
| Receipt email | Klaviyo template `VkbuB3`, not attached to any flow yet |
| Unused drafts | Klaviyo `ULQsgx` and `SVz4xJ` (v2 waitlist emails Aaron chose not to use). Safe to delete |
| Live waitlist emails | Unchanged on purpose. Day 2 (`SBCrTc`) still says 9 to 18 |
| Screens for review | [Miro: Season 01 Sign-up Funnel](https://miro.com/app/board/uXjVEXVPPT0=/), frame "Season 01 funnel: current screens (Oct 28)" under the green START HERE banner |
| Launch order | `docs/season1-commit/ops-runbook.md`, section "Launch order" |
