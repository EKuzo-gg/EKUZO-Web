# 02 Frozen spec, round 2 (Fable, 2026-11-05)

Resolves `redteam-money.md`, `redteam-trust.md`, `redteam-ops.md` against `01-requirements.md`. Decisions are in `03-decision-log.md` (R2-D1 onward). Where this file and 01 differ, this file wins.

## S1 hero CLS

SC1 (after `scout/ihero-cls.md`): root cause is the 1.35 MB inline script (about 1.2 MB of base64 images in `IMG`) that builds the hero at about 7.4 s throttled; the interactive hero then un-hides 534 px above the form. Scout's CSS-only fix (hide the form until the hero is ready) is rejected (R2-D10): it trades the shift for a blank screen of about 7 s on slow phones.
1. Move every base64 entry of `IMG` in `app/season1/landing.html` to a file under `public/images/season1/landing/` (decoded bytes, same format, file name = the key), and set `IMG[key]` to the path, as d19 to d21 already do. No other change to the art markup.
2. Measure. If any interactive hero URL is still above 0.1 at 375, reserve the hero on phones for deterministic interactive-hero pages from the small script after `#hero` (Scout's `pre-ih` class and `#hero{min-height:...}`) without hiding the form; move the d10 split into the small script only if d10 is still above 0.1.
3. Settled pages pixel-identical (all ads d1 to d21 at 375 and 1440), and every image in `IMG` loads (no 404) for each ad and background option.

## S2 Relay: `app/api/season-one/route.ts` and the popup (Atlas-1 does the landing's S2 items 5 and 6)

1. Client IP = `x-nf-client-connection-ip` only, validated with `isIP`. No valid IP: skip the limiter (never one shared bucket). IPv6 keys on the /64 prefix; `::ffff:` mapped v4 keys as v4. The key is `s1ip:<keyHash(ip or /64)>`, never the raw IP; logs carry no IP.
2. The same nf-only rule replaces the `x-forwarded-for` fallback in `sendMetaLead` (live defect).
3. The limiter runs inside `classifySignup`'s transaction (one round trip, one 800 ms cap) and counts only sign-ups classified `new`. Fixed one-hour window (`window_start` floored to the hour, the `hit()` convention); the 2x edge is accepted and tested on the SQL.
4. Thresholds: count above 10 in the hour: quiet (event and subscribe as usual, no CAPI Lead, response `{ok:true, quiet:true}`); above 30: `429 {ok:false, error}` with nothing written. Global key `s1ip:global` for the hour above 150 new sign-ups: every further sign-up is quiet. A warn line (no IP, no email) on each quiet or 429, with the reason.
5. 429 copy: "We couldn't save this one from here. Text our founder at {sms} and we'll add you by hand." ({sms} from `OFFER.textKarlinSms`). The landing and popup show the server's `error` text on a 429 instead of the generic retry line, and do not auto-retry.
6. Landing and popup treat `quiet:true` like `repeat:true`: no fbq Lead, no GA4 `generate_lead`, no Clarity `signup`; the confirmation and joined flag as usual.
7. Step lock for `games`, `age`, `text-karlin`: with an `eventId`, require the `s1wl:ev:` key for that email and id inside 24 h; without one (old cached pages), require the `s1wl:em:` key. One `select 1 ... limit 1`, 800 ms cap, fail open on error. No match: `200 {ok:true}`, nothing written, a warn line `step_dropped` with the step name and reason (no PII). `text-karlin` also capped at 3 per email per 24 h (`hit`, key hashed).
8. The ev key is claimed only for `new` and `retry`; the repeat path claims nothing new (closes the stranger-unlock hole).
9. Logs: no raw email anywhere (the missing-key error logs a fixed string); Klaviyo failures log status only, not `r.text()`.
10. Origin guard: reuse the commit route's cross-site check (`lib/season1/httpGuard.ts`); a cross-site browser POST gets 403. Same-site, no-Origin (curl) still allowed.
11. Tests: every branch above, fail-open modes, IPv6 /64, no-IP skip, response keys only `ok` plus `repeat`/`quiet`/`error`, a sentinel email and IP never appear in any console call.

## S3 Atlas: index `/season1/join`

1. `renderJoin` gets `seo: { indexable: boolean }` from the route. The template's hard-coded `<meta name="robots" content="noindex">` becomes `{{SEO}}` inside `<!--SEO:start-->`/`<!--SEO:end-->` markers in `<head>`. `/join/b` and `/join/jersey` pass `indexable:false` (output identical to today apart from the markers).
2. `/season1/join` is indexable only when the raw Host is `ekuzo.gg` or `www.ekuzo.gg` and mode is `live`; otherwise exactly today's noindex meta and `x-robots-tag`. Indexable: no robots meta, no `x-robots-tag`, `<link rel="canonical" href="https://ekuzo.gg/season1/join">` (constant), a meta description, and JSON-LD from a new builder in `lib/schema.ts` (Course with provider `ORG_ID`, `courseMode` online, an Offer with `price` 580, `priceCurrency` USD, a description built from offer.ts ("$100 today covers January, then $160 a month February to April"), `availability` InStock when open else SoldOut, `validThrough` closeAt; and a breadcrumb), rendered through the escaping path. No FAQPage on this page (R2-D6). Title stays the template's.
3. The page stays indexed when closed (honest closed copy, Offer SoldOut).
4. `app/sitemap.ts` adds `/season1/join` with a real `lastModified` (today), and a test asserts the sitemap holds it and none of `/season1`, `/season1/join/b`, `/season1/join/jersey`, `/season1/join/signup`.
5. Drift test: the two routes' bodies are equal after removing the `SEO` block; each has exactly one block inside `<head>`; headers equal except `x-robots-tag`; a matrix test (host x mode) for robots and canonical; `?src=x&utm_source=y` keeps the bare canonical.
6. `llms.txt` line 15 checked against offer.ts (ages, twice a week, dates); no price added before canon is approved.

## Not in this round

DB index on `s1_rate_limits.window_start` (needs a migration on the live DB; follow-up). Bot exclusion from tags (R2-D7). "Save $60" literal in join B (Aaron's copy). Double opt-in (follow-up for the welcome flow).
