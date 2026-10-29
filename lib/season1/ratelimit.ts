import { getSql } from "./db";
import { keyIsLive } from "./stripe";

/**
 * Fixed-window rate limit on s1_rate_limits. window_start = floor(now/window).
 * Returns true when the call is allowed (count after increment <= limit).
 * About 1% of calls also delete rows older than a day. DB errors propagate:
 * the caller decides whether to fail open or closed. livemode (required by
 * the table since 0003) defaults to the Stripe key's mode.
 */
export async function hit(
  key: string,
  limit: number,
  windowSeconds: number,
  livemode: boolean = keyIsLive(),
): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql.query(
    `insert into s1_rate_limits (key, window_start, count, livemode)
     values ($1, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int), 1, $3)
     on conflict (key, window_start) do update set count = s1_rate_limits.count + 1
     returning count`,
    [key, windowSeconds, livemode],
  )) as { count: number }[];
  if (Math.random() < 0.01) {
    try {
      await sql.query(`delete from s1_rate_limits where window_start < now() - interval '1 day'`, []);
    } catch {
      // opportunistic cleanup only
    }
  }
  return (rows[0]?.count ?? 1) <= limit;
}

export interface HitSpec {
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Two hit() calls in one round trip (speed pass 10-29), same semantics as
 * calling hit(a) and then hit(b) only when a was allowed: the second insert
 * runs only when the first count is within its limit. Returns [a allowed,
 * b allowed]; b is null when it was not counted. Same 1% cleanup as hit().
 */
export async function hitPair(a: HitSpec, b: HitSpec, livemode: boolean = keyIsLive()): Promise<[boolean, boolean | null]> {
  const sql = getSql();
  const rows = (await sql.query(
    `with a as (
       insert into s1_rate_limits (key, window_start, count, livemode)
       values ($1, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int), 1, $6)
       on conflict (key, window_start) do update set count = s1_rate_limits.count + 1
       returning count),
     b as (
       insert into s1_rate_limits (key, window_start, count, livemode)
       select $4::text, to_timestamp(floor(extract(epoch from now()) / $5::int) * $5::int), 1, $6::boolean
        where (select count from a) <= $3::int
       on conflict (key, window_start) do update set count = s1_rate_limits.count + 1
       returning count)
     select (select count from a) as a_count, (select count from b) as b_count`,
    [a.key, a.windowSeconds, a.limit, b.key, b.windowSeconds, livemode],
  )) as { a_count: number | null; b_count: number | null }[];
  if (Math.random() < 0.01) {
    try {
      await sql.query(`delete from s1_rate_limits where window_start < now() - interval '1 day'`, []);
    } catch {
      // opportunistic cleanup only
    }
  }
  const aOk = (rows[0]?.a_count ?? 1) <= a.limit;
  if (!aOk) return [false, null];
  const bc = rows[0]?.b_count;
  return [true, bc == null ? null : bc <= b.limit];
}
