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
import Eyebrow from "@/components/ui/Eyebrow";
import Image from "next/image";
import TrackPageView from "@/components/analytics/TrackPageView";
import JsonLd from "@/components/JsonLd";
import { ekuzoTeamsCourseSchema, buildBreadcrumbSchema, buildFAQPageSchema } from "@/lib/schema";

export const metadata = {
  alternates: { canonical: "/programs/ekuzo-teams" },
  title: "EKUZO Teams — Semester-Based Esports Program",
  description:
    "EKUZO Teams: a semester-based esports program structured like sports. Consistent teammates, coach-led practice, and a real competitive season.",
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Programs", path: "/programs" },
  { name: "EKUZO Teams", path: "/programs/ekuzo-teams" },
]);

const seasonCards = [
  {
    title: "Semester-Based",
    desc: "Designed as a full team season, similar to traditional sports programs. 15 weeks of structured growth.",
    icon: "/icons/calendar.svg",
  },
  {
    title: "Consistent Team",
    desc: "Players train with the same teammates over time, building real trust, accountability, and chemistry.",
    icon: "/icons/team.svg",
  },
  {
    title: "Season Arc",
    desc: "Practices and scrimmages build toward a culminating end-of-season showcase — a real competitive event.",
    icon: "/icons/trophy.svg",
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
    question:
      "How do you keep online spaces safe? What about strangers, toxic chat, older kids, or spending traps?",
    answer:
      "EKUZO operates as a \u201cwalled garden\u201d specifically designed to answer the four most common parent safety concerns: strangers, toxic chat, older kids, and in-game spending traps. Every session is coach-led and recorded. Our Discord and online platforms are actively moderated. Teams are verified, meaning your child plays with the same known teammates, not anonymous matchmaking. Opponents are limited to other youth participants in the same ecosystem, so your child is not randomly matched against unknown adults or older teens. Students sign a Code of Conduct, and expectations are clearly and consistently enforced. There are no in-session monetization prompts, loot boxes, or pressure to spend.",
  },
  {
    question:
      "Is this only for competitive students, or can a beginner join a full season?",
    answer:
      "EKUZO Teams is built for any student who games, from casual to competitive; the focus is growth, not rank. Coaches meet students where they are, and teams are balanced by age and skill level, so a full season is plenty of time for a newer player to develop. If your gamer is brand new or hesitant, EKUZO100 (our 4-week program) is the lowest-pressure way to start before committing to a season.",
  },
  {
    question: "Do we have to commit to a full season, or can we try first?",
    answer:
      "You can try first. EKUZO100 is a 4-week program designed as the low-risk on-ramp: the same coaching system in small groups, with no semester commitment. Many families start there, then move into EKUZO Teams for a full season once their gamer is hooked. There\u2019s no automatic renewal between seasons; your family decides each time.",
  },
  {
    question: "How much does EKUZOTEAMS cost?",
    answer:
      "$576 paid in full (a 10% discount), or four monthly payments of $160 ($640 total). Like all EKUZO programs, that works out to roughly $20 per session of small-group, coach-led training. The price covers the full system behind the sessions: elite coach training, moderated team spaces, curriculum design, and competition infrastructure.",
  },
  {
    question: "How long is a season, and how many sessions per week?",
    answer:
      "Each EKUZO Teams season runs about 15 to 16 weeks, following the school calendar (exact length varies by season and region). The default is two 90-minute sessions per week. Home-track teams always run two 90-minute sessions; some school-based teams opt for three 60-minute sessions to fit their schedule. Home teams practice after school (around 4:00\u20135:30) or in the evening (around 7:00\u20138:30).",
  },
  {
    question: "What\u2019s the difference between School and Home tracks?",
    answer:
      "Both tracks deliver the same EKUZO coaching system. The School track runs in partnership with a school, often during or after school hours with a proctor present. The Home track is for families who want to participate independently, with sessions scheduled after school or in the evening.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Rosters are 10 to 12 players to support 5v5 match play. We balance teams by age and skill level and prioritize local cohorts when possible, so friendships can extend beyond the screen.",
  },
  {
    question: "What equipment does my child need?",
    answer:
      "A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and does not require high-end hardware.",
  },
  {
    question: "What comes after a season?",
    answer:
      "Students re-enroll each semester, and as relationships and skills deepen, teams often continue together across multiple seasons. There\u2019s no automatic renewal; your family decides each time. Some families also use EKUZO Camps during breaks to keep momentum between seasons.",
  },
];

const teamsFAQSchema = buildFAQPageSchema(teamsFAQs);

export default function EkuzoTeamsPage() {
  return (
    <>
      <JsonLd data={ekuzoTeamsCourseSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={teamsFAQSchema} />
      <TrackPageView program="ekuzo-teams" />
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
            src="/images/smoke-1@2x.webp"
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
            src="/images/smoke-2@2x.webp"
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
              <Eyebrow>SEMESTER-BASED PROGRAM</Eyebrow>
            </div>
            <h1
              className="font-display leading-[0.85] mb-6"
              style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
            >
              <span className="text-black">EKUZO</span>
              <br />
              <span className="text-red">TEAMS</span>
            </h1>
            <p
              className="font-body text-black font-medium mb-3 max-w-md"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", letterSpacing: "-0.02em" }}
            >
              Structured Like Sports. Built Through Practice.
            </p>
            <p className="font-body text-black/70 text-base mb-10 max-w-md leading-relaxed">
              The semester-based team season where growth compounds.
            </p>
            <a
              href="/programs/ekuzo-teams/register"
              className="inline-flex items-center justify-center font-body font-bold text-white bg-red rounded px-8 py-4 text-base hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150"
            >
              Enroll my gamer
            </a>
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
              src="/videos/ekuzo-teams-hero.mp4"
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
          heading="Teams Are Where Growth Compounds"
          listItems={["Structured season", "Consistent team", "Coach-led practice"]}
          icons={["/icons/swords-white.svg", "/icons/confidence-2.svg", "/icons/speaking.svg"]}
          body={<>
            <p>EKUZO Teams mirror traditional sports seasons: the same teammates, a shared rhythm, and clear expectations over time. As relationships deepen, students stop just showing up and start taking ownership of their team, their role, and how they improve together.</p>
            <p>What starts in practice doesn&apos;t stay there. The friendships, collaboration, and confidence spill beyond sessions and into everyday life.</p>
          </>}
          tornPaper="none"
        />
      </div>

      {/* ══ 3. ONE SEMESTER. ONE TEAM. ═════════════════════════════════════════ */}
      <section
        className="relative bg-black overflow-visible"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="black" variant="top" style={1} />
        <TornPaperDivider color="black" variant="bottom" style={1} />
        <div className="max-w-[1232px] mx-auto">
          <div className="mb-4">
            <Eyebrow>THE SEASON</Eyebrow>
          </div>
          <h2
            className="font-display text-white leading-[0.85] mb-14"
            style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
          >
            ONE SEMESTER. ONE TEAM.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonCards.map((card) => (
              <div
                key={card.title}
                className="relative bg-white p-8 flex flex-col gap-4"
                style={{
                  clipPath:
                    "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                }}
              >
                <Image
                  src={card.icon}
                  alt=""
                  width={40}
                  height={40}
                  aria-hidden="true"
                />
                <h3 className="font-body font-bold text-black text-xl">{card.title}</h3>
                <p className="font-body text-black/60 text-base leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. SESSION STRUCTURE ══════════════════════════════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">

          {/* Intro card */}
          <div className="bg-grey p-10 md:p-14 mb-14">
            <div className="mb-4">
              <Eyebrow>SESSION STRUCTURE</Eyebrow>
            </div>
            <h2
              className="font-display text-black leading-[0.85] mb-6"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              EVERY SESSION, THE SAME LOOP.
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

          {/* Red quote strip */}
          <div
            className="bg-red px-10 py-12 flex items-start gap-6"
            style={{
              clipPath:
                "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
            }}
          >
            <Image
              src="/images/testimonial-quote-mark.png"
              alt=""
              width={56}
              height={50}
              className="shrink-0 mt-1 brightness-0 invert"
              aria-hidden="true"
            />
            <blockquote
              className="font-body font-bold text-white leading-snug max-w-3xl"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
            >
              Teams work toward shared goals through recurring competition, with the season culminating in a showcase that brings everything together.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ══ 5. TWO WAYS TO PARTICIPATE ═══════════════════════════════════════ */}
      <TwoWaysSection />

      {/* ══ 6. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section className="bg-grey overflow-clip" style={{ height: "360vh" }}>
          <div className="sticky top-0 h-screen">
            <EcosystemAnimation />
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ 7. TESTIMONIALS — homepage module ════════════════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "144px",
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

      {/* ══ 8. HOW TEAMS FIT ═════════════════════════════════════════════════ */}
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
          <div className="mb-4">
            <Eyebrow>THE EKUZO SYSTEM</Eyebrow>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="font-display text-black leading-[0.85] mb-6"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                HOW TEAMS FIT
                <br />
                INTO THE SYSTEM
              </h2>
              <p className="font-body text-black/70 text-lg leading-relaxed mb-6">
                Many students begin with EKUZO100 to experience the system with low commitment. Teams are where most students stay: building habits, relationships, and confidence over time.
              </p>
              <p className="font-body text-black/70 text-lg leading-relaxed">
                Camps offer short, focused bursts that supplement or accelerate growth. Families decide next steps after experiencing the program firsthand.
              </p>
            </div>
            <div>
              {/* Program progression */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "EKUZO100", desc: "4-week intro · $100 · no commitment", href: "/programs/ekuzo100", current: false },
                  { label: "EKUZO Teams", desc: "Semester program · consistent team · season arc", href: "#", current: true },
                  { label: "EKUZO Camps", desc: "1-week intensive · summer & breaks", href: "/programs/ekuzo-camps", current: false },
                ].map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    className={`flex items-center justify-between p-6 border-2 transition-colors ${
                      p.current
                        ? "border-red bg-red text-white pointer-events-none"
                        : "border-black/15 bg-white text-black hover:border-red"
                    }`}
                  >
                    <div>
                      <span className={`font-body font-bold text-xl block ${p.current ? "text-white" : "text-black"}`}>
                        {p.label}
                      </span>
                      <span className={`font-body text-base ${p.current ? "text-white/70" : "text-black/70"}`}>
                        {p.desc}
                      </span>
                    </div>
                    {p.current && (
                      <span className="font-body text-sm font-bold text-white bg-white/20 px-3 py-1.5 uppercase tracking-wider">
                        You&apos;re here
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <TornPaperDivider color="grey" variant="bottom" style={2} />
      </section>

      {/* ══ 9. FAQ — black theme ═════════════════════════════════════════════ */}
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
          <FAQAccordion items={teamsFAQs} theme="dark" />
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
