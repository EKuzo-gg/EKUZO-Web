import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * /season1/join is a clone of /season1/join/b (decision D10): one template,
 * two route files. B's route file is protected, so /join keeps its own copy of
 * the handler. This test fails when the two drift: different bodies for the
 * same request, or route files that differ beyond the header comment.
 */
const root = path.join(process.cwd(), "app", "season1", "join");
const code = (file: string) =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("//"))
    .join("\n");

const requests: [string, Request][] = [
  ["live host", new Request("https://ekuzo.gg/season1/join", { headers: { host: "ekuzo.gg" } })],
  ["live host, src=email", new Request("https://ekuzo.gg/season1/join?src=email", { headers: { host: "ekuzo.gg" } })],
  ["non-live host", new Request("http://localhost:3100/season1/join", { headers: { host: "localhost:3100" } })],
  ["dropped src", new Request("https://ekuzo.gg/season1/join?src=nope", { headers: { host: "ekuzo.gg" } })],
];

describe("/season1/join matches /season1/join/b", () => {
  it("route files are identical apart from comments", () => {
    assert.equal(code(path.join(root, "route.ts")), code(path.join(root, "b", "route.ts")));
  });
  it("both read the same template path", () => {
    const re = /path\.join\(process\.cwd\(\), "app", "season1", "join", "b", "join-b\.html"\)/;
    assert.match(fs.readFileSync(path.join(root, "route.ts"), "utf8"), re);
    assert.match(fs.readFileSync(path.join(root, "b", "route.ts"), "utf8"), re);
  });
  it("the old A template is gone", () => {
    assert.equal(fs.existsSync(path.join(root, "join.html")), false);
  });
  for (const [name, r] of requests) {
    it(`same status, headers and body: ${name}`, async () => {
      const a = await import("../../../app/season1/join/route");
      const b = await import("../../../app/season1/join/b/route");
      const [ra, rb] = [a.GET(r), b.GET(r)];
      assert.equal(ra.status, rb.status);
      assert.deepEqual([...ra.headers].sort(), [...rb.headers].sort());
      assert.equal(await ra.text(), await rb.text());
    });
  }
});
