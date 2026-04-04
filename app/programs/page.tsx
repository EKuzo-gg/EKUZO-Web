import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import TwoWaysSection from "@/components/sections/TwoWaysSection";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import ProgramsHeroRive from "@/components/sections/ProgramsHeroRive";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
import ModalButton from "@/components/ui/ModalButton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs — EKUZO",
  description:
    "Three esports programs for young gamers: EKUZO Teams (semester-based), EKUZO100 (4-week intro), and Camps (seasonal intensives). Find your fit.",
  openGraph: {
    title: "EKUZO Programs | Esports for Young Gamers",
    description: "Explore EKUZO Teams, EKUZO100, and seasonal Camps — structured esports programs with elite coaching.",
    url: "https://ekuzo.gg/programs",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO Programs - Esports Coaching Options",
      },
    ],
  },
};

const programsFAQs = [
  {
    question: "What programs does EKUZO offer?",
    answer:
      "EKUZO offers three programs: EKUZOTEAMS (semester-based, 15 weeks of coached team play), EKUZO100 (a 4-week competitive bootcamp), and EKUZOCAMPS (1-week intensive sessions during summer and holiday breaks). Each is built on the same coaching system with a different format and commitment level.",
  },
  {
    question: "What is EKUZO100?",
    answer:
      "EKUZO100 is a 4-week competitive bootcamp: two sessions per week in small groups of five. It\u2019s designed to give students a real taste of structured esports coaching \u2014 whether they\u2019re brand new or looking to sharpen their game.",
  },
  {
    question: "When are practices held?",
    answer:
      "EKUZO100: Two evenings per week, after school. EKUZOTEAMS: 2\u20133 sessions per week during or after school. EKUZOCAMPS: Daily sessions during summer or holiday breaks. All sessions are approximately 90 minutes.",
  },
  {
    question: "What age range is EKUZO for?",
    answer:
      "EKUZO programs are designed for students aged 10\u201318. We group players by age and skill level to ensure the best experience for everyone.",
  },
  {
    question: "Can homeschool families participate?",
    answer:
      "Yes. Homeschoolers can enroll in any EKUZO program \u2014 EKUZO100, EKUZOTEAMS (Home track), or EKUZOCAMPS. All sessions are held online.",
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* ══ 1. HERO — Red bg, full-bleed Rive animation ═════════════════════ */}
      <div className="relative overflow-visible">
        <section
          className="relative bg-red overflow-clip"
          style={{ minHeight: "clamp(560px, 150vw, 100vh)" }}
        >
          {/* Nav */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Nav variant="dark" />
          </div>

          {/* Rive animation */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div className="h-full shrink-0 w-[125%] lg:w-full">
              <ProgramsHeroRive />
            </div>
          </div>
        </section>
        {/* Red torn paper at bottom — overlaps into approach section */}
        <TornPaperDivider color="red" variant="bottom" style={1} />
      </div>

      {/* ══ 2. OUR APPROACH ══════════════════════════════════════════════════ */}
      <OurApproachSection
        heading="Built for growth, on and off the screen"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        icons={["/icons/swords-white.svg", "/icons/clock-white.svg", "/icons/growth-arrows.svg"]}
        body="Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."
        bg="bg-white"
        tornPaper="none"
      />

      {/* ══ 3. PROGRAMS CARDS ════════════════════════════════════════════════ */}
      <ProgramsSection showTeams showEkuzo100 showCamps />

      {/* ══ 4. TWO WAYS (SCHOOL | HOME) ══════════════════════════════════════ */}
      <TwoWaysSection />

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

      {/* ══ 6. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section
        className="bg-white relative"
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
            Real stories from<br />EKUZO families
          </h4>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ══ 7. FAQ — black bg, dark theme ════════════════════════════════════ */}
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
              <FAQAccordion items={programsFAQs} theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 8. FOOTER BANNER & FOOTER ═══════════════════════════════════════ */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />

    </>
  );
}
