# 06 Cleanup ledger: S1 CLS field run (2026-11-09)

Every write this run makes to a production or dev system (Stripe, Klaviyo, Meta, Netlify, Discord, the Neon databases, git remotes that deploy) gets a row here the moment it happens, with its cleanup result. Owner: Relay; other lanes add rows through Fable.

## State at 2026-11-09, Relay's checkpoint

No production or dev write has happened in this run so far. Decision D11: no sign-ups on dev, no POSTs anywhere. Only GETs of public pages (`curl` of `ekuzo.gg` and `dev--ekuzo.netlify.app`) and local work (worktrees, a local rehearsal clone, node tests). Nothing was pushed from the Relay lane; the dev integration merge exists only in a local clone.

## Ledger

| Time (CT) | System | Identity | What was written | Cleanup result |
|---|---|---|---|---|
| 13:42 | GitHub `dev` (Netlify deploy dev--ekuzo.netlify.app) | Claude <noreply@anthropic.com>, build/s1-cls-field tip 955fef7 + origin/dev d11a269 | Integration merge `4635c89` pushed as a fast-forward of dev (77 dev-only files kept; app code identical to the build tip) | Not needed: dev is the QA surface and carries the same code main now has; rollback command in `evidence/relay/dev-integration-runbook.md` if Aaron wants dev back to d11a269 |
| 13:55 | GitHub `dev` (Netlify) | same | Second integration merge `91f5503` (D24 rework) pushed as a fast-forward of dev | Not needed (same reason) |
| about 14:30 | Clarity project wml8wll5ua (production analytics) | none (localhost QA page `localhost:3101/season1?s1qa=1`, typed `qa+sentry@example.com` into a masked input) | About 9 short sessions recorded by mistake: Sentry A's first Class Q run stubbed `**/clarity.ms/**`, which does not match `www.clarity.ms`, so the Clarity tag loaded for real and beaconed to `c.clarity.ms` and `c.bing.com` (SA-2, `evidence/sentry-a/defects.md`, request counts in `evidence/sentry-a/classq-leak-run/`). No GA4 or Pixel hit left (those stubs matched). | Open, owner Fable for the review guide: Clarity has no per-session delete; the sessions are identifiable by page URL host `localhost:3101` and should be excluded from the 11-10 readout. Sentry fixed the stubs (host regexes plus an offender check) and re-ran every Class Q check with 0 offenders. |
| 15:21 | GitHub `main` (Netlify deploy ekuzo.gg) | Claude <noreply@anthropic.com> | `main` fast-forwarded 45dfe97 to `19b9963` (47 commits: landing bootstrap and speed changes, M-1 checkout fix, build marker, tests, harness, run docs) | Not a cleanup item; rollback is `git push origin 45dfe97:main --force-with-lease=main:19b9963` on Jamie's go (revert commands per slice in `07-review-guide.md`) |

Row format for later entries:

| Time (CT, hh:mm) | System (Netlify, Klaviyo list XGTv2F, Meta dataset, Stripe test, Neon test, GitHub) | Identity used (account, email, test card, branch) | What was written (ids, counts, commit shas) | Cleanup result (done with command and time, not needed with reason, or open with owner) |
