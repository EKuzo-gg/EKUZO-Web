# Season 01 sign-up tracking

Two surfaces post to `POST /api/season-one`:

- **Ad landing page**: `app/season1/landing.html` (the single source of truth), served natively at **`/season1?ad=d1..d12&utm_...`** by the static route handler `app/season1/route.ts` (`force-static`, so it is prerendered at build time). There is no rewrite, no redirect and no second public address: `/roadshow/landing.html` no longer exists. The query string is read client-side by the page's own script, so it reaches the page unchanged. The file lives outside `public/` on purpose (the repo rule is never to read from `public/` in server code). It is a static file outside `app/layout.tsx`, so it carries its own Meta pixel and Clarity tags in `<head>`.
- **Site popup**: `components/ui/SeasonOnePopup.tsx` (pixel and Clarity come from `app/layout.tsx`).

Meta ads optimize on the `Lead` event, so the browser and server Leads must share one `event_id`.

## What fires where

| When | Browser | Server (`/api/season-one`) |
|---|---|---|
| Page load | Meta `PageView`; Clarity session; GA4 `page_view` (landing page only: it carries its own `gtag.js` for `G-8LM45PX53W`, the popup uses the one in `app/layout.tsx`) | none |
| Email submit | after the API returns ok: `fbq('track','Lead',{content_name},{eventID})` and GA4 `generate_lead` with `{source:'season_one_<ad>', hero}`, once per sign-up each, same conditions (LIVE host, honeypot empty) | Klaviyo event "Season 01 Waitlist" (`season1_*` profile props), then list subscribe (XGTv2F), then Meta CAPI `Lead` with the same `event_id` |
| Page load (Clarity tags) | `clarity("set","ad",<id>)` and `clarity("set","hero",<hero id or none>)`, plus `utm_content`, `utm_term` and `site` from the URL when present, so sessions can be filtered by ad in Clarity | none |
| Funnel events (GA4 only, SC-3) | `faq_open {ad, question}` (a FAQ opens; `question` is a slug such as `when_does_it_start`; once per question per page view). `cta_click {ad, location}` (`hero`, `header` or `sticky`). `form_start {ad, where}` (once per form, on the first trusted tap, key press or paste in the `top` / `bottom` email field; autofill, a script-set value, an `input` event with no key press and the programmatic focus after a CTA tap do not count. Changed 2026-10-11: the old focus/input trigger fired for in-app-browser autofill, about twice per visitor). `signup_error {ad, reason}` (`invalid_email`, `server` for a non-ok API response, `network` for a failed fetch; suppressed when the honeypot is filled) | none |
| Email submit success (Clarity) | `clarity("event","signup")` and `clarity("set","signed_up","yes")` at the same moment and under the same conditions as the Meta Lead and GA4 `generate_lead` (LIVE host, honeypot empty, once per sign-up) | none |
| Games chips (confirmation) | none (nothing to Meta, GA or Clarity) | Klaviyo "Season 01 Waitlist Games" only. No Meta event |

The funnel events and Clarity tags are keyed by the ad id and the hero id only (`hero` is `amount`, `games`, `screentime`, `shortlist` or `none` for page A; every event sent through the page's `ga()` helper carries a `hero` param, as does `generate_lead`; GA4's own `page_view` does not, so use `hero_view` for hero page views and the Clarity `hero` tag for page A). **None of them go to Meta**, and none carry the email, the game chips or anything about the child (chip taps send nothing to GA or Clarity). All calls are wrapped so a tracking failure can never break the page or the sign-up. In GA4, mark `generate_lead` as a key event; the funnel events are for exploration (register `ad`, `hero`, `question`, `location`, `where` and `reason` as custom dimensions to report on them).

GA4: the `source` parameter uses the same naming (`season_one_d3` on the landing page, `season_one_popup` on the popup via `trackLead`). utm_* are picked up by GA4 from the page URL, so paid traffic shows under the Meta source/medium. Only the ad id and the hero id go to GA, never the answer text, the game chips or anything about the child.

`content_name`: `season_one_<ad>` on the landing page (e.g. `season_one_d3`), `season_one_popup` on the popup. Same value in the browser and server events.

**Event ID.** The page makes one ID per sign-up (`crypto.randomUUID()`, with a fallback) and reuses it if the parent retries, so a retry can never count twice. It goes to the API as `eventId` with `eventSourceUrl: location.href`; the browser Lead carries it as `{eventID}`. If a request arrives without one, the server makes its own (that Lead then won't dedupe, so keep the pages sending it).

**Server Lead rules.** Sent only after the Klaviyo event succeeds, awaited before the response, never on the games/age steps. A Meta failure is logged and the parent still gets `{ ok: true }`. Sender: `lib/metaCapi.ts` (Graph API `v26.0`, never throws).

**CAPI `user_data`.** `em` = sha256 of the lowercased, trimmed email; plaintext `client_ip_address` (`x-nf-client-connection-ip`, then `x-forwarded-for`), `client_user_agent`, `fbp` from the `_fbp` cookie, `fbc` from the `_fbc` cookie or, if that is missing, rebuilt as `fb.1.<ms>.<fbclid>` from the `fbclid` in `eventSourceUrl`. Nothing about the child is ever sent to Meta.

**Design previews.** On hosts other than ekuzo.gg, `*.netlify.app` and localhost the landing form saves nothing and fires no Lead (PageView still fires).

## Request contract (main sign-up)

```json
{ "email": "parent@example.com", "source": "ad-landing" | "site-popup",
  "ad": "d3", "adName": "...", "where": "top" | "bottom", "attribution": { "utm_source": "..." },
  "attributionFrom": "url" | "session" | "return-visit" | "none",
  "page": "/season1?ad=d3", "firstName": "", "eventId": "uuid", "eventSourceUrl": "https://ekuzo.gg/season1?ad=d3&fbclid=...",
  "hero": "amount" | "games" | "screentime" | "shortlist" | "none", "heroAnswer": "...", "heroFrom": "url" | "ad-map" | "split" | "none",
  "ekz_hp": "" }
```

`hero`, `heroAnswer` and `heroFrom` are read for `source: "ad-landing"` only (a site-popup post, or a `step: "games"` / `step: "age"` post, that carries them has them ignored). `hero` is allowlisted (anything else, including non-strings, becomes `none`); `heroAnswer` is plain text, markup and link characters stripped, 200 characters max, `skipped` when a hero was shown but unanswered and empty on page A; `heroFrom` is allowlisted (anything else is empty).

`attribution` keys read by the route (strings only, anything else is stored as empty): `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id` (max 40), `site` (max 20). The landing page forwards all seven from its query string; ad URLs carry `utm_term={{placement}}`, `utm_id={{ad.id}}` and `site={{site_source_name}}`. The site popup sends all seven, resolved by `getSeasonOneAttribution()` in `lib/attribution.ts` (see "Popup attribution" below), plus a top-level `attributionFrom`. `getAttribution()` (five keys, shared with the camps, 100, 101 and teams registration flows) is unchanged.

`eventId` and `eventSourceUrl` are optional. `ekz_hp` is a honeypot: both forms carry a hidden, off-screen `ekz_hp` input (deliberately not a name like `company` that browser autofill recognizes) that people never see. If it arrives non-empty on the main sign-up, the route logs a warning and returns `{ ok: true }` without calling Klaviyo or sending a Meta Lead. Responses: 400 bad email, 500 Klaviyo key missing, 502 Klaviyo event failed (the page asks the parent to retry), 200 `{ ok: true }` otherwise.

## Season 01 hero fields (ad landing only)

Which landing hero the parent saw and what they answered. Written for `source: ad-landing` only; never for the popup, never on the games/age steps. No hero field or answer is sent to Meta; the hero id can appear in the page URL Meta already receives (the pixel reports the page URL, and CAPI gets it as `event_source_url`, whenever it carries `?hero=`).

| Where | Property | Values |
|---|---|---|
| Klaviyo profile | `season1_hero` | `amount`, `games`, `screentime`, `shortlist`, or `none` (page A) |
| Klaviyo profile | `season1_hero_answer` | visitor text, 200 characters max, or `skipped`, or empty on page A |
| "Season 01 Waitlist" event | `hero`, `hero_answer` | same values as the two profile properties |
| "Season 01 Waitlist" event | `hero_from` | `url` (explicit `?hero=`, including `none`), `ad-map` (ad-to-hero table), `split` (d10 B vs C), `none` (page A by table, bare or invalid ad), or empty |

A same-email re-sign-up overwrites the profile properties (as `season1_ad` already does); the event keeps each sign-up's page.

**`season1_hero_answer` is visitor text.** Markup and link characters are stripped, but bare text such as `evil.com` survives. Never render it unescaped in a Klaviyo template, and do not turn it into a link.

## Klaviyo-only fields (main sign-up)

Added to the "Season 01 Waitlist" **event properties** only (not the profile, not the games/age events, never Meta CAPI):

| Property | Source | Values |
|---|---|---|
| `utm_id`, `site` | `attribution` in the request body | as sent |
| `attribution_from` | derived by the route | `url` (ad landing, or the popup on a URL with utm_*), `session` (popup, stored earlier this browser session), `return-visit` (popup, stored by an ad landing in the last 7 days), `none`. A popup claim counts only when some attribution value arrived with it. Read with `source` (the surface): `site-popup` + `session` = a landing-page visitor who signed up elsewhere |
| `geo_country`, `geo_region`, `geo_city`, `geo_postal` | Netlify `x-nf-geo` request header | country code, subdivision code (e.g. `TX`), city, postal code; latitude and longitude are never stored |
| `device_os` | user agent | `ios`, `android`, `mac`, `windows`, `chromeos`, `linux`, `other` |
| `device_type` | user agent | `mobile`, `tablet`, `desktop` (iPad, and Android without "Mobile", count as tablet) |

A missing or unparseable `x-nf-geo` header, or a missing user agent, gives empty strings and never an error. The header is read as base64-encoded JSON, then as plain JSON; its exact format on the live Netlify runtime is still to be verified (launch checklist L2): after a test sign-up on the deploy, confirm the event in Klaviyo shows `geo_*` values. iPadOS Safari sends a Mac user agent, so those visits read as `mac` / `desktop`. Geolocation is approximate (IP-based). Meta CAPI `user_data` and `custom_data` are unchanged by this.

## Popup attribution (added 2026-10-11)

Problem it fixes: a parent who landed on `/season1` from an ad and then signed up through the site popup on another page was recorded with empty UTMs and no ad (first seen on launch day: the Nampa ID sign-up). `/season1` is served outside `app/layout.tsx`, so `CaptureAttribution` never ran there.

- **Ad touch**: at least one of the five `utm_*` values is non-empty. `ad`, `utm_id` or `site` alone never counts (a bare `?ad=d5` link is not paid traffic).
- **`/season1` writes two records on an ad touch** (`landing.html`, right after the `?ad=` lookup), each in its own try/catch:
  - `sessionStorage["ekuzo_attribution"]` (the key `captureAttribution()` uses): the five utm keys, `utm_id`, `site`, and `ad` (d1..d12, only when the URL's `ad` is valid; the page's d1 default is never stored). The latest ad landing replaces any earlier record, so an organic UTM earlier in the same tab cannot beat the ad (decision D1 in `docs/s1-popup-attribution/03-decision-log.md`). On Next pages `captureAttribution()` stays first touch and does not overwrite this record.
  - `localStorage["ekuzo_s1_attribution"]`: the same keys plus `at` (ms). Season 01 only, valid for 7 days from the latest ad landing (Jamie, 2026-10-11: matches Meta's 7-day-click window).
- **The popup resolves** (`getSeasonOneAttribution()`): the current URL if it is an ad touch (`url`), else the session record (`session`), else a return-visit record no older than 7 days and not in the future (`return-visit`), else empty (`none`). `ad` comes from the same source. Values are strings, capped at 200 characters.
- **Records hold only** the utm keys, `ad` and a timestamp: no email, no game chips, nothing about the child.
- **Known limits**: the records live in one browser, so a hop from Instagram's or Facebook's in-app browser to Safari or Chrome starts from nothing, and Safari may clear script-written storage. A visitor who reaches `/` from the EKUZO social profile link or by typing the address carries no attribution, while Meta may still credit the ad.

## Env vars (Netlify, scoped to Functions/runtime)

| Var | Production | Deploy previews / branch deploys |
|---|---|---|
| `KLAVIYO_PRIVATE_API_KEY` | required (sign-ups fail without it) | required |
| `KLAVIYO_SEASON1_LIST_ID` | optional, defaults to `XGTv2F` | optional |
| `META_CAPI_ACCESS_TOKEN` | required for the server Lead (skipped with a warning if unset) | required to test |
| `META_PIXEL_ID` or `NEXT_PUBLIC_META_PIXEL_ID` | `1284038230557204` | same |
| `META_CAPI_USE_TEST_CODE` | **unset** | `true` while testing |
| `META_CAPI_TEST_EVENT_CODE` | not needed | code from Events Manager > Test Events |

With `META_CAPI_USE_TEST_CODE=true` and no test code, the server Lead is skipped rather than sent live.

## Test procedure

1. On a deploy preview, set `META_CAPI_USE_TEST_CODE=true` and `META_CAPI_TEST_EVENT_CODE` for that context and redeploy.
2. Events Manager > Test Events: open `<preview>/season1?ad=d3&utm_source=meta&utm_medium=paid&utm_campaign=test&utm_content=d3&fbclid=test123` from the Test Events browser tool (so the browser events are tagged as test too), with Meta Pixel Helper on.
3. Submit a test email. Expect: `PageView` and one `Lead` in Pixel Helper with an event ID; a server `Lead` in Test Events with the same event ID, marked deduplicated, match keys email, IP, user agent, fbp, fbc.
4. Klaviyo: the profile has `season1_*` properties (including `season1_hero` and `season1_hero_answer`), the "Season 01 Waitlist" event (with `hero`, `hero_answer`, `hero_from`), and is on the Season 01 Waitlist list. Tap a game chip: "Season 01 Waitlist Games" appears; nothing new in Meta.
5. Repeat on the site popup (`/?join=season-one`): `content_name` `season_one_popup`. Then the attribution path: open `/season1?ad=d3&utm_source=meta&...` and go to `/` in the same tab (type the address on a preview, since the footer link points at ekuzo.gg); the popup sign-up's Klaviyo event shows `source: site-popup`, the utm values, `ad: d3` and `attribution_from: session`.
6. Clarity: a session for `/season1` shows up (can take about 30 minutes), tagged `ad` and `hero`. GA4 DebugView: `hero_view` and `generate_lead` carry `hero`.
7. Production: confirm `META_CAPI_USE_TEST_CODE` is unset, then make one real sign-up and check it lands in the live Overview as a deduplicated Lead (browser + server).
