"use client";

import { useRef, useEffect, useState } from "react";

/**
 * Giant EKUZO wordmark that scales to fill exactly 100vw.
 * Left edge of "E" flush with left viewport edge,
 * right edge of "O" flush with right viewport edge.
 *
 * Approach: render text offscreen at a known font-size, wait for fonts to load,
 * measure actual rendered width, then compute the exact font-size that makes
 * text width === window.innerWidth.
 */
export default function EkuzoWordmark() {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(0);

  useEffect(() => {
    async function measure() {
      // Wait for custom fonts (Tungsten Narrow) to finish loading
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const text = textRef.current;
      if (!text) return;

      const viewportWidth = window.innerWidth;

      // Measure text at a reference size
      const refSize = 200;
      text.style.fontSize = `${refSize}px`;

      // Force layout so we get an accurate measurement
      const textWidth = text.getBoundingClientRect().width;

      if (textWidth > 0) {
        // Calculate the font-size that makes text width === viewport width
        const exact = (viewportWidth / textWidth) * refSize;
        setFontSize(exact);
      }
    }

    measure();

    function onResize() {
      measure();
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="select-none pointer-events-none mt-16"
      style={{
        /* Break out of footer padding to span full viewport */
        marginLeft: "calc(-1 * clamp(1.5rem, 7.2vw, 104px))",
        marginRight: "calc(-1 * clamp(1.5rem, 7.2vw, 104px))",
        width: "100vw",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <span
        ref={textRef}
        className="font-display text-black whitespace-nowrap block uppercase"
        style={{
          fontSize: fontSize > 0 ? `${fontSize}px` : undefined,
          lineHeight: 0.82,
          /* Hide until measured so there's no flash of wrong size */
          opacity: fontSize > 0 ? 1 : 0,
        }}
      >
        EKUZO
      </span>
    </div>
  );
}
