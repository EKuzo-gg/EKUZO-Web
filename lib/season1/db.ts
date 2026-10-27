import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { customAlphabet } from "nanoid";
import { S1_TEST_DB_MARKER, deployContext } from "./mode";
import { hashViewToken, newViewToken } from "./rules";

/**
 * Season 01 database layer. Neon HTTP driver, parameterized queries only.
 * Imports nothing from Next. Atomic multi-statement work uses
 * sql.transaction([...]); everything else is a single statement.
 */

type Sql = ReturnType<typeof neon>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

let _sql: Sql | null = null;

/** Per-query HTTP timeout (ops 12). A getter, so every fetch gets a fresh signal. */
export const QUERY_TIMEOUT_MS = 8000;
const fetchOptions = {
  get signal() {
    return AbortSignal.timeout(QUERY_TIMEOUT_MS);
  },
};

/**
 * Memoized Neon client. The guard keys on deploy context, not commit mode
 * (ops 1): a DATABASE_URL other than the Neon test endpoint is allowed only
 * when the deploy context is "production"; anything else throws (fail
 * closed). Commit mode gates PaymentIntent creation only.
 */
export function getSql(): Sql {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!url.includes(S1_TEST_DB_MARKER) && deployContext() !== "production") {
    throw new Error("Refusing: DATABASE_URL is not the Season 01 test database");
  }
  _sql = neon(url, { fetchOptions });
  return _sql;
}

async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  return (await getSql().query(text, params)) as Row[];
}

const publicIdAlphabet = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);
export function newPublicId(): string {
  return publicIdAlphabet();
}

/** lowercase, NFD, strip diacritics. */
export function foldName(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

const json = (v: unknown) => (v == null ? null : JSON.stringify(v));

// ── Families and guardians ────────────────────────────────────────────

export interface FamilyGuardian {
  familyId: string;
  familyPublicId: string;
  guardianId: string;
}

export async function upsertFamilyGuardian(input: {
  email: string;
  firstName?: string | null;
  phone?: string | null;
  livemode: boolean;
  attribution?: unknown;
  geo?: unknown;
}): Promise<FamilyGuardian> {
  const email = input.email.trim().toLowerCase();
  const find = async (): Promise<FamilyGuardian | null> => {
    // RT7: an existing guardian is never overwritten here; submitted name and
    // phone go on the order (payer_first_name, payer_phone).
    const rows = await q(
      `select g.id as guardian_id, f.id as family_id, f.public_id as family_public_id
         from s1_guardians g join s1_families f on f.id = g.family_id
        where g.email = $1 and g.livemode = $2`,
      [email, input.livemode],
    );
    return rows[0]
      ? { familyId: rows[0].family_id, familyPublicId: rows[0].family_public_id, guardianId: rows[0].guardian_id }
      : null;
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await find();
    if (existing) return existing;
    const familyId = randomUUID();
    const guardianId = randomUUID();
    const familyPublicId = newPublicId();
    const sql = getSql();
    try {
      await sql.transaction([
        sql.query(
          `insert into s1_families (id, public_id, geo, attribution, livemode)
           values ($1, $2, $3::jsonb, $4::jsonb, $5)`,
          [familyId, familyPublicId, json(input.geo), json(input.attribution), input.livemode],
        ),
        sql.query(
          `insert into s1_guardians (id, family_id, email, first_name, phone, livemode)
           values ($1, $2, $3, $4, $5, $6)`,
          [guardianId, familyId, email, input.firstName ?? null, input.phone ?? null, input.livemode],
        ),
      ]);
      return { familyId, familyPublicId, guardianId };
    } catch (err) {
      // Lost a race on unique(email, livemode) or public_id: the transaction
      // rolled back; loop and re-read.
      if (attempt === 2) throw err;
    }
  }
  throw new Error("upsertFamilyGuardian: unreachable");
}

// ── Kids ──────────────────────────────────────────────────────────────

export async function insertKids(
  familyId: string,
  kids: { firstName: string; age: number }[],
  now: Date,
): Promise<string[]> {
  if (kids.length === 0) return [];
  const sql = getSql();
  const ids = kids.map(() => randomUUID());
  await sql.transaction(
    kids.map((k, i) =>
      sql.query(
        `insert into s1_kids (id, family_id, first_name, first_name_key, age, age_given_at, livemode)
         select $1::uuid, f.id, $3::text, $4::text, $5::int, $6::timestamptz, f.livemode from s1_families f where f.id = $2`,
        [ids[i], familyId, k.firstName, foldName(k.firstName), k.age, now.toISOString()],
      ),
    ),
  );
  return ids;
}

/**
 * Kids on this email's paid orders that have not been refunded. Orders in
 * 'paid' or 'partially_refunded' count, minus kids individually marked
 * 'refunded'.
 */
export async function priorPaidKidCount(email: string, livemode: boolean): Promise<number> {
  const rows = await q(
    `select count(distinct oi.kid_id)::int as n
       from s1_orders o
       join s1_order_items oi on oi.order_id = o.id
       join s1_kids k on k.id = oi.kid_id
      where o.payer_email = $1 and o.livemode = $2
        and o.status in ('paid','partially_refunded')
        and k.status <> 'refunded'`,
    [email.trim().toLowerCase(), livemode],
  );
  return rows[0]?.n ?? 0;
}

// ── Orders ────────────────────────────────────────────────────────────

export interface PendingOrderInput {
  familyId: string;
  payerEmail: string;
  offerId: string;
  offerVersion: string;
  amountCents: number;
  consentVersion: string;
  consentAt: Date;
  consentIp?: string | null;
  consentUa?: string | null;
  referralCode?: string | null;
  src?: string | null;
  livemode: boolean;
  items: { kidId: string; role: "first" | "sibling"; unitCents: number }[];
  /** RT3 client attempt id. */
  attemptId?: string | null;
  /** RT7 submitted payer details. */
  payerFirstName?: string | null;
  payerPhone?: string | null;
  /** RT20 raw client-supplied x-forwarded-for. */
  consentXff?: string | null;
}

export async function insertPendingOrder(
  o: PendingOrderInput,
): Promise<{ orderId: string; publicId: string }> {
  const sql = getSql();
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderId = randomUUID();
    const publicId = newPublicId();
    try {
      await sql.transaction([
        sql.query(
          `insert into s1_orders (id, public_id, family_id, payer_email, offer_id, offer_version, status,
                                  amount_cents, consent_version, consent_at, consent_ip, consent_ua,
                                  referral_code, src, livemode, attempt_id, payer_first_name, payer_phone,
                                  consent_xff)
           values ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
          [
            orderId, publicId, o.familyId, o.payerEmail.trim().toLowerCase(), o.offerId, o.offerVersion,
            o.amountCents, o.consentVersion, o.consentAt.toISOString(), o.consentIp ?? null,
            o.consentUa ?? null, o.referralCode ?? null, o.src ?? null, o.livemode,
            o.attemptId ?? null, o.payerFirstName ?? null, o.payerPhone ?? null, o.consentXff ?? null,
          ],
        ),
        ...o.items.map((it) =>
          sql.query(
            `insert into s1_order_items (order_id, kid_id, role, unit_cents, livemode) values ($1,$2,$3,$4,$5)`,
            [orderId, it.kidId, it.role, it.unitCents, o.livemode],
          ),
        ),
      ]);
      return { orderId, publicId };
    } catch (err) {
      // A unique(payer_email, attempt_id, livemode) conflict will not clear on retry.
      if (attempt === 2 || /s1_orders_attempt_key/.test(String((err as Error)?.message ?? ""))) throw err;
    }
  }
  throw new Error("insertPendingOrder: unreachable");
}

export async function setOrderPaymentIntent(
  orderId: string,
  piId: string,
  piCreatedAt: Date,
  jerseyEligible: boolean,
): Promise<void> {
  await q(
    `update s1_orders set payment_intent_id = $2, pi_created_at = $3, jersey_eligible = $4 where id = $1`,
    [orderId, piId, piCreatedAt.toISOString(), jerseyEligible],
  );
}

export interface OrderKid {
  id: string;
  firstName: string;
  age: number | null;
  status: string;
  role: string;
  unitCents: number;
}
export interface OrderView {
  id: string;
  publicId: string;
  familyId: string;
  familyPublicId: string;
  payerEmail: string;
  status: string;
  amountCents: number;
  paymentIntentId: string | null;
  paidAt: Date | string | null;
  fulfilledAt: Date | string | null;
  jerseyEligible: boolean | null;
  livemode: boolean;
  guardianFirstName: string | null;
  kids: OrderKid[];
  /** The family's code (type 'family'), active first, whatever its status (ops 5). */
  code: string | null;
  flags: string[];
  /** Slice 2 (T7): the order carries a referral_code and a referral row exists for it. */
  inviteApplied: boolean;
}

const ORDER_VIEW_SELECT = `
  select o.id, o.public_id, o.family_id, f.public_id as family_public_id, o.payer_email, o.status,
         o.amount_cents, o.payment_intent_id, o.paid_at, o.fulfilled_at, o.jersey_eligible, o.livemode,
         o.flags,
         coalesce(o.payer_first_name,
           (select g.first_name from s1_guardians g where g.family_id = o.family_id order by g.created_at limit 1))
           as guardian_first_name,
         coalesce((
           select json_agg(json_build_object('id', k.id, 'firstName', k.first_name, 'age', k.age,
                                             'status', k.status, 'role', oi.role, 'unitCents', oi.unit_cents)
                           order by oi.created_at, k.created_at)
             from s1_order_items oi join s1_kids k on k.id = oi.kid_id
            where oi.order_id = o.id), '[]'::json) as kids,
         (select c.code from s1_codes c
           where c.family_id = o.family_id and c.type = 'family'
           order by (c.status = 'active') desc limit 1) as code,
         (o.referral_code is not null
           and exists (select 1 from s1_referrals r where r.referred_order_id = o.id)) as invite_applied
    from s1_orders o join s1_families f on f.id = o.family_id`;

function toOrderView(r: Row | undefined): OrderView | null {
  if (!r) return null;
  return {
    id: r.id,
    publicId: r.public_id,
    familyId: r.family_id,
    familyPublicId: r.family_public_id,
    payerEmail: r.payer_email,
    status: r.status,
    amountCents: r.amount_cents,
    paymentIntentId: r.payment_intent_id,
    paidAt: r.paid_at,
    fulfilledAt: r.fulfilled_at,
    jerseyEligible: r.jersey_eligible,
    livemode: r.livemode,
    guardianFirstName: r.guardian_first_name,
    kids: r.kids as OrderKid[],
    code: r.code ?? null,
    flags: (r.flags as string[] | null) ?? [],
    inviteApplied: r.invite_applied === true,
  };
}

/** Reference lookup only: the public id never grants a viewer access (RT11). */
export async function getOrderByPublicId(publicId: string): Promise<OrderView | null> {
  return toOrderView((await q(`${ORDER_VIEW_SELECT} where o.public_id = $1`, [publicId]))[0]);
}

/** The welcome page's lookup: by the sha256 of the s1_order cookie token. */
export async function getOrderByViewToken(token: string): Promise<OrderView | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 128) return null;
  return toOrderView((await q(`${ORDER_VIEW_SELECT} where o.view_token_hash = $1`, [hashViewToken(token)]))[0]);
}

/** New random view token for the order; stores only its hash. Replaces any earlier token. */
export async function issueViewToken(orderId: string): Promise<string> {
  const token = newViewToken();
  const rows = await q(`update s1_orders set view_token_hash = $2 where id = $1 returning id`, [
    orderId,
    hashViewToken(token),
  ]);
  if (!rows[0]) throw new Error("issueViewToken: order not found");
  return token;
}

export interface ClaimedOrder {
  orderId: string;
  publicId: string;
  familyId: string;
  payerEmail: string;
  amountCents: number;
  jerseyEligible: boolean | null;
  livemode: boolean;
}

function toClaimed(r: Row): ClaimedOrder {
  return {
    orderId: r.id,
    publicId: r.public_id,
    familyId: r.family_id,
    payerEmail: r.payer_email,
    amountCents: r.amount_cents,
    jerseyEligible: r.jersey_eligible,
    livemode: r.livemode,
  };
}

/** Single conditional UPDATE. Returns the order only for the caller that won the claim. */
export async function claimOrderPaid(piId: string, pmId: string | null): Promise<ClaimedOrder | null> {
  const rows = await q(
    `update s1_orders set status = 'paid', paid_at = now(), payment_method_id = $2
      where payment_intent_id = $1 and status = 'pending'
      returning id, public_id, family_id, payer_email, amount_cents, jersey_eligible, livemode`,
    [piId, pmId],
  );
  return rows[0] ? toClaimed(rows[0]) : null;
}

/** A paid order whose post-claim steps have not all finished (for fulfil retries). */
export async function getPaidUnfulfilledOrderByPi(piId: string): Promise<ClaimedOrder | null> {
  const rows = await q(
    `select id, public_id, family_id, payer_email, amount_cents, jersey_eligible, livemode
       from s1_orders where payment_intent_id = $1 and status = 'paid' and fulfilled_at is null`,
    [piId],
  );
  return rows[0] ? toClaimed(rows[0]) : null;
}

/** Marks fulfil complete. True if this call set it. */
export async function markFulfilled(orderId: string): Promise<boolean> {
  const rows = await q(
    `update s1_orders set fulfilled_at = now() where id = $1 and fulfilled_at is null returning id`,
    [orderId],
  );
  return rows.length > 0;
}

// ── Codes ─────────────────────────────────────────────────────────────

/**
 * Returns the family's existing 'family' code, or mints one with mintFn.
 * Conflicts on the code primary key retry with a fresh code (up to 5); a
 * conflict on the one-family-code partial index returns the existing code
 * (a concurrent order won). A code of type 'family' is returned whatever its
 * status, since the partial unique index covers the family regardless.
 */
export async function mintFamilyCode(
  familyId: string,
  livemode: boolean,
  mintFn: () => string,
): Promise<string> {
  const existing = async () =>
    (await q(`select code from s1_codes where family_id = $1 and type = 'family'`, [familyId]))[0]?.code as
      | string
      | undefined;
  const have = await existing();
  if (have) return have;
  for (let i = 0; i < 5; i++) {
    const code = mintFn();
    const rows = await q(
      `insert into s1_codes (code, family_id, type, livemode) values ($1, $2, 'family', $3)
       on conflict do nothing returning code`,
      [code, familyId, livemode],
    );
    if (rows[0]) return rows[0].code as string;
    const won = await existing();
    if (won) return won;
  }
  throw new Error("mintFamilyCode: could not mint a unique code");
}

// ── Events and outbox ─────────────────────────────────────────────────

/** Returns false when stripeEventId was already recorded. */
export async function insertEvent(e: {
  source: string;
  type: string;
  subject?: string | null;
  stripeEventId?: string | null;
  data?: unknown;
  livemode: boolean;
}): Promise<boolean> {
  if (typeof e.livemode !== "boolean") throw new Error("insertEvent: livemode is required");
  // Untargeted: also absorbs the one-fulfil-event-per-(type, subject) index.
  const rows = await q(
    `insert into s1_events (source, type, subject, stripe_event_id, data, livemode)
     values ($1, $2, $3, $4, $5::jsonb, $6)
     on conflict do nothing returning id`,
    [e.source, e.type, e.subject ?? null, e.stripeEventId ?? null, json(e.data), e.livemode],
  );
  return rows.length > 0;
}

/** ON CONFLICT DO NOTHING on dedupe_key. Returns true if a row was inserted. */
export async function enqueueOutbox(
  kind: string,
  dedupeKey: string,
  payload: unknown,
  livemode: boolean,
): Promise<boolean> {
  if (typeof livemode !== "boolean") throw new Error("enqueueOutbox: livemode is required");
  const rows = await q(
    `insert into s1_outbox (kind, dedupe_key, payload, livemode) values ($1, $2, $3::jsonb, $4)
     on conflict (dedupe_key) do nothing returning id`,
    [kind, dedupeKey, json(payload), livemode],
  );
  return rows.length > 0;
}

// ── Commit (RT3, RT6) ─────────────────────────────────────────────────

export interface AttemptOrder {
  orderId: string;
  publicId: string;
  familyId: string;
  status: string;
  amountCents: number;
  paymentIntentId: string | null;
  kids: { firstName: string; age: number | null }[];
  referralCode: string | null;
}

/** The order for (email, attempt, mode) that is not canceled, if any. */
export async function findPendingOrderByAttempt(
  email: string,
  attemptId: string,
  livemode: boolean,
): Promise<AttemptOrder | null> {
  const rows = await q(
    `select o.id, o.public_id, o.family_id, o.status, o.amount_cents, o.payment_intent_id, o.referral_code,
            coalesce((select json_agg(json_build_object('firstName', k.first_name, 'age', k.age))
                        from s1_order_items oi join s1_kids k on k.id = oi.kid_id
                       where oi.order_id = o.id), '[]'::json) as kids
       from s1_orders o
      where o.payer_email = $1 and o.attempt_id = $2 and o.livemode = $3`,
    [email.trim().toLowerCase(), attemptId, livemode],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    orderId: r.id,
    publicId: r.public_id,
    familyId: r.family_id,
    status: r.status,
    amountCents: r.amount_cents,
    paymentIntentId: r.payment_intent_id,
    kids: r.kids,
    referralCode: r.referral_code ?? null,
  };
}

/**
 * Marks a pending order canceled, frees its attempt id (suffix '#c<public id>')
 * and sets its pending kids canceled. True if this call canceled it.
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  const sql = getSql();
  const [rows] = await sql.transaction([
    sql.query(
      `update s1_orders set status = 'canceled', attempt_id = attempt_id || '#c' || public_id
        where id = $1 and status = 'pending' returning id`,
      [orderId],
    ),
    sql.query(
      `update s1_kids set status = 'canceled'
        where status = 'pending' and id in (select kid_id from s1_order_items where order_id = $1)
          and exists (select 1 from s1_orders where id = $1 and status = 'canceled')`,
      [orderId],
    ),
  ]);
  return (rows as Row[]).length > 0;
}

/** Stored Season 01 Customer id for the family, or null. */
export async function getFamilyCustomerId(familyId: string): Promise<string | null> {
  const rows = await q(`select stripe_customer_id from s1_families where id = $1`, [familyId]);
  return (rows[0]?.stripe_customer_id as string | null) ?? null;
}

/** Stores the customer id unless one is already set; returns the stored id. */
export async function setFamilyCustomerId(familyId: string, customerId: string): Promise<string> {
  const rows = await q(
    `update s1_families set stripe_customer_id = coalesce(stripe_customer_id, $2) where id = $1
     returning stripe_customer_id`,
    [familyId, customerId],
  );
  return (rows[0]?.stripe_customer_id as string) ?? customerId;
}

// ── Fulfil ────────────────────────────────────────────────────────────

export interface FulfilOrder {
  id: string;
  publicId: string;
  familyId: string;
  status: string;
  amountCents: number;
  paymentIntentId: string | null;
  livemode: boolean;
  piCreatedAt: Date | null;
  paidAt: Date | null;
  fulfilledAt: Date | null;
  /** Slice 2: the invite code accepted at commit, or null. */
  referralCode: string | null;
}

function toFulfilOrder(r: Row | undefined): FulfilOrder | null {
  if (!r) return null;
  const d = (v: unknown) => (v == null ? null : new Date(v as string));
  return {
    id: r.id,
    publicId: r.public_id,
    familyId: r.family_id,
    status: r.status,
    amountCents: r.amount_cents,
    paymentIntentId: r.payment_intent_id,
    livemode: r.livemode,
    piCreatedAt: d(r.pi_created_at),
    paidAt: d(r.paid_at),
    fulfilledAt: d(r.fulfilled_at),
    referralCode: r.referral_code ?? null,
  };
}

const FULFIL_COLS = `id, public_id, family_id, status, amount_cents, payment_intent_id, livemode,
                     pi_created_at, paid_at, fulfilled_at, referral_code`;

export async function getOrderForFulfilByPi(piId: string): Promise<FulfilOrder | null> {
  return toFulfilOrder((await q(`select ${FULFIL_COLS} from s1_orders where payment_intent_id = $1`, [piId]))[0]);
}

export async function getOrderForFulfilByPublicId(publicId: string): Promise<FulfilOrder | null> {
  return toFulfilOrder((await q(`select ${FULFIL_COLS} from s1_orders where public_id = $1`, [publicId]))[0]);
}

/** Ops 3: set payment_intent_id on an order that has none. Returns the order when it now carries piId. */
export async function backfillPaymentIntent(
  orderId: string,
  piId: string,
  piCreatedAt: Date,
): Promise<FulfilOrder | null> {
  await q(
    `update s1_orders set payment_intent_id = $2, pi_created_at = coalesce(pi_created_at, $3)
      where id = $1 and payment_intent_id is null`,
    [orderId, piId, piCreatedAt.toISOString()],
  );
  const o = toFulfilOrder((await q(`select ${FULFIL_COLS} from s1_orders where id = $1`, [orderId]))[0]);
  return o && o.paymentIntentId === piId ? o : null;
}

/**
 * The single claim (RT2, RT13). From 'pending' (or 'canceled': the money moved
 * anyway) to `status` ('paid' or 'refunded'). Returns true for the one caller
 * that won.
 */
export async function claimOrder(
  orderId: string,
  piId: string,
  pmId: string | null,
  status: "paid" | "refunded",
): Promise<boolean> {
  const rows = await q(
    `update s1_orders
        set status = $4, paid_at = coalesce(paid_at, now()), payment_method_id = $3,
            flags = case when status = 'canceled' then array_append(flags, 'paid_after_cancel') else flags end
      where id = $1 and payment_intent_id = $2 and status in ('pending','canceled')
      returning id`,
    [orderId, piId, pmId, status],
  );
  return rows.length > 0;
}

/** Adds flags (deduplicated) to an order. */
export async function addOrderFlags(orderId: string, flags: string[]): Promise<void> {
  if (flags.length === 0) return;
  await q(
    `update s1_orders set flags = array(select distinct unnest(flags || $2::text[])) where id = $1`,
    [orderId, flags],
  );
}

/** Sets status, optionally only from the given statuses. True if a row changed. */
export async function setOrderStatus(orderId: string, status: string, fromStatuses?: string[]): Promise<boolean> {
  const rows = fromStatuses
    ? await q(`update s1_orders set status = $2 where id = $1 and status = any($3::text[]) returning id`, [
        orderId,
        status,
        fromStatuses,
      ])
    : await q(`update s1_orders set status = $2 where id = $1 returning id`, [orderId, status]);
  return rows.length > 0;
}

/** Sets the kids on an order to `status`, only from the given statuses. */
export async function setOrderKidsStatus(orderId: string, status: string, fromStatuses: string[]): Promise<void> {
  await q(
    `update s1_kids set status = $2
      where id in (select kid_id from s1_order_items where order_id = $1) and status = any($3::text[])`,
    [orderId, status, fromStatuses],
  );
}

/** Ops 5: a family whose code was voided gets it back on a new paid order. */
export async function reactivateFamilyCode(familyId: string): Promise<void> {
  await q(`update s1_codes set status = 'active' where family_id = $1 and type = 'family' and status = 'void'`, [
    familyId,
  ]);
}

/** Billing ZIP from the payment method; keeps an existing value when zip is empty. */
export async function setFamilyBillingZip(familyId: string, zip: string | null): Promise<void> {
  if (!zip) return;
  await q(`update s1_families set billing_zip = $2 where id = $1`, [familyId, zip.slice(0, 20)]);
}

/** RT8 and RT19 fields written by fulfil. */
export async function setOrderFulfilFields(
  orderId: string,
  f: { jerseyEligible: boolean; pmDetails: unknown },
): Promise<void> {
  await q(`update s1_orders set jersey_eligible = $2, pm_details = $3::jsonb where id = $1`, [
    orderId,
    f.jerseyEligible,
    json(f.pmDetails),
  ]);
}

/**
 * RT15: a kid on this order shares a folded first name with a kid on another
 * paid, unrefunded order of the same family paid within 30 days.
 */
export async function hasDuplicateKid(orderId: string): Promise<boolean> {
  const rows = await q(
    `select 1
       from s1_orders o
       join s1_order_items oi on oi.order_id = o.id
       join s1_kids k on k.id = oi.kid_id
       join s1_orders o2 on o2.family_id = o.family_id and o2.id <> o.id
       join s1_order_items oi2 on oi2.order_id = o2.id
       join s1_kids k2 on k2.id = oi2.kid_id
      where o.id = $1
        and o2.status in ('paid','partially_refunded')
        and o2.paid_at > now() - interval '30 days'
        and k2.status <> 'refunded'
        and k2.first_name_key = k.first_name_key
      limit 1`,
    [orderId],
  );
  return rows.length > 0;
}

// ── Webhook ───────────────────────────────────────────────────────────

/** True once the event's handler finished (RT1). */
export async function getEventProcessed(stripeEventId: string): Promise<boolean> {
  const rows = await q(`select processed_at from s1_events where stripe_event_id = $1`, [stripeEventId]);
  return rows[0]?.processed_at != null;
}

export async function markEventProcessed(stripeEventId: string): Promise<void> {
  await q(`update s1_events set processed_at = coalesce(processed_at, now()) where stripe_event_id = $1`, [
    stripeEventId,
  ]);
}

/**
 * RT4: failure_count = the number of recorded payment_failed webhook events for
 * this PI (idempotent under replays). Returns the order and the new count.
 */
export async function incrementFailure(
  piId: string,
): Promise<{ orderId: string; publicId: string; status: string; failureCount: number } | null> {
  const rows = await q(
    `update s1_orders o
        set failure_count = (select count(*)::int from s1_events e
                              where e.type = 'payment_intent.payment_failed' and e.subject = $1
                                and e.source = 'webhook')
      where o.payment_intent_id = $1
      returning o.id, o.public_id, o.status, o.failure_count`,
    [piId],
  );
  const r = rows[0];
  return r ? { orderId: r.id, publicId: r.public_id, status: r.status, failureCount: r.failure_count } : null;
}

// ── Slice 2: invites at commit ────────────────────────────────────────

/**
 * P6: folded first names of kids on this email's paid or partially_refunded
 * orders (same livemode) whose own status is not 'refunded'.
 */
export async function paidKidKeys(email: string, livemode: boolean): Promise<string[]> {
  const rows = await q(
    `select distinct k.first_name_key
       from s1_orders o
       join s1_order_items oi on oi.order_id = o.id
       join s1_kids k on k.id = oi.kid_id
      where o.payer_email = $1 and o.livemode = $2
        and o.status in ('paid','partially_refunded')
        and k.status <> 'refunded'`,
    [email.trim().toLowerCase(), livemode],
  );
  return rows.map((r) => r.first_name_key as string).filter(Boolean);
}

/** Sets referral_code on a still-pending order (attempt reuse). True if a row changed. */
export async function setPendingOrderReferralCode(orderId: string, code: string | null): Promise<boolean> {
  const rows = await q(
    `update s1_orders set referral_code = $2
      where id = $1 and status = 'pending' and referral_code is distinct from $2 returning id`,
    [orderId, code],
  );
  return rows.length > 0;
}

/** Adds flags (deduplicated) to the family of the guardian with this email. */
export async function addFamilyFlagsByEmail(email: string, livemode: boolean, flags: string[]): Promise<void> {
  if (flags.length === 0) return;
  await q(
    `update s1_families set flags = array(select distinct unnest(flags || $3::text[]))
      where id = (select family_id from s1_guardians where email = $1 and livemode = $2)`,
    [email.trim().toLowerCase(), livemode, flags],
  );
}

// ── Slice 2: referrals at fulfil ──────────────────────────────────────

export interface ReferralRow {
  id: string;
  code: string;
  inviterFamilyId: string;
  referredOrderId: string;
  friendKids: number;
  status: string;
  reasons: string[];
  livemode: boolean;
  createdAt: Date;
}

function toReferral(r: Row | undefined): ReferralRow | null {
  if (!r) return null;
  return {
    id: r.id,
    code: r.code,
    inviterFamilyId: r.inviter_family_id,
    referredOrderId: r.referred_order_id,
    friendKids: r.friend_kids,
    status: r.status,
    reasons: (r.reasons as string[] | null) ?? [],
    livemode: r.livemode,
    createdAt: new Date(r.created_at),
  };
}

const REFERRAL_COLS = `id, code, inviter_family_id, referred_order_id, friend_kids, status, reasons, livemode, created_at`;

export async function getReferralByOrder(orderId: string): Promise<ReferralRow | null> {
  return toReferral((await q(`select ${REFERRAL_COLS} from s1_referrals where referred_order_id = $1`, [orderId]))[0]);
}

/** The code row behind an accepted invite: owning family, type and status. */
export async function getCodeRow(
  code: string,
  livemode: boolean,
): Promise<{ familyId: string; type: string; status: string } | null> {
  const r = (await q(`select family_id, type, status from s1_codes where code = $1 and livemode = $2`, [code, livemode]))[0];
  return r ? { familyId: r.family_id, type: r.type, status: r.status } : null;
}

export async function orderKidCount(orderId: string): Promise<number> {
  const rows = await q(`select count(*)::int as n from s1_order_items where order_id = $1`, [orderId]);
  return rows[0]?.n ?? 0;
}

/**
 * Inserts the order's referral (status 'pending') ON CONFLICT DO NOTHING on
 * referred_order_id, then returns the row (this call's or an earlier one's).
 */
export async function insertReferral(r: {
  code: string;
  inviterFamilyId: string;
  referredOrderId: string;
  friendKids: number;
  livemode: boolean;
}): Promise<{ row: ReferralRow; inserted: boolean }> {
  const ins = await q(
    `insert into s1_referrals (code, inviter_family_id, referred_order_id, friend_kids, status, livemode)
     values ($1, $2, $3, $4, 'pending', $5)
     on conflict (referred_order_id) do nothing returning id`,
    [r.code, r.inviterFamilyId, r.referredOrderId, r.friendKids, r.livemode],
  );
  const row = await getReferralByOrder(r.referredOrderId);
  if (!row) throw new Error("insertReferral: row missing after insert");
  return { row, inserted: ins.length > 0 };
}

/**
 * Inputs for computeFlags, measured as of this referral's created_at so a rerun
 * of fulfil computes the same answer: joins on the code in the 24 h up to and
 * including this one; the inviter family's live (pending or matured) friend kids
 * up to and including this one; fingerprints on the inviter family's paid orders;
 * the inviter family's billing ZIP.
 */
export async function referralFlagContext(ref: ReferralRow): Promise<{
  codeJoinsLast24h: number;
  inviterLiveFriendKidsAfter: number;
  inviterFingerprints: string[];
  inviterZip: string | null;
}> {
  const rows = await q(
    `with me as (select created_at as t from s1_referrals where id = $3)
     select
       (select count(*)::int from s1_referrals r, me
         where r.code = $1 and r.livemode = $4
           and r.created_at <= me.t and r.created_at > me.t - interval '24 hours') as joins_24h,
       (select coalesce(sum(r.friend_kids), 0)::int from s1_referrals r, me
         where r.inviter_family_id = $2 and r.livemode = $4
           and r.status in ('pending','matured') and r.created_at <= me.t) as live_kids,
       (select coalesce(array_agg(distinct o.pm_details->>'fingerprint'), '{}')
          from s1_orders o
         where o.family_id = $2 and o.status in ('paid','partially_refunded')
           and o.pm_details->>'fingerprint' is not null) as fingerprints,
       (select f.billing_zip from s1_families f where f.id = $2) as zip`,
    [ref.code, ref.inviterFamilyId, ref.id, ref.livemode],
  );
  const r = rows[0] ?? {};
  return {
    codeJoinsLast24h: r.joins_24h ?? 0,
    inviterLiveFriendKidsAfter: r.live_kids ?? 0,
    inviterFingerprints: ((r.fingerprints as string[] | null) ?? []).filter(Boolean),
    inviterZip: r.zip ?? null,
  };
}

/** Adds reasons (deduplicated) to a referral. */
export async function addReferralReasons(referralId: string, reasons: string[]): Promise<void> {
  if (reasons.length === 0) return;
  await q(
    `update s1_referrals set reasons = array(select distinct unnest(reasons || $2::text[])) where id = $1`,
    [referralId, reasons],
  );
}

/**
 * Full refund side effects (slice 2): the order's referral becomes 'void'; when
 * the family has no other paid or partially_refunded order, its family code
 * becomes 'void' (existing referrals on it keep their status). Idempotent.
 */
export async function voidOnFullRefund(
  orderId: string,
  familyId: string,
): Promise<{ referralVoided: boolean; codeVoided: boolean }> {
  const ref = await q(
    `update s1_referrals set status = 'void' where referred_order_id = $1 and status <> 'void' returning id`,
    [orderId],
  );
  const code = await q(
    `update s1_codes set status = 'void'
      where family_id = $1 and type = 'family' and status = 'active'
        and not exists (select 1 from s1_orders o
                         where o.family_id = $1 and o.id <> $2 and o.status in ('paid','partially_refunded'))
      returning code`,
    [familyId, orderId],
  );
  return { referralVoided: ref.length > 0, codeVoided: code.length > 0 };
}

/**
 * Ops 4: a partial refund attributed to one kid (refund metadata s1_kid_id, set by
 * scripts/s1-refund.mjs). Marks that kid refunded and takes one friend kid off the
 * order's referral (void at zero). Returns false when the kid is not on the order or
 * was already refunded, so a replay changes nothing.
 */
export async function refundKid(orderId: string, kidId: string): Promise<boolean> {
  const kid = await q(
    `update s1_kids set status = 'refunded'
      where id = $2::uuid and status <> 'refunded'
        and id in (select kid_id from s1_order_items where order_id = $1)
      returning id`,
    [orderId, kidId],
  );
  if (kid.length === 0) return false;
  await q(
    `update s1_referrals
        set friend_kids = greatest(friend_kids - 1, 0),
            status = case when friend_kids - 1 <= 0 then 'void' else status end
      where referred_order_id = $1 and status <> 'void'`,
    [orderId],
  );
  return true;
}
