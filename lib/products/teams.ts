import type { ProductConfig } from "./types";

/**
 * Teams config. The webhook arm exists today; lead/abandoned routes are
 * Phase 4 deliverables. The tag + referring_site values for the not-yet-
 * built surfaces follow the established naming pattern
 * (`ekuzo-teams-*` for Beehiiv referring sites, `form_started_teams` /
 * `cart_abandoned_teams` for tags) so the Phase 4 routes can be wired in
 * by reading from this config without further coordination.
 */
export const teamsProduct: ProductConfig = {
  id: "teams",
  cohortUnit: "semester",
  programName: "EKUZOTeams",
  welcomeAutomationId: "aut_fea2b01b-eccd-40c7-9d53-2b370c039ddb",
  beehiiv: {
    referringSites: {
      purchase: "ekuzo-teams-registration",
      formStarted: "ekuzo-teams-form-started",
      cartAbandoned: "ekuzo-teams-cart-abandoned",
    },
    tags: {
      purchased: ["teams-purchased", "source-teams-registration"],
      formStarted: "form_started_teams",
      cartAbandoned: "cart_abandoned_teams",
    },
  },
};
