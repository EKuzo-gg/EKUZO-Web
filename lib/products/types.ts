/**
 * Product registry — Phase 1 of the Teams convergence (see
 * marketing/teams-redesign/01-teams-convergence-handoff.md §3 Seam 1 and
 * §4 Phase 1).
 *
 * Single typed config per product declaring everything that varies
 * across camps / ekuzo100 / teams. Replaces `product === "x" ? … : …`
 * ternaries scattered across the webhook, register, lead, and abandoned
 * routes with `PRODUCTS[id].field` reads.
 *
 * **Phase 1 scope (this commit):** the four obviously-shared fields named
 * in the handoff's recommended first move — `programName`,
 * `welcomeAutomationId`, Beehiiv `tags`, Beehiiv `referringSites`.
 * Phase 2+ will extend this interface with cohort vocab, route paths,
 * pricing, and squad pre-pin shape (see handoff §3).
 *
 * **Do not add fields here that aren't read by ≥2 callers.** The whole
 * point of the registry is to deduplicate; a single-caller field belongs
 * in the caller.
 */

export type ProductId = "camps" | "ekuzo100" | "teams";

export type CohortUnit = "week" | "month" | "semester";

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
}
