# 01 Requirements: Season 01 landing page, field-faithful stability and load speed

Fable, 2026-11-09 10:25 CT. Brief: `00-brief.md`. Field evidence: `00-phase0-field-truth.md`.
Every requirement has an ID; the Auditor's ledger (`04-evidence-ledger.md`) needs a row per ID.
Scout's map (`scout/codebase-map.md`) may correct line numbers below; the behavior stands.

## A. The harness (owner Chronos; the regression gate for this and future runs)

- **H1** `scripts/field-vitals/` exists in the repo with `npm run vitals -- --target <url|local> --ads d18,d19,…`
  and a README (how to run, what each column means, how to add a profile). Node 22+, Playwright.
- **H2** Profiles, each a named preset: `fb-android` (Facebook in-app WebView UA with `FB_IAB/FB4A`,
  412x915 @2.625 and 360x780 @3), `ig-android` (Instagram Android UA), `chrome-android`, `iphone-safari`
  (WebKit if installed here, else recorded as a human check). CPU 4x via CDP, network Slow 4G
  (1.6 Mbps / 150 ms) and `mid` (10 Mbps / 40 ms). Every run uses a fresh browser context with an
  empty HTTP cache and no font cache.
- **H3** Journey per run: load, wait 10 s; scroll in viewport-height steps (700 ms pause each) to the
  bottom; tap the hero answer on interactive heroes; focus the email field and type `a` (never submit);
  scroll back to top. Each step is timestamped in the output.
- **H4** Measures: every `layout-shift` entry with `sources` (CSS path of each node, previous and
  current rects), `hadRecentInput`, time; CLS (session windows, 1 s gap / 5 s cap, the CWV
  definition) and total shift (Clarity-style sum); LCP element (selector, url if image) and time;
  INP; long tasks; `document.fonts` load timing; resource timing for every image and font.
- **H5** Output: `evidence/vitals/<label>/<profile>/<ad>.json` plus one markdown table per label with
  median and max over N runs (N >= 3 for lab, N >= 1 for live).
- **H6** Analytics fail-closed: request routing blocks `*.google-analytics.com`,
  `*.googletagmanager.com`, `*.clarity.ms`, `connect.facebook.net`, `www.facebook.com/tr`,
  `*.doubleclick.net`; every blocked request is logged; the run aborts if any of those hosts
  received a request. The ledger shows the blocked-request log for the live runs.
- **H7 Proof of faithfulness (gate for every other H and S number).** At commit `a919b25` built
  locally, under `fb-android` Slow 4G, d18 and d19 each show CLS >= 0.25 in at least 2 of 3 runs and
  the shift sources are named. On main (45dfe97) the same runs show CLS < 0.1. If the harness cannot
  reproduce the pre-fix field value, Chronos reports what it tried and the run escalates to Fable;
  the harness is not used as evidence until it does.
- **H8** Live runs: the harness runs against `https://ekuzo.gg/season1?ad=…` for d18, d19, d2, d4,
  d21 under `fb-android` and `chrome-android` (tags blocked per H6) and the numbers go in the ledger.

## B. Layout stability (owner Atlas; Sentry proves on the dev deploy)

- **S1** Under every H2 profile and both networks, CLS < 0.1 on d1…d21 and `noad`, lab (local
  build of the branch) and on the dev deploy. Session-window CLS is the gate; total shift is reported.
- **S2** Every hero photo (`img.ph`, `img.jb`, `.pair img`, `.ih-bg`, `.frame img`) has reserved
  space before it loads: intrinsic `width`/`height` or an `aspect-ratio` on its box, so a late image
  cannot move anything. Verified by a DOM check in the harness (no `img` without reserved size inside
  `#hero`/`#ihero`) and by a run with images blocked (CLS still < 0.1).
- **S3** Font swap does not move content below the hero: the hero's reserved box holds while the
  display font loads (`fitHero` runs after `document.fonts.ready` as today) and the harness shows no
  shift attributed to text nodes in `#hero`/`#ihero` after first paint, or a shift < 0.01.
- **S4** Nothing below the fold shifts during the H3 scroll journey: sticky bar, Text Karlin card,
  FAQ accordion (closed state), footer. Accordion opening is user-initiated and excluded by
  `hadRecentInput`; the harness records it as such.
- **S5** Page A (`pa`) and interactive-hero (`pre-ih`) reserved boxes stay as shipped on Nov 5 unless
  Atlas shows a measured reason to change them; any change is logged as a spec change.

## C. Load speed on in-app browsers (owner Atlas; Sentry proves)

- **L1** LCP < 2.5 s at median and < 4.0 s at max over 3 runs under `fb-android` Slow 4G on d18 and
  d19 (lab, local build), and LCP improves against main by a measured margin on every photo-hero
  variant. Live LCP recorded post-deploy for the review guide.
- **L2** The hero image for the chosen ad is discoverable before the big script runs: the small
  script (line ~899) adds `<link rel="preload" as="image" fetchpriority="high">` for that ad's hero
  photo(s) (and only those), or the markup is otherwise reachable by the preload scanner. The harness
  resource timing shows the hero image request starting before the big script's first long task.
- **L3** Fonts: only the font families the chosen ad uses are requested at high priority; the
  all-families Google Fonts stylesheet (16 families today) stops blocking first paint (async load
  or per-ad request built by the small script), with `display=swap` behavior preserved so the
  rendered type is unchanged once loaded. Measured: first paint earlier than main under Slow 4G;
  no new shift (S3).
- **L4** Hero images are sized for phones: the `fb-android` run downloads no hero image wider than
  2x the rendered width (srcset/sizes or per-breakpoint files), and every hero image is WebP or AVIF.
  Report bytes per variant before and after.
- **L5** The big inline script's first long task starts earlier or is shorter than on main under
  CPU 4x (report both); no functional change to its behavior.
- **L6** INP: the hero answer tap and email focus each complete under 200 ms at median under
  `fb-android` CPU 4x (report; fix only if a cheap cause is found, else record as a finding).

## D. Measurement (unchanged, proven)

- **M1** The landing page's measurement row holds exactly as on main: GA4 `page_view`, `hero_view`,
  `hero_answer`, `hero_skip`, `form_start` (click only), `generate_lead`, `cta_click`, `faq_open`,
  `text_karlin_start/submit`, `signup_error`; Pixel `Lead` with shared `event_id` and the CAPI pair;
  Clarity loaded with input masking; attribution (`ad`, UTMs, `fbclid`→`fbc`, `fbp`, last-click
  cookie) captured onto the Klaviyo profile. Sentry proves the event list fires identically on the
  branch (local, tags blocked, beacons intercepted and listed) and that live tags load only on
  ekuzo.gg hosts (QA gate on dev).
- **M2** No kid data in URLs, GA4 or Meta payloads (unchanged; proven by the beacon log).
- **M3** The new preload/font/script changes send no request to any new third-party host.

## E. Non-regression

- **N1** Visual parity, declared relationship **clone**: screenshots of every `?ad=` variant and `noad`
  at 360, 412 and 1440 wide, main vs branch, after fonts and images load, pixel-diffed; differences
  only in anti-aliasing noise (< 0.1% pixels). Steward judges PASS/FAIL.
- **N2** All existing tests pass (`npm test`, `npm run test:s1`) with output in the ledger; the one
  pre-existing failure, if any, is identical on main and named.
- **N3** `npm run build` clean; `tsc` clean; browser console free of our errors on every variant
  (browser-truth gate), third-party noise listed separately.
- **N4** Protected surfaces unchanged (`git diff --stat origin/main -- <protected paths>` empty) except
  an approved money hotfix, which ships as its own commit first.
- **N5** Desktop (>= 960) unchanged in behavior; all new CSS is inside the existing phone media query
  or is behavior-neutral (preload links, font loading).
- **N6** Redirects, `noindex`, canonical and the `?s1qa=1` gate on the landing page unchanged; proven
  with `curl -sI` on the dev deploy.

## F. Evaluation (owner: the three lenses; Fable ranks)

- **E1** `redteam-money.md`: the shipped waitlist and checkout paths read end to end; findings ranked by
  money and sign-ups; live defects marked with confidence.
- **E2** `redteam-users.md`: users, trust and privacy over the same paths plus this spec.
- **E3** `redteam-ops.md`: operations and failure over the same paths plus this spec (webhook
  failure, outbox, rate limits on carrier NAT, in-app browser quirks, deploy path).
- **E4** Fable's `06-findings-ranked.md`: one table, ranked by effect on sign-ups and money, each row
  with type, owner, "now / this week / not now", and the evidence path. Items that change sign-ups or
  payments are the only questions for Jamie.

## G. Journeys this build must survive (Sentry turns each into a test)

- J1 Ad tap in the Facebook Android in-app browser lands on `/season1?ad=d18&utm_…&fbclid=…`, reads,
  scrolls, types an email, submits (test address, dev deploy only), reaches `/season1/thanks`.
- J2 Same as J1 on d19 in the Instagram in-app browser.
- J3 Ad tap, then a second visit in a new session (cold cache again): same numbers (no warm-cache
  dependence).
- J4 Landing page opened with no `?ad=` (`noad`) and with an unknown `?ad=zz`.
- J5 Landing page with `?hero=games` and `?ad=d10` (random split): both heroes reserved.
- J6 Landing page, then "Join" or "Text Karlin" link out: destination loads and matches what the
  landing page promised (Parent follows the link; findings outside scope go to the review guide as
  site state).
- J7 Return from Stripe on `/season1/join/*` in the in-app browser (money lens documents; Sentry
  tests on the dev deploy in QA mode if a safe path exists, otherwise human checklist).

## H. Must-not cases

- X1 Preloading the hero must not fetch images for other variants (one preload per hero image, only
  for the chosen ad).
- X2 Font changes must not change the rendered typeface, weight or metrics once loaded (N1 proves).
- X3 Async font loading must not leave the fallback font visible after `document.fonts.ready` on a
  fast network (no `optional`; swap behavior preserved).
- X4 No GA4, Pixel or Clarity hit from any lab run (H6).
- X5 No new request on load to any host not already contacted on main (M3).
- X6 The `pa` and `pre-ih` logic must not reserve a box for desktop widths.
- X7 `form_start` must still fire only on a real click, never on scroll, autofill or focus (M1).
- X8 Nothing in this build changes the waitlist POST body or the Klaviyo event payload (N4).

## I. Process gates (build-loop.md)

- P1 Auditor sign-off on this file (completeness, testability, journeys and must-nots present).
- P2 Three red-team lenses on the spec before freeze; Fable resolves each finding in `03-decision-log.md`.
- P3 Screenshots exist before Parent or Steward spawn; test output in the ledger; one results file per
  parallel lane; Auditor merges.
- P4 Servers by PID; guard hook present before phase 4.
- P5 Terminal artifacts embed `git status --porcelain` and `git log --oneline -3`.
- P6 Live means live on ekuzo.gg: the review guide says "pending Jamie's push" until a curl of
  ekuzo.gg shows a string this build adds.
