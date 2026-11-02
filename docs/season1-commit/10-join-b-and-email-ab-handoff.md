# Season 01: join page B, sign-up and confirmation updates, early-access email A/B

Handoff from Aaron to Jamie, 2026-11-02. Branch `season1-commit` (head `198acab` before this doc). Jamie does the final QA and test purchase before anything merges to `main`.

Preview: https://season1-commit--ekuzo.netlify.app/season1/join/b (test mode, no real charges). Original for comparison: `/season1/join`.

## Why

Karlin wanted the cost to be transparent: $100 for the first month, then $160 a month, and the friend credit shown as "1 friend = 1 free month". Karlin has signed off on the direction and on A/B testing the early-access email.

## 1. New page: `/season1/join/b`

A variant of the join page. `/season1/join` (A) is unchanged.

- Files: `app/season1/join/b/route.ts` (a copy of the join route that points at the new template) and `app/season1/join/b/join-b.html`. It uses the same `renderJoin()` and template vars. `lib/season1/` is untouched.
- GA4: `season1_join_view` carries `{variant:'b'}`.
- **Hero card:** big $100 with $160 struck, "first month". The line under it reads "Save $60 off your first month, and get a free custom jersey. Then just $160/month or about $20 each practice." The jersey clause sits in `IF:jersey`, so it drops after the Nov 30 cutoff. Button: "Save their spot for $100" (no middot). The refund line under the button is gone.
- **Mobile hero art:** new group graphic under 1000px (`public/images/season1/s1-crew-mobile.webp`, served through `<picture>`). Desktop art is unchanged.
- **Nav button:** "Sign up".
- **Stats:** the finale tile now reads **May**. Stat values stay on one line on phones.
- **Friends section:** "Games are better with friends." Copy: "Every kid that joins with your link gets a free month, and so do you. More friends, more savings. **Join and start your team.**" The bar chart is replaced by "1 friend = 1 free month" (blue gamer, $160 struck), with "Four friends, free season. We send your $100 back too." Aaron's gamer icons are in `public/images/season1/gamers/*.svg`.
- **Timeline:** Now, Late Nov, Late Dec, Dec 31 lock-in, Mid Jan "Season begins!", May "Final tournament".
- **Safety:** "coach-led and recorded" uses the camada shield icon.
- **FAQ:** new first question "How does paying work?", open by default. It has a Jan $100 / Feb–Apr $160 tile row, "Full season, Jan to May $580", and the answer "You pay $100 today for the first month deposit. The rest of the season is $160/month. That's $580 for the whole season, which runs January to May, about $20 a practice."
  - New second question "Do you offer discounts?": siblings 20% off, friend link gives both families a free month, 4 friends means a free season.
  - "What do they need?" now says the coach makes sure everything is set up before the first practice.
- **End button:** "Join Season 01".
- **Sticky bar:** violet with a soft shadow, "Join the team!" in white, and a lime "Save their spot" button.
- **Spacing:** section padding is tighter (48/80 instead of 64/112). Bottom padding adds the torn-edge height so the next band's tear never cuts content. QA script checked this at 360, 390, 810, 1200, 1440, 1920 and 2560: no overflow, no seams over content, no unwanted wraps, tap targets at least 44px, fonts and images load.

## 2. Shared pages (these change the A flow too)

`/season1/join/signup` and `/season1/join/welcome` serve both A and B.

- **Sign-up** (`app/season1/join/signup/signup.html`)
  - The pay button reads "Save their spot for $100" (the name-aware label is "Save Mia's spot for $100").
  - The summary adds "Then $X a month from Feb 15, less any friend credits." It uses `monthlyCents()`, so siblings are included.
  - The jersey line reads "Custom jersey (first 100 families)".
- **Confirmation** (`app/season1/join/welcome/welcome.html`, `route.ts`)
  - Share copy matches the friends section.
  - "What happens next" ends with Mid Jan "Season begins!" and May "Final tournament". Mid Apr and May 6 are removed.
  - "How this discount works" is the "1 friend = 1 free month" card. A new `MONTHLY` var is added in `route.ts`. The `LADDER*` vars stay defined but unused.
- **Tests:** signup, welcome, join and devView tests pass, 70 of 70. The full `test:s1` run has the same 43 failures as the unchanged baseline; all are DB or integration suites that need a database.

## 3. Early-access email: A/B test request

Two Klaviyo drafts. Neither has been sent.

| | Template | Layout |
|---|---|---|
| A | `VYzgSh` "Season 01 · Early access (waitlist) · DRAFT" | Current layout: headline and intro, champion art, offer card, stats, friends, sign-off |
| B | `RN8KSq` "Season 01 · Early access (waitlist) · 602 layout · DRAFT" | Figma frame 871:175 in EKUZO Marketing ("602"): CTA above the art, new mixed-games art, offer card with "Get the jersey" and the new $60 line, stats, friends, sign-off |

- Both have the new friends section: headline, copy, the "1 friend = 1 free month" row (stacks on phones), the four-gamer row and the "Start your team" button.
- Both have the top button as "Save their spot for $100".
- New images are in the Klaviyo library and in `public/images/season1/email/`: `gamer-blue@2x.png`, `gamers-row@2x.png`, `hero-mixed-games@2x.jpg` (about 240 KB).

**Ask:** one campaign to the Season 01 waitlist with a Klaviyo A/B test on the template, A = `VYzgSh` and B = `RN8KSq`.
- Same subject line and preview text, so only the layout differs.
- Suggested split: 50/50 on the full list, or a 20% test (10/10) with the winner sent to the rest after 4 hours.
- Winning metric: click rate. Also read Placed Order conversions per variation in the campaign report.
- Both templates link to `https://ekuzo.gg/season1/join?src=email`, and `src` is whitelisted (`lib/season1/validate.ts`), so the site sees one source. Klaviyo still attributes clicks and orders per variation. If you want the site to tell them apart, add `utm_content=email-a` / `email-b`; utm params already survive the address-bar allow list.
- Before sending: send both previews to a real inbox (Apple Mail and Gmail). Klaviyo's image CDN was blocked from my workspace, so I checked the layouts locally with the same image files.
  - Gmail drops the Oswald font. B's phone rules handle the fallback width. A's headline and $100 price can still run past a narrow phone screen in Gmail; that's an existing issue and a small fix if you want it.

## 4. QA checklist for Jamie (before main)

1. B at phone and desktop: hero card, sticky bar, friends card, timeline, FAQ open state, end button.
2. Test purchase through B with one kid: sign-up summary shows "Then $160 a month from Feb 15, less any friend credits.", button reads "for $100", confirmation shows the new card and timeline.
3. Repeat with a sibling (summary uses the family monthly) and with a friend invite (the Feb 15 credit line still shows).
4. A at `/season1/join`: unchanged page, but its sign-up and confirmation now carry the section 2 copy.
5. Klaviyo previews of both templates; set up the A/B campaign.

## Open decisions

- **Traffic split for the join page:** B ships as its own route. Do ads and the email point to B, does B replace `/season1/join`, or do we split traffic? The email links point to A (`/season1/join`) unless we change them.
- **"Gear check":** "Late Nov: Gamer profile, jersey and gear check" is still on B and on the confirmation page. The new FAQ says the coach handles setup before the first practice. Keep it or trim it?
- **FAQ canon:** the new FAQ answers (paying, discounts, setup) are not in `knowledge-base/company/knowledge/ekuzo-faq-canon.md` yet; the knowledge base isn't in this clone. They need backporting once B is the page of record.
