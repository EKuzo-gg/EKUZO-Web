import type {
  MetadataGamer,
  ProductConfig,
  PurchaseRowCohortFields,
  SquadMemberRowFields,
  SquadsRowFields,
  WebhookContext,
  WebhookMetadata,
} from "./types";

export const ekuzo101Product: ProductConfig = {
  id: "ekuzo101",
  cohortUnit: "week",
  programName: "EKUZO101",
  // No Beehiiv automation for pilot — Klaviyo owns product email.
  // welcomeAutomationId is omitted (field is now optional in types.ts).
  beehiiv: {
    referringSites: {
      purchase: "ekuzo101-pilot-registration",
      formStarted: "ekuzo101-form-started",
      cartAbandoned: "", // No abandoned route for 101
    },
    tags: {
      purchased: ["ekuzo101-pilot-registered", "source-ekuzo101-pilot"],
      formStarted: "ekuzo101-form-started",
      cartAbandoned: "",
    },
  },
  routes: {
    registerPath: "/programs/ekuzo101/register",
    programSlug: "ekuzo101",
  },
  squad: { writesSquadRows: false },
  // Strategy callbacks — minimal implementations for Sheets row shape
  buildGamerSummary(gamer: MetadataGamer, meta: WebhookMetadata): string {
    return `${gamer.firstName} ${gamer.lastName} — ${meta.weeks_label || ""}`;
  },
  buildBeehiivCustomFields(_meta: WebhookMetadata, _ctx: WebhookContext) {
    return []; // Custom fields built inline in the register route
  },
  buildKlaviyoProfileProperties(_meta: WebhookMetadata, _ctx: WebhookContext) {
    return {}; // Built inline in the register route
  },
  buildKlaviyoOrderProperties(_meta: WebhookMetadata, _ctx: WebhookContext) {
    return {};
  },
  buildPurchaseRowCohortFields(_gamer: MetadataGamer, meta: WebhookMetadata): PurchaseRowCohortFields {
    return {
      week: meta.weeks_label || "",
      slot: "",
      week_dates: meta.week_dates_span || "", // "Tue Jul 21 - Thu Aug 20"
    };
  },
  buildSquadsRowFields(gamers: MetadataGamer[], _meta: WebhookMetadata): SquadsRowFields {
    return {
      ownerGamerName: gamers[0]?.firstName || "",
      week: "",
      slot: "",
      week_dates: "",
      cohort_month: "",
      cohort_label: "",
      cohort_start: "",
      cohort_end: "",
    };
  },
  buildSquadMemberRowFields(_gamer: MetadataGamer, _meta: WebhookMetadata): SquadMemberRowFields {
    return {
      member_week: "",
      member_slot: "",
      member_cohort_month: "",
      member_cohort_label: "",
    };
  },
};
