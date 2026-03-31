"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero phoenix bird with a subtle parallax scroll effect.
 * Positioned at centerY 85% of its parent (the hero section), matching the Framer spec.
 * On mobile, smaller size and adjusted position.
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
      className="absolute z-30 pointer-events-none w-[180px] h-[162px] md:w-[332px] md:h-[300px]"
      style={{
        left: "50%",
        bottom: "0",
        transform: `translate(-50%, calc(40% - 100px - ${offset}px))`,
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      <Image
        src="/images/home-hero-bird.png"
        alt=""
        fill
        className="object-contain"
        sizes="(max-width: 768px) 180px, 332px"
      />
    </div>
  );
}
