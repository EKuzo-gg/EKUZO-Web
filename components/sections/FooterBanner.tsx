"use client";

import Button from "@/components/ui/Button";
import { useModal } from "@/context/ModalContext";

type FooterBannerProps = {
  heading: string;
};

export default function FooterBanner({ heading }: FooterBannerProps) {
  const { openModal } = useModal();
  return (
    <section
      className="relative bg-red overflow-visible pt-[80px] pb-[144px] flex flex-col md:flex-row items-center justify-between gap-8"
      style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
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

      <h2 className="relative z-10 font-body font-bold text-white leading-tight max-w-[720px]"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
        {heading}
      </h2>
      <div className="relative z-10 shrink-0">
        <Button variant="white-outlined" onClick={() => openModal("contact")}>
          Start a conversation
        </Button>
      </div>
    </section>
  );
}
