"use client";

import { useRef, useState } from "react";

interface WhatWePlayVideoProps {
  src: string;
  /** Optional poster image shown before play (first-frame fallback if omitted) */
  poster?: string;
  /** Alt / aria label for accessibility */
  label?: string;
}

/**
 * Video player used in the "What Do We Play" section on the camps page.
 * - Does NOT autoplay
 * - Renders a big red play button overlay while paused
 * - Starts with sound ON when the user clicks play
 * - Shows native `<video controls>` once playing
 */
export default function WhatWePlayVideo({ src, poster, label = "" }: WhatWePlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    // Ensure audio is on when user initiates playback
    v.muted = false;
    v.volume = 1;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // If the browser blocks unmuted playback for any reason, fall back
        // to muted playback so the user still sees the video.
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  }

  return (
    <div
      className="relative overflow-hidden sticky top-8 bg-black"
      style={{
        aspectRatio: "3/4",
        minHeight: "600px",
        clipPath:
          "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={playing}
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 w-full h-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* Red play button overlay — shown only while paused */}
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={label ? `Play ${label}` : "Play video"}
          className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer bg-black/20 hover:bg-black/30 transition-colors duration-150"
        >
          <span
            className="flex items-center justify-center rounded-full bg-red shadow-lg shadow-black/40 transition-all duration-150 group-hover:brightness-110 group-hover:scale-105 group-active:scale-95 group-active:brightness-90"
            style={{
              width: "clamp(72px, 10vw, 112px)",
              height: "clamp(72px, 10vw, 112px)",
            }}
          >
            <svg
              width="40"
              height="44"
              viewBox="0 0 28 32"
              fill="none"
              aria-hidden="true"
              style={{ marginLeft: "4px" }}
            >
              <path d="M28 16L0 32V0L28 16Z" fill="white" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
