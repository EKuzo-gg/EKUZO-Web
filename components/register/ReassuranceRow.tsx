"use client";

// Shared three-trust-signal row that sits directly under the
// "Continue to payment" button. Lifted verbatim from the three register
// pages, where the three badges (refund / code of conduct / Stripe)
// and the ToS link below were identical.

const ITEMS = [
  {
    label: "Full refund 14+ days out",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M7 4.5V7L8.5 8.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Code of Conduct enforced",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M7 1.5L11.5 3.5V7C11.5 9.5 9.5 11.5 7 12C4.5 11.5 2.5 9.5 2.5 7V3.5L7 1.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M5 7L6.5 8.5L9 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Secured by Stripe",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="2" y="4.5" width="10" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M4 4.5V3.5A2.5 2.5 0 0 1 9.5 3.5V4.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
];

export default function ReassuranceRow() {
  return (
    <>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {ITEMS.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 text-[#6b7280]"
          >
            {item.icon}
            <span className="font-body text-xs leading-tight">{item.label}</span>
          </span>
        ))}
      </div>

      <p
        className="font-body text-black/40 text-center mt-3"
        style={{ fontSize: "clamp(0.7rem, 1vw, 0.75rem)" }}
      >
        By registering you agree to our{" "}
        <a href="/terms-of-service" className="underline hover:text-black/60">
          Terms of Service
        </a>
        .
      </p>
    </>
  );
}
