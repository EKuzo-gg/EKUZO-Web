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
        paddingTop: "120px",
        paddingBottom: "144px",
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

      <div className="relative z-10 max-w-[1232px] mx-auto flex flex-col md:flex-row items-center md:items-center gap-[72px]">
        {/* Left: heading + CTA */}
        <div className="flex flex-col items-start gap-[72px] flex-1">
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

        {/* Right: decorative brush stroke image */}
        <div className="flex-1 hidden md:block">
          <Image
            src="/images/enroll-promo-graphic.avif"
            alt=""
            width={824}
            height={921}
            className="w-full h-auto object-contain"
            style={{ maxHeight: "614px" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
