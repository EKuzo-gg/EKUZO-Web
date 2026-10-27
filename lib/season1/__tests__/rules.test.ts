import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  jerseyEligible,
  lateConfirm,
  isFullRefund,
  kidsSignature,
  newViewToken,
  hashViewToken,
  safeEqual,
  keyHash,
  globalCeilingAlertKey,
  cleanAttemptId,
  viewTokenCookie,
  stepLine,
  errCode,
} from "../rules";
import { assertKeyMatchesMode, keyIsLive } from "../stripe";
import { createHash, createHmac } from "node:crypto";

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    return fn();
  } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

describe("jerseyEligible (RT8)", () => {
  const H = 3600 * 1000;
  it("created before the cutoff and paid within 24 h", () => {
    const c = new Date("2026-11-30T12:00:00-08:00");
    assert.equal(jerseyEligible(c, new Date(c.getTime() + 24 * H)), true);
    assert.equal(jerseyEligible(c, new Date(c.getTime() + 24 * H + 1)), false);
  });
  it("cutoff boundary is exclusive", () => {
    const cut = Date.parse("2026-11-30T23:59:59-08:00");
    assert.equal(jerseyEligible(new Date(cut - 1), new Date(cut)), true);
    assert.equal(jerseyEligible(new Date(cut), new Date(cut)), false);
  });
  it("Nov 30 create, Dec 20 pay: no jersey", () => {
    assert.equal(jerseyEligible("2026-11-30T10:00:00-08:00", "2026-12-20T10:00:00-08:00"), false);
  });
  it("accepts Stripe epoch seconds", () => {
    const s = Math.floor(Date.parse("2026-11-01T00:00:00Z") / 1000);
    assert.equal(jerseyEligible(s, new Date(s * 1000 + 1000)), true);
  });
  it("bad input is false", () => {
    assert.equal(jerseyEligible("nope", new Date()), false);
  });
});

describe("lateConfirm (RT8)", () => {
  it("at or after closeAt", () => {
    const close = Date.parse("2026-12-31T23:59:59-08:00");
    assert.equal(lateConfirm(new Date(close - 1)), false);
    assert.equal(lateConfirm(new Date(close)), true);
  });
});

describe("isFullRefund (ops 4)", () => {
  it("full only when amount_refunded reaches amount", () => {
    assert.equal(isFullRefund({ amount: 18000, amount_refunded: 18000 }), true);
    assert.equal(isFullRefund({ amount: 18000, amount_refunded: 8000 }), false);
    assert.equal(isFullRefund({ amount: 18000, amount_refunded: 0 }), false);
    assert.equal(isFullRefund({ amount: 0, amount_refunded: 0 }), false);
  });
  it("split refunds that sum to the total read as full", () => {
    assert.equal(isFullRefund({ amount: 18000, amount_refunded: 8000 + 10000 }), true);
  });
});

describe("kidsSignature (RT3)", () => {
  it("is order independent", () => {
    assert.equal(
      kidsSignature([{ firstName: "Zoë", age: 11 }, { firstName: "Max", age: 9 }]),
      kidsSignature([{ firstName: "Max", age: 9 }, { firstName: "Zoë", age: 11 }]),
    );
  });
  it("changes with a name, an age or a kid count", () => {
    const a = kidsSignature([{ firstName: "Max", age: 9 }]);
    assert.notEqual(a, kidsSignature([{ firstName: "Max", age: 10 }]));
    assert.notEqual(a, kidsSignature([{ firstName: "Maxx", age: 9 }]));
    assert.notEqual(a, kidsSignature([{ firstName: "Max", age: 9 }, { firstName: "Max", age: 9 }]));
  });
});

describe("view tokens (RT11)", () => {
  it("32 random bytes, base64url, hashed with sha256", () => {
    const t = newViewToken();
    assert.match(t, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(t, newViewToken());
    assert.equal(hashViewToken(t), hashViewToken(t));
    assert.notEqual(hashViewToken(t), t);
    assert.equal(hashViewToken("abc"), "ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0");
  });
  it("cookie attributes", () => {
    const c = viewTokenCookie("tok");
    for (const part of ["s1_order=tok", "Path=/season1", "Max-Age=2592000", "HttpOnly", "Secure", "SameSite=Lax"]) {
      assert.ok(c.includes(part), part);
    }
  });
});

describe("safeEqual", () => {
  it("compares exactly", () => {
    assert.equal(safeEqual("pi_1_secret_a", "pi_1_secret_a"), true);
    assert.equal(safeEqual("pi_1_secret_a", "pi_1_secret_b"), false);
    assert.equal(safeEqual("short", "longer"), false);
  });
});

describe("keyHash and cleanAttemptId", () => {
  it("keyHash is case-insensitive and does not contain the input", () => {
    withEnv({ S1_REF_SECRET: "k1", STRIPE_SECRET_KEY: "sk_test_x" }, () => {
      assert.equal(keyHash("A@B.co"), keyHash("a@b.co "));
      assert.ok(!keyHash("a@b.co").includes("@"));
    });
  });
  it("L10: keyHash is an HMAC keyed by refSecret, not a bare sha256", () => {
    const bare = createHash("sha256").update("a@b.co", "utf8").digest("base64url").slice(0, 22);
    const h1 = withEnv({ S1_REF_SECRET: "k1", STRIPE_SECRET_KEY: "sk_test_x" }, () => keyHash("a@b.co"));
    const h2 = withEnv({ S1_REF_SECRET: "k2", STRIPE_SECRET_KEY: "sk_test_x" }, () => keyHash("a@b.co"));
    assert.equal(h1.length, 22);
    assert.notEqual(h1, bare);
    assert.notEqual(h1, h2);
    assert.equal(h1, createHmac("sha256", "k1").update("a@b.co", "utf8").digest("base64url").slice(0, 22));
  });
  it("L10: keyHash throws with a live key and no S1_REF_SECRET (no webhook-secret fallback)", () => {
    withEnv({ S1_REF_SECRET: undefined, S1_STRIPE_WEBHOOK_SECRET: "whsec_x", STRIPE_SECRET_KEY: "sk_live_x" }, () => {
      assert.throws(() => keyHash("a@b.co"));
    });
  });
  it("M1: the global ceiling alert key is one per UTC clock hour", () => {
    assert.equal(globalCeilingAlertKey(new Date("2026-11-02T14:05:00Z")), "ops_alert:global_ceiling:2026-11-02T14");
    assert.equal(
      globalCeilingAlertKey(new Date("2026-11-02T14:59:59Z")),
      globalCeilingAlertKey(new Date("2026-11-02T14:00:00Z")),
    );
    assert.notEqual(
      globalCeilingAlertKey(new Date("2026-11-02T15:00:00Z")),
      globalCeilingAlertKey(new Date("2026-11-02T14:59:59Z")),
    );
  });
  it("attempt ids", () => {
    assert.equal(cleanAttemptId("6f1c2d3e-aaaa-4bbb-8ccc-123456789abc"), "6f1c2d3e-aaaa-4bbb-8ccc-123456789abc");
    for (const bad of ["", "short", "has space here", "x".repeat(65), 12345678, null, undefined, "a~b-12345"]) {
      assert.equal(cleanAttemptId(bad), null, String(bad));
    }
  });
});

describe("stepLine (ops 8)", () => {
  it("formats and strips anything that could carry PII", () => {
    assert.equal(stepLine("fulfil.claim", "abc234defg", true), "s1 step=fulfil.claim order=abc234defg ok=true");
    assert.equal(stepLine("commit", null, false, "rate_limited"), "s1 step=commit order=- ok=false err=rate_limited");
    const l = stepLine("x", "a b@c.d", false, "mom@example.com is bad");
    assert.ok(!l.includes(" b@"));
    assert.ok(!/\s(is|bad)\b/.test(l));
  });
  it("errCode prefers code, then type, then name", () => {
    assert.equal(errCode({ code: "card_declined", message: "secret" }), "card_declined");
    assert.equal(errCode({ type: "StripeCardError" }), "StripeCardError");
    assert.equal(errCode(new TypeError("x")), "TypeError");
    assert.equal(errCode("str"), "error");
  });
});

describe("assertKeyMatchesMode", () => {
  it("live needs sk_live_, test needs sk_test_, off never passes", () => {
    assert.doesNotThrow(() => assertKeyMatchesMode("live", "sk_live_x"));
    assert.doesNotThrow(() => assertKeyMatchesMode("test", "sk_test_x"));
    assert.throws(() => assertKeyMatchesMode("live", "sk_test_x"));
    assert.throws(() => assertKeyMatchesMode("test", "sk_live_x"));
    assert.throws(() => assertKeyMatchesMode("off", "sk_test_x"));
    assert.throws(() => assertKeyMatchesMode("test", ""));
  });
  it("keyIsLive", () => {
    assert.equal(keyIsLive("sk_live_x"), true);
    assert.equal(keyIsLive("sk_test_x"), false);
    assert.equal(keyIsLive(""), false);
  });
});
