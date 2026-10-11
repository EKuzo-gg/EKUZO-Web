# 04 Evidence ledger (Auditor format, compiled by Fable)

Requirement to evidence. Verified-by: S = Sentry (independent), F = Fable, R = Relay self-test (never final).

| ID | Test | Evidence | Result | Verified by |
|---|---|---|---|---|
| F1 | Landing writes session record on an ad touch, latest wins, valid ad only, 200 cap | evidence/f7-f8-n1.md, evidence/adversarial.md (ADV-3, 4, 7, 8) | PASS | S |
| F2 | Landing writes 7-day record with `at` | evidence/f7-f8-n1.md | PASS | S |
| F3 | Storage guarded, every host | evidence/adversarial.md (ADV-1a/b), raw-f3-extra.json | PASS | S |
| F4 | Popup resolution url > session > return-visit > none | evidence/f7-f8-n1.md, adversarial.md, sentry-unit-tsc-eslint.txt (30 unit tests) | PASS | S |
| F5 | Popup body: 7 keys + top-level attributionFrom, rest unchanged | evidence/popup-request-body-F7.json, n2-n3-n5.md | PASS | S |
| F6 | Route attribution_from rules | evidence/adversarial.md (RT-1 to RT-12) | PASS | S |
| F7 | Landing, then /, then popup records site-popup + all keys + ad d5 + session (baseline shows the bug) | evidence/f7-f8-n1.md, raw-f7-*.json | PASS | S |
| F8 | Return visit within 7 days; expired and future give none | evidence/f7-f8-n1.md | PASS | S |
| F9 | form_start only on trusted tap, key or paste | evidence/f9-form-start.md, raw-f9-form-start.json | PASS (real in-app autofill: device check, D-005) | S |
| F10 | Clarity signup timing investigation | evidence/f10-clarity-signup.md | PASS, no code change | S |
| N1 | Direct / gives none | evidence/f7-f8-n1.md | PASS | S |
| N2 | Ad-landing unchanged except attribution_from url | evidence/n2-n3-n5.md | PASS | S |
| N3 | Meta fbq + CAPI identical | evidence/n2-n3-n5.md | PASS | S |
| N4 | getAttribution/captureAttribution source unchanged | evidence/sentry-mechanical.txt | PASS | S |
| N5 | Games step unchanged | evidence/n2-n3-n5.md | PASS | S |
| N6 | No visible change, 6 pairs, 0 differing pixels | evidence/n6-screenshots.md; PNGs kept outside the repo in EKUZO/Marketing/ads/2026-10-season-one/build/s1-popup-attribution/ | PASS | S |
| N7 | GA4 + Clarity calls on /season1, page level and network, baseline vs build | evidence/n7-ga4-clarity-network.md, raw-n7-ga4-clarity.json | PASS | S |
| N8 | Console clean | evidence/n8-console.md | PASS | S |
| T1 | Records hold only ad keys + timestamp | evidence/adversarial.md | PASS | S |
| T2 | tsc, eslint, unit tests executed | evidence/sentry-unit-tsc-eslint.txt | PASS with D-002 accepted (route rule covered by 18 executed HTTP cases, not a unit test) | S, F |
| T3 | Docs updated | docs/season-one-tracking.md, WORKLOG.md, docs/season1-launch/notes-for-aaron.md (D-001 resolved by Fable after the QA pass) | PASS | F |
| T4 | Live Klaviyo events from the fixed route, Meta off, read back | 06-cleanup-ledger.md; Klaviyo events 7wnxqja73rN (site-popup: all utm_*, utm_id 120251332838180600, site ig, ad d5, attribution_from session, device android/mobile) and 7wnx9QA3qwi (ad-landing: same values, attribution_from url) | PASS | F |
| T5 | dev only until Jamie's go; then release | Jamie, 2026-10-11 12:28 CT: "feel free to push everything live" | see 07-review-guide.md | F |

## Defect triage (Fable)

| Defect | Disposition |
|---|---|
| D-001 docs | Resolved (T3). |
| D-002 no unit test for the route rule | Accepted minor: the rule is six lines, covered by 18 executed HTTP cases and the live test. |
| D-003 landing vs lib ad normalizer on `d010` / `" d5"` | Accepted minor: no ad URL produces these; Meta URLs carry `ad=d1`..`d12`. |
| D-004 possible localhost beacons | Accepted, disclosed to Jamie; filter on hostname localhost. Lesson: browser QA that loads GA4 or Clarity starts behind a fail-closed proxy. |
| D-005 real autofill and in-app browsers untested | Human check in 07-review-guide.md. |
| D-006 tab-in without a key press no longer counts | Intended (F9). |
| D-007 clarity.js SecurityError when storage throws | Third party, identical on baseline. |
| D-008 scroll fired form_start | Fixed 2026-10-11 (`click` replaces `pointerdown`), retested by Fable: live code A scroll on bottom field [bottom], B scroll on top field [top]; fix A [], B []; C tap+type [top] both; D page only [] both; E synthetic autofill [] both; F trusted fill [] both; G CTA focus [] both; H desktop click [top] both; I paste [bottom] both; J both fields [top, bottom] both. |
