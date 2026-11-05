# 01 Requirements: Season 01 join sync and funnel fixes (2026-11-05)

Author: Fable. Handoff: `knowledge-base/system/loops/handoffs/2026-11-05-season1-join-sync-and-funnel-fixes.md`.
Loop: `knowledge-base/company/agents/agent-loop/build-loop.md` (every gate applies). Start commit: `origin/main` `147897a`, branch `build/s1-join-sync-funnel-fixes`.

## Pre-verified facts (Fable, 2026-11-05 09:40 to 10:10 CT)

- F1. `9f3e2e7` is not on any branch, local or GitHub (`git branch -a --contains` empty on Jamie's laptop; not in `origin/main` history). `main` `app/api/season-one/route.ts:96` still matches `d(0?[1-9]|1[0-2])`; live `https://ekuzo.gg/season1/join/signup` still serves `name="company"`. W2 is not deployed at all.
- F2. Aaron's `docs/season1-commit/10-join-b-and-email-ab-handoff.md` § Open decisions lists the A/B page split as an open question, not a planned test. The W1 stop condition is not met; W1 aligns /join to B.
- F3. `/season1/join/b` and `/season1/join` share `renderJoin()` and `tagsForRequest(request, "join", mode)`. Neither page has a canonical link (both are noindex route handlers). The only analytics label difference is `season1_join_view` `{variant:'b'}` vs no params.
- F4. The landing (`app/season1/landing.html`) and popup (`components/ui/SeasonOnePopup.tsx`) already disable the button while posting and reuse one `eventId` per attempt. The landing never sets `ekuzo_s1_joined`, so the site popup auto-opens for landing sign-ups on later pages (thanks page to blog: the 10-24, 10-25 and 11-01 repeats).
- F5. Klaviyo Waitlist `unique_id` is `email-metric-Date.now()`, so a retry writes a second event.
- F6. Baseline `npm test` on `147897a`: 482 tests, 481 pass, 0 fail (`evidence/baseline/npm-test.txt`).

## Journeys every requirement must survive

- J1. Ad tap in the Instagram or Facebook in-app browser to `/season1?ad=d19&utm_...`, sign up, confirmation, Text Karlin.
- J2. Same parent later: thanks page or confirmation, then a blog post or `/schools` (site layout, popup armed).
- J3. Return visit in a new session (same browser, or a different device) and a second sign-up with the same email, inside 24 h and after 24 h.
- J4. Klaviyo email link to `/season1/join?src=email&utm_...`, then the sign-up page, then Stripe test checkout.
- J5. `/karlin` (redirects to join B) and `/season1/join/jersey?ad=d19` (live ads): unchanged.

## W1. /season1/join is a clone of /season1/join/b

Reference: `/season1/join/b` (rendered on the branch). Relationship: **clone**. Allowed deltas: the route path, canonical (none exists on either), page-name labels in analytics.

- R1.1 `GET /season1/join` returns the same HTML body as `GET /season1/join/b` for the same request (host, query, clock), from one shared source (B's template and route code), so the two cannot drift.
- R1.2 `?src=` handling on /join is unchanged: a whitelisted `src` rides onto the sign-up link (`/season1/join/signup?src=email`), anything else is dropped.
- R1.3 Open, closed (`mode off` or window closed) and jersey-cutoff states render as B renders them.
- R1.4 A test renders both routes and fails if their section text differs (it must fail when one template is edited alone).
- R1.5 `app/season1/join/join.html` is removed; no runtime reference remains. Tests that read it (`joinPage.test.ts`, `devView.test.ts:17`, `warmRoute.test.ts:81`, `tags.test.ts:331`) move to `b/join-b.html`, and the two A-only assertions in `joinPage.test.ts` are rewritten against B's copy.
- R1.6 Copy fidelity: visible text of rendered /join diffed against rendered /join/b is empty (ledger).
- R1.8 The built `/season1/join` function traces `app/season1/join/b/join-b.html` (`.next/server/app/season1/join/route.js.nft.json` lists it), and after deploy `curl` of both routes returns 200 with equal body hashes.
- R1.7 Headers on /join unchanged: `x-robots-tag: noindex`, `cache-control: private, no-store`, `referrer-policy: origin`, page security headers.

## W2. Ad codes past d12 and the sign-up honeypot (re-apply 9f3e2e7)

- R2.1 `normalizeAd` accepts `d1` to `d99` in any case with an optional leading zero (`d01` gives `d1`, `D19` gives `d19`); `d0`, `d100`, `d1x`, non-strings and blanks give `""`.
- R2.2 A main sign-up and a Text Karlin step with `ad: "d19"` write `ad: "d19"` on the event and `season1_ad: "d19"` on the profile; the CAPI Lead `content_name` becomes `season_one_d19`.
- R2.3 The sign-up page honeypot input is named `ekz_hp` (not `company`), with `autocomplete="off"`, `data-1p-ignore`, `data-lpignore="true"`, `data-form-type="other"`, label "Leave this empty"; the JSON body key stays `company`, so the commit route and `lib/season1/validate.ts` are unchanged and still reject a filled value.
- R2.4 Signup page changes are exactly the two hunks of `9f3e2e7`: the honeypot input (name, id, label, ignore attributes) and `collect()` reading `g('ekz_hp')`. A browser test proves checkout still posts with the honeypot empty, and a filled honeypot is still rejected.

## W3. One sign-up per email per 24 h (revised after the red team, see 03-decision-log D2 to D7)

- R3.1 `/api/season-one` main sign-up classifies each request inside one Postgres transaction that first takes `pg_advisory_xact_lock(hashtext(<email key>))` (so two concurrent requests for one email serialize), then reads and inserts on `s1_rate_limits` (keys `s1wl:em:<keyHash(email)>` and `s1wl:ev:<keyHash(email|eventId)>`, rolling 24 h): **new** (email not seen), **retry** (email and this `eventId` seen), **repeat** (email seen, this `eventId` not).
- R3.2 new: today's path (Waitlist event, subscribe, CAPI Lead). retry: the same full path again (D4). repeat: subscribe (idempotent) and a `Season 01 Waitlist Repeat` event carrying the same event props, no `Season 01 Waitlist` event, no profile prop overwrite of `season1_joined_at`/`season1_ad`/`season1_source`, no CAPI Lead; response `200 {ok:true, repeat:true}`.
- R3.3 The check fails open: no `DATABASE_URL`, a DB error or a check slower than 800 ms all classify as **new**. It runs after email validation, the key check, the `games`/`age`/`text-karlin` steps and the honeypot, which never touch it.
- R3.4 The Waitlist event `unique_id` is `email-metric-eventId` when the page sent a sanitized `eventId`, else today's form.
- R3.5 Subscribe and CAPI run concurrently once the event is written; worst-case route time 6.8 s plus overhead. The header comment states the new order and budget.
- R3.6 Landing: on `repeat:true` it shows the normal confirmation and fires no Pixel Lead, no GA4 `generate_lead`, no Clarity `signup`. New and retry are unchanged (the once-only guard and shared `eventId` stay).
- R3.7 Landing and popup: the `eventId` belongs to the trimmed, lowercased email it was made for; a different email gets a new `eventId`, re-arms the landing's once-only Lead guard and clears the landing's `savedEmail` until the new sign-up succeeds.
- R3.8 Landing and popup: one POST per tap burst while a request is in flight.
- R3.9 Landing: any successful sign-up (new, retry, repeat) sets `localStorage ekuzo_s1_joined=1`; storage errors are swallowed.
- R3.10 Popup: on `repeat:true` it sets the joined flag and shows done without `trackLead`.
- R3.11 Tests (mocked fetch and a mocked SQL client): new, retry, repeat, each fail-open mode (no URL, throw, timeout), the honeypot and the three steps never call the check, `+` addresses hash like any other, exactly 24 h boundary handled by the SQL interval (asserted on the query text), the lock statement precedes the claim in one transaction, and every response body has only the keys `ok`, and `repeat` when true (no profile data echoed).

## W4. Hero layout shift

- R4.1 Root cause (measured, `evidence/cls/before-probe.json`): `#hero` is empty in the HTML and filled by the end-of-body 1.2 MB script; when the parser paints first, `#join-top` and everything below drop about 450 px at 375 px. It hits every page A hero (d16 0.835, d21 0.787 in the lab), not only d18/d19.
- R4.2 At 375 px (Lighthouse mobile or a layout-shift observer through load plus 3 s), CLS for `?ad=d18` and `?ad=d19` is 0.1 or less after the fix; interactive-hero controls (`?ad=d2`, `?ad=d4`, and `?ad=d19&hero=games`) do not get worse by more than 0.02, and every page A hero (d11 to d21, d1 with `?hero=none`, no `ad`) lands at 0.1 or less. Method: `evidence/cls/measure-cls.mjs` (375x667, DPR 2, CPU 4x, throttled network, max session window, production build, fail-closed analytics block). Before and after numbers in the ledger.
- R4.3 Visual parity (clone of the current page): settled-state screenshots of d18, d19, d21 at 375 and 1440 match before and after.

## Journey to evidence map

| Journey | Proven by |
|---|---|
| J1 | Lane B: in-app UA at 375 on `/season1?ad=d19&utm_*`, sign-up (stubbed API), confirmation, Text Karlin post carries `ad:"d19"`; CLS run; H1 |
| J2 | Lane B: landing sign-up then `/blog` with the site layout: no auto popup, flag set |
| J3 | Route tests (repeat inside 24 h, new after 24 h by query interval); H2 second device |
| J4 | Lane B: `/season1/join?src=email&utm_content=email-b` CTA href carries `src=email`, URL_ALLOW keeps UTMs; signup loads (Stripe test checkout itself unchanged, zero diff) |
| J5 | Zero diff on `b/*`, `jersey/*`, `next.config.mjs`; `curl -sI /karlin` Location unchanged on the build |

## Must-not cases

- M1. A retry after a network error (request reached the server, response lost) records exactly one Waitlist event and Meta counts one Lead.
- M2. A second, different email from the same device is a new sign-up with its own Lead and `eventId`.
- M3. Browser Pixel Lead and CAPI Lead keep the shared `event_id`.
- M4. The 24 h check never blocks a sign-up when the DB check fails (fail open), and a sign-up more than 24 h after the last one counts again.
- M5. Page load, autofill and the page's own focus fire no `form_start` or Lead (existing guards unchanged).
- M6. No kid data in URLs, GA4 or Meta; the repeat path adds none.
- M7. Honeypot-filled sign-ups still write nothing and send no Lead.

## Measurement rows

| Page | GA4 | Meta | Clarity | Attribution | Destination |
|---|---|---|---|---|---|
| /season1/join | `page_view`, `season1_join_view` `{variant:'b'}` (decision D1), CTA events as B; UTMs survive via `{{URL_ALLOW}}` | Pixel `PageView` from `tags.ts` (no Lead on this page) | on (`CLARITY_PAGES.join`) | `src` and UTMs carried to `/season1/join/signup`, then onto the order (unchanged shared path) | GA4 G-8LM45PX53W, Pixel 1284038230557204, Clarity wml8wll5ua |
| /season1 landing (W3, W4) | `generate_lead` once per new sign-up only | browser Lead + CAPI Lead share `event_id`, none on repeat | `signup` event and tag on new sign-ups only | `ad` d1 to d99, UTMs, hero onto the Waitlist event and profile | Klaviyo, Meta, GA4, Clarity |
| site popup (W3) | unchanged on new; none on repeat | Lead pair on new; none on repeat | n/a (layout pages) | unchanged | Klaviyo, Meta, GA4 |
| /season1/join/signup (W2) | unchanged | unchanged | unchanged | unchanged | n/a |
| /season1/join/b, /join/jersey, /karlin | unchanged (zero diff); `page_path` still separates /join from /join/b in GA4 | unchanged | unchanged | unchanged | unchanged |
| Klaviyo `Season 01 Waitlist Repeat` (new metric) | n/a | none | n/a | event props as the Waitlist event | Klaviyo only; no flow triggers on it (new metric); the readout keeps counting `Season 01 Waitlist` |

The route-handler pages bypass `app/layout.tsx`: their tags come only from `lib/season1/tags.ts`.

## Non-regression (zero diff as evidence)

`app/season1/join/b/*`, `app/season1/join/jersey/*`, `app/season1/join/welcome/*`, `app/season1/crew/*`, `app/api/season1/**`, `lib/season1/**` except tests named in R1.4/R1.5, Stripe code, `next.config.mjs`. Signup page: only the R2.3 lines. Klaviyo flows, Meta and GA4 settings untouched. Full `npm test` passes.

## Human checkpoints (no mechanical gate)

- H1. Real phone: tap a d19 ad link in Instagram, sign up with a `team+s1test-1105-*` address, check the hero does not jump.
- H3. Real-device autofill on `/season1/join/signup` (iOS Safari and Android Chrome with a saved address and company): the hidden field stays empty and checkout reaches Stripe.
- H2. Production after deploy: one disposable `?ad=d19` sign-up, then the same email again (expect one Waitlist event with `ad: "d19"`, one Lead in Events Manager).
