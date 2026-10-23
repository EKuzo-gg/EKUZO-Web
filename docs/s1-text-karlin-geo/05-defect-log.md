# Defect log (merged, Auditor, 2026-10-23)

Lane files kept: `05-defect-log-server.md` (D1 to D3) and `evidence/sentry-browser/evidence/defect-log-browser.md` (OBS-1, OBS-2). A1 to A5 are new, found by the Auditor.
No critical or major defects in any lane. No FAIL in the ledger.

| ID | Severity | Type | Owner | Finding | Status | Source |
|---|---|---|---|---|---|---|
| D1 | minor | accepted-risk | Relay (decide: leave or strip) | `geo_country` and `geo_postal` are not stripped of quotes, backslashes or control characters (R7 covers city and region only). No current path into the Discord JSON; the planned H2 template reads city, region, tz only. | open (accepted risk, Fable to confirm) | server lane, `evidence/sentry-server/country-probe.txt` |
| D2 | minor | infra-gap | Fable | `next build` with the brief's dummy env exits 1 (Stripe constructed at module load in /api/camps/register); both trees build clean with a dummy `STRIPE_SECRET_KEY`. | accepted by coordinator; see A3 for the missing baseline proof | server lane, `n7-branch-build-specified-env.txt` |
| D3 | minor | accepted-risk (pre-existing) | not this build | `ekuzo101-weeks.test.ts` "buildWeeksLabel includes the time string" fails on main and branch identically (label "7-8:30 PM local time"). | open, out of scope; N7 holds | server lane, `n7-baseline-ekuzo101.txt`, `n7-branch-ekuzo101.txt` |
| OBS-1 | info | scope observation | Fable (decide) | The `{step:"games"}` post carries no `tz` (unchanged from main, outside the spec). Confirmed in `server-branch.log`: one post with no tz key. Add only if geo is wanted on that step. | open, no action required | browser lane |
| OBS-2 | info | infra-gap (test harness) | none | Test server 404s the author avatar; Google Fonts blocked by the fail-closed gate. Same on main and branch. | closed (accepted) | browser lane |
| A1 | minor | process gap | Fable | `WORKLOG.md` is on the frozen file list ("entry at top") but is unmodified (git status shows no change). Relay left it to Fable. | open | Auditor: frozen spec vs `git status` |
| A2 | info | coverage gap | Sentry-server (optional) | HTTP-level UTC alias checks cover 7 of the 14 aliases in amended R5. The remaining 7 are covered only by the Relay-authored unit test (re-run by Sentry, 58/58). | open, low risk | Auditor: `verify.txt` UTC section vs `01-requirements.md` |
| A3 | minor | evidence gap | Sentry-server | D2 says the Stripe build failure is "same on main" but no baseline build under the specified env is in the evidence folder (only `n7-baseline-build.txt` with the extra key). Code inspection makes it very likely, but it is unproven. | open | Auditor: evidence folder listing |
| A4 | info | coverage gap | Sentry-browser (optional) | J2 "Intl deleted" variant (Auditor phase 1 finding 9) not run; only the throwing mechanism, which is what the amended spec requires. | open, low risk | Auditor: `runner.js`, `runs/*j2*` |
| A5 | info | coverage limit | none | N5 popup is simulated by an API request without `tz`, not driven in a browser; N6 screenshots use fallback fonts and the "amount" hero only; M4 observes inline analytics queues with vendor scripts blocked. All stated by the lanes. | closed (accepted, disclosed) | Auditor |
