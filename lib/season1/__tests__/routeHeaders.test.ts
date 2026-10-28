import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mintNumeric } from "../codes";

/**
 * Season 01 HTML routes and invite/remove without a database (security review
 * L2, L3, L7, L9, L12). fetch is stubbed to fail, so /crew/<code> takes its
 * DB-error path (nameless page, errCode-only log line).
 */
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
const realError = console.error;
const logged: string[] = [];

const get = (path: string, headers: Record<string, string> = {}) =>
  new Request(`http://localhost:3103${path}`, { headers: { host: "localhost:3103", ...headers } });

function assertSecurityHeaders(r: Response, what: string, frame = "DENY") {
  assert.equal(r.headers.get("x-frame-options"), frame, what);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff", what);
}

describe("Season 01 route headers (no DB)", () => {
  before(() => {
    for (const k of ["STRIPE_SECRET_KEY", "DATABASE_URL", "S1_REF_SECRET", "S1_COMMIT_MODE"]) saved[k] = process.env[k];
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.S1_REF_SECRET = "unit-ref-secret";
    globalThis.fetch = (async () => {
      throw new TypeError("unit: secret-looking message postgres://user:pw@host");
    }) as typeof fetch;
    console.error = (...a: unknown[]) => {
      logged.push(a.map(String).join(" "));
    };
  });
  after(() => {
    globalThis.fetch = realFetch;
    console.error = realError;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  // These run in test mode: the four funnel pages send SAMEORIGIN there (dev phone
  // preview, see pageSecurityHeaders); live keeps DENY (devView.test.ts). Terms stays DENY.
  it("L7: join, signup, welcome and crew send SAMEORIGIN in test mode, terms DENY, all nosniff", async () => {
    const join = await import("../../../app/season1/join/route");
    const signup = await import("../../../app/season1/join/signup/route");
    const welcome = await import("../../../app/season1/join/welcome/route");
    const terms = await import("../../../app/season1/terms/route");
    const crew = await import("../../../app/crew/[code]/route");
    assertSecurityHeaders(join.GET(get("/season1/join")), "join", "SAMEORIGIN");
    assertSecurityHeaders(await signup.GET(get("/season1/join/signup")), "signup", "SAMEORIGIN");
    assertSecurityHeaders(await welcome.GET(get("/season1/join/welcome")), "welcome", "SAMEORIGIN");
    assertSecurityHeaders(terms.GET(get("/season1/terms")), "terms");
    const c = await crew.GET(get("/crew/48271937"), { params: Promise.resolve({ code: "48271937" }) });
    assert.equal(c.status, 200);
    assertSecurityHeaders(c, "crew", "SAMEORIGIN");
  });

  it("/season1/terms moves to the Terms of Service Season 01 anchor, keeping no-referrer and dropping the query", async () => {
    const terms = await import("../../../app/season1/terms/route");
    const { redirectToBare } = await import("../redirect");
    const r = terms.GET(get("/season1/terms?kid=Sam"));
    const html = await r.text();
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("referrer-policy"), "no-referrer");
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
    assert.match(html, /url=\/terms-of-service#season-01"/);
    assert.equal(html.includes("Sam"), false);
    // Only one safe fragment survives; anything else is stripped.
    const odd = await redirectToBare(get("/x"), '/a/b#frag"><script>#x?y=1').text();
    assert.match(odd, /url=\/a\/b#fragscriptxy1"/);
    assert.equal(/[<>"=?]/.test(odd.match(/url=([^"]*)"/)![1]), false);
  });

  it("L9: a crew lookup failure logs an error code only, never the message", async () => {
    logged.length = 0;
    const crew = await import("../../../app/crew/[code]/route");
    const code = mintNumeric(); // passes the check digit, so the lookup reaches the (failing) DB
    await crew.GET(get(`/crew/${code}`), { params: Promise.resolve({ code }) });
    const line = logged.find((l) => l.includes("crew.resolve"));
    assert.ok(line, logged.join("\n"));
    assert.match(line!, /^s1 step=crew\.resolve order=- ok=false err=[A-Za-z0-9_.:-]+$/);
    assert.equal(logged.some((l) => /postgres:|secret-looking/.test(l)), false);
  });

  it("L2: invite/remove clears the cookie same-origin and refuses cross-site", async () => {
    const { POST } = await import("../../../app/api/season1/invite/remove/route");
    const post = (h: Record<string, string>) =>
      POST(new Request("http://localhost:3103/api/season1/invite/remove", { method: "POST", headers: { host: "localhost:3103", ...h } }));
    const ok = await post({ "sec-fetch-site": "same-origin", origin: "http://localhost:3103" });
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get("set-cookie") ?? "", /^s1_ref=; .*Max-Age=0/);
    assertSecurityHeaders(ok, "invite/remove");
    for (const h of [{ "sec-fetch-site": "cross-site" }, { origin: "https://evil.example" }] as Record<string, string>[]) {
      const bad = await post(h);
      assert.equal(bad.status, 403, JSON.stringify(h));
      assert.equal(bad.headers.get("set-cookie"), null);
    }
  });

  it("L12: the welcome retry cookie is Secure and HttpOnly", async () => {
    const welcome = await import("../../../app/season1/join/welcome/route");
    // A well-formed s1_order token makes the lookup run; the stubbed fetch throws -> dbError path.
    const r = await welcome.GET(get("/season1/join/welcome", { cookie: "s1_order=abcdefghijklmnopqrstuvwxyz012345" }));
    const sc = r.headers.get("set-cookie") ?? "";
    assert.match(sc, /s1_wtry=1; Path=\/season1; Max-Age=120; Secure; HttpOnly; SameSite=Lax/);
  });
});
