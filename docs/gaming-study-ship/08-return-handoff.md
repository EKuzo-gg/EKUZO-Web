# Return handoff: gaming-study post, ship and close (Fable, 2026-10-11)

## Opening prompt (paste into Claude Code, opened in `~/Projects/ekuzo-web`)

> Read `.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/08-return-handoff.md` and do what it
> says. First load the KB's `CLAUDE.md`, `personal/identity/working-with-jamie.md` and
> `system/methodology/anti-ai-writing.md`. Run Step 0 and tell me the result before anything else.

## State

The Build Loop for the gaming-study post ran through phase 7 on 2026-10-11. Nothing is pushed. Read `07-review-guide.md` in this folder first; the ledger is `04-evidence-ledger.md`, defects `05-defect-log.md`, the brief `knowledge-base/system/loops/handoffs/2026-10-12-gaming-study-post-build-loop.md`.

## Step 0

In `~/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship` run `git status --porcelain` and `git log --oneline -3` and compare with the evidence at the bottom. Then `git fetch origin`: expect `origin/main` `a449abc` and `origin/dev` `4f15b1e`. If either moved, stop: re-merge, rebuild, and re-run the regression (NR-1, NR-2) and TG-1 before any push. Check `git branch -v` shows `preview/gaming-study-dev` and `build/gaming-study-ship`.

## Work, in order (each push is Jamie's go and runs from Jamie's terminal)

1. If Jamie gives new Musk quote-post view counts, update the Sources sentence in the post (never a combined figure; a figure reading 13.7M is written "about 14M"), rebuild, re-run `evidence/static/fidelity.mjs`, commit, and re-merge into `preview/gaming-study-dev`.
2. If the ship day is not 2026-10-12, re-set `DATE_PUBLISHED`, `DATE_MODIFIED`, the index `date`, the sitemap `lastModified` for the post and for `when-your-sons-only-friends-are-online`, and that post's `DATE_MODIFIED`.
3. Preview: `git push origin preview/gaming-study-dev:dev`. Jamie's phone check on `dev--ekuzo.netlify.app` (list in the review guide), link-preview check of the card, the Instagram reel renders. No sign-up on the deploy until the Netlify env for that context is confirmed (CAPI token absent, or `META_CAPI_USE_TEST_CODE=true` with a test code); the popup has no live-host guard.
4. Main: `git push origin build/gaming-study-ship:main` (a fast-forward; never `dev:main`).
5. Verify live against `origin/main`: the post, `/blog` featured card, `og:image` and `twitter:image` 200 at 1200x630, JSON-LD dates, one ask per post, the five inbound links, sitemap and llms.txt.
6. Search Console: check `knowledge-base/system/loops/handoffs/2026-10-12-search-console-setup.md`. Request indexing only if that session has run; otherwise leave it to that session.
7. Asset pack in `knowledge-base/outputs/2026-10-12-gaming-study-asset-pack/`: the Short answer paragraph (the answer block; do not lift the opening paragraph alone, it prints 13.7 with its correction in the neighbouring paragraphs), two or three pull-quotes, the dark graphic as a standalone 4:5 file with one caption sentence that carries the "keep counting the hours" guardrail, the share card, a short-form brief for Karlin (voice stack loaded first), and the UTM links: `utm_source` x, linkedin, instagram or email; `utm_medium` social or email; `utm_campaign=gaming-study`; `utm_content` karlin or ekuzo.
8. Close: WORKLOG (ship date, featured-revert date), tracker CON-01, the loop-4 entry in `knowledge-base/explorations/2026-09-14-gaming-cognition-viral-moment-evaluation-and-agentic-plan.md` § 9, session debrief, both handoffs (`2026-10-12-gaming-study-post-build-loop.md`, `2026-10-06-ship-gaming-study-post.md`) moved to `_archive/` with `ran_in` filled, lessons-pending files for the KB backport candidates in the review guide.
9. Housekeeping after main is live: fast-forward or delete `blog/gaming-study-13-7`; in Jamie's checkout the ten docs that are byte-identical to main can be restored or removed (`git checkout -- <4 tracked>`, remove the 6 untracked) so the checkout can move to main; remove the worktree and the two scratch branches; delete the QA scratch directory.
10. Ask Jamie: the Klaviyo test profiles (suppress or delete), the ship + 7 days reminder (featured flag back, drop "recent"), the note to Muhammad.

## Constraints

- No push, merge to a shared branch, send or external write without Jamie's go in the session.
- Browser QA only behind the blocking proxy (`evidence/README-harness.md`); the QA scratch directory is session-specific, so rebuild the harness from `evidence/sentry/scripts/` if it is gone.
- A local sign-up with the real `.env.local` sends a live server-side Meta Lead. Start any local server that will take a sign-up with `META_CAPI_ACCESS_TOKEN=` blank.
- Copy changes go to Jamie; "13.7" never alone.

## Git evidence at writing time (2026-10-12 UTC)

Worktree `~/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship`, branch `build/gaming-study-ship`:

```
$ git status --porcelain
$ git log --oneline -3
bb472ab docs(gaming-study-ship): Build Loop evidence, ledger, defect log, WORKLOG entry
8cfe704 fix(blog): space after the Short answer label, sharper phone hero, sitemap date
9f4e523 content(blog): approved opening, hero alt, view counts and five inbound links for the gaming-study post; images recompressed
```

`git status --porcelain` printed nothing. One commit follows this evidence: the commit that adds `07-review-guide.md` and this file. So at Step 0 expect `git log --oneline -3` to show that docs commit on top of `bb472ab` and `8cfe704`, and a clean status.

Main checkout `~/Projects/ekuzo-web`, branch `blog/gaming-study-13-7` at `0da2e89`: status as embedded in the 2026-10-12 build-loop handoff (16 modified, 17 untracked paths), untouched by this run.
