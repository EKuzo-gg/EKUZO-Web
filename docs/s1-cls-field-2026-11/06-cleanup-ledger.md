# 06 Cleanup ledger: S1 CLS field run (2026-11-09)

Every write this run makes to a production or dev system (Stripe, Klaviyo, Meta, Netlify, Discord, the Neon databases, git remotes that deploy) gets a row here the moment it happens, with its cleanup result. Owner: Relay; other lanes add rows through Fable.

## State at 2026-11-09, Relay's checkpoint

No production or dev write has happened in this run so far. Decision D11: no sign-ups on dev, no POSTs anywhere. Only GETs of public pages (`curl` of `ekuzo.gg` and `dev--ekuzo.netlify.app`) and local work (worktrees, a local rehearsal clone, node tests). Nothing was pushed from the Relay lane; the dev integration merge exists only in a local clone.

## Ledger

| Time (CT) | System | Identity | What was written | Cleanup result |
|---|---|---|---|---|
| none yet | | | | |

Row format for later entries:

| Time (CT, hh:mm) | System (Netlify, Klaviyo list XGTv2F, Meta dataset, Stripe test, Neon test, GitHub) | Identity used (account, email, test card, branch) | What was written (ids, counts, commit shas) | Cleanup result (done with command and time, not needed with reason, or open with owner) |
