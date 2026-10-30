# D5 copy deck: busy progress line and in-progress messages

Role: Story (Build Loop, analytics round). Drafted 2026-10-30 for Jamie's approval in chat (D5).
Code untouched; this file is the only output.

## Voice stack loaded before drafting

1. `system/methodology/anti-ai-writing.md` (hard rules)
2. `system/methodology/voice-dna.md` (strong tendencies, § Load before you write)
3. Byline voice evidence: this is EKUZO brand UI copy, so the evidence is the funnel's own shipped strings:
   `app/season1/join/signup/signup.html` (busy label "Saving their spot...", every `announce(...)` and
   `serverErr` message, button labels), `app/season1/join/welcome/welcome.html` (paid, pending, slow,
   failed, stalled, generic states), `app/season1/join/welcome/route.ts`, `lib/season1/welcomeCopy.ts`.
4. `company/knowledge/ekuzo-messaging-voice.md` (core posture, calm confidence, language we avoid).

Register taken from the page: short declaratives, second person, "Text our founder" as the one help
action (often after "Questions?"), periods over exclamation marks, three plain dots on the busy label,
honest about money state ("Your card was not charged" only where true). The welcome page's pending
state says "We're confirming your payment", which these strings hand off to.

## String 1: busy progress line (S11, after 2 s busy)

Context: the button shows a spinner and "Saving their spot..." on tap. Jamie (10-29): "It felt like a
bug when I hit submit and had to wait; I considered hitting back and trying again." Tap to welcome
runs about 4 to 6 s. The line must say it is still working and steer the parent off Back without alarm.
The button stays disabled, so the retap risk is the Back button; "stay" covers both.

Widths measured in Inter Bold 16 px plus the 22 px spinner. Button text room: about 272 px on a 360 px
phone, 287 px on 375 px, 232 px on a 320 px phone.

| | Button label | Helper under button | Chars | Width |
|---|---|---|---|---|
| **A (recommended)** | `Still saving. Please stay here.` | none | 31 | 250 px |
| B | `Still saving their spot...` | `This takes a few seconds. Please stay on this page.` (13 px small text) | 26 + 51 | 202 px |

**Why A:** one change in one place, it picks up straight from "Saving their spot..." so it reads as
progress, and it fits one line on 360 px and wider phones (it wraps only on 320 px). B says "stay on
this page" more explicitly but needs a new element and a promise of "a few seconds" that a slow
database wake or a 3D Secure check can break.

Screen reader (announced once, per S11): use the label as is for A. For B, announce
`Still saving their spot. Please stay on this page.`

## String 2: in-progress message (409 `in_progress`, then go to welcome)

Shown when the parent went back and tapped pay again while the first payment is processing or has
succeeded. Must not say charged or not charged. Then the page replaces itself with
`/season1/join/welcome`, whose paid, pending or failed state answers the question.

| | Message | Chars |
|---|---|---|
| **A (recommended)** | `Your payment is already going through. Taking you to your confirmation to check on it.` | 86 |
| B | `Your payment is already going through, so we're taking you to your confirmation. It shows when it's done.` | 105 |

**Why A:** "check on it" stays true whether welcome renders paid, pending or failed, where B's "when
it's done" assumes success; A is also shorter, which matters because it shows only until the redirect.

Build note: if the redirect fires immediately the parent may not read it. A pause of about 1.5 s with
the button still busy gives the line time to land (engineering call, not copy).

## String 3: in-progress, no confirmation available (email-wide match, no view cookie)

Shown when another tab or device has a payment going through for this email, so this page cannot show
the order. No order data, no redirect. Points to the receipt email and to texting our founder.
"Text our founder" renders as the sms link, the same way `serverErr` builds the `duplicate_kid` line
("Questions? " + link).

| | Message | Chars |
|---|---|---|
| **A (recommended)** | `A payment for this email is already going through. Your receipt will arrive in your inbox when it's done. Questions? Text our founder.` | 134 |
| B | `We already have a payment going through for this email. Look for the receipt in your inbox, or text our founder.` | 114 |

**Why A:** it tells the parent the receipt comes after the payment finishes (B's "look for the receipt"
sends them to an inbox that may still be empty), and it ends on the page's standard "Questions? Text
our founder." Neither option repeats the email address back, so the message adds no order detail.

## Lint result

Run by hand against anti-ai-writing.md and voice-dna.md on all six strings (recommended and
alternates):

- Em dashes, en dashes, spaced or double hyphens: 0.
- Negative-parallelism reframes (1B): 0.
- Hard-banned words, phrases, transitions (3A, 3C, 3D): 0. Soft-banned (3B): 0.
- Exclamation marks: 0. Title case: 0 (sentence case throughout).
- Money state: no string says the card was or was not charged.
- Meta commentary, engagement bait, idiom swapped for an action: 0.
- Page-level redundancy (2L): "already going through" appears in String 2 and String 3, which never
  show together; "Text our founder" matches the page's existing help line.

Pass.
