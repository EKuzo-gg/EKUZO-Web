---
title: "Season 01 landing and popup: reviewer notes for Aaron"
created: 2026-10-10
from: Build Loop review (Parent and Steward roles), via Jamie
status: for Aaron's judgment; nothing here is required for launch
---

# Season 01: reviewer notes for Aaron

Aaron, this is FYI. Your creative and copy are locked for launch as you built them, and nothing
below was changed. Two independent reviewers looked at the rendered landing page, the ads and the
site popup: one read them as a parent who just tapped an ad, the other checked claims against our
FAQ canon and voice rules. Jamie already settled some items (marked). Use whatever is useful for
round two or the nurture emails.

## Settled by Jamie (no action)

- Photo releases are clear for all 12 ads. The d3 Boys & Girls Club jerseys stay.
- The game: Season 01 will likely run multiple games, so "the game they already love" and d8's
  "Same game" stand. The d1 block art is original and intended.
- The jersey with their gamer tag is a program default.
- "Spots are limited" and "Save their spot" stand: partner capacity is real, and the internal
  target is 100 families per focus metro.
- Coaches will appear in the nurture lead-up, so "You'll meet them before the season starts" stands.
- d7's weekly note to parents is real.
- The age range, "2027" without a month, d10's text and the full-screen popup on phones are your
  intentional choices.

## What a parent reviewer said would raise sign-ups (for round two or the emails)

1. **Who it is for.** No age range shows on the page, and the photos range from about 10 to
   teens. One line ("for kids 10 to 17") was the reviewer's top request.
2. **Safety in one breath.** Nothing on the page says the team is private, has the same kids
   every week, is coach-led and recorded, and has no strangers. Approved canon wording exists for
   all four. The reviewer said this is what a worried parent searches for before giving an email.
3. **Who is behind it.** There is no proof line, About link or privacy link near the form, and
   "Season One" reads as brand new.
4. **What happens next.** After sign-up there is no "check your inbox" and no sender name, so the
   welcome email (Monday) will carry this.
5. **Equipment.** League needs a PC or Mac and a headset, while a few visuals show console
   controllers. If the multi-game plan lands, that answers it.
6. **Small things.**
   - The lower email box still shows after sign-up.
   - "Parent of the year +100 XP" may read as sarcastic to a worried parent.
   - "screentime" and "screen time" both appear.
   - Screen readers read the popup headline as "They game too much. With a coach.", because the
     strike-through is visual only. An `aria-label` would fix it.

## Technical notes (already handled, no action)

- **The landing page's webfonts never loaded.** The Google Fonts link had an invalid Bricolage
  Grotesque weight spec, so the server returned 400 and every browser showed fallback fonts.
  It is now fixed, so the landing pages render in the fonts your ad images use. If you approved
  the look with fallback fonts and prefer it, tell Jamie and it is a one-line revert.
- **Pixel changes.**
  - The pixel's automatic click tracking is off, so the game-chip text never reaches Meta. That
    text describes the child.
  - Bot sign-ups caught by the hidden field no longer count as a Lead.
- **For later:**
  - landing.html is 1.3 MB, with inline images for all 12 variants and some design notes in the
    page source.
  - The full-screen popup on phones can draw a Google interstitial penalty.

Full reviews, if you want the line-by-line: `ekuzo-web/docs/season1-launch/review-parent.md` and
`review-steward.md`.
