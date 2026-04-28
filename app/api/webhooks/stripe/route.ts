import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createHash } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY!;
const KLAVIYO_PURCHASERS_LIST_ID = "V4Uf7N";

/**
 * Shape of each gamer after reconstruction from Stripe metadata. This is
 * distinct from the camps register-form shape (see `ClientGamer` in
 * /api/camps/register/route.ts): by the time we're reading it here, the
 * form data has been JSON-stringified through Stripe metadata and parsed
 * back, so numeric fields may have lost precision and the field names
 * reflect the post-transform shape (`slot` not `selectedSlot`,
 * `preferredGames` as a joined string not an array, etc.). All fields
 * optional because a malformed metadata value would parse to `{}`.
 */
type MetadataGamer = {
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

    // ── Extract billing location + receipt number from Stripe charge ─
    // We fetch the charge once and reuse it. receipt_number is Stripe's
    // customer-facing order ID (format: 1234-5678) — cleaner than the
    // pi_... identifier for customer-facing emails.
    let location = "";
    let receiptNumber = "";
    try {
      const charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
      const charge = charges.data[0];
      const billing = charge?.billing_details?.address;
      if (billing) {
        location = [billing.city, billing.state, billing.country]
          .filter(Boolean)
          .join(", ");
      }
      receiptNumber = charge?.receipt_number || "";
    } catch (err) {
      console.warn("Could not fetch charge data:", err);
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

    // Squad link (camps + Building only). Looking purchases don't get a
    // squad_token and this stays empty for them — Klaviyo/Beehiiv fields
    // are blank, no `squads` sheet write happens.
    const squadLink = meta.squad_token
      ? `https://ekuzo.gg/programs/ekuzo-camps/register?squad=${meta.squad_token}`
      : "";

    // ── Shared gamer summaries (used by Beehiiv + Klaviyo) ───────
    const allGamerNames: string[] = [];
    const gamerSummaries: string[] = [];
    let earliestWeek = Infinity;
    let earliestSlot = "";

    for (const gd of gamers) {
        if (gd.firstName) allGamerNames.push(gd.firstName);

        if (product === "camps") {
          // Camps: track week/slot for automation timing
          gamerSummaries.push(
            `${gd.firstName} ${gd.lastName} — ${gd.weekLabel} ${gd.slot} (${gd.weekDates})`
          );
          const weekNum = parseInt(gd.weekLabel?.replace(/\D/g, "") || "99", 10);
          if (weekNum < earliestWeek) {
            earliestWeek = weekNum;
            earliestSlot = gd.slot || "";
          }
        } else if (product === "ekuzo100") {
          // EKUZO100: cohort month + schedule preference
          gamerSummaries.push(
            `${gd.firstName} ${gd.lastName} — ${meta.cohort_label || ""}  ${gd.schedulePreference || ""}`
          );
        } else if (product === "teams") {
          // Teams: semester + payment plan
          gamerSummaries.push(
            `${gd.firstName} ${gd.lastName} — ${meta.semester_label || "Fall 2026"}`
          );
        }
      }

    // ── Enroll in Beehiiv ──────────────────────────────────────────
    try {
      // Product-specific Beehiiv fields
      const programName =
        product === "ekuzo100" ? "EKUZO100"
        : product === "teams" ? "EKUZOTeams"
        : "EKUZO Camps";
      const utmSource =
        product === "ekuzo100" ? "ekuzo100-registration"
        : product === "teams" ? "ekuzo-teams-registration"
        : "ekuzo-camps-registration";

      // Tags per product
      const tags =
        product === "ekuzo100"
          ? ["ekuzo100-purchased", "source-ekuzo100-registration"]
        : product === "teams"
          ? ["teams-purchased", "source-teams-registration"]
        : ["camp-2026-purchased", "source-camp-registration"];

      // Build custom fields — shared base + product-specific
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
      ];

      if (product === "camps") {
        customFields.push(
          { name: "camp_week", value: earliestWeek === Infinity ? "" : String(earliestWeek) },
          { name: "camp_slot", value: earliestSlot },
          { name: "squad_status", value: squadStatusLabel },
          { name: "squad_link", value: squadLink }
        );
      } else if (product === "teams") {
        customFields.push(
          { name: "team_semester", value: meta.semester_label || "Fall 2026" },
          { name: "team_payment_plan", value: meta.payment_plan || "upfront" }
        );
      }

      // Product-specific welcome automation
      const automationId =
        product === "teams"   ? "aut_fea2b01b-eccd-40c7-9d53-2b370c039ddb"
        : product === "ekuzo100" ? "aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556"
        : "aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"; // camps (default)

      const beehiivPayload = {
        email: meta.parent_email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: utmSource,
        automation_ids: [automationId],
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

      // Earliest camp week dates for pre-camp sequencing
      let earliestWeekDates = "";
      if (product === "camps") {
        let minWeek = Infinity;
        for (const gd of gamers) {
          const weekNum = parseInt(gd.weekLabel?.replace(/\D/g, "") || "99", 10);
          if (weekNum < minWeek) {
            minWeek = weekNum;
            earliestWeekDates = gd.weekDates || "";
          }
        }
      }

      // Build custom properties — same data set as Beehiiv
      const klaviyoProperties: Record<string, string> = {
        program: product === "ekuzo100" ? "EKUZO100"
          : product === "teams" ? "EKUZOTeams"
          : "EKUZO Camps",
        gamer_name: gamers.map((g) => g.firstName).filter(Boolean).join(", "),
        gamer_count: meta.gamer_count || "1",
        registration_summary: gamers.map((gd) => {
          if (product === "camps") {
            return `${gd.firstName} ${gd.lastName} — ${gd.weekLabel} ${gd.slot} (${gd.weekDates})`;
          } else if (product === "ekuzo100") {
            return `${gd.firstName} ${gd.lastName} — ${meta.cohort_label || ""} ${gd.schedulePreference || ""}`;
          } else {
            return `${gd.firstName} ${gd.lastName} — ${meta.semester_label || "Fall 2026"}`;
          }
        }).join(" | ").slice(0, 500),
        amount_paid: `$${(paymentIntent.amount / 100).toFixed(2)}`,
        payment_intent_id: paymentIntent.id,
        order_id: orderId,
        timezone: meta.timezone || "",
        location: location,
      };

      // Product-specific properties
      if (product === "camps") {
        klaviyoProperties.camp_week = earliestWeek === Infinity ? "" : String(earliestWeek);
        klaviyoProperties.camp_slot = earliestSlot;
        klaviyoProperties.camp_week_dates = earliestWeekDates;
        klaviyoProperties.squad_status = squadStatusLabel;
        klaviyoProperties.squad_link = squadLink;
      } else if (product === "ekuzo100") {
        klaviyoProperties.cohort_label = meta.cohort_label || "";
        klaviyoProperties.cohort_start = meta.cohort_start || "";
        klaviyoProperties.cohort_end = meta.cohort_end || "";
      } else if (product === "teams") {
        klaviyoProperties.team_semester = meta.semester_label || "Fall 2026";
        klaviyoProperties.team_payment_plan = meta.payment_plan || "upfront";
      }

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
                ...(product === "camps" && {
                  camp_week: klaviyoProperties.camp_week,
                  camp_slot: klaviyoProperties.camp_slot,
                  camp_week_dates: earliestWeekDates,
                  squad_status: squadStatusLabel,
                  squad_link: squadLink,
                }),
                ...(product === "ekuzo100" && {
                  cohort_label: meta.cohort_label || "",
                }),
                ...(product === "teams" && {
                  team_semester: meta.semester_label || "Fall 2026",
                  team_payment_plan: meta.payment_plan || "upfront",
                }),
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
        week: product === "camps" ? (gd.weekLabel || "")
          : product === "teams" ? (meta.semester_label || "Fall 2026")
          : (meta.cohort_label || ""),
        slot: product === "camps" ? (gd.slot || "")
          : product === "teams" ? (meta.payment_plan || "")
          : (gd.schedulePreference || ""),
        week_dates: product === "camps" ? (gd.weekDates || "")
          : product === "teams" ? "Week of Aug 31, 2026"
          : `${meta.cohort_start || ""} – ${meta.cohort_end || ""}`,
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
        // Camps-only fields; "" for ekuzo100/teams. The sheet has
        // canonical headers for all three — see the 28-column list in
        // docs/apps-script-squad-endpoints-spec.md. squad_token +
        // joining_squad_token are stamped onto EVERY gamer row in the
        // registration (not just the owner row) so a single-tab FILTER
        // on ekuzo-purchases by token surfaces the whole crew.
        squad_status: product === "camps" ? squadStatusLabel : "",
        squad_token: product === "camps" ? (meta.squad_token || "") : "",
        joining_squad_token:
          product === "camps" ? (meta.joining_squad_token || "") : "",
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

    // ── Squad link — additional Sheets writes (camps only) ─────────
    // These go through the same Apps Script webhook with a `tab` field so
    // it knows which sheet to append to. See
    // docs/apps-script-squad-endpoints-spec.md for the Apps Script side.
    if (product === "camps") {
      const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      const createdAt = new Date().toISOString();

      // 1. `squads` — one row per Building registration. Owner is the
      //    earliest-week gamer (matches the Beehiiv/Klaviyo logic).
      if (meta.squad_token && sheetsUrl) {
        try {
          let ownerGamerName = "";
          let ownerWeekLabel = "";
          let ownerSlot = "";
          let ownerWeekDates = "";
          let minWeek = Infinity;
          for (const gd of gamers) {
            const weekNum = parseInt(gd.weekLabel?.replace(/\D/g, "") || "99", 10);
            if (weekNum < minWeek) {
              minWeek = weekNum;
              ownerGamerName = gd.firstName || "";
              ownerWeekLabel = gd.weekLabel || "";
              ownerSlot = gd.slot || "";
              ownerWeekDates = gd.weekDates || "";
            }
          }

          const squadRow = {
            squad_token: meta.squad_token,
            owner_parent_email: meta.parent_email || "",
            owner_gamer_name: ownerGamerName,
            week: ownerWeekLabel,
            slot: ownerSlot,
            week_dates: ownerWeekDates,
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
            console.log(`✅ Sheets squads: row written (${meta.squad_token})`);
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
          const memberRows = gamers.map((gd) => ({
            squad_token: meta.joining_squad_token,
            member_parent_email: meta.parent_email || "",
            member_gamer_name: gd.firstName || "",
            member_week: gd.weekLabel || "",
            member_slot: gd.slot || "",
            joined_at: createdAt,
          }));

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
              console.log(`✅ Sheets squad_members: ${memberRows.length} row(s) written (${meta.joining_squad_token})`);
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
    const capiToken = process.env.META_CAPI_ACCESS_TOKEN;
    const capiPixelId = process.env.META_PIXEL_ID;
    if (capiToken && capiPixelId) {
      try {
        const sha256 = (v: string) =>
          createHash("sha256").update(v).digest("hex");
        const phoneDigits = (meta.parent_phone || "").replace(/\D/g, "");
        const programSlug =
          product === "ekuzo100" ? "ekuzo100"
          : product === "teams" ? "ekuzo-teams"
          : "ekuzo-camps";

        const userData: Record<string, string[]> = {};
        if (meta.parent_email)
          userData.em = [sha256(meta.parent_email.toLowerCase().trim())];
        if (phoneDigits) userData.ph = [sha256(phoneDigits)];
        if (meta.parent_first_name)
          userData.fn = [sha256(meta.parent_first_name.toLowerCase().trim())];
        if (meta.parent_last_name)
          userData.ln = [sha256(meta.parent_last_name.toLowerCase().trim())];

        const capiTestEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
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
        if (capiTestEventCode) {
          capiPayload.test_event_code = capiTestEventCode;
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
