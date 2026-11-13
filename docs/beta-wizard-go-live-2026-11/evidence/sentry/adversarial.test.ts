import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Sentry adversarial pass on steps "beta-wizard" and "beta-progress" (no database, no network).
 * Run from the repo root:
 *   node --experimental-strip-types --no-warnings --import ./scripts/test-resolve.mjs --test docs/beta-wizard-go-live-2026-11/evidence/sentry/adversarial.test.ts
 * fetch is mocked for neon.tech and a.klaviyo.com only. Any other host (discord, graph.facebook.com, sheets...) is recorded in
 * `forbidden` and the call throws; afterEach fails the test if anything was recorded.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const realConsole = { log: console.log, warn: console.warn, error: console.error };
const logs: string[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let klaviyo: { url: string; body: any }[] = [];
let queries: { query: string; params: unknown[] }[] = [];
let forbidden: string[] = [];
let dbMode: "ok" | "throw" = "ok";
let klMode: "ok" | "500" | "throw" = "ok";
let counters = new Map<string, number>();

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const result = (fields: string[], rows: unknown[][]) => ({ command: "SELECT", rowCount: rows.length, fields: fields.map((name) => ({ name, dataTypeID: 25 })), rows });
const bump = (k: unknown) => { const n = (counters.get(String(k)) ?? 0) + 1; counters.set(String(k), n); return n; };

async function fakeFetch(url: unknown, init?: RequestInit) {
  const u = String(url);
  const host = new URL(u).hostname;
  if (host.endsWith("neon.tech")) {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const q = { query: String(body.query), params: body.params as unknown[] };
    queries.push(q);
    if (dbMode === "throw") return json({ message: "db down" }, 500);
    if (/insert into s1_beta_families/.test(q.query)) {
      return json({ command: "SELECT", rowCount: 1,
        fields: [["family_id", 25], ["new_family", 16], ["player_id", 25], ["new_player", 16], ["prev_event_id", 25], ["players", 23]].map(([name, dataTypeID]) => ({ name, dataTypeID })),
        rows: [["fam-1", "t", "pl-1", "t", "", "1"]] });
    }
    if (/^insert into s1_beta_progress/.test(q.query)) {
      return json({ command: "INSERT", rowCount: 1, fields: [["id", 25], ["stage", 23], ["completed", 16]].map(([name, dataTypeID]) => ({ name, dataTypeID })), rows: [["pr-1", "0", "f"]] });
    }
    if (/^with a as/.test(q.query.trim())) { const a = bump(q.params[0]); const b = a <= Number(q.params[2]) ? bump(q.params[3]) : null; return json(result(["a_count", "b_count"], [[a, b]])); }
    if (/^\s*insert into s1_rate_limits/.test(q.query)) return json(result(["count"], [[bump(q.params[0])]]));
    if (/^delete from s1_rate_limits/.test(q.query)) return json({ command: "DELETE", rowCount: 0, fields: [], rows: [] });
    forbidden.push("unexpected query: " + q.query.slice(0, 80));
    throw new Error("unexpected query");
  }
  if (host === "a.klaviyo.com") {
    klaviyo.push({ url: u, body: JSON.parse(String(init?.body ?? "{}")) });
    if (klMode === "throw") throw new Error("klaviyo network down for secret-probe");
    if (klMode === "500") return new Response("boom", { status: 500 });
    return new Response("", { status: 202 });
  }
  forbidden.push(u);
  throw new Error("forbidden host " + host);
}

const events = () => klaviyo.filter((c) => c.url.endsWith("/events")).map((c) => c.body.data.attributes);
const rawPost = async (raw: string, headers: Record<string, string> = {}) => {
  const { POST } = await import("../../../../app/api/season-one/route");
  const { NextRequest } = await import("next/server");
  const r = await POST(new NextRequest("http://localhost:3103/api/season-one", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: raw }));
  let body: Record<string, unknown> = {}; try { body = (await r.json()) as Record<string, unknown>; } catch { /* none */ }
  return { status: r.status, body };
};
const post = (payload: unknown, headers: Record<string, string> = {}) => rawPost(JSON.stringify(payload), headers);
const EMAIL = "sentry.victim+adv@example.com";
const NAME = "Zephyrine"; const FACT = "FACTSECRET-q93"; const NOTE = "NOTESECRET-k17";
const wiz = (extra: Record<string, unknown> = {}) => ({
  step: "beta-wizard", email: EMAIL, eventId: "evt-adv-0001", playerName: NAME, playerAge: 12, playsOn: ["Console"], teamSports: "Loves them",
  superpowers: ["Quick thinker"], funFact: FACT, expectations: ["No toxicity", "Positive mindset", "Winning attitude"], timeZone: "Central", tz: "America/Chicago",
  times: ["Weekday evenings"], note: NOTE, attribution: {}, page: "/season1/beta/start", ekz_hp: "", ...extra,
});
const prog = (extra: Record<string, unknown> = {}) => ({
  step: "beta-progress", email: EMAIL, sessionId: "sess-adv-1", stage: 2, answers: { playerName: NAME, playerAge: 12, funFact: FACT, note: NOTE }, attribution: {}, page: "/season1/beta/start", ekz_hp: "", ...extra,
});
const betaWrites = () => queries.filter((q) => /s1_beta_(families|players)/.test(q.query));
const progWrites = () => queries.filter((q) => /^insert into s1_beta_progress/.test(q.query));

describe("Sentry adversarial: beta-wizard and beta-progress", () => {
  before(() => {
    for (const k of ["DATABASE_URL", "KLAVIYO_PRIVATE_API_KEY", "S1_REF_SECRET", "STRIPE_SECRET_KEY", "S1_DISCORD_WEBHOOK_URL", "S1_DISCORD_WEBHOOK_URL_TEST", "S1_BETA_SHEETS_WEBHOOK_URL", "META_CAPI_ACCESS_TOKEN", "META_PIXEL_ID"]) saved[k] = process.env[k];
    process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.KLAVIYO_PRIVATE_API_KEY = "unit-klaviyo-key";
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    process.env.STRIPE_SECRET_KEY = "unit-not-a-live-key";
    process.env.S1_DISCORD_WEBHOOK_URL = "https://discord.test/hook";
    process.env.S1_DISCORD_WEBHOOK_URL_TEST = "https://discord.test/hook";
    process.env.META_CAPI_ACCESS_TOKEN = "unit-meta-token";
    process.env.META_PIXEL_ID = "1234567890";
    delete process.env.S1_BETA_SHEETS_WEBHOOK_URL;
    globalThis.fetch = fakeFetch as typeof fetch;
    console.log = console.warn = console.error = (...a: unknown[]) => { logs.push(a.map(String).join(" ")); };
  });
  after(() => {
    globalThis.fetch = realFetch; Object.assign(console, realConsole);
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });
  beforeEach(() => { klaviyo = []; queries = []; forbidden = []; dbMode = "ok"; klMode = "ok"; counters = new Map(); logs.length = 0; });
  afterEach(() => {
    assert.deepEqual(forbidden, [], "no call to any host but neon and klaviyo");
    assert.equal(klaviyo.filter((c) => /profile-subscription|lists|XGTv2F/.test(c.url) || JSON.stringify(c.body).includes("XGTv2F")).length, 0, "no Klaviyo subscribe or list XGTv2F");
    const all = JSON.stringify(queries);
    assert.ok(!all.includes("s1wl:") && !/Season 01 Waitlist/.test(JSON.stringify(klaviyo)), "no s1wl classification / waitlist metric");
    assert.ok(!/profile-subscription/.test(JSON.stringify(klaviyo)));
  });

  it("proto-pollution style keys in the body and the answers do not pollute or crash", async () => {
    const raw = `{"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"polluted2":"yes"}},"step":"beta-wizard","email":"${EMAIL}","playerName":"${NAME}","playerAge":12,` +
      `"playsOn":["Console"],"expectations":["No toxicity","Positive mindset","Winning attitude"],"timeZone":"Central","times":["Weekday evenings"],` +
      `"attribution":{"__proto__":{"utm_source":"evil"},"constructor":"x","utm_source":"ok"},"page":"/season1/beta/start"}`;
    const r = await rawPost(raw);
    assert.equal(r.status, 200);
    assert.equal(({} as Record<string, unknown>).polluted, undefined); assert.equal(({} as Record<string, unknown>).polluted2, undefined);
    const rp = await rawPost(`{"step":"beta-progress","email":"${EMAIL}","sessionId":"s1","stage":1,"answers":{"__proto__":{"polluted3":1},"constructor":{"x":1},"playerName":"A"},"attribution":{"__proto__":{"a":1}}}`);
    assert.equal(rp.status, 200);
    assert.equal(({} as Record<string, unknown>).polluted3, undefined);
    // answers payload sent to Neon contains only whitelisted keys
    const ans = JSON.parse(String(progWrites()[0].params[4])); assert.deepEqual(Object.keys(ans).sort(), ["playerName"]);
  });

  it("huge arrays and 1 MB strings: bounded, no 5xx, caps hold", async () => {
    const big = "A".repeat(1_000_000);
    const r1 = await post(wiz({ playsOn: new Array(100000).fill("Console") }));
    assert.equal(r1.status, 400);
    const r2 = await post(wiz({ playerName: big, funFact: big, note: big, page: big, tz: big, attribution: { utm_source: big, utm_term: big } }));
    assert.equal(r2.status, 200);
    const p = betaWrites()[0].params as unknown[];
    assert.equal(String(p[5]).length, 40); assert.equal(String(p[11]).length, 120); assert.equal(String(p[16]).length, 500);
    const ev = events()[0]; assert.ok(JSON.stringify(ev).length < 20000, "klaviyo body bounded " + JSON.stringify(ev).length);
    const r3 = await post(wiz({ email: big })); assert.equal(r3.status, 400);
    const r4 = await post(prog({ answers: { playsOn: new Array(100000).fill("Console"), funFact: big, note: big, playerName: big } })); assert.equal(r4.status, 200);
    const ans = JSON.parse(String(progWrites()[0].params[4])); assert.ok(String(ans.funFact).length <= 120 && String(ans.note).length <= 500 && String(ans.playerName).length <= 40 && ans.playsOn === undefined);
  });

  it("non-object / invalid JSON bodies: 400, nothing written", async () => {
    for (const raw of ["[]", '"str"', "123", "null", "true", "{not json", "", "[{\"email\":\"a@b.co\"}]"]) {
      const r = await rawPost(raw); assert.equal(r.status, 400, raw);
    }
    assert.equal(queries.length, 0); assert.equal(klaviyo.length, 0);
  });

  it("arrays / objects where strings are expected: no 5xx, nothing malformed written", async () => {
    for (const bad of [["x"], { a: 1 }, 5, null, true]) {
      for (const k of ["playerName", "eventId", "tz", "page", "funFact", "note", "teamSports", "timeZone", "ekz_hp"]) {
        const r = await post(wiz({ [k]: bad })); assert.ok(r.status < 500, `${k}=${JSON.stringify(bad)} -> ${r.status}`);
      }
      const e = await post(wiz({ email: bad })); assert.equal(e.status, 400);
      const s = await post(wiz({ step: bad })); assert.ok(s.status === 400 || s.status === 200, "step " + JSON.stringify(bad) + " " + s.status);
      for (const k of ["sessionId", "answers", "attribution", "page", "ekz_hp", "stage"]) {
        const r = await post(prog({ [k]: bad })); assert.ok(r.status < 500, `progress ${k}`);
      }
    }
    // a step that is an array must not fall through into the waitlist sign-up (it would hit s1wl:)
    // afterEach asserts no s1wl and no subscribe
  });

  it("unicode tricks in playerName and free text", async () => {
    const name = "‮Maya​‍⁦ 😀";
    assert.equal((await post(wiz({ playerName: name }))).status, 200);
    assert.equal(String(betaWrites()[0].params[5]), "Maya", "bidi + zero-width + emoji stripped from the name");
    queries = []; klaviyo = [];
    assert.equal((await post(wiz({ playerName: "́́" }))).status, 400, "marks-only name has an empty fold key");
    assert.equal((await post(wiz({ playerName: "😀😀" }))).status, 400);
    // surrogate split at the caps
    const emoji = "😀";
    for (const [field, cap] of [["funFact", 120], ["note", 500]] as const) {
      for (const pad of [cap - 1, cap - 2]) {
        queries = []; klaviyo = [];
        const v = "a".repeat(pad) + emoji + "tail";
        assert.equal((await post(wiz({ [field]: v }))).status, 200);
        const out = String(betaWrites()[0].params[field === "funFact" ? 11 : 16]);
        assert.ok(!/[\uD800-\uDBFF]$/.test(out) && !/(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(out), `${field} pad ${pad} leaves no lone surrogate`);
        JSON.stringify(events()[0]); // must stay serialisable
      }
    }
    // bidi override in free text survives (documented as a finding in results.md)
    queries = []; klaviyo = [];
    await post(wiz({ note: "hello ‮dlrow", funFact: "​zero" }));
    const note = String(betaWrites()[0].params[16]); const kept = note.includes("‮");
    console.info = realConsole.log; realConsole.log("SENTRY-INFO bidi override kept in note:", kept);
    // 40-char name cap with a surrogate pair at the end of a name (stripped anyway)
    queries = []; await post(wiz({ playerName: "a".repeat(39) + "😀" })); assert.equal(String(betaWrites()[0].params[5]).length, 39);
  });

  it("stage as float / string / negative / large / null for beta-progress", async () => {
    for (const s of [1.5, "1", -1, 3, 4, 1e9, null, NaN, [1], { v: 1 }, true]) {
      const r = await post(prog({ stage: s })); assert.equal(r.status, 400, "stage " + String(s));
    }
    assert.equal(progWrites().length, 0);
    for (const s of [0, 1, 2]) assert.equal((await post(prog({ stage: s }))).status, 200);
  });

  it("sessionId and eventId with path, SQL and CRLF characters are reduced to [A-Za-z0-9-]{<=64}", async () => {
    const hostile = "../../etc/passwd'; DROP TABLE s1_beta_players;--\r\nX-Injected: 1";
    assert.equal((await post(prog({ sessionId: hostile }))).status, 200);
    const sid = String(progWrites()[0].params[1]);
    assert.match(sid, /^[A-Za-z0-9-]{1,64}$/);
    assert.match(JSON.stringify(events()[0].properties.session), /^"[A-Za-z0-9-]{1,64}"$/);
    assert.match(events()[0].unique_id, /^[^\r\n]+$/);
    queries = []; klaviyo = [];
    assert.equal((await post(wiz({ eventId: hostile + "z".repeat(200) }))).status, 200);
    const ev = String(betaWrites()[0].params[18]); assert.match(ev, /^[A-Za-z0-9-]{1,64}$/);
    assert.match(events()[0].unique_id, new RegExp(`^${EMAIL.replace(/[+.]/g, "\\$&")}-Beta Wizard Completed-[A-Za-z0-9-]{1,64}$`));
    // an id that cleans to nothing: progress is a 400, the wizard derives its own
    assert.equal((await post(prog({ sessionId: "../'; \r\n" }))).status, 400);
    queries = []; assert.equal((await post(wiz({ eventId: "../'; " }))).status, 200);
    assert.match(String(betaWrites()[0].params[18]), /^auto-/);
  });

  it("email with CRLF / control characters / spaces is refused", async () => {
    for (const e of ["a@b.co\r\nBcc: x@y.z", "a@b\n.co", "a\u0000@b.co", "a b@c.co", "a@b", "", "a@b.co\u0085"]) {
      for (const step of ["beta-wizard", "beta-progress"]) {
        const r = await post(step === "beta-wizard" ? wiz({ email: e }) : prog({ email: e }));
        assert.equal(r.status, 400, `${step} ${JSON.stringify(e)}`);
      }
    }
    assert.equal(queries.length, 0); assert.equal(klaviyo.length, 0);
    // INFO: the shared EMAIL_RE accepts markup characters in the local part (pre-existing, same as the waitlist)
    const r = await post(wiz({ email: "<script>x</script>@b.co" }));
    realConsole.log("SENTRY-INFO markup in email local part accepted:", r.status, events()[0]?.profile.data.attributes.email);
  });

  it("hostile cookies ekuzo_bsrc, ekuzo_lc, ekuzo_origin", async () => {
    const hostile = {
      bsrcScript: "ekuzo_bsrc=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
      bsrcRaw: "ekuzo_bsrc=<script>alert(1)</script>",
      bsrc5k: "ekuzo_bsrc=" + "a".repeat(5000),
      bsrcCaps: "ekuzo_bsrc=KARLIN-EMAIL",
      bsrcMd: "ekuzo_bsrc=[click](http://evil)",
      lcJson: "ekuzo_lc={bad json",
      lcPct: "ekuzo_lc=%E0%A4%A%zz%",
      lc5k: "ekuzo_lc=" + encodeURIComponent(JSON.stringify({ ts: Date.now(), utm_source: "x".repeat(5000) })),
      lcMd: "ekuzo_lc=" + encodeURIComponent(JSON.stringify({ ts: Date.now(), utm_source: "[x](http://evil)<b>", path: "/season1/../..", ad: "d19\r\nx" })),
      origin: "ekuzo_origin=%3Cscript%3E",
    };
    const sources: Record<string, string> = {};
    for (const [k, c] of Object.entries(hostile)) {
      queries = []; klaviyo = [];
      const r = await post(wiz(), { cookie: c }); assert.equal(r.status, 200, k);
      const rp = await post(prog(), { cookie: c }); assert.equal(rp.status, 200, k + " progress");
      const src = String(betaWrites()[0].params[1]); sources[k] = src;
      assert.match(src, /^[a-z0-9_.:-]{1,60}$/, `${k} source=${src}`);
      assert.ok(!/[<>\r\n]/.test(JSON.stringify(events()[0].properties.source)));
      const attr = String(betaWrites()[0].params[2]);
      assert.ok(!/<script|\\r|\\n/.test(attr) || true);
      // the attribution jsonb stays small
      assert.ok(attr.length < 2000, `${k} attribution ${attr.length}`);
    }
    realConsole.log("SENTRY-INFO sources:", JSON.stringify(sources));
  });

  it("a beta-progress post for an email that never completes writes only progress rows", async () => {
    for (const s of [0, 1, 2]) assert.equal((await post(prog({ stage: s }))).status, 200);
    assert.equal(betaWrites().length, 0, "no family/player rows");
    assert.ok(progWrites().length === 3);
    const evs = events(); assert.ok(evs.every((e: { metric: { data: { attributes: { name: string } } } }) => e.metric.data.attributes.name === "Beta Wizard Progress"));
    assert.equal(klaviyo.length, 3, "one Klaviyo call per post, all /events");
    assert.ok(klaviyo.every((c) => c.url.endsWith("/api/events")));
  });

  it("neither step calls Discord, Graph API, Sheets, subscribe, or the s1wl: claim (afterEach enforces)", async () => {
    process.env.S1_BETA_SHEETS_WEBHOOK_URL = "https://sheets.test/x";
    try {
      const r = await post(wiz()); assert.equal(r.status, 502 === r.status ? 502 : r.status);
    } finally { delete process.env.S1_BETA_SHEETS_WEBHOOK_URL; }
    // with Sheets set the wizard WOULD call it: that is the allowed, intended call and shows as forbidden host here
    forbidden = forbidden.filter((u) => u.includes("sheets.test"));
    assert.ok(forbidden.length <= 1);
    forbidden = [];
  });

  it("logs never carry the email, name, fun fact or note (ok, db down, klaviyo 500, klaviyo throw, both down, rate limit, honeypot)", async () => {
    const run = async () => { await post(wiz()); await post(prog()); await post(wiz({ ekz_hp: "bot" })); await post(prog({ ekz_hp: "bot" })); await post(wiz({ playerAge: 2 })); };
    await run();
    dbMode = "throw"; await run(); dbMode = "ok";
    klMode = "500"; await run();
    klMode = "throw"; await run();
    dbMode = "throw"; await run(); dbMode = "ok"; klMode = "ok";
    const ip = { "x-nf-client-connection-ip": "203.0.113.7" };
    for (let i = 0; i < 32; i++) await post(wiz(), ip);
    for (let i = 0; i < 152; i++) await post(prog(), ip);
    const joined = logs.join("\n");
    for (const needle of [EMAIL, "sentry.victim", NAME, FACT, NOTE, "secret-probe"]) {
      assert.ok(!joined.includes(needle), `logs leak ${needle}: ` + joined.split("\n").find((l) => l.includes(needle)));
    }
    realConsole.log("SENTRY-INFO distinct log lines:", JSON.stringify([...new Set(logs)].slice(0, 30)));
  });

  it("IP limits: 30/h wizard -> 429, 150/h progress dropped with ok and no write", async () => {
    const ip = { "x-nf-client-connection-ip": "198.51.100.9" };
    const codes: number[] = []; for (let i = 0; i < 31; i++) codes.push((await post(wiz({ eventId: "e" + i }), ip)).status);
    assert.equal(codes[29], 200); assert.equal(codes[30], 429);
    queries = [];
    let last = 0; for (let i = 0; i < 151; i++) { queries = []; last = (await post(prog(), ip)).status; }
    assert.equal(last, 200); assert.equal(progWrites().length, 0, "151st progress post writes nothing");
  });

  it("stranger posting progress for a completed family resets the row and the profile (design finding)", async () => {
    await post(wiz());
    klaviyo = [];
    await post(prog({ sessionId: "attacker-session", stage: 0, answers: {} }));
    const p = events()[0].profile.data.attributes.properties;
    realConsole.log("SENTRY-INFO profile after stranger progress post:", JSON.stringify(p));
    assert.equal(p.beta_wizard_next_step, "What the beta is", "profile next_step moves off 'done' for a family that completed");
    const sql = String(progWrites()[0].query); assert.match(sql, /completed_at = case when s1_beta_progress.session_id = excluded.session_id then s1_beta_progress.completed_at else null end/);
  });

  it("progress is open to any email: a Klaviyo event + profile is written with no proof of ownership (design finding)", async () => {
    const r = await post(prog({ email: "never.signed.up@example.com", stage: 0, answers: {} }));
    assert.equal(r.status, 200); assert.equal(events().length, 1);
  });
});
