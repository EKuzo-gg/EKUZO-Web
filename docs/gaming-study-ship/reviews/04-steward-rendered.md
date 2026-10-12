# 04 Steward review of the rendered pages (phase 4)

Steward, 2026-10-11. Review and rulings only. No app file was edited. Build reviewed: `9f4e523` on `build/gaming-study-ship`.

**Loaded, in order:** `anti-ai-writing.md`, `voice-dna.md`, `ekuzo-messaging-voice.md` (posture, Language We Avoid, screen-time science guardrails, author integrity), `claims-register-gaming-cognition.md` (rows 1 to 19, never-say A to L, Numbers that expire), the brief (decisions, copy beyond C1 to C10, assets), `01-requirements.md`, `02c-approved-copy.md`, the static evidence (`copy-fidelity.txt`, `bare-13-7.txt`, `links-table.md`, `inbound.txt`, rendered text in `evidence/static/text/`), the post source, the five link paragraphs in their source files, my phase 2 review, the 26 named screenshots, and the three designer finals beside the three shipped files.

**How the images were compared.** By eye at full size, then numerically with sharp (whole-image and per-region difference, means, colour counts), then 1:1 side-by-side crops of the dark background, the hand lettering, the underline and the neon stickies. Scripts and crops are in the session scratch directory, not in the repo.

**Evidence limits.**

- `post-375-full.png` is not a usable capture (Parent's finding E1 stands): it is 908 CSS px wide with the page in the left 375 and it repeats the top of the article. I read the phone page from the 375 detail shots and the body from `post-1440-full.png` plus the rendered text file. The second half of the article at 375 has not been seen by me.
- `evidence/head-and-schema.txt` was captured at 21:05, before the 22:19 recompression. It records the old byte sizes (281053, 116316, 164192). The screenshots are from 22:28 and show the recompressed files. See ST-013.
- The known "Short answer:one study" spacing bug is visible in every opening screenshot. Not logged, as instructed.

## A. Claims trace (CP-17)

Result column: PASS, FAIL, or PASS (R) where a residual risk is recorded under the rulings. Rows are register rows; letters are the never-say list.

### Head, metadata and structured data

| Sentence | Row(s) | Result | Note |
|---|---|---|---|
| H1 and BlogPosting headline: "The gaming study everyone shared, and what it means for your twelve-year-old" | 1, 7 | PASS | No finding stated. |
| SEO title, og:title, twitter:title: "Is gaming good for your brain? The “13.7 years younger” study, for parents" | 3, B | PASS (R) | The figure is in quotation marks as the public's label for the study. Marker: the quotation marks only. In a search result the correction is one line down in the description. Frozen (CP-19). |
| Subhead: "A doctor posted one line about a study. More than 30 million people saw it." | Numbers that expire | PASS (R) | Ruling 3. |
| Subhead: "I read a thousand of the replies, and the one that mattered wasn’t about the study." | 16, 15 | PASS | Corpus is 1,057. |
| Description, og, twitter, BlogPosting description, `llms.txt` line: "A physician's one-liner about a gaming study reached 30M+ people." | Numbers that expire | PASS (R) | Same residual as the subhead, on five surfaces with no "views" correction beside them. ST-004. |
| Same string: "What the study found, where “13.7 years younger” came from, and what it means for a twelve-year-old." | 3, B | PASS | Marker: "where ... came from" announces a provenance question. It does not present the figure as the finding. |
| `/blog` excerpt: "A doctor's one-liner about a gaming study reached 30M+ people. Karlin read a thousand of the replies." | 16, Numbers that expire | PASS (R) | Sixth surface for "people". ST-004. |
| FAQPage JSON-LD (five questions and answers) | see FAQ below | PASS | Same strings as the visible FAQ. |
| VideoObject name and description (the entrance-essay reel) | K | PASS | One parent, one kid, no claim about kids in general. No number, study or causal verb. The transcript says "it was last week" (Sentry S-003, spoken verbatim, accepted). |

### Images and alt text

| Sentence | Row(s) | Result | Note |
|---|---|---|---|
| Hero and card image text: "Frequent video gamers performed on cognitive tests like non-gamers that were ~13.7 years younger" under "Brandon Luu, MD" | 3, B | PASS | Ruling 5. Marker: hand-drawn double underline under the figure and the taped note "not in the paper" directly below it. |
| Hero and card: paper title and abstract fragments legible at full size ("benefits of", "was associated with better cogniti...") | 1, 6 | PASS | The paper's own words inside a screenshot of the post. The abstract's "cross-sectional" is also legible. |
| Hero and card: "3:00 PM · 13 Sep 26", "684", "3.2K" | Numbers that expire | PASS | Part of a dated screenshot; the date is in frame. |
| Stickies: "WHICH GAMES? HOW MANY HOURS? WHAT AGE? BETTER THAN SPORTS?" | 16, E | PASS | Questions quoted from the audience, matching the body ("which games, what age, how many hours, is it better than sports"). E forbids asserting it; this asks it. See D for the 768 crop, where the last one reads as fragments. |
| Hero alt: "A phone showing the X post that says gamers test “~13.7 years younger.” The number is underlined, and a taped note under it reads “not in the paper.” ..." | 3, B | PASS | Marker: "The number is underlined, and a taped note under it reads not in the paper", in the next sentence of the same attribute. Matches the picture at every width except that the stickies are out of frame at 375. |
| Graphic text and its alt: "Same game. Two different hours. Screen time / Practice ... From the doorway, both look like screen time." | 17, D, E | PASS (R) | Ruling 7. |
| Card as `og:image` alt (the H1) | none | PASS | |

### Body

| Sentence | Row(s) | Result | Note |
|---|---|---|---|
| "Short answer: one study of 923 adults, average age 55, found that people who game three or more hours a week scored higher than non-gamers on memory, reasoning and processing-speed tests." | 1, 14 | PASS | Row 1 nearly verbatim. |
| "It can't say the gaming caused that, and no one under 18 was in it, so it tells you nothing about your twelve-year-old." | 6, 7 | PASS | Same paragraph as the finding, as row 6 requires. |
| "The “13.7 years younger” line came from a 2024 press release that counted gaming differently." | 3, 14, B | PASS | Marker: "came from a 2024 press release", same sentence. |
| "I think the better question for a kid is what kind of gaming, and who he plays with." | 13 | PASS | Hedged as his view. |
| S1: "A physician with a big following put up a study abstract and one sentence: frequent gamers performed on cognitive tests like non-gamers about 13.7 years younger." | 3, B | PASS (R) at page level | Ruling 1. Marker: the paragraph before ("came from a 2024 press release") and the paragraph after ("isn't in it"). None inside the paragraph. |
| S1: "Counting the posts that quoted it, it passed 30 million views in its first week." | Numbers that expire | PASS | Supported by the Sources line (more than 30M by September 15, two days in). |
| S1: "For three days my feed argued about whether video games make you smart." | A | PASS | Reports the argument, does not join it. |
| "My second, after I read the paper, was that the number everyone was repeating isn't in it." | 3 | PASS | |
| "Competing paid for a big chunk of college, more than $80,000 in scholarships. That's not the plan for your kid; the scholarships were the receipt." | author integrity | PASS | Karlin's own credential. The Compete directive bars scholarship framing; the sentence refuses it in so many words. |
| "So, gamers score higher on memory and reasoning tests: yeah. Everything I'm good at, I can trace to a game." | 1, A, L | PASS | Closest the body comes to A and L. The same paragraph says "a study of 55-year-olds proves nothing about me or your kid" and ends "One person." |
| "the kid who couldn't order a sandwich learned to run five strangers through a 40-minute match, and the working at it is what changed me" | K | PASS | First person, one person, about effort and not about the game. |
| "The most-liked reply under the original post was eleven words, and the doctor who posted the study answered “True.”" with "@CraigBrockie, 1.1K likes when I read it on September 15" | 15 | PASS | Eleven words, counted. Dated. |
| "A kid calling shots for four teammates with a clock running is doing something different from a kid tapping cartoon fruit on a slot machine." | 13 | PASS | "Something different", not "something better for his brain". |
| "I pulled about a thousand replies ... nine threads, and read every one. A second reader checked a sample and disagreed with me one time in five, so call this rough." | 16 | PASS | 81% agreement. "I read", as the row asks. |
| "Four in ten were pro. One in six: “the study's fine, but.” Under one in ten against." | 16 | PASS | The row's shipped shares. |
| "The vindicated, one in six." "The permission seekers, one in ten." "The “which games” crowd, one in twelve." | 16 | PASS, row incomplete | The three camp shares are not written in row 16. Source is the ws11 analysis. Frozen September text. ST-012 asks for the row to be completed. |
| "(A fourth, the skeptics, said cross-sectional, self-reported, read the paper. They were right.)" | 6, 16 | PASS | |
| "The study couldn't test that; too few action-game players to compare genres. The audience tested it from experience." | 13 | PASS | "From experience" keeps it out of evidence. |
| Reply cards: four quotes with handles, "1.1K likes at the time", "412 likes at the time", footnote "have moved since" | 15, Numbers that expire | PASS | Attributed, dated. The @hadesplaybook quote ("may not be doing the same thing to the player") is a stranger's hedge shown as a stranger's. |
| "I counted about 120 questions ... Not one got an answer. The few dozen parents talking about their own kids weren't celebrating." | 16 | PASS, row incomplete | "A few dozen parents" and "none got an answer" are in the row; the 120 is not. ST-012. |
| "My answer to the first one is how I run a season, not a promise about what comes out. ... A coach who sets the end of the session before it starts" | 17, D | PASS | Row 17 with its own disclaimer attached. |
| "In June a parent emailed me. Her son ... wrote about playing mid lane in League of Legends. I won't tell you what that proves." | K | PASS | Declines the inference in the sentence. |
| "True. 923 adults, average age 55. Gamers at three-plus hours a week scored higher on memory, reasoning and processing speed; verbal ability, no difference (Paleczny et al. 2025)." | 1, 4 | PASS | Row 6 sits two bullets down in the same list ("Needs explanation"). Accepted at list level. |
| "Gaming had no association with depression or anxiety. Exercise did, and had none with the cognitive scores." | 5 | PASS | Both halves together. |
| "That's the half I built around: kids in my sessions do pushups and drink water before ranked." | D | PASS | What he does, not what it produces. |
| "The senior author ran the 2010 Nature study that found brain-training games don't transfer (Owen et al.). Hard to convince." | 9 | PASS | |
| "Dubious. “13.7 years younger.” It's from a 2024 press release with a different definition of “frequent”; the paper never converts to years." | 3, 14, B | PASS | Marker: the label "Dubious." before it and the press release in the next sentence. |
| "about 15 years at the sample's average age of 55, about 12 at 70, and over 20 at 40, where the study runs out of data. (The script and its output, if you want to check.)" | 3, 2 | PASS | The row's shipped wording. Anchor age stated for each figure. Never "roughly right". |
| "Cross-sectional and self-reported: it can't say whether gaming builds the skill or skilled people game more. Volunteers, mostly college-educated." | 6, 18 | PASS | |
| "Three of five authors work for Creyos, whose tests were used; disclosed, and Canada's CIHR funded it." | 8, J | PASS | Plain, no insinuation. |
| "About kids. Not in this study. The one big study of nine- and ten-year-olds (three-plus hours a day) found somewhat better inhibition and working memory alongside higher attention-problem and depression scores; it was retracted and replaced in 2023, numbers intact, differences “very small”" | 7, 10 | PASS | Both sides, "retracted and replaced", both links to 2797596 and the notice. |
| "Anyone quoting the first half without the second is doing the 13.7 thing again." | 3, B | PASS (R) | Ruling 2. |
| "Time in a game displaces something, and this study measured neither sleep nor what the gaming replaced. A small share of heavy players get into real trouble. Open public queues ..." | 19 | PASS | The required paragraph. No "addiction". |
| "A post that makes you feel better about the hours is not a reason to stop counting them." | 19, screen-time guardrail | PASS | The quantity guardrail every quality claim must travel with. |
| "So: the study is real, the number isn't the paper's, and a thousand strangers handed a study about hours spent three days talking about which game and who's around him while he plays." | 1, 3, L | PASS | "The study is real" says the paper exists. L forbids "the gap is real" standing alone; here the same sentence carries the correction. |
| FAQ 1: "had too few action-game players to compare genres ... That's my design choice, not a finding of this study." | 13 | PASS | |
| FAQ 2: "This study can't answer that; no one under 18 was in it. The child studies I know of are cross-sectional and mixed ... retracted and replaced in 2023 ... “Associated with,” every time." | 7, 10 | PASS | |
| FAQ 3: "three or more hours a week across any game; the press release used five or more on one game. Neither is a recommendation. ... compared three groups rather than testing a dose ... Nagata and colleagues ... family media plan and the AAP's five Cs." | 14, 19 | PASS | Row 14 says "one genre" where row 3 and the post say "one game". The register disagrees with itself; the post matches row 3. ST-012. |
| FAQ 4: "No. Different associations with different outcomes ... Cross-sectional, so no direction either way." | 5, 6, E | PASS | |
| FAQ 5: "Set the end before the start ... the reason my sessions have a schedule a kid can see." | 17, D | PASS | Design, no outcome. |
| Sources: Paleczny et al. 2025, dataset, reanalysis; Western release October 17, 2024; Owen 2010 Nature 465:775; Chaarani 2022 retracted and replaced 2023; Nagata 2026 | 1, 2, 3, 9, 10, 19 | PASS | Matches the register's citations. Sentry could not open the two JAMA links past the bot wall (S-006); a human open is still owed. |
| Sources: "a read of about 1,000 replies across nine threads on September 14 and 15, 2026; a blind second pass agreed with the stance labels 81% of the time" | 16 | PASS | |
| Sources: the view-count sentences | Numbers that expire | PASS | Ruling 4. |

### The five link sentences

| Sentence | Row(s) | Result | Note |
|---|---|---|---|
| Anchor in all five: "the viral “13.7 years younger” gaming study" | 3, B | PASS | Marker in each case is listed below. Figure in quotation marks as a label. |
| S2.1: "If [anchor] is why you're here, that number isn't in the paper. I read about a thousand of the replies ..." | 3, 16 | PASS | Marker: same sentence. |
| S2.2: "...the most-liked reply under the original post was “The kind of gaming probably matters as much as the hours,” which is this whole page in eleven words. The 13.7 isn't in the paper." | 15, 3 | PASS | Marker: second sentence after the anchor. "The 13.7 isn't in the paper" is a bare figure whose own sentence is the correction. |
| S2.3: "Related: when [anchor] went around (the number isn't in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up." | 3, 7, 17, 16 | PASS | Marker: parenthesis directly after the anchor. The only one of the five that also carries row 7. |
| S2.4: "I ran the same read on about a thousand replies to [anchor]. That number isn't in the paper. The replies sorted into camps there too." | 16, 3 | PASS | Marker: next sentence. |
| S2.5: "The same idea surfaced when [anchor] made the rounds (the number isn't in the paper; Karlin, our founder, read about a thousand of the replies). The most-liked reply under the original post was “The kind of gaming probably matters as much as the hours.”" | 3, 15, 16 | PASS | Marker: parenthesis directly after the anchor. |

No sentence in the trace fails. Never-say A to L: A clean (the feed's argument is reported, never adopted). B and C clean at page level. D clean (three places describe design and each one says so). E clean (asked as a question twice, answered "No" in the FAQ). F, H, I not present; the two largest quote-posts are counted and their author is not named. G clean ("mixed", "dubious", "needs explanation"). J clean (CIHR named). K clean. L clean.

### Rulings

**(1) The S1 paragraph. PASS at page level.** The sentence is indirect speech with a named speaker ("a physician ... one sentence:"), the paragraph above says where the figure came from, and the paragraph below says it is not in the paper. A reader of the page cannot take 13.7 as the study's finding. The paragraph-level finding from phase 2 is unchanged: lifted alone, the paragraph prints the figure with no provenance, and row 3 says never the number alone. Jamie chose this version knowing that. Residual risk, recorded as ST-003: answer engines and the asset pack lift single paragraphs. The control is outside the page: the asset pack must not use this paragraph as a pull-quote, and the Short answer paragraph (which carries the correction) is the one to offer for extraction.

**(2) "doing the 13.7 thing again". PASS.** Here "13.7" is the name of the mistake, used against the practice of quoting half a result. It asserts nothing about the study. The "Dubious" bullet two items up in the same list carries the provenance. Frozen September text; I accept Sentry's S-004 as closed.

**(3) Subhead, "More than 30 million people saw it". PASS with the residual on record.** Jamie's ruling stands. What is loose: the unit is views, not people (the same person counted on each post and each visit). "It" reads fairly as the one line, which the quote-posts also displayed, so the wave total is defensible for "it"; a reader who takes "it" as the single post would be wrong, since that post alone is at 17.2M. Does the page now reconcile? Yes, inside the article: S1 says "Counting the posts that quoted it, it passed 30 million views in its first week" and Sources says "more than 30M across the original post and its quote-posts by September 15, 2026". A reader who checks finds the accurate unit and the accurate scope twice. Outside the article it does not reconcile: the description, the og and twitter cards, the BlogPosting JSON-LD, `llms.txt` and the `/blog` excerpt all say "reached 30M+ people" with nothing beside them. ST-004.

**(4) Sources line, dated reads. PASS.** Every figure sits beside the date it was read: more than 30M by September 15; 17.2M on October 11; 5.8M, 7.9M and about 33M across eight posts on October 6. The arithmetic holds (17.2 + 5.8 + 7.9 + 2.3 = 33.2; one original, two large quotes, five smaller ones). The first sentence is the evidence S1's "first week" rests on, which was the phase 2 gap. No combined figure for the two quote-posts is printed, and their author is not named. Open item, not a defect: the brief asks for a ship-day re-read of the two quote-posts (CP-14). If it does not happen the line is still true as dated.

**(5) Hero and share card showing the doctor's post. PASS.** The figure appears as his post, under his name, with the underline tying it to the note "not in the paper" directly beneath. That is row 3's rule met inside the picture: the number never stands without its mark. The note is true, and it corrects the claim without insinuation about the man. The mark survives every crop I was shown (1440, 1024, 768, 375, the `/blog` featured card and the grid card). Two residuals, both small: the note is taped across the paper's title block, so a careless reader could take it as a label on the abstract rather than on the number (the underline is what prevents that); and the picture puts a named physician's post under a correction on a commercial site, which is fair because it is accurate and public, and which the body softens by never naming him outside Sources.

**(6) The share card alone in a link preview. PASS.** I scaled the card to 506, 360 and 240 px wide. At 506 (a large X or LinkedIn card) both the sentence and the note read, and the note is the bigger of the two. At 360 (iMessage, Slack) the note reads clearly and the "~13.7 years younger" line is at the edge of legibility. At 240 only the stickies and the lime note shape survive. At no size can a viewer read the claim and not the correction. What the note cannot do alone is say what is not in the paper; at preview size that depends on the preview title, which reads "The “13.7 years younger” study, for parents", and the two together do the job.

**(7) The "Same game. Two different hours." graphic. Design description. PASS.** Every row is a condition someone sets: who is there, who is watching, when it ends, what it is for. None is a result. "Practice" is the word the screen-time guardrail tells us to use ("say practice, environment, reps"), and the paragraph it sits under says "how I run a season, not a promise about what comes out". D clean: nothing about cognition or scores. E clean: no comparison with sport. Row 17 applies as written. Residuals: the lime column is plainly the preferred one, so the graphic makes a value judgment about structure, which is EKUZO's stated position and not an outcome claim; and as the standalone 4:5 asset in the pack it travels without the "keep counting the hours" paragraph. The footer line "From the doorway, both look like screen time" holds the hours equal, which keeps it clear of "quality makes quantity irrelevant". When it is posted alone, the caption should carry one sentence of the quantity guardrail.

## B. Never-say and offer integrity

**The article.** Clean against Language We Avoid and the screen-time guardrails.

- Cognitive enhancement: none. The post's whole job is to refuse it.
- Transformation language: one personal line ("the working at it is what changed me"), fenced with "One person."
- "Healthy gaming", "addiction", moral-panic dismissal: none. "A small share of heavy players get into real trouble" is the approved shape.
- Gaming as a problem to fix: none. Kids are not blamed anywhere; the parent quotes are treated as correct.
- Pricing: none.
- Promises: "my coaches answer parent questions" (link to `/parents`), "kids in my sessions do pushups and drink water before ranked", "my sessions have a schedule a kid can see", "a team that's expecting you on Tuesday". All are descriptions of practice, in the commitment voice. None promises a result.

**The three asks, as rendered.**

- Popup: "THEY GAME" / "TOO MUCH." struck through / "WITH A COACH." Then "Turn screentime into practice. A real coach, a team that counts on them and a season to play for." "Join the list and you'll hear first when sign-ups open." Button "Save their spot". "For parents. Free, no commitment. Unsubscribe anytime."
- Sticky bar: "SEASON 01 WAITLIST IS OPEN" with "Join Season 01" (button only at 375).
- Footer banner: "Season 01 starts in 2027. Get them on the list."

**Adjacency ruling.** No claims problem: none of the three makes a cognitive, academic or outcome claim, and "Turn screentime into practice" is the same pair of words as the graphic's two column heads, so the page and the ask say one thing. Three flags, none of which I can or should change:

1. **Tone and the quantity guardrail (ST-005).** The popup strikes out "too much". The article's most careful paragraph says "A post that makes you feel better about the hours is not a reason to stop counting them." Read together, the strike-through can sound like the thing the guardrail forbids ("anything that sounds like excusing overuse"). The article supplies the guardrail the popup lacks, so the page as a whole is safe, but the popup opens before the reader has reached that paragraph. Parent's P1 reaches the same place from the trust side.
2. **Tense (ST-006).** The article speaks in the present about running sessions ("how I run a season", "kids in my sessions", "what I hear on every intake call"). The only offer on the page says Season 01 starts in 2027. Both can be true, and a parent may still ask what is running now. Parent's P2 is the same gap. Jamie should read the two together once.
3. **"Save their spot"** against "you'll hear first when sign-ups open" (Parent's P3). Existing approved copy; noted only.

## C. Voice

**Karlin's register, changed and new strings as rendered.**

- Short answer: his. Plain, first person at the end ("I think the better question"), no hedging stack.
- S1: his again now that it opens "I saw". "Probably the same way you did" fixes the phase 2 sense problem.
- "What the study found, and what it didn't" and "Is gaming good for kids' brains?": plain, sentence case.
- Hero alt and the Sources line: reference register, correct for where they sit.
- S2.1, S2.2, S2.4: his. S2.3 is house voice, third person. S2.5 reads as Jamie.

**Hard-rule lint, by eye on the renders.**

- Em and en dashes: none on the post, `/blog`, the popup, bar or banner. One em dash is visible in `inbound-kids-gaming-1440.png`, in the sign-off line directly above the new link paragraph. It predates this run and the file was open for the edit. ST-009.
- Negative parallelism: no stacked or opening reframes. The page has several "X, not Y" clauses ("how I run a season, not a promise about what comes out", "my design choice, not a finding of this study", "That's not the plan for your kid"). Each one is a disclaimer the register requires, spread across a long page. Within the frequency rule.
- Banned words, phrases, transitions: none in new strings. One frozen label, "True, and the half no one shared.", is a cousin of the banned "nobody" hook. ST-008.
- Engagement bait, meta commentary, title case: none. "Keep Reading" is a template label.
- Typography: body text renders straight apostrophes beside curly quotation marks (house convention through `&apos;`). It only shows as an inconsistency in the sons-friends post, where the host paragraphs are curly. ST-010.

**Page-level redundancy (2L), counted as one visitor reading top to bottom.**

| Hard fact | Visible placements | Count | Verdict |
|---|---|---|---|
| The number is not in the paper | hero note; "the number everyone was repeating isn't in it"; "the paper never converts to years"; "the number isn't the paper's" | 4 | At the line, justified. It is the thesis, each placement has a different job (hook, turn, reference, close) and a different wording. I would not add a fifth. |
| Where it came from (2024 press release) | Short answer; Dubious bullet | 2 | Fine. |
| 30 million | subhead; S1; Sources | 3 | Fine. Sources is reference and out of 2L's scope. |
| 923 adults | Short answer; True bullet | 2 | Fine. |
| Average age 55 | Short answer; "a study of 55-year-olds"; True bullet; Dubious bullet (the required anchor) | 4 | Fine. The fourth is row 3's anchor. |
| No one under 18 | Short answer; "About kids. Not in this study."; FAQ 2 | 3 | Fine. The FAQ restates by design. |
| "The kind of gaming probably matters as much as the hours" | blockquote; featured reply card; FAQ 1 | 3 | Over the line. The blockquote and the card sit one section apart and both repeat the like count and the author's "True". Frozen September structure. ST-007. |
| A thousand replies | subhead; H2; "about a thousand"; "a thousand strangers"; Sources | 5 | High, tolerable: hook, heading, method, payoff, reference. Noted in ST-007. |

One frozen inconsistency for the next refresh: the body says "Three camps" plus "a fourth, the skeptics", and the card block is titled "Four camps, in their own words" while its four cards are the top reply and the three camps. No skeptic is quoted. ST-007.

## D. Visual parity gate (AS-1, AS-4, AS-5)

**Recompression against the designer finals.**

| File | Whole-image PSNR | Dark background | Neon and lettering | Verdict |
|---|---|---|---|---|
| Hero (JPEG q78, 4:4:4) | 37.5 dB | Mean identical (17, 17, 19); largest difference 6 levels; the dot grid is intact; no banding | Lime, pink and note means within 0.2 levels; edge differences are confined to glyph outlines and invisible at 1:1 | PASS |
| Card (JPEG q80, 4:4:4) | 35.9 dB | Mean identical; largest difference 11 levels; no banding | Pink and note means within 0.5 levels; "not in the paper" identical at 1:1 | PASS |
| Graphic (8-bit palette PNG) | 50.6 dB | The palette is 27 colours against 1,211; the background went from 202 shades to 17. At 1:1 the dot grid still reads and there are no steps | Hand lettering edges clean on both the dark and the lime tiles; lime mean identical | PASS |

No haloing on the hand lettering, no colour shift in the stickies, in any of the three.

**The rendered hero frame (520px tall, object-cover, centred).**

| Width | What the frame shows | What is cropped | Result |
|---|---|---|---|
| 1440 (frame 1024 x 520) | The whole collage | About 9px top and bottom | **PASS** |
| 1024 (frame 876 x 520) | Everything; the lime sticky sits flush with the left edge | About 6% each side | **PASS** |
| 768 (frame 658 x 520) | Post, underline, note, Karlin, "HOW MANY HOURS?", "WHAT AGE?" | About 17% each side. "WHICH GAMES?" reads "CH / ES?" and "BETTER THAN SPORTS?" reads "BET / TH / SPO" | **PASS**, with ST-002. The claim and its mark survive; two stickies become debris. |
| 375 (frame 327 x 520) | The phone only: post, underline, and the note as the largest thing in frame | All four stickies; the right third of Karlin's face | **FAIL on sharpness; content survives.** ST-001. |

Why 375 fails: the image is drawn 990 CSS px wide to fill the 520px height, but `sizes="(max-width: 1264px) 100vw"` tells the browser the image is 375 wide, so it fetches the 750px candidate and stretches it about 2.6 times. `post-375-hero.png` and `post-375-stickybar.png` show it: the abstract text and the paper's author line are smeared and the face is soft, where the final at the same crop is crisp. I rebuilt both versions side by side to confirm the cause. On a 3x phone the same arithmetic applies (1200px candidate against 2970 needed). At 768 the stretch is about 1.3 times and I could not see it. The template has the same setting on every post; it shows here because this hero is made of small text. The post sentence, the underline and the note are still readable, so this is a parity failure and not a claims failure.

**Brush collision. PASS.** At 1440 the brush sits in the right margin, clear of the hero by more than 100px. At 1024 and 768 the lower tail of the brush runs in the gutter beside the hero's top-right corner and touches its edge without crossing it; it reads as ink tucked behind the picture. At 375 the brush ends above the hero. Separately, the brush passes behind the H1 at 1024, 768 and 375; that is the unchanged template (the same block is in 11 posts) and outside this run.

**Dark collage on the white template.** Acceptable. It is the only dark, graphic hero among warm photographs, and on the post page it reads as a deliberate poster. On `/blog`, whose header is black, it fits better than any other card.

**Graphic.**

- 1440: **PASS.** 560px wide, centred in the text column, every tile and the small grey row labels legible. Sits between the paragraph ending "Everything around it is different." and "In June a parent emailed me."
- 375: **PASS.** Full column width, same position, all text legible, clear of the sticky button.

**Keep Reading. PASS.** Three cards in the stated order (homeschool, Fortnite, sons-friends), on the grey torn-paper section, with the red label, 16:10 images, category, title and blurb of the reused pattern; one column at 375. The homeschool card now says "Case Studies" (decision D2).

**Blog featured card. PASS, with ST-002.** "Perspective · Featured", title, excerpt and date render. At 1440 the card image is cropped to roughly 512px wide, so the phone, the sentence, the underline and the note are whole and the four stickies are cut to fragments ("H S?", "BE T SP"). At 375 the crop shows the phone, the sentence and the note. The post also appears as the first card of the All Blogs grid with the full card image; I take that as the existing pattern.

**Card (`og:image`). PASS.** Dimensions 1200 x 630, recompression clean, legible at preview sizes (ruling 6).

**Byline. PASS.** "Updated October 12, 2026" renders in the left rail at 1440 and inline at 375. It is tomorrow's date on today's build; DT-1 already requires a recheck on merge day.

**Parity list.**

| Item | Result |
|---|---|
| hero@1440 | PASS |
| hero@1024 | PASS |
| hero@768 | PASS (ST-002) |
| hero@375 | FAIL on sharpness; post, underline and note survive (ST-001) |
| card | PASS |
| graphic@1440 | PASS |
| graphic@375 | PASS |
| keep reading | PASS |
| blog featured card | PASS (ST-002) |
| brush collision | PASS |

Two things the screenshots raise that are not parity items. The Instagram reel did not render in `post-1440-full.png`: there is about 330px of white between the essay paragraph and the caption. That is probably the test proxy, and it shows what a reader with a blocker gets (ST-014). And the full-page captures of the post are wider than their viewports (908, 1104 and 1232 CSS px at 375, 768 and 1024) while the `/blog` capture is not; nothing is painted in the extra width and the site clips horizontal overflow, so I expect no sideways scroll, but someone should confirm that on a phone (ST-015).

## E. Minors and consent (MC-1)

Confirmed from the three images. Hero and card: two people appear, Brandon Luu (adult, his public avatar and name as posted) and Karlin Oei (adult, in a headset, photo approved 2026-10-11). No child is pictured and no child is named. Graphic: no people and no names. MC-1 passes.

For Jamie, outside this run: the Season 01 popup shows an identifiable child on a couch, and the Season 01 footer banner shows two identifiable young people in school uniform. Both assets are already live across the site. The reel's transcript in this post's JSON-LD carries a minor's two gamer handles; the source comment records parent consent for the blog use (2026-09-15).

## F. The five inbound link sentences as rendered

| Post | Placement | Styling | Claims | Result |
|---|---|---|---|---|
| `what-your-kids-gaming-is-telling-you` | After the sign-off, as a postscript, last thing before the torn edge | Body paragraph, red link, matches the host | Clean (trace above) | PASS. The sign-off above it still carries an em dash (ST-009). |
| `league-of-legends-youth-development` | After the italic bio | Body paragraph, upright, so it separates from the italic bio | Clean | PASS. First person after a third-person bio reads slightly out of order; accepted in phase 2. |
| `should-you-ban-fortnite` | After the last item of the sources list | Body paragraph, same as the host | Clean; the only one with "the study was of adults" | PASS. It is clearly outside Muhammad Hossain's prose: it follows his sources, opens "Related:", uses no first person and names "EKUZO founder Karlin Oei". It is styled exactly like his paragraphs, as approved; muted or italic would mark it as an editor's line at a glance (ST-011). |
| `what-homeschool-parents-taught-us-about-gaming` | After "I wrote that one here.", above the italic bio | Matches the host | Clean; says "camps there too", not the same camps | PASS. Two pointer paragraphs in a row now close the piece; reads fine. |
| `when-your-sons-only-friends-are-online` | End of "The real question" section, before the next H2 | Matches the host except the apostrophe: the new paragraph has a straight one, the paragraphs above and below are curly | Clean | PASS, with ST-010. |

All five anchors render identically and in the link colour of their host.

## Defect list

| ID | Severity | Type | Owner | Defect | Smallest fix |
|---|---|---|---|---|---|
| ST-001 | major | visual | Atlas | Hero is visibly soft at phone widths: the 750px candidate is stretched about 2.6 times because `sizes` assumes the image is as wide as the viewport while the fixed 520px height makes it 990px wide | On this post's hero only, `sizes="(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px"`; rebuild; reshoot 375 and 768 |
| ST-002 | minor | accepted-risk | Fable | At 768 and on the `/blog` featured card at 1440 the centre crop cuts two stickies mid-word ("CH / ES?", "BET / TH / SPO") | None needed; the claim and its mark are whole. Put to Jamie as a look-and-accept |
| ST-003 | minor | accepted-risk | Fable | The S1 paragraph prints "about 13.7 years younger" with no provenance inside the paragraph (ruling 1) | No page change. Asset pack rule: never lift this paragraph alone; offer the Short answer paragraph for pull-quotes |
| ST-004 | minor | accepted-risk | Story | "30M+ people" appears on six surfaces (subhead, description, og and twitter, BlogPosting JSON-LD, `llms.txt`, `/blog` excerpt); the unit is views, and five of the six have no correction nearby (ruling 3) | None this run (Jamie's ruling, CP-19). At the first refresh: "seen 30M+ times" in `DESCRIPTION` and the excerpt |
| ST-005 | minor | strategic | Fable | Popup strikes out "too much" over an article whose guardrail says keep counting the hours; it opens before that paragraph is reached | Flag to Jamie. Options that are his: delay the popup on posts, or leave it |
| ST-006 | minor | strategic | Fable | The article describes sessions in the present tense; the only offer says Season 01 starts in 2027 | Jamie reads the two together once and confirms |
| ST-007 | minor | content | Story | The Brockie quote appears three times, twice a section apart with the like count and "True" repeated; "a thousand" five times; the card block is titled "Four camps" over three camps and the top reply | None this run (frozen). At the first refresh: drop the like count from the blockquote or the card, retitle the block "The replies, in their own words" |
| ST-008 | minor | content | Story | "True, and the half no one shared." sits in the banned "nobody" hook family | None this run (frozen). At the first refresh: "True, and the other half." |
| ST-009 | minor | content | Atlas | Em dash in the sign-off of `what-your-kids-gaming-is-telling-you`, directly above the new link paragraph (also in that post's caption and video schema name) | With Jamie's yes, remove the dash from the sign-off so it matches this post's "Karlin, founder of EKUZO" |
| ST-010 | minor | visual | Atlas | Straight apostrophe in the new paragraph of `when-your-sons-only-friends-are-online`, a post otherwise set with curly ones | Use `&rsquo;` in that one paragraph (settles Sentry S-002 for this file) |
| ST-011 | minor | visual | Fable | The Fortnite "Related:" line is styled exactly like the guest author's prose | Accepted as approved. Optional: muted italic; a courtesy note to Muhammad either way |
| ST-012 | minor | content | Fable | The register does not hold three things the post says: the camp shares (one in six, one in ten, one in twelve), the "about 120 questions", and row 14 says "one genre" where row 3 and the post say "one game" | Edit the register (knowledge base), not the page: add the shares and the 120 to row 16 with their source, make row 14 match row 3 |
| ST-013 | minor | content | Fable | `evidence/head-and-schema.txt` predates the recompression and records the old image byte sizes; `post-375-full.png` is unusable | Re-run the head and schema capture; reshoot the 375 full page |
| ST-014 | minor | visual | Atlas | The Instagram reel did not render in the 1440 full-page capture, leaving about 330px of white above its caption | Confirm it renders on the dev deploy; if a blocked embed leaves the gap, that is a follow-up for the embed component, not this ship |
| ST-015 | minor | visual | Atlas | Full-page captures of the post are wider than the viewport at 375, 768 and 1024; `/blog` is not | Confirm no sideways scroll in Jamie's phone check; find the wide element only if there is one |

## Gate table

| Gate | Verdict | Basis |
|---|---|---|
| CLAIMS | APPROVED WITH MINORS | Every sentence traced, none fails. Residuals on record: ST-003, ST-004, ST-012 |
| NEVER-SAY | APPROVED | A to L clean in body, FAQ, sources, alt text, images, metadata and the five link sentences |
| OFFER | APPROVED WITH MINORS | No claims conflict with the Season 01 asks. Two adjacency flags for Jamie: ST-005, ST-006 |
| VOICE | APPROVED WITH MINORS | New strings clean. Frozen items for the next refresh: ST-007, ST-008. One old em dash in a host post: ST-009 |
| VISUAL PARITY | NOT APPROVED | One item fails: hero@375 sharpness (ST-001), a one-attribute fix. Every other item passes. Approved once ST-001 is fixed and reshot, or once Jamie accepts it as is |
| MINORS | APPROVED | No minor named or pictured in the hero, card or graphic |

## Re-run after repair cycle 1

Steward, 2026-10-11 late. Build reviewed: `8cfe704` (the hero `sizes` attribute is now `(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px`, confirmed at line 307 of the post file). Review and rulings only. No app file was edited.

**What I read.** Sentry's cycle 1 results (rows for D-01, ST-001, ST-015, E1), the retaken `post-375-hero`, `post-768-hero`, `post-1024-hero`, `post-1440-hero`, `post-375-top`, `post-375-opening`, `post-1440-opening`, `blog-375-featured`, the designer's final hero, and the whole of `post-375-full.png` (now 750 x 34208, a true stitched capture) cut into 19 slices in the session scratch directory. For the sharpness ruling I cut the designer's final to the same crop the phone frame shows, scaled it to the same device pixels, and compared it with the capture at 2x magnification.

### Hero

| Width | Result | Reason |
|---|---|---|
| 375 | **PASS** | The browser now fetches the 2048px candidate for a 990 CSS px draw (1.03 device pixels per pixel at DPR 2). Against the final at the same crop the capture is the same picture: the doctor's sentence, the double underline and "not in the paper" are sharp, and so is the small text I called smeared last time (the paper's title, "Sydni G Paleczny", "PMID: 41134774", the DOI, and the abstract lines down to "cross-sectional global online study"). The only difference I can find at 2x is slight WebP smoothing in the dark background, invisible at reading size. Crop unchanged: phone, post, underline, note, and two thirds of Karlin's face; the four stickies are out of frame, as before and as accepted. |
| 768 | **PASS** (ST-002 stands) | Same 2048px candidate, 1.03 at DPR 2. Crisp. The crop is unchanged, so "WHICH GAMES?" still reads "CH / ES?" and "BETTER THAN SPORTS?" still reads "BET / TH / SPO". That is the look-and-accept already put to Jamie, not a new finding. |
| 1024 | **PASS** | Whole collage, lime sticky flush left, all text sharp. No change from the first review. |
| 1440 | **PASS** | Whole collage, 1.87 device pixels per pixel at DPR 1 and 1.17 at DPR 2. No change. |

**Is the small text crisp at 375 now?** Yes. The post sentence and the note were readable before and are now sharp; the abstract and the author line, which were the failing part, now read cleanly down to the 9px lines. ST-001 is closed.

**DPR 3 residual. ACCEPT.** On a 3x phone the frame wants 2972 device px and the source is 2400, so the picture is drawn at 0.81 device pixels per pixel. That is a 1.24 times stretch against the 2.6 times that failed, and it falls on a screen whose pixels are too small to show it at arm's length. Everything a reader must be able to read (the sentence, the underline, the note) is large lettering that survives far worse than that. I am not asking for a larger file. Two conditions on the acceptance: nobody should upscale the 2400px file to "fix" this, because that adds bytes and no detail; and if the designer already has a 3000px or wider master, drop it in at the next asset refresh, no urgency. Jamie's real-phone look (item 8 on Sentry's deferred list) is the last check and I expect it to pass.

### The first paragraph

**PASS.** `post-1440-opening.png` and `post-375-opening.png` both render "**Short answer:** one study of 923 adults" with the space. Sentry's DOM read agrees (exactly one space at both widths). The paragraph itself is unchanged and was already traced to rows 1, 6, 7, 3 and 14.

### The second half of the article at phone width (not seen before)

Read top to bottom from the stitched capture: from "The reply that mattered" to the footer wordmark.

| Block | Layout at 375 | Claims and voice |
|---|---|---|
| Blockquote (Brockie) | Red rule, italic, wraps cleanly in four lines | As traced. ST-007 stands (third of three placements) |
| "What a thousand replies said" and the three camp paragraphs | Clean; bold lead-ins wrap without orphans | As traced. Row 16 |
| "Four camps, in their own words" card block | One column, four cards, handle, pill, quote, "Reply on X", like count. The pill drops under the handle on three cards and sits beside it on the short-handle cards; tidy either way. Footnote legible | As traced. ST-007 covers the title |
| "The parents in the thread" card block (@TheAccounthnk, @bewatchful) | One column, two cards, clean | Quotes attributed and shown as strangers' words. See ST-017 on the "A parent" pill |
| "Both correct ... how I run a season, not a promise about what comes out" | Clean | Row 17 with its disclaimer. As traced |
| Graphic | Full column width, every tile and the grey row labels legible, footer line and wordmark legible | Ruling 7 stands. graphic@375 PASS confirmed in context |
| Essay paragraph, reel, caption | About 430 CSS px of white where the reel should be, then the centred caption | The gap is the QA proxy blocking Instagram. ST-014 stands and is larger on a phone than at 1440; a reader with a blocker sees a full screen of nothing between two paragraphs |
| "What the study found, and what it didn't" checklist (six bullets) | Bullets hang correctly, links wrap inside the column, nothing clipped at the right edge | As traced, bullet by bullet. The anchor ages (55, 70, 40) all sit in one bullet on screen |
| "Where I stop" and the closing paragraphs | Clean | Row 19 paragraph present and whole. The three onward links read as his |
| Common questions (five) | Sentence-case H3s wrap in two lines at most; answers clean | As traced. "That's my design choice, not a finding of this study." and "Neither is a recommendation." both on screen |
| Sources | Long DOIs wrap without breaking the column; the view-count sentences are intact | Ruling 4 stands |
| Sign-off | "Karlin, founder of EKUZO", right-aligned, no dash | Clean |
| Keep Reading | Torn edge, red label, three cards in one column in the stated order, category, title, blurb | "Case Studies" on the homeschool card (D2). Clean |
| Footer banner | "Season 01 starts in 2027. Get them on the list." with "Join Season 01" | As ruled under Offer. ST-006 stands. The two young people in uniform are the existing sitewide asset noted under E |
| Footer | Socials, newsletter field, link columns, copyright, wordmark; no loop, no sideways spill | Clean |

Hard-rule lint on the phone render: no em or en dashes anywhere in the second half, no banned transitions, no title case outside the template labels. Nothing in the second half fails claims, never-say, voice or layout.

### `/blog` featured card at 375

Content PASS: the phone, the doctor's sentence, the underline and the note are whole, then "Perspective · Featured", title, excerpt, date and byline. Two notes. The red "Join Season 01" band across the middle of `blog-375-featured.png` is the fixed bar caught by an element capture, not something on the page. And the card image is visibly softer than the post hero beside it: the sentence and the note read, the paper title is fuzzy and the abstract is mush. Same mechanism as ST-001 in a different file. Logged as ST-016, minor.

### New defects

| ID | Severity | Type | Owner | Defect | Smallest fix |
|---|---|---|---|---|---|
| ST-016 | minor | visual | Atlas | `/blog` featured card image is soft at phone width: the `Image` in `app/blog/page.tsx` (line 182) has no `sizes`, so a phone fetches the 750px candidate for an image drawn about 762 CSS px wide in the 400px tall frame (about 0.49 device pixels per pixel at DPR 2). The sentence and the note stay readable, so this does not hold the gate | Add `sizes="(max-width: 1023px) 768px, 50vw"` to that one `Image`. It is the shared index template, so it is a follow-up with Aaron's nod, not part of this ship. The 1200px card file caps it at about 0.79 on a 2x phone either way |
| ST-017 | minor | content | Story | The pill "A parent" on @TheAccounthnk and @bewatchful is our label. Neither quoted line says its author is a parent ("your kid", "Parents still set the limits") | Confirm in the reply corpus that each self-identifies as a parent. If not, change the pill to "From the thread" at the first refresh. Frozen September block, no change this run |

### Defect status after cycle 1

| ID | Status |
|---|---|
| ST-001 | **Closed.** Fixed and verified at 375 and 768. DPR 3 residual accepted |
| ST-010 | Closed (curly apostrophe served, Sentry row 6) |
| ST-013 | Closed (head and schema capture regenerated; 375 full page now usable and read) |
| ST-015 | Closed, not a defect (no sideways scroll; capture artifact) |
| ST-002, ST-003, ST-004, ST-005, ST-006, ST-007, ST-008, ST-009, ST-011, ST-012, ST-014 | Unchanged |
| ST-016, ST-017 | New, minor, neither blocks |

### Gate table (updated)

| Gate | Verdict | Basis |
|---|---|---|
| CLAIMS | APPROVED WITH MINORS | No sentence fails, now including the phone-width second half. Residuals: ST-003, ST-004, ST-012, and ST-017 (the "A parent" label) |
| NEVER-SAY | APPROVED | A to L clean on every surface, second half at 375 included |
| OFFER | APPROVED WITH MINORS | Unchanged. Adjacency flags for Jamie: ST-005, ST-006 |
| VOICE | APPROVED WITH MINORS | "Short answer: one study" now renders with its space. Frozen items ST-007, ST-008; old em dash in a host post ST-009 |
| VISUAL PARITY | APPROVED WITH MINORS | hero@375, 768, 1024 and 1440 all PASS; ST-001 closed. Minors: ST-002 (sticky crop at 768 and on the featured card), ST-014 (blank reel gap, proxy), ST-016 (soft featured card on `/blog` at phone width), DPR 3 at 0.81 accepted pending Jamie's real-phone look |
| MINORS | APPROVED | No minor named or pictured in the hero, card or graphic. Unchanged |
