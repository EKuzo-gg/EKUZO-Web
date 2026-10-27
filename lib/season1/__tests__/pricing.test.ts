import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { quote } from "../pricing";

const kid = (n: number) => ({ firstName: `Kid${String.fromCharCode(65 + n)}`, age: 12 });
const kids = (n: number) => Array.from({ length: n }, (_, i) => kid(i));

describe("quote", () => {
  it("first-time family totals for 1..4 kids", () => {
    assert.equal(quote({ kids: kids(1), priorPaidKids: 0 }).totalCents, 10000);
    assert.equal(quote({ kids: kids(2), priorPaidKids: 0 }).totalCents, 18000);
    assert.equal(quote({ kids: kids(3), priorPaidKids: 0 }).totalCents, 26000);
    assert.equal(quote({ kids: kids(4), priorPaidKids: 0 }).totalCents, 34000);
  });

  it("lines: first kid $100, siblings $80, zero-based kidIndex", () => {
    const q = quote({ kids: kids(3), priorPaidKids: 0 });
    assert.deepEqual(q.lines, [
      { kidIndex: 0, role: "first", unitCents: 10000 },
      { kidIndex: 1, role: "sibling", unitCents: 8000 },
      { kidIndex: 2, role: "sibling", unitCents: 8000 },
    ]);
  });

  it("priorPaidKids > 0 makes every kid a $80 sibling", () => {
    for (const prior of [1, 2, 5]) {
      for (let n = 1; n <= 4; n++) {
        const q = quote({ kids: kids(n), priorPaidKids: prior });
        assert.equal(q.totalCents, 8000 * n);
        assert.ok(q.lines.every((l) => l.role === "sibling" && l.unitCents === 8000));
      }
    }
  });

  it("totals equal the sum of the lines", () => {
    const q = quote({ kids: kids(4), priorPaidKids: 0 });
    assert.equal(q.totalCents, q.lines.reduce((s, l) => s + l.unitCents, 0));
  });

  it("ignores any client-supplied amount", () => {
    const input = { kids: kids(1), priorPaidKids: 0, amount: 1, totalCents: 1 } as any;
    assert.equal(quote(input).totalCents, 10000);
  });

  it("throws on 0 kids, more than 4 kids, and bad priorPaidKids", () => {
    assert.throws(() => quote({ kids: [], priorPaidKids: 0 }));
    assert.throws(() => quote({ kids: kids(5), priorPaidKids: 0 }));
    assert.throws(() => quote({ kids: kids(1), priorPaidKids: -1 }));
    assert.throws(() => quote({ kids: kids(1), priorPaidKids: 1.5 }));
    assert.throws(() => quote({ kids: undefined as any, priorPaidKids: 0 }));
  });
});
