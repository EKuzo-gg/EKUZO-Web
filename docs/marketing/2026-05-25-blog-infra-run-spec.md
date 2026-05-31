# Blog Infra Run — Spec for Tomorrow's Claude Code Session

Created: 2026-05-25 · Lane: Claude Code (Aaron/Jamie) · Three independent workstreams, ordered
easiest-first. Each has exact files, changes, and a verification step. Honors the repo rules in
`CLAUDE.md`: structured data lives in `lib/schema.ts` (don't hand-roll JSON-LD in pages), every
slug change needs a redirect, and canonical/metadata conventions apply.

Repo facts (verified 2026-05-25): `lib/schema.ts` has `SITE="https://ekuzo.gg"`,
`ORG_ID=${SITE}/#organization`, `KARLIN_ID=${SITE}/#coach-karlin`. `coachKarlinSchema` already exists
(jobTitle "Founder", `worksFor` ORG_ID, `sameAs` LinkedIn) and `buildBlogArticleSchema` already
defaults `author` to `{ "@id": KARLIN_ID }`. `buildFAQPageSchema(items)` and
`buildBlogPostBreadcrumbSchema(slug, title)` exist. Blog bylines are rendered inline in each
`page.tsx` (no shared Byline component). No author route exists yet.

---

## Workstream 1 — Fix the K1ng slug + redirect (smallest; do first)

The post directory misspells the brand: `our-family-s-esports-journey-with-**ekuso**-and-the-k1ng`.

1. **Rename the directory** `app/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng/` →
   `…-with-ekuzo-and-the-k1ng/` (ekuso → **ekuzo**).
2. **Update the in-file slug constant** in that page (`const SLUG = "…ekuzo…"`) and any
   self-referencing canonical/`og:url`/article `@id` derived from it.
3. **Add a redirect** in `next.config.mjs` (the `redirects()` array, alongside the existing rules):
   ```js
   { source: "/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng",
     destination: "/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
     permanent: true },
   ```
4. **Repoint internal links** to the old slug. Grep the repo for `ekuso` and fix every hit (blog
   index card, any related-posts block, sitemap entry if hand-maintained):
   ```
   grep -rn "ekuso" app/ components/ lib/ public/ --include=*.tsx --include=*.ts --include=*.xml
   ```
5. **Verify:** old URL 301s to the new URL; new URL renders; `canonical`/`og:url` show the corrected
   slug; `grep -rn "ekuso"` returns nothing outside this redirect rule.

---

## Workstream 2 — Karlin Oei author page + schema enrichment + byline normalization

Bio copy + facts-to-verify are in [`karlin-oei-author-bio.md`](./karlin-oei-author-bio.md). Karlin
authored **5 of 7** posts (LoL, camps, six-tells, both homeschool). Guests John Hay and Lisa Holt
stay plain bylines.

### 2a. Enrich the existing Person node (`lib/schema.ts` → `coachKarlinSchema`)

Edit the existing node — **do not** create a second Person (keep `@id = KARLIN_ID`):
```js
name: "Karlin Oei",            // was: 'Karlin "Faith" Oei'
alternateName: "Faith",        // gamer handle moves here
// jobTitle "Founder", worksFor ORG_ID, sameAs LinkedIn, image already present — keep
description: "Founder of EKUZO. Former national collegiate esports captain who earned $80,000+ in scholarships; builds EKUZO as the structured, coached environment he didn't have growing up.",
knowsAbout: ["youth esports","esports coaching","League of Legends","youth development","structured gaming","screen time","online safety for kids"],
url: `${SITE}/blog/author/karlin-oei`,
```
**Caveat:** confirm nothing renders `coachKarlinSchema.name` *visually* before changing it. The
camps page uses its own literal `'KARLIN "FAITH" OEI'`, so it's unaffected — but grep to be sure:
`grep -rn "coachKarlinSchema\|karlinPersonSchema" app/ components/`.

### 2b. Create the author page

New route `app/blog/author/karlin-oei/page.tsx` (server component):
- Headshot `/images/coach-karlin-faith.jpg`, the **long bio** from `karlin-oei-author-bio.md`, and a
  list of his 5 posts (link each).
- `metadata`: `title: "Karlin Oei — EKUZO"`, a description, `alternates: { canonical: "/blog/author/karlin-oei" }`.
- Render Person JSON-LD **by reference** via `<JsonLd>` using `{ "@id": KARLIN_ID }` (or export a
  small `buildAuthorPageGraph()` in `lib/schema.ts` that emits a `ProfilePage` →
  `mainEntity: { "@id": KARLIN_ID }` + breadcrumb). Keep the builder in `lib/schema.ts`, not the page.

### 2c. Normalize bylines (the 5 Karlin posts)

In each of `league-of-legends-youth-development`, `summer-camps-for-kids-who-game-2026`,
`what-your-kids-gaming-is-telling-you`, `what-homeschool-parents-taught-us-about-gaming`,
`when-gaming-helps-homeschool-kids`:
- Set the **`authors: [...]`** array to `["Karlin Oei"]` (three currently say `"Karlin"`).
- Set the **rendered byline** text to "Karlin Oei" and wrap it in a `<Link href="/blog/author/karlin-oei">`.
- (Article schema already references `KARLIN_ID` via `buildBlogArticleSchema` default — no change needed there.)

Leave `conquering-my-mountain…` (John Hay) and `our-family-s-esports-journey…` (Lisa Holt) as guest
bylines; optionally add a small "Guest contributor" label.

**Verify:** author page renders + canonical correct; all 5 bylines read "Karlin Oei" and link to it;
paste the page's `@graph` into validator.schema.org (ProfilePage/Person resolve, one canonical Person
`@id`); `curl -s http://localhost:3001/blog/author/karlin-oei | grep -o 'application/ld+json'`.

---

## Workstream 3 — Six-tells FAQ block + FAQPage schema

Revisits the deliberate no-blog-FAQ decision for this one high-intent post (its statement-shaped H2s
don't extract well). Copy the **pattern already in** `league-of-legends-youth-development/page.tsx`
(FAQ_ITEMS array → `buildFAQPageSchema(FAQ_ITEMS)` in the JsonLd graph → a rendered FAQ section).

In `app/blog/what-your-kids-gaming-is-telling-you/page.tsx`, add:
```js
const FAQ_ITEMS = [
  { question: "Why does my kid rage or melt down when they lose a video game?",
    answer: "Often the size of the reaction reflects the size of what's riding on it — the game may be where they feel status, competence, or belonging, and a loss threatens that. The useful question isn't why they care so much, it's what they're carrying into the match, and whether they can recover, name what went wrong, and come back calmer. That's the signal worth watching, and it's something a coached, structured setting is built to work on." },
  { question: "My kid plays for hours but can't say what they're working on — should I worry?",
    answer: "Long hours without a sense of progress usually means the effort is there but no one has shown them how to practice, not that they're lazy. Watch for whether any curiosity to improve shows up when you ask. A kid reaching for improvement with no map looks aimless until someone hands them one — which is what coaching provides." },
  { question: "Why is logging off such a fight?",
    answer: "Sometimes it's simple impulse and worth taking seriously on its own terms. Other times the game was the one place that felt active and social all day, so leaving lands like being pulled out of the only room where something was happening. Watch the shape of the resistance: a kid who can't stop anything points toward impulse; a kid who's fine putting most things down but goes to war over this one usually points toward meaning." },
  { question: "My kid has online friends but seems disconnected in person — is that real friendship?",
    answer: "The connection is usually real — most teen gamers play with others and many have made a friend through a game. The question is whether any of it survives the game closing: do the friends have names, do the same ones show up again, is your kid building something with anyone. A real social thread you can't see is very different from no social thread at all." },
  { question: "Should I respond with less gaming, or with more structure?",
    answer: "For most kids the answer is rarely 'less gaming' or 'more gaming' — both miss what's going on. What tends to help is a better container around the thing they already care about: a team, a coach, a rhythm to the week, and a culture set by adults. One honest caveat: if gaming comes with real withdrawal from people, sleep or school falling apart, or a low mood that doesn't lift, talk to a pediatrician or counselor first." },
];
```
Wire it: import `buildFAQPageSchema`, add `buildFAQPageSchema(FAQ_ITEMS)` to the page's JSON-LD graph,
and render a visible FAQ section (mirror the LoL post). Answers are plain text, no HTML, and stay
faithful to the post — they're lifted from its own content, no new claims.

**Verify:** FAQPage validates on validator.schema.org; the rendered Q&A matches the post; no
fabricated claims.

---

## Inputs needed from Jamie/Karlin

- **Bio facts to confirm** (LinkedIn login wall blocked the fetch): college/team captained + years,
  any certifications, whether the "Peak Challenger Jungler" line belongs in the public bio, extra
  `sameAs` profile URLs. See `karlin-oei-author-bio.md` → "Facts to verify."
- **Decision:** author route `/blog/author/karlin-oei` (assumed here) vs `/authors/karlin-oei`.

## Cross-refs

- [`karlin-oei-author-bio.md`](./karlin-oei-author-bio.md) — bio copy + schema fields
- [`2026-05-25-blog-coverage-llm-audit-and-next-posts.md`](./2026-05-25-blog-coverage-llm-audit-and-next-posts.md) — why these three (§3 fixes + §6 order)
- `CLAUDE.md` (repo root) — schema-in-lib rule, redirect discipline, canonical/metadata conventions
