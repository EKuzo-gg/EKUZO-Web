import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import ModalButton from "@/components/ui/ModalButton";

export const metadata = {
  title: "Games — EKUZO",
  description:
    "Discover what growth through games really requires. Learn why League of Legends is the perfect platform for teaching esports skills, teamwork, and resilience.",
};

const ecosystemCards = [
  {
    number: "01",
    title: "MOTIVATION",
    body: "Games work because students care about winning, improving, and earning the respect of their team. Motivation drives focus, persistence, and the willingness to try again.",
  },
  {
    number: "02",
    title: "CHALLENGE",
    body: "Games naturally push back. Every loss is a lesson. Every comeback builds resilience. Students who learn to process difficulty in games carry that strength everywhere.",
  },
  {
    number: "03",
    title: "TEAM CONTEXT",
    body: "When success depends on others, communication becomes essential, not optional. Students practice responsibility, trust, and leadership in every match.",
  },
  {
    number: "04",
    title: "STRUCTURE",
    body: "Without structure, progress is inconsistent. EKUZO adds cadence, goals, and accountability. Structure is what turns play into growth.",
  },
  {
    number: "05",
    title: "COACHING & REFLECTION",
    body: "Coaching adds feedback, reflection, and intentionality to something students already love. Reflection turns experience into awareness. Together, they close the loop between action and improvement.",
  },
  {
    number: "06",
    title: "WHERE ALL OF THIS COMES TOGETHER",
    body: "Many games support parts of the equation. League of Legends supports all of it—across different skill levels, with the depth to sustain a real coaching system.",
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

export default function GamesPage() {
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
          <h1
            className="font-display text-white leading-none max-w-4xl"
            style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
          >
            WHAT GROWTH THROUGH GAMES REALLY REQUIRES
          </h1>
        </div>

        {/* Decorative hero image */}
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
            WHAT MAKES GROWTH
            <br />
            THROUGH GAMES REAL
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
          <h2
            className="font-display text-white leading-none mb-8"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            WHERE OTHER
            <br />
            GAMES FIT
          </h2>
          <p className="font-body text-white/80 leading-relaxed mb-16 max-w-2xl" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
            Other games are often where students start. They spark interest, build motivation, and create momentum.
          </p>

          {/* Illustration on left */}
          <div className="flex justify-center -mx-6 md:-mx-[104px]">
            <Image
              src="/images/games-other-illustration.png"
              alt="Where other games fit in the EKUZO journey"
              width={600}
              height={400}
              className="w-full max-w-4xl object-contain opacity-60"
            />
          </div>
        </div>
      </section>

      <TornPaperDivider color="red" />

      {/* ══ 6. TESTIMONIAL ═══════════════════════════════════════════════════ */}
      <section className="bg-white" style={{ paddingTop: "188px", paddingBottom: "188px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center gap-8">
          {/* Quotation mark decoration */}
          <div className="relative w-10 h-10">
            <Image
              src="/images/games-quote-mark.png"
              alt=""
              width={40}
              height={40}
              className="object-contain"
              aria-hidden="true"
            />
          </div>

          {/* Quote */}
          <blockquote
            className="font-display text-black leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            EKUZO meets students through the games they love, but teaches through the game that allows growth to compound.
          </blockquote>

          {/* Attribution */}
          <div className="flex flex-col items-center gap-1 pt-4">
            <p className="font-body font-bold text-black" style={{ fontSize: "clamp(1.125rem, 2vw, 24px)" }}>
              KARLIN OEI
            </p>
            <p className="font-body text-black/60" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Founder, EKUZO
            </p>
          </div>
        </div>
      </section>

      {/* ══ 7. FOOTER BANNER & FOOTER ════════════════════════════════════════ */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />

      {/* ══ 8. FIXED SCROLL BUTTON (Mobile CTA) ══════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-red border-t border-red/50 px-4 py-3 flex gap-2 z-40 safe-area-inset-bottom">
        <ModalButton modal="enroll" variant="white-filled" className="flex-1">
          Enroll my gamer
        </ModalButton>
        <ModalButton modal="contact" variant="white-outlined" className="flex-1">
          Start a conversation
        </ModalButton>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="md:hidden h-20" />
    </>
  );
}
