import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dammCheckDigit,
  dammValid,
  mintNumeric,
  isValidNumeric,
  normalize,
  display,
} from "../codes";

describe("Damm check digit", () => {
  it("known vector: 572 has check digit 4", () => {
    assert.equal(dammCheckDigit("572"), 4);
    assert.ok(dammValid("5724"));
    assert.ok(!dammValid("5723"));
  });

  it("known vector: 4827193 has check digit 0", () => {
    assert.equal(dammCheckDigit("4827193"), 0);
    assert.ok(isValidNumeric("48271930"));
  });
});

describe("mintNumeric", () => {
  it("makes 8-digit valid codes, first digit 1 to 9 (crypto default)", () => {
    for (let i = 0; i < 500; i++) {
      const c = mintNumeric();
      assert.match(c, /^[1-9]\d{7}$/);
      assert.ok(isValidNumeric(c), c);
    }
  });

  it("accepts an injected rand and is deterministic", () => {
    const seq = (vals: number[]) => {
      let i = 0;
      return () => vals[i++ % vals.length];
    };
    const a = mintNumeric(seq([0, 0.5, 0.99, 0.1, 0.2, 0.3, 0.4]));
    const b = mintNumeric(seq([0, 0.5, 0.99, 0.1, 0.2, 0.3, 0.4]));
    assert.equal(a, b);
    assert.ok(isValidNumeric(a));
    assert.equal(a[0], "1"); // rand 0 -> lowest first digit
    const lo = mintNumeric(() => 0);
    const hi = mintNumeric(() => 0.999999);
    assert.ok(isValidNumeric(lo) && isValidNumeric(hi));
    assert.equal(hi[0], "9");
  });

  it("every single-digit substitution of a minted code fails", () => {
    for (let n = 0; n < 50; n++) {
      const c = mintNumeric();
      for (let pos = 0; pos < c.length; pos++) {
        for (let d = 0; d <= 9; d++) {
          if (String(d) === c[pos]) continue;
          const bad = c.slice(0, pos) + d + c.slice(pos + 1);
          assert.ok(!dammValid(bad), `${c} -> ${bad} should fail`);
          assert.equal(normalize(bad), null);
        }
      }
    }
  });

  it("every adjacent transposition of differing digits fails", () => {
    for (let n = 0; n < 200; n++) {
      const c = mintNumeric();
      for (let pos = 0; pos < c.length - 1; pos++) {
        if (c[pos] === c[pos + 1]) continue;
        const bad = c.slice(0, pos) + c[pos + 1] + c[pos] + c.slice(pos + 2);
        assert.ok(!dammValid(bad), `${c} -> ${bad} should fail`);
        assert.equal(normalize(bad), null);
      }
    }
  });
});

describe("isValidNumeric", () => {
  it("rejects wrong length, leading zero, and non-digits", () => {
    assert.ok(!isValidNumeric("5724"));
    assert.ok(!isValidNumeric("0123456789"));
    assert.ok(!isValidNumeric("abcdefgh"));
    assert.ok(!isValidNumeric(""));
    assert.ok(!isValidNumeric(undefined as unknown as string));
  });
});

describe("display", () => {
  it("formats numeric codes as 4+4", () => {
    assert.equal(display("48271937"), "4827 1937");
    assert.equal(display("48271930"), "4827 1930");
  });
  it("leaves vanity codes as is", () => {
    assert.equal(display("karlin"), "karlin");
  });
});

describe("normalize", () => {
  it("strips spaces and hyphens from numeric codes", () => {
    assert.equal(normalize("4827 1930"), "48271930");
    assert.equal(normalize("4827-1930"), "48271930");
    assert.equal(normalize("  4827 - 1930 "), "48271930");
  });
  it("rejects numeric codes with a bad check digit", () => {
    assert.equal(normalize("4827 1931"), null);
  });
  it("lowercases valid vanity codes", () => {
    assert.equal(normalize("Karlin"), "karlin");
    assert.equal(normalize("EKUZO"), "ekuzo");
  });
  it("rejects invalid vanity codes", () => {
    for (const bad of ["ab", "a".repeat(21), "karlin99", "kar!in", "émile", "", "   ", "--", "12ab34"]) {
      assert.equal(normalize(bad), null, JSON.stringify(bad));
    }
    assert.equal(normalize(null), null);
    assert.equal(normalize(12345678), null);
  });
  it("accepts vanity at the 3 and 20 char limits", () => {
    assert.equal(normalize("abc"), "abc");
    assert.equal(normalize("a".repeat(20)), "a".repeat(20));
  });
});
