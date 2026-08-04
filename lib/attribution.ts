import { classifyOrigin, isAiOrigin } from "./originClassifier";

/**
 * Marketing attribution capture for paid + organic acquisition tracking.
 *
 * First-touch wins: the first page in a session that arrives with UTM
 * params writes them to sessionStorage. Subsequent pages do NOT overwrite,
 * so a user who lands via a Meta ad on /programs/ekuzo-camps and then
 * clicks through to /programs/ekuzo-camps/register without UTMs still
 * submits the original `meta`/`paid` attribution on form submit.
 *
 * sessionStorage (not localStorage) is intentional — attribution is
 * scoped to the browsing session that produced the registration. A
 * different session days later isn't the same touch.
 *
 * Used by /api/camps/register and /api/ekuzo100/register (POSTed in the
 * registration body, written to Stripe Payment Intent metadata, read by
 * the webhook to derive acquisition_source for Sheets/Klaviyo/Beehiiv).
 */

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

const STORAGE_KEY = "ekuzo_attribution";

const UTM_KEYS: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function emptyAttribution(): Attribution {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  };
}

/**
 * Capture UTM params from window.location.search into sessionStorage.
 * First-touch wins — a no-op if a non-empty attribution already exists.
 * Safe to call on every page mount; safe on SSR (window guard).
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as Partial<Attribution>;
      const hasAny = UTM_KEYS.some((k) => (parsed[k] || "").length > 0);
      if (hasAny) return;
    }

    const params = new URLSearchParams(window.location.search);
    const captured = emptyAttribution();
    let foundAny = false;
    for (const key of UTM_KEYS) {
      const v = params.get(key);
      if (v) {
        captured[key] = v.slice(0, 200);
        foundAny = true;
      }
    }
    if (!foundAny) return;

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // sessionStorage can throw in private-browsing or quota-exceeded
    // edge cases; attribution is best-effort, not load-bearing.
  }
}

/**
 * Read attribution from sessionStorage. Returns an empty Attribution
 * if nothing has been captured (caller can spread into request body
 * unconditionally — empty strings round-trip through Stripe metadata
 * cleanly and the webhook treats empty as "organic").
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return emptyAttribution();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAttribution();
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    return {
      utm_source: parsed.utm_source || "",
      utm_medium: parsed.utm_medium || "",
      utm_campaign: parsed.utm_campaign || "",
      utm_content: parsed.utm_content || "",
      utm_term: parsed.utm_term || "",
    };
  } catch {
    return emptyAttribution();
  }
}

// ---------------------------------------------------------------------------
// AI-assistant referral detection
// ---------------------------------------------------------------------------

/**
 * middleware.ts already classifies first-touch origin server-side into the
 * `ekuzo_origin` cookie, but that value only ever reaches an analytics surface
 * at purchase time (register -> PaymentIntent metadata -> Klaviyo + Sheets).
 * Nothing reports AI-sourced *sessions*, so GA4 can't tell us what share of
 * traffic arrives from ChatGPT / Claude / Perplexity.
 *
 * This closes that gap using the SAME classifier the middleware uses.
 * lib/originClassifier.ts is dependency-free and behaves identically in the
 * browser, so a session and a purchase can never be bucketed by different
 * rules. document.referrer stands in for the Referer header: they agree for
 * real navigations, and unlike the header it survives App Router client-side
 * transitions.
 *
 * Session-scoped and fire-once, matching the UTM capture above.
 */

const AI_REFERRAL_KEY = "ekuzo_ai_referral";

export type AiReferral = {
  origin: string;
  detected_via: "utm" | "referrer";
  referrer_host: string;
  landing_path: string;
};

/**
 * Classify the current page load. Returns the payload the caller should send
 * to GA4, or null when this isn't an AI-sourced load (or one was already
 * recorded this session). Safe on SSR.
 */
export function captureAiReferral(): AiReferral | null {
  if (typeof window === "undefined") return null;

  try {
    // Already recorded this session: first-touch wins, same as the UTMs.
    if (window.sessionStorage.getItem(AI_REFERRAL_KEY)) return null;
  } catch {
    // sessionStorage throws in private-browsing / quota edge cases. Fall
    // through and classify anyway; worst case the event fires per page view.
  }

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || null;

  const origin = classifyOrigin({
    searchParams: params,
    referer: referrer,
    userAgent: window.navigator.userAgent,
  });

  if (!isAiOrigin(origin)) return null;

  // Which signal earned the classification: re-run with the referrer withheld.
  // If it still lands on an AI bucket, the UTM did the work.
  const utmOnly = classifyOrigin({
    searchParams: params,
    referer: null,
    userAgent: window.navigator.userAgent,
  });

  let referrerHost = "";
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname.toLowerCase();
    } catch {
      referrerHost = "";
    }
  }

  const captured: AiReferral = {
    origin,
    detected_via: isAiOrigin(utmOnly) ? "utm" : "referrer",
    referrer_host: referrerHost,
    landing_path: window.location.pathname,
  };

  try {
    window.sessionStorage.setItem(AI_REFERRAL_KEY, JSON.stringify(captured));
  } catch {
    // Best-effort, not load-bearing.
  }

  return captured;
}

/**
 * Read what was captured this session, if anything. Not used by the site
 * today: exists so a future Phase 2 CAPI fire or a support-debug surface can
 * read the value without re-classifying.
 */
export function getAiReferral(): AiReferral | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AI_REFERRAL_KEY);
    return raw ? (JSON.parse(raw) as AiReferral) : null;
  } catch {
    return null;
  }
}
