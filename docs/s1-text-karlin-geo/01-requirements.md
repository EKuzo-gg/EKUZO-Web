# Text Karlin alert: location and time zone (Build Loop, 2026-10-23)

Source spec: `EKUZO/Marketing/ads/2026-10-season-one/proposals/2026-10-23-text-karlin-location-spec.md`.
Base: `origin/main` 3572edc (route and landing file identical on `origin/dev` 801c93b).
Branch: `build/s1-text-karlin-geo`, worktree `.claude/worktrees/s1-text-karlin-geo`.

## Why
Karlin texts parents 9 am to 8 pm their time. The "Season 01 Text Karlin" event carries no location
or time zone, and the area code is not a safe guess (10-22 d10 request: 323 number, Netlify placed
the sign-up in Southbridge, MA).

## Product and technical requirements

- **R1** The `text-karlin` step adds `geo_country`, `geo_region`, `geo_city`, `geo_postal` from
  `readGeo(req)` to the "Season 01 Text Karlin" event properties. Existing `phone`, `ad`, `hero`
  unchanged.
- **R2** `readGeo` also returns `geo_tz` from the header object's `timezone` field, only if it
  passes the time zone validator (R4); else "". Applies to every caller (Waitlist and Text Karlin).
- **R3** The landing text-card submit (`app/season1/landing.html`) sends
  `tz: Intl.DateTimeFormat().resolvedOptions().timeZone`, read inside try/catch so a browser without
  Intl still submits (tz ""). The main ad-landing sign-up sends the same `tz` field.
- **R4** Server validator `cleanTz(v)`: string only; matches `^[A-Za-z0-9_+\-/]{1,64}$`; and
  `new Intl.DateTimeFormat("en-US", { timeZone: v })` does not throw. Returns the canonical name from
  `resolvedOptions().timeZone`; anything else returns "".
- **R5** Event property `tz` = validated browser tz if present, else `geo_tz`, else "".
  Event property `tz_source` = "browser" | "geo" | "". `geo_tz` is also kept as its own property.
  Applies to the Text Karlin event and the Season 01 Waitlist event.
- **R6** Profile properties `season1_city`, `season1_region`, `season1_tz` are written on both the
  Text Karlin and the Waitlist events, each **only when non-empty**, so a request without geo never
  blanks a value an earlier request stored.
- **R7** `geo_city` has `"` and `\` stripped (it is interpolated into the Discord webhook's JSON body
  after deploy). Region is a short code; tz is validated, so neither can carry them.
- **R8** Header comment in `route.ts` documents the new fields; no lat/long kept, still Klaviyo only.

## Non-regression (must not change)

- **N1** Meta: no geo, tz or tz_source in the CAPI Lead payload; the text-karlin step sends nothing
  to Meta; the browser `fbq` Lead fires once per main sign-up and never on the text step.
- **N2** Text-karlin validation unchanged: a bad phone still 400 "Check the number and try again.";
  stored as E.164; still no `phone_number`, no SMS consent.
- **N3** Unknown `step` still 400; honeypot still silent 200 with no Klaviyo write and no Lead;
  games and age steps unchanged; bad email 400 unchanged.
- **N4** Waitlist event keeps every existing property and value (only additions), and the list
  subscribe call is byte-identical.
- **N5** Site popup (`components/ui/SeasonOnePopup`) is not edited; its sign-ups still succeed and
  get `tz` from geo when the header has it.
- **N6** No visual change to the landing page or confirmation card (screenshots before and after).
- **N7** `tsc` clean, `next build` clean, existing test suites same results as on main.

## Journeys

- **J1** Ad landing in an in-app browser (Instagram/Facebook UA) → sign-up → text card submit:
  both requests carry `tz`; the server accepts it.
- **J2** Same, in a browser where `Intl.DateTimeFormat` throws or is missing: sign-up and text
  request both still succeed, tz falls back to geo.
- **J3** Site popup sign-up (no `tz` sent): Waitlist event gets `tz` from `geo_tz`, `tz_source` "geo".
- **J4** Request with no `x-nf-geo` header (local, or a Netlify gap): empty geo props, no profile
  geo props written, 200.
- **J5** Text request from a family whose Waitlist event had geo, but the text request has none:
  the profile keeps its earlier `season1_city/region/tz` (R6).

## Must-not cases

- **M1** `tz` as object, array, number, null, 65+ chars, `"../etc"`, `"America/Chicago\"}"`,
  `"Not/AZone"`, empty: dropped to "" (or geo fallback), request still succeeds.
- **M2** Malformed `x-nf-geo` (not base64, not JSON, an array, timezone invalid): empty fields, 200.
- **M3** No tz, geo or tz_source key in anything sent to Meta (N1).
- **M4** The new client code fires no GA4, Clarity or Meta event of its own.

## Acceptance

Every R, N, J and M row has a ledger entry with an evidence path, verified by Sentry (not Relay).
Post-deploy live check and the alert-line change are human-action items (see frozen spec).

## Phase 1 spec changes (Auditor findings, accepted by Fable, 2026-10-23)

Where these conflict with rows above, these win.

- **J4 (reworded)** No `x-nf-geo` header: `geo_*` empty; `season1_city` and `season1_region` not
  written; `season1_tz` written only if the browser tz is valid. 200.
- **J6** Header with only a valid `timezone`: `geo_tz` set, other geo empty, tz from browser or geo per R5.
- **J7** text-karlin sent twice (double tap, retry after a 502 the server had accepted): two events
  with identical geo/tz props, no new failure mode. Duplicate alerts are pre-existing (unique_id uses
  Date.now()) and out of scope.
- **J8** Main sign-up retried after a network error: same props each time.
- **R5 (amended)** A browser tz that is a UTC alias (`UTC`, `Etc/UTC`, `Etc/GMT`, `GMT`, `Etc/UCT`,
  `UCT`, `Etc/Universal`, `Universal`, `Etc/Zulu`, `Zulu`, `Etc/GMT0`, `GMT0`, `Etc/Greenwich`,
  `Greenwich`) is weak: a valid non-UTC `geo_tz` wins (`tz_source` "geo"); else the UTC value is used
  (`tz_source` "browser").
- **R7 (amended)** City and region both strip `/["\\\u0000-\u001f\u007f-\u009f]/g`, in the order
  strip, trim, cap. Applies to every caller.
- **R9** The four helpers never throw on any input (objects, arrays, null, numbers, 1 MB strings).
- **R8 gate** grep: header comment names `geo_tz`, `tz`, `tz_source`, `season1_city`,
  `season1_region`, `season1_tz`; the readGeo docstring no longer says "event properties only" and
  drops the stale "checklist L2" line; `docs/season-one-tracking.md` geo lines updated.
- **N1/M3 gate** Run route tests with dummy `META_CAPI_ACCESS_TOKEN` and `META_PIXEL_ID` so a CAPI body
  is actually recorded (positive control: one Lead body present), then assert no tz/geo keys in it.
- **N4 gate** (a) oracle unit test: old readGeo body kept in the test, `parseGeoHeader` equals it on
  every fixture except the strip; (b) the same request suite against main and branch, timestamps and
  unique_id normalized, diff shows only the added keys; subscribe body identical.
- **N6 gate** `git diff --name-only origin/main` equals the spec file list; `git diff -U0` on
  landing.html shows exactly 3 changed lines, line 986 untouched; before/after screenshots compared
  by pixel diff (zero differing pixels, or differences explained).
- **M4 gate** count `fbq.queue` Lead entries (=1) and record dataLayer and clarity queues; lists
  identical to main's for the same journey.
- **J2 mechanism** `Intl.DateTimeFormat` replaced by a throwing function via an init script.
- **N7 gate** baseline run of tsc and existing tests on main recorded beside the branch run.
- Unit tests assert canonicalization on stable zones only (`america/chicago`, `UTC`).
