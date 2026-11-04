# 00 Scout map: session-end post, Fortnite update, League facts box

Scout, read-only. Repo `/home/claude/ekuzo-web` at `3433a5b` (branch `blog/get-kid-off-video-games`, same as origin/main). Worktrees `/home/claude/wt-fortnite` (`blog/fortnite-search-refresh`) and `/home/claude/wt-league` (`blog/league-facts-box`) are clean at the same commit (only untracked `.husky/_/`). Line numbers are from `/home/claude/ekuzo-web`; the worktrees are identical.

## 0. Stale vs the handoff / CLAUDE.md (read first)

| Claim | Reality |
|---|---|
| ekuzo-web CLAUDE.md: "Next.js 15" | `package.json` has `next 16.4.3`, react 19.2.4 |
| Handoff Step 0: template = gaming-study | Robux (shipped 10-26) is the better template: it adds the table, captions, `Fragment` FAQ with string answers, `SOURCES` array, no video / reply cards. Gaming-study carries video schema, `ReplyQuoteCards`, `FAQ_ITEMS.answer: string[]` |
| Blog-wide item 2: `faq_open` event | Not built. `BlogPostTracking.tsx` only fires `blog_link_click` and `blog_read_75` plus Clarity tags. `faq_open` exists only in `app/season1/landing.html:1376`. Blog FAQs are plain `<h3>`+`<p>`, no accordion, so there is nothing to hook |
| Item 7: gaming-study still `featured: true` | Already moved. `featured: true` is on **robux** (`app/blog/page.tsx:27`); gaming-study is `false` (`:42`). New post must take it from robux and update the comment at `:23-26` |
| Item 7: drop "recent" from gaming-study opening | Nothing to drop: the short answer (`gaming-study .../page.tsx:328`) has no "recent" |
| Item 8: em dashes in `what-your-kids-gaming` and in the llms.txt blog index line | **Already clean.** `what-your-kids-gaming/page.tsx` has only two em dashes, both in code comments (lines 21, 174), none in rendered prose, no `&mdash;`. `public/llms.txt` has exactly one em dash group, line 7 (the "Founded in 2021 by Karlin ... — a former ..." sentence, which is not in the blog index). All blog entries (lines 24-35) are dash-free. (Line 7 also says Founded 2021, Houston, and lists Camps/EKUZO100/Teams: older than Jamie's 2023 / Season 01 facts, out of scope but worth a flag.) |
| Fortnite "Before you take it away" is to be moved up | It is a `GutCheckAside` component at `should-you-ban-fortnite/page.tsx:506-516`, a float-right rail aside inside the "Why Red Dead Redemption worked" section (H2 at 491). Moving it means placing it after a different H2 and the comment at 497-504 explains the placement rule |
| Handoff Fortnite branch `blog/fortnite-search-refresh` | Matches the worktree branch |
| FooterBanner | `FooterBanner` is Season 01 aware: when `SEASON_ONE_MODE` (default on) and `ctaModal="enroll"` (default) it ignores `heading` and shows `SEASON_ONE_COPY.bannerHead` ("Season 01 starts in 2027. Get them on the list.") and the navCta label (`components/sections/FooterBanner.tsx:41-43`) |
| Fortnite has no FooterBanner | By design (header comment `:69`, `:784`). Keep it that way |

## 1. Template comparison: robux vs gaming-study

Recommended template: **`app/blog/should-i-buy-my-kid-robux/page.tsx`** (662 lines), copy its skeleton; borrow nothing structural from gaming-study except nothing. Element map (robux line numbers; gaming-study equivalents in the last column):

| Element | Robux | Gaming-study |
|---|---|---|
| Imports | `:1-14` (`Fragment`, Nav, Footer, FooterBanner, TornPaperDivider, JsonLd, BlogPostBody, `buildBlogArticleSchema`, `buildBlogPostBreadcrumbSchema`, `buildFAQPageSchema`, Link, Image) | `:1-19` plus InstagramEmbed, ReplyQuoteCards, `buildVideoObjectSchema` |
| Constants | `SLUG :34`, `TITLE_DISPLAY :35` (H1 + schema headline), `TITLE_SEO :39` (absolute title, 51 chars), `SUBHEAD :40`, `DESCRIPTION :44`, `HERO_IMAGE :46`, `SHARE_IMAGE :47`, `HERO_ALT :48`, `DATE_PUBLISHED :52`, `DATE_MODIFIED :53` | `SLUG :35`, `TITLE_DISPLAY`, `TITLE_SEO :40`, `HERO_IMAGE :46`, `SHARE_IMAGE :47` |
| `metadata` | `:157-190`: `alternates.canonical = /blog/${SLUG}`; `title: { absolute: TITLE_SEO }` (skips the layout "%s \| EKUZO" template); `description`; `openGraph` {title=TITLE_SEO, description, type "article", url `https://ekuzo.gg/blog/${SLUG}`, siteName "EKUZO", locale en_US, images [{url SHARE_IMAGE, 1200x630, alt HERO_ALT}], publishedTime, modifiedTime, `authors: ["Karlin Oei"]`, section "Perspective"}; `twitter` {card summary_large_image, title, description, images [SHARE_IMAGE]}; `robots {index true, follow true}` | `:179-211` same shape (OG alt = TITLE_DISPLAY) |
| Table caption class | `captionClass :194` = `"caption-top text-left font-body font-bold text-black pb-3"` | none |
| Schema in component | `:197-206` `buildBlogArticleSchema({slug, title: TITLE_DISPLAY, description, datePublished, dateModified, image: SHARE_IMAGE})` (author defaults to Karlin: `KARLIN_ID`); `buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY)`; `buildFAQPageSchema(FAQ_ITEMS)`; three `<JsonLd>` at `:210-212` | `:213-235` also video |
| Nav | `:214-216` absolute-positioned `<Nav variant="light" />` | same |
| Brush deco | `:218-231` | same |
| Header | `:234-261`: eyebrow `Perspective` (red caps), H1 `font-body font-bold`, `clamp(2rem,4vw,3.25rem)`, italic `SUBHEAD` | same |
| Hero | `:264-285`: container `mb-20`, inner `relative w-full` `height: 520px`, `<Image fill priority className="object-cover" sizes="(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px">`. Source is 1916x809 | `:294-312` same pattern, 2400x1260 source |
| Body wrapper | `:287-295` `max-w-[1232px] pb-32` | same |
| `BlogPostBody` | `:296-300` `author="karlin-oei" published modified` (renders byline rail, "Updated <modified>" and "N min read"; the visible Updated date is automatic: `AuthorByline.tsx:52-64`) | `:322` |
| Short answer | `:301-315` first `<p>` with `<strong>Short answer:</strong>{" "}` and one inline `<a>` (no H2 above it) | `:327-345` same |
| H2s | plain `<h2>` (styled by `BlogContent`: Tungsten 900, `clamp(1.75rem,3vw,2.5rem)`) | same |
| Pull quote / callout | **No styled pull-quote component exists.** Robux uses a bare `<blockquote><p>` (`:337-342`, `:362-367`); `BlogContent.tsx` styles `blockquote` as italic with a 3px red left border. A "styled callout" for the 35-minute line needs new markup (see §10) | gaming-study `:413` bare blockquote |
| Other callout | `GutCheckAside` (`components/blog/GutCheckAside.tsx`): float-right 340px bordered card on desktop, full width on mobile, numbered question rows, blue `#0C447C`/`#E6F1FB`; props `title, subtitle, questions[], label`. Built from div/span so `.blog-content` prose CSS does not leak in | not used |
| Tables | Real `<table>`, `<caption className={captionClass}>`, `<thead><tr><th scope="col">`, `<tbody>`; row-header variant uses `<th scope="row">` (`:405-455`). Styling is global in `BlogContent.tsx` (thead `#EFEEED`, 1px borders, even-row tint, `font-size clamp(.875rem,1.2vw,1rem)`). No horizontal scroll wrapper exists; a 3-column table is fine at 375px, wrap in `overflow-x-auto` if the new one is wider | none |
| In-body image | `:378-388` `<div className="my-10 mx-auto w-full max-w-[560px]">` + `<Image width=1080 height=1350 sizes="(max-width: 640px) 100vw, 560px" className="w-full h-auto">` | `:489` |
| FAQ | `FAQ_ITEMS: {question, answer: string}[]` `:84-109`; rendered `:541-548` as `<h2>Common questions</h2>` then `Fragment` per item `<h3>` + `<p>`; same array feeds `buildFAQPageSchema` (visible == schema, required by Google) | answer is `string[]`, joined with " " for schema `:223-226` |
| Sources | `SOURCES: {label, url}[]` `:111-155`; rendered `:550-566` `<h2>Sources</h2><ul>` with `<a className="[overflow-wrap:anywhere]" target="_blank" rel="noopener noreferrer">` (Sentry D2 fix for long URLs at phone width) | inline `<ul>` `:641+` |
| Keep Reading | `KEEP_READING` array `:60-82` (slug, title, blurb, image, category); section `:573-634`: `<TornPaperDivider color="grey" variant="top" style={1} />`, `bg-[#f0edea]` section, 3-col grid `md:grid-cols-3`, cards `aspect-[16/10]` `<Image fill sizes="(max-width: 768px) 100vw, 33vw">` | `:735-786` |
| FooterBanner | `:636` `<FooterBanner heading="Every gamer deserves a team" />` then `<Footer />` | `:789` same |
| Tracking | **None in the page.** Mounted once in `app/blog/layout.tsx` (see §5) | same |

Robux internal links to model: `Weighing a ban instead?` paragraph at `:567-581` (links to fortnite, what-your-kids-gaming, /parents). First "Roblox" links to the Roblox help page.

Copy-of-record check: v6 draft headings are all questions (`_read-copy-get-kid-off-the-game-v6.md`: lines 17, 50, 68, 86, 94, 107, 125 `Common questions`, 155 `Sources`). Its "35 minutes" pull quote is line 66. Its table is lines 52-58 (Game / One match / Where to stop, 3 columns, 5 rows in the file; Jamie said six games, check the draft against the handoff when building).

## 2. /blog index: featured and listing

- Registry is a hard-coded array `const posts = [...]` in `app/blog/page.tsx:15-157`. No lib registry. Fields: `slug, title, date ("October 26, 2026" display string), author, category, excerpt, image, featured`. Comment at `:14`: card dates must match each post's `DATE_MODIFIED`.
- Featured: `posts.find((p) => p.featured)!` (`:160`, first match wins, only one allowed). Featured card renders at `:176-209`: `Image fill` with no `sizes` prop (known speed item 4), H2 title uppercased in `font-display`.
- Grid: `all = posts` in array order, 3-col (`:226-262`), `<Image fill>` no `sizes` either.
- Robux: array index 0 (`:17-30`), `featured: true` at `:27`, with comment `:23-26` ("The session-end post takes it next"). Gaming-study: `:31-43`, `featured: false :42`, comment `:41`.
- Post to add: new entry at the top of `posts`, `featured: true`; set robux `featured: false` and rewrite its comment; image = the 1200x630 card (`/images/get-kid-off-card...`; the grid crops it to 16:10 with object-cover, the featured card is `min-h-[400px]`; text baked into the card image would be cropped in the grid, so prefer `get-kid-off-card-text.jpg` only if the text survives a 16:10 centre crop of 1200x630, which it will not at the left and right edges. Check, or use hero-clean for the card).
- Fortnite and League entries need their `date` bumped when their `DATE_MODIFIED` moves: fortnite `:84-94` ("October 26, 2026"), league `:132-141` ("October 13, 2026").

## 3. lib/schema.ts and lib/authors.ts

| Item | Where |
|---|---|
| `buildBlogArticleSchema({slug,title,description,datePublished,dateModified?,image,author?})` | `lib/schema.ts:480-515`. Emits `BlogPosting` (`@id` `${url}#article`), `author: author ?? {"@id": KARLIN_ID}`, `publisher {@id ORG_ID}`, `inLanguage en-US`, `toSchemaDateTime()` dates. Guest authors only: `GUEST_AUTHOR_NODES` `:270` |
| `buildBlogPostBreadcrumbSchema(slug, title)` | `:517-524` Home > Blog > title |
| `buildFAQPageSchema(items: {question, answer}[])` | `:578-590`; answers must be plain text |
| `buildBreadcrumbSchema` | `:441` |
| `KARLIN_ID` `:25`, `JAMIE_ID :87`, `MUHAMMAD_ID :120` | exported |
| No HowTo (Google dropped it; handoff says not used) | |

`lib/authors.ts`: `AUTHORS` array `:94+`. Slugs: `karlin-oei` (`:95`, staff, `hasPage: true`, `personId: KARLIN_ID`), `jamie-fitch` (`:122`), `muhammad-hossain` (`:142`), guests `john-hay`, `lisa-holt` (`:170-171`, no page). `getAuthor(slug)` throws on unknown slug (`:176-181`). New post needs no authors change: `author="karlin-oei"`. The author page grid is `components/blog/AuthorPage.tsx` (uses `posts`? not checked; grep for how author pages list posts if the new card must show there: **check before build**).

## 4. Sitemap and llms.txt

`app/sitemap.ts`:
- Blog block starts `:97`. `/blog` floor entry `:100-105` (`lastModified: new Date("2026-10-11")`, raised automatically by the code at `:218-229` to the newest post lastmod). Post entries `:107-180`, each `{url, lastModified: new Date("YYYY-MM-DD"), changeFrequency: "weekly"|"yearly", priority 0.5-0.7}`.
- Convention: `lastModified` = the post's `DATE_MODIFIED` (real edit date). Featured/newest gets `priority: 0.7` and a comment. Robux entry:

```
    // The Robux post, shipped 2026-10-26. Carries the featured slot on /blog.
    {
      url: `${baseUrl}/blog/should-i-buy-my-kid-robux`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
```
- Edits needed: add new post (0.7, 2026-11-04); robux priority to 0.6; fortnite `:158-162` lastModified to the new date (currently 2026-10-26, priority 0.7, comment `:155-157` says it carries featured, which is stale); league `:119-123` lastModified (currently 2026-10-13). Update the comments.
- `/blog/author/*` entries (`:184-199`) have `lastModified 2026-10-26`; raise karlin-oei's to the ship date because its post grid changes.

`public/llms.txt` (66 lines): blog section "## Blog and articles" starts line 22. Entry format: `- [H1 title](URL): <long plain-sentence summary, no em dashes, ends with an FAQ list in parentheses>`. Newest first. Quote of the robux entry (line 24):

> `- [She asked for Robux to learn about money. Her dad said yes.](https://ekuzo.gg/blog/should-i-buy-my-kid-robux): Karlin Oei's parent-facing piece on whether to buy your kid Robux, told through a $20 pilot ... Includes a five-question FAQ (is Roblox safe for younger kids, how much is VIP in Dress to Impress, does VIP help you rank up, how to use Roblox parental controls to limit spending, how much real money a Robux is).`

Insert the new entry above line 24. Fortnite entry is line 26 (its summary mentions "Includes a five-question FAQ"; update if the FAQ or facts box changes); League entry line 31. Blog index line is line 23 (no em dash).

## 5. BlogPostTracking and the Season 01 popup

`app/blog/BlogPostTracking.tsx` (91 lines), mounted for every route under `/blog` by `app/blog/layout.tsx:8-12`. **A new post gets it automatically; no wiring.** Gate: `isBlogPostPath(pathname)` = `/^\/blog\/[^/]+\/?$/` and not `/blog/author/` (`lib/newsletterAb.ts:148-151`), so the slug must be a single path segment.
- Clarity: `tagClarity("page_type","blog")`, `tagClarity("post_slug", slug)` (`:42-43`).
- GA4 `blog_link_click` `{post_slug, link_path, link_type}` on a capture-phase `click` (button 0, no modifiers) of a same-origin link whose path differs from the current page; skips anything inside `nav, header, footer, [role='dialog']` (`:55`). `linkType()` `:28-35` -> parents / author / blog_index / post (any `/blog/...`) / program (`/programs*` or `/season1*`) / other_internal. So in-body links to the Fortnite post, `/parents`, and a Season 01 link are all counted as long as they are real `<a>`/`Link` elements inside `<article>`/Keep Reading (not in header/footer).
- GA4 `blog_read_75` once per view (`:64-79`): bottom of viewport passes 75% of the first `<article>`; ignores scrolls in the first 800 ms. Needs exactly one `<article>` per page, which the template has.
- `faq_open`: not implemented (see §0).
- Event wrappers: `lib/analytics.ts:269-286`.

Season 01 popup on `/blog/*`:
- `SeasonOneTrigger` is mounted in `app/layout.tsx`. `SEASON_ONE_MODE` is on unless `NEXT_PUBLIC_SEASON_ONE_MODE=off`. `lib/seasonOne.ts:21-30` quiet paths (no auto-open): `/make-it-count /swamp /woodward /squad /creators /editors /privacy-policy /terms-of-service`. **`/blog` is not quiet**: the popup auto-opens 2.5 s after load on a first visit, unless `ekuzo_s1_joined` is set or it was closed in the last 7 days (`SeasonOneTrigger.tsx:44-67`). `?join=<anything>` opens it immediately, only on initial mount/pathname change (a same-page `?join=` link via `next/link` will not reopen it). It also swallows any click on a link ending `/register`.
- Popup (`SeasonOnePopup.tsx`): email-only waitlist form, POST `/api/season-one` with `source: "site-popup"`, `page: pathname+search`, attribution; on success `trackLead({source:"season_one_popup"})`. So blog leads are credited to the post (Run 1 verified).
- Copy `SEASON_ONE_COPY` (`lib/seasonOne.ts:33-51`): `navCta: "Join Season 01"`, `bannerHead: "Season 01 starts in 2027. Get them on the list."`, `stickyHead`, `cta "Save their spot"`. **`navCta` is a label, not a URL**: Nav (`Nav.tsx:156,280`), FooterBanner and StickyCTA (`:162-168`) all call `openModal("seasonOne")` (popup), they do not navigate.
- `ModalButton` (`components/ui/ModalButton.tsx`) only types `"contact" | "enroll"`, but `openModal("enroll")` maps to `"seasonOne"` when mode is on (`context/ModalContext.tsx:28`). So an in-body "Join Season 01" can be a `ModalButton modal="enroll"` (client component, opens the popup, no navigation, no `blog_link_click`).

Season 01 routes under `app/season1` (all route handlers serving static HTML, none is a `page.tsx`):

| Route | Robots | What it is |
|---|---|---|
| `/season1` (`app/season1/route.ts`, `landing.html`) | `<meta name="robots" content="noindex">` | Ad landing page; `?ad=dN`; Lead event; waitlist form |
| `/season1/join` | `x-robots-tag: noindex` + meta noindex | Join A, commit/pay flow |
| `/season1/join/b` | noindex | Join B, pricing first. `/karlin` 307-redirects here (`next.config.mjs:96`); Klaviyo emails point here |
| `/season1/join/jersey` | noindex | Jersey ads checkout, no Lead event |
| `/season1/join/signup`, `/join/welcome`, `/early-access`, `/early-access/signup`, `/early-access/saved`, `/crew`, `/thanks`, `/terms`, `/dev-view` | noindex | funnel steps |

Every `/season1*` page is noindex, so a link from the blog is a pure conversion link and passes no index value; fine. **Recommendation for the in-body Fortnite link:** link `"Season 01"` to **`/season1`** with UTM tags (e.g. `/season1?utm_source=blog&utm_medium=post&utm_campaign=should-you-ban-fortnite`), because it is the waitlist landing with a Lead event (Join A/B/jersey are checkout pages; WORKLOG 11-03 notes jersey has no Lead event) and it is what `linkType()` calls "program". Alternative that matches the sitewide CTA exactly: a `ModalButton`/button that opens the popup. This is a Jamie decision (open question 1). Note the Fortnite header rule is "exactly one product link"; the swap keeps it one.

## 6. Fortnite post (`app/blog/should-you-ban-fortnite/page.tsx`, 788 lines)

- Byline `author="muhammad-hossain"` (`:345`); `DATE_PUBLISHED 2026-07-28` (`:127`), `DATE_MODIFIED 2026-10-26` (`:128`).
- H1 = `TITLE_DISPLAY` "She banned Fortnite and got her kid back. Then came a new problem." (`:109`, rendered `:300-305`); subhead `SUBHEAD :114`. **Title tag** = `TITLE_META` "Should you ban Fortnite? What happened when one mom did" (`:113`, via `metadata.title :222`, NOT absolute so layout template appends "| EKUZO"). OG/Twitter use `TITLE_DISPLAY`. `DESCRIPTION :117`. Share image `/images/should-you-ban-fortnite-share.jpg` (1200x630), hero 1600x900 rendered `w-full h-auto` (`:327-334`).
- Order of body: intro paragraphs `:346-369` (three `<p>`, Muhammad "Howdy, I'm Muhammad ..." and the "short version" paragraph; **no labeled short answer exists**, the second paragraph at `:356-366` is the de facto summary), then H2s:

| Line | Current H2 |
|---|---|
| 370 | Why she banned Fortnite |
| 454 | What the ban fixed, and what it broke |
| 491 | Why Red Dead Redemption worked |
| 568 | Why her kids begged their dad for a private Minecraft server |
| 605 | What she actually did |
| 696 | Common questions |
| 704 | Sources and further reading |

- "Before you take it away" five questions: `GutCheckAside title="Before you take it away" subtitle="Five questions about what the game is giving"` at `:506-516`, questions: Who are they playing it with, week to week? / Is anyone else in the house in there with them? / What are they like twenty minutes after they stop? / Have they built anything in there worth keeping? / If it vanished tomorrow, what vanishes with it? The long placement comment `:492-504` ("directly after the H2, before the first p, because .blog-content h2 has no clear:both") must move with it. A "try this tonight" box can reuse `GutCheckAside` (props `title/subtitle/questions`) or be a new component.
- One-link rule comments: header `:69-70` ("exactly one, to EKUZO 101 (inside the Minecraft section). The listening-project calendar CTA is the piece's final beat"), `:35-37` (EKUZO presence capped), FAQ scope comment `:159-166` ("no product link ... the one-link rule ... already spent on EKUZO 101"), inline `:595-597` ("The one product link on this page. Keep it single."). Update all four when swapping.
- EKUZO 101 link: `:599-604`:

> `the kids I coach through{" "}<Link href="/programs/ekuzo101">EKUZO 101</Link> play on a private, moderated server with the same faces, the same coach, and the same video and voice channel every week.`

  (`/programs/ekuzo101` exists: `app/programs/ekuzo101`.) Swap the link text/href to Season 01 (see §5), and keep the sentence true to Season 01 (it is a season, not "EKUZO 101"; memory says EKUZO101 is no longer pushed, Season 01 is the one product).
- Muhammad's calendar link: `const LISTENING_CALENDAR = "https://calendar.app.google/mMJ5KoxcNdH6SR13A"` (`:130`), used at `:672-678` ("Put 20 minutes on my calendar"). **Checked today with curl: HTTP 200**, redirects to `calendar.google.com/calendar/appointments/schedules/AcZssZ1adg_tb7ElqbtT-42zsx6KrwTwmX337rjc8bHS2tdigbxkVOopluX0laM3MRkYwvkT5uUHj7FI`. The page loads; I cannot confirm open slots or that the schedule is still accepting bookings, needs a browser look.
- FAQ: `FAQ_ITEMS :167-189`, 5 items (Should parents ban Fortnite? / What happened after Casey banned Fortnite? / What should parents do after banning a child's favorite game? / Should parents judge video games individually instead of limiting total screen time? / Are video game age ratings enough ...). Rendered `:696-702`; schema `:278` area. Answers are drawn only from the piece (scope rule `:159-166`); the FTC settlement is in the post already.
- Sources: `SOURCES :134-152`, 3 items: FTC Epic order (Dec 2022), Coyne et al. 2016, Columbia 2025. Rendered `:704-717`. A facts box with "rating" and "Epic's parental controls" needs 1-2 new source rows; FTC settlement is already source #1.
- Keep Reading: `KEEP_READING :193-216` = gaming-military-families, what-homeschool-parents-taught-us, what-your-kids-gaming-is-telling-you. Section `:735-783`; no FooterBanner (`:784`). Add the new post here and keep 3 (swap out homeschool).
- Existing outbound to the new post's topic: the "Related:" paragraph `:718-728` ends "...parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up." The natural place for the two-way link (point at the new post instead of or next to the gaming-study link) is the final paragraph of "What she actually did", or this Related paragraph (it is after Sources, awkward but existing).
- Hero comments `:20-100` are a long provenance/consent record; do not disturb.
- Em dashes in this file: 12 (all in comments per the header; verify with the lint before ship).

## 7. League post (`app/blog/league-of-legends-youth-development/page.tsx`, 781 lines)

- `TITLE "Is League of Legends OK for kids? Why we coach it"` (`:20`, plain `title: TITLE` so layout template applies), `DATE_PUBLISHED 2026-05-16`, `DATE_MODIFIED 2026-10-13` (`:27-28`), hero/share `blog-post-4-hero.jpg`/`-card.jpg` (identical 92 KB 1232x528 files), OG image declared 1232x528 (`:76-80`). Byline karlin-oei (`:200`). Has `ProgramLine` (`:622`) and an Instagram embed + VideoObject schema. Also a `FooterBanner` at `:777`.
- Answer block: first `<p>` after BlogPostBody opens at `:200`, comment `:201-202` "Answer block ... Do not wrap under a heading"; the paragraph runs `:203-246`. **Facts box placement: directly after this paragraph (before `<h2>` at `:247`)**, the same slot a "Short answer" occupies. No H2 above it.
- H2s: 247 Is League of Legends really that toxic? / 279 Basketball meets chess / 307 What makes League the right game for a coaching system? / 348 What League gave me / 376 League is like life / 399 Why not Fortnite, Minecraft, Roblox, or VALORANT? / 439 Why do kids love League of Legends? / 530 What did the Jynxzi tournament teach us about League? / 569 How does EKUZO handle League's toxicity problem? / 595 The game is the arena. The system is the work. / 631 FAQ.
- FAQ: `FAQ_ITEMS :31-60` (5 items: toxic, appropriate for kids, why League vs Fortnite/Minecraft/Roblox, skills, does my kid need to know League), schema from the same array. Rendered at `:631-728` as `<h2>FAQ</h2>` + bold-lead `<p>`s (not h3, and **hand-written separately from the array**, so edits must be made in both places or they drift). Closing paragraph `:713-728` links the gaming-study post.
- Existing claims to reconcile with the facts box:
  - ESRB: `:41` and `:651-668`: "League is rated ESRB Teen for fantasy violence", linked to `https://www.esrb.org/ratings/27518/league-of-legends/`. The handoff box says ESRB T with Blood, Fantasy Violence, Mild Suggestive Themes, Use of Alcohol and Tobacco; online interactions not rated. The current text names only fantasy violence: incomplete against that list, needs an on-the-day check.
  - Riot behaviour systems: `:36`, `:577-584`, `:637-645`: link to `https://support-leagueoflegends.riotgames.com/hc/en-us/articles/115008474148-League-of-Legends-Honor-Guide` (the old support domain; the v6 draft cites the current `support.riotgames.com/en-us/league-of-legends/rewards/league-of-legends-honor-guide`, updated 2026-05-31). **Unsourced stat at `:36` and `:645`: "keep repeat-offense rates under 10% inside the same year"** (Rule 1: needs a source or removal). Honor/penalty wording to add: active penalty lowers honor; Honor 1 to 2 lose some chat and Ranked Season Rewards; leaver penalties cause queue delays and lockouts (AFK FAQ).
  - Riot Terms s.1.1 (minor with parent's consent): not present anywhere in the page today (`grep` for "Terms", "consent", "parent" found none in the League post besides generic parent mentions).
  - "65% of competitive college esports players are STEM majors" (`:704-706`) is also unsourced in-page.
- Keep Reading starts `:733`; league `date` in `/blog` index is "October 13, 2026" (`app/blog/page.tsx:136`) and sitemap `2026-10-13` (`:121`).

## 8. Inbound-link candidates for the new post (exact current text)

| Post | Where | Current sentence(s) | Note |
|---|---|---|---|
| gaming-study | FAQ item `:171-178` | Q: "How do I get my kid off the game without the attitude?" A (2 strings): "Set the end before the start, and make the ending part of the activity instead of an interruption to it. Teams and coaches do this for sports without anyone thinking about it." / "It's the single most useful thing I've borrowed from sports, and the reason my sessions have a schedule a kid can see." | FAQ answers render as plain `<p>{text}</p>` (`:634-638`) and feed schema as plain text. To link, either add a third string with a link (needs JSX rendering change) or put the link in the body paragraph at `:612-629` ("If your kid's version of that conversation is the Fortnite fight, ... one mom's account ..."). Simplest: add one sentence there plus extend the FAQ to render a trailing `<p>` with a `<Link>` outside the schema array |
| what-your-kids-gaming | "Logging off turns into a fight" H2 `:440`; closing para `:462-467` | "Watch the shape of the resistance. Is this a kid who can't stop anything, or a kid who's fine putting most things down but goes to war over this one? The first points toward impulse. The second usually points toward meaning. Telling them apart matters more than winning the argument over the clock." (`:462-467`) | Add a sentence after it, or after the paragraph at `:443-457` |
| should-you-ban-fortnite | Related paragraph `:718-728`; or end of "What she actually did" `:605-615` | "...parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up." | This is the two-way link; also in this task's scope |
| when-gaming-helps-homeschool-kids | "What can you do at home?" list item `:343-348` and the follow-up `:359-361` | "Give it a goal. Practicing toward something, a match, a project, a skill, gives the hours a point and a natural place to stop." then "That last one is small, and it's the one most parents skip." | Link "a natural place to stop" or add a sentence after `:361`. Page has `GutCheckAside` right after the H2 (`:326`); don't reorder |
| should-i-buy-my-kid-robux | `:567-581` | "Weighing a ban instead? Here's how one family handled Fortnite. For the bigger picture, read what your kid's gaming is telling you, or ask one of our coaches." | Add a short clause for the "when it's gone / ending the session" angle; Robux step 5 (`:508-511`) "Agree in advance what happens when it's gone" is another natural spot |

Each edit changes that post's `DATE_MODIFIED`, the card `date` in `app/blog/page.tsx`, and the sitemap `lastModified`. Robux and the others currently show Updated 2026-10-26. Jamie approves the sentences.

## 9. Test, lint, typecheck, build

`package.json` scripts: `dev`, `build` (`next build`), `start`, `lint` (`eslint`, flat config `eslint.config.mjs`), `test` (`node scripts/run-tests.mjs`, runs `lib/**/__tests__/*.test.ts` with `node --test`; today only `lib/__tests__/` (3 files) and `lib/season1/__tests__/`), `test:s1`, `prepare` (husky), plus `s1:*` ops scripts. **No typecheck script**; `.husky/pre-commit` only blocks files over 10 MB. There is no blog-specific test, so the blog gates are lint, `tsc`, rendered-text diff, and manual checks.

- `npx tsc --noEmit -p .`: ran once, finished in 11.6 s with **no errors** (clean at `3433a5b`).
- `npx next build`: not run. `app/layout.tsx:2` imports `Inter` from `next/font/google`, which fetches from Google Fonts at build time, so a build in a network-restricted sandbox is likely to fail unless the proxy allows `fonts.googleapis.com`; Netlify builds with `npm run build`. Use `next dev` plus curl for rendered HTML instead, or try the build with the proxy and treat a font error as environmental. Also note `next.config.mjs` and a stray `next.config.ts` both exist at the repo root (`ls`), worth knowing before debugging config.
- `/audit` and `docs/ai-optimization-checklist.md` exist; `docs/robux-post/` holds the prior run's artifacts (`01-requirements.md`, `03-decision-log.md`, `04-evidence-ledger.md`, `05-defect-log.md`, `ai-optimization-checklist-run.md`, `evidence/`, `reviews/`, `screenshots/`) to mirror. `docs/session-end-post/` has `01-requirements.md` and empty `evidence/ reviews/ screenshots/`.

## 10. Images, and the pull-quote

Convention: files directly in `public/images/`, flat names `<slug>-hero.jpg` and `<slug>-card.jpg` (+ `-share.jpg` for Fortnite). Robux: hero `/images/should-i-buy-my-kid-robux-hero.jpg` (1916x809, `HERO_IMAGE` `:46`, rendered `fill` at 520px high), card `/images/should-i-buy-my-kid-robux-card.jpg` (1200x630; used as `SHARE_IMAGE` for OG, Twitter, schema `image`, the `/blog` card and Keep Reading card). In-body art `/images/robux-one-game-two-things.png` (1080x1350). Gaming-study: hero 2400x1260, card 1200x630.

Assets ready for the new post, in `/mnt/user-data/uploads/EKUZO/Marketing/content-drafts/assets/` (not yet in `public/`): `get-kid-off-hero-text.jpg` 1232x520, `get-kid-off-hero-clean.jpg` 1232x520, `get-kid-off-card-text.jpg` 1200x630, `get-kid-off-d2-source-logo-removed.png` 1400x933, `get-kid-off-hero-render.js`. Hero is 1232x520 = exactly the 520px-high / 1232px-wide container ratio. Suggested names: `public/images/get-kid-off-video-games-hero.jpg`, `...-card.jpg`. Hero alt text must describe the image (AI imagery, no real kid). The AI-imagery note applies to alt text and any caption.

Pull-quote: no component. Cleanest option is a small server component in `components/blog/` (e.g. `PullQuote.tsx`) built from `div`/`p`-free markup (use `figure`/`div`+`span`, same reason as `GutCheckAside`: `.blog-content p/blockquote` rules cascade into children and would restyle it), or inline styled `div` with `role="note"`. Alternatively reuse `<blockquote>` and accept the stock red-rule style, but the handoff asks for a styled callout. Aaron owns components/globals.css: a new file in `components/blog/` is additive, but the handoff says note it in WORKLOG.

## 11. Open questions for the PM / Jamie

1. In-body Season 01 link target: `/season1?utm_...` (recommended), `/season1/join/b`, or a popup-opening button? All `/season1*` pages are noindex.
2. League and Fortnite facts box: no `FactsBox` component exists. Build one shared server component (`components/blog/FactsBox.tsx`, div/span only) or two inline blocks? Recommend one shared, also usable on the new post if it needs a "fast facts" box.
3. `/blog` card image for the new post: grid crops 1200x630 to 16:10; text baked into `get-kid-off-card-text.jpg` will be clipped at the sides in the grid. Pick text vs clean after a 16:10 crop test (Jamie already chooses text or clean for the hero).
4. League FAQ is duplicated hand-written text vs `FAQ_ITEMS`; any FAQ edit needs both. The unsourced "under 10%" and "65% STEM majors" claims should be sourced or cut when the honor wording is touched (Rule 1).
5. Does `AuthorPage.tsx` read the `posts` array from `app/blog/page.tsx` or its own list? Not traced; check before assuming the author page picks up the new post.
6. Fortnite: the "try this tonight" box and the moved five questions are the same content; confirm whether the old rail aside is moved (recommended) or kept as well, and whether the facts-box rating/Epic parental control facts get verified in a browser on the day (handoff says so).
7. llms.txt line 7 is out of date (founded 2021, Houston, three programs). Out of scope here; flag for Jamie.
