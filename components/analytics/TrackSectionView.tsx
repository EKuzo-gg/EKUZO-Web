"use client";

import { useEffect, useRef } from "react";
import { trackSectionView } from "@/lib/analytics";

export type TrackedSection = {
  /** DOM id already on the section (or its wrapper) in the page markup. */
  id: string;
  /** Stable GA slug, snake_case. Never rename — reports key on this. */
  name: string;
};

/**
 * Fires one GA4 `section_view` per section per pageview, so we can see which
 * bands of a long page actually get read rather than scrolled past.
 *
 * Marks nothing and renders nothing: it looks up sections by DOM id and
 * observes them, the same way StickyCTA observes the <footer> it did not
 * render (components/ui/StickyCTA.tsx). That keeps app/page.tsx a server
 * component and keeps this component out of the layout — several homepage
 * bands rely on clipPath / sticky / absolutely-positioned torn paper that a
 * wrapper element would be at risk of disturbing.
 *
 * "Viewed" = the section occupies the middle 50% of the viewport for at
 * least `dwellMs`. A ratio-based threshold is deliberately NOT used: the
 * purple #for-players band is ~3x viewport height, so its intersectionRatio
 * tops out around 0.33 and any threshold >= 0.5 would never fire for it.
 * The dwell timer is what excludes flick-scrolls, and it is re-checked
 * against document.visibilityState so a backgrounded tab cannot inflate counts.
 *
 * Cost: one IntersectionObserver, no scroll listener, no state, no re-render.
 * Targets are unobserved once they fire, so the observer's work decays to
 * zero as the user scrolls. The page already runs two scroll listeners
 * (ParallaxBird, HomeHowItWorks); this adds none.
 */
export default function TrackSectionView({
  sections,
  dwellMs = 1000,
}: {
  sections: readonly TrackedSection[];
  dwellMs?: number;
}) {
  // Outlives effect re-runs so a changed prop identity can't double-count.
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const meta = new Map<Element, TrackedSection & { index: number }>();
    sections.forEach((section, i) => {
      const el = document.getElementById(section.id);
      // Missing id = section was renamed or removed; skip silently rather
      // than throwing on a marketing page.
      if (el) meta.set(el, { ...section, index: i + 1 });
    });
    if (meta.size === 0) return;

    const timers = new Map<Element, number>();
    const fired = firedRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const info = meta.get(entry.target);
          if (!info) continue;

          if (!entry.isIntersecting) {
            const pending = timers.get(entry.target);
            if (pending !== undefined) {
              window.clearTimeout(pending);
              timers.delete(entry.target);
            }
            continue;
          }

          if (fired.has(info.name) || timers.has(entry.target)) continue;

          const target = entry.target;
          timers.set(
            target,
            window.setTimeout(() => {
              timers.delete(target);
              if (fired.has(info.name)) return;
              if (document.visibilityState !== "visible") return;
              fired.add(info.name);
              trackSectionView({ section: info.name, index: info.index });
              observer.unobserve(target);
            }, dwellMs)
          );
        }
      },
      { threshold: 0, rootMargin: "-25% 0px -25% 0px" }
    );

    meta.forEach((_info, el) => observer.observe(el));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      observer.disconnect();
    };
  }, [sections, dwellMs]);

  return null;
}
