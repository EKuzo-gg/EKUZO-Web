# Steward review: copy 2 of 9, the homeschool review

**Draft:** `docs/blog-refresh-2026-10/copy/02-homeschool-review.md` ("The post as it would read" and "Page furniture")
**Live:** `app/blog/what-homeschool-parents-taught-us-about-gaming/page.tsx`, `components/blog/QuoteCards.tsx`
**Sibling:** `docs/blog-refresh-2026-10/copy/01-homeschool-guide.md`
**Reviewed:** 2026-10-12. No file other than this one was edited.

## Verdict: approve with fixes

One conditional blocker (the caption, which the draft already gates on the owner's answer), three should-fix items on changed lines, the rest notes. The draft changes five paragraphs and every unchanged paragraph matches live word for word.

How it was checked: a script stripped the JSX from the live page, normalized quotes and whitespace, and tested every paragraph and every quoted string in the draft's post section as a substring of the live page or of `QuoteCards.tsx`. The sibling and the gaming-study page were read directly.

## Check 1. Mechanical lint: PASS, 3 notes

Counts over the post section plus page furniture:

| Item | Count |
|---|---|
| Em dashes | 0 |
| En dashes used as dashes | 0 |
| Hard-banned words (anti-ai-writing §3A) | 0 |
| Banned phrases (§3C) | 0 |
| Banned transitions (§3D) | 0 |
| Engagement bait, meta commentary (§1C, §1F) | 0 |
| Title-case headers (§1G) | 0 of 7 (all sentence case; Fortnite, Roblox, Minecraft are proper nouns) |
| Soft-banned words (voice-dna §3B) | 1, pre-existing |

- **1.1 (note, pre-existing).** "But it was valuable because parents were speaking plainly, in their own words, about a problem many families are trying to solve." voice-dna §3B lists "valuable" as soft-banned ("Almost never"). The sentence does say why it was valuable, so it is not the "valuable insights" filler. The sentence sits in a paragraph marked changed but is itself unchanged.
- **1.2 (note, pre-existing).** "so I read this less as a debate and more as a brief." anti-ai-writing §1B lists "Less X, more Y." One instance in long-form prose is allowed under "Frequency, not prohibition". Recorded so it is a choice.
- **1.3 (note).** The "Stop X. Start Y." construction (§1B: "Stop thinking X. Start thinking Y.") now appears three times in the first screen and a half: the new opening ("1 in 10 said stop shrinking it and aim it at something"), the table ("Stop trying to reduce it. Point it at coding, esports, and design."), and the H2 ("Stop reducing it. Start aiming it."). Each is a report of the camp's position, which is the allowed use. The new opening line is the one that raises the density from two to three. See also 4.4.

## Check 2. Quotes exist verbatim in live: PASS

All 16 quoted strings in the post section were found verbatim (after normalizing curly quotes) in `page.tsx` or `QuoteCards.tsx`:

"the hunt for dopamine." / "only eats while still gaming, wouldn't shower, wouldn't leave the house," / "was just biding his time until he could play again." / "Gaming is not inherently evil," / "wouldn't have gotten past his deep depression and anxiety" / "became work" / "without a solid alternative can lead to serious emotional distress, including depression." / "educational" / "13.7 years younger" / the three camp labels in the H2s / the four quote-card quotes as summarized in the bracketed line.

No quote was altered, added or dropped. Every paragraph not marked (new) or (changed) is a verbatim match to live. The five paragraphs the script reported as differing are exactly the five the draft marks as changed; there are no unmarked changes.

UNVERIFIED: whether these strings match the original thread. That is the owner's question 1 and cannot be checked from the repo. See 4.1.

## Check 3. No parent quote in the sibling guide: PASS, 3 notes

No quoted string from this post appears in the guide's "post as it would read" section. The guide's only quoted strings are its own ("What would you do differently next game?", "how long were you on?") and two source labels. None of these thread terms appear in the guide: babysitter, inherently evil, learning tool, solid alternative, emotional distress, biding, shower, dopamine, became work, deep depression, Glow Kids, Haidt, Kardaras, Fortnite, Roblox, Minecraft, cold turkey.

Residual echoes in the approved guide, all carried over from the copy-1 review and accepted by the owner there. Listed so the two posts are read side by side once:

- **3.1 (note).** Guide: "The dad who started that thread made this point better than I can." preceded by "have a plan for where the friendships that came with it go next." This is a pointer plus a one-clause paraphrase of the original poster's argument, which this post carries in full ("For his sons, the game is where their friendships live."). It reads as a deliberate hand-off, not a second telling.
- **3.2 (note).** Guide: "The books on their shelves are pointing at something true." This post: "the books on their shelves". Shared author phrase, not a parent quote.
- **3.3 (note).** Guide: "A kid plays the game they already love" echoes the quote card "Use what they already love as a learning tool." Four shared words, different claim.

## Check 4. Changed and new lines: 1 conditional blocker, 3 should-fix, 5 notes

### Caption

- **4.1 (BLOCKER, conditional on owner question 1).** "Real comments from a homeschool parent discussion, anonymized." Live: "Illustrative, anonymized recreations of real comments from a 2024 homeschool parent discussion." The draft correctly gates this on the owner confirming the quotes are word for word. Until that answer is in, the live caption must stay. The risk on each branch:
  - **If the quotes are tidied or reconstructed:** "Real comments" is a false statement about sourced speech, on cards drawn to look like social posts (avatar, "Homeschool parenting group" footer, like and comment icons). It is also not the only verbatim claim on the page. The page says so five more times, all pre-existing: "in their own words" (opening), "in their own words" (paragraph after the table), "Homeschool gaming, in parents' own words" (QuoteCards heading and its `aria-label`), "The parents handed us their exact words" (What we took from it), and every in-body quote sits inside quotation marks with "one dad wrote" or "one mother described". The draft's fallback changes one of these ("in the words they used", which still claims the same thing). If the answer is "tidied", the live "recreations" caption is the only honest line on the page and the other five need the owner's eye, not just the caption.
  - **If the quotes are word for word:** the caption is accurate, and the page then publishes verbatim text from a private Facebook group as crawlable text. `QuoteCards.tsx` line 5 to 6 says "the private group is never named or linked", but a verbatim sentence is searchable inside the group and recognizable to its author, and two of the quotes describe a child's mental health ("deep depression and anxiety") and an adult daughter's condition ("only eats while still gaming, wouldn't shower"). "Recreations" was doing privacy work as well as accuracy work. Dropping it is the owner's call; it should be made knowing that.
  - Rule: ekuzo-messaging-voice § "Verify incumbent/competitor claims before repeating them" is the nearest written rule and does not quite cover it; this is flagged as a plain accuracy and privacy risk rather than a cited-rule violation.
- **4.2 (note).** Dropping "2024" from the caption and "Recently" from the opening removes the contradiction but leaves the thread with no date anywhere on a page that will now show "Updated [ship date]". The underlying fact (2024 or spring 2026) is still unknown. UNVERIFIED which is right.

### Opening

- **4.3 (should-fix).** "Here are the three camps." voice-dna §2T (write about the subject, not the document): the line points at the table. It is also redundant now, because the sentence two lines above already names all three camps. The live line, "Three camps showed up.", was about the subject. Either line is now surplus given the new opening.
- **4.4 (should-fix).** "Roughly 6 in 10 said cut it off, 3 in 10 said set limits, and 1 in 10 said stop shrinking it and aim it at something." Accuracy against the table: PASS. 60/30/10 matches, and "Roughly" carries the "Rough shares from reading the thread, not a precise count" caveat forward. Two smaller problems:
  - voice-dna §2F (no elegant variation): the third camp's position is now worded three ways within one screen: "stop shrinking it" (opening), "Stop trying to reduce it" (table), "Stop reducing it" (H2). The camp's own label is "reducing".
  - The sentence follows "More than 200 parents answered", so "6 in 10" reads as a share of 200+ people. The caveat that it is a read and not a count now arrives after the table rather than beside the claim. "Roughly" is enough to pass; it is thinner than the live version, where the numbers only ever appeared with the caveat directly under them.
- **4.5 (note).** Removing "Recently I read a thread where" also removes the first statement that Karlin read it. "I read the whole thing." two paragraphs later restores it. No author-integrity issue (ekuzo-messaging-voice § Author integrity): the draft claims no credential Karlin lacks, "We coach kids through games for a living" is true for him, and nothing implies he is a homeschool parent or a member of the group.

### Title and meta

- **4.6 (should-fix).** "Should homeschooled kids play video games? What 200+ homeschool parents said". Accurate to the post and no overclaim: the thread's three camps are three answers to that question, and "200+" matches "More than 200 parents answered". Two points:
  - The dad's question in the post is "how to handle his sons and their gaming", not whether they should play. The title's question is the searcher's. Acceptable, since the second half scopes it to what parents said.
  - Length: 76 characters, and `app/layout.tsx` line 75 applies the template `"%s | EKUZO"`, so the title tag is 84. Search results cut at roughly 60, which would end near "What 200+ home". The live title is 51 (59 with the template). The owner's alternative, "What 200+ homeschool parents said about kids and video games", is 60 (68 with the template). The draft sets title tag and H1 to the same string; they do not have to match.
- **4.7 (PASS).** Meta description: "A dad asked a homeschool group how to handle his sons' gaming. 200+ parents answered in three camps. What each said, and the one thing they all want." Counted at 149 characters, as the draft states, under 160. Every clause is supported by the post. No overclaim.
- **4.8 (note, pre-existing).** "the one thing they all want" (meta, and the unchanged deck "the one thing they all actually want") sits beside "the same five wants show up across all of them" in the body. The post resolves it ("a version of gaming that has an adult, a team, and a point"), so this is a tension, not an error.

### Link sentences

- **4.9 (PASS).** "We [coach kids through games](/programs) for a living". Target changed per owner decision 5. The anchor describes what /programs holds. No claim about the destination.
- **4.10 (PASS).** "What to do about it is its own piece. It has a five-question check and the moves I'd make at home: [when gaming helps homeschool kids and when it hurts](/blog/when-gaming-helps-homeschool-kids)." The anchor is the guide's title. The five-question check exists (`components/blog/GutCheckAside.tsx`, five questions, kept unchanged in copy 1) and the guide has a list of moves. Both claims about the destination hold. This replaces a bare "here" anchor, which is an improvement.
- **4.11 (PASS, 1 note).** "I ran the same read on about a thousand replies to the viral "13.7 years younger" gaming study and wrote up [how those replies split and what the paper says](/blog/gaming-study-13-7-years-younger-what-it-means-for-kids). That number isn't in the paper."
  - "about a thousand replies": supported. Study page line 432: "I pulled about a thousand replies from the original post and the biggest posts that quoted it, nine threads, and read every one." Sources line 722: "about 1,000 replies across nine threads".
  - "That number isn't in the paper": supported. Study page line 363 to 365: "the number everyone was repeating isn't in it", and line 333: the line "came from a 2024 press release that counted gaming differently".
  - Anchor "how those replies split and what the paper says": the destination has an H2 "What a thousand replies said" and a short answer on what the study found. Supported.
  - Note: with the anchor moved to the end of the sentence, "That number" now follows "what the paper says" and has to reach back across the link to "13.7 years younger". It still resolves. Pre-existing and unchanged: the replies were to an X post about the study, not to the study.

## Check 5. Alt-ed vocabulary: PASS, 1 note

Neither "homeschooled kids" nor "homeschool parents" is on the Avoid list (ekuzo-messaging-voice § Alt-Ed Vocabulary, Avoid) or the never-say list (ekuzo-homeschool-families § What We Should Never Say to This Audience). Bundling rule: PASS. The post is about one homeschool parenting group and uses the specific term throughout; it does not fold in microschools, pods, co-ops or hybrids. The title asks a question and makes no claim that gaming suits homeschoolers, so it is clear of "gaming is the obvious fit for homeschoolers" and "gaming is good, actually".

Whole-post scan against the Avoid and never-say lists (pre-existing text included): no "isolated" or "lonely" applied to homeschoolers, no socialization framing, no "addictive gameplay". "Gaming is an addiction" appears twice (table, H2) as the first camp's stated view, which the owner has accepted. "The fear is grounded" keeps the post clear of "screen-time worry is moral panic" (§ Screen-time science guardrails).

- **5.1 (note).** The two sibling titles now use different forms: this one "homeschooled kids", the guide "homeschool kids" (its title, and therefore this post's new anchor text, two paragraphs from the end). Both forms are in use across the two drafts. Not a rule violation; a consistency choice for the owner.

## Check 6. Page-level redundancy (voice-dna §2L): 1 should-fix, 4 notes

Counts are for the rendered page: body plus `QuoteCards.tsx`.

| Fact or quote | Placements | Where | Live count |
|---|---|---|---|
| Camp shares (60/30/10) | 3 | new opening, table, H2s | 2 |
| "200+" / "More than 200" | 3 | H1, opening, closing | 3 |
| "without a solid alternative ... including depression" | 2 | quote card, body | 2 |
| "Gaming is not inherently evil" | 2 | quote card, body | 2 |
| "The screens have become the babysitter." | 1 | quote card | 1 |
| "Use what they already love as a learning tool." | 1 | quote card | 1 |
| "in their own words" / "parents' own words" | 3 (plus "their exact words") | opening, after table, card heading | 3 |
| "by hand" | 3 | Camp 3, agreement section twice | 3 |
| "an adult ... and a point / reason" | 4 | after table, bullet, agreement section, closing | 4 |

- **6.1 (should-fix, new).** The camp shares go from two placements to three, and two of the three are adjacent: the new opening sentence gives 6, 3 and 1 in 10, and the table directly beneath gives 60%, 30% and 10%. §2L is count-and-justify, and there is a reason (the first paragraph is the answer block, marked in the live file as "Load-bearing for LLM citation"). The owner should accept the third placement on purpose or drop one, most cheaply the percentages in the three H2s.
- **6.2 (PASS).** No parent quote appears more than twice. The two that appear twice (original poster, "not inherently evil") are each once in a card and once in the body.
- **6.3 (note, pre-existing).** "200+" three times. Unchanged from live; the H1 and the closing line are the two natural placements and the opening is where it is first load-bearing.
- **6.4 (note, pre-existing).** The thesis ("an adult, a team, and a point") is stated four times and "by hand" three. These are argument, not hard facts, and outside the scope set for pre-existing text.
- **6.5 (note, pre-existing).** The "own words" claim three times, plus "exact words". Material only if the answer to question 1 is "tidied"; see 4.1.

## Not verifiable from the repo

- UNVERIFIED: whether the quotes are verbatim from the thread (owner question 1).
- UNVERIFIED: the thread's date (2024 per the live caption, "Recently" per the live May 2026 opening).
- UNVERIFIED: that the thread had more than 200 parent replies and split roughly 60/30/10. The post presents these as Karlin's read; no source file for the thread is in the repo.
- Not checked: how the title renders on the /blog index, author page and keep-reading card at 76 characters. That is a build-time visual check.
