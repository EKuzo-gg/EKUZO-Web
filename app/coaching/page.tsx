import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import ModalButton from "@/components/ui/ModalButton";
import Button from "@/components/ui/Button";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Coaching — EKUZO",
  description:
    "Learn how EKUZO's coaching methodology turns feedback into growth. Discover how our coaches guide students through observation, reflection, and adjustment.",
};

/**
 * COACHING PILLAR DATA — Template structure
 * This data object contains all pillar-specific content and can be swapped
 * for other pedagogy pillars (Motivation, Reflection, etc.)
 */
const PILLAR_DATA = {
  title: "COACHING",
  subtitle: "Meeting every learner where they are.",
  heroImages: {
    left: "/images/coaching-hero-left.png",
    right: "/images/coaching-hero-right.png",
  },
  heroTorn: "/images/coaching-hero-torn.png",

  whySection: {
    heading: "Every great athlete has a coach.",
    body: "Every successful team has a mentor guiding them. Research across education is clear: coaching is one of the most effective ways to learn. At Ekuzo, coaching is at the center of our model. Our coaches are collegiate esports athletes or former professionals who know the game inside and out, but more importantly, they know how to connect with students.",
    bgImage: "/images/coaching-athlete-bg.png",
  },

  quote: {
    text: "A coach is someone who can give correction without causing resentment.",
    author: "John Wooden",
  },

  howSection: {
    heading: "How Coaching Builds Growth",
    body: "Coaching turns feedback into transformation. It gives structure to practice and purpose to reflection. In games and in learning, growth happens fastest when students can:",
    steps: [
      {
        title: "Observe",
        description: "See what happened and why it mattered",
      },
      {
        title: "Reflect",
        description: "Get feedback and discuss it safely.",
      },
      {
        title: "Adjust",
        description: "Apply insights in the next round.",
      },
    ],
    bgImage: "/images/coaching-how-bg-wide.png",
    circleLeft: "/images/coaching-how-circle-left.png",
    circleRight: "/images/coaching-how-circle-right.png",
    decors: [
      "/images/coaching-how-decor-1.png",
      "/images/coaching-how-decor-2.png",
      "/images/coaching-how-decor-3.png",
      "/images/coaching-how-decor-4.png",
      "/images/coaching-how-decor-5.png",
      "/images/coaching-how-decor-6.png",
    ],
  },

  storySection: {
    heading: "Meeting the Learner Where They Are",
    redPanelText:
      "One student joined without ranked experience; they were quiet, hesitant, and unsure.",
    storyImage: "/images/coaching-learner-photo.jpg",
    overlayCardImage: "/images/coaching-learner-card-overlay.png",
    story:
      "His coach didn't push him into competition right away; instead, they focused on team communication and game sense. By the third week, he was calling plays mid-match, the same player teachers said 'never spoke up in class.'",
    decorImage: "/images/coaching-learner-decor.png",
  },

  connectedPedagogies: [
    {
      title: "Motivation",
      description: "Coaches help students see progress before they feel it.",
    },
    {
      title: "Social learning",
      description: "Feedback becomes conversation — learning happens together.",
    },
    {
      title: "Correct Difficulty",
      description:
        "Guidance keeps challenge in the 'just right' zone for each player.",
    },
  ],

  faqs: [
    {
      question: "What does coaching look like in EKUZO?",
      answer:
        "Our coaches provide real-time feedback during gameplay, one-on-one guidance after sessions, and structured reflection on what worked and what to improve next time.",
    },
    {
      question: "How often do students interact with coaches?",
      answer:
        "Coaches are present during all practice sessions and matches, providing live feedback. Many students also have additional 1:1 check-ins each week.",
    },
    {
      question: "Are coaches experienced with esports?",
      answer:
        "Yes. Our coaching team consists of collegiate esports athletes, former professionals, and trainers who have deep game knowledge and competitive experience.",
    },
    {
      question: "What if my student doesn't respond well to feedback?",
      answer:
        "Our coaches are trained to meet students where they are emotionally and developmentally. We focus on psychological safety and work with each student to build their receptiveness to feedback over time.",
    },
    {
      question: "Can coaching help with other areas of my student's life?",
      answer:
        "Absolutely. The skills students develop through coaching—resilience, adaptability, communication—transfer directly to school, work, and personal relationships.",
    },
  ],
};

export default function CoachingPage() {
  return (
    <>
      <Nav variant="light" />

      {/* ── 1. Hero ───────────────────────────────────────────────────── */}
      <section
        className="relative bg-white overflow-clip"
        style={{ paddingTop: "188px", paddingBottom: "188px" }}
      >
        {/* Left decorative image (bottom-anchored) */}
        <div className="absolute left-0 bottom-0 w-1/4 h-auto pointer-events-none select-none hidden md:block">
          <Image
            src={PILLAR_DATA.heroImages.left}
            alt=""
            width={660}
            height={560}
            className="w-full h-auto"
          />
        </div>

        {/* Right decorative image (top-anchored) */}
        <div className="absolute right-0 top-0 w-1/4 h-auto pointer-events-none select-none hidden md:block">
          <Image
            src={PILLAR_DATA.heroImages.right}
            alt=""
            width={660}
            height={560}
            className="w-full h-auto"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1232px] mx-auto px-6 md:px-[104px]">
          <h1
            className="font-display uppercase text-black leading-none mb-6"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
          >
            {PILLAR_DATA.title}
          </h1>
          <p
            className="text-black max-w-md leading-relaxed mb-10"
            style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
          >
            {PILLAR_DATA.subtitle}
          </p>
          <ModalButton modal="contact" variant="red-outlined">
            Start a conversation
          </ModalButton>
        </div>

        {/* Torn paper divider */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[55%] z-20 overflow-clip">
          <Image
            src={PILLAR_DATA.heroTorn}
            alt=""
            width={2400}
            height={300}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ── 2. Why Coaching Works ────────────────────────────────────── */}
      <section
        className="relative bg-grey overflow-hidden"
        style={{ paddingTop: "188px", paddingBottom: "188px" }}
      >
        {/* Background decorative image */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-30">
          <Image
            src={PILLAR_DATA.whySection.bgImage}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 max-w-[1232px] mx-auto px-6 md:px-[104px]">
          <h2
            className="font-display uppercase text-black leading-none mb-10"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {PILLAR_DATA.whySection.heading}
          </h2>
          <p
            className="text-black/80 leading-relaxed max-w-3xl"
            style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
          >
            {PILLAR_DATA.whySection.body}
          </p>
        </div>
      </section>

      {/* grey → black */}
      <TornPaperDivider color="black" />

      {/* ── 3. Quote ──────────────────────────────────────────────────── */}
      <section className="bg-black py-24 md:py-32 px-6 md:px-[104px] text-center">
        {/* Decorative quotation marks */}
        <div className="flex justify-center mb-10" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/camada-white.svg" alt="" width={40} height={60} />
        </div>

        <blockquote
          className="font-display uppercase text-white leading-tight max-w-4xl mx-auto mb-10"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
        >
          {PILLAR_DATA.quote.text}
        </blockquote>

        <p
          className="text-white font-bold"
          style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
        >
          {PILLAR_DATA.quote.author}
        </p>
      </section>

      {/* black → grey */}
      <TornPaperDivider color="grey" />

      {/* ── 4. How Coaching Builds Growth ────────────────────────────── */}
      <section
        className="relative bg-grey overflow-hidden"
        style={{ paddingTop: "144px", paddingBottom: "240px" }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-25">
          <Image
            src={PILLAR_DATA.howSection.bgImage}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        {/* Left circle decoration (hidden on mobile) */}
        <div className="absolute left-0 top-1/4 w-1/3 h-auto pointer-events-none select-none hidden lg:block -translate-x-[20%]">
          <Image
            src={PILLAR_DATA.howSection.circleLeft}
            alt=""
            width={500}
            height={500}
            className="w-full h-auto opacity-40"
          />
        </div>

        {/* Right circle decoration (hidden on mobile) */}
        <div className="absolute right-0 bottom-0 w-1/3 h-auto pointer-events-none select-none hidden lg:block translate-x-[20%]">
          <Image
            src={PILLAR_DATA.howSection.circleRight}
            alt=""
            width={500}
            height={500}
            className="w-full h-auto opacity-40"
          />
        </div>

        <div className="relative z-10 max-w-[1232px] mx-auto px-6 md:px-[104px]">
          {/* Intro card */}
          <div className="bg-white p-10 md:p-14 max-w-2xl mb-16 relative z-20">
            <div className="mb-6">
              <Eyebrow>How It Works</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-tight mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              {PILLAR_DATA.howSection.heading}
            </h2>
            <p
              className="text-black/70 leading-relaxed"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              {PILLAR_DATA.howSection.body}
            </p>
          </div>

          {/* 3-step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
            {PILLAR_DATA.howSection.steps.map((step, idx) => (
              <div
                key={step.title}
                className="bg-white p-10 relative group hover:shadow-lg transition-shadow duration-300"
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 text-red text-3xl font-display font-bold opacity-20">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <h3
                  className="font-display uppercase text-black leading-none mb-4"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-black/70 leading-relaxed"
                  style={{ fontSize: "clamp(1rem, 1.4vw, 18px)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Scattered decoration images */}
          {PILLAR_DATA.howSection.decors.map((decor, idx) => (
            <div
              key={`decor-${idx}`}
              className="absolute pointer-events-none select-none opacity-40"
              style={{
                width: `clamp(80px, 10vw, 150px)`,
                top: `${20 + idx * 15}%`,
                left: idx % 2 === 0 ? `${5 + idx * 5}%` : "auto",
                right: idx % 2 === 1 ? `${5 + idx * 5}%` : "auto",
              }}
            >
              <Image
                src={decor}
                alt=""
                width={200}
                height={200}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      </section>

      {/* grey → white */}
      <TornPaperDivider color="white" flip />

      {/* ── 5. Meeting the Learner Where They Are ───────────────────── */}
      <section
        className="relative bg-white overflow-clip"
        style={{ paddingTop: "188px", paddingBottom: "188px" }}
      >
        <div className="relative z-10 max-w-[1232px] mx-auto px-6 md:px-[104px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Red panel */}
            <div className="bg-red p-10 md:p-14 text-white">
              <h3
                className="font-display uppercase leading-tight mb-6"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
              >
                {PILLAR_DATA.storySection.heading}
              </h3>
              <p
                className="text-white/90 leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
              >
                {PILLAR_DATA.storySection.redPanelText}
              </p>
            </div>

            {/* Right: Story image with overlay card */}
            <div className="relative h-[400px] md:h-[500px]">
              {/* Background story image */}
              <div className="absolute inset-0 bg-grey rounded-sm overflow-hidden">
                <Image
                  src={PILLAR_DATA.storySection.storyImage}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlay card with story text */}
              <div className="absolute bottom-0 right-0 w-full md:w-[80%] bg-white shadow-xl p-8 md:p-10">
                <p
                  className="text-black/80 leading-relaxed mb-6"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)" }}
                >
                  &quot;{PILLAR_DATA.storySection.story}&quot;
                </p>
                <Button href="/blog" variant="red-outlined">
                  Read more stories
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative illustration */}
          <div className="absolute bottom-0 right-0 w-1/4 h-auto pointer-events-none select-none hidden lg:block translate-y-[40%]">
            <Image
              src={PILLAR_DATA.storySection.decorImage}
              alt=""
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Torn paper divider at bottom */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[55%] z-20 overflow-clip">
          <Image
            src="/images/torn-paper-black-1.png"
            alt=""
            width={2400}
            height={300}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ── 6. Connected Pedagogies ───────────────────────────────────── */}
      <section
        className="relative bg-black overflow-hidden"
        style={{ paddingTop: "144px", paddingBottom: "188px" }}
      >
        {/* Fade decoration */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-20">
          <Image
            src="/images/coaching-connected-fade.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 max-w-[1232px] mx-auto px-6 md:px-[104px]">
          <h2
            className="font-display uppercase text-white leading-none mb-16"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
          >
            Connected pedagogies
          </h2>

          {/* 3-card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLAR_DATA.connectedPedagogies.map((pedagogy) => (
              <div key={pedagogy.title} className="bg-black/60 border border-white/20 p-10 backdrop-blur-sm">
                <h3
                  className="font-display uppercase text-white leading-tight mb-4"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}
                >
                  {pedagogy.title}
                </h3>
                <p
                  className="text-white/70 leading-relaxed"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)" }}
                >
                  {pedagogy.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ────────────────────────────────────────────────────── */}
      <section
        className="relative bg-white overflow-hidden"
        style={{ paddingTop: "144px", paddingBottom: "188px" }}
      >
        <div className="max-w-[1232px] mx-auto px-6 md:px-[104px] flex flex-col md:flex-row gap-16 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h2
              className="font-display uppercase text-black leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.75rem)" }}
            >
              Questions?
            </h2>
          </div>
          <div className="flex-1">
            <FAQAccordion items={PILLAR_DATA.faqs} theme="light" />
          </div>
        </div>
      </section>

      {/* ── 8. Footer Banner ──────────────────────────────────────────── */}
      <FooterBanner heading="Enroll into a transformational program today" />

      <Footer />
    </>
  );
}
