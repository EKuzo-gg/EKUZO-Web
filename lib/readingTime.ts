import { isValidElement, type ReactNode } from "react";

/**
 * Words per minute for adult silent reading of English non-fiction.
 * 238 wpm is the figure from Brysbaert's 2019 meta-analysis (190 studies,
 * ~18,000 participants) — the best-sourced number available. The popular
 * "200 wpm" and the "read time lifts engagement 40%" claim both trace back to
 * marketing posts with no published methodology, so read time here is a UX
 * judgment call, not a research-backed one. Documented so nobody re-derives it.
 */
const WORDS_PER_MINUTE = 238;

/**
 * Above this, the label stops being permission and starts being a warning,
 * so it is suppressed rather than rendered. Decided 2026-07-28.
 */
export const READ_TIME_CEILING_MINUTES = 12;

/** Flattens a rendered React tree down to its text nodes. */
function collectText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (isValidElement(node)) {
    const { children } = node.props as { children?: ReactNode };
    return collectText(children);
  }
  return "";
}

export function countWords(node: ReactNode): number {
  return collectText(node).trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Read time in whole minutes, computed from the post body at render time.
 * Never hand-maintained: nothing to forget to update when copy changes.
 * Text passed as props rather than children (QuoteCards, GutCheckAside) is not
 * counted — the undercount is small and the number is an estimate anyway.
 */
export function readingTimeMinutes(node: ReactNode): number {
  return Math.max(1, Math.round(countWords(node) / WORDS_PER_MINUTE));
}
