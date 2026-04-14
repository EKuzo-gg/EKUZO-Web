"use client";

import { useEffect, useRef, useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default function HomeHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.50);
  const [watermarkY, setWatermarkY] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 0 = section top at bottom of viewport, 1 = section top scrolled to top
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / viewportHeight));

        // Opacity: dark → light (fades out as cards scroll over)
        setWatermarkOpacity(0.50 - progress * 0.38);

        // Parallax: LEARN + PLAY scrolls slower (lags behind as page scrolls up)
        // Starts at 0 and moves down slightly, so cards catch up and overlap
        const parallaxAmount = progress * 60;
        setWatermarkY(parallaxAmount);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-black relative overflow-visible z-10"
      style={{
        paddingTop: "100px",
        paddingBottom: "100px",
        paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
        paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
      }}
    >
      <div className="relative w-full flex flex-col items-center" style={{ zIndex: 2 }}>
        {/* Header block — centered */}
        <div className="flex flex-col items-center text-center gap-4 max-w-[800px]">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2
            className="font-body font-bold text-white leading-[1]"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            2 ways to play and learn
          </h2>
          <p
            className="font-body text-white/60 leading-[1.417]"
            style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
          >
            Students can join EKUZO from home or through school. Both formats build teamwork, coaching, and progress.
          </p>
        </div>

        {/* LEARN + PLAY watermark — in flow, parallax scrolls slower */}
        <div
          ref={watermarkRef}
          className="pointer-events-none select-none flex justify-center w-full"
          style={{
            marginTop: "-8px",
            transform: `translateY(${watermarkY}px)`,
            willChange: "transform",
          }}
          aria-hidden="true"
        >
          <span
            className="font-display uppercase text-white whitespace-nowrap text-center leading-none"
            style={{
              fontSize: "clamp(4rem, 20vw, 20rem)",
              opacity: watermarkOpacity,
            }}
          >
            LEARN + PLAY
          </span>
        </div>

        {/* Cards + button — marginTop controls initial overlap with LEARN + PLAY */}
        <div className="flex flex-col items-center gap-9 w-full" style={{ marginTop: "-40px" }}>
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-[1022px]">
            <div
              className="bg-white p-8 md:p-10 flex flex-col gap-[60px] md:gap-[80px] min-h-[280px] md:min-h-[480px]"
              style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
            >
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                SCHOOL
              </p>
              <p
                className="font-body text-black leading-[1.417] mb-[15px] md:mb-[20px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online.
              </p>
            </div>

            <div
              className="bg-white p-8 md:p-10 flex flex-col gap-[60px] md:gap-[80px] min-h-[280px] md:min-h-[480px]"
              style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
            >
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                HOME
              </p>
              <p
                className="font-body text-black leading-[1.417] mb-[15px] md:mb-[20px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                Students join individually from home in a fully online format (during or after school).
              </p>
            </div>
          </div>

          {/* See programs CTA — red filled */}
          <Button variant="red-filled" href="/programs">
            See programs
          </Button>
        </div>
      </div>

      {/* Torn paper: how it works (black) → testimonials (white) — black paper at bottom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/new%20torn%20paper/torn-paper-black-bottom-1@2x.png"
        alt=""
        className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
        style={{ transform: "translateY(calc(100% - 2px))" }}
        aria-hidden="true"
      />
    </section>
  );
}
