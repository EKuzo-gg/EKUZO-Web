# Frozen spec (Fable, 2026-10-23)

Requirements: `01-requirements.md`. Decisions: `03-decision-log.md`. Later deviations need a logged
spec change in the decision log.

## Files touched (only these)
- `app/api/season-one/route.ts` (Jamie's lane)
- `app/season1/landing.html` (two request bodies only; no markup, CSS or copy)
- `lib/__tests__/season-one-geo.test.ts` (new unit tests for the pure helpers)
- `WORKLOG.md` (entry at top), `docs/s1-text-karlin-geo/*`

## Server contract (`route.ts`)
1. `cleanTz(v: unknown): string` per R4. Export-free module-level function. Pure.
2. `readGeo` adds `geo_tz: cleanTz(g?.timezone)` and strips `/["\\]/g` from city (R2, R7).
   To keep the helpers unit-testable without Next, move `cleanTz` and a pure `parseGeoHeader(h:
   string | null)` into `lib/seasonOneGeo.ts`; `readGeo(req)` in the route becomes
   `parseGeoHeader(req.headers.get("x-nf-geo"))`. Behavior for existing keys is byte-identical
   except the city strip.
3. `tzProps(bodyTz: unknown, geo): { tz, tz_source }` per R5, also in `lib/seasonOneGeo.ts`.
4. `geoProfileProps(geo, tz): Record<string,string>` returns only non-empty of
   `season1_city`, `season1_region`, `season1_tz` (R6).
5. text-karlin branch: `const geo = readGeo(req); const t = tzProps(body.tz, geo);` event props
   `{ phone, ad, hero, ...geo, ...t }`; profile props existing two plus `...geoProfileProps(geo, t.tz)`.
6. Main sign-up: replace `...readGeo(req)` in eventProps with the same `geo` object plus `...t`;
   profileProps gains `...geoProfileProps(geo, t.tz)`. `sendMetaLead` untouched.
7. The route imports from `@/lib/seasonOneGeo` (alias already used for `@/lib/metaCapi`).

## Client contract (`landing.html`)
- One helper near `post`: `const TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(_){return ""}})();`
- Main sign-up body adds `tz:TZ`; text-karlin body adds `tz:TZ`. Nothing else in the file changes.

## Tests
- Unit (`node --test`, same resolver hook as `lib/__tests__/season-one-attribution.test.ts`):
  cleanTz (valid, canonicalized case, every M1 value), parseGeoHeader (base64 JSON, raw JSON,
  garbage, array, missing, timezone invalid, city with quotes), tzProps (browser, geo, neither),
  geoProfileProps (empties dropped).
- Route (Sentry): `next dev` with `KLAVIYO_PRIVATE_API_KEY=dummy`, no Meta token, and a
  `NODE_OPTIONS=--import` preload that replaces `globalThis.fetch` for `a.klaviyo.com` and
  `graph.facebook.com` with a recorder returning 200/202, writing each request body to
  `docs/s1-text-karlin-geo/evidence/fetch-log.jsonl`. Requests carry a synthetic `x-nf-geo`.
  A preflight check proves the stub is active (a request whose recorded body appears in the log)
  before any functional test counts.
- Browser (Sentry): landing at `/season1?ad=d10` with the analytics hosts blocked from the first
  request (fail-closed gate), sign up, submit the text card; capture both request bodies; console
  clean; fbq Lead count = 1; screenshots 1440 and 375 of hero and confirmation, before (main) and
  after (branch).

## Pre-flight results (Fable, live, read-only, 2026-10-23 09:30 CT)
- Klaviyo flow Vk9VxY "Season 01 Text Karlin alert": LIVE, trigger metric TbgGx7, `trigger_filter`
  null, `profile_filter` null. Actions: webhook "Discord #ad-leads-texts" (body
  `New text request | Phone: {{ event.phone }} | Email: {{ person.email }} | Ad: {{ event.ad }} (hero: {{ event.hero }}) | Emoji this once texted.`),
  then internal alert email to karlin@ekuzo.gg (template XqfkdH).
- Whether Netlify's `x-nf-geo` carries `timezone`: unverified (no raw header visible). Code is
  defensive; the post-deploy check answers it (`tz_source` "geo" on a popup sign-up).

## Human-action items (after deploy, not in this build)
- H1 Jamie: release per `docs/dev-runbook.md` § Releasing when dev carries work main must not get.
- H2 Jamie's go, then Claude in Klaviyo: webhook body becomes
  `New text request | Phone: {{ event.phone }} | Email: {{ person.email }} | Location: {{ event.geo_city }}, {{ event.geo_region }} ({{ event.tz }}) | Ad: {{ event.ad }} (hero: {{ event.hero }}) | Emoji this once texted.`
  and the same Location line in template XqfkdH. Requests before deploy show a blank location.
- H3 One live test text request with an address added to the `plan.md` exclusion list; it posts
  to #ad-leads-texts and emails Karlin, so tell the channel first (or add a flow profile filter
  excluding `team+s1test` addresses: Jamie's call).
- H4 Log the deploy time in `Marketing/ads/2026-10-season-one/log.md` (page change = read confounder).

## Phase 1 spec changes (Auditor, accepted)
See `01-requirements.md` § Phase 1 spec changes; they amend this contract:
- `readGeo(req)` stays in route.ts as a thin wrapper over `parseGeoHeader`.
- `lib/seasonOneGeo.ts` defines its own `text` helper (no import from route.ts) and exports
  `cleanTz`, `parseGeoHeader`, `tzProps`, `geoProfileProps`, `UTC_ALIASES`.
- `tzProps` implements amended R5 (UTC aliases are weak).
- Files list adds `docs/season-one-tracking.md` (geo lines only).
- Route tests use dummy Meta token and pixel id with graph.facebook.com stubbed.
- Pre-existing, not fixed here, for the review guide: EMAIL_RE admits `"`, and the live webhook
  already interpolates `{{ person.email }}` into JSON; Klaviyo autoescape may render an apostrophe
  in a city as `&#39;` in Discord (check in H2).
