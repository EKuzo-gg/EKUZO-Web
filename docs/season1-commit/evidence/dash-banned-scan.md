# Dash and banned-word scan, slice 4 (Atlas)

Files: app/season1/join/join.html app/crew/[code]/crew.html app/season1/join/signup/signup.html lib/season1/joinPage.ts

## Dashes: em dash, en dash, &mdash;, &ndash;, spaced hyphen, double hyphen (outside HTML comment markers and CSS)
### app/season1/join/join.html
71:select.f{background-image:linear-gradient(45deg,transparent 50%,#999 50%),linear-gradient(135deg,#999 50%,transparent 50%);background-position:calc(100% - 18px) 52%,calc(100% - 13px) 52%;background
(end)
### app/crew/[code]/crew.html
76:select.f{background-image:linear-gradient(45deg,transparent 50%,#999 50%),linear-gradient(135deg,#999 50%,transparent 50%);background-position:calc(100% - 18px) 52%,calc(100% - 13px) 52%;background
(end)
### app/season1/join/signup/signup.html
73:select.f{background-image:linear-gradient(45deg,transparent 50%,#999 50%),linear-gradient(135deg,#999 50%,transparent 50%);background-position:calc(100% - 18px) 52%,calc(100% - 13px) 52%;background
(end)
### lib/season1/joinPage.ts
36:  const sibPct = Math.round((1 - OFFER.siblingMonthlyCents / OFFER.monthlyCents) * 100);
49:    LADDER1: usd(OFFER.seasonCents - OFFER.friendCreditCents),
50:    LADDER2: usd(OFFER.seasonCents - 2 * OFFER.friendCreditCents),
51:    LADDER3: usd(OFFER.seasonCents - 3 * OFFER.friendCreditCents),
(end)

## Hard-banned words and phrases
### app/season1/join/join.html
(end)
### app/crew/[code]/crew.html
(end)
### app/season1/join/signup/signup.html
(end)
### lib/season1/joinPage.ts
(end)

Result: no prose hits. The only matches are a CSS gradient (calc and color stops) and arithmetic in code, not user-facing strings. Zero em dashes, en dashes, spaced hyphen dashes or hard-banned words in any rendered string.
