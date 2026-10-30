import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Auth for POST /api/season1/drain (analytics C1). Kept out of the route file
 * because Next allows only its own exports (POST, runtime, ...) there.
 */
export const DRAIN_HEADER = "x-s1-drain-secret";
export const DRAIN_LIMIT = 50;
export const DRAIN_BUDGET_MS = 8000;

const digest = (v: string) => createHash("sha256").update(v, "utf8").digest();

/** Constant-time equality of two secrets (fixed-length digests, so the length does not leak). */
export function secretMatches(given: string | null | undefined, expected: string): boolean {
  if (given == null || !expected) return false;
  return timingSafeEqual(digest(given), digest(expected));
}
