import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { thenLine, ladderNote } from "../welcomeCopy";

describe("welcome THEN_LINE", () => {
  it("one kid, no friend code: $160 a month from Feb 15, about $20 a practice", () => {
    assert.equal(thenLine(1, false), "Then $160 a month from Feb 15. About $20 a practice.");
  });
  it("siblings, no friend code: the family's monthly total", () => {
    assert.equal(thenLine(2, false), "Then $288 a month for both kids from Feb 15.");
    assert.equal(thenLine(3, false), "Then $416 a month for all 3 kids from Feb 15.");
  });
  it("one kid through a friend's code: February free, then $160 on Mar 15 and Apr 15", () => {
    const s = thenLine(1, true);
    assert.equal(s, "February is free with your friend's credit. Then $160 on Mar 15 and Apr 15.");
    assert.ok(!s.includes("Feb 15"));
  });
  it("siblings through a friend's code: the credit covers $160 of the family's February", () => {
    assert.equal(
      thenLine(2, true),
      "February is free for your first kid with your friend's credit, so February is $128 in total. Then $288 a month for both kids on Mar 15 and Apr 15.",
    );
    assert.equal(
      thenLine(4, true),
      "February is free for your first kid with your friend's credit, so February is $384 in total. Then $544 a month for all 4 kids on Mar 15 and Apr 15.",
    );
  });
});

describe("welcome discount ladder (PR-8)", () => {
  it("one kid: no label; more than one kid: labelled for the first kid", () => {
    assert.equal(ladderNote(1), "");
    assert.match(ladderNote(2), /For your first kid\./);
    assert.match(ladderNote(4), /For your first kid\./);
  });
  it("the template carries the label slot inside the save band", () => {
    const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "welcome", "welcome.html"), "utf8");
    const band = /<!--save-->([\s\S]*?)<!--\/save-->/.exec(html)?.[1] ?? "";
    assert.ok(band.includes("How this discount works</h2>{{LADDER_NOTE}}"));
  });
});
