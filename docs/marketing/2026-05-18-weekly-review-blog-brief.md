# Weekly review brief — blog program

Date: 2026-05-18
Owner: Jamie
Related: [blog-strategy.md](./blog-strategy.md), [blog-keyword-map.md](./blog-keyword-map.md)

---

## Strategic frame (the why, in three sentences)

EKUZO sells youth esports. The blog competes in **youth development**, because the addressable problem-category search market (loneliness, screen time, sports alternatives, quiet kids) is 10–50x bigger than the product-category market and the competitive landscape there is essentially empty. The program is a 12-post roadmap mapped to a 3-act spine: Act 1 names the parent's problem with real research, Act 2 makes the case that gaming is part of the answer, Act 3 shows what structured esports actually does.

---

## What we've shipped (2 posts since the 4/14 strategy)

**5/14 — "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)"** (Karlin, Guides)
Strong execution of the [answer-shaped framework](../../../knowledge-base/wiki/frameworks/answer-shaped-content-for-ai-citation.md): question-form H2s, comparative cost/coach-type table across 4 camp categories, names competitors honestly (iD Tech, IMG, NXT UP). This is **non-commodity content** in the Google AI Optimization Guide sense — specific, comparable, first-hand. Not on the original 12-post roadmap; an opportunistic seasonal commerce play in the product-category lane. Right call for May timing, but doesn't test the problem-category reframe.

**5/16 — "Why League of Legends is perfect for youth development"** (Karlin, Guides)
Aligns to Post #12 ("Why League, not Valorant or Fortnite"). The strongest piece of answer-shaped craft in the program so far: FAQPage schema, VideoObject schema with full reel transcript, 6 question-form H2s, comparative section explicitly answering "Why not Fortnite, Minecraft, Roblox, or VALORANT?", strong external citations (Worlds 2025 6.75M viewers, Arcane, NASEF 65% STEM, Riot Honor system). Founder voice with credentials in the schema layer. This is an Act 2 objection-interception post — high citation potential, but doesn't pull upstream parent-pain traffic.

**The honest read:** both posts are good. Both are Act 2/3, product-category. Zero Act 1 problem-category posts have shipped. The strategic reframe is currently theory.

---

## What's next (recommended 2–3 posts)

**Post #1 — "Teenage son has no friends: a parent's guide to what's really happening"** (Jamie, Act 1, Cluster 1: male loneliness)
The post the reframe is built around. Core question: *my teenage son has no friends — what's actually going on?* Strongest research base in the entire program (Surgeon General 2023, Reeves friendship recession, Survey Center 2021, Haidt). Closes by introducing structured environment + shared interest + adult scaffolding — sets up Posts #4, #5, #12 as internal-link spokes. Why now: until an Act 1 post ships, we're not testing the thesis the whole program rests on. Needs the standardized "when to seek a professional" note.

**Post #3 — "Is my kid addicted to video games, or just into them? A framework for parents"** (Karlin or Jamie+Karlin co-byline, Act 1, Cluster 3: screen time)
Core question: *is heavy gaming the same as addiction?* Pairs directly with the just-shipped LoL post — that post handles "is the game dangerous," this one handles "is the behavior dangerous." Together they retire the two biggest parent objections and form a clean hub-and-spoke loop. AAP 5Cs framework is the most citable explainer territory in the keyword map. High search anxiety + low organized competition = highest-leverage Act 1 piece after #1.

**Post #5 — "Your gamer son isn't antisocial. He's in an unstructured social environment."** (Jamie, Act 2, Cluster 1+3 cross-cluster)
Core question: *my son plays video games and has no real friends — is that the games' fault?* This is the manifesto thesis translated into parent-query shape. It's the bridge between Post #1 (problem) and Post #12 (already shipped — the game). Once this ships, the 3-act spine is visible to readers and to crawlers.

*This is a deviation from the original Month 1 plan, which called for Post #4 (Quiet son thrives in esports) third. #4 is still strong — Cluster 2 (social anxiety/quiet kids) is untouched, the Communication outcome doc has it ~80% drafted, and it ships fastest. If we want to maximize cadence this month, swap #5 for #4. If we want the spine visible this month, keep #5.*

Order matters: #1 → #3 → #5 (or #4). That sequence builds the spine left-to-right and gives every future post upstream internal links to attach to.

---

## Open blockers

- **Faith / Karlin bio** — *resolved.* `coachKarlinSchema` is live with credentials (peak Challenger jungler, $80K+ scholarships, LinkedIn). The strategy doc still calls him "Faith" — a stale framing artifact worth correcting on the next pass.
- **Article + Person schema for /blog/[slug]** — *resolved.* `buildBlogArticleSchema` defaults `author` to Karlin's Person `@id`. Both new posts use it.
- **Reference-implementation Post #1** — *still pending.* Was supposed to be the first draft; we shipped #12 and a seasonal guide instead.
- **Critique of pre-strategy posts (Ryan/K1ng, John Hay)** — *still pending.* Both sit on the index unreframed; with the lens applied they're already loneliness (Ryan) and anxiety (John) stories.
- **Decision journal entry for the youth-development reframe** — *still pending* in `knowledge-base/logs/decisions/`. Adjacent decisions exist (2026-04-22 category-creation) but not this one specifically.
- **Blog index framing** — `STORIES OF GAMING AND GROWTH` is Act 3 language. Once #1, #3, #5 ship, the H1 and category taxonomy (currently Testimonials / Case Studies / Guides) need to flex to admit Perspective (Act 1) and Method (Act 2).

---

## Push-back for the room

If we ship a fourth Act 2/3 post next instead of an Act 1 post, we should be honest that we've quietly abandoned the [problem-category positioning](../../../knowledge-base/wiki/frameworks/problem-category-positioning.md) reframe and reverted to product-category content. That's a defensible business decision (the shipped posts have real commerce value), but it should be a decision, not a drift.
