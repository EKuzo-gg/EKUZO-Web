"use client";

// Shared "What happens after you click pay" three-step list. The
// structure (h3 + ordered list of three small cards, each with a red
// numbered badge + title + description) is identical across camps,
// e100, and teams; only the descriptions differ. Each product passes
// its own step copy via the `steps` prop.

export type PostPaymentStep = {
  title: string;
  desc: string;
};

export default function PostPaymentSteps({
  steps,
  className = "mb-8",
}: {
  steps: PostPaymentStep[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3
        className="font-body font-bold text-[#0a0a0a] mb-4"
        style={{ fontSize: "16px", lineHeight: "24px" }}
      >
        What happens after you click pay
      </h3>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <li
            key={i}
            className="bg-[#fafafa] border border-[#e5e7eb] rounded-sm px-4 py-4 flex gap-3 items-start"
          >
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-red text-white font-body font-bold flex items-center justify-center text-sm"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-body font-bold text-[#0a0a0a] text-sm leading-tight">
                {s.title}
              </span>
              <span className="font-body text-[#6b7280] text-xs leading-snug">
                {s.desc}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
