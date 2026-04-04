"use client";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";

type ProgramsSectionProps = {
  showTeams?: boolean;
  showEkuzo100?: boolean;
  showCamps?: boolean;
  /** Override the default "3 programs. 1 system." heading */
  heading?: React.ReactNode;
};

type Stat = { value: string; label: string };

type ProgramCard = {
  key: string;
  namePrefix: string;
  nameSuffix: string;
  suffixColor: string;
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
    namePrefix: "eKUzO",
    nameSuffix: "teams",
    suffixColor: "text-black",
    stats: [
      { value: "15", label: "weeks" },
      { value: "2-3x", label: "practice weekly" },
      { value: "During or After", label: "School" },
    ],
    blurb: "Best for: students and schools ready for ongoing growth.",
    href: "/programs/ekuzo-teams",
    btnLabel: "Learn about EKUZOTEAMS",
    bgImage: "/images/program-card-bg-1.png",
    stickyTop: "40px",
  },
  {
    key: "ekuzo100",
    namePrefix: "ekuzo",
    nameSuffix: "100",
    suffixColor: "text-black",
    stats: [
      { value: "4", label: "weeks" },
      { value: "2x", label: "weekly" },
      { value: "After", label: "school" },
    ],
    blurb: "Best for: first-time students or families curious about esports.",
    href: "/programs/ekuzo100",
    btnLabel: "Learn about EKUZO100",
    bgImage: "/images/program-card-bg-1.png",
    stickyTop: "160px",
  },
  {
    key: "camps",
    namePrefix: "ekuzo",
    nameSuffix: "camps",
    suffixColor: "text-red",
    stats: [
      { value: "1", label: "week" },
      { value: "10", label: "teammates" },
      { value: "Summer / holiday", label: "break" },
    ],
    blurb: "Best for: students who want a burst of activity during breaks.",
    href: "/programs/ekuzo-camps",
    btnLabel: "Learn about EKUZOCAMPS",
    bgImage: "/images/program-card-bg-2.png",
    stickyTop: "240px",
  },
];

export default function ProgramsSection({
  showTeams = true,
  showEkuzo100 = true,
  showCamps = true,
  heading,
}: ProgramsSectionProps) {
  const visibilityMap: Record<string, boolean> = {
    teams: showTeams,
    ekuzo100: showEkuzo100,
    camps: showCamps,
  };

  const visibleCards = cards.filter((c) => visibilityMap[c.key]);

  return (
    <section
      style={{
        paddingTop: "clamp(80px, 14vw, 188px)",
        paddingBottom: "clamp(80px, 14vw, 188px)",
        paddingLeft: "clamp(1rem, 5.5vw, 80px)",
        paddingRight: "clamp(1rem, 5.5vw, 80px)",
      }}
    >
      <div className="max-w-[1232px] mx-auto">
        {/* Header — centered, matching homepage pattern */}
        <div className="flex flex-col items-center gap-4 mb-[80px] lg:mb-[120px] text-center">
          <Eyebrow>PROGRAMS</Eyebrow>
          <h4
            className="font-body font-bold text-black leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            {heading ?? (<>3 programs. 1 system.<br />1 esport experience.</>)}
          </h4>
        </div>

        {/* Cards — sticky scroll on desktop, stacked on mobile */}
        <div className="flex flex-col gap-[80px] lg:gap-[120px]">
          {visibleCards.map((card) => (
            <div
              key={card.key}
              className="hidden lg:block"
              style={{ position: "sticky", top: card.stickyTop }}
            >
              <ProgramCard card={card} />
            </div>
          ))}
          {/* Mobile: normal stack */}
          {visibleCards.map((card) => (
            <div key={`mobile-${card.key}`} className="lg:hidden">
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
        padding: "clamp(2.5rem, 6vw, 88px)",
        minHeight: "clamp(420px, 40vw, 480px)",
        clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)",
      }}
    >
      <div className="relative z-10 flex flex-col justify-between h-full gap-[24px] lg:gap-[80px]">
        {/* Program name — two lines on mobile, single line on desktop */}
        <div className="flex flex-col gap-[8px]">
          {/* Mobile: two-line split */}
          <h2
            className="font-display uppercase text-white leading-[0.85] lg:hidden"
            style={{ fontSize: "100px" }}
          >
            {card.namePrefix}
          </h2>
          <h2
            className={`font-display uppercase leading-[0.85] lg:hidden ${card.suffixColor}`}
            style={{ fontSize: "100px" }}
          >
            {card.nameSuffix}
          </h2>
          {/* Desktop: single line */}
          <h2
            className="font-display uppercase text-white leading-[0.85] hidden lg:block"
            style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
          >
            {card.namePrefix}<span className={card.suffixColor}>{card.nameSuffix}</span>
          </h2>

          {/* Stats — stacked on mobile, horizontal row on desktop */}
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-8 xl:gap-12 mt-4 lg:mt-0">
            {card.stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2 lg:gap-1">
                <span
                  className="font-display uppercase text-white leading-[1]"
                  style={{ fontSize: "clamp(2rem, 3vw, 40px)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="font-body font-bold text-white/70 leading-[1]"
                  style={{ fontSize: "clamp(1rem, 1.5vw, 24px)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: blurb + CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <p
            className="font-body text-white leading-[1.357] max-w-[389px]"
            style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
          >
            {card.blurb}
          </p>
          <div className="shrink-0">
            <Button variant="white-outlined" href={card.href}>
              {card.btnLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
