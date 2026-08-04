"use client";

import { useRef, useState } from "react";
import { trackVideoPlay } from "@/lib/analytics";

interface WhatWePlayVideoProps {
  src: string;
  /** Optional poster image shown before play (first-frame fallback if omitted) */
  poster?: string;
  /** Alt / aria label for accessibility */
  label?: string;
  /** Opt-in GA `video_play` tracking. Omit and nothing is sent, which keeps
   *  the ekuzo101 and ekuzo-camps usages unchanged. */
  trackingId?: string;
  /** GA `section_id` the player sits in, for cross-referencing section_view. */
  trackingSection?: string;
}

/**
 * Video player used in the "What Do We Play" section on the camps page.
 * - Does NOT autoplay
 * - Renders a big red play button overlay while paused
 * - Starts with sound ON when the user clicks play
 * - Shows native `<video controls>` once playing
 */
export default function WhatWePlayVideo({
  src,
  poster,
  label = "",
  trackingId,
  trackingSection,
}: WhatWePlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // onPlay re-fires on every resume; we only want the first play per mount.
  const playFiredRef = useRef(false);

  // Hangs off the DOM play event rather than the overlay button so plays
  // started from the native controls count too. Deliberately separate from
  // handlePlay() below, which owns the unmute + blocked-playback fallback.
  function handlePlayEvent() {
    setPlaying(true);
    if (!trackingId || playFiredRef.current) return;
    playFiredRef.current = true;
    trackVideoPlay({ video: trackingId, section: trackingSection });
  }

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
      className="relative overflow-hidden lg:sticky lg:top-8 lg:min-h-[600px] bg-black"
      style={{
        aspectRatio: "3/4",
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
        onPlay={handlePlayEvent}
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
