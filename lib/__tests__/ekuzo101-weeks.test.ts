/**
 * Unit tests for lib/ekuzo101-weeks.ts
 * Uses Node.js built-in test runner (node --test).
 * Run with: node --experimental-strip-types lib/__tests__/ekuzo101-weeks.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isWeekEligible,
  getEligibleWeeks,
  buildWeeksLabel,
  buildWeekDatesSpan,
} from "../ekuzo101-weeks.js";

// ─── ET offset helpers ────────────────────────────────────────────────────────

/** Returns a Date representing the given wall-clock time in America/New_York */
function etTime(
  year: number,
  month: number, // 1-indexed
  day: number,
  hour: number,
  minute = 0
): Date {
  // We derive the UTC equivalent by formatting a UTC candidate and adjusting.
  // Start with a guess (EDT = UTC-4)
  let guess = new Date(
    Date.UTC(year, month - 1, day, hour + 4, minute, 0)
  );
  // Check what ET hour this UTC instant represents
  const etHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(guess),
    10
  );
  // Adjust if the offset was wrong (e.g. EST = UTC-5)
  if (etHour !== hour) {
    guess = new Date(guess.getTime() + (hour - etHour) * 3_600_000);
  }
  return guess;
}

// ─── isWeekEligible ───────────────────────────────────────────────────────────

describe("isWeekEligible", () => {
  it("Jul 21 is eligible at 6:59 PM ET on Jul 21", () => {
    const now = etTime(2026, 7, 21, 18, 59);
    assert.equal(isWeekEligible("2026-07-21", now), true);
  });

  it("Jul 21 is ineligible at 7:00 PM ET on Jul 21", () => {
    const now = etTime(2026, 7, 21, 19, 0);
    assert.equal(isWeekEligible("2026-07-21", now), false);
  });

  it("Jul 21 is ineligible at 7:01 PM ET on Jul 21", () => {
    const now = etTime(2026, 7, 21, 19, 1);
    assert.equal(isWeekEligible("2026-07-21", now), false);
  });

  it("a future Tuesday is eligible the day before", () => {
    const now = etTime(2026, 7, 20, 23, 59); // Monday 11:59 PM ET
    assert.equal(isWeekEligible("2026-07-21", now), true);
  });
});

// ─── getEligibleWeeks ─────────────────────────────────────────────────────────

describe("getEligibleWeeks", () => {
  it("returns exactly 6 items", () => {
    const now = etTime(2026, 7, 15, 10, 0); // mid-morning Wednesday
    const weeks = getEligibleWeeks(now);
    assert.equal(weeks.length, 6);
  });

  it("all returned days are Tuesdays (UTC day-of-week === 2)", () => {
    const now = etTime(2026, 7, 15, 10, 0);
    const weeks = getEligibleWeeks(now);
    for (const w of weeks) {
      const [year, month, day] = w.tuesdayISO.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      assert.equal(
        d.getUTCDay(),
        2,
        `Expected Tuesday, got day ${d.getUTCDay()} for ${w.tuesdayISO}`
      );
    }
  });

  it("thursdays are always 2 days after their tuesday", () => {
    const now = etTime(2026, 7, 15, 10, 0);
    const weeks = getEligibleWeeks(now);
    for (const w of weeks) {
      const [ty, tm, td] = w.tuesdayISO.split("-").map(Number);
      const [hy, hm, hd] = w.thursdayISO.split("-").map(Number);
      const tue = new Date(Date.UTC(ty, tm - 1, td));
      const thu = new Date(Date.UTC(hy, hm - 1, hd));
      assert.equal(
        thu.getTime() - tue.getTime(),
        2 * 24 * 3_600_000,
        `Thursday should be 2 days after Tuesday for ${w.tuesdayISO}`
      );
    }
  });

  it("skips a week that starts at exactly 7 PM ET", () => {
    // Simulate calling exactly at 7 PM ET on a Tuesday
    const now = etTime(2026, 7, 21, 19, 0); // Jul 21 session just started
    const weeks = getEligibleWeeks(now);
    assert.equal(weeks.length, 6);
    // Jul 21 must not appear
    const hasJul21 = weeks.some((w) => w.tuesdayISO === "2026-07-21");
    assert.equal(hasJul21, false);
  });

  it("DST crossing Nov 1 2026 (EST transition) — should not crash", () => {
    // Nov 1 2026 is when US clocks fall back from EDT to EST
    const now = etTime(2026, 10, 31, 10, 0); // Oct 31, morning
    let weeks: ReturnType<typeof getEligibleWeeks> | undefined;
    assert.doesNotThrow(() => {
      weeks = getEligibleWeeks(now);
    });
    assert.equal(weeks?.length, 6);
    // All should still be Tuesdays
    for (const w of weeks ?? []) {
      const [year, month, day] = w.tuesdayISO.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      assert.equal(d.getUTCDay(), 2);
    }
  });
});

// ─── buildWeeksLabel ──────────────────────────────────────────────────────────

describe("buildWeeksLabel", () => {
  it("contains no en-dashes or em-dashes", () => {
    const label = buildWeeksLabel(["2026-07-21", "2026-07-28", "2026-08-11", "2026-08-18"]);
    assert.ok(!label.includes("–"), "Should not contain en-dash");
    assert.ok(!label.includes("—"), "Should not contain em-dash");
  });

  it("includes all week month-day values", () => {
    const label = buildWeeksLabel(["2026-07-21", "2026-07-28"]);
    assert.ok(label.includes("Jul 21"), `Label missing Jul 21: ${label}`);
    assert.ok(label.includes("Jul 28"), `Label missing Jul 28: ${label}`);
  });

  it("includes the time string", () => {
    const label = buildWeeksLabel(["2026-07-21"]);
    assert.ok(label.includes("7-8:30 PM ET"), `Label missing time: ${label}`);
  });
});

// ─── buildWeekDatesSpan ───────────────────────────────────────────────────────

describe("buildWeekDatesSpan", () => {
  it("contains no en-dashes or em-dashes", () => {
    const span = buildWeekDatesSpan(["2026-07-21", "2026-08-11"]);
    assert.ok(!span.includes("–"), "Should not contain en-dash");
    assert.ok(!span.includes("—"), "Should not contain em-dash");
  });

  it("starts with the first Tuesday and ends with the last Thursday", () => {
    const span = buildWeekDatesSpan(["2026-07-21", "2026-07-28"]);
    // First Tue: Jul 21, last Thu: Jul 30
    assert.ok(span.startsWith("Tue"), `Should start with Tue: ${span}`);
    assert.ok(span.includes("Jul 21"), `Should include Jul 21: ${span}`);
    assert.ok(span.includes("Jul 30"), `Should include Jul 30 (last Thu): ${span}`);
  });

  it("handles a single week", () => {
    const span = buildWeekDatesSpan(["2026-07-21"]);
    assert.ok(span.includes("Jul 21"), span);
    assert.ok(span.includes("Jul 23"), span); // Thursday
  });
});
