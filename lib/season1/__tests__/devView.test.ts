import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { devViewTarget } from "../devView";

describe("dev phone preview", () => {
  it("keeps same-site paths", () => {
    assert.equal(devViewTarget("/season1/join/signup?x=1"), "/season1/join/signup?x=1");
    assert.equal(devViewTarget("/crew/482913"), "/crew/482913");
  });
  it("rejects other sites, loops and empty values", () => {
    for (const u of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/season1/dev-view?u=/x"])
      assert.equal(devViewTarget(u), "/season1/join");
  });
  it("is loaded by every Season 01 funnel page", () => {
    for (const p of [["season1", "join", "join.html"], ["season1", "join", "signup", "signup.html"], ["season1", "join", "welcome", "welcome.html"], ["crew", "[code]", "crew.html"]])
      assert.ok(fs.readFileSync(path.join(process.cwd(), "app", ...p), "utf8").includes('<script src="/js/s1-devview.js" defer></script>'), p.join("/"));
  });
});

import { pageSecurityHeaders, SECURITY_HEADERS } from "../httpGuard";
describe("L7 page framing", () => {
  it("test mode allows same-origin framing for the phone preview", () => {
    assert.equal(pageSecurityHeaders("test")["x-frame-options"], "SAMEORIGIN");
    assert.equal(pageSecurityHeaders("test")["x-content-type-options"], "nosniff");
  });
  it("live and off keep DENY, and the shared constant is untouched", () => {
    assert.equal(pageSecurityHeaders("live")["x-frame-options"], "DENY");
    assert.equal(pageSecurityHeaders("off")["x-frame-options"], "DENY");
    assert.equal(SECURITY_HEADERS["x-frame-options"], "DENY");
  });
});

describe("/season1/dev-view route", () => {
  const KEYS = ["S1_COMMIT_MODE", "STRIPE_SECRET_KEY", "DATABASE_URL"] as const;
  const get = () => new Request("http://localhost:3103/season1/dev-view?u=/season1/join", { headers: { host: "localhost:3103" } });
  async function withEnv(env: Partial<Record<(typeof KEYS)[number], string>>, fn: () => Promise<void>) {
    const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    try {
      for (const k of KEYS) {
        if (env[k] === undefined) delete process.env[k];
        else process.env[k] = env[k];
      }
      await fn();
    } finally {
      for (const k of KEYS) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  }
  const testDb = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";

  it("returns 404 when the mode is off or live", async () => {
    const { GET } = await import("../../../app/season1/dev-view/route");
    // Off: explicit, and by default with no Stripe key.
    await withEnv({ S1_COMMIT_MODE: "off", STRIPE_SECRET_KEY: "sk_test_unit", DATABASE_URL: testDb }, async () => {
      assert.equal(GET(get()).status, 404);
    });
    await withEnv({}, async () => {
      assert.equal(GET(get()).status, 404);
    });
    // Live requested: never the phone preview (and live fails closed to off on this host).
    await withEnv({ S1_COMMIT_MODE: "live", STRIPE_SECRET_KEY: "sk_live_unit", DATABASE_URL: "postgresql://u:p@ep-prod.us-east-2.aws.neon.tech/neondb" }, async () => {
      assert.equal(GET(get()).status, 404);
    });
  });
  it("serves the preview in test mode (control)", async () => {
    const { GET } = await import("../../../app/season1/dev-view/route");
    await withEnv({ S1_COMMIT_MODE: "test", STRIPE_SECRET_KEY: "sk_test_unit", DATABASE_URL: testDb }, async () => {
      const r = GET(get());
      assert.equal(r.status, 200);
      assert.match(await r.text(), /Phone preview/);
    });
  });
});
