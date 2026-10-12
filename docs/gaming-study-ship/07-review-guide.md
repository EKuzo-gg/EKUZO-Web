# Review guide: gaming-study post ship (Fable, 2026-10-11 evening CT)

## 60-second summary

The post is built, verified and ready to push. Nothing has been pushed or merged. Two local branches are prepared so each push is one command:

- `build/gaming-study-ship` (worktree `.claude/worktrees/gaming-study-ship`): the post branch plus `origin/main`, the changes, the fixes and these artifacts. A fast-forward of `origin/main`.
- `preview/gaming-study-dev`: `origin/dev` plus the build branch. A fast-forward of `origin/dev`. App code (`app`, `lib`, `components`, `context`, `middleware.ts`) is identical to the build branch.

Your checkout in `~/Projects/ekuzo-web` was never touched: still on `blog/gaming-study-13-7` at `0da2e89` with your other local work in place.

What was verified: every journey and must-not in the brief passes in a real browser; the protected pages show zero differences from a main build; 78 of 79 existing tests pass (the one failure is identical on main); Steward approved claims, never-say, offer, voice, visual parity and minors (four with minors on record); two Parent reads, one with zero context, found no comprehension or trust blockers. Completion criteria 1 to 8 are met for a pre-ship decision. "Shipped" waits on your checkpoints below.

## Decisions, most overrulable first

1. **Worktree and scratch branches instead of merging in your checkout** (D1). To overrule: nothing to undo; the same commits can be pushed from any branch name.
2. **Keep Reading is now three cards** (D2). The homeschool card's label reads "Case Studies" and lost its "by Karlin Oei" line, because the shared pattern has neither. Screenshot: `screenshots/post-1440-keepreading.png`.
3. **S3 (hero alt) and S4 (view counts) went in as Steward's versions** under "the fixes you mentioned". Text in `02c-approved-copy.md`. Veto either and it is a two-minute change.
4. **The five link sentences went in as a batch** on your word. Text in `02c-approved-copy.md`; screenshots `screenshots/inbound-*-1440.png`. The one in your own post adds a paragraph that introduces Karlin there, and bumps that post's modified date.
5. **Images recompressed** (hero 281 to 242 KB, card 116 to 94 KB, graphic 164 to 46 KB), same dimensions. Steward compared them with your finals: no visible loss.
6. **Visible date shows "Updated October 12, 2026" only** (D3).
7. **Sitemap and llms.txt entries added** (D4); the llms line reuses the page description, which says "30M+ people".
8. **Dates are 2026-10-12** (D7). If it ships another day, three strings change.
9. **Accepted as minor, not fixed:** reply-card meta text contrast 2.89:1 on this post (D-03, Aaron's component); straight apostrophes in four link sentences (house style of those posts).

## What to look at

1. `screenshots/post-1440-top.png`, `post-375-top.png`, `post-375-hero.png`: title, subhead, hero crop. At 768 wide and on the `/blog` featured card two sticky notes are cut mid-word (`post-768-hero.png`, `blog-1440-top.png`); look and accept, or ask for a different crop.
2. `screenshots/post-1440-opening.png`: Short answer, your chosen opening, the "duh" paragraph.
3. `screenshots/post-1440-graphic.png`, `post-375-graphic.png`: the graphic in place.
4. `screenshots/post-375-popup.png`, `post-375-stickybar.png`: the one ask per post.
5. `screenshots/post-1440-sources.png`: the view-count line.
6. `screenshots/post-375-full.png`: the whole article at phone width (the blank block is the Instagram reel, blocked by the QA proxy).
7. `evidence/sentry/pb4-*.png`: the newsletter A/B still works on a build with Season 01 mode off.

To run it yourself: `cd .claude/worktrees/gaming-study-ship && npx next dev -p 3001`, then open `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`. Do not submit the popup locally: your `.env.local` has the Meta token and no test flag, so a local sign-up sends a live server-side Lead.

## Things only you can do (in order)

1. **Read the two Musk quote-post view counts** (login needed) and tell me, or leave the Sources line as dated. One click on the JAMA link (`fullarticle/2797596`): it shows a bot check to automation; JAMA's own notice page links to it.
2. **Push the preview:** `git push origin preview/gaming-study-dev:dev`
3. **On the dev deploy** (`dev--ekuzo.netlify.app`): phone check, look and tap only. Page loads; hero is sharp; popup opens and closes; bar tap opens the popup; scroll is smooth; no newsletter ask; the Instagram reel renders; open the link from inside X or Instagram once. Paste the dev URL of the post into a link-preview tool and check the card.
4. **Push main:** `git fetch origin && git rev-parse --short origin/main` (expect `a449abc`; if it moved, stop and tell me), then `git push origin build/gaming-study-ship:main`
5. Tell me it is live and I run the close-out: verify against `origin/main`, asset pack, tracker CON-01, loop-4 entry, debrief, archive both handoffs.
6. **Klaviyo cleanup:** suppress or delete `team+gstest-1012-jr1@ekuzo.gg` and `-jr2` (`06-cleanup-ledger.md`).
7. **Reminder for ship + 7 days** (2026-10-19 if it ships 10-12): `featured` back to `should-you-ban-fortnite`, and drop "recent" from the opening. Say yes and I will set it.
8. Optional: a courtesy note to Muhammad about the "Related:" line under his sources.

## What the reviewers want you to know

- **The popup.** Three reviewers independently said the full-screen Season 01 popup at 2.5 seconds makes the first impression "this is an ad", on an article that then earns trust. "Season 01" is not explained anywhere on the page, and the article talks about sessions in the present tense while the only offer says 2027. Your locked decision; recorded, not changed.
- **The subhead.** "More than 30 million people saw it" stays per your call. Inside the article the opening and Sources line now reconcile it (views, across the posts that quoted it). The description, share card text, llms.txt and index excerpt still say "30M+ people".
- **Frozen September copy the Parents tripped on** (not changed): "one in six" used for two groups and "Three camps" over a card block titled "Four camps"; "not in the paper" up top against "about 15 years at 55" in the checklist, with no plain statement of whether the number is wrong; the garden-path sentence in "Where I stop"; "the AAP's five Cs" unexplained and unlinked. Candidates for the first refresh.

## Deferred to a human pass

Real phones and in-app browsers; the real Instagram embed; link-preview tools; cache headers and the `.py` content type on Netlify; a live sign-up end to end on the deploy (Klaviyo list join, Meta Lead dedupe, GA4), which needs the Netlify env for that context confirmed first; VoiceOver on the popup; a DPR 3 phone for hero sharpness.

## Follow-ups found, not part of this ship

- `/api/season-one` accepts a malformed email such as a script tag and forwards it to Klaviyo; a 1 MB body is accepted (A-006).
- `/api/contact` returns success when the Resend call fails, and the notification email interpolates user fields unescaped (A-007).
- Season 01 popup: no live-host guard (a sign-up on any host fires live GA4 and pixel Leads), no focus trap, any HTTP 200 treated as success, no fetch timeout (D-08, A-001, A-004, A-005).
- `ai_referral` matches referrers by substring, so `notclaude.ai` counts (D-07).
- The local Klaviyo key lacks `subscriptions:write`, `flows:read`, `metrics:read`; local sign-ups never join the list.
- For Aaron: reply-card contrast, the brush stroke over the phone headline, `/blog` featured card `sizes`, footer form cut off at 768, Nav at 200% text zoom, template contrast and landmarks (D-03 to D-06, ST-016, A-002, A-003, H2).
- Em dashes in `what-your-kids-gaming-is-telling-you`; "running all summer" in the League post; the 16 other pages with the "transformational" banner heading (list in the WORKLOG).
- `ekuzo101-weeks` test expects "PM ET" and fails on main too. No `test` script in `package.json`.

## KB backport candidates

1. Claims register: add the reply-camp shares and "about 120 questions"; row 14 says "one genre" where row 3 and the post say "one game" (ST-012).
2. A brief that says "push the branch to dev" needs the dev merge prepared, since dev and main have diverged: the merge into dev conflicts in the same files as the merge from main.
3. JSX drops the space after `</strong>` at a line break: the same bug shipped twice on this post (26f27cc, then the new Short answer label). A lint or a rendered-text check for "label:word" would catch it.
4. A `fill` image drawn `object-cover` in a fixed-height frame needs `sizes` computed from the drawn width, not the frame width.
5. When two Sentry lanes share one defect log, the second writer overwrote the first. Give each lane its own file.
6. In-session link sentences written in September without review carried three factual errors. Inbound links are copy and go through Story and Steward.

## Git evidence at writing time (2026-10-12 UTC)

Worktree `.claude/worktrees/gaming-study-ship`:

```
$ git status --porcelain
$ git log --oneline -6
bb472ab docs(gaming-study-ship): Build Loop evidence, ledger, defect log, WORKLOG entry
8cfe704 fix(blog): space after the Short answer label, sharper phone hero, sitemap date
9f4e523 content(blog): approved opening, hero alt, view counts and five inbound links for the gaming-study post; images recompressed
3195327 content(blog): gaming-study ship changes C1-C10 (less C2, C7), final images, one ask per post in Season 01 mode
8bab088 merge: origin/main (a449abc) into the gaming-study branch
a449abc docs: commit current CLAUDE.md and the docs it references
```

(`git status --porcelain` printed nothing. One more commit follows this file: the review guide and the return handoff themselves.)

`preview/gaming-study-dev` is `242aae2`, parent `origin/dev` `4f15b1e`. `origin/main` `a449abc`. Main checkout: `blog/gaming-study-13-7` at `0da2e89`, status unchanged from the handoff's embedded evidence.
