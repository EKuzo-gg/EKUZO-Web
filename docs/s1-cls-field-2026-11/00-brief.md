# Brief: Season 01 landing page, field-faithful stability and load speed (2026-11-09)

Build Loop run. The loop itself is defined in the KB file `build-loop.md` (copy at
`/mnt/user-data/uploads/knowledge-base/company/agents/agent-loop/build-loop.md`); this brief supplies
only what that file cannot know. Lead: Fable (this session). Jamie approved the revised plan at
10:03 CT ("let's go"); he is traveling with the laptop closed until the evening, so the run is
unattended. Hard stop 20:00 CT.

## Mission

1. **Prove and harden layout stability on the Season 01 ad landing page** (`/season1?ad=…`) under the
   conditions real visitors have: Facebook and Instagram in-app browsers on Android phones, slow CPU,
   cold cache and cold fonts, with scrolling and tapping. Phase 0 (see `00-phase0-field-truth.md`)
   showed the Nov 5 release already removed the field CLS problem (0 poor sessions in 3 days, 182
   good). What remains is to build a harness that reproduces the field, so it can prove the fix and
   guard it, and to close the residual stability risks it finds.
2. **Load speed on the in-app browsers.** Clarity shows LCP >= 4 s on about 10% of scored sessions
   (FacebookApp mostly, d19 and d18 included). Find the LCP element per variant and make it fast
   without changing the rendered design.
3. **Evaluate the ads and payment system** (ad landing -> waitlist API -> Klaviyo/Meta/GA4;
   `/season1/join` -> Stripe Elements -> webhook -> Klaviyo/Sheets/Discord) through the three red-team
   lenses, ranked by effect on sign-ups and money. A live money defect found by the money lens ships
   as its own hotfix ahead of the rest.

## Locked decisions (Jamie, 2026-11-09, 09:52 to 10:03 CT)

- Rendered pages stay pixel-identical to Aaron's design. Only load order, reserved space, script
  timing, image delivery and measurement may change. No copy changes.
- Branch `build/s1-cls-field` from `origin/main` (45dfe97). Test deploy = `dev--ekuzo.netlify.app`
  (the only preview the Netlify site builds); `main` only on Jamie's go after his phone check.
- Ship when verified; the ads keep running (d18 and d19 are the floor's best cells and move to the
  main ad set from Wed 11-11; d19 also runs the one-shot Purchase ad).
- Evaluation findings: ranked by sign-ups and money; low-impact defaults to "not now"; Jamie is asked
  only about items that change sign-ups or payments.
- Real devices tonight: Jamie has a Samsung S25 (Android Chrome, Instagram in-app), a MacBook Pro
  (Chrome). Aaron tests on iPhone.
- Test writes: disposable `team+cls-1109-<n>@ekuzo.gg` sign-ups only if a lane needs one, with the
  cleanup ledger; no test payments unless the money lens needs one, and then Stripe test mode only
  after listing its webhook endpoints.

## Pre-verified codebase map (Fable, 10:10 CT; Scout re-verifies)

- Landing page: `app/season1/landing.html` (127,471 bytes on main; 1,340,714 on dev) served by
  `app/season1/route.ts` (`force-static`, fills `{{URL_ALLOW}}`/`{{TAGS}}` from `lib/season1/tags.ts`).
  Two inline scripts: small one at line 899 (sets `pa` or `pre-ih` on `#lp` before paint), big one
  at line 1001 (hero templates `T`, `AD_HERO`, `IMG` map, `fitHero`). Ad variants: `d1`…`d21`;
  `d18` = tpl `d5`, photo `laughing`, display font "Inter Tight"; `d19`…`d21` = tpl `d11` with the
  Southie jersey photos (`team-walk-hd`, `southie-back`), served as files under
  `public/images/season1/`. Reserved-box CSS at lines 654 to 656 (`.lp > #hero.pa:empty{aspect-ratio:4/5}`,
  `.lp.pre-ih:not(.has-ihero) > #hero{min-height:80svh}`), both inside `@media (max-width:959px)`.
- Tags: `lib/season1/tags.ts` (GA4 `G-8LM45PX53W`, Pixel `1284038230557204`, Clarity `wml8wll5ua`;
  live only on ekuzo.gg; QA mode via `?s1qa=1`, Purchase and InitiateCheckout renamed `S1QA_*` in QA).
- Waitlist API: `app/api/season-one/route.ts` (per-IP limits, step lock, eventId; see round 2 docs).
- Join/checkout: `app/season1/join/` (`route.ts`, `b/`, `jersey/`, `signup/`, `welcome/` with
  `fulfil-import.ts`), `app/api/checkout/`, `app/api/webhooks/stripe/route.ts`, `lib/season1/*`.
  Tests: `npm test` (`scripts/run-tests.mjs`), `npm run test:s1`.
- Prior loops on this surface, read before writing requirements: `docs/s1-round2-2026-11/`
  (`scout/ihero-cls.md`, `evidence/sentry-b/cls-table.md`, `07-review-guide.md`),
  `docs/s1-join-sync-2026-11/` (`redteam-money.md`, `redteam-ops.md`, `07-review-guide.md`),
  `docs/season1-commit/`, `docs/season-one-tracking.md`, `WORKLOG.md` (top entries).
- Pre-fix commit for the harness proof: `a919b25` (last main before the Nov 5 release);
  first post-fix landing commit `d46c5c0`; main `45dfe97`.
- Deploys: Netlify builds `main` (ekuzo.gg) and `dev` (dev--ekuzo.netlify.app) only. `dev` and
  `main` diverged at `0ef69fc`; dev carries blog and roadshow work main does not, main carries 62
  Season 01 commits dev does not. A dev-integration merge is the test-deploy path
  (`docs/dev-runbook.md` § "Releasing when dev carries work main must not get").
- Toolchain here: Node 22.23, npm 10.9, Playwright 1.63 with Chromium pre-installed (global
  `require('playwright')`), Next 16.4.3. No `.env.local` (live keys stay on Jamie's laptop); anything
  needing secrets runs against the dev deploy, never here.

## Protected surfaces (zero diff unless a lens finds a money defect, then hotfix-first)

`app/api/season-one/route.ts`, `app/api/checkout/**`, `app/api/webhooks/stripe/route.ts`,
`lib/season1/**` (except additive harness hooks that Fable approves in the frozen spec),
`app/season1/join/**` copy and visuals, all ad copy and hero templates in `landing.html`, Klaviyo
events and metrics, Meta event names and ids. Aaron's design: every rendered pixel of every `?ad=`
variant at 360, 412 and 1440 wide must match main; the visual-parity gate judges "clone".

## Harness requirements (Chronos owns; Sentry runs)

- Lives in the repo at `scripts/field-vitals/` with an npm script; Node + Playwright Chromium.
- Profiles: Facebook Android in-app WebView and Instagram Android in-app (UA strings with
  `FB_IAB/FB4A` and `Instagram … Android`), 360x780 @3 and 412x915 @2.625, Chrome Mobile UA, plus one
  WebKit iPhone profile. CPU throttle 4x, network Slow 4G (1.6 Mbps down, 150 ms RTT) and a
  mid-tier profile; cold cache and cold fonts per run (fresh context, no HTTP cache).
- Journeys: load and wait 10 s; scroll in viewport-height steps with 700 ms pauses to the bottom;
  tap the hero answer (interactive heroes); focus and type in the email field (no submit); back to top.
- Measures: every `layout-shift` entry with `sources` (node selector path, previous and current rects,
  time, hadRecentInput), session-window CLS and total CLS, LCP element and time, INP from event timing,
  long tasks, font load timing, resource timing for hero images. JSON per run plus a markdown table.
- Analytics fail-closed: block `*.google-analytics.com`, `*.googletagmanager.com`, `*.clarity.ms`,
  `connect.facebook.net`, `www.facebook.com/tr` at the context's request routing AND run the live
  page with `?s1qa=1` absent (so live tags would load if not blocked: prove the block in the ledger).
- Proof of faithfulness: the harness must show CLS >= 0.25 on d18 and d19 at commit `a919b25`
  (built locally, `next build` + `next start` by PID) under at least one in-app profile, and
  < 0.1 on main under all profiles, before any number from it counts as evidence.
- Targets live too: run the same profiles against `https://ekuzo.gg/season1?ad=d18|d19|d2|d4|d21`
  (tags blocked) to confirm the field.

## Servers: start and stop by PID (verbatim)

`npx next start -p 3100 > server.log 2>&1 & echo $! > .server.pid` and `kill "$(cat .server.pid)"`.
Never `pkill -f`, `pgrep -f` or `ps | grep` piped to `kill`. The guard script
`/mnt/user-data/uploads/knowledge-base/system/scripts/guard-pattern-kill.sh` is copied into the repo
before phase 4 and registered as a PreToolUse hook (snippet in its header).

## KB grounding per role (paths under `/mnt/user-data/uploads/knowledge-base/`)

- All roles: `system/methodology/anti-ai-writing.md` (every line of prose), `personal/identity/working-with-jamie.md`.
- Fable, Auditor, Steward, Parent: `company/agents/agent-loop/build-loop.md`, `personal/identity/working-style.md`.
- Steward and Story (no copy work expected): `system/methodology/voice-dna.md`, `company/knowledge/ekuzo-messaging-voice.md`, `company/marketing/ekuzo-fact-library.md`, `company/knowledge/ekuzo-faq-canon.md`.
- Relay, Sentry, money lens: `system/methodology/workflows.md` § External-Write Safety and § Paid-Media Builds, `company/marketing/channels/meta-ads.md`.
- Ads context (the Season 01 ads project, `/mnt/user-data/uploads/EKUZO/Marketing/ads/2026-10-season-one/`):
  `plan.md`, `ads.md`, `reads/2026-11-09.md`, `reads/2026-11-06.md`, `log.md` (search, long).

## Roles and models for this run

| Role | Model | Lane |
|---|---|---|
| Fable | this session | requirements, frozen spec, decisions, review guide, handoff |
| Scout | fast (sonnet) | verify this map; harness feasibility; what the old harness missed |
| Money lens | top (opus) | shipped checkout and waitlist path end to end; live defects |
| Users/trust lens, Ops lens | fast (sonnet) | spec red team after requirements |
| Chronos | top (opus) | the harness and its proof |
| Atlas | top (opus) | stability hardening and LCP fixes, pixel parity, screenshots |
| Relay | fast (sonnet) | dev-integration merge, pre-flight (Netlify, Stripe test webhooks list), cleanup ledger |
| Sentry (2 lanes) | fast (sonnet) | harness run on the dev deploy; console, redirects, tests; adversarial pass |
| Parent, Steward | top (opus) | rendered experience; claims and offer integrity |
| Auditor | fast (sonnet) | requirement completeness; evidence ledger |

## Budget triage if the day runs short

1. Harness built and proven on `a919b25` vs main (the regression gate). 2. LCP fixes on d18/d19.
3. Stability hardening on the other variants. 4. Evaluation findings written up. 5. Everything else
to the handoff. Interim summary from the last proven slice at any stop.
