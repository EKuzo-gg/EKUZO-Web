# Gaming-study post ship: requirements

Fable, 2026-10-11. Brief: `knowledge-base/system/loops/handoffs/2026-10-12-gaming-study-post-build-loop.md`
(wins where it differs from `2026-10-06-ship-gaming-study-post.md`). Copy spec C1 to C10:
`EKUZO/Marketing/content-drafts/2026-10-06-gaming-study-ship-changes.md`. Loop: `build-loop.md`.

## Step 0 result (2026-10-11)

- `git status --porcelain` and `git log --oneline -3` in `~/Projects/ekuzo-web` match the handoff's embedded evidence line for line.
- `origin/main` `a449abc`, `origin/dev` `4f15b1e`: unmoved.
- The ten docs are byte-identical to `origin/main` (4 tracked via `git diff --quiet`, 6 untracked via `cmp`).
- Work happens in a worktree, `.claude/worktrees/gaming-study-ship`, branch `build/gaming-study-ship` (from `blog/gaming-study-13-7` at `0da2e89`), so Jamie's dirty checkout and the post branch are untouched. Merge of `origin/main` committed there as `8bab088`; conflicts were `WORKLOG.md` and `components/ui/StickyCTA.tsx` (imports), as predicted. Nothing pushed.
- Asset note: the three final images have the stated dimensions; file sizes on disk are 281 KB (hero), 116 KB (card), 164 KB (graphic), against the handoff's 268 KB and 107 KB. Treated as a re-export, flagged in the review guide.

## Scope

Post: `app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx`, path `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`.

## Requirements

### Copy (frozen text from the change list; Atlas transcribes, Sentry diffs)

| ID | Requirement | Gate |
|---|---|---|
| CP-1 | C1: "this week" dropped from `TITLE_DISPLAY` and the `/blog` index title | rendered-text diff |
| CP-2 | C3 short-answer paragraph is the first paragraph of the body, `<strong>Short answer:</strong>` pattern | rendered-text diff |
| CP-3 | C3b second paragraph trimmed | rendered-text diff |
| CP-4 | C4 "tennis, piano, orchestra" | rendered-text diff |
| CP-5 | C5 graphic placed after the paragraph ending "Everything around it is different.", before the Lolcat paragraph; full column width on mobile, capped about 560px and centered on desktop; alt text exactly as C5 | screenshot + DOM alt |
| CP-6 | C6 both Chaarani links point to article 2797596 | href check + landing title in ledger |
| CP-7 | C7 sources line view counts, with S4's ship-day re-read | rendered-text diff; Jamie approval |
| CP-8 | C8 FAQ question "Is gaming good for kids' brains?" in the page and in `FAQPage` schema | DOM + JSON-LD |
| CP-9 | C9 heading "What the study found, and what it didn't" | DOM |
| CP-10 | C10 `FooterBanner heading="Every gamer deserves a team"` (dormant while Season 01 mode overrides the banner) | source diff |
| CP-11 | S1 opening replaces C2: no "in September", a recent post, scale carried by a number, link to the original post and/or one Musk quote-post; must not repeat the subhead's "More than 30 million people saw it" word for word; "13.7" never alone | Jamie approval, then diff |
| CP-12 | S2 five inbound-link sentences, one per source post, entity anchors | Jamie approves each, one at a time |
| CP-13 | S3 hero alt text describes the collage, including that "~13.7 years younger" is marked "not in the paper" | Jamie approval, then DOM alt |
| CP-14 | S4 C7 counts re-read on ship day; Musk counts need a fresh read | read evidence in ledger; Jamie approval |
| CP-15 | The closing line "That's the conversation worth having at your table this week." stays (decision 3) | rendered-text check |
| CP-16 | Mechanical voice lint on every new or changed string: zero em or en dashes, zero arrows, banned vocabulary, banned phrases and transitions | grep output in ledger |
| CP-17 | Every sentence with a number, a study or a causal verb maps to a claims-register row; never-say list A to L clean, in body, alt text, images and metadata | Steward |
| CP-18 | Keep Reading shows `should-you-ban-fortnite` and `when-your-sons-only-friends-are-online` alongside the homeschool post if the block takes more than one (the three-card `KEEP_READING` pattern exists on other posts) | screenshot |

### Dates and listing

| ID | Requirement | Gate |
|---|---|---|
| DT-1 | `DATE_PUBLISHED`, `DATE_MODIFIED` and the index `date` are the merge day. Built as 2026-10-12; re-set if the merge lands another day | source + JSON-LD |
| DT-2 | A visible updated date renders in the page HTML (`date={DATE_MODIFIED} dateLabel="Updated"`, the summer-camps pattern) | DOM |
| DT-3 | `featured: true` on this post, `false` on `should-you-ban-fortnite`; revert date (ship + 7 days) logged in the WORKLOG; Jamie asked to approve a reminder | `/blog` screenshot; WORKLOG |

### Assets (relationship: clone of the three final files as rendered; page template unchanged)

| ID | Requirement | Gate |
|---|---|---|
| AS-1 | Hero copied byte-identical to `public/images/gaming-study-13-7-hero.jpg`; renders in the 520px hero frame; post and "not in the paper" note survive the crop at 1440, 768 and 375 widths | sha256 + screenshots |
| AS-2 | Card copied byte-identical to `public/images/gaming-study-13-7-card.jpg`; `og:image` and `twitter:image` resolve to it (200, 1200x630); index card uses it | curl + meta tags; link-preview check on the deploy |
| AS-3 | Graphic copied byte-identical to `public/images/gaming-study-same-game-two-hours.png` | sha256 |
| AS-4 | Hero does not collide visually with the top-right decorative brush | Steward, side-by-side |
| AS-5 | Visual-parity gate: built page beside the reference files at 1440 and 375 | Steward PASS/FAIL |

### Popups and bars (decision 1)

| ID | Requirement | Gate |
|---|---|---|
| PB-1 | With `SEASON_ONE_MODE` on, the blog newsletter popup never renders on a post, at any scroll depth, desktop and phone | browser test |
| PB-2 | With `SEASON_ONE_MODE` on, the sticky bar on a post is main's Season 01 bar; the blog newsletter bar variant never renders | browser test |
| PB-3 | With `SEASON_ONE_MODE` on, no blog A/B state is written (`ekuzo_nl_variant` absent after a post visit) and no `newsletter_impression` fires | localStorage + beacon log |
| PB-4 | With `NEXT_PUBLIC_SEASON_ONE_MODE=off`, the blog popup and bar behave as on the branch before the merge (A/B ships dormant, not broken) | browser test on an off build |
| PB-5 | One ask per page view: the Season 01 popup and any newsletter ask never appear in the same page view | browser test |

### Attribution journeys (decision 8: no new tracking code; prove what exists)

| ID | Journey | Expected |
|---|---|---|
| JR-1 | Arrive on the post from a shared link with UTMs (`utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin`), Season 01 popup opens, sign up | request to `/api/season-one` carries `source: site-popup`, the UTMs, `attributionFrom: url`, `page` = the post path with its query; Klaviyo event shows the same plus `attribution_from: url`; GA4 `generate_lead` carries `source: season_one_popup` |
| JR-2 | Arrive with no UTMs, sign up | `attributionFrom: none`, `page` recorded |
| JR-3 | Arrive with referrer chatgpt.com, claude.ai or perplexity.ai | `ai_referral` fires once per session, not again on a second page view |
| JR-4 | Page to page: arrive on the post with UTMs, go to `/`, sign up there | attribution from `session` (first touch kept) |
| JR-5 | Return visit: popup dismissed, reader returns within 7 days | popup does not auto-open; sticky bar still opens it on tap |
| JR-6 | Reader arrives from `/blog` index featured card | post loads, popup rules as above |

### Must not

| ID | Must not | Gate |
|---|---|---|
| MN-1 | Blog newsletter popup or bar rendering while Season 01 mode is on (same as PB-1, PB-2), desktop and phone | browser test |
| MN-2 | Two asks in one page view | browser test |
| MN-3 | Any QA beacon reaching live GA4, Clarity or Meta: every browser context runs behind a fail-closed proxy for the collect hosts from the first request; guard recorded in the ledger before any functional test | proxy log |
| MN-4 | Any test sign-up sending a live Meta `Lead`, browser or server. Local `.env.local` has `META_CAPI_ACCESS_TOKEN` set and no `META_CAPI_USE_TEST_CODE`, so a local sign-up that reaches `/api/season-one` would send a live server Lead. Local QA therefore intercepts the POST in the browser and answers it locally, or runs the dev server with the token blanked | request log shows zero calls to `graph.facebook.com` and zero unintercepted POSTs |
| MN-5 | `generate_lead` or Lead firing on page load, popup open, popup dismiss, autofill of the email field, a scroll that starts on the email field or button (touch), or a retry (one event id per sign-up) | browser test incl. touch-scroll case |
| MN-6 | `ai_referral` firing for a non-AI referrer or twice in a session | browser test |
| MN-7 | Any write to Klaviyo, Beehiiv, Sheets, Stripe or Meta before Jamie's go. The Klaviyo-side proof of JR-1 and JR-2 runs on the dev deploy after the push go, with a disposable identity and a cleanup-ledger row | cleanup ledger empty until then |

### Non-regression (protected surfaces)

| ID | Requirement | Gate |
|---|---|---|
| NR-1 | `/`, `/blog`, `/programs/ekuzo-camps`, `/programs/ekuzo101`, `/programs/ekuzo-teams`, `/season1` render and behave as on `origin/main`: console clean, sticky bar and Season 01 popup unchanged | browser, screenshots vs a main build |
| NR-2 | Zero diff vs `origin/main` outside the branch's own files in `app/api/season-one`, `lib/seasonOne.ts`, `lib/attribution.ts`, `components/ui/SeasonOne*`, `app/season1/`, `middleware.ts`, Stripe and webhook routes | `git diff --stat origin/main -- <paths>` |
| NR-3 | Other blog posts unchanged except the approved inbound-link sentences | `git diff` |
| NR-4 | No file from Jamie's other local work enters a commit; stage by explicit path only | `git show --stat` per commit |

### Technical gates

| ID | Requirement | Gate |
|---|---|---|
| TG-1 | `tsc --noEmit`, `eslint`, `next build` pass; `.next/server` under 50 MB, no mp4 in the trace | output in ledger |
| TG-2 | Existing tests run: `lib/__tests__/*` and `docs/blog-newsletter/tests/*.mjs` (node). No runner is configured in `package.json`; that is a surfaced flag | output in ledger |
| TG-3 | JSON-LD: BlogPosting, BreadcrumbList, FAQPage, VideoObject server-rendered, valid, dates and image correct | curl + parse |
| TG-4 | Browser-truth: post loads in a real browser at 1440, 768 and 375x667 with a console free of our errors | console log |
| TG-5 | Canonical, robots index/follow, one H1, heading order, sitemap entry and `public/llms.txt` entry for the slug (neither exists today) | curl |
| TG-6 | Every external source link opened; landing title recorded beside the citation | ledger table |
| TG-7 | At least five internal links point at the post (four exist on the branch after the sign-off of their posts; S2 settles wording and adds the fifth) | grep |
| TG-8 | Phone check on the dev deploy before main: popup, sticky bar, scroll. Human checkpoint, Jamie | review guide |
| TG-9 | Accessibility: images have alt, focus visible, contrast unchanged | Sentry |

### Out of scope

robots.txt and Search Console (the 10-12 SC session, not yet run, so no indexing request here); the FooterBanner heading on the 16 other pages (list in WORKLOG only); Meta custom audience; X lane; new tracking code.

## Human checkpoints (no mechanical gate)

S1, S2 (each of five), S3, S4 copy approvals; push to `dev`; phone check; merge to `main`; featured-revert reminder; Klaviyo-side journey proof on the deploy.

## Revision 2 (2026-10-11), after the Auditor's review (`reviews/01-auditor-requirements.md`)

Each numbered item answers the Auditor's item of the same number.

1. **Inbound links.** Five source posts: `what-your-kids-gaming-is-telling-you`, `league-of-legends-youth-development`, `should-you-ban-fortnite`, `what-homeschool-parents-taught-us-about-gaming` (each already carries a link on the branch, added in September, appended after the sign-off, never approved sentence by sentence) and `when-your-sons-only-friends-are-online` (none yet). CP-12: Story reviews the four and drafts the fifth; Jamie approves each of the five, one at a time; nothing changes in those posts before his yes. TG-7 passes when five approved links exist. NR-3: other posts differ from the branch only by the approved sentences.
2. **`page`.** The popup sends `window.location.pathname + window.location.search`. JR-1 expects the post path followed by its UTM query; JR-2 expects the bare post path. The brief's "page = this post's path" is read as "the event is attributed to this post".
3. **More must-nots.** MN-8: the Season 01 popup must not auto-open twice in one page view, within 7 days of a dismissal, after a sign-up, or because a touch scroll started anywhere. MN-9: a touch scroll that starts on the sticky bar must not open the popup; a tap must. MN-10: a script-set value or the popup's own programmatic focus of the email field must fire nothing. MN-6 extended: `ai_referral` must not re-fire on reload, same-origin navigation or back navigation in one session. `form_start`: Relay's contract states whether it exists on the popup at all (it is documented for `/season1` only); if it does, the autofill, script-set, programmatic-focus and touch-scroll cases apply per field.
4. **More journeys.** JR-7: phone-touch arrival (375x667, touch on) repeats JR-1. JR-8: arrival with `utm_source=instagram|linkedin|email` (decision 9 links) records those values. JR-9: UTM visit to the post, then a return in a new session with no UTMs: expected `attributionFrom: none` (the 7-day return record is written only by `/season1`); recorded as existing behavior, not changed (decision 8). JR-10: another post (`/blog/should-you-ban-fortnite`) shows the same one-ask behavior. In-app browsers (Instagram, Facebook, X, LinkedIn) cannot be automated here: Jamie's phone check opens the dev link from inside X or Instagram (TG-8).
5. **MN-4 against MN-7.** No deploy sign-up happens until Jamie confirms, with a readout of the Netlify env for the dev context, that `META_CAPI_USE_TEST_CODE=true` with a test code, or that the CAPI token is absent there. The browser pixel Lead on a deploy sign-up is blocked by running that sign-up behind the same proxy. Without that confirmation the Klaviyo-side proof is skipped and logged as an accepted gap, with the request-contract proof standing in.
6. **TG-8.** Jamie's phone check is look and tap only: page loads, hero crop, popup opens and dismisses, bar taps open the popup, scroll is smooth, no newsletter ask. No sign-up. An un-proxied phone sends ordinary PageView beacons to live GA4, Clarity and Meta; accepted risk, one visitor.
7. **What `61db653` ships beyond blog posts.** `/api/newsletter` optional utm fields (non-blog callers byte-identical, 34 unit tests on the branch); ContactModal "How did you hear about us?" select and `/api/contact` tag `heard-<slug>`; `lib/analytics.ts` newsletter events. These were built, tested and reviewed in the September loop (`docs/blog-newsletter/`); this run re-executes those tests after the merge (TG-2), adds a browser check that the contact modal opens and renders (NR-5), and adds the files to NR-2's readout. They are existing branch code, so decision 8 (no new tracking code in this run) holds.
8. **Close-out requirements (after the merge go).** CL-1 asset pack in `knowledge-base/outputs/2026-10-12-gaming-study-asset-pack/`: short answer, pull-quotes, the dark graphic as a standalone 4:5 file, share card, UTM links per decision 9 (`utm_source` x, linkedin, instagram, email; `utm_medium` social or email; `utm_campaign=gaming-study`; `utm_content` karlin or ekuzo), short-form brief for Karlin. CL-2 live verification against `origin/main`. CL-3 WORKLOG with the FooterBanner list and the featured-revert date. CL-4 tracker CON-01. CL-5 loop-4 entry. CL-6 session debrief. CL-7 both handoffs archived with `ran_in` filled. CL-1's UTM links and the pack's text can be drafted before the go; nothing is filed as shipped before it ships.
9. **Ship method.** SH-1: on Jamie's go, fast-forward `blog/gaming-study-13-7` to `build/gaming-study-ship`, push it to `dev`, check the deploy, then fast-forward `main` from the branch. Never `git push origin dev:main`. Pushes run from Jamie's terminal (runbook). Deviation logged: the brief says merge into `blog/gaming-study-13-7` directly and remove the ten docs from the checkout first; the worktree avoids touching the checkout and gives the same commits (decision log D1).
10. **Search Console.** The 10-12 SC handoff is `status: open`, `ran_in` empty as of 2026-10-11. Re-check at ship time; request indexing only if it has run. Human-action item: Beehiiv "Blog welcome (thumbs)" automation before Season 01 mode is switched off.
11. **Frozen constraints from the change list.** CP-19: `TITLE_SEO`, the subhead and `DESCRIPTION` unchanged; the C8 answer unchanged; the Brockie quote keeps "1.1K likes when I read it on September 15"; the reanalysis links and the corrected 13.7 checklist item untouched; the two quote-post view counts never written as one combined figure.
12. **Images.** AS-1 and AS-3 also check dimensions (2400x1260, 1200x630, 1080x1350). The size difference from the brief goes to Jamie as a confirm-these-are-the-finals question.
13. **Gates made concrete.** CP-17: Steward writes a claims-trace table (sentence, register row, pass or fail) to `reviews/`. TG-9: Sentry runs axe-core in the browser on the post and saves the output. AS-1: Steward judges screenshots of the hero frame at 1440, 1024, 768 and 375 widths against the source file. CP-16: grep against `anti-ai-writing.md` § 3A, 3C, 3D lists; reframes judged by Steward. CP-10: screenshot of the footer banner with Season 01 mode on (shows the Season 01 banner) and the heading string in source. CP-18: pass when three cards render in the stated order.
14. **X-hosted facts.** View counts are read by a human or in a logged-out browser and screenshotted; the screenshot or Jamie's stated read is the evidence. X links in TG-6 pass when the URL resolves to the stated author's post in a logged-out browser.
15. **NR-2 command.** `git diff --stat origin/main...HEAD -- <protected paths>` must list only files the branch itself changed in September (none under `app/api/season-one`, `lib/seasonOne.ts`, `components/ui/SeasonOne*`, `app/season1/`, `middleware.ts`, Stripe or webhook routes). An "ask" in PB-5 and MN-2 is a modal or popup that opens without a tap. The Season 01 sticky bar and footer banner are standing elements, not asks.
16. **Human checkpoints, full list.** S1 text and link pick; S2.1 to S2.5; S3; S4 and the ship-day count read; images confirmed as finals; push to `dev`; link-preview check; phone check; Netlify env readout; merge to `main`; date recheck on merge day; Search Console conditional; featured-revert reminder; Beehiiv follow-up.
17. **Minors and consent; stale phrasing.** MC-1: no minor is named or pictured identifiably in the hero, card or graphic (the facecam is Karlin, adult, approved 2026-10-11; Luu's post is public, his avatar and name appear as posted); the Lolcat reel stays under the parent consent on file. CP-20: a scan for "this week", "in September", "last week", "yesterday" and similar across the post, the index entry, alt text and metadata; the CP-15 closing line and the dated Brockie and Sources lines are the only allowed hits.

## Revision 3 (2026-10-11), after the Auditor's re-check

Answers the ten numbered changes in `reviews/01-auditor-requirements.md` § Re-check, revision 2. This closes phase 1; anything further is a logged spec change in `02-frozen-spec.md`.

| ID | Requirement | Gate |
|---|---|---|
| PB-6 | The gating edits are exactly two: `app/layout.tsx` mounts `<NewsletterPopup mode="blog" />` only when `!SEASON_ONE_MODE`; `components/ui/StickyCTA.tsx` sets `isBlogPost = !SEASON_ONE_MODE && isBlogPostPath(pathname)`. Authorized by locked decision 1 | `git diff` of the two files; PB-1 to PB-5 tests |
| PB-7 | PB-4 runs on a second build made with `NEXT_PUBLIC_SEASON_ONE_MODE=off` (the flag is inlined at build time). Mode sentinels recorded for every test run: Nav button text and `/programs/ekuzo-camps/register` status (307 on, 200 off) | sentinel lines in the ledger |
| JR-3, MN-6 | Run on `next build` + `next start` only. Under `next dev`, strict mode double-runs the effect and `ai_referral` never fires | harness log names the server mode |
| FS-1 | `form_start` exists only in `app/season1/landing.html`. The popup fires `trackLead` only, inside `submit()` after the POST returns ok (`SeasonOnePopup.tsx:129`). The `form_start` must-nots therefore apply to `/season1` (already proven in the 10-11 loop) and are regression-checked there, not re-derived for the popup | grep output in ledger; `/season1` in NR-1 |
| MN-8 to MN-10, JR-7 to JR-10 | Each gets a Sentry test with ledger evidence; Relay's run plan is extended to cover them | ledger rows |
| NR-2 (restated) | `git diff --stat origin/main HEAD -- app/api/season-one lib/seasonOne.ts lib/metaCapi.ts components/ui/SeasonOnePopup.tsx components/ui/SeasonOneTrigger.tsx app/season1 middleware.ts app/api/webhooks app/api/camps app/api/ekuzo100 app/api/teams` prints nothing. Files the branch does change against main are listed once in the ledger with their origin commit (`61db653` or this run) | command output |
| NR-5 | Contact modal opens from the post, renders the "How did you hear about us?" select, and the intercepted POST to `/api/contact` carries the selected value. No real submit | browser test with interception |
| CP-18 (order) | Keep Reading order: homeschool post, `should-you-ban-fortnite`, `when-your-sons-only-friends-are-online` | screenshot |
| CP-19, CP-20, MC-1 | Gate: Sentry's rendered-text diff against `0da2e89` for the frozen strings (CP-19); grep output for the stale-phrase scan (CP-20); Steward's image review line (MC-1) | ledger rows |
| SH-2 | At ship time `git fetch origin` and confirm `origin/main` is still `a449abc` and `origin/dev` still `4f15b1e`; if either moved, re-merge and re-run TG-1, NR-1 and NR-2 before any push | command output |
| CL-1 to CL-7 | Gate for each is the file or entry existing at its stated path, listed in the ledger after ship | paths |

**Relay's open questions, answered by Fable** (decision log D2 to D6): no vendor scripts are downloaded, call-level evidence stands; the server-side interceptor lane is not built (decision 8, simplest path), the route's `attribution_from` mapping rests on main's existing unit tests re-run here plus the Klaviyo proof; the popup's missing live-host guard is recorded as a follow-up for Jamie, not changed here (decision 8); the footer form is not an "ask"; `playwright-core` goes in the scratch directory, outside the repo, using installed Chrome.

**Human checkpoints added:** the Klaviyo write go and the choice between the dev deploy and a local server for it; the Netlify env readout; a read-only check that list `XGTv2F` and the waitlist metric have no flow that would email a disposable address something a parent should not get twice.
