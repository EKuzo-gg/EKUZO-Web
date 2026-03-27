import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import OurApproachSection from "@/components/sections/OurApproachSection";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import TwoWaysSection from "@/components/sections/TwoWaysSection";
import ModalButton from "@/components/ui/ModalButton";
import Image from "next/image";

export const metadata = {
  title: "EKUZO Teams — Semester-Based Esports Program",
  description:
    "EKUZO Teams: a semester-based esports program structured like sports. Consistent teammates, coach-led practice, and a real competitive season.",
};

const seasonCards = [
  {
    title: "Semester-Based",
    desc: "Designed as a full team season, similar to traditional sports programs. 15 weeks of structured growth.",
  },
  {
    title: "Consistent Team",
    desc: "Players train with the same teammates over time, building real trust, accountability, and chemistry.",
  },
  {
    title: "Season Arc",
    desc: "Practices and scrimmages build toward a culminating end-of-season showcase — a real competitive event.",
  },
];

const sessionSteps = [
  {
    number: "1",
    title: "Learn",
    desc: "Coach introduces a team focus or skill for the session. Context-first, so players understand the why.",
  },
  {
    number: "2",
    title: "Practice",
    desc: "Players apply it through structured drills and team-based play. Reps with purpose.",
  },
  {
    number: "3",
    title: "Apply",
    desc: "Guided scrimmage scenarios reinforce communication and coordination under real game pressure.",
  },
  {
    number: "4",
    title: "Reflect",
    desc: "Coach-led discussion connects performance to improvement and team goals. The loop closes here.",
  },
];

const teamsFAQs = [
  {
    question: "How long is a semester season?",
    answer:
      "Each EKUZO Teams season runs approximately 15 weeks, following the school calendar. Fall and spring seasons are available depending on your school or region.",
  },
  {
    question: "How many sessions per week?",
    answer:
      "Typically 2–3 sessions per week. School-based teams practice during or after school. Home-based teams practice in the evenings on a schedule that works for the family.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Students are grouped in increments of ~5 to create balanced teams. We prioritize local cohorts and skill-level matching. A preference for local players means friendships can extend beyond the screen.",
  },
  {
    question: "What's the difference between School and Home tracks?",
    answer:
      "Both tracks deliver the same EKUZO coaching system. The School track is run in partnership with a school (often during or after school hours). The Home track is for families who want to participate independently, with sessions scheduled in evenings.",
  },
  {
    question: "What comes after EKUZO Teams?",
    answer:
      "Students can re-enroll each semester. As relationships and skill deepen, teams often continue together across multiple seasons. Some families also use EKUZO Camps during summer breaks to maintain momentum.",
  },
];

export default function EkuzoTeamsPage() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative bg-white overflow-hidden"
        style={{ paddingTop: "188px", paddingBottom: "144px" }}
      >
        {/* Decorative right bg image */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none">
          <Image
            src="/images/ekuzoteams-hero-right-bg.png"
            alt=""
            fill
            className="object-cover object-left opacity-30"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-[1232px] mx-auto relative" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-6">
                Semester-Based Program
              </p>
              <h1
                className="font-display text-black leading-none mb-6"
                style={{ fontSize: "clamp(4.5rem, 11vw, 10rem)" }}
              >
                EKUZO
                <br />
                TEAMS
              </h1>
              <p
                className="font-body text-black/70 font-medium mb-10 max-w-md leading-relaxed"
                style={{ fontSize: "clamp(1.125rem, 2vw, 1.375rem)" }}
              >
                The semester-based team seasons: structured like sports, built through practice.
              </p>
              <ModalButton modal="enroll" variant="red-filled" className="text-base px-8 py-4">
                Enroll My Gamer
              </ModalButton>
            </div>

            {/* Right: video */}
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/videos/ekuzo-teams-hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Bottom-left decorative */}
        <div className="absolute bottom-0 left-0 w-[500px] pointer-events-none" aria-hidden="true">
          <Image
            src="/images/ekuzoteams-hero-left-bottom.png"
            alt=""
            width={500}
            height={200}
            className="opacity-60"
          />
        </div>
      </section>

      {/* ══ 2. OUR APPROACH ══════════════════════════════════════════════════ */}
      <OurApproachSection
        heading="Teams Are Where Growth Compounds"
        listItems={["Structured season", "Consistent team", "Coach-led practice"]}
        body="EKUZO Teams mirror traditional sports seasons: the same teammates, a shared rhythm, and clear expectations over time. As relationships deepen, students stop just showing up and start taking ownership of their team, their role, and how they improve together. What starts in practice doesn't stay there. The friendships, collaboration, and confidence spill beyond sessions and into everyday life."
        bg="bg-grey"
      />

      <TornPaperDivider color="black" />

      {/* ══ 3. A REAL TEAM SEASON ════════════════════════════════════════════ */}
      <section className="bg-black py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
            The Season
          </p>
          <h2
            className="font-display text-white leading-none mb-14"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            A REAL TEAM
            <br />
            SEASON
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonCards.map((card, i) => (
              <div key={card.title} className="relative bg-white p-8 flex flex-col gap-4">
                <div className={`absolute top-0 left-0 w-full h-1 ${i === 0 ? "bg-red" : i === 1 ? "bg-white/30" : "bg-red"}`} />
                <h3 className="font-body font-bold text-black text-xl">{card.title}</h3>
                <p className="font-body text-black/60 text-base leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 4. SESSION STRUCTURE ══════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">

          {/* Intro card */}
          <div className="bg-grey p-10 md:p-14 mb-14">
            <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
              Session Structure
            </p>
            <h2
              className="font-display text-black leading-none mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              EVERY SESSION,
              <br />
              THE SAME LOOP
            </h2>
            <p className="font-body text-black/60 text-lg leading-relaxed max-w-2xl">
              Every EKUZO Team session follows the same intentional structure, whether it&apos;s hosted during or after the school day.
            </p>
          </div>

          {/* 4-step zigzag */}
          <div className="flex flex-col gap-6 mb-14">
            {sessionSteps.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row items-start gap-8 p-8 ${
                  i % 2 === 0 ? "bg-black text-white" : "bg-grey text-black"
                }`}
              >
                <div
                  className={`shrink-0 font-display leading-none ${
                    i % 2 === 0 ? "text-red" : "text-black/20"
                  }`}
                  style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
                >
                  {step.number}
                </div>
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

          {/* Red quote strip */}
          <div className="bg-red px-10 py-12">
            <blockquote
              className="font-display text-white leading-tight max-w-3xl"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              &ldquo;Teams work toward shared goals through recurring competition, with the season culminating in a showcase that brings everything together.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ══ 5. TWO WAYS TO PARTICIPATE ═══════════════════════════════════════ */}
      <TwoWaysSection />

      <TornPaperDivider color="black" />

      {/* ══ 6. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 7. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]">
        <div className="max-w-[1232px] mx-auto mb-12" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
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

      {/* ══ 8. HOW TEAMS FIT ═════════════════════════════════════════════════ */}
      <section className="bg-grey py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
                The EKUZO System
              </p>
              <h2
                className="font-display text-black leading-none mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                HOW TEAMS FIT
                <br />
                INTO THE SYSTEM
              </h2>
            </div>
            <div>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-6">
                Many students begin with EKUZO100 to experience the system with low commitment. Teams are where most students stay: building habits, relationships, and confidence over time.
              </p>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-10">
                Camps offer short, focused bursts that supplement or accelerate growth. Families decide next steps after experiencing the program firsthand.
              </p>
              {/* Program progression */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "EKUZO100", desc: "4-week intro · $100 · no commitment", href: "/ekuzo100", current: false },
                  { label: "EKUZO Teams", desc: "Semester program · consistent team · season arc", href: "#", current: true },
                  { label: "EKUZO Camps", desc: "1-week intensive · summer & breaks", href: "/ekuzo-camps", current: false },
                ].map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    className={`flex items-center justify-between p-5 border-2 transition-colors ${
                      p.current
                        ? "border-red bg-red text-white pointer-events-none"
                        : "border-black/15 bg-white text-black hover:border-black"
                    }`}
                  >
                    <div>
                      <span className={`font-body font-bold text-base block ${p.current ? "text-white" : "text-black"}`}>
                        {p.label}
                      </span>
                      <span className={`font-body text-sm ${p.current ? "text-white/70" : "text-black/50"}`}>
                        {p.desc}
                      </span>
                    </div>
                    {p.current && (
                      <span className="font-body text-xs font-bold text-white bg-white/20 px-2 py-1 uppercase tracking-wider">
                        You&apos;re here
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 9. FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
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
          <FAQAccordion items={teamsFAQs} theme="light" />
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
