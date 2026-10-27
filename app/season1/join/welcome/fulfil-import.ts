// Single adapter between the welcome route and Relay's modules, so the route does
// not depend on which file currently provides them.
// TEMPORARY: fulfil and fulfilFromReturn come from the stub; orderByToken falls back to
// the public id lookup until getOrderByViewToken exists in lib/season1/db.ts.
// When Relay's files land: re-export from "@/lib/season1/fulfil", and make
// orderByToken call getOrderByViewToken(token). Then delete lib/season1/fulfil.stub.ts.
import { getOrderByPublicId, type OrderView } from "@/lib/season1/db";

export { fulfil, fulfilFromReturn } from "@/lib/season1/fulfil.stub";

export async function orderByToken(token: string): Promise<OrderView | null> {
  return getOrderByPublicId(token);
}
