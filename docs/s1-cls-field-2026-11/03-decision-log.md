# 03 Decision log (most overrulable first)

Fable. Each entry: what was decided, why, what Jamie can overrule and how. Updated through the run.

| ID | Decision | Why | Overrule by |
|---|---|---|---|
| D1 | The run's first deliverable is a field-faithful harness that must reproduce the pre-fix field CLS (>= 0.25 on d18/d19 at `a919b25`) before any of its numbers count. | Two prior loops measured these variants at ~0 while Clarity showed 0.7. A harness that cannot see the field failure cannot prove a fix. | Jamie: "skip the proof" accepts the harness on main-only numbers. |
| D2 | Scope re-aimed from "fix the jump" to prove-and-harden stability plus load speed plus the evaluation. | Phase 0 (Clarity, last 3 days post-fix): 0 poor-CLS sessions of 185 scored; all 18 poor sessions in the last 7 days predate the Nov 5 release. Approved by Jamie 10:03 CT ("let's go"). | n/a (approved). |
| D3 | Test deploy path = dev-integration merge (main + this branch into `dev`) at dev--ekuzo.netlify.app; `main` gets only this branch's commits on Jamie's go. | Netlify builds only `main` and `dev`; `build/*` branches 404. `dev` has blog and roadshow work main does not, so main cannot simply fast-forward to dev. Method per `docs/dev-runbook.md`. | Jamie: enable "all branch deploys" in Netlify (Site settings > Build & deploy > Branches) and this becomes a plain branch deploy. |
| D4 | No secrets in the cloud container. Local builds here run without `.env.local`; anything that needs Klaviyo, Stripe or Sheets runs against the dev deploy (Netlify holds the env) with disposable identities and the cleanup ledger. | Jamie's `.env.local` holds live keys; the unattended-run pre-mortem rule. | n/a. |
| D5 | Agent waves stay under five per launch (2, then 3). | build-loop.md: a fan-out of five or more gets a table and launches on his nod; he is unattended. | n/a. |
| D6 | Pixel parity is judged as **clone**: fonts, images and copy stay identical once loaded; only delivery and timing change. | Jamie 09:52 Q6 ("yes"): rendered page stays pixel-identical to Aaron's design. | Jamie or Aaron can approve a visible change (for example a placeholder color in the reserved box) as a logged spec change. |
| D7 | Hard stop 20:00 CT; interim summary from the last proven slice if the run stalls. | Unattended-runs rule. | Jamie, by message. |

## Resolutions of red-team findings

(Filled at spec freeze: each M-, U-, O- finding is accepted into the spec, changed, or parked for
Jamie with a default.)
