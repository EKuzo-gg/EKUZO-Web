import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createHash } from "crypto";
import { getProductFromMeta } from "@/lib/products";
import type { MetadataGamer, WebhookContext } from "@/lib/products/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY!;
const KLAVIYO_PURCHASERS_LIST_ID = "V4Uf7N";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. On `payment_intent.succeeded`:
 * 1. Detects product type from metadata (camps, ekuzo100, etc.)
 * 2. Adds the parent as a Beehiiv subscriber with product-specific custom fields + tags
 * 3. Writes registration data to Google Sheets (one row per gamer)
 * 4. Beehiiv handles all post-registration email automation
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // ── Verify webhook signature ──────────────────────────────────────
  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && webhookSecret !== "whsec_...") {
    try {
      event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err) {
      console.error(
        "Webhook signature verification failed:",
        err instanceof Error ? err.message : err
      );
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }
  } else {
    console.warn("⚠️  Stripe webhook secret not set — skipping signature verification");
    event = JSON.parse(body) as Stripe.Event;
  }

  // ── Handle payment_intent.succeeded ───────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const meta = paymentIntent.metadata;
    const product = meta.product || "camps"; // default to camps for backward compat
    // Teams convergence Phase 1 + 2: shared product config and per-
    // surface strategy map. `productConfig` carries the labels, tags,
    // automation IDs, referring sites, route paths, squad write
    // flags, AND the per-product builder callbacks (`buildGamerSummary`,
    // `buildBeehiivCustomFields`, `buildKlaviyoProfileProperties`,
    // `buildKlaviyoOrderProperties`, `buildPurchaseRowCohortFields`,
    // `buildSquadsRowFields`, `buildSquadMemberRowFields`). The
    // remaining `product === "..."` references in this file are
    // diagnostic (logs) or write through `product` as a string column
    // value (Sheets `product` discriminator) — not branch logic.
    const productConfig = getProductFromMeta(product);

    // ── Mode isolation ─────────────────────────────────────────────
    // Webhook skips events whose Stripe mode doesn't match this deploy's
    // Stripe key mode. Prevents a live PI from being processed by a
    // deploy configured with test keys (and vice versa).
    //
    // Replaced earlier process.env.CONTEXT check because Netlify's
    // CONTEXT env var doesn't reliably reach Next.js function runtime,
    // causing false positive skips. paymentIntent.livemode +
    // STRIPE_SECRET_KEY prefix are both deterministic.
    const isLiveStripe = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
    const isLivePI = paymentIntent.livemode;
    if (isLiveStripe !== isLivePI) {
      console.log(
        `⏭️  Skipping ${paymentIntent.id}: Stripe mode mismatch (key live=${isLiveStripe}, PI live=${isLivePI})`
      );
      return NextResponse.json({ received: true, skipped: "stripe_mode_mismatch" });
    }

    console.log(`✅ Payment succeeded: ${paymentIntent.id} [${product}] [mode: ${isLiveStripe ? "live" : "test"}]`);
    console.log("   Parent:", meta.parent_first_name, meta.parent_last_name);
    console.log("   Email:", meta.parent_email);
    console.log("   Gamers:", meta.gamer_count);

    // ── Extract billing location + ZIP + receipt number from Stripe charge ─
    // We fetch the charge once and reuse it. receipt_number is Stripe's
    // customer-facing order ID (format: 1234-5678) — cleaner than the
    // pi_... identifier for customer-facing emails. postalCode is sourced
    // from Stripe Elements' billing_details (collected at payment time, so
    // not available pre-payment in PI metadata) and used for Meta CAPI
    // `zp` to lift match quality.
    let location = "";
    let postalCode = "";
    let receiptNumber = "";
    try {
      const charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
      const charge = charges.data[0];
      const billing = charge?.billing_details?.address;
      if (billing) {
        location = [billing.city, billing.state, billing.country]
          .filter(Boolean)
          .join(", ");
        postalCode = billing.postal_code || "";
      }
      receiptNumber = charge?.receipt_number || "";
    } catch (err) {
      console.warn("Could not fetch charge data:", err);
    }

    // ── Marketing attribution + acquisition source ─────────────────
    // UTMs come from PI metadata (set by /api/{camps,ekuzo100}/register
    // from the first-touch sessionStorage payload). acquisition_source is
    // derived once here so every downstream surface (Sheets, Klaviyo,
    // Beehiiv) shares one definition. Friday's paid-signups read can roll
    // up by this single field instead of reverse-engineering UTMs.
    const utmSource = meta.utm_source || "";
    const utmMedium = meta.utm_medium || "";
    const utmCampaign = meta.utm_campaign || "";
    const utmContent = meta.utm_content || "";
    const utmTerm = meta.utm_term || "";

    // First-touch acquisition origin — classified by middleware.ts, set
    // in the ekuzo_origin cookie, threaded here via PI metadata. Phase 1
    // is measurement only: written to the Klaviyo profile + Sheets row,
    // no Meta / CAPI side effects. Defaults to "unknown" for old/test
    // payments created before this shipped (graceful degrade).
    const origin = meta.origin || "unknown";

    let acquisitionSource: "meta_paid" | "referral" | "organic";
    if (utmSource === "meta" && utmMedium === "paid") {
      acquisitionSource = "meta_paid";
    } else if (meta.joining_squad_token) {
      // Squad-link arrivals are referrals (existing logic; preserved).
      acquisitionSource = "referral";
    } else {
      acquisitionSource = "organic";
    }

    // Customer-facing order ID used in Klaviyo + Beehiiv templates.
    // Prefer Stripe's auto-generated receipt_number (clean format:
    // 1234-5678, piggybacks on an already-unique number — no counter
    // to maintain). Fall back to last 8 of PI for test-mode charges
    // where receipt_number may not be populated yet.
    const orderId = receiptNumber
      ? `EKZ-${receiptNumber}`
      : `EKZ-${paymentIntent.id.slice(-8).toUpperCase()}`;

    // ── Parse gamer data ─────────────────────────────────────────
    const gamerCount = parseInt(meta.gamer_count || "0", 10);
    const gamers: MetadataGamer[] = [];
    for (let i = 0; i < gamerCount; i++) {
      try {
        gamers.push(JSON.parse(meta[`gamer_${i}`] || "{}") as MetadataGamer);
      } catch {
        gamers.push({});
      }
    }

    // ── Reassemble additional_info from chunked metadata ─────────
    let additionalInfo = meta.additional_info || "";
    if (meta.additional_info_2) additionalInfo += meta.additional_info_2;
    if (meta.additional_info_3) additionalInfo += meta.additional_info_3;

    // ── Squad status (camps only) — transform code → label ──────
    // Raw values from the form: "building" | "looking" | ""
    // Stored in Sheets + Beehiiv as human-readable labels so ops can
    // read them without a legend.
    const squadStatusCode = meta.squad_status || "";
    const squadStatusLabel =
      squadStatusCode === "building"
        ? "Building a squad"
        : squadStatusCode === "looking"
          ? "Looking for a squad"
          : "";

    // Squad link (camps) — "build your squad" is universal: EVERY camps
    // purchase surfaces a shareable link, no exceptions.
    //  • A normal buyer mints their own squad_token at register time and
    //    shares that.
    //  • A buyer who arrived via someone else's link is a joiner — they
    //    carry joining_squad_token and have no squad_token of their own.
    //    They share that SAME crew link, so the squad stays one group and
    //    every member can keep recruiting into it.
    // Either way the buyer leaves with a working link. Without this the
    // joiner's confirmation email "Bring your crew" block would be blank.
    //
    // Host comes from NEXT_PUBLIC_SITE_URL so dev preview / branch
    // previews share their own link host. Trailing slash trimmed so the
    // path concatenation is consistent.
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ekuzo.gg").replace(/\/$/, "");
    const shareableSquadToken = meta.squad_token || meta.joining_squad_token || "";
    // Product-aware squad link path — sourced from the registry
    // (Phase 2). A camps squad joins via the camps register page, e100
    // via e100, teams via teams. Pre-Phase-3 teams doesn't mint tokens,
    // so shareableSquadToken is "" and squadLink resolves to "" — the
    // path is wired but inert until tokens flow through.
    const squadLink = shareableSquadToken
      ? `${siteUrl}${productConfig.routes.registerPath}?squad=${shareableSquadToken}`
      : "";

    // ── Pre-pass over gamers ─────────────────────────────────────
    // Derives the camps-only "earliest" values (week / slot /
    // week_dates) and the shared `allGamerNames` list in a single
    // loop. Camps earliest fields feed the WebhookContext consumed by
    // every per-surface strategy; for e100/teams these stay at the
    // empty-string default and the per-product strategies ignore them.
    const allGamerNames: string[] = [];
    let earliestWeekNum = Infinity;
    let earliestSlot = "";
    let earliestWeekDates = "";
    for (const g of gamers) {
      if (g.firstName) allGamerNames.push(g.firstName);
      if (product === "camps") {
        const weekNum = parseInt(g.weekLabel?.replace(/\D/g, "") || "99", 10);
        if (weekNum < earliestWeekNum) {
          earliestWeekNum = weekNum;
          earliestSlot = g.slot || "";
          earliestWeekDates = g.weekDates || "";
        }
      }
    }
    const earliestWeek = earliestWeekNum === Infinity ? "" : String(earliestWeekNum);

    // ── Webhook strategy context (Phase 2) ───────────────────────
    // One snapshot of derived values, passed to every per-product
    // strategy builder. Keeps strategies pure (read-only) and
    // guarantees Beehiiv / Klaviyo / Sheets all see the same values
    // from the same input event.
    const ctx: WebhookContext = {
      squadLink,
      squadStatusLabel,
      earliestWeek,
      earliestSlot,
      earliestWeekDates,
    };

    // Gamer summaries — used by both Beehiiv `registration_summary`
    // custom field AND Klaviyo `registration_summary` profile/order
    // property. Single source of truth; same string both places.
    const gamerSummaries = gamers.map((g) =>
      productConfig.buildGamerSummary(g, meta)
    );

    // ── Enroll in Beehiiv ──────────────────────────────────────────
    try {
      // Product-specific Beehiiv fields — sourced from lib/products
      // registry (Phase 1 of the Teams convergence). Values match
      // pre-Phase-1 ternary output byte-for-byte; see
      // marketing/teams-redesign/02-baseline.md §2A/§2B.
      const programName = productConfig.programName;
      // Internal Beehiiv referrer label (legacy, used pre-UTM-attribution).
      // NOTE: this used to be named `utmSource` and shadowed the actual UTM
      // captured up-top at line ~138 — meaning the Beehiiv `utm_source` payload
      // was being set to "ekuzo-camps-registration" instead of the real UTM
      // from the ad. Renamed to make the distinction unmistakable. Kept as
      // `referring_site` on the Beehiiv payload so the legacy "where did this
      // subscriber come from internally" signal still lands somewhere.
      // Sourced from lib/products registry (Phase 1).
      const beehiivReferringSite = productConfig.beehiiv.referringSites.purchase;

      // Tags per product — sourced from lib/products registry (Phase 1).
      // Values match pre-Phase-1 ternary output exactly; see baseline §2A/§2B.
      const tags = productConfig.beehiiv.tags.purchased;

      // Build custom fields — shared base + product-specific
      // NOTE: the 6 attribution fields below (acquisition_source +
      // 5 UTMs) need to exist as Beehiiv custom fields on the publication
      // for Beehiiv to actually persist their values. Beehiiv silently
      // drops unknown custom_fields entries (no error on the API call).
      // Sheets + Klaviyo are the source of truth for the Friday paid
      // signups read; Beehiiv attribution is best-effort for segmentation.
      const customFields: { name: string; value: string }[] = [
        { name: "first_name", value: meta.parent_first_name || "" },
        { name: "last_name", value: meta.parent_last_name || "" },
        { name: "phone", value: meta.parent_phone || "" },
        { name: "program", value: programName },
        { name: "gamer_name", value: allGamerNames.join(", ") },
        { name: "gamer_count", value: meta.gamer_count || "1" },
        { name: "registration_summary", value: gamerSummaries.join(" | ").slice(0, 500) },
        { name: "payment_intent_id", value: paymentIntent.id },
        { name: "order_id", value: orderId },
        { name: "amount_paid", value: `$${(paymentIntent.amount / 100).toFixed(2)}` },
        { name: "timezone", value: meta.timezone || "" },
        { name: "location", value: location },
        { name: "acquisition_source", value: acquisitionSource },
        // Landing-page CTA placement that produced this purchase
        // ("hero" | "sticky" | "footer" | ""). The matching Beehiiv text
        // custom field must exist on the publication; if it doesn't,
        // Beehiiv silently drops this entry per the API quirk noted in
        // CLAUDE.md.
        { name: "cta_source", value: meta.cta_source || "" },
        // Beehiiv reserves utm_* as native top-level params (see beehiivPayload
        // below). Don't add them to custom_fields — Beehiiv rejects creating
        // custom fields with reserved names ("Name is a reserved field"), so
        // this list silently drops on the API side. Top-level utm_* params
        // feed Beehiiv's native acquisition tracking (Subscribers detail →
        // Acquisition Source), and you can segment on `utm_source` directly.
      ];

      // Per-product extras — sourced from the registry strategy
      // (Phase 2). Camps / e100 outputs are byte-identical to the
      // pre-Phase-2 ternary; teams now appends `squad_link` (empty
      // until Phase 3 mints tokens, but the wire is in place).
      customFields.push(...productConfig.buildBeehiivCustomFields(meta, ctx));

      // Product-specific welcome automation — sourced from lib/products
      // registry (Phase 1). Camps / e100 / teams automation IDs are
      // canonical there; this read replaces a hand-maintained ternary.
      const automationId = productConfig.welcomeAutomationId;

      const beehiivPayload = {
        email: meta.parent_email,
        reactivate_existing: true,
        send_welcome_email: true,
        // All 5 UTMs go top-level so Beehiiv's native acquisition tracker
        // captures them (Subscribers → detail → Acquisition Source). These
        // CANNOT be custom_fields — Beehiiv reserves the names.
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        // Internal "where in our funnel did this subscriber come from" label.
        // Lands as Beehiiv's referring_site, separate from utm_source so paid
        // attribution is preserved.
        referring_site: beehiivReferringSite,
        automation_ids: automationId ? [automationId] : [],
        custom_fields: customFields,
      };

      const beehiivRes = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(beehiivPayload),
        }
      );

      if (!beehiivRes.ok) {
        const errText = await beehiivRes.text();
        console.error("Beehiiv enrollment failed:", beehiivRes.status, errText);
      } else {
        const beehiivData = await beehiivRes.json();
        const subscriberId = beehiivData?.data?.id;
        console.log(`✅ Beehiiv enrollment successful for ${meta.parent_email} | ID: ${subscriberId}`);

        // ── Add tags via dedicated subscription-tags endpoint ────────
        if (subscriberId) {
          try {
            const tagRes = await fetch(
              `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/tags`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ tags }),
              }
            );
            if (!tagRes.ok) {
              const tagErr = await tagRes.text();
              console.error("Beehiiv tags failed:", tagRes.status, tagErr);
            } else {
              console.log(`✅ Beehiiv tags applied: ${tags.join(", ")}`);
            }
          } catch (tagErr) {
            console.error(
              "Beehiiv tags error:",
              tagErr instanceof Error ? tagErr.message : tagErr
            );
          }

          // ── Tag removal on paid: not possible via Beehiiv public API ─
          // Earlier versions of this handler tried to DELETE the
          // form_started_camps and cart_abandoned_camps tags after a
          // successful purchase so paid customers wouldn't sit in
          // cart-abandonment automations. Beehiiv's public API has only
          // POST /v2/publications/:pubId/subscriptions/:subId/tags —
          // there is NO DELETE, NO PATCH, NO per-tag URL. Verified
          // against the live API on 2026-05-05: all four shape variants
          // (DELETE /tags with body, DELETE /tags/:name, DELETE /tags
          // with query string, PATCH /tags) returned 404. Beehiiv docs
          // landing page also lists exactly one Subscription Tags
          // endpoint (POST). PUT /subscriptions silently ignores `tags`
          // per CLAUDE.md learning log, so that path is also closed.
          //
          // Operational fix lives in Beehiiv, not in code:
          //   1. Build cart-abandonment automations that EXCLUDE
          //      subscribers with the camp-2026-purchased tag.
          //      Segmentation handles the "paid wins" semantics; the
          //      messy tag state on the profile is cosmetic.
          //   2. Optionally set up a dashboard-only Beehiiv automation:
          //      "When tag camp-2026-purchased added → Remove tags
          //      form_started_camps, cart_abandoned_camps" if Beehiiv's
          //      automation builder supports a Remove-tag action.
        }
      }
    } catch (err) {
      console.error(
        "Beehiiv enrollment error:",
        err instanceof Error ? err.message : err
      );
    }

    // ── Enroll in Klaviyo (profile + list + event) ─────────────────
    try {
      const klaviyoHeaders = {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        revision: "2025-07-15",
      };

      // Build custom properties — same data set as Beehiiv. The
      // shared base is constructed inline; per-product extras come
      // from the registry strategy (Phase 2) and are merged in.
      // `registration_summary` reuses the gamerSummaries array
      // computed in the pre-pass — same source of truth as Beehiiv.
      const klaviyoProperties: Record<string, string> = {
        program: productConfig.programName,
        gamer_name: allGamerNames.join(", "),
        gamer_count: meta.gamer_count || "1",
        registration_summary: gamerSummaries.join(" | ").slice(0, 500),
        amount_paid: `$${(paymentIntent.amount / 100).toFixed(2)}`,
        payment_intent_id: paymentIntent.id,
        order_id: orderId,
        timezone: meta.timezone || "",
        location: location,
        acquisition_source: acquisitionSource,
        acquisition_origin: origin,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        ...productConfig.buildKlaviyoProfileProperties(meta, ctx),
      };

      // 1. Create or update profile
      const profilePayload = {
        data: {
          type: "profile",
          attributes: {
            email: meta.parent_email,
            first_name: meta.parent_first_name || "",
            last_name: meta.parent_last_name || "",
            phone_number: meta.parent_phone || "",
            properties: klaviyoProperties,
          },
        },
      };

      // Klaviyo's import endpoint upserts (creates if new, merges if existing)
      const profileRes = await fetch(
        "https://a.klaviyo.com/api/profile-import",
        {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(profilePayload),
        }
      );

      if (!profileRes.ok) {
        const errText = await profileRes.text();
        console.error("Klaviyo profile upsert failed:", profileRes.status, errText);
      } else {
        const profileData = await profileRes.json();
        const profileId = profileData?.data?.id;
        console.log(`✅ Klaviyo profile upserted for ${meta.parent_email} | ID: ${profileId}`);

        // 2. Add profile to Purchasers list
        if (profileId) {
          const listRes = await fetch(
            `https://a.klaviyo.com/api/lists/${KLAVIYO_PURCHASERS_LIST_ID}/relationships/profiles`,
            {
              method: "POST",
              headers: klaviyoHeaders,
              body: JSON.stringify({
                data: [{ type: "profile", id: profileId }],
              }),
            }
          );
          if (!listRes.ok) {
            const listErr = await listRes.text();
            console.error("Klaviyo list add failed:", listRes.status, listErr);
          } else {
            console.log(`✅ Klaviyo: added to Purchasers list`);
          }
        }

        // 3. Track "Placed Order" event
        const eventPayload = {
          data: {
            type: "event",
            attributes: {
              metric: { data: { type: "metric", attributes: { name: "Placed Order" } } },
              profile: { data: { type: "profile", attributes: { email: meta.parent_email } } },
              properties: {
                product: klaviyoProperties.program,
                value: paymentIntent.amount / 100,
                currency: "USD",
                order_id: orderId,
                gamer_name: klaviyoProperties.gamer_name,
                gamer_count: parseInt(meta.gamer_count || "1", 10),
                // Per-product extras — sourced from registry strategy
                // (Phase 2). Camps / e100 outputs are byte-identical to
                // the pre-Phase-2 spread; teams now includes squad_link.
                ...productConfig.buildKlaviyoOrderProperties(meta, ctx),
              },
              value: paymentIntent.amount / 100,
              unique_id: paymentIntent.id,
              time: new Date().toISOString(),
            },
          },
        };

        const eventRes = await fetch("https://a.klaviyo.com/api/events", {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(eventPayload),
        });
        if (!eventRes.ok) {
          const eventErr = await eventRes.text();
          console.error("Klaviyo event failed:", eventRes.status, eventErr);
        } else {
          console.log(`✅ Klaviyo: "Placed Order" event tracked ($${(paymentIntent.amount / 100).toFixed(2)})`);
        }
      }
    } catch (err) {
      console.error(
        "Klaviyo enrollment error:",
        err instanceof Error ? err.message : err
      );
    }

    // ── Write to Google Sheets (one row per gamer) ──────────────────
    try {
      const familyId = `FAM-${paymentIntent.id.slice(0, 20)}`;
      const registrationTimestamp = Math.floor(Date.now() / 1000);
      const registrationDate = new Date().toISOString();
      const amountPerGamer = `$${(paymentIntent.amount / 100 / gamerCount).toFixed(2)}`;

      const rows = gamers.map((gd, i) => ({
        registration_id: `REG-${registrationTimestamp}-${i}`,
        family_id: familyId,
        product: product,
        parent_first_name: meta.parent_first_name || "",
        parent_last_name: meta.parent_last_name || "",
        parent_email: meta.parent_email || "",
        parent_phone: meta.parent_phone || "",
        gamer_name: `${gd.firstName || ""} ${gd.lastName || ""}`.trim(),
        gamer_tag: gd.gamerTag || "",
        // Per-product cohort fields (week/slot/week_dates) — sourced
        // from registry strategy (Phase 2). The `week` column is
        // overloaded: camps stores weekLabel, e100 stores cohort_label,
        // teams stores semester_label. See baseline §2E.
        ...productConfig.buildPurchaseRowCohortFields(gd, meta),
        birthday: gd.birthday || "",
        gender: gd.gender || "",
        gaming_experience: gd.skillLevel || "",
        tshirt_size: gd.tshirtSize || "",
        time_preference: gd.timePreference || "",
        first_semester: gd.firstSemester || "",
        preferred_games: gd.preferredGames || "",
        timezone: meta.timezone || "",
        location: location,
        amount_paid: amountPerGamer,
        stripe_pi_id: paymentIntent.id,
        registration_date: registrationDate,
        additional_info: additionalInfo,
        // squad_status is camps-only; ctx.squadStatusLabel is "" for
        // e100/teams (see WebhookContext jsdoc), so this is product-
        // agnostic now.
        squad_status: ctx.squadStatusLabel,
        // squad_token + joining_squad_token are stamped onto EVERY
        // gamer row in the registration (not just the owner row) so a
        // single-tab FILTER on ekuzo-purchases by token surfaces the
        // whole crew. Gated by registry's squad.writesSquadRows flag —
        // teams flips true in Phase 2; tokens themselves arrive in
        // Phase 3 (so today's teams rows still get "" naturally).
        squad_token: productConfig.squad.writesSquadRows
          ? (meta.squad_token || "")
          : "",
        joining_squad_token: productConfig.squad.writesSquadRows
          ? (meta.joining_squad_token || "")
          : "",
        // Family-level day-availability signal (e100 only). Apps
        // Script appends by header name — the `preferred_days` header
        // cell in the ekuzo-purchases tab captures this. The string
        // lands in meta only for e100; for camps/teams the empty-meta
        // value yields "" naturally — no per-product gating needed.
        preferred_days: meta.preferred_days || "",
        // Marketing attribution — derived once at the top of this handler
        // so every row in a multi-gamer registration carries the same
        // source. Apps Script appends by header name (see
        // docs/apps-script-squad-endpoints-spec.md), so adding columns
        // here just requires adding matching header cells in the sheet.
        acquisition_source: acquisitionSource,
        // First-touch acquisition origin (ai_chatgpt, organic_google,
        // direct, …). Apps Script appends by header name; adding the
        // matching `origin` header cell in the sheet is a manual step
        // Jamie handles — the field is sent regardless.
        origin: origin,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
      }));

      if (rows.length > 0) {
        const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (sheetsUrl) {
          const sheetsRes = await fetch(sheetsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows }),
          });

          if (!sheetsRes.ok) {
            const errText = await sheetsRes.text();
            console.error("Google Sheets write failed:", sheetsRes.status, errText);
          } else {
            console.log(`✅ Google Sheets: ${rows.length} row(s) written for ${meta.parent_email}`);
          }
        } else {
          console.warn("⚠️  GOOGLE_SHEETS_WEBHOOK_URL not set — skipping Sheets write");
        }
      }
    } catch (err) {
      console.error(
        "Google Sheets write error:",
        err instanceof Error ? err.message : err
      );
    }

    // ── Squad link — additional Sheets writes ──────────────────────
    // Gated by the registry's `squad.writesSquadRows` flag (Phase 2).
    // Camps + e100 have always written these rows; teams flips true
    // here so its squad token (Phase 3) and joining token (Phase 5)
    // land in the same `squads` / `squad_members` tables. The
    // `meta.squad_token` / `meta.joining_squad_token` guards below
    // keep teams a no-op until Phase 3 starts minting — no premature
    // empty rows.
    //
    // All cohort + owner field selection delegates to per-product
    // registry strategies (`buildSquadsRowFields`,
    // `buildSquadMemberRowFields`). The `product` column tells Apps
    // Script which fields are load-bearing; the squad lookup endpoint
    // (`?action=squad`) reads `product` and returns the right shape
    // to the joining register page.
    //
    // See docs/apps-script-squad-endpoints-spec.md for the Apps Script
    // side. Adding `"teams"` as a valid product discriminator may need
    // an Apps Script web-app redeploy — coordinated with Jamie per
    // handoff §6.
    if (productConfig.squad.writesSquadRows) {
      const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      const createdAt = new Date().toISOString();

      // 1. `squads` — one row per registration that minted a squad_token.
      if (meta.squad_token && sheetsUrl) {
        try {
          const fields = productConfig.buildSquadsRowFields(gamers, meta);
          const squadRow = {
            squad_token: meta.squad_token,
            product,
            owner_parent_email: meta.parent_email || "",
            owner_gamer_name: fields.ownerGamerName,
            week: fields.week,
            slot: fields.slot,
            week_dates: fields.week_dates,
            cohort_month: fields.cohort_month,
            cohort_label: fields.cohort_label,
            cohort_start: fields.cohort_start,
            cohort_end: fields.cohort_end,
            created_at: createdAt,
          };

          const squadRes = await fetch(sheetsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tab: "squads", rows: [squadRow] }),
          });
          if (!squadRes.ok) {
            const errText = await squadRes.text();
            console.error("Sheets squads write failed:", squadRes.status, errText);
          } else {
            console.log(`✅ Sheets squads: ${product} row written (${meta.squad_token})`);
          }
        } catch (err) {
          console.error(
            "Sheets squads write error:",
            err instanceof Error ? err.message : err
          );
        }
      }

      // 2. `squad_members` — one row per gamer when a family registers
      //    via someone else's crew link.
      if (meta.joining_squad_token && sheetsUrl) {
        try {
          const memberRows = gamers.map((gd) => {
            const memberFields = productConfig.buildSquadMemberRowFields(gd, meta);
            return {
              squad_token: meta.joining_squad_token,
              product,
              member_parent_email: meta.parent_email || "",
              member_gamer_name: gd.firstName || "",
              member_week: memberFields.member_week,
              member_slot: memberFields.member_slot,
              member_cohort_month: memberFields.member_cohort_month,
              member_cohort_label: memberFields.member_cohort_label,
              joined_at: createdAt,
            };
          });

          if (memberRows.length > 0) {
            const memberRes = await fetch(sheetsUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tab: "squad_members", rows: memberRows }),
            });
            if (!memberRes.ok) {
              const errText = await memberRes.text();
              console.error("Sheets squad_members write failed:", memberRes.status, errText);
            } else {
              console.log(`✅ Sheets squad_members: ${memberRows.length} ${product} row(s) written (${meta.joining_squad_token})`);
            }
          }
        } catch (err) {
          console.error(
            "Sheets squad_members write error:",
            err instanceof Error ? err.message : err
          );
        }
      }
    }

    // ── Meta Conversions API: server-side Purchase event ───────────
    // Mirrors the client-side fbq("track","Purchase") on the success
    // page. Deduplicated by event_id (= Stripe PaymentIntent ID) which
    // both fires share. Without this, iOS ATT / Safari ITP / adblockers
    // strip ~30-50% of the client-side signal Meta uses for ad
    // optimization.
    //
    // test_event_code is derived from paymentIntent.livemode: production
    // (livemode: true) never gets tagged; non-prod payments auto-route to
    // Meta's Test Events tab so dev/preview purchases don't pollute the
    // real ad event stream. META_CAPI_TEST_EVENT_CODE is an optional
    // override for using a named test code instead of "TEST_AUTO".
    const capiToken = process.env.META_CAPI_ACCESS_TOKEN;
    const capiPixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (capiToken && capiPixelId) {
      try {
        const sha256 = (v: string) =>
          createHash("sha256").update(v).digest("hex");
        const phoneDigits = (meta.parent_phone || "").replace(/\D/g, "");
        // Program slug for Meta CAPI event_source_url — sourced from
        // the registry (Phase 2). Same values as the pre-Phase-2
        // ternary; just a different source.
        const programSlug = productConfig.routes.programSlug;

        // Match-quality additions (Meta projects ~50% lift from
        // ip + ua + zip combined):
        // - client_ip_address: raw, Meta hashes server-side. Captured by
        //   the register route from x-forwarded-for and threaded via
        //   PI metadata (the webhook itself is server-to-server, so its
        //   request.headers belong to Stripe, not the user).
        // - client_user_agent: raw, Meta hashes server-side. Same path.
        // - zp: ZIP/postal_code, must be SHA-256 lowercased. Sourced from
        //   Stripe billing_details (collected by Stripe Elements at
        //   payment time, so not available pre-payment in PI metadata).
        const userData: Record<string, string | string[]> = {};
        if (meta.parent_email)
          userData.em = [sha256(meta.parent_email.toLowerCase().trim())];
        if (phoneDigits) userData.ph = [sha256(phoneDigits)];
        if (meta.parent_first_name)
          userData.fn = [sha256(meta.parent_first_name.toLowerCase().trim())];
        if (meta.parent_last_name)
          userData.ln = [sha256(meta.parent_last_name.toLowerCase().trim())];
        if (postalCode)
          userData.zp = [sha256(postalCode.toLowerCase().trim())];
        // ip + ua are scalar strings in the Meta CAPI spec, not arrays.
        if (meta.client_ip_address)
          userData.client_ip_address = meta.client_ip_address;
        if (meta.client_user_agent)
          userData.client_user_agent = meta.client_user_agent;
        // fbc / fbp — Meta Pixel cookies captured at register time and
        // threaded through PI metadata. Plaintext, NOT hashed, scalar
        // strings (Meta hashes nothing here — these are direct identity
        // links into the profile graph). Highest-leverage match-quality
        // signal after em. Omitted when the visitor never loaded the
        // Pixel (older/test payments simply won't carry these keys).
        if (meta.fbc) userData.fbc = meta.fbc;
        if (meta.fbp) userData.fbp = meta.fbp;

        const capiPayload: {
          data: unknown[];
          test_event_code?: string;
        } = {
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: paymentIntent.id,
              action_source: "website",
              event_source_url: `https://ekuzo.gg/programs/${programSlug}/success`,
              user_data: userData,
              custom_data: {
                currency: "USD",
                value: paymentIntent.amount / 100,
              },
            },
          ],
        };
        if (!paymentIntent.livemode) {
          capiPayload.test_event_code =
            process.env.META_CAPI_TEST_EVENT_CODE || "TEST_AUTO";
        }

        const capiRes = await fetch(
          `https://graph.facebook.com/v19.0/${capiPixelId}/events?access_token=${capiToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(capiPayload),
          }
        );

        if (!capiRes.ok) {
          const errText = await capiRes.text();
          console.error("Meta CAPI Purchase failed:", capiRes.status, errText);
        } else {
          console.log(
            `✅ Meta CAPI: Purchase event sent (event_id=${paymentIntent.id}, value=$${(paymentIntent.amount / 100).toFixed(2)})`
          );
          console.log("Meta CAPI Purchase event sent for", paymentIntent.id);
        }
      } catch (err) {
        console.error(
          "Meta CAPI error:",
          err instanceof Error ? err.message : err
        );
      }
    } else {
      console.warn(
        "Meta CAPI token not configured; skipping server-side Purchase event (this is expected in local dev without the token)"
      );
    }

    // ── Teams installment: create Subscription for remaining 3 payments ──
    if (product === "teams" && meta.payment_plan === "installment") {
      try {
        const customerId = meta.stripe_customer_id;
        const installmentPriceId = process.env.STRIPE_PRICE_TEAMS_INSTALLMENTS;

        if (!customerId) {
          console.error("Teams installment: no stripe_customer_id in metadata");
        } else if (!installmentPriceId) {
          console.error("Teams installment: STRIPE_PRICE_TEAMS_INSTALLMENTS env var not set");
        } else {
          // Get the saved payment method from the customer
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: "card",
          });
          const pmId = paymentMethods.data[0]?.id;

          if (!pmId) {
            console.error("Teams installment: no saved payment method found for customer", customerId);
          } else {
            // Oct 1 2026 = first auto-charge, cancel Jan 1 2027 (after 3 charges)
            const oct1 = Math.floor(new Date("2026-10-01T00:00:00Z").getTime() / 1000);
            const jan1 = Math.floor(new Date("2027-01-01T00:00:00Z").getTime() / 1000);

            const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: installmentPriceId }],
              default_payment_method: pmId,
              trial_end: oct1,
              cancel_at: jan1,
              metadata: {
                product: "teams",
                initial_payment_intent: paymentIntent.id,
                parent_email: meta.parent_email || "",
                gamer_count: meta.gamer_count || "1",
              },
            });

            console.log(`✅ Teams installment subscription created: ${subscription.id}`);
            console.log(`   Trial until Oct 1 2026, then 3 × $160/mo, cancel Jan 1 2027`);
          }
        }
      } catch (err) {
        console.error(
          "Teams installment subscription error:",
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
