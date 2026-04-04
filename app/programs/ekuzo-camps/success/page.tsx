"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

type RegistrationDetails = {
  parentName: string;
  parentEmail: string;
  gamers: {
    name: string;
    weekLabel: string;
    weekDates: string;
    slot: string;
    slotHours: string;
    price: number;
  }[];
  totalPaid: string;
  paymentIntentId: string;
};

export default function CampsSuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CampsSuccessPage />
    </Suspense>
  );
}

function CampsSuccessPage() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stripe redirects with ?payment_intent=pi_xxx&payment_intent_client_secret=...&redirect_status=succeeded
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (!paymentIntentId || redirectStatus !== "succeeded") {
      setLoading(false);
      return;
    }

    // Fetch payment details from our API
    fetch(`/api/camps/success?payment_intent=${paymentIntentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Failed to fetch details:", data.error);
        } else {
          setDetails(data);
        }
      })
      .catch((err) => console.error("Error fetching success details:", err))
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
            Your registration is confirmed. Welcome to EKUZO Camp!
          </p>

          {/* Registration details */}
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

                <div className="flex flex-col gap-4">
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
                          {g.weekLabel} — {g.weekDates}
                        </span>
                        <span className="font-body text-[#6b7280] text-sm">
                          {g.slot === "AM" ? "Morning" : "Afternoon"} Session
                        </span>
                      </div>
                      <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                        ${g.price}
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
                Your payment was successful! You&apos;ll receive a confirmation email shortly.
              </p>
            </div>
          )}

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
                  <span className="font-bold text-[#0a0a0a]">Check your inbox</span> — a confirmation email is on its way with all the details.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">2.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Download the game</span> — make sure your gamer has the game installed and ready before camp starts.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-body font-bold text-red text-sm mt-0.5">3.</span>
                <p className="font-body text-[#374151] text-sm leading-6">
                  <span className="font-bold text-[#0a0a0a]">Watch for prep emails</span> — we&apos;ll send everything you need to get ready the week before camp.
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
