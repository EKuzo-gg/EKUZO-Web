# Sentry results, fast-track Part A, build 8550976, 2026-11-10

Main is 3bf6c58 (served from `/home/claude/wt-main`, marker 3bf6c58), branch is 8550976 (marker 8550976 on the served
landing). Both served by PID on 3101 and 3100. Defects: 2, both info (`defects.md`).

| # | Check | Verdict |
|---|---|---|
| 1 | Tests and types | Pass |
| 2 | Diff scope (N4) | Pass |
| 3 | Pixel parity (N1) | Pass with one expected difference (SF-1) |
| 4 | Beacon equality (M1a) | Pass with one extra difference (SF-2) |
| 5 | Attribution (A1, A2) | Pass |
| 6 | Handler (A4) | Pass |
| 7 | Stability (S1a) | Pass |
| 8 | Console sweep | Pass |
| 9 | Secret scan | Pass |

## 1. Tests and types: pass

`logs/01-npm-test.txt`: first suite 607 tests, 606 pass, 0 fail, 1 skipped; field-vitals suite 5 tests, 5 pass.
`logs/01-tsc.txt`: `tsc --noEmit` exit 0 with no output (re-run after adding my test file: still clean). Build
`logs/build.txt`: exit 0.

## 2. Diff scope (N4): pass

`logs/02-diffstat.txt`: 17 files, 228 insertions, 18 deletions in app, lib, middleware.ts, scripts, package.json (no
`scripts` or `package.json` change). Code files: `app/season1/join/b/join-b.html`, `join/jersey/join-jersey.html`,
`app/season1/landing.html`, `lib/season1/attribution.ts`, `joinPage.ts`, `outboxLoad.ts`, `senders/context.ts`,
`senders/discord.ts`, `senders/klaviyo.ts`, `tags.ts`, `middleware.ts`; tests: `attribution`, `committedList`, `joinPage`,
`landingHead`, `outbox`, `tags`. The full 3bf6c58..8550976 name list is `logs/02-allfiles.txt` (37 files; the rest are
docs and Atlas evidence; `public` and `next.config.mjs` have an empty diff).
`logs/02-landing.diff`: landing.html gains exactly 4 lines after the CTA handlers: one comment, the `window.S1.joinHref`
builder, the load-time href setter for `[data-join]`, and one delegated click listener sending `s1_join_click` and
`clarity("event","join_click")`. No CSS, markup or image line changed.

## 3. Pixel parity (N1): pass, one expected difference

Script `s-pixel.mjs`, result `pixel.json`, screenshots in `pixel/`. 412x915 at DPR 2.625 and 1440x900 at DPR 1, images
aborted on both, fonts ready plus 1.5 s, animation frozen, `Math.random` fixed. 16 pairs: 14 md5-equal
(`/season1`, `?ad=d18`, `?ad=d19`, `?ad=d2`, `?ad=d4`, `/season1/join`, `/season1/join/b` at both viewports; e.g.
`/season1?ad=d19` 412 md5 f04f2dedea9692e7ab4f67dafbf01b14 on both). The 2 differing pairs are
`/season1/join/jersey?ad=d21` at both viewports (SF-1): main drops `?ad=` from the address bar and shows the d19 hero,
branch keeps it and shows d21 (`logs/03-jersey-why.txt`). Offenders: none.

## 4. Beacon equality (M1a): pass, one extra difference

Scripts `s-beacon.mjs` (Class Q, fb-android-412 UA, `?s1qa=1`, stubs by host regex, POST `/api/season-one` recorded then
fulfilled) and `s-compare.mjs`; raw lists `beacon-3100.raw.json`, `beacon-3101.raw.json`; comparison
`logs/04-beacon-compare.txt` (timestamps, event ids, `gtm.start`, ISO times and port scrubbed). Offender check: none on
both (stubbed hosts: www.googletagmanager.com, connect.facebook.net, www.clarity.ms).
- Landing `?ad=d18` and `?ad=d19` with utms (load, scroll to the top form, type `qa+sentry@example.com`, submit),
  `/season1`, `?ad=zz`: `dataLayer`, `fbq.queue`, `clarity.q` and the POST body equal on all four (1 POST body each on
  the two form journeys, 0 on the others).
- `/season1/join?src=ad&ad=d18`: `season1_join_view` gains `{ad:"d18", src:"ad"}` (main `{variant:"b"}`); GA4
  `page_location` gains `?ad=d18`. `fbq`, `clarity` equal. As expected.
- `/season1/join/b?src=email`: `season1_join_view` gains `{ad:"", src:"email"}`; nothing else.
- `/season1/join/jersey?ad=d21&utm_source=x`: `page_location` gains `&ad=d21`; `season1_join_view` goes from
  `{variant:"jersey", ad:"d19"}` to `{variant:"jersey", ad:"d21", src:""}`. The `ad` value changed from the hero
  variant to the URL ad (SF-2).

## 5. Attribution (A1, A2): pass

Cookies, `s-cookie.mjs`, `cookies.json` (CDP `Network.getAllCookies`, `ekuzo_lc` HttpOnly, fresh context each):
- `/season1?ad=D019&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d19-a`: `ad:"d19"` with the
  four utms.
- `/season1/join?src=ad&ad=d18`: `ad:"d18"`, no utms.
- `/season1?ad=zz`: no cookie.
- `/season1?ad=d19&utm_source=share&utm_medium=referral`: `ad:"d19"`, `utm_source:"share"`, `utm_medium:"referral"`.
Offenders: none.
`formatSource`, throwaway test `__tests__/sentry-formatsource.test.ts` run with `node scripts/run-tests.mjs`
(`logs/05-formatsource.txt`, 5 of 5 pass): (a) share link: `organic`, with a name `ad d11-a (via organic)`; (b) email
click `s01-open`: `email s01-open`, with a name `ad d11-a (via email)`; (c) `src=ad`, `ad=d19`, no utm: `ad d19` with
and without a name, lookup not needed; (d) `paid_social` and `cpc` with no content: `ad d19`. Extra: utm_content wins
(`ad d19-a`); `ad` null gives `organic`. Matches Atlas's follow-up table.

## 6. Handler (A4): pass

Script `s-handler.mjs`, result `handler.json`. Tagged URL `joinHref()` =
`/season1/join?src=ad&ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a`; bare
`/season1` = `/season1/join?src=ad&ad=d1`. `[data-join]` count 0 on d1 to d21 and noad (22 pages). Injected
`[data-join="top"]`: 0 GA and 0 Clarity events before any input, after raw CDP touch swipes (scrollY 446), after focus,
Tab, Shift+Tab, input, change and paste events; after the first tap 1 `s1_join_click {location:"top", ad:"d19"}` and 1
`clarity join_click`; after the second tap 2 and 2. Offenders: none.

## 7. Stability (S1a): pass

`npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label ft-a-tier1
--expectMarker 8550976 --requireReady`; output `docs/s1-cls-field-2026-11/evidence/vitals/ft-a-tier1/table.md`, log
`logs/07-vitals.txt`. Baseline `docs/s1-cls-field-2026-11/evidence/vitals/branch2-tier1/table.md`.

| Ad | CLS win (ft-a-tier1 / baseline) | LCP med ms | first paint ms | FCP ms |
|---|---|---|---|---|
| d2 | 0.0004 / 0.0004 | 1896 / 1768 | 704 / 816 | 812 / 908 |
| d18 | 0.0035 / 0.0035 | 1476 / 1424 | 728 / 736 | 800 / 868 |
| d19 | 0.0015 / 0.0015 | 1936 / 1904 | 752 / 716 | 804 / 824 |
| noad | 0.0003 / 0.0003 | 2240 / 2288 | 756 / 716 | 816 / 804 |

Windowed CLS under 0.1 on all 12 runs and equal to the baseline to four decimals. LCP moves between -48 and +128 ms and
first paint between -112 and +40 ms, in both directions, with 3 runs against 5 (the d2 LCP +128 ms is in the
direction of the baseline's own d2 spread of 1768 to 1840 max). Checks: marker 8550976, s1Ready 1, form usable 3/3,
page errors 0, POSTs 0, leaks 0, S2 offenders d19 1 (same as baseline).

## 8. Console sweep: pass

Script `s-console.mjs`, result `console.json`, summary `logs/08-console-summary.txt`. 26 pages (`/season1?ad=d1` to d21,
`/season1`, `/season1/join`, `/join/b`, `/join/jersey?ad=d21`, `/season1/thanks`), no `?s1qa`. `pageerror` 0 and
`requestfailed` 0 on all. `console.error` only as the 404 of `/images/new torn paper/torn-paper-*-top-1@2x.png`: 3 on
each join page and 2 on `/season1/thanks` (same artifact; the file is tracked, the path 404s on both 3100 and 3101).
Nothing else. Offenders: none.

## 9. Secret scan: pass

`logs/09-secret-scan.txt`: `git diff 3bf6c58 8550976` (1527 lines), patterns for Stripe keys, webhook secrets, private
keys, AWS, GitHub, Slack, Google and JWT tokens and generic key/secret assignments on added lines: no match. Emails other
than ekuzo.gg, anthropic.com, example.com: none (the one regex hit, `-top-1@2x.png`, is an image filename). The only long
hex strings are sha256 and md5 values in Atlas's evidence JSON.

## Servers

Both stopped by PID (3100 from this worktree, 3101 from `/home/claude/wt-main`); `logs/servers-stopped.txt`:
`fuser 3100/tcp 3101/tcp` exit 1 with no PIDs and curl to both ports returns 000.
