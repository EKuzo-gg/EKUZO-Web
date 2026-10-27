-- Season 01 commit: initial schema (frozen spec, Database section).
-- Plain SQL, idempotent-safe. Postgres 18 (Neon). Statements end with a
-- semicolon at end of line; there are no $$ blocks in this file.

create table if not exists s1_families (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  stripe_customer_id text,
  billing_zip text,
  geo jsonb,
  attribution jsonb,
  flags text[] not null default '{}',
  livemode boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists s1_guardians (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references s1_families(id),
  email text not null,
  first_name text,
  phone text,
  text_consent_at timestamptz,
  livemode boolean not null,
  created_at timestamptz not null default now(),
  unique (email, livemode)
);

create table if not exists s1_kids (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references s1_families(id),
  first_name text not null,
  first_name_key text not null,
  age int,
  age_given_at timestamptz,
  status text not null default 'pending',
  livemode boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists s1_orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  family_id uuid not null references s1_families(id),
  payer_email text not null,
  offer_id text not null,
  offer_version text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','refunded','partially_refunded','canceled')),
  amount_cents int not null check (amount_cents >= 0),
  payment_intent_id text unique,
  payment_method_id text,
  consent_version text,
  consent_at timestamptz,
  consent_ip text,
  consent_ua text,
  jersey_eligible boolean,
  pi_created_at timestamptz,
  paid_at timestamptz,
  referral_code text,
  src text,
  flags text[] not null default '{}',
  livemode boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists s1_order_items (
  order_id uuid not null references s1_orders(id),
  kid_id uuid not null references s1_kids(id),
  role text not null check (role in ('first','sibling')),
  unit_cents int not null check (unit_cents >= 0),
  livemode boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (order_id, kid_id)
);

create table if not exists s1_codes (
  code text primary key,
  family_id uuid not null references s1_families(id),
  type text not null default 'family' check (type in ('family','vanity','partner')),
  target_code text,
  status text not null default 'active',
  livemode boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists s1_referrals (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  inviter_family_id uuid not null references s1_families(id),
  referred_order_id uuid not null unique references s1_orders(id),
  friend_kids int not null default 0,
  status text not null default 'pending',
  reasons text[] not null default '{}',
  livemode boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists s1_events (
  id bigserial primary key,
  at timestamptz not null default now(),
  source text not null,
  type text not null,
  subject text,
  stripe_event_id text unique,
  data jsonb,
  livemode boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists s1_outbox (
  id bigserial primary key,
  kind text not null,
  dedupe_key text not null unique,
  payload jsonb,
  status text not null default 'pending',
  attempts int not null default 0,
  last_error text,
  updated_at timestamptz,
  livemode boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists s1_rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  livemode boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (key, window_start)
);

create index if not exists s1_orders_family_id_idx on s1_orders (family_id);
create index if not exists s1_orders_payer_email_livemode_idx on s1_orders (payer_email, livemode);
create index if not exists s1_kids_family_id_idx on s1_kids (family_id);
create index if not exists s1_outbox_status_idx on s1_outbox (status);
create index if not exists s1_codes_family_id_idx on s1_codes (family_id);
create unique index if not exists s1_codes_one_family_code_idx on s1_codes (family_id) where type = 'family';
