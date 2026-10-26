# Defect log (Sentry)

## D2 major, code-bug: Source URLs clipped at 375px
Repro: open /blog/should-i-buy-my-kid-robux at 375 wide, scroll to Sources. Five long URL links (about.roblox.com newsroom x2, roblox.com/games/..., techcrunch, ksl, fortune) extend to x=377..451 and are cut off by the article's overflow-hidden; the end of the URL is unreadable. document.scrollWidth stays 375, so a scrollWidth-only check passes. Fix: break-words / overflow-wrap:anywhere on .blog-content li a (or show anchor text instead of raw URL). Evidence: clip.txt, shots/sources-375.png.

## D1 minor, code-bug (or requirement-wording gap): no visible Published date
Repro: open the post. Rail shows "Updated October 26, 2026" only. Published (2026-10-26) exists only in meta/JSON-LD. Same on every blog post (shared template, e.g. should-you-ban-fortnite), so likely accepted; R3 says "visible Published and Updated". Decide or reword R3.

## D3 minor, infra-gap: testimonial poster 404s on changed pages
Repro: load /parents (8x) and /blog/when-your-sons-only-friends-are-online (1x): 404 http://localhost:3311/testimonial-videos/*-poster.jpg (e.g. becky-parent-poster.jpg). public/testimonial-videos does not exist in the checkout (large media is gitignored). Pre-existing, not caused by this branch; confirm 200 on production.

## D4 minor, accepted-risk: two external sources unverifiable from here
en.help.roblox.com Parental Controls Overview (also the first "Roblox" link) and Monthly Spending Limits FAQ return 403 to curl (bot block, normal for that host). Needs a real-browser check outside the guard or a manual click.

## Notes (not defects)
- Known env 404 for torn-paper-red-top-2@2x.png seen on the post and other pages, ignored per brief.
- lib.mjs stubs external requests with 204 rather than aborting; nothing leaves the machine. GA4, Clarity, Meta and two Instagram embeds were attempted and stubbed.
- gaming-study post copy changed ("recent" dropped) but its Updated date and sitemap lastmod stay 2026-10-12; not required by R12, flagging in case wanted.
- R22 (no other files changed) not tested: /home/claude/robux is not a git repo.

## Status after repair cycle 1
- D2: FIXED, verified at 375 (no clipped links; clip-retest.txt, shots/sources-375-retest.png).
- D4: CLOSED, verified by PM in a real browser.
- D1: ACCEPTED (template-wide). D3: ACCEPTED infra-gap.
- llms.txt reworded entry: no dashes. R1 unchanged.
