# Season 01 commit: slice 4 contract (front door and copy). FROZEN at 23:32 CT.

Requirements: P1 (join page, redirects), P11 (closed states and jersey line from config), C1 to C10,
C13 (already on welcome), visual relationships in PM scope section 4. Forced deltas only (money,
legal, privacy, or Jamie's decisions); anything else Aaron might want goes on his delta sheet as
"proposed".

## `/season1/join` (clone of `app/season1/early-access/early-access.html`)
- `force-dynamic` route handler (prices and dates from `lib/season1/offer.ts`, closed state from mode
  and window), private no-store, noindex, GA4 only, no Meta pixel.
- Allowed deltas: C1 ("Season 01 is open"; "Spots are limited."), C2 (remove the $522 pay-up-front
  option; optional line "Rather pay up front? You can choose that at lock-in." included, Aaron's call to
  keep), C3 (friend table row 4: "4 friends: Free. We refund your $100."; "Four friends make the
  season free."; "Credits apply at lock-in."), C4 ("Fully refundable until {lock_in_date}, and any time
  we can't place your kid on a team," linked to `/season1/terms`), C5 (ages read 10 to 17), C7 (sms from
  config), C8 ("Free jersey for the first 100 families" shown only before the jersey cutoff; no counter),
  C10 ("{lock_in_date}: lock-in. Your spot becomes final."), C15 (dev banner removed; test-mode bar in
  test). CTAs go to `/season1/join/signup` (carry `src` only if already present and allowed).
- Closed state (mode off or outside the window): commit CTAs replaced by Text Karlin and a link to the
  waitlist page `/season1`.

## Redirects (`next.config.mjs`), permanent 301, query dropped
- `/season1/early-access` → `/season1/join`; `/season1/early-access/signup` → `/season1/join/signup`;
  `/season1/early-access/saved` → `/season1/join/welcome`; `/season1/crew` → `/season1/join`.
  Query dropping: Netlify forwards the query on redirects; use a route handler or middleware-free
  approach that guarantees no query (e.g. replace the old static route handlers with handlers that
  return 301 to the bare path, rather than next.config redirects). Prove with curl that `?kid=Charlie`
  does not survive.

## Copy deltas on existing pages
- Signup: C2 (already), C4 refund line, C5, C7, C8 rule, C10 where the timeline appears, C11 and C12
  (already), C14 (built as "Invited by {Name}'s family", T1), C16 (already).
- Crew page: C1, C3, C4, C5 (already), C7, C8 rule, C9 ("A team jersey they design together"), C10,
  C15.
- Welcome: C3, C6 (already), C10, C13 (already), C15.

## Checks
- `voice-check` pass on every changed string (zero em dashes, no spaced hyphen dashes, sentence case,
  no banned words). Copy-fidelity table: each C-id → page → rendered string → match.
- Screenshots at 375 and 1440 of `/season1/join` beside the original `early-access.html` render (side
  by side) for the visual-parity gate; crew and signup at 375 after deltas.
