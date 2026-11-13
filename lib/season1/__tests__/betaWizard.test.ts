import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

/**
 * Step "beta-wizard" of POST /api/season-one (docs/beta-wizard-go-live-2026-11, requirements B1 to B14).
 * fetch is mocked: Neon HTTP (an in-memory s1_beta_families / s1_beta_players that honors SAVE_SQL's
 * contract, plus the hit() / hitPair() counters), Klaviyo, the Discord webhook, the Sheets webhook and
 * the Meta Graph API (which must never be called). No real network or database.
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const realConsole = { log: console.log, warn: console.warn, error: console.error };
const logs: string[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let klaviyo: { path: string; body: any }[] = [];
let discord: string[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sheets: any[] = [];
let graph = 0;
let queries: { query: string; params: unknown[] }[] = [];
let dbMode: "ok" | "throw" | "hang" = "ok";
let eventStatus = 202;
let families = new Map<string, { id: string; source: string }>();
let players = new Map<string, { id: string; eventId: string; age: number }>();
let counters = new Map<string, number>();
let progress = new Map<string, { session: string; stage: number; next: string; answers: Record<string, unknown>; completed: boolean; completedAt: number }>();
let clock = 0; // fake "now" in ms for the two-minute straggler window

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const result = (fields: string[], rows: unknown[][]) => ({ command: "SELECT", rowCount: rows.length, fields: fields.map((name) => ({ name, dataTypeID: 25 })), rows });
const bump = (k: unknown) => { const n = (counters.get(String(k)) ?? 0) + 1; counters.set(String(k), n); return n; };

async function fakeFetch(url: unknown, init?: RequestInit) {
  const u = String(url);
  const body = JSON.parse(String(init?.body ?? "{}"));
  if (u.includes("neon.tech")) {
    const q = { query: String(body.query), params: body.params as unknown[] };
    queries.push(q);
    if (dbMode === "throw") return json({ message: "db down" }, 500);
    if (dbMode === "hang") { await new Promise((r) => setTimeout(r, 3000)); return json({ message: "late" }, 500); }
    if (/insert into s1_beta_families/.test(q.query)) {
      const [email, source, , , , , nameKey, age, , , , , , , , , , , eventId] = q.params.map(String);
      assert.match(q.query, /insert into s1_beta_progress \(email, stage, next_step, source, attribution, page, livemode, completed_at\)/);
      const pr = progress.get(email) ?? { session: "", stage: 3, next: "", answers: {}, completed: true, completedAt: clock };
      pr.stage = 3; pr.next = ""; pr.completed = true; pr.completedAt = clock; progress.set(email, pr);
      let fam = families.get(email);
      const newFamily = !fam;
      if (!fam) { fam = { id: `fam-${families.size + 1}`, source }; families.set(email, fam); }
      const key = `${fam.id}|${nameKey}`;
      const prev = players.get(key);
      const pl = prev ?? { id: `pl-${players.size + 1}`, eventId: "", age: 0 };
      const prevEvent = prev ? prev.eventId : "";
      pl.eventId = eventId; pl.age = Number(age); players.set(key, pl);
      const count = [...players.keys()].filter((k) => k.startsWith(`${fam!.id}|`)).length;
      return json({ command: "SELECT", rowCount: 1,
        fields: [["family_id", 25], ["new_family", 16], ["player_id", 25], ["new_player", 16], ["prev_event_id", 25], ["players", 23]].map(([name, dataTypeID]) => ({ name, dataTypeID })),
        rows: [[fam.id, newFamily ? "t" : "f", pl.id, prev ? "f" : "t", prevEvent, String(count)]] });
    }
    if (/^insert into s1_beta_progress/.test(q.query)) {
      const [email, session, stage, next, answers] = q.params.map(String);
      const old = progress.get(email);
      assert.match(q.query, /p\.completed_at > now\(\) - interval '2 minutes'/);
      const same = !!old && (old.session === session || (old.completed && clock - old.completedAt < 120000));
      const row = same
        ? { session, stage: Math.max(old!.stage, Number(stage)), next: old!.stage > Number(stage) ? old!.next : next, answers: { ...old!.answers, ...JSON.parse(answers) }, completed: old!.completed, completedAt: old!.completedAt }
        : { session, stage: Number(stage), next, answers: JSON.parse(answers), completed: false, completedAt: 0 };
      progress.set(email, row);
      return json({ command: "INSERT", rowCount: 1, fields: [["id", 25], ["stage", 23], ["completed", 16]].map(([name, dataTypeID]) => ({ name, dataTypeID })), rows: [["pr-1", String(row.stage), row.completed ? "t" : "f"]] });
    }
    if (/^with a as/.test(q.query.trim())) {
      const a = bump(q.params[0]);
      const b = a <= Number(q.params[2]) ? bump(q.params[3]) : null;
      return json(result(["a_count", "b_count"], [[a, b]]));
    }
    if (/^\s*insert into s1_rate_limits/.test(q.query)) return json(result(["count"], [[bump(q.params[0])]]));
    if (/^delete from s1_rate_limits/.test(q.query)) return json({ command: "DELETE", rowCount: 0, fields: [], rows: [] });
    throw new Error("unit: unexpected query " + q.query.slice(0, 60));
  }
  if (u.includes("a.klaviyo.com")) {
    klaviyo.push({ path: u.split("/api/")[1], body });
    return new Response(u.endsWith("/events") ? "" : "{}", { status: u.endsWith("/events") ? eventStatus : 202 });
  }
  if (u.includes("discord.test")) { discord.push(String(body.content)); return new Response("", { status: 204 }); } // must stay empty: no Discord in the beta
  if (u.includes("sheets.test")) { sheets.push(body); return json({ ok: true }); }
  if (u.includes("graph.facebook.com")) { graph++; return json({ events_received: 1 }); }
  throw new Error("unit: unexpected network call " + u);
}

const events = () => klaviyo.filter((c) => c.path === "events").map((c) => c.body.data.attributes);
const consents = () => klaviyo.filter((c) => c.path.startsWith("profile-subscription")).map((c) => c.body.data);
const post = async (payload: unknown, headers: Record<string, string> = {}) => {
  const { POST } = await import("../../../app/api/season-one/route");
  const { NextRequest } = await import("next/server");
  const r = await POST(new NextRequest("http://localhost:3103/api/season-one", {
    method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(payload),
  }));
  return { status: r.status, body: (await r.json()) as Record<string, unknown> };
};
const wiz = (extra: Record<string, unknown> = {}) => ({
  step: "beta-wizard", email: "Team+S1Test-Unit@example.com", eventId: "evt-beta-0001",
  playerName: "Maya", playerAge: 12, playsOn: ["Console", "Phone"], teamSports: "Tried, didn't stick",
  superpowers: ["Makes everyone laugh", "Quick thinker"], funFact: "Knows every flag in the world",
  expectations: ["No toxicity", "Positive mindset", "Winning attitude"], timeZone: "Eastern", tz: "America/New_York",
  times: ["Weekday evenings", "Weekend afternoons"], note: "",
  attribution: { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "" },
  page: "/season1/beta/start", ekz_hp: "", ...extra,
});
const EMAIL = "team+s1test-unit@example.com";

describe("POST /api/season-one step beta-wizard", () => {
  before(() => {
    for (const k of ["DATABASE_URL", "KLAVIYO_PRIVATE_API_KEY", "S1_REF_SECRET", "STRIPE_SECRET_KEY", "S1_DISCORD_WEBHOOK_URL", "S1_DISCORD_WEBHOOK_URL_TEST", "S1_BETA_SHEETS_WEBHOOK_URL", "META_CAPI_ACCESS_TOKEN", "META_PIXEL_ID"]) saved[k] = process.env[k];
    process.env.DATABASE_URL = "postgresql://" + "unit" + ":" + "unit" + "@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.KLAVIYO_PRIVATE_API_KEY = "unit-klaviyo-key";
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    process.env.STRIPE_SECRET_KEY = "unit-not-a-live-key";
    process.env.S1_DISCORD_WEBHOOK_URL_TEST = "https://discord.test/hook";
    process.env.META_CAPI_ACCESS_TOKEN = "unit-meta-token";
    process.env.META_PIXEL_ID = "1234567890";
    delete process.env.S1_DISCORD_WEBHOOK_URL;
    delete process.env.S1_BETA_SHEETS_WEBHOOK_URL;
    globalThis.fetch = fakeFetch as typeof fetch;
    console.log = console.warn = console.error = (...a: unknown[]) => { logs.push(a.map(String).join(" ")); };
  });
  after(() => {
    globalThis.fetch = realFetch;
    Object.assign(console, realConsole);
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });
  beforeEach(() => {
    klaviyo = []; discord = []; sheets = []; graph = 0; queries = []; dbMode = "ok"; eventStatus = 202;
    families = new Map(); players = new Map(); counters = new Map(); progress = new Map(); clock = 0; logs.length = 0;
    delete process.env.S1_BETA_SHEETS_WEBHOOK_URL;
  });

  it("B1: an email with no earlier sign-up is saved: family, player, event; nothing goes to Discord", async () => {
    const r = await post(wiz());
    assert.deepEqual(r, { status: 200, body: { ok: true } });
    assert.equal(families.size, 1); assert.equal(players.size, 1);
    const ev = events(); assert.equal(ev.length, 1);
    assert.equal(ev[0].metric.data.attributes.name, "Beta Wizard Completed");
    assert.equal(ev[0].profile.data.attributes.email, EMAIL);
    assert.equal(ev[0].unique_id, `${EMAIL}-Beta Wizard Completed-evt-beta-0001`);
    assert.deepEqual(ev[0].properties.times, ["Weekday evenings", "Weekend afternoons"]);
    assert.equal(ev[0].properties.player_age, 12);
    assert.equal(ev[0].profile.data.attributes.properties.beta_wizard, "yes");
    assert.equal(ev[0].profile.data.attributes.properties.beta_time_zone, "Eastern");
    assert.equal(discord.length, 0);
    assert.equal(ev[0].profile.data.attributes.properties.beta_wizard_stage, "done");
  });

  it("B2 (P3): never the Season 01 Waitlist: no list relationship, no Waitlist metric, no step lock or 24 h claim query, no Meta call", async () => {
    await post(wiz());
    assert.equal(consents().length, 0); // no subscribe or consent call of any kind: an open endpoint must not opt in someone else's address
    assert.equal(klaviyo.every((c) => c.path === "events"), true);
    assert.equal(JSON.stringify(klaviyo).includes("XGTv2F"), false);
    assert.equal(events().some((e) => /Season 01 Waitlist/.test(e.metric.data.attributes.name)), false);
    assert.equal(queries.some((q) => /with seen as|select 1 from s1_rate_limits/.test(q.query)), false);
    assert.equal(queries.some((q) => /s1wl:/.test(JSON.stringify(q.params))), false);
    assert.equal(graph, 0);
  });

  it("B3: a retry of the same submit records one player and one Sheets row", async () => {
    process.env.S1_BETA_SHEETS_WEBHOOK_URL = "https://sheets.test/exec";
    await post(wiz()); const again = await post(wiz());
    assert.equal(again.status, 200);
    assert.equal(players.size, 1);
    assert.equal(sheets.length, 1);
    const ids = events().map((e) => e.unique_id); assert.equal(ids.length, 2); assert.equal(ids[0], ids[1]); // Klaviyo dedupes on unique_id
  });

  it("B4: a second player on the same email records a second player", async () => {
    await post(wiz());
    const r = await post(wiz({ eventId: "evt-beta-0002", playerName: "Leo", playerAge: 9 }));
    assert.equal(r.status, 200);
    assert.equal(families.size, 1); assert.equal(players.size, 2);
    assert.equal(events().length, 2);
  });

  it("B5: the same player sent again with new answers updates the row", async () => {
    await post(wiz());
    await post(wiz({ eventId: "evt-beta-0003", playerAge: 13 }));
    assert.equal(players.size, 1);
    assert.equal([...players.values()][0].age, 13);
    assert.equal(events().length, 2); // each submission keeps its own Klaviyo event
  });

  it("B6: thirty families on one network in an hour are all saved", async () => {
    for (let i = 0; i < 30; i++) {
      const r = await post(wiz({ email: `team+s1test-unit-${i}@example.com`, eventId: `evt-school-${i}` }), { "x-nf-client-connection-ip": "203.0.113.7" });
      assert.equal(r.status, 200, `family ${i}`);
    }
    assert.equal(families.size, 30);
  });

  it("B6b: past the per-IP ceiling the answer is a 429 with the text-our-founder line and nothing is written", async () => {
    for (let i = 0; i < 30; i++) await post(wiz({ email: `team+s1test-unit-${i}@example.com`, eventId: `e-${i}` }), { "x-nf-client-connection-ip": "203.0.113.9" });
    const before = families.size;
    const r = await post(wiz({ email: "team+s1test-unit-x@example.com", eventId: "e-x" }), { "x-nf-client-connection-ip": "203.0.113.9" });
    assert.equal(r.status, 429);
    assert.match(String(r.body.error), /Text our founder at \(832\) 271-0150/);
    assert.equal(families.size, before);
  });

  it("A2: no per-email limit: 25 submissions for one address from different networks never lock the family out", async () => {
    for (let i = 0; i < 25; i++) {
      const r = await post(wiz({ eventId: `e-a2-${i}` }), { "x-nf-client-connection-ip": `198.51.100.${i + 1}` });
      assert.equal(r.status, 200, `submission ${i}`);
    }
    assert.equal(queries.some((q) => /s1bw:em:/.test(JSON.stringify(q.params))), false);
  });

  it("A3: past 200 an hour across everyone, answers are still saved but no Sheets row is written", async () => {
    process.env.S1_BETA_SHEETS_WEBHOOK_URL = "https://sheets.test/exec";
    counters.set("s1bw:global", 200);
    const r = await post(wiz(), { "x-nf-client-connection-ip": "203.0.113.20" });
    assert.equal(r.status, 200);
    assert.equal(players.size, 1); assert.equal(events().length, 1);
    assert.equal(sheets.length, 0);
  });

  it("A5: a utm_source is reduced to tag characters before it is stored as the source", async () => {
    await post(wiz({ attribution: { utm_source: "[Verify](https://evil.example) @everyone" } }));
    assert.match(String(events()[0].properties.source), /^[a-z0-9_.:-]+$/);
  });

  it("B7: the honeypot stops a bot: 200, nothing written anywhere", async () => {
    const r = await post(wiz({ ekz_hp: "http://spam.example" }));
    assert.deepEqual(r, { status: 200, body: { ok: true } });
    assert.equal(queries.length + klaviyo.length + discord.length + sheets.length, 0);
  });

  it("B8: every field is checked against the wizard's allowed values", async () => {
    const bad: Record<string, unknown>[] = [
      { playerAge: 8 }, { playerAge: 19 }, { playerAge: "12" }, { playerAge: 12.5 }, { playerName: "" }, { playerName: "<>" }, { playerName: 5 },
      { playsOn: ["Xbox"] }, { playsOn: "Console" }, { teamSports: "Great" }, { teamSports: 3 },
      { superpowers: ["Never gives up", "Quick thinker", "Natural leader"] }, { superpowers: ["Flying"] },
      { expectations: ["No toxicity", "Positive mindset"] }, { expectations: [] }, { expectations: ["No toxicity", "Positive mindset", "Other"] },
      { timeZone: "Atlantic" }, { timeZone: undefined }, { times: [] }, { times: ["Weeknights"] }, { times: "Weekday evenings" },
    ];
    for (const b of bad) {
      const r = await post(wiz(b));
      assert.equal(r.status, 400, JSON.stringify(b));
      assert.equal(typeof r.body.error, "string");
    }
    assert.equal(queries.length + klaviyo.length + discord.length, 0);
    // Optional fields may be empty or absent.
    const ok = await post(wiz({ playsOn: [], teamSports: "", superpowers: [], funFact: "", note: undefined, tz: "not/a-zone" }));
    assert.equal(ok.status, 200);
    assert.equal(events()[0].properties.tz, "");
  });

  it("B9: playerName, funFact and note are untrusted text: markup and control characters never reach a template", async () => {
    await post(wiz({
      playerName: "<b>Ma@ya</b> `x` |", funFact: "<script>alert(1)</script> loves\u0000 chess " + "x".repeat(300),
      note: "<img src=x onerror=1>\nCall me @everyone " + "y".repeat(900),
    }));
    const p = events()[0].properties;
    assert.equal(p.player_name, "bMayab x");
    assert.equal(/[<>\u0000-\u001f]/.test(p.fun_fact + p.note + p.player_name), false);
    assert.ok(p.fun_fact.length <= 120); assert.ok(p.note.length <= 500);
  });

  it("B10: source and attribution: the ?src= cookie wins, then the last click, then utm on the wizard URL", async () => {
    const lc = encodeURIComponent(JSON.stringify({ utm_source: "newsletter", utm_medium: "email", path: "/season1/beta/launch", ts: Date.now() }));
    await post(wiz(), { cookie: `ekuzo_bsrc=karlin-email; ekuzo_lc=${lc}; ekuzo_origin=direct` });
    const q = queries.find((x) => /insert into s1_beta_families/.test(x.query))!;
    assert.equal(q.params[1], "karlin-email");
    const attr = JSON.parse(String(q.params[2]));
    assert.equal(attr.src, "karlin-email"); assert.equal(attr.utm_source, "newsletter"); assert.equal(attr.lc_path, "/season1/beta/launch");
    assert.equal(events()[0].properties.source, "karlin-email");
    assert.equal(events()[0].profile.data.attributes.properties.beta_source, "karlin-email");
    klaviyo = [];
    await post(wiz({ email: "team+s1test-unit-b@example.com", eventId: "e-b", attribution: { utm_source: "partner-ams", utm_medium: "referral" } }), { cookie: "ekuzo_bsrc=Bad Value!!" });
    assert.equal(events()[0].properties.source, "partner-ams");
    assert.equal(events()[0].properties.src, "");
  });

  it("B11: the database down: Klaviyo still saves and the parent gets ok", async () => {
    dbMode = "throw";
    const r = await post(wiz());
    assert.equal(r.status, 200);
    assert.equal(events().length, 1);
    assert.ok(logs.some((l) => /Beta wizard database save failed/.test(l)));
  });

  it("B12: Klaviyo down: the database still saves; both down is a 502 that names the founder", async () => {
    eventStatus = 500;
    const r = await post(wiz());
    assert.equal(r.status, 200);
    assert.equal(players.size, 1);
    assert.ok(logs.some((l) => /Klaviyo beta wizard event failed/.test(l)));
    dbMode = "throw";
    const both = await post(wiz({ eventId: "evt-beta-0009" }));
    assert.equal(both.status, 502);
    assert.match(String(both.body.error), /text our founder at \(832\) 271-0150/);
  });

  it("D9: zero-width and text-direction marks are stripped from free text", async () => {
    await post(wiz({ funFact: "abc\u202Edef\u200B", note: "x\u2066y\u2069\uFEFF" }));
    assert.equal(events()[0].properties.fun_fact, "abc def"); assert.equal(events()[0].properties.note, "x y");
  });

  it("D8: a database failure logs a code or name, never the driver's message", async () => {
    dbMode = "throw";
    await post(wiz());
    const line = logs.find((l) => /Beta wizard database save failed/.test(l))!;
    assert.equal(/db down/.test(line), false); assert.match(line, /failed: [A-Za-z0-9_]+$/);
  });

  it("B13: Sheets row only when S1_BETA_SHEETS_WEBHOOK_URL is set", async () => {
    await post(wiz());
    assert.equal(sheets.length, 0);
    process.env.S1_BETA_SHEETS_WEBHOOK_URL = "https://sheets.test/exec";
    await post(wiz({ eventId: "evt-beta-0010", playerName: "Leo" }));
    assert.equal(sheets.length, 1);
    assert.equal(sheets[0].tab, "beta-players");
    assert.equal(sheets[0].rows[0].weekday_evenings, "yes"); assert.equal(sheets[0].rows[0].weekday_afternoons, "");
  });

  it("B14: logs never carry the email, the player's name or an answer", async () => {
    dbMode = "throw"; eventStatus = 500;
    await post(wiz());
    await post(wiz({ ekz_hp: "x" }));
    const all = logs.join("\n");
    assert.ok(all.length > 0);
    for (const s of ["s1test", "Maya", "flag", "example.com"]) assert.equal(all.includes(s), false, s);
  });

  describe("drop-off capture (step beta-progress)", () => {
    const prog = (stage: number, answers: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) => ({
      step: "beta-progress", email: "Team+S1Test-Unit@example.com", sessionId: "sess-0001", stage, answers,
      attribution: {}, page: "/season1/beta/start", ekz_hp: "", ...extra,
    });
    const profile = (i: number) => events()[i].profile.data.attributes.properties;

    it("P1: the email screen alone puts the family on record with the step to pick up at", async () => {
      const r = await post(prog(0), { cookie: "ekuzo_bsrc=karlin-email" });
      assert.deepEqual(r, { status: 200, body: { ok: true } });
      const row = progress.get(EMAIL)!;
      assert.equal(row.stage, 0); assert.equal(row.next, "What the beta is"); assert.equal(row.completed, false);
      const ev = events(); assert.equal(ev.length, 1);
      assert.equal(ev[0].metric.data.attributes.name, "Beta Wizard Progress");
      assert.equal(ev[0].unique_id, `${EMAIL}-Beta Wizard Progress-sess-0001-0`);
      assert.equal(ev[0].properties.next_step, "What the beta is"); assert.equal(ev[0].properties.next_step_number, 1);
      assert.equal(profile(0).beta_wizard_stage, "email"); assert.equal(profile(0).beta_wizard_next_step, "What the beta is");
      assert.equal(typeof profile(0).beta_wizard_started_at, "string"); assert.equal(profile(0).beta_source, "karlin-email");
      assert.equal(families.size + players.size, 0); // not a sign-up yet
      assert.equal(JSON.stringify(klaviyo).includes("XGTv2F"), false); assert.equal(consents().length, 0); assert.equal(graph, 0);
    });

    it("P2: each step adds the answers so far; the stage only moves forward within one wizard run", async () => {
      await post(prog(0));
      await post(prog(1, { expectations: ["No toxicity", "Positive mindset", "Winning attitude"] }));
      await post(prog(2, { playerName: "Maya", playerAge: 12, playsOn: ["Console"], superpowers: ["Quick thinker"], funFact: "Knows flags" }));
      await post(prog(1, { expectations: ["No toxicity", "Positive mindset", "Winning attitude"] })); // went back and forward again
      const row = progress.get(EMAIL)!;
      assert.equal(row.stage, 2); assert.equal(row.next, "Availability");
      assert.equal(row.answers.playerName, "Maya"); assert.deepEqual(row.answers.expectations, ["No toxicity", "Positive mindset", "Winning attitude"]);
      assert.equal(profile(2).beta_wizard_stage, "player card"); assert.equal(profile(2).beta_wizard_next_step, "Availability");
      assert.equal(profile(2).beta_player_name, "Maya"); assert.equal(profile(2).beta_player_age, 12);
      assert.equal(profile(2).beta_wizard_started_at, undefined); // only the first step stamps the start
    });

    it("P3: finishing the wizard marks the progress row done and the profile stage done, so no pick-up email fires", async () => {
      await post(prog(0)); await post(prog(1)); await post(prog(2, { playerName: "Maya", playerAge: 12 }));
      await post(wiz());
      assert.equal(progress.get(EMAIL)!.completed, true); assert.equal(progress.get(EMAIL)!.stage, 3);
      const done = events().find((e) => e.metric.data.attributes.name === "Beta Wizard Completed")!;
      assert.equal(done.profile.data.attributes.properties.beta_wizard_stage, "done");
      assert.equal(done.profile.data.attributes.properties.beta_wizard_next_step, "done"); // never an empty string: Klaviyo can keep the old value
    });

    it("P4: a new run after finishing (a sibling) starts the row over, so stopping again is a drop-off again", async () => {
      await post(prog(0)); await post(wiz());
      clock += 10 * 60 * 1000; // ten minutes later
      await post(prog(0, {}, { sessionId: "sess-0002" }));
      const row = progress.get(EMAIL)!;
      assert.equal(row.completed, false); assert.equal(row.stage, 0); assert.equal(row.session, "sess-0002");
    });

    it("P9: posts that arrive out of order never put a finished family back on a step", async () => {
      // The wizard lands first (no progress row yet), then the three progress posts straggle in.
      await post(wiz());
      assert.equal(progress.get(EMAIL)!.completed, true);
      klaviyo = [];
      await post(prog(0)); await post(prog(1)); await post(prog(2, { playerName: "Maya", playerAge: 12 }));
      const row = progress.get(EMAIL)!;
      assert.equal(row.completed, true); assert.equal(row.stage, 3); assert.equal(row.next, "");
      assert.equal(klaviyo.length, 0); // nothing sent: the profile keeps beta_wizard_stage "done"
    });

    it("P5: answers are filtered, never rejected: bad or hostile values are left out and the post still lands", async () => {
      const r = await post(prog(2, { playerName: "<b>Ma@ya</b>", playerAge: 44, playsOn: ["Xbox"], teamSports: "x", superpowers: "no", funFact: "<script>x</script>\u0000ok", timeZone: "Mars", junk: { a: 1 } }));
      assert.equal(r.status, 200);
      const a = progress.get(EMAIL)!.answers;
      assert.deepEqual(Object.keys(a).sort(), ["funFact", "playerName"]);
      assert.equal(a.playerName, "bMayab"); assert.equal(/[<>\u0000]/.test(String(a.funFact)), false);
    });

    it("P6: a malformed post is a 400 and writes nothing; the honeypot is a silent 200", async () => {
      for (const b of [prog(3), prog(-1), prog(1.5), { ...prog(0), stage: "1" }, { ...prog(0), sessionId: "" }, { ...prog(0), sessionId: 7 }]) {
        assert.equal((await post(b)).status, 400, JSON.stringify(b).slice(0, 80));
      }
      assert.equal((await post(prog(0, {}, { ekz_hp: "bot" }))).status, 200);
      assert.equal(progress.size + klaviyo.length, 0);
    });

    it("P7: failures never reach the parent: database down, Klaviyo down, or over the per-IP ceiling are all a quiet 200", async () => {
      dbMode = "throw"; eventStatus = 500;
      assert.deepEqual(await post(prog(0)), { status: 200, body: { ok: true } });
      dbMode = "ok"; eventStatus = 202; klaviyo = [];
      const { keyHash } = await import("../rules");
      counters.set(`s1bp:ip:${keyHash("203.0.113.30")}`, 150);
      assert.equal((await post(prog(0), { "x-nf-client-connection-ip": "203.0.113.30" })).status, 200);
      assert.equal(progress.size + klaviyo.length, 0);
    });

    it("P8: progress posts never count against the sign-up limits, and logs stay clean", async () => {
      for (let i = 0; i < 40; i++) await post(prog(i % 3, { playerName: "Maya" }), { "x-nf-client-connection-ip": "203.0.113.31" });
      const r = await post(wiz(), { "x-nf-client-connection-ip": "203.0.113.31" });
      assert.equal(r.status, 200);
      for (const s of ["s1test", "Maya", "example.com"]) assert.equal(logs.join("\n").includes(s), false, s);
    });
  });

  it("regression: an unknown step is still a 400 and the other steps are untouched by this one", async () => {
    const r = await post({ email: EMAIL, step: "beta-wizzard" });
    assert.equal(r.status, 400);
    assert.equal(queries.length + klaviyo.length, 0);
  });
});
