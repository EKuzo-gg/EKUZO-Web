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
