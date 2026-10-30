import { after } from "next/server";
import { drainOutbox } from "./outbox";
import { logStep } from "./rules";

/**
 * Welcome speed (analytics S9, C1; D3): the welcome page never waits on a send.
 * It registers an ORDER-SCOPED drain with Next `after()`, which runs once the
 * response has gone (Netlify: context.waitUntil). This is only an accelerator:
 * the Stripe webhook drain and the 2-minute scheduled drain
 * (/api/season1/drain) are the senders of record, and stuck recovery picks up
 * anything `after()` leaves half done.
 */
export const ORDER_DRAIN = { limit: 20, budgetMs: 3000 } as const;

type Scheduler = (task: () => Promise<unknown>) => void;

export function scheduleOrderDrain(
  orderPublicId: string | null | undefined,
  schedule: Scheduler = after,
): "scheduled" | "skipped" {
  if (!orderPublicId) return "skipped";
  try {
    schedule(() => drainOutbox({ orderId: orderPublicId, ...ORDER_DRAIN }).catch(() => null));
    return "scheduled";
  } catch {
    // Outside a request scope (unit tests) or a runtime without after(): the
    // webhook and the scheduled drain still send.
    logStep("welcome.drain", orderPublicId, false, "no_after");
    return "skipped";
  }
}
