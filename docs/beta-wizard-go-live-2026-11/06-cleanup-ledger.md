# Cleanup ledger (every write outside the repo)

| # | Time CT | System | What | Identity | State |
|---|---|---|---|---|---|
| C0 | 19:42 | Neon TEST branch | migration 0006 applied (two tables, one index, one s1_migrations row) | none | stays (the test branch should match production) |
| C1 | 19:42 | Neon TEST branch | 1 family, 2 players from the SQL check | team+s1test-1112-sql1@ekuzo.gg | removed 20:07 (delete returned Leo, Maya, the family) |
| C2 | 20:07 | Neon TEST branch | table s1_beta_progress created (part of migration 0006 as amended) | none | stays |
| C3 | 20:14 | Neon TEST branch | 1 family, 2 players, 1 progress row | team+s1test-1112-pv1@ekuzo.gg | removed 20:54 (test branch counts 0/0/0) |
| C4 | 20:14 | Klaviyo (live account) | profile 01M79AY642DM9SZECBYMNKJGTG, 3 Progress events, 2 Completed events | team+s1test-1112-pv1@ekuzo.gg | to suppress at close (Jamie's go: a Klaviyo write) |
| C5 | 20:16 | Neon TEST branch | 1 family, 1 player, 2 progress rows | team+s1test-1112-pv2@, pv3@ekuzo.gg | removed 20:54 (test branch counts 0/0/0) |
| C6 | 20:16 | Klaviyo (live account) | profiles 01M79B2NZPX4QM3C8BAH1DF4BZ and 01M79B33A4SEAXECZE65MHHQZP with their events | team+s1test-1112-pv2@, pv3@ekuzo.gg | to suppress at close (Jamie's go) |
| C7 | 20:11 | GitHub | branch `preview/beta-wizard`, draft PR #5 (deploy preview only) | none | PR #5 closed itself when main received its commits; PR #6 (opened 20:50 for the follow-up fix) likewise; branch deleted at close |
| C8 | 20:24 | Neon PRODUCTION branch (br-wild-sky-b4er6sym, database ekuzo) | migration 0006 run in the SQL Editor on Jamie's permission (20:19, "you have permission to open neon in browser and handle"; he signed in as team@ekuzo.gg). One transaction, lock_timeout 3 s: BEGIN, SET, CREATE x4, INSERT 1, COMMIT. Read back: tables s1_beta_families, s1_beta_players, s1_beta_progress; s1_migrations 0001 to 0006 | none | stays (H1 done) |
| C8b | 20:39, 20:53 | Neon PRODUCTION | 2 families, 2 players, 2 progress rows from the live checks | team+s1test-1112-live1@, live2@ekuzo.gg | removed 20:54 (DELETE 2, 2, 2 in one transaction) |
| C9 | 20:14 to 20:53 | Klaviyo (live account) | 9 test profiles (pv1 to pv7, live1, live2), each never subscribed and on no list | team+s1test-1112-*@ekuzo.gg | **Suppressed 21:16 CT** on Jamie's go (21:14, "you can suppress them"); job 01M79ED0NFENNHWC88MG29DM2Q; read back: all nine `can_receive_email_marketing` false, reason USER_SUPPRESSED |
| C9a | 21:16 | Klaviyo | **Open question, not caused by this build:** pv4, pv5, pv6, pv7 and live2 already carried USER_SUPPRESSED stamped one to two seconds after each profile was created (20:43 to 20:53 CT), before the job above ran. pv1 to pv3 and live1 (created 20:14 to 20:39) did not. The route makes no suppression or subscription call. No non-test profile has been created since 20:30 CT, so it is unknown whether a real parent's new profile is also suppressed on creation | | Check the first real beta profile's suppression state, and Klaviyo's audit log around 20:40 CT 11-12, before any beta flow is switched on |
