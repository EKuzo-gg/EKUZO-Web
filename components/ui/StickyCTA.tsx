"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { trackRegisterClick, trackNewsletterSignup } from "@/lib/analytics";
import { getProgramRegisterContext } from "@/lib/programRoutes";
import { SEASON_ONE_MODE, SEASON_ONE_COPY } from "@/lib/seasonOne";
import {
  getOrAssignVariant,
  isBlogPostPath,
  recordSuccess,
  markShownThisLoad,
} from "@/lib/newsletterAb";

const BLOG_STICKY_COPY = {
  thumbs: {
    line: "One email tomorrow, then you decide to stay or go.",
    button: "Try it",
    success: "Got it. Look for it tomorrow.",
    error: "That didn't go through. Try once more.",
  },
  classic: {
    line: "One email a week on kids and gaming, with the sources.",
    button: "Join",
    success: "You're on the list.",
    error: "That didn't go through. Try once more.",
  },
} as const;

/**
 * Fixed-bottom CTA bar — "Enroll my gamer" + "Talk to Humans".
 * Appears after user scrolls past the hero (300px).
 * Hides when user scrolls back to top, when a modal is open, or when the footer is in view.
 */
export default function StickyCTA() {
  const { openModal, activeModal } = useModal();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Blog newsletter arm: /blog/* posts (not the index, not /blog/author/*)
  // get a newsletter bar instead of Enroll/Talk to Humans. Off while Season 01
  // mode is on: the Season 01 bar wins and no A/B variant is assigned.
  const isBlogPost = !SEASON_ONE_MODE && isBlogPostPath(pathname);
  const [blogVariant, setBlogVariant] = useState<"thumbs" | "classic">("thumbs");
  const [blogEmail, setBlogEmail] = useState("");
  const [blogStatus, setBlogStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!isBlogPost) return;
    setBlogVariant(getOrAssignVariant(window.localStorage));
  }, [isBlogPost]);

  async function handleBlogSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!blogEmail) return;

    setBlogStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: blogEmail,
          utm_source: "blog",
          utm_medium: "sticky",
          utm_campaign: blogVariant,
        }),
      });

      if (!res.ok) throw new Error("Failed to subscribe");

      setBlogStatus("success");
      // D7 fix: a bar signup already put this reader on the list, so the
      // popup must not ask again later in this page load or on a later
      // visit within the suppression window.
      recordSuccess(window.localStorage);
      markShownThisLoad();
      trackNewsletterSignup({ source: "sticky", variant: blogVariant });
    } catch {
      setBlogStatus("error");
    }
  }

  // Hide on register and success pages — user is already in checkout flow.
  // Also hide on standalone focused pages (no nav/footer) where the bar is out of place.
  const isCheckoutPage =
    pathname.includes("/register") ||
    pathname.includes("/success") ||
    pathname.startsWith("/swamp") ||
    pathname.startsWith("/woodward");

  // Context-specific overrides per page family
  const isSchools = pathname.startsWith("/schools");
  const isParents = pathname.startsWith("/parents");
  // Camps: white bar, purple text + purple button, direct-link to the
  // register page (no enroll modal). Promoted from V2 styling on
  // 2026-05-20 when V2 became the canonical /programs/ekuzo-camps page.
  const isCamps = pathname === "/programs/ekuzo-camps";
  // 101 pilot: same camps-style bar (display headline + single direct
  // Enroll link, no modal), routed to the 101 register. Added 2026-07-15.
  const is101 = pathname === "/programs/ekuzo101";
  const showEnroll = !isSchools && !isCamps && !is101;
  const showContact = !isParents && !isCamps && !is101;
  // On any non-camps program page (e100, teams), Enroll routes
  // direct to that program's register instead of the cross-program
  // picker modal. Camps has its own custom bar above; this covers
  // the other two. Contact button stays as-is (modal).
  const programCtx = getProgramRegisterContext(pathname);
  const directEnrollHref =
    programCtx && !isCamps
      ? `${programCtx.registerHref}?cta=sticky`
      : null;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide when footer scrolls into view
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Hide when a modal is open or footer is visible
  const show = visible && !activeModal && !footerVisible && !isCheckoutPage;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Top shadow for separation */}
      <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-black/8 to-transparent pointer-events-none" />

      <div className="flex items-center justify-center gap-2 px-3 py-4 md:gap-4 md:px-4 md:py-5 bg-white">
        {SEASON_ONE_MODE ? (
          // Season 01 waitlist mode: one bar everywhere, opens the waitlist popup.
          <div className="flex items-center justify-between gap-6 w-full max-w-[1232px] mx-auto px-2">
            <span
              className="font-display uppercase leading-[0.95] hidden sm:block whitespace-nowrap text-black"
              style={{ fontSize: "clamp(1.5rem, 3.75vw, 3.75em)" }}
            >
              {SEASON_ONE_COPY.stickyHead}
            </span>
            <button
              onClick={() => openModal("seasonOne")}
              className="flex-1 sm:flex-none bg-red text-white border-2 border-red font-body font-bold text-sm md:text-lg
                         py-3 px-5 md:py-3.5 md:px-8 rounded-sm cursor-pointer whitespace-nowrap shrink-0
                         hover:brightness-110 active:scale-[0.98] active:brightness-90
                         transition-all duration-150"
            >
              {SEASON_ONE_COPY.navCta}
            </button>
          </div>
        ) : isCamps || is101 ? (
          <div className="flex items-center justify-between gap-6 w-full max-w-[1232px] mx-auto px-2">
            <span
              className="font-display uppercase leading-[0.95] hidden sm:block whitespace-nowrap"
              style={{ fontSize: "clamp(1.5rem, 3.75vw, 3.75em)", color: "#AE2CF2" }}
            >
              Ready to level up this summer?
            </span>
            <a
              href={
                is101
                  ? "/programs/ekuzo101/register?cta=sticky"
                  : "/programs/ekuzo-camps/register?cta=sticky"
              }
              onClick={() => trackRegisterClick({ source: "sticky" })}
              className="flex-1 sm:flex-none bg-[#AE2CF2] text-white border-2 border-[#AE2CF2] font-body font-bold text-sm md:text-lg
                         py-3 px-5 md:py-3.5 md:px-8 rounded-sm text-center whitespace-nowrap shrink-0
                         hover:brightness-110
                         active:scale-[0.98] active:brightness-90
                         transition-all duration-150"
            >
              Enroll my gamer
            </a>
          </div>
        ) : isBlogPost ? (
          <div className="flex items-center justify-between gap-6 w-full max-w-[1232px] mx-auto px-2">
            {blogStatus === "success" ? (
              <>
                {/* D8 fix: the compact/display split now happens at lg
                    (1024), not sm (640), so the 640 to ~1024 tablet range
                    never lands in the fixed-width single-row layout that
                    was clipping off the right edge of the bar. */}
                <span
                  className="block lg:hidden font-body text-xs leading-snug"
                  style={{ color: "#AE2CF2" }}
                >
                  {BLOG_STICKY_COPY[blogVariant].success}
                </span>
                {/* >= lg: unchanged look from before, large display headline */}
                <span
                  className="hidden lg:block font-display uppercase leading-[0.95] whitespace-nowrap"
                  style={{ fontSize: "clamp(1.5rem, 3.75vw, 3.75em)", color: "#AE2CF2" }}
                >
                  {BLOG_STICKY_COPY[blogVariant].success}
                </span>
              </>
            ) : (
              <form
                onSubmit={handleBlogSubmit}
                className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-4 w-full"
              >
                {/* < lg: line/error stacks above the input+button row, compact
                    type (D1 fix: the display-font span below is hidden at
                    this width, so the sentence needs its own visible copy).
                    D8 fix: this compact layout now covers the whole tablet
                    range (640 to ~1024) that used to clip the button. */}
                <span
                  className="block lg:hidden font-body text-xs leading-snug"
                  style={{ color: blogStatus === "error" ? "#E3342F" : "#AE2CF2" }}
                >
                  {blogStatus === "error"
                    ? BLOG_STICKY_COPY[blogVariant].error
                    : BLOG_STICKY_COPY[blogVariant].line}
                </span>
                {/* >= lg: unchanged look from before, one row, large display font */}
                <span
                  className="font-display uppercase leading-[0.95] hidden lg:block whitespace-nowrap"
                  style={{
                    fontSize: "clamp(1.5rem, 3.75vw, 3.75em)",
                    color: blogStatus === "error" ? "#E3342F" : "#AE2CF2",
                  }}
                >
                  {blogStatus === "error"
                    ? BLOG_STICKY_COPY[blogVariant].error
                    : BLOG_STICKY_COPY[blogVariant].line}
                </span>
                <div className="flex-1 lg:flex-none flex items-center gap-2 min-w-0">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={blogEmail}
                    onChange={(e) => setBlogEmail(e.target.value)}
                    className="flex-1 lg:flex-none lg:w-[220px] min-w-0 font-body text-sm md:text-lg text-black
                               border-2 border-[#AE2CF2] rounded-sm py-3 px-3 md:py-3.5 md:px-5
                               outline-none placeholder:text-black/40"
                  />
                  <button
                    type="submit"
                    disabled={blogStatus === "loading"}
                    className="bg-[#AE2CF2] text-white border-2 border-[#AE2CF2] font-body font-bold text-sm md:text-lg
                               py-3 px-5 md:py-3.5 md:px-8 rounded-sm text-center whitespace-nowrap shrink-0
                               hover:brightness-110
                               active:scale-[0.98] active:brightness-90
                               transition-all duration-150
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {BLOG_STICKY_COPY[blogVariant].button}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {showEnroll && (
              directEnrollHref ? (
                <a
                  href={directEnrollHref}
                  onClick={() => trackRegisterClick({ source: "sticky" })}
                  className={`flex-1 ${showContact ? "max-w-[340px]" : "max-w-[680px]"} bg-red text-white border-2 border-red font-body font-bold text-sm md:text-lg
                             py-3 px-3 md:py-3.5 md:px-5 rounded-sm whitespace-nowrap text-center
                             hover:brightness-110 active:scale-[0.98] active:brightness-90
                             transition-all duration-150`}
                >
                  Enroll my gamer
                </a>
              ) : (
                <button
                  onClick={() => openModal("enroll")}
                  className={`flex-1 ${showContact ? "max-w-[340px]" : "max-w-[680px]"} bg-red text-white border-2 border-red font-body font-bold text-sm md:text-lg
                             py-3 px-3 md:py-3.5 md:px-5 rounded-sm cursor-pointer whitespace-nowrap
                             hover:brightness-110 active:scale-[0.98] active:brightness-90
                             transition-all duration-150`}
                >
                  Enroll my gamer
                </button>
              )
            )}

            {showContact && (
              <button
                onClick={() => openModal("contact")}
                className={`flex-1 ${showEnroll ? "max-w-[340px] bg-transparent text-red" : "max-w-[680px] bg-red text-white"} border-2 border-red font-body font-bold text-sm md:text-lg
                           py-3 px-3 md:py-3.5 md:px-5 rounded-sm cursor-pointer whitespace-nowrap
                           hover:bg-red hover:text-white active:scale-[0.98] active:brightness-90
                           transition-all duration-150`}
              >
                Talk to Humans
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
