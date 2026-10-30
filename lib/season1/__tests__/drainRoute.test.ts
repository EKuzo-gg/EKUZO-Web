import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Analytics C1 (money red team 2, ops red team 2) and S9, no database:
 *  - POST /api/season1/drain: 503 without S1_DRAIN_SECRET, 401 without or with a
 *    wrong x-s1-drain-secret, else drainOutbox({limit: 50, budgetMs: 8000}) and
 *    counts only.
 *  - The welcome route awaits no drain; it schedules an order-scoped one.
 *  - The Netlify scheduled function only POSTs to the route.
 */
const ROOT = join(import.meta.dirname, "..", "..", "..");
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const sent: { query: string; params: unknown[] }[] = [];
const SECRET = "unit-drain-secret-0123456789";

const call = async (headers: Record<string, string> = {}) => {
  const { POST } = await import("../../../app/api/season1/drain/route");
  const r = await POST(new Request("http://localhost:3103/api/season1/drain", { method: "POST", headers }));
  return { status: r.status, body: (await r.json()) as Record<string, unknown>, headers: r.headers };
};

describe("drain route auth and shape (C1)", () => {
  before(() => {
    for (const k of ["S1_DRAIN_SECRET", "DATABASE_URL"]) saved[k] = process.env[k];
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
      if (!String(url).includes("neon.tech")) throw new Error("unit: unexpected network call");
      const body = JSON.parse(String(init?.body ?? "{}")) as { query: string; params: unknown[] };
      sent.push({ query: body.query, params: body.params });
      // Stuck recovery and the select: nothing to send.
      return new Response(JSON.stringify({ command: "SELECT", rowCount: 0, fields: [], rows: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
  });
  after(() => {
    globalThis.fetch = realFetch;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  beforeEach(() => {
    sent.length = 0;
    process.env.S1_DRAIN_SECRET = SECRET;
  });

  it("503 not_configured when S1_DRAIN_SECRET is unset or blank, and no drain runs", async () => {
    for (const v of [undefined, "", "   "]) {
      if (v === undefined) delete process.env.S1_DRAIN_SECRET;
      else process.env.S1_DRAIN_SECRET = v;
      const r = await call({ "x-s1-drain-secret": "" });
      assert.equal(r.status, 503);
      assert.deepEqual(r.body, { error: "not_configured" });
    }
    assert.equal(sent.length, 0);
  });

  it("401 without the header, with a wrong secret, a prefix, or the secret in another header", async () => {
    const cases: Record<string, string>[] = [
      {},
      { "x-s1-drain-secret": "wrong" },
      { "x-s1-drain-secret": SECRET.slice(0, -1) },
      { "x-s1-drain-secret": SECRET + "x" },
      { authorization: `Bearer ${SECRET}` },
    ];
    for (const h of cases) {
      const r = await call(h);
      assert.equal(r.status, 401, JSON.stringify(h));
      assert.deepEqual(r.body, { error: "unauthorized" });
    }
    assert.equal(sent.length, 0, "no database call before auth");
  });

  it("200 with the secret: drains with limit 50 and returns counts only", async () => {
    const r = await call({ "x-s1-drain-secret": SECRET });
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body).sort(), ["considered", "counts", "timedOut"]);
    assert.equal(r.body.considered, 0);
    assert.equal(r.headers.get("cache-control"), "no-store");
    const select = sent.find((x) => x.query.includes("from s1_outbox") && x.query.includes("order by created_at"));
    assert.ok(select, "the outbox select ran");
    assert.deepEqual(select.params, ["50"], "global drain, limit 50 (no order filter)");
    assert.ok(sent.some((x) => x.query.includes("stuck_sending")), "stuck recovery ran");
  });

  it("secretMatches: equal only on the exact secret", async () => {
    const { secretMatches, DRAIN_LIMIT, DRAIN_BUDGET_MS } = await import("../drainAuth");
    assert.equal(secretMatches(SECRET, SECRET), true);
    assert.equal(secretMatches(SECRET + " ", SECRET), false);
    assert.equal(secretMatches(null, SECRET), false);
    assert.equal(secretMatches("", ""), false, "an empty expected secret never matches");
    assert.equal(DRAIN_LIMIT, 50);
    assert.equal(DRAIN_BUDGET_MS, 8000);
  });
});

describe("welcome drain (S9, C1)", () => {
  it("the welcome route awaits no drain and schedules an order-scoped one", () => {
    const src = readFileSync(join(ROOT, "app", "season1", "join", "welcome", "route.ts"), "utf8");
    assert.doesNotMatch(src, /drainOutbox/, "no direct drain in the welcome route");
    assert.match(src, /scheduleOrderDrain\(drainRef\)/);
    assert.doesNotMatch(src, /await\s+scheduleOrderDrain/);
  });

  it("scheduleOrderDrain hands an order-scoped task to after() without running it", async () => {
    const { scheduleOrderDrain, ORDER_DRAIN } = await import("../orderDrain");
    const tasks: (() => Promise<unknown>)[] = [];
    assert.equal(scheduleOrderDrain("ordref2345", (t) => void tasks.push(t)), "scheduled");
    assert.equal(tasks.length, 1, "registered, not run");
    assert.deepEqual(ORDER_DRAIN, { limit: 20, budgetMs: 3000 });
    assert.equal(scheduleOrderDrain(null, (t) => void tasks.push(t)), "skipped");
    assert.equal(tasks.length, 1);
  });

  it("the scheduled task drains only that order (order filter in the select)", async () => {
    const { scheduleOrderDrain } = await import("../orderDrain");
    const prevFetch = globalThis.fetch;
    const prevDb = process.env.DATABASE_URL;
    const q: { query: string; params: unknown[] }[] = [];
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    globalThis.fetch = (async (_u: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { query: string; params: unknown[] };
      q.push(body);
      return new Response(JSON.stringify({ command: "SELECT", rowCount: 0, fields: [], rows: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    try {
      let task: (() => Promise<unknown>) | null = null;
      scheduleOrderDrain("ordref2345", (t) => {
        task = t;
      });
      await task!();
      const select = q.find((x) => x.query.includes("from s1_outbox") && x.query.includes("order by created_at"))!;
      assert.match(select.query, /order_public_id/);
      assert.deepEqual(select.params, ["20", "ordref2345"]);
    } finally {
      globalThis.fetch = prevFetch;
      if (prevDb === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = prevDb;
    }
  });

  it("outside a request scope, the real after() throws and the call is skipped (never breaks the page)", async () => {
    const { scheduleOrderDrain } = await import("../orderDrain");
    assert.equal(scheduleOrderDrain("ordref2345"), "skipped");
  });

  it("the Netlify scheduled function runs every 2 minutes and only POSTs to the route with the secret", () => {
    const src = readFileSync(join(ROOT, "netlify", "functions", "s1-drain.mts"), "utf8");
    assert.match(src, /export const config = \{\s*schedule: "\*\/2 \* \* \* \*",?\s*\}/);
    assert.match(src, /\$\{base\}\/api\/season1\/drain/);
    assert.match(src, /process\.env\.URL/);
    assert.match(src, /"x-s1-drain-secret": secret/);
    assert.doesNotMatch(src, /drainOutbox|DATABASE_URL|neon/i);
  });
});
