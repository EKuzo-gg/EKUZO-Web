import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import AutoScrollCards from "@/components/ui/AutoScrollCards";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
import CircleIcon from "@/components/ui/CircleIcon";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import ModalButton from "@/components/ui/ModalButton";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQPageSchema } from "@/lib/schema";

import type { Metadata } from "next";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "For Families", path: "/parents" },
]);

export const metadata: Metadata = {
  alternates: { canonical: "/parents" },
  title: "For Families — EKUZO",
  description:
    "How EKUZO supports families: safe, structured esports programs that build confidence, teamwork, and life skills in young gamers.",
  openGraph: {
    title: "For Families | Safe Esports Programs | EKUZO",
    description: "Learn how EKUZO builds confidence and growth in young gamers through structured, coached esports programs.",
    url: "https://ekuzo.gg/parents",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO for Families - Youth Esports Coaching",
      },
    ],
  },
};

const parentsFAQs = [
  {
    question: "How do you keep online spaces safe?",
    answer:
      "EKUZO operates as a \u201cwalled garden\u201d designed around the four safety concerns parents raise most: strangers, toxic chat, older kids, and in-game spending. Every session is coach-led and recorded, and our Discord and online platforms are actively moderated. Teams are verified, so your child plays with the same known teammates, not anonymous matchmaking, and opponents are limited to other youth in the EKUZO ecosystem, not random adults or older teens. Every student signs a Code of Conduct that\u2019s consistently enforced, and there are no in-session purchase prompts, loot boxes, or pressure to spend.",
  },
  {
    question: "Is gaming really educational?",
    answer:
      "Yes \u2014 when it\u2019s structured. EKUZO uses gaming as the medium to develop communication, leadership, resilience, and strategic thinking. These are the same skills coaches in traditional sports spend years trying to teach.",
  },
  {
    question: "Isn\u2019t this just more screen time?",
    answer:
      "It\u2019s structured screen time that replaces the unproductive kind, not added on top of it. 86% of parents are already managing screen time and many feel they\u2019re losing the battle; the issue usually isn\u2019t the number of hours, it\u2019s whether those hours produce anything. EKUZO sessions are finite (90 minutes, coach-led, skill-building), and many parents report fewer transition fights at home because their child\u2019s \u201cgaming need\u201d is being met productively.",
  },
  {
    question: "What if my child has never played competitively, or is shy?",
    answer:
      "That\u2019s exactly who EKUZO is built for. Our coaches meet students where they are, from total beginners to aspiring competitors, and teams are balanced by age and skill level. Many of our strongest parent testimonials come from families whose kids weren\u2019t \u201cgamer kids\u201d at all \u2014 they were kids who needed a team. EKUZO100, our 4-week program, is the lowest-pressure way to start.",
  },
  {
    question: "What outcomes should I expect?",
    answer:
      "Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and new curiosity about STEAM projects and careers. Research on structured school esports backs this up: participants averaged 7.3 more school days per year, 33.5% lower absence rates, and a +0.11 GPA increase during the active season, and 52.1% reported significant life-skills development.",
  },
  {
    question: "How does this help with school?",
    answer:
      "The mechanism is belonging. About 90% of middle-school esports participants aren\u2019t in any other school extracurricular, so for many kids EKUZO is their first real connection at school, which correlates with the attendance and GPA gains above. On top of that, students build focus, discipline, time management, and collaboration that carry directly into academics. Our coaching method is built on established learning science.",
  },
  {
    question: "Do I need to be a gamer to support my child?",
    answer:
      "No. The most useful thing a parent brings isn\u2019t controller skill, it\u2019s interest. EKUZO is designed for parents who don\u2019t play: we translate each session into plain terms \u2014 what your child did well, where they struggled, how they communicated \u2014 so you can have the conversation at dinner without learning the game. Curiosity matters far more than skill.",
  },
  {
    question: "What equipment does my child need?",
    answer:
      "A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and doesn\u2019t require high-end hardware.",
  },
  {
    question: "What about college or careers?",
    answer:
      "EKUZO builds professional skills \u2014 leadership, resilience, communication \u2014 and exposes students to esports, game design, broadcasting, and tech pathways. Collegiate esports scholarships now total over $15 million annually across hundreds of programs, and a majority of esports players go on to pick STEM careers. We treat these as bonuses, not the pitch: the core value is the transferable skills, whatever path your child takes.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Click \u2018Enroll my gamer\u2019 on any page to see the available programs. EKUZOCAMPS are open for summer registration now. EKUZOTEAMS enrolls each fall and spring semester. EKUZO100 is available year-round as a 4-week on-ramp.",
  },
];

const parentsFAQSchema = buildFAQPageSchema(parentsFAQs);

export default function ParentsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={parentsFAQSchema} />
      {/* ══ 1. HERO — white bg ══════════════════════════════════════════════ */}
      <section
        className="bg-white relative overflow-clip"
        style={{
          paddingTop: "clamp(160px, 20vw, 280px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="light-red" />
        </div>

        <div className="max-w-[1232px] mx-auto text-center">
          <h2
            className="font-display uppercase text-black leading-[0.85]"
            style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
          >
            Learn to Play.<br />Play to Learn.
          </h2>
        </div>

        {/* Hero collage — 105% width, cropped on sides */}
        <div className="relative mt-16 w-[105%] -ml-[2.5%] overflow-hidden">
          <Image
            src="/images/parents-hero.png"
            alt="EKUZO parents hero"
            width={1440}
            height={720}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </section>

      {/* ══ 2. OUR APPROACH — grey bg ════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <OurApproachSection
          heading="What is EKUZO?"
          listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
          icons={[
            "/icons/swords-white.svg",
            "/icons/clock-white.svg",
            "/icons/growth-arrows.svg",
          ]}
          body="It&rsquo;s natural for parents to feel tension around screen time, especially when it feels unstructured or hard to trust. EKUZO leans into what students already love and builds a complete, coach-led system around it. Think sports, designed specifically for&nbsp;gamers."
          bg="bg-[#f0edea]"
          tornPaper="none"
        />
      </div>

      {/* ══ 3. WHY PARENTS CHOOSE EKUZO — grey bg with zigzag cards ═════════ */}
      <section
        className="bg-[#f0edea] relative overflow-clip"
        style={{
          paddingTop: "clamp(80px, 14vw, 144px)",
          paddingBottom: "clamp(120px, 18vw, 240px)",
        }}
      >
        {/* Full decorative background image */}
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
              Why parents choose EKUZO?
            </h4>
            <p
              className="font-body text-black/70 leading-[1.357]"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Parents choose EKUZO because it turns gaming from a solo activity
              into a team experience that feels structured, social, and
              purposeful. Instead of managing screen time, parents see their kids
              showing up, engaging with teammates, and growing through&nbsp;play.
            </p>
          </div>

          {/* Feature cards — zigzag with CircleIcon */}
          <div className="flex flex-col gap-8">
            {[
              {
                title: "Safe and structured",
                body: "Moderated spaces, trained coaches, and a positive culture.",
                icon: "/icons/camada.svg",
              },
              {
                title: "Motivating by design",
                body: "Students gain visible wins that build intrinsic motivation.",
                icon: "/icons/flash.svg",
              },
              {
                title: "Skills that last",
                body: "Communication, leadership, and resilience carry far beyond gaming.",
                icon: "/icons/skills.svg",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`flex ${i % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}
              >
                <div
                  className="bg-white w-full lg:w-[560px]"
                  style={{
                    borderRadius: "2px",
                    padding: "clamp(1.5rem, 4vw, 48px)",
                  }}
                >
                  <CircleIcon src={feature.icon} className="mb-5" />
                  <h5
                    className="font-body font-bold text-black leading-[1.2] mb-4"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
                  >
                    {feature.title}
                  </h5>
                  <p
                    className="font-body text-black/70 leading-[1.417]"
                    style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                  >
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. PROGRAMS ═════════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={1} />
      </div>
      <ProgramsSection showTeams showEkuzo100 showCamps />

      {/* ══ 5. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
          <div className="sticky top-0 h-screen">
            <EcosystemAnimation />
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ 6. WHAT PARENTS SEE — white bg, auto-scroll cards ═══════════════ */}
      <section
        className="bg-white relative"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
        }}
      >
        <div
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Header — centered */}
          <div className="flex flex-col gap-4 mb-12 items-center text-center">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h4
              className="font-body font-bold leading-[1] text-black"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              What parents see in their&nbsp;kids
            </h4>
          </div>

          {/* Cards — auto-scrolling on desktop, stacked on mobile */}
          <AutoScrollCards
            cardBg="#EFEEEF"
            speed={30}
            cards={[
              { title: "Growing confidence", body: "Kids speak up more, try harder things, and recover faster from setbacks.", icon: "/icons/confidence.svg" },
              { title: "Better communication", body: "Team play translates into clearer communication at home and at school.", icon: "/icons/chat.svg" },
              { title: "Motivation that sticks", body: "Parents notice fewer battles around participation.", icon: "/icons/flame.svg" },
              { title: "Real connections", body: "Kids talk about teammates by name and start looking forward to showing up.", icon: "/icons/heart.svg" },
            ]}
          />
        </div>
      </section>

      {/* ══ 7. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "clamp(80px, 10vw, 144px)",
          paddingBottom: "clamp(80px, 10vw, 144px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1120px] mx-auto">
          <h4
            className="font-body font-bold text-black leading-[1] mb-16 text-center"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            What parents are&nbsp;saying
          </h4>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ══ 8. BLOG SECTION — full-width feature card ═══════════════════════ */}
      <section
        className="bg-white"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          {/* Section header */}
          <div className="flex flex-col gap-4 mb-12 items-start">
            <Eyebrow>BLOG</Eyebrow>
            <h4
              className="font-body font-bold text-black leading-[1]"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              Stories of Growth and&nbsp;Gaming
            </h4>
            <p
              className="font-body text-black/70 leading-[1.417] max-w-[540px]"
              style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
            >
              Explore how esports becomes a tool for learning, connection, and&nbsp;purpose.
            </p>
          </div>

          {/* Feature blog card — full-width image with overlay */}
          <Link
            href="/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng"
            className="block relative overflow-hidden group"
            style={{
              height: "clamp(320px, 35vw, 500px)",
              clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
            }}
          >
            <Image
              src="/images/parents-blog-feature.jpg"
              alt="Blog feature: Our Family's Esports Journey"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12 max-w-[600px]">
              <h5
                className="font-body font-bold text-white leading-[1.2] mb-3"
                style={{ fontSize: "clamp(1.5rem, 3vw, 40px)" }}
              >
                Our Family&apos;s Esports Journey with EKUZO and the&nbsp;K1ng
              </h5>
              <p
                className="font-body text-white/70 leading-[1.417] hidden md:block"
                style={{ fontSize: "clamp(1rem, 1.5vw, 20px)" }}
              >
                My son Ryan was always a happy kid in his early years. See how EKUZO changed everything.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ══ 9. FAQ — black bg, dark theme ════════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 14vw, 188px)",
            paddingBottom: "clamp(80px, 14vw, 188px)",
            paddingLeft: "clamp(1rem, 7.2vw, 104px)",
            paddingRight: "clamp(1rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[120px]">
            <div className="lg:max-w-[388px] lg:w-[388px] shrink-0">
              <div className="mb-4">
                <Eyebrow>FAQ</Eyebrow>
              </div>
              <h4
                className="font-body font-bold text-white leading-[1]"
                style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
              >
                Frequently asked questions
              </h4>
            </div>
            <div className="flex-1">
              <FAQAccordion items={parentsFAQs} theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 10. FOOTER BANNER & FOOTER ══════════════════════════════════════ */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />

    </>
  );
}
