# Atlas results 3

## tsc
```
tsc exit 0
```
## build tail
```


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

build exit 0
 40M	.next/server
```
## grep step 5
```
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:14:const SLUG = "summer-camps-for-kids-who-game-2026";
next.config.mjs:60:      // app/blog/summer-camps-for-kids-who-game-2026 untouched; it is also
next.config.mjs:64:        source: "/blog/summer-camps-for-kids-who-game-2026",
```
## grep step 7 (ekuzo100|EKUZO100|ekuzo-camps in app/blog)
```
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:389:                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link>,{" "}
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:482:                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link>) coach in
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:558:                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link> is built
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:637:                <Link href="/programs/ekuzo-camps">camps schedule</Link>.
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:646:                <Link href="/programs/ekuzo-camps">camps page</Link> has the
```
## Published label grep
```
app/blog/gaming-military-families/page.tsx:243:    datePublished: DATE_PUBLISHED,
app/blog/what-homeschool-parents-taught-us-about-gaming/page.tsx:66:    datePublished: DATE_PUBLISHED,
app/blog/when-gaming-helps-homeschool-kids/page.tsx:75:    datePublished: DATE_PUBLISHED,
app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx:217:    datePublished: DATE_PUBLISHED,
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:65:    datePublished: DATE_PUBLISHED,
app/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng/page.tsx:61:    datePublished: DATE_PUBLISHED,
app/blog/when-your-sons-only-friends-are-online/page.tsx:167:    datePublished: DATE_PUBLISHED,
app/blog/what-your-kids-gaming-is-telling-you/page.tsx:218:    datePublished: DATE_PUBLISHED,
app/blog/should-you-ban-fortnite/page.tsx:251:    datePublished: DATE_PUBLISHED,
app/blog/league-of-legends-youth-development/page.tsx:105:    datePublished: DATE_PUBLISHED,
app/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx:61:    datePublished: DATE_PUBLISHED,
(exit 0)
```
## BlogPostBody callers pass both dates
```
app/blog/gaming-military-families/page.tsx:341:          <BlogPostBody author="muhammad-hossain" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/what-homeschool-parents-taught-us-about-gaming/page.tsx:151:          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/when-gaming-helps-homeschool-kids/page.tsx:171:          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx:322:          <BlogPostBody
app/blog/league-of-legends-youth-development/page.tsx:200:          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx:138:          <BlogPostBody author="john-hay" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/what-your-kids-gaming-is-telling-you/page.tsx:322:          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/summer-camps-for-kids-who-game-2026/page.tsx:145:          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng/page.tsx:138:          <BlogPostBody author="lisa-holt" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/when-your-sons-only-friends-are-online/page.tsx:258:          <BlogPostBody author="jamie-fitch" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
app/blog/should-you-ban-fortnite/page.tsx:345:          <BlogPostBody author="muhammad-hossain" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>
```
## dash check on added lines
```
(grep exit 1)
```
## git log (after last commit)
```
aed55ec docs(blog-refresh): Atlas evidence 3
2a10d5c fix(blog): repoint League 65% STEM link to the source that contains the figure
97201ab feat(blog): inactivate the summer camps post until 2027-02-28
3ce886b content(blog): when-your-sons program line per approved copy 8
15a24e1 content(blog): John Hay post updated per approved copy 7 (changes 1-7)
51cf4d1 content(blog): Lisa Holt post editor's note, closing line, metadata per approved copy 6
5e21a27 content(blog): what-your-kids updated per approved copy 5 (changes 1-7)
c03c4e6 docs(blog-refresh): Atlas evidence 2
a545546 feat(links): FAQ related-reading lines, page-to-post links, card swaps per approved copy 3
135f529 content(blog): League post updated per approved copy 4 (changes 1-11, 13)
```
## git status --porcelain
```
 M docs/blog-refresh-2026-10/evidence/atlas/results-3.md
?? docs/blog-refresh-2026-10/00-scout-map.md
?? docs/blog-refresh-2026-10/01-requirements.md
?? docs/blog-refresh-2026-10/02-frozen-spec.md
?? docs/blog-refresh-2026-10/03-decision-log.md
?? docs/blog-refresh-2026-10/copy/
?? docs/blog-refresh-2026-10/evidence/camps-guide-research.md
?? docs/blog-refresh-2026-10/evidence/leaguepedia-faith.md
?? docs/blog-refresh-2026-10/evidence/steward/
```
## protected-path diff vs origin/main
```
 app/blog/summer-camps-for-kids-who-game-2026/page.tsx | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
(empty above = pass)
```

NOTE: the protected-path diff is NOT empty. One line in app/blog/summer-camps-for-kids-who-game-2026/page.tsx differs from origin/main: the BlogPostBody props changed from `date={DATE_MODIFIED} dateLabel="Updated"` to `published={DATE_PUBLISHED} modified={DATE_MODIFIED}`. This came from the earlier commit 3626a28 ("byline shows Published and Updated dates"), which changed BlogPostBody's prop API; the file would not type-check without it. Nothing in this task (steps 1 to 7) touched that file. Needs Fable/Jamie ruling: keep (the page file must compile, and it stays inert behind the redirect) or restore and accept a broken file.
