import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import OurApproachSection from "@/components/sections/OurApproachSection";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import TrackedRegisterLink from "@/components/ui/TrackedRegisterLink";
import Eyebrow from "@/components/ui/Eyebrow";
import Image from "next/image";
import TrackPageView from "@/components/analytics/TrackPageView";
import JsonLd from "@/components/JsonLd";
import { ekuzo100CourseSchema, buildBreadcrumbSchema, buildFAQPageSchema } from "@/lib/schema";

export const metadata = {
  alternates: { canonical: "/programs/ekuzo100" },
  title: "EKUZO100: 4-Week Intro Program",
  description:
    "One month. $100. Your first team. EKUZO100 is the low-risk way to start with EKUZO: real coaching, real teammates, real growth.",
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Programs", path: "/programs" },
  { name: "EKUZO100", path: "/programs/ekuzo100" },
]);

const howItWorksSteps = [
  {
    number: "1",
    title: "Join",
    desc: "Sessions are Tuesdays & Thursdays, 7:00–8:30 PM local. You're placed on a team of ~5 players at a similar level.",
  },
  {
    number: "2",
    title: "Practice",
    desc: "90-minute sessions, twice a week. Learn with your coach, alongside your team: structured drills, not just playing games.",
  },
  {
    number: "3",
    title: "Compete",
    desc: "Apply everything through scrimmages and intra-league competitions. Real stakes, real teamwork under pressure.",
  },
  {
    number: "4",
    title: "Progress",
    desc: "Reflect on growth with your coach at the end of the month. Then decide what comes next: no pressure, no contracts.",
  },
];

// Answers pulled from knowledge-base/wiki/domains/ekuzo/ekuzo-faq-canon.md
// (2026-05-25 sync). Verbatim-ish: internal [[wikilinks]] stripped, copy
// trimmed only where the canon paragraph addresses multiple programs and
// this page is e100-specific. Order is conversion-first (1-5) -> LLM
// long-tail (6-9) per Jamie 2026-05-25.
//
// Wired into JSON-LD via buildFAQPageSchema below so each Q/A pair is
// citable by AI search. If you edit copy here, update the canon doc
// first so both stay in sync.
const ekuzo100FAQs = [
  {
    question:
      "How do you keep online spaces safe? What about strangers, toxic chat, older kids, or spending traps?",
    answer:
      "EKUZO operates as a \u201cwalled garden\u201d specifically designed to answer the four most common parent safety concerns: strangers, toxic chat, older kids, and in-game spending traps. Every session is coach-led and recorded. Our Discord and online platforms are actively moderated. Teams are verified, meaning your child plays with the same known teammates, not anonymous matchmaking. Opponents are limited to other youth participants in the same ecosystem, so your child is not randomly matched against unknown adults or older teens. Students sign a Code of Conduct, and expectations are clear and consistently enforced. There are no in-session monetization prompts, loot boxes, or pressure to spend. This is a fundamentally different environment than the open lobbies of Fortnite, Roblox, or matchmade League play.",
  },
  {
    question:
      "My child is a beginner, shy, or not competitive. Is this right for them?",
    answer:
      "EKUZO is explicitly built for the shy kid, the beginner, the child who did not fit into traditional youth sports, and the child who is still figuring out whether they even want to be part of a team. Our coaches meet students where they are. Teams are age- and skill-balanced, and most of our strongest testimonials come from parents whose children were not \u201cgamer kids\u201d before starting, they were kids who needed a team and happened to find one through gaming. If your child is new or hesitant, they are exactly who our programs are designed for. EKUZO100 (four weeks, small groups) is the lowest-pressure on-ramp we offer.",
  },
  {
    question: "What equipment does my child need?",
    answer:
      "A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and does not require high-end hardware.",
  },
  {
    question: "When are sessions, and what if we miss one?",
    answer:
      "EKUZO100 runs Tuesdays and Thursdays, 7:00\u20138:30 PM local time: 8 sessions across the 4-week cohort, 90 minutes each. Sessions are live and coach-led, and there's no async catch-up: what makes EKUZO work is your gamer playing alongside the same teammates each week. We ask families to plan for at least 6 of the 8 sessions so the team isn't short. If you know about a conflict ahead of time, leave a note in the \"Additional information\" field at registration and we'll work with you.",
  },
  {
    question: "How much is EKUZO100, and is there any commitment?",
    answer:
      "EKUZO100 is $100 for the full 4-week program, roughly $12.50 per session of small-group, coach-led instruction. There's no contract and no automatic renewal. After 4 weeks your family decides whether to move into EKUZO Teams for a full semester or stop.",
  },
  {
    question: "Can homeschool families participate?",
    answer:
      "Yes. EKUZO100 is open to homeschool families. All sessions are held online, so your student can join from anywhere with a computer and internet connection. Homeschool families can also enroll in EKUZO Teams (Home track) or EKUZO Camps when those programs run.",
  },
  {
    question: "How does this help with school?",
    answer:
      "Research on structured school esports programs documents specific outcomes: students averaged 7.3 more school days per year, absence rates 33.5% lower than non-participants, and mean GPA increases of +0.11 during the active season. The mechanism is belonging. Approximately 90% of middle school esports participants are not involved in any other school-sponsored extracurricular, so for many students EKUZO is their first real connection at school, which correlates with the attendance and GPA gains. Students also develop focus, discipline, time management, and collaboration skills that carry directly into academics.",
  },
  {
    question: "What happens after EKUZO100?",
    answer:
      "Students who enjoy the program can move into EKUZO Teams: a semester-long program with consistent teammates, deeper skill development, and a full competitive season. There's no automatic renewal. Your family decides.",
  },
  {
    question: "What about college or careers?",
    answer:
      "EKUZO builds professional skills (leadership, resilience, communication) and provides exposure to esports, game design, broadcasting, and tech pathways. Collegiate esports scholarships now total over $15 million annually across hundreds of university programs, and over 65% of esports players pick STEM careers. The skills students develop through coached team play, team communication, strategic analysis, resilience through losses, time management, translate directly to college applications and professional careers.",
  },
];

const ekuzo100FAQSchema = buildFAQPageSchema(ekuzo100FAQs);

export default function Ekuzo100Page() {
  return (
    <>
      <JsonLd data={ekuzo100CourseSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={ekuzo100FAQSchema} />
      <TrackPageView program="ekuzo100" />
      {/* ══ 1. HERO — methodology template ═══════════════════════════════════ */}
      <section
        className="bg-white relative overflow-visible"
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

        {/* Smoke decoration — right side, full section height, extends behind nav */}
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
            <div className="mb-6">
              <Eyebrow>4-WEEK INTRO PROGRAM</Eyebrow>
            </div>
            <h1
              className="font-display leading-[0.85] mb-6"
              style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
            >
              <span className="text-black">EKUZO</span>
              <br />
              <span className="text-red">100</span>
            </h1>
            <p
              className="font-body text-black font-medium mb-3 max-w-md"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", letterSpacing: "-0.02em" }}
            >
              One Month. $100. Your First Team.
            </p>
            <p className="font-body text-black/70 text-base mb-10 max-w-md leading-relaxed">
              The low-risk way to start with EKUZO.
            </p>
            <TrackedRegisterLink
              source="hero"
              href="/programs/ekuzo100/register?cta=hero"
              className="inline-flex items-center justify-center rounded-sm text-base font-bold font-body transition-all duration-150 whitespace-nowrap cursor-pointer bg-red text-white border-2 border-red hover:opacity-90 px-8 py-4"
            >
              Enroll my gamer
            </TrackedRegisterLink>
          </div>

          {/* Right — video reel 9:16, 70vh tall */}
          <div
            className="relative mx-auto"
            style={{
              aspectRatio: "9/16",
              maxHeight: "70vh",
              width: "min(100%, calc(70vh * 9 / 16))",
            }}
          >
            <video
              src="/videos/ekuzo100-hero.mp4"
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: "2px" }}
            />
          </div>
        </div>
      </section>

      {/* ══ 2. OUR APPROACH ══════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={2} />
        <OurApproachSection
          heading="Built for growth, on and off the screen"
          listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
          icons={["/icons/swords-white.svg", "/icons/clock-white.svg", "/icons/camada-white.svg"]}
          body="Parents want to know if EKUZO is the right fit for their child. Students want a chance to prove themselves on a team. EKUZO100 makes it simple: one month, $100, no long-term commitment. The perfect entry point. Your student joins a team, trains with elite coaches, and competes in real matches in just four weeks."
          tornPaper="none"
        />
      </div>

      {/* ══ 3. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <section className="bg-grey overflow-clip" style={{ height: "360vh" }}>
          <div className="sticky top-0 h-screen">
            <EcosystemAnimation />
          </div>
        </section>
        <TornPaperDivider color="grey" variant="top" style={1} />
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ 4. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section
        className="relative bg-white overflow-visible"
        style={{
          paddingTop: "188px",
          paddingBottom: "72px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">

          {/* Large intro card */}
          <div className="bg-grey p-10 md:p-14 mb-16">
            <div className="mb-4">
              <Eyebrow>HOW IT WORKS</Eyebrow>
            </div>
            <h2
              className="font-display text-black leading-[0.85] mb-6"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              ONE MONTH. FOUR STEPS.
            </h2>
            <p className="font-body text-black/60 text-lg leading-relaxed max-w-2xl">
              Each EKUZO100 cohort follows the same one-month structure. Practices are 90 minutes, twice a week, designed to teach teamwork, focus, and growth through play.
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
                style={{
                  clipPath:
                    "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                }}
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
                    className={`font-display leading-[0.85] ${
                      i % 2 === 0 ? "text-white" : "text-black"
                    }`}
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`font-body text-base leading-relaxed max-w-2xl ${
                      i % 2 === 0 ? "text-white" : "text-black/60"
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

      {/* ══ 5. TESTIMONIALS — exact homepage module ══════════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "72px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1022px] mx-auto flex flex-col gap-[72px]">
          <h2
            className="font-body font-bold text-black leading-[1] text-center"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            What parents{" "}
            <br />
            are saying
          </h2>
          <TestimonialsCarousel />

          {/* Static featured quote */}
          <div className="flex flex-col items-center text-center gap-6 pt-8">
            <Image
              src="/images/testimonial-quote-mark.png"
              alt=""
              width={88}
              height={80}
              className="mb-4"
              aria-hidden="true"
            />
            <p
              className="font-body font-bold text-black leading-[1.357] max-w-[444px]"
              style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
            >
              &ldquo;It&apos;s structure, mentorship, and community all in one place.&rdquo;
            </p>
            <div className="flex flex-col">
              <p
                className="font-body font-medium text-black leading-[1.357]"
                style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
              >
                Rudy May
              </p>
              <p
                className="font-body text-black/60 leading-[1.417]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                EKUZO mom
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. WHAT HAPPENS AFTER ════════════════════════════════════════════ */}
      <section
        className="relative bg-grey overflow-visible"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="grey" variant="top" style={1} />
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-4">
                <Eyebrow>WHAT&apos;S NEXT</Eyebrow>
              </div>
              <h2
                className="font-display text-black leading-[0.85] mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                WHAT HAPPENS
                <br />
                AFTER EKUZO100
              </h2>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-8">
                EKUZO100 is an entry point, not a dead end. Students who enjoy their month can move into semester-long <strong className="text-black">EKUZO Teams</strong>, where they stay with consistent teammates, deepen skills, and compete throughout the season. Families decide next steps after experiencing the program firsthand.
              </p>
              <TrackedRegisterLink
                source="footer"
                href="/programs/ekuzo100/register?cta=footer"
                className="inline-flex items-center justify-center rounded-sm text-base font-bold font-body transition-all duration-150 whitespace-nowrap cursor-pointer bg-red text-white border-2 border-red hover:opacity-90 px-8 py-4"
              >
                Start with EKUZO100
              </TrackedRegisterLink>
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
        <TornPaperDivider color="grey" variant="bottom" style={2} />
      </section>

      {/* ══ 7. FAQ — black theme ═════════════════════════════════════════════ */}
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
          <div className="mb-14">
            <div className="mb-4">
              <Eyebrow>FAQ</Eyebrow>
            </div>
            <h2
              className="font-body font-bold text-white leading-[1]"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              Frequently asked questions
            </h2>
          </div>
          <FAQAccordion items={ekuzo100FAQs} theme="dark" />
        </div>
      </section>

      {/* FooterBanner auto-detects the program from the route, so the
          "Enroll my gamer" CTA routes direct to /programs/ekuzo100/register
          ?cta=footer instead of opening the cross-program picker modal.
          See lib/programRoutes.ts. */}
      <FooterBanner heading="Turning pedagogy into progress" />
      <Footer />
    </>
  );
}
