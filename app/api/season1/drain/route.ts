import { drainOutbox } from "@/lib/season1/outbox";
import { DRAIN_BUDGET_MS, DRAIN_HEADER, DRAIN_LIMIT, secretMatches } from "@/lib/season1/drainAuth";
import { SECURITY_HEADERS } from "@/lib/season1/httpGuard";
import { logStep } from "@/lib/season1/rules";

/**
 * POST /api/season1/drain (analytics C1; money red team 2, ops red team 2).
 * The scheduled sender: drains the Season 01 outbox (oldest first, stuck
 * recovery included) so a send the webhook missed goes out within minutes.
 * Called every 2 minutes by netlify/functions/s1-drain.mts, and by hand with curl.
 *
 * A Next route (not the Netlify function itself) so the deploy-context guard in
 * getSql sees the inlined S1_DEPLOY_CONTEXT. Auth: header x-s1-drain-secret must
 * equal S1_DRAIN_SECRET (constant-time, compared as sha256 digests so the length
 * does not leak). 503 when the secret is not configured, 401 otherwise. The
 * answer carries counts only: no ids, no order refs.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number): Response {
  const h = new Headers({ "content-type": "application/json", "cache-control": "no-store", ...SECURITY_HEADERS });
  return new Response(JSON.stringify(body), { status, headers: h });
}

export async function POST(req: Request): Promise<Response> {
  const secret = (process.env.S1_DRAIN_SECRET ?? "").trim();
  if (!secret) {
    logStep("drain.auth", null, false, "not_configured");
    return json({ error: "not_configured" }, 503);
  }
  if (!secretMatches(req.headers.get(DRAIN_HEADER), secret)) {
    logStep("drain.auth", null, false, "unauthorized");
    return json({ error: "unauthorized" }, 401);
  }
  const s = await drainOutbox({ limit: DRAIN_LIMIT, budgetMs: DRAIN_BUDGET_MS });
  const counts = Object.entries(s.counts)
    .map(([k, n]) => `${k}:${n}`)
    .join(",");
  logStep("drain.run", null, !s.counts.error, counts || "empty");
  return json({ considered: s.considered, counts: s.counts, timedOut: s.timedOut }, 200);
}
