"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";

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

  // Hide on register and success pages — user is already in checkout flow
  const isCheckoutPage = pathname.endsWith("/register") || pathname.endsWith("/success");

  // Context-specific: schools = conversation only, parents = enroll only
  const isSchools = pathname.startsWith("/schools");
  const isParents = pathname.startsWith("/parents");
  const showEnroll = !isSchools;
  const showContact = !isParents;

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

      <div className="bg-white flex items-center justify-center gap-2 px-3 pt-3 pb-6 md:gap-4 md:px-4 md:pt-4 md:pb-8">
        {showEnroll && (
          <button
            onClick={() => openModal("enroll")}
            className={`flex-1 ${showContact ? "max-w-[340px]" : "max-w-[680px]"} bg-red text-white border-2 border-red font-body font-bold text-sm md:text-lg
                       py-3 px-3 md:py-3.5 md:px-5 rounded-sm cursor-pointer whitespace-nowrap
                       hover:brightness-110 active:scale-[0.98] active:brightness-90
                       transition-all duration-150`}
          >
            Enroll my gamer
          </button>
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
      </div>
    </div>
  );
}
