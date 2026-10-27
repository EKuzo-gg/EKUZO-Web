import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { customAlphabet } from "nanoid";
import { S1_TEST_DB_MARKER } from "./mode";

/**
 * Season 01 database layer. Neon HTTP driver, parameterized queries only.
 * Imports nothing from Next. Atomic multi-statement work uses
 * sql.transaction([...]); everything else is a single statement.
 */

type Sql = ReturnType<typeof neon>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

let _sql: Sql | null = null;

/**
 * Memoized Neon client. Unless S1_COMMIT_MODE is "live", DATABASE_URL must
 * point at the Neon test endpoint; anything else throws (fail closed).
 */
export function getSql(): Sql {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const live = (process.env.S1_COMMIT_MODE ?? "").trim().toLowerCase() === "live";
  if (!live && !url.includes(S1_TEST_DB_MARKER)) {
    throw new Error("Refusing: DATABASE_URL is not the Season 01 test database");
  }
  _sql = neon(url);
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
    const rows = await q(
      `update s1_guardians g
          set first_name = coalesce($3, g.first_name), phone = coalesce($4, g.phone)
         from s1_families f
        where g.email = $1 and g.livemode = $2 and f.id = g.family_id
        returning g.id as guardian_id, f.id as family_id, f.public_id as family_public_id`,
      [email, input.livemode, input.firstName ?? null, input.phone ?? null],
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
                                  referral_code, src, livemode)
           values ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            orderId, publicId, o.familyId, o.payerEmail.trim().toLowerCase(), o.offerId, o.offerVersion,
            o.amountCents, o.consentVersion, o.consentAt.toISOString(), o.consentIp ?? null,
            o.consentUa ?? null, o.referralCode ?? null, o.src ?? null, o.livemode,
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
      if (attempt === 2) throw err;
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
  /** The family's active code (type 'family'), if one has been minted. */
  code: string | null;
}

export async function getOrderByPublicId(publicId: string): Promise<OrderView | null> {
  const rows = await q(
    `select o.id, o.public_id, o.family_id, f.public_id as family_public_id, o.payer_email, o.status,
            o.amount_cents, o.payment_intent_id, o.paid_at, o.fulfilled_at, o.jersey_eligible, o.livemode,
            (select g.first_name from s1_guardians g where g.family_id = o.family_id order by g.created_at limit 1)
              as guardian_first_name,
            coalesce((
              select json_agg(json_build_object('id', k.id, 'firstName', k.first_name, 'age', k.age,
                                                'status', k.status, 'role', oi.role, 'unitCents', oi.unit_cents)
                              order by oi.created_at, k.created_at)
                from s1_order_items oi join s1_kids k on k.id = oi.kid_id
               where oi.order_id = o.id), '[]'::json) as kids,
            (select c.code from s1_codes c
              where c.family_id = o.family_id and c.type = 'family' and c.status = 'active' limit 1) as code
       from s1_orders o join s1_families f on f.id = o.family_id
      where o.public_id = $1`,
    [publicId],
  );
  const r = rows[0];
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
  };
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
  livemode?: boolean;
}): Promise<boolean> {
  const rows = await q(
    `insert into s1_events (source, type, subject, stripe_event_id, data, livemode)
     values ($1, $2, $3, $4, $5::jsonb, $6)
     on conflict (stripe_event_id) do nothing returning id`,
    [e.source, e.type, e.subject ?? null, e.stripeEventId ?? null, json(e.data), e.livemode ?? false],
  );
  return rows.length > 0;
}

/** ON CONFLICT DO NOTHING on dedupe_key. Returns true if a row was inserted. */
export async function enqueueOutbox(
  kind: string,
  dedupeKey: string,
  payload: unknown,
  livemode = false,
): Promise<boolean> {
  const rows = await q(
    `insert into s1_outbox (kind, dedupe_key, payload, livemode) values ($1, $2, $3::jsonb, $4)
     on conflict (dedupe_key) do nothing returning id`,
    [kind, dedupeKey, json(payload), livemode],
  );
  return rows.length > 0;
}
