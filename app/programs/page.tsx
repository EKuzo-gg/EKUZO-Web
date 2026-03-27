import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import TwoWaysSection from "@/components/sections/TwoWaysSection";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

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
      {/* 1. Hero — Red bg with "STRUCTURED LIKE SPORTS" + fist-bump image + brush strokes */}
      <section className="relative bg-red overflow-clip" style={{ paddingTop: "188px", paddingBottom: "360px" }}>
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="dark" />
        </div>

        {/* Headline: STRUCTURED LIKE SPORTS */}
        <div className="relative z-10 text-center px-6 md:px-[104px]">
          <h1
            className="font-display uppercase text-white leading-[0.8]"
            style={{ fontSize: "clamp(4rem, 14vw, 16rem)" }}
          >
            STRUCTURED<br />LIKE SPORTS
          </h1>
        </div>

        {/* Fist-bump kids image — centered, positioned absolutely */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-5 pointer-events-none"
          style={{ top: "50%", transform: "translate(-50%, -50%)", width: "400px", height: "320px" }}
          aria-hidden="true"
        >
          <Image
            src="/images/growth-fistbump.png"
            alt=""
            fill
            className="object-contain"
            sizes="400px"
          />
        </div>

        {/* Brush stroke — top left corner */}
        <div
          className="absolute z-5 pointer-events-none"
          style={{ top: "80px", left: "40px", width: "120px", height: "120px" }}
          aria-hidden="true"
        >
          <Image
            src="/images/brush-stroke-8.png"
            alt=""
            fill
            className="object-contain"
            sizes="120px"
          />
        </div>

        {/* Brush stroke — bottom right corner */}
        <div
          className="absolute z-5 pointer-events-none"
          style={{ bottom: "120px", right: "60px", width: "140px", height: "140px" }}
          aria-hidden="true"
        >
          <Image
            src="/images/brush-stroke-9.png"
            alt=""
            fill
            className="object-contain"
            sizes="140px"
          />
        </div>

        {/* White torn paper at bottom */}
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ bottom: "-1px", width: "100%", height: "120px", overflow: "hidden" }}
          aria-hidden="true"
        >
          <Image
            src="/images/torn-paper-white-1.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            style={{ objectPosition: "center top" }}
          />
        </div>
      </section>

      {/* Divider: red hero → white approach */}
      <TornPaperDivider color="red" />

      {/* 2. Our Approach */}
      <OurApproachSection
        heading="Built for growth, on and off the screen"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        body="Every EKUZO program is built on the same foundation. What changes is the format: when, where, and how students participate."
        bg="bg-white"
      />

      {/* 3. Programs cards */}
      <ProgramsSection showTeams showEkuzo100 showCamps />

      {/* 4. Two Ways section (SCHOOL | HOME) */}
      <TwoWaysSection />

      {/* 5. Ecosystem Animation */}
      <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      {/* Divider: ecosystem → testimonials */}
      <TornPaperDivider color="black" />

      {/* 6. Testimonials */}
      <section className="bg-white px-6 md:px-[104px]" style={{ paddingTop: "144px", paddingBottom: "144px" }}>
        <div className="max-w-[1232px] mx-auto">
          <h4
            className="font-body font-bold text-black leading-[1] mb-16"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Real stories from EKUZO families
          </h4>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-white px-6 md:px-[104px]" style={{ paddingTop: "144px", paddingBottom: "188px" }}>
        <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h4
              className="font-body font-bold text-black leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 28px)" }}
            >
              Common questions
            </h4>
          </div>
          <div className="flex-1">
            <FAQAccordion items={programsFAQs} theme="light" />
          </div>
        </div>
      </section>

      {/* 8. Footer Banner */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
