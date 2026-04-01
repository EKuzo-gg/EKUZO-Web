"use client";

import { useEffect, useRef, useState } from "react";

type CardData = {
  title: string;
  body: string;
  icon: string;
};

type AutoScrollCardsProps = {
  cards: CardData[];
  /** Card background color (default: white) */
  cardBg?: string;
  /** Speed in pixels per second (default: 30) */
  speed?: number;
};

/**
 * Horizontal auto-scrolling card strip with chopped corners and grayscale icons.
 * Duplicates cards to create a seamless infinite loop.
 * Pauses on hover. Uses requestAnimationFrame for smooth scrolling.
 */
export default function AutoScrollCards({
  cards,
  cardBg = "white",
  speed = 30,
}: AutoScrollCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Check if we're on mobile (no auto-scroll on touch devices)
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isPaused) {
        offsetRef.current += (speed * delta) / 1000;

        // Reset when first set of cards has fully scrolled out
        const halfWidth = el.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth;
        }

        el.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, speed]);

  const renderCard = (card: CardData, key: string) => (
    <div
      key={key}
      className="shrink-0 flex flex-col"
      style={{
        padding: "clamp(1.5rem, 3vw, 40px)",
        background: cardBg,
        clipPath:
          "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)",
      }}
    >
      {/* Icon — no circle bg, 54x54, grayscale */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.icon}
        alt=""
        className="mb-5"
        style={{
          width: "54px",
          height: "54px",
          filter: "grayscale(100%) opacity(0.5)",
        }}
        aria-hidden="true"
      />
      <h5
        className="font-body font-bold leading-[1.2] text-black mb-3"
        style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
      >
        {card.title}
      </h5>
      <p
        className="font-body leading-[1.357] text-black/70"
        style={{ fontSize: "clamp(1rem, 2vw, 28px)" }}
      >
        {card.body}
      </p>
    </div>
  );

  return (
    <div
      className="overflow-hidden lg:overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile: stacked vertically */}
      <div className="flex flex-col gap-6 lg:hidden">
        {cards.map((card, i) => renderCard(card, `mobile-${i}`))}
      </div>

      {/* Desktop: auto-scrolling infinite loop */}
      <div
        ref={scrollRef}
        className="hidden lg:flex flex-row gap-6 will-change-transform [&>div]:min-w-[clamp(260px,28vw,380px)] [&>div]:max-w-[380px]"
        style={{ width: "max-content" }}
      >
        {cards.map((card, i) => renderCard(card, `a-${i}`))}
        {/* Duplicate for seamless loop */}
        {cards.map((card, i) => renderCard(card, `b-${i}`))}
      </div>
    </div>
  );
}
