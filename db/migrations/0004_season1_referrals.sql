-- Season 01 commit slice 2: referrals and partner codes.
-- Plain SQL, idempotent. No dollar-quoted blocks, no semicolons inside comments.
-- Apply after 0003.

-- Codes: name visibility and partner display names.
-- The type check from 0001 already allows family, vanity and partner. Vanity stays
-- valid for old rows but is not used for new codes (partner codes replace it).
alter table s1_codes add column if not exists show_name boolean not null default true;
alter table s1_codes add column if not exists display_name text;

-- Referrals: make sure every column from the slice 2 contract exists.
alter table s1_referrals add column if not exists code text;
alter table s1_referrals add column if not exists inviter_family_id uuid references s1_families(id);
alter table s1_referrals add column if not exists referred_order_id uuid references s1_orders(id);
alter table s1_referrals add column if not exists friend_kids int not null default 0;
alter table s1_referrals add column if not exists status text not null default 'pending';
alter table s1_referrals add column if not exists reasons text[] not null default '{}';
alter table s1_referrals add column if not exists livemode boolean;
alter table s1_referrals add column if not exists created_at timestamptz not null default now();

-- One referral per referred order.
create unique index if not exists s1_referrals_referred_order_id_key on s1_referrals (referred_order_id);

-- Status values.
alter table s1_referrals drop constraint if exists s1_referrals_status_check;
alter table s1_referrals add constraint s1_referrals_status_check
  check (status in ('pending','matured','void','flagged'));

create index if not exists s1_referrals_code_created_at_idx on s1_referrals (code, created_at);
