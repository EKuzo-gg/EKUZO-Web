# Cleanup ledger (every write outside the repo)

| # | Time CT | System | What | Identity | State |
|---|---|---|---|---|---|
| C0 | 19:42 | Neon TEST branch | migration 0006 applied (two tables, one index, one s1_migrations row) | none | stays (the test branch should match production) |
| C1 | 19:42 | Neon TEST branch | 1 family, 2 players from the SQL check | team+s1test-1112-sql1@ekuzo.gg | removed 20:07 (delete returned Leo, Maya, the family) |
| C2 | 20:07 | Neon TEST branch | table s1_beta_progress created (part of migration 0006 as amended) | none | stays |
