# Season 01 commit: slice 2 contract (friend loop). DRAFT until red teams 2 and 3 report.

Builds on the frozen slice 1 spec (`02-frozen-spec.md`). Requirements: P5, P6, P7, P8 (code line), P10, R2,
R3, R4 (flags recorded; Discord arrives in slice 3), R5, C6, C14 and journeys J4, J6b, J9a, J13 from
the PM scope. Path `/crew/<code>` (brief override of `/j/`).

## Codes and lookup
- A family's share code is minted in fulfil (slice 1). Vanity codes are rows in `s1_codes` with
  `type='vanity'` and `target_code` = a family code; Karlin creates them by hand (SQL snippet in the
  ops notes). Lookup: `normalize(input)`; vanity rows resolve to their target; only `status='active'`
  codes whose family has at least one `paid` or `partially_refunded` order resolve.
- `resolveCode(code) -> {code, familyId, inviterKidFirstName} | null`. The inviter kid is the first kid
  (by `order_items` order) of the family's earliest paid order. First name only, never age or city.
- Lookups limited to 30 per IP per 10 min (R5); over the limit, the page renders the nameless variant.

## `/crew/<code>` page
- Clone of `app/season1/crew/crew.html` (relationship: clone; deltas C1, C3 to C10, C15 only for
  copy; tonight only C6 and the CTA targets are required, the rest land in slice 4 with the copy pass).
- `force-dynamic`, `Cache-Control: private, no-store`, noindex, GA4 only (no Meta pixel). Server
  renders the inviting kid's first name HTML-escaped. Unknown, void or rate-limited code: the same page
  with no name ("Join a friend's team"), same 200 status.
- Sets cookie `s1_ref=<normalized code>` (not HttpOnly so the page can show "Remove"; SameSite=Lax;
  Path=/; 30 days; last link wins) only when the code resolves. Join buttons go to
  `/season1/join/signup` with no query.
- GA: `season1_invite_view` (no code in params; `page_location` sent as `/crew/` without the code via
  `gtag('config', ..., {page_location: origin + '/crew/'})`), `season1_invite_join_tap` on tap.
- `/season1/crew` with `?from=` and the early-access paths redirect in slice 4.

## Signup with a code
- The signup route reads `s1_ref`, resolves it server side, and injects `{invite: {kidFirstName}}`
  into the config (never the code itself into GA). Banner C14: "Joining {Kid}'s team" plus "Not joining
  a friend? Remove". Remove clears the cookie client side (expires) and hides the banner and the code
  line.
- Totals add the line "Feb 15: free, from {Kid}" (P8) when a code is present. Today's amount does not
  change (credits apply at lock-in).

## Commit API changes
- Reads `s1_ref` from the request cookies (the body never carries a code). Re-resolves it. Ignored
  (no referral, order `referral_code` null, flag recorded) when: unknown or void; the code's family is
  the committing family (same guardian email); the committing email already has a paid or partially
  refunded order (already-paid families can't be referred). Store the accepted code on the order.
- P6 duplicate guard before any PI: if a paid or partially refunded order on this email (same
  livemode) has a kid whose folded first name matches a submitted kid and whose status is not
  `refunded`, return 409 `{error:"duplicate_kid", kidFirstName}` with copy "{Kid} already has a spot.
  Questions? Text Karlin." No PI, no order.
- P5 sibling pricing across orders already holds through `priorPaidKids`.

## Fulfil changes
- If the order has `referral_code` and the order is claimed as paid: insert `s1_referrals`
  (`code`, `inviter_family_id`, `referred_order_id` unique, `friend_kids` = number of kids on the
  order, `status='pending'`). Siblings within the order all count as friend kids (each friend kid
  earns $160 for each side, per the hub). Outbox `klaviyo_friend_joined:<referral id>` (sender in
  slice 3).
- Flags (never block; record on the referral `reasons` and in `s1_events`): `shared_card` when the
  joiner's card fingerprint equals any fingerprint on the inviter family's paid orders; `same_zip`
  when billing ZIPs match; `burst` when the code has 5 or more referrals created in the last 24 h;
  `free_reached` when the inviter's live friend kids reach 4; `node` at 10. Each outbox
  `discord_flag:<referral id>:<flag>`.
- On `charge.refunded` (full) of a referred order: its referral becomes `void`. On a full refund of
  the inviter's only paid order: the inviter's code `status='void'` (stops crediting new joins);
  existing referrals keep their status (a joiner keeps a credit earned from an inviter who refunds).

## Welcome
- Already shows the share link from slice 1. No change except the `Path=/` cookie note above.

## Tests
- Units: resolveCode rules (vanity, void, unpaid family), own-code and paid-family ignore rules,
  duplicate guard, flag predicates.
- Integration (Neon test + Stripe test): inviter pays (pm_card_visa) -> code; friend with `s1_ref`
  pays 1 kid -> referral pending friend_kids 1; friend with 2 kids -> friend_kids 2; inviter uses own
  code to add a sibling -> $80, no referral; same email same kid -> 409 duplicate_kid; refund the
  friend -> referral void; 31st lookup -> nameless page.
- Playwright on the branch deploy at 375 px: open `/crew/<code>`, tap join, banner shows, pay with
  4242, welcome shows a different code.
