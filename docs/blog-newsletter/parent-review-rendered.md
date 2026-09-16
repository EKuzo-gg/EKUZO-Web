> Written before repair cycles 1 and 2. The NOT READY findings on both popup variants (submit unreachable at 375, double ask after a sticky signup, focus escaping the dialog, background scroll) were fixed and verified (defects D6, D7, D9; Steward final parity PASS 13/13). The missing dismiss control on the sticky bar is logged as D12, accepted-risk, backlog candidate.

# Parent review, rendered experience only

Who I am: a parent of a 12 year old who plays a lot of Fortnite and Rocket League. I found this post because someone
sent me the "13.7 years younger" thing. I read the whole post. I am not in marketing and I did not see any code,
spec or plan. Everything below is what actually happened to me in the browser.

How I looked: Chromium at 1440x900 and at 375x812, plus a couple of other phone sizes when something looked tight.
I never submitted a real address. To see what happens after you hand over your email I faked a success response.

Quick note on the article itself, since it sets my mood before any of these boxes show up: the writing is the
reason I would consider subscribing at all. "My first reaction was 'duh.' My second, after I read the paper, was
that the number everyone was repeating isn't in it." Someone telling me the viral number is wrong, in a post whose
whole reason for existing is that viral number, buys a lot of goodwill. The boxes below are spending that goodwill,
so they had better be careful with it.

---

## 1. Bottom bar, thumbs variant

### At 1440

**What I think it is asking, and what happens.** A white strip glued to the bottom of the window that says
"ONE EMAIL TOMORROW, THEN YOU DECIDE TO STAY OR GO." with an email box and a purple "Try it" button. I read that
as: give me your address, you get exactly one email tomorrow, and then you choose whether to keep getting them.
I typed an address, clicked "Try it," and it turned into "GOT IT. LOOK FOR IT TOMORROW." That is exactly what I
expected. No confusion.

"Try it" is the best two words on this page. It is not "Subscribe" and it is not "Join our community." It sounds
like a sample, not a commitment, which is what the sentence next to it promises.

**Does it interrupt at a bad moment.** No. It slid up after I scrolled a little and then it just stayed there.
It is 100px tall out of 900, and it sits on top of the bottom line or two of the article while I read. That is
annoying but not enraging on a big screen, because I read in the middle of the window anyway.

**Does anything feel like a trick, a hard sell or condescension.** The words, no. The behaviour, one thing: there
is no way to close it. Not an X, not a "no thanks," nothing. The only control in that strip is "Try it." I checked:
the strip contains exactly one email field and one button. So the offer is permanent for as long as I am on the
page. It is a polite ask that will not take no for an answer, and "no" is not offered as a thing I can express.

One good surprise: when I scrolled all the way to the end of the article the strip slid back down and got out of
the way of the signup box that lives at the bottom of the post. So it is not fighting itself. Someone thought
about that.

**Would I give my email.** Yes, probably, because "one email tomorrow, then you decide" is a promise small enough
that I can check whether it is true at basically no cost.

**Typos, layout, unfinished.** None at this width. The purple type is loud but it reads cleanly.

### At 375

**What I think it is asking, and what happens.** Same deal, in sentence case: "One email tomorrow, then you decide
to stay or go." with the field and "Try it" stacked underneath. Submitted, got "Got it. Look for it tomorrow."
Clear.

**Does it interrupt at a bad moment.** This is where it starts to bite. The strip is 105px of a 812px screen, so
it takes about an eighth of my phone, and it covers text. While I was reading the "Does the study prove gaming
beats exercise?" answer, the bar was sitting on the line "No. Different associations with different outcomes:
gaming with the cognitive sc..." and I could not read the rest of that sentence without scrolling, because the
sentence was under the bar. On a phone the article does not leave room for the strip, the strip just parks on top
of the words. And I still cannot close it.

**Trick, hard sell, condescension.** Same single complaint, worse here because of the screen share it takes.
Nothing in the wording is pushy.

**Mobile: can I read it, tap it, close it with a thumb.** Read it, yes, though "One email tomorrow, then you decide
to stay or go." is small type, roughly 12px, and it is the sentence that carries the whole promise, so it is the
wrong sentence to shrink. Tap it, yes: the field is 248x48 and the button is 79x48, both comfortably thumbable
at the bottom of the screen where my thumb already is. Close it with a thumb, no, because there is nothing to
close.

**Typos, layout, unfinished.** No typos. Layout holds up, no sideways scrolling anywhere.

**Verdict: READY WITH ONE CHANGE.** Give the strip a dismiss control, a small X on the right or a "not now" link.
Right now the only way to stop being asked is to leave the page, and a thing I cannot decline does not match a
message whose whole selling point is "then you decide."

---

## 2. Bottom bar, classic variant

### At 1440

**What I think it is asking, and what happens.** Same strip, different sentence: "ONE EMAIL A WEEK ON KIDS AND
GAMING, WITH THE SOURCES." with an email box and a "Join" button. I read that as: sign up for a weekly newsletter.
Submitted and it said "YOU'RE ON THE LIST." Correct, and it matches the button.

Honest comparison of the two: this one is clearer about what I am actually getting long term, one a week forever,
and "with the sources" is the phrase that does the work for a parent who just watched a study get mangled on
social media. But "Join" asks for more from me than "Try it" does, and it does not tell me how I get out. The
thumbs version answers "how do I stop" before I ask it. This one leaves it to the small print.

**Does it interrupt at a bad moment.** Same as thumbs. Persistent, 100px, no close.

**Trick, hard sell, condescension.** No trickery in the language. Same no-close problem.

**Would I give my email.** Less likely than the thumbs one, and only because "Join" a weekly is a bigger yes than
"Try it" once. I would want to know how long the emails are.

**Typos, layout, unfinished.** None.

### At 375

**What I think it is asking, and what happens.** Same sentence in sentence case, field and "Join" underneath.
Success reads "You're on the list."

**Does it interrupt at a bad moment.** Same as thumbs at this width: it covers a line of the article and cannot
be closed.

**Mobile.** Readable, tappable at 48px tall, and again not closeable by thumb or any other means.

**Typos, layout, unfinished.** None.

**Verdict: READY WITH ONE CHANGE.** Same change: let me dismiss it.

---

## 3. Popup, thumbs variant

### At 1440

**What I think it is asking, and what happens.** The whole window is taken over by a purple panel with a kid and
some game characters, "THE EKUZO WEEKLY / GAMING MATTERS.", then "One email after you read this. Then you decide."
and a paragraph: "Leave your address and you're on the list today. Tomorrow I'll send one message with a thumbs up
and a thumbs down, and the thumbs down takes you straight off, no questions. Thumbs up and the weekly keeps
coming: what I'm seeing in kids' gaming, sources attached." First name optional, email, and a button that says
"Send me the one email."

I understood it, and I want to say clearly that this is unusually honest copy. It tells me I am on the list
immediately, which most of these do not admit, and then it tells me how to get off in one tap. "No questions" is
the phrase I believe. The button says what the thing does rather than what the company wants.

One small confusion. "Leave your address and you're on the list today" and "Send me the one email" are slightly
at odds. The button suggests I am ordering a single email. The paragraph says I am actually on the weekly list now
and will be taken off if I say so tomorrow. Both are true, and the paragraph is the honest one, but the button is
the thing I read last and the thing my finger touches. If I had only skimmed, I would have thought I signed up
for one email, not for a list with an easy exit. That gap is small but it is the kind of gap that turns into
"I never signed up for this" three weeks later.

**Does it interrupt the article at a bad moment.** Yes, and this is my biggest non-technical complaint. It fired
at roughly 43% down the page, right in the middle of the best paragraph in the post. What was on my screen when
it went black was: "In June a parent emailed me. Her son, who fences and plays lacrosse and flag football, had to
write a sixth-grade entrance essay on his greatest achievement. He wrote about playing" and then the popup landed.
That sentence was two words from its point. The whole reason I was still reading was that story, and it got
interrupted mid-clause to ask me for my email.

**Is the popup easy to close.** Yes, genuinely. The X in the top right is a 40x40 target with a real "Close" label,
and it worked. Escape worked. Clicking the dark area outside worked. Best of all, once I closed it, it stayed
closed: it did not come back when I scrolled further, and it did not come back after I reloaded and scrolled
again. That is the single most trust-building behaviour on this page and it deserves to be said plainly.

Two things go wrong around the popup anyway. First, while it is open, the page behind it still scrolls. I nudged
the wheel and the article underneath moved several thousand pixels, so when I closed the popup I was nowhere near
where I had been reading and had to hunt for my paragraph. Second, if I press Tab twice I am out of the popup and
tabbing through the site navigation behind it, which is invisible under the overlay, so keyboard focus wanders
somewhere I cannot see.

**Does anything feel like a trick, a hard sell or condescension.** The words, no. Nothing talks down to me, and
there is no "are you sure you want to stay uninformed" guilt button, which I appreciate. But one behaviour crosses
from hard sell into disrespect, and it is worth its own paragraph.

I typed my email into the bottom bar. It said "GOT IT. LOOK FOR IT TOMORROW." I kept reading. A minute later the
full screen popup dropped on me and asked for my email again. I had just given it to them, on the same page, and
they told me they got it. Being asked twice in two minutes by a site that literally just confirmed it has my
address is the moment I stopped believing anyone was paying attention on the other end. Everything good about
"then you decide" is undone by a thing that does not notice I already decided.

**Would I give my email.** Yes, on the merits of the words, and the fact that closing it stays closed makes me
trust the whole site more. But I would not give it twice, and being asked twice makes me suspect the promise
about tomorrow is also on autopilot.

**Typos, layout, unfinished.** No typos. One real problem after success: I typed the email, clicked the button,
and the button label flipped to "Got it." for about half a second and then the entire popup vanished. Nothing
was left behind. No line anywhere on the page saying I am signed up, no "check your inbox." If I had blinked, I
would have no idea whether it worked or whether I had accidentally closed it. And the bottom bar carried on saying
"ONE EMAIL TOMORROW, THEN YOU DECIDE TO STAY OR GO / Try it" after I had subscribed in the popup, so the page was
still asking me for a thing I had just given it.

I also tried a failure, by making the server refuse. It said "That didn't go through. Try once more." and left my
typing alone and left the X available. That is a good error message and a good behaviour.

### At 375

**What I think it is asking, and what happens.** Same panel, stacked. And here it breaks.

**The blocking problem.** On a 375x812 phone the "Send me the one email" button runs off the bottom of the screen.
Its bottom edge measured at 819px on an 812px screen, so the button is sliced in half, and the reassurance line
"No spam. Unsubscribe any time, or use the thumbs down tomorrow." is entirely below the edge where I cannot see
it at all. Then I tried to scroll down inside the popup to reach the button, and I could not: the panel does not
scroll. The wheel just moved the article behind it. So on that phone I can see the offer, I can type my email into
the box, and then there is no way to finish. The only complete gesture available to me is closing it.

I checked a shorter phone, 375x667, and it is worse: the button's bottom lands at 747px on a 667px screen. And
none of my measurements include a real phone browser's address bar and toolbar, which eat another 100px or so,
so on an actual handset this is worse than what I measured, not better. I would guess a lot of parents on phones
see a popup they cannot complete and assume the site is broken.

**Does it interrupt the article at a bad moment.** Yes, same mid-story moment, and worse on a phone because a
full screen takeover on a phone is the entire world rather than a panel in a window.

**Is the popup easy to close.** The X worked with a real tap, so yes in the mechanical sense.

**Mobile: can I read it, tap it, close it with a thumb.** Read it, mostly yes, the body text is a comfortable size
and I could read the whole honest paragraph. Tap it, no, see above: the one button that matters is half off the
screen and unreachable. Close it with a thumb, only barely: the X is a decent 40x40 target but it is pinned in the
very top right corner, which is the single hardest spot to reach one handed on a modern phone. I had to shuffle
the phone in my hand. On a full screen mobile takeover I would want the close within thumb range, or I would want
the page tap-anywhere-outside behaviour that exists on desktop but has no outside to tap here.

**Typos, layout, unfinished.** The top of the artwork is cropped: the kid's head is cut off by the top edge of the
screen. Combined with the sliced button at the bottom, the whole panel reads as "nobody opened this on a phone."
No typos.

**Verdict: NOT READY.** Two reasons, either one enough. First, on 375 wide phones the submit button is cut off
below the screen edge and the panel does not scroll, so a parent on a phone cannot actually subscribe from this
popup. Second, it fires at a parent who already subscribed in the bottom bar on the same page and was told "GOT
IT," which is the one behaviour here that reads as not listening. Third, smaller but in the same family, a
successful signup leaves nothing on screen to confirm it.

---

## 4. Popup, classic variant

### At 1440

**What I think it is asking, and what happens.** Same panel and artwork, different words: "For parents of gamers,
once a week." then "One email a week on making gaming count. I coach kids who play, so it's what I'm actually
seeing. Sources attached, no hype." Signed "Karlin Oei, founder, EKUZO." Button: "Join the weekly." Fine print:
"No spam. Unsubscribe any time."

I understood it immediately. It is a plain newsletter signup and it does not pretend otherwise. "I coach kids who
play, so it's what I'm actually seeing" is the line that would make me consider it, because it is a claim about
where the information comes from rather than a claim about how great the newsletter is. "No hype" is a small risk,
because saying "no hype" inside a full screen purple takeover with a hero image is the one place the tone wobbles,
but it is not a lie about the content.

No confusion. It asks for less explanation than the thumbs version because it is offering something more ordinary.

**Does it interrupt at a bad moment.** Yes, identical moment, mid-sentence in the essay story. Same complaint.

**Is the popup easy to close.** Yes. X, Escape and clicking outside all worked, and it stayed gone after reload.
Same praise as above, and the same two flaws: the article behind it scrolls while it is open, and Tab escapes into
the hidden navigation after two stops.

**Trick, hard sell, condescension.** Words, no. Same two behaviour problems: it asks again after the bar already
took my address and said "YOU'RE ON THE LIST," and the confirmation is a half second flash of "You're in." on the
button before the whole panel disappears with nothing left behind.

**Would I give my email.** Maybe. It is a straightforward weekly and the sourcing claim is the appealing part,
but there is no hint of how I get out beyond the fine print, so the thumbs version earns more trust from me for
the same ask.

**Typos, layout, unfinished.** None at this width.

### At 375

**What I think it is asking, and what happens.** Same, stacked, and this one nearly fits. The whole panel is
readable, the artwork is not cropped, and "Join the weekly" is on screen with its bottom edge at 766px on an 812px
screen.

**The problem that remains.** The fine print "No spam. Unsubscribe any time." sits with its bottom edge at 800px
of 812, right on the lip of the screen, and in the screenshot it is visibly clipped by the bottom edge. The one
line that tells me I am not trapped is the line squeezed off the screen. And on a 375x667 phone the "Join the
weekly" button itself is cut off, bottom edge at 694px on a 667px screen, with no way to scroll the panel. So
classic survives one common phone size and fails a shorter one, and once you account for a real browser's address
bar it is not comfortably surviving anything.

**Does it interrupt at a bad moment.** Yes, same place.

**Mobile: can I read it, tap it, close it with a thumb.** Read it yes, apart from the clipped fine print. Tap it
yes on a taller phone, no on a shorter one. Close it with a thumb, same as thumbs: the X is a fine size but it is
in the hardest corner to reach on a full screen mobile takeover.

**Typos, layout, unfinished.** The eyebrow "THE EKUZO WEEKLY" that appears above the logo on desktop is not there
on mobile. Not a problem, just noting it changed. The clipped fine print is the real one.

**Verdict: NOT READY.** Same two reasons as thumbs. The panel does not scroll on a phone, so the fine print is
clipped at 812 tall and the button itself is cut off at 667 tall, and it still fires at someone who already
subscribed in the bar thirty seconds earlier.

---

## 5. Contact form, "How did you hear about us?"

I opened this the way a parent would, from the homepage rather than the blog post: scrolled down, the bottom bar
there offers "Enroll my gamer" and "Talk to Humans," and I clicked "Talk to Humans."

### At 1440

**What I think it is asking, and what happens.** A white card titled "Talk to Humans" with Name, Organization,
Preferred contact method as Email or Text, Email address, "What are you hoping to explore," and at the bottom the
new one: "How did you hear about us?" as a dropdown starting on "Choose one," with "Optional. It tells us where
parents are finding us." underneath. Options: X (Twitter), Instagram, TikTok or YouTube, Google search, ChatGPT or
another AI, A friend or another parent, My kid's school, Other.

I know exactly what this is asking and exactly what it is for, because the helper line tells me, in plain words,
without dressing it up. "It tells us where parents are finding us" is the whole truth and it took eleven words.
The word "Optional" is right there at the front of the sentence, before I have to wonder. It is not marked with
the red asterisk that Name and Email address carry, and I confirmed it will not stop me: it genuinely is not
required. No confusion at all. This is the cleanest thing I looked at today.

The options are the ones a real parent would actually pick. "ChatGPT or another AI" being in there is a small
surprise and an honest one, since that is in fact how people find things now. "A friend or another parent" is
better phrasing than "word of mouth." "My kid's school" is the option that matters for this business and it is
there.

**Does it interrupt at a bad moment.** No. I opened it on purpose. It is the last field before the button, which
is the right place for the question that helps them and not me.

**Is it easy to get out of, does anything feel like a trick.** There is an X at the top right and the card scrolls
properly, which is worth saying because it is exactly what the blog popup fails to do: this modal is capped at
90% of the window height and scrolls inside itself, so the Submit button is always reachable. Nothing here feels
like a trick. Picking "Text" instead of "Email" swapped the "Email address" field out for "Phone number" and
marked it required, which is what should happen and is a nice touch, because it means they are not collecting a
phone number from people who did not ask to be texted.

**Would I give my email.** Yes. This is me starting the conversation, and the form asks for less than I expected.
The "How did you hear about us?" question does not change my answer one way or the other, which is the correct
amount of impact for an optional marketing question.

**Typos, layout, unfinished.** The card is 640px wide and the Submit button was just below the visible edge of
the card when it opened, so I had to scroll a little inside the card to find it. It does scroll, so this is a
nitpick, not a fault. The button says "Submit," which is a bit flat under a heading as human as "Talk to Humans."
"Send it" or "Send to a human" would match the door I just walked through.

### At 375

**What I think it is asking, and what happens.** Identical, stacked into a full width card. The dropdown is a
native phone select, which is the right choice: tapping it gives me my phone's own picker instead of some custom
list, so it behaves the way every other form on my phone behaves.

**Does it interrupt at a bad moment.** No.

**Mobile: can I read it, tap it, close it with a thumb.** Yes to all three. The card scrolls smoothly, the select
is 48px tall and easy to hit, the helper line "Optional. It tells us where parents are finding us." wraps onto
two lines and stays fully readable, and the red Submit button is large and reachable after a short scroll. The X
is at the top of the card, which is a reach, but the card is dismissible by scrolling and tapping unlike the blog
popup, so it did not frustrate me.

**Would I give my email.** Yes, same as desktop.

**Typos, layout, unfinished.** One small cut-off: the Organization field's placeholder is clipped at the right
edge and reads "School, org, or company (optiona" with the closing letters and bracket lost. Not confusing, but
it is visible and it looks unfinished. Nothing else is clipped, and there is no sideways scrolling.

**Verdict: READY.** The new question is clear, honestly labelled, genuinely optional and in the right place. Fix
the clipped "(optiona" placeholder whenever convenient, it is not related to this field.

---

## Summary of verdicts

| Surface | 1440 | 375 | Verdict |
|---|---|---|---|
| Bottom bar, thumbs | good | covers text, no close | READY WITH ONE CHANGE, add a dismiss control |
| Bottom bar, classic | good | covers text, no close | READY WITH ONE CHANGE, add a dismiss control |
| Popup, thumbs | good words, bad moment | submit button cut off, cannot scroll | NOT READY |
| Popup, classic | good words, bad moment | fine print clipped, button cut off on short phones | NOT READY |
| Contact field | clear and honest | clear and honest | READY |

## Things I noticed that apply to more than one surface

1. On phones the popup panel does not scroll, so anything that does not fit is simply unreachable. The contact
   modal on the same site solves this correctly. Copy that.
2. Both popups fire even when I already gave my email in the bottom bar on the same page and was told "GOT IT."
3. A successful signup shows a half second flash of "Got it." or "You're in." on the button and then the panel
   vanishes leaving no confirmation anywhere, while the bottom bar keeps asking for the address it already has.
4. The bottom bar has no way to say no.
5. The article behind an open popup still scrolls, so closing it drops me somewhere I was not reading.
6. Keyboard focus leaves the open popup after two Tab presses and walks through navigation hidden under the overlay.
7. The popup fires mid-sentence in the essay story, two words before the paragraph's point.
8. The popup's X in the very top right corner is the hardest place to reach with a thumb on a full screen phone
   takeover.

## The one thing I would tell the person who built this

Your words are better than almost anything I get asked to sign up for, and "thumbs down takes you straight off,
no questions" is the reason I would actually give you my address. Then the thing asked me for that address a
second time, one minute after telling me "GOT IT," and on my phone it showed me a button I could not reach or
scroll to. So the machinery is currently making a liar out of the copy. Fix the popup so it never appears to
someone who already signed up and so it fits and scrolls on a phone, and this goes from something I would
half trust to something I would forward to the other parents on my kid's team.
