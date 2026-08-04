# Homepage rebuild — measurement baseline

**Date:** 2026-08-04
**Change:** `app/page.tsx` rebuilt. Rive ecosystem section removed, six sections lifted from `/programs/ekuzo101`.
**Status:** built locally, not yet deployed.

This file exists so the change is measurable. Capture the "before" numbers **while the old homepage is still live in production**, i.e. before the next deploy. Once it ships, the before is gone.

---

## 1. Capture before deploying

### Search Console (Jamie owns, needs login)

Property `ekuzo.gg` → Performance → filter Page = `https://ekuzo.gg/` exactly. Date range: **last 28 days**. Record:

| Metric | Before (fill in) | After (28d post-deploy) |
|---|---|---|
| Clicks | | |
| Impressions | | |
| Average CTR | | |
| Average position | | |
| Top 10 queries (query, clicks, position) | | |

Then Performance → **Search appearance** tab: note whether any Video results are already reported. The homepage gains a second video schema in this change (`leagueGameplayVideo`), so this is the row to watch.

Also record: Indexing → Pages → the `/` status, and Experience → Core Web Vitals → the URL group containing `/`.

### PageSpeed Insights (run against production, before deploy)

`https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fekuzo.gg%2F`

| Metric | Before (mobile) | Before (desktop) | After |
|---|---|---|---|
| Performance score | | | |
| LCP | | | |
| CLS | | | |
| TBT | | | |
| Total transfer size | | | |

### Already measured (no action needed)

Payload comparison, measured 2026-08-04 by reading actual file sizes:

| Group | Live (old homepage) | New homepage | Δ |
|---|---:|---:|---:|
| Rive `.riv` (desktop variant) | 6,612,845 | 0 | −6,612,845 |
| `rive.wasm` | 1,795,065 | 0 | −1,795,065 |
| Rive JS chunk (uncompressed) | 296,895 | 0 | −296,895 |
| Torn paper PNGs + SVGs | 178,943 | 238,558 | +59,615 |
| next/image assets | ~817,000 | ~1,264,808 | +447,808 |
| Testimonial posters (unchanged) | 1,348,661 | 1,348,661 | 0 |
| **Total initial payload** | **~10.25 MB** | **~2.72 MB** | **−73%** |

The League clip mp4 (6,046,964 bytes) is **not** in the initial load: `preload="metadata"` with click-to-play.

Separately, the coach image cleanup in this session removed 5.75 MB from the deploy bundle (`coach-nuri-je` 4.6 MB → 159 KB, `coach-sebastien-ZzLegendary` 1.4 MB → 79 KB, both re-encoded to WebP at 1200px).

---

## 2. GA4 setup — do this BEFORE deploying

Custom dimensions only populate from creation forward. If these are created after the deploy, the first days of data are unreadable.

Admin → Data display → Custom definitions → Create custom dimension. All **event-scoped**:

| Dimension name | Event parameter | Used by |
|---|---|---|
| Section ID | `section_id` | `section_view`, `video_play`, `cta_click` |
| CTA ID | `cta_id` | `cta_click` |
| Video ID | `video_id` | `video_play` |
| Destination | `destination` | `cta_click` |
| Origin | `origin` | `ai_referral` |
| Detected via | `detected_via` | `ai_referral` |
| Referrer host | `referrer_host` | `ai_referral` |
| Landing path | `landing_path` | `ai_referral` |

Plus one **custom metric** (integer, event-scoped): `section_index`.

That is 8 of the 50-dimension quota and 1 of the 50-metric quota.

Do **not** mark any of these as key events. They are diagnostics, not conversions, and marking them pollutes conversion reporting.

---

## 3. What ships in this change

### Events

| Event | Params | Fires |
|---|---|---|
| `section_view` | `section_id`, `section_index` | once per section per pageview, after 1s in the middle 50% of viewport |
| `video_play` | `video_id`, `section_id` | first play per mount of the League clip |
| `cta_click` | `cta_id`, `section_id`, `destination` | on click: `faq_link`, `see_programs` |
| `ai_referral` | `origin`, `detected_via`, `referrer_host`, `landing_path` | once per session, any page, when the session came from an AI assistant |

The nine tracked homepage sections in order: `hero`, `growth_band`, `progression`, `for_players`, `how_it_works`, `coaches`, `zero_tolerance`, `testimonials`, `footer_cta`.

### robots.txt

AI crawlers are now named explicitly rather than relying on `User-agent: *`. Note the RFC 9309 subtlety this introduces: a crawler obeys only the single most specific group matching its token, so naming an agent pulls it out of the `*` group entirely. That is why `Disallow: /api/` and `/_next/` are repeated in the AI group. Removing that repetition would let those crawlers into `/api/`.

`Google-Extended` and `Applebot-Extended` never fetch anything. They are opt-out control tokens; listing them with `Allow: /` is an explicit opt-in to AI training and grounding.

### Schema

`leagueGameplayVideo` (a `VideoObject`) is new on the homepage, alongside the existing 9-node `testimonialVideoGraph`. A poster frame was generated at `public/videos/league-of-legends-camp-poster.jpg` (720×1280, 27 KB) and is used both as the schema `thumbnailUrl` and as the video element's `poster` attribute, so the player no longer shows a black box before play.

---

## 4. Verification after deploy

### robots.txt
```bash
curl -s https://ekuzo.gg/robots.txt
```
Then paste it into Search Console → Settings → robots.txt and confirm it parses the multi-agent group with no warnings.

### AI referral tagging
```bash
# Cookie side (middleware). Expect ekuzo_origin=ai_perplexity
curl -sI -H 'Referer: https://www.perplexity.ai/search/youth-esports' https://ekuzo.gg/ | grep -i set-cookie

# Expect ekuzo_origin=ai_chatgpt
curl -sI 'https://ekuzo.gg/?utm_source=chatgpt.com' | grep -i set-cookie

# Expect ai_other. Before this session's classifier fix this returned `social`,
# because the "t.co" entry in SOCIAL_HOSTS substring-matched "microsoft.com".
curl -sI -H 'Referer: https://copilot.microsoft.com/chats/abc' https://ekuzo.gg/ | grep -i set-cookie

# Bots must NOT get a cookie. Expect 0.
curl -sI -A 'Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)' https://ekuzo.gg/ | grep -ci set-cookie
```

GA4 side: open `https://ekuzo.gg/?utm_source=chatgpt.com` in incognito, Network tab, filter `collect`, look for `en=ai_referral` with `ep.origin=ai_chatgpt` and `ep.detected_via=utm`. It fires after the window `load` event, so allow a second or two. Reload the same URL and confirm **no second event** (the session guard). To retest: `sessionStorage.removeItem('ekuzo_ai_referral')` and delete the `ekuzo_origin` cookie.

### Section tracking
Scroll the homepage slowly in incognito with the Network tab filtered to `collect`. Expect nine `section_view` events in page order. Flick-scroll to the bottom quickly and expect **fewer** than nine, which is the 1s dwell filter working as designed.

---

## 5. The report that answers "did it work"

**Explore → Funnel exploration**, set to **Open funnel**. Nine steps, step *n* = event `section_view` where `section_id` exactly matches the slug list above, in order. Breakdown by Device category. Date range ≥ 2 weeks.

`hero` is the denominator (roughly everyone who loaded the page). The step-to-step drop-off is the verdict. A section with a normal entry rate but an abnormal drop *at its own step* is losing people on content, not on position.

Then **Free-form exploration**: rows = `section_id`, values = Total users + Event count.

The specific questions to answer before the bigger update:

- **Does the purple band earn its length?** Compare `for_players` users against `progression` users. It replaced the Rive and is the most expensive new section. If it retains no better than the section above it, it is too long.
- **Does the clip get watched?** `video_play` ÷ `section_view(for_players)` is the true take-rate among people who actually saw it.
- **Does the routing band route?** `cta_click(see_programs)` ÷ `section_view(how_it_works)`.
- **What share of traffic is AI-sourced?** Users with `ai_referral` ÷ total users, broken down by `origin`. This is the denominator the LLM-tagging work has been missing since May: `middleware.ts` has been writing `ekuzo_origin` to Klaviyo and Sheets since 2026-05-17, but only at purchase time, so there was a numerator and no denominator.

---

## 6. Known gaps, not fixed in this session

1. **The `origin` data already collected has never been read.** `docs/llm-traffic-tagging-phase1-handoff.md` scheduled a read-day 4 weeks post-deploy. Deployed 2026-05-17; that is roughly 11 weeks of unread data sitting in Klaviyo and the purchases sheet.
2. **The Sheets side may be silently dropping `origin`.** `docs/apps-script-squad-endpoints-spec.md` still declares the canonical `ekuzo-purchases` header row without `origin`, `acquisition_source`, or the five `utm_*` keys. The Apps Script appends by header name, so if the sheet was never updated the field is being posted and discarded. **Verify the header cell exists before trusting any read-day numbers.**
3. **`/programs/ekuzo101` registrations record no origin and no UTMs.** `app/api/ekuzo101/register/route.ts` reads `origin` from the request body rather than the cookie, and the register page never sends it. The same route destructures `utmSource`/`acquisitionSource` in camelCase while the page sends snake_case `utm_source`, so the whole attribution block writes empty strings on every pilot registration. Pre-existing and unrelated to the homepage work, but it means one product's rows are attribution-blank.
4. **Testimonial video cards are clickable `<div>`s** with no `role`, `tabIndex`, or accessible name (`components/sections/TestimonialsCarousel.tsx`). Not keyboard reachable, invisible to assistive tech. Pre-existing.
5. **The League clip has no captions track.** WCAG 1.2.2 applies once a clip has speech. Same on ekuzo101 and ekuzo-camps.
6. **`next.config.ts` is an empty stub** sitting next to the real `next.config.mjs`. Next resolves `.mjs` first so redirects currently work, but it is a foot-gun for whoever edits the redirect map next.
