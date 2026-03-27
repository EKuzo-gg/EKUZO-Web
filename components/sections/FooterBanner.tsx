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
      className="relative bg-red overflow-hidden pt-[120px] pb-[144px] flex flex-col md:flex-row items-center justify-between gap-8"
      style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}
    >
      {/* Decorative brush stroke at top */}
      <div className="absolute top-[-92px] left-0 w-full h-[300px] pointer-events-none z-[1]" aria-hidden="true">
        <Image
          src="/images/footer-banner-deco.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
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
