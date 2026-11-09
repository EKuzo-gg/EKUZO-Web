// The H3 journey: load, wait, touch-scroll to the bottom (with an Android toolbar collapse during the
// first scroll), scroll back up (toolbar restores), header crossings, hero tap, email focus and type
// "a" (never Enter, never submit), back to top. Each step is timestamped in page time.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Named elements a scroll gesture should start on, once each (H3, X7, X10, X12).
const STARTS = [
  { name: "hero-answer", sels: ["#ihero:not([hidden]) .ih-opt"] },
  { name: "cta", sels: ["#hero .cta", "#ihero:not([hidden]) .ih-skip"] },
  { name: "email", sels: ["#em-top", "#em-end"] },
  { name: "faq-summary", sels: [".faq summary"] },
];

export function makeJourney(page, cdp, profile, opts = {}) {
  const steps = [];
  const W = profile.width, H = profile.height;
  const mark = async (name, extra) => {
    const t = await page.evaluate(() => performance.now()).catch(() => null);
    steps.push({ name, t: t == null ? null : Math.round(t), ...(extra || {}) });
  };
  const st = () =>
    page.evaluate(() => ({ y: Math.round(scrollY), ih: innerHeight, iw: innerWidth, sh: document.documentElement.scrollHeight }));
  const center = (sels) =>
    page.evaluate((sels) => {
      for (const s of sels) {
        for (const e of document.querySelectorAll(s)) {
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return { x: r.x + r.width / 2, y: r.y + r.height / 2, vh: innerHeight };
        }
      }
      return null;
    }, sels);
  const viewportInfo = () =>
    page.evaluate(() => {
      const d = document.createElement("div");
      d.style.cssText = "position:fixed;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none";
      document.documentElement.appendChild(d);
      const svh = d.getBoundingClientRect().height;
      d.remove();
      return { innerHeight, vvHeight: window.visualViewport ? Math.round(visualViewport.height) : null, svh: Math.round(svh) };
    });
  // Touch drag from (x, y) by dy px (negative scrolls the page down), as raw CDP touch events.
  // Input.synthesizeScrollGesture with gestureSourceType "touch" does not scroll in headless
  // Chromium 153 (tested 2026-11-09: scrollY unchanged), so the harness drives touchStart,
  // touchMove x 16 at about 16 ms intervals, a 60 ms hold (no fling) and touchEnd.
  const gesture = async (x, y, dy) => {
    try {
      const N = 16, X = Math.round(x), Y = Math.round(y);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: X, y: Y }] });
      for (let i = 1; i <= N; i++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: X, y: Math.round(Y + (dy * i) / N) }] });
        await sleep(16);
      }
      await sleep(60);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } catch (e) {
      steps.push({ name: "gesture-error", msg: String(e.message).slice(0, 120) });
    }
  };
  const setH = (h) => page.setViewportSize({ width: W, height: h });

  async function scrollDown({ toolbar }) {
    const used = new Set();
    let stuck = 0, first = true;
    for (let i = 0; i < 40; i++) {
      const s = await st();
      if (s.y + s.ih >= s.sh - 4) break;
      let x = s.iw / 2, y = s.ih * 0.85, dist = s.ih * 0.75, startedOn = null;
      for (const t of STARTS) {
        if (used.has(t.name)) continue;
        const c = await center(t.sels);
        if (c && c.y > c.vh * 0.3 && c.y < c.vh * 0.95) {
          x = c.x; y = c.y; dist = Math.max(120, c.y - c.vh * 0.08); used.add(t.name); startedOn = t.name;
          break;
        }
      }
      if (first && toolbar) {
        const g = gesture(x, y, -dist);
        await sleep(120); await setH(H - 56);
        await sleep(140); await setH(H - 110);
        await g;
        await mark("toolbar-collapsed", await viewportInfo());
      } else {
        await gesture(x, y, -dist);
      }
      first = false;
      const s2 = await st();
      await mark("scroll-down", { startedOn, y: s2.y });
      stuck = s2.y <= s.y ? stuck + 1 : 0;
      if (stuck >= 2) break;
      await sleep(700);
    }
  }

  async function scrollUp({ toolbar }) {
    let first = true, stuck = 0;
    for (let i = 0; i < 40; i++) {
      const s = await st();
      if (s.y <= 0) break;
      const dist = s.ih * 0.6;
      // Alternate the start point if a gesture made no progress (a start on a control can be eaten).
      const y0 = stuck ? s.ih * 0.3 : s.ih * 0.2, x0 = stuck ? s.iw * 0.85 : s.iw / 2;
      if (first && toolbar) {
        const g = gesture(x0, y0, dist);
        await sleep(120); await setH(H - 56);
        await sleep(140); await setH(H);
        await g;
        await mark("toolbar-restored", await viewportInfo());
      } else {
        await gesture(x0, y0, dist);
      }
      first = false;
      const y2 = (await st()).y;
      await mark("scroll-up", { y: y2 });
      stuck = y2 >= s.y ? stuck + 1 : 0;
      if (stuck >= 3) { await mark("scroll-up-stuck", { y: y2 }); break; }
      await sleep(700);
    }
  }

  async function tapSel(sels) {
    const c = await center(sels);
    if (!c || c.y < 0 || c.y > c.vh) return false;
    await page.touchscreen.tap(Math.round(c.x), Math.round(c.y));
    return true;
  }

  // Scroll down until one of sels is fully in view (used to reach #em-end).
  async function bringIntoView(sels) {
    for (let i = 0; i < 30; i++) {
      const c = await center(sels);
      if (c && c.y > 60 && c.y < c.vh - 60) return true;
      const s = await st();
      if (c && c.y < 60) await gesture(s.iw / 2, s.ih * 0.3, s.ih * 0.3);
      else await gesture(s.iw / 2, s.ih * 0.85, -s.ih * 0.5);
      await sleep(400);
    }
    return false;
  }

  async function run() {
    const toolbar = opts.toolbar !== false;
    await mark("journey-start", await viewportInfo());
    if (opts.journey === "load") return steps;
    await scrollDown({ toolbar });
    await mark("bottom");
    await sleep(700);
    await scrollUp({ toolbar });
    await mark("top");
    await sleep(700);
    // S4: three 0-40-0 header crossings (the .solid transition at scrollY 24).
    for (let i = 0; i < 3; i++) {
      const s = await st();
      await gesture(s.iw / 2, s.ih * 0.5, -40);
      await sleep(450);
      await gesture(s.iw / 2, s.ih * 0.4, 80);
      await sleep(450);
    }
    await mark("header-crossings", { y: (await st()).y });
    // Hero answer tap (interactive heroes only).
    if (await tapSel(["#ihero:not([hidden]) .ih-opt"])) {
      await mark("hero-tap");
      await sleep(1200);
    }
    // Email: focus by tap and type "a". Never Enter, never submit.
    const emailSels = ["#em-top", "#em-end"];
    let tapped = await tapSel(emailSels);
    if (!tapped && (await bringIntoView(["#em-end"]))) tapped = await tapSel(["#em-end"]);
    if (tapped) {
      await sleep(300);
      await page.keyboard.type("a");
      await mark("email-typed", { active: await page.evaluate(() => (document.activeElement ? document.activeElement.id : null)) });
      await sleep(800);
    } else {
      await mark("email-not-found");
    }
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await scrollUp({ toolbar: false });
    await mark("journey-end");
    await sleep(1000);
    return steps;
  }

  // Form usable (OR3): tap #em-end, type "a" (invalid), tap its submit. Local targets only.
  // A working handler shows the client error text and makes no request.
  async function formCheck() {
    const res = { attempted: false, errText: null, errVisible: false, usable: false, why: null };
    if (!(await bringIntoView(["#join-end button[type=submit]"]))) { res.why = "submit button not brought into view"; res.where = await center(["#join-end button[type=submit]"]); return res; }
    if (!(await tapSel(["#em-end"]))) { res.why = "email field not tappable"; res.where = await center(["#em-end"]); return res; }
    await sleep(250);
    await page.keyboard.press("ControlOrMeta+A").catch(() => {});
    await page.keyboard.type("a");
    await sleep(250);
    res.attempted = await tapSel(["#join-end button[type=submit]"]);
    await sleep(1500);
    Object.assign(
      res,
      await page.evaluate(() => {
        const e = document.querySelector("#join-end .err");
        return { errText: e ? e.textContent : null, errVisible: !!(e && !e.hidden) };
      }),
    );
    res.usable = res.errVisible && /check the email/i.test(res.errText || "");
    return res;
  }

  return { run, formCheck, steps, mark };
}
