"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import TornPaperDivider from "@/components/ui/TornPaperDivider";

export default function TwoWaysSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.08);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = cards.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Progress based on when the cards grid enters the viewport
        // 0 = cards just entering bottom of viewport, 1 = cards fully in view
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / viewportHeight));

        // Start white (0.08 = barely visible), darken as cards scroll up over the text
        const opacity = 0.08 + progress * 0.32;
        setWatermarkOpacity(opacity);
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
    <section ref={sectionRef} className="bg-black relative overflow-visible">
      <TornPaperDivider color="black" variant="top" style={2} />

      {/* Watermark — starts at 40% opacity, gets darker as cards scroll over */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ top: "-4%" }}
        aria-hidden="true"
      >
        <span
          className="font-display uppercase text-white text-center leading-none"
          style={{ fontSize: "clamp(4rem, 14vw, 16rem)", opacity: watermarkOpacity }}
        >
          LEARN + PLAY
        </span>
      </div>

      <div
        className="max-w-[1232px] mx-auto relative z-10"
        style={{
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          paddingTop: "clamp(100px, 14vw, 188px)",
          paddingBottom: "clamp(100px, 14vw, 188px)",
        }}
      >
        {/* Header — centered */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 max-w-[800px] mx-auto">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h4
            className="font-body font-bold text-white leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Two ways to participate
          </h4>
          <p
            className="font-body text-white/70 leading-[1.357] mt-4"
            style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
          >
            Students join the same EKUZO experience, either through their school or from home.
          </p>
        </div>

        {/* Two cards — white bg with angled clip-path corners, matching homepage SCHOOL/HOME pattern */}
        <div ref={cardsRef} className="grid lg:grid-cols-2 gap-8">
          <div
            className="bg-white p-8 lg:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-[480px]"
            style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
          >
            <div className="flex flex-col gap-6">
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                SCHOOL
              </p>
              <p
                className="font-body text-black leading-[1.417] max-w-[380px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                For schools that want to bring EKUZO on&nbsp;campus.
              </p>
            </div>
            <div className="mt-8">
              <Button variant="red-outlined" href="/schools">
                For Schools
              </Button>
            </div>
          </div>

          <div
            className="bg-white p-8 lg:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-[480px]"
            style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
          >
            <div className="flex flex-col gap-6">
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                HOME
              </p>
              <p
                className="font-body text-black leading-[1.417] max-w-[380px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                Students join individually from home in a fully online&nbsp;format.
              </p>
            </div>
            <div className="mt-8">
              <Button variant="red-outlined" href="/parents">
                For Families
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
