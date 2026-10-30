/**
 * Node module-resolution hook for `node --test` over TypeScript sources.
 * Usage: node --import ./scripts/test-resolve.mjs --test <files>
 *
 *  - "@/foo" maps to <repo root>/foo (tsconfig paths alias)
 *  - extensionless or ".js" relative/alias imports resolve to ".ts" / "/index.ts"
 *  - "next/server" maps to "next/server.js" (Next ships it as a CJS file with no
 *    exports map, so plain node ESM needs the extension; middleware and route tests)
 *
 * Node 22 strips TypeScript types natively; this only fixes specifiers.
 */
import { register } from "node:module";
import { isMainThread } from "node:worker_threads";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");

if (isMainThread) register(import.meta.url);

function tryFile(base) {
  const candidates = [base, base + ".ts", base + ".tsx", resolvePath(base, "index.ts")];
  if (base.endsWith(".js")) candidates.push(base.slice(0, -3) + ".ts");
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return pathToFileURL(c).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let target = null;
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  if (specifier.startsWith("@/")) {
    target = tryFile(resolvePath(ROOT, specifier.slice(2)));
  } else if (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith("file:")) {
    target = tryFile(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
  }
  if (target) return nextResolve(target, context);
  return nextResolve(specifier, context);
}
