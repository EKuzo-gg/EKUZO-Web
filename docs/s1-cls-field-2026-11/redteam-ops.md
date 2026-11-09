# Red team, operations and failure lens: s1 cls field run

Reviewer: ops lens, 2026-11-09. Spec read: `00-brief.md`, `00-phase0-field-truth.md`, `01-requirements.md`.
Code read: `lib/season1/mode.ts`, `lib/season1/tags.ts`, `app/season1/route.ts`, `app/season1/landing.html`
(head, both scripts, submit handler), `app/api/season-one/route.ts`, `lib/metaCapi.ts`, `netlify.toml`,
`netlify/functions/s1-drain.mts`, `next.config.mjs`, `docs/dev-runbook.md`, `docs/season1-commit/ops-runbook.md`
and `06-cleanup-ledger.md`, the 11-05 round 2 and join-sync docs, top WORKLOG entries.
Probes: dry-run merge in a throwaway worktree (removed, `git worktree list` shows only the repo), and three
`curl -I` calls against ekuzo.gg and dev--ekuzo.netlify.app (read only). No file in the repo was modified except this one.

## Ranked findings

| ID | Sev | Type | Effect | Where | Proposal | Who acts |
|---|---|---|---|---|---|---|
| O-1 | high | infra-gap | A plain `git merge origin/main` into `dev` stages 60 deletions (24 ad images, `public/review.html`, 35 roadshow files) and 3 conflicts. Shipping that to dev removes the roadshow and ad-lab pages the team uses. | `git merge origin/main` on `origin/dev` (d11a269) | Use the verified recipe in "Relay runbook". Result differs from `origin/main` only by the 60 dev-only files plus WORKLOG. | Relay |
| O-2 | high | infra-gap | A test sign-up on dev writes to the live Klaviyo account and list `XGTv2F`, and sends a live Meta Lead unless the dev context has `META_CAPI_USE_TEST_CODE=true` with a code. The route has no host or mode guard. The dev env cannot be read from this container. | `app/api/season-one/route.ts:131-133,483,634-639`; `lib/metaCapi.ts:58-70` | Before any dev sign-up: Jamie or Relay reads the Netlify env for the branch-deploy context (names and the two CAPI values only). If the readout is missing, run zero sign-ups on dev and park J1/J2. Ledger rows listed in detail section 1. | Relay, Jamie for the readout |
| O-3 | high | spec-gap | If the big inline script fails to parse or throws before it binds the forms, both sign-up forms are dead (`action="javascript:void(0)" onsubmit="return false"`), the hero stays an empty reserved box, and there is no message, no `noscript`, no event. L2 and L5 edit exactly this script. | `landing.html:919,957,1001,1437` | Requirements OR1, OR2, OR3: compile gate, ready sentinel, failure-injection profiles. | Chronos, Atlas |
| O-4 | high | spec-gap | The all-families Google Fonts stylesheet is a render-blocking `<link rel=stylesheet>` in the head. Where `fonts.googleapis.com` hangs (filtered networks, China, flaky carrier DNS) first paint waits for the browser's own timeout. L3 changes this path but the spec defines no failure behavior. A single invalid family name in a per-ad request makes Google answer 400 for the whole sheet, so the page loses every display font. | `landing.html:5-7`; L3 | Requirements OR4, OR5. | Atlas |
| O-5 | medium | spec-gap | `?s1qa=1` on dev (the way M1 proves the event list) loads production Clarity, the production Pixel PageView and GA4 with `debug_mode`, because Clarity is not gated by QA mode. The cookie `s1_qa` then persists for the session. Round 3 of the commit run already leaked Google Ads pings this way. | `tags.ts` `coreJs` (Clarity block runs for qa true and false), `QA_GATE_JS` | Requirement OR6: M1 lanes use the H6 route block even in QA mode; Jamie's phone check runs without `?s1qa=1`. | Sentry |
| O-6 | medium | spec-gap | A failed Netlify build on `dev` leaves the previous dev deploy published. Sentry would then test stale content and report it as the branch. | Netlify behavior; no build marker in `landing.html` | Requirement OR7: a build marker in the page, stamped into every harness JSON, and a refusal to run on a mismatch. | Atlas, Chronos |
| O-7 | medium | spec-gap | P6 "live means live" has no defined check. The landing response carries no `ETag` and no `Last-Modified`, so an ETag comparison is impossible. `age` and `x-nextjs-date` disagree by 24 h on production today. | `curl -I` outputs in detail section 2 | Requirement OR8: body marker plus body hash against a local build of the same commit. | Sentry, Steward |
| O-8 | medium | infra-gap | `playwright` is in no `package.json`. `npm run vitals` fails on Jamie's or Aaron's Mac after a clean `npm install`. Adding it carelessly can desync the lockfile and break the Netlify install. | `package.json` (no playwright); `scripts/field-vitals/` absent | Requirement OR9 and the one-line install in section 3. | Chronos |
| O-9 | medium | improvement | Raw JSON per run can reach tens of MB. `docs/` is already 238 MB in the working tree. | `.gitignore` | Requirement OR10: ignore raw JSON, keep tables and a hashed manifest. | Chronos |
| O-10 | medium | infra-gap | Neither the 429 path nor the quiet path emits any client event. 429 returns with `why=""` (no `signup_error`), quiet is folded into `repeat` (no `generate_lead`). The only trace is two `console.warn` lines in Netlify function logs. | `landing.html:1448-1453`; `route.ts:598-607` | Requirement OR11 (additive GA4 events in `landing.html`) plus the daily Klaviyo versus Meta gap in section 5. | Atlas, readout |
| O-11 | medium | accepted-risk | Per-IP limits (10 quiet, 30 refused) can trip on a school, office, co-op or talk Wi-Fi where many parents sign up in one clock hour. Quiet is invisible to the parent. A 429 sends them to a text line. At current volume this is unlikely. | `route.ts:145-149,181-261` | Accept for this run; measure with O-10; keep our own QA at 9 or fewer new sign-ups per IP per hour. | Fable decides; no action now |
| O-12 | medium | infra-gap | Nothing tells the team the landing page broke at 2 am. The static page cannot rot by itself, so the real risks are a deploy, the sign-up function, Klaviyo and third-party fonts. | no alert config in repo; `s1-drain` only drains the outbox | Daily scheduled task (section 6). Netlify scheduled canary function later. | Fable creates the task after Jamie's OK; Jamie |
| O-13 | low | spec-gap | L2 preload failure modes: wrong path (404 wastes bytes, no layout effect), wrong `as`, `type` or `crossorigin`, or a missing `imagesrcset` once L4 adds srcset (image downloads twice). A server-rendered preload would be cached once for all 22 ad variants. | L2, L4, X1 | Requirement OR12. | Atlas |
| O-14 | low | improvement | Hero images answer `cache-control: public,max-age=0,must-revalidate` with an ETag. Warm visits still pay a 304 round trip (150 ms RTT on the Slow 4G profile). | `curl -I` on `/images/season1/landing/boys-girls-club.webp` | Content-hashed file names plus a long cache, later. It touches every `IMG` path, so not now. | Not now |
| O-15 | low | spec-gap | The harness journey types in the email field. A stray Enter or a bug would POST to production when run live. | H3, H8 | Requirement OR13: block `POST /api/season-one` at request routing in every run and log any attempt. | Chronos |
| O-16 | low | accepted-risk | The Stripe test webhook endpoint `we_1TMYx4…` points at `dev--ekuzo.netlify.app/api/webhooks/stripe`. Old dev had no legacy guard. | `docs/season1-commit/06-cleanup-ledger.md:52,174` | The merge brings main's code to dev; Relay greps for the guard after merging and records it. | Relay |

## Detail

### 1. Deploy path (O-1)

Facts at probe time: `origin/dev` d11a269, `origin/main` 45dfe97, merge base 0ef69fc, 37 commits only on dev, 109
only on main, git warns "multiple merge bases" (criss-cross history; the default strategy still merges).

Dry run (`git worktree add --detach <scratch>/wt-dev origin/dev`, `git merge --no-commit --no-ff origin/main`):

- Conflicts, exactly three: `WORKLOG.md` (4 hunks, both sides add entries at the top), `public/roadshow/ad-lab.html` and
  `public/roadshow/index.html` (modify/delete: main deleted them, dev edited them). `app/sitemap.ts` auto-merged
  (adds the `/season1/join` entry).
- Silent deletions: 58 files staged as `D`, plus the 2 modify/delete files, so 60 dev-only files: 24 under
  `public/ads/season1/`, `public/review.html`, 9 under `public/roadshow/`, 18 under `public/roadshow/email-photos/`,
  8 under `public/roadshow/funnel/`. This is the failure `dev-runbook.md` warns about, now reproduced.
- One rename: `app/season1/join/join.html` removed on main (join-sync work). Harmless on dev.
- Fix verified in the worktree: restore the 60 paths from `origin/dev`, strip the WORKLOG markers keeping both sides.
  Then `git diff --cached --name-only origin/main` lists only the 60 dev-only paths and `WORKLOG.md` (78 files by `--stat`),
  and `git diff --cached --name-only origin/dev` lists none of the roadshow, ad or review paths. The merge was then
  aborted and the worktree removed.
- Pre-existing litter: both branches carry one stray `>>>>>>> Stashed changes` line in `WORKLOG.md` (line 3119 on each,
  3273 after the merge). The marker strip in the recipe only removes `HEAD` and `origin/main` markers, so it stays.
  Do not treat it as a leftover conflict.
- The husky pre-commit hook (10 MB cap) runs on the merge commit. Nothing here exceeds it. Do not use `--no-verify`.
- The branch `build/s1-cls-field` is already on the remote (`c01db9e`), so pushes from this container work. The runbook
  says pushes go through Jamie's terminal because earlier sessions had no write access. Fable should confirm that a
  push of `dev` from the container is authorized for this unattended run (D3 reads as yes).
- Then main: `build/s1-cls-field` is `origin/main` plus its own commits, so `git push origin <branch>:main` is a
  fast-forward as long as `origin/main` has not moved. After that, dev already contains those commits through the
  integration merge, so a later main-into-dev merge is trivial.

Dev env, read from code and docs (the Netlify UI cannot be read from here):

- `resolveMode` cannot return `live` on dev: it needs deploy context `production`, a raw host of `ekuzo.gg` or
  `www.ekuzo.gg`, `sk_live_`, `pk_live_`, a non-test database and a webhook secret. `S1_COMMIT_MODE=live` on a branch
  deploy resolves to `off`. `test` needs `sk_test_` and the Neon test endpoint, else `off`. The ledger shows branch
  deploys on 10-26 to 10-29 ran Stripe test mode plus Neon test, and `ops-runbook.md:291` says previews and branch deploys
  keep test values. So Stripe and the database on dev are test-scoped as of 10-29; Relay should re-read this.
- Tags: the landing page is force-static and decides in the browser. `renderStaticTags` loads live GA4, Pixel and
  Clarity only when `location.hostname` matches `^(www\.)?ekuzo\.gg$`. On `dev--ekuzo.netlify.app` a visitor gets the
  QA gate: nothing loads unless `?s1qa=1` was seen (cookie `s1_qa`). The dynamic join pages use the raw Host header
  the same way and also stay off when mode is `test`. A normal visitor or a phone check without the parameter sends
  nothing to live GA4, Pixel or Clarity. With `?s1qa=1` they do (O-5).
- Waitlist API: no host guard, a single `KLAVIYO_PRIVATE_API_KEY`, default list `XGTv2F`. Klaviyo has no sandbox
  here: the ledgers from 10-29 and 11-05 show `team+s1test-*` profiles in the live account. Whether dev's CAPI is in test
  mode depends on `META_CAPI_USE_TEST_CODE` in that context; `gaming-study-ship` required the same readout.

Cleanup ledger rows a dev sign-up creates (identity `team+cls-1109-<n>@ekuzo.gg`):

| System | Write | Cleanup |
|---|---|---|
| Klaviyo (live account) | profile, `Season 01 Waitlist` event, profile props `season1_*`, subscription to list `XGTv2F` (may trigger the live welcome flow to the team inbox) | suppress or delete the profile; the readout already excludes the `team+` prefix |
| Meta CAPI | one `Lead` with `event_id` = page eventId (test code if the flag is set, else live and undeletable) | none possible; record the event id |
| Neon (test branch if dev `DATABASE_URL` is the test endpoint) | `s1_rate_limits` claim keys for the email and the IP bucket | may stay; ledger notes it |
| Stripe | none unless a test payment is made; list webhook endpoints first (brief) | n/a |

Cap our own sign-ups at 9 new per IP per clock hour, or the lane trips the quiet path and sends no Lead, which
silently changes what the test proves.

### 2. Caching (O-6, O-7, O-13, O-14)

Probe, 2026-11-09 16:13 UTC:

| Host | cache-control | age | ttl | other |
|---|---|---|---|---|
| ekuzo.gg/season1?ad=d18 | `s-maxage=31536000` | 336419 | 31199580 | `Netlify Durable: hit`, `Next.js: hit`, `Netlify Edge: fwd=miss … stored`, `x-nextjs-date: Fri, 06 Nov 2026 18:47:05 GMT`, no `etag`, no `last-modified` |
| dev--ekuzo.netlify.app/season1 | same | 250064 | 31285935 | `x-nextjs-date: Mon, 09 Nov 2026 16:06:05 GMT` |

Reading it:

- age plus ttl equals 31536000 (one year), so the entry was stored `age` seconds ago: production Nov 5 about 18:46 UTC
  (12:46 CT), dev Nov 6 about 18:46 UTC. That is 1 h 38 min after the stated 11:08 CT release. Either a later main
  deploy ran or the first request after the deploy came later. The two clocks (`age`, `x-nextjs-date`) disagree by 24 h
  on production, so neither header proves a deploy time. Use the Netlify deploy list for time and the body for content.
- Netlify keys cached responses per deploy and publishes atomically, so a new deploy starts with an empty cache and
  nobody is served a mix after it goes live. `netlify-vary` lists only `__nextDataReq` and `_rsc` as varying query keys, so
  `?ad=…&fbclid=…` all share one cached body. The page is a single file for every ad; the ad is chosen in the browser.
- The Nov 5 fix: every Clarity poor-CLS session in the 7-day window ends at Nov 5 07:32 CT, before any possible store time
  of the current entry, and the 3-day window is clean. The age does not date the release, it bounds it from above.
- Browsers: no `max-age`, no validator on the HTML, so an in-app WebView has nothing to reuse and refetches from the
  edge. Stale HTML at the visitor is unlikely.
- Images: `max-age=0,must-revalidate` with ETag (O-14). A replaced image keeps its URL and is picked up on the next
  request, which is why a same-name image swap in L4 is safe but never free.

"Live means live" check for Sentry after Jamie's push (OR8). Do all of it, from two networks (the container and Jamie's
phone on cellular), because Netlify edge nodes fill separately:

1. `curl -s https://ekuzo.gg/season1 | grep -o 'name="s1-build" content="[0-9a-f]\{7,40\}"'` equals the pushed sha.
   (Needs the marker from OR7. `COMMIT_REF` is available to the build; `route.ts` is force-static so it is read once at build.)
2. `curl -s --compressed https://ekuzo.gg/season1 | sha256sum` equals the same hash of a local `next build` plus
   `next start` body of that commit. `renderStaticTags` reads no env, so the body is deterministic.
3. `curl -sI` shows `age` smaller than the minutes since the push and `cache-status` listing `Netlify Edge` with
   `stored` on the first call. `age` above the push time means the old deploy is still answering.
4. The same three on `/season1?ad=d19&fbclid=x`, to prove the shared cache key.
5. Netlify deploy list shows the sha as Published (Jamie or Relay).

Preload and font caching risks:

- The L2 preload must be inserted by the small script from the same `AD_HERO`/`IMG` source. A preload placed in the
  static HTML would be cached once and applied to all 22 variants, fetching the wrong image for most (X1). Static caching
  makes this a hard rule, not a preference.
- The preload `href` must be byte-identical to the `<img>` or CSS URL the page later uses, with matching `as`,
  `type="image/webp"` and `crossorigin` state. Otherwise Chrome fetches twice and warns "preloaded but not used".
  After L4 adds `srcset`, the preload needs `imagesrcset` and `imagesizes`.
- A wrong path costs one 404 and the image it was meant to hasten arrives late; layout is unaffected because S2 reserves
  the box. Resource timing in the harness should assert status 200 and `image/webp` for every preload.
- Google's CSS response is cacheable by the browser for a day and differs by user agent. A per-ad stylesheet URL is a
  different cache entry per ad, so a typo in one family affects one ad. The existing all-families sheet has the opposite
  weakness: one bad family fails everything.

### 3. The harness as an operational tool (O-8, O-9, O-15)

- Output: `docs/s1-cls-field-2026-11/evidence/vitals/<label>/<profile>/<ad>.json` and a `table.md` per label (H5).
- Size: with 4 profiles, 2 viewports, 2 networks, 22 ad cells and N=3 the full matrix is about 1,000 runs. Each JSON
  holds shifts with sources, resource timing for 100 or more entries, long tasks and fonts, roughly 30 to 150 KB, so
  30 to 150 MB if all are committed. The working tree already holds 238 MB under `docs/`. Raw output must not be committed.
- Proposed `.gitignore` lines (root file; I did not edit it):

```
# field-vitals raw output: keep tables, manifests and failure files
docs/**/evidence/vitals/**/*.json
!docs/**/evidence/vitals/**/manifest.json
!docs/**/evidence/vitals/**/keep-*.json
```

  The harness writes `manifest.json` (command line, commit sha, build marker, Node, Playwright and Chromium versions,
  sha256 of every raw JSON, blocked-request log) and copies any run with CLS at or above 0.1, a leaked tag request, or
  a failure to `keep-<cell>.json`. Raw JSON zips go to the scratchpad or Jamie's Drive. Traces and videos are never
  written by default; a Playwright trace is 5 to 20 MB and the hook caps files at 10 MB.
- Invocation: `npm run vitals -- --target local|<url> --ads d18,d19 --label <name>` (H1). A quick gate mode
  (one profile, four ads, N=1, under 3 minutes) is what a person runs before a push. The ads-readout skill and a future
  run call the same script; the skill only needs the repo checked out, Node 22 and the browsers installed. Exit codes:
  0 clean, 1 a threshold failed, 2 setup problem (no Playwright, no browser, target unreachable, build marker mismatch),
  3 a blocked host received a request or a POST was attempted. Exit 2 must never print a green table.
- Missing Playwright on Jamie's or Aaron's Mac: `playwright` is not a dependency today, so the script catches the
  `require` failure and prints one line, then exits 2:

```
npm i --no-save playwright && npx playwright install chromium webkit
```

  `--no-save` keeps `package.json` and `package-lock.json` untouched. If Chronos wants it as a `devDependency`, regenerate
  the lockfile with npm 10.9 and check `npm ci --dry-run` before the commit; a lockfile out of sync would fail the
  Netlify install on both branches. Browser download is about 300 MB for the two engines.
- Mac caveats: Apple Silicon is much faster than the Android profile, so CDP 4x throttling may under-stress the main
  thread. Report the machine and a calibration number (a fixed JS loop time) in the manifest so a Mac run and a container
  run are comparable. WebKit has no CDP: `iphone-safari` cannot be throttled and must be labelled unthrottled.
- Live runs hit production pages: tag hosts blocked (H6), and (OR13) every `POST /api/season-one` aborted at routing.
  Without the second block, a harness bug that submits would create a real profile and a live Lead.

### 4. Failure modes of the proposed changes (O-3, O-4, O-13)

| Failure | What the visitor gets today or after the change | Covered by the spec? | Needs |
|---|---|---|---|
| Hero preload 404 (wrong path) | Image arrives late through the normal `<img>`; no shift (S2) | Partly (X1, S2) | OR12 asserts status 200 for each preload |
| Preload attributes mismatch | Double download, slower LCP, console warning | No | OR12 |
| Google Fonts unreachable, stylesheet blocking (today) | Blank page until the browser gives up on the request | No | OR4 |
| Google Fonts unreachable after L3 (async) | Page paints in fallback fonts; hero fits after `fonts.ready`, which may never fire; `load` also calls `fitHero` | Partly (X3 covers only a fast network) | OR4 (assert a usable page and CLS under 0.1 with fonts blocked and with a 20 s delay) |
| Per-ad font request has a bad family | Google 400s the sheet, every display font missing, type metrics change, shift | No | OR5 |
| Small script throws at runtime | Inside `try/catch`; `#hero` is not marked, so the phone reserves no box and the join section drops about 450 px when the big script fills it (the original W4 bug) | Partly (S5 keeps the shipped logic) | OR3 failure profile |
| Small script has a syntax error | `AD_HERO` and `HERO_KEYS` (top-level `const`) are never defined; the big script reads `AD_HERO` and throws `ReferenceError`, forms dead | No | OR1, OR2 |
| Big script fails to parse or throws before binding | Empty hero box, forms do nothing, no message, no GA4 event, only Clarity's JS error count | No | OR1, OR2, OR3 |
| In-app WebView "java object is gone" error (94% of the 10.45% error sessions) | Existing noise from Facebook's bridge; hides real errors in Clarity | Not a spec item | OR14 |

The current handler already has one tell the harness can use: the big script runs `fitHero()` and the form
`submit` handler near its end (`landing.html:1350,1437`). A sentinel set as the last statement (OR2) distinguishes
"ran to the end" from "ran partly".

### 5. Rate limits and real parents (O-10, O-11)

How it works: the IP comes only from `x-nf-client-connection-ip` (IPv6 keyed by /64; missing means no limit). Only
new sign-ups count. Per clock hour: more than 10 from one IP is quiet (saved, subscribed, no Meta Lead, response
`{ok:true,quiet:true}`), more than 30 is a 429, more than 150 site-wide makes every new one quiet.

- Carrier networks: US mobile traffic to a dual-stack site mostly arrives over IPv6 with a /64 per device, which isolates
  parents. IPv4 CGNAT users share one address, but 10 new ad sign-ups from one address in a clock hour is far above
  today's volume (roughly 440 sessions in 3 days). Low risk now; it grows with spend.
- Places where parents share an address: a school or PTA night with a QR code, a co-op meeting, an office, and Jamie's
  own talks and lectures (he regularly speaks to audiences; a slide with a QR would put 30 people on one Wi-Fi). Past 10 the
  rest are quiet: the parent sees the normal "you're in" screen and Meta never gets those Leads. Past 30 the 31st person
  sees "We couldn't save your sign-up just now. Text our founder at (832) 271-0150 and we'll add you by hand." The button
  is re-enabled; nothing was saved; they can retry in the next clock hour. No GA4 event, no Klaviyo trace.
- Because the window is the clock hour, a burst at 7:55 pm splits across two counters.
- Global 150 per hour needs an ad surge or a bot run; the quiet path then silently starves Meta optimization with no
  alert. The sign-up itself is never lost.

Signals that exist: `console.warn` lines `Season 01 sign-up quiet: reason=…` and `rate limited: reason=…` in Netlify
function logs (no IP, short retention unless a log drain exists); GA4 `hero_view`, `form_start` and `generate_lead` on the
landing page. Signals that are missing: any client event for quiet or 429; any property on the Klaviyo event.

Measurement proposal, cheapest first:

1. Now, free: Relay searches Netlify function logs for `sign-up quiet` and `rate limited` over the last 7 days and records
   the count (baseline; expected zero).
2. Daily, in the readout: Klaviyo `Season 01 Waitlist` events with `season1_source=ad-landing` and no `team+` prefix, minus
   Meta Events Manager server Leads for the same day. The gap is quiet plus CAPI failures plus ad blockers on the
   pixel side; a rising gap with flat sign-ups points to the limiter. The Klaviyo MCP can aggregate the metric.
3. Additive client events in `landing.html` (OR11): `ga("signup_error",{reason:"rate_limited"})` on 429 and
   `ga("signup_quiet")` when `j.quiet===true`. No PII, no change to the POST body, no Pixel change, so X8 and N4 hold.
4. Later, optional, protected file: a `season1_quiet` property on the Klaviyo event. Park it; it touches `route.ts`.

### 6. Observability at 2 am (O-12)

What exists: Clarity (JS errors, rage clicks), GA4 `signup_error` with reason `server` or `network`, the Klaviyo outbox
drain every 2 minutes on production, Discord ops alerts for the commit flow, Netlify's own deploy status. None of them
pages anyone for the landing page. A static page edge-cached for a year cannot decay overnight; the realistic causes
are: a push to `main` by Aaron or Jamie that breaks the page or the build marker, the sign-up function failing (Klaviyo
down, Neon, a bad deploy), Google Fonts, and Netlify itself.

Cheapest check that would catch most of it, one scheduled task per day (and once after every main deploy), zero code:

1. `curl -sI https://ekuzo.gg/season1?ad=d18` returns 200, `content-type: text/html`, and the body contains the build
   marker and the expected sha (after the first push) and the strings `id="hero"` and `id="em-top"`.
2. `curl -s -X POST https://ekuzo.gg/api/season-one -H 'content-type: application/json' -d '{"email":"x"}'` returns 400 with
   "That email doesn't look right." This proves the function is alive and writes nothing (email validation runs before
   any Klaviyo call). It does not prove Klaviyo.
3. One `npm run vitals` run, quick mode, d18 and d19, `chrome-android`, tags blocked, POST blocked: CLS under 0.1, LCP
   under 4 s, the ready sentinel present, `#hero` non-empty.
4. Klaviyo `Season 01 Waitlist` count for the last 24 h (non-test) compared with the previous 7-day median; zero while
   Meta shows spend is a failure.
5. Failure goes to a push notification to Jamie; success writes one line to the day's read. Weekday runs can ride on the
   ads-readout skill's schedule; weekends need their own.

Later, code, optional: a Netlify scheduled function on production (the `s1-drain` pattern, which already runs only on the
published production deploy) that does steps 1 and 2 hourly and posts to the existing ops Discord only on failure.

## Relay runbook: dev-integration merge

Run from the repo clone; never touch its working tree (the worktree lives under the scratchpad). Each block stops on
the first surprise; a conflict outside the expected three is a stop, not a fix.

```bash
SCR=/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad
WT=$SCR/wt-integ
cd /home/claude/ekuzo-web

# 0. Pre-flight: refs must match what this review saw, or re-run the dry run.
git fetch origin
git rev-parse origin/dev origin/main            # expect d11a269c1766a456b761fc8157272fca833210a5 and 45dfe97cb65a3cec58b458e37c240675c595a71a
git merge-base --is-ancestor origin/main origin/dev && echo "STOP: dev already has main"
git diff --quiet origin/main origin/build/s1-cls-field -- public/roadshow public/ads public/review.html && echo "branch is clean of dev-only paths"

# 1. Integration branch from dev, in a worktree.
git worktree add -b preview/s1-cls-field-dev "$WT" origin/dev
cd "$WT"

# 2. Merge main without committing. Exit code 1 is expected.
git merge --no-ff --no-commit origin/main || true
git diff --name-only --diff-filter=U | sort     # expect exactly: WORKLOG.md, public/roadshow/ad-lab.html, public/roadshow/index.html

# 3. Restore every dev-only file main deleted (58 staged deletions + 2 modify/delete conflicts = 60).
DEVONLY=$( { git diff --cached --diff-filter=D --name-only; git diff --name-only --diff-filter=U | grep -v '^WORKLOG.md$'; } | sort -u )
echo "$DEVONLY" | wc -l                          # expect 60
echo "$DEVONLY" | grep -v -E '^(public/ads/season1/|public/roadshow/|public/review\.html$)' && echo "STOP: unexpected path"
git checkout origin/dev -- $DEVONLY

# 4. WORKLOG: keep both sides (the stray '>>>>>>> Stashed changes' line is old litter; leave it).
sed -i -e '/^<<<<<<< HEAD$/d' -e '/^=======$/d' -e '/^>>>>>>> origin\/main$/d' WORKLOG.md
grep -c -E '^(<<<<<<< HEAD|=======|>>>>>>> origin/main)' WORKLOG.md || true     # expect 0
git add WORKLOG.md
git diff --name-only --diff-filter=U | wc -l    # expect 0

# 5. Proof before committing.
git diff --cached --name-only origin/main | grep -v -E '^(public/roadshow/|public/ads/season1/|public/review\.html$|WORKLOG\.md$)' && echo "STOP: differs from main outside the dev-only set"
git diff --cached --name-only origin/dev  | grep -E '^(public/roadshow/|public/ads/season1/|public/review\.html$)' && echo "STOP: dev-only file changed"
git commit -m "Merge origin/main into dev (dev-only roadshow, ad and review files kept)"   # hooks run; no --no-verify

# 6. Add this run's branch. Expect no conflicts; if WORKLOG conflicts, keep both sides as in step 4.
git merge --no-ff origin/build/s1-cls-field -m "Merge build/s1-cls-field into dev for the dev deploy test"
git diff --name-only origin/main HEAD | grep -v -E '^(public/roadshow/|public/ads/season1/|public/review\.html$|WORKLOG\.md$)'   # lists only this run's files

# 7. Check what Netlify will build.
npm ci && npm run build && npm test             # a dev build failure leaves the old deploy up (O-6)
grep -n "legacy\|guard" app/api/webhooks/stripe/route.ts | head -5     # confirm main's legacy-product guard arrived (O-16)

# 8. Push, only as a fast-forward of dev. Stop if dev moved.
git fetch origin
test "$(git rev-parse origin/dev)" = d11a269c1766a456b761fc8157272fca833210a5 || echo "STOP: dev moved, redo from step 0"
git merge-base --is-ancestor origin/dev HEAD && git push origin HEAD:dev

# 9. Wait for the deploy, then prove it is this commit (OR7/OR8), not the previous dev deploy.
for i in $(seq 1 30); do curl -s https://dev--ekuzo.netlify.app/season1 | grep -q "s1-build\" content=\"$(git rev-parse --short=7 HEAD)" && break; sleep 30; done
curl -sI https://dev--ekuzo.netlify.app/season1 | grep -i -E '^(age|cache-status|http)'

# 10. Release to main later, only on Jamie's go (fast-forward of main to the branch, nothing from dev).
# git fetch origin
# git merge-base --is-ancestor origin/main origin/build/s1-cls-field || echo "STOP: main moved"
# git diff --name-only origin/main origin/build/s1-cls-field | grep -E '^(public/roadshow/|public/ads/season1/|public/review\.html$)' && echo "STOP"
# git push origin origin/build/s1-cls-field:main

# 11. Cleanup of the worktree after the push.
# cd /home/claude/ekuzo-web && git worktree remove "$WT" && git branch -d preview/s1-cls-field-dev
```

Step 9 needs the build marker from OR7; until it exists, compare `sha256sum` of the body against a local
`next start` body of the same commit.

## Missing requirements (paste-ready)

- **OR1** A test (`npm run test:s1`) extracts every inline `<script>` from `app/season1/landing.html` (after
  `fillTags`) and fails if any does not compile (`new Function`/`vm.Script`), including the small script at the top of
  `#lp` and the big script. Run in lab and in CI before any push.
- **OR2** The big inline script's last statement sets `document.documentElement.dataset.s1Ready="1"`, and the small script
  sets `data-s1-pa` (or `data-s1-ih`) on `#lp`; both attributes have no CSS. The harness records both, fails a run if
  `s1Ready` is missing after 10 s, and the daily canary asserts it.
- **OR3** Harness failure profiles, run on d18, d19, one interactive ad and `noad` under `fb-android` Slow 4G:
  `fonts-blocked` (abort fonts.googleapis.com and fonts.gstatic.com), `fonts-slow` (delay both 20 s), `hero-404`
  (abort the hero image), `small-script-throws` (inject a throw at its start), `big-script-fails` (abort nothing; replace
  the big script with a syntax error). For each, the report states the visible result, CLS, whether the form is usable, and
  whether a Clarity-visible error occurs. Required passes: fonts and image profiles keep the form usable and CLS under 0.1;
  the two script profiles are recorded as findings with the observed behavior.
- **OR4** L3 fails open. With Google Fonts blocked or delayed, first paint is not delayed by more than 1 s over
  main-with-fonts, text renders in fallback faces, `fitHero` still runs from `load`, and CLS is under 0.1. A hung font
  request must never keep the form from being usable.
- **OR5** Every font family the page requests, per ad, is checked by the harness: the Google CSS URL answers 200 and
  `document.fonts` shows that ad's display family `loaded`. A 400 from Google fails the run. The per-ad URL is built from the
  same table that sets `--disp`.
- **OR6** Any lane that loads live tags in QA mode (`?s1qa=1`, M1) blocks the same hosts as H6 at request routing, answers them
  locally, and lists the intercepted beacons. Jamie's phone check on dev uses the URL without `?s1qa=1`. No lane loads
  Clarity on a non-production host.
- **OR7** `landing.html` carries a build marker, `<meta name="s1-build" content="<short sha>">`, filled at build time
  from Netlify's `COMMIT_REF` (local builds use `git rev-parse`). It changes no rendered pixel. Every harness JSON records
  it and the harness exits 2 if the marker differs from the expected commit.
- **OR8** "Live" proof for P6: the page body on ekuzo.gg contains the new build marker, its sha256 equals the body of a local
  build of the same commit, `age` is smaller than the time since the push, from two networks, for `?ad=d18` and `?ad=d19`.
  ETag checks do not apply (no validator on the HTML).
- **OR9** Playwright is not added to `package.json` unless the lockfile is regenerated with npm 10.9 and `npm ci --dry-run`
  passes on both branches. The harness prints `npm i --no-save playwright && npx playwright install chromium webkit` and
  exits 2 when Playwright or a browser is missing. README states the Mac calibration note and that `iphone-safari` is
  unthrottled.
- **OR10** Raw harness JSON is gitignored under `evidence/vitals/`. The harness writes `manifest.json` (command, commit sha,
  build marker, versions, machine calibration, sha256 of every raw JSON, blocked-request log) and `keep-*.json` for any run at
  or above CLS 0.1 or with a leaked request. Only tables, manifests and keep files are committed. Raw zips are stored outside
  the repo and named in the ledger.
- **OR11** `landing.html` fires `ga("signup_error",{reason:"rate_limited"})` on a 429 and `ga("signup_quiet")` when the
  response says `quiet:true`. No change to the POST body, the Pixel, or any server file. The ads readout adds the daily
  Klaviyo-versus-Meta Lead gap and the Netlify log count of `sign-up quiet` and `rate limited`.
- **OR12** L2 preloads are inserted by the small script only, from the same table the big script uses to pick the hero
  image. Each preload's `href`, `as="image"`, `type` and `crossorigin` state match the later use exactly; after L4 it also
  carries `imagesrcset` and `imagesizes`. The harness asserts status 200 and `image/webp` for each preload, one preload per
  hero image, none for other variants, and no "preloaded but not used" console warning.
- **OR13** Every harness run routes `POST /api/season-one` (and any `/api/*` write) to an abort, logs the attempt, and exits 3
  if one occurs. The journey types `a` into the email field and never presses Enter.
- **OR14** Clarity JS error counts in the review guide separate the Facebook bridge message ("error invoking postmessage:
  java object is gone") from first-party errors, so a real script error is visible against the 94% noise.
- **OR15** Dev test sign-ups: a Netlify env readout (CAPI test flag and code, Klaviyo key present, `DATABASE_URL` host) is
  recorded before the first sign-up; no more than 9 new sign-ups per IP per clock hour; each write has a row in
  `06-cleanup-ledger.md` as in the table in section 1.
- **OR16** A daily scheduled check (steps 1 to 4 in section 6) is created after Jamie's OK and run once right after the main
  push; its first result goes in the review guide under "After the push".
