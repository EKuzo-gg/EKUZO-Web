# 06 Cleanup ledger (Relay)

Every production write made while testing.

| When (CT) | System | Write | Identity | Keep / remove |
|---|---|---|---|---|
| 2026-10-10 15:39 | Klaviyo | Event "Season 01 Waitlist" (failed 401 before key fix, nothing written) | team+s1test-1010@ekuzo.gg | n/a |
| 2026-10-10 15:47 | Klaviyo | Profile created; events "Season 01 Waitlist" and "Season 01 Waitlist Games"; subscribed to email marketing and list XGTv2F at 15:49 | team+s1test-1010@ekuzo.gg | Keep as the team's seed test address; exclude from reads by email. Remove from the list before the welcome flow goes live if Aaron prefers |
| 2026-10-10 15:47 | Meta pixel 1284038230557204 | 1 browser Lead + 1 server Lead, event_id 2dc9de90-6561-462e-990f-7fd5dccbaeff, from dev--ekuzo.netlify.app (live, no test code) | hashed test email | Cannot be deleted; campaign is paused so it trains nothing. Note in the first read |
| 2026-10-10 15:15 | Meta Events Manager | Setting "Automatically include more detailed page and product info" turned Off | n/a | Keep (child-data rule) |
