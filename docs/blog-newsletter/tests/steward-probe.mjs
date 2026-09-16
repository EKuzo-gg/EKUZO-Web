import { chromium } from "playwright";
const t0 = Date.now();
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-proxy-server"],
});
console.log("launched", Date.now() - t0);
const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
const p = await ctx.newPage();
try {
  await p.goto(
    "http://localhost:3001/blog/gaming-study-13-7-years-younger-what-it-means-for-kids",
    { waitUntil: "commit", timeout: 60000 }
  );
  console.log("commit", Date.now() - t0);
  await p.waitForFunction(() => document.querySelectorAll("p").length > 3, null, {
    timeout: 60000,
  });
  console.log("content", Date.now() - t0, (await p.title()).slice(0, 40));
} catch (e) {
  console.log("ERR", e.message.split("\n")[0], Date.now() - t0);
}
await b.close();
console.log("closed", Date.now() - t0);
