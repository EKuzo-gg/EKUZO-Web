# EKUZO 101: Summer Pilot — Cleanup Ledger

**Owner:** Relay  
**Purpose:** Every production write during testing. Jamie reviews and manually cleans up Beehiiv subscribers from the dashboard (tag removal via API not possible per `docs/beehiiv-config.md`).

| Timestamp | Surface | Identity Used | ID/Reference | Notes |
|-----------|---------|---------------|--------------|-------|
| 2026-07-15T14:05:44Z | Beehiiv | jamiefosu+101test-1@gmail.com | sub_7bb9cf79-dade-4944-8845-01db585b3da7 | Test subscriber created during Sentry live integration test. Tags: ekuzo101-pilot-registered, source-ekuzo101-pilot. Cannot remove tags via API per beehiiv-config.md — Jamie to delete subscriber from Beehiiv dashboard. |
| 2026-07-15T14:05:44Z | Klaviyo | jamiefosu+101test-1@gmail.com | 01KXK1J32EQ3FD91MWXHFVCT41 | Test profile created during Sentry live integration test. Event ID: 7hv4EC4Kz4b (metric: "Registered Pilot"). Jamie to delete profile from Klaviyo dashboard if needed. |
| 2026-07-15T20:04:28Z | Klaviyo | jamiefosu+101test-2@gmail.com | Profile 01KXKP2XC6BM8V5F91EJT4T5K6, event 7hx6X6Kap3B ("Registered Pilot") | Phase 3 owner-flow e2e test via real register form (localhost dev). Flow LIVE - confirmation email sent. Delete profile after Phase 5. |
| 2026-07-15T20:04:28Z | Beehiiv | jamiefosu+101test-2@gmail.com | sub_10b99efe-8eff-4966-982e-7fbf0219bfb8 | Same Phase 3 test. Expect sub + tags ekuzo101-pilot-registered, source-ekuzo101-pilot. Delete from dashboard (tag removal via API impossible). |
| 2026-07-15T20:04:28Z | Sheets | jamiefosu+101test-2@gmail.com | squad_token GOrkHFHIgh | Same Phase 3 test. ekuzo-purchases row + squads row confirmed written. Delete rows after Phase 5. |
| 2026-07-15T20:15Z | Beehiiv | jamiefosu+101test-3@gmail.com | sub_de81419e-c6ea-4bf5-9a38-39288c1491f5 | Phase 4 joiner test. Tags: ekuzo101-pilot-registered, source-ekuzo101-pilot. Delete from dashboard. |
| 2026-07-15T20:15Z | Klaviyo | jamiefosu+101test-3@gmail.com | Profile 01KXKPP9HFDCJB8E9CT8HTB42T | Phase 4 joiner test. Confirmation email sent. Delete profile. |
| 2026-07-15T20:15Z | Sheets | jamiefosu+101test-3@gmail.com | squad_members row (GOrkHFHIgh) | Phase 4 joiner test. ekuzo-purchases row 14 + squad_members row confirmed (joiner's own Aug weeks - availability model verified). Delete rows. Note: purchases rows 8-12 are older build-session test rows (TestGamer Pilot, Dupe Test, AAAA...) - clean those too. |
