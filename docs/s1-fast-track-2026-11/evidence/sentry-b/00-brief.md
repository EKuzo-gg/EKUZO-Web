# Sentry brief, fast-track Part B (Fable, 2026-11-10)

You verify Part B (the visible additions ported from Aaron's `landing-v2.html` onto the live
landing) on the merged tip `TIP` (Fable fills it in the launch message), then the dev deploy
`DEV_SHA`. Read first: `docs/s1-fast-track-2026-11/00-brief.md`, `evidence/atlas/part-b.md`
(Atlas's port table and self-test), and your Part A brief and results in `evidence/sentry/` (same
run classes, same stubs, same offender check, same servers by PID). You fix nothing.

## Where

Worktree `/home/claude/wt-sentry`, branch `lane/ft-sentry-b` from `TIP`; build with
`COMMIT_REF=<TIP>` and serve on 3100; main `3bf6c58` from `/home/claude/wt-main` on 3101. Your
folder: `docs/s1-fast-track-2026-11/evidence/sentry-b/`.

## Checks, local

1. Tests and types (expect Atlas's totals in `part-b.md`); `tsc --noEmit`.
2. Diff scope: `git diff 3bf6c58 <TIP> -- app/season1/landing.html` is Part A's four lines plus the
   ported hunks listed in Atlas's port table and nothing else; nothing of his file's head, tags,
   image tables or old base leaked in (grep the landing for `base64,`, `fbevents.js`, `gtag/js`,
   `netlify\.app` in the LIVE regex: none; `{{TAGS}}`, `{{BUILD}}`, `s1-fonts`, `data-s1-pre`,
   `HERO_IMG`, `d19`, `d21` present).
3. Pixel parity with expected regions: main vs branch, 412x915 DPR 2.625 and 1440x900, for
   `/season1`, `?ad=d18`, `?ad=d19`, `?ad=d2`, `?ad=d4`, `?ad=d6`, `?ad=d9`, `?ad=d11`, `?ad=d13`,
   `?ad=d14`, `?ad=d21`, in two states (after fonts ready, and the confirmation state after a stubbed
   submit on d18 and d19). Compute the diff mask per pair and list the bounding boxes; every box must
   sit inside one of: the top form block, the bottom form block, the two FAQ answers, the sticky bar,
   the confirmation card, a hero CTA label on d6, d9, d11, d13, d14. A box anywhere else is a defect.
   Also confirm the page above the top form (header, hero) is byte-identical on d18, d19, d2 and noad
   (crop and md5).
4. Beacons and journeys (Class Q): on d18 and d19 with utms, the full journey (load, scroll, tap the
   top ready link, back, type the email, submit, tap the lock button): `s1_join_click` once per tap
   with `{location, ad}`, Clarity `join_click` once per tap, `generate_lead` and `Lead` once with one
   event id, the POST body as on main; `dataLayer`, `fbq.queue` and `clarity.q` equal main's apart from
   the new events; the three hrefs carry `src=ad`, `ad` and the utms; the ready links and the lock
   button are real anchors (keyboard focusable, `href` set, open `/season1/join` when followed in a
   second tab on localhost and the join page's `season1_join_view` carries `ad` and `src=ad`).
5. Stability: `npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label ft-b-tier1 --expectMarker <TIP> --requireReady`,
   then `--profile ig-android-412 --runs 3 --label ft-b-tier1`: windowed CLS under 0.1 with no new
   source (the ready link and the lock card must not appear in the sources list), LCP and first paint
   within noise of `evidence/vitals/ft-a-tier1/table.md`. Also the journey's S4 header crossings.
6. Console sweep (22 variants, join pages, thanks): 0 ours.
7. Copy check (read-only, report only): list every dated or numeric claim in the ported copy
   ("Covers January", "fully refundable until Dec 31", "mid January 2027", "$100", "First 100
   families get a free jersey") next to what the join pages (`{{JERSEY_SHORT}}`, `offer.ts`) and the
   Day 4 email say; flag any that disagree or that will go stale on a date.

## Checks, dev (after Fable's push; Class T only, never `?s1qa=1`, never submit)

8. OR7 marker `DEV_SHA` on `/season1`, `?ad=d18`, `?ad=d19`; D1 body equals the source apart from the
   two fills; N6 headers vs ekuzo.gg; console on 22 variants; `npm run vitals -- --target https://dev--ekuzo.netlify.app --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label ft-b-dev --expectMarker <DEV_SHA> --requireReady --noForm`
   compared with `evidence/vitals/live-after/table.md` (CLS unchanged, LCP within noise).

## Output

`results.md`, `defects.md` (SG-n), scripts, JSON, diff images. Hand back with the eight verdicts, the
defect count, the commit list, free-port proof. Prose rules as before. Nothing about the user goes to
memory.
