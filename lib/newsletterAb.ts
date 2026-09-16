/**
 * Blog newsletter A/B assignment, popup re-ask cadence, and blog-post
 * pathname detection. Pure functions with injectable storage and clock so
 * this module runs identically in the browser and under plain node tests.
 *
 * See docs/blog-newsletter/02-contract.md section 5 for the frozen
 * interface, and docs/blog-newsletter/02-frozen-spec.md for the two
 * additions on top of it: the "thumbs" storage-throw fallback (D-05) and
 * the exported shownThisLoad guard.
 */

export const VARIANT_KEY = "ekuzo_nl_variant";
export const DISMISSED_AT_KEY = "ekuzo_nl_blog_dismissed_at";
export const SUBSCRIBED_AT_KEY = "ekuzo_nl_blog_subscribed_at";

/** Re-ask window for a dismissed popup: 30 days, in milliseconds. */
export const DISMISS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Suppression window after a successful subscribe: 365 days, in milliseconds. */
export const SUBSCRIBED_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

export interface AbStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type NewsletterVariant = "thumbs" | "classic";

/**
 * Module-scoped, in-memory, once-per-page-load guard for the blog popup.
 * A storage-less reader (private mode, storage disabled) still only gets
 * shown the popup once per page load instead of on every scroll event or
 * re-render, since shouldShowPopup alone cannot remember that across calls
 * when storage.setItem never actually persists anything.
 */
export let shownThisLoad = false;

export function markShownThisLoad(): void {
  shownThisLoad = true;
}

function isValidVariant(value: string | null): value is NewsletterVariant {
  return value === "thumbs" || value === "classic";
}

/**
 * Returns the reader's assigned popup and sticky-bar copy variant for this
 * browser, assigning and persisting a new one on first call.
 *
 * - If a valid variant ("thumbs" or "classic") is already stored under
 *   VARIANT_KEY, that value wins and is returned as-is. The variant, once
 *   validly assigned, is never reassigned.
 * - Otherwise assigns randomly: random() < 0.5 ? "thumbs" : "classic", then
 *   attempts to persist it via storage.setItem before returning it.
 * - If storage.getItem or storage.setItem throws (storage unavailable),
 *   the error is caught and the function returns "thumbs" WITHOUT
 *   attempting to store anything (D-05: thumbs is the preferred arm).
 */
export function getOrAssignVariant(
  storage: AbStorage,
  random: () => number = Math.random
): NewsletterVariant {
  try {
    const stored = storage.getItem(VARIANT_KEY);
    if (isValidVariant(stored)) {
      return stored;
    }
    const assigned: NewsletterVariant = random() < 0.5 ? "thumbs" : "classic";
    storage.setItem(VARIANT_KEY, assigned);
    return assigned;
  } catch {
    return "thumbs";
  }
}

/**
 * True when the blog popup should currently be shown to this reader.
 *
 * - false when a dismissal timestamp is stored under DISMISSED_AT_KEY and
 *   now - dismissedAt < DISMISS_WINDOW_MS (30 days).
 * - false when a subscribe timestamp is stored under SUBSCRIBED_AT_KEY and
 *   now - subscribedAt < SUBSCRIBED_WINDOW_MS (365 days).
 * - true otherwise, including when storage access throws (storage
 *   unavailable defaults to SHOWING the popup, per T4).
 */
export function shouldShowPopup(
  storage: AbStorage,
  now: number = Date.now()
): boolean {
  try {
    const dismissedAtRaw = storage.getItem(DISMISSED_AT_KEY);
    if (dismissedAtRaw !== null) {
      const dismissedAt = Number(dismissedAtRaw);
      if (!Number.isNaN(dismissedAt) && now - dismissedAt < DISMISS_WINDOW_MS) {
        return false;
      }
    }

    const subscribedAtRaw = storage.getItem(SUBSCRIBED_AT_KEY);
    if (subscribedAtRaw !== null) {
      const subscribedAt = Number(subscribedAtRaw);
      if (!Number.isNaN(subscribedAt) && now - subscribedAt < SUBSCRIBED_WINDOW_MS) {
        return false;
      }
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Records a dismissal (close button, Escape, or backdrop click) at `now`,
 * so shouldShowPopup returns false for the next DISMISS_WINDOW_MS.
 * Storage errors are caught and ignored (best-effort, never throws).
 */
export function recordDismiss(storage: AbStorage, now: number = Date.now()): void {
  try {
    storage.setItem(DISMISSED_AT_KEY, String(now));
  } catch {
    // ignore
  }
}

/**
 * Records a successful subscribe at `now`, so shouldShowPopup returns
 * false for the next SUBSCRIBED_WINDOW_MS. Storage errors are caught and
 * ignored (best-effort, never throws).
 */
export function recordSuccess(storage: AbStorage, now: number = Date.now()): void {
  try {
    storage.setItem(SUBSCRIBED_AT_KEY, String(now));
  } catch {
    // ignore
  }
}

/**
 * True only for a real blog post page: pathnames matching
 * /^\/blog\/[^/]+\/?$/ that do NOT start with "/blog/author/".
 * False for "/blog" (the index, no trailing segment to match) and for
 * any "/blog/author/*" page. The regex alone already excludes multi-
 * segment paths like "/blog/author/jamie-fitch" (the "/" inside fails
 * [^/]+), but the explicit "/blog/author/" prefix check is kept as a
 * second, independent guard per T4's exact wording.
 */
export function isBlogPostPath(pathname: string): boolean {
  if (pathname.startsWith("/blog/author/")) return false;
  return /^\/blog\/[^/]+\/?$/.test(pathname);
}
