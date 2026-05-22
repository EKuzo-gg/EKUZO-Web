"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

// ── Mission section carousel ────────────────────────────────────────────────
// 5 slides: 1 video (slide 0) + 4 photos. Used on /programs/ekuzo-camps/v2.
// Dots below jump to slide. Keyboard: ← / → cycle slides. Aspect 5:3 to
// match Figma 900×540 (node 1057:22).
//
// AARON: when the camp video is ready, swap the placeholder play-button
// panel for a real <video> tag (or YouTube embed) inside slide 0.

type VideoSlide = { type: "video"; src?: string; poster?: string };
type PhotoSlide = { type: "photo"; src: string; alt: string };
type Slide = VideoSlide | PhotoSlide;

const SLIDES: Slide[] = [
  { type: "video" /* AARON: add src + poster when video is ready */ },
  { type: "photo", src: "/images/community-group.png", alt: "Squad celebrating after a match" },
  { type: "photo", src: "/images/community-kid-back.png", alt: "Camper focused at their station" },
  { type: "photo", src: "/images/community-kid-crossed.png", alt: "Camper between rounds" },
  { type: "photo", src: "/images/community-kid-plaid.png", alt: "Camper representing their squad" },
];

export default function MissionCarousel() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <div
      className="mx-auto"
      style={{ maxWidth: "900px" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="EKUZO camp experience"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Slide viewport */}
      <div
        className="relative w-full overflow-hidden bg-[#d9d9d9]"
        style={{ aspectRatio: "5 / 3" }}
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={{
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
            >
              {slide.type === "video" ? (
                <div className="relative w-full h-full bg-[#d9d9d9] flex items-center justify-center">
                  <button
                    type="button"
                    aria-label="Play video"
                    className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 hover:bg-white transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-black ml-1"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  className="object-cover"
                  priority={i <= 1}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {SLIDES.map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              className="block rounded-full transition-all duration-200"
              style={{
                width: isActive ? "12px" : "8px",
                height: isActive ? "12px" : "8px",
                backgroundColor: isActive ? "#000" : "rgba(0,0,0,0.25)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
