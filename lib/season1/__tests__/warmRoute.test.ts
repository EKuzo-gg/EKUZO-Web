import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

/**
 * GET /api/season1/warm (speed pass 10-29). globalThis.fetch is stubbed, so
 * each Neon HTTP round trip is one stub call. No real database or Stripe.
 */
const env: Record<string, string> = {
  STRIPE_SECRET_KEY: "sk_test_unit",
  DATABASE_URL: "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb",
  AWS_REGION: "us-east-2",
};
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const queries: string[] = [];
let GET: (req: Request) => Promise<Response>;

const req = (host = "localhost:3103") => new Request(`http://${host}/api/season1/warm`, { headers: { host } });

describe("warm route", () => {
  before(async () => {
    for (const k of [...Object.keys(env), "S1_COMMIT_MODE"]) saved[k] = process.env[k];
    Object.assign(process.env, env);
    delete process.env.S1_COMMIT_MODE;
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      const { query } = JSON.parse(String(init?.body ?? "{}"));
      queries.push(query);
      return new Response(JSON.stringify({ fields: [{ name: "?column?", dataTypeID: 23 }], rows: [["1"]] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    ({ GET } = await import("../../../app/api/season1/warm/route"));
  });
  after(() => {
    globalThis.fetch = realFetch;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("runs select 1 once, answers 204 no-store with timing only, then skips the DB for 20 s", async () => {
    const r = await GET(req());
    assert.equal(r.status, 204);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("set-cookie"), null);
    assert.equal(r.headers.get("x-frame-options"), "DENY");
    assert.deepEqual(queries, ["select 1"]);
    assert.match(r.headers.get("server-timing") ?? "", /^db;dur=\d+\.\d;desc="ok", app;dur=\d+\.\d/);
    assert.equal(r.headers.get("x-s1-region"), "us-east-2", "test mode shows the function region");
    assert.equal(await r.text(), "");

    const again = await GET(req());
    assert.equal(again.status, 204);
    assert.equal(queries.length, 1, "a second call inside 20 s does not touch the database");
    assert.match(again.headers.get("server-timing") ?? "", /db;dur=0\.0;desc="skip"/);
  });

  it("shows the region only in test mode", async () => {
    process.env.S1_COMMIT_MODE = "off";
    try {
      const r = await GET(req("ekuzo.gg"));
      assert.equal(r.status, 204);
      assert.equal(r.headers.get("x-s1-region"), null);
    } finally {
      delete process.env.S1_COMMIT_MODE;
    }
  });
});
