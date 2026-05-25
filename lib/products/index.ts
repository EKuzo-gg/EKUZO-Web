/**
 * Product registry public entry point.
 *
 * Usage:
 *   import { getProductFromMeta, PRODUCTS } from "@/lib/products";
 *   const productConfig = getProductFromMeta(meta.product);
 *   const tags = productConfig.beehiiv.tags.purchased;
 *
 * See lib/products/types.ts for the full interface.
 */

import { campsProduct } from "./camps";
import { ekuzo100Product } from "./ekuzo100";
import { teamsProduct } from "./teams";
import type { ProductConfig, ProductId } from "./types";

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  camps: campsProduct,
  ekuzo100: ekuzo100Product,
  teams: teamsProduct,
};

/**
 * Resolve a `meta.product` string (as stored in Stripe PI metadata) to a
 * typed ProductConfig. Preserves the pre-registry webhook fallback
 * behavior: unknown / missing values resolve to camps for backward
 * compatibility with any legacy PI that doesn't carry an explicit
 * `product` key. This MUST stay aligned with the
 * `const product = meta.product || "camps"` + downstream ternary
 * fallthrough pattern the webhook used pre-Phase 1 — Phase 1's parity
 * gate depends on byte-identical output for those legacy events.
 */
export function getProductFromMeta(
  metaProduct: string | undefined
): ProductConfig {
  if (metaProduct === "ekuzo100") return ekuzo100Product;
  if (metaProduct === "teams") return teamsProduct;
  return campsProduct;
}

export type {
  BeehiivCustomField,
  CohortUnit,
  MetadataGamer,
  ProductConfig,
  ProductId,
  PurchaseRowCohortFields,
  SquadMemberRowFields,
  SquadsRowFields,
  WebhookContext,
  WebhookMetadata,
} from "./types";
