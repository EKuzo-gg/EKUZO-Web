import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";
import { POST as commitPOST } from "../../../app/api/season1/commit/route";
import { getSql } from "../db";
import { loadOrderCtx } from "../outboxLoad";

/**
 * Analytics S6, S7 and R9 against the Neon test branch (migration 0005) and
 * Stripe test mode: the commit writes s1_orders.attribution for a new family
 * and for the same family's second order; hostile cookies still commit; the
 * outbox loader reads the order's fbp/fbc/utms. No payment is confirmed; every
 * PI created here is canceled in after().
 * Run: S1_DB_TESTS=1 node --env-file=.env.test.local scripts/run-tests.mjs lib/season1/__tests__
 */
const enabled = process.env.S1_DB_TESTS === "1";
const tag = randomBytes(4).toString("hex");
const EMAIL = `team+s1test-attr${tag}@ekuzo.gg`;
const ip = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
const sqlq = async (text: string, params: unknown[] = []) => (await getSql().query(text, params)) as Row[];

const NOW = Date.now();
const LC = encodeURIComponent(
  JSON.stringify({ utm_source: "klaviyo", utm_medium: "email", utm_campaign: "s01_open", utm_content: "hero", fbclid: "IwAR_int-1", path: "/season1/join", ts: NOW - 60_000 }),
);
const FBP = "fb.1.1792999999999.1234567890";

async function commit(body: Record<string, unknown>, cookie: string) {
  const res = await commitPOST(
    new Request("http://localhost:3103/api/season1/commit", {
      method: "POST",
      headers: {
        host: "localhost:3103",
        "content-type": "application/json",
        "user-agent": "relay-attr-test",
        "x-nf-client-connection-ip": ip(),
        cookie,
      },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}

const body = (kids: { firstName: string; age: number }[], expectedCents: number, src?: string) => ({
  email: EMAIL,
  parentFirstName: "Testparent",
  phone: "",
  kids,
  consent: true,
  company: "",
  attemptId: randomUUID(),
  expectedCents,
  ...(src ? { src } : {}),
});

describe("season1 order attribution (integration)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  let stripe: Stripe;
  const refs: string[] = [];
  before(() => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    assert.ok(key.startsWith("sk_test_"), "STRIPE_SECRET_KEY must be a test key");
    assert.ok((process.env.DATABASE_URL ?? "").includes("ep-lively-boat-b4fak1h6"), "test DB only");
    stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  });
  after(async () => {
    for (const ref of refs) {
      const r = (await sqlq(`select payment_intent_id from s1_orders where public_id = $1`, [ref]))[0];
      if (r?.payment_intent_id) {
        try {
          await stripe.paymentIntents.cancel(r.payment_intent_id);
        } catch {
          // already canceled
        }
      }
    }
  });

  it("migration 0005: s1_orders.attribution is a nullable jsonb column", async () => {
    const rows = await sqlq(
      `select data_type, is_nullable from information_schema.columns where table_name = 's1_orders' and column_name = 'attribution'`,
    );
    assert.deepEqual(rows, [{ data_type: "jsonb", is_nullable: "YES" }]);
  });

  it("a new family's order stores {src, lc, first_touch, fbp, fbc}; the family keeps {src}", async () => {
    const c = await commit(body([{ firstName: "Ava", age: 11 }], 10000, "ad"), `ekuzo_lc=${LC}; ekuzo_origin=paid_meta; _fbp=${FBP}`);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    refs.push(c.body.orderId);
    const row = (await sqlq(
      `select o.attribution as oa, f.attribution as fa from s1_orders o join s1_families f on f.id = o.family_id where o.public_id = $1`,
      [c.body.orderId],
    ))[0];
    assert.deepEqual(Object.keys(row.oa).sort(), ["fbc", "fbp", "first_touch", "lc", "src"]);
    assert.equal(row.oa.src, "ad");
    assert.equal(row.oa.first_touch, "paid_meta");
    assert.equal(row.oa.lc.utm_campaign, "s01_open");
    assert.equal(row.oa.fbp, FBP);
    assert.equal(row.oa.fbc, `fb.1.${NOW - 60_000}.IwAR_int-1`);
    assert.deepEqual(row.fa, { src: "ad" });
  });

  it("the same family's second order gets its own attribution, and hostile cookies still commit", async () => {
    const hostile = ["ekuzo_lc=" + "%00".repeat(8) + "%7B", "ekuzo_origin=%ED%A0%80", "_fbp=fb.1.1.2", "_fbc=" + "z".repeat(5000)].join("; ");
    const c = await commit(body([{ firstName: "Bo", age: 9 }], 10000), hostile);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    refs.push(c.body.orderId);
    const row = (await sqlq(`select attribution from s1_orders where public_id = $1`, [c.body.orderId]))[0];
    assert.deepEqual(row.attribution, { src: null, lc: null, first_touch: null, fbp: null, fbc: null });
    const fams = await sqlq(`select count(distinct family_id)::int as n from s1_orders where payer_email = $1`, [EMAIL]);
    assert.equal(fams[0].n, 1, "returning family: one family row for both orders");
  });

  it("loadOrderCtx reads the order's fbp, fbc, utms and first touch", async () => {
    const ctx = (await loadOrderCtx(refs[0]))!;
    assert.equal(ctx.fbp, FBP);
    assert.equal(ctx.fbc, `fb.1.${NOW - 60_000}.IwAR_int-1`);
    assert.equal(ctx.utmSource, "klaviyo");
    assert.equal(ctx.utmMedium, "email");
    assert.equal(ctx.utmCampaign, "s01_open");
    assert.equal(ctx.utmContent, "hero");
    assert.equal(ctx.firstTouch, "paid_meta");
    assert.equal(ctx.origin, null, "first touch never lands in origin");
  });
});
