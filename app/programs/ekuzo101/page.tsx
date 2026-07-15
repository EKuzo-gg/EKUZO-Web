import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import Image from "next/image";
import TestimonialVideo from "@/components/ui/TestimonialVideo";
import WhatWePlayVideo from "@/components/ui/WhatWePlayVideo";
import Eyebrow from "@/components/ui/Eyebrow";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TrackedRegisterLink from "@/components/ui/TrackedRegisterLink";

// ── EKUZO 101: Summer Pilot landing page ────────────────────────────────────
// Rebuilt 2026-07-15 as a structural clone of the canonical camps v2 page
// (app/programs/ekuzo-camps/page.tsx) with 101 copy and free-pilot framing.
// Section arc mirrors camps' VISIBLE sections: ticker, hero, overview grid,
// coaches, progression rows, For Gamers (purple), Code of Conduct,
// testimonials, register CTA, FAQ, footer banner. Camps' hidden ({false && ...}) sections
// (Mission, Take Your Team, Team Matching, Discord for Families) are not
// carried over.
// Noindex: pilot program, not for public search indexing. No JSON-LD.
// Copy source: docs/ekuzo101-pilot/copy-deck.md (frozen 2026-07-15), with
// program-fact overrides: times are stated as local time, and the page makes
// no fixed-roster promises (drop-in friendly availability model).
// Note: no <TrackPageView> here. Its `program` prop union is
// "camps" | "ekuzo100" | "ekuzo-teams" and this build cannot touch shared
// components. Add "ekuzo101" to the union later if 101 analytics are wanted.

export const metadata = {
  title: "EKUZO 101 Summer Pilot: Try It Free",
  description:
    "4 weeks of elite esports coaching. You pick the weeks. Free upfront.",
  alternates: { canonical: "/programs/ekuzo101" },
  robots: { index: false, follow: true },
};

// ── Data ─────────────────────────────────────────────────────────────────────

// How it works: rendered in the camps "5-day progression" row layout, with
// step numbers in place of camps' day letters. Steps 02-04 are camps'
// curriculum copy (Play as a Team simplified; Compete adapted from
// camp-week Friday to the pilot's end-of-program tournament). Step 01 is
// interim copy per Jamie 2026-07-15 (final copy TBD).
const pilotSteps = [
  {
    num: "01",
    title: "LEARN TO SKATE",
    desc: "The fundamentals come in two parts: mechanics, how you play the game, and roles, how five positions become a team. You'll fall plenty. Every good player did.",
  },
  {
    num: "02",
    title: "PLAY AS A TEAM",
    desc: "Solo queue ends here. Squads focus on shot calling, playing for objectives together, and communicating under pressure.",
  },
  {
    num: "03",
    title: "APPLY TO LIFE",
    desc: "Emotional regulation after a loss, giving constructive feedback, screen-time management, and healthy competitive mindsets.",
  },
  {
    num: "04",
    title: "COMPETE",
    desc: "It all culminates in a week of pure competition. Put it all together against other squads in showcase matches for a taste of our streamed tournaments.",
  },
];

const coachCards = [
  {
    name: 'KARLIN "FAITH" OEI',
    role: "Founder // Peak Challenger Jungler",
    bio: "Former national collegiate captain who won $80,000+ in esports scholarships through competitive play - Karlin believes that games (if played correctly) are one of the best teachers of discipline, teamwork, and resilience.",
    image: "/images/coach-karlin-faith.jpg",
    objectPosition: "center 20%",
  },
  {
    name: 'SEBASTIEN "ZZLEGENDARY" DEMONTIGNY',
    role: "Head Coach // Professional Esports Coach",
    bio: "Coached at professional esports teams like Dignitas and Evil Geniuses and has 4+ years experience working in youth esports. He knows what it takes to bring out the best in young players.",
    image: "/images/coach-sebastien-ZzLegendary.png",
    objectPosition: "center top",
  },
  // Nuri's card carried verbatim from camps per Jamie 2026-07-15. She is
  // being replaced soon but stays on the page for now.
  {
    name: 'NURI "TEEMO TIME" JE',
    role: "Coach // Diamond Support",
    bio: "Community manager for the University of Texas at Austin and Alienware Ambassador. Nuri brings knowledge from teaching in public schools to understand how children can grow beyond what is taught in schools.",
    image: "/images/coach-nuri-je.png",
    objectPosition: "center 60%",
  },
];

// For Gamers hype beats: 101 versions of camps' kid-energy cards. Card 1
// carries the recruit-your-friends share-link mechanic.
const kidHypeBeats = [
  {
    title: "Bring your crew",
    desc: "After you register, you get a share link. Friends who sign up through it get grouped together, and each family still picks its own weeks.",
  },
  {
    title: "Coached play",
    desc: "90 minutes, twice a week. Warmup, lesson, scrims, and a debrief where the team talks through what happened. A real coach runs every session.",
  },
  {
    title: "Grow together",
    desc: "Take the people you meet with you. Connect on Discord, play here, and in other games too.",
  },
];

// FAQ: exactly seven questions in Jamie's approved order (2026-07-15).
// Answers pull from knowledge-base/company/knowledge/ekuzo-faq-canon.md
// where canon exists; pilot-specific answers are flagged as canon-backport
// candidates.
const faqItems = [
  {
    // From ekuzo-faq-canon.md "What age range is EKUZO for?" Verbatim. Sync date: 2026-07-15.
    question: "What age range is this for?",
    answer: "Students aged 10-18. We group players by age and skill level.",
  },
  {
    // From ekuzo-faq-canon.md "What games does EKUZO play?" and "My kid plays Fortnite..." answers. Sync date: 2026-07-15.
    question: "What games do you play?",
    answer:
      "EKUZO trains on League of Legends. It provides rich team dynamics, communication requirements, and deep strategy. It's free to play and doesn't require high-end hardware. Your gamer will need a computer (PC or Mac) that can run the game, a stable internet connection, and a headset with a mic. The competitive fundamentals - communication, decision-making under pressure, role discipline, and map and team awareness - carry over to the other games your kid already plays. Students consistently get better at all of them.",
  },
  {
    // Drawn from ekuzo-faq-canon.md "Is this safe for beginners?" and "Isn't coaching just for elite players?" answers. Sync date: 2026-07-15.
    question: "Does my child need experience?",
    answer:
      "No. Coaches meet students where they are, from casual to aspiring competitors, and ensure every team is inclusive and supportive. If your gamer is new to the game, that's fine. New players are exactly who the structure is built for - a beginner gains almost nothing from grinding solo queue alone. A coached environment is where the actual learning happens.",
  },
  {
    // Pilot-specific. Not in ekuzo-faq-canon.md as of 2026-07-15 - canon-backport candidate.
    question: "What if we miss a week?",
    answer:
      "Sessions are live and coach-led, so there is a real-time element. If your family needs to skip a week, that week simply doesn't count toward your four. You choose from the available six-week window, so the schedule has built-in flexibility for summer travel and busy patches. Missing one doesn't end the program.",
  },
  {
    // Adapted from ekuzo-faq-canon.md "Can parents see what happens in Discord? Who controls the account?" Sync date: 2026-07-15.
    question: "We use Discord. What does that mean for my family?",
    answer:
      "The Discord account belongs to the parent, not the child. You have access to every chat and voice channel in your gamer's team, whenever you want to check in. The team server is private, invite-only, and moderated by the coach, and EKUZO admins have full visibility for oversight. It is separate from any public Discord communities your child may have joined elsewhere.",
  },
  {
    // Pilot-specific, built from approved program facts (free pilot, donation-based, team program $160/mo, friends free). Not in ekuzo-faq-canon.md as of 2026-07-15 - canon-backport candidate.
    question: "What happens after the pilot?",
    answer:
      "The pilot is an entry point, not a dead end. Students who love their four weeks can continue into the team program ($160/mo, $13.33/hr for sessions), where they stay with consistent teammates, deepen their skills, and compete throughout the season. Families decide after experiencing the program firsthand. If you don't continue, you part ways and nothing is owed: no automatic renewal, no card on file.",
  },
  {
    // Pilot-specific, built from approved program facts. Not in ekuzo-faq-canon.md as of 2026-07-15 - canon-backport candidate.
    question: "Is it really free?",
    answer:
      "Yes. No card is required to register, and nothing is ever charged automatically. We're confident in our experience, so the pilot is donation-based at the end: if the four weeks were valuable to your family, you pay what you think it was worth. If it wasn't, you owe nothing.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Ekuzo101LandingPage() {
  return (
    <>
      {/* ══ 1. STATS TICKER: purple band above nav (camps section 1) ════════ */}
      <div
        className="overflow-hidden relative"
        style={{ backgroundColor: "#AE2CF2", zIndex: 30 }}
        aria-hidden="true"
      >
        <div style={{ paddingTop: "14px", paddingBottom: "14px" }}>
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: "marquee-101 40s linear infinite" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="flex items-center shrink-0">
                {[
                  "NOW ENROLLING",
                  "TUE / THU EVENINGS",
                  "FREE SUMMER PILOT",
                  "NO CARD REQUIRED",
                  "PICK YOUR WEEKS",
                ].map((item) => (
                  <span
                    key={item}
                    className="font-display text-white text-3xl inline-flex items-center"
                    style={{ letterSpacing: "0.07em" }}
                  >
                    <span className="mx-8">{item}</span>
                    <span style={{ color: "#E0FF4F" }}>✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee-101 {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══ 2. HERO: darkened video, single register CTA (camps section 2) ══
          Same treatment as camps: LoL eyebrow lockup, huge Tungsten
          headline with the last word in red, one-sentence subhead, single
          white CTA. Headline max size reduced from camps' 205px because
          "YOUR FIRST TEAM" is longer than "ESPORTSCAMP". */}
      <div className="relative overflow-visible" style={{ zIndex: 1 }}>
        <section
          className="bg-black relative overflow-clip"
          style={{
            paddingTop: "clamp(120px, 13vw, 180px)",
            paddingBottom: "clamp(120px, 16vw, 220px)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 z-20">
            <Nav variant="dark" />
          </div>

          {/* Background video: same gameplay-atmosphere asset as camps. */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.7, filter: "saturate(0.8) brightness(0.85)" }}
            aria-hidden="true"
          >
            <source src="/videos/camp-hero.mp4" type="video/mp4" />
          </video>

          {/* Soft vignette: center stays brighter, edges darken. */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Subtle red brush-stroke behind the headline. */}
          <div
            className="absolute left-1/2 top-1/2 z-[2] pointer-events-none"
            style={{
              width: "min(80vw, 1100px)",
              height: "min(60vw, 600px)",
              transform: "translate(-50%, -50%)",
              opacity: 0.18,
            }}
            aria-hidden="true"
          >
            <Image
              src="/images/brush-strokes-wide.png"
              alt=""
              fill
              className="object-contain"
              style={{ filter: "brightness(0) saturate(100%) invert(20%) sepia(91%) saturate(7470%) hue-rotate(355deg) brightness(94%) contrast(108%)" }}
            />
          </div>

          <div
            className="max-w-[1232px] mx-auto relative z-[5] text-center"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Eyebrow graphic: "LEAGUE OF LEGENDS" lockup (white SVG). */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/league-of-legends-title.svg"
                alt="League of Legends"
                width={496}
                height={26}
                priority
                style={{ height: "clamp(13px, 1.76vw, 26px)", width: "auto" }}
              />
            </div>

            <h1
              className="font-display text-white uppercase leading-[0.85] mb-6"
              style={{ fontSize: "clamp(64px, 11vw, 160px)" }}
            >
              YOUR FIRST <span className="text-red">ESPORTS TEAM</span>
            </h1>

            {/* Subhead: the pilot one-liner. */}
            <p
              className="font-body text-white/90 leading-relaxed max-w-2xl mx-auto mb-10"
              style={{ fontSize: "clamp(0.9rem, 1.28vw, 1.2rem)" }}
            >
              Experience what esports is all about: fun, community, and
              competition. Four weeks of coached League of Legends as a real team.
            </p>

            <TrackedRegisterLink
              source="hero"
              href="/programs/ekuzo101/register?cta=hero"
              className="inline-block font-body font-bold text-black bg-white rounded-sm px-10 py-4 hover:brightness-90 active:scale-[0.97] active:brightness-75 transition-all duration-150"
              style={{ fontSize: "clamp(0.95rem, 1.44vw, 1.2rem)", letterSpacing: "0.02em", borderRadius: "2px" }}
            >
              Claim Your Spot
            </TrackedRegisterLink>
          </div>
        </section>
      </div>

      {/* ══ 3. PILOT OVERVIEW: 4-card stats grid (camps section 4) ══════════
          Camps' spec sheet, refit for the free pilot: RATIO (1:5, camps'
          exact card), WHEN (4 weeks, Tue/Thu local time), WHERE (online),
          COST (FREE, no strikethrough, "No Card Required" badge). */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={1} />
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(40px, 8vw, 80px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto text-center">
            <ScrollReveal>
              <div className="flex justify-center mb-6">
                <Eyebrow>Pilot Overview</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-black leading-[0.85] mb-8"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Play Hard This Summer
              </h2>
            </ScrollReveal>

            {/* Mobile: each card collapses to ONE inline row. Desktop:
                vertical 4-card row with icons. Same grid as camps. */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-3 border-black bg-white text-left">
              {[
                { icon: "swords" as IconName, label: "RATIO", value: "1:5", desc: "COACH TO STUDENT", badge: null },
                { icon: "calendar" as IconName, label: "WHEN", value: "TUE/THU", desc: "7:00-8:30 PM LOCAL TIME, 4 WEEKS (VACATION-FLEXIBLE)", badge: null },
                { icon: "chat" as IconName, label: "WHERE", value: "ONLINE", desc: "PLAY FROM HOME", badge: null },
                { icon: "loot" as IconName, label: "COST", value: "FREE", desc: null, badge: "No Card Required" },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`
                    flex flex-row items-baseline justify-between gap-3
                    lg:flex-col lg:items-stretch lg:justify-between lg:gap-0
                    border-black/10 transition-transform duration-300 ease-out
                    lg:hover:-translate-y-1
                    ${i < 3 ? "border-b lg:border-b-0" : ""}
                    ${i < 3 ? "lg:border-r" : ""}
                  `}
                  style={{ padding: "clamp(0.875rem, 4vw, 3.5rem) clamp(1rem, 3vw, 2.5rem)" }}
                >
                  {/* Label (red). */}
                  <div className="flex flex-col shrink-0">
                    <div className="hidden lg:block mb-10">
                      <Icon name={card.icon} size={60} className="w-[60px] h-[60px]" />
                    </div>
                    <div
                      className="font-display text-red uppercase tracking-wide lg:mb-2"
                      style={{ fontSize: "clamp(1.875rem, 7vw, 3rem)", fontWeight: 700, lineHeight: "0.85" }}
                    >
                      {card.label}
                    </div>
                  </div>

                  {/* Value over desc/badge. */}
                  <div className="flex flex-col items-end lg:items-start min-w-0">
                    <div
                      className="font-display text-black leading-[0.85] font-bold flex items-baseline gap-1.5 lg:gap-3 flex-nowrap"
                      style={{ fontSize: "clamp(1.875rem, 7vw, 6rem)" }}
                    >
                      {card.value}
                    </div>
                    {card.badge ? (
                      <span className="inline-block bg-[#ffd200] text-black font-body font-bold text-[11px] lg:text-base px-2.5 lg:px-4 py-0.5 lg:py-1.5 rounded-full mt-2 lg:mt-5 whitespace-nowrap">
                        {card.badge}
                      </span>
                    ) : card.desc ? (
                      <div className="font-body text-black/50 mt-1.5 lg:mt-5 text-right lg:text-left" style={{ fontSize: "clamp(0.7rem, 1.2vw, 1.1rem)", lineHeight: "1.2" }}>{card.desc}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ 4. COACHES: credibility right after the overview (camps section 5)
          Same black band + clipped white cards as camps, 3-card grid.
          Intro paragraph is camps' coach copy verbatim with "campers"
          swapped to "students" (per Jamie 2026-07-15). */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
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
            <ScrollReveal>
              <div className="flex items-start mb-4">
                <Eyebrow variant="light">Our Team</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-white leading-[0.85] mb-4"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Learn from the best
              </h2>
              <p className="font-body text-white/60 leading-relaxed mb-14 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                Our coaching team combines competitive gaming experience with a passion for teaching. They guide students through structured practice, teamwork, communication, and healthy gaming habits. Parents can feel confident knowing their kids are learning from mentors who prioritize growth, sportsmanship, and confidence - both on and off the screen.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coachCards.map((coach) => (
                <div
                  key={coach.name}
                  className="group transition-all duration-300 lg:hover:-translate-y-2"
                >
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
                        className="object-cover transition-transform duration-300 lg:group-hover:scale-105"
                        style={{ objectPosition: coach.objectPosition }}
                      />
                    </div>
                    <div className="p-6">
                      <h4
                        className="font-display text-black leading-none mb-2"
                        style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}
                      >
                        {coach.name}
                      </h4>
                      <p className="font-body text-red text-xs font-bold uppercase tracking-wider mb-4">
                        {coach.role}
                      </p>
                      <p className="font-body text-black/70 text-sm leading-relaxed">
                        {coach.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <TornPaperDivider color="black" variant="bottom" style={1} />
      </div>

      {/* ══ 5. HOW THE PILOT WORKS: progression rows (camps section 6) ══════
          Camps' 5-day curriculum row layout, refit as the 4-step pilot
          flow. Step numbers replace day letters. No top divider: the
          Coaches black-bottom divider handles the transition into white. */}
      <div className="relative overflow-visible">
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
          id="how-it-works"
        >
          <div className="max-w-[1232px] mx-auto">
            <ScrollReveal>
              <div className="flex items-start mb-4">
                <Eyebrow>How It Works</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-black leading-[0.85] mb-12"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Simple. Flexible. No card required.
              </h2>
            </ScrollReveal>

            <div className="flex flex-col gap-4">
              {pilotSteps.map((step) => (
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
                    <div className="font-display text-red flex items-center justify-center border-r border-black/8 uppercase" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
                      {step.num}
                    </div>
                    <div className="p-6 lg:p-8 flex flex-col justify-center border-r-0 lg:border-r border-black/8">
                      <h3 className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
                        {step.title}
                      </h3>
                    </div>
                    <div className="col-span-full lg:col-span-1 px-6 pb-6 lg:p-8 flex items-center font-body text-black/80 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ 6. FOR GAMERS: kid-first lead + parent rationale (camps section 9)
          Same purple band, hype-beat cards, What We Play video column, The
          Setup column, and the Fortnite/Smash/Rocket League bridge card.
          Copy refit for the pilot (fun-first kid frame, ends in a casted
          bracket); the share-link (recruit your friends) mechanic leads
          the beats. */}
      <div className="relative overflow-visible" id="for-gamers">
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
          {/* Subtle brush stroke behind the headline area for texture */}
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
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          <div className="max-w-[1232px] mx-auto relative z-10">
            {/* Top: Kid-energy headline + lead */}
            <ScrollReveal className="mb-16">
              <div className="flex items-start mb-4">
                <Eyebrow variant="light">For Gamers</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-white leading-[0.85] mb-8"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
              >
                Your team. Your nights.<br />
                <span className="text-black">Your summer.</span>
              </h2>
              <p
                className="font-body text-white leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)" }}
              >
                You&apos;re joining a squad with a coach who knows
                what it takes. Warmup, get the lesson, drill, and scrim to make it
                real. VOD review with your team. By the end, you&apos;re playing in a
                casted bracket against other EKUZO squads. Think of it as the most
                structured, coached play you&apos;ve ever queued up for.
              </p>
            </ScrollReveal>

            {/* Hype-beat cards: black bg cards on the purple section. */}
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
                    style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", color: "#AE2CF2" }}
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

            {/* Two-column: video left + Why League of Legends right. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <WhatWePlayVideo
                src="/videos/league-of-legends-camp.mp4"
                label="League of Legends gameplay at EKUZO"
              />

              <div className="flex flex-col gap-6">
                <div className="flex items-start">
                  <Eyebrow variant="light">The Game</Eyebrow>
                </div>
                <h3
                  className="font-body font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                >
                  League of Legends plays like a sport.
                </h3>
                <p className="font-body text-white/90 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  League works like a traditional sport. Five players. Defined roles. A shared objective. A playbook that evolves every match. It&apos;s also free-to-play, runs on most family computers, and stays free of the loot-box pressure parents have learned to watch for.
                </p>
                <p className="font-body text-white/90 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Your gamer is learning communication, adaptation, teamwork, and decision making under pressure: the kind of fundamentals that transfer to every other game they&apos;ll touch. And the kind of fundamentals that show up at school, on a real sports field, and in a first job.
                </p>
              </div>
            </div>

            {/* Two-column: What Do I Need copy + tech collage image. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <div className="flex flex-col gap-6 order-2 lg:order-1">
                <div className="flex items-start">
                  <Eyebrow variant="light">The Setup</Eyebrow>
                </div>
                <h3
                  className="font-body font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                >
                  If you have a laptop, you have a team.
                </h3>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  The pilot runs fully online. Players need access to a laptop or desktop computer (nothing fancy), a stable internet connection, and a headset with a mic.
                </p>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  League of Legends is free to download and play, and runs on both PC and Mac.
                </p>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Our onboarding will confirm and walk you through an easy setup.
                </p>
              </div>
              <div className="relative w-full order-1 lg:order-2" style={{ aspectRatio: "584/694" }}>
                <Image
                  src="/images/tech-collage-color@2x.webp"
                  alt="Laptop, headphones, keyboard, and game console collage"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-contain object-center"
                />
              </div>
            </div>

            {/* Fortnite / Smash / Rocket League bridge callout. */}
            <div
              className="bg-white p-10 md:p-12"
              style={{
                clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start">
                <h3
                  className="font-display uppercase text-black"
                  style={{ fontSize: "clamp(2.5rem, 6.3vw, 5.25rem)", lineHeight: "0.85", letterSpacing: "0.02em" }}
                >
                  My kid plays<br />
                  Fortnite, Roblox,<br />Rocket League.<br />
                  <span style={{ color: "#AE2CF2" }}>Will this work?</span>
                </h3>
                <div className="flex flex-col gap-4">
                  <p className="font-body font-bold text-black leading-snug" style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)" }}>
                    Yes. Our experience is built around competitive fundamentals that carry across games.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    Most multiplayer games ask kids to do the same things: communicate under pressure, make quick decisions, understand their role, read the game, and work with teammates. League of Legends makes those skills easy to coach because the team structure is clear: five players, defined roles, shared objectives, and constant communication.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    That means your child does not need to be a League player to benefit.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    A Fortnite player can build better game sense.<br />
                    A Rocket League player can improve team communication.<br />
                    A Roblox player can experience a sandbox of self-expression safely.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    The game may be different. The fundamentals carry.
                  </p>
                  <p className="font-body text-black/50 text-sm leading-relaxed pt-2 border-t border-black/10">
                    All skill levels are welcome, beginners included. No League experience required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ 7. CODE OF CONDUCT / ZERO TOLERANCE (camps section 10) ══════════
          Same black band, oversized headline, what's-not-allowed list, and
          school-hallway pull quote. "Camper/camp" language swapped for
          player/pilot; content otherwise carried from camps. */}
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
              {/* Left column: headline + body */}
              <div>
                <div className="flex items-start mb-4">
                  <Eyebrow variant="light">Zero Tolerance</Eyebrow>
                </div>
                <h2
                  className="font-display uppercase text-white leading-[0.82] mb-10"
                  style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
                >
                  No toxic lobbies.<br />
                  <span className="text-red">Ever.</span>
                </h2>
                <p className="font-body text-white/80 leading-relaxed mb-6" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}>
                  All gameplay happens in private, EKUZO-moderated servers. No public matchmaking. No random strangers. No trash talk. Coaches enforce a strict Code of Conduct from the first session.
                </p>
                <p className="font-body text-white/60 leading-relaxed mb-10" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>
                  Every player signs the Code of Conduct before the pilot begins. It&apos;s short, plainly written, and we hold the line on it.
                </p>

                <p
                  className="font-body font-black text-white mb-6"
                  style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)", lineHeight: "1.1" }}
                >
                  No trolling. No targeting. Crash-outs get coached.
                </p>

                {/* "What's not allowed": quick scannable list. */}
                <ul className="flex flex-col gap-3">
                  {[
                    "Slurs, harassment, or targeted insults: coach removes the player immediately",
                    "Public-matchmaking trolling or trash talk: we don't play in public lobbies",
                    "Sharing personal information, off-platform DMs, screenshots without consent",
                    "Blame-casting, rage-quitting, or repeated behavior that hurts the team",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <span className="mt-2 shrink-0 w-2 h-2 bg-red" aria-hidden="true" />
                      <span className="font-body text-white/70 text-sm leading-relaxed" style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}>
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column: school-hallway pull quote card */}
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

      {/* ══ 8. TESTIMONIALS: Rajitha video + pull quotes (camps section 12) ═ */}
      <div className="relative overflow-visible">
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="flex items-start mb-4">
              <Eyebrow>Testimonials</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-16"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Real stories from EKUZO families
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <TestimonialVideo
                src="/testimonial-videos/rajitha-parent.mp4"
                name="Rajitha"
                role="EKUZO parent"
              />

              <div className="flex flex-col gap-8">
                {[
                  {
                    quote: "The coaches are very intentional about teaching that behind each avatar is a real person.",
                    name: "Brad",
                    role: "Parent of a girl gamer",
                  },
                  {
                    quote: "I've seen a more focused importance of where he's spending that screen time, and that's been really great.",
                    name: "Becky",
                    role: "EKUZO parent",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="bg-black/10"
                    style={{
                      padding: "2px",
                      clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                    }}
                  >
                    <blockquote
                      className="bg-white relative"
                      style={{
                        padding: "clamp(1.5rem, 3vw, 2.5rem)",
                        clipPath: "polygon(23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%, 0 23px)",
                      }}
                    >
                      <Image
                        src="/images/testimonial-quote-mark.png"
                        alt=""
                        width={56}
                        height={48}
                        className="mb-5"
                        aria-hidden="true"
                      />
                      <p
                        className="font-body font-bold text-black leading-snug mb-6"
                        style={{ fontSize: "clamp(1.125rem, 1.9vw, 28px)" }}
                      >
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <footer>
                        <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>{t.name}</span>
                        <span className="font-body text-black/50 block text-sm">{t.role}</span>
                      </footer>
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial video styles: red play button, overlay, shadow.
              These power the <TestimonialVideo> component's class names. */}
          <style>{`
            .camps-testimonial-video-wrap {
              display: flex;
              justify-content: center;
            }
            .camps-video-wrapper {
              position: relative;
            }
            .camps-video-shadow {
              position: absolute;
              top: 16px;
              left: 13px;
              right: -13px;
              bottom: -16px;
              background: #F92524;
            }
            .camps-testimonial-video {
              position: relative;
              aspect-ratio: 9/16;
              max-height: 640px;
              width: 100%;
              max-width: 360px;
              overflow: hidden;
              background: #000;
            }
            .camps-video-overlay {
              position: absolute;
              inset: 0;
              background: rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }
            .camps-play-btn {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #F92524;
              display: flex;
              align-items: center;
              justify-content: center;
              padding-left: 6px;
              transition: transform 0.15s ease;
            }
            .camps-play-btn:hover {
              transform: scale(1.1);
            }
            @media (max-width: 768px) {
              .camps-testimonial-video {
                max-height: 500px;
                max-width: 300px;
              }
            }
          `}</style>
        </section>
        <TornPaperDivider color="white" variant="bottom" style={2} />
      </div>

      {/* ══ 9. CLAIM YOUR SPOT: register CTA (camps section 13) ═════════════
          Camps' "Secure Your Slot" red band with the white info panel +
          black price stub, refit for the free pilot: no price, no
          strikethrough, no urgency badge. The story is "Free upfront. Pay
          at the end only if it was worth it." Footer-strip copy from the
          copy deck lives here since this page (like camps) ends in FAQ +
          Footer rather than a FooterBanner. */}
      <div className="relative overflow-visible">
        <section
          className="bg-red relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
          id="register"
        >
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/register-promo-hero-2.png"
              alt=""
              fill
              className="object-cover"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
              }}
            />
          </div>
          <div className="relative z-10">
            <div className="max-w-[1232px] mx-auto text-center">
              <div className="flex items-start justify-center mb-4">
                <Eyebrow variant="light">Register</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-white leading-[0.85] mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 100px)" }}
              >
                Experience EKUZO Esports
              </h2>
              <p
                className="font-body text-white/90 leading-relaxed max-w-2xl mx-auto mb-10"
                style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.2rem)" }}
              >
                Pick the weeks that work. Your gamer shows up. We take it from there.
              </p>

              <div
                className="flex flex-col md:flex-row gap-0 max-w-4xl mx-auto overflow-hidden"
                style={{ clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)" }}
              >
                {/* Main panel: white */}
                <div className="flex-[1.75] bg-white p-10 md:p-12 text-left">
                  <div className="flex flex-wrap gap-12 mb-8">
                    <div>
                      <p className="font-body font-bold uppercase mb-2 text-black/40" style={{ fontSize: "16px", letterSpacing: "2px" }}>Start Date</p>
                      <p className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>Summer 2026</p>
                    </div>
                    <div>
                      <p className="font-body font-bold uppercase mb-2 text-black/40" style={{ fontSize: "16px", letterSpacing: "2px" }}>Platform</p>
                      <p className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>PC / Mac</p>
                    </div>
                  </div>

                  {/* What's included + what you need, next to the CTA. */}
                  <ul className="flex flex-col gap-2 mb-8">
                    {[
                      { label: "What you get", value: "12 hrs of live coaching (8 sessions over your 4 weeks), a private moderated squad space" },
                      { label: "What you need", value: "Basic laptop or desktop, stable internet, a headset with a mic" },
                      { label: "What it costs", value: "Nothing upfront. No card required. Nothing is charged automatically." },
                    ].map((item) => (
                      <li key={item.label} className="flex items-baseline gap-3">
                        <span className="font-body font-bold text-black text-sm uppercase tracking-wider shrink-0" style={{ minWidth: "110px" }}>
                          {item.label}
                        </span>
                        <span className="font-body text-black/70 text-sm leading-relaxed">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <TrackedRegisterLink
                    source="footer"
                    href="/programs/ekuzo101/register?cta=footer"
                    className="block text-center font-body font-bold text-white bg-red rounded-sm px-12 py-5 hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150"
                    style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)", letterSpacing: "0.02em", borderRadius: "2px" }}
                  >
                    Claim Your Spot
                  </TrackedRegisterLink>
                </div>
                {/* Price stub: black. Free-pilot version of camps' tuition stub. */}
                <div className="flex-1 bg-black flex flex-col items-center justify-center text-center p-8 md:p-10">
                  <p className="font-body font-bold text-white/80 uppercase text-sm tracking-widest mb-4">
                    Pilot Price
                  </p>
                  <p
                    className="font-display text-white leading-none mb-4"
                    style={{ fontSize: "clamp(4rem, 10vw, 120px)" }}
                  >
                    FREE
                  </p>
                  <p className="font-body text-white/80 text-sm leading-relaxed mb-4">
                    Free to try, donation-based if it works. The team program is $160/mo if you choose to continue ($13.33/hr for sessions. Friendship free, always).
                  </p>
                  <span className="inline-block border-2 border-white text-white font-body font-bold text-sm px-4 py-2 rounded-full">
                    Summer Pilot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ 10. FAQ (camps section 14) ═══════════════════════════════════════
          Camps' black FAQ band + dark accordion, with the 101 FAQ array.
          Headline from the copy deck ("Questions parents actually ask"). */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <section
          className="bg-black relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
            <div className="md:max-w-[388px] md:w-[388px] shrink-0">
              <div className="mb-4">
                <Eyebrow variant="light">FAQ</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-white leading-[0.85]"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Questions parents actually ask
              </h2>
            </div>
            <div className="flex-1">
              <FAQAccordion items={faqItems} theme="dark" />
            </div>
          </div>
        </section>
      </div>

      {/* ══ 11. FOOTER BANNER: red CTA strip above the footer ════════════════
          Shared FooterBanner with a page-specific headline; explicit
          ctaHref sends "Enroll my gamer" straight to the 101 register
          flow (no enroll modal). */}
      <FooterBanner
        heading="Ready to level up this summer?"
        ctaHref="/programs/ekuzo101/register"
      />

      <Footer />
    </>
  );
}
