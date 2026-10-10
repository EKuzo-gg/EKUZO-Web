"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useModal } from "@/context/ModalContext";
import { getAttribution } from "@/lib/attribution";
import { trackLead } from "@/lib/analytics";
import { SEASON_ONE_COPY as C } from "@/lib/seasonOne";

/**
 * Season 01 waitlist — full-screen popup.
 *
 * Opened by SeasonOneTrigger (first visit, ?join=season-one, any Enroll /
 * register CTA) through the modal system as activeModal === "seasonOne".
 * Desktop: photo left, torn edge, form right. Mobile: photo band on top
 * with the headline over it, form below, whole sheet scrolls.
 * Posts to /api/season-one (Klaviyo "Season 01 Waitlist" list).
 */

export const S1_JOINED_KEY = "ekuzo_s1_joined";
export const S1_DISMISSED_KEY = "ekuzo_s1_dismissed_at";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIME = "#E0FF4E";

const TORN_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 800' preserveAspectRatio='none'%3E%3Cpath d='M80 0 L80 800 L0 800 Q15 750 5 700 Q20 650 8 600 Q22 550 3 500 Q18 450 6 400 Q25 350 10 300 Q20 250 5 200 Q18 150 8 100 Q22 50 0 0Z' fill='white'/%3E%3C/svg%3E")`;

function Headline({ size }: { size: string }) {
  return (
    <h2
      id="s1-title"
      className="font-display uppercase text-white leading-[0.86]"
      style={{ fontSize: size }}
    >
      <span className="block">{C.lines[0]}</span>
      <span className="relative block w-fit text-white/55">
        {C.lines[1]}
        <span
          aria-hidden="true"
          className="absolute left-[-2%] right-[-2%] top-[50%] bg-red"
          style={{ height: "0.09em", transform: "translateY(-50%) rotate(-1.5deg)" }}
        />
      </span>
      <span className="block" style={{ color: LIME }}>{C.lines[2]}</span>
    </h2>
  );
}

export default function SeasonOnePopup() {
  const { closeModal } = useModal();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const gamesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // One ID per sign-up attempt, reused on retry, shared by the browser and
  // server (CAPI) Leads so Meta counts the sign-up once.
  const eventIdRef = useRef("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      // Don't pop the keyboard on phones; focus the dialog's close button instead.
      if (window.matchMedia("(min-width: 1024px)").matches) inputRef.current?.focus();
      else closeRef.current?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    try {
      if (!localStorage.getItem(S1_JOINED_KEY)) localStorage.setItem(S1_DISMISSED_KEY, String(Date.now()));
    } catch { /* ignore */ }
    closeModal();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!EMAIL_RE.test(em)) { setError("Check the email address and try again."); inputRef.current?.focus(); return; }
    setError("");
    setStatus("loading");
    if (!eventIdRef.current) {
      eventIdRef.current =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }
    const eventId = eventIdRef.current;
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/season-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: em,
          source: "site-popup",
          ad: params.get("ad") || params.get("utm_content") || "",
          attribution: getAttribution(),
          page: window.location.pathname + window.location.search,
          eventId,
          eventSourceUrl: window.location.href,
          ekz_hp: honeypotRef.current?.value || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "That didn’t go through. Try again?");
      }
      try { localStorage.setItem(S1_JOINED_KEY, "1"); } catch { /* ignore */ }
      if (!honeypotRef.current?.value) trackLead({ source: "season_one_popup", eventId });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "That didn’t go through. Try again?");
    }
  }

  function toggleGame(g: string) {
    const next = games.includes(g) ? games.filter((x) => x !== g) : [...games, g];
    setGames(next);
    // Wait for taps to settle, then send the whole selection once
    if (gamesTimer.current) clearTimeout(gamesTimer.current);
    gamesTimer.current = setTimeout(() => {
      if (!next.length) return;
      fetch("/api/season-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "games", email: email.trim(), kidGames: next.join(", ") }),
      }).catch(() => {});
    }, 900);
  }

  if (!mounted) return null;

  const form =
    status === "done" ? (
      <div className="flex flex-col gap-4" aria-live="polite">
        <p className="font-body text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: LIME }}>{C.doneKicker}</p>
        <h3 className="font-display uppercase text-white leading-[0.9]" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
          {C.doneHead}
        </h3>
        <p className="font-body text-[16px] text-white/70 leading-[1.5]">{C.doneSub}</p>
        <p className="font-body text-[16px] font-bold text-white mt-1">{C.gamesQ}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={C.gamesQ}>
          {C.games.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={games.includes(a)}
              onClick={() => toggleGame(a)}
              className={`font-body text-[15px] font-semibold px-4 py-3 rounded-sm border-2 cursor-pointer transition-colors ${
                games.includes(a) ? "bg-white text-black border-white" : "bg-transparent text-white border-white/25 hover:border-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {games.length > 0 && <p className="font-body text-[14px] text-white/60">Got it. Thanks.</p>}
        <button
          type="button"
          onClick={closeModal}
          className="self-start mt-4 font-body text-[16px] font-bold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white cursor-pointer"
        >
          Keep looking around
        </button>
      </div>
    ) : (
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <label htmlFor="s1-email" className="sr-only">Your email</label>
        <input
          ref={inputRef}
          id="s1-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "s1-err" : "s1-fine"}
          className="w-full h-[58px] px-4 rounded-sm border-2 border-white/20 bg-white/10 text-white text-[17px] font-body placeholder:text-white/45 outline-none transition-colors focus:border-white"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full h-[58px] rounded-sm bg-red text-white text-[18px] font-bold font-body cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-progress"
        >
          {status === "loading" ? "Saving…" : C.cta}
        </button>
        {/* Honeypot: bots fill it, people never see it. A filled value makes /api/season-one drop the sign-up. */}
        <input
          ref={honeypotRef}
          type="text"
          name="ekz_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          defaultValue=""
          className="absolute -left-[10000px] w-px h-px overflow-hidden opacity-0"
        />
        {error && <p id="s1-err" role="alert" className="font-body text-[14px] text-[#FF8B8B]">{error}</p>}
        <p id="s1-fine" className="font-body text-[13px] text-white/45 leading-[1.5]">{C.fine}</p>
      </form>
    );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black text-white overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="s1-title"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="fixed top-4 right-4 lg:top-6 lg:right-6 z-30 w-11 h-11 rounded-full bg-black/55 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l12 12M14 2L2 14" />
        </svg>
      </button>

      <div className="min-h-full flex flex-col lg:flex-row">
        {/* PHOTO — top band on mobile, left half on desktop */}
        <div className="relative w-full lg:w-1/2 h-[46svh] min-h-[300px] lg:h-auto lg:min-h-screen shrink-0 overflow-hidden">
          <Image
            src="/images/season-one-kid.jpg"
            alt="A kid on the couch with a controller, focused on the game"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[60%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/40" />
          {/* keeps the logo readable over bright windows */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
          <Image
            src="/images/ekuzo-logo.svg"
            alt="EKUZO"
            width={112}
            height={22}
            className="absolute top-5 left-5 lg:top-8 lg:left-10 w-[96px] lg:w-[112px] h-auto"
          />
          {/* Mobile: headline sits on the photo */}
          <div className="lg:hidden absolute left-5 right-5 bottom-4">
            <Headline size="clamp(54px, 15vw, 88px)" />
          </div>
          {/* Desktop: torn edge into the form side */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-0 right-[-2px] bottom-0 w-[80px] z-10 bg-black"
            style={{ maskImage: TORN_MASK, maskSize: "100% 100%", WebkitMaskImage: TORN_MASK, WebkitMaskSize: "100% 100%" }}
          />
        </div>

        {/* COPY + FORM */}
        <div className="flex-1 flex items-center px-5 pt-6 pb-12 lg:px-[clamp(40px,6vw,104px)] lg:py-16">
          <div className="w-full max-w-[460px] flex flex-col gap-5">
            {status !== "done" && (
              <>
                <p className="font-body text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: LIME }}>{C.kicker}</p>
                <div className="hidden lg:block">
                  <Headline size="clamp(72px, 7.4vw, 128px)" />
                </div>
                <p className="font-body text-[18px] lg:text-[20px] text-white leading-[1.45] text-pretty">{C.sub}</p>
                <p className="font-body text-[16px] text-white/65 leading-[1.5] -mt-1">{C.promise}</p>
              </>
            )}
            {form}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
