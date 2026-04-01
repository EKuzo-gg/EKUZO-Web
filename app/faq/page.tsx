import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FooterBanner from "@/components/sections/FooterBanner";
import Eyebrow from "@/components/ui/Eyebrow";
import ModalButton from "@/components/ui/ModalButton";
import Image from "next/image";

export const metadata = {
  title: "FAQ — EKUZO",
  description: "Answers to your questions about EKUZO programmes, coaches, safety, scheduling, and more.",
};

// Section 2: Safety & Coaching
const safetyFAQs = [
  {
    question: "Who are the coaches?",
    answer:
      "All EKUZO coaches are top 1% collegiate esports athletes or former professional players. They are trained not just in gameplay, but in pedagogy, safety, and social-emotional growth.",
  },
  {
    question: "How do you keep online spaces safe?",
    answer:
      "Our Discord and online platforms are actively moderated. Coaches and staff enforce community guidelines, and every student signs our Code of Conduct. Parents can always contact us with concerns.",
  },
  {
    question: "Is this safe for beginners?",
    answer:
      "Yes. Coaches meet students where they are — from casual players to aspiring competitors — and ensure every team is inclusive and supportive.",
  },
];

// Section 3: Programs & Scheduling
const programsFAQs = [
  {
    question: "What is EKUZO100?",
    answer:
      "E100 is our entry program: one month, $100, two practices per week. It's the easiest way to see if Ekuzo is right for your child.",
  },
  {
    question: "When are practices held?",
    answer:
      "E100: Two evenings per week, after dinner, Mon–Wed or Tue–Thu. After-School: 2 afternoons/evenings per week during the semester. Minimesters: Daily 90-minute sessions for 4 days during breaks.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Students are grouped in increments of ~5 to create balanced teams, with a preference for local cohorts whenever possible.",
  },
  {
    question: "What are Camps?",
    answer:
      "Short, intensive 4-day programs during school breaks (winter or spring).",
  },
  {
    question: "What's the difference between After-School and School Teams?",
    answer:
      "After-School: Semester-based extracurricular, available online or as a club. School Teams: Offered during the school day, often for elective credit, with a proctor present.",
  },
];

// Section 4: Outcomes & Benefits
const outcomesFAQs = [
  {
    question: "What outcomes should I expect?",
    answer:
      "Parents most often notice: Greater confidence and motivation; Improved communication and teamwork; Reduced social anxiety through belonging; Curiosity about STEAM projects and career pathways.",
  },
  {
    question: "How does this help with school?",
    answer:
      "Motivated students engage more. Educators consistently report improved attendance and focus when kids are involved in structured esports programs.",
  },
  {
    question: "What about college or careers?",
    answer:
      "Ekuzo builds both soft skills (leadership, resilience, communication) and exposure to pathways in esports, game design, broadcasting, and tech.",
  },
];

// Section 5: Cost & Value
const costFAQs = [
  {
    question: "How much do programs cost?",
    answer:
      "E100: $100 for one month. After-School: Semester-based enrollment. Minimesters: Short, 4-day programs (pricing varies).",
  },
  {
    question: "Why does it cost what it does?",
    answer:
      "The practices are just the tip of the iceberg. Beneath them is the full system: elite coach training, moderated community spaces, curriculum design, competition infrastructure, guest speakers, and student-led projects.",
  },
];

// Section 6: Enrollment & Next Steps
const enrollmentFAQs = [
  {
    question: "How do I enroll?",
    answer:
      "Click Enroll Now → to sign up for E100, our one-month entry program.",
  },
  {
    question: "What happens after E100?",
    answer:
      "Families can: Re-enroll in another E100 cohort; Transition into After-School for ongoing growth; Explore School Teams (through a school partnership).",
  },
  {
    question: "Can homeschool families participate?",
    answer:
      "Yes. Homeschoolers can enroll in E100, After-School, or School Teams (as an elective).",
  },
];

export default function FAQPage() {
  return (
    <>
      {/* ══ 1. HERO — black bg, smoke graphics ═══════════════════════════════ */}
      <div className="relative overflow-visible">
      <section
        className="relative bg-black overflow-clip"
        style={{
          paddingTop: "clamp(140px, 20vw, 260px)",
          paddingBottom: "clamp(80px, 12vw, 160px)",
          maxHeight: "720px",
        }}
      >
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <Nav variant="dark" />
        </div>

        {/* Smoke graphics */}
        <Image
          src="/images/smoke-1@2x.png"
          alt=""
          width={800}
          height={1000}
          className="absolute bottom-0 left-0 w-[40%] max-w-[500px] opacity-40 pointer-events-none select-none"
          aria-hidden="true"
        />
        <Image
          src="/images/smoke-2@2x.png"
          alt=""
          width={800}
          height={1200}
          className="absolute top-0 right-0 h-full w-auto opacity-30 pointer-events-none select-none"
          aria-hidden="true"
        />

        {/* FAQ decorative character */}
        <Image
          src="/images/faq-hero-bottom.png"
          alt=""
          width={862}
          height={764}
          className="absolute bottom-[5%] right-[5%] w-[55%] max-w-[860px] z-[1] opacity-70 pointer-events-none select-none"
          aria-hidden="true"
        />

        {/* Headline content */}
        <div
          className="relative z-10"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="mb-6">
              <Eyebrow>FAQS</Eyebrow>
            </div>
            <h1
              className="font-display text-white uppercase leading-[0.85]"
              style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
            >
              FREQUENTLY ASKED QUESTIONS
            </h1>
          </div>
        </div>

      </section>
      {/* Torn paper divider at bottom — outside overflow-clip */}
      <TornPaperDivider color="black" variant="bottom" style={1} />
      </div>

      {/* ══ 2. SAFETY & COACHING — white bg ══════════════════════════════════ */}
      <section
        className="relative bg-white overflow-clip"
        style={{
          paddingTop: "clamp(80px, 10vw, 144px)",
          paddingBottom: "clamp(80px, 10vw, 144px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Brush stroke deco — left side, partially cropped */}
        <Image
          src="/images/faq-left-deco-1.png"
          alt=""
          width={400}
          height={525}
          className="absolute -left-[5%] bottom-0 w-[30%] max-w-[400px] opacity-[0.08] pointer-events-none select-none hidden md:block"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1232px] mx-auto flex flex-col md:flex-row gap-10 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h3
              className="font-display uppercase text-black leading-[0.85]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Safety & Coaching
            </h3>
          </div>
          <div className="flex-1">
            <FAQAccordion items={safetyFAQs} theme="light" />
          </div>
        </div>
      </section>

      {/* ══ 3. PROGRAMS & SCHEDULING — grey bg ═══════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <div
          className="relative bg-[#f0edea] overflow-clip"
          style={{
            paddingTop: "clamp(80px, 10vw, 144px)",
            paddingBottom: "clamp(80px, 10vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Large brush circle — left side */}
          <Image
            src="/images/faq-left-deco-2.png"
            alt=""
            width={717}
            height={944}
            className="absolute -left-[10%] top-1/2 -translate-y-1/2 w-[45%] max-w-[600px] opacity-[0.06] pointer-events-none select-none hidden md:block"
            aria-hidden="true"
          />

          {/* Curvy arrow deco — right side */}
          <Image
            src="/images/faq-programs-deco.png"
            alt=""
            width={400}
            height={340}
            className="absolute right-[5%] top-[15%] w-[18%] max-w-[200px] opacity-[0.07] pointer-events-none select-none hidden md:block"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[1232px] mx-auto flex flex-col md:flex-row gap-10 md:gap-[120px]">
            <div className="md:max-w-[388px] md:w-[388px] shrink-0">
              <h3
                className="font-display uppercase text-black leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Programs & Scheduling
              </h3>
            </div>
            <div className="flex-1">
              <FAQAccordion items={programsFAQs} theme="light" />
            </div>
          </div>
        </div>
        <TornPaperDivider color="grey" variant="bottom" style={2} />
      </section>

      {/* ══ 4. OUTCOMES & BENEFITS — white bg ════════════════════════════════ */}
      <section
        className="relative bg-white overflow-clip"
        style={{
          paddingTop: "clamp(80px, 10vw, 144px)",
          paddingBottom: "clamp(80px, 10vw, 144px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Right side brush claw deco */}
        <Image
          src="/images/faq-right-deco.png"
          alt=""
          width={569}
          height={1143}
          className="absolute -right-[5%] top-1/2 -translate-y-1/2 w-[35%] max-w-[450px] opacity-[0.06] pointer-events-none select-none hidden md:block"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1232px] mx-auto flex flex-col md:flex-row gap-10 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h3
              className="font-display uppercase text-black leading-[0.85]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Outcomes & Benefits
            </h3>
          </div>
          <div className="flex-1">
            <FAQAccordion items={outcomesFAQs} theme="light" />
          </div>
        </div>
      </section>

      {/* ══ 5. COST & VALUE — black bg (dark theme) ══════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 10vw, 144px)",
            paddingBottom: "clamp(80px, 10vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-10 md:gap-[120px]">
            <div className="md:max-w-[388px] md:w-[388px] shrink-0">
              <h3
                className="font-display uppercase text-white leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Cost & Value
              </h3>
            </div>
            <div className="flex-1">
              <FAQAccordion items={costFAQs} theme="dark" />
            </div>
          </div>
        </div>
        <TornPaperDivider color="black" variant="bottom" style={2} />
      </section>

      {/* ══ 6. ENROLLMENT & NEXT STEPS — white bg ════════════════════════════ */}
      <section
        className="relative bg-white overflow-clip"
        style={{
          paddingTop: "clamp(80px, 10vw, 144px)",
          paddingBottom: "clamp(80px, 10vw, 144px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Brush stroke deco — left side */}
        <Image
          src="/images/faq-left-deco-1.png"
          alt=""
          width={400}
          height={525}
          className="absolute -left-[8%] top-[20%] w-[28%] max-w-[350px] opacity-[0.07] pointer-events-none select-none hidden md:block"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1232px] mx-auto flex flex-col md:flex-row gap-10 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h3
              className="font-display uppercase text-black leading-[0.85]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Enrollment & Next Steps
            </h3>
          </div>
          <div className="flex-1">
            <FAQAccordion items={enrollmentFAQs} theme="light" />
          </div>
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />

      {/* ══ FIXED SCROLL BUTTON (Mobile CTA) ═════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-red border-t border-red/50 px-4 py-3 flex gap-2 z-40 safe-area-inset-bottom">
        <ModalButton modal="enroll" variant="white-filled" className="flex-1">
          Enroll my gamer
        </ModalButton>
        <ModalButton modal="contact" variant="white-outlined" className="flex-1">
          Start a conversation
        </ModalButton>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="md:hidden h-20" />
    </>
  );
}
