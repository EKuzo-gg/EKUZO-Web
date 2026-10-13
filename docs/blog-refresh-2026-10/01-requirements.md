# Blog refresh 2026-10: requirements

Fable (lead session), 2026-10-12. Brief: `knowledge-base/system/loops/handoffs/2026-10-12-blog-refresh-pass.md`
(§ Decisions, § Build session brief). Codebase map: `00-scout-map.md`. Branch `build/blog-refresh-2026-10`
off `origin/main` at `3144459`. Nothing is pushed by Claude; Jamie pushes after every post is approved.

## Roles this run

Fable: lead session. Scout: done (`00-scout-map.md`). Story: lead session with the voice stack loaded
(copy is shown to Jamie one post at a time). Steward: separate top-tier agent per copy file, results in
`evidence/steward/`. Atlas: fast agent for code. Sentry: fast agent, QA after implementation. Auditor:
fast agent, ledger. Parent: top-tier agent on rendered pages. Chronos and Relay: not needed (no domain
logic, no third-party writes); recorded here so their absence is a decision.

## Code (A)

| ID | Requirement | Acceptance |
|---|---|---|
| A1.1 | (Changed by Jamie 2026-10-12, see decision log.) `AuthorByline` renders "Published X" when published and modified are the same day, and only "Updated Y" when they differ; the publish date is not shown on an updated post. Schema keeps both dates. /blog and author-page cards show the same date as the post. | Rendered HTML of all 11 posts: Fortnite, military and when-your-sons show only "Updated"; an unchanged post shows "Published". JSON-LD still has both dates. |
| A1.2 | For every post, the visible modified date, schema `dateModified`, OG `modifiedTime` and sitemap `lastModified` are the same day. | Script output comparing the four per post, in the ledger. |
| A1.3 | K1NG and conquering sitemap dates follow their real last content change (this pass changes both, so they take the ship date). | Same script. |
| A1.4 | A post's dates move only if its page text changed in this pass. | Diff per post beside the date change. |
| A2.1 | One shared program-line component with one copy constant, linking to `/programs`. Used on conquering, K1NG, when-gaming-helps, what-your-kids, when-your-sons, LoL. In guest posts it renders outside the author's text as an editor's line. | grep: one definition; no `/programs/ekuzo100` or `/programs/ekuzo-camps` link and no price left in those six bodies. |
| A2.2 | Muhammad's first-person "EKUZO 101" mentions in Fortnite and military are untouched. | Zero diff on those sentences. |
| A2.3 | `program-references.md` lists every program mention in the blog (before and after), for the funnel rebuild. | File exists; row count matches Scout § 2. |
| A3.1 | Camps guide moves to the new year-free slug (Story proposes, Jamie approves). 301 from the old URL. Old URL out of the sitemap, new one in. Every inbound link and `llms.txt` updated. | curl old URL returns 301/308 to new; grep finds the old slug only in `next.config.mjs`. |
| A4.1 | Karlin's author page and Person node: Karlin "Faith" Oei, `alternateName` "Faith", Leaguepedia in `sameAs` only after the page is opened and confirmed to be him. | Screenshot of the Leaguepedia page in evidence; JSON-LD dump. |
| A4.2 | Karlin's author page lists the gaming-study post (Scout disagreement 5). | Rendered page. |
| A5.1 | Author schema uses shared Person nodes by `@id` across posts; guest authors get one consistent node each. | JSON-LD dump per post. |
| D1 | Jamie's author page ships `knowledge-base/outputs/2026-10-12-blog-refresh/jamie-author-page-final.md` exactly: full bio, role line, alt text, short bio, both `llms.txt` lines, Person `jobTitle` "Advisor". No "CEO" for Jamie anywhere in `app`, `components`, `lib`, `public/llms.txt`. | Character-for-character diff of rendered bio against the file; grep. |
| D2 | KB records of Jamie's role updated in the same pass (`ekuzo-messaging-voice.md` § Author integrity, `personal/identity/about-me.md` § Current Roles). | Diff. |

## Copy (B, C), each a markdown file in `copy/`, Steward-checked, approved by Jamie before it is built

| ID | File | Post or surface |
|---|---|---|
| B1 | `01-homeschool-guide.md` | when-gaming-helps-homeschool-kids |
| B2 | `02-homeschool-review.md` | what-homeschool-parents-taught-us-about-gaming (new title, quote-card caption fix) |
| B3 | `03-linking-round-one.md` | Link sentences on /, /parents, /faq, /programs and in posts, with the amendments in brief § C |
| B4 | `04-league.md` | league-of-legends-youth-development |
| B5 | `05-what-your-kids.md` | what-your-kids-gaming-is-telling-you |
| B6 | `06-k1ng.md` | Editor's line only; Lisa's text untouched |
| B7 | `07-conquering.md` | One sentence on what EKUZO is, updated in place; the Faith line |
| B8 | `08-when-your-sons.md` | Program line only |
| B9 | `09-camps-guide.md` | Camps guide, Fall 2026, new slug, providers and prices re-verified this month |

Copy rules that are checked mechanically on every file and again on the rendered page: zero em dashes;
zero hard-banned words and phrases; no thread quote on both homeschool pages; no price or product name
in a post body (Muhammad's two posts excepted); every external link opened and its title recorded.

## Non-regression (protected)

- Zero diff: `app/api/**`, `context/**`, commerce and registration pages, Season 01 files
  (`app/season1/**`, `components/ui/SeasonOnePopup*`, `lib/attribution.ts`, `lib/analytics.ts`), `Nav`,
  `Footer`, torn-paper components.
- Lisa Holt's and John Hay's text, except John's one sentence on what EKUZO is (brief B.3).
- Fortnite and military body copy.
- Sitewide copy fixes on /parents and /faq beyond the link sentences; the nav's "EKUZO 100"; new posts.
- Jamie's checkout at `~/Projects/ekuzo-web` (uncommitted Teams work, unpushed `45bac22`).

## Journeys and must-not cases

- Old camps URL from Google or a bookmark lands on the new guide in one hop.
- /parents K1NG card reaches the post directly (no redirect hop).
- A reader on a phone sees both dates without the byline wrapping badly at 375px.
- Must not: any date changing on a post whose text did not change; "Updated" on a post whose dates are
  equal; the program line appearing inside a guest author's quoted text; QA browser contexts reaching
  GA4, Clarity or the Meta pixel (fail-closed proxy, per the Build Loop).

## Gates

Phase 2 freeze happens per copy file (Jamie's approval is the freeze). Phase 4: `next build` clean,
`.next/server` under 50 MB, screenshots at 1440 and 375 for every changed page before Parent and Steward
see them, console clean per page, date-agreement script output and link-title table in the ledger.

## Open at the start

- `node_modules` is missing in the worktree and there is no `test` script; the two `node --test` files
  do not cover the blog. Install before phase 3; surfaced as a flag, per principle 8.
- `package.json` says Next 16.2.1; the project CLAUDE.md says 15.
- Season 01 mode is on: every post's footer banner reads "Season 01 starts in 2027. Get them on the
  list." and `/programs/ekuzo100` is still live and indexable.
