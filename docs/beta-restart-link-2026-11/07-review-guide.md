# Review guide (written 15:37 CT 2026-11-13, after release)

**In one minute.** A parent who stops part-way through the beta wizard now has a signed link on their Klaviyo profile. Opened on any device it shows a panel on the wizard ("Welcome back... Pick up where I left off") and loads their answers on the tap. Live on ekuzo.gg since 15:35 CT (build 0cbf872). The pick-up email in Klaviyo uses the link but its flow is still Draft, so no family has received one. The time zone guess now covers Canada and the US zones the page missed.

**Decisions, most overrulable first:** `03-decision-log.md`. The two to look at: the 14 day validity (D4; Jamie expected 30) and the three new strings on the page (D3; Aaron's lane).

**Try it.** Start the wizard on ekuzo.gg with a real address you own, stop at the player card, read `beta_restart_link` on your Klaviyo profile, open it on your phone. Screens to expect: `evidence/sentry/screenshots/panel-390.png`, `after-resume-390.png`, `done-390.png`, `none-390.png` (taken before the spacing fix).

**For a person to check (not automated):** Safari on an iPhone, the link opened from iOS Mail and from the Gmail app; one real send of the pick-up email once the flow goes live.

**Before the pick-up flow goes live:** the plain-text part of the email still has the old address; Karlin and Aaron have not read the draft copy; "takes about two minutes" in that copy is not measured.

**Rollback:** keep `app/season1/beta/r/[token]/route.ts` and `lib/season1/betaRestartCookies.ts` (runbook).

**Found only on the deploy:** R-1 in `05-defect-log.md`.

Git at writing time (this file is on `build/beta-restart-link`, one docs commit ahead of main; it rides with the next push to main):

```
 M docs/beta-restart-link-2026-11/06-cleanup-ledger.md
?? docs/beta-restart-link-2026-11/04-evidence-ledger.md
?? docs/beta-restart-link-2026-11/07-review-guide.md
0cbf872 docs: WORKLOG, tracking and runbook entries for the beta restart link
06e522c docs(beta restart link): preview round trip evidence, cleanup ledger
9203e97 fix(beta restart link): read the inlined deploy context literally so the link is written in the function runtime (R-1)
```
