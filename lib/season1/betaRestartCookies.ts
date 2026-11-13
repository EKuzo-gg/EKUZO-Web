/**
 * The cookie names, the token shape check and the Set-Cookie strings of the beta restart link.
 * No imports on purpose: app/season1/beta/r/[token]/route.ts depends on this file alone, so a rollback
 * of the rest of the feature can keep that route (links already issued must never meet a 404 page that
 * loads tags). lib/season1/betaRestart.ts re-exports everything here.
 * Spec: docs/beta-restart-link-2026-11/02-frozen-spec.md.
 */

/** The token: HttpOnly, only ever sent to the restore endpoint. */
export const BETA_RESTART_COOKIE = "ekuzo_brt";
export const BETA_RESTART_COOKIE_PATH = "/api/season1-beta";
/** The flag: value "1", readable by the page script, marks a link arrival. */
export const BETA_RESTART_FLAG_COOKIE = "ekuzo_brf";
export const BETA_RESTART_FLAG_COOKIE_PATH = "/season1/beta";
export const RESTART_COOKIE_MAX_AGE = 1800;

/** 22 characters of row id (16 bytes) plus 43 of signature (32 bytes), URL-safe base64. */
export const RESTART_TOKEN_RE = /^[A-Za-z0-9_-]{65}$/;

/** True for a string of the right length and alphabet. Says nothing about whether it is signed. */
export function isRestartTokenShape(v: unknown): v is string {
  return typeof v === "string" && RESTART_TOKEN_RE.test(v);
}

/** Set-Cookie values that arm a link arrival: the token (HttpOnly) and the flag. */
export function restartSetCookies(token: string): string[] {
  return [
    `${BETA_RESTART_COOKIE}=${token}; Path=${BETA_RESTART_COOKIE_PATH}; Max-Age=${RESTART_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
    `${BETA_RESTART_FLAG_COOKIE}=1; Path=${BETA_RESTART_FLAG_COOKIE_PATH}; Max-Age=${RESTART_COOKIE_MAX_AGE}; Secure; SameSite=Lax`,
  ];
}

/** Set-Cookie values that remove both cookies (same names, paths and attributes, Max-Age 0). */
export function restartClearCookies(): string[] {
  return [
    `${BETA_RESTART_COOKIE}=; Path=${BETA_RESTART_COOKIE_PATH}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    `${BETA_RESTART_FLAG_COOKIE}=; Path=${BETA_RESTART_FLAG_COOKIE_PATH}; Max-Age=0; Secure; SameSite=Lax`,
  ];
}
