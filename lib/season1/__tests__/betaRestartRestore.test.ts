import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { restartToken } from "../betaRestart";

/**
 * POST /api/season1-beta/restore (docs/beta-restart-link-2026-11/02-frozen-spec.md). fetch is mocked: Neon HTTP
 * (one in-memory s1_beta_progress row set that honors the route's select, plus the rate-limit counter).
 * No real network or database.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const realConsole = { log: console.log, warn: console.warn, error: console.error };
const logs: string[] = [];

type Row = { id: string; email: string; session: string; stage: number; answers: Record<string, unknown>; src: string | null; completed: boolean; ageDays: number; livemode: boolean };
let rows: Row[] = [];
let queries: { query: string; params: unknown[] }[] = [];
let dbMode: "ok" | "throw" | "hang" | "limiter-throw" = "ok";
let counters = new Map<string, number>();

const ROW_ID = "3f2b8c1e-5a47-4d9e-9b0a-7c6d5e4f3a21";
const SESSION = "sess-0001";
const EMAIL = "jamie.parent@example.com";
const baseRow = (): Row => ({
  id: ROW_ID, email: EMAIL, session: SESSION, stage: 1, src: null, completed: false, ageDays: 1, livemode: false,
  answers: {
    playerName: "Maya", playerAge: 12, playsOn: ["Console"], teamSports: "Loves them", superpowers: ["Quick thinker"], funFact: "Knows every flag",
    expectations: ["No toxicity", "Positive mindset", "Winning attitude"],
    timeZone: "Pacific", tz: "America/Vancouver", times: ["Weekday evenings"], note: "Allergic to peanuts, tell the coach",
  },
});

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const T = { uuid: 2950, text: 25, int: 23, bool: 16, jsonb: 3802 };

async function fakeFetch(url: unknown, init?: RequestInit) {
  const u = String(url);
  if (!u.includes("neon.tech")) throw new Error("unit: unexpected network call " + u);
  const body = JSON.parse(String(init?.body ?? "{}"));
  const q = { query: String(body.query), params: body.params as unknown[] };
  queries.push(q);
  const isLimiter = /s1_rate_limits/.test(q.query);
  if (dbMode === "throw" || (dbMode === "limiter-throw" && isLimiter)) return json({ message: "db down: secret detail" }, 500);
  if (dbMode === "hang" && !isLimiter) { await new Promise((r) => setTimeout(r, 3000)); return json({ message: "late" }, 500); }
  if (isLimiter && /^\s*insert into s1_rate_limits/.test(q.query)) {
    const k = String(q.params[0]); const n = (counters.get(k) ?? 0) + 1; counters.set(k, n);
    return json({ command: "INSERT", rowCount: 1, fields: [{ name: "count", dataTypeID: T.int }], rows: [[String(n)]] });
  }
  if (/^delete from s1_rate_limits/.test(q.query)) return json({ command: "DELETE", rowCount: 0, fields: [], rows: [] });
  if (/from s1_beta_progress where id = \$1::uuid and livemode = \$2::boolean/.test(q.query)) {
    const [id, live, days] = q.params;
    const r = rows.find((x) => x.id === id && String(x.livemode) === String(live));
    const fields = [["id", T.uuid], ["email", T.text], ["session_id", T.text], ["stage", T.int], ["answers", T.jsonb], ["src", T.text], ["completed", T.bool], ["fresh", T.bool]]
      .map(([name, dataTypeID]) => ({ name, dataTypeID }));
    return json({ command: "SELECT", rowCount: r ? 1 : 0, fields, rows: r ? [[r.id, r.email, r.session, String(r.stage), JSON.stringify(r.answers), r.src, r.completed ? "t" : "f", r.ageDays < Number(days) ? "t" : "f"]] : [] });
  }
  throw new Error("unit: unexpected query " + q.query.slice(0, 60));
}

const call = async (body: unknown, opts: { cookie?: string | null; headers?: Record<string, string>; token?: string } = {}) => {
  const { POST } = await import("../../../app/api/season1-beta/restore/route");
  const { NextRequest } = await import("next/server");
  const token = opts.token ?? restartToken(ROW_ID, SESSION)!;
  const cookie = opts.cookie === undefined ? `ekuzo_brt=${token}; ekuzo_brf=1` : opts.cookie;
  const headers: Record<string, string> = { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...(opts.headers ?? {}) };
  const r = await POST(new NextRequest("http://localhost:3103/api/season1-beta/restore", { method: "POST", headers, body: JSON.stringify(body) }));
  const text = await r.text();
  return { status: r.status, text, body: JSON.parse(text) as Record<string, unknown>, cookies: r.headers.getSetCookie(), cache: r.headers.get("cache-control") };
};
const cleared = (cookies: string[]) =>
  cookies.some((c) => /^ekuzo_brt=; Path=\/api\/season1-beta; Max-Age=0/.test(c)) && cookies.some((c) => /^ekuzo_brf=; Path=\/season1\/beta; Max-Age=0/.test(c));
const dataQueries = () => queries.filter((q) => /s1_beta_progress/.test(q.query));

describe("POST /api/season1-beta/restore", () => {
  before(() => {
    for (const k of ["DATABASE_URL", "S1_REF_SECRET", "STRIPE_SECRET_KEY", "KLAVIYO_PRIVATE_API_KEY"]) saved[k] = process.env[k];
    process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    process.env.STRIPE_SECRET_KEY = "unit-not-a-live-key";
    process.env.KLAVIYO_PRIVATE_API_KEY = "unit-klaviyo-key";
    globalThis.fetch = fakeFetch as typeof fetch;
    console.log = console.warn = console.error = (...a: unknown[]) => { logs.push(a.map(String).join(" ")); };
  });
  after(() => {
    globalThis.fetch = realFetch;
    Object.assign(console, realConsole);
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });
  beforeEach(() => { rows = [baseRow()]; queries = []; dbMode = "ok"; counters = new Map(); logs.length = 0; });

  it("a valid unfinished link without confirm: masked email and the next step only, cookies kept, no-store", async () => {
    const r = await call({});
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, { ok: true, state: "resume", emailMask: "j•••@example.com", step: 2 });
    assert.equal(r.cookies.length, 0);
    assert.equal(r.cache, "no-store");
    for (const leak of [EMAIL, "Maya", "peanuts", SESSION, "Pacific", "Vancouver", "flag"]) assert.equal(r.text.includes(leak), false, leak);
  });
  it("the step is the next one: stage 0 reads 1, stage 2 reads 3", async () => {
    rows[0].stage = 0; assert.equal((await call({})).body.step, 1);
    rows[0].stage = 2; assert.equal((await call({})).body.step, 3);
  });
  it("confirm returns the run: email, session, stage, answers; never note, timeZone, tz or times; both cookies cleared", async () => {
    const r = await call({ confirm: true });
    assert.equal(r.status, 200);
    assert.equal(r.body.state, "resume");
    assert.equal(r.body.email, EMAIL); assert.equal(r.body.sessionId, SESSION); assert.equal(r.body.stage, 1);
    const a = r.body.answers as Record<string, unknown>;
    assert.equal(a.playerName, "Maya"); assert.equal(a.playerAge, 12); assert.equal(a.funFact, "Knows every flag");
    assert.deepEqual(a.superpowers, ["Quick thinker"]); assert.deepEqual(a.expectations, ["No toxicity", "Positive mindset", "Winning attitude"]);
    for (const k of ["note", "timeZone", "tz", "times"]) assert.equal(k in a, false, k);
    assert.equal(r.text.includes("peanuts"), false);
    assert.equal(cleared(r.cookies), true);
    assert.equal(r.cache, "no-store");
  });
  it("answers pass through the lenient filter: a stored value that is not allowed is dropped", async () => {
    rows[0].answers = { ...rows[0].answers, playerAge: 3, playsOn: ["Toaster"], playerName: "Maya<b>" };
    const a = (await call({ confirm: true })).body.answers as Record<string, unknown>;
    assert.equal("playerAge" in a, false); assert.equal("playsOn" in a, false); assert.equal(a.playerName, "Mayab"); // markup characters are stripped, as at every save
  });
  it("a finished run reads done: no email, no answers, both cookies cleared", async () => {
    rows[0].completed = true;
    for (const body of [{}, { confirm: true }]) {
      const r = await call(body);
      assert.deepEqual(r.body, { ok: true, state: "done" });
      assert.equal(cleared(r.cookies), true);
      for (const leak of [EMAIL, "Maya", "example.com"]) assert.equal(r.text.includes(leak), false);
    }
  });
  it("a finished run older than 14 days still reads done, never the dead-link state", async () => {
    rows[0].completed = true; rows[0].ageDays = 40;
    assert.deepEqual((await call({})).body, { ok: true, state: "done" });
  });
  it("none for: clear, no cookie, bad shape, unknown row, wrong signature, superseded session", async () => {
    const none = (r: { status: number; body: Record<string, unknown>; cookies: string[] }) => {
      assert.equal(r.status, 200); assert.deepEqual(r.body, { ok: true, state: "none" }); assert.equal(cleared(r.cookies), true);
    };
    none(await call({ clear: true }));
    none(await call({}, { cookie: null }));
    none(await call({}, { cookie: "ekuzo_brf=1" }));
    none(await call({}, { token: "short" }));
    none(await call({}, { token: restartToken("aaaaaaaa-5a47-4d9e-9b0a-7c6d5e4f3a21", SESSION)! })); // unknown row
    const good = restartToken(ROW_ID, SESSION)!;
    none(await call({}, { token: good.slice(0, 40) + (good[40] === "A" ? "B" : "A") + good.slice(41) })); // altered signature
    none(await call({}, { token: restartToken(ROW_ID, "sess-old")! })); // signed for another session
    rows[0].session = "sess-newer"; // a new run for the same email
    none(await call({}));
  });
  it("clear needs no database and no cookie", async () => {
    const r = await call({ clear: true }, { cookie: null });
    assert.equal(r.body.state, "none"); assert.equal(queries.length, 0);
  });
  it("a link for a row last saved 13 days ago works, 15 days ago reads none", async () => {
    rows[0].ageDays = 13; assert.equal((await call({})).body.state, "resume");
    rows[0].ageDays = 15; const r = await call({}); assert.equal(r.body.state, "none"); assert.equal(cleared(r.cookies), true);
    const sel = queries.find((q) => /from s1_beta_progress/.test(q.query))!;
    assert.equal(String(sel.params[2]), "14");
  });
  it("a row of the other mode reads none", async () => {
    rows[0].livemode = true;
    assert.equal((await call({})).body.state, "none");
  });
  it("a database error is a 503 with the cookies kept and no detail in the answer or the log", async () => {
    dbMode = "throw";
    const r = await call({});
    assert.equal(r.status, 503); assert.deepEqual(r.body, { ok: false }); assert.equal(r.cookies.length, 0); assert.equal(r.cache, "no-store");
    const all = logs.join("\n");
    assert.equal(all.includes("secret detail"), false); assert.equal(all.includes(EMAIL), false); assert.equal(all.includes(restartToken(ROW_ID, SESSION)!), false);
  });
  it("a database that does not answer in time is a 503 with the cookies kept", async () => {
    dbMode = "hang";
    const r = await call({ confirm: true });
    assert.equal(r.status, 503); assert.equal(r.cookies.length, 0);
    assert.ok(logs.some((l) => /timeout/.test(l)));
  });
  it("a limiter that errors fails open", async () => {
    dbMode = "limiter-throw";
    assert.equal((await call({})).body.state, "resume");
  });
  it("past 60 an hour from one address is a 429 with cookies kept; another address is unaffected", async () => {
    const h = { "x-nf-client-connection-ip": "203.0.113.7" };
    for (let i = 0; i < 60; i++) assert.equal((await call({}, { headers: h })).status, 200);
    const r = await call({}, { headers: h });
    assert.equal(r.status, 429); assert.equal(r.cookies.length, 0); assert.deepEqual(r.body, { ok: false });
    assert.equal((await call({}, { headers: { "x-nf-client-connection-ip": "203.0.113.8" } })).status, 200);
  });
  it("the limiter key is a hash of the address, or one shared key with no address; neither names the address", async () => {
    await call({}, { headers: { "x-nf-client-connection-ip": "203.0.113.7" } });
    await call({});
    const keys = [...counters.keys()];
    assert.equal(keys.some((k) => /^s1br:ip:[A-Za-z0-9_-]{22}$/.test(k)), true);
    assert.equal(keys.includes("s1br:noip"), true);
    assert.equal(keys.some((k) => k.includes("203.0.113.7")), false);
  });
  it("no limiter or database work runs for a cross-site POST: 403 first, no cookie touched", async () => {
    const r = await call({ confirm: true }, { headers: { "sec-fetch-site": "cross-site", origin: "https://evil.example" } });
    assert.equal(r.status, 403); assert.equal(r.cookies.length, 0); assert.equal(queries.length, 0);
    const c = await call({ clear: true }, { headers: { origin: "https://evil.example", host: "ekuzo.gg" } });
    assert.equal(c.status, 403); assert.equal(c.cookies.length, 0);
    const same = await call({}, { headers: { "sec-fetch-site": "same-origin" } });
    assert.equal(same.status, 200);
  });
  it("the token comes from the cookie only: a token in the body is ignored", async () => {
    const r = await call({ token: restartToken(ROW_ID, SESSION), confirm: true }, { cookie: null });
    assert.equal(r.body.state, "none");
  });
  it("source cookie: set on confirm from the row's tag when the browser has none, with middleware's options", async () => {
    rows[0].src = "karlin-email";
    const r = await call({ confirm: true });
    const c = r.cookies.find((x) => x.startsWith("ekuzo_bsrc="))!;
    assert.ok(c);
    assert.match(c, /^ekuzo_bsrc=karlin-email; Path=\/; Max-Age=2592000; HttpOnly; (Secure; )?SameSite=Lax$/);
    assert.equal(cleared(r.cookies), true);
  });
  it("source cookie: not set when the browser has one, when the tag is not a tag, without confirm, or when the row has none", async () => {
    rows[0].src = "karlin-email";
    const tok = restartToken(ROW_ID, SESSION)!;
    assert.equal((await call({ confirm: true }, { cookie: `ekuzo_brt=${tok}; ekuzo_bsrc=other-tag` })).cookies.some((x) => x.startsWith("ekuzo_bsrc=")), false);
    rows[0].src = "Bad Tag!"; assert.equal((await call({ confirm: true })).cookies.some((x) => x.startsWith("ekuzo_bsrc=")), false);
    rows[0].src = "x".repeat(41); assert.equal((await call({ confirm: true })).cookies.some((x) => x.startsWith("ekuzo_bsrc=")), false);
    rows[0].src = "karlin-email"; assert.equal((await call({})).cookies.some((x) => x.startsWith("ekuzo_bsrc=")), false);
    rows[0].src = null; assert.equal((await call({ confirm: true })).cookies.some((x) => x.startsWith("ekuzo_bsrc=")), false);
  });
  it("never writes to the progress table: every statement on it is a select; no update, delete or Klaviyo call", async () => {
    for (const body of [{}, { confirm: true }, { clear: true }]) await call(body);
    rows[0].completed = true; await call({});
    const touching = dataQueries();
    assert.ok(touching.length >= 3);
    for (const q of touching) assert.match(q.query.trim(), /^select /);
    assert.equal(queries.some((q) => /^\s*(update|delete)\b/i.test(q.query) && !/s1_rate_limits/.test(q.query)), false);
    assert.equal(queries.some((q) => /insert into s1_beta/i.test(q.query)), false);
  });
  it("only POST is exported", async () => {
    const mod = (await import("../../../app/api/season1-beta/restore/route")) as Record<string, unknown>;
    assert.equal(typeof mod.POST, "function");
    for (const m of ["GET", "PUT", "PATCH", "DELETE"]) assert.equal(m in mod, false, m);
  });
  it("logs never carry the email, the token or an answer, even on a confirm", async () => {
    await call({ confirm: true });
    dbMode = "throw"; await call({});
    const all = logs.join("\n");
    for (const leak of [EMAIL, "Maya", restartToken(ROW_ID, SESSION)!, SESSION]) assert.equal(all.includes(leak), false, leak);
  });
});
