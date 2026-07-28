import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import Image from "next/image";
import TestimonialVideo from "@/components/ui/TestimonialVideo";
import WhatWePlayVideo from "@/components/ui/WhatWePlayVideo";
import Eyebrow from "@/components/ui/Eyebrow";
import MissionCarousel from "@/components/ui/MissionCarousel";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TrackPageView from "@/components/analytics/TrackPageView";
import TrackedRegisterLink from "@/components/ui/TrackedRegisterLink";
import JsonLd from "@/components/JsonLd";
import {
  ekuzoCampsCourseSchema,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
} from "@/lib/schema";

// ── EKUZO Camps — canonical /programs/ekuzo-camps page ──────────────────────
// Promoted from v2 on 2026-05-20. The original v1 page (before this
// restructure) is archived at docs/archive/ekuzo-camps-v1-pre-052026.tsx.txt
// for reference. Pre-promotion design notes (Caroline Dunaway feedback,
// Aaron policy answers) summarized below; expanded in section comments:
//   • Hero: single primary Register CTA; eyebrow is a graphic
//     ("LEAGUE OF LEGENDS"); headline reads ESPORTS CAMP, CAMP in red.
//   • Mission ("Every Gamer Deserves a Team"): currently hidden behind
//     `{false && ...}` until the carousel assets are ready.
//   • Coaches surfaced early (Section 5), before logistics or curriculum.
//   • Code of Conduct earns its own section — anti-toxic stance.
//   • For Gamers section: kid-first LoL hype + parent rationale + the
//     "my kid plays Fortnite / Smash / Rocket League" bridge.
//   • Team Matching and Discord for Families sections hidden; content
//     moved to docs/v2-content-moved-to-email.md for Beehiiv use.

export const metadata = {
  alternates: { canonical: "/programs/ekuzo-camps" },
  title: "EKUZO Camp — Level Up Your Game This Summer",
  description:
    "Join EKUZO's intensive 1-week summer esports camps. Pro coaching, real teams, daily tournaments. Morning and afternoon slots available.",
};

// ── Data ─────────────────────────────────────────────────────────────────────

const squadRoles = [
  { role: "Top", handle: "BrickBuddy104", avatar: "/images/avatars/brickbuddy104.webp" },
  { role: "Jungle", handle: "GlitchRunner33", avatar: "/images/avatars/glitchrunner33.webp" },
  { role: "Mid", handle: "SparkPopStar", avatar: "/images/avatars/sparkpopstar.webp", featured: true },
  { role: "ADC", handle: "ZapSpray1", avatar: "/images/avatars/zapspray1.webp" },
  { role: "Support", handle: "SpaceBuddyForever", avatar: "/images/avatars/spacebuddyforever.webp" },
];

const weekPath = [
  {
    day: "M",
    phase: "DAY ONE",
    title: "LEARN TO SKATE",
    desc: "Wave management, vision control, trading windows, and optimizing your settings. The foundation for high-level play.",
  },
  {
    day: "T",
    phase: "DAY TWO",
    title: "FIND YOUR ROLE",
    desc: "Top, Jungle, Mid, ADC, or Support — students test out different positions and champion pools to discover where they fit.",
  },
  {
    day: "W",
    phase: "DAY THREE",
    title: "PLAY AS A TEAM",
    desc: "Solo queue ends here. Squads lock in and focus on shot-calling, objective trading, drafting synergy, and communicating under pressure.",
    highlight: true,
  },
  {
    day: "Th",
    phase: "DAY FOUR",
    title: "APPLY TO LIFE",
    desc: "Emotional regulation after a loss, giving constructive feedback, screen-time management, and healthy competitive mindsets.",
  },
  {
    day: "F",
    phase: "DAY FIVE",
    title: "COMPETE",
    desc: "Friday is Tournament Day. The squad puts it all together in a structured, casted bracket. They leave with a team name, a private squad space, and teammates for life.",
  },
];

const coachCards = [
  {
    name: 'KARLIN "FAITH" OEI',
    role: "Founder // Peak Challenger Jungler",
    bio: "Former national collegiate captain who won $80,000+ in esports scholarships through competitive play — Karlin believes that games (if played correctly) are one of the best teachers of discipline, teamwork, and resilience.",
    // 1400px derivative of the 6349x4312 / 10.2 MB original, same framing
    // (2026-07-28). objectPosition below is unchanged.
    image: "/images/authors/coach-karlin-faith-1400.jpg",
    objectPosition: "center 20%",
  },
  {
    name: 'SEBASTIEN "ZZLEGENDARY" DEMONTIGNY',
    role: "Head Coach // Professional Esports Coach",
    bio: "Coached at professional esports teams like Dignitas & Evil Geniuses and has 4+ years experience working in youth esports. He knows what it takes to bring out the best in young players.",
    image: "/images/coach-sebastien-ZzLegendary.png",
    objectPosition: "center top",
  },
  {
    name: 'NURI "TEEMO TIME" JE',
    role: "Coach // Diamond Support",
    bio: "Community manager for the University of Texas at Austin and Alienware Ambassador. Nuri brings knowledge from teaching in public schools to understand how children can grow beyond what is taught in schools.",
    image: "/images/coach-nuri-je.png",
    objectPosition: "center 60%",
  },
];

// Note: v1's parentBriefing 4-card grid (Small Squads / Vetted Coaches /
// Safe Servers / Life Skills) was deliberately dropped in v2. Each card's
// content now has its own dedicated section: ratio→Camp Overview, vetted
// coaches→Coaches section, safe servers→Code of Conduct + Discord for
// Families, life skills→For Gamers parent rationale. Deeper treatment in
// dedicated sections beats four one-line teasers.

// Team matching — Caroline #7 + Aaron's policy answer #2
const teamMatchingSteps = [
  {
    step: "01",
    title: "You tell us about your gamer",
    desc: "Skill level, region, the time slot that fits your summer. Friends signing up together stay together.",
    icon: "key" as IconName,
  },
  {
    step: "02",
    title: "A coach hand-builds the squad",
    desc: "No algorithm. A real coach pairs kids by skill, region, and complementary roles so everyone is challenged and no one is bored.",
    icon: "handshake" as IconName,
  },
  {
    step: "03",
    title: "You meet your team Day 1",
    desc: "Squad name. Discord server. Five players. One coach. It's yours from the first minute of Monday.",
    icon: "team" as IconName,
  },
];

// Discord for Families — Caroline #9 + Aaron's policy answer #4 and #5
const discordLayers = [
  {
    layer: "01",
    title: "You own the Discord account",
    desc: "Discord accounts belong to the parent, not the kid. You have access to every chat, every voice room, every piece of content — whenever you want to look.",
    icon: "key" as IconName,
  },
  {
    layer: "02",
    title: "Coach moderates the room",
    desc: "Just like a teacher in a classroom. The coach sets the tone, enforces the Code of Conduct, and handles anything that comes up in real time.",
    icon: "handshake" as IconName,
  },
  {
    layer: "03",
    title: "Admins watch every camp",
    desc: "EKUZO admins have full visibility across every camp and class. They can review, flag, and step in on anything — even after the fact.",
    icon: "swords" as IconName,
  },
];

// For Gamers — kid-first hype lead per Caroline #2
const kidHypeBeats = [
  { title: "Your squad", desc: "Teams of five. Bring your friends or get matched up with a crew. Choose your team name and join the rift." },
  { title: "Tournament Friday", desc: "Casted bracket. Real stakes. Train all week to battle and rank up." },
  { title: "Climb together", desc: "When camp ends, your team lives on. Same Discord. Same crew. Keep grinding." },
];

const campsFAQs = [
  {
    question: "What age range is EKUZOCAMPS for?",
    answer:
      "EKUZOCAMPS are designed for players aged 10–18. We group players by age and skill level to ensure the best experience for everyone.",
  },
  {
    question: "What games does EKUZOCAMPS play?",
    answer:
      "Today, EKUZO trains on League of Legends. It provides rich team dynamics, communication requirements, and deep strategy, which is exactly what the EKUZO curriculum is designed around. It’s also free-to-play and doesn’t require bleeding edge machines.",
  },
  {
    question: "Does my child need experience in League of Legends?",
    answer:
      "No — beginners are welcome. Coaches are trained to work with all skill levels. The focus is on growth, teamwork, and developing good habits, not on rank.",
  },
  {
    question: "My kid plays Fortnite / Smash / Rocket League. Will this work for them?",
    answer:
      "Yes. The competitive fundamentals are the same across every multiplayer game — communication, decision-making under pressure, role discipline, reading the map, reading your team. League of Legends teaches those skills in their purest form. Kids who go through EKUZO camp consistently get better at every other game they play.",
  },
  {
    question: "We use Discord — what does that mean for my family?",
    answer:
      "The Discord account belongs to the parent, not the kid. You'll have access to every chat and voice channel in your gamer's squad, whenever you want to check in. The squad's server is private, invite-only, and moderated by the coach. EKUZO admins have full visibility across every camp and class for oversight. It's separate from any public Discord communities your kid may have joined elsewhere.",
  },
  {
    question: "What if my child doesn't connect with their squad?",
    answer:
      "We don't anticipate this — the 1:5 ratio means coaches catch group dynamics early and most squads click within the first day. If something is genuinely off, we'll have a conversation with you first to understand what's happening. Worst case, we'll move your gamer to a better-fit squad. Your kid's experience is the priority.",
  },
  {
    question: "What is the AM vs PM slot difference?",
    answer:
      "The content is identical — same coaching, same curriculum. AM runs 9:00 AM–12:00 PM and PM runs 1:00 PM–4:00 PM. Choose whichever fits your summer schedule.",
  },
  {
    question: "What happens after camp week ends?",
    answer:
      "Your squad's Discord server stays open. EKUZO connects you with your team and provides resources to keep grinding together. This is by design — the team outlasts the week.",
  },
  {
    question: "What is the refund / cancellation policy?",
    answer:
      "Full refund if cancelled 14+ days before your camp week. 50% refund within 7–13 days. No refund within 7 days of start. Medical exceptions reviewed case-by-case.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Programs", path: "/programs" },
  { name: "EKUZO Camps", path: "/programs/ekuzo-camps" },
]);

const campsFAQSchema = buildFAQPageSchema(campsFAQs);

export default function EkuzoCampsPage() {
  return (
    <>
      <JsonLd data={ekuzoCampsCourseSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={campsFAQSchema} />
      <TrackPageView program="camps" />

      {/* ══ 1. STATS TICKER — purple band above nav ═════════════════════════ */}
      <div
        className="overflow-hidden relative"
        style={{ backgroundColor: "#AE2CF2", zIndex: 30 }}
        aria-hidden="true"
      >
        <div style={{ paddingTop: "14px", paddingBottom: "14px" }}>
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: "marquee-camps-v2 40s linear infinite" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="flex items-center shrink-0">
                {[
                  "NOW ENROLLING",
                  "MON–FRI",
                  "VIRTUAL CAMP",
                  "LIMITED SPOTS",
                  "MORNING OR AFTERNOON SESSIONS",
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
          @keyframes marquee-camps-v2 {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══ 2. HERO — calmer treatment, single register CTA ════════════════
          Caroline #1 (brand clarity): video heavily darkened so it acts as
          atmosphere, not content. Rhombus tags dropped (visual noise).
          Subhead introduces what this product IS, the brand story / "why"
          lives in the mission section immediately below.
          Figma reference (node 1033:8200): LEAGUE OF LEGENDS eyebrow
          graphic → ESPORTS CAMP headline (CAMP in red) → subhead →
          Register for Camp button. Audience anchors removed per design. */}
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

          {/* Background video — visible behind the headline. Placeholder
              while Aaron sources the final hero graphic. Opacity raised
              to ~0.7 and overlay lightened so the gameplay reads as
              real content rather than a black wash, while still keeping
              enough contrast for the white headline. Asset re-encoded
              from 1920x1080@30fps/14.6 MB to 1280x720@24fps/3.7 MB in
              Phase 8d (visually indistinguishable through the
              opacity+saturate+brightness filters). */}
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

          {/* Soft vignette — center stays brighter so the video is
              visible behind the headline, edges darken to anchor the
              composition and protect text contrast. */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Subtle red brush-stroke behind the headline for visual anchor
              without re-introducing busy-ness. */}
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
            {/* Eyebrow graphic — "LEAGUE OF LEGENDS" lockup (white SVG). */}
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
              style={{ fontSize: "clamp(80px, 14.4vw, 205px)" }}
            >
              ESPORTS<span className="text-red">CAMP</span>
            </h1>

            {/* Subhead — what this product IS, in one sentence. */}
            <p
              className="font-body text-white/90 leading-relaxed max-w-2xl mx-auto mb-10"
              style={{ fontSize: "clamp(0.9rem, 1.28vw, 1.2rem)" }}
            >
              Press start on summer. Premier esports camps where kids learn
              from pros how to play, compete, and work as a team.
            </p>

            <TrackedRegisterLink
              source="hero"
              href="/programs/ekuzo-camps/register?cta=hero"
              className="inline-block font-body font-bold text-black bg-white rounded-sm px-10 py-4 hover:brightness-90 active:scale-[0.97] active:brightness-75 transition-all duration-150"
              style={{ fontSize: "clamp(0.95rem, 1.44vw, 1.2rem)", letterSpacing: "0.02em", borderRadius: "2px" }}
            >
              Register for Camp
            </TrackedRegisterLink>
          </div>
        </section>
      </div>

      {/* ══ 3. MISSION SECTION — HIDDEN until carousel assets are ready ════
          Hidden from rendering 2026-05-20 per Aaron — the MissionCarousel
          needs real video + camp photos before this section can ship.
          Restore by removing the `false &&` wrapper below AND removing
          the white-top TornPaperDivider on Camp Overview (Section 4)
          since this section's grey-top + Camp Overview's added white-top
          would stack into a double tear.

          Original Figma reference: node 1057:22. */}
      {false && (
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
          id="mission"
        >
          <div className="max-w-[1232px] mx-auto text-center">
            {/* Eyebrow — red skewed badge */}
            <div className="flex justify-center mb-6">
              <Eyebrow>The EKUZO Difference</Eyebrow>
            </div>

            {/* Headline — Tungsten Narrow, black, centered */}
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-8"
              style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
            >
              Every Gamer Deserves a Team
            </h2>

            {/* Body — Inter regular, black/70%, wide max-width */}
            <p
              className="font-body text-black/70 leading-relaxed mx-auto mb-12"
              style={{ fontSize: "clamp(1rem, 1.4vw, 1.25rem)", maxWidth: "1006px" }}
            >
              Gaming matters. Through structured play, expert coaching, and
              real resources, we turn screen time into skill time — building
              STEM thinking, SEL strengths, and CTE-ready pathways. We&apos;re
              creating leaders, problem solvers, and lifelong teammates.
            </p>

            {/* Carousel — 5 slides: 1 video + 4 camp photos. Dot
                indicators below; keyboard ← / → cycles. Component handles
                its own client-side state. */}
            <MissionCarousel />
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>
      )}

      {/* ══ 4. CAMP OVERVIEW — 4-card stats grid ═══════════════════════════
          NOTE: white-top torn paper added below to bridge black hero →
          white Camp Overview while Section 3 (Mission) is hidden. When
          Section 3 is restored, REMOVE the white-top divider here to
          avoid a double tear with Section 3's grey-bottom. */}
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
                <Eyebrow>Camp Overview</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-black leading-[0.85] mb-8"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                Play Hard This Summer
              </h2>
            </ScrollReveal>

            {/* Mobile: each card collapses to ONE inline row — big red
                LABEL, big black VALUE, then desc/badge to the right.
                Desktop: original vertical 4-card row with icons. */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-3 border-black bg-white text-left">
              {[
                { icon: "swords" as IconName, label: "RATIO", value: "1:5", desc: "COACH TO STUDENT" },
                { icon: "calendar" as IconName, label: "TIME", value: "M-F", desc: "15 HOURS TOTAL" },
                { icon: "chat" as IconName, label: "WHERE", value: "ONLINE", desc: "PLAY FROM HOME" },
                { icon: "loot" as IconName, label: "COST", value: "$199", originalValue: "$299", desc: null, badge: "Limited-Time Pricing" },
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
                  {/* Label (red). Bigger on mobile per request. */}
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

                  {/* Value over desc/badge — stacked on both mobile and
                      desktop. Mobile right-aligns to keep the spec-sheet
                      feel; desktop left-aligns under the icon. */}
                  <div className="flex flex-col items-end lg:items-start min-w-0">
                    <div
                      className="font-display text-black leading-[0.85] font-bold flex items-baseline gap-1.5 lg:gap-3 flex-nowrap"
                      style={{ fontSize: "clamp(1.875rem, 7vw, 6rem)" }}
                    >
                      {card.value}
                      {card.originalValue && (
                        <span className="text-black/30 line-through font-normal hidden lg:inline" style={{ fontSize: "0.55em" }}>
                          {card.originalValue}
                        </span>
                      )}
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

      {/* ══ 5. COACHES — surfaces credibility right after Camp Overview ════
          Caroline #5: coaches are the strongest trust signal on the page.
          Moved up from v1, then moved up again (was Section 7) so the
          credibility hit lands first; curriculum follows immediately
          after. Black bg gives this the gravitas the section deserves. */}
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
                Our coaching team combines competitive gaming experience with a passion for teaching. They guide campers through structured practice, teamwork, communication, and healthy gaming habits. Parents can feel confident knowing their kids are learning from mentors who prioritize growth, sportsmanship, and confidence — both on and off the screen.
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

      {/* ══ 6. THE 5-DAY PROGRESSION — curriculum ══════════════════════════
          No top divider — Coaches' black-bottom divider handles the
          transition into white. Adding one here would double-tear. */}
      <div className="relative overflow-visible">
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
          id="curriculum"
        >
          <div className="max-w-[1232px] mx-auto">
            <ScrollReveal>
              <div className="flex items-start mb-4">
                <Eyebrow>Curriculum</Eyebrow>
              </div>
              <h2
                className="font-display uppercase text-black leading-[0.85] mb-12"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                The 5-day progression
              </h2>
            </ScrollReveal>

            <div className="flex flex-col gap-4">
              {weekPath.map((step) => (
                <div
                  key={step.day}
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
                      {step.day}
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

      {/* ══ 7. TAKE YOUR TEAM WITH YOU — HIDDEN, "team stays together" ═════
          Hidden from rendering 2026-05-20 per Aaron. Restore by removing
          the `false &&` wrapper below. Divider chain stays clean: with
          Section 7 hidden, the white 5-Day Progression transitions
          directly into the purple For Gamers section via For Gamers'
          existing purple-top divider — no extra dividers needed. */}
      {false && (
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={2} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-start mb-4">
                  <Eyebrow>The EKUZO Difference</Eyebrow>
                </div>
                <h2
                  className="font-display uppercase text-black leading-[0.85] mb-6"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  The team stays together.
                </h2>
                <p className="font-body text-black/70 leading-relaxed mb-6" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                  Most camps end on Friday, and the kids go their separate ways. At EKUZO, we place campers into 5-player squads on Day 1. You train together, compete together, and learn to communicate.
                </p>
                <p className="font-body text-black/70 leading-relaxed mb-8" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                  When the camp ends, the team lives on. Campers leave not just with better skills, but with a reliable, non-toxic team to keep climbing the ranks with.
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    { title: "Curated Matchmaking", desc: "Teams built based on age, skill level, and complementary roles." },
                    { title: "Private Discord Channels", desc: "Safe, moderated environments that stay open post-camp." },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-4">
                      <span className="mt-1 shrink-0 w-6 h-6 bg-red flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div>
                        <span className="font-body font-bold text-black text-base block">{item.title}</span>
                        <span className="font-body text-black/60 text-sm">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Squad formation visual — same component as v1 */}
              <div className="bg-black/20"
                style={{
                  clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                }}
              >
                <div className="bg-white/50 overflow-hidden"
                  style={{
                    margin: "1px",
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <div className="bg-black px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-red" />
                      <span className="font-display text-white uppercase leading-none" style={{ fontSize: "40px" }}>
                        SQUAD VANGUARD 67
                      </span>
                    </div>
                    <span className="font-display text-white uppercase leading-none" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}>
                      5 / 5
                    </span>
                  </div>

                  <div className="flex flex-col">
                    {squadRoles.map((player, i) => (
                      <div
                        key={player.role}
                        className={`relative flex items-center gap-0 transition-all duration-200 cursor-default group ${
                          player.featured ? "z-10" : "hover:z-10"
                        }`}
                      >
                        <div
                          className={`shrink-0 w-1.5 self-stretch transition-colors duration-200 ${
                            player.featured
                              ? "bg-red"
                              : i % 2 === 0
                                ? "bg-red/30 group-hover:bg-red"
                                : "bg-black/10 group-hover:bg-red"
                          }`}
                        />
                        <div
                          className={`flex-1 flex items-center gap-4 px-5 py-4 transition-all duration-200 ${
                            player.featured
                              ? "bg-black text-white"
                              : "bg-white text-black group-hover:bg-black/[0.02]"
                          }`}
                          style={{ borderTop: i > 0 && !player.featured ? "1px solid rgba(0,0,0,0.06)" : player.featured ? "2px solid var(--color-red)" : "none", borderBottom: player.featured ? "2px solid var(--color-red)" : "none" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={player.avatar}
                            alt={player.handle}
                            className="shrink-0 w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-110"
                            width={40}
                            height={40}
                          />
                          <div className="flex items-baseline gap-3 flex-1">
                            <div
                              className={`font-display text-2xl leading-none ${
                                player.featured ? "text-white" : "text-black"
                              }`}
                              style={{ letterSpacing: "0.04em" }}
                            >
                              {player.handle}
                            </div>
                            <div
                              className={`font-body text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                                player.featured ? "text-red" : "text-black/40 group-hover:text-red"
                              }`}
                            >
                              {player.role}
                            </div>
                          </div>
                          {player.featured && (
                            <span className="font-body text-sm font-bold text-white bg-red px-3 py-1.5 uppercase tracking-wider whitespace-nowrap">
                              Your Gamer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/[0.03] px-6 py-3 flex items-center justify-center gap-5">
                    {["Your team", "Your roles", "Your Discord", "Forever"].map((text, i) => (
                      <span key={text} className="font-body text-gray-600 text-sm font-bold flex items-center gap-5">
                        {text}
                        {i < 3 && <span className="text-red/40">·</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      )}

      {/* ══ 8. TEAM MATCHING — HIDDEN, moved to email content ══════════════
          Hidden from rendering 2026-05-20 per Aaron. Copy lives in
          docs/v2-content-moved-to-email.md. Restore by removing the
          `false &&` wrapper below. Top divider removed too: with this
          section hidden, the grey→red transition into For Gamers is
          handled by For Gamers' own red-top divider.

          Original design rationale (Caroline #7): the v1 "Curated
          Matchmaking" bullet was a black-box claim. This section named
          the actual mechanism — coaches hand-pick squads by skill,
          region, time slot — so parents (and kids who've been burned
          by bad team dynamics) can see the process before they buy in. */}
      {false && (
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
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="flex items-start mb-4">
              <Eyebrow>How Squads Are Built</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-6"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              A coach builds your team.<br />Not an algorithm.
            </h2>
            <p className="font-body text-black/70 leading-relaxed mb-16 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Before camp starts, a coach hand-picks every 5-player squad based on skill level, region, and the time slot you selected. Friends signing up together stay together, matched with similar-skill peers. The goal: everyone is challenged, no one is bored, and Day 1 doesn&apos;t feel like a coin flip.
            </p>

            {/* Three-step process — desktop horizontal cards with a thin
                red connector line, mobile stacked. Big step numbers in
                Tungsten Narrow as the visual anchor. */}
            <div className="relative">
              {/* Connector line — desktop only, behind the cards */}
              <div
                className="hidden lg:block absolute left-0 right-0 top-[60px] h-[2px] bg-red/20 z-0"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 relative z-10">
                {teamMatchingSteps.map((step) => (
                  <div
                    key={step.step}
                    className="bg-white relative"
                    style={{
                      padding: "2px",
                      clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                      backgroundColor: "rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      className="bg-white p-8 h-full flex flex-col"
                      style={{
                        clipPath: "polygon(23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%, 0 23px)",
                      }}
                    >
                      {/* Step number badge */}
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="shrink-0 w-[60px] h-[60px] bg-red flex items-center justify-center"
                        >
                          <span
                            className="font-display text-white leading-none"
                            style={{ fontSize: "32px" }}
                          >
                            {step.step}
                          </span>
                        </div>
                        <Icon name={step.icon} size={32} className="w-8 h-8" />
                      </div>

                      <h3
                        className="font-display uppercase text-black leading-[0.9] mb-3"
                        style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}
                      >
                        {step.title}
                      </h3>
                      <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      )}

      {/* ══ 9. FOR GAMERS — kid-first lead, parent-rationale, Fortnite bridge (NEW) ═
          Caroline #2: invert the v1 LoL section. v1 led with parent
          justification ("it mirrors traditional sports") which is fine
          copy for parents but does nothing for the kid who has to want
          to come. v2 leads with kid energy (squad, tournament, casted
          bracket) and tucks the parent rationale below.
          Caroline #3: directly address "my kid plays Fortnite / Smash /
          Rocket League" — skills-transfer thesis, ending with the
          "no gatekeeping" reassurance buried at the bottom (not the
          top). Purple bg (#AE2CF2) differentiates the section as the
          kid-energy moment and gives it bold, lounge-feeling identity. */}
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
                Your team. Your week.<br />
                <span className="text-black">Your tournament.</span>
              </h2>
              <p
                className="font-body text-white leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)" }}
              >
                You&apos;re not solo queueing for five days. You&apos;re on a five-player squad with a coach who knows what it takes. Warmup, get the lesson, drill, and scrim to make it real. VOD review with your team. By Friday, you&apos;re playing in a casted bracket against the other camp squads. Think of it as the most structured, coached ranked experience you&apos;ve ever played.
              </p>
            </ScrollReveal>

            {/* Hype-beat cards — black bg cards on the purple section for
                punch. Three callouts of what your week looks like. Number
                accents recolored purple to match the section identity. */}
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

            {/* Two-column: video left + Why League of Legends right.
                Right column centered vertically with the video so the
                heading and video share a common midline. Eyebrow swapped
                from "For parents" small caps to the light-variant
                Eyebrow badge ("What We Play") per Figma. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <WhatWePlayVideo
                src="/videos/league-of-legends-camp.mp4"
                label="League of Legends gameplay at EKUZO camp"
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
                  League works like a traditional sport. Five players. Defined roles. A shared objective. A playbook that evolves every match. It&apos;s also free-to-play, runs on most family computers, and stays free of the cosmetics-and-loot-box pressure parents have learned to watch for.
                </p>
                <p className="font-body text-white/90 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Your gamer is learning communication, strategy, role discipline, and leadership under pressure — the kind of fundamentals that transfer to every other game they&apos;ll touch. And the kind of fundamentals that show up at school, on a real sports field, in a first job.
                </p>
              </div>
            </div>

            {/* Two-column: What Do I Need copy + tech collage image.
                New per Figma 1039:5178 — the gear/access logistics that
                used to live in v1 as a standalone Requirements section
                are folded into the kid-energy section here. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <div className="flex flex-col gap-6 order-2 lg:order-1">
                <div className="flex items-start">
                  <Eyebrow variant="light">The Setup</Eyebrow>
                </div>
                <h3
                  className="font-body font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                >
                  If you have a laptop, you have a camp.
                </h3>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Our camp is built online. Campers need access to a laptop or desktop computer (nothing fancy), stable internet connection, and a headset.
                </p>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  League of Legends is free to download and play, and runs on both PC and Mac.
                </p>
                <p className="font-body text-white leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Need any help reviewing your setup?{" "}
                  <a
                    href="mailto:team@ekuzo.gg"
                    className="underline decoration-white/60 decoration-2 underline-offset-4 hover:decoration-white transition-colors duration-150"
                  >
                    Contact us
                  </a>
                  .
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

            {/* Fortnite / Smash / Rocket League bridge callout — answers
                the unspoken objection: "But my kid plays X." Purple
                accent on the final "Will this work?" line per Figma. */}
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
                  Fortnite, Smash,<br />Rocket League.<br />
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
                    A Smash player can sharpen decision-making and match awareness.
                  </p>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    The game may be different. The fundamentals carry.
                  </p>
                  <p className="font-body text-black/50 text-sm leading-relaxed pt-2 border-t border-black/10">
                    All skill levels are welcome — beginners included. No League experience required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ 10. CODE OF CONDUCT / ZERO TOLERANCE — anti-toxic (NEW) ════════
          Caroline #6: anti-toxic is undersold in v1 — a single "Safe
          Servers" icon-and-line buried in a 4-card grid. Parents whose
          kids have been burned by toxic lobbies need to feel the answer.
          This section earns its own real estate: black bg for gravitas,
          oversized headline, and Caroline's school-hallway line as a
          red pull-quote callout. Backed by Aaron's confirmation that
          there's a real Code of Conduct that both kids and parents
          sign on Day 1. */}
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
              {/* Left column — headline + body */}
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
                  All gameplay happens in private, EKUZO-moderated servers. No public matchmaking. No random strangers. No trash talk. Coaches enforce a strict Code of Conduct from Day 1.
                </p>
                <p className="font-body text-white/60 leading-relaxed mb-10" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>
                  Every camper and every parent signs the Code of Conduct before camp begins. It&apos;s short, plainly written, and we hold the line on it.
                </p>

                <p
                  className="font-body font-black text-white mb-6"
                  style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)", lineHeight: "1.1" }}
                >
                  No trolling. No targeting. Crash-outs get coached.
                </p>

                {/* "What's not allowed" — quick scannable list. Caroline
                    didn't write this verbatim but it operationalizes the
                    school-hallway test into specifics parents can check. */}
                <ul className="flex flex-col gap-3">
                  {[
                    "Slurs, harassment, or targeted insults — coach removes the player immediately",
                    "Public-matchmaking trolling or trash talk — we don't play in public lobbies",
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

              {/* Right column — school-hallway pull quote card */}
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

      {/* ══ 11. DISCORD FOR FAMILIES — HIDDEN, moved to email content ══════
          Hidden from rendering 2026-05-20 per Aaron. Copy lives in
          docs/v2-content-moved-to-email.md. Restore by removing the
          `false &&` wrapper below. With this section hidden, the
          black→white transition from Code of Conduct into Testimonials
          is handled by Code of Conduct's existing black-bottom divider.
          The bottom grey divider that used to live here is also gone —
          Testimonials has no top divider and doesn't need one.

          Original design rationale (Caroline #9): Discord is mentioned
          in v1 but never explained for parents who may not know what it
          is. Biggest insight from Aaron's policy answers: PARENTS OWN
          THE DISCORD ACCOUNT — not the kid. Stronger differentiator
          than "request observer access" (which is what Caroline
          assumed). Lead with that, then layer in coach + admin
          oversight as the rest of the safety net. */}
      {false && (
      <div className="relative overflow-visible">
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start mb-16">
              <div>
                <div className="flex items-start mb-4">
                  <Eyebrow>For Families</Eyebrow>
                </div>
                <h2
                  className="font-display uppercase text-black leading-[0.85]"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  Discord,<br />but built for parents.
                </h2>
              </div>
              <div className="flex flex-col gap-4 lg:pt-20">
                <p className="font-body text-black/75 leading-relaxed" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}>
                  Discord is the platform we use for every squad — voice rooms, chat, screen sharing, post-camp hangouts. If you&apos;ve never used it, here&apos;s the short version: it&apos;s a private, invite-only group chat for your gamer&apos;s squad. No public lobbies, no strangers.
                </p>
                <p className="font-body text-black/75 leading-relaxed" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}>
                  We built our setup with three layers of oversight so your family is never alone in there.
                </p>
              </div>
            </div>

            {/* Three layers — vertical cards with a left-edge red bar
                indicating depth/order. Differentiated from Team Matching
                (which used red square badges + horizontal flow) by
                vertical orientation and the layer-bar treatment. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {discordLayers.map((layer) => (
                <div
                  key={layer.layer}
                  className="bg-white flex"
                  style={{
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  {/* Left edge bar — red, gives the "layer" feel */}
                  <div className="w-2 bg-red shrink-0" aria-hidden="true" />

                  <div className="flex-1 p-8 flex flex-col">
                    <div className="flex items-baseline gap-3 mb-5">
                      <span
                        className="font-display text-red leading-none"
                        style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                      >
                        Layer {layer.layer}
                      </span>
                    </div>
                    <div className="w-10 h-10 mb-5">
                      <Icon name={layer.icon} size={40} className="w-full h-full" />
                    </div>
                    <h3
                      className="font-display uppercase text-black leading-[0.9] mb-3"
                      style={{ fontSize: "clamp(1.5rem, 2.2vw, 1.875rem)" }}
                    >
                      {layer.title}
                    </h3>
                    <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
                      {layer.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Closing reassurance — post-camp Discord access continues
                under the same three-layer model so the relationship
                doesn't drop off Friday afternoon. */}
            <p className="font-body text-black/60 leading-relaxed mt-12 max-w-3xl" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
              The squad&apos;s Discord server stays open after camp week ends, under the same three-layer oversight. You don&apos;t lose the team, and you don&apos;t lose the moderation.
            </p>
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>
      )}

      {/* ══ 12. TESTIMONIALS — Rajitha video + pull quotes ═════════════════
          Note: standalone Requirements section dropped — "basic computer
          + headphones" moved inline next to the register CTA as a "what
          you need" mini-block where it lives closer to the conversion
          moment. */}
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
                    quote: "I’ve seen a more focused importance of where he’s spending that screen time — and that’s been really great.",
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

          {/* Testimonial video styles — red play button, overlay, shadow.
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

      {/* ══ 13. SECURE YOUR SLOT — register CTA + "what you need" mini-block
          What's-included summary + refund policy bullet + tech requirements
          all sit next to the buy button, so the cost objection ("what am I
          actually paying for?") is answered the moment the decision is
          made. Discount line is a one-component change once Jamie adds
          sibling pricing — note left for him in WORKLOG. */}
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
                className="font-display uppercase text-white leading-[0.85] mb-10"
                style={{ fontSize: "clamp(3rem, 7vw, 100px)" }}
              >
                Secure Your Slot
              </h2>

              <div
                className="flex flex-col md:flex-row gap-0 max-w-4xl mx-auto overflow-hidden"
                style={{ clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)" }}
              >
                {/* Main panel — white */}
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

                  {/* What's included + what you need — compact bullet
                      groups directly above the CTA. The Code of Conduct
                      mention earned its own section above, so it doesn't
                      repeat here. Sibling discount slot: add a list item
                      before the CTA once Jamie wires the pricing change. */}
                  <ul className="flex flex-col gap-2 mb-8">
                    {[
                      { label: "What you get", value: "15 hrs coaching, a private moderated squad chat, post-camp access" },
                      { label: "What you need", value: "Basic laptop or desktop, stable internet, a headset" },
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
                    href="/programs/ekuzo-camps/register?cta=footer"
                    className="block text-center font-body font-bold text-white bg-red rounded-sm px-12 py-5 hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150"
                    style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)", letterSpacing: "0.02em", borderRadius: "2px" }}
                  >
                    Register for Camp
                  </TrackedRegisterLink>
                </div>
                {/* Price stub — black */}
                <div className="flex-1 bg-black flex flex-col items-center justify-center text-center p-8 md:p-10">
                  <p className="font-body font-bold text-white/80 uppercase text-sm tracking-widest mb-4">
                    Camp Tuition
                  </p>
                  <p
                    className="font-display text-white/40 line-through leading-none mb-1"
                    style={{ fontSize: "clamp(2rem, 5vw, 60px)" }}
                  >
                    $299
                  </p>
                  <p
                    className="font-display text-white leading-none mb-4"
                    style={{ fontSize: "clamp(4rem, 10vw, 120px)" }}
                  >
                    $199
                  </p>
                  <p className="font-body text-white/80 text-sm leading-relaxed mb-4">
                    Per gamer, per week
                  </p>
                  <span className="inline-block border-2 border-white text-white font-body font-bold text-sm px-4 py-2 rounded-full">
                    Limited-Time Pricing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ 14. FAQ — expanded with three new entries ═════════════════════════
          New entries added (per Caroline #3, #8, #9):
            • "My kid plays Fortnite / Smash / Rocket League..."
            • "We use Discord — what does that mean for my family?"
            • "What if my child doesn't connect with their squad?"
          Existing six v1 FAQs preserved verbatim. */}
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
                Frequently Asked Questions
              </h2>
            </div>
            <div className="flex-1">
              <FAQAccordion items={campsFAQs} theme="dark" />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
