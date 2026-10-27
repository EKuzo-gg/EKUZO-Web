# Sentry regression defect log, 2026-10-27 UTC

Deploy https://season1-commit--ekuzo.netlify.app at 1dba0f6. Evidence: `evidence/sentry-regression/results.md`. All 8 checks pass. No new defects.

| # | Severity | Type | Owner guess | Note |
|---|---|---|---|---|
| R1 | info (carried D2) | code-bug (minor) | Atlas | Signup still contains the literal "Charlie" as the first-name placeholder. Not from the query. |
| R2 | info | accepted-risk | n/a | Old-URL redirects are a 200 interstitial (meta refresh plus location.replace) instead of a 301. Destination URLs are bare and referrer-empty; the old URL with its query still appears in server request logs. |
| R3 | info | test-limitation | n/a | The test sandbox rotates egress IPs, so a single-IP 6-call limit proof needed a second run (6th same-IP call refused with 429; 422s uncounted). |

Prior findings status: D1 (query survives on redirect) fixed in the browser; D5 (422s counted) fixed; M2 inviteReason removed; L1/L2/L7 guards and headers confirmed live. D3, D4, D6 to D8 not re-tested.
