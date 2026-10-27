# Sentry a11y re-run (AUD-C): before / after

Target: https://season1-commit--ekuzo.netlify.app, run 2026-10-27 (CT, evening of 10-26 to early 10-27 UTC). Repo HEAD dcc9209 on top of 54197db; the live pages show the post-fix markup (1400 px hero image, deferred Stripe.js, no landmark/region findings), so the deploy is 54197db or later. I could not read the deploy ID from the site itself (no deploy header), so that is inferred from the content.
Method identical to results.md: Lighthouse 13.5 mobile, simulated slow 4G, performance and accessibility categories only, 2 runs per page (both shown); axe via Playwright at 375x812 with the same tags (wcag2a/aa, 2.1, 2.2 AA, best-practice), analytics hosts blocked in axe only. Headless Chromium on a shared Linux box. No form submitted, no click on Pay, no POST.
Scripts: /home/claude/sentry-a11y/ (axe-rerun.mjs, lhsum2.mjs, lh2/*.json). Raw outputs were kept outside the evidence folder, per the "rerun.md only" instruction.

Caution on noise: Lighthouse run-to-run spread is large on this box (signup LCP 10.4 s then 1.9 s, crew TTFB 1,055 ms in run 1). One join run carried Lighthouse's "device slower than expected" warning. Read the two-run ranges, not single numbers.

## 1. Before / after (Lighthouse mobile, 2 runs each)

| Page | Metric | Before (10-26) | After (10-27) |
|---|---|---|---|
| /season1/join | Performance | 42, 44 | 71, 71 |
| | Accessibility | 90 | 96 |
| | LCP | 57.6 s, 58.9 s | 1.9 s, 3.4 s |
| | CLS | 0 | 0.033, 0.033 |
| | Transfer (page never loads Stripe.js) | 10,845 KB (10,657 w/o GTM) | 531 KB (344 w/o GTM) |
| /season1/join/signup | Performance | 30, 30 | 29, 67 |
| | Accessibility | 95 | 96 |
| | LCP | 10.4 s, 10.4 s | 10.4 s, 1.9 s |
| | CLS | 0.025 | 0.022, 0.022 |
| | Transfer before js.stripe.com/v3 is requested | not measured (script was sync in head) | 198 KB (187 KB is GTM; 11 KB ours) |
| | Total excl. Stripe-origin hosts | about 1,330 KB | 1,291 KB (1,104 KB w/o GTM) |
| | Stripe.js | sync in head | `defer` (A11Y-02 fixed); loads 0.6 to 0.8 s in |
| /crew/75701491 | Performance | 61, 65 | 48, 56 |
| | Accessibility | 90 | 96 |
| | LCP | 5.3 s, 4.4 s | 7.4 s, 4.9 s |
| | CLS | 0.024 | 0.020, 0.024 |
| | Transfer (no Stripe.js) | 10,919 KB (10,732 w/o GTM) | 606 KB (418 w/o GTM) |

Targets: LCP <= 2.5 s, CLS <= 0.1, under 500 KB before Stripe.js, Stripe.js only on signup.
- LCP: still FAILS on all three at Lighthouse throttling. join passes in one of two runs (1.9 s) and misses in the other (3.4 s). signup passes in one run (1.9 s) and fails in the other (10.4 s, element render delay 2.25 s). crew fails both (7.4 s, 4.9 s).
- CLS: PASS on all three (max 0.033).
- Transfer: join 531 KB is over 500 KB with GTM (188 KB) and under without it (344 KB). crew 606 KB is over with GTM and under without it (418 KB). signup: 198 KB before Stripe.js is requested, PASS.
- Stripe.js: PASS (none on join and crew, 0 stripe requests).
- The 10.7 MB `coach-karlin-faith.jpg` is no longer referenced by the pages (they use `/images/authors/coach-karlin-faith-1400.jpg`, 155 KB). The original is still served (HTTP 200, content-length 10,713,657), so any other page or an external link that still points to it would still pull 10.7 MB.

Why crew regressed on score: the transfer fix worked (606 KB vs 10.9 MB), but TBT is 1.36 to 1.37 s on both runs (join: 0.8 to 1.9 s) and run 1 had a 1,055 ms TTFB. The LCP element is now the hero image from cdn.klaviyomail.com (82 KB), so what remains is server time, third-party host latency and main-thread blocking, not payload. Not diagnosed further (find, never fix).

Playwright cross-check (375, 2x DPR, unthrottled, analytics blocked): LCP join 0.82 s (hero img, was 1.18), signup 0.63 s (H1, was 0.85), crew 0.96 s (hero img, was 0.72); CLS join 0.014, signup 0.048, crew 0.007 (all pass).

## 2. axe at 375x812: remaining serious/critical

| Page | Critical | Serious before | Serious after | Moderate before | Moderate after |
|---|---|---|---|---|---|
| /season1/join | 0 | color-contrast, 7 nodes | color-contrast, 7 nodes | landmark-one-main 1, region 2 | none |
| /season1/join/signup | 0 | color-contrast, 7 nodes | color-contrast, 7 nodes | region 24 | none |
| /crew/75701491 | 0 | color-contrast, 13 nodes | color-contrast, 13 nodes | landmark-one-main 1, region 7 | none |

Lighthouse accessibility audit failures: color-contrast only, on all three pages (score 96).

Serious findings are the same count, but they are not all brand red. Split of the 27 nodes:

| Group | join | signup | crew | Ratio | Status |
|---|---|---|---|---|---|
| Brand red #F92524 text or fill with white (buttons, mini CTA, 11px eyebrows, "+ Add a sibling", #mode) | 6 | 4 | 6 | 3.94 | A11Y-03, accepted |
| White 85% tint on red (hero copy, refund link, footer line) | 0 | 0 | 2 | 3.14 | A11Y-03 family (red background) |
| Brand red on stone #EFEEED ("Free (from X)") | 0 | 0 | 1 | 3.40 | A11Y-03 family |
| Struck-through $160, #8f8f8e on #EFEEED, 14 to 20px | 1 | 1 | 1 | 2.79 | NOT covered by A11Y-03 |
| "Founding jersey / Free", #6f6f6f on #EFEEED, 13px | 0 | 2 | 0 | 4.33 | NOT covered by A11Y-03 |
| Total | 7 | 7 | 13 | | |

Not accepted and still open: the struck-through $160 (3 pages, 2.79:1) and the two #6f6f6f lines on signup (4.33:1, needs 4.5:1). Both are grey-on-stone, so a darker grey is a separate, small change from the red decision.

Other axe items:
- signup "incomplete" (needs manual review): `#ag0` age select color-contrast (placeholder option); three Stripe iframe nodes `aria-valid-attr-value` (expiry, country, postal inputs). Third-party, not ours.
- Moderate findings (landmark-one-main, region) are gone on all three pages.
- Tap targets under 44 px, non-inline, at 375: signup terms checkbox is now 24x24 (was 13x134, A11Y-07 stretched ring is gone; 24 px meets the WCAG 2.5.8 minimum, not the 44 px house target; the whole label row is still the tap area). The back link, wordmark and mini nav CTA no longer appear in the under-44 list. Inline links still under 44: "Text Karlin" 69x17 on join and crew, "Season 01 terms" 94x15 on signup, two "Fully refundable" links 330x30 and 257x32 on crew (inline text links, exempt under 2.5.8).

## 3. Not re-tested
Keyboard path and live-region behavior (A11Y-06), Shift+Tab, wallet buttons, /crew/12345678, /season1/join/welcome, /season1/terms and the 1440 viewport were outside this brief.
