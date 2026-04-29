# EKUZO Blog Strategy

Owner: Jamie
Last updated: 2026-04-14
Status: Living doc
Related: [blog-keyword-map.md](./blog-keyword-map.md) — parent-query intent map and ranked post roadmap

---

## How to use this doc

This is the context doc for anyone writing EKUZO content: Aaron, Jamie, Faith, contractors, or an LLM being briefed to draft a post. It has three jobs:

1. Encode **why the blog exists** and what it is and is not, so voice stays consistent across authors.
2. Map the **content primitives** (pillars, outcomes, obstacles, themes) that every post draws from, so ideas are generated against a known inventory instead of from scratch.
3. Wire the blog into the **site's link graph and schema architecture**, so every post compounds topical authority for the rest of the site.

If you are coming in cold, read sections 1-5 for the strategy, then skip to the **Content Anchor Inventory** (section 8). That table is the source-of-truth for what EKUZO can credibly write about and is designed to be generative: you can scan it and propose new posts against it.

Cross-reference `blog-keyword-map.md` for ranked priority, target search queries per post, evidence anchors, and the 3-month ship plan.

---

## 1. Purpose

The blog is EKUZO's citable evidence layer. Program pages sell. The blog proves.

Its job is to win mentions in ChatGPT, Claude, Perplexity, and Google AI Overviews when a parent asks questions about youth development (loneliness, screen time, alternatives to sports, social anxiety), so the parent arrives on ekuzo.gg already having seen EKUZO framed as an authority, not as one of many program listings.

Secondary job: give parents mid-consideration a place to go deeper than a marketing page without leaving the site.

Tertiary job: be the connective tissue between the manifesto page, the explainer pages (outcomes, iceberg), and the program pages. Without the blog, depth has nowhere to live.

---

## 2. Audience

**Primary:** parents of 10-17 year olds who are worried about something specific — a son who has no friends, a kid who was cut from the team, a daughter who is anxious about school, a family that has lost control of screen time. These are the parents typing high-intent searches at 11pm.

Commerce tie-in: EKUZO Camps, EKUZO100.

**Secondary (deferred):** school admins and athletic directors evaluating esports programs. Different voice, different evidence needs. Revisit once the parent pillar is established. Mixing audiences in v1 dilutes both.

---

## 3. The strategic reframe: from youth esports to youth development

This is the single most important strategic decision in the blog program. It determines search territory, competitive landscape, voice, and evidence posture.

EKUZO is nominally a youth esports company. Functionally, it is a youth development program that uses esports as the medium. The blog competes in youth development search territories, not in youth esports search territories.

### Why this reframe is strategically strong

1. **The addressable search market is 10-50x bigger.** "Youth esports" is niche. "My teenage son has no friends" is mass-scale. "My kid doesn't like sports" is mass-scale. "How much screen time for teens" is mass-scale. The youth development lens puts EKUZO in front of the queries parents actually type when something is wrong, which is where real intent lives.
2. **The competitive landscape empties out.** In "youth esports" you are fighting PlayVS, NASEF, Generation Esports, XP League. In "structured solutions to male loneliness for gamer kids" you are fighting almost nobody in an organized content way. Therapists have blogs, parenting columnists have opinions, nobody owns the intersection. That is a lane.
3. **It matches what the testimonials already are.** Re-read Ryan/K1ng and John Hay with this lens. Both are already youth development stories. Ryan: bullied, isolated, reluctant to leave the house, found belonging. John: anxiety, perfectionism, near-failing grades, reframed by a coach. They are esports-delivered but they are loneliness and anxiety stories. The material exists. We just had not been framing it that way.
4. **It starts where the parent is, not where we want them to be.** Parents don't wake up searching "why does gaming matter." They wake up searching "how do I help my son." Problem-first content meets them at the moment of highest intent.

### The critical credibility guardrail

EKUZO is not therapy. We cannot rank for "how to help my socially anxious teenager" with content that implies enrolling a kid solves social anxiety, because that is both dishonest and a claim that will eventually break trust. Every post in the loneliness, anxiety, or screen time clusters has to do two things simultaneously:

- **Take the problem seriously.** Cite the Surgeon General's 2023 loneliness advisory, Jonathan Haidt's *The Anxious Generation*, Richard Reeves on boys, Aspen Institute's youth sports data. Real sources, real weight.
- **Position EKUZO as one specific contribution**, not a cure. A structured environment that creates friendships through shared interest under coached supervision. Not a replacement for therapy. A meaningful intervention for a specific kind of kid.

Done right, this earns trust. Done wrong, it sounds like a wellness supplement company pitching its product as a loneliness solution. Faith's voice as a coach who has actually watched kids change keeps it honest. Jamie's voice as a parent and operator (not a therapist) keeps it honest too.

Every post in these clusters needs a short, standardized "when to talk to a professional" note. Draft once, reuse.

---

## 4. The three-act pillar (parent-pain spine)

Every post maps to one of three acts. The old spine started from gaming. The new spine starts from parent pain, because that is where search intent lives.

**Act 1 — The Problem.**
Youth development is broken for a specific kind of kid: the one who doesn't fit the sports pipeline, struggles to make friends, spends a lot of time on screens, shows signs of anxiety or isolation. Act 1 content names the problem honestly, cites research, validates the parent's worry without catastrophizing. These are the highest-intent, highest-volume search plays.

**Act 2 — Why Gaming Is Part of the Answer.**
The manifesto thesis translated into parent-query shape. Gaming is where this generation already is, and the real variable is the environment around the game. Sports didn't become developmental because of the game; they became developmental because of what was built around them. Same logic applies to gaming. Act 2 is where we earn the right to talk about EKUZO without sounding like we're selling.

**Act 3 — What Structured Esports Actually Does.**
The EKUZO-specific layer. Outcomes explainer, iceberg pillars, named coach and student stories. How the system produces belonging, communication, confidence, leadership in kids who would not have found them elsewhere. Act 3 is the conversion layer.

A reader landing at Act 1 should be able to move through Acts 2 and 3 on-site without hunting. Internal links enforce this.

---

## 5. The three-layer content architecture

The site is not "marketing pages + a blog." It is a three-layer content system, each layer with a distinct job.

| Layer | Pages | Job | Citation behavior |
|---|---|---|---|
| **Manifesto** | `/why-gaming-matters` | Set the physics. Brand gravity. Resonance. Shareability. | Intentionally un-citable by design. Refuses to specify audience or outcome. |
| **Explainer** | `/schools/outcomes`, `/programs/ekuzo-system`, parent equivalent | Orient the reader. Survey-level depth. Invite the curious further in. Modular blocks. | Some citation value. Section headers extract well for topical queries. |
| **Blog** | `/blog/[slug]` | AI citation. Objection interception. Internal-link authority. Deep, answer-shaped content. | Primary citation surface. Answer blocks, Faith quotes, named case studies. |

The blog is the **depth layer** for the explainer pages. Every bolded sub-header in an explainer page is a potential blog post. That is architecture, not accident.

### Hub-and-spoke pattern

Marketing and explainer pages are hubs. Blog posts are spokes.

- The hub summarizes in a sentence or two and links out to the full piece.
- The spoke carries the depth and links back to the hub plus sibling spokes.
- Canonical search authority lives on the spoke (because it is deeper and answer-shaped); the hub aggregates and invites further reading.

This pattern works because it lets marketing pages stay tight (matching short attention spans) while depth accumulates elsewhere for readers who want it and for crawlers who reward it.

---

## 6. FAQ-as-format: logistics FAQs vs strategic FAQs

Not every parent question becomes a blog post. The test:

- **Logistics FAQs** → program page. "When does camp start?" "What's the refund policy?" "What should my kid bring?" These are transactional. They belong on `/programs/*` or `/faq`.
- **Strategic FAQs** → blog. "Why do you only coach League of Legends?" "How do you handle toxicity in chat?" "Is esports actually a sport?" "Is my kid too young for this?" These reveal how EKUZO thinks. They are thought leadership disguised as FAQ answers.

**The test:** if a thoughtful competitor could read the answer and still not know how to replicate EKUZO, it's blog-worthy. If they could read it and execute, it's program-page copy.

**Format tip that unlocks AI citation:** frame strategic FAQs comparatively, not defensively. "Why League" is fine. "Why League, not Valorant or Fortnite" is 5x more citable. Comparative framing forces articulation of the EKUZO lens and matches the query shape parents actually type.

---

## 7. Search clusters (summary)

Four parent-pain search territories where EKUZO has a credible, defensible angle. Full query lists and intent classifications live in `blog-keyword-map.md`.

| Cluster | Representative parent query | EKUZO lane |
|---|---|---|
| **Male loneliness & friendship formation** | "teenage son has no friends," "my son only plays video games and has no friends" | Very strong. Reeves' structural-scaffolding thesis maps directly to EKUZO. |
| **Social anxiety & quiet kids** | "activities for introverted teens," "clubs for shy teenagers" | Strong. The Communication outcome is literally about this. Careful on "anxiety" as clinical term. |
| **Unstructured screen time & gaming balance** | "is my kid addicted to video games," "how much gaming is too much for teens" | Very strong. The structured-vs-unstructured distinction is the central EKUZO thesis. |
| **Alternatives to traditional sports** | "my kid doesn't like sports what else is there," "activities for non-athletic kids" | Strongest. Sports pipeline is narrowing (Aspen 2024). EKUZO fills the gap nobody is competing for. |

---

## 8. Content anchor inventory

This is the generative table. Each row is a content primitive EKUZO can credibly write about. Scan to find gaps, propose new posts, or select evidence anchors for a post already on the roadmap.

**How to read this table:**

- **Type:** what kind of primitive this is. Iceberg pillars and outcomes come from the explainer pages. Obstacles are parent frictions or search-intent triggers. Themes are cross-cutting arguments.
- **Query territory:** what parent-pain cluster this anchor naturally maps to.
- **Evidence:** what EKUZO or external source backs it.
- **Natural post format:** what kind of post this anchor produces best.
- **Act:** 1 (Problem), 2 (Gaming is part of the answer), 3 (What EKUZO does).
- **Status:** where we are in surfacing this anchor. "Drafted" means raw material exists in spec docs. "Needs development" means the concept is clear but nothing is written. "Not started" means idea only.

### Iceberg pillars (from `/programs/ekuzo-system`)

| Anchor | Type | One-line description | Query territory | Evidence | Natural post format | Act | Status |
|---|---|---|---|---|---|---|---|
| **Play** | Pillar | Gaming is the medium, not a reward. Motivation starts naturally because effort and focus already exist in play. | Screen time, sports alternatives | Iceberg draft, manifesto Block 6 | Manifesto companion / "Why gaming is a developmental medium" | 2 | Drafted |
| **Social** | Pillar | Real relationships through shared goals, consistent teams, shared standards. Community, not chat. | Male loneliness, social anxiety, screen time | Iceberg draft, Reeves, Surgeon General | "Your gamer son isn't antisocial, he's unstructured" / online friendship piece | 2 / 3 | Drafted |
| **Competition** | Pillar | Real matches, shared objectives, culminating tournaments. Gives practice a reason to matter. | Sports alternatives, confidence | Iceberg draft, Confidence outcome narrative | "The tournament moment" / "Why competition works for shy kids" | 3 | Drafted |
| **Learning** | Pillar | Trained coaches, shared curriculum, master-coach weekly support, scientific-method project work. | Screen time (productive vs unstructured), sports alternatives | Iceberg draft, Faith's methodology | "What coached play actually looks like" / AAP 5Cs explainer bridge | 2 | Drafted |
| **Safety** | Pillar | Nationally certified coaches, monitored sessions, digital citizenship training, culture set by adults. | Screen time, toxicity objection, younger/girl gamer concerns | Iceberg draft, coach certifications | "Is esports safe for my kid?" / moderation and culture piece | 2 | Drafted |

### Outcomes (from `/schools/outcomes`)

| Anchor | Type | One-line description | Query territory | Evidence | Natural post format | Act | Status |
|---|---|---|---|---|---|---|---|
| **Belonging & Inclusion** | Outcome | Students build identity, not get issued one. Jersey design ritual as entry point. | Sports alternatives, loneliness | Outcomes draft, Ryan/K1ng story | "How shared interest builds belonging where sports don't" | 3 | Drafted |
| **Curiosity & Transfer** | Outcome | Motivation doesn't stay in the game. Science-fair-style project work, transfer to other classes. | Screen time (productive), school evaluation | Outcomes draft, specific project examples | "When gaming becomes a science project" / "Transfer from game to life" | 3 | Drafted |
| **Communication & Social Growth** | Outcome | Quietest students often speak up most in-game because teamwork requires it. | Social anxiety, shy kids, loneliness | Outcomes draft, Faith observations | "Why your quiet son might thrive in esports" | 3 | Drafted |
| **Confidence & Agency** | Outcome | Culminating tournaments make growth visible. Students plan, hype, and run events. | Confidence, sports alternatives | Outcomes draft, Confidence narrative | "The tournament moment" / "How esports makes growth visible" | 3 | Drafted |
| **Leadership & Contribution** | Outcome | Interdependence creates the expectation that students step up when the team needs them. | Sports alternatives, character development | Outcomes draft, leadership narrative | "Leadership emerges from interdependence" | 3 | Drafted |

### Obstacles (parent frictions and search-intent triggers)

| Anchor | Type | One-line description | Query territory | Evidence | Natural post format | Act | Status |
|---|---|---|---|---|---|---|---|
| **"What games do they play?"** | Obstacle | #1 sales objection. Parent shirks if it's not their kid's game. | Game-specific | Faith's coaching rationale, game mechanics comparison | "Why League, not Valorant or Fortnite" comparative FAQ | 2 | Not started |
| **"Is it safe?"** | Obstacle | Toxicity fear. Online communication. Moderation approach. | Screen time, safety | Safety pillar, coach certification, monitoring process | "Is esports safe for my kid?" comprehensive answer | 2 | Not started |
| **"Is it just more screen time?"** | Obstacle | Can't justify adding hours on top of already-high use. | Screen time | AAP 5Cs, structured-vs-unstructured thesis, Ferguson 2024 | "Productive screen time" / "Not all screen time is equal" | 1 / 2 | Not started |
| **"Is this a real activity?"** | Obstacle | Doubts about legitimacy vs. traditional sports. | Sports alternatives | Manifesto Block 6, sports history, Confidence narrative | "Is esports a real sport?" / "100 years of sports history" | 2 | Not started |
| **"My kid isn't athletic"** | Obstacle | Kid washed out of sports or never tried. Parent looking for developmental alternative. | Sports alternatives | Aspen 2024, Belonging narrative, jersey story | "What to do when your kid gets cut from the team" | 1 / 2 | Not started |
| **"My kid is shy / anxious"** | Obstacle | Parent worried social activity will backfire. | Social anxiety | Communication outcome, Faith observations, John Hay story | "Why your quiet son might thrive in esports" | 3 | Partially drafted |
| **"Will this make the gaming problem worse?"** | Obstacle | Parent already concerned about gaming habits. | Screen time | Structured-vs-unstructured thesis, AAP 5Cs, Ferguson 2024 | "Is my kid addicted to video games, or just into them?" | 1 | Not started |
| **"Isn't pro esports a long shot?"** | Obstacle | Is this a viable path? (EKUZO's answer: it's not about going pro, it's about development.) | Sports alternatives, realistic expectations | Ryan/K1ng post already addresses this | "The value of esports for kids who won't go pro" | 2 / 3 | Needs development |
| **"Who are the coaches?"** | Obstacle | Trust question. Credentials matter. | Safety, program evaluation | Coach bios, certifications, Faith's background | Faith's Person-schema bio + "What to look for in an esports coach" | 3 | Faith bio needed |
| **"Is my kid too young / too old?"** | Obstacle | Age-appropriateness concern, especially for younger gamers in mature-audience games. | Safety, age fit | Safety pillar, Ryan joining at age 12 story | Age-fit explainer | 2 | Not started |
| **"How much does this cost vs. sports?"** | Obstacle | Cost comparison concern. | Sports alternatives | Aspen 2024 (46% cost increase in sports since 2019) | Implicit in "What to do when your kid gets cut from the team" | 1 | Stat citable |

### Cross-cutting themes

| Anchor | Type | One-line description | Query territory | Evidence | Natural post format | Act | Status |
|---|---|---|---|---|---|---|---|
| **Environment > game itself** | Theme | Sports became developmental because of what was built around them, not because of the game. Same thesis applies to gaming. | Screen time, sports alternatives | Manifesto Block 6, sports history research | "Is esports a real sport?" / manifesto companion | 2 | Partially drafted |
| **Structured vs unstructured screens** | Theme | The problem isn't screens, it's unstructured screens. Coached play is categorically different. | Screen time | Iceberg, AAP 5Cs, Ferguson 2024 counter-evidence | "Not all screen time is equal" / AAP 5Cs explainer | 1 / 2 | Not started |
| **Friendship scaffolding** | Theme | Male friendships have historically depended on institutional scaffolding (teams, clubs). EKUZO provides that scaffolding. | Male loneliness | Reeves, Survey Center 2021, Surgeon General 2023 | "Why 15% of young men have no close friends" | 1 | Not started |
| **Virtual as feature, not compromise** | Theme | Virtual delivery expands access, flattens geography, works for kids who don't fit in-person social settings. | Social anxiety, access | EKUZO delivery model | "Why virtual esports coaching works better than in-person for some kids" | 2 | Not started |
| **1:5 ratio + master-coach model** | Theme | Premium coach ratio plus a master coach supporting weekly is differentiated from low-touch league models. | Program evaluation | Iceberg draft, Faith's coaching philosophy | "What to look for in an esports program" comparative piece | 2 / 3 | Not started |
| **Game as transfer mechanism** | Theme | Lessons from League (communication, accountability, tilt management) carry over into life. | Screen time, character development | Curiosity & Transfer outcome, John Hay story | "When gaming becomes a life lesson" | 3 | Partially drafted |

### How to use this table generatively

- **Proposing a new post?** Pick an anchor row that is "Not started" or "Needs development." Check its query territory against `blog-keyword-map.md` to confirm search demand. Combine two anchors (one Obstacle + one Theme, for example) to get a unique angle.
- **Drafting an existing roadmap post?** Look up which anchors it draws from. Every post should weave at least one Obstacle (for relevance) and one Outcome or Theme (for the EKUZO argument). Cite the associated evidence.
- **Stuck on voice?** Read the existing drafted anchor (Outcomes doc, Iceberg doc, manifesto) before writing. The voice is already there; match it.

---

## 9. Research foundation

External sources we can cite honestly. Keep this list fresh; verify every number on publish.

**Loneliness and connection**
- [U.S. Surgeon General 2023 Advisory on Loneliness and Isolation](https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf). 15-24 year olds have 70% less in-person interaction than two decades ago.
- [Survey Center on American Life 2021 American Perspectives Survey](https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/). 15% of American men have no close friends, up from 3% in 1990. Men with 6+ close friends fell from 55% to 27%.
- [Richard Reeves on friendship recession](https://friendshiprecession.com/friendship-rec-bt/). Deinstitutionalization of male friendship; friendships require scaffolding.

**Teen mental health**
- [Jonathan Haidt, *The Anxious Generation*](https://www.anxiousgeneration.com/research/the-evidence). Teen anxiety +134%, depression +106% from 2010-2018. 6-8 hours daily screen-leisure.
- [Ferguson et al 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC9019621/). Meta-analyses finding no correlation between social media time and teen mental health. Cite both sides; the debate is live.

**Screen time**
- [American Academy of Pediatrics 5Cs of Media Use](https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/screen-time-guidelines/). AAP moved from strict hour-limits to a Child / Content / Calm / Crowding-out / Communication framework. Most parents don't know this yet.

**Youth sports**
- [Aspen Institute State of Play 2024](https://projectplay.org/state-of-play-2024-introduction). Costs up 46% since 2019. Teen (13-17) participation still declining. Income access gap at 20.2 points. Only 35% of Black youth 6-17 regularly participated in 2023 (down from 45% in 2013).

**Internal evidence**
- 5 Outcome narratives (Belonging, Curiosity & Transfer, Communication, Confidence & Agency, Leadership & Contribution) — from `/schools/outcomes` spec. Draft quality, already EKUZO-voice.
- 5 Iceberg pillars (Play, Social, Competition, Learning, Safety) — from `/programs/ekuzo-system` spec.
- Manifesto draft (11 blocks) — from `/why-gaming-matters` spec. Block 6 (sports-history parallel) is the most portable.
- Named student stories: Ryan/K1ng, John Hay, plus 9 video testimonials.
- Faith's coaching observations, direct quotes, and eventual Person-schema bio.

**Flag, do not fabricate.** Several industry sources reference GPA lifts (+1.7) and attendance gains (+10%) for students in school esports programs. These may be real but require primary-source verification before citation. Until then, reference the claim and link to the source, but do not adopt the stat as EKUZO's.

---

## 10. Evidence posture

What we cite:

- Named coach credentials with verified bios and Person schema.
- Named student stories published with explicit consent.
- Faith's direct quotes, tight and extractable (20-40 words).
- External research and statistics from credible third parties, properly cited.

What we do not fabricate:

- Aggregate EKUZO outcomes ("% improved," parent NPS) until we instrument them.
- Student counts, retention rates, hours coached until verified.

**Parallel instrumentation track** (not a blog blocker, but worth queuing): a parent NPS survey, end-of-program outcome check, basic enrollment and retention metrics. Investing 4-8 hours here compounds meaningfully by month 3-4 when future posts can say "across X students we have coached, we have observed Y."

---

## 11. Author model

Bylines are real named humans. Writing may be shared with a contractor who drafts and edits. Quotes and ideas belong to the named author and are verified by them before publish. This is how HBR contributors and executive columns work. Done honestly, it is ethical and scalable.

| Author | Lane | Act preference | Prerequisites |
|---|---|---|---|
| **Faith** (Founder/Head Coach) | Methodology, coaching philosophy, expert quotes in every post | 2, 3 | Verified Person-schema bio with credentials |
| **Jamie** (CEO + parent) | Thought leadership, parent-to-parent pieces, investor/operator voice | 1, 2 | None, can ship now |
| **Other EKUZO coaches** | Craft-level pieces, student-coach stories | 2, 3 | Per-coach bios |
| **Parents and students** | Case studies via interview + ghostwritten, bylined with consent | 3 | Consent form, interview intake process |
| **Contractor** | Drafts and edits under the named author, not a byline | All | Onboarded to this doc + keyword map + voice examples |

---

## 12. Cadence

**Target: 2 posts per month.**

- One evidence-heavy editorial piece every two weeks (1,500-2,500 words). Faith, Jamie, or a coach as named author. These are the AI-citation plays.
- Interview-based case studies published opportunistically when consent and materials align. Roughly one per month in addition.

That yields 12-18 posts in 6 months. Quality over volume. Two per week is sustainable only if we downgrade the quality bar, which defeats the purpose.

---

## 13. Role in the site ecosystem

The blog is not a silo. Three specific mechanisms wire it into the site's link graph.

1. **Program and explainer pages link out to blog posts.**
Each program page gets a "Go Deeper" block with 2-3 curated blog posts. `/programs/ekuzo-camps` links to posts about camp week prep, coach credentials, what a tournament feels like. `/schools/outcomes` links to the five outcome-derived posts. `/why-gaming-matters` links to posts that advance pieces of the manifesto thesis.

2. **Blog posts link into program and explainer pages.**
Every post has a contextual CTA in the body that links to the matching hub page, not just the footer banner. An Act 3 case study about a camp kid links to `/programs/ekuzo-camps`. A loneliness piece links to `/schools/outcomes` or the parent equivalent. Internal anchor text matters for topical authority.

3. **Schema makes the relationship legible to crawlers.**
Article schema references the EducationalOrganization from `rootGraph`. Program pages (Course schema) and blog posts share the same Organization node. Faith's Person node is shared across every post he authors and every course he teaches. This gives LLMs a clean entity graph: one org, known people, interlinked content.

The blog is both the thought-leadership layer (credibility for programs) and a backlink-and-relevancy engine (distributing topical authority). Both jobs, one mechanism.

---

## 14. Success metrics

Direct citation is hard to measure but trackable via sampling.

- **Monthly AI citation audit.** Manually query 10-15 parent-intent questions in ChatGPT, Claude, Perplexity, and Google AI Overview. Log whether ekuzo.gg is cited, which URL, what passage. Leading indicator.
- **Organic traffic to /blog/\***, non-branded queries, via Search Console. Month-over-month growth per cluster.
- **Referral traffic from AI platforms** where referrers leak (Perplexity, some ChatGPT surfaces). Track in GA4.
- **Backlinks to blog posts** from third-party sites. Backlinks feed the corpora LLMs train on.
- **Conversion assist.** Number of camps/EKUZO100 buyers who touched the blog before buying. Track via Stripe + GA4.

Weak metric to avoid obsessing over: raw pageviews. The blog exists to drive citation and conversion, not to win a pageview contest.

---

## 15. Anti-patterns

Things we will not do:

- AI-slop phrases: "In today's fast-paced world," "In this article we'll explore," "Let's dive in," generic listicle intros.
- Stat fabrication or vague "studies show" claims. Every stat has a source URL in the post body.
- Generic SEO-blog tone. Every post should be recognizably EKUZO: direct, practical, operator-voice, no hype.
- Posts with no named author.
- Posts that treat loneliness, social anxiety, or gaming addiction as conditions EKUZO cures. These are clinical when clinical, and EKUZO is not a clinical service.
- Posts without a clear act classification. If we cannot place it as Act 1, 2, or 3, we don't publish it.
- Logistics FAQs dressed up as blog posts. Those belong on `/faq` or the relevant program page.
- Publishing a post just because the slot is open. A missed slot beats a weak post.

---

## 16. Operational notes

- **Schema gap.** `/blog/[slug]` needs Article schema with Person (author) and a reference to the Organization node. Currently unbuilt. See the tactical schema plan (to be written).
- **Blog index framing.** Currently positioned as "STORIES OF GAMING AND GROWTH," which is Act 3 language. Once 3-4 posts are live that span Acts 1 and 2, the index framing needs to stretch or pair with a second framing. Not urgent, don't let it calcify.
- **Category taxonomy.** Current categories (Testimonials, Case Studies) work for the existing two posts but are Act 3 only. Add "Perspective" (Act 1) and "Method" (Act 2) when the next wave ships.
- **Faith bio.** Multiple posts in the roadmap rely on Faith's authority voice. A verified Person-schema bio is a prerequisite for those posts. Needs credentials, years coaching, notable students, methodology statement.
- **Contractor onboarding.** Once we commit to 2 posts/month, a writer needs this doc, `blog-keyword-map.md`, a house-style example (ideally one complete reference post), and a source verification checklist. The house-style reference post is the next thing to write.
- **Parent-facing outcomes page.** The Outcomes spec is written for `/schools/outcomes` but the patterns are explicitly reusable for parents. Worth considering a parent equivalent (`/parents/outcomes` or a section of `/parents`) so the same five outcome blog posts serve two hub pages.
- **Search Console verification.** Confirm ekuzo.gg is verified in GSC. The top-50-queries report is the fastest way to firm up the keyword map with real impression data.

---

## 17. Open questions and pending decisions

- Is the parent-equivalent outcomes page a new route or a section of `/parents`?
- Who writes the "when to talk to a professional" standardized note that appears in every loneliness / anxiety / screen-time post?
- What is Faith's credentialed bio? Needed before Post #3 (AAP 5Cs), Post #4 (Communication), Post #10 (Belonging), Post #11 (Confidence), Post #12 (Why League) ship.
- Do we instrument for aggregate outcomes data (NPS, retention) in parallel, or accept the no-aggregate-stats ceiling for the first wave?
- Does EKUZO have permission to republish Ryan/K1ng and John Hay stories in reframed form for the loneliness and social anxiety clusters respectively, or do we need re-consent from the students and families?
- How does this blog program relate to Jamie's personal newsletter "Jamie's Notes" on Beehiiv? Are there cross-post opportunities for Act 1 thought-leadership pieces?

---

## Related docs

- [blog-keyword-map.md](./blog-keyword-map.md) — parent-query intent map, ranked 12-post roadmap, 3-month ship plan
- `/schools/outcomes` spec (shared separately, not in repo yet) — 5 outcome narratives, each a blog post in waiting
- `/programs/ekuzo-system` spec (shared separately) — 5 iceberg pillars, each a blog post in waiting
- `/why-gaming-matters` spec (shared separately) — manifesto copy, 11 blocks
- `CLAUDE.md` — EKUZO web project context, site structure, technical conventions
- `GEO-SCHEMA-REPORT.md` — schema methodology and scoring (referenced by `CLAUDE.md`)
