import { ORIGIN_VALUES, type Origin } from "@/lib/originClassifier";

/**
 * Season 01 attribution (analytics spec S5, S6; resolution C3, C17; money red
 * team 7 and 8; ops red team 5 and 6). Pure: no Next, no network, no database,
 * so middleware (edge) and the commit route (node) share it and it is unit
 * tested on its own.
 *
 * - Last click: the HttpOnly `ekuzo_lc` cookie, written by middleware on any
 *   request that carries a kept parameter, overwritten by each new click.
 * - Order attribution: `{src, lc, first_touch, fbp, fbc}` on s1_orders, built
 *   at commit from cookies. Never the key `origin` (OrderCtx.origin means the
 *   test request origin). Never an input to price or invite.
 */

export const LC_COOKIE = "ekuzo_lc";
export const LC_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"] as const;
export const CLICK_ID_KEYS = ["gclid", "fbclid"] as const;
/** The eight kept parameters (spec S2, S5). */
export const LC_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS] as const;
export type LcKey = (typeof LC_KEYS)[number];

export const UTM_MAX = 160;
export const CLICK_ID_MAX = 512;
export const PATH_MAX = 128;
/** Whole cookie value, as encoded on the wire (Next percent-encodes it). */
export const LC_MAX_BYTES = 2048;
/** A raw cookie longer than this is not parsed at all. */
const RAW_PARSE_MAX = 4096;

/** When the cookie is over budget, keys are dropped in this order (utm_term first, C3). */
const DROP_ORDER: LcKey[] = ["utm_term", "utm_id", "gclid", "utm_medium", "utm_source", "utm_content", "utm_campaign", "fbclid"];

export type LastClick = Partial<Record<LcKey, string>> & { path: string; ts: number };

export interface OrderAttribution {
  src: string | null;
  lc?: LastClick | null;
  first_touch?: Origin | null;
  fbp?: string | null;
  fbc?: string | null;
}

/** Money red team 8: validated before write and before send; anything else is dropped. */
export const FBP_RE = /^fb\.\d\.\d{13}\.\d{1,20}$/;
export const FBC_RE = /^fb\.\d\.\d{13}\.[A-Za-z0-9_-]{1,255}$/;

export function validFbp(v: unknown): string | null {
  return typeof v === "string" && FBP_RE.test(v) ? v : null;
}
export function validFbc(v: unknown): string | null {
  return typeof v === "string" && FBC_RE.test(v) ? v : null;
}

const CLICK_ID_RE = new RegExp(`^[\\x21-\\x7e]{1,${CLICK_ID_MAX}}$`);

/** utm_*: printable ASCII only (everything else removed), trimmed, at most 160 chars. */
function cleanUtm(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/[^\x20-\x7e]/g, "").trim().slice(0, UTM_MAX).trim();
  return s || null;
}

/** gclid, fbclid: kept whole (printable ASCII, no spaces, up to 512) or dropped whole; never cut. */
function cleanClickId(v: unknown): string | null {
  return typeof v === "string" && CLICK_ID_RE.test(v) ? v : null;
}

function cleanValue(key: LcKey, v: unknown): string | null {
  return (CLICK_ID_KEYS as readonly string[]).includes(key) ? cleanClickId(v) : cleanUtm(v);
}

/** Landing path: `/crew/<code>` becomes `/crew/` (the code never leaves); printable ASCII, 128 max. */
export function cleanPath(p: unknown): string {
  if (typeof p !== "string" || !p.startsWith("/")) return "/";
  if (/^\/crew(\/|$)/i.test(p)) return "/crew/";
  const s = p.replace(/[^\x21-\x7e]/g, "").slice(0, PATH_MAX);
  return s || "/";
}

/** True when the request carries any of the eight kept parameters (raw presence, before cleaning). */
export function hasKeptParam(params: URLSearchParams): boolean {
  return LC_KEYS.some((k) => params.has(k));
}

/** The encoded size the cookie value will have on the wire. */
export function encodedSize(value: string): number {
  return encodeURIComponent(value).length;
}

/** Re-whitelists and re-sanitizes; drops keys until the encoded JSON fits. null when no kept key survives. */
function finish(fields: Partial<Record<LcKey, string>>, path: string, ts: number): { lc: LastClick; value: string } | null {
  const lc: LastClick = { path, ts };
  for (const k of LC_KEYS) if (fields[k]) lc[k] = fields[k];
  if (!LC_KEYS.some((k) => lc[k])) return null;
  let value = JSON.stringify(lc);
  for (const k of DROP_ORDER) {
    if (encodedSize(value) <= LC_MAX_BYTES) break;
    delete lc[k];
    value = JSON.stringify(lc);
  }
  if (encodedSize(value) > LC_MAX_BYTES || !LC_KEYS.some((k) => lc[k])) return null;
  return { lc, value };
}

/**
 * Middleware: the `ekuzo_lc` value for this request, or null (no kept
 * parameter, or none survives cleaning: a visit without kept parameters never
 * overwrites an earlier click).
 */
export function buildLastClick(params: URLSearchParams, pathname: string, now: number = Date.now()): { lc: LastClick; value: string } | null {
  if (!hasKeptParam(params)) return null;
  const fields: Partial<Record<LcKey, string>> = {};
  for (const k of LC_KEYS) {
    const v = cleanValue(k, params.get(k));
    if (v) fields[k] = v;
  }
  return finish(fields, cleanPath(pathname), Math.floor(now));
}

/** Plausible ms timestamp (13 digits, not far in the future). */
function cleanTs(v: unknown, now: number): number | null {
  if (typeof v !== "number" || !Number.isInteger(v)) return null;
  if (v < 1_000_000_000_000 || v > 9_999_999_999_999 || v > now + 86_400_000) return null;
  return v;
}

/**
 * Commit: parses a raw (percent-encoded) `ekuzo_lc` cookie value. Any failure
 * (bad encoding, non-JSON, array, nested object, no kept key, too large) is null.
 */
export function parseLastClick(raw: string | null | undefined, now: number = Date.now()): LastClick | null {
  if (!raw || raw.length > RAW_PARSE_MAX) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const v: unknown = JSON.parse(decoded);
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const o = v as Record<string, unknown>;
    const ts = cleanTs(o.ts, now);
    if (ts === null) return null;
    const fields: Partial<Record<LcKey, string>> = {};
    for (const k of LC_KEYS) {
      const c = cleanValue(k, o[k]);
      if (c) fields[k] = c;
    }
    return finish(fields, cleanPath(o.path), ts)?.lc ?? null;
  } catch {
    return null;
  }
}

/** First touch: the `ekuzo_origin` cookie only when it is one of the classifier's buckets. */
export function cleanFirstTouch(raw: string | null | undefined): Origin | null {
  if (!raw) return null;
  let v = raw;
  try {
    v = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return (ORIGIN_VALUES as readonly string[]).includes(v) ? (v as Origin) : null;
}

/** One cookie from a Cookie header, first match, raw (still encoded). */
export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/**
 * The order's attribution from the request's Cookie header. Never throws: any
 * failure stores `{src}` alone. fbc prefers the Pixel's `_fbc` cookie, then one
 * built from the last click's fbclid with the click time in milliseconds.
 */
export function orderAttribution(cookieHeader: string | null | undefined, src: string | null, now: number = Date.now()): OrderAttribution {
  try {
    const lc = parseLastClick(readCookie(cookieHeader, LC_COOKIE), now);
    const first_touch = cleanFirstTouch(readCookie(cookieHeader, "ekuzo_origin"));
    const fbp = validFbp(readCookie(cookieHeader, "_fbp"));
    const fbc = validFbc(readCookie(cookieHeader, "_fbc")) ?? (lc?.fbclid ? validFbc(`fb.1.${lc.ts}.${lc.fbclid}`) : null);
    return { src: src ?? null, lc, first_touch, fbp, fbc };
  } catch {
    return { src: src ?? null };
  }
}
