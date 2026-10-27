# Next-session prompt (paste into a new session linked to Jamie's computer, folders ekuzo-web, knowledge-base)

Pick up the Season 01 commit build after the overnight run. Read, in order:
`ekuzo-web/docs/season1-commit/00-team-summary.md`, `07-review-guide.md`, `05-defect-log.md` (open rows),
`03-decision-log.md`, and `ops-runbook.md`. Load the KB's CLAUDE.md rules first.

First step: re-run `git status --porcelain` and `git log --oneline -3` on `season1-commit` and compare with
the "Git state at writing time" block at the end of `07-review-guide.md`; stop and reconcile any mismatch
before doing anything else.

Then, with me:
1. Walk through my answers to the three team-summary decisions (terms, refund and jersey story, invite
   wording) and apply them (copy changes go through the voice stack; terms version moves off "-draft").
2. Fold in Aaron's answers from the delta sheet and the 10-27 standup.
3. Prepare the launch-order checklist in `07-review-guide.md` as step-by-step guidance with direct links
   for each vendor UI (Neon, Netlify, Stripe), and stop before every live action for my go.
4. Separately, the Next.js and nanoid security update as its own small branch and PR (decision D14).

Rules: branch only, never merge without my go; live keys and production database only after I say so;
the KB copy of this run's notes is in `knowledge-base/explorations/2026-10-26-season1-commit-invite/`.
