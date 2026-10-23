# Relay notes (implementation of the frozen spec)

Worktree `s1-text-karlin-geo`, base origin/main 3572edc. Nothing committed. No `.env.local`, no network calls.

## Changes by requirement

- R1, R5, R6 (route.ts): text-karlin branch now does `const geo = readGeo(req); const t = tzProps(body.tz, geo);`, event props `{ phone, ad, hero, ...geo, ...t }`, profile props the existing two plus `...geoProfileProps(geo, t.tz)`. Main sign-up: same `geo` and `t` computed after the honeypot return; `...readGeo(req)` in eventProps became `...geo, ...t` (same position, before readDevice); profileProps gained `...geoProfileProps(geo, t.tz)`. `sendMetaLead` and the subscribe call are untouched.
- R2, R4, R7, R9 (lib/seasonOneGeo.ts, new): `text`, `cleanTz`, `UTC_ALIASES`, `parseGeoHeader`, `tzProps`, `geoProfileProps`. `readGeo(req)` in route.ts is a thin wrapper over `parseGeoHeader(req.headers.get("x-nf-geo"))`. Old keys behave as before except city and region use strip, trim, cap with `/["\\\u0000-\u001f\u007f-\u009f]/g`; country and postal are unchanged (not stripped). All helpers have try/catch and typeof guards; `cleanTz` checks length and regex before Intl.
- R3 (landing.html): exactly three changed lines: `const TZ=...` helper before `const post`, `tz:TZ` in the main sign-up body, `tz:TZ` in the text-karlin body. Line 986 sha256 identical to origin/main. `TZ` appears nowhere else as an identifier (grep hit on line 986 is inside base64 image data).
- R8: header comment names geo_tz, tz, tz_source, season1_city, season1_region, season1_tz; readGeo docstring rewritten (no "event properties only", no "checklist L2"). `docs/season-one-tracking.md`: geo table row updated, new `geo_tz` and `tz`/`tz_source` rows, the L2 sentence replaced, one paragraph added about the Text Karlin event and profile props.
- Tests: `lib/__tests__/season-one-geo.test.ts`, 58 tests: old-readGeo oracle over 24 fixtures, every M1 value, all 14 UTC aliases, J4/J6, strip order, fuzz (1 MB strings, deep nesting, symbols, __proto__).

## Ambiguities and how I resolved them

1. Docs intro line said Waitlist fields are "event properties only (not the profile ...)". That contradicts the new profile props, so I made a small edit to that one sentence beyond the geo lines.
2. `tzProps` second parameter is typed `unknown` (and re-validates `geo.geo_tz` with `cleanTz`, idempotent) so it cannot throw on odd input.
3. UTC alias detection compares the canonical name from `cleanTz`. On Node 22.23 every alias canonicalizes to "UTC" (so `tz` is "UTC" for any alias); the set holds the raw names too, so it works on ICU builds that keep "Etc/GMT". Not in the set (per spec list): `Etc/GMT+0`, `Etc/GMT-0`, `Etc/GMT0` is in. On this ICU, `Etc/GMT+0` also canonicalizes to "UTC", so it is covered; on other ICU builds it might not be.
4. `geoProfileProps` does not re-strip city or region (already stripped by `parseGeoHeader`); it only requires non-empty strings.
5. Lone-surrogate edge: the cap can split a surrogate pair in a city (pre-existing behaviour, unchanged).

## Results

- `npx tsc --noEmit`: exit 0, no errors (tsc.txt).
- season-one-geo 58/58, season-one-attribution 30/30.
- ekuzo101-weeks 14/15: 1 failure ("buildWeeksLabel includes the time string", label has "7-8:30 PM local time"). I changed nothing under lib/ekuzo101-weeks*, so this is pre-existing on main; QA should confirm in the N7 baseline.
- git diff --stat: route.ts, landing.html, season-one-tracking.md modified; seasonOneGeo.ts and the test are new. WORKLOG.md not touched (spec lists it under Fable/docs; I did not write the entry, Fable's call).

## Not done

- No route-level tests, no browser tests, no screenshots (Sentry's job).
- No WORKLOG.md entry.
