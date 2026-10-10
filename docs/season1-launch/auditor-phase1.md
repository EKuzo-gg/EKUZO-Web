# Auditor phase 1 (Scout + requirements audit)

Auditor: Build Loop Auditor role, 2026-10-10. Read-only on product code. Primary target `release/season1` (4457689, base 3aefd6c).

**SIGN-OFF WITH CHANGES.** The map is accurate and N1 is zero-diff. The requirement set is thin in four places that matter for the ads (list-subscribe failure path, honeypot vs browser Lead, invalid or missing `ad`, SEASON_ONE_MODE blast radius). 13 changes proposed below. No code defect is a release blocker on its own; items 1, 2, 4 and 8 need a Jamie decision or an accepted-risk line before go.

## 1. Scout: map verification

(a) Tree ids, `git rev-parse <head>:<path>` (identical id means identical content):

| Path | release 4457689 | feat 73ca059 |
|---|---|---|
| app | 478e389cef71ebcdaac3848c3438f603f4e8c988 | 478e389cef71ebcdaac3848c3438f603f4e8c988 |
| components | 356fcbc6e199303fb98a40daa0f7dc4467ce9f24 | 356fcbc6e199303fb98a40daa0f7dc4467ce9f24 |
| lib | ab2e4c202bad28867bce9b7cba550ccc2c619153 | ab2e4c202bad28867bce9b7cba550ccc2c619153 |
| context | 5168b6a15d932b19332846a4cec2c44bd90d8208 | 5168b6a15d932b19332846a4cec2c44bd90d8208 |
| middleware.ts | b29f7c690a17e43518afe255c09d5e51c7b49b97 | b29f7c690a17e43518afe255c09d5e51c7b49b97 |
| next.config.mjs | 94ea36f054afc069862500b7e8d4e2be13d9e2b2 | 94ea36f054afc069862500b7e8d4e2be13d9e2b2 |
| docs/season-one-tracking.md | d450b86a4925f4459c99fd19a8230797e5da37e6 | d450b86a4925f4459c99fd19a8230797e5da37e6 |
| public/roadshow/landing.html | 9ae606f0b1338114d4b06879bad41ba661b135ba | 9ae606f0b1338114d4b06879bad41ba661b135ba |
| public/images | c20826c9b09dcc905f4d01f90798a7680ec943b3 | c20826c9b09dcc905f4d01f90798a7680ec943b3 |

Whole-tree check (`ls-tree -r` of both heads, diffed): the only differences are the 30 files in (b) plus `WORKLOG.md` (differs, expected; not in the N-list). Nothing else.

(b) Excluded from release, present on feat (`git ls-tree -r --name-only <head> -- <path> | wc -l`, release / feat): `public/review.html` 0/1; `public/roadshow/ad-lab.html` 0/1; `ads.html` 0/1; `index.html` 0/1; `site.html` 0/1; `vote.html` 0/1; `public/ads` 0/24. Also absent at base 3aefd6c (so main has never had them). `public/roadshow/` on release contains only `landing.html`. Confirmed.

(c) Files changed.

`3aefd6c..4457689` (19 files, +1926 -11): WORKLOG.md; app/api/season-one/route.ts (new, 210); app/layout.tsx; components/layout/Nav.tsx; components/sections/FooterBanner.tsx; components/ui/ModalRenderer.tsx; components/ui/SeasonOnePopup.tsx (new, 299); components/ui/SeasonOneTrigger.tsx (new, 68); components/ui/StickyCTA.tsx; context/ModalContext.tsx; docs/season-one-tracking.md (new); lib/analytics.ts; lib/metaCapi.ts (new); lib/programRoutes.ts; lib/seasonOne.ts (new); middleware.ts; next.config.mjs; public/images/season-one-kid.jpg (new, 330 KB); public/roadshow/landing.html (new, 1051 lines, 1.3 MB).

`2f3a83f..73ca059` (32 files): M WORKLOG.md, M app/api/season-one/route.ts, M components/ui/SeasonOnePopup.tsx, A docs/season-one-tracking.md, M lib/analytics.ts, A lib/metaCapi.ts, M next.config.mjs, M public/roadshow/landing.html, plus 24 A `public/ads/season1/d{1..12}-a-*-{feed,story}.jpg`.

Consequence worth stating: on dev the popup, mode flag and Nav/Sticky/Footer wiring already existed (Aaron). On production the release adds ALL of that at once. So prod gets Aaron's whole SEASON_ONE_MODE (default ON) funnel pause, not just tracking. The requirements treat P5 as a one-liner; the real change on main is bigger (see proposals 7 to 9).

## 2. N1 protected surfaces (verbatim)

Command per path: `git diff --stat 3aefd6c 4457689 -- <path>`. Every one printed nothing (empty stdout, exit 0). "Existing files" = files under that path at 3aefd6c, to prove the pathspec matched something and the empty result is not a typo.

| Path | Output | Existing files at base |
|---|---|---|
| app/api/webhooks | (empty) | 1 |
| app/api/camps | (empty) | 4 |
| app/api/checkout | (empty) | 1 |
| app/api/contact | (empty) | 1 |
| app/api/ekuzo100 | (empty) | 4 |
| app/api/ekuzo101 | (empty) | 2 |
| app/api/newsletter | (empty) | 1 |
| app/api/squad | (empty) | 1 |
| app/api/swamp | (empty) | 1 |
| app/api/teams | (empty) | 4 |
| app/api/woodward | (empty) | 1 |
| app/programs/*/success | (empty) | 8 |
| lib/schema.ts | (empty) | 1 |
| components/JsonLd.tsx | (empty) | 1 |

Result: **N1 PASS, zero diff.** Note the N1 text does not protect `app/camps/**` (legacy `/camps/register`, `/camps/success`), `app/success/`, `app/teams`, `lib/originClassifier.ts`, `lib/attribution.ts`, `public/robots.txt`, `app/sitemap.ts`. None changed in the diff list above, so no finding; propose widening N1 to "whole tree minus the 19-file allowlist" (proposal 13).

## 3. Findings from reading the diff (evidence for the proposals)

- F1. `/api/season-one` returns `{ok:true}` when the list subscribe fails (route logs only). Browser Lead then fires and CAPI Lead is sent for a parent who is not on the list. Matches the pre-flight flag (event exists, list has 0 profiles). Docs and T2/T3 say "after the API returns ok", which is satisfied, so no requirement catches it.
- F2. Honeypot hit returns 200 `{ok:true}`. Both clients treat that as success and fire the browser Lead (landing: `if(LIVE && !leadSent) fbq(...)`; popup: `trackLead`), plus GA4 `generate_lead` in the popup. S1 says "no Lead"; true for server only. A JS bot that fills the hidden field pollutes the pixel but not Klaviyo or CAPI. Low severity, but T2/S1 as written contradict the code.
- F3. Landing `ad` handling: `id = (qs.get("ad")||"d1")...; if(!T[id]) id="d1"`. Missing, malformed, or `d13` `?ad=` silently renders AND records ad d1 (`ad:d.id`). Attribution distortion for typo'd UTM links. `d01` is normalized to `d1`. P1 covers only 1..12.
- F4. Dead or unreachable API surface: `step:"age"` (route only; neither client sends it; `.age` in landing.html is a chip container class, not an age step) and `firstName` (route accepts, neither client sends it). `where` is sent by landing only (popup omits it, so popup events have `where:""`). T6 lists `where` as if always populated.
- F5. Property naming inconsistent with T6 ("profile `season1_*`"): games step writes `kid_games` (no prefix) and the age step writes `season1_kid_age`. P3 says `kid_games`, so P3 and T6 disagree.
- F6. Abuse surface (S4): no rate limit, no origin or CSRF check, no captcha. Any caller can (a) subscribe any third-party email to marketing with `consent: SUBSCRIBED` on a single opt-in list (consent and list-bombing exposure: someone can enrol a victim's address; CAN-SPAM/GDPR relevance), (b) create profiles and events for arbitrary emails via the unauthenticated `games`/`age` steps without any subscription, (c) burn Klaviyo API quota. CAPI is only reached via the main path.
- F7. Landing ships design-lab internals to production: the inline `D` array has `why`, `from`, `photo` strings naming Jamie, Karlin and Aaron and internal concepts ("Jamie's second question", "Karlin's email", "Karlin liked", "Aaron's Figma frames"), and 12 ad-art templates with 5 `alts` copy variants for d8. P6 excludes the internal pages but this same content is public in `/season1` and `/roadshow/landing.html` page source. Also 1.3 MB single HTML with base64 images, 40+ Google Font families requested (mobile paid traffic: speed and CPU).
- F8. Mode flag reach (`NEXT_PUBLIC_SEASON_ONE_MODE`, default ON, build-time inlined): `openModal("enroll")` is remapped to the waitlist popup in `ModalContext` (so `EnrollModal` is unreachable); Nav (desktop and mobile) label becomes "Join Season 01"; FooterBanner heading and label override when `ctaModal==="enroll"`; StickyCTA replaced by one waitlist bar everywhere except hidden on /register,/success,/swamp,/woodward; `getProgramRegisterContext` returns null (all direct `/register` routing off); `NewsletterPopup` hard-disabled; `SeasonOneTrigger` auto-opens a full-screen popup 2.5 s after first visit on every non-quiet page and hijacks every same-origin `/register` link click; middleware 307s ANY path ending `/register` (including `/camps/register` via the existing 308 to `/programs/ekuzo-camps/register`, then 307), and runs before the `ekuzo_origin` first-touch cookie is set. Because the env is `NEXT_PUBLIC_`, toggling it needs a rebuild, not just a redeploy of env.
- F9. Success pages: the redirect leaves `/success` alone (verified: success pages unchanged), but `SeasonOneTrigger` also skips `/success`, so a paying customer is not interrupted. Good. However, a customer mid-checkout whose tab is on `/register` when production ships will be 307'd away on the next navigation or refresh.
- F10. Meta: Graph `v26.0` is asserted as current in a code comment; unverifiable from here. A wrong version fails soft (S3), so a mis-set version would silently zero server-side Leads. Needs a Test Events 200 as evidence. Access token is sent as a URL query param (server side only; error logs print status and body, not the URL, so no leak seen).
- F11. CAPI `event_time` is server `now`, not click time; `client_ip_address` uses `x-nf-client-connection-ip` first (correct on Netlify); `fbc` rebuild uses `Date.now()` rather than the click time, which Meta tolerates but weakens match quality. `em` array of one hashed value is correct. No `fn`, `external_id`. Accept or note.
- F12. Landing `LIVE` regex matches `ekuzo.gg`, `*.ekuzo.gg`, `netlify.app`, localhost. Any Netlify deploy preview of any other site is excluded by origin, but ANY `*.netlify.app` URL (including `dev--ekuzo.netlify.app`) fires a real Lead to the production pixel and writes real Klaviyo profiles. With `META_CAPI_USE_TEST_CODE` on dev only the server half is test-routed; the browser Lead on dev still hits the live pixel unless Test Events browser tool is used. T8 says netlify.app is "live" but T9 only guards the server.
- F13. `unique_id` for Klaviyo events is `${email}-${metric}-${Date.now()}`, so a retry creates a second "Season 01 Waitlist" event for the same person (benign, but event count != sign-up count). CAPI retry reuses `event_id` so Meta dedupes.

## 4. Proposed requirement changes (numbered)

1. **T10 (new, fixes F1).** If the list subscribe fails, define the contract: either (a) route returns 502 and no Lead on either side, or (b) accepted risk with a log-and-alert path (Klaviyo event exists, profile can be backfilled). Test: stub Klaviyo `profile-subscription-bulk-create-jobs` to 500; assert response code, Lead presence/absence in network and Test Events. Needs Jamie decision. Strongly recommend L2 assert list membership, not only the event (already in 02-frozen-spec; promote it into L2 text).
2. **S1 reword (F2).** "Honeypot filled: server returns 200, writes nothing, sends no CAPI Lead. Browser Lead is a documented gap OR suppressed client-side (check `ekz_hp` empty before firing)." Test: POST with `ekz_hp:"x"` returns 200 and Klaviyo event count unchanged; Playwright fills hidden field and asserts fbq Lead not fired (if suppressed).
3. **P1 extend (F3).** Add: missing, malformed, or out of range `ad` renders d1 and records the value actually shown; `d01..d09` aliases normalize. Decide whether unknown `ad` should record the raw value in `utm_content`/page (it does via `page`). Test: table of 8 URLs (`?ad=d1`, `d01`, `D3`, `d12`, `d13`, `''`, none, `xss<`) asserting rendered variant and posted `ad`.
4. **S4 split (F6).** Make it three testable items: S4a the `games`/`age` steps require a prior sign-up (or are accepted as-is, with rationale); S4b no third-party enrolment concern: decide single opt-in vs double opt-in or confirmation email (welcome flow is Monday's fast follow, so on day one anyone can enrol anyone); S4c rate limiting or accepted risk. Test: scripted 50 POSTs from one IP to the route on dev, record Klaviyo profile creation count. Needs Jamie decision (compliance).
5. **P2 split (F1, F4).** Add explicit server-failure variants: 400 (bad email), 500 (key missing), 502 (Klaviyo event), network error. Today P2 lumps them. Test: route unit test with `fetch` mocked per branch, plus browser test with `page.route` forcing each status and asserting copy and no Lead.
6. **T11 (new, F12).** Browser Lead on non-prod hosts: state the policy. Either `LIVE` excludes `*.netlify.app` from the browser Lead (and only ekuzo.gg fires), or accept that dev deploys send real browser Leads and require use of Test Events browser. Test: load `/season1` on dev with Pixel Helper and check the Lead's test flag.
7. **P5 widen (F8).** Rewrite as the true scope: "any path ending `/register` 307s to the parent path with `?join=season-one`, existing query kept; `/camps/register` and `/ekuzo-camps/register` reach the same result through the legacy 308; `/api/**/register` untouched; success pages untouched". Test: curl -I table for `/programs/{ekuzo100,ekuzo101,ekuzo-camps,ekuzo-teams}/register`, `/camps/register`, `/ekuzo-camps/register?cta=header`, `/programs/ekuzo-camps/success`, `/api/camps/register` (POST untouched).
8. **P8 (new, F8).** Mode behaviour on every touchpoint: Nav desktop and mobile label, FooterBanner (enroll vs contact CTA variants), StickyCTA, EnrollModal unreachable, NewsletterPopup suppressed, `SeasonOneTrigger` auto-open (first visit, 2.5 s, 7-day snooze after close, never after joined, quiet paths, `?join=` any value) and register-link hijack. Test: Playwright matrix on `/`, `/programs/ekuzo-camps`, `/parents`, `/faq`, `/make-it-count`, with cleared storage, joined storage, dismissed storage. Include "popup does not open on /success, /register".
9. **P9 (new, F8).** Flag-off restores the old funnel: build with `NEXT_PUBLIC_SEASON_ONE_MODE=off`; `/register` pages load; Enroll modal shows the three program links; Nav label "Enroll my gamer"; no popup auto-open; no console errors. Also state that the flag is build-time (needs a rebuild). Test: second `next build` with the env off, diff of rendered HTML for `/` and `/programs/ekuzo-camps` against base 3aefd6c.
10. **T12 (new, F4/F5).** Pin the property contract in one table (event props, profile props, names) and make P3, T6 and the doc agree: `kid_games` vs `season1_*`; `where` empty for popup is expected; `firstName` and `step:"age"` are either removed or labelled "API only, no client uses it". Test: a contract test posting the three request shapes to the route with Klaviyo mocked and snapshotting the outgoing bodies (also gives T6, S2, T4 mechanical evidence).
11. **N5 (new, F7).** Production page source hygiene: `curl -s https://ekuzo.gg/season1 | grep -ci 'jamie\|karlin\|aaron'` must be 0 (or accepted by Jamie), plus page weight budget (record bytes transferred and LCP on a throttled mobile profile; today 1.3 MB HTML). Copy-owner is Aaron, so route as a decision, but the leakage of internal names is a factual hygiene issue. Needs Jamie and Aaron.
12. **T13 (new, F10/F11).** CAPI wire evidence: capture the outbound request body and the Graph response (Test Events and `events_received:1`) proving `v26.0` is accepted; assert payload contains no `kid`, `game`, `age` keys (T4/T5 mechanical check: `JSON.stringify(payload)` grep). Also verify `event_source_url` and `fbc` present when `fbclid` supplied. Test: route handler test with `fetch` spy, plus one live Test Events capture.
13. **N1 widen and N6 (new).** N1: add "whole tree diff vs base equals exactly the 19-file allowlist in 4457689" as a check (`git diff --name-only 3aefd6c 4457689 | sort` equals the recorded list). Add N6 robots/sitemap/schema non-impact: `/season1` and `/roadshow/landing.html` carry `noindex`, absent from `app/sitemap.ts` (currently 0 matches) and the site JSON-LD is unaffected (zero-diff on `lib/schema.ts` already covers the code half). Also record in N2 the `app/layout.tsx` inline script count to catch a doubled pixel on `/`.

Also consider (no change needed, listed for the lead): T1 should state the landing carries its own pixel while the site pages get theirs from `app/layout.tsx`, so the popup Lead rides the layout pixel (`NEXT_PUBLIC_META_PIXEL_ID || 1284038230557204`); a Netlify env override of that var would silently split pixels between `/season1` (hard-coded) and the popup. Test: on prod, `fbq.getState().pixels` equals `[1284038230557204]` on both surfaces.

## 5. Per-requirement testability verdicts

| Req | Complete? | Mechanically testable? | Gap |
|---|---|---|---|
| P1 | partly | yes (curl + Playwright) | invalid/missing ad (3), `/roadshow/landing.html` parity |
| P2 | partly | yes | server failure variants (5) |
| P3 | yes | yes (mock + Klaviyo query) | name vs T6 (10) |
| P4 | vague ("end to end") | yes once defined | define: CTA list and the same cases as P2, T2, T3 |
| P5 | too narrow | yes | widen (7) |
| P6 | yes | yes (git ls-tree + curl 404 on prod) | also confirm 404 not SPA fallback |
| P7 | yes | yes (curl meta) | add sitemap/robots (13) |
| T1 | yes | yes (Pixel Helper, network) | popup pixel provenance |
| T2 | yes | yes | honeypot (2), retry matrix |
| T3 | yes | partly | wire capture (12) |
| T4 | yes | yes (payload grep) | include landing games step to Meta = none |
| T5 | yes | yes | |
| T6 | partly | yes (contract test) | prop names (10) |
| T7 | yes | yes (network) | |
| T8 | yes | yes | `*.netlify.app` policy (6) |
| T9 | yes | yes (unit test of sendCapiEvent) | |
| S1 | partly | yes | contradiction (2) |
| S2 | vague | partly | needs concrete tests: length caps table, secret grep of `.next/static` |
| S3 | yes | yes | add list-subscribe case (1) |
| S4 | not testable as worded | no | split (4) |
| N1 | yes | yes | PASS today |
| N2 | yes | yes | |
| N3 | yes | yes | |
| N4 | yes | yes | reference commit named; fine |
| L1-L4 | yes | yes | L2 must include list membership |
