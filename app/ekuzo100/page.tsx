import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import OurApproachSection from "@/components/sections/OurApproachSection";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import ModalButton from "@/components/ui/ModalButton";
import Image from "next/image";

export const metadata = {
  title: "EKUZO100 — 4-Week Intro Program",
  description:
    "One month. $100. Your first team. EKUZO100 is the low-risk way to start with EKUZO — real coaching, real teammates, real growth.",
};

const howItWorksSteps = [
  {
    number: "1",
    title: "Join",
    desc: "Choose your schedule: after school or evening (weekdays). You're placed on a team of ~5 players at a similar level.",
  },
  {
    number: "2",
    title: "Practice",
    desc: "90-minute sessions, twice a week. Learn with your coach, alongside your team — structured drills, not just playing games.",
  },
  {
    number: "3",
    title: "Compete",
    desc: "Apply everything through scrimmages and intra-league competitions. Real stakes, real teamwork under pressure.",
  },
  {
    number: "4",
    title: "Progress",
    desc: "Reflect on growth with your coach at the end of the month. Then decide what comes next — no pressure, no contracts.",
  },
];

const ekuzo100FAQs = [
  {
    question: "What exactly is included in EKUZO100?",
    answer:
      "Four weeks of structured esports coaching: 8 sessions total (2×/week, 90 min each), on a dedicated 5-player team with a head coach. Includes team scrimmages, VOD review, and a growth debrief at the end of the month.",
  },
  {
    question: "What games does EKUZO100 support?",
    answer:
      "We primarily coach League of Legends and Valorant. When you enroll, you'll be placed on a team matching your preferred game. Other titles may be available — contact us to ask.",
  },
  {
    question: "What age range is EKUZO100 for?",
    answer:
      "Players aged 10–18. We group by both age and skill level so your student is with peers, not adults or far more experienced players.",
  },
  {
    question: "Is there any long-term commitment?",
    answer:
      "None. EKUZO100 is specifically designed as a low-risk, one-month entry point. At the end of the month your family decides whether to continue into EKUZO Teams — there's no automatic renewal.",
  },
  {
    question: "What happens after EKUZO100?",
    answer:
      "Students who enjoy the program can move into EKUZO Teams — a semester-long program (15 weeks) with consistent teammates, deeper skill development, and a full competitive season. It's the natural next step.",
  },
];

export default function Ekuzo100Page() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white overflow-hidden"
        style={{ paddingTop: "188px", paddingBottom: "144px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
      >
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <h1
                className="font-display text-black leading-none mb-6"
                style={{ fontSize: "clamp(5rem, 12vw, 10rem)" }}
              >
                EKUZO100
              </h1>
              <p
                className="font-body text-black/70 font-medium mb-3 max-w-md"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)" }}
              >
                One Month. $100. Your First Team.
              </p>
              <p className="font-body text-black/50 text-base mb-10 max-w-md leading-relaxed">
                The low-risk way to start with EKUZO. Real coaching, real teammates, and real growth — no long-term commitment.
              </p>
              <ModalButton modal="enroll" variant="red-filled" className="text-base px-8 py-4">
                Enroll My Gamer
              </ModalButton>
            </div>

            {/* Right: video */}
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/videos/ekuzo100-hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. OUR APPROACH ══════════════════════════════════════════════════ */}
      <OurApproachSection
        heading="Built for growth, on and off the screen"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        body="Parents want to know if EKUZO is the right fit for their child. Students want a chance to prove themselves on a team. EKUZO100 makes it simple: one month, $100, no long-term commitment. The perfect entry point. Your student joins a team, trains with elite coaches, and competes in real matches in just four weeks."
      />

      <TornPaperDivider color="black" />

      {/* ══ 3. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 4. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">

          {/* Large intro card */}
          <div className="bg-grey p-10 md:p-14 mb-16">
            <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
              How It Works
            </p>
            <h2
              className="font-display text-black leading-none mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              ONE MONTH.
              <br />
              FOUR STEPS.
            </h2>
            <p className="font-body text-black/60 text-lg leading-relaxed max-w-2xl">
              Each EKUZO100 cohort follows the same one-month structure. Practices are 90 minutes, twice a week — designed to teach teamwork, focus, and growth through play.
            </p>
          </div>

          {/* 4-step zigzag */}
          <div className="flex flex-col gap-6">
            {howItWorksSteps.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row items-start gap-8 p-8 ${
                  i % 2 === 0 ? "bg-black text-white" : "bg-grey text-black"
                }`}
              >
                {/* Number */}
                <div
                  className={`shrink-0 font-display leading-none ${
                    i % 2 === 0 ? "text-red" : "text-black/20"
                  }`}
                  style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
                >
                  {step.number}
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center gap-3 pt-2 md:pt-4">
                  <h3
                    className={`font-display leading-none ${
                      i % 2 === 0 ? "text-white" : "text-black"
                    }`}
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`font-body text-base leading-relaxed max-w-2xl ${
                      i % 2 === 0 ? "text-white/60" : "text-black/60"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 5. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="bg-grey py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto mb-12">
          <h2
            className="font-display text-black leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            REAL STORIES FROM
            <br />
            EKUZO FAMILIES
          </h2>
        </div>
        <TestimonialsCarousel />
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 6. WHAT HAPPENS AFTER ════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
                What&apos;s Next
              </p>
              <h2
                className="font-display text-black leading-none mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                WHAT HAPPENS
                <br />
                AFTER EKUZO100
              </h2>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-8">
                EKUZO100 is an entry point, not a dead end. Students who enjoy their month can move into semester-long <strong className="text-black">EKUZO Teams</strong>, where they stay with consistent teammates, deepen skills, and compete throughout the season.
              </p>
              <p className="font-body text-black/60 text-base leading-relaxed mb-10">
                Families decide next steps after experiencing the program firsthand. No pressure, no automatic renewals.
              </p>
              <ModalButton modal="enroll" variant="red-filled" className="text-base px-8 py-4">
                Start with EKUZO100
              </ModalButton>
            </div>
            <div className="relative aspect-square overflow-hidden bg-grey">
              <Image
                src="/images/ekuzo100-after-section.png"
                alt="What happens after EKUZO100"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="bg-grey py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
            FAQ
          </p>
          <h2
            className="font-display text-black leading-none mb-14"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            COMMON
            <br />
            QUESTIONS
          </h2>
          <FAQAccordion items={ekuzo100FAQs} theme="light" />
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
