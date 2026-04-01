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

export const metadata = {
  title: "Programs — EKUZO",
  description:
    "Explore EKUZO's esports programs: Teams, Camps, and EKUZO100. Find the right programme for your young gamer.",
};

const programsFAQs = [
  {
    question: "What programs does EKUZO offer?",
    answer:
      "EKUZO offers three programs: EKUZOTEAMS (semester-based, 15 weeks), EKUZO100 (4-week intro), and EKUZO CAMPS (1-week intensive during breaks). Each is built on the same coaching system with a different format.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Students are grouped in increments of ~5 to create balanced teams, with a preference for local cohorts whenever possible.",
  },
  {
    question: "What is EKUZO100?",
    answer:
      "EKUZO100 is our entry program: four weeks, two practices per week. It's the easiest way to experience EKUZO and see if it's the right fit.",
  },
  {
    question: "When are practices held?",
    answer:
      "EKUZO100: Two evenings per week, after school. EKUZOTEAMS: 2–3 sessions per week during or after school. EKUZO CAMPS: Daily sessions during summer or holiday breaks.",
  },
  {
    question: "Can homeschool families participate?",
    answer:
      "Yes. Homeschoolers can enroll in EKUZO100, EKUZOTEAMS (home track), or EKUZO CAMPS.",
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* 1. Hero — Red bg, full-bleed Rive animation (autoplay), ~100vh */}
      <section
        className="relative bg-red overflow-hidden lg:overflow-visible"
        style={{ minHeight: "clamp(560px, 150vw, 100vh)" }}
      >
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="dark" />
        </div>

        {/* Rive animation — oversized on mobile for crop effect (matches Framer),
            full-bleed on desktop. On mobile the inner div is wider than the
            hero so the animation zooms in and overflow-hidden clips edges. */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="h-full shrink-0 w-[125%] lg:w-full">
            <ProgramsHeroRive />
          </div>
        </div>

        {/* White torn paper at bottom — background-image pattern, responsive heights per Framer */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(52%)",
            backgroundImage: "url(/images/torn-paper-white-1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
      </section>

      {/* 2. Our Approach */}
      <OurApproachSection
        heading="Built for growth, on and off the screen"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        icons={["/icons/swords-white.svg", "/icons/clock-white.svg", "/icons/growth-arrows.svg"]}
        body="Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."
        bg="bg-white"
      />

      {/* 3. Programs cards */}
      <ProgramsSection showTeams showEkuzo100 showCamps />

      {/* 4. Two Ways section (SCHOOL | HOME) */}
      <TwoWaysSection />

      {/* 5. Ecosystem Animation — Framer: bg light grey, 360vh, Black2 top + White2 bottom */}
      <section className="relative bg-grey overflow-visible" style={{ height: "360vh" }}>
        {/* Black torn paper at top */}
        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(-50%)",
            backgroundImage: "url(/images/torn-paper-black-1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />

        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>

        {/* White torn paper at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(50%)",
            backgroundImage: "url(/images/torn-paper-white-1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
      </section>

      {/* 6. Testimonials — Framer: max-width 1120px */}
      <section
        className="bg-white relative overflow-visible"
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

      {/* 7. FAQ — black background, Framer FaqSection pattern */}
      <section
        className="bg-black relative overflow-visible"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
          paddingLeft: "clamp(1rem, 7.2vw, 104px)",
          paddingRight: "clamp(1rem, 7.2vw, 104px)",
        }}
      >
        {/* Black torn paper at top */}
        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(-50%)",
            backgroundImage: "url(/images/torn-paper-black-1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1232px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[120px]">
          <div className="lg:max-w-[388px] lg:w-[388px] shrink-0">
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
      </section>

      {/* 8. Footer Banner */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
