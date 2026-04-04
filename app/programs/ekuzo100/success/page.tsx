"use client";

import { useSearchParams } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function Ekuzo100SuccessPage() {
  const searchParams = useSearchParams();
  const redirectStatus = searchParams.get("redirect_status");
  const succeeded = redirectStatus === "succeeded";

  return (
    <>
      <Nav variant="light" />

      <section className="bg-white min-h-screen">
        <div
          className="max-w-[720px] mx-auto px-6 sm:px-10 text-center"
          style={{ paddingTop: "160px", paddingBottom: "80px" }}
        >
          {/* Success icon */}
          <div className="mx-auto mb-8 w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M12 20L18 26L28 14"
                stroke="#15803d"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1
            className="font-display uppercase text-black"
            style={{ fontSize: "clamp(3rem, 6vw, 80px)", lineHeight: "0.95" }}
          >
            LEVEL <span className="text-red">UP!</span>
          </h1>

          <p
            className="font-body text-[#374151] mt-6"
            style={{ fontSize: "clamp(1rem, 1.4vw, 20px)", lineHeight: "32px" }}
          >
            {succeeded
              ? "Your registration is confirmed. Welcome to EKUZO100!"
              : "Your payment was successful! Welcome to EKUZO100!"}
          </p>

          {/* Info card */}
          <div className="mt-10 py-6 px-6 bg-[#f5f5f7] rounded-sm text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1.5 bg-[#dcfce7] rounded-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                <span className="font-body font-bold text-[#15803d] text-xs uppercase tracking-wide">
                  Paid — $100
                </span>
              </div>
            </div>
            <h3
              className="font-display uppercase text-[#0a0a0a] mb-2"
              style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
            >
              EKUZO100
            </h3>
            <p className="font-body text-[#6b7280] text-sm">
              4-week intro program — 2 sessions per week, 90 minutes each.
              Your gamer will be placed on a team and paired with a dedicated coach.
            </p>
          </div>

          {/* Next steps */}
          <div className="mt-10 text-left">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-4"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              What happens next
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">1.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Check your inbox</span> — a
                  confirmation email with your welcome packet is on its way.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">2.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">We&apos;ll build your team</span> — we
                  match by age, skill, and schedule. You&apos;ll hear from us before the cohort starts with your
                  team assignment, coach intro, and session schedule.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">3.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Download the game</span> — make sure
                  your gamer has their preferred game installed and updated before Day 1.
                </p>
              </div>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-red text-white font-body font-bold rounded-sm hover:brightness-110 active:scale-[0.98] active:brightness-90 transition-all duration-150"
              style={{ fontSize: "16px" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer hideTornPaper />
    </>
  );
}
