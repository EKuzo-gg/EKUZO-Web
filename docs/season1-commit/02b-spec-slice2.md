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

## Red team resolutions (trust 2 and ops 3, 22:20 CT). These override the sections above. FROZEN.

Ops items that change slice 1 code were sent to Relay B and Atlas (DB guard by deploy context,
required livemode, orphan PI fallback, full-refund definition, void code reactivation, query timeout,
300/h ceiling, PII-free step logs, welcome DB-error state, error copy).

| # | Resolution |
|---|---|
| T1 | Referrals never drive placement. Ops rule: a same-team request is confirmed by Karlin with both parents; never for `burst` codes. Banner copy built as "Invited by {Kid}'s family" (a proposed delta for Aaron; his call). Decision for the team summary. |
| T2 | Welcome share block adds: "Anyone with this link sees {Kid}'s first name. Share it with families you know." `s1_codes.show_name boolean default true`; false renders nameless. Ops snippet `rotate` (void and mint) in the runbook. |
| T3 | Vanity codes are for partners and creators only (`type='partner'` with `display_name`, shown instead of a kid name; null renders nameless). Never a family kid's name; runbook forbids surnames and kid names in vanity strings. |
| T4 | `s1_ref` is signed: value `<code>.<hmac>` with HMAC-SHA256 over the code using `S1_REF_SECRET` (falls back to `S1_STRIPE_WEBHOOK_SECRET` when unset; never logged). Signup and commit ignore unsigned or bad values. R5 limit lives inside `resolveCode` for named renders: per IP (/64 for IPv6) 30 per 10 min plus a global 300 named renders per hour, then nameless. |
| T5 | `/season1/crew*` 301 to `/crew/` with the query dropped ships in slice 2. The clone drops the `from` script and the "Charlie" fallback. `Referrer-Policy: origin` on `/crew/*` and signup. Static `<title>`. Exactly one `gtag('config')` call carrying the `page_location` override. Test: captured collect hits contain no code or name. |
| T6 | Static `og:` tags with no name. Known unfurl crawlers (facebookexternalhit, Facebot, WhatsApp, Discordbot, Slackbot, Twitterbot, TelegramBot, LinkedInBot, Applebot, iMessage link preview UA) get the nameless variant and are not counted. |
| T7 | Commit response adds `invite: "applied" | "ignored"` with `inviteReason`. Ignored: the client drops the banner and the credit line and shows "This invite can't be used for this email, so no friend credit will be recorded." before confirming. Totals line: "Feb 15: $0 with {Kid}'s family credit, applied at lock-in." Welcome says whether a friend credit was recorded. |
| T8 | When rate-limited or a crawler, a Damm-valid code still sets the signed cookie; only the name is withheld. |
| T9 | Remove posts to `POST /api/season1/invite/remove`, which clears `s1_ref` server side (cookie becomes HttpOnly); the commit body may carry `inviteRemoved: true`, which wins. Remove label: "Remove (no friend credit for either family)". Test: no referral after Remove. |
| T10 | Invite page shows "Friend code 4827 1937". Welcome adds "Came from a friend's link and no credit shows? Text Karlin the friend code." R6 (Karlin attaches a code by script, logged) moves to slice 5 as `scripts/s1-attach-code.mjs`. |
| T11 | Every commit call counts against the IP and email limits, 409s included. After 3 `duplicate_kid` hits on one email in a day: generic "Text Karlin" and flag. Kids on unpaid orders never resolve as inviter names. Residual sibling-price signal accepted (logged). |
| T12 | Joiner Klaviyo payload uses `invited: true` (no `invited_by_kid`). Deletion checklist goes in the ops runbook. |
| T13 | Inviter name resolves to the first kid whose status is `committed`; none: nameless. |
| T14 | Nameless variant drops credit promises and adds "Invite link not active? You can still join. Text Karlin about credits." |
| T15 | `s1_ref` Path=/, HttpOnly, 14 days (Path=/ is needed so `/crew` and `/season1` both see it). |
| O4 | Partial refunds by kid via `scripts/s1-refund.mjs --order <ref> --kid <name>` (refund metadata `s1_kid_id`); handler marks that kid refunded and decrements `friend_kids`; a refund without metadata is flagged `refund_unattributed`. Slice 5. |
| O5, O6, O10, O12 | Launch checklist (webhook endpoint and scoping, Stripe email notifications, launch order, Neon warm and statement timeout). Reconciliation job: later. |
| O11 | Slice 3 sender: per-kind max age (Meta 6 days, Klaviyo 48 h, Discord digest); test rows only to allowlisted test addresses; existing test rows marked stale before the first send. |
| O13 | `docs/season1-commit/ops-runbook.md` with reviewed snippets (find family, vanity, void, rotate, refund script, deletion checklist). Slice 5. |
| O14 | Tests use run-scoped emails; ceiling per livemode. |
| O15 | Stale pending sweep (no PI after 1 h): slice 5. `refund.failed` restores status and alerts. |
