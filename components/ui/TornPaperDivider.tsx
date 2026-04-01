/**
 * TornPaperDivider — reusable torn paper transition between sections.
 *
 * NEW API (PNG-based, preferred):
 *   <TornPaperDivider color="red" variant="top" style={1} />
 *   <TornPaperDivider color="grey" variant="bottom" style={2} />
 *
 * Place inside a section with `relative overflow-visible` (or overflow-clip).
 * "top" dividers sit above the section (overlapping the section above).
 * "bottom" dividers sit below the section (overlapping the section below).
 *
 * The image keeps a fixed minimum width (1440px) so the paper texture
 * doesn't shrink on mobile — it stays centered and crops at the edges.
 *
 * LEGACY API (SVG-based, for backward compat with existing pages):
 *   <TornPaperDivider color="black" />
 *   <TornPaperDivider color="white" flip />
 *
 * When `variant` is omitted, falls back to the old inline-SVG behavior.
 */

import { tornPaperPaths } from "./tornPaperPaths";

type TornPaperDividerColor = "red" | "black" | "white" | "grey" | "purple";

type TornPaperDividerProps = {
  color: TornPaperDividerColor;
  /** NEW: top/bottom placement using PNG assets. Omit for legacy SVG mode. */
  variant?: "top" | "bottom";
  /** PNG style variant: 1 or 2. Only used with variant prop. */
  style?: 1 | 2;
  /** LEGACY: flip the SVG vertically. Only used without variant prop. */
  flip?: boolean;
};

const fillMap: Record<TornPaperDividerColor, string> = {
  black: "#000000",
  red: "#F92524",
  white: "#ffffff",
  grey: "#EFEEED",
  purple: "#AE2CF2",
};

export default function TornPaperDivider({
  color,
  variant,
  style: styleNum = 1,
  flip = false,
}: TornPaperDividerProps) {
  /* ── NEW: PNG-based divider ──────────────────────────────── */
  if (variant) {
    const file = `/images/new%20torn%20paper/torn-paper-${color}-${variant}-${styleNum}%402x.png`;
    const isTop = variant === "top";

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file}
        alt=""
        className="absolute left-1/2 z-20 pointer-events-none select-none"
        style={{
          minWidth: "1440px",
          width: "100%",
          transform: isTop
            ? "translate(-50%, calc(-100% + 2px))"
            : "translate(-50%, calc(100% - 2px))",
          ...(isTop ? { top: 0 } : { bottom: 0 }),
        }}
        aria-hidden="true"
      />
    );
  }

  /* ── LEGACY: inline SVG divider ──────────────────────────── */
  return (
    <div
      className="relative w-full pointer-events-none select-none"
      style={{
        height: "clamp(50px, 6vw, 100px)",
        marginTop: "calc(-1 * clamp(25px, 3vw, 50px))",
        marginBottom: "calc(-1 * clamp(25px, 3vw, 50px))",
        zIndex: 10,
        ...(flip ? { transform: "scaleY(-1)" } : {}),
      }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2400 100"
        preserveAspectRatio="none"
        fill="none"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        <path fill={fillMap[color]} d={tornPaperPaths[color]} />
      </svg>
    </div>
  );
}
