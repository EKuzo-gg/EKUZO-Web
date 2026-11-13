# Return handoff: after the beta sign-up went live

Written 20:55 CT, 2026-11-12. Paste the section below as the next session's prompt.

## Git evidence at writing time (clone of EKuzo-gg/EKUZO-Web, branch build/beta-wizard)

`git status --porcelain`:
```
?? docs/beta-wizard-go-live-2026-11/08-return-handoff.md
```
(empty means a clean tree)

`git log --oneline -3`:
```
bd19309 docs(beta go-live): release rows, cleanup ledger, review guide
b712b46 Season 01 BETA: progress posts that arrive after the wizard was sent never reopen a finished family (found on the live check: profile read 'player card' after completion)
89f3e3d docs(beta go-live): ledger test count
```

`git ls-remote origin` at 20:55: main b712b46 (code release b712b46; anything after it is docs only), dev 69d2032, season1-commit a9f6856.
Live check: `curl -s https://ekuzo.gg/season1/beta/start | grep -o 's1-build" content="[^"]*'` read b712b46 at 20:52:48 CT.

The receiving session re-runs `git ls-remote origin refs/heads/main refs/heads/dev` and the curl first, and stops if main is behind b712b46 or the live build is older.

## Prompt

Load knowledge-base `CLAUDE.md`, `anti-ai-writing.md`, `working-with-jamie.md`, then ekuzo-web `docs/beta-wizard-go-live-2026-11/07-review-guide.md` and `docs/season-one-tracking.md` (last section). The beta sign-up is live; this session builds what follows it. Work in this order and stop for Jamie where marked.

1. **Klaviyo: are new beta profiles suppressed on creation? Check this first.** The nine test profiles were suppressed on Jamie's go at 21:16 CT 11-12 (cleanup ledger C9). Five of them already carried USER_SUPPRESSED stamped a second after creation, from about 20:43 CT, with no call from our code (C9a). Read the first real beta profile (`beta_wizard_stage` set, email not `team+s1test`): if `can_receive_email_marketing` is false, no beta email will reach families; find what is suppressing (Klaviyo audit log, another automation or session) and stop there for Jamie.
2. **Confirm Klaviyo will send to these families.** Wizard families are profiles with events and no consent. Check with one test profile whether a metric-triggered flow sends to a never-subscribed profile in this account. If it will not: propose a consent line on the page to Aaron, or mark the two flows transactional. Do not add a consent call to the route without Jamie: the endpoint is open and the red team removed it on purpose (`redteam-resolution.md` A1).
3. **The two emails** (Aaron leads copy; lab copy under "The emails"): "we got it" on "Beta Wizard Completed" (its reply-by date is still unset) and the pick-up email on "Beta Wizard Progress" (rules in the review guide: skip if completed since the flow started or in the last 14 days, one send a week). Both read parent-typed text: escape `beta_player_name`.
4. **Restart link for another device** (decision D12): a signed, expiring link in the pick-up email; the page it opens strips the token before any tag loads; an endpoint returns the saved answers for a valid token only. Needs its own red team (it hands a kid's name to the link holder).
5. **Team view.** The Sheets write exists and is off. Standalone Apps Script on a new "Beta players" sheet in the shared drive, header-mapped append, tab `beta-players`, then `S1_BETA_SHEETS_WEBHOOK_URL` in Netlify (Jamie's go for the env value). Columns are the row keys in `sheetsRow()` in `lib/season1/betaWizard.ts`. Backfill from Neon.
6. **`dev` integration.** dev (69d2032 at writing) lacks the route change and the capture script, so the wizard on the dev deploy saves nothing extra and Aaron's next `dev` to `main` merge is where the two meet. From a fresh clone: branch from main, `git merge origin/dev` (expect WORKLOG to conflict: keep both sides), prove `git diff --quiet origin/main HEAD -- app/api lib middleware.ts db`, prove `git merge-base --is-ancestor origin/dev HEAD`, push `HEAD:dev`. Ask Aaron for a quiet window first; he is out Fri 11-13. Never merge main into dev.
7. **Meta** (Monday ad work): written decision in `season-one-tracking.md`. Lead on `/season1/beta` stays the optimisation event; `BetaWizardComplete` proposed for reporting.
8. **Open with Aaron and Karlin:** the parent-read list in the review guide; the hidden `ekz_hp` field; a "sign up another player" link (must reload the page); media and recording consent at sign-up (needed before 11-30); "Any laptop or Mac will work" also describes Chromebooks; ages 9 to 17 still on the live Season 01 pages and older ads; headline.
9. **GA4 admin (Jamie's go):** register `step` as an event-scoped dimension; build the launch, start, step, complete funnel.

Known and accepted (do not re-raise): `05-defect-log.md` D1 to D4, D10, D11.
