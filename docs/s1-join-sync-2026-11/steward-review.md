# Steward review: /season1/join as a clone of /season1/join/b (2026-11-05)

Role: Steward (brand, product and offer). Read only: no code or canon was edited.

Inputs read: `app/season1/join/b/join-b.html` (rendered through `lib/season1/joinPage.ts`), the old A page
(`git show c1f01e6:app/season1/join/join.html`), `lib/season1/offer.ts`, `pricing.ts`, `referral.ts`,
`referralFlags.ts`, `fulfil.ts` (referral step), `senders/klaviyo.ts` (friend events), `welcomeCopy.ts`,
`app/terms-of-service/page.tsx` § 23 (Season 01 terms), Aaron's handoff
`docs/season1-commit/10-join-b-and-email-ab-handoff.md`, `docs/season1-commit/final/02-decisions.md`, the
screenshots, and on Jamie's KB: `company/knowledge/ekuzo-faq-canon.md`, `company/marketing/ekuzo-fact-library.md`
(no Season 01 offer facts in it), `system/methodology/anti-ai-writing.md`, `voice-dna.md`,
`company/knowledge/ekuzo-messaging-voice.md`, and the Season 01 decision record
`explorations/2026-10-26-season1-commit-invite/README.md` and `03-pm-scope.md`.

## Verdict: APPROVE /join as a clone for release

The clone is faithful: /join and /join/b render from one template and one renderer, the screenshots of the two
routes are byte-identical in size at both widths, and no money number on B disagrees with `offer.ts`. Every
finding below is about B's copy, which is already live at /join/b, protected in this build and owned by Aaron.
They are site-state findings for Jamie and Aaron, not changes for this build. None of them makes /join worse
than /join/b is today, and B is the page Jamie chose on 11-05.

Two findings need Jamie's eyes soon (S1, S2); the rest are should-fix or backport.

### Findings for Jamie and Aaron (site state)

| # | Severity | Finding |
|---|---|---|
| S1 | High (money promise) | "Four friends, free season. We send your $100 back too." and the FAQ's "If 4 friends sign up, you play the season for free" are true only for a one-kid family. Credits are $160 per friend kid off the family's season, capped at the season (terms 23.5: "Credits never exceed the season"; 10-26 round 2: "four make a one-kid season free including the $100 back ... No per-kid assignment rules"). One kid: 4 x $160 = $640 against $580, so Feb to Apr free plus the $100 refunded, as promised. Two kids: the season is $1,044 ($580 + $464), so four friends leave $404 to pay. The count is friend kids, not friend families (`s1_referrals.friend_kids`), so "4 friends" is also loose in the generous direction. No code computes the credit, applies the cap or sends the $100 back: the system records `friend_kids`, raises a `free_reached` flag at 4 (`referralFlags.ts`), and sends Klaviyo `credits_to_free`; refunds are manual in Stripe (10-26 decision). The PM scope's T2 test ("credit math 0 to 12 friend kids, one and two kid inviters, cap") has no credit-math code to test. The promise is backed by the terms and manual ops before lock-in, which is acceptable for release; ops needs the rule written down before Feb 15 billing exists. Suggest Aaron adds "for one kid" or similar near the four-friends line (the welcome page already labels its ladder "For your first kid"). |
| S2 | Medium (Jamie decision 10-29) | B drops the season line from the offer card. Jamie approved on 10-29 (`final/02-decisions.md` line 45) that "Season 01 runs mid January to May 6, 2027. Your $100 covers January." stays on sign-up and the join offer card, after the canary "nowhere on that flow does it say it's for the whole season." B's hero now reads "Then just $160/month", which can read as month to month. Mitigations: the open-by-default "How does paying work?" answer shows Jan to Apr and "$580 for the whole season", and the sign-up page still prints the season line before payment. Jamie choosing B on 11-05 may supersede the 10-29 call; confirm it does. |
| S3 | Medium (product fact) | Jersey wording disagrees across surfaces, an open item already (PR-3, `docs/season1-commit/05-defect-log.md`). B's hero says "a free custom jersey"; terms 23.6 say "a free EKUZO jersey"; the 10-26 decision says the free one is a generic EKUZO jersey and the custom team jersey "may carry a fee"; the ad landing says "their gamer tag on a real jersey". If the free jersey is not customized, "custom" is a promise ops cannot keep. Jamie picks the rule; Aaron aligns B and sign-up ("Custom jersey (first 100 families)"). |
| S4 | Medium (voice canon) | "First 100 families" has no cap in code: jersey eligibility is time only (PaymentIntent created before Nov 30 23:59:59 PT and paid within 24 h, `rules.ts` RT8). The 10-26 record calls "first 100" urgency copy, and C8 kept it. Terms 23.6 state it as a limit, so a 101st family has no contractual claim but the code would mark them eligible (generous, no parent harm). It does sit against `ekuzo-messaging-voice.md` § Language We Avoid ("Artificial urgency or scarcity"). Jamie's call, already made; flagged so it is made knowingly. |
| S5 | Low | Timeline: "Mid Apr / Final tournament" matches decision 2 (tournament mid April, last practice May 6) but B drops A's "May 6 / Last practice". With "Final" in mid April and the FAQ saying the season runs to May, a parent can read the season as ending in April. Suggest A's "Season tournament" plus a May 6 row, or "Mid Apr / Season tournament" only. |
| S6 | Low | "Late Nov / Gamer profile, jersey and gear check" still sits beside the new FAQ line that the coach handles setup before the first practice (Aaron's own open question). Nothing in code or terms schedules a late-November gear check. |
| S7 | Low (analytics, not Steward's lane) | /join fires `season1_join_view` with `{variant:'b'}`, the same as /join/b. R1 allowed a page-name label delta and none was made, so GA4 tells the two routes apart only by `page_location`. Fine if the readout uses page path; say so in the ledger. |
| S8 | Evidence | `join-375-open.png` and `join-1440-open.png` show the closed state ("Signups are paused. Text our founder."), so the open state (jersey sticker, CTA, sticky bar) is not evidenced by these shots. Re-shoot in test mode before the ledger calls it open. |

## Claims table (rendered /join, open state, before the jersey cutoff)

Status key: MATCH = agrees with canon or the offer code and terms; CONTRADICTS = disagrees; NOT IN CANON =
true per code or terms but absent from `ekuzo-faq-canon.md` (backport); QUALIFY = true only in part.

| Claim on the page | Source checked | Status |
|---|---|---|
| "$100 ... $160 [struck] first month" | `offer.ts` firstKidCents 10000, monthlyCents 16000; terms 23.1 | MATCH; NOT IN CANON (canon Pricing still shows only Teams $576 / $640) |
| "Save $60 off your first month" | $160 minus $100 | MATCH on arithmetic. Billing month one runs to Feb 15 (welcome copy), so the $160 reference holds. "Save $60 off" is redundant wording |
| "and get a free custom jersey" | terms 23.6 "free EKUZO jersey"; 10-26 decision (generic free, custom may carry a fee) | CONTRADICTS terms wording (S3) |
| "Then just $160/month or about $20 each practice" | monthlyCents / practicesPerMonth = $20 | MATCH; drops the season-length framing (S2) |
| Sticker "Free jersey / First 100 families, until Nov 30" | `jerseyCutoffAt` 2026-11-30 23:59:59 PT; no count cap in code | Date MATCH; "first 100" is uncapped urgency copy (S4) |
| "Save their spot for $100" | firstKidCents | MATCH |
| "Spots are limited. Teams are small." (after cutoff only) | team size about 5 (canon "How are teams formed?") | "Teams are small" MATCH; "limited" is urgency copy |
| "2x a week / 90 minutes each" | offer.ts practicesPerMonth 8; canon practice cadence | MATCH |
| "Online / Play from home"; "Do we have to go anywhere? No." | canon (all online) | MATCH; the short answer is NOT IN CANON |
| "Ages 9 to 17 / Any skill level" | `ageCopyMin` 9, `ageCopyMax` 17; canon age answer (updated 10-29) | MATCH |
| "Finale April / Season tournament" | decision 2 (mid April tournament) | MATCH |
| "Every kid that joins with your link gets a free month, and so do you" | terms 23.5; `friendCreditCents` 16000 per joining kid to both families; `welcomeCopy.thenLine` ("February is free with your friend's credit") | MATCH; NOT IN CANON |
| "1 friend = [$160 struck] 1 free month" | friendCreditCents = monthlyCents | MATCH for a first kid. A sibling month is $128, so a $160 credit is worth more than a sibling month (fine; the cap is the season) |
| "Four friends, free season. We send your $100 back too." | terms 23.5 (refund of first month when credits cover the season, never exceed the season); 10-26 round 2; no credit code | QUALIFY: one-kid families only; manual ops (S1) |
| "Now / Save their spot" | n/a | MATCH |
| "Late Nov / Gamer profile, jersey and gear check" | jersey shipping plan (3 to 4 weeks, holidays); no gear-check step in code | Unverified (S6) |
| "Late Dec / Meet the team and coach" | placement before lock-in (10-26 dates) | Plausible, NOT IN CANON |
| "Dec 31 / Lock-in. Full refund until then." | `lockInAt` 2026-12-31 23:59:59 PT; terms 23.3, 23.4 | MATCH (the $65 jersey rule was a proposal; terms 23.4 as shipped give a full refund) |
| "Mid Jan / Season begins!" | seasonLabel "mid January"; terms 23.2 week of Jan 18 | MATCH |
| "Mid Apr / Final tournament." | decision 2 | MATCH on date; "Final" next to a May 6 season end is confusing (S5) |
| Coach bios (Sebastien coached pros at Dignitas and Evil Geniuses, top 1%; Karlin Challenger jungler; Nuri former public school teacher, Diamond support) | unchanged from A; not in FAQ canon, proof points or fact library | NOT IN CANON (pre-existing, unchanged by this build) |
| "Every match happens in private, EKUZO-moderated servers ... every player signs [the Code of Conduct]" | canon walled-garden answer (moderated, code of conduct, opponents inside the ecosystem) | MATCH in substance; wording NOT IN CANON (pre-existing) |
| "How does paying work?" tiles Jan $100 (Today), Feb / Mar / Apr $160; "Full season, Jan to May $580" | 10000 + 3 x 16000 = 58000 = `seasonCents`; terms 23.2 | MATCH; NOT IN CANON |
| "You pay $100 today for the first month deposit. The rest of the season is $160/month. That's $580 for the whole season, which runs January to May, about $20 a practice." | as above; terms 23.1 calls it the first payment for month one | MATCH; "deposit" and "first month" are both used for the same $100, which is accurate (refundable until lock-in). Per-kid only: a sibling pays $80 / $128 / $464, said only in an `aria-label`. NOT IN CANON |
| "Do you offer discounts? Yes! Siblings are 20% off." | `SIB_PCT` = 1 - 12800/16000 = 20; $80 / $100, $464 / $580; terms 23.1 | MATCH; NOT IN CANON |
| "If a friend signs up with your unique link, you both get a free month." | terms 23.5 | MATCH (per friend kid; credits pending until lock-in and void on refund are in the terms only) |
| "If 4 friends sign up, you play the season for free." | as S1 | QUALIFY (one kid) |
| "What game do they play?" answer | canon "What game do they play? (Season 01 wording)" | MATCH (verbatim) |
| "Is it safe?" answer | canon "Is it safe?" (added 11-03) | MATCH (verbatim) |
| "Who is it for? Kids ages 9 to 17. Outside that range? Text our founder." | canon age answer; `textKarlinSms` | MATCH; short answer NOT IN CANON |
| "What if no team fits? We hand-pick every team by age and skill. If we can't place your kid, you get every dollar back." | terms 23.4; canon "How are teams formed?" | MATCH; NOT IN CANON |
| "What do they need? A computer that runs League of Legends (it's free), a headset with a mic, and solid internet. Our coach will help ... before the first practice." | canon equipment answer | MATCH on equipment; the coach-setup sentence NOT IN CANON |
| "Join Season 01"; "Questions first? Text our founder" | n/a | MATCH |

## Dropped from A (what a src=email arrival saw on A and does not see on B)

Per Aaron's handoff, both 11-04 email templates already carry B's friend section ("1 friend = 1 free month",
the four-gamer row, "Start your team") and the "$100" CTA, and template B carries the $60 line. So B matches the
email better than A did. `?src=email` still rides onto the sign-up link (R1.2, unchanged route code). Items A
had that B does not:

1. The season line on the offer card: "Season 01 runs mid January to May 6, 2027. Your $100 covers January." (Jamie-approved for this spot on 10-29; S2). Still shown on sign-up.
2. Timeline row "May 6 / Last practice", and "Mid Apr / Season tournament" (B: "Final tournament"); "Mid Jan / First practice" became "Season begins!" (S5).
3. The friend ladder in dollars: on your own $580, 1 friend $420, 2 friends $260, 3 friends $100, 4 friends Free. B shows the rule (1 friend = 1 month) without the season totals.
4. "You get your link right after you save a spot." (tells the parent when the referral link arrives). Not on B.
5. A's "Four friends and we refund your $100." became "We send your $100 back too." (same meaning).
6. "We help with setup in late November." became the coach-setup line (S6).
7. Sticky bar "Lock in for $100" became "Join the team!" (price off the sticky bar); end CTA "Save their spot · $100" became "Join Season 01"; nav "Save their spot" became "Sign up".
8. GA4 `season1_join_view` with no params became `{variant:'b'}` (S7).

None of these is a money fact a parent can only learn on /join: the season total, the season dates and the
monthly charges all appear on sign-up before payment.

## Voice and never-say check (B's copy)

- Em dashes and en dashes: zero in the template.
- Negative parallelism: "No trolling. No targeting. Crash-outs get coached." is the "No X, no Y, just Z" shape, and "No public matchmaking, no strangers." sits beside it. Both are unchanged from A and chosen by the author; under the frequency rule (`anti-ai-writing.md` § 1B) one such block is tolerable. No compressed "It's not X. It's Y." reframes.
- Never-say (`ekuzo-messaging-voice.md` § Language We Avoid): no gaming-as-problem, rescue, transformation, addiction or healthy-gaming framing. "First 100 families" and "Spots are limited" are urgency or scarcity cues (S4).
- Calm confidence: "Then just $160/month" ("just" minimizes a $580 commitment), three exclamations ("Season begins!", "Join the team!", "Yes!"). Light.
- Grammar: "Every kid that joins" (A had "who"); "Signups" in the closed block vs "sign-up" elsewhere; "Save $60 off" is doubled.

## Canon backports needed (to `company/knowledge/ekuzo-faq-canon.md`, Jamie approves)

Aaron's handoff notes the B FAQ answers are not in canon. Confirmed: none of these is in the file today.

1. Pricing: add a Season 01 entry. $100 today for the first month (first kid; $80 sibling), then $160 a month (sibling $128) charged Feb 15, Mar 15, Apr 15; $580 a season per first kid ($464 sibling); pay up front offered at lock-in. The existing Teams entry ($576 / $640) is stale now that Season 01 is Teams under a new name (10-26 round 2).
2. "How does paying work? (Season 01)": B's answer, plus "per kid".
3. "Do you offer discounts? (Season 01)": B's answer, with the one-kid qualification on four friends and the friend-kid count (S1).
4. Refunds: add Season 01 (full refund until lock-in Dec 31, full refund if we can't place your kid, not refundable once the season starts), per terms 23.4. Canon covers only camps.
5. Friend credits: one entry from terms 23.5 (both families, pending until lock-in, void on refund, siblings and own code never count, cap at the season, first month refunded when credits cover the season).
6. "What if no team fits?", "Do we have to go anywhere?", "Who is it for?" short answers, and the "What do they need?" coach-setup sentence.
7. Jersey promotion, once Jamie settles PR-3 (S3, S4).
8. Season 01 dates: week of Jan 18 to May 6, 2027; tournament mid April; lock-in Dec 31, 2026.
