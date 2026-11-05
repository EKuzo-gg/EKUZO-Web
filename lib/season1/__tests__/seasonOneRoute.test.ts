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
let ipCounts = new Map<string, number>(); // the hourly s1ip: counters the claim statement bumps
let tkCounts = new Map<string, number>(); // hit() counters (text-karlin cap)
let eventBody = ""; // body of a failed Klaviyo event (a real one can echo the email)
let subscribeStatus = 202;

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
      if (/^\s*insert into s1_rate_limits/.test(q.query)) {
        // hit(): [key, window, livemode] -> count after increment
        const n = (tkCounts.get(String(q.params[0])) ?? 0) + 1;
        tkCounts.set(String(q.params[0]), n);
        return { command: "INSERT", rowCount: 1, fields: [{ name: "count", dataTypeID: 23 }], rows: [[n]] };
      }
      if (/^select 1 from s1_rate_limits/.test(q.query)) {
        const hitRow = seenKeys.has(String(q.params[0]));
        return { command: "SELECT", rowCount: hitRow ? 1 : 0, fields: [{ name: "?column?", dataTypeID: 23 }], rows: hitRow ? [[1]] : [] };
      }
      if (!/with seen as/.test(q.query)) return rowsFor([]);
      // The claim statement's contract: read seen keys, claim the rest (a repeat claims its ev key),
      // and bump the hour's counters for params[3] only when the email key was claimed (new).
      const wanted = pgArray(q.params[0]);
      const emailKey = String(q.params[2]);
      const seen = wanted.filter((k) => seenKeys.has(k));
      const rows: unknown[][] = seen.map((k) => ["seen", k, 0]);
      for (const k of wanted) seenKeys.add(k);
      if (!seen.includes(emailKey)) {
        for (const k of pgArray(q.params[3])) {
          const n = (ipCounts.get(k) ?? 0) + 1;
          ipCounts.set(k, n);
          rows.push(["ip", k, n]);
        }
      }
      return { command: "SELECT", rowCount: rows.length, fields: [{ name: "kind", dataTypeID: 25 }, { name: "key", dataTypeID: 25 }, { name: "n", dataTypeID: 23 }], rows };
    });
    if (queries.length === 1 && !body.queries) return json(results[0]);
    return json({ results });
  }
  if (u.includes("a.klaviyo.com")) {
    klaviyo.push({ path: u.split("/api/")[1], body });
    const isEvent = u.endsWith("/events");
    if (!isEvent && subscribeGate) await subscribeGate;
    return new Response(isEvent ? (eventStatus >= 400 ? eventBody : "") : "{}", { status: isEvent ? eventStatus : subscribeStatus });
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
    ipCounts = new Map();
    tkCounts = new Map();
    eventBody = "";
    subscribeStatus = 202;
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

  it("honeypot never calls the database; steps with a matching sign-up write their events and send no Lead (R3.3, M7)", async () => {
    const hp = await post(signup({ ekz_hp: "bot" }));
    assert.deepEqual(hp, { status: 200, body: { ok: true } });
    assert.equal(neonCalls.length, 0, "honeypot: no database call");
    seenKeys.add(emailKey("p@example.com"));
    seenKeys.add(evKey("evt-step-0001", "p@example.com"));
    await post({ email: "p@example.com", step: "games", kidGames: "Minecraft", eventId: "evt-step-0001" });
    await post({ email: "p@example.com", step: "age", kidAge: "10-12", eventId: "evt-step-0001" });
    await post({ email: "p@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19", eventId: "evt-step-0001" });
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
    seenKeys.add(emailKey("k@example.com")); // an old page sends no eventId: the email key is enough
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

describe("POST /api/season-one: round 2 relay (S2 items 1 to 4, 7 to 10)", () => {
  const OFFER_SMS = "(832) 271-0150"; // OFFER.textKarlinSms (+18322710150) formatted for a parent
  const HOUR_SQL = /to_timestamp\(floor\(extract\(epoch from now\(\)\) \/ 3600\) \* 3600\)/;
  const ipH = (ip: string, extra: Record<string, string> = {}) => ({ "x-nf-client-connection-ip": ip, ...extra });
  const ipKey = (material: string) => `s1ip:${keyHash(material)}`;
  const countedKeys = () => pgArray(claimSql()!.params[3]);
  const em = (i: number) => `family${i}@example.com`;
  let logs: string[] = [];
  const capture = () => {
    logs = [];
    const f = (...a: unknown[]) => void logs.push(a.map(String).join(" "));
    console.log = console.warn = console.error = f;
  };

  before(() => {
    for (const k of ["DATABASE_URL", "KLAVIYO_PRIVATE_API_KEY", "S1_REF_SECRET", "STRIPE_SECRET_KEY", "META_CAPI_ACCESS_TOKEN", "META_PIXEL_ID"]) saved[k] = saved[k] ?? process.env[k];
    process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    process.env.META_CAPI_ACCESS_TOKEN = "unit-meta-token";
    process.env.META_PIXEL_ID = "1234567890";
    globalThis.fetch = fakeFetch as typeof fetch;
  });
  after(() => {
    globalThis.fetch = realFetch;
    Object.assign(console, realConsole);
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
    ipCounts = new Map();
    tkCounts = new Map();
    eventBody = "";
    subscribeStatus = 202;
    capture();
  });

  it("items 1, 3: the limiter rides the claim's one transaction, counts a floored hour window, key is a hash of the nf IP only", async () => {
    await post(signup(), ipH("203.0.113.9", { "x-forwarded-for": "198.51.100.7" }));
    assert.equal(neonCalls.length, 1, "one round trip");
    assert.equal(neonCalls[0].length, 2, "lock + one claim statement");
    const q = claimSql()!.query;
    assert.match(q, HOUR_SQL, "window_start floored to the hour (the hit() convention; the 2x edge is accepted)");
    assert.match(q, /on conflict \(key, window_start\) do update set count = s1_rate_limits\.count \+ 1/);
    assert.match(q, /where exists \(select 1 from claimed where key = \$3::text\)/, "counts only when this call claimed the email key (new)");
    assert.deepEqual(countedKeys(), [ipKey("203.0.113.9"), "s1ip:global"]);
    assert.ok(!JSON.stringify(neonCalls).includes("203.0.113.9"), "no raw IP in the database");
    assert.ok(!JSON.stringify(neonCalls).includes("198.51.100.7"));
  });

  it("item 1: no nf header means no per-IP key, even with x-forwarded-for; an invalid nf value is skipped too", async () => {
    await post(signup(), { "x-forwarded-for": "198.51.100.7" });
    assert.deepEqual(countedKeys(), ["s1ip:global"]);
    neonCalls.length = 0;
    await post(signup({ email: "b@example.com" }), ipH("not-an-ip"));
    assert.deepEqual(countedKeys(), ["s1ip:global"]);
    for (let i = 0; i < 40; i++) assert.equal((await post(signup({ email: em(i) }))).status, 200, "never 429 without an IP");
  });

  it("item 1: IPv6 keys on the /64; ::ffff: mapped v4 keys as v4", async () => {
    const keyFor = async (ip: string) => {
      neonCalls.length = 0;
      await post(signup({ email: `v${Math.random()}@example.com` }), ipH(ip));
      return countedKeys()[0];
    };
    const a = await keyFor("2001:db8:1:2:aaaa:bbbb:cccc:dddd");
    assert.equal(a, ipKey("v6:2001:0db8:0001:0002"));
    assert.equal(await keyFor("2001:0db8:0001:0002::1"), a, "same /64, other host bits and spelling");
    assert.notEqual(await keyFor("2001:db8:1:3::1"), a, "another /64");
    assert.equal(await keyFor("2001:db8::1"), ipKey("v6:2001:0db8:0000:0000"), "compressed form expands");
    assert.equal(await keyFor("::ffff:203.0.113.9"), ipKey("203.0.113.9"), "mapped v4");
    assert.equal(await keyFor("::ffff:cb00:7109"), ipKey("203.0.113.9"), "hex-spelled mapped v4");
  });

  it("item 4: 10 new sign-ups an hour from one IP are normal; the 11th to 30th are quiet (event, subscribe, no Lead, {ok:true,quiet:true})", async () => {
    for (let i = 1; i <= 10; i++) assert.deepEqual((await post(signup({ email: em(i), eventId: `evt-q-${1000 + i}` }), ipH("203.0.113.9"))).body, { ok: true });
    assert.equal(graph.length, 10);
    klaviyo = [];
    graph = [];
    for (let i = 11; i <= 30; i++) {
      const r = await post(signup({ email: em(i), eventId: `evt-q-${1000 + i}` }), ipH("203.0.113.9"));
      assert.deepEqual(r, { status: 200, body: { ok: true, quiet: true } });
    }
    assert.equal(graph.length, 0, "no CAPI Lead while quiet");
    assert.equal(events().length, 20);
    assert.equal(events()[0].metric.data.attributes.name, "Season 01 Waitlist");
    assert.equal(subscribes().length, 20);
    assert.ok(logs.some((l) => l === "Season 01 sign-up quiet: reason=ip_quiet"));
  });

  it("item 4: the 31st is a 429 with the founder-text copy, nothing sent, the claim released, a warn with no IP or email", async () => {
    for (let i = 1; i <= 30; i++) await post(signup({ email: em(i), eventId: `evt-r-${1000 + i}` }), ipH("203.0.113.9"));
    klaviyo = [];
    graph = [];
    const r = await post(signup({ email: em(31), eventId: "evt-r-1031" }), ipH("203.0.113.9"));
    assert.equal(r.status, 429);
    assert.deepEqual(Object.keys(r.body).sort(), ["error", "ok"]);
    assert.deepEqual(r.body, { ok: false, error: `We couldn’t save your sign-up just now. Text our founder at ${OFFER_SMS} and we’ll add you by hand.` });
    assert.equal(klaviyo.length, 0, "nothing written to Klaviyo");
    assert.equal(graph.length, 0);
    assert.ok(!seenKeys.has(emailKey(em(31))), "claim released, so a hand-added or later attempt reads as new");
    const line = logs.find((l) => l.startsWith("Season 01 sign-up rate limited"));
    assert.equal(line, "Season 01 sign-up rate limited: reason=ip_limit");
  });

  it("item 4: repeats, retries and failed sign-ups do not count toward the IP hour", async () => {
    await post(signup(), ipH("203.0.113.9"));
    assert.equal(ipCounts.get(ipKey("203.0.113.9")), 1);
    await post(signup(), ipH("203.0.113.9")); // retry
    await post(signup({ eventId: "evt-rep-0002" }), ipH("203.0.113.9")); // repeat
    assert.equal(ipCounts.get(ipKey("203.0.113.9")), 1, "retry and repeat add nothing");
    eventStatus = 500;
    assert.equal((await post(signup({ email: "fail@example.com" }), ipH("203.0.113.9"))).status, 502);
    // The failed one did count in the database (it was classified new), then released its email claim: documented, not a family's budget burn beyond one slot.
    assert.equal(ipCounts.get(ipKey("203.0.113.9")), 2);
  });

  it("item 4: past 150 new sign-ups an hour across all IPs every further one is quiet, with or without an IP", async () => {
    ipCounts.set("s1ip:global", 150);
    const a = await post(signup({ email: "g1@example.com" }), ipH("198.51.100.1"));
    assert.deepEqual(a.body, { ok: true, quiet: true });
    const b = await post(signup({ email: "g2@example.com" }));
    assert.deepEqual(b.body, { ok: true, quiet: true });
    assert.equal(graph.length, 0);
    assert.ok(logs.some((l) => l === "Season 01 sign-up quiet: reason=global_quiet"));
  });

  it("items 1 to 4 fail open: a database error or a slow one is a normal sign-up (no quiet, no 429)", async () => {
    ipCounts.set("s1ip:global", 999);
    dbMode = "throw";
    assert.deepEqual((await post(signup(), ipH("203.0.113.9"))).body, { ok: true });
    dbMode = "hang";
    const t0 = Date.now();
    assert.deepEqual((await post(signup({ email: "slow@example.com" }), ipH("203.0.113.9"))).body, { ok: true });
    assert.ok(Date.now() - t0 < 1400, "answered at the 800 ms cap");
    assert.equal(graph.length, 2);
  });

  it("item 2: the Meta Lead takes the IP from x-nf-client-connection-ip only", async () => {
    await post(signup(), ipH("203.0.113.9", { "x-forwarded-for": "198.51.100.7" }));
    assert.equal(graph[0].body.data[0].user_data.client_ip_address, "203.0.113.9");
    graph = [];
    seenKeys = new Set();
    await post(signup(), { "x-forwarded-for": "198.51.100.7" });
    assert.equal(graph[0].body.data[0].user_data.client_ip_address, undefined, "a client-set XFF never reaches Meta");
    graph = [];
    seenKeys = new Set();
    await post(signup(), ipH("garbage", { "x-forwarded-for": "198.51.100.7" }));
    assert.equal(graph[0].body.data[0].user_data.client_ip_address, undefined);
  });

  it("item 8 (R2-D11): a repeat claims its own ev key, so its Text Karlin and games steps are accepted; a stranger's random eventId with no sign-up is still dropped", async () => {
    await post(signup());
    const r = await post(signup({ eventId: "evt-rep-0001" }));
    assert.deepEqual(r.body, { ok: true, repeat: true });
    assert.ok(seenKeys.has(evKey("evt-rep-0001")), "the repeat's ev key is claimed");
    assert.equal(ipCounts.get("s1ip:global"), 1, "the repeat still does not count toward the hour");
    klaviyo = [];
    await post({ email: "parent.one+kid@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19", eventId: "evt-rep-0001" });
    await post({ email: "parent.one+kid@example.com", step: "games", kidGames: "Roblox", eventId: "evt-rep-0001" });
    assert.deepEqual(events().map((e) => e.metric.data.attributes.name), ["Season 01 Text Karlin", "Season 01 Waitlist Games"]);
    klaviyo = [];
    const stranger = await post({ email: "nobody@example.com", step: "games", kidGames: "Roblox", eventId: "evt-rand-9999" });
    assert.deepEqual(stranger, { status: 200, body: { ok: true } });
    assert.equal(klaviyo.length, 0, "no sign-up, nothing written");
    assert.ok(logs.includes("Season 01 step_dropped step=games reason=no_signup"));
  });

  it("item 7: a step with an eventId needs that ev key; a match writes the event", async () => {
    await post(signup());
    klaviyo = [];
    const ok = await post({ email: "parent.one+kid@example.com", step: "games", kidGames: "Minecraft", eventId: "evt-aaaa-1111" });
    assert.deepEqual(ok, { status: 200, body: { ok: true } });
    assert.equal(events().length, 1);
    const lock = neonCalls.flat().filter((q) => /^select 1 from s1_rate_limits/.test(q.query)).pop()!;
    assert.match(lock.query, /window_start > now\(\) - interval '24 hours' limit 1$/);
    assert.deepEqual(lock.params, [evKey("evt-aaaa-1111")]);
    klaviyo = [];
    const wrong = await post({ email: "parent.one+kid@example.com", step: "age", kidAge: "10-12", eventId: "evt-zzzz-9999" });
    assert.deepEqual(wrong, { status: 200, body: { ok: true } });
    assert.equal(klaviyo.length, 0, "a wrong eventId writes nothing");
  });

  it("item 7: a step without an eventId (an old cached page) needs the email key, no more", async () => {
    await post(signup());
    klaviyo = [];
    await post({ email: "parent.one+kid@example.com", step: "age", kidAge: "13-15" });
    assert.equal(events().length, 1);
    assert.deepEqual(neonCalls.flat().filter((q) => /^select 1 from/.test(q.query)).pop()!.params, [emailKey()]);
    klaviyo = [];
    const stranger = await post({ email: "never.signed.up@example.com", step: "age", kidAge: "13-15" });
    assert.deepEqual(stranger, { status: 200, body: { ok: true } }, "same answer as a match: no oracle");
    assert.equal(klaviyo.length, 0);
  });

  it("item 7: a dropped step logs step_dropped with the step name and a reason, no PII", async () => {
    for (const step of ["games", "age", "text-karlin"] as const) {
      const body = step === "games" ? { kidGames: "Roblox" } : step === "age" ? { kidAge: "10-12" } : { phone: "+15125550123" };
      await post({ email: "stranger.pii@example.com", step, eventId: "evt-nope-0001", ...body }, ipH("203.0.113.77"));
    }
    const dropped = logs.filter((l) => l.includes("step_dropped"));
    assert.deepEqual(dropped, [
      "Season 01 step_dropped step=games reason=no_signup",
      "Season 01 step_dropped step=age reason=no_signup",
      "Season 01 step_dropped step=text-karlin reason=no_signup",
    ]);
  });

  it("item 7: the step lock fails open on a database error and on an answer slower than 800 ms", async () => {
    dbMode = "throw";
    await post({ email: "o@example.com", step: "games", kidGames: "Roblox", eventId: "evt-open-0001" });
    assert.equal(events().length, 1, "error: proceeds");
    klaviyo = [];
    dbMode = "hang";
    const t0 = Date.now();
    await post({ email: "o@example.com", step: "age", kidAge: "10-12", eventId: "evt-open-0001" });
    const ms = Date.now() - t0;
    assert.ok(ms >= 780 && ms < 1400, `capped at 800 ms, took ${ms}`);
    assert.equal(events().length, 1, "slow: proceeds");
    klaviyo = [];
    delete process.env.DATABASE_URL;
    try {
      await post({ email: "o@example.com", step: "games", kidGames: "Roblox", eventId: "evt-open-0001" });
    } finally {
      process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    }
    assert.equal(events().length, 1, "no database: proceeds");
  });

  it("item 7: text-karlin is capped at 3 per email per 24 h (hashed key); the 4th is a silent drop", async () => {
    seenKeys.add(emailKey("t@example.com"));
    for (let i = 0; i < 3; i++) await post({ email: "t@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19" });
    assert.equal(events().length, 3);
    const hitCall = neonCalls.flat().find((q) => /^\s*insert into s1_rate_limits/.test(q.query))!;
    assert.deepEqual([hitCall.params[0], hitCall.params[1]], [`s1tk:${keyHash("t@example.com")}`, "86400"]);
    klaviyo = [];
    const r = await post({ email: "t@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19" });
    assert.deepEqual(r, { status: 200, body: { ok: true } });
    assert.equal(klaviyo.length, 0);
    assert.ok(logs.includes("Season 01 step_dropped step=text-karlin reason=cap"));
    klaviyo = [];
    await post({ email: "t2@example.com", step: "text-karlin", phone: "+15125550123", ad: "d19" });
    assert.equal(events().length, 0, "another email without a sign-up is dropped, not counted against t@");
  });

  it("item 10: a cross-site browser POST is 403 with nothing written; same-site and no-Origin pass", async () => {
    const cross = await post(signup(), { "sec-fetch-site": "cross-site" });
    assert.equal(cross.status, 403);
    const badOrigin = await post(signup(), { origin: "https://evil.example", host: "ekuzo.gg" });
    assert.equal(badOrigin.status, 403);
    assert.equal(klaviyo.length, 0);
    assert.equal(neonCalls.length, 0);
    assert.equal((await post(signup({ email: "s@example.com" }), { "sec-fetch-site": "same-origin" })).status, 200);
    assert.equal((await post(signup({ email: "s2@example.com" }), { origin: "https://ekuzo.gg", host: "ekuzo.gg" })).status, 200);
    assert.equal((await post(signup({ email: "s3@example.com" }))).status, 200, "curl: no Origin");
  });

  it("item 11: response keys are only ok plus repeat, quiet or error", async () => {
    const allowed = new Set(["ok", "repeat", "quiet", "error"]);
    ipCounts.set("s1ip:global", 150);
    const rs = [
      await post(signup({ email: "k1@example.com" })),
      await post(signup({ email: "k1@example.com", eventId: "evt-keys-0002" })),
      await post({ email: "k1@example.com", step: "games", kidGames: "Roblox", eventId: "evt-aaaa-1111" }),
      await post({ email: "nope" }),
    ];
    for (const r of rs) for (const k of Object.keys(r.body)) assert.ok(allowed.has(k), `unexpected key ${k}`);
    assert.deepEqual(Object.keys(rs[0].body).sort(), ["ok", "quiet"]);
  });

  it("item 9, 11: a sentinel email and IP never appear in any console call, across every path", async () => {
    const EMAIL = "sentinel.person@example.com";
    const IPS = ["203.0.113.77", "2001:db8:77:77::5"];
    const H = ipH(IPS[0]);
    // quiet and 429
    ipCounts.set(ipKey(IPS[0]), 10);
    await post(signup({ email: EMAIL }), H);
    ipCounts.set(ipKey("v6:2001:0db8:0077:0077"), 30);
    await post(signup({ email: "sentinel.two@example.com" }), ipH(IPS[1]));
    // step drops and caps
    await post({ email: EMAIL, step: "games", kidGames: "Roblox", eventId: "evt-sent-0001" }, H);
    // Klaviyo failures whose body echoes the email, on every event path
    eventStatus = 500;
    eventBody = JSON.stringify({ errors: [{ detail: `bad profile ${EMAIL} from ${IPS[0]}` }] });
    seenKeys.add(emailKey(EMAIL));
    seenKeys.add(evKey("evt-sent-0001", EMAIL));
    await post({ email: EMAIL, step: "games", kidGames: "Roblox", eventId: "evt-sent-0001" }, H);
    await post({ email: EMAIL, step: "age", kidAge: "10-12", eventId: "evt-sent-0001" }, H);
    await post({ email: EMAIL, step: "text-karlin", phone: "+15125550123", eventId: "evt-sent-0001" }, H);
    await post(signup({ email: EMAIL, eventId: "evt-sent-0002" }), H); // repeat event fails
    await post(signup({ email: "sentinel.three@example.com" }), H); // new event fails: 502
    eventStatus = 200;
    subscribeStatus = 500;
    await post(signup({ email: "sentinel.four@example.com" }), H);
    // database down
    dbMode = "throw";
    await post(signup({ email: "sentinel.five@example.com" }), H);
    assert.ok(logs.length > 8, "the paths logged something");
    for (const l of logs) {
      assert.ok(!/sentinel|example\.com/i.test(l), `email in log: ${l}`);
      for (const ip of IPS) assert.ok(!l.includes(ip) && !l.includes(ip.split(":").slice(0, 4).join(":")), `IP in log: ${l}`);
    }
    assert.ok(logs.some((l) => /Klaviyo games event failed: 500$/.test(l)), "failures log the status only");
  });

  it("item 9: the route source has no r.text() in a log and no raw email in the missing-key line", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../../../app/api/season-one/route.ts", import.meta.url), "utf8");
    assert.ok(!/\.text\(\)/.test(src), "no response body is read for logging");
    assert.match(src, /console\.error\("KLAVIYO_PRIVATE_API_KEY not set: Season 01 sign-up lost"\);/);
    assert.ok(!/x-forwarded-for['"]\)/.test(src), "x-forwarded-for is never read");
  });
});
