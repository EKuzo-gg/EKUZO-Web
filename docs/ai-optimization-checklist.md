# AI Optimization Checklist — Web Work

Operational checklist for ekuzo-web grounded in Google's official AI optimization guide (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide, last updated 2026-05-15).

Use this when:
- Shipping a new page
- Reviewing an existing page for AI / search performance
- Running the monthly `/audit` workflow
- Onboarding new content (blog posts, program pages)

**Durable methodology behind this checklist** lives at `knowledge-base/company/marketing/google-ai-optimization-guide.md`. This file is the operational box-checking version.

---

## The one-liner

Google's position: optimizing for AI Overviews / AI Mode is still SEO. There's no separate AEO / GEO playbook for Google. Do SEO well and you're 90% there. The highest-leverage move is non-commodity content.

---

## Pre-ship checklist for any new page

### Format decision (before drafting)
<!-- Added 2026-08-04 from knowledge-base/raw/social/2026-08-04-vengeons-24h-ranking-checklist.md (step 2). Intent is covered by ai-traffic-intent.md; the format decision downstream of intent was not. -->

- [ ] **Read the live SERP for the target query before choosing the page type.** What Google is
  already ranking tells you what it thinks the query wants. If the top 10 are product or program
  pages and we plan a blog article, we are entering the wrong race. Common outcomes: a program page,
  a comparison page, a guide, or a FAQ block on an existing page rather than a new URL.
- [ ] **Name the target query and the chosen format in the brief.** One line. If neither can be
  named, the page has no search job and should be evaluated on other grounds.
- [ ] **Confirm we are not splitting an existing page's topic.** If an existing EKUZO page already
  targets this query, strengthen it instead of shipping a competitor to ourselves.

### Content layer (highest leverage per Google)

- [ ] **Non-commodity content.** Could a generic AI write this exact content from common knowledge? If yes, rewrite. We want first-hand experience, specific student/coach moments, named events, internal observations, named data — not "10 tips for parents of gamers."
- [ ] **Unique point of view.** What's the EKUZO take that a competitor wouldn't write? If we can't name it, the page isn't ready.
- [ ] **Lead with the answer.** First substantive paragraph answers the question implied by the title. 134–167 words, self-contained, would stand alone if extracted.
- [ ] **Question-shaped H2/H3s** where the topic allows. "Why does EKUZO coach League of Legends?" beats "Our game selection."
- [ ] **At least one named expert quote** with verifiable credentials (Faith, Karlin, Sebastien, a coach). 20–40 words, specific, attributed inline.
- [ ] **Specific numbers with sources.** Every statistical claim has a URL or named source. "Studies show" without a link doesn't earn the claim.
- [ ] **Reader-organized.** Paragraphs, sections, headings. Not a wall of text.
- [ ] **Helpful, reliable, people-first.** Google's exact test: would a visitor find this satisfying?

### Visual content

- [ ] **High-quality images and video where they add value.** Generic stock imagery doesn't qualify. Real coach photos, real students mid-game, real moments.
- [ ] **Image alt text** describes the content meaningfully. Not "image.png".
- [ ] **Video captions / transcripts** present for testimonial videos and any narrative video content (we have `.txt` transcripts in `public/testimonial-videos/` — keep that pattern).
- [ ] **Critical info is NOT trapped in canvas / SVG / image-only.** Anything an AI agent needs to extract must also be in semantic HTML or alt text.

### Technical layer

- [ ] **Page is indexable.** No `noindex` on the page itself or its parent route (legitimate exceptions: register / success pages — they correctly carry noindex per `ekuzo-web/CLAUDE.md`).
- [ ] **Canonical URL set** via Next.js metadata API (`alternates.canonical`). All public pages should have this.
- [ ] **Page loads with content in initial HTML** (server-rendered). Don't gate main content behind client-side JavaScript only. Next.js App Router server components handle this by default; verify if anything is client-only.
- [ ] **Mobile-friendly** — responsive layouts, tap targets, readable type.
- [ ] **Core Web Vitals** — LCP, CLS, INP within green thresholds. Use PageSpeed Insights for a spot check.
- [ ] **Semantic HTML where natural.** `<article>`, `<section>`, `<nav>`, proper heading hierarchy (one H1 per page, H2/H3 not skipped). Don't obsess about perfect HTML, but don't shred semantics either.
- [ ] **At least 5 internal links point AT the new page** from existing pages, before it ships.
  <!-- Added 2026-08-04 from knowledge-base/raw/social/2026-08-04-vengeons-24h-ranking-checklist.md (step 5). Inbound internal links were not previously a gate; only outbound linking was implied. -->
  Not links *from* the new page, links *to* it. A page nothing points at is a page nothing crawls.
  Sources to check: related blog posts, the relevant program page, `/faq`, the blog index, and any
  page whose topic genuinely overlaps. If we cannot find five honest placements, that is a signal
  the page duplicates something we already have, or targets a topic the site has no surrounding
  context for.
- [ ] **Anchors carry the entity and the relationship.** "Read more" and "click here" pass link
  value and zero association. Name the thing being linked to. Five vague anchors count as five
  links and do none of the work.
  <!-- Added 2026-08-04 from knowledge-base/raw/social/2026-08-04-floate-position-9-30-query-gap-method.md (step 5). The Vengeons gate counted links; this is the part that makes them mean something. -->
- [ ] **Visible last-updated date rendered in the HTML,** not only in schema. Freshness reads as a
  live retrieval signal. Note: three date formats coexist across blog posts as of the 2026-07-28
  author-layer audit; standardize on the way through.

### Structured data (schema)

Per Google: not *required* for generative AI, but still recommended for rich results.

- [ ] **Schema lives in `lib/schema.ts`** — single source of truth. No hand-rolled JSON-LD in page files (this rule is in `ekuzo-web/CLAUDE.md`).
- [ ] **Rendered via `<JsonLd>` component** server-side.
- [ ] **Page has appropriate schema:**
  - Marketing pages → `Course` + `Offer` for program pages, plus `BreadcrumbList`, plus `FAQPage` if FAQs exist
  - Home → `EducationalOrganization` + `WebSite` (from `rootGraph` in layout)
  - Blog post (future) → `Article` + named `Person` author
  - Pages with testimonial videos → `VideoObject` graph
- [ ] **Validated** at https://validator.schema.org/. Paste the rendered `@graph`.
- [ ] **No fabricated data in schema** — `aggregateRating`, `reviewCount`, prices, dates must be real. See `wiki/frameworks/schema-vs-marketing-voice.md`.

### Accessibility / agent-readiness

Browser agents read DOM, screenshots, and the accessibility tree. Accessibility wins double here.

- [ ] **Logical heading hierarchy** (H1 → H2 → H3 without skipping).
- [ ] **ARIA where it earns the markup** (forms, dialogs, dynamic content). Don't add ARIA where native HTML already does the job.
- [ ] **Focus states visible** on interactive elements.
- [ ] **Forms label every input.** No placeholder-only labeling.
- [ ] **Color contrast meets WCAG AA** at minimum for body text and CTAs.

### Robots / crawlers

- [ ] **Page is reachable from the sitemap** (most pages auto-included; verify for any new top-level route).
- [ ] **AI crawlers not blocked** in `robots.txt`. Specifically: GPTBot, ClaudeBot, PerplexityBot, Google-Extended should all be allowed unless we have a deliberate reason to block them. Audit during monthly `/audit`.
- [ ] **`public/llms.txt` updated** when adding a meaningful new section of the site. Note: per Google's 2026-05-15 guide, llms.txt is NOT used by Google. Keep it for non-Google AI (Claude, Perplexity, ChatGPT) but don't expect Google to read it.

---

## Things Google explicitly says you DON'T need to do

Stop worrying about / don't spend time on:

- ❌ **Chunking content into tiny pieces.** No ideal page length. Write what the topic deserves.
- ❌ **Rewriting copy in an "AI-friendly" voice.** Synonyms are handled. Write well for humans.
- ❌ **Creating separate pages for every long-tail variant.** That's scaled-content spam policy territory. Topical depth is what matters, not page count.
- ❌ **Buying or seeding inauthentic "mentions"** on forums, blogs, or social. Spam systems catch them.
- ❌ **Special AI-only markup** beyond what we already use.
- ❌ **Treating schema as the secret sauce.** It's a useful SEO component — not a magic AI bullet.

---

## Weekly: Search Console climber triage
<!-- Added 2026-08-04 from knowledge-base/raw/social/2026-08-04-vengeons-24h-ranking-checklist.md (step 8). Fills a real gap: /audit is a monthly technical sweep, so nothing watched week-over-week impression movement or routed it into a rewrite decision. -->

Ten minutes, Friday, alongside the rest of the weekly block. The monthly `/audit` catches technical
regressions; this catches opportunity.

> **Cadence lives in the KB (2026-10-12).** The canonical Search Console routine is
> `knowledge-base/company/marketing/search-console-playbook.md` § Reading it: the cadence; property
> record and saved views in `search-console.md`. At ekuzo.gg's current traffic (first content-gap run
> returned WATCH LIST), run this triage only once 20 non-brand queries have 100+ impressions each.

- [ ] **Open Search Console, Performance, last 28 days compared to previous 28 days.** Sort by
  impression change, descending.
- [ ] **Filter to positions 8-20 and export.** These are pages Google already trusts and is
  testing. You are not fighting for entry into the result set, only for the answer, which is a much
  easier fight than a new page faces.
  <!-- Sharpened 2026-08-04 from knowledge-base/raw/social/2026-08-04-floate-position-9-30-query-gap-method.md. The original rung said "position 5-20, rework them" without defining rework. Consolidated into this one rung rather than added as a parallel one. Source says 9-30 in step 1 and 8-20 in step 3; 8-20 chosen because impression data thins past ~20 and the already-trusted premise weakens. -->
- [ ] **Run the query gap.** Filter each page by its queries and find terms it collects impressions
  for where the page never directly answers the question. Search Console is telling you what Google
  thinks the page is about and exactly where the page fails to deliver it. This is the step that
  gets skipped and it is where the value is.
- [ ] **Write self-contained blocks for the gaps.** For each unanswered query: a heading matching the
  query as literally as it can, a one to two sentence direct answer, then two to three supporting
  lines. **Claim and evidence sit in the same block.** No intro, no padding. Retrieval splits the
  page into chunks without regard for paragraph logic, so a claim whose source landed in the next
  chunk gets extracted without its support. That matters more for EKUZO than for most publishers,
  because sourced claims are the differentiator.
- [ ] **One page per week is enough.** Do not batch this into a quarterly project.
- [ ] **Leave the flat pages alone.** A page with no impression movement after a month has a
  demand or a targeting problem, and neither is fixed by editing the copy. Those go on the monthly
  list, not the weekly one.
- [ ] **Log what changed and the date**, so the next month's `/audit` can attribute movement.

The reasoning: early positive signal predicts headroom more reliably than diagnosing a failure does,
and it costs less to act on. Revisit this cadence once the blog is past roughly 30 published pages,
where one page a week stops being meaningful coverage.

---

## During monthly `/audit`

The `/audit` slash command in Claude Code already runs the schema + citability + crawlers + llms.txt checks across 11 URLs. After running:

- [ ] **Compare SUMMARY.md scores against the prior month.** Regressions get flagged in the summary.
- [ ] **Read Google's "What's new" docs page** (https://developers.google.com/search/updates) for any guidance changes since last audit. If the AI optimization guide updated, re-read the relevant section.
- [ ] **Manually spot-check 1–2 pages in Search Console** for crawl errors, indexing status, performance.
- [ ] **Manually spot-check 1–2 pages with PageSpeed Insights** for Core Web Vitals regressions.
- [ ] **If we shipped major new content, request indexing** in Search Console for those URLs.

---

## When in doubt

Google's own self-test:

> "Is this content that my visitors would find satisfying?"

If yes, ship. If no, fix the content. Don't try to compensate for thin content with technical tricks — the technical tricks have all been deprecated, and Google's been increasingly explicit that they don't work.

---

## References

- [Google's AI Optimization Guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — the source of this checklist
- [Google's guide to helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google's guidance on AI-generated content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) — relevant for any content Stanley.ai or similar tools produce
- [Search Essentials](https://developers.google.com/search/docs/essentials) — technical requirements
- [Agent-friendly website best practices on web.dev](https://web.dev/articles/ai-agent-site-ux) — Google's pointer for browser-agent readiness
- KB durable methodology: `knowledge-base/company/marketing/google-ai-optimization-guide.md`
- Related KB frameworks: `geo-invisible-wins-first.md`, `answer-shaped-content-for-ai-citation.md`, `schema-vs-marketing-voice.md`
- ekuzo-web schema source of truth: `lib/schema.ts`
- ekuzo-web monthly audit output: `reports/YYYY-MM-DD/SUMMARY.md`
