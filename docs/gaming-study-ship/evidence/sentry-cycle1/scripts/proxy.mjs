// Default-deny forward proxy. Nothing is ever forwarded upstream.
// HTTPS CONNECT -> 403 (cannot answer locally without MITM). Plain HTTP absolute-URI -> 204 locally.
// Loopback is bypassed by Chrome and never reaches this proxy; if it does, it is logged "local-passthrough-refused" (also not forwarded).
import http from "node:http";
import fs from "node:fs";
export const PROXY_PORT = Number(process.env.QA_PROXY_PORT || 39001);
export const LOG = process.env.QA_PROXY_LOG || new URL("./proxy-log.jsonl", import.meta.url).pathname;
const log = (o) => fs.appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), ...o }) + "\n");
export function startProxy() {
  const srv = http.createServer((req, res) => {
    if (req.url.startsWith("/__mark")) {
      const u = new URL(req.url, "http://x");
      log({ kind: "marker", name: u.searchParams.get("name"), ev: u.searchParams.get("ev") });
      res.writeHead(200); return res.end("ok");
    }
    let host = "?", path = req.url;
    try { const u = new URL(req.url); host = u.host; path = u.pathname; } catch {}
    log({ kind: "http", method: req.method, host, path, decision: "denied-answered-204" });
    res.writeHead(204, { "x-guard": "blocked" }); res.end();
  });
  srv.on("connect", (req, sock) => {
    log({ kind: "connect", method: "CONNECT", host: req.url, path: "", decision: "denied-403" });
    sock.end("HTTP/1.1 403 Forbidden\r\nx-guard: blocked\r\nConnection: close\r\n\r\n");
  });
  srv.listen(PROXY_PORT, "127.0.0.1");
  return srv;
}
if (import.meta.url === `file://${process.argv[1]}`) { fs.writeFileSync(LOG, ""); startProxy(); console.log("proxy up", PROXY_PORT, LOG); }
