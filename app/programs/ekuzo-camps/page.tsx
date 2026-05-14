import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import CircleIcon from "@/components/ui/CircleIcon";
import type { IconName } from "@/components/ui/Icon";
import Image from "next/image";
import TestimonialVideo from "@/components/ui/TestimonialVideo";
import WhatWePlayVideo from "@/components/ui/WhatWePlayVideo";
import Eyebrow from "@/components/ui/Eyebrow";
import TrackPageView from "@/components/analytics/TrackPageView";
import TrackedRegisterLink from "@/components/ui/TrackedRegisterLink";
import JsonLd from "@/components/JsonLd";
import {
  ekuzoCampsCourseSchema,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
} from "@/lib/schema";

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
    desc: "Friday is Tournament Day. The squad puts it all together in a structured, casted bracket. They leave with a team name, a Discord group, and teammates for life.",
  },
];

const parentBriefing = [
  {
    title: "Small squads",
    desc: "Strict 1:5 coach-to-student ratio guarantees personalized gameplay reviews and real attention every session.",
    icon: "hard-problem" as IconName,
  },
  {
    title: "Vetted coaches",
    desc: "Background-checked coaches with real competitive experience and years of teaching kids 10-18.",
    icon: "handshake" as IconName,
  },
  {
    title: "Zero toxic lobbies",
    desc: "Every match is in a private, moderated EKUZO server with vetted teammates and coaches present.",
    icon: "chat" as IconName,
  },
  {
    title: "Life skills",
    desc: "Coaches teach your kid how to communicate under pressure and lose without melting down. The kind of habits that outlast the game.",
    icon: "heart" as IconName,
  },
];

const coachCards = [
  {
    name: 'KARLIN "FAITH" OEI',
    role: "Founder",
    bio: "Karlin found esports in college, on a scholarship that gave him the structure he didn't know he needed. He earned $80,000+ in scholarships and reached the top 0.01% of players. He built EKUZO as the thing he wished he had at 12, and he's the architect accountable for what your kid experiences.",
    image: "/images/coach-karlin-faith.jpg",
    objectPosition: "center 20%",
  },
  {
    name: 'SEBASTIEN "ZZLEGENDARY" DEMONTIGNY',
    role: "Head Coach",
    bio: "Sebastien reached the top 0.01% of players before going on to coach pro teams at Dignitas and Evil Geniuses. Now he runs EKUZO's curriculum.",
    image: "/images/coach-sebastien-ZzLegendary.png",
    objectPosition: "center top",
  },
  {
    name: 'NURI "TEEMO TIME" JE',
    role: "Coach",
    bio: "Top 1% player. Alienware Ambassador. Member of UT Austin's LoL esports team. Just graduated with a degree in education.",
    image: "/images/coach-nuri-je.png",
    objectPosition: "center 60%",
  },
];

const whatWePlayItems = [
  {
    title: "Work as a team",
    desc: "roles matter, communication wins games",
    icon: "team" as IconName,
  },
  {
    title: "Think strategically",
    desc: "map awareness, objectives, and timing",
    icon: "strategy" as IconName,
  },
  {
    title: "Compete with purpose",
    desc: "playing to improve, match after match",
    icon: "trophy" as IconName,
  },
];

const campsFAQs = [
  {
    question: "What age range is EKUZO Camp for?",
    answer:
      "EKUZO Camp is designed for players aged 10-18. We group them by age and skill level so the experience fits everyone.",
  },
  {
    question: "What games does EKUZO Camp play?",
    answer:
      "EKUZO Camp trains on League of Legends. League gives us the team structure (five roles, one map, one objective) the curriculum is built around. The game itself is free to play and runs on basically any modern computer.",
  },
  {
    question: "Does my child need experience in League of Legends?",
    answer:
      "No. Beginners are welcome. League is forgiving to start and has plenty of room to grow. Coaches teach all skill levels, with the curriculum built around growth and habits.",
  },
  {
    question: "Is League of Legends safe for my kid?",
    answer:
      "Yes. Every match your kid plays is in a private, EKUZO-moderated server with vetted teammates and coaches present at all times. Coaches enforce a clear code of conduct on the server and in voice chat.",
  },
  {
    question: "My kid plays Fortnite, Roblox, or Minecraft. Will this work?",
    answer:
      "Yes. The skills we teach in League transfer sideways to every game your kid plays. Communication, decision-making, reading the map, playing your role: these are universal to competitive gaming. Kids who walk in playing other games walk out better at all of them.",
  },
  {
    question: "How does team matching actually work?",
    answer:
      "Before camp starts, we ask each gamer about their age, skill level, preferred role, and playstyle. Coaches use that to hand-build each 5-player squad, balancing experience and complementary roles. Your kid meets their squad on Day 1, and the same five kids stay together all week.",
  },
  {
    question: "What is Discord and is it safe for my kid?",
    answer:
      "Discord is a free chat app gamers use to talk to teammates, similar to a private group chat. At EKUZO, your kid gets access to two spaces: their squad's private team chat and the broader EKUZO community. Both are invite-only and moderated by adults at EKUZO. Your kid's Discord interactions during and after camp stay within those moderated spaces.",
  },
  {
    question: "What is the AM vs PM slot difference?",
    answer:
      "The content is identical. Same coaching, same curriculum. AM runs 9:00 AM-12:00 PM and PM runs 1:00 PM-4:00 PM. Pick whichever fits your summer schedule. Squads often end up practicing together in the other window too, which can turn camp into more of an all-day thing if your kid wants that.",
  },
  {
    question: "What if my kid doesn't connect with their squad?",
    answer:
      "Coaches monitor squad dynamics throughout the week, and the 1:5 ratio means problems get caught early. If a kid genuinely doesn't click with their team, reach out to the coach or to EKUZO support, and we'll work with you to make it right.",
  },
  {
    question: "Do you offer a sibling or friend discount?",
    answer:
      "We're open to it. There's a notes field on the registration form. Mention if you're signing up multiple kids or coordinating with friends, and we'll work with you. The squad-link feature also lets siblings or friends land in the same week and slot.",
  },
  {
    question: "What's included in the $199?",
    answer:
      "Your $199 covers 15 hours of small-group coaching (1:5 ratio) with top-tier esports coaches, EKUZO-moderated servers and chats, and the curriculum that ties it all together. The chats include your squad's private team channel and the broader EKUZO community. Per hour, it's about $13 for coaching alone, below the going rate for private esports instruction.",
  },
  {
    question: "What happens after camp week ends?",
    answer:
      "Your squad stays. The team space stays open after camp ends, with EKUZO moderation in place so the kids can keep playing together. The team outlasts the week.",
  },
  {
    question: "What is the refund / cancellation policy?",
    answer:
      "Full refund if cancelled 14+ days before your camp week. 50% refund within 7-13 days. No refund within 7 days of start. Medical exceptions reviewed case-by-case.",
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
      {/* ══ STATS TICKER — above nav ═════════════════════════════════════════ */}
      <div
        className="overflow-hidden relative"
        style={{ backgroundColor: "#AE2CF2", zIndex: 30 }}
        aria-hidden="true"
      >
        <div style={{ paddingTop: "14px", paddingBottom: "14px" }}>
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: "marquee-camps 40s linear infinite" }}
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
          @keyframes marquee-camps {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══ 1. HERO — video bg with color overlay ═════════════════════════ */}
      <div className="relative overflow-visible" style={{ zIndex: 1 }}>
        <section
          className="bg-black relative overflow-clip"
          style={{
            paddingTop: "clamp(160px, 18vw, 240px)",
            paddingBottom: "clamp(160px, 22vw, 300px)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 z-20">
            <Nav variant="dark" />
          </div>

          {/* Background video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src="/videos/camp-hero.mp4" type="video/mp4" />
          </video>

          {/* Color overlay — dark with red tint */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%)",
              mixBlendMode: "multiply",
            }}
            aria-hidden="true"
          />
          {/* Subtle red accent gradient from bottom */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent 40%, rgba(249,37,36,0.15) 100%)",
            }}
            aria-hidden="true"
          />

          <div
            className="max-w-[1232px] mx-auto relative z-[5] text-center"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Rhombus tags */}
            <div className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-3 mb-8">
              {["100% Virtual", "Ages 10–18", "Pro Coaches"].map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-red text-white font-body font-bold uppercase px-2.5 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] whitespace-nowrap"
                  style={{ transform: "skewX(-8deg)" }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
                    {tag}
                  </span>
                </span>
              ))}
            </div>

            {/* Brand wordmark — kicker above the H1 */}
            <p
              className="font-display uppercase text-white leading-none mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              EKUZO<span className="text-red">CAMP</span>
            </p>

            {/* H1 — fills the slot the wordmark vacated */}
            <h1 className="font-display text-white uppercase leading-[0.85] mb-8">
              {/* Mobile: three lines */}
              <span className="sm:hidden">
                <span className="block" style={{ fontSize: "clamp(52px, 13.5vw, 92px)" }}>
                  Every gamer
                </span>
                <span className="block" style={{ fontSize: "clamp(52px, 13.5vw, 92px)" }}>
                  Deserves
                </span>
                <span className="block" style={{ fontSize: "clamp(78px, 20vw, 138px)" }}>
                  A <span className="text-red">team</span>
                </span>
              </span>
              {/* Desktop: two lines */}
              <span className="hidden sm:block">
                <span className="block" style={{ fontSize: "clamp(56px, 9.5vw, 138px)" }}>
                  Every gamer deserves
                </span>
                <span className="block" style={{ fontSize: "clamp(84px, 14.25vw, 207px)" }}>
                  A <span className="text-red">team</span>
                </span>
              </span>
            </h1>

            <p
              className="font-body text-white leading-relaxed max-w-xl mx-auto mb-10"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              Real team. Real coach. Real competition. Five days of esports your kid wants to show up for, plus a team that keeps going long after.
            </p>

            <TrackedRegisterLink
              source="hero"
              href="/programs/ekuzo-camps/register?cta=hero"
              className="inline-block font-body font-bold text-black bg-white rounded-sm px-12 py-5 hover:brightness-90 active:scale-[0.97] active:brightness-75 transition-all duration-150"
              style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)", letterSpacing: "0.02em", borderRadius: "2px" }}
            >
              Enroll my gamer
            </TrackedRegisterLink>
          </div>
        </section>
      </div>

      {/* ══ 3. CAMP OVERVIEW — white bg, 4-col logistics grid ═════════════ */}
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
          <div className="max-w-[1232px] mx-auto">
            <div className="flex items-start mb-4">
              <Eyebrow>Overview</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-16"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Camp overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-3 border-black bg-white">
              {[
                { icon: "swords" as IconName, label: "RATIO", value: "1:5", desc: "COACH TO STUDENT" },
                { icon: "calendar" as IconName, label: "DURATION", value: "M-F", desc: "15 HOURS TOTAL" },
                { icon: "chat" as IconName, label: "WHERE", value: "ONLINE", desc: "PLAY FROM HOME" },
                { icon: "loot" as IconName, label: "COST", value: "$199", originalValue: "$299", desc: null, badge: "Limited-Time Pricing" },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className="flex flex-col justify-between border-b sm:border-b lg:border-b-0 border-r-0 sm:even:border-r-0 lg:last:border-r-0 lg:border-r border-black/10"
                  style={{ padding: "clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem)" }}
                >
                  <div className="mb-10">
                    <Icon name={card.icon} size={60} className="w-[60px] h-[60px]" />
                  </div>
                  <div>
                    <div
                      className="font-display text-red uppercase tracking-wide mb-2"
                      style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.75rem)", fontWeight: 500 }}
                    >
                      {card.label}
                    </div>
                    <div
                      className="font-display text-black leading-[0.85] font-bold flex items-baseline gap-3 flex-wrap"
                      style={{ fontSize: "clamp(4rem, 7vw, 6rem)" }}
                    >
                      {card.originalValue && (
                        <span className="text-black/30 line-through font-normal" style={{ fontSize: "0.55em" }}>
                          {card.originalValue}
                        </span>
                      )}
                      {card.value}
                    </div>
                    {card.badge ? (
                      <span className="inline-block bg-[#ffd200] text-black font-body font-bold text-base px-4 py-1.5 rounded-full mt-5">
                        {card.badge}
                      </span>
                    ) : card.desc ? (
                      <div className="font-body text-black/50 mt-5" style={{ fontSize: "clamp(0.875rem, 1.2vw, 1.1rem)" }}>{card.desc}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ 4. TAKE YOUR TEAM WITH YOU — grey bg ═════════════════════════════ */}
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
                <p className="font-body text-black/70 leading-relaxed mb-8" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                  Most summer camps end Friday and your kid is alone again Monday. The four kids in your kid&apos;s squad don&apos;t disappear when the week ends. They&apos;re real friends your kid trained with for five days, and they keep playing together long after camp wraps.
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    { title: "Coach-built squads.", desc: "Before camp starts, we ask about your kid's age, skill level, preferred role, and playstyle. Coaches hand-build each 5-player squad. Your kid meets their team on Day 1." },
                    { title: "A trusted gaming community.", desc: "EKUZO brings your kid's squad together for the week, then keeps them connected after camp wraps. Moderated and invite-only, built to outlast Friday." },
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

              {/* Squad formation visual — team wrapper (outer = border via bg, inner = content) */}
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
                {/* Team header */}
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

                {/* Player rows */}
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

                {/* Team footer */}
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
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ COACHES — grey bg, extracted from combined section ═════════════ */}
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
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="flex items-start mb-4">
              <Eyebrow>Our team</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-4"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Learn from the best
            </h2>
            <p className="font-body text-black/70 leading-relaxed mb-14 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              Coaches who play, compete, and coach at the top tiers of esports. Three of them, below.
            </p>

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
                  <div className="relative w-full h-[250px] overflow-hidden border-b border-black/8">
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
        <TornPaperDivider color="grey" variant="bottom" style={2} />
      </div>

      {/* ══ 5. THE 5-DAY PROGRESSION — white bg ═════════════════════════════ */}
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
            <div className="flex items-start mb-4">
              <Eyebrow>Curriculum</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-12"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              The 5-day progression
            </h2>

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

      {/* ══ 6. PARENT BRIEFING — black bg ═════════════════════════════════════ */}
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
            <div className="flex items-start mb-4">
              <Eyebrow variant="light">For Parents</Eyebrow>
            </div>
            <h2
              className="font-display uppercase text-white leading-[0.85] mb-4"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Structured, safe, and skill-oriented
            </h2>
            <p className="font-body text-white/60 leading-relaxed mb-12 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
              We treat esports with the same educational rigor as a traditional sports camp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {parentBriefing.map((item) => (
                <div
                  key={item.title}
                  className="bg-white p-8 h-full"
                  style={{
                    clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
                  }}
                >
                  <div className="w-10 h-10 mb-6">
                    <Icon name={item.icon} size={40} className="w-full h-full" />
                  </div>
                  <h4
                    className="font-display uppercase text-black leading-none mb-3"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
                  >
                    {item.title}
                  </h4>
                  <p className="font-body text-black/70 leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <TornPaperDivider color="black" variant="bottom" style={1} />
      </div>

      {/* ══ 7. REQUIREMENTS + WHAT WE PLAY — grey bg ═════════════════════════ */}
      {/* Note: no top divider here — the black torn-paper-bottom on the
          Parent Briefing section above tears directly into this grey section. */}
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
          {/* ── What Do I Need sub-section ── */}
          <div className="max-w-[1232px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Collage — left on desktop, second on mobile */}
              <div className="relative overflow-visible order-2 lg:order-1" style={{ aspectRatio: "4/3" }}>
                <div
                  className="absolute inset-0 bg-[#e5e0db]"
                  style={{ clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)" }}
                />
                <Image
                  src="/images/tech-collage@2x.png"
                  alt="Gaming setup — computer, headset, keyboard, mouse"
                  width={800}
                  height={900}
                  className="relative z-10 w-[110%] max-w-none"
                  style={{ marginLeft: "-5%", marginTop: "-10%" }}
                />
              </div>
              {/* Copy — right on desktop, first on mobile */}
              <div className="flex flex-col gap-8 order-1 lg:order-2">
                <Eyebrow>What Do I Need?</Eyebrow>
                <h2
                  className="font-body font-black text-black leading-[1]"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  Basic computer and headphones.
                </h2>
                <div className="flex flex-col gap-6">
                  <p className="font-body text-gray-600 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    Our camp is built online. Campers need access to a laptop or desktop computer (nothing fancy), stable internet connection, and a headset.
                  </p>
                  <p className="font-body text-gray-600 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                    Our camps are moderated and follow a strict code of conduct.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── What Do We Play sub-section ── */}
          <div className="max-w-[1232px] mx-auto" style={{ marginTop: "clamp(100px, 16vw, 200px)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Copy — left */}
              <div className="flex flex-col gap-6">
                <Eyebrow>What we play</Eyebrow>
                <h2
                  className="font-body font-black text-black leading-[1]"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  League of Legends
                </h2>
                <p className="font-body text-gray-600 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  Your kid plays Fortnite. Or Roblox. Or Minecraft. That&apos;s exactly who EKUZO is built for, because the skills we teach in League move sideways into every game your kid plays.
                </p>
                <p className="font-body text-gray-600 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                  We teach in League because it&apos;s the chess of esports. Five roles, one map, a playbook that evolves every match.
                </p>

                <h3 className="font-body font-bold text-black" style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}>
                  Campers learn how to:
                </h3>

                <div className="flex flex-col gap-6">
                  {whatWePlayItems.map((item) => (
                    <div key={item.title} className="flex items-start gap-5">
                      <div
                        className="shrink-0 w-12 h-12 bg-red rounded-full flex items-center justify-center mt-0.5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/icons/${item.icon}.svg`}
                          alt=""
                          className="w-8 h-8"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                      </div>
                      <div>
                        <h4 className="font-body font-bold text-black leading-tight" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.25rem)" }}>
                          {item.title}
                        </h4>
                        <p className="font-body text-gray-500 text-base">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Founder quote — featured callout */}
                <blockquote
                  className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm mt-4"
                  style={{
                    clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
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
                    &ldquo;EKUZO meets students through the games they love, but teaches through the game that allows growth to compound.&rdquo;
                  </p>
                  <footer>
                    <span
                      className="font-body text-black block"
                      style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
                    >
                      Karlin Oei
                    </span>
                    <span className="font-body text-black/50 block text-sm">
                      Founder, EKUZO
                    </span>
                  </footer>
                </blockquote>
              </div>

              {/* Video — right */}
              <WhatWePlayVideo
                src="/videos/league-of-legends-camp.mp4"
                label="League of Legends gameplay at EKUZO camp"
              />
            </div>
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ 8. TESTIMONIALS — white bg ═══════════════════════════════════════ */}
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
              {/* Vertical video — Rajitha */}
              <TestimonialVideo
                src="/testimonial-videos/rajitha-parent.mp4"
                name="Rajitha"
                role="EKUZO parent"
              />

              {/* Pull quotes */}
              <div className="flex flex-col gap-8">
                {[
                  {
                    quote: "The coaches are very intentional about teaching that behind each avatar is a real person.",
                    name: "Brad",
                    role: "Parent of a girl gamer",
                  },
                  {
                    quote: "I\u2019ve seen a more focused importance of where he\u2019s spending that screen time \u2014 and that\u2019s been really great.",
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

          {/* Testimonial video styles — red play button, overlay, shadow */}
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

      {/* ══ 9. SECURE YOUR SLOT — red bg ═══════════════════════════════════ */}
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
            {/* Center darkening for headline legibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
              }}
            />
          </div>
          <div className="relative z-10"
        >
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
                <div className="flex flex-wrap gap-12 mb-10">
                  <div>
                    <p className="font-body font-bold uppercase mb-2 text-black/40" style={{ fontSize: "16px", letterSpacing: "2px" }}>Start Date</p>
                    <p className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>Summer 2026</p>
                  </div>
                  <div>
                    <p className="font-body font-bold uppercase mb-2 text-black/40" style={{ fontSize: "16px", letterSpacing: "2px" }}>Platform</p>
                    <p className="font-display text-black uppercase leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>PC / Discord</p>
                  </div>
                </div>
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
                  Includes 15 hrs of coaching<br />+ Secure Discord access
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

      {/* ══ 10. FAQ — black bg ═══════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <section
          id="faq"
          className="bg-black relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            scrollMarginTop: "80px",
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
