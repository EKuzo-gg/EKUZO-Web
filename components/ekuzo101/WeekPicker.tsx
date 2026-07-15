"use client";

// EKUZO 101 week picker — availability-calendar treatment (Jamie's wireframe,
// 2026-07-15). Month-grouped calendars (side by side on desktop, stacked on
// mobile — spans 2-3 months depending on the rolling window). Each WEEK ROW
// is a selectable pill with a trailing checkbox; parents pick weeks, not
// days. Session days (Tue/Thu) carry orange dots. Orange accent (#FF6B1A)
// adopted from the e100 register calendar per Jamie. Times are local, not ET.

import { useMemo } from "react";
import { getEligibleWeeks, type WeekOption } from "@/lib/ekuzo101-weeks";

type Props = {
  selected: string[];   // ISO Tuesday dates
  onChange: (weeks: string[]) => void;
  now?: Date;           // testing override; defaults to new Date()
};

const MINIMUM = 4;

function toISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Sunday (00:00 local) of the week containing `d`. */
function sundayOf(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type WeekRow = {
  days: Date[];            // 7 local dates, Sun → Sat
  tuesdayISO: string;
  week: WeekOption | null; // null = ineligible (greyed, not selectable)
};

type MonthBlock = {
  label: string;           // "July 2026"
  monthIndex: number;
  year: number;
  rows: WeekRow[];         // rows whose Sunday falls in this month
};

export default function WeekPicker({ selected, onChange, now }: Props) {
  const { blocks, rangeLabel, firstEligible, lastEligible } = useMemo(() => {
    const current = now ?? new Date();
    const weeks = getEligibleWeeks(current);
    const byTuesday = new Map(weeks.map((w) => [w.tuesdayISO, w]));

    const [ly, lm, ld] = weeks[weeks.length - 1].tuesdayISO.split("-").map(Number);
    const lastSunday = sundayOf(new Date(ly, lm - 1, ld));

    const rows: WeekRow[] = [];
    for (
      let sun = sundayOf(current);
      sun <= lastSunday;
      sun = new Date(sun.getFullYear(), sun.getMonth(), sun.getDate() + 7)
    ) {
      const days = Array.from(
        { length: 7 },
        (_, i) => new Date(sun.getFullYear(), sun.getMonth(), sun.getDate() + i)
      );
      const tuesdayISO = toISO(days[2]);
      rows.push({ days, tuesdayISO, week: byTuesday.get(tuesdayISO) ?? null });
    }

    // Group rows into month blocks by the month of the row's Sunday.
    const blocks: MonthBlock[] = [];
    for (const row of rows) {
      const sun = row.days[0];
      const last = blocks[blocks.length - 1];
      if (!last || last.monthIndex !== sun.getMonth() || last.year !== sun.getFullYear()) {
        blocks.push({
          label: sun.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          monthIndex: sun.getMonth(),
          year: sun.getFullYear(),
          rows: [row],
        });
      } else {
        last.rows.push(row);
      }
    }

    const eligibleRows = rows.filter((r) => r.week);
    const firstEligible = eligibleRows[0].days[0];
    const lastEligible = eligibleRows[eligibleRows.length - 1].days[6];
    const rangeLabel = `${fmtShort(firstEligible)} - ${fmtShort(lastEligible)}, ${lastEligible.getFullYear()}`;

    return { blocks, rangeLabel, firstEligible, lastEligible };
  }, [now]);

  function toggle(tuesdayISO: string) {
    if (selected.includes(tuesdayISO)) {
      onChange(selected.filter((s) => s !== tuesdayISO));
    } else {
      onChange([...selected, tuesdayISO]);
    }
  }

  const count = selected.length;
  const met = count >= MINIMUM;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Range + counter banner ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FF6B1A]/10 border border-[#FF6B1A]/25 rounded-xl px-5 py-4">
        <div>
          <p className="font-body font-bold text-[#0a0a0a]" style={{ fontSize: "15px", lineHeight: "22px" }}>
            {rangeLabel}{" "}
            <span className="font-medium text-[#4b5563]">(Next 6 weeks)</span>
          </p>
          <p className="font-body text-[#4b5563]" style={{ fontSize: "13px", lineHeight: "20px" }}>
            Sessions are Tuesday &amp; Thursday · 7:00-8:30 PM local time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-body text-right" style={{ fontSize: "13px", lineHeight: "18px" }}>
            <span className="block font-bold text-[#0a0a0a]" style={{ fontSize: "18px" }}>
              {Math.min(count, MINIMUM)} of {MINIMUM}
            </span>
            <span className={met ? "text-[#FF6B1A] font-bold" : "text-[#4b5563]"}>
              required weeks selected{count > MINIMUM ? ` (+${count - MINIMUM} extra)` : ""}
            </span>
          </p>
          <span
            aria-hidden="true"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              met ? "bg-[#FF6B1A] text-white" : "bg-white border-2 border-[#e5e7eb] text-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* ── Month calendars ────────────────────────────────────────── */}
      <div className={`grid gap-4 ${blocks.length > 1 ? "md:grid-cols-2" : ""}`}>
        {blocks.map((block) => (
          <div
            key={block.label}
            className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#f0f0f2] px-4 py-4"
          >
            <p
              className="font-display uppercase text-[#0a0a0a] text-center mb-3"
              style={{ fontSize: "clamp(24px, 3vw, 30px)", lineHeight: "1" }}
            >
              {block.label}
            </p>

            {/* Day strip */}
            <div className="grid grid-cols-7 mb-1.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <span
                  key={d}
                  className={`text-center font-body pb-1 ${
                    d === "Tue" || d === "Thu" ? "font-bold text-[#0a0a0a]" : "font-medium text-[#9ca3af]"
                  }`}
                  style={{ fontSize: "11px", lineHeight: "1.5" }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Week pills */}
            <div className="flex flex-col gap-1.5">
              {block.rows.map((row) => {
                const isSelected = !!row.week && selected.includes(row.tuesdayISO);
                const inRange =
                  row.days[6] >= firstEligible && row.days[0] <= lastEligible;

                const dayCells = row.days.map((d, i) => {
                  const isSessionDay = i === 2 || i === 4; // Tue / Thu
                  const isSpill =
                    d.getMonth() !== block.monthIndex || d.getFullYear() !== block.year;
                  return (
                    <span key={i} className="flex flex-col items-center justify-center py-2 min-w-0">
                      <span
                        className={`font-body leading-none truncate ${
                          isSessionDay ? "font-bold" : "font-medium"
                        }`}
                        style={{ fontSize: isSpill ? "11px" : "13px" }}
                      >
                        {isSpill ? fmtShort(d) : d.getDate()}
                      </span>
                      <span
                        className={`mt-1 rounded-full ${isSessionDay ? "" : "invisible"} ${
                          row.week ? "bg-[#FF6B1A]" : "bg-[#d1d5db]"
                        }`}
                        style={{ width: "4px", height: "4px" }}
                      />
                    </span>
                  );
                });

                // Ineligible week (already started / outside window) — greyed.
                if (!row.week) {
                  return (
                    <div
                      key={row.tuesdayISO}
                      aria-disabled="true"
                      className={`grid grid-cols-7 rounded-lg border border-[#f0f0f2] bg-[#fafafa] text-[#d1d5db] ${
                        inRange ? "" : "opacity-70"
                      }`}
                    >
                      {dayCells}
                    </div>
                  );
                }

                return (
                  <button
                    key={row.tuesdayISO}
                    type="button"
                    onClick={() => toggle(row.tuesdayISO)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Selected" : "Select"} ${row.week.label} (${row.week.tueFull} + ${row.week.thuFull})`}
                    className={`grid grid-cols-7 rounded-lg border transition-all duration-150 cursor-pointer active:scale-[0.99] items-center ${
                      isSelected
                        ? "bg-[#FF6B1A]/15 border-[#FF6B1A]/50 text-[#0a0a0a]"
                        : "bg-white border-[#e5e7eb] text-[#0a0a0a] hover:bg-[#FF6B1A]/10 hover:border-[#FF6B1A]/30"
                    }`}
                  >
                    {dayCells}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <p className="font-body text-[#4b5563] flex items-center gap-2" style={{ fontSize: "13px" }}>
        <span className="inline-block rounded-full bg-[#FF6B1A]" style={{ width: "6px", height: "6px" }} />
        Session days: Tuesday &amp; Thursday · 7:00-8:30 PM local time
      </p>

      {/* ── Min-4 counter ──────────────────────────────────────────── */}
      <p className="font-body text-sm text-gray-600">
        {count === 0 ? (
          <>Click a week to select it. Sessions are the dotted days (Tue &amp; Thu).</>
        ) : count < MINIMUM ? (
          <>
            Select at least <strong>{MINIMUM - count}</strong> more week
            {MINIMUM - count !== 1 ? "s" : ""} to continue.
          </>
        ) : (
          <>
            <strong>{count}</strong> week{count !== 1 ? "s" : ""}{" "}selected. You&apos;re ready to continue.
          </>
        )}
      </p>
    </div>
  );
}
