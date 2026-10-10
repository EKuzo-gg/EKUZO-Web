# Steward review: Season 01 ads, landing page and site popup

Reviewer: Steward (brand, offer and claims). 2026-10-10. Finds only; no copy was edited.
Copy owners: Aaron (ads, landing, popup) and Jamie (offer and claims). Each finding ends with the
smallest fix wording to propose to them.

Reviewed:
- Landing `public/roadshow/landing.html` (shared sections lines 757 to 832; per-ad hero `D` lines 838 to 949; per-ad bridge and module `T` lines 951 to 976)
- Popup `lib/seasonOne.ts` (`SEASON_ONE_COPY`) and `components/ui/SeasonOnePopup.tsx`
- Ad copy `EKUZO/Marketing/ads/2026-10-season-one/creative/copy.md` and `creative/contact-sheet.png` (all 24 files)
- Screenshots `landing-d1/d3/d4/d10-*-fontfix.png`, `landing-d3-*-confirm.png`, `popup-*.png`

Sources: FAQ canon (`company/knowledge/ekuzo-faq-canon.md`), messaging voice
(`ekuzo-messaging-voice.md`), brand positioning, JTBD (`ekuzo-jobs-to-be-done.md`), safety doc,
fact library, Meta playbook "Policy rules for our ads" (`marketing/channels/meta-ads.md` line 219),
Aaron's brief (`2026-10-season-one/aaron-claude-brief.md`), and Jamie's launch facts of 2026-10-10.

## Verdict: BLOCK (for paid spend)

The page structure, the offer framing (free waitlist, no payment now) and the voice are mostly sound,
and there are no em dashes, no health claims and no "your kid" next to a worry in any ad. Four items
must clear before money goes behind the ads:

1. ST-1: real children's photos in 9 of 12 ads with no parent release on file, and one photo shows Boys & Girls Clubs of Boston jerseys.
2. ST-2: ads tell parents it is "the same game" their kid already plays, and the d1 art (also the page's default hero) is Minecraft-style block art, while the program is League of Legends only.
3. ST-3: every landing variant promises "a jersey with their gamer tag"; the KB lists jerseys only as a proposed idea.
4. ST-4: "Spots for season one are limited" plus "Save their spot" is unsupported scarcity and implies a held spot.

ST-3 clears with one line from Jamie. ST-1 clears with release confirmations and one photo swap.
ST-2 and ST-4 are wording changes. The site popup on its own (ST-4 wording aside) could ship.

## Claims check

| Claim (where) | Status | Evidence |
|---|---|---|
| "Season one starts in 2027" (FAQ, popup banner), "SEASON ONE · 2027" (d3, d5, d11) | SUPPORTED | Jamie 2026-10-10: season begins January 2027; brief: week of 2027-01-04. Consistent everywhere as "2027"; nowhere says January (ST-11) |
| "Spots for season one are limited" (landing line 801) | UNSUPPORTED | No cap stated anywhere; messaging voice line 111 bans "artificial urgency or scarcity" (ST-4) |
| "Save their spot" (CTA on landing, popup, d6, d9, d11) | UNSUPPORTED as worded | Waitlist holds no spot; the page itself says it "doesn't sign your kid up for anything yet" (ST-4) |
| "real coach" (all ads, landing) | SUPPORTED | FAQ canon "Who are the coaches?" line 25; Jamie: coaches are collegiate esports players |
| "Experienced players who are trained to coach kids" (FAQ, line 795) | SUPPORTED | FAQ canon line 25: "trained in gameplay, pedagogy, safety, and social-emotional growth" |
| "You'll meet them before the season starts" (line 795) | UNSUPPORTED (sources conflict) | FAQ canon line 119 mentions a "meet-the-coach video"; JTBD line 405 lists "Coach intro video" as Proposed, not committed (ST-5) |
| "They play League of Legends with the same teammates all season" (line 783) | SUPPORTED | Canon line 305 (League); canon lines 131 and 158 (same teammates across a season). Caveat: canon line 68 allows moving a gamer to a better-fit group |
| "A real coach runs every practice" (line 782) | SUPPORTED | Canon line 29: "Every session is coach-led and recorded" |
| "a jersey with their gamer tag" (line 784, every variant; all of d11) | UNSUPPORTED | JTBD line 407: "Welcome Kit (jersey) ... Proposed". EKUZO jerseys exist in photos (d4, d5) but no source commits one per Season 01 player (ST-3) |
| "Free, no commitment" / "doesn't commit you to anything" | SUPPORTED | Jamie 2026-10-10: free waitlist |
| "We only email about EKUZO" (line 770) | UNSUPPORTED in KB, within our control | A promise about the Klaviyo list; Aaron's flows must keep it (ST-19) |
| What parents pay later | Not stated | "Do I pay anything now? No ... not ... yet" is honest; no price is claimed |
| "Online, from home. No driving, no cleats, no parking." | SUPPORTED | Canon line 59 (Home track, evening); brief |
| "The coach calls time" / "The coach ends it" (d1 module, d6) | SUPPORTED | Canon line 109: "The coach ends the session, not you" |
| "A coach sets the goal for each practice and reviews how it went" (d1 module) | SUPPORTED | Canon line 112: coaches "review matches, set learning goals, run team practices" |
| "the coach tells you how they're doing on each" every week (d7 bridge); letter grades A, A, A+ (d7 ad) | PARTLY SUPPORTED; grades UNSUPPORTED | Canon line 119 "post-session parent note", line 137 "Personal Scorecard"; JTBD line 404 lists the weekly parent recap as Proposed (ST-6) |
| "Same game ... Now with a coach and a team" (d8), "in the game they already love" (d1, d5, d7), "Play their game" (d2) | CONTRADICTED | Landing FAQ line 793 and canon line 305: the game is League of Legends (ST-2) |
| "Problem solving, teamwork and staying calm under pressure. They're already building them in the game" (d10 primary text 1) | CONTRADICTED in part | Messaging voice line 256: regulation gains are "a claim about structured play only" (ST-10) |
| Safety | No claims made | Nothing to contradict; a gap, see ST-13 |
| Outcomes | Mostly process, not outcome | Exceptions: d2 module quotes (ST-9), d3 ad "makes them better ... wins together" (ST-15) |

## Findings

### ST-1 CRITICAL: real children shown without a release on file, and a partner's marks in frame

- **Text and where:** the ad registry `copy.md` marks d3, d4, d5, d6, d7, d8, d9, d11 and d12 "real-kid photo release: Needed". Only d10 is "Yes, on file". The landing page embeds every photo (`IMG` map, line 835) in every variant, so all of them load on every visit, including the `?ad=` fallback.
- **Partner marks:** in d3 (`boys-girls-club` photo) the boys wear jerseys reading "BOYS & GIRLS CLUBS OF BOSTON", readable in the feed and story files. That implies an endorsement we don't have.
- **Registry conflict:** d2 lists the `couch` photo as "AI imagery: Yes; No real kids". d6 and d8 list the same photo as "AI imagery: No; release Needed". One of those is wrong. If the photo is AI, d6 and d8 need the AI tick. If it is real, d2 needs a release.
- **Evidence:** Meta playbook line 227: "Real kids only with a parent photo release, no partner logos." Brief: "Real kids appear only with a signed parent photo release on file and no partner logos in frame"; "anything using a real kid's face or name" needs Jamie first.
- **Fix:** Aaron updates the registry row by row. A photo with no signed release comes out of the ad and out of the landing `IMG` map. d3 gets a new photo (or the jersey text is fully obscured). Until the releases are confirmed, only d10 (and d2, if the couch photo is confirmed AI and the AI box is ticked) are clear on this point.

### ST-2 CRITICAL: "same game" and Minecraft-style art promise a game we don't run

- **Text and where:**
  - d8 on-image "Same game. Now with a coach and a team."; d8 primary text "Same game they play every night"; landing d8 bridge "Same game" / "Same game they play every night" (line 967).
  - d1 backdrop: AI block world in recognizable Minecraft grass and dirt block style ("Minecraft blocks (Aaron's image)", line 839). It is the d1 ad, the d1 landing hero, and the hero for any missing or unknown `?ad=` (line 978).
- **Contradiction:** the same page answers "What game do they play? League of Legends" (line 793). Canon line 305: "EKUZO trains on League of Legends." Jamie 2026-10-10: League is the flagship game today.
- **Risk:** most parents in a broad US audience have a Roblox, Fortnite or Minecraft kid. "Same game" is a false product claim to them, made in paid media. The block art also swaps one game's IP for another (the brief removed League art from d1 for the same reason).
- **Fix:**
  - d8 ad and bridge: "Screen time. Now team time." with sub "Now with a coach and a team." Drop "Same game" and "they play every night".
  - d1: replace the block-world backdrop with a non-game image (the `kid-couch` or `team-walk` photo is already in the file) in both the ad and the landing hero and fallback.

### ST-3 CRITICAL: jersey with gamer tag promised on every variant

- **Text and where:** "A schedule, a jersey with their gamer tag and something real to talk about at dinner" (line 784, all 12 variants). Also the d11 concept: "A coach, a team and a jersey with their name on the back"; bridge "Their name on the back" (line 974).
- **Evidence:** the only KB source is JTBD line 407, "Welcome Kit (jersey): Physical jersey shipped to enrollees ... Proposed". This is a physical, per-child cost promised to every lead.
- **Fix:** Jamie confirms in one line that Season 01 includes a jersey with each player's gamer tag. If he doesn't, line 784 becomes "A schedule, a team name and something real to talk about at dinner", and d11 is pulled from round one.
- **Also:** in d11, "their name on the back" (copy) and "gamer tag" (headline) disagree. Use "gamer tag" in both so it doesn't suggest a child's real name.

### ST-4 CRITICAL: unsupported scarcity and an implied reservation

- **Text and where:** "Spots for season one are limited. The list hears first." (landing line 801). "Save their spot" appears on landing buttons (lines 768, 806, sticky 815, default CTA line 991), popup CTA (`SEASON_ONE_COPY.cta`), the popup's `<h2>` path via the landing H2 "Save their spot for season one." (line 762), and the d6, d9 and d11 image buttons.
- **Evidence:** messaging voice line 111 bans "Artificial urgency or scarcity"; line 59: "We avoid urgency, fear, and exaggeration." No capacity number exists. The waitlist reserves nothing; the FAQ itself says joining "doesn't sign your kid up for anything yet".
- **Fix:**
  - Line 801: "The list hears first when sign-ups open."
  - CTA: "Join the waitlist" (or "Get on the list", which already matches the header's "Join the list").
  - H2: "Get them on the list for season one."
  - Image buttons on d6, d9, d11: "Join the list →".

### ST-5 MAJOR: "You'll meet them before the season starts"

- **Where:** landing FAQ "Who are the coaches?" (line 795).
- **Evidence:** the sources disagree. Canon line 119 names a "meet-the-coach video". JTBD line 405 lists "Coach intro video" as Proposed. No Season 01 plan commits to a pre-season meeting.
- **Fix:** use the approved wording instead: "College esports players who are background-checked and trained to coach kids." Keep "You'll meet them before the season starts" only if Jamie confirms a coach intro will happen. "Background-checked" is approved (canon line 25; messaging voice line 195) and answers the parent's first question.

### ST-6 MAJOR: d7 letter grades and weekly reports to parents

- **Text and where:** d7 image "SCREEN TIME, GRADED. TEAMWORK A / TALKING IT THROUGH A / SHOWING UP A+"; "A coach tracks what they learn every week." Landing d7 bridge: "Feedback from a coach, every week ... the coach tells you how they're doing on each" (line 966).
- **Evidence:** canon line 119 (post-session parent note) and line 137 (Personal Scorecard) support some feedback. JTBD line 404 lists the weekly parent recap as Proposed, and automated session evaluation for parent updates is still a goal, not a built system. Nothing supports letter grades.
- **Fix:** Jamie confirms parents get a note after each week in Season 01. If he does, keep the bridge and add "No letter grades; it's a picture of what they practiced" under the d7 hero, or change the image grades to checkmarks. If he doesn't, use bridge "Each practice works on teamwork, talking it through and showing up, and the coach gives feedback on each." and hold d7.

### ST-7 MAJOR: "the game they already love" and "Play their game" imply any game

- **Where:**
  - d1 bridge "around the game they already love" (line 952)
  - d5 image and primary text "in the game they (already) love"; bridge "They already love the game" (line 964)
  - d7 primary text and bridge "In the game they already love" (line 966)
  - d2 button "Play their game →"
  - d10 "They just happen to love this one" (line 969)
- **Evidence:** same as ST-2. These lines are softer, but for a Fortnite family they read as the same promise. Canon line 64 has the honest answer ("League ... teaches those skills"); none of the variants carry it.
- **Fix:**
  - Add one line to the top sign-up block on every variant: "Season one is played in League of Legends, a free team game." Then "the game they already love" can stay for League families.
  - d2 button: "Find their team →".
  - Optional: move the "What game do they play?" FAQ to the top of the list.

### ST-8 MAJOR: equipment requirement missing while visuals show console controllers

- **Where:** d2, d6 and d10 show a kid on a couch with a console controller. So does the popup photo (alt "A kid on the couch with a controller"). The landing never says a computer is needed.
- **Evidence:** canon line 39: "A computer (PC or Mac) that can run League of Legends ... and a headset with a microphone." League has no console version.
- **Fix:** landing FAQ "Where does it happen?" becomes "Online, from home, on a PC or Mac with a headset. No driving, no cleats, no parking." The imagery can stay once the page says this.

### ST-9 MAJOR: "Parent-free league" and invented kid quotes

- **"Parent-free league":**
  - Where: d9 on-image tag; landing d9 kicker "The parent-free league" (line 968).
  - Problem: the intended joke is "no driving". But to a parent worried about kids online, "parent-free" reads as unsupervised. That contradicts canon line 32 (the parent owns the account and can see every channel) and the safety pillar. "League" also claims a structure that Season 01 has not defined.
  - Fix: d9 tag "No-drive practice"; kicker "The practice you don't drive to".
  - Same note, MINOR: d4 "ESPORTS LEAGUE" becomes "ESPORTS TEAM".
- **Invented kid quotes ("What you'll hear instead", d2 module, lines 958 to 961):**
  - Text: "We ran the play we practiced and it worked", "Coach says we're ready for the match", "I was shot caller tonight. Everyone listened to me."
  - Problem: these are invented quotes presented as a promise of what the parent will hear. Messaging voice line 57: "Don't manufacture or composite a scene". The brief: no outcome claims we can't show.
  - Fix: relabel the kicker "What practice can sound like". Drop "Everyone listened to me", or swap in real lines from `public/testimonial-videos/*.txt` with attribution.

### ST-10 MAJOR: d10 primary text 1 claims gaming already builds calm under pressure

- **Text:** "Problem solving, teamwork and staying calm under pressure. They're already building them in the game they love."
- **Evidence:** messaging voice line 256: unsupervised ladders "plausibly train the opposite (tilt, blame). Regulation gains are a claim about structured play only." The Learn directive ("amplify what's already there") covers problem solving and teamwork, not regulation.
- **Fix:** "Problem solving, teamwork and talking it through. A real EKUZO coach turns the hours they already play into practice." (This matches the d10 image line.)

### ST-11 MINOR: "2027" without the month, and the season's name varies

- "Season one starts in 2027" (line 791) and the popup banner "Season 01 starts in 2027" are accurate. In October 2026, though, "2027" can read as late 2027.
  - Fix: "Season one starts in January 2027." in both. The ad images can keep "2027".
- The name varies: "Season 01" (primary texts, popup kicker and nav CTA), "SEASON ONE" (images), "season one" (landing).
  - Fix: pick one per surface type. Suggested: "Season 01" on the site and in texts, "SEASON ONE" on images.

### ST-12 MINOR: no age range anywhere

- **Problem:** the landing and popup never say who the program is for. Asking about games instead of age (Aaron's call) is fine, but the page should still name the range so parents of 6-year-olds don't fill the list.
- **Evidence:** canon line 71: ages 10 to 17, core 10 to 13. Stating the program's range is not a personal-attributes issue; implying the viewer's child's age would be.
- **Fix:** add a FAQ, "Who is it for? Kids ages 10 to 17, grouped by age and skill."

### ST-13 MINOR: no safety line on a parent page

- **Problem:** nothing is wrong, but safety is a rung of the positioning ladder (brand positioning line 68) and parents' first question. The approved wording is meant for landing pages (messaging voice line 195).
- **Fix:** add a FAQ, "Is it safe? Every session is coach-led and recorded. Teams are private, the parent owns the account, and kids play with the same known teammates." Every element is from canon lines 29 and 32. Add nothing beyond them.

### ST-14 MINOR: popup headline reads backwards to screen readers

- **Where:** `SeasonOnePopup.tsx` lines 36 to 45. The strike is a decorative span, so assistive tech reads the `<h2>` as "They game too much. With a coach.", which says EKUZO adds more gaming.
- **Fix:** add `aria-label="They game. With a coach."` to the `<h2>`, or an sr-only "(crossed out)" after "too much." This is Aaron's code, not copy, and is listed here because it changes the message.

### ST-15 MINOR: ad-only promises the page doesn't repeat

- The brief requires every ad claim to appear on the landing page.
  - d3 primary text: "a coach who makes them better and a team that wins together". The page says "helps them get better" and promises no wins.
    - Fix: "a coach who helps them get better and a team to win with".
  - d5: "THE TEAM SPORT THEY'LL ACTUALLY SHOW UP FOR" predicts behavior and hints at a kid who quits things (messaging voice line 116: don't blame the child's character).
    - Fix (optional): "The team sport that expects them every week."

### ST-16 MINOR: d12 and d6 tell different stories about when practice ends

- d12's punchline is "Sorry! Practice is going over." But d6, the d1 module and the d6 bridge promise "Practice has a start and an end, and the coach runs both". Read together, d12 says practice runs into dinner.
  - Fix: d12 bubble "Practice just ended! Be there in a minute." with headline "The best excuse you'll ever hear." kept.
- d6 "No doorway argument" is stated as an absolute. Canon line 106 says "many parents report ... fewer transition fights".
  - Fix (NIT): "Practice has a start and an end, and the coach calls both."

### ST-17 MINOR: confirmation tone

- "Achievement unlocked: Parent of the year" (line 829). In everyday US use the phrase is often sarcastic.
  - Fix: "Achievement unlocked: Joined the team".
- "We can't wait to make screentime the highlight of your day too" makes screen time the parent's highlight.
  - Fix: "We can't wait to make their screen time the highlight of their week."

### ST-18 NIT: spelling and small style

- "screentime" (d1, d2, popup, confirmation) vs "screen time" (d7, d8, d10, landing). Use "screen time" everywhere.
- d1 image "a coach, a team, and a mission" uses an Oxford comma; the rest of the copy doesn't.
- d1 button "Be the hero →" leans toward a rescue narrative (messaging voice line 111). Optional: "Find their team →".

### ST-19 NIT: third-party marks and promises to confirm

- The popup photo's kid wears Messi-branded kit (shorts and shirt). It is not a partner logo, but it is a brand in frame. Fine to keep; note it in the registry.
- "We only email about EKUZO" (line 770): Aaron's Klaviyo flows must keep this promise. Keep the line only if no co-marketing is planned.
- Optional FAQ line: "Season pricing goes to the list before sign-ups open."

### Dash and policy sweep (pass)

- **Dashes:** no em dashes or en dashes in visible copy in the landing page, popup copy or ad copy. The only en dash glyph in the landing page is the FAQ open marker in CSS (line 682, `content:` on `summary::after`). It renders as a collapse symbol, not prose, so it is acceptable (NIT: a minus sign or rotated plus would avoid the character). The two em dashes in `SeasonOnePopup.tsx` (lines 12, 247) are code comments, not visible.
- **Meta personal attributes:** no "your kid" in any ad. The landing FAQ's "doesn't sign your kid up" is not next to a health or anxiety word. "They game too much" is third person and struck through. No health claims, no addiction language, no age implied.
- **Minors:** every form says "For parents". The game chips ask about the child, but the brief and requirement T4 keep that data in Klaviyo and away from Meta.
- **d12 text thread:** reads as a designed illustration (no phone frame, badges, names or numbers), per the brief.
- **Voice:** sentence case and no hype words. The negative-parallelism count is within the one-per-ad allowance (d1's "Alone in their room / With a team" module is a cross-off device, not a stacked "not X, it's Y").

## Ad to landing consistency (d1 to d12)

| Ad | Ad promise | Landing variant | Match |
|---|---|---|---|
| d1 | Coach, team, "mission to win", game they love | Same art, bridge "They're going to play anyway", cross-off module | Matches; inherits ST-2 (art), ST-7 |
| d2 | "I can't pause it", weekly practice, same teammates | Same art, bridge matches, "What you'll hear instead" | Matches; ST-9 quotes, ST-7 button |
| d3 | Play to win, coach "makes them better", team "wins together" | Bridge "Give them a team to win with", "helps them get better" | Softer on page (ST-15); ST-1 photo |
| d4 | "Every kid needs a team", "Esports league", online with a real coach | Bridge repeats the primary text | Matches; "league" (ST-9) |
| d5 | Team that expects them weekly, game they love | Bridge matches | Matches; ST-7, ST-15 |
| d6 | Coach ends it, no doorway argument | Bridge "The coach calls it, not you" | Matches; ST-16 |
| d7 | Graded screen time, weekly tracking | Bridge "Feedback from a coach, every week" | Matches; claim needs confirming (ST-6) |
| d8 | "Same game", now with team | Bridge "Same game" | Matches each other, contradicts FAQ (ST-2) |
| d9 | No drive, cleats, parking; "Parent-free league" | Bridge matches | Matches; ST-9 |
| d10 | Be proud, skills, real coach | Bridge and skills module | Matches; ST-10 is ad-only |
| d11 | Gamer tag on a real jersey | Bridge "Their name on the back" | Matches; claim unsupported (ST-3), name vs tag |
| d12 | Best excuse, practice going over | Bridge "a reason to log off on time" | Matches; internal tension (ST-16) |

The URL template in `copy.md` sends each ad to its own `?ad=dN`. Every `dN` has a `T` entry, so no
ad falls back to d1 by mistake.
