# 02 Copy deck: blog newsletter capture (A/B) + inquiry-form attribution

Author: Story. Status: frozen for transcription. Inputs: 00-brief.md § Copy, 01-requirements.md § C and P3, P6, P7, P9.

Transcription rules for Atlas: every string below is final. Copy it exactly, including punctuation and capitalization. Straight apostrophes only. No terminal period on button labels. Placeholder tokens in the email are literal.

Surface pronoun: the popup and the welcome email are Karlin's first person ("I"), and both carry a visible byline, because the popup fires on every blog post, including posts carrying someone else's byline. Treat the byline as a required field. The sticky bar carries no first-person pronoun at all, so it reads as page furniture instead of a second voice competing with the popup on the same page.

---

## Sticky bar, thumbs variant

- **line:** `One email tomorrow, then you decide to stay or go.`
- **button label:** `Try it`
- **success line (replaces the line and field in place):** `Got it. Look for it tomorrow.`
- **error line:** `That didn't go through. Try once more.`

## Sticky bar, classic variant

- **line:** `One email a week on kids and gaming, with the sources.`
- **button label:** `Join`
- **success line (replaces the line and field in place):** `You're on the list.`
- **error line:** `That didn't go through. Try once more.`

---

## Popup, thumbs variant

- **eyebrow:** `The EKUZO weekly` (renders at lg and up only, matching the site-mode reference; below lg the logo carries the brand, per SC-01 and Sentry D11)
- **headline:** `One email after you read this. Then you decide.`
- **body:** `Leave your address and you're on the list today. Tomorrow I'll send one message with a thumbs up and a thumbs down, and the thumbs down takes you straight off, no questions. Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.`
- **byline (under the body):** `Karlin Oei, founder, EKUZO`
- **first-name placeholder:** `First name (optional)`
- **email placeholder:** `Email address`
- **button label:** `Send me the one email`
- **loading label:** `One moment...`
- **success label:** `Got it.`
- **microcopy under the button:** `No spam. Unsubscribe any time, or use the thumbs down tomorrow.`
- **error fallback line:** `That didn't go through. Try once more.`

## Popup, classic variant

- **eyebrow:** `The EKUZO weekly` (renders at lg and up only, matching the site-mode reference; below lg the logo carries the brand, per SC-01 and Sentry D11)
- **headline:** `For parents of gamers, once a week.`
- **body:** `One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.`
- **byline (under the body):** `Karlin Oei, founder, EKUZO`
- **first-name placeholder:** `First name (optional)`
- **email placeholder:** `Email address`
- **button label:** `Join the weekly`
- **loading label:** `One moment...`
- **success label:** `You're in.`
- **microcopy under the button:** `No spam. Unsubscribe any time.`
- **error fallback line:** `That didn't go through. Try once more.`

---

## Contact form field

- **label:** `How did you hear about us?`
- **default option text (empty value):** `Choose one`
- **options, in order:**
  1. `X (Twitter)`
  2. `Instagram`
  3. `TikTok or YouTube`
  4. `Google search`
  5. `ChatGPT or another AI`
  6. `A friend or another parent`
  7. `My kid's school`
  8. `Other`
- **helper text (optional field, shown under the select):** `Optional. It tells us where parents are finding us.`

---

## Welcome email (thumbs), used for both arms

- **subject line:** `One email. Thumbs up or thumbs down.`
- **preheader:** `Thumbs down and you're off the list, no questions. Thumbs up and you keep it.`

**Body (each paragraph is its own block; link text in brackets, href follows):**

> You left your address on the EKUZO blog, so here is the first email.
>
> Thumbs up: [Keep it coming] takes you to the newest piece, and I read the click as a yes. → `{{THUMBS_UP_URL}}`
>
> Thumbs down: [Take me off the list] does exactly that. No questions, no follow-up. → `{{unsubscribe_url}}`
>
> You are already on the list, so the thumbs down is the only link that changes that. A short list of parents who want the weekly is worth more to me than a long one.

- **sign-off (two lines):**

> Karlin
>
> Karlin Oei, founder, EKUZO

- **footer microcopy (one line):** `You are getting this because you left your address on the EKUZO blog. Unsubscribe any time: {{unsubscribe_url}}`

**Plain-text version:**

```
Subject: One email. Thumbs up or thumbs down.

You left your address on the EKUZO blog, so here is the first email.

Thumbs up, keep it coming: {{THUMBS_UP_URL}}
That link takes you to the newest piece, and I read the click as a yes.

Thumbs down, take me off the list: {{unsubscribe_url}}
That link does exactly that. No questions, no follow-up.

You are already on the list, so the thumbs down is the only link that
changes that. A short list of parents who want the weekly is worth more
to me than a long one.

Karlin
Karlin Oei, founder, EKUZO

You are getting this because you left your address on the EKUZO blog.
Unsubscribe any time: {{unsubscribe_url}}
```

---

## Character counts (reference for Atlas, not copy)

| String | Count |
|---|---|
| Sticky line, thumbs | 50 |
| Sticky line, classic | 54 |
| Sticky success, thumbs | 29 |
| Sticky success, classic | 19 |
| Email subject | 36 |
| Email preheader | 77 |

---

## Why these words (for Steward)

1. Unchanged from the brief: the thumbs headline, the thumbs button, and "one email a week on making gaming count". They carry the register and the promise.
2. "Free to read." is out of all four bar and popup surfaces per Jamie. It answered a price question no reader had raised, and raising it invited the question of what is not free.
3. The thumbs popup body now opens with "you're on the list today", so the reader learns before typing what the welcome email used to tell them afterwards. The Parent called the old order a correction instead of a receipt.
4. Same reason behind "then you decide to stay or go" on the sticky thumbs bar: it is a stay-or-leave decision, not a preview before joining, and the bar has no body copy to carry the disclosure.
5. Both popups gained a byline. The popup fires on every blog post by route, so an unattributed "I coach kids who play" would borrow Karlin's coaching credential on a post someone else wrote.
6. "I coach kids this age" became "I coach kids who play": true on every post, and it needs no antecedent from the article.
7. The email opener is arm-neutral ("here is the first email"). The classic arm was promised a weekly and never promised one email, and the email goes to both arms.
8. "This week's piece" became "the newest piece" because the link points at the newest post, which is not always one published this week.
