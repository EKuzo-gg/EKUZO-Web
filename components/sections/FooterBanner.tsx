"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { useModal } from "@/context/ModalContext";

type FooterBannerProps = {
  heading: string;
  /** Optional override image for the right side */
  image?: string;
  /** Override CTA label (default: "Enroll my gamer") */
  ctaLabel?: string;
  /** Override CTA modal (default: "enroll") */
  ctaModal?: "enroll" | "contact";
};

export default function FooterBanner({
  heading,
  image,
  ctaLabel = "Enroll my gamer",
  ctaModal = "enroll",
}: FooterBannerProps) {
  const { openModal } = useModal();
  return (
    <section
      className="relative bg-red overflow-visible"
      style={{
        paddingTop: "clamp(48px, 6vw, 80px)",
        paddingBottom: "clamp(80px, 12vw, 160px)",
        paddingLeft: "clamp(0.75rem, 7.2vw, 104px)",
        paddingRight: "clamp(0.75rem, 7.2vw, 104px)",
      }}
    >
      {/* Red torn-paper cap at the top — uses a `red-top` asset so the SOLID
          bottom of the paper sits flush with the top of the red section (red
          on red = seamless), while the TORN top edge extends up into whatever
          section is above, creating a jagged red silhouette. Works over any
          preceding background color (white/black/grey) — no per-page prop. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/new%20torn%20paper/torn-paper-red-top-2@2x.png"
        alt=""
        className="absolute top-0 left-0 w-full z-20 pointer-events-none select-none"
        style={{ transform: "translateY(-100%)" }}
        aria-hidden="true"
      />

      {/* Content: heading + CTA on top, image below */}
      <div className="relative z-10 mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12">
        {/* Left on desktop / centered on mobile: heading + CTA */}
        <div className="flex flex-col items-center md:items-start gap-8 md:gap-12 flex-1 text-center md:text-left shrink-0">
          <h2
            className="font-body font-bold text-white"
            style={{ fontSize: "clamp(2rem, 4.5vw, 56px)", lineHeight: "1.1", maxWidth: "14em" }}
          >
            {heading}
          </h2>
          <Button variant="white-outlined" onClick={() => openModal(ctaModal)}>
            {ctaLabel}
          </Button>
        </div>

        {/* Image — 95vw on mobile, breaks out of container padding */}
        <div className="flex justify-center md:flex-1 w-[95vw] md:w-auto -mx-[calc((95vw-100%)/2)] md:mx-0">
          <Image
            src={image || "/images/enroll-promo-graphic.avif"}
            alt=""
            width={824}
            height={921}
            className="w-full md:w-auto h-auto object-contain"
            style={{ maxWidth: "clamp(390px, 40vw, 560px)", maxHeight: "clamp(320px, 55vw, 800px)" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
