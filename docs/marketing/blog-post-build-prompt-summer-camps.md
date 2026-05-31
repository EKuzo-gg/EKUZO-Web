# Build plan for Claude Code: Ship the "Summer camps for kids who game" blog post

**Purpose:** Take the draft and ship it live on ekuzo.gg. Goal is LLM citation + drive EKUZO Camps registrations.

**Author note for Claude Code:** Jamie is running this session with you. He's coaching-friendly and not deeply expert in Next.js yet. Explain the purpose of each step briefly in commit messages and chat. Pause at the checkpoints marked **HUMAN CHECKPOINT** below and wait for his go-ahead before continuing.

---

## Inputs to load before you start

- Source draft: `docs/marketing/blog-draft-virtual-summer-camps-for-gamer-kids.md` (the post content, signed off)
- Karlin transcript: `docs/marketing/karlin-camps-video-transcript.md` (for voice consistency)
- Reference template: `app/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng/page.tsx`
- Blog index: `app/blog/page.tsx`
- Schema source of truth: `lib/schema.ts`
- JsonLd component: `components/JsonLd.tsx`
- Karlin's bio source: read `app/programs/ekuzo-camps/page.tsx` and locate the founder bio block. Use his exact name form and any credentials listed.
- Karlin's camps video for embed: https://www.youtube.com/shorts/0XqcbJET8CU
- Voice DNA: `docs/marketing/anti-ai-writing-style.md` (any micro-copy you add must obey this)

---

## Scope

### New files to create

1. `app/blog/summer-camps-for-kids-who-game-2026/page.tsx` — the post page itself.
2. `components/blog/BlogContent.tsx` — shared rendering component with on-brand styling for `h2`, `h3`, `p`, `ul`, `ol`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `a`, `strong`, `blockquote`. Backward-compatible: existing posts can be migrated later but are not required to be migrated now.
3. `components/blog/WireframePlaceholder.tsx` — styled component for missing assets. Renders an obvious dashed-border block with a label and a note. Used here for the Jynxzi tournament clip we don't have yet.
4. `public/images/blog-post-3-card.jpg` — wireframe placeholder card image, 1232×770 (16:10), under 100KB. Generate it with a small Node or Python script (sharp / Pillow). Solid background, sentence-case text reading "Blog post 3 — card placeholder."
5. `public/images/blog-post-3-hero.jpg` — wireframe placeholder hero image, same generation pattern, 1232×520 aspect.

### Files to update

1. `app/blog/page.tsx`:
   - Add the new post entry to the `posts` array (slug, title, date, author "Karlin", category "Guides", excerpt, card image path, featured: false).
   - Add `"Guides"` to the filter sidebar list (currently `["All", "Case Studies", "Testimonials"]`).
2. `lib/schema.ts`:
   - Add a `karlinPersonSchema` Person node. Pull name and credentials from the camps page. `jobTitle: "Founder"`. `worksFor` references the existing EKUZO `EducationalOrganization` node.
   - Add a `buildBlogArticleSchema({ slug, title, description, datePublished, dateModified, image, author })` function that returns an `Article` schema referencing the org node and the author Person node.
3. The new post page wires `<JsonLd data={buildBlogArticleSchema({...})} />` at the top of the component. This closes the documented `/blog/[slug]` Article schema gap noted in `CLAUDE.md`.

### Files NOT to touch

- The two existing post pages (`our-family-s-esports-journey-with-ekuso-and-the-k1ng/page.tsx` and `conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx`). `BlogContent` is backward-compatible by design; no retrofit needed in this session.
- Any commerce, API, Stripe, or webhook code.
- `CLAUDE.md`, `WORKLOG.md`, or the marketing strategy docs (those are docs, not code).

---

## Step plan with verification

Each step has a verification check. Don't proceed to the next step until the check passes.

1. **Read the source draft and the reference template post.** Verify: you understand the post's structure — which H2 sections exist, where the table is, where the Karlin video embed goes, where the Jynxzi placeholder goes. Write a one-paragraph summary back to Jamie confirming you've read both.

2. **Build `components/blog/WireframePlaceholder.tsx`.** Props: `type` ("video" | "image"), `label` (short caps label), `note` (longer description for Aaron of what's needed), optional `height` (defaults to 360). Render: dashed red border (2px), light grey background (`#f0edea`), label in red caps with letter spacing, note in monospace font below. Visually obvious as incomplete without being ugly. Verify: drop a test instance into the `app/page.tsx` for 30 seconds, confirm it reads as a placeholder at a glance, then remove the test.

3. **Build `components/blog/BlogContent.tsx`.** Wraps `children` and applies on-brand Tailwind classes to standard HTML elements via descendant selectors or scoped utilities. Style rules:
   - `p`: `font-body text-black/80 leading-relaxed`, font-size `clamp(1rem, 1.4vw, 20px)`, vertical rhythm of ~24px between paragraphs.
   - `h2`: `font-display text-black leading-tight`, sentence case (don't uppercase), font-size `clamp(1.75rem, 3vw, 2.5rem)`, top margin ~48px.
   - `h3`: `font-body font-bold text-black`, font-size `clamp(1.25rem, 1.8vw, 1.5rem)`, top margin ~32px.
   - `ul` / `ol`: standard markers, `font-body text-black/80`, item spacing tight.
   - `table`: full width, clean 1px borders, padded cells, header row `bg-grey font-bold`, body rows alternating background optional.
   - `a`: red text, underline on hover.
   - `strong`: `font-bold text-black`.
   - `blockquote`: left border red, italicized.
   Verify: `npx tsc --noEmit` passes. Component is exported as default.

4. **Generate placeholder images.** Use a small Node script with `sharp`. Save as `blog-post-3-card.jpg` (1232×770) and `blog-post-3-hero.jpg` (1232×520). Both have solid background, label text rendered in sentence case. Verify: files exist under 100KB each, display in a browser.

5. **Build `app/blog/summer-camps-for-kids-who-game-2026/page.tsx`.** Match the structure of the K1ng post page exactly: Nav (variant="light"), `<article>` with bg-white, decorative top-right brush, header block (eyebrow "Guides", H1 title), hero image area (use `blog-post-3-hero.jpg`), two-column body grid (200px sticky byline + 1fr content), "Keep Reading" cross-link section, FooterBanner, Footer. Body content goes inside `<BlogContent>`. Render the post content from the markdown draft as JSX. Use `<WireframePlaceholder type="video" label="Jynxzi tournament clip" note="Aaron to source a 15-30s clip from Jynxzi's May 11 2026 League tournament. Twitch clip or YouTube short, embed via standard iframe." />` in the Why League section where the Jynxzi clip would go. Embed Karlin's YouTube Short as an iframe (responsive, 16:9, lazy-loaded) inside the EKUZO Camps section, directly under the audience-reframe paragraph. Set `metadata` export with title, description, canonical alternates pointing at the new slug, and robots index/follow defaults. Verify: `npx tsc --noEmit` passes.

6. **Update `lib/schema.ts`.** Add `karlinPersonSchema` and `buildBlogArticleSchema`. Wire the schema in the post page via `<JsonLd data={...} />` placed inside the page render, near the top. Verify: start the dev server and run `curl -s http://localhost:3001/blog/summer-camps-for-kids-who-game-2026 | grep -o 'application/ld+json'`. The script tag should be present. Copy the `@graph` payload into https://validator.schema.org/ — no errors.

7. **Update `app/blog/page.tsx`.** Add the new post entry (category "Guides", featured: false). Add "Guides" to the filter sidebar array. Verify: `/blog` index renders the new card, and clicking it routes to the new post.

8. **HUMAN CHECKPOINT 1 — local review.** Tell Jamie: "Dev server is running. Open http://localhost:3001/blog/summer-camps-for-kids-who-game-2026 in your browser. Walk through this checklist out loud:
   - Page renders without errors in the console
   - Typography matches the rest of the site (Tungsten Narrow headings, Inter body)
   - The Karlin YouTube Short embed loads and plays
   - The Jynxzi wireframe placeholder is obviously incomplete (dashed red border, label visible)
   - The 4-row comparison table is readable and clean
   - All internal links work (3 to `/programs/ekuzo-camps`, 1 to the K1ng story for Keep Reading)
   - The post appears on `/blog` under "All" and under the "Guides" filter
   Reply with 'looks good, ship to dev' or specific things to fix." Wait for response. Do not proceed until he green-lights.

9. **Commit and push to `dev`.** Use one commit with a clear message. Subject: `Add summer-camps-for-kids-who-game-2026 blog post`. Body lists: new post page, BlogContent component, WireframePlaceholder component, placeholder images, blog index update, Article + Person schema fix. Push to `origin/dev`. Verify: `git log dev origin/dev --oneline | head -3` shows the new commit on both sides.

10. **HUMAN CHECKPOINT 2 — Netlify dev preview.** Tell Jamie: "Pushed to dev. Netlify will rebuild https://dev--ekuzo.netlify.app in 1-2 minutes. Once it's live, open `https://dev--ekuzo.netlify.app/blog/summer-camps-for-kids-who-game-2026` and run the same checklist as before. Then validate the Article schema at https://validator.schema.org/ using the dev preview URL. Reply with 'looks good, ship to main' or specific things to fix." Wait for response.

11. **Merge `dev` to `main`.** Run:
    ```
    git checkout main
    git pull origin main
    git merge dev
    git push origin main
    git checkout dev
    ```
    Verify: `git log origin/main --oneline | head -1` shows the merge.

12. **HUMAN CHECKPOINT 3 — production verification.** Tell Jamie: "Merged to main. Netlify is deploying to https://ekuzo.gg now. In 1-2 minutes, open `https://ekuzo.gg/blog/summer-camps-for-kids-who-game-2026` and confirm the page is live. Final checks: the Article schema validates against the production URL at https://validator.schema.org/, and the post appears on `https://ekuzo.gg/blog` under Guides. Reply with 'done' when verified." Wait. Once confirmed, the session is complete.

---

## Voice and copy guardrails

- Any visible micro-copy you author (alt text, placeholder labels, error messages, meta description) must obey `docs/marketing/anti-ai-writing-style.md`. No em dashes. No negative parallelisms ("not X, Y" patterns). No banned vocabulary.
- Do **not** modify the body content of the post during the build. The text in the markdown draft is signed off. If you spot something that genuinely seems factually wrong, flag it to Jamie before changing it.
- The Karlin byline reads as "By Karlin, founder of EKUZO" or whatever exact form his bio uses on the camps page.

## Acceptance criteria summary

- `npx tsc --noEmit` passes
- `npx next dev -p 3001` runs without console errors
- `/blog` index renders the new card under the "Guides" filter
- `/blog/summer-camps-for-kids-who-game-2026` renders correctly with all body elements styled
- Karlin video iframe loads and plays
- Jynxzi wireframe placeholder visible and obviously incomplete
- Article + Person schema validate clean at https://validator.schema.org/
- All 3 internal links to `/programs/ekuzo-camps` navigate correctly
- "Keep Reading" cross-link to K1ng post navigates correctly
- All commits land on `dev` first, then merge to `main`
- Production verified live at https://ekuzo.gg after final merge
