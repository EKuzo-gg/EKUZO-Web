/**
 * Product registry — Teams convergence (see
 * marketing/teams-redesign/01-teams-convergence-handoff.md §3 Seam 1 and
 * §4 Phase 1 + Phase 2).
 *
 * Single typed config per product declaring everything that varies
 * across camps / ekuzo100 / teams. Replaces `product === "x" ? … : …`
 * ternaries scattered across the webhook, register, lead, and abandoned
 * routes with `PRODUCTS[id].field` reads or per-product strategy calls.
 *
 * **Phase 1 scope:** the four obviously-shared fields named in the
 * handoff's recommended first move — `programName`, `welcomeAutomationId`,
 * Beehiiv `tags`, Beehiiv `referringSites`.
 *
 * **Phase 2 scope (this commit):** webhook strategy map. Per-product
 * route paths + program slug (`routes`), squad write gating (`squad`),
 * and seven builder callbacks that produce the per-product portions of
 * every webhook surface (Beehiiv custom_fields, Klaviyo profile props,
 * Klaviyo Placed Order props, gamer summary string, Sheets purchase
 * row's week/slot/week_dates, Sheets squads row, Sheets squad_members
 * row). See marketing/teams-redesign/02-baseline.md §2 for the golden
 * payloads each strategy must reproduce for camps + e100.
 *
 * **Do not add fields here that aren't read by ≥2 callers OR explicitly
 * needed for product-strategy parameterization.** The whole point of the
 * registry is to deduplicate.
 */

export type ProductId = "camps" | "ekuzo100" | "teams";

export type CohortUnit = "week" | "month" | "semester";

/**
 * Stripe metadata is `Record<string, string>`. Aliased here so strategy
 * signatures are self-documenting.
 */
export type WebhookMetadata = Record<string, string>;

/**
 * Shape of each gamer after reconstruction from Stripe PI metadata.
 * Established by the register routes (camps/ekuzo100/teams) when they
 * JSON.stringify each gamer into `meta.gamer_{i}`, then parsed back by
 * the webhook. All fields optional — a malformed metadata value parses
 * to `{}`.
 *
 * Lives in the registry (not the webhook) because it's shared by every
 * strategy callback and will be shared by Phase 3's `lib/registerIntent`
 * helper too.
 */
export type MetadataGamer = {
  firstName?: string;
  lastName?: string;
  gamerTag?: string;
  weekLabel?: string;
  weekDates?: string;
  slot?: string;
  slotHours?: string;
  price?: number;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  preferredGames?: string;
  schedulePreference?: string;
  timePreference?: string;
  firstSemester?: string;
};

/**
 * Beehiiv `referring_site` values per surface. These are EKUZO-internal
 * labels (not UTMs) — they segment Beehiiv subscribers by funnel stage
 * so cart-abandonment / welcome / re-engagement automations can target
 * the right group.
 */
export interface BeehiivReferringSites {
  /** Post-purchase webhook subscribe call. */
  purchase: string;
  /** /api/{product}/lead — email captured onBlur, parent hasn't paid. */
  formStarted: string;
  /** /api/{product}/abandoned — PI created, parent hasn't entered card. */
  cartAbandoned: string;
}

/**
 * Beehiiv tags per funnel stage. Applied via the dedicated
 * `/subscriptions/:id/tags` POST endpoint (Beehiiv's subscribe endpoint
 * silently ignores a `tags` field — CLAUDE.md API quirks).
 *
 * `purchased` is multiple tags because the webhook applies both a
 * lifecycle tag (`*-purchased`) and a source tag (`source-*`) so paid
 * customers can be segmented by acquisition surface.
 */
export interface BeehiivTags {
  /** Webhook applies on payment_intent.succeeded. */
  purchased: readonly string[];
  /** Lead route applies on email-on-blur. */
  formStarted: string;
  /** Abandoned route applies after PI creation, before card entry. */
  cartAbandoned: string;
}

/**
 * Pre-computed values the webhook derives once at the top of the
 * payment_intent.succeeded handler. Passed as a single context object
 * to per-surface strategy builders so each builder receives a
 * consistent snapshot — no recomputation, no shared mutable state.
 *
 * Camps-specific fields (`squadStatusLabel`, `earliestWeek*`) are `""`
 * for ekuzo100 / teams; the strategies that consume them are gated by
 * product so non-camps strategies simply ignore the empty values.
 */
export interface WebhookContext {
  /** `{siteUrl}{registerPath}?squad={token}` when a token is present, else "". */
  squadLink: string;
  /** Camps: "Building a squad" | "Looking for a squad" | "". Empty elsewhere. */
  squadStatusLabel: string;
  /** Camps: earliest week as a numeric string (e.g. "1"), "" if no gamers. Empty elsewhere. */
  earliestWeek: string;
  /** Camps: AM | PM for the earliest-week gamer. Empty elsewhere. */
  earliestSlot: string;
  /** Camps: weekDates string (e.g. "Jun 15-19") for the earliest-week gamer. Empty elsewhere. */
  earliestWeekDates: string;
}

/**
 * Per-gamer fields the webhook writes into the `ekuzo-purchases` Sheets
 * row's cohort triplet (`week`, `slot`, `week_dates`). The Apps Script
 * writes by header name, so column order doesn't matter — only the keys
 * matter. The `week` column is overloaded: camps stores `weekLabel`,
 * e100 stores `cohort_label`, teams stores `semester_label`. Known
 * mapping quirk — see baseline §2E.
 */
export interface PurchaseRowCohortFields {
  week: string;
  slot: string;
  week_dates: string;
}

/**
 * Fields the webhook writes into the `squads` Sheets row when a
 * registration mints a `squad_token`. The Apps Script tab is product-
 * aware via the `product` discriminator column (added 2026-05-25);
 * camps/e100/teams share the table with the other product's fields
 * empty.
 *
 * `ownerGamerName` is selected per-product: camps = earliest-week
 * gamer, e100/teams = first gamer in the registration.
 */
export interface SquadsRowFields {
  ownerGamerName: string;
  /** Camps fields (empty for e100/teams). */
  week: string;
  slot: string;
  week_dates: string;
  /** E100 fields (empty for camps/teams). */
  cohort_month: string;
  cohort_label: string;
  cohort_start: string;
  cohort_end: string;
}

/**
 * Per-gamer fields the webhook writes into the `squad_members` Sheets
 * row when a registration arrives via someone else's crew link
 * (`meta.joining_squad_token` present).
 */
export interface SquadMemberRowFields {
  member_week: string;
  member_slot: string;
  member_cohort_month: string;
  member_cohort_label: string;
}

/**
 * Beehiiv `custom_fields` entry — a flat `{ name, value }` pair the
 * Beehiiv subscribe endpoint expects.
 */
export interface BeehiivCustomField {
  name: string;
  value: string;
}

export interface ProductConfig {
  id: ProductId;
  cohortUnit: CohortUnit;
  /**
   * Human-readable program label. Used by:
   * - Beehiiv `program` custom field
   * - Klaviyo `program` profile property + `product` event property
   */
  programName: string;
  /**
   * Beehiiv automation ID for the post-purchase welcome sequence.
   * Passed to the subscribe endpoint as `automation_ids: [this]`.
   */
  welcomeAutomationId: string;
  beehiiv: {
    referringSites: BeehiivReferringSites;
    tags: BeehiivTags;
  };
  /**
   * Route paths used to build URLs for cross-surface use.
   * - `registerPath`: used in `{siteUrl}{registerPath}?squad={token}`
   *   (Beehiiv `squad_link`, Klaviyo `squad_link`).
   * - `programSlug`: used in Meta CAPI `event_source_url`
   *   (`https://ekuzo.gg/programs/{programSlug}/success`).
   */
  routes: {
    registerPath: string;
    programSlug: string;
  };
  /**
   * Squad write gating. Camps + e100 currently write rows to the
   * `squads` / `squad_members` Sheets tabs. Teams writes too (Phase 2
   * wired the path; tokens land once Phase 3's register API helper
   * starts minting them — until then the rows aren't written because
   * the guard checks `meta.squad_token` / `meta.joining_squad_token`
   * which are empty for teams pre-Phase-3).
   */
  squad: {
    writesSquadRows: boolean;
  };
  /**
   * Build the per-gamer summary string used in Beehiiv
   * `registration_summary` custom field AND Klaviyo `registration_summary`
   * profile property (identical shape for both callers — Phase 2's
   * recommended first move per 03-phase1-registry.md §5).
   *
   * Camps:    "Alex F — Week 01 AM (Jun 15-19)"
   * E100:     "Alex F — Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"
   * Teams:    "Alex F — Fall 2026"
   */
  buildGamerSummary(gamer: MetadataGamer, meta: WebhookMetadata): string;
  /**
   * Product-specific Beehiiv `custom_fields` entries to APPEND to the
   * shared base set. The webhook builds the shared base inline (parent
   * info, gamer summary, attribution, etc.) and concatenates this
   * product-specific list.
   *
   * Camps:    camp_week, camp_slot, squad_status, squad_link
   * E100:     cohort_label, preferred_days, squad_link
   * Teams:    team_semester, team_payment_plan, squad_link
   */
  buildBeehiivCustomFields(meta: WebhookMetadata, ctx: WebhookContext): BeehiivCustomField[];
  /**
   * Product-specific Klaviyo profile property extras (merged onto the
   * shared base klaviyoProperties object).
   *
   * Camps:    camp_week, camp_slot, camp_week_dates, squad_status, squad_link
   * E100:     cohort_label, cohort_start, cohort_end, preferred_days, squad_link
   * Teams:    team_semester, team_payment_plan, squad_link
   */
  buildKlaviyoProfileProperties(meta: WebhookMetadata, ctx: WebhookContext): Record<string, string>;
  /**
   * Product-specific Klaviyo `Placed Order` event property extras
   * (spread onto the event's shared properties object).
   *
   * Camps:    camp_week, camp_slot, camp_week_dates, squad_status, squad_link
   * E100:     cohort_label, squad_link  (intentionally omits cohort_start/end
   *           — cohort_label is self-contained, start/end would be redundant
   *           in the email layer per baseline §2D)
   * Teams:    team_semester, team_payment_plan, squad_link
   */
  buildKlaviyoOrderProperties(meta: WebhookMetadata, ctx: WebhookContext): Record<string, unknown>;
  /**
   * Per-gamer Sheets purchase-row cohort fields. The Apps Script writes
   * by header name into the `ekuzo-purchases` tab. The `week` column is
   * overloaded — see PurchaseRowCohortFields jsdoc.
   */
  buildPurchaseRowCohortFields(gamer: MetadataGamer, meta: WebhookMetadata): PurchaseRowCohortFields;
  /**
   * Per-registration `squads` Sheets row fields when `meta.squad_token`
   * is present. Owner selection (earliest-week vs. first gamer) is
   * product-specific; the cohort fields differ too. Camps fields are
   * empty for e100/teams and vice versa.
   */
  buildSquadsRowFields(gamers: MetadataGamer[], meta: WebhookMetadata): SquadsRowFields;
  /**
   * Per-gamer `squad_members` Sheets row fields when
   * `meta.joining_squad_token` is present. Camps fields are empty for
   * e100/teams and vice versa.
   */
  buildSquadMemberRowFields(gamer: MetadataGamer, meta: WebhookMetadata): SquadMemberRowFields;
}
