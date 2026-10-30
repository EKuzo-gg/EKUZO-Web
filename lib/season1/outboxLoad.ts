import { getSql } from "./db";
import { cleanFirstTouch, validFbc, validFbp } from "./attribution";
import type { FriendCtx, KidCtx, OrderCtx } from "./senders/context";

/**
 * Reads for the outbox senders. Outbox payloads carry only ids; everything a
 * sender needs is loaded here by order public id or referral id, so fulfil
 * does not have to know what each channel wants. Neon HTTP, parameterized.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  return (await getSql().query(text, params)) as Row[];
}

const iso = (v: unknown): string | null => (v == null ? null : new Date(v as string).toISOString());
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

const ORDER_SQL = `
  select o.public_id, o.livemode, o.status, o.payer_email, o.payer_first_name, o.payer_phone,
         o.consent_at, o.consent_ip, o.consent_ua, o.amount_cents, o.paid_at, o.src, o.offer_version,
         o.jersey_eligible, o.referral_code, o.family_id, o.attribution as order_attribution,
         f.public_id as family_public_id, f.geo, f.attribution,
         (select g.first_name from s1_guardians g where g.family_id = o.family_id order by g.created_at limit 1)
           as guardian_first_name,
         (select c.code from s1_codes c where c.family_id = o.family_id and c.type = 'family'
           order by (c.status = 'active') desc limit 1) as code,
         coalesce((
           select json_agg(json_build_object('firstName', k.first_name, 'age', k.age, 'role', oi.role)
                           order by (oi.role = 'first') desc, oi.created_at, k.created_at)
             from s1_order_items oi join s1_kids k on k.id = oi.kid_id
            where oi.order_id = o.id), '[]'::json) as kids,
         (select k.first_name from s1_codes ic join s1_kids k on k.family_id = ic.family_id
           where ic.code = o.referral_code and ic.livemode = o.livemode
           order by k.created_at limit 1) as inviter_kid
    from s1_orders o join s1_families f on f.id = o.family_id
   where o.public_id = $1`;

export async function loadOrderCtx(publicId: string): Promise<OrderCtx | null> {
  const r = (await q(ORDER_SQL, [publicId]))[0];
  if (!r) return null;
  const geo = (r.geo && typeof r.geo === "object" ? r.geo : {}) as Record<string, unknown>;
  const attr = (r.attribution && typeof r.attribution === "object" ? r.attribution : {}) as Record<string, unknown>;
  // Analytics S6, S7: the order's own attribution first (every order since 0005), then the family's.
  const oa = (r.order_attribution && typeof r.order_attribution === "object" && !Array.isArray(r.order_attribution)
    ? r.order_attribution
    : {}) as Record<string, unknown>;
  const lc = (oa.lc && typeof oa.lc === "object" && !Array.isArray(oa.lc) ? oa.lc : {}) as Record<string, unknown>;
  const utm = (k: string): string | null => (typeof lc[k] === "string" && lc[k] ? (lc[k] as string).slice(0, 160) : null);
  return {
    orderPublicId: r.public_id,
    livemode: r.livemode === true,
    status: r.status,
    email: String(r.payer_email).trim().toLowerCase(),
    parentFirstName: str(r.payer_first_name) ?? str(r.guardian_first_name),
    phone: str(r.payer_phone),
    consentAt: iso(r.consent_at),
    consentIp: str(r.consent_ip),
    consentUa: str(r.consent_ua),
    amountCents: r.amount_cents,
    paidAt: iso(r.paid_at),
    src: str(r.src),
    offerVersion: r.offer_version,
    jerseyEligible: r.jersey_eligible ?? null,
    invited: r.referral_code != null,
    referralCode: str(r.referral_code),
    familyPublicId: r.family_public_id,
    code: str(r.code),
    kids: ((r.kids as KidCtx[] | null) ?? []).map((k) => ({ firstName: k.firstName, age: k.age ?? null, role: k.role })),
    geoCity: str(geo.geo_city),
    geoRegion: str(geo.geo_region),
    geoTz: str(geo.geo_tz),
    fbp: validFbp(oa.fbp) ?? validFbp(attr.fbp),
    fbc: validFbc(oa.fbc) ?? validFbc(attr.fbc),
    utmSource: utm("utm_source"),
    utmMedium: utm("utm_medium"),
    utmCampaign: utm("utm_campaign"),
    utmContent: utm("utm_content"),
    firstTouch: typeof oa.first_touch === "string" ? cleanFirstTouch(oa.first_touch) : null,
    // The test request origin (family attribution). Never the order's first touch.
    origin: str(attr.origin),
    inviterKidName: str(r.inviter_kid),
  };
}

const FRIEND_SQL = `
  select r.id, r.code, r.friend_kids, r.livemode, r.inviter_family_id,
         coalesce(
           (select g.email from s1_guardians g where g.family_id = r.inviter_family_id order by g.created_at limit 1),
           (select o.payer_email from s1_orders o where o.family_id = r.inviter_family_id
             order by o.created_at limit 1)) as inviter_email,
         coalesce(
           (select o.payer_first_name from s1_orders o where o.family_id = r.inviter_family_id
              and o.payer_first_name is not null order by o.created_at limit 1),
           (select g.first_name from s1_guardians g where g.family_id = r.inviter_family_id order by g.created_at limit 1))
           as inviter_first_name,
         (select k.first_name from s1_kids k where k.family_id = r.inviter_family_id order by k.created_at limit 1)
           as inviter_kid,
         (select coalesce(sum(r2.friend_kids), 0)::int from s1_referrals r2
           where r2.inviter_family_id = r.inviter_family_id and r2.livemode = r.livemode
             and r2.status in ('pending','matured')) as friends_total,
         (select o.public_id from s1_orders o where o.id = r.referred_order_id) as joiner_ref,
         (select f.attribution->>'origin' from s1_families f where f.id = r.inviter_family_id) as origin
    from s1_referrals r
   where r.id = $1`;

export async function loadFriendCtx(referralId: string): Promise<FriendCtx | null> {
  // referral ids are uuids; anything else cannot match and must not reach the cast.
  if (!/^[0-9a-f-]{36}$/i.test(referralId)) return null;
  const r = (await q(FRIEND_SQL, [referralId]))[0];
  if (!r || !r.inviter_email) return null;
  return {
    referralId: r.id,
    livemode: r.livemode === true,
    inviterEmail: String(r.inviter_email).trim().toLowerCase(),
    inviterFirstName: str(r.inviter_first_name),
    inviterKidName: str(r.inviter_kid),
    code: r.code,
    friendKids: r.friend_kids,
    friendsTotal: r.friends_total ?? 0,
    joinerOrderRef: str(r.joiner_ref),
    origin: str(r.origin),
  };
}
