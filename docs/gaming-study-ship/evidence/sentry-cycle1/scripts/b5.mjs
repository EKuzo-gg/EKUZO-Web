import { launchGuarded, mk, BASE, POST, S1, save } from "./sentry-lib.mjs";
const R = []; const rec = (id, sev, note) => { R.push({ id, sev, note }); console.log(`[${sev}] ${id}: ${String(note).slice(0, 1200)}`); };
const browser = await launchGuarded();
const act = (page) => page.evaluate(() => { const e = document.activeElement; if (!e) return "none"; const inDlg = !!e.closest("[role=dialog]"); return `${e.tagName.toLowerCase()}${e.getAttribute("aria-label") ? `[aria-label=${e.getAttribute("aria-label")}]` : ""}${e.type ? `[type=${e.type}]` : ""}${e.name ? `[name=${e.name}]` : ""}${e.id ? "#" + e.id : ""} "${(e.innerText || e.value || "").toString().trim().slice(0, 25)}" ${inDlg ? "(in dialog)" : "(PAGE)"}`; });
for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, "b-kb", { vp }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0, 100)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForSelector(S1, { timeout: 9000 }); await page.waitForTimeout(400);
  const seq = [`open: ${await act(page)}`];
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); seq.push(`Tab${i + 1}: ${await act(page)}`); }
  await page.keyboard.press("Shift+Tab"); seq.push(`Shift+Tab: ${await act(page)}`);
  const trapped = !seq.filter(s => s.startsWith("Tab")).some(s => s.includes("(PAGE)"));
  // focus before open (the element that had focus): body. Escape
  await page.keyboard.press("Escape"); await page.waitForTimeout(400); const afterEsc = await act(page); const closed = await page.locator(S1).count() === 0;
  rec(`keyboard popup @${vp}`, trapped ? "ok" : "FINDING", `${seq.join(" | ")} || Tab stays inside dialog (focus trap)=${trapped}; Escape closes=${closed}; focus after close: ${afterEsc}; page errors=${errs.length}`);
  // tab to the in-body link
  const info = await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find(x => /a recent post on X/i.test(x.textContent)); if (!a) return null; return { href: a.href, target: a.target, rel: a.rel, tabindex: a.tabIndex, visible: !!(a.offsetWidth || a.offsetHeight) }; });
  await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find(x => /a recent post on X/i.test(x.textContent)); a.scrollIntoView({ block: "center" }); });
  // focus previous focusable then Tab to it
  const reached = await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find(x => /a recent post on X/i.test(x.textContent)); const all = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e => !e.disabled && (e.offsetWidth || e.offsetHeight)); const i = all.indexOf(a); if (i > 0) all[i - 1].focus(); return i; });
  await page.keyboard.press("Tab"); const onLink = await page.evaluate(() => document.activeElement && /a recent post on X/i.test(document.activeElement.textContent));
  const ring = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return `outline=${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}; boxShadow=${cs.boxShadow.slice(0, 40)}`; });
  rec(`in-body X link @${vp}`, info && info.target === "_blank" && /noopener/.test(info.rel) && onLink ? "ok" : "FINDING", `${JSON.stringify(info)}; reachable by Tab=${onLink}; focus style: ${ring}`);
  await page.screenshot({ path: `/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/sentry-cycle1/kb-link-focus-${vp}.png` });
  await ctx.close();
}
save("b5-results.json", R); await browser.close();
