import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import Link from "next/link";
import Image from "next/image";

// ── EKUZO 101: Summer Pilot landing page ────────────────────────────────────
// Noindex — pilot program, not for public search indexing.
// Section arc: Hero → How It Works → Coaches → Testimonials → FAQ → FooterBanner
// Copy source: docs/ekuzo101-pilot/copy-deck.md (frozen 2026-07-15)
// Visual DNA: matches camps v2 aesthetic (dark hero, Tungsten display, red accents).

export const metadata = {
  title: "EKUZO 101 Summer Pilot: Try It Free",
  description:
    "4 weeks of elite esports coaching. You pick the weeks. Free upfront.",
  alternates: { canonical: "/programs/ekuzo101" },
  robots: { index: false, follow: true },
};

// ── Data ─────────────────────────────────────────────────────────────────────

const howItWorksSteps = [
  {
    number: "01",
    title: "Pick your weeks.",
    desc: "Choose any four weeks from the next six Tuesdays. Mix and match around vacations, travel, or summer chaos. Your schedule, your call.",
  },
  {
    number: "02",
    title: "Show up Tue/Thu, 7-8:30 PM ET.",
    desc: "Your gamer logs on. Coach takes it from there. 90 minutes, coach-led, small group.",
  },
  {
    number: "03",
    title: "The coach builds the team.",
    desc: "Same coach, same teammates, every session. Not random matchmaking - a real squad with norms, accountability, and someone running the room.",
  },
  {
    number: "04",
    title: "If it was worth it, you'll know.",
    desc: "At the end of the four weeks, Karlin will reach out personally. Free means free - no auto-charge, no card on file, no awkward invoice showing up. Just an honest conversation about whether it worked.",
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
];

const faqItems = [
  {
    question: "How does the free pilot work?",
    answer:
      "Your gamer joins for four sessions over four weeks (two per week, Tue/Thu, 7-8:30 PM ET). No card required. No automatic charge at the end. At the conclusion, Karlin reaches out personally. If the program was worth it, you'll hear about options to continue. If not, you part ways and nothing is owed. This is not a free trial with a billing date attached. It is a genuine pilot.",
  },
  {
    question: "What if we miss a week?",
    answer:
      "Sessions are live and coach-led, so there is a real-time element. If your family needs to skip a week, that week simply doesn't count toward your four. You choose from the available six-week window, so the schedule has built-in flexibility for summer travel and busy patches. Missing one doesn't end the program.",
  },
  {
    question: "What game do you play?",
    answer:
      "EKUZO trains on League of Legends. It provides rich team dynamics, communication requirements, and deep strategy. It's free to play and doesn't require high-end hardware. Your gamer will need a computer (PC or Mac) that can run the game, a stable internet connection, and a headset with a mic. The competitive fundamentals - communication, decision-making under pressure, role discipline, and map and team awareness - carry over to the other games your kid already plays. Students consistently get better at all of them.",
  },
  {
    question: "What age range is this for?",
    answer: "Students aged 10-18. We group players by age and skill level.",
  },
  {
    question: "How is this different from EKUZO100?",
    answer:
      "EKUZO100 is a fixed four-week program that runs year-round on a set schedule. EKUZO 101 is the flexible version - you pick which four weeks work for your family from a rolling six-week window. Same coaching system, same team structure. EKUZO 101 is for families who want the experience first, on their own terms, before committing to a scheduled cohort.",
  },
  {
    question: "Is this only for competitive or experienced players?",
    answer:
      "No. Coaches meet students where they are, from casual to aspiring competitors, and ensure every team is inclusive and supportive. If your gamer is new to the game, that's fine. New players are exactly who the structure is built for - a beginner gains almost nothing from grinding solo queue alone. A coached environment is where the actual learning happens.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Ekuzo101LandingPage() {
  return (
    <>
      <Nav variant="dark" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 100% 100%, rgba(180, 20, 20, 0.7), transparent 60%), #0a0a0a",
          minHeight: "min(640px, 90vh)",
          paddingTop: "140px",
          paddingBottom: "80px",
        }}
      >
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10">
          {/* Eyebrow */}
          <p
            className="font-body font-bold text-red uppercase tracking-widest mb-4"
            style={{ fontSize: "clamp(0.7rem, 1vw, 13px)", letterSpacing: "0.14em" }}
          >
            EKUZO 101 - SUMMER PILOT
          </p>

          {/* H1 */}
          <h1
            className="font-display uppercase text-white leading-[0.9] mb-6"
            style={{ fontSize: "clamp(4rem, 10vw, 120px)" }}
          >
            YOUR FIRST<br />
            <span className="text-red">TEAM</span>
          </h1>

          {/* Subhead */}
          <p
            className="font-body text-white/80 max-w-xl mb-10"
            style={{ fontSize: "clamp(1rem, 1.4vw, 20px)", lineHeight: "1.7" }}
          >
            Four weeks. Two nights a week. A real coach, a real squad, and no card required.
            This is what EKUZO feels like before you commit to anything.
          </p>

          {/* CTA */}
          <Link
            href="/programs/ekuzo101/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-red text-white font-body font-bold rounded-sm hover:brightness-110 active:scale-[0.98] active:brightness-90 transition-all duration-150"
            style={{ fontSize: "18px" }}
          >
            Claim Your Spot
          </Link>
        </div>
      </section>

      {/* ── Screentime Bridge ─────────────────────────────────────────────── */}
      <section className="bg-[#f0edea]">
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "72px", paddingBottom: "72px" }}
        >
          <div className="max-w-2xl">
            <p
              className="font-body text-[#0a0a0a]"
              style={{ fontSize: "clamp(1rem, 1.3vw, 18px)", lineHeight: "1.8" }}
            >
              Your kid is already on screens Tuesday and Thursday evenings.
              The difference is whether someone&apos;s coaching them through it.
            </p>
            <p
              className="font-body text-[#374151] mt-6"
              style={{ fontSize: "clamp(0.9rem, 1.2vw, 17px)", lineHeight: "1.8" }}
            >
              Not all screen time is the same activity - a coached 90-minute practice session
              is about as far from scrolling TikTok at 11 PM as youth soccer is from sitting in
              the bleachers. Games are dense, fast-feedback environments. A coach is what
              converts that density into something your kid can actually name out loud.
            </p>
            <p
              className="font-body font-bold text-[#0a0a0a] mt-6"
              style={{ fontSize: "clamp(0.95rem, 1.2vw, 17px)", lineHeight: "1.7" }}
            >
              Pick your weeks. Try it free. See the difference firsthand.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <h2
            className="font-display uppercase text-black leading-[0.9] mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 64px)" }}
          >
            Simple. Flexible. No card required.
          </h2>
          <p
            className="font-body text-[#6b7280] mb-16"
            style={{ fontSize: "clamp(0.9rem, 1.2vw, 17px)", lineHeight: "1.7" }}
          >
            Four steps. Four weeks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {howItWorksSteps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <span
                  className="font-display text-red leading-none shrink-0"
                  style={{ fontSize: "clamp(2rem, 3vw, 40px)", lineHeight: "1" }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <div>
                  <h3
                    className="font-body font-bold text-[#0a0a0a] mb-2"
                    style={{ fontSize: "clamp(1rem, 1.3vw, 18px)", lineHeight: "1.4" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-body text-[#374151]"
                    style={{ fontSize: "clamp(0.875rem, 1.1vw, 16px)", lineHeight: "1.7" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Link
              href="/programs/ekuzo101/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-red text-white font-body font-bold rounded-sm hover:brightness-110 active:scale-[0.98] active:brightness-90 transition-all duration-150"
              style={{ fontSize: "16px" }}
            >
              Claim Your Spot
            </Link>
          </div>
        </div>
      </section>

      {/* ── Coaches ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a]">
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <h2
            className="font-display uppercase text-white leading-[0.9] mb-8"
            style={{ fontSize: "clamp(2.5rem, 5vw, 64px)" }}
          >
            Your Coaches
          </h2>

          <p
            className="font-body text-white/70 max-w-2xl mb-14"
            style={{ fontSize: "clamp(0.9rem, 1.2vw, 17px)", lineHeight: "1.8" }}
          >
            Every EKUZO coach is a top 1% collegiate esports athlete or former professional
            player - background-checked and trained in gameplay, pedagogy, safety, and
            social-emotional growth. Sessions are coach-led and recorded. The coach isn&apos;t
            a babysitter for the game. They run the room, moderate the voice chat, review
            plays, and make the learning visible. That&apos;s the difference between a kid who
            grinds for hours and goes nowhere and a kid who walks away from a 90-minute
            session able to tell you what they learned.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coachCards.map((coach) => (
              <div key={coach.name} className="bg-[#1a1a1a] rounded-sm overflow-hidden flex flex-col sm:flex-row gap-0">
                <div className="relative w-full sm:w-48 shrink-0" style={{ minHeight: "220px" }}>
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: coach.objectPosition }}
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                </div>
                <div className="px-6 py-6">
                  <h3
                    className="font-display uppercase text-white leading-tight mb-1"
                    style={{ fontSize: "clamp(1.25rem, 1.8vw, 22px)" }}
                  >
                    {coach.name}
                  </h3>
                  <p
                    className="font-body font-bold text-red mb-3"
                    style={{ fontSize: "12px", letterSpacing: "0.05em" }}
                  >
                    {coach.role}
                  </p>
                  <p
                    className="font-body text-white/70"
                    style={{ fontSize: "14px", lineHeight: "1.7" }}
                  >
                    {coach.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <h2
            className="font-display uppercase text-black leading-[0.9] mb-12"
            style={{ fontSize: "clamp(2.5rem, 5vw, 64px)" }}
          >
            What Families Say
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#f0edea]">
        <div
          className="max-w-[800px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <h2
            className="font-display uppercase text-black leading-[0.9] mb-12"
            style={{ fontSize: "clamp(2.5rem, 5vw, 64px)" }}
          >
            Questions parents actually ask
          </h2>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <FooterBanner
        heading="Four weeks. No card. Real coaches."
        ctaLabel="Claim Your Spot"
        ctaHref="/programs/ekuzo101/register?cta=footer"
      />

      <Footer hideTornPaper />
    </>
  );
}
