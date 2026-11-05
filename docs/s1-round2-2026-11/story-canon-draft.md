# Story: Season 01 FAQ canon draft (round 2, for Jamie's approval)

Status: DRAFT. Nothing here is written to the KB. Target file on approval:
`knowledge-base/company/knowledge/ekuzo-faq-canon.md`.

Voice stack loaded before drafting: `anti-ai-writing.md`, `voice-dna.md` (§ Load before you write),
`ekuzo-messaging-voice.md` (§ Language We Avoid), and the canon's own format. Lint on the entries
below: zero em dashes, no negative-parallelism reframes, sentence case, 1 to 3 sentences each.

## Placement (my call)

A new `## Season 01` section, inserted right after `## Programs & Scheduling` (before
`## Outcomes & Benefits`, canon line 84). Season 01 is the current program, so its entries belong
together and high in the file. The existing "What game do they play? (Season 01 wording)" entry
(canon lines 71 to 74) stays where it is; on approval it can move into the new section unchanged.
The Pricing section gets a one-line replacement (below) that points here, and the canon's refund
entry (line 285) gets a pointer sentence.

Source key used in the comments:
- `offer.ts` = `ekuzo-web lib/season1/offer.ts`
- `ToS` = `ekuzo-web app/terms-of-service/page.tsx`, section 23 (the live Season 01 terms; `/season1/terms` now redirects there, `app/season1/terms/route.ts` lines 4 to 11)
- `join-b` = `ekuzo-web app/season1/join/b/join-b.html` (values filled by `lib/season1/joinPage.ts`)
- `welcome` = `ekuzo-web lib/season1/welcomeCopy.ts`
- `D18`/`D19`/`D20` = `docs/s1-join-sync-2026-11/03-decision-log.md` lines 22 to 24

---

## Season 01

**What is Season 01, and when does it run?**
Season 01 is EKUZO's coach-led team season for kids 9 to 17: the same coach and the same teammates all season, online from home. The first practice is the week of January 18, 2027, the season tournament is in mid April, and the last practice is May 6, 2027.
<!-- Draft 2026-11-05 (Story, Build Loop round 2), pending Jamie. Ages 9 to 17: offer.ts lines 24-25 (ageCopyMin 9, ageCopyMax 17); join-b line 232. Same coach, same squad, online: join-b lines 227-228, 231. Week of January 18 and May 6, 2027: ToS line 262 ("the week of January 18 to May 6, 2027"); offer.ts lines 34-35 (seasonLabel "mid January to May 6, 2027"). Mid April tournament: join-b line 253 ("Mid Apr / Final tournament"); steward-review line 64 (decision 2). D18 keeps join B's simpler "January to May" wording on the page; canon carries the exact dates. -->

**How much does Season 01 cost?**
You pay $100 today, which covers January. Then it's $160 a month for February, March and April, so $580 for the whole season, or about $20 a practice.
<!-- Draft 2026-11-05, pending Jamie. $100: offer.ts line 12 (firstKidCents 10000). Covers January: offer.ts line 37 (firstMonthLabel "January"); offer.ts line 87 (seasonLine). $160 a month: offer.ts line 14 (monthlyCents 16000). Feb, Mar, Apr: join-b lines 282-285 (Jan $100, Feb/Mar/Apr $160). $580: offer.ts line 16 (seasonCents 58000); join-b line 287. About $20 a practice: offer.ts line 19 ("about $20 a practice", practicesPerMonth 8); joinPage.ts line 65 (160 / 8). Per kid; sibling prices are in the discounts answer. -->

**How does paying work?**
Your $100 holds your kid's spot and pays for January. We save your card with Stripe and charge $160 on February 15, March 15 and April 15, less any friend credits, or you can choose to pay the rest up front at lock-in.
<!-- Draft 2026-11-05, pending Jamie. Holds the spot and pays month one: ToS line 257 (23.1). Saved card, monthly or up front at lock-in: ToS line 262 (23.2). Feb 15, Mar 15, Apr 15: welcome lines 35-36 ("from Feb 15", "on Mar 15 and Apr 15"); app/season1/terms/terms.html line 38 (retired page, "on Feb 15, Mar 15 and Apr 15, less friend credits"). The live ToS 23.2 does not name the charge dates: see OPEN 2. Join B calls the $100 both "first month deposit" and "first month" (join-b lines 217, 288); this answer uses "holds your spot and pays for January" to cover both. -->

**Do you offer discounts?**
Yes. Siblings are 20% off: $80 to start, then $128 a month, $464 for the season. When a friend's kid joins with your family's link, you each get $160 off, a free month, and if four friends join, your kid plays the season free and we send your $100 back too.
<!-- Draft 2026-11-05, pending Jamie. 20%: ToS line 257 (23.1); joinPage.ts line 43 (SIB_PCT, 1 minus 12800/16000). $80: offer.ts line 13 (siblingCents 8000). $128: offer.ts line 15 (siblingMonthlyCents 12800). $464: offer.ts line 17 (siblingSeasonCents 46400). $160 friend credit, both families: offer.ts line 18 (friendCreditCents 16000); ToS line 285 (23.5, "you both receive a free month"); join-b line 238. Four friends, free season, $100 back: join-b line 242; ToS line 285 ("if credits cover your whole season, we refund your first month"). D19: the one-kid "four friends, free season" wording stays unqualified (Jamie, 11-05 10:24 CT). Support note, not for the page: the count is friend kids; credits stay pending until lock-in, are void if that friend's family refunds, siblings and your own link never count, and credits never exceed the season (ToS line 285). For a two-kid family the season is $1,044 ($580 + $464), so four credits ($640) leave $404 (steward-review line 29, S1). -->

**Can I get a refund?**
Yes, your $100 is fully refundable until lock-in on December 31, 2026, and if we can't place your kid on a team, you get it all back. After lock-in, the season isn't refundable, like any team sport.
<!-- Draft 2026-11-05, pending Jamie. Lock-in December 31, 2026: offer.ts line 28 (lockInAt 2026-12-31T23:59:59-08:00); ToS line 267 (23.3, "at least two weeks before the season starts"; "We email you if the date changes"). Fully refundable until lock-in, all back if not placed, not refundable after: ToS line 274 (23.4). Refunds go to the original payment method: ToS 23.4. How to ask is left out until OPEN 3 is settled. The $65 jersey-shipped refund rule appears only on the retired terms.html line 40: see OPEN 4. -->

**What's the jersey?**
The first 100 families who commit by November 30, 2026 get a free EKUZO jersey. We ship within the US and aim to have it to you by the holidays, though we can't promise a delivery date.
<!-- Draft 2026-11-05, pending Jamie. Nov 30, 2026: offer.ts line 27 (jerseyCutoffAt 2026-11-30T23:59:59-08:00); ToS line 290 (23.6). First 100 families, US shipping, by the holidays, no guaranteed date: ToS line 290. D19: "first 100 families" is intentional urgency copy; the real limit is the cutoff date (no count cap in code, steward-review line 32, S4). "Custom" is left out until OPEN 5 is settled. -->

**How often do they practice?**
Twice a week, 90 minutes each, online from home with the same coach and team all season.
<!-- Draft 2026-11-05, pending Jamie. Twice a week, 90 minutes: offer.ts line 19 ("Two 90-minute practices a week"); join-b line 230 ("2x a week / 90 minutes each"); public/llms.txt line 15 ("twice a week for 90 minutes"). D20: twice a week is correct; "weekly" copy elsewhere goes to Aaron to reword. Online, same team: join-b lines 228, 231, 291. -->

---

## Pricing section: replacement line

Replace the answer under **How is EKUZO priced?** (canon line 278) with:

Season 01, our current program, is $100 to start, then $160 a month, $580 for the season, about $20 a practice (see Season 01 above). EKUZO101 is $99 for eight classes, and EKUZO Camps were $199 a week in 2026; EKUZO Teams, our earlier semester program, was $576 paid in full or 4 × $160.
<!-- Draft 2026-11-05, pending Jamie. Season 01 numbers: offer.ts lines 12, 14, 16, 19. Teams marked earlier: public/llms.txt line 16 ("Earlier semester-based school-partnered program (Fall 2026), Season 01 is the current program"). EKUZO101 and Camps figures carried over unchanged from canon line 278; whether they are still offered is OPEN 6. -->

## Refund section: added sentence

Append to the answer under **What is the refund or cancellation policy?** (canon line 285):

For Season 01, see "Can I get a refund?" in the Season 01 section.

---

## OPEN for Jamie

1. **Four friends for a two-kid family.** D19 keeps the page unqualified. Canon also feeds the `/faq` FAQPage JSON-LD and support replies. Keep canon matching the page (as drafted, math in the comment for support), or add "for one kid" in canon? My lean: keep it as drafted; support has the math.
2. **Charge dates.** Feb 15, Mar 15 and Apr 15 come from `welcomeCopy.ts` and the retired `terms.html`; the live ToS 23.2 says only "monthly or up front". Confirm the 15th is still the charge day before canon states it.
3. **How to ask for a refund.** The live ToS 23.4 says email team@ekuzo.gg; the retired terms.html line 45 says text Karlin. The join page sends questions to "Text our founder". Which one goes in canon?
4. **$65 refund if the jersey has shipped.** Only on the retired terms.html line 40; the live ToS 23.4 gives a full refund until lock-in, and steward-review line 62 calls the $65 rule a proposal. Draft follows the live ToS (full refund). Confirm the $65 rule is dead.
5. **Free jersey: custom or EKUZO?** Join B says "a free custom jersey" (join-b line 218); ToS 23.6 says "a free EKUZO jersey"; already open as PR-3 / S3. Draft says "EKUZO jersey" to match the terms.
6. **EKUZO101 and Camps in the Pricing line.** Are they still offered at $99 and $199, or should they also be marked earlier? Profile memory says EKUZO101 is not being pushed and camps return in February; no source file in my brief settles it.
7. **Gear check and "meet the team".** Join B's timeline (lines 249 to 250) has "Late Nov: gamer profile, jersey and gear check" and "Late Dec: meet the team and coach"; neither is in code, terms or canon (steward-review lines 60 to 61), so I left them out of canon.
