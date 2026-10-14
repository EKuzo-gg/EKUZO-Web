# 03 Decision log (Fable), most overrulable first

| ID | Decision | Why | Who |
|---|---|---|---|
| D1 | A hero sign-up with no answer records `season1_hero_answer = "skipped"`; page A records `""` | Reads need to tell "skipped the question" from "never saw one" without a second field | Fable, overrulable |
| D2 | `?hero=` with an unknown value is ignored and the ad table applies | A typo in a link should still land the parent on Aaron's page for that ad, not page A | Fable, overrulable |
| D3 | Bare `/season1` and invalid `ad` stay page A (the d1 fallback never maps to d1's hero) | Not an ad visit; Aaron's table is per ad | Fable, overrulable |
| D4 | Site-popup sign-ups get no hero fields | They already carry `ad`, so the page is known from the table for every ad except d10. Carrying the d10 half into the popup means changing `lib/attribution.ts` and the popup component for a handful of sign-ups; not worth the blast radius during a live campaign | Fable, overrulable |
| D5 | Share link always carries `hero` (`none` for page A) | The second parent sees exactly the page the first one saw | Fable |
| D6 | d12 (live) and d11 (held) open page A | Not in Aaron's table; question for Aaron pending (H3) | Fable, pending Aaron |
| D7 | No Meta edits: route on the site by `?ad=`; page shows in Klaviyo, GA4 params and Clarity instead of ad-name suffixes | Jamie 2026-10-14 (1). Week-one no-edit rule; `{{ad.name}}` fixed at first publish; URL edits can restart learning | Jamie |
| D8 | No holdout: every mapped ad switches fully | Jamie 2026-10-14 (2): Aaron's creative decision | Jamie |
| D9 | Aaron's copy, layout and confirmation ship exactly as on dev (clone) | Jamie 2026-10-14 (3) and (4) | Jamie |
| D10 | d10 split is per browser, sticky in localStorage, 50/50 | Aaron's handoff asks for B vs C on D10; the site does it since Meta won't split a duplicate evenly | Aaron, Jamie |
| D11 | Story, Steward and Parent copy roles not spawned | No copy is written or changed in this run; Sentry's browser lane checks the rendered pages against the dev reference (clone) | Fable |
| D12 | Accepted consequence of D7: Ads Manager cannot compare d10's two pages (pixel and CAPI content_name stay `season_one_d10`); d10 page results come from Klaviyo, GA4 and Clarity. Every other ad has exactly one page, so its Meta numbers are per page | Auditor phase 1 finding 1; tell Aaron | Fable |
