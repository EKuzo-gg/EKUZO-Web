# Steward check: copies 5 to 8, the light updates

Run 2026-10-12. Drafts: `docs/blog-refresh-2026-10/copy/05-what-your-kids.md`, `06-k1ng.md`,
`07-conquering.md`, `08-when-your-sons.md`. Rules read: `anti-ai-writing.md` (hard rules),
`ekuzo-messaging-voice.md` § Author integrity and § Language We Avoid, `ekuzo-faq-canon.md`,
`03-decision-log.md`. Not reopened, as instructed: the shared program line wording, "Updated [date]"
bylines, John Hay's departure, "the name his players know him by", pre-existing marketing claims.

Line numbers are the live `page.tsx` of the post in that section unless another file is named.
"[em dash]" stands for the character, which this file does not print.

## Verdicts

| Draft | Verdict | Fixes |
|---|---|---|
| 05 what your kid's gaming is telling you | Approve with fixes | 3 |
| 06 Lisa Holt | Approve | 0 (1 note) |
| 07 John Hay | Approve | 0 (2 notes) |
| 08 when your son's only friends are online | Approve | 0 (1 note) |

No "Proposed" cell in any of the four drafts contains an em dash, a hard-banned word (§3A), a banned
phrase (§3C), a banned transition (§3D) or a negative-parallelism reframe. Every factual claim in a
"Proposed" cell is supported.

One thing that applies to all four: the date rows quote "Published [date]" as the current state.
In this worktree the byline already renders "Updated [date]" for every post
(`components/blog/AuthorByline.tsx:52-55, 95`, uncommitted). The "Now" cells describe production.
UNVERIFIED: I did not load ekuzo.gg to confirm what production shows.

---

## 05: what your kid's gaming is telling you

### Check 1: "Now" cells against the live page

| # | Line | Result |
|---|---|---|
| 1 | 636-646 | Accurate, word for word |
| 2 | 666 | Accurate |
| 3 | 668-674 | Accurate, link is on "the viral "13.7 years younger" gaming study" (669-671) |
| 4 | 564-566 | Accurate, no link today |
| 5 | 28-29 | Date values accurate. See the note above on "Published" |

### Check 2: "Proposed" cells

- **Change 1, the advice line.** No problem as advice under Karlin's byline. It claims no credential
  and names no product. "Give it a month" sits next to "See the current programs", and that is
  honest: the canon lists a four-week program (`ekuzo-faq-canon.md:44, 48`). The lead-in that stays
  (630-633, "without betting a season on it") still reads correctly in front of it. Ages 10 to 17
  matches canon (`ekuzo-faq-canon.md:21, 71`).
- **Change 3. FIX (description only).** The "Why" cell says "Same words; the link moves to a
  different phrase." The words are not the same. Live: "wrote up what it means for a
  twelve-year-old." Proposed: "wrote up [what the study found and what it means for a
  twelve-year-old]". Four words are added ("the study found and what"). The added claim is
  supported: the destination has an H2 "What the study found, and what it didn't"
  (`app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx:511`) and its title
  carries "what it means for your twelve-year-old" (line 37). Jamie approved the proposed text
  itself, so nothing needs to change on the page; the row should say words were added.
- **Change 4.** `/methodology` exists (`app/methodology/page.tsx`, canonical `/methodology` at line
  20). The anchor is fair but loose. The page is "Pedagogy of gaming" and "The ten pillars of EKUZO
  pedagogy" (130-135, 354), with pillars for Coaching and Social Learning (66-67). It never uses the
  word "container" and does not describe a team, a weekly rhythm or a culture in those terms. A
  reader who clicks lands on learning-science pillars. Not a rule break. Note for the owner only.
- **Change 5. FIX.** Proposed: "Published May 24, 2026 · Updated [ship date]". This contradicts the
  later owner decision (`03-decision-log.md:15-16`): the page shows only "Updated [date]" and the
  publish date leaves the page. Drafts 06, 07 and 08 already say "Updated [ship date]" only. The
  built component also shows one line (`components/blog/AuthorByline.tsx:95`). The row is stale.

### Check 3: author integrity

Nothing. Karlin's story (590-612) is untouched. The new advice line makes no claim about him.

### Check 4: em dashes the draft did not catch

- **FIX. Line 616, visible caption:** `caption="DAY 4 of Karlin's founder series [em dash] on what
  gaming gave him, and what was missing."` Rendered under the Instagram embed.
- **FIX. Line 230, VideoObject schema name:** `name: "DAY 4 [em dash] Karlin on why he started
  EKUZO"`. Not visible on the page; it ships in the JSON-LD.
- Lines 20 and 173 are code comments. Not published.
- Line 666 is caught by change 2.

---

## 06: Lisa Holt's post

### Check 1: "Now" cells against the live page

| # | Line | Result |
|---|---|---|
| 1 | n/a | New line, nothing to compare |
| 2 | 249-255 | Accurate |
| 3 | 25, template at `app/layout.tsx:75` | Accurate, the brand is stamped twice today |
| 4 | 18 | Accurate |
| 5 | 121 | Accurate |
| 6 | 20-21; sitemap `app/sitemap.ts:113-114` | Accurate, sitemap says 2026-07-28 |

### Check 2: "Proposed" cells

- **Change 1.** Karlin's author page is at `/blog/author/karlin-oei` (`app/blog/author/karlin-oei/page.tsx`;
  `lib/authors.ts:90, 113` has `hasPage: true`). "EKUZO's founder" matches Lisa's own "the founder
  of EKUZO, Faith" (222) and `lib/schema.ts:33-34` (`alternateName: "Faith"`, `jobTitle: "Founder"`).
  Placement is outside Lisa's paragraph: it goes after her paragraph ends at 229, as its own italic
  line, before her next paragraph at 230.
- **Change 1, note.** Lisa first names Faith six paragraphs earlier: "I remember his coach, Faith,
  would send us emails" (178-179). The note lands after the reader has met the name. Not a rule
  break; placement is the owner's call.
- **Change 4.** 143 characters, under 160. Every fact is in Lisa's text:
  - "bullied on his first day of sixth grade": "junior high school in the sixth grade where, on day
    one, he was bullied" (141-142).
  - "the esports team": 158-160, 174-178, 194-195.
  - "found his footing": a paraphrase, not her words. Supported by "Gaining confidence brought out
    the old Ryan" (242) and "Ryan thrived and continues to thrive on all of it" (210).
  - "learned to lead": "He quickly stepped into a leadership role during his first year" (187),
    "his teammates still chose him to lead the team during tournaments" (189-190), "helped him
    become the leader he is today" (225-226).
  It is written in the third person, so it puts nothing in Lisa's mouth.
- **Changes 2, 3, 5.** Clean. The link target `/blog/when-your-sons-only-friends-are-online` exists.

### Check 3: author integrity

Nothing. No proposed line sits inside one of Lisa's paragraphs or speaks as her.

### Check 4: em dashes the draft did not catch

None. Lines 18, 25 and 121 are all covered by changes 3, 4 and 5.

---

## 07: John Hay's post

### Check 1: "Now" cells against the live page

| # | Line | Result |
|---|---|---|
| 1 | 139-141 | Accurate |
| 2 | 203 | Accurate ("[em dash] Faith, EKUZO Founder &amp; Head Coach") |
| 3 | 213-220 | Accurate |
| 4 | 18 | Accurate |
| 5 | 25, template at `app/layout.tsx:75` | Accurate |
| 6 | 121 | Accurate |
| 7 | 20-21; sitemap `app/sitemap.ts:107-108` | Date values accurate |

### Check 2: "Proposed" cells

- **Change 1.** "EKUZO puts kids on coached esports teams, through their schools and from home" is
  supported by the canon: EKUZO Teams runs "in a School track and a Home track"
  (`ekuzo-faq-canon.md:44`), "Home-track teams" and "school-based teams" (52), and homeschool
  families enroll in the Home track with all sessions online (62).
- **Change 2.** Yes, the live quote attributes to Faith as founder and head coach (203). The author
  page link target exists.
- **Change 2, note.** The site's schema gives the "Head Coach" title to Sebastien DeMontigny
  (`lib/schema.ts:56-58`) and gives Karlin "Founder" (`lib/schema.ts:34`). The attribution is
  pre-existing and describes the time of John's story, so I am not asking for a change. The owner
  may want to know the page and the schema name two different head coaches.
- **Change 3.** Both targets exist: `app/blog/when-your-sons-only-friends-are-online/page.tsx` and
  `app/blog/what-your-kids-gaming-is-telling-you/page.tsx`. The second anchor, "what a big reaction
  to a loss can mean", is supported by its destination: the first sign there is "They get more upset
  than the moment seems to deserve" (that file, 377), with "the size of the reaction tells you the
  size of what's riding on it" (387-388).
- **Changes 4, 5, 6.** Clean.

### Check 3: author integrity

- The only change inside John's paragraphs is the one sentence the owner asked for (change 1).
- **Note.** The meta description (line 18, change 4) is first person under John's byline: "I
  struggled with anxiety, perfectionism, and near-failing grades. Then I found EKUZO, and a coach
  who taught me how to reframe everything." John did not write that sentence. Its facts are his
  (147, 155-156, 165, 207). Draft 06 replaced the same pattern on Lisa's post for this reason ("puts
  a sentence in Lisa's mouth that she didn't write"). Draft 07 fixes only the em dash. The two posts
  are being treated differently. Owner's call.

### Check 4: em dashes the draft did not catch

None. Lines 18, 25, 121, 203 and 215 are all covered by changes 2 to 6.

---

## 08: when your son's only friends are online

### Check 1: "Now" cells against the live page

| # | Line | Result |
|---|---|---|
| 1 | 502-507 | Accurate. It sits after Becky's video (483-500) and before the H2 at 509 |
| 2 | `lib/authors.ts:119` | Already "Advisor to EKUZO · Parent" in this worktree, as the draft says |
| 3 | 33-34 | Date values accurate (published 2026-05-28, modified 2026-10-12) |

### Check 2: "Proposed" cells

Clean. Program line facts match canon. `/programs` exists (`app/programs/page.tsx`). The optional
line in the draft ("see what EKUZO is running now") is also clean.

### Body sweep: EKUZO100, a price, Jamie as CEO

- **EKUZO100:** one mention, line 504, which change 1 removes. No other.
- **Price:** none. "one-month trial" (505) goes with change 1.
- **Jamie as CEO:** none. The only "founder" in the body is Karlin (388). The FAQ answers (39-70),
  subhead (25-26) and description (27-28) carry no product name, price or role.
- **Note.** The body speaks as "we" and "our" in three places: "One of our moms, Lisa" (450), "We
  don't change what your kid loves" (473), "Our coaches are collegiate" (476). This is voice, not a
  role claim, and it is the owner's own text. Listed only because the byline now says advisor.

### Check 3: author integrity

Nothing. Jamie's text; one paragraph replaced at his request.

### Check 4: em dashes the draft did not catch

None in visible text or metadata. Line 20 is a code comment.

---

## Outside these four posts

`lib/authors.ts:104` has an em dash in Karlin's author-page bio ("the founder of EKUZO [em dash] a
former national collegiate esports captain"). It is not rendered on any of these four posts. Listed
so it is not lost.
