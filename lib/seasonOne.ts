/**
 * Season 01 waitlist mode (Oct 2026).
 *
 * While this is on, every enrollment entry point on the site (the Enroll
 * modal, direct /register links, the sticky bar, the nav button) opens the
 * Season 01 waitlist popup instead, and /register pages redirect back to
 * their program page with the popup open. Commerce code is untouched, so
 * turning it off restores the old funnel exactly.
 *
 * On by default. Set NEXT_PUBLIC_SEASON_ONE_MODE=off in Netlify to turn it off.
 */
export const SEASON_ONE_MODE = process.env.NEXT_PUBLIC_SEASON_ONE_MODE !== "off";

/** Query param that opens the popup on any page: /?join=season-one */
export const SEASON_ONE_PARAM = "join";

/** Paths where the popup never opens on its own (it still opens from a click). */
export const SEASON_ONE_QUIET_PATHS = [
  "/make-it-count",
  "/swamp",
  "/woodward",
  "/squad",
  "/creators",
  "/editors",
  "/privacy-policy",
  "/terms-of-service",
];

/** Copy follows the parent ads (D01 "They game too much", D10 "Be proud of their screen time"). */
export const SEASON_ONE_COPY = {
  kicker: "Season 01 · Waitlist open",
  lines: ["They game", "too much.", "With a coach."], // second line is struck through
  sub: "Turn screentime into practice. A real coach, a team that counts on them and a season to play for.",
  promise: "Join the list and you’ll hear first when sign-ups open.",
  cta: "Save their spot",
  fine: "For parents. Free, no commitment. Unsubscribe anytime.",
  navCta: "Join Season 01",
  bannerHead: "Season 01 starts in 2027. Get them on the list.",
  stickyHead: "Season 01 waitlist is open",
  doneKicker: "You’re on the list",
  doneHead: "Awesome.",
  doneSub: "We can’t wait to make screentime the highlight of your day too. We’ll be in touch. Now go outside. Or pick up that controller. Either way, go have fun.",
  ageQ: "Optional: how old is your gamer?",
  // Values match the Klaviyo kid_age field in Jamie's brief
  ages: ["8 to 10", "11 to 13", "14 to 17", "More than one"],
} as const;
