# Atlas results

## tsc --noEmit (tail)
```
exit: 
```
## npm run build (tail)
Needed a placeholder env var: no .env.local in the worktree and Stripe modules throw at import without STRIPE_SECRET_KEY, so the first build failed at 'Collecting page data' (Neither apiKey nor config.authenticator provided). Re-ran with STRIPE_SECRET_KEY=sk_test_placeholder on the command line only (no file written). Result: PASS, exit 0.
```
├ ○ /sitemap.xml
├ ƒ /squad/[token]
├ ○ /swamp
├ ○ /teams
├ ○ /terms-of-service
└ ○ /woodward


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

```
```
 40M	.next/server
```
## Rendered byline (prerendered .next/server/app/blog/*.html, React comments stripped)
```
should-you-ban-fortnite: Published July 28, 2026|Updated July 31, 2026|
gaming-military-families: Published July 25, 2026|Updated July 31, 2026|
when-your-sons-only-friends-are-online: Published May 28, 2026|Updated October 12, 2026|
summer-camps-for-kids-who-game-2026: Published May 14, 2026|
gaming-study-13-7-years-younger-what-it-means-for-kids: Published October 12, 2026|
conquering-my-mountain-and-giants-how-esports-changed-my-life: Published January 14, 2026|
our-family-s-esports-journey-with-ekuzo-and-the-k1ng: Published January 14, 2026|
when-gaming-helps-homeschool-kids: Published May 21, 2026|
what-homeschool-parents-taught-us-about-gaming: Published May 21, 2026|
what-your-kids-gaming-is-telling-you: Published May 24, 2026|
league-of-legends-youth-development: Published May 16, 2026|
```
## Guest author JSON-LD (rendered)
```
conquering-my-mountain-and-giants-how-esports-changed-my-life.html:"author":{"@id":"https://ekuzo.gg/#person-john-hay"}
conquering-my-mountain-and-giants-how-esports-changed-my-life.html:{"@type":"Person","@id":"https://ekuzo.gg/#person-john-hay","name":"John Hay"}
our-family-s-esports-journey-with-ekuzo-and-the-k1ng.html:"author":{"@id":"https://ekuzo.gg/#person-lisa-holt"}
our-family-s-esports-journey-with-ekuzo-and-the-k1ng.html:{"@type":"Person","@id":"https://ekuzo.gg/#person-lisa-holt","name":"Lisa Holt"}
```
## git log --oneline -5
```
fb882e0 feat(authors): Jamie Fitch is an advisor to EKUZO; author page copy from the approved file
f82c49c feat(schema): canonical Person nodes for guest authors John Hay and Lisa Holt
e2ce823 feat(blog): list the gaming-study post on Karlin's author page
3626a28 feat(blog): byline shows Published and Updated dates
3144459 docs: point the weekly Search Console triage at the KB playbook cadence
```
## git status --porcelain
```
?? docs/blog-refresh-2026-10/
```
## grep -rn CEO app components lib public/llms.txt (truncated to 150 cols)
```
app/blog/league-of-legends-youth-development/page.tsx:51:      "Communication under pressure, decision-making with incomplete information, recovering 
app/blog/league-of-legends-youth-development/page.tsx:705:                , the Nobel-winning CEO of Google DeepMind, credits chess
app/season1/landing.html:843:const IMG = {"boys-girls-club": "data:image/webp;base64,UklGRqwcAQBXRUJQVlA4IKAcAQDQQwWdASpMBDkDPqVMoEymJC2tpfRq+bAUiWU6N
```
Hits: league-of-legends page.tsx:51 and :705 = Demis Hassabis, CEO of Google DeepMind (not Jamie, left). app/season1/landing.html matches are random base64 (e.g. "...CEO..." inside an image data string), not text; not touched.

## Bio byte-for-byte check (lib/authors.ts vs source file)
```
paragraphs source/got: 3 3
1 identical
2 identical
3 identical
authors.ts description == short bio: True
schema.ts description == short bio: True
role/alt: True True
```
