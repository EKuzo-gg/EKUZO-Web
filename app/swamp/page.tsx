"use client";

// EKUZO x UF League — Summer Swamp Showdown 2026 community landing page.
// Built on the /woodward shell (orange gradient hero + Jinx art bleed +
// white torn paper). Audience is collegiate LoL players + alumni already on
// our page via the tournament link, so the pill is just the event name.
// Goal is community, not sale: "Follow our story" = newsletter (Beehiiv,
// tagged source-uf-swamp-2026) + Instagram + Discord. Closes with a
// "What is community night?" section that reuses the camps page's coach
// card to feature Sebastien "ZzLegendary" Demontigny.
// Newsletter submit → POST /api/swamp/subscribe.

import { useState } from "react";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import InputField from "@/components/register/InputField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISCORD_INVITE = "https://discord.gg/TwcHQzAFs";

const CARD_CLIP =
  "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)";

// Reused verbatim from app/programs/ekuzo-camps/page.tsx coachCards.
const SEBASTIEN = {
  name: 'SEBASTIEN "ZZ" DEMONTIGNY',
  role: "EKUZO Experiential Director",
  image: "/images/coach-sebastien-ZzLegendary.webp",
  objectPosition: "center top",
  wiki: "https://lol.fandom.com/wiki/Zz_(Sebastien_Demontigny)",
  creds: [
    "Evil Geniuses — first-ever LCS Championship (Spring 2022)",
    "MSI 2022 semifinals · Worlds 2022",
    "Head coach for Dignitas Challengers & Supernova (NACL)",
  ],
};

export default function SwampSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/swamp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero + "Follow our story" share one overflow-clip wrapper so the
          Jinx art can bleed from the hero down across the torn-paper edge. */}
      <div className="relative overflow-clip">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          className="relative"
          style={{
            overflow: "clip",
            background:
              "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255, 220, 120, 0.80), transparent 60%), radial-gradient(ellipse 80% 70% at 100% 100%, rgba(180, 50, 0, 0.85), transparent 60%), #FF6B1A",
          }}
        >
          <div
            className="relative z-10 max-w-[1232px] mx-auto px-6 sm:px-10"
            style={{ paddingTop: "32px", paddingBottom: "clamp(60px, 9vw, 130px)" }}
          >
            {/* EKUZO logo on a white chip (left) + way back to site (right). */}
            <div className="flex items-center justify-between gap-4 mb-12">
              <Image
                src="/images/ekuzo-logo.svg"
                alt="EKUZO"
                width={140}
                height={42}
                priority
                className="h-auto w-[clamp(110px,12vw,150px)]"
              />
              <Button variant="white-outlined" href="/" className="!py-2.5 !px-5 text-sm">
                Visit site
              </Button>
            </div>

            <div className="flex flex-col gap-4" style={{ maxWidth: "720px" }}>
              <Eyebrow variant="light">Summer Swamp Showdown 2026</Eyebrow>

              <h1
                className="font-display uppercase"
                style={{ fontSize: "clamp(2.75rem, 5.5vw, 5rem)", lineHeight: "0.85" }}
              >
                <span className="text-white">Every gamer deserves </span>
                <span style={{ color: "#E0FF4F" }}>a team.</span>
              </h1>

              <p
                className="font-body text-white leading-relaxed mt-1"
                style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", maxWidth: "560px" }}
              >
                EKUZO is every gamer&apos;s dream starting point: team, competition,
                and growth. Born out of our own collegiate LoL experience, we&apos;re
                creating the structure to show what competitive gaming can be for kids
                ages 10-17.
              </p>
            </div>
          </div>

          {/* White torn paper flush with the section bottom (same asset +
              markup as /woodward). */}
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

        {/* ── Follow our story ───────────────────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-20 md:pb-28">
            <div className="max-w-[680px]">
              <h2
                className="font-display uppercase text-black leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                Follow our story
              </h2>
              <p
                className="font-body text-[#4b5563] mt-5"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "28px" }}
              >
                Two easy ways to stay in it.
              </p>

              {/* 1 — Gaming Matters newsletter */}
              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
                  <p className="font-body font-bold text-[#0a0a0a]" style={{ fontSize: "15px" }}>
                    Join the Gaming Matters newsletter
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <InputField
                      label="Name *"
                      required
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="Your name"
                    />
                    <InputField
                      label="Email *"
                      required
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@example.com"
                    />
                  </div>
                  {error && (
                    <p className="font-body text-red text-sm" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                    style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
                  >
                    {isSubmitting ? "Signing up..." : "Sign me up"}
                  </button>
                </form>
              ) : (
                <div className="mt-8 rounded border border-[#e5e7eb] bg-[#f9fafb] p-6">
                  <p className="font-body font-bold text-[#0a0a0a]" style={{ fontSize: "18px" }}>
                    You&apos;re on the list{firstName.trim() ? `, ${firstName.trim()}` : ""}.
                  </p>
                  <p className="font-body text-[#4b5563] mt-1" style={{ fontSize: "15px" }}>
                    Now jump into the Discord below to meet the community.
                  </p>
                </div>
              )}

              {/* 2 — Discord */}
              <div className="mt-5 flex flex-col gap-4">
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full font-body font-bold text-white rounded cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all duration-150"
                  style={{ background: "#5865F2", fontSize: "18px", lineHeight: "28px", padding: "20px" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
                  </svg>
                  Join our community nights on Discord
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Jinx hero art — bleeds from the hero across the torn edge into the
            "Follow our story" section (woodward treatment). Decorative;
            hidden on small screens. */}
        <div
          className="hidden lg:block absolute z-30 pointer-events-none select-none"
          style={{
            top: "clamp(16px, 2.5vw, 64px)",
            right: "clamp(-40px, -1vw, 0px)",
            width: "clamp(460px, 47vw, 900px)",
          }}
          aria-hidden="true"
        >
          <Image
            src="/images/jinx@2x.png"
            alt=""
            width={868}
            height={928}
            priority
            unoptimized
            className="w-full h-auto block"
          />
        </div>
      </div>

      {/* ── What is community night? — reuses the camps coach card ────── */}
      <section className="bg-[#f0edea] relative overflow-clip">
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{ paddingTop: "clamp(60px, 9vw, 110px)", paddingBottom: "clamp(60px, 9vw, 110px)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
            {/* left: explainer */}
            <div>
              <Eyebrow>Community Night</Eyebrow>
              <h2
                className="font-display uppercase text-black leading-[0.85] mt-4"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                What is<br />community night?
              </h2>
              <p className="font-body text-black/80 leading-relaxed mt-5" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                Every other week, EKUZO runs streamed game nights. On pro nights, our
                coaches go head-to-head in real, casted matches. Community nights are
                open for anyone to jump in.
              </p>
              <p className="font-body text-black/80 leading-relaxed mt-4" style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)" }}>
                And the talent is the real deal: our nights are led by our experiential
                director, Sebastien &ldquo;Zz&rdquo; Demontigny.
              </p>
              <p className="font-body font-bold text-black leading-snug mt-5" style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)" }}>
                Join the Discord and come hang on the next one.
              </p>
            </div>

            {/* right: Sebastien coach card (markup reused from camps page) */}
            <div className="w-full max-w-[380px] mx-auto lg:mx-0 lg:justify-self-end">
              <div className="bg-white overflow-hidden shadow-xl" style={{ clipPath: CARD_CLIP }}>
                <div className="relative w-full h-[300px] overflow-hidden border-b border-black/[0.08]">
                  <Image
                    src={SEBASTIEN.image}
                    alt={SEBASTIEN.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: SEBASTIEN.objectPosition }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-black leading-none mb-2" style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}>
                    {SEBASTIEN.name}
                  </h3>
                  <p className="font-body text-red text-xs font-bold uppercase tracking-wider mb-4">
                    {SEBASTIEN.role}
                  </p>
                  <ul className="font-body text-black/70 text-sm leading-relaxed list-disc pl-4 flex flex-col gap-1.5">
                    {SEBASTIEN.creds.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <a
                    href={SEBASTIEN.wiki}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-body font-bold text-red text-sm mt-4 hover:underline"
                  >
                    View on Leaguepedia →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
