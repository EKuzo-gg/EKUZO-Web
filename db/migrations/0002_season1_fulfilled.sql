-- Lead addition: fulfilled_at marks that every post-claim step of fulfil is done.
-- Also renames the one-family-code partial unique index (created in 0001 as
-- s1_codes_one_family_code_idx) to the agreed name, so there is a single index.

alter table s1_orders add column if not exists fulfilled_at timestamptz;

drop index if exists s1_codes_one_family_code_idx;

create unique index if not exists s1_codes_one_family_code on s1_codes (family_id) where type = 'family';
