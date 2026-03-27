"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
  theme?: "dark" | "light";
};

export default function FAQAccordion({ items, theme = "dark" }: FAQAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  const isDark = theme === "dark";

  return (
    <ul className="w-full flex flex-col gap-0">
      {items.map((item, i) => (
        <li
          key={i}
          className={`border-b last:border-b-0 ${
            isDark ? "border-white/20" : "border-black/10"
          }`}
        >
          <button
            className="w-full flex items-start gap-6 text-left group cursor-pointer"
            style={{ paddingTop: "clamp(1.25rem, 1.8vw, 32px)", paddingBottom: "clamp(1.25rem, 1.8vw, 32px)" }}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {/* Chevron */}
            <span
              className={`mt-1 shrink-0 size-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              } ${isDark ? "bg-white/60" : "bg-black/10"}`}
            >
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke={isDark ? "black" : "black"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span
              className={`flex-1 font-bold leading-[1.357] tracking-tight ${
                isDark ? "text-white" : "text-black"
              }`}
              style={{ fontSize: "clamp(1.25rem, 2.2vw, 28px)" }}
            >
              {item.question}
            </span>
          </button>

          {/* Answer */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              open === i ? "max-h-[600px]" : "max-h-0"
            }`}
            style={{ paddingBottom: open === i ? "clamp(1.25rem, 1.8vw, 32px)" : "0" }}
          >
            <p
              className={`pl-14 leading-relaxed ${
                isDark ? "text-white/70" : "text-black/70"
              }`}
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              {item.answer}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
