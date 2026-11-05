# Steward review: Season 01 round 2 (claims, offer, voice)

Date: 2026-11-05. Reviewer: Steward. No code or canon edited.

Sources checked: `lib/schema.ts` lines 734 to 801 (join builder), `lib/season1/offer.ts`,
`docs/s1-round2-2026-11/evidence/atlas2/live-ekuzo.gg.jsonld.json` and `live-ekuzo.gg.seo-block.txt`
(captured live render), `app/terms-of-service/page.tsx` section 23 (lines 248 to 295),
`app/api/season-one/route.ts`, `app/season1/landing.html`, `app/season1/join/b/join-b.html`,
`lib/season1/welcomeCopy.ts`, `public/llms.txt`, and on Jamie's computer
`company/knowledge/ekuzo-faq-canon.md`, `system/methodology/anti-ai-writing.md`,
`company/knowledge/ekuzo-messaging-voice.md` (loaded before judging copy).

## Item 1. JSON-LD and meta description on /season1/join: CHANGE (small)

What renders (captured live, matches the builder): Course "EKUZO Season 01", description = meta
description, provider `{"@id":"https://ekuzo.gg/#organization"}`, courseMode online, Offer price 580
USD, Offer description "$100 today covers January, then $160 a month February to April",
availability InStock (SoldOut once closed), validFrom 2026-10-26T00:00:00-05:00, validThrough
2026-12-31T23:59:59-08:00. Meta: "Season 01 is EKUZO's coach-led youth gaming league for ages 9 to 17.
Two 90-minute online practices a week with the same coach and team, mid January to May 6, 2027. $100
today covers January, then $160 a month February to April."

Checked and correct:
- $100 / $160 / $580 / USD: offer.ts firstKidCents, monthlyCents, seasonCents, currency. 100 + 3 x 160 = 580.
- "covers January": offer.ts firstMonthLabel; ToS 23.1 "pays for month one".
- Ages 9 to 17: offer.ts ageCopyMin/Max; canon line 81 (9 to 17 since 10-29).
- Two 90-minute practices a week: offer.ts comment; canon draft; llms.txt.
- Mid January to May 6, 2027: offer.ts seasonLabel; ToS 23.2 "the week of January 18 to May 6, 2027".
- validThrough = closeAt = lockInAt (Dec 31, 2026, PT); route is force-dynamic with no-store, so availability is computed per request and will not go stale.

Problems:
1. Dangling provider. The page is a route handler outside `app/layout.tsx`; the captured HTML has no
   Organization node (only Course, Offer, BreadcrumbList). The `@id` resolves to nothing in this
   document, so a parser sees a provider with no name. Replace with an inline node:
   `provider: { "@type": "Organization", "@id": ORG_ID, name: "EKUZO", url: "https://ekuzo.gg" }`
2. Per kid is unstated. A parent of two asking an AI "how much is EKUZO Season 01" gets "$580" and
   "$100 today" with no sign the price is per kid or that siblings are 20% off (ToS 23.1, offer.ts
   siblingCents 8000). Not false, but the most likely misread. Replacement for `joinOfferDescription()`:
   `$100 today covers January, then $160 a month February to April, per kid. Siblings are 20% off`
   (the meta description inherits it and keeps its closing period).
3. Note, no change required: the meta description is about 230 characters, so search snippets cut
   before the price. Acceptable, since the Offer carries the price. "Youth gaming league" matches
   llms.txt and the landing; the messaging-voice never-say on "a rival league" is about school
   leagues (PlayVS), so the consumer wording is fine.

No refund, jersey, or outcome claim is published in the JSON-LD, so nothing there can contradict ToS
23.4 or 23.6. With fixes 1 and 2, an AI answer quoting it would not mislead a parent.

## Item 2. 429 copy and new visible copy: CHANGE (429 line), APPROVE (rest)

- `route.ts` line 593 (429): "We couldn't save this one from here. Text our founder at (832) 271-0150
  and we'll add you by hand." No banned words, reframes or dashes. Two issues: "this one from here" is
  vague (the parent does not know what "here" means), and it uses straight apostrophes while the
  sibling `FAIL` constant (line 161) and the landing fallback use curly ones, so the same form shows
  two typographies. Replacement:
  `We couldn’t save your sign-up just now. Text our founder at (832) 271-0150 and we’ll add you by hand.`
  (`lib/season1/__tests__/seasonOneRoute.test.ts` line 581 asserts the old string and must move with it.)
- Landing 429 fallback: "That didn’t go through. Try again in a little while." APPROVE. Plain, honest, matches the no-auto-retry behavior.
- Honeypot label "Leave this empty" (signup.html): aria-hidden and off screen. APPROVE.
- "Text our founder" is consistent with the join page and Karlin's true standing (messaging-voice line 176).

## Item 3. Revised canon entries: CHANGE, CHANGE, CHANGE

### "How does paying work?" CHANGE
Contradictions found:
- ToS 23.2 says the rest of the season is charged "monthly or up front ... at the terms you choose at
  lock-in". The draft reads as monthly only.
- `lib/season1/welcomeCopy.ts` lines 28, 36, 38 already tell every committed family "a month from Feb
  15". Canon saying "we'll confirm the exact charge dates in December" contradicts an email families
  have received. Either the welcome copy drops "from Feb 15" (my recommendation, since Jamie chose
  not to commit to a date) or canon names Feb 15. One of the two must change before approval.
- Prices are per kid; siblings pay $80 and $128 (offer.ts, ToS 23.1).
Replacement:
"Your $100 holds your kid's spot and pays for January. After lock-in, the rest of the season is $160 a month for February, March and April, less any friend credits, charged to the card you saved, or you can pay it up front at lock-in. Siblings are 20% off. We'll confirm the exact charge dates in December."

### "Can I get a refund?" CHANGE (minor)
Matches ToS 23.3 and 23.4 on lock-in date, the email-if-changed promise, full refund if not placed,
no refund after lock-in, and team@ekuzo.gg. Two gaps: "$100" is wrong for a sibling ($80), and 23.4's
"Refunds go back to the original payment method" is dropped. Replacement:
"Yes. Your first payment ($100, or $80 for a sibling) is fully refundable until lock-in, currently December 31, 2026 (we'll email you if that date changes). If we can't place your kid on a team, you get it all back. After lock-in, the season isn't refundable, like any team sport. To ask for a refund, email team@ekuzo.gg, and it goes back to your original payment method."
This settles OPEN 3 (email, per live ToS) and OPEN 4 (no $65 rule) in the draft.

### "What's the jersey?" CHANGE
- First sentence matches ToS 23.6 and offer.ts jerseyCutoffAt. "First 100 families" has no count cap
  in code; accepted as D19.
- "Aimed to arrive by the holidays" drops ToS 23.6's "can't guarantee a delivery date". Keep the hedge.
- "Each team designs its own name and jersey, and that team jersey is available to buy" has no source
  in ToS, offer.ts, code or existing canon, names no price or process, and conflicts with live parent
  copy: landing line 939 lists "a jersey with their gamer tag" as part of the season, and ad d11 says
  "Their gamer tag. On a real jersey." A parent who saw the ad and then reads "available to buy" will
  feel baited. Join B also says "a free custom jersey" (line 218), still open as OPEN 5.
Replacement (drop the team-jersey sentence until a price and process exist):
"The first 100 families who commit by November 30, 2026 get a free EKUZO jersey. We ship within the US and aim to have it to you by the holidays, though we can't promise a delivery date."
Follow-up for Aaron's lane: landing line 939 and ad d11 need to match whatever Jamie decides on team
jerseys (free for all, free for the first 100, or for sale).
