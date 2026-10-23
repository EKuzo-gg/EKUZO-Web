// Sentry stub: replaces globalThis.fetch for Klaviyo and Meta hosts. Appends one JSON line per call.
import { appendFileSync } from "node:fs";
const LOG = process.env.SENTRY_STUB_LOG;
const real = globalThis.fetch;
globalThis.__sentryStub = true;
globalThis.fetch = async function (input, init) {
  let url = "", method = "GET", body = null;
  try {
    url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    method = (init && init.method) || (typeof input === "object" && input.method) || "GET";
    body = init && init.body !== undefined ? init.body : null;
    const host = new URL(url).hostname;
    if (host === "a.klaviyo.com" || host === "graph.facebook.com") {
      let parsed = body;
      try { parsed = JSON.parse(body); } catch {}
      appendFileSync(LOG, JSON.stringify({ ts: Date.now(), pid: process.pid, url, method, body: parsed }) + "\n");
      return new Response(JSON.stringify({ stub: true }), { status: 202, headers: { "content-type": "application/json" } });
    }
  } catch (e) {
    try { appendFileSync(LOG, JSON.stringify({ ts: Date.now(), stubError: String(e), url }) + "\n"); } catch {}
  }
  return real.apply(this, arguments);
};
