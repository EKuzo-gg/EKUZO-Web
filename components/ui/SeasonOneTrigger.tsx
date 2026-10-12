"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { SEASON_ONE_MODE, SEASON_ONE_PARAM, SEASON_ONE_QUIET_PATHS } from "@/lib/seasonOne";
import { S1_DISMISSED_KEY, S1_JOINED_KEY } from "./SeasonOnePopup";

const AUTO_DELAY_MS = 2500;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // a closed popup stays closed for a week

/**
 * Decides when the Season 01 popup opens. Mounted once in the root layout.
 *  - ?join=season-one (or any ?join=) on any page: opens immediately.
 *  - First visit: opens after a short delay, unless they joined already or
 *    closed it in the last 7 days, or the page is a quiet path.
 *  - Any click on a link to a /register page opens the popup instead
 *    (covers page-level "Enroll" links the shared components don't own).
 */
export default function SeasonOneTrigger() {
  const { openModal, activeModal } = useModal();
  const pathname = usePathname() || "/";
  const activeRef = useRef(activeModal);
  activeRef.current = activeModal;

  // Intercept register links site-wide (capture phase, before Next's Link handler)
  useEffect(() => {
    if (!SEASON_ONE_MODE) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (!/\/register\/?$/.test(url.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      openModal("seasonOne");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openModal]);

  // ?join= and first-visit auto open
  useEffect(() => {
    if (!SEASON_ONE_MODE) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has(SEASON_ONE_PARAM)) {
      openModal("seasonOne");
      return;
    }
    if (pathname.includes("/register") || pathname.includes("/success")) return;
    if (SEASON_ONE_QUIET_PATHS.some((p) => pathname.startsWith(p))) return;
    try {
      if (localStorage.getItem(S1_JOINED_KEY)) return;
      const at = Number(localStorage.getItem(S1_DISMISSED_KEY) || 0);
      if (at && Date.now() - at < SNOOZE_MS) return;
    } catch { /* storage blocked: still show once per page load */ }
    const t = setTimeout(() => {
      if (!activeRef.current) openModal("seasonOne");
    }, AUTO_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
