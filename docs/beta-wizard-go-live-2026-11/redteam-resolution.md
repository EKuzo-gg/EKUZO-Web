# Spec red team: findings and resolution

One Sonnet agent, three lenses (abuse and fraud; users, trust and privacy; operations and failure), read-only, on commit 8365ad0. Its full report is in the session; findings are restated here with Fable's resolution (19:45 CT).

| ID | Sev | Finding | Resolution |
|---|---|---|---|
| A1 | major | The open endpoint set Klaviyo marketing consent for any typed email, and could re-subscribe someone who had unsubscribed | **Changed.** The consent call is removed. The wizard writes an event and profile properties only. H3 (Monday) confirms the confirmation flow reaches these profiles |
| A2 | major | A stranger could use the per-email counter to lock a family out for a day | **Changed.** No per-email limit. Test A2 |
| A3 | major | Only the per-IP cap stood between a script and the ops channel | **Changed.** Per-IP cap 30 an hour (the waitlist's own ceiling); over 200 an hour across everyone, answers are saved and the channel stays quiet. Test A3. A challenge (Turnstile) is parked for the ad relaunch |
| A3b | minor | The wizard hard-codes `ekz_hp: ""` and has no hidden field, so the honeypot protects nothing on this page | **For Aaron** (his file): add the hidden `ekz_hp` input the other forms carry. The server check stays |
| A4 | major | Anyone who knows a parent's email and the kid's first name can overwrite that player's answers | **Accepted for tonight, documented.** The Discord line says "updated"; every submission with a new id is its own Klaviyo event, so the earlier answers survive there. Fix with the pick-up email work: a signed link to edit |
| A5 | minor | A `utm_source` could carry a markdown link into the ops channel | **Changed.** Source is reduced to `[a-z0-9_.:-]`. Test A5 |
| A6 | minor | `?src=` is typed by anyone | Accepted: it is attribution, never access |
| B1 | major | "about your player's spot" and "spots depend on what lines up" on the wizard | **For Jamie and Aaron** (Aaron's file). Fable's read: neither line says a family has a spot, and the end screen says "we'll review and email you either way". Parent review rules on it |
| B2 | major, verify | The player card shows the kid's name as page text, which Clarity records | No change: the kid-data rule (build-loop.md, 2026-10-30) allows Clarity. Nothing about the kid goes to GA4, Meta or a URL |
| B3 | minor | A mail or text tap opens an in-app browser; if the parent finishes in another browser the source cookie is not there | Accepted and stated in the team message: the record is saved with source "direct" or the first-touch bucket |
| B4 | minor | The 502 text had no way to reach a person | **Changed.** The 502 names the founder's number |
| B5 | minor | Two kids with one first name in one family collapse into one row | Accepted (D3) |
| C1 | major | If migration 0006 is not on production when the code deploys, every submission posts "NOT in the database" | **Gate.** The release waits for H1, and the first production check reads the tables |
| C2, C3, C5 | minor | A late database commit, or two overlapping posts of one submit, can produce a wrong or doubled Discord line | Accepted |
| C4 | minor | A second submit from the same page load would reuse the id and Klaviyo would drop it | Accepted: the page allows one submit per load. Matters for the "another player" link (H4): it must reload |
| C6 | minor | Possible duplicate `const src` in middleware | Checked: one declaration; typecheck, build and tests pass |
