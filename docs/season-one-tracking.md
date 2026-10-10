# Season 01 sign-up tracking

Two surfaces post to `POST /api/season-one`:

- **Ad landing page**: `public/roadshow/landing.html`, served at **`/season1?ad=d1..d12&utm_...`** (rewrite in `next.config.mjs`; the query string passes through) and still at `/roadshow/landing.html`. It is a static file outside `app/layout.tsx`, so it carries its own Meta pixel and Clarity tags in `<head>`.
- **Site popup**: `components/ui/SeasonOnePopup.tsx` (pixel and Clarity come from `app/layout.tsx`).

Meta ads optimize on the `Lead` event, so the browser and server Leads must share one `event_id`.

## What fires where

| When | Browser | Server (`/api/season-one`) |
|---|---|---|
| Page load | Meta `PageView`; Clarity session | none |
| Email submit | after the API returns ok: `fbq('track','Lead',{content_name},{eventID})`, once per sign-up | Klaviyo event "Season 01 Waitlist" (`season1_*` profile props), then list subscribe (XGTv2F), then Meta CAPI `Lead` with the same `event_id` |
| Games chips (confirmation) | none | Klaviyo "Season 01 Waitlist Games" only. No Meta event |

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

`eventId` and `eventSourceUrl` are optional. `ekz_hp` is a honeypot: both forms carry a hidden, off-screen `ekz_hp` input (deliberately not a name like `company` that browser autofill recognizes) that people never see. If it arrives non-empty on the main sign-up, the route logs a warning and returns `{ ok: true }` without calling Klaviyo or sending a Meta Lead. Responses: 400 bad email, 500 Klaviyo key missing, 502 Klaviyo event failed (the page asks the parent to retry), 200 `{ ok: true }` otherwise.

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
