# Copy 3 of 9: linking plan, round one

**Surfaces:** `/`, `/parents`, `/faq`, `/programs`, and the closing lines of four posts.
**Status:** draft for Jamie. Nothing in the repo has changed yet.
**Job:** today one page outside the blog links to a post, and it points at the wrong slug. This adds 9 links from pages outside the blog into posts, plus 4 between posts.

## One decision about how the links appear

Seven of the plan's twelve rows attached a new sentence to an FAQ answer. I've changed that. Each FAQ link below is a **"Related reading" line under the answer**, and the answer text stays exactly as it is.

Why:
- FAQ answers on the site come from the FAQ canon and feed the FAQ schema. A sentence added on the page would drift from canon, and the schema takes plain text, so the link wouldn't survive there anyway.
- The plan's em-dash fixes inside those answers belong to the /parents and /faq copy pass, which the brief puts out of scope.
- It settles the "Karlin wrote..." repetition: none of the lines needs an attribution.

Cost: a small change to the FAQ accordion so an item can carry one related link (Aaron's component; the link renders in the page HTML whether the answer is open or closed).

## Pages to posts

| # | Where | What's there now | Proposed |
|---|---|---|---|
| 1 | `/parents`, the story card | Links to the wrong slug (it redirects). Blurb: "My son Ryan was always a happy kid in his early years. See how EKUZO changed everything." | Fix the link. Blurb: "Ryan's story, in his mom's words." |
| 2 | `/parents` FAQ, "Do I need to be a gamer to support my child?" | No link | Related reading: [Six things parents notice first in a gamer kid, and what they often mean](/blog/what-your-kids-gaming-is-telling-you) |
| 3 | `/parents` FAQ, "Is gaming really educational?" | No link | Related reading: [What a viral gaming study found, and what it didn't](/blog/gaming-study-13-7-years-younger-what-it-means-for-kids) |
| 4 | `/parents` FAQ, "Isn't this just more screen time?" | No link | Related reading: [What 200+ homeschool parents said when one dad asked about his sons' gaming](/blog/what-homeschool-parents-taught-us-about-gaming) |
| 5 | `/`, the League of Legends section. "It's free to play, runs on most family computers, and has none of the loot-box pressure parents watch for." | No link | Add one sentence after it: "Here's [why we chose League of Legends for kids](/blog/league-of-legends-youth-development), and how we deal with the toxicity it's known for." |
| 6 | `/faq`, "Isn't gaming culture toxic? I don't want my child exposed to that." | No link | Related reading: [Is League of Legends really that toxic?](/blog/league-of-legends-youth-development) |
| 7 | `/faq`, "Can homeschool families participate?" | No link | Related reading: [When gaming helps homeschool kids and when it hurts](/blog/when-gaming-helps-homeschool-kids) |
| 8 | `/programs` FAQ, "Can homeschool families participate?" | No link | Related reading: [How to tell if gaming is growing your homeschooled kid's world or shrinking it](/blog/when-gaming-helps-homeschool-kids) |
| 9 | `/programs`, under "Real stories from EKUZO families", below the video carousel | No link | One line: "One mom wrote about [how her son, bullied in sixth grade, became a leader on his esports team](/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng)." |

Row 4 is new. The plan gave the review no inbound links because it assumed the merge; now that the post stays, it needs its own.

## Post to post

| # | Where | What's there now | Proposed |
|---|---|---|---|
| 10 | John Hay's post, the editor's line after his text | "John's story is one person's experience, not a guarantee. If it resonates and you want a low-stakes way to put your gamer on a coached team, EKUZO100 is a one-month trial for $100 [dash] or read when your son's only friends are online for the bigger picture." | "John's story is one person's experience, not a guarantee. Related: [when your son's only friends are online](/blog/when-your-sons-only-friends-are-online) and [what a big reaction to a loss can mean](/blog/what-your-kids-gaming-is-telling-you)." Then the shared program line. |
| 11 | Lisa Holt's post, the editor's line after her text | "Ryan's story is one family's experience, not a guarantee. For the bigger picture behind it, read when your son's only friends are online. And if you want a low-stakes way to try a coached team, EKUZO100 is a one-month trial for $100." | "Ryan's story is one family's experience, not a guarantee. For the bigger picture behind it, read [when your son's only friends are online](/blog/when-your-sons-only-friends-are-online)." Then the shared program line. |
| 12 | Muhammad's military post, keep-reading cards (Fortnite, when-your-sons, what-your-kids) | No link to the gaming study | Swap the when-your-sons card for the gaming-study card. No new sentence. |
| 13 | Muhammad's Fortnite post, keep-reading cards (military, when-your-sons, what-your-kids) | No link to the review | Swap the when-your-sons card for the review card. No new sentence. |

Rows 12 and 13 changed from the plan. The plan added a sentence to each of Muhammad's posts. I recommend cards only, for three reasons: you said his copy stays; the military page's own header notes cap how much EKUZO appears on it and say Casey is quoted only for what's on tape; and Steward found my draft line credited Casey with a point about research that she never makes. When-your-sons can spare the two cards: it is the most linked post on the blog.

If you'd rather have the sentences, these are the corrected versions, set as editor's lines after his text:
- Military: "*More from EKUZO: Karlin read the paper behind a viral gaming headline. [What that study found, and what it didn't](/blog/gaming-study-13-7-years-younger-what-it-means-for-kids).*"
- Fortnite: "*More from EKUZO: a homeschool dad warned other parents about taking a game away with nothing to replace it. [What he and other homeschool parents said](/blog/what-homeschool-parents-taught-us-about-gaming).*"

## Already covered elsewhere

- **Guide and review link each other:** copies 1 and 2.
- **Posts to /programs:** the shared program line, on six posts.
- **what-your-kids and the gaming study** already link both ways; the repeated anchor gets varied in copy 5.
- **K1NG and when-your-sons** already link both ways.
- **League post to the camps guide,** and the five inbound links the camps guide needs as a re-slugged page: copies 4 and 9.

## Amendments to the KB plan

After you approve, `company/marketing/internal-linking-plan-2026-10.md` gets: the money page changed to `/programs`; rows 2, 3, 5, 6 and 7 recorded as related-reading lines; the new row 4; row 11 pointed at the review; rows 10 and 11 without the EKUZO100 sentence.

## Two things I need from you

1. **Related-reading lines under FAQ answers** in place of sentences added to the answers. Yes or no.
2. **Rows 12 and 13:** card swaps on Muhammad's two posts (my pick), or the editor's lines.

## Steward's check

Every "what's there now" quote matches its page, and every claim an anchor makes about its destination was checked against that post, with file and line. Three fixes made from its findings: the Casey line (rows 12 and 13 above), row 3's anchor (the post says the study tells you nothing about a twelve-year-old, so "can and can't tell you about kids" overstated it), and row 6's anchor now uses the post's own heading. It could not verify the 200+ reply count. Full table: `docs/blog-refresh-2026-10/evidence/steward/03-linking-round-one.md`.
