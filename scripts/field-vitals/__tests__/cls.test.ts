// Fixture test for the harness CLS maths (H4a). Run by `npm test` through
// `node scripts/run-tests.mjs scripts/field-vitals`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sessionWindows, clsSummary } from "../lib/cls.mjs";

// Fixed entry list. Expected values worked by hand:
//  - 100 and 600 share a window (gap 500): 0.10
//  - 1700 opens a new window (gap 1100 > 1 s): 0.20
//  - 2500 is hadRecentInput (0.10): excluded by default; with input it joins 1700 (gap 800)
//  - 3300: without input the gap to 1700 is 1600, so a new window (0.02); with input it
//    joins 1700/2500 (gap 800) for 0.32
//  - 10000 to 16300 every 900 ms, 0.01 each: the window from 10000 closes at the 5 s cap,
//    so 10000..14500 is one window (6 entries, 0.06) and 15400, 16300 another (0.02)
const E = (startTime: number, value: number, hadRecentInput = false) => ({ startTime, value, hadRecentInput });
const FIXTURE = [
  E(100, 0.05),
  E(600, 0.05),
  E(1700, 0.2),
  E(2500, 0.1, true),
  E(3300, 0.02),
  ...[10000, 10900, 11800, 12700, 13600, 14500, 15400, 16300].map((t) => E(t, 0.01)),
];

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("session windows without input entries", () => {
  const w = sessionWindows(FIXTURE);
  assert.deepEqual(w.map((x) => x.count), [2, 1, 1, 6, 2]);
  [0.1, 0.2, 0.02, 0.06, 0.02].forEach((v, i) => close(w[i].value, v));
});

test("session windows with input entries", () => {
  const w = sessionWindows(FIXTURE, { includeInput: true });
  assert.deepEqual(w.map((x) => x.count), [2, 3, 6, 2]);
  [0.1, 0.32, 0.06, 0.02].forEach((v, i) => close(w[i].value, v));
});

test("summary: windowed and total, with and without input", () => {
  const s = clsSummary(FIXTURE);
  close(s.windowed, 0.2);
  close(s.windowedWithInput, 0.32);
  close(s.total, 0.4);
  close(s.totalWithInput, 0.5);
  assert.equal(s.worstWindow?.start, 1700);
});

test("unsorted input and empty input", () => {
  const s = clsSummary([...FIXTURE].reverse());
  close(s.windowed, 0.2);
  const z = clsSummary([]);
  assert.equal(z.windowed, 0);
  assert.equal(z.total, 0);
  assert.equal(z.worstWindow, null);
});

test("the pre-fix shape: one 0.79 shift is a 0.79 window", () => {
  const s = clsSummary([E(7330, 0.7867), E(7390, 0.0001)]);
  close(s.windowed, 0.7868);
});
