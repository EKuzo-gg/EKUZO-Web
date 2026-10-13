# Atlas results 4

## tsc (tail)
```
(exit )
```

## build (tail)
```
├ ○ /swamp
├ ○ /teams
├ ○ /terms-of-service
└ ○ /woodward


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

```
6

## .next/server size
 40M	.next/server

## git log --oneline -8 (before this evidence commit)
d54bf03 fix(blog): keep the space after inline links in the guide
c9a721c fix(blog): League bold lead-in spacing, byline mobile separators, homeschool reel caption dash
a69ba2d feat(blog): Karlin's author page shows Karlin "Faith" Oei, bio sentence, Leaguepedia sameAs
4c1d3dd feat(blog): wire the guide under its new slug
05377d7 content(blog): gaming programs guide at /blog/gaming-programs-for-kids (copy 9)
62af078 content(blog): index card excerpts for the two guest posts match their approved meta descriptions; Build Loop artifacts
0bca5c4 docs(blog-refresh): Atlas evidence 3, protected-path note
de3c07b docs(blog-refresh): Atlas evidence 3, final state

## protected-path diff stat vs origin/main for this run's commits (c: 62af078..HEAD)
```
(end, empty = zero diff)
```

## dash/arrow grep on added lines vs origin/main
```
1066:+- [When your son's only friends are online](https://ekuzo.gg/blog/when-your-sons-only-friends-are-online): Jamie Fitch's (EKUZO advisor and parent) perspective piece on whether a son's online gaming friends are real, and whether gaming is isolating or co
1067:+- [Should homeschool kids play video games? 200+ parents weigh in](https://ekuzo.gg/blog/what-homeschool-parents-taught-us-about-gaming): A case-study reading of a 200+ parent homeschool thread on kids and gaming. Sorts the responses into three camps —
```

## grep old slug
```
next.config.mjs:59:        source: "/blog/summer-camps-for-kids-who-game-2026",
```

## Prerendered HTML checks: /blog/gaming-programs-for-kids
- H1: ['Gaming programs for kids: a parent&#x27;s guide, Fall 2026']
- table: 1 header row + 6 body rows (7 rows total)
- coach sentence present: True
- space after every inline link/strong (regex </a>[A-Za-z], </strong>[A-Za-z]) hits: 0 across all 11 blog HTML files
- 'camp' in article text (all occurrences):
  - ' like a class.    CreatorCamp   runs instructor-led on'
  - 'g together.    Connected Camps   runs weekly 90-minute'
  - "b for ages 11 to 15. Its camps page says it isn't offe"
  - 'five listings)    CreatorCamp online workshops  $20 a '
- 'camp' outside article (site chrome only): Nav and footer links 'EKUZO Camps' / 'Seasonal week-long camps' / 'SUMMER', and the sitewide rootGraph JSON-LD WebPage 'EKUZO Camps'; none from page content
- images/media in article + keep-reading:
  - EKUZO | /images/ekuzo-logo-black.svg
  -  | %2Fimages%2Fblog-slug-right-deco.png&w=828&q=75
  - Gaming programs for kids: a parent&#x27;s guide, Fall 2026 | %2Fimages%2Fblog-post-3-hero.jpg&w=3840&q=75
  - Karlin Oei | %2Fimages%2Fauthors%2Fkarlin-oei-avatar.jpg&w=3840&q=75
  - Our Family&#x27;s Esports Journey with EKUZO and the K1ng | %2Fimages%2Fblog-post-1-card.jpg&w=3840&q=75
  -  | %2Fimages%2Fenroll-promo-graphic.avif&w=1920&q=75
- iframes: 0 video: 0

## /blog/author/karlin-oei
- H1: ['Karlin “Faith” Oei']
- bio sentence present: True
- leaguepedia in sameAs: True
- description em dash gone: True

## League post
- bold lead-in spacing: ['Strategic depth.</strong> League ', 'Approachable mechanics.</strong> <!-- --', 'Stable roles and systems.</strong> Five cl', 'Cultural durability.</strong> <!-- --']
- closing link present: True

## Notes on the dash grep
Both hits are in public/llms.txt, on the pre-existing When-your-sons and homeschool-review lines, which an earlier commit on this branch edited (defect D-6). Neither line was written in this run; my new llms.txt line has no dashes. Zero hits in app, components, lib from this run's commits (62af078..HEAD grep: empty).

## Protected paths vs origin/main (full branch)
```
(end)
```

## Table
The cost table has 1 header row and 6 body rows (7 <tr>), exactly the copy's table.

## Not verified
AuthorByline mobile separator change (clip technique) is compiled but NOT visually checked at 375px; no dev server was started per instructions.
## git log --oneline -8 and status after last commit
b7b4465 docs(blog-refresh): Atlas evidence 4
d54bf03 fix(blog): keep the space after inline links in the guide
c9a721c fix(blog): League bold lead-in spacing, byline mobile separators, homeschool reel caption dash
a69ba2d feat(blog): Karlin's author page shows Karlin "Faith" Oei, bio sentence, Leaguepedia sameAs
4c1d3dd feat(blog): wire the guide under its new slug
05377d7 content(blog): gaming programs guide at /blog/gaming-programs-for-kids (copy 9)
62af078 content(blog): index card excerpts for the two guest posts match their approved meta descriptions; Build Loop artifacts
0bca5c4 docs(blog-refresh): Atlas evidence 3, protected-path note
 M docs/blog-refresh-2026-10/02-frozen-spec.md
 M docs/blog-refresh-2026-10/03-decision-log.md
 M docs/blog-refresh-2026-10/copy/09-camps-guide.md
 M docs/blog-refresh-2026-10/evidence/atlas/results-4.md
 M docs/blog-refresh-2026-10/evidence/steward/09-camps-guide.md
?? docs/blog-refresh-2026-10/05-defect-log.md
?? docs/blog-refresh-2026-10/evidence/sentry/
?? docs/blog-refresh-2026-10/screenshots/
