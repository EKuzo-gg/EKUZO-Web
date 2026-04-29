"use client";

import { useEffect } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

/**
 * Drop into server-rendered pages to fire analytics events on mount.
 * Renders nothing visible.
 *
 * - program landing pages: <TrackPageView program="camps" />
 * - registration pages:    <TrackPageView program="camps" event="checkout" value={199} />
 *
 * Also captures first-touch UTM params into sessionStorage so the
 * register form submit can attach them to the Stripe Payment Intent
 * metadata. See lib/attribution.ts.
 */
export default function TrackPageView({
  program,
  event = "view",
  value,
}: {
  program: "camps" | "ekuzo100" | "ekuzo-teams";
  event?: "view" | "checkout";
  value?: number;
}) {
  useEffect(() => {
    captureAttribution();
    if (event === "checkout") {
      trackInitiateCheckout({ program, value });
    } else {
      trackViewContent({ program });
    }
  }, [program, event, value]);

  return null;
}
