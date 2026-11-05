import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * POST /api/season-one, W3 server side (R3.1 to R3.5, R3.11, R2.1, R2.2, M1, M3, M4, M6, M7).
 * fetch is mocked: Neon HTTP (neon.tech, a small in-memory s1_rate_limits that honors the
 * claim statement's contract), Klaviyo and the Meta Graph API. No real network or database.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const realConsole = { log: console.log, warn: console.warn, error: console.error };

type Sent = { query: string; params: unknown[] };
const neonCalls: Sent[][] = []; // one entry per transaction
let klaviyo: { path: string; body: any }[] = [];
let graph: { body: any }[] = [];
let seenKeys = new Set<string>();
let dbMode: "ok" | "throw" | "hang" = "ok";
let eventStatus = 200;
let releaseFails = false;
let releaseHangs = false;
let subscribeGate: Promise<void> | null = null; // SA-2: holds the subscribe response

// The Neon driver sends a JS array parameter as a Postgres array literal: {"a","b"}.
const pgArray = (v: unknown) => String(v).replace(/^\{|\}$/g, "").split(",").map((x) => x.replace(/^"|"$/g, "")).filter(Boolean);
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const rowsFor = (keys: string[]) => ({ command: "SELECT", rowCount: keys.length, fields: [{ name: "key", dataTypeID: 25 }], rows: keys.map((k) => [k]) });

async function fakeFetch(url: unknown, init?: RequestInit) {
  const u = String(url);
  const body = JSON.parse(String(init?.body ?? "{}"));
  if (u.includes("neon.tech")) {
    const queries: Sent[] = body.queries ?? [{ query: body.query, params: body.params }];
    neonCalls.push(queries);
    if (dbMode === "throw") return json({ message: "db down" }, 500);
    if (dbMode === "hang") {
      await new Promise((r) => setTimeout(r, 1500));
      return json({ message: "late" }, 500);
    }
    if (queries.some((q) => /^delete from s1_rate_limits/.test(q.query))) {
      if (releaseHangs) {
        await new Promise((r) => setTimeout(r, 1500));
        return json({ message: "late" }, 500);
      }
      if (releaseFails) return json({ message: "db down" }, 500);
      for (const k of pgArray(queries[0].params[0])) seenKeys.delete(k);
      return json({ command: "DELETE", rowCount: 1, fields: [], rows: [] });
    }
    const results = queries.map((q) => {
      if (!/from s1_rate_limits/.test(q.query)) return rowsFor([]);
      const wanted = pgArray(q.params[0]);
      const seen = wanted.filter((k) => seenKeys.has(k));
      for (const k of wanted) seenKeys.add(k);
      return rowsFor(seen);
    });
    return json({ results });
  }
  if (u.includes("a.klaviyo.com")) {
    klaviyo.push({ path: u.split("/api/")[1], body });
    const isEvent = u.endsWith("/events");
    if (!isEvent && subscribeGate) await subscribeGate;
    return new Response(isEvent ? "" : "{}", { status: isEvent ? eventStatus : 202 });
  }
  if (u.includes("graph.facebook.com")) {
    graph.push({ body });
    return json({ events_received: 1 });
  }
  throw new Error("unit: unexpected network call " + u);
}

const events = () => klaviyo.filter((c) => c.path === "events").map((c) => c.body.data.attributes);
const subscribes = () => klaviyo.filter((c) => c.path.startsWith("profile-subscription"));
const claimSql = () => neonCalls.flat().find((q) => /from s1_rate_limits/.test(q.query));

let keyHash: (v: string) => string;
const post = async (payload: Record<string, unknown>, headers: Record<string, string> = {}) => {
  const { POST } = await import("../../../app/api/season-one/route");
  const { NextRequest } = await import("next/server");
  const r = await POST(
    new NextRequest("http://localhost:3103/api/season-one", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(payload),
    }),
  );
  return { status: r.status, body: (await r.json()) as Record<string, unknown> };
};
const signup = (extra: Record<string, unknown> = {}) => ({ email: "Parent.One+kid@example.com", source: "ad-landing", ad: "d19", eventId: "evt-aaaa-1111", ...extra });
const emailKey = (e = "parent.one+kid@example.com") => `s1wl:em:${keyHash(e)}`;
const evKey = (id: string, e = "parent.one+kid@example.com") => `s1wl:ev:${keyHash(`${e}|${id}`)}`;

describe("POST /api/season-one: 24 h classification (W3)", () => {
  before(async () => {
    for (const k of ["DATABASE_URL", "KLAVIYO_PRIVATE_API_KEY", "S1_REF_SECRET", "STRIPE_SECRET_KEY", "META_CAPI_ACCESS_TOKEN", "META_PIXEL_ID", "META_CAPI_USE_TEST_CODE"]) saved[k] = process.env[k];
    // The Neon test endpoint shape mode.ts accepts, built by concatenation (no inline credentials).
    process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.KLAVIYO_PRIVATE_API_KEY = "unit-klaviyo-key";
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    process.env.STRIPE_SECRET_KEY = "unit-not-a-live-key";
    process.env.META_CAPI_ACCESS_TOKEN = "unit-meta-token";
    process.env.META_PIXEL_ID = "1234567890";
    delete process.env.META_CAPI_USE_TEST_CODE;
    globalThis.fetch = fakeFetch as typeof fetch;
    // The route logs on purpose (CAPI sent, skipped checks); keep it out of the runner's report stream.
    console.log = console.warn = console.error = () => {};
    keyHash = (await import("../rules")).keyHash;
  });
  after(() => {
    globalThis.fetch = realFetch;
    Object.assign(console, realConsole);
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  beforeEach(() => {
    neonCalls.length = 0;
    klaviyo = [];
    graph = [];
    seenKeys = new Set();
    dbMode = "ok";
    eventStatus = 200;
    releaseFails = false;
    releaseHangs = false;
    subscribeGate = null;
  });

  it("new: full path, one Waitlist event, one subscribe, one Lead, body {ok:true} only (R3.1, R3.2, R3.11)", async () => {
    const r = await post(signup());
    assert.deepEqual(r, { status: 200, body: { ok: true } });
    assert.equal(events().length, 1);
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.equal(subscribes().length, 1);
    assert.equal(graph.length, 1);
  });

  it("the lock statement precedes the claim in one transaction; keys are keyHash values, no raw email (R3.1, R3.11, D16)", async () => {
    await post(signup());
    assert.equal(neonCalls.length, 1, "one transaction");
    const [lock, claim] = neonCalls[0];
    assert.match(lock.query, /pg_advisory_xact_lock\(hashtext\(\$1\)\)/);
    assert.deepEqual(lock.params, [emailKey()]);
    assert.match(claim.query, /from s1_rate_limits/);
    assert.deepEqual(pgArray(claim.params[0]), [emailKey(), evKey("evt-aaaa-1111")]);
    assert.ok(!JSON.stringify(neonCalls).includes("example.com"), "no raw email reaches the database");
  });

  it("the 24 h boundary lives in the SQL (rolling interval, claim at now()) (R3.11, M4)", async () => {
    await post(signup());
    const q = claimSql()!.query;
    assert.match(q, /window_start > now\(\) - interval '24 hours'/);
    assert.match(q, /on conflict do nothing/);
    assert.match(q, /select k, now\(\), 1, \$2::boolean/);
  });

  it("'+' addresses hash like any other address (R3.11)", async () => {
    await post(signup({ email: "A+b@Example.com" }));
    assert.deepEqual(pgArray(claimSql()!.params[0]), [emailKey("a+b@example.com"), evKey("evt-aaaa-1111", "a+b@example.com")]);
    assert.notEqual(emailKey("a+b@example.com"), emailKey("a@example.com"));
  });

  it("retry (same email, same eventId): the full path again, one Lead per attempt id, body {ok:true} (R3.1, R3.2, M1, M3)", async () => {
    await post(signup());
    klaviyo = [];
    graph = [];
    const r = await post(signup());
    assert.deepEqual(r.body, { ok: true });
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.equal(subscribes().length, 1);
    assert.equal(graph.length, 1);
    assert.equal(graph[0].body.data[0].event_id, "evt-aaaa-1111", "Meta dedupes on the shared event_id");
  });

  it("repeat (same email, new eventId): Repeat event, no profile props, subscribe, no Lead, {ok:true,repeat:true} (R3.1, R3.2, R3.11)", async () => {
    await post(signup());
    klaviyo = [];
    graph = [];
    const r = await post(signup({ eventId: "evt-bbbb-2222", ad: "d18" }));
    assert.deepEqual(r, { status: 200, body: { ok: true, repeat: true } });
    const ev = events();
    assert.equal(ev.length, 1);
    assert.equal(ev[0].metric.data.attributes.name, "Season 01 Waitlist Repeat");
    assert.deepEqual(ev[0].profile.data.attributes.properties, {}, "no season1_* profile prop is written");
    assert.equal(ev[0].properties.ad, "d18", "event props carry the second ad for attribution");
    assert.equal(ev[0].properties.source, "ad-landing");
    assert.equal(ev[0].unique_id, "parent.one+kid@example.com-Season 01 Waitlist Repeat-evt-bbbb-2222");
    assert.equal(subscribes().length, 1);
    assert.equal(graph.length, 0, "no CAPI Lead");
  });

  it("a failed Repeat event is logged and still returns repeat:true (R3.2)", async () => {
    await post(signup());
    klaviyo = [];
    eventStatus = 500;
    const r = await post(signup({ eventId: "evt-cccc-3333" }));
    assert.deepEqual(r, { status: 200, body: { ok: true, repeat: true } });
    assert.equal(subscribes().length, 1);
  });

  it("no eventId: only the email key is claimed, and a second request is a repeat (R3.1)", async () => {
    await post(signup({ eventId: undefined }));
    assert.deepEqual(pgArray(claimSql()!.params[0]), [emailKey()]);
    const r = await post(signup({ eventId: undefined }));
    assert.deepEqual(r.body, { ok: true, repeat: true });
  });

  it("Waitlist unique_id is email-metric-eventId with a sanitized eventId, else today's timestamp form (R3.4)", async () => {
    await post(signup({ eventId: "ev/../ent-1!" }));
    assert.equal(events()[0].unique_id, "parent.one+kid@example.com-Season 01 Waitlist-ev..ent-1".replace("..", ""));
    klaviyo = [];
    await post(signup({ email: "other@example.com", eventId: "   " }));
    assert.match(events()[0].unique_id, /^other@example\.com-Season 01 Waitlist-\d{10,}$/);
  });

  it("fail open: no DATABASE_URL is new, and the database is never called (R3.3, M4)", async () => {
    const url = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      assert.deepEqual((await post(signup())).body, { ok: true });
      assert.deepEqual((await post(signup({ eventId: "evt-other-9999" }))).body, { ok: true });
    } finally {
      process.env.DATABASE_URL = url;
    }
    assert.equal(neonCalls.length, 0);
    assert.equal(graph.length, 2, "both are full sign-ups");
  });

  it("fail open: a database error is new, warned once without the email (R3.3, M4)", async () => {
    dbMode = "throw";
    const warns: string[] = [];
    const w = console.warn;
    console.warn = (...a: unknown[]) => void warns.push(a.map(String).join(" "));
    try {
      const r = await post(signup());
      assert.deepEqual(r, { status: 200, body: { ok: true } });
    } finally {
      console.warn = w;
    }
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.equal(graph.length, 1);
    const line = warns.find((x) => x.startsWith("Season 01 dedupe check skipped:"));
    assert.ok(line, "skip is logged");
    assert.ok(!line.includes("example.com"), "no email in the log");
  });

  it("fail open: a check slower than 800 ms is new (R3.3, M4)", async () => {
    dbMode = "hang";
    const warns: string[] = [];
    const w = console.warn;
    console.warn = (...a: unknown[]) => void warns.push(a.map(String).join(" "));
    const t0 = Date.now();
    try {
      const r = await post(signup());
      assert.deepEqual(r, { status: 200, body: { ok: true } });
    } finally {
      console.warn = w;
    }
    const ms = Date.now() - t0;
    assert.ok(ms >= 780 && ms < 1400, `answered at the 800 ms cap, took ${ms}`);
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.ok(warns.some((x) => x.includes("no answer in 800 ms")));
  });

  it("fail open: keyHash throwing (no secret) is new (R3.3)", async () => {
    const a = process.env.S1_REF_SECRET;
    delete process.env.S1_REF_SECRET;
    const b = process.env.S1_STRIPE_WEBHOOK_SECRET;
    delete process.env.S1_STRIPE_WEBHOOK_SECRET;
    const w = console.warn;
    console.warn = () => {};
    try {
      assert.deepEqual((await post(signup())).body, { ok: true });
    } finally {
      console.warn = w;
      process.env.S1_REF_SECRET = a;
      if (b !== undefined) process.env.S1_STRIPE_WEBHOOK_SECRET = b;
    }
    assert.equal(neonCalls.length, 0);
  });

  it("honeypot and the games, age and text-karlin steps never call the check (R3.3, M7)", async () => {
    const hp = await post(signup({ ekz_hp: "bot" }));
    assert.deepEqual(hp, { status: 200, body: { ok: true } });
    await post({ email: "p@example.com", step: "games", kidGames: "Minecraft" });
    await post({ email: "p@example.com", step: "age", kidAge: "10-12" });
    await post({ email: "p@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19" });
    assert.equal(neonCalls.length, 0, "no database call");
    assert.equal(graph.length, 0, "no Lead from any of them");
    assert.deepEqual(events().map((e) => e.metric.data.attributes.name), ["Season 01 Waitlist Games", "Season 01 Waitlist Age", "Season 01 Text Karlin"]);
  });

  it("bad email and unknown step also skip the check and write nothing", async () => {
    assert.equal((await post({ email: "nope" })).status, 400);
    assert.equal((await post({ email: "p@example.com", step: "wat" })).status, 400);
    assert.equal(neonCalls.length, 0);
    assert.equal(klaviyo.length, 0);
  });

  it("Klaviyo event failure on a new sign-up is a 502 with no subscribe and no Lead (today's behavior)", async () => {
    eventStatus = 500;
    const r = await post(signup());
    assert.equal(r.status, 502);
    assert.equal(subscribes().length, 0);
    assert.equal(graph.length, 0);
  });

  it("repeat payloads carry no profile data (M6)", async () => {
    await post(signup({ firstName: "Pat" }));
    const r = await post(signup({ eventId: "evt-dddd-4444", firstName: "Pat" }));
    assert.deepEqual(Object.keys(r.body).sort(), ["ok", "repeat"]);
    assert.ok(!JSON.stringify(graph).includes("Pat"), "nothing about the family reaches Meta");
    assert.ok(!JSON.stringify(graph).includes("kid"), "no kid data in the Lead");
  });

  it("the Lead keeps the shared event_id and a hashed email only (M3, M6)", async () => {
    await post(signup());
    const d = graph[0].body.data[0];
    assert.equal(d.event_id, "evt-aaaa-1111");
    assert.equal(d.custom_data.content_name, "season_one_d19");
    assert.match(d.user_data.em[0], /^[0-9a-f]{64}$/);
    assert.ok(!JSON.stringify(d).includes("example.com"));
  });

  it("normalizeAd table through the sign-up: d1 to d99, any case, optional zero; others blank (R2.1, R2.2)", async () => {
    const cases: [unknown, string][] = [["d01", "d1"], ["D19", "d19"], ["d1", "d1"], ["d99", "d99"], [" d7 ", "d7"], ["d0", ""], ["d100", ""], ["d1x", ""], ["", ""], ["  ", ""], [19, ""], [null, ""], [{}, ""]];
    for (const [input, want] of cases) {
      klaviyo = [];
      seenKeys = new Set();
      await post(signup({ ad: input, email: "ad@example.com" }));
      const e = events()[0];
      assert.equal(e.properties.ad, want, `event ad for ${JSON.stringify(input)}`);
      assert.equal(e.profile.data.attributes.properties.season1_ad, want, `profile ad for ${JSON.stringify(input)}`);
    }
  });

  it("R2.2: a main sign-up and a Text Karlin step with d19 write ad d19; the Lead content_name is season_one_d19", async () => {
    await post(signup());
    assert.equal(events()[0].properties.ad, "d19");
    assert.equal(events()[0].profile.data.attributes.properties.season1_ad, "d19");
    assert.equal(graph[0].body.data[0].custom_data.content_name, "season_one_d19");
    klaviyo = [];
    await post({ email: "k@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19" });
    assert.equal(events()[0].properties.ad, "d19");
  });

  it("SA-1: a failed first sign-up releases its claim, so a new eventId is 'new' again (R3.1, M4)", async () => {
    eventStatus = 500;
    assert.equal((await post(signup({ eventId: "evt-f502-b001" }))).status, 502);
    const del = neonCalls.flat().find((q) => /^delete from s1_rate_limits/.test(q.query));
    assert.ok(del, "release ran");
    assert.match(del.query, /window_start > now\(\) - interval '24 hours'/);
    assert.deepEqual(pgArray(del.params[0]), [emailKey(), evKey("evt-f502-b001")]);
    assert.equal(seenKeys.size, 0);
    eventStatus = 200;
    klaviyo = [];
    graph = [];
    const r = await post(signup({ eventId: "evt-f502-b002" }));
    assert.deepEqual(r.body, { ok: true }, "not a repeat");
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.equal(graph.length, 1);
  });

  it("SA-1: a thrown event (timeout) also releases the claim and returns 502", async () => {
    const real = fakeFetch;
    globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
      if (String(url).endsWith("/events")) throw new Error("timeout");
      return real(url, init);
    }) as typeof fetch;
    try {
      assert.equal((await post(signup())).status, 502);
    } finally {
      globalThis.fetch = fakeFetch as typeof fetch;
    }
    assert.equal(seenKeys.size, 0);
  });

  it("SA-1: a release query failure still returns the 502 and logs no email", async () => {
    eventStatus = 500;
    releaseFails = true;
    const warns: string[] = [];
    console.warn = (...a: unknown[]) => void warns.push(a.map(String).join(" "));
    try {
      const r = await post(signup());
      assert.equal(r.status, 502);
      assert.equal(r.body.ok, false);
    } finally {
      console.warn = () => {};
    }
    const line = warns.find((x) => x.startsWith("Season 01 dedupe release failed:"));
    assert.ok(line);
    assert.ok(!line.includes("example.com"));
  });

  it("SA-1: a failed retry releases nothing (it inserted nothing)", async () => {
    await post(signup());
    neonCalls.length = 0;
    eventStatus = 500;
    assert.equal((await post(signup())).status, 502);
    assert.ok(!neonCalls.flat().some((q) => /^delete from/.test(q.query)));
    assert.ok(seenKeys.has(emailKey()), "the first attempt's claim stands");
  });

  it("SA-2: subscribe and the Meta Lead are both started before either resolves (R3.5)", async () => {
    let open!: () => void;
    subscribeGate = new Promise<void>((r) => (open = r));
    const pending = post(signup());
    const deadline = Date.now() + 1000;
    while (Date.now() < deadline && !(subscribes().length === 1 && graph.length === 1)) await new Promise((r) => setTimeout(r, 5));
    assert.equal(subscribes().length, 1, "subscribe started");
    assert.equal(graph.length, 1, "CAPI started while the subscribe is still held");
    open();
    assert.deepEqual((await pending).body, { ok: true });
  });

  it("SA-3: the Repeat event sends no first_name; the Waitlist event still does", async () => {
    await post(signup({ firstName: "Pat" }));
    assert.equal(events()[0].profile.data.attributes.first_name, "Pat");
    klaviyo = [];
    await post(signup({ eventId: "evt-eeee-5555", firstName: "Pat" }));
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist Repeat");
    assert.ok(!("first_name" in events()[0].profile.data.attributes));
  });

  it("SA-6: a release slower than 800 ms is cut off, warned without the email, and the 502 stands", async () => {
    eventStatus = 500;
    releaseHangs = true;
    const warns: string[] = [];
    console.warn = (...a: unknown[]) => void warns.push(a.map(String).join(" "));
    const t0 = Date.now();
    let r;
    try {
      r = await post(signup());
    } finally {
      console.warn = () => {};
    }
    const ms = Date.now() - t0;
    assert.equal(r.status, 502);
    assert.ok(ms >= 780 && ms < 1400, `release capped at 800 ms, took ${ms}`);
    const line = warns.find((x) => x.startsWith("Season 01 dedupe release failed: no answer in 800 ms"));
    assert.ok(line);
    assert.ok(!line.includes("example.com"));
  });
});
