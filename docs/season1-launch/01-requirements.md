# 01 Requirements: Season 01 sign-up wiring (Build Loop, retro-applied)

Author: Fable (lead session), 2026-10-10. Code was written before this loop ran (builder agent,
2026-10-10 morning); this loop is the independent review, verification, live check and release.
Plan of record: `EKUZO/Marketing/ads/2026-10-season-one/plan.md`. Method:
`knowledge-base/company/marketing/channels/meta-ads.md`. Contract doc in repo:
`docs/season-one-tracking.md`.

## Scope

| Branch | Head | Base | Ships to |
|---|---|---|---|
| `release/season1` | 4457689 | origin/main 3aefd6c | production (ekuzo.gg). PRIMARY review target |
| `feat/season1-launch` | 73ca059 | origin/dev 2f3a83f (Aaron) | dev deploy. Same code files as release (verified `git diff` empty on app, components, lib, context, middleware, next.config, docs, landing, images) plus Aaron's internal roadshow pages and 24 ad JPGs |

Owner lanes: Aaron owns copy and design (landing page, popup). This loop does not change copy;
copy findings route to Jamie/Aaron as decisions, not edits, unless factually wrong.

## Requirements

### Product
- **P1** `/season1?ad=dN&utm_*` (N = 1..12) returns 200, keeps the URL, renders ad dN's landing variant; query string reaches the page. Same page reachable at `/roadshow/landing.html`.
- **P2** Landing email sign-up: valid email -> confirmation state; invalid -> inline error, no confirmation; server failure -> retry message, no confirmation.
- **P3** Confirmation offers optional game chips (multi-select); tapping records `kid_games` in Klaviyo only.
- **P4** Site popup sign-up (`/?join=season-one`, nav/sticky/enroll CTAs) works end to end with the same contract.
- **P5** `SEASON_ONE_MODE` (default on): `/programs/*/register` 307 to the program page with `?join=season-one`; `/success` pages untouched. (Aaron's; Jamie confirmed intended 2026-10-10.)
- **P6** Production branch excludes Aaron's internal pages (`public/review.html`, `public/roadshow/{ad-lab,ads,index,site,vote}.html`) and the ad JPGs.
- **P7** Landing page is `noindex`.

### Tracking (the ads optimize on this)
- **T1** Landing loads Meta pixel `1284038230557204` and fires `PageView`.
- **T2** Browser `Lead` fires exactly once per successful sign-up, only after the API returns ok, with `{eventID}`; a retry after failure reuses the same eventId; a second submit after success does not fire again.
- **T3** Server CAPI `Lead` (Graph v26.0) with the same `event_id`, sent only after the Klaviyo event succeeds, awaited before response; `content_name` identical to the browser's (`season_one_dN` / `season_one_popup`); `user_data`: sha256 `em`, ip, ua, `fbp`, `fbc` (cookie or rebuilt from `fbclid`).
- **T4** Nothing about the child (games, age) is ever sent to Meta.
- **T5** Games/age steps write Klaviyo only; no Meta event.
- **T6** Klaviyo: event metric "Season 01 Waitlist" with `source, ad, ad_name, where, utm_source/medium/campaign/content/term, page`; profile `season1_*`; subscribed to list `XGTv2F` with marketing consent.
- **T7** Clarity `wml8wll5ua` loads on the landing page.
- **T8** On hosts other than ekuzo.gg, `*.netlify.app`, localhost: form saves nothing and fires no Lead.
- **T9** `META_CAPI_USE_TEST_CODE=true` routes CAPI to Test Events; true without a code skips rather than sending live.

### Robustness and security
- **S1** Honeypot `ekz_hp` non-empty on main sign-up: 200, no Klaviyo write, no Lead. Field hidden from people and autofill.
- **S2** Inputs validated and length-capped; no secret reaches the client bundle; no user input reaches a URL or header unescaped.
- **S3** Meta failure never fails a sign-up; Klaviyo event failure returns 502 and sends no Lead.
- **S4** Abuse exposure (no rate limit, unauthenticated games step) assessed and either mitigated or accepted with rationale.

### Non-regression
- **N1** Protected surfaces zero-diff vs base: `app/api/webhooks/**`, `app/api/{camps,checkout,contact,ekuzo100,ekuzo101,newsletter,squad,swamp,teams,woodward}/**`, `app/programs/*/success/**`, `lib/schema.ts`, `components/JsonLd.tsx`.
- **N2** `tsc --noEmit` clean; ESLint clean on changed files; `next build` succeeds; no `.mp4` in `.next/server`, server bundle size recorded.
- **N3** Browser-truth: console free of our errors on `/season1?ad=d1`, `?ad=d3`, `?ad=d10`, `/`, `/?join=season-one`, `/programs/ekuzo-camps`, the register redirect.
- **N4** Visual parity, relationship **clone**: reference = Aaron's landing at origin/dev 2f3a83f and popup at 2f3a83f. Allowed deltas: pixel/Clarity tags, hidden honeypot input, tracking script. Side-by-side at 1440 and 375, states: empty form, confirmation.

### Live (after push)
- **L1** Dev deploy serves P1 and `/ads/season1/d1-a-toomuch-feed.jpg`.
- **L2** One real test sign-up on dev: Klaviyo profile + event + list membership; Meta browser and server Lead with one event ID (Test Events or dataset stats WEB_ONLY/SERVER_ONLY); Clarity session.
- **L3** Netlify env vars present per context (human check).
- **L4** After release: same checks on ekuzo.gg; internal pages 404 on production.

## Acceptance
Every ID above has a ledger row in `04-evidence-ledger.md` with evidence, or a defect link, or an
accepted-risk rationale. No open critical/major. Jamie's explicit go before the push to main.
