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
  program: "camps" | "ekuzo100" | "ekuzo101" | "ekuzo-teams";
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
  program: "camps" | "ekuzo100" | "ekuzo101" | "ekuzo-teams";
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
  program: "camps" | "ekuzo100" | "ekuzo101" | "ekuzo-teams";
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

// ---------------------------------------------------------------------------
// RegisterClick — landing-page CTA fired before navigation to /register
// ---------------------------------------------------------------------------
// GA-only by design. Pixel ViewContent already covers landing-page intent;
// firing a second Pixel event for the click would muddy the funnel without
// adding signal. The `source` value is one of "hero" | "sticky" | "footer"
// so GA reports can break click volume down by CTA placement.

export function trackRegisterClick(params: { source: string }) {
  ga4("register_click", {
    source: params.source,
  });
}

// ---------------------------------------------------------------------------
// Registration — pilot completion (no payment; used on ekuzo101 success page)
// ---------------------------------------------------------------------------

export function trackRegistration(params: { program: string }) {
  ga4("sign_up", { method: params.program });
  fbq("CompleteRegistration", { content_name: params.program, value: 0, currency: "USD" });
}

// ---------------------------------------------------------------------------
// AiReferral — inbound session from an AI assistant / answer engine
// ---------------------------------------------------------------------------
// GA-only by design, same rationale as trackRegisterClick above. This is the
// session-level half of the LLM-traffic-tagging work: middleware.ts already
// tags first-touch origin into the ekuzo_origin cookie, but that value only
// surfaces at purchase time via Klaviyo + Sheets, so we have a numerator and
// no denominator. This event is the denominator.
//
// No fbq() call: Phase 1 is explicitly measurement-only, no Meta side effects.
//
// `origin` reuses the exact bucket names from lib/originClassifier.ts, so a
// GA4 report and a Klaviyo acquisition_origin segment slice identically.
// Register origin / detected_via / referrer_host / landing_path as
// event-scoped custom dimensions in GA4 Admin or they won't appear in reports.

export function trackAiReferral(params: {
  origin: string;
  detected_via: "utm" | "referrer";
  referrer_host: string;
  landing_path: string;
}) {
  ga4("ai_referral", {
    origin: params.origin,
    detected_via: params.detected_via,
    referrer_host: params.referrer_host,
    landing_path: params.landing_path,
  });
}

// ---------------------------------------------------------------------------
// SectionView — which bands of a long page actually get read
// ---------------------------------------------------------------------------
// GA-only, same reasoning as trackRegisterClick: this is a content diagnostic,
// not an ad-optimisation signal. Mirroring ~9 events per session into the
// Pixel would bloat Meta's funnel for zero targeting value. Fired at most once
// per section per pageview by components/analytics/TrackSectionView.tsx.

export function trackSectionView(params: { section: string; index: number }) {
  ga4("section_view", {
    section_id: params.section,
    section_index: params.index,
  });
}

// ---------------------------------------------------------------------------
// VideoPlay — first play of an inline video, once per player per pageview
// ---------------------------------------------------------------------------

export function trackVideoPlay(params: { video: string; section?: string }) {
  ga4("video_play", {
    video_id: params.video,
    section_id: params.section,
  });
}

// ---------------------------------------------------------------------------
// CtaClick — in-page links / CTAs that are NOT register CTAs
// ---------------------------------------------------------------------------
// Register CTAs keep using trackRegisterClick so the existing `register_click`
// reports stay a clean measure of enrolment intent.

export function trackCtaClick(params: {
  cta: string;
  section: string;
  destination: string;
}) {
  ga4("cta_click", {
    cta_id: params.cta,
    section_id: params.section,
    destination: params.destination,
  });
}
