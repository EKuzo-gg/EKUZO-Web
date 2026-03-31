import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. On `payment_intent.succeeded`:
 * 1. Extracts registration metadata from the Payment Intent
 * 2. Adds the parent as a Beehiiv subscriber with custom fields
 *    (gamer names, weeks, slots, program type)
 * 3. Beehiiv handles all post-registration email automation
 *    (welcome sequence, camp prep, week-of reminders, etc.)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // ── Verify webhook signature ──────────────────────────────────────
  // In development without a webhook secret, skip verification
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
    // Dev mode — parse without verification
    console.warn("⚠️  Stripe webhook secret not set — skipping signature verification");
    event = JSON.parse(body) as Stripe.Event;
  }

  // ── Handle payment_intent.succeeded ───────────────────────────────
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const meta = paymentIntent.metadata;

    console.log("✅ Payment succeeded:", paymentIntent.id);
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

    // ── Enroll in Beehiiv ─────────────────────────────────────────
    try {
      const gamerCount = parseInt(meta.gamer_count || "0", 10);
      const gamerSummaries: string[] = [];

      for (let i = 0; i < gamerCount; i++) {
        try {
          const gamerData = JSON.parse(meta[`gamer_${i}`] || "{}");
          gamerSummaries.push(
            `${gamerData.firstName} ${gamerData.lastName} — ${gamerData.weekLabel} ${gamerData.slot} (${gamerData.weekDates})`
          );
        } catch {
          // Skip malformed gamer data
        }
      }

      // ── Build multi-gamer aware Beehiiv fields ────────────────────
      // Beehiiv has ONE subscriber per email (the parent).
      // For multi-gamer: comma-separate names, store earliest week
      // for automation timing. Full detail in registration_summary.
      const allGamerNames: string[] = [];
      let earliestWeek = Infinity;
      let earliestSlot = "";

      for (let i = 0; i < gamerCount; i++) {
        try {
          const gamerData = JSON.parse(meta[`gamer_${i}`] || "{}");
          if (gamerData.firstName) allGamerNames.push(gamerData.firstName);
          const weekNum = parseInt(gamerData.weekLabel?.replace(/\D/g, "") || "99", 10);
          if (weekNum < earliestWeek) {
            earliestWeek = weekNum;
            earliestSlot = gamerData.slot || "";
          }
        } catch {
          // Skip malformed gamer data
        }
      }

      const beehiivPayload = {
        email: meta.parent_email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "ekuzo-camps-registration",
        automation_ids: ["aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc"],
        custom_fields: [
          { name: "first_name", value: meta.parent_first_name },
          { name: "last_name", value: meta.parent_last_name },
          { name: "phone", value: meta.parent_phone || "" },
          { name: "program", value: "EKUZO Camps" },
          { name: "gamer_name", value: allGamerNames.join(", ") },
          { name: "camp_week", value: earliestWeek === Infinity ? "" : String(earliestWeek) },
          { name: "camp_slot", value: earliestSlot },
          { name: "gamer_count", value: meta.gamer_count },
          { name: "registration_summary", value: gamerSummaries.join(" | ").slice(0, 500) },
          { name: "payment_intent_id", value: paymentIntent.id },
          { name: "amount_paid", value: `$${(paymentIntent.amount / 100).toFixed(2)}` },
          { name: "timezone", value: meta.timezone || "" },
          { name: "location", value: location },
        ],
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
        // Don't return error — payment already succeeded, we just log the failure
        // Can retry manually from Stripe dashboard metadata
      } else {
        const beehiivData = await beehiivRes.json();
        const subscriberId = beehiivData?.data?.id;
        console.log("✅ Beehiiv enrollment successful for", meta.parent_email, "| ID:", subscriberId);

        // ── Add tags via dedicated subscription-tags endpoint ────────
        // POST /v2/publications/:pubId/subscriptions/:subId/tags
        // with body { "tags": ["tag1", "tag2"] }
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
                body: JSON.stringify({
                  tags: ["camp-2026-purchased", "source-camp-registration"],
                }),
              }
            );
            if (!tagRes.ok) {
              const tagErr = await tagRes.text();
              console.error("Beehiiv tags failed:", tagRes.status, tagErr);
            } else {
              console.log("✅ Beehiiv tags applied: camp-2026-purchased, source-camp-registration");
            }
          } catch (tagErr: any) {
            console.error("Beehiiv tags error:", tagErr.message);
          }
        }
      }
    } catch (err: any) {
      console.error("Beehiiv enrollment error:", err.message);
      // Same — don't fail the webhook, payment is already captured
    }

    // ── Write to Google Sheets (one row per gamer) ──────────────────
    try {
      const gamerCount = parseInt(meta.gamer_count || "0", 10);
      const familyId = `FAM-${paymentIntent.id.slice(0, 20)}`;
      const registrationTimestamp = Math.floor(Date.now() / 1000);
      const registrationDate = new Date().toISOString();
      const amountPerGamer = `$${(paymentIntent.amount / 100 / gamerCount).toFixed(2)}`;

      // Reassemble additional_info from chunked metadata keys
      let additionalInfo = meta.additional_info || "";
      if (meta.additional_info_2) additionalInfo += meta.additional_info_2;
      if (meta.additional_info_3) additionalInfo += meta.additional_info_3;

      const rows = [];
      for (let i = 0; i < gamerCount; i++) {
        try {
          const gamerData = JSON.parse(meta[`gamer_${i}`] || "{}");
          rows.push({
            registration_id: `REG-${registrationTimestamp}-${i}`,
            family_id: familyId,
            parent_first_name: meta.parent_first_name || "",
            parent_last_name: meta.parent_last_name || "",
            parent_email: meta.parent_email || "",
            parent_phone: meta.parent_phone || "",
            gamer_name: `${gamerData.firstName || ""} ${gamerData.lastName || ""}`.trim(),
            gamer_tag: gamerData.gamerTag || "",
            week: gamerData.weekLabel || "",
            slot: gamerData.slot || "",
            week_dates: gamerData.weekDates || "",
            birthday: gamerData.birthday || "",
            skill_level: gamerData.skillLevel || "",
            tshirt_size: gamerData.tshirtSize || "",
            preferred_games: gamerData.preferredGames || "",
            timezone: meta.timezone || "",
            location: location,
            amount_paid: amountPerGamer,
            stripe_pi_id: paymentIntent.id,
            registration_date: registrationDate,
            additional_info: additionalInfo,
          });
        } catch {
          console.warn(`Could not parse gamer_${i} for Google Sheets`);
        }
      }

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
      // Don't fail the webhook — payment and Beehiiv are more critical
    }
  }

  return NextResponse.json({ received: true });
}
