# Scout: codebase map and harness feasibility (2026-11-09)

Verified against the working tree at `45dfe97` (branch `build/s1-cls-field`) and git. Nothing changed except this file. A blobless full-history clone sits at `/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/mt` (used for the merge dry run, see section 5). Probe scripts: `.../scratchpad/scout-probe.mjs` (the requested run) and `scout-probe2.mjs` (same, all resource entries and font states, run once on d19).

## Corrections to the brief

1. **`a919b25` is not a pre-fix commit for d18 and d19.** The page A box reservation (`#hero.pa`, W4) landed in `0fc8ad1` (committed 11-05 10:51), which is an ancestor of `a919b25`. The `a919b25` landing already has lines 654 and 909. The interactive-hero reservation (`pre-ih`) and the move of images out of the inline script arrived later in `d46c5c0` (11-05 11:35). Landing file history: `3433a5b` (11-03, 1,345,057 bytes, no `pa`) -> `0fc8ad1` (adds `pa`) -> `d46c5c0` (127 KB, adds `pre-ih`, images as files). `origin/main` landing equals `d46c5c0` (empty diff).
   - Correct pre-fix commit for the d18/d19 regression gate: **`3433a5b`** (landing identical to `0fc8ad1^` = `7a6acaa` and to `8ce0e17`, the 09:56 hotfix that was on main that morning). `a919b25` is the right "before" only for the interactive-hero variants (d1 to d10, d13 to d17).
   - Consequence for Phase 0: the sentence "the Nov 5 release removed the field CLS" is two releases. `0fc8ad1` fixed page A (d16, d18, d19, d20, d21, d11, d12 and every ad not in `AD_HERO`). `d46c5c0` fixed the interactive heroes. Phase 0 says the release went live "11:08 CT" with `a919b25 / 45dfe97`; commit times (`d46c5c0` at 11:35, `45dfe97` at 12:43) cannot both be live at 11:08, so 11:08 is most likely the `a919b25` push and `d46c5c0` went live later. Relay should read the Netlify deploy list for the real timestamps.
2. **The old harness did reproduce the page A field failure.** See section 2: the join-sync round measured d18 at 0.854 and d19 at 0.787 on the pre-`0fc8ad1` build (`docs/s1-join-sync-2026-11/evidence/cls/before-probe.json`). The round 2 table's "before" of 0 and 0.0013 is `a919b25`, which already had W4.
3. **Commit counts.** `origin/main` has 109 commits not on `origin/dev` and `origin/dev` has 37 not on `main` (merge base `0ef69fc`, confirmed in the full clone). 68 of the main-only subjects mention Season 01, season1 or s1-. The brief's "62" is within that range, not exact. Note this working clone is shallow (`.git/shallow` lists `6842028` and `bd96389`), so `git merge-base origin/main origin/dev` prints nothing here and `git merge-tree` refuses with "unrelated histories". Use the full clone or `git fetch --unshallow`.
4. **Webkit is not installed** in the container (section 3), and Safari/WebKit has no `layout-shift` entry type, so the iPhone profile cannot use PerformanceObserver for CLS.
5. **`origin/build/s1-cls-field` already exists** on GitHub at `c01db9e` ("brief, Phase 0 field truth, requirements, decision log"). The local branch tip is `45dfe97`. Check before the first push.
6. Everything else in the map is confirmed (table below).

## 1. Brief map, claim by claim

| Claim | Verdict | Detail |
|---|---|---|
| `app/season1/landing.html` 127,471 B on main, 1,340,714 B on dev | confirmed | `wc -c` 127471; `git show origin/dev:app/season1/landing.html` 1340714 |
| Served by `app/season1/route.ts`, `force-static`, fills `{{URL_ALLOW}}`/`{{TAGS}}` | confirmed | `route.ts` line 15 `export const dynamic = "force-static"`; `fillTags(html, "", renderStaticTags("landing"))`; `fillTags` in `lib/season1/tags.ts:246` |
| Small script at line 899 | confirmed | `<script>` 899, ends 913. Defines `AD_HERO` (902, ids d1 to d6, d8 to d10), `HERO_KEYS` (903) |
| Big script at line 1001 | confirmed | `<script>` 1001, `</script>` 1504. `IMG` map 1002, jersey overrides 1004, `D` array 1006+, `T` map, hero render 1248 |
| Reserved-box CSS lines 654 to 656, inside `@media (max-width:959px)` | confirmed | 654 `@media (max-width:959px){.lp > #hero.pa:empty{aspect-ratio:4/5}`; 655 comment; 656 `.lp.pre-ih:not(.has-ihero) > #hero{min-height:80svh}}` |
| `pa` / `pre-ih` set in small script | confirmed | 909 `if(pageA) …classList.add("pa")` on `#hero`; 910 `else if(HERO_KEYS…\|\|own(AD_HERO,ad)) …classList.add("pre-ih")` on `#lp`. d18 to d21 are not in `AD_HERO`, so they get `pa` |
| `has-ihero` added | confirmed | 1302 `lp.classList.add("has-ihero"); ih.hidden=false;` inside `if(HD){` (1299 block). CSS 833 hides `#hero` once set; 835 keeps it on desktop |
| `fitHero` | confirmed | defined 1340 to 1349 (`const fitHero=…`), called 1350 (`fitHero(); document.fonts.ready.then(fitHero); addEventListener("load",fitHero)`), resize handler 1351. Only exists inside `if(HD)`, so never runs on page A (d18, d19) |
| `IMG` map | confirmed | line 1002: 10 keys, all `/images/season1/landing/*.webp`. Line 1004 adds `team-walk-hd` -> `/images/season1/jersey/team-walk-1600.webp`, `southie-back`, `southie-front` |
| d18 = tpl d5, photo laughing, "Inter Tight" | confirmed | `D` entry 1160 (`tpl:"d5"`); art 1165 `<img class="ph" src="${IMG["laughing"]}" alt="">` inside `.frame`; `T.d18` font `"Inter Tight"` |
| d19 to d21 = tpl d11 with Southie photos as files | confirmed | `D` d19 at 1168 (`tpl:"d11"`, `cls:"s1j s1j-back"`), `T[k]=T.d11` at 1229; `T.d11` font `"Rubik"`, acc `#49B41A`. d19 imgs: `ph` = `team-walk-hd` (145,602 B file), `jb` = `southie-back` (92,738 B). Files exist in `public/images/season1/jersey/` (also an unused `team-walk-900.webp`, 67,290 B) |
| Tags `lib/season1/tags.ts` GA4 `G-8LM45PX53W`, Pixel `1284038230557204`, Clarity `wml8wll5ua` | confirmed | lines 28 to 30; live only on ekuzo.gg hostnames, `?s1qa=1` QA mode |
| Waitlist API `app/api/season-one/route.ts` | confirmed | exists; module-scope `KLAVIYO_API_KEY`, `LIST_ID` at 131 to 133 |
| Join/checkout paths | confirmed | `app/season1/join/{route.ts,b,jersey,signup,welcome}`; `app/api/checkout/route.ts`; `app/api/webhooks/stripe/route.ts`. `fulfil-import.ts` is under `welcome/` (not re-checked line by line) |
| `npm test` -> `scripts/run-tests.mjs`; `npm run test:s1` | confirmed | `package.json` lines 10 and 11 |
| Prior docs paths | confirmed | `docs/s1-round2-2026-11/{scout,evidence,07-review-guide.md}`, `docs/s1-join-sync-2026-11/`, `docs/season1-commit/`, `docs/season-one-tracking.md`, `WORKLOG.md` all exist |
| Toolchain | confirmed | Node v22.23.4, npm 10.9.9, Playwright 1.63.0, Chromium "Chrome for Testing" 153.0.8010.12 at `/opt/pw-browsers/chromium-1243`, Next 16.4.3, no `.env.local` (only `.env.local.example`). Two Next configs exist (`next.config.mjs` real, `next.config.ts` empty stub); Next's `CONFIG_FILES` order puts `.mjs` before `.ts`, so `.mjs` wins |
| `guard-pattern-kill.sh` | confirmed | exists under the KB `system/scripts/` |

### Hero image delivery on d18 and d19 (as served on main)

- **Where the `<img>` comes from:** injected by the big script at the end of `<body>` through `document.getElementById("hero").innerHTML = …` (line 1248). The preload scanner never sees these images. They are requested only after the big script runs.
- **d18:** one `<img class="ph" src="/images/season1/landing/laughing.webp" alt="">` (40,694 B) inside `.frame`. CSS `.d5 .frame .ph{position:absolute}` and `.art .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;max-width:none}` (line 56).
- **d19:** two imgs, `.ph` (`team-walk-1600.webp`, 145,602 B, 1600 px wide for a 360 to 412 px slot) and `.jb` (`southie-back.webp`, 92,738 B). CSS `.d11 .ph{height:48%;…}` (435), `.k-hero.d11 …` not used for feed.
- **Reservation:** no `width`/`height` attributes, no `aspect-ratio` on the img. The space is reserved by the container: `.k-feed{aspect-ratio:4/5}` (line 55) on `.art` (`container-type:inline-size`), and before injection by `#hero.pa:empty{aspect-ratio:4/5}` on phones. The imgs are absolutely positioned, so image decode cannot shift layout.
- **Attributes:** none of `loading`, `fetchpriority`, `decoding`, `srcset`, `sizes` on any hero img. No `<link rel="preload">` for any image anywhere in the file.
- **Fonts:** one render-blocking Google Fonts stylesheet, line 7, placed inside `<body>` (after `</head><body>`, lines 5 to 7: `preconnect` x2 then `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anybody…&display=swap">` with 14 families). No `@font-face` in the file, no font preload, no `next/font`. `display=swap`. CSS response is 32 KB. Fonts used: d18 requests Inter Tight 500/700/800 (the page-wide `--ui`) and JetBrains Mono 700 (`small`); d19 additionally Rubik 500 and 900 (`T.d11` font and `.d11 h3` rules). Observed in the probe (`document.fonts`, d19): Inter Tight 500/700/800, JetBrains Mono 700, Rubik 500/900 all loaded. Rubik is only discovered after hero injection, so its swap lands late (inside the hero box only).
- **Parser order effect:** the big script (line 1001) is a classic inline script after a pending stylesheet, so it waits for the Google Fonts CSS. Probe numbers in section 3 show the hero image request starting only after that CSS finished.

### Sticky bar, Text Karlin card, FAQ on load

- **Header (`.lp header`, 640 to 650):** `position:fixed`; `onScroll` (line ~1409) toggles `.solid` at `scrollY > 24`; `.solid` changes padding (`calc(var(--w)*.07)` to `12px 16px`) and logo width (`calc(var(--w)*.22)` to `84px`) with `.25s` transitions on `padding`, `width`, `background`. These are layout properties, not transform or opacity, so the transition can emit `layout-shift` entries each time scroll crosses 24 px. Fixed position keeps the page content still.
- **Sticky bar (`#sticky`, line 970, CSS 696 to 698):** `position:fixed`, `transform:translateY(110%)` until `.on`. An IntersectionObserver (1417) turns it on when `#join-top` (or `#ihero` on hero pages) is off screen and `#join-end` is not visible. Transform transition, so no CLS. Hidden by `showDone()`.
- **Text Karlin card:** inside `#conf` (`role="dialog"`, `hidden`, line 972 to 983), shown only by `showDone()` after a successful sign-up (`c.hidden=false; document.body.style.overflow="hidden"`; header and sticky get `hidden`). The avatar `<img class="tk-av" src="/images/authors/karlin-oei-avatar.jpg" width="52" height="52">` has dimensions but no `loading="lazy"`: the probe shows it **fetched at load** (14 KB, request at 382 ms, done at 1046 ms on d19) even though it is in a hidden dialog, ahead of the hero images.
- **FAQ (line 943+):** native `<details>` elements, all closed; JS only adds a `toggle` listener for the `faq_open` GA event (1393). Nothing animates or resizes on load.

## 2. Why the round 2 harness read d18 = 0 and d19 = 0.0013 while Clarity read 0.70 to 0.75

**Short answer:** the round 2 "before" build already had the page A fix. It was `a919b25`, which contains `0fc8ad1` (the W4 box reservation for page A). The harness itself reproduced the field failure one round earlier, on the build without `pa`.

Evidence:

| Source | Build | d18 | d19 | Notes |
|---|---|---|---|---|
| `docs/s1-join-sync-2026-11/evidence/cls/before-probe.json` (`measure-cls.mjs`, 375x667 @2, iPhone Instagram UA, CPU 4x, 1.6 Mbps/150 ms, 3 runs, `localhost:3200`) | before `0fc8ad1` (no `pa`) | **0.854** | **0.7867** (d21 0.7867, d16 0.8349) | one shift each: 7.33 s to 7.39 s, sources `section#join-top.join` and `section.how` |
| `docs/s1-round2-2026-11/evidence/sentry-b/cls-table.md` (`cls.mjs`, same method, 7 runs, `:3171` = `a919b25`) | `a919b25` (has `pa`) | 0 | 0.0013 | "before" column of round 2 |
| Same table, after `d46c5c0` | main | 0.0047 | 0.0013 | |
| Clarity, 7 days to Nov 5 07:32 | pre-`0fc8ad1` | poor sessions: d18 5, d19 7 | | all 18 poor sessions predate the release |

Mechanism (pre-`0fc8ad1`, 1.35 MB page): about 1.2 MB of the HTML is one inline script holding base64 images, and the code that builds the hero is at its end. `#hero` stays empty (0 px) until the script has been downloaded, parsed and run (about 7.3 s under the throttle). Then the 4:5 art box appears above the join form, and `section#join-top` and `section.how` drop by 4/5 of the viewport width (450 px at 360 wide). One shift, measured 0.79 to 0.85.

Why the field numbers are a little lower (0.70 to 0.75): the shift score is impact fraction times distance fraction. Impact fraction is about 1 (the form and "how" section fill the screen). The distance fraction is `0.8 x width / visible height`. At 375x667 that is 469/667 = 0.70 plus the second-order part, matching 0.79 to 0.85 in the lab. In an in-app WebView the visible height is shorter than the phone's screen (top bar, bottom bar), so 360 wide with a 600 to 640 px visible area gives 450/640 = 0.70, and 412 wide with about 700 px gives 0.73. This is arithmetic, not a measurement; the new harness should include a short-viewport profile (for example 360x640 and 412x700) to confirm.

What the old harness did miss (for the remaining risk, not for d18/d19 at Nov 3 to 5):

1. **Viewport shape:** 375x667 only. No Android in-app visible-area profiles.
2. **Load only:** `waitUntil: "load"` plus 4 s, no scroll, no tap, no typing. Anything that moves after first scroll (the `.solid` header transition, `fitHero` re-runs on `resize` when the toolbar collapses, late fonts) was out of the observation window.
3. **UA:** iPhone Instagram UA on Chromium, not an Android WebView or `FB_IAB/FB4A` string, so UA-conditional behavior in the page or in third-party tags was not exercised. The page has no UA sniffing, so the effect is small.
4. **`hadRecentInput` filtering:** both scripts drop every entry with `hadRecentInput`, silently. The probe below saw a spurious `hadRecentInput:true` entry with no input (see section 3), so a filter can hide real shifts. The new harness should record both and report CLS with and without the filter.
5. **Window:** CLS reported as the max session window. Clarity's exact definition is not confirmed here (unverified: the doc was not fetched). If Clarity sums every shift in the page view, scroll-time shifts add on top of the load shift, so record total CLS as well as the window value.
6. **Cache and tags:** blocked analytics from the first request is right. Cold cache per run is right. The Google Fonts CSS was fetched live over the proxy; that is correct but the fonts timing varies by run (CSS finished at 2.2 s in probe 1 and 0.7 s in probe 2).
7. **Round 2 scope:** its table compared `a919b25` to `d46c5c0`, so a flat 0 for d18 only proved W4 worked.

Candidate shift sources for what could still show up in the field after both fixes, most likely first, each with the evidence that would confirm it:

1. **Interactive-hero text fit after scroll or toolbar collapse (hero pages only, not d18/d19).** `fitHero` (1340 to 1351) re-runs on `resize`, and Android toolbars collapsing on scroll change `innerHeight`, which fires `resize`. It removes `--ds`, then shrinks until the hero fits 80% of the new height, so the hero height can change while the user reads. Confirm: a harness journey that scrolls with a viewport-height change (emulate by `page.setViewportSize` height +60 px mid-scroll) and logs `layout-shift` sources `h1#ih-q`, `ih-opts`, `section.how`.
2. **Header `.solid` transition (every variant).** Fixed header with `.25s` padding and width transitions at `scrollY > 24`. Each up/down crossing can emit several small entries. Confirm: scroll 0 to 40 to 0 repeatedly and look for `header` / `svg.mark` sources; sum them.
3. **Font swap of `Inter Tight` over `Helvetica Neue`/Arial (every variant).** Body text below the hero is in `--ui`; the Google CSS is in `<body>` and `display=swap`, so late woff2 arrival reflows `.join`, `.bridge`, `.how`, `.faq`. Confirm: delay `fonts.gstatic.com` responses by 3 s in the harness and compare shift sources (`#text`, `p`, `h3`). The 0.0001 `#text` entries at 1.7 s in both probes are this class at its mildest.
4. **Rubik arrival on d19, d20, d21 (inside the hero box).** Discovered only after injection, so it swaps late; text reflows inside an `overflow:hidden` fixed-ratio box, so it counts only as small text-node entries. Confirm: same font delay, source `h3` / `.copy` inside `.art`.
5. **About 5 px step at hero injection on page A.** The d19 probe logged `form` and `p` moving up 5 to 6 px at 1.07 s (value 0.002, flagged `hadRecentInput:true` although nothing was tapped). The cls-table floor for d11/d19/d21 is 0.0013, the same class. Likely a small mismatch between the reserved `#hero.pa:empty` box and the injected `.art` (or a text re-wrap above the form). Confirm: log `#hero` and `.art` rects before and after injection at 360, 390 and 412 wide.
6. **Webview-injected DOM and text zoom.** The Facebook and Instagram WebViews inject their own scripts (94% of Clarity JS errors are the FB bridge "java object is gone") and apply the phone's text-size setting (line 873 comment). Anything they add or rescale after load is not reproducible with a UA string alone. Confirm only on a real device or with Clarity recordings of the sessions in the `LCP` and `CLS` filters; in the harness, emulate text zoom with `Emulation.setFocusEmulationEnabled` is not enough, use a CSS `zoom`/larger default font via `--font-render-hinting` is unreliable, so test `font-size` scaling with a user stylesheet (`textZoom` equivalent) and the `.tight` hero class.
7. **Sign-up confirmation (`showDone`).** Runs more than 500 ms after the tap (it awaits the network), so its effects count: header and sticky get `hidden`, `body{overflow:hidden}`, `#conf` appears. The overlay is fixed, so expected near 0; confirm with the "type and submit against the dev deploy" journey (needs a disposable `team+cls-1109-<n>@ekuzo.gg`, so only if a lane needs one).

## 3. Harness feasibility in this container

- **Chromium:** works. `require('playwright')` resolves from `/home/claude` (the probe uses `createRequire("/home/claude/")`). Browsers live in `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH`), not `~/.cache/ms-playwright`.
- **WebKit:** `playwright.webkit.executablePath()` returns `/opt/pw-browsers/webkit-2359/pw_run.sh` but the file **does not exist**; only chromium, chromium_headless_shell and ffmpeg are installed. The Playwright WebKit zip is reachable through the proxy (`HEAD https://playwright.download.prss.microsoft.com/dbazure/download/playwright/builds/webkit/2359/webkit-ubuntu-24.04.zip` returned 200; the `cdn.playwright.dev` mirror returned a 307). I did not install it. Install would be `PLAYWRIGHT_BROWSERS_PATH=<dir> npx playwright install webkit` (plus `install-deps` if system libraries are missing; not tested). **Limit that matters more:** WebKit has no `layout-shift` or `largest-contentful-paint` entry types, so the iPhone profile must estimate shifts by sampling element rects (`requestAnimationFrame` loop on the main landmarks) and report it as an approximation. Say so in the harness output.
- **Proxy:** Chromium must be launched with `proxy: { server: process.env.HTTPS_PROXY }`; the NSS store already trusts the proxy CA, so no certificate flags are needed.
- **CDP emulation:** works through the proxy. `Network.emulateNetworkConditions` (latency 150, 1.6 Mbps down, 0.75 Mbps up) and `Emulation.setCPUThrottlingRate` (4) were accepted and visibly changed timing.
- **Probe command:** `cd /home/claude && node /tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/scout-probe.mjs [url]` (default `https://ekuzo.gg/season1?ad=d18`). UA `…Android 14; SM-S921U … wv) … Chrome/131 … [FB_IAB/FB4A;FBAV/490.0.0.50.109;]`, 360x780 @3, `isMobile`, `hasTouch`, CPU 4x, Slow 4G.

What the requested run printed (d18, one cold run, 6 s after load):

```
cls: 0, layout-shift entries: []
LCP: 2504 ms h2#jt (text, 22,348 px2), then 3400 ms img.ph
     https://ekuzo.gg/images/season1/landing/laughing.webp (69,110 px2)  <- final LCP
navigation: responseEnd 1575, DOMContentLoaded 2961, load 3379
resources: fonts.googleapis.com css2 (32 KB) start 1620, end 2168
           laughing.webp (40 KB) start 2887, end 3367
blocked: 3 requests answered 204 (googletagmanager gtag/js, connect.facebook.net/fbevents.js, clarity.ms/tag)
hosts that reached the network: ekuzo.gg, fonts.googleapis.com, fonts.gstatic.com only
```

Second run (d19, same script plus all resource entries): `responseEnd` 448, CLS 0.0001 counted (one 0.002 entry flagged `hadRecentInput:true`, one 0.0001 `#text` at 1.68 s), LCP `img.jb` (southie-back.webp) at 2904 ms after `h2#jt` at 932 ms; `team-walk-1600.webp` (142 KB) requested at 1062 ms, finished 2953 ms; the hidden-dialog avatar jpg requested at 382 ms.

Read-outs for the LCP lane: (a) the hero image is requested about 0.7 s after the Google Fonts CSS ends, i.e. only once the big script runs behind that stylesheet; (b) the LCP element is the hero image (d18 `img.ph`, d19 `img.jb`), preceded by `h2#jt` as an early LCP candidate, so "LCP = h2" in a fast run and "LCP = image" in a slow one; (c) d19 ships a 1600 px, 145 KB photo into a 360 to 412 px slot (the 900 px file exists unused); (d) the hidden avatar jpg takes bandwidth first.

## 4. Build and test commands

- `npm ci` finished: `npm-ci.log` tail "added 379 packages in 12s", "npm ci exit 0". `node_modules/.bin/next` exists.
- Scripts: `npm run build` = `next build`, `npm start` = `next start`, `npm test` = `node scripts/run-tests.mjs`, `npm run test:s1` = `node scripts/run-tests.mjs lib/season1/__tests__`.
- **Needed for `next build` (build time):**
  - `STRIPE_SECRET_KEY`, any non-empty value such as `sk_test_dummy`. Module-scope `new Stripe(process.env.STRIPE_SECRET_KEY!)` runs when Next imports the route modules to collect page data, in `app/api/checkout/route.ts:4`, `app/api/webhooks/stripe/route.ts:8`, `app/api/{teams,ekuzo100,camps}/success/route.ts`, `app/api/teams/register/route.ts:36`. I checked the constructor in this install: `new Stripe(undefined)` throws "Neither apiKey nor config.authenticator provided", `new Stripe('sk_test_dummy')` is fine. I did not run `next build`, so treat "this one variable is enough" as likely, not proven.
  - Network to `fonts.googleapis.com` at build: `app/layout.tsx` imports `next/font/google` (Inter) and `next/font/local`. The proxy allowed that host in the probe.
  - `NEXT_PUBLIC_*` values are inlined at build but have defaults or are optional for `/season1`: `NEXT_PUBLIC_SEASON_ONE_MODE` (default on, `lib/seasonOne.ts:12`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`. The landing page does not read any of them (`tags.ts` hard-codes GA4, Pixel, Clarity IDs). `next.config.mjs` reads `CONTEXT` (Netlify deploy context) into `S1_DEPLOY_CONTEXT`; empty is fine locally.
- **Runtime only (not needed to build or to serve `/season1`):** `DATABASE_URL` (lazy `getSql()` in `lib/season1/db.ts`, throws only when called), `S1_STRIPE_WEBHOOK_SECRET`, `S1_REF_SECRET`, `S1_COMMIT_MODE`, `S1_DRAIN_SECRET`, `S1_DISCORD_WEBHOOK_URL(_TEST)`, `KLAVIYO_PRIVATE_API_KEY` (module-scope read, no throw), `KLAVIYO_SEASON1_LIST_ID`, `BEEHIIV_*` (module-scope `!` reads, no throw), `META_CAPI_*`, `META_PIXEL_ID`, `GOOGLE_SHEETS_WEBHOOK_URL`, `RESEND_API_KEY`, `STRIPE_PRICE_*`, `STRIPE_WEBHOOK_SECRET`, `S1_BASE_URL`, `S1_DB_TESTS`.
- **Can Chronos build `a919b25`/`3433a5b` and `main` here without secrets?** Yes for the landing page, with `STRIPE_SECRET_KEY=sk_test_dummy` set for the build and `next start`. `/season1` is `force-static` and reads only `landing.html` and `tags.ts`. API routes will 500 or fail on first call, which is fine for the harness (stub or block `/api/season-one`, as `s2.mjs` did). Build the pre-fix commit in a separate worktree under the scratchpad, not in the main tree, and run each on its own port by PID per the brief. Landing-only difference: `3433a5b` carries inline base64 images, so its build output is large; no other env difference.
- Caveat for older commits: `package-lock.json` at `3433a5b` may differ from the current one; run `npm ci` inside that worktree or symlink `node_modules` only if the lockfiles match (`git diff --stat 3433a5b origin/main -- package.json package-lock.json`).

## 5. Deploy path

From `docs/dev-runbook.md` § "Releasing when dev carries work main must not get" (line 175 on) and the WORKLOG:

- Netlify builds `main` -> ekuzo.gg and `dev` -> `dev--ekuzo.netlify.app`. `main` and `dev` diverged at `0ef69fc`; neither is an ancestor of the other, so `git merge dev` and `git push origin dev:main` are forbidden (they ship dev-only files). Release = a branch cut from `origin/main`, code-identical check, fast-forward push. The 11-05 blog release followed this: cherry-picks onto a release branch, `dev` received the same blog commits cherry-picked, "never merged" (WORKLOG 11-05 10:00).
- Getting a main-based branch onto `dev` (the test-deploy path for this run). Precedents:
  - Season 01 go-live, 10-29/10-30 (`docs/season1-commit/final/03-golive-log.md`, 09:44 row): `dev` could not fast-forward to `season1-commit`, so Relay **built `preview/season1-dev` = the feature branch + `git merge origin/dev`, resolved to be code-identical to the feature branch, then pushed `dev` as a fast-forward** (`1ab7255..3bbf217`). Same pattern for the hotfix (`preview/season1-dev-hotfix`).
  - Runbook text (line 194): bring main's commits into dev through an integration branch, check it, then fast-forward dev. Conflicts: stop and resolve by hand, WORKLOG keeps both sides (line 196). Scripts run with `set -e`. Push goes through Jamie's terminal, or Relay if it has write access.
  - Gate order (line 183 to 192): dev deploy first, human phone check, then `main`.
- **Dry run for this run (full clone, `git merge-tree --write-tree origin/dev origin/main`, nothing written to the repo):**
  - Conflicts (3): `WORKLOG.md` (content, keep both sides), `public/roadshow/ad-lab.html` and `public/roadshow/index.html` (deleted on main, modified on dev: keep the dev version). `app/sitemap.ts` auto-merges.
  - Merge result vs `origin/main`: 20 files differ, all dev-only additions (`public/roadshow/*`, six `public/ads/season1/d19..d21*.jpg`) plus `WORKLOG.md`. `app`, `lib`, `components` are identical to main (empty diff), which is the "code identical" test.
  - Merge result vs `origin/dev`: 487 files changed, 58 deletions. A plain merge deletes files that main removed and dev still serves: `public/ads/season1/*` (24), `public/review.html`, `public/roadshow/email-photos/*` (18), `public/roadshow/funnel/*` (8), 7 more under `public/roadshow/`. Restore them on the integration branch (`git checkout origin/dev -- public/ads/season1 public/review.html public/roadshow`) so dev keeps them. They exist only on dev (prod 404s them by design, see go-live log 09:46).
  - Likely changes landing on dev from main: Season 01 join/early-access routes, `lib/season1/*` and tests, `public/images/season1/{landing,jersey,gamers,email}`, docs for the three Season 01 loops. Blog files show as "touched on both sides" but are identical cherry-picks and merge cleanly.
- **Steps to repeat** (worktree under the scratchpad, never the main tree):
  1. `git fetch --unshallow origin` in the clone you use for merging (or use the full clone), then `git worktree add -b preview/s1-cls-field-dev <dir> origin/build/s1-cls-field` (the tested branch, cut from main).
  2. `git merge origin/dev`; resolve WORKLOG.md (both sides), `ad-lab.html` and `index.html` (take dev's), restore the 58 deleted dev-only files from `origin/dev`.
  3. `git diff --quiet HEAD <build-tip> -- app lib components && echo identical`, plus the same for `public/images`.
  4. Re-run `git log --oneline -1 origin/dev origin/main` right before pushing. Push `preview/s1-cls-field-dev:dev` as a fast-forward of `dev` (check `git merge-base --is-ancestor origin/dev HEAD`).
  5. Wait for the Netlify dev deploy, run the harness against `dev--ekuzo.netlify.app` (note `LIVE` in the page is `ekuzo.gg` or `localhost` only, so the dev host sends no Lead and loads no tags unless `?s1qa=1`), then Jamie's phone check, then a release branch from `origin/main` and `git push origin <release>:main`.

## Memory notes for the main session

None learned from the user in this task beyond what the brief states.
