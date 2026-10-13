# Defect log (Sentry, cycle 0)

No critical and no major defects found. All items below are minor or flags.

| id | severity | type | owner | description | evidence | cycles |
|---|---|---|---|---|---|---|
| D-1 | minor | code-bug (pre-existing pattern, on an edited line) | Atlas | Rendered text loses the space after a bold lead-in: "Approachable mechanics.A 12-year-old who has never played..." and "Cultural durability.Riot is still patching..." on the LoL post. Source has the space (page.tsx:320, :333) yet the compiled chunk emits no leading space; same quirk exists on origin/main for the Riot line. Fix: `{" "}` after the `</strong>` on both lines. | `grep -o "Approachable mechanics.\{0,40\}"` of served HTML: `Approachable mechanics.</strong>A 12-year-old`; evidence/sentry/results.md R1 | 0 |
| D-2 | minor | accepted-risk candidate | Atlas / Fable | Military and Fortnite posts changed (keep-reading card swap) but DATE_MODIFIED/og/sitemap stay 2026-07-31, while their visible date moved from "Published July 25/28" to "Updated July 31". Spec says dates move only for changed text; these did change. Decide: keep (cards are not body text) or move to ship date. | results.md R2, R6 | 0 |
| D-3 | minor | code-bug | Atlas | Sitemap lastModified for /blog/author/karlin-oei, jamie-fitch, muhammad-hossain stays 2026-07-31 although Jamie's bio and role and Karlin's post list changed. | sitemap.xml dump, results.md R2 | 0 |
| D-4 | minor | infra-gap | Fable | No blog test suite; `npm test` does not exist. The existing ekuzo101-weeks test fails (buildWeeksLabel "includes the time string", test file line 154), pre-existing and unrelated (no diff in lib/ekuzo101*). The two .ts tests need a documented resolver hook to run. | results.md R7 | 0 |
| D-5 | minor | code-bug (cosmetic, pre-existing layout) | Atlas | At 375px the byline role line ends with a dangling separator: "Founder of EKUZO ·" then "Updated October 13, 2026 · 8 min read" on the next line. No overlap. | crop of when-gaming-helps-homeschool-kids-375 (viewed) | 0 |
| D-6 | minor | copy-mismatch (pre-existing) | Story | Visible em dash remains on a changed page: guide reel caption "armor vs. magic resist — a League..." (page.tsx:436, also :84 schema text). Copy 01 lists the reel as unchanged, so not in scope, but it breaks the zero-em-dash rule on a rendered page. Also pre-existing: Karlin bio em dash (lib/authors.ts:104, the not-yet-frozen item) and em dashes within the two edited llms.txt lines. | results.md R5 | 0 |
| D-7 | minor | infra-gap | Sentry / Atlas | UNVERIFIED visually: "Related reading" on dark and light FAQ themes (collapsed answers), the /programs carousel line, homepage League sentence, review quote-card caption, and ProgramLine on five of six posts at 375. DOM presence is confirmed. Needs a click-driven or viewport capture. | results.md R8 | 0 |

## Retest 1 status (cycle 1)

| id | severity | type | owner | status | note |
|---|---|---|---|---|---|
| D-1 | minor | code-bug | Atlas | CLOSED (cycle 1) | all five bold lead-ins render with a space; evidence/sentry/results.md Retest 1 T1 |
| D-2 | minor | accepted-risk candidate | Atlas / Fable | STILL OPEN (decision) | military and Fortnite dates still 2026-07-31 after card swap |
| D-3 | minor | code-bug | Atlas | CLOSED (cycle 1) | Karlin and Jamie author pages and /blog lastmod 2026-10-13; Muhammad stays 07-31 matching its cards |
| D-4 | minor | infra-gap | Fable | STILL OPEN | no blog tests; ekuzo101-weeks test failure pre-existing; tsc exit 0 |
| D-5 | minor | code-bug | Atlas | CLOSED (cycle 1) | bylines viewed at 375 for staff, Lisa and Jamie: clean |
| D-6 | minor | copy-mismatch | Story | CLOSED for the guide reel caption (cycle 1); Karlin bio em dash fixed in description; og/twitter title "Karlin Oei — EKUZO" (lib/authors.ts:199, 216) and em dashes elsewhere remain pre-existing | |
| D-7 | minor | infra-gap | Sentry | PARTLY CLOSED | programs line, home sentence, review caption, six ProgramLines at 375, bylines, new guide viewed; FAQ open state deferred to human pass; some 1440/375 r2- crops captured but not viewed |
| D-8 | major | copy-mismatch | Story | OPEN, cycle 0 | League post line "65% of competitive college esports players are STEM majors, with graduation rates above the general student population" (app/blog/league-of-legends-youth-development/page.tsx:710; same sentence in FAQ schema string at :52) links to an Inven Global 2020 press release that says 52.6% of HS and collegiate esports athletes are interested in a "Sciences" major, and has no 65% and no graduation-rate claim. Source does not support the figure. Evidence: results.md Retest 1 T3 |
| D-9 | minor | infra-gap | Sentry / Fable | OPEN, cycle 0 | Six providers returned 403/429 to curl (connectedcamps.com, valhallan.com, xpleague.com, creatorcamp.org; facebook 400): guide claims about their prices and ages are UNVERIFIED by Sentry and need a human or Steward browser check |
| D-10 | minor | infra-gap | Sentry | OPEN, cycle 0 | First-run full-page screenshots truncated tall pages (programs, home, League, what-your-kids, when-your-sons); superseded only for the regions in the r2- crops. Console cleanliness of the new guide not read |

## Fable's dispositions, 2026-10-13

| ID | Disposition |
|---|---|
| D-2 | Accepted. A keep-reading card swap is navigation, not a change a reader of the post would call an update; dates stay July 31. |
| D-4 | Accepted for this pass, surfaced to Jamie. No blog suite exists; the failing `ekuzo101-weeks` test fails on `origin/main` too. |
| D-7 | FAQ "Related reading" in the open state is on Jamie's click-through list (07-review-guide.md). |
| D-8 | Closed by decision. Jamie had ruled the sentence stays ("we like marketing"). The link is removed because no source page carries the figure; the fact-library entry is marked CONTESTED. |
| D-9 | Closed. The four providers that block curl were read in the built-in browser by Fable on 2026-10-12 (evidence/camps-guide-research.md § e, f, g). |
| D-10 | Accepted. Superseded by the r2 crops; screenshots were later converted to JPEG and downscaled to keep the repo small, so file names in results.md end in .png where the files now end in .jpg. |
| Parent | Blockers about /programs, the /parents FAQ and "Season 01" are site state outside this pass; Jamie: "Ship as is; program work this week." League opening and the "dad" reference left as approved, by Jamie's decision. Guide wording fixed ("waitlist", "season one"). |
