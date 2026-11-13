import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac, hkdfSync } from "node:crypto";
import { restartToken } from "../betaRestart";

/**
 * Sentry adversarial tests for POST /api/season1-beta/restore (docs/beta-restart-link-2026-11). fetch is mocked: Neon HTTP
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


const ROW_B = "9a8b7c6d-1111-4222-8333-444455556666";
const OTHER_ID_PART = (id: string) => Buffer.from(id.replace(/-/g, ""), "hex").toString("base64url");
const tokenFor = (id: string, sess: string) => restartToken(id, sess)!;

const call = async (body: unknown, opts: { cookie?: string | null; headers?: Record<string, string>; token?: string; raw?: string } = {}) => {
  const { POST } = await import("../../../app/api/season1-beta/restore/route");
  const { NextRequest } = await import("next/server");
  const token = opts.token ?? tokenFor(ROW_ID, SESSION);
  const cookie = opts.cookie === undefined ? `ekuzo_brt=${token}; ekuzo_brf=1` : opts.cookie;
  const headers: Record<string, string> = { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...(opts.headers ?? {}) };
  const r = await POST(new NextRequest("http://localhost:3103/api/season1-beta/restore", { method: "POST", headers, body: opts.raw ?? JSON.stringify(body) }));
  const text = await r.text();
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(text); } catch { /* keep empty */ }
  return { status: r.status, text, body: parsed, cookies: r.headers.getSetCookie(), cache: r.headers.get("cache-control") };
};
const cleared = (cookies: string[]) =>
  cookies.some((c) => /^ekuzo_brt=; Path=\/api\/season1-beta; Max-Age=0/.test(c)) && cookies.some((c) => /^ekuzo_brf=; Path=\/season1\/beta; Max-Age=0/.test(c));
const isNone = (r: { status: number; body: Record<string, unknown>; cookies: string[] }) => r.status === 200 && JSON.stringify(r.body) === '{"ok":true,"state":"none"}' && cleared(r.cookies);

describe("Sentry adversarial: restore", () => {
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
  beforeEach(() => { rows = [baseRow(), { ...baseRow(), id: ROW_B, email: "other.family@example.net", session: "sess-B", answers: { playerName: "Bobby", funFact: "B-secret" } }]; queries = []; dbMode = "ok"; counters = new Map(); logs.length = 0; });

  it("another family's row id with this family's signature reads none and returns nothing of either family", async () => {
    const sigOfA = tokenFor(ROW_ID, SESSION).slice(22);
    const forged = OTHER_ID_PART(ROW_B) + sigOfA;
    const r = await call({ confirm: true }, { token: forged });
    assert.ok(isNone(r), r.text);
    for (const leak of ["Bobby", "B-secret", "other.family", "Maya", EMAIL]) assert.equal(r.text.includes(leak), false, leak);
  });
  it("a signature made with the raw secret, or with another HKDF label, or with keyHash-style hashing, reads none", async () => {
    const msg = `v1|${ROW_ID}|${SESSION}`;
    const idPart = OTHER_ID_PART(ROW_ID);
    const raw = createHmac("sha256", process.env.S1_REF_SECRET!).update(msg).digest("base64url");
    const otherInfo = Buffer.from(hkdfSync("sha256", process.env.S1_REF_SECRET!, "", "ekuzo:other:v1", 32));
    const other = createHmac("sha256", otherInfo).update(msg).digest("base64url");
    const noLabel = createHmac("sha256", Buffer.from(hkdfSync("sha256", process.env.S1_REF_SECRET!, "", "", 32))).update(msg).digest("base64url");
    const plainHash = createHmac("sha256", "").update(msg).digest("base64url");
    for (const sig of [raw, other, noLabel, plainHash]) assert.ok(isNone(await call({ confirm: true }, { token: idPart + sig })), "forged signature accepted");
    assert.equal(queries.filter((q) => /s1_beta_progress/.test(q.query)).length, 4, "each forged token still reads the row once and is rejected after");
  });
  it("a token for a row of the other livemode reads none", async () => {
    rows[0].livemode = true;
    assert.ok(isNone(await call({ confirm: true })));
  });
  it("replay after completion: the run reads done, with no email or answers, even with confirm", async () => {
    const first = await call({ confirm: true });
    assert.equal(first.body.state, "resume");
    rows[0].completed = true;
    for (const b of [{ confirm: true }, {}]) {
      const r = await call(b);
      assert.deepEqual(r.body, { ok: true, state: "done" });
      assert.ok(cleared(r.cookies));
      for (const leak of [EMAIL, "Maya", "flag", SESSION]) assert.equal(r.text.includes(leak), false, leak);
    }
  });
  it("replay after a new session started: the old link reads none", async () => {
    rows[0].session = "sess-NEW";
    assert.ok(isNone(await call({ confirm: true })));
    assert.ok(isNone(await call({})));
  });
  it("confirm without a prior peek is honored (no server-side state links the two calls) and equals the confirm after a peek", async () => {
    const direct = await call({ confirm: true });
    rows = [baseRow()];
    await call({});
    const after = await call({ confirm: true });
    assert.equal(direct.body.state, "resume");
    assert.deepEqual(direct.body, after.body);
  });
  it("{confirm:true, clear:true} together: clear wins, nothing is read", async () => {
    const r = await call({ confirm: true, clear: true });
    assert.ok(isNone(r));
    assert.equal(queries.length, 0);
  });
  it("extra body fields (email, rowId, sessionId, role, token) change nothing", async () => {
    const plain = await call({ confirm: true });
    rows = [baseRow(), { ...baseRow(), id: ROW_B, email: "other.family@example.net", session: "sess-B" }];
    const extra = await call({ confirm: true, email: "x@y.z", rowId: ROW_B, sessionId: "sess-B", role: "admin", token: tokenFor(ROW_B, "sess-B"), stage: 2 });
    assert.deepEqual(extra.body, plain.body);
    const noCookie = await call({ confirm: true, rowId: ROW_ID, sessionId: SESSION, token: tokenFor(ROW_ID, SESSION) }, { cookie: null });
    assert.ok(isNone(noCookie));
  });
  it("bodies that are an array, a string, a number, null, huge (100 KB) or invalid JSON read as {}: a peek, never a confirm", async () => {
    const forms: (string | unknown)[] = [[{ confirm: true }], "confirm", 7, null];
    for (const f of forms) {
      const r = await call(f);
      assert.equal(r.body.state, "resume"); assert.equal(r.body.email, undefined, JSON.stringify(f)); assert.equal(r.status, 200);
    }
    const huge = await call(null, { raw: JSON.stringify({ pad: "x".repeat(100_000) }) });
    assert.equal(huge.status, 200); assert.equal(huge.body.email, undefined);
    const hugeConfirm = await call(null, { raw: JSON.stringify({ confirm: true, pad: "x".repeat(100_000) }) });
    assert.equal(hugeConfirm.body.state, "resume"); assert.equal(hugeConfirm.body.email, EMAIL);
    for (const raw of ["{bad", "", "{\"confirm\":tru", "\u0000"]) {
      const r = await call(null, { raw });
      assert.equal(r.status, 200); assert.equal(r.body.email, undefined, JSON.stringify(raw));
    }
  });
  it("two ekuzo_brt values in one Cookie header: the outcome is the valid row's or none, never another row", async () => {
    const good = tokenFor(ROW_ID, SESSION), forged = OTHER_ID_PART(ROW_B) + good.slice(22);
    for (const cookie of [`ekuzo_brt=${good}; ekuzo_brt=${forged}`, `ekuzo_brt=${forged}; ekuzo_brt=${good}`]) {
      const r = await call({ confirm: true }, { cookie });
      for (const leak of ["Bobby", "other.family", "B-secret"]) assert.equal(r.text.includes(leak), false, leak);
      assert.ok(r.body.state === "none" || (r.body.state === "resume" && r.body.email === EMAIL), r.text);
    }
  });
  it("unicode, percent-encoded and padded tokens: fullwidth and padded read none; a percent-encoded copy of the real token is the real token and nothing else", async () => {
    const good = tokenFor(ROW_ID, SESSION);
    const fullwidth = good.replace(/A/g, "\u00c1"); // latin1 look-alike; a header cannot carry wider characters
    assert.ok(isNone(await call({ confirm: true }, { token: fullwidth })));
    assert.ok(isNone(await call({ confirm: true }, { token: good + "=" })));
    assert.ok(isNone(await call({ confirm: true }, { token: good.slice(0, 64) })));
    assert.ok(isNone(await call({ confirm: true }, { token: good + "A" })));
    assert.ok(isNone(await call({ confirm: true }, { token: "%2e".repeat(32) + "A" })));
    const enc = "%" + good.charCodeAt(0).toString(16).toUpperCase() + good.slice(1);
    const r = await call({ confirm: true }, { token: enc });
    assert.ok(isNone(r) || (r.body.state === "resume" && r.body.email === EMAIL), r.text);
    // a flipped bit in the last signature character
    const last = good[good.length - 1]; const flip = good.slice(0, -1) + (last === "A" ? "Q" : "A");
    assert.ok(isNone(await call({ confirm: true }, { token: flip })));
  });
  it("hostile stored answers: script tag, formula, RTL marks, a 10 KB fun fact come back as plain, capped JSON strings", async () => {
    rows[0].answers = { playerName: "<script>alert(1)</script>Zed", funFact: "=1+1 ‮txt.exe " + "y".repeat(10_000), note: "<img src=x onerror=1>", timeZone: "Pacific", tz: "America/Vancouver", times: ["Weekday evenings"], playsOn: ["<b>x</b>", "Console"], expectations: ["No toxicity"] };
    const r = await call({ confirm: true });
    const a = r.body.answers as Record<string, unknown>;
    const out = { name: a.playerName, factLen: String(a.funFact ?? "").length, fact: String(a.funFact ?? "").slice(0, 30), plays: a.playsOn, keys: Object.keys(a) };
    realConsole.log("HOSTILE-ANSWERS-OBSERVED " + JSON.stringify(out));
    assert.ok(String(a.funFact ?? "").length <= 120);
    assert.equal(a.playsOn, undefined, "the lenient filter drops a whole list when one entry is not allowed");
    for (const k of ["note", "timeZone", "tz", "times"]) assert.equal(k in a, false, k);
    assert.ok(r.text.startsWith("{"), "answer is JSON");
  });
  it("note, timeZone, tz and times never come back on a confirm, whatever the row holds", async () => {
    rows[0].answers = { ...rows[0].answers, note: "SECRET-NOTE", timeZone: "Pacific", tz: "America/Vancouver", times: ["Weekday evenings"] };
    const r = await call({ confirm: true });
    const a = r.body.answers as Record<string, unknown>;
    for (const k of ["note", "timeZone", "tz", "times"]) assert.equal(k in a, false, k);
    assert.equal(r.text.includes("SECRET-NOTE"), false);
  });
  it("a cross-site POST gets 403 first: no database work, no cookie cleared", async () => {
    for (const headers of [{ origin: "https://evil.example" }, { "sec-fetch-site": "cross-site" }] as Record<string, string>[]) {
      queries = [];
      const r = await call({ clear: true }, { headers });
      assert.equal(r.status, 403);
      assert.equal(r.cookies.length, 0, "a cross-site request must not clear the parent's cookies");
      assert.equal(queries.length, 0);
    }
  });
  it("limiter: 100 calls from one address, 61st on is a 429 with cookies kept; no address shares one bucket of 600", async () => {
    const h = { "x-nf-client-connection-ip": "203.0.113.9" };
    const codes: number[] = [];
    for (let i = 0; i < 100; i++) codes.push((await call({}, { headers: h })).status);
    assert.equal(codes.filter((c) => c === 200).length, 60); assert.equal(codes.filter((c) => c === 429).length, 40);
    const limited = await call({}, { headers: h });
    assert.equal(limited.status, 429); assert.equal(limited.cookies.length, 0);
    assert.equal((await call({}, { headers: { "x-nf-client-connection-ip": "203.0.113.10" } })).status, 200);
    let n429 = 0; for (let i = 0; i < 605; i++) if ((await call({})).status === 429) n429++;
    realConsole.log("NOIP-BUCKET-OBSERVED 429s after 605 calls with no address: " + n429);
    assert.equal(n429, 5);
    // forged / spoofed headers: only Netlify's header is used
    const spoof = await call({}, { headers: { "x-forwarded-for": "198.51.100.1", "x-real-ip": "198.51.100.2" } });
    assert.equal(spoof.status, 429, "spoofable headers are not an address; the shared no-address bucket is already full");
  });
  it("compare is constant-time by construction: timingSafeEqual on decoded bytes after a length check (read the code)", async () => {
    const { readFileSync } = await import("node:fs");
    const code = readFileSync(new URL("../betaRestart.ts", import.meta.url), "utf8");
    assert.match(code, /timingSafeEqual\(given, expected\)/);
    assert.doesNotMatch(code, /sig\s*===|===\s*sig|token\s*===|===\s*token/);
  });
});
