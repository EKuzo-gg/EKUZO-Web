"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const STORAGE_KEY = "ekuzo_newsletter_dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable — show anyway
    }

    // Show after a short delay so it doesn't flash on load
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      // Brief flash of the button changing, then close
      setStatus("success");
      setTimeout(() => {
        dismiss();
      }, 800);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      {/* ── LEFT HALF — purple brand zone ──────────────────────── */}
      <div
        className="hidden lg:flex flex-1 relative flex-col justify-end overflow-hidden"
        style={{
          background: "#7B3AAF",
          padding: "clamp(40px, 5vw, 60px)",
        }}
      >
        {/* Kid + characters composite */}
        <Image
          src="/images/popup-kid-characters.png"
          alt="EKUZO gamer with game characters"
          width={800}
          height={808}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-h-[90%] object-contain opacity-90 drop-shadow-2xl"
          priority
        />

        {/* Headline */}
        <p
          className="relative z-10 font-body text-[13px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-4"
        >
          Join the EKUZO community
        </p>
        <h2
          className="relative z-10 font-display uppercase text-white leading-[0.88]"
          style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
        >
          GAMING
          <br />
          <span style={{ color: "#C8E620" }}>MATTERS.</span>
        </h2>

        {/* Torn paper edge on right side */}
        <div
          className="absolute top-0 right-[-2px] bottom-0 w-[80px] z-20"
          style={{
            background: "#1a1a2e",
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 800' preserveAspectRatio='none'%3E%3Cpath d='M80 0 L80 800 L0 800 Q15 750 5 700 Q20 650 8 600 Q22 550 3 500 Q18 450 6 400 Q25 350 10 300 Q20 250 5 200 Q18 150 8 100 Q22 50 0 0Z' fill='white'/%3E%3C/svg%3E")`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 800' preserveAspectRatio='none'%3E%3Cpath d='M80 0 L80 800 L0 800 Q15 750 5 700 Q20 650 8 600 Q22 550 3 500 Q18 450 6 400 Q25 350 10 300 Q20 250 5 200 Q18 150 8 100 Q22 50 0 0Z' fill='white'/%3E%3C/svg%3E")`,
            WebkitMaskSize: "100% 100%",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ── RIGHT HALF — form zone (purple on mobile, dark on desktop) ── */}
      <div
        className="flex-1 flex flex-col justify-center items-center relative bg-[#7B3AAF] lg:bg-[#1a1a2e]"
        style={{
          padding: "clamp(32px, 5vw, 60px)",
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/12 flex items-center justify-center text-white/50 hover:bg-white/8 hover:text-white transition-all cursor-pointer"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>

        {/* Mobile-only: heading above form */}
        <div className="lg:hidden text-center mb-8">
          <Image
            src="/images/popup-kid-characters.png"
            alt="EKUZO gamer with game characters"
            width={300}
            height={303}
            className="mx-auto mb-6 w-[200px] h-auto opacity-90"
          />
          <h2
            className="font-display uppercase text-white leading-[0.88] mb-2"
            style={{ fontSize: "clamp(40px, 10vw, 56px)" }}
          >
            GAMING<br /><span style={{ color: "#C8E620" }}>MATTERS.</span>
          </h2>
        </div>

        <div className="w-full max-w-[400px]">
          {/* EKUZO logo */}
          <Image
            src="/images/ekuzo-logo.svg"
            alt="EKUZO"
            width={120}
            height={24}
            className="hidden lg:block mb-10 opacity-80"
          />

          <h3 className="font-body text-[28px] font-bold text-white leading-[1.2] mb-3 tracking-[-0.02em]">
            Stay in the loop.
          </h3>
          <p className="font-body text-[15px] text-white/50 leading-[1.5] mb-8">
            Get stories of transformation, tips, and updates on our events.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-[52px] px-4 rounded-md border border-white/20 bg-white/10 text-white text-[15px] font-body placeholder:text-white/40 outline-none transition-colors focus:border-[#C8E620]/50"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[52px] px-4 rounded-md border border-white/20 bg-white/10 text-white text-[15px] font-body placeholder:text-white/40 outline-none transition-colors focus:border-[#C8E620]/50"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`w-full h-[52px] rounded-md text-[16px] font-bold font-body border-none cursor-pointer transition-all duration-300 ${
                status === "success"
                  ? "bg-white text-black"
                  : "bg-[#C8E620] text-[#111] hover:brightness-110 active:scale-[0.98] active:brightness-90"
              } disabled:cursor-not-allowed`}
            >
              {status === "loading"
                ? "Subscribing..."
                : status === "success"
                ? "You're in!"
                : "Sign up"}
            </button>
          </form>

          {status === "error" && (
            <p className="font-body text-[13px] text-red mt-3">
              {errorMsg}
            </p>
          )}

          <p className="font-body text-[12px] text-white/30 leading-[1.5] mt-4">
            No spam. Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
