// TEMPORARY STUB (Atlas). Delete once lib/season1/fulfil.ts (Relay) exists and
// app/season1/join/welcome/fulfil-import.ts re-exports from it.
export async function fulfil(
  _paymentIntentId: string,
  _source: "webhook" | "welcome",
): Promise<{
  orderPublicId: string | null;
  claimed: boolean;
  status: "paid" | "pending" | "failed" | "not_season1";
}> {
  return { orderPublicId: null, claimed: false, status: "pending" };
}

// Stub for Relay's fulfilFromReturn(piId, clientSecret) until lib/season1/fulfil.ts lands.
export async function fulfilFromReturn(
  _paymentIntentId: string,
  _clientSecret: string,
): Promise<{ orderId: string | null; viewToken: string | null }> {
  return { orderId: null, viewToken: null };
}
