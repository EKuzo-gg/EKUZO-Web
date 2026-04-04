import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
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
      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative bg-red overflow-visible"
        style={{
          paddingTop: "clamp(160px, 18vw, 240px)",
          paddingBottom: "clamp(120px, 16vw, 200px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="dark" />
        </div>

        {/* Decorative hero image — full bleed behind headline */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <Image
            src="/images/games-hero.png"
            alt=""
            fill
            className="object-cover object-left"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-[1232px] mx-auto relative z-10">
          <div className="mb-6">
            <Eyebrow variant="light">GAMES</Eyebrow>
          </div>
          <h1
            className="font-display text-white leading-[0.85] max-w-4xl"
            style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
          >
            GROWTH
            <br />
            THROUGH
            <br />
            GAMES
          </h1>
        </div>
      </section>

      {/* ══ 2. GAMES SPARK MOTIVATION ════════════════════════════════════════ */}
      <section
        className="relative bg-white overflow-visible"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="white" variant="top" style={2} />
        <div className="max-w-[1232px] mx-auto">
          <div className="mb-4">
            <Eyebrow>WHY GAMES</Eyebrow>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="font-display text-black leading-[0.85]"
                style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
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

      {/* ══ 3. SIX PILLARS — STICKY SCROLL ══════════════════════════════════ */}
      <section
        className="relative bg-grey overflow-visible"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="grey" variant="top" style={1} />
        <div className="max-w-[1232px] mx-auto">
          <div className="mb-4">
            <Eyebrow>THE FRAMEWORK</Eyebrow>
          </div>
          <h2
            className="font-display text-black leading-[0.85] mb-16"
            style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
          >
            WHAT MAKES GROWTH
            <br />
            THROUGH GAMES REAL
          </h2>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Sticky left image — big, cropped behind cards */}
            <div
              className="hidden lg:block lg:w-[700px] shrink-0 sticky top-12 self-start -mr-24 z-0"
            >
              <Image
                src="/images/about-sticky-image.png"
                alt="EKUZO student gaming"
                width={1200}
                height={1600}
                className="w-full object-contain"
              />
            </div>

            {/* Scrolling cards */}
            <div className="flex flex-col gap-6 flex-1 relative z-10">
              {ecosystemCards.map((card, i) => (
                <div
                  key={card.number}
                  className={`p-8 ${i % 2 === 0 ? "bg-black text-white" : "bg-white text-black"}`}
                  style={{
                    clipPath:
                      "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <div className="flex items-start gap-6">
                    <span
                      className={`font-display leading-none shrink-0 ${i % 2 === 0 ? "text-red" : "text-black/15"}`}
                      style={{ fontSize: "clamp(4rem, 8vw, 4rem)" }}
                    >
                      {card.number}
                    </span>
                    <div className="flex flex-col gap-3 pt-1">
                      <h3
                        className={`font-display leading-[0.85] ${i % 2 === 0 ? "text-white" : "text-black"}`}
                        style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`font-body leading-relaxed ${i % 2 === 0 ? "text-white" : "text-black/60"}`}
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
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </section>

      {/* ══ 4. LEAGUE OF LEGENDS ═════════════════════════════════════════════ */}
      <section
        className="bg-black"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          <div className="mb-4">
            <Eyebrow>OUR PRIMARY GAME</Eyebrow>
          </div>
          <h2
            className="font-display text-white leading-[0.85] mb-4"
            style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
          >
            LEAGUE OF LEGENDS
          </h2>
          <p className="font-body text-white/60 mb-14" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
            That balance comes from 3 things:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loLCards.map((card) => (
              <div
                key={card.title}
                className="relative bg-white p-8 flex flex-col gap-4"
                style={{
                  clipPath:
                    "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                }}
              >
                <h3 className="font-body font-bold text-black text-xl">{card.title}</h3>
                <p className="font-body text-black/60 leading-relaxed text-base">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. WHERE OTHER GAMES FIT ═════════════════════════════════════════ */}
      <section
        className="relative bg-red overflow-visible"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="red" variant="top" style={1} />
        <div className="max-w-[1232px] mx-auto">
          <div className="mb-4">
            <Eyebrow variant="light">BEYOND LEAGUE</Eyebrow>
          </div>
          <h2
            className="font-display text-white leading-[0.85] mb-8"
            style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
          >
            WHERE OTHER GAMES FIT
          </h2>
          <p className="font-body text-white/80 leading-relaxed mb-16 max-w-2xl" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
            Other games are often where students start. They spark interest, build motivation, and create momentum.
          </p>

          <div className="flex justify-center">
            <Image
              src="/images/games-other-illustration.png"
              alt="Where other games fit in the EKUZO journey"
              width={600}
              height={400}
              className="w-full max-w-4xl object-contain"
            />
          </div>
        </div>
        <TornPaperDivider color="red" variant="bottom" style={1} />
      </section>

      {/* ══ 6. TESTIMONIAL ═══════════════════════════════════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "188px",
          paddingBottom: "188px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center gap-8">
          <Image
            src="/images/testimonial-quote-mark.png"
            alt=""
            width={88}
            height={80}
            className="mb-4"
            aria-hidden="true"
          />

          <blockquote
            className="font-body font-bold text-black leading-snug"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
          >
            &ldquo;EKUZO meets students through the games they love, but teaches through the game that allows growth to compound.&rdquo;
          </blockquote>

          <div className="flex flex-col items-center gap-1 pt-4">
            <p className="font-body font-bold text-black" style={{ fontSize: "clamp(1.125rem, 2vw, 24px)" }}>
              Karlin Oei
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

    </>
  );
}
