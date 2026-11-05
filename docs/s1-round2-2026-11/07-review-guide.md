# 07 Review guide: Season 01 round 2 (Fable, 2026-11-05)

## 60-second summary

- **Sign-up guards:** per-IP limit (10 an hour: saved, no Lead; 30: refused with a text-our-founder line; 150 new sign-ups an hour site-wide: no Leads). Only new sign-ups count. Follow-up steps (Text Karlin, games, age) need a matching sign-up from the last 24 h; Text Karlin capped at 3 a day per email. Meta gets the Netlify client IP only; no emails in logs; cross-site posts refused.
- **Landing speed and shift:** ad images moved out of the page (1.35 MB to 127 KB). Interactive heroes reserve their box on phones: d2 0.39 to 0.05, d4 0.18 to 0.002, d1 0.32 to 0, d10 0.32 to 0.0003, `?hero=games` 0.16 to 0.0003; page A unchanged; pixel diff at most 0.033 % across 42 before and after pairs. d9 stays at 0.17 (paused for good, accepted).
- **Search:** `/season1/join` indexable on ekuzo.gg in live mode only, fixed canonical, a 145-character description, Course and Offer JSON-LD ($580 per kid, $100 covers January then $160 a month, siblings 20 % off; SoldOut when closed). Every other Season 01 page stays noindex. In the sitemap.
- **Canon:** Season 01 section written to the FAQ canon (Jamie approved 11:47 CT).
- Tests: 575, 574 pass, 0 fail. Sentry A (server, SEO, real Postgres 16), Sentry B (browser, CLS, pixel parity), Steward (claims). Every code defect found was fixed and retested by its finder (SA-1, SA-3, SA-4, SA-9).

## Decisions, most overrulable first

R2-D1 (quiet at 10 not 5), R2-D11 (a repeat unlocks its own steps; small re-sign-up gap capped at 3 texts a day), R2-D12 (email-only step fallback for old cached pages, remove in a week), R2-D7 (no bot exclusion from tags), R2-D6 (no FAQPage markup). Full list: `03-decision-log.md`.

## After the push (Claude does these)

1. Verify live: `/season1/join` has no noindex and has the canonical and JSON-LD; `/join/b` still noindex; `/season1?ad=d2` loads its images from `/images/season1/landing/`.
2. One test sign-up and a repeat on production (`team+s1test-1105-r2@ekuzo.gg`) to prove the claim and IP counter on the live database.
3. `log.md` line with the deploy time (confounder: Leads may drop slightly if real families share an IP; watch the quiet warn count).
4. Submit `/season1/join` in Search Console (Jamie, URL inspection, request indexing) and run Google's Rich Results test on it.

## Follow-ups

Remove the email-only step fallback (about 11-12); index on `s1_rate_limits.window_start` (migration); bot exclusion from tags if ViewContent jumps; welcome copy "from Feb 15" once dates are set; jersey gamer-tag promise in ads once the team decides.
