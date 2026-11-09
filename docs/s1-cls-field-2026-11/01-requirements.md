# 01 Requirements: Season 01 landing page, field-faithful stability and load speed

Fable, 2026-11-09. v1 10:25 CT; v2 11:05 CT after Scout (`scout/codebase-map.md`) and the Auditor
(`auditor-phase1.md`, SIGN-OFF WITH CHANGES, all thirteen applied). Brief: `00-brief.md`. Field
evidence: `00-phase0-field-truth.md` (corrected). Every requirement has an ID; the ledger
(`04-evidence-ledger.md`) carries a row per ID. Section names no longer collide with ID prefixes.

## Scope statement

Stability on the landing page is closed in the field (0 poor-CLS sessions of 185 scored, Nov 6 to 9)
by two Nov 5 releases (`0fc8ad1` page A box; `d46c5c0` interactive-hero box). This run (1) builds the
regression harness and proves it on the true pre-fix page `3433a5b`, (2) covers the residual
stability risks Scout named, (3) makes the page load faster on the in-app browsers without any
visible change, (4) evaluates the ads and payment system. Pixel parity rules everything else.

## Protected surfaces (R-PROT)

Zero diff against origin/main (45dfe97): `app/api/season-one/route.ts`, `app/api/checkout/**`,
`app/api/webhooks/stripe/route.ts`, `lib/season1/**` (including `tags.ts`), `app/season1/join/**`,
`app/season1/thanks/**`, `app/season1/crew/**`, `app/season1/early-access/**`. Exception: a money
hotfix on its own commit, approved by Fable in the decision log, with a unit test that fails before
and passes after. Exception: additive, behavior-neutral harness hooks listed by name in the frozen spec.

`app/season1/landing.html` may change in these regions only: the document head (preload and font
links), the small inline script (line 899 block), CSS inside the existing phone media query, the
loader around the big script, and attribute additions on template `<img>` elements that the frozen
spec lists. It must not change any text node, any ad template string other than listed attributes,
`AD_HERO`, `T`, `IMG` paths, or any event call. Proof (N4): a script extracts the template and copy
regions from main and the branch, strips the listed attributes, and the two hashes are equal.

## Visual relationship (R-VIS): clone

Reference artifact: the build of origin/main 45dfe97 served locally on port 3101, captured with the
same harness, profile and fonts. Allowed visible deltas: none. Everything that renders at 360, 412
and 1440 wide in every N1 state must match.

## Run classes (R-RUNCLASS)

**Class T (tags blocked):** all lab and live performance runs. Chromium starts with
`--host-resolver-rules` mapping `*.google-analytics.com`, `*.googletagmanager.com`, `*.clarity.ms`,
`connect.facebook.net`, `www.facebook.com` and `*.doubleclick.net` to `~NOTFOUND`, and the context
also routes them to a local null responder that logs each attempt. `?s1qa` absent. On ekuzo.gg the
attempt log must be non-empty for each host (positive control that tags would have loaded); on
localhost and dev the page loads no tags by design, so the log is expected empty and the test is that
nothing reached the network. **Class Q (QA beacons):** measurement proof only. `?s1qa=1` present,
every collect request fulfilled locally, never forwarded, recorded with URL, query and body. Class Q
never targets ekuzo.gg. No run is both.

## Harness (H)

- **H1** `scripts/field-vitals/` in the repo with `npm run vitals -- --target <url|local:PORT> --ads d18,d19,…
  --profile <name> --runs N --label <name>` and a README (run, columns, adding a profile, the
  one-line Playwright install for a Mac). Node 22+. Playwright resolves through `createRequire` from
  the global install here and from a devDependency-free `npx playwright` on a Mac; `playwright` is
  not added to `package.json` unless Fable approves it in the decision log.
- **H2a Profiles:** `fb-android` (UA with `FB_IAB/FB4A`, 412x915 @2.625 and 360x780 @3, `isMobile`,
  `hasTouch`), `ig-android` (Instagram Android UA), `chrome-android`. Each run's JSON records UA,
  viewport, DPR, CPU rate and the CDP network-condition return values. **H2b Throttling:** CPU 4x
  via `Emulation.setCPUThrottlingRate`; network `slow4g` (1.6 Mbps down, 0.75 up, 150 ms) and `mid`
  (10 Mbps, 40 ms) via `Network.emulateNetworkConditions`; unthrottled round trip recorded as a
  control. Fresh context, empty HTTP cache, no font cache, per run. **H2c iPhone:** WebKit is not
  installed here and has no `layout-shift` API; the iPhone profile is HC3, recorded as a human check.
- **H3 Journey:** load, wait 10 s; scroll in viewport-height steps with touch gestures
  (`Input.synthesizeScrollGesture`), 700 ms pauses, to the bottom; one scroll gesture starts on each
  of the hero answer (interactive heroes), the email field, a FAQ summary, a call-to-action; tap the
  hero answer; focus the email field and type `a` (never submit on ekuzo.gg); toolbar-collapse step:
  the layout viewport height shrinks by 56 px then 110 px during the first scroll and restores on
  scroll up (Android WebView bars), with `visualViewport` and `100svh` recorded; scroll back to top.
  Optional `--fontScale 1.3`. Each step timestamped in the output.
- **H4a Shifts:** every `layout-shift` entry with `sources` (CSS path, previous and current rects),
  `hadRecentInput`, time; CLS as session windows (1 s gap, 5 s cap) and as total sum, each with and
  without `hadRecentInput` entries. A unit test feeds a fixed entry list to the CLS function and
  asserts the windowed result. **H4b Paint and input:** LCP element (selector, URL) and time with all
  candidates listed, INP, long tasks (start, duration, attribution). **H4c Loading:** `document.fonts`
  load timing per face, resource timing for every image, font and stylesheet (start, end,
  `encodedBodySize`, priority where available), first paint.
- **H5 Output:** `evidence/vitals/<label>/<profile>/<ad>-run<N>.json` plus one markdown table per label
  (median and max over N; N >= 5 for gates, N >= 3 for Tier 2, N >= 1 live). Raw JSON is gitignored
  except the H7, H9 and final-gate labels; tables are committed.
- **H6 Fail-closed analytics:** as R-RUNCLASS. The run writes `blocked.json` (host, URL, time,
  initiator) and fails if any listed host completes a connection (checked from
  `Network.requestWillBeSent`/`loadingFinished` filtered to those hosts). The ledger links
  `blocked.json` for every live run.
- **H7 Proof of faithfulness (gate for every lab number):** at commit `3433a5b` built locally (port
  3102), under `fb-android` 412 `slow4g`, d18 and d19 each show windowed CLS >= 0.25 in at least 3 of
  5 runs with the sources named (`section#join-top`, `section.how` expected); on main (port 3101) the
  same runs show < 0.1. **H7b Fallback ladder** if the first pass does not reproduce, each attempt a
  row in `evidence/vitals/h7-ladder.md`: (1) toolbar collapse on, (2) CPU 6x, (3) 400 Kbps / 400 ms,
  (4) cold fonts plus a 2-connection limit, (5) 360x640 and 412x700 short viewports. If all fail,
  every lab number is labeled "unvalidated against the field" in the ledger and the review guide,
  and the S and L gates rest on live runs (H8) and HC1.
- **H8 Live runs:** Class T against `https://ekuzo.gg/season1?ad=` d18, d19, d2, d4, d21 under
  `fb-android` 412 and `chrome-android`, N = 3, before and after the main push; numbers in the ledger
  with the non-empty blocked log.
- **H9 Main baseline:** before any edit to `landing.html`, the Tier 1 profile set (Class T) runs
  against a local build of origin/main on port 3101, N = 5, under `evidence/vitals/main-baseline/`.
  L1, L3b, L5 and N1 compare to this label.

## Stability (S)

- **S1 Tiers.** Tier 1 (gate): d18, d19, d2, `noad` under `fb-android` 412 and 360 and `ig-android`
  412, `slow4g`, N = 5, lab (S1a) and dev deploy (S1b). Tier 2: every other `d` variant under
  `fb-android` 412 `slow4g`, N = 3 lab, N = 1 dev. Tier 3: `mid` and `chrome-android` for Tier 1
  variants, N = 3. Pass: windowed CLS < 0.1 at median and max per cell. The ledger states which tiers
  ran when the run stopped.
- **S1c Images blocked:** Tier 1 variants with every image request aborted; CLS < 0.1 (shared with S2).
- **S2** Inside `#hero` and `#ihero`, every `img` (`.ph`, `.jb`, `.pol img`, `.half img`, `.pair img`,
  `[data-bg]`, `.frame img`, `.ih-bg`) has intrinsic `width`/`height` or sits in a box with explicit
  height or `aspect-ratio` at 360, 412 and 959 wide, and every `background-image` element likewise.
  Proof: the harness DOM check lists offenders (expected none after the build); S1c passes; attribute
  additions listed in the frozen spec (R-PROT).
- **S3** Font swap moves nothing below the hero: no shift attributed to text nodes in `#hero`/`#ihero`
  after first paint above 0.01, and no `section.join`/`section.how` source during a 3 s delayed
  `fonts.gstatic.com` run (harness `--fontDelay 3000`).
- **S4** During the H3 journey, no shift source outside the hero above 0.01 from `header`,
  `svg.mark`, `#sticky`, `.faq`, `footer`; accordion entries show `hadRecentInput`. The `.solid`
  header transition (padding and width, `.25s`) is measured across three 0-40-0 px scroll crossings and
  reported; if it emits entries, Atlas may convert it to `transform`/`scale` only if N1 holds.
- **S5** The `pa` and `pre-ih` rules stay as shipped Nov 5 unless Atlas shows a measured reason;
  any change is a logged spec change. The ~5 px step at page A injection (Scout § 2 item 5) is
  measured at 360, 390 and 412 and fixed only if a box mismatch is found and N1 holds.

## Load speed (L)

- **L1** After H9, LCP for d18, d19 and every photo-hero variant under `fb-android` 412 `slow4g` CPU 4x,
  N = 5. Pass: branch median lower than the main-baseline median by at least 150 ms or 10%, whichever is
  larger, on every photo-hero variant, and no variant's max over 4.0 s where main's was not. The
  2.5 s median for d18 and d19 is recorded as an aspiration until the baseline shows it reachable.
  Live LCP recorded after deploy.
- **L2** The chosen ad's hero image is discoverable before the big script runs: the small script
  appends `<link rel="preload" as="image" fetchpriority="high">` for that ad's hero photo(s) and only
  those (server-side is impossible: the route is `force-static`). Proof: head DOM after the small
  script holds exactly the expected links; resource timing shows the hero image request starting
  before the Google Fonts CSS finishes and before the big script's first long task.
- **L3a Fonts requested:** only the families the chosen ad uses are requested at high priority (d18:
  Inter Tight 500/700/800, JetBrains Mono 700; d19 to d21 add Rubik 500/900); the all-families
  Google Fonts stylesheet (14 families, placed inside `<body>`) stops blocking the parser (async load
  with `display=swap` preserved, or a per-ad stylesheet built by the small script, with the full
  stylesheet still loading afterwards so every template keeps its face). **L3b Paint:** first paint
  earlier than the H9 baseline median by at least 100 ms under `slow4g`; no new shift (S3); X3 holds.
- **L4** For each hero image request under `fb-android` 412 @2.625, the ledger lists
  `encodedBodySize`, `naturalWidth` and rendered CSS width x DPR, main vs branch. Smaller variants
  (for example `team-walk-900.webp`, which exists unused) are applied only where N1 passes for that ad;
  others stay as on main with the reason recorded. Every hero image is WebP or AVIF (already true).
- **L5** First long task of the big inline script under CPU 4x: start and duration reported for main
  and branch, N = 5. Pass: branch start not later and duration not longer than the main median by more
  than 20 ms; improvement reported, not required.
- **L6** INP for the hero answer tap and email focus under `fb-android` CPU 4x, report only.
- **L7** The hidden Text Karlin avatar (`img.tk-av` inside `#conf[hidden]`) no longer loads before the
  hero (lazy or deferred until `showDone`), proven by resource timing; its `onerror` fallback behavior
  unchanged.

## Measurement (M)

| Page | Layout | GA4 (G-8LM45PX53W) | Meta | Clarity (wml8wll5ua) | Attribution | Destination |
|---|---|---|---|---|---|---|
| `/season1` and `?ad=…`, `app/season1/route.ts` from `landing.html` | Route-handler HTML; bypasses the shared layout and inherits nothing; every tag from `lib/season1/tags.ts`; tags load on ekuzo.gg only, or any host with `?s1qa=1` | `page_view`, `hero_view`, `hero_answer`, `hero_skip`, `form_start` (click only), `generate_lead`, `cta_click`, `faq_open`, `text_karlin_start`, `text_karlin_submit`, `signup_error`; campaign parameters survive into `page_location` | Pixel `PageView`, `Lead` with `event_id`; the waitlist API sends the CAPI event with the same `event_id`; `Purchase`/`InitiateCheckout` become `S1QA_` in QA | every variant, inputs masked by default | `ad`, UTMs, `fbclid`→`fbc`, `fbp`, last-click cookie, first-touch origin onto the Klaviyo profile and lead record | GA4 property, Pixel 1284038230557204 and CAPI, Clarity project, Klaviyo, database per `docs/season-one-tracking.md` (Relay confirms) |

Unchanged pages with no measurement change: `/season1/join*`, `/season1/thanks`, `/season1/crew*`.

- **M1a** Class Q beacon lists for J1, J2, J4, J5 on main (3101) and branch (3100) are equal after
  removing timestamps and ids. **M1b** Attribution fields in the waitlist POST body equal main's.
  **M1c** `event_id` equality between the browser `Lead` and the body the API forwards, shown on the
  dev deploy (Class Q) or by the existing tests. **M1d** Clarity masking attribute present on the email
  and phone inputs (DOM check). **M1e** Destinations confirmed by Relay from `season-one-tracking.md`.
  Test Events and DebugView confirmation is HC4.
- **M2** No kid data in URLs, GA4 or Meta payloads (beacon and URL grep with the J1 test identity).
- **M3** The host set of all requests on load, branch minus main, is empty (covers former X5).

## Non-regression (N)

- **N1a Pixel diff:** for each of d1…d21 and `noad`, at 360x780, 412x915 and 1440x900, and for each
  state (initial after fonts ready and images decoded; hero answer tapped on interactive heroes;
  email focused with one character; FAQ first item open; error state after an invalid submit stubbed
  locally), full-page screenshots on main (3101) and branch (3100) with the same Chromium,
  `prefers-reduced-motion`, a CSS animation freeze applied to both, `Math.random` stubbed, clock
  fixed, after `document.fonts.ready`. Decode with `sharp` (present in node_modules); count pixels
  whose channel difference exceeds 8 of 255. Pass: under 0.1% of pixels per screenshot and no
  connected region over 12 x 12 px. **N1b Steward verdict:** PASS/FAIL against the clone declaration
  for every pair over threshold and for the key-state pairs on d18, d19 and d2 at 412 and 1440. FAIL
  is a MAJOR defect owned by Atlas. PNGs in `screenshots/` as `{ad}-{viewport}-{state}-{main|branch}.png`.
  (Covers former X2.)
- **N2** `npm test` and `npm run test:s1` run on main first (baseline, env-dependent failures
  recorded) and on the branch; outputs in the ledger; no new failure.
- **N3** `npm run build` and `tsc --noEmit` clean; browser console free of our errors on every variant
  (browser-truth gate), one ledger row per variant; third-party noise listed separately.
- **N4** Protected-surface hash rule from R-PROT holds; `git diff --stat origin/main -- <R-PROT paths>`
  empty except an approved hotfix commit. Waitlist POST body from J1 on main vs branch equal (former X8).
- **N5** Desktop (>= 960) unchanged: computed `#hero` height and screenshots at 960, 1024 and 1440 equal
  main; all new CSS inside the phone media query or behavior-neutral (covers former X6).
- **N6** Redirects, `noindex`, canonical and the `?s1qa=1` gate unchanged; `curl -sI` on the dev deploy
  for `/season1`, `/season1?ad=d18`, `/season1?s1qa=1` compared with main.
- **N7** Accessibility tree (role, name, focus order) of d18, d19, d2 at 412 equals main.
- **N8** At 959 wide the reserved hero box is present and at 960 absent, on main and branch alike.

## Evaluation (E)

- **E1** `redteam-money.md`, **E2** `redteam-users.md`, **E3** `redteam-ops.md`: each serves as the spec
  red team (first pass, before freeze) and the evaluation (same file, findings ranked). Structure
  check by the Auditor (finding table with id, severity, type, effect, file:line or command,
  proposal, who acts); ranking judged by Fable; Jamie is the only reviewer of the ranking.
- **E4** `06-findings-ranked.md` (Fable): one table ranked by effect on sign-ups and money, each row with
  type, owner, now / this week / not now, and an evidence path that exists. Items that change sign-ups or
  payments are the only questions for Jamie. A money hotfix is one commit with its failing-then-passing
  test; Stripe test-mode proof only after the webhook endpoint list (HC5); without Stripe access,
  money findings carry "code-read" confidence.

## Journeys (J)

- **J1** Facebook Android in-app arrival on `/season1?ad=d18&utm_…&fbclid=…`: read, scroll, type,
  submit a disposable `team+cls-1109-<n>@ekuzo.gg` (dev deploy only, Class Q), reach `/season1/thanks`.
- **J2** Same on d19 in the Instagram in-app profile (two hero images).
- **J3** Second cold-cache visit: CLS within 0.01 and LCP within the harness noise band of the first.
- **J4** `noad` and `?ad=zz`: behavior captured from main and asserted equal on the branch.
- **J5** `?hero=games` and `?ad=d10` with `Math.random` stubbed to each outcome: both heroes reserved.
- **J6** Landing to "Join" and "Text Karlin" destinations: Parent follows the links and reports whether
  the destination matches what the landing promised; out-of-scope findings go to the review guide as
  site state.
- **J7** Return from Stripe on `/season1/join/*` in an in-app browser: HC5 unless Relay's pre-flight
  lists the Stripe test webhook endpoints and a safe test-mode path exists.
- **J8** Scroll with toolbar collapse on `fb-android`, d18 and d19: CLS < 0.1, reserved box does not jump.
- **J9** Return visit on the same profile with the last-click cookie and no `?ad=`: attribution on a
  submit equals the first visit's `ad` (Class Q, local).
- **J10** In-app navigation: tap a program link and press back; background the page (visibility hidden,
  then visible): no duplicate `page_view`, no `fitHero` shift, no lost `ad`.
- **J11** Landing to `/season1/join` to jersey: `ad`, UTMs and the last-click cookie reach each page
  unchanged (join pages untouched; proves the landing change did not stop passing them).

## Must-not cases (X)

- **X1** Preloading fetches no image for other variants: one preload set per ad, only the chosen ad's.
- **X3** After `document.fonts.ready` on a fast network, `document.fonts.check` is true for each family
  the ad uses and computed `font-family` is unchanged (no `optional`; swap preserved).
- **X4** No GA4, Pixel or Clarity hit from any lab run (proved by H6).
- **X7** `form_start` fires only on a real click: never on scroll (gesture starting on the field),
  autofill, programmatic focus, script-set value, paste, or a retry.
- **X9** `hero_view` does not fire before the hero is on screen, twice on bfcache restore, or on a
  toolbar-collapse resize.
- **X10** `hero_answer`/`hero_skip` do not fire from a scroll gesture starting on the answer,
  programmatic focus or a script-set value; once per tap.
- **X11** `generate_lead` and Pixel `Lead` do not fire on a failed submit, a 429, a double tap or a
  retry after a network error; a retry after success reuses the same `event_id`.
- **X12** `cta_click`, `text_karlin_start`, `faq_open` do not fire on a scroll gesture starting on them
  or on keyboard focus alone (`faq_open` once, when the accordion opens).
- **X13** `signup_error` does not fire on load, on blur of an empty field before any submit, or on autofill.
- **X14** Every event above is tested with tap, typing, paste, autofill (value set without a trusted
  event), programmatic `focus()`, a scroll gesture starting on the element, and a retry.
- **X15** Preload, font links and any new script do not change `ad`, UTM or `fbclid` capture order:
  capture completes before the first tag call.
- **X16** No hotfix, hook or test touches production data except the disposable sign-ups in the
  cleanup ledger.
- **X17** The small script's new work is wrapped so a failure still sets `pa`/`pre-ih` as today
  (fallback render unchanged); a 404 on a preloaded image or an unreachable Google Fonts host leaves
  the page rendering as main does.

## Human checkpoints (HC)

- **HC1** Jamie, Samsung S25, Instagram in-app browser, `d19` link, cold start: hero photos in place
  before scroll, no jump while scrolling to the bottom, FAQ and email field behave, no blank gap above
  the hero. Screenshot or screen recording.
- **HC2** Jamie, S25, Facebook in-app browser if available, same list, `d18`.
- **HC3** Aaron, iPhone Safari and the iPhone Instagram browser, `d18`, `d19`, `d2`.
- **HC4** Jamie or Relay: Meta Events Manager Test Events and GA4 DebugView, one `?s1qa=1` session on
  the dev deploy: `Lead` once with matching browser and server `event_id`; GA4 list matches the M table.
- **HC5** Return from Stripe on `/season1/join/*` in an in-app browser (J7) unless covered by test mode;
  Stripe test-mode webhook endpoints listed before any test payment.
- Release to main waits for HC1 and HC3 (HC3 can follow the push if Aaron is unavailable tonight;
  Fable records which). P6 stays "pending Jamie's push" until ekuzo.gg serves the build.

## Deploy, rollback, hygiene (D)

- **D1** `dev` carries the branch through the documented integration merge (`scout/codebase-map.md`
  § 5); `curl -s` of the landing page on dev equals the local branch build after the `{{URL_ALLOW}}`
  and `{{TAGS}}` fill (hash).
- **D2** Candidates for main are `git log origin/main..build/s1-cls-field` only; `git diff origin/main
  <ship-ref> --stat` touches no blog or roadshow file; the integration merge commit is never a
  candidate. Each slice is one revertable commit; the review guide lists the revert command.
- **D3** Ports: branch 3100, main 3101, `3433a5b` 3102, each started with
  `npx next start -p <port> > server-<port>.log 2>&1 & echo $! > .server-<port>.pid` and stopped with
  `kill "$(cat .server-<port>.pid)"`. After each lane and after any cancelled agent, the ledger records
  `ss -ltnp` showing no leftover listeners and no orphan Chromium.
- **D4** `06-cleanup-ledger.md`: a row for every test write (email, Klaviyo profile id, deletion or
  suppression result); if none happened, the file says so.

## Process gates (P)

- **P1** Auditor sign-off on this file (done: SIGN-OFF WITH CHANGES, applied in v2).
- **P2** Three red-team lenses before freeze; Fable resolves each finding in `03-decision-log.md`.
- **P3** `screenshots/` non-empty before Parent or Steward spawn; test output in the ledger; one results
  file per parallel lane; Auditor merges.
- **P4a** Guard script copied to `scripts/guard-pattern-kill.sh` and registered in a new, committed
  `.claude/settings.json` before phase 4 (the ledger holds the `grep`). **P4b** Server hygiene per D3.
- **P5** Terminal artifacts embed `git status --porcelain` and `git log --oneline -3`.
- **P6** Live means live on ekuzo.gg: the review guide says "pending Jamie's push" until a curl of
  ekuzo.gg shows a string this build adds and `git ls-remote origin refs/heads/main` matches.
- Attack-with-proof: not applicable (no accounts, roles, codes or uploads added).
