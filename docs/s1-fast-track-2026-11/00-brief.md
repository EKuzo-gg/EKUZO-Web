# 00 Brief: Season 01 fast track ("interest first, join today"), 2026-11-10

Fable, 12:50 CT. Approved by Jamie 12:42 CT ("let's do it") after the discussion of Aaron's plan
(`season1-interest-first-switch.md`, his doc, and the Miro board "Season 01: interest first, join
today"). Build Loop, one slice in two parts. Branch `build/s1-fast-track` from `build/s1-cls-field`
1b3cbba (main's code plus yesterday's docs). Yesterday's run and its gates: `docs/s1-cls-field-2026-11/`.

## Goal

Keep the waitlist as the primary path on every ad landing page (the nurture is how a family learns
about EKUZO), and add a fast track for a parent who is ready now: a link to `/season1/join` under
each email form and a lock-in card after a sign-up, with the tracking that lets the readout count
purchases next to leads per ad. Nothing existing changes meaning.

## Clarity Gate

| Row | Level | Note |
|---|---|---|
| Goal | High | above |
| Constraints | High | pixels of everything that exists stay a clone of Aaron's design (D6 of the last run); the additions are his design (v2); yesterday's bootstrap, preloads, fonts, marker, masks and sentinels stay; servers by PID; Class T on dev and prod, Class Q on localhost with host-regex stubs and an offender check; no sign-ups on dev; live means live on ekuzo.gg |
| Success | High | Part A: tests green, beacon lists equal main except the additions, `ad` on orders, join pages carry ad and src; Part B: harness Tier 1 (fb-android-412, d18, d19, d2, noad) no worse than `evidence/vitals/live-after/table.md`, CLS under 0.1 with no new source, pixel parity on everything but the two additions, the fast-track link and card tap-measured |
| Context | Med | Aaron's `landing-v2.html` and his doc are not on main, dev or the mounted drives (12:40 CT); Part B waits for his push. Part A does not need them. |

## Part A (Atlas now): attribution and events, no visible change

A1. `ad` becomes a kept last-click key in `lib/season1/attribution.ts`: `LC_KEYS` adds `"ad"`;
    value normalized the way the landing does (`lowercase`, `d0N` to `dN`), valid only as
    `/^d[1-9]\d?$/`, else dropped; `DROP_ORDER` keeps it last (3 bytes). `URL_ALLOW_KEYS` derives from
    `LC_KEYS`, so the join pages keep `?ad=` in the address bar (closes M-6); confirm the jersey page's
    `d20`/`d21` switch now works from a tagged URL.
A2. The order's `lc.ad` reaches the Discord commit line and the Klaviyo Committed event:
    `outboxLoad.ts` reads `ad` from `oa.lc` into `OrderCtx.ad`; `formatSource` branch (c) uses
    `ad <utm_content>` as today and, when there is no utm_content but `lc.ad` is set, `ad <ad>`;
    `klaviyo.ts` Committed event props add `ad` (empty string when absent), never on the profile.
A3. `season1_join_view` carries `{variant, ad, src}` on `/season1/join`, `/join/b` and `/join/jersey`
    (`ad` from the URL after the allow list, `src` from the page's `cfg`/URL; empty strings when absent).
A4. Landing: a guarded `ga("s1_join_click",{ad, location})` plus `clarity("event","join_click")` for
    the fast-track links, attached to `[data-join]` elements on click only (no scroll, focus or
    autofill), one per tap. The link href is `/season1/join?src=ad&ad=<resolved ad id>` with the
    landing URL's `utm_*` appended when present. Part A adds the handler and the href builder only;
    the visible elements arrive in Part B (so Part A ships no `[data-join]` element).
A5. Tests: attribution (ad kept, normalized, invalid dropped, drop order), URL allow (ad kept on join
    pages), `formatSource` with `lc.ad`, Committed props, join_view fields (string checks on the
    rendered HTML), the href builder.
A6. `docs/season-one-tracking.md`: rows for `s1_join_click` and the join_view fields; `ad` in the kept
    keys; `src=ad` meaning.

## Part B (Atlas, when Aaron's file lands): the two visible additions

B1. Port from `landing-v2.html` onto the live `landing.html`: the "Ready now? Save their spot for
    $100" link under the top and bottom forms (`data-join`, href from A4) and the lock-in card on the
    confirmation state. Copy is Aaron's, verbatim.
B2. Hero button label "Get the details" on d6, d9, d11, d13 and d14 where it reads "Save their spot"
    today (his doc), so "Save their spot" only ever means paying.
B3. Pixel parity: every screenshot pair identical except the two additions (the diff regions listed
    in the evidence); no CSS or image change elsewhere.
B4. Harness Tier 1 and the Class Q equality run on the final build; dev deploy; Jamie's phone look at
    d19 on dev; main on his go.

## Not in this slice

Meta ad copy (Aaron's next refresh, after the flip), Google ads (paused), the Committed flow's
nurture content for fast-track families (Aaron's), the age range (align to canon 9 to 17, no code),
`fetchpriority` trial (OR-H2), the outbox alert (M-2).

## Decisions

| ID | Decision | Why | Overrule by |
|---|---|---|---|
| F1 | One landing file; v2's additions are ported onto `landing.html`, no `S1_LANDING` env switch. | The route is `force-static`, so an env var is read at build time and a flip is a deploy either way; a second file would ship without yesterday's speed work. | Jamie or Aaron: keep two files (then v2 must be rebased on today's landing first). |
| F2 | `ad` joins the kept keys rather than relying on `utm_content` alone. | Share links and bare `?ad=` visits carry no utm; the order should still name the ad. | n/a. |
| F3 | Part A ships without visible change and can go to main on its own if Part B is late. | Attribution hardening has no downside and the Nov 11 readout benefits. | Jamie: hold A for B. |
| F4 (13:00, from Atlas's own report) | The Discord source line reads `ad <id>` from the last-click `ad` only when that click was paid or carried `src=ad`; a share link or an email that happens to carry `ad` keeps today's branches (Klaviyo name, email, first touch, organic). | The first cut applied it to any tagged click, which would have labelled share-link orders as ads. Ten equality tests pin the old behaviour for those cases. | n/a. |
| F6 (13:22, from Sentry SF-1 and SF-2) | Accepted as intended: the jersey page now keeps `?ad=` and shows the d20/d21 variant from a tagged URL (M-6 closed), and its `season1_join_view.ad` is the URL's ad (empty when absent) instead of the hero's default `d19`. The readout counts join views by `ad` and never relied on the jersey default. | Sentry's pixel pair for `/join/jersey?ad=d21` differs only because main dropped the parameter. | n/a. |
| F5 (13:00) | `?ad=` is normalised everywhere the same way (lowercase, `d0N` to `dN`, valid `d1` to `d99`): the cookie, the join pages' view event and the jersey hero switch. | The jersey switch compared the raw value, so `?ad=D021` showed d19 while the event said d21. | n/a. |
