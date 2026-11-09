# Auditor phase 1 review of 01-requirements.md

Auditor, 2026-11-09. Inputs read: build-loop.md (full), anti-ai-writing.md, 00-brief.md,
00-phase0-field-truth.md, 01-requirements.md (the 10:25 CT version, 11,124 bytes). I read repo files
(landing.html, tags.ts, package.json, git history, /opt/pw-browsers) to check claims. I ran no
servers and no tests.

## Verdict: SIGN-OFF WITH CHANGES

The file is well built: 53 IDs, journeys and must-not cases exist, the loop's mechanical gates are
mostly present, and most requirements can be proven by a script. It is not blocked. It cannot freeze
until the thirteen changes below land, because five of them are contradictions that would turn into
false defects or unprovable gates in phase 4, and the rest are required sections the loop names.

Changes needed before freeze (details in the sections that follow):

1. **C1 Protected surfaces section is missing from 01.** N4 says `<protected paths>` and the brief
   protects "all ad copy and hero templates in landing.html", but this build edits landing.html and
   S2 asks for `width`/`height` attributes inside those templates. Contradiction. Paste-ready R-PROT below.
2. **C2 Tag loading contradicts itself.** H6 and X4 want tags blocked and `?s1qa=1` absent. M1 needs
   the events to fire, which on any host except ekuzo.gg happens only with `?s1qa=1` (tags.ts: other
   hosts render only the QA gate). Define two run classes. Paste-ready R-RUNCLASS below.
3. **C3 Measurement row is prose, not a row.** The loop wants GA4, Meta with event_id, Clarity,
   attribution and destination for the page, and says plainly that a route handler serving HTML
   inherits nothing. Also the loop's proof (Meta Test Events, GA4 DebugView) is not reachable from
   here. Paste-ready MEAS table and HC items below.
4. **C4 Touch-scroll case and per-event must-nots are incomplete.** Only `form_start` has a must-not.
   The loop requires a scroll gesture that starts on the element for every interaction-keyed event.
   H3 scrolls but does not say the scroll is a touch gesture. Paste-ready X9 to X15, H3 amendment below.
5. **C5 H3 omits the field's likeliest trigger.** On Android in-app browsers the URL bar and bottom
   bar collapse during a scroll, changing the viewport height. The reserved boxes use `80svh` and
   `aspect-ratio`. A harness with a fixed viewport cannot move them, which is how round 2's harness
   measured 0 against a field 0.70. Add a toolbar-collapse step (J8, H3 amendment).
6. **C6 N1 is under-specified and collides with L3 and L4.** No tolerance basis, no states, no
   determinism rules (animation, random `d10` split, font arrival), no pixel-diff tool, and image
   resampling (L4) cannot keep < 0.1% differing pixels at DPR 2.625 or 3. Paste-ready N1 rewrite below.
7. **C7 L1, L5 have no testable pass line.** L1 sets absolute targets before any main baseline exists
   and "a measured margin" has no value. L5 says "earlier or shorter", which almost any run satisfies.
   N = 3 medians will not separate 100 ms effects from noise. Rewrites below.
8. **C8 S1 matrix does not fit the 20:00 hard stop.** About 22 pages x 4 profiles x 2 viewports x
   2 networks x 3 runs is over 1,000 runs at 30 to 45 s each. Define tiers (below).
9. **C9 Environment facts are absent from the requirements.** WebKit is not installed (only
   chromium-1243 and headless shell under /opt/pw-browsers), and CDP throttling does not exist in
   WebKit anyway. `playwright` resolves only from /opt/npm-tools, not from the repo. There is no
   pixel-diff library in the repo (sharp is present as a Next transitive dependency and can decode
   PNGs). No `.env.local`, so tests that need keys or Postgres will fail here. N2 must have a recorded
   baseline on main. Reachability of dev--ekuzo.netlify.app and ekuzo.gg from this sandbox is
   unverified. Amendments below.
10. **C10 No human checkpoints section.** The brief says release waits on Jamie's phone check, the
    loop's real-device gate and WebKit gap both point to humans, and nothing in 01 names device,
    browser or expected result. Paste-ready HC1 to HC5 below.
11. **C11 Visual relationship is declared only inside N1.** Name the reference artifact (main 45dfe97
    build) and the deltas list (none visible) in its own short section.
12. **C12 Deploy path, cleanup ledger, port plan and rollback are not requirements.** The dev
    integration merge is the only route to a test deploy, and it carries blog and roadshow work that
    must never reach main. Paste-ready D1 to D4 below.
13. **C13 H7 has no fallback.** Round 2 measured 0 on this very page at 375x667. H7 may well fail,
    and the brief's budget triage puts the harness first. Add a pre-registered fallback ladder (H7b).

Two smaller inconsistencies for Fable to fix in passing:

- Phase 0 calls "a919b25 / main 45dfe97" the Round 2 release and says it went live at 11:08 CT.
  git shows a919b25 at 10:52 CT as the last commit before the fix, the landing fix itself is
  d46c5c0 at 11:35 CT, and main 45dfe97 is a docs commit at 12:43 CT. A 11:08 live time precedes the
  commit that carries the fix. The conclusion (every poor session predates it) survives, because the
  latest poor session is Nov 5 07:32, but the file should cite d46c5c0 and say where 11:08 came from.
- Section letters collide with ID prefixes (section H holds X IDs, section A holds H IDs). Rename
  sections to avoid mistakes when the ledger groups by section.

## 1. Testability and gate type per ID

Gate types: M = mechanical (script output, diff, curl), E = eyes-needed (screenshot judged by a
role), M+H = mechanical plus a human checkpoint. "Judge" is given for every E.

| ID | Testable as written? | Proving artifact | Gate | Notes |
|---|---|---|---|---|
| H1 | Yes | `ls scripts/field-vitals/`, `npm run vitals -- --help` output, README section headings grep | M | Say how `--target local` finds a server (PID file path), see D3. |
| H2 | Mostly | Per-run JSON records UA, viewport, DPR, CPU rate, applied network conditions (CDP return values) | M | `iphone-safari` cannot run here: no WebKit. Move to HC3 and make the requirement "recorded as human check" explicit. |
| H3 | Yes after amendment | Step list with timestamps in JSON | M | Needs touch gestures and toolbar collapse (C4, C5). |
| H4 | Yes | JSON keys present; a unit test feeds a fixed `layout-shift` fixture to the CLS function and asserts the session-window result | M | Split (see section 4). Without the fixture test, the CLS maths is self-graded. |
| H5 | Yes | Files exist at the path pattern; table has median and max columns | M | |
| H6 | Needs rewrite | Blocked-request log; host-resolver rule or proxy log showing zero connections | M | See C2. Today it is circular: "abort if a host received a request" while routing already blocks it. |
| H7 | Yes, but may fail | Three-run JSON for a919b25 and 45dfe97, sources named | M | Gate for all others. Needs H7b fallback (C13). |
| H8 | Yes if egress works | JSON under `evidence/vitals/live-*`; blocked log non-empty for each host | M | Reachability unverified. A non-empty blocked log is the positive control that the tags would have loaded. |
| S1 | Yes, too big | Table of CLS per ad x profile x network | M | Tier it (C8). iPhone row cannot be machine-verified. |
| S2 | Mostly | DOM check output; images-blocked run | M | Selector list is incomplete (`.pol img`, `.half img`, `.pair img`, `data-bg` images, CSS backgrounds). Absolutely positioned `img.ph` inside a sized `.art` box cannot shift anything, so check the box, not only the `img`. Also conflicts with protected templates (C1). |
| S3 | Yes | Shift entries filtered to text nodes in `#hero`/`#ihero` after first paint | M | |
| S4 | Yes | Shift sources outside hero during scroll; accordion entries show `hadRecentInput` | M | Say what "sticky bar" is by selector. |
| S5 | Yes | `git diff` of the two CSS rules plus decision-log entry if changed | M | |
| L1 | No | | M | Targets precede a baseline; "measured margin" undefined (C7). |
| L2 | Yes | Head DOM after small script contains exactly the expected `<link rel=preload>`; resource timing `startTime` of hero image < start of first long task | M | One preload set per ad. The page is `force-static`, so server-side per-ad preload is impossible; the script is the only route. Say so. |
| L3 | Mostly | Request list at high priority; paint timing `first-paint` vs main | M | Split into font requests and paint. "Rendered type unchanged" is proven by N1, not here. |
| L4 | Needs rewrite | Resource timing `encodedBodySize`, `naturalWidth` vs rendered CSS width x DPR | M | All hero files under `public/images/season1/` are already `.webp`, so the format half is already true. The width half collides with N1 (C6). Express it in device pixels. |
| L5 | No | | M | "Earlier or shorter" is satisfied by noise (C7). |
| L6 | Yes as a report | INP table | M | Declare it report-only; no pass line, so it never blocks. |
| M1 | Partly | Beacon list per journey, diffed against a golden list captured from main with the same harness | M+H | Meta Test Events and GA4 DebugView proof is not reachable here. CAPI is server-side and needs dev env. See MEAS and HC. Do not hard-code the event list in the requirement; capture it from main and diff. |
| M2 | Yes | Beacon and URL log grep for name/age patterns using the J1 test identity | M | |
| M3 | Yes | Host set of all requests, branch minus main, must be empty | M | Same test as X5. |
| N1 | Needs rewrite | Pixel diff report plus side-by-side PNGs | M + E | Judge: Steward (declared). Mechanical threshold first, Steward only on pairs that exceed it or on key states. |
| N2 | Needs baseline | `npm test` and `npm run test:s1` outputs for main and branch, diffed | M | Env-dependent tests will fail here. Baseline first. |
| N3 | Yes | `npm run build`, `tsc --noEmit` output; per-variant console log | M | Field noise ("java object is gone") is not ours; harness cannot produce it. |
| N4 | Needs list | `git diff --stat origin/main -- <paths>` | M | Paths not enumerated; landing.html cannot be zero-diff (C1). |
| N5 | Yes | Computed-style and screenshot checks at 960, 1280, 1440 | M | Add the 959/960 boundary. |
| N6 | Yes | `curl -sI` for `/season1`, `/season1?ad=d18`, `?s1qa=1` on dev, compared with main | M | Landing is static HTML so little can change; fine as a cheap check. |
| E1 | Structure only | File exists, has finding table with file:line, confidence, evidence type | M for structure, E for quality | Quality judge not declared. Recommend Fable, with Steward spot check of the ranking. |
| E2 | Same as E1 | | M/E | |
| E3 | Same as E1 | | M/E | |
| E4 | Structure only | One table, required columns, every row has an evidence path that exists | M structure, E ranking | Judge: Fable, which is the author. Declare that Jamie is the only reviewer of ranking. |
| J1 | Mostly | Request log ending on `/season1/thanks`; waitlist POST captured | M | Writes to dev's Klaviyo and Meta. See D4 and the unverified claim that dev points at non-production services. Rate limits are per IP and the sandbox shares an IP. |
| J2 | Same | | M | Instagram UA, d19, two hero images. |
| J3 | Needs tolerance | Two-visit comparison | M | "Same numbers" needs a band: CLS equal within 0.01, LCP within the harness noise band. |
| J4 | Yes | `noad` and `?ad=zz` runs | M | State expected behavior for `zz` (renders default hero? same as noad?). Capture from main, assert equal. |
| J5 | Yes | `?hero=games` run; `?ad=d10` with `Math.random` stubbed to both outcomes | M | Without the stub the split is unreproducible. |
| J6 | Yes | Screenshots of landing and destination, Parent's note | E | Judge: Parent (declared in the loop). |
| J7 | Conditional | Test-mode run or human list | M or H | "If a safe path exists" is a decision, not a requirement. Default to H (HC5) unless Relay's pre-flight lists the Stripe test webhook endpoints. |
| X1 | Yes | Image request list per ad | M | |
| X2 | Redundant | N1 | M | Merge into N1. |
| X3 | Yes | After `document.fonts.ready` and settle, `document.fonts.check` true for each family the ad uses; computed `font-family` unchanged | M | |
| X4 | Yes after C2 | Blocked log; zero connections | M | |
| X5 | Duplicate of M3 | | M | Merge. |
| X6 | Yes | Computed height of `#hero` at 960, 1024, 1440 equals main | M | Add 959 positive control (reserved box present). |
| X7 | Incomplete | Touch matrix log | M | Add scroll-starts-on-element, paste, autofill, programmatic focus, retry (loop requires them). |
| X8 | Yes | Waitlist POST body from J1 on main vs branch, diff | M | Merge with N4 or keep as a runtime check; the diff alone does not prove the body. |
| P1 | Yes | This file | M | |
| P2 | Existence only | Three redteam files plus decision-log rows | M | Content quality is Fable's judgment. |
| P3 | Yes | `ls screenshots/` before Parent spawn; ledger rows | M | |
| P4 | Yes | `.claude/settings.json` contains the hook; `.claude/settings.local.json` exists but is the wrong file | M | No `.claude/settings.json` exists in the repo today, and guard-pattern-kill.sh is in the KB only. Someone has to create and commit both. |
| P5 | Yes | Terminal artifacts embed the two command outputs | M | |
| P6 | Yes | `curl` of ekuzo.gg for a string the build adds, plus `git ls-remote origin refs/heads/main` | M | Allowed end state is "pending Jamie's push". Say it. |

Eyes-needed items and declared judges: N1 (Steward), J6 (Parent), E1 to E4 (quality, Fable).
No eyes-needed requirement lacks a judge, but E1 to E4 judge themselves unless you name a second
reader. The visual-parity gate also needs the key-state list (C6).

## 2. Required sections check

| Loop requirement | Present? | Assessment |
|---|---|---|
| Journeys: arrival from real source | Partly (J1, J2) | Arrival is emulated by UA string and `fbclid`. Real in-app WebViews differ (injected bridge, collapsing bars). Say so; HC1 covers the real one. |
| Journeys: page to page | Thin (J6) | Missing landing to `/season1/join` to jersey carrying `ad`, UTMs, last-click cookie. Add J11. |
| Journeys: return visit in new session | J3 | Cold cache only. A return visit with the last-click cookie and no `?ad=` is the attribution case. Add J9. |
| Journeys: in-app back/forward, app backgrounding | Missing | Add J10 (bfcache restore, resume after background; `fitHero` may rerun). |
| Journey: scroll with toolbar collapse | Missing | Add J8 (C5). |
| Must-nots for every tracked event or interaction | No. Only `form_start`. | Missing: `hero_view`, `hero_answer`, `hero_skip`, `generate_lead`, `cta_click`, `faq_open`, `text_karlin_start`, `text_karlin_submit`, `signup_error`, Pixel `Lead`. Paste-ready X9 to X15. |
| Touch-scroll case | Missing | Required by the phase-4 gates. In X7 and H3. |
| Measurement row per changed page | Prose (M1) | Landing is the only changed page. Needs the five columns, a "bypasses shared layout" statement, and an "unchanged pages" line. MEAS below. |
| Fail-closed analytics gate | H6 | Needs the proxy-level or host-resolver block "from the first request", since route interception misses closing-page beacons. H6 rewrite below. |
| Browser-truth gate | N3 | Present. Ask for the ledger row per page, per variant. |
| Redirects proven on deploy | N6 | Present; nothing in this build changes redirects, cheap check. |
| Real-device gate | Missing | HC1 to HC4. |
| Explicit non-regression | N1 to N6 | Present. Add N7 (accessibility tree) and N8 (breakpoint boundaries) if cheap. |
| Protected surfaces | Brief only | R-PROT. |
| Visual relationship declared | Inside N1 | R-VIS. |
| Servers by PID | Not in 01 | Brief has the lines; add P7 and port plan (D3). |
| Git-evidence rule | P5 | Present. |
| Cleanup ledger for writes | Missing | D4. |
| Attack-with-proof | Not applicable | No accounts, roles, codes or uploads are added. State "N/A" in 01 so the Auditor does not wait for it. |
| Challenger | Planning-time, outside phase 1 | Fine. |
| Rollback | Missing | D2. |

## 3. Contradictions and tool dependencies

1. **Pixel-identical vs template edits (C1).** S2's intrinsic `width`/`height` would edit `T`/ad
   template literals that the brief protects. Resolution in R-PROT: protected means rendered output
   plus copy text; attribute additions are allowed if listed in the frozen spec and N1 passes. Also
   N4's `git diff --stat` cannot be empty for landing.html; replace with a hunk rule (hash of the
   extracted `T`, `AD_HERO` and ad-template text must match main except for listed attribute
   additions).
2. **Pixel-identical vs image delivery (L4/N1).** L4's "no image wider than 2x rendered width" at
   412 wide and DPR 2.625 means a 1082 px target; today `team-walk-1600.webp` is served. Any smaller
   file is upscaled by the browser or re-encoded; neither can hold < 0.1% differing pixels. The locked
   decision allows "image delivery" changes but not visible change. Resolve by making N1 govern: L4
   is "report bytes, apply only variants that pass N1".
3. **Pixel-identical vs font loading (L3/N1).** Async font load changes the moment text swaps, so a
   screenshot taken too early differs. N1 must wait for `document.fonts.ready` on both sides.
4. **Tags (C2).** H6 and X4 versus M1 and the QA gate, as above.
5. **Profiles (H2/S1).** S1 says "every H2 profile"; `iphone-safari` cannot run here and WebKit has no
   CDP throttling. S1 must say Chromium profiles only; iPhone is HC3.
6. **Brief vs H7.** The brief says "< 0.1 on main under all profiles"; H7 only checks `fb-android`.
   Keep H7 narrow as the gate and let S1 carry "all profiles".
7. **Main baseline missing.** L1, L5 and L3 compare to main but nothing orders the main runs. Add H9
   (below): a baseline label for main under every profile, captured before any branch edit.
8. **E1 to E3 vs P2.** The three `redteam-*.md` files are both the spec red team (before freeze) and
   the evaluation (mission 3). Say one file serves both, written in two passes, and which pass freezes.
9. **Money hotfix path.** N4 allows it; no requirement says what proves a hotfix. Add: hotfix is one
   commit, with a unit test that fails before and passes after, on its own, and Stripe test mode
   proof only after the webhook endpoint list (loop, unattended runs). No Stripe access here (the
   Stripe connector needs authentication), so money findings default to "code-read" confidence.
10. **The phase 0 release time (see Verdict).**

Tool and environment dependencies that 01 relies on without saying so:

- **WebKit:** not installed. `/opt/pw-browsers` holds chromium-1243, chromium_headless_shell-1243
  and ffmpeg only. H2's "if installed" branch is the only branch.
- **Playwright import:** `require.resolve('playwright')` works only through /opt/npm-tools. An ESM
  `import 'playwright'` from `scripts/field-vitals/` fails. The harness needs a resolver
  (`createRequire` with the global path, or `NODE_PATH`), and the requirement should not add
  `playwright` to package.json (Netlify installs it, lockfile churn, principle 9) unless Fable
  approves a devDependency.
- **Pixel diff:** no pixelmatch or pngjs. `sharp` exists in node_modules and can decode to raw
  buffers; name it, so N1 does not stall on a dependency decision.
- **`.env.local`:** absent. `next build` of a919b25 and the branch may need env at build; `npm
  run test:s1` may need Postgres (port 5432 was unreachable from the container in the Season 01
  pre-mortem). Baseline main first, record failures, then compare.
- **Egress:** dev--ekuzo.netlify.app and ekuzo.gg are reached through the agent proxy. Chromium needs
  the proxy and CA bundle passed explicitly. Relay pre-flight must prove both hosts load before
  Chronos relies on H8 or S1-on-dev. Throttling stacks on top of whatever the proxy adds; record
  the unthrottled round-trip as a control.
- **Meta Test Events / GA4 DebugView:** browser UIs behind logins; not reachable in an unattended run
  unless the built-in browser already holds Jamie's sessions. Treat as HC items.
- **Klaviyo/CAPI:** J1/J2 submits write to whatever the dev deploy's env points at. Relay must
  record which; if production, the cleanup ledger is mandatory and the sign-up count is minimal.
- **Git:** works in this directory despite the environment banner; both a919b25 and 45dfe97 exist,
  and a919b25 is an ancestor of d46c5c0. Building a919b25 needs a separate worktree and its own
  `node_modules` link so the branch is not touched.
- **Guard hook:** no `.claude/settings.json` today. P4 is a creation task, not a check.

## 4. Paste-ready text

### R-PROT Protected surfaces (new section, insert after E)

> **Protected surfaces.** Zero diff against origin/main (45dfe97): `app/api/season-one/route.ts`,
> `app/api/checkout/**`, `app/api/webhooks/stripe/route.ts`, `lib/season1/**`,
> `app/season1/join/**`, `app/season1/thanks/**`, `app/season1/crew/**`, `app/season1/early-access/**`,
> `lib/season1/tags.ts`. Exception: a money hotfix on its own commit, approved by Fable in the decision
> log. Exception: additive, behavior-neutral harness hooks listed by name in the frozen spec.
> `app/season1/landing.html` is allowed to change in these regions only: the document head (preload
> and font links), the small inline script, CSS inside the existing phone media query, the loader
> around the big script, and attribute additions on template `<img>` elements that the frozen spec
> lists. It must not change any text node, any ad template string other than listed attributes, `AD_HERO`,
> `T`, `IMG` paths, or any event call. Proof: a script extracts the template and copy regions from main
> and the branch, strips the listed attributes, and the two hashes are equal (N4).

### R-VIS Visual relationship (new, after R-PROT)

> **Visual relationship: clone.** Reference artifact: the build of origin/main 45dfe97 served locally
> on port 3101, captured with the same harness, profile and fonts. Allowed deltas: none visible.
> Everything that renders at 360, 412 and 1440 wide in every state listed in N1 must match.

### R-RUNCLASS Run classes (replaces the tag wording in H6, M1, X4)

> Two run classes. **Class T (tags blocked):** all lab and live performance runs. Chromium starts
> with `--host-resolver-rules` mapping `*.google-analytics.com`, `*.googletagmanager.com`,
> `*.clarity.ms`, `connect.facebook.net`, `www.facebook.com` (path `/tr`), `*.doubleclick.net` to
> `~NOTFOUND`, and the context also routes them to a local null responder that logs each attempt.
> `?s1qa` is absent. On ekuzo.gg the attempt log must be non-empty for each host (positive control that
> tags would have loaded); on localhost and dev the page loads no tags by design, so the log is
> expected to be empty and the test is that nothing reached the network. **Class Q (QA beacons):**
> measurement proof only. `?s1qa=1` present, every collect request fulfilled locally, never forwarded,
> recorded with URL, query and body. Class Q runs never target ekuzo.gg. No run is both.

### H3 amendment

> Scroll steps use touch gestures (CDP `Input.synthesizeScrollGesture` or touch events with
> `hasTouch`), not `window.scrollBy`. One scroll gesture starts on each of: the hero answer, the
> email field, a FAQ summary, the Text Karlin card, a call-to-action. A toolbar-collapse step
> reduces the layout viewport height by 56 px and then 110 px during the first scroll and restores
> it on scroll up (emulating Android WebView bars), with `visualViewport` and `100svh` recorded.
> An optional `fontScale` parameter (1.0, 1.3) sets the Android text-size setting through emulation.

### H6 rewrite

> Analytics hosts are blocked from the first request by the Chromium host-resolver rule in R-RUNCLASS
> plus context routing. The run writes `blocked.json` (host, URL, time, initiator). The run fails
> if any listed host completes a TCP connection, which is checked from the browser's
> `Network.loadingFinished`/`requestWillBeSent` records filtered to those hosts. The ledger links the
> `blocked.json` for every live run.

### H7b Fallback ladder (add under H7)

> If H7 does not reproduce on the first pass, Chronos tries, in order and logging each: (1) toolbar
> collapse on, (2) CPU 6x, (3) network 400 Kbps / 400 ms, (4) font cache cold plus the two-request
> HTTP/1.1 limit of an old WebView, (5) 1.35 MB page (the inline-image page at a919b25 is the
> likelier shift cause than the interactive-hero box, because d18 and d19 are not interactive-hero
> pages). Each attempt is a row in `evidence/vitals/h7-ladder.md`. If all fail, every lab number in
> this run is labeled "unvalidated against the field" in the ledger and the review guide, and the
> run reports to Fable; the S and L gates then rest on live runs (H8) and Jamie's phone (HC1).

### H9 Main baseline (add under A)

> Before any edit to landing.html, Chronos runs the full profile set (Class T) against a local
> build of origin/main on port 3101, N >= 5, stored under `evidence/vitals/main-baseline/`. L1, L3, L5
> and N1 compare to this label, not to a later rerun.

### N1 rewrite

> **N1a** For each of `d1…d21` and `noad`, at 360x780, 412x915 and 1440x900, and for each state
> (initial, after fonts ready and images decoded, hero answer tapped on interactive heroes, email
> focused with one character, FAQ first item open, error state after an invalid submit stubbed
> locally), take a full-page screenshot on main (port 3101) and the branch (port 3100) with the
> same Chromium, animations disabled through `prefers-reduced-motion` and a CSS freeze applied to
> both, `Math.random` stubbed, and the clock fixed. Decode with sharp and count pixels whose
> channel difference exceeds 8 of 255. Pass: under 0.1% of pixels per screenshot and no connected
> region over 12 x 12 px. **N1b** Steward judges PASS/FAIL against the clone declaration for every pair
> over threshold and for the six key-state pairs on d18, d19 and one interactive hero at 412 and
> 1440. A FAIL is a MAJOR defect owned by Atlas. Side-by-side PNGs live in `screenshots/` named
> `{ad}-{viewport}-{state}-{main|branch}.png`.

### L1 rewrite

> LCP is measured for `d18`, `d19` and every photo-hero variant under `fb-android` Slow 4G CPU 4x,
> N >= 5 per cell, after H9. Pass: median LCP is lower than the main baseline median by at least
> 150 ms or 10%, whichever is larger, on every photo-hero variant, and no variant's max exceeds 4.0 s
> if main's did not. The 2.5 s median target for d18 and d19 is recorded as an aspiration, not a
> gate, until the baseline shows it is reachable under Slow 4G. Live LCP is recorded after deploy.

### L4 rewrite

> For each hero image request under `fb-android` 412x915 @2.625, the ledger lists `encodedBodySize`,
> `naturalWidth`, and the rendered CSS width times DPR. Smaller variants are applied only where N1
> passes for that ad; the rest stay as on main with the reason recorded. Format is WebP or AVIF for
> every hero image (already true for the listed files).

### L5 rewrite

> Under CPU 4x the start time and duration of the first long task attributed to the big inline
> script are reported for main and branch (N >= 5). Pass: branch start is not later and duration
> is not longer than the main median by more than 20 ms; improvement is reported, not required.

### S1 tiers (replace the matrix sentence)

> **Tier 1 (gate):** `d18`, `d19`, one interactive hero, `noad`, under `fb-android` 412 and 360 and
> `ig-android` 412, Slow 4G, N = 5, lab and dev. **Tier 2:** every other `d` variant under `fb-android`
> 412, Slow 4G, N = 3, lab; dev deploy N = 1. **Tier 3:** `mid` network and `chrome-android` for
> Tier 1 variants, N = 3. Triage order is Tier 1, then 2, then 3. The ledger states which tiers
> ran when the run stopped.

### S2 rewrite

> Inside `#hero` and `#ihero`, every `img` has intrinsic `width` and `height` attributes or sits in a
> box with explicit height or `aspect-ratio` at 360, 412 and 959 wide, and every element with a
> `background-image` has the same. Proof: a DOM check in the harness lists each offender; a run with
> all image requests aborted shows CLS under 0.1; attribute additions are listed in the frozen spec (R-PROT).

### MEAS Measurement table (replaces M1's prose; one row, since only the landing page changes)

> | Page | Layout | GA4 (G-8LM45PX53W) | Meta | Clarity (wml8wll5ua) | Attribution | Destination |
> |---|---|---|---|---|---|---|
> | `/season1` and `?ad=…`, served by `app/season1/route.ts` from `landing.html` | Route handler HTML. It bypasses the shared layout and inherits nothing; every tag comes from `lib/season1/tags.ts`. Tags load on ekuzo.gg only, or on any host with `?s1qa=1`. | `page_view`, `hero_view`, `hero_answer`, `hero_skip`, `form_start` (click only), `generate_lead`, `cta_click`, `faq_open`, `text_karlin_start`, `text_karlin_submit`, `signup_error`. Campaign parameters survive into `page_location`. | Pixel `PageView`, `Lead` with `event_id`; the waitlist API sends the matching CAPI event with the same `event_id`. `Purchase` and `InitiateCheckout` become `S1QA_` in QA. | Loaded on every variant, inputs masked by default. | `ad`, UTMs, `fbclid` to `fbc`, `fbp`, last-click cookie, first-touch origin onto the Klaviyo profile and lead record. | GA4 property, Pixel `1284038230557204` and CAPI, Clarity project, Klaviyo profile and event, database per `docs/season-one-tracking.md` (Relay confirms). |
> Unchanged pages with no measurement change: `/season1/join*`, `/season1/thanks`, `/season1/crew*`.
> Proof (M1a to M1e): Class Q beacon lists for J1, J2, J4, J5 on main and branch are equal after
> removing timestamps and ids; `event_id` equality between the browser `Lead` and the request body the
> API forwards is shown on the dev deploy; attribution fields in the POST body equal main's; masking
> shown by a Clarity-mask attribute check on the email input. Test Events and DebugView confirmation is HC4.

### X-series additions (must-nots)

> - X9 `hero_view` must not fire on load before the hero is on screen, on `bfcache` restore twice,
>   or on a resize from toolbar collapse.
> - X10 `hero_answer` and `hero_skip` must not fire from a scroll that starts on the answer, from
>   programmatic focus, or from a script-set value; each fires once per tap.
> - X11 `generate_lead` and Pixel `Lead` must not fire on a failed submit, a 429, a double tap, or
>   a retry after a network error; a retry after success reuses the same `event_id`.
> - X12 `cta_click`, `text_karlin_start` and `faq_open` must not fire on a scroll gesture that starts on
>   them or on a keyboard focus alone (`faq_open` fires when the accordion opens, once).
> - X13 `signup_error` must not fire on page load, blur of an empty field before any submit attempt, or autofill.
> - X14 `form_start` (X7) and every event above are tested with: tap, typing, paste, autofill (set
>   value without a trusted event), programmatic `focus()`, a scroll gesture starting on the element, and a retry.
> - X15 The preload link, font links and any new script must not change `ad`, UTM or `fbclid` capture
>   order: capture still completes before the first tag call.
> - X16 No hotfix, harness hook or test touches production data except a disposable `team+cls-1109-<n>@ekuzo.gg`
>   sign-up listed in the cleanup ledger.

### Journey additions

> - J8 Scroll with toolbar collapse: on `fb-android`, d18 and d19, the viewport shrinks and grows by 56 to
>   110 px during scroll; CLS stays under 0.1 and the reserved hero box does not jump.
> - J9 Return visit: a second session on the same profile with the last-click cookie and no `?ad=`;
>   attribution on a submit equals the first-visit `ad`.
> - J10 In-app navigation: tap a program link, press back; and background the page (visibility hidden then
>   visible). No duplicate `page_view`, no re-run of `fitHero` shift, no lost `ad` param.
> - J11 Landing to `/season1/join` to jersey: `ad`, UTMs and the last-click cookie reach each page
>   unchanged (the join pages are untouched; this proves the landing change did not stop passing them).
> - J7 default: human checklist (HC5) unless Relay's pre-flight lists the Stripe test webhook endpoints.

### Human checkpoints (new section)

> - HC1 Jamie, Samsung S25, Instagram in-app browser, ad `d19` link, cold start: hero photos in place
>   before scroll, no jump while scrolling to the bottom, FAQ and email field behave, no blank gap
>   above the hero. Report by screenshot or screen recording.
> - HC2 Jamie, S25, Facebook in-app browser if the account has Facebook, same list, `d18`.
> - HC3 Aaron, iPhone Safari (and the iPhone Instagram browser if available), `d18`, `d19`, an interactive hero.
> - HC4 Jamie or Relay, Meta Events Manager Test Events and GA4 DebugView, one QA session (`?s1qa=1`) on
>   the dev deploy: `Lead` appears once with matching browser and server `event_id`; the GA4 event list matches MEAS.
> - HC5 Return from Stripe on `/season1/join/*` in an in-app browser (J7), unless covered by test mode.
> - Release to main waits for HC1 and HC3. P6 stays "pending Jamie's push".

### Deploy, rollback, process (new section D, P7)

> - D1 `dev` carries the branch through the documented integration merge; `curl -s` of the landing page
>   on dev equals the local branch build after the `{{URL_ALLOW}}` and `{{TAGS}}` fill (hash).
> - D2 The commits proposed for main are `git log origin/main..build/s1-cls-field` only; `git diff
>   origin/main <ship-ref> --stat` touches no blog or roadshow file. The integration merge commit is
>   never a candidate for main. Each slice is one revertable commit; the review guide lists the revert command.
> - D3 Ports: branch 3100, main 3101, a919b25 3102, each started with the brief's `& echo $! > .server-<port>.pid`
>   line and stopped with `kill "$(cat …)"`. After each Sentry lane and after any cancelled agent, the ledger
>   records `ss -ltnp` showing no leftover listeners and no orphan Chromium.
> - D4 `06-cleanup-ledger.md` row for every test write (email, Klaviyo profile id, deletion or suppression
>   result). If no write happens, the file says so.
> - P7 Guard script copied to the repo and registered in `.claude/settings.json` (create and commit the file)
>   before phase 4; the ledger holds the `grep` showing it.

### Additional non-regression (cheap, optional)

> - N7 The accessibility tree (role, name, focusable order) of each landing variant at 412 equals main.
> - N8 At 959 and 960 wide, the reserved hero box is present at 959 and absent at 960 on main and branch alike.

## 5. IDs to merge or split

Merge:

- X2 into N1 (same proof).
- X5 into M3 (identical test).
- X4 into H6 (keep X4 as the must-not heading, point to H6's test).
- X6 into N5 plus N8.
- X8 into N4 (hash rule) and keep one runtime POST-body diff under M1.
- P1 into a status line, not a requirement row (this file is its proof).
- J7 into HC5 unless a safe test path is confirmed.

Split:

- H2 into H2a profiles (UA, viewport, DPR), H2b throttling (CPU, network), H2c iPhone (human).
- H4 into H4a layout shifts and CLS maths (with the fixture unit test), H4b LCP, INP, long tasks, H4c fonts and resource timing.
- S1 into S1a lab, S1b dev deploy, S1c images blocked (shared with S2).
- L3 into L3a font requests and priority, L3b first-paint timing.
- M1 into M1a event list, M1b attribution, M1c Pixel and CAPI `event_id`, M1d Clarity masking, M1e destinations.
- N1 into N1a pixel diff, N1b Steward verdict.
- P4 into P4a guard installed, P4b server hygiene (D3).
- E1 to E4 stay single rows, but each adds "structure check" (Auditor) and "ranking judged" (Fable).

## 6. What the Auditor will hold the run to

- No ledger row is marked pass from an author's self-test. Chronos, Atlas and Relay self-evidence is
  filed as "self-test" and still needs a Sentry or Auditor verification row.
- A number from the harness does not count until the H7 row is pass, or the "unvalidated" label is applied.
- Any requirement that loses coverage during a simplification is logged as a defect (principle 9).
- A cancelled agent's files are not evidence until moved and re-run (principle 10).
- Ledger rows for IDs that Fable merges or splits are renamed when Fable updates 01; I will diff
  the ID list at phase 4.

Skeleton ledger: `docs/s1-cls-field-2026-11/04-evidence-ledger.md`.
