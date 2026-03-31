"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  { slug: "becky-parent", name: "Becky", role: "Parent" },
  { slug: "brad-parent-girl-gamer", name: "Brad", role: "Parent" },
  { slug: "debbie-potter-monroe", name: "Debbie Potter", role: "Director of Admissions, Robert F. Monroe Day School" },
  { slug: "laura-hogan-mirus-academy", name: "Laura Hogan", role: "Administrator, Mirus Academy" },
  { slug: "rajitha-parent", name: "Rajitha", role: "Parent" },
  { slug: "student-i-learned", name: "Student", role: "EKUZO Student" },
  { slug: "student-man-of-my-word", name: "Student", role: "EKUZO Student" },
  { slug: "student-thank-you-ekuzo", name: "Student", role: "EKUZO Student" },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(3);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    function update() {
      const visible = window.innerWidth < 768 ? 1 : 3;
      setCardsVisible(visible);
      setIndex((i) => Math.min(i, testimonials.length - visible));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = testimonials.length - cardsVisible;
  const cardWidth = 100 / cardsVisible;
  const isMobile = cardsVisible === 1;

  /* ── Touch / swipe handlers ── */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function handleTouchEnd() {
    const SWIPE_THRESHOLD = 50;
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) {
        // swipe left → next
        setIndex((i) => Math.min(maxIndex, i + 1));
      } else {
        // swipe right → prev
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  function handleCardClick(i: number) {
    const video = videoRefs.current[i];
    if (!video) return;

    // Pause all other videos
    videoRefs.current.forEach((v, j) => {
      if (j !== i && v && !v.paused) {
        v.pause();
        v.currentTime = 0;
      }
    });

    if (video.paused) {
      video.play();
      setPlayingIndex(i);
    } else {
      video.pause();
      setPlayingIndex(null);
    }
  }

  function handleVideoEnded(i: number) {
    setPlayingIndex((p) => (p === i ? null : p));
  }

  return (
    <div className="w-full">
      {/* Track — on mobile, center the single card with max-width; swipe enabled */}
      <div
        className={`overflow-hidden ${isMobile ? "flex justify-center" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex transition-transform duration-500 ease-in-out ${isMobile ? "max-w-[340px]" : ""}`}
          style={{ transform: `translateX(${-index * cardWidth}%)` }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.slug}
              className="shrink-0 px-2 md:px-3"
              style={{ width: `${cardWidth}%` }}
            >
              {/* Video card */}
              <div
                className="relative aspect-[9/16] bg-black rounded-sm overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(i)}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={`/testimonial-videos/${t.slug}.mp4`}
                  poster={`/testimonial-videos/${t.slug}-poster.jpg`}
                  className="w-full h-full object-cover"
                  playsInline
                  preload="none"
                  onEnded={() => handleVideoEnded(i)}
                />

                {/* Play / paused overlay */}
                {playingIndex !== i && (
                  <div className="absolute inset-0 flex items-end justify-start p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none">
                    <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow">
                      <span className="ml-0.5 text-base">▶</span>
                    </span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous"
          className="flex size-12 items-center justify-center rounded-full border border-black/25 text-black disabled:opacity-25 hover:bg-black hover:text-white hover:border-black transition-colors"
        >
          ←
        </button>

        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`size-2 rounded-full transition-colors ${
                i === index ? "bg-black" : "bg-black/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
          disabled={index === maxIndex}
          aria-label="Next"
          className="flex size-12 items-center justify-center rounded-full border border-black/25 text-black disabled:opacity-25 hover:bg-black hover:text-white hover:border-black transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
