# Auditor, phase 1 (requirements and frozen spec)

Verdict: SIGN-OFF WITH CHANGES. No blockers. Four majors should be fixed in the spec before Relay starts; the minors can be folded in as written.

## Findings

1. **major, J4 contradicts R5/R6.** J4 says a request with no `x-nf-geo` writes "no profile geo props". With a valid browser tz, `season1_tz` is non-empty, so R6 writes it. Fix: reword J4 to "no `season1_city` or `season1_region`; `season1_tz` is written only if the browser tz is valid; `geo_*` event props are empty strings; 200." Add a J6: header present but only `timezone` set, so `season1_tz` alone is written.

2. **major, browser "UTC" beats a good geo tz (R5 / decision 2).** Privacy-hardened browsers (Firefox resistFingerprinting, Tor, some in-app webviews) report "UTC". Under "browser first" that value wins and Karlin texts a US family at the wrong hour, which is the exact failure this build exists to prevent. Fix: in `tzProps`, treat browser `UTC`, `Etc/UTC`, `Etc/GMT`, `GMT` as weak: use geo_tz when it is non-empty and not one of those, else keep the browser value, `tz_source` "browser". Add unit rows for it.

3. **major, R7 claim is false for region.** `code()` accepts any string up to 8 chars, so `US"}` or `\` survives in `geo_region`, and H2 puts `{{ event.geo_region }}` inside the Discord JSON body. Also, city can carry JSON-breaking control characters (newline, tab) after JSON parsing. Fix: strip `/["\\\u0000-\u001f\u007f-\u009f]/g` from city and region (specify strip, then trim, then 80-char cap). Rewrite the R7 sentence. Out of scope but worth a note to Jamie: the existing webhook body already interpolates `person.email`, and `EMAIL_RE` admits `"` and `\`. Also add to H2: check how Klaviyo renders an apostrophe city ("Coeur d'Alene") in the webhook body (HTML escaping).

4. **major, the Meta gate can pass vacuously (N1, M3).** The spec runs with "no Meta token". `sendCapiEvent` returns early without a token and pixel id, so no `graph.facebook.com` body is ever recorded and "no tz/geo in the Lead payload" proves nothing. Fix: run with dummy `META_CAPI_ACCESS_TOKEN` and `META_PIXEL_ID`, stub graph.facebook.com, and add a positive control (a Lead body is recorded with `em`) before grepping it for `tz|geo|timezone|season1_`.

5. **major, "byte-identical" and "only additions" have no mechanical gate (N4, spec item 2).** Fix: (a) a unit test that keeps the old `readGeo` body as an oracle and asserts `parseGeoHeader` equals it on every fixture except the city strip; (b) run the same request suite on origin/main and on the branch, normalize `time`, `unique_id`, `season1_joined_at`, `season1_text_requested_at`, then assert branch keys minus {geo_tz, tz, tz_source, season1_city, season1_region, season1_tz} equal main keys with equal values, and the subscribe body is identical.

6. **minor, helpers must never throw.** Anything thrown inside the `try` becomes a 502 and a failed text request. Add a requirement and a fuzz row: `cleanTz`, `parseGeoHeader`, `tzProps`, `geoProfileProps` return for objects, arrays, null, symbols-as-strings, 1 MB strings, cyclic-free deep JSON. `cleanTz` must also run the regex before `Intl` (already so) and cap length first.

7. **minor, retries and double submit are not in the journeys.** Add J7: text-karlin sent twice (double click, or retry after a 502 the server had already accepted) yields two events with identical geo/tz props and no new failure mode; note the pre-existing duplicate alert risk (`unique_id` uses `Date.now()`), unchanged by this build. Add J8: main sign-up retry reuses `eventId`, sends the same `tz`, one fbq Lead.

8. **minor, N6 and "two request bodies only" are not mechanical.** Fix: gate on `git diff --name-only origin/main` equal to the spec's file list, and `git diff -U0 app/season1/landing.html` showing exactly three changed lines (helper, main body, text body) and line 986 untouched. Screenshots need a rule: pixel diff equal 0 on hero and confirmation at 1440 and 375, or a stated tolerance.

9. **minor, browser gate wording (N1/M4).** "analytics hosts blocked so fbq Lead count = 1" is unclear: the inline snippet defines `window.fbq` as a queue even when the script is blocked, so count `fbq.queue` entries named Lead, and record `dataLayer` and `clarity` queue entries; M4 passes when the event lists match main's exactly. J2 needs a stated mechanism (`addInitScript` that makes `Intl.DateTimeFormat` throw, and a second run with `Intl` deleted).

10. **minor, test brittleness.** Canonical-name assertions depend on the ICU build (`Asia/Calcutta` vs `Asia/Kolkata`). Assert case canonicalization on stable zones (`america/chicago`, `UTC`) only. Name the `TZ` constant check: `TZ` is unused elsewhere in landing.html (verified by grep outside line 986), so no collision.

11. **minor, R8 has no gate; docs go stale.** Gate R8 with a grep that the header comment names `geo_tz`, `tz`, `tz_source`, `season1_city/region/tz`, and fix the now-wrong `readGeo` docstring ("event properties only"; profile props are now written) and the stale "checklist L2" line. `docs/season-one-tracking.md` lines 75-79 list the geo properties and say Klaviyo event only; add that file to "Files touched" and update it. N7 needs a baseline: record the main test results first, then compare.

12. **minor, naming.** R1 says `readGeo(req)`; spec 2 turns it into `parseGeoHeader`. State that `readGeo` stays as a thin wrapper, and that `lib/seasonOneGeo.ts` defines its own `text` (no import from route.ts).

## Coverage checked and fine
Unknown step 400, honeypot (returns before any event), bad phone 400, and the popup path (it sends no `tz`, never uses text-karlin) are untouched by the change. Missing header is covered once J4 is fixed. `sendMetaLead` never reads event props, so N1 holds by construction once finding 4 proves it.
