# Season 01 commit and invite: review guide for Jamie

Written by the lead at the end of the overnight run (2026-10-26 21:56 to 2026-10-27 about 02:15 CT).
Branch `season1-commit` only; nothing merged. Test mode only; no live money moved.
Branch deploy: https://season1-commit--ekuzo.netlify.app

## 60-second summary

- All four build slices shipped and were proven on the branch deploy, not just in the container:
  1. money path (wizard, server pricing, saved card, consent, webhook, welcome fulfil, legacy guard),
  2. friend loop (`/crew/<code>`, signed invite cookie, referrals, sibling pricing, duplicate guard),
  3. side effects (Klaviyo Committed, Friend Joined and Refunded; Meta Purchase with a forced test code;
     Discord built and waiting for a webhook),
  4. front door and copy (`/season1/join`, old preview URLs moved with names dropped, 40 of 40 copy deltas).
- Slice 5 ran in full: security review, adversarial pass, accessibility and performance pass, a fresh
  Parent review on the deploy, and a regression run after the fixes. Evidence ledger: 125 rows, 82 pass,
  34 partial (each names its gap), 0 fail.
- Open: the terms critical is closed (approved and installed 2026-10-27). A short list of
  decisions and live-only checks below. No open defect touches how money is charged or recorded.
- Ops tooling exists for Karlin and you: refund by kid, attach a friend code by hand, partner codes,
  void or rotate a family link, find a family, sweep stale orders (`ops-runbook.md`).

## Decisions made overnight, most overrulable first

Full table: `03-decision-log.md`. The ones you are most likely to want to change:

1. **Refund and jersey story (PR-2, PR-3). SETTLED 2026-10-27, see Tuesday below.** Pages say "fully refundable until lock-in"; the draft terms
   add "$65 back if the jersey has shipped" and the jersey line says "first 100 families" while the terms
   say "commit before Nov 30". Built: the pages as Aaron wrote them, the README rule in the draft terms.
   Recommendation: drop the $65 rule until jerseys actually ship and keep one jersey rule. Team summary item 2.
2. **Invite banner wording (T1).** Built "Invited by Zoë's family" (Aaron's was "Joining Zoë's team"),
   and the runbook says a referral never decides placement: Karlin confirms same-team requests with both
   parents. Aaron's call on the words.
3. **One-tap Apple Pay button deferred (D1, D18).** Wallets appear first inside the payment form; the
   Apple Pay recurring details (for lock-in charges) are passed. The separate button above the form is not
   built; it can't be tested on the branch domain. Medium cost to change; do it with the Apple Pay domain work.
4. **Next.js security update as its own release (D14).** `next` 16.2.1 has critical advisories already
   live on ekuzo.gg; I kept the bump out of this branch so this review stays about Season 01.
5. **Old preview URLs (D17).** They move with a tiny page in the browser, not an HTTP 301, because Netlify
   re-appended the kid name to every 301.
6. **Stripe return handled in the page (D11).** Same Netlify behaviour broke the redirect after paying; the
   welcome page now renders directly and strips the query.
7. **Card only (D16).** Link's bank-payment tab is off (it settles days later); Apple and Google Pay still work.
8. **Brand red contrast (D15).** White on #F92524 is 3.95:1, under the 4.5:1 guideline for small text. Left
   for Aaron.
9. The alternatives challenger moved to planning time (D7, your call at 22:05); the build-loop edit is in
   the KB.

## Walkthrough (10 minutes, on your phone)

1. Open https://season1-commit--ekuzo.netlify.app/season1/join. Read the price card and the friend table.
2. Tap "Save their spot". Add one kid, age 12. Email `team+s1test-jamie1@ekuzo.gg`. Card 4242 4242 4242 4242,
   any future date, any CVC, ZIP 78757. Pay.
3. You land on the welcome page with no query in the address bar. Copy your share link.
4. In Klaviyo, the test profile shows "Season 01 Committed". (Discord stays quiet until a webhook is set.)
5. Open your share link in a private tab or from an Instagram DM. You see "{Kid} wants your kid on the team",
   "Friend code 1234 5678". Join, use `team+s1test-jamie2@ekuzo.gg`, pay. The welcome page says "Friend
   credit recorded". Your first profile gets "Season 01 Friend Joined".
6. Optional: `npm run s1:find -- --email team+s1test-jamie1@ekuzo.gg` and `npm run s1:refund -- --order <ref>`
   (dry run first) show the ops side.

Each test payment also reaches the old test webhook on the `dev` deploy (see "Live-only checks").

## Evidence

- Requirements and specs: `01-requirements.md`, `02-frozen-spec.md` (slice 1 plus money red team),
  `02b-spec-slice2.md` (trust and ops red teams), `02c-spec-slice3.md`, `02d-spec-slice4.md`.
- Ledger: `04-evidence-ledger.md`. Defects: `05-defect-log.md` (merged), lane logs `05-defect-log-*.md`.
- Deploy runs: `evidence/sentry-s1`, `sentry-s2`, `sentry-final`, `sentry-regression`, `sentry-smoke`,
  `sentry-a11y`; security `evidence/security-review.md`; Parent `evidence/parent-review.md`.
- Test data: `06-cleanup-ledger.md` (every Stripe object and test row).

## Known gaps (not blocking test mode)

- Page speed: images are fixed (join 10.8 MB to 531 KB), but mobile LCP on the invite page is still 4.9 to
  7.4 s in Lighthouse from server start-up and the database lookup, and signup varies 1.9 to 10.4 s. Next
  step if it matters for ads: cache code lookups for 60 seconds and keep the database warm in launch week
  (`evidence/sentry-a11y/rerun.md`).
- Contrast: brand red buttons (3.95:1), the struck-through $160 (2.79:1) and one grey (4.33:1) are below
  the guideline; Aaron's call.
- Rate limit 429 could not be rechecked from a stable IP in the cloud sandbox; unit and one deploy run pass.

## Live-only checks and human actions (in launch order)

Tuesday
- Done 2026-10-27 (commit 3746904): terms and privacy approved and installed in the site-wide pages
  (`/terms-of-service#season-01`, `/privacy-policy#season-01`), `termsVersion` `s1-terms-2026-10-27`,
  `/season1/terms` moves there. Refund-and-jersey story settled (no $65 rule; first 100 by Nov 30).
  Text: `09-terms-install.md`. Season dates are placeholders until Karlin confirms.
- Old test webhook `we_1TMYx4…` on `dev--ekuzo.netlify.app/api/webhooks/stripe` runs without the guard
  until this branch merges: 11 succeeded test payments reached it overnight and may have written
  empty-email rows to the dev Sheet and Meta `TEST_AUTO` events. Check the Sheet; consider pausing that
  endpoint while the team tests.
- Next.js and nanoid update as its own small release (D14).

Wednesday morning (from the runbook's launch order)
1. Neon production: note the restore point, run `npm run s1:migrate -- --live` against production, reset the
   `ekuzo_owner` password (the test URL was echoed once in this session's log; the role password is likely
   shared), turn off scale-to-zero for launch week, read-only role for Claude, daily backups.
2. Netlify Production only: `DATABASE_URL`, live Stripe keys, `S1_STRIPE_WEBHOOK_SECRET` (live),
   `S1_REF_SECRET` (new random value), `META_CAPI_TEST_EVENT_CODE` unchanged, Discord webhook URLs.
   Leave `S1_COMMIT_MODE` unset for the first deploy (resolves to off).
3. Stripe live: webhook endpoint `https://ekuzo.gg/api/season1/stripe-webhook` with the six events
   (`payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `refund.failed`,
   `charge.dispute.created`, `charge.dispute.closed`); Apple Pay domains ekuzo.gg and www; Radar
   card-testing rules; successful-payment and refund emails on.
4. Merge `season1-commit` into `dev`, review, then `dev` into `main` (your usual path).
5. Set `S1_COMMIT_MODE=live`, redeploy, pay $100 on your phone with Apple Pay and Karlin with Google Pay, then
   refund both with `npm run s1:refund`. Watch Klaviyo, Meta Events Manager (Purchase), Discord.
6. Real-device checks: Instagram and Facebook in-app browsers, share sheet, `sms:` links.

Owners outside the build: Aaron (Committed receipt flow with the share link, waitlist suppression filter
on `season1_status`, delta sheet review, brand red), Karlin (Google Voice number and season dates into
`lib/season1/offer.ts`, Discord channels, printer date).

## Git state at writing time

Captured 2026-10-27 01:51 CT, after the last push (origin/season1-commit = `54197db`).

`git status --porcelain` (empty means clean):

```
(empty)
```

`git log --oneline -3`:

```
54197db docs(season1): smoke evidence, post-audit defect updates
149a096 docs: WORKLOG entry for the Season 01 commit build
2e7c779 docs(season1): review guide and return handoff (git evidence added at close); learning log: Netlify query on redirects
```

The commit that adds this block sits on top of these three, so `git log --oneline -4` shows it first.
Not merged into `dev` or `main`.
