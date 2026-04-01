type CircleIconProps = {
  src: string;
  /** Circle diameter in px — default 48 */
  size?: number;
  /** Icon size inside the circle in px — default 28 */
  iconSize?: number;
  /** Circle background color — default #cccccc */
  bg?: string;
  className?: string;
};

/**
 * Icon centered inside a circular background.
 *
 * IMPORTANT: The SVG icons must have a tight viewBox that wraps the artwork
 * (no dead space). If an icon appears off-center, fix its viewBox first —
 * crop it to the actual path bounds. See hard-problem.svg, run-first.svg,
 * easy.svg, youth.svg for examples of correctly cropped viewBoxes.
 */
export default function CircleIcon({
  src,
  size = 48,
  iconSize = 28,
  bg = "#cccccc",
  className = "",
}: CircleIconProps) {
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: iconSize, height: iconSize }}
      />
    </div>
  );
}
