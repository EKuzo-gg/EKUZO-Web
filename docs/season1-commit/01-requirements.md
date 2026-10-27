# Season 01 commit and invite: requirements (slice view)

Source of truth for IDs and acceptance: the KB PM scope (`03-pm-scope.md`, copied into this run at
`/home/claude/kb/explorations/2026-10-26-season1-commit-invite/03-pm-scope.md`). This file says which
IDs belong to which slice and records the overrides from the brief. It holds no secrets or pricing
strategy beyond the public offer.

## Overrides that win over the PM scope (brief, "Decisions after the reviews")

- Friend link path is `/crew/<code>` (PM scope says `/j/{code}`; read every `/j/` as `/crew/`).
- Codes: 8 digits, 7 random plus a Damm check digit, shown `4827 1937`; or a lowercase vanity word
  (`[a-z]{3,20}`) created by hand. Same lookup. No admin screen.
- Database: Neon over `@neondatabase/serverless` for app code, migrations and the e2e harness. The
  build refuses any `DATABASE_URL` whose host lacks `ep-lively-boat-b4fak1h6` unless mode is live.
- New webhook secret env: `S1_STRIPE_WEBHOOK_SECRET`. `STRIPE_WEBHOOK_SECRET` stays legacy.
- Discord alerts approved (reverses "No Discord"; log it in `docs/architecture-decisions.md`).
- Ages: copy reads 10 to 17; the form accepts 9 to 18 with the C5 warning and an `age_edge` flag.
- The repo is public: no secrets, family data or pricing strategy in docs.

## Slice 1: one family pays $100 (target 01:00 CT)

Musts: P1 (signup, welcome, terms routes; join page is slice 4), P2, P3, P4, P8 (no code yet),
P9, P11 (server side), M1, M2, M3, M4, M5, M8, M9, R1 (code minted in fulfil, shown on welcome),
D1, D2, D3, D4, D6, I1, I2, I3, I7 (outbox table and rows; senders arrive in slice 3), N4 (rate
limit, honeypot, validation, escaping), N6, N7, N8, T1, T2 (slice 1 units), T3 (commit, decline,
3DS, off-session 3155 and 3184), C11, C12, C15, C16.

Added for slice 1:
- S1-K: Karlin's short link `/karlin` redirects to `/season1/join/signup?src=karlin` (P13 subset).
- S1-L: `/season1/terms` renders the draft program terms (marked draft) so the consent link works.

Journeys (slice 1): J1 card path at 375 px (one kid, 4242), J3 Karlin link, J6a two kids in one
order ($180), J7 age outside and age 9, J10 decline then success and 3DS pass/fail, J11 double tap
and back, J12 welcome before webhook, J9b welcome reload.

Must-not (slice 1): PaymentIntent created when mode off, window closed, age outside 9 to 18, no
consent, honeypot filled, rate limit hit, or with the client's amount. Card charged twice per attempt
or off-session. Order marked paid on `payment_failed`, for a non-season1 PaymentIntent, or twice.
Legacy side effects for season1 or `parent_email`-less PaymentIntents. Kid name in any URL.

## Slice 2: friend loop (target 03:30)

P5, P6, P7, P10, R2, R3, R4 (flags recorded; Discord in slice 3), R5, C6, C14, journeys J4, J6b,
J9a, J13. Red team lenses 2 and 3 plus a second challenger pass before freeze.

## Slice 3: side effects (target 05:00)

I4, I5, I6, A1, A2, A3, A4, section 5 Klaviyo contract (Committed, Friend Joined). Discord stub if
no test webhook.

## Slice 4: front door and copy (target 06:00)

P1 (join page and redirects), C1 to C10, C13, closed states, popup fix.

## Slice 5: hardening (stop 07:15)

M6, M7 (refund and dispute recording, if not done earlier), N1, N3, N5, T4, T5, T6; security skill,
adversarial pass, fresh Parent on the branch deploy, copy fidelity diff.

## Not tonight (Should or Later)

P12 prefill, P14 chips, P15 placed by Aaron, D7 Sheet mirror, I8, R6, M10, Checkout Started.
