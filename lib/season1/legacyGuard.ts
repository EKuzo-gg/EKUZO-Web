/**
 * The legacy camps/EKUZO100 Stripe webhook must not process Season 01
 * PaymentIntents (they have their own webhook) nor anything lacking a
 * parent_email (the legacy handler cannot fulfil it).
 */
export function shouldSkipLegacy(pi: { metadata?: Record<string, string> | null }): boolean {
  const md = pi?.metadata;
  if (!md) return true;
  if (md.product === "season1") return true;
  const email = md.parent_email;
  return typeof email !== "string" || email.trim() === "";
}
