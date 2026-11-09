// Device, network and failure profiles for the field-vitals harness (H2a, H2b, OR3).
// To add a device profile: add a UA below if needed and one entry to PROFILES.

export const UA = {
  // Facebook Android in-app browser (Android System WebView), Samsung S24.
  fb: "Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]",
  // Instagram Android in-app browser (same WebView, Instagram suffix).
  ig: "Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 Instagram 356.0.0.41.109 Android (34/14; 420dpi; 1080x2340; samsung; SM-S921U; e1q; qcom; en_US; 652843297)",
  // Chrome for Android (reduced UA, as Chrome sends it).
  chrome: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
};

const SIZES = {
  412: { width: 412, height: 915, dpr: 2.625 },
  360: { width: 360, height: 780, dpr: 3 },
};

const mk = (ua, size) => ({ ua: UA[ua], uaKind: ua, ...SIZES[size], isMobile: true, hasTouch: true });

export const PROFILES = {
  "fb-android-412": mk("fb", 412),
  "fb-android-360": mk("fb", 360),
  "ig-android-412": mk("ig", 412),
  "ig-android-360": mk("ig", 360),
  "chrome-android-412": mk("chrome", 412),
  "chrome-android-360": mk("chrome", 360),
};
// Short names default to the 412 wide phone.
for (const k of ["fb-android", "ig-android", "chrome-android"]) PROFILES[k] = PROFILES[k + "-412"];

// --viewport WxH overrides width and height (H7b step 5: 360x640, 412x700 short in-app viewports).
export function resolveProfile(name, viewport) {
  const base = PROFILES[name];
  if (!base) throw new Error(`unknown profile "${name}". Known: ${Object.keys(PROFILES).join(", ")}`);
  const p = { name: PROFILES[name] === PROFILES[name + "-412"] ? name + "-412" : name, ...base };
  if (viewport) {
    const m = /^(\d+)x(\d+)$/.exec(viewport);
    if (!m) throw new Error(`--viewport must look like 360x640, got "${viewport}"`);
    p.width = +m[1];
    p.height = +m[2];
    p.viewportOverride = viewport;
  }
  return p;
}

// Network conditions for CDP Network.emulateNetworkConditions. Throughput in bytes per second.
// slow4g: 1.6 Mbps down, 0.75 Mbps up, 150 ms RTT (brief). mid: 10 Mbps, 40 ms.
// Custom: "<downKbps>k/<rttMs>", for example "400k/400" (H7b step 3).
export function resolveNetwork(name) {
  if (!name || name === "none") return { name: "none", conditions: null };
  if (name === "slow4g")
    return { name, conditions: { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 } };
  if (name === "mid")
    return { name, conditions: { offline: false, latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 } };
  const m = /^(\d+)k\/(\d+)$/.exec(name);
  if (m)
    return {
      name,
      conditions: { offline: false, latency: +m[2], downloadThroughput: (+m[1] * 1000) / 8, uploadThroughput: (Math.min(+m[1], 750) * 1000) / 8 },
    };
  throw new Error(`unknown --network "${name}" (slow4g, mid, none or e.g. 400k/400)`);
}

// Failure profiles (OR3, users lens U-1). Applied at request routing in run.mjs.
export const FAILURES = {
  "fonts-blocked": "abort every request to fonts.googleapis.com and fonts.gstatic.com",
  "fonts-slow": "hold every request to fonts.googleapis.com and fonts.gstatic.com for --fontDelay ms (default 20000) before sending it",
  "fonts-slow-8s": "same as fonts-slow with an 8000 ms hold (users lens U-1: a stall, not a fast failure)",
  "hero-404": "answer every /images/season1/landing/ and /images/season1/jersey/ request with 404",
  "small-script-throws": "rewrite the HTML: a throw as the first statement inside the small script's first try block (the script that sets pa / pre-ih); runtime throw, caught by its own try/catch",
  "big-script-fails": "rewrite the HTML: the largest inline script starts with a syntax error, so none of it runs",
};

// Analytics hosts blocked from the first request (R-RUNCLASS Class T, H6).
export const ANALYTICS_HOST_RULES = [
  "*.google-analytics.com",
  "google-analytics.com",
  "*.googletagmanager.com",
  "googletagmanager.com",
  "*.clarity.ms",
  "clarity.ms",
  "connect.facebook.net",
  "www.facebook.com",
  "*.doubleclick.net",
];
export const ANALYTICS_RE =
  /^https?:\/\/([^/]*\.)?(google-analytics\.com|googletagmanager\.com|clarity\.ms|doubleclick\.net)(\/|:|$)|^https?:\/\/connect\.facebook\.net\/|^https?:\/\/www\.facebook\.com\/|^https?:\/\/www\.google\.com\/(ccm|pagead)\//;
export const analyticsHost = (url) => {
  try {
    const h = new URL(url).hostname;
    if (/google-analytics\.com$/.test(h)) return "google-analytics.com";
    if (/googletagmanager\.com$/.test(h)) return "googletagmanager.com";
    if (/clarity\.ms$/.test(h)) return "clarity.ms";
    if (/doubleclick\.net$/.test(h)) return "doubleclick.net";
    return h;
  } catch {
    return "?";
  }
};
