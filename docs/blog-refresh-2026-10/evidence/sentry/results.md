# Sentry results (QA), blog refresh 2026-10

Branch build/blog-refresh-2026-10 at 62af078. Sentry edited nothing outside docs/blog-refresh-2026-10/. Scripts live in the session scratchpad (r1.py, r1b.py, r2.py, r4.py, r5.py, shoot.sh, frame.sh); their output is quoted below.

## Analytics guard (every browser run used this)

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1" \
  --user-data-dir=<fresh mktemp dir per run> --enable-logging=stderr --v=0 --window-size=W,H \
  --virtual-time-budget=2000 --screenshot=<path> <url>
```
- 375px captures: headless Chrome enforces a ~500px minimum window, so 375 shots render the page inside a 375px-wide iframe from a local file:// wrapper, same flags (`--window-size=500,14000`). Wrapper contains only an iframe to http://localhost:3101.
- virtual-time-budget 2000 ms on purpose: the Season 01 popup opens at 2500 ms (components/ui/SeasonOneTrigger.tsx:9) and covered the whole capture in a first run (discarded and re-shot).
- A second wrapper-with-script attempt used `--disable-web-security` (also with the host rules) to measure page height; it returned nothing and was abandoned. No screenshot came from it.
- No GA4/Meta/Clarity host was reachable. Chrome itself tried mail.google.com (default-app install), blocked by the same rule.
- Build: `STRIPE_SECRET_KEY=sk_test_placeholder npm run build` exit 0; `du -sh .next/server` = 40M. Tail: "ƒ Proxy (Middleware) / ○ Static / ● SSG / ƒ Dynamic". Server run on :3101, stopped at the end; `lsof -i :3101` empty.

## R1 Copy fidelity: PASS (with one note)

Script: parses "The post as it would read" in copy 01 and 02, strips (new)/(changed)/(new section) markers and markdown, applies the frozen-spec caption override on 02, and checks each paragraph/heading/table cell as a substring of the rendered visible text (whitespace, entities, curly quotes normalised).
- copy/01 -> /blog/when-gaming-helps-homeschool-kids: 51 passages, 50 found, 1 "miss" which is a marker-stripping artifact in my parser ("(changed) **Give it a goal.**" lines); the text "Give it a goal. Practicing toward something, a match, a project, a skill, gives the hours a point and a natural place to stop." is on the page. Effective 51/51.
- copy/02 -> /blog/what-homeschool-parents-taught-us-about-gaming: 49/49 (override caption "Real comments from a homeschool parent discussion, anonymized. Names and avatars are generic; nothing here is a screenshot of the original thread." present).
- Reverse check (rendered body lines between byline and "Keep Reading" that are absent from the copy file): guide 15, all unchanged components the copy file marks unchanged (five-question check, reel caption, sources list; "Mentors and self-reported growth in high school esports" label is present). Review 11, all quote-card furniture plus the overridden caption. No unexpected rendered paragraph.
- Copy 03 to 08 checked as explicit expected strings (r1b.py): 44 of 46 matched in visible text, title, meta, alt or JSON-LD as the copy file says (rows 1-11 of 03, changes 1-4, 6, 7, 9-11, 13 of 04, 05 c1-4,6,7, 06 c1-5, 07 c1-6, 08 c1-2, 02 title/meta, guide program line). The 2 misses were my own bad expected strings, verified by hand: 04c2 renders "Approachable mechanics." + "A 12-year-old who has never played..." with the space missing (see D-1, pre-existing compile quirk); 03r12 card exists with the post's real title "The gaming study everyone shared, and what it means for your twelve-year-old" (git diff of gaming-military-families/page.tsx shows the card swap).
- Markers: no "(new)", "(changed", "(new section)" or bracketed stage direction in any of the 14 fetched pages' visible text (guide and review dumps read line by line; stage directions like "[The five-question check sits here...]" absent).
- Parked copy 09: grep for the camps slug found nothing; `llms.txt`, sitemap, /blog, author pages clean. UNVERIFIED for 09 phrases beyond the slug (no scan of the 09 prose against pages was run).

## R2 Dates: PASS (flags D-2, D-3)

| post | byline | JSON-LD published / modified | og:modified_time | sitemap | /blog card | Karlin or author card |
|---|---|---|---|---|---|---|
| when-gaming-helps-homeschool-kids | Updated October 13, 2026 | 2026-05-21 / 2026-10-13 | 2026-10-13 | 2026-10-13 | Oct 13 | Oct 13 |
| what-homeschool-parents-taught-us-about-gaming | Updated October 13, 2026 | 05-21 / 10-13 | 10-13 | 10-13 | Oct 13 | Oct 13 |
| league-of-legends-youth-development | Updated October 13, 2026 | 05-16 / 10-13 | 10-13 | 10-13 | Oct 13 | Oct 13 |
| what-your-kids-gaming-is-telling-you | Updated October 13, 2026 | 05-24 / 10-13 | 10-13 | 10-13 | Oct 13 | Oct 13 |
| our-family-s-esports-journey... (Lisa) | Updated October 13, 2026 | 01-14 / 10-13 | 10-13 | 10-13 | Oct 13 | no author page |
| conquering-my-mountain... (John) | Updated October 13, 2026 | 01-14 / 10-13 | 10-13 | 10-13 | Oct 13 | no author page |
| when-your-sons-only-friends-are-online | Updated October 13, 2026 | 05-28 / 10-13 | 10-13 | 10-13 | Oct 13 | Oct 13 (Jamie page) |
| gaming-military-families | Updated July 31, 2026 | 07-25 / 07-31 | 07-31 | 07-31 | Jul 31 | Jul 31 (Muhammad page) |
| should-you-ban-fortnite | Updated July 31, 2026 | 07-28 / 07-31 | 07-31 | 07-31 | Jul 31 | Jul 31 |
| gaming-study-13-7-... | Updated October 12, 2026 | 10-12 / 10-12 | 10-12 | 10-12 | Oct 12 | Oct 12 |

Every row agrees on one day. No "Published" text in any byline. (JSON-LD times carry T12:00:00+00:00, same calendar day.)
Date vs text change (git diff origin/main, DATE_MODIFIED): changed in when-gaming-helps, review, league, what-your-kids, Lisa, John, when-your-sons (7 posts). Each has visible text changes (copy files 01 to 08). when-your-sons moved 2026-10-12 -> 10-13 with the program line and role change, fine. Unchanged DATE_MODIFIED but file changed: military and Fortnite. In both, the whole diff is the KEEP_READING card swap plus the BlogPostBody props line (hunks quoted under R6); nothing else changed. gaming-study: props only (6 lines), dates unchanged. Camps post: props line only. See D-2: military/Fortnite visible text (a card) changed but dates stayed 07-31, and their visible date changed from "Published" July 25/28 to "Updated July 31" purely because of the byline rule.
Other sitemap moves: /, /programs, /parents, /faq to 2026-10-13 (link sentences added, consistent with A1.4 spirit). Author pages' lastmod stayed 2026-07-31 though Jamie's bio and Karlin's list changed (D-3).

## R3 Links and redirects: PASS

- `curl -I /blog/summer-camps-for-kids-who-game-2026` -> `HTTP/1.1 307 Temporary Redirect  location: /blog` (next.config.mjs:64, permanent:false).
- Camps slug absent from /blog, /blog/author/karlin-oei, /sitemap.xml, public/llms.txt, served llms.txt, all 14 fetched pages, and every prerendered .next/server/app html except the camps post's own file (`grep -rl` returns only that). Source grep: only next.config.mjs and the page's own SLUG.
- Internal hrefs from the 18 changed pages (home, parents, faq, programs, blog, 3 author pages, 10 posts): 29 unique, 29 return 200, zero redirects. /parents story card href is `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng` (direct).
- Related reading: present in served HTML as 3 on /parents, 2 on /faq, 1 on /programs, texts match copy/03 rows 2-4, 6-8; 0 inside any application/ld+json block (checked each page's blocks: no "Related reading", no post slugs other than /blog/author). FAQ answer strings: `git diff origin/main` of app/faq, app/parents, app/programs shows only added `related:` objects, no answer line changed.
- Link in the `FAQAccordion` carries tabIndex -1 when closed (components/ui/FAQAccordion.tsx).

## R4 Structured data: PASS

- 18 pages, all ld+json blocks parse (0 failures). Every `{"@id"}`-only reference (author, publisher, mainEntity, etc.) is defined in the same page's graph: refs-undefined empty on all pages.
- Authors: Karlin posts -> `#coach-karlin`; Jamie -> `#person-jamie`; Muhammad -> `#person-muhammad`; Lisa -> `#person-lisa-holt` and John -> `#person-john-hay`, both defined (name only) in the article's own @graph (lib/schema.ts GUEST_AUTHOR_NODES).
- Jamie node: jobTitle "Advisor", description "Jamie Fitch is an advisor to EKUZO, a parent to two young gamers..." (matches the KB final file's short bio). No "CEO" in his node.
- Karlin node: alternateName "Faith", jobTitle "Founder", sameAs only LinkedIn (no Leaguepedia, consistent with "Not yet frozen"). Description still says "Former national collegiate esports captain" (Jamie confirmed correct).
- `grep -rn "CEO" app components lib public/llms.txt` after branch: league page.tsx:52 and :696 (Demis Hassabis, "CEO of Google DeepMind": not Jamie, pre-existing), app/season1/landing.html:843 (base64 image blob, noise). No CEO for Jamie anywhere; lib/authors.ts and lib/schema.ts and llms.txt no longer contain it. Jamie bio paragraphs in lib/authors.ts compared by eye against knowledge-base/outputs/2026-10-12-blog-refresh/jamie-author-page-final.md: identical text; role line, alt text, short bio, both llms lines match. (Not machine-diffed against rendered HTML; the rendered author page text read the same.)

## R5 Mechanical voice gate: PASS (no new hits)

Method: counted terms in visible text and meta tags of all 18 pages (r5.py), then, authoritatively, searched every ADDED line in `git diff origin/main -U0 -- app components lib public next.config.mjs` for em/en dash (incl. —, &mdash;), arrow, EKUZO100, "EKUZO 100", $100, $199, transformational, CEO.
- New hits: the only added lines are two public/llms.txt lines (the Jamie post line: "CEO" -> "advisor"; the review line: new title). Each contains an em dash that existed in the same sentence before ("— the same hours produce...", "— cut it off (60%)..."). Not newly written, but the lines were edited: noted as pre-existing text in an edited line.
- Pre-existing, not introduced (visible on changed pages):
  - app/blog/when-gaming-helps-homeschool-kids/page.tsx:436 reel caption "armor vs. magic resist — a League..." (visible); :84 same in video schema description.
  - app/blog/league-of-legends-youth-development/page.tsx:52 and :696 ("CEO of Google DeepMind", Hassabis); :115 schema description em dashes.
  - app/blog/gaming-military-families: visible "6–9times" en dash (data in the page body, unchanged file).
  - lib/authors.ts:104 Karlin bio em dash (meta description of his author page; the "not yet frozen" item); lib/authors.ts:199,216 and app/blog/page.tsx:10 titles "X — EKUZO".
  - app/layout meta ("EKUZO — Every Gamer Deserves a Team", "Transformational esports coaching") on every page; FooterBanner heading props "transformational" are not rendered in Season 01 mode.
  - app/parents/page.tsx (18 matching lines), app/faq/page.tsx (26), app/programs/page.tsx (15), app/page.tsx (17): same counts as origin/main (18/26/15/17); em dashes, EKUZO100, $100/$199 in FAQ answers and body, "EKUZO 100" in Nav/Footer; carousel glyph ← → on home, parents, programs.
- Counts on the 7 changed posts: zero em/en dashes in post bodies (except the two pre-existing above), zero $100/$199, zero EKUZO100 outside Nav/Footer ("EKUZO 100" in nav and footer on every page is pre-existing).

## R6 Non-regression: PASS

- `git diff --stat origin/main -- app/api context app/season1 lib/attribution.ts lib/analytics.ts components/layout 'components/ui/TornPaper*' components/ui/SeasonOnePopup*`: empty. Files changed outside docs: app/blog/*, app/faq, app/parents, app/programs, app/page.tsx, app/sitemap.ts, components/blog/{AuthorByline,BlogPostBody,ProgramLine,QuoteCards}, components/ui/FAQAccordion, lib/{authors,schema}, next.config.mjs, public/llms.txt.
- Lisa: diff touches imports (LISA_HOLT_ID, ProgramLine), description, title (em dash and double brand removed), DATE_MODIFIED, author schema @id, alt text, BlogPostBody props, the new editor's note inserted directly after the paragraph containing "his coach, Faith, would send us emails" (placement per spec), the closing editor's line (EKUZO100/$100 sentence removed), `<ProgramLine />`. No body text of Lisa's changed.
- John: imports, description, title, DATE_MODIFIED, author @id, alt text, props; his one sentence ("For those of you unfamiliar with the program, EKUZO puts kids on coached esports teams, through their schools and from home."), cite attribution `Faith (<Link>Karlin Oei</Link>), EKUZO founder and head coach`, closing editor's line, ProgramLine. Nothing else. Rendered cite and quote look right.
- Military and Fortnite: hunks quoted from `git diff origin/main`: (military) KEEP_READING `when-your-sons...` entry replaced by the gaming-study entry; (Fortnite) replaced by the review entry; both `<BlogPostBody ... date={DATE_PUBLISHED}>` -> `published={DATE_PUBLISHED} modified={DATE_MODIFIED}>`. Nothing else. A2.2 untouched (no "EKUZO 101" sentence in diff).
- Camps page: 1 line: `-<BlogPostBody author="karlin-oei" date={DATE_MODIFIED} dateLabel="Updated">` / `+<BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>`.
- League diff reviewed in full: title, DATE_MODIFIED, schema video name, props, "better moves" sentence, "Approachable mechanics" cut, "part of League I'd want a parent to see", "coached sessions", "Many kids come to us loving a different game...", "peaked at over 920,000 concurrent viewers", "During a season...", ProgramLine replacing the camps paragraph, 65% STEM link repointed (sentence unchanged), italic bio removed, keep-reading card -> what-your-kids. Matches 04 as frozen (changes 12 and 14 absent).

## R7 Tests and types

- `npx tsc --noEmit`: exit 0, no output.
- No `test` script in package.json. Tests found: lib/__tests__/season-one-attribution.test.ts, lib/__tests__/ekuzo101-weeks.test.ts, docs/blog-newsletter/tests/{routes,newsletterAb}.test.mjs.
- Plain `node --test` on the two .ts files fails ERR_MODULE_NOT_FOUND (lib/attribution.js); the file headers document a resolver-hook invocation. With it: tests 45, pass 44, fail 1: `buildWeeksLabel > includes the time string`, "Label missing time: Tuesdays & Thursdays - Weeks of Jul 21 - 7-8:30 PM local time" (ekuzo101-weeks.test.ts:154). `git diff origin/main` shows no change to lib/ekuzo101* so this is pre-existing and unrelated (D-4).
- `node --test docs/blog-newsletter/tests/routes.test.mjs docs/blog-newsletter/tests/newsletterAb.test.mjs`: 34 pass, 0 fail.
- FLAG: there is no blog test suite. Nothing automated covers byline, dates, redirects, schema or program line. Not a pass.

## R8 Browser truth and screenshots

Directory: docs/blog-refresh-2026-10/screenshots/ ({page}-1440.png at 1440x9000, {page}-375.png at 375x14000; 28 files; pages: home, parents, faq, programs, blog, author-jamie-fitch, author-karlin-oei, and the 7 posts).
- Console (--enable-logging=stderr): no hydration mismatch, no invalid DOM nesting, no uncaught exception, no React warnings on any page (grep for hydrat|did not match|validateDOMNesting|Uncaught|TypeError|Warning: over all logs: empty). Noise, not counted: "resource ... preloaded using link preload but not used" (images/icons), "No WebGL support. Image mesh will not be drawn." (home/parents/programs; headless --disable-gpu), CVDisplayLinkCreateWithCGDisplay / task_policy_set / mail.google.com install (Chrome itself). Blocked third-party hosts produced no console lines at v=0, so blocking is by rule, not by observed errors.
- Truncation check: guide at 1440 ends with footer inside 9000 px; 375 ends inside 14000 px. Other pages were not each verified to the last pixel (UNVERIFIED for the bottom of home, parents, programs at 1440).
- LOOKED AT (viewed crops):
  - Guide at 375: byline reads "by Karlin Oei / Founder of EKUZO · / Updated October 13, 2026 · 8 min read": no collision, no bad wrap; the separator dot dangles at the end of the role line (pre-existing mobile separator, cosmetic, D-5).
  - Guide ProgramLine at 1440: italic, hairline rule above, red link, reads as set apart. Fine.
  - Lisa: editor's note directly under the "coach, Faith" paragraph, italic, red Karlin link, legible. Fine.
  - John: attribution "Faith (Karlin Oei), EKUZO founder and head coach" in cite, link red, fine; closing italic line "Related: ... and ..." then ProgramLine, fine.
  - Review quote-card caption wording confirmed in DOM; its visual rendering not viewed (UNVERIFIED visually).
  - NOT JUDGED visually: ProgramLine on LoL, what-your-kids, when-your-sons, K1NG, conquering at 375 (guide at 1440 and John at 1440 only); "Related reading" on the dark and light FAQ themes (answers are collapsed, so the line is not visible without clicking; I did not drive a click); the new line under the /programs carousel (crops I took landed on other sections; the carousel/FAQ region at 6600+ rendered blank grey in the tall capture, likely scroll-triggered animation); homepage League sentence. All UNVERIFIED visually; DOM presence confirmed in R1/R3.
- Season 01 popup: appears after 2.5 s on a fresh profile; first capture was covered by it. Not a defect of this branch.

## R9 Journeys and must-nots

- Old camps URL -> single 307 hop to /blog, 200 on /blog. Requirement text said the camps guide would land on a new guide; this is withdrawn by the camps decision (spec).
- /parents K1NG card -> direct 200, no hop: PASS.
- Phone byline at 375px: PASS (see R8).
- Must-not "any date changing on a post whose text did not change": military and Fortnite show "Updated July 31" where main showed "Published" July 25/28; their text changed (card), so allowed, but see D-2. Gaming-study date unchanged.
- Must-not "Updated on a post whose dates are equal": superseded by Jamie's decision log entry (every post says "Updated"); gaming-study shows "Updated October 12, 2026" with equal dates, as decided.
- Must-not "program line inside a guest author's quoted text": it renders after the editor's line, outside the text: PASS in code and in the John crop.
- Must-not "QA contexts reaching GA4/Clarity/Meta": guard above; UNVERIFIED by observation of blocked requests (no network log), enforced by resolver rules.
- External links: no page was opened off-machine (guard). The LoL 65% STEM link now points at invenglobal.com; whether that page contains the figure and returns 200 is UNVERIFIED (Steward territory).
- A2.1 grep: `grep` for `/programs/ekuzo100` and `/programs/ekuzo-camps` in the six program-line posts: none (ekuzo-camps links remain only inside the inactive camps post). Price in those bodies: none.

---

# Retest 1 (Sentry, branch head 502f423)

Rebuild: exit 0, `.next/server` 40M. Served on :3101, stopped at the end (`lsof -i :3101` empty). Browser runs used the same guard flags (`--host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1"`, fresh `--user-data-dir`), now driven through Chrome DevTools Protocol from node (`--remote-debugging-port=9333`, bound to 127.0.0.1, which the rule excludes). This gives true 375px layout (device-metrics emulation), element-anchored crops, and the Season 01 popup suppressed by pre-setting its own dismissed key in localStorage on /robots.txt. Prefix `r2-` in screenshots/. No `--disable-web-security` run was used in the retest.

## T1 Own defects
- **D-1 CLOSED.** Source now `</strong>{" "}` on both lines (git diff 62af078..HEAD). Rendered HTML for every bold lead-in in the five-properties list: `<strong>Strategic depth.</strong> League rewa`, `Approachable mechanics.</strong> <!-- -->A 1`, `Stable roles and systems.</strong> Five clear`, `Cultural durability.</strong> <!-- -->Rio`, `It isn't a shooter.</strong> Fantasy com`. Space present in all five. Crawl for `</(strong|em|a|b|i|span)>[A-Za-z0-9]` was not re-run site-wide; military page "6–9times" glitch (pre-existing, other file) not retested.
- **D-3 CLOSED for Karlin and Jamie, note for Muhammad.** Sitemap: /blog/author/karlin-oei and /jamie-fitch now 2026-10-13; /blog 10-13. Muhammad's page stays 2026-07-31, which equals the card dates it shows; its content in this branch changed only card dates to 07-31, so I treat it as consistent.
- **D-5 CLOSED.** Crops viewed at true 375px: staff post "by Karlin Oei / Founder of EKUZO / Updated October 13, 2026 · 8 min read"; Lisa Holt (guest, no role line) "by Lisa Holt / Updated October 13, 2026 · 5 min read"; Jamie "by Jamie Fitch / Advisor to EKUZO · Parent / Updated October 13, 2026 · 9 min read". No leading, trailing or doubled "·", nothing clipped, all lines readable. Files: r2-byline-staff-homeschool-guide-375.png, r2-byline-guest-lisa-375.png, r2-byline-jamie-whensons-375.png.
- **D-6 CLOSED.** Guide reel caption renders "armor vs. magic resist: a League of Legends concept..." (page.tsx:436); video schema description and name also colon/parens now (:82, :84). No em dash in visible text.

## T2 New guide /blog/gaming-programs-for-kids
- Copy fidelity vs copy/09 "The post as it would read": 66/66 paragraphs, bullets, headings, table cells found in rendered text; 12/12 link hrefs with matching anchor text (10 external, /programs, /blog/league-of-legends-youth-development); reverse check: 0 rendered body lines absent from the copy file. No review markers.
- Byline "Updated October 13, 2026" (no "Published"). JSON-LD BlogPosting datePublished 2026-05-14T12:00, dateModified 2026-10-13T12:00, author `#coach-karlin`; og published 2026-05-14, modified 2026-10-13; sitemap 2026-10-13; title tag and meta description match Page furniture ("...with prices checked in October.").
- Cards: /blog shows it as "October 13, 2026 · by Karlin Oei", Guides; Karlin's author page lists it plus the gaming-study post; old camps title ("Virtual summer camps") absent from both.
- Forbidden strings in the guide's body: "$199" none; "EKUZO Camps" only in the global footer link; "EKUZO100" only inside the sitewide rootGraph JSON-LD; "EKUZO 100" only in nav/footer; "summer 2026", "still open", "recess/Recess": none; `<iframe`: none. "transformational" appears only in the FooterBanner heading prop in the RSC payload (not rendered in Season 01 mode, same as every post).
- `curl -I /blog/summer-camps-for-kids-who-game-2026`: `HTTP/1.1 308 Permanent Redirect`, `location: /blog/gaming-programs-for-kids`, one hop. Old slug in all 11 posts + home, parents, faq, programs, blog, 3 author pages, sitemap, llms.txt (served) and public/llms.txt: 0 hits; source grep: only next.config.mjs:59; the old page directory is gone.

## T3 External links (curl -L, browser UA)
| status | URL | title |
|---|---|---|
| 403 | connectedcamps.com/clubs | "403 - Forbidden" UNVERIFIED (blocks curl) |
| 429 | creatorcamp.org | "Vercel Security Checkpoint" UNVERIFIED |
| 200 | outschool.com/search?q=minecraft+club | Outschool - Live Online Classes for Kids ... |
| 403 | valhallan.com | "403 - Forbidden" UNVERIFIED |
| 200 | codeninjas.com | Code Ninjas, AI, Robotics, Coding & STEM for Kids Ages 5-14 |
| 200 | idtech.com/tutoring | Online Tutoring for Teens & Kids, Private Remote Learning Lessons |
| 200 | murrietaca.gov/Calendar.aspx?EID=4802 | Calendar, Teen Gaming Afternoons |
| 200 | nasef.org | title not extractable from fetched HTML (page is script-rendered); 200 |
| 200 | playvs.com (www redirects to apex) | PlayVS - We Power Scholastic School Esports |
| 403 | xpleague.com | "403 - Forbidden" UNVERIFIED |
| 200 | invenglobal.com/articles/10313/... (League STEM link) | Esports athletes more inclined to pursue STEM fields, including computer science, engineering and game design, new study finds |
Footer socials (also on the page): linkedin 200, youtube 200, x 200, facebook 400 (curl blocked; not part of this pass).
For the six UNVERIFIED providers the guide's price and age claims could not be checked against the pages by me.
**STEM link: the 65% figure is NOT on the fetched page.** The article (Inven Global, 4 Feb 2020, a GYO Score press release) says "52.6% of esports athletes at the high school and collegiate levels are interested in pursuing a college major in the 'Sciences' category (traditional STEM fields)". A search of the fetched text for "65" near "%/percent" returns nothing. The League post line (page.tsx:710, and the FAQ schema string at :52) says "65% of competitive college esports players are STEM majors, with graduation rates above the general student population". Also not on that page: graduation rates. See D-8.

## T4 Karlin's author page: PASS
H1 `Karlin "Faith" Oei`. Bio contains, after "...earned $80,000+ in esports scholarships.", the exact sentence "Faith was his gamertag as a jungler at UT Dallas, and it's the name his players know him by." Meta description: "...a former national collegiate esports captain who earned $80,000+ in scholarships and now..." (comma, no dash). Person node: name "Karlin Oei", alternateName "Faith", sameAs [LinkedIn, https://lol.fandom.com/wiki/Faith_(Karlin_Oei)]. Bylines on 6 of his posts read "by Karlin Oei". Lists the guide and the gaming-study post, not the old camps title. Note: og:title/twitter:title still "Karlin Oei — EKUZO" (lib/authors.ts:199, 216; pre-existing, listed in R5).

## T5 League and FAQ: PASS
League closing: ProgramLine, then "We also keep a guide to other programs for kids who game." linked to /blog/gaming-programs-for-kids; keep-reading card href /blog/gaming-programs-for-kids, title and alt "Gaming programs for kids: a parent's guide, Fall 2026". /faq "What programs does EKUZO offer?" has "Related reading: Gaming programs for kids: a parent's guide" with href in served HTML; neither the slug nor "Related reading" in any ld+json block.

## T6 Regression
- R2 table (11 posts): all agree (byline / JSON-LD modified / og / sitemap): seven edited posts and the guide 2026-10-13; military and Fortnite 2026-07-31; gaming-study 2026-10-12. Published dates 05-21, 05-21, 05-16, 05-24, 01-14, 01-14, 05-28, 05-14, 07-25, 07-28, 10-12. No "Published" in any byline. D-2 (military/Fortnite dates not moved) remains an open decision.
- R3: 30 unique internal hrefs across 18 pages, all 200, no redirect hops.
- R4: all ld+json blocks parse; no undefined `@id` on any of the 18 pages.
- R5: `git diff origin/main --unified=0 -- app components lib public | grep '^+' | grep -n '[—–→]'` returns nothing. Other terms in added lines: only the new guide's `<FooterBanner heading="Enroll into a transformational program today" />` (same prop on every post, not rendered in Season 01 mode).
- R6: protected-path diff empty. `git diff 62af078 HEAD` on Lisa's and John's page files: empty (paragraphs unchanged since my last run).
- R7: `npx tsc --noEmit` exit 0. (Existing node tests not re-run.)

## T7 Visuals (CDP crops, all viewed unless stated)
| crop | verdict |
|---|---|
| r2-programs-onemom-1440 | Line centered under the carousel dots, grey text with red underlined link, legible, spacing fine, sits above the torn edge. |
| r2-home-league-1440 | Sentence continues the paragraph; "why we chose League of Legends for kids" underlined white on purple, readable. (375 version r2-home-league-375 captured, not viewed.) |
| r2-review-caption-375 | Caption "Real comments from a homeschool parent discussion, anonymized..." small grey under the cards, wraps cleanly. (1440 captured, not viewed.) |
| r2-programline-{league,whatyourkids,whensons,lisa,guide-homeschool,john}-375 | All six: hairline rule, italic line, red "See the current programs", set apart, no overflow. League also shows the "We also keep a guide..." line below in normal text. |
| r2-programline-*-1440 | Captured for all six; viewed only for the homeschool guide and John (earlier run, same component). Others UNVERIFIED visually, same component. |
| r2-lisa-note-375 / -1440, r2-john-cite-375 / -1440 | Captured. Viewed at 1440 in the first run: Lisa note italic with red Karlin link; John cite "Faith (Karlin Oei), EKUZO founder and head coach". The r2- versions were not re-viewed. |
| r2-byline-* (3) | See D-5, all clean. |
| r2-newguide-top-375 | Section label, H1 wraps in 3 lines, deck, hero image, byline all fine. The red "Join Season 01" bar overlaying the hero is the fixed sticky CTA caught mid-capture, not a layout bug. |
| r2-newguide-top-1440 | H1, deck, hero fine; sticky waitlist bar at the bottom of the capture is the same fixed element. |
| r2-newguide-table-375 | Two-column cost table fits the 375 viewport, cells wrap, no horizontal overflow. Page scrollWidth equals viewport width at 375 and 1440 on all pages captured. |
| r2-newguide-full-1440 | Viewed downscaled: headings, bullets, h3 sections, table, "How this guide is kept", keep-reading card to Lisa's post, footer all present. Too small to read body text. |
| r2-newguide-full-375 | Captured (10664 px tall), not viewed. |
- FAQ "Related reading" in the open state: deferred to the human pass (not attempted).
- Capture-size correction: earlier 14000/9000 px captures truncated tall pages. Actual heights: /programs 13149 (1440), home 12994 (1440) and 13550 (375), League 16725 (375), what-your-kids 16593 (375), when-your-sons 15432 (375). The first-run full screenshots for those are therefore incomplete; only the r2- crops cover the regions judged in this retest.
- Console: not re-captured for the retest pages except through the CDP session, whose console/exception log is at the scratchpad (cdp-console.log); I did not read it into this report. Console-clean status for the new guide is UNVERIFIED.
