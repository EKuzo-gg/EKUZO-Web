import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed referral cookie (slice 2, T4/T15). Value: "<code>.<b64url hmac-sha256(code)>".
 * Callers ignore unsigned or tampered values (verifyRef returns null).
 * The secret is never logged.
 */

export const REF_COOKIE_NAME = "s1_ref";
export const REF_COOKIE_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

/** Constant cookie attributes: Path=/, HttpOnly, SameSite=Lax, Secure, Max-Age 14 days. */
export const REF_COOKIE = {
  name: REF_COOKIE_NAME,
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  maxAge: REF_COOKIE_MAX_AGE_SECONDS,
} as const;

/**
 * S1_REF_SECRET. The S1_STRIPE_WEBHOOK_SECRET fallback is allowed only while the
 * Stripe key is not live (security review L4: one secret for two jobs, and a
 * webhook rotation would void every invite cookie). Throws when nothing usable
 * is set; callers render nameless, ignore the cookie or fail closed.
 */
export function refSecret(): string {
  if (process.env.S1_REF_SECRET) return process.env.S1_REF_SECRET;
  if ((process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_")) {
    throw new Error("S1_REF_SECRET is required with a live Stripe key");
  }
  const s = process.env.S1_STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error("S1_REF_SECRET (or S1_STRIPE_WEBHOOK_SECRET) is not set");
  return s;
}

function mac(code: string, secret: string): string {
  return createHmac("sha256", secret).update(code).digest("base64url");
}

export function signRef(code: string, secret: string): string {
  return `${code}.${mac(code, secret)}`;
}

/** Returns the code when the signature is valid, else null. Constant-time compare. */
export function verifyRef(value: string | null | undefined, secret: string): string | null {
  if (typeof value !== "string" || value.length > 128) return null;
  const i = value.lastIndexOf(".");
  if (i <= 0 || i === value.length - 1) return null;
  const code = value.slice(0, i);
  if (!/^[A-Za-z0-9]+$/.test(code)) return null;
  const given = Buffer.from(value.slice(i + 1), "utf8");
  const expected = Buffer.from(mac(code, secret), "utf8");
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? code : null;
}

/** Set-Cookie header value for a signed ref (use with the REF_COOKIE attributes). */
export function refSetCookieHeader(signedValue: string): string {
  return `${REF_COOKIE.name}=${signedValue}; Path=${REF_COOKIE.path}; Max-Age=${REF_COOKIE.maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

/** Set-Cookie header value that clears the cookie (T9 Remove). */
export function refClearCookieHeader(): string {
  return `${REF_COOKIE.name}=; Path=${REF_COOKIE.path}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
