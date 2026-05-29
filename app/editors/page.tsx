import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import EditorApplicationForm from "@/components/sections/EditorApplicationForm";

/**
 * /editors — Editor Partnership landing page
 *
 * Audience: freelance / contract video editors (short-form social,
 * long-form YouTube, promo, camp recap).
 * Goal: apply to edit for EKUZO using our brand standards and templates.
 *
 * Defaults set conservatively to match /creators:
 *   - noindex (surfaced via direct outreach, not search)
 *   - NOT linked from main nav
 * Flip both when ready to open the funnel up.
 */

export const metadata: Metadata = {
  title: "Editor Partnership — Apply",
  description:
    "We have the footage — hundreds of hours of coaching, gameplay, camps, and parent testimonials. We need editors who can turn it into clips that look and feel on-brand. Apply to edit for EKUZO.",
  alternates: { canonical: "/editors" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "EKUZO Editor Partnership",
    description:
      "We've got the footage. You make it move. A partnership for editors who want to build a youth esports brand parents actually trust.",
    url: "https://ekuzo.gg/editors",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO Editor Partnership",
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

export default function EditorsPage() {
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
          <Eyebrow variant="light">Editor Partnership · 2026</Eyebrow>

          <h1
            className="font-display uppercase text-white mt-5"
            style={{
              fontSize: "clamp(56px, 14vw, 156px)",
              lineHeight: 0.88,
              letterSpacing: "0.02em",
            }}
          >
            We&rsquo;ve got
            <br />
            the footage.
            <br />
            You make
            <br />
            it move.
          </h1>

          <p
            className="font-body mt-6 max-w-[40ch] opacity-95"
            style={{
              fontSize: "clamp(16px, 4.4vw, 22px)",
              lineHeight: 1.45,
            }}
          >
            EKUZO generates hundreds of hours of coaching, gameplay, camp,
            and parent footage every season. We need editors who can turn
            it into clips that look and feel like EKUZO — and ship them
            without us holding the mouse.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="white-filled" href="#apply">
              Apply to edit
            </Button>
            <Button variant="white-outlined" href="#why">
              Read the brief
            </Button>
          </div>

          {/* Hero meta strip */}
          <div className="mt-10 pt-7 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "200+", label: "Hours of source footage" },
              { num: "4", label: "Channels we feed weekly" },
              { num: "Open", label: "Toolkit & creative direction" },
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
          <Eyebrow>Why we&rsquo;re hiring editors</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[18ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            We&rsquo;re building the brand parents trust.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            EKUZO is youth esports done right — real coaches, real teams,
            structured practice, and a system parents can trust. The
            content engine matters as much as the program. Every clip
            should make a parent stop scrolling and think{" "}
            <em>&ldquo;wait, my kid could do this&rdquo;</em>. That&rsquo;s
            the bar. We&rsquo;ll give you the footage, the brand kit, the
            templates, and the prompts — your job is to land the edit.
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
            The best edits
            <br />
            don&rsquo;t just clip the moment.
            <br />
            <span className="text-red">They make it land.</span>
          </div>
        </div>
      </section>

      {/* ══ THE WORK — bg-white ═══════════════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>What you&rsquo;ll edit</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[20ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Four kinds of work. One brand.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                tag: "Short-form social",
                title: "VOD Review Clips.",
                desc: "30–60s vertical clips from Coach Karlin&rsquo;s gameplay reviews. Split-screen layout (gameplay top, coach cam bottom), word-by-word captions, hook in the first 3 seconds. Opus Clip is in the workflow.",
              },
              {
                tag: "Event recap",
                title: "Camp Recap Reels.",
                desc: "End-of-camp highlight reels for parent and prospect audiences. Real kid moments, coach voiceover, EKUZO energy. 60–90s.",
              },
              {
                tag: "Long-form social proof",
                title: "Testimonial Edits.",
                desc: "Parent and student interviews trimmed into short stories — the before, the during, the after. 60s vertical + 2-3 min YouTube cuts from the same source.",
              },
              {
                tag: "Promo",
                title: "Sizzles &amp; Ad Cuts.",
                desc: "Hero videos for the website, paid social creatives, seasonal launch promos. Highest brand-fidelity bar — these run with money behind them.",
              },
            ].map((work) => (
              <div
                key={work.title}
                className="bg-white border border-black/10 p-7 flex flex-col gap-3"
              >
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-red">
                  {work.tag}
                </span>
                <h3
                  className="font-display uppercase"
                  style={{
                    fontSize: "clamp(28px, 6vw, 40px)",
                    lineHeight: 0.95,
                    letterSpacing: "0.02em",
                  }}
                  dangerouslySetInnerHTML={{ __html: work.title }}
                />
                <p
                  className="font-body text-[15px] leading-relaxed text-black/75"
                  dangerouslySetInnerHTML={{ __html: work.desc }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRAND STANDARDS — bg-red ══════════════════════════════════════ */}
      <section
        className="bg-red text-white relative overflow-visible"
        style={sectionPad}
      >
        <TornPaperDivider color="red" variant="top" style={2} />

        <div style={containerStyle}>
          <Eyebrow variant="light">Brand standards</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[18ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            What &ldquo;on-brand&rdquo; actually means.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] opacity-95"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            These are the rails. Hit them and your edits will look like
            EKUZO. Break them and we&rsquo;ll send notes — and lose
            audience trust we worked hard to build.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Color",
                rule: "EKUZO red, black, off-white (#f0edea), white. No other colors as fills. Source footage colors are fine — overlays and graphics must come from this palette.",
              },
              {
                label: "Type",
                rule: "Tungsten Narrow for display / uppercase headlines. Inter for captions and body. No other fonts. We&rsquo;ll send the files.",
              },
              {
                label: "Captions",
                rule: "Word-by-word highlight. Bold sans, white text with 1–2px black outline. Active word highlights in EKUZO red. Bottom-center, overlaying lower third — never the face.",
              },
              {
                label: "Motion",
                rule: "Sharp cuts beat fancy transitions. Punch in / punch out for emphasis. No zoom whooshes, no glitch effects, no AI &lsquo;cinematic&rsquo; filters.",
              },
              {
                label: "Music",
                rule: "We don&rsquo;t have a locked library yet. No popular tracks (sync rights), no AI-generated music, no generic stock cues. Use cleared sources you trust — ask before exporting if you&rsquo;re unsure.",
              },
              {
                label: "Treatments",
                rule: "Torn paper dividers and brush stroke accents live on the website. We&rsquo;re still figuring out how they translate to video — feel free to experiment and we&rsquo;ll iterate together.",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="bg-white text-black p-6 flex flex-col gap-2"
              >
                <span
                  className="font-display uppercase text-red"
                  style={{
                    fontSize: "clamp(20px, 5vw, 28px)",
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}
                >
                  {row.label}
                </span>
                <p
                  className="font-body text-[15px] leading-relaxed text-black/75"
                  dangerouslySetInnerHTML={{ __html: row.rule }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT WE'LL SHARE — bg-white ═══════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={2} />

        <div style={containerStyle}>
          <Eyebrow>What we&rsquo;ll share</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[20ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Examples, not templates.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            We&rsquo;re still defining the EKUZO content brand as we grow.
            Instead of locked templates, we&rsquo;ll share what&rsquo;s been
            working, give you the rails, and trust your eye. Your vibe is
            part of the asset.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Brand reference one-pager — colors, type, voice, the non-negotiables",
              "Reference clips — CapCut &amp; Opus Clip cuts that landed for us, with notes on why",
              "Source footage access — raw VOD reviews, gameplay, testimonials, and camp footage via Drive",
              "Direct line to the team — text or email Karlin or Aaron mid-edit; we respond fast",
              "Music starting points — libraries we&rsquo;ve had luck with, plus anything we&rsquo;ve cleared",
              "Creative freedom — bring your own toolkit, transitions, pacing, and vibe",
            ].map((item) => (
              <div
                key={item}
                className="px-5 py-4 bg-grey border-l-4 border-red text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </div>
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
                  "Lead with the real moment, not the brand mark.",
                  "Let kids and coaches speak — captions support, never replace.",
                  "Cut on action and on meaning, not on every beat.",
                  "Keep the brand palette tight; let footage be the color.",
                  "Use the templates exactly as shipped, or ask before deviating.",
                  "Deliver vertical 9:16 first, then square / horizontal cuts.",
                ],
              },
              {
                title: "Out of bounds",
                marker: "✕",
                items: [
                  "No stock footage of generic kids or generic gameplay.",
                  "No music we don&rsquo;t own or haven&rsquo;t cleared.",
                  "No AI voiceovers cloning a coach or parent.",
                  "No watermarks from CapCut, Opus, or other tools.",
                  "No distorted logos, off-color brand reds, or invented type.",
                  "No showing faces of kids who didn&rsquo;t sign the release.",
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
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WORKFLOW — bg-white ═══════════════════════════════════════════ */}
      <section className="bg-white text-black relative overflow-visible" style={sectionPad}>
        <TornPaperDivider color="white" variant="top" style={1} />

        <div style={containerStyle}>
          <Eyebrow>How we work together</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[18ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Clear brief in. Clean cut out.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            We try not to waste your time. Every job comes with a written
            brief, source files, the relevant template, and a turnaround
            window. You respond with one rough cut, we respond with notes
            in one batch, you deliver a final. Most jobs are one revision.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                stage: "Brief",
                title: "You get the ask.",
                items: [
                  "Project type and length",
                  "Source files (Drive / Frame.io)",
                  "Hook direction and key moments",
                  "Deliverable specs and turnaround",
                ],
              },
              {
                num: "02",
                stage: "Cut",
                title: "You make the edit.",
                items: [
                  "Match the brand direction; bring your own vision",
                  "One rough cut delivered by the agreed date",
                  "Captions baked, branding placed, music cleared",
                  "Drop the cut wherever we agreed — Frame.io or Drive",
                ],
              },
              {
                num: "03",
                stage: "Ship",
                title: "We close the loop.",
                items: [
                  "One batched round of notes within 48 hours",
                  "You deliver final masters in our spec",
                  "Invoice net-15 from delivery",
                  "Strong work earns the next brief faster",
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

          {/* Tools chips */}
          <div className="mt-12">
            <span
              className="font-display uppercase block text-red"
              style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                letterSpacing: "0.02em",
              }}
            >
              Bring your own toolkit
            </span>
            <p className="mt-2 max-w-[60ch] font-body text-[15px] leading-relaxed text-black/65">
              No required stack. CapCut Pro and Opus Clip have been
              clicking for us lately, but if your edit lands the moment,
              we don&rsquo;t care what you cut it in.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "CapCut Pro",
                "Opus Clip",
                "Premiere Pro",
                "After Effects",
                "DaVinci Resolve",
                "Final Cut Pro",
                "Descript",
                "Frame.io",
                "Your call",
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
          <Eyebrow>Apply to edit</Eyebrow>
          <h2
            className="font-display uppercase mt-4 max-w-[20ch]"
            style={{
              fontSize: "clamp(40px, 9vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Send us a reel and a few words.
          </h2>
          <p
            className="font-body mt-6 max-w-[60ch] text-black/75"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.55 }}
          >
            We read every application. We&rsquo;ll respond within a week
            with a yes, a not-yet, or a test brief. Takes about 4 minutes.
          </p>

          <div className="mt-10">
            <EditorApplicationForm />
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
            className="font-display uppercase mt-4 max-w-[16ch]"
            style={{
              fontSize: "clamp(40px, 10vw, 96px)",
              lineHeight: 0.9,
              letterSpacing: "0.02em",
            }}
          >
            Gaming matters. Help us make it land.
          </h2>
          <p
            className="font-body mt-5 max-w-[52ch] opacity-85"
            style={{ fontSize: "clamp(16px, 4vw, 20px)", lineHeight: 1.5 }}
          >
            We&rsquo;re building a community around our kids — coaches who
            know their names, teammates who show up, parents who trust
            what gaming can be. Your edits help bring that to life.
          </p>
          <div className="mt-8">
            <Button variant="red-filled" href="#apply">
              Apply to edit
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
