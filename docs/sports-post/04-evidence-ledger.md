# 04 Evidence ledger: "My kid doesn't like sports. What now?"

Sentry (independent verifier), 2026-11-11. Branch `blog/my-kid-doesnt-like-sports` at `5902d99`
(4 commits on `c07fca1`). Dev server at `http://localhost:3001` (not started or stopped by Sentry).
Nothing in `app/` or `public/` was changed, nothing committed, nothing pushed.

Scripts and raw output: `/tmp/claude-0/-home-claude/2a46da3c-f323-51a7-a194-c43bc0966c8f/scratchpad/sentry/`
(`extract.py`, `diffcopy.py`, `meta.py`, `pw.js`, `scroll.js`, `pw.out`, `rendered.txt`, `post.html`,
`blog.html`, `sitemap.xml`, `sentry-*.png`).

## Fail-closed guard

Every Playwright context registered `context.route('**/*')` first and aborted any hostname matching
`/(google-analytics\.com|googletagmanager\.com|analytics\.google\.com|doubleclick\.net|facebook\.com|facebook\.net|clarity\.ms|bing\.com)$/`.
As an extra margin Sentry also aborted `youtube.com`, `youtube-nocookie.com`, `ytimg.com`,
`googlevideo.com`, `google.com`, `gstatic.com`, `ggpht.com` (the embed's own beacons).

- Hosts aborted across all runs: `www.youtube.com` only (8 requests, the iframe document).
- Hosts allowed through: `localhost` only (395 requests).
- Collect requests that got through: zero (offender list empty).
- Why no analytics host was even attempted: `app/layout.tsx:24` sets
  `ANALYTICS_ON = process.env.S1_DEPLOY_CONTEXT === "production"`, so GA4, the Pixel and Clarity
  scripts are not in the dev HTML (`grep -c "googletagmanager\|clarity.ms\|fbevents" post.html` = 0).
  The `gtag`, `fbq` and `clarity` stubs set by `addInitScript` stayed intact (`dataLayer` stayed `[]`).

## Requirement rows

| ID | Result | Evidence |
|---|---|---|
| P1 | PASS | `curl -A Googlebot /blog/my-kid-doesnt-like-sports` = 200. Byline "by Karlin Oei, Founder of EKUZO". Category label "Guides", `article:section` = Guides. |
| P2 | PASS | `page.tsx` uses the template skeleton: same constants, metadata shape, `BlogPostBody`, Keep Reading, `FooterBanner`. Hero block differs by the approved change (picture, natural ratio). |
| P3 | PASS | Box is `GutCheckAside` with `title="Try this tonight"` (`page.tsx:364`), the same component and label as the session-end and Fortnite posts. Both quotes are `<blockquote>`; computed style equals the sibling (3px red left border, 20px pad, italic). No new component file in the diff. |
| P4 | PASS | First `<p>` in the body is "Short answer: nothing is wrong with your kid..." (`rendered.txt` line 3). |
| P5 | PASS | `public/images/my-kid-doesnt-like-sports-hero.jpg` is 2464x1040 and byte-identical to the asset (`cmp`). Alt equals the requirement text exactly. At 390 `currentSrc` is `...-hero-mobile.jpg&w=640`, at 1440 `...-hero.jpg&w=1920`; switch is at 768 (767 mobile, 768 desktop). Box aspect 1.2000 at 390 (image 1080/900 = 1.2000) and 2.3692 at 1440 (2464/1040 = 2.3692): within 1%. Mobile file is 1080x900. Note: the `<img>` has no width/height attributes; the wrapper's `aspect-[1080/900] md:aspect-[1232/520]` reserves the space. |
| P6 | PASS | `og:image` and `twitter:image` = `https://ekuzo.gg/images/my-kid-doesnt-like-sports-card.jpg`; local file returns 200, 1200x630; `og:image:width/height` 1200/630. |
| P7 | WITHDRAWN | Verified gone: no in-body image in the article; `/images/what-a-team-gives-a-kid.png` returns 404; file remains in `docs/sports-post/assets/`. |
| P8 | PASS | iframe `src="https://www.youtube.com/embed/RVkSj6AYCDs"`, `title="Not Into Traditional Sports? That's Okay."`, `loading="lazy"`, directly after the parent blockquote. 640x360 at 1440, 334x188 at 390 (16:9). YouTube oEmbed for the ID returns title "Not Into Traditional Sports? That's Okay.", author EKUZO. The text link to the video is kept. Note: the reference file named in P8 (`summer-camps-for-kids-who-game-2026`) is not on this branch, so the markup is a plain iframe. See D5. |
| P9 | PASS | Real `<ol>` with 4 `<li>`, `list-style-type: decimal`. Six H2s equal the deck, sentence case. |
| P10 | PASS | Keep Reading hrefs in order: sons, session-end, what-your-kids-gaming. All 200. See D4 for an apostrophe mismatch in the third title. |
| P11 | PASS | `/blog`: first post link is the sports post; one "Guides · Featured" badge; one `featured: true` in `app/blog/page.tsx:28` (the second grep hit at line 86 is a comment). Former featured post is `featured: false` with its comment updated. Card date "November 11, 2026" equals `DATE_MODIFIED`. |
| P12 | PASS | Sources text equals the deck. At 390 both URLs wrap inside the column (right edges 330 and 362 of 390); no element in the article overflows the viewport. Screenshot `sentry-sources-390.png`. |
| T1 | PASS | `<title>` = "My kid doesn't like sports. What now?" (absolute, no suffix). Meta description is 151 characters. `datePublished` and `dateModified` 2026-11-11 in JSON-LD and `article:*_time`. |
| T2 | PASS | `<link rel="canonical" href="https://ekuzo.gg/blog/my-kid-doesnt-like-sports">`; OG type article, url, site_name, locale, image with alt, authors, section; Twitter `summary_large_image`. `robots` index, follow. |
| T3 | PASS | In raw HTML: `BlogPosting` (Article subtype) with author `@id https://ekuzo.gg/#coach-karlin` (Karlin Oei Person node in the root graph), `BreadcrumbList` (Home, Blog, post), `FAQPage` with 5 questions. Schema Q and A strings equal the visible `<h3>` and `<p>` strings exactly (`meta.py`: "exact equal: True"). No VideoObject (allowed by T3; the existing `buildVideoObjectSchema` needs a transcript and a first-party thumbnail). |
| T4 | PASS | `sitemap.xml` has `https://ekuzo.gg/blog/my-kid-doesnt-like-sports` with lastmod 2026-11-11. `public/llms.txt:29` is `- [Title](https://ekuzo.gg/blog/slug): description`, same form as lines 30 and 31; `/llms.txt` returns 200. |
| T5 | PASS | `curl -A Googlebot`: H1, short answer, all H2s, the `<ol>`, both blockquotes, the box, FAQ and Sources are in the server HTML (`rendered.txt`). One H1. No duplicate IDs. Every `<img>` has an alt attribute. |
| T6 | PARTIAL: tsc, lint, tests PASS; build NOT RUN | `npx tsc --noEmit`: exit 0, no output. `npx eslint app/blog app/sitemap.ts`: exit 0, 0 errors, 2 warnings, both in `app/blog/[slug]/page.tsx` (unused `Nav`, `Footer`; file not touched by this branch). `npm test`: suite 1 `# tests 618 # pass 617 # fail 0 # skipped 1`; suite 2 (field-vitals) `# tests 5 # pass 5 # fail 0`; exit 0. `npm run build` was not run because the dev server is running and both write `.next`. It has to be run once the dev server is down (Atlas reported it passes only with a dummy `STRIPE_SECRET_KEY`, and that was before the hero change). |
| C1 | PASS (words), one order difference | `diffcopy.py`: 51 deck blocks against 51 rendered blocks, quotes normalised, markdown stripped. Word-level differences: none. H1, deck line, short answer, 7 H2s, every paragraph, both blockquotes, 4 list items, box title, subtitle and 3 items, 5 FAQ pairs, 2 sources all equal. Order: the box sits directly under its H2, before the three paragraphs it follows in the deck. See D2. |
| C2 | PASS | Zero U+2014, U+2013 or spaced hyphens in the rendered article text, and zero in any added line of `git diff c07fca1..HEAD -- app public` (includes the four inbound sentences and the llms.txt line). |
| C3 | PASS | All deck hrefs present. Internal: `/season1/join` 200 (href has no query string), `/blog/when-your-sons-only-friends-are-online` 200, `/blog/how-to-get-your-kid-off-video-games-without-a-fight` 200, `/blog/author/karlin-oei` 200. External (curl): projectplay.org 200 "State of Play 2025: Participation Trends - Project Play"; youtube `Pyicgs8RXnc` 200, oEmbed title "Your Kid's Into Video Games. We Make That a Good Thing." (EKUZO); youtube `RVkSj6AYCDs` 200, oEmbed title "Not Into Traditional Sports? That's Okay." (EKUZO); nytimes.com/athletic 403 to curl (blocks automated fetches, left for the human check, not a failure). External links carry `target="_blank" rel="noopener noreferrer"`. Note: `evidence/links.md` named in C3 does not exist; this row is the record. |
| M-GA4 page_view | NOT TESTABLE LOCALLY | GA4 loads only when `S1_DEPLOY_CONTEXT === "production"` (`app/layout.tsx:24,134`). |
| M-GA4 blog_read_75 | PASS | Scroll-only run (`scroll.js`), stubbed `gtag`: 0 events before scrolling; fires once, `["event","blog_read_75",{"post_slug":"my-kid-doesnt-like-sports"}]`, when 75.3% of the article has passed (1440) and 76.1% (390). Does not fire again on a second pass. |
| M-GA4 blog_link_click, `/season1/join` | PASS | Click with navigation prevented, URL unchanged: `["event","blog_link_click",{"post_slug":"my-kid-doesnt-like-sports","link_path":"/season1/join","link_type":"program"}]`. Also seen: in-body post link and Keep Reading card give `link_type:"post"`, byline gives `"author"`. |
| M-GA4 blog_link_click, outbound | FAIL (by design of the shared tracker) | Click on the projectplay.org link: no event captured. Not a stubbing artifact: `app/blog/BlogPostTracking.tsx:57` returns when `url.origin !== window.location.origin`, and its header comment says "same-site link". See D1. |
| M-Meta PageView | NOT TESTABLE LOCALLY | Pixel is behind the same production gate. `fbq` stub received no calls from the post itself. |
| M-Clarity | PASS (tags, stubbed); recording tag NOT TESTABLE LOCALLY | `clarity` stub received `["set","page_type","blog"]` and `["set","post_slug","my-kid-doesnt-like-sports"]` on load (twice in dev, which is React Strict Mode running the effect twice). The Clarity script itself is behind the production gate. |
| M-Attribution | NOT TESTABLE LOCALLY | Needs a real Season 01 popup lead on a production-context build; Sentry did not submit a lead. |
| M-Destination | NOT TESTABLE LOCALLY (source confirmed) | `app/layout.tsx:16` `G-8LM45PX53W`; Pixel ID and Clarity project `wml8wll5ua` in the same file. Not exercised at runtime. |
| N1 | PASS | `git diff --stat c07fca1..HEAD`: new post folder, `app/blog/page.tsx`, `app/sitemap.ts`, `public/llms.txt`, three new files in `public/images/`, `docs/sports-post/**`, plus the four inbound-link posts from the later approved commit `5902d99`. Nothing else. `WORKLOG.md` is not in the diff; see D3. |
| N2 | PASS | `/blog` and the four edited posts (which include all three Keep Reading posts) return 200 with no console errors at 1440 and 390. Each new sentence renders with correct spacing around the link (extracted text below). Each post's JSON-LD `dateModified`, `article:modified_time`, byline ("Updated November 11, 2026"), `/blog` card date and sitemap lastmod say 2026-11-11. Sentry did not do a pixel before/after comparison. |
| N3 | PASS | No `package.json` or lockfile change, no new file under `components/`, category "Guides" already existed. |

Inbound sentences as rendered:

1. sons: "...but the shape of it is familiar. If sports never clicked for your kid either, Karlin wrote about what to do when your kid doesn't like sports."
2. what-your-kids-gaming: "...slipped through everything else. I was one of those kids. Here's what I'd tell a parent whose kid doesn't like sports."
3. session-end: "...my coaches answer parent questions. And if your kid never clicked with a sport, read what a team gives a kid and where else to find one."
4. gaming-programs: "It's the model of a sports team. That matters most for a kid who doesn't like sports and still needs a team."

## Layout and console

| Check | Result | Evidence |
|---|---|---|
| Horizontal scroll | PASS | `documentElement.scrollWidth` = 390 at 390 and 1440 at 1440 (also 767, 768, 1024). `/blog` the same. |
| Box at 390 | PASS | 334px wide inside a 390 viewport, no child clipped or outside the box (`sentry-aside-390.png`). At 1440 it floats right, 340px, and ends 160px above the next H2. |
| Brush and H1 | PASS | At 390 the brush passes behind the H1 exactly as on the session-end post (same deco box, same overlap); at 1440 no overlap on either. |
| Link style | PASS | In-body links: red `rgb(249, 37, 36)`, no underline, weight 400, identical to the session-end post. |
| Heading order | PASS | H1, then H2s, FAQ questions as H3 under "Common questions". Keep Reading cards are H3 under a non-heading label, same as the template. |
| Console, post, 1440 and 390 | PASS (no errors) | No console errors, no page errors, no failed or 4xx/5xx requests other than the aborted YouTube iframe. Warnings: "Unrecognized feature: 'web-share'" (this post only, see D5) and the `blog-slug-right-deco.png` width/height warning (also on the session-end post). |
| Console, /blog, 1440 and 390 | PASS (no errors) | Warnings only: `fill` without `sizes` on every card image at 1440, the new card included; same code path as before this branch. |

## Defects

| # | Severity | Where | Observed |
|---|---|---|---|
| D1 | should-fix (decision) | `app/blog/BlogPostTracking.tsx:57` against the measurement table in `01-requirements.md` | The table asks for `blog_link_click` on one outbound link. The shared tracker ignores every cross-origin link by design, so no outbound click from any post is counted. The tracker is outside this run's allowed files. Either amend the requirement (outbound clicks are not tracked) or open a separate change to the tracker. |
| D2 | should-fix (decision) | `app/blog/my-kid-doesnt-like-sports/page.tsx:364` | The Try this tonight box is before the section's three paragraphs; the deck has it after them. On desktop it floats beside them. Below 1024px it is a full-width block, so a phone reader meets the box before "Everything my parents signed me up for was a fair guess...". This follows the component's placement rule and the sibling posts. It needs an explicit OK as a deviation from the copy deck order, or the box moves under the next H2 boundary. |
| D3 | should-fix | `WORKLOG.md` | Not updated in any of the four commits. `CLAUDE.md` says to update it before every commit. |
| D4 | nit | `app/blog/my-kid-doesnt-like-sports/page.tsx:64` | Keep Reading title "What your kid's gaming is telling you" uses a curly apostrophe (and so does the card image alt). The post's own title and its `/blog` card (`app/blog/page.tsx:71`) use a straight one, as do the other two cards in the same block. |
| D5 | nit | `app/blog/my-kid-doesnt-like-sports/page.tsx:437` | `allow="... web-share"` logs the console warning "Unrecognized feature: 'web-share'" on every load in Chromium. No other post logs it. Dropping `web-share` from `allow` clears it. |
| D6 | nit | `app/blog/my-kid-doesnt-like-sports/page.tsx:150-163, 246-252` | Hero loading differs from the template: the template's `next/image priority` emits a preload; the `<picture>` here has only `fetchPriority="high"` and no preload, and the hero is the likely LCP element. The desktop `sizes` ends in `1232px` but the box is at most 1024px wide (1232 minus 2 x 104 padding), so a 1x desktop screen downloads the 1920w file where 1080w would do. The `<img>` has no width/height attributes (no layout shift, since the wrapper reserves the space). |
| D7 | nit | `app/blog/my-kid-doesnt-like-sports/page.tsx:344` and `:88` | Quote marks are mixed: curly in both blockquotes and in Sources, straight around "Inception," and "one activity a season". The FAQ string is shared with the schema, which explains that one. |
| D8 | nit | `docs/sports-post/01-requirements.md` (Changes section, C3, Gates 1), `page.tsx:23-24` | Paperwork drift. (a) The Changes section gives the subtitle as "Three things before the next sign-up"; the deck and the page say "Three things to do before the next sign-up", and the same section says the wording still awaits Jamie's OK. (b) `evidence/links.md` named in C3 was never written. (c) Gate 1 asks for 375px screenshots; the committed ones are 390px, and the `v3-*` screenshots are untracked. (d) The page comment says `lib/schema.ts` has no builder for a YouTube embed; `buildVideoObjectSchema` exists but requires a transcript and a first-party thumbnail. |

Observations that are not defects: at 1440 the H1 wraps with "now?" alone on the second line; inbound sentence 3 makes two consecutive sentences that start with "And" (approved copy); a brand-new post's byline reads "Updated November 11, 2026" because `AuthorByline` always uses that label.

## Not done by Sentry

- `npm run build` (dev server running; see T6).
- Any check that needs a production-context build: GA4 `page_view`, Meta PageView, the Clarity recording tag, lead attribution.
- Human checkpoints: the hero in context, the YouTube embed on a real phone, the nytimes.com link in a browser.

## Lead follow-up (Fable, after Sentry)

- `npm run build` run after the dev server was stopped: passes (T6 now full pass).
- D2 kept as built: box directly after the H2 is the house pattern (Fortnite post placement comment).
- D1 closed by amending the requirement: the shared tracker skips cross-origin links on every post.
- D3 fixed (WORKLOG.md). D5 fixed (web-share removed from the iframe allow list). D8 fixed in 01-requirements.md.
- D4, D6, D7 left as nits: no effect on readers.

## Live (2026-11-11)

- Released to main as 737330f (fast-forward), serving on ekuzo.gg 14:55 CT. Post, /blog, four edited posts, three images, /season1/join: all 200.
- Live HTML carries GA4 `G-8LM45PX53W`, the Meta pixel and Clarity; BlogPosting, BreadcrumbList and FAQPage JSON-LD present; no noindex; sitemap and llms.txt list the URL.
- Clip B01 (youtu.be/xSWJuBNC62c) embedded after the Inception paragraph; watched and approved by Jamie.
- On Jamie's go: IndexNow sent six URLs (200 accepted); Search Console indexing requested for the new post 15:00 CT. Logged in the KB `company/marketing/search-console.md`.
- Not run on live: a click-through of events against the real GA4 property (the same code passed locally behind the guard).
