import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  restartToken, parseRestartToken, verifyRestartToken, restartLinkBase, maskEmail, RESTART_VALID_DAYS,
  BETA_RESTART_COOKIE, BETA_RESTART_FLAG_COOKIE, isRestartTokenShape, restartSetCookies, restartClearCookies,
} from "../betaRestart";

const saved: Record<string, string | undefined> = {};
const ROW = "3f2b8c1e-5a47-4d9e-9b0a-7c6d5e4f3a21";
const OTHER = "3f2b8c1e-5a47-4d9e-9b0a-7c6d5e4f3a22";
const SESSION = "sess-0001";

describe("beta restart token", () => {
  before(() => {
    for (const k of ["S1_REF_SECRET", "S1_DEPLOY_CONTEXT", "CONTEXT", "DEPLOY_PRIME_URL"]) saved[k] = process.env[k];
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
  });
  after(() => {
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });

  it("is 65 URL-safe characters and round trips", () => {
    const t = restartToken(ROW, SESSION)!;
    assert.equal(t.length, 65);
    assert.match(t, /^[A-Za-z0-9_-]{65}$/);
    assert.equal(parseRestartToken(t), ROW);
    assert.equal(verifyRestartToken(t, ROW, SESSION), true);
    assert.equal(restartToken(ROW, SESSION), t); // stable
  });
  it("reads nothing about the family: no email, name or session in the text", () => {
    const t = restartToken(ROW, SESSION)!;
    assert.equal(t.includes(SESSION), false);
    assert.equal(t.includes("@"), false);
  });
  it("a wrong session fails", () => {
    const t = restartToken(ROW, SESSION)!;
    assert.equal(verifyRestartToken(t, ROW, "sess-0002"), false);
  });
  it("a wrong row fails", () => {
    const t = restartToken(ROW, SESSION)!;
    assert.equal(verifyRestartToken(t, OTHER, SESSION), false);
    const t2 = restartToken(OTHER, SESSION)!;
    assert.equal(verifyRestartToken(t2, ROW, SESSION), false);
  });
  it("a truncated token, 64 and 66 characters, an altered byte and a changed key all fail", () => {
    const t = restartToken(ROW, SESSION)!;
    assert.equal(parseRestartToken(t.slice(0, 64)), null);
    assert.equal(parseRestartToken(t + "A"), null);
    assert.equal(verifyRestartToken(t.slice(0, 64), ROW, SESSION), false);
    assert.equal(verifyRestartToken(t + "A", ROW, SESSION), false);
    assert.equal(verifyRestartToken("", ROW, SESSION), false);
    for (const i of [0, 10, 21, 22, 40, 63]) {
      const c = t[i] === "A" ? "B" : "A";
      assert.equal(verifyRestartToken(t.slice(0, i) + c + t.slice(i + 1), ROW, SESSION), false, `byte ${i}`);
    }
    process.env.S1_REF_SECRET = "unit-other-secret-0123456789";
    assert.equal(verifyRestartToken(t, ROW, SESSION), false);
    process.env.S1_REF_SECRET = "unit-ref-secret-0123456789";
    assert.equal(verifyRestartToken(t, ROW, SESSION), true);
  });
  it("a non-canonical encoding of the same bytes is refused", () => {
    const t = restartToken(ROW, SESSION)!;
    // The last character of the id part carries 2 spare bits; flipping within them decodes to the same bytes.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const last = alphabet.indexOf(t[21]);
    const twin = alphabet[last ^ 1];
    const forged = t.slice(0, 21) + twin + t.slice(22);
    assert.equal(parseRestartToken(forged), null);
    assert.equal(verifyRestartToken(forged, ROW, SESSION), false);
  });
  it("a non-uuid id never throws: no token is made, parse and verify say no", () => {
    for (const bad of ["pr-1", "", "3F2B8C1E-5A47-4D9E-9B0A-7C6D5E4F3A21", "3f2b8c1e5a474d9e9b0a7c6d5e4f3a21", "not a uuid"]) {
      assert.equal(restartToken(bad, SESSION), null, bad);
    }
    assert.equal(parseRestartToken(undefined), null);
    assert.equal(parseRestartToken(42), null);
    assert.equal(parseRestartToken("x".repeat(65)), null);
    assert.equal(verifyRestartToken("x".repeat(65), "pr-1", SESSION), false);
    assert.equal(verifyRestartToken(restartToken(ROW, SESSION), "pr-1", SESSION), false);
  });
  it("the shape check and cookie strings", () => {
    assert.equal(isRestartTokenShape(restartToken(ROW, SESSION)), true);
    assert.equal(isRestartTokenShape("short"), false);
    assert.equal(isRestartTokenShape(undefined), false);
    assert.equal(RESTART_VALID_DAYS, 14);
    const [t, f] = restartSetCookies("T".repeat(65));
    assert.equal(t, `ekuzo_brt=${"T".repeat(65)}; Path=/api/season1-beta; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`);
    assert.equal(f, "ekuzo_brf=1; Path=/season1/beta; Max-Age=1800; Secure; SameSite=Lax");
    assert.equal(BETA_RESTART_COOKIE, "ekuzo_brt"); assert.equal(BETA_RESTART_FLAG_COOKIE, "ekuzo_brf");
    const [ct, cf] = restartClearCookies();
    assert.match(ct, /^ekuzo_brt=; Path=\/api\/season1-beta; Max-Age=0; HttpOnly/);
    assert.match(cf, /^ekuzo_brf=; Path=\/season1\/beta; Max-Age=0/);
  });
  it("without any secret the token call throws (callers wrap) but parse does not", () => {
    const keep = [process.env.S1_REF_SECRET, process.env.S1_STRIPE_WEBHOOK_SECRET, process.env.STRIPE_SECRET_KEY];
    const t = restartToken(ROW, SESSION)!;
    delete process.env.S1_REF_SECRET; delete process.env.S1_STRIPE_WEBHOOK_SECRET; delete process.env.STRIPE_SECRET_KEY;
    try {
      assert.throws(() => restartToken(ROW, SESSION));
      assert.equal(parseRestartToken(t), ROW);
    } finally {
      process.env.S1_REF_SECRET = keep[0]; if (keep[1] !== undefined) process.env.S1_STRIPE_WEBHOOK_SECRET = keep[1]; if (keep[2] !== undefined) process.env.STRIPE_SECRET_KEY = keep[2];
    }
  });
});

describe("restartLinkBase", () => {
  it("production context is https://ekuzo.gg whatever else is set", () => {
    assert.equal(restartLinkBase({ CONTEXT: "production", DEPLOY_PRIME_URL: "https://evil.example" }), "https://ekuzo.gg");
    assert.equal(restartLinkBase({ S1_DEPLOY_CONTEXT: "production" }), "https://ekuzo.gg");
  });
  it("a preview uses DEPLOY_PRIME_URL only when it is an --ekuzo.netlify.app address", () => {
    assert.equal(restartLinkBase({ CONTEXT: "deploy-preview", DEPLOY_PRIME_URL: "https://deploy-preview-7--ekuzo.netlify.app" }), "https://deploy-preview-7--ekuzo.netlify.app");
    assert.equal(restartLinkBase({ CONTEXT: "branch-deploy", DEPLOY_PRIME_URL: "https://dev--ekuzo.netlify.app" }), "https://dev--ekuzo.netlify.app");
  });
  it("anything else is null", () => {
    for (const url of ["https://evil.example", "http://dev--ekuzo.netlify.app", "https://dev--ekuzo.netlify.app/x", "https://dev--ekuzo.netlify.app.evil.example", "https://ekuzo.netlify.app", "", undefined]) {
      assert.equal(restartLinkBase({ CONTEXT: "deploy-preview", DEPLOY_PRIME_URL: url }), null, String(url));
    }
    assert.equal(restartLinkBase({}), null);
  });
});

describe("maskEmail", () => {
  it("keeps the first character and the full domain", () => {
    assert.equal(maskEmail("jamie@gmail.com"), "j•••@gmail.com");
    assert.equal(maskEmail("a@b.co"), "a•••@b.co");
    assert.equal(maskEmail("jamie@mail.example.org"), "j•••@mail.example.org");
  });
  it("never shows more than the first character, and survives odd input", () => {
    assert.equal(maskEmail("nobody"), "•••");
    assert.equal(maskEmail("@x.com"), "•••");
    assert.equal(maskEmail(""), "•••");
    assert.equal(maskEmail("ÉLodie@x.com").startsWith("É•••@"), true);
  });
});
