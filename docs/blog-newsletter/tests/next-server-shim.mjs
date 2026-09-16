// Custom ESM resolution hook (node:module register()) that rewrites the
// bare specifier "next/server" to "next/server.js". Needed because next's
// package.json has no "exports" map, so Node's ESM resolver (unlike its
// CJS resolver) will not add the missing .js extension on its own.
// Verified in 02-contract.md section 7. Loaded from routes.test.mjs via
// `node --import` (see that file's header for the exact invocation).
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }
  return nextResolve(specifier, context);
}
