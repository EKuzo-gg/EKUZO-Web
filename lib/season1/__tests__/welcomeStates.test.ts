import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * F1 (docs/season1-commit/final/05-defects.md): /season1/join/welcome picks a
 * state from the order status. The Neon HTTP driver is stubbed through fetch,
 * so the route runs end to end with one fake order row. Every query is
 * recorded: a settled order must make exactly one (the view lookup), which
 * proves fulfil (and so Stripe) was not called.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const queries: string[] = [];
let row: Record<string, unknown> | null = null;

const TOKEN = "unitViewToken_abcdefghijklmnop";

// Column order and Postgres type ids of ORDER_VIEW_SELECT (lib/season1/db.ts).
const COLS: [string, number][] = [
  ["id", 25], ["public_id", 25], ["family_id", 25], ["family_public_id", 25], ["payer_email", 25],
  ["status", 25], ["amount_cents", 23], ["payment_intent_id", 25], ["paid_at", 25], ["fulfilled_at", 25],
  ["jersey_eligible", 16], ["livemode", 16], ["flags", 1009], ["guardian_first_name", 25], ["kids", 114],
  ["code", 25], ["invite_applied", 16],
];

function raw(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return v ? "t" : "f";
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return `{${v.join(",")}}`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function kid(firstName: string, status: string, unitCents: number) {
  return { id: `k-${firstName}`, firstName, age: 11, status, role: "kid", unitCents };
}

function order(status: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "o-1", public_id: "ord1unit", family_id: "f-1", family_public_id: "fam1unit", payer_email: "p@example.com",
    status, amount_cents: 8000, payment_intent_id: "pi_unit_1", paid_at: null, fulfilled_at: null,
    jersey_eligible: true, livemode: false, flags: [], guardian_first_name: "Pat",
    kids: [kid("Sam", status === "paid" ? "paid" : status, 8000)], code: "48271937", invite_applied: false,
    ...over,
  };
}

const get = (cookie = `s1_order=${TOKEN}`) =>
  new Request("http://localhost:3103/season1/join/welcome", { headers: { host: "localhost:3103", cookie } });

async function render(o: Record<string, unknown>, cookie?: string) {
  row = o;
  const welcome = await import("../../../app/season1/join/welcome/route");
  const r = await welcome.GET(get(cookie));
  return { r, html: await r.text(), cookies: r.headers.getSetCookie().join("\n") };
}

const REFRESH = /http-equiv="refresh"/;

describe("F1 welcome states", () => {
  before(() => {
    for (const k of ["STRIPE_SECRET_KEY", "DATABASE_URL", "S1_COMMIT_MODE"]) saved[k] = process.env[k];
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { query?: string };
      const text = body.query ?? "";
      queries.push(text);
      const rows = text.includes("o.view_token_hash = $1") && row ? [COLS.map(([c]) => raw(row![c]))] : [];
      return new Response(
        JSON.stringify({ command: "SELECT", rowCount: rows.length, fields: COLS.map(([name, dataTypeID]) => ({ name, dataTypeID })), rows }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
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
    queries.length = 0;
  });

  it("paid renders the paid page with the share link, no refresh", async () => {
    const { html, cookies } = await render(order("paid"));
    assert.match(html, /Great, Sam's in!/);
    assert.match(html, /id="share"/);
    assert.match(html, /\/crew\/48271937/);
    assert.doesNotMatch(html, REFRESH);
    assert.match(cookies, /ekuzo_s1_joined=1/);
    assert.equal(queries.length, 1, "no fulfil lookup for a paid order");
  });

  it("partially_refunded renders the paid page; hero names the kid still in, receipt unchanged", async () => {
    const { html } = await render(
      order("partially_refunded", { amount_cents: 14400, kids: [kid("Sam", "paid", 8000), kid("Ben", "refunded", 6400)] }),
    );
    assert.match(html, /Great, Sam's in!/);
    assert.match(html, /Share Sam's link/);
    assert.match(html, /Ben, refunded<\/span><span><s>\$64<\/s></);
    assert.match(html, /Paid today<\/span><span>\$144</);
    assert.match(html, /\/crew\/48271937/);
    assert.doesNotMatch(html, REFRESH);
    assert.doesNotMatch(html, /confirming your payment/);
    assert.equal(queries.length, 1);
  });

  it("F10: partially_refunded two-kid order prices and labels only the kid still in", async () => {
    const { html } = await render(
      order("partially_refunded", { amount_cents: 18000, kids: [kid("Sam", "paid", 10000), kid("Theo", "refunded", 8000)] }),
    );
    assert.match(html, /Sam, Season 01, first month<\/span><span>\$100</);
    assert.match(html, /Theo, refunded<\/span><span><s>\$80<\/s></);
    assert.doesNotMatch(html, /Theo, Season 01/);
    assert.match(html, /Paid today<\/span><span>\$180</);
    assert.match(html, /Then \$160 a month from Feb 15\. About \$20 a practice\./);
    assert.doesNotMatch(html, /both kids/);
    assert.doesNotMatch(html, /For your first kid\./);
  });

  it("paid two-kid order keeps the family line and the ladder label", async () => {
    const { html } = await render(
      order("paid", { amount_cents: 18000, kids: [kid("Sam", "paid", 10000), kid("Theo", "paid", 8000)] }),
    );
    assert.match(html, /Great, Sam and Theo are in!/);
    assert.match(html, /Then \$288 a month for both kids from Feb 15\./);
    assert.match(html, /For your first kid\./);
  });

  it("invited two-kid order: family line less the friend's credit", async () => {
    const { html } = await render(
      order("paid", { amount_cents: 18000, invite_applied: true, kids: [kid("Sam", "paid", 10000), kid("Theo", "paid", 8000)] }),
    );
    assert.match(html, /Then \$288 a month for both kids from Feb 15, less your friend's credit\./);
    assert.doesNotMatch(html, /February is free/);
    assert.match(html, /Friend credit recorded\./);
  });

  it("refunded renders a static refunded page: no refresh, no share, no paid script, no Stripe check", async () => {
    const { html, cookies } = await render(order("refunded"));
    assert.match(html, /This order was refunded\./);
    assert.match(html, /Questions\? Text our founder\./);
    assert.match(html, /href="sms:[^"]+">Text our founder</);
    assert.doesNotMatch(html, REFRESH);
    assert.doesNotMatch(html, /confirming your payment/);
    assert.doesNotMatch(html, /id="share"|\/crew\/|id="s1p"|'purchase'/);
    assert.doesNotMatch(cookies, /ekuzo_s1_joined|s1_wpend=\d/);
    assert.equal(queries.length, 1, "fulfil (and Stripe) not called");
  });

  it("canceled renders the didn't-go-through page with try again and text links", async () => {
    const { html } = await render(order("canceled"));
    assert.match(html, /This payment didn't go through\./);
    assert.match(html, /You haven't been charged\. Try again or text our founder\./);
    assert.match(html, /href="\/season1\/join\/signup">Try again</);
    assert.match(html, /href="sms:[^"]+">Text our founder</);
    assert.doesNotMatch(html, REFRESH);
    assert.doesNotMatch(html, /id="share"|\/crew\/|id="s1p"|'purchase'/);
    assert.equal(queries.length, 1, "fulfil (and Stripe) not called");
  });

  it("failed renders the same didn't-go-through page", async () => {
    const { html } = await render(order("failed"));
    assert.match(html, /This payment didn't go through\./);
    assert.doesNotMatch(html, REFRESH);
    assert.equal(queries.length, 1);
  });

  it("pending refreshes and counts renders; after the cap it stops refreshing", async () => {
    const first = await render(order("pending", { payment_intent_id: null }));
    assert.match(first.html, /We're confirming your payment/);
    assert.match(first.html, /<meta http-equiv="refresh" content="4">/);
    assert.match(first.cookies, /s1_wpend=1;/);

    const last = await render(order("pending", { payment_intent_id: null }), `s1_order=${TOKEN}; s1_wpend=29`);
    assert.match(last.html, REFRESH);
    assert.match(last.cookies, /s1_wpend=30;/);

    const capped = await render(order("pending", { payment_intent_id: null }), `s1_order=${TOKEN}; s1_wpend=30`);
    assert.match(capped.html, /Still confirming\. Refresh in a minute or text our founder\./);
    assert.doesNotMatch(capped.html, REFRESH);
    assert.doesNotMatch(capped.html, /This page refreshes in a few seconds/);
  });

  it("a settled order clears a leftover pending counter", async () => {
    const { cookies } = await render(order("paid"), `s1_order=${TOKEN}; s1_wpend=12`);
    assert.match(cookies, /s1_wpend=; Path=\/season1; Max-Age=0/);
  });
});
