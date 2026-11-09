# 07 Review guide: Season 01 landing run, 2026-11-09

Fable, written 16:10 to 16:40 CT after the Auditor's pass and the live after-run. Everything here
cites a file in this folder; if a claim and a file disagree, the file wins and the disagreement is a
defect to route.

## 60-second summary

- **What you asked for.** Fix the d18/d19 jump on phones, full Build Loop, nothing else broken, load
  effectively, evaluate the ads and payment system.
- **What the field said first.** Clarity, read in your browser before the plan: the jump was already
  fixed by the two Nov 5 releases (0 poor-CLS sessions of 185 scored in three days; the 0.7 in the
  daily reads came from a "last 3 days" window that still held pre-release loads). You approved the
  re-aim at 10:03: prove and harden stability, make the page load faster on in-app browsers, and run
  the evaluation. (`00-phase0-field-truth.md`)
- **Live after-run on ekuzo.gg** (16:00 to 16:10 CT, same harness and profile as this morning's
  `live-before`, Facebook Android 412, Slow 4G, N=3, tags blocked and 57 attempts logged, 0 leaks,
  0 POSTs; `evidence/vitals/live-after/table.md`): LCP d18 2156 to 1728 ms, d19 2836 to 1420, d2 2528
  to 1352, d4 1564 to 1084, d21 3184 to 2488; CLS 0.0001 to 0.0035 on every cell, unchanged; no max
  over 1.9 s. First paint earlier on d18, d2 and d4, later on d19 by 220 ms (ruled D29). The run
  stopped itself on the chrome profile's second d19 load when the page came back without a marker
  (a navigation failure read as a marker mismatch; harness fix OR-H3), so the chrome cells finished
  in a second label, `live-after-chrome` (Chrome Android 412, N=3: LCP d19 3012 to 1824 ms, d2 2440
  to 1276, d4 1164 to 1008, d21 3192 to 2504; CLS unchanged; 36 analytics attempts blocked, 0 leaks).
- **What is live on ekuzo.gg since 15:23 CT** (build marker `19b9963`, `evidence/fable/live/`):
  1. The landing loads its hero photo and only the fonts the ad uses before anything else, and the
     stylesheet that used to block first paint is gone from the body. Same pixels (66 of 66 screenshot
     pairs identical; Steward PASS). At Slow 4G on the Netlify CDN: LCP d18 2.16 s to 1.35 s, d19
     2.84 s to 1.73 s, d2 2.53 s to 1.61 s; first paint 0.1 to 0.4 s earlier; layout shift unchanged
     under 0.004. (`evidence/sentry-b/results.md`, `evidence/vitals/dev-tier1/table.md`, live:
     `evidence/vitals/live-after/table.md`)
  2. Checkout: after three declines Stripe cancels the payment and the old page kept re-confirming
     the dead one until a reload; now the next tap starts a fresh payment and the error reads the
     page's own fallback line. No victims yet (Stripe live: no failed or canceled payment since
     Aug 22). (`evidence/relay/hotfix-m1.md`)
  3. A regression harness (`scripts/field-vitals/`, `npm run vitals`) that measures the page the way
     Facebook and Instagram Android browsers see it, blocks every analytics host, and proves itself
     on the pre-fix page (d18 0.68, d19 0.61 in 5 of 5 runs). (`evidence/vitals/h7-proof.md`)
  4. Clarity masking on the email and phone inputs, a 15 s timeout on the sign-up request, a build
     marker on every landing build, and a repo hook that blocks pattern kills in Claude Code.
- **What it cost.** One rework cycle (the first build preloaded two photos on d19 and they shared the
  link; now one, `03-decision-log.md` D24), one QA fault (about nine localhost sessions landed in
  Clarity, `06-cleanup-ledger.md`), and the Auditor's ledger shows 49 PASS, 4 FAIL (all ruled below),
  32 PARTIAL (reduced tiers or author-only evidence), 8 UNEVIDENCED, 7 PENDING (your and Aaron's
  phone checks). (`04-evidence-ledger.md`, `05-defect-log.md`)
- **What you still do.** The two-minute d19 check in Instagram on the S25 (HC1); answer three
  questions (below); forward Aaron his list.

## Decisions you can overrule, most overrulable first

Full table with the why: `03-decision-log.md` (D1 to D29). The ones worth your eye:

| Decision | What | How to overrule |
|---|---|---|
| D24 | One hero preload per ad, the LCP photo first (d19 and d11 reordered) | "Preload both" (one line in `landing.html`, HERO_IMG slice) |
| D29 | L5 accepted: on d19 the script starts about 0.24 s later than before because the 93 KB jersey photo shares the link; LCP gains 1.1 s | "Drop the d19 preload": LCP goes back toward 2.8 s |
| D26 | d8's pre-existing 0.10 layout shift accepted (not a live ad; the interactive hero's options block) | Ask Aaron for a reserved height on `.ih-opts` |
| D21 | Your 11:10 standing go put HC1 after the push | Revert main (command below) and check on dev first |
| D12 | Fonts still come from Google, per ad; self-hosting deferred | "Self-host now" (this week, measured with the harness) |
| D16 | The 900 px jersey photo variant dropped: 0.59% pixel difference on DPR-2 phones, your clone rule | Aaron accepts the resample, one `srcset` line, 78 KB saved on d19 and d21 |
| D20 | The one checkout error shows the page's fallback line, not Stripe's text | One-line revert in `signup.html` |
| D11 | No test sign-ups on dev this run (the API writes the live Klaviyo list) | Read the dev env (HA5) and allow ledgered sign-ups |

## Three questions (the only ones that change sign-ups or payments)

1. **M-2 outbox alert.** A paid family's "Season 01 Committed" email, the Meta Purchase and the Discord
   commit post go through an outbox that retries five times and then stays silent. One Discord alert
   for sends that end failed, stale or skipped: ship this week? [Fable: yes]
2. **M-3 wallets in in-app browsers.** Apple Pay and Google Pay are likely absent inside the Facebook
   and Instagram browsers, so ad traffic sees a card form. When you do the d19 check, tap through to
   the signup page: do you see a wallet button? If not, add Aaron's "open in your browser" hint on
   the signup page? [Fable: yes if no wallet shows]
3. **O-12 daily canary.** A scheduled task each morning: fetch the live page, confirm the marker and
   the hero and form elements, POST an invalid email expecting 400, one short harness run, Klaviyo
   list count against the 7-day median; push notification on any miss. Create it? [Fable: yes]

## Guided walkthrough

**Live page, your phone (HC1, two minutes).** Paste `https://ekuzo.gg/season1?ad=d19` into an Instagram
DM to yourself and tap it (cold start). Expect: both photos in place before you scroll, no jump
scrolling to the bottom, the FAQ opens, the email field takes a tap and typing (do not submit unless
you mean to), no blank band above the hero. Then `?ad=d18` in Facebook if you have it (HC2). A
screen recording is ideal; a thumbs-up by message is enough.

**Numbers, in order of weight.**
1. `evidence/vitals/live-after/table.md`: ekuzo.gg after the push, same harness and profile as
   `live-before/table.md` (this morning). Stability and loading tables, median and max per cell.
2. `evidence/sentry-b/results.md`: the dev CDN run that decided the load-speed gate, with the
   before/after per ad.
3. `evidence/sentry-a/results.md` and `interim2.md`: local branch vs main, Tier 1 at N=5, the Class Q
   beacon equality (GA4, Pixel, Clarity calls, POST bodies and event order equal to main in nine
   scenarios and 41 gesture cells), failure profiles.
4. `evidence/vitals/h7-proof.md`: why the harness's numbers count.
5. `evidence/fable/preload-competition.md`: the one real miss and how it was found.

**Screenshots** (`screenshots/`, 32 files, `{ad}-{viewport}-{state}-{main|branch}.png`): every
main/branch pair is byte-identical (Auditor, md5). Open any `-main` and `-branch` pair side by side to
see the clone rule holding; the Parent's first-second shots are described in `parent-review.md` § 1.

**Run the harness yourself (Mac).** `scripts/field-vitals/README.md` § Run it on a Mac. Two minutes for
one ad at N=1.

## Deferred to humans

| Check | Who | What |
|---|---|---|
| HC1 | Jamie | S25, Instagram, d19 (above) |
| HC2 | Jamie | S25, Facebook in-app, d18 |
| HC3 | Aaron | iPhone Safari and the iPhone Instagram browser, d18, d19, d2; WebKit has no layout-shift API, so this is the only read we have for iPhone |
| HA6 / M-3 | Jamie | wallet buttons on `/season1/join` signup inside Instagram (question 2) |
| HC4 | Jamie or a session with the dev env | one `?s1qa=1` session on dev with Meta Test Events and GA4 DebugView open: `Lead` once, browser and server `event_id` equal |
| HC5 / J7 | Jamie | return from Stripe on `/season1/join/*` in an in-app browser; test-mode webhook endpoints listed first |
| HA3 | Jamie | Clarity project masking setting is Balanced or Strict (the attributes are now on the inputs either way) |

## Rulings on the ledger's FAIL and UNEVIDENCED rows

- **L5 (first long task later than main).** Local: a lab artifact (uncompressed HTML, D25). On the CDN:
  d18 and d2 start earlier than before (script proxy medians 1417 to 1352 ms and 1420 to 1114 ms);
  d19 starts later (1121 to 1513 ms, first sample of 250 ms) because its 93 KB LCP photo shares the
  link with the HTML's tail. Accepted as D29: the same ad's LCP improves 1.1 s, the hero box is
  reserved, and a parent typing an email within 1.5 s of arrival is the only one who feels it.
  Follow-up this week: try `fetchpriority="low"` on that preload on the dev CDN with the harness
  (OR-H2 in `06-findings-ranked.md`).
- **S1a Tier 2 (d8 at 0.10).** Pre-existing on main, not a live ad: D26.
- **J9.** Passes by design at the server (the `ekuzo_lc` cookie carries last-click attribution; the
  client field is the current URL's ad on main and branch alike): D27.
- **X16.** The Clarity leak (SA-2) is a real process fault; ledgered, stubs fixed, sessions
  identifiable by host `localhost:3101`. Lesson file written for the KB.
- **UNEVIDENCED.** S1c (images blocked) is covered in part by the `hero-404` failure profile on main
  and branch (harmless, forms usable); M1e, J3, J11, N7, N8 did not run (J3 is approximated by the
  run-to-run spread, max minus median under 0.0001 CLS on every Tier 1 cell); P5 is satisfied by this
  file and `08-return-handoff.md`; the secret scan ran after the push (`git diff 45dfe97 19b9963`
  grepped for key, token and private-key patterns and for emails: none beyond the
  `sk_test_placeholder` build string and the two `example.com` QA addresses), clean.

## After the push

- **Revert, if HC1 or HC3 finds something** (about four minutes to be live again):
  `git push origin 45dfe97:main --force-with-lease=main:19b9963`. Partial reverts, each one commit:
  landing bootstrap `git revert -m 1 32d39d4 2b9bc16 75473a2` (then rebuild marker stays), checkout
  fix `git revert 3ddbe0c a39d93b`, harness `git revert -m 1 d59cd4e`, hook `git revert e5acf2d`.
- **Tomorrow's readout.** Clarity's performance panel will mix today's pre-push and post-push loads for
  three days; filter Recordings from 15:23 CT. Exclude sessions whose page host is `localhost:3101`
  (the SA-2 leak). The build marker on the live page says which build a session saw.
- **This week, code (your lane):** M-2 outbox alert (question 1); M-4 a host or mode guard on
  `/api/season-one` so dev sign-ups cannot write the live list; O-10 `signup_error reason=rate_limited`
  and `signup_quiet` events; M-13 CAPI `fbp`/`fbc` validation and the token out of the URL; M-5
  re-commit before every confirm; OR-H1 a gzip proxy for the local lab; OR-H2 the `fetchpriority` trial.
  All in `06-findings-ranked.md` with owners and defaults.
- **Dev branch.** `dev` carries the same code through two integration merges (`4635c89`, `91f5503`) with
  its roadshow and ad-lab files kept. Never merge `dev` into `main`.

## For Aaron (site state, no action today; his lane)

- d19 and d21 ship `team-walk-1600.webp` (146 KB) into a hero slot about 400 CSS px wide; the 900 px
  variant saves 78 KB and differs by 0.59% of pixels on DPR-2 phones (`evidence/atlas/l4-srcset-trial-*.png`).
  His call under the clone rule (D16).
- `img.jb` (the jersey photo on d11, d19, d20, d21) has no `width`/`height`; the hero box is reserved so
  nothing outside moves (SA-5, SB-1), but the attributes would close the strict check.
- The landing has no Privacy Policy link while it collects email and phone (U-9; the thanks page has one).
- The sticky "Save their spot" bar reads as plain text to a fresh reader (Parent review § 3).
- "Weekly practice with a coach" on d18/d19 against the FAQ's twice a week (on record since 11-05,
  Steward F-2); the gamer-tag jersey promise on d19 against canon's EKUZO jersey (Steward F-3, decide
  before d19 moves to the main ad set Wed 11-11); "You'll meet your coach before the season starts" is
  not in canon (Steward row 6).
- The "Text Karlin" fine print reads as a joke more than a consent (U-10).
- `.ih-opts` on the interactive heroes has no reserved height (d8 shows a 0.10 shift when it appears; D26).
- The repo now has `.claude/settings.json` with a PreToolUse hook that blocks `pkill -f`, `pgrep -f` and
  `ps | grep` in Claude Code. If it gets in his way he can delete it locally; say so at standup.

## KB backport candidates

Six lessons-pending files dated 2026-11-09, with exact prose and target sections, delivered with this
run (the laptop was offline, so they are files to drop into `system/loops/lessons-pending/`):
`next-start-by-binary-and-child-pid`, `class-q-stubs-by-host-regex-with-offender-check`,
`field-truth-read-before-a-fix-brief`, `readout-windows-split-at-releases`,
`local-next-start-is-uncompressed`, `timestamps-from-the-clock`. The session debrief and the daily log
entry are in the same bundle.

## Git state at writing time

See `08-return-handoff.md` for the embedded `git status --porcelain` and `git log --oneline -3`
captured together; this file is committed in the same minute.
