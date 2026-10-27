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
