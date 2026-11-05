# Sentry A final pass at 56b24b9

No source or test file edited; no state-changing git. Fresh production build in /tmp/claude-0/sentry-a-final (git archive of HEAD, hard-linked node_modules, placeholder env), served on 3110, stopped by PID.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | SA-6: release raced against 800 ms | PASS. Repo test "SA-6: a release slower than 800 ms is cut off, warned without the email, and the 502 stands" asserts 780 to 1400 ms and the warn line. My scratch test (release hangs 2.5 s) returns 502 at the cap, warns "no answer in 800 ms", no email in the log; a normal release still deletes the claimed keys and a new eventId is new (SA6b). Local Postgres 16: the unchanged release SQL deletes the claim (0 rows left), reclaim sees nothing (new). | final-sa6-scratch.txt, final-sa6.test.ts.txt, pg/final-release.txt, final-npm-test.txt |
| 2a | Full npm test | PASS: 516 tests, 515 pass, 0 fail, 1 skipped | final-npm-test.txt |
| 2b | Protected paths vs c1f01e6; signup.html vs 8ce0e17 | PASS: zero diff on b/, jersey/, welcome/, crew/, app/api/season1, next.config.mjs; no non-test lib/season1 change; both signup.html files identical to 8ce0e17 | final-protected.txt |
| 2c | Secret scan of `git diff c1f01e6 56b24b9` | PASS: no hits | final-secret-scan.txt |
| 2d | Dash lint of added lines | PASS with one note: no em dashes; spaced hyphens are SQL or arithmetic; one en dash in docs/s1-join-sync-2026-11/parent-review.md inside a quoted product string ("I'll text you soon. – Karlin"), a doc quoting copy, not a comment dash (low, optional) | final-dash-lint.txt |
| 2e | nft trace and /join vs /join/b on the fresh build | PASS: `route.js.nft.json` lists app/season1/join/b/join-b.html; bodies identical for no query, `?src=email`, `?src=junk` (same hashes as the c1f01e6 /join/b bodies: a7ae369b, f8127b3c); headers noindex, private no-store, referrer-policy origin; /karlin 307 to /season1/join/b?src=karlin | final-curl.txt |
| 3 | R3.7 savedEmail: A fails (502), change to B and succeed, Text Karlin | PASS: two main POSTs (A, then B with a new eventId); the Text Karlin POST carries email B, not A; done state visible; Pixel Lead fires once, with B's eventId | final-browser.mjs, final-browser-requests.json |
| 4 | M6: no vendor request or URL carries email, phone or a kid field | PASS: the only non-local requests were four Google Fonts GETs (no body); recorded fbq, gtag and clarity calls carry no email, phone or kid field; no page URL carries them; the email appears only in bodies POSTed to /api/season-one. Note: the analytics block (fail-closed) saw 0 analytics hosts requested in this run (the stubs record the calls), so the vendor-payload check is on the recorded calls plus the request list. | final-browser-requests.json |
