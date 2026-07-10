import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { partnerList } from "@/lib/partners";

export const metadata: Metadata = {
  alternates: { canonical: "/partners" },
  title: "Partners — EKUZO",
  description:
    "EKUZO partners with youth organizations to bring structured, coach-led esports to the members they serve. See who we work with and how a partnership works.",
  openGraph: {
    title: "EKUZO Partners | Youth Esports Partnerships",
    description:
      "EKUZO partners with youth organizations to bring structured, coach-led esports to their members.",
    url: "https://ekuzo.gg/partners",
    type: "website",
    images: [
      {
        url: "https://ekuzo.gg/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "EKUZO Partners",
      },
    ],
  },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Partners", path: "/partners" },
]);

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      {/* ══ HERO — white bg ═══════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(160px, 18vw, 240px)",
            paddingBottom: "clamp(100px, 16vw, 200px)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 z-20">
            <Nav variant="light-red" />
          </div>

          <div
            className="max-w-[1232px] mx-auto relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <div className="mb-6">
              <Eyebrow>PARTNERS</Eyebrow>
            </div>
            <h1
              className="font-display uppercase text-black leading-[0.85]"
              style={{ fontSize: "clamp(72px, 14vw, 200px)" }}
            >
              Partners in youth
              <br />
              development
            </h1>
            <p
              className="font-body text-black/70 leading-[1.35] mt-8 max-w-[680px]"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              EKUZO teams up with youth organizations to turn the games kids
              already love into structured growth — coaching, teamwork, and
              confidence, run by our coaches and built around your outcomes.
            </p>
          </div>
        </section>
        <TornPaperDivider color="white" variant="bottom" style={1} />
      </div>

      {/* ══ PARTNER CARDS — grey bg ═══════════════════════════════════════ */}
      <section
        className="bg-[#f0edea] relative"
        style={{
          paddingTop: "clamp(80px, 14vw, 144px)",
          paddingBottom: "clamp(80px, 14vw, 160px)",
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
        }}
      >
        <div className="max-w-[1232px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerList.map((partner) => (
              <Link
                key={partner.slug}
                href={`/partners/${partner.slug}`}
                className="group bg-white block hover:brightness-[0.99] active:scale-[0.995] transition-all duration-150"
                style={{ borderRadius: "2px", padding: "clamp(1.75rem, 4vw, 48px)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="font-display uppercase text-red leading-none"
                    style={{ fontSize: "clamp(24px, 3vw, 32px)" }}
                  >
                    EKUZO
                  </span>
                  <span className="font-body text-black/30" aria-hidden="true">
                    &times;
                  </span>
                  {/* PLACEHOLDER logo — styled text block */}
                  <span
                    className="inline-block font-body font-bold uppercase text-black border-2 border-black/15 rounded-sm tracking-[0.08em] px-3 py-1.5"
                    style={{ fontSize: "clamp(12px, 1.4vw, 16px)" }}
                  >
                    {partner.logoText}
                  </span>
                </div>
                <h2
                  className="font-body font-bold text-black leading-[1.1] mb-3"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 40px)", letterSpacing: "-0.5px" }}
                >
                  {partner.name}
                </h2>
                <p
                  className="font-body text-black/70 leading-[1.4] mb-6"
                  style={{ fontSize: "clamp(1rem, 1.7vw, 22px)" }}
                >
                  {partner.metaDescription}
                </p>
                <span
                  className="font-body font-bold text-red group-hover:underline"
                  style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
                >
                  See the partnership &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER BANNER + FOOTER ════════════════════════════════════════ */}
      <FooterBanner
        heading="Bring EKUZO to the kids you serve"
        ctaLabel="Start the conversation"
        ctaModal="contact"
      />
      <Footer />
    </>
  );
}
