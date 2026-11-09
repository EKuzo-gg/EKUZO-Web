// In-page measurement (H4a to H4c) and DOM checks (S2, U-6, OR2, OR7) for the field-vitals harness.
// INIT runs before any page script (page.addInitScript). Everything it records lives on window.__fv.

export const INIT = () => {
  if (window.top !== window || window.__fv) return;
  const fv = (window.__fv = { ls: [], lcp: [], ev: [], lt: [], fontEv: [], tl: [], errors: [] });
  try { performance.setResourceTimingBufferSize(2000); } catch (_) {}
  const seg = (n) => {
    if (!n) return "?";
    if (n.nodeType !== 1) return "#text";
    let s = n.tagName.toLowerCase();
    if (n.id) s += "#" + n.id;
    const c = typeof n.className === "string" ? n.className : n.getAttribute && n.getAttribute("class");
    if (c && c.trim()) s += "." + c.trim().split(/\s+/).slice(0, 3).join(".");
    return s;
  };
  const path = (n) => {
    if (!n) return "?";
    const parts = [];
    let el = n.nodeType === 1 ? n : n.parentElement;
    if (n.nodeType !== 1) parts.push("#text");
    while (el && el !== document.body && el !== document.documentElement && parts.length < 7) {
      parts.unshift(seg(el));
      if (el.id) break;
      el = el.parentElement;
    }
    return parts.join(" > ");
  };
  fv.seg = seg;
  fv.path = path;
  const rect = (r) => r && [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
  const obs = (type, fn, extra) => {
    try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...(extra || {}) }); } catch (_) {}
  };
  obs("layout-shift", (e) =>
    fv.ls.push({
      startTime: e.startTime,
      value: e.value,
      hadRecentInput: e.hadRecentInput,
      lastInputTime: e.lastInputTime,
      sources: (e.sources || []).map((s) => ({ sel: s.node && s.node.nodeType !== 1 && s.node.parentElement ? seg(s.node.parentElement) + " #text" : seg(s.node), path: path(s.node), prev: rect(s.previousRect), cur: rect(s.currentRect) })),
    }),
  );
  obs("largest-contentful-paint", (e) =>
    fv.lcp.push({ startTime: e.startTime, renderTime: e.renderTime, loadTime: e.loadTime, size: e.size, sel: seg(e.element), path: path(e.element), url: e.url ? e.url.replace(location.origin, "") : "" }),
  );
  obs("event", (e) => { if (e.interactionId) fv.ev.push({ name: e.name, startTime: e.startTime, duration: e.duration, interactionId: e.interactionId, target: seg(e.target) }); }, { durationThreshold: 16 });
  obs("first-input", (e) => fv.ev.push({ name: e.name, startTime: e.startTime, duration: e.duration, interactionId: e.interactionId || -1, target: seg(e.target), firstInput: true }));
  obs("longtask", (e) => fv.lt.push({ startTime: e.startTime, duration: e.duration, name: e.name, attribution: (e.attribution || []).map((a) => [a.containerType, a.containerName, a.containerSrc].filter(Boolean).join(" ")) }));
  try {
    for (const t of ["loading", "loadingdone", "loadingerror"])
      document.fonts.addEventListener(t, (e) => fv.fontEv.push({ t: performance.now(), type: t, faces: (e.fontfaces || []).map((f) => `${f.family} ${f.weight} ${f.style}`) }));
  } catch (_) {}
  addEventListener("error", (e) => fv.errors.push({ t: performance.now(), msg: String(e.message || e.type).slice(0, 200), src: (e.filename || "").replace(location.origin, "").slice(0, 120), line: e.lineno }), true);
  // Timeline: state of the hero and join section every 250 ms for the first 15 s (visible result).
  const t0 = performance.now();
  const snap = () => {
    const lp = document.getElementById("lp");
    if (!lp) return;
    const h = document.getElementById("hero"), ih = document.getElementById("ihero"), j = document.getElementById("join-top");
    const g = (e) => (e ? Math.round(e.getBoundingClientRect().height) : null);
    fv.tl.push({
      t: Math.round(performance.now()),
      heroH: g(h), heroKids: h ? h.childElementCount : null, heroCls: h ? h.className : null,
      ihH: g(ih), ihHidden: ih ? ih.hidden : null,
      joinY: j ? Math.round(j.getBoundingClientRect().top + scrollY) : null,
      lpCls: lp.className, fonts: document.fonts ? document.fonts.status : null,
      ready: document.documentElement.dataset.s1Ready || null,
    });
  };
  const iv = setInterval(() => { snap(); if (performance.now() - t0 > 15000) clearInterval(iv); }, 250);
};

// Read what INIT recorded plus timing APIs. Call before any DOM check that mutates the page.
export async function collectMetrics(page) {
  return page.evaluate(() => {
    const fv = window.__fv || {};
    const nav = performance.getEntriesByType("navigation")[0];
    const paint = Object.fromEntries(performance.getEntriesByType("paint").map((p) => [p.name, p.startTime]));
    const res = performance.getEntriesByType("resource").map((e) => ({
      url: e.name.replace(location.origin, "").slice(0, 200),
      type: e.initiatorType,
      start: e.startTime,
      end: e.responseEnd,
      encodedBodySize: e.encodedBodySize,
      transferSize: e.transferSize,
      status: e.responseStatus,
      renderBlocking: e.renderBlockingStatus,
    }));
    const faces = document.fonts ? [...document.fonts].map((f) => ({ family: f.family.replace(/["']/g, ""), weight: f.weight, style: f.style, status: f.status })) : [];
    return {
      timeOrigin: performance.timeOrigin,
      shifts: fv.ls || [],
      lcp: fv.lcp || [],
      events: fv.ev || [],
      longTasks: fv.lt || [],
      fontEvents: fv.fontEv || [],
      timeline: fv.tl || [],
      jsErrors: fv.errors || [],
      paint: { firstPaint: paint["first-paint"] ?? null, fcp: paint["first-contentful-paint"] ?? null },
      nav: nav ? { responseStart: nav.responseStart, responseEnd: nav.responseEnd, domInteractive: nav.domInteractive, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, encodedBodySize: nav.encodedBodySize, transferSize: nav.transferSize } : null,
      resources: res,
      fontFaces: faces.filter((f) => f.status !== "unloaded"),
      fontFacesUnloaded: faces.filter((f) => f.status === "unloaded").length,
      fontsStatus: document.fonts ? document.fonts.status : null,
    };
  });
}

// DOM checks. Mutates image src briefly for the reserved-space test, so run after collectMetrics.
export async function domChecks(page) {
  return page.evaluate(async () => {
    const fv = window.__fv || {};
    const seg = fv.seg || ((n) => (n && n.tagName ? n.tagName.toLowerCase() : "?"));
    const path = fv.path || seg;
    const out = {};
    // OR7 build marker, OR2 sentinels, hero state.
    const meta = document.querySelector('meta[name="s1-build"]');
    out.marker = meta ? meta.getAttribute("content") : null;
    const lp = document.getElementById("lp"), hero = document.getElementById("hero"), ih = document.getElementById("ihero");
    out.sentinels = {
      s1Ready: document.documentElement.dataset.s1Ready ?? null,
      s1Pre: lp ? lp.dataset.s1Pre ?? null : null,
    };
    out.state = {
      heroPa: hero ? hero.classList.contains("pa") : null,
      lpPreIh: lp ? lp.classList.contains("pre-ih") : null,
      lpHasIhero: lp ? lp.classList.contains("has-ihero") : null,
      heroFilled: hero ? hero.childElementCount > 0 : null,
      heroH: hero ? Math.round(hero.getBoundingClientRect().height) : null,
      ihVisible: ih ? !ih.hidden : null,
      ihH: ih ? Math.round(ih.getBoundingClientRect().height) : null,
      ctaText: (document.querySelector(".join button[type=submit]") || {}).textContent || null,
      bodyFont: getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, "").trim(),
      bodyFontSize: getComputedStyle(document.querySelector("#jt") || document.body).fontSize,
      scrollHeight: document.documentElement.scrollHeight,
    };
    // S2: every img inside #hero / #ihero has reserved space. Behavioral test: swap the image for a
    // 1x1 GIF (srcset removed for the test) and see whether the image box or the hero box changes.
    const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const S2 = ".ph, .jb, .pol img, .half img, .pair img, [data-bg], .frame img, .ih-bg";
    const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    out.heroImgs = [];
    out.heroBg = [];
    for (const root of ["#hero", "#ihero"]) {
      const box = document.querySelector(root);
      if (!box) continue;
      for (const img of [...box.querySelectorAll("img")]) {
        const cs = getComputedStyle(img);
        const r = img.getBoundingClientRect();
        const rec = {
          root, sel: seg(img), inS2: img.matches(S2),
          src: (img.currentSrc || img.src || "").replace(location.origin, "").slice(0, 140),
          attrW: img.getAttribute("width"), attrH: img.getAttribute("height"),
          loading: img.getAttribute("loading"), fetchpriority: img.getAttribute("fetchpriority"),
          srcset: img.getAttribute("srcset") ? true : false,
          natural: [img.naturalWidth, img.naturalHeight],
          rendered: [Math.round(r.width), Math.round(r.height)],
          renderedDevicePx: Math.round(r.width * devicePixelRatio),
          position: cs.position, aspectRatio: cs.aspectRatio,
          visible: r.width > 0 && r.height > 0,
          reserved: null,
        };
        if (rec.visible) {
          const bh = box.getBoundingClientRect().height;
          const srcset = img.getAttribute("srcset"), sizes = img.getAttribute("sizes"), src = img.getAttribute("src");
          if (srcset !== null) img.removeAttribute("srcset");
          img.setAttribute("src", GIF);
          try { await img.decode(); } catch (_) {}
          await raf();
          const r2 = img.getBoundingClientRect(), bh2 = box.getBoundingClientRect().height;
          rec.swap = { boxDelta: +(bh2 - bh).toFixed(1), imgDw: +(r2.width - r.width).toFixed(1), imgDh: +(r2.height - r.height).toFixed(1) };
          rec.reserved = Math.abs(bh2 - bh) < 0.5 && Math.abs(r2.width - r.width) < 0.5 && Math.abs(r2.height - r.height) < 0.5;
          if (srcset !== null) img.setAttribute("srcset", srcset);
          if (sizes !== null) img.setAttribute("sizes", sizes);
          if (src !== null) img.setAttribute("src", src); else img.removeAttribute("src");
        }
        out.heroImgs.push(rec);
      }
      for (const el of [...box.querySelectorAll("*")]) {
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg.includes("url(")) {
          const r = el.getBoundingClientRect();
          out.heroBg.push({ root, sel: seg(el), rect: [Math.round(r.width), Math.round(r.height)], aspectRatio: getComputedStyle(el).aspectRatio, url: bg.slice(0, 120) });
        }
      }
    }
    await raf();
    out.s2Offenders = out.heroImgs.filter((x) => x.visible && x.reserved === false).map((x) => `${x.root} ${x.sel} ${x.src}`);
    // U-6: every visible text node's first computed family is in the set the page requested.
    const fams = new Set();
    const links = [...document.querySelectorAll('link[href*="fonts.googleapis.com/css"]')];
    for (const l of links) {
      try { for (const f of new URL(l.href).searchParams.getAll("family")) fams.add(f.split(":")[0].trim()); } catch (_) {}
    }
    for (const sh of document.styleSheets) {
      try { for (const rule of sh.cssRules) if (rule instanceof CSSFontFaceRule) fams.add(rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim()); } catch (_) {}
    }
    const offenders = {};
    let n = 0;
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      if (!t.nodeValue || !t.nodeValue.trim()) continue;
      const el = t.parentElement;
      if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
      const vis = el.checkVisibility ? el.checkVisibility({ visibilityProperty: true, opacityProperty: false }) : el.offsetParent !== null;
      if (!vis) continue;
      n++;
      const first = getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      if (!fams.has(first)) {
        const o = (offenders[first] = offenders[first] || { count: 0, samples: [] });
        o.count++;
        if (o.samples.length < 4) o.samples.push(`${path(el)}: ${t.nodeValue.trim().slice(0, 30)}`);
      }
    }
    out.fonts = {
      requestedFamilies: [...fams].sort(),
      stylesheetLinks: links.map((l) => ({ media: l.media || "", families: (() => { try { return new URL(l.href).searchParams.getAll("family").length; } catch (_) { return null; } })(), inHead: l.parentElement === document.head })),
      textNodes: n,
      offenders,
    };
    // OR12 preloads present in the document.
    out.preloads = [...document.querySelectorAll('link[rel="preload"]')].map((l) => ({ as: l.getAttribute("as"), href: (l.getAttribute("href") || "").slice(0, 140), fetchpriority: l.getAttribute("fetchpriority"), imagesrcset: !!l.getAttribute("imagesrcset") }));
    return out;
  });
}

// INP from event-timing entries: worst interaction latency (fewer than 50 interactions).
export function inpFrom(events) {
  const by = new Map();
  for (const e of events || []) {
    if (!e.interactionId || e.interactionId < 0) continue;
    by.set(e.interactionId, Math.max(by.get(e.interactionId) || 0, e.duration));
  }
  const v = [...by.values()].sort((a, b) => b - a);
  if (!v.length) return { inp: null, interactions: 0 };
  const idx = v.length >= 50 ? Math.floor(v.length / 50) : 0;
  return { inp: v[idx], interactions: v.length };
}
