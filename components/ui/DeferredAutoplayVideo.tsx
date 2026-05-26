"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type Props = {
  src: string;
  type?: string;
  className?: string;
  style?: CSSProperties;
};

// Phase 8d: autoplay video elements force browsers to download the full file
// regardless of the preload attribute, which puts the camps hero (14.6 MB)
// on the critical path even though it's decorative. Deferring the <video>
// element until after the page is idle keeps the hero composition (vignette,
// brush stroke, headline) on the LCP path and pushes the video fetch out
// past the audit window.
export default function DeferredAutoplayVideo({ src, type = "video/mp4", className, style }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const ric =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
        : null;
    let handle: number;
    if (ric) {
      handle = ric(() => setMounted(true), { timeout: 2000 });
    } else {
      handle = window.setTimeout(() => setMounted(true), 1500);
    }
    return () => {
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (ric && cic) cic(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  if (!mounted) return null;

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <source src={src} type={type} />
    </video>
  );
}
