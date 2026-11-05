# 01 Requirements: session-end post, Fortnite refresh, League facts box (Run 2, 2026-11-04)

Owner: Fable (PM session). Source brief: KB `system/loops/handoffs/2026-10-24-ship-robux-and-session-end-posts.md` § Run 2.
Base: `origin/main` 3433a5b. Branches: `blog/get-kid-off-video-games` (this tree), `blog/fortnite-search-refresh`, `blog/league-facts-box`.

## Product (P)

| ID | Requirement | Acceptance |
|---|---|---|
| P1 | New post at `/blog/how-to-get-your-kid-off-video-games-without-a-fight`, byline Karlin Oei | 200, H1 "How do I get my kid off the game without a fight?", `BlogPostBody author="karlin-oei"` |
| P2 | Body renders the v6 copy of record exactly, "For your pass" block stripped | copy-fidelity diff: 0 unexplained deltas |
| P3 | Labeled short answer directly under the H1 block | present, first paragraph after the dek |
| P4 | Every H2 is the question from the copy of record | H2 list = copy H2 list |
| P5 | Match table is a real `<table>` with caption/headers, 6 rows | DOM check |
| P6 | "Dinner's in 35 minutes..." renders as a styled pull-quote callout (not a plain blockquote) | screenshot |
| P7 | The X parent quote renders as a blockquote with attribution | screenshot |
| P8 | FAQ (5 Qs) visible and feeding FAQPage schema, answers identical to visible text | schema diff |
| P9 | Sources list as in v6 (9 items), external links `rel="noopener"`, open in new tab per template | DOM |
| P10 | Keep Reading cards and FooterBanner `heading="Every gamer deserves a team"` as the template | screenshot |
| P11 | Hero 1232x520 and card 1200x630 from the approved assets, alt text approved | files in `public/`, OG/Twitter meta |
| P12 | New post takes `featured: true` on `/blog`; gaming-study post loses it and drops "recent" from its opening | `/blog` screenshot, diff |
| P13 | Inbound links (Jamie-approved sentences) from gaming-study FAQ, what-your-kids-gaming, should-you-ban-fortnite, when-gaming-helps-homeschool-kids, should-i-buy-my-kid-robux; each touched post gets its Updated date bumped | DOM + sitemap lastmod |
| P14 | Season 01 link(s) per Jamie's decision (approved sentence, approved target URL) | DOM |
| P15 | "Count matches, not minutes" share graphic 1080x1350, grey and blue, logo from site SVG, if Jamie says tonight | file + render |
| F1 | Fortnite: labeled short answer, H2s as questions, "Try this tonight" box (five questions moved up), facts box, EKUZO 101 link swapped to Season 01, link to new post; Muhammad's byline, narrative H1, title tag unchanged | diff vs approved copy deck |
| F2 | Fortnite facts verified on official pages on the day (URL, date, quote) | evidence file |
| L1 | League: facts box (ESRB, Riot Terms s.1.1, chat and privacy settings, honor and leaver penalties) and a link to the new post | diff vs approved copy deck |
| L2 | League facts verified on official pages on the day | evidence file |

## SEO and GEO (S)

| ID | Requirement | Acceptance |
|---|---|---|
| S1 | Title tag "How to get your kid off video games without a fight" (+ site suffix per template), meta description Jamie-approved 150 to 160 chars | head check |
| S2 | `alternates.canonical` set on the new post; unchanged on the two updated posts | head check |
| S3 | BlogPosting (Karlin as Person) + FAQPage + BreadcrumbList via `lib/schema.ts` only; `dateModified` bumped on updated posts | validator.schema.org 0 errors |
| S4 | Visible "Updated" date on all three posts matches schema dateModified and sitemap lastmod | 3-way match |
| S5 | `app/sitemap.ts` entry for the new post and real `lastModified` for every touched post | sitemap.xml check |
| S6 | `public/llms.txt` entry for the new post in plain sentences; no em dashes anywhere in llms.txt blog lines | grep |
| S7 | robots allows the post and `/_next/` | robots.txt check |
| S8 | `docs/ai-optimization-checklist.md` run for the new post | filed run |
| S9 | Internal links use no `utm_*` and no param named `source` | grep |

## Measurement (M), per build-loop § Measurement is part of done

| ID | Page | GA4 | Meta | Clarity | Attribution / destination |
|---|---|---|---|---|---|
| M1 | New post | page_view; `blog_link_click` on internal links (incl. Season 01 and /parents); `blog_read_75`; `faq_open` if the template fires it; Season 01 popup `generate_lead` credited to this `page_location` | Pixel PageView via shared layout (no new conversion events on blog) | recordings on, `page_type=blog`, `post_slug` tags | popup lead carries landing page + first touch into Klaviyo as today |
| M2 | Fortnite post | same as M1, Season 01 link click recorded | same | same | same |
| M3 | League post | same as M1 | same | same | same |

Journeys each must survive: (J1) arrival from Google organic on the post, read, click Season 01 link; (J2) arrival from a link preview (card) on social, popup sign-up; (J3) post to post via Keep Reading or inline link, no new session; (J4) return visit next day.
Must-not cases: page load, scroll past a link, FAQ programmatic open, and the popup's own render must not fire `blog_link_click` or `generate_lead`; an internal link must not start a new GA4 session (no utm, no `source`).

## Non-regression (N)

| ID | Protected | Acceptance |
|---|---|---|
| N1 | Other blog posts render unchanged except approved link sentences and dates | diff limited to approved lines |
| N2 | `/season1*`, commerce routes, `lib/season1/` zero diff | `git diff --stat` |
| N3 | Aaron's lane (components/, globals.css): no edits unless a callout component is required; if so, a WORKLOG note | diff |
| N4 | `d2-source.webp` and other untracked Mac files never staged (we build in a separate clone) | commit file lists |

## Copy (C)

| ID | Requirement |
|---|---|
| C1 | Zero em dashes, en dashes and spaced-hyphen clause dashes in all new or changed prose (rendered text and llms.txt) |
| C2 | No addiction framing in EKUZO's voice; the post never implies EKUZO treats or fixes anything |
| C3 | Child never named; no kid likeness except the approved AI hero |
| C4 | Facts in facts boxes match their sources sentence by sentence |

## Visual QA (V)

Screenshots at 375, 768, 1440 for each page and `/blog`; console clean in a real browser (browser-truth gate); fail-closed analytics proxy recorded before any functional test.

## Gates

Copy gate (Jamie) before build. Push and merge only on Jamie's go. Live verification against `origin/main` after deploy. Search Console and Bing submissions on Jamie's go.
