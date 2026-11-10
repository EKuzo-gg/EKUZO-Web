# Atlas self-test: Part A (A1 to A6), 2026-11-10

Lane `lane/ft-atlas` from `origin/build/s1-fast-track` at ea04f40. Code commits b9caac7 (A1), cc1ca8d
(A2), c1ddc24 (A3), 1d0a4a0 (A4), 9ad9b71 (A6); this file is the evidence commit on top. Build tested:
9ad9b71 (`<meta name="s1-build" content="9ad9b71">` on the served landing). Comparison "main" is
origin/main 3bf6c58, exported with `git archive` into my scratchpad and built there (`/home/claude/wt-main`
is detached at 45dfe97, an older commit, so I did not use or touch it). `git diff 3bf6c58 ea04f40 -- app
lib middleware.ts public next.config.mjs` is empty, so 3bf6c58 is the base code of this lane.

## Diff summary per file

| File | Change | Item |
|---|---|---|
| `lib/season1/attribution.ts` | `LC_KEYS` adds `"ad"` (nine keys); `DROP_ORDER` ends with `"ad"`; new exported `cleanAd` (lowercase, `replace(/^d0/,"d")` exactly as `landing.html` does, valid only as `/^d[1-9]\d?$/`, else null); `cleanValue` routes `ad` to it | A1 |
| `lib/season1/tags.ts` | comment only ("nine kept parameters"); `URL_ALLOW_KEYS` already derives from `LC_KEYS` | A1 |
| `middleware.ts` | comment only (`ad` in the kept list); no code change | A1 |
| `lib/season1/senders/context.ts` | `OrderCtx.ad: string \| null` | A2 |
| `lib/season1/outboxLoad.ts` | `ad: cleanAd(lc.ad)` from `oa.lc` | A2 |
| `lib/season1/senders/discord.ts` | `SourceInput` picks `ad`; branch (c) returns `ad <lc.ad>` when there is no utm_content and `lc.ad` is set (after the paid `ad <utm_content>` check, before the Klaviyo name); `needsAdNameLookup` is false in that case | A2 |
| `lib/season1/senders/klaviyo.ts` | `COMMITTED_PROPERTY_KEYS` and the Committed props add `ad` (`o.ad ?? ""`); profile props untouched | A2 |
| `lib/season1/joinPage.ts` | template var `SRC` = the route's whitelisted src or `""` | A3 |
| `app/season1/join/b/join-b.html`, `join/jersey/join-jersey.html` | the `season1_join_view` script sends `{variant, ad, src}`; `ad` is the URL's `ad` normalized and validated as in A1 (empty otherwise); wrapped in an IIFE so no global leaks | A3 |
| `app/season1/landing.html` | 4 lines after the CTA handlers: `window.S1.joinHref()`, href set on any `[data-join]` present at load (none in Part A), one delegated `click` listener that sends `ga("s1_join_click",{location})` and `clarity("event","join_click")` | A4 |
| tests (6 files) | A5, below | A5 |
| `docs/season-one-tracking.md` | a "Fast-track link tap" row in "What fires where"; a section on the join pages and the order's last click (kept keys, `URL_ALLOW_KEYS`, join_view fields, `src=ad`, order outputs) | A6 |

Not changed: `app/api/season1/commit/route.ts` (it stores `orderAttribution(...)`, whose `lc` comes from
`parseLastClick`, which iterates `LC_KEYS`, so `lc.ad` is stored with no edit there; proved by the
attribution test "order attribution carries lc.ad from the cookie"), `app/season1/join/signup/`, the
join route files (so `joinRoutesMatch` is untouched), any CSS, image or markup.

## Assumptions (stated, not guessed silently)

1. "Normalized the way the landing does": the landing strips one leading zero (`.replace(/^d0/,"d")`),
   so `D019` is `d19` and `d0019` is invalid. I matched that rather than stripping all zeros.
2. `ga()` on the landing already merges `{ad:d.id, hero}` into every event, so the handler passes
   `{location}` and the event carries `{ad, hero, location}`.
3. `location` is the link's `data-join` value (Part B's markup sets it, for example `top`, `bottom`);
   `"link"` when the attribute is empty.
4. The click listener is delegated on `document` (one listener, `closest("[data-join]")`), so links
   rendered later (Part B's confirmation card) are covered without re-binding. No `isTrusted` guard,
   matching the existing `cta_click` handlers.
5. `joinHref` param order: `src`, `ad`, then `utm_source`, `utm_medium`, `utm_campaign`,
   `utm_content`, `utm_term`, `utm_id`, each only when the landing URL has a non-empty value. `site`
   and `hero` are not carried.
6. Jersey `season1_join_view.ad` was the hero variant (`d19` by default); A3 asks for the URL's `ad`,
   empty when absent, so a bare `/season1/join/jersey` now sends `ad:""` (the variant stays `jersey`).
7. `join_view.src` is the server-whitelisted src (the same value the signup link carries), injected
   as `{{SRC}}`, rather than read raw from the URL.
8. A2 branch (c) with `lc.ad` applies whatever the medium when there is no utm_content (the brief's
   wording). A share link (`utm_source=share&utm_medium=referral&ad=d19`) therefore reads `ad d19`.

## Tests and types

| Run | Result | Source |
|---|---|---|
| Before (ea04f40) | 589 tests, 588 pass, 1 skipped, 0 fail; field-vitals 5 of 5 | `STRIPE_SECRET_KEY=... npm test` |
| After (9ad9b71) | 605 tests, 604 pass, 1 skipped, 0 fail; field-vitals 5 of 5 | same |
| `./node_modules/.bin/tsc --noEmit` | clean | |

The 16 new tests: `attribution.test.ts` 7 (cleanAd table; kept and normalized beside utms; bare valid
ad alone, invalid dropped and alone writes nothing; over budget `ad` survives with fbclid; parse
re-validates and drops a hostile `ad`; `orderAttribution` carries `lc.ad`; middleware `?ad=D019` with
utms writes `d19`, `?ad=zz` writes no cookie), `tags.test.ts` 1 plus the updated key list (join pages
keep `?ad=`), `outbox.test.ts` 2 plus one assertion (branch c with `lc.ad`, utm_content still wins,
referral and karlin first; lookup skipped; Committed `ad` empty or `d19`, never on the profile),
`joinPage.test.ts` 2 (B template and jersey: the rendered script string and its output in a vm for
`?src=ad&ad=D018`, bare, `?ad=zz`, `?ad=d21&utm_source=x`), `landingHead.test.ts` 4 (the shipped block
is three lines after the CTA handlers; href order and the bare `d1` case; href set on load-time
`[data-join]`; only a `click` listener, one GA and one Clarity event per join click, none for other
targets). Fixtures in `outbox.test.ts` and `committedList.test.ts` gained `ad: null`.

## Build and servers

`COMMIT_REF=9ad9b71 ... npm run build`: exit 0. Served on 3103 from this worktree (`next start`, PID file
`.server-3103.pid`); main 3bf6c58 served on 3101 from the scratch export the same way.

## Pixel pair (no visible change)

Script `part-a/ft-pixel.mjs` (the `atlas-pixel.mjs` capture: reduced motion, animation and transition
freeze, `Math.random` 0.25, localStorage cleared, fonts and non-lazy images settled, full page; analytics
hosts stubbed to 204 by host regex with `page.route`, POST `/api/season-one` fulfilled locally). Result
`part-a/_pixel.json`:

| Ad | Viewport | main md5 | build md5 | Equal | Diff |
|---|---|---|---|---|---|
| d19 | 412x915@2.625 | 394e78cfede0d3c4b01f0adc0e417dc9 | 394e78cfede0d3c4b01f0adc0e417dc9 | yes | 0% of 1082x6565 |
| noad | 412x915@2.625 | b2c19936bd57c874158532fc59622ce6 | b2c19936bd57c874158532fc59622ce6 | yes | 0% of 1082x7904 |

Offenders: none. Console errors: none. Pixel output is unchanged: Part A adds no element, CSS or image.
Served landing HTML, main vs build (`diff` of `curl /season1`): the build marker, the four A4 lines, and
the static tag script's kept-key array gaining `"ad"` (the landing uses GA4's own `location.search`
there, so its beacons do not change).

## Class Q on the 3103 build

Script `part-a/ft-classq.mjs`, Chromium 412x915, `s1_qa=1` cookie so the QA tag path defines `gtag`
(every event therefore also carries `debug_mode:true`). Result `part-a/classq.json`.

| Check | Result |
|---|---|
| (1) `/season1/join/jersey?ad=d21&utm_source=x&utm_content=y` | address bar after load `?ad=d21&utm_source=x&utm_content=y`; `#jh` `data-ad` `d21`, `.t-tag` hidden, `.t-team` inline, `.jh-back` hidden (the d21 variant, screenshot `part-a/q1-jersey-d21-412.png`); `dataLayer` `season1_join_view {variant:"jersey", ad:"d21", src:""}` once. Pass |
| (2) `/season1/join?src=ad&ad=d18` | address bar keeps `?src=ad&ad=d18`; `season1_join_view {variant:"b", ad:"d18", src:"ad"}` once. Pass |
| (3) `ekuzo_lc` via CDP `Network.getAllCookies` | `/season1?ad=D019&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d19-a`: HttpOnly, `{path:"/season1", utm_source:"meta", utm_medium:"paid_social", utm_campaign:"season1", utm_content:"d19-a", ad:"d19"}`; `/season1?ad=zz` (fresh context): no `ekuzo_lc`. Pass |
| (4) `window.S1.joinHref()` | tagged URL: `/season1/join?src=ad&ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a`; bare `/season1`: `/season1/join?src=ad&ad=d1`; `[data-join]` elements on the page: 0. Pass |
| (5) synthetic `[data-join="top"]` injected | wheel scroll, `scrollBy`, `focus()`, a dispatched focus event and Tab: 0 `s1_join_click`, 0 Clarity `join_click`; one tap: 1 and 1 (`{ad:"d19", hero:"none", location:"top"}`); one click more: 2 and 2; a click elsewhere: still 2 and 2. Pass |
| Offender check | hosts answered from the network other than localhost and the two font hosts: none. Stubbed: www.googletagmanager.com, connect.facebook.net, www.clarity.ms |

Console: six 404s, all `/images/new torn paper/torn-paper-*-top-1@2x.png` on the two join pages, the
same three URLs on main 3bf6c58 (checked with a per-response log on both ports); not from this slice.

Both servers stopped by PID (the 3101 `next-server` child stopped by its PID after `fuser`); `fuser
3101/tcp 3103/tcp` then exit 1 with no PIDs, and `curl` to both ports refused (code 000).

## For Fable (seen, not fixed)

1. Join pages' GA4 `page_location` now includes `ad=` when the URL has it (tags.ts builds it from
   `LC_KEYS`). Expected with A1; the beacon list differs from main only there.
2. A bare valid `?ad=` visit (including the landing's share link, which carries `utm_medium=referral`)
   now writes `ekuzo_lc` and replaces an earlier click, and branch (c) then reads `ad <ad>` ahead of the
   Klaviyo ad name and the email branch. Per F2 and A2 as written; flagging in case the share link
   should read as referral.
3. `eventSrc` (the Committed event's `src`) does not look at `lc.ad`; a bare-ad order with no `?src=ad`
   still reads `direct`. Fast-track links carry `src=ad`, so they read `ad`.
4. The jersey hero switch still compares the raw URL value (`d20`/`d21`), so `?ad=D021` shows d19 while
   join_view reports `d21`. Not in A1 to A6.
5. The torn-paper 404s above on the join pages (same on main).
6. `/home/claude/wt-main` is detached at 45dfe97, not at main 3bf6c58, and has a stale `.server-3101.pid`.

## Follow-up (Fable, 2026-11-10): items 2 and 4 above

Commits on top of cd0aa87: the A2 fix (branch c), the jersey switch fix, then this section. Build
tested: 0699635 (`s1-build` marker on the served landing).

1. **Branch (c) with `lc.ad`** (`lib/season1/senders/discord.ts`): `lcAd` now applies only when there
   is no utm_content, `lc.ad` is set, and the last click is paid (`isPaidClick`) or `src` is `ad`.
   `needsAdNameLookup` follows it, so share, email and bare-ad orders keep the Klaviyo lookup as on
   main. This replaces assumption 8 and closes item 2 in "For Fable".
   Tests (`outbox.test.ts`): for a share link, an email click, `src=email`, a paid first touch and an
   empty order, each with and without a Klaviyo name, `formatSource` with `ad: "d19"` equals
   `formatSource` with `ad: null` (10 pairs). Explicit cases: (a) share link, no name `organic`, with a
   name `ad d11-a (via organic)`; (b) `utm_medium=email`, `utm_campaign=s01-open`: `email s01-open`,
   with a name `ad d11-a (via email)`; (c) `src=ad`, `ad=d19`, no utm: `ad d19` (also with a name);
   (d) `paid_social` or `cpc`, no content: `ad d19`. Lookup: false for the src=ad and paid cases, true
   for share, email and bare ad.
2. **Jersey hero switch** (`app/season1/join/jersey/join-jersey.html` line 286): the URL value is
   lowercased and `d0N` becomes `dN` before the `d20`/`d21` comparison, the same normalization as
   join_view. Test (`joinPage.test.ts`): the shipped script string, run in a vm, maps `d21` and `D021` to
   `d21`, `d020` and `D20` to `d20`, and `d19`, bare, `zz` and `d0021` to the d19 default. Item 4 is
   closed.

| Run | Result | Source |
|---|---|---|
| `npm test` (0699635 code) | 607 tests, 606 pass, 1 skipped, 0 fail; field-vitals 5 of 5 | `STRIPE_SECRET_KEY=... npm test` |
| `tsc --noEmit` | clean | |
| Build `COMMIT_REF=0699635` | exit 0 | |

Class Q re-run on 3103 (`part-a/ft-classq-followup.mjs`, result `part-a/classq-followup.json`):

| Check | Result |
|---|---|
| (1) `/season1/join/jersey?ad=D021&utm_source=x&utm_content=y` | address bar keeps `?ad=D021&utm_source=x&utm_content=y`; `data-ad` `d21`, `.t-tag` hidden, `.t-team` inline, `.jh-back` hidden (screenshot `part-a/q1b-jersey-D021-412.png`); `season1_join_view {variant:"jersey", ad:"d21", src:""}` once. Pass |
| (3) `ekuzo_lc` via CDP | `?ad=D019` with the four utms: HttpOnly, `ad:"d19"` beside the utms; `?ad=zz` in a fresh context: no `ekuzo_lc`. Pass |
| Offender check | none |

Console: the three torn-paper 404s on the jersey page (item 5, same on main). 3103 stopped by PID;
`fuser 3103/tcp` exits 1, and curl to the port is refused (000).
