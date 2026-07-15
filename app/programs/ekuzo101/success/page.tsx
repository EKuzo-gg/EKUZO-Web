"use client";

// EKUZO 101 SUCCESS PAGE
// Reads sessionStorage["ekuzo101-success"] on mount.
// No payment summary, no squad share — pilot-specific success flow.
// Copy source: docs/ekuzo101-pilot/copy-deck.md §3 (frozen 2026-07-15).

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { trackRegistration } from "@/lib/analytics";

type SuccessData = {
  parentName: string;
  parentEmail: string;
  gamers: { name: string }[];
  weeksLabel: string;
  weekDetails: { tueFull: string; thuFull: string }[];
  weeksCount: number;
  squadLink?: string;
};

export default function Ekuzo101SuccessPage() {
  const [data, setData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const tracked = useRef(false);

  function copySquadLink() {
    if (!data?.squadLink) return;
    navigator.clipboard
      .writeText(data.squadLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ekuzo101-success");
      if (raw) {
        const parsed = JSON.parse(raw) as SuccessData;
        setData(parsed);
        if (!tracked.current) {
          tracked.current = true;
          trackRegistration({ program: "ekuzo101" });
        }
      }
    } catch {
      // sessionStorage unavailable or parse failure — show fallback
    } finally {
      setLoading(false);
    }
  }, []);

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
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M12 20L18 26L28 14"
                stroke="#15803d"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Headline */}
          <h1
            className="font-display uppercase text-black"
            style={{ fontSize: "clamp(3rem, 6vw, 80px)", lineHeight: "0.95" }}
          >
            YOU&apos;RE <span className="text-red">IN.</span>
          </h1>

          {/* Subhead */}
          <p
            className="font-body text-[#374151] mt-6"
            style={{ fontSize: "clamp(1rem, 1.4vw, 20px)", lineHeight: "32px" }}
          >
            Your gamer&apos;s spot is reserved. Here&apos;s what happens next.
          </p>

          {/* Loading / data / fallback */}
          {loading ? (
            <div className="mt-10 py-8">
              <p className="font-body text-black/40">Loading your details...</p>
            </div>
          ) : data ? (
            <>
              {/* Schedule card */}
              <div className="mt-10 text-left border border-[#e5e7eb] rounded-sm overflow-hidden">
                <div className="bg-[#f5f5f7] px-6 py-4 border-b border-[#e5e7eb]">
                  <h2
                    className="font-display uppercase text-[#0a0a0a]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 28px)", lineHeight: "32px" }}
                  >
                    Your Selected Weeks
                  </h2>
                </div>
                <div className="px-6 py-5">
                  {/* Parent info */}
                  <div className="flex flex-col gap-1 mb-5 pb-4 border-b border-[#e5e7eb]">
                    <span className="font-body font-bold text-[#0a0a0a] text-sm">
                      {data.parentName}
                    </span>
                    <span className="font-body text-[#6b7280] text-sm">
                      {data.parentEmail}
                    </span>
                    {data.gamers.length > 0 && (
                      <span className="font-body text-[#6b7280] text-sm">
                        {data.gamers.map((g) => g.name).join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Week rows */}
                  <p
                    className="font-body font-bold text-[#0a0a0a] mb-3"
                    style={{ fontSize: "13px", lineHeight: "20px", letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    Sessions (7:00-8:30 PM local time each night)
                  </p>
                  <ul className="flex flex-col gap-2">
                    {data.weekDetails.map((wd, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-red text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>
                          {i + 1}
                        </span>
                        <span className="font-body text-[#374151] text-sm">
                          {wd.tueFull} + {wd.thuFull}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Total */}
                  <div className="mt-5 pt-4 border-t border-[#e5e7eb] flex items-baseline justify-between">
                    <span className="font-body font-bold text-[#0a0a0a] text-sm">
                      {data.weeksCount} week{data.weeksCount !== 1 ? "s" : ""} selected
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#dcfce7] rounded-sm">
                      <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                      <span className="font-body font-bold text-[#15803d] text-xs uppercase tracking-wide">
                        Free Pilot
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruit your friends — squad share link. Availability
                  model: the link affiliates families, it never locks a
                  schedule. Copy leans into that. */}
              {data.squadLink && (
                <div className="mt-10 text-left px-6 py-6 bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 rounded-sm">
                  <h3
                    className="font-display uppercase text-[#0a0a0a]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 28px)", lineHeight: "32px" }}
                  >
                    Recruit your friends
                  </h3>
                  <p className="font-body text-[#374151] mt-2 text-sm leading-6">
                    Gaming is better with friends. Share this link and
                    they&apos;ll be grouped with {data.gamers[0]?.name || "your gamer"}.
                    Everyone picks their own weeks; schedules don&apos;t need to
                    match perfectly, and we use the group&apos;s availability to
                    set up sessions.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={data.squadLink}
                      onFocus={(e) => e.target.select()}
                      aria-label="Your group invite link"
                      className="flex-1 font-body text-sm px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-sm text-[#374151] min-w-0"
                    />
                    <button
                      type="button"
                      onClick={copySquadLink}
                      className="shrink-0 px-5 py-2.5 bg-[#FF6B1A] text-white font-body font-bold text-sm rounded-sm hover:brightness-110 active:scale-[0.98] transition-all duration-150"
                    >
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              )}

              {/* What happens next */}
              <div className="mt-10 text-left">
                <h3
                  className="font-body font-bold text-[#0a0a0a] mb-4"
                  style={{ fontSize: "20px", lineHeight: "28px" }}
                >
                  What happens next
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-body font-bold text-red text-sm mt-0.5">1.</span>
                    <p className="font-body text-[#374151] text-sm leading-6">
                      <span className="font-bold text-[#0a0a0a]">Check your email.</span>{" "}
                      A confirmation is on its way with your selected weeks and everything
                      you need to get ready. If you don&apos;t see it in a few minutes, check
                      your spam folder.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-body font-bold text-red text-sm mt-0.5">2.</span>
                    <p className="font-body text-[#374151] text-sm leading-6">
                      <span className="font-bold text-[#0a0a0a]">Your coach will reach out before Day 1.</span>{" "}
                      Expect a brief note from your gamer&apos;s coach introducing themselves
                      and answering any last questions before the first session.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-body font-bold text-red text-sm mt-0.5">3.</span>
                    <p className="font-body text-[#374151] text-sm leading-6">
                      <span className="font-bold text-[#0a0a0a]">Download (or update) League of Legends.</span>{" "}
                      Free at leagueoflegends.com. Make sure your gamer&apos;s account is active
                      and the game is updated before the first Tuesday. A headset with a mic
                      is all the other gear you need.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pay-at-the-end promise */}
              <div className="mt-10 text-left px-6 py-6 bg-[#f9fafb] border border-[#e5e7eb] rounded-sm">
                <p
                  className="font-body text-[#374151]"
                  style={{ fontSize: "15px", lineHeight: "1.75" }}
                >
                  This program is free. No card was collected, and nothing will be charged
                  automatically.
                </p>
                <p
                  className="font-body text-[#374151] mt-3"
                  style={{ fontSize: "15px", lineHeight: "1.75" }}
                >
                  At the end of your four weeks, Karlin will reach out personally. If the
                  program was worth it - if your gamer showed up, got coached, and you saw
                  something real - you&apos;ll hear about what it looks like to continue. The
                  team program runs $160 per month. That conversation happens between humans,
                  not billing systems.
                </p>
                <p
                  className="font-body font-bold text-[#0a0a0a] mt-3"
                  style={{ fontSize: "15px", lineHeight: "1.75" }}
                >
                  Try it. See for yourself. Then decide.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-10 py-6 px-6 bg-[#f5f5f7] rounded-sm">
              <p className="font-body text-[#374151]">
                Your registration is confirmed. Check your email for details.
              </p>
            </div>
          )}

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
