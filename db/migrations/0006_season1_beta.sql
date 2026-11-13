-- Season 01 free beta: families and players from the sign-up wizard (/season1/beta/start).
-- Separate from s1_families and s1_kids on purpose: those belong to checkout, and the
-- never-paid sweep (scripts/s1-sweep.mjs) blanks kid names there. Additive only.
-- Plain SQL, idempotent-safe. Statements end with a semicolon at end of line; no $$ blocks.

create table if not exists s1_beta_families (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default '',
  attribution jsonb,
  geo jsonb,
  livemode boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, livemode)
);

create table if not exists s1_beta_players (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references s1_beta_families(id),
  first_name text not null,
  first_name_key text not null,
  age int not null,
  plays_on text[] not null default '{}',
  team_sports text not null default '',
  superpowers text[] not null default '{}',
  fun_fact text not null default '',
  expectations text[] not null default '{}',
  time_zone text not null default '',
  tz text not null default '',
  times text[] not null default '{}',
  note text not null default '',
  source text not null default '',
  attribution jsonb,
  page text not null default '',
  last_event_id text not null default '',
  submissions int not null default 1,
  status text not null default 'interested',
  livemode boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, first_name_key)
);

create index if not exists s1_beta_players_family_id_idx on s1_beta_players (family_id);
