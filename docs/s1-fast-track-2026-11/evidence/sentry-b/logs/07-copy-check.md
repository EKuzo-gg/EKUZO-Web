# Copy check (read-only), Part B ported copy, 2026-11-10

Sources: `app/season1/landing.html` (the ported copy), `lib/season1/offer.ts` (OFFER), the rendered `/season1/join`, `/join/b`, `/join/jersey` on 3100 (`{{LOCK_SHORT}}`, `{{JERSEY_SHORT}}` from `lib/season1/joinPage.ts` lines 70 to 72), and the Day 4 email (Klaviyo flow VE7DfC "Season 01 - Day 4 Sign-ups open", message WPwu9u, template QPdLZq, read through the Klaviyo connector).

| Claim in the ported copy (where) | Join pages and offer.ts | Day 4 email | Verdict |
|---|---|---|---|
| "$100" (ready links, lock card, FAQ) | `firstKidCents` 10000; join shows "$100 first month" and "You pay $100 today"; siblings $80 (`siblingCents` 8000) | "$100 first month", button "Save their spot for $100" | agrees (first kid; the landing does not say siblings pay less, the join page does) |
| "Covers January" / "It covers January" | `firstMonthLabel` "January"; `seasonLine()` "Your $100 covers January"; join timeline "Jan $100 Today" | not stated | agrees |
| "Season 01 starts in mid January 2027" (FAQ) | `seasonLabel` "mid January to May 6, 2027"; join "Mid Jan Season begins!" | not stated (finale "April") | agrees. Stale risk: only if the start slips |
| "fully refundable until Dec 31" (ready note x2, lock card, FAQ) | `lockInAt` 2026-12-31T23:59:59-08:00; join "Dec 31 Lock-in. Full refund until then." | not stated | agrees with the join page and offer. Disagrees with `terms/terms.html` s4 ("until lock-in, two weeks before your session starts") and with `crew.html` and `early-access.html` ("until Jan 1, 2027"). Goes stale after 2026-12-31 23:59 PT (the window closes; nothing on the static landing changes). SG-3 |
| "First 100 families get a free jersey." (lock card) | join: "free custom jersey"; `jerseyCutoffAt` 2026-11-30T23:59:59-08:00; `isJerseyEligible()` is date-based; sticker block "First 100 families, until {{JERSEY_SHORT}}" (= Nov 30) in `join-b.html` line 215 and `join-jersey.html` line 298 | "First 100 families, until Nov 30" (banner and preheader "free jersey for the first 100 families") | disagrees by omission: the card has no date. Goes stale on Dec 1 2026 (about three weeks out). SG-2 |
| "Sign-ups are open now." (FAQ, "When does it start?") | `isOpen(now)`: 2026-10-26 to 2026-12-31 23:59:59 PT, and only when the join mode is not off | subject "Season 01 sign-ups are open" | true today; false after Dec 31, and false whenever the mode is off while the static page cannot know. SG-2 |
| "Ready now? Save their spot for $100" link target | `/season1/join?src=ad&ad=<id>` renders the paid page; with the mode off it shows "Signups are paused" | email links to `/season1/join/b?src=email` | link works; same stale rule as above |
| Hero labels "Get the details" vs email button "Save their spot for $100" | n/a | the email still says "Save their spot", which F7 reserves for paying | consistent (the email button does lead to paying) |

Also seen, not part of Part B: the landing hero for one ad (d11 jersey line, `landing.html` line 1235) says "Free for the first 100 families" with no date either, existing copy on main.
