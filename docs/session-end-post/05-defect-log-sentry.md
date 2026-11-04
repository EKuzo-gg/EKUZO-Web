# 05 Defect log (Sentry), Run 2 session-end post, HEAD 84f398d

Counts: critical 0, major 0, minor 8. No retest cycles yet.

| ID | Sev | Type | Req | Description | Evidence | Owner |
|---|---|---|---|---|---|---|
| D1 | minor | accepted-risk | S1 | Meta description is 161 chars; requirement is 150 to 160. Known interim string pending Jamie; trim 1 char when he approves the final. | evidence/sentry/head.txt | Story |
| D2 | minor | code-bug | P11 | Hero alt on page ("...headphones on and a controller in his hands, watching a game on a screen out of frame.") differs from the approved alt in 02-copy-deck.md C4 ("...headset on ... watching a screen out of frame in a lamp-lit living room."). Confirm which Jamie approved; align page or deck. Same string feeds og:image:alt. | evidence/sentry/a11y-lint.txt | Atlas |
| D3 | minor | code-bug | P2,P9 | Sources entry 6 (Alsheail) renders a visible link URL https://doi.org/10.1145/3748614 after "doi 10.1145/3748614."; the copy of record has no URL there. Likely a harmless improvement, but it is a word delta against v6: Story or Jamie to approve or remove. | evidence/sentry/copy-diff.txt | Story |
| D4 | minor | accepted-risk (pre-existing) | V | 404 for /images/new%20torn%20paper/torn-paper-red-top-2@2x.png on every page (post, /blog, author). Only console error. | evidence/sentry/pages-console.json | Atlas |
| D5 | minor | code-bug | N3 docs | WORKLOG entry lists only -hero.jpg and -card.jpg; the -card-clean.jpg added in 84f398d (used by /blog and author listings) is not mentioned. | git diff WORKLOG.md | Atlas |
| D6 | minor | accepted-risk | P14,M1 | No inline Season 01 link in the post body; M1 expects blog_link_click for "Season 01 and /parents", only /parents is testable. Waiting on Jamie's approved sentence and target (P14). | evidence/sentry/links.txt | Story |
| D7 | minor | infra-gap | M1 | Analytics scripts do not load locally (ANALYTICS_ON needs S1_DEPLOY_CONTEXT=production). Event code proven only through stubbed window.gtag/window.clarity. Real GA4 DebugView, Meta Test Events (PageView), Clarity tags, and the popup generate_lead page_location must be proven on the dev deploy. validator.schema.org also not run (needs public URL). | evidence/sentry/measurement.txt, beacons.txt | Relay |
| D8 | minor | code-bug (design nit) | P7 | Quote attribution "A parent, replying on X" is a second italic <p> inside the blockquote, visually indistinguishable from the quote itself (no dash, size or weight change). Present and correct but reads as part of the quote. Template behavior (Robux uses the same blockquote); optional. | evidence/sentry/post-1440.png | Atlas |

Notes (not defects): body apostrophes render straight while double quotes render curly (same as Robux post; house convention); the full-page screenshots are 908px wide because of an existing clipped torn-paper img (same on Robux, page scrollWidth is 375); the fixed "Join Season 01" bar shows mid-page in full-page captures only; the new post appears twice on /blog (featured plus grid), same as the Robux post did.
