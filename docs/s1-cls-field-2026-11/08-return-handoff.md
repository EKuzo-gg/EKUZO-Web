# 08 Return handoff: Season 01 landing run (2026-11-09)

Fable, 16:10 CT. The next session pastes the prompt below. First step there: re-run the two git
commands and compare with the embedded output; any difference halts the checklist until explained.

## Git state at writing time (cloud clone `/home/claude/ekuzo-web`, branch `build/s1-cls-field`)

```
$ git status --porcelain
(empty)

$ git log --oneline -3
480c8de docs(s1-cls-field): D29 clock fix (16:09)
07baa1a docs(s1-cls-field): D29 (d19 paint and script trade accepted), live after-run in the review guide, OR-H2 and OR-H3 harness items; live-after table regenerated from the raw runs
2677bed Merge branch 'lane/auditor' into build/s1-cls-field

$ remote tips (git fetch origin, 16:09 CT)
origin/main               19b9963   (live on ekuzo.gg since 15:23 CT; app code)
origin/dev                91f5503   (second integration merge: same app code plus dev-only files)
origin/build/s1-cls-field 480c8de   (main's code plus this run's docs and evidence)
```

This file's own commit, the `live-after-chrome` evidence and the final docs fast-forward of `main`
land after this capture; the receiving session will see them at the top of the log and in
`07-review-guide.md` § Git state.

## Prompt for the next session

Season 01 landing run follow-up (ekuzo-web, Build Loop run `docs/s1-cls-field-2026-11/`). Load how
to work with Jamie, `anti-ai-writing.md`, then read `docs/s1-cls-field-2026-11/07-review-guide.md`
and `03-decision-log.md` (D1 to D29). Live state: `main` 19b9963 (or the docs fast-forward after it)
on ekuzo.gg since 2026-11-09 15:23 CT, marker `<meta name="s1-build">` on `/season1`. Nothing in the
Netlify, Stripe, Klaviyo or Meta accounts was changed by the run; the only external writes are the
git pushes and about nine stray localhost sessions in Clarity (`06-cleanup-ledger.md`).

Do, in this order, each on Jamie's go where the review guide says so:

1. Re-run `git status --porcelain` and `git log --oneline -3` on `build/s1-cls-field` and compare
   with `08-return-handoff.md` § Git state; stop on any difference you cannot explain.
2. Read Jamie's answers to HC1 (S25, Instagram, d19) and HC3 (Aaron, iPhone). A problem means a
   revert: `git push origin 45dfe97:main --force-with-lease=main:<current main sha>` (whole run) or
   the per-slice `git revert` lines in `07-review-guide.md` § After the push, then `npm test`, push,
   and confirm the marker on ekuzo.gg changed.
3. File the KB bundle on Jamie's Mac (the laptop was offline during the run): the files under
   `kb-out/` in the delivered bundle go to the same paths in the knowledge base:
   `system/loops/sessions/2026-11-09-s1-cls-field-build-loop.md`,
   `personal/journal/daily/2026-11-09.md` (append if the day exists), and six files under
   `system/loops/lessons-pending/` dated 2026-11-09. Then propose each lesson's prose to Jamie as a
   yes/no (session-protocol step 4); apply a yes with the live-approval comment and the grep proof.
4. Jamie's three answers (`07-review-guide.md` § Three questions): M-2 outbox failure alert to Discord
   (Jamie's lane, `lib/season1/` outbox, one message per failed, stale or skipped live send); M-3 the
   "open in your browser" hint on the signup page if his S25 showed no wallet (copy is Aaron's; load
   the voice stack before proposing any line); O-12 the daily canary as a scheduled task (page marker,
   `#hero`, `#em-top`, an invalid-email POST expecting 400, one harness run at N=1 on d18 and d19
   against ekuzo.gg, Klaviyo list count vs the 7-day median; push notification on any miss). Build
   nothing he has not answered yes to.
5. This-week code items in `06-findings-ranked.md` § This week, in that order, each as its own small
   change with tests: M-4 host or mode guard on `/api/season-one`; O-10 `signup_error
   reason=rate_limited` and `signup_quiet` events; M-13 CAPI `fbp`/`fbc` validation and the token out of
   the URL query; M-5 re-commit before every confirm; OR-H1 gzip proxy option for the local lab;
   OR-H2 the `fetchpriority` trial on dev; OR-H3 harness navError handling. Aaron's design items are
   his (`07-review-guide.md` § For Aaron); hand him the list, do not build them.
6. Tomorrow's ads readout: Clarity recordings filtered from 2026-11-09 15:23 CT, exclude page host
   `localhost:3101`, and report CLS, LCP and INP before and after the release separately
   (`readout-windows-split-at-releases` lesson).

Rules that held this run and hold again: servers by PID from `./node_modules/.bin/next start`
(then `fuser PORT/tcp` for the child), the repo hook blocks pattern kills; Class T for every
measurement on ekuzo.gg or dev, Class Q only on localhost with host-regex stubs and an offender check;
no sign-ups on dev (the API writes the live Klaviyo list) without reading the dev env first; every
timestamp from `TZ=America/Chicago date`; pixels on the landing are a clone of Aaron's design unless he
approves a change; live means live on ekuzo.gg.

## Where the evidence is

`docs/s1-cls-field-2026-11/`: `00-brief.md`, `00-phase0-field-truth.md`, `01-requirements.md`,
`02-frozen-spec.md`, `03-decision-log.md`, `04-evidence-ledger.md` (Auditor), `05-defect-log.md`
(Auditor, 47 rows), `06-cleanup-ledger.md`, `06-findings-ranked.md`, `07-review-guide.md`, this file,
`redteam-*.md`, `parent-review.md`, `steward-review.md`, `auditor-phase1.md`, `scout/`,
`screenshots/` (32), `evidence/{relay,atlas,chronos,sentry-a,sentry-b,auditor,fable,parent,vitals}/`.
Harness: `scripts/field-vitals/` (README inside). Raw harness JSON is gitignored; archives of the
cloud container's copies are not durable (the container is ephemeral), the sha256 of every raw file is
in each label's `manifest.json` (or `manifest-regenerated.json` for `live-after`).
