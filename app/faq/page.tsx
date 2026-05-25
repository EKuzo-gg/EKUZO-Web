import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FooterBanner from "@/components/sections/FooterBanner";
import Eyebrow from "@/components/ui/Eyebrow";
import ModalButton from "@/components/ui/ModalButton";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQPageSchema } from "@/lib/schema";

import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ — EKUZO",
  description:
    "Find answers about EKUZO programs, coaching, safety, scheduling, costs, and enrollment. Everything you need to know.",
  openGraph: {
    title: "Frequently Asked Questions | EKUZO",
    description: "Get answers about EKUZO esports programs, coaches, safety, and enrollment.",
    url: "https://ekuzo.gg/faq",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO FAQ - Questions Answered",
      },
    ],
  },
};

// Section 1: About & Safety
const safetyFAQs = [
  {
    question: "What is EKUZO?",
    answer:
      "EKUZO is a youth esports coaching platform for students aged 10\u201318. We use competitive gaming as the medium to develop leadership, communication, resilience, and teamwork through structured coaching, real competition, and intentional practice.",
  },
  {
    question: "Who are the coaches?",
    answer:
      "All EKUZO coaches are top 1% collegiate esports athletes or former professional players. They are trained not just in gameplay, but in pedagogy, safety, and social-emotional growth.",
  },
  {
    question: "How do you keep online spaces safe?",
    answer:
      "EKUZO operates as a \u201cwalled garden\u201d specifically designed to answer the four most common parent safety concerns: strangers, toxic chat, older kids, and in-game spending traps. Every session is coach-led and recorded, and our Discord and online platforms are actively moderated. Teams are verified, so your child plays with the same known teammates, not anonymous matchmaking, and opponents are limited to other youth in the EKUZO ecosystem, not random adults or older teens. Every student signs a Code of Conduct that\u2019s consistently enforced, and there are no in-session monetization prompts, loot boxes, or pressure to spend.",
  },
  {
    question: "Is this safe for beginners?",
    answer:
      "Yes. Coaches meet students where they are \u2014 from casual players to aspiring competitors \u2014 and ensure every team is inclusive and supportive.",
  },
  {
    question: "Isn\u2019t gaming culture toxic? I don\u2019t want my child exposed to that.",
    answer:
      "Toxicity in gaming is real, but it isn\u2019t inherent to gaming; it\u2019s a symptom of unstructured, anonymous environments where players never meet again. EKUZO is built against that \u201csolo queue\u201d failure mode: your child plays on a stable team with the same teammates all season, a coach is on voice comms, there\u2019s a written Code of Conduct, and opponents come from the EKUZO ecosystem rather than random adults. In an accountable environment, the behaviors that wreck unstructured play are nearly impossible to sustain.",
  },
  {
    question: "What equipment does my child need?",
    answer:
      "A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and doesn\u2019t require high-end hardware.",
  },
];

// Section 2: Programs & Scheduling
const programsFAQs = [
  {
    question: "What programs does EKUZO offer?",
    answer:
      "EKUZO offers three programs: EKUZOTEAMS (semester-based, about 15\u201316 weeks of coached team play), EKUZO100 (a 4-week competitive bootcamp), and EKUZOCAMPS (1-week intensive sessions during summer and holiday breaks). Each is built on the same coaching system with a different format and commitment level.",
  },
  {
    question: "What is EKUZO100?",
    answer:
      "EKUZO100 is a 4-week competitive bootcamp: $100, two sessions per week in small groups of five. It\u2019s designed to give students a real taste of structured esports coaching \u2014 whether they\u2019re brand new or looking to sharpen their game.",
  },
  {
    question: "When are practices held?",
    answer:
      "EKUZO100: two evenings per week, after school. EKUZOTEAMS: two 90-minute sessions per week by default (some school-based teams run three 60-minute sessions), during or after school. EKUZOCAMPS: daily sessions during summer or holiday breaks.",
  },
  {
    question: "How are teams formed?",
    answer:
      "Students are grouped into small teams of roughly five, balanced by age and skill level, with a preference for local cohorts whenever possible. For EKUZOTEAMS, rosters are 10\u201312 players to support 5v5 match play.",
  },
  {
    question: "What\u2019s the difference between the School and Home tracks?",
    answer:
      "Both tracks deliver the same EKUZO coaching system. The School track is run in partnership with a school, often during or after school hours with a proctor present. The Home track is for families who want to participate independently, with sessions scheduled in the evenings.",
  },
  {
    question: "Can homeschool families participate?",
    answer:
      "Yes. Homeschoolers can enroll in any EKUZO program \u2014 EKUZO100, EKUZOTEAMS (Home track), or EKUZOCAMPS. All sessions are held online.",
  },
  {
    question: "What age range is EKUZO for?",
    answer:
      "EKUZO programs are designed for students aged 10\u201318. We group players by age and skill level to ensure the best experience for everyone.",
  },
];

// Section 3: Outcomes & Benefits
const outcomesFAQs = [
  {
    question: "What outcomes should I expect?",
    answer:
      "Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and new curiosity about STEAM projects and careers. Research on structured school esports documents the gains: 7.3 more school days per year, 33.5% lower absence rates, a +0.11 GPA increase during the active season, and 52.1% of participants reporting significant life-skills development.",
  },
  {
    question: "How does this help with school?",
    answer:
      "The mechanism is belonging. About 90% of middle-school esports participants aren’t in any other school extracurricular, so for many students EKUZO is their first real connection at school, which correlates with measurable attendance and GPA gains. Students also build focus, discipline, time management, and collaboration that carry directly into academics. The coaching method is built on established learning science.",
  },
  {
    question: "What about college or careers?",
    answer:
      "EKUZO builds professional skills (leadership, resilience, communication) and exposes students to esports, game design, broadcasting, and tech pathways. Collegiate esports scholarships now total over $15 million annually across hundreds of university programs, and a majority of esports players go on to pick STEM careers. The skills transfer to college and work regardless of whether a student pursues esports itself.",
  },
];

// Section 4: Pricing
const costFAQs = [
  {
    question: "How is EKUZO priced?",
    answer:
      "All EKUZO programs are standardized around roughly $20 per session of small-group, coach-led instruction. EKUZO100 is $100 for the full 4-week program. EKUZO Teams is $576 paid in full (a 10% discount) or four monthly payments of $160 ($640 total). EKUZO Camps are $199 per week. See each program page to register.",
  },
  {
    question: "Why does it cost what it does?",
    answer:
      "The sessions are just the tip of the iceberg. Beneath them is the full system: elite coach training, moderated community spaces, curriculum design, competition infrastructure, guest speakers, and student-led projects.",
  },
];

// Section 5: Getting Started
const enrollmentFAQs = [
  {
    question: "How do I enroll?",
    answer:
      "Click \u2018Enroll my gamer\u2019 on any page to see the available programs. EKUZOCAMPS are open for summer registration now. EKUZOTEAMS enrolls each fall and spring semester. EKUZO100 is available year-round as a 4-week on-ramp.",
  },
  {
    question: "What happens after EKUZO100?",
    answer:
      "Families can re-enroll in another EKUZO100 cohort, transition into EKUZOTEAMS for a full semester of coached competition, or try EKUZOCAMPS during breaks. There\u2019s no automatic renewal \u2014 your family decides what\u2019s next.",
  },
];

const faqPageSchema = buildFAQPageSchema([
  ...safetyFAQs,
  ...programsFAQs,
  ...outcomesFAQs,
  ...costFAQs,
  ...enrollmentFAQs,
]);

const faqBreadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "FAQ", path: "/faq" },
]);

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqPageSchema} />
      <JsonLd data={faqBreadcrumbSchema} />
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
              About & Safety
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
                Pricing
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
              Getting Started
            </h3>
          </div>
          <div className="flex-1">
            <FAQAccordion items={enrollmentFAQs} theme="light" />
          </div>
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />

    </>
  );
}
