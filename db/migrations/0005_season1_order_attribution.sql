-- Season 01 analytics (spec S6, resolution C15, ops red team 1): attribution per order.
-- Plain SQL, idempotent. No dollar-quoted blocks, no semicolons inside comments.
-- Apply after 0004. Nullable, no default: a metadata-only change, no table rewrite.
-- Never dropped on rollback (old code never names the column).
-- Shape written by the commit route: src, lc (last click), first_touch, fbp, fbc.
-- s1_families.attribution is unchanged (its origin key means the test request origin).
set lock_timeout = '3s';
alter table s1_orders add column if not exists attribution jsonb;
