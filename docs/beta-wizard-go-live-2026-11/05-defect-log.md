# Defect log

Finders: Sentry (`evidence/sentry/results.md`), spec red team (`redteam-resolution.md`), Fable's preview run, Parent. Sentry sets severity; Fable sets type and routing. Written 20:36 CT.

| ID | Sev (finder) | Type | What | Owner | Cycles | State |
|---|---|---|---|---|---|---|
| R-1 | major (Fable, preview) | code-bug | Completion left the old "next step" on the Klaviyo profile | Fable | 1 | Fixed a386ee5; retest on the deploy PASS (`evidence/relay/preview-live-write.md`) |
| D1 | major | accepted-risk | `beta-progress` takes any typed email, so a stranger can put an address on the drop-off record | Fable, Jamie to overrule | 0 | Accepted for this release: it is what "email first" means, nothing is sent tonight, and it does not change sign-ups or money. Requirement on the Monday pick-up flow: one email per profile per 7 days |
| D2 | major | accepted-risk | A stranger's progress post with a new session reopens a finished family's progress row and profile stage | Fable, Jamie to overrule | 0 | Accepted for this release, same reasoning: the family and player rows are untouched; the cost is one stray pick-up email. Flow requirement: skip profiles that did "Beta Wizard Completed" in the last 14 days unless a newer Progress event has a player name that differs |
| D3 | minor | accepted-risk | A late progress write can land after "done" on the profile | | 0 | Accepted; the flow filters on the Completed metric, not only the property |
| D4 | minor | accepted-risk | A lost response followed by a reload sends a new eventId (second Klaviyo event, same Neon row) | | 0 | Accepted |
| D5 | minor | infra-gap | `@2x` torn-paper images 404 under local `next start` | Fable | 0 | Closed: every image, font and icon the launch page references returns 200 on the deploy preview and on ekuzo.gg (checked 20:36). The black coach photos in the full-page screenshots are lazy-loaded images |
| D6 | minor | page (Aaron) | No hidden honeypot field in the wizard | Aaron | | Reported |
| D7 | minor | page (Aaron) | "about your player's spot", "spots depend on what lines up" | Aaron, Karlin | | Reported with the Parent read |
| D8 | minor | code-bug | A database error message could echo a parameter into the log | Fable | 1 | Fixed 7a37e34 (code or name only); unit test D8 |
| D9 | minor | code-bug | Text-direction and zero-width marks survived in note and fun fact | Fable | 1 | Fixed 7a37e34; unit test D9 |
| D10 | minor | accepted-risk | The shared email pattern accepts markup characters | | 0 | Pre-existing on the waitlist; not changed in a protected step |
| D11 | minor | accepted-risk | An abandoned run keeps the kid's first name in that browser for 14 days | | 0 | Accepted; it is the restart feature |

## Parent read (site state for Aaron and Karlin, not defects of this build)

Fresh-eyes Sonnet agent, screenshots only. Gate B16: it did **not** read the end screen as a promised spot ("unsure, leaning might", quoting "spots depend on what lines up. We'll review and email you either way."). Ranked by Fable for effect on sign-ups:

1. No start date, day or session length anywhere on the launch page ("I can't judge whether it fits our week"). The dates exist (two weeks ending Dec 13, four sessions).
2. The player card asks for a kid's name, age and a fun fact with no line about who sees it.
3. The end screen gives no date for the answer and no "check your email".
4. The game is only named in the needs list ("League of Legends is free"); "Where do they game?" offers Console and Tablet right after "Any laptop or Mac will work".
5. Selected chips ("Weekend afternoons", "Natural leader") read as disabled: low contrast.
6. "Every practice is recorded" with no word on who sees recordings. The reaction test on the end screen reads as an extra test.
Lower: Back on the first screen, "Season 01" unexplained in the FAQ, "Winning attitude" next to "Losses happen".
