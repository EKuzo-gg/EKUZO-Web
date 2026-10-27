/**
 * Test runner. Collects *.test.ts under lib/**\/__tests__ (explicit, no
 * shell globbing) and runs them with node --test and the TS resolver hook.
 *   node scripts/run-tests.mjs            all lib tests
 *   node scripts/run-tests.mjs lib/season1/__tests__   only that directory
 */
import { readdirSync, statSync } from "node:fs";
import { join, resolve, relative, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const scope = resolve(ROOT, process.argv[2] ?? "lib");

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".test.ts") && dir.split(sep).pop() === "__tests__") out.push(p);
  }
  return out;
}

const files = walk(scope, []).map((f) => relative(ROOT, f)).sort();
if (files.length === 0) {
  console.error("no test files found under", relative(ROOT, scope));
  process.exit(1);
}
const res = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--import", "./scripts/test-resolve.mjs", "--test", ...files],
  { cwd: ROOT, stdio: "inherit" },
);
process.exit(res.status ?? 1);
