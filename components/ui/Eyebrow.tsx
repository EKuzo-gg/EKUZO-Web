type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-block bg-red text-white font-body font-bold text-sm tracking-[0.15em] uppercase px-5 py-2 ${className}`}
      style={{ transform: "skewX(-8deg)" }}
    >
      <span style={{ transform: "skewX(8deg)", display: "inline-block" }}>
        {children}
      </span>
    </span>
  );
}
