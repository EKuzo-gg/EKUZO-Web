# Defect log

Finder: Sentry (`05-defect-log-sentry.md`, `evidence/sentry/results.md`). Fable sets type and routing. Written 15:13 CT 2026-11-13.

| ID | Sev (finder) | Type | What | Owner | Cycles | State |
|---|---|---|---|---|---|---|
| F1 | minor (Fable, on builder note 3) | code-bug | A finished run older than 14 days read as a dead link | Fable | 1 | Fixed cc867cb; unit test; inside Sentry's run |
| S1 | minor | code-bug | The dead-link line sat flush against the "Get started" heading | Fable | 1 | Fixed: same spacing and rule as the panel. Retest is visual, on the preview |
| S2 | minor | accepted-risk | After the tap, text typed while a slow confirm is in flight is replaced by the saved answers | | 0 | Accepted: the tap is the parent's request for exactly that |
| S3 | minor | infra-gap, pre-existing | The wizard page asks for a torn-paper @2x image that 404s under local `next start` | | 0 | Same as D5 of the go-live build, closed there against the deploy; recheck on the preview |
