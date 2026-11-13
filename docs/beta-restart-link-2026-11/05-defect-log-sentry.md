# Sentry defect log: beta restart link (cc867cb)

No critical or major defects found. All are minor, listed in the order found.

| ID | Severity | What | How to reproduce | Evidence |
|---|---|---|---|---|
| S1 | minor | The dead-link line ("That link has run out...") sits directly against the "Get started" heading with no gap, while the panel has spacing and a rule. Looks cramped at 390 and 1440. | Open the wizard with the flag cookie and a restore answer of `none`. | screenshots/none-390.png, none-1440.png |
| S2 | minor | A parent who taps "Pick up where I left off" and then types in the email field while a slow confirm is still in flight has the typed text replaced and the wizard moved forward when the answer lands. The panel is dropped by the typing but the pending confirm still applies. The tap makes this the parent's own request, so it is an edge of M4, not a breach of the stated rule. | Delay the confirm answer 3 s, tap Pick up, type in #email, wait. Typed text is replaced by the saved email and the wizard lands on screen 3. | qa-desktop.log, qa-mobile.log: INFO `4.confirmTyped` |
| S3 | minor, pre-existing | Console error on the wizard page: 404 for `/images/new%20torn%20paper/torn-paper-grey-top-1@2x.png`. It also occurs on the plain first screen with no link, so it is not from this branch. | Load /season1/beta/start. | qa-desktop.log (scenario `plain`), qa-results-1440.json |

Observations that are not defects, for the lead's judgment:
- The redirect route sets both cookies for any 65-character `[A-Za-z0-9_-]` token, including non-canonical ones. The restore route then reads them as none and clears them. No harm.
- With no client address, all callers share one bucket of 600 an hour; in production Netlify always supplies the header.
- `partialAnswers` drops a whole list if one stored entry is not allowed (existing behaviour).
- A trailing-slash token path (`/season1/beta/r/`) goes 308 then 404 and sets no cookie.
