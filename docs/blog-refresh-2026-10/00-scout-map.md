# Blog refresh 2026-10: Scout map

Read-only discovery. Worktree `/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/blog-refresh-2026-10`, branch `build/blog-refresh-2026-10`, HEAD 3144459 (= origin/main at time of scouting). Today per environment: 2026-10-12.
All paths relative to the worktree. `[INFERRED]` marks anything not read directly.

Correction to the brief: there are **11** post pages, not 12. `app/blog/[slug]/page.tsx` is a 27-line `notFound()` shim (`app/blog/[slug]/page.tsx:25-26`: `export default function BlogPost() { ... notFound(); }`), not a post.

---

## 1. Dates table

How each date is wired:
- Every post declares `const DATE_PUBLISHED` / `const DATE_MODIFIED` at top (ISO `YYYY-MM-DD`), passes both to `buildBlogArticleSchema` (`lib/schema.ts:451-483`), and passes one of them to `<BlogPostBody date=... dateLabel=...>` -> `AuthorByline` (`components/blog/BlogPostBody.tsx:30-35`; `AuthorByline.tsx:41-46`: `dateLabel = "Published"` default).
- Schema: `toSchemaDateTime` (`lib/schema.ts:436-438`) expands to `${d}T12:00:00+00:00`; `dateModified: toSchemaDateTime(dateModified ?? datePublished)` (`lib/schema.ts:476`).
- Sitemap dates are **hand-maintained literals**, not derived from post constants. `app/sitemap.ts:6-10`: "lastModified is a real date, never new Date() ... Dates set 2026-10-12 from the last commit to each route's page file (author pages: lib/authors.ts). When you change a page's content, update its date here in the same commit."
- Sitemap `/blog` entry: floor literal `2026-10-11` (`app/sitemap.ts:102`), then raised at runtime to the max of all post-entry dates (`app/sitemap.ts:211-222`, `blogIndex.lastModified = new Date(Math.max(floor, ...postDates))`). Author pages are excluded from that max.
- Index card dates are hand-typed display strings in the `posts` array in `app/blog/page.tsx` (no machine date; no modified date shown). Author pages carry a second copy of the display strings (`app/blog/author/*/page.tsx`).

| Post (slug) | Author slug | Byline `date` arg (page.tsx line) | dateLabel | Schema datePublished / dateModified (const line) | Sitemap lastModified (app/sitemap.ts line) | /blog index card (app/blog/page.tsx line) |
|---|---|---|---|---|---|---|
| conquering-my-mountain-and-giants-how-esports-changed-my-life | john-hay (guest) | `DATE_PUBLISHED` = 2026-01-14 (`:136`) | default Published | 2026-01-14 / 2026-01-14 (`:19-20`) | **2026-07-28** (`:108`) | "Jan 14, 2026" (`:96`) |
| our-family-s-esports-journey-with-ekuzo-and-the-k1ng | lisa-holt (guest) | `DATE_PUBLISHED` = 2026-01-14 (`:136`) | default Published | 2026-01-14 / 2026-01-14 (`:19-20`) | **2026-07-28** (`:114`) | "Jan 14, 2026" (`:85`) |
| summer-camps-for-kids-who-game-2026 | karlin-oei | `DATE_MODIFIED` = 2026-05-14 (`:145`) | `"Updated"` | 2026-05-14 / 2026-05-14 (`:25-26`) | 2026-05-14 (`:120`) | "May 14, 2026" (`:108`) |
| league-of-legends-youth-development | karlin-oei | `DATE_PUBLISHED` = 2026-05-16 (`:199`) | default Published | 2026-05-16 / 2026-05-16 (`:25-26`) | 2026-05-16 (`:126`) | "May 16, 2026" (`:119`) |
| when-gaming-helps-homeschool-kids | karlin-oei | `DATE_PUBLISHED` = 2026-05-21 (`:170`) | default Published | 2026-05-21 / 2026-05-21 (`:27-28`) | 2026-05-21 (`:132`) | "May 21, 2026" (`:130`) |
| what-homeschool-parents-taught-us-about-gaming | karlin-oei | `DATE_PUBLISHED` = 2026-05-21 (`:151`) | default Published | 2026-05-21 / 2026-05-21 (`:26-27`) | 2026-05-21 (`:138`) | "May 21, 2026" (`:141`) |
| what-your-kids-gaming-is-telling-you | karlin-oei | `DATE_PUBLISHED` = 2026-05-24 (`:321`) | default Published | 2026-05-24 / 2026-05-24 (`:28-29`) | 2026-05-24 (`:144`) | "May 24, 2026" (`:32`) |
| when-your-sons-only-friends-are-online | jamie-fitch | `DATE_PUBLISHED` = 2026-05-28 (`:257`) | default Published | 2026-05-28 / **2026-10-12** (`:33-34`) | 2026-10-12 (`:150`) | "May 28, 2026" (`:74`) |
| gaming-military-families | muhammad-hossain | `DATE_PUBLISHED` = 2026-07-25 (`:339`) | default Published | 2026-07-25 / **2026-07-31** (`:101-102`) | 2026-07-31 (`:165`) | "July 25, 2026" (`:63`) |
| should-you-ban-fortnite | muhammad-hossain | `DATE_PUBLISHED` = 2026-07-28 (`:344`) | default Published | 2026-07-28 / **2026-07-31** (`:127-128`) | 2026-07-31 (`:159`) | "July 28, 2026" (`:52`) |
| gaming-study-13-7-years-younger-what-it-means-for-kids | karlin-oei | `DATE_MODIFIED` = 2026-10-12 (`:324`) | `"Updated"` (`:325`) | 2026-10-12 / 2026-10-12 (`:48-49`) | 2026-10-12 (`:171`) | "October 12, 2026" (`:20`), `featured: true` |

Author-page sitemap entries: karlin-oei, jamie-fitch, muhammad-hossain all `2026-07-31` (`app/sitemap.ts:179,185,191`). Blog index sitemap resolves to 2026-10-12 (max of post dates).

Article-schema `author` arg per post (default when omitted is `{ "@id": KARLIN_ID }`, `lib/schema.ts:477`):
- conquering `:62` `author: { "@type": "Person", name: "John Hay" }`
- our-family `:62` `author: { "@type": "Person", name: "Lisa Holt" }`
- gaming-military `:246` `author: { "@id": MUHAMMAD_ID }`; should-you-ban `:255` `author: { "@id": MUHAMMAD_ID }`
- sons `:169` `author: { "@id": JAMIE_ID }`
- summer-camps, league, when-gaming-helps, what-homeschool, what-your-kids, gaming-study: no author arg (default KARLIN_ID).

### Disagreements flagged
1. conquering + our-family: sitemap 2026-07-28 vs schema dateModified/datePublished 2026-01-14 vs byline/index Jan 14. 07-28 is the byline-refactor commit date per `AuthorByline.tsx:3-4` ("Added 2026-07-28. Replaces a block that had been hand-copied..."), not a content date. [INFERRED link between the two 07-28s.]
2. sons: `DATE_MODIFIED` 2026-10-12 and sitemap 2026-10-12, but byline shows "Published May 28, 2026" and index card shows "May 28, 2026". No "Updated" shown anywhere on page.
3. gaming-military + should-you-ban: modified 2026-07-31 (schema, sitemap), byline and index show published dates only.
4. summer-camps + gaming-study: byline passes `DATE_MODIFIED` with label "Updated", but modified == published in both, so the "Updated" label is applied to an unchanged date. Index card shows no label.
5. Karlin author page (`app/blog/author/karlin-oei/page.tsx`) POSTS lists 5 slugs (what-your-kids `:10`, what-homeschool `:19`, when-gaming-helps `:28`, league `:37`, summer-camps `:46`); it does **not** list `gaming-study-13-7-years-younger-what-it-means-for-kids` although that post's byline is karlin-oei. Author-page sitemap lastModified (07-31) predates the gaming-study post (10-12).
6. Jamie author page lists one post (`when-your-sons-only-friends-are-online`, "May 28, 2026"; `app/blog/author/jamie-fitch/page.tsx:9-16`), consistent with the index.
7. Three places hold the same display date strings by hand: `app/blog/page.tsx` posts array, `app/blog/author/*/page.tsx` POSTS arrays, and each post's constants.
8. Page-content staleness vs dates [INFERRED from today's date]: summer-camps still reads "Camps run weekly from May 18 through August 8, 2026 ... Most weeks still have open slots." (`summer-camps-for-kids-who-game-2026/page.tsx:626-631`) with sitemap/byline at 2026-05-14.

---

## 2. Program mentions

Grep pattern: `ekuzo ?100|ekuzo ?101|ekuzo ?camps?|camps?\b|ekuzo ?teams?|\bteams\b|season 0?1|waitlist|\$[0-9]|/programs` over `app/blog/**`, `components/blog/**`. Result: **no hits for "Season 01", "waitlist", "EKUZOTEAMS", "EKUZO Teams" in any blog post or blog component.** No `/programs/ekuzo-teams` link. Full-text hits below; non-program uses of "camp" (the "three camps" of parents in the homeschool/gaming-study posts), "teams"/"team" (esports teams generally) and `$80,000` / `$520M` are listed only where relevant.

### conquering-my-mountain-and-giants-how-esports-changed-my-life
- `:211-220` (closing italic paragraph, `<p className="italic text-black/60">`): "John's story is one person's experience, not a guarantee. If it resonates and you want a low-stakes way to put your gamer on a coached team, [EKUZO100] is a one-month trial for $100 — or read [when your son's only friends are online] for the bigger picture." href `/programs/ekuzo100` (`:214`), `/blog/when-your-sons-only-friends-are-online` (`:216`).
- `:268` `<FooterBanner heading="Enroll into a transformational program today" />`
- No author-bio block (guest author).

### our-family-s-esports-journey-with-ekuzo-and-the-k1ng
- `:247-255`: "Ryan's story is one family's experience, not a guarantee. For the bigger picture behind it, read [when your son's only friends are online]. And if you want a low-stakes way to try a coached team, [EKUZO100] is a one-month trial for $100." href `/blog/when-your-sons-only-friends-are-online` (`:250`), `/programs/ekuzo100` (`:254`).
- `:199`, `:205`: "teams" in testimonial quote (esports teams generally, not product).
- `:303` FooterBanner heading="Enroll into a transformational program today". No bio block (guest).

### summer-camps-for-kids-who-game-2026 (77 grep hits; product-relevant ones)
- Program links, all href `/programs/ekuzo-camps`, anchor text: `:389` "EKUZO Camps" (in "Representative camps include [EKUZO Camps], [NXT UP...]"), `:482` "EKUZO Camps" ("most structured esports programs (including [EKUZO Camps]) coach in League of Legends"), `:558` "EKUZO Camps" ("That's exactly the kid [EKUZO Camps] is built for, because what we teach in League shows up in whatever they're playing the rest of the week."), `:637` "camps schedule", `:646` "camps page".
- Price: `:414-416` "EKUZO runs a virtual half-day at a 1:5 coach-to-player ratio for $199 per week, which works out to roughly $13 per hour of dedicated top-1% coaching."
- Table: `:470-471` `<td>Structured esports camps</td> <td>$199–$1,900</td>`.
- `:572` H2 "What does a week at EKUZO Camp actually look like?"; `:574` "EKUZO Camps are built for the kid who loves games more deeply than the people around them realize."
- `:622-632`: "Camp is the thing I wish someone had built for me. Camps run weekly from **May 18 through August 8, 2026**. Sign up solo and we'll match your kid into a squad. Sign up with friends and you can stay together. Weeks are $199 (limited-time pricing, original price $299). Most weeks still have open slots."
- `:634-640`: "How do I sign up before the next week starts? Three steps. Pick a week from the [camps schedule]. Decide if your kid wants to sign up solo (we'll match them) or with friends (they stay together). Register. You'll get a welcome email ..."
- `:644-649`: "If you have questions about whether your kid is a fit, the [camps page] has the format details, common parent questions, and a way to talk to the team."
- Title (`:15-16`, also in llms.txt, blog index, Karlin author page): "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)".
- `:709` `<FooterBanner heading="Enroll into a transformational program today" />`. `:661` closing "— Karlin, founder of EKUZO" (blockquote signoff, `:660`; not the bio variant below).
- Competitor camps (Code Ninjas, CreatorCamp, Connected Camps, UT Austin/Dallas/Arlington, Ohio State, NXT UP, IMG) are external hrefs, not listed.

### league-of-legends-youth-development
- `:623-629`: "If you want to see what this looks like in practice, [our camps] are running all summer. We wrote [a longer guide on that] too." href `/programs/ekuzo-camps` (`:625`), `/blog/summer-camps-for-kids-who-game-2026` (`:627`).
- `:573` "Our players are on stable teams with the same teammates week ..." (no link).
- `:763-785` Keep-reading card -> `/blog/summer-camps-for-kids-who-game-2026`, alt/title "Virtual summer camps for kids who'd rather be gaming".
- `:792` FooterBanner heading="Enroll into a transformational program today". Bio block `:726-731` (variant A below).

### when-gaming-helps-homeschool-kids
- `:443-453`: "That's [what we built EKUZO to be]: stable rosters, trained coaches, clear goals, moderated spaces, and a conversation after the match. You can build a version of that at your own kitchen table. We're one place that does it, if you want the help. If you'd like to try it without a big commitment, [EKUZO100] is a one-month trial that puts your kid on a coached team for $100." href `/methodology` (`:445`), `/programs/ekuzo100` (`:451`).
- `:405` "$80,000 in esports scholarships" (backstory, see 4c). `:616` FooterBanner heading="Enroll into a transformational program today". Bio block `:562-567` (variant A).

### what-homeschool-parents-taught-us-about-gaming
- `:373-381`: "We [coach kids through games] for a living, so I read this less as a debate and more as a brief." href `/programs/ekuzo-camps` (`:376`).
- ("camp"/"camps" at `:19,21,162,167,213-216,222,225,244,252,256,272,281,284,301,327,335,343,358-360,369,406` are the three parent "camps", not the product.)
- `:463` FooterBanner heading="Enroll into a transformational program today". Bio block `:409-414` (variant A).

### what-your-kids-gaming-is-telling-you
- `:629-646`: H2 "A low-stakes way to test the container" -> "[EKUZO100] is our shortest version of that environment. One month, a small team of 5 players at their level, a coach, and a real practice rhythm. Not because every kid should become an esports athlete. Because some kids need a place where the thing they already care about can become social, coached, and healthier. Think of it as an experiment." href `/programs/ekuzo100` (`:636`). (No price in this post.)
- `:724` FooterBanner heading="Enroll into a transformational program today". No bio block.

### when-your-sons-only-friends-are-online
- `:502-507`: "If you want a low-stakes way to feel the difference between a crowd and a team, [EKUZO100] is a one-month trial to see if it might be valuable to your family." href `/programs/ekuzo100` (`:504`). (No price.)
- FAQ answer `:53` (schema string): "A coached team built around his game is one of the most direct ways to get all three at once." (no link)
- `:622` FooterBanner heading="Enroll into a transformational program today". No bio block.

### gaming-military-families
- `:533-541` (single product link by design; header comment `:77-78` "No FooterBanner on this page by design (non-promotional piece)." / "The one-link rule governs PRODUCT links only: exactly one, to EKUZO 101"): "... she'd basically described my week coaching [EKUZO 101]: same small group, private server, a coach in the voice channel. The money one was even easier: we don't have a sponsor; we're a small, self-funded startup." href `/programs/ekuzo101` (`:536`).
- `:733` `{/* FooterBanner intentionally omitted on this page — see header comment. */}`. No bio block.

### should-you-ban-fortnite
- `:589-594` (header `:36`, `:69-70`, `:160` same one-link rule): "... that lesson is my job: the kids I coach through [EKUZO 101] play on a private, moderated server with the same faces, the same coach, and the same video and voice channel every week." href `/programs/ekuzo101` (`:592`).
- `:416,439` "$520 million" (FTC/Epic fact, not a product price).
- `:776` FooterBanner intentionally omitted. No bio block.

### gaming-study-13-7-years-younger-what-it-means-for-kids
- No `/programs/*` link, no product name, no price. (`:173` "Teams and coaches do this for sports", `:437`,`:461` "camps" = reply groups.)
- `:789` `<FooterBanner heading="Every gamer deserves a team" />` (different heading from the other nine).
- Internal link `:628` "my coaches answer parent questions" -> `/parents`. No bio block.

### Components
- `components/blog/QuoteCards.tsx:3` "homeschool gaming thread, grouped by camp." `:94` "Four voices from one thread, grouped by camp."; `components/blog/ReplyQuoteCards.tsx:27` "Camp label on the right" (all thread-camp meaning, not product).
- `components/blog/AuthorPage.tsx:224` `<FooterBanner heading="Enroll into a transformational program today" />` (author pages; skipped when `footerBanner === false`, `AuthorPage.tsx:219-224`).

### FooterBanner behavior (affects every post that renders it)
`components/sections/FooterBanner.tsx:41-43`:
```
const ctaLabel =
  SEASON_ONE_MODE && ctaModal === "enroll" ? SEASON_ONE_COPY.navCta : ctaLabelProp ?? "Enroll my gamer";
const heading = SEASON_ONE_MODE && ctaModal === "enroll" ? SEASON_ONE_COPY.bannerHead : headingProp;
```
So with Season 01 mode on (default), the per-post `heading` props are ignored on all 9 posts that render FooterBanner; they render "Season 01 starts in 2027. Get them on the list." (`lib/seasonOne.ts` `bannerHead`) with button "Join Season 01". The gaming-study heading "Every gamer deserves a team" is also overridden. `getProgramRegisterContext` returns null in Season 01 mode (`lib/programRoutes.ts:41`), so no direct register link.
Posts WITH FooterBanner (9): conquering, our-family, summer-camps, league, what-homeschool, what-your-kids, when-gaming-helps, sons, gaming-study. Posts WITHOUT (2): gaming-military-families, should-you-ban-fortnite.

### Closing author bio blocks (distinct variants)
Variant A, `<p className="italic">` (3 posts: league `:726-731`, what-homeschool `:409-414`, when-gaming-helps `:562-567`):
> Karlin Oei is the founder of [EKUZO](/). He grew up playing League of Legends, paid for college through esports scholarships, and now builds the coaching system he wishes he'd had as a kid.

Variant B, summer-camps closing signoff (`:660-661`, 1 post): blockquote "If your kid would rather spend the summer gaming, that's a starting point, not a problem to fix. The right camp meets them where they already are and builds the community, the coach, and the challenge around it. That's what every great summer experience does. The medium changes; the shape stays the same." then `<p className="text-right">— Karlin, founder of EKUZO</p>`.

Variant C, Casey disclaimer (not a bio): gaming-military `:650-652` "Casey is a real parent sharing her real story, offered so yours can use it. Her surname, unit, and base do not appear here, by design."; should-you-ban `:684-686` "Casey is a real parent sharing her real story, offered so yours can use it."

No bio block in: conquering, our-family, what-your-kids, sons, gaming-study. (Byline rail + `/blog/author/*` pages carry author facts.)

---

## 3. Internal links

Extracted by script from `<Link>`/`<a>` with href starting `/` or a template. Format: line, href, anchor text.

### conquering-my-mountain...
- 214 `/programs/ekuzo100` EKUZO100
- 216 `/blog/when-your-sons-only-friends-are-online` when your son's only friends are online
- 242 `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng` (Keep Reading card) "Case Studies Our Family's Esports Journey with EKUZO and the K1ng by Lisa Holt"

### our-family-s-esports-journey-with-ekuzo-and-the-k1ng
- 250 `/blog/when-your-sons-only-friends-are-online` when your son's only friends are online
- 254 `/programs/ekuzo100` EKUZO100
- 277 `/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life` (Keep Reading card, "Testimonials ... by John Hay")

### summer-camps-for-kids-who-game-2026
- 389, 482, 558 `/programs/ekuzo-camps` EKUZO Camps; 637 camps schedule; 646 camps page
- 564 `/blog/league-of-legends-youth-development` a longer post on why League of Legends works for youth development
- 681 `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng` (Keep Reading card, "Case Studies ... by Lisa Holt")

### league-of-legends-youth-development
- 240 `/` EKUZO; 727 `/` EKUZO
- 613 `/methodology` methodology page
- 625 `/programs/ekuzo-camps` our camps
- 627 `/blog/summer-camps-for-kids-who-game-2026` a longer guide on that
- 734 `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` the viral "13.7 years younger" gaming study
- 763 `/blog/summer-camps-for-kids-who-game-2026` (Keep Reading card, "Guides Virtual summer camps ...")

### when-gaming-helps-homeschool-kids
- 219 `/blog/what-homeschool-parents-taught-us-about-gaming` a companion piece
- 445 `/methodology` what we built EKUZO to be
- 451 `/programs/ekuzo100` EKUZO100
- 482 `/blog/what-homeschool-parents-taught-us-about-gaming` here
- 563 `/` EKUZO
- 588 `/blog/what-homeschool-parents-taught-us-about-gaming` (Keep Reading card, "Case Studies ... by Karlin Oei")

### what-homeschool-parents-taught-us-about-gaming
- 376 `/programs/ekuzo-camps` coach kids through games
- 397 `/blog/when-gaming-helps-homeschool-kids` here (via `PILLAR_SLUG`, `:16`)
- 402 `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` the viral "13.7 years younger" gaming study
- 410 `/` EKUZO
- 435 `/blog/when-gaming-helps-homeschool-kids` (Keep Reading card, "Guides ... by Karlin Oei")

### what-your-kids-gaming-is-telling-you
- 636 `/programs/ekuzo100` EKUZO100
- 669 `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` the viral "13.7 years younger" gaming study
- 696 `/blog/when-your-sons-only-friends-are-online` (Keep Reading card)

### when-your-sons-only-friends-are-online
- 384 `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` the viral "13.7 years younger" gaming study
- 462 `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng` Ryan's story in his mom's words
- 504 `/programs/ekuzo100` EKUZO100
- 531 `/blog/what-your-kids-gaming-is-telling-you` what your kid's gaming is telling you
- Keep-reading data array `:112-130` (`KEEP_READING`): our-family-s..., what-your-kids-gaming-is-telling-you, league-of-legends-youth-development (rendered via `/blog/${post.slug}`, `:590`)

### gaming-military-families
- 506 `/blog/should-you-ban-fortnite` its own post
- 536 `/programs/ekuzo101` EKUZO 101
- Keep-reading array `:186,195,202`: should-you-ban-fortnite, when-your-sons-only-friends-are-online, what-your-kids-gaming-is-telling-you (rendered `:701`)
- `:630` `LISTENING_CALENDAR` = `https://calendar.app.google/mMJ5KoxcNdH6SR13A` (`:104`; external; "put 20 minutes on my calendar")

### should-you-ban-fortnite
- 592 `/programs/ekuzo101` EKUZO 101
- 713 `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` the viral "13.7 years younger" gaming study
- Keep-reading array `:195,204,211`: gaming-military-families, when-your-sons-only-friends-are-online, what-your-kids-gaming-is-telling-you (rendered `:744`)
- `:664` `LISTENING_CALENDAR` (`:130`, same external calendar URL; "Put 20 minutes on my calendar")

### gaming-study-13-7-years-younger-what-it-means-for-kids
- 393 `/blog/what-your-kids-gaming-is-telling-you` I told the longer version of this on camera
- 619 `/blog/should-you-ban-fortnite` one mom's account of banning it and what came next
- 624 `/blog/league-of-legends-youth-development` here's why I coach League
- 628 `/parents` my coaches answer parent questions
- 562-563 / 661-662 `REANALYSIS_SCRIPT` / `REANALYSIS_OUTPUT` -> `/research/gaming-cognition-reanalysis.py` and `/research/gaming-cognition-reanalysis-output.txt` (`:51-52`; internal static paths, anchor text "The script" / "its output" / "script" / "output")
- Keep-reading array `:115,123,131`: what-homeschool-parents-taught-us-about-gaming, should-you-ban-fortnite, when-your-sons-only-friends-are-online (rendered `:757`)

### All links to `/blog/summer-camps-for-kids-who-game-2026` (app, components, lib, llms.txt, next.config.mjs)
- `app/blog/league-of-legends-youth-development/page.tsx:627` (body, "a longer guide on that")
- `app/blog/league-of-legends-youth-development/page.tsx:764` (Keep Reading card)
- `app/blog/author/karlin-oei/page.tsx:46` (POSTS slug)
- `app/blog/page.tsx:105` (index slug)
- `app/sitemap.ts:119`
- `public/llms.txt:36`
- `app/blog/summer-camps-for-kids-who-game-2026/page.tsx:14` (own SLUG)
- Not in `next.config.mjs`. No links from any non-blog page or component.

### Links from non-blog pages into /blog/* (app/page.tsx, app/parents, app/faq, app/programs, app/games, app/methodology, app/schools, components, lib)
Only one: `app/parents/page.tsx:374` `href="/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng"`.
Other `/blog` references in components are nav/footer/StickyCTA infrastructure: `components/layout/Footer.tsx:75` (`/blog` "Blog"), `components/layout/Nav.optionA.tsx:24` & `Nav.optionB.tsx:24` (`/blog` "Resources"), `components/ui/StickyCTA.tsx:42` (comment), `lib/newsletterAb.ts:141-150` (path test). No links from app/page.tsx, app/faq, app/programs, app/games, app/methodology, app/schools into any post.

### /parents card -> "404 slug": PARTLY REFUTED
- CONFIRMED: `app/parents/page.tsx:374` links to `/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng` (no hyphen between "family" and "s"); the real route dir is `our-family-s-esports-journey-with-ekuzo-and-the-k1ng`.
- REFUTED as a live 404: `next.config.mjs:47-53` now redirects it:
```
      // Second variant Google reports as a 404 (Search Console, 2026-10-12):
      // "familys" without the hyphen-s.
      {
        source: "/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng",
        destination:
          "/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
        permanent: true,
      },
```
(commit 695be47 "fix(seo): redirect the two URLs Search Console reports as 404"). So the parents card resolves through a 308, but the internal link still points at the redirected URL. `app/parents/page.tsx:384` image alt: "Blog feature: Our Family's Esports Journey".

Also relevant: `public/llms.txt:37-38` list the two guest-author posts with `...our-family-s-esports-journey...` slug (correct form).

---

## 4. Shared passages

### (a) Shared between when-gaming-helps-homeschool-kids (A) and what-homeschool-parents-taught-us-about-gaming (B)
Sentence-level exact duplicates: none except the Variant A bio (A `:562-567`, B `:409-414`). The shared material is the same three thread quotes plus near-identical paraphrases:

1. Quote "wouldn't have gotten past his deep depression and anxiety"
   - A `:243-248`: "One mom said her son "wouldn't have gotten past his deep depression and anxiety" without it, and that the game and the people in it taught him to communicate."
   - B `:286-289` (text in `:283-292`): "One mom said her son "wouldn't have gotten past his deep depression and anxiety" without it, and that the game taught him to communicate."
2. Quote "without a solid alternative can lead to serious emotional distress, including depression."
   - A `:268-272`: "he wrote that taking it away "without a solid alternative can lead to serious emotional distress, including depression.""
   - B `:332-336`: "he answered that taking it away "without a solid alternative can lead to serious emotional distress, including depression.""
   - Echo in A `:423`: "The dad I mentioned wanted a "solid alternative" and assumed none existed."
3. Quote "work" / "became work" (goal + structure; six-hour days fall off)
   - A `:246-249`: "Another said that once gaming became "work," meaning it had a goal and a structure, the six-hour days fell off on their own."
   - B `:290-293`: "Another, whose kids now do coding and drone work, said the turning point came when gaming "became work" with a goal attached, and the six-hour days fell off on their own."
4. Near-duplicate list: A `:241-242` "coding classes, game-design courses, esports teams, and streaming with a purpose"; B `:289-290` "coding classes, game-design courses, and homeschool gaming meetups".
5. Near-duplicate thesis: A `:419-421` "Read those 200+ parents closely and you see what the fight is really about: structure, belonging, and what it takes for a kid to grow up."; B `:296-298` "What they're all really arguing about, underneath, is structure, belonging, and what it takes for a kid to grow up."
6. Both cross-link each other (A `:219`, `:482`; B `:397`, `:435`) and both open with the same 200+ parent thread. A's other quotes "six hours a day" (`:361`), "an hour with a point" (`:362`) are A-only; B's "Gaming is an addiction. Cut it off." (`:222`), "It's a modern hobby. Just set limits." (`:252`), "Stop reducing it. Start aiming it." (`:281`), "educational" (`:320`), "13.7 years younger" (`:403`) are B-only.

### (b) The D&D paragraph: 2 posts
- league-of-legends-youth-development `:463-472`:
> If a kid is already drawn to fantasy worlds, League feels familiar before they ever queue a match. The art is anime-influenced. The champions, abilities, lore, and mythology overlap heavily with Dungeons & Dragons, which is having its biggest moment in a generation right now, helped along by school clubs and Stranger Things. A kid who's into anime, cosplay, KPop Demon Hunters, or a D&D group usually steps into League easily. The aesthetic vocabulary is already theirs.
- summer-camps-for-kids-who-game-2026 `:498-508`:
> For kids already drawn to fantasy worlds, League feels familiar. The art is anime-influenced. The champions, abilities, lore, and mythology have a lot in common with Dungeons & Dragons, which is having its biggest moment in a generation right now, helped by school clubs and Stranger Things. A kid who's open to either of those aesthetics usually finds League easy to step into. The audience is growing too: college esports programs, scholarship dollars, and Twitch viewership are all up year over year.
No D&D in any other post or component.

### (c) Karlin's backstory passages
- gaming-study `:369-392` (first person, "I"):
> I was an introvert with social anxiety bad enough that my mom ordered for me at restaurants. If a stranger talked to me in person, I froze. I was not a good student either. Not because I couldn't do the work; I didn't care about it. My mom tried everything to break me out of it: tennis, piano, orchestra. Nothing took. (`:370-376`)
> In college I made the UT Dallas team and started playing tournaments. A few weeks in, my mom caught me not playing and asked why I wasn't practicing. Like it was the piano. First time an adult treated the game as something you could be good at on purpose. I practiced. Competing paid for a big chunk of college, more than $80,000 in scholarships. That's not the plan for your kid; the scholarships were the receipt. The practicing was the point, and she was right. (`:385-393`, ending with link "I told the longer version of this on camera" -> `/blog/what-your-kids-gaming-is-telling-you`)
- what-your-kids-gaming-is-telling-you `:590-609`:
> I'll be straight about where this comes from. I wasn't the parent in this story. I was the kid. / I grew up gaming through social anxiety, low self-esteem, and a complicated relationship with divorced parents. School felt like being made to care about things I didn't, when all I wanted to do was play. My best memories as a kid are playing games with friends. / Nobody around me knew what to do with that. 12-year-old me had no idea what it meant to be on a team, with structure, routine, and intentionality. Even at 18 I was only starting to see that gaming had taught me ownership, accountability, and how to lead. I stumbled into competitive esports in college, it covered more than $80,000 of my education, and my relationship with my mom has never been better. For me, the game wasn't the problem. The missing piece was a container, and I didn't get one until late.
  Also `:177` (REEL_TRANSCRIPT, schema string): "... Growing up, I struggled immensely with social anxiety, low self-esteem, school, and I had a really poor relationship with my parents. ... So in college, I stumbled my way into esports, basically competitive video games, and won over $80,000 in esports scholarships. My relationship with my mom has never been better. ..." and `:232` (video description): "EKUZO founder Karlin Oei on growing up with social anxiety and low self-esteem, finding competitive esports in college that paid over $80,000 in scholarships, and starting EKUZO to give kids the team and structure he didn't have."
- when-gaming-helps-homeschool-kids `:382-413`:
> I'm not making the structure argument from theory. I'm the kid it happened to. / School nearly lost me. I barely graduated, my grades were bad, and I was the definition of unmotivated. The one odd data point was a standardized test I landed in the top 1% on, which told everyone I was capable and made the rest of it more confusing. I got into college, but almost failed out. / Then I found a League of Legends team, and that's what turned it around. For the first time, effort had a point and other people depended on it. ... That team paid for my college too: $80,000 in esports scholarships, the same way another kid earns one for football or track. ... (`:396-407`) / I wasn't homeschooled. But I'm exactly the kind of capable kid a one-size system loses, ... The game opened the door. The team, the standard, and the people around it are what actually changed me. (`:408-414`)
- Bio variant A (league `:726-731`, what-homeschool `:409-414`, when-gaming-helps `:562-567`): "He grew up playing League of Legends, paid for college through esports scholarships, and now builds the coaching system he wishes he'd had as a kid."
- Author registry bio `lib/authors.ts:107` (rendered on `/blog/author/karlin-oei`): "Karlin grew up gaming through social anxiety, low self-esteem, and a complicated home, and school rarely reached him ... He only started to see what gaming had taught him ... at 18, and stumbled into competitive League of Legends in college, where he became a national collegiate captain and earned $80,000+ in esports scholarships."
- Schema `lib/schema.ts:34-35`: "Former national collegiate esports captain who earned $80,000+ in scholarships".
- "scholarships" otherwise: what-homeschool `:296` (parents' vocabulary), summer-camps `:507` (market growth), league `:729` (bio). Not found: "$80,000" in summer-camps, league body, what-homeschool; "social anxiety" in league/summer-camps/military/fortnite/sons.
- Internal inconsistency in the backstory facts [read, not judged]: gaming-study says "UT Dallas team"/"started playing tournaments" in college; wykg says "stumbled into competitive esports in college"; wgh says "found a League of Legends team"; wykg `:177` reel says "won over $80,000"; wykg `:608` "it covered more than $80,000 of my education"; wgh `:405` "$80,000 in esports scholarships"; studies say "more than $80,000". "national collegiate captain" appears only in lib/authors.ts and lib/schema.ts, not in any post body.

### (d) league-of-legends-youth-development lines vs app/games/page.tsx
- "The floor is low. The ceiling is high.": `league-of-legends-youth-development/page.tsx:320-321`: "<strong>Approachable mechanics.</strong> The floor is low. The ceiling is high. A 12-year-old who has never played can find their footing in a few sessions, and a player who's been at it for two years still has room to grow."
  - Matching: `app/games/page.tsx:63`: `desc: "Easy to start, forgiving to learn, and accessible without overwhelming beginners. The floor is low, the ceiling is high.",` (card title "Approachable Mechanics", `:62`).
- "meet students through the games they love": `league...page.tsx:432-433`: "We meet students through the games they love, and we teach through the game where the inputs compound: structured roles, teachable team dynamics, depth that sustains a real season."
  - Matching: `app/games/page.tsx:338`: `&ldquo;EKUZO meets students through the games they love, but teaches through the game that allows growth to compound.&rdquo;`
- "running all summer": `league...page.tsx:625-626`: "[our camps] are running all summer." No match in `app/games/page.tsx` (grep for "all summer", "ceiling", "floor", "meet students" returned only lines 63 and 338). Stale vs today's date [INFERRED].
- League card titles in games page `:56-70`: "Strategic Depth", "Approachable Mechanics", "Stable Roles and Systems"; league post `:318-321` echoes "Approachable mechanics" as a bold lead-in.

---

## 5. Author / schema plumbing

### Person nodes in lib/schema.ts (exact)
`lib/schema.ts:25` `export const KARLIN_ID = \`${SITE}/#coach-karlin\`;`
`lib/schema.ts:28-52`:
```
export const coachKarlinSchema = {
  "@type": "Person",
  "@id": KARLIN_ID,
  name: "Karlin Oei",
  alternateName: "Faith",
  jobTitle: "Founder",
  description:
    "Founder of EKUZO. Former national collegiate esports captain who earned $80,000+ in scholarships; builds EKUZO as the structured, coached environment he didn't have growing up.",
  knowsAbout: [
    "youth esports", "esports coaching", "League of Legends", "youth development",
    "structured gaming", "screen time", "online safety for kids",
  ],
  sameAs: ["https://www.linkedin.com/in/karlinoei/"],
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/authors/coach-karlin-faith-1400.jpg`,
  url: `${SITE}/blog/author/karlin-oei`,
};
```
(knowsAbout abbreviated onto fewer lines here; actual file has one per line, `:36-44`.)
`lib/schema.ts:84` `export const JAMIE_ID = \`${SITE}/#person-jamie\`;`
`lib/schema.ts:86-107`:
```
export const personJamieFitch = {
  "@type": "Person",
  "@id": JAMIE_ID,
  name: "Jamie Fitch",
  jobTitle: "CEO",
  description:
    "CEO of EKUZO, a youth esports coaching program. An edtech founder who previously raised over $40M, scaled, and sold an education company, and now builds and invests in companies focused on learning, youth development, and impact.",
  knowsAbout: [ "youth esports", "esports coaching", "youth development", "structured gaming",
    "online friendship and social connection", "screen time", "parenting gamers", "education technology" ],
  sameAs: ["https://www.linkedin.com/in/jamiefitch/", "https://fitch.vc"],
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/jamie-fitch.jpg`,
  url: `${SITE}/blog/author/jamie-fitch`,
};
```
`lib/schema.ts:117` `export const MUHAMMAD_ID = \`${SITE}/#person-muhammad\`;`
`lib/schema.ts:119-141`:
```
export const personMuhammadHossain = {
  "@type": "Person",
  "@id": MUHAMMAD_ID,
  name: "Muhammad Hossain",
  jobTitle: "Coach",
  description:
    "EKUZO coach and a senior English major at Texas A&M University. He coaches kids in League of Legends and interviews parents about gaming for EKUZO's listening project.",
  knowsAbout: [ "esports coaching", "League of Legends", "parenting gamers", "military families and gaming", "screen time" ],
  // `affiliation`, not `alumniOf` — he is a current student, not a graduate.
  affiliation: { "@type": "CollegeOrUniversity", name: "Texas A&M University" },
  worksFor: { "@id": ORG_ID },
  image: `${SITE}/images/muhammad-hossain.jpg`,
  url: `${SITE}/blog/author/muhammad-hossain`,
};
```
Header comment `lib/schema.ts:79-83`: "Keep "parent" out of jobTitle/description — it lives on-page only (byline sub-label + author bio). jobTitle is "CEO"."

### How the article schema references author
`buildBlogArticleSchema` (`lib/schema.ts:451-483`): `author?: { "@id": string } | { "@type": "Person"; name: string }` (`:448`); emitted as `author: author ?? { "@id": KARLIN_ID }` (`:477`); publisher `{ "@id": ORG_ID }`. So by `@id` reference for Karlin (default), Jamie (`JAMIE_ID`, sons `:169`), Muhammad (`MUHAMMAD_ID`, military/fortnite); **inline minimal `{ "@type": "Person", name }` for guests**. Guest authors John Hay and Lisa Holt have NO Person node in lib/schema.ts (only the inline name at conquering `:62`, our-family `:62`). The `@id` nodes are emitted in `rootGraph` (site-wide) [INFERRED from comments `lib/schema.ts:109-116`: "IN `rootGraph` since 2026-07-31"; rootGraph not fully read]. `buildVideoObjectSchema` hardcodes `author: { "@id": KARLIN_ID }` (`lib/schema.ts:597`).
Author page graph: `buildAuthorPageGraph` (`lib/schema.ts:510`): ProfilePage `mainEntity: { "@id": personId }` plus BreadcrumbList.

### "CEO" for Jamie (grep -rn "CEO" app components lib public/llms.txt; excludes docs/node_modules; `app/season1/landing.html` contains base64 and was excluded with --include filters)
- `lib/schema.ts:83` (comment), `:90` `jobTitle: "CEO",`, `:92` description "CEO of EKUZO, ..."
- `lib/authors.ts:119` `role: "CEO of EKUZO · Parent",`
- `lib/authors.ts:122` `headshotAlt: "Jamie Fitch, CEO of EKUZO",`
- `lib/authors.ts:126` description "Jamie Fitch is CEO of EKUZO, a parent and edtech founder. He writes about turning gaming from something parents worry about into something kids can grow through."
- `lib/authors.ts:128` bio[0] "Jamie Fitch is the CEO of EKUZO, where he helps ..."
- `public/llms.txt:31` and `:43` (quoted below)
- Unrelated: `app/blog/league-of-legends-youth-development/page.tsx:51` and `:705` ("Demis Hassabis, the Nobel-winning CEO of Google DeepMind").
- [Did not grep `app/season1/landing.html` for CEO; file is large base64 HTML.]

### public/llms.txt lines mentioning Jamie Fitch (exact)
`:31`: `- [When your son's only friends are online](https://ekuzo.gg/blog/when-your-sons-only-friends-are-online): Jamie Fitch's (EKUZO CEO and parent) perspective piece on whether a son's online gaming friends are real, and whether gaming is isolating or connecting him. Argues the question is not online versus offline but alone versus together — ...` (continues; truncated at 500 chars in my read, full line has the FAQ and citations)
`:43`: `- [Jamie Fitch](https://ekuzo.gg/blog/author/jamie-fitch): CEO of EKUZO, a parent and a lifelong competitive gamer. Previously founded, scaled and sold an edtech company, raising more than $40M. Writes on turning gaming from something parents worry about into something kids grow through.`
Note: llms.txt `:31` says "(EKUZO CEO and parent)"; `lib/schema.ts:80-81` says "parent" stays on-page only; llms.txt carries it.

### Author page rendering
- `app/blog/author/<slug>/page.tsx` (jamie-fitch, karlin-oei, muhammad-hossain): `metadata = buildAuthorMetadata(getAuthor(SLUG))` and `<AuthorPage author={SLUG} posts={POSTS} />` (jamie: `app/blog/author/jamie-fitch/page.tsx:4-6,22-24`).
- `buildAuthorMetadata` (`lib/authors.ts:191`): title = author.name; description = author.description; OG image = `author.headshot`, alt = `author.headshotAlt ?? author.name`.
- `components/blog/AuthorPage.tsx`: hero portrait `src={author.headshot}` `alt={author.headshotAlt ?? author.name}` (`:97-98`); name H1 (`:117`); role line `{author.role}` rendered only if present (`:120-122`); bio `author.bio?.map(...)` one `<p>` per entry (`:125-129`); pull-quote `&ldquo;{author.pullQuote}&rdquo;` (`:135-137`); "Posts by {author.name}" (`:167`); FooterBanner at bottom (`:224`), suppressed when `footerBanner === false` (Muhammad).
- Registry values (`lib/authors.ts`): Karlin role "Founder of EKUZO" (`:93`), headshotAlt "Karlin Oei", pullQuote "games are the best teacher we already know."; Jamie role "CEO of EKUZO · Parent" (`:119`), headshotAlt "Jamie Fitch, CEO of EKUZO" (`:122`), no pullQuote; Muhammad role "EKUZO coach · Texas A&M", headshotAlt "Muhammad Hossain, EKUZO coach", `footerBanner: false`. Guests: `{ slug: "john-hay", name: "John Hay", kind: "guest", hasPage: false }` and lisa-holt (no avatar/role/link).
- Byline (`components/blog/AuthorByline.tsx`): avatar `alt={author.name}` (staff only), "by [name]" linked via `rel="author"` when `hasPage`, role then `{dateLabel} {formatDate(date)}` then "N min read" (shown when minutes <= `READ_TIME_CEILING_MINUTES`).
- Karlin bio on his page (exact, `lib/authors.ts` bio array): "Karlin Oei is the founder of EKUZO, a youth esports coaching program that turns a kid's existing gaming into a structured, coached, team-based experience." / "He builds EKUZO from the inside of the problem it solves. Karlin grew up gaming through social anxiety, low self-esteem, and a complicated home, and school rarely reached him. Games did. What he didn't have was anyone who knew what to do with that: no team, no routine, no coach to turn the hours into growth. He only started to see what gaming had taught him (ownership, accountability, how to lead) at 18, and stumbled into competitive League of Legends in college, where he became a national collegiate captain and earned $80,000+ in esports scholarships. EKUZO is the container he wishes he'd had." / "He writes here about what a kid's gaming is really telling parents, why structure beats restriction, and what coached play actually looks like." / "Karlin's mission is to help making gaming matter in the lives of students and the people that support them." (grammar as in file: "help making")

---

## 6. Program state

- `app/programs/ekuzo100/` still exists: `page.tsx`, `register/`, `success/`. `page.tsx` renders the full marketing page: metadata `title: "EKUZO100: 4-Week Intro Program"`, `description: "One month. $100. Your first team. EKUZO100 is the low-risk way to start with EKUZO: real coaching, real teammates, real growth."` (`app/programs/ekuzo100/page.tsx:17-21`), `alternates: { canonical: "/programs/ekuzo100" }`; no robots meta found in page.tsx or a layout.tsx (no `app/programs/ekuzo100/layout.tsx`), so indexable. Components: Nav, Footer, FooterBanner, OurApproachSection, EcosystemAnimation, TestimonialsCarousel, FAQAccordion, TrackedRegisterLink, JsonLd with `ekuzo100CourseSchema` and FAQPage. How-it-works copy: "Sessions are Tuesdays & Thursdays, 7:00–8:30 PM local." (`:33`).
- `app/programs/ekuzo101/page.tsx`: metadata (`:31-37`)
```
export const metadata = {
  title: "EKUZO 101 Summer Pilot: Try It Free",
  description:
    "4 weeks of elite esports coaching. You pick the weeks. Free upfront.",
  alternates: { canonical: "/programs/ekuzo101" },
  robots: { index: false, follow: true },
};
```
  Header comment `:23` "Noindex: pilot program, not for public search indexing. No JSON-LD." Two posts (gaming-military, should-you-ban) link to this noindex page; `lib/programRoutes.ts` has a `program: "ekuzo101"` entry. `app/programs/` also has `ekuzo-camps`, `ekuzo-teams`, `page.tsx`.
- **Season 01 mode** (`lib/seasonOne.ts`):
  - Flag: `lib/seasonOne.ts:14`: `export const SEASON_ONE_MODE = process.env.NEXT_PUBLIC_SEASON_ONE_MODE !== "off";` ON by default; off only if Netlify env `NEXT_PUBLIC_SEASON_ONE_MODE=off` (`:11-12`).
  - Header comment (`lib/seasonOne.ts:1-9`): "While this is on, every enrollment entry point on the site (the Enroll modal, direct /register links, the sticky bar, the nav button) opens the Season 01 waitlist popup instead, and /register pages redirect back to their program page with the popup open. Commerce code is untouched, so turning it off restores the old funnel exactly."
  - `context/ModalContext.tsx:28`: `openModal: (type) => setActiveModal(SEASON_ONE_MODE && type === "enroll" ? "seasonOne" : type),` (ModalType includes `"seasonOne"`, `:6`).
  - `components/ui/ModalRenderer.tsx:13`: `if (activeModal === "seasonOne") return <SeasonOnePopup />;`
  - `components/ui/SeasonOneTrigger.tsx` (mounted `app/layout.tsx:222`): capture-phase click handler intercepts any internal `<a>` whose pathname matches `/\/register\/?$/` and opens the popup instead (`:26-39`); auto-opens the popup on first visit after a delay unless localStorage joined/dismissed-snoozed, skipping `/register`, `/success`, and `SEASON_ONE_QUIET_PATHS` (`/make-it-count`, `/swamp`, `/woodward`, `/squad`, `/creators`, `/editors`, `/privacy-policy`, `/terms-of-service`) (`:47-62`); `?join=season-one` opens it on any page (`:49-53`). Blog posts are NOT in the quiet list, so the popup auto-opens on blog posts [INFERRED from the code].
  - `middleware.ts:19-26`: `if (SEASON_ONE_MODE && /\/register\/?$/.test(path))` -> 307 redirect to program page with `?join=season-one`. Success pages untouched.
  - `lib/programRoutes.ts:41` `if (SEASON_ONE_MODE) return null;` (no direct register routing).
  - `components/sections/FooterBanner.tsx:41-43` (quoted in section 2): heading/label overridden. `components/layout/Nav.tsx:156,280`: `{SEASON_ONE_MODE ? SEASON_ONE_COPY.navCta : "Enroll my gamer"}`. `components/ui/StickyCTA.tsx:152-168`: one bar, `SEASON_ONE_COPY.stickyHead` + button `navCta`.
  - Blog-specific: `components/ui/StickyCTA.tsx:45` `const isBlogPost = !SEASON_ONE_MODE && isBlogPostPath(pathname);` (blog newsletter bar off); `app/layout.tsx:234` `{!SEASON_ONE_MODE && <NewsletterPopup mode="blog" />}` (comment: "Off while Season 01 mode is on, so a post carries one ask."); `app/layout.tsx:228` homepage newsletter popup also off.
  - Copy (`SEASON_ONE_COPY`): kicker "Season 01 · Waitlist open"; `navCta: "Join Season 01"`; `bannerHead: "Season 01 starts in 2027. Get them on the list."`; `stickyHead: "Season 01 waitlist is open"`; `cta: "Save their spot"`.
  - Net effect on posts: every blog post's FooterBanner/sticky/nav says Season 01 waitlist, while body text in 7 posts still sells "EKUZO100 ... one-month trial ... $100" (conquering, our-family, when-gaming-helps with price; what-your-kids, sons without price) and summer-camps sells "$199 per week ... May 18 through August 8, 2026". EKUZO100 link target page is live but its register link is intercepted into the waitlist popup.
- **next.config.mjs redirects** (file `next.config.mjs`; `next.config.ts` is an empty default `{ /* config options here */ }` stub also present at repo root; Next loads only one [INFERRED: .mjs wins by resolution order? not verified]):
  - `:26-29` EKUZO100: `/ekuzo100-4-week-intro`, `/ekuzo100`, `/ekuzo100/:path*`, `/programs/e100` -> `/programs/ekuzo100` (permanent)
  - `:31-35` Teams: `/ekuzoteams-semester-based`, `/ekuzo-teams`, `/programs/ekuzoteams`, `/teams` -> `/programs/ekuzo-teams` (permanent)
  - `:37-45` `/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng` -> `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng`
  - `:46-53` `/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng` -> `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng`
  - `:55` `/old-home` -> `/`
  - `:57-72` (comment block) `/blog/mom-who-banned-fortnite` -> `/blog/gaming-military-families` (permanent)
  - `:74-79` Camps: `/ekuzocamps-seasonal`, `/ekuzo-camps`, `/ekuzo-camps/:path*`, `/camps`, `/camps/:path*` -> `/programs/ekuzo-camps...`
  - `headers()` returns `[]` (`:19-21`).
  - There is no redirect for `/programs/ekuzo101`, no `/blog/*` -> `/programs/*`.
- Camps page (`app/programs/ekuzo-camps/page.tsx`): "Promoted from v2 on 2026-05-20" (`:22-23`); not read further, so whether it still advertises summer 2026 weeks is unverified.

---

## 7. Test / build tooling

`package.json` scripts (`package.json:5-11`): `dev` = `next dev`, `build` = `next build`, `start` = `next start`, `lint` = `eslint`, `prepare` = `husky`. No `test` script.
- Versions: `"next": "16.2.1"`, `"react": "19.2.4"` (CLAUDE.md says Next.js 15; package.json says 16.2.1). devDeps: eslint ^9, eslint-config-next 16.2.1, tailwindcss ^4, typescript ^5, husky ^9.1.7. No vitest/jest/playwright dependency; no `vitest*`/`jest*`/`playwright*` config at repo root (ls glob returned none).
- Tests that exist: `lib/__tests__/ekuzo101-weeks.test.ts`, `lib/__tests__/season-one-attribution.test.ts`, using Node's built-in runner (`import { describe, it } from "node:test"`); header (`ekuzo101-weeks.test.ts:3-4`): "Run with: node --experimental-strip-types lib/__tests__/ekuzo101-weeks.test.ts". No test for blog pages, dates, schema, or sitemap.
- ESLint config: `eslint.config.mjs` present. Husky pre-commit (`.husky/pre-commit`) rejects staged files > 10MB (`MAX_SIZE_MB=10`).
- **`node_modules` does NOT exist in this worktree** (`ls node_modules` -> "No such file or directory"). Not installed per instructions; `next build`, `eslint`, `tsc` cannot run here as-is.
- `middleware.ts` matcher `["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]` applies to all blog routes.
- `docs/blog-refresh-2026-10/` already contained an empty `copy/` dir before this file was written.
- Worktree git status at scout time: only untracked `.husky/_/` (no modified tracked files).
