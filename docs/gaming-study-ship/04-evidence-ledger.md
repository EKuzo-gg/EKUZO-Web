# 04 Evidence ledger (Auditor, late phase)

Written 2026-10-11 night. Worktree `.claude/worktrees/gaming-study-ship`, branch `build/gaming-study-ship`, HEAD `8cfe704` plus uncommitted docs.
Every evidence path below is relative to `docs/gaming-study-ship/` and was opened. No role summary was taken on trust where a file could be read. Auditor checks run at writing time, against the tree: `git diff 9f4e523 8cfe704` (three app files, four hunks), the NR-2 protected-path command at HEAD (prints nothing), `du` and an `.mp4` grep over the current `.next/server` (built 22:59 from 8cfe704), the FooterBanner heading at `page.tsx:781`, and the `axe-*.summary.txt` counts.

## How to read the dates

- 9f4e523 was committed 22:20:30; 8cfe704 at 22:59:53. The static lane (`evidence/static/`, 22:22 to 22:27) and Sentry's first full run (`evidence/sentry/`, 22:22 to 22:58) ran against 9f4e523, but Sentry's "final" mode-on build (22:50) already contained the three edits that became 8cfe704 (`sentry/tree-drift-at-final-build.diff` is the same diff as `git diff 9f4e523 8cfe704` for the app files). Sentry cycle 1 (`evidence/sentry-cycle1/`, 23:01 to 23:33) ran on a build of 8cfe704 (`next-build.txt` 22:59:58).
- The delta from 9f4e523 to 8cfe704 is: hero `sizes` attribute, `{" "}` after the "Short answer:" label, a curly apostrophe in the S2.5 paragraph of `when-your-sons-only-friends-are-online`, and the sitemap `lastModified` for that post. No other string changed. A row whose text is in none of those four places is treated as not stale.
- The full copy-fidelity script (`static/fidelity.mjs`, output `static/copy-fidelity.txt`) was run once, on 9f4e523. It was not re-run on 8cfe704. Only the specific fixes were re-verified (Sentry cycle 1 Part A rows 1, 5 and 6). This is stated in each affected row.

## 1. Requirement ledger

Results: PASS, PASS WITH NOTE, FAIL, PENDING-HUMAN, PENDING-SHIP, NOT RUN. Role names: Static = Sentry static lane; Sentry = browser lane (first run `sentry/`, cycle 1 `sentry-cycle1/`); Relay; Steward; Parent; Atlas; Auditor = checked by me at writing time.

### Copy

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| CP-1 | "this week" out of title and /blog title | rendered-text diff | `evidence/static/copy-fidelity.txt` (MATCH post and /blog), `evidence/head-and-schema.txt` (title, regenerated 23:07 on 8cfe704) | PASS | Static | |
| CP-2 | Short answer first body paragraph, bold label | rendered-text diff | `evidence/static/copy-fidelity.txt` (DIFF on 9f4e523: "Short answer:one"), `evidence/sentry-cycle1/results.md` Part A row 1 (DOM text starts "Short answer: one study of 923 adults, averag", one space, 1440 and 375; served HTML `</strong> <!-- -->one`), `reviews/04-steward-rendered.md` Re-run "The first paragraph" | PASS WITH NOTE | Sentry, Steward | D-01, S-001 (closed). Note: the fix is proven by a 44 character DOM prefix and a screenshot, not by a full-paragraph fidelity re-run; `static/copy-fidelity.txt` still shows the old DIFF |
| CP-3 | C3b second paragraph trimmed | rendered-text diff | `evidence/static/copy-fidelity.txt` (MATCH) | PASS | Static | |
| CP-4 | "tennis, piano, orchestra" | rendered-text diff | `evidence/static/copy-fidelity.txt` (MATCH) | PASS | Static | |
| CP-5 | Graphic placement, width, alt | screenshot + DOM alt | `evidence/static/copy-fidelity.txt` (alt MATCH), `evidence/sentry/results.md` CP-5 row (560 px centred at 1440; 321 of 321 px at 375; between the named paragraphs), `screenshots/post-1440-graphic.png`, `screenshots/post-375-graphic.png` | PASS | Static, Sentry, Steward | |
| CP-6 | Both Chaarani links to 2797596, landing title recorded | href check + landing title | `evidence/static/links-table.md`, `evidence/static/links/crossref.json` | PASS WITH NOTE | Static | S-006. Hrefs correct. The landing title is not recorded from the page: JAMA returns a Cloudflare challenge, the title rests on Crossref. The defect log closes S-006 on "notice page loaded in a browser links View Article to 2797596"; no screenshot or file of that browser read is on disk. A human click is still wanted |
| CP-7 | C7 sources line view counts | rendered-text diff; Jamie approval | `evidence/static/copy-fidelity.txt` (S4 MATCH), `evidence/static/bare-13-7.txt` (no combined figure), `02c-approved-copy.md` | PASS WITH NOTE | Static, Steward | Approval is Jamie's "make updated posts and fixes you mentioned" with S4 "open to a veto" (`02c`), not a line-by-line yes. The counts themselves have no read evidence on disk (see CP-14) |
| CP-8 | FAQ question in page and FAQPage schema | DOM + JSON-LD | `evidence/head-and-schema.txt` (FAQPage lists "Is gaming good for kids' brains?", 8cfe704), `evidence/static/copy-fidelity.txt` | PASS | Static, Sentry | |
| CP-9 | H2 "What the study found, and what it didn't" | DOM | `evidence/static/copy-fidelity.txt` (MATCH), `evidence/static/tg5.txt` (outline) | PASS | Static | |
| CP-10 | FooterBanner heading string; banner screenshot in Season 01 mode | source + screenshot | `evidence/static/post-source-diff.txt`, `page.tsx:781` (Auditor grep: `heading="Every gamer deserves a team"`), `screenshots/post-1440-footerbanner.png`, `evidence/sentry/results.md` CP-10 row | PASS | Static, Sentry, Auditor | |
| CP-11 | S1 opening | Jamie approval, then diff | `evidence/static/copy-fidelity.txt` (S1 MATCH), `evidence/static/bare-13-7.txt`, `02c-approved-copy.md` | PASS WITH NOTE | Static, Steward | S-004 and ST-003 (accepted minors: "13.7" without its correction in the same paragraph; Jamie chose this version) |
| CP-12 | Five inbound-link sentences | Jamie approval of each; diff | `evidence/static/copy-fidelity.txt` (words, anchors, links MATCH; apostrophes differ), `evidence/static/inbound.txt`, `evidence/static/source-post-diffs.txt`, `evidence/sentry-cycle1/results.md` Part A row 6 (S2.5 now curly) | PASS WITH NOTE | Static, Sentry | S-002 (accepted: four of five render straight apostrophes where the approved text is curly). SC-2: approved as a batch, not one at a time. Only S2.5 was re-read after cycle 1 |
| CP-13 | S3 hero alt | approval, then DOM alt | `evidence/static/copy-fidelity.txt` (MATCH); alt unchanged in `git diff 9f4e523 8cfe704` (Auditor) | PASS | Static, Auditor | |
| CP-14 | S4 counts re-read on ship day | read evidence in ledger; Jamie approval | text MATCH in `evidence/static/copy-fidelity.txt`; no screenshot or stated read of the 17.2M, 5.8M, 7.9M or 33M figures anywhere in `evidence/` | PENDING-HUMAN | | Jamie's ship-day read. Until then the figures come from the brief (`02a-copy-deck.md`) only |
| CP-15 | Closing line stays | rendered-text check | `evidence/static/copy-fidelity.txt` (MATCH) | PASS | Static | |
| CP-16 | Voice lint on new or changed strings | grep | `evidence/static/voice-lint.py`, `evidence/static/voice-lint.txt` (1599 added lines vs 0da2e89, 19 hits, all in `app/api/season-one/route.ts` and `app/season1/landing.html`, files from the origin/main merge) | PASS WITH NOTE | Static, Steward | Run on 9f4e523. Not re-run on 8cfe704; the delta adds no dash, arrow or banned word (Auditor read of the diff). Reframes judged by Steward (`reviews/04-steward-rendered.md` section C) |
| CP-17 | Claims-trace table | Steward table | `reviews/04-steward-rendered.md` section A (head and metadata, images and alt, body, five link sentences, FAQ; per sentence row and result) | PASS WITH NOTE | Steward | Table present and complete on 9f4e523. After cycle 1 the Steward re-read only the first paragraph and the second half at 375. Residual minors ST-003, ST-004, ST-012, ST-017 |
| CP-18 | Keep Reading, three cards, stated order | screenshot | `evidence/sentry/results.md` CP-18 row (1440 and 375), `screenshots/post-1440-keepreading.png`, `screenshots/post-375-keepreading.png`, `evidence/static/post-source-diff.txt` | PASS | Static, Sentry, Steward | |
| CP-19 | Frozen strings unchanged | string diff vs 0da2e89 | `evidence/static/copy-fidelity.txt` (CP-19 lines MATCH), `evidence/static/post-source-diff.txt` | PASS | Static | |
| CP-20 | Stale-phrase scan | grep | `evidence/static/stale-phrasing.txt` | PASS WITH NOTE | Static | S-003 (Lolcat transcript "last week", verbatim speech, pre-existing) |

### Dates and listing

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| DT-1 | Dates are the merge day | source + JSON-LD | `evidence/head-and-schema.txt` (BlogPosting datePublished and dateModified 2026-10-12, article:published_time, regenerated 23:07 on 8cfe704) | PENDING-HUMAN | Sentry | Built as 2026-10-12; recheck on the day the merge actually lands (Jamie) |
| DT-2 | Visible "Updated" date | DOM | `evidence/head-and-schema.txt` ("Updated October 12, 2026"), `evidence/sentry/results.md` DT-2 row | PASS | Sentry | |
| DT-3 | Featured on this post only; revert date in WORKLOG | /blog screenshot; WORKLOG | `evidence/sentry/results.md` DT-3 row, `evidence/sentry/json/blog-index-links.json`, `screenshots/blog-1440-top.png`, `app/blog/page.tsx` (one `featured: true`, line 27) | PASS WITH NOTE | Sentry, Auditor | `WORKLOG.md` has no entry for this run yet and no revert date; Jamie's approval of the reminder is not recorded. Belongs to CL-3 |

### Assets

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| AS-1 | Hero dimensions, 520 px frame, survives crop at 1440, 1024, 768, 375 | dimensions + Steward screenshots (gate changed by SC-1) | `evidence/static/images.txt` (2400x1260), `evidence/image-hashes-optimized.txt`, `reviews/04-steward-rendered.md` section D and Re-run "Hero", `evidence/sentry-cycle1/a-hero-resource.json`, `screenshots/post-{1440,1024,768,375}-hero.png` | PASS WITH NOTE | Static, Steward, Sentry | ST-001 (closed), ST-002 (accepted: two stickies cut mid-word at 768 and on the /blog card), DPR 3 at ratio 0.81 accepted by Steward. Byte-identity dropped by SC-1 |
| AS-2 | Card: og:image and twitter:image resolve; index card uses it; link preview on the deploy | curl + meta; preview tool | `evidence/head-and-schema.txt` (both meta point to the card; file 200, 94471 bytes), `evidence/static/images.txt` (1200x630), `app/blog/page.tsx:25` | PENDING-HUMAN | Static, Sentry | Link-preview check on the deploy is Jamie's. Everything automatable passes |
| AS-3 | Graphic present, 1080x1350 | dimensions + parity | `evidence/static/images.txt`, `evidence/image-hashes-optimized.txt`, `reviews/04-steward-rendered.md` section D (50.6 dB, palette note) | PASS WITH NOTE | Static, Steward | Byte-identity replaced by dimensions plus Steward parity (SC-1) |
| AS-4 | Hero does not collide with the top-right brush | Steward side-by-side | `reviews/04-steward-rendered.md` section D table ("brush collision PASS") | PASS | Steward | H2 (template brush crosses the headline on phones, pre-existing, every post on this template) |
| AS-5 | Visual-parity gate at 1440 and 375 | Steward PASS/FAIL | `reviews/04-steward-rendered.md` gate table, VISUAL PARITY "APPROVED WITH MINORS" after cycle 1 | PASS WITH NOTE | Steward | ST-002, ST-014, ST-016 (minors) |

### Popups and bars

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| PB-1 | No blog newsletter popup, mode on, desktop and phone | browser | `evidence/sentry-cycle1/results.md` row 7a (8cfe704), `evidence/sentry/results-pb.json`, `evidence/sentry-cycle1/pb.out` | PASS | Sentry | |
| PB-2 | Sticky bar is the Season 01 bar | browser | `evidence/sentry-cycle1/results.md` row 7b, `evidence/sentry-cycle1/html/post-{1440,375}-stickybar.html`, `screenshots/post-1440-stickybar.png` | PASS | Sentry | |
| PB-3 | No A/B state written, no `newsletter_impression` | localStorage + beacon log | `evidence/sentry-cycle1/results.md` row 7c, `evidence/sentry/results-pb.json` | PASS | Sentry | |
| PB-4 | Mode off: popup and bar behave as before the merge | browser on an off build | `evidence/sentry/results-pb4.json`, `evidence/sentry/pb4-run-output.txt` (12 runs, 13 PASS lines), `evidence/sentry/sentinels-off.txt`, `evidence/sentry/next-build-mode-off.txt`, `pb4-*.png` | PASS WITH NOTE | Sentry | Off build made 22:46 from the working tree before cycle 1; not repeated in cycle 1 (no behavioural file changed in the delta) |
| PB-5 | One ask per page view | browser | `evidence/sentry-cycle1/results.md` row 7d, `evidence/sentry/results-pb.json` | PASS | Sentry | |
| PB-6 | Gating edits exactly two | `git diff` | `evidence/sentry/pb6-diff.txt` (layout.tsx mount gated, StickyCTA `isBlogPost = !SEASON_ONE_MODE && ...`) | PASS WITH NOTE | Sentry | The Auditor's request (`reviews/01-auditor-requirements.md`, change 4) to keep a pre-edit failing run was not met; the mode-off build in PB-4 is the positive control for the detector |
| PB-7 | Mode sentinels on every run | sentinel lines | `evidence/sentry/sentinels-A.txt`, `sentinels-A2-final-on.txt`, `sentinels-off.txt`, `sentinels-B-and-torn-paper-curl.txt` | PASS WITH NOTE | Sentry | No sentinel lines for Sentry cycle 1 or for the Klaviyo proof server (mode on is inferred from the Season 01 bar HTML in `sentry-cycle1/html/`) |

### Attribution journeys

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| JR-1 | UTM arrival, sign-up: request, Klaviyo event, GA4 | browser + Klaviyo readback | Request/GA4: `evidence/sentry-cycle1/json/JR_1-1440.json` (source site-popup, attributionFrom url, utm x/social/gaming-study/karlin, page with query, one `generate_lead` source `season_one_popup`, one fbq Lead with matching eventID). Klaviyo: `evidence/klaviyo-proof/readback.json` (event 7ws7CyuYpJc, attribution_from url, same utm, page with query), `evidence/klaviyo-proof/browser-run.json` (POST body and 200) | PASS WITH NOTE | Sentry, Relay | Klaviyo-side evidence exists. List subscribe returned 403 (key lacks `subscriptions:write`, `evidence/klaviyo-proof/server.log`), so list join and Meta dedupe were not exercised. Event sent from a local server (SC-3), not the deploy |
| JR-2 | No UTMs | browser + Klaviyo | `evidence/sentry-cycle1/json/JR_2-1440.json`, `JR_2_phone-375.json`, `evidence/klaviyo-proof/readback.json` (event 7ws7iJKwHEa, attribution_from none, bare page) | PASS | Sentry, Relay | |
| JR-3 | AI referrers fire `ai_referral` once | browser on `next start` | `evidence/sentry-cycle1/results.md` row 7g, `evidence/sentry-cycle1/results-ai.json`, `json/ai-*.json` | PASS | Sentry | D-07 (look-alike hosts also fire, pre-existing, informational) |
| JR-4 | Page to page keeps first touch | browser | `evidence/sentry-cycle1/json/JR-4-*.json` (4 files) | PASS | Sentry | |
| JR-5 | Dismissed popup, return within 7 days | browser | `evidence/sentry-cycle1/results.md` Part A, `evidence/sentry/results-pb.json` (6 days stays closed, 8 days opens) | PASS WITH NOTE | Sentry | D-10 (the requirement's "backdrop" dismissal does not exist; a FAIL row in `results-pb.json` is a test of a non-existent interaction) |
| JR-6 | Arrival from /blog featured card | browser | `evidence/sentry/results-pb.json` (JR-6 rows), `evidence/sentry-cycle1/results.md` | PASS | Sentry | |
| JR-7 | Phone touch repeats JR-1 | browser 375 | `evidence/sentry-cycle1/json/JR_7_JR_1_on_phone_-375.json` | PASS | Sentry | |
| JR-8 | utm_source instagram, linkedin, email | browser | `evidence/sentry-cycle1/json/JR_8_{instagram,linkedin,email}-1440.json` | PASS | Sentry | |
| JR-9 | UTM visit, then new session without UTMs | browser | `evidence/sentry/json/JR-9.json` (first run; cycle 1 notes it PASS in `results.md` row 7i) | PASS | Sentry | Recorded as existing behaviour (decision 8) |
| JR-10 | Other post shows the same one-ask behaviour | browser | `evidence/sentry/results-pb.json` (JR-10 rows), `evidence/sentry-cycle1/json/fortnite-*-pb-calls.json` | PASS | Sentry | |

### Must not

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| MN-1 | No blog popup or bar in Season 01 mode | browser | same as PB-1, PB-2 | PASS | Sentry | |
| MN-2 | No two asks in one view | browser | same as PB-5 (`maxDialogs` 1) | PASS | Sentry | |
| MN-3 | No beacon reaches live GA4, Clarity or Meta; guard recorded first, every context proxied | proxy log | Guard: `evidence/guard-selftest.txt` (Relay, 21:03:50, "All non-local requests denied: YES", positive control exercised). Per-run logs (Auditor counted: denied equals total, zero allowed, zero vendor hosts): `sentry/proxy-log-shoot.jsonl` (115 connects), `proxy-log-shoot2.jsonl` (374), `proxy-log.jsonl` (2806), `sentry-cycle1/proxy-log.jsonl` (2290), `klaviyo-proof/proxy-log.jsonl` (29). Self-tests: `sentry/guard-selftest-sentry.txt` (22:30), `sentry-cycle1/guard-selftest-cycle1.txt` (23:01) | PASS WITH NOTE | Relay, Sentry | (1) Atlas's phase-3 shoot that produced the screenshots committed in 3195327 has no proxy log on disk; those images were all retaken at 23:06 under a logged proxy. (2) Sentry's own self-test (22:30) postdates its shoot runs (22:22 to 22:28); those runs have their own logs showing zero allowed, and Relay's 21:03 guard precedes them. (3) `sentry-cycle1/results.md` quotes 2125 requests, the log file now holds 2290 connects (later adversarial tests appended). (4) The Klaviyo proof ran on a separate proxy (port 39013) with no self-test of its own, following the 23:01 test |
| MN-4 | No live Meta Lead; zero unintercepted POSTs | request logs | Server logs: `sentry/serverA-reqlog.jsonl` (1 line, own OPTIONS logger probe), `serverA2-`, `serverB-`, `serverOff-reqlog.jsonl` (0 each), `sentry-cycle1/server-reqlog.jsonl` (23 lines, all curl probes). Klaviyo proof: `klaviyo-proof/server.log` (two "Meta CAPI token or pixel ID not configured; skipping server-side Lead event"), README (token blanked). Browser POSTs answered in `context.route`, field `unexpected` 0 | PASS | Sentry, Relay | D-08 (popup has no live-host guard; accepted risk, decision 8) |
| MN-5 | No Lead on load, open, dismiss, autofill, touch scroll, retry | browser | `evidence/sentry-cycle1/results.md` row 7h, `evidence/sentry-cycle1/json/mn5-{1440,375}.json` | PASS | Sentry | D-10 (backdrop case n/a) |
| MN-6 | `ai_referral` only for AI referrers, once per session | browser on `next start` | `evidence/sentry-cycle1/results-ai.json`, `evidence/sentry-cycle1/ai.out` | PASS | Sentry | D-07 |
| MN-7 | No write to Klaviyo, Beehiiv, Sheets, Stripe or Meta before Jamie's go | cleanup ledger | `06-cleanup-ledger.md` (two Klaviyo events/profiles at 04:02 UTC; Meta, Beehiiv, Resend, Sheets: none), `02c-approved-copy.md` SC-3 (Jamie: "no concern about sign-up, that's fine"), `evidence/klaviyo-proof/flow-check.txt` (no flow on list XGTv2F or metric XNJKbF before the write) | PASS WITH NOTE | Relay, Auditor | Both profiles remain in Klaviyo, NEVER_SUBSCRIBED; deletion or suppression is Jamie's call (ledger). Third-party calls with fake keys (Klaviyo 401, Beehiiv 401) reached the vendor hosts but wrote nothing |
| MN-8 | Popup never auto-opens twice, within 7 days of dismissal, after sign-up, or by a touch scroll | browser | `evidence/sentry-cycle1/results.md` row 7i, `evidence/sentry/results-pb.json` (MN-8a to 8d) | PASS | Sentry | |
| MN-9 | Touch scroll on the sticky button does not open the popup; a tap does | browser | `evidence/sentry/json/mn9-calls.json`, `evidence/sentry/results-pb.json` | PASS | Sentry | |
| MN-10 | Script-set value or programmatic focus fires nothing | browser | `evidence/sentry-cycle1/json/mn5-{1440,375}.json` (`callsAfterOpen`, `callsAfterSet`) | PASS | Sentry | |

### Non-regression

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| NR-1 | Protected pages match origin/main | browser vs a main build | `evidence/sentry/nr1/nr1-diff.txt` (all six pages plus the Fortnite post at 1440 and 375, A vs main B, "rows with a DIFF flag: 0"), 14 branch and 14 main screenshots in `evidence/sentry/nr1/`, `text-A_*`/`text-B_*` extracts, `noise-check.txt` | PASS WITH NOTE | Sentry | Run on the 9f4e523 build, not repeated on 8cfe704 (the delta touches none of those pages). Console is not "clean": `/` carries 3 console errors on both sides, identical to main (D-02 and vendor blocks). `/blog` pixel diff (16.3 and 29.6 percent) is the new featured card; camps 11.6 percent is run-to-run noise |
| NR-2 | Zero diff in protected paths | command output | `evidence/static/nr2.txt` (command recorded, exit 0, empty), `evidence/sentry/nr2-protected-diff.txt` (0 bytes, command not recorded in the file), Auditor re-run at HEAD 8cfe704: prints nothing | PASS | Static, Sentry, Auditor | |
| NR-3 | Other posts differ only by approved sentences | `git diff` | `evidence/static/source-post-diffs.txt`, `evidence/static/blog-diff-vs-origin-main.txt` | PASS | Static | |
| NR-4 | No foreign file in any commit | `git show --stat` per commit | `evidence/static/nr4.txt` (3195327, 9f4e523, 8bab088) | PASS WITH NOTE | Static, Auditor | nr4.txt does not cover 8cfe704; Auditor `git diff --stat 9f4e523 8cfe704` shows exactly three app files, none forbidden |
| NR-5 | Contact modal opens from the post, shows the select, intercepted POST carries the value | browser with interception | `evidence/sentry/json/nr5-label.json` (label "How did you hear about us?" visible, first run), `evidence/sentry/json/nr5-375-*.json`, `evidence/sentry-cycle1/nr5-contact-modal-375.png`, `nr5-contact-modal-1440.png`, `evidence/sentry-cycle1/misc.out` | PASS WITH NOTE | Sentry | D-11 (at 1440 in Season 01 mode no contact trigger on a post; main's behaviour). The cycle 1 PASS line prints "label present=false" (selector artefact); label presence rests on the first-run `nr5-label.json` and the screenshots |

### Technical gates

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| TG-1 | tsc, eslint, next build; `.next/server` under 50 MB; no mp4 in trace | output | `evidence/static/tsc.txt` (exit 0, 22:26), `evidence/next-build.txt` (22:59:58, 8cfe704, 74/74 static, post static), `evidence/eslint-changed-files.txt` and `evidence/eslint.txt` (both 21:02, before commits 3195327, 9f4e523, 8cfe704) | PASS WITH NOTE | Static, Atlas, Auditor | eslint evidence is stale (predates all three commits) and names one file; repo-wide `eslint .` is 93 errors, none in changed files per `02-frozen-spec.md`. No evidence file records the `.next/server` size or the mp4 check; Auditor at writing time: `.next/server` 40,700 KB, zero `.nft.json` files naming `.mp4`. Re-run eslint on the changed files and file the `du` output |
| TG-2 | Existing tests run | node | `evidence/static/test-season-one-attribution.txt` (30/30), `test-newsletterAb.txt` (20/20), `test-routes.txt` (14/14), `test-ekuzo101-weeks.txt` (14/15), `tests-node-version.txt` (v24.14.0) | PASS WITH NOTE | Static | S-005 (the one failure, "PM ET" vs "local time"). "Identical on origin/main" is asserted in the defect log; no main run output is on disk |
| TG-3 | JSON-LD valid, dates and image | curl + parse | `evidence/head-and-schema.txt` (5 blocks; BlogPosting dates 2026-10-12, image card.jpg; BreadcrumbList; FAQPage 5 questions), `evidence/sentry/results.md` TG-3 row | PASS | Sentry | |
| TG-4 | Post loads at 1440, 768, 375x667 with console free of our errors | console log | `evidence/console-post.txt`, `evidence/sentry-cycle1/console-post-shoot.txt`, `evidence/sentry/json/tg4.json`, `evidence/sentry/sentinels-B-and-torn-paper-curl.txt` (same 404 on main, port 3312) | FAIL | Sentry | D-02. One own console error at every width: 404 on the literal-`@` torn-paper path under `next start`; identical on main; zero page errors. Documented as local only, but the claim "200 on live ekuzo.gg" has no recorded curl; confirm on the deploy |
| TG-5 | Canonical, robots, one H1, outline, sitemap, llms.txt | curl | `evidence/static/tg5.txt`, `evidence/static/tg5-robots-sitemap.txt`, `evidence/head-and-schema.txt` (sitemap and llms.txt contain the slug, 8cfe704) | PASS | Static, Sentry | S-007 (closed: sitemap date for the online-friends post) |
| TG-6 | Every external source link opened, title beside citation | ledger table | `evidence/static/links-table.md` | PASS WITH NOTE | Static | S-006. 5 of 7 targets MATCH; the two JAMA URLs are bot-walled, Crossref stands in. X post fetched without login; no screenshot, so no view counts verified |
| TG-7 | At least five internal links to the post | grep | `evidence/static/inbound.txt` (five posts, one link each, entity anchor), `evidence/static/internal-links.txt` | PASS | Static | |
| TG-8 | Phone check on the dev deploy | human | `01-requirements.md` Revision 2 item 6 | PENDING-HUMAN | | Jamie. Look and tap only, from inside X or Instagram as well |
| TG-9 | Images have alt, focus visible, contrast unchanged | axe-core on the post | `evidence/sentry-cycle1/json/axe-post-1440.summary.txt` (serious color-contrast 46, landmark-one-main 1, region 64), `axe-post-375.summary.txt` (44, 1, 59), `axe-fortnite-*.summary.txt` (24 / 22 comparison), full JSON beside them; rerun 23:12 on 8cfe704; first run `evidence/sentry/json/axe-*.json` identical | FAIL | Sentry | D-03 (new, post only: reply-card meta text 2.89:1, 9 nodes; accepted minor, Aaron's lane), D-04 to D-06 (template-wide, also on the Fortnite post). No `image-alt` violation. Focus visibility is not an axe rule; the keyboard probe in `sentry-cycle1/results.md` Part B and A-001 cover the link ring and the popup |
| FS-1 | `form_start` only in `landing.html` | grep | `evidence/static/fs1.txt` | PASS | Static | |
| MC-1 | No minor named or pictured in hero, card, graphic | Steward line | `reviews/04-steward-rendered.md` section E, gate table MINORS "APPROVED" | PASS | Steward | |
| SH-1 | Ship method: fast-forward, push to dev, then main | push by Jamie | none yet | PENDING-HUMAN | | Jamie's go. Never `git push origin dev:main` |
| SH-2 | Ship-time drift check on origin/main and origin/dev | `git fetch` + compare | none yet. Auditor, local refs only, no fetch: `origin/main` a449abc, `origin/dev` 4f15b1e | PENDING-HUMAN | | Run `git fetch origin` at ship time; re-run TG-1, NR-1, NR-2 if either moved |

### Close-out

| ID | Requirement | Check | Evidence | Result | Verified by | Defect |
|---|---|---|---|---|---|---|
| CL-1 | Asset pack in `knowledge-base/outputs/2026-10-12-gaming-study-asset-pack/` | path exists | Auditor: directory does not exist | PENDING-SHIP | | |
| CL-2 | Live verification vs origin/main | ledger | none | PENDING-SHIP | | |
| CL-3 | WORKLOG with FooterBanner list and featured-revert date | entry exists | none; `WORKLOG.md` has no entry for this run | PENDING-SHIP | | |
| CL-4 | Tracker CON-01 | entry exists | none | PENDING-SHIP | | |
| CL-5 | Loop-4 entry | entry exists | none | PENDING-SHIP | | |
| CL-6 | Session debrief | file exists | none | PENDING-SHIP | | |
| CL-7 | Both handoffs archived with `ran_in` filled | files | none | PENDING-SHIP | | |

### Counts

PASS 40, PASS WITH NOTE 25, FAIL 2, PENDING-HUMAN 6, PENDING-SHIP 7, NOT RUN 0. Total 80 rows (every ID in `01-requirements.md` Revisions 1 to 3 has exactly one row).

## 2. Gates

| Gate | Verdict | Basis |
|---|---|---|
| Screenshots non-empty before Parent and Steward reviews | PASS | 33 PNGs were committed in 3195327 (21:07:29), before any rendered review. `evidence/sentry/screenshots-ready.txt` is 22:28:58; `reviews/04-parent-rendered.md` is 22:33:08. All 38 files were retaken 23:06 to 23:07 on 8cfe704; the Steward re-run section and `reviews/06-fresh-parent.md` (23:36, 23:37) postdate them. The copy-deck reviews (`02-*`, 21:04 to 21:06) are text reviews and need no screenshots |
| Test-run output present | PASS | `evidence/static/test-*.txt`, `evidence/sentry/results-*.json`, `evidence/sentry-cycle1/*.out`, `results-*.json`, `evidence/klaviyo-proof/browser-run.json` |
| Guard recorded before the first functional test | PASS | `evidence/guard-selftest.txt` stamped 02:03:50Z (21:03:50 local). First browser evidence after it: `README-harness.md` 21:06, committed screenshots 21:07, Sentry from 22:22. Only non-browser checks (eslint 21:02) precede it. Sentry (22:30) and cycle 1 (23:01) recorded their own self-tests; see MN-3 note (2) |
| Every requirement has a row | PASS | 80 IDs, 80 rows, section 1 |
| Defect log has no open critical or major | PASS | No critical. Three majors (D-01, S-001, ST-001) are all closed with a retest on 8cfe704 (`05-defect-log.md` "Cycle 1" and triage table; `evidence/sentry-cycle1/results.md` Part A rows 1 and 2). No open major. Log hygiene: ST-016 and ST-017 (new minors in the Steward re-run) are not in `05-defect-log.md`; the D-01 row still reads "HEAD still has the defect" (fixed in 8cfe704, closed only in the triage table) |
| Cleanup ledger lists every production write | PASS WITH NOTE | `06-cleanup-ledger.md` lists the two Klaviyo events and profiles; no other write found in `evidence/` (all other keys fake or empty, Meta token blank, Sheets empty). Profiles remain in place pending Jamie's suppress or delete decision |

## 3. Open items

### A. FAIL, NOT RUN, thin (priority order)

1. TG-9 FAIL: axe serious color-contrast (46 and 44 nodes). D-03 is new on this post (reply-card meta text 2.89:1) and was triaged as an accepted minor for Aaron; Jamie should see the acceptance, since the requirement says "contrast unchanged". D-04 to D-06 are template-wide.
2. TG-4 FAIL: one console 404 per width, identical on main (D-02). Triage says closed as local only; the live-200 curl behind that is not on disk. Confirm on the dev deploy.
3. TG-1 thin: eslint evidence predates all three commits; bundle size and mp4 trace not filed (Auditor saw 40,700 KB and no mp4 today). Re-run and file both.
4. CP-2 and CP-12 thin: full fidelity script not re-run on 8cfe704. Run `static/fidelity.mjs` against the 8cfe704 build to close it.
5. CP-6 / TG-6 thin: the browser read that closed S-006 is not saved; JAMA landing title is Crossref-only.
6. CP-14 / CP-7: the S4 view counts have no read evidence on disk.
7. MN-3 gaps listed in the row (no log for Atlas's phase-3 shoot; Klaviyo proof proxy has no own self-test; 2125 vs 2290 count).
8. PB-6 (no pre-edit failing run), PB-7 (no sentinel lines for cycle 1 or the Klaviyo server), TG-2 (no main-side run of the ekuzo101-weeks test), DT-3 (no WORKLOG entry).
9. Defect log hygiene: add ST-016 and ST-017; mark D-01 closed in its own row.

### B. Human checkpoints

TG-8 phone check (including in-app browsers); AS-2 link-preview check on the deploy; CP-14 ship-day count read (and a JAMA click-through for CP-6); SH-1 push to dev, check, then main; SH-2 fetch and drift check; DT-1 date recheck on merge day. Also from `02-frozen-spec.md`: images confirmed as finals, Netlify env readout (superseded in part by SC-3), Search Console conditional on the 10-12 handoff, featured-revert reminder (ship + 7 days, and delete "recent" from the opening then), Beehiiv "Blog welcome (thumbs)" automation before Season 01 mode goes off, Klaviyo profile cleanup (`06-cleanup-ledger.md`), courtesy note to Muhammad Hossain, A-009 header check on Netlify. CL-1 to CL-7 follow the ship.

### C. Accepted minors and where the rationale lives

- S-002 straight apostrophes in four link sentences: `05-defect-log.md` triage table.
- S-003, S-005, D-04 to D-07, D-11, H2 pre-existing: triage table row "D-04 to D-07 ...".
- D-03 post-only contrast: triage table ("Aaron's lane").
- D-08 popup has no live-host guard: triage ("accepted (decision 8)"), `03-decision-log.md` D6.
- D-10 backdrop wording: triage table.
- ST-002 sticky crop, ST-003 S1 paragraph, ST-004 "30M+ people", ST-005 to ST-008, ST-012, ST-014 reel gap, ST-016, ST-017: `reviews/04-steward-rendered.md` defect list and "Re-run after repair cycle 1".
- A-001 to A-009 adversarial findings (no focus trap, 768 footer form clipped, 200-as-success, no fetch timeout, loose email validation, contact route swallowing downstream failures): `05-defect-log.md` "Cycle 1 and adversarial"; all pre-existing in main's code except the A-008 documented behaviour.
- Subhead "More than 30 million people saw it": `02-frozen-spec.md` (Jamie accepted the wording 2026-10-05).

## 4. Completion view

Yes, for the pre-ship decision: no row is NOT RUN, no major is open, and the two FAILs are logged, triaged and not caused by this change. It does not support a "shipped" claim; that waits on the human checkpoints and CL-1 to CL-7. Before Jamie's go, the cheap gaps to close are items A3, A4 and A9 above.

## 5. Repository state at writing time

`git status --porcelain`, then `git log --oneline -6`, run in the worktree, verbatim:

```
 M docs/gaming-study-ship/06-cleanup-ledger.md
 M docs/gaming-study-ship/evidence/head-and-schema.txt
 M docs/gaming-study-ship/evidence/next-build.txt
 M docs/gaming-study-ship/screenshots/blog-1440-full.png
 M docs/gaming-study-ship/screenshots/blog-1440-top.png
 M docs/gaming-study-ship/screenshots/blog-375-full.png
 M docs/gaming-study-ship/screenshots/blog-375-top.png
 M docs/gaming-study-ship/screenshots/post-1024-full.png
 M docs/gaming-study-ship/screenshots/post-1024-hero.png
 M docs/gaming-study-ship/screenshots/post-1024-top.png
 M docs/gaming-study-ship/screenshots/post-1440-footerbanner.png
 M docs/gaming-study-ship/screenshots/post-1440-full.png
 M docs/gaming-study-ship/screenshots/post-1440-graphic.png
 M docs/gaming-study-ship/screenshots/post-1440-hero.png
 M docs/gaming-study-ship/screenshots/post-1440-keepreading.png
 M docs/gaming-study-ship/screenshots/post-1440-stickybar.png
 M docs/gaming-study-ship/screenshots/post-1440-top.png
 M docs/gaming-study-ship/screenshots/post-375-full.png
 M docs/gaming-study-ship/screenshots/post-375-graphic.png
 M docs/gaming-study-ship/screenshots/post-375-hero.png
 M docs/gaming-study-ship/screenshots/post-375-keepreading.png
 M docs/gaming-study-ship/screenshots/post-375-stickybar.png
 M docs/gaming-study-ship/screenshots/post-375-top.png
 M docs/gaming-study-ship/screenshots/post-768-full.png
 M docs/gaming-study-ship/screenshots/post-768-hero.png
 M docs/gaming-study-ship/screenshots/post-768-top.png
?? docs/gaming-study-ship/04-evidence-ledger.md
?? docs/gaming-study-ship/05-defect-log.md
?? docs/gaming-study-ship/evidence/klaviyo-proof/
?? docs/gaming-study-ship/evidence/sentry-cycle1/
?? docs/gaming-study-ship/evidence/sentry/
?? docs/gaming-study-ship/evidence/static/
?? docs/gaming-study-ship/reviews/04-parent-rendered.md
?? docs/gaming-study-ship/reviews/04-steward-rendered.md
?? docs/gaming-study-ship/reviews/06-fresh-parent.md
?? docs/gaming-study-ship/screenshots/blog-375-featured.png
?? docs/gaming-study-ship/screenshots/inbound-fortnite-1440.png
?? docs/gaming-study-ship/screenshots/inbound-homeschool-1440.png
?? docs/gaming-study-ship/screenshots/inbound-kids-gaming-1440.png
?? docs/gaming-study-ship/screenshots/inbound-lol-1440.png
?? docs/gaming-study-ship/screenshots/inbound-sons-friends-1440.png
?? docs/gaming-study-ship/screenshots/post-1440-opening.png
?? docs/gaming-study-ship/screenshots/post-1440-sources.png
?? docs/gaming-study-ship/screenshots/post-375-opening.png
```

```
8cfe704 fix(blog): space after the Short answer label, sharper phone hero, sitemap date
9f4e523 content(blog): approved opening, hero alt, view counts and five inbound links for the gaming-study post; images recompressed
3195327 content(blog): gaming-study ship changes C1-C10 (less C2, C7), final images, one ask per post in Season 01 mode
8bab088 merge: origin/main (a449abc) into the gaming-study branch
a449abc docs: commit current CLAUDE.md and the docs it references
17d9e1d fix(season1): form_start counts a click, not pointerdown
```
