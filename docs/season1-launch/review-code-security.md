# Season 01 release: code and security review

Reviewer: fresh-context code and security reviewer (Build Loop). Did not write this code. Find and report only; no product code was changed.

Scope: `release/season1` at 4457689, diff `3aefd6c..4457689` (binary images ignored). Dev branch `feat/season1-launch` (`2f3a83f..73ca059`) checked for parity.

## How this was verified

- Read every changed source file in full: `app/api/season-one/route.ts`, `lib/metaCapi.ts`, `lib/analytics.ts`, `lib/seasonOne.ts`, `lib/programRoutes.ts`, `middleware.ts`, `next.config.mjs`, `components/ui/SeasonOnePopup.tsx`, `components/ui/SeasonOneTrigger.tsx`, `app/layout.tsx`, Nav, StickyCTA, FooterBanner, ModalContext, ModalRenderer, and `public/roadshow/landing.html` (head tags, form markup, lines 833-1051 script).
- `tsc --noEmit`: clean. `next build` (with a dummy `STRIPE_SECRET_KEY`): succeeds.
- Ran `next start` locally and probed routes and the API (results cited per finding). Grepped the built client chunks (`.next/static`) for `KLAVIYO_PRIVATE`, `META_CAPI_ACCESS`, `graph.facebook.com`, `a.klaviyo.com/api`: no hits.
- Read live Klaviyo state (read-only, via the Klaviyo connector): list `XGTv2F`, metric "Season 01 Waitlist", its events and the test profile.
- Probed the live hosts `dev--ekuzo.netlify.app` and `ekuzo.gg` with curl.
- Protected surfaces (N1) are zero-diff: `git diff --stat 3aefd6c 4457689` over webhooks, the other API routes, success pages, `lib/schema.ts`, `components/JsonLd.tsx` is empty.
- Dev branch parity: `route.ts`, `SeasonOnePopup.tsx`, `analytics.ts`, `metaCapi.ts`, `next.config.mjs`, `landing.html` are byte-identical between 73ca059 and 4457689. Beyond those, the dev range adds only `WORKLOG.md`, `docs/season-one-tracking.md` and 24 JPGs under `public/ads/season1/`. Nothing risky.

## Findings

### CR-1. Klaviyo list subscribe is failing silently; parents see "you're in" but are never subscribed
- Severity: CRITICAL
- Type: infra-gap (root cause) plus code-bug (silent-success design)
- Location: `app/api/season-one/route.ts:187-205`
- Evidence:
  - Live Klaviyo, list `XGTv2F` "Season 01 Waitlist": `opt_in_process: single_opt_in`, `profile_count: 0`.
  - Metric "Season 01 Waitlist" (`XNJKbF`) has 2 events, 2026-10-09 19:01:20 and 20:18:14 UTC, from `aaron.root33@gmail.com`, `source: ad-landing`, `ad: d2`. So the event call (step 1) succeeded both times.
  - That profile (`01M4H0N4XXJXRR8BHFDEWFPF64`): `subscriptions.email.marketing.consent: NEVER_SUBSCRIBED`, `lists: []`. The subscribe (step 2) never took effect.
  - The subscribe block that ran on 10-09 (commit d552808) is identical to the release one. Because the code treats a subscribe failure as non-fatal (lines 199-202 log and continue), the route returned `{ ok: true }`, the page showed the confirmation, and (in the release code) a server and browser Meta `Lead` would also fire.
  - Most likely cause (medium confidence, not testable from here): the `KLAVIYO_PRIVATE_API_KEY` lacks the `subscriptions:write` scope. The other routes only use `events`, `profile-import` and `lists/.../relationships/profiles`, which need `events:write`, `profiles:write`, `lists:write`; Bulk Subscribe additionally needs `subscriptions:write`, and a missing scope returns 403. Second candidate: a 400 on the payload. `custom_source` is, to my knowledge, a documented optional attribute of `profile-subscription-bulk-create-job` (high confidence but unverified against the live API); the rest of the payload shape matches Klaviyo's docs. The Netlify function log line `Klaviyo Season 01 list subscribe failed: <status> <body>` around those two timestamps will settle it.
  - Note: the endpoint is async (202). A 202 followed by a failed job would also look like this, but is less likely than a synchronous 4xx.
- Impact: requirement 1 ("write the parent to Klaviyo" with consent, T6) fails for every sign-up while the parent is told they are on the list, and Meta is told a Lead happened. Ads would optimize on Leads that never reach the list.
- Fix direction (backend/infra): pull the Netlify log for the 10-09 runs, fix the key scope (or payload), re-run L2 and confirm list membership; then decide whether a subscribe failure should return 502 so the parent retries (the event write is safe to repeat) instead of a silent success plus Lead.

### CR-2. `/season1` rewrite has never been exercised on Netlify; the ad URL currently 404s on both hosts
- Severity: MAJOR
- Type: infra-gap
- Location: `next.config.mjs:24-26`
- Evidence:
  - Locally (`next start`), the rewrite works: `/season1?ad=d3&utm_source=meta` returns 200 with the 1,303,377-byte landing page; `/season1/?ad=d3&fbclid=abc` 308s to `/season1?ad=d3&fbclid=abc` (query kept); `/Season1` also returns 200.
  - Live: `https://dev--ekuzo.netlify.app/season1` and `https://ekuzo.gg/season1` both return 404. The dev deploy predates commit 3f3a5dc (its `landing.html` has no `ekz_hp` and no `eventID`), so this 404 does not prove the rewrite fails; it proves it has not been tested on Netlify yet. `/roadshow/landing.html` returns 200 on dev.
  - Whether Netlify's Next runtime (v5, auto-installed by `@netlify/plugin-nextjs`) serves an afterFiles rewrite whose destination is a file in `public/` could not be verified from here. Confidence it works: medium.
  - Middleware does run on `/season1` (matcher has no dot in that path) and only sets the first-touch `ekuzo_origin` cookie; observed on the live 404 response. No harm.
- Impact: if the rewrite does not work on Netlify, every ad click lands on a 404.
- Fix direction (infra): treat L1 as a launch gate (deploy, then curl `/season1?ad=d3` for 200 and the expected `<title>`). Fallbacks if it fails: a Netlify `200` rewrite rule, or point the ads at `/roadshow/landing.html?ad=dN&...`, which is already proven to serve.

### CR-3. Meta pixel automatic events can send the child's games to Meta (browser side)
- Severity: MAJOR
- Type: code-bug (config), confidence medium
- Location: `public/roadshow/landing.html:12` (pixel init), `app/layout.tsx:180` (pixel init); game chips at `landing.html` conf dialog and `components/ui/SeasonOnePopup.tsx:161-175`
- Evidence: the server path is clean (see "Child-data rule" below), and no explicit `fbq` call carries child data. However, both pixels are initialized without `fbq('set', 'autoConfig', false, '<pixel>')`. With Meta's "automatic events" setting on (the default for a pixel in Events Manager), the pixel sends `SubscribedButtonClick` events with the clicked button's text. The confirmation screen's chips are plain `<button>` elements whose text is "Fortnite", "Roblox", "Minecraft" and so on, which is information about the child, sent alongside the parent's `_fbp`. Whether it actually fires depends on the Events Manager toggle, which I cannot see.
- Impact: would breach requirement 3 / T4 ("nothing about the child to Meta") on both surfaces.
- Fix direction (frontend + Jamie in Events Manager): add `fbq('set','autoConfig',false,'1284038230557204')` before `fbq('init', ...)` in both places, and/or turn off "Automatic events" for the dataset; verify in Pixel Helper that tapping a chip sends nothing.

### CR-4. Unauthenticated, unthrottled sign-up endpoint: list bombing and Lead poisoning
- Severity: MAJOR
- Type: accepted-risk candidate
- Location: `app/api/season-one/route.ts:121-205`; honeypot at `:154`
- Evidence: no rate limit, no origin check, no CAPTCHA. The honeypot only stops form-filling bots; a scripted `POST /api/season-one {"email": "victim@x.com", "source": "ad-landing"}` simply omits `ekz_hp`. Each such request (a) creates or updates a Klaviyo profile and, once CR-1 is fixed, subscribes it to marketing on a single opt-in list, and (b) sends a live server CAPI `Lead`.
- Impact: third parties can be subscribed to EKUZO marketing (spam complaints, deliverability, weak consent record); fake Leads feed the ad optimizer, which is the most expensive failure mode for a Lead-optimized campaign. Exposure is low until someone targets it, and parent ads raise visibility.
- Fix direction (infra/backend): at minimum a per-IP rate limit on `/api/season-one` (Netlify rate-limit rule or a small in-function check); consider Turnstile on the forms or flipping the list to double opt-in. If accepted for launch, record it with a watch item (Lead count vs. list growth, Events Manager anomalies).

### CR-5. `step: "games"` / `"age"` let anyone write properties to, or create, any email's Klaviyo profile
- Severity: MINOR
- Type: accepted-risk candidate
- Location: `app/api/season-one/route.ts:135-150`
- Evidence: no proof the caller owns the email. Any request with a valid-looking email creates a `NEVER_SUBSCRIBED` profile (event API upserts) or overwrites `kid_games` / `season1_kid_age` on an existing one. Nothing reaches Meta (verified: these branches return before `sendMetaLead`). Locally, `{"step":"games","email":"x@y.co","kidGames":"<script>..."}` passes validation; the value is JSON-encoded so there is no injection in our code.
- Impact: low. Property tampering on real parents (could mis-personalize email), junk profiles that may count toward Klaviyo's active-profile billing (the test profile shows `can_receive_email_marketing: true` while never subscribed). If a Klaviyo template ever prints `kid_games` or `season1_ad_name`, it is attacker-controlled text (Klaviyo escapes by default, unverified).
- Fix direction (backend): accept as is, or return a short HMAC token from the sign-up response and require it on the games step.

### CR-6. Reopening the popup after joining allows a second sign-up and a second Lead
- Severity: MINOR
- Type: code-bug
- Location: `components/ui/SeasonOnePopup.tsx:62`, `:127`; `components/ui/SeasonOneTrigger.tsx:39`, `:50`
- Evidence: `eventIdRef` lives in the component instance. After success the parent closes the popup; any Enroll/Join CTA remounts it with an empty form and a fresh event ID. A second submit sends a new CAPI Lead and browser Lead with a new ID, so Meta counts two. `S1_JOINED_KEY` only suppresses the auto-open, not CTA opens. T2 says "a second submit after success does not fire again". The landing page is fine (`leadSent` guard, confirmation overlay).
- Fix direction (frontend): when `S1_JOINED_KEY` is set, open the popup in its "done" state, or skip `trackLead` and send no `eventId`-bearing repeat.

### CR-7. Honeypot hits still produce a browser Lead
- Severity: MINOR
- Type: code-bug
- Location: `app/api/season-one/route.ts:154-157`; `SeasonOnePopup.tsx:126-127`; `landing.html:1030`
- Evidence: the honeypot returns `{ ok: true }` by design, and both clients fire the pixel `Lead` on any ok. A JS-executing bot that fills the field yields a browser-only Lead. Requirement S1 says "no Lead". Low volume in practice.
- Fix direction (backend + frontend): have the honeypot branch return `{ ok: true, lead: false }` (or similar) and gate the browser Lead on it.

### CR-8. Dev and preview deploys send live browser Leads (and live server Leads unless the env flag is scoped)
- Severity: MINOR
- Type: infra-gap
- Location: `landing.html:1010` (`LIVE` includes any `*.netlify.app`); `lib/metaCapi.ts` test-code gate; pixel ID hardcoded on the landing page
- Evidence: the CAPI test gate is correct (`META_CAPI_USE_TEST_CODE=true` with no code skips rather than sending live). But the browser pixel has no equivalent: a sign-up on `dev--ekuzo.netlify.app` fires a real `Lead` into the production dataset unless the tester opens the page from the Test Events tool. Server Leads on dev are live unless `META_CAPI_USE_TEST_CODE` is set for the branch-deploy context.
- Fix direction (infra): L3 check that the flag is set for deploy previews and branch deploys and unset for production; testers always use the Test Events browser tool on dev.

### CR-9. 1.2 MB of inlined images on the ad landing page
- Severity: MINOR
- Type: code-bug (performance)
- Location: `public/roadshow/landing.html:834`
- Evidence: line 834 alone is 1,221,329 bytes: 10 base64 images, though one variant uses one or two. Base64 webp barely compresses. The hero is rendered by the script at the end of `<body>`, so on a phone in Meta's in-app browser the hero stays empty until the whole file has downloaded. The page also ships the internal creative notes for all 12 ads (`why`, `from`, `type`, `palette`) in public source.
- Fix direction (frontend): serve the images as files (they already exist on the dev branch under `public/ads/season1/`) or inline only the requested variant; strip the notes.

### CR-10. Auto-opening full-screen popup on mobile
- Severity: MINOR
- Type: accepted-risk candidate (SEO)
- Location: `components/ui/SeasonOneTrigger.tsx:9`, `:61`
- Evidence: on first visit, any non-quiet page (home, blog, programs) is covered by a full-screen dialog after 2.5 s. Google treats full-screen interstitials on mobile as intrusive and can demote those pages in mobile search.
- Fix direction (frontend, Jamie's call): accept for the campaign window, or on mobile use a bottom sheet / skip auto-open on blog pages.

### CR-11. Meta access token sent in the query string
- Severity: NIT
- Type: code-bug (hardening)
- Location: `lib/metaCapi.ts:70` (and pre-existing `app/api/webhooks/stripe/route.ts:833`)
- Evidence: our code never logs the URL. Error paths log `res.status` plus Meta's response body, or `err.message` (undici's "fetch failed", no URL). So no leak today. Query-string secrets can still surface in intermediary or APM logs.
- Fix direction (backend): put `access_token` in the JSON body.

### CR-12. Parent email written to function logs when the Klaviyo key is missing
- Severity: NIT
- Type: accepted-risk candidate
- Location: `app/api/season-one/route.ts:129`
- Evidence: verified locally: `KLAVIYO_PRIVATE_API_KEY not set — Season 01 sign-up lost: parent@example.com`. Only on misconfiguration, parent email only, and it is the only recovery record. The same message also fires on the games step, where it is misleading ("sign-up lost").
- Fix direction (backend): accept (it is a deliberate breadcrumb); optionally skip logging on the games step.

### CR-13. Small robustness and contract gaps in the route
- Severity: NIT
- Type: code-bug
- Location: `app/api/season-one/route.ts:122-123`, `:115`, `:164`, `:204`, `:67`
- Evidence:
  - A JSON `null` body throws outside the try (`Cannot read properties of null (reading 'email')`), giving an empty 500. Verified locally. Harmless but noisy.
  - `unique_id` uses `Date.now()`, so a retry after a lost response writes a duplicate Klaviyo event, and a second sign-up overwrites `season1_ad` / `season1_joined_at` (last touch wins on the profile).
  - `body.ad` is trusted into `content_name` (`season_one_<ad>`); the landing page whitelists it client-side, the server does not. A `/^d\d{1,2}$/` check would keep Meta reporting clean.
  - Rebuilt `fbc` uses the sign-up time, not the click time. Acceptable per Meta's guidance; the `_fbc` cookie covers the normal case.
- Fix direction (backend): guard `body` to an object; optionally whitelist `ad`.

### CR-14. Dead or stale code
- Severity: NIT
- Type: code-bug (simplicity)
- Location: `app/api/season-one/route.ts:11`, `:24-25`, `:143-150`, `:101` (`firstName` param), `:181`
- Evidence: no client posts `step: "age"` or `firstName` (grep over components, lib, app and landing). The header says "Mirrors /api/campaign/lead", which does not exist on this branch. The header and the route comment both say list join triggers a welcome flow, but list `XGTv2F` has no flow triggers in Klaviyo today (verified), so new sign-ups get no email until one is built or a campaign is sent.
- Fix direction (backend): drop the age branch and `firstName`, fix the comment; product owner confirms whether a welcome flow is a launch requirement.

### CR-15. `SEASON_ONE_MODE` is a build-time switch
- Severity: NIT
- Type: infra-gap (docs)
- Location: `lib/seasonOne.ts:15-17`
- Evidence: `NEXT_PUBLIC_*` is inlined at build, including in middleware. Setting `NEXT_PUBLIC_SEASON_ONE_MODE=off` in Netlify does nothing until a redeploy. The comment implies an env toggle alone.
- Fix direction (docs): add "then trigger a redeploy".

## Areas checked and found correct

- **Dedup contract.** One event ID per attempt, reused on retry (`eventIdRef` / `eventId` set once). Browser Lead only after `res.ok`; server Lead only after the Klaviyo event succeeds and before the response; no Lead on 400/500/502. Retry after a lost response reuses the ID, so Meta dedupes. `event_name` `Lead` on both sides. `content_name` matches: `season_one_popup` / `season_one_popup`, and landing `"season_one_"+d.id` vs server `season_one_${clean(body.ad)}` where the landing sends `ad: d.id`. `action_source: "website"`, `event_time` in seconds, `event_source_url` present, `client_user_agent` present. Same pixel ID on landing (hardcoded) and server (env, documented as the same value; L3 should confirm).
- **Email hashing.** Trimmed and lowercased before `sha256`, sent as `em: [hash]`. Matches Meta's normalization.
- **fbp/fbc.** Read from first-party cookies, which same-origin `fetch` sends. Rebuilt `fbc` follows `fb.1.<ms>.<fbclid>`.
- **Test-code gating.** Correct, including the skip when the flag is set without a code.
- **Graph v26.0.** Plausible on Meta's release cadence; I cannot verify the version exists from here. A wrong version would be visible as a logged 4xx in Test Events (L2). Note: the Stripe webhook's Purchase call is still on v19.0, which the code's own comment says is past support; commerce is paused, so this is out of scope here but should be fixed before commerce reopens.
- **Child-data rule, server.** `sendMetaLead` sends only hashed email, IP, UA, fbp, fbc, event_source_url and a fixed or ad-id `content_name`. The games/age branches return before any Meta call. No child field is in the CAPI payload. Browser side: see CR-3.
- **XSS in landing.html.** `ad` is whitelisted against the `T` keys before use; `innerHTML` only receives static template data (`d.art`, `t.k/h/p`, `t.mod`). `cta` and `herocta` go through `textContent`. `utm_*` only go into the JSON body. No query value reaches the DOM as HTML.
- **Open redirect.** Middleware rewrites only the pathname of `req.nextUrl.clone()`; host cannot change.
- **SSRF.** The server never fetches a user-supplied URL; `eventSourceUrl` is only parsed.
- **Secrets in client bundle.** Client components reference only `NEXT_PUBLIC_SEASON_ONE_MODE`; `lib/metaCapi.ts` is imported only by the route; built `.next/static` has no server secret names or server API hosts.
- **Middleware redirects (verified locally).** `/programs/ekuzo-camps/register?utm_source=x&ad=d2` 307s to `/programs/ekuzo-camps?utm_source=x&ad=d2&join=season-one` (query kept). `/programs/ekuzo-camps/register/` 308s to the no-slash form, then 307s. Legacy `/camps/register` 308s to the canonical register, then 307s (two hops, fine). `/register` 307s to `/?join=season-one`. `/programs/ekuzo-camps/success?payment_intent=pi_1` returns 200, untouched. All five register pages have an existing parent program page.
- **Config file.** Both `next.config.mjs` and a stub `next.config.ts` exist (pre-existing). Next loads `.mjs` first (`CONFIG_FILES` order js, mjs, ts), confirmed by the rewrite working locally.
- **Build.** `tsc --noEmit` clean; `next build` succeeds (warns that `middleware` is deprecated in favor of `proxy` in Next 16, pre-existing).

## Overall verdict

**Not ready to launch ads.** CR-1 is a live, evidence-backed failure of the main requirement: the only real test sign-up is in Klaviyo as an event but is not subscribed and not on the list, while the parent saw success. It must be root-caused from the Netlify logs and re-tested (L2) before spend.

CR-2 (rewrite unproven on Netlify, ad URL 404 today) and CR-3 (possible child data via pixel automatic events) are cheap to close and should be closed before launch. CR-4 can be accepted for launch with a documented watch item, but a basic rate limit is low effort and protects the Lead signal the campaign optimizes on.

The rest is minor or NIT. The dedup design, CAPI payload, server-side child-data handling, XSS surface, middleware redirect behavior and secret handling are sound.
