"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { trackPurchase } from "@/lib/analytics";

type Ekuzo100Details = {
  parentName: string;
  parentEmail: string;
  gamers: { name: string }[];
  cohortLabel: string;
  totalPaid: string;
  paymentIntentId: string;
  // Squad-share — every e100 registration mints a token (universal-link
  // rule, parallel to camps). Joiners share the owner's token via
  // joining_squad_token so the same link reaches the success page.
  squadToken?: string;
  squadLink?: string;
};

export default function Ekuzo100SuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Ekuzo100SuccessPage />
    </Suspense>
  );
}

function Ekuzo100SuccessPage() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<Ekuzo100Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const tracked = useRef(false);

  // Copy squad link to clipboard. navigator.clipboard.writeText with a
  // fallback to the legacy execCommand path for in-app browsers (Meta /
  // IG webview) that still don't expose the async clipboard reliably.
  async function copySquadLink(link: string) {
    if (!link) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (!paymentIntentId || redirectStatus !== "succeeded") {
      setLoading(false);
      return;
    }

    fetch(`/api/ekuzo100/success?payment_intent=${paymentIntentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Failed to fetch e100 details:", data.error);
        } else {
          setDetails(data);
          if (!tracked.current) {
            tracked.current = true;
            const amount = parseFloat(
              data.totalPaid?.replace(/[^0-9.]/g, "") || "0"
            );
            trackPurchase({
              program: "ekuzo100",
              value: amount,
              transactionId: paymentIntentId,
              eventId: paymentIntentId,
            });
          }
        }
      })
      .catch((err) => console.error("Error fetching e100 success details:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

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
            Your registration is confirmed. Welcome to EKUZO100!
          </p>

          {/* Booking summary */}
          {loading ? (
            <div className="mt-10 py-8">
              <p className="font-body text-black/40">Loading your booking details...</p>
            </div>
          ) : details ? (
            <div className="mt-10 text-left border border-[#e5e7eb] rounded-sm overflow-hidden">
              <div className="bg-[#f5f5f7] px-6 py-4 border-b border-[#e5e7eb]">
                <h2
                  className="font-display uppercase text-[#0a0a0a]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 28px)", lineHeight: "32px" }}
                >
                  Booking Summary
                </h2>
              </div>

              <div className="px-6 py-5">
                <div className="flex flex-col gap-1 mb-5">
                  <span className="font-body font-bold text-[#0a0a0a] text-sm">
                    {details.parentName}
                  </span>
                  <span className="font-body text-[#6b7280] text-sm">
                    {details.parentEmail}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
                  <div className="flex flex-col gap-1">
                    <span className="font-body font-bold text-[#0a0a0a] text-sm">
                      EKUZO100 Cohort
                    </span>
                    <span className="font-body text-[#6b7280] text-sm">
                      {details.cohortLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {details.gamers.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 pb-4 border-b border-[#f0f0f0] last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-body font-bold text-[#0a0a0a] text-sm">
                          {g.name}
                        </span>
                        <span className="font-body text-[#6b7280] text-sm">
                          EKUZO100
                        </span>
                      </div>
                      <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                        $100
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e7eb]">
                  <span className="font-body font-bold text-[#0a0a0a]" style={{ fontSize: "16px" }}>
                    Total Paid
                  </span>
                  <span className="font-display text-[#0a0a0a]" style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}>
                    {details.totalPaid}
                  </span>
                </div>

                <div className="mt-4 px-3 py-2 bg-[#dcfce7] rounded-sm inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                  <span className="font-body font-bold text-[#15803d] text-xs uppercase tracking-wide">
                    Paid
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 py-6 px-6 bg-[#f5f5f7] rounded-sm">
              <p className="font-body text-[#374151]">
                Your payment was successful! You&apos;ll receive a confirmation
                email shortly.
              </p>
            </div>
          )}

          {/* Bring your friends — squad share link.
              Every e100 registration mints a unique squad_token; this
              section lets the parent forward the auto-pinned join link
              to their gamer's friends so they land in the SAME cohort.
              The same link also lands in the welcome email body via
              Klaviyo's squad_link event property. */}
          {details?.squadLink ? (
            <div
              className="mt-10 text-left rounded-sm overflow-hidden border border-[#fecaca]"
              style={{ backgroundColor: "#fff7f7" }}
            >
              <div className="px-6 py-5">
                <h3
                  className="font-display uppercase text-[#0a0a0a]"
                  style={{ fontSize: "clamp(1.5rem, 2.4vw, 32px)", lineHeight: "1" }}
                >
                  Bring your <span className="text-red">friends</span>
                </h3>
                <p
                  className="font-body text-[#374151] mt-3"
                  style={{ fontSize: "15px", lineHeight: "24px" }}
                >
                  Share this link and your gamer&apos;s friends will be placed
                  on the same cohort — same month, same coach, same Discord.
                  We hand-build the team around it.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={details.squadLink}
                    aria-label="Squad share link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 font-body text-sm text-[#0a0a0a] bg-white border border-[#e5e7eb] rounded-sm px-3 py-3 focus:outline-none focus:border-red"
                  />
                  <button
                    type="button"
                    onClick={() => copySquadLink(details.squadLink || "")}
                    className="shrink-0 inline-flex items-center justify-center px-5 py-3 bg-red text-white font-body font-bold rounded-sm hover:brightness-110 active:scale-[0.98] active:brightness-90 transition-all duration-150 whitespace-nowrap"
                    style={{ fontSize: "14px" }}
                  >
                    {copyState === "copied"
                      ? "Copied!"
                      : copyState === "error"
                      ? "Copy failed"
                      : "Copy link"}
                  </button>
                </div>

                <p
                  className="font-body text-[#6b7280] mt-3"
                  style={{ fontSize: "12px", lineHeight: "18px" }}
                >
                  Friends who use this link will land on the same cohort you picked.
                </p>
              </div>
            </div>
          ) : null}

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
