import { getSql } from "@/lib/season1/db";
import { getStripe } from "@/lib/season1/stripe";
import { currentMode } from "@/lib/season1/mode";
import { SECURITY_HEADERS } from "@/lib/season1/httpGuard";
import { errCode, logStep } from "@/lib/season1/rules";
import { takeColdFlag } from "@/lib/season1/serverTiming";

/**
 * GET /api/season1/warm (speed pass 10-29). The join, crew and sign-up pages
 * call this once on load, without waiting for it, so the function instance and
 * the Neon compute (scale-to-zero after about 5 min idle) are awake before the
 * parent taps pay. Reads nothing, writes nothing, takes no input, sets no
 * cookie. `select 1` runs at most once per WARM_EVERY_MS per function instance;
 * any other call answers 204 straight away, so hammering it costs a no-op.
 * Answers 204 even when the database is down: a page never waits on it.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const WARM_EVERY_MS = 20_000;
let lastPing = 0;

export async function GET(req: Request): Promise<Response> {
  const t0 = performance.now();
  const cold = takeColdFlag();
  const h = new Headers({ "cache-control": "no-store", ...SECURITY_HEADERS });
  let db = "skip";
  let dbMs = 0;
  const now = Date.now();
  if (now - lastPing >= WARM_EVERY_MS) {
    lastPing = now;
    const d0 = performance.now();
    try {
      await getSql().query("select 1", []);
      db = "ok";
    } catch (e) {
      db = "error";
      lastPing = 0;
      logStep("warm.db", null, false, errCode(e));
    }
    dbMs = performance.now() - d0;
    // Builds the Stripe client (no network call) so the commit's first use is ready.
    try {
      getStripe();
    } catch {
      // no key on this deploy: nothing to warm
    }
  }
  const parts = [`db;dur=${dbMs.toFixed(1)};desc="${db}"`, `app;dur=${(performance.now() - t0).toFixed(1)}`];
  if (cold) parts.push(`cold;desc="first request on this function instance"`);
  h.set("server-timing", parts.join(", "));
  // Test mode only: which AWS region served this (Neon is us-east-2). Not set on live.
  if (currentMode(req.headers.get("host")) === "test" && process.env.AWS_REGION) h.set("x-s1-region", process.env.AWS_REGION);
  return new Response(null, { status: 204, headers: h });
}
