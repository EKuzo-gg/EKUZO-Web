---
title: "Season 01 analytics build, server side (Relay)"
created: 2026-10-30
author: Relay (data model, integrations, server events, money path), Jamie's Claude
spec: 01-requirements.md as amended by 02-resolution.md (S5, S6, S7, S9, C1, C2 server part, C3, C4, C15, C17)
branch: season1-commit (built on hotfix 09f6f03, base 0e2d273)
---

# Relay: server side of the analytics build

Server only. No HTML template, `signup.html` or client code changed (Atlas owns `tags.ts`, templates, client F15 handling and the busy line).

## 1. Migration 0005 (C15, ops 1)

- File: `db/migrations/0005_season1_order_attribution.sql`: `set lock_timeout = '3s'; alter table s1_orders add column if not exists attribution jsonb;` (nullable, no default, metadata only).
- Applied to the **TEST database only** (`node --env-file=.env.test.local scripts/s1-migrate.mjs`, which refuses any host but the test endpoint without `--live`):

```
skip   0001_season1.sql (already applied)
skip   0002_season1_fulfilled.sql (already applied)
skip   0003_season1_redteam.sql (already applied)
skip   0004_season1_referrals.sql (already applied)
apply  0005_season1_order_attribution.sql (2 statements)
done: 1 applied, 4 skipped
```

- Read-back (host label `ep-lively-boat-b4fak1h6-pooler`):

```
information_schema.columns: [{"table_name":"s1_orders","column_name":"attribution","data_type":"jsonb","is_nullable":"YES","column_default":null}]
s1_migrations: 0001 .. 0004, 0005_season1_order_attribution.sql applied_at 2026-10-30T15:01:23.525Z
```

- The integration test `attribution.integration.test.ts` reads it back again on every run.
- **Production not touched.** Release step (C19): `npm run s1:migrate -- --live` with the production env, or the SQL editor, then the same `information_schema` read-back before the push go.

## 2. Last-click cookie, middleware (S5, C3, C17)

Files: `lib/season1/attribution.ts` (new, pure), `middleware.ts`, `lib/originClassifier.ts` (adds `ORIGIN_VALUES`, which is typed so tsc fails if a bucket is missing, and `isBotUserAgent`, which uses the same bot list).

- `ekuzo_lc` is written when the request carries any of the eight kept parameters. The block runs **before** the `ekuzo_origin` early return and skips bots. The cookie is HttpOnly, Path `/`, SameSite Lax, 30 days, and Secure in production.
- Value: JSON of the kept keys plus `path` and `ts` (ms).
  - utm_* keep printable ASCII only (other characters are removed), trimmed, at most 160 characters.
  - gclid and fbclid are kept whole (printable, no spaces, up to 512) or dropped whole. They are never cut.
  - `path` is capped at 128, and `/crew/<code>` becomes `/crew/`.
  - The encoded cookie is at most 2048 bytes. Keys are dropped in this order: utm_term, utm_id, gclid, utm_medium, utm_source, utm_content, utm_campaign, fbclid.
  - If no kept value survives cleaning, nothing is written, so an earlier click is never overwritten by a junk or plain visit.
- Tests: `lib/season1/__tests__/attribution.test.ts` (24). They include the ekuzo_origin-present case, run through the real `middleware()` with a `NextRequest`: `ekuzo_lc` is set and `ekuzo_origin` is not rewritten. They also cover bots, the crew path, no-param visits, the 2 KB budget, and whole-or-dropped click ids. To make this possible, `scripts/test-resolve.mjs` now maps `next/server` to `next/server.js` for node ESM tests.
- Built-server smoke (`next start`, test env, port 3105):

```
GET /season1/join?utm_source=meta&utm_campaign=t&fbclid=x  (cookie ekuzo_origin=paid_meta)
set-cookie: ekuzo_lc=%7B%22path%22%3A%22%2Fseason1%2Fjoin%22%2C%22ts%22%3A1793373146426%2C%22utm_source%22%3A%22meta%22%2C%22utm_campaign%22%3A%22t%22%2C%22fbclid%22%3A%22x%22%7D; Path=/; Expires=...; Max-Age=2592000; Secure; HttpOnly; SameSite=lax
GET /season1/join (no params): no ekuzo_lc
GET /crew/48271937?utm_source=sms: ekuzo_lc path "/crew/", code absent
```

## 3. Order attribution, commit route (S6, C3)

Files: `app/api/season1/commit/route.ts`, `lib/season1/db.ts` (`insertCommitRecords` writes `$20::jsonb`; `PendingOrderInput.attribution`), `lib/season1/attribution.ts` (`orderAttribution`, `parseLastClick`, `cleanFirstTouch`, `validFbp`, `validFbc`).

- Every new order row gets `{src, lc, first_touch, fbp, fbc}`, for both new and returning families.
  - `lc`: `ekuzo_lc` is decoded, parsed, re-whitelisted and re-sanitized. A raw value over 4 KB is not parsed.
  - `first_touch`: `ekuzo_origin`, only when it is one of the classifier buckets.
  - `fbp`: the `_fbp` cookie, if it matches money 8's regex.
  - `fbc`: the `_fbc` cookie first, else `fb.1.<lc.ts ms>.<lc.fbclid>`. Both are checked against money 8's regex.
- The key `origin` is never used. `s1_families.attribution` is unchanged (`{src}` on insert).
- `attributionFor()` is synchronous, runs in its own try/catch (any failure stores `{src}`), and is called only at the insert, after `quote()` and `decideInvite`. Neither of those reads it.
- The reuse path (same attempt, same kids) creates no new order, so it writes no new attribution.
- Unit tests, in the commit harness (`commitDoubleCharge.test.ts`, describe "commit attribution"):
  - full shape on a returning family
  - new family, where the family stays `{src}`
  - hostile cookies (%00, encoded lone surrogate, 10 KB `_fbc`, bad `_fbp`): 200, all null
  - non-JSON, array and nested-object `ekuzo_lc`: `lc` null
  - a **forged `ekuzo_lc`** (amountCents 0, invite applied, referralCode, origin) with a valid signed `s1_ref` for a partner code: amount 18000 and invite `applied` are identical with and without it; the order's amount and referral_code params are identical; only `utm_campaign`, `path` and `ts` survive in `lc`
- Integration (`attribution.integration.test.ts`, Neon test plus Stripe test):
  - the real row stores the full shape
  - the same email's second order (one family) stores its own attribution, and hostile cookies still commit
  - `loadOrderCtx` reads it back
  - every PI created is canceled afterwards

## 4. Outbox and senders (S7, C4)

Files: `lib/season1/outboxLoad.ts`, `lib/season1/senders/context.ts`, `meta.ts`, `klaviyo.ts`, `lib/season1/outbox.ts`.

- `ORDER_SQL` selects `o.attribution as order_attribution`.
  - `fbp`/`fbc` come from the order first, then the family. Both are validated, and an invalid order value falls through to a valid family one.
  - `utmSource/Medium/Campaign/Content` come from `order_attribution.lc`, and `firstTouch` is validated against the enum.
  - `origin` still comes from the family (the test request origin).
- Meta Purchase validates `fbp`/`fbc` again before sending and omits malformed values (money 8).
- Klaviyo Committed **event** properties gain `utm_source, utm_medium, utm_campaign, utm_content, first_touch` (empty string when absent, like `src`). Profile properties are unchanged, and a test asserts none of the new keys or values reach the profile.
- Dispatch: on an order whose status is `refunded`, a claimed (so unsent) `klaviyo_committed` or `meta_purchase` row ends `skipped_refunded`. `partially_refunded` still goes to the senders. Discord is unchanged.
- Tests:
  - `outbox.test.ts`: 2 new and 1 updated. The old "keeps fbp and fbc" used `fb.1.1.2`, which is now correctly dropped, so it uses valid values; a separate case covers malformed values.
  - `outboxDrain.test.ts` (new, Neon stubbed, no network allowed): order-first fbp/fbc, family fallback, invalid values dropped, `skipped_refunded` for refunded, senders reached for partially_refunded and paid, and the order filter.

## 5. Drain route, schedule, welcome (C1, S9)

- `app/api/season1/drain/route.ts`:
  - `POST` only (GET 405), runtime nodejs, force-dynamic.
  - Header `x-s1-drain-secret` must equal `S1_DRAIN_SECRET`, using `timingSafeEqual` over sha256 digests so the length does not leak.
  - 503 `not_configured` when the secret is unset or blank, 401 `unauthorized` otherwise.
  - Then `drainOutbox({limit: 50, budgetMs: 8000})`. The answer is `{considered, counts, timedOut}` only.
  - The helpers live in `lib/season1/drainAuth.ts`, because a Next route file may only export route fields.
- `netlify/functions/s1-drain.mts`: `export const config = { schedule: "*/2 * * * *" }`. It only POSTs to `${process.env.URL}/api/season1/drain` with the secret and logs `s1-drain: status <n>`; it skips and logs when URL or the secret is missing. `netlify.toml` sets no functions directory, so Netlify's default `netlify/functions` applies.
- Welcome (`app/season1/join/welcome/route.ts`): both `await drainOutbox` calls are removed. Each branch now records the paid order's public id, and the route calls `scheduleOrderDrain(ref)` (`lib/season1/orderDrain.ts`), which registers `drainOutbox({orderId, limit: 20, budgetMs: 3000})` with Next `after()`.
  - `drainOutbox` already had an `orderId` filter (used by `scripts/s1-outbox.mjs`); it is unchanged, and the webhook and script callers are unchanged.
  - Outside a request scope (`after()` throws) the call is skipped and logged, so it never breaks the page.
  - Payment truth is unchanged.
- Tests (`drainRoute.test.ts`, 9):
  - 503 when unset or blank, with no DB call
  - 401 for no header, a wrong secret, a prefix, a longer value, or a Bearer header, with no DB call
  - 200 with the secret: limit 50, stuck recovery ran, counts-only keys
  - `secretMatches`
  - the welcome source has no `drainOutbox` and no awaited schedule
  - `scheduleOrderDrain` registers without running, and the task's select carries the order filter and `["20", "<ref>"]`
  - the real `after()` outside a request scope gives "skipped"
  - the scheduled function's config and target
- Built-server smoke: `POST /api/season1/drain` without the header gives 401 `{"error":"unauthorized"}`; with a wrong secret, 401; `GET` gives 405. The 200 path was **not** run against the TEST DB, because it would drain shared test outbox rows during Sentry's work. The unit test proves it with a stubbed DB.

## 6. Commit responses for F15 (C2 server part)

`app/api/season1/commit/route.ts`:

| Return point | Before (hotfix) | Now |
|---|---|---|
| Attempt's PI `processing` / `succeeded` / `requires_capture` | 503 `try_again`, no cookie | **409 `{"error":"in_progress"}`** + fresh `s1_order` view cookie for that order (`issueViewToken`, the same as the reuse path). If the token write fails, it still answers 409 `in_progress` without a cookie (logged `commit.attempt_in_flight_token`), never a 500. |
| Email-wide guard, another pending order in flight | 503 `try_again` | **409 `{"error":"in_progress_other"}`**, no cookie, no order data, no token issued |
| Insert race on `s1_orders_attempt_key` (double tap) | 503 `try_again` | **503 `{"error":"attempt_busy"}`** |
| Everything else (limiter 503s, attempt PI read error, failed cancel, email PI read error, 409s, 422s, 429s, 500) | unchanged | unchanged |

- Tests in `commitDoubleCharge.test.ts`:
  - updated for the new codes, with the cookie format asserted exactly, and an assertion that no token is issued on `in_progress_other`
  - 3 new: token failure gives 409 without a cookie, the race gives 503 `attempt_busy`, and any other insert error stays 500 `server`
  - the harness's fetch stub now returns Neon's 400 error shape when a responder throws
- **The tests bite:** the updated file run against the pre-change route (`git show HEAD:...commit/route.ts`) gives 7 pass and 12 fail: every in_progress, in_progress_other, attempt_busy and attribution case fails. The route was then restored.

## Suites

| Run | Result |
|---|---|
| `npm run test:s1` | **274 / 274 pass**, 70 suites (was 225; integration suites report skipped as before) |
| `S1_DB_TESTS=1 node --env-file=.env.test.local scripts/run-tests.mjs lib/season1/__tests__` (J10 method) | **317 / 317 pass**, 71 suites, 0 fail, 0 skipped, 92 s (adds db, gaps, invite, money, referral and the new attribution integration suites) |
| `npx tsc --noEmit` | exit 0 |
| `npx eslint` on every changed file | exit 0 |
| `npx next build` | Without env it fails at the pre-existing legacy `/api/camps/register` (Stripe key at module load; not this change). With `.env.test.local` loaded: **exit 0**. `/api/season1/drain` is listed as a dynamic route, and middleware compiles (Next 16 warns that `middleware` is deprecated in favor of `proxy`; pre-existing). |

The integration run created Stripe test objects (PIs, customers) as the other suites do. The new suite cancels its own PIs. No payment was confirmed by the new suite. Output was checked: no key, webhook secret or DB URL in any log.

## Not proven here, and open

1. **`after()` on Netlify** is proven only by code and unit tests. Branch-deploy proof (R13/C7: outbox rows reach `sent` with `updated_at` within seconds of a test payment, with the webhook delayed) is Sentry's.
2. **The scheduled function** cannot fire on a branch deploy (only "Run now" in the UI). It is proven after release from the function log (`s1-drain: status 200`) and outbox `updated_at`. It needs **`S1_DRAIN_SECRET` in Netlify Production** (Jamie pastes it). Until then the function logs "skipped" and the route answers 503. The branch-deploy curl of the route with the secret is Sentry's (it needs the secret set in the branch context).
3. **The production migration** is not applied (C19 release step, with read-back).
4. **fbc regex vs fbclid length.** Per the brief, money 8's `[A-Za-z0-9_-]{1,255}` is used. C3 keeps fbclid up to 512, so a fbclid of 256 to 512 characters, or one containing `.` (Meta's newer `_fbc` cookies can carry an appended segment), is stored in `lc` but gives `fbc: null`, which is dropped and never sent malformed. Ops 6 proposed a looser `^fb\.\d\.\d{10,13}\.[^\s]{1,600}$`. Worth a decision with Meta's Test Events payload.
5. **R6 dedupe and R10 in Test Events** need a real Pixel (Atlas) and a test order; post-release per C18.
6. **Klaviyo profile** check on `team+s1test` (R11) needs a test payment on the branch deploy (Sentry, Klaviyo connector `get_events`).
7. `insertPendingOrder` (an older helper used only by integration fixtures) does not write order attribution. Only `insertCommitRecords` (the commit path) does.
8. Client F15 handling (`in_progress` before the generic 409, `in_progress_other` copy, the `attempt_busy` retry, `s1_confirmed_<attemptId>`) is Atlas's. Until it ships, a 409 `in_progress` lands in signup.html's generic 409 branch ("Signups are paused") and `attempt_busy` lands in the 503 branch. Neither claims "not charged" falsely beyond what the hotfix already did, but **the server and client should release together**.
