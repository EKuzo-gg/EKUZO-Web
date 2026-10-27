import { getSql } from "./db";
import { normalize } from "./codes";
import { hit } from "./ratelimit";
import { ipBucket, isCrawlerUa } from "./referralFlags";

export { ipBucket, isCrawlerUa, computeFlags } from "./referralFlags";

/**
 * Referral code lookup and invite decisions (slice 2). Parameterized SQL only,
 * through getSql(). Spec: 02b-spec-slice2.md (T2, T3, T4, T6, T8, T13).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function q(text: string, params: unknown[]): Promise<Row[]> {
  return (await getSql().query(text, params)) as Row[];
}

export const IP_LIMIT = 30;
export const IP_WINDOW_SECONDS = 10 * 60;
export const GLOBAL_LIMIT = 300;
export const GLOBAL_WINDOW_SECONDS = 60 * 60;

export interface ResolvedCode {
  code: string;
  familyId: string;
  /** The name to show (kid first name, or partner display name). Null when nameless. */
  displayName: string | null;
  /** True when displayName is non-null. */
  named: boolean;
}

interface CodeLookup {
  code: string;
  familyId: string;
  type: string;
  showName: boolean;
  partnerName: string | null;
  kidName: string | null;
}

const PAID = `('paid','partially_refunded')`;

/**
 * Active code row plus eligibility. Family codes need a family with a paid or
 * partially_refunded order. Partner codes need only an active row. Vanity rows
 * (legacy) do not resolve. The kid name is the first 'committed' kid on the
 * family's earliest paid order (order paid_at, then order_items order).
 */
async function lookupCode(code: string, livemode: boolean): Promise<CodeLookup | null> {
  const rows = await q(
    `select c.code, c.family_id, c.type, c.show_name, c.display_name,
            exists (select 1 from s1_orders o where o.family_id = c.family_id and o.status in ${PAID}) as has_paid,
            (select k.first_name
               from s1_order_items oi
               join s1_kids k on k.id = oi.kid_id
              where oi.order_id = (select o2.id from s1_orders o2
                                    where o2.family_id = c.family_id and o2.status in ${PAID}
                                    order by o2.paid_at asc nulls last, o2.created_at asc limit 1)
                and k.status = 'committed'
              order by oi.created_at asc, k.created_at asc limit 1) as kid_name
       from s1_codes c
      where c.code = $1 and c.livemode = $2 and c.status = 'active'`,
    [code, livemode],
  );
  const r = rows[0];
  if (!r) return null;
  if (r.type === "partner") {
    return {
      code: r.code, familyId: r.family_id, type: "partner", showName: r.show_name !== false,
      partnerName: r.display_name ?? null, kidName: null,
    };
  }
  if (r.type !== "family" || !r.has_paid) return null;
  return {
    code: r.code, familyId: r.family_id, type: "family", showName: r.show_name !== false,
    partnerName: null, kidName: r.kid_name ?? null,
  };
}

/**
 * Resolve a raw code. Null for unknown, void or ineligible codes. The code is
 * still returned (so the signed cookie can be set, T8) when the name is withheld:
 * show_name false, crawler UA, or rate limited.
 * Named family renders count against the per-IP (30 / 10 min, /64 for IPv6) and
 * global (300 / hour) limits unless countForLimit is false. Rate-limit errors fail
 * closed to nameless.
 */
export async function resolveCode(
  rawCode: string,
  opts: { ip?: string | null; userAgent?: string | null; livemode: boolean; countForLimit?: boolean },
): Promise<ResolvedCode | null> {
  const code = normalize(rawCode);
  if (!code) return null;
  const found = await lookupCode(code, opts.livemode);
  if (!found) return null;

  const nameless = (): ResolvedCode => ({ code: found.code, familyId: found.familyId, displayName: null, named: false });
  const candidate = found.type === "partner" ? found.partnerName : found.showName ? found.kidName : null;
  if (!candidate) return nameless();
  if (isCrawlerUa(opts.userAgent)) return nameless();

  // Partner display names are public by design: no limiter.
  if (found.type === "family" && opts.countForLimit !== false) {
    try {
      const okIp = await hit(`ref:ip:${ipBucket(opts.ip)}`, IP_LIMIT, IP_WINDOW_SECONDS);
      if (!okIp) return nameless();
      const okGlobal = await hit(`ref:global`, GLOBAL_LIMIT, GLOBAL_WINDOW_SECONDS);
      if (!okGlobal) return nameless();
    } catch {
      return nameless();
    }
  }
  return { code: found.code, familyId: found.familyId, displayName: candidate, named: true };
}

export type InviteReason = "ok" | "unknown" | "own_family" | "already_paid";

/**
 * Whether a commit by `committingEmail` may carry this code. Ignored when the
 * code is unknown or void, belongs to the committing family (a guardian with this
 * email), or the email already has a paid or partially_refunded order.
 */
export async function inviteDecision(input: {
  code: string;
  committingEmail: string;
  livemode: boolean;
}): Promise<{ applied: boolean; reason: InviteReason }> {
  const code = normalize(input.code);
  if (!code) return { applied: false, reason: "unknown" };
  const found = await lookupCode(code, input.livemode);
  if (!found) return { applied: false, reason: "unknown" };
  const email = input.committingEmail.trim().toLowerCase();

  const own = await q(
    `select 1 from s1_guardians g where g.family_id = $1 and g.email = $2 and g.livemode = $3 limit 1`,
    [found.familyId, email, input.livemode],
  );
  if (own.length > 0) return { applied: false, reason: "own_family" };

  const paid = await q(
    `select 1 from s1_orders o where o.payer_email = $1 and o.livemode = $2 and o.status in ${PAID} limit 1`,
    [email, input.livemode],
  );
  if (paid.length > 0) return { applied: false, reason: "already_paid" };
  return { applied: true, reason: "ok" };
}
