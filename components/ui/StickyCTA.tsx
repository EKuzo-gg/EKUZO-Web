"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { trackRegisterClick } from "@/lib/analytics";
import { getProgramRegisterContext } from "@/lib/programRoutes";

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
  const showEnroll = !isSchools && !isCamps;
  const showContact = !isParents && !isCamps;
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
        {isCamps ? (
          <div className="flex items-center justify-between gap-6 w-full max-w-[1232px] mx-auto px-2">
            <span
              className="font-display uppercase leading-[0.95] hidden sm:block whitespace-nowrap"
              style={{ fontSize: "clamp(1.5rem, 3.75vw, 3.75em)", color: "#AE2CF2" }}
            >
              Ready to level up this summer?
            </span>
            <a
              href="/programs/ekuzo-camps/register?cta=sticky"
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
