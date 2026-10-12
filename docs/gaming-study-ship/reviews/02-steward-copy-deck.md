# Steward review: copy deck S1 to S4 (phase 2, before Jamie)

Steward, 2026-10-11. Review only. The deck (`02a-copy-deck.md`) and every page source are untouched. Where a line fails I say why and give the smallest fix as a suggestion Jamie can accept or decline.

**Loaded, in order:** `anti-ai-writing.md`, `voice-dna.md`, `ekuzo-messaging-voice.md`, `claims-register-gaming-cognition.md` (rows 1 to 19, never-say A to L, "Numbers that expire"), the brief (`2026-10-12-gaming-study-post-build-loop.md`, decisions and "Copy beyond C1 to C10"), the built post `page.tsx`, the deck, and the paragraphs around each insertion point in the five source posts. For S2.5 I also checked the metrics in `jamie-writing-voice.md`. I opened the hero file (`public/images/gaming-study-13-7-hero.jpg`) to check S3 against the picture.

## Headline findings

1. **S1 recommended is claims-clean but leaves the body without the claim itself.** With the quoted sentence gone, no body paragraph says what "13.7 years younger" asserted (who was compared with whom). Only the hero image carries it. One merged version fixes that and also fixes the alternate's bare figure. Fix below.
2. **S4 removes the evidence S1 leans on.** S1 says "passed 30 million views in its first week". The only read that proves "first week" is the September 15 one, and both S4 versions delete it from the Sources line. Keep one clause. Fix below.
3. **Story's report of errors in the existing link sentences is confirmed** (two hard errors of fact in the League post, one false claim in the homeschool post, one misleading clause in the Fortnite post, a bare figure in two). One of Story's points is a preference and not an error ("a thousand" versus "about a thousand"). Detail in its own section.
4. **Link choice:** I agree with Story. Put the original post only to Jamie as the default, with one yes or no option for a second link. Reasoning below.
5. **Lint:** zero em dashes, en dashes, arrows, banned words, banned phrases or banned transitions in any recommended or alternate string. I ran the search on the deck file and read each string.

## Claims trace

Register rows are from `claims-register-gaming-cognition.md`.

### S1

| Sentence | Row(s) | Result | Note |
|---|---|---|---|
| "That press-release line reached me the way it probably reached you, through a recent post on X." | 3, B | PASS | The line is named by its origin and no figure is printed. "Probably" is right for a page people will reach months later. |
| "A physician with a big following shared the study's abstract with the one sentence on top." | Sources line, hero image | PASS | Matches the image: one sentence above the embedded abstract. Unnamed in prose, named in Sources, as built. |
| "Counting the posts that quoted it, it passed 30 million views in its first week." | Numbers that expire | PASS, with a dependency | True as worded. Evidence: more than 30M across the original and its quote-posts by the September 15 read, two days after the September 13 post. "First week" is conservative and cannot become false. "Counting the posts that quoted it" is the honest qualifier: the original alone was at 15.6M then and 17.2M now. "Views" is the right unit. The dependency is finding 2 above: the page must keep a dated line that supports it. |
| "For three days my feed argued about whether video games make you smart." | A | PASS | Reports what the feed argued. Unchanged from the built text. |
| Alternate: "...one sentence: frequent gamers performed on cognitive tests like non-gamers about 13.7 years younger." | 3, B | PASS at page level, FAIL at paragraph level | It reports the post's sentence, with the press-release origin one paragraph up and "isn't in it" one paragraph down. The paragraph itself carries no provenance, and paragraphs get lifted alone (pull-quotes in the asset pack, AI answer extraction). Register row 3: never the number alone. |
| Alternate: "I saw a recent post on X the same day you probably did." | none | PASS on claims, fails on sense | "A recent post" (indefinite) cannot be the thing the reader saw "the same day". For a reader arriving later it is untrue. |

**(a) Is the 30 million sentence true as worded?** Yes, including "Counting the posts that quoted it". Two small notes. The sentence has two "it"s with different jobs; readers will resolve it, so I leave it. The page will say "people" in the subhead and "views" here. Jamie accepted "people" for the subhead; S1 using the accurate unit is correct and I would not harmonize downward.

**(b) Does the recommended version still do its job?**

- 13.7 never stands alone: PASS (no figure printed).
- Jamie's direction: "in September" dropped, "a recent post", a number for scale, the original linked. All four met.
- Does the reader still learn what the post said? Not fully. C3 gives "The '13.7 years younger' line came from a 2024 press release", S1 says "the one sentence", and C3b says "the number everyone was repeating". None of the three says the sentence was that gamers scored like non-gamers 13.7 years younger. A reader who never saw the post has to get that from the hero image. On a page whose search job is the exact phrase, the claim should be stated once in body text.
- Voice: the built opener ("I saw the post the same day you did.") is nine words, first person, active. The recommended opener makes the line the subject and Karlin the object. It is acceptable and it earns its keep by carrying the provenance, but it is the least Karlin sentence in the deck.

**Suggested fix (S1, merges the two versions; accept or decline):**

> That press-release line reached me the way it probably reached you, through [a recent post on X](https://x.com/BrandonLuuMD/status/2099226796893798645). A physician with a big following shared the study’s abstract with one sentence on top: frequent gamers performed on cognitive tests like non-gamers about 13.7 years younger. Counting the posts that quoted it, it passed 30 million views in its first week. For three days my feed argued about whether video games make you smart.

What changes against the recommended: "the one sentence on top." becomes "one sentence on top:" followed by Karlin's already approved sentence. The figure now sits in a paragraph that names it a press-release line in its first four words, so row 3 and B hold at paragraph level, and C3b still lands its own beat (the paper does not contain it). The figure then appears in C3 and S1 and is referred to in C3b; that is two printed placements in the opening, which voice-dna 2L allows.

**The link.** Jamie asked for the option of a Musk quote-post. My read:

- Never-say H forbids "Elon says" and borrowing that account's authority. It is silent on links. Story's line that H "allows a link" overstates the register; the permission comes from Jamie's brief, and he owns the rule.
- A second link does not prove the number. The claim is 30 million across the wave. The original shows 17.2M; one quote-post shows 5.8M or 7.9M. No single click shows 30 million. The Sources line does that arithmetic. So the second link buys little proof.
- What it costs: the click lands a parent on that account's name in the first narrative paragraph, which is the authority doing the work whatever the anchor says.
- "Play video games or be dumb!" is a never-say A claim at the click target. That one should not be linked from this page under any wording.
- "Gaming ftw" makes no claim. If Jamie wants a second link, Story's placement is right: on "the posts that quoted it", name kept out of the sentence.

**What I would put to Jamie:** original post only (recommended). Option: add `https://x.com/elonmusk/status/2099459125579071512` on "the posts that quoted it", yes or no. Do not offer the second quote-post.

### S2

| Item | Sentence | Row(s) | Result | Note |
|---|---|---|---|---|
| S2.1 rec | "If the viral '13.7 years younger' gaming study is why you're here, that number isn't in the paper." | 3, B | PASS | The correction is in the same sentence as the anchor. |
| S2.1 rec | "I read about a thousand of the replies and wrote up what it means for a twelve-year-old." | 16, 7 | PASS | No finding stated. Echoes the post's own title. |
| S2.1 alt | "Parents asked this same question, unprompted, in the replies to [anchor], a number that isn't in the paper." | 17, 3 | FAIL on wording | The appositive "a number" attaches to "study". Also "this same question" does not match the section, which asks why logging off is a fight, while the parents asked how to do it without the attitude. |
| S2.2 rec | "...the most-liked reply under the original post was 'The kind of gaming probably matters as much as the hours,' which is this whole page in eleven words." | 15, 13 | PASS | Placed on the original post, past tense, no like count. Eleven words: counted. The handle is not named; the register's own sentence for row 15 does not name it either, and the link leads to the full attribution. |
| S2.2 rec | "The 13.7 isn't in the paper. I wrote up what is, and what it means for your kid." | 3, B, 7 | PASS | Correction is the next sentence after the anchor. |
| S2.2 alt | "The most-liked reply to the post behind [the study]..." | 15 | PASS on claims | "The post behind the study" has it backwards; the study is behind the post. |
| S2.3 rec | "...(the number isn't in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude." | 3, B, 7, 17 | PASS | Row 17's wording, nearly verbatim. Nothing about what gaming does. A and L clean. |
| S2.3 rec | "EKUZO founder Karlin Oei read about a thousand of those replies." | 16 | PASS, one ambiguity | "Those replies" can be read as a thousand replies from parents. Row 16: only a few dozen were parents. |
| S2.3 alt | "...what it found in adults, why that number isn't in the paper, and what parents asked in the replies." | 3, 7, 17 | PASS | "Why" is slightly off; the post says where the number came from. |
| S2.4 rec | "I ran the same read on about a thousand replies to [the study]." | 16 | PASS | Story faulted the existing text for "replies to a study" and repeats the shorthand here. Colloquial, and I let it stand. |
| S2.4 rec | "That number isn't in the paper, and the replies sorted into camps there too." | 3, B | PASS | True: the study post has three camps plus the skeptics. Does not claim the same camps. |
| S2.5 rec | "The same idea surfaced when [anchor] made the rounds (the number isn't in the paper; Karlin, our founder, read about a thousand of the replies): the most-liked reply under the original post was '...'" | 3, B, 15, 16, 13, F | PASS | The reply is quoted as a stranger's line, credited to its place. The read is credited to Karlin, so Jamie claims nothing he did not do. Not presented as a finding. |
| S2.5 alt | "That number isn't in the paper, and Karlin, our founder, wrote up what is." | 3, B | PASS | |

**(c) The anchor text.** "the viral '13.7 years younger' gaming study" names the study by a number that is not in it. I pass it for three reasons: the figure is in quotation marks as the label the public gave it; the target page's own approved SEO title does the same; and in all five items the correction sits in the same sentence or the next one. None of the S2 sentences makes a claim about kids or brains. A, C, D, K and L are clean throughout.

**(d) S2.3 form.** Right. It sits after the sources list, starts "Related:", has no first person, and refers to Karlin by name and title. It does not put a sentence in Muhammad Hossain's mouth. Two things for Jamie: the recommended note never says the link is Karlin's write-up, so the second sentence ends without a destination; and a courtesy note to Muhammad that an editor's line now sits at the foot of his post costs nothing. I support Story's styling suggestion (muted italic) so the line reads as house furniture.

**(e) S2.5 as Jamie.** On mechanics it is his: `jamie-writing-voice.md` lists parenthetical asides and semicolons as signatures. On load it is not: one sentence of about 47 words (his median is 17) doing four jobs, with a semicolon inside a parenthesis followed at once by a colon. The surrounding post is plain short sentences and direct questions. Changing the colon to a period fixes it. "Karlin, our founder" is true and reads naturally under Jamie's byline; first mention of Karlin in that post is Jamie's call, and I see no problem with it. Note the new paragraph follows a section-closing line ("The answers tell you whether to worry, and what to do about it."); it does not undercut it, since it hands the same point to a stranger.

### S3

Checked against the image. Present in the picture: the post header "Brandon Luu, MD" (with a comma), the sentence as quoted with "~13.7 years younger" underlined, a taped note "not in the paper" directly under the underlined figure and across the title block of the embedded paper, four stickies (WHICH GAMES? HOW MANY HOURS? WHAT AGE? BETTER THAN SPORTS?), Karlin in a headset at lower right.

| String | Row(s) | Result | Note |
|---|---|---|---|
| Recommended (303 characters) | B, 3 | PASS on claims, two accuracy gaps | It says the tape reads "not in the paper" but not that the note marks the figure. The brief asks the alt to say that the figure is marked. The underline, which is what ties the two together, is missing. Sticky order matches reading order. 303 characters is long for an alt. |
| Alternate (198 characters) | B, 3 | PASS on claims, same gap | Lists three of four stickies. Shorter, and it does not put the full bare sentence into an indexed attribute. |

**(f) Names.** Naming Brandon Luu is appropriate: the name is legible in the image and already in the Sources line. It is not required; "the X post" is also an honest description. If named, match the image and write "Brandon Luu, MD". Naming Karlin Oei is appropriate; he is the author and approved the photo.

**Suggested fix (S3, on the alternate, 247 characters):**

> A phone showing the X post that says gamers test “~13.7 years younger.” The number is underlined, and a taped note under it reads “not in the paper.” Sticky notes ask which games, how many hours, what age, better than sports. Karlin Oei in a headset.

If Jamie prefers the long version, the same one-sentence change applies: replace "Tape across the study abstract below reads “not in the paper.”" with "The number is underlined, and a taped note under it reads “not in the paper.”" and write "Brandon Luu, MD’s".

### S4

| String | Result | Note |
|---|---|---|
| Recommended: "View counts: original post 17.2M as read October 11, 2026; the two largest quote-posts 5.8M and 7.9M, and about 33M across eight posts, as read October 6, 2026." | PASS on truth | Every figure sits beside the date it was read. October 11: Jamie's screenshot, 17.2M. October 6: 5.8M, 7.9M, and 17.2 + 5.8 + 7.9 + 2.3 = 33.2, eight posts. No combined figure printed. H clean: quote-posts counted, author unnamed. |
| Alternate (ship-day template) and the slot rules | PASS | The rules are sound, including rounding any figure that reads 13.7M and keeping the total on its own date if the five smaller posts are not re-read. |
| C7 as approved | PASS on truth | Every figure in it is an October 6 read. It is the simplest true sentence if no ship-day read happens. |

**(g)** Dates and counts are true as worded. No combined 13.7M. A reader with a calculator can add 5.8 and 7.9; that is a coincidence in the data and Story's rule against printing the sum is the right handling.

**The gap:** none of the three versions keeps the September 15 read. S1's "in its first week" then has no dated support anywhere on the page, while the reply cards and the blockquote still cite September 14 and 15.

**Suggested fix (S4, one clause added to the recommended):**

> View counts: more than 30M across the original post and its quote-posts by September 15, 2026. Original post 17.2M as read October 11, 2026; the two largest quote-posts 5.8M and 7.9M, and about 33M across eight posts, as read October 6, 2026.

The same first sentence goes in front of the ship-day alternate or C7, whichever Jamie picks.

## The existing link sentences: Story's error report, checked

I read each existing sentence in the source file on the branch.

| Post | Story's claim | My finding |
|---|---|---|
| `league-of-legends-youth-development`, lines 732 to 742 | "A September 2026 study" is wrong; the paper is 2025 | **Confirmed.** Paleczny et al. is PLOS ONE 2025. The post about it was September 13, 2026. |
| same | "got shared thirty million times" is wrong | **Confirmed.** Thirty million is views across the original and its quote-posts. The original had 3.2K reposts. |
| same | The 13.7 has no provenance | **Confirmed.** |
| same | Reply should be placed on the original post and take its capital T | Placement: confirmed as an improvement (row 15). The lower-case t is ordinary mid-sentence quoting, not an error. |
| `what-homeschool-parents-taught-us-about-gaming`, lines 406 to 413 | "the same three camps" is false | **Confirmed.** That post's camps are Cut it off, Set limits, Aim it. The study post's are the vindicated, the permission seekers and the "which games" crowd, plus the skeptics. |
| same | Replies were to a post, not a study | Confirmed as loose wording, not an error of fact. Story's own replacement uses the same shorthand. |
| same | Anchor is a three-beat list with no entity | **Confirmed.** |
| `should-you-ban-fortnite`, lines 711 to 719 | "a viral study told parents gaming might be good for the brain" is wrong | **Confirmed.** The study was of adults and addressed no one (row 7). In a parents' post the clause reads as a claim about children and leans on never-say A and L. |
| same | "the question parents actually asked" overstates | **Confirmed.** Row 16: only a few dozen replies were parents. Row 17's wording is "asked, unprompted". |
| `what-your-kids-gaming-is-telling-you`, lines 667 to 675 | The figure is quoted as the study's line with no correction | **Confirmed** (never-say B). The quotation marks also present "gamers test 13.7 years younger" as a quote, and it is nobody's wording. |
| same and others | "a thousand" should be "about a thousand" | **Not an error.** The corpus is 1,057 replies and the built post's approved subhead and H2 both say "a thousand". "About" matches row 16 and is harmless; treat it as a preference. |
| `what-your-kids-gaming-is-telling-you` | Em dash in the sign-off and the Instagram caption | **Confirmed**: line 666 (sign-off), line 616 (caption), and also line 230 (the video schema name). Pre-existing and outside these items. Since the builder will have the file open at line 667, Jamie may want the line 666 dash removed in the same edit. |
| `league-of-legends-youth-development` | "running all summer" | **Confirmed**, line 626. Outside these items. |
| Gaming-study post `DESCRIPTION` | "reached 30M+ people" | **Confirmed**, line 45. Rides on Jamie's acceptance of the subhead. |

## Voice

**Karlin's register (S1, S2.1, S2.2, S2.4).**

- S2.1 recommended: his. A conditional that answers itself, then one plain sentence.
- S2.2 recommended: his, and it keeps "this whole page in eleven words". "I wrote up what is" is the driest line in the deck and the best.
- S2.4 recommended: close. The last sentence welds the correction onto an unrelated point with "and", which makes the correction read as an insert. Two sentences are drier. The move above the bio is right: the post already ends on a first-person pointer and the bio should close the page.
- S1: covered above. The merged fix keeps his approved sentence.
- S2.2 placement after the bio while S2.4 moves above it is inconsistent on its face. Story's reason holds (the paragraph above the League bio is an FAQ answer), so I accept both.

**Hard-rule lint.** Em dashes 0, en dashes 0, arrows 0. Banned words, phrases and transitions 0. Negative parallelism: none; "that number isn't in the paper" is a statement of fact with no paired reframe. It appears five times across five different pages, once each, which is density per page of one.

**Suggested fixes (voice):**

S2.3, second sentence. Close the loop and remove the ambiguity:

> Related: when [the viral “13.7 years younger” gaming study](/blog/…) went around (the number isn’t in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up.

S2.4, split the last sentence:

> This piece has a sibling. I ran the same read on about a thousand replies to [the viral “13.7 years younger” gaming study](/blog/…). That number isn’t in the paper. The replies sorted into camps there too.

S2.5, colon to period:

> The same idea surfaced when [the viral “13.7 years younger” gaming study](/blog/…) made the rounds (the number isn’t in the paper; Karlin, our founder, read about a thousand of the replies). The most-liked reply under the original post was “The kind of gaming probably matters as much as the hours.”

S2.5 alternate, if Jamie prefers it ("said it shorter" is a good hinge to the paragraph above), split the last sentence the same way:

> The most-liked reply under the post that spread [the viral “13.7 years younger” gaming study](/blog/…) said it shorter: “The kind of gaming probably matters as much as the hours.” That number isn’t in the paper. Karlin, our founder, wrote up what is.

**Page-level redundancy (voice-dna 2L), opening of the study post.**

- Press-release origin: C3 states it; S1 points back to it in three words; C3b states a different fact (not in the paper). Later the "Dubious" bullet and the closing paragraph return to it. That is the page's thesis and the register requires the origin wherever the figure appears. Justified.
- The figure itself: C3 and, with my S1 fix, S1. Two in the opening.
- Study size, age and limits: C3 only. S1 and C3b do not restate them. Good.
- Thirty million: subhead ("people"), S1 ("views", "first week"), Sources. Three visible placements with three different jobs (hook, narrative, reference), and Jamie directed the number into S1. Justified. S1 does not repeat the subhead word for word.
- "Three days": S1 and the closing paragraph. The close pays off the opening. Fine.

## "Recent post" on an evergreen page

It will date, and the page makes it worse than usual: the byline shows "Updated" with `DATE_MODIFIED`, so the first refresh will put "a recent post" next to a newer date about a post from September 13, 2026.

What I would tell Jamie: keep "recent" at ship, as he asked. It is true on October 12 and for some weeks after. Decide the removal trigger now so it does not rely on memory: delete the one word at the featured-slot revert (ship plus 7 days, already a logged WORKLOG checkpoint), or at the latest on the first `DATE_MODIFIED` bump or the first quarterly claims check. The sentence survives the deletion unchanged ("through a post on X"), and the Sources line carries the actual date. If he would sooner not carry a follow-up, ship "a post on X" now; the number and the link do the work "recent" was doing.

## Per-item verdicts

| Item | Verdict | One line |
|---|---|---|
| S1 recommended | APPROVE WITH THE SUGGESTED FIX | Restore the quoted sentence after "one sentence on top:". |
| S1 alternate | SEND BACK | Bare figure at paragraph level; "a recent post ... the same day you probably did" does not hold. Superseded by the fix above. |
| S1 link | APPROVE AS IS | Original only. Offer "Gaming ftw" on "the posts that quoted it" as a yes or no. Never the second quote-post. |
| S2.1 recommended | APPROVE AS IS | |
| S2.1 alternate | SEND BACK | Dangling appositive; "this same question" does not match the section. |
| S2.2 recommended | APPROVE AS IS | |
| S2.2 alternate | SEND BACK | "The post behind the study" is inverted; the recommended is better in every respect. |
| S2.3 recommended | APPROVE WITH THE SUGGESTED FIX | "...read about a thousand of the replies and wrote it up." |
| S2.3 alternate | APPROVE AS IS | Acceptable fallback; loses the hook that makes it relevant to this post. |
| S2.4 recommended (moved above the bio) | APPROVE WITH THE SUGGESTED FIX | Split the last sentence in two. |
| S2.4 alternate (same text, after the bio) | APPROVE WITH THE SUGGESTED FIX | Same split; the placement is the weaker one. |
| S2.5 recommended | APPROVE WITH THE SUGGESTED FIX | Colon after the parenthesis becomes a period. |
| S2.5 alternate | APPROVE WITH THE SUGGESTED FIX | Split the last sentence in two. |
| S3 recommended | APPROVE WITH THE SUGGESTED FIX | Say the number is underlined and the note sits under it; "Brandon Luu, MD". |
| S3 alternate | APPROVE WITH THE SUGGESTED FIX | Same tie, add the fourth sticky. This is the one I would put first. |
| S4 recommended | APPROVE WITH THE SUGGESTED FIX | Add the September 15 sentence that supports "first week". |
| S4 alternate (ship-day template) | APPROVE WITH THE SUGGESTED FIX | Same added sentence; slot rules approved as written. |
