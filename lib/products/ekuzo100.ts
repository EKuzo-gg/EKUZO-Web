import type { ProductConfig } from "./types";

export const ekuzo100Product: ProductConfig = {
  id: "ekuzo100",
  cohortUnit: "month",
  programName: "EKUZO100",
  welcomeAutomationId: "aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556",
  beehiiv: {
    referringSites: {
      purchase: "ekuzo100-registration",
      formStarted: "ekuzo100-form-started",
      cartAbandoned: "ekuzo100-cart-abandoned",
    },
    tags: {
      purchased: ["ekuzo100-purchased", "source-ekuzo100-registration"],
      formStarted: "form_started_ekuzo100",
      cartAbandoned: "cart_abandoned_ekuzo100",
    },
  },
};
