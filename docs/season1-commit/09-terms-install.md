# Terms and privacy install (approved by Jamie, 2026-10-27 09:24 CT)

Install exactly this text. Version id for consent records: `s1-terms-2026-10-27`.

## 1. Signup checkbox (unchecked; required)

"I agree to the [Terms of Service](/terms-of-service#season-01) and [Privacy Policy](/privacy-policy#season-01)."

Nothing else beside the box. Stripe's own saved-card line under the card field stays as Stripe renders it.

## 2. Terms of Service: new section, anchor `season-01`

Title: "Program Terms: Season 01" (match the page's existing title case for section labels).

These program terms are part of our Terms of Service. For Season 01, where they differ from the rest of the Terms, these control.

1. Your first payment
Your payment today locks in your kid's spot and pays for month one. Siblings are 20% off.

2. Saved card and the rest of the season
Season 01 is a season: January 11 to May 9, 2027, four months. After lock-in, the rest of the season is charged to the card you saved, monthly or up front, at the price shown when you signed up and the terms you choose at lock-in.

3. Lock-in
Lock-in is two weeks before the season starts: December 31, 2026. We email you if the date changes.

4. Refunds
Your first payment is fully refundable until lock-in. If we can't place your kid on a team, you get it all back. After lock-in, the season isn't refundable, like any team sport. To ask for a refund, email team@ekuzo.gg. Refunds go back to the original payment method.
("team@ekuzo.gg" links to `mailto:team@ekuzo.gg?subject=Refund%20inquiry`.)

5. Friend credits
Games are better played with friends. When one of yours joins using your code, you both receive a free month. Credits stay pending until lock-in and are void if that friend's family refunds. Siblings and your own code never count. Credits have no cash value, except that if credits cover your whole season, we refund your first month. Credits never exceed the season. We void credits for abuse.

6. Free jersey
The first 100 families who commit by November 30, 2026 get a free EKUZO jersey. We aim to deliver them by the holidays and ship within the US, but can't guarantee a delivery date.

7. When this authorization ends
Your card authorization ends when Season 01 ends, or when you cancel before lock-in.

## 3. Terms of Service: edits to existing sections

- 5.2 Fees: append "If a scheduled payment fails, we'll contact you to update your card. A spot may be released if payment isn't resolved."
- 5.4 No-Refund Policy: after "all payments are non-refundable once a program begins" add ", except as stated in program terms".
- 20 Changes to These Terms: append "Changes to payment terms for a program you've already joined need your consent."
- 22 Contact Information: keep the address and info@ekuzo.gg; add a "Contact us" button that opens the site contact form (existing `ModalButton` with the contact modal), if the page renderer allows it without restructuring; otherwise note it as a follow-up.
- "Last Updated": October 27, 2026.

## 4. Privacy Policy: new section, anchor `season-01`

Title: "Season 01 Sign-up" (match the page's existing style).

At sign-up we collect each child's first name and age. A child's first name appears on the family's invite page, which anyone with the family's link can open. We record which family's link brought a friend; inviting families see how many friends joined, never their names. Your card is saved with our payment processor for the rest of the season, and we use your billing ZIP code to place your kid on a team in the right time zone.

Phone is optional. EKUZO does not automate texts or share numbers. Team members may reach out if there is an ask or legitimate reason.

We use advertising and analytics partners, who receive a parent's hashed email and purchase information. We never share a child's information with them.

No new provider names. "Last updated": October 27, 2026.

## 5. Wiring

- `lib/season1/offer.ts`: `termsVersion` = `s1-terms-2026-10-27`; terms URL = `/terms-of-service#season-01`.
- Every link to `/season1/terms` (join, signup, welcome, crew, emails if any) points to `/terms-of-service#season-01`.
- `/season1/terms` is retired: it moves to `/terms-of-service#season-01` in the browser (same move page as the old preview URLs).
- Apple Pay `managementURL` uses the new terms URL.
