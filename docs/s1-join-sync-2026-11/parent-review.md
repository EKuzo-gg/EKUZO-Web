# Parent review: Season 01 email page and ad page (2026-11-05)

Reviewer: "Parent", a fresh-eyes customer pass. I'm a parent of an 11-year-old who games most evenings. I only judged what the pages show. I read no code and no spec.

Setup: local production build. I viewed the email page as the open-season version (the pack file). Analytics were blocked and sign-up POSTs were stubbed, so nothing was saved. Phone: 375x812 with an Instagram in-app user agent. Desktop: 1440x900. Screenshots are in `screenshots/parent-*`.

## 1. What I understood the offer to be

From the email page (`/season1/join`):

- **Today:** $100 to "save their spot". The page calls it the first month, marked down from $160 ("Save $60 off your first month"). The FAQ calls it "the first month deposit".
- **Monthly after that:** $160 a month, "about $20 each practice".
- **Season:** mid January to mid April, with a final tournament in April. The calendar strip shows four payments: Jan $100 (Today), then Feb, Mar and Apr at $160 each. Total $580.
- **What I get:** online coached team practice twice a week, 90 minutes each, with the same coach and teammates all season. Ages 9 to 17, any skill level. The game is League of Legends. The first 100 families who sign up by Nov 30 get a free custom jersey. Coaches are named. Matches run on private, moderated servers. Practices are recorded, I can drop in on any practice, and coaches are background-checked.
- **Safety net:** full refund until a Dec 31 "lock-in". If no team fits my kid, I get every dollar back.
- **Discounts:** siblings get 20% off. If a friend joins with my link, we both get a free month. Four friends means a free season and my $100 comes back.

From the ad page (`/season1`): no price at all. It's a free interest list ("hear first when sign-ups open"). The headline is the jersey with their gamer tag. It says "weekly practice" and the season starts January 2027.

## 2. What confused me or I didn't trust

1. **"January to May" against an April finish.** The payment FAQ says "Full season, Jan to May" and "runs January to May". The same strip shows only four months (Jan to Apr), and the timeline ends mid April. So do I pay for May or not? This sits right next to the money, and it made me doubt the $580.
2. **Is the $100 a deposit or the first month?** The hero says "first month" and the FAQ says "first month deposit". I'm also paying it in November for a January start. I'd want one plain line: "$100 today covers January. Nothing else is charged until February."
3. **When does the $160 start, and how?** No date says when the first $160 is charged, or whether it renews by itself. I also can't see how to cancel after Dec 31.
4. **"Lock-in" isn't explained.** "Full refund until then" is clear. After Dec 31 it isn't clear whether I'm committed to all of Feb to Apr ($480) or can stop month to month.
5. **Practice frequency differs between pages.** The ad says "Weekly practice with a coach". The email page says "2X A WEEK". A parent who sees both will notice.
6. **Coach claims differ between pages.** The ad says "top 1% college esports players". The email page names a head coach who "coached pros at Dignitas and Evil Geniuses". Neither one is wrong on its face, but they read like two different programs.
7. **Same words, two different actions.** "Save their spot" means a free email list on the ad page and a $100 payment on the email page. On the ad page, the blue "Save their spot" button sits right above a green "Save their spot" button. Tapping the blue one just scrolls to the email box, which felt like a wasted tap.
8. **No practice times.** "In the evening, in your time zone" (ad page) is all I get. I can't tell whether this clashes with dinner, homework or soccer, and that's the first thing I'd check.
9. **The "Test mode. No real charges." bar with Phone/Desktop toggles** shows at the top of the email page on both phone and desktop. It may only be in the local preview file. If it ships, I would not pay on a page that says test mode.
10. **The referral maths is fuzzy.** "1 FRIEND = $160 1 FREE MONTH" is clear. "Four friends, free season. We send your $100 back too" leaves me unsure whether the free months come off Feb to Apr or are paid back as a refund.
11. **Tone on the confirmation.** "ACHIEVEMENT UNLOCKED / Parent of the year / +100 XP" is cute once. On my phone the toast covers the "Send this to them" button for a few seconds.
12. **Homepage copy.** When I tapped the logo, the homepage's first step was titled "LEARN TO SKATE" in a gaming program. I was confused for a second.

The page did build trust in these places: the named coaches with faces, the Code of Conduct list, recorded practices plus parent drop-in, background checks, "no public lobbies", the refund until Dec 31, and the money-back promise if no team fits. "Text our founder" with a real number also helped.

## 3. What I'd ask before paying

- What day and time are practices, in my time zone? Can I pick a slot?
- Does the season end in April or May? What exactly will I be charged, and on which dates?
- After Dec 31, can I cancel mid-season, or am I on the hook for the rest?
- Who is my kid's actual coach? The head coach, or a college player?
- How are teams formed? My kid is 11 and new to League. Will they be with 16-year-olds?
- What computer specs does League actually need? Our family laptop is a few years old.
- What does the jersey cost if we're family 101, or if we sign up after Nov 30?
- Is a Discord account needed? Who can message my kid, and how?

## 4. Links and whether each went where I expected

Email page (`/season1/join?src=email...`), phone and desktop:

| Link | Went to | Expected? |
|---|---|---|
| Top nav "Sign up" | `/season1/join/signup?src=email` | Yes, a sign-up page. (It showed "Signups are paused. Text our founder." Per the brief, that is the local setting.) |
| Main button "Save their spot for $100" | Same sign-up page | Yes |
| Sticky bar "Save their spot" (phone) | Same sign-up page | Yes |
| FAQ-end "Join Season 01" | Same sign-up page | Yes |
| End "Text our founder" and the icon link | `sms:+18322710150` opens a text | Yes. It's a Houston number, which is fine. |
| EKUZO logo | Homepage `/` | Roughly. It takes me off the offer to a general page with different language ("Bring your crew", "Learn to skate"). There's no easy way back to Season 01 from there. |

On the paused sign-up page:

| Link | Went to | Expected? |
|---|---|---|
| "‹ Back" and "Back to Season 01" | `/season1/join` | Yes |
| "Text our founder" | `sms:` link | Yes |
| "Join the waitlist" | `/season1` (the ad page with the free list) | Mostly. That page says "hear first when sign-ups open", which fits paused sign-ups. Its headline is a different pitch, though (the jersey), so it felt like a different site. |
| Terms of Service, Privacy Policy | `/terms-of-service#season-01`, `/privacy-policy#season-01` | Yes. Both pages loaded and are dated late October 2026. |

Beyond "paused", the paused page gave me only two choices (text the founder, or join the waitlist). It doesn't say when sign-ups reopen, or whether my jersey spot is held.

Ad page (`/season1?ad=d19...`):

| Link | Went to | Expected? |
|---|---|---|
| Blue "Save their spot →" | Scrolls to and focuses the email box | Partly. I expected it to do the sign-up, but it only moved me down the page. |
| Green "Save their spot" (email) | Confirmation overlay "YOU'RE ON THE LIST / AWESOME." | Yes |
| Bottom "Save their spot" form | Same flow | Yes |
| "ekuzo.gg" footer link | Main site | Yes |
| "Text me, Karlin" (phone number) | "Got it. I'll text you soon. – Karlin" | Yes. It's clear and personal. |
| "Send this to them" | Phone share sheet with "Saw this and thought of you. Real coaches and a team for kids who game." and a link back to `/season1`, then "Thanks for passing it on." | Yes |

## 5. Ad page load (phone, screenshots at 1 s, 3 s, 6 s)

Nothing jumped. The 1 s, 3 s and 6 s frames are identical: hero photo, jersey, headline, button and email box all in place. The only layout shift the browser recorded was tiny (0.0001). This is good.

## 6. Repeat visit (same phone, same email)

After a reload, the page looked brand new, as if I'd never signed up. I entered the same email and got the same "AWESOME. You're on the list" plus the achievement toast again. Nothing said "you're already on the list" or "we already have you". The page also sent a second sign-up. A real parent might wonder whether they'll now get two emails, or whether the first one worked at all. It isn't broken, but a short "Welcome back, you're already on the list" would feel more trustworthy.

## 7. Verdict

**Email page: yes, I'd continue to sign-up, with my finger hovering.** The offer is clear enough: $100 now, $160 a month, a coach and a fixed team twice a week, online, and a refund until Dec 31. The safety and coach sections did the most to win me over. Before typing a card number, I'd text the founder to ask the practice times and to settle the "Jan to May" against April question. If the "Test mode" bar is live, I'd stop.

**Ad page: yes, I'd give my email.** It's free, no commitment, it says so clearly, and the page is calm and stable. I wouldn't yet know what it costs or how often practice is, and "weekly" will clash later with "2x a week".
