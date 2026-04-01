"use client";

import { useRef, useEffect } from "react";

type PlayOnceVideoProps = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Video that autoplays with sound on load, plays through once,
 * then stops. Shows native controls so the user can replay.
 * Starts muted only if autoplay with sound is blocked by the browser.
 */
export default function PlayOnceVideo({ src, className, style }: PlayOnceVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const handleEnded = () => {
      video.pause();
    };

    video.addEventListener("ended", handleEnded);

    // Try autoplay with sound first
    video.muted = false;
    video.play().catch(() => {
      // Browser blocked unmuted autoplay — fall back to muted
      video.muted = true;
      video.play().catch(() => {
        // Autoplay fully blocked — user can use controls
      });
    });

    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      playsInline
      controls
      className={className}
      style={style}
    />
  );
}
