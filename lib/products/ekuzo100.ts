import type {
  MetadataGamer,
  ProductConfig,
  PurchaseRowCohortFields,
  SquadMemberRowFields,
  SquadsRowFields,
  WebhookContext,
  WebhookMetadata,
} from "./types";

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
  routes: {
    registerPath: "/programs/ekuzo100/register",
    programSlug: "ekuzo100",
  },
  squad: {
    writesSquadRows: true,
  },
  buildGamerSummary(gamer: MetadataGamer, meta: WebhookMetadata): string {
    // cohort_label is now a complete human-readable schedule string
    // (e.g. "Tuesdays & Thursdays · June 2 – June 25") produced by the
    // register-page picker. schedulePreference retired 2026-05-24 —
    // only one session time runs today (7-8:30 PM).
    return `${gamer.firstName} ${gamer.lastName} — ${meta.cohort_label || ""}`;
  },
  buildBeehiivCustomFields(meta: WebhookMetadata, ctx: WebhookContext) {
    // E100 inherits the squad_link rule from camps (every purchase has
    // a working link). cohort_label is the customer-facing schedule
    // string; preferred_days is the internal demand signal from the
    // "Prefer other days?" disclosure (NOT surfaced in the confirmation
    // email).
    return [
      { name: "cohort_label", value: meta.cohort_label || "" },
      { name: "preferred_days", value: meta.preferred_days || "" },
      { name: "squad_link", value: ctx.squadLink },
    ];
  },
  buildKlaviyoProfileProperties(meta: WebhookMetadata, ctx: WebhookContext) {
    return {
      cohort_label: meta.cohort_label || "",
      cohort_start: meta.cohort_start || "",
      cohort_end: meta.cohort_end || "",
      preferred_days: meta.preferred_days || "",
      squad_link: ctx.squadLink,
    };
  },
  buildKlaviyoOrderProperties(meta: WebhookMetadata, ctx: WebhookContext) {
    // squad_link: needed by the "Bring your crew" block in the e100
    // confirmation email. cohort_start/end intentionally NOT included —
    // cohort_label is a self-contained schedule string and the
    // start/end pair would be redundant noise in the email layer.
    return {
      cohort_label: meta.cohort_label || "",
      squad_link: ctx.squadLink,
    };
  },
  buildPurchaseRowCohortFields(_gamer: MetadataGamer, meta: WebhookMetadata): PurchaseRowCohortFields {
    // The `week` column is overloaded — for e100 it carries the
    // cohort_label string. Known mapping quirk; see baseline §2E.
    // E100 has a single session time (7-8:30 PM) — no slot concept.
    return {
      week: meta.cohort_label || "",
      slot: "",
      week_dates: `${meta.cohort_start || ""} – ${meta.cohort_end || ""}`,
    };
  },
  buildSquadsRowFields(gamers: MetadataGamer[], meta: WebhookMetadata): SquadsRowFields {
    // E100: all gamers share one cohort, owner = first gamer (no
    // earliest-week concept). Cohort fields populated; camps fields
    // empty.
    return {
      ownerGamerName: gamers[0]?.firstName || "",
      week: "",
      slot: "",
      week_dates: "",
      cohort_month: meta.cohort_month || "",
      cohort_label: meta.cohort_label || "",
      cohort_start: meta.cohort_start || "",
      cohort_end: meta.cohort_end || "",
    };
  },
  buildSquadMemberRowFields(_gamer: MetadataGamer, meta: WebhookMetadata): SquadMemberRowFields {
    // The cohort lives at the registration level, but we stamp each
    // member row so a single-tab FILTER by token surfaces the schedule
    // without joining back to the squads tab.
    return {
      member_week: "",
      member_slot: "",
      member_cohort_month: meta.cohort_month || "",
      member_cohort_label: meta.cohort_label || "",
    };
  },
};
