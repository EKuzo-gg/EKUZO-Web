# 07 Review guide: Season 01 join sync and funnel fixes (Fable, 2026-11-05)

## 60-second summary

- **W2 (live since 10:16 CT, hotfix `8ce0e17`):** the sign-up honeypot is `ekz_hp`, so autofill no longer gets real parents rejected at checkout; ad codes d13 and up now record. Proven on production with `team+s1test-1105-ad@ekuzo.gg` (`season1_ad: d19`).
- **W1:** `/season1/join` serves join B's template through a copy of B's route. Bodies are byte-identical to `/join/b` (no query, `?src=email`, `?src=junk`), and a test fails if they drift.
- **W3:** one Waitlist event and one Lead per email per 24 h (Postgres claim with an advisory lock, fail-open at 800 ms, claim released if the sign-up write fails). Repeat sign-ups log `Season 01 Waitlist Repeat`, re-subscribe and send no Lead. A retry after a lost response still ends in one Lead. Landing and popup send one POST per tap and give a new email its own Lead; the landing stops the site popup after a sign-up.
- **W4:** page A heroes on phones: CLS 0.79 to 0.85 before, 0.0013 or less after (7 runs each, 375 px, throttled). Pixel-identical settled pages; desktop and interactive heroes unchanged.
- Evidence: `04-evidence-ledger.md` (48 PASS, 0 FAIL, the open rows are the human checks below). `npm test` 516 tests, 515 pass, 0 fail on the release head.

## Decisions, most overrulable first

| # | Call | Undo |
|---|---|---|
| D1 | /join reports `season1_join_view {variant:'b'}`; GA4 splits /join and /join/b by page path | one string |
| D6 | No per-IP rate limit on `/api/season-one` this release (a bot could post fake emails, each firing a Lead; no sign of it in the reads) | small follow-up |
| D9 | 24 h window (Leads), `d1` to `d99` ad range | constants |
| D13 | A repeat sees the normal confirmation | copy change |
| D2 to D5 | Postgres claim instead of a Klaviyo read; retry re-runs the full path; repeat re-subscribes | see 03 |
| D11 | Hero box reserved by a small script before `#hero` (`AD_HERO` moved there, one source) | revert one commit |
| D15, D18 to D20 | B's copy stays as Aaron wrote it (season end, jersey urgency, one-kid credit case); "weekly" copy goes to Aaron | n/a |

Accepted risks: a claim that commits after the 800 ms cap is never released (that family's next attempt reads as a repeat); Klaviyo `unique_id` dedupe on a lost-response retry is Klaviyo's documented behavior, not proven here.

## How to check it yourself (after the push)

1. Phone, `https://ekuzo.gg/season1?ad=d19`: the form should not jump when the jersey hero appears.
2. Sign up there with `team+s1test-1105-dup@ekuzo.gg`; wait 60 s; reload and sign up again. Klaviyo should show one `Season 01 Waitlist` (ad d19) and one `Season 01 Waitlist Repeat`; Events Manager one Lead (H2). Then the same email from a second device.
3. `https://ekuzo.gg/season1/join?src=email` should look exactly like `/season1/join/b`.
4. H3: real-phone autofill on `/season1/join/signup` (iOS Safari, Android Chrome with a saved company): the hidden field stays empty and checkout reaches Stripe.

## Deferred to human or follow-up

- H1 to H3 above; post-deploy `curl` body hash of /join and /join/b (R1.8).
- Follow-ups: D6 rate limit; D14 (`text-karlin`, `age`, `games` steps accept any email); interactive-hero CLS (d2 0.39, d4 0.18, `?hero=games` 0.16, unchanged by this build); torn-paper image 404s on the join pages and /blog (pre-existing); FAQ canon backports for Season 01 pricing, paying, discounts, refunds, friend credit and dates (Steward).
- Aaron: "weekly" practice copy (four landing spots, two live Meta creatives held for his next refresh).

## Pre-launch checklist

- [x] Ledger evidenced; no open critical or major (`05-defect-log.md`: SA-1 to SA-3 and SA-6 closed after retest).
- [x] Steward approved the /join clone; fresh Parent review done (`parent-review.md`).
- [x] Protected paths zero diff (b, jersey, welcome, crew, `app/api/season1`, `next.config.mjs`, signup).
- [x] Secret scan clean; no em dashes in added prose.
- [ ] Jamie's push go; then `log.md` line with the deploy time; H2 run; tell Aaron and Karlin.

## KB backport candidates

- Build Loop: "a fix is live only when `main` on GitHub has it" (W2 sat on a laptop for a day; a handoff should check `git branch -r --contains <sha>` before calling anything live).
