"use client";

import Button from "@/components/ui/Button";

type ProgramsSectionProps = {
  showTeams?: boolean;
  showEkuzo100?: boolean;
  showCamps?: boolean;
};

type Stat = { value: string; label: string };

type ProgramCard = {
  key: string;
  name: string;
  stats: Stat[];
  blurb: string;
  href: string;
  btnLabel: string;
  bgImage: string;
  stickyTop: string;
};

const cards: ProgramCard[] = [
  {
    key: "teams",
    name: "eKUzOteams",
    stats: [
      { value: "15", label: "weeks" },
      { value: "2-3x", label: "practice weekly" },
      { value: "During or After", label: "School" },
    ],
    blurb: "Best for: students and schools ready for ongoing growth.",
    href: "/ekuzo-teams",
    btnLabel: "Learn more about EKUZOTEAMS",
    bgImage: "/images/program-card-bg-1.png",
    stickyTop: "40px",
  },
  {
    key: "ekuzo100",
    name: "ekuzo100",
    stats: [
      { value: "4", label: "weeks" },
      { value: "2x", label: "weekly" },
      { value: "After", label: "school" },
    ],
    blurb: "Best for: first-time students or families curious about esports.",
    href: "/ekuzo100",
    btnLabel: "Learn more about EKUZO100",
    bgImage: "/images/program-card-bg-1.png",
    stickyTop: "160px",
  },
  {
    key: "camps",
    name: "ekuzocamps",
    stats: [
      { value: "1", label: "week" },
      { value: "10", label: "teammates" },
      { value: "Summer / holiday", label: "break" },
    ],
    blurb: "Best for: students who want a burst of activity during breaks.",
    href: "/ekuzo-camps",
    btnLabel: "Learn more about EKUZOCAMPS",
    bgImage: "/images/program-card-bg-2.png",
    stickyTop: "240px",
  },
];

export default function ProgramsSection({
  showTeams = true,
  showEkuzo100 = true,
  showCamps = true,
}: ProgramsSectionProps) {
  const visibilityMap: Record<string, boolean> = {
    teams: showTeams,
    ekuzo100: showEkuzo100,
    camps: showCamps,
  };

  const visibleCards = cards.filter((c) => visibilityMap[c.key]);

  return (
    <section
      className="px-6 md:px-[80px]"
      style={{ paddingTop: "188px", paddingBottom: "188px" }}
    >
      <div className="max-w-[1232px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-[120px] max-w-[600px]">
          <p
            className="font-body font-medium text-black/50 uppercase"
            style={{ fontSize: "16px", letterSpacing: "10px" }}
          >
            PROGRAMS
          </p>
          <h4
            className="font-body font-bold text-black leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            3 programs. 1 system. 1 esport experience.
          </h4>
        </div>

        {/* Cards — sticky scroll on desktop, stacked on mobile */}
        <div className="flex flex-col gap-[120px]">
          {visibleCards.map((card) => (
            <div
              key={card.key}
              className="hidden md:block"
              style={{ position: "sticky", top: card.stickyTop }}
            >
              <ProgramCard card={card} />
            </div>
          ))}
          {/* Mobile: normal stack */}
          {visibleCards.map((card) => (
            <div key={`mobile-${card.key}`} className="md:hidden">
              <ProgramCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ card }: { card: ProgramCard }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url('${card.bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "88px",
        borderRadius: "2px",
        minHeight: "480px",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-10 h-full">
        {/* Program name */}
        <h2
          className="font-display uppercase text-white leading-none"
          style={{ fontSize: "clamp(3rem, 8vw, 10rem)" }}
        >
          {card.name}
        </h2>

        {/* Stats row */}
        <div className="flex flex-wrap gap-12">
          {card.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span
                className="font-body font-bold text-white leading-[1.2]"
                style={{ fontSize: "40px" }}
              >
                {stat.value}
              </span>
              <span
                className="font-body font-bold text-white leading-[1.2]"
                style={{ fontSize: "24px", opacity: 0.7 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Blurb */}
        <p
          className="font-body text-white leading-[1.357] max-w-[520px]"
          style={{ fontSize: "28px" }}
        >
          {card.blurb}
        </p>

        {/* CTA */}
        <div>
          <Button variant="white-outlined" href={card.href}>
            {card.btnLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
