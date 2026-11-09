// CLS maths, the one source of truth for the field-vitals harness (H4a).
//
// Input: layout-shift entries as plain objects { startTime, value, hadRecentInput }.
// Session windows follow the web-vitals definition: a window ends when the gap to the
// next shift is over 1 s, or when adding the shift would make the window longer than 5 s.
// "windowed" is the largest window (what Chrome, CrUX and web-vitals report as CLS).
// "total" is the plain sum of every shift in the page view (in case a tool sums them).
// Each is computed twice: without entries flagged hadRecentInput (the standard) and with
// them (Scout saw a hadRecentInput:true entry with no input, so a filter can hide a shift).

export const GAP_MS = 1000;
export const CAP_MS = 5000;

export function sessionWindows(entries, { gap = GAP_MS, cap = CAP_MS, includeInput = false } = {}) {
  const list = (entries || [])
    .filter((e) => includeInput || !e.hadRecentInput)
    .slice()
    .sort((a, b) => a.startTime - b.startTime);
  const windows = [];
  let cur = null;
  for (const e of list) {
    if (!cur || e.startTime - cur.last > gap || e.startTime - cur.start > cap) {
      cur = { start: e.startTime, last: e.startTime, value: 0, count: 0, entries: [] };
      windows.push(cur);
    }
    cur.value += e.value;
    cur.last = e.startTime;
    cur.count += 1;
    cur.entries.push(e);
  }
  return windows;
}

function worst(windows) {
  let w = null;
  for (const x of windows) if (!w || x.value > w.value) w = x;
  return w;
}

const sum = (entries, includeInput) =>
  (entries || []).filter((e) => includeInput || !e.hadRecentInput).reduce((a, e) => a + e.value, 0);

// Returns the four CLS numbers plus the worst window (without input entries) for source attribution.
export function clsSummary(entries) {
  const wEx = sessionWindows(entries, { includeInput: false });
  const wIn = sessionWindows(entries, { includeInput: true });
  const worstEx = worst(wEx);
  return {
    windowed: worstEx ? worstEx.value : 0,
    windowedWithInput: worst(wIn) ? worst(wIn).value : 0,
    total: sum(entries, false),
    totalWithInput: sum(entries, true),
    windows: wEx.length,
    worstWindow: worstEx
      ? { start: worstEx.start, end: worstEx.last, value: worstEx.value, count: worstEx.count }
      : null,
    worstEntries: worstEx ? worstEx.entries : [],
  };
}

export const round4 = (x) => (x == null || Number.isNaN(x) ? x : Math.round(x * 10000) / 10000);
