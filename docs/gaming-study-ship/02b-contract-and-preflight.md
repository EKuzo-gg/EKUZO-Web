# 02b Data and event contract, QA harness plan (Relay, phase 2)

Date 2026-10-11. Read-only phase: no app source touched, no server started, no third-party call, no form submitted.
Brief: `01-requirements.md` (Popups and bars, Attribution journeys, Must not). Line numbers are for the worktree at `8bab088`.

Git evidence at writing time (`git status --porcelain`, `git log --oneline -3`):

```
 M app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx
 M app/blog/page.tsx
 M app/sitemap.ts
 M public/llms.txt
?? docs/gaming-study-ship/
?? public/images/gaming-study-13-7-card.jpg
?? public/images/gaming-study-13-7-hero.jpg
?? public/images/gaming-study-same-game-two-hours.png
8bab088 merge: origin/main (a449abc) into the gaming-study branch
a449abc docs: commit current CLAUDE.md and the docs it references
17d9e1d fix(season1): form_start counts a click, not pointerdown
```

## 0. Findings that change the plan (read these first)

1. **Today, with Season 01 mode on, a blog post still runs the whole newsletter A/B.** `app/layout.tsx:234` mounts `<NewsletterPopup mode="blog" />` unconditionally, so on a post it assigns a variant (`NewsletterPopup.tsx:82-85` writes `ekuzo_nl_variant`) and opens the newsletter popup at 50% scroll (`:87-108`) on top of, or instead of, the Season 01 popup (both are `z-[9999]`). `StickyCTA.tsx:49-52` also writes `ekuzo_nl_variant` on a post even though the JSX shows main's Season 01 bar (`:151` wins over `:194`). So PB-1, PB-3, MN-1 and MN-2 fail on the branch as merged. Fix is two one-line edits (section 1).
2. **`ai_referral` can never fire under `next dev`.** `CaptureAttribution.tsx:31-50` plus `lib/attribution.ts:289-342`: the first effect run writes the sessionStorage key `ekuzo_ai_referral` and schedules the send; React 19 strict mode (default in Next 16, `next.config.mjs` does not turn it off) runs the cleanup (`cancelled = true`, listener removed) and re-runs the effect, which now sees the key and returns null. JR-3 and MN-6 must therefore be run on `next build` plus `next start`. Production is unaffected (effects run once).
3. **The popup has no "live host" guard.** `SeasonOnePopup.tsx:129` fires `trackLead` on any host once the POST returns ok (the ad landing page does guard: `landing.html:1067`). So a sign-up on the dev deploy in an unguarded browser sends a live GA4 `generate_lead` (hardcoded `G-8LM45PX53W`, `layout.tsx:16`) and a live Meta `Lead` (pixel falls back to `1284038230557204`, `layout.tsx:19-20`). Deploy sign-ups must run in the guarded harness, never from a person's phone.
4. **A local sign-up that reaches `/api/season-one` writes to three live systems** (section 3.1). The safe harness answers the POST in the browser and, as a second layer, runs the server with fake credentials.
5. The `ad` field in the request body is `"karlin"` for the JR-1 URL (popup falls back to `utm_content`, `SeasonOnePopup.tsx:115`), but the route drops it (`route.ts:60-63` allowlist is d1..d12), so Klaviyo `ad` is empty. This is decision D5 from the previous loop and is expected, not a defect.
6. `classifyOrigin` matches referrer hosts by substring (`originClassifier.ts:144-148`), so a lookalike host such as `chatgpt.com.example` or `notclaude.ai` counts as AI. Existing behavior, observation only (section 2.5).

## 1. Gating change spec

Decision (Fable): while `SEASON_ONE_MODE` is on, a blog post carries one ask, the Season 01 waitlist. Posts keep main's Season 01 bar. The blog newsletter popup and the blog sticky-bar variant are gated behind `!SEASON_ONE_MODE`. The A/B code ships dormant.

### 1.1 Exact edits (two files, no other file)

`app/layout.tsx`, lines 231-234. `SEASON_ONE_MODE` is already imported at `:11`. Replace

```tsx
          {/* Blog popup: mounted unconditionally (not gated by the flag
              above), since it only ever renders on blog post pages
              (isBlogPostPath), independent of the homepage rollout switch. */}
          <NewsletterPopup mode="blog" />
```

with

```tsx
          {/* Blog popup: only ever renders on blog post pages (isBlogPostPath),
              independent of the homepage rollout switch above. Gated behind
              Season 01 mode: a post carries one ask while the waitlist is open.
              Not mounted at all in that mode, so it assigns no A/B variant and
              fires no newsletter_impression. */}
          {!SEASON_ONE_MODE && <NewsletterPopup mode="blog" />}
```

`components/ui/StickyCTA.tsx`, line 44. `SEASON_ONE_MODE` is already imported at `:8`. Replace

```tsx
  const isBlogPost = isBlogPostPath(pathname);
```

with

```tsx
  const isBlogPost = !SEASON_ONE_MODE && isBlogPostPath(pathname);
```

Optionally extend the comment at `:42-43` with "(off while Season 01 mode is on)". Nothing else changes: the effect at `:49-52` returns early when `isBlogPost` is false (so no `getOrAssignVariant`, no `ekuzo_nl_variant` write), and the blog JSX branch at `:194` becomes unreachable in mode-on, which it already was in rendered terms because `:151` (Season 01 bar) is evaluated first.

Why this is enough: every write of the three `ekuzo_nl_*` keys and every `newsletter_impression` / `newsletter_signup` event goes through exactly two components (grep over `app components lib context middleware.ts`): `NewsletterPopup.tsx` (variant `:84`, dismissed `:196` via `recordDismiss`, subscribed `:249`, impression `:113`, signup `:250`) and `StickyCTA.tsx` (variant `:51`, subscribed `:78`, signup `:80`). Both are now unreachable in mode-on.

### 1.2 Audit: anything else on a post path that can render a newsletter ask or write A/B state with the mode on

| Candidate | Verdict |
|---|---|
| `NewsletterPopup` site mode, `layout.tsx:228-230` | Already gated by `!SEASON_ONE_MODE` (added by the merge). Also needs `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED === "true"`; the worktree `.env.local` line does not start with `=true` (count 0), but set it explicitly in every harness run anyway. |
| `NewsletterPopup` blog mode effects while returning null | This is the leak. Effects at `:82-85` (variant write) and `:87-108` (scroll listener, `markShownThisLoad`) run even while `visible` is false. The mount gate removes them; there is no other fix needed inside the component. |
| `StickyCTA` blog variant | `:49-52` writes the variant. Fixed by the `isBlogPost` edit. `handleBlogSubmit` (`:54-84`) is reachable only from the blog form JSX. |
| `FooterNewsletter` (`Footer.tsx:134`) | Permanent inline form. POSTs `{ email }` only to `/api/newsletter` (`FooterNewsletter.tsx:33-37`): no utm, no GA event, no `ekuzo_nl_*` key. Not a popup or bar; excluded per brief (open question Q1 on whether PB-5 counts it). |
| Blog post `page.tsx` and `app/blog/*` | No newsletter component, no `/api/newsletter` call (grep). |
| `FooterBanner` | Season 01 override at `FooterBanner.tsx:42-43`, opens the Season 01 popup, no newsletter. |
| `ContactModal` | Not a newsletter, but it has its own `trackLead` (`ContactModal.tsx:59`, `source: "contact_form"`). See MN-5 note. |
| `SeasonOneTrigger` | Season 01 only. Does not read or write `ekuzo_nl_*`. |
| Module state `shownThisLoad` in `newsletterAb.ts:36` | In-memory only, changes nothing once the popup is not mounted. |

### 1.3 "Dormant, not broken" with `NEXT_PUBLIC_SEASON_ONE_MODE=off`

Definition, all must hold:

1. Both gates evaluate to true, so on a post the render and behavior equal `0da2e89` (the branch before the merge): popup mounted, variant assigned on load, 50% scroll trigger, `newsletter_impression` on open, bar variant in the sticky slot, `newsletter_signup` events, `/api/newsletter` body `utm_source:"blog"`, `utm_medium:"popup"|"sticky"`, `utm_campaign:<variant>`.
2. Season 01 is fully absent: `SeasonOneTrigger` returns early (`SeasonOneTrigger.tsx:28`, `:47`), the Season 01 popup never opens, nav and banner labels read "Enroll my gamer", `middleware.ts:25` does not redirect `/register`.
3. Code proof (read-only, already checked): `git diff --stat 0da2e89 HEAD` for `components/ui/NewsletterPopup.tsx` and `lib/newsletterAb.ts` is empty; `StickyCTA.tsx` and `layout.tsx` differ only by Season 01 additions. After the two edits, with the flag off, `isBlogPost` and the mount reduce to the pre-merge expressions.
4. Behavior proof (PB-4): the previous Build Loop's Sentry scripts `docs/blog-newsletter/tests/sentry-p1-p2-p3.mjs`, `sentry-p4.mjs`, `sentry-p5.mjs`, `sentry-p6.mjs`, `sentry-p7-p8.mjs`, `sentry-p9.mjs` pass against a mode-off server. They import `playwright`, point at a Linux Chromium path (`sentry-common.mjs:9`) and write screenshots into the repo (`:10`), so copy them into the scratch QA directory and edit the copy, never the repo files.

How the flag is read: `lib/seasonOne.ts:12` evaluates `process.env.NEXT_PUBLIC_SEASON_ONE_MODE !== "off"` at module load, and Next inlines `NEXT_PUBLIC_*` at compile time into client bundles and the edge middleware. Next is 16.2.1 (Turbopack by default for dev and build). `next dev` with the variable set in the shell before the server starts is enough (the worktree `.env.local` does not define it, count 0, so shell value wins). Restart the server to flip it; delete `.next` between flips to rule out a cached inline. Netlify must have it at build time and needs a new build to change it. Do not trust the setting, verify with sentinels on every run:

- Nav button text: "Join Season 01" (on) versus "Enroll my gamer" (off) (`Nav.tsx:156`).
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:PORT/programs/ekuzo-camps/register`: 307 (on, `middleware.ts:25-31`) versus 200 (off). Loopback only, safe.

Run plan for the evidence: build mode-on (`next build`, `next start`, port 3001) for PB-1 to PB-3, PB-5, JR-1 to JR-6, MN-1 to MN-6; rebuild mode-off (port 3002) for PB-4. `next dev` is fine for iteration but not for JR-3 (finding 2). A `.next` directory serves one server at a time in this repo, so the two modes run one after the other. TG-1 needs the mode-on build anyway.

## 2. Request and event contract

### 2.1 How each observable looks on the wire

| Channel | Shape | Notes |
|---|---|---|
| App API | `POST /api/season-one`, `Content-Type: application/json` | Body below. Response `{ ok: true }` on success (`route.ts:301`). |
| GA4 | `GET` or `POST` to `https://*.google-analytics.com/g/collect?v=2&tid=G-8LM45PX53W&...`; event name in `en=`, string params as `ep.<name>=`, numeric as `epn.<name>=` | Batched POSTs carry extra events as lines in the body (`en=...&ep....`), first event in the query string. Parse both. Enhanced measurement adds `page_view`, `scroll`, `user_engagement`; assert by `en`, ignore the rest. |
| Meta pixel | `GET https://www.facebook.com/tr/?id=1284038230557204&ev=<Event>&...&cd[<k>]=<v>&eid=<eventID>` (some payloads go as POST form) | `eid` carries the `eventID` option. Treated as expected; confirm on the first capture and fix the harness if the key differs. `layout.tsx:180` sets `autoConfig false`, so no automatic button events. |
| Clarity | `POST https://<x>.clarity.ms/collect` (binary, compressed) | Our code makes no Clarity calls (no `clarity(` outside `landing.html`). Record host, path, size only. Tag script `www.clarity.ms/tag/wml8wll5ua` (`layout.tsx:212`). |
| Storage | localStorage and sessionStorage keys below | Read with `page.evaluate`. |

Storage keys:

| Key | Store | Writer (file:line) | Meaning |
|---|---|---|---|
| `ekuzo_attribution` | session | `attribution.ts:77` via `CaptureAttribution.tsx:22` | JSON of the five utm keys, written only when the URL has at least one non-empty utm and no record with a utm exists (first touch) |
| `ekuzo_ai_referral` | session | `attribution.ts:336` | JSON `{origin, detected_via, referrer_host, landing_path}`; presence suppresses a second `ai_referral` this tab-session |
| `ekuzo_s1_joined` | local | `SeasonOnePopup.tsx:128` | `"1"` after a successful sign-up; suppresses auto-open forever |
| `ekuzo_s1_dismissed_at` | local | `SeasonOnePopup.tsx:88` (only if not joined) | ms timestamp; suppresses auto-open for 7 days |
| `ekuzo_s1_attribution` | local | `/season1` landing only | Not written on a blog post |
| `ekuzo_nl_variant`, `ekuzo_nl_blog_dismissed_at`, `ekuzo_nl_blog_subscribed_at`, `ekuzo_newsletter_dismissed` | local | newsletter code (section 1) | Must stay absent in mode-on |
| `ekuzo_origin` | cookie | `middleware.ts:44` | First-touch origin bucket; server side, 1 year |

### 2.2 How the Season 01 popup opens on a blog post

`SeasonOneTrigger` is mounted once in `layout.tsx:222`. Its second effect (`SeasonOneTrigger.tsx:46-65`, dependency `[pathname]`) runs on mount and on every route change:

1. Mode off: return (`:47`).
2. `?join=` present (any value): `openModal("seasonOne")` immediately and return (`:49-52`).
3. Path contains `/register` or `/success`: return (`:53`). Path starts with a quiet prefix (`/make-it-count`, `/swamp`, `/woodward`, `/squad`, `/creators`, `/editors`, `/privacy-policy`, `/terms-of-service`, `lib/seasonOne.ts:18-27`): return (`:54`). A blog post is neither.
4. `localStorage.ekuzo_s1_joined` set: return (`:56`). `ekuzo_s1_dismissed_at` set and younger than 7 days: return (`:57-58`). If storage throws, fall through and show (`:59`).
5. `setTimeout` 2500 ms (`AUTO_DELAY_MS`, `:9`, `:60-62`), cleared if the path changes first; opens only if no modal is active (`activeRef`, `:61`). The 2500 ms starts after hydration, so expect the dialog 2.5 to about 3.5 s after navigation. Assertions: no `[role=dialog][aria-labelledby=s1-title]` at 2000 ms, present by 6000 ms.

Close paths: X button, Escape, both through `dismiss()` (`SeasonOnePopup.tsx:86-91`, writes `ekuzo_s1_dismissed_at` unless joined). "Keep looking around" on the done state uses `closeModal` directly (`:181`); joined is already set. Reopen paths: sticky bar button (`StickyCTA.tsx:161`, visible after `scrollY > 300` and not over the footer), Nav "Join Season 01" (`Nav.tsx:154`), any `/register` link click (`SeasonOneTrigger.tsx:27-43`), `?join=`.

### 2.3 Request body, `page`, `attributionFrom`, `ad`

Built in `submit()` at `SeasonOnePopup.tsx:106-123`, after the email passes `EMAIL_RE` (`:96`). Fields and order:

`email` (trimmed), `source: "site-popup"`, `ad`, `attribution` (7 keys), `attributionFrom`, `page`, `eventId`, `eventSourceUrl`, `ekz_hp`.

- `page` = `window.location.pathname + window.location.search` **at submit time** (`:118`), not at page load. No trailing slash (no `trailingSlash` in `next.config.mjs`).
- `eventSourceUrl` = `window.location.href` (full URL, `localhost` in local QA).
- `eventId` = `crypto.randomUUID()` (36 chars), created once per mounted popup and reused on retry (`:62`, `:99-105`).
- `ad` = `s1.ad || params.get("utm_content") || ""` (`:115`).
- `attribution` and `attributionFrom` come from `getSeasonOneAttribution()` (`attribution.ts:237-252`): current URL if it has any non-empty utm_source/medium/campaign/content/term (`from: "url"`, `pickSeasonOne` `:186-192`), else the `ekuzo_attribution` session record (`from: "session"`), else a valid 7-day `ekuzo_s1_attribution` (`from: "return-visit"`), else all empty (`from: "none"`).

| Case | Setup | `attribution` | `attributionFrom` | `ad` (body) | `page` |
|---|---|---|---|---|---|
| A. UTM post (JR-1) | cold load of `<POST>?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin` | `{utm_source:"x", utm_medium:"social", utm_campaign:"gaming-study", utm_content:"karlin", utm_term:"", utm_id:"", site:""}` | `url` | `"karlin"` | `<POST>?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin` (the query string is kept as typed) |
| B. No UTMs (JR-2) | cold load of `<POST>`, empty storage | all seven `""` | `none` | `""` | `<POST>` |
| C. UTM post, then `/` (JR-4) | load A, then same tab to `/` (full load or client nav), sign up on `/` | `{utm_source:"x", utm_medium:"social", utm_campaign:"gaming-study", utm_content:"karlin", utm_term:"", utm_id:"", site:""}` from the session record | `session` | `""` (session record has no `ad`, `/` has no `utm_content`) | `/` |

`<POST>` is `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` (60 chars). With the A query it is 156 chars, under the route cap of 300 (`route.ts:257`).

Case C mechanics: `CaptureAttribution` runs once in the layout and wrote `ekuzo_attribution` = `{"utm_source":"x","utm_medium":"social","utm_campaign":"gaming-study","utm_content":"karlin","utm_term":""}` on load A (`attribution.ts:54-82`). That key is per tab: a new tab or context starts empty. Timing: the post popup auto-opens at 2.5 s. To reach a sign-up on `/` either navigate away before 2.5 s (the timer is cleared by the pathname change, `SeasonOneTrigger.tsx:63`, and restarts on `/`) or dismiss on the post and open from the Nav button on `/` (a dismiss snoozes auto-open for 7 days). Test both a full `page.goto("/")` and a client-side click on an internal link.

What the route derives (for the Klaviyo proof; browser-level interception cannot show it): `route.ts:249-257` copies the seven attribution values (strings only, capped), `source` from the body if allowed (`:55`, `:235`), `ad` through `normalizeAd` (`:240`, so `"karlin"` becomes `""`), `page` capped at 300; `attribution_from` defaults to `none` and becomes the claimed value only if at least one attribution value arrived (`:264-270`). Expected Klaviyo event "Season 01 Waitlist" properties:

| Case | source | utm_source / medium / campaign / content | utm_term, utm_id, site | ad | attribution_from | page |
|---|---|---|---|---|---|---|
| A | site-popup | x / social / gaming-study / karlin | "" , "" , "" | "" | url | as body |
| B | site-popup | "" x4 | "" | "" | none | `<POST>` |
| C | site-popup | x / social / gaming-study / karlin | "" | "" | session | `/` |

Plus `where` "", `ad_name` "", `geo_*` (empty locally, filled from `x-nf-geo` on Netlify), `device_os` and `device_type` from the user agent (`route.ts:98-105`). Profile props: `season1_waitlist yes`, `season1_source`, `season1_ad`, `season1_ad_name`, `season1_joined_at`.

### 2.4 Journeys JR-1 to JR-6

All run in a fresh context unless stated, mode-on production build, behind the guard of section 3. The POST is answered in the browser with `{ok:true}`. "Lead" below means all three browser-side signals together.

| ID | Action | Observables (exact) | Code |
|---|---|---|---|
| JR-1 | Cold load case A URL. No dialog at 2 s. Dialog by 6 s. Type a valid email, click "Save their spot". | One `POST /api/season-one`, body per case A. Then, after the response: one GA4 beacon `en=generate_lead` with `ep.source=season_one_popup`; one Meta `ev=Lead` with `cd[content_name]=season_one_popup` and `eid` equal to the body `eventId`. UI shows "Awesome." (`C.doneHead`). Storage after: local `ekuzo_s1_joined="1"`; session `ekuzo_attribution` holds the four utm values; absent: `ekuzo_nl_*`, `ekuzo_s1_dismissed_at`, `ekuzo_ai_referral`. No `newsletter_impression`. Cookie `ekuzo_origin=direct` (utm_source x is not paid or AI, no referer: `originClassifier.ts:127-161`). | `SeasonOnePopup.tsx:106-129`, `analytics.ts:104-120` |
| JR-2 | Cold load `<POST>`, same steps. | Body per case B (`attributionFrom:"none"`, `page:<POST>`, `ad:""`). Same GA4 and Meta signals. Session `ekuzo_attribution` **absent** (`attribution.ts:75` returns before the write). | `attribution.ts:54-82`, `:216-234` |
| JR-3 | See 2.5. | One `en=ai_referral` per tab-session. | `CaptureAttribution.tsx`, `attribution.ts:289-342` |
| JR-4 | Case C, both full and client navigation. | Body per case C (`attributionFrom:"session"`, `page:"/"`). First touch kept even if `/` is loaded with its own different utm: add a variant with `/?utm_source=other` expecting `url` and `utm_source:"other"` (the current URL wins, `attribution.ts:216-217`), and say so in the ledger so nobody reads it as a first-touch failure. | `attribution.ts:216-221` |
| JR-5 | Load post, wait for popup, close with X (a second run with Escape). Reload and a new page in the same context. Then set `ekuzo_s1_dismissed_at` to now minus 6 d (no auto-open), minus 8 d (auto-open). Scroll past 300 px, tap the sticky button. | After dismiss: local `ekuzo_s1_dismissed_at` is a ms timestamp near now, `ekuzo_s1_joined` absent. Reload: no dialog for 6 s. Sticky button text "Join Season 01" opens the dialog. Boundary: `Date.now() - at < 7 d` (`SeasonOneTrigger.tsx:58`). Also run joined: after JR-1, reload shows no dialog. | `SeasonOneTrigger.tsx:55-59`, `SeasonOnePopup.tsx:86-91`, `StickyCTA.tsx:161` |
| JR-6 | Fresh context, load `/blog`, click the featured card within 2 s (client navigation to the post). Variant: let the index popup open, dismiss it, then open the post. | Card `href` is `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` (`app/blog/page.tsx:177-178`, `featured: true` at `:27`). Client navigation changes `pathname`, the effect re-runs, popup auto-opens about 2.5 s after the navigation. `CaptureAttribution` does not re-run on client navigation (empty deps), so no `ai_referral` re-check. If the index popup was dismissed first, the post does not auto-open (snooze applies site-wide). Note `/blog` itself is not a quiet path, so the index popup opens after 2.5 s there too. | `SeasonOneTrigger.tsx:46-65` |

### 2.5 `ai_referral` (JR-3, MN-6)

How it fires: `CaptureAttribution` mount effect (`CaptureAttribution.tsx:21-52`) calls `captureAiReferral()` (`attribution.ts:289`). It returns null if `sessionStorage.ekuzo_ai_referral` exists (`:294`). Otherwise it classifies `{searchParams, document.referrer, userAgent}` with the same `classifyOrigin` the middleware uses and returns a payload only for `ai_*` buckets (`:309`). It stores the payload (`:336`) and the component sends `trackAiReferral` after window `load` (or one tick later if already complete). Event: `ga4("ai_referral", {origin, detected_via, referrer_host, landing_path})` (`analytics.ts:187-199`). No Meta call.

Beacon: `en=ai_referral&ep.origin=<bucket>&ep.detected_via=<referrer|utm>&ep.referrer_host=<host>&ep.landing_path=<pathname>`; stored value is the same four fields in JSON.

| Referrer set by the test | `ep.origin` | `ep.referrer_host` | `ep.detected_via` |
|---|---|---|---|
| `https://chatgpt.com/` | `ai_chatgpt` | `chatgpt.com` | `referrer` |
| `https://claude.ai/` | `ai_claude` | `claude.ai` | `referrer` |
| `https://www.perplexity.ai/` | `ai_perplexity` | `www.perplexity.ai` | `referrer` |
| none, URL has `utm_source=chatgpt.com` (extra case) | `ai_chatgpt` | `""` | `utm` |

Simulation: `document.referrer` cannot be set by page script. Two mechanisms work in Playwright on Chrome: (1) `page.goto(url, { referer: "https://chatgpt.com/" })`, which sets the navigation referrer so `document.referrer` equals it; rewriting the header in `route.continue` does not change `document.referrer`, so do not use that. (2) A real click: serve a stub page at `http://chatgpt.com/` through `page.route` (fulfilled in the browser, never on the network) containing a link to the site; clicking it gives a referrer of `http://chatgpt.com/` (origin only, default policy) and `hostname` still `chatgpt.com`. Use (1) for the matrix and (2) once for realism. The server side sees the same value in the `Referer` header on the document request, so also assert the `ekuzo_origin` cookie (`ai_chatgpt`, `ai_claude`, `ai_perplexity`) via `Set-Cookie` on the first response.

Once per session: second full load in the same tab (same context, same `page`, referrer repeated or not) must produce zero further `ai_referral` beacons because the key exists. A new tab or context fires again (sessionStorage is per tab). Client navigations never re-run the effect.

Must-not (MN-6) negatives, each expecting zero `ai_referral` and no `ekuzo_ai_referral` key: no referrer; `https://www.google.com/` (`organic_google`); `https://x.com/` (`social`); `https://t.co/` (`social`); `https://www.facebook.com/` (`social`); `https://duckduckgo.com/`; JR-1's URL with `utm_source=x`. Observation, not a code change: `chatgpt.com.example` or `notclaude.ai` would count as AI because of `host.includes` (`originClassifier.ts:144-148`); include as an informational row so the ledger does not claim stricter matching than exists. Also: with sessionStorage unavailable the event fires per page view (`attribution.ts:295-298`), a documented edge, not tested.

Harness caveat: gtag.js is `lazyOnload`. The beacon exists only after `load` plus idle (`layout.tsx:156-159`), so wait for the `en=ai_referral` beacon with a 10 s timeout rather than a fixed sleep.

### 2.6 Must-not cases

| ID | Observable that proves it | Gate detail |
|---|---|---|
| MN-1 | On a post, mode-on, desktop 1440x900 and phone 390x844: scroll from 0 to 100% in steps, wait 1 s per step: count of `[role=dialog]` that is not `#s1-title`'s dialog stays 0; no node containing text "The EKUZO weekly", "One email after you read this" or the bar line "One email tomorrow"; no `input[type=email][placeholder="Email address"]` inside the fixed bar. | Selectors from `NewsletterPopup.tsx:22-47` and `StickyCTA.tsx:16-29`. Run with the Season 01 popup dismissed and not dismissed. |
| MN-2 | At every sampled moment of a page view, the number of visible full-screen dialogs is at most 1, and the newsletter popup count is 0. Sample every 250 ms across 8 s with scroll to 60% and the sticky bar tap. | Two asks in one view would show `role=dialog` count 2 or the bar plus popup. |
| MN-3 | Guard first (3.4). Ledger shows guard self-test passed before test 1, and proxy log has zero `allowed` external entries. | Section 3. |
| MN-4 | No request to `graph.facebook.com`, `a.klaviyo.com`, `api.beehiiv.com` from the browser; zero `POST /api/season-one` or `/api/newsletter` lines in the Next server log (browser-intercept lane); server outbound log empty. | Section 3. |
| MN-5 | Case by case below. | |
| MN-6 | 2.5. | |
| MN-7 | `06-cleanup-ledger.md` still reads "No production writes yet" until Jamie's go; harness never runs a lane that reaches Klaviyo before then. | Section 4. |

### 2.7 MN-5: can `generate_lead` or Lead fire in these cases? (code reading)

Single call site for the popup: `SeasonOnePopup.tsx:129`, inside `submit()`, after `await fetch` returned `res.ok` (`:124-127` throws otherwise) and after `localStorage.setItem(S1_JOINED_KEY)` (`:128`), guarded by `!honeypotRef.current?.value`. `submit` is bound only to the form `onSubmit` (`:188`). `trackLead` itself always fires GA4 `generate_lead` and Meta `Lead` together (`analytics.ts:108-119`).

| Case | Verdict | Reason (file:line) |
|---|---|---|
| Page load | **Refuted** (cannot fire) | No `trackLead` outside `submit()`, `ContactModal.tsx:59`, and the ad landing page. Layout fires only `PageView` (`layout.tsx:182`) and GA `config`. |
| Popup open | **Refuted** | Open is `openModal("seasonOne")` (`SeasonOneTrigger.tsx:61`); the popup's mount effect (`SeasonOnePopup.tsx:65-84`) only focuses and locks scroll. |
| Dismiss | **Refuted** | `dismiss()` (`:86-91`) writes `ekuzo_s1_dismissed_at` and closes; Escape handler `:75` calls the same. No track call. |
| Autofill of the email field | **Refuted** | Autofill fires `change`/`input`, handled by `onChange` (`:198`), which only sets state. A submit needs a click on the submit button or Enter. The honeypot input being autofilled (`:211-223`) makes `trackLead` skip (`:129`) and the route drop the sign-up (`route.ts:230-233`). Real in-app autofill remains a device check (D-005 in the previous loop). |
| Scroll gesture that starts on the email field or button (touch) | **Refuted** | No `onPointerDown`, `onTouchStart`, `onMouseDown` or `pointerdown`/`touchstart` listener in `SeasonOnePopup.tsx`, `SeasonOneTrigger.tsx`, `StickyCTA.tsx` (grep). Chrome and Safari do not dispatch `click` for a pan, and a form `submit` needs a click on a `type=submit` button. The old `form_start` bug lived in `landing.html`, not here. Harness must run it with a valid email pre-filled so a stray submit would be visible (3.6), plus a positive control tap. |
| Retry reusing one event id | **Refuted** for double counting, with one caveat | `eventIdRef` (`:62`, `:99-105`) is generated once per popup instance and reused by every attempt. A failed attempt throws before `trackLead` (`:124-126`), so a retry after a 502 yields exactly one `generate_lead` and one `Lead` with the same `eid` as both POST bodies. Caveat: the button is disabled while `status === "loading"` (`:205`) and the form is replaced by the done state on success (`:155`), so a second submit is not reachable in practice; a hypothetical second success would send a second GA4 `generate_lead` (GA4 has no id) while Meta dedupes on the shared `eventId`. Test: double-click and Enter-spam on the button, expect one POST. |

Also relevant to the harness and not a popup path: `ContactModal.tsx:59` fires `generate_lead` (`source: "contact_form"`) plus an id-less Meta `Lead` on a successful contact submit. It is reachable from a blog post (Nav "Talk to Humans", `Nav.tsx:283`). QA must not submit it; the test list should include "open and close the contact modal fires no Lead" only if wanted, otherwise leave it out. Another difference from the ad page: the popup has no LIVE-host check (finding 3), so on localhost, a Netlify preview, or the dev deploy, a successful popup sign-up always emits Lead; that is why the guard is mandatory.

## 3. Live-write risk and the safe local harness

### 3.1 What a local sign-up that reaches `/api/season-one` writes

`.env.local` in the worktree carries `KLAVIYO_PRIVATE_API_KEY`, `META_CAPI_ACCESS_TOKEN`, `META_CAPI_TEST_EVENT_CODE`, `META_PIXEL_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` (names only; the Clarity id is also hardcoded in `layout.tsx:212` so that var is unused) and not `META_CAPI_USE_TEST_CODE`. Also present: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `GOOGLE_SHEETS_WEBHOOK_URL`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` (file header says LIVE MODE), `STRIPE_WEBHOOK_SECRET`.

A main sign-up (no `step`, empty honeypot) does, in order:

| # | Write | Code | Live? |
|---|---|---|---|
| 1 | `POST https://a.klaviyo.com/api/events`, metric "Season 01 Waitlist", upserting the profile with `season1_*` props; failure returns 502 and stops | `route.ts:272-276`, `:156-188` | Live Klaviyo account (the previous loop wrote real events with this same local key: `docs/s1-popup-attribution/06-cleanup-ledger.md`) |
| 2 | `POST .../profile-subscription-bulk-create-jobs` for list `XGTv2F` (marketing consent SUBSCRIBED) | `route.ts:278-298` | Live, but the local key lacked the subscriptions scope last time (403 logged, sign-up still succeeded); a deploy key may have it |
| 3 | `POST https://graph.facebook.com/v26.0/<pixel>/events?access_token=...` with a server `Lead`, hashed email, IP, UA, `fbp`, `fbc`, same `event_id` | `route.ts:300`, `metaCapi.ts:44-80` | **Live Meta Lead.** `metaCapi.ts:58` adds `test_event_code` only if `META_CAPI_USE_TEST_CODE === "true"`; it is unset, so no test code. |

Games and age follow-ups (`step: games|age`) write Klaviyo events only (`route.ts:210-226`), never Meta. `/api/newsletter` writes Beehiiv (`newsletter/route.ts:51-104`), a different system, only reached by the footer form or the newsletter popup and bar.

**Risk in two sentences:** a local sign-up that reaches `/api/season-one` with this `.env.local` writes a real "Season 01 Waitlist" profile and event to the live Klaviyo account, attempts a list subscribe, and sends a live server-side Meta `Lead` to the production pixel, which the running ad campaign would optimise on. The browser also fires a live GA4 `generate_lead` and Meta `Lead` on any host unless the collect hosts are blocked from the first request.

### 3.2 Harness design (four layers, any one of them stops a write)

1. **Browser egress guard (default deny).** A local forward proxy, every Chrome context launched through it. Section 3.4.
2. **Browser POST interception.** `context.route` answers `POST /api/season-one` and `/api/newsletter` with `{ok:true}` so the Next server never sees them. Section 3.5.
3. **Server fake credentials.** The Next server is started with every secret name overridden by a fake value in the shell (process env wins over `.env.local`), so a leak reaches Klaviyo, Graph and Beehiiv with a key they reject. Section 3.7.
4. **Server outbound interceptor (optional lane).** A `NODE_OPTIONS=--require` fetch wrapper answers and logs `a.klaviyo.com`, `graph.facebook.com`, `api.beehiiv.com` locally. It is what lets the real route run end to end (to prove `attribution_from` derivation) without any real write. Section 3.7.

### 3.3 Run it on this Mac (nothing is installed in the repo)

Playwright is not in `package.json` and no browser cache exists (`~/Library/Caches/ms-playwright` absent). Google Chrome is installed (`/Applications/Google Chrome.app`). Proposal:

```
QA=/private/tmp/claude-501/-Users-jamiefitch-Projects-ekuzo-web/35bc2a91-c75c-4b5f-9093-aabdc8650086/scratchpad/qa
mkdir -p $QA && cd $QA && npm init -y && npm i playwright-core
# browser: launch the installed Chrome via channel "chrome"; no browser download
```

`playwright-core` is an npm package of a few MB; `chromium.launch({ channel: "chrome" })` uses the installed Chrome with a throwaway profile, so Jamie's real profile and sign-ins are not involved. Fallback if Chrome channel misbehaves: `npx playwright install chromium` (about 150 MB, needs a go, section 5). Node: `~/.nvm/versions/node/v24.14.0/bin/node`.

Vendor scripts: for wire-format fidelity the real `gtag.js`, `fbevents.js` and Clarity tag must run in the page. To keep the guard fully closed, fetch the three files once (plain `curl`, outside the browser, needs a go) into `$QA/vendor/` and serve them to the page with `page.route(...).fulfill`, so the vendor hosts are never reachable from the browser at all (the proxy denies `www.googletagmanager.com`, `connect.facebook.net`, `www.clarity.ms` too). If Jamie declines the download, fall back to tier 1: an init script that replaces `window.gtag` and `window.fbq` with recorders. Tier 1 proves names and params at call level but not the `g/collect` wire format, so JR-1 `en=` / `ep.` lines would be reported as "call-level only".

### 3.4 The guard (MN-3), fail closed from the first request

- `guard.mjs`: a Node `http` server on `127.0.0.1:39001` handling `CONNECT` (HTTPS) and absolute-URI requests (HTTP). Policy is **default deny**: loopback (`localhost`, `127.0.0.1`, `[::1]`) is the only allowed destination and chrome connects to it directly (proxy `bypass: "localhost,127.0.0.1"`), so the proxy sees nothing allowed and every request it receives is a refusal. It answers `403` with header `x-guard: blocked`, never opens an upstream socket, and appends one JSON line per attempt to `$QA/ledger/guard.jsonl`: `{t, ctx, method, host, port, decision:"blocked"}`. A control endpoint `GET http://127.0.0.1:39001/__mark?name=<ctx>&ev=start|end` (called by the harness with Node `fetch`) writes marker lines so every block is attributed to a context.
- Chrome launch: `chromium.launch({ channel: "chrome", proxy: { server: "http://127.0.0.1:39001", bypass: "localhost,127.0.0.1" }, args: ["--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1"] })`. If the proxy is not running, external hosts fail (no direct fallback); the resolver rule is a backstop for any direct connection.
- **Why a proxy and not routes alone:** the previous loop found that Playwright route interception does not see requests the browser issues while a page is torn down (GA4 `user_engagement`, Clarity `sendBeacon` on `pagehide`; `docs/s1-popup-attribution/evidence/network-guard.md`). The proxy sees them and refuses them.
- **Recording for evidence** (the proxy cannot read HTTPS bodies): `context.route` for the beacon URL patterns records full URL, method, decoded query, decoded `postData`, and fulfills locally (`204` for GA4 and Clarity, a 1x1 GIF for `facebook.com/tr`). Patterns: `**/g/collect*`, `**/j/collect*`, `**://*.clarity.ms/**`, `**://www.facebook.com/tr*`, `**://connect.facebook.net/**`, `**://www.googletagmanager.com/**`, `**://*.doubleclick.net/**`, `**://www.google.com/**`, `**://a.klaviyo.com/**`, `**://api.beehiiv.com/**`, `**://graph.facebook.com/**`.
- **Before any functional test** (and again after the last): the self-test opens `http://localhost:PORT/` and, from inside the page, runs `fetch("https://www.google-analytics.com/g/collect?...")` , `navigator.sendBeacon("https://www.clarity.ms/collect", "x")`, an `<img src="https://www.facebook.com/tr?...">`, and a navigation away with a pending beacon. Expected: route log shows the first three recorded and answered locally; proxy log shows blocked CONNECTs for anything that bypassed the routes; nothing is `allowed`. Save as `evidence/guard-selftest.json` and quote it in the ledger. Each browser context starts with the proxy marker, so a missing marker means the context was not guarded and its results are void.

### 3.5 POST interception (MN-4)

```
context.route("**/api/season-one", handler)   // and "**/api/newsletter"
handler: record {ctx, url, method, headers.content-type, JSON body}; then
         route.fulfill({status: 200, contentType: "application/json", body: '{"ok":true}'})
```

Scripted variants: first call `502 {"ok":false,"error":"..."}` then `200` (retry case, one `eventId`); `GET` is never routed. Rules: any POST that was not routed is a harness failure (listen on `context.on("request")` and assert every `/api/*` POST was handled). Proof that nothing reached the server in this lane: count of `POST /api/season-one` and `POST /api/newsletter` lines in the Next server stdout is 0.

The browser lane proves the **request contract** (2.3, 2.4). It cannot prove the server-derived Klaviyo `attribution_from`; that comes from the optional lane in 3.7 or from the Klaviyo proof in section 4.

### 3.6 Script outline (not a finished script)

```
qa/
  guard.mjs        proxy per 3.4; JSONL log; /__mark control endpoint
  intercept.cjs    optional NODE_OPTIONS preload per 3.7
  lib.mjs          launchGuarded(), newCtx(name, {mobile}), beaconDecoders, storage readers
  run-pb.mjs       PB-1..PB-5, MN-1, MN-2 (desktop + phone)
  run-jr.mjs       JR-1..JR-6, MN-5, MN-6
  ledger/          guard.jsonl, selftest.json, routes.jsonl, results.json
```

`lib.mjs` essentials:

```
launchGuarded():   await fetch(guard/__mark?...);  chromium.launch({channel:"chrome", proxy, args})
newCtx(name, o):   mark start; ctx = browser.newContext({
                     viewport, deviceScaleFactor,
                     ...(o.mobile && { isMobile:true, hasTouch:true, userAgent:<Pixel/Android UA>, viewport:{width:390,height:844} })
                   });
                   ctx.route(vendor scripts -> fulfill from $QA/vendor)
                   ctx.route(beacon patterns -> record + fulfill)
                   ctx.route(api patterns -> record + fulfill {ok:true})
                   ctx.on("request", assert no unrouted POST)
decodeGa4(req):    parse url query + postData lines -> [{en, ep:{...}, epn:{...}}]
decodeMeta(req):   parse /tr query -> {ev, id, eid, cd:{content_name}}
storage(page):     page.evaluate(() => ({ls:{...localStorage}, ss:{...sessionStorage}}))
waitEvent(en,ms):  poll recorded beacons
```

Touch-scroll case (required by the Phase-4 gate "Touch-scroll case"), mobile context, popup open, valid email typed with `fill()`:

```
cdp = await ctx.newCDPSession(page)
swipe(from=(x,y) of input center, to=(x, y-300)):
   Input.dispatchTouchEvent touchStart -> several touchMove -> touchEnd
repeat starting on the submit button center
assert: 0 POST /api/season-one, 0 en=generate_lead, 0 ev=Lead, dialog still open, input value unchanged
control: page.touchscreen.tap(button) -> exactly 1 POST, 1 generate_lead, 1 ev=Lead
```

Other MN-5 cases in the same file: page load only (wait 8 s, 0 Lead); open and close with X, with Escape (0 Lead); autofill simulation (set `input.value` through the native setter and dispatch `input` and `change`, plus `fill()`, no click; also fill the honeypot and submit: 1 POST, 0 Lead, because `trackLead` skips); retry (route returns 502 then 200: 2 POSTs with the same `eventId`, 1 `generate_lead`, 1 `Lead` whose `eid` equals it); double-click and Enter-spam (1 POST). Each negative has the positive control in the same context so "zero" cannot mean "harness is blind". Real browser autofill and an in-app browser (D-005) stay a device check for Jamie: open the popup, let the keyboard autofill the email, do not submit.

### 3.7 Server side: environment and the optional interceptor lane

Start the server (production build for evidence) with these names overridden in the shell; process env beats `.env.local`, so no secret is read or printed:

`KLAVIYO_PRIVATE_API_KEY=qa-fake META_CAPI_ACCESS_TOKEN=qa-fake META_CAPI_TEST_EVENT_CODE= BEEHIIV_API_KEY=qa-fake BEEHIIV_PUBLICATION_ID=pub_qa GOOGLE_SHEETS_WEBHOOK_URL=http://127.0.0.1:9/qa RESEND_API_KEY=qa-fake STRIPE_SECRET_KEY=sk_test_qa STRIPE_WEBHOOK_SECRET=whsec_qa NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED=false` (and `NEXT_PUBLIC_SEASON_ONE_MODE=off` only for the PB-4 build). `META_CAPI_USE_TEST_CODE` stays unset. Use the same overrides for `next build` so a build-time fetch cannot write either.

Optional lane (needs Fable's yes): `NODE_OPTIONS="--require $QA/intercept.cjs"` wraps `globalThis.fetch`; for `a.klaviyo.com`, `graph.facebook.com`, `api.beehiiv.com` it appends `{t, url, method, auth_is_fake: <header ends with qa-fake>, body}` (never the header value) to `$QA/ledger/server-outbound.jsonl` and answers `202 {}` / `{"events_received":1}`. With it, real browser sign-ups (POST not routed) run the real route and show the exact Klaviyo `properties` (`attribution_from`, `page`, `ad`), the list-subscribe body, and the Meta payload with `event_id`, all captured before leaving the process. Self-test before use: one `curl` POST to `/api/season-one` with a throwaway address must produce exactly three interceptor lines (events, subscription job, Graph) and `auth_is_fake: true`; if the self-test shows 0 lines the preload did not load and the lane is not used (the fake keys still protect). Total interceptor lines for a run are reported in the ledger.

### 3.8 How the ledger proves zero requests escaped

1. `guard.jsonl`: every context has a start and end marker; entries between markers are all `decision:"blocked"`; count of entries with any other decision is 0; count of external hosts that received a successful CONNECT is 0.
2. `guard-selftest.json` at the start and end of the run (3.4), with a deliberate beacon that must show as blocked or locally answered.
3. `routes.jsonl`: every beacon-pattern request has `fulfilled: local`; zero requests to `graph.facebook.com`, `a.klaviyo.com`, `api.beehiiv.com` from the browser.
4. Next server stdout: zero `POST /api/season-one` and zero `POST /api/newsletter` lines in the browser lane; in the optional lane, equal to the number of interceptor-handled sign-ups.
5. `server-outbound.jsonl` (optional lane): every line answered locally; `auth_is_fake` true on all.
6. A summary table in the evidence ledger: contexts run, beacons recorded by type, blocked CONNECTs by host, escaped requests: 0.

## 4. Klaviyo-side proof plan (waits for Jamie's go; this is an external write)

Scope: JR-1 and JR-2 only (the others change nothing server-side). Prerequisites that need Jamie, in order: go for the push to `dev` (MN-7), go for the Klaviyo write, confirmation of the Netlify env (Jamie only; I cannot see Netlify env).

### 4.1 Two ways to do it (decision needed, Q3)

- **Option D (the requirement as written): the dev deploy.** Drive the deploy URL with the guarded harness (section 3.4, with the deploy host as the single allowed destination, POST not intercepted). Browser beacons are blocked by the guard, so the live GA4 and pixel never see the sign-up. Server side the deploy's own env decides what happens.
- **Option L (the pattern that worked last time): local server, real Klaviyo key, Meta off.** `next start` with `KLAVIYO_PRIVATE_API_KEY` taken from `.env.local` (only this one name un-overridden) and `META_CAPI_ACCESS_TOKEN=qa-fake`, same guarded browser, POST not intercepted. Same route code, no Netlify env uncertainty, no live Lead possible. It does not show `geo_*` (no `x-nf-geo` locally) or whether the deploy key can subscribe to the list. Recommended for the attribution proof; use D additionally only if Jamie wants launch-checklist L2 (geo) and the subscribe scope checked.

### 4.2 Avoiding a live Meta Lead on the deploy (Option D)

`lib/metaCapi.ts` decides, in this order: no `META_CAPI_ACCESS_TOKEN` or no pixel id: skipped (`:48-53`); `META_CAPI_USE_TEST_CODE === "true"` with `META_CAPI_TEST_EVENT_CODE` set: sent with `test_event_code` to Events Manager Test Events (`:58-69`, `:68`); `USE_TEST_CODE` "true" with an empty code: skipped (`:60-67`); anything else: **live**. So the deploy context that serves the `dev` branch needs either the token unset, or `META_CAPI_USE_TEST_CODE` exactly `true` plus a real `META_CAPI_TEST_EVENT_CODE`. A value such as `True` or `1` is live. The intent is documented in `docs/season-one-tracking.md` (env table: previews `true` while testing) but **I cannot see Netlify env and it must be confirmed by Jamie before any deploy sign-up**, for the specific context (branch deploy versus deploy preview) that serves `dev`. If Jamie cannot confirm, use Option L.

Browser side on the deploy: the popup has no live-host guard (finding 3), so the sign-up must be driven only from the guarded harness. Not from a phone, not from a normal browser.

### 4.3 Disposable identities and steps

| Journey | Identity (plus-address on the team domain, as in the last loop) | URL |
|---|---|---|
| JR-1 | `team+gs-jr1-1011@ekuzo.gg` | `<base>/blog/gaming-study-13-7-years-younger-what-it-means-for-kids?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin` |
| JR-2 | `team+gs-jr2-1011@ekuzo.gg` | `<base>/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` |

Use the exact JR-1 UTMs (the expected values in the requirement); the test is excluded from the real campaign readout by address, same as D7 of the previous loop (readout must exclude `team+gs-`). Steps:

1. Immediately before the write, read-only: confirm no flow is triggered by list `XGTv2F` or metric `XNJKbF` (the last check was 2026-10-11 17:30 UTC and a welcome flow was "planned"; if one exists, joining the list would send a real email to the address, so stop and ask).
2. Fresh guarded context, open the URL, wait for the dialog, sign up. Capture the `POST` body (route "record only, continue" for this one request in the allowed-host lane) and assert it equals 2.3 case A or B.
3. Wait 60 s. Read the profile and the "Season 01 Waitlist" event back with the Klaviyo read tools.

Expected event properties:

| | JR-1 | JR-2 |
|---|---|---|
| source | site-popup | site-popup |
| utm_source / utm_medium / utm_campaign / utm_content | x / social / gaming-study / karlin | empty x4 |
| utm_term, utm_id, site, ad, ad_name, where | empty | empty |
| attribution_from | url | none |
| page | `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin` | `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` |
| device_os / device_type | `mac` / `desktop` (or `android` / `mobile` if the mobile context is used) | same |
| geo_* | filled on Netlify (L2), empty locally | same |

Profile: `season1_waitlist=yes`, `season1_source=site-popup`, `season1_ad` empty. Also check list membership on Option D (expected subscribed if the key has the scope). Record event ids in the ledger.

### 4.4 Cleanup-ledger row format

Same columns as the previous loop's `docs/s1-popup-attribution/06-cleanup-ledger.md`:

`| When (UTC) | System | Write | Identity | State after | Cleanup |`

Example row (fill at write time):

`| 2026-10-12 HH:MM:SS | Klaviyo | "Season 01 Waitlist" event <id> (site-popup, attribution_from url) from <local server / dev deploy> | team+gs-jr1-1011@ekuzo.gg (profile <id>) | Profile and event exist; list XGTv2F: <subscribed / 403 not subscribed> | Left in place (no profile-delete tool); readout excludes team+gs- |`

Plus the trailing lines the previous ledger used: "Meta: no writes (<why>)", "Flows: checked before the write, none on list XGTv2F or metric XNJKbF (<time>)". A browser-only GA4 or Clarity beacon that escaped would be its own row; the guard is designed so there are none.

`06-cleanup-ledger.md` is created now with the required single line.

## 5. Human-action items and open questions (most important first)

Actions for Jamie:

1. **Confirm the Netlify env for the context that serves the `dev` branch** before any deploy sign-up: `META_CAPI_ACCESS_TOKEN` unset, or `META_CAPI_USE_TEST_CODE` exactly `true` with a real `META_CAPI_TEST_EVENT_CODE`. I cannot see it. Also `KLAVIYO_PRIVATE_API_KEY` present and whether it has the subscriptions scope. If unsure, choose Option L (4.1).
2. **Go for the Klaviyo write** (JR-1, JR-2), and the choice D or L. Includes: two `team+gs-...@ekuzo.gg` addresses OK to create and leave in Klaviyo (no delete tool), and OK to be subscribed to the live list on Option D.
3. **Go to install `playwright-core` with npm into the scratch directory** (outside the repo) and to use the installed Google Chrome through `channel: "chrome"`. If Chrome channel fails, a go for `npx playwright install chromium` (about 150 MB from Playwright's CDN).
4. **Go to download the three vendor scripts once** (`gtag.js` for `G-8LM45PX53W`, `fbevents.js`, the Clarity tag and its `clarity.js`) with `curl` into `$QA/vendor` so the page can run real analytics code without the browser ever touching those hosts. Decline means tier 1 (call-level only, no `g/collect` wire proof).
5. **Phone check (TG-8): do not submit the sign-up on a phone** against the dev deploy. The popup fires a live browser Lead on any host. Check open, sticky bar, scroll, dismiss, and autofill of the field without tapping "Save their spot".
6. Approve the two gating edits (layout and StickyCTA) so Atlas can apply them in phase 3.

Open questions for Fable:

- Q1. **Does PB-5 / MN-2 count the permanent footer "Join the Newsletter" form?** Every page has it (`Footer.tsx:134`), including a post with the Season 01 popup open (the popup covers it while open). I assumed popups and bars only. If the footer counts, that is a copy and design decision outside this gating.
- Q2. **JR-3 and MN-6 on a production build only.** `next dev` cannot show `ai_referral` (finding 2). OK to state that in the ledger and run those two on `next start`? The alternative is a code change (not allowed by decision 8).
- Q3. Option D or L for the Klaviyo proof (4.1).
- Q4. Add the optional server-interceptor lane (3.7) so the real route's `attribution_from` is proven locally with no write, or rely on reading `route.ts:264-270` plus the Klaviyo proof?
- Q5. The lookalike-host observation (`originClassifier.ts:144-148`): note only, or raise as a follow-up? Not fixed here (no new tracking code).
- Q6. The popup's missing live-host guard (finding 3) is outside this build's scope (NR-2 protects `SeasonOnePopup`). Raise as a follow-up for the previous loop's owner?
- Q7. Is the exact JR-1 UTM set acceptable for the disposable identity (it will sit in Klaviyo under `utm_campaign=gaming-study`), excluded by address, or do you want a marker such as `utm_term=qa` (which changes the expected values)?
- Q8. Should the contact-modal Lead (`ContactModal.tsx:59`) be in scope as "other Lead path on a post"? Currently listed only as a note.
