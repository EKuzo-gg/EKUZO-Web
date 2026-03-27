import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import FeatureCardsSection from "@/components/sections/FeatureCardsSection";
import TickerSection from "@/components/sections/TickerSection";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import Link from "next/link";

export const metadata = {
  title: "For Parents — EKUZO",
  description:
    "Learn how EKUZO supports families. Safe, structured, and coached esports programmes for young gamers from home or school.",
};

const parentsFAQs = [
  {
    question: "Is gaming really educational?",
    answer:
      "Yes — when it's structured. EKUZO uses gaming as the medium to develop communication, leadership, resilience, and strategic thinking. These are the same skills coaches in traditional sports spend years trying to teach.",
  },
  {
    question: "How do you keep online spaces safe?",
    answer:
      "Our Discord and online platforms are actively moderated. Coaches enforce community guidelines, and every student signs our Code of Conduct. Parents can always contact us with concerns.",
  },
  {
    question: "What if my child has never played competitively?",
    answer:
      "That's perfectly fine. EKUZO100 is designed specifically for beginners. Coaches meet students where they are and build from there.",
  },
  {
    question: "What outcomes should I expect?",
    answer:
      "Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and curiosity about STEAM projects and career pathways.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Click 'Enroll my gamer' on any page to see the available programs and get started.",
  },
];

export default function ParentsPage() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      {/* 1. Hero — white bg */}
      <section className="bg-white relative overflow-hidden" style={{ paddingTop: "280px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto text-center">
          <h2
            className="font-display text-black leading-none"
            style={{ fontSize: "clamp(4rem, 10vw, 10rem)" }}
          >
            What if gaming is the best way to connect
          </h2>
        </div>

        {/* Hero image — full width below heading */}
        <div className="relative mt-16 w-full">
          <Image
            src="/images/parents-hero.png"
            alt="EKUZO parents hero"
            width={1440}
            height={720}
            className="w-full h-auto object-cover"
            priority
          />
          {/* Torn transition overlay */}
          <div className="absolute bottom-[-20px] left-0 right-0 z-10">
            <Image
              src="/images/parents-hero-torn.png"
              alt=""
              width={1440}
              height={120}
              className="w-full h-auto"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* 2. Our Approach */}
      <OurApproachSection
        heading="What is EKUZO?"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        body="It's natural for parents to feel tension around screen time, especially when it feels unstructured, unsupervised, or hard to trust. EKUZO leans into what students already love. We take their natural motivation for gaming and build a complete, coach-led system around it. Think sports, designed specifically for gamers. Instead of trying to control screen time, parents gain confidence in how it's being used."
        bg="bg-grey"
      />

      {/* 3. Feature Cards — Why parents choose EKUZO */}
      <FeatureCardsSection
        bgImage="url('/images/parents-features-bg.png')"
        heading="Why parents choose EKUZO?"
        body="Parents choose EKUZO because it turns gaming from a solo activity into a team experience that feels structured, social, and purposeful. Instead of managing screen time, parents see their kids showing up, engaging with teammates, and growing through play."
        cardBg="bg-grey"
        features={[
          { title: "Safe and structured", body: "Moderated spaces, trained coaches, and a positive culture." },
          { title: "Motivating by design", body: "Students gain visible wins that build intrinsic motivation." },
          { title: "Skills that last", body: "Communication, leadership, and resilience carry far beyond gaming." },
        ]}
      />

      {/* 4. Programs */}
      <ProgramsSection showTeams showEkuzo100 showCamps />

      {/* 5. Ecosystem Animation */}
      <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      {/* Divider: ecosystem → light ticker */}
      <TornPaperDivider color="black" />

      {/* 6. Ticker — What parents see in their kids */}
      <TickerSection
        eyebrow="HOW IT WORKS"
        heading="What parents see in their kids"
        theme="light"
        bg="bg-white"
        cards={[
          { title: "Growing confidence", body: "Kids speak up more, try harder things, and recover faster from setbacks." },
          { title: "Better communication", body: "Team play translates into clearer communication at home and at school." },
          { title: "Motivation that sticks", body: "Parents notice fewer battles around participation." },
          { title: "Real connections", body: "Kids talk about teammates by name and start looking forward to showing up." },
        ]}
        cta={{ label: "See programs", href: "/programs" }}
      />

      {/* 7. Testimonials */}
      <section className="bg-white" style={{ paddingTop: "144px", paddingBottom: "144px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <h4
            className="font-body font-bold text-black leading-[1] mb-16"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            What parents are saying
          </h4>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* 8. Blog section */}
      <section className="bg-white" style={{ paddingTop: "188px", paddingBottom: "188px" }}>
        <div className="max-w-[1232px] mx-auto px-6 md:px-[40px]">
          {/* Two-panel header */}
          <div className="flex flex-col md:flex-row mb-8">
            <div
              className="bg-red flex-[0_0_64%] p-12 relative"
              style={{ minHeight: "180px" }}
            >
              {/* Decorative diamond corners */}
              <span className="absolute top-4 left-4 size-3 bg-white rotate-45 opacity-30" aria-hidden="true" />
              <span className="absolute top-4 right-4 size-3 bg-white rotate-45 opacity-30" aria-hidden="true" />
              <h4
                className="font-body font-bold text-white leading-[1]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 48px)", letterSpacing: "-1px" }}
              >
                Stories of Growth and Gaming
              </h4>
            </div>
            <div className="bg-red flex-1 p-12 flex flex-col justify-between border-l border-white/20">
              <p
                className="font-body text-white/80 leading-[1.357]"
                style={{ fontSize: "clamp(1rem, 1.5vw, 22px)" }}
              >
                Explore how esports becomes a tool for learning, connection, and purpose.
              </p>
              <div className="flex justify-end mt-6">
                <Image
                  src="/images/parents-blog-decor.png"
                  alt=""
                  width={135}
                  height={164}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Feature blog card */}
          <Link
            href="/blog/our-familys-esports-journey-with-ekuzo-and-the-k1ng"
            className="block relative overflow-hidden group"
            style={{ height: "399px", borderRadius: "2px" }}
          >
            {/* Background */}
            <Image
              src="/images/parents-blog-feature.jpg"
              alt="Blog feature: Our Family's Esports Journey"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Left overlay panel */}
            <div
              className="absolute inset-y-0 left-0 w-[55%] flex flex-col justify-end p-10"
              style={{
                backgroundImage: "url('/images/parents-blog-card-overlay.png')",
                backgroundSize: "cover",
                backgroundPosition: "right center",
              }}
            >
              <p
                className="font-body font-medium text-white/70 uppercase mb-3"
                style={{ fontSize: "14px", letterSpacing: "10px" }}
              >
                BLOG
              </p>
              <h5
                className="font-body font-bold text-white leading-[1.2] mb-3"
                style={{ fontSize: "32px" }}
              >
                Our Family&apos;s Esports Journey with EKUZO and the K1ng
              </h5>
              <p
                className="font-body text-white/70 leading-[1.417]"
                style={{ fontSize: "20px" }}
              >
                My son Ryan was always a happy kid in his early years.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="bg-white" style={{ paddingTop: "144px", paddingBottom: "188px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h4 className="font-body font-bold text-black leading-[1]" style={{ fontSize: "clamp(1.75rem, 3vw, 48px)", letterSpacing: "-1px" }}>
              Common parent questions
            </h4>
          </div>
          <div className="flex-1">
            <FAQAccordion items={parentsFAQs} theme="light" />
          </div>
        </div>
      </section>

      {/* 10. Footer Banner */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
