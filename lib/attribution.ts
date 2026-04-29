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
