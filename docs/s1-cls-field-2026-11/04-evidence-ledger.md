# 04 Evidence ledger: Season 01 landing page, field-faithful stability and load speed

Owner: Auditor. Skeleton created 2026-11-09 after the phase 1 review (`auditor-phase1.md`). Rows follow
the IDs in `01-requirements.md` as of the 10:25 CT version. Results stay blank until an artifact exists.
Result values: pass, fail (defect id), human-pending, n/a (reason). A row is never marked pass from the
author's own self-test; the "verified by" column names a different role.

## Parallel lanes

Each parallel lane writes its own file; the Auditor merges them into this ledger and into
`05-defect-log.md`. No two agents write the same file (build-loop.md, artifact contract).

| Lane | Results file | Defect file |
|---|---|---|
| Chronos (harness self-test, not final) | `evidence/chronos/results.md` | none (routes to Fable) |
| Atlas (build self-test, not final) | `evidence/atlas/results.md` | none |
| Relay (pre-flight, merge, cleanup) | `evidence/relay/results.md` | `06-cleanup-ledger.md` |
| Sentry A (harness runs, lab, tiers) | `evidence/sentry-a/results.md` | `05-defect-log-sentry-a.md` |
| Sentry B (dev deploy, console, redirects, tests, adversarial) | `evidence/sentry-b/results.md` | `05-defect-log-sentry-b.md` |
| Red-team lenses | `redteam-money.md`, `redteam-users.md`, `redteam-ops.md` | none |
| Parent, Steward | `evidence/parent/review.md`, `evidence/steward/review.md` | routed through Sentry logs |

Gate checks the Auditor runs before phase 4 spawns: `screenshots/` non-empty; test output present; guard
hook in `.claude/settings.json`; H7 row is pass or the "unvalidated" label is applied to every lab row.

## A. Harness

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| H1 | Harness script and README exist | `ls`, `npm run vitals -- --help`, README headings | | | | |
| H2 | Named profiles, throttling, cold contexts | Per-run JSON shows UA, DPR, CPU, network | | | | iPhone row is human (HC3) |
| H3 | Journey: load, scroll, tap, type, return | Timestamped step list in JSON | | | | Touch gestures and toolbar collapse per review |
| H4 | Shift sources, CLS, LCP, INP, fonts | JSON keys; CLS fixture unit test | | | | |
| H5 | JSON per run plus markdown table | Files at pattern; median and max columns | | | | |
| H6 | Analytics hosts blocked, logged, abort | `blocked.json`; zero connections to hosts | | | | |
| H7 | Reproduces pre-fix field CLS on a919b25 | 3 runs a919b25 vs 45dfe97, d18 and d19 | | | | Gate for all lab numbers |
| H8 | Live ekuzo.gg runs for five ads | `evidence/vitals/live-*`; blocked log non-empty | | | | Egress unverified |
| H7b | Fallback ladder if H7 fails (proposed) | `evidence/vitals/h7-ladder.md` | | | | Pending Fable |
| H9 | Main baseline captured before edits (proposed) | `evidence/vitals/main-baseline/` | | | | Pending Fable |

## B. Layout stability

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| S1 | CLS under 0.1 across variants and profiles | Harness table by tier, lab and dev | | | | Tiers 1 to 3 per review |
| S2 | Hero images and boxes reserve space | DOM check; images-blocked run | | | | Attribute edits need R-PROT |
| S3 | Font swap does not shift hero | Text-node shifts after first paint | | | | |
| S4 | Nothing below fold shifts during scroll | Shift sources outside hero | | | | |
| S5 | Existing reserved boxes stay as shipped | `git diff` of CSS rules; decision log | | | | |

## C. Load speed

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| L1 | LCP improves on main, targets met | Harness LCP vs main baseline, N >= 5 | | | | Thresholds pending Fable |
| L2 | Hero image requested before big script | Head DOM; resource start vs long task | | | | |
| L3 | Fonts per ad, stylesheet not blocking | Font requests; first-paint vs main | | | | |
| L4 | Hero images sized for phones, WebP | Resource sizes vs rendered width x DPR | | | | Subordinate to N1 |
| L5 | Big script long task not worse | Long-task start and duration vs main | | | | |
| L6 | Tap and focus INP under 200 ms | INP table (report only) | | | | |

## D. Measurement

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| M1 | Landing measurement row identical to main | Class Q beacon lists, main vs branch diff | | | | Test Events and DebugView are HC4 |
| M2 | No kid data in URLs, GA4, Meta | Beacon and URL log grep | | | | |
| M3 | No new third-party host requested | Host set, branch minus main | | | | Same test as X5 |

## E. Non-regression

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| N1 | Pixel parity with main, clone relationship | Pixel diff report; Steward verdict | | | | Judge: Steward |
| N2 | Existing tests pass, failures match main | `npm test`, `npm run test:s1` outputs diffed | | | | Baseline main first (no env) |
| N3 | Build, tsc clean, console clean | Build and tsc output; per-variant console log | | | | |
| N4 | Protected surfaces unchanged | Diff stat; landing hunk hash | | | | Needs R-PROT |
| N5 | Desktop behavior unchanged | Computed styles and shots at 960, 1280, 1440 | | | | |
| N6 | Redirects, noindex, canonical, QA gate unchanged | `curl -sI` on dev vs main | | | | |
| N7 | Accessibility tree unchanged (proposed) | Tree diff at 412 | | | | Optional |
| N8 | Breakpoint boundary 959 and 960 (proposed) | Computed hero box at both widths | | | | Optional |

## F. Evaluation

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| E1 | Money red team reads paths end to end | File exists; columns; file:line; confidence | | | | Quality judged by Fable |
| E2 | Users, trust, privacy red team | Same structure check | | | | |
| E3 | Operations and failure red team | Same structure check | | | | |
| E4 | Ranked findings table, questions only if money | One table; evidence paths exist | | | | Only sign-up or payment items go to Jamie |

## G. Journeys

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| J1 | FB in-app d18 ad tap to thanks | Request log ends at `/season1/thanks` | | | | Writes: cleanup ledger |
| J2 | Instagram in-app d19 same journey | Same | | | | |
| J3 | Second visit, cold cache, same numbers | Two-visit comparison with band | | | | Band pending Fable |
| J4 | No `?ad=` and unknown `?ad=zz` | Runs vs main behavior | | | | |
| J5 | `?hero=games` and `?ad=d10` both reserved | Runs with random stubbed both ways | | | | |
| J6 | Link out matches landing page promise | Screenshots; Parent note | | | | Judge: Parent |
| J7 | Stripe return in in-app browser | Test mode run or human list | | | | Default HC5 |
| J8 | Scroll with toolbar collapse (proposed) | Harness run, viewport resize | | | | |
| J9 | Return visit keeps attribution (proposed) | Second session submit, `ad` equals first | | | | |
| J10 | Back, forward, background resume (proposed) | No duplicate `page_view`, no shift | | | | |
| J11 | Landing to join to jersey carries ad (proposed) | Param and cookie checks per page | | | | |

## H. Must-not cases

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| X1 | Preload only the chosen ad's hero | Image request list per ad | | | | |
| X2 | Fonts render identically once loaded | Covered by N1 | | | | Merge into N1 |
| X3 | No fallback font after fonts ready | `document.fonts.check`; computed family | | | | |
| X4 | No analytics hit from lab runs | Blocked log; zero connections | | | | See H6 |
| X5 | No new request to unseen hosts | Same as M3 | | | | Merge into M3 |
| X6 | No reserved box on desktop widths | Computed hero height at 960 and above | | | | |
| X7 | `form_start` only on real click | Touch matrix log | | | | Add scroll-start, paste, autofill, retry |
| X8 | Waitlist POST and Klaviyo payload unchanged | POST body diff main vs branch; N4 | | | | |
| X9 | `hero_view` not on load, restore, resize (proposed) | Beacon log | | | | |
| X10 | `hero_answer` and `hero_skip` only on tap (proposed) | Touch matrix | | | | |
| X11 | `generate_lead` and `Lead` not on failure (proposed) | 429, double tap, retry cases | | | | |
| X12 | `cta_click`, `text_karlin_start`, `faq_open` guarded (proposed) | Touch matrix | | | | |
| X13 | `signup_error` not on load, blur, autofill (proposed) | Beacon log | | | | |
| X14 | Interaction matrix applied to every event (proposed) | Matrix log | | | | |
| X15 | Capture of `ad`, UTMs, `fbclid` unchanged order (proposed) | Cookie and POST checks | | | | |
| X16 | Only disposable identities written (proposed) | Cleanup ledger vs request log | | | | |

## I. Process gates

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| P1 | Auditor sign-off on requirements | `auditor-phase1.md` verdict | `auditor-phase1.md` | | | Verdict: sign-off with changes |
| P2 | Three red teams before freeze | Three files; decision-log rows | | | | |
| P3 | Screenshots, test output, one file per lane | `ls`; ledger rows; lane files | | | | |
| P4 | Servers by PID; guard hook before phase 4 | Hook grep; `ss -ltnp` after each lane | | | | `.claude/settings.json` must be created |
| P5 | Terminal artifacts embed git evidence | `git status --porcelain`, `git log --oneline -3` pasted | | | | |
| P6 | Live means live on ekuzo.gg | `curl` ekuzo.gg; `git ls-remote origin refs/heads/main` | | | | Allowed end state: pending Jamie's push |
| P7 | Guard script copied and registered (proposed) | Settings grep | | | | |

## J. Proposed IDs awaiting Fable (from the phase 1 review)

| ID | Requirement (8 words) | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|---|
| R-PROT | Protected surfaces enumerated, landing hunk rule | Diff stat and template hash | | | | |
| R-VIS | Clone reference is main 45dfe97 build | Reference build exists on port 3101 | | | | |
| R-RUNCLASS | Class T and Class Q run definitions | Run metadata field per run | | | | |
| D1 | Dev deploy equals local branch build | Landing hash after fill | | | | |
| D2 | Only this build's commits proposed for main | `git log origin/main..branch`; diff stat | | | | |
| D3 | Port plan, PIDs, no leftover listeners | `ss -ltnp` after each lane | | | | |
| D4 | Cleanup ledger for every test write | Ledger rows vs request log | | | | |
| HC1 | Jamie S25 Instagram in-app d19 check | Screenshot or recording | | human-pending | | Gates release to main |
| HC2 | Jamie S25 Facebook in-app d18 check | Screenshot or recording | | human-pending | | |
| HC3 | Aaron iPhone Safari check | Screenshot or recording | | human-pending | | Gates release to main |
| HC4 | Test Events and DebugView confirmation | Screenshots | | human-pending | | |
| HC5 | Stripe return in in-app browser | Human checklist | | human-pending | | |

## K. Phase-4 gate rows (from build-loop.md)

| Gate | Test | Evidence path | Result | Verified by | Notes |
|---|---|---|---|---|---|
| Visual-parity (side-by-side at 1440 and 375/412, key states) | Pair files in `screenshots/`; Steward verdict | | | | |
| Browser-truth (console clean per page) | Console log per variant | | | | |
| Fail-closed analytics (guard recorded before functional tests) | `blocked.json` before first functional run | | | | |
| Touch-scroll case | Scroll gesture starting on each element | | | | |
| Real-device | HC1 to HC5 | | | | |
| Redirects on the deploy | `curl -sI` on dev | | | | |
| Fresh-eyes Parent follows a link out | Parent note, J6 | | | | |
| Cancelled-agent check (principle 10) | `ss -ltnp`, process list, file move log | | | | |
| Secret scan before push (principle 11) | Scan output over branch diff | | | | |
