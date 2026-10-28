// Target for the dev-only phone preview (/season1/dev-view?u=...). Same-site paths only,
// so the frame can never load another site or loop back into itself.
const DEFAULT = "/season1/join";

export function devViewTarget(u: string | null): string {
  if (!u || !u.startsWith("/") || u.startsWith("//") || u.startsWith("/\\")) return DEFAULT;
  if (u.startsWith("/season1/dev-view")) return DEFAULT;
  return u;
}
