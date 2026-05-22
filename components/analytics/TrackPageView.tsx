"use client";

import { useEffect } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/analytics";

/**
 * Drop into server-rendered pages to fire analytics events on mount.
 * Renders nothing visible.
 *
 * - program landing pages: <TrackPageView program="camps" />
 * - registration pages:    <TrackPageView program="camps" event="checkout" value={199} />
 *
 * First-touch UTM capture is handled globally by <CaptureAttribution>
 * in the root layout — it is not done here.
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
    if (event === "checkout") {
      trackInitiateCheckout({ program, value });
    } else {
      trackViewContent({ program });
    }
  }, [program, event, value]);

  return null;
}
