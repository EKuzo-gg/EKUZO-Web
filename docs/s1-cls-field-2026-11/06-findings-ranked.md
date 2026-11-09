# 06 Ads and payment system: findings ranked by effect on sign-ups and money

Fable, 2026-11-09 (draft 10:28 CT; final at run end). Sources: `redteam-money.md` (M), `redteam-users.md`
(U), `redteam-ops.md` (O), `scout/codebase-map.md`, Clarity field data in `00-phase0-field-truth.md`.
Jamie's rule: ranked by effect on sign-ups and money; low-impact defaults to "not now"; only items that
change sign-ups or payments are questions for him. Columns: effect (what it costs today), type,
owner, when, evidence.

## Context from the field (Clarity, Nov 6 to 9, post-fix)

- 440 sessions, 94% mobile, 66% Facebook in-app, 14% Instagram in-app, 9% Chrome Mobile, 5% Mobile Safari.
- Layout shift: 0 poor sessions of 185 scored (closed by the Nov 5 releases).
- LCP >= 4 s on about 10% of scored sessions (19), mostly Facebook in-app; INP poor on 5.
- Funnel in 3 days: `/season1` 386 entries; join pages entered 29 times; "Checkout" fired in 12 sessions;
  "Order success" 3. The 12-to-3 step is the money step to watch on in-app browsers.
- JS errors in 10% of sessions, 94% of them the Facebook Android WebView bridge message (not our code).

## Now (this run)

| # | Finding | Effect today | Type | Owner | Evidence |
|---|---|---|---|---|---|
| 1 | **M-1** After three declines the webhook cancels the PaymentIntent; the signup page re-confirms the dead one on every later tap; only a reload recovers | A parent who tried three times (the one most worth keeping) cannot pay without a reload. Frequency so far: zero. Stripe live shows no failed or canceled payment since Aug 22 (read 10:34 CT), so the path has not fired yet; it ships as a tested fix in the branch, not an emergency push | code-bug, live | Relay (Slice 0 hotfix) | `redteam-money.md` § M-1, probe `probe-3declines.out.json` |
| 2 | **U-1, U-2** The all-families Google Fonts stylesheet (14 families, 226 rules, 158 KB parsed) sits in the body and blocks first paint, the hero build and the form handlers; the hero photo is requested only after it; a stalled fonts host leaves a blank page with a dead form | Every ad visitor on a slow in-app browser waits on one third-party request before seeing anything; LCP >= 4 s on about 10% of sessions | spec-gap, perf | Atlas (Slice 2) | `redteam-users.md` § U-1/U-2, Scout § 3 probe (hero image starts ~0.25 s after the CSS ends; LCP 2.9 to 3.4 s in the lab) |
| 3 | **M-9, U-8** No client timeout on the waitlist POST: a stalled in-app connection leaves "Saving…" with the button locked until the browser gives up | Lost sign-ups on flaky carrier connections; the parent sees a frozen button and leaves | improvement | Atlas (Slice 2 item 8) | `landing.html:1424-1449` |
| 4 | **U-5** No `data-clarity-mask` on the landing's email and phone inputs or the founder card; masking rests on the Clarity project setting | Parent PII in session replays if the project is not on Balanced or Strict | code-bug, privacy | Atlas (attributes) + Jamie HA3 (setting) | `tags.ts:165`, `landing.html:919-984` |
| 5 | **U-17, L7** The hidden founder avatar (14 KB) loads before the hero photos | Bandwidth taken from the hero in the first second | improvement | Atlas (lazy) | Scout § 3 (request at 382 ms) |
| 6 | **O-6, O-7, OR7, OR8** No build marker; production landing cached a year with no validator; "live" cannot be proven from headers | Every release's live check is a guess; a failed dev build silently serves stale content to QA | infra-gap | Atlas (marker) + Sentry (proof) | `redteam-ops.md` § 2 |
| 7 | **H1 to H9** No field-faithful regression gate; prior loops measured the wrong commit as "before" | Future landing changes can regress stability or speed unseen until Clarity reports it days later | process | Chronos (Slice 1), done: `scripts/field-vitals/` | `evidence/vitals/h7-proof.md` (pre-fix 3433a5b reproduces d18 0.68, d19 0.61; main under 0.004), `main-baseline/table.md`, `failures-main.md`, `live-before/table.md` |
| 7b | **SA-1, L5** (found in QA, fixed in the run) Two preloaded hero photos on d19 shared the link with the HTML and each other; the photo that counts finished at 2.4 s and the form handlers came 1.1 s later in the lab | d19 is the top ad; on the real CDN the HTML is gzipped (37.6 KB) so the handler delay mostly vanishes, but the LCP photo still waited on its sibling | perf | Atlas (D24 rework): one preload per ad, LCP element first (d19 southie-back, d11 jersey-back) | `evidence/fable/preload-competition.md`, `evidence/atlas/rework-d24.md` (slow4g d19: LCP 2536 to 1956 ms, ready 2489 to 1781 ms, local lab) |

## This week (recommended; Fable's default in brackets)

| # | Finding | Effect | Type | Owner | Default |
|---|---|---|---|---|---|
| 8 | **M-2** Outbox rows that fail 5 times (about 10 minutes of 2-minute retries), go stale, or skip for missing config are never surfaced | A paid family can lose the "Season 01 Committed" email (share code, friend ladder), the Meta Purchase the ads learn from, and Karlin's Discord commit post, with no alert | infra-gap, money | code (Jamie's lane) | **Question for Jamie** (touches the payment path): one Discord alert for live sends that end failed, stale or skipped [yes, this week] |
| 9 | **M-3** Apple Pay and Google Pay are likely unavailable inside the Facebook and Instagram in-app browsers, so ad traffic sees a card form instead of wallet-first checkout | The one-shot Purchase ad: $250.84, 49 join views, 0 pay submits. Checkout standard (wallet first) is not met for 80% of traffic if confirmed | hypothesis, money | Jamie HA6 (2-minute check on the S25), then Aaron for an "open in your browser" hint | **Question for Jamie** after HA6: add the hint? [yes if no wallet shows] |
| 10 | **M-4, O-2** The waitlist API has no test mode or host guard: any sign-up on the dev deploy writes the live Klaviyo list and may send a live Meta Lead | Testing the funnel safely is impossible without reading the dev env first; one stray QA sign-up pollutes the list and the pixel | infra-gap | code | [host or mode guard on `/api/season-one`; this week] |
| 11 | **O-10, OR11** Neither the 429 nor the quiet path emits a client event; the only trace is Netlify function logs | Real parents hitting limits on shared Wi-Fi (schools, co-ops, a talk) are invisible in GA4 and the readout | infra-gap, measurement | code (`landing.html` additive events) + readout | [add `signup_error reason=rate_limited` and `signup_quiet`; readout adds the Klaviyo vs Meta Lead gap] |
| 12 | **U-9** The landing collects email and phone and runs three trackers with no Privacy Policy link (the thanks page has one); geo is stored and not disclosed | Trust and compliance exposure on the page most visitors see | spec-gap, trust | Aaron (copy locked) | [footer link, this week] |
| 13 | **U-11** The 429 text shows the founder's number as plain text and re-enables the same button | The likely next tap is a second 429; the number is not tappable | code-bug, minor | Aaron/Jamie | [render as an `sms:` link, same words] |
| 14 | **M-13** CAPI Lead sends `_fbp`/`_fbc` unvalidated, builds `fbc` from event time, and puts the Graph token in the URL query | Match quality (EMQ 7.5 today) and a token in request logs | code-bug | code (Jamie's lane) | [reuse `validFbp`/`validFbc`, token in the body] |
| 15 | **M-5** A second tab with a cached client secret can confirm after the other tab paid | Double charge for the same kid, refunded by hand | code-bug, minor | code | [re-commit before every confirm] |
| 16 | **O-4, D12** Fonts still come from Google with a blocking per-ad request (smaller after this run) | One third-party hop and single point of failure remain on the critical path | improvement | code | [self-host the families in use; measure first-paint gain with the harness] |
| 16b | **OR-H1** (D25) The local lab serves the landing HTML uncompressed (`next start`, 137 KB on the wire) while Netlify gzips it to 37.6 KB, so local L1 and L5 numbers exaggerate how much early image bytes delay the script | Lab verdicts on load order can mislead; today it cost one rework cycle of diagnosis | harness | Chronos | [a gzip reverse proxy option in `scripts/field-vitals` (about 30 lines of Node), rerun the main baseline through it] |
| 16d | **OR-H2** (D29) d19's first paint and script start come 0.15 to 0.25 s later than before while its LCP falls 1.4 s; the 93 KB jersey preload shares the link with the fonts sheet and the HTML's tail | A trade worth keeping, and maybe one worth improving | harness experiment | Chronos | [one dev-CDN run with `fetchpriority="low"` on the d19 preload and one with no preload, N=5, same harness; keep whichever gives the lowest LCP without a later first paint] |
| 16e | **OR-H3** The harness reads a failed navigation as a build-marker mismatch and exits 2 before writing `table.md`, `manifest.json` and `blocked.json` (live after-run, chrome d19 run 2) | A transient network error ends a 30-run session and loses its summary files until `report.mjs` regenerates the table | harness bug | Chronos | [on `navError`, retry the load once and otherwise record the run as failed and continue; write the summary files after every run, not only at the end] |
| 16c | **L4, D16** d19 and d21 ship `team-walk-1600.webp` (146 KB) into a hero slot about 400 CSS px wide; the 900 px variant saves 78 KB but differs by 0.59% of pixels on DPR-2 phones, which the clone rule forbids | About 0.4 s of LCP on d19 and d21 at Slow 4G | design trade | Aaron (his design) | [Aaron looks at `evidence/atlas/l4-srcset-trial-d19-412x2-{main,branch}.png`; if he accepts the resample, Atlas adds the `srcset` in one line] |
| 17 | **O-12, OR16** Nothing alerts the team if the landing page or the sign-up function breaks at 2 am | Hours of paid traffic to a dead page | infra-gap | Fable creates on Jamie's OK | **Question for Jamie**: daily canary scheduled task (page marker, `#hero`, `#em-top`, an invalid-email POST expecting 400, one quick harness run, Klaviyo count vs 7-day median) [yes] |

## Not now (default; revisit on the stated trigger)

| Finding | Why not now | Trigger |
|---|---|---|
| M-6 `/season1/join*` strips `?ad=`, so `/join/jersey?ad=d20` shows the d19 hero and `season1_join_view` carries no ad | No live ad links to the join pages today | the one-shot ad or any direct-to-join ad returns |
| M-7, M-8 Per-IP commit limit (5 per 10 min) and site-wide quiet above 150 sign-ups an hour | Unlikely at current volume | before any creator push: raise `GLOBAL_QUIET` |
| M-10 Email typo help ("did you mean gmail.com") | 5 invalid-email errors in 3 days vs 66 Leads; copy is Aaron's | Aaron's next copy pass |
| M-11 "First 100 families" jersey has no count cap in code | 3 commitments so far | commitments pass 60 |
| M-12 Link may allow bank funding (PI stays `processing` for days) | Unconfirmed | Jamie reads Link funding settings (checklist 4.6) |
| M-14 Legacy camps webhook skips signature checks when its secret is unset and logs parent email | Camps return in February | before camps reopen |
| O-14 Hero images answer `max-age=0, must-revalidate` (a 304 round trip on warm visits) | Touches every `IMG` path | next landing rebuild |
| U-4b Replay a submit tapped before the handler attaches | Measured first (Atlas); behavior change | harness shows the window is real on `fb-android` slow4g |
| U-10 Text Karlin fine print reads as a joke more than a consent | Copy locked; Steward reads it in phase 4 | Jamie's next copy pass |
| U-14, U-16, U-18, U-19 Tap targets under 44 px, reduced motion ignored, 500 copy blames the parent, page A has no h1 | Aaron's lane, polish | Aaron's next pass |
| U-13 WebViews older than Chrome 108 drop `svh`/`cqw` | `80vh` fallback added this run; the rest accepted | Clarity shows an old-WebView share |

## Verified sound (money lens read; no action)

Server-side price with `expectedCents` and 409 `price_changed`; kid count capped at 4; fulfil refuses on
amount, currency, order or mode mismatch; PaymentIntent idempotency key `s1-pi:<order>`; one Customer per
family; webhook dedupe on `stripe_event_id`; refund script bounded and keyed 24 h; Purchase `event_id` =
order public id on Pixel and CAPI; waitlist Lead `event_id` shared between Pixel and CAPI; test-mode
Klaviyo limited to `team+s1test*`/`aaron+*`; test-mode Meta Purchase forced to a test event code; mode
fails closed to off. Apple Pay needs no `/.well-known` file (its 404 is not a defect).

## Questions for Jamie (the only three that change sign-ups or payments)

1. M-2: ship the outbox failure alert to Discord this week? [Fable: yes]
2. M-3: if HA6 shows no wallet inside Instagram on your S25, add Aaron's "open in your browser" hint on the signup page? [Fable: yes]
3. O-12: create the daily canary scheduled task after the main push? [Fable: yes]
