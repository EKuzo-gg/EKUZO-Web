# Cleanup ledger (every write outside the repo)

| # | Time CT | System | What | Identity | State |
|---|---|---|---|---|---|
| C1 | 15:21 | GitHub | branch `build/beta-restart-link` pushed (Jamie 15:21: "you can push"); draft PR #7 for the deploy preview | none | open; closes itself when main receives the commits |
| C2 | 15:23 to 15:31 | Klaviyo (live account) | 1 profile 01M7BCPXQRE0CBCVMD1YZFBZSK, 9 Progress events (3 sessions), 1 Completed event | team+s1test-1113-rl1@ekuzo.gg | bot-suppressed at creation by Klaviyo; nothing further needed unless Jamie wants it deleted |
| C3 | 15:23 to 15:31 | Neon TEST branch | 1 progress row, 1 family, 1 player | same | removed after 15:45 CT (time not read from a clock) in the SQL editor on the test branch br-damp-waterfall-b4teuccp (DELETE 1, 1, 1) |
| C4 | 15:33 | GitHub | `main` fast-forwarded fe494e2 to 0cbf872 (Jamie 15:32: "you can do both 1 and 2"); PR #7 closed itself as merged | none | live on ekuzo.gg 15:35:22 (`s1-build` 0cbf872) |
| C5 | 15:35 | Klaviyo (live account) | 1 profile 01M7BDCXN41YHR4XY147Z74SAM, 2 Progress events, from the production check | team+s1test-1113-rl2@ekuzo.gg | bot-suppressed at creation (read back: cannot receive, USER_SUPPRESSED 21:35:43 UTC) |
| C6 | 15:35 | Neon PRODUCTION | 1 row in `s1_beta_progress` (stage 1, no player data), holding a restart link good for 14 days | same | removed after 15:45 CT (time not read from a clock) on Jamie's yes (15:45): counts before 9 progress rows (1 test), 8 families, 8 players; after 8 progress rows (0 test), 8 families, 8 players |
| C7 | 15:36 | Klaviyo flow Wf7Nam (Draft) | pick-up email ReJbbU, template UASFfq: the HTML link is now `{{ person.beta_restart_link\|default:'https://ekuzo.gg/season1/beta/start' }}`, saved in the flow's code editor, read back through the API and rendered with and without the property | none | stays. The plain-text part still carries the old address (edit it with the apostrophe fix, same place) |
