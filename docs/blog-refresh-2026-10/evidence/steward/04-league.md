# Steward check: copy 4, the League of Legends post

Run 2026-10-12. Draft: `docs/blog-refresh-2026-10/copy/04-league.md`. Live post:
`app/blog/league-of-legends-youth-development/page.tsx` (line numbers below are that file unless
another file is named). Rules read: `anti-ai-writing.md`, `voice-dna.md` §2 and §3B,
`ekuzo-messaging-voice.md` (the six named sections), `ekuzo-faq-canon.md`, `ekuzo-fact-library.md`.
Not reviewed, as instructed: the shared program line wording, removing the closing bio, dates.

## Verdict

**Revise before build.** Two blockers, both in change 10 and the closing line. Nine of the eleven
changes are sound or need a small fix. No em dashes, hard-banned words or negative-parallelism
reframes in any "Proposed" cell.

## Check 1: do the "Now" cells quote the live page accurately?

All eleven are accurate.

| # | Line | Result |
|---|---|---|
| 1 | 623-631 | Accurate |
| 2 | 320-321 | Accurate |
| 3 | 431-433 | Accurate |
| 4 | 423 | Accurate ("coaches sessions") |
| 5 | 726-731 | Accurate. The gaming-study paragraph is 732-742 |
| 6 | 25-26, rendered by `components/blog/AuthorByline.tsx:92-96` | Accurate. "Updated" shows on its own once `DATE_MODIFIED` differs |
| 7 | 18 (title), 20 (description) | Accurate |
| 8 | 272-276 | Accurate |
| 9 | 392-393 | Accurate |
| 10 | 51 (schema) and 684-716 (page) | Accurate |
| 11 | 370-371 | Accurate |

## Check 2: the "Proposed" cells

### Blockers

**B1. Change 10: the 65% STEM stat is linked to a page that does not contain it.**
Proposed keeps "65% of competitive college esports players are STEM majors". The live link (line
708) is `https://www.nasef.org/research`. I fetched that page today: it has no STEM-major
percentage and no graduation figure (its numbers are attendance and survey data). The fact library
has the stat twice, neither sourced to NASEF: line 1193 (Inven Global, 2025) and line 2205 (65.2%,
labelled "EDUCAUSE" but with an educations.com URL). So the stat is in the fact library with a
source, and the page cites a different source that does not carry it. § NASEF guardrails: "Cite it
accurately instead, attributed to the population NASEF studied." Repoint the link to the source the
fact library names, or cut the sentence. The fact library's own source label and URL for line 2205
disagree with each other, which is worth resolving before it is linked.

A second, smaller problem with the same sentence: under the new lead-in "Adults use games as
practice too", Jane Street and Hassabis are examples of adults using games. A share of college
players choosing STEM majors is not an example of that. It is a population correlation, and placed
there it still reads as "gaming leads to STEM", which is the transfer implication the trim was meant
to remove. It is also college esports across all titles under a question about League (§ Screen-time
science: no "claim generalizing from one genre's evidence to all games"). Severity should-fix if the
link is repaired, since the sentence would then be sourced but still off-topic.

**B2. Change 1, second sentence: "If League isn't your kid's game, [our guide to programs for kids
who game] covers what else is out there."**
This sends away the family the FAQ canon says EKUZO serves. Canon, line 64-65: "My kid plays
Fortnite, Smash, or Rocket League, not League. Will EKUZO work for them? Yes." It also contradicts
change 3 in the same draft ("Most kids come to us loving a different game") and the post's own
lines 416-427. The sentence needs a different condition. Whether the linked guide "covers what else
is out there" is UNVERIFIED: copy 9 does not exist yet.

### Should-fix

**S1. Change 7, the title: "Why EKUZO coaches League of Legends, and how we handle the toxicity".**
- Accuracy: fine. The post covers both halves, and dropping "perfect" removes the overclaim.
- Length: 67 characters, 75 with " | EKUZO" (`app/layout.tsx:75`). The current title is 54 and 62.
  At 75 the search result will truncate, and it will cut the toxicity half, which is the half the
  change exists to carry. The brand name also appears twice in the tag.
- The same constant is the H1, the OG title, the breadcrumb and the Article schema headline. Other
  posts split a display title from a search title (`TITLE_DISPLAY` / `TITLE_SEO`); this one does not.
- § League-community guardrails: partial conflict. "The toxicity" presented as a property of the
  game runs against two lines: never "'The community is toxic' as the lead complaint", and the
  required qualification "Contrast the mode, not the game or its players". The body does this
  correctly ("Solo queue is the problem", line 571). The title does not. The parent search term is
  a fair reason to keep the word; the fix is to attach it to solo queue or to the reputation, not to
  League.

**S2. Change 2: "It's easy to start and it takes years to run out of things to learn."**
- Not yet distinct from `/games`. `app/games/page.tsx:63` reads "Easy to start, forgiving to learn,
  and accessible without overwhelming beginners. The floor is low, the ceiling is high." The
  proposed sentence drops the second half and picks up the first three words of the same card.
- Truth: "easy to start" sits against the post's own line 243 ("a famously hard title") and line
  598 ("League is hard. That's part of why we picked it."). The supportable claim is the one already
  in the next sentence: a new 12-year-old finds footing in a few sessions with a coach.

**S3. Change 3: "Most kids come to us loving a different game."**
Distinct enough from `/games:338` in wording ("compound" is the one shared word). The claim is an
unsupported quantity. What the KB supports: `ekuzo-game-selection.md:34` "Other games are often
where students start"; FAQ canon line 100 "Many students continue playing their usual games"; the
post's own FAQ "Many of our players are new to it." "Often" and "many" are supported. "Most" is not
stated anywhere I could find. Use "many", or get the intake number from Karlin.

**S4. Change 11: "In college I played jungle for UT Dallas under the name Faith."**
Supported, with one precision point and one site-wide exposure.
- UT Dallas: The Athletic 2023 via `ekuzo-origin-story.md:118` and `personal/network/karlin.md:47`;
  Leaguepedia; and the gaming-study post already says "In college I made the UT Dallas team"
  (`app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx:385`).
- Jungle and "Faith": Leaguepedia (jungler, ID "faith"); `lib/schema.ts:33` `alternateName:
  "Faith"`; the homepage card 'KARLIN "FAITH" OEI'.
- Precision: Leaguepedia says jungler, "later analyst and substitute jungler". "I played jungle" is
  true and does not claim he started throughout. Fine as written.
- No direct conflict with "captain": a jungler can captain. The exposure is that this sentence gives
  a reader the exact search ("Faith UT Dallas") that lands on the Leaguepedia page, which does not
  say captain, while the site says "national collegiate captain" in five places (`lib/authors.ts:104`
  and `:107`, `lib/schema.ts:36`, `app/page.tsx:102`, `app/programs/ekuzo101/page.tsx:73`,
  `app/programs/ekuzo-camps/page.tsx:93`). The KB supports "varsity League of Legends captain at UT
  Dallas" (The Athletic). I found no source for "national". That is outside this draft, and it is the
  thing to settle with Karlin before this sentence ships (§ Author integrity).
- "Peak Challenger Jungler" on the same cards: UNVERIFIED, no KB source found.
- It is a first-person claim under his byline. The draft already asks for his OK. Keep that gate.
- Note: the next sentence starts "By the time I was an adult", which now follows "In college" and
  reads out of order.

### Pass

- **Change 4** (typo). Pass.
- **Change 8**: "one of the better moves you can make for how they show up online." Pass. Opinion,
  correctly softened.
- **Change 9**: "That's the part of League I'd want a parent to see." Pass. Removes a §3C banned
  phrase ("most people").
- **Change 10, the trim itself**: cutting "The transfer is visible at the high end too", the
  graduation clause and the "cognitive substrate" sentence brings the answer inside the
  decision-training guardrails. The answer opens with skills players "practice", which is the
  required framing. Jane Street matches the fact library (line 2223). The Hassabis sentence
  ("credits chess and game design as foundational to how he thinks about AI") is UNVERIFIED against
  the linked Nobel transcript; the fact library entry (line 2232) cites different sources and a
  slightly different claim. The schema string at line 51 must get the identical edit.
- **Changes 5, 6**: not reviewed (approved).

## Check 3: what the draft missed in the live post

No "League is fun", no "git gud" register, no coach-credential claim, no title-case header, no
hard-banned word, and no em dash in the visible body or FAQ. What I did find:

| Severity | Where | Text | Rule |
|---|---|---|---|
| should-fix | 780-781, Keep Reading card | "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)" | Stale in October, the same problem change 1 fixes four paragraphs up. § Language We Avoid: artificial urgency. The draft says the link follows copy 9 but does not list the card |
| should-fix | 358 | "League taught me more than school did." | § Screen-time science: never "make" or "teach" as an automatic effect of the game; the program does the teaching. § Decision-training: testimony is not evidence. It is first-person and he qualifies it at once ("I want to be careful with that line"), which is why it is not a blocker. It is also the most quotable line on the page for a school reader. Karlin's call |
| should-fix | 112, 114, VideoObject name and description | "Community is opportunity — Karlin on the Jynxzi tournament" and two more in the description | §1A em dashes. Not visible on the page, but published in the JSON-LD under EKUZO's name |
| should-fix | 548 | "Over 920,000 people watched it live." | See check 4. The source figure is peak concurrent viewers, not people who watched |
| note | 570 | "How does EKUZO handle League's toxicity problem?" | Same issue as the proposed title: toxicity attached to the game. The next line corrects it |
| note | 426-427 | "A kid who gets better at League gets better at Fortnite too." | Agree with leaving it. Canon line 65 says "students consistently get better at the other games they play." Near transfer, game to game. The live line is unconditional where canon says "consistently" |
| note | 393-397 | "It's a live laboratory for the same dynamics that show up at work and in relationships" | An analogy, and it does not say the skill carries over. Close to the far-transfer line; acceptable as written |
| note | 601-605 | "the same hardness produces a player who can communicate under pressure..." | Outcome verb "produces". The conditional is present ("With the right structure around it"), so it passes |
| note | 261-262 | "There's a decade of published research on it." | §2R name the authority. Strong tendency, not a hard rule |
| note | 592, 669, 650 | "adults in the room" | The programs are online. Figurative, but a parent may read it literally |
| note | 792 | FooterBanner heading "Enroll into a transformational program today" | "Overstated transformation claims". Site-wide heading (20 uses), not this pass |
| note | `lib/authors.ts:104` | Karlin's author description contains an em dash | Outside this post; decision 6 is touching that page anyway |

## Check 4: the "left alone" list

- **Dated facts.** Agree, given the links are opened in QA. I did not open them. UNVERIFIED.
- **"Over 920,000 people watched it live" against "over a million".** Disagree that it is fine as
  is. I fetched the linked Esports Charts article: 920,000 is **peak concurrent viewers** (its own
  FAQ says 921,800; the body and FAQ differ slightly), with 4.7 million hours watched. It gives no
  count of people. So the text's number is the sourced one but its wording is wrong, and the reel's
  "over a million people" may well be true as a total but is unsourced. The transcript is his spoken
  words and should stay. Fixing the text to "peaked at over 920,000 concurrent viewers" makes both
  statements true at once and removes the apparent contradiction. Line 482 already uses "peaked at"
  correctly for Worlds.
- **"Our players are on stable teams with the same teammates week after week."** (573) Disagree. It
  matches canon's safety answer only for a season (canon lines 131, 260: "across a season"). Canon
  line 49 and the correction at line 254 say EKUZO101 makes no fixed-roster promise, and the
  cohort model is marked open. After change 1 this post points readers at `/programs`, where
  EKUZO101 is the flagship. An unqualified "our players" promises something canon withdrew for that
  product. Scope it to season teams. Line 609 "stable teammates" has the same issue; "known
  teammates" (line 35, 649) is fine. Should-fix.
- **"A kid who gets better at League gets better at Fortnite too."** Agree.
- **Hero image placeholder.** Agree, out of scope.

## Could not verify

- Whether the camps guide "covers what else is out there" (copy 9 not written).
- The Hassabis sentence against the linked Nobel interview transcript.
- "under 10%" repeat-offense rate (lines 35, 646): not in the fact library, and the linked Honor
  Guide was not opened.
- "national" in "national collegiate captain" and "Peak Challenger Jungler": no source in the KB.
- The external links behind the dated facts.
