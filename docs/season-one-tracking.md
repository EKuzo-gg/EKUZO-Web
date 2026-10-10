# Season 01 sign-up tracking

Two surfaces post to `POST /api/season-one`:

- **Ad landing page**: `app/season1/landing.html` (the single source of truth), served natively at **`/season1?ad=d1..d12&utm_...`** by the static route handler `app/season1/route.ts` (`force-static`, so it is prerendered at build time). There is no rewrite, no redirect and no second public address: `/roadshow/landing.html` no longer exists. The query string is read client-side by the page's own script, so it reaches the page unchanged. The file lives outside `public/` on purpose (the repo rule is never to read from `public/` in server code). It is a static file outside `app/layout.tsx`, so it carries its own Meta pixel and Clarity tags in `<head>`.
- **Site popup**: `components/ui/SeasonOnePopup.tsx` (pixel and Clarity come from `app/layout.tsx`).

Meta ads optimize on the `Lead` event, so the browser and server Leads must share one `event_id`.

## What fires where

| When | Browser | Server (`/api/season-one`) |
|---|---|---|
| Page load | Meta `PageView`; Clarity session; GA4 `page_view` (landing page only: it carries its own `gtag.js` for `G-8LM45PX53W`, the popup uses the one in `app/layout.tsx`) | none |
| Email submit | after the API returns ok: `fbq('track','Lead',{content_name},{eventID})` and GA4 `generate_lead` with `{source:'season_one_<ad>'}`, once per sign-up each, same conditions (LIVE host, honeypot empty) | Klaviyo event "Season 01 Waitlist" (`season1_*` profile props), then list subscribe (XGTv2F), then Meta CAPI `Lead` with the same `event_id` |
| Page load (Clarity tags) | `clarity("set","ad",<id>)`, plus `utm_content`, `utm_term` and `site` from the URL when present, so sessions can be filtered by ad in Clarity | none |
| Funnel events (GA4 only, SC-3) | `faq_open {ad, question}` (a FAQ opens; `question` is a slug such as `when_does_it_start`; once per question per page view). `cta_click {ad, location}` (`hero`, `header` or `sticky`). `form_start {ad, where}` (first real focus or typing in the `top` / `bottom` email field, once per form; the programmatic focus after a CTA tap does not count). `signup_error {ad, reason}` (`invalid_email`, `server` for a non-ok API response, `network` for a failed fetch; suppressed when the honeypot is filled) | none |
| Email submit success (Clarity) | `clarity("event","signup")` and `clarity("set","signed_up","yes")` at the same moment and under the same conditions as the Meta Lead and GA4 `generate_lead` (LIVE host, honeypot empty, once per sign-up) | none |
| Games chips (confirmation) | none (nothing to Meta, GA or Clarity) | Klaviyo "Season 01 Waitlist Games" only. No Meta event |

The funnel events and Clarity tags are keyed by the ad id only. **None of them go to Meta**, and none carry the email, the game chips or anything about the child (chip taps send nothing to GA or Clarity). All calls are wrapped so a tracking failure can never break the page or the sign-up. In GA4, mark `generate_lead` as a key event; the funnel events are for exploration (register `ad`, `question`, `location`, `where` and `reason` as custom dimensions to report on them).

GA4: the `source` parameter uses the same naming (`season_one_d3` on the landing page, `season_one_popup` on the popup via `trackLead`). utm_* are picked up by GA4 from the page URL, so paid traffic shows under the Meta source/medium. Only the ad id goes to GA, never the game chips or anything about the child.

`content_name`: `season_one_<ad>` on the landing page (e.g. `season_one_d3`), `season_one_popup` on the popup. Same value in the browser and server events.

**Event ID.** The page makes one ID per sign-up (`crypto.randomUUID()`, with a fallback) and reuses it if the parent retries, so a retry can never count twice. It goes to the API as `eventId` with `eventSourceUrl: location.href`; the browser Lead carries it as `{eventID}`. If a request arrives without one, the server makes its own (that Lead then won't dedupe, so keep the pages sending it).

**Server Lead rules.** Sent only after the Klaviyo event succeeds, awaited before the response, never on the games/age steps. A Meta failure is logged and the parent still gets `{ ok: true }`. Sender: `lib/metaCapi.ts` (Graph API `v26.0`, never throws).

**CAPI `user_data`.** `em` = sha256 of the lowercased, trimmed email; plaintext `client_ip_address` (`x-nf-client-connection-ip`, then `x-forwarded-for`), `client_user_agent`, `fbp` from the `_fbp` cookie, `fbc` from the `_fbc` cookie or, if that is missing, rebuilt as `fb.1.<ms>.<fbclid>` from the `fbclid` in `eventSourceUrl`. Nothing about the child is ever sent to Meta.

**Design previews.** On hosts other than ekuzo.gg, `*.netlify.app` and localhost the landing form saves nothing and fires no Lead (PageView still fires).

## Request contract (main sign-up)

```json
{ "email": "parent@example.com", "source": "ad-landing" | "site-popup",
  "ad": "d3", "adName": "...", "where": "top" | "bottom", "attribution": { "utm_source": "..." },
  "page": "/season1?ad=d3", "firstName": "", "eventId": "uuid", "eventSourceUrl": "https://ekuzo.gg/season1?ad=d3&fbclid=...",
  "ekz_hp": "" }
```

`attribution` keys read by the route (strings only, anything else is stored as empty): `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id` (max 40), `site` (max 20). The landing page forwards all seven from its query string; ad URLs carry `utm_term={{placement}}`, `utm_id={{ad.id}}` and `site={{site_source_name}}`. The site popup sends only the five `utm_*` keys it captures in `lib/attribution.ts` (a fixed whitelist shared with the camps/EKUZO100 registration flows, left unchanged because ads land on the landing page, not the popup).

`eventId` and `eventSourceUrl` are optional. `ekz_hp` is a honeypot: both forms carry a hidden, off-screen `ekz_hp` input (deliberately not a name like `company` that browser autofill recognizes) that people never see. If it arrives non-empty on the main sign-up, the route logs a warning and returns `{ ok: true }` without calling Klaviyo or sending a Meta Lead. Responses: 400 bad email, 500 Klaviyo key missing, 502 Klaviyo event failed (the page asks the parent to retry), 200 `{ ok: true }` otherwise.

## Klaviyo-only fields (main sign-up)

Added to the "Season 01 Waitlist" **event properties** only (not the profile, not the games/age events, never Meta CAPI):

| Property | Source | Values |
|---|---|---|
| `utm_id`, `site` | `attribution` in the request body | as sent |
| `geo_country`, `geo_region`, `geo_city`, `geo_postal` | Netlify `x-nf-geo` request header | country code, subdivision code (e.g. `TX`), city, postal code; latitude and longitude are never stored |
| `device_os` | user agent | `ios`, `android`, `mac`, `windows`, `chromeos`, `linux`, `other` |
| `device_type` | user agent | `mobile`, `tablet`, `desktop` (iPad, and Android without "Mobile", count as tablet) |

A missing or unparseable `x-nf-geo` header, or a missing user agent, gives empty strings and never an error. The header is read as base64-encoded JSON, then as plain JSON; its exact format on the live Netlify runtime is still to be verified (launch checklist L2): after a test sign-up on the deploy, confirm the event in Klaviyo shows `geo_*` values. iPadOS Safari sends a Mac user agent, so those visits read as `mac` / `desktop`. Geolocation is approximate (IP-based). Meta CAPI `user_data` and `custom_data` are unchanged by this.

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
4. Klaviyo: the profile has `season1_*` properties, the "Season 01 Waitlist" event, and is on the Season 01 Waitlist list. Tap a game chip: "Season 01 Waitlist Games" appears; nothing new in Meta.
5. Repeat on the site popup (`/?join=season-one`): `content_name` `season_one_popup`.
6. Clarity: a session for `/season1` shows up (can take about 30 minutes).
7. Production: confirm `META_CAPI_USE_TEST_CODE` is unset, then make one real sign-up and check it lands in the live Overview as a deduplicated Lead (browser + server).
