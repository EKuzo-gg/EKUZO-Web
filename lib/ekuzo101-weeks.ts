/**
 * Week computation logic for EKUZO 101 Summer Pilot.
 *
 * SESSION_HOUR_ET: The local ET hour at which sessions start. A Tuesday week
 * becomes ineligible at exactly this moment — the 7 PM ET session start acts
 * as the hard cutoff for late enrollment. After 7 PM ET on the Tuesday, that
 * week is gone from the picker.
 */

const SESSION_HOUR_ET = 19; // 7 PM ET — session start cutoff

export type WeekOption = {
  tuesdayISO: string;  // "2026-07-21"
  thursdayISO: string; // "2026-07-23"
  label: string;       // "Week of Jul 21"
  tueFull: string;     // "Tue, Jul 21"
  thuFull: string;     // "Thu, Jul 23"
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Returns the UTC instant when the 7 PM ET session starts on the given Tuesday ISO.
 * DST-correct: uses Intl to measure the real ET offset for that specific date.
 */
function getSessionStartUTC(tuesdayISO: string): Date {
  const [year, month, day] = tuesdayISO.split("-").map(Number);

  // Initial guess: assume EDT (UTC-4), so 19:00 ET = 23:00 UTC
  let sessionUTC = new Date(Date.UTC(year, month - 1, day, 23, 0, 0));

  // Check what ET hour that UTC instant actually represents
  const etHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(sessionUTC),
    10
  );

  // Adjust if ET hour is not the target (e.g. during EST when offset is UTC-5)
  if (etHour !== SESSION_HOUR_ET) {
    sessionUTC = new Date(
      sessionUTC.getTime() + (SESSION_HOUR_ET - etHour) * 3_600_000
    );
  }

  return sessionUTC;
}

/**
 * Returns the ISO Thursday string for a given Tuesday ISO string.
 * Thursday = Tuesday + 2 days.
 */
function tuesdayToThursday(tuesdayISO: string): string {
  const [year, month, day] = tuesdayISO.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 2));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Advance a UTC date by N days and return a new Date at midnight UTC.
 */
function addDaysUTC(d: Date, days: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

/**
 * Format an ISO date string to "Jul 21" (month + day).
 */
function formatMonthDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  // Use UTC noon to avoid any timezone shift during formatting
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

// ─── Formatting helpers (exported for the API route) ──────────────────────────

/** "Week of Jul 21" */
export function formatWeekLabel(tuesdayISO: string): string {
  return `Week of ${formatMonthDay(tuesdayISO)}`;
}

/** "Tue, Jul 21" */
export function formatTueFull(tuesdayISO: string): string {
  return `Tue, ${formatMonthDay(tuesdayISO)}`;
}

/** "Thu, Jul 23" */
export function formatThuFull(thursdayISO: string): string {
  return `Thu, ${formatMonthDay(thursdayISO)}`;
}

// ─── Core exports ──────────────────────────────────────────────────────────────

/**
 * Returns true if the given Tuesday week has not yet started (i.e. now is
 * before 7 PM ET on that Tuesday).
 */
export function isWeekEligible(tuesdayISO: string, now: Date): boolean {
  const sessionStart = getSessionStartUTC(tuesdayISO);
  return now < sessionStart;
}

/**
 * Returns the next 6 Tuesdays whose 7 PM ET session has not yet started,
 * starting from the week containing `now`.
 */
export function getEligibleWeeks(now: Date): WeekOption[] {
  const results: WeekOption[] = [];

  // Find the most recent (or current) Tuesday in UTC
  // Day-of-week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const dayOfWeek = todayUTC.getUTCDay(); // 0-6
  const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
  let candidateTue = addDaysUTC(todayUTC, -daysToSubtract);

  // Walk forward week by week, collecting eligible ones
  while (results.length < 6) {
    const tuesdayISO = `${candidateTue.getUTCFullYear()}-${pad(candidateTue.getUTCMonth() + 1)}-${pad(candidateTue.getUTCDate())}`;
    if (isWeekEligible(tuesdayISO, now)) {
      const thursdayISO = tuesdayToThursday(tuesdayISO);
      results.push({
        tuesdayISO,
        thursdayISO,
        label: formatWeekLabel(tuesdayISO),
        tueFull: formatTueFull(tuesdayISO),
        thuFull: formatThuFull(thursdayISO),
      });
    }
    candidateTue = addDaysUTC(candidateTue, 7);
  }

  return results;
}

/**
 * Builds the human-readable weeks label for the API response and Sheets row.
 * Example: "Tuesdays & Thursdays - Weeks of Jul 21, Jul 28 - 7-8:30 PM ET"
 * Uses hyphens (-), never en-dashes.
 */
export function buildWeeksLabel(tuesdayISOs: string[]): string {
  const weekList = tuesdayISOs
    .map((iso) => formatMonthDay(iso))
    .join(", ");
  return `Tuesdays & Thursdays - Weeks of ${weekList} - 7-8:30 PM ET`;
}

/**
 * Builds the date-span string for the Sheets row.
 * Example: "Tue Jul 21 - Thu Aug 20"
 * Uses hyphens (-), never en-dashes.
 */
export function buildWeekDatesSpan(tuesdayISOs: string[]): string {
  if (!tuesdayISOs.length) return "";
  const sorted = [...tuesdayISOs].sort();
  const firstTue = sorted[0];
  const lastThu = tuesdayToThursday(sorted[sorted.length - 1]);

  const [fy, fm, fd] = firstTue.split("-").map(Number);
  const [ly, lm, ld] = lastThu.split("-").map(Number);

  const firstDate = new Date(Date.UTC(fy, fm - 1, fd, 12));
  const lastDate = new Date(Date.UTC(ly, lm - 1, ld, 12));

  const fmtShort = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(d);

  return `Tue ${fmtShort(firstDate)} - Thu ${fmtShort(lastDate)}`;
}
