import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { isOpen } from "../offer";

/**
 * Hotfix 10-30, double charge (red team money findings 1 and 3), no database.
 * Same harness as commitGuards.test.ts: globalThis.fetch answers the Neon HTTP
 * driver, and the memoized Stripe client's methods are stubbed per test.
 *  - Finding 1: with changed details, the attempt's PI is read first; a PI that
 *    is processing, succeeded or requires_capture is never canceled and its
 *    order stays pending; a failed cancel leaves the order alone.
 *  - Finding 3: before a new order and PI, the email's other recent pending
 *    orders are checked with Stripe; one paying or paid stops the commit with
 *    no view cookie.
 *  - Analytics C2 (F15, 10-30): the attempt-level in-flight stop is 409
 *    in_progress with a fresh view cookie for that order; the email-wide stop
 *    is 409 in_progress_other with no cookie and no order data; the double-tap
 *    insert race is 503 attempt_busy. Other stops stay 503 try_again.
 */
const env: Record<string, string> = {
  STRIPE_SECRET_KEY: "sk_test_unit",
  DATABASE_URL: "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb",
  S1_REF_SECRET: "unit-ref-secret",
};
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const sent: { query: string; params: unknown[] }[] = [];
let responder: ((query: string, params: unknown[]) => { fields: string[]; rows: unknown[][] }) | null = null;

let POST: (req: Request) => Promise<Response>;

const EMAIL = "double.parent@example.com";
const ATTEMPT_ORDER_ID = "00000000-0000-0000-0000-0000000000a1";
const OTHER_ORDER_ID = "00000000-0000-0000-0000-0000000000b2";

/** The attempt's pending order as commitPrecheck returns it: Ava alone, $100, PI pi_old. */
const attemptOrder = (piId: string | null = "pi_old") => ({
  id: ATTEMPT_ORDER_ID,
  public_id: "attemptord",
  family_id: "00000000-0000-0000-0000-0000000000f1",
  status: "pending",
  amount_cents: 10000,
  payment_intent_id: piId,
  referral_code: null,
  kids: [{ firstName: "Ava", age: 11 }],
});
const family = { guardian_id: "g1", family_id: "00000000-0000-0000-0000-0000000000f1", family_public_id: "fampubid23", customer_id: "cus_known" };

/** Changed details: a sibling added, so $180. */
const changedBody = (attemptId: string) => ({
  email: EMAIL,
  parentFirstName: "Pat",
  phone: "",
  kids: [{ firstName: "Ava", age: 11 }, { firstName: "Bo", age: 9 }],
  consent: true,
  company: "",
  attemptId,
  expectedCents: 18000,
});

function call(body: unknown, cookie?: string) {
  return POST(
    new Request("http://localhost:3103/api/season1/commit", {
      method: "POST",
      headers: {
        host: "localhost:3103",
        "content-type": "application/json",
        "x-nf-client-connection-ip": "198.51.100.9",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

interface Scenario {
  /** commitPrecheck's attempt column (null: a fresh page load). */
  attempt: Record<string, unknown> | null;
  /** commitPrecheck's pending_pis column. */
  pendingPis: { id: string; public_id: string; payment_intent_id: string }[];
  /** PaymentIntent id to status, for retrieve. An Error value is thrown instead. */
  pis: Record<string, string | Error>;
  /** cancel: "ok" returns status canceled; an Error is thrown. */
  cancel?: "ok" | Error;
  /** issueViewToken fails (no row). */
  tokenFails?: boolean;
  /** The records transaction fails with this message. */
  insertError?: string;
  /** Request Cookie header. */
  cookie?: string;
  /** commitPrecheck's family column (undefined: the known family; null: a new family). */
  family?: Record<string, unknown> | null;
  /** A partner code that resolves (for s1_ref). */
  partnerCode?: string;
}

interface Run {
  status: number;
  body: Record<string, unknown>;
  setCookie: string | null;
  retrieves: string[];
  cancels: string[];
  creates: number;
  orderCanceled: boolean;
  orderInserted: boolean;
  /** The s1_orders insert's params, when one ran. */
  orderParams: unknown[] | null;
}

function stripeError(code: string): Error {
  return Object.assign(new Error(`unit ${code}`), { type: "StripeInvalidRequestError", code });
}

async function run(s: Scenario, body: Record<string, unknown>): Promise<Run> {
  const { getStripe } = await import("../stripe");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const st = getStripe() as any;
  const real = { r: st.paymentIntents.retrieve, c: st.paymentIntents.cancel, pc: st.paymentIntents.create, cc: st.customers.create, rnd: Math.random };
  const retrieves: string[] = [];
  const cancels: string[] = [];
  let creates = 0;
  st.paymentIntents.retrieve = async (id: string) => {
    retrieves.push(id);
    const v = s.pis[id];
    if (v instanceof Error) throw v;
    if (v === undefined) throw stripeError("resource_missing");
    return { id, status: v, client_secret: `${id}_secret_unit` };
  };
  st.paymentIntents.cancel = async (id: string) => {
    cancels.push(id);
    if (s.cancel instanceof Error) throw s.cancel;
    return { id, status: "canceled" };
  };
  st.paymentIntents.create = async (p: { payment_method_types: string[] }) => (
    creates++, { id: "pi_new", client_secret: "pi_new_secret_unit", created: Math.floor(Date.now() / 1000), payment_method_types: p.payment_method_types }
  );
  st.customers.create = async () => ({ id: "cus_unit" });
  Math.random = () => 0.5; // no 1% limiter cleanup in this run
  let canceledAttempt = false;
  responder = (query, params) => {
    if (query.includes("b_count")) return { fields: ["a_count", "b_count"], rows: [[1, 1]] };
    if (query.includes("insert into s1_rate_limits")) return { fields: ["count"], rows: [[1]] };
    if (query.includes("paid_keys")) {
      const fam = s.family === undefined ? family : s.family;
      return { fields: ["paid_keys", "prior", "attempt", "family", "pending_pis"], rows: [[null, 0, s.attempt, fam, s.pendingPis]] };
    }
    if (query.includes("from s1_codes c")) {
      if (!s.partnerCode || params[0] !== s.partnerCode) return { fields: ["code"], rows: [] };
      return {
        fields: ["code", "family_id", "type", "show_name", "display_name", "has_paid", "kid_name"],
        rows: [[s.partnerCode, "00000000-0000-0000-0000-0000000000c9", "partner", "true", "Lakeside", null, null]],
      };
    }
    if (query.includes("set status = 'canceled'")) {
      canceledAttempt = true;
      return { fields: ["id"], rows: [[String(params[0])]] };
    }
    if (query.includes("o.attempt_id = $2")) {
      // findPendingOrderByAttempt: the attempt's order until it is canceled (then its attempt id is freed).
      const a = s.attempt;
      if (!a || canceledAttempt) return { fields: ["id"], rows: [] };
      return {
        fields: ["id", "public_id", "family_id", "status", "amount_cents", "payment_intent_id", "referral_code", "kids"],
        rows: [[a.id, a.public_id, a.family_id, a.status, a.amount_cents, a.payment_intent_id, null, a.kids]],
      };
    }
    if (query.includes("set stripe_customer_id")) return { fields: ["stripe_customer_id"], rows: [[String(params[1])]] };
    if (query.includes("set view_token_hash = $2")) return { fields: ["id"], rows: s.tokenFails ? [] : [[String(params[0])]] };
    if (s.insertError && query.includes("insert into s1_orders")) throw new Error(s.insertError);
    if (query.includes("view_token_hash = $5")) return { fields: ["id"], rows: [["00000000-0000-0000-0000-0000000000aa"]] };
    return { fields: [], rows: [] }; // the records transaction's inserts, the second cancelOrder statement
  };
  try {
    const r = await call(body, s.cookie);
    return {
      status: r.status,
      body: await r.json(),
      setCookie: r.headers.get("set-cookie"),
      retrieves,
      cancels,
      creates,
      orderCanceled: sent.some((x) => x.query.includes("set status = 'canceled'")),
      orderInserted: sent.some((x) => /insert into s1_orders/.test(x.query)),
      orderParams: sent.find((x) => /insert into s1_orders/.test(x.query))?.params ?? null,
    };
  } finally {
    st.paymentIntents.retrieve = real.r;
    st.paymentIntents.cancel = real.c;
    st.paymentIntents.create = real.pc;
    st.customers.create = real.cc;
    Math.random = real.rnd;
  }
}


function assertStopped(r: Run, why: string) {
  assert.equal(r.status, 503, why);
  assert.deepEqual(r.body, { error: "try_again" }, why);
  assert.equal(r.setCookie, null, `${why}: no view cookie`);
  assert.equal(r.creates, 0, `${why}: no new PaymentIntent`);
  assert.equal(r.orderInserted, false, `${why}: no new order`);
}

/** C2: the attempt's own PI is paying or paid: 409 in_progress plus a fresh view cookie, nothing else. */
function assertInProgress(r: Run, why: string) {
  assert.equal(r.status, 409, why);
  assert.deepEqual(r.body, { error: "in_progress" }, `${why}: no order data in the body`);
  assert.match(r.setCookie ?? "", /^s1_order=[A-Za-z0-9_-]+; Path=\/season1; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax$/, `${why}: fresh view cookie`);
  assert.equal(r.creates, 0, `${why}: no new PaymentIntent`);
  assert.equal(r.orderInserted, false, `${why}: no new order`);
}

/** C2 and money 5: another order for the email is paying or paid: no cookie, no order data. */
function assertInProgressOther(r: Run, why: string) {
  assert.equal(r.status, 409, why);
  assert.deepEqual(r.body, { error: "in_progress_other" }, why);
  assert.equal(r.setCookie, null, `${why}: no view cookie`);
  assert.equal(r.creates, 0, `${why}: no new PaymentIntent`);
  assert.equal(r.orderInserted, false, `${why}: no new order`);
}

/** Installs the Neon HTTP stub on globalThis.fetch (answers from `responder`). */
function installFetch() {
  // Neon HTTP result shape (array mode): 23 = int4, 114 = json, 25 = text; null stays null.
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
    if (!responder) throw new TypeError("unit: network disabled");
    const body = JSON.parse(String(init?.body ?? "{}"));
    let out: unknown;
    try {
      out = Array.isArray(body.queries)
        ? { results: body.queries.map((x: { query: string; params: unknown[] }) => result(x.query, x.params)) }
        : result(body.query, body.params);
    } catch (e) {
      // A Postgres error as Neon's HTTP endpoint returns it (e.g. a unique violation).
      return new Response(JSON.stringify({ message: (e as Error).message, code: "23505" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify(out), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
}

describe("commit hotfix 10-30: no double charge (no DB)", { skip: isOpen(new Date()) ? false : "commit window closed" }, () => {
  before(async () => {
    for (const k of [...Object.keys(env), "S1_COMMIT_MODE", "S1_DEPLOY_CONTEXT", "CONTEXT"]) saved[k] = process.env[k];
    Object.assign(process.env, env);
    delete process.env.S1_COMMIT_MODE;
    installFetch();
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
    responder = null;
    sent.length = 0;
  });

  it("finding 1: changed details with the attempt's PI succeeded returns 409 in_progress, never cancels the PI or the order", async () => {
    const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: "succeeded" } }, changedBody(randomUUID()));
    assertInProgress(r, "succeeded");
    assert.ok(sent.some((x) => x.query.includes("set view_token_hash = $2") && x.params[0] === ATTEMPT_ORDER_ID), "token issued for this order");
    assert.deepEqual(r.retrieves, ["pi_old"]);
    assert.deepEqual(r.cancels, [], "no Stripe cancel");
    assert.equal(r.orderCanceled, false, "the order stays pending for fulfil");
  });

  it("finding 1: changed details with the attempt's PI processing (or requires_capture) does the same", async () => {
    for (const status of ["processing", "requires_capture"]) {
      sent.length = 0;
      const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: status } }, changedBody(randomUUID()));
      assertInProgress(r, status);
      assert.deepEqual(r.cancels, [], `${status}: no Stripe cancel`);
      assert.equal(r.orderCanceled, false, `${status}: order not canceled`);
    }
  });

  it("finding 1: unchanged details with the PI succeeded returns 409 in_progress (F15: back and retap)", async () => {
    const same = { ...changedBody(randomUUID()), kids: [{ firstName: "Ava", age: 11 }], expectedCents: 10000 };
    const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: "succeeded" } }, same);
    assertInProgress(r, "same, succeeded");
    assert.deepEqual(r.cancels, []);
    assert.equal(r.orderCanceled, false);
  });

  it("finding 1: a failed PI cancel returns try_again and leaves the order pending", async () => {
    const r = await run(
      { attempt: attemptOrder(), pendingPis: [], pis: { pi_old: "requires_payment_method" }, cancel: stripeError("payment_intent_unexpected_state") },
      changedBody(randomUUID()),
    );
    assertStopped(r, "cancel failed");
    assert.deepEqual(r.cancels, ["pi_old"], "cancel was tried once");
    assert.equal(r.orderCanceled, false, "order not canceled when Stripe did not cancel the PI");
  });

  it("finding 1: a failed PI retrieve returns try_again and cancels nothing", async () => {
    const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: stripeError("rate_limit") } }, changedBody(randomUUID()));
    assertStopped(r, "retrieve failed");
    assert.deepEqual(r.cancels, []);
    assert.equal(r.orderCanceled, false);
  });

  it("finding 1: a successful cancel cancels the order and proceeds to a new order and PI (its own order is not re-checked)", async () => {
    const own = { id: ATTEMPT_ORDER_ID, public_id: "attemptord", payment_intent_id: "pi_old" };
    const r = await run(
      { attempt: attemptOrder(), pendingPis: [own], pis: { pi_old: "requires_payment_method" }, cancel: "ok" },
      changedBody(randomUUID()),
    );
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.clientSecret, "pi_new_secret_unit");
    assert.deepEqual(r.cancels, ["pi_old"]);
    assert.equal(r.orderCanceled, true);
    assert.equal(r.orderInserted, true);
    assert.equal(r.creates, 1);
    assert.deepEqual(r.retrieves, ["pi_old"], "the order this call canceled is skipped by the email-wide check");
    assert.match(r.setCookie ?? "", /^s1_order=/);
  });

  it("finding 1: an already-canceled attempt PI skips the Stripe cancel and proceeds", async () => {
    const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: "canceled" } }, changedBody(randomUUID()));
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.deepEqual(r.cancels, []);
    assert.equal(r.orderCanceled, true);
    assert.equal(r.creates, 1);
  });

  it("finding 3: a new attempt while another pending order's PI succeeded returns 409 in_progress_other with no cookie", async () => {
    const other = { id: OTHER_ORDER_ID, public_id: "otherorder", payment_intent_id: "pi_other" };
    for (const status of ["succeeded", "processing", "requires_capture"]) {
      sent.length = 0;
      const r = await run({ attempt: null, pendingPis: [other], pis: { pi_other: status } }, changedBody(randomUUID()));
      assertInProgressOther(r, `other ${status}`);
      assert.equal(sent.some((x) => x.query.includes("set view_token_hash")), false, "no token issued for anyone's order");
      assert.deepEqual(r.retrieves, ["pi_other"]);
      assert.deepEqual(r.cancels, [], "the other tab's PI is never touched");
      assert.equal(r.orderCanceled, false);
      assert.doesNotMatch(JSON.stringify(r.body), /otherorder|pi_other/, "no order data in the answer");
    }
  });

  it("finding 3: an unrelated pending order with a requires_payment_method PI does not block", async () => {
    const other = { id: OTHER_ORDER_ID, public_id: "otherorder", payment_intent_id: "pi_other" };
    const r = await run({ attempt: null, pendingPis: [other], pis: { pi_other: "requires_payment_method" } }, changedBody(randomUUID()));
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.deepEqual(r.retrieves, ["pi_other"]);
    assert.deepEqual(r.cancels, [], "left alone");
    assert.equal(r.creates, 1);
    assert.equal(r.orderInserted, true);
  });

  it("finding 3: a missing PI does not block; any other Stripe error fails closed with try_again", async () => {
    const other = { id: OTHER_ORDER_ID, public_id: "otherorder", payment_intent_id: "pi_other" };
    const gone = await run({ attempt: null, pendingPis: [other], pis: {} }, changedBody(randomUUID()));
    assert.equal(gone.status, 200, JSON.stringify(gone.body));
    sent.length = 0;
    const err = await run({ attempt: null, pendingPis: [other], pis: { pi_other: stripeError("api_connection_error") } }, changedBody(randomUUID()));
    assertStopped(err, "retrieve error");
  });

  it("finding 3: one in-flight PI among several stops the commit; Stripe reads are bounded to the lookback", async () => {
    const { PENDING_PI_LOOKBACK } = await import("../db");
    const many = Array.from({ length: 6 }, (_v, i) => ({ id: `00000000-0000-0000-0000-00000000c00${i}`, public_id: `ord${i}`, payment_intent_id: `pi_${i}` }));
    const pis: Record<string, string> = Object.fromEntries(many.map((m) => [m.payment_intent_id, "requires_payment_method"]));
    pis.pi_2 = "succeeded";
    const r = await run({ attempt: null, pendingPis: many, pis }, changedBody(randomUUID()));
    assertInProgressOther(r, "one of several");
    assert.ok(r.retrieves.length <= PENDING_PI_LOOKBACK, `at most ${PENDING_PI_LOOKBACK} reads, got ${r.retrieves.length}`);
  });

  it("C2: in_progress still answers 409 when the view token cannot be issued (no cookie, never a 500)", async () => {
    const r = await run({ attempt: attemptOrder(), pendingPis: [], pis: { pi_old: "succeeded" }, tokenFails: true }, changedBody(randomUUID()));
    assert.equal(r.status, 409);
    assert.deepEqual(r.body, { error: "in_progress" });
    assert.equal(r.setCookie, null);
    assert.equal(r.creates, 0);
  });

  it("C2: losing the double-tap insert race returns 503 attempt_busy, no PI, no cookie", async () => {
    const r = await run(
      { attempt: null, pendingPis: [], pis: {}, insertError: 'duplicate key value violates unique constraint "s1_orders_attempt_key"' },
      changedBody(randomUUID()),
    );
    assert.equal(r.status, 503);
    assert.deepEqual(r.body, { error: "attempt_busy" });
    assert.equal(r.setCookie, null);
    assert.equal(r.creates, 0);
  });

  it("C2: any other insert failure is still 500 server", async () => {
    const r = await run({ attempt: null, pendingPis: [], pis: {}, insertError: "boom" }, changedBody(randomUUID()));
    assert.equal(r.status, 500);
    assert.deepEqual(r.body, { error: "server" });
  });
});

/**
 * Analytics S6 with C3 (money red team 7): the order's attribution is built from
 * cookies at the insert and written for new and returning families. Hostile
 * cookies never fail the commit, never change the amount or the invite.
 * Same harness as above (the fetch stub and Stripe stubs).
 */
describe("commit attribution (analytics S6, C3; no DB)", { skip: isOpen(new Date()) ? false : "commit window closed" }, () => {
  const NOW = Date.now();
  const lc = (o: unknown) => `ekuzo_lc=${encodeURIComponent(JSON.stringify(o))}`;
  const GOOD = [
    lc({ utm_source: "klaviyo", utm_medium: "email", utm_campaign: "s01_open", utm_content: "hero", fbclid: "IwAR_abc-1", path: "/season1/join", ts: NOW - 60_000 }),
    "ekuzo_origin=paid_meta",
    "_fbp=fb.1.1792999999999.1234567890",
  ].join("; ");
  const HOSTILE = [
    "ekuzo_lc=" + "%00".repeat(10) + encodeURIComponent('{"utm_campaign":"x\u0000"}'),
    "ekuzo_origin=%ED%A0%80",
    "_fbp=fb.1.1.%00",
    "_fbc=" + "z".repeat(10_000),
  ].join("; ");
  const body = () => ({ ...changedBody(randomUUID()) });
  const attr = (r: Run) => JSON.parse(String(r.orderParams?.[19]));

  before(async () => {
    for (const k of [...Object.keys(env), "S1_COMMIT_MODE"]) saved[k] = process.env[k];
    Object.assign(process.env, env);
    delete process.env.S1_COMMIT_MODE;
    installFetch();
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
    responder = null;
    sent.length = 0;
  });

  it("writes {src, lc, first_touch, fbp, fbc} on a returning family's order; never the key origin", async () => {
    const r = await run({ attempt: null, pendingPis: [], pis: {}, cookie: GOOD }, { ...body(), src: "ad" });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    const a = attr(r);
    assert.deepEqual(Object.keys(a).sort(), ["fbc", "fbp", "first_touch", "lc", "src"]);
    assert.equal(a.src, "ad");
    assert.equal(a.first_touch, "paid_meta");
    assert.equal(a.lc.utm_campaign, "s01_open");
    assert.equal(a.lc.utm_content, "hero");
    assert.equal(a.fbp, "fb.1.1792999999999.1234567890");
    assert.equal(a.fbc, `fb.1.${NOW - 60_000}.IwAR_abc-1`);
    assert.ok(!("origin" in a));
  });

  it("writes it for a new family too (family attribution stays {src})", async () => {
    const r = await run({ attempt: null, pendingPis: [], pis: {}, cookie: GOOD, family: null }, { ...body(), src: "ad" });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(attr(r).first_touch, "paid_meta");
    const famInsert = sent.find((x) => /insert into s1_families/.test(x.query));
    assert.ok(famInsert, "a family row was inserted");
    assert.deepEqual(JSON.parse(String(famInsert.params[3])), { src: "ad" });
  });

  it("hostile cookies (%00, lone surrogate, 10 KB, bad fbp) never fail the commit; they store nulls", async () => {
    const r = await run({ attempt: null, pendingPis: [], pis: {}, cookie: HOSTILE }, body());
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.deepEqual(attr(r), { src: null, lc: null, first_touch: null, fbp: null, fbc: null });
    assert.doesNotMatch(String(r.orderParams?.[19]), /\\u0000|\\ud800/);
  });

  it("non-JSON, array and nested-object ekuzo_lc store lc null or drop the bad keys", async () => {
    for (const c of ["ekuzo_lc=not-json", lc([1, 2]), lc({ utm_campaign: { a: 1 }, path: "/", ts: NOW })]) {
      sent.length = 0;
      const r = await run({ attempt: null, pendingPis: [], pis: {}, cookie: c }, body());
      assert.equal(r.status, 200, c);
      assert.equal(attr(r).lc, null, c);
    }
  });

  it("a forged ekuzo_lc leaves the amount and the invite outcome unchanged", async () => {
    const { signRef } = await import("../refcookie");
    const ref = `s1_ref=${signRef("lakeside", env.S1_REF_SECRET)}`;
    const forged = lc({ utm_campaign: "free", amountCents: 0, expectedCents: 0, referralCode: "other", invite: "applied", origin: "https://evil.example", path: "/season1/join", ts: NOW });
    const plain = await run({ attempt: null, pendingPis: [], pis: {}, cookie: ref, partnerCode: "lakeside" }, body());
    sent.length = 0;
    const hostile = await run({ attempt: null, pendingPis: [], pis: {}, cookie: `${ref}; ${forged}; ekuzo_origin=paid_meta`, partnerCode: "lakeside" }, body());
    for (const r of [plain, hostile]) assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(hostile.body.amountCents, plain.body.amountCents);
    assert.equal(hostile.body.amountCents, 18000);
    assert.equal(hostile.body.invite, plain.body.invite);
    assert.equal(hostile.body.invite, "applied");
    assert.equal(hostile.orderParams?.[6], plain.orderParams?.[6], "order amount");
    assert.equal(hostile.orderParams?.[11], plain.orderParams?.[11], "order referral code");
    assert.equal(hostile.orderParams?.[11], "lakeside");
    const a = attr(hostile);
    assert.deepEqual(Object.keys(a.lc).sort(), ["path", "ts", "utm_campaign"], "only kept keys survive");
  });
});
