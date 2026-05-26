import type {
  MetadataGamer,
  ProductConfig,
  PurchaseRowCohortFields,
  SquadMemberRowFields,
  SquadsRowFields,
  WebhookContext,
  WebhookMetadata,
} from "./types";

/**
 * Teams config. The webhook arm exists today; lead/abandoned routes are
 * Phase 4 deliverables. The tag + referring_site values for the not-yet-
 * built surfaces follow the established naming pattern
 * (`ekuzo-teams-*` for Beehiiv referring sites, `form_started_teams` /
 * `cart_abandoned_teams` for tags) so the Phase 4 routes can be wired in
 * by reading from this config without further coordination.
 *
 * Phase 2 adds: squad_link surfacing in Beehiiv + Klaviyo payloads, and
 * squad row writes to the Sheets `squads` / `squad_members` tabs.
 * Tokens land once Phase 3's register API helper starts minting them —
 * until then the squad writes are guarded by `meta.squad_token` /
 * `meta.joining_squad_token` (empty for teams pre-Phase-3, so the rows
 * aren't actually written yet). Apps Script may need a redeploy to
 * accept `"teams"` as a `product` discriminator value — coordinated
 * with Jamie per handoff §6.
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
  routes: {
    registerPath: "/programs/ekuzo-teams/register",
    programSlug: "ekuzo-teams",
  },
  squad: {
    writesSquadRows: true,
  },
  buildGamerSummary(gamer: MetadataGamer, meta: WebhookMetadata): string {
    return `${gamer.firstName} ${gamer.lastName} — ${meta.semester_label || "Fall 2026"}`;
  },
  buildBeehiivCustomFields(meta: WebhookMetadata, ctx: WebhookContext) {
    return [
      { name: "team_semester", value: meta.semester_label || "Fall 2026" },
      { name: "team_payment_plan", value: meta.payment_plan || "upfront" },
      { name: "squad_link", value: ctx.squadLink },
    ];
  },
  buildKlaviyoProfileProperties(meta: WebhookMetadata, ctx: WebhookContext) {
    return {
      team_semester: meta.semester_label || "Fall 2026",
      team_payment_plan: meta.payment_plan || "upfront",
      squad_link: ctx.squadLink,
    };
  },
  buildKlaviyoOrderProperties(meta: WebhookMetadata, ctx: WebhookContext) {
    return {
      team_semester: meta.semester_label || "Fall 2026",
      team_payment_plan: meta.payment_plan || "upfront",
      squad_link: ctx.squadLink,
    };
  },
  buildPurchaseRowCohortFields(_gamer: MetadataGamer, meta: WebhookMetadata): PurchaseRowCohortFields {
    return {
      week: meta.semester_label || "Fall 2026",
      slot: meta.payment_plan || "",
      week_dates: "Week of Aug 31, 2026",
    };
  },
  buildSquadsRowFields(gamers: MetadataGamer[]): SquadsRowFields {
    // Teams: owner = first gamer (single-semester cohort, no
    // earliest-week concept). Both camps and e100 cohort fields are
    // empty — teams uses neither shape. Apps Script reads `product`
    // and knows to look only at the shared fields (squad_token,
    // owner_*, created_at).
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
  buildSquadMemberRowFields(): SquadMemberRowFields {
    return {
      member_week: "",
      member_slot: "",
      member_cohort_month: "",
      member_cohort_label: "",
    };
  },
};
