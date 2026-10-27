-- Season 01 commit: money and ops red team resolutions (RT1, RT3, RT4, RT7, RT11, RT19, RT20,
-- ops 2). Plain SQL, idempotent. No dollar-quoted blocks, no semicolons inside comments.

-- RT1: a duplicate webhook event is done only once processed_at is set.
alter table s1_events add column if not exists processed_at timestamptz;

-- RT3: attempt reuse. One live (not canceled) order per payer email, attempt and mode.
alter table s1_orders add column if not exists attempt_id text;
-- A canceled order keeps its attempt id with a '#c<public id>' suffix, so the key stays free.
create unique index if not exists s1_orders_attempt_key on s1_orders (payer_email, attempt_id, livemode);

-- RT4: declines per PaymentIntent.
alter table s1_orders add column if not exists failure_count int not null default 0;

-- RT11: the s1_order cookie carries a raw token, the row stores its sha256.
alter table s1_orders add column if not exists view_token_hash text;
create unique index if not exists s1_orders_view_token_hash_key on s1_orders (view_token_hash);

-- RT7: submitted payer details live on the order, guardians are insert-only.
alter table s1_orders add column if not exists payer_first_name text;
alter table s1_orders add column if not exists payer_phone text;

-- RT20: client-supplied x-forwarded-for, kept apart from consent_ip.
alter table s1_orders add column if not exists consent_xff text;

-- RT19: payment method type, wallet and fingerprint.
alter table s1_orders add column if not exists pm_details jsonb;

-- Ops 2: livemode is always written explicitly.
alter table s1_events alter column livemode drop default;
alter table s1_outbox alter column livemode drop default;
alter table s1_order_items alter column livemode drop default;
alter table s1_rate_limits alter column livemode drop default;

-- Fulfil writes one event row per (type, subject), even when two fulfils race.
create unique index if not exists s1_events_fulfil_once on s1_events (type, subject) where source = 'fulfil';
