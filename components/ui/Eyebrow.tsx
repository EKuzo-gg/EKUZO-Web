type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  /** "default" = red bg / white text. "light" = white bg / red text (for use on colored sections). */
  variant?: "default" | "light";
};

export default function Eyebrow({ children, className = "", variant = "default" }: EyebrowProps) {
  const colorClasses =
    variant === "light"
      ? "bg-white text-red"
      : "bg-red text-white";

  return (
    <span
      className={`inline-block font-body font-bold text-sm tracking-[0.15em] uppercase px-5 py-2 ${colorClasses} ${className}`}
      style={{ transform: "skewX(-8deg)" }}
    >
      <span style={{ transform: "skewX(8deg)", display: "inline-block" }}>
        {children}
      </span>
    </span>
  );
}
