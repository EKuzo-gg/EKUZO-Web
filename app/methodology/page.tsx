import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaper from "@/components/ui/TornPaper";
import ModalButton from "@/components/ui/ModalButton";

export const metadata = {
  title: "Methodology — EKUZO",
  description:
    "Pedagogy of gaming. Why games are the best teachers most students already know. The EKUZO approach to coaching, growth, and the ten pillars of great learning.",
};

const howItWorksCards = [
  {
    icon: "heart",
    title: "Inclusion",
    desc: "A team for students who've never had one.",
    align: "right",
  },
  {
    icon: "enthusiasm",
    title: "Engagement",
    desc: "Practices and matches keep students present and energized.",
    align: "left",
  },
  {
    icon: "handwave",
    title: "Attendance",
    desc: "Programs become a reason to show up.",
    align: "right",
  },
  {
    icon: "leadership",
    title: "Future-ready skills",
    desc: "Leadership, communication, and resilience built in a setting students actually care about.",
    align: "left",
  },
];

const pillars = [
  { title: "Motivation", desc: "Small wins spark big change." },
  { title: "Correct Difficulty", desc: "Challenge tuned to ability keeps learners in flow." },
  { title: "Coaching", desc: "Feedback turns practice into progress." },
  { title: "Social Learning", desc: "Teams teach teamwork better than lectures." },
  { title: "Mastery", desc: "You can't level up until you've learned." },
  { title: "Intentional Play", desc: "Fun is a feature, not a distraction." },
  { title: "Problem-Based Learning", desc: "Every match is a problem to solve." },
  { title: "Experimentation & Feedback", desc: "Try, fail, adjust, repeat." },
  { title: "Student Agency", desc: "Ownership fuels motivation and growth." },
  { title: "Cognitive Load", desc: "Clear fundamentals unlock creativity." },
];

export default function MethodologyPage() {
  return (
    <>
      <Nav variant="light" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden min-h-[90vh] flex items-center">
        {/* top-right ink decoration */}
        <div
          className="absolute top-0 right-0 h-full w-[45%] pointer-events-none select-none"
          aria-hidden="true"
        >
          <Image
            src="/images/pedagogy-hero-right-bg.png"
            alt=""
            fill
            className="object-contain object-right-top"
            priority
          />
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-0 px-6 md:pl-[104px] md:pr-0 pt-12 pb-16 md:pt-0 md:pb-0 items-center">
          {/* Left */}
          <div className="py-16 md:py-24">
            <h1
              className="font-body font-black text-black uppercase leading-[0.9] tracking-tight mb-6"
              style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
            >
              Pedagogy of gaming
            </h1>
            <p className="text-black max-w-md leading-relaxed mb-10" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Why games are the best teachers most students already know.
            </p>
            <ModalButton modal="enroll" variant="red-outlined">
              Enroll my gamer
            </ModalButton>
          </div>

          {/* Right – video */}
          <div className="relative w-full h-[400px] md:h-[90vh]">
            <video
              src="/videos/pedagogy-hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Hero → grey transition */}
      <div className="relative bg-grey -mt-1" aria-hidden="true">
        <Image
          src="/images/pedagogy-hero-torn.png"
          alt=""
          width={1440}
          height={220}
          className="w-full h-auto"
        />
      </div>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="bg-grey pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-[clamp(1.5rem,7.2vw,104px)]">
          {/* Intro card */}
          <div className="bg-white p-10 md:p-14 max-w-2xl mb-16">
            <span className="inline-block bg-red text-white text-xs font-bold font-body tracking-widest uppercase px-3 py-1.5 mb-6">
              HOW IT WORKS
            </span>
            <h2
              className="font-body font-black text-black leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Why games work as learning systems?
            </h2>
            <p className="text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Every great game is a learning environment. Players stay engaged
              because they&apos;re motivated, supported, and challenged just
              enough to grow — the same best practices that drive effective
              classrooms.
            </p>
          </div>

          {/* Staggered feature cards */}
          <div className="space-y-10 md:space-y-16">
            {howItWorksCards.map((card, i) => (
              <div
                key={card.title}
                className={`flex ${card.align === "right" ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-white p-8 md:p-10 w-full max-w-sm md:max-w-md shadow-sm">
                  <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/icons/${card.icon}.svg`}
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  <h3 className="font-body font-bold text-black mb-3" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                    {card.title}
                  </h3>
                  <p className="text-black/70 leading-relaxed" style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)" }}>{card.desc}</p>
                </div>

                {/* Decorative offset element */}
                {i < howItWorksCards.length - 1 && (
                  <div
                    className={`hidden md:block w-16 h-2 bg-red self-end mb-10 ${card.align === "right" ? "mr-4" : "ml-4"}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* grey → red */}
      <TornPaper color="red" />

      {/* ── Quote ─────────────────────────────────────────────────── */}
      <section className="bg-red py-24 md:py-32 px-6 md:px-[clamp(1.5rem,7.2vw,104px)] text-center">
        {/* EKUZO camada icon */}
        <div className="flex justify-center mb-10" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/camada-white.svg" alt="" width={40} height={60} />
        </div>

        <blockquote
          className="font-body font-black text-white leading-[1.05] max-w-4xl mx-auto mb-10"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)" }}
        >
          Our job isn&apos;t to add pedagogy to games; it&apos;s to help
          students see it, use it, and carry that mindset into school, careers,
          and life
        </blockquote>

        <p className="text-white font-bold" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>Karlin Oei</p>
        <p className="text-white/50 mt-1" style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)" }}>Founder EKUZO</p>
      </section>

      {/* red → black */}
      <TornPaper color="black" />

      {/* ── Ten Pillars ───────────────────────────────────────────── */}
      <section className="bg-black pt-0 pb-24 px-6 md:px-[clamp(1.5rem,7.2vw,104px)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-body font-black text-white leading-tight tracking-tight mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              The ten pillars of EKUZO pedagogy
            </h2>
            <p className="text-white/50" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Why games are the best teachers most students already know.
            </p>
          </div>

          {/* 4-column staggered grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {pillars.map((pillar, i) => {
              const stagger = Math.floor(i / 4) % 2 === 0
                ? (i % 2 === 1 ? "md:mt-10" : "")
                : (i % 2 === 0 ? "md:mt-10" : "");
              return (
                <div key={pillar.title} className={`relative ${stagger}`}>
                  {/* outer white border via clip-path */}
                  <div
                    className="bg-white p-px"
                    style={{
                      clipPath:
                        "polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)",
                    }}
                  >
                    <div
                      className="bg-black p-6 md:p-7"
                      style={{
                        clipPath:
                          "polygon(19px 0%, calc(100% - 19px) 0%, 100% 19px, 100% calc(100% - 19px), calc(100% - 19px) 100%, 19px 100%, 0% calc(100% - 19px), 0% 19px)",
                      }}
                    >
                      <h3 className="font-body font-bold text-white mb-2" style={{ fontSize: "clamp(0.875rem, 1.2vw, 18px)" }}>
                        {pillar.title}
                      </h3>
                      <p className="text-white/60 leading-relaxed" style={{ fontSize: "clamp(0.75rem, 1vw, 14px)" }}>
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* black → red */}
      <TornPaper color="red" flip />

      {/* ── Turning pedagogy into progress ────────────────────────── */}
      <section className="bg-red py-24 px-6 md:px-[clamp(1.5rem,7.2vw,104px)] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="font-body font-black text-white leading-tight tracking-tight mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Turning pedagogy into progress
            </h2>
            <p className="text-white/80 leading-relaxed mb-10" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Games proved what great learning could look like. EKUZO makes it
              real for every student, in every school.
            </p>
            <ModalButton modal="contact" variant="white-outlined">
              Start a conversation
            </ModalButton>
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/images/community-group.png"
              alt="EKUZO students"
              fill
              className="object-contain object-center grayscale"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
