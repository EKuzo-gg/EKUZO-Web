import type { ProductConfig } from "./types";

export const campsProduct: ProductConfig = {
  id: "camps",
  cohortUnit: "week",
  programName: "EKUZO Camps",
  welcomeAutomationId: "aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc",
  beehiiv: {
    referringSites: {
      purchase: "ekuzo-camps-registration",
      formStarted: "ekuzo-camps-form-started",
      cartAbandoned: "ekuzo-camps-cart-abandoned",
    },
    tags: {
      purchased: ["camp-2026-purchased", "source-camp-registration"],
      formStarted: "form_started_camps",
      cartAbandoned: "cart_abandoned_camps",
    },
  },
};
