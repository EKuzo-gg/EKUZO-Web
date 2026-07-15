import { NextRequest, NextResponse } from "next/server";
import {
  isWeekEligible,
  buildWeeksLabel,
  buildWeekDatesSpan,
  formatTueFull,
  formatThuFull,
} from "@/lib/ekuzo101-weeks";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY!;
const KLAVIYO_PURCHASERS_LIST_ID = process.env.KLAVIYO_PURCHASERS_LIST_ID!;
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;

const KLAVIYO_REVISION = "2025-07-15";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ClientGamer = {
  firstName: string;
  lastName: string;
  gamerTag?: string;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  preferredGames?: string[];
};

/**
 * Validate that a string is a Tuesday ISO date (YYYY-MM-DD).
 */
function isValidTuesday(iso: string): boolean {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  if (!match) return false;
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCDay() === 2; // 2 = Tuesday
}

/**
 * POST /api/ekuzo101/register
 *
 * Free-pilot registration endpoint. No Stripe, no payment. Validates the
 * selected weeks, then fires best-effort fulfillment to Beehiiv, Klaviyo,
 * and Sheets in parallel. Always returns 200 if the registration data is
 * valid — individual step failures are logged but never propagated to the
 * client.
 *
 * Tripwire: rejects any request that carries `totalPrice` in the body —
 * this prevents a misrouted payment-path request from being silently
 * processed as a free registration.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const {
    gamers,
    weeks,
    parentFirstName,
    parentLastName,
    parentEmail,
    parentPhone,
    timezone,
    ctaSource,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    acquisitionSource,
    origin,
  } = body;

  // ── Tripwire ──────────────────────────────────────────────────────────
  if (body.totalPrice !== undefined) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  // ── Validation ────────────────────────────────────────────────────────
  if (!gamers?.length) {
    return NextResponse.json(
      { error: "At least one gamer is required." },
      { status: 400 }
    );
  }

  if (!weeks?.length || weeks.length < 4 || weeks.length > 6) {
    return NextResponse.json(
      { error: "Please select between 4 and 6 weeks." },
      { status: 400 }
    );
  }

  for (const w of weeks as string[]) {
    if (!isValidTuesday(w)) {
      return NextResponse.json(
        { error: `Invalid week date: ${w}. Expected a Tuesday in YYYY-MM-DD format.` },
        { status: 400 }
      );
    }
  }

  const now = new Date();
  for (const w of weeks as string[]) {
    if (!isWeekEligible(w, now)) {
      return NextResponse.json(
        { error: `Week ${w} is no longer available for registration.` },
        { status: 400 }
      );
    }
  }

  if (new Set(weeks).size !== weeks.length) {
    return NextResponse.json(
      { error: "Duplicate weeks are not allowed." },
      { status: 400 }
    );
  }

  if (!parentEmail || !EMAIL_RE.test(parentEmail)) {
    return NextResponse.json(
      { error: "A valid parent email is required." },
      { status: 400 }
    );
  }

  // ── Step 0: Compute shared values ────────────────────────────────────
  const registrationId = crypto.randomUUID();
  const registrationTimestamp = Math.floor(Date.now() / 1000);
  const registrationDate = new Date().toISOString();
  const allGamerNames = (gamers as ClientGamer[])
    .map((g) => `${g.firstName} ${g.lastName}`)
    .join(", ");

  const weeksLabel = buildWeeksLabel(weeks as string[]);
  const weekDatesSpan = buildWeekDatesSpan(weeks as string[]);
  const weekDetails = (weeks as string[]).map((iso) => {
    // Thursday is Tuesday + 2 days
    const [y, m, d] = iso.split("-").map(Number);
    const thuDate = new Date(Date.UTC(y, m - 1, d + 2));
    const thuISO = `${thuDate.getUTCFullYear()}-${String(thuDate.getUTCMonth() + 1).padStart(2, "0")}-${String(thuDate.getUTCDate()).padStart(2, "0")}`;
    return {
      tueFull: formatTueFull(iso),
      thuFull: formatThuFull(thuISO),
    };
  });

  // ── Step 1: Beehiiv ───────────────────────────────────────────────────
  try {
    const beehiivPayload = {
      email: parentEmail,
      reactivate_existing: true,
      send_welcome_email: false,
      referring_site: "ekuzo101-pilot-registration",
      // No automation_ids — Klaviyo owns product email for 101
      custom_fields: [
        { name: "first_name", value: parentFirstName || "" },
        { name: "last_name", value: parentLastName || "" },
        { name: "phone", value: parentPhone || "" },
        { name: "program", value: "EKUZO101" },
        { name: "gamer_name", value: allGamerNames },
        { name: "gamer_count", value: String((gamers as ClientGamer[]).length) },
        { name: "weeks_label", value: weeksLabel },
        { name: "timezone", value: timezone || "" },
      ],
    };

    console.log("Beehiiv ekuzo101 subscribe payload:", JSON.stringify(beehiivPayload, null, 2));

    const subRes = await fetch(
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

    if (!subRes.ok) {
      const errText = await subRes.text();
      console.error("Beehiiv ekuzo101 register subscribe failed:", subRes.status, errText);
    } else {
      const subData = await subRes.json();
      const subscriberId = subData?.data?.id;
      console.log(`Beehiiv ekuzo101 subscribe OK | ID: ${subscriberId}`);

      // 1b. Tag — separate POST (Beehiiv ignores `tags` on subscribe)
      if (subscriberId) {
        try {
          const tags = ["ekuzo101-pilot-registered", "source-ekuzo101-pilot"];
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
            console.error("Beehiiv ekuzo101 tag failed:", tagRes.status, tagErr);
          } else {
            console.log(`Beehiiv ekuzo101 tags applied: ${tags.join(", ")}`);
          }
        } catch (tagErr) {
          console.error(
            "Beehiiv ekuzo101 tag error:",
            tagErr instanceof Error ? tagErr.message : tagErr
          );
        }
      }
    }
  } catch (err) {
    console.error(
      "Beehiiv ekuzo101 register error:",
      err instanceof Error ? err.message : err
    );
  }

  // ── Step 2: Klaviyo ───────────────────────────────────────────────────
  try {
    const klaviyoHeaders = {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      revision: KLAVIYO_REVISION,
    };

    const klaviyoProperties = {
      program: "EKUZO101",
      gamer_name: allGamerNames,
      gamer_count: String((gamers as ClientGamer[]).length),
      weeks_label: weeksLabel,
      weeks_count: (weeks as string[]).length,
    };

    // 2a. Profile import
    const profilePayload = {
      data: {
        type: "profile",
        attributes: {
          email: parentEmail,
          first_name: parentFirstName || "",
          last_name: parentLastName || "",
          phone_number: parentPhone || "",
          properties: klaviyoProperties,
        },
      },
    };

    const profileRes = await fetch("https://a.klaviyo.com/api/profile-import", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify(profilePayload),
    });

    let klaviyoProfileId: string | null = null;
    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("Klaviyo ekuzo101 profile-import failed:", profileRes.status, errText);
    } else {
      const profileData = await profileRes.json();
      klaviyoProfileId = profileData?.data?.id || null;
      console.log(`Klaviyo ekuzo101 profile imported | ID: ${klaviyoProfileId}`);
    }

    // 2b. Add to purchasers list
    if (klaviyoProfileId && KLAVIYO_PURCHASERS_LIST_ID) {
      try {
        const listRes = await fetch(
          `https://a.klaviyo.com/api/lists/${KLAVIYO_PURCHASERS_LIST_ID}/relationships/profiles`,
          {
            method: "POST",
            headers: klaviyoHeaders,
            body: JSON.stringify({
              data: [{ type: "profile", id: klaviyoProfileId }],
            }),
          }
        );
        if (!listRes.ok && listRes.status !== 204) {
          const errText = await listRes.text();
          console.error("Klaviyo ekuzo101 list-add failed:", listRes.status, errText);
        } else {
          console.log(`Klaviyo ekuzo101 profile added to list ${KLAVIYO_PURCHASERS_LIST_ID}`);
        }
      } catch (listErr) {
        console.error(
          "Klaviyo ekuzo101 list-add error:",
          listErr instanceof Error ? listErr.message : listErr
        );
      }
    }

    // 2c. Track "Registered Pilot" event
    const eventProperties = {
      product: "EKUZO101",
      weeks_label: weeksLabel,
      weeks_count: (weeks as string[]).length,
      gamer_name: allGamerNames,
      gamer_count: (gamers as ClientGamer[]).length,
    };

    const eventPayload = {
      data: {
        type: "event",
        attributes: {
          metric: {
            data: { type: "metric", attributes: { name: "Registered Pilot" } },
          },
          profile: {
            data: {
              type: "profile",
              attributes: { email: parentEmail },
            },
          },
          properties: eventProperties,
          time: registrationDate,
        },
      },
    };

    const eventRes = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: klaviyoHeaders,
      body: JSON.stringify(eventPayload),
    });

    if (!eventRes.ok) {
      const errText = await eventRes.text();
      console.error("Klaviyo ekuzo101 event failed:", eventRes.status, errText);
    } else {
      console.log(`Klaviyo ekuzo101 "Registered Pilot" event tracked for ${parentEmail}`);
    }
  } catch (err) {
    console.error(
      "Klaviyo ekuzo101 register error:",
      err instanceof Error ? err.message : err
    );
  }

  // ── Step 3: Google Sheets ─────────────────────────────────────────────
  try {
    const rows = (gamers as ClientGamer[]).map((g, i) => ({
      registration_id: `REG-${registrationTimestamp}-${i}`,
      family_id: `FAM-${registrationId.slice(0, 20)}`,
      product: "ekuzo101",
      parent_first_name: parentFirstName || "",
      parent_last_name: parentLastName || "",
      parent_email: parentEmail,
      parent_phone: parentPhone || "",
      gamer_name: `${g.firstName} ${g.lastName}`.trim(),
      gamer_tag: g.gamerTag || "",
      week: weeksLabel,
      slot: "",
      week_dates: weekDatesSpan,
      birthday: g.birthday || "",
      gender: g.gender || "",
      gaming_experience: g.skillLevel || "",
      tshirt_size: g.tshirtSize || "",
      time_preference: "",
      first_semester: "",
      preferred_games: (g.preferredGames || []).join(", "),
      timezone: timezone || "",
      location: "",
      amount_paid: "$0.00",
      stripe_pi_id: "",
      registration_date: registrationDate,
      additional_info: `reg_id:${registrationId}`,
      squad_status: "",
      squad_token: "",
      joining_squad_token: "",
      preferred_days: "",
      acquisition_source: acquisitionSource || "",
      origin: origin || "",
      utm_source: utmSource || "",
      utm_medium: utmMedium || "",
      utm_campaign: utmCampaign || "",
      utm_content: utmContent || "",
      utm_term: utmTerm || "",
      cta_source: ctaSource || "",
    }));

    const sheetsRes = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    if (!sheetsRes.ok) {
      const errText = await sheetsRes.text();
      console.error("Sheets ekuzo101 write failed:", sheetsRes.status, errText);
    } else {
      console.log(`Sheets ekuzo101 wrote ${rows.length} row(s) for ${parentEmail}`);
    }
  } catch (err) {
    console.error(
      "Sheets ekuzo101 register error:",
      err instanceof Error ? err.message : err
    );
  }

  // ── Response ──────────────────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    parentName: `${parentFirstName} ${parentLastName}`,
    parentEmail,
    gamers: (gamers as ClientGamer[]).map((g) => ({
      name: `${g.firstName} ${g.lastName}`.trim(),
    })),
    weeksLabel,
    weekDetails,
    weeksCount: (weeks as string[]).length,
  });
}
