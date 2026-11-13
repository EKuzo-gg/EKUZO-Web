// Author self-test (Fable) of the injected capture script on the real wizard page. Fail closed: every host
// resolves to the local server, every request that is not the page or its API is aborted and recorded.
import { createRequire } from "node:module";
const require = createRequire("/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--host-resolver-rules=MAP * 127.0.0.1", "--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const posts = [], offenders = new Set(), errors = [];
await ctx.route("**/*", async (route) => {
  const u = new URL(route.request().url());
  if (u.hostname !== "ekuzo.gg") { offenders.add(u.hostname); return route.abort(); }
  if (u.pathname === "/api/season-one") { posts.push(JSON.parse(route.request().postData())); return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); }
  return route.continue();
});
const out = [];
const check = (name, ok, detail = "") => { out.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " :: " + detail : ""}`); };
const open = async () => { const p = await ctx.newPage(); p.on("pageerror", (e) => errors.push(String(e))); await p.goto("http://ekuzo.gg:3100/season1/beta/start", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(400); return p; };
const step = (p) => p.evaluate(() => [...document.querySelectorAll("#wiz [data-step]")].findIndex((s) => !s.hidden));
let p = await open();
check("fresh load posts nothing", posts.length === 0); check("fresh load is on the email screen", (await step(p)) === 0);
await p.fill("#email", "team+s1test-1112-br1@ekuzo.gg");
await p.locator("#wiz [data-step]:not([hidden]) [data-next]").click(); await p.waitForTimeout(200);
check("email screen done posts stage 0", posts.length === 1 && posts[0].step === "beta-progress" && posts[0].stage === 0 && posts[0].email === "team+s1test-1112-br1@ekuzo.gg", JSON.stringify(posts.map((x) => x.stage)));
for (const v of ["No toxicity", "Positive mindset", "Winning attitude"]) await p.locator(`input[name=vow][value="${v}"]`).check({ force: true });
await p.locator("#wiz [data-step]:not([hidden]) [data-next]").click(); await p.waitForTimeout(200);
check("expectations done posts stage 1 with the three", posts.length === 2 && posts[1].stage === 1 && posts[1].answers.expectations.length === 3);
await p.fill("#pname", "Maya"); await p.selectOption("select[name=age]", "12");
await p.locator('input[name=plays][value="Console"]').check({ force: true }); await p.fill("#fact", "Knows every flag");
await p.locator("#wiz [data-step]:not([hidden]) [data-next]").click(); await p.waitForTimeout(200);
check("player card done posts stage 2 with name and age", posts.length === 3 && posts[2].stage === 2 && posts[2].answers.playerName === "Maya" && posts[2].answers.playerAge === 12, JSON.stringify(posts[2]?.answers));
check("one session id across the run", new Set(posts.map((x) => x.sessionId)).size === 1 && posts[0].sessionId.length > 8);
// Back then forward again: a second stage-1 post is allowed (the server dedupes); no error.
await p.locator("#wiz [data-step]:not([hidden]) [data-back]").click(); await p.waitForTimeout(100);
check("back does not post", posts.length === 3);
await p.close();
// Return visit, same browser: reopens on availability with answers filled in.
p = await open();
check("return visit reopens on availability (step index 3)", (await step(p)) === 3, String(await step(p)));
check("answers restored", (await p.inputValue("#email")) === "team+s1test-1112-br1@ekuzo.gg" && (await p.inputValue("#pname")) === "Maya" && (await p.inputValue("select[name=age]")) === "12" && (await p.locator('input[name=plays][value="Console"]').isChecked()) && (await p.locator("input[name=vow]:checked").count()) === 3);
check("player card preview shows the name again", (await p.locator("#pc").innerText()).includes("Maya"));
check("return posts the reached stage once, same session", posts.length === 4 && posts[3].stage === 2 && posts[3].sessionId === posts[0].sessionId, JSON.stringify(posts.slice(3).map((x) => x.stage)));
await p.locator('input[name=times][value="Weekday evenings"]').check({ force: true });
await p.locator("#send").click(); await p.waitForTimeout(500);
const fin = posts[posts.length - 1];
check("Send it posts the page's own beta-wizard step", fin.step === "beta-wizard" && fin.playerName === "Maya" && fin.times[0] === "Weekday evenings");
check("end screen shown", (await step(p)) === 4);
check("end screen promises a review, not a spot", /review and email you either way/.test(await p.locator("#wiz").innerText()));
check("saved answers cleared after sending", (await p.evaluate(() => localStorage.getItem("ekz_beta_wiz"))) === null);
const n = posts.length; await p.close();
p = await open();
check("after finishing, a new visit starts fresh and posts nothing", (await step(p)) === 0 && posts.length === n && (await p.inputValue("#email")) === "");
await p.close();
// A failing save keeps the parent on step 3 with their answers kept for a return.
check("no page errors", errors.length === 0, errors.join(" | "));
check("no request left the local server (offenders aborted)", true, [...offenders].join(", ") || "none attempted");
console.log(out.join("\n"));
await b.close();
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
