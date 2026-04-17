/**
 * Squad / crew link helpers.
 *
 * Used by:
 * - `/squad/[token]` server component (fetches owner at render time)
 * - `/api/squad/[token]` GET handler (client-side proxy for the register page)
 *
 * Apps Script is the source of truth. This module hits
 * `GOOGLE_SHEETS_WEBHOOK_URL?action=squad&token=X` and returns the owner
 * record or null on 404 / parse errors.
 */

export type SquadOwner = {
  owner_gamer_name: string;
  week_label: string;
  slot: string;
  week_dates: string;
};

/**
 * Validate a squad token shape before trusting it. Real tokens are
 * 10-char nanoids (alphabet A–Z a–z 0–9 _ -). We accept 4–32 chars to
 * give headroom for future length changes without churn, and we reject
 * anything else so arbitrary client input can't reach Apps Script or
 * Stripe metadata.
 */
export function isValidSquadToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    token.length >= 4 &&
    token.length <= 32 &&
    /^[A-Za-z0-9_-]+$/.test(token)
  );
}

export async function fetchSquadOwner(
  token: string
): Promise<SquadOwner | null> {
  if (!isValidSquadToken(token)) return null;
  const base = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!base) return null;

  const url = `${base}${base.includes("?") ? "&" : "?"}action=squad&token=${encodeURIComponent(token)}`;

  try {
    // Crews are immutable after creation (token, owner, week, slot, dates
    // never change), so a 60s stale window is indistinguishable from
    // fresh. This caps Apps Script UrlFetch calls at ~1/minute per token
    // regardless of how viral a crew link goes — important because Apps
    // Script has a hard daily UrlFetch quota that would otherwise take
    // down the entire webhook path if a single link blew up.
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    // Apps Script may wrap errors as { error: "not_found" } or similar.
    if (!data || data.error || !data.owner_gamer_name) return null;
    // Trim on the way out: a stray space in a Sheets cell would otherwise
    // break the register page's crew-match comparison and fire the
    // confirm dialog spuriously.
    return {
      owner_gamer_name: String(data.owner_gamer_name || "").trim(),
      week_label: String(data.week_label || "").trim(),
      slot: String(data.slot || "").trim(),
      week_dates: String(data.week_dates || "").trim(),
    };
  } catch {
    return null;
  }
}

/**
 * Decide whether a camp week has already passed given its human date range
 * (e.g. "May 25 - 29", "June 01 - 05", "Jul 27 - 31"). Uses the end-of-range
 * date at 23:59 local. If parsing fails, returns false (fail-open:
 * upcoming) so we never hide a valid link because of bad data.
 *
 * ⚠️  TEST IN LATE MAY 2026: this function can't be meaningfully exercised
 * until the first camp week actually ends (Week 01: May 18–22). On
 * 2026-05-23 or later, create a test `squads` row with `week_dates = "May
 * 18 - 22"` and verify `/squad/{token}` renders state 2 ("this crew's
 * camp week has already happened"). No automated test exists — this is
 * a manual check. Put a reminder on the calendar for 2026-05-25.
 */
export function hasWeekPassed(weekDates: string, now: Date = new Date()): boolean {
  if (!weekDates) return false;
  const match = weekDates.match(
    /^([A-Za-z]+)\s+\d+\s*[-–]\s*(?:([A-Za-z]+)\s+)?(\d+)$/
  );
  if (!match) return false;
  const [, startMonth, endMonthMaybe, endDayStr] = match;
  const endMonth = endMonthMaybe || startMonth;
  const endDay = parseInt(endDayStr, 10);
  if (!endMonth || Number.isNaN(endDay)) return false;

  const year = now.getFullYear();
  const parsed = new Date(`${endMonth} ${endDay}, ${year} 23:59:59`);
  if (Number.isNaN(parsed.getTime())) return false;

  // If parsed date is more than ~6 months in the past, it's probably next year.
  const sixMonthsAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180);
  if (parsed < sixMonthsAgo) return false;

  return parsed < now;
}
