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
// Season 01 (site popup) attribution
// ---------------------------------------------------------------------------

/**
 * Separate from getAttribution() on purpose: camps, 100, 101 and teams post
 * getAttribution() in their registration payloads, and those must not change.
 * Only the Season 01 popup (components/ui/SeasonOnePopup) uses this one.
 *
 * It adds two things the popup needs. First, the extra ad keys (utm_id, site,
 * and the normalized ad id d1..d12) that /season1 stores when a parent lands
 * from an ad (app/season1/landing.html). Second, a 7-day return-visit store
 * (localStorage, Season 01 only): Jamie, 2026-10-11, a parent who comes back
 * in a new session within a week keeps the ad credit, matching Meta's 7-day
 * click window. Resolution order: current URL, then the session record, then
 * the return-visit record, then nothing.
 */

export type SeasonOneAttribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  utm_id: string;
  site: string;
};

export type SeasonOneAttributionFrom = "url" | "session" | "return-visit" | "none";

export type SeasonOneAttributionResult = {
  attribution: SeasonOneAttribution;
  ad: string;
  from: SeasonOneAttributionFrom;
};

/** sessionStorage record shared with captureAttribution(); /season1 writes it too. */
export const SEASON_ONE_SESSION_KEY = STORAGE_KEY;
/** localStorage return-visit record: the ad keys plus `at` (ms timestamp). */
export const SEASON_ONE_RETURN_KEY = "ekuzo_s1_attribution";
export const SEASON_ONE_RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const S1_KEYS: (keyof SeasonOneAttribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "site",
];

type S1Picked = { attribution: SeasonOneAttribution; ad: string };

function emptySeasonOne(): SeasonOneAttributionResult {
  return {
    attribution: {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      utm_id: "",
      site: "",
    },
    ad: "",
    from: "none",
  };
}

// Same rule as the route and the landing page: d1..d12 (any case, d01 ok), else "".
function normalizeAdId(v: unknown): string {
  const m = typeof v === "string" ? /^d(0?[1-9]|1[0-2])$/i.exec(v.trim()) : null;
  return m ? `d${Number(m[1])}` : "";
}

// Strings only (anything else becomes ""), capped at 200 chars. Null unless it is an ad touch:
// at least one of the five utm_* values is non-empty (ad, utm_id and site alone never count).
function pickSeasonOne(get: (key: string) => unknown): S1Picked | null {
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");
  const base = emptySeasonOne().attribution;
  for (const k of S1_KEYS) base[k] = str(get(k));
  const touch = S1_KEYS.slice(0, 5).some((k) => base[k]);
  return touch ? { attribution: base, ad: normalizeAdId(get("ad")) } : null;
}

function parseRecord(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Pure resolution step behind getSeasonOneAttribution(); exported for unit
 * tests. `search` is window.location.search, the two raw values are what the
 * storages returned (null when absent or unreadable), `now` is Date.now().
 */
export function resolveSeasonOneAttribution(
  search: string,
  sessionRaw: string | null,
  localRaw: string | null,
  now: number,
): SeasonOneAttributionResult {
  const params = new URLSearchParams(search);
  const fromUrl = pickSeasonOne((k) => params.get(k));
  if (fromUrl) return { ...fromUrl, from: "url" };

  const session = parseRecord(sessionRaw);
  const fromSession = session && pickSeasonOne((k) => session[k]);
  if (fromSession) return { ...fromSession, from: "session" };

  const local = parseRecord(localRaw);
  const at = local?.at;
  if (local && typeof at === "number" && Number.isFinite(at)) {
    const age = now - at;
    if (age >= 0 && age <= SEASON_ONE_RETURN_WINDOW_MS) {
      const fromLocal = pickSeasonOne((k) => local[k]);
      if (fromLocal) return { ...fromLocal, from: "return-visit" };
    }
  }

  return emptySeasonOne();
}

/** Browser wrapper: reads the URL and both storages (each read guarded), SSR-safe. */
export function getSeasonOneAttribution(): SeasonOneAttributionResult {
  if (typeof window === "undefined") return emptySeasonOne();
  let sessionRaw: string | null = null;
  let localRaw: string | null = null;
  try {
    sessionRaw = window.sessionStorage.getItem(SEASON_ONE_SESSION_KEY);
  } catch {
    // storage blocked: treat as absent
  }
  try {
    localRaw = window.localStorage.getItem(SEASON_ONE_RETURN_KEY);
  } catch {
    // storage blocked: treat as absent
  }
  return resolveSeasonOneAttribution(window.location.search, sessionRaw, localRaw, Date.now());
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
