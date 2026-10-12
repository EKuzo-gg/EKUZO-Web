# Sentry cycle 1 results (repair retests and phase-6 adversarial pass)

Run: 2026-10-11 night CDT. Worktree `.claude/worktrees/gaming-study-ship`, HEAD `8cfe704`, production build in `.next/` (22:59, Season 01 mode on), served on port 3311 with the fake env. Nothing was rebuilt. App code was not touched (`git diff -- app components lib public` is empty).
Evidence root: `docs/gaming-study-ship/evidence/sentry-cycle1/`. Scripts: `scripts/` (the earlier harness copied, paths retargeted; `a.mjs`, `a2.mjs`, `b1` to `b6.mjs` are new).

## Safety proof

- Guard self-test before anything else: `guard-selftest-cycle1.txt` (all non-local requests denied: YES; positive control exercised the proxy).
- One persistent default-deny proxy for every browser context: `proxy-log.jsonl`. 2125 proxied requests, 159 contexts started, **0 allowed**. No attempt to google-analytics, clarity, facebook, klaviyo, beehiiv, graph, stripe or resend hosts. Hosts seen (all denied; Chrome background traffic plus 27 from the page's Instagram embed): content-autofill.googleapis.com, www.google.com, accounts.google.com, update.googleapis.com, android.clients.google.com, www.gstatic.com, www.instagram.com.
- No browser POST reached the server. Server-side counter (`scripts/reqlog.cjs`, preloaded with NODE_OPTIONS) logged 23 requests, `server-reqlog.jsonl`. All 23 are my own curl probes (13 plus 1 proof POST to /api/season-one, 3 /api/newsletter, 2 /api/contact, 1 GET and 1 PUT /api/season-one, 1 GET /api/newsletter, 1 OPTIONS self-test of the logger). Every browser POST was answered in `context.route`; unrouted /api POSTs recorded: 0.
- Fake-env proof before any curl probe: a well-formed sign-up POST to /api/season-one returned **502** `{"ok":false,"error":"We couldn’t save that. Please try again."}` and the server log showed `Klaviyo Season 01 event failed: 401 not_authenticated` (Missing or invalid private key). No successful third-party call in the log at any point. (The 401 means the server did reach Klaviyo's API host with the fake key; nothing can be written with it.)
- Server env: `KLAVIYO_PRIVATE_API_KEY=qa-fake META_CAPI_ACCESS_TOKEN= BEEHIIV_API_KEY=qa-fake RESEND_API_KEY=qa-fake GOOGLE_SHEETS_WEBHOOK_URL=`. Nothing was sent to port 3313. No .env.local values printed.
- Processes: server (3311), proxy (39001) and all Chrome instances stopped; `lsof` shows no listener on 3311 or 39001.

## Part A: retests

| # | Test | Result | Evidence and numbers |
|---|---|---|---|
| 1 | D-01 / S-001 "Short answer: one study of 923 adults" | PASS | DOM textContent of the first body paragraph starts `"Short answer: one study of 923 adults, averag"` with exactly one space at 1440 and 375 (`a-results.json`). Served HTML: `<strong>Short answer:</strong> <!-- -->one study`. Rendered in `screenshots/post-1440-opening.png`. |
| 2 | ST-001 hero sharpness | PASS at DPR 2 | `a-hero-resource.json`, `hero-*.png`. Source file 2400x1260. Frame 520 tall, so drawn width = 990.5 CSS px at 375 and 768 (frame 321 and 657 wide), 1024.7 at 1440. NOTE: `img.naturalWidth` is not the file width here (with `sizes` it reports the file width divided by candidate over slot width), so the file width was measured by fetching the currentSrc and reading it with sharp. 375 DPR2: `w=2048`, 2048 px file, **ratio 1.034**. 375 DPR3: `w=3840`, 2400 px file (source cap), ratio 0.808 (largest candidate used; the file itself is the limit, 2972 px would be needed). 768 DPR2: `w=2048`, 2048 px, **1.034**. 1440 DPR1: `w=1920`, 1920 px, **1.874**. 1440 DPR2: `w=3840`, 2400 px, **1.171**. Before the fix phones fetched `w=750` (0.38 at DPR2). |
| 3 | ST-015 sideways scroll | PASS (not a defect) | `a-results.json`, `a-layoutmetrics.json`. On the post, fortnite and online-friends posts at 375, 768, 1024: `documentElement.scrollWidth` equals `innerWidth` (375, 768, 1024), `scrollX` stays 0 after `scrollTo(200,0)` and after a horizontal touch swipe at 375 (x 0 to 0), CDP content size equals viewport width, html and body are `overflow-x: clip`. `body.scrollWidth` is 908 (375), 1104 (768), 1232 (1024), caused by one decorative `<img class="absolute left-1/2 z-20 pointer-events-none select-none">` 1440 px wide, right edge 908/1104/1232, identical on all three posts, so pre-existing template, clipped, invisible. At 768 the footer newsletter form (right edge 882) also overflows and IS visibly cut off, on every page; see A-002. The earlier "wider than viewport" captures were a capture artifact (Playwright fullPage sizes to body scrollWidth); fixed by clipping to the viewport width. |
| 4 | E1 and screenshots | PASS | Root cause of the looped 375 capture: document is 17104 CSS px, times DPR 2 = 34208 device px, beyond Chrome's capture texture limit. Now tiled and stitched with sharp. `fullpage-verify.txt`: post-375-full 750x34208 (matches 17104 x 2), post-1440 1440x14221, post-1024 1024x12488, post-768 768x11956, blog-1440 1440x5303, blog-375 750x15938, all MATCH. Read the bottom crop: footer (Find us online, Join the Newsletter, link columns, copyright, EKUZO wordmark) and the red CTA above it; overview shows a continuous page, no loop. All 38 files in `screenshots/` re-taken at HEAD 8cfe704 (every file newer than 23:00). `blog-375-top.png` now 375x1267 CSS (includes the featured card title and excerpt; sticky bar hidden for that capture); `blog-375-featured.png` added. The shoot script's hero selector was stale (alt text changed in the approved opening); updated in my copy. |
| 5 | ST-013 | PASS | `evidence/head-and-schema.txt` regenerated from served HTML: hero 242166, card 94471, graphic 46091 bytes; JSON-LD dates 2026-10-12; sitemap and llms.txt contain the slug. |
| 6 | ST-010, S-007 | PASS | Online-friends post served HTML: the new paragraph reads `isn’t` with U+2019 ("the number isn’t in the paper"); `sitemap.xml` lastmod for that post `2026-10-12T00:00:00.000Z`. |
| 7a | PB-1 | PASS | 1440 and 375, plus fortnite (JR-10 rows): zero newsletter copy, zero non-S01 dialogs, zero fixed non-S01 email inputs at 25/50/75/100%, max one dialog. `results-pb.json`. |
| 7b | PB-2 | PASS | Bar "SEASON 01 WAITLIST IS OPEN / Join Season 01" (1440), "Join Season 01" (375), no input, tap opens S01 popup. |
| 7c | PB-3 | PASS | No `ekuzo_nl_*` key, zero gtag events at load, no `newsletter_impression`. |
| 7d | PB-5 | PASS | One dialog without a tap per view (`s1-title`), none at 1.8 s. |
| 7e | JR-1 | PASS | Desktop: source `site-popup`, `attributionFrom url`, attribution x/social/gaming-study/karlin, ad karlin, page = path plus query, eventId present, one `generate_lead`, one fbq Lead with eventID equal to the body eventId, one POST. Phone (JR-7) the same. `results-jr.json`. |
| 7f | JR-2 | PASS | `attributionFrom none`, all attribution empty, page = bare path, one Lead pair. Desktop and phone. |
| 7g | JR-3 | PASS | chatgpt.com, claude.ai, www.perplexity.ai at 1440 and 375: one `ai_referral` each (origin, `detected_via referrer`), count stays 1 after reload, client nav and back. Negatives (google, none, x, t.co, facebook, duckduckgo, bing, utm x) fire 0. Informational as before: lookalike hosts `chatgpt.com.example`, `notclaude.ai` fire (D-07). |
| 7h | MN-5 retry | PASS | 1440 and 375: Lead 0/0 at load, popup open, focus, script-set value, touch scroll on field and button, dismiss, Escape and FAILED 502 attempt; exactly 1/1 after retry (200); both bodies carry the same eventId, equal to the fbq eventID. Double-click plus Enters: 1 POST, 1/1. MN-10 PASS. |
| 7i | TG-4 | FAIL (pre-existing, D-02) | One own console error per width, 404 `/images/new%20torn%20paper/torn-paper-red-top-2@2x.png` at 1440, 1024, 768, 375, zero page errors. Local `next start` only; live ekuzo.gg serves it (triage). Also this run: PB-4 N/A (mode on), MN-8a/8b/8c/8d, MN-9, JR-4, JR-5, JR-6, JR-8, JR-9, NR-5 all PASS; JR-5 "backdrop" row FAIL is the non-existent interaction (D-10). axe unchanged: post serious color-contrast 46 (1440) and 44 (375), same pre-existing pairs. |

## Part B: adversarial, automated now (findings, severity)

Defects are logged as A-001 to A-009 in `05-defect-log.md`.

| Area | What I did | Result |
|---|---|---|
| Rapid open/close | 8 open/Esc cycles then double open | OK: max 1 dialog, body overflow restored to "" on close, 0 page errors |
| Escape while submitting | response held 2.5 s, Esc at 0.3 s | Dialog closes, request still completes, one Lead pair recorded, `joined=1` and `dismissed_at` both written; harmless. No errors. |
| Email inputs | empty, whitespace, 300 chars, unicode, `a@b`, `"><script>alert(1)</script>@x.co`, padded, `a@@b.co` | Client blocks empty, whitespace, `a@b`, `a@@b.co` with "Check the email address and try again." (no POST). Client sends 300-char (296), unicode `tëst用户@exämple.com`, the script-tag string, and trims padding. No script ran, no dialog. See A-006 for the server side. |
| Double submit | Enter, click, dblclick | OK: 1 POST, 1 `generate_lead`, 1 fbq Lead |
| Back, forward, reload after sign-up | | OK: Lead stays 1/1, popup closed after back, forward and reload |
| 500 with ok:false, 500 html, network abort | | OK: error text shown, button re-enabled, no Lead. Abort shows raw "Failed to fetch" (A-005). |
| 200 with malformed JSON, 200 with `{ok:false}` | | FINDING A-004: UI shows success and records a Lead |
| 30 s hang then abort | timeline `b3.mjs` | "Saving…" and disabled for the whole 30 s (no client timeout), then "Failed to fetch", button back (A-005). No Lead. Esc and X close it any time. |
| Honeypot filled | | POST sent with `ekz_hp="bot"`, no Lead, UI shows success, joined set (silent drop per contract); server returns 200 `{ok:true}` and logs "dropped" |
| Storage throws (prototype methods, and window getters), 1440 and 375 | | OK: page renders, 0 uncaught errors, popup auto-opens and sign-up works, sticky bar present, popup reappears on every page load (no dismiss memory, per contract). `ai_referral`: 1 event across load plus reload with chatgpt referer (no repeat observed). |
| URL abuse | 3000-char utm_content; utm_source `<img src=x onerror=alert(1)>`; duplicate utm_source; `"'><script>` payload plus `javascript:` term; `?join=season-one`; `?join=anything`; `?join=`; `?join=x` for an already joined visitor | OK: no script execution, no alert, nothing injected in the DOM. Attribution values capped at 200 (utm_content 3000 in, 200 out). `ad` and `page` and `eventSourceUrl` are not capped client-side (3000, 3119, 3140 chars sent; server enforces, see probes). Duplicate utm_source: the first value wins. `?join=<anything>` opens the popup immediately (early, under 1 s) and also for joined visitors (documented). |
| Path variants | trailing slash, uppercase, `/extra` | trailing slash 308 to canonical (query preserved); uppercase 404; `/extra` 404; `/opengraph-image` and `/twitter-image` 404 (expected). On the 404 pages no newsletter UI renders; the S01 popup and bar behave as on any page. No isBlogPostPath misfire. |
| Dormancy with `ekuzo_nl_variant=thumbs` | 1440 and 375, scroll 20 to 100% | OK: no newsletter copy, dialog or bar email field, no `newsletter_impression` |
| Zoom, narrow, reduced motion | 320 wide, 720 wide (200% zoom), 1440 with root font 200%, 320 plus reduced motion | 320, 720 and reduced-motion: no sideways overflow, no clipped text in hero, graphic, Keep Reading cards or sticky bar (scan plus screenshots `zoom-*.png`); sticky bar covers 12.5 to 17.8 percent of the viewport height. Text-only 200% at 1440: the site Nav collides and the Join button is cut off (A-003); the post's own areas are fine. |
| Keyboard | Tab through the popup, Escape, link focus | Close button first focus on phone, email first on desktop (Close is before it in order); Tab then Submit; **no focus trap** (A-001), Escape closes, focus after close is not restored to a sensible element. In-body "a recent post on X": href x.com/BrandonLuuMD/status/2099226796893798645, `target=_blank`, `rel="noopener noreferrer"`, reachable by Tab, visible focus ring (outline auto 1px). |

### Direct API probes (curl, :3311, fake env), `api-probes.txt`

| Probe | Status | Body |
|---|---|---|
| season-one missing email / invalid / no @ / control char / 300-char email / form-encoded / malformed JSON | 400 | `{"ok":false,"error":"That email doesn’t look right."}` |
| season-one script-tag email `"><script>alert(1)</script>@x.co` | 502 (passed validation, reached Klaviyo, fake key 401) | generic failure text |
| season-one 1 MB body (ad field 1,000,000 chars) | 502 (accepted, reached Klaviyo) | generic failure text |
| season-one text/plain valid JSON | 502 (parsed, reached Klaviyo) | generic |
| season-one unknown source | 502 | generic |
| season-one honeypot | 200 | `{"ok":true}`, server logs "dropped: honeypot field filled" |
| season-one step games, no prior sign-up | 200 | `{"ok":false}` (Klaviyo 401 logged) |
| season-one GET, PUT | 405 | empty |
| newsletter no email | 400 | `{"error":"Email is required"}` |
| newsletter utm outside the allowlist, and allowed blog values | 500 | `{"error":"Failed to subscribe. Please try again."}` (Beehiiv 401 on the fake key; allowlist effect not observable from outside) |
| newsletter GET | 405 | empty |
| contact bogus `heardAbout` `<script>x</script>` | 200 | `{"success":true}` (label map ignores unknown values; Beehiiv fake key rejected, Resend response is not checked, see A-007) |
| contact missing fields | 400 | `{"error":"Name and contact method are required"}` |

### Direct access, `direct-access.txt`

- `/images/gaming-study-13-7-card.jpg` 200 image/jpeg 94471; hero 200 image/jpeg 242166; graphic 200 image/png 46091. Cache-Control on all three is `public, max-age=0` (Next default under `next start`; not a long cache; Netlify's header behavior needs the deploy check, A-009).
- `/_next/image?url=/images/gaming-study-13-7-hero.jpg&w=1200&q=75` 200 image/jpeg 67632 (also the encoded form), `Cache-Control: public, max-age=14400, must-revalidate`, `Content-Disposition: attachment` (Next default, images still render in `<img>`).
- `/research/gaming-cognition-reanalysis.py` 200 `application/octet-stream` (served as a download, not executed); `-output.txt` 200 `text/plain; charset=UTF-8`.
- `/sitemap.xml` and `/llms.txt` each contain the slug once. Post page HTML: `Cache-Control: s-maxage=31536000`, `x-nextjs-cache: HIT`.

## Deferred to Jamie's human pass (needs a real device or the deploy)

1. Real phones, in-app browsers (Instagram, X, Facebook, TikTok, Gmail): popup timing, keyboard, safe areas, sticky bar over the browser chrome, scroll lock.
2. The real Instagram reel embed (blank here because the proxy blocks it) and the X link opening in a new tab from a phone.
3. Link-preview tools (iMessage, Slack, X card validator, Facebook debugger, LinkedIn inspector) reading og:image `gaming-study-13-7-card.jpg` and title.
4. Static asset Cache-Control on Netlify (card, hero, graphic, research files) and `.py` content type on the CDN; the 404 on literal-`@` torn-paper paths on Netlify.
5. A live sign-up on the deploy with a team address: Klaviyo event, list join, Meta Lead dedupe (browser eventID vs CAPI), GA4 `generate_lead`, and the ai_referral event in GA4 DebugView.
6. Real screen reader pass on the popup (VoiceOver, TalkBack) given A-001.
7. Real iOS Safari text zoom and Dynamic Type on the post and Nav.
8. Hero sharpness judged on a real DPR 3 phone (source file caps at 2400 px, ratio 0.81 there).
9. JAMA bot-check click-through on ship day (S-006 triage).
