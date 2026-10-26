# Robux post: requirements (Build Loop, 2026-10-26)

Source: knowledge-base/system/loops/handoffs/2026-10-24-ship-robux-and-session-end-posts.md, Run 1.
Branch `blog/should-i-buy-my-kid-robux` off origin/main 9c0125a. Local build served at http://localhost:3311.

## Post
- R1 Copy: rendered body text matches the copy of record (EKUZO/Marketing/content-drafts/2026-10-24-robux-post-copy-of-record.md, header comment stripped) word for word, plus the two approved tables. No other words added.
- R2 H1 "She asked for Robux to learn about money. Her dad said yes."; title tag "Should I buy my kid Robux? One dad’s $20 experiment"; meta description = approved option A (157 chars).
- R3 Byline Karlin Oei; visible Published and Updated dates 2026-10-26.
- R4 Hero 1916x809 (2.37:1, the 1232x520 ratio), real photo, game text blurred, alt text per handoff. Share card 1200x630 = og:image and twitter:image.
- R5 In-post graphic after the dad's second quote, alt text from the copy of record.
- R6 Two real HTML tables with captions in "What her $20 actually buys", after the first paragraph; prices re-read on roblox.com 2026-10-26.
- R7 FAQPage schema from the five visible FAQ items (same text); BlogPosting with author Karlin (Person @id) ; BreadcrumbList; canonical /blog/should-i-buy-my-kid-robux.
- R8 Links: first "Roblox" goes to Roblox's Parental Controls Overview; three outbound internal links (Fortnite post, what-your-kids-gaming, /parents); 13 sources, each a working link; Keep Reading cards (3) go to live posts.
- R9 No em dashes, en dashes or spaced hyphens in new prose (post body, llms.txt entry, inbound sentences).
- R10 Child never named; no house-identifying detail in the images.

## Site
- R11 /blog: the post is first and featured; gaming-study post no longer featured; "recent" dropped from the gaming-study opening.
- R12 Sitemap: post entry with lastmod 2026-10-26; lastmod 2026-10-26 for the four posts that gained an inbound link, /parents, and the three author pages that changed.
- R13 llms.txt entry in plain sentences; the blog index line no longer has an em dash.
- R14 robots.txt allows the post and /_next/.
- R15 Five inbound links exactly as Jamie approved: gaming-programs-for-kids, should-you-ban-fortnite, what-your-kids-gaming-is-telling-you, when-your-sons-only-friends-are-online, /parents FAQ "How do you keep online spaces safe?" related link. Each of the four posts shows Updated 2026-10-26.
- R16 Karlin's author page lists the post first.

## Quality gates
- R17 tsc and next build clean; eslint shows no new problems.
- R18 Browser-truth: the post and every changed page load with no console errors from our pages (known env-only 404 for the torn-paper image under a path with spaces is pre-existing and returns 200 on production).
- R19 Fail-closed analytics: all browser QA behind the guard (dead proxy plus route interception); no request reaches GA4, Clarity or Meta.
- R20 Screenshots at 375, 768 and 1440.
- R21 Journeys: arrive at the post directly (search landing), from /blog, and from each of the five inbound links; follow each outbound link to a 200 page whose content matches the anchor.
- R22 Must-not: no page outside the listed files changed; the session-end post's backlog row and handoff column untouched.
