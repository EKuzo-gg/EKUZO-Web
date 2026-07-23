/**
 * If the user is currently on a specific program's marketing page,
 * returns the direct register URL + program identifier for that program
 * (so universal CTAs like Nav, FooterBanner, and StickyCTA can route
 * straight to register instead of opening the cross-program program-
 * picker modal).
 *
 * Returns null on cross-program pages (home, parents, schools,
 * /programs index, methodology, FAQ, blog) where the modal IS the
 * right behavior — the parent hasn't picked a program yet, so the
 * picker is the genuine next step.
 *
 * Also returns null on /register and /success routes themselves —
 * user is already in checkout, the Enroll CTA shouldn't re-enter the
 * top of that flow.
 *
 * Each consumer appends its own `?cta=` param (e.g. Nav adds
 * `?cta=header`, FooterBanner adds `?cta=footer`, StickyCTA adds
 * `?cta=sticky`) so analytics can distinguish surface origins.
 *
 * Used by:
 * - components/layout/Nav.tsx (desktop + mobile Enroll buttons)
 * - components/sections/FooterBanner.tsx (universal bottom CTA)
 * - components/ui/StickyCTA.tsx (scrolled-bottom mobile bar)
 */
export type ProgramContext = {
  /** Direct register URL for the active program page (no query params). */
  registerHref: string;
  /** Program identifier — useful for product-aware copy / styling. */
  program: "camps" | "ekuzo100" | "ekuzo101" | "teams";
};

export function getProgramRegisterContext(
  pathname: string | null
): ProgramContext | null {
  if (!pathname) return null;

  // Inside the checkout flow itself — don't re-enter from a top-of-page CTA.
  if (pathname.includes("/register") || pathname.includes("/success")) {
    return null;
  }

  if (pathname.startsWith("/programs/ekuzo-camps")) {
    return { registerHref: "/programs/ekuzo-camps/register", program: "camps" };
  }
  if (pathname.startsWith("/programs/ekuzo101")) {
    return { registerHref: "/programs/ekuzo101/register", program: "ekuzo101" };
  }
  if (pathname.startsWith("/programs/ekuzo100")) {
    return { registerHref: "/programs/ekuzo100/register", program: "ekuzo100" };
  }
  if (pathname.startsWith("/programs/ekuzo-teams")) {
    return { registerHref: "/programs/ekuzo-teams/register", program: "teams" };
  }
  return null;
}
