import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Analytics S6, S7, C1, C4 (money red team 8, 9), no database: globalThis.fetch
 * answers the Neon HTTP driver; any other URL fails the test, so no sender
 * reaches the network (Klaviyo, Meta and Discord are unconfigured here).
 *  - loadOrderCtx reads fbp/fbc from the order's attribution first, then the
 *    family's, validated; utm_* and first_touch from the order only.
 *  - An unsent klaviyo_committed or meta_purchase on a refunded order becomes
 *    skipped_refunded; partially_refunded still goes to the sender.
 *  - drainOutbox({orderId}) selects that order's rows only.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const sent: { query: string; params: unknown[] }[] = [];
let responder: ((query: string, params: unknown[]) => { fields: string[]; rows: unknown[][] }) | null = null;

const ENV_UNSET = [
  "KLAVIYO_PRIVATE_API_KEY",
  "META_CAPI_ACCESS_TOKEN",
  "META_PIXEL_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "S1_DISCORD_WEBHOOK_URL",
  "S1_DISCORD_WEBHOOK_URL_TEST",
];

const FBP_O = "fb.1.1792999999999.1111111111";
const FBC_O = "fb.1.1792999999999.OrderClick_1";
const FBP_F = "fb.1.1791111111111.2222222222";
const FBC_F = "fb.1.1791111111111.FamilyClick_2";

function orderRow(status: string, orderAttr: unknown, famAttr: unknown) {
  return {
    public_id: "ordref2345", livemode: false, status, payer_email: "parent@example.com", payer_first_name: "Pat",
    payer_phone: null, consent_at: "2026-10-30T15:00:00.000Z", consent_ip: "203.0.113.9", consent_ua: "UA",
    amount_cents: 10000, paid_at: "2026-10-30T15:01:00.000Z", src: "ad", offer_version: "v1", jersey_eligible: true,
    referral_code: null, family_id: "f1", order_attribution: orderAttr, family_public_id: "fampub2345", geo: null,
    attribution: famAttr, guardian_first_name: "Pat", code: "48271937",
    kids: [{ firstName: "Ava", age: 11, role: "first" }], inviter_kid: null,
  };
}

/** ORDER_SQL answer for one row object. */
function asResult(o: Record<string, unknown>) {
  const fields = Object.keys(o);
  return { fields, rows: [fields.map((k) => o[k])] };
}

describe("outbox: attribution read, skipped_refunded, order-scoped drain (no DB)", () => {
  before(() => {
    for (const k of ["DATABASE_URL", ...ENV_UNSET]) saved[k] = process.env[k];
    for (const k of ENV_UNSET) delete process.env[k];
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    const result = (query: string, params: unknown[]) => {
      sent.push({ query, params });
      const r = responder!(query, params);
      const types = r.fields.map((_n, i) => {
        const v = r.rows[0]?.[i];
        return typeof v === "number" ? 23 : typeof v === "boolean" ? 16 : v !== null && typeof v === "object" ? 114 : 25;
      });
      return {
        command: "SELECT",
        rowCount: r.rows.length,
        fields: r.fields.map((name, i) => ({ name, dataTypeID: types[i] })),
        rows: r.rows.map((row) =>
          row.map((v) => (v === null || v === undefined ? null : typeof v === "boolean" ? (v ? "t" : "f") : typeof v === "object" ? JSON.stringify(v) : String(v))),
        ),
      };
    };
    globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
      if (!String(url).includes("neon.tech")) throw new Error(`unit: unexpected network call to ${String(url)}`);
      if (!responder) throw new TypeError("unit: network disabled");
      const body = JSON.parse(String(init?.body ?? "{}"));
      const out = Array.isArray(body.queries)
        ? { results: body.queries.map((x: { query: string; params: unknown[] }) => result(x.query, x.params)) }
        : result(body.query, body.params);
      return new Response(JSON.stringify(out), { status: 200, headers: { "content-type": "application/json" } });
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
    responder = null;
    sent.length = 0;
  });

  it("loadOrderCtx: the order's fbp/fbc win over the family's; utms and first touch come from the order", async () => {
    const { loadOrderCtx } = await import("../outboxLoad");
    responder = () =>
      asResult(
        orderRow(
          "paid",
          {
            src: "ad",
            lc: { utm_source: "klaviyo", utm_medium: "email", utm_campaign: "s01_open", utm_content: "hero", utm_term: "t", path: "/season1/join", ts: 1792999999999 },
            first_touch: "paid_meta",
            fbp: FBP_O,
            fbc: FBC_O,
          },
          { src: "ad", fbp: FBP_F, fbc: FBC_F, origin: "https://deploy-preview-9--ekuzo.netlify.app" },
        ),
      );
    const ctx = (await loadOrderCtx("ordref2345"))!;
    assert.match(sent[0].query, /o\.attribution as order_attribution/);
    assert.equal(ctx.fbp, FBP_O);
    assert.equal(ctx.fbc, FBC_O);
    assert.equal(ctx.utmSource, "klaviyo");
    assert.equal(ctx.utmMedium, "email");
    assert.equal(ctx.utmCampaign, "s01_open");
    assert.equal(ctx.utmContent, "hero");
    assert.equal(ctx.firstTouch, "paid_meta");
    assert.equal(ctx.origin, "https://deploy-preview-9--ekuzo.netlify.app", "origin stays the family's test request origin");
  });

  it("loadOrderCtx: no order attribution (orders before 0005) falls back to the family's valid fbp/fbc", async () => {
    const { loadOrderCtx } = await import("../outboxLoad");
    responder = () => asResult(orderRow("paid", null, { fbp: FBP_F, fbc: FBC_F }));
    const ctx = (await loadOrderCtx("ordref2345"))!;
    assert.equal(ctx.fbp, FBP_F);
    assert.equal(ctx.fbc, FBC_F);
    assert.equal(ctx.utmCampaign, null);
    assert.equal(ctx.firstTouch, null);
  });

  it("loadOrderCtx: invalid values are dropped (an invalid order value falls through to a valid family one)", async () => {
    const { loadOrderCtx } = await import("../outboxLoad");
    responder = () =>
      asResult(orderRow("paid", { fbp: "fb.1.1.2", fbc: "fb.1.1792999999999.a b", first_touch: "origin", lc: [1] }, { fbp: FBP_F, fbc: "bad" }));
    const ctx = (await loadOrderCtx("ordref2345"))!;
    assert.equal(ctx.fbp, FBP_F);
    assert.equal(ctx.fbc, null);
    assert.equal(ctx.firstTouch, null);
    assert.equal(ctx.utmSource, null);
  });

  /** A drain over three rows of one order, with the order in `status`. */
  async function drainFor(status: string) {
    const { drainOutbox } = await import("../outbox");
    const rows = ["klaviyo_committed", "meta_purchase", "discord_commit"].map((kind, i) => ({
      id: String(i + 1), kind, dedupe_key: `${kind}:ordref2345`, payload: { order_public_id: "ordref2345" },
      status: "pending", attempts: 0, livemode: false, created_at: new Date().toISOString(),
    }));
    const finals: Record<string, string> = {};
    responder = (query, params) => {
      if (query.includes("last_error = 'stuck_sending'")) return { fields: [], rows: [] };
      if (query.includes("from s1_outbox")) {
        const fields = Object.keys(rows[0]);
        return { fields, rows: rows.map((r) => fields.map((f) => (r as Record<string, unknown>)[f])) };
      }
      if (query.includes("set status = 'sending'")) {
        const r = rows.find((x) => x.id === params[0])!;
        const fields = Object.keys(r);
        return { fields, rows: [fields.map((f) => (r as Record<string, unknown>)[f])] };
      }
      if (query.includes("set status = $2")) {
        finals[rows.find((x) => x.id === params[0])!.kind] = String(params[1]);
        return { fields: [], rows: [] };
      }
      if (query.includes("from s1_orders o join s1_families f")) {
        return asResult(orderRow(status, { src: "ad" }, { src: "ad" }));
      }
      return { fields: [], rows: [] };
    };
    const summary = await drainOutbox({ orderId: "ordref2345", budgetMs: 3000 });
    return { summary, finals };
  }

  it("C4: on a refunded order, unsent Committed and Purchase become skipped_refunded; Discord is unchanged", async () => {
    const { finals, summary } = await drainFor("refunded");
    assert.equal(finals.klaviyo_committed, "skipped_refunded");
    assert.equal(finals.meta_purchase, "skipped_refunded");
    assert.equal(finals.discord_commit, "skipped_no_config", "Discord still goes to its sender (unconfigured here)");
    assert.equal(summary.counts.skipped_refunded, 2);
  });

  it("C4: partially_refunded still sends (reaches the senders: test isolation and no config here)", async () => {
    const { finals } = await drainFor("partially_refunded");
    assert.equal(finals.klaviyo_committed, "skipped_test", "Klaviyo sender ran (non-test email in test mode)");
    assert.equal(finals.meta_purchase, "skipped_no_config", "Meta sender ran (no token here)");
    const paid = await drainFor("paid");
    assert.equal(paid.finals.meta_purchase, "skipped_no_config");
  });

  it("C1: drainOutbox({orderId}) selects that order's rows only; without it, the global oldest-first queue", async () => {
    const { drainOutbox } = await import("../outbox");
    responder = () => ({ fields: [], rows: [] });
    await drainOutbox({ orderId: "ordref2345", limit: 20, budgetMs: 100 });
    const scoped = sent.find((x) => x.query.includes("from s1_outbox"))!;
    assert.match(scoped.query, /payload->>'order_public_id' = \$2::text/);
    assert.deepEqual(scoped.params, ["20", "ordref2345"], "the driver sends params as text");
    sent.length = 0;
    await drainOutbox({ limit: 50, budgetMs: 100 });
    const global = sent.find((x) => x.query.includes("from s1_outbox"))!;
    assert.doesNotMatch(global.query, /order_public_id/);
    assert.deepEqual(global.params, ["50"]);
  });
});
