import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

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
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
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

    console.log(`✅ Payment succeeded: ${paymentIntent.id} [${product}]`);
    console.log("   Parent:", meta.parent_first_name, meta.parent_last_name);
    console.log("   Email:", meta.parent_email);
    console.log("   Gamers:", meta.gamer_count);

    // ── Extract billing location from Stripe ─────────────────────
    let location = "";
    try {
      const charges = await stripe.charges.list({ payment_intent: paymentIntent.id, limit: 1 });
      const billing = charges.data[0]?.billing_details?.address;
      if (billing) {
        location = [billing.city, billing.state, billing.country]
          .filter(Boolean)
          .join(", ");
      }
    } catch (err) {
      console.warn("Could not fetch billing location:", err);
    }

    // ── Parse gamer data ─────────────────────────────────────────
    const gamerCount = parseInt(meta.gamer_count || "0", 10);
    const gamers: any[] = [];
    for (let i = 0; i < gamerCount; i++) {
      try {
        gamers.push(JSON.parse(meta[`gamer_${i}`] || "{}"));
      } catch {
        gamers.push({});
      }
    }

    // ── Reassemble additional_info from chunked metadata ─────────
    let additionalInfo = meta.additional_info || "";
    if (meta.additional_info_2) additionalInfo += meta.additional_info_2;
    if (meta.additional_info_3) additionalInfo += meta.additional_info_3;

    // ── Enroll in Beehiiv ─────────────────────────────────────────
    try {
      // Build gamer summaries and multi-gamer fields
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
        { name: "amount_paid", value: `$${(paymentIntent.amount / 100).toFixed(2)}` },
        { name: "timezone", value: meta.timezone || "" },
        { name: "location", value: location },
      ];

      if (product === "camps") {
        customFields.push(
          { name: "camp_week", value: earliestWeek === Infinity ? "" : String(earliestWeek) },
          { name: "camp_slot", value: earliestSlot }
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
          } catch (tagErr: any) {
            console.error("Beehiiv tags error:", tagErr.message);
          }
        }
      }
    } catch (err: any) {
      console.error("Beehiiv enrollment error:", err.message);
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
    } catch (err: any) {
      console.error("Google Sheets write error:", err.message);
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
      } catch (err: any) {
        console.error("Teams installment subscription error:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
