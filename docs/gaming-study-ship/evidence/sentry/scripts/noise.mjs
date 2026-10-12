import { createRequire } from "node:module";
import { launchGuarded, mk, save, EV } from "./sentry-lib.mjs";
const require = createRequire("/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/package.json"); const sharp = require("sharp");
const b = await launchGuarded(); const out = [];
async function shot(base, p, vp, name) { const ctx = await mk(b, "noise", { vp, suppressPopup: true }); const page = await ctx.newPage(); await page.goto(base + p, { waitUntil: "load" }); await page.waitForTimeout(2500); await page.screenshot({ path: `${EV}/nr1/${name}.png` }); await ctx.close(); }
async function diff(a, c) { const A = await sharp(`${EV}/nr1/${a}.png`).raw().toBuffer({ resolveWithObject: true }), B = await sharp(`${EV}/nr1/${c}.png`).raw().toBuffer({ resolveWithObject: true }); let n = 0, ch = A.info.channels; for (let i = 0; i < A.data.length; i += ch) if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 30) n++; return (100 * n / (A.data.length / ch)).toFixed(3) + "%"; }
for (const [p, vp] of [["/programs/ekuzo-camps", "1440"], ["/programs/ekuzo-camps", "375"], ["/programs/ekuzo101", "1440"]]) {
  const s = p.split("/").pop(); await shot("http://localhost:3311", p, vp, `noise-A2-${s}-${vp}`); await shot("http://localhost:3312", p, vp, `noise-B2-${s}-${vp}`);
  out.push(`${p} ${vp}: A-vs-A(second run) ${await diff(`A-programs_${s}-${vp}-top`, `noise-A2-${s}-${vp}`)} ; B-vs-B ${await diff(`B-programs_${s}-${vp}-top`, `noise-B2-${s}-${vp}`)} ; A2-vs-B2 ${await diff(`noise-A2-${s}-${vp}`, `noise-B2-${s}-${vp}`)}`);
}
console.log(out.join("\n")); save("nr1/noise-check.txt", out.join("\n") + "\n"); await b.close();
