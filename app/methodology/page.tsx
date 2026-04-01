import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import ModalButton from "@/components/ui/ModalButton";
import Eyebrow from "@/components/ui/Eyebrow";
import CircleIcon from "@/components/ui/CircleIcon";
import PlayOnceVideo from "@/components/ui/PlayOnceVideo";
import TornPaperDivider from "@/components/ui/TornPaperDivider";

export const metadata = {
  title: "Methodology — EKUZO",
  description:
    "Pedagogy of gaming. Why games are the best teachers most students already know. The EKUZO approach to coaching, growth, and the ten pillars of great learning.",
};

const howItWorksCards = [
  {
    icon: "/icons/heart.svg",
    title: "Inclusion",
    desc: "A team for students who\u2019ve never had one.",
  },
  {
    icon: "/icons/enthusiasm.svg",
    title: "Engagement",
    desc: "Practices and matches keep students present and energized.",
  },
  {
    icon: "/icons/handwave.svg",
    title: "Attendance",
    desc: "Programs become a reason to show up.",
  },
  {
    icon: "/icons/leadership.svg",
    title: "Future-ready skills",
    desc: "Leadership, communication, and resilience built in a setting students actually care about.",
  },
];

const pillars = [
  { title: "Motivation", desc: "Small wins spark big change." },
  { title: "Correct Difficulty", desc: "Challenge tuned to ability keeps learners in flow." },
  { title: "Coaching", desc: "Feedback turns practice into progress." },
  { title: "Social Learning", desc: "Teams teach teamwork better than lectures." },
  { title: "Mastery", desc: "You can\u2019t level up until you\u2019ve learned." },
  { title: "Intentional Play", desc: "Fun is a feature, not a distraction." },
  { title: "Problem-Based Learning", desc: "Every match is a problem to solve." },
  { title: "Experimentation & Feedback", desc: "Try, fail, adjust, repeat." },
  { title: "Student Agency", desc: "Ownership fuels motivation and growth." },
  { title: "Cognitive Load", desc: "Clear fundamentals unlock creativity." },
];

export default function MethodologyPage() {
  return (
    <>
      {/* ══ 1. HERO — white bg, 50/50 grid, smoke graphics ═════════════════ */}
      <div className="relative overflow-visible" style={{ zIndex: 1 }}>
      <section
        className="bg-white relative overflow-clip"
        style={{
          paddingTop: "clamp(160px, 18vw, 240px)",
          paddingBottom: "clamp(160px, 22vw, 300px)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="light-red" />
        </div>

        {/* Smoke decoration — lower-left */}
        <div
          className="absolute bottom-0 left-0 pointer-events-none select-none translate-y-[10%]"
          aria-hidden="true"
        >
          <Image
            src="/images/smoke-1@2x.png"
            alt=""
            width={900}
            height={900}
            className="object-contain w-[clamp(300px,55vw,900px)] h-auto"
          />
        </div>

        {/* Smoke decoration — right side, full height */}
        <div
          className="absolute inset-y-0 right-0 z-10 pointer-events-none select-none"
          aria-hidden="true"
        >
          <Image
            src="/images/smoke-2@2x.png"
            alt=""
            width={900}
            height={900}
            className="h-full w-auto object-cover object-left"
          />
        </div>

        <div
          className="max-w-[1232px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Left — headline + CTA */}
          <div>
            <h1
              className="font-display uppercase text-black leading-[0.85] mb-6"
              style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
            >
              Pedagogy of gaming
            </h1>
            <p
              className="font-body text-black/70 leading-relaxed max-w-md mb-10"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              Why games are the best teachers most students already know.
            </p>
            <ModalButton modal="contact" variant="red-outlined">
              Start a conversation
            </ModalButton>
          </div>

          {/* Right — video reel 9:16, 70vh tall */}
          <div
            className="relative mx-auto lg:mx-0"
            style={{ aspectRatio: "9/16", maxHeight: "70vh", width: "min(100%, calc(70vh * 9 / 16))" }}
          >
            <PlayOnceVideo
              src="/videos/pedagogy-hero.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: "2px" }}
            />
          </div>
        </div>
      </section>
        {/* Torn paper: hero (white) → Why Games Work (grey) — outside the overflow-clip section */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(52%)",
            backgroundImage: "url(/images/new%20torn%20paper/torn-paper-grey-1@2x.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ══ 2. WHY GAMES WORK — grey bg, zigzag cards ═══════════════════════ */}
      <div className="relative overflow-visible" style={{ zIndex: 0 }}>
        <section
          className="bg-[#f0edea] relative"
          style={{
            marginTop: "clamp(-60px, -10vw, -150px)",
            paddingTop: "clamp(140px, 24vw, 294px)",
            paddingBottom: "clamp(120px, 18vw, 240px)",
          }}
        >
          {/* Decorative background — extends up behind the torn paper */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: "url(/images/card-background@2x.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div
            className="max-w-[1232px] mx-auto relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Large intro card with eyebrow */}
            <div
              className="bg-white mb-8"
              style={{
                borderRadius: "2px",
                padding: "clamp(2rem, 5vw, 64px)",
              }}
            >
              <div className="mb-4">
                <Eyebrow>HOW IT WORKS</Eyebrow>
              </div>
              <h4
                className="font-body font-bold text-black leading-[1] mb-6"
                style={{
                  fontSize: "clamp(2rem, 4vw, 64px)",
                  letterSpacing: "-1.28px",
                }}
              >
                Why games work as learning systems?
              </h4>
              <p
                className="font-body text-black/70 leading-[1.357]"
                style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
              >
                Every great game is a learning environment. Players stay engaged
                because they&apos;re motivated, supported, and challenged just
                enough to grow &mdash; the same best practices that drive effective
                classrooms.
              </p>
            </div>

            {/* Feature cards — zigzag with CircleIcon */}
            <div className="flex flex-col gap-8">
              {howItWorksCards.map((card, i) => (
                <div
                  key={card.title}
                  className={`flex ${i % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}
                >
                  <div
                    className="bg-white w-full lg:w-[560px]"
                    style={{
                      borderRadius: "2px",
                      padding: "clamp(1.5rem, 4vw, 48px)",
                    }}
                  >
                    <CircleIcon src={card.icon} className="mb-5" />
                    <h5
                      className="font-body font-bold text-black leading-[1.2] mb-4"
                      style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
                    >
                      {card.title}
                    </h5>
                    <p
                      className="font-body text-black/70 leading-[1.417]"
                      style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ 3. QUOTE — red bg ═══════════════════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="red" variant="top" style={1} />
        <div
          className="bg-red"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
          }}
        >
          <div
            className="max-w-[880px] mx-auto text-center relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Decorative quote icon */}
            <Image
              src="/images/quote-white@2x.png"
              alt=""
              width={40}
              height={40}
              className="mx-auto mb-8"
              aria-hidden="true"
            />

            <blockquote
              className="font-body font-bold text-white leading-[1.2] mb-10"
              style={{ fontSize: "clamp(1.25rem, 2.8vw, 40px)" }}
            >
              &ldquo;Our job isn&apos;t to add pedagogy to games; it&apos;s to
              help students see it, use it, and carry that mindset into school,
              careers, and life&rdquo;
            </blockquote>

            <p
              className="font-body font-bold text-white"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Karlin Oei
            </p>
            <p
              className="font-body font-bold text-white/60"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Founder EKUZO
            </p>
          </div>
        </div>
        <TornPaperDivider color="red" variant="bottom" style={1} />
      </section>

      {/* ══ 4. TEN PILLARS — black bg ═══════════════════════════════════════ */}
      <section
        className="bg-black relative overflow-clip"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
        }}
      >
        <div
          className="max-w-[1232px] mx-auto"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Header — two-column: heading left, subtext right */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 mb-16 items-start">
            <div className="lg:flex-1">
              <div className="mb-4">
                <Eyebrow>PEDAGOGY</Eyebrow>
              </div>
              <h2
                className="font-body font-bold text-white leading-[1]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 64px)",
                  letterSpacing: "-1.28px",
                }}
              >
                The ten pillars of EKUZO pedagogy
              </h2>
            </div>
            <p
              className="font-body text-white/50 leading-[1.417] lg:max-w-[400px] lg:pt-12"
              style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
            >
              Why games are the best teachers most students already&nbsp;know.
            </p>
          </div>

          {/* 4-column layout: 2 / 3 / 2 / 3 with offset on 2-card columns */}
          {(() => {
            const columns = [
              { cards: [pillars[0], pillars[1]], offset: true },
              { cards: [pillars[2], pillars[3], pillars[4]], offset: false },
              { cards: [pillars[5], pillars[6]], offset: true },
              { cards: [pillars[7], pillars[8], pillars[9]], offset: false },
            ];

            const clipOuter =
              "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
            const clipInner =
              "polygon(18px 0%, 100% 0%, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0% 100%, 0% 18px)";

            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
                {columns.map((col, colIdx) => (
                  <div
                    key={colIdx}
                    className={`flex flex-col gap-4 md:gap-5 ${col.offset ? "md:mt-16" : ""}`}
                  >
                    {col.cards.map((pillar) => (
                      <div key={pillar.title} className="group flex-1">
                        <div
                          className="bg-white/20 group-hover:bg-red h-full transition-colors duration-200"
                          style={{ clipPath: clipOuter, padding: "2px" }}
                        >
                          <div
                            className="bg-black p-6 md:p-7 h-full flex flex-col"
                            style={{ clipPath: clipInner }}
                          >
                            <h3
                              className="font-body font-bold text-white mb-2"
                              style={{
                                fontSize: "clamp(1.125rem, 1.6vw, 24px)",
                              }}
                            >
                              {pillar.title}
                            </h3>
                            <p
                              className="text-white/60 leading-relaxed"
                              style={{
                                fontSize: "clamp(0.875rem, 1.2vw, 18px)",
                              }}
                            >
                              {pillar.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══ 5. FOOTER BANNER & FOOTER ═══════════════════════════════════════ */}
      <FooterBanner heading="Turning pedagogy into progress for every student" />
      <Footer />

      {/* ══ FIXED SCROLL BUTTON (Mobile CTA) ════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-red border-t border-red/50 px-4 py-3 flex gap-2 z-40 safe-area-inset-bottom">
        <ModalButton modal="enroll" variant="white-filled" className="flex-1">
          Enroll my gamer
        </ModalButton>
        <ModalButton modal="contact" variant="white-outlined" className="flex-1">
          Start a conversation
        </ModalButton>
      </div>
      <div className="md:hidden h-20" />
    </>
  );
}
