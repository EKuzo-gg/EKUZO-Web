/**
 * Pure helpers for the visitor location and time zone that /api/season-one
 * records on its Klaviyo events and profile (app/api/season-one/route.ts).
 * No Next.js imports so they can be unit tested with `node --test`
 * (lib/__tests__/season-one-geo.test.ts). None of them ever throws, whatever
 * the input: a throw inside the route's try block would turn a sign-up or a
 * text request into a 502.
 */

/** Only string values are kept (objects and arrays would stringify to junk), trimmed and capped. */
export const text = (v: unknown, max = 120): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Quotes, backslashes, and C0/C1 control characters plus DEL. City and region are interpolated into a
// Discord webhook JSON body after the alert-line change, so none of these may survive.
const JSON_UNSAFE_RE = /["\\\u0000-\u001f\u007f-\u009f]/g;
/** Strip JSON-unsafe characters, then trim, then cap (in that order). */
const safeText = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(JSON_UNSAFE_RE, "").trim().slice(0, max) : "";

const TZ_SHAPE_RE = /^[A-Za-z0-9_+\-/]{1,64}$/;

/**
 * Validated IANA time zone name, or "". String only, at most 64 characters of
 * [A-Za-z0-9_+-/], and accepted by Intl. Returns the canonical name Intl
 * reports (so "america/chicago" becomes "America/Chicago").
 */
export function cleanTz(v: unknown): string {
  try {
    if (typeof v !== "string" || v.length > 64 || !TZ_SHAPE_RE.test(v)) return "";
    const tz = new Intl.DateTimeFormat("en-US", { timeZone: v }).resolvedOptions().timeZone;
    return typeof tz === "string" && TZ_SHAPE_RE.test(tz) ? tz : "";
  } catch {
    return "";
  }
}

/**
 * Names that mean "UTC". Privacy-hardened browsers (Firefox resistFingerprinting, Tor, some in-app
 * webviews) report one of these for everyone, so a browser value in this set is weak evidence.
 */
export const UTC_ALIASES: ReadonlySet<string> = new Set([
  "UTC", "Etc/UTC", "Etc/GMT", "GMT", "Etc/UCT", "UCT", "Etc/Universal", "Universal",
  "Etc/Zulu", "Zulu", "Etc/GMT0", "GMT0", "Etc/Greenwich", "Greenwich",
]);

/**
 * Visitor location from Netlify's `x-nf-geo` header value. Typically
 * base64-encoded JSON ({"city","country":{"code"},"subdivision":{"code"},
 * "postalCode"|"postal_code","timezone",...}); some runtimes send plain JSON.
 * Parsed defensively: base64 first, then raw, any failure = empty fields.
 * Returns geo_country, geo_region, geo_city, geo_postal and geo_tz (validated,
 * or ""). City and region have quotes, backslashes and control characters
 * stripped. No latitude or longitude is ever read.
 */
export function parseGeoHeader(h: string | null): Record<string, string> {
  let g: Record<string, unknown> | null = null;
  try {
    if (typeof h === "string" && h) {
      for (const decode of [(s: string) => Buffer.from(s, "base64").toString("utf8"), (s: string) => s]) {
        try {
          const j = JSON.parse(decode(h));
          if (j && typeof j === "object" && !Array.isArray(j)) { g = j; break; }
        } catch {
          // not this encoding; try the next
        }
      }
    }
    // Accepts {code: "US"} objects or a bare string for country and subdivision.
    const codeOf = (v: unknown): unknown => (v && typeof v === "object" ? (v as Record<string, unknown>).code : v);
    return {
      geo_country: text(codeOf(g?.country), 8),
      geo_region: safeText(codeOf(g?.subdivision), 8),
      geo_city: safeText(g?.city, 80),
      geo_postal: text(g?.postalCode ?? g?.postal_code, 12),
      geo_tz: cleanTz(g?.timezone),
    };
  } catch {
    return { geo_country: "", geo_region: "", geo_city: "", geo_postal: "", geo_tz: "" };
  }
}

/**
 * The one time zone to record: `tz`, and where it came from: `tz_source`.
 * The browser's zone wins (it is the device, not an IP guess), except that a
 * UTC alias from the browser loses to a valid non-UTC geo zone. Else the geo
 * zone, else "".
 */
export function tzProps(bodyTz: unknown, geo: unknown): { tz: string; tz_source: "browser" | "geo" | "" } {
  try {
    const b = cleanTz(bodyTz);
    const g = cleanTz((geo as { geo_tz?: unknown } | null | undefined)?.geo_tz);
    if (b && !(UTC_ALIASES.has(b) && g && !UTC_ALIASES.has(g))) return { tz: b, tz_source: "browser" };
    if (g) return { tz: g, tz_source: "geo" };
    if (b) return { tz: b, tz_source: "browser" };
    return { tz: "", tz_source: "" };
  } catch {
    return { tz: "", tz_source: "" };
  }
}

/**
 * Klaviyo profile properties for where the family is: season1_city,
 * season1_region, season1_tz, each only when non-empty, so a request without
 * geo never blanks a value an earlier request stored.
 */
export function geoProfileProps(geo: unknown, tz: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const g = (geo && typeof geo === "object" ? geo : {}) as Record<string, unknown>;
    const city = text(g.geo_city, 80);
    const region = text(g.geo_region, 8);
    const zone = cleanTz(tz);
    if (city) out.season1_city = city;
    if (region) out.season1_region = region;
    if (zone) out.season1_tz = zone;
  } catch {
    // return whatever was collected
  }
  return out;
}
