# 04 Evidence ledger (skeleton, Auditor 2026-11-05)

Status values: open, pass, fail. Verified-by is set by Sentry or Jamie, never the builder.

| Requirement | Test | Evidence path | Status | Verified-by |
|---|---|---|---|---|
| R1.1 | joinRoutesMatch.test.ts, 3 request shapes | evidence/w1/routes-match.txt | open | |
| R1.2 | src whitelist test on /join | evidence/w1/src-handling.txt | open | |
| R1.3 | open, closed, mode off, jersey cutoff renders | evidence/w1/states.txt | open | |
| R1.4 | mutation proof: edit one template, test fails | evidence/w1/mutation-fail.txt | open | |
| R1.5 | grep for join/join.html empty; four tests green | evidence/w1/grep-and-tests.txt | open | |
| R1.6 | rendered text diff /join vs /join/b | evidence/w1/text-diff.txt | open | |
| R1.8 | build: `.next/server/app/season1/join/route.js.nft.json` lists join-b.html; after deploy curl both routes, 200 and equal body hash | evidence/w1/nft.txt, evidence/deploy/curl-hash.txt | open | |
| R1.7 | curl -sI both routes plus baseline | evidence/w1/headers.txt | open | |
| R2.1 | normalizeAd table test | evidence/w2/normalize-ad.txt | open | |
| R2.2 | route test d19 on event, profile, CAPI | evidence/w2/route-d19.txt | open | |
| R2.3 | signup HTML grep, no name="company" | evidence/w2/honeypot-html.txt | open | |
| R2.4 | `git diff 147897a 8230894` is the two hunks (3 files incl. WORKLOG); browser pay and 422 (hotfix/browser.txt is a failed run, `collect` not in scope, redo) | evidence/hotfix/diff.txt, evidence/hotfix/browser.txt (rerun) | open | |
| R3.1 | classifier tests; query text and order: `transaction([lock, claim])`, lock first (D16, no Postgres here); second-device run in H2 | evidence/w3/classify.txt, evidence/w3/lock-order.txt | open | |
| R3.2 | repeat path test (no Waitlist, no CAPI, empty profile) | evidence/w3/repeat.txt | open | |
| R3.3 | fail-open per mode; honeypot and steps skip check | evidence/w3/failopen.txt | open | |
| R3.4 | unique_id with and without eventId | evidence/w3/unique-id.txt | open | |
| R3.5 | concurrency order test; header comment grep | evidence/w3/budget.txt | open | |
| R3.6 | browser: repeat fires no Lead, generate_lead, signup | evidence/w3/browser-repeat.txt | open | |
| R3.7 | browser: eventId per email, case and space; savedEmail | evidence/w3/browser-eventid.txt | open | |
| R3.8 | browser: tap burst gives one POST | evidence/w3/browser-taps.txt | open | |
| R3.9 | browser: joined flag on new, retry, repeat; storage throws | evidence/w3/browser-flag.txt | open | |
| R3.10 | popup repeat: flag set, no trackLead | evidence/w3/popup.txt | open | |
| R3.11 | full unit suite incl. response-keys test | evidence/w3/unit.txt | open | |
| R4.1 | before-probe.json names shifting nodes | evidence/cls/before-probe.json | open | |
| R4.2 | measure-cls.mjs before and after, 16 URLs, median of 7 | evidence/cls/before.json, evidence/cls/after.json | open | |
| R4.3 | settled screenshots d18, d19, d21 at 375 and 1440 | screenshots/ | open | |
| M1 | retry after lost response: one event, one Lead | evidence/m/m1.txt | open | |
| M2 | two emails, two Leads and eventIds | evidence/m/m2.txt | open | |
| M3 | Pixel and CAPI share event_id (network capture) | evidence/m/m3.txt | open | |
| M4 | fail open; sign-up after 24 h counts | evidence/m/m4.txt | open | |
| M5 | load, autofill, focus fire no form_start or Lead | evidence/m/m5.txt | open | |
| M6 | payload scan GA4, Pixel, CAPI, repeat response | evidence/m/m6.txt | open | |
| M7 | filled honeypot: zero writes, zero Lead | evidence/m/m7.txt | open | |
| J1 | Lane B: in-app UA 375, /season1?ad=d19&utm_*, sign-up (stubbed), confirmation, Text Karlin body has ad d19 | evidence/j/j1.txt | open | |
| J2 | Lane B: landing sign-up then /blog, no auto popup, flag set | evidence/j/j2.txt | open | |
| J3 | route tests: repeat inside 24 h, new after 24 h (query interval); H2 second device | evidence/j/j3.txt | open | |
| J4 | Lane B: /season1/join?src=email&utm_content=email-b CTA href keeps src and UTMs; signup loads; Stripe checkout is zero diff | evidence/j/j4.txt | open | |
| J5 | zero diff on b/*, jersey/*, next.config.mjs; curl -sI /karlin Location unchanged | evidence/j/j5.txt | open | |
| Repeat metric | Klaviyo: no flow triggers on `Season 01 Waitlist Repeat`; H2 shows one Waitlist plus one Repeat; readout counts Waitlist only | evidence/measure/repeat-metric.md | open | Jamie |
| Non-regression | git diff --stat 147897a on protected paths empty; full npm test | evidence/nonreg/diffstat.txt, evidence/nonreg/npm-test.txt | open | |
| Measurement rows | per-page GA4, Pixel, CAPI, Clarity, attribution capture incl. join/b, jersey, karlin | evidence/measure/*.txt | open | |
| H1 | real phone, d19 Instagram link, no hero jump | evidence/human/h1.md | open | Jamie |
| H2 | production d19 sign-up twice, 60 s apart, second device | evidence/human/h2.md | open | Jamie |
| H3 | real-browser autofill with saved Company on signup page | evidence/human/h3.md | open | Jamie |
| D15 awareness | review guide lists what /join drops vs old A (May 6, end-CTA price, friend ladder, `$60` literal); Jamie acknowledges | evidence/human/d15-ack.md | open | Jamie |
