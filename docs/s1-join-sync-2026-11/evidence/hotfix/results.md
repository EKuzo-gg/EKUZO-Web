# Hotfix verification, 8230894 on 147897a (Sentry)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Diff touches only route.ts, signup.html, WORKLOG.md | PASS | diffstat.txt, diff.txt |
| 2 | normalizeAd regex, 14 inputs (d1, d01, D19, d21, d99, d12, d13 pass; d0, d100, d1x, "", 19, null blank; " d5 " gives d5) | PASS (0 failures) | normalize-ad.txt |
| 3 | next build succeeds, server on :3300 returned 200, then stopped via pid file | PASS | build.txt |
| 4a | Signup at 375 and 1440: no console errors from our page; screenshots saved | PASS | browser.txt, screenshots/signup-375-hotfix.png, signup-1440-hotfix.png |
| 4b | DOM: no name or id "company"; #ekz_hp has autocomplete=off, data-1p-ignore, data-lpignore=true, data-form-type=other, tabindex -1, inside aria-hidden .hp, offscreen at left -9999px, 1x1, overflow hidden | PASS | browser.txt |
| 4c | collect() body: company "" when honeypot empty, "x" when set to "x"; both captured on the real /api/season1/commit request (fulfilled with fake 400) | PASS (with harness caveat) | browser.txt |
| 5a | commit/route.ts, validate.ts, and validate.test.ts byte-identical to 147897a | PASS | server-unchanged.txt |
| 5b | validate.test.ts still rejects a filled company (line 130, `bad({ ...base(), company: "Acme" }, "company")` and line 131 for " ") | PASS | server-unchanged.txt |
| 5c | npm test: 482 tests, 481 pass, 0 fail, 1 skipped | PASS | npm-test.txt |

## Caveats
- The QA env has no DATABASE_URL, so the server resolves mode "off" and serves the "Signups are paused" block; the form is hidden and Stripe is not loaded. Screenshots show that paused state.
- For 4c, the HTML response was patched in flight in the browser only: "open":true, "mode":"test", exposing collect/pay from the page IIFE, and stubbing `var sub=await els.submit()` as `var sub={}`. The page's own collect() and pay() run unmodified, and pay() issued the POST to /api/season1/commit. The page's real submit path (form submit) cannot run headless here without Stripe, so pay(collect(),null) was called directly. No tracked file was changed.
- Analytics hosts were routed to 204 on every context; 0 matching requests were seen (the paused page loads no tags), so the count is 0.
- Nothing real was submitted: commit requests were intercepted and fulfilled with a fake 400.
