import { launchGuarded, mk, BASE, POST, save } from "./sentry-lib.mjs";
const b = await launchGuarded(); const ctx = await mk(b, "nr5b", { vp: "375", suppressPopup: true }); const p = await ctx.newPage();
await p.goto(BASE + POST); await p.waitForTimeout(1000); await p.getByRole("button", { name: "Toggle menu" }).click(); await p.waitForTimeout(400); await p.getByRole("button", { name: /Talk to Humans/ }).click(); await p.waitForSelector("#contact-heard-about");
const r = await p.evaluate(() => { const l = document.querySelector('label[for="contact-heard-about"]'); return { label: l && l.textContent, visible: l && !!l.offsetHeight, selVisible: !!document.querySelector("#contact-heard-about").offsetHeight }; });
console.log(JSON.stringify(r)); save("json/nr5-label.json", r); await b.close();
