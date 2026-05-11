import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import CreatorApplicationForm from "@/components/sections/CreatorApplicationForm";

/**
 * /creators — Creator Partnership landing page
 *
 * Audience: creator parents (general creator economy, not gaming-specific)
 * Goal: apply to partner — kid gets a free EKUZO spot in exchange for
 *       authentic storytelling that helps fill the cohort around them.
 *
 * Defaults set conservatively for a partnership/outreach page:
 *   - noindex (we want this surfaced via direct outreach, not search)
 *   - NOT linked from main nav
 * Flip both when ready to open the funnel up.
 */

export const metadata: Metadata = {
  title: "Creator Partnership — Apply",
  description:
    "Your kid gets a free spot in EKUZO. You share the journey honestly with your audience and help fill the cohort around them. Apply to partner.",
  alternates: { canonical: "/creators" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "EKUZO Creator Partnership",
    description:
      "Your kid plays. We'll build the team around them. A creator partnership for parents who want gaming to feel different.",
    url: "https://ekuzo.gg/creators",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO Creator Partnership",
      },
    ],
  },
};

const sectionPad = {
  paddingTop: "clamp(72px, 12vw, 160px)",
  paddingBottom: "clamp(72px, 12vw, 160px)",
  paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
  paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
};

const containerStyle = {
  maxWidth: "1232px",
  marginLeft: "auto",
  marginRight: "auto",
};

export default function CreatorsPage() {
  return (
    <>
      {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
      <section
        className="bg-red text-white relative overflow-visible"
        style={{
          paddingTop: 0,
          paddingBottom: "clamp(80px, 12vw, 160px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="-mx-[clamp(1.5rem,7.2vw,104px)]">
          <Nav variant="dark" />
        </div>

        <div style={containerStyle} className="pt-12 md:pt-16">
          <Eyebrow variant="light">Creator Partnership · 2026</Eyebrow>

          <h1
            className="font-display uppercase text-white mt-5"
            style={{
              fontSize: "clamp(56px, 14vw, 156px)",
              lineHeight: 0.88,
              letterSpacing: "0.02em",
            }}
          >
            Your kid plays.
            <br />
            We&rsquo;ll build
            <br />
            the team
            <br />
            around them.
          </h1>

          <p
            className="font-body mt-6 max-w-[36ch] opacity-95"
            style={{
              fontSize: "clamp(16px, 4.4vw, 22px)",
              lineHeight: 1.45,
            }}
          >
            EKUZO is offering creator families a free spot — and a cohort to
            fill around your gamer. You share the journey honestly. We make
            sure the experience is worth telling.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="white-filled" href="#apply">
              Apply to partner
            </Button>
            <Button variant="white-outlined" href="#why">
              Read the brief
            </Button>
          </div>

          {/* Hero meta strip */}
          <div className="mt-10 pt-7 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "1", label: "Free spot for your kid" },
              { num: "5+", label: "Squad cohort to fill" },
              { num: "0", label: "Scripts, scenes, or sales pitches" },
            ].map((m) => (
              <div key={m.label}>
                <span
                  className="font-display block text-white"
                  style={{
                    fontSize: "clamp(40px, 11vw, 72px)",
                    lineHeight: 0.9,
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.num}
                </span>
                <span className="font-body block text-xs font-bold uppercase tracking-[0.16em] mt-1.5 opacity-85">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY — bg-grey ═════════════════════════════════════════════════ */}
      <section
        id="why"
        className="bg-grey text-black relative overflow-visible"
        style={sectionPad}
      >
        <TornPaperDivider color="grey" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>Why we&rsquo;re doing this</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[16ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Gaming already matters to kids.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            EKUZO exists because we believe gaming can matter in a way parents
            trust, too. Kids already show up for games with focus, energy, and
            motivation. We built the system around that — real coaches, real
            teams, structured practice, competition, learning, and safety.
            Your role is to help make that real for other families. Not by
            selling. Not by performing. By showing what happens when your kid
            experiences gaming with structure around it.
          </p>

          <div
            className="mt-10 bg-white border-l-4 border-red font-display uppercase"
            style={{
              padding: "clamp(20px, 4vw, 32px)",
              fontSize: "clamp(28px, 6.5vw, 48px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
            }}
          >
            The best content
            <br />
            helps another parent think:
            <br />
            <span className="text-red">&ldquo;That feels like my kid.&rdquo;</span>
          </div>
        </div>
      </section>

      {/* ══ THE EXCHANGE — bg-white ═══════════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>The exchange</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[18ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            What you give. What your kid gets.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 — light */}
            <div className="bg-white border border-black/10 p-7 flex flex-col gap-3">
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-red">
                Your kid receives
              </span>
              <h3
                className="font-display uppercase"
                style={{
                  fontSize: "clamp(28px, 6vw, 40px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.02em",
                }}
              >
                A free spot in EKUZO.
              </h3>
              <ul className="flex flex-col gap-2 mt-1">
                {[
                  "Real coaches who know their name",
                  "A real team — not random matchmaking",
                  "Structured practice, competition, and feedback",
                  "A safer, moderated space to play",
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[15px] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-red"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 — dark */}
            <div className="bg-black text-white border border-white/10 p-7 flex flex-col gap-3">
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-white/85">
                In return, we ask
              </span>
              <h3
                className="font-display uppercase"
                style={{
                  fontSize: "clamp(28px, 6vw, 40px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.02em",
                }}
              >
                Tell the story honestly.
              </h3>
              <ul className="flex flex-col gap-2 mt-1">
                {[
                  "Share the journey on your channel, in your voice",
                  "You own everything you post",
                  "We may repost public content with credit",
                  "Paid ads = a separate conversation, a separate yes",
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[15px] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FILL THE COHORT — bg-red ══════════════════════════════════════ */}
      <section
        className="bg-red text-white relative overflow-visible"
        style={sectionPad}
      >
        <TornPaperDivider color="red" variant="top" style={2} />

        <div style={containerStyle}>
          <Eyebrow variant="light">The real ask</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[16ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Help us fill the squad around your kid.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] opacity-95"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            EKUZO is team-based. The experience gets stronger when friends,
            siblings, classmates, or families in your audience join the same
            cohort. If five kids join, they become a squad. More than that,
            and they compete together. The most valuable thing you can do
            isn&rsquo;t a polished post — it&rsquo;s an invitation.
          </p>

          {/* Squad row */}
          <div
            className="mt-10 grid grid-cols-5 gap-2 sm:gap-3"
            aria-label="Squad slot illustration"
          >
            {[
              { n: "1", label: "Your kid", filled: true },
              { n: "2", label: "Open" },
              { n: "3", label: "Open" },
              { n: "4", label: "Open" },
              { n: "5", label: "Open" },
            ].map((s) => (
              <div
                key={s.n}
                className={`aspect-[1/1.15] flex flex-col items-center justify-center text-center p-2 ${
                  s.filled
                    ? "bg-white text-red border-2 border-white"
                    : "border-2 border-dashed border-white/40 text-white/60"
                }`}
              >
                <span
                  className="font-display uppercase"
                  style={{
                    fontSize: "clamp(20px, 5vw, 36px)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </span>
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.14em] mt-1.5 opacity-85">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <p
            className="mt-9 max-w-[60ch] font-body font-semibold opacity-95"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            &ldquo;Here&rsquo;s what we&rsquo;re trying. Here&rsquo;s why my
            kid is excited. Here&rsquo;s the cohort we&rsquo;re joining. Who
            wants to do this with us?&rdquo;
          </p>
        </div>
      </section>

      {/* ══ STORY ARC — bg-white ══════════════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={2} />

        <div style={containerStyle}>
          <Eyebrow>Content direction · The arc</Eyebrow>
          <h2
            className="font-display uppercase mt-4"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Before, during, after.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            Every strong EKUZO story follows one shape: gaming matters →
            EKUZO built a system around it → families start seeing something
            different. The outcomes are observed, not claimed. We don&rsquo;t
            need you to promise transformation. We want you to notice real
            moments and help other parents see what structured gaming can
            look like.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                stage: "Before",
                title: "Why we're trying this.",
                items: [
                  "Kid interested in competitive gaming",
                  "Family tension around screen time",
                  "Wanting safer online play",
                  "Trying to find teammates",
                  "Inviting other families to join the cohort",
                ],
              },
              {
                num: "02",
                stage: "During",
                title: "What we're noticing.",
                items: [
                  "Coach knew their name",
                  "Real teammates, not strangers",
                  "Actual practice structure",
                  "Kid taking it seriously",
                  "Less random play, more purpose",
                ],
              },
              {
                num: "03",
                stage: "After",
                title: "What stuck.",
                items: [
                  "New friends",
                  "More confidence",
                  "Better communication",
                  "A different relationship with gaming",
                  "Wanting to keep going",
                ],
              },
            ].map((arc) => (
              <div
                key={arc.num}
                className="bg-white border border-black/10 p-7 flex flex-col gap-3"
              >
                <span
                  className="font-display block text-red"
                  style={{
                    fontSize: 64,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                  }}
                >
                  {arc.num}
                </span>
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-red">
                  {arc.stage}
                </span>
                <h3
                  className="font-display uppercase"
                  style={{
                    fontSize: "clamp(24px, 5vw, 32px)",
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                  }}
                >
                  {arc.title}
                </h3>
                <ul className="flex flex-col gap-2 mt-1">
                  {arc.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-4 text-[15px] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-red"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-[60ch] font-body text-[15px] leading-relaxed text-black/65">
            Feature your kid whenever it feels natural. Their excitement,
            questions, reactions, and pride <em>are</em> the story. Nothing
            beats a genuine kid moment.
          </p>
        </div>
      </section>

      {/* ══ IN / OUT OF BOUNDS — bg-grey ══════════════════════════════════ */}
      <section className="bg-grey text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="grey" variant="top" style={2} />

        <div style={containerStyle}>
          <Eyebrow>Guardrails</Eyebrow>
          <h2
            className="font-display uppercase mt-4"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            What&rsquo;s in. What&rsquo;s out.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "In bounds",
                marker: "✓",
                items: [
                  "Use your real voice.",
                  "Share honest hesitation, curiosity, and surprise.",
                  "Show your kid's genuine excitement.",
                  "Invite your community to join your kid's cohort.",
                  "Talk about what you observe.",
                  "Make it feel like your normal content.",
                ],
              },
              {
                title: "Out of bounds",
                marker: "✕",
                items: [
                  "Don't script your kid.",
                  "Don't claim outcomes you didn't personally observe.",
                  "Don't force a scene that didn't happen.",
                  "Don't make it feel like a polished commercial.",
                  "Don't share private info about other kids or families without permission.",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3
                  className="font-display uppercase mb-4"
                  style={{
                    fontSize: "clamp(28px, 6vw, 40px)",
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                  }}
                >
                  <span className="text-red mr-2">{col.marker}</span>
                  {col.title}
                </h3>
                <ul className="flex flex-col">
                  {col.items.map((item, i) => (
                    <li
                      key={item}
                      className={`py-3.5 text-[15px] leading-relaxed border-t border-black/15 ${
                        i === col.items.length - 1 ? "border-b" : ""
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW WE SUPPORT — bg-white ═════════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>How we&rsquo;ll support you</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[16ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Prompts, not scripts.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            We&rsquo;ll send simple prompts and short idea videos along the
            way, especially before the cohort begins. They&rsquo;re there to
            help, not to box you in. You post in the format and cadence that
            fits your audience.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Idea videos and short prompt drops in the weeks before the cohort kicks off.",
              "Optional one or two test clips so you feel confident before anything goes live.",
              "A direct line to our team for questions, talking points, or quick reviews.",
              "A shareable cohort page so your audience can join your kid's squad in one click.",
            ].map((item) => (
              <div
                key={item}
                className="px-5 py-4 bg-grey border-l-4 border-red text-[15px] leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Filming tips */}
          <div className="mt-12">
            <span
              className="font-display uppercase block text-red"
              style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                letterSpacing: "0.02em",
              }}
            >
              Filming tips
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Film vertical",
                "Centered faces & action",
                "Lead with the real moment",
                "Let your kid talk",
                "Use captions if your audience expects them",
                "Short is fine",
                "Real over polished",
                "Post like yourself",
              ].map((tip) => (
                <span
                  key={tip}
                  className="inline-flex items-center px-3.5 py-2.5 bg-grey border border-black/10 text-[13px] font-medium"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ APPLICATION FORM — bg-grey ════════════════════════════════════ */}
      <section
        id="apply"
        className="bg-grey text-black relative overflow-visible"
        style={sectionPad}
      >
        <TornPaperDivider color="grey" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>Apply to partner</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[18ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Tell us a little about your family.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            We read every application. We&rsquo;ll get back to you within a
            week with a yes, a not-yet, or a question. Takes about 4 minutes.
          </p>

          <div className="mt-10">
            <CreatorApplicationForm />
          </div>
        </div>
      </section>

      {/* ══ CLOSING — bg-black ════════════════════════════════════════════ */}
      <section
        className="bg-black text-white relative overflow-visible"
        style={{
          paddingTop: "clamp(80px, 14vw, 160px)",
          paddingBottom: "clamp(80px, 14vw, 200px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <TornPaperDivider color="black" variant="top" style={1} />

        <div style={containerStyle}>
          <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-red">
            The heart of it
          </span>
          <h2
            className="font-display uppercase mt-4 max-w-[14ch]"
            style={{
              fontSize: "clamp(40px, 10vw, 96px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Gaming matters. You tell the story honestly.
          </h2>
          <p
            className="font-body mt-5 max-w-[50ch] opacity-85"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.5 }}
          >
            We&rsquo;ll make sure the experience is worth telling.
          </p>
          <div className="mt-8">
            <Button variant="red-filled" href="#apply">
              Apply to partner
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
