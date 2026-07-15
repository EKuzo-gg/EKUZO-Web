"use client";

import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";

// Shared register-page hero. Lifted from the camps + e100 pages, where
// the structure (radial-gradient background + tight H1 with two color
// stops + 1-line subhead + bottom torn-paper white-top) was identical.
// Each product passes its own gradient `background` string + Eyebrow
// text + headline halves + subhead copy.

export default function RegisterHero({
  background,
  eyebrow,
  title1,
  title2,
  title2Color = "#E0FF4F",
  subhead,
}: {
  // The same `background:` CSS expression each page already builds:
  // two radial-gradients layered over a flat fallback color.
  background: string;
  // Optional small eyebrow tag above the H1. Pass undefined to omit.
  eyebrow?: string;
  // H1 splits into two parts (left half white, right half accent color).
  // The split was hard-coded in the originals as "Esports / Camp"
  // (camps) and "Online / Esports / Coaching" (e100); each product
  // owns its own copy.
  title1: string;
  title2: string;
  title2Color?: string;
  // Subhead under the H1. Usually a 1-line string; accepts a node for
  // multi-line copy (e.g. ekuzo101's joke line + program line).
  subhead: React.ReactNode;
}) {
  return (
    <section className="relative" style={{ overflow: "clip", background }}>
      <div
        className="max-w-[1232px] mx-auto px-6 sm:px-10"
        style={{
          paddingTop: "48px",
          paddingBottom: "clamp(60px, 9vw, 130px)",
        }}
      >
        <div className="flex flex-col gap-3" style={{ maxWidth: "720px" }}>
          {eyebrow && <Eyebrow variant="light">{eyebrow}</Eyebrow>}

          <h1
            className="font-display uppercase"
            style={{ fontSize: "clamp(3.5rem, 6.5vw, 6.5rem)", lineHeight: "0.85" }}
          >
            <span style={{ color: "#ffffff" }}>{title1}</span>
            <span style={{ color: title2Color }}>{title2}</span>
          </h1>

          <p
            className="font-body text-white leading-relaxed mt-2"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.125rem)",
              maxWidth: "640px",
            }}
          >
            {subhead}
          </p>
        </div>
      </div>

      {/* White torn paper sits flush with the section bottom (no translate),
          tear edge at the top of the image. -bottom-px absorbs a subpixel
          seam that otherwise showed as a hairline above the form. */}
      <div className="absolute -bottom-px left-0 right-0 z-20 pointer-events-none">
        <Image
          src="/images/new%20torn%20paper/torn-paper-white-top-2@2x.png"
          alt=""
          width={4320}
          height={600}
          className="w-full h-auto block"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
