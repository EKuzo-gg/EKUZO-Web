import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "../../../middleware";
import { BETA_SRC_COOKIE, BETA_SRC_RE, cleanBetaSrc } from "../betaWizard";

/** The beta source tag (?src=karlin-email): middleware remembers it on beta pages only (M1 to M4). */
const run = (url: string, ua = "Mozilla/5.0 (iPhone)") => middleware(new NextRequest(url, { headers: { "user-agent": ua } }));
const cookie = (url: string, ua?: string) => run(url, ua).cookies.get("ekuzo_bsrc");

describe("middleware: ekuzo_bsrc on beta pages only", () => {
  it("the module and the middleware agree on the cookie name and the pattern", () => {
    assert.equal(BETA_SRC_COOKIE, "ekuzo_bsrc");
    assert.equal(BETA_SRC_RE.source, "^[a-z0-9][a-z0-9_-]{0,39}$");
  });
  it("sets the tag on the launch page, the wizard and the beta page; HttpOnly, 30 days, path /", () => {
    for (const p of ["/season1/beta/launch", "/season1/beta/start", "/season1/beta"]) {
      const c = cookie(`https://ekuzo.gg${p}?src=karlin-email`);
      assert.equal(c?.value, "karlin-email", p);
      assert.equal(c?.httpOnly, true); assert.equal(c?.maxAge, 2592000); assert.equal(c?.path, "/"); assert.equal(c?.sameSite, "lax");
    }
    assert.equal(cookie("https://ekuzo.gg/season1/beta/launch?src=Karlin-Text")?.value, "karlin-text");
  });
  it("never on any other page, so the Season 01 pages behave exactly as before", () => {
    for (const p of ["/season1", "/season1/join", "/season1/join/jersey", "/season1/betamax", "/", "/blog"]) {
      assert.equal(cookie(`https://ekuzo.gg${p}?src=karlin-email`), undefined, p);
    }
  });
  it("drops anything that is not a short tag, and bots", () => {
    for (const v of ["", "a b", "x".repeat(41), "<script>", "karlin@email", "-lead", "%0d%0aSet-Cookie:x"]) {
      assert.equal(cookie(`https://ekuzo.gg/season1/beta/launch?src=${encodeURIComponent(v)}`), undefined, v);
      assert.equal(cleanBetaSrc(v), "");
    }
    assert.equal(cookie("https://ekuzo.gg/season1/beta/launch?src=karlin-email", "Googlebot/2.1"), undefined);
    assert.equal(cookie("https://ekuzo.gg/season1/beta/launch"), undefined);
  });
  it("leaves ekuzo_lc and ekuzo_origin as they were on a beta page", () => {
    const res = run("https://ekuzo.gg/season1/beta/launch?src=karlin-email&utm_source=karlin&utm_medium=email");
    assert.ok(res.cookies.get("ekuzo_lc")); assert.ok(res.cookies.get("ekuzo_origin"));
  });
});
