# Blog Coverage + LLM-Optimization Audit, Seeding Playbook, and Next Two Posts

Owner: Jamie · Created: 2026-05-25 · Status: working doc for the 2/week content push
Companion to [`blog-strategy.md`](./blog-strategy.md) and [`blog-keyword-map.md`](./blog-keyword-map.md).
Method: fresh expert pass on LLM-optimization (per Jamie's call — not scored against the repo's GEO audit rubric); coverage judged against the keyword-map's 4 clusters + 12-post roadmap and the KB audience/JTBD maps.

---

## 0. The cadence tension, up front

`blog-strategy.md` §12 sets the target at **2 posts/month** and says explicitly: *"Two per week
is sustainable only if we downgrade the quality bar, which defeats the purpose."* Jamie now wants
**2/week** — 4x that. This isn't a reason to stop; it's a reason to change the *model*, because the
blog's whole job (LLM citation) depends on depth, and thin posts don't get cited. Reconciliation
is in §5 (a "1 deep + 1 light" weekly model that protects the citation plays). Flagging it here so
the cadence decision is conscious, not accidental.

**Decision (Jamie review, 2026-05-25):** 2/week is fine *for now* — the backlog of needed coverage
is large (EKUZO Teams has no post yet; all the high-intent clusters + the existing research are
outstanding), and slop risk is low because the content is legitimate. Karlin's **daily founder-led
content** is the raw material, so sourcing isn't the bottleneck. Step down to ~1/week or every other
once there's a solid baseline of coverage. So: prioritize *breadth of coverage* now, hold the quality
bar via the deep/light split, don't agonize over speed.

---

## 1. What the 7 live posts actually are

| # | Post | Words | Act / type | Cluster it serves | Schema | Notes |
|---|---|---|---|---|---|---|
| 1 | conquering-my-mountain-and-giants… | ~1,020 | Act 3 · student story | (credibility layer) | Article | Testimonial; no FAQ |
| 2 | **league-of-legends-youth-development** | ~4,010 | Act 2 · method/FAQ | Game-specific ("why League") | **Article + FAQPage** | **The model post** — question-shaped H2s, comparative framing, FAQ schema |
| 3 | our-family-s-esports-journey-with-**ekuso**-and-the-k1ng | ~1,630 | Act 3 · case study | loneliness/belonging (implicit) | Article | Ryan/K1ng story. **Slug misspells the brand: "ekuso."** |
| 4 | summer-camps-for-kids-who-game-2026 | ~2,650 | commercial/seasonal | camps (transactional) | Article | Question-shaped H2s; no FAQ schema |
| 5 | what-homeschool-parents-taught-us-about-gaming | ~1,830 | Act 1/2 | homeschool | Article | A couple of headings render empty (image headers?) |
| 6 | what-your-kids-gaming-is-telling-you | ~2,720 | Act 1 · perspective | screen-time/meaning | Article | The six "tells." Statement-shaped H2s; no FAQ schema |
| 7 | when-gaming-helps-homeschool-kids | ~2,770 | Act 1/2 · method | homeschool | Article | Question-shaped H2s + "Sources and further reading" (good) |

**Distribution:** homeschool ×2, student/family stories ×2, game-specific (LoL + camps) ×2,
screen-time/meaning ×1.

---

## 2. Coverage map — where the gaps are

Judged against the keyword-map's four priority clusters (its own leverage ranking in parentheses):

| Cluster (keyword-map priority) | Covered? | By which post |
|---|---|---|
| **Alternatives to traditional sports** ("strongest" — sharpest intent, least competition) | ❌ **Not covered** | none |
| **Male loneliness & friendship formation** ("very strong" — the #1 roadmap post) | ❌ **Not covered** | only implicit in the K1ng story (Act 3, not a search-intent post) |
| **Unstructured screen time / gaming balance** ("very strong") | 🟡 Partial | six-tells post hits *meaning*; the "is my kid addicted" intent is **unwritten** |
| **Social anxiety / shy & quiet kids** ("strong") | ❌ Not covered | none targeted |
| Homeschool / alt-ed | ✅ Over-indexed (2 posts) | #5, #7 — **not one of the 4 priority clusters**, but GA-validated (see below) |
| Game-specific ("why League") | ✅ Covered well | #2 (the model post) |

**The headline finding:** the published blog has drifted from the keyword-map roadmap. The three
**highest a-priori-leverage clusters** — sports-alternatives, loneliness, screen-time/addiction —
are the **least covered**, while homeschool (not on the priority list) got two posts.

**The honest counter-weight:** the homeschool drift wasn't random. The 5/18–5/25 GA pull showed
EKUZO's homeschool posts *out-drew* the camp- and game-specific posts (per the Reddit discovery
brief). So homeschool is a **validated vein**, not a mistake. The right read is *both*: keep
feeding the proven homeschool lane **and** claim the uncovered high-leverage whitespace. They're
not in tension at 2/week — there's room for both.

**Audience-coverage gaps (vs. the KB audience tilts):** the neurodivergent (ADHD/autism) and
girl-gamer/"hidden gamer" tilts — both strong EKUZO research areas — have **no dedicated post**.
ND especially maps to high-trust parent search ("activities for kids with ADHD," "my autistic son
only wants to game") and to the homeschool vein (63% of microschools serve ND students). That's a
near-term gap worth queuing after the two below.

---

## 3. LLM-optimization scorecard (fresh expert pass)

What's already strong:

- **Schema baseline is there** — all 7 have Article + JsonLd. Good entity hygiene.
- **Post #2 (LoL) is the template to copy site-wide:** FAQPage schema + question-shaped H2s ("Is League really that toxic?", "Why not Fortnite, Minecraft, Roblox, or VALORANT?") + comparative framing. This is exactly the shape AI engines extract and cite. Make it the standard, not the exception.
- **Good depth** — most posts 1,800–4,000 words, which is the range LLMs reward for authority.
- **Citation hygiene in #7** — a visible "Sources and further reading" section. Replicate it everywhere.

Ranked fixes (highest LLM-citation leverage first):

1. **Selectively add FAQ blocks + FAQPage schema to high-intent posts** (revisiting a deliberate
   decision). *Correction:* FAQ schema was intentionally kept off the blog because it already lives
   on the core pages (program pages + top-line routing) — a settled call, not an oversight. So this
   is **not** a blanket "every post" change. But it's worth revisiting per-post where a piece is
   Q&A-shaped and high-intent: the **six-tells post is the strongest case** (great prose, but its
   statement-shaped H2s — "They get more upset…" — don't match the question shape retrieval favors;
   an FAQ block fixes that without touching the prose), with the camps post a secondary candidate.
   Write the Q&A in the parent's exact query phrasing ("Why does my kid rage when he loses?", "Is my
   kid addicted or just into it?").
2. **Front-load a declarative answer (the first-30% rule).** Narrative-opening posts (six-tells
   opens on a scene) are beautiful but slow to extract. Add a one- to two-sentence answer-shaped
   summary or TL;DR near the top so an AI can lift the thesis cleanly. Keep the scene right after.
3. **Build a Karlin Oei author page + Person schema (clickable author profile).** *Correction:*
   "Karlin" (founder) and "Faith" in the strategy docs are the **same person** — Faith is Karlin's
   gamer name. The byline and entity should consistently be **Karlin Oei**. He authors most posts,
   so he needs a clickable WordPress-style author page, with Person-schema metadata tying the byline
   to the founder entity (`sameAs` links to his profiles). Normalize every existing byline to
   "Karlin Oei" and link them to that page. This lifts E-E-A-T and citation trust and cleans the
   entity graph. (Note: `blog-strategy.md` + `blog-keyword-map.md` still list "Faith" as a separate
   author — correct those too.)
4. **Fix the brand-misspelled slug** on post #3 (`…ekuso…`). The canonical URL of a case study
   misspells the company name — bad for brand search and entity association. Rename to the correct
   slug and add a redirect rule (per the `next.config.mjs` redirect discipline in CLAUDE.md so the
   existing URL doesn't 404).
5. **Recency signaling on evergreen posts.** Camps post already carries "2026" (good). For evergreen
   pieces, surface a visible "updated" date and refresh annually — AI surfaces favor recency.
6. **Internal hub-and-spoke linking.** The strategy's architecture depends on each spoke linking to
   its hub + 1–2 siblings. Worth a pass to confirm every post links to its program/explainer hub and
   to a relevant sibling (e.g., six-tells ↔ the forthcoming "addicted or into it" post). I didn't
   verify link presence in this audit — flag for a quick check.

What **not** to bother with: an `llms.txt` file. Per EKUZO's own AI-optimization checklist (grounded
in Google's guide), it isn't required — don't spend time there.

---

## 4. Seeding playbook (post-Reddit)

Reddit washed out as a seeding surface (see `EKUZO/Marketing/channels/reddit/`). Here's where the
blog's reach + LLM-citation actually compounds instead. The strategy doc's own success metrics name
**backlinks** as a direct LLM-corpus input — so earned citation is the highest-leverage seeding.

**A. Backlink / citation partners (highest leverage — backlinks feed the corpora LLMs read):**

- **Homeschool / alt-ed ecosystem** *(warmest — GA-validated)*: secular-homeschool blogs, co-op and
  microschool newsletters, ESA-resource directories, homeschool-curriculum roundup sites. Pitch the
  two homeschool posts as resource-list inclusions or guest contributions. This is the lane with both
  demand evidence and the least friction.
- **Youth-development / parenting authorities** for the uncovered clusters: Aspen Institute *Project
  Play* (sports-decline data community), the Richard Reeves / *American Institute for Boys and Men*
  audience (male loneliness), Jonathan Haidt's *After Babel* readership (screen time), and big
  parent-of-teens sites (**Grown and Flown**, **Your Teen Magazine**). The play: pitch the data-explainer
  pieces (e.g., the "15% of young men have no close friends" piece) as guest posts or citable sources.
- **Esports-for-education orgs**: NASEF, the SEL/library angle (the SLJ piece already cited in post #7),
  FOSI (Family Online Safety Institute, named in the strategy doc). Get EKUZO listed/cited as a resource.
- **Reporter/source requests** (the thing you might not be considering): respond to journalist queries
  on parenting/gaming/loneliness/youth-sports via a HARO-style service (Qwoted, Featured, etc.). One
  citation in a parenting outlet is worth more than ten self-published posts for both backlinks and LLM
  corpus inclusion. The "15% of young men" and "kid got cut from the team" pieces are built for this.

**B. Owned-channel syndication (republish, canonical back to ekuzo.gg):**

- **Jamie's Beehiiv newsletter ("Jamie's Notes")** — the strategy doc's own open question. Cross-post
  Act 1 thought-leadership; the blog is the fact base, the newsletter is distribution.
- **LinkedIn** (Jamie's founder presence + the EKUZO company page) — Act 1/Act 2 pieces as LinkedIn
  articles; the school-facing audience lives there. Marketing CLAUDE.md flags LinkedIn as the likely
  next channel — these posts are the seed content for it.
- **X** (the Stanley.ai partnership, already active) — every post becomes a long-form post / thread;
  the blog is the citable substrate for X content per `channels/x/best-practices.md`.
- **Medium / Substack** with `rel=canonical` pointing to ekuzo.gg (republish for reach without
  duplicate-content penalty).

**C. Things you might not be considering:**

- **Quora is the Reddit replacement for value-add answers.** It's evergreen Q&A, it's LLM-cited and
  Google-ranked, and unlike Reddit it tolerates a genuinely helpful linked answer. Answer the exact
  parent queries from the keyword map ("teenage son has no friends," "alternatives to sports for
  teens") with a substantive answer that draws from the matching post. This is the brand-safe,
  citation-feeding version of what Reddit couldn't be.
- **Repurpose Karlin's video transcripts** (already in `docs/marketing/`: day-4, camps) into posts or
  embed video + transcript on relevant posts — mirrors the testimonial-video schema pattern in the web
  CLAUDE.md and adds another extraction surface.
- **Short-form from long-form**: the six-tells post is perfect TikTok/Shorts/Reels fodder (EKUZO has
  all three). Cross-medium reinforces topical authority and creates more citable surfaces.
- **A per-cluster hub page** (e.g., a parent-facing `/parents/screen-time` or sports-alternatives hub)
  that aggregates the cluster's spokes — concentrates authority and gives the spokes a canonical home,
  per the strategy's hub-and-spoke design.

---

## 5. The next two posts (proposed from the gaps)

Both are drawn from EKUZO's own top-3 roadmap, both fill the highest-leverage uncovered clusters, and
they're internally linkable to each other and to the existing six-tells (#6) and LoL (#2) posts.

### Post A — "What to do when your kid gets cut from the team (or never tried out)"
- **Cluster:** Alternatives to traditional sports — the "strongest" lane in the keyword map (sharpest transactional intent, least competition). **Currently zero coverage.** This is the single highest-leverage uncovered post.
- **Act:** 1 → 2. **Author:** Jamie (parent + operator voice; no Faith-bio dependency, so it ships now).
- **Target queries:** "my son got cut from the team," "my kid doesn't like sports what else," "alternatives to sports for teenagers," "activities for non-athletic kids."
- **Evidence anchors:** Aspen *State of Play 2024* (teen participation declining, costs +46% since 2019, widening income gap). Internal: Belonging + Leadership outcome narratives.
- **Angle:** the sports pipeline is narrowing *by design*; the middle-of-the-bell-curve kid gets squeezed out and has nowhere structured to go. A developmental team experience shouldn't gate on athleticism. Esports shows up as *one* credible example, not the whole answer.
- **FAQ block (for FAQPage schema):** "What are good team activities for kids who don't like sports?" · "Is my kid too unathletic for any team?" · "Does my kid have to go pro for esports to be worth it?"
- **Internal links:** → camps/EKUZO100 hub; ↔ the LoL post (#2); ↔ the six-tells post (#6).

### Post B — "Is my kid addicted to video games, or just into them? A framework for parents"
- **Cluster:** Unstructured screen time / gaming balance — "very strong," highest-volume/highest-anxiety query. Pairs as the natural **sibling** of the existing six-tells post (#6), which it should cross-link.
- **Act:** 1. **Author:** Karlin Oei (founder/coach voice), optionally co-bylined with Jamie. Benefits from the Karlin Oei author page (fix #3) but isn't blocked on it — ship and link the author page once it's live.
- **Target queries:** "is my kid addicted to video games," "how much gaming is too much," "video game addiction signs," "video game addiction vs passion."
- **Evidence anchors:** AAP 5Cs framework, WHO/ICD-11 Gaming Disorder criteria, Ferguson et al. 2024 counter-research, the Columbia "addictive use, not total time" finding (already cited in the six-tells post — reuse for consistency).
- **Angle:** real clinical addiction exists and has specific markers; heavy use and passion do not automatically meet them. Teach parents to tell them apart; then — if it's passion — structure beats restriction. Carries the standardized "when to see a professional" note.
- **FAQ block:** "What's the difference between gaming addiction and passion?" · "How much gaming is too much for a teenager?" · "Will structured gaming make the problem worse?"
- **Internal links:** ↔ six-tells (#6); → the screen-time hub (build per §4C); ↔ Post A.

**Why these two specifically over a third homeschool post:** homeschool is validated and worth
*continuing*, but it's already 2/7 and these two clusters are EKUZO's own #1–#3 ranked leverage with
*zero* current coverage. Claiming whitespace beats deepening a vein that's already producing.

### A 2/week cadence model that protects quality (the §0 tension, resolved)

Don't try to ship two 2,500-word citation plays a week — that's where quality breaks. Instead:

- **1 "deep" post/week** — the citation play (1,800–2,500 words, evidence-anchored, FAQ schema). Post A, then Post B, then down the roadmap.
- **1 "light" post/week** — faster to write because it's *translation*, not original argument: a strategic-FAQ / obstacle post from the `blog-strategy.md` anchor inventory (e.g., "Is esports safe for my kid?", "Is my kid too young for this?") or a repurpose of a Karlin video transcript. 800–1,400 words, still FAQ-schema'd.

That sustains 2/week, keeps the depth where it matters, and feeds the light slot from inventory you've
already mapped instead of inventing from scratch each time. If a week can't fill the deep slot at
quality, ship two lights — a missed deep beats a thin deep (`blog-strategy.md` §15).

---

## 6. Order of operations (updated after Jamie review, 2026-05-25)

**Tomorrow's run order (Jamie, 2026-05-25):** (1) infra "easy wins" via Claude Code — Karlin Oei
author page + Person schema + byline normalization, and the K1ng slug fix + redirect; (2) Quora
searching (the brand-safe, LLM-cited Reddit replacement); (3) homeschool go-deeper deep-dive. The
two posts (jersey, Post B) move to the following sessions.


**This week's two posts** (Jamie's pick — Post A "kid got cut" stays queued, not dropped):
- **Post B** — "Is my kid addicted, or just into it?" — pairs with the six-tells post; needs the clinical/credibility line handled carefully.
- **Jersey "magic moment" post** — the EKUZO Teams gap + a nurture-list asset. Belonging/jersey-design-ritual angle (strategy-doc roadmap #10). Doubles as EKUZO Teams coverage we don't have yet.

**Infrastructure (Claude Code / Aaron lane):**
- **Karlin Oei author page + Person schema** (clickable profile; normalize all bylines to "Karlin Oei"; tie to founder entity). Unblocks author-entity value across every post.
- **Fix the `ekuso` slug** + redirect (Jamie: approved, do shortly — coordinate with the open CC session).
- Selective FAQ block + FAQPage schema on the six-tells post (revisits the deliberate no-blog-FAQ call for this high-intent piece).

**Distribution / GTM (Cowork / Jamie lane):**
- **Homeschool go-deeper deep-dive** — blog angles + LinkedIn + partners + the new campaign + Quora. Explicitly wanted.
- **Quora motion** — answer the high-intent queries the blog targets (the brand-safe, LLM-cited Reddit replacement).

**Queued (high-leverage, not this week):** Post A (kid got cut), loneliness post (#1), AAP 5Cs explainer, ND (ADHD/autism) post, girl-gamer post, the rest of the roadmap. Karlin's daily founder content is the source material for these.

---

## Sources / inputs

- [`blog-strategy.md`](./blog-strategy.md), [`blog-keyword-map.md`](./blog-keyword-map.md) — the existing strategy + 12-post roadmap this audit measures against
- The 7 live posts in `app/blog/*` (read 2026-05-25)
- `knowledge-base/wiki/domains/ekuzo/ekuzo-audience-hierarchy.md`, `ekuzo-jobs-to-be-done.md` — audience/JTBD coverage lens
- `EKUZO/Marketing/channels/reddit/` — why Reddit is out as a seeding surface
- EKUZO AI-optimization checklist (per CLAUDE.md) — the "llms.txt not required" guardrail
