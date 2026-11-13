// Local TLS front for the built server: https://ekuzo.gg:3101 -> http://127.0.0.1:3100. Test harness only.
import https from "node:https"; import http from "node:http"; import fs from "node:fs";
https.createServer({ key: fs.readFileSync("/tmp/sentry-tls/k.pem"), cert: fs.readFileSync("/tmp/sentry-tls/c.pem") }, (req, res) => {
  const up = http.request({ host: "127.0.0.1", port: 3100, method: req.method, path: req.url, headers: { ...req.headers, "x-forwarded-proto": "https" } }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  up.on("error", () => { res.writeHead(502); res.end(); }); req.pipe(up);
}).listen(3101, "127.0.0.1");
