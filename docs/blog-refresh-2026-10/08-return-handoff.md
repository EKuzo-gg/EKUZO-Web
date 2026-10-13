# Return handoff: blog refresh pass

Fable, 2026-10-13. Paste the prompt below into the next session.

## Prompt

> Read `~/Projects/ekuzo-web/.claude/worktrees/blog-refresh-2026-10/docs/blog-refresh-2026-10/08-return-handoff.md`
> and `07-review-guide.md`. First run `git status --porcelain` and `git log --oneline -3` in that
> worktree and in `.claude/worktrees/blog-refresh-dev`, compare with the evidence in this file, and
> stop if they differ. Then do the open items in order. Load the KB's `CLAUDE.md`,
> `working-with-jamie.md`, `anti-ai-writing.md` and the voice stack before touching any copy.

## State

- `build/blog-refresh-2026-10` (off `origin/main` `3144459`): one site commit, docs commits after it. Not pushed. Jamie pushes: `git push origin preview/blog-refresh-dev:dev`, then after checking the dev deploy, `git push origin build/blog-refresh-2026-10:main`.
- `preview/blog-refresh-dev`: `origin/dev` plus a clean merge of the build branch. If the build branch gains commits, merge it again here before the dev push.
- Jamie's main checkout (`~/Projects/ekuzo-web`, branch `main`, uncommitted Teams work, unpushed `45bac22`) was not touched.

## Open items

1. **If the push happens on a day other than 2026-10-13:** move `DATE_MODIFIED`, the sitemap entries and the card date strings for the ten changed posts and the two author pages to the push date, in one commit, and re-merge into the preview branch.
2. **Jamie's click-through** (`07-review-guide.md` § What only you can check): related-reading lines in the open FAQ state, a real phone, console on the guide. Treat anything he reports as a defect: fix, retest, record in `05-defect-log.md`.
3. **After deploy** (brief § E): request indexing once per changed URL in Search Console as team@ekuzo.gg (Jamie, or Claude in the built-in browser with his go), annotate the chart, update the blog table in `knowledge-base/company/marketing/search-console.md`, schedule the recheck for about 2026-11-09.
4. **Monthly:** re-read every provider page behind `/blog/gaming-programs-for-kids` in a browser (the fetch tool's summaries produced two prices that were not on the pages). The title's season and the Updated date move only when the page changes. The research and the parked notes are in `evidence/camps-guide-research.md`.
5. **Program pages.** `/programs`, its sub-pages and the `/parents` FAQ still sell EKUZO100 and camps with prices while every button opens the Season 01 waitlist; six posts now link to `/programs`. Jamie's funnel work this week. `program-references.md` lists every program mention in the blog for that work; changing the one constant in `components/blog/ProgramLine.tsx` updates all six posts.
6. **KB:** the linking plan (`company/marketing/internal-linking-plan-2026-10.md`) has this pass's amendments appended; the 65% STEM figure is marked CONTESTED in the fact library; Jamie's role is "advisor to EKUZO" in `ekuzo-messaging-voice.md` and `about-me.md`. Karlin being a top 8 ranked collegiate player (Jamie, 2026-10-12) is not yet in the KB or on the site.
7. **Not done in this pass:** the sitewide copy fixes on /parents and /faq, the nav's "EKUZO 100", the two new posts (robux, neurodivergent), a blog test suite, the pre-existing `ekuzo101-weeks` test failure.

## Git evidence

Captured 2026-10-13, before the commit that adds this section (so the tip is one docs commit later).

`build/blog-refresh-2026-10`, `git status --porcelain`:
```
(clean)
```
`git log --oneline -3`:
```
28ee822 docs(blog-refresh): Build Loop artifacts, approved copy files, evidence, screenshots, WORKLOG
8f46358 content(blog): October refresh pass: Updated bylines, shared program line, homeschool pair made distinct, League and guest-post updates, programs guide at a new slug, author pages, related-reading links
3144459 docs: point the weekly Search Console triage at the KB playbook cadence
```
`git rev-list --left-right --count origin/main...HEAD`: `0	2` (0 behind, fast-forward of `origin/main`)

`preview/blog-refresh-dev` (worktree `.claude/worktrees/blog-refresh-dev`), `git log --oneline -2`:
```
53fd0bc Merge branch 'build/blog-refresh-2026-10' into preview/blog-refresh-dev
28ee822 docs(blog-refresh): Build Loop artifacts, approved copy files, evidence, screenshots, WORKLOG
```
`git status --porcelain` there: `?? .husky/_/` (an untracked husky shim folder created by the merge; not part of any commit)

A local branch `backup/blog-refresh-2026-10-full` holds the 33 step-by-step commits the two commits above were tidied from. Same tree. Delete it once this ships.
