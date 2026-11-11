# 01 Requirements: "My kid doesn't like sports. What now?"

Build Loop run, 2026-11-11. Lead: Fable (Claude, PM). Branch `blog/my-kid-doesnt-like-sports` off
`origin/main` at `c07fca1`. Loop spec: `knowledge-base/company/agents/agent-loop/build-loop.md`.
Sibling run to copy from: `docs/session-end-post/` (read its `00-scout-map.md` first; it maps the
blog template, the /blog registry, sitemap, llms.txt and tracking).

Copy of record: `docs/sports-post/02-copy-deck.md` (Jamie approved the copy 2026-11-11 08:38 CT:
"they look good", after v5). Atlas transcribes it; nobody rewrites it. Any copy change routes to
Fable.

## Product

- P1. New post at `/blog/my-kid-doesnt-like-sports`, byline Karlin Oei, category **Guides** (an
  existing category; no new category).
- P2. Template: `app/blog/how-to-get-your-kid-off-video-games-without-a-fight/page.tsx`. Same
  skeleton, constants, metadata shape, `BlogPostBody`, Keep Reading and FooterBanner.
- P3. Sibling posts match: the "Try this tonight" box is the same element, label and form as on
  the session-end and Fortnite posts. Both quotes use the house blog `blockquote`. No new visual
  component of any kind.
- P4. First paragraph after the header is the "Short answer" paragraph (the title asks a question).
- P5. Hero: `docs/sports-post/assets/my-kid-doesnt-like-sports-hero.jpg` (2464x1040) copied to
  `public/images/`, rendered with the same hero block as the template, explicit sizes. Alt: "Karlin
  Oei as a teenager in a white concert shirt, beside a photo of his college esports team with their
  hands together before a match."
- P6. Share image (OG and Twitter): `my-kid-doesnt-like-sports-card.jpg` (1200x630).
- P7. In-body graphic: `what-a-team-gives-a-kid.png` (1080x1350) directly under the numbered list
  in "What does a team give a kid?", using the template's in-body image block (max width 560px).
  Alt: "What a team gives a kid: the same people every week, a coach who knows them, a season that
  builds to something, and a job other kids count on." Jamie will judge this one in the preview and
  may cut it; keep it a single removable block.
- P8. Video: embed EKUZO's YouTube video `RVkSj6AYCDs` ("Not Into Traditional Sports? That's
  Okay.", 57 seconds) directly under the parent quote in "Could a video game team be your kid's
  team?", using the same embed markup as `app/blog/summer-camps-for-kids-who-game-2026/page.tsx`
  (youtube embed iframe), with a title attribute and lazy loading. The text link to the video in
  the copy stays.
- P9. The numbered list is a real `<ol>`. Every H2 is the question in the copy deck, sentence case.
- P10. Keep Reading cards: `when-your-sons-only-friends-are-online`,
  `how-to-get-your-kid-off-video-games-without-a-fight`, `what-your-kids-gaming-is-telling-you`.
- P11. `/blog` index: new entry first, `featured: true`; the current featured post goes to
  `featured: false` with its comment updated. Card date equals `DATE_MODIFIED`.
- P12. Sources section as in the copy deck, long URLs wrapping at phone width.

## Technical, SEO and schema

- T1. Constants: `SLUG = "my-kid-doesnt-like-sports"`; `TITLE_DISPLAY` = the H1;
  `TITLE_SEO` = "My kid doesn't like sports. What now?" (absolute title);
  `DESCRIPTION` = "Fewer than half of kids play a team sport regularly. What a team gives a kid,
  where else to find it, and how to start with what your kid already loves." (150 to 160
  characters; count it and trim to fit without changing meaning);
  `DATE_PUBLISHED` and `DATE_MODIFIED` = 2026-11-11.
- T2. `alternates.canonical`, OpenGraph and Twitter metadata as the template.
- T3. JSON-LD from `lib/schema.ts` only: Article (author Karlin), Breadcrumb, FAQPage. Visible FAQ
  text equals the schema text word for word. Add a VideoObject only if `lib/schema.ts` already has
  a builder that fits a YouTube embed; otherwise skip and note it.
- T4. `app/sitemap.ts` gains the URL with today's lastmod. `public/llms.txt` gains one line in its
  blog index in the same form as the others.
- T5. Server-rendered: H1, short answer, all H2s, the list, both quotes and the FAQ are in the raw
  HTML (`curl -A Googlebot`).
- T6. `npm run build` passes; lint and typecheck pass; the existing test suite runs and its output
  goes in the ledger.

## Copy integrity

- C1. Rendered text equals the copy deck (Sentry runs a copy-fidelity diff). Straight versus curly
  quotes follow the template's convention.
- C2. Zero em dashes, en dashes used as clause dashes, or spaced hyphens in anything this build
  adds.
- C3. Links: every href in the copy deck is present and resolves (internal 200; external opened
  and title recorded in `evidence/links.md`). `/season1/join` carries no query string.
  nytimes.com may block automated fetches; record that and leave it for the human check.

## Measurement (inherits the shared blog layout)

| Row | Requirement |
|---|---|
| GA4 | `page_view`; `blog_read_75`; `blog_link_click` with `post_slug`, `link_path`, `link_type` for the in-body `/season1/join` link (type `program`) and for one outbound link |
| Meta | PageView from the shared layout |
| Clarity | recording tag present, post tagged as the other posts are |
| Attribution | Season 01 popup lead from this post carries `page_location` of the post |
| Destination | GA4 property `G-8LM45PX53W`, the site's Meta pixel, Clarity project |

Sentry proves these locally behind the fail-closed guard (collect hosts stubbed by host regex,
offender check empty). No beacon may reach GA4, Meta or Clarity from QA.

## Non-regression

- N1. No file outside this list changes: the new post folder, `app/blog/page.tsx`,
  `app/sitemap.ts`, `public/llms.txt`, `public/images/` (three new files), `WORKLOG.md`,
  `docs/sports-post/**`. Inbound-link edits to other posts are a separate, later commit after
  Jamie approves each sentence (`03-inbound-links.md`).
- N2. `/blog` and the three Keep Reading posts render as before (screenshot before and after).
- N3. No new dependency, no new component, no new category.

## Gates (artifact, not assertion)

1. `screenshots/` holds the post at 1440 and 375 (full page) and `/blog` at 1440 before any
   reviewer spawns.
2. Browser console clean on the post and `/blog`.
3. Test and build output in `04-evidence-ledger.md`; every requirement ID has a row.
4. Nothing is pushed. Jamie sees screenshots first, then gives the go for a preview deploy, and
   again for main. Search Console, Bing and IndexNow wait for his go after it is live on ekuzo.gg.

## Human checkpoints (no mechanical gate)

- Jamie: the hero and the in-body graphic in context; the YouTube embed on a real phone.
- Karlin: courtesy OK on the "Inception" passage (already public in The Athletic).

## Changes after the first build (Jamie, 2026-11-11)

- P7 withdrawn 09:19 CT: the in-body graphic is cut for length and because it repeated the list
  above it. `what-a-team-gives-a-kid.png` stays in `docs/sports-post/assets/` as a social asset
  only and is removed from `public/images/`.
- Hero keeps its natural 1232:520 ratio at every width (the fixed 520px height cropped the baked-in
  text and captions).
- Try this tonight box: subtitle "Three things to do before the next sign-up", three one-line
  items, placed directly after the H2 (house pattern, see the Fortnite post's placement comment;
  it floats right on desktop and reads first on phones, as on sibling posts). Jamie 09:37 CT:
  "try to match them. i trust your instinct."
- Phone hero (Jamie 09:37 CT: yes): `my-kid-doesnt-like-sports-hero-mobile.jpg` (1080x900) served
  under 768px through `<picture>`.
- Measurement row amended after QA: `blog_link_click` covers same-origin links only. The shared
  tracker (`app/blog/BlogPostTracking.tsx`) skips cross-origin links by design on every post, so
  the outbound-link expectation is withdrawn for this build. Not a regression.
- GA4 page_view, Meta PageView and Clarity load only in the production deploy context
  (`app/layout.tsx`), so they are checked on the preview or live site, not locally.
- Inbound links (rows 1 to 4 of `03-inbound-links.md`) approved by Jamie 09:37 CT and applied in
  commit 5902d99; N1's file list extends to those four posts.

