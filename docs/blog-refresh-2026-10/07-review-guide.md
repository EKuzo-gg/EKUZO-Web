# Review guide: blog refresh pass

Fable, 2026-10-13. Written after QA, repair and the fresh-eyes read finished.

## In 60 seconds

- Ten posts and two author pages are refreshed on `build/blog-refresh-2026-10`. Nothing is pushed.
- You approved every post's copy as a file (`copy/01` to `09`); QA confirmed the rendered pages match those files.
- The camps post is now `/blog/gaming-programs-for-kids`, with a permanent redirect from the old URL.
- Every post shows "Updated October 13, 2026" or its real last-changed date; schema keeps the original publish dates.
- The one thing a reader will trip on is outside this pass: `/programs` and the `/parents` FAQ still sell EKUZO100 and camps while every button opens the 2027 waitlist. You said ship as is; program work is this week.

## Decisions, most overrulable first

| # | Decision | Whose | To overrule |
|---|---|---|---|
| 1 | The 65% STEM sentence in the League FAQ stays, unlinked. Neither the NASEF page nor the Inven Global page carries the figure (Inven says 52.6% are interested in a sciences major). Marked CONTESTED in the KB fact library. | Yours to keep; mine to unlink | Cut the sentence, or give me the origin and I'll link it. |
| 2 | Military and Fortnite posts keep their July 31 dates. Only a keep-reading card changed on each. | Mine | Say so and both move to the ship date. |
| 3 | Cards on /blog and the author pages show the post's Updated date, in the long format ("October 13, 2026"). | Mine | Keep the original dates on cards. |
| 4 | The shared program line has a hairline rule above it to set it apart. | Atlas | Remove the rule. |
| 5 | Card excerpts on /blog for Lisa's and John's posts now match their approved meta descriptions. | Mine | Revert the excerpts. |
| 6 | Hero alt text on the guide: "A teenager in headphones playing a computer game at a desk in his bedroom". | Mine | Give me the wording. |
| 7 | The League post's title asks "Is League of Legends OK for kids?" and its first paragraph answers a different question. You chose to leave the opening. | Yours | Change the title back, or add an answer sentence. |
| 8 | Screenshots are stored as downscaled JPEGs (17 MB) in place of the original PNGs (42 MB). | Mine | None needed. |

## Walk through it

Run it locally from the worktree:

```bash
cd ~/Projects/ekuzo-web/.claude/worktrees/blog-refresh-2026-10 && STRIPE_SECRET_KEY=sk_test_placeholder npx next start -p 3105
```

The site hardcodes live GA4, Meta and Clarity IDs, so a normal browser on localhost sends real beacons. Either use a private window with network blocking, or do this walk-through on the dev deploy after the dev push.

1. `/blog`: eleven cards, the guide under its new title, no camps card, dates as "Updated" dates.
2. `/blog/gaming-programs-for-kids`: the guide. Then visit `/blog/summer-camps-for-kids-who-game-2026` and confirm it lands on the guide.
3. `/blog/when-gaming-helps-homeschool-kids`: no parent quotes; the new "What's different about doing this in a homeschool?" section; program line near the end.
4. `/blog/what-homeschool-parents-taught-us-about-gaming`: new title; caption under the quote cards.
5. `/blog/league-of-legends-youth-development`: new title; closing has the program line and the guide sentence.
6. Lisa's post: the editor's note under her first mention of Faith. John's post: the attribution under the quote; his sentence on what EKUZO is.
7. `/blog/author/karlin-oei` and `/blog/author/jamie-fitch`.
8. `/parents`, `/faq`, `/programs`: open the FAQ items listed in `copy/03-linking-round-one.md` and look at the "Related reading" line.

## What only you can check

- **"Related reading" in the open state** on `/parents` (light and dark FAQ themes), `/faq` and `/programs`. QA confirmed the links are in the HTML; it could not click the accordions.
- **Phone layout on a real phone.** First-round phone captures looked clipped on the left; second-round crops of the same pages were clean. One post is enough.
- **Console on the guide and Karlin's page.** My check captured no errors but may not surface console output in that browser mode.
- **External links in posts other than the guide** were not re-opened in this pass.

## Before you push

- The posts say October 13. If you push on another day, tell me and I'll move the date in one commit.
- `git status` in your main checkout: it still has your uncommitted Teams work and the unpushed docs commit `45bac22`. This branch did not touch it.

## Push commands

Dev first, then main after you've looked at the dev deploy:

```bash
cd ~/Projects/ekuzo-web && git push origin preview/blog-refresh-dev:dev
```

```bash
cd ~/Projects/ekuzo-web && git push origin build/blog-refresh-2026-10:main
```

Both are fast-forwards of their targets as of the evidence below. Your local `main` is 4 behind and 1 ahead of `origin/main`; these pushes name the branches directly and don't involve it.

## After deploy (brief § E)

1. Search Console, URL inspection, request indexing once for each changed URL: the ten posts, `/blog/gaming-programs-for-kids` (new), the two author pages.
2. Annotate the Search Console chart with the deploy date.
3. Update the blog table in `knowledge-base/company/marketing/search-console.md`.
4. Recheck indexing about 2026-11-09.
5. Monthly: re-read each provider's page for the guide; move its season label and date only when the page changes.

## KB backport candidates

- A light update of a published post keeps existing marketing claims (saved as feedback memory this session).
- Research fetched through a summarizing tool produced two prices that were not on the rendered pages. For any published price or figure, a browser read of the rendered page is the bar.
- A shell loop variable named `path` wipes zsh's PATH. The browser refused to start and loaded nothing; no harm, but it is a trap.
- The fresh-eyes read is most useful on journeys that leave the changed pages. Its biggest finding was `/programs`.

## Git evidence

*[Embedded below after the final commit.]*
