import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";

const growthItems = [
  { label: "Structured practice", icon: "/icons/swords-white.svg" },
  { label: "Skilled coaching",    icon: "/icons/clock-white.svg" },
  { label: "Real competition",    icon: "/icons/trophy-white.svg" },
];

export default function HomePage() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. HERO
          Red bg, full-bleed bg image centerY 59%, bird centerY 85%
          Padding: 160px top / 400px bottom (Framer spec)
          overflow-hidden per Framer
      ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-red overflow-hidden" style={{ paddingTop: "160px", paddingBottom: "400px" }}>
        {/* Nav */}
        <div className="absolute top-0 left-0 w-full z-20">
          <Nav variant="dark" />
        </div>

        {/* Full-bleed hero image */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <Image
            src="/images/home-hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 59%" }}
            sizes="100vw"
          />
        </div>

        {/* Headline — full width, no horizontal padding */}
        <div className="relative z-10 w-full px-4">
          <h1
            className="font-display uppercase text-white leading-[0.89] text-center"
            style={{ fontSize: "clamp(3rem, 13.3vw, 256px)" }}
          >
            Every gamer
            <br />
            deserves a team
          </h1>
        </div>

        {/* Bird — absolute, centerX 50%, centerY 85% (bottom 15%) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{ bottom: "15%", width: "332px", height: "300px" }}
          aria-hidden="true"
        >
          <Image
            src="/images/home-hero-bird.png"
            alt=""
            fill
            className="object-contain"
            sizes="332px"
          />
        </div>
      </section>

      {/* Torn paper: red → grey */}
      <TornPaperDivider color="red" />

      {/* ─────────────────────────────────────────────────────────────
          2. GROWTH THROUGH PLAY
          bg grey, 188px top/bottom, 104px horizontal
          H4 heading, image left, 3 list items with icons right
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-grey"
        style={{
          paddingTop: "188px",
          paddingBottom: "188px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          {/* H4 heading — responsive */}
          <h2
            className="font-body font-bold text-black leading-[1] mb-16"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Growth through play
          </h2>

          {/* Two columns: image left, list right */}
          <div className="flex flex-col md:flex-row gap-16 md:gap-[80px] items-start">
            {/* Left: illustration */}
            <div className="flex-1 relative overflow-hidden" style={{ borderRadius: "2px" }}>
              <Image
                src="/images/growth-collage.png"
                alt="EKUZO students gaming together"
                width={720}
                height={640}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>

            {/* Right: 3 list items with red circle + white icon */}
            <div className="flex flex-col gap-8 md:max-w-[400px] md:pt-4">
              {growthItems.map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-6">
                  <div
                    className="shrink-0 size-[72px] rounded-full bg-red flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon} alt="" className="size-8" />
                  </div>
                  <p
                    className="font-body font-bold text-black leading-[1.357]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Torn paper: grey → white (ecosystem) */}
      <TornPaperDivider color="black" />

      {/* ─────────────────────────────────────────────────────────────
          3. ECOSYSTEM ANIMATION
          White bg, 360vh, sticky scroll.
          Container-relative scroll progress (0-12% delay, 12-85% animation, 85-100% hold)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      {/* Torn paper: white (ecosystem) → black (how it works) */}
      <TornPaperDivider color="black" />

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS — 2 WAYS TO PLAY AND LEARN
          Black bg, watermark, SCHOOL + HOME cards, "See programs" CTA
      ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-black relative overflow-hidden"
        style={{
          paddingTop: "188px",
          paddingBottom: "188px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 1 }}
          aria-hidden="true"
        >
          <span
            className="font-display uppercase text-white whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 20vw, 20rem)", opacity: 0.06 }}
          >
            LEARN + PLAY
          </span>
        </div>

        <div className="relative w-full flex flex-col items-center" style={{ zIndex: 2, gap: "clamp(80px, 14vw, 200px)" }}>
          {/* Header block — centered, maxWidth 600px */}
          <div className="flex flex-col items-center text-center gap-4 max-w-[600px]">
            <p
              className="font-body font-medium text-red uppercase"
              style={{ fontSize: "16px", letterSpacing: "10px" }}
            >
              HOW IT WORKS
            </p>
            <h2
              className="font-body font-bold text-white leading-[1]"
              style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              2 ways to play and learn
            </h2>
            <p
              className="font-body text-white/60 leading-[1.417]"
              style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
            >
              Students can join EKUZO from home or through school. Both formats build teamwork, coaching, and progress.
            </p>
          </div>

          {/* Cards + button */}
          <div className="flex flex-col items-center gap-9 w-full">
            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-[1022px]">
              <div className="bg-grey p-10 flex flex-col gap-8 min-h-[400px] md:min-h-[480px]" style={{ borderRadius: "2px" }}>
                <p
                  className="font-display uppercase text-black leading-none"
                  style={{ fontSize: "clamp(3rem, 8vw, 96px)" }}
                >
                  SCHOOL
                </p>
                <p
                  className="font-body text-black leading-[1.357] flex-1"
                  style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
                >
                  Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online.
                </p>
                <Button variant="red-outlined" href="/schools">
                  Learn more about schools
                </Button>
              </div>

              <div className="bg-grey p-10 flex flex-col gap-8 min-h-[400px] md:min-h-[480px]" style={{ borderRadius: "2px" }}>
                <p
                  className="font-display uppercase text-black leading-none"
                  style={{ fontSize: "clamp(3rem, 8vw, 96px)" }}
                >
                  HOME
                </p>
                <p
                  className="font-body text-black leading-[1.357] flex-1"
                  style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
                >
                  Students join individually from home in a fully online format (during or after school).
                </p>
                <Button variant="red-outlined" href="/parents">
                  Learn more about home programs
                </Button>
              </div>
            </div>

            {/* See programs CTA */}
            <Button variant="white-outlined" href="/programs">
              See programs
            </Button>
          </div>
        </div>
      </section>

      {/* Torn paper: black → white (testimonials) */}
      <TornPaperDivider color="black" />

      {/* ─────────────────────────────────────────────────────────────
          5. TESTIMONIALS
          White bg, 144px top/bottom, 104px horizontal
          Heading: "What families are saying"
          Quote centered per Framer reference
      ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-white"
        style={{
          paddingTop: "144px",
          paddingBottom: "144px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1022px] mx-auto flex flex-col gap-14">
          <h2
            className="font-body font-bold text-black leading-[1]"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            What families are saying
          </h2>
          <TestimonialsCarousel />

          {/* Static featured quote — centered per Framer reference */}
          <div className="flex flex-col items-center text-center gap-6 pt-8">
            <p
              className="font-body font-bold text-black leading-[1.357] max-w-[600px]"
              style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
            >
              &ldquo;It&apos;s structure, mentorship, and community all in one place.&rdquo;
            </p>
            <div className="flex flex-col">
              <p
                className="font-body font-medium text-black leading-[1.357]"
                style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
              >
                Rudy May
              </p>
              <p
                className="font-body text-black/60 leading-[1.417]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                EKUZO mom
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER BANNER + FOOTER
      ───────────────────────────────────────────────────────────── */}
      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
