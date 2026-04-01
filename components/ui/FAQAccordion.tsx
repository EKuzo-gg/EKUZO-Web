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
    <ul className="w-full flex flex-col">
      {items.map((item, i) => (
        <li key={i}>
          <button
            className="w-full flex items-start gap-5 lg:gap-[26px] text-left group cursor-pointer"
            style={{
              paddingTop: "clamp(1.25rem, 2.5vw, 40px)",
              paddingBottom: "clamp(1.25rem, 2.5vw, 40px)",
            }}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {/* Camada icon */}
            <span
              className={`shrink-0 size-8 lg:size-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                open === i ? "bg-red rotate-180" : ""
              }`}
              style={{
                backgroundColor: open === i ? undefined : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"),
              }}
            >
              <svg
                className="w-7 h-7 lg:w-8 lg:h-8"
                viewBox="0 0 72 72"
                fill="none"
                aria-hidden="true"
              >
                <path d="M13.0491 26.8779L34.956 31.2054L58.9507 16.5L35.1343 55.5L13.0491 26.8779Z" fill={open === i ? "white" : (isDark ? "white" : "black")} />
              </svg>
            </span>

            <span
              className={`flex-1 font-body font-bold leading-[1.357] ${
                isDark ? "text-white" : "text-black"
              }`}
              style={{ fontSize: "clamp(1.125rem, 2vw, 24px)" }}
            >
              {item.question}
            </span>
          </button>

          {/* Answer */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              open === i ? "max-h-[600px] pb-6" : "max-h-0"
            }`}
          >
            <p
              className={`pl-[52px] lg:pl-[66px] leading-relaxed max-w-[600px] ${
                isDark ? "text-white/70" : "text-black/70"
              }`}
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              {item.answer}
            </p>
          </div>

          {/* Separator line */}
          <div
            className="w-full h-[1px]"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
            }}
          />
        </li>
      ))}
    </ul>
  );
}
