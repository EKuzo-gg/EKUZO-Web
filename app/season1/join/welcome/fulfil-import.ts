// Single adapter between the welcome route and the Season 01 modules.
import { getOrderByViewToken, type OrderView } from "@/lib/season1/db";

export { fulfil, fulfilFromReturn } from "@/lib/season1/fulfil";

export async function orderByToken(token: string): Promise<OrderView | null> {
  return getOrderByViewToken(token);
}
