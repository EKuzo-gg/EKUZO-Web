import type {
  MetadataGamer,
  ProductConfig,
  PurchaseRowCohortFields,
  SquadMemberRowFields,
  SquadsRowFields,
  WebhookContext,
  WebhookMetadata,
} from "./types";

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
  routes: {
    registerPath: "/programs/ekuzo-camps/register",
    programSlug: "ekuzo-camps",
  },
  squad: {
    writesSquadRows: true,
  },
  buildGamerSummary(gamer: MetadataGamer): string {
    return `${gamer.firstName} ${gamer.lastName} — ${gamer.weekLabel} ${gamer.slot} (${gamer.weekDates})`;
  },
  buildBeehiivCustomFields(_meta: WebhookMetadata, ctx: WebhookContext) {
    return [
      { name: "camp_week", value: ctx.earliestWeek },
      { name: "camp_slot", value: ctx.earliestSlot },
      { name: "squad_status", value: ctx.squadStatusLabel },
      { name: "squad_link", value: ctx.squadLink },
    ];
  },
  buildKlaviyoProfileProperties(_meta: WebhookMetadata, ctx: WebhookContext) {
    return {
      camp_week: ctx.earliestWeek,
      camp_slot: ctx.earliestSlot,
      camp_week_dates: ctx.earliestWeekDates,
      squad_status: ctx.squadStatusLabel,
      squad_link: ctx.squadLink,
    };
  },
  buildKlaviyoOrderProperties(_meta: WebhookMetadata, ctx: WebhookContext) {
    return {
      camp_week: ctx.earliestWeek,
      camp_slot: ctx.earliestSlot,
      camp_week_dates: ctx.earliestWeekDates,
      squad_status: ctx.squadStatusLabel,
      squad_link: ctx.squadLink,
    };
  },
  buildPurchaseRowCohortFields(gamer: MetadataGamer): PurchaseRowCohortFields {
    return {
      week: gamer.weekLabel || "",
      slot: gamer.slot || "",
      week_dates: gamer.weekDates || "",
    };
  },
  buildSquadsRowFields(gamers: MetadataGamer[]): SquadsRowFields {
    // Camps: owner = earliest-week gamer (matches Beehiiv / Klaviyo
    // earliestWeek logic used elsewhere in the webhook). Single pass
    // over gamers; tracks min week number and snapshots the gamer's
    // identifying fields when a new min is found.
    let minWeek = Infinity;
    let ownerGamerName = "";
    let ownerWeekLabel = "";
    let ownerSlot = "";
    let ownerWeekDates = "";
    for (const g of gamers) {
      const weekNum = parseInt(g.weekLabel?.replace(/\D/g, "") || "99", 10);
      if (weekNum < minWeek) {
        minWeek = weekNum;
        ownerGamerName = g.firstName || "";
        ownerWeekLabel = g.weekLabel || "";
        ownerSlot = g.slot || "";
        ownerWeekDates = g.weekDates || "";
      }
    }
    return {
      ownerGamerName,
      week: ownerWeekLabel,
      slot: ownerSlot,
      week_dates: ownerWeekDates,
      cohort_month: "",
      cohort_label: "",
      cohort_start: "",
      cohort_end: "",
    };
  },
  buildSquadMemberRowFields(gamer: MetadataGamer): SquadMemberRowFields {
    return {
      member_week: gamer.weekLabel || "",
      member_slot: gamer.slot || "",
      member_cohort_month: "",
      member_cohort_label: "",
    };
  },
};
