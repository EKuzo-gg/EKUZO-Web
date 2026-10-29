import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCommit, foldName, ageEdge, type CommitInput } from "../validate";

const base = () => ({
  email: "Parent@Example.com ",
  parentFirstName: "Jamie",
  phone: "",
  kids: [{ firstName: "Ana", age: 12 }],
  consent: true,
  company: "",
});

function ok(body: unknown): CommitInput {
  const r = validateCommit(body);
  assert.ok(r.ok, JSON.stringify(r));
  return r.value;
}
function bad(body: unknown, field?: string, error?: string) {
  const r = validateCommit(body);
  assert.equal(r.ok, false, "expected failure");
  if (!r.ok) {
    if (field) assert.equal(r.field, field);
    if (error) assert.equal(r.error, error);
  }
}

describe("validateCommit: happy path", () => {
  it("normalizes email and returns clean values", () => {
    const v = ok(base());
    assert.equal(v.email, "parent@example.com");
    assert.equal(v.parentFirstName, "Jamie");
    assert.equal(v.phone, null);
    assert.equal(v.src, null);
    assert.deepEqual(v.kids, [{ firstName: "Ana", firstNameKey: "ana", age: 12, ageEdge: false }]);
  });
  it("accepts up to 4 kids, rejects 0 and 5", () => {
    const k = (n: number) => Array.from({ length: n }, () => ({ firstName: "Kid", age: 10 }));
    ok({ ...base(), kids: k(4) });
    bad({ ...base(), kids: k(5) }, "kids", "too_many_kids");
    bad({ ...base(), kids: [] }, "kids");
    bad({ ...base(), kids: undefined }, "kids");
  });
  it("company absent is fine", () => {
    const b: Partial<ReturnType<typeof base>> = base();
    delete b.company;
    ok(b);
  });
});

describe("names", () => {
  it("accents, apostrophes, hyphens, spaces pass", () => {
    for (const n of ["José", "Zoë", "O'Brien", "D\u2019Angelo", "Anne-Marie", "Mary Jane", "Nguyễn", "Łukasz"]) {
      ok({ ...base(), parentFirstName: n });
      ok({ ...base(), kids: [{ firstName: n, age: 10 }] });
    }
  });
  it("digits, markup, symbols, empty, and 21 chars fail", () => {
    for (const n of ["Ana2", "<script>", "<script>alert(1)</script>", "A".repeat(21), "", "   ", "-Ana", "Ana!", "💥"]) {
      bad({ ...base(), parentFirstName: n }, "parentFirstName");
      bad({ ...base(), kids: [{ firstName: n, age: 10 }] }, "kids.0.firstName");
    }
    bad({ ...base(), parentFirstName: 42 }, "parentFirstName");
  });
  it("20 chars passes and names are trimmed", () => {
    ok({ ...base(), parentFirstName: "A".repeat(20) });
    assert.equal(ok({ ...base(), parentFirstName: "  Jamie  " }).parentFirstName, "Jamie");
  });
});

describe("email", () => {
  it("rejects malformed and over-long", () => {
    for (const e of ["", "nope", "a@b", "a b@c.com", "@c.com", "a@.com", "a@@c.com", "a..b@c..com", "x".repeat(250) + "@a.co"]) {
      bad({ ...base(), email: e }, "email");
    }
    bad({ ...base(), email: undefined }, "email");
  });
});

describe("phone", () => {
  it("optional; digits and +()- space only, max 20", () => {
    assert.equal(ok({ ...base(), phone: "+1 (512) 555-0123" }).phone, "+1 (512) 555-0123");
    ok({ ...base(), phone: undefined });
    ok({ ...base(), phone: null });
    bad({ ...base(), phone: "512.555.0123" }, "phone");
    bad({ ...base(), phone: "call me" }, "phone");
    bad({ ...base(), phone: "1".repeat(21) }, "phone");
    bad({ ...base(), phone: 5125550123 }, "phone");
  });
});

describe("ages", () => {
  it("8, 18, 19, 'outside' fail with age_outside", () => {
    for (const age of [8, 18, 19, 0, -1, 100, "outside"]) {
      bad({ ...base(), kids: [{ firstName: "Ana", age }] }, "kids.0.age", "age_outside");
    }
  });
  it("garbage ages fail as invalid", () => {
    for (const age of [10.5, "ten", null, undefined, NaN]) {
      bad({ ...base(), kids: [{ firstName: "Ana", age }] }, "kids.0.age", "invalid");
    }
  });
  it("9 passes with ageEdge true; 10..17 pass and are not edges", () => {
    const v = ok({ ...base(), kids: [{ firstName: "Ana", age: 9 }] });
    assert.equal(v.kids[0].age, 9);
    assert.equal(v.kids[0].ageEdge, true);
    for (let age = 10; age <= 17; age++) {
      assert.equal(ok({ ...base(), kids: [{ firstName: "Ana", age }] }).kids[0].ageEdge, false);
    }
    assert.equal(ageEdge(9), true);
    assert.equal(ageEdge(17), false);
    assert.equal(ageEdge(18), false);
    assert.equal(ageEdge(8), false);
    assert.equal(ageEdge(19), false);
    assert.equal(ageEdge(12), false);
  });
  it("numeric strings are accepted", () => {
    assert.equal(ok({ ...base(), kids: [{ firstName: "Ana", age: "14" }] }).kids[0].age, 14);
  });
  it("reports the index of the offending second kid", () => {
    bad({ ...base(), kids: [{ firstName: "Ana", age: 12 }, { firstName: "Bo", age: "outside" }] }, "kids.1.age", "age_outside");
  });
});

describe("consent, honeypot, src", () => {
  it("consent must be exactly true", () => {
    for (const c of [false, undefined, "true", 1, null]) bad({ ...base(), consent: c }, "consent");
  });
  it("filled honeypot fails", () => {
    bad({ ...base(), company: "Acme" }, "company");
    bad({ ...base(), company: " " }, "company");
  });
  it("src from the fixed set, else rejected", () => {
    for (const s of ["karlin", "email", "friend", "ad", "direct"]) assert.equal(ok({ ...base(), src: s }).src, s);
    ok({ ...base(), src: undefined });
    assert.equal(ok({ ...base(), src: "" }).src, null);
    bad({ ...base(), src: "tiktok" }, "src");
    bad({ ...base(), src: "Karlin" }, "src");
  });
  it("non-object bodies fail", () => {
    for (const b of [null, undefined, "x", 5, []]) bad(b, "body");
  });
});

describe("foldName", () => {
  it("lowercases and strips diacritics", () => {
    assert.equal(foldName("José"), "jose");
    assert.equal(foldName("ZOË"), "zoe");
    assert.equal(foldName("Nguyễn"), "nguyen");
    assert.equal(foldName("O'Brien"), "o'brien");
    assert.equal(foldName("Ana"), foldName("ANA"));
  });
});
