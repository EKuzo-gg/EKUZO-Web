import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { OFFER } from "./offer";

/**
 * Pure money-path rules shared by the commit API, fulfil and the webhook.
 * No I/O here (tested in __tests__/rules.test.ts).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function ms(v: Date | string | number): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  return new Date(v).getTime();
}

/** RT8: created before the jersey cutoff AND paid within 24 h of creation. */
export function jerseyEligible(piCreatedAt: Date | string | number, paidAt: Date | string | number): boolean {
  const c = ms(piCreatedAt);
  const p = ms(paidAt);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return false;
  return c < Date.parse(OFFER.jerseyCutoffAt) && p - c <= DAY_MS;
}

/** RT8: paid at or after closeAt. */
export function lateConfirm(paidAt: Date | string | number): boolean {
  return ms(paidAt) >= Date.parse(OFFER.closeAt);
}

/** Ops 4: full means the charge's total refunded equals the charge amount. */
export function isFullRefund(charge: { amount: number; amount_refunded: number }): boolean {
  return charge.amount > 0 && charge.amount_refunded >= charge.amount;
}

/** Order-independent signature of a kid set (exact NFC name + age), for attempt reuse. */
export function kidsSignature(kids: { firstName: string; age: number | null }[]): string {
  return kids
    .map((k) => `${k.firstName.normalize("NFC").trim()}\u0000${k.age ?? ""}`)
    .sort()
    .join("\u0001");
}

/** 32 random bytes, base64url (43 chars). */
export function newViewToken(): string {
  return randomBytes(32).toString("base64url");
}

/** sha256, base64url. */
export function hashViewToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("base64url");
}

/** Constant-time string equality (length leaks only). */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(String(a), "utf8");
  const y = Buffer.from(String(b), "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/** Short stable hash for rate-limit keys, so raw emails never land in s1_rate_limits. */
export function keyHash(v: string): string {
  return createHash("sha256").update(v.trim().toLowerCase(), "utf8").digest("base64url").slice(0, 22);
}

/** Client attempt id: UUID-ish, 8 to 64 chars of [A-Za-z0-9-]. */
export function cleanAttemptId(v: unknown): string | null {
  return typeof v === "string" && /^[A-Za-z0-9-]{8,64}$/.test(v) ? v : null;
}

/** The s1_order cookie (RT11, Path=/season1, 30 days). */
export function viewTokenCookie(token: string): string {
  return `s1_order=${token}; Path=/season1; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}

/**
 * Ops 8: one PII-free log line per step. Order is a public id; err is a
 * short code. Anything else is dropped.
 */
export function stepLine(step: string, order: string | null | undefined, ok: boolean, err?: string | null): string {
  const clean = (s: string) => s.replace(/[^A-Za-z0-9_.:-]/g, "").slice(0, 60);
  return `s1 step=${clean(step)} order=${order ? clean(order) : "-"} ok=${ok}${err ? ` err=${clean(err)}` : ""}`;
}

export function logStep(step: string, order: string | null | undefined, ok: boolean, err?: string | null): void {
  const line = stepLine(step, order, ok, err);
  if (ok) console.log(line);
  else console.error(line);
}

/** A short code for an error, never its message (messages can carry PII). */
export function errCode(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as { code?: unknown; type?: unknown; name?: unknown };
    if (typeof o.code === "string") return o.code;
    if (typeof o.type === "string") return o.type;
    if (typeof o.name === "string") return o.name;
  }
  return "error";
}
