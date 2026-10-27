/**
 * The legacy camps/EKUZO100 Stripe webhook must not process Season 01
 * PaymentIntents (they have their own webhook), anything lacking a
 * parent_email (the legacy handler cannot fulfil it), or any PI whose
 * product is set but is not one the legacy handler knows (RT14: typos and
 * future products). A missing product with a parent_email keeps today's
 * camps behaviour.
 */
export const LEGACY_PRODUCTS: readonly string[] = ["camps", "ekuzo100", "ekuzo101", "teams"];

export function shouldSkipLegacy(pi: { metadata?: Record<string, string> | null }): boolean {
  const md = pi?.metadata;
  if (!md) return true;
  const product = md.product;
  if (product === "season1") return true;
  if (typeof product === "string" && product !== "" && !LEGACY_PRODUCTS.includes(product)) return true;
  const email = md.parent_email;
  return typeof email !== "string" || email.trim() === "";
}
