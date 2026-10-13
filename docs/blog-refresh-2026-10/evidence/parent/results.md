# Parent review: blog refresh 2026-10

Reviewer role: a US parent of a 12-year-old who games a lot. Not a gamer, a little worried, skeptical of marketing. Read on 2026-10-12.

## How this was read

- Pages fetched with `curl` from `next start -p 3102` (production build, worktree `blog-refresh-2026-10`) and converted to text (headings, links with hrefs, list items, table rows, image alt text; scripts and styles dropped). No browser was opened. Server stopped afterwards; port 3102 confirmed free.
- Layout judged from `docs/blog-refresh-2026-10/screenshots/` (1440 and 375 wide; `r2-` files where they exist).
- Not read: source code, specs, copy decks, decision logs.
- Limits: buttons that open a pop-up ("Join Season 01", and "Enroll my gamer" after its redirect) could not be followed with curl, so I do not know what the pop-up says or asks for. External links were not checked.

Severity: **blocker** = I would leave or distrust the site. **should-fix**. **note**.

## Findings that apply to every page

| # | Severity | Finding |
|---|---|---|
| G1 | blocker | The posts end with "EKUZO runs coached esports teams for kids ages 10 to 17. See the current programs." The red banner directly below says "Season 01 starts in 2027. Get them on the list." There are no current programs to see. See journey (b). |
| G2 | blocker | "Season 01" and "Season one starts in 2027" sit next to stories describing years of EKUZO seasons ("This year is the school's third year with EKUZO", "During a season, our players are on stable teams"). Nothing on any page explains what Season 01 is or what happened to the earlier seasons. I cannot tell whether this is a new company or an old one, and that makes me doubt both the stories and the banner. |
| G3 | should-fix | Phone screenshots from the first round (five of the six posts: both homeschool posts, League, Lisa, John) are cut off about 60px on the left with a grey strip down the right, on every screen of the page. Headline, byline and table first column are all clipped. The `r2-` guide capture is clean, so this may be a capture fault, but I cannot rule out that the page sits off-centre or scrolls sideways on a phone. Needs a re-shoot; if it is real it is a blocker. |
| G4 | should-fix | Every post reads "Updated October 13, 2026", including a mom's story set during COVID and a coach's story with no dates in it. The same date on everything looks stamped, and on the day I read it (October 12) the date was tomorrow. |
| G5 | note | On a phone a red "Join Season 01" bar is pinned to the bottom of the screen from the first second, before I know what EKUZO or Season 01 is. |
| G6 | note | The Instagram videos show as an empty grey box with a broken-page icon in the screenshots (homeschool guide, League post). If a phone blocks the embed, that is what a parent sees. |
| G7 | note | The brush-stroke decoration runs behind the headline on a phone (visible through "Gaming" and "for kids" in `r2-newguide-top-375.png`). Readable, but it looks like a smudge on the title. |
| G8 | note | Ages differ: the posts say "ages 10 to 17", the programs page FAQ says "students aged 10–18". |

---

## 1. /blog/gaming-programs-for-kids

Search: "gaming programs for kids", "after school esports near me"

**Did the title and first paragraph answer my search?**
Yes. "In fall you're choosing between five kinds: classes where kids build games, weekly online clubs inside Minecraft and Roblox, a school esports team, a library club, and coached teams and leagues." For "near me" the page can only point at location finders (XP League, Valhallan) and my own school and library, which is fair. No findings.

**Where did I get confused, bored, or feel sold to?**
- should-fix. "The list is open now, it's free to join, and it doesn't commit you to anything." No list has been mentioned before this sentence. I had to work out it meant a waitlist.
- should-fix. "Season one starts in 2027" and, four sentences later, "our next season doesn't start until 2027." First season or next season? They read as two different facts.
- should-fix. The subtitle promises "what it costs". EKUZO is the only coached program the author runs and it is the one with no price anywhere on the page. One paragraph earlier the page says of two competitors, "Neither posts prices on its main page, so ask your local location." The programs page does list prices ($100, $199, $576), so I do not understand why the guide leaves them out.
- note. "What it costs, where a page says" is an awkward heading. The table leaves out Connected Camps, Code Ninjas, PlayVS and EKUZO without saying why.
- note. The "Honest weakness" under coached teams is only about EKUZO. XP League and Valhallan get none.
- note. "Its site showed fall enrollment ending October 2." Under a heading that asks "What's open in fall 2026?", on a page dated October 13, this one is already closed. The sentence after it ("ask about spring") saves it.
- note. The only library example is a teen club (13 to 18) in Murrieta, California. Useless for a 12-year-old anywhere else; it reads as the one example someone found.
- note. Closing line, "The right program meets them where they already are and builds the community, the coach, and the challenge around it", is the one sentence that sounds like a brochure.

**Anything I did not believe?**
- should-fix. "All EKUZO coaches are top 1% collegiate esports athletes or former professional players." Top 1% of what, measured by whom? It is the only superlative on an otherwise careful page, and it is about the author's own company. The next sentence tells me to "ask who the coach is and how far they went in the game", and the page does not answer that for EKUZO.

**Anything that reads oddly on its own?**
- "this is the kind of program I run, so read this part knowing that" is clear. Karlin Oei is introduced by the byline ("Founder of EKUZO"). No findings on names.
- note. The Keep Reading card is a family story about years with EKUZO, directly above "Season 01 starts in 2027" (G2).

**Phone**
- note. The hero photo is a dark crop of the back of someone's head and fills a full screen. The first paragraph starts about a screen and a half down.
- The price table fits at 375 wide and is readable. Body text is fine. Brush stroke behind the headline (G7).

**Would I keep reading?**
Yes, this is the one page I would bookmark; next I would click "EKUZO" to find the price and a start date, which is where it goes wrong (journey b).

---

## 2. /blog/when-gaming-helps-homeschool-kids

Search: "is gaming bad for my homeschooled kid"

**Did the title and first paragraph answer my search?**
Yes. "For a homeschooled kid, gaming can build focus, friendships, and a reason to get out of bed in the morning. It can also swallow the day and shrink the world down to a screen." No findings.

**Where did I get confused, bored, or feel sold to?**
- should-fix. In a piece for homeschool parents the one video is captioned "Karlin breaks down armor vs. magic resist: a League of Legends concept many players miss for years, and why kids benefit from learning it early." I do not know what armor or magic resist is, and the caption talks about "Karlin" in the third person in an article Karlin is writing in the first person. It reads as dropped in from somewhere else.
- should-fix. "EKUZO runs coached esports teams for kids ages 10 to 17. See the current programs." (G1.)
- note. The five-question box and the five bullets right under it say the same five things twice.
- note. "A school caps gaming by default, because six hours of schedule land before a screen can." and "Six hours moving in five directions is just motion." I read both twice and am still not sure what the second one means.
- note. The page ends three times: "One honest caveat", then "For everyone else, the takeaway is simpler", then "A game gave me a team, and the team gave me everything else", then a link.
- note. "We don't pretend every title is equal, and we don't coach shooters." "We" has not been introduced at that point; EKUZO is only in the byline.

**Anything I did not believe, or that lowered my trust?**
- should-fix. "Most of us put screen time near the top of the worry list, and plenty of us quietly wonder if we're getting it right. If that's you, you're not failing." This is written as one parent to another. Nothing on the page says the author is a parent, and later he says "I wasn't homeschooled." A homeschool parent will notice an outsider saying "us".
- should-fix. The "Sources and further reading" list has seven entries. Only two are used in the article. The other five ("Team chemistry over star power", "Adult-relationship growth in coached programs (12.2% to 23.5% in one year)", the Pew one and so on) back claims that are not on the page. It looks like a reference list left over from a longer draft, or padding.
- note. "the kind a lot of you pulled out of school because you could see it happening in real time" assumes why a family homeschools.
- note. "$80,000 in esports scholarships" and "a standardized test I landed in the top 1% on". I half believe it. No way to check from here.
- The research paragraph is careful ("I read it as a pointer and not as proof"). No findings.

**Anything that reads oddly on its own?**
- should-fix. "The dad who started that thread made this point better than I can." Which dad, and what did he say? The thread was mentioned once, three sections earlier, and the dad never. The point he made is not given.
- should-fix. "The books on their shelves are pointing at something true." Which books? They are named only in the other article.

**Phone**
- should-fix. Clipped capture (G3). Instagram box is blank (G6). Nothing else cramped that I can judge.

**Would I keep reading?**
Yes to the end, because the five moves are usable at home; then I would click "See the current programs" and be confused by what is there.

---

## 3. /blog/what-homeschool-parents-taught-us-about-gaming

Search: "should homeschoolers play video games"

**Did the title and first paragraph answer my search?**
The title is my question. The first paragraph does not answer it; it reports a poll: "Most said cut it off. A smaller group said set limits. A few said aim it." The author's own answer only arrives in the last section ("Does gaming make your kid's world bigger or smaller?"). should-fix. The line "This was one Facebook thread, not a formal study" is honest and I noticed it.

**Where did I get confused, bored, or feel sold to?**
- blocker (for a homeschool parent). "We coach kids through games for a living, so I read this less as a debate and more as a brief. The parents handed us their exact words, their real fears, the books on their shelves, and the shape of the thing they wish existed." Those parents were talking to each other in a parenting group. They did not hand a company anything. This is the sentence where I understand the article is market research on people like me, and I stop trusting the sympathy in the rest of it.
- should-fix. "Limits are an early-stage tool. By the time a parent is posting in a group asking for help, they're usually past it." I am a set-limits parent. I have just been told my approach is the beginner version.
- should-fix. "This camp is small, and that's the tell. Almost all of them built their version by hand ... because no single thing existed to point at." Then: "Plenty of parents don't have the hours to, and shouldn't have to." I can see the pitch being lined up two sections before it arrives.
- should-fix. The same quote appears three times: in the card ("Taking that away without a solid alternative can lead to serious emotional distress, including depression"), then again in the next section, and paraphrased straight after.
- note. "It's the homeschool parent's real superpower." Flattery.
- note. "It's the same reason we're picky about which titles we coach." "We" is not introduced until three sections later.
- note. "Camp" means a group of parents here; on the same site "Camps" is a product in the menu.

**Anything I did not believe, or that lowered my trust?**
- should-fix. The table and the three headings give "60%", "30%", "10%". Under the table: "Rough shares from reading the thread, not a precise count." Round guesses should not be printed as percentages in headings. I do not believe the numbers, and then I wonder what else is rounded.
- note. The four quote cards are drawn to look like social-media posts, with heart and reply icons. The small print says "Names and avatars are generic; nothing here is a screenshot of the original thread." Made-up post cards for real quotes is a strange choice; I had to read the caption to know what I was looking at.
- note. The label above the title is "Case Studies". It is one person's reading of one Facebook thread.

**Anything that reads oddly on its own?**
- should-fix. Last paragraph: "This piece has a sibling. I ran the same read on about a thousand replies to the viral '13.7 years younger' gaming study ... That number isn't in the paper." I have not heard of the study. "That number isn't in the paper" means nothing to me on this page, and "This piece has a sibling" sounds like an editor's note to another editor.
- "The dad who started the thread" is introduced in the first sentence here, so he is clear on this page. No findings.
- Link "when gaming helps homeschool kids and when it hurts" goes where it says. No findings.

**Phone**
- should-fix. Clipped capture (G3); the first column of the three-camp table is cut off in it, so I cannot confirm the table fits. The quote cards in `r2-review-caption-375.png` fit and read well.

**Would I keep reading?**
I would follow the link to the "what to do about it" guide, but warily; a homeschool parent who hits the "brief" paragraph may not.

---

## 4. /blog/league-of-legends-youth-development

Search: "is league of legends ok for kids"

**Did the title and first paragraph answer my search?**
- blocker. The title asks my question. The first paragraph answers a different one: "League of Legends is unusually strong for structured youth development. The game is deep enough to coach against, hard enough to grow young players, structured enough to teach roles, and culturally durable enough to outlast more than one cohort of kids." That is a pitch to a school or an investor. The plain answer to my search is at the very bottom, in the FAQ: "League is rated ESRB Teen for fantasy violence. It isn't a young children's game, and the rating is honest about that." On a phone that is about eleven minutes of scrolling away. I would have left during the first paragraph.

**Where did I get confused, bored, or feel sold to?**
- should-fix. Words I do not know, in the first paragraph and after: "top, jungle, mid, ADC, support", "a competitive grammar", "the most surface area to teach against", "solo queue" (used several times before I can work it out), "shotcalling", "beginner-friendly champion pools, role scaffolding, and small-team scrims".
- should-fix. "That's the opportunity. Getting your kid into a structured, coached online environment early, before they have a hundred hours of unmanaged solo queue, is one of the better moves you can make." My kid does not play League. I came to ask whether it is safe and I am being told the toxicity is a reason to sign up early.
- should-fix. The paragraph beginning "And the universe around the game keeps growing" (Worlds viewers, Arcane, Fortiche, a trading card game "with new sets shipping every quarter", a fighting game) ends "League is a universe a kid can live in." To a worried parent that is the fear, not the reassurance. It also reads as a list of more things to buy.
- should-fix. The page never tells me what a parent needs to decide: who my kid can talk to in the game and whether chat can be turned off, how long a match lasts and whether it can be paused, and whether the game costs money or sells things inside it. (The equipment FAQ on /parents says it is free to download; this page does not.)
- note. The Jynxzi section lists "MrBeast, Tyler1, Doublelift, xQc, Ludwig". I know one of those names. The point (same game, different format, better behaviour) is good and takes four paragraphs to reach.
- note. "League isn't a shooter, which lowers the institutional barrier for many schools and families" appears twice. "Institutional barrier" is not a family's phrase.
- note. "Most of a kid's growth in any program comes from a small share of the inputs." I do not know what this means.
- note. "A factory of sadness, with adults in the room, becomes something else." Becomes what?

**Anything I did not believe, or that lowered my trust?**
- should-fix. The page says the game is rated Teen and "isn't a young children's game", and three paragraphs earlier that "EKUZO runs coached esports teams for kids ages 10 to 17." Nobody addresses the 10-, 11- and 12-year-olds. Mine is 12. This is the exact question I searched.
- should-fix. "The transfer is visible at the high end too: Jane Street ... Demis Hassabis, the Nobel-winning CEO of Google DeepMind ... 65% of competitive college esports players are STEM majors ... The same cognitive substrate that produces a high-level gamer often produces a high-functioning operator." Name-dropping. None of it is about League or about children, and the last sentence is the most marketing-sounding line on the site.
- should-fix. "A kid who gets better at League gets better at Fortnite too." Stated as fact, no support.
- should-fix. "Riot's behavior systems ... keep repeat-offense rates under 10% inside the same year". I cannot tell what this is measuring, and the link goes to a help page about the Honor system.
- note. "League taught me more than school did." He hedges it straight away, but it is the line I would repeat to my spouse as the reason not to trust the page.
- note. "During a season, our players are on stable teams ... Coaches are in voice during sessions." Present tense, while the banner says the first season is in 2027 (G2).

**Anything that reads oddly on its own?**
- should-fix. After the FAQ, a stray last paragraph: "When the viral '13.7 years younger' gaming study went around, the most-liked reply under the original post was ... The 13.7 isn't in the paper. I wrote up what is, and what it means for your kid." Refers to a study, a post and a number that are not on this page.
- "what games do you play? When I say League of Legends" is clear. Karlin is introduced by the byline. Links to the methodology page and the programs guide go where they say. No findings on names.

**Phone**
- should-fix. Clipped capture (G3). The opening paragraph is nine sentences with no break and fills about two phone screens. There is no one-line summary under the title as on the other posts. The Jynxzi video is a blank grey box (G6).

**Would I keep reading?**
No; I would go back to Google for a page that tells me the age rating and the chat settings in the first two lines.

---

## 5a. /blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng

Arriving from a link on the site ("Ryan's story, in his mom's words").

**Did the title and first paragraph deliver what the link promised?**
Yes. "My son Ryan was always a happy kid in his early years ... on day one, he was bullied." It reads like a real parent wrote it. No findings.

**Where did I get confused, bored, or feel sold to?**
- note. "Faith, who in my eyes is the best mentor and coach Ryan has ever had" and "nothing short of amazing". It is a glowing customer letter on the company's own site. I discount it accordingly, and the closing line "one family's experience, not a guarantee" is the right instinct.
- note. "shout casters" is not explained.
- note. The title says "the K1ng" and I do not learn what that is until the seventh paragraph.

**Anything I did not believe, or that lowered my trust?**
- should-fix. "This year is the school's third year with EKUZO and they still have a team." The story starts with COVID, so "this year" is around 2022 or 2023. The page says "Updated October 13, 2026". Ryan was 12 then and would be about 18 now. I cannot tell when this was written or whether any of it is still true.
- blocker (G2). That sentence sits one scroll above "Season 01 starts in 2027."

**Anything that reads oddly on its own?**
- The editor's note ("Faith is Karlin Oei, EKUZO's founder. Faith was his gamertag, and it's the name his players know him by") works and comes right after the first mention. No findings.
- should-fix. "by Lisa Holt" with nothing after it. Every other author has a line saying who they are. "EKUZO parent" would do.
- note. The label above the title is "Case Studies". It is a mom's letter.
- Link "when your son's only friends are online" goes to that article, which has a section on Ryan. No findings.

**Phone**
- note. The photo is a tall crop of a boy mid-shout in a headset and runs about a screen and a half before the byline. Clipped capture (G3).

**Would I keep reading?**
Yes, to the end; then I would want to know whether my kid could join the thing she describes, and the answer on the next page is "not until 2027".

## 5b. /blog/conquering-my-mountain-and-giants-how-esports-changed-my-life

Arriving from the Keep Reading card on the page above.

**Did the title and first paragraph deliver?**
Partly. "Hey everyone! My name is John, and I am an esports coach for EKUZO." The card and the label call this a testimonial. I expected a student or a parent and got a member of staff.

**Where did I get confused, bored, or feel sold to?**
- should-fix. The story stops in the middle. It builds to the coach's quote, then one paragraph ("I learned that mistakes are common and it is okay to make them") and it is over. The title is "How Esports Changed My Life" and I never find out what changed: whether his grades recovered, whether he finished school, how he became a coach.
- should-fix. The title promises a "Mountain and Giants". Neither word appears in the story.
- note. "For those of you unfamiliar with the program, EKUZO puts kids on coached esports teams, through their schools and from home." A different voice from the sentences around it; reads as inserted.
- note. "It can be fairly lazy and unproductive." and "I tried out the private school arena utilizing a non-traditional learning style". Unclear what either means.

**Anything I did not believe, or that lowered my trust?**
- should-fix. Label "Testimonials", author an EKUZO coach, and the page does not say plainly that he was a student in the program first. A testimonial from someone on the payroll counts for less, and the page hides the detail that would make it count for more.
- note. "Faith (Karlin Oei), EKUZO founder and head coach". The camps page names someone else as Head Coach.

**Anything that reads oddly on its own?**
- "our coach, Faith" is explained by the credit under the quote. No findings.
- note. Link text "what a big reaction to a loss can mean" goes to an article titled "What your kid's gaming is telling you". It is the right article (its first section is about that) but the title I land on is not what I clicked.
- note. "by John Hay" with no role in the byline, and "Updated October 13, 2026" on a story with no dates in it.

**Phone**
- should-fix. The top photo does not show John. On the phone capture it is a stone balcony rail, a lawn, and a slice of a person at each edge, a screen and a half tall. Even allowing for the clipped capture (G3), the subject is not in the frame.

**Would I keep reading?**
No; it ends before it tells me anything, and I would go back to the mom's story or leave.

---

## Journey (a): from /parents into the blog

| Link on /parents | Where it says it goes | Where it went | Verdict |
|---|---|---|---|
| Story card: "Our Family's Esports Journey with EKUZO and the K1ng / Ryan's story, in his mom's words." | The mom's story | `/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng` | Matches |
| Under "Is gaming really educational?": "What a viral gaming study found, and what it didn't" | An article about a study | `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`, titled "The gaming study everyone shared, and what it means for your twelve-year-old" | Matches |
| Under "Isn't this just more screen time?": "What 200+ homeschool parents said when one dad asked about his sons' gaming" | The thread article | `/blog/what-homeschool-parents-taught-us-about-gaming` | Matches the text. note: I asked about screen time and I do not homeschool; odd place to send me |
| Under "Do I need to be a gamer to support my child?": "Six things parents notice first in a gamer kid, and what they often mean" | A six-item article | `/blog/what-your-kids-gaming-is-telling-you`, which has six sections | Matches |

All four links go where they say. Other things I hit on the way:

- blocker. The FAQ answer "How do I enroll?" says "Click 'Enroll my gamer' on any page to see the available programs. EKUZOCAMPS are open for summer registration now. EKUZOTEAMS enrolls each fall and spring semester. EKUZO100 is available year-round as a 4-week on-ramp." The banner on the same page says "Season 01 starts in 2027. Get them on the list", and the buttons in the screenshots say "Join Season 01", not "Enroll my gamer". It is October; "open for summer registration now" is wrong on its face.
- note. The three "Related reading" links are inside FAQ answers that are closed until tapped. I would not have found them without opening those three questions.
- note. The section is headed "Stories of Growth and Gaming" and holds one story.
- note. The FAQ gives numbers with no source: "86% of parents", "7.3 more school days per year, 33.5% lower absence rates, and a +0.11 GPA increase".

## Journey (b): from the programs guide, what is EKUZO, what does it cost, what can I sign up for today

What the guide led me to expect: one hybrid program (in person at school or online from home), coaching in League of Legends, "Season one starts in 2027", a free list with no commitment, no price given.

What I found at /programs:

- Three programs, described in the present tense as things I can buy: "EKUZO Teams (semester-based, about 15–16 weeks)", "EKUZO100 (a 4-week competitive bootcamp)", "EKUZO Camps (1-week intensive sessions during summer and holiday breaks)".
- Prices, in the FAQ only: "EKUZO100 is $100 for four weeks. EKUZO Camps are $199 per week. EKUZO Teams is $576 paid in full (10% off) or four monthly payments of $160 ($640 total)."
- Advice to buy now: "Start with EKUZO100 if you want a low-commitment first taste: four weeks, $100, no contract."
- On the EKUZO100 page: "Sessions are Tuesdays & Thursdays, 7:00–8:30 PM local" and a button "Enroll my gamer".
- On the Camps page: a scrolling strip "NOW ENROLLING ✦ MON–FRI ✦ VIRTUAL CAMP ✦ LIMITED SPOTS", "Press start on summer", "Start Date: Summer 2026" (it is October 2026), "$199 $299 Limited-Time Pricing", and a button "Register for Camp".
- At the bottom of every one of those pages: "Season 01 starts in 2027. Get them on the list."
- The "Enroll my gamer" and "Register for Camp" buttons link to a register address that sends me straight back to the same program page (with `?join=season-one` on the end). I assume that opens the waitlist pop-up; I could not see it. Either way, no registration page exists.

Answers, as far as I could get them:

- What is EKUZO? A company that puts kids on coached League of Legends teams. That part is clear.
- What does it cost? Unknown. Prices are listed for three programs, but none of them can be bought, and nothing says whether those prices apply to Season 01.
- What can I sign up for today? A waitlist for 2027, and nothing else. No page says so in plain words. I worked it out by clicking "Enroll" and landing back where I started.

Verdict: **blocker**. The guide was honest ("our next season doesn't start until 2027. If you need something this fall, pick from the sections above"). The page it links to contradicts it with "NOW ENROLLING", "LIMITED SPOTS", "Limited-Time Pricing", a summer that is already over, and enrol buttons that go nowhere. After a guide that carefully checked other companies' pages, finding that EKUZO's own page says things that are not true this month is the moment I would close the tab. The same mismatch catches every post that ends "See the current programs" (G1).
