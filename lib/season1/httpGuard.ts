/**
 * Pure request guards and response headers for the Season 01 routes
 * (security review L1, L2, L3, L7). No I/O.
 */

/** L7: anti-framing and nosniff on every Season 01 HTML page and the commit API. */
export const SECURITY_HEADERS = {
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
} as const;

/**
 * L7 for the four funnel pages (join, signup, welcome, crew). Live and off keep DENY.
 * Test mode only relaxes to SAMEORIGIN so the dev phone preview (/season1/dev-view)
 * can frame our own pages; other sites still cannot. Approved by Aaron 2026-10-28,
 * flagged for Jamie in WORKLOG. The commit API always keeps SECURITY_HEADERS.
 */
export function pageSecurityHeaders(mode: string): Record<string, string> {
  return mode === "test" ? { ...SECURITY_HEADERS, "x-frame-options": "SAMEORIGIN" } : { ...SECURITY_HEADERS };
}

function cleanHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase();
}

/**
 * L1, L2: true when the request comes from another site. Sec-Fetch-Site wins
 * when present (same-origin, same-site and none pass); otherwise an Origin
 * header must name the raw host. No header at all passes (non-browser callers
 * and older browsers; the content-type check forces a preflight for those).
 */
export function isCrossSite(req: Request): boolean {
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs !== null) return !["same-origin", "same-site", "none"].includes(sfs.trim().toLowerCase());
  const origin = req.headers.get("origin");
  if (origin !== null) {
    try {
      return new URL(origin).host.toLowerCase() !== cleanHost(req.headers.get("host"));
    } catch {
      return true; // "null" or garbage
    }
  }
  return false;
}

/** L1: the body must be declared JSON (a cross-site form post cannot do that without a preflight). */
export function isJsonContentType(req: Request): boolean {
  const ct = req.headers.get("content-type");
  return !!ct && ct.split(";")[0].trim().toLowerCase() === "application/json";
}

/**
 * L3: origin for share links, from the raw host header only (never
 * x-forwarded-*). https everywhere except localhost.
 */
export function shareOrigin(rawHost: string | null | undefined): string {
  const host = cleanHost(rawHost) || "ekuzo.gg";
  const local = host === "localhost" || host.startsWith("localhost:") || host.startsWith("127.0.0.1");
  return `${local ? "http" : "https"}://${host}`;
}
