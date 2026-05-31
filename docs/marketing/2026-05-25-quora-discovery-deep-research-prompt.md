# Quora Discovery — Deep-Research Prompt

Created: 2026-05-25 · Purpose: hand a deep-research tool (ChatGPT / Gemini / Perplexity deep
research) our 7 blog posts and have it find the live Quora questions each post can genuinely answer,
so EKUZO can post helpful, credentialed answers that seed the posts and become LLM-citation assets.

**How to run:** paste the prompt below into a deep-research mode. Give it the 7 live URLs (it can
fetch them). Output is a *candidate list we verify + triage + draft from* — not auto-posted answers.

**After it runs:** (1) verify each Quora URL is real and currently live, (2) triage for genuine fit,
(3) draft answers in Karlin's/Jamie's voice (real-name, disclosed-expertise — Quora rewards it),
(4) Karlin/Jamie post manually.

---

## The prompt

> I run growth for **EKUZO**, a youth esports *coaching* program (kids 10–17; best fit 10–13
> tweens). We turn a kid's existing gaming into a structured, coached, team-based experience —
> like a youth sports program built around games such as League of Legends. I want to find live
> **Quora** questions that our existing blog posts can genuinely and helpfully answer, so I can
> write substantive, expert answers (disclosing that I'm the founder) and link the relevant post
> as a "go deeper" resource. This is value-first, not spam.
>
> ### Our 7 blog posts (fetch each; the one-liner is what it can answer)
> 1. https://ekuzo.gg/blog/what-your-kids-gaming-is-telling-you — how to read the six "tells" of a
>    kid's gaming (rage after a loss, hours with nothing to show, the logoff fight, social in-game
>    but quiet outside, downplaying how much it matters, skilled-but-stuck); why the answer is
>    structure, not "less gaming" or "more gaming."
> 2. https://ekuzo.gg/blog/league-of-legends-youth-development — why League of Legends specifically
>    for youth coaching; whether it's too toxic; why not Fortnite/Valorant/Minecraft/Roblox; what
>    League actually develops.
> 3. https://ekuzo.gg/blog/when-gaming-helps-homeschool-kids — when gaming helps vs. harms
>    homeschool kids, what decides it, what parents can do at home.
> 4. https://ekuzo.gg/blog/what-homeschool-parents-taught-us-about-gaming — which games worry
>    parents and which don't; what experienced homeschool families agree on about gaming.
> 5. https://ekuzo.gg/blog/summer-camps-for-kids-who-game-2026 — how to choose a summer gaming
>    camp; the categories of camps; what a coached camp week looks like.
> 6. https://ekuzo.gg/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life — a
>    student's first-person story: esports and confidence/belonging through social anxiety.
> 7. https://ekuzo.gg/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng — a parent's story
>    of her son's experience with structured esports.
>
> ### Task
> **A. For each post**, find **live Quora questions it genuinely answers.** For every question return:
> - Exact question title and the **full Quora URL** (must be a real, currently-live question — do
>   NOT invent or guess URLs; if you can't confirm it exists, drop it).
> - Engagement signals you can see: number of answers, followers, and/or views, and how **recent**
>   the latest activity is (favor questions with real traffic and recent activity; flag stale ones).
> - The asker's **underlying job** — are they seeking *structure/support* (good fit for us) or
>   *restriction/abstinence* (poor fit)? Skip pure-restriction and clinical-crisis questions.
> - **Why our post answers it** (one line) and a **2–3 line suggested answer angle**.
> - Whether linking the post is appropriate or the answer should stand alone.
>
> **B. Content-gap pass (bonus).** Separately, list **high-demand Quora questions that NONE of the 7
> posts answer**, within these parent-pain clusters: (1) male loneliness / a son with no friends,
> (2) social anxiety / shy or quiet kids, (3) screen-time and "is my kid addicted to video games,"
> (4) alternatives to traditional sports / a kid who doesn't fit sports, (5) gaming + neurodivergence
> (ADHD/autism), (6) girls and gaming. These are content-roadmap signals — rank them by apparent
> demand.
>
> ### Fit rules (important)
> - Match on **topic + the asker's real job + whether our post genuinely answers it + the question
>   has real visibility/traffic.** A loose keyword match is not a fit.
> - **Only real, verifiable, currently-live Quora URLs.** No fabricated or dead links. If unsure,
>   omit it and say so.
> - Quora gates some content behind login/JS, so work from publicly indexed questions; note where
>   coverage is uncertain rather than guessing.
> - Don't write final posted answers — return the inventory and angles; a human drafts and posts.
>
> ### Output format
> A table grouped by post (Part A) and a separate ranked table (Part B), columns:
> `matched post | question title | Quora URL | answers/views/recency | asker's job | why it fits |
> suggested angle | link? (y/n)`. Put the highest-opportunity questions at the top of each group.

---

## Notes

- **Credential posture** (for when we draft): answer as **Karlin Oei, Founder of EKUZO** (or Jamie),
  real name, expertise disclosed — Quora *rewards* this, unlike Reddit. Never fabricate a credential
  (the rule still holds). See `EKUZO/Marketing/channels/reddit/best-practices.md`.
- **Why Quora over Reddit for this:** answers are evergreen, LLM-cited, and tied to a real author
  entity — they compound, and disclosed expertise is an asset rather than a liability.
- **Feeds two things at once:** Part A seeds existing posts; Part B ranks the next posts by live
  demand (the validation signal Reddit didn't give us). Cross-check Part B against
  `blog-keyword-map.md` and the gap analysis in `2026-05-25-blog-coverage-llm-audit-and-next-posts.md`.
