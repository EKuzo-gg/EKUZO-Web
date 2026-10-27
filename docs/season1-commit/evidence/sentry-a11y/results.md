# Sentry a11y and perf results (N1, N3)

Target: https://season1-commit--ekuzo.netlify.app, run 2026-10-26 23:44 to 23:55 CT. Tools: Playwright 1.x + @axe-core/playwright (wcag2a/aa, 2.1, 2.2 AA, best-practice), Lighthouse mobile (2 runs per page, run 1 kept), headless Chromium 156. Analytics hosts (google-analytics, googletagmanager, clarity, facebook) blocked in the Playwright runs; not blocked in Lighthouse (GTM = 188 KB, counted separately below). No payment submitted; the one Pay click was an empty-form client-side validation (no POST to /api/season1/commit, confirmed from the request log).

Raw: axe-results.json, lighthouse-summary.json, lh-*.json, kbd/ (18 focus-stop screenshots at 375 + kbd-log.json), shot-*-375.png, signup-errors-375.png.

## 1. axe-core (identical at 375x812 and 1440x900)

| Page | critical | serious | moderate | Notes |
|---|---|---|---|---|
| /season1/join | 0 | 1 rule, 7 nodes (color-contrast) | landmark-one-main 1, region 2 | |
| /season1/join/signup | 0 | 1 rule, 7 nodes (color-contrast) | region 24 | Stripe iframe items are "incomplete" (third party, ignore); #ag0 select contrast needs manual (placeholder option) |
| /crew/75701491 | 0 | 1 rule, 13 nodes (color-contrast) | landmark-one-main 1, region 7 | |
| /crew/12345678 | 0 | 1 rule, 13 nodes (color-contrast) | landmark-one-main 1, region 7 | same as above |
| /season1/join/welcome | 0 | 0 | landmark-one-main 1, region 2 | clean on contrast |
| /season1/terms | 0 | 0 | region 1 | clean |

Serious defects: color-contrast on join, signup, both crew pages (see section 5).

## 2. Keyboard path on /season1/join/signup at 375 (screenshots kbd/tab-01..18.png)

| Stop | Element | Focus visible |
|---|---|---|
| 1 | Back link | yes (browser ring) |
| 2 | EKUZO wordmark | yes |
| 3 | Kid first name | yes (thick dark ring) |
| 4 | Kid age select | yes |
| 5 | + Add a sibling | yes |
| 6 | Your first name | yes |
| 7 | Email | yes |
| 8-12 | Stripe Payment Element: card number, expiry, CVC, country, ZIP (inside one iframe) | yes (Stripe 1.5px #050505 border on focus, no glow; thin but visible) |
| 13 | Mobile | yes |
| 14 | Terms checkbox | ring present but malformed: checkbox is 13x134 px (stretched by flex), ring is a tall thin rectangle (A11Y-07) |
| 15 | "Season 01 terms" link | yes |
| 16 | Pay button | yes (dark ring on red) |
| 17 | Text Karlin | yes |
| 18 | Focus leaves to browser chrome | no trap |

Order matches visual order. No trap: Tab enters and leaves the Stripe iframe cleanly. Not tested: Shift+Tab, and the Apple/Google Pay wallet buttons (none rendered in headless).

Inline error region: PASS. #formErr has role=alert, aria-live=assertive; #liveErr has role=status, aria-live=polite. Empty submit moved focus to the first invalid field (#nm0), set aria-invalid on nm0, ag0, pname, email. Gaps (A11Y-06): same message is written to both live regions (double announcement), only the first error is announced, the per-field .err paragraphs are not tied to inputs (no aria-describedby/aria-errormessage), no aria-required.

## 3. Tap targets under 44x44 CSS px at 375 (interactive, visible)

| Page | Element (w x h) |
|---|---|
| /season1/join | Back chevron link 40x17; EKUZO wordmark 65x22; "Save their spot" mini nav CTA 111x31; standalone "Text Karlin" 69x17; inline "Text Karlin" 62x15 (inline) |
| /season1/join/signup | Back link 43x17; wordmark 65x22; terms checkbox 13x134 (whole label row is the hit area, so tap works); "Season 01 terms" 94x15 (inline); "Text Karlin" 61x15 (inline) |
| /crew/75701491 | wordmark 65x22; "Join the team" mini CTA 101x31; "Fully refundable until December 31, 2026" links 330x30 and 257x32 (inline); "Text Karlin" 69x17 and 62x15 |
| /crew/12345678 | same as above plus one more inline "Text Karlin" 61x15 |
| /season1/join/welcome | chevron link 5x17; "Back to Season 01" 104x15 (inline) |
| /season1/terms | Back link 43x17; wordmark 65x22; "EKUZO Terms of Service" 286x43 (inline); "Text Karlin" 80x19 (inline) |

Fields, selects, the primary buttons and the sibling button are 45 to 52 px tall and pass. Inline text links are exempt under WCAG 2.5.8 but listed because the brief asked for everything under 44.

## 4. Lighthouse mobile (simulated slow 4G, 2 runs each; both shown)

| Page | Perf | A11y | LCP | CLS | FCP | TBT | Transfer before Stripe.js | Stripe.js |
|---|---|---|---|---|---|---|---|---|
| /season1/join | 42, 44 | 90 | 57.6 s, 58.9 s FAIL | 0 | 2.7 s | 1.2 to 1.5 s | 10,845 KB (10,657 KB without GTM) FAIL | none (0 stripe requests) PASS |
| /season1/join/signup | 30, 30 | 95 | 10.4 s, 10.4 s FAIL | 0.025 PASS | 5.7 to 5.9 s | 2.7 to 3.2 s | about 1,330 KB excluding js.stripe.com and m.stripe.network, of which only about 140 KB (own HTML, fonts) is ours; the rest is Stripe-initiated (pay.google.com 496 KB, hCaptcha 310 KB, gstatic 123 KB) and GTM 187 KB | loaded, sync in head (A11Y-02) |
| /crew/75701491 | 61, 65 | 90 | 5.3 s, 4.4 s FAIL | 0.024 PASS | 1.9 s | 0.75 s | 10,919 KB (10,732 KB without GTM) FAIL | none PASS |

Targets: LCP <= 2.5 s FAIL on all three; CLS <= 0.1 PASS; under 500 KB before Stripe.js FAIL on join and crew (cause: one image); Stripe.js only on signup PASS.

Playwright cross-check (375, 2x DPR, no throttling, analytics blocked): LCP join 1.18 s (hero img), signup 0.85 s (H1), crew 0.72 s; CLS join 0.014, signup 0.056, crew 0.006. So unthrottled the pages are fast; the Lighthouse failures come from the 10.7 MB image and the render-blocking Stripe.js under throttling.

Root cause join/crew: /images/coach-karlin-faith.jpg is 10.7 MB, 6349x4312, rendered at 104x110, loading=eager, in app/season1/join/join.html:123 and app/crew/[code]/crew.html:147 (also crew.html and early-access.html). A 159 KB /images/authors/coach-karlin-faith-1400.jpg already exists and is served (200). lib/authors.ts line 103 says the 10.2 MB original is "no longer served"; it still is.

## 5. Contrast

Brand red #F92524 against white is 3.95:1 (needs 4.5:1 for text under 18.66px bold). Failing nodes:

| Pair | Ratio | Where |
|---|---|---|
| white on #F92524, 16px bold (.btn primary) | 3.95 | join x2, crew x2, signup Pay button #go |
| white on #F92524, 12px bold (.mini nav CTA) | 3.95 | join, crew |
| #F92524 on white, 11px bold eyebrows (.ey.red) | 3.95 | join x3, signup x2, crew x5 |
| #F92524 on white, 14px bold ghost "+ Add a sibling" | 3.95 | signup |
| #F92524 on #EFEEED, 14px bold "Free (from X)" | 3.41 | crew |
| white at 85% on red (hero copy, refund links, 12 to 15px) | 3.14 and 3.95 | crew x3 |
| struck-through $160 (#8f8f8e on #EFEEED) | 2.79 | join, signup, crew |
| #6f6f6f on #EFEEED, 13px "Founding jersey / Free" | 4.34 | signup x2 |
| Test-mode bar #7a5a00 on #fff6b6 | 5.81 | signup: PASS |
| Error text #c4161a on white | 6.04 | PASS |
| Body black #050505 on white | 20.4 | PASS |

Candidate fix to check with Aaron (design call, not ours): a text-safe red near #D61E1D gives 5.17:1 on white and 4.46 on stone; or black buttons with white text and brand red kept for large type and fills only.
