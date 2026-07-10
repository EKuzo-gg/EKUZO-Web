import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import FAQAccordion from "@/components/ui/FAQAccordion";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
import CircleIcon from "@/components/ui/CircleIcon";
import type { Partner } from "@/lib/partners";

/**
 * PartnerLanding — data-driven partner landing page template.
 *
 * Renders a `Partner` object (from lib/partners.ts) into a full
 * EKUZO-styled page. This is the reusable layer: to launch a new
 * partner, add data — don't edit this file.
 *
 * Reuses the site's section rhythm and torn-paper transitions
 * (see the /schools page for the reference pattern).
 */
export default function PartnerLanding({ partner }: { partner: Partner }) {
  const p = partner;

  return (
    <>
      {/* ══ 1. HERO — dark photographic bg ══════════════════════════════════ */}
      <div className="relative overflow-visible">
        <section
          className="relative overflow-clip bg-[#0a2540]"
          style={{
            paddingTop: "clamp(150px, 17vw, 230px)",
            paddingBottom: "clamp(100px, 12vw, 170px)",
          }}
        >
          {/* Full-bleed background photo — biased right so the subjects stay in frame */}
          <Image
            src={p.heroBg}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="object-cover object-[80%_center] z-0"
          />
          {/* Readability veil — dark under the text (left), clears over the photo (right) */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,24,45,0.82) 0%, rgba(6,24,45,0.45) 40%, rgba(6,24,45,0) 78%)",
            }}
          />

          {/* Decorative paint stains */}
          <Image
            src={p.heroStainLeft}
            alt=""
            width={393}
            height={399}
            aria-hidden="true"
            className="absolute z-10 pointer-events-none select-none left-[-2%] top-[24%] w-[22vw] max-w-[393px] h-auto hidden sm:block"
          />
          <Image
            src={p.heroStainRight}
            alt=""
            width={411}
            height={604}
            aria-hidden="true"
            className="absolute z-10 pointer-events-none select-none right-[-1%] top-[8%] w-[22vw] max-w-[411px] h-auto hidden sm:block"
          />

          <div className="absolute top-0 left-0 right-0 z-30">
            <Nav variant="dark" />
          </div>

          <div
            className="max-w-[1232px] mx-auto relative z-20"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Co-brand line: EKUZO × Partner (logo placeholder) */}
            <div className="flex flex-wrap items-center gap-4 mb-8 justify-center md:justify-start">
              <span
                className="font-display uppercase text-white leading-none"
                style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
              >
                EKUZO
              </span>
              <span
                className="font-body text-white/50"
                style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                aria-hidden="true"
              >
                &times;
              </span>
              {/* PLACEHOLDER logo: styled text block until a real asset lands */}
              <span
                className="inline-block font-body font-bold uppercase text-white border-2 border-white/40 rounded-sm tracking-[0.08em] px-4 py-2"
                style={{ fontSize: "clamp(14px, 1.6vw, 20px)" }}
              >
                {p.logoText}
              </span>
            </div>

            <div className="mb-6 flex justify-center md:justify-start">
              <Eyebrow>{p.heroEyebrow}</Eyebrow>
            </div>

            <h1
              className="font-display uppercase text-white leading-[0.85] text-center md:text-left"
              style={{ fontSize: "clamp(72px, 13vw, 200px)" }}
            >
              {p.heroHeadline}
            </h1>

            <p
              className="font-body text-white/80 leading-[1.35] mt-8 max-w-[640px] mx-auto md:mx-0 text-center md:text-left"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              {p.heroSubhead}
            </p>
          </div>
        </section>
      </div>

      {/* ══ 2. PARTNERSHIP INTRO — grey bg, image + copy ════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 160px)",
            paddingBottom: "clamp(80px, 14vw, 160px)",
          }}
        >
        <div
          className="max-w-[1232px] mx-auto relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="flex-1 order-2 lg:order-1">
            <div className="mb-4">
              <Eyebrow>{p.introEyebrow}</Eyebrow>
            </div>
            <h2
              className="font-body font-bold text-black leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 56px)", letterSpacing: "-1.28px" }}
            >
              {p.introHeading}
            </h2>
            {p.introBody.map((para, i) => (
              <p
                key={i}
                className="font-body text-black/70 leading-[1.4] mb-4"
                style={{ fontSize: "clamp(1.0625rem, 1.8vw, 24px)" }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* PLACEHOLDER photo — enlarged; placeholder PNG has transparent margins */}
          <div className="order-1 lg:order-2 w-full flex-1 lg:flex-[1.4]">
            <div className="relative w-full" style={{ borderRadius: "2px" }}>
              <Image
                src={p.introImage}
                alt=""
                width={720}
                height={540}
                aria-hidden="true"
                className="w-full h-auto object-cover origin-center lg:scale-[1.3]"
              />
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* ══ 3. VALUE PROPS — grey bg, zigzag cards ══════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(120px, 18vw, 240px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: "url(/images/card-background@2x.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div
            className="max-w-[1232px] mx-auto relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <div
              className="bg-white mb-8"
              style={{ borderRadius: "2px", padding: "clamp(2rem, 5vw, 64px)" }}
            >
              <div className="mb-4">
                <Eyebrow>WHY PARTNER</Eyebrow>
              </div>
              <h3
                className="font-body font-bold text-black leading-[1] mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
              >
                {p.valueHeading}
              </h3>
              <p
                className="font-body text-black/70 leading-[1.357]"
                style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
              >
                {p.valueIntro}
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {p.valueCards.map((card, i) => (
                <div
                  key={card.title}
                  className={`flex ${i % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}
                >
                  <div
                    className="bg-white w-full lg:w-[560px]"
                    style={{ borderRadius: "2px", padding: "clamp(1.5rem, 4vw, 48px)" }}
                  >
                    <CircleIcon src={card.icon} className="mb-5" />
                    <h4
                      className="font-body font-bold text-black leading-[1.2] mb-4"
                      style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
                    >
                      {card.title}
                    </h4>
                    <p
                      className="font-body text-black/70 leading-[1.417]"
                      style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                    >
                      {card.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ 4. HOW IT WORKS — white bg, step cards ══════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={1} />
      </div>
      <section
        className="bg-white relative"
        style={{
          paddingTop: "clamp(80px, 14vw, 160px)",
          paddingBottom: "clamp(80px, 14vw, 160px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          <div className="flex flex-col gap-4 mb-12 items-center text-center">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h3
              className="font-body font-bold leading-[1] text-black"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              {p.howHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {p.howSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-[#f0edea]"
                style={{ borderRadius: "2px", padding: "clamp(1.5rem, 3vw, 40px)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-display text-red leading-none"
                    style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
                  >
                    {i + 1}
                  </span>
                  <CircleIcon src={step.icon} />
                </div>
                <h4
                  className="font-body font-bold text-black leading-[1.2] mb-3"
                  style={{ fontSize: "clamp(1.375rem, 2.4vw, 32px)" }}
                >
                  {step.title}
                </h4>
                <p
                  className="font-body text-black/70 leading-[1.417]"
                  style={{ fontSize: "clamp(1rem, 1.6vw, 22px)" }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. OUTCOMES — black bg, stat callouts ═══════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 14vw, 188px)",
            paddingBottom: "clamp(80px, 14vw, 188px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <div className="flex flex-col gap-4 mb-12 items-center text-center">
              <Eyebrow>OUTCOMES</Eyebrow>
              <h3
                className="font-body font-bold leading-[1] text-white"
                style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
              >
                {p.outcomesHeading}
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {p.outcomes.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white text-center"
                  style={{ borderRadius: "2px", padding: "clamp(1.5rem, 3vw, 40px)" }}
                >
                  <div
                    className="font-display text-red leading-none mb-3"
                    style={{ fontSize: "clamp(48px, 7vw, 88px)" }}
                  >
                    {stat.value}
                  </div>
                  <p
                    className="font-body font-bold text-black/70 leading-[1.3]"
                    style={{ fontSize: "clamp(0.9375rem, 1.4vw, 18px)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {p.outcomesNote && (
              <p
                className="font-body text-white/40 text-center mt-8"
                style={{ fontSize: "clamp(0.8125rem, 1.2vw, 15px)" }}
              >
                {p.outcomesNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ══ 6. QUOTE — red bg ═══════════════════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="red" variant="top" style={1} />
        <div
          className="bg-red"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
          }}
        >
          <div
            className="max-w-[880px] mx-auto text-center relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <Image
              src="/images/quote-white@2x.png"
              alt=""
              width={40}
              height={40}
              className="mx-auto mb-8"
              aria-hidden="true"
            />
            <blockquote
              className="font-body font-bold text-white leading-[1.2] mb-10"
              style={{ fontSize: "clamp(1.25rem, 2.8vw, 40px)" }}
            >
              &ldquo;{p.quote.text}&rdquo;
            </blockquote>
            <p
              className="font-body font-bold text-white"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              {p.quote.name}
            </p>
            <p
              className="font-body font-bold text-white/60"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              {p.quote.role}
            </p>
          </div>
        </div>
      </section>

      {/* ══ 7. FAQ — black bg ═══════════════════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 14vw, 188px)",
            paddingBottom: "clamp(80px, 14vw, 188px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[120px]">
            <div className="lg:max-w-[388px] lg:w-[388px] shrink-0">
              <div className="mb-4">
                <Eyebrow>FAQ</Eyebrow>
              </div>
              <h3
                className="font-body font-bold text-white leading-[1]"
                style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
              >
                Frequently asked questions
              </h3>
            </div>
            <div className="flex-1">
              <FAQAccordion items={p.faqs} theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 8. FOOTER BANNER + FOOTER ═══════════════════════════════════════ */}
      <FooterBanner
        heading={p.ctaHeading}
        image={p.footerImage}
        ctaLabel={p.ctaLabel}
        ctaModal="contact"
      />
      <Footer />
    </>
  );
}
