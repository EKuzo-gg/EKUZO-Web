import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

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

function kid(firstName: string, status: string, unitCents: number, role = "kid") {
  return { id: `k-${firstName}`, firstName, age: 11, status, role, unitCents };
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

const get = (cookie = `s1_order=${TOKEN}`, host = "localhost:3103") =>
  new Request(`http://${host}/season1/join/welcome`, { headers: { host, cookie } });

async function render(o: Record<string, unknown>, cookie?: string, host?: string) {
  row = o;
  const welcome = await import("../../../app/season1/join/welcome/route");
  const r = await welcome.GET(get(cookie, host));
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

  it("F11: a returning family adding a sibling ($80 today) sees the $128 sibling monthly, not $160", async () => {
    const { html } = await render(order("paid", { amount_cents: 8000, kids: [kid("Theo", "paid", 8000, "sibling")] }));
    assert.match(html, /Theo, Season 01, first month<\/span><span>\$80</);
    assert.match(html, /Then \$128 more a month from Feb 15, at the sibling rate\./);
    assert.doesNotMatch(html, /\$160 a month/);
  });

  it("F11: a returning family adding two siblings; a new family's first-plus-sibling order is unchanged", async () => {
    const two = await render(
      order("paid", { amount_cents: 16000, kids: [kid("Theo", "paid", 8000, "sibling"), kid("Ava", "paid", 8000, "sibling")] }),
    );
    assert.match(two.html, /Then \$256 more a month for both kids from Feb 15, at the sibling rate\./);
    const fresh = await render(
      order("paid", { amount_cents: 18000, kids: [kid("Sam", "paid", 10000, "first"), kid("Theo", "paid", 8000, "sibling")] }),
    );
    assert.match(fresh.html, /Then \$288 a month for both kids from Feb 15\./);
    assert.doesNotMatch(fresh.html, /sibling rate/);
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

  // Analytics C16 (ops 4): the tags are proven on the route output, so the welcome
  // placeholder pass cannot erase them unseen. Mode "off" on ekuzo.gg still measures.
  async function onHost(o: Record<string, unknown>, host: string) {
    const m = process.env.S1_COMMIT_MODE;
    process.env.S1_COMMIT_MODE = "off";
    try {
      return await render(o, undefined, host);
    } finally {
      if (m === undefined) delete process.env.S1_COMMIT_MODE;
      else process.env.S1_COMMIT_MODE = m;
    }
  }

  it("analytics: paid on ekuzo.gg renders GA4, the Pixel, Clarity, the Purchase script and the kid-name masks", async () => {
    const { html } = await onHost(order("paid"), "ekuzo.gg");
    assert.ok(html.includes("G-8LM45PX53W"));
    assert.ok(html.includes(`fbq('init',"1284038230557204")`));
    assert.ok(html.includes("clarity.ms/tag/"));
    assert.ok(html.includes(`var R="ord1unit";`), "PageView once per order");
    assert.match(html, /s1once\('s1_px_'\+id\)\)s1px\('Purchase',\{value:val,currency:'USD',content_name:'Season 01',num_items:nk\},id\)/);
    assert.match(html, /season1_tap_to_welcome/);
    assert.match(html, /data-value="80"/);
    assert.match(html, /<h1 [^>]*data-clarity-mask="true">Great, Sam's in!<\/h1>/);
    assert.match(html, /<div data-clarity-mask="true"><div class="line"><span>Sam, Season 01/);
    assert.doesNotMatch(html, /\{\{[A-Z0-9_]+\}\}|debug_mode/);
  });

  it("analytics: paid on the branch deploy renders only the QA gate", async () => {
    const { html } = await onHost(order("paid"), "season1-commit--ekuzo.netlify.app");
    assert.match(html, /s1 QA gate/);
    const outside = html.replace(/<script>\/\* s1 QA gate[\s\S]*?<\/script>/, "");
    assert.doesNotMatch(outside, /googletagmanager|fbevents|clarity\.ms|facebook\.com/);
  });

  it("analytics: the paid script fires one Pixel Purchase (order id, server value) and one tap timing", async () => {
    const { html } = await onHost(order("paid"), "ekuzo.gg");
    const code = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const local = new Map<string, string>();
    function run(session: Map<string, string>) {
      const doc = {
        cookie: "",
        head: { appendChild() {} },
        documentElement: {},
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
        getElementById: (id: string) =>
          id === "s1p" ? { getAttribute: (a: string) => ({ "data-id": "ord1unit", "data-value": "80", "data-kids": "1", "data-code": "1" })[a] ?? null } : null,
      };
      // key(i) order shifts after every removal (Chromium did this in Sentry phase 4): here it rotates one place
      // right per removeItem, which makes a loop that removes while walking key(i) skip a confirmed flag.
      const store = (m: Map<string, string>) => {
        let removed = 0;
        const order = () => {
          const k = [...m.keys()];
          const r = k.length ? removed % k.length : 0;
          return k.slice(k.length - r).concat(k.slice(0, k.length - r));
        };
        return {
          getItem: (k: string) => m.get(k) ?? null,
          setItem: (k: string, v: string) => void m.set(k, v),
          removeItem: (k: string) => { m.delete(k); removed++; },
          key: (i: number) => order()[i] ?? null,
          get length() { return m.size; },
        };
      };
      const win: Record<string, unknown> = {
        document: doc,
        location: { href: "https://ekuzo.gg/season1/join/welcome", search: "", origin: "https://ekuzo.gg", pathname: "/season1/join/welcome", hostname: "ekuzo.gg", protocol: "https:" },
        localStorage: store(local),
        sessionStorage: store(session),
        performance: { timeOrigin: 1_000_000, now: () => 4_400 },
        history: { state: null, replaceState() {} },
        URL, URLSearchParams, Date, Number, Math, String,
        setTimeout: () => 0,
        navigator: {},
      };
      win.window = win;
      const ctx = vm.createContext(win);
      for (const c of code) vm.runInContext(c, ctx);
      const q = (v: unknown) => JSON.parse(JSON.stringify(((v as unknown[]) ?? []).map((a) => Array.from(a as ArrayLike<unknown>))));
      return { fb: q((win.fbq as { queue: unknown[] }).queue) as unknown[][], dl: q(win.dataLayer) as unknown[][], doc };
    }
    const session = new Map([["s1_tap", "1000000"], ["s1_attempt", "a-b-c-d-e-f"], ["s1_confirmed_a-b-c-d-e-f", "1"], ["s1_ic_a-b-c-d-e-f", "1"], ["other", "keep"], ["s1_confirmed_old-attempt", "1"], ["s1_ic_old-attempt", "1"], ["zz", "keep"]]);
    const first = run(session);
    assert.deepEqual(first.fb.filter((a) => a[1] === "Purchase"), [["track", "Purchase", { value: 80, currency: "USD", content_name: "Season 01", num_items: 1 }, { eventID: "ord1unit" }]]);
    assert.deepEqual(first.dl.filter((a) => a[0] === "event").map((a) => [a[1], a[2]]).filter((a) => a[0] !== "purchase"), [["season1_tap_to_welcome", { ms: 4400 }]]);
    assert.equal(first.dl.filter((a) => a[1] === "purchase").length, 1);
    assert.deepEqual([...session.keys()], ["other", "zz"], "s1_tap, the attempt and every flag are cleared");
    assert.match(String(first.doc.cookie), /s1_px_ord1unit=1; Path=\/season1/);
    // Reload of the paid page: no second Purchase, no second GA purchase, no timing.
    const again = run(new Map());
    assert.equal(again.fb.filter((a) => a[1] === "Purchase").length, 0);
    assert.equal(again.dl.filter((a) => a[0] === "event").length, 0);
  });
});
