# Discord commit format (Relay, 2026-10-30)

Jamie, 13:17 CT: the #season01-commits message reads exactly

`Season 01 commit | <n> kid|kids | Email: <payer email> | Location: <City>, <REGION> (time zone: <IANA tz>) | Source: <source>`

This replaces decision 9 of 10-29 (no email or location in Discord). Recorded in the header comment of `lib/season1/senders/discord.ts` and in `docs/season1-commit/final/02-decisions.md`. Kid names, ages, phone and amount stay out. `[TEST] ` prefix kept for test rows. `formatFlag` and `formatOpsAlert` are unchanged.

## Diff summary

- `lib/season1/senders/discord.ts`: new `formatCommit(order, adName?)`, `formatSource`, `formatLocation`, `emailText`, `needsAdNameLookup`, `lookupAdName`, `adNameFor`. The amount and order ref are no longer in the line.
- `lib/season1/senders/context.ts`, `lib/season1/outboxLoad.ts`: `OrderCtx.geoTz` from the family `geo.geo_tz`.
- `lib/season1/outbox.ts`: the `discord_commit` dispatch passes `await adNameFor(ctx)` to `formatCommit`.
- Tests: `lib/season1/__tests__/outbox.test.ts` (Discord block rewritten), `outboxDrain.test.ts` (geo load).
- Docs: `02-decisions.md` (dated row, decision 9 marked superseded), `WORKLOG.md`.

## Behavior

- Email: `OrderCtx.email` with control characters, whitespace and `` < > ` | * ~ \ `` removed; `@` kept (sendDiscord already sends `allowed_mentions: { parse: [] }`); cap 120.
- Location: `City, REGION (time zone: tz)`; degrades to `City, REGION`, `REGION`, `City (time zone: tz)`, or `unknown`; no parentheses when the tz is empty. City and region go through `free()`, the tz through an IANA character filter.
- Source, first match wins: (a) invited or src friend `referral`; (b) src karlin `karlin`; (c) paid last click (utm_medium paid, cpc, ppc, paid_social; or utm_source meta, facebook, fb, ig, instagram with a utm_content) `ad <utm_content>`; (d) Klaviyo profile `season1_ad_name`: `ad <name>`, plus ` (via email)` when the last click was email, else ` (via <src category>)`; (e) `email` plus ` <utm_campaign>`; (f) first-touch bucket; (g) `organic`. Every piece through `free()` or `ident()`, capped.
- Klaviyo read (d): `GET /api/profiles?filter=equals(email,"...")&fields[profile]=properties`, revision `2025-07-15` (same as the event sender), `KLAVIYO_PRIVATE_API_KEY`, 1.5 s timeout. Runs only for `discord_commit` rows and only when (a) to (c) have not settled the source. No key, no profile, no property, non-200, bad JSON, network error or timeout: returns null and falls through to (e). Never throws, logs nothing (no email in logs). Test-mode rows look up only the allowlisted test addresses (`team+s1test*`, `aaron+*` at ekuzo.gg).

Judgment calls (not spelled out in the request):

1. A paid click with no utm_content and no profile ad name reads `ad` plus the campaign when there is one, instead of falling to the first-touch bucket.
2. `(via ...)` is left off when it would repeat `ad`; a profile ad name with a direct or organic last click reads `(via organic)`, as specified (src category).

## Example outputs (five representative orders)

```
Season 01 commit | 1 kid | Email: parent@example.com | Location: Oshkosh, WI (time zone: America/Chicago) | Source: ad d11-a-toomuch-fl (via email)
Season 01 commit | 2 kids | Email: sam@gmail.com | Location: Austin, TX (time zone: America/Chicago) | Source: ad d11-b-teamwork-fl
Season 01 commit | 1 kid | Email: parent@example.com | Location: Seattle, WA (time zone: America/Los_Angeles) | Source: referral
Season 01 commit | 1 kid | Email: parent@example.com | Location: TX | Source: email s01-open-day2
[TEST] Season 01 commit | 1 kid | Email: team+s1test-x1@ekuzo.gg | Location: unknown | Source: organic_google
```

1. Waitlist lead from a Meta ad (profile `season1_ad_name`), came back through an email and paid.
2. Paid Meta click with utm_content, two kids.
3. Referral order.
4. Email click, no ad name on the profile, city and time zone missing.
5. Test-mode row, direct, no geo.

## Test tail

```
$ npx tsc --noEmit        (clean)
$ npm run test:s1
# tests 362
# suites 85
# pass 362
# fail 0
```

Was 342 before this change. New: kid count, location degrading, every source branch, email and city sanitizing, caps, `needsAdNameLookup`, the Klaviyo lookup stubbed (found, not found, blank and non-string property, HTTP error, bad JSON, network error, timeout, no key, quote in email, test-mode allowlist, request shape), end to end line, and `loadOrderCtx` geo.
