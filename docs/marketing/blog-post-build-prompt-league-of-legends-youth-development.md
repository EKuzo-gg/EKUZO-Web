# Build plan for Claude Code: Ship the "Why League of Legends is perfect for youth development" blog post

**Purpose:** Take the draft and ship it live on ekuzo.gg. Goal is LLM citation on parent searches for "League of Legends for kids" + bidirectional cross-link with the existing summer-camps post + drive EKUZO Camps registrations.

**Author note for Claude Code:** Jamie is running this session with you. He's coaching-friendly and not deeply expert in Next.js yet. Explain the purpose of each step briefly in commit messages and chat. Pause at the checkpoints marked **HUMAN CHECKPOINT** below and wait for his go-ahead before continuing.

**What's already in place from the last blog build session (do not rebuild):**

- `components/blog/BlogContent.tsx` — the shared rendering wrapper that applies on-brand styling to `h2`, `h3`, `p`, `ul`, `table`, etc.
- `components/blog/WireframePlaceholder.tsx` — dashed-border missing-asset block.
- `lib/schema.ts` already has `karlinPersonSchema` (Person node) and `buildBlogArticleSchema({...})` from the summer-camps post. Reuse them.
- The blog index (`app/blog/page.tsx`) already has the "Guides" category filter.

If you discover any of the above is actually missing or different from this description, stop and tell Jamie before rebuilding anything. It's faster to verify state than to redo work.

---

## Inputs to load before you start

- Source draft: `docs/marketing/blog-draft-why-ekuzo-plays-league-of-legends.md` (the post content, signed off)
- Reference template (the structural pattern to match): `app/blog/summer-camps-for-kids-who-game-2026/page.tsx`
- Sibling post for cross-link: same file — you'll be updating it to link back here
- Blog index: `app/blog/page.tsx`
- Schema source of truth: `lib/schema.ts`
- JsonLd component: `components/JsonLd.tsx`
- BlogContent and WireframePlaceholder: `components/blog/`
- Karlin's bio source: read `app/programs/ekuzo-camps/page.tsx` and locate the founder bio block. Use his exact name form and any credentials listed. (The draft's frontmatter bio line is the long form; the byline on the page itself should match the camps page convention.)
- Voice DNA: `docs/marketing/anti-ai-writing-style.md` (any micro-copy you add must obey this)

---

## Scope

### New files to create

1. `app/blog/league-of-legends-youth-development/page.tsx` — the post page itself.
2. `components/blog/InstagramEmbed.tsx` — responsive iframe wrapper for Instagram reels. Props: `url` (canonical Instagram permalink), `caption` (optional short string rendered below the embed), optional `maxWidth` (default 540px since reels are 9:16 portrait and don't benefit from being huge). Implementation: render `<iframe src={`${url}embed`} ... />` inside a centered container with `loading="lazy"`, sandboxed appropriately, and a `min-height` that holds the aspect ratio. Reels are vertical, so the iframe should be taller than wide. Add an `aria-label` on the iframe pulled from `caption` or a default.
3. `public/images/blog-post-4-card.jpg` — wireframe placeholder card image, 1232×770 (16:10), under 100KB. Generate it with the same sharp/Pillow script pattern used for the summer-camps placeholders. Solid background, sentence-case text reading "Blog post 4 — card placeholder."
4. `public/images/blog-post-4-hero.jpg` — wireframe placeholder hero image, same generation pattern, 1232×520 aspect.

### Files to update

1. `app/blog/page.tsx`:
   - Add the new post entry to the `posts` array with:
     - `slug`: `league-of-legends-youth-development`
     - `title`: `"Why League of Legends is perfect for youth development"`
     - `date`: 2026-05-16 (or match the prior posts' format)
     - `author`: `"Karlin"`
     - `category`: `"Guides"`
     - `excerpt`: `"Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids."` (same string as the meta description — keeps the card and the SERP preview consistent)
     - `image`: `/images/blog-post-4-card.jpg`
     - `featured`: `false`
   - "Guides" should already exist on the filter sidebar from the prior session. Verify it's there. If somehow missing, add it.

2. `app/blog/summer-camps-for-kids-who-game-2026/page.tsx` — **bidirectional cross-link.** This post's "Why League of Legends" H2 already exists in that summer-camps page. Add the following sentence at the end of that section, after the existing skill-transfer paragraph (use this wording verbatim — it's been voice-checked and the anchor text is optimized to match the destination post's H1):

   > We wrote [a longer post on why League of Legends works for youth development](/blog/league-of-legends-youth-development). It goes deeper on the toxicity question and what coached play teaches kids.

   Also: consider promoting this new post as the "Keep Reading" cross-link target instead of (or alongside) whatever is currently there. The summer-camps post is the broader "what is a gamer-kid summer" piece and this new post is the deep-dive on the specific game. Natural progression for a parent who's read one and wants more.

3. `lib/schema.ts`: no new builders needed if `karlinPersonSchema` and `buildBlogArticleSchema` are already there from the last session. Just consume them in the new page. If either is missing, stop and tell Jamie before adding — the summer-camps post should already have wired them.

### Files NOT to touch

- The existing post pages (`our-family-s-esports-journey-with-ekuso-and-the-k1ng/page.tsx` and `conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx`).
- Any commerce, API, Stripe, or webhook code.
- `CLAUDE.md`, `WORKLOG.md`, or the marketing strategy docs.
- The body content of the new post. The text is signed off. If something genuinely seems factually wrong, flag it to Jamie before changing it.

---

## Step plan with verification

Each step has a verification check. Don't proceed to the next step until the check passes.

1. **Read the source draft, the reference summer-camps post page, and the existing BlogContent / WireframePlaceholder components.** Verify: you understand the post's structure — the answer block lives directly under the H1 with no H2, then 9 question-form H2 sections, then the FAQ block under a "FAQ" H2, then the author bio italic line. Write a one-paragraph summary back to Jamie confirming you've read all four and you understand what's already built and what's new.

2. **Build `components/blog/InstagramEmbed.tsx`.** Responsive vertical iframe at 9:16. Centered container, max-width ~540px on desktop, full-width minus body padding on mobile. Lazy-load. Caption renders below in `font-body text-black/70 text-sm`. Verify: `npx tsc --noEmit` passes. Drop a test render of `<InstagramEmbed url="https://www.instagram.com/p/DYXJQmeR2cq/" caption="Karlin's live reaction to the Jynxzi tournament: community is what you make of it." />` into `app/page.tsx` for 30 seconds and confirm the reel plays. Then remove the test.

3. **Generate placeholder images.** Use the same Node + sharp script approach from the prior session. Save as `blog-post-4-card.jpg` (1232×770) and `blog-post-4-hero.jpg` (1232×520). Both solid background, label text in sentence case. Verify: files exist under 100KB each, display in a browser.

4. **Build `app/blog/league-of-legends-youth-development/page.tsx`.** Match the structure of the summer-camps post page exactly: Nav (variant="light"), `<article>` with bg-white, decorative top-right brush, header block (eyebrow "Guides", H1 title from frontmatter), hero image area (use `blog-post-4-hero.jpg`), two-column body grid (200px sticky byline + 1fr content), "Keep Reading" cross-link section pointing at the summer-camps post, FooterBanner, Footer. Body content goes inside `<BlogContent>`. Render the post content from the markdown draft as JSX. Important placements:
   - The answer block is the first paragraph after the H1, with no H2 above it. It's load-bearing for LLM citation, do not wrap it under a section heading or otherwise demote it.
   - `<InstagramEmbed url="https://www.instagram.com/p/DYXJQmeR2cq/" caption="Karlin's live reaction to the Jynxzi tournament: community is what you make of it." />` goes directly under the `## What did the Jynxzi tournament teach us about League?` H2 and before the first body paragraph of that section.
   - The FAQ at the bottom of the post renders inside `<BlogContent>` with bolded questions as `<p><strong>` (matching the markdown). Each Q&A is its own block.
   - Set `metadata` export with:
     - `title`: pull from the draft frontmatter (`"Why League of Legends is perfect for youth development"`)
     - `description`: use this verbatim (already voice-checked and within Google's 155-char display limit):

       > Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.

     - `alternates.canonical`: `/blog/league-of-legends-youth-development`
     - `robots`: index/follow defaults (this is a public post, intentionally indexable)
     - `openGraph` and `twitter` cards: reuse the same title + description; image is `/images/blog-post-4-hero.jpg` (the placeholder for now; Aaron will swap)
   - The draft frontmatter has a `media.hero.spec` block. The hero image slot uses `blog-post-4-hero.jpg` as the placeholder. Add a code comment near the hero image element noting that Aaron will replace the placeholder with the real asset per the spec in the draft frontmatter.

   Verify: `npx tsc --noEmit` passes.

5. **Wire schema.** Inside the new page render, near the top, add `<JsonLd data={buildBlogArticleSchema({ slug: "league-of-legends-youth-development", title: "...", description: "...", datePublished: "2026-05-16", dateModified: <today>, image: "/images/blog-post-4-hero.jpg", author: karlinPersonSchema })} />`. Verify: start the dev server and run `curl -s http://localhost:3001/blog/league-of-legends-youth-development | grep -o 'application/ld+json'`. Copy the `@graph` payload into https://validator.schema.org/ — no errors.

6. **Update `app/blog/page.tsx`** with the new post entry and confirm "Guides" filter is intact. Verify: `/blog` index renders the new card, and clicking it routes to the new post.

7. **Update the summer-camps post page (`app/blog/summer-camps-for-kids-who-game-2026/page.tsx`)** with the inline link back to the new post. Anchor text suggestion: inside the existing "Why League of Legends" H2 of that post, after the cultural-relevance paragraph, add a sentence like "We wrote [a longer piece on why League works for youth development](/blog/league-of-legends-youth-development) if you want the deeper version." Voice-check the sentence against the Voice DNA before committing — make sure it lands in the summer-camps post's voice (Karlin, conversational, not pitchy). Verify: link is clickable, lands on the new post.

8. **HUMAN CHECKPOINT 1 — local review.** Tell Jamie: "Dev server is running. Open http://localhost:3001/blog/league-of-legends-youth-development in your browser. Walk through this checklist out loud:
   - Page renders without errors in the console
   - Typography matches the summer-camps post (Tungsten Narrow headings, Inter body)
   - The Karlin Instagram reel embed loads and plays inside the Jynxzi section
   - The hero placeholder (`blog-post-4-hero.jpg`) is obviously a wireframe and labelled as such
   - The answer block at the top is the first paragraph and renders cleanly
   - All 9 H2 section headers are sentence case (proper nouns capitalized)
   - All 22 inline links resolve to a real URL
   - The post appears on `/blog` under "All" and under the "Guides" filter
   - The summer-camps post now links to this one inside its 'Why League' section
   Reply with 'looks good, ship to dev' or specific things to fix." Wait for response. Do not proceed until he green-lights.

9. **Commit and push to `dev`.** Use one commit with a clear message. Subject: `Add league-of-legends-youth-development blog post`. Body lists: new post page, InstagramEmbed component, placeholder images, blog index update, bidirectional cross-link with summer-camps post, Article schema wired. Push to `origin/dev`. Verify: `git log dev origin/dev --oneline | head -3` shows the new commit on both sides.

10. **HUMAN CHECKPOINT 2 — Netlify dev preview.** Tell Jamie: "Pushed to dev. Netlify will rebuild https://dev--ekuzo.netlify.app in 1-2 minutes. Once it's live, open `https://dev--ekuzo.netlify.app/blog/league-of-legends-youth-development` and run the same checklist. Then validate the Article schema at https://validator.schema.org/ using the dev preview URL. Reply with 'looks good, ship to main' or specific things to fix." Wait for response.

11. **Merge `dev` to `main`.** Run:
    ```
    git checkout main
    git pull origin main
    git merge dev
    git push origin main
    git checkout dev
    ```
    Verify: `git log origin/main --oneline | head -1` shows the merge.

12. **HUMAN CHECKPOINT 3 — production verification.** Tell Jamie: "Merged to main. Netlify is deploying to https://ekuzo.gg now. In 1-2 minutes, open `https://ekuzo.gg/blog/league-of-legends-youth-development` and confirm the page is live. Final checks: the Article schema validates against the production URL at https://validator.schema.org/, the post appears on `https://ekuzo.gg/blog` under Guides, and the summer-camps post now links to it. Reply with 'done' when verified." Wait. Once confirmed, the session is complete.

---

## Voice and copy guardrails

- Any visible micro-copy you author (alt text, placeholder labels, error messages, meta description, the new cross-link sentence in the summer-camps post) must obey `docs/marketing/anti-ai-writing-style.md`. No em dashes. No negative parallelisms ("not X, Y" patterns). No banned vocabulary list (`delve`, `realm`, `harness`, `leverage`, `optimize`, `foster`, `enhance`, `elevate`, etc.). Sentence-case headers.
- Do **not** modify the body content of the new post during the build. The text in the markdown draft is signed off.
- The byline on the post itself should match the form used on the camps post (typically "By Karlin, founder of EKUZO" or similar). The italic author bio at the very bottom of the draft is the longer About-the-Author line and can render as written.

---

## Reference: media slot brief (for Aaron, not for Claude Code to implement)

The draft frontmatter has a `media` block describing what Aaron needs to produce:

- **Hero image (1200×630)**: three direction options listed in the spec. Privacy-safe (no identifiable kid faces). No copyrighted Riot art unless EKUZO has licensing.
- **Inline embed**: Karlin's Instagram reel "Community is opportunity" (https://www.instagram.com/p/DYXJQmeR2cq/). This is the only inline media in the post and goes inside the Jynxzi section. Claude Code wires the embed; Aaron doesn't need to produce anything new for the inline.

Aaron's hero work happens in parallel with this build session. When the real hero asset lands, swapping `blog-post-4-hero.jpg` and `blog-post-4-card.jpg` for the real files is a one-line change to the page and the blog index. Claude Code does not need to wait for Aaron — ship the post with placeholders and Aaron will replace them after.

---

## Acceptance criteria summary

- `npx tsc --noEmit` passes
- `npx next dev -p 3001` runs without console errors
- `/blog` index renders the new card under the "Guides" filter
- `/blog/league-of-legends-youth-development` renders correctly with all body elements styled
- Karlin Instagram reel loads and plays inside the Jynxzi section
- Hero placeholder visible and obviously a wireframe
- Article + Person schema validate clean at https://validator.schema.org/
- All 22 inline links resolve correctly
- "Keep Reading" cross-link to the summer-camps post navigates correctly
- The summer-camps post links back to the new post from its "Why League of Legends" section
- All commits land on `dev` first, then merge to `main`
- Production verified live at https://ekuzo.gg after final merge
