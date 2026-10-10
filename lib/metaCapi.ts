import { createHash } from "crypto";

/**
 * Meta Conversions API: shared server-side sender.
 *
 * Used by /api/season-one (Lead). The Stripe webhook still builds its own
 * Purchase call inline (on v19.0); it predates this helper and was left
 * untouched. Bring it onto this version when commerce is next touched so
 * both surfaces speak one contract.
 *
 * Best-effort by design: never throws. A Meta outage must never block a
 * sign-up.
 *
 * Test routing: when META_CAPI_USE_TEST_CODE === "true", events carry
 * META_CAPI_TEST_EVENT_CODE and land in Events Manager > Test Events
 * instead of the live stream. Leave the flag unset in production. (The
 * webhook decides this from Stripe's livemode instead; a waitlist
 * sign-up has no livemode, hence the explicit flag.)
 */

// Graph/Marketing API v26.0 (released 2026-07-29) is current as of 2026-10-09; v19 and v21 are past support.
export const META_GRAPH_API_VERSION = "v26.0";

/** SHA-256 hex, the hash Meta expects for em / ph / fn / ln / zp. */
export const sha256 = (v: string) =>
  createHash("sha256").update(v).digest("hex");

export type CapiEvent = {
  event_name: string;
  event_time: number;
  /** Shared with the browser fbq call so Meta dedupes the pair. */
  event_id: string;
  action_source: "website";
  event_source_url?: string;
  /** em/ph/... as hashed arrays; ip, ua, fbc, fbp as plaintext strings. */
  user_data: Record<string, string | string[]>;
  custom_data?: Record<string, unknown>;
};

/** Send one event to the Conversions API. Resolves to void; logs failures. */
export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId =
    process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixelId) {
    console.warn(
      `Meta CAPI token or pixel ID not configured; skipping server-side ${event.event_name} event`
    );
    return;
  }

  const payload: { data: CapiEvent[]; test_event_code?: string } = {
    data: [event],
  };
  if (process.env.META_CAPI_USE_TEST_CODE === "true") {
    const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
    if (!testCode) {
      // Sending without the code would put a test event in the live
      // stream, so skip instead.
      console.warn(
        `META_CAPI_USE_TEST_CODE is "true" but META_CAPI_TEST_EVENT_CODE is empty; skipping ${event.event_name} event`
      );
      return;
    }
    payload.test_event_code = testCode;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `Meta CAPI ${event.event_name} failed:`,
        res.status,
        errText
      );
    } else {
      console.log(
        `✅ Meta CAPI: ${event.event_name} sent (event_id=${event.event_id}${payload.test_event_code ? ", test" : ""})`
      );
    }
  } catch (err) {
    console.error(
      `Meta CAPI ${event.event_name} error:`,
      err instanceof Error ? err.message : err
    );
  }
}
