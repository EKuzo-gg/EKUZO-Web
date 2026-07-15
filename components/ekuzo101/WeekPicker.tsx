"use client";

import { getEligibleWeeks, type WeekOption } from "@/lib/ekuzo101-weeks";

type Props = {
  selected: string[];   // ISO Tuesday dates
  onChange: (weeks: string[]) => void;
  now?: Date;           // testing override; defaults to new Date()
};

export default function WeekPicker({ selected, onChange, now }: Props) {
  const weeks: WeekOption[] = getEligibleWeeks(now ?? new Date());

  function toggle(tuesdayISO: string) {
    if (selected.includes(tuesdayISO)) {
      onChange(selected.filter((s) => s !== tuesdayISO));
    } else {
      onChange([...selected, tuesdayISO]);
    }
  }

  const count = selected.length;
  const minimum = 4;
  const remaining = minimum - count;

  return (
    <div className="flex flex-col gap-4">
      {/* Tile grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {weeks.map((week) => {
          const isSelected = selected.includes(week.tuesdayISO);
          return (
            <button
              key={week.tuesdayISO}
              type="button"
              onClick={() => toggle(week.tuesdayISO)}
              className={[
                "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
                isSelected
                  ? "border-red bg-red text-white"
                  : "border-gray-200 bg-gray-100 text-gray-900 hover:border-red hover:bg-red/5",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              {/* Week label — display font */}
              <span
                className={[
                  "font-display text-base font-bold uppercase leading-tight",
                  isSelected ? "text-white" : "text-gray-900",
                ].join(" ")}
                style={{ letterSpacing: "0.02em" }}
              >
                {week.label}
              </span>

              {/* Session dates — body font */}
              <span
                className={[
                  "font-body text-xs leading-snug",
                  isSelected ? "text-white/90" : "text-gray-500",
                ].join(" ")}
              >
                {week.tueFull}
              </span>
              <span
                className={[
                  "font-body text-xs leading-snug",
                  isSelected ? "text-white/90" : "text-gray-500",
                ].join(" ")}
              >
                {week.thuFull}
              </span>
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <p className="font-body text-sm text-gray-600">
        {count === 0 ? (
          <>Select at least <strong>{minimum}</strong> weeks to continue.</>
        ) : remaining > 0 ? (
          <>
            Select at least <strong>{remaining}</strong> more week
            {remaining !== 1 ? "s" : ""} to continue.
          </>
        ) : (
          <>
            <strong>{count}</strong> week{count !== 1 ? "s" : ""} selected.
          </>
        )}
      </p>
    </div>
  );
}
