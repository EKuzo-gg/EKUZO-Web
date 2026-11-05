# Relay self-test, S2 items 1 to 11

Test file: lib/season1/__tests__/seasonOneRoute.test.ts (describe "round 2 relay"). Results: npm-test.txt (572 pass, 0 fail), tsc.txt (no errors in src; the only tsc output is stale generated .next/types noise in other routes, unchanged by this work).

| Item | Test |
|---|---|
| 1 nf-only IP, isIP, no IP skips, /64, mapped v4, hashed key, no raw IP | "items 1, 3: the limiter rides the claim's one transaction..."; "item 1: no nf header means no per-IP key..."; "item 1: IPv6 keys on the /64..." |
| 2 Meta IP fix | "item 2: the Meta Lead takes the IP from x-nf-client-connection-ip only" |
| 3 limiter inside classifySignup's one transaction, counts only new, hour-floored window | "items 1, 3..." (one transaction, SQL window floor, `where exists claimed`); "item 4: repeats, retries and failed sign-ups do not count..." |
| 4 thresholds 10 quiet / 30 429 / 150 global, warn lines, fail open | "item 4: 10 new sign-ups..."; "item 4: the 31st is a 429..."; "item 4: past 150..."; "items 1 to 4 fail open..." |
| 5 429 copy from OFFER.textKarlinSms | "item 4: the 31st is a 429..." (exact text). Popup shows the server `error` on a non-ok response and does not retry (components/ui/SeasonOnePopup.tsx). |
| 6 popup quiet like repeat | SeasonOnePopup.tsx: `body.repeat !== true && body.quiet !== true` gates trackLead (no unit harness for the client component; verified by tsc and read-through). |
| 7 step lock, step_dropped, text-karlin cap | "item 7: a step with an eventId..."; "...without an eventId..."; "a dropped step logs step_dropped..."; "the step lock fails open..."; "text-karlin is capped at 3..." |
| 8 repeat claims no ev key | "item 8: the repeat path claims nothing..." |
| 9 no raw email, no r.text() in logs | "item 9, 11: a sentinel email and IP never appear..."; "item 9: the route source has no r.text()..." |
| 10 Origin guard | "item 10: a cross-site browser POST is 403..." |
| 11 response keys, fail-open modes, sentinels | "item 11: response keys..."; fail-open tests above; sentinel test above |

Known behaviors worth review: (a) a 429 or a failed (502) new sign-up still counted one slot in the IP hour (the count is in the claim statement; the email claim is released); (b) a dropped text-karlin over the cap returns 200 {ok:true} silently; (c) the 429 shows the number in raw E.164 as in OFFER.textKarlinSms; (d) the claim statement text changed (claimed CTE now skips everything when the email was seen, plus a `counted` CTE), so the existing claim-SQL assertions were kept and the fake Neon in the test file was extended to match.
