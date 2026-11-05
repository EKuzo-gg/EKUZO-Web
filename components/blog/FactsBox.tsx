import type { ReactNode } from "react";

/**
 * FactsBox: a short reference box inside a blog post (rating, settings, rules).
 * Div/span/ul markup only so the .blog-content prose rules (p, blockquote)
 * don't cascade into it. Added 2026-11-05 (Fortnite and League updates).
 * Aaron: additive component, restyle freely.
 */
export type FactsBoxItem = { label: string; content: ReactNode };

export default function FactsBox({
  title,
  items,
}: {
  title: string;
  items: FactsBoxItem[];
}) {
  return (
    <div
      role="note"
      aria-label={title}
      className="not-prose my-10 bg-[#f0edea] border-t-[3px] border-black px-6 py-6 md:px-8 md:py-7"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
      }}
    >
      <span className="block font-body font-bold uppercase tracking-[0.15em] text-[13px] text-black mb-4">
        {title}
      </span>
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="m-0 p-0 font-body text-[16px] leading-[1.55] text-black">
            <span className="font-bold">{item.label}:</span> {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
