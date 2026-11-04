# 09. SEO, backlink and submission plan (session-end post ship, 2026-11-04)

Planning only. Nothing here is built, sent or submitted. Every external step (outreach, Search Console, Bing, IndexNow ping, GA4 admin) waits for Jamie's go. Code changes go through the Build Loop.

Pages in scope tonight:
- NEW `/blog/how-to-get-your-kid-off-video-games-without-a-fight` (copy of record v6)
- UPDATED `/blog/should-you-ban-fortnite`
- UPDATED `/blog/league-of-legends-youth-development`

---

## 1. Season 01 link strategy

**The problem.** Every Season 01 page is noindex (`/season1`, `/season1/join`, `/season1/join/b` send `x-robots-tag: noindex` or a meta noindex), and none is in `app/sitemap.ts`. Blog links to them convert, but no indexable page collects search equity for "youth gaming league" queries. `public/llms.txt` also has no Season 01 line; its Programs section still describes EKUZO Teams with Fall 2026 dates.

### (a) Tonight: in-body links

**Target:** `https://ekuzo.gg/season1/join` (the Season 01 front door that takes the sign-up). Relative href `/season1/join`, no query string. Before build, confirm with the ads session that `/season1/join` (not `/season1` or `/join/b`) is the current destination; this plan assumes it is.

**No parameters on the link, for three reasons found in the code:**
1. **No `utm_`** on internal links. They restart the GA4 session and pollute source/medium. This already happened once: 64 blog sessions showed source `header`, `sticky`, `hero` or `footer` because our own events sent a param named `source` (fixed 2026-10-26, now `cta_source` / `lead_source`, see `lib/analytics.ts` lines 18 to 24).
2. **`cta_source` would be dropped anyway.** `/season1/join` runs an address-bar allow list (`lib/season1/tags.ts`, `URL_ALLOW_KEYS`, C10): UTM keys, `gclid`, `fbclid`, `src`, `s1qa`. Any other key is removed with `history.replaceState` before any tag reads it.
3. **`src=blog` would be silently nulled.** `src` only accepts `karlin | email | friend | ad | direct` (`lib/season1/validate.ts`, `SRC_VALUES`). Do not use `src=karlin` because the post carries Karlin's byline: that value belongs to his creator link and would mix the two channels.

**How the click is still tracked tonight, with no new code:**
- Blog side: `BlogPostTracking.tsx` fires GA4 `blog_link_click` with `post_slug`, `link_path=/season1/join`, `link_type=program` (its `linkType()` already maps `/season1*` to `program`). It skips nav, header, footer and dialogs, so only the in-body link counts.
- Landing side: same GA4 property on both (`G-8LM45PX53W` in `app/layout.tsx` and `lib/season1/tags.ts`) on the same domain, so the session carries over. The join page keeps the full referrer (`referrerOrigin: false`), so `page_referrer` holds the post URL. Verify in GA4 DebugView on the deploy preview.
- The Season 01 popup on posts already credits leads to the post (`generate_lead` with `page_location`, confirmed 2026-10-26).

**Follow-up (code change, needs Jamie's go):** add `blog` to `SRC_VALUES` so orders carry `src=blog` into `s1_orders`, then switch blog links to `/season1/join?src=blog`. This is the only way to see blog-sourced *orders* in the Season 01 database rather than just clicks.

**Anchor text:** describe it, never "click here". For example "Season 01, our coached youth gaming league" or "a team with a coach and a set end time". The anchor wording is copy, so Jamie approves it.

**Where the links go tonight (one per page, in body):**

| Page | Placement | Note |
|---|---|---|
| New post | "Could a gaming coach be the missing piece?", the sentence "The end of every EKUZO session is on the schedule before anyone logs in" | Link wraps existing words; Jamie's copy is final, so the wording is his call at the gate |
| Fortnite | Replace the inline `/programs/ekuzo101` link ("kids I coach through EKUZO 101", about line 600) | Already in Run 2 scope |
| League | The section on how EKUZO handles solo-queue risk (stable teams, coached voice) | Copy to Jamie with the facts box |

### (b) Follow-up, not tonight: an indexable Season 01 explainer

**Recommendation: build it, at `/programs/season-01`** (not `/season-01`). All program pages live under `/programs/`, it slots into the existing breadcrumb schema, and it avoids a near-twin of `/season1` that people and analytics filters would confuse. The `/season1/*` ad landings stay noindex and stay Aaron's.

Scope in 5 bullets:
1. Server-rendered Next.js `page.tsx` inside `app/layout.tsx` (not a route-handler HTML file), indexable, with `alternates.canonical`, in `app/sitemap.ts` and `public/llms.txt`.
2. What Season 01 is in plain answer blocks: ages, games, team format, coach, weekly schedule, season dates and price pulled from `lib/season1/offer.ts` (single source, no hand-typed numbers).
3. Question-shaped H2s and an FAQ pulled from `ekuzo-faq-canon.md`, feeding FAQPage schema; a `Course` + `Offer` (or `Event` series) builder added to `lib/schema.ts`.
4. One primary CTA to `/season1/join?src=` (once `blog` or a new `site` value exists), so the explainer ranks and the noindex page converts.
5. Retarget every blog in-body Season 01 link to this page; it becomes the hub that all gaming-parent posts point to.

Queries it would aim at (volumes not checked; confirm in a keyword tool or GSC before building): `youth gaming league`, `esports league for kids`, `online gaming league for kids`, `kids esports team`, `coached gaming for kids`, `league of legends team for kids`, `esports for 10 year olds`, `kids esports league austin`, `esports club for kids seattle`.

---

## 2. On-page SEO checklist, tonight's three pages

### Titles and descriptions

| Page | `<title>` | Length | Description | Action |
|---|---|---|---|---|
| New post | How to get your kid off video games without a fight | 52 | In draft frontmatter | Check 150 to 160 chars; Jamie approves |
| Fortnite | Should you ban Fortnite? What happened when one mom did | 55 | 196 chars, truncates in results | Draft a 150 to 160 char version led by the new short answer; Jamie approves |
| League | Is League of Legends OK for kids? Why we coach it | 49 | 154 chars | Fine. Consider naming the ESRB T rating once the facts box is in |

The title template appends the site name; confirm the rendered `<title>` stays under about 60 characters.

### H2s match real queries

New post H2s already mirror queries. Map to watch in GSC:
- "Why won't my kid get off the game when I ask?" : `kid won't get off video games`, `five more minutes`
- "How long is a match in Fortnite, League of Legends and other games?" : `how long is a fortnite match`, `how long is a league of legends game`
- "How do I set a gaming limit my kid will actually follow?" : `gaming limits for kids`, `how much gaming is too much`
- "What do I say when it's time to get off the game?" : `how to tell my kid to get off the game`
- "What if my kid rages when the game ends?" : `kid rages when game ends`, `gaming tantrums`

Fortnite: body H2s renamed as parent questions (Run 2 item 2): `should I ban fortnite`, `is fortnite bad for kids`, `fortnite parental controls`, `what age is fortnite for`.
League: the facts box answers the visible query cluster (`league of legends age`, `lol age restriction`, `lol pegi`, `can a 11 year old play it`, `is league of legends coaching allowed`). Put the ESRB rating and the Riot Terms consent line in the first screen.

### Extractability

- [ ] Match-length table is a real `<table>` with `<caption>` ("Rough match lengths and where to stop") and `<th scope="col">`. Give it an `id="match-lengths"` so it can be cited by anchor.
- [ ] The 35-minute pull quote renders as styled text, not an image.
- [ ] The five-step checklist is a real `<ol>`.
- [ ] FAQ answers render in the HTML at load (not only after a click) and match FAQPage schema word for word.
- [ ] Short answer is the first paragraph after the H1 on all three pages (Fortnite gets a labeled one).
- [ ] Fortnite and League facts boxes are HTML text, not a graphic.
- [ ] `curl -A Googlebot` each live URL: H1, short answer, table and FAQ in the raw HTML.

### Images

- [ ] Hero alt on the new post: describes the scene, for example "A parent on the arm of the couch next to a kid on a headset, both watching the end of a match." No game text claims.
- [ ] OG and Twitter image = the 1200x630 card on all three.
- [ ] Share graphic, if it ships: alt lists the six games and stops in plain words.
- [ ] Explicit `width`, `height` and `sizes` on heroes (Clarity CLS 1.1 on blog sessions).
- [ ] League hero is still flagged "Placeholder asset" in the code (line 22); note it, do not fix tonight.

### Internal link graph (hub and spoke)

**Hub:** `/blog/what-your-kids-gaming-is-telling-you` (broadest parent question, already has a logoff-fight section). **Bridge to product:** `/blog/gaming-programs-for-kids`, later `/programs/season-01`.

Out of the new post (every link that should exist):

| To | Anchor location | Status |
|---|---|---|
| `/blog/should-you-ban-fortnite` | Coach section closer | In copy |
| `/blog/what-your-kids-gaming-is-telling-you` | Coach section closer | In copy |
| `/parents` | Coach section closer | In copy |
| `/season1/join` | Coach section, "on the schedule" sentence | Add, Jamie approves anchor |
| `/blog/league-of-legends-youth-development` | First "In League," in "They can't leave" | Add, Jamie approves |
| `/blog/should-i-buy-my-kid-robux` | FAQ "How do I get my kid off Minecraft or Roblox?" | Add, Jamie approves |
| Keep Reading cards: Fortnite, what-your-kids, League | Page furniture | Build |
| Riot AFK FAQ, Riot honor guide, AAP pages | External, from sources | In copy |

Into the new post (draft sentences, Jamie approves):

| From | Where |
|---|---|
| `gaming-study-13-7-years-younger...` | FAQ "How do I get my kid off the game without the attitude?" |
| `what-your-kids-gaming-is-telling-you` | Its logoff-fight sign |
| `should-you-ban-fortnite` | New try-this-tonight box, and the existing "get a kid off the game without the attitude" line (about line 726) |
| `league-of-legends-youth-development` | Facts box, leaver-penalty line ("why a kid can't quit a League match") |
| `when-gaming-helps-homeschool-kids` | Its routines or reflection section |
| `should-i-buy-my-kid-robux` | Closing or Keep Reading |
| `when-your-sons-only-friends-are-online` | Optional, "the same people repeatedly" passage |
| `/blog` | Featured slot (moves from Robux) |

Each page that gains a link gets its `DATE_MODIFIED` and sitemap `lastmod` bumped.

Fortnite and League also link to each other if a natural sentence exists (Fortnite compared against League is already in the League post).

---

## 3. Backlink assets from tonight's content

Ranked by likely links per hour of effort.

| Rank | Asset | Effort | Who links | What it needs |
|---|---|---|---|---|
| 1 | **Match-length table as a citable resource** | 0.5 h | Parenting writers, counselors, journalists answering "how long is a Fortnite match" | `id="match-lengths"` anchor; one line under it: "Rough lengths from our coaches' play. Cite as EKUZO, ekuzo.gg." Be honest that these are estimates, not measured data |
| 2 | **Printable family game plan (one page)** | 2 to 3 h | School counselor resource pages, PTA newsletters, homeschool lists, library guides | The five steps, the match table and a fill-in box ("Our number: __ matches. Last match starts by __."). Best as an indexable HTML page with print CSS (for example `/resources/family-game-plan`) plus a PDF; that is a new page, so a follow-up build. No logo-heavy selling on it; a small EKUZO mark and URL |
| 3 | **"Count matches, not minutes" share graphic, embeddable** | 2 to 3 h (not made yet; Aaron's lane, grey and blue) | Parent blogs, newsletters, Pinterest, school social | 1080x1350 PNG in `public/images/`, alt text, and the embed snippet below on the post |
| 4 | **Expert quote pack for journalists** | 1 h | Reporters on query services (section 4) | Two or three 20 to 40 word Karlin quotes drawn from the post (the "four people on the other side of the screen" idea; "count matches, not minutes"), his one-line credential, the post URL |
| 5 | **Quote card** ("Dinner's in 35 minutes. A League game takes 45.") | 0.5 h | Social shares; rarely a link | 1080x1080 in the house graphic system; good for owned social, weak for links |

Embed snippet for the graphic (brand anchor only; Google discounts keyword-stuffed widget links):

```html
<a href="https://ekuzo.gg/blog/how-to-get-your-kid-off-video-games-without-a-fight">
  <img src="https://ekuzo.gg/images/count-matches-not-minutes.png"
       alt="Count matches, not minutes: where to stop in Fortnite, League of Legends, Marvel Rivals, Smash, Minecraft and Roblox"
       width="1080" height="1350" loading="lazy">
</a>
<p>Graphic: <a href="https://ekuzo.gg/blog/how-to-get-your-kid-off-video-games-without-a-fight">EKUZO</a></p>
```

Never: paid placements, link exchanges, forum seeding (`blog-go-live-checklist.md` § Never).

---

## 4. Backlink target list

Org pages only. "Verified" means the page was found by web search on 2026-11-04; nothing was fetched or contacted. Every first touch is learner-first, asks to learn and not for distribution, and goes out only on Jamie's go. Minors are never contacted. Person-in-charge to person-in-charge where possible.

### Austin local

| # | Target and page | Page type | Why they'd link | Asset | First-touch angle (one line) |
|---|---|---|---|---|---|
| 1 | UT Karch Gaming Institute, https://moody.utexas.edu/kgi/home (verified) | University institute, news and resources | Youth and family gaming is adjacent to their research and outreach | Match table, Alsheail 2025 citation | Jamie has met the director: ask what research on kids stopping play he'd point parents to |
| 2 | UT esports arena / Longhorn Gaming (URL unverified) | Campus esports program | Family nights and youth outreach pages | One-pager | Ask Austin (arena manager, a friend) how families who visit ask about home limits |
| 3 | Austin ISD CTE and campus esports, e.g. https://akinsechs.austinschools.org/cte-programs/overview (CTE page verified; an AISD esports parent page not found, unverified) | District CTE and club pages | Club parents ask the same logoff question | One-pager | Ask Randy what his esports parents ask him most about home play |
| 4 | Austin PBS Smart Screen Time, https://austinpbs.org/education/smart-screen-time (verified) | Public media family media program | Its whole remit is family screen habits | One-pager, match table | Ask their education team which gaming questions parents bring to workshops |
| 5 | Austin Family magazine, https://austinfamily.com (verified; ran a Smart Screen Time column, https://austinfamily.com/smart-screen-time-may-2021) | Local parenting magazine | Needs practical, local expert columns | Quote pack, graphic | Offer Karlin as a source for any gaming or screen piece, no pitch attached |
| 6 | Austin Moms, https://austinmoms.com (verified; screen time post https://austinmoms.com/2018/01/30/screen-time-2/) | Local parent blog | An old screen time post is ripe for a refresh | Graphic, one-pager | Ask whether their readers still write in about screen time and what's changed since 2018 |
| 7 | Alt Ed Austin directory, https://www.altedaustin.com/alternative-school-directory/lake-travis-stem-academy (verified listing format) | Alt-ed and microschool directory | Resource and provider listings | One-pager; Season 01 listing | Ask the editor what alt-ed families ask about gaming; ask about listing criteria |
| 8 | Lake Travis STEM Academy, https://ltstemacademy.squarespace.com (verified) | Microschool news and parent resources | Kori runs a STEM community with gamer kids | One-pager | Ask Kori how her families handle game time during the school day versus home |
| 9 | Texas Esports Collective (URL unverified) | Regional esports org | Member families and coaches | Match table, quote pack | Ask Aaron Jaggers what he hears from parents of younger players |
| 10 | Region 13 ESC, Texas Esports Education Summit, https://esc13.net/events/texas-esports-education-summit (verified) | Regional education service center event | Educators share parent resources | One-pager, talk | Ask the organizer what topics school esports leads want covered for parents |
| 11 | Central Texas ISD counselor parent-resource pages, e.g. https://sites.google.com/roundrockisd.org/caraway-counseling/parent-resources and https://sites.google.com/leanderisd.org/rbmscounseling/mental-health-resources (verified page type) | School counselor resource lists | They curate free, practical parent handouts | One-pager | Ask what gaming questions reach the counselor's office; offer the one-pager with no ask |
| 12 | Austin Public Library teen and tween programs, https://library.austintexas.libguides.com (verified domain; a gaming guide page unverified) | Library guides | Libraries run teen gaming and LAN events and keep parent guides | One-pager | Ask the teen services team how parents react at gaming programs |
| 13 | Lamar Middle School and McCallum High School PTA newsletters (URLs unverified) | PTA newsletters | Age fit (10 to 13 core) and Jamie is a neighborhood parent | One-pager | Offer a short parent tip as a neighbor, not a vendor |

### National

| # | Target and page | Page type | Why they'd link | Asset | First-touch angle |
|---|---|---|---|---|---|
| 14 | NASEF, For Parents and Guardians, https://www.nasef.org/parents (verified) | Esports-education org parent page | Curates parent resources; already cited in our posts | Match table, one-pager | Ask what parents ask NASEF most about home play |
| 15 | School esports parent-resource pages, e.g. https://sites.google.com/fjuhsd.org/lvls-esports/parent-esports-resources and https://sites.google.com/cesa10.org/esports/educational-resources (verified) | District and agency esports resource lists | Lists of parent links; ours fills the home-routine gap | One-pager, match table | Ask the coach what home question club parents bring to them |
| 16 | Orange County Dept. of Education, esports guide for parents, https://newsroom.ocde.us/esports-guide-for-parents-here-are-5-answers-to-common-questions/ (verified) | Agency explainer | Could add a "managing it at home" link | Match table | Ask whether parents followed up with home-limit questions |
| 17 | FOSI Good Digital Parenting resources, https://fosi.org/good-digital-parenting-resource/resources (verified) | Nonprofit resource library | Curates practical parent tools | One-pager | Ask what gap they see in gaming-specific parent guidance |
| 18 | ParentMap (Seattle, EKUZO's second metro), https://www.parentmap.com/raising-kids/top-tips-introduce-young-kids-video-games/ (verified) | Regional parenting media | Writes gaming how-tos for parents | Quote pack, graphic | Offer Karlin as a source for an older-kid follow-up to that piece |
| 19 | The Homeschool Mom local directory, https://www.thehomeschoolmom.com/local/triangle-esports-academy/ (verified listing format) | Homeschool provider directory | Lists esports providers by city | Season 01 listing | Ask how listings are chosen; list Austin and Seattle |
| 20 | Homeschool.com resource articles (specific page unverified) | Homeschool resource hub | Publishes gaming-and-homeschool pieces | One-pager | Ask what their readers ask about gaming at home |
| 21 | KIT HCI group, the Alsheail et al. disengagement study, https://hci.iar.kit.edu/230.php (verified) | Research project page | Research groups list coverage of their work | Post itself (it cites them) | Tell them how we applied the study; ask what parents most often misread |
| 22 | The Gamer Educator, https://thegamereducator.substack.com and That Digital Dad, https://thatdigitaldad.substack.com (verified) | Parent and educator gaming newsletters | Write on kids and screens weekly | Match table, quote pack | Reply to a post with a real question, then share the table if it fits |
| 23 | ESRB Family Gaming Guide, https://esrb.org/tools-for-parents/family-gaming-guide/managing-screen-time (verified) | Industry parent guide | Long shot; they rarely link out | Match table | Low priority; only via a warm intro |

### Journalist query services

| # | Service | Why | Asset | Angle |
|---|---|---|---|---|
| 24 | Featured (acquired HARO from Cision, April 2025 per search results; featured.com, unverified page) | Reporters request parenting and screen-time sources | Quote pack | Answer only queries on kids, gaming and screens, one specific insight each |
| 25 | Qwoted and Source of Sources (qwoted.com, sourceofsources.com; unverified pages) | Same, different reporter pools | Quote pack, match table | Same rule: help finish their story, no pitch |

Order of work: 1, 4, 14, 11 and 3 first (warmest or best asset fit), then 24 and 25 as an ongoing weekly 20 minutes.

---

## 5. Submission plan after deploy (each on Jamie's go)

**Verify first:** each URL returns 200, `curl -A Googlebot` shows the H1, short answer, table and FAQ; validator.schema.org shows 0 errors on BlogPosting, FAQPage and BreadcrumbList; sitemap shows new `lastmod` values; llms.txt has the new post entry in plain sentences.

**Google Search Console** (`sc-domain:ekuzo.gg`, built-in browser as team@ekuzo.gg):
1. URL Inspection, then Request indexing, in this order (daily quota hit on 2026-10-13 at about 10):
   1. `/blog/how-to-get-your-kid-off-video-games-without-a-fight` (expect "URL is not on Google")
   2. `/blog/should-you-ban-fortnite`
   3. `/blog/league-of-legends-youth-development`
   4. `/blog` (featured slot changed)
   5. If quota allows: the posts that gained an inbound link sentence (gaming-study, what-your-kids, when-gaming-helps-homeschool-kids, robux)
2. Sitemaps: resubmit `https://ekuzo.gg/sitemap.xml` and read its status (it read "Couldn't fetch" for a while after 2026-10-12).
3. Annotation (right-click the Performance chart, find "Add annotation" in the same batch): "2026-11-04: session-end post live; Fortnite and League updated (short answer, facts boxes); Season 01 in-body links".

**Bing Webmaster Tools** (imported from GSC 2026-10-26): URL Submission for the same URLs (quota 100 a day).

**IndexNow: the site does not support it today** (no key file in `public/`, no IndexNow code in the repo). Minimal setup, a code change that needs Jamie's approval through the Build Loop:
1. Generate a key (32 hex characters) and add `public/<key>.txt` containing only the key.
2. After deploy, one POST to `https://api.indexnow.org/indexnow` with `{"host":"ekuzo.gg","key":"<key>","keyLocation":"https://ekuzo.gg/<key>.txt","urlList":[...]}` (the ping is an external write, Jamie's go).
3. Recommendation: defer. Bing URL Submission already covers a site this size; IndexNow pays off once posts ship weekly. Not a blocker tonight.

**Clarity AI Visibility:** open the citation dashboard (on since 2026-10-24, 0 citations); note the baseline for the three URLs and add them to the weekly read. Bing Webmaster Tools AI Performance has never been checked; look once while signed in.

**Records:** add all three URLs to the 2026-11-09 re-check in `knowledge-base/company/marketing/search-console.md`, append a dated note there, and log the requests in WORKLOG.

**Re-check dates:**
- 2026-11-09: indexing re-check (existing). Is the new post indexed? Did League and Fortnite recrawl with the new dates?
- 2026-11-18: two-week read (section 6).
- 2026-12-02: four-week read, folded into the first-week-of-December monthly GSC review.

---

## 6. SEO tracking: what to watch

Baselines (Oct 13 to 23, `01-blog-data-2026-10-24.md`): League 255 impressions, position 6.0, CTR 0.4%; Fortnite 3 impressions; all blog impressions came through AI features.

### Search Console (Performance and Generative AI reports, page filter `page=!<url>`)

| Page | Queries to watch (regex on `query=~`) | 2 weeks (11-18) | 4 weeks (12-02) |
|---|---|---|---|
| New post | `get.*(kid|child|son|daughter).*off.*(game|video games|fortnite|roblox|minecraft)`, `five more minutes`, `can.?t pause`, `how long.*(fortnite|league|marvel rivals|smash).*(match|game)`, `(rage|tantrum|meltdown).*game`, `gaming limit` | Indexed; any impressions in the Generative AI report | 100+ impressions; first visible non-brand queries; position under 10 on at least one |
| Fortnite | `ban fortnite`, `fortnite.*(bad|safe|age|parental control|rating)` | Recrawled with new date | Impressions up from 3; CTR on any visible query |
| League | `league of legends.*(kid|age|child|pegi|esrb|rating|ok)`, `lol.*(age|pegi)`, `coaching allowed`, `11 year old` | Recrawled; position holds near 6 | CTR above 0.4% (the facts box and description are the test) |

Use the brand/non-brand saved view in `search-console.md` to keep "karlin oei" and "ekuzo" out of the read.

### GA4 (property 393071476; internal and developer traffic filters active)

- Landing page = each URL, Organic Search and AI Assistant channels: sessions, engaged sessions.
- `blog_read_75` by `post_slug` (does the long post get read?).
- `blog_link_click` with `link_type=program` and `link_path=/season1/join` by `post_slug` (Season 01 click-through from each post).
- `generate_lead` with `page_location` containing each slug (popup leads credited to the post).
- `/season1/join` page views with `page_referrer` containing `/blog/` (cross-check of the click events).
- Sanity check: no new sessions with source `header`, `sticky`, `hero`, `footer` or `blog` (would mean a param leaked onto an internal link).

### Clarity (project wml8wll5ua)

- Filter by tag `post_slug=<slug>`: scroll depth (blog average 53.6%), dead clicks on the table and the pull quote (blog-wide 20% of sessions), quick backs.
- Performance on the new post (blog LCP 4.1 s, CLS 1.1 baseline).
- AI Visibility: citations for any of the three URLs; referrers chatgpt.com, perplexity.ai, copilot.microsoft.com.

### Decision triggers

- New post not indexed by 11-18: check URL Inspection for the reason, add one more inbound link from an indexed post, re-request once.
- League CTR still near 0.4% at 12-02 with position under 7: rewrite the meta description around the age and rating answer.
- Season 01 clicks from posts above zero but no orders traceable: prioritize the `src=blog` follow-up and the `/programs/season-01` explainer.
