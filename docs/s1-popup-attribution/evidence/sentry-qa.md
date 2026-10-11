# Sentry QA report: Season 01 popup attribution fix

Build under test: branch dev at f981ef2 plus the uncommitted working tree (4 modified files, 1 new test file). Baseline: HEAD f981ef2 copied to /home/claude/qa/baseline (verified identical to HEAD for app, lib, components, middleware, next.config.mjs). Baseline dev server :3001, build dev server :3002. T4 (live Klaviyo) is not covered here.

Harness: Playwright (Chromium 141, revision 1194), scripts in /home/claude/qa/. Server-side Klaviyo and Meta Graph calls intercepted in process; browser-side GA4, Clarity and Meta traffic intercepted and, from the second half of the pass, backstopped by a blocking proxy. **Read evidence/network-guard.md: before the guard existed, teardown beacons from about 60 browser contexts may have reached the real GA4 property and Clarity project (localhost hostname, no personal data).**

## Summary

| ID | Test | Method | Evidence | Verdict | Notes |
|---|---|---|---|---|---|
| F1 | Landing writes the 8 keys to the session record on an ad touch, replacing any earlier record, ad stored only if valid, 200-char cap | F7 run, ADV-3, ADV-4, ADV-7, ADV-8 | evidence/f7-f8-n1.md, evidence/adversarial.md | **PASS** | Session record after landing has all 8 keys; d5 then d7 and organic then ad both end on the ad (D1); bogus/missing ad stored empty; 1000-char values stored at 200. |
| F2 | Landing writes the return-visit record with `at` | F7 run, ADV-8 | evidence/f7-f8-n1.md | **PASS** | localStorage `ekuzo_s1_attribution` holds `at` plus the same 8 keys; latest landing wins (d7 over d5). |
| F3 | Storage writes guarded, every host, never break page/form/tracking | ADV-1a, ADV-1b, F3 extras | evidence/adversarial.md | **PASS** | Throwing storage: page, sign-up, GA lead and Clarity signup all fire once; non-LIVE host (127.0.0.1) still writes storage. Only page error is third-party clarity.js (same on baseline). |
| F4 | Popup resolution order url, session, return-visit, none; ad from the same source | F7, F8, ADV-2, ADV-2b, ADV-5, ADV-6 | evidence/f7-f8-n1.md, evidence/adversarial.md | **PASS** | URL beats session (ADV-5); invalid/odd records fall through to none (ADV-2); non-string values read as empty (ADV-2b); 30 unit tests pass. |
| F5 | Popup body carries 7 attribution keys plus top-level attributionFrom; other fields unchanged | N2/N3 popup-direct diff, F7 body | evidence/popup-request-body-F7.json, evidence/n2-n3-n5.md | **PASS** | Only differences vs baseline: utm_id, site (empty when none) and attributionFrom added; email, source, page, eventId, eventSourceUrl, ekz_hp unchanged. |
| F6 | Route adds attribution_from with the specified rules | RT-1 to RT-12, F7, F8 | evidence/adversarial.md | **PASS** | Forged session with empty attribution gives none; evil label gives none; array/string attribution gives 200 and empty values; ad-landing ignores the client label. |
| F7 | Landing then / then popup records source, all utms, utm_id, site, ad d5, session | t_f7f8 (build and baseline) | evidence/f7-f8-n1.md, evidence/popup-request-body-F7.json | **PASS** | Baseline shows the bug (all empty); build records everything with attribution_from session. |
| F8 | New session keeps values as return-visit within 7 days; none after | t_f8n1 | evidence/f7-f8-n1.md | **PASS** | Context from the landing's storageState gives return-visit; at now-7d+60s return-visit; now-7d-60s none; now+60s none. |
| F9 | form_start fires once per form only on trusted pointerdown/keydown/paste | t_f9 (9 scenarios, baseline and build) | evidence/f9-form-start.md | **PASS** | Build 0 on simulated autofill, trusted fill/insertText and CTA focus; 1 per form on tap, click, typing, paste; baseline over-counts rows 1, 2a, 2b (both forms). Real Chrome autofill not drivable in headless; real in-app browser autofill untested. |
| F10 | Clarity signup timing investigation | t_f10 (normal, delayed clarity.js, blocked, close-after, idle) | evidence/f10-clarity-signup.md | **PASS** | Investigation delivered. Call is queued and replayed if Clarity is late; uploaded about 0.95 s after the call; pagehide sendBeacon carries it on an early close. Lost only if Clarity never loads (blockers) or the page dies without pagehide. No code change indicated. |
| N1 | Direct visit: all empty, none | t_f8n1 | evidence/f7-f8-n1.md | **PASS** | Empty utm_*, utm_id, site, ad; attribution_from none. |
| N2 | Ad-landing request and Klaviyo bodies identical except attribution_from url | t_n2n3n5 (4 scenarios) | evidence/n2-n3-n5.md | **PASS** | Browser request diff empty; Klaviyo diff is exactly attribution_from: url. |
| N3 | Meta fbq Lead and CAPI body identical | t_n2n3n5 | evidence/n2-n3-n5.md | **PASS** | CAPI and fbq diffs empty on both surfaces, with and without fbclid. |
| N4 | getAttribution/captureAttribution source unchanged | git diff -U0 lib/attribution.ts | evidence/sentry-mechanical.txt | **PASS** | Single hunk @@ -107,0 +108,146 @@: pure addition below getAttribution. CaptureAttribution first-touch no-op on / confirmed (F7 stOnHome keeps the 8-key record). |
| N5 | Games step unchanged | t_n2n3n5 | evidence/n2-n3-n5.md | **PASS** | Games Klaviyo body identical after normalization; route ignores attribution on the step (RT-11). |
| N6 | No visible change /season1 d5, d3, popup at 1440 and 375 | t_n6 pixelmatch | evidence/n6-screenshots.md, screenshots/*.png | **PASS** | All 6 pairs 0 differing pixels (noise floor also 0). |
| N7 | Funnel instrumentation still fires, shown as page-level and network calls | t_n7 baseline vs build | evidence/n7-ga4-clarity-network.md | **PASS** | Page-level lists and decoded GA4 and Clarity beacons identical baseline vs build. |
| N8 | No console errors from our code | t_n6/t_n8, all runs | evidence/n8-console.md | **PASS** | 0 errors, 0 warnings, 0 page errors on 12 page loads and in every functional run. |
| T1 | Stored records hold only ad keys and a timestamp | ADV T1 | evidence/adversarial.md | **PASS** | Keys exactly ad, at, site, utm_*; no email or chips after a landing sign-up and a chip tap. |
| T2 | tsc, eslint clean; unit tests for resolution and route logic | node --test, tsc --noEmit, eslint | evidence/sentry-unit-tsc-eslint.txt | **FAIL** | 30/30 tests pass, tsc exit 0, eslint exit 0. But no unit test covers the route's attribution_from derivation (inline in route.ts) or the landing/lib ad normalizer parity: logged D-002, D-003 (minor). Route behavior is covered by RT-1 to RT-12 here. |
| T3 | Docs updated (season-one-tracking.md, WORKLOG.md, notes-for-aaron.md) | git status, grep | evidence/sentry-mechanical.txt | **FAIL** | At the time of this pass none of the three files has changed (git status shows only the 4 code files and the new test). season-one-tracking.md still says the popup sends only five utm keys and describes form_start as focus or typing. Logged D-001. Re-check after docs land. |
| ADV-1a | storage throws: landing page, form and sign-up still work (confirmation shown, Klaviyo event with attribution_from url, GA generate_lead and Clarit... | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-1b | storage throws: popup on / still opens and signs up, attribution none (nothing readable) | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:malformed {bad | both keys hold {bad: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:JSON array | both keys hold [1,2]: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:JSON string | both keys hold "x": popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:JSON null | both keys hold null: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:number | both keys hold 42: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:object with non-string values | both keys hold {"at":1791738913556,"utm_source":5,"utm_medium":{"a":1},"utm: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:at as string | return-visit key only holds {"at":"1791738913556","utm_source":"meta","ad":"d5"}: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:at null | return-visit key only holds {"at":null,"utm_source":"meta","ad":"d5"}: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2:at NaN-like (1e999) | return-visit key only holds {"at":1e999,"utm_source":"meta","ad":"d5"}: popup works, resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-2b | session record with valid utm_source plus non-string others: strings kept, non-strings become empty, from session | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-3 | landing d5 then d7 in the same tab, then /: d7 wins (D1) | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-4 | organic utm page first, then /season1 d5, then /: d5 wins (D1) | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-5 | after landing, popup on /?utm_source=newsletter: URL wins, from url, ad empty, other keys empty | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-6:/season1?ad=d5 | landing /season1?ad=d5 writes nothing; popup on / resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-6:/season1?ad=d5&utm_id=123&site=ig | landing /season1?ad=d5&utm_id=123&site=ig writes nothing; popup on / resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-6:/season1 | landing /season1 writes nothing; popup on / resolves to none | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-7 | ?ad=bogus with full utms: stored ad empty, utms stored; d05 -> d5 (full table in detail) | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| ADV-8 | 1000-char values capped at 200 in both stores (route then applies its own caps) | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| T1 | stored records after landing sign-up + game chip: only ad keys + at; no email, no chip text | t_adv | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-1 | forged attributionFrom=session with empty attribution -> none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-2 | attributionFrom=evil with utms -> none (utms still stored) | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-3:array | attribution as array -> 200, empty values, none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-3:string | attribution as string -> 200, empty values, none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-3:number | attribution as number -> 200, empty values, none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-3:null | attribution as null -> 200, empty values, none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-3:array of objects | attribution as array of objects -> 200, empty values, none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-4:url | valid label url with utms passes through | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-4:session | valid label session with utms passes through | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-4:return-visit | valid label return-visit with utms passes through | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-5 | popup with utms but no attributionFrom -> none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-5b | attributionFrom as array -> none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-6 | ad-landing with utms ignores client label -> url | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-7 | ad-landing with no utms (client claims session) -> none | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-8 | ad-landing with only site -> url (any of the seven) | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-9 | unknown source falls back to site-popup and keeps the label | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-10 | popup ad=d5-a-showup (old utm_content fallback value) is rejected by the route allowlist -> ad empty, rest intact | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-11 | games step ignores attribution/attributionFrom (event props have no attribution_from) | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |
| RT-12 | route ad normalizer table (informational) | t_route | evidence/adversarial.md | **PASS** | see adversarial.md |

FAIL count: 2 (T2, T3). Everything else PASS. Defects: see 05-defect-log.md.

## Not tested / limits

- Real browser autofill (Chrome's Autofill.trigger rejected in headless; in-app webviews untested).
- iOS/Android in-app browser close behavior for Clarity (no pagehide); only desktop Chromium.
- Safari ITP storage caps and the Instagram/Facebook in-app browser storage jar (documented known limits).
- GA4 and Clarity server-side processing (collect calls are answered locally, so nothing is processed).
- T4 live Klaviyo.
