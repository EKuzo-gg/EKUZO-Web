# 02 Frozen spec (Fable, 2026-11-05)

Requirements: `01-requirements.md` (IDs R1.x to R4.x, M1 to M7). Decisions: `03-decision-log.md`. Red team inputs: `redteam-money.md`, `redteam-trust.md`, `redteam-ops.md` (every finding resolved in D1 to D12 or below). Later deviations need a spec-change line at the bottom of this file.

## Contract per lane

### Relay: `app/api/season-one/route.ts` (W2 server, W3 server)

1. `normalizeAd` is fixed by hotfix `8230894`; add its unit table to the new route test.
2. New helper in the same file (no new module unless tests need an injectable seam; if so `lib/seasonOneDedupe.ts`, not under `lib/season1/`):
   `classifySignup(email, eventId): Promise<"new" | "retry" | "repeat">`
   - No `process.env.DATABASE_URL`: `"new"`.
   - Keys: `s1wl:em:${keyHash(email)}`, `s1wl:ev:${keyHash(email + "|" + eventId)}` (`keyHash` from `lib/season1/rules.ts`). No `eventId`: only the email key.
   - One `getSql().transaction([...])` (`lib/season1/db.ts`): first `select pg_advisory_xact_lock(hashtext($1))` on the email key, then one statement that selects which keys exist in `s1_rate_limits` with `window_start > now() - interval '24 hours'`, inserts the unseen keys with `window_start = now()`, `count = 1`, `livemode = keyIsLive()`, `on conflict do nothing`, and returns the seen set.
   - Email key unseen: `"new"`. Both seen: `"retry"`. Email seen, attempt key unseen: `"repeat"`.
   - `Promise.race` with an 800 ms timer; any throw or timeout: `"new"` and `console.warn("Season 01 dedupe check skipped:", reason)` with no email in the log.
3. Order in `POST`: email check, key check, step check, steps (`games`, `age`, `text-karlin`), honeypot, then `classifySignup`.
4. Event `unique_id`: `${email}-${metric}-${eventId}` when a sanitized `eventId` (same sanitizer as CAPI) is present, else today's form.
5. repeat: build the same `eventProps` (and hero props); write `Season 01 Waitlist Repeat` with event props only and an empty profile props object (do not touch `season1_*` profile props); run the subscribe; no CAPI; return `{ok:true, repeat:true}`. A failed Repeat event is logged and still returns `{ok:true, repeat:true}`.
6. new and retry: today's path, except subscribe and `sendMetaLead` run with `Promise.all` after the event succeeds.
7. Header comment updated: order, budget (0.8 + 3.5 + 2.5 = 6.8 s), the three classes.
8. Tests in `lib/season1/__tests__/seasonOneRoute.test.ts` (or the existing pattern if one exists) per R3.11, with `fetch` and the SQL client mocked. Fixtures are not shaped like secrets (operating principle 11).

### Atlas: pages (W1, W2 page, W3 client, W4)

1. W1: `app/season1/join/route.ts` becomes a copy of `app/season1/join/b/route.ts` whose `TEMPLATE_PATH` is `path.join(process.cwd(), "app", "season1", "join", "b", "join-b.html")`, with a header comment saying /join serves B's template (D10) and must stay identical to `b/route.ts` apart from the comment. Delete `app/season1/join/join.html`. Repoint the four tests (R1.5) and rewrite the two A-only assertions against B. Add `lib/season1/__tests__/joinRoutesMatch.test.ts`: calls both route `GET`s with the same `Request` (host `ekuzo.gg`, `?src=email`, and a non-live host) and asserts equal bodies; plus a check that both route files read the same template path.
2. W2: already on the branch as hotfix `8230894` (D17); no further change.
3. W3 landing (`app/season1/landing.html` sign-up script, ~1408 to 1432): track `eventIdFor` (trimmed lowercase email); new email: new `eventId`, `leadSent=false`. Read `r.json()` when ok; `repeat===true`: skip the Pixel, `generate_lead` and Clarity block. On any success: `try{localStorage.setItem("ekuzo_s1_joined","1")}catch(_){}`. Off `LIVE`, `post` returns `{ok:true}` with no `json`: treat as new.
4. W3 popup (`components/ui/SeasonOnePopup.tsx`): `eventIdRef` keyed to the normalized email the same way; read the JSON body; `repeat===true`: no `trackLead`. Joined flag as today.
5. W4 (`app/season1/landing.html`): an inline script placed immediately after `<section class="hero" id="hero"></section>` (before `#join-top`) that defines `const AD_HERO=...` (moved from the big script, which keeps using it; one source) and `const HERO_KEYS=["amount","games","screentime","shortlist"]`, computes page A exactly as the big script does (`?hero=` in HERO_KEYS: not page A; `?hero=none`: page A; else not page A when the normalized `?ad=` is a key of `AD_HERO`), and adds `class="pa"` to `#hero` when page A. CSS (phones only, `max-width:959px`): `.lp > #hero.pa:empty{aspect-ratio:4/5}`. In the big script, assert `HERO_KEYS` matches `Object.keys(HERO_DEFS)` (console.warn on mismatch, no throw). Desktop and interactive-hero pages render exactly as today.
6. Screenshots after each page change into `screenshots/` (`{page}-{viewport}-{state}.png`, 1440 and 375): /join, /join/b, landing d18, d19, d21 settled, landing d19 confirmation.

### Sentry: verification (two lanes, own files)

- Lane A (server, tests, regression): full `npm test` output; protected-surface zero diff (`git diff --stat 147897a -- <protected paths>`); copy-fidelity text diff /join vs /join/b on the production build; headers on /join; `curl -sI` and body hash of both routes; W2 and W3 unit evidence; M1 to M7 as tests.
- Lane B (browser): production build on port 3100 (`npx next start -p 3100 > server.log 2>&1 & echo $! > .server.pid`; stop with `kill "$(cat .server.pid)"`), fail-closed analytics block from the first request (record blocked counts), console clean per page, W3 browser cases (double tap, retry after network error with the same email, second email gets a new `eventId`, repeat response skips Lead calls, joined flag then a layout page shows no auto popup), touch-scroll case on the email field, CLS before/after per R4.2 with `evidence/cls/measure-cls.mjs` (baseline server on 3200 at `147897a`), visual parity screenshots before/after.

## Pre-flight (Relay checks, read only)

- `s1_rate_limits` columns (`key`, `window_start`, `count`, `livemode`) and the `(key, window_start)` conflict target: from the migrations in the repo.
- Production `DATABASE_URL` reach for `/api/season-one`: cannot be read from here; covered by fail open and by H2.

## Human-action items

- HA1. Jamie: push phrase (branch, then main) after the review guide.
- HA2. Jamie or Claude after deploy: H1 and H2 from `01-requirements.md`, with H2 run twice 60 s apart and once with a second device, using `team+s1test-1105-ad@ekuzo.gg`; read Klaviyo for one `Season 01 Waitlist` with `ad: "d19"` plus one `Season 01 Waitlist Repeat`, and Events Manager for one Lead.
- HA3. Jamie: decide D6 (per-IP limit) for a follow-up.

## Spec changes

- SC1 (after the Auditor's phase 1 BLOCK): advisory lock in a transaction (gap 1); R1.8 trace check; journey map; measurement rows for unchanged pages and the Repeat metric; H3; R3.7 clears `savedEmail`; R3.11 response keys; D13 to D17. Evidence for W2: `git diff 147897a 8230894` (replaces the cited `w2-9f3e2e7.diff`).
