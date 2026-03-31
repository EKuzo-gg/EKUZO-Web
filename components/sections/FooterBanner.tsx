"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { useModal } from "@/context/ModalContext";

type FooterBannerProps = {
  heading: string;
};

export default function FooterBanner({ heading }: FooterBannerProps) {
  const { openModal } = useModal();
  return (
    <section
      className="relative bg-red overflow-visible"
      style={{
        paddingTop: "clamp(48px, 6vw, 80px)",
        paddingBottom: "clamp(48px, 6vw, 80px)",
        paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
        paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
      }}
    >
      {/* Torn paper: testimonials (white) → footer banner (red) — red paper-top-2 at top */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/paper-red-top-2.svg"
        alt=""
        className="absolute top-0 left-0 w-full z-20 pointer-events-none select-none"
        style={{ transform: "translateY(calc(-100% + 2px))" }}
        aria-hidden="true"
      />

      {/* Torn paper: footer banner (red) → footer — red paper at bottom, overlapping footer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/paper-red-bottom-1.svg"
        alt=""
        className="absolute bottom-0 left-0 w-full z-20 pointer-events-none select-none"
        style={{ transform: "translateY(55%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12" style={{ maxWidth: "calc(100% - 80px)" }}>
        {/* Left on desktop / centered on mobile: heading + CTA */}
        <div className="flex flex-col items-center md:items-start gap-8 md:gap-12 flex-1 text-center md:text-left shrink-0">
          <h2
            className="font-body font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {heading}
          </h2>
          <Button variant="white-outlined" onClick={() => openModal("contact")}>
            Start a conversation
          </Button>
        </div>

        {/* Right: decorative image — visible on all screens, larger with 40px edge breathing room */}
        <div className="flex-1 flex justify-center">
          <Image
            src="/images/enroll-promo-graphic.avif"
            alt=""
            width={824}
            height={921}
            className="w-full h-auto object-contain"
            style={{ maxHeight: "clamp(280px, 50vw, 700px)" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
