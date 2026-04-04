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

import type { Metadata } from "next";

export const metadata: Metadata = {
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
    question: "Is gaming really educational?",
    answer:
      "Yes \u2014 when it\u2019s structured. EKUZO uses gaming as the medium to develop communication, leadership, resilience, and strategic thinking. These are the same skills coaches in traditional sports spend years trying to teach.",
  },
  {
    question: "How do you keep online spaces safe?",
    answer:
      "All sessions are coach-led and recorded. Our Discord and online platforms are actively moderated. Coaches enforce community guidelines, and every student signs our Code of Conduct. Parents can always contact us with concerns.",
  },
  {
    question: "What if my child has never played competitively?",
    answer:
      "That\u2019s perfectly fine. EKUZO100 is a 4-week competitive bootcamp designed to meet students exactly where they are \u2014 beginner or experienced. Coaches build from there.",
  },
  {
    question: "What outcomes should I expect?",
    answer:
      "Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and curiosity about STEAM projects and career pathways.",
  },
  {
    question: "What equipment does my child need?",
    answer:
      "A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and doesn\u2019t require high-end hardware.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Click \u2018Enroll my gamer\u2019 on any page to see the available programs. EKUZOCAMPS are open for summer registration now. EKUZOTEAMS enrolls each fall and spring semester. EKUZO100 is available year-round as a 4-week on-ramp.",
  },
];

export default function ParentsPage() {
  return (
    <>
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
