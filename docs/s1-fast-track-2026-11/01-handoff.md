# 01 Handoff: Season 01 fast track, 2026-11-10

Fable, 15:04 CT. Branch `build/s1-fast-track` 7297dc3; app code equals the tested build 0c02cf3
(`git diff --stat 0c02cf3 7297dc3 -- app lib middleware.ts scripts package.json` is empty); a
fast-forward of main 3bf6c58. Dev carries the same code as c4eabbe (integration merge on Aaron's
roadshow and beta commits; `landing-v2.html` is dev-only and never served).

## Status

| Gate | Result | Evidence |
|---|---|---|
| Tests and types | 618 tests, 617 pass, 1 skipped; field-vitals 5 of 5; tsc clean | `evidence/sentry-b/logs/01-*` |
| Part A (attribution, events) | Nine checks pass; pixel-identical to main; beacons equal | `evidence/sentry/results.md` |
| Part B (visible additions) | Eight checks pass; every pixel box inside an expected region | `evidence/sentry-b/results.md` |
| Stability, local Tier 1 | CLS medians d2 0.0004, d18 0.0038, d19 0.0018, noad 0.0005 (fb, N=5; ig N=3 same); LCP within +12 to +132 ms of Part A | `../s1-cls-field-2026-11/evidence/vitals/ft-b-tier1*/table.md` |
| Dev | Marker c4eabbe on three URLs; body equals the source apart from the two fills; CLS within 0.0003 of ekuzo.gg; console 0 on 22 variants | `evidence/sentry-b/dev/` |
| Main | Live on ekuzo.gg: Jamie's go 15:18 CT, pushed 15:18 (3bf6c58 to c1ae338, fast-forward), marker `c1ae338` served 15:20; the three live bodies are byte-identical and equal the source apart from the `{{BUILD}}` and `{{TAGS}}` lines; brotli 38.2 KB (37.6 KB on Nov 9). Harness on live (fb-android-412, `--noForm`): d18 CLS 0.0038, LCP 1568 and 1640 ms; d2 CLS 0.0004, LCP 1316 and 1376; d19 CLS 0.0002, LCP over five runs 1336, 1420, 1540, 1924, 2636 (median 1540; Nov 9 live-after median 1420). | `../s1-cls-field-2026-11/evidence/vitals/live-ft/table.md`, `live-ft-d19/table.md` |

Defects: 8, none blocker or high (`evidence/sentry-b/defects.md`). SG-1 accepted as F9, SG-2 and SG-3
logged as F10 follow-ups, SG-4 to SG-8 are brief gaps or method notes.

## Review guide (five minutes on a phone, dev)

1. `/season1?ad=d19`: hero button reads "Get the details →"; the form heading is "Get the season one
   details."; under the button, "Ready now? Save their spot for $100 →" with the refund note.
2. Tap the ready link: lands on `/season1/join?src=ad&ad=d19`; the address bar keeps `ad`.
3. Back, scroll to the bottom form: "Still thinking it over?" with the same link.
4. Do not submit on dev (the API writes the live Klaviyo list). The confirmation card ("Ready to lock it
   in?", "Save their spot · $100") is in `evidence/sentry-b/pixel/d19-412-conf-branch.png`.

## Ship steps (as run, 15:18 to 15:26 CT)

```
cd /home/claude/ekuzo-web && git fetch origin && git merge-base --is-ancestor origin/main HEAD \
  && git push origin build/s1-fast-track:main
```

Then: poll `https://ekuzo.gg/season1` for `<meta name="s1-build" content="<sha>">`; diff the live body
against `app/season1/landing.html` (only the `{{BUILD}}` and `{{TAGS}}` lines differ); one harness
check `npm run vitals -- --target https://ekuzo.gg --ads d18,d19 --profile fb-android-412 --runs 2 --expectMarker <sha> --requireReady --noForm`;
tell Jamie and Aaron.

## For Aaron

- F7: "Get the details →" is also on d19, d20, d21 (his rule: "Save their spot" only ever means paying).
  His v2 still had "Save their spot →" on the five hero buttons; the port applied his doc, not his file.
- F8: the sticky bar reads the hero's `CTA` once the script runs ("Send me the details"); on d2, d6, d9
  the top ready link shows after the parent answers the hero. Both as in his file.
- SG-2: add "until Nov 30" to the lock card's jersey line; later, template the landing's dates from
  `offer.ts` the way the join pages do (F10).
- Ad copy changes ride his next refresh; age range to canon, 9 to 17; "mid-January" is his to confirm.
- The ads readout can now count `s1_join_click` and join views by `ad` next to leads
  (`docs/season-one-tracking.md`).

## For Jamie

- SG-3: `app/season1/terms/terms.html` section 4 (refund until two weeks before the session, a jersey
  deduction) disagrees with the Season 01 offer, the emails and the join pages (full refund until
  Dec 31). Legal copy, pre-existing, his call.
- Still open from Nov 9: M-2 outbox Discord alert, M-3 wallet hint, O-12 daily canary, the this-week
  items (M-4, O-10, M-13, M-5, OR-H1 to OR-H3), and excluding `localhost:3101` sessions from the
  Clarity readout.
