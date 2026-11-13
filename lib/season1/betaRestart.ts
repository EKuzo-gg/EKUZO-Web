import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";
import { deployContext } from "./mode";
import { refSecret } from "./refcookie";
import { RESTART_TOKEN_RE } from "./betaRestartCookies";

export * from "./betaRestartCookies";

/**
 * The beta restart link: a row id and a signature, nothing readable.
 *   token = b64url(row id, 16 bytes) + b64url(HMAC-SHA256(key, "v1|" + rowId + "|" + sessionId))
 * The signature covers the row's current session, so a new wizard run for the same email kills the
 * older link. The key comes from S1_REF_SECRET through HKDF under its own label, so it shares
 * nothing with keyHash. Spec: docs/beta-restart-link-2026-11/02-frozen-spec.md.
 */

export const RESTART_VALID_DAYS = 14;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PREVIEW_BASE_RE = /^https:\/\/[a-z0-9-]+--ekuzo\.netlify\.app$/;

function key(): Buffer {
  return Buffer.from(hkdfSync("sha256", refSecret(), "", "ekuzo:beta-restart:v1", 32));
}

function sigBytes(rowId: string, sessionId: string): Buffer {
  return createHmac("sha256", key()).update(`v1|${rowId}|${sessionId}`).digest();
}

/**
 * The token for a row and its current session. null when the id is not a lowercase uuid (never throws
 * for that). Throws only when no secret is configured; callers that must not fail wrap it.
 */
export function restartToken(rowId: string, sessionId: string): string | null {
  if (typeof rowId !== "string" || !UUID_RE.test(rowId)) return null;
  const idPart = Buffer.from(rowId.replace(/-/g, ""), "hex").toString("base64url");
  return idPart + sigBytes(rowId, sessionId).toString("base64url");
}

/** The row id a token names, or null for a wrong shape or a non-canonical encoding. Checks nothing secret; never throws. */
export function parseRestartToken(token: unknown): string | null {
  if (typeof token !== "string" || !RESTART_TOKEN_RE.test(token)) return null;
  const idPart = token.slice(0, 22);
  const sigPart = token.slice(22);
  const id = Buffer.from(idPart, "base64url");
  const sig = Buffer.from(sigPart, "base64url");
  if (id.length !== 16 || sig.length !== 32) return null;
  // Reject encodings with stray low bits: one token per row and session, nothing else decodes the same.
  if (id.toString("base64url") !== idPart || sig.toString("base64url") !== sigPart) return null;
  const h = id.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * True when the token is the signature for this row and session. Constant-time compare of the decoded
 * bytes. false for any malformed token or a token that names another row. Throws only when no secret
 * is configured.
 */
export function verifyRestartToken(token: unknown, rowId: string, sessionId: string): boolean {
  const named = parseRestartToken(token);
  if (!named || typeof rowId !== "string" || named !== rowId.toLowerCase()) return false;
  const given = Buffer.from((token as string).slice(22), "base64url");
  const expected = sigBytes(named, sessionId);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * The origin a link written to Klaviyo starts with. Production context: https://ekuzo.gg. A Netlify
 * deploy preview or branch deploy: its own DEPLOY_PRIME_URL when that is an `--ekuzo.netlify.app`
 * address. Anything else: null, and the caller leaves the property out.
 */
export function restartLinkBase(env?: Record<string, string | undefined>): string | null {
  const e = env ?? process.env;
  if (deployContext(e) === "production") return "https://ekuzo.gg";
  const prime = (e.DEPLOY_PRIME_URL ?? "").trim();
  return PREVIEW_BASE_RE.test(prime) ? prime : null;
}

/** "j•••@gmail.com": the first character of the local part, three dots, the full domain. */
export function maskEmail(email: string): string {
  const s = typeof email === "string" ? email.trim() : "";
  const at = s.lastIndexOf("@");
  if (at <= 0 || at === s.length - 1) return "•••";
  const first = Array.from(s.slice(0, at))[0] ?? "";
  return `${first}•••@${s.slice(at + 1)}`;
}
