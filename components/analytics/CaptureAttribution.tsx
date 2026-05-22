"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Mounted once in the root layout so first-touch UTM capture runs on
 * every page — blog posts, the home page, any non-program landing page —
 * not just the three program pages.
 *
 * captureAttribution() is first-touch-wins and SSR-safe (see
 * lib/attribution.ts), so running it on every load is safe: only the
 * first UTM-bearing page in a session writes anything. Renders nothing.
 */
export default function CaptureAttribution() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
