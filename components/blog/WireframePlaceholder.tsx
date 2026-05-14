type WireframePlaceholderProps = {
  type: "video" | "image";
  label: string;
  note: string;
  height?: number;
};

export default function WireframePlaceholder({
  type,
  label,
  note,
  height = 360,
}: WireframePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className="w-full flex flex-col items-center justify-center gap-4 p-8 my-6"
      style={{
        minHeight: `${height}px`,
        backgroundColor: "#f0edea",
        border: "2px dashed var(--color-red)",
      }}
    >
      <span
        className="font-body font-bold text-red uppercase text-xs"
        style={{ letterSpacing: "0.18em" }}
      >
        {type === "video" ? "Video placeholder" : "Image placeholder"}
      </span>
      <span
        className="font-body font-bold text-red uppercase text-center"
        style={{
          fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </span>
      <p
        className="text-black/70 text-center max-w-[48ch] text-sm leading-relaxed"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {note}
      </p>
    </div>
  );
}
