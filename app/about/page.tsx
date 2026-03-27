import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import Image from "next/image";

export const metadata = {
  title: "About — EKUZO",
  description:
    "What growth through games really requires. Learn about the EKUZO philosophy, why we use League of Legends, and what makes esports a uniquely powerful learning environment.",
};

const ecosystemCards = [
  {
    number: "01",
    title: "MOTIVATION",
    body: "Games work because students care. Motivation drives focus, persistence, and the willingness to try again. When a student is invested, learning follows naturally.",
  },
  {
    number: "02",
    title: "CHALLENGE",
    body: "Games naturally push back. Failure isn't the end — it's feedback. Students who learn to process difficulty in games carry that resilience into every part of their life.",
  },
  {
    number: "03",
    title: "TEAM CONTEXT",
    body: "When success depends on others, learning becomes social. Students practice communication, responsibility, and trust in every match.",
  },
  {
    number: "04",
    title: "STRUCTURE",
    body: "Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe. Structure is what turns play into growth.",
  },
  {
    number: "05",
    title: "COACHING & REFLECTION",
    body: "Coaching adds feedback, direction, and accountability. Reflection turns experience into awareness. Together, they close the loop between action and improvement.",
  },
  {
    number: "06",
    title: "WHERE IT ALL COMES TOGETHER",
    body: "Many games support parts of this growth. Very few support it consistently, across different skill levels, with the depth to sustain a real coaching system.",
  },
];

const loLCards = [
  {
    title: "Strategic Depth",
    desc: "Challenges students to think ahead, adapt, and make meaningful decisions under pressure — every single match.",
  },
  {
    title: "Approachable Mechanics",
    desc: "Easy to start, forgiving to learn, and accessible without overwhelming beginners. The floor is low, the ceiling is high.",
  },
  {
    title: "Stable Roles and Systems",
    desc: "Clear roles and team structures make teamwork and leadership teachable in a way few other games allow.",
  },
];

const otherGames = [
  {
    title: "Mario Kart",
    desc: "Small wins spark big change. Where many students discover the joy of competition.",
  },
  {
    title: "Fortnite",
    desc: "High energy, fast decisions. A gateway to competitive instincts and real-time teamwork.",
  },
  {
    title: "Roblox",
    desc: "Creativity and play. A space where imagination and collaboration first take root.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="dark" />
      </div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative bg-red overflow-hidden"
        style={{ paddingTop: "188px", paddingBottom: "144px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
      >
        <div className="max-w-[1232px] mx-auto relative z-10">
          <p className="font-body font-bold text-white/60 text-sm tracking-[0.15em] uppercase mb-6">
            Our Philosophy
          </p>
          <h1
            className="font-display text-white leading-none max-w-4xl"
            style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
          >
            WHAT GROWTH THROUGH GAMES REALLY REQUIRES
          </h1>
        </div>

        {/* Decorative right image */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none opacity-20">
          <Image
            src="/images/games-hero.png"
            alt=""
            fill
            className="object-cover object-left"
            aria-hidden="true"
          />
        </div>
      </section>

      <TornPaperDivider color="red" />

      {/* ══ 2. GAMES SPARK MOTIVATION ════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="font-display text-black leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
              >
                GAMES SPARK
                <br />
                MOTIVATION.
              </h2>
            </div>
            <div>
              <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
                Structure turns it into growth. Students come to EKUZO through
                many different games, and we respect the passion they bring with
                them. But when it comes to teaching — helping students build
                confidence, leadership, and real-world skills — growth depends
                on more than just play.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider color="white" />

      {/* ══ 3. SIX PILLARS — STICKY SCROLL ══════════════════════════════════ */}
      <section className="bg-grey py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
            The Framework
          </p>
          <h2
            className="font-display text-black leading-none mb-16"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            SIX THINGS THAT
            <br />
            MAKE IT REAL
          </h2>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Sticky left image */}
            <div className="hidden lg:block lg:w-[420px] shrink-0 sticky top-24 self-start">
              <Image
                src="/images/about-sticky-image.png"
                alt="EKUZO student gaming"
                width={420}
                height={560}
                className="w-full object-contain"
              />
            </div>

            {/* Scrolling cards */}
            <div className="flex flex-col gap-6 flex-1">
              {ecosystemCards.map((card, i) => (
                <div
                  key={card.number}
                  className={`p-8 ${i % 2 === 0 ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  <div className="flex items-start gap-6">
                    <span
                      className={`font-display leading-none shrink-0 ${i % 2 === 0 ? "text-red" : "text-black/15"}`}
                      style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                    >
                      {card.number}
                    </span>
                    <div className="flex flex-col gap-3 pt-1">
                      <h3
                        className={`font-display leading-none ${i % 2 === 0 ? "text-white" : "text-black"}`}
                        style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`font-body leading-relaxed ${i % 2 === 0 ? "text-white/60" : "text-black/60"}`}
                        style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
                      >
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 4. LEAGUE OF LEGENDS ═════════════════════════════════════════════ */}
      <section className="bg-black py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
            Our Primary Game
          </p>
          <h2
            className="font-display text-white leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            LEAGUE OF LEGENDS
            <br />
            STRIKES THAT BALANCE
          </h2>
          <p className="font-body text-white/50 mb-14" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
            That balance comes from 3 things:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loLCards.map((card, i) => (
              <div key={card.title} className="relative bg-white/5 border border-white/10 p-8 flex flex-col gap-4">
                <div className={`absolute top-0 left-0 w-full h-1 ${i === 1 ? "bg-white/20" : "bg-red"}`} />
                <h3 className="font-body font-bold text-white" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>{card.title}</h3>
                <p className="font-body text-white/50 leading-relaxed" style={{ fontSize: "clamp(0.875rem, 1.2vw, 18px)" }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 5. WHERE OTHER GAMES FIT ═════════════════════════════════════════ */}
      <section className="bg-red py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-14">
            <div>
              <h2
                className="font-display text-white leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                WHERE OTHER
                <br />
                GAMES FIT
              </h2>
            </div>
            <div>
              <p className="font-body text-white/80 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
                Other games are often where students start. EKUZO meets students
                through the games they love, but teaches through the game that
                allows growth to compound.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {otherGames.map((game) => (
              <div key={game.title} className="bg-white/10 p-8 flex flex-col gap-3">
                <h3 className="font-display text-white leading-none" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
                  {game.title.toUpperCase()}
                </h3>
                <p className="font-body text-white/70 leading-relaxed" style={{ fontSize: "clamp(0.875rem, 1.2vw, 18px)" }}>{game.desc}</p>
              </div>
            ))}
          </div>

          {/* Decorative illustration */}
          <div className="flex justify-center">
            <Image
              src="/images/games-other-illustration.png"
              alt=""
              width={600}
              height={300}
              className="opacity-40 object-contain"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <TornPaperDivider color="red" />

      {/* ══ 6. WHAT PARENTS ARE SAYING ═══════════════════════════════════════ */}
      <section className="bg-white py-[144px]">
        <div className="max-w-[1232px] mx-auto mb-12" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
            From the Community
          </p>
          <h2
            className="font-display text-black leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            WHAT PARENTS
            <br />
            ARE SAYING
          </h2>
        </div>
        <TestimonialsCarousel />

        {/* Pull quote */}
        <div className="max-w-[1232px] mx-auto mt-16" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <div className="bg-grey p-10 md:p-14">
            <blockquote
              className="font-display text-black leading-tight max-w-2xl"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              &ldquo;It&apos;s structure, mentorship, and community all in one place.&rdquo;
            </blockquote>
            <p className="font-body text-black/50 mt-4 tracking-wide uppercase" style={{ fontSize: "clamp(0.75rem, 1vw, 14px)" }}>
              — Rudy May, EKUZO mom
            </p>
          </div>
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
