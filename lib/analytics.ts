/**
 * Analytics helpers — fires both GA4 and Meta Pixel events in one call.
 *
 * Usage:
 *   import { trackPurchase, trackInitiateCheckout, ... } from "@/lib/analytics";
 *   trackPurchase({ program: "camps", value: 199, ... });
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ga4(event: string, params?: Record<string, any>) {
  window.gtag?.("event", event, params);
}

function fbq(event: string, params?: Record<string, any>) {
  window.fbq?.("track", event, params);
}

// ---------------------------------------------------------------------------
// ViewContent — program landing pages
// ---------------------------------------------------------------------------

export function trackViewContent(params: {
  program: "camps" | "ekuzo100" | "ekuzo-teams";
}) {
  ga4("view_item", {
    content_type: "program",
    item_id: params.program,
  });
  fbq("ViewContent", {
    content_name: params.program,
    content_type: "program",
  });
}

// ---------------------------------------------------------------------------
// InitiateCheckout — registration page load
// ---------------------------------------------------------------------------

export function trackInitiateCheckout(params: {
  program: "camps" | "ekuzo100" | "ekuzo-teams";
  value?: number;
  currency?: string;
}) {
  ga4("begin_checkout", {
    currency: params.currency ?? "USD",
    value: params.value ?? 0,
    items: [{ item_id: params.program, item_name: params.program }],
  });
  fbq("InitiateCheckout", {
    content_name: params.program,
    currency: params.currency ?? "USD",
    value: params.value ?? 0,
  });
}

// ---------------------------------------------------------------------------
// Purchase — success page (payment confirmed)
// ---------------------------------------------------------------------------

export function trackPurchase(params: {
  program: "camps" | "ekuzo100" | "ekuzo-teams";
  value: number;
  currency?: string;
  transactionId?: string;
  eventId?: string;
}) {
  ga4("purchase", {
    transaction_id: params.transactionId,
    currency: params.currency ?? "USD",
    value: params.value,
    items: [{ item_id: params.program, item_name: params.program }],
  });
  const fbqParams = {
    content_name: params.program,
    currency: params.currency ?? "USD",
    value: params.value,
  };
  // eventID lets the server-side CAPI Purchase call dedupe against this
  // browser fire. We only attach it when caller provides one — Meta's
  // dedup expects matching IDs, so a UUID generated here would just
  // create a new record instead of merging with the server event.
  if (params.eventId) {
    window.fbq?.("track", "Purchase", fbqParams, { eventID: params.eventId });
  } else {
    fbq("Purchase", fbqParams);
  }
}

// ---------------------------------------------------------------------------
// Lead — contact form submission
// ---------------------------------------------------------------------------

export function trackLead(params?: {
  source?: string;
}) {
  ga4("generate_lead", {
    source: params?.source ?? "contact_form",
  });
  fbq("Lead", {
    content_name: params?.source ?? "contact_form",
  });
}
