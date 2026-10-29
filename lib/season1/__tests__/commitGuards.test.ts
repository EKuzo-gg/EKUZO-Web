import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { isOpen } from "../offer";

/**
 * Commit route guards without a database (security review L1, L7; Sentry final
 * D5). globalThis.fetch is stubbed: the Neon HTTP driver calls it for every
 * query, so the call count is the number of DB round trips (rate-limit hits
 * first). The stub fails every call, so a validated request ends at the
 * limiter with a fail-closed 503.
 */
const env: Record<string, string> = {
  STRIPE_SECRET_KEY: "sk_test_unit",
  DATABASE_URL: "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb",
  S1_REF_SECRET: "unit-ref-secret",
};
const saved: Record<string, string | undefined> = {};
let calls = 0;
const realFetch = globalThis.fetch;
/** When set, the stub answers Neon HTTP queries instead of failing them. */
let responder: ((query: string, params: unknown[]) => { fields: string[]; rows: unknown[][] }) | null = null;
const sent: { query: string; params: unknown[] }[] = [];

let POST: (req: Request) => Promise<Response>;

/** hitPair answer: both counts 1 (within limits). */
const PAIR_OK = { fields: ["a_count", "b_count"], rows: [[1, 1]] };

const valid = () => ({
  email: "unit@example.com",
  parentFirstName: "Unit",
  phone: "",
  kids: [{ firstName: "Ava", age: 11 }],
  consent: true,
  company: "",
  attemptId: randomUUID(),
  expectedCents: 10000,
});

function call(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost:3103/api/season1/commit", {
      method: "POST",
      headers: { host: "localhost:3103", "content-type": "application/json", "x-nf-client-connection-ip": "198.51.100.7", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("commit route guards (no DB)", { skip: isOpen(new Date()) ? false : "commit window closed" }, () => {
  before(async () => {
    for (const k of [...Object.keys(env), "S1_COMMIT_MODE", "S1_DEPLOY_CONTEXT", "CONTEXT"]) saved[k] = process.env[k];
    Object.assign(process.env, env);
    delete process.env.S1_COMMIT_MODE;
    // Neon HTTP result shape (array mode): 23 = int4 for numbers, 114 = json for objects, 25 = text; null stays null.
    const result = (query: string, params: unknown[]) => {
      sent.push({ query, params });
      const r = responder!(query, params);
      const types = r.fields.map((_n, i) => {
        const v = r.rows[0]?.[i];
        return typeof v === "number" ? 23 : v !== null && typeof v === "object" ? 114 : 25;
      });
      return {
        fields: r.fields.map((name, i) => ({ name, dataTypeID: types[i] })),
        rows: r.rows.map((row) => row.map((v) => (v === null ? null : typeof v === "object" ? JSON.stringify(v) : String(v)))),
      };
    };
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      calls++;
      if (!responder) throw new TypeError("unit: network disabled");
      const body = JSON.parse(String(init?.body ?? "{}"));
      // sql.transaction([...]) sends every statement in one request (one round trip).
      const out = Array.isArray(body.queries)
        ? { results: body.queries.map((x: { query: string; params: unknown[] }) => result(x.query, x.params)) }
        : result(body.query, body.params);
      return new Response(JSON.stringify(out), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    ({ POST } = await import("../../../app/api/season1/commit/route"));
  });
  after(() => {
    globalThis.fetch = realFetch;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  beforeEach(() => {
    calls = 0;
    responder = null;
    sent.length = 0;
  });

  it("D5: requests rejected by validation (422) never touch the limiters", async () => {
    const bad: unknown[] = [
      "not json",
      "[]",
      { ...valid(), company: "Acme" },
      { ...valid(), email: "nope" },
      { ...valid(), kids: [{ firstName: "Ava", age: 8 }] },
      { ...valid(), consent: false },
      { ...valid(), expectedCents: "100" },
      { ...valid(), attemptId: "short" },
      "x".repeat(16_001),
    ];
    for (const b of bad) {
      const r = await call(b);
      assert.equal(r.status, 422, String(typeof b === "string" ? b.slice(0, 20) : JSON.stringify(b).slice(0, 80)));
    }
    assert.equal(calls, 0, "no DB call (no rate-limit hit) for any 422");
  });

  it("D5: a request that passes validation reaches the per-IP limiter, which fails closed", async () => {
    const r = await call(valid());
    assert.equal(r.status, 503);
    assert.deepEqual(await r.json(), { error: "try_again" });
    assert.ok(calls >= 1, "the limiter was called");
  });

  it("L1: cross-site requests are 403 before anything else", async () => {
    const cases: Record<string, string>[] = [{ "sec-fetch-site": "cross-site" }, { origin: "https://evil.example" }, { origin: "null" }];
    for (const h of cases) {
      const r = await call(valid(), h);
      assert.equal(r.status, 403, JSON.stringify(h));
      assert.deepEqual(await r.json(), { error: "forbidden" });
    }
    assert.equal(calls, 0);
  });

  it("L1: a non-JSON content type is 415 (a text/plain form post cannot reach the route)", async () => {
    for (const ct of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x"]) {
      const r = await call(JSON.stringify(valid()), { "content-type": ct });
      assert.equal(r.status, 415, ct);
    }
    assert.equal(calls, 0);
  });

  it("same-origin browser posts pass the guard", async () => {
    const r = await call({ ...valid(), email: "x" }, { "sec-fetch-site": "same-origin", origin: "http://localhost:3103" });
    assert.equal(r.status, 422);
  });

  it("L7: every commit response carries X-Frame-Options DENY and nosniff", async () => {
    for (const r of [await call("nope"), await call(valid()), await call(valid(), { origin: "https://evil.example" })]) {
      assert.equal(r.headers.get("x-frame-options"), "DENY");
      assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    }
  });

  it("M1: a tripped global ceiling (1000/h) returns 429 and enqueues one ops_alert per hour; per-IP key uses /48", async () => {
    let alertInserted = false;
    responder = (query, params) => {
      if (query.includes("b_count")) return PAIR_OK; // hitPair: IP and email both within limits
      if (query.includes("insert into s1_rate_limits")) {
        const key = String(params[0]);
        return { fields: ["count"], rows: [[key.startsWith("s1pi:global:") ? 1001 : 1]] };
      }
      if (query.includes("insert into s1_outbox")) {
        // on conflict (dedupe_key) do nothing: only the first insert returns a row.
        if (alertInserted) return { fields: ["id"], rows: [] };
        alertInserted = true;
        return { fields: ["id"], rows: [["00000000-0000-0000-0000-000000000001"]] };
      }
      if (query.includes("count(distinct oi.kid_id)")) return { fields: ["n"], rows: [[0]] };
      return { fields: ["x"], rows: [] }; // paidKidKeys, findPendingOrderByAttempt, cleanup
    };
    const ip6 = { "x-nf-client-connection-ip": "2001:db8:abcd:12::7" };
    for (let i = 0; i < 2; i++) {
      const r = await call(valid(), ip6);
      assert.equal(r.status, 429);
      assert.deepEqual(await r.json(), { error: "rate_limited" });
    }
    // hitPair carries the IP key at $1 and the email key at $4.
    const limits = sent
      .filter((x) => x.query.includes("insert into s1_rate_limits"))
      .flatMap((x) => (x.query.includes("b_count") ? [String(x.params[0]), String(x.params[3])] : [String(x.params[0])]));
    assert.ok(limits.includes("s1pi:ip:2001:db8:abcd::/48"), limits.join(","));
    assert.ok(limits.includes("s1pi:global:test"));
    const alerts = sent.filter((x) => x.query.includes("insert into s1_outbox"));
    assert.equal(alerts.length, 2, "attempted on each trip; the dedupe key keeps one row");
    for (const a of alerts) {
      assert.equal(a.params[0], "ops_alert");
      assert.match(String(a.params[1]), /^ops_alert:global_ceiling:\d{4}-\d{2}-\d{2}T\d{2}$/);
      assert.equal(JSON.parse(String(a.params[2])).kind, "global_ceiling");
      assert.equal(String(a.params[3]), "false", "livemode false (test mode)");
    }
    assert.equal(alerts[0].params[1], alerts[1].params[1]);
    // No family, kids, order or PaymentIntent work after the ceiling trips.
    assert.equal(sent.some((x) => /insert into s1_(families|guardians|kids|orders)/.test(x.query)), false);
  });

  it("canary 10-29: every response carries Server-Timing with db round trips counted and no PII", async () => {
    responder = (query, params) => {
      if (query.includes("b_count")) return PAIR_OK; // hitPair: IP and email both within limits
      if (query.includes("insert into s1_rate_limits")) {
        return { fields: ["count"], rows: [[String(params[0]).startsWith("s1pi:global:") ? 1001 : 1]] };
      }
      if (query.includes("insert into s1_outbox")) return { fields: ["id"], rows: [] };
      if (query.includes("count(distinct oi.kid_id)")) return { fields: ["n"], rows: [[0]] };
      return { fields: ["x"], rows: [] };
    };
    const r = await call({ ...valid(), email: "timing.parent@example.com", parentFirstName: "Timing" });
    assert.equal(r.status, 429);
    const h = r.headers.get("server-timing") ?? "";
    assert.match(h, /^db;dur=\d+\.\d;desc="(\d+) queries", dbfirst;dur=\d+\.\d, stripe;dur=0\.0;desc="0 calls", app;dur=\d+\.\d/);
    assert.equal(Number(/desc="(\d+) queries"/.exec(h)?.[1]), sent.length, "one db entry per Neon round trip");
    assert.ok(sent.length >= 3);
    assert.doesNotMatch(h, /timing\.parent|example\.com|Timing|Ava|198\.51/);
    const bad = await call("nope");
    assert.equal(bad.status, 422);
    assert.match(bad.headers.get("server-timing") ?? "", /db;dur=0\.0;desc="0 queries"/);
  });

  it("M1: an ops_alert enqueue failure still returns 429 (never 500)", async () => {
    responder = (query, params) => {
      if (query.includes("b_count")) return PAIR_OK; // hitPair: IP and email both within limits
      if (query.includes("insert into s1_rate_limits")) {
        return { fields: ["count"], rows: [[String(params[0]).startsWith("s1pi:global:") ? 5000 : 1]] };
      }
      if (query.includes("insert into s1_outbox")) throw new TypeError("unit: outbox down");
      if (query.includes("count(distinct oi.kid_id)")) return { fields: ["n"], rows: [[0]] };
      return { fields: ["x"], rows: [] };
    };
    const r = await call(valid());
    assert.equal(r.status, 429);
  });

  /** Speed pass 10-29: a full new-order commit with Stripe stubbed. Returns the Server-Timing header. */
  async function fullCommit(family: Record<string, unknown> | null) {
    const { getStripe } = await import("../stripe");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const st = getStripe() as any;
    const real = { cc: st.customers.create, pc: st.paymentIntents.create, rnd: Math.random };
    let custCreates = 0;
    st.customers.create = async () => (custCreates++, { id: "cus_unit" });
    st.paymentIntents.create = async (p: { payment_method_types: string[] }) => ({
      id: "pi_unit",
      client_secret: "pi_unit_secret_unit",
      created: Math.floor(Date.now() / 1000),
      payment_method_types: p.payment_method_types,
    });
    Math.random = () => 0.5; // no 1% limiter cleanup in this run
    responder = (query, params) => {
      if (query.includes("b_count")) return PAIR_OK;
      if (query.includes("insert into s1_rate_limits")) return { fields: ["count"], rows: [[1]] };
      if (query.includes("paid_keys")) return { fields: ["paid_keys", "prior", "attempt", "family"], rows: [[null, 0, null, family]] };
      if (query.includes("set stripe_customer_id")) return { fields: ["stripe_customer_id"], rows: [[String(params[1])]] };
      if (query.includes("view_token_hash = $5")) return { fields: ["id"], rows: [["00000000-0000-0000-0000-0000000000aa"]] };
      return { fields: [], rows: [] }; // the records transaction's inserts
    };
    try {
      const r = await call({ ...valid(), email: "speed.parent@example.com", kids: [{ firstName: "Ava", age: 11 }, { firstName: "Bo", age: 9 }], expectedCents: 18000 });
      return { r, body: await r.json(), h: r.headers.get("server-timing") ?? "", custCreates };
    } finally {
      st.customers.create = real.cc;
      st.paymentIntents.create = real.pc;
      Math.random = real.rnd;
    }
  }

  it("speed pass 10-29: a new family's commit takes 6 DB round trips (was 14), records in one transaction", async () => {
    const { r, body, h, custCreates } = await fullCommit(null);
    assert.equal(r.status, 200, JSON.stringify(body));
    assert.equal(body.clientSecret, "pi_unit_secret_unit");
    assert.equal(calls, 6, "hitPair, precheck, global hit, records transaction, customer id, PI + view token");
    assert.equal(Number(/desc="(\d+) queries"/.exec(h)?.[1]), 6, h);
    assert.match(h, /stripe;dur=\d+\.\d;desc="2 calls"/);
    assert.equal(custCreates, 1);
    // The transaction carries the same inserts as before, in order: family, guardian, kids, order, items.
    const ins = sent.map((x) => /^\s*insert into (s1_\w+)/.exec(x.query)?.[1]).filter(Boolean);
    assert.deepEqual(ins, ["s1_rate_limits", "s1_families", "s1_guardians", "s1_kids", "s1_kids", "s1_orders", "s1_order_items", "s1_order_items"]);
  });

  it("speed pass 10-29: a returning family with a Customer takes 5 DB round trips and no customer create", async () => {
    const fam = { guardian_id: "g1", family_id: "00000000-0000-0000-0000-0000000000f1", family_public_id: "fampubid23", customer_id: "cus_known" };
    const { r, h, custCreates } = await fullCommit(fam);
    assert.equal(r.status, 200);
    assert.equal(calls, 5);
    assert.equal(Number(/desc="(\d+) queries"/.exec(h)?.[1]), 5, h);
    assert.equal(custCreates, 0);
    assert.equal(sent.some((x) => /insert into s1_(families|guardians)/.test(x.query)), false, "existing guardian never re-inserted (RT7)");
    const kid = sent.find((x) => /insert into s1_kids/.test(x.query));
    assert.equal(kid?.params[1], fam.family_id);
  });
});
