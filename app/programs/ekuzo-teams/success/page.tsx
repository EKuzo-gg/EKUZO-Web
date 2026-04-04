"use client";

import { useSearchParams } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function EkuzoTeamsSuccessPage() {
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
              ? "Your registration is confirmed. Welcome to EKUZOTeams!"
              : "Your payment was successful! Welcome to EKUZOTeams!"}
          </p>

          {/* Info card */}
          <div className="mt-10 py-6 px-6 bg-[#f5f5f7] rounded-sm text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1.5 bg-[#dcfce7] rounded-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                <span className="font-body font-bold text-[#15803d] text-xs uppercase tracking-wide">
                  Confirmed
                </span>
              </div>
            </div>
            <h3
              className="font-display uppercase text-[#0a0a0a] mb-2"
              style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
            >
              EKUZOTeams — Fall 2026
            </h3>
            <p className="font-body text-[#6b7280] text-sm">
              Full-semester team program — 2 sessions per week, 90 minutes each.
              Begins the week of August 31, 2026. Your gamer will be placed on a
              permanent roster with a dedicated coach.
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
                  match by age, skill, and game preference. Before the semester starts,
                  you&apos;ll receive your team assignment, coach intro, and full session schedule.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">3.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Get set up</span> — make sure
                  your gamer has their preferred game installed, a working headset,
                  and Discord ready to go before Day 1.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">4.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Start training now</span> — the
                  semester doesn&apos;t start until August, but you can jump into{" "}
                  <Link href="/programs/ekuzo-camps/register" className="text-red underline hover:text-red/70">
                    EKUZO Camps
                  </Link>{" "}
                  or{" "}
                  <Link href="/programs/ekuzo100/register" className="text-red underline hover:text-red/70">
                    EKUZO100
                  </Link>{" "}
                  right now to get a head start.
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
