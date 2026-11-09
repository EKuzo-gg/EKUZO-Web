# 02 Frozen spec: Season 01 landing page, stability proof, load speed, evaluation

Fable, 2026-11-09 10:25 CT. Frozen after Scout, the Auditor (SIGN-OFF WITH CHANGES, applied in
`01-requirements.md` v2) and the three red-team lenses (`redteam-money.md`, `redteam-users.md`,
`redteam-ops.md`). Requirement IDs are those in `01-requirements.md` v2. Later deviations need a
logged spec change in `03-decision-log.md`.

## 1. What ships (slices, each one revertable commit on `build/s1-cls-field`)

### Slice 0: hotfix M-1 (Relay; ships first, own commit)

`app/season1/join/signup/signup.html`: when Stripe answers `payment_intent_unexpected_state` (the
PaymentIntent was canceled by the webhook after three declines), drop the cached client secret and
its form signature so the next tap re-commits and mints a fresh PaymentIntent; the existing error
line still shows Stripe's message. No other change. Unit test in `lib/season1/__tests__/` on the
signup page's commit logic (fails on main, passes on the branch): three declines, then
`unexpected_state`, then the next tap calls commit again. Protected-surface exception approved (D10).

### Slice 1: field-vitals harness (Chronos)

`scripts/field-vitals/` per H1 to H9, OR2, OR3, OR5, OR7 (marker check), OR9, OR10, OR12, OR13. One
source of truth for CLS maths with a fixture unit test (H4a). Profiles: `fb-android`,
`ig-android`, `chrome-android`; `iphone-safari` is a documented human check (H2c). Failure profiles
(OR3): `fonts-blocked`, `fonts-slow` (delay 20 s; also an 8 s variant, users lens U-1), `hero-404`,
`small-script-throws`, `big-script-fails`. Every run blocks the analytics hosts (R-RUNCLASS Class T)
and aborts `POST /api/*` (OR13). Output: tables committed, raw JSON gitignored with a manifest (OR10).
Proof order: H9 main baseline first (port 3101), then H7 at `3433a5b` (port 3102) with the H7b
ladder, then nothing else counts until both are in the ledger.

### Slice 2: landing page speed and stability (Atlas), `app/season1/landing.html` only

The locked rule: no rendered pixel changes once fonts and images have loaded (N1 clone). Changes:

1. **Head bootstrap script** (new, synchronous, inline, first child of `<head>` before any stylesheet):
   - defines `AD_HERO`, `HERO_KEYS` and a `HERO_IMG` table (ad id to hero image files, page A photo
     heroes: d11, d12, d16 to d21 and any page A ad whose `art` carries an `img`) on `window.S1`;
     the body's small script and the big script read these from `window.S1` instead of their own
     copies (one source; the big script's `const IMG = {...}` line becomes a read of the head table
     plus its existing jersey overrides). A unit test parses `landing.html` and asserts, for every
     ad id in `D`, that the files its `art` template references equal the head table's entry.
   - parses `?ad=` and `?hero=` exactly as the small script does today (same normalisation,
     including `d0` to `d` and the `hero=none` case);
   - appends `<link rel="preload" as="image" href="<largest hero image>" fetchpriority="high">`
     for the chosen ad's largest hero image and `<link rel="preload" as="image">` (no priority
     hint) for its second image if any (OR12, X1: only that ad's files); nothing for interactive
     heroes unless their template carries an `img` (then the same rule);
   - appends a **per-ad Google Fonts stylesheet** link (blocking, `display=swap`) built from the
     families that ad paints (L3a), derived from a table generated from `T`, the `D` templates and
     the module CSS (Inter Tight 500/700/800 and JetBrains Mono 500/700 always; plus the ad's
     display family and any hard-coded family such as Rubik for d11-family, Archivo and Archivo
     Black for d2's module). A DOM check in the harness asserts every text node's first computed
     family is in the requested set (U-6);
   - is wrapped in `try/catch`; on any failure the page falls back to today's path (X17).
2. **The all-families Google Fonts stylesheet** (line 7) moves out of the render path: loaded
   async (`media="print"` with `onload` swap to `all`, plus a `<noscript>` blocking copy) so every
   template keeps its face if the per-ad list ever misses one (U-6 safety net, L3a).
3. `html{background:<page ink value>}` inline at the top of `<head>` (U-7). Atlas reads the actual
   `body`/`.lp` background from the CSS; identical color, no visible change after load.
4. `fitHero` reruns on `document.fonts` `loadingdone`, on the per-ad stylesheet `load` and on window
   `load`, in addition to today's `fonts.ready` and `resize` (U-3 must-hold). Test: `--fontDelay 3000`
   run compares the interactive headline's computed size with main.
5. `80vh` declared before `80svh` in the `pre-ih` rule (U-13), additive.
6. `loading="lazy"` on the hidden avatar `img.tk-av` (L7, U-17).
7. `data-clarity-mask="true"` on `#em-top`, `#em-end`, `#tk-ph` and `#tk` (U-5). No pixel change.
8. `AbortSignal.timeout(15000)` on the waitlist `fetch` in the big script, falling into the existing
   "Check your connection" error path and re-enabling the button (M-9, U-8). Not an event call.
9. Ready sentinel: the big script's last statement sets `document.documentElement.dataset.s1Ready="1"`;
   the small script sets `data-s1-pre="pa"` or `"ih"` on `#lp` (OR2). No CSS binds to them.
10. Build marker `<meta name="s1-build" content="{{BUILD}}">` in the head, filled by
    `app/season1/route.ts` from `process.env.COMMIT_REF` (Netlify) or `git rev-parse --short HEAD`
    at build time (OR7). `route.ts` is not a protected file.
11. Optional, only if the harness shows the pre-ready tap window is real on `fb-android` `slow4g`
    (U-4b): a four-line inline stub on both forms that records a submit before the handler exists and
    replays it once when the handler attaches; the handler runs exactly once (X7, X11 hold). Atlas
    decides from the measurement and logs it. Round 2's R2-D10 (do not hide the form) stands.
12. **Not changed:** `pa` and `pre-ih` rules (S5), hero templates' text, `IMG` paths, event calls,
    the Text Karlin card, the 429 copy (U-11's `sms:` link is a copy-adjacent call for Jamie, see § 4),
    the `.solid` header transition (S4 measures it first; convert only if entries appear and N1 holds).

Image sizing (L4): `srcset` with the existing `team-walk-900.webp` and `team-walk-1600.webp` on the
d19 to d21 `.ph` with `sizes="100vw"`, so DPR-2 phones get the smaller file and DPR-2.625/3 phones keep
the 1600; the preload carries matching `imagesrcset`/`imagesizes` (OR12). Applied only if N1 passes at
all three widths; otherwise recorded and left as main.

Allowed edits inside protected regions of `landing.html`, by name (R-PROT): the `IMG` definition
line (read from `window.S1`), `fitHero` rerun hooks (one line), the waitlist fetch options (timeout),
the big script's final sentinel line, and attribute additions on `img.tk-av`, the three inputs and
`#tk`. Everything else in the big script and the templates is hash-checked against main (N4).

### Slice 3: dev-integration deploy (Relay)

Per `scout/codebase-map.md` § 5 and `redteam-ops.md` "Relay runbook": integration branch
`preview/s1-cls-field-dev` = `build/s1-cls-field` + `git merge origin/dev`; resolve `WORKLOG.md`
(both sides), take dev's `public/roadshow/ad-lab.html` and `public/roadshow/index.html`; restore the
60 dev-only paths from `origin/dev` (`public/ads/season1`, `public/review.html`, `public/roadshow/**`);
prove `app`, `lib`, `components`, `public/images`, `scripts` identical to the build branch; fast-forward
push to `dev`. Then: Netlify build, marker check (OR7), S1b and N6 on dev. `main` candidates stay
`git log origin/main..build/s1-cls-field` (D2).

## 2. Pre-flight results (Relay completes before Slice 3; Fable records here)

| Check | Result | Source |
|---|---|---|
| Netlify builds | `main` -> ekuzo.gg, `dev` -> dev--ekuzo.netlify.app; `build/*` 404 | Fable curl 10:20 |
| Production landing cache | `s-maxage=31536000`, no ETag or Last-Modified; keyed per deploy; `age` and `x-nextjs-date` disagree by 24 h | ops lens § 2 |
| Live tags on dev | none without `?s1qa=1`; with it, production Clarity, Pixel PageView and GA4 debug load (O-5) | ops lens |
| Dev sign-up destinations | live Klaviyo list `XGTv2F`; Meta Lead live unless `META_CAPI_USE_TEST_CODE=true` on dev (O-2, M-4). **Read 10:30 CT in Netlify (Jamie's browser): neither `META_CAPI_USE_TEST_CODE` nor `META_CAPI_TEST_EVENT_CODE` exists in any deploy context; `KLAVIYO_PRIVATE_API_KEY` has 5 per-context values (unread). So a dev sign-up sends a live Meta Lead. D11 stands: no dev sign-ups.** | ops and money lenses; Netlify env page |
| Netlify credits | Team banner 10:30 CT: "over 75% of your credit allowance this month". Two builds needed tonight (dev, main). Jamie checks billing before the phone check (HA9). | Netlify UI |
| Stripe on dev | test mode (publishable key `pk_test_`), Neon test database per the Oct ledgers; live impossible off `production` context (M, ops) | money lens live check |
| Stripe test webhook `we_1TMYx4…` | points at dev `/api/webhooks/stripe` (legacy route); main's legacy guard arrives with the merge; Relay greps for it after merging (O-16) | ops lens |
| Stripe live webhooks (read 10:34 CT, Jamie's browser) | Season 01 commit `https://ekuzo.gg/api/season1/stripe-webhook` Active; legacy `https://ekuzo.gg/api/webhooks/stripe` Active; `dev--ekuzo.netlify.app/api/webhooks/stripe` Disabled; two old WordPress endpoints Disabled. Matches money lens 4.1. | Stripe Workbench |
| Stripe live failed or canceled payments | none since 2026-08-22 (pre Season 01). The M-1 path has not fired in live yet; frequency so far 0. | Stripe Payments, status filter |
| Local builds | `next build` needs a placeholder `STRIPE_SECRET_KEY`; symlinked `node_modules` breaks Turbopack; real `npm ci` per worktree (in progress at freeze) | Fable |
| Playwright | 1.63 global, Chromium only; WebKit absent and without layout-shift API | Scout |
| Tests on main | `npm test` 575 tests, 574 pass, 1 skipped, 0 fail (money lens run) | `scratchpad/money-npmtest.log` |

## 3. Human-action items (for Jamie tonight, or Relay where marked)

- HA1 (Jamie) HC1/HC2 on the S25 (Instagram in-app, then Facebook in-app if available): d19 and
  d18 on the dev deploy, URL without `?s1qa=1`. Then main on go.
- HA2 (Aaron, can follow the push) HC3 on iPhone Safari and Instagram in-app: d18, d19, d2.
- HA3 (Jamie, 2 minutes) Clarity project Settings, Masking: confirm Balanced or Strict (U-5).
- HA4 (Jamie, 5 minutes) Stripe Dashboard: list webhook endpoints in live and test mode against
  the money lens checklist 4.1; confirm Payment method domains include `ekuzo.gg` (and add
  `dev--ekuzo.netlify.app` for the wallet check, 4.4); Customer emails "Successful payments" on (4.5).
- HA5 (Jamie, optional) Netlify dev env readout: `META_CAPI_USE_TEST_CODE`, `META_CAPI_TEST_EVENT_CODE`,
  `KLAVIYO_PRIVATE_API_KEY` presence, `DATABASE_URL` host (OR15). Until read, no test sign-ups on dev.
- HA6 (Jamie) Wallet check on the dev signup page test bar ("Wallets:" line) inside Instagram on the S25
  (M-3). If no wallet shows in-app, the "open in your browser" hint is a copy call for Aaron.
- HA7 (Jamie, decision) Daily canary scheduled task (OR16, O-12): Fable proposes it in the review
  guide; created only on his OK.
- HA8 (Jamie, decision) Privacy Policy link in the landing footer (U-9) and the `sms:` link on the
  429 number (U-11): copy-adjacent, Aaron's lane; Fable's default is yes to both this week.
- HA9 (Jamie, before the phone check) Netlify team billing: the team banner says over 75% of the
  month's credit allowance is used; confirm two more builds (dev, main) will run, or enable recharge.

## 4. Resolutions of red-team and Auditor findings

Accept = in this run's scope above. Week = recommended next, in `06-findings-ranked.md`. Park = not
now, with a default. Jamie = his call, asked only where it changes sign-ups or payments.

| Finding | Resolution | Where |
|---|---|---|
| Auditor C1 to C13 | Accept, applied in `01` v2 | `01-requirements.md` |
| Scout: wrong pre-fix commit; lab did reproduce | Accept; H7 uses `3433a5b`; Phase 0 corrected | `00-phase0-field-truth.md`, D1 |
| M-1 three declines dead end | **Accept as hotfix, Slice 0** | Relay |
| M-2 silent outbox failures | Week: one Discord alert for live sends that end failed, stale or skipped; Jamie asked (touches the payment path) | `06` |
| M-3 wallets in in-app browsers | Jamie: HA6 tonight; copy hint is Aaron's call | HA6 |
| M-4 waitlist API has no test mode | Park: no dev sign-ups this run (J1/J2 submit parked, Class Q local only); week: host or mode guard | D11 |
| M-5 second tab double charge | Park (not now); week: re-commit before every confirm | `06` |
| M-6 join pages strip `?ad=` | Park; no live links; week if the one-shot ad returns | `06` |
| M-7, M-8 rate limits | Accept as risk; raise `GLOBAL_QUIET` before any creator push | `06` |
| M-9 client timeouts | Accept for the landing fetch (Slice 2 item 8); signup fetch: week | Atlas |
| M-10 email typo help | Park; copy (Aaron) | `06` |
| M-11 jersey count cap | Park; revisit at 60 commitments | `06` |
| M-12 Link bank funding | Jamie: checklist 4.6 | HA4 |
| M-13 CAPI fbp/fbc validation, token in URL | Week (code, Jamie's lane) | `06` |
| M-14 legacy camps webhook | Park until camps return (February) | `06` |
| U-1, U-2 blank before first paint; preload must be in the head | Accept: head bootstrap, per-ad fonts, async full stylesheet | Slice 2 items 1 to 3 |
| U-3 `fitHero` after async fonts | Accept must-hold | Slice 2 item 4 |
| U-4 tap before handler; typed email lost | Accept U-4b conditionally; U-4a rejected (R2-D10) | Slice 2 item 11 |
| U-5 Clarity masking | Accept attributes; HA3 for the project setting | Slice 2 item 7 |
| U-6 per-ad font list completeness | Accept: generated table plus DOM check plus async full stylesheet | Slice 2 |
| U-7 white first paint | Accept | Slice 2 item 3 |
| U-8 "Saving…" forever | Accept (same as M-9) | Slice 2 item 8 |
| U-9 no Privacy Policy link | Jamie decision, default yes this week (Aaron) | HA8 |
| U-10 Text Karlin fine print | Flag only; Steward reads it in phase 4 | `06` |
| U-11 429 number as `sms:` link | Jamie, default yes this week | HA8 |
| U-12 `fitHero` on toolbar collapse | Accept: J8 measures; fix only with evidence | Chronos, Atlas |
| U-13 `80vh` before `80svh` | Accept | Slice 2 item 5 |
| U-14 tap targets | Park (Aaron's lane) | `06` |
| U-15 200% text zoom | HC1 includes the largest font size once | HA1 |
| U-16 reduced motion | Park; additive, Aaron's lane | `06` |
| U-17 hidden avatar loads first | Accept | Slice 2 item 6 |
| U-18 500 copy blames the parent | Park (copy) | `06` |
| U-19 page A has no h1; live region | Flag for Aaron | `06` |
| O-1 merge deletes 60 dev-only files | Accept recipe | Slice 3 |
| O-2 dev sign-ups write live | Accept: parked J1/J2 submits; HA5 before any dev write | D11 |
| O-3 script failure kills the forms | Accept OR1 compile test, OR2 sentinel, OR3 failure profiles | Slices 1, 2 |
| O-4 fonts host stall | Accept OR4 fail-open: per-ad CSS still blocks (as today, smaller); `fonts-slow` profile reports; self-hosting listed as week | Slice 1, `06` |
| O-5 `?s1qa=1` on dev loads production Clarity | Accept OR6: Class Q local only; phone check without the parameter | R-RUNCLASS |
| O-6 failed dev build serves stale | Accept OR7 marker | Slice 2 item 10 |
| O-7 live proof | Accept OR8 (body marker plus sha256 of a local build of the same commit) | P6 |
| O-8, O-9 Playwright install, raw JSON size | Accept OR9, OR10 | Slice 1 |
| O-10, OR11 quiet/429 events | Week: additive GA4 events; Jamie informed (measurement, not conversion) | `06` |
| O-11 rate limits on shared Wi-Fi | Accept as risk; measure via O-10 | `06` |
| O-12, OR16 2 am observability | Jamie: HA7 | review guide |
| O-13, OR12 preload failure modes | Accept | Slice 2 item 1 |
| O-14 image cache headers | Park (touches every `IMG` path) | `06` |
| O-15, OR13 harness POST guard | Accept | Slice 1 |
| O-16 legacy webhook on dev | Accept: Relay greps the guard after the merge | Slice 3 |
| OR14 Clarity error split in the review guide | Accept | review guide |

## 5. Lanes, models, order

| Lane | Model | Starts | Produces |
|---|---|---|---|
| Relay | fast | now | Slice 0 hotfix + test; `route.ts` marker; integration branch prepared (not pushed until Atlas and Chronos land); pre-flight table filled; `06-cleanup-ledger.md` |
| Chronos | top | now | Slice 1 harness; H9 baseline; H7 proof with ladder; failure profiles; fixture test; README |
| Atlas | top | now, on the branch | Slice 2; `npm test` green; self-test screenshots at 360/412/1440 for d18, d19, d2, noad into `screenshots/`; `evidence/atlas/self-test.md` |
| Sentry A | fast | after Atlas and Chronos | harness run on local branch vs main (S1a Tier 1 and 2, L1 to L7, S2 to S5, N1a, N3, M1a to M1d, X series, J3 to J5, J8 to J10); own files |
| Sentry B | fast | after the dev push | dev deploy: S1b, N6, D1, OR7/OR8 marker, console; H8 live before-run; own files |
| Parent | top | after `screenshots/` non-empty | rendered experience on local branch pages (fresh eyes), J6 link-outs |
| Steward | top | after `screenshots/` | N1b verdicts; claims and offer unchanged; U-10 read |
| Auditor | fast | phase 4 | merge lanes into `04-evidence-ledger.md`; `05-defect-log.md` |

Phase 2 design review is served by the users lens (U-1 to U-19, read as the Parent-side design
review) and the money lens; a separate Parent/Steward pass on the design package is skipped because
no copy or visual changes; both roles run in phase 4 on the rendered result (D9).

## 6. Budget triage (hard stop 20:00 CT)

1. Slice 0 hotfix with its test. 2. Slice 1 through H9 and H7 (the gate). 3. Slice 2 items 1 to 7
and 9 to 10 (speed, masking, marker). 4. Sentry A on local. 5. Slice 3 dev push and Sentry B.
6. Items 8, 11 and L4 srcset. 7. Evaluation write-up `06-findings-ranked.md`. 8. Review guide and
handoff. An interim summary from the last proven slice is written at any stop.
