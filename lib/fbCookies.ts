/**
 * Reads the Meta Pixel `_fbc` / `_fbp` cookies for Conversions API match
 * quality. The Pixel sets these client-side; the value is forwarded
 * verbatim (Meta wants fbc/fbp plaintext, never hashed). Returns
 * `undefined` when the cookie is absent or there's no `document`
 * (SSR / tests), so callers can spread it conditionally.
 */
export function getFbCookie(name: "_fbc" | "_fbp"): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}
