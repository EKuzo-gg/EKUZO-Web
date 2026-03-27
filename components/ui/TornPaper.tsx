/**
 * TornPaper — full-bleed section divider that mimics the torn paper
 * texture used throughout the design.
 *
 * SVG dividers (white/black/red) are custom-built for the 100px container
 * with viewBox="0 0 2400 100".
 *
 * Full-bleed Framer PNG exports live in /public/images/:
 *   torn-paper-white-1.png, torn-paper-white-2.png  (use as <img> overlays)
 *   torn-paper-black-1.png, torn-paper-black-2.png
 *   torn-paper-red-1.png, torn-paper-red-2.png
 */

type TornPaperColor = "white" | "black" | "red";
type TornPaperStyle = 1 | 2 | 3;

type TornPaperProps = {
  color?: TornPaperColor;
  style?: TornPaperStyle;
  flip?: boolean;
  className?: string;
};

const assetMap: Record<TornPaperColor, Record<TornPaperStyle, string>> = {
  white: {
    1: "/images/torn-paper-white-1.svg",
    2: "/images/torn-paper-white-1.svg",
    3: "/images/torn-paper-white-1.svg",
  },
  black: {
    1: "/images/torn-paper-black-2.svg",
    2: "/images/torn-paper-black-2.svg",
    3: "/images/torn-paper-black-3.svg",
  },
  red: {
    1: "/images/torn-paper-red-1.svg",
    2: "/images/torn-paper-red-1.svg",
    3: "/images/torn-paper-red-1.svg",
  },
};

export default function TornPaper({
  color = "white",
  style = 1,
  flip = false,
  className = "",
}: TornPaperProps) {
  const src = assetMap[color][style];

  return (
    <div
      className={`relative w-full h-[100px] overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`absolute inset-0 size-full object-cover object-center ${flip ? "scale-y-[-1]" : ""}`}
        decoding="async"
      />
    </div>
  );
}
