"use client";

import { useEffect } from "react";
import { captureAttribution, captureAiReferral } from "@/lib/attribution";
import { trackAiReferral } from "@/lib/analytics";

/**
 * Mounted once in the root layout so first-touch UTM capture runs on
 * every page — blog posts, the home page, any non-program landing page —
 * not just the three program pages.
 *
 * captureAttribution() is first-touch-wins and SSR-safe (see
 * lib/attribution.ts), so running it on every load is safe: only the
 * first UTM-bearing page in a session writes anything. Renders nothing.
 *
 * Also emits the GA4 `ai_referral` event for sessions arriving from an AI
 * assistant, using the same classifier middleware.ts uses for the
 * ekuzo_origin cookie. Once per session, GA-only.
 */
export default function CaptureAttribution() {
  useEffect(() => {
    captureAttribution();

    // Classify on mount — document.referrer and the query string are only
    // trustworthy on this first render — but hold the GA4 send until after
    // window 'load'. gtag.js is lazyOnload and the ga4-init shim that defines
    // window.gtag runs at afterInteractive (app/layout.tsx), so an event sent
    // from inside this effect can land before window.gtag exists and be
    // dropped silently by the optional call in lib/analytics.ts. Post-load,
    // the shim is guaranteed present and gtag.js drains the queue.
    const referral = captureAiReferral();
    if (!referral) return;

    let cancelled = false;
    const fire = () => {
      if (!cancelled) trackAiReferral(referral);
    };

    if (document.readyState === "complete") {
      const timer = window.setTimeout(fire, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    window.addEventListener("load", fire, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", fire);
    };
  }, []);

  return null;
}
