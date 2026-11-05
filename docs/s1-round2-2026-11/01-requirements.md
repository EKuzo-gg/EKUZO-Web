# 01 Requirements: Season 01 round 2 (2026-11-05)

Author: Fable. Loop: `knowledge-base/company/agents/agent-loop/build-loop.md`. Start: `main` `a919b25` (round 1 live 11:08 CT), branch `build/s1-round2`. Jamie approved the five defaults in chat 11:16 CT ("i agree with your recommendations"). Slices ship in this order: S1 hero fix, then S2 (rate limit, step lock), then S3 (canon, then indexing).

## S1. Interactive hero layout shift (live main ads d2, d4)

- R1.1 Root cause measured (Scout, `scout/ihero-cls.md`).
- R1.2 At 375 px, 7 runs, the round-1 method: `?ad=d2`, `?ad=d4`, `?ad=d1`, `?ad=d3`, `?ad=d19&hero=games` reach CLS 0.1 or less; page A heroes stay at 0.1 or less; desktop (1440) no worse than +0.02.
- R1.3 Settled pages pixel-identical before and after (375, 1440) for d2, d4, d19&hero=games and one page A hero; the hero question, answers, form move into `.ih-slot` and the d10 split work as before.

## S2. Sign-up route abuse guards (`app/api/season-one/route.ts`)

- R2.1 Per client IP (`x-nf-client-connection-ip`, else first `x-forwarded-for`), on main sign-ups only, after the honeypot: more than 5 in a rolling or fixed hour: the sign-up is saved as usual (event, subscribe) but no CAPI Lead is sent and the response carries `quiet:true`, so the page fires no browser Lead, no GA4 `generate_lead` and no Clarity `signup`; more than 30 in an hour: `429 {ok:false, error}` with the text "Too many sign-ups from this connection. Text our founder at …" (number from `OFFER.textKarlinSms`), nothing written.
- R2.2 Uses the existing `hit()` / `s1_rate_limits` with a hashed IP key (`keyHash`), never the raw IP in the key or logs. The check fails open (DB error or more than 800 ms: treated as under the limits). Worst-case route time stays inside Netlify's 10 s.
- R2.3 `games`, `age` and `text-karlin` steps are accepted only when the request's `email` plus `eventId` match a main sign-up claim from the last 24 h (`s1wl:ev:` key). No match: `200 {ok:true}` with nothing written (a stranger learns nothing). DB error or timeout: the step proceeds (fail open). The landing and popup send the sign-up's `eventId` with every step.
- R2.4 Response bodies carry only `ok`, and `repeat`, `quiet` or `error` when set. Tests for every branch, fail-open modes, and that no raw IP or email reaches a log line.
- Must-not: a family behind a shared school or office IP is never silently dropped below 30 an hour; a repeat or quiet sign-up still shows the normal confirmation; the honeypot stays a silent 200.

## S3. Season 01 in the FAQ canon, then index /season1/join

- R3.1 Story drafts Season 01 canon entries (price today and monthly, season total and dates, how paying works, sibling and friend discounts with the one-kid wording Jamie accepted, refunds and the Dec 31 lock-in, the jersey, practice twice a week) from `lib/season1/offer.ts`, the Season 01 terms and join B's answers, voice stack loaded. Jamie approves the exact wording before it is written to canon (KB rule 2).
- R3.2 `/season1/join` becomes indexable: no `noindex` meta or `x-robots-tag`; `<link rel="canonical" href="https://ekuzo.gg/season1/join">`; a real title and meta description; JSON-LD built in `lib/schema.ts` (Course plus Offer with the Season 01 price, FAQPage from the canon answers, breadcrumb), server-rendered. `/season1/join/b`, `/season1/join/jersey`, `/season1`, `/season1/join/signup` stay noindex.
- R3.3 One template still serves /join and /join/b; the only allowed delta is the head SEO block (robots, canonical, description, JSON-LD), passed per route. The drift test compares everything outside that block.
- R3.4 `/season1/join` is in `sitemap.xml`; `llms.txt` already links it (check wording against the canon).
- R3.5 Measurement row unchanged (GA4, Pixel, Clarity as today); validator pass for the JSON-LD; Google Rich Results test noted for Jamie after deploy.

## Non-regression

Checkout, welcome, crew, `app/api/season1/**`, Stripe code: zero diff. Full `npm test` passes. Round 1 behavior (dedupe, repeat, retry, popup flag, page A hero box) unchanged.
