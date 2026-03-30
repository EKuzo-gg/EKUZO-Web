"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero phoenix bird with a subtle parallax scroll effect.
 * Centered in the viewport, moves upward slower than the page scroll, creating depth.
 */
export default function ParallaxBird() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.3);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute z-10 pointer-events-none"
      style={{
        left: "50%",
        top: "50vh",
        width: "332px",
        height: "300px",
        transform: `translate(-50%, calc(-50% - ${offset}px))`,
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      <Image
        src="/images/home-hero-bird.png"
        alt=""
        fill
        className="object-contain"
        sizes="332px"
      />
    </div>
  );
}
