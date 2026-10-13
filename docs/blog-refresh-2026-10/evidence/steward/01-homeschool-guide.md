# Steward review: copy 1, the homeschool guide

**Draft:** `docs/blog-refresh-2026-10/copy/01-homeschool-guide.md`, section "The post as it would read" (file lines 38 to 144) plus the shared program line.
**Reviewed:** 2026-10-12. Steward found problems only; no draft text was edited.
**Verdict: approve with fixes.** 2 blockers, 1 blocker pending the owner's answer, 15 should-fix, and notes.

Line numbers below are the draft file's own line numbers. "Pre-existing" means the sentence is live today and unchanged in the draft.

## Sources opened

| Source | Result |
|---|---|
| `system/methodology/anti-ai-writing.md` | read in full |
| `system/methodology/voice-dna.md` §2, §3B | read |
| `company/knowledge/ekuzo-messaging-voice.md` (Language We Avoid, Author integrity, Screen-time science, Decision-training, Cross-cutting patterns, Alt-Ed Vocabulary) | read |
| `company/knowledge/ekuzo-homeschool-families.md` | read in full |
| `company/knowledge/ekuzo-faq-canon.md` (programs, age range, homeschool section, pricing) | read |
| `company/knowledge/repeated-peer-environments.md` | read (first 60 lines) |
| `company/marketing/ekuzo-fact-library.md` entries: Addictive Use Not Total Time, Mentorship Mediator Effect, Mentorship OR 3.20 / 2.76, NCES 2023 Top Reasons, Homeschool Social-Outcome Research | read |
| Columbia page (WebFetch) | fetched. Page title: "Addictive Use of Social Media, Not Total Time, Associated with Youth Mental Health" (Columbia University Irving Medical Center) |
| UCI PDF (WebFetch, then text extracted locally with PDFKit, 15 pages) | fetched. Document title: "Academic and Social-Emotional Learning in High School Esports". Authors Reitman, Cho, Gardner, Campbell, Steinkuehler (UC Irvine Informatics) |

UNVERIFIED items are listed at the end.

---

## Check 1. Mechanical: PASS, with notes

Counts over the post section (grep, case-insensitive):

| Item | Count |
|---|---|
| Em dashes | 0 |
| En dashes | 0 |
| Hard-banned words (anti-ai-writing §3A, incl. "serves as" family) | 0 |
| Banned phrases (§3C) | 0 exact matches (one near-match, finding 1.2) |
| Banned transitions (§3D) | 0 |
| Engagement bait, chat leakage, meta commentary (§1C, 1E, 1F) | 0 |
| Title-case headers (§1G) | 0. All 11 headers are sentence case |
| Soft-banned words (voice-dna §3B) | 2, both "quietly" (finding 1.1) |
| Negative parallelism (§1B) | 1 compressed instance, the deck (finding 1.3). Density is low; no stacking |

- **1.1 (note, pre-existing).** "plenty of us quietly wonder if we're getting it right" and "a piece most families quietly hand off to a school" (line 46). Two uses of "quietly" in one paragraph. voice-dna §3B soft-bans "quietly" outside literal quiet (row added 2026-10-05, after the post was published).
- **1.2 (should-fix, pre-existing).** "Most parents just never get told that the environment is the lever." (line 54). Near-match for anti-ai-writing §3C ("anything with 'nobody' or 'most people don't realize'"). It also talks down to a reader the persona file says has "already done a lot of work to design my child's environment" (`ekuzo-homeschool-families.md` § Emotional Jobs), and it now sits four lines below the new paragraph that credits these families with building things on purpose.
- **1.3 (note, pre-existing, kept by the owner).** "The difference is rarely the game. It's what surrounds it." (deck, line 40). This is the compressed two-sentence "not X. Y." form (§1B). One instance is allowed under "frequency, not prohibition"; recorded so it is a choice, not an oversight.
- **1.4 (note).** "the thing most tied to real growth" (line 82). voice-dna §2Q: "tied to" hides how the two things relate. See finding 3.4 for the substance.
- **1.5 (note).** The header "What's different about doing this in a homeschool? (new section)" carries a reviewer label. Confirm "(new section)" and the "(new)" / "(changed)" markers are stripped at build.

## Check 2. Thread leakage: 2 blockers, 3 should-fix, 4 notes

The owner's decision is that every quote or paraphrase from the thread lives only in the sibling post. No verbatim thread quote remains in the draft. These paraphrases and shared strings do:

- **2.1 (BLOCKER).** "The part both loud camps miss is what happens when you pull the game with nothing to replace it. For a lot of these kids, the game is where their friends are. Take it away cold and you've taken the kid out of their peer group too." (line 70). This is the thread dad's warning restated, and the sibling carries it twice: the quote card ("Taking that away without a solid alternative can lead to serious emotional distress, including depression") and the sibling's own gloss ("For his sons, the game is where their friendships live. Pulling it without a replacement removes them from their friends."). The draft then says "The dad who started that thread said it better than I can", which confirms the three sentences before it are his point. The link is fine; the paraphrase ahead of it is what breaks the decision.
- **2.2 (BLOCKER).** "Open-ended, unsupervised gaming can pull a kid inward, until the days run together and every friend they have lives inside one game." (line 68, changed). The new clause is a close paraphrase of the sibling's Camp 1 report: "whose only friends live inside the game". The change table says the "kids who only ate while gaming" material came out; this half of the same thread comment stayed in.
- **2.3 (should-fix).** "The parents who've figured this out stopped trying to shrink the passion and started aiming it: a coding class, a game-design course, a team with a season, streaming with a purpose." (line 62, changed). Sibling Camp 3: "they've stopped fighting the hobby and started pointing it somewhere. Their kids are in coding classes, game-design courses, and homeschool gaming meetups", under the camp label "Aim it" / "Start aiming it." The verb and the first two list items are the thread's. The next unchanged sentence, "Homeschool families are well positioned to join that camp", still uses the thread's "camp" taxonomy, which this post no longer introduces.
- **2.4 (should-fix).** "The part both loud camps miss" (line 70). "Both loud camps" refers to the cut-it-off and set-limits camps. The draft no longer defines any camps before this point (the recap came out per change 4), so the phrase is both a thread reference and a dangling one.
- **2.5 (should-fix).** "structured, social, supervised gaming with adults who actually coach" and "the thing most parents are looking for, whether or not they've named it" (line 122, changed). The sibling's answer block says all three camps are "circling the same unmet need, a structured, social, supervised version of gaming with an adult in the room", and "structured, social, supervised" is also in the sibling's meta description. The three-word string and the "they want it without naming it" finding are the sibling's headline conclusion. Removing the words "200+ parents" did not remove the thread finding; it only detached it from its evidence (see 3.8).
- **2.6 (note).** "The books on their shelves are pointing at something true." (line 68). Sibling: "the books on their shelves" (What we took from it). The titles came out per change 5; the phrase is shared verbatim.
- **2.7 (note, pre-existing).** "Six hours moving in five directions is just motion." (line 84). The six-hour figure came from the thread ("the six-hour days fell off on their own", now only in the sibling). The change table lists "six-hour days" as removed.
- **2.8 (note, pre-existing).** "A kid plays the game they already love" (line 122) echoes the QuoteCards line "Use what they already love as a learning tool."
- **2.9 (note).** Pointers that are allowed and are not leakage: "more than 200 homeschool parents argued" (line 56), "all three camps and the one thing they agreed on" (line 138). No QuoteCards quote appears in the draft.

## Check 3. Claims in (new) and (changed) paragraphs

- **3.1 PASS with note.** "Most homeschool families build one on purpose: co-op, clubs, sports, church, field trips." (line 50). Supported by `ekuzo-faq-canon.md` § Homeschool ("homeschool families generally build social development intentionally, through co-ops, clubs, sports, church, work, field trips, and online communities") and `repeated-peer-environments.md`. Two small gaps: canon says "generally", the draft says "Most" (no count exists in the KB); and the underlying literature is flagged advocacy-adjacent in the fact library, so the sentence should not be strengthened further.
- **3.2 PASS.** "Friendships form when the same kids show up around the same interest week after week, and that's tough to arrange when your kid is the only gamer in the co-op." (line 50). Matches the KB construct (`repeated-peer-environments.md`: recurring, interest-matched, continuity; persona Functional Jobs: "the only gamer ... in their geographic pod"). It is EKUZO's framing, not a cited study, and the draft does not present it as research. "Co-op" for "pod" is a correct specific term.
- **3.3 PASS with note.** "A lot of families come to homeschooling after a rough stretch in a classroom." (line 104). Supported by the persona's archetype 1 ("Often pulled their kid after a school environment failure") and NCES 2023 (83% cite concern about school environment; 28% as the single most important reason). Note that the NCES category is "safety, drugs, peer pressure", which is broader than a child's own bad classroom experience, so "a lot" is the ceiling; do not move to "most".
- **3.3b (should-fix).** "A kid in that spot needs a small group and nothing to win yet." (line 104). The KB treats this as an open question, not a finding: `ekuzo-homeschool-families.md` § Open Questions, "How does the parent's de-schooling phase change the JTBD?". The persona says low-stakes "matter more than academic rigor". "Needs" states it as settled.
- **3.4 (should-fix).** "When researchers look at structured gaming programs, the thing most tied to real growth is a person more than a feature: a caring adult, the coach." (line 82). Checked against the UCI paper itself. What it reports: interviews with 55 students and 15 staff from 6 schools in one league, coded and analysed with odds ratios at p<0.10; "Mentorship was a significant (p<0.10) mediating variable for seven of the eighteen learning outcomes, while student leadership significantly (p<0.10) mediated four". Mentorship is defined as modeling "by a teacher GM, a coach, or another student". Gaps between that and the draft:
  1. "most tied to": the paper tests two mediators (mentorship, student leadership) and does not rank mentorship against program features. The KB guardrail phrase is "adult mentorship is the strongest correlate" with the required rider "participants and programs report these gains ... reported, not proven" (`ekuzo-messaging-voice.md` § Screen-time science, Required qualifications). The draft took the first half and dropped "reported".
  2. "real growth": the outcomes are interview self-reports. "Real" asserts more than the source.
  3. "a caring adult, the coach": the paper's mentors are teachers, coaches and other students. "Caring adult" is the fact library's wording, not the paper's.
  4. "When researchers look at structured gaming programs": one working paper on one high school league, generalized to a field. voice-dna §2R (name the authority) and the guardrail against generalizing from one genre's evidence.
  5. The paper's first page says: "This is a working draft of a paper still under review for publication. Please contact Dr. Constance Steinkuehler ... for permission to reference or cite." The site already links it, so this is pre-existing, but the owner should know the source asks for permission.
  The softening in change 6 is in the right direction and is not enough to meet the guardrail as written.
- **3.5 (should-fix, pre-existing, same paragraph and sources list).** "The people and the structure are the active ingredients." (line 84) and the unchanged source label "The coach as the active ingredient in esports social-emotional growth". Change 6 softened the causal sentence; these two keep the causal claim the change was made to remove.
- **3.6 (note, pre-existing).** "A 2025 study from Columbia and Weill Cornell found that addictive patterns of use predicted worse mental health in kids, while total screen time on its own did not." (line 82). Matches the fact-library entry word for word. The landing page says "associated", never "predicted" ("Total screen time was not associated with suicide-related or mental health outcomes"). The study follows trajectories over four years, so "predicted" is defensible, but "associated with" is what the linked page says. The page's risk figures are for social media and phones; video games are covered with two trajectories only.
- **3.7 PASS with note.** "EKUZO runs coached esports teams for kids ages 10 to 17." (line 128). Age range matches `ekuzo-faq-canon.md` ("Students aged 10–17"; canonical statement under "What age range is EKUZO for?"). "Coached teams" is accurate for Teams and Camps squads; EKUZO101 is described in canon as "coach-led online classes ... in a small group", which the word "teams" covers loosely. Note for this post only: the alt-ed vocabulary names "structured social enrichment" as "EKUZO's preferred category framing (not 'esports')". The shared line serves six posts, so this is the owner's trade-off.
- **3.8 (should-fix).** "Put those pieces together and you get the thing most parents are looking for, whether or not they've named it" (line 122, changed). In the live post this claim was about the 200+ thread parents. Generalized to "most parents" it has no source in the KB.
- **3.9 (should-fix).** "steady teams, trained coaches, clear goals, moderated spaces, and a conversation after the match" (line 126). "Trained coaches" and "moderated spaces" match canon ("background-checked and trained"; "actively moderated"). "Steady teams" is a synonym for "stable rosters", so it carries the same promise the change table (item 8) says it avoids: canon's EKUZO101 answer records "no fixed-roster promise", while the Teams and safety answers do promise the same teammates across a season. The claim is true for Teams and not promised for the usual starting program. The sentence is framed as what EKUZO was built to be, which softens it; the swap by itself does not fix it.
- **3.10 (should-fix).** "So in a lot of homeschools, gaming ends up doing two jobs at once. It's a big block of free time, and it's where a kid finds the other kids who love what they love." (line 52, new). The KB supports a narrower claim: the gap is for the kid who is the only gamer in their pod. "In a lot of homeschools" generalizes it, with no source, and leans toward the never-say "Gaming is the obvious fit for homeschoolers" (`ekuzo-homeschool-families.md` § What We Should Never Say). The persona also records that most homeschool families prefer in-person and 93% take no virtual courses.
- **3.11 (note).** "A school family's gaming happens at 9pm, when everyone is tired. Yours can happen at 1pm" (line 108, new). An illustrative generalization with no source; fine as a scene. Flag: EKUZO's own home-track sessions run after school or in the evening and the coach-supply guardrail says not to promise weekday school-hours coaching. The section is advice for home, and should not be read as an EKUZO schedule next to the program line 20 lines later.
- **3.12 PASS.** "It sits next to co-op, sports, and church. A kid with several groups has somewhere to stand when one of them has a bad month." (line 106). Supported by `repeated-peer-environments.md` point 3 ("Single-environment dependency is fragile") and the persona's "complement, not a replacement" posture.
- **3.13 PASS.** "we don't coach shooters" (line 74): owner-confirmed, not re-tested. "Co-op, strategy, and creative titles" fine.

## Check 4. Author integrity: 1 blocker pending owner, 2 notes

- **4.1 (BLOCKER until the owner confirms; already flagged).** "Since I first wrote this in May, we've spent more time reading and listening in homeschool communities" (line 50).
  - What the KB supports: desk research. The three-report alt-ed research pass (2026-05-19), the outreach map (2026-06-09), the homeschool events sweep (2026-07-17), and the alt-ed outbound campaign build (2026-07-08/09), plus a drafted SEA speaker application for Karlin.
  - What it does not support: any recorded conversation, call, interview or community participation by Karlin or the team with homeschool families. A search of the homeschool session logs and the outreach map for Karlin's name returned nothing. "Listening" has no evidence. "In homeschool communities" implies presence inside those groups; the KB records reading about them, and notes the Facebook groups gate-keep vendors.
  - Timing problem the draft does not mention: the persona file and the logistics reframe are dated 2026-05-19, two days before the post was published on 2026-05-21. The KB shows the insight existed before "May", so "since I first wrote this" is supported for the outreach work that followed, not for when the idea arrived.
  - Outbound campaign work is selling, not listening, and should not be counted toward this sentence.
  - `ekuzo-messaging-voice.md` § Author integrity: "Don't invent ... a lived experience". Supported floor: "reading about".
- **4.2 (note).** "I first worked through this by reading a long thread" (line 56, changed from "I recently read"). The new wording adds a claim that the thread was Karlin's first engagement with the question. UNVERIFIED: the KB check did not establish who read the thread.
- **4.3 (note, pre-existing).** "When gaming goes sideways, I usually see the same pattern" (line 72). Consistent with Karlin's standing ("coaches this age group in League"). The removal of "I've read Glow Kids ... and The Anxious Generation" also removes an unverified reading claim, which helps. Backstory paragraphs (lines 112 to 118) are owner-fixed and match the listed standing.

## Check 5. Alt-ed vocabulary and never-says: 2 should-fix, 5 notes

No exact Avoid-list phrase appears. Bundling rule: PASS ("homeschool" used throughout, "co-op" used specifically). No "socialization", "real world", "remedial", "deficit", "leaderboard", "tournament" or ESA claims.

- **5.1 (should-fix).** "I wrote as if a homeschooled kid starts without a peer group." (line 50, new). The sentence restates the deficit frame to retract it, which puts "homeschooled kid ... without a peer group" in print again, next to Avoid entries "lacks socialization" and "isolated". It also only means something to a reader who saw the May version, and it is the document talking about itself (voice-dna §2T). There is a real honesty case for a visible correction on an updated post; that is the owner's call. The correction is the risky half; the positive claim after it stands without it.
- **5.2 (should-fix).** Internal contradiction created by the edit. Line 50 says families build a peer group on purpose (co-op, clubs, sports, church). Line 70 says "Take it away cold and you've taken the kid out of their peer group too", and line 68 says "every friend they have lives inside one game". "Their peer group", singular and total, is the May framing the new paragraph retracts, and it sits close to Avoid entry "isolated".
- **5.3 (note, pre-existing).** "Unsupervised, open-ended, isolated play" (line 42). "Isolated" is on the Avoid list as a label for homeschoolers. Here it describes play. Low risk; it is in the answer block.
- **5.4 (note, pre-existing).** "Homeschool families are well positioned to join that camp, because the day has room for it." (line 64). Near "gaming is the obvious fit for homeschoolers".
- **5.5 (note, pre-existing, owner-fixed backstory).** Competition-led framing for an audience that "often chose this path to escape competition": "Competitive play doesn't let you coast. A bad call loses your team the round in under a minute, with four teammates watching." and "The pressure to get better" (line 116). The new section's "Competition can wait until they ask for it" (line 104) is the right counterweight and matches the FAQ canon's competitive-pressure answer. The "$80,000 in esports scholarships" line touches the Compete pillar directive ('Any "scholarship or go-pro" framing is off-brand'); it is Karlin's fixed backstory.
- **5.6 (note).** "church" appears twice (lines 50, 106). Both are from the canon list. The persona's largest recent-growth archetype is secular; twice is fine, a third would start to read as an assumption (Avoid: "homeschoolers are religious").
- **5.7 (note).** Good posture, worth keeping: "You can build a version of that at your own kitchen table. We're one place that does it, if you want the help." (line 126) matches "here's a tool you can use if it fits".

## Check 6. Posture: 1 should-fix, 6 notes (all pre-existing unless marked)

- **6.1 (should-fix, pre-existing).** "A game gave me a team, and the team gave me everything else. Most kids have that in them too. They just need an environment that calls it out." (line 136). One person's story extended to "most kids", with "just need". Decision-training guardrail: individual transformation stories are not population evidence; "more likely", never "guaranteed". Also "Don't promise magical transformation."
- **6.2 (note, pre-existing).** "gaming can build focus, friendships, and a reason to get out of bed" (line 42). "Build focus" sits near the never-say on attention capacity (Screen-time science). Hedged by "can". It is in the answer block that LLMs quote.
- **6.3 (note, pre-existing).** "The opportunity is real, and I don't say that as a gamer making excuses for the hobby." (line 60). Argues that gaming matters (Posture guardrails) and argues with no one (voice-dna §2N). The rest of the sentence uses the compliant "practice" framing with its conditional ("Played with structure").
- **6.4 (note, pre-existing).** "Showing up repeatedly with the same group around a shared interest is how social development actually happens" (line 93). Stated as settled mechanism.
- **6.5 (note, pre-existing).** "That's the version that grows a kid and calms the risk at the same time." (line 122, sentence unchanged inside a changed paragraph). Unhedged outcome claim.
- **6.6 (note, pre-existing).** "Structure helps most kids." (line 132). Unsourced quantifier. The caveat section around it is strong posture and should stay.
- **6.7 (note, outside the draft).** Footer banner "Enroll into a transformational program today". Agree with the draft's flag: "Overstated transformation claims" is in Language We Avoid.
- PASS: nothing blames the kid. The quantity guardrail is honoured ("The number of hours matters"). "Addictive" appears only when reporting the study; the caveat uses "compulsive". The worried parents' instinct is conceded before it is complicated.

## Check 7. Page-level redundancy (voice-dna §2L): 2 should-fix, 2 notes

- **7.1 (should-fix).** The thesis line appears in near-identical words more than twice. "The same game can do both" (line 42), "The same game can grow a kid or shrink their world" (pull quote, line 76), "If the same game can go either way" (line 80), plus the meta description. "What surrounds it" appears three times (deck, line 42, pull quote). "The environment around the game" appears three times (twice in line 42, once in line 54), and "environment" seven times in all. The changed answer paragraph adds one of these ("the environment around the game is yours to shape").
- **7.2 (should-fix).** Links to the sibling post: three in the body (lines 56, 70, 138) plus the keep-reading card, four in all. The change table says two. "200" appears in lines 56 and 138 and again in the card title.
- **7.3 (note).** The same-people idea appears five times: line 50, the five-question check, the "Keep the same people" bullet (twice inside it, with "steady team"), and "steady teams" in line 126. Lines 50 and 93 say the same thing in nearly the same words ("the same kids show up around the same interest week after week" / "Showing up repeatedly with the same group around a shared interest").
- **7.4 (note).** The daytime advantage is made twice ("A coding block at 10am is a normal Tuesday", line 64; "Yours can happen at 1pm", line 108). Two placements is within the rule.

## UNVERIFIED

- **U1.** Whether Karlin or the team has had real conversations with homeschool families (finding 4.1). Not in the KB; only the owner can confirm.
- **U2.** Who read the Facebook thread (finding 4.2).
- **U3.** The UCI paper's Table 3 cell values for the SEL outcomes (the fact library's OR 3.20 and 2.76). The extracted text confirms "seven of the eighteen" and the abstract; the table cells did not extract cleanly, so the two odds ratios were not re-checked.
- **U4.** The Columbia study's own text in JAMA. Only the Columbia news page was opened.
- **U5.** `GutCheckAside` contents were not opened; the five questions were taken from the draft's summary.
- **U6.** The seven "unchanged" sources other than the two tested were not re-fetched.

## Priority list

1. BLOCKER 2.1: dad's warning paraphrased at line 70.
2. BLOCKER 2.2: "every friend they have lives inside one game" at line 68.
3. BLOCKER (pending owner) 4.1: "reading and listening in homeschool communities".
4. Should-fix 3.4: the UCI sentence, "most tied to real growth ... a caring adult, the coach".
5. Should-fix 3.5: "active ingredients" in body and sources label.
6. Should-fix 5.2: "their peer group" contradiction between lines 50 and 68 to 70.
7. Should-fix 5.1: "I wrote as if a homeschooled kid starts without a peer group."
8. Should-fix 3.10: "in a lot of homeschools, gaming ends up doing two jobs".
9. Should-fix 2.3, 2.4, 2.5: "aiming it" list, "both loud camps", "structured, social, supervised".
10. Should-fix 3.8: "the thing most parents are looking for".
11. Should-fix 3.9: "steady teams".
12. Should-fix 3.3b: "needs a small group and nothing to win yet".
13. Should-fix 1.2: "Most parents just never get told".
14. Should-fix 6.1: "Most kids have that in them too. They just need".
15. Should-fix 7.1, 7.2: thesis repetition; four sibling links.

---

## Retest 1 (2026-10-12)

Re-read the revised post section (draft file lines 41 to 145). Lead decisions accepted as not defects: the "plan for the friendships" idea stays in Karlin's own words, the deck stays, "esports" stays in the shared program line.

**Verdict: approve with fixes.** No blockers remain. 1 should-fix still open, 2 notes still open, 2 new notes.

### Mechanical lint: PASS

| Item | Count |
|---|---|
| Em dashes | 0 |
| En dashes | 0 |
| Hard-banned words (§3A) | 0 |
| Banned phrases (§3C), incl. the "never get told" near-match | 0 |
| Banned transitions (§3D) | 0 |
| Title-case headers | 0 of 11. The "(new section)" label is out of the header |
| Soft-banned (§3B) | 1 "quietly" (was 2). Within tolerance |
| Negative parallelism | the deck only, kept by decision |

### Findings 1 to 15

| # | Finding | Status |
|---|---|---|
| 1 | Dad's warning paraphrased | CLOSED. New wording is Karlin's advice and no longer tracks the sibling's sentences; accepted per lead decision |
| 2 | "every friend they have lives inside one game" | CLOSED. Now "nothing outside the game gets a turn" |
| 3 | "reading and listening in homeschool communities" | CLOSED. Sentence removed |
| 4 | UCI sentence | STILL OPEN (should-fix, narrower). See R1.1 |
| 5 | "active ingredients" in body and source label | Source label CLOSED. Body STILL OPEN as a note. See R1.2 |
| 6 | "their peer group" contradiction | CLOSED. No "peer group" left in the post |
| 7 | "I wrote as if a homeschooled kid starts without a peer group" | CLOSED. Removed |
| 8 | "in a lot of homeschools, gaming ends up doing two jobs" | CLOSED. Removed |
| 9 | "aiming it" list, "join that camp", "both loud camps", "structured, social, supervised" | CLOSED. All four gone. The one remaining "camps" is the allowed pointer in the closing line |
| 10 | "the thing most parents are looking for, whether or not they've named it" | CLOSED. Removed |
| 11 | "steady teams" in the EKUZO sentence | CLOSED. Now "a team" |
| 12 | "needs a small group and nothing to win yet" | CLOSED. Now "I'd start a kid in that spot with..." |
| 13 | "Most parents just never get told" | CLOSED. Now "The environment is the lever, and it's yours." |
| 14 | "Most kids have that in them too" | CLOSED. Now "A lot of kids". "They just need" remains and is acceptable beside the hedge |
| 15 | Redundancy: thesis repetition; four sibling links | Links CLOSED (two in body plus the card, matching the change table). Thesis repetition STILL OPEN as a note. See R1.3 |

### Open and new items

- **R1.1 (finding 4, STILL OPEN, should-fix).** "Students who had a mentor in the program, a coach, a teacher or an older student, reported more growth on 7 of the 18 outcomes the researchers tracked. That's students describing themselves, so I read it as a pointer and not as proof." (line 83). The hedge and the "working paper" label are right and "7 of the 18" matches the paper. The description of the comparison does not. The paper did not compare students with a mentor against students without one. Its unit of analysis is a turn of talk in interviews: "Odds ratios were calculated to measure the effect of a mediating variable on a standard's code appearing in talk". The finding is that when interviewees talked about mentorship they were more likely to describe learning, significantly so for 7 of 18 outcome codes at p<0.10. Three smaller mismatches in the same sentence: the interviewees were 55 students and 15 staff, so "students describing themselves" leaves out the staff; the paper says "another student", not "an older student"; "more growth" is the paper's "odds of learning occurring".
- **R1.2 (finding 5, STILL OPEN, note).** "The people and the structure do most of the work." (line 85). Softer than "active ingredients" and still an unhedged causal claim one paragraph after the post says the evidence is "a pointer and not ... proof".
- **R1.3 (finding 15, STILL OPEN, note, pre-existing).** "The same game can..." still appears three times (lines 45, 77, 81) and "what surrounds" three times (deck, line 45, pull quote). "The environment around the game" is down from three to two. The deck and pull quote are kept by decision, so this is recorded, not pressed.
- **R1.4 (NEW, note).** "The people and the structure do most of the work." (line 85) and "A few moves do most of the work:" (line 91). The replacement phrase now appears twice within six lines.
- **R1.5 (NEW, note).** "*[The closing italic bio is removed. See change 9.]*" (line 145). The bio is change 10 in the revised table. Reviewer note only; it does not ship.

### Still UNVERIFIED

U2 (who read the Facebook thread; the draft now tells the owner this), U3 (Table 3 cell values), U4 (the JAMA paper itself), U5 (`GutCheckAside`), U6 (the other five sources). U1 no longer applies; the sentence is gone.
