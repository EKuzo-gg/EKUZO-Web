# Defect log (Sentry, phase 4)

Written 2026-10-11. Sentry logs everything it saw, including items that also fail on `origin/main` (marked pre-existing). It does not judge scope. Cycle count 0 for all rows. Evidence paths are under `docs/gaming-study-ship/evidence/sentry/`.

| ID | Severity | Type | Requirement | What happened | Repro | Evidence | Suggested owner | Cycle |
|---|---|---|---|---|---|---|---|---|
| D-01 | major | code-bug | CP-2 (first body paragraph), TG-4 adjacent | The first paragraph renders "Short answer:one study of 923 adults" with no space after the bold label. The JSX has a line break between `</strong>` and the text, which collapses. This is the lead paragraph that search and AI answers quote. Present in the 22:20 build of HEAD 9f4e523. A fix (`{" "}` after the label) now exists in the working tree as an uncommitted edit by another session and is confirmed fixed in the final rebuild; it is not committed, so HEAD still has the defect. | `curl -s localhost:3311/blog/gaming-study-13-7-years-younger-what-it-means-for-kids \| grep -o 'Short answer:</strong>.\{0,12\}'` shows `</strong>one` on the first build, `</strong> <!-- -->one` on the final build | `html/post.html` (first build), `sentinels-A2-final-on.txt` (final), `tree-drift-during-run.diff`, `docs/gaming-study-ship/screenshots/post-1440-opening.png` | Atlas visual (commit the fix, then re-verify) | 0 |
| D-02 | minor | pre-existing | TG-4 | Console error on every page that uses the footer banner or torn-paper edges: 404 on `/images/new%20torn%20paper/torn-paper-red-top-2@2x.png` (at `/` also `torn-paper-black-bottom-1@2x.png` and `torn-paper-white-1@2x.png`). Raw literal `@` in a `public/` path returns 404 under `next start`; `%40` returns 200. It is not the `/_next/image` optimizer (the component uses a plain `<img>`). Identical on origin/main (FooterBanner.tsx unchanged by the branch), so the torn edge image is missing wherever `next start` serves it. Whether Netlify's CDN serves these files is untested here. | `curl -s -o /dev/null -w '%{http_code}' 'localhost:3311/images/new%20torn%20paper/torn-paper-red-top-2@2x.png'` gives 404; with `%402x` gives 200; same on port 3312 (main) | `sentinels-B-and-torn-paper-curl.txt`, `nr1/nr1-raw.json`, `console-post-shoot.txt`, `json/tg4.json` | Atlas visual (rename files or encode the `@`), Relay integration to confirm on the Netlify deploy | 0 |
| D-03 | minor | code-bug | TG-9 (contrast unchanged) | New contrast failures that exist only on the gaming-study post: the reply-card meta text ("Reply on X", "1.1K likes at the time", "412 likes at the time", the footnote line under the card groups) is `#9a988f` on white, ratio 2.89 (needs 4.5), 9 nodes at both widths. Fortnite post has none of these. | Run `node_modules/axe-core/axe.min.js` on the post; rule `color-contrast`, color pair `#9a988f` on `#ffffff` | `json/axe-post-1440.json`, `json/axe-post-375.json`, `json/axe-fortnite-1440.json` (absent there) | Atlas visual | 0 |
| D-04 | minor | pre-existing | TG-9 | Byline "Founder of EKUZO" and "Updated October 12, 2026" are `#999999` on white, ratio 2.84, 4 nodes. Same template styling on the fortnite post. | axe `color-contrast`, pair `#999999` on `#ffffff` | `json/axe-post-1440.summary.txt`, `json/axe-fortnite-1440.json` | Atlas visual | 0 |
| D-05 | minor | pre-existing | TG-9 | Brand red `#f92524` text on white is 3.94 (22 inline links on the post at 1440, 10 on fortnite; same pair at 375), red on the grey Keep Reading band 3.38, `text-black/50` blurb on grey 3.83, white text on a red outlined button 3.94 (`.bg-transparent` button, 4 nodes). These are template-wide colors, present on both posts; the post has more instances only because it has more links. | axe `color-contrast` on either post | `json/axe-post-*.json`, `json/axe-fortnite-*.json` | Atlas visual (template decision, not this ship) | 0 |
| D-06 | minor | pre-existing | TG-9 | axe moderate: `landmark-one-main` (1) and `region` (64 at 1440, 59 at 375; fortnite 57 and 52). Same template on both posts. | axe default run | `json/axe-*.summary.txt` | Atlas visual | 0 |
| D-07 | minor | pre-existing | MN-6 | `ai_referral` classification matches by substring: referrers `https://chatgpt.com.example/` and `https://notclaude.ai/` are classified as `ai_chatgpt` and `ai_claude` and fire the event. The contract (`02b` section 2.5) already notes this. No effect on real AI referrers, small inflation risk from look-alike hosts. | `page.goto(post, { referer: "https://notclaude.ai/" })`, wait 5 s, count `ai_referral` calls (1) | `results-ai.json` ("INFO lookalike" rows) | Relay integration (follow-up, decision 8 says no tracking changes in this run) | 0 |
| D-08 | minor | accepted-risk | MN-4, MN-5 | The popup has no live-host guard: on localhost (and any preview host) a successful sign-up fires GA4 `generate_lead` and Meta `Lead`. Confirmed in behavior during JR-1 (browser calls recorded on localhost). It is why every test ran behind the proxy. Recorded by Fable as a follow-up (decision log D3), not changed. | Sign up in the popup on any non-production host in an unguarded browser | `json/JR-1-1440.json` (Lead pair recorded on localhost), `02b-contract-and-preflight.md` section 0 item 3 | Fable strategic (follow-up for Jamie) | 0 |
| D-09 | minor | infra-gap | all | The worktree app source changed while the run was in progress. After the given 22:20 build, another session left three uncommitted edits: the gaming-study `page.tsx` (hero `sizes`, the "Short answer" space), `when-your-sons-only-friends-are-online/page.tsx` (apostrophe in the inbound sentence), `app/sitemap.ts` (lastModified 2026-10-12). Sentry did not touch them. The first full run tested the clean 22:20 build; the final rebuild (mode on) includes the edits, and all functional tests were run again on it with identical results. Screenshots in `docs/gaming-study-ship/screenshots/` come from the 22:20 build. HEAD 9f4e523 does not contain these edits. | `git status --short app` and `git diff -- app` | `tree-drift-during-run.diff`, `tree-drift-at-final-build.diff`, `first-build-run/` | Atlas visual (commit or discard, then rebuild, retest, retake screenshots) | 0 |
| D-10 | minor | accepted-risk | MN-5, JR-5 | Requirement text lists dismissal by "backdrop". The Season 01 popup is a full-viewport dialog with no backdrop, so the case cannot exist. A click at the viewport edge closes nothing. Not an app defect; the requirement should be reworded to X and Escape. | Open the popup, click at (2,2), nothing happens | `results-pb.json` row "JR-5 dismiss via backdrop" (shown FAIL, test of a non-existent interaction) | Fable strategic (requirement wording) | 0 |
| D-11 | minor | pre-existing | NR-5 | In Season 01 mode on desktop (1440) a blog post has no way to open the contact modal: Nav shows only "Join Season 01", and the "Talk to Humans" button exists only inside the mobile menu. Components/layout is unchanged from main, so this is main's behavior. The "How did you hear about us?" select is reachable on phone (mobile menu) and on desktop only from pages with a ModalButton such as `/methodology`. | Load the post at 1440 and search for buttons named "Talk to Humans" or "Start a conversation" (0 found) | `results-misc.json` ("NR-5 desktop trigger probe") | Fable strategic (is the attribution select meant to be reachable from posts?) | 0 |

## Not defects, recorded for the reader

- Test-harness mistakes fixed in my own scripts, not the app: first PB-4 popup detection used a case-sensitive text match and missed the CSS-uppercased headline and the phone layout that has no eyebrow; first PB-1 detection had the same weakness (fixed and rerun, results above). Early static-check selectors for Keep Reading and the featured card were wrong, fixed. None of these is reflected as an app defect.
- NR-1 camps top-screenshot pixel difference (11.6 percent at 1440) is run-to-run noise on the camps hero: the branch against itself differs by the same amount (`nr1/noise-check.txt`).
- `next start` does not write a per-request access log. The "zero POSTs reached the server" proof uses a small NODE_OPTIONS preload counter (`scripts/reqlog.cjs`) whose own `OPTIONS` probe line is the only entry.

## Static lane (Sentry), restored by Fable

The static Sentry's rows were overwritten when the browser Sentry wrote this file. Restored from its report; full detail in `evidence/static/results.md`.

| ID | Severity | Type | Requirement | What happened | Evidence | Owner | Cycle |
|---|---|---|---|---|---|---|---|
| S-001 | major | code-bug | CP-2 | Same as D-01: "Short answer:one study", no space after the bold label | `evidence/static/copy-fidelity.txt` | Atlas | 1 |
| S-002 | minor | accepted-risk | CP-12 | Link sentences render straight apostrophes where the approved text has curly ones | same | Fable | 0 |
| S-003 | minor | pre-existing | CP-20 | Lolcat reel transcript in JSON-LD says "last week" (verbatim speech) | `evidence/static/stale-phrasing.txt` | Fable | 0 |
| S-004 | minor | accepted-risk | CP-17 | "doing the 13.7 thing again" has no marker in its own sentence (frozen text) | `evidence/static/bare-13-7.txt` | Steward | 0 |
| S-005 | minor | pre-existing | TG-2 | `ekuzo101-weeks` test: 14 of 15, expects "PM ET", code returns "local time"; identical on main | `evidence/static/test-*.txt` | Fable | 0 |
| S-006 | minor | infra-gap | TG-6 | JAMA pages return a bot check to curl | `evidence/static/links-table.md` | Fable | 1 |
| S-007 | minor | code-bug | TG-5 | Sitemap `lastModified` for the online-friends post still 2026-05-29 | `app/sitemap.ts` | Atlas | 1 |

## Steward and Parent findings (rendered review), logged by Fable

Full text in `reviews/04-steward-rendered.md` and `reviews/04-parent-rendered.md`.

| ID | Severity | Type | What | Owner |
|---|---|---|---|---|
| ST-001 | major | visual | Hero soft at phone widths: `sizes` made phones fetch a 750px file for an image drawn about 990px wide | Atlas |
| ST-002 | minor | accepted-risk | At 768 and on the `/blog` featured card two stickies are cut mid-word | Jamie look-and-accept |
| ST-003 | minor | accepted-risk | S1 paragraph prints the figure with its correction in the neighbouring paragraphs (Jamie chose this version) | Fable |
| ST-004 | minor | accepted-risk | "30M+ people" in description, cards, JSON-LD, llms.txt, index excerpt (Jamie: subhead stays) | Fable |
| ST-005, ST-006, P1, P2 | minor | strategic | Popup at 2.5 s before the article is read; "too much" struck out over an article that says keep counting hours; present-tense sessions against a 2027 season; "Season 01" unexplained | Jamie |
| ST-007, ST-008, S3, C1, C5, F1 | minor | content | Frozen September copy: Brockie quote three times, "Four camps" over three, "the half no one shared", the garden-path sentence in "Where I stop", unexplained "five Cs" | next refresh |
| ST-009 | minor | content | Em dash in the sign-off of `what-your-kids-gaming-is-telling-you` (also lines 230, 616) | needs Jamie's yes |
| ST-010 | minor | visual | Straight apostrophe in the new paragraph of the online-friends post, which is set with curly ones | Atlas |
| ST-011 | minor | visual | Fortnite "Related:" line styled like the author's prose | accepted; optional |
| ST-012 | minor | content | Claims register lacks the camp shares and the "about 120 questions"; row 14 says "one genre" | KB, not the page |
| ST-013, E1 | minor | infra-gap | `head-and-schema.txt` predates recompression; `post-375-full.png` is a broken capture | Sentry |
| ST-014, S5 | minor | infra-gap | Instagram reel blank in captures (blocked by the QA proxy) | confirm on the deploy |
| ST-015 | minor | visual | Full-page captures of the post wider than the viewport at 375, 768, 1024 | Sentry to measure |
| H2 | minor | pre-existing | Template brush stroke crosses the headline on phones (every post on this template) | Aaron |

## Triage and repair (Fable, 2026-10-11)

| ID | Decision | Repair | Retest |
|---|---|---|---|
| D-01, S-001 | fix | `</strong>{" "}one` in the Short answer paragraph | Sentry confirmed in the final rebuild; static retest in cycle 1 |
| ST-001 | fix | hero `sizes="(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px"` | Sentry measures the fetched candidate at 375 and 768; Steward re-judges |
| ST-010 | fix | curly apostrophe in the new paragraph | static retest |
| S-007 | fix | sitemap date 2026-10-12 | static retest |
| S-006 | closed | JAMA's notice page (2803642, loaded in a browser) links "View Article" to 2797596; Crossref agrees. The article page shows a bot check to automation; Jamie clicks once on ship day | n/a |
| D-02 | closed, local only | The same URL returns 200 on live ekuzo.gg (curl, 2026-10-11); `next start` does not serve the unencoded `@` path; identical on main | n/a |
| D-03 | accepted minor | Reply-card meta text contrast 2.89; palette shared with the September QuoteCards design; Aaron's lane | listed for Aaron |
| D-04 to D-07, D-11, S-003, S-005, H2 | pre-existing, not this run | listed in the review guide | n/a |
| D-08 | accepted (decision 8) | follow-up for Jamie | n/a |
| D-09 | explained | The "other session" edits were Fable's cycle-1 repairs, made while Sentry ran | n/a |
| D-10 | requirement wording | The popup has no backdrop dismissal; MN-5's "backdrop" case does not exist | n/a |
| S-002 | accepted | The post body and four of the five host posts use straight apostrophes; the fifth is fixed (ST-010) | n/a |

## Cycle 1 and adversarial (Sentry)

Run 2026-10-11 night on HEAD `8cfe704`. Detail in `evidence/sentry-cycle1/results.md`. All Part A retests PASS except TG-4 (pre-existing D-02). Verified closed: D-01 and S-001 (one space), ST-001 (ratio 1.034 at DPR 2 at 375 and 768; 2400 px source caps DPR 3 at 0.81), ST-010 and S-007, ST-013 and E1 (tiled capture, heights match), ST-015 (not a defect, capture artifact, no sideways scroll at any tested width).

| ID | Severity | Type | Requirement | What happened | Evidence | Owner | Cycle |
|---|---|---|---|---|---|---|---|
| A-001 | minor | pre-existing | accessibility | The Season 01 popup is `aria-modal` but has no focus trap: Tab from the submit button leaves the dialog and walks the page behind it (Nav links at 1440). After Escape or X, focus is not returned to a sensible element (lands on a stale page link). The component is unchanged from origin/main. | `evidence/sentry-cycle1/b5-results.json` | Aaron (component) | 0 |
| A-002 | minor | pre-existing | layout | At 768 the footer "Join the Newsletter" form is cut off on every page (form right edge 882 in a 768 viewport; the Sign up button is off screen, clipped by `overflow-x: clip`). Seen on the post, `/` and `/faq`; Footer is unchanged from main. | `evidence/sentry-cycle1/footer-768.png`, `a-layoutmetrics.json` | Aaron | 0 |
| A-003 | minor | pre-existing | accessibility | Text-only zoom 200% at 1440: the site Nav logo overlaps "Programs" and the "Join Season 01" button is cut off at the right edge. Browser page zoom 200% (720 wide) and 320 wide are fine. The post's own hero, graphic, cards and sticky bar are clean. | `evidence/sentry-cycle1/zoom-2-top.png`, `b4-results.json` | Aaron | 0 |
| A-004 | minor | pre-existing | robustness | The popup treats any HTTP 200 as success without reading the body: a 200 with malformed JSON or `{"ok":false}` shows "You're on the list" and records a Lead (GA4 and Meta). The real route never does this; it matters only if a proxy or CDN returns a 200 error page. | `evidence/sentry-cycle1/b1-results.json` (rows "response: 200 ...") | Jamie (lane) | 0 |
| A-005 | minor | pre-existing | robustness and copy | The popup fetch has no timeout: "Saving…" with a disabled button lasts as long as the request hangs (30 s measured, then the browser's own error). The error shown for a network failure is the raw browser text "Failed to fetch" instead of the friendly line. Esc and X still close it, no Lead is recorded. | `evidence/sentry-cycle1/b3.mjs` timeline, `b1-results.json` | Jamie (lane) | 0 |
| A-006 | minor | pre-existing | validation | `/api/season-one` (and the client) accept `"><script>alert(1)</script>@x.co` as an email and pass it on to Klaviyo (502 here only because the key is fake). The client also sends 296-char emails (server returns 400, UI shows the friendly line). Klaviyo should reject the first itself; if the address ever reaches an email template or a sheet unescaped it is an injection vector. No size limit on the request body either: a 1 MB body is accepted and forwarded. | `evidence/sentry-cycle1/api-probes.txt` | Jamie (lane), consider a stricter regex and a body cap | 0 |
| A-007 | minor | pre-existing | validation | `/api/contact` returns `{"success":true}` when its downstream calls fail (the Resend response is never checked, Beehiiv errors are swallowed), so a parent sees success when Karlin's notification email was not sent. The notification HTML also interpolates `name`, `organization`, `message` and `pageUrl` unescaped (HTML injection in the email to Karlin). The new `heardAbout` field is safe: it maps through an allowlist and unknown values are dropped. | `evidence/sentry-cycle1/api-probes.txt` (contact rows), `app/api/contact/route.ts` | Jamie (lane) | 0 |
| A-008 | minor | accepted-risk | URL handling | `?join=<anything>` (even empty) opens the popup immediately, including for visitors who already joined or dismissed it (documented behavior). Tracking params: `ad`, `page` and `eventSourceUrl` are not capped client-side (3000 chars from a 3000-char utm_content); attribution values are capped at 200 as per contract. | `evidence/sentry-cycle1/b2-results.json` | Fable (contract note) | 0 |
| A-009 | minor | infra-gap | direct access | Static files (`/images/gaming-study-13-7-*.jpg`, graphic, `/research/*`) answer `Cache-Control: public, max-age=0` under `next start`, so no long cache; the `.py` file is `application/octet-stream` (downloads) while the output file is `text/plain`. Confirm headers on the Netlify deploy. | `evidence/sentry-cycle1/direct-access.txt` | Jamie (deploy check) | 0 |

Informational, not defects: storage-blocked pages render fine and the popup shows on every load (per contract); `ai_referral` fired once across load plus reload with storage blocked; uppercase path and `/extra` return 404 (no isBlogPostPath misfire); `/opengraph-image` and `/twitter-image` return 404 as expected; the harness shoot script's hero selector was stale after the alt change and was updated in my copy only.

## Closures and late rows (Fable, 2026-10-12 UTC)

| ID | State | Evidence |
|---|---|---|
| D-01, S-001 | closed, cycle 1 | `evidence/sentry-cycle1/results.md`; `evidence/static/copy-fidelity-8cfe704.txt` (CP-2 MATCH) |
| ST-001 | closed, cycle 1 | Sentry measurement (2048px candidate at 375 and 768, DPR 2); Steward re-run PASS in `reviews/04-steward-rendered.md` |
| ST-010, S-007, ST-013, E1 | closed, cycle 1 | `evidence/sentry-cycle1/results.md` |
| ST-015 | not a defect | `scrollWidth` equals `innerWidth`; capture artifact |
| S-002 | accepted minor | `copy-fidelity-8cfe704.txt`: S2.1 to S2.4 differ from the approved text only by straight apostrophes, the house style of those posts |
| D-02 | local only | `evidence/fable-link-and-count-evidence.txt`: live ekuzo.gg returns 200 for the same URL |
| S-006 | closed | same file: JAMA's notice page links the article at 2797596 |
| ST-016 | minor, visual, follow-up (Aaron) | `/blog` featured card `Image` has no `sizes`; soft at phone width |
| ST-017 | minor, content, next refresh | The "A parent" pill on two reply cards is our label; confirm in the reply corpus or relabel |
| D-03 | accepted minor, flagged to Jamie and Aaron | Reply-card meta text contrast 2.89:1, this post only; TG-9 stays FAIL with this acceptance on record |
| A-001 to A-009 | minor; pre-existing on main or infra | Follow-ups in `07-review-guide.md` |

No critical or major defect is open.
