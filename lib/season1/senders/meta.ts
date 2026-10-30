import { isIP } from "node:net";
import { META_GRAPH_API_VERSION, sha256 } from "../../metaCapi";
import { validFbc, validFbp } from "../attribution";
import { LIVE_ORIGIN, SenderError, dollars, resolveOrigin, type OrderCtx, type SendOutcome } from "./context";

/**
 * Season 01 Meta Conversions API sender: Purchase on a paid order.
 * Calls the Graph API directly (rather than lib/metaCapi.sendCapiEvent) so the
 * test event code is forced whenever the order is test mode, and so the
 * access token travels in the body, never in a URL that could be logged.
 * user_data carries only the hashed email, the hashed family id, and the
 * client IP and user agent recorded at consent (plus fbp/fbc when stored and
 * valid: money red team 8, a malformed value is omitted so it cannot burn the
 * row's five attempts).
 * Never kid data, never a phone.
 */

export const META_TIMEOUT_MS = 2000;
export const DEFAULT_TEST_CODE = "TEST_S1";

export interface MetaPurchase {
  event_name: "Purchase";
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url: string;
  user_data: Record<string, string | string[]>;
  custom_data: { value: number; currency: "USD"; content_name: "Season 01"; num_items: number };
}

export function testEventCode(): string {
  return (process.env.META_CAPI_TEST_EVENT_CODE || "").trim() || DEFAULT_TEST_CODE;
}

export function buildPurchaseEvent(o: OrderCtx): MetaPurchase {
  const userData: Record<string, string | string[]> = {
    em: [sha256(o.email.trim().toLowerCase())],
    external_id: [sha256(o.familyPublicId)],
  };
  if (o.consentIp && isIP(o.consentIp)) userData.client_ip_address = o.consentIp;
  if (o.consentUa) userData.client_user_agent = o.consentUa.slice(0, 400);
  const fbp = validFbp(o.fbp);
  const fbc = validFbc(o.fbc);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  const paid = o.paidAt ? new Date(o.paidAt).getTime() : Date.now();
  return {
    event_name: "Purchase",
    event_time: Math.floor(paid / 1000),
    event_id: o.orderPublicId,
    action_source: "website",
    event_source_url: `${o.livemode ? LIVE_ORIGIN : resolveOrigin(false, o.origin)}/season1/join`,
    user_data: userData,
    custom_data: {
      value: dollars(o.amountCents),
      currency: "USD",
      content_name: "Season 01",
      num_items: o.kids.length,
    },
  };
}

/** The request body. test_event_code is present whenever livemode is false. */
export function buildRequestBody(event: MetaPurchase, livemode: boolean, token: string) {
  return {
    data: [event],
    ...(livemode ? {} : { test_event_code: testEventCode() }),
    access_token: token,
  };
}

export async function sendMetaPurchase(event: MetaPurchase, livemode: boolean): Promise<SendOutcome> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixelId) return { outcome: "skipped_no_config" };
  let res: Response;
  try {
    res = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(event, livemode, token)),
      signal: AbortSignal.timeout(META_TIMEOUT_MS),
    });
  } catch (err) {
    throw new SenderError((err as Error)?.name === "TimeoutError" ? "meta_timeout" : "meta_network");
  }
  const body = (await res.json().catch(() => null)) as { events_received?: number; error?: { code?: number } } | null;
  if (!res.ok) throw new SenderError(`meta_http_${res.status}${body?.error?.code ? `_code_${body.error.code}` : ""}`);
  const n = body?.events_received ?? 0;
  if (n < 1) throw new SenderError("meta_no_events_received");
  return { outcome: "sent", detail: `http_${res.status} events_received=${n}${livemode ? "" : " test_code"}` };
}
