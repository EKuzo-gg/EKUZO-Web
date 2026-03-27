import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TornPaper from "@/components/ui/TornPaper";
import FooterBanner from "@/components/sections/FooterBanner";
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

function FAQSection({
  label,
  items,
  paddingTop = "144px",
  paddingBottom = "144px",
}: {
  label: string;
  items: { question: string; answer: string }[];
  paddingTop?: string;
  paddingBottom?: string;
}) {
  return (
    <section
      className="bg-white"
      style={{ paddingTop, paddingBottom, paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
    >
      <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
        <div className="md:max-w-[388px] md:w-[388px] shrink-0">
          <h4 className="font-body font-bold text-black leading-tight" style={{ fontSize: "clamp(1.5rem, 1.8vw, 24px)" }}>
            {label}
          </h4>
        </div>
        <div className="flex-1">
          <FAQAccordion items={items} theme="light" />
        </div>
      </div>
    </section>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section
        className="relative bg-black overflow-hidden"
        style={{ paddingTop: "360px", paddingBottom: "240px" }}
      >
        {/* Nav absolutely positioned at top */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Nav variant="dark" />
        </div>

        <div className="relative z-10" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <h2 className="font-display text-white uppercase leading-none tracking-wide" style={{ fontSize: "clamp(3rem, 8vw, 120px)" }}>
            PARENT
            <br />
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        {/* Decorative image — centered, absolute, bottom of section */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10" style={{ bottom: "10%" }}>
          <Image
            src="/images/faq-hero-bottom.png"
            alt=""
            width={431}
            height={382}
            aria-hidden="true"
          />
        </div>

        {/* TornPaper at absolute bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <TornPaper color="white" style={1} />
        </div>
      </section>

      {/* Section 2 — Safety & Coaching */}
      <FAQSection
        label="Safety & Coaching"
        items={safetyFAQs}
        paddingTop="188px"
        paddingBottom="144px"
      />

      {/* Section 3 — Programs & Scheduling */}
      <FAQSection
        label="Programs & Scheduling"
        items={programsFAQs}
        paddingTop="144px"
        paddingBottom="144px"
      />

      {/* Section 4 — Outcomes & Benefits */}
      <FAQSection
        label="Outcomes & Benefits"
        items={outcomesFAQs}
        paddingTop="144px"
        paddingBottom="144px"
      />

      {/* Section 5 — Cost & Value */}
      <FAQSection
        label="Cost & Value"
        items={costFAQs}
        paddingTop="144px"
        paddingBottom="144px"
      />

      {/* Section 6 — Enrollment & Next Steps */}
      <FAQSection
        label="Enrollment & Next Steps"
        items={enrollmentFAQs}
        paddingTop="144px"
        paddingBottom="188px"
      />

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
