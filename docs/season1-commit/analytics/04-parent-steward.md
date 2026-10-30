# Season 01 analytics: Parent and Steward review

Parent (screenshots only) then Steward (brand and claims). Review only, no code touched. 2026-10-30.

## Part 1. Parent: what I see on my phone

Evidence: `evidence/atlas/signup-busy-390.png`, `signup-busy-1440.png`, `signup-in-progress-390.png`,
`signup-in-progress-1440.png`. Read before any source or spec.

**Busy (button reads "Still saving. Please stay here." with a spinner).** I tapped "Save their spot"
and the page is working on it. The lime button with a spinner feels alive, and "Please stay here" tells
me not to hit Back. I would wait, and I would not tap again (it looks locked). Nothing reads as an error
or a charge. "Saving" matches the button I tapped, so I connect it to my kid's spot, though I am not
told whether my card is being charged yet. For a few seconds that is fine. Trust: good.

**In progress (same button, plus a red line "Your payment is already going through. Taking you to your
confirmation to check on it.").** Three signals disagree. The button still says "Still saving", the
words say my payment is underway, and the red color says something went wrong. Red text under a pay
button reads to me as "you were charged twice" or "you did something wrong", and "already" sounds like
I am being told off for tapping again. "To check on it" makes me wonder whether it worked. I would not
hit Back now, but I would screenshot this and text the founder. Trust drops from good to uneasy, almost
entirely because of the red.

**Not visible in these shots.** No card field or wallet button appears, so I cannot judge whether the
payment area looks frozen while busy.

## Part 2. Steward: strings, voice, claims, privacy

Strings vs `03-copy-deck.md` (recommended A options), grepped in `app/season1/join/signup/signup.html`:
String 1 matches at line 441 (`BUSY_LINE`), String 2 at line 461 (`IN_PROGRESS_MSG`), String 3 at
lines 466 to 467 (apostrophe written as `'`, renders as the deck's straight apostrophe; link text
"Text our founder" then a period). The screenshots show Strings 1 and 2 exactly. All three match word
for word.

Voice lint (anti-ai-writing.md, voice-dna.md loaded from the KB): 0 em dashes, en dashes or clause
hyphens; 0 negative-parallelism reframes; 0 hard or soft banned words, phrases or transitions; 0
exclamation marks; sentence case. Pass.

Charge-state claims: Strings 1 and 3 claim no charge state. String 2 is true when the server answers
409 `in_progress` (the commit route checks the PaymentIntent is in flight, route.ts lines 338 to 352).
It can be false on the client fallback: `commitNext` returns `welcome` for any commit error once
`s1_confirmed_<attempt>` is set, and that flag is set before `confirmPayment` and never cleared. A
parent whose card was declined and who then hits `rate_limited`, `try_again`, `price_changed` or
`closed` on the same attempt is told "Your payment is already going through" when nothing is.

Privacy: section 16 of `app/privacy-policy/page.tsx` still says partners receive "a parent's hashed
email and purchase information", and section 8 does not name the tools. The build now also sends IP
address, user agent and fbp/fbc via Meta CAPI, and loads GA4, Pixel and Clarity in the browser. The P2
lines (02-resolution.md) are mostly accurate, with four gaps: tags also run on `/season1` (landing:
GA4, Pixel, Clarity) and `/season1/thanks` (GA4, Clarity), so "on our sign-up pages" is narrower than
the build; IP address is sent but not named; the kid count goes to Meta (`num_items`) and GA4
(`kids_count`), and `season1_age_outside` signals an out-of-range age, so "never share a child's
information" is broader than the build supports; Clarity masks typed inputs, but whether it masks the
chosen value of the kid age `<select>` is unverified.

## Findings

1. **Major. Atlas.** The in-progress line uses the red `.err` style in `#formErr` (role alert,
   assertive). Restyle it as a neutral status (ink text, or the existing stone `.note` box) and send it
   to the polite `#liveErr` status region, so color, words and screen reader all say "working".
2. **Major. Story (routing fix for the builder).** String 2 can claim a payment in progress after a
   decline (see claims above). Either route the client fallback (`cf` true, no `in_progress`) to a
   neutral line such as "Checking on your payment. Taking you to your confirmation." or only show
   String 2 on a real 409 `in_progress`. Recommend both: keep String 2 for 409, neutral line otherwise.
3. **Major. Jamie.** Ship P2 with this release; the live section 16 understates what partners receive.
   Proposed section 16 wording: "Advertising and analytics partners receive a parent's hashed email,
   IP address, device and browsing information on our Season 01 pages, and purchase information,
   including how many kids are on the order. We never share a child's name or age with them."
4. **Minor. Atlas.** Confirm in a Clarity recording that the kid age `<select>` value is masked; if
   not, add `data-clarity-mask` to `.ag`. Finding 3's "name or age" line depends on it.
5. **Minor. Atlas.** String 2 shows for 1.5 s before the redirect. At 15 words that is too short to
   read on a phone (about 3 to 4 s). Hold about 3 s, or accept that welcome carries the message.
6. **Minor. Story.** "Already" and "to check on it" read as blame and doubt to a parent. Optional
   softer String 2: "Your payment is on its way. Taking you to your confirmation." Keep A if Jamie
   prefers the deck's reasoning; the red style (finding 1) is the bigger cause.
7. **Minor. Atlas.** Recapture the busy shots with the card field or wallet button in frame, so the
   frozen state of the payment area can be judged.
8. **Minor. Jamie.** P1 stays open: Microsoft's FAQ says Clarity should not run on sites aimed at
   under-18s. The policy lines disclose Clarity but do not settle whether to run it on a youth brand.
