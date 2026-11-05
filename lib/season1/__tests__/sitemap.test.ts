import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sitemap from "../../../app/sitemap";

describe("sitemap and /season1/join", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("holds /season1/join with a real lastModified, not the clock", () => {
    const e = entries.find((x) => x.url === "https://ekuzo.gg/season1/join");
    assert.ok(e, "missing /season1/join");
    const t = new Date(e!.lastModified ?? 0).getTime();
    assert.ok(Number.isFinite(t) && t > 0);
    assert.ok(Date.now() - t > 0 && new Date(t).toISOString().endsWith("T00:00:00.000Z"), "a fixed date, not new Date()");
  });
  it("holds none of the noindex Season 01 URLs", () => {
    for (const p of ["/season1", "/season1/join/b", "/season1/join/jersey", "/season1/join/signup"]) {
      assert.ok(!urls.includes(`https://ekuzo.gg${p}`), p);
    }
    assert.ok(!urls.some((u) => /\/season1\/(join\/(b|jersey|signup)|early-access|landing)/.test(u)));
  });
  it("robots.txt has no Disallow for /season1 (a disallow would hide the canonical and noindex signals)", () => {
    const robots = fs.readFileSync(path.join(process.cwd(), "public", "robots.txt"), "utf8");
    assert.ok(!/^\s*Disallow:\s*\/season1/im.test(robots));
  });
  it("llms.txt Season 01 line agrees with offer.ts", async () => {
    const { OFFER } = await import("../offer");
    const line = fs.readFileSync(path.join(process.cwd(), "public", "llms.txt"), "utf8").split("\n").find((l) => l.includes("/season1/join"))!;
    assert.ok(line.includes(`ages ${OFFER.ageCopyMin} to ${OFFER.ageCopyMax}`));
    assert.ok(line.includes("twice a week for 90 minutes"));
    assert.ok(line.includes("mid January to May 2027") && OFFER.seasonLabel.startsWith("mid January") && OFFER.seasonLabel.endsWith("2027"));
  });
});
