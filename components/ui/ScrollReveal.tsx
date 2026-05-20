"use client";

import { useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  /** Render delay in ms (cascades nicely when stacking reveals). */
  delay?: number;
  /** Pixel distance to slide up from. Default 24. */
  offset?: number;
  /** Pass-through className for the wrapper. */
  className?: string;
  /** Stretch wrapper to full width by default; pass "inline-block" if you don't want that. */
  as?: "div" | "span";
};

/**
 * Fade + slide-up when the element enters the viewport. One-shot — once
 * revealed, the listener disconnects. Respects `prefers-reduced-motion`
 * (instantly visible, no animation). Use sparingly on section headers
 * and hero blocks; over-applying makes the page feel chatty.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  offset = 24,
  className = "",
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window !== "undefined") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduce.matches) {
        setVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement> & React.RefObject<HTMLSpanElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${offset}px)`,
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
