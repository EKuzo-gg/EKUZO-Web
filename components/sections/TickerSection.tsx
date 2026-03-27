import Button from "@/components/ui/Button";

type TickerCard = {
  title: string;
  body: string;
};

type TickerSectionProps = {
  eyebrow?: string;
  heading: string;
  body?: string;
  cards: TickerCard[];
  theme?: "light" | "dark";
  cta?: { label: string; href: string };
  bg?: string;
};

export default function TickerSection({
  eyebrow,
  heading,
  body,
  cards,
  theme = "light",
  cta,
  bg = "bg-white",
}: TickerSectionProps) {
  const isDark = theme === "dark";

  return (
    <section
      className={`${bg} overflow-hidden`}
      style={{ paddingTop: isDark ? "144px" : "188px", paddingBottom: "188px" }}
    >
      <div style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        {/* Header */}
        <div className="flex flex-col gap-4 mb-12 max-w-[600px]">
          {eyebrow && (
            <p
              className={`font-body font-medium uppercase ${isDark ? "text-white/50" : "text-black/50"}`}
              style={{ fontSize: "16px", letterSpacing: "10px" }}
            >
              {eyebrow}
            </p>
          )}
          <h4
            className={`font-body font-bold leading-[1] ${isDark ? "text-white" : "text-black"}`}
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            {heading}
          </h4>
          {body && (
            <p
              className={`font-body leading-[1.417] mt-2 ${isDark ? "text-white/70" : "text-black/70"}`}
              style={{ fontSize: "24px" }}
            >
              {body}
            </p>
          )}
        </div>

        {/* Scrollable cards */}
        <div className="flex flex-row gap-6 overflow-x-auto pb-4" style={{ scrollSnapType: "x mandatory" }}>
          {cards.map((card) => (
            <div
              key={card.title}
              className="shrink-0 flex flex-col gap-4 p-10"
              style={{
                minWidth: "320px",
                maxWidth: "380px",
                borderRadius: "2px",
                scrollSnapAlign: "start",
                background: isDark ? "rgba(255,255,255,0.06)" : "#EFEEEF",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              <h5
                className={`font-body font-bold leading-[1.2] ${isDark ? "text-white" : "text-black"}`}
                style={{ fontSize: "40px" }}
              >
                {card.title}
              </h5>
              <p
                className={`font-body leading-[1.357] ${isDark ? "text-white/70" : "text-black/70"}`}
                style={{ fontSize: "28px" }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        {cta && (
          <div className="mt-12">
            <Button variant={isDark ? "white-outlined" : "red-outlined"} href={cta.href}>
              {cta.label}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
