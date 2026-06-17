"use client";

// EKUZO x WOODWARD — employee-benefit signup landing page (built
// 2026-06-17). The destination for the Woodward one-pager: Woodward
// families get a free month of EKUZO 101 (intro course). A deliberately
// simple email-capture page: first name + email, no commerce — a coach
// follows up with placement + start dates. Visual shell (Nav, gradient
// hero + white torn paper, Footer) mirrors the EKUZO100 register page so
// it sits inside the same design system.
//
// Submit → POST /api/woodward/subscribe (Beehiiv, tagged source-woodward).
// Success is handled inline (form swaps to a thank-you panel) — no
// separate /success route.

import { useState } from "react";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import InputField from "@/components/register/InputField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WoodwardSignupPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
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
    if (!age) {
      setError("Please select an age.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/woodward/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim(), age }),
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
      {/* Hero + form share one positioning wrapper (overflow-clip) so the
          Jinx art can bleed from the hero down across the torn-paper edge
          and overlay the form section. */}
      <div className="relative overflow-clip">
      {/* ── Hero ──────────────────────────────────────────────────────
          Standalone landing page — site Nav is intentionally hidden so
          the page reads as a focused, single-action invite. A lone
          "Visit site" button (top-right) is the only way back to the
          main site. Same hero structure as RegisterHero (radial-gradient
          bg + bottom white torn-paper) but carries the Woodward x EKUZO
          co-brand lockup instead of the H1 color-split. */}
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
          {/* Top bar — co-brand lockup left (nav position), way back to
              the main site on the right. */}
          <div className="flex items-center justify-between gap-4 mb-12">
            <Image
              src="/images/woodward-x-ekuzo-white-2.svg"
              alt="EKUZO x Woodward"
              width={410}
              height={124}
              priority
              className="h-auto w-[clamp(150px,18vw,220px)]"
            />
            <Button variant="white-outlined" href="/" className="!py-2.5 !px-5 text-sm">
              Visit site
            </Button>
          </div>

          <div className="flex flex-col gap-4" style={{ maxWidth: "720px" }}>
            <Eyebrow variant="light">Woodward Friends &amp; Families</Eyebrow>

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
              If your kid games, EKUZO turns it into something that counts. A
              coached team where they build confidence, friendships, and real
              skill, the same way traditional sports do. Woodward families get a
              free month of EKUZO 101, a no-cost pilot, on us.
            </p>
          </div>
        </div>

        {/* White torn paper flush with the section bottom. */}
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

      {/* ── Signup form ─────────────────────────────────────────────── */}
      <section className="bg-white">
        {/* Same container as the hero so the form's left edge lines up with
            the hero copy; inner block left-aligned (no mx-auto). */}
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-20 md:pb-28">
          <div className="max-w-[880px]">
          {!submitted ? (
            <>
              <h2
                className="font-display uppercase text-black leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                Reserve your free month
              </h2>
              <p
                className="font-body text-[#4b5563] mt-5"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "28px" }}
              >
                Add your gamer&apos;s name, your email, and their age, and a coach
                will follow up with placement and start dates.
                <br />
                <span className="font-bold text-[#0a0a0a]">
                  No payment, no commitment.
                </span>
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
                {/* All three fields on one row. Name + email take the
                    flexible columns; the age select is a narrower third
                    column. appearance-none strips the native select/number
                    spinner controls — a single custom chevron is the only
                    affordance. Ages 10–18 per EKUZO 101. */}
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)] gap-4 items-start">
                  <InputField
                    label="Gamer's Name *"
                    required
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Enter gamer's name"
                  />
                  <InputField
                    label="Email *"
                    required
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                  />
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="woodward-age"
                      className="font-body font-bold text-[#374151]"
                      style={{ fontSize: "14px", lineHeight: "20px" }}
                    >
                      Age *
                    </label>
                    <div className="relative">
                      <select
                        id="woodward-age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="appearance-none font-body w-full bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] pr-10 outline-none focus:border-[#0a0a0a] transition-colors cursor-pointer"
                        style={{ fontSize: "16px", lineHeight: "normal", color: age ? "#0a0a0a" : "#9ca3af" }}
                      >
                        <option value="" disabled>
                          Age
                        </option>
                        {Array.from({ length: 8 }, (_, i) => 10 + i).map((a) => (
                          <option key={a} value={String(a)} className="text-[#0a0a0a]">
                            {a}
                          </option>
                        ))}
                        <option value="Adult" className="text-[#0a0a0a]">
                          Adult
                        </option>
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="font-body text-red text-sm" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-body font-bold text-white bg-purple rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                  style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
                >
                  {isSubmitting ? "Signing up..." : "Sign up!"}
                </button>
              </form>
            </>
          ) : (
            <div className="py-10">
              <h2
                className="font-display uppercase text-black leading-[0.85]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                Spot reserved!
              </h2>
              <p
                className="font-body text-[#4b5563] mt-5"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "28px" }}
              >
                Thanks{firstName.trim() ? `, ${firstName.trim()}` : ""}. A coach will
                reach out soon with placement and start dates for your free month of
                EKUZO 101. No payment, no commitment.
              </p>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Jinx hero art — scaled up to bleed from the top of the hero down
          across the torn-paper edge into the form section. Sits above both
          sections (z-30); decorative, hidden on small screens. The form
          column is capped left (max-w-880) so Jinx fills the open right. */}
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
          className="w-full h-auto block"
        />
      </div>
      </div>
    </>
  );
}
