import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import ParallaxBird from "@/components/ui/ParallaxBird";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "EKUZO — Every Gamer Deserves a Team",
  description:
    "Youth esports coaching programs that turn gaming into growth. Structured practice, skilled coaching, and real competition for every gamer.",
  openGraph: {
    title: "EKUZO — Every Gamer Deserves a Team",
    description: "Transformational esports coaching programs for youth gamers.",
    url: "https://ekuzo.gg",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "EKUZO - Youth Esports Coaching Platform",
      },
    ],
  },
};

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
      <section
        className="relative bg-red overflow-visible"
        style={{ paddingTop: "clamp(100px, 12vw, 160px)", paddingBottom: "clamp(200px, 30vw, 400px)" }}
      >
        {/* Nav */}
        <div className="absolute top-0 left-0 w-full z-20">
          <Nav variant="dark" />
        </div>

        {/* Full-bleed hero image — anchored to bottom, covered by torn paper */}
        <div
          className="absolute inset-x-0 bottom-0 z-0 pointer-events-none"
          style={{ height: "clamp(280px, 65vw, 100%)" }}
          aria-hidden="true"
        >
          <Image
            src="/images/home-hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 80%" }}
            sizes="100vw"
          />
        </div>

        {/* Headline — 40px margin on mobile, fills container width */}
        <div className="relative z-10 w-full px-[40px] md:px-4">
          <h1
            className="font-display uppercase text-white leading-[0.89] text-center"
            style={{ fontSize: "clamp(4.5rem, 20vw, 256px)" }}
          >
            Every gamer
            <br />
            deserves a team
          </h1>
        </div>

        {/* Bird — sits on top of the torn paper at hero/growth boundary */}
        <ParallaxBird />

        {/* Torn paper: hero (red) → growth (grey) — PNG for texture detail */}
        {/* Framer: White2 component, absolute, centerY 102%, responsive heights: 300/300/227/115 */}
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


      {/* ─────────────────────────────────────────────────────────────
          2. GROWTH THROUGH PLAY
          bg grey, 188px top/bottom, 104px horizontal
          H4 heading, image left, 3 list items with icons right
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-grey"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Torn paper: growth (grey) → ecosystem (white) — grey paper at bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/paper-grey-bottom-2.svg"
          alt=""
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
          style={{ transform: "translateY(55%)" }}
          aria-hidden="true"
        />

        <div className="max-w-[1232px] mx-auto">
          {/* H4 heading — full width above the two-column layout */}
          <h2
            className="font-body font-bold text-black leading-[1] mb-[40px] md:mb-[64px]"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Growth through play
          </h2>

          {/* On mobile: list items ABOVE image. On desktop: icons left, image right */}
          <div className="flex flex-col md:flex-row gap-[40px] md:gap-[90px] items-start">
            {/* List items — shown first on mobile, left on desktop */}
            <div className="flex flex-col gap-6 md:gap-8 md:max-w-[400px] md:pt-4 order-1">
              {growthItems.map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-4 md:gap-6">
                  <div
                    className="shrink-0 size-[50px] md:size-[72px] rounded-full bg-red flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon} alt="" className="size-6 md:size-8" style={{ filter: "brightness(0) invert(1)" }} />
                  </div>
                  <p
                    className="font-body font-bold text-black leading-[1.357]"
                    style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Illustration — right on desktop, below icons on mobile */}
            <div className="flex-1 relative overflow-hidden order-2" style={{ borderRadius: "2px" }}>
              <Image
                src="/images/growth-collage.png"
                alt="EKUZO students gaming together"
                width={720}
                height={640}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. ECOSYSTEM ANIMATION
          White bg, 360vh, sticky scroll.
          Container-relative scroll progress (0-12% delay, 12-85% animation, 85-100% hold)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-visible" style={{ height: "360vh", paddingBottom: "clamp(80px, 12vw, 160px)" }}>
        {/* Torn paper: growth (grey) → ecosystem (white) — white paper at top */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/paper-white-top-1.svg"
          alt=""
          className="absolute top-0 left-0 w-full z-20 pointer-events-none select-none"
          style={{ transform: "translateY(-55%)" }}
          aria-hidden="true"
        />

        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>

        {/* Torn paper: ecosystem (white) → how it works (black) — black paper at bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/paper-black-top-2.svg"
          alt=""
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
          style={{ transform: "translateY(2px)" }}
          aria-hidden="true"
        />
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS — 2 WAYS TO PLAY AND LEARN
          Black bg, watermark, SCHOOL + HOME cards, "See programs" CTA
      ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-black relative overflow-visible"
        style={{
          paddingTop: "100px",
          paddingBottom: "100px",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        {/* Watermark */}
        <div
          className="absolute inset-x-0 pointer-events-none select-none overflow-hidden flex justify-center"
          style={{ zIndex: 1, top: "45%", transform: "translateY(-50%)" }}
          aria-hidden="true"
        >
          <span
            className="font-display uppercase text-white whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 20vw, 20rem)", opacity: 0.06 }}
          >
            LEARN + PLAY
          </span>
        </div>

        <div className="relative w-full flex flex-col items-center" style={{ zIndex: 2, gap: "100px" }}>
          {/* Header block — centered */}
          <div className="flex flex-col items-center text-center gap-4 max-w-[800px]">
            <Eyebrow>HOW IT WORKS</Eyebrow>
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
            {/* Cards — no CTAs inside */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-[1022px]">
              <div
                className="bg-white p-8 md:p-10 flex flex-col gap-[60px] md:gap-[80px] min-h-[280px] md:min-h-[480px]"
                style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
              >
                <p
                  className="font-display uppercase text-black leading-none"
                  style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
                >
                  SCHOOL
                </p>
                <p
                  className="font-body text-black leading-[1.417] mb-[15px] md:mb-[20px]"
                  style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                >
                  Students meet in person at their school (during or after school hours) with an onsite proctor. EKUZO coaches lead practice online.
                </p>
              </div>

              <div
                className="bg-white p-8 md:p-10 flex flex-col gap-[60px] md:gap-[80px] min-h-[280px] md:min-h-[480px]"
                style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
              >
                <p
                  className="font-display uppercase text-black leading-none"
                  style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
                >
                  HOME
                </p>
                <p
                  className="font-body text-black leading-[1.417] mb-[15px] md:mb-[20px]"
                  style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                >
                  Students join individually from home in a fully online format (during or after school).
                </p>
              </div>
            </div>

            {/* See programs CTA — red filled */}
            <Button variant="red-filled" href="/programs">
              See programs
            </Button>
          </div>
        </div>

        {/* Torn paper: how it works (black) → testimonials (white) — black paper at bottom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/paper-black-bottom-2.svg"
          alt=""
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
          style={{ transform: "translateY(calc(100% - 2px))" }}
          aria-hidden="true"
        />
      </section>


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
        <div className="max-w-[1022px] mx-auto flex flex-col gap-[72px]">
          <h2
            className="font-body font-bold text-black leading-[1] text-center"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            What parents{" "}
            <br />
            are saying
          </h2>
          <TestimonialsCarousel />

          {/* Static featured quote — centered per Framer reference */}
          <div className="flex flex-col items-center text-center gap-6 pt-8">
            <Image
              src="/images/testimonial-quote-mark.png"
              alt=""
              width={88}
              height={80}
              className="mb-4"
              aria-hidden="true"
            />
            <p
              className="font-body font-bold text-black leading-[1.357] max-w-[444px]"
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
