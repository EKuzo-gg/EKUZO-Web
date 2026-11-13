# Cleanup ledger (every write outside the repo)

| # | Time CT | System | What | Identity | State |
|---|---|---|---|---|---|
| C0 | 19:42 | Neon TEST branch | migration 0006 applied (two tables, one index, one s1_migrations row) | none | stays (the test branch should match production) |
| C1 | 19:42 | Neon TEST branch | 1 family, 2 players from the SQL check | team+s1test-1112-sql1@ekuzo.gg | to remove at close |
