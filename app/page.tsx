import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import HomeHowItWorks from "@/components/sections/HomeHowItWorks";
import ParallaxBird from "@/components/ui/ParallaxBird";
import Eyebrow from "@/components/ui/Eyebrow";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import WhatWePlayVideo from "@/components/ui/WhatWePlayVideo";
import TrackedLink from "@/components/ui/TrackedLink";
import TrackSectionView from "@/components/analytics/TrackSectionView";
import JsonLd from "@/components/JsonLd";
import { testimonialVideoGraph, leagueGameplayVideo } from "@/lib/schema";

// ── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Story rebuild 2026-08-04. Replaced the 360vh Rive ecosystem section with
// static sections lifted from app/programs/ekuzo101/page.tsx. Initial payload
// dropped ~10.25 MB -> ~2.72 MB (-73%). The Rive component and its assets are
// still required by five other routes; see docs/QA-FLAGGED-ISSUES.md #14.
//
// Band order: red -> grey -> white -> purple -> black -> grey -> black -> white -> red
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "EKUZO — Every Gamer Deserves a Team",
  description:
    "Youth esports coaching programs that turn gaming into growth. Structured practice, skilled coaching, and real competition for every gamer.",
  openGraph: {
    title: "EKUZO — Every Gamer Deserves a Team",
    description: "Transformational esports coaching programs for youth gamers.",
    url: "https://ekuzo.gg",
    siteName: "EKUZO",
    locale: "en_US",
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
  { label: "Deliberate practice", icon: "/icons/swords-white.svg" },
  { label: "Skilled coaching", icon: "/icons/clock-white.svg" },
  { label: "Real competition", icon: "/icons/trophy-white.svg" },
];

// Lifted from ekuzo101 pilotSteps, shortened for homepage and de-pilot-ed.
const seasonSteps = [
  {
    num: "01",
    title: "LEARN TO SKATE",
    desc: "Mechanics first, then roles. How you play, and how five positions become a team. You'll fall plenty. Every good player did.",
  },
  {
    num: "02",
    title: "PLAY AS A TEAM",
    desc: "Solo queue ends here. Shot calling, playing objectives together, and communicating when it's going badly.",
  },
  {
    num: "03",
    title: "APPLY TO LIFE",
    desc: "Emotional regulation after a loss. Giving feedback that helps. Screen-time habits your kid sets themselves.",
  },
  {
    num: "04",
    title: "COMPETE",
    desc: "It comes together in real competition against other EKUZO squads, with their name on the roster.",
  },
];

// Lifted from ekuzo101 kidHypeBeats. Card 01 carries the share-link mechanic,
// reworded EKUZO-wide (confirmed with Jamie 2026-08-04).
const kidHypeBeats = [
  {
    title: "Bring your crew",
    desc: "Sign up, then send your friends the link. Anyone who joins through it lands on your team.",
  },
  {
    title: "Coached play",
    desc: "90 minutes with a real coach. Warmup, lesson, scrims, and a debrief where the team talks it through.",
  },
  {
    title: "Grow together",
    desc: "Take the people you meet with you. Discord, other games, next season.",
  },
];

// Lifted from ekuzo101 coachCards, bios shortened for homepage.
const coachCards = [
  {
    name: 'KARLIN "FAITH" OEI',
    role: "Founder // Peak Challenger Jungler",
    bio: "Former national collegiate captain who won over $80,000 in esports scholarships through competitive play. He believes games played properly are among the best teachers of discipline and resilience.",
    image: "/images/authors/coach-karlin-faith-1400.jpg",
    objectPosition: "center 20%",
  },
  {
    name: 'SEBASTIEN "ZZLEGENDARY" DEMONTIGNY',
    role: "Head Coach // Professional Esports Coach",
    bio: "Coached at Dignitas and Evil Geniuses, with 4+ years in youth esports. He knows what it takes to bring out the best in young players.",
    image: "/images/coach-sebastien-ZzLegendary.webp",
    objectPosition: "center top",
  },
  {
    name: 'NURI "TEEMO TIME" JE',
    role: "Coach // Diamond Support",
    bio: "Community manager for the University of Texas at Austin and Alienware Ambassador. She brings public-school teaching experience to how kids grow beyond the classroom.",
    image: "/images/coach-nuri-je.webp",
    objectPosition: "center 60%",
  },
];

// Section-view tracking manifest. `id` must match the DOM id on the section
// (or its wrapper); `name` is the stable GA slug, so renaming one orphans its
// history. Order here is the order on the page and becomes `section_index`,
// which is what makes the GA funnel readable as drop-off.
const HOME_SECTIONS = [
  { id: "hero", name: "hero" },
  { id: "growth", name: "growth_band" },
  { id: "progression", name: "progression" },
  { id: "for-players", name: "for_players" },
  { id: "how-it-works", name: "how_it_works" },
  { id: "coaches", name: "coaches" },
  // DOM id is "for-parents" because it doubles as a nav anchor; the GA slug
  // names what the section actually says.
  { id: "for-parents", name: "zero_tolerance" },
  { id: "testimonials", name: "testimonials" },
  { id: "footer-cta", name: "footer_cta" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={testimonialVideoGraph} />
      <JsonLd data={leagueGameplayVideo} />
      <TrackSectionView sections={HOME_SECTIONS} />

      {/* ═════════════════════════════════════════════════════════════════
          1. HERO — bg-red — UNCHANGED from live
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative bg-red overflow-visible"
        style={{ paddingTop: "clamp(100px, 12vw, 160px)", paddingBottom: "clamp(200px, 30vw, 400px)" }}
      >
        <div className="absolute top-0 left-0 w-full z-20">
          <Nav variant="dark" />
        </div>

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
            fetchPriority="high"
            className="object-cover"
            style={{ objectPosition: "center 80%" }}
            sizes="100vw"
          />
        </div>

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

        <ParallaxBird />

        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
          style={{
            height: "clamp(115px, 19vw, 300px)",
            transform: "translateY(52%)",
            backgroundImage: "url(/images/new%20torn%20paper/torn-paper-white-1@2x.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          2. EKUZO MAKES IT POSSIBLE — bg-grey — COPY FIX
          Same layout and same growth-collage asset as live. The H2 now
          finishes the sentence the hero starts, and one line under it
          says what EKUZO actually does.
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="growth"
        className="relative bg-grey"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          <h2
            className="font-body font-bold text-black leading-[1] max-w-[1000px] mb-[40px] md:mb-[64px]"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Structured gaming with a team, a coach, and a season around it.
          </h2>

          <div className="flex flex-col md:flex-row gap-[40px] md:gap-[90px] items-start">
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

      {/* ═════════════════════════════════════════════════════════════════
          3. WHAT A SEASON LOOKS LIKE — bg-white — NEW
          ekuzo101 §5 progression rows, shortened and de-pilot-ed.
          This is the section that answers "what actually happens".
      ═════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={1} />
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
          id="progression"
        >
          <div className="max-w-[1232px] mx-auto">
            <ScrollReveal>
              <div className="flex items-start mb-4">
                <Eyebrow>How it works</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-black leading-[0.85] mb-12"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                What progression looks like
              </h2>
            </ScrollReveal>

            <div className="flex flex-col gap-4">
              {seasonSteps.map((step) => (
                <div
                  key={step.num}
                  className="transition-all duration-200 group hover:translate-x-2 bg-black/8 hover:bg-red"
                  style={{
                    padding: "2px",
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <div
                    className="grid grid-cols-[80px_1fr] lg:grid-cols-[100px_1fr_2fr] bg-white relative overflow-hidden"
                    style={{
                      clipPath: "polygon(23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%, 0 23px)",
                    }}
                  >
                    <div
                      className="font-display text-red flex items-center justify-center border-r border-black/8 uppercase"
                      style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
                    >
                      {step.num}
                    </div>
                    <div className="p-6 lg:p-8 flex flex-col justify-center border-r-0 lg:border-r border-black/8">
                      <h3 className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
                        {step.title}
                      </h3>
                    </div>
                    <div
                      className="col-span-full lg:col-span-1 px-6 pb-6 lg:p-8 flex items-center font-body text-black/80 leading-relaxed"
                      style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          4. FOR GAMERS — purple — NEW — THIS REPLACES THE RIVE
          ekuzo101 §6, shortened. Opens in the kid's voice (hype beats),
          then turns to the parent rationale at "The game" / "The setup".
          The tech collage here is the colorized sibling of the artwork
          that was inside the Rive.
      ═════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-visible" id="for-players">
        <TornPaperDivider color="purple" variant="top" style={1} />
        <section
          className="relative overflow-clip"
          style={{
            backgroundColor: "#AE2CF2",
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div
            className="absolute top-0 right-0 z-0 pointer-events-none"
            style={{
              width: "min(60vw, 700px)",
              height: "min(60vw, 700px)",
              opacity: 0.12,
              transform: "translate(15%, -15%)",
            }}
            aria-hidden="true"
          >
            <Image
              src="/images/brush-stroke-8.png"
              alt=""
              fill
              sizes="(max-width: 768px) 60vw, 700px"
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          <div className="max-w-[1232px] mx-auto relative z-10">
            <ScrollReveal className="mb-16">
              <div className="flex items-start mb-4">
                <Eyebrow variant="light">For players</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-white leading-[0.85] mb-8"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
              >
                Your team.<br />
                <span className="text-black">Your turn.</span>
              </h2>
              <p
                className="font-body text-white leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)" }}
              >
                You get a squad and a coach who knows what it takes. Warm up, get the lesson, scrim, then
                sit down with your team and go through what happened. It builds to a showcase your team
                will be proud of.
              </p>
            </ScrollReveal>

            {/* Hype-beat cards — yellow numerals on black cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              {kidHypeBeats.map((beat, i) => (
                <div
                  key={beat.title}
                  className="bg-black p-8 transition-transform duration-300 ease-out hover:-translate-y-1.5"
                  style={{
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <span
                    className="font-display leading-none block mb-4"
                    style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", color: "#E0FF4F" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-display uppercase text-white leading-[0.9] mb-3"
                    style={{ fontSize: "clamp(1.75rem, 2.6vw, 2.25rem)" }}
                  >
                    {beat.title}
                  </h3>
                  <p className="font-body text-white/75 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
                    {beat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* The game — League clip. Click-to-play, preload="metadata". */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <WhatWePlayVideo
                src="/videos/league-of-legends-camp.mp4"
                poster="/videos/league-of-legends-camp-poster.jpg"
                label="League of Legends gameplay at EKUZO"
                trackingId="league_clip"
                trackingSection="for_players"
              />

              <div className="flex flex-col gap-6">
                <div className="flex items-start">
                  <Eyebrow variant="light">The game</Eyebrow>
                </div>
                <h3
                  className="font-body font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                >
                  League of Legends plays like a sport.
                </h3>
                <p className="font-body text-white/90 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Five players, defined roles, a shared objective, and a playbook that changes every match.
                  It&apos;s free to play, runs on most family computers, and has none of the loot-box pressure
                  parents watch for.
                </p>
              </div>
            </div>

            {/* The setup — tech collage. This is the Rive's artwork, static. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <div className="flex flex-col gap-6 order-2 lg:order-1">
                <div className="flex items-start">
                  <Eyebrow variant="light">The setup</Eyebrow>
                </div>
                <h3
                  className="font-body font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                >
                  If you have a laptop, you have a team.
                </h3>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  A computer that runs the game, internet that holds up, and a headset with a mic. We walk
                  you through the rest at onboarding.
                </p>
              </div>
              <div className="relative w-full order-1 lg:order-2" style={{ aspectRatio: "584/694" }}>
                <Image
                  src="/images/tech-collage-color@2x.webp"
                  alt="Laptop, headset, keyboard, and mouse collage"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-contain object-center"
                />
              </div>
            </div>

            {/* Fortnite bridge — compressed from ekuzo101's full-height card. */}
            <div
              className="bg-white p-10 md:p-12"
              style={{
                clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start">
                <h3
                  className="font-display uppercase text-black"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "0.85", letterSpacing: "0.02em" }}
                >
                  My kid plays<br />
                  Fortnite, Roblox,<br />Rocket League.<br />
                  <span style={{ color: "#AE2CF2" }}>Will this work?</span>
                </h3>
                <div className="flex flex-col gap-4">
                  <p className="font-body font-bold text-black leading-snug" style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)" }}>
                    Yes. Communicating under pressure, reading the game, and holding a role carry between games.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    A Fortnite player builds better game sense here. A Rocket League player gets sharper on comms.
                    Your kid does not need to be a League player to benefit.
                  </p>
                  <p className="font-body text-black/50 text-sm leading-relaxed pt-2 border-t border-black/10">
                    All skill levels welcome, beginners included.{" "}
                    <TrackedLink
                      cta="faq_link"
                      section="for_players"
                      href="/faq"
                      className="text-black underline underline-offset-2 hover:text-red"
                    >
                      More in the FAQ
                    </TrackedLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          5. 2 WAYS TO PLAY AND LEARN — bg-black — UNCHANGED from live
          Wrapped so the purple band gets a black torn seam into it.
      ═════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-visible" id="how-it-works">
        <TornPaperDivider color="black" variant="top" style={1} />
        <HomeHowItWorks />
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          6. COACHES — bg-grey — NEW
          ekuzo101 §4, recolored from the black band to grey so it doesn't
          collide with the black section above. Cards stay white.
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="coaches"
        className="bg-grey relative overflow-clip"
        style={{
          paddingTop: "clamp(80px, 14vw, 144px)",
          paddingBottom: "clamp(80px, 14vw, 144px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          <ScrollReveal>
            <div className="flex items-start mb-4">
              <Eyebrow>Our team</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-4"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Learn from the best
            </h2>
            <p className="font-body text-black/60 leading-relaxed mb-14 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Our coaches competed at a high level and then chose to teach. They run practice, and they set
              the standard for how teammates talk to each other.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coachCards.map((coach) => (
              <div key={coach.name} className="group transition-all duration-300 lg:hover:-translate-y-2">
                <div
                  className="bg-white overflow-hidden"
                  style={{
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <div className="relative w-full h-[280px] overflow-hidden border-b border-black/8">
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="object-cover transition-transform duration-300 lg:group-hover:scale-105"
                      style={{ objectPosition: coach.objectPosition }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-black leading-none mb-2" style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}>
                      {coach.name}
                    </h3>
                    <p className="font-body text-red text-xs font-bold uppercase tracking-wider mb-4">{coach.role}</p>
                    <p className="font-body text-black/70 text-sm leading-relaxed">{coach.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          7. ZERO TOLERANCE — bg-black — NEW
          ekuzo101 §7, body shortened. Pilot language swapped for season.
      ═════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-visible" id="for-parents">
        <TornPaperDivider color="black" variant="top" style={2} />
        <section
          className="bg-black relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 lg:gap-20 items-start">
              <div>
                <div className="flex items-start mb-4">
                  <Eyebrow variant="light">Zero tolerance</Eyebrow>
                </div>
                <h2
                  className="font-display uppercase text-white leading-[0.82] mb-10"
                  style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
                >
                  No toxic lobbies.<br />
                  <span className="text-red">Ever.</span>
                </h2>
                <p className="font-body text-white/80 leading-relaxed mb-10" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}>
                  Every match happens in private, EKUZO-moderated servers. No public matchmaking, no strangers.
                  Coaches enforce the Code of Conduct from session one, and every player signs it before they play.
                </p>

                <p
                  className="font-body font-black text-white mb-6"
                  style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)", lineHeight: "1.1" }}
                >
                  No trolling. No targeting. Crash-outs get coached.
                </p>

                <ul className="flex flex-col gap-3">
                  {[
                    "Slurs, harassment, or targeted insults: the coach removes the player immediately",
                    "Trolling or trash talk in public lobbies: we don't play in public lobbies",
                    "Sharing personal information, off-platform DMs, screenshots without consent",
                    "Blame-casting, rage-quitting, or repeated behavior that hurts the team",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <span className="mt-2 shrink-0 w-2 h-2 bg-red" aria-hidden="true" />
                      <span className="font-body text-white/70 leading-relaxed" style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}>
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:sticky lg:top-24">
                <div
                  className="bg-red"
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <p
                    className="font-display text-white uppercase"
                    style={{ fontSize: "clamp(2.5rem, 6.3vw, 5.25rem)", lineHeight: "0.85", letterSpacing: "0.02em" }}
                  >
                    If it wouldn&apos;t fly in a school hallway,
                  </p>
                  <p
                    className="font-display text-black uppercase mt-2"
                    style={{ fontSize: "clamp(2.5rem, 6.3vw, 5.25rem)", lineHeight: "0.85", letterSpacing: "0.02em" }}
                  >
                    it doesn&apos;t fly here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TornPaperDivider color="black" variant="bottom" style={2} />
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          8. WHAT PARENTS ARE SAYING — bg-white — UNCHANGED from live
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="testimonials"
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

          <div className="flex flex-col items-center text-center gap-6 pt-8">
            <Image
              src="/images/testimonial-quote-mark.png"
              alt=""
              width={88}
              height={80}
              className="mb-4"
              // Next warns when only one dimension is constrained by CSS; this
              // keeps the 88x80 aspect ratio explicit and silences it.
              style={{ width: "auto", height: "auto" }}
              aria-hidden="true"
            />
            <p
              className="font-body font-bold text-black leading-[1.357] max-w-[444px]"
              style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
            >
              &ldquo;It&apos;s structure, mentorship, and community all in one place.&rdquo;
            </p>
            <div className="flex flex-col">
              <p className="font-body font-medium text-black leading-[1.357]" style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}>
                Rudy May
              </p>
              <p className="font-body text-black/60 leading-[1.417]" style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}>
                EKUZO mom
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          9. FOOTER BANNER + FOOTER — UNCHANGED from live
      ═════════════════════════════════════════════════════════════════ */}
      {/* Wrapper exists only to give TrackSectionView a DOM id to observe:
          FooterBanner takes no id prop. Static div, no overflow/positioning,
          so the banner's absolutely-positioned torn-paper cap is unaffected. */}
      <div id="footer-cta">
        <FooterBanner heading="Enroll into a transformational program today" />
      </div>
      <Footer />
    </>
  );
}
