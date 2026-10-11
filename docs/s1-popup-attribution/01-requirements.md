# 01 Requirements: Season 01 popup attribution fix (Fable)

Source: `knowledge-base/system/loops/handoffs/2026-10-11-s1-popup-attribution-fix.md`, Jamie's
answers in session 2026-10-11 (7-day Season 01 store: yes; push dev: yes; no merge or deploy
without his go), and his mid-session request to show the GA4 and Clarity network calls on
`/season1`. Base: `origin/dev` f981ef2 (app code identical to `origin/main` 327020e).

## Problem

A visitor who lands on `/season1` from an ad and then signs up through the site popup on another
page is recorded with empty utm_* and no ad. Cause (confirmed in code): `app/season1/landing.html`
writes nothing to storage and is served outside `app/layout.tsx`, so `CaptureAttribution` never
runs there; the popup reads only the current URL and `sessionStorage["ekuzo_attribution"]`.
Secondary: the popup never sends `utm_id` or `site`, and its `ad` fallback (`utm_content`, e.g.
`d5-a-showup`) is always rejected by the route's d1..d12 allowlist.

## Definitions

- **Ad keys**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`,
  `site`, plus `ad` (normalized `d1`..`d12`, else empty).
- **Ad touch**: at least one of the five `utm_*` values is non-empty. `ad` alone, `utm_id` alone or
  `site` alone is never a touch (a shared `?ad=d5` link is not paid traffic, and `captureAttribution`
  only recognizes records with a `utm_*` value, so an `ad`-only record could be overwritten).
- **Session record**: `sessionStorage["ekuzo_attribution"]` (existing key). Shape:
  `{utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, site, ad}`, all strings.
- **Return-visit record**: `localStorage["ekuzo_s1_attribution"]`, Season 01 only: the same eight
  keys plus `at` (ms timestamp). Valid while `0 <= now - at <= 7 days` (inclusive). A future, missing
  or non-numeric `at`, malformed JSON, non-string values (read as empty) or a throwing storage read
  count as no record.

## Functional

| ID | Requirement |
|---|---|
| F1 | On load, when its URL is an ad touch, `/season1` writes the eight keys from its own query string to the session record, replacing any existing session record (decision D1: a paid landing beats an earlier organic UTM in the same tab, and the latest ad landing wins, matching Meta's last-click model). Values capped at 200 chars. `ad` is stored only when the URL's `ad` normalizes to a valid d1..d12 (the page's d1 default for a missing or bad `ad` is never stored). |
| F2 | On the same condition, `/season1` writes the eight keys plus `at = Date.now()` to the return-visit record (latest ad landing wins; the 7 days run from it). |
| F3 | Storage writes in F1/F2 are wrapped so a storage exception never breaks the page, the form or any tracking call. They run on every host (no LIVE gate; storage is local). |
| F4 | The popup resolves attribution in this order and sends the winner's ad keys: (a) current URL is an ad touch → `attributionFrom: "url"`; (b) session record is an ad touch → `"session"`; (c) valid return-visit record that is an ad touch → `"return-visit"`; (d) otherwise empty values and `"none"`. `ad` comes from the same source as the rest (URL `ad`, else that source's stored `ad`; the old `utm_content` fallback is kept last for compatibility). |
| F5 | The popup request body carries `attribution` with all seven utm/utm_id/site keys and a new top-level `attributionFrom` string (a sibling of `attribution`, not inside it). Every other field (email, source, page, eventId, eventSourceUrl, ekz_hp) is unchanged. |
| F6 | `/api/season-one` adds one Klaviyo event property, `attribution_from`. Ad-landing: `"url"` when any of the seven attribution values is non-empty, else `"none"`. Site popup: the client's `attributionFrom` if it is one of `url`, `session`, `return-visit` AND at least one attribution value is non-empty, else `"none"`. Nothing else in the event or profile properties changes. |
| F7 | A popup sign-up after landing on `/season1?ad=d5&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d5-a-showup&utm_term=Instagram_Feed&utm_id=120251332838180600&site=ig` and navigating to `/` records `source: site-popup`, all utm_* filled, `utm_id`, `site`, `ad: d5`, `attribution_from: session`. |
| F9 | (Handoff scope 4, added 2026-10-11 11:30 CT: GA4 shows `form_start` for 92 of 136 users, about twice each, most likely in-app-browser autofill firing the `input` listener.) On `/season1`, `form_start {ad, where}` fires once per form only on a trusted user action in that email field: a trusted `pointerdown` (a real tap or click), a trusted `keydown`, or a trusted `paste`. A value change without one of these (autofill, script-set value, a synthetic or trusted `input` event with no key press) and the page's programmatic focus after a CTA tap never fire it. The `focus` and `input` listeners and the now-unused `progFocus` flag go. Nothing else in the funnel instrumentation changes. |
| F10 | (Handoff scope 5.) Investigate why Clarity showed the `signup` event on 1 session while 2 d5 landing sign-ups happened: whether `clarity("event","signup")` can run before Clarity is ready (queued by the snippet, or dropped), and when the beacon carrying it is uploaded relative to the call (a parent who closes the in-app browser right after signing up may never upload it). Findings with network evidence; a code change only if the evidence shows our call is lost, and then logged as a spec change. |
| F8 | Same landing, then the session ends (new tab or closed in-app browser, same browser), popup sign-up within 7 days records the same values with `attribution_from: return-visit`; after 7 days it records empty values and `none`. |

## Known limits (accepted, documented)

- The 7-day record lives in one browser. A visitor who hops from Instagram's or Facebook's in-app
  browser to Safari or Chrome starts with nothing, and Safari may cap script-written storage
  (Intelligent Tracking Prevention can clear it after about 7 days without interaction, sooner in
  some cases).
- A visitor who saw an ad, then reached `/` from the EKUZO social profile link or by typing the
  address, carries no attribution; Meta may still credit the ad. Tagging the profile link is a
  profile edit, outside this build.
- A return visit within 7 days credits the ad even if the visitor came back organically. That is by
  design; `attribution_from: return-visit` marks it so the readout can count or drop it.
- The landing page does not set `ekuzo_s1_joined`, so a parent who signed up on `/season1` and then
  opens the site can see the popup again (pre-existing; raised to Jamie, not changed here).

## Non-regression (zero-diff unless stated)

| ID | Requirement |
|---|---|
| N1 | Direct visit to `/` with no prior landing: popup sign-up records empty utm_*, utm_id, site, ad and `attribution_from: none` (no false paid credit). |
| N2 | Ad-landing sign-up: Klaviyo event and profile properties identical before and after, except the added `attribution_from` (compared after normalizing `eventId`, timestamps and `unique_id`). Landing request body identical after the same normalization. |
| N3 | Meta: browser `fbq` Lead calls and the CAPI Lead payload (event_name, event_id handling, content_name, user_data keys, event_source_url) identical before and after on both surfaces, compared with the Graph API fetch stubbed and random values normalized. No pixel or CAPI code changes. |
| N4 | `getAttribution()` and `captureAttribution()` source byte-identical (camps, 100, 101, teams code paths unchanged; while Season 01 mode is on those register pages redirect to the popup). |
| N5 | Games and age steps unchanged. |
| N6 | No visible change on `/season1` (d5 and one other ad, 1440 and 375) or the popup: screenshots before and after match within a small pixel tolerance (animation and font timing). No user-facing text touched; the landing.html diff is one added script block. |
| N7 | `/season1` funnel instrumentation still fires (Jamie, 2026-10-11): GA4 `page_view`, `cta_click`, `form_start`, `faq_open`, `generate_lead` and Clarity `set ad` and `event signup` (plus `set signed_up`), shown as captured network calls, before and after the change. Asserted two ways: the page-level calls (`dataLayer` entries and wrapped `clarity()` calls) and the intercepted collect beacons. Collect beacons are answered locally so no test data reaches GA4, Clarity or Meta. Run on localhost (inside the page's LIVE gate). |
| N8 | Browser console on `/season1` and `/` free of errors from our code. |

## Technical and privacy

| ID | Requirement |
|---|---|
| T1 | Stored records hold only the ad keys and a timestamp: no email, no game chips, nothing about the child. |
| T2 | `tsc --noEmit` and eslint clean on touched files; unit tests for the resolution and route logic run with `node --test` and their output is saved. |
| T3 | Docs: `docs/season-one-tracking.md` (storage, resolution order, `attribution_from`), `WORKLOG.md`, `docs/season1-launch/notes-for-aaron.md` (landing.html and SeasonOnePopup.tsx touched, nothing visible). |
| T4 | Live check (authorized by the Jamie-approved handoff's test-address rule): real Klaviyo "Season 01 Waitlist" events from the fixed route using `team+s1test-1011...@ekuzo.gg` addresses, with `META_CAPI_ACCESS_TOKEN` absent from the test server's env (the route's "skipped" log line captured as evidence). Before the write, confirm no flow is attached to list XGTv2F or metric XNJKbF. Read the event properties back from Klaviyo. The address is subscribed to XGTv2F (no flows); it is logged in the cleanup ledger and the ads log so the readout excludes it, as with the earlier test addresses. |
| T5 | Work on `dev` only; push dev; no merge to main, no production deploy, no Meta or Klaviyo configuration change. |
