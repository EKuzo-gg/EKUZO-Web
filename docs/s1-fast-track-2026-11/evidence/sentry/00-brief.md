# Sentry brief, fast-track Part A (Fable, 2026-11-10 13:02 CT)

You verify Part A of the slice in `docs/s1-fast-track-2026-11/00-brief.md` (A1 to A6) on the merged
branch tip 8550976. Atlas's self-test is `docs/s1-fast-track-2026-11/evidence/atlas/part-a.md`; read
it, then produce your own evidence. You fix nothing; defects go to `defects.md` with severity,
evidence path and owner.

## Where

- Branch worktree: `/home/claude/wt-sentry`, branch `lane/ft-sentry` at 8550976, `node_modules`
  present. Build it: `COMMIT_REF=8550976 STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npm run build`,
  serve on 3100 by PID (`./node_modules/.bin/next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid`).
- Main (live code, `3bf6c58`): `/home/claude/wt-main`, already built with marker `3bf6c58`; serve on
  3101 the same way. Stop both by PID at the end, then `fuser PORT/tcp` for the `next-server` child.
  The repo hook blocks `pkill -f`, `pgrep -f`, `ps | grep`. Pid and log files are gitignored.
- Harness: `scripts/field-vitals/README.md` (`npm run vitals -- ...`). Playwright 1.63 global,
  `createRequire("/home/claude/")`, Chromium with `proxy: { server: process.env.HTTPS_PROXY }`.
- Your folder: `docs/s1-fast-track-2026-11/evidence/sentry/`. Commit on `lane/ft-sentry`; never push.
  Git identity: `git config user.name Claude && git config user.email noreply@anthropic.com`.

## Run classes

Class T (harness) blocks analytics itself. Class Q (your beacon scripts, `?s1qa=1`, localhost only):
stub by host regex (`/(^|\.)googletagmanager\.com$/`, `/(^|\.)google-analytics\.com$/`,
`/(^|\.)clarity\.ms$/`, `/(^|\.)facebook\.(net|com)$/`, `/(^|\.)doubleclick\.net$/`, `/(^|\.)bing\.com$/`)
to 204, fulfil POST `/api/season-one` with 200 `{"ok":true}` after recording the body, and end every
script with an offender check: hosts that answered from the network minus `localhost`,
`fonts.googleapis.com`, `fonts.gstatic.com` must be empty, else the run is discarded and reported.
Never touch ekuzo.gg or dev. No identities beyond `qa+sentry@example.com` against the stub.

## Checks, in order

1. **Tests and types.** `STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npm test` (expect 607 + 5,
   1 skipped) and `./node_modules/.bin/tsc --noEmit`. Save the output.
2. **Diff scope (N4).** `git diff --stat 3bf6c58 8550976 -- app lib middleware.ts scripts package.json`
   and the full diff of `app/season1/landing.html`: it must be the `[data-join]` handler, the
   `joinHref` builder and nothing else (no CSS, no markup, no image change). List every changed file.
3. **Pixel parity (N1).** Main (3101) vs branch (3100), 412x915 at DPR 2.625 and 1440x900 at DPR 1,
   after `document.fonts.ready` plus 1.5 s, images blocked the same way on both: `/season1`, `?ad=d18`,
   `?ad=d19`, `?ad=d2`, `?ad=d4`, `/season1/join`, `/season1/join/b`, `/season1/join/jersey?ad=d21`.
   md5 of each pair equal; any difference gets a diff image and a defect.
4. **Beacon equality (M1a).** Class Q, fb-android-412, on 3100 and 3101 for the journeys: landing
   `?ad=d18` and `?ad=d19` with utms (load, scroll to the top form, type the email, submit), `/season1`,
   `?ad=zz`. Compare `dataLayer`, `fbq.queue`, `clarity.q` and the POST bodies after removing
   timestamps, event ids and `gtm.start`. Expected: equal on the landing. On the join pages
   (`/season1/join?src=ad&ad=d18`, `/join/b?src=email`, `/join/jersey?ad=d21&utm_source=x`): equal
   except that `season1_join_view` carries `{ad, src}` and GA4's `page_location` includes `ad=`; list
   every other difference as a defect.
5. **Attribution (A1, A2).** Through CDP `Network.getAllCookies` on 3100: after
   `/season1?ad=D019&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d19-a`
   the `ekuzo_lc` cookie holds `ad=d19` and the utms; after `/season1/join?src=ad&ad=d18` (fresh
   context) it holds `ad=d18`; after `/season1?ad=zz` (fresh) there is no cookie; after
   `/season1?ad=d19&utm_source=share&utm_medium=referral` the cookie holds `ad=d19` with source share.
   Then, with node, drive `formatSource` from `lib/season1/senders/discord.ts` the way the tests do
   (reuse the test harness `node scripts/run-tests.mjs` by writing a throwaway test file under your
   folder, not under `lib/`) for the four cases in Atlas's follow-up table and confirm them.
6. **The handler (A4).** On 3100 `?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1`:
   `window.S1.joinHref()` equals
   `/season1/join?src=ad&ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a`;
   on bare `/season1?s1qa=1` it equals `/season1/join?src=ad&ad=d1`; zero `[data-join]` elements on
   every variant d1 to d21 and noad; an injected `[data-join="top"]` link fires exactly one
   `s1_join_click {location:"top", ad:"d19"}` in `dataLayer` and one `clarity("event","join_click")`
   per click, and nothing on scroll (raw touch events as the harness journey does), focus, Tab or
   paste.
7. **Stability (S1a).** `npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label ft-a-tier1 --expectMarker 8550976 --requireReady`
   and compare with `docs/s1-cls-field-2026-11/evidence/vitals/branch2-tier1/table.md` (same code
   apart from the four lines): windowed CLS under 0.1 and within 0.001 of that table; LCP and first
   paint within noise (state the numbers).
8. **Console sweep.** 3100, fb-android-412, no `?s1qa`: `/season1?ad=dN` for N 1 to 21, `/season1`,
   `/season1/join`, `/season1/join/b`, `/season1/join/jersey?ad=d21`, `/season1/thanks`: `console.error`,
   `pageerror`, `requestfailed` per page; the three torn-paper 404s on the join pages are a local
   `next start` artifact (the files have a space in their path and serve 200 on ekuzo.gg); anything
   else is a finding.
9. **Secret scan.** `git diff 3bf6c58 8550976` grepped for key, token and private-key patterns and for
   emails beyond ekuzo.gg, anthropic.com and example.com: expect none.

## Output

`results.md` (each check: pass or fail, the numbers, the file), `defects.md` (SF-n, severity, type,
where, evidence, owner), scripts and JSON in your folder. Prose: no em dashes, no "It's not X, it's Y"
reframes, sentence-case headings; every number names its file. Hand back with the nine verdicts, the
defect count, the commit list (`git log --oneline 8550976..lane/ft-sentry`), and proof both servers
are stopped and the ports free. Nothing about the user goes to memory.
