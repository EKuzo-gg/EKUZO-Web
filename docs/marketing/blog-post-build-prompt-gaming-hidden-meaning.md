# Build plan for Claude Code: Ship "The game is visible. The meaning is hidden."

**Purpose:** Take the signed-off draft and ship it live on ekuzo.gg as an optimized, schema-complete blog post. Goal is AI citation + trust-building + a quiet funnel to EKUZO100. This is a foundational "Perspective" piece, not a hard-sell guide.

**Author note for Claude Code:** Jamie is running this session with you. He's coaching-friendly and still newer to Next.js. Explain each step briefly in chat and commit messages. Pause at every **HUMAN CHECKPOINT** and wait for his go-ahead.

**The single most important rule:** the body copy is signed off. Do **not** edit it, and do **not** "fix" the writing. In particular, this piece intentionally uses the "here's what you see, here's how to read it" reframe construction that `anti-ai-writing-style.md` flags in section 3F. That is deliberate and approved. Leave it alone. Your job is to wrap the approved text in a page, schema, links, and assets, not to rewrite sentences.

---

## Decisions to confirm before you start (Checkpoint 0)

1. **Slug (permanent URL).** Recommended: `what-your-kids-gaming-is-telling-you`. The on-page H1 stays the evocative "The game is visible. The meaning is hidden."; the slug carries the search-readable phrasing. Confirm or change before building, because changing it later means a redirect.
2. **Featured?** This is a strong evergreen piece. Ask Jamie whether it should become the `/blog` featured post or ship as a normal card (`featured: false`).
3. **Hero image rights.** The approved hero (kid from behind, hands on head, "YOU PLACED #27" on a Fortnite screen) shows real brand logos and game UI. Confirm with Jamie that the source is cleared for use before shipping.

---

## Inputs to load before you start

- **Source draft (body, signed off):** `docs/marketing/blog-draft-gaming-outgrown-the-bedroom.md`. Render only the article body (from the H1 through the "— Karlin, founder of EKUZO" sign-off). Do **not** render: the front-matter lines, the reviewer-note blockquote, the `[ASSET: embed Karlin "DAY 4" reel here.]` line (replace with the real embed), or the `## Editorial notes` section.
- **Content brief (context only):** `docs/marketing/blog-brief-is-your-gamer-ready-for-structure.md`.
- **Karlin DAY 4 transcript (for the reel embed + VideoObject):** `docs/marketing/karlin-day4-video-transcript.txt`. Reel URL: https://www.instagram.com/p/DYcuA4jBDl3/
- **Reference template (primary):** `app/blog/summer-camps-for-kids-who-game-2026/page.tsx`. Most recent post, already uses `BlogContent`, `buildBlogArticleSchema`, and the Karlin Person node. Match its structure.
- **Reference for the reel + VideoObject pattern:** `app/blog/league-of-legends-youth-development/page.tsx`.
- **Blog index:** `app/blog/page.tsx`.
- **Schema source of truth:** `lib/schema.ts`.
- **Voice rules for any micro-copy you author:** `docs/marketing/anti-ai-writing-style.md`.
- **Optimization checklist:** `docs/ai-optimization-checklist.md` (run it before you commit).
- **Fact-library (source of truth for citation URLs + numbers):** `../knowledge-base/wiki/domains/marketing/ekuzo-fact-library.md`.

## Reuse, do not rebuild

These already exist from the camps build. Use them as-is:

- `components/blog/BlogContent.tsx` — on-brand rendering wrapper for the body.
- `components/blog/InstagramEmbed.tsx` — use this for the DAY 4 reel.
- `components/blog/WireframePlaceholder.tsx` — for any asset not yet in hand.
- `lib/schema.ts`: `coachKarlinSchema` / `karlinPersonSchema` (same node), `buildBlogArticleSchema({...})`, `buildBreadcrumbSchema(trail)`, `buildVideoObjectSchema({...})`.

Do **not** create a new Karlin Person node, and do not duplicate `BlogContent` or `WireframePlaceholder`.

---

## Scope

### New files

1. `app/blog/<slug>/page.tsx` — the post page.
2. `public/images/<slug>-hero.jpg` — the approved hero, cropped to ~1232×520, under ~200KB. Keep the kid and the "#27" inside the safe area of the crop. If the cleared asset isn't on disk yet, generate a placeholder (small Node/sharp script, solid background, sentence-case label) so you aren't blocked.
3. `public/images/<slug>-card.jpg` — index card image, ~1232×770, under 100KB (a tighter crop of the same photo, or a placeholder).

### Files to update

1. `app/blog/page.tsx`:
   - Add the new post to the `posts` array: slug, title (`"The game is visible. The meaning is hidden."`), date, `author: "Karlin"`, `category: "Perspective"`, excerpt (write one obeying the voice guide), card image path, `featured` per Checkpoint 0.
   - Category note: the filter sidebar is currently hidden (see the comment in the file), so no filter-array change is strictly required to render. Still set `category: "Perspective"` on the post so the taxonomy is correct for when filtering is turned on. If the filter array is later un-hidden, "Perspective" needs to be in it.
2. `lib/schema.ts` — only if needed: add a `buildVideoObjectSchema({...})` call for the DAY 4 reel (name, description, thumbnail, contentUrl/embedUrl, transcript text from the transcript file, uploadDate). Follow the LoL post's pattern. No other schema changes; reuse `buildBlogArticleSchema` and `buildBreadcrumbSchema`.
3. `WORKLOG.md` — add an entry at the top before committing (name, date, what changed), per the repo's CLAUDE.md.

### Files NOT to touch

- The body copy of the draft (signed off; do not rewrite, do not "de-AI" the intentional reframes).
- Any other existing post page.
- Any commerce, API, Stripe, webhook, or `.env` code.
- `CLAUDE.md` and the marketing strategy docs.

---

## Step plan with verification

Each step has a check. Don't proceed until it passes.

1. **Read the draft and the camps reference page.** Confirm back to Jamie, in one short paragraph: the section order, where the reel embed goes (the `[ASSET]` marker), and which lines are citations to turn into links. Note the body boundaries (exclude reviewer note + editorial notes).

2. **Confirm the shared pieces exist.** Read `lib/schema.ts` and `components/blog/`. Verify `buildBlogArticleSchema`, `buildVideoObjectSchema`, `buildBreadcrumbSchema`, `karlinPersonSchema`, `BlogContent`, `InstagramEmbed`, `WireframePlaceholder` are all present. Report what you found. Do not recreate any of them.

3. **Hero + card images.** If the cleared hero is on disk, crop to 1232×520 (hero) and 1232×770 (card) with a small sharp script, keep under the size budgets, and write voice-compliant alt text (example: "A kid seen from behind at a desk, hands on their head after a loss on screen, in a warmly lit room"). If the asset isn't cleared yet, use placeholders and a `WireframePlaceholder` note for Aaron/Jamie. Verify: files exist, correct dimensions, under budget, render in a browser.

4. **Build `app/blog/<slug>/page.tsx`.** Mirror the camps page: Nav (`variant="light"`), `<article>` bg-white, decorative top-right brush, header block (eyebrow `"Perspective"`, H1 = `"The game is visible. The meaning is hidden."`, subhead = the draft's subhead), hero image, two-column body grid (sticky byline "By Karlin, founder of EKUZO" + content), "Keep Reading" cross-links, FooterBanner, Footer. Body content goes inside `<BlogContent>`, rendered from the markdown draft as JSX. At the `[ASSET]` marker, drop `<InstagramEmbed>` for https://www.instagram.com/p/DYcuA4jBDl3/ (responsive, lazy). Set the `metadata` export:
   - `title`: SEO-leaning, e.g. `"What your kid's gaming might be telling you | EKUZO"` (the visual H1 stays the evocative line).
   - `description`: one voice-compliant sentence.
   - `alternates: { canonical: "/blog/<slug>" }`.
   - `robots: { index: true, follow: true }`.
   Verify: `npx tsc --noEmit` passes.

5. **Wire the citations as links + a Sources list.** The body names five sources inline: Pew 2024 (identity gap, in the open), APA 2025 (sign 1), the problem-gaming "pattern not hours" point (sign 3), Pew 2024 (social, sign 4), and NASEF (synthesis). Turn each into a link, and add a "Sources" section at the foot of the article if the reference posts use one (check the camps/LoL pages first; match whatever pattern they use). **Pull the exact live URLs from the fact library, and re-verify every number against it before publishing** (the fact library is the citations hub; do not invent URLs). Known anchors/URLs to start from:
   - Pew 2024 *Teens and Video Games Today* — `ekuzo-fact-library#play--claiming-the-gamer-label-the-identity-gap` and the Gaming-as-Social-Infrastructure entries.
   - APA 2025 — https://www.apa.org/news/press-releases/2025/06/screen-time-problems-children
   - Problem-gaming pattern, not hours — `ekuzo-fact-library#addictive-use-not-total-time`.
   - NASEF / ~90% not in another extracurricular — https://www.slj.com/story/How-Gaming-and-Esports-Foster-Social-emotional-Learning-Skills-libraries-SEL-D-D-RPG
   Verify: every stat in the body has a working source link; numbers match the fact library.

6. **Schema.** Add `<JsonLd data={buildBlogArticleSchema({...})} />` (author defaults to the Karlin Person node), a breadcrumb via `buildBreadcrumbSchema([{Home}, {Blog}, {this post}])`, and a `buildVideoObjectSchema({...})` for the DAY 4 reel using the transcript text. Prefer one `@graph` if the reference posts do. Verify: `curl -s http://localhost:3001/blog/<slug> | grep -o 'application/ld+json'` returns the tag(s), and the payload validates clean at https://validator.schema.org/.

7. **Internal links.** In-body CTA links once to `/programs/ekuzo100`. "Keep Reading" cross-links to: `conquering-my-mountain-and-giants-how-esports-changed-my-life`, `our-family-s-esports-journey-with-ekuso-and-the-k1ng`, and `league-of-legends-youth-development` (the "but which game?" parent). Verify: every link routes correctly.

8. **Blog index.** Add the post entry (`category: "Perspective"`, featured per Checkpoint 0) and write the excerpt. Verify: `/blog` renders the new card and it routes to the post.

9. **Run the AI optimization checklist.** Walk `docs/ai-optimization-checklist.md` end to end (content, technical, schema, accessibility/agent-readiness). Fix anything it flags. Verify: report the checklist results back to Jamie.

10. **WORKLOG.** Add a top entry describing the change. Verify: entry present.

11. **HUMAN CHECKPOINT 1 — local review.** Tell Jamie the dev server is up and give him the URL and a checklist: renders without console errors; Tungsten/Inter typography matches the site; the reel embed loads; the hero looks right and the alt text reads cleanly; the five citations are linked and the numbers are correct; the "Perspective" eyebrow shows; the single E100 CTA and the three Keep Reading links work; the post shows on `/blog`. Wait for "ship to dev."

12. **Commit + push to `dev`.** One commit. Subject: `Add "the game is visible, the meaning is hidden" blog post (Perspective)`. Body lists: post page, hero/card images, blog index + Perspective category, Article + VideoObject schema, WORKLOG. Push to `origin/dev`. Verify: commit on both local and origin `dev`.

13. **HUMAN CHECKPOINT 2 — dev preview.** Point Jamie at `https://dev--ekuzo.netlify.app/blog/<slug>`. Same checklist, plus validate the schema against the dev URL at https://validator.schema.org/. Wait for "ship to main."

14. **Merge `dev` → `main`.**
    ```
    git checkout main
    git pull origin main
    git merge dev
    git push origin main
    git checkout dev
    ```
    Verify: `git log origin/main --oneline | head -1` shows the merge.

15. **HUMAN CHECKPOINT 3 — production.** Point Jamie at `https://ekuzo.gg/blog/<slug>`. Confirm it's live, schema validates against the prod URL, and the card shows on `https://ekuzo.gg/blog`. Done when he confirms.

---

## Voice and copy guardrails

- Do **not** edit the body. The reframe constructions are intentional (see the top rule).
- Any micro-copy you author (alt text, meta description, excerpt, "Keep Reading" blurbs) must obey `anti-ai-writing-style.md`: no em dashes, no banned vocabulary, and don't introduce the negative-parallelism tic into your own micro-copy.
- Byline form: "By Karlin, founder of EKUZO."
- Keep the E100 mention to the single CTA. Do not add EKUZO mentions inside the six signs; the whole point of this piece is that the product shows up once, at the end.

## Acceptance criteria

- `npx tsc --noEmit` passes; `npx next dev -p 3001` runs clean.
- `/blog/<slug>` renders with all body elements styled, body copy unchanged from the draft.
- Hero + card images present, correct dimensions, voice-compliant alt text.
- DAY 4 reel embeds and plays via `InstagramEmbed`.
- All five citations are linked, numbers verified against the fact library; Sources section matches house pattern.
- Article + VideoObject + Breadcrumb schema validate clean.
- Single `/programs/ekuzo100` CTA; three Keep Reading links route correctly.
- `/blog` shows the new card under "Perspective."
- AI optimization checklist passes.
- WORKLOG updated. Lands on `dev` first, then merges to `main`. Production verified live.
