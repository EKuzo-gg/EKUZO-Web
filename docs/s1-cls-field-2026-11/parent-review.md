# Parent review: Season 01 landing on a slow phone

Role: Parent (Build Loop, s1-cls-field). Reviewed the rendered page only, as a parent of a 10-year-old who tapped a Facebook or Instagram ad. Date: 2026-11-09.

Setup as briefed: local build on port 3100 (`/home/claude/wt-atlas`, page meta `s1-build d35ea36`), Playwright phone emulation 412x915 at 2.625x, Facebook in-app browser user agent, CDP throttle (150 ms latency, 200 KB/s down, 93.75 KB/s up, CPU 4x), analytics hosts blocked, every POST to `/api/*` aborted and logged. Evidence folder: `docs/s1-cls-field-2026-11/evidence/parent/` (all screenshot paths below are relative to it). Run log: `evidence/parent/run-log.txt`.

Two notes on method:

- The aborted POST shows the failure state only. To see what a parent sees after a successful sign-up (and so reach the "Text me, Karlin" card), I ran one extra pass on `?ad=d18` where the POST was answered locally with a fake `200 {ok:true}`. Nothing left the machine. Screens: `d18-success-0.png`, `d18-success-after-karlin-tap.png`.
- Production pages (`ekuzo.gg/`, `/season1/join`, `/season1/thanks`) were read with GET only, analytics, Klaviyo and Stripe hosts blocked, any non-GET aborted (none fired). Nothing was submitted.

## 1. First impression at 1 s and 3 s

On this throttled phone every variant had its full first screen painted by the 1 s shot, and the 1 s, 3 s and after-load shots are the same picture. Nothing was blank and nothing moved while I read. Load finished between 3.2 s and 3.6 s. Measured layout shifts before any scrolling were tiny (largest 0.0035 on d18 at 1.6 s, a heading line; d19 0.0014 on the form; d2, d4 and no-ad under 0.001). Caveat: this is a local server, so it does not include the CDN or the real Facebook webview.

| Variant | What I see in the first screen | Shots |
|---|---|---|
| d18 | Real photo of kids in blue team jerseys, "Not a sports kid? Perfect.", one line of what it is, "Find their team" button, then the email form with "free and doesn't commit you to anything". "Season one · 2027" top right. | `d18-1s.png`, `d18-3s.png`, `d18-load.png` |
| d19 | Team walking in jerseys plus a pink and blue jersey reading "GAMERTAG", "Their gamer tag. On a real jersey.", "Youth gaming league · 2027", email form right under it. Matches the ad picture. | `d19-1s.png`, `d19-3s.png`, `d19-load.png` |
| d2 | A boy gaming on a couch, "Which one do you hear the most?" with four quotes to pick from. No email box on the first screen, no date, nothing yet saying what EKUZO is. Picking a quote reveals "Because their team needs them" and an email box. | `d2-1s.png`, `d2-quiz-after-pick.png` |
| d4 | Purple screen, "They tried them all", checkboxes for soccer, baseball, dance, gymnastics, piano. Ticking one crosses it out with a joke ("Bye, 7am Saturday kickoffs") and shows an email box. No date or "what is this" on the first screen. | `d4-1s.png`, `d4-quiz-after-pick.png` |
| no ad | Block-world game art, "They game ~~too much~~ with a coach", "Be the hero" button, email form. | `none-1s.png`, `none-load.png` |

As a parent: d18 and d19 tell me in one glance that this is a team for kids and that I can sign up right there. d2 and d4 are fun to tap, but for the first few seconds I am answering a quiz without knowing who is asking.

## 2. Comprehension

- **What is this?** An online kids' esports team: a real coach, weekly practice and the same teammates all season, playing League of Legends from home. I only learn the game name in the "How a season works" cards, two screens down.
- **What does it cost?** I can't tell. The only money line is the FAQ "Do I pay anything now? This is a free interest list." So the list is free, but I leave without knowing what the season will cost.
- **When does it start?** January 2027 (FAQ, closed by default); the d18 and d19 headers say 2027. d2 and d4 show no date until the FAQ.
- **What do they want from me?** My email, to hear first when sign-ups open.

Things I still wondered after reading the whole page: what age is this for (the page never says), how often practice really is ("weekly"), and what it costs.

## 3. Trust

What made me hesitate:

- No price anywhere, and "Spots for season one are limited" right after "free, no commitment". It reads a little like a pitch when I don't yet know the cost.
- The footer is one line: "EKUZO · Youth esports with real coaches" and a link to ekuzo.gg. No privacy policy link on a page that asks for my email about my kid (`d18-scroll-02.png`).
- I don't see an adult face or a name on the landing page. The coach line in the FAQ is good, but I only meet Karlin after I sign up.
- On d19 I came from an ad that (per `ads.md`) says the jersey is free for the first 100 families. The page shows the jersey but never mentions anything free or a first-100 offer, so I can't tell if I missed it or it isn't real (`d19-load.png`, `d19-scroll-01.png`).

What reassured me:

- "For parents. We only email about EKUZO, and you can unsubscribe anytime."
- The FAQ answers are short and straight: online from home, evenings in my time zone, no driving, coaches background-checked and trained to coach kids, and "you'll meet your coach before the season starts" (`d18-faq-all-open` text in run log, `d18-faq-open.png`).
- "Your kid might play Roblox, Minecraft or Fortnite, and they keep those" answered my real question about the game.
- The d18 photo looks like real kids on a real team, not stock.

## 4. The sign-up moment

- **Empty tap:** red "Check the email address and try again." under the button, email box outlined (`d18-form-empty-submit.png`). Clear.
- **Failed request (POST aborted):** the page stayed put, kept my email in the box, and showed red "That didn't go through. Check your connection and try again." under the button. Same on all five variants, top and bottom forms (`d18-form-after-500ms.png`, `d2-form-after-2000ms.png`, `d4-form-after-2000ms.png`, `d19-form-after-2000ms.png`, `none-form-after-2000ms.png`). Tapping again gave the same message with the email still there (`d18-form-retry.png`). I understood it and I would try again once or twice, since nothing was lost. I would not know whether my first tap had already gone through.
- **Success (mocked locally):** a full screen "You're on the list. Awesome." with "Check your inbox for a note from Karlin, our founder", a "Chat with our founder" card with Karlin's photo and a phone box, "Send this to them" for other parents, and a playful "Achievement unlocked, Parent of the year, +100 XP" (`d18-success-0.png`). Warm and clear. One line read oddly to me: "We can't wait to make screentime the highlight of your day too." It's my kid's screen time, not my day.

## 5. Link-outs

What the landing page links to, as rendered:

- **"Join the list" (mini header button):** stays on the page. It scrolls back up to the top form and puts the cursor in the email box (scrollY 439, focus on `#em-top`; `d18-header-after-tap.png`). Same for the hero buttons ("Find their team", "Save their spot", "Be the hero"; `d18-hero-cta-after-tap.png`). It does not go to ekuzo.gg/season1/join.
- **"Text me, Karlin":** a phone-number form inside the confirmation, not a link. With no number it shows "Check the number and try again. US mobile numbers only for now." (`d18-success-after-karlin-tap.png`). It leads nowhere off the page.
- **Footer "ekuzo.gg":** the only real link out. It opens the main site.

So from the landing page, a parent never reaches `/season1/join` or `/season1/thanks` by tapping. They would reach them later (email, or by typing the URL). I read both anyway, as asked.

**ekuzo.gg home** (`prod-home-top.png`, `prod-home-text.txt`): opens with a popup "Season 01 · waitlist open, join the list" asking for my email again, right after I gave it. Under it, the site talks about "2 ways to play: school or home", "See programs", and the footer lists EKUZO 100, Teams and Camps. As a parent who just joined "Season 01", I am not sure which of these I signed up for.

**ekuzo.gg/season1/join** (`prod-join-top.png`, `prod-join-full.png`, `prod-join-text.txt`): "Free jersey, first 100 families, until Nov 30", "$100 first month" ($160 struck through), "Save their spot for $100", then $160 a month, $580 for the season, practice 2x a week for 90 minutes, ages 9 to 17, timeline late Nov to mid Apr, full refund until Dec 31.

Did it keep the landing page's promises?

- **Price:** the landing said "free, doesn't commit you to anything" and "hear first when sign-ups open". This page is sign-ups, open now, with a $100 charge. Not a contradiction (the list was free), but it is the first time I see any price, and it means sign-ups are already open while the landing and home page still say "waitlist".
- **What Season 01 is:** consistent (coach, same squad all season, online from home). Practice frequency differs: landing says "weekly practice", join says "2x a week, 90 minutes".
- **When it starts:** consistent (mid January). The season end reads two ways on the same page: timeline "Mid Apr, final tournament" and the payment answer "Full season, Jan to May" over a Jan to Apr payment strip.
- **Jersey:** the free jersey and the first-100 deadline are here, which is what the d19 ad promised. The landing page in between never mentions it.

**ekuzo.gg/season1/thanks** (`prod-thanks-top.png`, `prod-thanks-text.txt`): "Got it. Thanks. Thanks, that helps." then a note about matching kids by the games they love and "Next from me ... in two days", signed Karlin. Opened cold, it thanks me for an answer I never gave on this path, so I assume it belongs after a question in an email. It mentions no price, date or jersey, so it neither keeps nor breaks those promises.

## 6. Issues, ranked as a parent would say them

1. "The ad said the jersey is free for the first 100 families, and the page it took me to never says that. I found it later on a different page." **trust** · `d19-load.png`, `d19-scroll-01.png`, `prod-join-top.png`
2. "I still don't know what this costs or what age it's for." **comprehension** · `d18-faq-open.png`, `d18-scroll-01.png` (page text: `d18-fulltext.txt`)
3. "The page says sign-ups aren't open yet, but the main site already has a $100 sign-up with a deadline. Which is it?" **out-of-scope-site-state** · `d18-load.png`, `prod-join-top.png`, `prod-home-top.png`
4. "The floating 'Save their spot' at the bottom of the screen is just white words over the text I'm reading. It doesn't look like a button." **usability** · `d18-scroll-01.png`, `d19-scroll-01.png`, `d2-scroll-01.png`
5. "No privacy policy or company details on a page asking for my email about my kid." **trust** · `d18-scroll-02.png`
6. "On the quiz versions I'm tapping answers before I know who EKUZO is or when this is." **comprehension** · `d2-1s.png`, `d4-1s.png`
7. "It says weekly practice here and twice a week on the sign-up page." **comprehension** (cross-page) · `d18-scroll-01.png`, `prod-join-full.png`
8. "When the sign-up fails it tells me to check my connection, which is clear, but I can't tell if my first try went through." **usability** · `d18-form-retry.png`
9. "I signed up, tapped ekuzo.gg, and got asked for my email again, then a site full of other programs (school, camps, EKUZO 100)." **out-of-scope-site-state** · `prod-home-top.png`, `prod-home-text.txt`
10. "'Find their team' sounds like it will find a team, but it just scrolls me to an email box." **usability** · `d18-hero-cta-after-tap.png`
11. "'Make screentime the highlight of your day' is about my day, not my kid's." **comprehension** · `d18-success-0.png`
12. "The sign-up page says the season is Jan to May in one place and ends mid April in another." **out-of-scope-site-state** · `prod-join-text.txt`

Server: started as briefed; the PID file held the wrapper shell (28558), which I killed, then killed its `next-server` child by its own PID (28565). Port 3100 confirmed closed.
