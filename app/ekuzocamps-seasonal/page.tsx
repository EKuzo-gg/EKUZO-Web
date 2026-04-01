import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import Image from "next/image";
import TestimonialVideo from "@/components/ui/TestimonialVideo";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata = {
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
    title: "Small Squads",
    desc: "Strict 1:5 coach-to-student ratio guarantees personalized VOD reviews and real attention every session.",
  },
  {
    title: "Vetted Coaches",
    desc: "Background-checked, high-ELO coaches trained in EKUZO's youth coaching methodology.",
  },
  {
    title: "Safe Servers",
    desc: "All communication happens in moderated, private Discord channels. No toxic public lobbies.",
  },
  {
    title: "Life Skills",
    desc: "We focus on communication, resilience, and teamwork — skills that outlast the game.",
  },
];

const coachCards = [
  {
    name: 'KARLIN "FAITH" OEI',
    role: "Head Coach // Grandmaster Mid",
    bio: "Former collegiate esports captain. Specializes in macro-rotations and mid-lane priority. Focuses on communication skills.",
  },
  {
    name: 'SEBASTIEN "ZZ" DEMONTIGNY',
    role: "Tactical Coach // Master Support",
    bio: "2 years coaching youth esports. Expert in vision control and ADC peel. Passionate about tilt-management and mental fortitude.",
  },
  {
    name: 'MARCUS "RIFT" JOHNSON',
    role: "Mechanics Coach // Master Jungle",
    bio: "Analytical pathing expert. Breaks down complex jungle clear timings into digestible concepts. Leads VOD review sessions.",
  },
];

const campsFAQs = [
  {
    question: "What age range is EKUZO Camp for?",
    answer:
      "EKUZO Camps are designed for players aged 11–18. We group players by age and skill level to ensure the best experience for everyone.",
  },
  {
    question: "What game does EKUZO Camp use?",
    answer:
      "Camps are currently built around League of Legends. It's free to download and requires only a basic PC. Other game options may be added in future seasons.",
  },
  {
    question: "Does my child need experience in League of Legends?",
    answer:
      "No — beginners are welcome. Coaches are trained to work with all skill levels. The focus is on growth, teamwork, and developing good habits, not on rank.",
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
// Section order follows wireframe-zombie-1:
// Hero → Stats Ticker → Logistics → Squad → Marquee → Curriculum →
// Parent Briefing → Coaches → Testimonials → Secure Your Slot → FAQ → Footer

export default function EkuzoCampsPage() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="dark" />
      </div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center text-center"
        style={{
          minHeight: "100vh",
          paddingTop: "120px",
          paddingBottom: "80px",
          backgroundColor: "#faff00",
        }}
      >
        {/* Background video — placeholder until camp-specific video is sourced */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply"
          aria-hidden="true"
        >
          <source src="/videos/ekuzo-teams-hero.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 px-6 w-full max-w-6xl mx-auto">
          {/* Rhombus tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {["100% Virtual", "Ages 10–18", "Skills Camp"].map((tag) => (
              <span
                key={tag}
                className="inline-block bg-black text-white font-body font-bold text-xs tracking-[0.15em] uppercase px-5 py-2"
                style={{ transform: "skewX(-8deg)" }}
              >
                <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
                  {tag}
                </span>
              </span>
            ))}
          </div>

          {/* EKUZO CAMPS — Tungsten Narrow display */}
          <h1
            className="font-display text-black uppercase leading-[0.9] mb-10 whitespace-nowrap"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)", letterSpacing: "0.02em" }}
          >
            EKUZOCAMP
          </h1>

          {/* Subheadline */}
          <h2
            className="font-display text-black uppercase leading-[0.95] mx-auto mb-6"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              maxWidth: "66vw",
              letterSpacing: "0.02em",
            }}
          >
            LEVEL UP YOUR GAME.
            <br />
            BUILD YOUR SQUAD.
          </h2>

          {/* Body copy — black for legibility */}
          <p
            className="font-body text-black text-base leading-relaxed max-w-lg mx-auto mb-10"
          >
            The premier online esports summer camp where you don&apos;t just learn to carry — you learn to communicate, collaborate, and compete as a unit.
          </p>

          {/* Single CTA */}
          <div>
            <Button variant="red-filled" href="/camps/register">
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* ══ 2. STATS TICKER ══════════════════════════════════════════════════ */}
      <div
        className="bg-black overflow-hidden relative z-10"
        aria-hidden="true"
      >
        <div style={{ paddingTop: "14px", paddingBottom: "14px" }}>
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "marquee-camps 28s linear infinite" }}
          >
            {Array.from({ length: 2 }).map((_, i) => (
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
                    className="font-display text-white text-2xl tracking-widest mx-6"
                  >
                    {item}
                    <span className="text-red mx-6">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        {/* Red bottom rule */}
        <div className="w-full bg-red" style={{ height: "6px" }} />
        <style>{`
          @keyframes marquee-camps {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══ 3. CAMP OVERVIEW ═══════════════════════════════════════════════════ */}
      <section className="bg-black py-24" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          {/* Section heading — H4 tier */}
          <h2
            className="font-body font-bold text-red leading-[1] text-center mb-16"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "0.01em" }}
          >
            Camp overview
          </h2>

          {/* Logistics grid — verbatim from zombie HTML (design-f3e326f6).
              4-col → 2-col (≤1024) → 1-col (≤640). Border grid, no gap, space-between.
              EKUZO swaps: font-display/font-body, red labels, our SVG icons, updated copy. */}
          <div className="camps-logistics-grid">
            {[
              { icon: "hard-problem", label: "RATIO", value: "1:5", desc: "COACH TO STUDENT" },
              { icon: "calendar", label: "DURATION", value: "M-F", desc: "15 HOURS TOTAL" },
              { icon: "chat", label: "WHERE", value: "ONLINE", desc: "PLAY FROM HOME" },
              { icon: "team", label: "COST", value: "$199", desc: null, badge: "Early Bird Pricing" },
            ].map((card) => (
              <div key={card.label} className="camps-logic-card">
                <div className="w-[40px] h-[40px] mb-8">
                  <Icon name={card.icon as IconName} size={40} className="w-full h-full" />
                </div>
                <div>
                  <div className="camps-logic-title font-display">{card.label}</div>
                  <div className="camps-logic-data font-display">{card.value}</div>
                  {card.badge ? (
                    <span className="camps-logic-badge font-body">{card.badge}</span>
                  ) : (
                    <div className="camps-logic-desc font-body">{card.desc}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            .camps-logistics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0;
              border: 3px solid #000;
              background: #fff;
              position: relative;
              z-index: 10;
            }
            .camps-logic-card {
              padding: 3rem 2rem;
              border-right: 1px solid #ddd;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .camps-logic-card:last-child { border-right: none; }
            .camps-logic-title {
              font-size: 1.2rem;
              color: var(--color-red);
              text-transform: uppercase;
              letter-spacing: 0.02em;
              font-weight: 500;
              margin-bottom: 0.5rem;
            }
            .camps-logic-data {
              font-size: 3.5rem;
              line-height: 0.9;
              color: #000;
              letter-spacing: 0.02em;
            }
            .camps-logic-desc {
              color: #666;
              margin-top: 1rem;
              font-size: 0.95rem;
              letter-spacing: -0.01em;
            }
            .camps-logic-badge {
              display: inline-block;
              background: #ffd200;
              color: #000;
              font-weight: 700;
              font-size: 0.95rem;
              padding: 0.35rem 0.75rem;
              border-radius: 12px;
              margin-top: 1rem;
            }
            @media (max-width: 1024px) {
              .camps-logistics-grid { grid-template-columns: repeat(2, 1fr); }
              .camps-logic-card { border-bottom: 1px solid #ddd; }
              .camps-logic-card:nth-child(even) { border-right: none; }
            }
            @media (max-width: 640px) {
              .camps-logistics-grid { grid-template-columns: 1fr; }
              .camps-logic-card { border-right: none; }
            }
          `}</style>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 4. TAKE YOUR TEAM WITH YOU ═══════════════════════════════════════ */}
      <section className="bg-white py-24" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Rhombus pill — matches hero tag style */}
              <div className="mb-6">
                <Eyebrow>The EKUZO Difference</Eyebrow>
              </div>
              <h2
                className="font-body font-bold text-black leading-[1] mb-6"
                style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "0.01em" }}
              >
                The squad stays together.
              </h2>
              <p className="font-body text-black/70 leading-relaxed mb-6" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                Most camps end on Friday, and the kids go their separate ways. At EKUZO, we place campers into 5-player squads on Day 1. You train together, compete together, and learn to communicate.
              </p>
              <p className="font-body text-black/70 leading-relaxed mb-8" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
                When camp ends, the squad remains. Campers leave not just with better skills, but with a reliable, non-toxic team to keep climbing the ranks with.
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

            {/* Squad formation visual — original structure with Discord-style avatars */}
            <div className="flex flex-col gap-2">
              {squadRoles.map((player, i) => (
                <div
                  key={player.role}
                  className={`relative flex items-center gap-0 overflow-hidden ${
                    player.featured ? "shadow-2xl z-10" : ""
                  }`}
                  style={{ transform: player.featured ? "scale(1.04)" : undefined }}
                >
                  <div
                    className={`shrink-0 w-2 self-stretch ${
                      i % 2 === 0 ? "bg-red" : "bg-black"
                    }`}
                  />
                  <div
                    className={`flex-1 flex items-center gap-4 px-5 py-4 border-2 ${
                      player.featured
                        ? "border-red bg-black text-white"
                        : "border-black/10 bg-[#f7f7f7] text-black"
                    }`}
                  >
                    {/* Discord-style avatar */}
                    <img
                      src={player.avatar}
                      alt={player.handle}
                      className="shrink-0 w-10 h-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                    {/* Name + role side by side */}
                    <div className="flex items-baseline gap-3 flex-1">
                      <div
                        className={`font-display text-2xl leading-none ${
                          player.featured ? "text-white" : "text-black"
                        }`}
                      >
                        {player.handle}
                      </div>
                      <div
                        className={`font-body text-xs font-bold uppercase tracking-widest ${
                          player.featured ? "text-red" : "text-black/40"
                        }`}
                      >
                        {player.role}
                      </div>
                    </div>
                    {player.featured && (
                      <span className="font-body text-xs font-bold text-red bg-red/10 px-2 py-1 uppercase tracking-wider whitespace-nowrap">
                        Your Gamer
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <p className="font-body text-black/40 text-xs mt-3 text-center">
                Your team. Your roles. Your Discord. Forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TornPaperDivider color="white" />

      {/* ══ 5. THE PATHWAY / CURRICULUM ══════════════════════════════════════ */}
      <section
        id="curriculum"
        className="bg-grey scroll-mt-20"
        style={{ padding: "8rem 0" }}
      >
        <div className="max-w-[1232px] mx-auto" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <h2
            className="font-body font-bold text-black leading-[1] mb-12"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "0.01em" }}
          >
            The 5-day progression
          </h2>

          <div className="camps-curr-container">
            {weekPath.map((step) => (
              <div
                key={step.day}
                className={`camps-curr-row${step.highlight ? " camps-curr-highlight" : ""}`}
              >
                <div className="camps-curr-num font-body">
                  {step.day}
                </div>
                <div className="camps-curr-title">
                  <h3 className="font-body camps-curr-h3">{step.title}</h3>
                </div>
                <div className="camps-curr-desc font-body">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            .camps-curr-container {
              display: flex;
              flex-direction: column;
              gap: 2rem;
            }
            .camps-curr-row {
              display: grid;
              grid-template-columns: 100px 1fr 2fr;
              background: #fff;
              border: 1px solid rgba(0,0,0,0.08);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .camps-curr-row:hover {
              background: #fafafa;
              border-color: rgba(0,0,0,0.15);
              transform: translateX(10px);
            }
            .camps-curr-row::before {
              content: '';
              position: absolute;
              left: 0; top: 0; bottom: 0;
              width: 4px;
              background: var(--color-red);
              transform: scaleY(0);
              transition: transform 0.3s ease;
              transform-origin: bottom;
            }
            .camps-curr-row:hover::before { transform: scaleY(1); }
            .camps-curr-highlight::before { transform: scaleY(1); }
            .camps-curr-num {
              font-size: 2.5rem;
              font-weight: 900;
              text-transform: uppercase;
              color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              border-right: 1px solid rgba(0,0,0,0.08);
              letter-spacing: 0.8px;
            }
            .camps-curr-title {
              padding: 2rem;
              display: flex;
              flex-direction: column;
              justify-content: center;
              border-right: 1px solid rgba(0,0,0,0.08);
            }
            .camps-curr-h3 {
              font-size: 1.75rem;
              letter-spacing: 0.8px;
              color: var(--color-red);
              line-height: 1.2;
              font-weight: 900;
            }
            .camps-curr-desc {
              padding: 2rem;
              display: flex;
              align-items: center;
              color: #000;
              font-size: 1.1rem;
              line-height: 1.6;
            }
            @media (max-width: 1024px) {
              .camps-curr-row { grid-template-columns: 80px 1fr; }
              .camps-curr-desc { grid-column: 1 / -1; padding-top: 0; }
            }
            @media (max-width: 600px) {
              .camps-curr-num { font-size: 2rem; }
              .camps-curr-h3 { font-size: 1.35rem; }
            }
          `}</style>
        </div>
      </section>

      <TornPaperDivider color="grey" />

      {/* ══ 7. PARENT BRIEFING ═══════════════════════════════════════════════ */}
      <section className="bg-white py-24" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          {/* Red rhombus pill */}
          <div className="mb-6">
            <Eyebrow>Parent Briefing</Eyebrow>
          </div>

          <h2
            className="font-body font-bold text-black leading-[1] mb-4"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "0.01em" }}
          >
            Structured, safe, and skill-oriented
          </h2>
          <p className="font-body text-black leading-relaxed mb-12 max-w-3xl" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
            We treat esports with the same educational rigor as a traditional sports camp.
          </p>

          {/* Trust grid — verbatim from design-bdcef6c8 zombie HTML */}
          <div className="camps-trust-grid">
            <div className="camps-trust-item">
              <h4 className="font-body">Small Squads</h4>
              <p className="font-body">Strict 1:5 coach-to-student ratio guarantees personalized VOD reviews and attention.</p>
            </div>
            <div className="camps-trust-item">
              <h4 className="font-body">Vetted Pros</h4>
              <p className="font-body">Coaches are background-checked, high-ELO players trained in youth education.</p>
            </div>
            <div className="camps-trust-item">
              <h4 className="font-body">Safe Servers</h4>
              <p className="font-body">All communication happens in moderated, private Discord channels. No toxic public lobbies.</p>
            </div>
            <div className="camps-trust-item">
              <h4 className="font-body">Skill Building</h4>
              <p className="font-body">We focus on communication, resilience, and teamwork—skills that outlast the game.</p>
            </div>
          </div>

          <style>{`
            .camps-trust-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1.5rem;
            }
            .camps-trust-item {
              background-color: #f4f4f5;
              padding: 2rem;
              border: 3px solid #000;
              box-shadow: 4px 4px 0px #000;
            }
            .camps-trust-item h4 {
              font-size: 1.25rem;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 0.5rem;
              color: #000;
            }
            .camps-trust-item p {
              font-size: 0.95rem;
              color: #4b5563;
              line-height: 1.5;
            }
            @media (max-width: 1024px) {
              .camps-trust-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 768px) {
              .camps-trust-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </div>
      </section>

      <TornPaperDivider color="white" />

      {/* ══ 8. LEARN FROM THE BEST (COACHES) ═════════════════════════════════ */}
      <section className="bg-red" style={{ padding: "100px 0" }}>
        <div className="max-w-[1232px] mx-auto" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          {/* White pill label on red bg */}
          <div className="text-center mb-4">
            <span
              className="inline-block bg-white text-red font-body font-bold text-xs tracking-[0.15em] uppercase px-5 py-2"
              style={{ transform: "skewX(-8deg)" }}
            >
              <span style={{ transform: "skewX(8deg)", display: "inline-block" }}>Elite Coaches</span>
            </span>
          </div>
          <h2
            className="font-body font-bold text-white leading-[1] text-center mb-14"
            style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "0.01em" }}
          >
            Learn from the best
          </h2>

          <div className="camps-coach-grid">
            {coachCards.map((coach) => (
              <div key={coach.name} className="camps-coach-card group">
                {/* Photo placeholder */}
                <div className="camps-coach-img-wrap">
                  <Image
                    src="/images/coaching-learner-photo.jpg"
                    alt={coach.name}
                    fill
                    className="object-cover grayscale contrast-[1.2] group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h4
                  className="font-display text-black leading-none mb-1"
                  style={{ fontSize: "1.5rem", letterSpacing: "0.02em" }}
                >
                  {coach.name}
                </h4>
                <p className="font-body text-red text-xs font-bold uppercase tracking-wider mb-4">
                  {coach.role}
                </p>
                <p className="font-body text-black text-sm leading-relaxed">
                  {coach.bio}
                </p>
              </div>
            ))}
          </div>

          <style>{`
            .camps-coach-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 32px;
            }
            .camps-coach-card {
              background: #fff;
              border-top: 3px solid #000;
              padding: 24px;
              position: relative;
              overflow: hidden;
            }
            .camps-coach-card::after {
              content: '';
              position: absolute;
              top: 0; right: 0;
              width: 40px; height: 40px;
              background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.08) 50%);
            }
            .camps-coach-img-wrap {
              position: relative;
              width: 100%;
              height: 250px;
              margin-bottom: 20px;
              border-bottom: 1px solid rgba(0,0,0,0.08);
              overflow: hidden;
            }
            @media (max-width: 1024px) {
              .camps-coach-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 768px) {
              .camps-coach-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </div>
      </section>

      <TornPaperDivider color="red" />

      {/* ══ 9. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="bg-white" style={{ padding: "100px 0" }}>
        <div className="max-w-[1232px] mx-auto" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <h2
            className="font-body font-bold text-black leading-[1] text-center mb-16"
            style={{ fontSize: "clamp(2rem, 3.3vw, 48px)", letterSpacing: "0.01em" }}
          >
            Real stories from EKUZO families
          </h2>

          <div className="camps-testimonial-layout">
            {/* Vertical video — Rajitha */}
            <TestimonialVideo
              src="/testimonial-videos/rajitha-parent.mp4"
              name="Rajitha"
              role="EKUZO parent"
            />

            {/* Pull quotes */}
            <div className="camps-testimonial-quotes">
              {/* Brad */}
              <div className="camps-quote-wrapper">
                <div className="camps-quote-shadow" />
                <blockquote className="camps-quote-card">
                  <Image
                    src="/images/testimonial-quote-mark.png"
                    alt=""
                    width={56}
                    height={48}
                    className="camps-quote-icon"
                    aria-hidden="true"
                  />
                  <p className="font-body font-bold text-black text-center" style={{ fontSize: "clamp(1.125rem, 1.9vw, 28px)", lineHeight: "38px", letterSpacing: "-0.56px" }}>
                    &ldquo;The coaches are very intentional about teaching that behind each avatar is a real person.&rdquo;
                  </p>
                  <footer className="mt-6 text-center">
                    <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px" }}>Brad</span>
                    <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px", opacity: 0.5 }}>Parent of a girl gamer</span>
                  </footer>
                </blockquote>
              </div>

              {/* Becky */}
              <div className="camps-quote-wrapper">
                <div className="camps-quote-shadow" />
                <blockquote className="camps-quote-card">
                  <Image
                    src="/images/testimonial-quote-mark.png"
                    alt=""
                    width={56}
                    height={48}
                    className="camps-quote-icon"
                    aria-hidden="true"
                  />
                  <p className="font-body font-bold text-black text-center" style={{ fontSize: "clamp(1.125rem, 1.9vw, 28px)", lineHeight: "38px", letterSpacing: "-0.56px" }}>
                    &ldquo;I&apos;ve seen a more focused importance of where he&apos;s spending that screen time — and that&apos;s been really great.&rdquo;
                  </p>
                  <footer className="mt-6 text-center">
                    <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px" }}>Becky</span>
                    <span className="font-body text-black block" style={{ fontSize: "clamp(1rem, 1.6vw, 24px)", lineHeight: "34px", opacity: 0.5 }}>EKUZO parent</span>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>

          <style>{`
            .camps-testimonial-layout {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 48px;
              align-items: start;
            }
            .camps-testimonial-video-wrap {
              display: flex;
              justify-content: center;
            }
            .camps-video-wrapper {
              position: relative;
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
            }
            .camps-video-shadow {
              position: absolute;
              top: 16px;
              left: 13px;
              right: -13px;
              bottom: -16px;
              background: #F92524;
            }
            .camps-testimonial-quotes {
              display: flex;
              flex-direction: column;
              gap: 32px;
              padding-top: 8px;
            }
            .camps-quote-wrapper {
              position: relative;
            }
            .camps-quote-shadow {
              position: absolute;
              top: 16px;
              left: 13px;
              right: -13px;
              bottom: -16px;
              background: #e5e7eb;
            }
            .camps-quote-card {
              position: relative;
              background: #fff;
              border: 2px solid #e5e7eb;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .camps-quote-icon {
              margin-bottom: 20px;
            }
            @media (max-width: 768px) {
              .camps-testimonial-layout {
                grid-template-columns: 1fr;
              }
              .camps-testimonial-video {
                max-height: 500px;
                max-width: 300px;
              }
              .camps-quote-card {
                padding: 28px;
              }
            }
          `}</style>
        </div>
      </section>

      <TornPaperDivider color="white" />

      {/* ══ 10. SECURE YOUR SLOT ═════════════════════════════════════════════ */}
      <section
        id="register"
        className="scroll-mt-20"
        style={{ backgroundColor: "#AE2CF2", padding: "120px 0" }}
      >
        <div
          className="max-w-[1232px] mx-auto flex justify-center"
          style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
        >
          {/* Ticket card with neon shadow */}
          <div className="camps-ticket-wrap">
            <div className="camps-ticket-shadow" />
            <div className="camps-ticket">
              {/* Main panel — white */}
              <div className="camps-ticket-main">
                <h2
                  className="font-display uppercase text-black leading-none mb-10"
                  style={{ fontSize: "clamp(3rem, 7vw, 100px)", letterSpacing: "2px" }}
                >
                  Secure Your Slot
                </h2>

                <div className="flex flex-wrap gap-12 mb-10">
                  <div>
                    <p className="font-body font-bold uppercase mb-2" style={{ fontSize: "20px", letterSpacing: "2px", color: "#AD2BF1" }}>Start Date</p>
                    <p className="font-body font-bold text-black uppercase" style={{ fontSize: "clamp(1.5rem, 2.2vw, 32px)" }}>Summer 2026</p>
                  </div>
                  <div>
                    <p className="font-body font-bold uppercase mb-2" style={{ fontSize: "20px", letterSpacing: "2px", color: "#AD2BF1" }}>Platform</p>
                    <p className="font-body font-bold text-black uppercase" style={{ fontSize: "clamp(1.5rem, 2.2vw, 32px)" }}>PC / Discord</p>
                  </div>
                </div>

                <a
                  href="/camps/register"
                  className="inline-flex items-center justify-center bg-red font-body font-bold text-white text-center"
                  style={{ fontSize: "clamp(1rem, 1.9vw, 28px)", padding: "24px 48px", letterSpacing: "-0.56px" }}
                >
                  Register Now
                </a>
              </div>

              {/* Stub — black */}
              <div className="camps-ticket-stub">
                <p
                  className="font-body font-bold text-white uppercase"
                  style={{ fontSize: "20px", letterSpacing: "2px", marginBottom: "16px" }}
                >
                  Camp Tuition
                </p>
                <p
                  className="font-display leading-none"
                  style={{ fontSize: "clamp(4rem, 14vw, 200px)", letterSpacing: "4px", color: "#D4FF00" }}
                >
                  $199
                </p>
                <p className="font-body font-bold text-white/80 uppercase text-center" style={{ fontSize: "20px", letterSpacing: "2px", lineHeight: "28px", marginBottom: "24px" }}>
                  Includes 15 hrs of coaching
                  <br />
                  +Secure Discord access
                </p>
                <div
                  className="inline-flex items-center justify-center font-body font-bold"
                  style={{ border: "4px solid #D4FF00", borderRadius: "12px", padding: "12px 16px", color: "#D4FF00", fontSize: "28px", letterSpacing: "-0.28px" }}
                >
                  *Early Bird Pricing
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .camps-ticket-wrap {
            position: relative;
            width: 100%;
            max-width: 1218px;
          }
          .camps-ticket-shadow {
            position: absolute;
            top: 29px;
            left: 55px;
            right: -55px;
            bottom: -29px;
            background: #D4FF00;
          }
          .camps-ticket {
            position: relative;
            display: flex;
            background: #fff;
            border: 6px solid #000;
          }
          .camps-ticket-main {
            flex: 1.75;
            padding: clamp(2.5rem, 5vw, 4.5rem);
          }
          .camps-ticket-stub {
            flex: 1;
            background: #000;
            padding: clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          @media (max-width: 768px) {
            .camps-ticket {
              flex-direction: column;
            }
            .camps-ticket-shadow {
              top: 16px;
              left: 16px;
              right: -16px;
              bottom: -16px;
            }
          }
        `}</style>
      </section>

      <TornPaperDivider color="purple" />

      {/* ══ 11. FAQ ══════════════════════════════════════════════════════════ */}
      <section
        className="bg-white"
        style={{ paddingTop: "144px", paddingBottom: "144px", paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
      >
        <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <div className="mb-4">
              <Eyebrow>FAQ</Eyebrow>
            </div>
            <h4 className="font-body font-bold text-black leading-tight" style={{ fontSize: "clamp(1.5rem, 1.8vw, 24px)" }}>
              Frequently Asked Questions
            </h4>
          </div>
          <div className="flex-1">
            <FAQAccordion items={campsFAQs} theme="light" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
