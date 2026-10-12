"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { trackNewsletterImpression, trackNewsletterSignup } from "@/lib/analytics";
import {
  getOrAssignVariant,
  isBlogPostPath,
  shouldShowPopup,
  recordDismiss,
  recordSuccess,
  shownThisLoad,
  markShownThisLoad,
} from "@/lib/newsletterAb";

const STORAGE_KEY = "ekuzo_newsletter_dismissed";

const BLOG_POPUP_COPY = {
  thumbs: {
    eyebrow: "The EKUZO weekly",
    headline: "One email after you read this. Then you decide.",
    body: "Leave your address and you're on the list today. Tomorrow I'll send one message with a thumbs up and a thumbs down, and the thumbs down takes you straight off, no questions. Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.",
    byline: "Karlin Oei, founder, EKUZO",
    firstNamePlaceholder: "First name (optional)",
    emailPlaceholder: "Email address",
    button: "Send me the one email",
    loading: "One moment...",
    success: "Got it.",
    microcopy: "No spam. Unsubscribe any time, or use the thumbs down tomorrow.",
    error: "That didn't go through. Try once more.",
  },
  classic: {
    eyebrow: "The EKUZO weekly",
    headline: "For parents of gamers, once a week.",
    body: "One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.",
    byline: "Karlin Oei, founder, EKUZO",
    firstNamePlaceholder: "First name (optional)",
    emailPlaceholder: "Email address",
    button: "Join the weekly",
    loading: "One moment...",
    success: "You're in.",
    microcopy: "No spam. Unsubscribe any time.",
    error: "That didn't go through. Try once more.",
  },
} as const;

export default function NewsletterPopup({
  mode = "site",
}: {
  mode?: "site" | "blog";
}) {
  const pathname = usePathname();
  const isBlogPost = mode === "blog" && isBlogPostPath(pathname);

  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [blogVariant, setBlogVariant] = useState<"thumbs" | "classic">("thumbs");

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // ── Site mode: unchanged 2.5s first-visit trigger ────────────────────
  useEffect(() => {
    if (mode !== "site") return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable — show anyway
    }

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [mode]);

  // ── Blog mode: assign variant, then scroll-to-50% trigger ────────────
  useEffect(() => {
    if (!isBlogPost) return;
    setBlogVariant(getOrAssignVariant(window.localStorage));
  }, [isBlogPost]);

  useEffect(() => {
    if (!isBlogPost) return;

    function maybeShow() {
      if (shownThisLoad) return;
      if (visible) return;
      if (!shouldShowPopup(window.localStorage)) return;

      const scrolled = window.scrollY + window.innerHeight;
      const threshold = 0.5 * document.documentElement.scrollHeight;
      if (scrolled >= threshold) {
        markShownThisLoad();
        setVisible(true);
      }
    }

    // Check on mount in case the page is short.
    maybeShow();

    window.addEventListener("scroll", maybeShow, { passive: true });
    return () => window.removeEventListener("scroll", maybeShow);
  }, [isBlogPost, visible]);

  // ── Blog mode: impression event on open ───────────────────────────────
  useEffect(() => {
    if (isBlogPost && visible) {
      trackNewsletterImpression({ variant: blogVariant });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlogPost, visible]);

  // ── Blog mode: focus management, move in on open, restore on close ───
  useEffect(() => {
    if (!isBlogPost || !visible) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const input = dialogRef.current?.querySelector<HTMLInputElement>("input");
    input?.focus();

    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, [isBlogPost, visible]);

  // ── Blog mode: Escape closes the dialog, Tab/Shift+Tab stays trapped
  //    inside it (D9 fix) ─────────────────────────────────────────────
  useEffect(() => {
    if (!isBlogPost || !visible) return;

    function getFocusable(container: HTMLElement): HTMLElement[] {
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dismiss();
        return;
      }

      if (e.key !== "Tab") return;

      const container = dialogRef.current;
      if (!container) return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlogPost, visible]);

  // ── Blog mode: lock body scroll while the dialog is open (D9 fix) ────
  useEffect(() => {
    if (!isBlogPost || !visible) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [isBlogPost, visible]);

  function dismiss() {
    setVisible(false);

    if (isBlogPost) {
      recordDismiss(window.localStorage);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  // Blog mode only: a click anywhere outside the form (the two brand
  // panes, the headline/body copy) counts as a backdrop click and
  // dismisses the dialog, same as Escape or the close button.
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isBlogPost) return;
    const target = e.target as HTMLElement;
    if (target.closest("form")) return;
    dismiss();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const body = isBlogPost
        ? {
            email,
            ...(firstName ? { firstName } : {}),
            utm_source: "blog",
            utm_medium: "popup",
            utm_campaign: blogVariant,
          }
        : { email, firstName };

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      // Brief flash of the button changing, then close
      setStatus("success");
      if (isBlogPost) {
        recordSuccess(window.localStorage);
        trackNewsletterSignup({ source: "popup", variant: blogVariant });
      }
      setTimeout(() => {
        if (isBlogPost) {
          setVisible(false);
        } else {
          dismiss();
        }
      }, 800);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        isBlogPost
          ? BLOG_POPUP_COPY[blogVariant].error
          : err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    }
  }

  if (!visible) return null;

  const blogCopy = BLOG_POPUP_COPY[blogVariant];

  // Shared between site mode and blog mode so the two never render two
  // separate copies of the same form. Only one of the two structural
  // branches below ever mounts this at a time.
  const formContent = (
    <>
      {/* EKUZO logo. Site mode: desktop-only (unchanged). Blog mode
          (SC-01 item 1): also shown below lg, replacing the removed
          mobile artwork block, so the sheet stays branded. */}
      <Image
        src="/images/ekuzo-logo.svg"
        alt="EKUZO"
        width={120}
        height={24}
        className={
          isBlogPost
            ? "block mb-4 lg:mb-10 opacity-80"
            : "hidden lg:block mb-10 opacity-80"
        }
      />

      <h3
        className={`font-body text-[28px] font-bold text-white leading-[1.2] ${
          isBlogPost ? "mb-2 lg:mb-3" : "mb-3"
        } tracking-[-0.02em]`}
      >
        {isBlogPost ? blogCopy.headline : "Stay in the loop."}
      </h3>
      <p
        className={`font-body text-[15px] text-white/50 leading-[1.5] ${
          isBlogPost ? "mb-4 lg:mb-8" : "mb-8"
        }`}
      >
        {isBlogPost
          ? blogCopy.body
          : "Get stories of transformation, tips, and updates on our events."}
      </p>
      {isBlogPost && (
        // D10 fix: text-white/40 measured ~3.8:1 on both pane
        // backgrounds, below AA. text-white/80 clears 4.5:1 on the
        // lighter mobile purple pane (measured ~5.0:1) and clears it
        // by a wide margin on the desktop navy pane (measured
        // ~11.2:1), while still reading as secondary to the body.
        <p className="font-body text-[13px] text-white/80 leading-[1.5] mb-4 lg:mb-8">
          {blogCopy.byline}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex flex-col ${isBlogPost ? "gap-3 lg:gap-4" : "gap-4"}`}
      >
        <input
          type="text"
          placeholder={isBlogPost ? blogCopy.firstNamePlaceholder : "First name"}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full h-[52px] px-4 rounded-md border border-white/20 bg-white/10 text-white text-[15px] font-body placeholder:text-white/40 outline-none transition-colors focus:border-[#C8E620]/50"
        />
        <input
          type="email"
          placeholder={isBlogPost ? blogCopy.emailPlaceholder : "Email address"}
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
          {isBlogPost
            ? status === "loading"
              ? blogCopy.loading
              : status === "success"
              ? blogCopy.success
              : blogCopy.button
            : status === "loading"
            ? "Subscribing..."
            : status === "success"
            ? "You're in!"
            : "Sign up"}
        </button>
      </form>

      {status === "error" && (
        <p className="font-body text-[13px] text-red mt-3">{errorMsg}</p>
      )}

      <p className="font-body text-[12px] text-white/30 leading-[1.5] mt-4">
        {isBlogPost
          ? blogCopy.microcopy
          : "No spam. Unsubscribe anytime. We respect your inbox."}
      </p>
    </>
  );

  return createPortal(
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-[9999] flex${isBlogPost ? " overflow-hidden" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={isBlogPost ? blogCopy.headline : "Newsletter signup"}
      onClick={handleBackdropClick}
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
          {isBlogPost ? blogCopy.eyebrow : "Join the EKUZO community"}
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

      {/* ── RIGHT HALF — form zone (purple on mobile, dark on desktop) ──
          Blog mode only, below lg (SC-01, repair cycle 2):
          - item 2: the close button is now a sibling of the scrollable
            div below, not inside it, so it stays pinned at top-6 right-6
            of this pane and never scrolls with the content. The wrapper
            uses py-20 (80px top AND bottom), which clears the button's
            own box (top-6 + h-10 = 64px) with room to spare at 320 and
            375 wide.
          - item 3: min-h-full plus my-auto on the actual content block
            centers it when it fits and top-aligns it when it does not
            (auto margins resolve to 0 once content exceeds the
            available space), which is the well-behaved alternative to
            justify-center's overflow-clipping bug from D6. Because the
            wrapper's top and bottom padding are equal (py-20, not a
            larger pt paired with a smaller pb), the auto-margin split
            plus the fixed padding add up to the same total on both
            sides, so the blank space above the content and below it
            stay equal instead of the earlier pt-20/pb-8 mismatch
            skewing everything toward the top by 48px.
          At lg and up, padding matches the original clamp() exactly
          (measured 60px at 1440), so desktop is unchanged. Site mode
          keeps the original structure, untouched. */}
      <div
        className={
          isBlogPost
            ? "flex-1 relative bg-[#7B3AAF] lg:bg-[#1a1a2e]"
            : "flex-1 flex flex-col justify-center items-center relative bg-[#7B3AAF] lg:bg-[#1a1a2e]"
        }
        style={isBlogPost ? undefined : { padding: "clamp(32px, 5vw, 60px)" }}
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

        {isBlogPost ? (
          <div className="h-full overflow-y-auto max-h-[100dvh]">
            <div className="min-h-full flex flex-col items-center px-8 py-20 lg:p-[clamp(32px,5vw,60px)]">
              <div className="w-full max-w-[400px] my-auto">{formContent}</div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile-only: heading above form. Site mode only, unchanged. */}
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

            <div className="w-full max-w-[400px]">{formContent}</div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
