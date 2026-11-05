# Sentry B results (HEAD 54e9a5d, after = :3170, before a919b25 = :3171)
Guard: see guard.md. Blocked analytics requests recorded: 0 in every run (the page's tags are hostname-gated to ekuzo.gg, so none load on localhost); the block route was live from the first request regardless. /api/season-one stubbed in every S2 case. Scripts and raw JSON are in this folder.

## 1 Images: PASS (one low note)
d1 to d21 plus d2 hero=amount/games, d4 hero=shortlist/screentime at 375: every image request 200, no failures, no broken `img` in the DOM, zero `data:` entries in IMG (before had 10). Direct fetch of all 13 IMG keys: 200 image/webp. Offered bg keys mc-blocks, kid-couch, team-walk, hands-in: 200. `esports-room`: no IMG entry (also absent before) -> SB-2. (`images.json`)

## 2 CLS (7 runs, 375x667, throttled; `cls-table.md`)
After median is 0.1 or less on 16 of 17 variants. FAIL: d9 0.1693 (SB-1). Before to after: d1 .32 to 0, d2 .386 to .054, d3 .169 to .0003, d4 .177 to .002, d5 .19 to .001, d6 .158 to 0, d8 .147 to .0005, d10 .32 to .0003 (max .0149), d19&hero=games .161 to .0003. Unchanged and small: d11, d16, d18 (.0047), d19, d21, d2&hero=none (.0153), no ad.
1440: d2 .0986 to .0987 (+0.0001), d19 .0189 to .0275 (+0.0086); both within +0.02.

## 3 Visual parity: PASS
Settled (8 s) before/after pixel diff share (channel delta sum > 24), d1 to d21 at 375 and 1440: max 0.033 % (d17 1440), d1 1440 0.029 %, d6 375 0.01 %, all others 0 %. No pair above 0.5 %, no side-by-sides needed. Math.random pinned for the d10 split. 2 s throttled after screenshots: `screenshots/sentry-b-after-d2-375-2s.png`, `...d4-375-2s.png` (d2 shows the finished hero with the question and four options at 2 s). (`shots.json`)

## 4 S2 browser: all PASS (`s2.json`)
Landing: control {ok:true} fires fbq Lead, gtag generate_lead, clarity signup (stubs record); quiet and repeat: 0 Lead calls, confirmation shown, joined flag "1", one POST. 429: exact text shown, button re-enabled (label "Save their spot"), one POST over 5 s (no retry), no confirmation, no joined flag, no Lead. Popup (/blog?join=season-one): control fires Lead; quiet: 0 Lead calls, confirmation, joined "1"; 429: exact text in #s1-err, button enabled, one POST, no joined. Steps: games on hero=games and text-karlin (hero=games and default hero) POST bodies carry the sign-up eventId and email; popup games step likewise. Screens: `sentry-b-landing-429.png`, `sentry-b-popup-429.png`.

## 5 Console errors: PASS
d1 to d21 at 375 and 1440, before and after: zero console errors, page errors, 4xx/5xx or failed requests in either build; no new errors.
