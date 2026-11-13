import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { restartToken, BETA_RESTART_COOKIE, BETA_RESTART_FLAG_COOKIE } from "../betaRestart";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const ROW = "3f2b8c1e-5a47-4d9e-9b0a-7c6d5e4f3a21";
const saved: Record<string, string | undefined> = {};

const hit = async (token: string, url = "https://ekuzo.gg/season1/beta/r/" + token) => {
  const { GET } = await import("../../../app/season1/beta/r/[token]/route");
  return GET(new Request(url), { params: Promise.resolve({ token }) });
};

describe("GET /season1/beta/r/<token>", () => {
  before(() => { saved.S1_REF_SECRET = process.env.S1_REF_SECRET; process.env.S1_REF_SECRET = "unit-ref-secret-0123456789"; });
  after(() => { if (saved.S1_REF_SECRET === undefined) delete process.env.S1_REF_SECRET; else process.env.S1_REF_SECRET = saved.S1_REF_SECRET; });

  it("a good shape: 302, relative Location with nothing in it, the three privacy headers, no body", async () => {
    const t = restartToken(ROW, "sess-1")!;
    const r = await hit(t);
    assert.equal(r.status, 302);
    assert.equal(r.headers.get("location"), "/season1/beta/start");
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("referrer-policy"), "no-referrer");
    assert.equal(r.headers.get("x-robots-tag"), "noindex");
    assert.equal(await r.text(), "");
    assert.equal((r.headers.get("location") ?? "").includes(t), false);
  });
  it("sets both cookies: the token HttpOnly on the API path, the flag readable on the page path", async () => {
    const t = restartToken(ROW, "sess-1")!;
    const cookies = (await hit(t)).headers.getSetCookie();
    assert.equal(cookies.length, 2);
    const brt = cookies.find((c) => c.startsWith(`${BETA_RESTART_COOKIE}=`))!;
    const brf = cookies.find((c) => c.startsWith(`${BETA_RESTART_FLAG_COOKIE}=`))!;
    assert.equal(brt, `ekuzo_brt=${t}; Path=/api/season1-beta; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`);
    assert.equal(brf, "ekuzo_brf=1; Path=/season1/beta; Max-Age=1800; Secure; SameSite=Lax");
    assert.equal(/HttpOnly/i.test(brf), false);
  });
  it("a query string on the link changes nothing and is not carried", async () => {
    const t = restartToken(ROW, "sess-1")!;
    const r = await hit(t, `https://ekuzo.gg/season1/beta/r/${t}?utm_source=klaviyo&_kx=abc`);
    assert.equal(r.status, 302);
    assert.equal(r.headers.get("location"), "/season1/beta/start");
    assert.equal(r.headers.getSetCookie().length, 2);
  });
  it("bad shapes (short, long, odd characters, empty) still land on the wizard and set no cookie", async () => {
    const t = restartToken(ROW, "sess-1")!;
    for (const bad of [t.slice(0, 64), t + "A", "x".repeat(65).replace(/x$/, "."), "", "../start", "%20".repeat(22)]) {
      const r = await hit(bad);
      assert.equal(r.status, 302, bad);
      assert.equal(r.headers.get("location"), "/season1/beta/start");
      assert.equal(r.headers.getSetCookie().length, 0, bad);
      assert.equal(r.headers.get("cache-control"), "no-store");
    }
  });
  it("does no database work and imports nothing but the dependency-free cookie module", () => {
    const src = readFileSync(join(ROOT, "app", "season1", "beta", "r", "[token]", "route.ts"), "utf8");
    const imports = [...src.matchAll(/^import .* from "([^"]+)"/gm)].map((m) => m[1]);
    assert.deepEqual(imports, ["@/lib/season1/betaRestartCookies"]);
    assert.equal(/getSql|fetch\(/.test(src), false);
    const cookies = readFileSync(join(ROOT, "lib", "season1", "betaRestartCookies.ts"), "utf8");
    assert.equal(/^import /m.test(cookies), false);
  });
});
