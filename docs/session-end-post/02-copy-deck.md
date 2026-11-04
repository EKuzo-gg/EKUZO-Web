# Copy deck: session-end post, Fortnite refresh, League facts box

Story role, Build Loop Run 2 (handoff `knowledge-base/system/loops/handoffs/2026-10-24-ship-robux-and-session-end-posts.md`, "Run 2, 2026-11-04"). Drafted 2026-11-04. Nothing here is built; Jamie approves each item first.

Voice stack loaded before drafting: `anti-ai-writing.md`, `voice-dna.md`, `ekuzo-messaging-voice.md`. Byline voice evidence read: the full Fortnite post (Muhammad), the full League post (Karlin), the v6 copy of record (Karlin).

Facts sources: `ekuzo-fact-library.md` (FTC entry, line 679), `ekuzo-faq-canon.md`, and for Season 01 `lib/season1/offer.ts` plus the live copy in `app/season1/join/b/join-b.html` and `app/season1/landing.html`. **Neither KB file has a Season 01 product entry** (grep for "Season 01" in the fact library returns nothing; the FAQ canon has only the "What game do they play?" and "Is it safe?" answers). Season 01 facts below come from the repo.

Tags: **NEW** = added copy. **CHANGED** = edit to existing copy, current text quoted.

---

## Decisions for Jamie (summary)

1. **League ESRB link is wrong listing.** The League post links `esrb.org/ratings/27518`, which lists only "Blood, Fantasy Violence". The listing with the four descriptors in the brief is `esrb.org/ratings/32211` (Macintosh, Windows PC). Recommend switching the link and updating the FAQ sentence (B, item 2).
2. **Fortnite ESRB descriptors conflict across reads.** Two fetches of the same page gave different descriptors (details in A4). Needs a browser read before build.
3. **Epic parental controls: NEEDS-BROWSER.** Every Epic and fortnite.com page refused the fetch tool. The line is drafted with a placeholder.
4. **Muhammad's calendar link: NEEDS-BROWSER.** Google blocks the fetch tool (robots). Not confirmed either way.
5. **Season 01 age range.** The brief says 10 to 17; `offer.ts` (`ageCopyMin: 9`) and the FAQ canon (updated 2026-10-29) say 9 to 17. Nothing below states the age range, so no copy depends on it, but the brief's number is out of date.
6. **Fortnite short answer duplicates the intro.** The second intro paragraph already gives "the short version." Keep both (recommended: Muhammad's version is a scene, the labeled one is for search) or trim the intro (option in A1).
7. **Season 01 link in the new post:** add a sentence (C3 option 1) or edit the existing one (C3 option 2). Recommend option 2.
8. **Related copy debt found, not in this deck's scope:** the Fortnite entry in `public/llms.txt` says "the punishment became part of the addiction", which is addiction framing in EKUZO's voice. Recommend changing "addiction" to "loop", which is the post's own word ("The punishment had become part of the loop."). Also, Muhammad's intro says "rising senior" and "This summer", and llms.txt calls him "a senior": the intro is now out of date.

---

## A. Fortnite update (`app/blog/should-you-ban-fortnite/page.tsx`, byline Muhammad Hossain)

H1 ("She banned Fortnite and got her kid back. Then came a new problem.") and title tag ("Should you ban Fortnite? What happened when one mom did") stay as they are.

### A1. Short answer, NEW

Placement: first element inside `BlogPostBody`, above "Howdy, I'm Muhammad." Same markup as the gaming-study post (`<strong>Short answer:</strong>`).

> **Short answer:** sometimes. If your kid's behavior keeps getting worse around one game, a ban is a fair call, and for Casey it worked: her son came back. But a game can be doing more than one job. Fortnite was also one of the few things her two very different boys did together, and the ban took that too. So before you take it away, figure out what the game is giving your kid, then replace that part on purpose.

80 words (counted by script). Every claim is already in the post: "fair call" and "deteriorating" (FAQ 1), "Oh, [my son] is back" (body), "one of the few places they overlapped" (body), "Fill the gap on purpose" (FAQ 3).

Optional trim (decision 6), CHANGED, intro paragraph 2:
- Current: "I'd like to tell you about Casey. She's a mom of two boys who banned Fortnite from her house. The short version, in case you're standing in your kitchen right now trying to decide whether to ban the game yourself: the ban worked. The kid she'd been missing came back. But then a new problem showed up, one none of the articles had warned her about, because the game had been quietly doing a job in her family, and banning it left the job open."
- Proposed: no change. If Jamie wants the trim: "I'd like to tell you about Casey. She's a mom of two boys who banned Fortnite from her house. The ban worked. The kid she'd been missing came back. But then a new problem showed up, one none of the articles had warned her about, because the game had been quietly doing a job in her family, and banning it left the job open."

### A2. Body H2s as parent search questions, CHANGED

| # | Current | Proposed |
|---|---|---|
| 1 | Why she banned Fortnite | Why would a parent ban Fortnite? |
| 2 | What the ban fixed, and what it broke | What happens when you ban Fortnite? |
| 3 | Why Red Dead Redemption worked | Why did an M-rated game work better than Fortnite? |
| 4 | Why her kids begged their dad for a private Minecraft server | Why do kids want a private Minecraft server? |
| 5 | What she actually did | How do I decide which games to allow? |

"Common questions" and "Sources and further reading" stay. Note on 5: the section is about judging games one at a time, so the question names that, not the ban.

### A3. "Try this tonight" box, CHANGED (moved and retitled)

Current location: inside "Why Red Dead Redemption worked", directly after its H2. Current props: `title="Before you take it away"`, `subtitle="Five questions about what the game is giving"`.

Proposed location: directly after the new H2 1 ("Why would a parent ban Fortnite?"), before its first paragraph ("She has a name for what the game did to her house."). That keeps the house pattern from the code comment (aside directly after an H2, because `.blog-content h2` has no `clear:both`) and puts the box on the first screen after the intro. Remove it from the Red Dead section.

Proposed props:
- `title`: Try this tonight
- `subtitle`: Five questions to ask before you take a game away
- `questions` (verbatim, unchanged):
  1. Who are they playing it with, week to week?
  2. Is anyone else in the house in there with them?
  3. What are they like twenty minutes after they stop?
  4. Have they built anything in there worth keeping?
  5. If it vanished tomorrow, what vanishes with it?

The code comment above the aside describes its placement and argument; update it to the new section when built.

### A4. Fortnite facts box, NEW

Placement: after the paragraph ending "the largest penalty of its kind at the time." and before "If spending is the worry," (it sits next to the FTC sentence it expands). A plain aside, not GutCheckAside. Title: **Fortnite at a glance**

Lines (5):

1. **Rating:** The ESRB rates Fortnite Battle Royale T for Teen, for {VERIFY: Lyrics, Suggestive Themes, Violence}. It lists in-game purchases and players who interact.
2. **Parental controls:** {NEEDS-BROWSER: what Epic's parental controls let a parent set, and where. Draft once read: "Epic's parental controls, set from the parent's Epic account, let you {controls as listed by Epic}."}
3. **The FTC case:** In December 2022 the FTC announced $520 million in settlements with Epic Games: a $275 million penalty for breaking the children's privacy law (COPPA), and $245 million in refunds for design that led players into unwanted purchases.
4. **Match length:** A Battle Royale match runs about 20 minutes, less if they're knocked out early.
5. **Where to stop:** When the match ends. More on that in how to get your kid off the game without a fight (link `/blog/how-to-get-your-kid-off-video-games-without-a-fight`). *Optional; this is a second link to the new post if A6 also ships. Drop line 5 if Jamie wants one link.*

Line 4 comes from the new post's table (Jamie's own lengths). Hard-fact count (voice-dna 2L): $520 million appears in the body and in line 3, which is two placements, at the point it is first used and in the reference box. Fine.

Verification record:

| Fact | URL | Read | Exact line |
|---|---|---|---|
| FTC total | https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations | 2026-11-04, WebFetch | "December 19, 2022"; "to pay a total of $520 million in relief" |
| FTC penalty | same | 2026-11-04 | "Epic will pay a $275 million monetary penalty for violating the COPPA Rule" |
| FTC refunds | same | 2026-11-04 | "Epic will pay $245 million to refund consumers for its dark patterns and billing practices" |
| Fact-library line used | `company/marketing/ekuzo-fact-library.md` line 679 | 2026-11-04 | "On 19 December 2022 the FTC announced $520 million in combined settlements with Epic Games over Fortnite: a $275 million civil penalty for COPPA violations and $245 million in refunds for dark patterns that produced unauthorized charges." (matches the FTC page) |
| ESRB rating | https://www.esrb.org/ratings/40278/fortnite-battle-royale/ | 2026-11-04, WebFetch | "Fortnite Battle Royale is rated T for Teen by the ESRB with Lyrics, Suggestive Themes, and Violence."; interactive elements "Users Interact" and "In-Game Purchases" |
| ESRB conflict | https://www.esrb.org/ratings/40278 (no slug) | 2026-11-04, WebFetch | returned "Lyrics, Violence" for the same rating ID |
| ESRB conflict | https://www.esrb.org/ratings/41101 | 2026-11-04, WebFetch | "Fortnite Battle Royale is rated T for Teen by the ESRB with Crude Humor, Lyrics, and Violence." (a second Battle Royale listing) |
| ESRB context | Dexerto, 2026-08-25 (not a primary source) | 2026-11-04 | reports the 40278 listing changed to "Lyrics, Suggestive Themes, Violence" in August 2026 |
| Parental controls | https://www.fortnite.com/parental-controls ; https://www.epicgames.com/site/en-US/parental-controls ; https://www.epicgames.com/help/en-US/c-Category_EpicAccount/c-EpicAccount_ParentalControls | 2026-11-04 | **NEEDS-BROWSER.** All three refused the fetch tool (client error) |

**ESRB: NEEDS-BROWSER.** Open esrb.org, search "Fortnite", and read which Battle Royale listing is current and its descriptors. Then fill line 1. The likely answer is "Lyrics, Suggestive Themes, Violence" (the most recent read, matching Dexerto's date), but two reads disagreed, so it should not ship on the fetch tool alone.

### A5. EKUZO 101 link becomes Season 01, CHANGED

Current (Minecraft section, the post's one product link):
> Kids often can't name a safe environment. They usually have to lose one first. I sat there nodding, because that lesson is my job: the kids I coach through EKUZO 101 play on a private, moderated server with the same faces, the same coach, and the same video and voice channel every week.

Proposed:
> Kids often can't name a safe environment. They usually have to lose one first. I sat there nodding, because that lesson is the job: in EKUZO's [Season 01]({SEASON01_URL}), every team plays in private, moderated servers, with the same teammates and the same coach all season.

Notes:
- "my job" became "the job", and "the kids I coach through" became "in EKUZO's Season 01". The KB doesn't record whether Muhammad is on the Season 01 coach roster (the join page lists Sebastien, Karlin and Nuri), so the sentence doesn't claim he coaches it (author-integrity rule). If he is on the roster, Jamie can restore "the kids I coach in Season 01 play...".
- Facts: "Every match happens in private, EKUZO-moderated servers. No public matchmaking, no strangers." and "Same coach. Same squad. All season." (`app/season1/join/b/join-b.html`). No price or dates, because this is the smile-beat link and the header comment caps EKUZO's presence here.
- It's still the one product link, so the one-link rule holds. Update the code comment ("exactly one, to EKUZO 101") to name Season 01.

### A6. Link to the new post, NEW

Placement: after the paragraph ending "The punishment had become part of the loop. ... 'Oh, [my son] is back.'" (section 1). A short standalone paragraph in Muhammad's voice:

> If your fight is less about which game and more about getting off it at night, here's [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight).

Alternative (edit instead of add), CHANGED, the closing "Related" paragraph:
- Current: "Related: when the viral "13.7 years younger" gaming study went around (the number isn't in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up."
- Proposed: "Related: when the viral "13.7 years younger" gaming study went around (the number isn't in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up, then answered that question in [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight)."

Recommendation: the body paragraph. The Related line sits below the FAQ and sources, where few readers reach it.

### A7. Muhammad's calendar link

`LISTENING_CALENDAR = "https://calendar.app.google/mMJ5KoxcNdH6SR13A"`. WebFetch 2026-11-04: "failed at its site (robots_disallowed)". **NEEDS-BROWSER.** Open it signed out and confirm it loads a booking page with open slots. If the listening project has ended, the closing paragraph ("I'm trying to reach 100 of these conversations") needs Jamie's call too.

### A8. FAQ (optional, two items)

CHANGED, rename for search:
- Current: "Should parents ban Fortnite?"
- Proposed: "Should I ban Fortnite?" (matches the title tag and how a parent types it). Answer unchanged.

NEW, after "Should I ban Fortnite?". Depends on A4 line 1 being verified:
> **Is Fortnite OK for kids?**
> The ESRB rates Fortnite Battle Royale T for Teen, and it lists in-game purchases and players who interact. The rating describes the game, not what it does to your kid. Casey's son changed around Fortnite, and the same game was one of the few places her two boys spent time together. Watch what your kid is like before, during and after they play, and decide from that.

Both FAQ edits feed `buildFAQPageSchema`, so the visible section and the schema change together.

---

## B. League facts box (`app/blog/league-of-legends-youth-development/page.tsx`, byline Karlin Oei)

Placement: directly after the opening answer paragraph (the one ending "turns a famously hard title into a developmental environment.") and before H2 "Is League of Legends really that toxic?". The answer block stays first and stays without a heading above it, per its code comment. Title: **League of Legends for parents: the facts**

Lines (6), Karlin's plain guide register:

1. **Rating:** Teen, from the ESRB, for blood, fantasy violence, mild suggestive themes and use of alcohol and tobacco. Online interactions aren't rated.
2. **Accounts:** Riot's Terms of Service (section 1.1) let a minor play with a parent's or guardian's consent, and the parent is responsible for all use of the account, including purchases.
3. **Chat:** In a match, press Esc, then go to Interface and Chat to turn chat with the other team on or off. Typing /ignore all mutes every player for that game.
4. **Honor:** A penalty lowers a player's honor level. At Honor 1 and 2 they lose all chat (Honor 1 also loses champion select and post-game chat) and get no Ranked Season Rewards.
5. **Leaving early:** A game your kid leaves always counts as a loss, even if the team wins. Repeat leaving brings queue delays, then lockouts of up to two weeks.
6. **Match length:** About 45 minutes, including champion select, so count matches, not minutes. Here's [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight).

Line 6 is the League post's link to the new post (the requested sentence). The 45 minutes is from the new post's table.

Privacy settings (who can send friend requests, profile visibility): **NEEDS-BROWSER.** No Riot page found by search covered them; left out rather than guessed.

Verification record:

| Fact | URL | Read | Exact line |
|---|---|---|---|
| ESRB rating | https://www.esrb.org/ratings/32211/league-of-legends/ | 2026-11-04, WebFetch | "Blood, Fantasy Violence, Mild Suggestive Themes, Use of Alcohol and Tobacco"; "Online Interactions Not Rated by the ESRB"; platforms "Macintosh, Windows PC" |
| ESRB, the listing the post links now | https://www.esrb.org/ratings/27518/league-of-legends/ | 2026-11-04 | "Blood, Fantasy Violence"; "Online Interactions Not Rated by the ESRB" (Windows PC) |
| Riot Terms s.1.1 | https://www.riotgames.com/en/terms-of-service | 2026-11-04 | heading "Am I eligible to create an account and use the Riot Services?"; "(iii) have valid parent or legal guardian consent to be bound by these Terms."; "You are also responsible for all use of the account and compliance with these Terms by the minor, including all purchases made on the account."; "Last Modified: December 1, 2024." |
| Chat setting | https://support.riotgames.com/en-us/league-of-legends/gameplay/using-allied-and-all-chat | 2026-11-04 (page dated May 23, 2025) | "While in a game, open the Options Menu by pressing [ESC]"; "Go to the Interface tab on the left"; "Scroll down until you find the Chat section"; "Check the "Show [All] Chat (Matched Games)" box" |
| Mute everyone | same page; also https://support.riotgames.com/en-us/league-of-legends/gameplay/chat-commands (dated March 7, 2025) | 2026-11-04 | "/ignore all will mute all players (chats, pings, and emotes) during this game session." |
| Honor | https://support.riotgames.com/en-us/league-of-legends/rewards/league-of-legends-honor-guide | 2026-11-04 (page dated May 31, 2026) | "Honor is lost when you have an active penalty on your account." The Honor 1 and 2 facts come from the page's tables (no prose): neither level has All Chat; Honor 1 has no Champ Select or Post-game Chat; neither level receives Ranked Season Rewards |
| Leaving | https://support.riotgames.com/en-us/league-of-legends/penalties/away-from-keyboard-afk-faq | 2026-11-04 (page dated June 2, 2026) | "always count as a loss, regardless of whether or not your team is victorious"; queue delays of 1 to 15 minutes; "you will be fully unable to play any of the affected game modes until your penalty has run its course"; longest lockout "2 week queue lockout" (Tier 7) |

The tables were read through the fetch tool's summary, so a browser check of the Honor tables on ship day is worth two minutes.

CHANGED, FAQ answer "Is League of Legends appropriate for kids?" (in both `FAQ_ITEMS` and the visible FAQ):
- Current: "League is rated ESRB Teen for fantasy violence."
- Proposed: "League is rated ESRB Teen for blood, fantasy violence, mild suggestive themes and use of alcohol and tobacco." Change the visible link from `esrb.org/ratings/27518/league-of-legends/` to `esrb.org/ratings/32211/league-of-legends/`.
- Rest of the answer unchanged. Reason: the box would otherwise contradict the FAQ two screens down.

Optional, CHANGED: the post links the honor guide at the old `support-leagueoflegends.riotgames.com/hc/en-us/articles/115008474148-...` address (two places). The new post cites `support.riotgames.com/en-us/league-of-legends/rewards/league-of-legends-honor-guide`. Point both at the new address if the old one redirects or breaks.

---

## C. New post supporting copy (`/blog/how-to-get-your-kid-off-video-games-without-a-fight`)

The body is the v6 copy of record, final. Everything here is an addition.

### C1. Meta description, NEW (pick one)

| Option | Chars | Text |
|---|---|---|
| A | 158 | Count matches, not minutes. Agree on a stopping point before the game starts, watch the finish with them, and keep your words short when it's time to get off. |
| B | 156 | Online team games can't be paused. Set the stopping point before your kid starts, watch the end of the match with them, and skip the lecture if it blows up. |
| C | 157 | The logoff fight often starts before the game does. Ask who they're playing with, set the number of matches together, and walk in to watch the end with them. |

Counted by `len()` in Python. Recommend A: it leads with the post's own line and the pull quote.

### C2. Inbound link sentences, CHANGED or NEW

All four source pages are Karlin's byline, the same as the new post.

**1. `gaming-study-13-7-years-younger-what-it-means-for-kids`, FAQ "How do I get my kid off the game without the attitude?"** CHANGED (second answer string):
- Current: "It's the single most useful thing I've borrowed from sports, and the reason my sessions have a schedule a kid can see."
- Proposed: "It's the single most useful thing I've borrowed from sports, and the reason my sessions have a schedule a kid can see. The full routine is in [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight)."
- Build note: `FAQ_ITEMS.answer` is `string[]` rendered as plain `<p>` text and joined for schema. A link needs the renderer to accept a link in that one answer, and the schema copy keeps plain text. This is the handoff's named inbound link, so the small renderer change is worth it.

**2. `what-your-kids-gaming-is-telling-you`, "Logging off turns into a fight"** NEW sentence after the section's last paragraph:
- Current last sentence: "Telling them apart matters more than winning the argument over the clock."
- Proposed: "Telling them apart matters more than winning the argument over the clock. For the nightly part, here's [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight)."
- This adds a sentence because every way of editing the existing one added a new claim about what works.

**3. `when-gaming-helps-homeschool-kids`, bullet "Give it a goal."** CHANGED:
- Current: "Practicing toward something, a match, a project, a skill, gives the hours a point and a natural place to stop."
- Proposed: "Practicing toward something, a match, a project, a skill, gives the hours a point and a natural place to stop. [Here's how to make the stop stick](/blog/how-to-get-your-kid-off-video-games-without-a-fight)."
- Alternative that edits only: put the link on the existing words "a natural place to stop" (`/blog/how-to-get-your-kid-off-video-games-without-a-fight`). The anchor is weaker for search, but no words change. Recommend the alternative for this page.

**4. `should-i-buy-my-kid-robux`, closing paragraph** CHANGED:
- Current: "Weighing a ban instead? Here's how one family handled Fortnite. For the bigger picture, read what your kid's gaming is telling you, or ask one of our coaches."
- Proposed: "Weighing a ban instead? Here's how one family handled Fortnite. If the fight is about getting off the game, here's [how to get your kid off the game without a fight](/blog/how-to-get-your-kid-off-video-games-without-a-fight). For the bigger picture, read what your kid's gaming is telling you, or ask one of our coaches."

Each page's `DATE_MODIFIED` and its visible "Updated" date move to the ship date, as in Run 1.

### C3. Season 01 link in "Could a gaming coach be the missing piece?" (Jamie decides)

Current last paragraph of that section (copy of record):
> The end of every EKUZO session is on the schedule before anyone logs in, and the coach calls it. What happens after is still your family's plan.

**Option 1, NEW sentence** (added after that paragraph, before "If the fight at your house is about one game in particular..."):
> In [Season 01]({SEASON01_URL}), my coaches run two 90-minute practices a week online, with the same team of five from mid January to May.

**Option 2, CHANGED** (edits the existing first sentence, no new sentence):
> The end of every EKUZO session is on the schedule before anyone logs in (in [Season 01]({SEASON01_URL}), two 90-minute practices a week), and the coach calls it. What happens after is still your family's plan.

Facts: `offer.ts` `practicesPerMonth` comment "Two 90-minute practices a week"; `seasonLabel: "mid January to May 6, 2027"`; join page "Practice 2x a week, 90 minutes each", "Where: Online"; FAQ canon "they play League of Legends on a team of five". No price, as the post has none.

Recommend option 2. It keeps the section's length, sits on the sentence about the schedule, and the parenthesis gives the schedule without selling. Option 1 reads more like an ad in a post the handoff says must never imply EKUZO fixes anything.

### C4. Alt text, NEW

**Hero** (clean version, `get-kid-off-hero-clean.jpg`):
> A boy of about 12 on a gray couch at night, headset on and a controller in his hands, watching a screen out of frame in a lamp-lit living room.

**Hero** (text version, `get-kid-off-hero-text.jpg`, if Jamie picks it; the words on the image belong in the alt):
> A boy of about 12 on a gray couch at night, headset on and a controller in his hands, watching a screen out of frame. Text on the image reads "Heard in every living room" and "I can't pause it."

**Share graphic "Count matches, not minutes"**:
> Graphic titled "Count matches, not minutes," listing where to stop: Fortnite, when the match ends; League of Legends, when the match ends, with no new queue; Marvel Rivals, when the match ends; Super Smash Bros., after any match; Minecraft, at an agreed save point; Roblox, ask "does this save?" and pick the stop together.

The handoff's asset table says four games for the graphic; the post's table has six, and the alt text follows the six. If the graphic ships with four, cut the alt text to match.

### C5. llms.txt entry, NEW

Placement: in the blog list, above the Robux entry (newest first, as the file is ordered).

> - [How do I get my kid off the game without a fight?](https://ekuzo.gg/blog/how-to-get-your-kid-off-video-games-without-a-fight): Karlin Oei's parent guide to ending a gaming session without a fight. Online team games can't be paused, so it recommends counting matches instead of minutes, agreeing on the number before the game starts and watching the finish with your kid, and it gives typical match lengths for Fortnite, League of Legends, Marvel Rivals, Super Smash Bros., Minecraft and Roblox. Cites the American Academy of Pediatrics, Riot Games' leaver and honor rules, a 2025 CHI PLAY study of how children exit play, and a University of Washington survey of 249 families, with a five-question FAQ.

Three sentences, no em or en dashes.

### C6. Social pull quotes, verbatim from the copy of record

1. "Count matches, not minutes."
2. "Dinner's in 35 minutes. A League game takes 45. Starting one is starting the fight."
3. "A plan said at the start is an agreement. The same words at the door land as a surprise."

---

## D. Lint

Run on this file 2026-11-04 (command and output pasted below the line). An em dash, an en dash, or a hyphen with a space on each side all fail. The grep excludes nothing: any hit would be listed.

```
$ LC_ALL=C.UTF-8 grep -nP "\x{2014}|\x{2013}| - | -- " 02-copy-deck.md
256:> - [How do I get my kid off the game without a fight?](
(1 hit in the deck body, before this section was appended; a re-run also matches the command text quoted in this block, which is expected)

$ LC_ALL=C.UTF-8 grep -nP "\x{2014}|\x{2013}" 02-copy-deck.md; echo $?
1  (no em or en dashes)
```

Result: zero em dashes, zero en dashes. The single " - " hit is line 256, the markdown list marker that opens the llms.txt entry (`> - [How do I ...`), which is the format every entry in `public/llms.txt` uses. It is a bullet, not a clause dash. Hyphens elsewhere are compounds or ranges (90-minute, M-rated, five-question).

Banned-vocabulary grep (anti-ai-writing 3A, 3C, 3D, plus "addict") over proposed copy: one hit, line 22, which is the note quoting the existing llms.txt "addiction" wording so it can be removed. No proposed copy uses it.
